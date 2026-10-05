import { exportedReelJson } from "./export-driver";
import { HOLLYWOOD_OPENING } from "../../src/data/hollywoodOpening";
import { test, expect, type Page } from "@playwright/test";
import { FpsDriver } from "./fps-driver";
// Force software WebGL only for the FPS tests. Forcing all browser raster
// work through SwiftShader made unrelated Studio screenshots stall.
test.use({
  // Continuous actor telemetry + software WebGL makes DOM tracing unusually
  // expensive (hundreds of MB per tour). Keep screenshots; opt into traces for
  // a focused diagnosis without making the browser driver stand idle in combat.
  trace: process.env.PLAYWRIGHT_FPS_TRACE === "1" ? "retain-on-failure" : "off",
  launchOptions: {
    ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : {}),
    args: [
      "--no-sandbox",
      ...(process.env.PLAYWRIGHT_SOFTWARE_WEBGL === "1"
        ? [
            "--use-gl=angle",
            "--use-angle=swiftshader-webgl",
            "--enable-unsafe-swiftshader",
          ]
        : []),
    ],
  },
});
const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const found: string[] = [];
  errors.set(page, found);
  page.on("pageerror", (e) => found.push(e.message));
  page.on("console", (m) => {
    if (
      m.type() === "error" &&
      /maximum update depth|same key|WebGL|Cannot load|React Hook/.test(
        m.text(),
      )
    )
      found.push(m.text());
  });
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page), "No runtime/renderer errors").toEqual([]);
});

test("First-person: newsstand rooftop, street, cinema combat, keycard and ending", async ({
  page,
}, info) => {
  test.setTimeout(480_000);
  const requested: string[] = [];
  page.on("request", (request) => requested.push(request.url()));
  const d = new FpsDriver(page);
  await d.start();
  for (const name of [
    "trooper-v3-sheet",
    "pigcop-v3-sheet",
    "pistol-v3-sheet",
    "shotgun-v3-sheet",
    "tex6-facade",
    "sky-v6",
    "tex6-chainlink",
    "skycar-v6",
  ])
    expect(
      requested.some((url) => url.includes(name)),
      `loads ${name}`,
    ).toBe(true);
  await page.screenshot({ path: info.outputPath("rooftop.png") });
  await d.rooftopToStreet(async () => {
    const p = await d.pose(),
      actor = p.actors.find((a) => a.id === "street-trooper")!;
    expect(actor.hp).toBeGreaterThan(0);
    await d.face(Math.atan2(-(actor.x - p.x), -(actor.z - p.z)));
    await page.screenshot({ path: info.outputPath("trooper-live.png") });
  });
  await d.face(-Math.PI / 2);
  await page.screenshot({ path: info.outputPath("street.png") });
  await d.toLobby(async () => {
    const p = await d.pose(),
      actor = p.actors.find((a) => a.id === "lobby-pigcop")!;
    expect(actor.hp).toBeGreaterThan(0);
    await d.face(-Math.PI / 2);
    await page.screenshot({ path: info.outputPath("cinema-front.png") });
  });
  await d.face(-Math.PI / 2);
  await page.screenshot({ path: info.outputPath("lobby.png") });
  await d.tourCinema();
  await page.screenshot({ path: info.outputPath("cinema.png") });
  await d.finish();
  await page.screenshot({ path: info.outputPath("cleared.png") });
});

