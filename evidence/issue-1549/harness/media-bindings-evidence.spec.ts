/* Durable Chromium evidence for package and owner-Media presentation bindings. */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { deflateSync } from "node:zlib";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { test, expect, setTestBudget } from "./fixtures";
import { BASE_URL, goto, signInAs } from "./helpers";
import { allowSecondBoot } from "./bootBudget";

const execFile = promisify(execFileCallback);
const zipPath = process.env.THEME_TAILWIND_ZIP;
const evidenceDirectory = process.env.THEME_TAILWIND_EVIDENCE_DIR;
const expectedZipSha256 = process.env.THEME_TAILWIND_ZIP_SHA256;
if (!zipPath || !evidenceDirectory || !expectedZipSha256)
  throw new Error(
    "THEME_TAILWIND_ZIP, THEME_TAILWIND_EVIDENCE_DIR, and THEME_TAILWIND_ZIP_SHA256 are required",
  );

const endpoints = {
  import_zip: "/api/themes/import_zip",
  preview: "/api/themes/preview",
  publish: "/api/themes/publish",
  select: "/api/themes/select",
  replace_binding: "/api/themes/replace_binding",
  replace_pool: "/api/themes/replace_pool",
  shuffle: "/api/themes/shuffle",
  export: "/api/themes/export",
  upload: "/api/media/upload",
} as const;
type Endpoint = keyof typeof endpoints;
const sha256 = (bytes: Buffer) =>
  createHash("sha256").update(bytes).digest("hex");
const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1)
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});
const crc32 = (bytes: Buffer) =>
  ~bytes.reduce(
    (crc, byte) => crcTable[(crc ^ byte) & 255] ^ (crc >>> 8),
    0xffffffff,
  ) >>> 0;
