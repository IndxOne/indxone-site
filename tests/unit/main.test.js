import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { readFileSync } from "node:fs";

const source = readFileSync("js/main.js", "utf8");
const { animateValue, debounce, throttle, isInViewport, initFormEnhancements } = new Function(
  "document",
  "window",
  "console",
  source + "\nreturn { animateValue, debounce, throttle, isInViewport, initFormEnhancements };"
)(document, window, { log() {} });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("animateValue()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("animates a numeric value from 0 to target", () => {
    const el = document.createElement("strong");
    el.textContent = "100";
    animateValue(el);
    vi.advanceTimersByTime(1000);
    expect(el.textContent).toBe("100");
  });

  it("preserves prefix and suffix text around the number", () => {
    const el = document.createElement("strong");
    el.textContent = "15+";
    animateValue(el);
    vi.advanceTimersByTime(1000);
    expect(el.textContent).toBe("15+");
  });

  it("does nothing when element has no number", () => {
    const el = document.createElement("strong");
    el.textContent = "Hello";
    animateValue(el);
    expect(el.textContent).toBe("Hello");
  });
});

describe("debounce()", () => {
  it("calls the function after the wait period", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 200);
    debounced();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it("resets the timer on repeated calls", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 200);
    debounced();
    vi.advanceTimersByTime(100);
    debounced();
    vi.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});

describe("throttle()", () => {
  it("calls the function immediately on first invocation", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 200);
    throttled();
    expect(fn).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it("ignores subsequent calls within the limit window", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 200);
    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(200);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});

describe("isInViewport()", () => {
  it("returns true when element is fully within viewport", () => {
    const el = document.createElement("div");
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      top: 0,
      left: 0,
      bottom: 500,
      right: 800,
      width: 800,
      height: 500,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    expect(isInViewport(el)).toBe(true);
  });

  it("returns false when element is above viewport", () => {
    const el = document.createElement("div");
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      top: -100,
      left: 0,
      bottom: -50,
      right: 800,
      width: 800,
      height: 50,
      x: 0,
      y: -100,
      toJSON: () => ({}),
    });
    expect(isInViewport(el)).toBe(false);
  });

  it("returns false when element is to the left of viewport", () => {
    const el = document.createElement("div");
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      top: 0,
      left: -50,
      bottom: 500,
      right: 100,
      width: 150,
      height: 500,
      x: -50,
      y: 0,
      toJSON: () => ({}),
    });
    expect(isInViewport(el)).toBe(false);
  });
});

describe("actual contact form script", () => {
  beforeEach(() => {
    document.body.innerHTML = `<form data-netlify="true">
      <input name="nom" value="Test"><input name="email" value="test@example.org">
      <input type="checkbox" name="consent" checked>
      <button type="submit">Envoyer</button></form>`;
    vi.stubGlobal("fetch", vi.fn());
    initFormEnhancements();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });
  const submit = () => document.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true }));
  const settled = () => new Promise((resolve) => setTimeout(resolve, 0));
  it("shows server error without trying to join absent details", async () => {
    fetch.mockResolvedValue({ ok: false, status: 500, json: async () => ({ error: "Erreur serveur" }) });
    submit();
    await settled();
    expect(document.querySelector('[role="alert"]').textContent).toBe("Erreur serveur");
    expect(document.querySelector("button").disabled).toBe(false);
  });
  it("keeps the same request ID on retry and sends boolean consent", async () => {
    fetch.mockResolvedValue({ ok: false, status: 502, json: async () => ({ error: "Transmission" }) });
    submit();
    await settled();
    submit();
    await settled();
    const payloads = fetch.mock.calls.map((call) => JSON.parse(call[1].body));
    expect(payloads[0].submission_id).toMatch(/^[0-9a-f-]{36}$/);
    expect(payloads[1].submission_id).toBe(payloads[0].submission_id);
    expect(payloads[0].consent).toBe(true);
    expect(payloads[0].started_at).toBeTruthy();
  });
  it("shows honest preview simulation without redirect or disabling retry", async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ ok: false, simulated: true }) });
    submit();
    await settled();
    expect(document.querySelector('[role="status"]').textContent).toContain("aucune demande envoyée");
    expect(document.querySelector("button").disabled).toBe(false);
    expect(document.querySelector("input[name=nom]").value).toBe("Test");
  });
});
