/**
 * Stammdaten von Haus Witte. Eine Quelle fuer Kopf, Fuss, Reservierung, JSON-LD und Impressum,
 * damit Name, Adresse und Telefon ueberall wortgleich sind (NAP, 46-lokale-sichtbarkeit.md).
 *
 * Was nicht vom Kunden bestaetigt ist, traegt bestaetigt: false und wird auf der Seite als
 * Copy-Vorschlag markiert.
 */

export const betrieb = {
  name: 'Restaurant & Steakhouse Haus Witte',
  kurzname: 'Haus Witte',
  strasse: 'Ückendorfer Straße 205',
  plz: '45886',
  ort: 'Gelsenkirchen',
  telefon: '0209 141378',
  telefonLink: 'tel:+49209141378',
  telefonIntl: '+49 209 141378',
  seit: 1999,
  // Google-Profil: Kurzlink vom Kunden. Die Place ID fuer den Bewertungsabruf steht in PUBLIC_GOOGLE_PLACE_ID.
  googleProfil: 'https://share.google/KOduHOILCgCd89ugi',
  routenplaner:
    'https://www.google.com/maps/dir/?api=1&destination=' +
    encodeURIComponent('Haus Witte, Ückendorfer Straße 205, 45886 Gelsenkirchen'),
} as const;

export type Oeffnungszeit = { tage: string; zeiten: string; schema?: { tage: string[]; von: string; bis: string }[] };

/**
 * Oeffnungszeiten aus oeffentlichen Verzeichnissen, NICHT vom Kunden bestaetigt.
 * Solange bestaetigt false ist, markiert die Seite sie als Copy-Vorschlag und das JSON-LD laesst
 * sie weg, damit Google keine ungepruefte Angabe uebernimmt.
 */
export const oeffnungszeiten = {
  bestaetigt: false,
  quelle: 'Verzeichniseintraege (Stand 22.10.2026), vom Kunden zu bestaetigen',
  zeilen: [
    {
      tage: 'Montag, Dienstag',
      zeiten: '11:30–15:00 und 17:30–23:00 Uhr',
      schema: [
        { tage: ['Monday', 'Tuesday'], von: '11:30', bis: '15:00' },
        { tage: ['Monday', 'Tuesday'], von: '17:30', bis: '23:00' },
      ],
    },
    { tage: 'Mittwoch', zeiten: 'Ruhetag, außer an Feiertagen' },
    {
      tage: 'Donnerstag bis Samstag',
      zeiten: '11:30–15:00 und 17:30–23:00 Uhr',
      schema: [
        { tage: ['Thursday', 'Friday', 'Saturday'], von: '11:30', bis: '15:00' },
        { tage: ['Thursday', 'Friday', 'Saturday'], von: '17:30', bis: '23:00' },
      ],
    },
    {
      tage: 'Sonntag',
      zeiten: '11:30–23:00 Uhr',
      schema: [{ tage: ['Sunday'], von: '11:30', bis: '23:00' }],
    },
  ] as Oeffnungszeit[],
};

/** Ruhetag als Wochentag nach Date.getDay(): 3 = Mittwoch. Gilt nicht an Feiertagen. */
export const RUHETAG = 3;

/**
 * Social Media: nur Verlinkung, keine Einbettung. Damit entsteht keine Verbindung zu Facebook
 * oder Instagram, bevor jemand klickt, und es braucht kein Consent Banner.
 * Adressen fehlen noch: url null blendet den Eintrag als FEHLT-Hinweis ein.
 */
export const social: { id: 'facebook' | 'instagram' | 'google'; name: string; url: string | null; text: string }[] = [
  { id: 'facebook', name: 'Facebook', url: null, text: 'Neuigkeiten, Feiertage und Aktionen' },
  { id: 'instagram', name: 'Instagram', url: null, text: 'Bilder vom Grill und aus dem Haus' },
  { id: 'google', name: 'Google', url: betrieb.googleProfil, text: 'Bewertungen lesen und schreiben' },
];
