import { test, expect } from "@playwright/test";

test.describe("INDXONE site — homepage", () => {
  test("has correct title and description meta tags", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/INDXONE.*Consultant SI/);
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute("content", /Consultant SI/);
  });

  test("navigation links are present and work", async ({ page }) => {
    await page.goto("/");
    const navLinks = page.locator(".nav-links a");
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(4);

    // Click the "Projets" link and verify we navigate
    await navLinks.filter({ hasText: "Projets" }).first().click();
    await expect(page).toHaveURL(/projets/);
  });

  test("dark mode toggle works", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator(".theme-toggle");
    await expect(toggle).toBeVisible();

    // Initially light
    let theme = await page.locator("html").getAttribute("data-theme");
    expect(theme).toBe("light");

    // Click — should become dark
    await toggle.click();
    theme = await page.locator("html").getAttribute("data-theme");
    expect(theme).toBe("dark");

    // Click again — back to light
    await toggle.click();
    theme = await page.locator("html").getAttribute("data-theme");
    expect(theme).toBe("light");
  });

  test("contact form has required fields", async ({ page }) => {
    await page.goto("/");
    const form = page.locator(".contact-form");
    await expect(form).toBeVisible();

    // Check required inputs exist
    await expect(form.locator("#nom")).toHaveAttribute("required");
    await expect(form.locator("#email")).toHaveAttribute("required");
    await expect(form.locator("#sujet")).toHaveAttribute("required");
    await expect(form.locator("#message")).toHaveAttribute("required");
    await expect(form.locator("#consent")).toHaveAttribute("required");
    await expect(page.locator('label[for="consent"]')).toContainText(/politique de confidentialité/i);

    // Submit with empty fields triggers validation
    await form.locator('button[type="submit"]').click();
    await expect(page.locator("#nom")).toBeFocused();
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

  test("JSON-LD structured data exists", async ({ page }) => {
    await page.goto("/");
    const jsonld = page.locator('script[type="application/ld+json"]');
    await expect(jsonld).toHaveCount(1);

    const content = await jsonld.textContent();
    const parsed = JSON.parse(content);
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@graph"]).toBeDefined();
    expect(Array.isArray(parsed["@graph"])).toBe(true);
  });
});

test.describe("INDXONE site — English page", () => {
  test("has correct language attribute and English content", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveTitle(/IT Consultant & Digital Architect/);

    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute("content", /IT Consultant/);
  });

  test("contact form consent is labeled and links to privacy policy", async ({ page }) => {
    await page.goto("/en/");
    const consent = page.locator("#consent-en");
    await expect(consent).toHaveAttribute("required");
    await expect(page.locator('label[for="consent-en"]')).toContainText(/privacy policy/i);
    await expect(page.locator('label[for="consent-en"] a')).toHaveAttribute(
      "href",
      "/en/privacy-policy",
    );
  });
});

test.describe("INDXONE site — errors", () => {
  test("unknown URL returns 404", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist-xyz");
    expect(response?.status()).toBe(404);
  });
});

test.describe("INDXONE site — projets page", () => {
  test("project filter buttons work", async ({ page }) => {
    await page.goto("/projets/");
    const filterBtns = page.locator(".pf-btn");
    await expect(filterBtns).toHaveCount(3);

    // Initially "Tous" is active
    await expect(filterBtns.nth(0)).toHaveClass(/active/);

    // Click "CDI · Référent IT"
    await filterBtns.nth(2).click();
    await expect(filterBtns.nth(2)).toHaveClass(/active/);

    // Cards with data-type="cdi" should be visible, freelance cards dimmed
    const cdiCards = page.locator('.bc[data-type="cdi"]');
    const freelanceCards = page.locator('.bc[data-type="freelance"]');
    await expect(cdiCards.first()).toBeVisible();
    // Freelance cards are dimmed (opacity 0.15), not hidden display:none
    await expect(freelanceCards.first()).toHaveCSS("opacity", "0.15");
  });
});

test.describe("INDXONE site — collectivites page", () => {
  test("has pricing section with offers", async ({ page }) => {
    await page.goto("/collectivites/");
    await expect(page.locator(".pricing-grid")).toBeVisible();
    const offerCards = page.locator(".pc");
    const count = await offerCards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test("demo link points to mairies platform", async ({ page }) => {
    await page.goto("/collectivites/");
    const demoLink = page.locator('a[href*="mairies.indxone.com"]').first();
    await expect(demoLink).toBeVisible();
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

  test("EN legal notice exists", async ({ page }) => {
    const response = await page.goto("/en/legal-notice");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toContainText(/Legal Notice/i);
  });

  test("EN privacy policy exists", async ({ page }) => {
    const response = await page.goto("/en/privacy-policy");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toContainText(/Privacy Policy/i);
  });
});

test.describe("INDXONE site — accessibility pages", () => {
  test("FR accessibility page exists", async ({ page }) => {
    const response = await page.goto("/accessibilite");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toContainText(/Accessibilité/i);
  });

  test("EN accessibility page exists", async ({ page }) => {
    const response = await page.goto("/en/accessibility");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toContainText(/Accessibility/i);
  });
});

test.describe("INDXONE site — analytics", () => {
  test("Plausible script loaded on homepage", async ({ page }) => {
    await page.goto("/");
    const plausible = page.locator('script[data-domain="indxone.com"]');
    await expect(plausible).toHaveCount(1);
  });

  test("Plausible script loaded on EN homepage", async ({ page }) => {
    await page.goto("/en/");
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

  test("EN projets page has skip link", async ({ page }) => {
    await page.goto("/en/projets");
    const skip = page.locator(".skip-link");
    await expect(skip).toHaveAttribute("href", "#main-content");
  });

  test("EN collectivites page has skip link", async ({ page }) => {
    await page.goto("/en/collectivites");
    const skip = page.locator(".skip-link");
    await expect(skip).toHaveAttribute("href", "#main-content");
  });
});
