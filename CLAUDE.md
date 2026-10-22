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

## Seitenstruktur

Eine Startseite mit Sprungmarken (`#speisen`, `#speisekarte`, `#haus`, `#bewertungen`,
`#reservierung`, `#anfahrt`), dazu `/impressum`, `/datenschutz`, `404`.

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

## Stand

Phase 1 und 2 abgeschlossen. Weitere Phasen folgen, siehe Änderungsverlauf.

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
