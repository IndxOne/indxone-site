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


test.describe("Site S6 — responsive density and centering", () => {
  for (const width of [320, 390, 1440]) {
    test(`Réalisations hero has compact vertical padding at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/projets/");
      const hero = page.locator(".projets-hero");
      await expect(hero).toBeVisible();
      const vertical = await hero.evaluate((node) => {
        const css = getComputedStyle(node);
        return { top: parseFloat(css.paddingTop), bottom: parseFloat(css.paddingBottom) };
      });
      expect(vertical.top).toBeLessThanOrEqual(65);
      expect(vertical.bottom).toBeLessThanOrEqual(65);
      await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    });

    test(`Collectivités hero and pricing flow have no crowding at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/collectivites/");
      const hero = page.locator(".hero-collectivites");
      const stats = hero.locator(".hero-stats");
      const cta = hero.locator(".hero-actions");
      await expect(stats).toBeVisible();
      await expect(cta).toBeVisible();
      const statsBox = await stats.boundingBox();
      const ctaBox = await cta.boundingBox();
      expect(statsBox).not.toBeNull();
      expect(ctaBox).not.toBeNull();
      expect(ctaBox.y - (statsBox.y + statsBox.height)).toBeGreaterThanOrEqual(12);

      if (width <= 600) {
        await expect(stats).toHaveCSS("grid-template-columns", /px/);
        const columns = await stats.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length);
        expect(columns).toBe(2);
        const minHeight = await hero.evaluate((node) => parseFloat(getComputedStyle(node).minHeight));
        expect(minHeight).toBe(0);
      }

      const noteBox = await page.locator(".pricing-note").boundingBox();
      const refsBox = await page.locator(".refs > .section-label").boundingBox();
      expect(noteBox).not.toBeNull();
      expect(refsBox).not.toBeNull();
      expect(noteBox.width).toBeLessThanOrEqual(1181);
      expect(refsBox.y - (noteBox.y + noteBox.height)).toBeLessThanOrEqual(width <= 600 ? 120 : 150);

      const faqBox = await page.locator(".faq-list").boundingBox();
      const titleBox = await page.locator(".faq > h2").boundingBox();
      expect(faqBox).not.toBeNull();
      expect(titleBox).not.toBeNull();
      expect(faqBox.width).toBeLessThanOrEqual(901);
      expect(Math.abs(faqBox.x - titleBox.x)).toBeLessThanOrEqual(3);
      expect(Math.abs(faqBox.x - (width - faqBox.width) / 2)).toBeLessThanOrEqual(3);
      const overflowInfo = await page.evaluate(() => ({
        wide: document.documentElement.scrollWidth, viewport: window.innerWidth,
        offenders: [...document.querySelectorAll("body *")].filter((node) => {
          const r = node.getBoundingClientRect();
          return r.width && r.right > window.innerWidth + 1 && getComputedStyle(node).position !== "fixed";
        }).slice(0, 6).map((node) => ({
          parent: node.parentElement?.className?.toString().slice(0, 80),
          tag: node.tagName, text: node.textContent?.trim().slice(0, 110),
          right: Math.round(node.getBoundingClientRect().right),
        })),
      }));
      expect(overflowInfo.wide, JSON.stringify(overflowInfo)).toBeLessThanOrEqual(width + 1);
    });
  }
});


test.describe("Site S7 — references and footer balance", () => {
  for (const width of [320, 390, 1440]) {
    test(`two references balance desktop and wrap safely on mobile ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/collectivites/");
      const grid = page.locator(".refs-grid");
      const cards = grid.locator(".ref-card");
      await expect(cards).toHaveCount(2);
      const boxes = await cards.evaluateAll((elements) => elements.map((element) => {
        const r = element.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, right: r.right };
      }));
      const gridBox = await grid.boundingBox();
      const faqHeading = await page.locator(".faq > h2").boundingBox();
      const referencesHeading = await page.locator(".refs > h2").boundingBox();
      expect(gridBox).not.toBeNull();
      expect(faqHeading).not.toBeNull();
      expect(referencesHeading).not.toBeNull();
      expect(gridBox.width).toBeLessThanOrEqual(901);
      expect(Math.abs(gridBox.x - (width - gridBox.width) / 2)).toBeLessThanOrEqual(3);
      expect(Math.abs(faqHeading.x - referencesHeading.x)).toBeLessThanOrEqual(3);
      if (width > 600) {
        expect(Math.abs(boxes[1].y - boxes[0].y)).toBeLessThanOrEqual(2);
        expect(boxes[1].x).toBeGreaterThan(boxes[0].right);
      } else {
        expect(boxes[1].y).toBeGreaterThan(boxes[0].y);
        expect(boxes.every((box) => box.right <= width + 1)).toBe(true);
      }
      const overflow = await page.evaluate(() => ({
        wide: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
        offenders: [...document.querySelectorAll("body *")]
          .filter((node) => {
            const r = node.getBoundingClientRect();
            return r.width && r.right > window.innerWidth + 1 && getComputedStyle(node).position !== "fixed";
          })
          .slice(0, 8)
          .map((node) => ({ tag: node.tagName, cls: node.className?.toString().slice(0, 80), parent: node.parentElement?.className?.toString().slice(0, 80), text: node.textContent?.trim().slice(0, 110), right: Math.round(node.getBoundingClientRect().right) })),
      }));
      expect(overflow.wide, JSON.stringify(overflow)).toBeLessThanOrEqual(width + 1);
    });

    test(`footer remains compact, aligned and accessible at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/collectivites/");
      const footer = page.locator("footer.footer");
      const main = footer.locator(".footer-grid");
      const bottom = footer.locator(".footer-bottom");
      await expect(main).toBeVisible();
      await expect(bottom).toBeVisible();
      await expect(footer.getByRole("link", { name: "Mentions légales" })).toBeVisible();
      await expect(footer.getByRole("link", { name: "Confidentialité" })).toBeVisible();
      const a = await main.boundingBox();
      const b = await bottom.boundingBox();
      expect(a.width).toBeLessThanOrEqual(961);
      expect(b.width).toBeLessThanOrEqual(961);
      expect(Math.abs(a.x - b.x)).toBeLessThanOrEqual(3);
      if (width > 768) {
        const contact = await footer.locator(".footer-contact").boundingBox();
        const brand = await footer.locator(".footer-brand").boundingBox();
        expect(contact.x).toBeGreaterThan(brand.x + brand.width);
      } else {
        const columns = await main.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length);
        expect(columns).toBe(1);
      }
    });
  }
});
