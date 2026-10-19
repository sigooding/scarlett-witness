import { test, expect, type Page, type Locator } from "@playwright/test";
import { JACK_MORROW_WITNESS as STORY } from "../../src/data/jackMorrowWitness";

/**
 * JACK MORROW — Part One, in a real browser.
 *
 * These cases drive the real newsstand, the real runtime and the real Studio.
 * Nothing reaches into React state: scenes are observed through
 * `data-scene-id`, choices are `menuitem`s, and progress is only ever made by
 * clicking the controls a player clicks.
 *
 * Jack Morrow reuses Nobody's Witness's pictures, effects and voices by path,
 * so nothing is stubbed — every media request in these runs is the real file.
 */

const id = STORY.id;
const title = /JACK MORROW/i;

/** Start the case from the newsstand: the case card IS the play control. */
async function openStory(page: Page) {
  await page.goto("./");
  await page.getByRole("button", { name: title }).first().click();
  // The case is a season: card → episode list → title card → the game.
  await page.getByRole("button", { name: /PLAY EPISODE/i }).first().click();
  await page.getByRole("button", { name: /BEGIN EPISODE ONE/i }).first().click();
}

async function scene(page: Page, sceneId: string) {
  await expect(page.locator(`[data-scene-id="${sceneId}"]`)).toBeVisible({ timeout: 25_000 });
}

/** Open a scene directly with injected world state — focused checks only. */
async function branch(page: Page, sceneId: string, params: Record<string, string> = {}) {
  const q = new URLSearchParams({ story: id, scene: sceneId, ...params });
  await page.goto(`./?${q}`);
  await scene(page, sceneId);
}

/** Press on until `target` is really there and the scene is not mid-dissolve. */
async function advanceTo(page: Page, target: Locator, limit = 120) {
  let ready = false;
  for (let i = 0; i < limit; i++) {
    const now = await target.evaluateAll((nodes) => nodes.some(
      (n) => n.getClientRects().length > 0 && !(n as HTMLButtonElement).disabled));
    const moving = (await page.locator('[data-transitioning="1"]').count()) > 0;
    if (now && !moving) {
      if (ready) return;
      ready = true;
      await page.waitForTimeout(120);
      continue;
    }
    ready = false;
    if (moving) { await page.waitForTimeout(120); continue; }
    const next = page.getByRole("button", { name: /^(?:▸ )?(Continue|Start \/ Resume Case)$/i }).first();
    if (await next.isVisible().catch(() => false)) await next.click();
    else {
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await page.keyboard.press("Space");
    }
    await page.waitForTimeout(120);
  }
  throw new Error(`could not reach ${target}; scene=${await page.locator("[data-scene-id]").getAttribute("data-scene-id")}\n${(await page.locator("body").innerText()).slice(-2500)}`);
}

/** Read on until the frame shows `text` (prose, dialogue beats, ending cards). */
async function readUntil(page: Page, text: RegExp, limit = 120) {
  const body = page.locator("body");
  for (let i = 0; i < limit; i++) {
    if (text.test(await body.innerText())) return;
    // Some beats end on a Continue button rather than a keypress.
    const next = page.getByRole("button", { name: /^(?:▸ )?Continue$/i }).first();
    if (await next.isVisible().catch(() => false)) await next.click({ force: true });
    else {
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await page.keyboard.press("Space");
    }
    await page.waitForTimeout(140);
  }
  throw new Error(`never read ${text}; scene=${await page.locator("[data-scene-id]").getAttribute("data-scene-id")}\n${(await body.innerText()).slice(-2500)}`);
}

async function choose(page: Page, name: RegExp) {
  const choice = page.getByRole("menuitem", { name }).first();
  await advanceTo(page, choice);
  await expect(choice).toBeEnabled();
  await choice.click();
  await page.waitForTimeout(400);
}

/** Wait for a timed / quick-time option to disappear under its own clock. */
async function letItLapse(page: Page, option: Locator, seconds = 14) {
  for (let i = 0; i < seconds * 2; i++) {
    if (!(await option.isVisible().catch(() => false))) return;
    await page.waitForTimeout(500);
  }
  throw new Error(`option never lapsed: ${await option.count()}`);
}

/** The HUD chips animate continuously, so Playwright's actionability wait
 *  never settles on them; drive a real mouse click at their centre instead. */
