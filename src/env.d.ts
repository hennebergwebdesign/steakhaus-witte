/**
 * Knappe Typdeklaration für die Laufzeit von Cloudflare Workers. Bewusst nicht die volle
 * worker-configuration.d.ts aus `wrangler types`: deren globale Typen überschreiben die
 * DOM-Typen der Browserskripte (append, Element). Die Serverrouten typisieren ihre Bindings
 * selbst (Typ Umgebung in src/pages/api/*.ts).
 */
declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>;
}
