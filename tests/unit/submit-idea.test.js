// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@netlify/blobs", () => ({ getStore: vi.fn() }));
import { getStore } from "@netlify/blobs";
import idea from "../../netlify/functions/submit-idea.mjs";
import contact from "../../netlify/functions/contact-api.mjs";

const id = "00000000-0000-4000-8000-000000000001";
const dates = () => ({ started_at: new Date(Date.now() - 5000).toISOString(), created_at: new Date().toISOString() });
const payload = () => ({
  form_version: "1.0.0",
  submission_id: id,
  project_type: "besoin",
  ...dates(),
  contact: { nom: "Koffi", email: "test@example.com" },
  consent: { accepted: true, accepted_at: new Date().toISOString() },
  responses: {
    trunk: {
      goal: "Présenter une activité",
      audience: "Clients",
      style: "Sobre",
      start: "Dans le mois",
      support: "Jusqu'à la mise en production",
    },
    conditional: { branch_one: "Conseil SI", branch_two: "Services et contact" },
  },
});
const post = (body, handler = idea, context = { deploy: { context: "production" } }) =>
  handler(
    new Request("https://indxone.com/api/submit-idee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    context
  );
let records, fetchMock;
beforeEach(() => {
  vi.clearAllMocks();
  records = new Map();
  let sequence = 0;
  getStore.mockReturnValue({
    getWithMetadata: vi.fn(async (key) => records.get(key) || null),
    setJSON: vi.fn(async (key, value, options) => {
      const previous = records.get(key);
      if ((options.onlyIfNew && previous) || (options.onlyIfMatch && previous?.etag !== options.onlyIfMatch))
        return { modified: false };
      const etag = String(++sequence);
      records.set(key, { data: value, etag });
      return { modified: true, etag };
    }),
  });
  fetchMock = vi.fn(async () => new Response("ok", { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("NETLIFY_FORM_SITE_URL", "https://indxone.com");
});
describe("actual submission handlers", () => {
  it.each([null, [], "string", 1])("rejects non-object JSON %j without throwing", async (body) => {
    expect((await post(body)).status).toBe(400);
    expect((await post(body, contact)).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(["contact", "consent", "responses"])("rejects absent %s", async (key) => {
    const data = payload();
    delete data[key];
    expect((await post(data)).status).toBe(400);
  });
  it("rejects object names, missing answers and oversized optional fields", async () => {
    const data = payload();
    data.contact.nom = {};
    expect((await post(data)).status).toBe(400);
    data.contact.nom = "Koffi";
    delete data.responses.trunk.goal;
    expect((await post(data)).status).toBe(400);
    data.responses.trunk.goal = "Site";
    data.contact.phone = "x".repeat(51);
    expect((await post(data)).status).toBe(400);
  });
  it("accepts a minimal submission with only the goal answered", async () => {
    const data = payload();
    data.responses.trunk = { goal: "Cadrer un projet" };
    data.responses.conditional = {};
    expect((await post(data)).status).not.toBe(400);
    data.responses.trunk.support = "valeur inconnue";
    expect((await post(data)).status).toBe(400);
  });
  it("blocks honeypot submissions and fast/future/invalid timestamps", async () => {
    for (const patch of [
      { company_name: "spam" },
      { started_at: new Date().toISOString() },
      { created_at: "invalid" },
      { started_at: new Date(Date.now() + 60000).toISOString() },
    ]) {
      expect((await post({ ...payload(), ...patch })).status).toBe(400);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("accepts a draft started days ago with fresh submitted date", async () => {
    const response = await post({ ...payload(), started_at: new Date(Date.now() - 3 * 86400000).toISOString() });
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("enforces raw body limit and same-origin", async () => {
    expect((await post({ data: "x".repeat(33000) })).status).toBe(413);
    const req = new Request("https://indxone.com/api/submit-idee", {
      method: "POST",
      headers: { origin: "https://other.example", "Content-Type": "application/json" },
      body: JSON.stringify(payload()),
    });
    expect((await idea(req, {})).status).toBe(403);
  });
  it.each(["deploy-preview", "branch-deploy", "dev", undefined])(
    "simulates %s with no side effects",
    async (deployContext) => {
      const response = await post(payload(), idea, { deploy: { context: deployContext } });
      expect(await response.json()).toMatchObject({ ok: false, simulated: true });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(getStore).not.toHaveBeenCalled();
    }
  );
  it("deduplicates persisted retry, even with a fresh submission timestamp", async () => {
    expect((await post(payload())).status).toBe(200);
    const retry = payload();
    retry.created_at = new Date(Date.now() + 100).toISOString();
    retry.consent.accepted_at = retry.created_at;
    expect(await (await post(retry)).json()).toMatchObject({ ok: true, duplicate: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.stringify([...records.values()])).not.toContain("test@example.com");
  });
  it("rejects reused identity with a different payload", async () => {
    await post(payload());
    const data = payload();
    data.contact.nom = "Autre";
    expect((await post(data)).status).toBe(409);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("allows only one simultaneous sender", async () => {
    const results = await Promise.all([post(payload()), post(payload())]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("blocks retries after uncertain upstream outcome", async () => {
    fetchMock.mockRejectedValueOnce(new Error("timeout"));
    expect((await post(payload())).status).toBe(502);
    expect((await post(payload())).status).toBe(409);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("retries an explicit upstream failure", async () => {
    fetchMock.mockResolvedValueOnce(new Response("error", { status: 500 }));
    expect((await post(payload())).status).toBe(502);
    expect((await post(payload())).status).toBe(200);
  });
  it("fails closed without a durable store", async () => {
    getStore.mockImplementationOnce(() => {
      throw new Error("store unavailable");
    });
    expect((await post(payload())).status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("validates contact types, options, timing and consent", async () => {
    const data = {
      submission_id: id,
      ...dates(),
      nom: "Koffi",
      email: "test@example.com",
      lang: "fr",
      sujet: "Projet AMOA / Architecture SI",
      message: "Un projet pour notre PME",
      consent: "on",
    };
    expect((await post(data, contact)).status).toBe(200);
    for (const patch of [
      { nom: {} },
      { message: [] },
      { prenom: "x".repeat(201) },
      { sujet: "inconnu" },
      { consent: false },
      { started_at: undefined },
    ])
      expect((await post({ ...data, ...patch }, contact)).status).toBe(400);
  });
});
