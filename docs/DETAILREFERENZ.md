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

