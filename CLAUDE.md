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
Stand als Rückfall. Ohne Schlüssel oder Place ID antwortet sie 204 (Grund im Header
`x-bewertungen`), die Seite zeigt dann still nur Links zum Profil. Keine Zahl im Code, kein JSON-LD mit Bewertung (die Seite ist statisch).

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

## Prüfstand (22.10.2026)

| Prüfung | Ergebnis |
|---|---|
| `pnpm build`, `astro check` | ohne Fehler, 0 Befunde |
| `pruefe-striche`, `-tokens`, `-geschmack`, `-motion`, `-aktualitaet`, `-seitenbasis` | kein Befund |
| `pruefe-geo dist/client` | kein Befund (Pfad angeben: der Adapter baut nach `dist/client`) |
| `pruefe-breakpoints` | alle acht Größen sauber |
| `pruefe-kontrast --paare kontrast-paare.json` | 1 Meldung, begründet: die Standardpaarung „Hausfarbe als Fokus auf Holzkohle" gilt hier nicht, der Fokus in dunklen Sektionen ist `rot-300` (6,7:1) |
| `pruefe-sicherheit` | 1 Warnung, begründet: `set:html` im Icon-Set gibt nur eigene Konstanten aus |
| `pruefe-scrollstrecke` (Desktop, mobil, reduziert) | keine Fehler; Warnungen erklärt: verdeckte Kartenseiten mobil sind gewollt, „Vorherige Seite" ist der deaktivierte Knopf |
| `pruefe-platzhalter --launch` | 34 offen: 15 FEHLT, 9 BESTÄTIGEN, 10 Copy-Vorschläge. Blockiert den Livegang, bis der Kunde liefert |
| `deslop-check` für alle eigenen Texte | 5 von 5 |
| `pnpm audit --prod` | keine bekannten Lücken |
| Browsertest (Playwright) | null Fremdanfragen beim Laden, Kontrast im Held an der hellsten Stelle gemessen 5,9:1 (1440) und 6,0:1 (390), Tastaturweg mit sichtbarem Fokus, Formular: Pflichtfehler, Mittwoch, Fehlerzustand mit Telefon, reduzierte Bewegung, ohne JavaScript alle sechs Kartenseiten lesbar |

Nicht geprüft: echter Mailversand über Resend, echte Turnstile-Prüfung, echter Bewertungsabruf
(Netz der Arbeitsumgebung gesperrt, keine Schlüssel), echtes Handy, Ladezeit unter Last im
Netz (nur lokal), Bildschirmleser von Hand. Kein Mensch hat die Seite abgenommen.

## Stand

Phase 1 bis 7 abgeschlossen: gebaut und geprüft, nicht abgenommen und nicht live.

Am 22.10.2026 nachgeprüft: Im Cloudflare-Konto der Agentur gibt es keinen Worker
`steakhaus-witte`, auf GitHub keinen Build und keine Deploy-Verbindung. Die Seite war also nie
veröffentlicht, deshalb war sie nirgends zu sehen. Der Code baut sauber (Node 24), der Probelauf
`wrangler deploy --dry-run` liest 90 Dateien aus `dist/client`, Upload 759 KiB. Der Deploy selbst
fehlt noch: in der Arbeitsumgebung gibt es keinen Cloudflare-Login, und eine vorläufige
Veröffentlichung wurde von der Sicherheitsprüfung gesperrt.

Erster Versuch im Dashboard am 22.10.2026 gescheitert: das Projekt wurde unter **Pages** angelegt
und `npx wrangler deploy` als Build-Befehl eingetragen. Fehler „entry-point file
@astrojs/cloudflare/entrypoints/server was not found“, weil Astro nie gebaut hat. Hier
nachgestellt und bestätigt: ohne Build genau dieser Fehler, nach `pnpm build` liest der Probelauf
90 Dateien. Lösung (in `README.md` unter „Fehlerbild“): Pages-Projekt löschen, als Worker
importieren, Build `pnpm build`, Deploy `npx wrangler deploy`. Stand 22.10.2026 gibt es im Konto
weiter keinen Worker `steakhaus-witte`.

## Offene Punkte

Vom Kunden zu liefern oder zu bestätigen (blockiert den Livegang):

