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
/** Choose a sound in the SOUND BROWSER (the box both sound fields use): open
 *  it, filter by part of the file name, take the first match. */
async function pickSound(scope: Locator, namePart: string) {
  await scope.getByRole("button", { name: /browse every sound/ }).click();
  const filter = scope.getByPlaceholder(/^Filter \d+ sounds/);
  await filter.fill(namePart);
  const row = scope.getByRole("button", { name: new RegExp(`^${namePart.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`) }).first();
  await expect(row, `a sound called ${namePart}`).toBeVisible({ timeout: 10_000 });
  await row.click();
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
  await pickSound(ambient, "amb-room-tone.mp3");
  await expect(ambient.getByText("uploaded loop")).toBeVisible();

  // 3. the first beat: a sound effect, at half volume
  await page.locator("#studio-tab-beats").click();
  await page.getByRole("button", { name: /^💬 Beat 1\b/ }).first().click();
  const fx = page.locator("label", { hasText: "Sound effect on this beat" }).last();
  // the box browses every sound the project ships; the uploaded one is in it too
  await pickSound(fx, "knock-glass-door.mp3");
  await page.getByRole("slider", { name: /Sound effect volume for beat/ }).fill("0.5");

  // 4. the scene's camera: a depth map, which starts on the suggested move
  await page.locator("#studio-tab-scene").click();
  await page.getByRole("button", { name: /Depth-map camera/ }).click();
  await page.getByText(/Pick this picture's depth map/).click();
  // the picker also offers the film's own depth maps (public/film/depth), labelled by the shot
  // they belong to — the label is the picture's name, not the file's (tools/builtin-images.mjs)
  await page.getByPlaceholder(/^Filter \d+ images/).fill("222-mud-and-impacts");
  await expect(page.getByRole("button", { name: /^222 Mud And Impacts — depth \(s47\)/ })).toBeVisible();
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
  expect(scene.cinematic).toMatchObject({ depthMotion: "truck", depthAmount: 0.4, depthSeconds: 14, mode: "pan" });

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

test("the Studio asks before it bundles the whole film, and a cancelled export changes nothing", async ({ page }) => {
  await openFilmInStudio(page);
  let asked = "";
  page.once("dialog", (dialog) => { asked = dialog.message(); void dialog.dismiss(); });
  await page.getByRole("button", { name: "⤓ Export", exact: true }).click();
  await expect.poll(() => asked, { timeout: 15_000 }).toMatch(/pictures, sounds and other files/);
  expect(asked).toMatch(/hundreds of megabytes/);
  // nothing was bundled: no export window, and the draft is still the film
  await expect(page.getByRole("dialog", { name: "Export reel", exact: true })).toBeHidden();
  await expect(page.getByRole("textbox", { name: "Story title", exact: true })).toHaveValue(/Nobody's Witness/);
});

test("a beat's picture is on screen only once it has loaded, so the scene's own picture never shows through", async ({ page }) => {
  test.setTimeout(120_000);
  // Scene 53 of the film, played with every picture taking 1.5 s to arrive (a first visit over a slow connection: the browser then
  // reports 2g and the player's own lookahead stands down). The old
  // player mounted a beat's picture as the beat began and dropped the one before it a second later, so a late picture left the
  // scene's own plate (the first shot) showing through: the "main background flickering over the beat images".
  await page.goto("./?story=nobodys-witness-film&scene=nw_s53&seed=flicker");
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    const seen: { url: string; complete: boolean }[] = [];
    (window as unknown as { __beatLayers: typeof seen }).__beatLayers = seen;
    new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          const el = node as HTMLElement;
          const layers = el.matches?.("[data-beat-bg]") ? [el] : [...(el.querySelectorAll?.("[data-beat-bg]") ?? [])];
          for (const layer of layers) {
            const url = layer.getAttribute("data-beat-bg")!;
            const img = new Image();
            img.src = new URL(url, location.href).href;
            // an image the browser already has decoded is complete the moment it is asked for
            seen.push({ url, complete: img.complete });
          }
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 1500, downloadThroughput: -1, uploadThroughput: -1 });
  for (let i = 0; i < 16; i++) { await page.keyboard.press("Space"); await page.waitForTimeout(1700); }
  const seen: { url: string; complete: boolean }[] = await page.evaluate(() => (window as unknown as { __beatLayers: { url: string; complete: boolean }[] }).__beatLayers);
  expect(seen.length, "several beat pictures were shown").toBeGreaterThan(3);
  expect(seen.filter((s) => !s.complete).map((s) => s.url), "no beat picture was mounted before it had loaded").toEqual([]);
});

/** a saved Studio copy of the film (the Studio writes one the moment the film is opened in it), changed by `edit` */
async function saveFilmCopy(page: Page, edit: "graded" | "old-build") {
  await page.goto("./");
  await page.evaluate(async (how) => {
    const { NOBODYS_WITNESS_FILM } = await import("/src/data/nobodysWitnessFilm.ts");
    const film = JSON.parse(JSON.stringify(NOBODYS_WITNESS_FILM));
    if (how === "graded") for (const sc of film.scenes) for (const b of sc.dialogueBeats ?? []) if (b.cinematic) b.cinematic.filmGrade = true;
    if (how === "old-build") { delete film.builtinRevision; film.startSceneId = "nw_title"; } // how a copy saved before 7 October 2026 began
    localStorage.setItem("scarlet-studio-draft-nobodys-witness-film", JSON.stringify(film));
  }, edit);
}

test("a saved copy of the film from an older build is flagged, and the current film opens on scene 1", async ({ page }) => {
  test.setTimeout(120_000);
  await saveFilmCopy(page, "old-build");
  await page.goto("./");
  const notice = page.getByTestId("stale-copy-notice");
  await expect(notice).toBeVisible();
  await expect(notice).toContainText("older build");
  // it really did start on the opening titles
  await page.getByRole("button", { name: /^▶ Play Nobody/i }).click();
  await expect(page.locator("[data-scene-id]")).toHaveAttribute("data-scene-id", "nw_title", { timeout: 20_000 });

  // back to the newsstand; one click puts the current film back, and keeps the old copy under another name
  await page.goto("./");
  await expect(notice).toBeVisible();
  await notice.getByRole("button", { name: /Use the current film/ }).click();
  await expect(notice).toBeHidden();
  const keys: string[] = await page.evaluate(() => Object.keys(localStorage));
  expect(keys, "the saved copy is no longer the film's draft").not.toContain("scarlet-studio-draft-nobodys-witness-film");
  expect(keys.some((k) => /^scarlet-studio-backup-\d+-scarlet-studio-draft-nobodys-witness-film$/.test(k)), "but it is kept, under a backup name").toBe(true);
  await page.getByRole("button", { name: /^▶ Play Nobody/i }).click();
  // the Black Cove intro plays first (24 October 2026), then the Scarlet Reel logo (22 October 2026), then the film opens on scene 1
  await expect(page.locator("[data-scene-id]")).toHaveAttribute("data-scene-id", "nw_intro", { timeout: 20_000 });
  await expect(page.locator("[data-scene-id]")).toHaveAttribute("data-scene-id", "nw_logo", { timeout: 20_000 });
  await expect(page.locator("[data-scene-id]")).toHaveAttribute("data-scene-id", "nw_s1", { timeout: 25_000 });

  // a copy the Studio saves from this build is the current film's own, and raises no notice (back to the newsstand, not
  // the film: a reload in play resumes the last checkpoint, and scene 1 has one by the time the logo has played)
  await page.evaluate(() => localStorage.removeItem("scarlet-reel-session"));
  await page.goto("./");
  await page.getByRole("button", { name: /studio/i }).first().click();
  await page.getByRole("combobox", { name: "Choose story to edit" }).selectOption("nobodys-witness-film");
  await expect(page.getByRole("textbox", { name: "Story title", exact: true })).toHaveValue(/Nobody's Witness/);
  await expect.poll(() => page.evaluate(() => !!localStorage.getItem("scarlet-studio-draft-nobodys-witness-film")), { timeout: 15_000 }).toBe(true);
  await page.evaluate(() => localStorage.removeItem("scarlet-reel-session")); // a reload would otherwise reopen the Studio
  await page.goto("./");
  await expect(page.getByRole("button", { name: /^▶ Play Nobody/i })).toBeVisible();
  await expect(page.getByTestId("stale-copy-notice")).toBeHidden();
});

test("the export dialog lists the shipped film from its start, whatever copy the browser holds", async ({ page }) => {
  await saveFilmCopy(page, "old-build");
  await page.goto("./");
  await page.getByRole("button", { name: /Export animatic/ }).click();
  const dialog = page.getByRole("dialog", { name: "Export animatic" });
  await expect(dialog).toBeVisible();
  // the whole film is the default, and its preview link starts on the film's own first scene: the Black Cove intro (since
  // 24 October 2026; the Scarlet Reel logo from 22 October, scene 1 before), not the old copy's opening titles
  const link = await dialog.locator("a[href*='animatic=1']").first().getAttribute("href");
  expect(link).toContain("scene=nw_intro");
});

test("the 35mm film grade, where a story uses it, never fades a beat's picture, so the picture under it cannot flicker through", async ({ page }) => {
  test.setTimeout(120_000);
  // The film itself no longer uses the grade (12 October 2026), so this plays a copy with it switched on. Its exposure flicker used to be
  // the plate's own opacity (0.95 to 1 every 0.38 s), and a plate that is not fully opaque shows what is underneath it: the scene's
  // own, ungraded picture. Now the plate stays fully opaque and the flicker is a black veil above it.
  await saveFilmCopy(page, "graded");
  await page.goto("./?story=nobodys-witness-film&scene=nw_s53&seed=grade");
  await page.waitForTimeout(3000);
  for (let i = 0; i < 24 && !(await page.locator("[data-beat-bg] .film-grade").count()); i++) {
    await page.keyboard.press("Space");
    await page.waitForTimeout(900);
  }
  await expect(page.locator("[data-beat-bg] .film-grade").first()).toBeVisible();
  await page.waitForTimeout(2500); // the picture's own entrance dissolve has finished
  const seen = await page.evaluate(async () => {
    const plate = document.querySelector<HTMLElement>("[data-beat-bg] .film-grade")!;
    const layer = plate.closest<HTMLElement>("[data-beat-bg]")!;
    const veil = plate.querySelector<HTMLElement>(":scope > .film-flicker");
    const effective = () => {
      let o = 1;
      for (let e: HTMLElement | null = plate; e; e = e === layer ? null : e.parentElement) o *= parseFloat(getComputedStyle(e).opacity);
      return o;
    };
    const plateOpacity: number[] = [];
    const veilOpacity: number[] = [];
    const t0 = performance.now();
    while (performance.now() - t0 < 2500) {
      plateOpacity.push(effective());
      veilOpacity.push(veil ? parseFloat(getComputedStyle(veil).opacity) : -1);
      await new Promise((r) => setTimeout(r, 30));
    }
    return { plateMin: Math.min(...plateOpacity), veilMin: Math.min(...veilOpacity), veilMax: Math.max(...veilOpacity), hasVeil: !!veil };
  });
  expect(seen.plateMin, "the picture is fully opaque in every frame, so nothing underneath shows through").toBe(1);
  expect(seen.hasVeil, "the print's flicker is a veil above the picture").toBe(true);
  expect(seen.veilMax, "and the print still flickers").toBeGreaterThan(0.02);
  expect(seen.veilMin, "back to clear between flickers").toBe(0);
});
