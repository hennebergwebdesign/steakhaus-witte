/**
 * Speisekarte als Daten. Die Seiten erscheinen in dieser Reihenfolge im Buch.
 * Quelle: Screenshots der Bestandsseite vom 22.10.2026 (Mittagskarte und Desserts).
 * Was fehlt, steht als null oder fehlt-Text und erscheint als [[FEHLT: …]] auf der Seite.
 *
 * Pflege: Preise als Zahl in Euro. Die Mittagskarte wechselt monatlich, dann nur
 * `mittagskarte.stand` und die Einträge tauschen.
 */

export type Eintrag = {
  nr?: string;
  name: string;
  text?: string;
  preis: number | null;
};

export type Seite =
  | { id: string; art: 'deckel' }
  | { id: string; art: 'rueck' }
  | {
      id: string;
      art: 'karte';
      kapitel: string;
      titel: string;
      hinweis?: string;
      stand?: string | null;
      eintraege?: Eintrag[];
      fehlt?: string;
    };

export const seiten: Seite[] = [
  { id: 'deckel', art: 'deckel' },
  {
    id: 'mittagskarte',
    art: 'karte',
    kapitel: 'Mittagskarte',
    titel: 'Mittagskarte',
    hinweis:
      'Zu unseren Mittagsgerichten servieren wir eine Tagessuppe und Sie dürfen sich an unserer reichhaltigen Salat-Bar bedienen.',
    stand: null, // Monat der aktuellen Karte, z. B. 'Oktober 2026'
    eintraege: [
      { nr: '721', name: 'Ruhrpottschnitzel', text: 'belegt mit geschmorten Zwiebeln, Champignons, Sauce Béarnaise und mit Käse überbacken, dazu Pommes frites und ein Salat vom Salatbuffet', preis: 17.9 },
      { nr: '722', name: 'Hacksteak GRECO', text: 'Hacksteak gefüllt mit griechischem Käse, dazu Pommes frites und ein Salat vom Salatbuffet', preis: 16.9 },
      { nr: '723', name: 'Frische Nudeln', text: 'in Hummersauce mit Cherrytomaten, dazu Lachspralinen', preis: 17.9 },
      { nr: '724', name: 'Schweinemedaillon FRANKREICH', text: 'in Calvadossauce, mit Blumenkohl und Rösti', preis: 18.9 },
      { nr: '725', name: 'Steak LA DINDE', text: 'Putensteak mit Spinat und Käse überbacken, dazu Kartoffeln und ein Salat vom Salatbuffet', preis: 16.9 },
      { nr: '726', name: 'Bergmannsteller', text: 'Schweinerückensteak vom Grill mit Gartengemüse und Kartoffeln mit Sauce Hollandaise im Ofen gratiniert, dazu ein Salat vom Salatbuffet', preis: 16.9 },
    ],
  },
  {
    id: 'steaks',
    art: 'karte',
    kapitel: 'Steaks',
    titel: 'Steaks vom Holzkohlengrill',
    hinweis: 'Rindfleisch ausschließlich von Black Ranch aus Argentinien.',
    fehlt: 'Steakkarte mit Zuschnitten, Gewichten und Preisen vom Kunden',
  },
  {
    id: 'beilagen',
    art: 'karte',
    kapitel: 'Beilagen',
    titel: 'Beilagen und Saucen',
    fehlt: 'Beilagen, Saucen und Salate mit Preisen vom Kunden',
  },
  {
    id: 'desserts',
    art: 'karte',
    kapitel: 'Desserts',
    titel: 'Desserts',
    eintraege: [
      { name: 'Gemischtes Eis', text: 'mit Sahne', preis: null },
      { name: 'Kaffee „Venezia Art“', text: 'Aromatischer Kaffee mit Vanilleeis und Sahne', preis: null },
      { name: 'Heiße Liebe', text: 'Vanilleeis mit heißen Kirschen und Sahne', preis: null },
      { name: 'Cup Dänemark', text: 'Vanilleeis mit heißer Schokolade und Sahne', preis: null },
      { name: 'Amarena Becher', text: 'Vanilleeis mit Amarena Kirschen in Sirup und Sahne', preis: null },
      { name: 'Schoko Souffle', text: 'Leckeres Souffle mit Schokoladensauce, eine Kugel Vanilleeis und Sahne', preis: null },
      { name: 'Apfelstrudel', text: 'warm serviert, mit einer Kugel Vanilleeis, Bourbon-Vanille-Sauce und Sahne', preis: null },
      { name: 'Palatschinken Kirsche', text: 'mit heißen Kirschen, Vanilleeis und Sahne', preis: null },
      { name: 'Palatschinken Schoko', text: 'mit Schokoladen Sauce, Vanilleeis und Sahne', preis: null },
    ],
  },
  { id: 'rueck', art: 'rueck' },
];

export const preis = (wert: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(wert);

/** Kapitel für die Sprungleiste über dem Buch */
export const kapitel = seiten
  .map((s, index) => ({ s, index }))
  .filter((x): x is { s: Extract<Seite, { art: 'karte' }>; index: number } => x.s.art === 'karte')
  .map(({ s, index }) => ({ id: s.id, name: s.kapitel, index }));