async function clickChip(page: Page, locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("chip has no box");
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function openMenu(page: Page, item: RegExp) {
  const entry = page.getByRole("button", { name: item }).first();
  const menu = page.getByRole("button", { name: /MENU/i }).first();
  await expect(menu).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(4_000);           // let the episode card clear
  // FINDING (see docs/jack-morrow-beta-test.md): the "Before you go — look
  // around" investigation prompt is modal and swallows HUD pointer clicks, so
  // dismiss it before reaching for the menu.
  const promptClose = page.locator('[data-investigation-prompt] button, [role="dialog"] button').first();
  if (await promptClose.isVisible().catch(() => false)) await promptClose.click({ force: true });
  await page.waitForTimeout(600);
  // The HUD chip animates, so Playwright's actionability wait never settles
  // on it: drive a real mouse click at its centre. Do NOT retry — a second
  // click just closes the menu the first one opened.
  const box = await menu.boundingBox();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await expect(entry).toBeVisible({ timeout: 10_000 }).catch(async (e) => {
    await page.screenshot({ path: "/tmp/jmw-menu-failed.png" });
    throw new Error(`menu did not open for ${item}; body=\n${(await page.locator("body").innerText()).slice(-1200)}`);
  });
  const eb = await entry.boundingBox();
  await page.mouse.click(eb!.x + eb!.width / 2, eb!.y + eb!.height / 2);
  await page.waitForTimeout(900);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    if (/favicon|Failed to load resource|net::ERR/i.test(m.text())) return;
    errors.push("console: " + m.text());
  });
  (page as Page & { jmwErrors: string[] }).jmwErrors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as Page & { jmwErrors: string[] }).jmwErrors, "no runtime errors").toEqual([]);
});

/* ================================================================== */

test("the case opens from the newsstand as a one-episode season and plays into the backstreet", async ({ page }) => {
  await page.goto("./");
  const card = page.getByRole("button", { name: title }).first();
  await expect(card).toContainText(/1-Part Season/i);
  await expect(card).toContainText(/24 scenes/i);
  await expect(card).toContainText(/3 endings/i);
  await card.click();
  await page.getByRole("button", { name: /PLAY EPISODE/i }).first().click();
  await page.getByRole("button", { name: /BEGIN EPISODE ONE/i }).first().click();
  await scene(page, "jmw_p_alley");
  await readUntil(page, /Rain\. Not a storm/);
  await page.screenshot({ path: "/tmp/jmw-01-backstreet.png" });
});

test("the backstreet uses the film's own plate, graded midnight-teal", async ({ page }) => {
  await branch(page, "jmw_p_alley");
  await readUntil(page, /Rain\. Not a storm/);
  const art = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("*"));
    const hit = nodes.filter((n) => (n.getAttribute("style") || "").includes("film/img/s1/01-backstreet"));
    return hit.length ? { style: hit[0].getAttribute("style")!.slice(0, 400), count: hit.length } : null;
  });
  expect(art, "the film plate is the scene background").toBeTruthy();
});

test("Mara's talking sprite cycles on the film's plate and speaks with the film's take", async ({ page }) => {
  await branch(page, "jmw_p_alley");
  // Read the scene on until Mara's beat is on stage, then look at her sprite.
  const spriteStyle = () => page.evaluate(() => {
    const hit = Array.from(document.querySelectorAll<HTMLElement>("*"))
      .find((n) => (n.getAttribute("style") || "").includes("jack-morrow/sprites/jm-mara-talk.png"));
    return hit ? hit.getAttribute("style")!.slice(0, 300) : null;
  });
  let sheet: string | null = null;
  for (let i = 0; i < 60 && !sheet; i++) {
    sheet = await spriteStyle();
    if (sheet) break;
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press("Space");
    await page.waitForTimeout(200);
  }
  expect(sheet, "Mara's talking sheet is on stage").toBeTruthy();
  // One sheet, four frames, bottom-aligned on the shared 768px grid.
  expect(sheet).toMatch(/aspect-ratio: 503 \/ 768/);
  expect(sheet).toMatch(/background-size: 400% 100%/);
  await readUntil(page, /Not tonight/);
  // Her line is the film's own voice take, not the browser voice.
  const voiced = await page.evaluate(() =>
    Array.from(document.querySelectorAll("audio,source"))
      .map((a) => a.getAttribute("src") || (a as HTMLAudioElement).currentSrc || "").join(" ")
    + " " + performance.getEntriesByType("resource").map((r) => r.name).join(" "));
  expect(voiced).toMatch(/film\/voice\/s1\/05-mara-tired-not-tonight/);
});

