import { writeFile } from "node:fs/promises";
import { exportedReelJson } from "./export-driver";
import { test, expect, type Page } from '@playwright/test';
import { BLADE_RUNNER_ACT1 as S } from '../../src/data/bladeRunnerAct1';
import { BR_HD_SHEETS } from '../../src/data/bladeRunnerHdAssets';
import { collectStoryAssetIds } from '../../src/data/mediaLibrary';
import { AdventureDriver } from './adventure-driver';

const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const found: string[] = []; errors.set(page, found);
  page.on('pageerror', e => found.push(e.message));
  page.on('console', m => { if (/error|warning/.test(m.type()) && /children with the same key|validateDOMNesting|maximum update depth|React Hook/.test(m.text())) found.push(m.text()); });
});
test.afterEach(async ({ page }) => expect(errors.get(page), 'No runtime/React errors').toEqual([]));
const room = (page: Page, id: string) => expect(page.locator('[data-scene-id]')).toHaveAttribute('data-scene-id', id, { timeout: 15_000 });
const label = (id: string) => S.scenes.flatMap(s => s.hotspots ?? []).find(h => h.id === id)!.label;
async function marker(page: Page, id: string, to?: string) {
  await page.getByRole('button', { name: label(id), exact: true }).click();
  if (to) await room(page, to);
}
async function deepLink(page: Page, scene: string, flags = '', items = '') {
  await page.goto(`/?story=${S.id}&scene=${scene}&flags=${flags}&items=${items}`);
  await room(page, scene);
}
const fired = (page: Page) => page.locator('output[data-fired]');
const playerX = async (page: Page) => Number(await fired(page).getAttribute('data-player-x'));
async function fixture(page: Page, query = '') {
  await page.goto(`/scripts/browser/stage-regression.html?${query}`);
  await expect(fired(page)).toHaveAttribute('data-fired', '[]');
}