test("First-person: pause, real slot save/load, quick taps and mobile controls", async ({
  page,
}, info) => {
  test.setTimeout(90_000);
  const d = new FpsDriver(page);
  await d.start();
  await page.keyboard.press(" ");
  await expect.poll(async () => (await d.pose()).y).toBeGreaterThan(5.5);
  await expect.poll(async () => (await d.pose()).y).toBeCloseTo(5.4, 1);
  await d.shoot("roof-c9");
  await expect(page.locator("[data-fps-stage]")).toHaveAttribute(
    "data-fps-removed",
    /roof-c9/,
  );
  await d.moveTo(9.4, 6);
  await page.getByRole("button", { name: "PAUSE · ESC", exact: true }).click();
  const before = await d.pose();
  await page.keyboard.down("w");
  await page.waitForTimeout(250);
  await page.keyboard.up("w");
  expect((await d.pose()).x).toBeCloseTo(before.x, 2);
  await page.getByRole("button", { name: "SAVE GAME", exact: true }).click();
  const save = page.getByRole("dialog", {
    name: "Save — choose a slot",
    exact: true,
  });
  await save
    .getByRole("button", { name: "Save here", exact: true })
    .first()
    .click();
  await expect(save).toBeHidden();
  const saved = await page.evaluate(() =>
    JSON.parse(
      localStorage.getItem("scarlet-reel-save-hollywood-opening-slot-1") ??
        "null",
    ),
  );
  expect(saved?.fpsRooms?.["hh-opening"]?.player.x).toBeCloseTo(before.x, 2);
  await page.getByRole("button", { name: /^RESUME(?: LEVEL)?$/ }).click();
  await d.moveTo(11, 6);
  await page.getByRole("button", { name: "PAUSE · ESC", exact: true }).click();
  await page.getByRole("button", { name: "LOAD GAME", exact: true }).click();
  const load = page.getByRole("dialog", { name: "Load a save", exact: true });
  await load
    .locator("div")
    .filter({ has: page.getByText("Slot 1", { exact: true }) })
    .filter({ has: page.getByRole("button", { name: "Load", exact: true }) })
    .last()
    .getByRole("button", { name: "Load", exact: true })
    .click();
  await expect(load).toBeHidden();
  await expect(
    page.getByRole("button", { name: "RESUME LEVEL", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "RESUME LEVEL", exact: true }).click();
  expect((await d.pose()).x).toBeCloseTo(before.x, 2);
  await expect(page.locator("[data-fps-stage]")).toHaveAttribute(
    "data-fps-removed",
    /roof-c9/,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "Fire weapon", exact: true }),
  ).toBeVisible();
  const ammo = Number(await page.locator("[data-fps-ammo]").innerText());
  await page.getByRole("button", { name: "Fire weapon", exact: true }).click();
  await expect
    .poll(async () => Number(await page.locator("[data-fps-ammo]").innerText()))
    .toBeLessThan(ammo);
  await page.screenshot({ path: info.outputPath("mobile-controls.png") });
});