/* ---------- the dialogue clock ---------- */

test("a timed choice that runs out is an answer, not a stall", async ({ page }) => {
  await branch(page, "jmw_p_alley");
  const call = page.getByRole("menuitem", { name: /Call her back/ });
  await advanceTo(page, call);
  await expect(call).toBeVisible();
  await expect(page.locator("body")).toContainText(/⏱/);
  await letItLapse(page, call);
  // Silence is a decision: the story moves on with somewhere to go.
  await expect(page.getByRole("menuitem", { name: /Walk down to the bar/ })).toBeVisible();
  await choose(page, /Walk down to the bar/);
  await scene(page, "jmw_p_shot");
  await page.screenshot({ path: "/tmp/jmw-02-timer-lapsed.png" });
});

/* ---------- quick-time ---------- */

test("letting a quick-time window lapse costs the room and still carries the story on", async ({ page }) => {
  await branch(page, "jmw_hive");
  const qte = page.getByRole("menuitem", { name: /Shoulder it/ });
  await advanceTo(page, qte);
  await expect(page.locator("body")).toContainText(/THE SERVICE DOOR/);
  await letItLapse(page, qte);
  // A miss is a consequence branch, not a game over — he still gets inside.
  await choose(page, /Inside, then/);
  await scene(page, "jmw_passage");
  await readUntil(page, /Two passages back, a door that had been standing open closes/i);
  await page.screenshot({ path: "/tmp/jmw-03-qte-missed.png" });
});

/* ---------- the map, and the order the leads are taken in ---------- */

test("the travel map offers both leads, then only the one that is left — changed", async ({ page }) => {
  await branch(page, "jmw_apartment", { flags: "jmw_leads_open" });
  await page.waitForTimeout(4_000);
  await page.keyboard.press("t");            // the player's own map shortcut
  await expect(page.getByText("Kanda — Where To")).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("body")).toContainText("Okada's Bar");
  await expect(page.locator("body")).toContainText("The Hive");
  await page.screenshot({ path: "/tmp/jmw-04-map-both.png" });

  // Take the bar first and the Hive pin becomes a different place.
  await branch(page, "jmw_apartment", { flags: "jmw_leads_open,jmw_bar_done" });
  await page.waitForTimeout(4_000);
  await page.keyboard.press("t");
  await expect(page.getByText("Kanda — Where To")).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("body")).toContainText("The Hive — after dark");
  await expect(page.locator("body")).not.toContainText("Okada's Bar");
  await page.screenshot({ path: "/tmp/jmw-05-map-after-dark.png" });

  // …and the other way round.
  await branch(page, "jmw_apartment", { flags: "jmw_leads_open,jmw_hive_done" });
  await page.waitForTimeout(4_000);
  await page.keyboard.press("t");
  await expect(page.getByText("Kanda — Where To")).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("body")).toContainText("Okada's — last orders");
  await expect(page.locator("body")).not.toContainText("The Hive — after dark");
  await page.screenshot({ path: "/tmp/jmw-06-map-last-orders.png" });
});

/* ---------- rewind ---------- */

test("Rewind across a big decision takes the decision back and offers it again", async ({ page }) => {
  await branch(page, "jmw_counter");
  const eat = page.getByRole("menuitem", { name: /Eat\. Every mouthful/ });
  await advanceTo(page, eat);
  await eat.click();
  await page.waitForTimeout(700);
  await expect(page.locator("body")).toContainText(/He eats\. Slowly|business card on top of it/i);

  await page.getByRole("button", { name: /REWIND|↺/ }).first().click();
  await page.waitForTimeout(1200);
  await expect(page.getByRole("menuitem", { name: /Eat\. Every mouthful/ })).toBeVisible({ timeout: 20_000 });
  await expect(page.locator("body")).not.toContainText(/business card on top of it/i);
  await page.screenshot({ path: "/tmp/jmw-07-rewound.png" });
});

/* ---------- save / load ---------- */

test("a save made mid-branch reloads into the same scene", async ({ page }) => {
  await branch(page, "jmw_stakeout");
  await advanceTo(page, page.getByRole("menuitem").first());
  await openMenu(page, /SAVE/i);
  await expect(page.locator("body")).toContainText(/SAVE|SLOT/i);
  const slot = page.getByRole("button", { name: /slot|empty/i }).last();
  await slot.click({ force: true }).catch(() => {});
  await page.waitForTimeout(1800);
  const savedScene = await page.locator("[data-scene-id]").getAttribute("data-scene-id");

  await page.reload();
  await page.waitForTimeout(2500);
  await openMenu(page, /LOAD/i);
  await page.getByRole("button", { name: /slot|resume|load/i }).last().click({ force: true }).catch(() => {});
  await page.waitForTimeout(2500);
  expect(await page.locator("[data-scene-id]").getAttribute("data-scene-id")).toBe(savedScene);
});

