/**
 * Google-Bewertungen, serverseitig mit KV-Cache, nach assets/reviews/bewertungen-route.ts des Skills.
 * Der Browser spricht nie mit Google. Cache 24 Stunden, danach frischer Abruf; bei Fehler der
 * letzte bekannte Stand. Keine Profilbilder (sonst Verbindung zu Google).
 * Bindings: KV REVIEWS_CACHE, Secret GOOGLE_PLACES_API_KEY, Variable PUBLIC_GOOGLE_PLACE_ID.
 */
import type { APIRoute } from 'astro';
import { env as cfEnv } from 'cloudflare:workers';

export const prerender = false;

const CACHE_SEKUNDEN = 60 * 60 * 24;
const CACHE_SCHLUESSEL = 'google-bewertungen';
const LETZTER_STAND = 'google-bewertungen-fallback';

type KV = {
  get(k: string, t: 'json'): Promise<unknown>;
  put(k: string, v: string, o?: { expirationTtl?: number }): Promise<void>;
};
type Umgebung = { REVIEWS_CACHE?: KV; GOOGLE_PLACES_API_KEY?: string; PUBLIC_GOOGLE_PLACE_ID?: string };

export type Bewertung = { autor: string; sterne: number; text: string; relativ: string };
export type Ergebnis = { schnitt: number; anzahl: number; profil: string; bewertungen: Bewertung[]; stand: string };

export const GET: APIRoute = async () => {
  const env = cfEnv as unknown as Umgebung;
  const kv = env.REVIEWS_CACHE;

  if (!env.GOOGLE_PLACES_API_KEY || !env.PUBLIC_GOOGLE_PLACE_ID) {
    return fehlerAntwort('nicht eingerichtet');
  }

  const zwischenspeicher = kv ? await kv.get(CACHE_SCHLUESSEL, 'json') : null;
  if (zwischenspeicher) return json(zwischenspeicher, 'treffer');

  try {
    const ergebnis = await abrufen(env);
    if (kv) {
      await kv.put(CACHE_SCHLUESSEL, JSON.stringify(ergebnis), { expirationTtl: CACHE_SEKUNDEN });
      await kv.put(LETZTER_STAND, JSON.stringify(ergebnis)); // ohne Ablauf, nur für den Störfall
    }
    return json(ergebnis, 'frisch');
  } catch (fehler) {
    console.error('Bewertungsabruf fehlgeschlagen', fehler);
    const fallback = kv ? await kv.get(LETZTER_STAND, 'json') : null;
    if (fallback) return json(fallback, 'fallback');
    return fehlerAntwort('nicht verfügbar');
  }
};

async function abrufen(env: Umgebung): Promise<Ergebnis> {
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(env.PUBLIC_GOOGLE_PLACE_ID!)}?languageCode=de`;
  const antwort = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': env.GOOGLE_PLACES_API_KEY!,
      'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews',
    },
  });
  if (!antwort.ok) throw new Error(`Places API ${antwort.status}: ${await antwort.text()}`);
  const daten = (await antwort.json()) as any;
  return {
    schnitt: Number(daten.rating ?? 0),
    anzahl: Number(daten.userRatingCount ?? 0),
    profil: daten.googleMapsUri ?? '',
    stand: new Date().toISOString(),
    bewertungen: (daten.reviews ?? []).map((r: any): Bewertung => ({
      autor: r.authorAttribution?.displayName ?? 'Google Nutzer',
      sterne: Number(r.rating ?? 0),
      text: String(r.originalText?.text ?? r.text?.text ?? '').slice(0, 1200),
      relativ: r.relativePublishTimeDescription ?? '',
    })),
  };
}

function json(koerper: unknown, quelle: string) {
  return new Response(JSON.stringify(koerper), {
    headers: {
      'content-type': 'application/json',
      'cache-control': `public, max-age=600, s-maxage=${CACHE_SEKUNDEN}`,
      'x-cache': quelle,
    },
  });
}

function fehlerAntwort(grund: string) {
  return new Response(JSON.stringify({ fehler: grund }), { status: 503, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
