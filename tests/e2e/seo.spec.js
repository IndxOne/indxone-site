import { test, expect } from "@playwright/test";

// Set SEO_PREVIEW_URL to a verified non-production deploy to repeat this smoke.
const base = process.env.SEO_PREVIEW_URL || "http://localhost:8000";
const routes = ["/", "/collectivites/", "/projets/", "/votre-idee/"];

for (const route of routes) {
  test(`SEO smoke ${route}`, async ({ page }) => {
    const response = await page.goto(`${base}${route}`);
    expect(response.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe(route);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
    const canonical = page.locator('link[rel="canonical"]');
    if (route === "/votre-idee/") {
      await expect(canonical).toHaveAttribute("href", "https://indxone.com/votre-idee/");
    } else {
      // Audit established no explicit canonical on these pages; preserve that fact.
      await expect(canonical).toHaveCount(0);
    }
    if (route === "/collectivites/") {
      const values = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(values).toHaveLength(1);
      const graph = JSON.parse(values[0])["@graph"];
      expect(graph.map((node) => node["@type"])).toEqual(["Service"]);
      expect(graph[0].offers.map((offer) => offer.price)).toEqual(["1490", "3490", "6490"]);
    }
  });
}

test("SEO smoke sitemap: valid XML and all seven final URLs served without redirects", async ({ page, request }) => {
  const response = await request.get(`${base}/sitemap.xml`, { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  const xml = await response.text();
  await page.goto(`${base}/`);
  const parsed = await page.evaluate((source) => {
    const document = new DOMParser().parseFromString(source, "application/xml");
    return {
      errors: document.querySelectorAll("parsererror").length,
      namespace: document.documentElement.namespaceURI,
      locations: [...document.querySelectorAll("loc")].map((loc) => loc.textContent),
    };
  }, xml);
  expect(parsed.errors).toBe(0);
  expect(parsed.namespace).toBe("http://www.sitemaps.org/schemas/sitemap/0.9");
  expect(parsed.locations.sort()).toEqual(
    [...routes, "/mentions-legales/", "/politique-confidentialite/", "/accessibilite/"]
      .map((route) => `https://indxone.com${route}`)
      .sort()
  );
  for (const location of parsed.locations) {
    // Canonicals stay on indxone.com; network checks target only this test deploy.
    const final = await request.get(`${base}${new URL(location).pathname}`, { maxRedirects: 0 });
    expect(final.status(), location).toBe(200);
  }
});

test("SEO smoke robots: accessible, one group and canonical sitemap", async ({ request }) => {
  const response = await request.get(`${base}/robots.txt`, { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  const robots = await response.text();
  expect(robots.match(/^User-agent:/gm)).toHaveLength(1);
  expect(robots).toContain("Sitemap: https://indxone.com/sitemap.xml");
  expect(robots).not.toMatch(/Crawl-delay|Request-rate|Clean-param/);
  for (const route of ["/admin/", "/.env", "/node_modules/", "/.git/", "/.codex/", "/.agents/"]) {
    expect(robots).toContain(`Disallow: ${route}`);
  }
});