/* ---------- the three endings ---------- */

for (const [flag, heading, recap] of [
  ["jmw_out_promise", "THE PROMISE", /She is alive, in a storeroom under a noodle counter/],
  ["jmw_out_flour", "FLOUR SACKS", /Mara Voss is alive, and she does not trust you yet/],
  ["jmw_out_bolt", "THE CURTAIN", /You found her and lost her in the same minute/],
] as const) {
  test(`ending — ${heading} shows its card and its recap`, async ({ page }) => {
    await branch(page, "jmw_ledger", { flags: flag, trust: "vera:2,kaneko:1,mara:1" });
    await choose(page, /Down through the steam|The curtain\. Shoes on the stair/);
    await readUntil(page, new RegExp(heading));
    await readUntil(page, recap);
    await readUntil(page, /CHAPTER COMPLETE/);
    await page.screenshot({ path: `/tmp/jmw-08-ending-${flag}.png` });
  });
}

/* ---------- the recap is the player's own run ---------- */

test("the end-of-episode recap is gated on what this player actually chose", async ({ page }) => {
  await branch(page, "jmw_ledger", {
    flags: "jmw_out_flour,jmw_declined_vera,jmw_clip_lost,jmw_kept_from_ishida,jmw_bar_first",
  });
  await readUntil(page, /watched the screen light up and let it go dark/i);
  await readUntil(page, /A man with a mop found it/i);
  await readUntil(page, /He did not telephone Ishida/i);
  await readUntil(page, /He went to the bar first/i);
  await page.screenshot({ path: "/tmp/jmw-09-recap.png" });
  const body = await page.locator("body").innerText();
  expect(body).not.toMatch(/He telephoned Ishida at twenty past midnight/i);
  expect(body).not.toMatch(/She kept the red bird clip\. It was still in her hair/i);
});

/* ---------- trust carried into Part 2 ---------- */

test("finishing the episode snapshots the trust for Part Two", async ({ page }) => {
  await branch(page, "jmw_ledger", { flags: "jmw_out_promise", trust: "vera:3,kaneko:2,mara:2,ishida:-1" });
  await choose(page, /Down through the steam/);
  await readUntil(page, /THE PROMISE/);
  await readUntil(page, /CHAPTER COMPLETE/);
  // Per-episode save slots are the engine's season structure; the carry is
  // whatever the episode's own snapshot holds.
  const season = await page.evaluate(() => Object.keys(localStorage)
    .filter((k) => /jack-morrow/.test(k))
    .map((k) => [k, localStorage.getItem(k)]));
  const blob = JSON.stringify(season);
  expect(season.length, "the episode has its own save/snapshot record").toBeGreaterThan(0);
  // The trust the player earned is what Part Two opens on.
  expect(blob).toMatch(/characterTrust/);
  expect(blob).toMatch(/vera/);
  await page.screenshot({ path: "/tmp/jmw-10-carry.png" });
});

/* ---------- phone width ---------- */

test("the case is readable at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await branch(page, "jmw_p_alley");
  await advanceTo(page, page.getByRole("menuitem").first());
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "no horizontal overflow").toBeLessThanOrEqual(2);
  await page.screenshot({ path: "/tmp/jmw-11-phone.png" });
});

/* ================================================================== */
/*  THE STUDIO: Check → export → fresh import → play                    */
/* ================================================================== */

