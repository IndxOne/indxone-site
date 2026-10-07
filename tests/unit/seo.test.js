// @vitest-environment node
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { JSDOM } from "jsdom";

const require = createRequire(import.meta.url);
const { assembleFile } = require("../../scripts/assemble.js");
const root = path.resolve(import.meta.dirname, "../..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const pages = {
  "/": "index.html",
  "/collectivites/": "collectivites/index.html",
  "/projets/": "projets/index.html",
  "/votre-idee/": "votre-idee/index.html",
  "/mentions-legales/": "mentions-legales.html",
  "/politique-confidentialite/": "politique-confidentialite.html",
  "/accessibilite/": "accessibilite/index.html",
};
const redirects = read("_redirects")
  .split("\n")
  .filter((line) => line.trim() && !line.trim().startsWith("#"))
  .map((line) => line.trim().split(/\s+/));
const robots = read("robots.txt")
  .split("\n")
  .map((line) => line.split("#")[0].trim())
  .filter(Boolean)
  .map((line) => {
    const colon = line.indexOf(":");
    return [line.slice(0, colon).toLowerCase(), line.slice(colon + 1).trim()];
  });
function blocked(urlPath) {
  return robots
    .filter(([key]) => key === "disallow")
    .some(([, rule]) => {
      const expression = rule.replace(/[.+?^{}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
      return new RegExp(`^${expression}`).test(urlPath);
    });
}
const html = (file) => new JSDOM(assembleFile(path.join(root, file), root)).window.document;
function graphNodes(value) {
  if (!value || typeof value !== "object") return [];
  return [value, ...Object.values(value).flatMap(graphNodes)];
}

describe("SEO-002A technical hygiene", () => {
  it("parses a valid sitemap with exactly the public, indexable final URLs", () => {
    const xml = new JSDOM(read("sitemap.xml"), { contentType: "application/xml" }).window.document;
    expect(xml.documentElement.localName).toBe("urlset");
    expect(xml.documentElement.namespaceURI).toBe("http://www.sitemaps.org/schemas/sitemap/0.9");
    const urls = [...xml.querySelectorAll("url")];
    const locations = urls.map((entry) => entry.querySelector("loc").textContent);
    expect(new Set(locations).size).toBe(locations.length);
    expect(locations.sort()).toEqual(
      Object.keys(pages)
        .map((route) => `https://indxone.com${route}`)
        .sort()
    );
    for (const entry of urls) {
      const url = new URL(entry.querySelector("loc").textContent);
      expect(url.protocol).toBe("https:");
      expect(url.host).toBe("indxone.com");
      expect(url.search + url.hash).toBe("");
      expect(url.pathname.endsWith("/")).toBe(true);
      expect(redirects.filter(([from, , status]) => from === url.pathname && /^3\d\d/.test(status))).toEqual([]);
      expect(blocked(url.pathname)).toBe(false);
      const document = html(pages[url.pathname]);
      expect(document.querySelector('meta[name="robots"]')?.content || "").not.toMatch(/noindex/i);
      const canonicals = document.querySelectorAll('link[rel="canonical"]');
      expect(canonicals, url.href).toHaveLength(1);
      expect(canonicals[0].getAttribute("href")).toBe(url.href);
      expect(entry.querySelector("lastmod").textContent).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("aligns every public canonical, Open Graph URL and supported hreflang", () => {
    for (const [route, file] of Object.entries(pages)) {
      const document = html(file);
      const expected = `https://indxone.com${route}`;
      const ogUrls = document.querySelectorAll('meta[property="og:url"]');
      expect(ogUrls, route).toHaveLength(1);
      expect(ogUrls[0].content).toBe(expected);
      const links = [...document.querySelectorAll('link[rel="alternate"][hreflang]')];
      const languages = links.map((link) => link.hreflang);
      expect(new Set(languages).size).toBe(languages.length);
      for (const link of links) {
        expect(["fr", "x-default"]).toContain(link.hreflang);
        expect(link.getAttribute("href")).toBe(expected);
        const target = new URL(link.href);
        expect(target.protocol).toBe("https:");
        expect(target.host).toBe("indxone.com");
        expect(pages).toHaveProperty(target.pathname);
        expect(html(pages[target.pathname]).documentElement.lang).toBe("fr");
        expect(redirects.filter(([from, , status]) => from === target.pathname && /^3\d\d/.test(status))).toEqual([]);
      }
    }
  });

  it("aligns votre-idee canonical with its explicit slash redirect", () => {
    expect(redirects).toContainEqual(["/votre-idee", "/votre-idee/", "301"]);
    expect(html(pages["/votre-idee/"]).querySelector('link[rel="canonical"]').href).toBe(
      "https://indxone.com/votre-idee/"
    );
  });

  it("keeps valid Service/Offer JSON-LD and no incomplete Product", () => {
    const scripts = [...html(pages["/collectivites/"]).querySelectorAll('script[type="application/ld+json"]')];
    expect(scripts.length).toBeGreaterThan(0);
    const nodes = scripts.flatMap((script) => graphNodes(JSON.parse(script.textContent)));
    const services = nodes.filter((node) => node["@type"] === "Service");
    expect(services).toHaveLength(1);
    expect(services[0].offers.map((offer) => [offer["@type"], offer.price, offer.priceCurrency])).toEqual([
      ["Offer", "1490", "EUR"],
      ["Offer", "3490", "EUR"],
      ["Offer", "6490", "EUR"],
    ]);
    expect(nodes.filter((node) => [].concat(node["@type"] || []).includes("Product"))).toEqual([]);
    expect(nodes.some((node) => node.review || node.aggregateRating)).toBe(false);
  });

  it("uses one standard robots group with the canonical sitemap and technical exclusions", () => {
    expect(robots.filter(([key]) => key === "user-agent")).toEqual([["user-agent", "*"]]);
    expect(robots.filter(([key]) => key === "sitemap")).toEqual([["sitemap", "https://indxone.com/sitemap.xml"]]);
    expect(robots.every(([key]) => ["user-agent", "disallow", "allow", "sitemap"].includes(key))).toBe(true);
    for (const route of ["/admin/", "/.env", "/node_modules/", "/.git/", "/.codex/", "/.agents/"]) {
      expect(blocked(route), route).toBe(true);
    }
    for (const route of ["/internal.php", "/internal.sh", "/internal.json", "/internal.yml", "/internal.yaml"]) {
      expect(blocked(route), route).toBe(true);
    }
    for (const source of Object.values(pages)) {
      for (const element of html(source).querySelectorAll("script[src], link[href], img[src]")) {
        const url = new URL(element.getAttribute("src") || element.getAttribute("href"), "https://indxone.com");
        if (url.host === "indxone.com") expect(blocked(url.pathname + url.search), url.href).toBe(false);
      }
    }
  });
});
