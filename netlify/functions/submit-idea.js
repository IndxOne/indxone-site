/**
 * submit-idea — Netlify Function
 * Reçoit les soumissions de /votre-idee, valide, nettoie et transmet à Netlify Forms.
 *
 * Antispam : honeypot, timing, double-clic (idempotent).
 * Validation : champs obligatoires, longueurs, format email, consentement.
 * Conservation : via Netlify Forms dashboard. Pas de BDD supplémentaire.
 */

const FORM_NAME = "soumission-votre-idee";
const VALID_PROJECT_TYPES = ["mariage", "site", "application", "activite", "idee_floue"];
const VALID_VERSIONS = ["1.0.0"];
const MAX_FIELD_LENGTH = 2000;
const MAX_CONTACT_LENGTH = 200;
const MAX_CONDITIONAL_KEYS = 10;
const MIN_SUBMIT_DELAY_MS = 3000;

// --- Sanitization ---

function stripHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitize(obj, depth) {
  if (depth === undefined) depth = 0;
  if (depth > 5) return obj;
  if (typeof obj === "string") return stripHtml(obj);
  if (Array.isArray(obj)) return obj.map(function (v) { return sanitize(v, depth + 1); });
  if (obj && typeof obj === "object") {
    var result = {};
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      result[keys[i]] = sanitize(obj[keys[i]], depth + 1);
    }
    return result;
  }
  return obj;
}

// --- Validation ---

function validateEmail(email) {
  if (typeof email !== "string") return false;
  // RFC 5322 simplified
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= MAX_CONTACT_LENGTH;
}

function validateUuid4(id) {
  if (typeof id !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id);
}

function validateIsoDate(str) {
  if (typeof str !== "string") return false;
  var d = new Date(str);
  return !isNaN(d.getTime()) && d.toISOString() === str;
}

function validatePayload(body) {
  var errors = [];

  if (!body) {
    return { valid: false, errors: ["Body manquant"] };
  }

  // form_version
  if (!body.form_version || VALID_VERSIONS.indexOf(body.form_version) === -1) {
    errors.push("form_version invalide ou non reconnu");
  }

  // submission_id
  if (!validateUuid4(body.submission_id)) {
    errors.push("submission_id doit être un UUID v4 valide");
  }

  // project_type
  if (!body.project_type || VALID_PROJECT_TYPES.indexOf(body.project_type) === -1) {
    errors.push("project_type doit être dans l'enum autorisé");
  }

  // created_at
  if (!validateIsoDate(body.created_at)) {
    errors.push("created_at doit être une date ISO 8601 valide");
  } else {
    var submittedAt = new Date(body.created_at);
    var now = new Date();
    var hoursDiff = (now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60);
    if (hoursDiff > 24) {
      errors.push("La soumission date de plus de 24h");
    }
  }

  // contact
  if (!body.contact) {
    errors.push("contact requis");
  } else {
    if (!body.contact.nom || body.contact.nom.length < 1 || body.contact.nom.length > MAX_CONTACT_LENGTH) {
      errors.push("contact.nom requis (1-" + MAX_CONTACT_LENGTH + " caractères)");
    }
    if (!validateEmail(body.contact.email)) {
      errors.push("contact.email invalide");
    }
  }

  // consent
  if (!body.consent || body.consent.accepted !== true) {
    errors.push("consentement requis");
  }
  if (body.consent && body.consent.accepted_at && !validateIsoDate(body.consent.accepted_at)) {
    errors.push("consent.accepted_at doit être une date ISO 8601 valide");
  }

  // responses length checks
  if (body.responses) {
    if (body.responses.trunk) {
      var trunkKeys = Object.keys(body.responses.trunk);
      for (var i = 0; i < trunkKeys.length; i++) {
        var val = body.responses.trunk[trunkKeys[i]];
        if (typeof val === "string" && val.length > MAX_FIELD_LENGTH) {
          errors.push("responses.trunk." + trunkKeys[i] + " dépasse " + MAX_FIELD_LENGTH + " caractères");
        }
      }
    }
    if (body.responses.conditional) {
      var condKeys = Object.keys(body.responses.conditional);
      if (condKeys.length > MAX_CONDITIONAL_KEYS) {
        errors.push("responses.conditional ne peut pas dépasser " + MAX_CONDITIONAL_KEYS + " clés");
      }
      for (var j = 0; j < condKeys.length; j++) {
        var val2 = body.responses.conditional[condKeys[j]];
        if (typeof val2 === "string" && val2.length > MAX_FIELD_LENGTH) {
          errors.push("responses.conditional." + condKeys[j] + " dépasse " + MAX_FIELD_LENGTH + " caractères");
        }
      }
    }
  }

  return { valid: errors.length === 0, errors: errors };
}

