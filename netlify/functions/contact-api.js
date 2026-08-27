/**
 * contact-api — Netlify Function
 * Reçoit les soumissions du formulaire de contact (FR/EN), valide et transmet à Netlify Forms.
 *
 * Antispam : honeypot, timing.
 * Validation : champs obligatoires, email, longueur.
 */

var FORM_NAMES = {
  fr: "contact-indxone",
  en: "contact-indxone-en",
};

var VALID_SUBJECTS_FR = [
  "Projet AMOA / Architecture SI",
  "Automatisation / No-code",
  "Infrastructure / Cloud",
  "Intégration ERP / CRM",
  "Kit de lancement",
  "IndxOne Hub / cockpit de pilotage",
  "Site mairie / Collectivité",
  "Autre demande",
];

var VALID_SUBJECTS_EN = [
  "AMOA / IT Architecture project",
  "Automation / No-code",
  "Infrastructure / Cloud",
  "ERP / CRM Integration",
  "Kit de lancement",
  "IndxOne Hub / steering cockpit",
  "Municipality website",
  "Other request",
];

var MAX_FIELD_LENGTH = 2000;
var MAX_CONTACT_LENGTH = 200;
var MIN_SUBMIT_DELAY_MS = 3000;

// --- Sanitization ---

function stripHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// --- Validation ---

function validateEmail(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= MAX_CONTACT_LENGTH;
}

function validatePayload(body, lang) {
  var errors = [];
  var isFr = lang === "fr";
  var validSubjects = isFr ? VALID_SUBJECTS_FR : VALID_SUBJECTS_EN;

  if (!body) {
    return { valid: false, errors: ["Body manquant"] };
  }

  if (!body.nom || body.nom.length < 1 || body.nom.length > MAX_CONTACT_LENGTH) {
    errors.push("nom requis");
  }

  if (!validateEmail(body.email)) {
    errors.push("email invalide");
  }

  if (!body.sujet || validSubjects.indexOf(body.sujet) === -1) {
    errors.push("sujet invalide");
  }

  if (!body.message || body.message.length < 10 || body.message.length > MAX_FIELD_LENGTH) {
    errors.push("message requis (10-" + MAX_FIELD_LENGTH + " caractères)");
  }

  if (body.consent !== "true" && body.consent !== true) {
    errors.push("consentement requis");
  }

  return { valid: errors.length === 0, errors: errors };
}

// --- Submit to Netlify Forms ---

async function submitToNetlifyForms(payload, formName) {
  var formData = new URLSearchParams();
  formData.append("form-name", formName);
  formData.append("nom", payload.nom);
  formData.append("prenom", payload.prenom || "");
  formData.append("email", payload.email);
  formData.append("sujet", payload.sujet);
  formData.append("message", payload.message);
  formData.append("budget", payload.budget || "");
  formData.append("delai", payload.delai || "");
  formData.append("consent", "true");

  // Netlify Forms accepts URL-encoded submissions at the deployed site's
  // root. The management API is for reading forms/submissions, not ingestion.
  var siteUrl = process.env.NETLIFY_FORM_SITE_URL || process.env.SITE_URL || "https://indxone.com";
  var url = new URL("/", siteUrl).toString();

  var resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "text/html,application/xhtml+xml",
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
  if (body.bot_field && body.bot_field.length > 0) {
    console.log("[contact-api] honeypot triggered");
    return {
      statusCode: 200,
      headers: Object.assign({}, headers, { "Content-Type": "application/json" }),
      body: JSON.stringify({ ok: true }),
    };
  }

  // --- Antispam: timing ---
  if (body.started_at) {
    var startedAt = new Date(body.started_at).getTime();
    var now = Date.now();
    if (now - startedAt < MIN_SUBMIT_DELAY_MS) {
      console.log("[contact-api] timing too fast");
      return {
        statusCode: 200,
        headers: Object.assign({}, headers, { "Content-Type": "application/json" }),
        body: JSON.stringify({ ok: true }),
      };
    }
  }

  // --- Determine language and form name ---
  var lang = body.lang === "en" ? "en" : "fr";
  var formName = FORM_NAMES[lang];

  // --- Sanitize ---
  var sanitized = {
    nom: stripHtml(body.nom),
    prenom: stripHtml(body.prenom),
    email: stripHtml(body.email),
    sujet: stripHtml(body.sujet),
    message: stripHtml(body.message),
    budget: stripHtml(body.budget),
    delai: stripHtml(body.delai),
    consent: body.consent,
  };

  // --- Validate ---
  var validation = validatePayload(sanitized, lang);
  if (!validation.valid) {
    return {
      statusCode: 400,
      headers: Object.assign({}, headers, { "Content-Type": "application/json" }),
      body: JSON.stringify({ error: "Validation échouée", details: validation.errors }),
    };
  }

  // --- Submit ---
  var result;
  try {
    result = await submitToNetlifyForms(sanitized, formName);
  } catch (err) {
    console.error("[contact-api] submit error:", err.message);
    return {
      statusCode: 500,
      headers: Object.assign({}, headers, { "Content-Type": "application/json" }),
      body: JSON.stringify({ error: "Erreur serveur" }),
    };
  }

  if (!result.ok) {
    console.error("[contact-api] Netlify Forms API error:", result.status);
    return {
      statusCode: 502,
      headers: Object.assign({}, headers, { "Content-Type": "application/json" }),
      body: JSON.stringify({ error: "Erreur de transmission" }),
    };
  }

  return {
    statusCode: 200,
    headers: Object.assign({}, headers, { "Content-Type": "application/json" }),
    body: JSON.stringify({ ok: true }),
  };
};
