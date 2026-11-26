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

**23.11.2026** Impressum: Abschnitt "Webdesign und Umsetzung" mit Agenturhinweis (Link thatsit.marketing, rel noopener). Fuss: "Made by That's it. Marketing" unter dem Copyright (target _blank, rel noopener).

Stand SEO: Das Impressum ist indexierbar (kein noindex) und steht in der Sitemap. Nicht wieder auf noindex setzen.
