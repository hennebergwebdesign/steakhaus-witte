/**
 * Mailtemplates im Branding von Haus Witte, nach assets/forms/mail-template.ts des Skills.
 * Tabellenlayout und Inlinestile sind Absicht: Mailprogramme können kein modernes CSS.
 * Die Farbwerte hier sind die einzige erlaubte Ausnahme von "kein Wert ohne Token" (bewusst):
 * Mailprogramme lesen keine CSS-Variablen. Sie entsprechen den Rollen in marke.json.
 */
import { betrieb } from '../data/betrieb';

const MARKE = {
  name: betrieb.name,
  farbe: '#660000', // bewusst: rot-800, Hausfarbe
  logoPfad: '/mail-logo.png',
  telefon: betrieb.telefon,
  antwortzeit: 'so schnell wie möglich, in der Regel am selben Tag während unserer Öffnungszeiten',
};

export const maskieren = (wert = '') =>
  wert.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function rahmen(inhalt: string, seite: string) {
  const logo = new URL(MARKE.logoPfad, seite).href;
  return `<!doctype html><html lang="de"><body style="margin:0;padding:0;background:#ebe7e1;font-family:Arial,Helvetica,sans-serif;color:#211d1c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ebe7e1;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fffdf8;border-radius:6px;overflow:hidden;">
        <tr><td style="background:#ffffff;padding:16px 24px;border-bottom:4px solid ${MARKE.farbe};">
          <img src="${logo}" alt="${maskieren(MARKE.name)}" height="64" style="height:64px;display:block;border:0;" />
        </td></tr>
        <tr><td style="padding:24px;font-size:15px;line-height:1.6;">${inhalt}</td></tr>
        <tr><td style="padding:16px 24px;background:${MARKE.farbe};font-size:12px;color:#f8ecea;">
          ${maskieren(MARKE.name)} &middot; ${maskieren(betrieb.strasse)}, ${betrieb.plz} ${maskieren(betrieb.ort)} &middot; ${maskieren(MARKE.telefon)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export type Reservierung = {
  name: string;
  email: string;
  telefon: string;
  datum: string; // ISO-Datum, Jahr-Monat-Tag
  uhrzeit: string; // HH:MM
  personen: number;
  nachricht?: string;
};

export const datumLesbar = (iso: string) =>
  new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`)
  );

export function interneMail(r: Reservierung & { zeit: string }, seite: string) {
  const zeile = (titel: string, wert?: string) =>
    wert ? `<tr><td style="padding:6px 0;color:#5f5753;width:130px;vertical-align:top;">${titel}</td><td style="padding:6px 0;">${maskieren(wert)}</td></tr>` : '';
  return rahmen(`
    <h1 style="font-size:20px;margin:0 0 16px;">Neue Reservierungsanfrage</h1>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:15px;">
      ${zeile('Datum', datumLesbar(r.datum))}
      ${zeile('Uhrzeit', `${r.uhrzeit} Uhr`)}
      ${zeile('Personen', String(r.personen))}
      ${zeile('Name', r.name)}
      ${zeile('Telefon', r.telefon)}
      ${zeile('E-Mail', r.email)}
      ${zeile('Eingegangen', r.zeit)}
    </table>
    ${r.nachricht ? `<p style="margin:16px 0 4px;color:#5f5753;font-size:13px;">Nachricht</p>
    <div style="white-space:pre-wrap;border-left:3px solid ${MARKE.farbe};padding-left:12px;">${maskieren(r.nachricht)}</div>` : ''}
    <p style="margin:20px 0 0;font-size:13px;color:#5f5753;">Bitte bestätigen Sie die Reservierung beim Gast. Antworten geht direkt an den Gast.</p>
  `, seite);
}

export function bestaetigungsMail(r: Reservierung, seite: string) {
  return rahmen(`
    <h1 style="font-size:20px;margin:0 0 16px;">Ihre Reservierungsanfrage ist angekommen</h1>
    <p style="margin:0 0 12px;">Guten Tag ${maskieren(r.name)},</p>
    <p style="margin:0 0 12px;">vielen Dank für Ihre Anfrage für <strong>${r.personen} ${r.personen === 1 ? 'Person' : 'Personen'}</strong> am <strong>${maskieren(datumLesbar(r.datum))} um ${maskieren(r.uhrzeit)} Uhr</strong>.</p>
    <p style="margin:0 0 12px;"><strong>Die Reservierung ist erst fest, wenn wir sie bestätigt haben.</strong> Wir melden uns ${maskieren(MARKE.antwortzeit)}.</p>
    <p style="margin:0 0 12px;">Wenn es eilig ist oder sich etwas ändert, erreichen Sie uns unter ${maskieren(MARKE.telefon)}.</p>
    <p style="margin:20px 0 0;">Herzliche Grüße<br />Ihr Team von ${maskieren(betrieb.kurzname)}</p>
  `, seite);
}
