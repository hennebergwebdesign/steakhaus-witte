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

Markenbrief: `docs/marke-brief.md`, Werte: `marke.json`, Bilder: `docs/BILDER.md`.

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
`pnpm run deploy` (baut und ruft `wrangler deploy`). Node-Version in Cloudflare über
`NODE_VERSION=24`; mit Node 22 unter 22.23.4 bricht Astro 7 den Build ab. Ein Projekt unter
„Pages“ zeigt nur eine leere Seite, weil die Startseite in `dist/client` liegt. Schritte für
das Dashboard stehen in `README.md`.

`wrangler.jsonc` zeigt mit `assets.directory` auf `./dist/client`, nie auf `./dist` (sonst
ginge der Worker-Code in `dist/server` als öffentliche Datei raus). Nach `pnpm build` nutzt
Wrangler ohnehin die erzeugte `dist/server/wrangler.json` (Umleitung über
`.wrangler/deploy/config.json`).

| Binding | Zweck | Fehlt es |
|---|---|---|
| `REVIEWS_CACHE` (KV) | Cache der Google-Bewertungen, 24 h | jeder Aufruf fragt Google, Kontingent |
| `RATE_LIMIT` (KV) | höchstens 5 Reservierungen je IP in 10 min | kein Rate Limit |
| `SESSION` (KV) | legt der Adapter automatisch an, wird nicht genutzt | nichts |

Die KV-Namespaces stehen ohne ID in `wrangler.jsonc`, Wrangler legt sie beim ersten Deploy an.
Keine IDs erfinden.

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

SEO der Startseite: Titel „Haus Witte Gelsenkirchen: Steaks vom Holzkohlengrill" (52 Zeichen),
Beschreibung mit Black Ranch, Mittagstisch, Adresse und Aufforderung.

## Designsystem

Tokens in `src/styles/tokens.css`, abgeleitet aus `marke.json`. Globale Basis in
`src/styles/global.css`.

* Farben: Ochsenblut `#660000` (Hausfarbe der Bestandsseite), Akzent Rot `#a61f1a`,
  Holzkohle `#1c1a19`, Naturstein `#ebe7e1`, Papier `#fffdf8` für die Speisekarte. Kontraste
  in `marke.json` unter `farbe.geprueft`.
* Glutverlauf `--verlauf-glut`: die eigene visuelle Eigenschaft, nur auf dunklen Flächen.
* Schriften: Zilla Slab 600/700 (Display, greift die Holzlettern des Logos auf), Source Sans 3
  400/600 (Text). Selbst gehostet in `public/fonts/`, OFL.
* Form: Knöpfe und Felder 4 px, Karten und Bilder 6 px, Speisekarte kantig.
* Thema hell; Holzkohle ist feste Rolle für Held, Speisekarte und Fuß.

## Änderungsregeln
- Nur die genannte Sektion ändern. Text, Farben, Abstände und andere Sektionen bleiben, außer der Auftrag nennt sie.
- Werte nur aus den Tokens. Keine neuen Farben, Schriften, Schatten ohne Auftrag.
- Entfernte Elemente: Raster und Abstände der Umgebung neu ausrichten, keine Lücke.
- Nichts verstecken, um ein Layout zu retten. Desktopgrafiken bekommen eine eigene Mobilfassung.
- Nach jeder Änderung: pruefe-breakpoints.mjs, Screenshots bei 1440, 768 und 375 px ansehen, Nachbarsektionen prüfen, kurz berichten.
- Mehrere Änderungen: nummeriert, am Ende je Nummer erledigt, teilweise oder offen melden.
- Formularfehler nie beim Verlassen eines Feldes einblenden oder ausblenden: das verschiebt das Formular unter dem Zeiger (im Test passiert, siehe Reservierung.astro).

## Textbeispiele

Noch keine freigegebenen Vorher-Nachher-Paare. Alle neu formulierten Texte tragen
`data-copy-vorschlag` (gestrichelter Rahmen) und warten auf die Freigabe des Kunden.

## Ausgelagerte Abschnitte

Formulare und Datenfluss sowie Komponenten (inklusive Speisekarte als Buch) stehen in docs/DETAILREFERENZ.md, lesen vor Änderungen an Formularen oder Komponenten.

Prüfstand, aktueller Stand und Offene Punkte stehen in docs/STAND.md, lesen bevor neue Arbeit geplant wird.

Die chronologische Historie steht in docs/AENDERUNGSVERLAUF.md, lesen bei Fragen dazu, warum etwas so gebaut wurde.
