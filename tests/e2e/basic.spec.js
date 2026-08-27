import { test, expect } from "@playwright/test";

test.describe("INDXONE site — homepage", () => {
  test("has correct title and description meta tags", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/INDXONE.*Donnons vie à votre idée/);
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute("content", /transforme vos idées/i);
  });

  test("navigation links are present and work", async ({ page }) => {
    await page.goto("/");
    const navLinks = page.locator(".nav-links a");
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(4);

    // Click the "Réalisations" link and verify we navigate
    await navLinks.filter({ hasText: "Réalisations" }).first().click();
    await expect(page).toHaveURL(/projets/);
  });

  test("contact is guided to the project form", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#contact")).toBeVisible();
    await expect(page.locator('#contact a[href="/votre-idee"]')).toHaveText(/Obtenir une estimation/);
    await expect(page.locator(".contact-form")).toHaveCount(0);
  });

  test("skip link is present and focusable", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.locator(".skip-link");
    await expect(skipLink).toHaveAttribute("href", "#main-content");
    await expect(skipLink).toHaveText("Aller au contenu principal");

    // Simulate focus
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
  });

  test("mobile navigation opens, locks the page, and closes with Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const toggle = page.locator(".mobile-menu-toggle");
    const menu = page.locator("#mobile-menu");
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(menu).toHaveAttribute("data-open", "true");
    await expect(page.locator(".nav-mobile-cta")).toBeVisible();
    await expect(page.locator("body")).toHaveClass(/menu-open/);
    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("data-open", "false");
  });

  test("guided idea form loads its dedicated styles on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/votre-idee/");
    const form = page.locator(".idea-form");
    await expect(form).toBeVisible();
    await expect(form).toHaveCSS("box-sizing", "border-box");
    await expect(page.locator(".idea-choice")).toHaveCount(5);
    await expect(form).toHaveAttribute("data-custom-submit", "true");
    const formWidth = await form.evaluate((element) => element.getBoundingClientRect().width);
    expect(formWidth).toBeLessThanOrEqual(390);
  });

  test("homepage keeps the compact eight-block mobile journey", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator("section:visible")).toHaveCount(8);
    await expect(page.locator("#expertise")).toBeHidden();
    await expect(page.locator("#cas-usage")).toBeHidden();
    await expect(page.locator(".corporate-proof")).toBeHidden();
    await expect(page.locator("#projets")).toBeVisible();
    await expect(page.locator("#lab")).toBeVisible();
  });

  test("projects CTA and footer stay simple and touch-friendly", async ({ page }) => {
    await page.goto("/projets/");
    await expect(page.locator(".cta-section .btn-primary")).toHaveText(/Démarrer un projet/);
    await expect(page.locator(".cta-section a[href^='https://hub']")).toHaveCount(0);
    await expect(page.locator(".projets-footer")).toHaveCSS("background-color", "rgb(20, 32, 43)");
    await expect(page.locator(".projets-footer a").first()).toHaveCSS("min-height", "44px");
  });

  test("JSON-LD structured data exists", async ({ page }) => {
    await page.goto("/");
    const jsonld = page.locator('script[type="application/ld+json"]');
    await expect(jsonld).toHaveCount(1);

    const content = await jsonld.textContent();
    const parsed = JSON.parse(content);
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("WebSite");
    expect(parsed["name"]).toBe("INDXONE");
  });
});

test.describe("INDXONE site — errors", () => {
  test("unknown URL returns 404", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist-xyz");
    expect(response?.status()).toBe(404);
  });
});

test.describe("INDXONE site — projets page", () => {
  test("project page presents the simplified portfolio", async ({ page }) => {
    await page.goto("/projets/");
    await expect(page.locator(".filter-bar")).toBeHidden();
    await expect(page.locator(".project-grid")).toBeVisible();
    await expect(page.locator(".project-card")).toHaveCount(3);
  });
});

test.describe("INDXONE site — collectivites page", () => {
  test("has pricing section with offers", async ({ page }) => {
    await page.goto("/collectivites/");
    await expect(page.locator(".pricing-grid")).toBeVisible();
    const offerCards = page.locator(".pc");
    await expect(offerCards).toHaveCount(3);
    await expect(offerCards.nth(0)).toContainText("Commune Essentielle");
    await expect(offerCards.nth(1)).toContainText("Commune Active");
    await expect(offerCards.nth(2)).toContainText("Commune Connectée");
  });

  test("demo link points to mairies platform", async ({ page }) => {
    await page.goto("/collectivites/");
    const demoLink = page.locator('a[href*="mairies.indxone.com"]').first();
    await expect(demoLink).toBeVisible();
  });

  test("mobile navigation uses the shared hamburger", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/collectivites/");
    const toggle = page.locator(".mobile-menu-toggle");
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator("#mobile-menu")).toBeVisible();
    await expect(page.locator("#mobile-menu")).toContainText("Réalisation");
    await expect(page.locator("body")).toHaveClass(/menu-open/);
  });
});

test.describe("INDXONE site — legal pages", () => {
  test("privacy policy mentions Plausible", async ({ page }) => {
    await page.goto("/politique-confidentialite");
    await expect(page.locator("body")).toContainText(/Plausible/i);
  });

  test("legal notice has company info", async ({ page }) => {
    await page.goto("/mentions-legales");
    await expect(page.locator("body")).toContainText(/INDXONE SASU/);
    await expect(page.locator("body")).toContainText(/SIRET/);
  });

});

test.describe("INDXONE site — accessibility pages", () => {
  test("FR accessibility page exists", async ({ page }) => {
    const response = await page.goto("/accessibilite");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toContainText(/Accessibilité/i);
  });

});

test.describe("INDXONE site — analytics", () => {
  test("Plausible script loaded on homepage", async ({ page }) => {
    await page.goto("/");
    const plausible = page.locator('script[data-domain="indxone.com"]');
    await expect(plausible).toHaveCount(1);
  });

});

test.describe("INDXONE site — skip links", () => {
  test("FR homepage has skip link", async ({ page }) => {
    await page.goto("/");
    const skip = page.locator(".skip-link");
    await expect(skip).toHaveAttribute("href", "#main-content");
  });

});

test.describe("INDXONE site — votre idée", () => {
  test("starts a mobile-first guided project journey", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/votre-idee/");

    await expect(page).toHaveTitle(/Racontez votre idée/);
    await expect(page.locator("#idea-title")).toHaveText("Racontez votre idée.");
    await page.locator(".idea-choice", { hasText: "Une application" }).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.locator('[data-step="1"]')).toBeVisible();
    await expect(page.locator('[data-step="2"]')).toBeHidden();
  });
});
