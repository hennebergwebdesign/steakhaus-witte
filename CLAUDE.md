# Restaurant & Steakhouse Haus Witte

Relaunch von steakhouse-hauswitte.de. Gebaut nach dem Plugin `webdesign-conversion`
(Regelwerk) und `agentur-website-builder` (Ablauf) aus `hennebergwebdesign/design-skill`.

Zwei Sätze für jede lange Sitzung: Frühere Antworten gelten als erledigt, außer es wird danach
gefragt. Bei langen Aufgaben wird die Checkliste am Ende jedes Schrittes geprüft.

## Kunde und Ziel

Restaurant & Steakhouse Haus Witte, Ückendorfer Straße 205, 45886 Gelsenkirchen, 0209 141378.
Steaks vom Holzkohlengrill aus Black Ranch Rindfleisch (Argentinien), Mittagstisch, seit 1999.

Seitentyp: Homepage (eine Seite mit Sprungmarken plus Pflichtseiten). Primäre Handlung: Tisch
reservieren (Anfrage per Formular) oder anrufen. Sekundär: Speisekarte ansehen.

Wünsche des Auftraggebers: Speisekarte als Flipbook, Reservierung, Speisen, Google-Bewertungen,
Social Media nur als Verlinkung (keine Einbettung), die vier besten Bilder.

Markenbrief: `docs/marke-brief.md`, Werte: `docs/marke.json`, Bilder: `docs/BILDER.md`.

Bilder des Kunden: der Upload liegt in `bilder-kunde/` (Originalnamen), die verwendeten mit
sprechendem Namen in `src/assets/bilder/`. Fotos mit erkennbaren Personen werden nicht
verwendet, solange keine Einwilligung vorliegt (Liste in `docs/BILDER.md`).

## Stack und Befehle

