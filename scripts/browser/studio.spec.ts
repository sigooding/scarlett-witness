import { exportedReelJson } from "./export-driver";
import { test, expect, type Page, type Locator } from "@playwright/test";
import { FAMILY_GUY } from "../../src/data/familyGuy";

const storyId = FAMILY_GUY.id;
const key = `scarlet-studio-draft-${storyId}`;
const readDraft = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "null"), key);
async function studio(page: Page) {
  await page.goto("./");
  await page.getByRole("button", { name: /studio/i }).first().click();
  await expect(page.getByRole("textbox", { name: "Story title", exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Choose story to edit" }).selectOption(storyId);
}
async function selectScene(page: Page, id: string) {
  await page.getByRole("searchbox", { name: "Search scenes" }).fill("");
  await page.getByRole("combobox", { name: "Jump to scene" }).selectOption(id);
}
async function advanceTo(page: Page, target: Locator, limit = 18) {
  for (let i = 0; i < limit; i++) {
    if (await target.isVisible()) return;
    await page.keyboard.press("Space");
    await page.waitForTimeout(180);
  }
  await expect(target).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const plays: string[] = [];
    (window as Window & { mediaPlays: string[] }).mediaPlays = plays;
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      plays.push(this.currentSrc || this.src);
      return play.call(this);
    };
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "warning" && /React Flow|handle id|React Hook/.test(message.text())) errors.push(message.text());
    if (message.type() === "error" && /children with the same key|validateDOMNesting|maximum update depth/i.test(message.text())) errors.push(message.text());
  });
  (page as Page & { studioErrors: string[] }).studioErrors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as Page & { studioErrors: string[] }).studioErrors, "no runtime/React/graph errors").toEqual([]);
});

test("focused beat survives immediate export, story switch, exit and reload", async ({ page }) => {
  await studio(page);
  await selectScene(page, "fg_cold");
  await page.getByRole("tab", { name: "Beats", exact: true }).click();
  await page.getByRole("button", { name: /^💬 Beat 1/ }).click();
  const line = page.getByRole("textbox", { name: "Line for beat fg_cold_cue", exact: true });
  // CommitTextArea is intentionally NOT blurred by a test helper or idle wait.
  await line.fill("Immediate export must include this unslept edit.");
  await page.keyboard.press("Control+s");
  const dialog = page.getByRole("dialog", { name: "Export reel" });
  await expect(dialog).toBeVisible();
  const exported = JSON.parse(await exportedReelJson(page));
  expect(exported.scenes.find((s: { id: string }) => s.id === "fg_cold").dialogueBeats[0].text).toBe("Immediate export must include this unslept edit.");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await line.fill("A second edit belongs only to Family Guy.");
  await page.getByRole("combobox", { name: "Choose story to edit" }).selectOption({ index: 1 });
  await page.getByRole("combobox", { name: "Choose story to edit" }).selectOption(storyId);
  await selectScene(page, "fg_cold");
  await page.getByRole("tab", { name: "Beats", exact: true }).click();
  if (!(await line.isVisible())) await page.getByRole("button", { name: /^💬 Beat 1/ }).click();
  await expect(line).toHaveValue("A second edit belongs only to Family Guy.");
  await line.fill("Last focused text survives Leave Studio.");
  await page.getByRole("button", { name: "Leave Studio", exact: true }).click();
  await page.reload();
  expect((await readDraft(page)).scenes.find((s: { id: string }) => s.id === "fg_cold").dialogueBeats[0].text).toBe("Last focused text survives Leave Studio.");
});

test("deleting a just-edited beat is one separate, reversible undo step", async ({ page }) => {
  await studio(page); await selectScene(page, "fg_cold");
  await page.getByRole("tab", { name: "Beats", exact: true }).click();
  await page.getByRole("button", { name: /^💬 Beat 1/ }).click();
  const line = page.getByRole("textbox", { name: "Line for beat fg_cold_cue", exact: true });
  await line.fill("Keep this text when the deletion is undone.");
  await page.locator('.studio-inspector button[title="Delete this beat"]').first().click();
  await expect(line).toBeHidden();
  await page.getByRole("button", { name: "↶ Undo", exact: true }).click();
  await expect(line).toHaveValue("Keep this text when the deletion is undone.");
  await page.getByRole("button", { name: "↷ Redo", exact: true }).click();
  await expect(line).toBeHidden();
});