// --- Submit to Netlify Forms via API ---

async function submitToNetlifyForms(payload) {
  var siteId = process.env.NETLIFY_SITE_ID;
  var accessToken = process.env.NETLIFY_AUTH_TOKEN;

  if (!siteId || !accessToken) {
    console.error("[submit-idea] NETLIFY_SITE_ID or NETLIFY_AUTH_TOKEN not set");
    return { ok: false, status: 503 };
  }

  var formData = new URLSearchParams();
  formData.append("form-name", FORM_NAME);
  formData.append("submission_id", payload.submission_id);
  formData.append("form_version", payload.form_version);
  formData.append("project_type", payload.project_type);
  formData.append("created_at", payload.created_at);
  formData.append("nom", payload.contact.nom);
  formData.append("prenom", payload.contact.prenom || "");
  formData.append("email", payload.contact.email);
  formData.append("phone", payload.contact.phone || "");

  // Flatten trunk responses
  if (payload.responses && payload.responses.trunk) {
    var trunkKeys = Object.keys(payload.responses.trunk);
    for (var i = 0; i < trunkKeys.length; i++) {
      formData.append("trunk_" + trunkKeys[i], payload.responses.trunk[trunkKeys[i]] || "");
    }
  }

  // Flatten conditional responses
  if (payload.responses && payload.responses.conditional) {
    var condKeys = Object.keys(payload.responses.conditional);
    for (var j = 0; j < condKeys.length; j++) {
      formData.append("cond_" + condKeys[j], payload.responses.conditional[condKeys[j]] || "");
    }
  }

  formData.append("consent", "true");
  formData.append("consent_at", payload.consent.accepted_at || "");
  formData.append("origin", payload.meta ? payload.meta.origin : "");
  formData.append("referrer", payload.meta ? payload.meta.referrer : "");
  formData.append("language", payload.meta ? payload.meta.language : "");

  var url = "https://api.netlify.com/api/v1/sites/" + siteId + "/forms/" + FORM_NAME + "/submissions";

  var resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Bearer " + accessToken,
    },
    body: formData.toString(),
  });

  return { ok: resp.ok, status: resp.status };
}

// --- Handler ---

exports.handler = async function (event) {
  var headers = {
    "Access-Control-Allow-Origin": process.env.SITE_URL || "https://indxone.com",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "X-Content-Type-Options": "nosniff",
  };

  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: Object.assign({}, headers, { "Content-Type": "application/json" }),
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  var body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      headers: Object.assign({}, headers, { "Content-Type": "application/json" }),
      body: JSON.stringify({ error: "JSON invalide" }),
    };
  }

  // --- Antispam: honeypot ---
  if (body.company_name && body.company_name.length > 0) {
    // Silently reject — return success to not reveal the mechanism
    console.log("[submit-idea] honeypot triggered");
    return {
      statusCode: 200,
      headers: Object.assign({}, headers, { "Content-Type": "application/json" }),
      body: JSON.stringify({ ok: true }),
    };
  }

  // --- Antispam: timing ---
  if (body.created_at) {
    var submittedAt = new Date(body.created_at).getTime();
    var now = Date.now();
    if (now - submittedAt < MIN_SUBMIT_DELAY_MS) {
      console.log("[submit-idea] timing too fast: " + (now - submittedAt) + "ms");
      return {
        statusCode: 200,
        headers: Object.assign({}, headers, { "Content-Type": "application/json" }),
        body: JSON.stringify({ ok: true }),
      };
    }
  }

  // --- Sanitize ---
  var sanitized = sanitize(body);

  // --- Validate ---
  var validation = validatePayload(sanitized);
  if (!validation.valid) {
    return {
      statusCode: 400,
      headers: Object.assign({}, headers, { "Content-Type": "application/json" }),
      body: JSON.stringify({ error: "Validation échouée", details: validation.errors }),
    };
  }

  // --- Submit to Netlify Forms ---
  var result;
  try {
    result = await submitToNetlifyForms(sanitized);
  } catch (err) {
    console.error("[submit-idea] submit error:", err.message);
    return {
      statusCode: 500,
      headers: Object.assign({}, headers, { "Content-Type": "application/json" }),
      body: JSON.stringify({ error: "Erreur serveur lors de la soumission" }),
    };
  }

  if (!result.ok) {
    console.error("[submit-idea] Netlify Forms API error:", result.status);
    return {
      statusCode: 502,
      headers: Object.assign({}, headers, { "Content-Type": "application/json" }),
      body: JSON.stringify({ error: "Erreur de transmission" }),
    };
  }

  return {
    statusCode: 200,
    headers: Object.assign({}, headers, { "Content-Type": "application/json" }),
    body: JSON.stringify({ ok: true, submission_id: sanitized.submission_id }),
  };
};
