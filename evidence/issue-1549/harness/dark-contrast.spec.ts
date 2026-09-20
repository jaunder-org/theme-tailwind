/*
 * Copy temporarily into Jaunder end2end/tests and run with cargo xtask e2e-local.
 * This narrow lifecycle test intentionally records cascade evidence before its
 * dark-mode assertions, so its red result is useful when the defect returns.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test, expect, setTestBudget } from "./fixtures";
import { expectAccessible } from "./accessibility";
import { goto, signInAs } from "./helpers";
import { createPostViaApi } from "./posts";

const zipPath = process.env.THEME_TAILWIND_ZIP;
const evidenceDirectory = process.env.THEME_TAILWIND_EVIDENCE_DIR;
if (!zipPath || !evidenceDirectory) throw new Error("THEME_TAILWIND_ZIP and THEME_TAILWIND_EVIDENCE_DIR are required");

const endpoints = ["/api/themes/import_zip", "/api/themes/preview", "/api/themes/publish", "/api/themes/select"];
const logName = process.env.THEME_TAILWIND_DARK_CONTRAST_LOG ?? "dark-contrast-lifecycle.json";

test("Tailwind package dark Local contrast lifecycle", async ({ page, tracedContext, firstNav }) => {
  setTestBudget(60_000);
  await mkdir(join(evidenceDirectory, "logs"), { recursive: true });
  const zip = await readFile(zipPath);
  const result: Record<string, unknown> = {
    zipPath,
    zipSha256: createHash("sha256").update(zip).digest("hex"),
    viewport: "390x844",
    colorScheme: "dark",
  };
  const mutation = (endpoint: string) => page.waitForResponse((response) =>
    new URL(response.url()).pathname === endpoint && response.request().method() === "POST");

  await signInAs(page, "testoperator");
  await createPostViaApi(page, { body: "# Contrast heading\n\nContrast body" });
  await goto(page, "/themes", { timeout: firstNav });
  await page.getByRole("button", { name: "Site catalog" }).click();
  const importer = page.locator("section").filter({ hasText: "Import Theme Package" });
  await importer.getByLabel("Theme name").fill("Tailwind contrast lifecycle");
  await importer.getByLabel("Theme Package ZIP").setInputFiles(zipPath);
  await Promise.all([mutation(endpoints[0]), importer.getByRole("button", { name: "Import ZIP draft" }).click()]);
  await page.getByRole("button", { name: "Tailwind contrast lifecycle" }).click();
  await Promise.all([mutation(endpoints[1]), page.getByRole("button", { name: "Preview draft" }).click()]);
  await Promise.all([mutation(endpoints[2]), page.getByRole("button", { name: "Publish", exact: true }).click()]);
  const selection = page.getByLabel("Public selection");
  const themeId = await selection.getByRole("option", { name: "Tailwind contrast lifecycle" }).getAttribute("value");
  expect(themeId).not.toBeNull();
  await Promise.all([mutation(endpoints[3]), selection.selectOption(themeId!)]);

  const publicContext = await tracedContext();
  try {
    const publicPage = await publicContext.newPage();
    await publicPage.setViewportSize({ width: 390, height: 844 });
    await publicPage.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await goto(publicPage, "/", { timeout: firstNav });
    await expect(publicPage.locator(".j-root")).toHaveAttribute("data-theme", "custom");
    await expect(publicPage.locator("link[data-jaunder-theme-stylesheet]")).toHaveCount(1);
    result.elements = await publicPage.evaluate(() => {
      const specificity = (selector: string) => [
        (selector.match(/#[\w-]+/g) ?? []).length,
        (selector.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+(?:\([^)]*\))?/g) ?? []).length,
        (selector.match(/(^|[\s>+~])(?:[a-z][\w-]*)/gi) ?? []).length,
      ].join(",");
      const matchingRules = (element: Element, property: string) => Array.from(document.styleSheets).flatMap((sheet) => {
        const visit = (rules: CSSRuleList, media: string[] = []): Record<string, unknown>[] => Array.from(rules).flatMap((rule) => {
          if (rule instanceof CSSMediaRule) return matchMedia(rule.conditionText).matches ? visit(rule.cssRules, [...media, rule.conditionText]) : [];
          const styleRule = rule as CSSStyleRule;
          if (!styleRule.selectorText || !element.matches(styleRule.selectorText) || !styleRule.style.getPropertyValue(property)) return [];
          return [{ href: sheet.href ?? "inline", selector: styleRule.selectorText, specificity: specificity(styleRule.selectorText), value: styleRule.style.getPropertyValue(property).trim(), important: styleRule.style.getPropertyPriority(property) === "important", media }];
        });
        try { return visit(sheet.cssRules); } catch { return []; }
      });
      const inspect = (selector: string, property: string) => {
        const element = document.querySelector(selector)!;
        return { selector, property, computed: getComputedStyle(element).getPropertyValue(property), matchedRules: matchingRules(element, property) };
      };
      return [
        inspect('[data-jaunder-part="navigation-rail"]', "background-color"),
        inspect(".j-nav-item", "background"),
        inspect('[data-jaunder-part="post"]', "background-color"),
        inspect('[data-jaunder-part="post-body"]', "color"),
        inspect('[data-jaunder-part="post-body"] h1', "color"),
        inspect('[data-jaunder-theme-surface]', "--ink"),
        inspect('[data-jaunder-theme-surface]', "--surface-alt"),
      ];
    });
    await writeFile(join(evidenceDirectory, "logs", logName), JSON.stringify(result, null, 2) + "\n");
    await expect(publicPage.locator('[data-jaunder-part="navigation-rail"]')).toHaveCSS("background-color", "rgb(15, 23, 42)");
    await expect(publicPage.locator('[data-jaunder-part="post-body"]')).toHaveCSS("color", "rgb(226, 232, 240)");
    await expect(publicPage.locator('[data-jaunder-part="post-body"] h1')).toHaveCSS("color", "rgb(226, 232, 240)");
    await expectAccessible(publicPage);
  } finally {
    await publicContext.close();
  }
});