test("timeout wire delete / undo never changes the successful destination", async ({ page }) => {
  await studio(page); await selectScene(page, "fg_countdown");
  const id = "e-fg_countdown-c-fg_blue_button-timeout";
  await page.locator(`[data-route-id="${id}"]`).focus();
  await page.locator(`[data-route-id="${id}"]`).press("Enter");
  // An absent draft also returns undefined: the old assertion could pass
  // BEFORE autosave and then crash reading null. Require a real, complete
  // persisted choice and assert both destinations in the same snapshot.
  await expect.poll(async () => {
    const choice = (await readDraft(page))?.scenes.find((s: { id: string }) => s.id === "fg_countdown")?.choices[0];
    return choice ? { target: choice.targetSceneId, timeout: choice.timedOutTargetSceneId ?? null } : null;
  }).toEqual({ target: "fg_reset", timeout: null });
  await page.getByRole("button", { name: "↶ Undo", exact: true }).click();
  await expect.poll(async () => (await readDraft(page))?.scenes.find((s: { id: string }) => s.id === "fg_countdown").choices[0].timedOutTargetSceneId).toBe("fg_fail");
});

test("scene search, every tool, keyboard tabs and modal focus", async ({ page }) => {
  await studio(page);
  await expect(page.getByRole("combobox", { name: "Jump to scene" })).toHaveValue("fg_title");
  await page.getByRole("searchbox", { name: "Search scenes" }).fill("multi-state");
  await expect(page.getByRole("combobox", { name: "Jump to scene" }).locator("option")).toHaveCount(2);
  await page.getByRole("searchbox", { name: "Search scenes" }).press("Enter");
  await expect(page.getByRole("combobox", { name: "Jump to scene" })).toHaveValue("fg_basement");
  const tabs = await page.getByRole("tab").all();
  for (const tab of tabs) { await tab.click(); await expect(page.getByRole("tabpanel")).toBeVisible(); }
  const sceneTab = page.getByRole("tab", { name: "Scene", exact: true });
  await sceneTab.click(); await sceneTab.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Beats", exact: true })).toBeFocused();
  await expect(page.getByRole("tab", { name: "Beats", exact: true })).toHaveAttribute("aria-selected", "true");
  const help = page.getByRole("button", { name: "? Help", exact: true });
  await help.click();
  const dialog = page.getByRole("dialog", { name: "Studio help" });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((e) => e.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape"); await expect(dialog).toBeHidden(); await expect(help).toBeFocused();
});

for (const width of [1280, 768, 390]) test(`Studio layout remains usable at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await studio(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await page.getByRole("searchbox", { name: "Search scenes" }).fill("remote");
  await page.getByRole("tab", { name: "Characters", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toBeVisible();
  expect(await page.getByRole("tabpanel").evaluate((el) => {
    const r = el.getBoundingClientRect();
    return Math.min(innerHeight, r.bottom) - Math.max(0, r.top);
  }), "actual editing area, not just tabs, is on screen").toBeGreaterThan(200);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  if (width < 740) {
    await page.getByRole("button", { name: "Scene map", exact: true }).click();
    await expect(page.locator(".studio-canvas")).toBeVisible();
    await page.getByRole("button", { name: "Scene editor", exact: true }).click();
    await expect(page.getByRole("tabpanel")).toBeVisible();
  }
  await page.mouse.move(2, 2);
  await page.screenshot({ path: `test-results/studio-${width}.png`, fullPage: true });
});

test("app upgrades preserve authored built-in drafts, publications and backups", async ({ page }) => {
  const draft = { ...FAMILY_GUY, title: "An edited built-in after an upgrade", episodes: [] };
  await page.addInitScript((story) => {
    localStorage.setItem("scarlet-reel-story-snapshot-build", "ancient-build");
    localStorage.setItem("scarlet-reel-content-revision", "1");
    localStorage.setItem(`scarlet-studio-draft-${story.id}`, JSON.stringify(story));
    localStorage.setItem(`scarlet-reel-published-${story.id}`, JSON.stringify(story));
    localStorage.setItem("scarlet-reel-backup-qa", "do not erase");
  }, draft);
  await studio(page);
  await expect(page.getByRole("textbox", { name: "Story title", exact: true })).toHaveValue(draft.title);
  expect(await page.evaluate(() => localStorage.getItem("scarlet-reel-backup-qa"))).toBe("do not erase");
  expect(await page.evaluate((id) => JSON.parse(localStorage.getItem(`scarlet-reel-published-${id}`)!).title, storyId)).toBe(draft.title);
});

test("custom-story branch links open the authored scene, not a built-in", async ({ page }) => {
  const custom = { ...FAMILY_GUY, id: "qa-custom-fan-reel", title: "Custom link fixture" };
  await page.addInitScript((s) => localStorage.setItem("scarlet-reel-custom-stories-v1", JSON.stringify([s])), custom);
  await page.goto(`./?story=${custom.id}&scene=fg_verdict&flags=fg_caught&seed=browser`);
  const finish = page.getByRole("menuitem", { name: /Give Lois Brian's very specific explanation/ });
  await advanceTo(page, finish); await finish.click();
  await expect(page.getByText("NORMAL SERVICE RESUMED", { exact: true })).toBeVisible();
});

test("Family Guy adventure: collect, craft, preload next room and install", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => { if (r.url().includes("/assets/family-guy/")) requests.push(r.url()); });
  await page.goto(`./?story=${storyId}&scene=fg_living&flags=fg_mission&seed=browser`);
  const sound = page.getByRole("button", { name: "Sound mixer", exact: true });
  await expect(sound).toBeVisible();
  expect(await sound.evaluate((el) => {
    const a = el.getBoundingClientRect();
    const b = document.querySelector("[data-inventory]")!.getBoundingClientRect();
    return a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top;
  }), "inventory does not cover the Sound controls").toBe(true);
  await sound.click();
  await expect(page.getByRole("button", { name: "Close mixer", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Close mixer", exact: true })).toBeHidden();
  async function useMarker(name: string, verb: string) {
    await page.getByRole("button", { name, exact: true }).click();
    const menu = page.getByRole("button", { name: verb, exact: true });
    await menu.click();
  }
  await useMarker("Remote on the table", "Pick up");
  await expect(page.getByRole("button", { name: "Remote on the table", exact: true })).toBeHidden({ timeout: 15_000 });
  await useMarker("Batteries under the sofa", "Pick up");
  await expect(page.getByRole("button", { name: "Batteries under the sofa", exact: true })).toBeHidden({ timeout: 15_000 });
  await expect.poll(() => requests.some((u) => u.endsWith("/basement.webp"))).toBe(true);
  await expect.poll(() => requests.some((u) => u.endsWith("/lab.wav"))).toBe(true);
  expect(await page.evaluate(() => (window as Window & { mediaPlays: string[] }).mediaPlays.some((u) => u.endsWith("/lab.wav")))).toBe(false);
  // Still in the living room: the room/cue above were speculative requests.
  await expect(page.getByRole("button", { name: "Talk to Lois", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Combine/, exact: false }).first().click();
  const pockets = page.getByRole("dialog", { name: "Peter's pockets" });
  await expect(pockets).toBeVisible();
  await pockets.getByRole("button", { name: "Empty remote", exact: true }).click();
  await pockets.getByRole("button", { name: "Two batteries", exact: true }).click();
  await expect(pockets.getByRole("button", { name: "Powered remote", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await useMarker("Down to Stewie's lab", "Go to");
  await expect(page.getByRole("button", { name: "Install the powered remote", exact: true })).toBeVisible({ timeout: 15_000 });
  await useMarker("Install the powered remote", "Use");
  await page.getByRole("button", { name: /Powered remote/, exact: false }).last().click();
  await expect(page.getByRole("button", { name: "Tune the signal", exact: true })).toBeVisible({ timeout: 15_000 });
});

test("Family Guy puzzle retry and blue-button silver ending", async ({ page }) => {
  await page.goto(`./?story=${storyId}&scene=fg_basement&flags=fg_installed,fg_mission&seed=browser`);
  await page.getByRole("button", { name: "Tune the signal", exact: true }).click();
  const use = page.getByRole("button", { name: "Use", exact: true });
  if (await use.isVisible()) await use.click();
  await expect(page.getByRole("heading", { name: "Stewie's signal tuner" })).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: /RED — shopping universe/ }).click();
  await page.getByRole("button", { name: /GREEN — home frequency/ }).click();
  await page.getByRole("button", { name: "Flag pattern", exact: true }).click();
  await expect(page.getByText(/That includes red/)).toBeVisible();
  await expect(page.getByText("0 / 2 flagged", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /GREEN — home frequency/ }).click();
  await page.getByRole("button", { name: /BLUE — stabiliser/ }).click();
  await page.getByRole("button", { name: "Flag pattern", exact: true }).click();
  const blue = page.getByRole("menuitem", { name: /Press BLUE\. Restore normal television/ });
  await advanceTo(page, blue); await blue.click();
  const finish = page.getByRole("menuitem", { name: /Put the remote down\. Walk away slowly/ });
  await advanceTo(page, finish, 35); await finish.click();
  await expect(page.getByRole("heading", { name: "TECHNICALLY FIXED", exact: true })).toBeVisible();
});

test("Family Guy QTE timeout follows only its failure route", async ({ page }) => {
  await page.goto(`./?story=${storyId}&scene=fg_countdown&seed=browser`);
  await advanceTo(page, page.getByRole("menuitem", { name: /Press BLUE\. Restore normal television/ }));
  await expect(page.getByRole("heading", { name: "REALITY: SUBSCRIBED", exact: true })).toBeVisible({ timeout: 20_000 });
});


test("rail preloads the next background and opening cue while the current line stays on screen", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  // Distinct current/next media: the authored cold open shares its room and
  // cue with the living room, which would make a network assertion vacuous.
  const fixture = structuredClone(FAMILY_GUY);
  const cold = fixture.scenes.find((s) => s.id === "fg_cold")!;
  cold.background = "/assets/family-guy/clam.webp";
  cold.dialogueBeats![0].audioUrl = "/assets/family-guy/clam.wav";
  await page.addInitScript((story) => localStorage.setItem(`scarlet-reel-published-${story.id}`, JSON.stringify(story)), fixture);
  await page.goto(`./?story=${storyId}&scene=fg_cold&seed=browser`);
  const currentLine = page.getByText(cold.dialogueBeats![0].text, { exact: true }).filter({ visible: true });
  // Empty prose enters this beat directly. Don't spam Space while mounting:
  // that can skip the very line whose lookahead we're observing on a slow CPU.
  await expect(currentLine).toBeVisible();
  await expect.poll(() => requests.some((u) => u.endsWith("/living-room.webp"))).toBe(true);
  await expect.poll(() => requests.some((u) => u.endsWith("/channel.wav"))).toBe(true);
  await expect(currentLine).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { mediaPlays: string[] }).mediaPlays.some((u) => u.endsWith("/channel.wav")))).toBe(false);
});

test("closing a solved puzzle cancels its delayed navigation and reopening starts clean", async ({ page }) => {
  await page.goto(`./?story=${storyId}&scene=fg_basement&flags=fg_installed&seed=browser`);
  async function openPuzzle() {
    await page.getByRole("button", { name: "Tune the signal", exact: true }).click();
    await page.getByRole("button", { name: "Use", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Stewie's signal tuner" })).toBeVisible();
  }
  await openPuzzle();
  await page.getByRole("button", { name: /GREEN — home frequency/ }).click();
  await page.getByRole("button", { name: /BLUE — stabiliser/ }).click();
  await page.getByRole("button", { name: "Flag pattern", exact: true }).click();
  await page.keyboard.press("Escape");
  // Deliberately outwait the 1200ms result timer, not an arbitrary load wait.
  await page.waitForTimeout(1600);
  await expect(page.getByRole("button", { name: "Tune the signal", exact: true })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: /Press BLUE/ })).toBeHidden();
  await openPuzzle();
  await expect(page.getByText("0 / 2 flagged", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /GREEN — home frequency/ })).toBeEnabled();
});

test("inventory modal is keyboard-contained, pauses QTE, and inspect is not hidden underneath it", async ({ page }) => {
  await page.goto(`./?story=${storyId}&scene=fg_countdown&items=fg_remote_item&seed=browser`);
  const blue = page.getByRole("menuitem", { name: /Press BLUE/ });
  await advanceTo(page, blue);
  await page.getByRole("button", { name: /Peter's pockets/ }).click();
  const pockets = page.getByRole("dialog", { name: "Peter's pockets" });
  await expect(pockets).toBeVisible();
  const clock = await blue.locator(".qte-ring").getAttribute("aria-label");
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    expect(await pockets.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  await page.waitForTimeout(1200); // must not decrement behind a modal
  await expect(blue.locator(".qte-ring")).toHaveAttribute("aria-label", clock!);
  await pockets.getByRole("button", { name: "Empty remote", exact: true }).click();
  await expect(pockets).toBeHidden();
  const inspect = page.getByRole("dialog", { name: "Evidence Close-Up" });
  await expect(inspect).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(inspect).toBeHidden();
  await expect.poll(() => blue.locator(".qte-ring").getAttribute("aria-label")).not.toBe(clock);
});

test("Family Guy optional receipt, keyboard deduction, lie, reply and gold ending", async ({ page }) => {
  await page.goto(`./?story=${storyId}&scene=fg_yard&flags=fg_mission,fg_remote,fg_installed&seed=browser`);
  await page.getByRole("button", { name: "Receipt in the mailbox", exact: true }).click();
  await page.getByRole("button", { name: "Pick up", exact: true }).click();
  await expect(page.getByRole("button", { name: "Receipt in the mailbox", exact: true })).toBeHidden({ timeout: 15_000 });
  await page.getByRole("button", { name: "Walk to the Drunken Clam", exact: true }).click();
  await page.getByRole("button", { name: "Go to", exact: true }).click();
  const press = page.getByRole("button", { name: "🎯 Press them on that", exact: true });
  await advanceTo(page, press, 35);
  await page.keyboard.press("b");
  const board = page.getByRole("dialog", { name: "Deduction Corkboard — pin the truth" });
  await expect(board).toBeVisible();
  await board.getByRole("button", { name: /Brian's receipt/ }).filter({ has: page.getByText("Brian's receipt", { exact: true }) }).press("Enter");
  await board.getByRole("button", { name: /Brian Griffin/ }).filter({ has: page.getByText("Brian Griffin", { exact: true }) }).press("Enter");
  await expect(board.getByText("★ Full Profile ★", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await press.click();
  const evidence = page.getByRole("dialog", { name: "Press them — present your evidence" });
  await evidence.getByRole("button", { name: /Brian's receipt/ }).click();
  await expect(evidence).toBeHidden();
  const ask = page.getByRole("menuitem", { name: /What colours did the instructions say/ });
  await advanceTo(page, ask); await ask.click();
  await advanceTo(page, page.getByRole("menuitem", { name: /Back to Stewie's lab/ }));
  await page.getByRole("menuitem", { name: /Back to Stewie's lab/ }).click();
  await expect(page.getByRole("button", { name: "Tune the signal", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Tune the signal", exact: true }).click();
  await page.getByRole("button", { name: "Use", exact: true }).click();
  await page.getByRole("button", { name: /GREEN — home frequency/ }).click();
  await page.getByRole("button", { name: /BLUE — stabiliser/ }).click();
  await page.getByRole("button", { name: "Flag pattern", exact: true }).click();
  const blue = page.getByRole("menuitem", { name: /Press BLUE/ });
  await advanceTo(page, blue); await blue.click();
  const finish = page.getByRole("menuitem", { name: /Give Lois Brian's very specific explanation/ });
  await advanceTo(page, finish, 35); await finish.click();
  await expect(page.getByRole("heading", { name: "NORMAL SERVICE RESUMED", exact: true })).toBeVisible();
});
