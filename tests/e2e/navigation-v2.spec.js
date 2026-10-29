import { test, expect } from "@playwright/test";

// Tests only the built Preview-like site served locally by Playwright.
// No production URLs are opened and no form is submitted.
test("communal demonstration is never presented as official publication", async ({ page }) => {
  await page.goto("/");
  const proof = page.locator(".terrain-list").getByText("Démonstration communale");
  await expect(proof).toBeVisible();
  await expect(page.locator(".terrain-list")).toContainText("présentée à la mairie pour validation");
  await expect(page.locator(".terrain-list")).not.toContainText("Site officiel de Mons-en-Laonnois");
});

test("product ecosystem explains three internal components without promising full integration", async ({ page }) => {
  await page.goto("/produits/");
  const section = page.locator(".products-foundation");
  await expect(section.getByText("Notre écosystème")).toBeVisible();
  await expect(section.getByRole("heading", { name: "Des solutions indépendantes, une architecture cohérente." })).toBeVisible();
  await expect(section.locator("dt")).toHaveCount(3);
  for (const component of ["Identity", "Launcher", "Control Center"]) {
    await expect(section.locator("dt").getByText(component, { exact: true })).toBeVisible();
  }
  await expect(section).toContainText("Ces composants évoluent progressivement");
  await expect(section).not.toContainText("Un socle commun, des usages distincts.");
  await expect(section.locator("a")).toHaveCount(0);
});

test.describe("Site V2 — homepage responsive information", () => {
  test("desktop centers CTA and all four availability fields", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const availability = page.locator(".hero .dispo-card");
    await expect(availability).toBeVisible();
    await expect(availability.locator(".dispo-item")).toHaveCount(4);
    await expect(availability).toHaveCSS("grid-template-columns", /px/);
    for (const item of await availability.locator(".dispo-item").all()) {
      await expect(item).toHaveCSS("text-align", "center");
    }
    await expect(page.locator(".nav-cta")).toHaveCSS("text-align", "center");
  });

  for (const width of [320, 375, 390]) {
    test(`mobile ${width}px preserves location and 2×2 availability`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/");
      const stats = page.locator(".hero-stats-compact");
      await expect(stats.locator(".h-stat")).toHaveCount(3);
      const location = stats.locator(".h-stat").nth(2);
      await expect(location).toBeVisible();
      await expect(location).toContainText("Aisne");
      await expect(location).toContainText("À distance");

      const availability = page.locator(".hero .dispo-card");
      await expect(availability).toBeVisible();
      await expect(availability.locator(".dispo-item")).toHaveCount(4);
      await expect(availability).toContainText("580 €");
      await expect(availability).toContainText("Immédiat");
      await availability.scrollIntoViewIfNeeded();
      const columns = await availability.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length);
      expect(columns).toBe(2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  }
});

test.describe("Site V2 — navigation and contact journeys", () => {
  test("menu Produits opens the curated catalog and CTA leads to guided contact", async ({ page }) => {
    await page.goto("/");
    await page.locator(".nav-links").getByRole("link", { name: "Produits" }).click();
    await expect(page).toHaveURL(/\/produits\/$/);
    await expect(page.locator(".products-grid > article")).toHaveCount(5);
    await expect(page.locator(".products-foundation-grid dt")).toHaveCount(3);
    await expect(page.locator('a[href*="famille.indxone.com"]')).toHaveCount(0);
    await expect(page.locator('a[href*="diagnostic.indxone.com"]')).toHaveCount(0);
    await page.getByRole("link", { name: /Parlons de votre besoin/ }).click();
    await expect(page).toHaveURL(/\/votre-idee\/$/);
    await expect(page.locator("#idea-form")).toBeVisible();
  });

  test("collectivités devis opens a preselected guided journey", async ({ page }) => {
    await page.goto("/collectivites/");
    await page.getByRole("link", { name: /Recevoir votre devis/ }).first().click();
    await expect(page).toHaveURL(/\/votre-idee\/\?type=collectivite$/);
    await expect(page.locator('input[type="radio"][name="project-type-choice"][value="créer une solution numérique"]')).toBeChecked();
    await expect(page.locator("#idea-form")).toBeVisible();
  });

  test("municipal FAQ responds to keyboard interaction and updates accessibility state", async ({ page }) => {
    await page.goto("/collectivites/");
    const faq = page.locator(".faq-q").first();
    await expect(faq).toHaveAttribute("aria-expanded", "true");
    await faq.focus();
    await page.keyboard.press("Enter");
    await expect(faq).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press("Enter");
    await expect(faq).toHaveAttribute("aria-expanded", "true");
  });

  test("mobile legal-page menu works and preserves links to products", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/mentions-legales/");
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.locator("#mobile-menu")).toHaveAttribute("data-open", "true");
    await page.locator("#mobile-menu").getByRole("link", { name: "Produits" }).click();
    await expect(page).toHaveURL(/\/produits\/$/);
  });

  test("404 contact CTA reaches guided contact form", async ({ page }) => {
    await page.goto("/404.html");
    await page.getByRole("link", { name: "Contactez-moi" }).click();
    await expect(page).toHaveURL(/\/votre-idee\/$/);
  });

  test("home teaser CTA and legal/footer links remain internal", async ({ page, request }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Explorer tous nos produits/ }).click();
    await expect(page).toHaveURL(/\/produits\/$/);
    for (const route of ["/collectivites/", "/projets/", "/produits/", "/votre-idee/", "/mentions-legales/", "/politique-confidentialite/"]) {
      const response = await request.get(route);
      expect(response.status(), route).toBe(200);
    }
  });
});