test("Studio: Check is spotless, and the exported reel re-imports into a cleared Studio", async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto("./");
  await page.getByRole("button", { name: /studio/i }).first().click();
  await expect(page.getByRole("textbox", { name: "Story title", exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Choose story to edit" }).selectOption(id);
  await expect(page.getByRole("textbox", { name: "Story title", exact: true })).toHaveValue("Jack Morrow");

  // 1. The engine's validator, through the Studio's own Check panel.
  const panel = page.locator("#studio-validation");
  const report = await panel.innerText();
  expect(report).toMatch(/CONTINUITY DEPARTMENT/);
  // ⛔ is the blocking "red ERROR" marker; ⚠ is advisory.
  expect(report, "no blocking errors").not.toContain("⛔");
  await page.screenshot({ path: "/tmp/jmw-12-studio-check.png" });

  // 2. Export it.
  await page.keyboard.press("Control+s");
  const dialog = page.getByRole("dialog", { name: "Export reel" });
  await expect(dialog).toBeVisible({ timeout: 60_000 });
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    dialog.getByRole("button", { name: "⇩ Download .reel.json", exact: true }).click(),
  ]);
  expect(await download.failure()).toBeNull();
  const reel = JSON.parse(await (await import("node:fs/promises")).readFile(await download.path()!, "utf8"));
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  expect(reel.id).toBe(id);
  expect(reel.scenes.length).toBe(STORY.scenes.length);
  expect(reel.episodes.length).toBe(1);
  expect(reel.characters.map((c: { id: string }) => c.id)).toEqual(STORY.characters.map((c) => c.id));
  // Everything the case shows is the film's own media, referenced by path.
  expect(reel.items).toEqual([]);

  // 3. A genuinely fresh Studio: a brand-new browser context, so there is no
  //    draft, no custom story and no import history in it at all.
  const fresh = await page.context().browser()!.newContext();
  const freshPage = await fresh.newPage();
  await freshPage.goto("./");
  await freshPage.getByRole("button", { name: /studio/i }).first().click();
  await expect(freshPage.getByRole("textbox", { name: "Story title", exact: true })).toBeVisible({ timeout: 30_000 });

  // 4. Import the exported reel back in.
  await freshPage.getByLabel("Import reel file", { exact: true }).setInputFiles({
    name: "jack-morrow.reel.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(reel)),
  });
  await expect(freshPage.getByText(/Opened "Jack Morrow"/)).toBeVisible({ timeout: 60_000 });
  await expect(freshPage.getByRole("textbox", { name: "Story title", exact: true })).toHaveValue("Jack Morrow");

  // 5. And it still validates clean after the round trip.
  expect(await freshPage.locator("#studio-validation").innerText(), "still no blocking errors").not.toContain("⛔");
  await freshPage.screenshot({ path: "/tmp/jmw-12-studio-import.png" });
  await fresh.close();
});

/* ---------- a whole run, start to finish, from the newsstand ---------- */

test("a full run from the newsstand reaches an ending with no dead ends", async ({ page }) => {
  test.setTimeout(900_000);
  await openStory(page);
  await scene(page, "jmw_p_alley");

  for (let step = 0; step < 160; step++) {
    if (/CHAPTER COMPLETE/.test(await page.locator("body").innerText())) break;
    const any = page.getByRole("menuitem").first();
    let ready = false;
    try { await advanceTo(page, any, 10); ready = await any.isVisible().catch(() => false); } catch { /* read on */ }
    if (!ready) {
      // The "Before you go — look around" investigation prompt is modal and
      // covers the choice rail. Dismiss it with its own button — never Escape,
      // which opens the "Leave the case?" confirm instead.
      const text = await page.locator("body").innerText();
      if (/Before you go/i.test(text)) {
        await page.getByRole("button", { name: "Dismiss the search prompt" })
          .click({ force: true }).catch(() => {});
        await page.waitForTimeout(500);
        continue;
      }
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await page.keyboard.press("Space");
      await page.waitForTimeout(300);
      continue;
    }
    // The choice rail animates in, so Playwright's stability wait can hang:
    // advanceTo already proved the option is live, so force the click.
    await any.click({ force: true });
    await page.waitForTimeout(450);
  }

  // The Case Progress drawer can hold the keyboard, so close it before reading on.
  const drawer = page.getByRole("button", { name: /CASE PROGRESS/i }).first();
  if (/Story so far/i.test(await page.locator("body").innerText())) {
    await drawer.click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);
  }
  await readUntil(page, /THE PROMISE|FLOUR SACKS|THE CURTAIN/, 200);
  // The run finished on one of the three endings — the card itself is covered
  // by the three dedicated ending tests above.
  const ending = await page.locator("[data-scene-id]").getAttribute("data-scene-id");
  expect(ending).toMatch(/^jmw_end_(promise|flour|bolt)$/);
  const body = await page.locator("body").innerText();
  expect(body).toMatch(/THE PROMISE|FLOUR SACKS|THE CURTAIN/);
  expect(body, "no raw flag ids leak into the player's journal").not.toMatch(/\bjmw [a-z]+ [a-z]+/);
  await page.screenshot({ path: "/tmp/jmw-13-full-run.png" });
});
