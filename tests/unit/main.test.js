import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Helper: extract functions from main.js by re-defining them in test scope
// This avoids polluting the global DOM with the full script.
// ---------------------------------------------------------------------------

function getCurrentTheme() {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return savedTheme || (systemPrefersDark ? "dark" : "light");
}

function animateValue(element) {
  const text = element.textContent;
  const hasNumber = /\d+/.test(text);
  if (!hasNumber) return;
  const match = text.match(/(\d+)/);
  if (!match) return;
  const targetValue = parseInt(match[1], 10);
  const prefix = text.substring(0, text.indexOf(match[1]));
  const suffix = text.substring(text.indexOf(match[1]) + match[1].length);
  let currentValue = 0;
  const duration = 1000;
  const steps = 20;
  const increment = targetValue / steps;
  const stepDuration = duration / steps;
  const timer = setInterval(() => {
    currentValue += increment;
    if (currentValue >= targetValue) {
      currentValue = targetValue;
      clearInterval(timer);
    }
    element.textContent = prefix + Math.floor(currentValue) + suffix;
  }, stepDuration);
  return timer;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

function mockMatchMedia(prefersDark) {
  const mql = { matches: prefersDark, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  window.matchMedia = vi.fn().mockReturnValue(mql);
}

describe("getCurrentTheme()", () => {
  beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
  });

  it("returns the saved theme from localStorage when present", () => {
    localStorage.setItem("theme", "dark");
    expect(getCurrentTheme()).toBe("dark");
  });

  it("falls back to system preference when localStorage is empty", () => {
    mockMatchMedia(true);
    expect(getCurrentTheme()).toBe("dark");
  });

  it("returns 'light' when nothing is saved and system does not prefer dark", () => {
    localStorage.removeItem("theme");
    expect(getCurrentTheme()).toBe("light");
  });
});

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
    el.textContent = "8+";
    animateValue(el);
    vi.advanceTimersByTime(1000);
    expect(el.textContent).toBe("8+");
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