/** Creates a distinct, valid raster without using a storage or database backdoor. */
const raster = (red: number, green: number, blue: number) => {
  const chunk = (kind: string, body: Buffer) => {
    const type = Buffer.from(kind);
    const length = Buffer.alloc(4);
    length.writeUInt32BE(body.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([type, body])));
    return Buffer.concat([length, type, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(1, 0);
  ihdr.writeUInt32BE(1, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(Buffer.from([0, red, green, blue]))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};

async function zipMember(path: string): Promise<Buffer> {
  const { stdout } = await execFile("unzip", ["-p", zipPath!, path], {
    encoding: "buffer",
  });
  return Buffer.from(stdout);
}
async function zipMembers(path: string): Promise<string[]> {
  const { stdout } = await execFile("unzip", ["-Z1", path], {
    encoding: "utf8",
  });
  return stdout.trim().split("\n").filter(Boolean);
}

test("external Tailwind package Media and explicit header-pool evidence", async ({
  page,
  tracedContext,
  firstNav,
}) => {
  setTestBudget(180_000);
  const root = join(evidenceDirectory!, "media-bindings");
  const screenshots = join(root, "screenshots");
  const logs = join(evidenceDirectory!, "logs");
  await Promise.all([
    mkdir(root, { recursive: true }),
    mkdir(screenshots, { recursive: true }),
    mkdir(logs, { recursive: true }),
  ]);
  const zip = await readFile(zipPath!);
  expect(sha256(zip)).toBe(expectedZipSha256);
  const packageAssets = Object.fromEntries(
    await Promise.all(
      [
        "assets/tailwind-logo.png",
        "assets/header-slate.png",
        "assets/header-dawn.png",
        "assets/inter-latin-regular.woff2",
      ].map(async (path) => [path, sha256(await zipMember(path))]),
    ),
  );
  const result: Record<string, unknown> = {
    zipPath,
    zipSha256: sha256(zip),
    packageAssets,
    pools: [],
    ownedMedia: {},
    screenshots: [],
  };
  const check = (name: string) =>
    ((result.checks ??= []) as string[]).push(name);
  const mutation = (endpoint: Endpoint) =>
    page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === endpoints[endpoint] &&
        response.request().method() === "POST",
    );
  const studioSafe = async (name: string) => {
    await expect(page.locator(".j-root")).toHaveAttribute(
      "data-theme",
      "studio",
    );
    await expect(
      page.locator("link[data-jaunder-theme-stylesheet]"),
    ).toHaveCount(0);
    await expect(
      page
        .getByLabel("Public selection")
        .getByRole("option", { name: "Studio" }),
    ).toHaveCount(1);
    check(`Studio remained un-themed and offers recovery after ${name}`);
  };

  await signInAs(page, "testoperator");
  await goto(page, "/themes", { timeout: firstNav });
  await page.getByRole("button", { name: "Site catalog" }).click();
  const importer = page
    .locator("section")
    .filter({ hasText: "Import Theme Package" });
  await importer
    .getByLabel("Theme name")
    .fill("Tailwind media bindings evidence");
  await importer.getByLabel("Theme Package ZIP").setInputFiles(zipPath!);
  await Promise.all([
    mutation("import_zip"),
    importer.getByRole("button", { name: "Import ZIP draft" }).click(),
  ]);
  await page
    .getByRole("button", { name: "Tailwind media bindings evidence" })
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
    .getByRole("option", { name: "Tailwind media bindings evidence" })
    .getAttribute("value");
  expect(themeId).not.toBeNull();
  await Promise.all([mutation("select"), selection.selectOption(themeId!)]);
  await studioSafe("import, preview, publish, and selection");
  check(
    "exact ZIP import, private preview, publish, and explicit public selection passed",
  );

  const publicContext = await tracedContext();
  try {
    const publicPage = await publicContext.newPage();
    let booted = false;
    const visit = async (route = "/") => {
      if (booted)
        allowSecondBoot(
          publicPage,
          "each media binding observation deliberately cold-loads its public route",
        );
      await goto(publicPage, route, { timeout: firstNav });
      booted = true;
      await expect(publicPage.locator(".j-root")).toHaveAttribute(
        "data-theme",
        "custom",
      );
    };
    const image = async (role: "logo" | "header") => {
      const selector =
        role === "logo"
          ? '[data-jaunder-part="logo"]'
          : '[data-jaunder-part="header-image"]';
      const src = await publicPage.locator(selector).getAttribute("src");
      expect(src).not.toBeNull();
      const response = await publicPage.request.get(
        new URL(src!, BASE_URL).href,
      );
      expect(response.ok()).toBeTruthy();
      return { url: src!, sha256: sha256(await response.body()) };
    };
    const capture = async (name: string) => {
      await publicPage.screenshot({ path: join(screenshots, `${name}.png`) });
      (result.screenshots as string[]).push(
        `media-bindings/screenshots/${name}.png`,
      );
    };
    await visit();
    const packageLogo = await image("logo");
    const packageHeader = await image("header");
    expect(packageLogo.sha256).toBe(packageAssets["assets/tailwind-logo.png"]);
    expect([
      packageAssets["assets/header-slate.png"],
      packageAssets["assets/header-dawn.png"],
    ]).toContain(packageHeader.sha256);
    const stylesheet = await publicPage
      .locator("link[data-jaunder-theme-stylesheet]")
      .getAttribute("href");
    expect(stylesheet).not.toBeNull();
    const fontUrl = new URL(
      `/theme/${packageAssets["assets/inter-latin-regular.woff2"]}`,
      BASE_URL,
    ).href;
    const font = await publicPage.request.get(fontUrl);
    expect(font.ok()).toBeTruthy();
    expect(sha256(await font.body())).toBe(
      packageAssets["assets/inter-latin-regular.woff2"],
    );
    result.packageDefaults = {
      logo: packageLogo,
      header: packageHeader,
      stylesheet,
      font: {
        url: fontUrl,
        sha256: packageAssets["assets/inter-latin-regular.woff2"],
      },
    };
    await capture("package-default");
    check(
      "package logo, font, and declared two-entry default header set served exact committed bytes",
    );

    const pool = async (paths: string[], name: string) => {
      await page
        .getByLabel("Header pool package asset paths")
        .fill(paths.join("\n"));
      await Promise.all([
        mutation("replace_pool"),
        page.getByRole("button", { name: "Save header pool" }).click(),
      ]);
      await studioSafe(name);
      await visit();
      const observed = await image("header");
      (result.pools as unknown[]).push({ name, paths, observed });
      return observed;
    };
    for (const path of [
      "assets/header-slate.png",
      "assets/header-dawn.png",
    ] as const) {
      const observed = await pool([path], `one-entry package pool ${path}`);
      expect(observed.sha256).toBe(packageAssets[path]);
    }
    const complete = await pool(
      ["assets/header-slate.png", "assets/header-dawn.png"],
      "complete package pool",
    );
    await visit();
    expect((await image("header")).sha256).toBe(complete.sha256);
    check(
      "each declared package header asset resolved from its one-entry rendered Studio pool; complete pool was stable for fixed route/state",
    );

    // Use the browser Media page's upload picker, not a database, storage, or test helper.
    allowSecondBoot(
      page,
      "Media evidence deliberately opens the supported Media workflow after Studio",
    );
    await goto(page, "/app", { timeout: firstNav });
    await page.locator("a[href='/media']").click();
    await expect(page.locator(".j-topbar h1")).toHaveText("Media");
    const upload = async (name: string, bytes: Buffer) => {
      const input = page.locator("input[type='file']");
      await Promise.all([
        mutation("upload"),
        input.setInputFiles({ name, mimeType: "image/png", buffer: bytes }),
      ]);
      const link = page.getByRole("link", { name });
      await expect(link).toBeVisible();
      const url = await link.getAttribute("href");
      expect(url).not.toBeNull();
      return { name, url: url!, sha256: sha256(bytes) };
    };
    const ownedLogo = await upload(
      "owned-logo-raster.png",
      raster(211, 47, 47),
    );
    const ownedHeader = await upload(
      "owned-header-raster.png",
      raster(29, 78, 216),
    );
    result.ownedMedia = { logo: ownedLogo, header: ownedHeader };
    allowSecondBoot(
      page,
      "Media evidence returns from the supported Media workflow to Studio controls",
    );
    await goto(page, "/themes", { timeout: firstNav });
    await page.getByRole("button", { name: "Site catalog" }).click();
    await page
      .getByRole("button", { name: "Tailwind media bindings evidence" })
      .click();
    await Promise.all([
      mutation("replace_binding"),
      page
        .getByLabel("Logo image")
        .selectOption({ label: "Media: owned-logo-raster.png" }),
    ]);
    await studioSafe("owned logo binding");
    await visit();
    const observedOwnedLogo = await image("logo");
    expect(observedOwnedLogo.sha256).toBe(ownedLogo.sha256);
    result.ownedLogoBinding = observedOwnedLogo;
    await capture("owned-logo");
    await page.getByLabel("Header pool package asset paths").fill("");
    await page
      .getByLabel("Media to add")
      .selectOption({ label: "owned-header-raster.png" });
    await page.getByRole("button", { name: "Add Media" }).click();
    await Promise.all([
      mutation("replace_pool"),
      page.getByRole("button", { name: "Save header pool" }).click(),
    ]);
    await studioSafe("owned header binding");
    await visit();
    const observedOwnedHeader = await image("header");
    expect(observedOwnedHeader.sha256).toBe(ownedHeader.sha256);
    result.ownedHeaderBinding = observedOwnedHeader;
    await capture("owned-header");
    check(
      "distinct real raster files uploaded through Media UI and bound as owned logo and header served exact bytes publicly",
    );

    await page
      .getByLabel("Header pool package asset paths")
      .fill("assets/header-slate.png");
    // The owned header is already in the rendered pool draft; save creates the mixed typed pool.
    await Promise.all([
      mutation("replace_pool"),
      page.getByRole("button", { name: "Save header pool" }).click(),
    ]);
    await studioSafe("mixed package/owned header pool");
    const mixed: Array<Record<string, string>> = [];
    for (
      let attempt = 0;
      attempt < 8 && new Set(mixed.map(({ sha256 }) => sha256)).size < 2;
      attempt += 1
    ) {
      await visit();
      const observed = await image("header");
      mixed.push({ route: "/", ...observed });
      await Promise.all([
        mutation("shuffle"),
        page.getByRole("button", { name: "Shuffle assignments" }).click(),
      ]);
      await studioSafe(`mixed pool shuffle ${attempt + 1}`);
    }
    const mixedHashes = new Set(mixed.map(({ sha256 }) => sha256));
    expect(mixedHashes).toContain(packageAssets["assets/header-slate.png"]);
    expect(mixedHashes).toContain(ownedHeader.sha256);
    await visit();
    const stableMixed = await image("header");
    await visit();
    expect((await image("header")).sha256).toBe(stableMixed.sha256);
    result.mixedPool = {
      entries: [
        "package_asset:assets/header-slate.png",
        `media:${ownedHeader.url}`,
      ],
      observations: mixed,
      stable: stableMixed,
    };
    await capture("mixed-pool");
    check(
      "mixed package/owned-Media header pool resolved both canonical entry kinds via supported shuffle and remained stable without a mutation",
    );

    const downloaded = page.waitForEvent("download");
    await Promise.all([
      mutation("export"),
      page.getByRole("button", { name: "Export ZIP" }).click(),
    ]);
    const exported = await downloaded;
    const exportedPath = await exported.path();
    expect(exportedPath).not.toBeNull();
    const exportBytes = await readFile(exportedPath!);
    const exportTarget = join(root, "exported-portable-package.zip");
    await writeFile(exportTarget, exportBytes);
    const members = await zipMembers(exportTarget);
    const exportedManifest = await execFile(
      "unzip",
      ["-p", exportTarget, "theme.json"],
      { encoding: "buffer" },
    );
    const exportedStyle = await execFile(
      "unzip",
      ["-p", exportTarget, "style.css"],
      { encoding: "buffer" },
    );
    expect(members).toEqual(await zipMembers(zipPath!));
    expect(Buffer.from(exportedManifest.stdout)).toEqual(
      await zipMember("theme.json"),
    );
    expect(Buffer.from(exportedStyle.stdout)).toEqual(
      await zipMember("style.css"),
    );
    expect(members.some((member) => member.includes("owned-"))).toBeFalsy();
    result.export = {
      path: "media-bindings/exported-portable-package.zip",
      sha256: sha256(exportBytes),
      members,
      manifestSha256: sha256(Buffer.from(exportedManifest.stdout)),
      styleSha256: sha256(Buffer.from(exportedStyle.stdout)),
      ownedMediaEmbedded: false,
    };
    check(
      "Studio export contained exactly portable package members and unchanged manifest/style, with no instance-local owned Media",
    );

    // Prove actual recovery then restore the selected package for the final public state.
    await Promise.all([mutation("select"), selection.selectOption("studio")]);
    allowSecondBoot(
      publicPage,
      "Studio recovery deliberately cold-loads the public route",
    );
    await goto(publicPage, "/", { timeout: firstNav });
    await expect(publicPage.locator(".j-root")).toHaveAttribute(
      "data-theme",
      "studio",
    );
    await Promise.all([mutation("select"), selection.selectOption(themeId!)]);
    await visit();
    await expect(publicPage.locator(".j-root")).toHaveAttribute(
      "data-theme",
      "custom",
    );
    check(
      "explicit Studio recovery and restoration of selected custom package passed",
    );
  } finally {
    await publicContext.close();
  }
  await writeFile(
    join(logs, "chromium-media-bindings-evidence.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );
});
