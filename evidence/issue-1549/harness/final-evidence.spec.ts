/*
 * Durable Chromium route, visual, accessibility, focus, and zoom evidence for
 * jaunder-org/theme-tailwind PR #1. Copy temporarily to end2end/tests and run
 * with cargo xtask e2e-local. THEME_TAILWIND_ZIP is the sole package input.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test, expect, setTestBudget } from "./fixtures";
import { expectAccessible } from "./accessibility";
import { BASE_URL, click, goto, signInAs } from "./helpers";
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
type Scheme = "light" | "dark";
type Viewport = readonly [number, number];

const ratio = (foreground: number[], background: number[]) => {
  const luminance = (rgb: number[]) =>
    rgb
      .map((value) => {
        const channel = value / 255;
        return channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4;
      })
      .reduce(
        (total, channel, index) =>
          total + channel * [0.2126, 0.7152, 0.0722][index],
        0,
      );
  const [a, b] = [luminance(foreground), luminance(background)].sort(
    (left, right) => right - left,
  );
  return (a + 0.05) / (b + 0.05);
};

const assertContained = async (
  page: Parameters<typeof goto>[0],
  width: number,
) => {
  const containment = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    paintedRight: Math.max(
      ...Array.from(document.querySelectorAll("body *")).map((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return style.display === "none" || style.visibility === "hidden"
          ? 0
          : rect.right;
      }),
    ),
  }));
  expect(containment.documentWidth).toBeLessThanOrEqual(width);
  expect(Math.ceil(containment.paintedRight)).toBeLessThanOrEqual(width);
  return containment;
};

test("external Tailwind package final Chromium route, visual, accessibility, focus, and zoom evidence", async ({
  page,
  tracedContext,
  firstNav,
}) => {
  setTestBudget(180_000);
  const pairs = join(evidenceDirectory, "final-pairs");
  const routes = join(evidenceDirectory, "final-routes");
  const logs = join(evidenceDirectory, "logs");
  await Promise.all([
    mkdir(pairs, { recursive: true }),
    mkdir(routes, { recursive: true }),
    mkdir(logs, { recursive: true }),
  ]);
  const zip = await readFile(zipPath);
  const zipSha256 = createHash("sha256").update(zip).digest("hex");
  expect(zipSha256).toBe(expectedZipSha256);
  const result: Record<string, unknown> = {
    zipPath,
    zipSha256,
    checks: [],
    focus: [],
    containment: [],
    rendererStateMatrix: {},
  };
  const check = (name: string) => (result.checks as string[]).push(name);
  const mutation = (endpoint: keyof typeof endpoints) =>
    page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === endpoints[endpoint] &&
        response.request().method() === "POST",
    );

  await signInAs(page, "testoperator");
  const known = await createPostViaApi(page, {
    body:
      "# Route proof title\n\nRoute proof summary with [known permalink link](https://example.invalid).\n\n- one\n- two\n\n> quoted route proof\n\n`code`\n\n" +
      "unbroken-token-".repeat(80),
    tags: ["route-proof"],
  });
  const summaryUpdate = await page.request.post(
    `${BASE_URL}/api/posts/update`,
    {
      data: {
        post_id: known.post_id,
        post: {
          body:
            "# Route proof title\n\nRoute proof summary with [known permalink link](https://example.invalid).\n\n- one\n- two\n\n> quoted route proof\n\n`code`\n\n" +
            "unbroken-token-".repeat(80),
          format: "markdown",
          slug_override: null,
          publish: true,
          tags: ["route-proof"],
          summary: "Route proof summary",
        },
      },
    },
  );
  expect(
    summaryUpdate.ok(),
    `posts::update failed (${summaryUpdate.status()}): ${await summaryUpdate.text()}`,
  ).toBeTruthy();
  const untitled = await createPostViaApi(page, {
    body: "Untitled route proof body",
  });
  for (let index = 2; index < 51; index += 1)
    await createPostViaApi(page, {
      body: `# Route matrix Post ${index}\n\nBody ${index}`,
    });
  const authorPath = "/~testoperator";
  const tagPath = "/tags/route-proof";
  const semanticHooks = [
    "masthead",
    "site-title",
    "main",
    "post-list",
    "post",
    "post-header",
    "author-handle",
    "post-body",
    "tag-list",
  ];

  // Studio baseline uses the same anonymous route/content conditions as every After image.
  const studio = await tracedContext();
  try {
    for (const [routeName, route] of [
      ["local", "/"],
      ["permalink", known.permalink],
    ] as const) {
      for (const [scheme, schemeName] of [
        ["light", "light"],
        ["dark", "dark"],
      ] as const) {
        for (const viewport of [
          [1440, 900],
          [390, 844],
        ] as const) {
          const before = await studio.newPage();
          try {
            await before.emulateMedia({
              colorScheme: scheme,
              reducedMotion: "reduce",
            });
            await before.setViewportSize({
              width: viewport[0],
              height: viewport[1],
            });
            await goto(before, route, { timeout: firstNav });
            await expect(before.locator(".j-root")).toHaveAttribute(
              "data-theme",
              "studio",
            );
            await before.screenshot({
              path: join(
                pairs,
                `studio-before-${routeName}-${viewport[0]}x${viewport[1]}-${schemeName}.png`,
              ),
            });
          } finally {
            await before.close();
          }
        }
      }
    }
  } finally {
    await studio.close();
  }
  check(
    "Studio Before captures use matching Local and known-permalink routes in light and dark",
  );

  await goto(page, "/themes", { timeout: firstNav });
  await expect(page.locator(".j-root")).toHaveAttribute("data-theme", "studio");
  await page.getByRole("button", { name: "Site catalog" }).click();
  const importer = page
    .locator("section")
    .filter({ hasText: "Import Theme Package" });
  await importer
    .getByLabel("Theme name")
    .fill("Tailwind route visual evidence");
  await importer.getByLabel("Theme Package ZIP").setInputFiles(zipPath);
  await Promise.all([
    mutation("import_zip"),
    importer.getByRole("button", { name: "Import ZIP draft" }).click(),
  ]);
  await page
    .getByRole("button", { name: "Tailwind route visual evidence" })
    .click();
  await Promise.all([
    mutation("preview"),
    page.getByRole("button", { name: "Preview draft" }).click(),
  ]);
  await expect(
    page.getByTitle("Isolated theme preview").contentFrame().locator("body"),
  ).toContainText("Jaunder");
  await Promise.all([
    mutation("publish"),
    page.getByRole("button", { name: "Publish", exact: true }).click(),
  ]);
  const selection = page.getByLabel("Public selection");
  const themeId = await selection
    .getByRole("option", { name: "Tailwind route visual evidence" })
    .getAttribute("value");
  expect(themeId).not.toBeNull();
  await Promise.all([mutation("select"), selection.selectOption(themeId!)]);
  check(
    "real ZIP import, private preview, publish, and explicit public selection passed",
  );

  const publicContext = await tracedContext();
  try {
    const publicPage = await publicContext.newPage();
    let publicPageHasBooted = false;
    const visit = async (route: string, scheme: Scheme, viewport: Viewport) => {
      await publicPage.emulateMedia({
        colorScheme: scheme,
        reducedMotion: "reduce",
      });
      await publicPage.setViewportSize({
        width: viewport[0],
        height: viewport[1],
      });
      if (publicPageHasBooted) {
        allowSecondBoot(
          publicPage,
          "each final visual route capture deliberately cold-loads its named route",
        );
      }
      await goto(publicPage, route, { timeout: firstNav });
      publicPageHasBooted = true;
      await expect(publicPage.locator(".j-root")).toHaveAttribute(
        "data-theme",
        "custom",
      );
      await expect(
        publicPage.locator("link[data-jaunder-theme-stylesheet]"),
      ).toHaveCount(1);
    };
    await visit("/", "light", [1440, 900]);
    await expect(publicPage.locator('[data-jaunder-part="post"]')).toHaveCount(
      50,
    );
    await expect(
      publicPage.getByRole("button", { name: "Load more" }),
    ).toBeVisible();
    (result.rendererStateMatrix as Record<string, unknown>)[
      "local-continuation-before-activation"
    ] = { route: "/", continuation: 1 };
    await click(publicPage, '[data-jaunder-part="continuation"]');
    await expect(publicPage.locator('[data-jaunder-part="post"]')).toHaveCount(
      51,
    );
    const knownPost = publicPage
      .locator('[data-jaunder-part="post"]')
      .filter({ hasText: "Route proof title" });
    await expect(knownPost).toHaveCount(1);
    await expect(
      knownPost.locator('[data-jaunder-part="post-title"]'),
    ).toBeVisible();
    await expect(
      knownPost.locator('[data-jaunder-part="post-summary"]'),
    ).toBeVisible();
    await expect(
      knownPost.locator('[data-jaunder-part="avatar"]'),
    ).toBeVisible();
    await expect(knownPost.locator('[data-jaunder-part="tag"]')).toContainText(
      "route-proof",
    );
    await expect(
      knownPost.locator('[data-jaunder-part="post-body"]'),
    ).toContainText("unbroken-token-unbroken-token");
    const bodyLinkDecoration = await knownPost
      .locator(
        '[data-jaunder-part="post-body"] a[href="https://example.invalid"]',
      )
      .evaluate((link) => {
        const style = getComputedStyle(link);
        return {
          line: style.textDecorationLine,
          thickness: style.textDecorationThickness,
          offset: style.textUnderlineOffset,
        };
      });
    expect(bodyLinkDecoration.line).toContain("underline");
    expect(parseFloat(bodyLinkDecoration.thickness)).toBeGreaterThan(0);
    expect(parseFloat(bodyLinkDecoration.offset)).toBeGreaterThan(0);
    result.bodyLinkDecoration = bodyLinkDecoration;
    await expect(
      publicPage
        .locator('[data-jaunder-part="post"]')
        .filter({ hasText: "Untitled route proof body" })
        .locator('[data-jaunder-part="post-title"]'),
    ).toHaveCount(0);
    const untitledPost = publicPage
      .locator('[data-jaunder-part="post"]')
      .filter({ hasText: "Untitled route proof body" });
    await expect(
      untitledPost.locator('[data-jaunder-part="post-summary"]'),
    ).toHaveCount(0);
    await expect(untitledPost.locator('[data-jaunder-part="tag"]')).toHaveCount(
      0,
    );
    const stateFor = async (
      name: string,
      route: string,
      post: typeof knownPost,
    ) => {
      const state = {
        route: name,
        url: route,
        title: await post.locator('[data-jaunder-part="post-title"]').count(),
        summary: await post
          .locator('[data-jaunder-part="post-summary"]')
          .count(),
        tags: await post.locator('[data-jaunder-part="tag"]').count(),
        avatar: await post.locator('[data-jaunder-part="avatar"]').count(),
        authorHandle: await post
          .locator('[data-jaunder-part="author-handle"]')
          .count(),
        sourceAttribution: await post
          .locator('[data-jaunder-part="source-attribution"]')
          .count(),
        continuation: await publicPage
          .locator('[data-jaunder-part="continuation"]')
          .count(),
      };
      (result.rendererStateMatrix as Record<string, unknown>)[name] = state;
      return state;
    };
    const localKnownState = await stateFor("local-known", "/", knownPost);
    const localUntitledState = await stateFor(
      "local-untitled",
      "/",
      untitledPost,
    );
    expect(localKnownState).toMatchObject({
      title: 1,
      summary: 1,
      tags: 1,
      avatar: 1,
      authorHandle: 1,
      sourceAttribution: 0,
      continuation: 0,
    });
    expect(localUntitledState).toMatchObject({
      title: 0,
      summary: 0,
      tags: 0,
      avatar: 1,
      authorHandle: 1,
      sourceAttribution: 0,
      continuation: 0,
    });
    for (const hook of semanticHooks)
      await expect(
        publicPage.locator(`[data-jaunder-part="${hook}"]`).first(),
      ).toBeAttached();
    await expect(
      publicPage.locator('[data-jaunder-part="logo"]'),
    ).toBeVisible();
    await expect(
      publicPage.locator('[data-jaunder-part="header-image"]'),
    ).toBeVisible();
    await expectAccessible(publicPage);
    check(
      "Local real renderer states include present/absent title, summary, and tags; always-present avatar/author handle; absent source attribution; and present continuation",
    );

    await visit(authorPath, "light", [390, 844]);
    const authorFirst = publicPage
      .locator('[data-jaunder-part="post"]')
      .first();
    expect(
      await stateFor("author-first-page", authorPath, authorFirst),
    ).toMatchObject({
      title: 1,
      avatar: 1,
      authorHandle: 1,
      sourceAttribution: 0,
      continuation: 1,
    });
    await visit(tagPath, "light", [390, 844]);
    const tagKnown = publicPage
      .locator('[data-jaunder-part="post"]')
      .filter({ hasText: "Route proof title" });
    expect(await stateFor("tag-known", tagPath, tagKnown)).toMatchObject({
      title: 1,
      summary: 1,
      tags: 1,
      avatar: 1,
      authorHandle: 1,
      sourceAttribution: 0,
      continuation: 0,
    });
    await visit(known.permalink, "light", [390, 844]);
    expect(
      await stateFor(
        "permalink-known",
        known.permalink,
        publicPage.locator('[data-jaunder-part="post"]'),
      ),
    ).toMatchObject({
      title: 1,
      summary: 1,
      tags: 1,
      avatar: 1,
      authorHandle: 1,
      sourceAttribution: 0,
      continuation: 0,
    });
    await visit(untitled.permalink, "light", [390, 844]);
    expect(
      await stateFor(
        "permalink-untitled",
        untitled.permalink,
        publicPage.locator('[data-jaunder-part="post"]'),
      ),
    ).toMatchObject({
      title: 0,
      summary: 0,
      tags: 0,
      avatar: 1,
      authorHandle: 1,
      sourceAttribution: 0,
      continuation: 0,
    });
    check(
      "author, tag, and permalink use only real renderer states; tag and permalink prove absent continuation without DOM mutation or storage backdoors",
    );

    for (const [routeName, route] of [
      ["local", "/"],
      ["permalink", known.permalink],
    ] as const)
      for (const scheme of ["light", "dark"] as const)
        for (const viewport of [
          [1440, 900],
          [390, 844],
        ] as const) {
          await visit(route, scheme, viewport);
          await publicPage.screenshot({
            path: join(
              pairs,
              `theme-after-${routeName}-${viewport[0]}x${viewport[1]}-${scheme}.png`,
            ),
          });
        }
    for (const [routeName, route] of [
      ["local", "/"],
      ["author", authorPath],
      ["tag", tagPath],
      ["permalink", known.permalink],
    ] as const)
      for (const scheme of ["light", "dark"] as const) {
        await visit(route, scheme, [390, 844]);
        await expectAccessible(publicPage);
        await publicPage.screenshot({
          path: join(
            routes,
            `tailwind-final-${routeName}-390x844-${scheme}.png`,
          ),
        });
      }
    check(
      "Local, author, tag, and known permalink pass Axe in light/dark and have final 390x844 captures",
    );

    await visit(known.permalink, "light", [390, 844]);
    (result.containment as unknown[]).push({
      viewport: "390x844",
      ...(await assertContained(publicPage, 390)),
    });
    await publicPage.setViewportSize({ width: 320, height: 844 });
    (result.containment as unknown[]).push({
      viewport: "320x844",
      ...(await assertContained(publicPage, 320)),
    });
    check(
      "390px and true 320 CSS-pixel document and painted-content containment passed with reduced motion requested",
    );

    const tabToBodyLink = async () => {
      await publicPage.evaluate(() =>
        (document.activeElement as HTMLElement | null)?.blur(),
      );
      const target = publicPage.locator('[data-jaunder-part="post-body"] a');
      const path: string[] = [];
      for (let step = 0; step < 80; step += 1) {
        await publicPage.keyboard.press("Tab");
        const active = await publicPage.evaluate(() => {
          const element = document.activeElement as HTMLElement | null;
          return element?.getAttribute("href") ?? element?.tagName ?? null;
        });
        path.push(active ?? "null");
        if (await target.evaluate((link) => document.activeElement === link)) {
          await publicPage.keyboard.press("Shift+Tab");
          const reverse = await publicPage.evaluate(() => {
            const element = document.activeElement as HTMLElement | null;
            return element?.getAttribute("href") ?? element?.tagName ?? null;
          });
          expect(reverse).not.toBe("https://example.invalid");
          await publicPage.keyboard.press("Tab");
          await expect(target).toBeFocused();
          return { target, path, reverse };
        }
      }
      throw new Error(
        `Tab traversal did not reach the public post-body link: ${path.join(" -> ")}`,
      );
    };
    for (const scheme of ["light", "dark"] as const) {
      await visit(known.permalink, scheme, [390, 844]);
      const { target, path, reverse } = await tabToBodyLink();
      const focus = await target.evaluate((link) => {
        const style = getComputedStyle(link);
        const rgb = (value: string) =>
          (value.match(/\d+/g) ?? []).slice(0, 3).map(Number);
        let surface: Element | null = link.parentElement;
        while (
          surface &&
          ["rgba(0, 0, 0, 0)", "transparent"].includes(
            getComputedStyle(surface).backgroundColor,
          )
        )
          surface = surface.parentElement;
        return {
          focused: document.activeElement === link,
          outlineWidth: style.outlineWidth,
          outlineColor: style.outlineColor,
          surfaceColor: getComputedStyle(surface ?? document.body)
            .backgroundColor,
          outlineRgb: rgb(style.outlineColor),
          surfaceRgb: rgb(
            getComputedStyle(surface ?? document.body).backgroundColor,
          ),
        };
      });
      expect(focus.focused).toBe(true);
      expect(focus.outlineWidth).toBe("3px");
      const contrast = ratio(focus.outlineRgb, focus.surfaceRgb);
      expect(contrast).toBeGreaterThanOrEqual(3);
      (result.focus as unknown[]).push({
        scheme,
        traversal: "body blur -> Tab -> Shift+Tab -> Tab",
        path,
        reverse,
        ...focus,
        contrast,
      });
    }
    check(
      "deterministic body-blur then Tab/Shift+Tab traversal reached and returned to the public permalink link with 3px outline and >=3:1 calculated contrast in light/dark",
    );

    await visit(known.permalink, "light", [390, 844]);
    const cdp = await publicPage.context().newCDPSession(publicPage);
    await cdp.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
    const scale = await publicPage.evaluate(() => visualViewport?.scale);
    expect(scale).toBe(2);
    await expect(
      publicPage.locator('[data-jaunder-part="post-body"]'),
    ).toBeVisible();
    const zoomLink = publicPage.locator('[data-jaunder-part="post-body"] a');
    await publicPage.evaluate(() =>
      (document.activeElement as HTMLElement | null)?.blur(),
    );
    for (let step = 0; step < 80; step += 1) {
      await publicPage.keyboard.press("Tab");
      if (await zoomLink.evaluate((link) => document.activeElement === link))
        break;
    }
    await expect(zoomLink).toBeFocused();
    await zoomLink.evaluate((link) => {
      (
        window as Window & { themeEvidenceActivations?: number }
      ).themeEvidenceActivations = 0;
      link.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          (
            window as Window & { themeEvidenceActivations?: number }
          ).themeEvidenceActivations! += 1;
        },
        { once: true },
      );
    });
    await publicPage.keyboard.press("Enter");
    expect(
      await zoomLink.evaluate(
        () =>
          (window as Window & { themeEvidenceActivations?: number })
            .themeEvidenceActivations,
      ),
    ).toBe(1);
    await publicPage.screenshot({
      path: join(routes, "tailwind-final-permalink-200pct.png"),
    });
    await cdp.detach();
    result.zoom = {
      pageScaleFactor: scale,
      route: known.permalink,
      readable: true,
      operable: true,
    };
    check(
      "exact Chromium 200% page scale permalink is visible, readable, operable, and captured",
    );
  } finally {
    await publicContext.close();
  }

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
    check("Studio remains unthemed and usable for recovery after selection");
  } finally {
    await recovery.close();
  }
  await writeFile(
    join(logs, "chromium-routes-visual-final.json"),
    JSON.stringify(result, null, 2) + "\n",
  );
});
