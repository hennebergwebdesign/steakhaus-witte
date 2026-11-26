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

