/* Durable focused proof that a canonical package's CSS loads its declared font. */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test, expect, setTestBudget } from "./fixtures";
import { BASE_URL, goto, signInAs } from "./helpers";

const zipPath = process.env.THEME_TAILWIND_ZIP;
const evidenceDirectory = process.env.THEME_TAILWIND_EVIDENCE_DIR;
const expectedZipSha256 = process.env.THEME_TAILWIND_ZIP_SHA256;
if (!zipPath || !evidenceDirectory || !expectedZipSha256)
  throw new Error("THEME_TAILWIND_ZIP, THEME_TAILWIND_EVIDENCE_DIR, and THEME_TAILWIND_ZIP_SHA256 are required");

const sha256 = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const fontMember = "assets/inter-latin-regular.woff2";

async function zipMember(path: string): Promise<Buffer> {
  const { execFile } = await import("node:child_process");
  return new Promise((resolve, reject) =>
    execFile("unzip", ["-p", zipPath!, path], { encoding: "buffer" }, (error, stdout) =>
      error ? reject(error) : resolve(Buffer.from(stdout)),
    ),
  );
}

test("canonical Tailwind package CSS rewrites and loads its declared Inter font", async ({
  page,
  tracedContext,
  firstNav,
}) => {
  setTestBudget(120_000);
  const logs = join(evidenceDirectory!, "logs");
  await mkdir(logs, { recursive: true });
  const zip = await readFile(zipPath!);
  expect(sha256(zip)).toBe(expectedZipSha256);
  const fontDigest = sha256(await zipMember(fontMember));
  const result: Record<string, unknown> = {
    zipSha256: sha256(zip),
    fontMember,
    fontDigest,
  };

  await signInAs(page, "testoperator");
  await goto(page, "/themes", { timeout: firstNav });
  await page.getByRole("button", { name: "Site catalog" }).click();
  const importer = page.locator("section").filter({ hasText: "Import Theme Package" });
  await importer.getByLabel("Theme name").fill("Tailwind canonical font lifecycle");
  await importer.getByLabel("Theme Package ZIP").setInputFiles(zipPath!);
  const mutation = (path: string) => page.waitForResponse((response) =>
    new URL(response.url()).pathname === path && response.request().method() === "POST",
  );
  await Promise.all([
    mutation("/api/themes/import_zip"),
    importer.getByRole("button", { name: "Import ZIP draft" }).click(),
  ]);
  await page.getByRole("button", { name: "Tailwind canonical font lifecycle" }).click();
  await Promise.all([
    mutation("/api/themes/preview"),
    page.getByRole("button", { name: "Preview draft" }).click(),
  ]);
  await Promise.all([
    mutation("/api/themes/publish"),
    page.getByRole("button", { name: "Publish", exact: true }).click(),
  ]);
  const selection = page.getByLabel("Public selection");
  const themeId = await selection
    .getByRole("option", { name: "Tailwind canonical font lifecycle" })
    .getAttribute("value");
  expect(themeId).not.toBeNull();
  await Promise.all([mutation("/api/themes/select"), selection.selectOption(themeId!)]);

  const publicContext = await tracedContext();
  try {
    const publicPage = await publicContext.newPage();
    await goto(publicPage, "/", { timeout: firstNav });
    await expect(publicPage.locator(".j-root")).toHaveAttribute("data-theme", "custom");
    const stylesheet = await publicPage.locator("link[data-jaunder-theme-stylesheet]").getAttribute("href");
    expect(stylesheet).not.toBeNull();
    const stylesheetResponse = await publicPage.request.get(new URL(stylesheet!, BASE_URL).href);
    expect(stylesheetResponse.ok()).toBeTruthy();
    const css = await stylesheetResponse.text();
    const namespacedFontFamily = css.match(/@font-face\{font-family:([^;]+)/)?.[1];
    expect(namespacedFontFamily).toBeTruthy();
    const fontFamilyReferences = [...css.matchAll(/font-family:([^;}{]+)/g)].map((match) => match[1]);
    expect(fontFamilyReferences).not.toHaveLength(0);
    expect(fontFamilyReferences.every((reference) => reference.includes(namespacedFontFamily!))).toBeTruthy();
    const route = css.match(new RegExp(`/theme/${fontDigest}(?=[)\\"'])`))?.[0];
    expect(route).toBe(`/theme/${fontDigest}`);
    const fontResponse = await publicPage.request.get(new URL(route!, BASE_URL).href);
    expect(fontResponse.ok()).toBeTruthy();
    expect(sha256(await fontResponse.body())).toBe(fontDigest);
    const typography = await publicPage.evaluate(async () => {
      const main = document.querySelector('[data-jaunder-part="main"]');
      const navigationRail = document.querySelector('[data-jaunder-part="navigation-rail"]');
      const trustedAction = document.querySelector("#j-trusted-post-actions button");
      const fontFamilyRules = (element: Element | null) => {
        const matched: { selector: string; fontFamily: string }[] = [];
        const collect = (rules: CSSRuleList) => {
          for (const rule of rules) {
            if (rule instanceof CSSStyleRule && rule.style.fontFamily) {
              try {
                if (element?.matches(rule.selectorText))
                  matched.push({ selector: rule.selectorText, fontFamily: rule.style.fontFamily });
              } catch {
                // A browser-specific selector cannot affect this assertion.
              }
            } else if ("cssRules" in rule) {
              collect((rule as CSSGroupingRule).cssRules);
            }
          }
        };
        for (const sheet of document.styleSheets) {
          try {
            collect(sheet.cssRules);
          } catch {
            // Cross-origin sheets are not readable; the package sheet is same-origin.
          }
        }
        return matched;
      };
      const mainFamily = main ? getComputedStyle(main).fontFamily : "";
      const navigationRailFamily = navigationRail ? getComputedStyle(navigationRail).fontFamily : "";
      const requestedFamily = navigationRailFamily.split(",")[0].replaceAll('"', "").trim();
      await document.fonts.load(`16px "${requestedFamily}"`);
      await document.fonts.ready;
      const loadedFamily = [...document.fonts]
        .filter((face) => face.status === "loaded")
        .map((face) => face.family)
        .find((family) => navigationRailFamily.includes(family.replaceAll('"', "")));
      return {
        mainFamily,
        navigationRailFamily,
        trustedActionFamily: trustedAction ? getComputedStyle(trustedAction).fontFamily : null,
        mainMatchedFontFamilyRules: fontFamilyRules(main),
        navigationRailMatchedFontFamilyRules: fontFamilyRules(navigationRail),
        fontFaces: [...document.fonts].map((face) => ({ family: face.family, status: face.status })),
        loadedFamily: loadedFamily ?? null,
        fontCheck: loadedFamily ? document.fonts.check(`16px "${loadedFamily}"`) : false,
      };
    });
    expect(typography.loadedFamily, JSON.stringify(typography)).not.toBeNull();
    expect(typography.fontCheck).toBeTruthy();
    expect(typography.mainFamily).toContain(typography.loadedFamily!.replaceAll('"', ""));
    expect(typography.navigationRailFamily).toContain(typography.loadedFamily!.replaceAll('"', ""));
    expect(typography.navigationRailMatchedFontFamilyRules).toEqual(expect.arrayContaining([
      expect.objectContaining({
        selector: expect.stringContaining("data-jaunder-part"),
        fontFamily: expect.stringContaining(typography.loadedFamily!.replaceAll('"', "")),
      }),
    ]));
    if (typography.trustedActionFamily)
      expect(typography.trustedActionFamily).not.toContain(typography.loadedFamily!.replaceAll('"', ""));
    Object.assign(result, {
      stylesheet,
      namespacedFontFamily,
      fontFamilyReferences,
      rewrittenFontRoute: route,
      typography,
    });
  } finally {
    await publicContext.close();
  }
  await writeFile(join(logs, "canonical-font-lifecycle.json"), `${JSON.stringify(result, null, 2)}\n`);
});
