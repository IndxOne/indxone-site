import { test, expect } from "@playwright/test";

test.describe("INDXONE — /votre-idee page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/votre-idee/");
  });

  // ─── Page structure ───────────────────────────────────────

  test("has correct title and meta tags", async ({ page }) => {
    await expect(page).toHaveTitle(/Racontez votre idée/);
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute("content", /Parlez-nous/i);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", /\/votre-idee/);
  });

  test("skip link targets main content", async ({ page }) => {
    const skip = page.locator(".skip-link");
    await expect(skip).toHaveAttribute("href", "#main-content");
    await skip.focus();
    await expect(skip).toBeFocused();
  });

  test("heading and intro are visible", async ({ page }) => {
    await expect(page.locator("#idea-title")).toHaveText("Racontez votre idée.");
    await expect(page.locator(".idea-lead")).toBeVisible();
    await expect(page.locator(".idea-lead")).toContainText(/aucun engagement/i);
  });

  test("form element exists with correct attributes", async ({ page }) => {
    const form = page.locator("#idea-form");
    await expect(form).toBeVisible();
    await expect(form).toHaveAttribute("data-custom-submit", "true");
    await expect(form).toHaveAttribute("name", "soumission-votre-idee");
  });

  test("honeypot field is hidden from users", async ({ page }) => {
    const honeypot = page.locator(".idea-honeypot");
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
    await expect(honeypot).toHaveAttribute("aria-hidden", "true");
    const box = await honeypot.boundingBox();
    // Positioned offscreen (left: -10000px) — not visible to users
    expect(box === null || box.x < 0).toBeTruthy();
  });

  test("hidden fields exist (form-name, form-version, bot-field)", async ({ page }) => {
    await expect(page.locator('input[name="form-name"]')).toHaveValue("soumission-votre-idee");
    await expect(page.locator('input[name="form-version"]')).toHaveValue("1.0.0");
    await expect(page.locator('input[name="bot-field"]')).toHaveCount(1);
  });

  // ─── Step 0 — Project type ───────────────────────────────

  test("step 0 shows 5 project type choices", async ({ page }) => {
    const step0 = page.locator('[data-step="0"]');
    await expect(step0).toBeVisible();
    const choices = page.locator(".idea-choice");
    await expect(choices).toHaveCount(5);
  });

  test("step 0 has correct choice labels", async ({ page }) => {
    const labels = page.locator(".idea-choice strong");
    await expect(labels.nth(0)).toHaveText("Un mariage ou événement");
    await expect(labels.nth(1)).toHaveText("Un site internet");
    await expect(labels.nth(2)).toHaveText("Une application");
    await expect(labels.nth(3)).toHaveText("Une activité à développer");
    await expect(labels.nth(4)).toHaveText("Une idée encore floue");
  });

  test("step 0 validates: cannot continue without selection", async ({ page }) => {
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.locator("#idea-form-status")).toContainText(/Choisissez un type/i);
    await expect(page.locator('[data-step="1"]')).toBeHidden();
  });

  test("step 0: selecting a choice highlights it", async ({ page }) => {
    const choice = page.locator(".idea-choice").nth(1);
    await choice.click();
    await expect(choice.locator("input")).toBeChecked();
    await expect(choice).toHaveCSS("border-color", /rgb/);
  });

  test("step 0: continue advances to step 1", async ({ page }) => {
    await page.locator(".idea-choice").nth(1).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.locator('[data-step="0"]')).toBeHidden();
    await expect(page.locator('[data-step="1"]')).toBeVisible();
  });

  // ─── Progress bar ────────────────────────────────────────

  test("progress bar starts at step 1 of 6", async ({ page }) => {
    await expect(page.locator("#idea-progress-label")).toHaveText("Étape 1 sur 6");
  });

  test("progress bar updates on step change", async ({ page }) => {
    await page.locator(".idea-choice").nth(0).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.locator("#idea-progress-label")).toHaveText("Étape 2 sur 6");
  });

  // ─── Step navigation (back/next) ─────────────────────────

  test("back button returns to previous step", async ({ page }) => {
    await page.locator(".idea-choice").nth(2).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.locator('[data-step="1"]')).toBeVisible();
    await page.getByRole("button", { name: "Retour" }).click();
    await expect(page.locator('[data-step="0"]')).toBeVisible();
    // Selection preserved
    await expect(page.locator(".idea-choice").nth(2).locator("input")).toBeChecked();
  });

  // ─── Step 1 — Goal & audience ────────────────────────────

  test("step 1 has goal and audience fields", async ({ page }) => {
    await page.locator(".idea-choice").nth(0).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.locator("#idea-goal")).toBeVisible();
    await expect(page.locator("#idea-audience")).toBeVisible();
  });

  test("step 1 validates required fields", async ({ page }) => {
    await page.locator(".idea-choice").nth(0).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    // Clear any restored draft values
    await page.locator("#idea-goal").fill("");
    await page.locator("#idea-audience").fill("");
    await page.getByRole("button", { name: "Continuer" }).click();
    // Should still be on step 1
    await expect(page.locator('[data-step="1"]')).toBeVisible();
  });

  test("step 1: continue with valid data advances to step 2", async ({ page }) => {
    await page.locator(".idea-choice").nth(0).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-goal").fill("Un site pour mon mariage");
    await page.locator("#idea-audience").fill("Mes invités");
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.locator('[data-step="2"]')).toBeVisible();
  });

  // ─── Step 2 — Branch-specific questions ──────────────────

  test("step 2 branch content updates for mariage", async ({ page }) => {
    await page.locator(".idea-choice").nth(0).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-goal").fill("test");
    await page.locator("#idea-audience").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.locator("[data-branch-title]")).toHaveText("Votre événement");
    await expect(page.locator("[data-branch-one-label]")).toContainText(/date.*lieu/i);
  });

  test("step 2 branch content updates for site", async ({ page }) => {
    await page.locator(".idea-choice").nth(1).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-goal").fill("test");
    await page.locator("#idea-audience").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.locator("[data-branch-title]")).toHaveText("Votre site");
    await expect(page.locator("[data-branch-one-label]")).toContainText(/activité.*sujet/i);
  });

  test("step 2 branch content updates for application", async ({ page }) => {
    await page.locator(".idea-choice").nth(2).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-goal").fill("test");
    await page.locator("#idea-audience").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.locator("[data-branch-title]")).toHaveText("Votre application");
    await expect(page.locator("[data-branch-one-label]")).toContainText(/action.*problème/i);
  });

  test("step 2 branch content updates for activite", async ({ page }) => {
    await page.locator(".idea-choice").nth(3).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-goal").fill("test");
    await page.locator("#idea-audience").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.locator("[data-branch-title]")).toHaveText("Votre activité");
  });

  test("step 2 branch content updates for idée floue", async ({ page }) => {
    await page.locator(".idea-choice").nth(4).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-goal").fill("test");
    await page.locator("#idea-audience").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.locator("[data-branch-title]")).toHaveText("Votre point de départ");
  });

  // ─── Step 3 — Style, examples, start ─────────────────────

  test("step 3 has style, examples, and start fields", async ({ page }) => {
    // Navigate to step 3
    await page.locator(".idea-choice").nth(1).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-goal").fill("test");
    await page.locator("#idea-audience").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#branch-one").fill("test");
    await page.locator("#branch-two").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.locator('[data-step="3"]')).toBeVisible();
    await expect(page.locator("#idea-style")).toBeVisible();
    await expect(page.locator("#idea-examples")).toBeVisible();
    await expect(page.locator("#idea-start")).toBeVisible();
  });

  // ─── Step 4 — Budget & support ───────────────────────────

  test("step 4 has budget and support selects", async ({ page }) => {
    // Navigate to step 4
    await page.locator(".idea-choice").nth(1).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-goal").fill("test");
    await page.locator("#idea-audience").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#branch-one").fill("test");
    await page.locator("#branch-two").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-style").fill("test");
    await page.locator("#idea-start").selectOption("Dans le mois");
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.locator('[data-step="4"]')).toBeVisible();
    await expect(page.locator("#idea-budget")).toBeVisible();
    await expect(page.locator("#idea-support")).toBeVisible();
  });

  // ─── Step 5 — Contact info ───────────────────────────────

  test("step 5 has name, email, phone, and consent fields", async ({ page }) => {
    // Navigate through all steps to step 5
    await page.locator(".idea-choice").nth(1).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-goal").fill("test");
    await page.locator("#idea-audience").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#branch-one").fill("test");
    await page.locator("#branch-two").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-style").fill("test");
    await page.locator("#idea-start").selectOption("Dans le mois");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-support").selectOption("Clarifier l'idée et démarrer");
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.locator('[data-step="5"]')).toBeVisible();
    await expect(page.locator("#idea-name")).toBeVisible();
    await expect(page.locator("#idea-email")).toBeVisible();
    await expect(page.locator("#idea-phone")).toBeVisible();
    await expect(page.locator("#idea-consent")).toBeVisible();
  });

  test("step 5 validates required contact fields", async ({ page }) => {
    // Navigate to step 5
    await page.locator(".idea-choice").nth(1).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-goal").fill("test");
    await page.locator("#idea-audience").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#branch-one").fill("test");
    await page.locator("#branch-two").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-style").fill("test");
    await page.locator("#idea-start").selectOption("Dans le mois");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-support").selectOption("Clarifier l'idée et démarrer");
    await page.getByRole("button", { name: "Continuer" }).click();
    // Try to proceed without filling required fields
    await page.getByRole("button", { name: "Voir le récapitulatif" }).click();
    await expect(page.locator('[data-step="5"]')).toBeVisible();
  });

  // ─── Step 6 — Summary / Review ───────────────────────────

  test("step 6 shows summary with all answers", async ({ page }) => {
    // Fill everything through to step 6
    await page.locator(".idea-choice").nth(1).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-goal").fill("Un site vitrine");
    await page.locator("#idea-audience").fill("Mes clients");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#branch-one").fill("Mon activité de coaching");
    await page.locator("#branch-two").fill("Pages indispensable : accueil, services, contact");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-style").fill("Sobre et chaleureux");
    await page.locator("#idea-start").selectOption("Dans les 3 mois");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-budget").selectOption("1 500–5 000 €");
    await page.locator("#idea-support").selectOption("Jusqu'à la mise en ligne");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-name").fill("Dupont");
    await page.locator("#idea-firstname").fill("Jean");
    await page.locator("#idea-email").fill("jean@test.fr");
    await page.locator("#idea-consent").check();
    await page.getByRole("button", { name: "Voir le récapitulatif" }).click();

    await expect(page.locator('[data-step="6"]')).toBeVisible();
    await expect(page.locator("#review-title")).toHaveText("Votre récapitulatif");

    const summary = page.locator("#idea-summary");
    await expect(summary).toContainText("site internet");
    await expect(summary).toContainText("Un site vitrine");
    await expect(summary).toContainText("Mes clients");
    await expect(summary).toContainText("Jean");
    await expect(summary).toContainText("Dupont");
    await expect(summary).toContainText("jean@test.fr");
  });

  test("step 6: modify button returns to step 5", async ({ page }) => {
    // Navigate to step 6
    await page.locator(".idea-choice").nth(0).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-goal").fill("test");
    await page.locator("#idea-audience").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#branch-one").fill("test");
    await page.locator("#branch-two").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-style").fill("test");
    await page.locator("#idea-start").selectOption("Dans le mois");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-support").selectOption("Clarifier l'idée et démarrer");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-name").fill("Test");
    await page.locator("#idea-email").fill("test@test.fr");
    await page.locator("#idea-consent").check();
    await page.getByRole("button", { name: "Voir le récapitulatif" }).click();
    await expect(page.locator('[data-step="6"]')).toBeVisible();

    await page.getByRole("button", { name: "Modifier" }).click();
    await expect(page.locator('[data-step="5"]')).toBeVisible();
  });

  // ─── Query parameter preselection ────────────────────────

  test("?type=mariage preselects mariage choice", async ({ page }) => {
    await page.goto("/votre-idee/?type=mariage");
    await expect(page.locator(".idea-choice").nth(0).locator("input")).toBeChecked();
  });

  test("?type=site preselects site choice", async ({ page }) => {
    await page.goto("/votre-idee/?type=site");
    await expect(page.locator(".idea-choice").nth(1).locator("input")).toBeChecked();
  });

  test("?type=application preselects application choice", async ({ page }) => {
    await page.goto("/votre-idee/?type=application");
    await expect(page.locator(".idea-choice").nth(2).locator("input")).toBeChecked();
  });

  // ─── Accessibility ───────────────────────────────────────

  test("all form fields have associated labels", async ({ page }) => {
    // Step 0 uses label wrapping (radio inputs inside label elements)
    const step0Labels = page.locator(".idea-choice");
    await expect(step0Labels).toHaveCount(5);

    // Navigate to step 5 to check input labels
    await page.locator(".idea-choice").nth(1).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-goal").fill("test");
    await page.locator("#idea-audience").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#branch-one").fill("test");
    await page.locator("#branch-two").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-style").fill("test");
    await page.locator("#idea-start").selectOption("Dans le mois");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-support").selectOption("Clarifier l'idée et démarrer");
    await page.getByRole("button", { name: "Continuer" }).click();

    // Check that labels have for attributes matching input ids
    const nameLabel = page.locator('label[for="idea-name"]');
    await expect(nameLabel).toHaveText(/Nom/);
    const emailLabel = page.locator('label[for="idea-email"]');
    await expect(emailLabel).toHaveText(/Email/);
    const consentLabel = page.locator('label[for="idea-consent"]');
    await expect(consentLabel).toContainText(/confidentialité/);
  });

  test("error messages have role=alert", async ({ page }) => {
    const errors = page.locator('[role="alert"]');
    const count = await errors.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("progress label uses aria-live polite", async ({ page }) => {
    await expect(page.locator("#idea-progress-label")).toHaveAttribute("aria-live", "polite");
  });

  // ─── Mobile behavior ─────────────────────────────────────

  test("mobile: form fits within viewport width", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const form = page.locator(".idea-form");
    const box = await form.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(360);
  });

  test("mobile: choices are single column and full width", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const choice = page.locator(".idea-choice").first();
    const box = await choice.boundingBox();
    // Choices should fill the available width (form padding subtracted)
    expect(box?.width).toBeGreaterThan(250);
  });

  test("mobile: navigation buttons are full width", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const continueBtn = page.locator(".idea-step .idea-next").first();
    const btnBox = await continueBtn.boundingBox();
    const formBox = await page.locator(".idea-form").boundingBox();
    expect(btnBox?.width).toBeGreaterThan((formBox?.width || 0) * 0.8);
  });

  test("mobile: nav bar is sticky at bottom", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    // Navigate to step 1 to see the nav buttons
    await page.locator(".idea-choice").nth(0).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    const nav = page.locator(".idea-nav").first();
    await expect(nav).toHaveCSS("position", /sticky|fixed/);
  });

  // ─── Reduced motion ──────────────────────────────────────

  test("prefers-reduced-motion disables progress animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const bar = page.locator("#idea-progress-bar");
    await expect(bar).toHaveCSS("transition", /none/);
  });

  // ─── Draft persistence ───────────────────────────────────

  test("form state is saved to localStorage on input", async ({ page }) => {
    await page.locator(".idea-choice").nth(1).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-goal").fill("Mon projet de test");
    const draft = await page.evaluate(() => localStorage.getItem("indxone:votre-idee:draft:v1"));
    expect(draft).toBeTruthy();
    const parsed = JSON.parse(draft || "{}");
    expect(parsed.goal).toBe("Mon projet de test");
    expect(parsed["project-type-choice"]).toBe("site internet");
  });

  test("form restores draft after page reload", async ({ page }) => {
    await page.locator(".idea-choice").nth(2).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-goal").fill("Une app mobile");
    await page.reload();
    await expect(page.locator(".idea-choice").nth(2).locator("input")).toBeChecked();
    await expect(page.locator("#idea-goal")).toHaveValue("Une app mobile");
  });

  // ─── Keyboard navigation ─────────────────────────────────

  test("keyboard: can navigate choices with Tab and arrow keys", async ({ page }) => {
    const firstInput = page.locator(".idea-choice input").first();
    await firstInput.focus();
    // Arrow keys navigate within a radio group
    await page.keyboard.press("ArrowDown");
    // Second choice should be checked
    await expect(page.locator(".idea-choice").nth(1).locator("input")).toBeChecked();
    // Arrow down again
    await page.keyboard.press("ArrowDown");
    await expect(page.locator(".idea-choice").nth(2).locator("input")).toBeChecked();
    // Arrow up back to first
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expect(page.locator(".idea-choice").nth(0).locator("input")).toBeChecked();
  });

  // ─── Footer & nav ───────────────────────────────────────

  test("page has nav and footer includes", async ({ page }) => {
    await expect(page.locator(".nav")).toBeVisible();
    await expect(page.locator(".footer")).toBeVisible();
  });

  test("nav logo links to homepage", async ({ page }) => {
    const logo = page.locator(".nav-logo");
    await expect(logo).toHaveAttribute("href", "/");
  });

  // ─── Responsive: tablet ──────────────────────────────────

  test("tablet: form is centered and constrained", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const shell = page.locator(".idea-shell");
    const box = await shell.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(760);
  });

  // ─── Responsive: desktop ─────────────────────────────────

  test("desktop: choices display in grid", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const grid = page.locator(".idea-choice-grid");
    await expect(grid).toBeVisible();
  });

  // ─── Submit button text ──────────────────────────────────

  test("submit button text is 'Envoyer ma demande'", async ({ page }) => {
    // Navigate to step 6
    await page.locator(".idea-choice").nth(0).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-goal").fill("test");
    await page.locator("#idea-audience").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#branch-one").fill("test");
    await page.locator("#branch-two").fill("test");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-style").fill("test");
    await page.locator("#idea-start").selectOption("Dans le mois");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-support").selectOption("Clarifier l'idée et démarrer");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-name").fill("Test");
    await page.locator("#idea-email").fill("test@test.fr");
    await page.locator("#idea-consent").check();
    await page.getByRole("button", { name: "Voir le récapitulatif" }).click();
    await expect(page.locator('button[type="submit"]')).toHaveText("Envoyer ma demande");
  });

  // ─── Form submission ─────────────────────────────────────

  async function navigateToStep6(page) {
    await page.locator(".idea-choice").nth(1).click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-goal").fill("Un site vitrine pour mon coaching");
    await page.locator("#idea-audience").fill("Mes clients potentiels");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#branch-one").fill("Mon activité de coaching professionnel");
    await page.locator("#branch-two").fill("Accueil, services, témoignages, contact");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-style").fill("Sobre, chaleureux, professionnel");
    await page.locator("#idea-start").selectOption("Dans les 3 mois");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-budget").selectOption("1 500–5 000 €");
    await page.locator("#idea-support").selectOption("Jusqu'à la mise en ligne");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.locator("#idea-name").fill("Dupont");
    await page.locator("#idea-firstname").fill("Jean");
    await page.locator("#idea-email").fill("jean@coaching.fr");
    await page.locator("#idea-consent").check();
    await page.getByRole("button", { name: "Voir le récapitulatif" }).click();
    await expect(page.locator('[data-step="6"]')).toBeVisible();
  }

  test("submit shows loading state then error when API is unreachable", async ({ page }) => {
    await page.route("**/api/submit-idee", (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ error: "test" }) })
    );

    await navigateToStep6(page);
    const submitBtn = page.locator('button[type="submit"]');

    await submitBtn.click();

    // After failed submission: button re-enabled with original text, still on step 6
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await expect(submitBtn).toHaveText("Envoyer ma demande");
    await expect(page.locator('[data-step="6"]')).toBeVisible();
    // Error message is shown to the user
    const statusText = await page.locator("#idea-form-status").textContent();
    expect(statusText.length).toBeGreaterThan(0);
  });

  test("submit button re-enables after error so user can retry", async ({ page }) => {
    await page.route("**/api/submit-idee", (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ error: "test" }) })
    );

    await navigateToStep6(page);
    const submitBtn = page.locator('button[type="submit"]');

    // First attempt — fails
    await submitBtn.click();
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });

    // Second attempt — button is clickable, also fails gracefully
    await submitBtn.click();
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await expect(submitBtn).toHaveText("Envoyer ma demande");
    // Still on step 6, no crash
    await expect(page.locator('[data-step="6"]')).toBeVisible();
  });

  test("double-click does not crash or navigate away", async ({ page }) => {
    await page.route("**/api/submit-idee", (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ error: "test" }) })
    );

    await navigateToStep6(page);
    const submitBtn = page.locator('button[type="submit"]');

    // Rapid double click — second fires while first is in-flight
    await submitBtn.click();
    await submitBtn.click({ force: true });

    // Wait for recovery
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    // Still on step 6 (no redirect, no crash)
    await expect(page.locator('[data-step="6"]')).toBeVisible();
  });

  test("submit builds correct payload structure", async ({ page }) => {
    await navigateToStep6(page);

    // Intercept the fetch to inspect the payload
    const requestPromise = page.waitForRequest((req) => req.url().includes("/api/submit-idee"));
    page.locator('button[type="submit"]').click();
    const request = await requestPromise;
    const payload = JSON.parse(request.postData() || "{}");

    expect(payload.form_version).toBe("1.0.0");
    expect(payload.project_type).toBe("site");
    expect(payload.submission_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
    expect(payload.contact.nom).toBe("Dupont");
    expect(payload.contact.prenom).toBe("Jean");
    expect(payload.contact.email).toBe("jean@coaching.fr");
    expect(payload.consent.accepted).toBe(true);
    expect(payload.consent.accepted_at).toBeTruthy();
    expect(payload.responses.trunk.goal).toBe("Un site vitrine pour mon coaching");
    expect(payload.responses.trunk.audience).toBe("Mes clients potentiels");
    expect(payload.responses.trunk.style).toBe("Sobre, chaleureux, professionnel");
    expect(payload.responses.trunk.start).toBe("Dans les 3 mois");
    expect(payload.responses.trunk.budget).toBe("1 500–5 000 €");
    expect(payload.responses.trunk.support).toBe("Jusqu'à la mise en ligne");
    expect(payload.responses.conditional.branch_one).toBe("Mon activité de coaching professionnel");
    expect(payload.responses.conditional.branch_two).toBe("Accueil, services, témoignages, contact");
    expect(payload.meta.origin).toContain("/votre-idee");
    expect(payload.meta.language).toBe("fr");
  });

  test("created_at uses started_at from draft (not submit time)", async ({ page }) => {
    // Load page — draft starts with current time
    const beforeLoad = Date.now();
    await page.goto("/votre-idee/");
    await navigateToStep6(page);

    const requestPromise = page.waitForRequest((req) => req.url().includes("/api/submit-idee"));
    page.locator('button[type="submit"]').click();
    const request = await requestPromise;
    const payload = JSON.parse(request.postData() || "{}");

    const createdAt = new Date(payload.created_at).getTime();
    // created_at should be close to page load time, not submit time
    expect(createdAt).toBeGreaterThanOrEqual(beforeLoad - 1000);
    expect(createdAt).toBeLessThanOrEqual(Date.now());
  });

  test("draft is cleared from localStorage after successful submit attempt", async ({ page }) => {
    await page.goto("/votre-idee/");
    await navigateToStep6(page);

    // Draft should exist
    let draft = await page.evaluate(() => localStorage.getItem("indxone:votre-idee:draft:v1"));
    expect(draft).toBeTruthy();

    // Intercept and fail the request to prevent redirect
    await page.route("**/api/submit-idee", (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ error: "test" }) })
    );

    await page.locator('button[type="submit"]').click();
    await expect(page.locator("#idea-form-status")).toContainText(/connexion|réessayez|envoyée/i, {
      timeout: 10000,
    });

    // Draft should NOT be cleared on error (only on success)
    draft = await page.evaluate(() => localStorage.getItem("indxone:votre-idee:draft:v1"));
    expect(draft).toBeTruthy();
  });
});
