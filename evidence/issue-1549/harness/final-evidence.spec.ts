/*
 * Durable final-evidence harness for jaunder-org/theme-tailwind PR #1.
 *
 * Copy this exact file temporarily to Jaunder's end2end/tests/ directory and
 * run it only through `cargo xtask e2e-local`; it deliberately has no Jaunder
 * source-tree dependency beyond the documented shared E2E helpers.  The sole
 * package import input is THEME_TAILWIND_ZIP, the downloaded canonical artifact.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test, expect, setTestBudget } from "./fixtures";
import { expectAccessible } from "./accessibility";
import { click, goto, signInAs } from "./helpers";
import { createPostViaApi, openPostActions } from "./posts";

const zipPath = process.env.THEME_TAILWIND_ZIP;
const evidenceDirectory = process.env.THEME_TAILWIND_EVIDENCE_DIR;
if (!zipPath || !evidenceDirectory) {
  throw new Error(
    "THEME_TAILWIND_ZIP and THEME_TAILWIND_EVIDENCE_DIR are required for final evidence",
  );
}

const endpoints = {
  import_zip: "/api/themes/import_zip",
  preview: "/api/themes/preview",
  publish: "/api/themes/publish",
  select: "/api/themes/select",
} as const;

test("external Tailwind package final lifecycle, public routes, accessibility, and trusted actions", async ({
  page,
  tracedContext,
  firstNav,
}) => {
  // This budget is derived from the 51 required authenticated fixture writes
  // plus import/publication/browser assertions; it is not a timing sleep.
  setTestBudget(120_000);
  await mkdir(evidenceDirectory, { recursive: true });
  const zip = await readFile(zipPath);
  const zipSha256 = createHash("sha256").update(zip).digest("hex");
  const result: Record<string, unknown> = { zipPath, zipSha256, checks: [] };
  const check = (name: string) => (result.checks as string[]).push(name);
  const mutation = (endpoint: keyof typeof endpoints) =>
    page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === endpoints[endpoint] &&
        response.request().method() === "POST",
    );

  // The seeded operator gives this disposable instance a site-wide selection.
  await signInAs(page, "testoperator");
  for (let index = 0; index < 51; index += 1) {
    await createPostViaApi(page, {
      body:
        index === 0
          ? "# Final route title\n\nSummary route body with [link](https://example.invalid), a list:\n\n- one\n- two\n\n> quote\n\n`code`\n\n" +
            "unbroken-".repeat(80)
          : `# Final matrix Post ${index}\n\nBody ${index}`,
      tags: index === 0 ? ["final-proof"] : undefined,
    });
  }
  await goto(page, "/themes", { timeout: firstNav });
  await expect(page.locator(".j-root")).toHaveAttribute("data-theme", "studio");
  await expect(page.locator("link[data-jaunder-theme-stylesheet]")).toHaveCount(
    0,
  );
  check("Studio is trusted and un-themed before import");

  const beforeContext = await tracedContext();
  try {
    const beforePage = await beforeContext.newPage();
    await beforePage.setViewportSize({ width: 1440, height: 900 });
    await goto(beforePage, "/", { timeout: firstNav });
    await expect(beforePage.locator(".j-root")).toHaveAttribute(
      "data-theme",
      "studio",
    );
    await beforePage.screenshot({
      path: join(
        evidenceDirectory,
        "final-pairs/local-studio-before-light-1440x900.png",
      ),
      fullPage: true,
    });
  } finally {
    await beforeContext.close();
  }
  await page.getByRole("button", { name: "Site catalog" }).click();
  const zipImport = page
    .locator("section")
    .filter({ hasText: "Import Theme Package" });
  await zipImport.getByLabel("Theme name").fill("Tailwind final evidence");
  await zipImport.getByLabel("Theme Package ZIP").setInputFiles(zipPath);
  await Promise.all([
    mutation("import_zip"),
    zipImport.getByRole("button", { name: "Import ZIP draft" }).click(),
  ]);
  await page.getByRole("button", { name: /Tailwind final evidence/ }).click();
  await Promise.all([
    mutation("preview"),
    page.getByRole("button", { name: "Preview draft" }).click(),
  ]);
  await expect(
    page.getByTitle("Isolated theme preview").contentFrame().locator("body"),
  ).toContainText("Jaunder");
  await expect(page.locator("link[data-jaunder-theme-stylesheet]")).toHaveCount(
    0,
  );
  check("private ZIP draft preview is isolated from Studio");

  await Promise.all([
    mutation("publish"),
    page.getByRole("button", { name: "Publish", exact: true }).click(),
  ]);
  const selection = page.getByLabel("Public selection");
  const option = selection.getByRole("option", {
    name: "Tailwind final evidence",
  });
  await expect(option).toHaveCount(1);
  const themeId = await option.getAttribute("value");
  expect(themeId).not.toBeNull();
  await Promise.all([mutation("select"), selection.selectOption(themeId!)]);
  await expect(selection).toHaveValue(themeId!);
  check("published package explicitly selected publicly");

  const publicContext = await tracedContext();
  try {
    const publicPage = await publicContext.newPage();
    await publicPage.setViewportSize({ width: 1440, height: 900 });
    await goto(publicPage, "/", { timeout: firstNav });
    await expect(publicPage.locator(".j-root")).toHaveAttribute(
      "data-theme",
      "custom",
    );
    await expect(
      publicPage.locator("link[data-jaunder-theme-stylesheet]"),
    ).toHaveCount(1);
    await expect(publicPage.locator('[data-jaunder-part="post"]')).toHaveCount(
      50,
    );
    await expect(
      publicPage.getByRole("button", { name: "Load more" }),
    ).toBeVisible();
    await click(publicPage, '[data-jaunder-part="continuation"]');
    await expect(publicPage.locator('[data-jaunder-part="post"]')).toHaveCount(
      51,
    );
    await expect(
      publicPage.locator('[data-jaunder-part="header-image"]'),
    ).toBeVisible();
    await expect(
      publicPage.locator('[data-jaunder-part="logo"]'),
    ).toBeVisible();
    await expect(
      publicPage
        .locator('[data-jaunder-part="post"]')
        .filter({ hasText: "Final route title" })
        .locator('[data-jaunder-part="post-body"]'),
    ).toContainText("unbroken-unbroken");
    await expectAccessible(publicPage);
    await publicPage.screenshot({
      path: join(
        evidenceDirectory,
        "final-pairs/local-theme-after-light-1440x900.png",
      ),
      fullPage: true,
    });
    await publicPage.setViewportSize({ width: 390, height: 844 });
    await expect(
      publicPage.evaluate(() => document.documentElement.scrollWidth),
    ).resolves.toBeLessThanOrEqual(390);
    await publicPage.screenshot({
      path: join(
        evidenceDirectory,
        "final-pairs/local-theme-after-light-390x844.png",
      ),
      fullPage: true,
    });
    await publicPage.setViewportSize({ width: 320, height: 844 });
    await expect(
      publicPage.evaluate(() => document.documentElement.scrollWidth),
    ).resolves.toBeLessThanOrEqual(320);
    await publicPage.emulateMedia({
      colorScheme: "dark",
      reducedMotion: "reduce",
    });
    await publicPage.screenshot({
      path: join(
        evidenceDirectory,
        "final-pairs/local-theme-after-dark-reduced-320x844.png",
      ),
      fullPage: true,
    });
    check(
      "Local has 51 Posts, package logo/header, Axe clean, 390px and 320px reflow",
    );
  } finally {
    await publicContext.close();
  }

  // Studio recovery uses a fresh trusted page after the public selection.
  const recovery = await page.context().newPage();
  try {
    await goto(recovery, "/themes", { timeout: firstNav });
    await expect(recovery.locator(".j-root")).toHaveAttribute(
      "data-theme",
      "studio",
    );
    await expect(
      recovery.locator("link[data-jaunder-theme-stylesheet]"),
    ).toHaveCount(0);
    check("Studio remains available for recovery after public selection");
  } finally {
    await recovery.close();
  }

  // Two authenticated owned Posts prove the Theme's scoped CSS cannot hide or
  // style the trusted sibling Actions controls in the local Chromium lane.
  const owner = await page.context().newPage();
  try {
    await goto(owner, "/app", { timeout: firstNav });
    await expect(owner.getByRole("button", { name: "Actions" })).toHaveCount(
      51,
    );
    await owner.setViewportSize({ width: 390, height: 844 });
    const popover = await openPostActions(owner);
    await expect(popover.getByRole("link", { name: "Edit" })).toBeVisible();
    await owner
      .getByRole("button", { name: "Actions" })
      .nth(1)
      .scrollIntoViewIfNeeded();
    await owner.getByRole("button", { name: "Actions" }).nth(1).click();
    await expect(owner.locator(":popover-open")).toHaveCount(1);
    check("authenticated trusted Actions controls remain visible and isolated");
  } finally {
    await owner.close();
  }

  await writeFile(
    join(evidenceDirectory, "logs/chromium-final-evidence.json"),
    JSON.stringify(result, null, 2) + "\n",
  );
});