test('Stage: keyboard across spawn, incidental object and overlapping exits fires nothing in aim mode', async ({ page }) => {
  await fixture(page);
  await page.keyboard.down('ArrowRight');
  await expect.poll(() => playerX(page)).toBeGreaterThan(95);
  await page.keyboard.up('ArrowRight');
  await expect(fired(page)).toHaveAttribute('data-fired', '[]');
  await page.getByRole('button', { name: 'Far exit', exact: true }).click();
  await expect(fired(page)).toHaveAttribute('data-fired', '["Far exit"]');
  await page.waitForTimeout(250);
  await expect(fired(page)).toHaveAttribute('data-fired', '["Far exit"]');
});
for (const policy of ['smart', 'walkover']) test(`Stage: ${policy} explicit target owns arrival; incidental object and adjacent exit cannot steal it`, async ({ page }) => {
  await fixture(page, `policy=${policy}`);
  await page.getByRole('button', { name: 'Far exit', exact: true }).click();
  await expect(fired(page)).toHaveAttribute('data-fired', '["Far exit"]');
  await page.waitForTimeout(300);
  await expect(fired(page)).toHaveAttribute('data-fired', '["Far exit"]');
});
test('Stage: keyboard and empty-floor commands cancel a pending exit, including after walking through its zone', async ({ page }) => {
  await fixture(page);
  await page.getByRole('button', { name: 'Far exit', exact: true }).click();
  await page.keyboard.down('ArrowRight');
  await expect.poll(() => playerX(page)).toBeGreaterThan(95);
  await page.keyboard.up('ArrowRight');
  await expect(fired(page)).toHaveAttribute('data-fired', '[]');
  await page.getByRole('button', { name: 'Spawn exit', exact: true }).click();
  const floor = await page.locator('[data-fixture-room]').boundingBox();
  await page.mouse.click(floor!.x + floor!.width * .70, floor!.y + floor!.height * .955);
  await expect.poll(() => playerX(page)).toBeLessThan(75);
  await page.waitForTimeout(1000);
  expect(await playerX(page)).toBeGreaterThan(65);
  await expect(fired(page)).toHaveAttribute('data-fired', '[]');
});
test('Stage: larger HD sprites keep their feet registered, on resize too; hidden walker leaves remote controls usable', async ({ page }) => {
  await fixture(page);
  for (const viewport of [{ width: 1440, height: 960 }, { width: 900, height: 700 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => page.locator('[data-stage-player]').evaluate(el => {
      const room = document.querySelector('[data-fixture-room]')!.getBoundingClientRect();
      return Math.abs(el.getBoundingClientRect().bottom - (room.top + room.height * .88));
    })).toBeLessThan(2);
    const floor = await page.locator('[data-fixture-room]').boundingBox();
    const npc = await page.locator('[data-npc-id="scaled-npc"]').boundingBox();
    expect(npc!.y + npc!.height).toBeCloseTo(floor!.y + floor!.height * .8, 0);
    const chip = await page.locator('[data-npc-id="scaled-npc"] .stage-npc-chip').boundingBox();
    expect(chip!.x + chip!.width / 2).toBeCloseTo(npc!.x + npc!.width / 2, 0);
  }
  await fixture(page, 'hide=1');
  await expect(page.locator('[data-stage-player]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Far exit', exact: true }).click();
  await expect(fired(page)).toHaveAttribute('data-fired', '["Far exit"]');
});
test('Cockpit: scenery moves, dashboard pixels stay fixed; masks and offsets survive resize and reduced motion', async ({ page }, info) => {
  await fixture(page, 'layers=1');
  const layers = page.locator('[data-scrolling-layer]');
  await expect(layers).toHaveCount(2);
  for (const viewport of [{ width: 1440, height: 960 }, { width: 960, height: 720 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => layers.first().evaluate(e => parseFloat(getComputedStyle(e).getPropertyValue('--scroll-tile-x')))).toBeGreaterThan(viewport.width - 1);
    const box = (await page.locator('[data-fixture-room]').boundingBox())!;
    const clip = (x: number, y: number, w: number, h: number) => ({ x: box.x + box.width*x, y: box.y + box.height*y, width: box.width*w, height: box.height*h });
    const dashboard = clip(0, .55, 1, .4), monitor = clip(.035, .38, .17, .2), glass = clip(.28, .06, .3, .25);
    const [dash1, screen1, glass1] = await Promise.all([page.screenshot({ clip: dashboard }), page.screenshot({ clip: monitor }), page.screenshot({ clip: glass })]);
    const before = await layers.first().evaluate(e => getComputedStyle(e).backgroundPosition);
    await page.waitForTimeout(350);
    expect(await layers.first().evaluate(e => getComputedStyle(e).backgroundPosition)).not.toBe(before);
    expect(await page.screenshot({ clip: dashboard })).toEqual(dash1);
    expect(await page.screenshot({ clip: monitor })).toEqual(screen1);
    expect(await page.screenshot({ clip: glass })).not.toEqual(glass1);
    expect(await layers.first().evaluate(e => getComputedStyle(e.parentElement!).maskImage)).toContain('spinner-windscreen-window.png');
  }
  await page.screenshot({ path: info.outputPath('fixed-dashboard-moving-city.png') });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(async () => layers.first().evaluate(e => getComputedStyle(e).animationName)).toBe('none');
  const staticPosition = await layers.first().evaluate(e => getComputedStyle(e).backgroundPosition);
  expect(parseFloat(staticPosition.split(' ')[1])).toBeLessThan(0);
  await page.waitForTimeout(300);
  expect(await layers.first().evaluate(e => getComputedStyle(e).backgroundPosition)).toBe(staticPosition);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await fixture(page, 'layers=1&still=1');
  await expect.poll(async () => layers.first().evaluate(e => parseFloat(getComputedStyle(e).backgroundPosition.split(' ')[1]))).toBeLessThan(0);
  const zero = await layers.first().evaluate(e => ({ animation: getComputedStyle(e).animationName, position: getComputedStyle(e).backgroundPosition }));
  expect(zero.animation).toBe('none');
  await page.waitForTimeout(300);
  expect(await layers.first().evaluate(e => getComputedStyle(e).backgroundPosition)).toBe(zero.position);
});
test('Shipped shop is traversable with the keyboard; explicit exit works repeatedly, stage 12 returns to mainframe', async ({ page }, info) => {
  await deepLink(page, 'br_runciter_int');
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(4500); await page.keyboard.up('ArrowRight');
  await room(page, 'br_runciter_int');
  await expect(page.getByRole('button', { name: label('br_hs_take_disk'), exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('shop-walkthrough.png') });
  for (let n = 0; n < 2; n++) { await marker(page, 'br_hs_runciter_exit', 'br_runciter_ext'); await marker(page, 'br_hs_ext_door', 'br_runciter_int'); }
  await deepLink(page, 'br_mccoy_apt');
  for (let n = 0; n < 2; n++) { await marker(page, 'br_hs_apt_return', 'br_mainframe_hub'); await marker(page, 'br_hs_mainframe_home', 'br_mccoy_apt'); }
});

async function zubenRoute(page: Page, timeout: boolean, retire: boolean) {
  const d = new AdventureDriver(page);
  await marker(page, 'br_hs_howie_kitchen', 'br_howie_kitchen');
  await expect(page.locator('[data-npc-id="br_npc_zuben_kitchen"]')).toBeVisible();
  await marker(page, 'br_hs_zuben_question');
  const dodge = page.getByRole('menuitem', { name: /Dodge to the right/ });
  await d.advanceTo(dodge);
  if (timeout) { await room(page, 'br_zuben_spilled'); await d.choose(/Get up and follow/); }
  else {
    await dodge.click(); await room(page, 'br_zuben_evade');
    await expect(page.locator('[data-stage-player] [data-sheet-animation="duck"]')).toBeVisible();
    await expect(page.locator('[data-npc-id="br_npc_zuben_throw"] [data-sheet-animation="throw"]')).toBeVisible();
  }
  await room(page, 'br_chinatown_alley');
  await expect(page.getByRole('button', { name: label('br_hs_alley_plate'), exact: true })).toHaveCount(0);
  await marker(page, 'br_hs_alley_return', 'br_chinatown');
  await marker(page, 'br_hs_howie_kitchen', 'br_howie_kitchen');
  await expect(page.locator('[data-npc-id="br_npc_zuben_kitchen"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: label('br_hs_zuben_question'), exact: true })).toHaveCount(0);
  await marker(page, 'br_hs_kitchen_alley', 'br_chinatown_alley');
  await marker(page, 'br_hs_alley_warehouse', 'br_warehouse_stairs');
  await marker(page, 'br_hs_stairs_upper', 'br_zuben_warehouse');
  await expect(page.locator('[data-npc-id="br_npc_zuben_warehouse"]')).toHaveCount(0);
  await marker(page, 'br_hs_warehouse_door');
  await expect(page.locator('[data-npc-id="br_npc_zuben_warehouse"]')).toBeVisible();
  await expect(page.locator('[data-stage-player] [data-sheet-animation="draw"]')).toBeVisible();
  await expect(page.locator('[data-stage-player] [data-sheet-animation="draw"]')).toHaveCount(0, { timeout: 15_000 });
  await marker(page, 'br_hs_zuben_standoff');
  await d.choose(retire ? /Retire Zuben/ : /Holster the blaster/);
  await room(page, retire ? 'br_zuben_retired' : 'br_zuben_spared');
  if (retire) {
    const search = page.getByRole('menuitem', { name: /Search Zuben's coat/ });
    await d.advanceTo(search); await search.click();
    await expect.poll(async () => !await search.isVisible() || !await search.isEnabled()).toBe(true);
  }
  await d.choose(/Leave through the garage/);
  await room(page, 'br_howie_street');
  await expect(page.locator('[data-npc-id="br_npc_gaff_street"]')).toBeVisible();
  await marker(page, 'br_hs_gaff_aftermath');
  await expect(page.locator('[data-npc-id="br_npc_gaff_street"] [data-sheet-animation="talk"]')).toBeVisible();
  await page.screenshot({path:test.info().outputPath(retire ? 'gaff-retirement.png' : 'gaff-mercy.png')});
  const topics = page.getByRole('menu', { name: 'Conversation topics' });
  await expect(topics.getByRole('menuitem', { name: retire ? /I let Zuben go/ : /The warehouse retirement/ })).toHaveCount(0);
  await topics.getByRole('menuitem', { name: retire ? /The warehouse retirement/ : /I let Zuben go/ }).click();
  const leave = page.getByRole('menuitem', { name: /I'll check the alley/ });
  await d.advanceTo(leave); await leave.click();
  await expect(page.locator('[data-npc-id="br_npc_gaff_street"] [data-sheet-animation="idle"]')).toBeVisible();
  // The one-shot debrief becomes a genuinely repeatable conversation review.
  await marker(page, 'br_hs_gaff_aftermath'); await expect(topics).toBeVisible();
  await leave.click();
  await marker(page, 'br_hs_street_alley', 'br_chinatown_alley');
  await marker(page, 'br_hs_alley_plate');
  await expect(page.getByRole('button', { name: label('br_hs_alley_plate'), exact: true })).toHaveCount(0);
  await marker(page, 'br_hs_alley_street', 'br_howie_street');
  await marker(page, 'br_hs_street_home', 'br_mccoy_apt');
  await marker(page, 'br_hs_vidphon');
  await expect(page.locator('[data-stage-caption]')).toContainText(retire ? /retirement report/ : /holster|let him/i);
}

test('Built-in newsstand → real clues and ESPER → KIA → dodge/spare → ending (no forged progress)', async ({ page }, info) => {
  test.setTimeout(300_000);
  await page.goto('/');
  await page.getByRole('button', { name: /Blade Runner.*Act/i }).first().click();
  // This reel deliberately opens directly on the crime scene (no title sequence).
  await room(page, 'br_runciter_ext');
  await marker(page, 'br_hs_ext_door', 'br_runciter_int');
  await marker(page, 'br_hs_take_disk');
  await expect(page.getByRole('button', { name: label('br_hs_take_disk'), exact: true })).toHaveCount(0);
  await marker(page, 'br_hs_take_casing');
  await expect(page.getByRole('button', { name: label('br_hs_take_casing'), exact: true })).toHaveCount(0);
  await marker(page, 'br_hs_runciter_exit', 'br_runciter_ext');
  await page.getByRole('button', { name: 'LAPD Headquarters', exact: true }).click();
  await room(page, 'br_mainframe_hub');
  await marker(page, 'br_hs_esper_terminal');
  const esper = page.getByRole('dialog', { name: 'ESPER photo analysis' });
  await expect(esper).toBeVisible();
  await esper.getByRole('button', { name: 'Sector 1-A (Animal Cages)', exact: true }).click();
  await esper.getByRole('button', { name: /Track & Enhance/ }).click();
  await expect(esper.getByRole('img', { name: 'ESPER Photo' })).toHaveAttribute('src', /esper-cages.webp/);
  await esper.getByRole('button', { name: /Wide Angle View/ }).click();
  await esper.getByRole('button', { name: 'Sector 3-B (Counter Reflection)', exact: true }).click();
  await esper.getByRole('button', { name: /Track & Enhance/ }).click();
  await expect(esper).toBeHidden();
  await marker(page, 'br_hs_mainframe_sync');
  await expect(page.locator('[data-stage-caption]')).toContainText(/evidence uploaded/);
  await marker(page, 'br_hs_spinner_takeoff', 'br_spinner_flight');
  await expect(page.locator('[data-stage-player]')).toHaveCount(0);
  await marker(page, 'br_hs_flight_arrive', 'br_runciter_ext');
  await marker(page, 'br_hs_chinatown_travel', 'br_chinatown');
  await zubenRoute(page, false, false);
  await page.screenshot({ path: info.outputPath('earned-mercy-vidphon.png') });
  await marker(page, 'br_hs_apt_return', 'br_mainframe_hub');
  await marker(page, 'br_hs_mainframe_home', 'br_mccoy_apt');
  await marker(page, 'br_hs_conclude_act1', 'br_act1_conclusion');
  await new AdventureDriver(page).advanceTo(page.getByText('ACT ONE REPORT FILED — THE ZUBEN DECISION', { exact: true }));
  await page.screenshot({ path: info.outputPath('earned-first-act-ending.png') });
});
test('Timed-out pot is recoverable; retire branch updates VidPhon and persistent NPC gates survive reload', async ({ page }) => {
  test.setTimeout(210_000);
  await deepLink(page, 'br_chinatown', 'br_esper_dragon_revealed,br_mainframe_synced', 'br_item_blaster');
  await zubenRoute(page, true, true);
  // Save an earned decision, reboot at an unrelated empty-inventory scene,
  // then load the real slot through the UI. No save-data fabrication.
  await page.getByRole('button', { name: /Menu/ }).first().click();
  await page.getByRole('button', { name: '💾 Save', exact: true }).click();
  await page.getByRole('dialog', { name: 'Save — choose a slot' }).getByRole('button', { name: 'Save here', exact: true }).first().click();
  await deepLink(page, 'br_mainframe_hub');
  await page.getByRole('button', { name: /Menu/ }).first().click();
  await page.getByRole('button', { name: '📂 Load', exact: true }).click();
  const slot = page.getByRole('dialog', { name: 'Load a save' }).locator('div.mb-2').filter({ hasText: 'Slot 1' });
  await slot.getByRole('button', { name: 'Load', exact: true }).click();
  await room(page, 'br_mccoy_apt');
  await marker(page, 'br_hs_apt_return', 'br_mainframe_hub');
  await marker(page, 'br_hs_spinner_takeoff', 'br_spinner_flight');
  await marker(page, 'br_hs_flight_arrive', 'br_runciter_ext');
  await marker(page, 'br_hs_chinatown_travel', 'br_chinatown');
  await marker(page, 'br_hs_howie_kitchen', 'br_howie_kitchen');
  await expect(page.locator('[data-npc-id="br_npc_zuben_kitchen"]')).toHaveCount(0);
  await marker(page, 'br_hs_kitchen_alley', 'br_chinatown_alley');
  await marker(page, 'br_hs_alley_warehouse', 'br_warehouse_stairs');
  await marker(page, 'br_hs_stairs_upper', 'br_zuben_warehouse');
  await expect(page.locator('[data-npc-id="br_npc_zuben_warehouse"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: label('br_hs_zuben_standoff'), exact: true })).toHaveCount(0);
  await marker(page, 'br_hs_warehouse_return', 'br_warehouse_stairs');
  await marker(page, 'br_hs_stairs_alley', 'br_chinatown_alley');
});
test('All 54 HD frames are nonempty, transparent, grounded, without magenta backgrounds; portraits load', async ({ page }, info) => {
  await page.goto('/');
  const result = await page.evaluate(async sheets => {
    const errors: string[] = [];
    for (const [name, sheet] of Object.entries(sheets)) {
      const img = new Image(); img.src = sheet.image; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d')!; ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      const columns = c.width / sheet.frameWidth, rows = c.height / sheet.frameHeight;
      for (let frame = 0; frame < columns * rows; frame++) {
        const x0 = frame % columns * sheet.frameWidth, y0 = Math.floor(frame / columns) * sheet.frameHeight;
        let visible = 0, clear = 0, magenta = 0, bottom = 0;
        for (let y = y0; y < y0 + sheet.frameHeight; y++) for (let x = x0; x < x0 + sheet.frameWidth; x++) {
          const i = (y*c.width+x)*4; if (d[i+3] < 10) clear++; else { visible++; bottom = Math.max(bottom, y - y0); }
          if (d[i+3] > 160 && d[i] > 100 && d[i+2] > 100 && d[i+1] < Math.min(d[i], d[i+2])*.45) magenta++;
        }
        const pixels = sheet.frameWidth*sheet.frameHeight;
        if (visible/pixels < .2 || clear/pixels < .15 || magenta/pixels > .003 || bottom < sheet.frameHeight-6) errors.push(`${name} frame ${frame}: visible=${visible/pixels} clear=${clear/pixels} magenta=${magenta/pixels} bottom=${bottom}`);
      }
      const portrait = new Image(); portrait.src = sheet.image.replace('-sheet.png', '-portrait.png'); await portrait.decode();
      if (portrait.width < 180 || portrait.height < 240) errors.push(`${name}: small portrait`);
    }
    return errors;
  }, BR_HD_SHEETS);
  expect(result).toEqual([]);
  await deepLink(page, 'br_howie_kitchen');
  await page.screenshot({ path: info.outputPath('hd-kitchen-cast.png') });
});

test('Studio controls + navigation audit → portable export/import/publish; masked cockpit and ESPER/VK work without original files', async ({ page }, info) => {
  test.setTimeout(240_000);
  await page.goto('/?studio=1');
  const upload = page.getByLabel('Import reel file', { exact: true });
  await upload.setInputFiles({ name: 'blade-runner-draft.reel.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(S)) });
  await expect(page.getByRole('textbox', { name: 'Story title', exact: true })).toHaveValue(S.title);
  await page.getByRole('combobox', { name: 'Jump to scene' }).selectOption('br_spinner_flight');
  await page.getByRole('tab', { name: '🚶 Stage', exact: true }).click();
  await page.getByRole('button', { name: /^🕵️ Player character/ }).click();
  const hidden = page.getByRole('checkbox', { name: 'Hide player sprite (cockpit / close-up)' });
  await expect(hidden).toBeChecked(); await hidden.uncheck(); await hidden.check();
  await page.getByRole('tab', { name: '▶ Test', exact: true }).click();
  await page.getByRole('combobox', { name: 'Navigation audit return destination' }).selectOption('br_mainframe_hub');
  await page.getByRole('button', { name: 'Run navigation audit', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Walking room navigation audit' })).toContainText('20 / 20 rooms');
  await page.keyboard.press('Control+s');
  const exported = page.getByRole('dialog', { name: 'Export reel' }); await expect(exported).toBeVisible({ timeout: 60_000 });
  const preview = page.getByRole('textbox', { name: 'Export preview (truncated)' });
  await expect(preview).toBeVisible();
  expect((await preview.inputValue()).length).toBeLessThan(201_000);
  const json = await exportedReelJson(page);
  expect(json.length).toBeGreaterThan(200_000);
  const reel = JSON.parse(json);
  expect([...collectStoryAssetIds(reel)].every(id => reel.assets.some((a: { id: string }) => a.id === id))).toBe(true);
  expect(reel.scenes.find((s: { id: string }) => s.id === 'br_spinner_flight').stage.hidePlayer).toBe(true);
  expect(reel.scenes.find((s: { id: string }) => s.id === 'br_howie_kitchen').stage.npcs[0].gating.excludesFlags).toContain('br_zuben_fled');
  expect(reel.scenes.find((s: { id: string }) => s.id === 'br_howie_street').hotspots.find((h: {id:string})=>h.id==='br_hs_gaff_aftermath').states[0].isRepeatable).toBe(true);
  await page.keyboard.press('Escape'); await expect(exported).toBeHidden();
  const portableFile = info.outputPath('blade-runner-portable.reel.json');
  await writeFile(portableFile, json);
  await upload.setInputFiles(portableFile);
  await expect(page.getByText(`Opened "${S.title}" with ${reel.assets.length} asset(s).`, { exact: true })).toBeVisible({ timeout: 45_000 });
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await expect(page.getByText('Published. The newsstand now uses this version.', { exact: true })).toBeVisible();
  const escaped: string[] = [];
  await page.route('**/assets/blade-runner/**', async r => {
    // Vite serves the tiny imported sheet-metadata JSON as a /public/ JS
    // module. That is application code, not a runtime artwork fallback.
    if (!new URL(r.request().url()).pathname.startsWith('/assets/blade-runner/')) { await r.continue(); return; }
    escaped.push(r.request().url()); await r.abort();
  });
  await deepLink(page, 'br_spinner_flight');
  await expect(page.locator('[data-scrolling-layer]').first()).toBeVisible();
  expect(await page.locator('[data-scrolling-layer]').first().evaluate(e => getComputedStyle(e.parentElement!).maskImage)).toContain('data:image/png;base64,');
  await marker(page, 'br_hs_flight_abort', 'br_mainframe_hub');
  await deepLink(page, 'br_mainframe_hub', 'br_yukon_investigated', 'br_item_photo_disk');
  await marker(page, 'br_hs_esper_terminal');
  const esper = page.getByRole('dialog', { name: 'ESPER photo analysis' }); await expect(esper).toBeVisible();
  await expect(esper.getByRole('img', { name: 'ESPER Photo' })).toHaveAttribute('src', /^data:image/);
  await page.setViewportSize({ width: 390, height: 844 });
  await esper.getByRole('button', { name: 'Sector 1-A (Animal Cages)', exact: true }).click();
  await esper.getByRole('button', { name: /Track & Enhance/ }).click();
  await expect(esper.getByRole('img', { name: 'ESPER Photo' })).toHaveAttribute('src', /^data:image/);
  await page.screenshot({ path: info.outputPath('portable-esper-mobile.png') });
  await esper.getByRole('button', { name: /Exit ESPER/ }).click();
  await marker(page, 'br_hs_vk_terminal');
  const vk = page.getByRole('dialog', { name: 'Voight-Kampff test' }); await expect(vk).toBeVisible();
  await expect(vk.getByRole('img', { name: 'Subject Iris' })).toHaveAttribute('src', /^data:image/);
  await vk.getByRole('button', { name: /Abort Test/ }).click(); await expect(vk).toBeHidden();
  expect(escaped, 'Portable reel does not lean on original installed files').toEqual([]);
});

test('Stage: eight headings select real directional banks; stopping holds a rest pose and linked conversation restores idle', async ({ page }) => {
  await fixture(page, 'directions=1');
  const headings = [
    ['right',['ArrowRight'],'walk-right','idle-right'], ['left',['ArrowLeft'],'walk-right','idle-right'],
    ['up',['ArrowUp'],'walk-up','idle-up'], ['down',['ArrowDown'],'walk-down','idle-down'],
    ['up-right',['ArrowUp','ArrowRight'],'walk-up-right','idle-up-right'],
    ['up-left',['ArrowUp','ArrowLeft'],'walk-up-right','idle-up-right'],
    ['down-right',['ArrowDown','ArrowRight'],'walk-down-right','idle-down-right'],
    ['down-left',['ArrowDown','ArrowLeft'],'walk-down-right','idle-down-right'],
  ] as const;
  for (const [facing, keys, walk, idle] of headings) {
    for (const key of keys) await page.keyboard.down(key);
    await expect(page.locator('[data-stage-player]')).toHaveAttribute('data-stage-facing', facing);
    await expect(page.locator(`[data-stage-player] [data-sheet-animation="${walk}"]`)).toBeVisible();
    await page.waitForTimeout(160);
    await Promise.all(keys.map(key => page.keyboard.up(key)));
    await expect(page.locator('[data-stage-player] [data-sheet-animation^="idle"]')).toBeVisible();
    // Separate physical key-up events can straddle a render frame. The last
    // live heading, not an assumed simultaneous release, owns the rest pose.
    const stopped = await page.locator('[data-stage-player]').getAttribute('data-stage-facing');
    const rest = stopped === facing ? idle : headings.find(h => h[0] === stopped)![3];
    await expect(page.locator(`[data-stage-player] [data-sheet-animation="${rest}"]`)).toBeVisible();
    const frame = await page.locator('[data-stage-player] [data-sheet-frame]').getAttribute('data-sheet-frame');
    await page.waitForTimeout(160);
    expect(await page.locator('[data-stage-player] [data-sheet-frame]').getAttribute('data-sheet-frame')).toBe(frame);
  }
  const box = (await page.locator('[data-fixture-room]').boundingBox())!;
  const x = Number(await fired(page).getAttribute('data-player-x')), y = Number(await fired(page).getAttribute('data-player-y'));
  await page.mouse.click(box.x + box.width * (x-12)/100, box.y + box.height * (y-12)/100);
  await expect(page.locator('[data-stage-player] [data-sheet-animation="walk-up-right"]')).toBeVisible();
  await expect(page.locator('[data-stage-player] [data-sheet-animation="idle-up-right"]')).toBeVisible();
  await expect(page.locator('[data-stage-player]')).toHaveAttribute('data-stage-facing','up-left');
  await expect(fired(page)).toHaveAttribute('data-fired','[]');
  await fixture(page,'convo=1');
  await page.getByRole('button',{name:'NPC talk',exact:true}).click();
  await expect(page.locator('[data-npc-id="scaled-npc"] [data-sheet-animation="talk"]')).toBeVisible();
  await page.getByRole('button',{name:'End fixture conversation'}).click();
  await expect(page.locator('[data-npc-id="scaled-npc"] [data-sheet-animation="idle"]')).toBeVisible();
});

test('Studio: real silhouette/flat-key controls build six complete rear poses instead of three clipped strips', async ({page}, info) => {
  await page.goto('/scripts/browser/sprite-atlas-regression.html');
  await page.locator('input[type="file"]').setInputFiles('plates/blade-runner-pass3/mccoy-walk-away.png');
  await page.getByRole('checkbox',{name:'Flat key / retain dark props'}).check();
  await page.getByRole('checkbox',{name:'Separate sprite islands'}).check();
  await page.getByRole('checkbox',{name:'Preserve pose scale / align feet'}).check();
  await page.getByRole('checkbox',{name:'Reduce edge colour spill'}).check();
  const build=page.getByRole('button',{name:/build sheet \(6 sprites\)/});
  await expect(build).toBeEnabled(); await build.click();
  await expect(page.locator('[data-sheet-result]')).toContainText('asset:');
  const result=JSON.parse(await page.locator('[data-sheet-result]').innerText());
  expect(result.animations.walk.frames).toEqual([0,1,2,3,4,5]);
  expect(result.frameHeight).toBe(384);
  const inspected=await page.evaluate(async (s) => {
    const {resolveAssetReference}=await import('/src/data/mediaLibrary.ts');
    const img=new Image();img.src=(await resolveAssetReference(s.image))!;await img.decode();
    return {width:img.width,height:img.height};
  },result);
  expect(inspected).toEqual({width:result.frameWidth*6,height:result.frameHeight});
  await page.screenshot({path:info.outputPath('studio-silhouette-forge.png')});
});

test('Studio: assembling a second bank preserves existing clips and saves a portable multi-row atlas', async ({page}, info) => {
  await page.goto('/scripts/browser/sprite-atlas-regression.html');
  const before=JSON.parse(await page.locator('[data-sheet-result]').innerText());
  const controls=page.locator('[data-atlas-controls]'); await controls.locator('summary').click();
  await controls.getByRole('button',{name:/Pick an image/}).click();
  await controls.getByPlaceholder(/Filter .* images/).fill('/hd/pass3/mccoy-sheet.png');
  await controls.getByRole('button', { name: /^Mccoy Sheet.*blade-runner\/hd\/pass3/ }).click();
  await controls.getByLabel('Bank columns',{exact:true}).fill('11'); await controls.getByLabel('Bank rows',{exact:true}).fill('2');
  await controls.getByLabel('Atlas frame height',{exact:true}).fill('128');
  await controls.getByLabel('New clip name',{exact:true}).fill('walk');
  await controls.getByRole('button',{name:'Assemble atlas',exact:true}).click();
  await expect(controls.getByRole('status')).toContainText('already exists');
  expect(JSON.parse(await page.locator('[data-sheet-result]').innerText())).toEqual(before);
  await controls.getByLabel('New clip name',{exact:true}).fill('walk-up');
  await controls.getByRole('button',{name:'Assemble atlas',exact:true}).click();
  await expect(controls.getByRole('status')).toContainText('Saved 26 frames');
  const after=JSON.parse(await page.locator('[data-sheet-result]').innerText());
  expect(after.image).toMatch(/^asset:/); expect(after.animations.walk).toEqual(before.animations.walk);
  expect(after.animations['walk-up'].frames).toEqual(Array.from({length:22},(_,i)=>i+4));
  expect(after.frameHeight).toBe(128);
  await page.screenshot({path:info.outputPath('studio-multi-bank-atlas.png')});
});
