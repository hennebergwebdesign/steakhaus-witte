/**
 * Lädt die Bewertungen einmal je Seitenaufruf von der eigenen Route. Bewertungsleiste und
 * Bewertungssektion teilen sich denselben Abruf. Kein Kontakt zu Google aus dem Browser.
 */
export type Bewertung = { autor: string; sterne: number; text: string; relativ: string };
export type Ergebnis = { schnitt: number; anzahl: number; profil: string; bewertungen: Bewertung[]; stand: string };

let anfrage: Promise<Ergebnis | null> | null = null;

export function laden(): Promise<Ergebnis | null> {
  anfrage ??= fetch('/api/bewertungen', { headers: { accept: 'application/json' } })
    .then((r) => (r.ok && r.status !== 204 ? (r.json() as Promise<Ergebnis>) : null))
    .then((d) => (d && d.anzahl > 0 ? d : null))
    .catch(() => null);
  return anfrage;
}

export const zahl = (wert: number, stellen = 1) =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: stellen, maximumFractionDigits: stellen }).format(wert);

export const datum = (iso: string) =>
  new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
