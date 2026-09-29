import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";

export const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
export const clean = (value) =>
  typeof value === "string"
    ? value
        .replace(/<[^>]*>/g, "")
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
        .replace(/\s+/g, " ")
        .trim()
    : value;
export const text = (value, max = 200, required = false) =>
  typeof value === "string" && value.length <= max && (!required || value.trim().length > 0);
export const email = (value) => text(value, 200, true) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const uuid = (value) =>
  typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export const iso = (value) =>
  typeof value === "string" && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
export const reply = (status, data) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
const env = (name) => globalThis.Netlify?.env.get(name) ?? process.env[name];

export function timing(body) {
  const now = Date.now();
  return (
    iso(body.started_at) &&
    iso(body.created_at) &&
    now - Date.parse(body.started_at) >= 3000 &&
    Date.parse(body.started_at) <= Date.parse(body.created_at) &&
    Math.abs(now - Date.parse(body.created_at)) <= 300000
  );
}

async function readBody(req) {
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
    return reply(415, { error: "Content-Type application/json requis" });
  const declared = Number(req.headers.get("content-length"));
  if (declared > 32768) return reply(413, { error: "Demande trop volumineuse" });
  const reader = req.body?.getReader();
  if (!reader) return reply(400, { error: "JSON invalide" });
  let size = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 32768) {
      await reader.cancel();
      return reply(413, { error: "Demande trop volumineuse" });
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    const body = JSON.parse(new TextDecoder().decode(bytes));
    return isObject(body) ? body : reply(400, { error: "Objet JSON requis" });
  } catch {
    return reply(400, { error: "JSON invalide" });
  }
}

// Atomic claim survives cold starts and deployments. Store contains no contact data.
// An uncertain upstream outcome stays pending: retries cannot accidentally double-send.
export async function deliver(formName, payload, fields, context, dependencies = {}) {
  const deployContext = context?.deploy?.context || env("CONTEXT");
  if (deployContext !== "production" || context?.deploy?.published === false)
    return reply(200, { ok: false, simulated: true, message: "Mode Preview : demande validée, aucun envoi effectué." });
  const siteUrl =
    env("NETLIFY_FORM_SITE_URL") || env("SITE_URL") || context?.site?.url || env("URL") || "https://indxone.com";
  if (!siteUrl) return reply(503, { error: "Destination du formulaire non configurée" });
  const destination = new URL("/", siteUrl);
  if (destination.protocol !== "https:") return reply(503, { error: "Destination du formulaire invalide" });
  const store = dependencies.store || getStore({ name: "form-submission-receipts", consistency: "strong" });
  const key = `${formName}/${payload.submission_id}`;
  const identity = { ...fields };
  delete identity["created-at"];
  delete identity["consent-at"];
  const hash = createHash("sha256").update(JSON.stringify(identity)).digest("hex");
  const claim = { hash, state: "pending", created_at: new Date().toISOString() };
  const existing = await store.getWithMetadata(key, { type: "json" });
  if (existing) {
    if (existing.data.hash !== hash) return reply(409, { error: "Identifiant déjà utilisé pour une autre demande" });
    if (existing.data.state === "sent")
      return reply(200, { ok: true, submission_id: payload.submission_id, duplicate: true });
    if (existing.data.state !== "failed")
      return reply(409, {
        error: "Demande déjà en cours ou transmission à vérifier. Contactez contact@indxone.com avant un nouvel envoi.",
      });
  }
  const result = await store.setJSON(key, claim, existing ? { onlyIfMatch: existing.etag } : { onlyIfNew: true });
  if (!result.modified) return reply(409, { error: "Demande déjà en cours. Réessayez dans quelques instants." });
  // Verify the durable claim before any external side effect.
  const persisted = await store.getWithMetadata(key, { type: "json" });
  if (!persisted || persisted.etag !== result.etag || persisted.data.hash !== hash)
    return reply(503, { error: "Enregistrement de sécurité indisponible" });
  const data = new URLSearchParams({ "form-name": formName, ...fields, "submission-id": payload.submission_id });
  let response;
  try {
    response = await (dependencies.fetch || fetch)(destination, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "text/html" },
      body: data.toString(),
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return reply(502, { error: "Transmission à vérifier. Contactez contact@indxone.com avant un nouvel envoi." });
  }
  await store.setJSON(key, { ...claim, state: response.ok ? "sent" : "failed" }, { onlyIfMatch: persisted.etag });
  return response.ok
    ? reply(200, { ok: true, submission_id: payload.submission_id })
    : reply(502, { error: "Erreur de transmission. Réessayez." });
}

export function handler(validate, fields, formName, honeypot) {
  return async (req, context) => {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { Allow: "POST, OPTIONS" } });
    if (req.method !== "POST") return reply(405, { error: "Method not allowed" });
    const origin = req.headers.get("origin");
    if (origin && origin !== new URL(req.url).origin) return reply(403, { error: "Origine refusée" });
    try {
      const body = await readBody(req);
      if (body instanceof Response) return body;
      if (!text(body[honeypot] ?? "", 200)) return reply(400, { error: "Champ antispam invalide" });
      if (body[honeypot]) return reply(400, { error: "Demande refusée" });
      const errors = validate(body);
      if (!uuid(body.submission_id)) errors.push("submission_id invalide");
      if (!timing(body)) errors.push("Horodatage invalide ou envoi trop rapide");
      if (errors.length) return reply(400, { error: "Validation échouée", details: errors });
      return await deliver(typeof formName === "function" ? formName(body) : formName, body, fields(body), context);
    } catch {
      return reply(503, { error: "Service temporairement indisponible" });
    }
  };
}
