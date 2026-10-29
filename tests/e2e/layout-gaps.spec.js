import { test, expect } from "@playwright/test";

// Only the built site served locally by Playwright; no real form submissions.
for (const width of [320, 375, 390, 1280, 1440]) {
  test(`layout S6: municipality keeps clear CTAs and compact sections at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/collectivites/");

    const hero = page.locator(".hero-collectivites");
    await expect(hero).toBeVisible();
    const stats = hero.locator(".hero-stats");
    const actions = hero.locator(".hero-actions");
    await expect(stats.locator(".hero-stat")).toHaveCount(4);
    await expect(actions.getByRole("link")).toHaveCount(2);

    const spacing = await page.evaluate(() => {
      const hero = document.querySelector(".hero-collectivites");
      const stats = hero.querySelector(".hero-stats").getBoundingClientRect();
      const cta = hero.querySelector(".hero-actions").getBoundingClientRect();
      const style = getComputedStyle(hero);
      return {
        gap: cta.top - stats.bottom,
        topPadding: Number.parseFloat(style.paddingTop),
        columns: getComputedStyle(hero.querySelector(".hero-stats")).gridTemplateColumns.split(" ").length,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
      };
    });
    expect(spacing.gap, "Stats and actions must not collide").toBeGreaterThanOrEqual(16);
    expect(spacing.topPadding, "Hero must not reserve a blank screen").toBeLessThanOrEqual(72);
    expect(spacing.columns).toBe(width <= 600 ? 2 : 4);
    expect(spacing.documentWidth).toBeLessThanOrEqual(spacing.viewportWidth + 1);

    const note = page.locator(".pricing-note");
    const noteBox = await note.boundingBox();
    expect(noteBox).not.toBeNull();
    expect(noteBox.width).toBeLessThanOrEqual(1182);

    const faq = page.locator(".faq");
    const title = faq.getByRole("heading", { name: "Ce que les maires nous demandent" });
    const titleBox = await title.boundingBox();
    const listBox = await page.locator(".faq-list").boundingBox();
    expect(titleBox).not.toBeNull();
    expect(listBox).not.toBeNull();
    if (width >= 901) {
      const center = (box) => box.x + box.width / 2;
      expect(Math.abs(center(titleBox) - width / 2)).toBeLessThanOrEqual(4);
      expect(Math.abs(center(listBox) - width / 2)).toBeLessThanOrEqual(4);
    }
  });

  test(`layout S6: realizations has two centered stats at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/projets/");
    const hero = page.locator(".projets-hero");
    await expect(hero).toBeVisible();
    await expect(hero.locator(".h-stat")).toHaveCount(2);
    const values = await hero.evaluate((el) => ({
      columns: getComputedStyle(el.querySelector(".hero-stats-compact")).gridTemplateColumns.split(" ").length,
      paddingTop: Number.parseFloat(getComputedStyle(el).paddingTop),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    expect(values.columns).toBe(2);
    expect(values.paddingTop).toBeLessThanOrEqual(72);
    expect(values.overflow).toBeLessThanOrEqual(1);
  });
}
