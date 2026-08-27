import { describe, it, expect, vi, beforeEach } from "vitest";

// The handler uses `fetch` internally (for the deployed Netlify Forms endpoint).
// We mock it to avoid real HTTP calls.
vi.stubGlobal("fetch", vi.fn());

// We need to require the CommonJS module (Netlify Function style)
const mod = require("../../netlify/functions/submit-idea.js");
const handler = mod.handler;

// --- Helpers ---

function makeEvent(overrides = {}) {
  return {
    httpMethod: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(validPayload()),
    ...overrides,
  };
}

function validPayload(overrides = {}) {
  const now = new Date(Date.now() - 5000).toISOString(); // 5s ago (past antispam delay)
  return {
    form_version: "1.0.0",
    submission_id: "550e8400-e29b-41d4-a716-446655440000",
    project_type: "site",
    created_at: now,
    contact: {
      nom: "Dupont",
      prenom: "Jean",
      email: "jean@example.fr",
      phone: "",
    },
    consent: { accepted: true, accepted_at: now },
    responses: {
      trunk: {
        goal: "Un site vitrine",
        audience: "Clients",
        style: "Sobre",
        examples: "",
        start: "Dans 3 mois",
        budget: "1500-5000",
        support: "Jusqu'à la mise en ligne",
      },
      conditional: {
        branch_one: "Mon activité",
        branch_two: "Accueil, services",
      },
    },
    meta: {
      origin: "https://indxone.com/votre-idee/",
      referrer: "",
      language: "fr",
    },
  };
}

async function callHandler(event) {
  return handler(event);
}

function jsonResponse(res) {
  return JSON.parse(res.body);
}

// --- Tests ---

