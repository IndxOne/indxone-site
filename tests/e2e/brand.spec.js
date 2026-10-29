import { test, expect } from "@playwright/test";

// BRAND-01-V2: non-production checks of the built Site, including real HTTP assets.
const publicPages = [
  "/", "/collectivites/", "/projets/", "/produits/", "/votre-idee/",
  "/mentions-legales/", "/politique-confidentialite/", "/accessibilite/",
];

test("all public pages expose exactly one shared brand declaration", async ({ page }) => {
  for (const route of publicPages) {
    await page.goto(route);
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveCount(1);
    await expect(page.locator('link[rel="icon"][sizes="16x16"]')).toHaveCount(1);
    await expect(page.locator('link[rel="icon"][sizes="32x32"]')).toHaveCount(1);
  }
});

test("brand icons and marketing manifest are served from generated build", async ({ request }) => {
  for (const icon of [
    "/favicon.svg",
    "/favicon.ico",
    "/img/favicon-16x16.png",
    "/img/favicon-32x32.png",
    "/img/favicon-48x48.png",
    "/img/apple-touch-icon.png",
    "/img/android-chrome-192x192.png",
    "/img/android-chrome-512x512.png",
  ]) {
    const response = await request.get(icon);
    expect(response.status(), icon).toBe(200);
    expect((await response.body()).length, icon).toBeGreaterThan(100);
  }
  const response = await request.get("/img/site.webmanifest");
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.display).toBe("browser");
  expect(data.icons.map((icon) => icon.sizes)).toEqual(["192x192", "512x512"]);
});

for (const width of [320, 375, 390, 1440]) {
  test(`Site smoke at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    const sizes = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    }));
    expect(sizes.documentWidth).toBeLessThanOrEqual(sizes.viewportWidth + 1);
  });
}
