/**
 * robots.txt zur Bauzeit, damit die Sitemap-Adresse zur konfigurierten Domain passt.
 * KI-Suchcrawler (Antworten mit Quelle) ausdrücklich erlaubt, damit Haus Witte in
 * KI-Antworten zitiert werden kann (31-ki-sichtbarkeit-geo.md). Ob Trainingscrawler
 * (GPTBot, ClaudeBot, Google-Extended, CCBot) gesperrt werden, entscheidet der Kunde:
 * bis dahin gilt die Voreinstellung "erlaubt", siehe CLAUDE.md, Offene Punkte.
 */
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site).href;
  const inhalt = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /reservierung-gesendet',
    '',
    'User-agent: OAI-SearchBot',
    'User-agent: Claude-SearchBot',
    'User-agent: PerplexityBot',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${sitemap}`,
    '',
  ].join('\n');
  return new Response(inhalt, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
