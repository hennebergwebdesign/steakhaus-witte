// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

/*
  Statischer Build, einzelne Serverrouten (Reservierung, Bewertungen) laufen auf
  Cloudflare Workers. Die Domain kommt aus PUBLIC_SITE_URL, sie steuert canonical,
  Open Graph, Sitemap und robots.txt gleichzeitig. Der Rueckfall ist die bisherige
  Domain des Kunden, weil es ein Relaunch ist.
*/
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://steakhouse-hauswitte.de',
  output: 'static',
  // compile: Bilder werden beim Build mit Sharp optimiert, zur Laufzeit nichts umgerechnet.
  // prerenderEnvironment node: die statischen Seiten brauchen kein workerd zum Vorrendern.
  adapter: cloudflare({ imageService: 'compile', prerenderEnvironment: 'node' }),
  integrations: [
    sitemap({
      filter: (s) => !['/impressum', '/datenschutz', '/reservierung-gesendet'].some((p) => s.includes(p)),
    }),
  ],
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  build: { inlineStylesheets: 'auto' },
  // keine Quellkarten in der Auslieferung, sie geben den Quelltext heraus (pruefe-sicherheit)
  vite: { build: { sourcemap: false } },
});
