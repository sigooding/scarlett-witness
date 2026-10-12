import { test, expect, type Locator, type Page } from "@playwright/test";
import { join } from "node:path";

/**
 * What the film uses can be reproduced in the Studio (npm run test:film-backend:browser): upload a depth map, a sound effect and a
 * recorded ambience loop in the Media tools, put them on Nobody's Witness scene 10 with the Studio's own controls, and check that
 * the saved draft, the exported reel and the player all carry them.
 */
const FILM = "nobodys-witness-film";
const DRAFT = `scarlet-studio-draft-${FILM}`;
const ROOT = process.cwd();
const FIX = {
  depth: join(ROOT, "public/film/depth/s47/222-mud-and-impacts/depth.png"),
  sfx: join(ROOT, "public/film/sfx/knock-glass-door.mp3"),
  loop: join(ROOT, "public/film/sfx/amb-room-tone.mp3"),
};
/** choose an uploaded file in a native <select> by part of its name (the option text carries a size) */
async function pick(select: Locator, namePart: string) {
  const value = await select.locator("option", { hasText: namePart }).first().getAttribute("value");
  expect(value, `an uploaded file called ${namePart}`).toBeTruthy();
  await select.selectOption(value!);
}
const readDraft = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "null"), DRAFT);

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  (page as Page & { errs: string[] }).errs = errors;
});
test.afterEach(async ({ page }) => expect((page as Page & { errs: string[] }).errs, "no runtime errors").toEqual([]));