Astro 7 (statisch) mit `@astrojs/cloudflare` 14, Node 24 LTS, pnpm. GSAP ist installiert,
wird nur für die Speisekarte gebraucht, wenn CSS nicht reicht.

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # Ausgabe in dist/client (statisch) und dist/server (Serverrouten)
pnpm check        # astro check
```

Die Prüfskripte liegen im Plugin-Repository `design-skill`, nicht hier. Aufruf aus diesem
Ordner: `node ../Design-Skill/scripts/pruefe-<name>.mjs`.

## Deployment und Bindings

**Cloudflare Workers mit statischen Assets, nicht Pages.** Grund: `@astrojs/cloudflare` ab
Version 13 baut nur noch für Workers. Konfiguration in `wrangler.jsonc`. Deploy:
`pnpm build && npx wrangler deploy`. Node-Version in Cloudflare über `NODE_VERSION=24`.

| Binding | Zweck | Fehlt es |
|---|---|---|
| `REVIEWS_CACHE` (KV) | Cache der Google-Bewertungen, 24 h | jeder Aufruf fragt Google, Kontingent |
| `RATE_LIMIT` (KV) | höchstens 5 Reservierungen je IP in 10 min | kein Rate Limit |
| `SESSION` (KV) | legt der Adapter automatisch an, wird nicht genutzt | nichts |

Die KV-Namespaces stehen ohne ID in `wrangler.jsonc`, Wrangler legt sie beim ersten Deploy an.
Keine IDs erfinden.

## Formulare und Datenfluss

Reservierung: `POST /api/reservierung` (Serverroute, `prerender = false`). Reihenfolge:
Konfiguration, Origin, Honigtopf `webadresse`, Zeitfeld, Turnstile, Prüfung, Rate Limit, zwei
Mails über Resend (intern an `MAIL_TO`, Bestätigung an den Gast). **Keine Speicherung**, kein
Leadsystem beauftragt. Die Anfrage ist keine feste Buchung; das steht im Formular und in der
Mail. Ohne JavaScript leitet die Route auf `/reservierung-gesendet` weiter (mit `?fehler=`).
Mittwoch lehnt die Prüfung ab, mit Hinweis auf Feiertage und Telefon. Mehr als 12 Personen:
telefonisch. Allergien werden bewusst nicht abgefragt (Gesundheitsdaten).

Astro 7 prüft Cross-Site-POSTs selbst (`Cross-site POST form submissions are forbidden`), die
eigene Origin-Prüfung bleibt zusätzlich.

Bewertungen: `GET /api/bewertungen` holt Google Places serverseitig, Cache 24 h in KV, letzter
Stand als Rückfall. Ohne Schlüssel oder Place ID antwortet sie 503, die Seite zeigt dann nur
Links zum Profil. Keine Zahl im Code, kein JSON-LD mit Bewertung (die Seite ist statisch).

Getestet am 22.10.2026 in der Worker-Vorschau (`astro preview`): fehlende Variablen (503 mit
Telefon), fremde Herkunft (403), Honigtopf (200 ohne Versand), Weiterleitung ohne JavaScript
(303). Nicht getestet: echter Versand über Resend und echte Turnstile-Prüfung (Netz der
Arbeitsumgebung gesperrt). Gefunden und behoben: ein nicht erreichbares Turnstile führte zu
einem 500er, jetzt eine Meldung mit Telefon.

Lokal testen: `.dev.vars` mit den Variablen anlegen (nie einchecken) und für `astro preview`
nach `dist/server/.dev.vars` kopieren.

## Umgebungsvariablen

| Name | Zweck | Fehlt sie |
|---|---|---|
| `PUBLIC_SITE_URL` | Domain für canonical, OG, Sitemap | Rückfall `https://steakhouse-hauswitte.de` |
| `RESEND_API_KEY` (Secret) | Mailversand | Formular meldet „nicht möglich" mit Telefon |
| `MAIL_TO` | Empfänger im Restaurant | wie oben |
| `MAIL_FROM` | verifizierter Absender bei Resend | wie oben |
| `TURNSTILE_SECRET_KEY` (Secret) | Spamschutz serverseitig | in Produktion wird jede Anfrage abgewiesen |
| `PUBLIC_TURNSTILE_SITE_KEY` | Widget, wird erst beim ersten Fokus ins Formular geladen | kein Widget, Server weist ab |
| `GOOGLE_PLACES_API_KEY` (Secret) | Bewertungsabruf | nur Links zum Profil |
| `PUBLIC_GOOGLE_PLACE_ID` | Place ID von Haus Witte, auch für „Bewertung schreiben" | nur Links zum Profil |

## Consent und eingesetzte Dienste

Kein Consent Banner und kein Link „Cookie Einstellungen": die Seite nutzt nur notwendige
Technik (Cloudflare, selbst gehostete Schriften, Turnstile erst bei Benutzung des Formulars,
Bewertungen über die eigene Route). Google Maps, Facebook und Instagram sind nur verlinkt.
Kommt ein einwilligungspflichtiger Dienst dazu, kommen Banner und Footerlink aus den
Skill-Vorlagen mit.

## Seitenstruktur

Eine Startseite mit Sprungmarken (`#speisen`, `#speisekarte`, `#haus`, `#bewertungen`,
`#reservierung`, `#anfahrt`), dazu `/impressum`, `/datenschutz` (beide Entwurf, noindex, nicht
in der Sitemap), `/reservierung-gesendet` (Ergebnis ohne JavaScript, serverseitig, noindex),
`404`. `robots.txt` wird zur Bauzeit erzeugt (`src/pages/robots.txt.ts`), Sitemap über
`@astrojs/sitemap`. JSON-LD `Restaurant` in `src/components/JsonLd.astro`, Öffnungszeiten erst
nach Bestätigung. Open-Graph-Bild `public/og-haus-witte.jpg` (Fassade bei Nacht mit Wortmarke).
Security-Header in `public/_headers`, CSP vorerst nur Report-Only.

