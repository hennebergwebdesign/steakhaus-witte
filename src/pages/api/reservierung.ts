/**
 * Reservierungsanfrage, Serverroute nach assets/forms/kontakt-route.ts des Skills.
 *
 * Reihenfolge: Konfiguration, Origin, Honigtopf, Zeitfeld, Turnstile, Validierung, Rate Limit, Mails.
 * Es wird NICHT gespeichert (kein Leadsystem beauftragt). Die Anfrage ist keine feste Buchung:
 * das Restaurant bestätigt sie, so steht es im Formular und in der Bestätigungsmail.
 *
 * Antwortet mit JSON, wenn das Skript im Browser sendet (Accept: application/json), sonst mit
 * einer Weiterleitung auf /reservierung-gesendet. So geht keine Anfrage ohne JavaScript verloren.
 *
 * Umgebung: Astro 6+ mit @astrojs/cloudflare liest Bindings und Secrets aus "cloudflare:workers",
 * Astro.locals.runtime.env gibt es nicht mehr.
 */
import type { APIRoute } from 'astro';
import { env as cfEnv } from 'cloudflare:workers';
import { interneMail, bestaetigungsMail, type Reservierung } from '../../lib/mail-template';
import { pruefen } from '../../lib/reservierung-pruefung';
import { betrieb } from '../../data/betrieb';

export const prerender = false;

type Umgebung = {
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
  MAIL_TO?: string;
  TURNSTILE_SECRET_KEY?: string;
  RATE_LIMIT?: { get(k: string): Promise<string | null>; put(k: string, v: string, o?: { expirationTtl?: number }): Promise<void> };
};

const KONTAKTWEG = `Bitte rufen Sie uns an: ${betrieb.telefon}.`;

export const POST: APIRoute = async ({ request, clientAddress, site }) => {
  const env = cfEnv as unknown as Umgebung;
  const willJson = (request.headers.get('accept') ?? '').includes('application/json');

  const antwort = (status: number, koerper: Record<string, unknown>) => {
    if (willJson) return new Response(JSON.stringify(koerper), { status, headers: { 'content-type': 'application/json' } });
    // Ohne JavaScript: Ergebnisseite statt JSON
    const ziel = new URL('/reservierung-gesendet', request.url);
    if (status !== 200) ziel.searchParams.set('fehler', String(koerper.fehler ?? 'Bitte prüfen Sie Ihre Angaben.'));
    return Response.redirect(ziel.href, 303);
  };

  // 0. Konfiguration: eine fehlende Variable erzeugt keinen leeren 500er
  for (const name of ['RESEND_API_KEY', 'MAIL_FROM', 'MAIL_TO'] as const) {
    if (!env[name]) {
      console.error(`Umgebungsvariable ${name} fehlt`);
      return antwort(503, { fehler: `Online-Reservierungen sind gerade nicht möglich. ${KONTAKTWEG}` });
    }
  }

  // 1. Origin
  if (!herkunftErlaubt(request, site)) return antwort(403, { fehler: 'Ungültige Herkunft.' });

  let daten: Record<string, string>;
  try {
    const form = await request.formData();
    daten = Object.fromEntries(Array.from(form.entries()).map(([k, v]) => [k, typeof v === 'string' ? v : ''])) as Record<string, string>;
  } catch {
    return antwort(400, { fehler: 'Ungültige Anfrage.' });
  }

  // 2. Honigtopf und 3. Zeitfeld: Erfolg vortäuschen, nichts tun
  if (daten.webadresse) return antwort(200, { ok: true });
  if (daten.ts && Date.now() - Number(daten.ts) < 2000) return antwort(200, { ok: true });

  // 4. Turnstile
  if (!(await turnstileGueltig(daten['cf-turnstile-response'], env.TURNSTILE_SECRET_KEY, clientAddress))) {
    return antwort(400, { fehler: `Die Sicherheitsprüfung ist fehlgeschlagen. Bitte laden Sie die Seite neu oder rufen Sie uns an: ${betrieb.telefon}.` });
  }

  // 5. Validierung, dieselbe Regel wie im Browser
  const felder = pruefen(daten);
  if (Object.keys(felder).length) return antwort(422, { felder, fehler: Object.values(felder)[0] });

  // 6. Rate Limit, Schlüssel läuft nach zehn Minuten ab
  if (env.RATE_LIMIT && clientAddress) {
    const schluessel = `reservierung:${clientAddress}`;
    const anzahl = Number((await env.RATE_LIMIT.get(schluessel)) || 0);
    if (anzahl >= 5) return antwort(429, { fehler: `Zu viele Anfragen. ${KONTAKTWEG}` });
    await env.RATE_LIMIT.put(schluessel, String(anzahl + 1), { expirationTtl: 600 });
  }

  const r: Reservierung = {
    name: daten.name.trim().slice(0, 120),
    email: daten.email.trim().slice(0, 180),
    telefon: daten.telefon.trim().slice(0, 40),
    datum: daten.datum.trim(),
    uhrzeit: daten.uhrzeit.trim(),
    personen: Number(daten.personen),
    nachricht: (daten.nachricht ?? '').trim().slice(0, 2000),
  };
  const seite = (site ?? new URL(request.url)).href;

  // 7. Mails: intern an das Restaurant, Bestätigung an den Gast
  try {
    await Promise.all([
      resendSenden(env, {
        from: env.MAIL_FROM,
        to: env.MAIL_TO,
        reply_to: r.email,
        subject: `Reservierungsanfrage: ${r.personen} Pers. am ${r.datum} um ${r.uhrzeit}, ${r.name}`,
        html: interneMail({ ...r, zeit: new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }) }, seite),
      }),
      resendSenden(env, {
        from: env.MAIL_FROM,
        to: r.email,
        subject: 'Ihre Reservierungsanfrage bei Haus Witte',
        html: bestaetigungsMail(r, seite),
      }),
    ]);
  } catch (fehler) {
    console.error('Mailversand fehlgeschlagen', fehler);
    return antwort(502, { fehler: `Die Anfrage konnte nicht versendet werden. ${KONTAKTWEG}` });
  }

  return antwort(200, { ok: true });
};

function herkunftErlaubt(request: Request, site: URL | undefined) {
  const eigene = new Set([new URL(request.url).host]);
  if (site) eigene.add(site.host);
  const quelle = request.headers.get('origin') ?? request.headers.get('referer');
  if (!quelle) return false;
  try {
    return eigene.has(new URL(quelle).host);
  } catch {
    return false;
  }
}

/** Fehlt das Geheimnis, wird nur in der lokalen Entwicklung durchgelassen. */
async function turnstileGueltig(token: string | undefined, geheim: string | undefined, ip?: string) {
  if (!geheim) {
    if (import.meta.env.DEV) return true;
    console.error('TURNSTILE_SECRET_KEY fehlt, Anfrage abgewiesen');
    return false;
  }
  if (!token) return false;
  // Ist Cloudflare nicht erreichbar, faellt die Pruefung zu: ruhige Meldung mit Telefon statt 500er
  try {
    const pruefung = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret: geheim, response: token, remoteip: ip }),
    });
    const ergebnis = (await pruefung.json()) as { success: boolean };
    return ergebnis.success === true;
  } catch (fehler) {
    console.error('Turnstile nicht erreichbar', fehler);
    return false;
  }
}

async function resendSenden(env: Umgebung, nachricht: Record<string, unknown>) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify(nachricht),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return res.json();
}
