/*
 * Durable cross-browser trusted owner-controls evidence for theme-tailwind PR #1.
 * Copy temporarily to Jaunder end2end/tests; THEME_TAILWIND_ZIP is its sole package input.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test, expect, setTestBudget } from "./fixtures";
import { BASE_URL, goto, signInAs } from "./helpers";
import { allowSecondBoot } from "./bootBudget";
import { createPostViaApi } from "./posts";

const zipPath = process.env.THEME_TAILWIND_ZIP;
const evidenceDirectory = process.env.THEME_TAILWIND_EVIDENCE_DIR;
const expectedZipSha256 = process.env.THEME_TAILWIND_ZIP_SHA256;
if (!zipPath || !evidenceDirectory || !expectedZipSha256) {
  throw new Error(
    "THEME_TAILWIND_ZIP, THEME_TAILWIND_EVIDENCE_DIR, and THEME_TAILWIND_ZIP_SHA256 are required",
  );
}

const endpoints = {
  import_zip: "/api/themes/import_zip",
  preview: "/api/themes/preview",
  publish: "/api/themes/publish",
  select: "/api/themes/select",
} as const;

test("external Tailwind package trusted owner controls evidence", async ({
  page,
  tracedContext,
  firstNav,
}, testInfo) => {
  setTestBudget(120_000);
  const logs = join(evidenceDirectory, "logs");
  const screenshots = join(
    evidenceDirectory,
    "trusted-controls",
    "screenshots",
  );
  await Promise.all([
    mkdir(logs, { recursive: true }),
    mkdir(screenshots, { recursive: true }),
  ]);
  const zip = await readFile(zipPath);
  const zipSha256 = createHash("sha256").update(zip).digest("hex");
  expect(zipSha256).toBe(expectedZipSha256);
  const result: Record<string, unknown> = {
    browser: testInfo.project.name,
    zipPath,
    zipSha256,
    checks: [],
    verdict: "pass",
  };
  const check = (name: string) => (result.checks as string[]).push(name);
  const mutation = (endpoint: keyof typeof endpoints) =>
    page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === endpoints[endpoint] &&
        response.request().method() === "POST",
    );

  await signInAs(page, "testoperator");
  await createPostViaApi(page, {
    body: "# Trusted controls first Post\n\nFirst owned Post.",
  });
  for (const ordinal of ["second", "third", "fourth"]) {
    await createPostViaApi(page, {
      body: `# Trusted controls ${ordinal} Post\n\n${ordinal} owned Post.`,
    });
  }

  await goto(page, "/themes", { timeout: firstNav });
  await expect(page.locator(".j-root")).toHaveAttribute("data-theme", "studio");
  await page.getByRole("button", { name: "Site catalog" }).click();
  const importer = page
    .locator("section")
    .filter({ hasText: "Import Theme Package" });
  await importer
    .getByLabel("Theme name")
    .fill("Tailwind trusted controls evidence");
  await importer.getByLabel("Theme Package ZIP").setInputFiles(zipPath);
  await Promise.all([
    mutation("import_zip"),
    importer.getByRole("button", { name: "Import ZIP draft" }).click(),
  ]);
  await page
    .getByRole("button", { name: "Tailwind trusted controls evidence" })
    .click();
  await Promise.all([
    mutation("preview"),
    page.getByRole("button", { name: "Preview draft" }).click(),
  ]);
  await Promise.all([
    mutation("publish"),
    page.getByRole("button", { name: "Publish", exact: true }).click(),
  ]);
  const selection = page.getByLabel("Public selection");
  const themeId = await selection
    .getByRole("option", { name: "Tailwind trusted controls evidence" })
    .getAttribute("value");
  expect(themeId).not.toBeNull();
  await Promise.all([mutation("select"), selection.selectOption(themeId!)]);
  check(
    "supported Studio import, preview, publish, and explicit custom selection passed",
  );

  allowSecondBoot(
    page,
    "cold-load the selected public Theme route after supported Studio selection",
  );
  await goto(page, "/~testoperator", { timeout: firstNav });
  await expect(page.locator(".j-root")).toHaveAttribute("data-theme", "custom");
  const posts = page.locator("article.j-post");
  const triggers = page.getByRole("button", { name: "Actions" });
  await expect(posts).toHaveCount(4);
  await expect(triggers).toHaveCount(4);
  await expect(
    page
      .locator("#j-trusted-post-actions")
      .getByRole("button", { name: "Actions" }),
  ).toHaveCount(4);
  check(
    "four owned Posts expose one trusted Actions control each outside trusted chrome",
  );

  await page.setViewportSize({ width: 375, height: 250 });
  await posts.nth(3).scrollIntoViewIfNeeded();
  const secondTrigger = triggers.nth(3);
  await expect(secondTrigger).toBeInViewport();
  await expect(triggers.first()).not.toBeInViewport();
  await secondTrigger.focus();
  await page.keyboard.press("Enter");
  const popoverId = await secondTrigger.getAttribute("popovertarget");
  expect(popoverId).toBeTruthy();
  const popover = page.locator(`#${popoverId!}`);
  await expect(popover).toBeVisible();
  await expect(secondTrigger).toBeFocused();
  const triggerBox = await secondTrigger.boundingBox();
  const menuBox = await popover.boundingBox();
  expect(triggerBox).not.toBeNull();
  expect(menuBox).not.toBeNull();
  expect(menuBox!.x).toBeGreaterThanOrEqual(0);
  expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(375);
  expect(menuBox!.y).toBeGreaterThanOrEqual(
    triggerBox!.y + triggerBox!.height - 1,
  );
  expect(menuBox!.y - (triggerBox!.y + triggerBox!.height)).toBeLessThanOrEqual(
    8,
  );
  result.narrowScrollGeometry = {
    viewport: { width: 375, height: 250 },
    trigger: triggerBox,
    menu: menuBox,
  };
  await popover.screenshot({
    path: join(screenshots, `${testInfo.project.name}-narrow-scroll-menu.png`),
  });
  check(
    "narrow scrolled fourth-Post menu remains viewport-contained and anchor-adjacent",
  );

  await page.keyboard.press("Tab");
  await expect(popover.getByRole("link", { name: "Edit" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(popover).not.toBeVisible();
  await expect(secondTrigger).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(popover).toBeVisible();
  await popover.getByRole("link", { name: "History" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/history$/);
  check(
    "native keyboard opens, tabs into, closes, and selects the Actions menu without reload workarounds",
  );

  allowSecondBoot(
    page,
    "cold-load the selected public Theme route for isolation inspection",
  );
  await goto(page, "/~testoperator", { timeout: firstNav });
  const isolation = await page.evaluate(() => {
    const root = document.querySelector(".j-root");
    const surface = document.querySelector("[data-jaunder-theme-surface]");
    const trigger = document.querySelector<HTMLElement>(
      ".j-post-action-trigger",
    );
    const menu = document.querySelector<HTMLElement>("[popover]");
    const style = document.querySelector<HTMLLinkElement>(
      "link[data-jaunder-theme-stylesheet]",
    );
    return {
      rootTheme: root?.getAttribute("data-theme"),
      triggerInsideSurface: !!surface?.contains(trigger),
      menuInsideSurface: !!surface?.contains(menu),
      triggerFont: trigger ? getComputedStyle(trigger).fontFamily : "",
      menuFont: menu ? getComputedStyle(menu).fontFamily : "",
      stylesheet: style?.getAttribute("href") ?? "",
    };
  });
  expect(isolation.rootTheme).toBe("custom");
  expect(isolation.triggerInsideSurface).toBe(false);
  expect(isolation.menuInsideSurface).toBe(false);
  expect(isolation.stylesheet).toMatch(/^\/theme\/[0-9a-f]{64}$/);
  check(
    "custom Theme surface excludes trusted Actions trigger and menu; immutable Theme stylesheet is loaded only for public presentation",
  );

  allowSecondBoot(
    page,
    "cold-load Studio for the supported custom-theme recovery workflow",
  );
  await goto(page, "/themes", { timeout: firstNav });
  await expect(page.locator(".j-root")).toHaveAttribute("data-theme", "studio");
  await selection.selectOption("studio");
  allowSecondBoot(
    page,
    "cold-load the recovered public Studio route after supported selection",
  );
  await goto(page, "/~testoperator", { timeout: firstNav });
  await expect(page.locator(".j-root")).toHaveAttribute("data-theme", "studio");
  await expect(page.getByRole("button", { name: "Actions" })).toHaveCount(4);
  check(
    "Studio is unthemed and supported selection recovery restores trusted controls",
  );

  const anonymous = await tracedContext();
  try {
    const anonymousPage = await anonymous.newPage();
    await goto(anonymousPage, "/~testoperator", { timeout: firstNav });
    await expect(
      anonymousPage.getByRole("button", { name: "Actions" }),
    ).toHaveCount(0);
    check("anonymous public view has no owner mutation controls");
  } finally {
    await anonymous.close();
  }
  await writeFile(
    join(logs, `${testInfo.project.name}-trusted-controls-evidence.json`),
    `${JSON.stringify(result, null, 2)}\n`,
  );
});
