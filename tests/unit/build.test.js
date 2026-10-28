// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { buildSite } = require("../../scripts/build.js");
const repository = path.resolve(import.meta.dirname, "../..");
let root;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "indxone-build-"));
  for (const entry of [
    "index.html",
    "favicon.svg",
    "img",
    "404.html",
    "mentions-legales.html",
    "politique-confidentialite.html",
    "_redirects",
    "postcss.config.js",
    "_includes",
    "css",
    "js",
    "collectivites",
    "projets",
    "merci",
    "votre-idee",
    "accessibilite",
  ]) {
    fs.cpSync(path.join(repository, entry), path.join(root, entry), { recursive: true });
  }
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

async function failsWithoutArtifact(message) {
  await expect(buildSite({ root })).rejects.toThrow(message);
  expect(fs.existsSync(path.join(root, "dist"))).toBe(false);
}

describe("production build", () => {
  it("assembles real templates, compiles CSS once and excludes internal sources", async () => {
    const sourceCSS = fs.readFileSync(path.join(root, "css/style.css"), "utf8");
    fs.writeFileSync(path.join(root, "css/optimized.css"), "STALE CSS");
    await buildSite({ root });
    const dist = path.join(root, "dist");
    const html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
    const css = fs.readFileSync(path.join(dist, "css/style.css"), "utf8");
    expect(html).toContain("<nav");
    expect(html).not.toContain("<!--#include");
    expect(css).not.toContain("@import");
    expect(css).not.toContain("STALE CSS");
    expect(css.length).toBeGreaterThan(1000);
    expect(fs.readFileSync(path.join(root, "css/style.css"), "utf8")).toBe(sourceCSS);
    expect(fs.readdirSync(path.join(dist, "css"))).toEqual(["style.css"]);
    for (const internal of ["_includes", "netlify.toml", "postcss.config.js", "scripts", "tests"])
      expect(fs.existsSync(path.join(dist, internal))).toBe(false);
    expect(fs.existsSync(path.join(dist, "mentions-legales/index.html"))).toBe(true);
    for (const [filename, size] of [
      ["favicon-16x16.png", 16],
      ["favicon-32x32.png", 32],
      ["favicon-48x48.png", 48],
      ["apple-touch-icon.png", 180],
      ["android-chrome-192x192.png", 192],
      ["android-chrome-512x512.png", 512],
    ]) {
      const metadata = await sharp(path.join(dist, "img", filename)).metadata();
      expect([metadata.width, metadata.height, metadata.format]).toEqual([size, size, "png"]);
    }
    const ico = fs.readFileSync(path.join(dist, "favicon.ico"));
    expect(ico.readUInt16LE(0)).toBe(0);
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBe(3);
    const manifest = JSON.parse(fs.readFileSync(path.join(dist, "img/site.webmanifest"), "utf8"));
    expect(manifest.icons.map((item) => item.sizes)).toEqual(["192x192", "512x512"]);
    for (const route of ["index.html", "collectivites/index.html", "projets/index.html", "votre-idee/index.html", "accessibilite/index.html", "mentions-legales/index.html", "politique-confidentialite/index.html"]) {
      const markup = fs.readFileSync(path.join(dist, route), "utf8");
      expect(markup, route).toContain('rel="manifest"');
      expect(markup, route).toContain('rel="apple-touch-icon"');
      expect(markup, route).toContain("/favicon.svg?v=brand01v2");
    }
  });
  it("rejects a missing required page", async () => {
    fs.rmSync(path.join(root, "merci/index.html"));
    await failsWithoutArtifact("Source not found");
  });
  it("rejects a missing shared include", async () => {
    fs.appendFileSync(path.join(root, "index.html"), '<!--#include file="_includes/missing.html" -->');
    await failsWithoutArtifact("Include not found");
  });
  it("rejects circular includes rather than silently publishing them", async () => {
    fs.writeFileSync(path.join(root, "_includes/cycle.html"), '<!--#include file="_includes/cycle.html" -->');
    fs.appendFileSync(path.join(root, "index.html"), '<!--#include file="_includes/cycle.html" -->');
    await failsWithoutArtifact("Max include depth");
  });
  it("rejects malformed HTML", async () => {
    fs.writeFileSync(path.join(root, "index.html"), '<div title="unterminated');
    await failsWithoutArtifact("Parse Error");
  });
  it("rejects missing CSS imports", async () => {
    fs.appendFileSync(path.join(root, "css/style.css"), '\n@import "missing.css";');
    await failsWithoutArtifact("missing.css");
  });
  it("rejects malformed CSS without a fallback bundle", async () => {
    fs.writeFileSync(path.join(root, "css/style.css"), "body { color: red;");
    await failsWithoutArtifact("Unclosed block");
  });
  it("rejects a missing primary script", async () => {
    fs.rmSync(path.join(root, "js/main.js"));
    await failsWithoutArtifact("Source not found");
  });
});
