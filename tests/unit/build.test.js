// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { buildSite } = require("../../scripts/build.js");
const repository = path.resolve(import.meta.dirname, "../..");
let root;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "indxone-build-"));
  for (const entry of [
    "index.html",
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