async function openFilmInStudio(page: Page) {
  await page.goto("./");
  await page.getByRole("button", { name: /studio/i }).first().click();
  await expect(page.getByRole("textbox", { name: "Story title", exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Choose story to edit" }).selectOption(FILM);
  await expect(page.getByRole("textbox", { name: "Story title", exact: true })).toHaveValue(/Nobody's Witness/);
}

test("a depth map, a sound effect and a recorded loop uploaded in the Studio reach the draft, the export and the player", async ({ page }) => {
  test.setTimeout(240_000);
  await openFilmInStudio(page);

  // 1. upload the three files into the media library
  await page.locator("#studio-tab-media").click();
  await page.locator('input[type="file"][multiple]').setInputFiles([FIX.depth, FIX.sfx, FIX.loop]);
  await expect(page.getByText("depth.png").first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("knock-glass-door.mp3").first()).toBeVisible();
  await expect(page.getByText("amb-room-tone.mp3").first()).toBeVisible();

  // 2. scene 10: a recorded loop layered under the film's own ambience
  await page.getByRole("combobox", { name: "Jump to scene" }).selectOption("nw_s10");
  await page.locator("#studio-tab-scene").click();
  await page.getByText("🖼 Look, atmosphere & camera").click();
  const ambient = page.locator("label", { hasText: "Ambient loop (synth preset + recorded loops)" });
  await expect(ambient.getByText("amb-office.mp3")).toBeVisible();
  await pick(ambient.locator("select").last(), "amb-room-tone.mp3");
  await expect(ambient.getByText("uploaded loop")).toBeVisible();

  // 3. the first beat: a sound effect, at half volume
  await page.locator("#studio-tab-beats").click();
  await page.getByRole("button", { name: /^💬 Beat 1\b/ }).first().click();
  const fx = page.locator("label", { hasText: "Sound effect on this beat" }).last();
  await pick(fx.locator("select"), "knock-glass-door.mp3");
  await page.getByRole("slider", { name: /Sound effect volume for beat/ }).fill("0.5");

  // 4. the scene's camera: a depth map, which starts on the suggested move
  await page.locator("#studio-tab-scene").click();
  await page.getByRole("button", { name: /Depth-map camera/ }).click();
  await page.getByText("Pick this picture's depth map…").click();
  await page.getByPlaceholder(/^Filter \d+ images/).fill("depth.png");
  await page.getByRole("button", { name: /^depth\.png/ }).first().click();

  // what the draft holds (it autosaves a moment after the last edit)
  await expect.poll(async () => (await readDraft(page))?.scenes.find((s: { id: string }) => s.id === "nw_s10")?.cinematic?.depthMap, { timeout: 15_000 }).toMatch(/^asset:/);
  const draft = await readDraft(page);
  const scene = draft.scenes.find((s: { id: string }) => s.id === "nw_s10");
  expect(scene.ambientAudio).toMatch(/^file:\/film\/sfx\/amb-office\.mp3\+file:asset:/);
  expect(scene.dialogueBeats[0].sfxUrl).toMatch(/^asset:/);
  expect(scene.dialogueBeats[0].sfxVolume).toBeCloseTo(0.5, 2);
  expect(scene.cinematic.depthMap).toMatch(/^asset:/);
  expect(scene.cinematic).toMatchObject({ depthMotion: "push", depthAmount: 0.4, depthSeconds: 14, mode: "pan" });

  // what the export carries: the scene with the three uploaded files and the film's own static ones, bundled rather than left as
  // dangling paths (the whole film is a 380 MB export, so one scene's worth is bundled here)
  const bundle = await page.evaluate(async (key) => {
    const { createPortableStoryBundle } = await import("/src/studio/exportBundle.ts");
    const story = JSON.parse(localStorage.getItem(key)!);
    const scene = story.scenes.find((s: { id: string }) => s.id === "nw_s10");
    scene.dialogueBeats = scene.dialogueBeats.slice(0, 8);
    const out = await createPortableStoryBundle({ ...story, scenes: [scene], startSceneId: "nw_s10" });
    return { names: out.assets.map((a: { name: string }) => a.name), missing: out.missing };
  }, DRAFT);
  expect(bundle.names).toEqual(expect.arrayContaining(["depth.png", "knock-glass-door.mp3", "amb-room-tone.mp3"]));
  expect(bundle.names, "the film's own recorded ambience is bundled too").toContain("amb-office.mp3");
  expect(bundle.missing.filter((m: string) => /amb-office|sfx/.test(m))).toEqual([]);

  // 5. the player resolves the references and uses them: the scene as a one-scene story, opened from a link
  await page.addInitScript(() => {
    const plays: string[] = [];
    (window as unknown as { __plays: string[] }).__plays = plays;
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { plays.push(this.currentSrc || this.src); return play.call(this); };
  });
  await page.evaluate((key) => {
    const film = JSON.parse(localStorage.getItem(key)!);
    const scene = film.scenes.find((s: { id: string }) => s.id === "nw_s10");
    // keep only what the check needs: the scene's own plate (so its depth map shows) and its first beats
    scene.dialogueBeats = scene.dialogueBeats.slice(0, 6).map((b: Record<string, unknown>) => { delete b.background; delete b.cinematic; delete b.backgroundTransition; delete b.backgroundTransitionSpeed; delete b.afterBeatTargetSceneId; delete b.afterBeatMode; delete b.afterBeatDelaySeconds; return b; });
    scene.autoAdvanceTargetSceneId = undefined;
    scene.isEnding = true;
    const mini = { ...film, id: "qa-film-backend", title: "Film backend fixture", scenes: [scene], startSceneId: "nw_s10", episodes: [], acts: [] };
    localStorage.setItem("scarlet-reel-custom-stories-v1", JSON.stringify([mini]));
  }, DRAFT);
  await page.goto("./?story=qa-film-backend&scene=nw_s10");
  await expect(page.locator('canvas.depth-parallax[data-depth-ready="1"]')).toBeVisible({ timeout: 45_000 });
  for (let i = 0; i < 6; i++) { await page.keyboard.press("Space"); await page.waitForTimeout(250); }
  const plays: string[] = await page.evaluate(() => (window as unknown as { __plays: string[] }).__plays);
  expect(plays.some((u) => /^(data|blob):audio\//.test(u) || /^(data|blob):/.test(u)), `the uploaded sound effect was played (saw ${plays.map((u) => u.slice(0, 40)).join(" | ")})`).toBe(true);
});