SEO der Startseite: Titel „Steakhouse Haus Witte Gelsenkirchen: Steaks vom Holzkohlengrill",
Beschreibung mit Black Ranch, Mittagstisch, Adresse und Aufforderung.

## Designsystem

Tokens in `src/styles/tokens.css`, abgeleitet aus `docs/marke.json`. Globale Basis in
`src/styles/global.css`.

* Farben: Ochsenblut `#660000` (Hausfarbe der Bestandsseite), Akzent Rot `#a61f1a`,
  Holzkohle `#1c1a19`, Naturstein `#ebe7e1`, Papier `#fffdf8` für die Speisekarte. Kontraste
  in `docs/marke.json` unter `farbe.geprueft`.
* Glutverlauf `--verlauf-glut`: die eigene visuelle Eigenschaft, nur auf dunklen Flächen.
* Schriften: Zilla Slab 600/700 (Display, greift die Holzlettern des Logos auf), Source Sans 3
  400/600 (Text). Selbst gehostet in `public/fonts/`, OFL.
* Form: Knöpfe und Felder 4 px, Karten und Bilder 6 px, Speisekarte kantig.
* Thema hell; Holzkohle ist feste Rolle für Held, Speisekarte und Fuß.

## Komponenten

| Datei | Inhalt |
|---|---|
| `src/layouts/Basis.astro` | Kopfbereich, Meta, Open Graph, Kopf, Fuß |
| `src/components/Kopf.astro` | Kopfleiste, Menü als `<dialog>`, Mobilbalken unter 861 px |
| `src/components/Fuss.astro` | Kontakt, Öffnungszeiten, Social Links, Pflichtlinks |
| `src/components/Icon.astro` | eigenes Icon-Set, Linie 2 px |
| `src/data/betrieb.ts` | Name, Adresse, Telefon, Öffnungszeiten, Social: einzige Quelle für NAP |
| `src/components/sektionen/Held.astro` | Held, Vollbild der Fassade bei Nacht, Text unten links |
| `src/components/sektionen/BewertungsLeiste.astro` | Leiste unter dem Held, Google-Schnitt live oder Link |
| `src/components/sektionen/Speisen.astro` | Steak groß (Text links, Foto rechts), Mittagstisch mit Salatbar, Desserts |
| `src/components/sektionen/Qualitaet.astro` | gelieferter Text zu Black Ranch, drei Merkmale |
| `src/components/sektionen/Haus.astro` | die vier Bilder: Bar breit, darunter Bögen, Weinwand, Stier |
| `src/components/sektionen/Bewertungen.astro` | Google-Bewertungen über `/api/bewertungen`, ohne Daten nur Links |
| `src/components/sektionen/Reservierung.astro` | Reservierungsanfrage, Öffnungszeiten, Telefon |
| `src/components/sektionen/Anfahrt.astro` | Adresse, Route (Link), Social Media nur verlinkt |
| `src/lib/reservierung-pruefung.ts` | eine Prüfregel für Browser und Server (Datum, Ruhetag, Personen) |
| `src/lib/mail-template.ts` | interne Mail und Bestätigung an den Gast |
| `src/components/sektionen/Speisekarte.astro` | Speisekarte als Buch (eigener Abschnitt, Signaturbewegung), Daten aus `src/data/speisekarte.ts` |

### Speisekarte als Buch

Eigenbau ohne Bibliothek. Gründe: ohne JavaScript bleiben alle Seiten als Papierbögen lesbar,
der Text ist echtes HTML (Suche, Vorleser), Tastatur, Wischen und reduzierte Bewegung sind
abgedeckt, verdeckte Seiten sind `inert`. Ab 1100 px Doppelseite mit 3D-Umblättern um den
Bund, darunter eine Seite, die beim Wechsel umschlägt. Je zwei Seiten aus `seiten` bilden ein
Blatt; die Klasse `seite--hinten` ist die Rückseite eines Blatts, `seite--art-rueck` die
Rückseite des Buchs (nicht verwechseln, das war ein Fehler im ersten Wurf).