test("First-person: Studio type, map/sprite edit, portable export, Check, publish and playable copy", async ({
  page,
}, info) => {
  test.setTimeout(480_000);
  await page.goto("/");
  await page
    .getByRole("button", { name: /studio/i })
    .first()
    .click();
  await page
    .getByRole("combobox", { name: "Choose story to edit" })
    .selectOption("hollywood-opening");
  await expect(
    page.getByRole("combobox", { name: "Kind of game" }),
  ).toHaveValue("first-person");
  // A new room really gets the action layer, rather than only changing a label.
  await page.getByRole("button", { name: "＋ Scene", exact: true }).click();
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const d = JSON.parse(
          localStorage.getItem("scarlet-studio-draft-hollywood-opening") ??
            "null",
        );
        return d?.scenes?.find((s: { id: string }) => s.id.startsWith("scene_"))
          ?.stage?.quake?.fps?.version;
      }),
    )
    .toBe(1);
  await page.getByRole("button", { name: "↶ Undo", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Jump to scene" })
    .selectOption("hh-opening");
  await page.getByRole("tab", { name: "🚶 Stage", exact: true }).click();
  const editor = page.locator("[data-fps-editor]");
  await expect(editor).toBeVisible();
  await editor
    .getByRole("button", { name: "Expand editor", exact: true })
    .click();
  await editor
    .getByRole("combobox", { name: "Map tool", exact: true })
    .selectOption("sprite");
  await editor
    .getByRole("combobox", { name: "Sprite to place", exact: true })
    .selectOption("trash-bags");
  await editor
    .getByRole("gridcell", { name: "Cell 17, 12: Street", exact: true })
    .click();
  await editor
    .getByLabel("Message", { exact: true })
    .fill("Placed in the actual first-person editor.");
  await editor
    .getByRole("button", { name: "Sprite library", exact: true })
    .click();
  await editor
    .getByRole("combobox", { name: "Sprite definition to edit", exact: true })
    .selectOption("trooper");
  await editor.getByLabel("Hit points", { exact: true }).fill("61");
  await editor
    .getByRole("button", { name: "Weapons & player", exact: true })
    .click();
  const objective =
    "Get off the roof. Find the cinema side entrance, shotgun and red card. Reach the upper exit.";
  await editor.getByLabel("Objective", { exact: true }).fill(objective);
  await editor.getByLabel("PISTOL view scale", { exact: true }).fill("0.71");
  await editor
    .getByRole("button", { name: "Close expanded editor", exact: true })
    .click();
  await page.keyboard.press("Control+s");
  const dialog = page.getByRole("dialog", { name: "Export reel", exact: true });
  await expect(dialog).toBeVisible({ timeout: 45_000 });
  const text = await exportedReelJson(page);
  const reel = JSON.parse(text);
  const q = reel.scenes.find((s: { id: string }) => s.id === "hh-opening").stage
    .quake;
  expect(
    q.fps.sprites.find((s: { id: string }) => s.id === "trooper").health,
  ).toBe(61);
  expect(q.fps.objective).toBe(objective);
  expect(q.fps.presentation).toBe("classic");
  expect(q.fps.details.length).toBeGreaterThan(150);
  expect(q.fps.materials.find((m: { id: string }) => m.id === "chainlink").alphaTest).toBe(0.5);
  expect(q.fps.sprites.find((s: { id: string }) => s.id === "hydrant").brokenImage).toMatch(/^asset:/);
  expect(Object.values(q.fps.tiles).some((t: any) => t.slope?.x === 0.3)).toBe(true);
  expect(
    q.fps.weapons.find((w: { id: string }) => w.id === "pistol").view.scale,
  ).toBe(0.71);
  expect(
    q.fps.entities.some(
      (e: { message?: string }) =>
        e.message === "Placed in the actual first-person editor.",
    ),
  ).toBe(true);
  expect(reel.scenes.length).toBe(2);
  expect(reel.assets.length).toBeGreaterThan(55);
  expect(
    reel.assets.every(
      (a: { dataUrl: string; fileUrl?: string }) =>
        a.dataUrl?.startsWith("data:") && !a.fileUrl,
    ),
  ).toBe(true);
  const { writeFile } = await import("node:fs/promises");
  await writeFile(info.outputPath("hollywood-opening.reel.json"), text);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await page.getByLabel("Import reel file", { exact: true }).setInputFiles({
    name: "hollywood-opening.reel.json",
    mimeType: "application/json",
    buffer: Buffer.from(text),
  });
  await expect(
    page.getByText(
      `Opened "Duke Nukem 3D — Hollywood Holocaust" with ${reel.assets.length} asset(s).`,
      { exact: true },
    ),
  ).toBeVisible({ timeout: 30_000 });
  const check = page.getByRole("button", { name: "✔ Check", exact: true });
  if ((await check.getAttribute("aria-expanded")) === "true")
    await check.click();
  await check.click();
  await expect(
    page.getByText(/Continuity Department — spotless reel/),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Scene", exact: true }).click();
  await page.screenshot({
    path: info.outputPath("studio-check.png"),
    animations: "disabled",
    timeout: 45_000,
  });
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(
    page.getByText("Published. The newsstand now uses this version.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Leave Studio", exact: true }).click();
  const escaped: string[] = [];
  await page.route(/\/img\/hollywood-opening\//, async (route) => {
    escaped.push(route.request().url());
    await route.abort();
  });
  const d = new FpsDriver(page);
  await d.start();
  await d.rooftopToStreet();
  await d.toLobby();
  await d.tourCinema();
  await d.finish();
  expect(
    escaped,
    "Portable copy uses embedded art, including the weapon and explosion frames",
  ).toEqual([]);
});


test("First-person: an old publication can preview the update without losing authored work", async ({ page }) => {
  const legacy = structuredClone(HOLLYWOOD_OPENING);
  legacy.title = "My authored Hollywood copy";
  delete legacy.scenes.find((s) => s.id === "hh-opening")!.stage!.quake!.fps!.presentation;
  await page.addInitScript((story) => localStorage.setItem("scarlet-reel-published-hollywood-opening", JSON.stringify(story)), legacy);
  await page.goto("/");
  await expect(page.getByLabel("Hollywood update available")).toBeVisible();
  await page.getByRole("button", { name: "Play updated Hollywood", exact: true }).click();
  const skip = page.getByRole("button", { name: "Skip title sequence", exact: true });
  await expect(page.locator("[data-fps-stage]").or(skip).first()).toBeVisible();
  if (await skip.isVisible()) await skip.click();
  await expect(page.locator("[data-fps-stage]")).toHaveClass(/fps-classic/);
  const retained = await page.evaluate(() => JSON.parse(localStorage.getItem("scarlet-reel-published-hollywood-opening")!));
  expect(retained).toEqual(legacy);
});