1. Speisekarte: Steaks (Zuschnitte, Gewichte, Preise), Beilagen und Saucen, Dessertpreise, Monat der Mittagskarte. Datei `src/data/speisekarte.ts`.
2. Öffnungszeiten bestätigen (jetzt aus Verzeichnissen), dann `oeffnungszeiten.bestaetigt = true` in `src/data/betrieb.ts`; erst dann gehen sie ins JSON-LD.
3. Impressum: Geschäftsführung, E-Mail, USt-IdNr., Registereintrag (Verzeichnis nennt Haus Witte GmbH, HRB 13783, AG Gelsenkirchen).
4. Datenschutz: Speicherdauer der Reservierungsmails, Auftragsverarbeitung mit Cloudflare und Resend, Versandregion bei Resend.
5. Facebook- und Instagram-Adresse (`social` in `src/data/betrieb.ts`).
6. Place ID des Google-Profils (Kurzlink liegt vor) und Agenturschlüssel für Places.
7. Logo als Vektor, Rechte an den Fotos, eigenes Dessertfoto.
8. Freigabe der zehn Copy-Vorschläge, eine Person beim Kunden, die freigibt.
9. Zahlungsarten (Verzeichnisse: nur bar oder EC-Karte), Hinweis auf der Seite gewünscht?
10. KI-Trainingscrawler sperren oder erlauben (`src/pages/robots.txt.ts`, jetzt erlaubt).

Für die Agentur:

* Referenzrecherche auf einer Premium-Designquelle und Stylescape: nicht gelaufen, weil fremde Seiten aus der Arbeitsumgebung nicht abrufbar waren. Kandidaten vor einem Abruf vorlegen (Tor 1).
* Quellskills aus Phase 0 nicht installiert (keine Zustimmung eingeholt).
* Erster Deploy: Repository im Cloudflare Dashboard als Worker importieren oder `pnpm run deploy`
  mit Login (Schritte in `README.md`). Bis dahin ist die Seite nicht im Netz.
* Deploy: Cloudflare-Konto, Secrets setzen (`wrangler secret put …`), Domain umziehen, Weiterleitungen der alten URLs (alte Seitenstruktur unbekannt, Inventar fehlt).
* CSP von Report-Only auf scharf, nachdem eine Woche keine Verstöße kamen.

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
- **22.10.2026** Phase 7: Prüfung. `astro check` und alle Prüfskripte gelaufen, Befunde behoben:
  Werte ohne Token (neue Tokens für Tippziele, Breiten, Schatten), Hover nur mit Zeiger,
  Touchziele unter 44 px im Formular und Fuß, Überlauf bei 320 px in Speisekarte und Anfahrt,
  Titel auf 52 Zeichen, Quellkarten aus dem Build, Typen für `cloudflare:workers`. Im
  Browsertest gefunden: Checkbox reagierte nach einem Fehler nicht, weil die Feldprüfung beim
  Verlassen das Formular verschob (jetzt Prüfung beim Absenden, Korrektur beim Tippen), und
  mobil zu wenig Kontrast im Held (jetzt Hochformatfoto mit Leuchtschrift über dem Text,
  gemessen 6,0:1). `marke.json` liegt jetzt im Wurzelverzeichnis, dort finden die Prüfskripte sie.
- **22.10.2026** Nachprüfung „keine Seite zu finden“: Seite war nie veröffentlicht (kein Worker
  bei Cloudflare, keine Deploy-Verbindung auf GitHub). Build mit Node 24 und Worker-Vorschau
  geprüft, Screenshots bei 1440 und 375 px ohne Fehler in der Konsole, alle Bilder laden.
  `assets.directory` in `wrangler.jsonc` auf `./dist/client` korrigiert, Skript `deploy` ergänzt,
  `README.md` mit den Schritten zur Veröffentlichung, Angabe zur Bewertungsroute korrigiert
  (204 statt 503).
- **22.10.2026** Fehlgeschlagener Build bei Cloudflare ausgewertet: Pages-Projekt mit
  `npx wrangler deploy` als Build-Befehl, Astro lief nie. Kein Codefehler. Fehlerbild und
  richtige Einstellungen in `README.md` ergänzt.
