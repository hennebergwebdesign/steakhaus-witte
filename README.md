# Restaurant & Steakhouse Haus Witte

Relaunch von steakhouse-hauswitte.de. Astro 7 (statisch) auf Cloudflare Workers mit statischen
Assets. Projektwissen, Regeln und offene Punkte stehen in `CLAUDE.md`.

## Lokal ansehen

Voraussetzung: Node 24 (siehe `.nvmrc`) und pnpm. Mit Node 22 bricht Astro 7 den Build ab.

```bash
pnpm install
pnpm dev                    # Entwicklung, http://localhost:4321
pnpm build && pnpm preview  # gebaute Seite in der Worker-Vorschau
```

## Veröffentlichen (Cloudflare Workers, nicht Pages)

Die Seite ist ein Worker mit statischen Assets. Ein Projekt unter „Pages“ zeigt nur eine
leere oder 404-Seite, weil die fertige Startseite in `dist/client` liegt und der Worker-Code in
`dist/server`.

Weg 1, im Cloudflare Dashboard (empfohlen):

1. Workers & Pages, Erstellen, Repository importieren: `hennebergwebdesign/steakhaus-witte`.
2. Produktionszweig `main`, Build-Befehl `pnpm build`, Deploy-Befehl `npx wrangler deploy`.
3. Variable `NODE_VERSION=24` setzen (die `.nvmrc` sagt das auch).
4. Nach dem ersten Deploy die Variablen und Secrets aus `.env.example` eintragen.

Weg 2, von einem Rechner mit Cloudflare-Login:

```bash
pnpm install
npx wrangler login
pnpm run deploy
```

Danach ist die Seite unter `https://steakhaus-witte.<konto>.workers.dev` erreichbar. Die
KV-Speicher legt Wrangler beim ersten Deploy selbst an.

Ohne Secrets läuft die Seite vollständig, nur Reservierung und Bewertungen weichen auf
Telefon und Links zum Google-Profil aus.
