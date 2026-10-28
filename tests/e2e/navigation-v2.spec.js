import { test, expect } from "@playwright/test";

// Tests only the built Preview-like site served locally by Playwright.
// No production URLs are opened and no form is submitted.
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
    await expect(page.locator('input[value="créer une solution numérique"]')).toBeChecked();
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
