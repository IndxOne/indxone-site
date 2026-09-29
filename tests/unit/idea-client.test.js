// @vitest-environment node
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { afterEach, describe, expect, it, vi } from "vitest";

const html = readFileSync(new URL("../../votre-idee/index.html", import.meta.url), "utf8");
const source = readFileSync(new URL("../../js/votre-idee.js", import.meta.url), "utf8");
const key = "indxone:votre-idee:draft:v1";
const id = "00000000-0000-4000-8000-000000000001";
const windows = [];
afterEach(() => {
  for (const window of windows.splice(0)) window.close();
});

function boot(draft) {
  const navigation = vi.fn();
  const console = new VirtualConsole();
  console.on("jsdomError", navigation);
  const dom = new JSDOM(html, {
    url: "https://preview.example/votre-idee/",
    runScripts: "outside-only",
    virtualConsole: console,
  });
  const { window } = dom;
  windows.push(window);
  window.scrollTo = vi.fn();
  window.fetch = vi.fn();
  if (draft) window.localStorage.setItem(key, JSON.stringify(draft));
  window.eval(source);
  const form = window.document.querySelector("#idea-form");
  return { window, form, navigation, fetch: window.fetch, status: window.document.querySelector("#idea-form-status") };
}
function complete({ form, window }) {
  const choice = form.querySelector('input[value="site internet"]');
  choice.checked = true;
  choice.dispatchEvent(new window.Event("change", { bubbles: true }));
  for (const [name, value] of Object.entries({
    goal: "Présenter mon activité",
    audience: "Clients",
    "branch-one": "Conseil SI",
    "branch-two": "Présentation et contact",
    style: "Sobre",
    start: "Dans le mois",
    support: "Jusqu'à la mise en ligne",
    name: "Koffi",
    email: "test@example.com",
  }))
    form.elements.namedItem(name).value = value;
  form.elements.namedItem("consent").checked = true;
  form.dispatchEvent(new window.Event("input", { bubbles: true }));
  for (let step = 0; step < 6; step++) form.querySelector(`[data-step="${step}"] .idea-next`).click();
  expect(form.querySelector('[data-step="6"]').hidden).toBe(false);
}
async function submit(app, response) {
  app.fetch.mockResolvedValueOnce({ ok: response.ok !== false, json: async () => response.body });
  app.form.dispatchEvent(new app.window.Event("submit", { bubbles: true, cancelable: true }));
  await vi.waitFor(() => expect(app.form.querySelector('button[type="submit"]').disabled).toBe(false));
  return JSON.parse(app.fetch.mock.calls.at(-1)[1].body);
}

describe("actual guided form client", () => {
  it("restores an old draft start but sends a fresh submission time", async () => {
    const oldStart = new Date(Date.now() - 4 * 86400000).toISOString();
    const app = boot({ started_at: oldStart, submission_id: id });
    complete(app);
    const payload = await submit(app, { body: { ok: false, simulated: true } });
    expect(payload.started_at).toBe(oldStart);
    expect(Math.abs(Date.now() - Date.parse(payload.created_at))).toBeLessThan(3000);
    expect(payload.created_at).not.toBe(oldStart);
    expect(payload.submission_id).toBe(id);
  });
  it("transmits honeypot without storing its value in the draft", async () => {
    const app = boot();
    complete(app);
    app.form.elements.namedItem("company_name").value = "bot-filled";
    const payload = await submit(app, { body: { ok: false, simulated: true } });
    expect(payload.company_name).toBe("bot-filled");
    expect(JSON.parse(app.window.localStorage.getItem(key))).not.toHaveProperty("company_name");
  });
  it("preserves the submission UUID across failed retry and reload", async () => {
    const app = boot();
    complete(app);
    const first = await submit(app, { ok: false, body: { error: "Connexion interrompue" } });
    const retry = await submit(app, { ok: false, body: { error: "Connexion interrompue" } });
    expect(first.submission_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(retry.submission_id).toBe(first.submission_id);
    const restored = boot(JSON.parse(app.window.localStorage.getItem(key)));
    complete(restored);
    const reloaded = await submit(restored, { body: { ok: false, simulated: true } });
    expect(reloaded.submission_id).toBe(first.submission_id);
  });
  it("shows explicit preview simulation, retains draft and never redirects", async () => {
    const app = boot();
    complete(app);
    await submit(app, {
      body: { ok: false, simulated: true, message: "Mode Preview : demande validée, aucun envoi effectué." },
    });
    expect(app.status.textContent).toContain("aucun envoi effectué");
    expect(app.window.localStorage.getItem(key)).not.toBeNull();
    expect(app.navigation).not.toHaveBeenCalled();
    expect(app.window.location.pathname).toBe("/votre-idee/");
  });
  it("does not restore saved consent or honeypot and never persists consent", () => {
    const app = boot({ consent: "on", company_name: "old bot", name: "Koffi" });
    expect(app.form.elements.namedItem("consent").checked).toBe(false);
    expect(app.form.elements.namedItem("company_name").value).toBe("");
    expect(app.form.elements.namedItem("name").value).toBe("Koffi");
    expect(JSON.parse(app.window.localStorage.getItem(key))).not.toHaveProperty("consent");
  });
  it("redirects and removes the draft only after confirmed real delivery", async () => {
    const app = boot();
    complete(app);
    await submit(app, { body: { ok: true } });
    expect(app.window.localStorage.getItem(key)).toBeNull();
    // JSDOM reports attempted navigation, proving the same detector used above is active.
    expect(app.navigation).toHaveBeenCalledTimes(1);
    expect(app.navigation.mock.calls[0][0].message).toContain("navigation");
  });
});