describe("submit-idea handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure no production endpoint override is used by the tests.
    delete process.env.NETLIFY_SITE_ID;
    delete process.env.NETLIFY_AUTH_TOKEN;
    delete process.env.NETLIFY_FORM_SITE_URL;
    process.env.SITE_URL = "https://indxone.com";
  });

  // ─── CORS / Method ──────────────────────────────────────

  describe("CORS preflight", () => {
    it("returns 204 for OPTIONS", async () => {
      const res = await callHandler({ httpMethod: "OPTIONS" });
      expect(res.statusCode).toBe(204);
      expect(res.headers["Access-Control-Allow-Origin"]).toBeTruthy();
    });
  });

  describe("method check", () => {
    it("rejects GET with 405", async () => {
      const res = await callHandler({ httpMethod: "GET" });
      expect(res.statusCode).toBe(405);
      expect(jsonResponse(res).error).toMatch(/Method/i);
    });

    it("rejects PUT with 405", async () => {
      const res = await callHandler({ httpMethod: "PUT", body: "{}" });
      expect(res.statusCode).toBe(405);
    });
  });

  // ─── JSON parsing ──────────────────────────────────────

  describe("JSON parsing", () => {
    it("rejects invalid JSON with 400", async () => {
      const res = await callHandler(makeEvent({ body: "not json" }));
      expect(res.statusCode).toBe(400);
      expect(jsonResponse(res).error).toMatch(/JSON/i);
    });

    it("accepts valid JSON", async () => {
      fetch.mockResolvedValue({ ok: true, status: 200 });
      const res = await callHandler(makeEvent());
      // Should not be 400 (might be 503 if env vars missing, but not 400)
      expect(res.statusCode).not.toBe(400);
    });
  });

  // ─── Antispam: honeypot ────────────────────────────────

  describe("honeypot", () => {
    it("silently rejects when company_name is filled", async () => {
      const body = validPayload();
      body.company_name = "SpamBot Inc";
      const res = await callHandler(makeEvent({ body: JSON.stringify(body) }));
      expect(res.statusCode).toBe(200);
      expect(jsonResponse(res).ok).toBe(true);
      // No fetch call to Netlify
      expect(fetch).not.toHaveBeenCalled();
    });

    it("accepts when company_name is empty string", async () => {
      const body = validPayload();
      body.company_name = "";
      fetch.mockResolvedValue({ ok: true, status: 200 });
      const res = await callHandler(makeEvent({ body: JSON.stringify(body) }));
      // Should proceed past honeypot and submit normally.
      expect(res.statusCode).toBe(200);
    });

    it("accepts when company_name is absent", async () => {
      fetch.mockResolvedValue({ ok: true, status: 200 });
      const res = await callHandler(makeEvent());
      expect(res.statusCode).toBe(200);
    });
  });

  // ─── Antispam: timing ──────────────────────────────────

  describe("timing antispam", () => {
    it("rejects when submitted too fast (<3s)", async () => {
      const body = validPayload();
      body.created_at = new Date().toISOString(); // just now
      const res = await callHandler(makeEvent({ body: JSON.stringify(body) }));
      expect(res.statusCode).toBe(200);
      expect(jsonResponse(res).ok).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("accepts when timing is >=3s", async () => {
      fetch.mockResolvedValue({ ok: true, status: 200 });
      const body = validPayload();
      body.created_at = new Date(Date.now() - 5000).toISOString(); // 5s ago
      const res = await callHandler(makeEvent({ body: JSON.stringify(body) }));
      expect(res.statusCode).toBe(200);
    });
  });

  // ─── Validation ────────────────────────────────────────

  describe("payload validation", () => {
    it("rejects missing form_version", async () => {
      const body = validPayload();
      delete body.form_version;
      const res = await callHandler(makeEvent({ body: JSON.stringify(body) }));
      expect(res.statusCode).toBe(400);
      expect(jsonResponse(res).details).toEqual(
        expect.arrayContaining([expect.stringMatching(/form_version/i)])
      );
    });

    it("rejects unknown form_version", async () => {
      const body = validPayload();
      body.form_version = "9.9.9";
      const res = await callHandler(makeEvent({ body: JSON.stringify(body) }));
      expect(res.statusCode).toBe(400);
    });

    it("rejects invalid UUID", async () => {
      const body = validPayload();
      body.submission_id = "not-a-uuid";
      const res = await callHandler(makeEvent({ body: JSON.stringify(body) }));
      expect(res.statusCode).toBe(400);
      expect(jsonResponse(res).details).toEqual(
        expect.arrayContaining([expect.stringMatching(/submission_id/i)])
      );
    });

    it("rejects invalid project_type", async () => {
      const body = validPayload();
      body.project_type = "spam";
      const res = await callHandler(makeEvent({ body: JSON.stringify(body) }));
      expect(res.statusCode).toBe(400);
      expect(jsonResponse(res).details).toEqual(
        expect.arrayContaining([expect.stringMatching(/project_type/i)])
      );
    });

    it("rejects invalid email", async () => {
      const body = validPayload();
      body.contact.email = "not-an-email";
      const res = await callHandler(makeEvent({ body: JSON.stringify(body) }));
      expect(res.statusCode).toBe(400);
      expect(jsonResponse(res).details).toEqual(
        expect.arrayContaining([expect.stringMatching(/email/i)])
      );
    });

    it("rejects missing consent", async () => {
      const body = validPayload();
      body.consent = { accepted: false };
      const res = await callHandler(makeEvent({ body: JSON.stringify(body) }));
      expect(res.statusCode).toBe(400);
      expect(jsonResponse(res).details).toEqual(
        expect.arrayContaining([expect.stringMatching(/consent/i)])
      );
    });

    it("rejects missing contact.nom", async () => {
      const body = validPayload();
      body.contact.nom = "";
      const res = await callHandler(makeEvent({ body: JSON.stringify(body) }));
      expect(res.statusCode).toBe(400);
      expect(jsonResponse(res).details).toEqual(
        expect.arrayContaining([expect.stringMatching(/nom/i)])
      );
    });

    it("accepts all valid project types", async () => {
      for (const type of ["mariage", "site", "application", "activite", "idee_floue"]) {
        fetch.mockResolvedValue({ ok: true, status: 200 });
        const body = validPayload();
        body.project_type = type;
        const res = await callHandler(makeEvent({ body: JSON.stringify(body) }));
        expect(res.statusCode).not.toBe(400);
      }
    });
  });

  // ─── Sanitization ──────────────────────────────────────

  describe("sanitization", () => {
    it("strips HTML tags from text fields", async () => {
      fetch.mockResolvedValue({ ok: true, status: 200 });
      const body = validPayload();
      body.contact.nom = '<script>alert("xss")</script>Dupont';
      body.responses.trunk.goal = "<img src=x onerror=alert(1)>Un site";
      const res = await callHandler(makeEvent({ body: JSON.stringify(body) }));
      // Should not be 400 (sanitized, then validated)
      expect(res.statusCode).not.toBe(400);
      // Verify fetch was called (meaning validation passed after sanitization)
      expect(fetch).toHaveBeenCalled();
      // Verify the sent data has no HTML tags
      const sentBody = new URLSearchParams(fetch.mock.calls[0][1].body);
      expect(sentBody.get("name")).not.toContain("<script>");
      expect(sentBody.get("goal")).not.toContain("<img");
    });
  });

  // ─── Netlify Forms submission ──────────────────────────

  describe("Netlify Forms submission", () => {
    it("does not require Netlify API credentials", async () => {
      fetch.mockResolvedValue({ ok: true, status: 200 });
      const res = await callHandler(makeEvent());
      expect(res.statusCode).toBe(200);
    });

    it("returns 200 when submission succeeds", async () => {
      fetch.mockResolvedValue({ ok: true, status: 200 });
      const res = await callHandler(makeEvent());
      expect(res.statusCode).toBe(200);
      expect(jsonResponse(res).ok).toBe(true);
      expect(jsonResponse(res).submission_id).toBe("550e8400-e29b-41d4-a716-446655440000");
    });

    it("returns 502 when Netlify API fails", async () => {
      fetch.mockResolvedValue({ ok: false, status: 422 });
      const res = await callHandler(makeEvent());
      expect(res.statusCode).toBe(502);
      expect(jsonResponse(res).error).toMatch(/transmission/i);
    });

    it("returns 500 when fetch throws", async () => {
      fetch.mockRejectedValue(new Error("Network error"));
      const res = await callHandler(makeEvent());
      expect(res.statusCode).toBe(500);
      expect(jsonResponse(res).error).toMatch(/serveur/i);
    });

    it("sends correct form fields to the deployed Netlify form", async () => {
      fetch.mockResolvedValue({ ok: true, status: 200 });
      await callHandler(makeEvent());
      const [url, options] = fetch.mock.calls[0];
      expect(url).toBe("https://indxone.com/");
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
      const body = new URLSearchParams(options.body);
      expect(body.get("form-name")).toBe("soumission-votre-idee");
      expect(body.get("name")).toBe("Dupont");
      expect(body.get("email")).toBe("jean@example.fr");
      expect(body.get("project-type")).toBe("site");
      expect(body.get("goal")).toBe("Un site vitrine");
      expect(body.get("branch-one")).toBe("Mon activité");
    });
  });

  // ─── Response headers ──────────────────────────────────

  describe("response headers", () => {
    it("includes nosniff header", async () => {
      const res = await callHandler({ httpMethod: "OPTIONS" });
      expect(res.headers["X-Content-Type-Options"]).toBe("nosniff");
    });

    it("JSON responses have correct content-type", async () => {
      const res = await callHandler({ httpMethod: "GET" });
      expect(res.headers["Content-Type"]).toBe("application/json");
    });
  });
});
