/**
 * Prüfung einer Reservierungsanfrage. Dieselbe Funktion läuft im Browser (sofortige Rückmeldung)
 * und auf dem Server (verbindlich), damit beide Seiten dieselben Regeln haben.
 */
import { RUHETAG } from '../data/betrieb';

export const MAX_PERSONEN_ONLINE = 12; // größere Gruppen bitte telefonisch, Grund: Tischplanung
export const VORLAUF_TAGE_MAX = 180;

export type Felder = Partial<Record<'name' | 'email' | 'telefon' | 'datum' | 'uhrzeit' | 'personen' | 'datenschutz' | 'nachricht', string>>;

/** heutiges Datum in Gelsenkirchen als ISO-Datum (Jahr-Monat-Tag), unabhängig von der Zeitzone des Servers */
export function heuteBerlin(jetzt = new Date()): string {
  const teile = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(jetzt);
  return teile; // en-CA liefert das ISO-Format
}

const tageZwischen = (von: string, bis: string) =>
  Math.round((Date.parse(`${bis}T00:00:00Z`) - Date.parse(`${von}T00:00:00Z`)) / 86400000);

export function pruefen(d: Record<string, string | undefined>, jetzt = new Date()): Felder {
  const f: Felder = {};
  const name = (d.name ?? '').trim();
  const email = (d.email ?? '').trim();
  const telefon = (d.telefon ?? '').trim();
  const datum = (d.datum ?? '').trim();
  const uhrzeit = (d.uhrzeit ?? '').trim();
  const personen = Number(d.personen);

  if (name.length < 2 || name.length > 120) f.name = 'Bitte geben Sie Ihren Namen an.';
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email) || email.length > 180) f.email = 'Bitte prüfen Sie die E-Mail-Adresse.';
  if (!/^[0-9+()\/\s.-]{6,40}$/.test(telefon)) f.telefon = 'Bitte geben Sie eine Telefonnummer für Rückfragen an.';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum) || Number.isNaN(Date.parse(`${datum}T00:00:00Z`))) {
    f.datum = 'Bitte wählen Sie ein Datum.';
  } else {
    const abstand = tageZwischen(heuteBerlin(jetzt), datum);
    if (abstand < 0) f.datum = 'Dieses Datum liegt in der Vergangenheit.';
    else if (abstand > VORLAUF_TAGE_MAX) f.datum = 'So weit im Voraus nehmen wir online keine Reservierungen an. Bitte rufen Sie uns an.';
    else if (new Date(`${datum}T00:00:00Z`).getUTCDay() === RUHETAG)
      f.datum = 'Mittwochs ist Ruhetag. Fällt der Mittwoch auf einen Feiertag, haben wir geöffnet: dann bitte telefonisch reservieren.';
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(uhrzeit)) f.uhrzeit = 'Bitte wählen Sie eine Uhrzeit.';

  if (!Number.isInteger(personen) || personen < 1) f.personen = 'Bitte geben Sie die Zahl der Personen an.';
  else if (personen > MAX_PERSONEN_ONLINE) f.personen = `Für mehr als ${MAX_PERSONEN_ONLINE} Personen rufen Sie uns bitte an, dann planen wir den Tisch gemeinsam.`;

  if ((d.nachricht ?? '').length > 2000) f.nachricht = 'Bitte fassen Sie die Nachricht kürzer (höchstens 2000 Zeichen).';
  if (!d.datenschutz) f.datenschutz = 'Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.';
  return f;
}