Pflege: Gerichte und Preise nur in `src/data/speisekarte.ts`. Preis `null` erscheint als
`[[FEHLT: Preis]]`. Eine neue Seite ist ein neuer Eintrag im Array; bei ungerader Seitenzahl
bleibt die letzte Rückseite leer. Sprung aus anderen Sektionen: `data-karte-seite="<id>"`.

## Stand

Phase 1 bis 6 abgeschlossen. Weitere Phasen folgen, siehe Änderungsverlauf.

## Offene Punkte

Siehe `docs/marke-brief.md`, Abschnitt 10. Wichtigste: Originalfotos, Logo als Vektor,
vollständige Speisekarte, Öffnungszeiten bestätigen, Social-Media-Adressen, Place ID, Impressum.

## Änderungsverlauf

- **22.10.2026** Phase 1: Analyse aus fünf Screenshots der Bestandsseite (die Seite selbst, Google
  und Facebook waren aus der Arbeitsumgebung gesperrt). Markenbrief, `marke.json` mit Lesart,
  Reglern und Farbrollen (Kontraste gerechnet), Bildinventar. Bilder aus Screenshots
  ausgeschnitten, nur als Zwischenstand.
- **22.10.2026** Phase 2: Astro 7 mit Cloudflare Adapter von Hand angelegt (die Vorlage von
  GitHub war nicht ladbar), Node 24 LTS, Tokens, globale Basis, selbst gehostete Schriften,
  Icon-Set, Kopf mit Mobilmenü und Mobilbalken, Fuß, Basislayout. Die Quellskills aus Phase 0
  sind nicht installiert: ohne Zustimmung des Nutzers installiert kein Agent fremde Skills
  (`arbeitsdisziplin.md`, 9a).
- **22.10.2026** Phase 3: Held, Speisen, Qualität, Haus. Das Steakfoto der alten Seite trägt den
  eingebrannten Schriftzug „THE BEST SINCE 1999“; verwendet wird nur der rechte Ausschnitt ohne
  Schrift (460 px). Deshalb Text links und Bild rechts im Held und die Steakkarte als Glutfläche
  ohne Foto. Eigene Kurve `--text-held`, damit die Überschrift ab 1100 px zweizeilig bleibt.
- **22.10.2026** Phase 4: Speisekarte als Buch mit Deckblatt, Mittagskarte (sechs Gerichte mit
  Preisen aus dem Screenshot), Steaks und Beilagen (fehlen, als FEHLT markiert), Desserts (neun
  Gerichte, Preise fehlen), Rückseite mit Ruhetag. Kapitelleiste, Sprünge aus den Speisen.
- **22.10.2026** Phase 5: Reservierung (Route, Mails, vier Zustände, ohne JavaScript nutzbar),
  Google-Bewertungen (Route mit KV-Cache, Leiste unter dem Held, Sektion), Anfahrt und Social
  Media nur als Links. Auf Wunsch des Nutzers die hochgeladenen Fotos eingebaut: Held jetzt
  Vollbild der Fassade bei Nacht, Steak auf dem heißen Stein, Salatbar, vier neue Bilder fürs
  Haus, Wortmarke auf Speisekarte und Fuß. Die Ausschnitte aus Screenshots sind entfernt,
  bis auf Logo und Dessertfoto. Upload nach `bilder-kunde/` verschoben.
- **22.10.2026** Phase 6: Impressum und Datenschutz als markierte Entwürfe (nur laufende Dienste,
  kein Banner-Abschnitt), 404, robots.txt mit KI-Suchcrawlern, Sitemap ohne Pflicht- und
  Ergebnisseiten, JSON-LD Restaurant, Open-Graph-Bild, Security-Header.
