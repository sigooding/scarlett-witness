import { exportedReelJson } from "./export-driver";
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { BLACK_MASS_BRIDE } from '../../src/data/blackMassBride';
import { collectStoryAssetIds } from '../../src/data/mediaLibrary';
import { visitStoryMediaFields } from '../../src/data/storyMedia';
import type { Story } from '../../src/types';
import { AdventureDriver } from './adventure-driver';

const authoredLine = 'I could not see a face. Only the divided shape of a hoof, lowering like a seal onto an unwritten page.';
function mediaByName(story: Story) {
  const copy: Story = JSON.parse(JSON.stringify(story));
  visitStoryMediaFields(copy, ({ value, set }) => {
    const prefix = value.startsWith('mp3:') ? 'mp3:' : value.startsWith('video:') ? 'video:' : '';
    const raw = value.slice(prefix.length);
    const name = raw.startsWith('asset:') ? copy.assets?.find((a) => a.id === raw.slice(6))?.name : raw.split('/').pop();
    set(prefix + name);
  });
  delete copy.assets;
  return copy;
}

const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const found: string[] = []; errors.set(page, found);
  page.on('pageerror', (e) => found.push(e.message));
  page.on('console', (m) => {
    if (/error|warning/.test(m.type()) && /children with the same key|validateDOMNesting|maximum update depth|React Flow|React Hook/i.test(m.text())) found.push(m.text());
  });
});
test.afterEach(async ({ page }) => { expect(errors.get(page), 'No runtime, React or graph errors').toEqual([]); });

async function fittedRoom(page: Page) {
  const plate = await page.locator('[data-room-plate]').boundingBox();
  const stage = await page.locator('[data-room-stage]').boundingBox();
  expect(plate).not.toBeNull(); expect(stage).not.toBeNull();
  expect(plate!.width / plate!.height).toBeCloseTo(1345 / 742, 2);
  for (const k of ['x', 'y', 'width', 'height'] as const) expect(stage![k]).toBeCloseTo(plate![k], 0);
  expect(plate!.width).toBeGreaterThan(300);
  await expect(page.locator('[data-room-plate] .cin-dim')).toHaveCount(0);
}

async function finishGold(d: AdventureDriver, info: TestInfo) {
  const page = d.page;
  await d.investigateToPhone(true);
  await d.toApartment();
  await fittedRoom(page);
  await page.screenshot({ path: info.outputPath('apartment.png') });
  await d.marker('Record the radio bulletin', 'Use', { gone: true, text: /planted/ });
  await d.marker("Secure Pat's door", 'Use', { label: 'Pat has a safe place' });
  await d.marker("Telephone O'Leary", 'Use', { label: 'Backup is on its way' });
  await d.marker("Examine Pat's archive", 'Use');
  const puzzle = page.getByRole('dialog', { name: 'A name beneath the dust' });
  await expect(puzzle).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await puzzle.getByRole('button', { name: /Anonymous letter/ }).click();
  await puzzle.getByRole('button', { name: /Hotel register/ }).click();
  await puzzle.getByRole('button', { name: 'Flag pattern', exact: true }).click();
  await expect(puzzle).toContainText('You can retry without penalty.');
  await expect(puzzle.getByText('0 / 2 flagged', { exact: true })).toBeVisible();
  const record = puzzle.getByRole('button', { name: /Building register/ });
  // The puzzle's evidence must wrap, not hide the surname after an ellipsis.
  const desc = record.locator('span').filter({ hasText: /^Building register/ });
  expect(await desc.evaluate((el) => getComputedStyle(el).whiteSpace)).toBe('normal');
  expect(await desc.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  await page.screenshot({ path: info.outputPath('archive-mobile.png') });
  await record.click();
  await puzzle.getByRole('button', { name: /Inquest — Ruth Peters/ }).click();
  await puzzle.getByRole('button', { name: 'Flag pattern', exact: true }).click();
  await expect(puzzle).toBeHidden();
  await expect(page.getByRole('button', { name: 'Review the archive finding', exact: true })).toBeVisible();
  await page.keyboard.press('b');
  const board = page.getByRole('dialog', { name: 'Deduction Corkboard — pin the truth' });
  await expect(board).toBeVisible();
  await expect(page.getByRole('button', { name: 'Dismiss examination result', exact: true })).toBeHidden();
  await board.getByRole('button', { name: "Pat's archive", exact: true }).press('Enter');
  await expect(board.getByRole('button', { name: "Pat's archive", exact: true })).toHaveAttribute('aria-pressed', 'true');
  await board.getByRole('button', { name: 'Mr. Peters', exact: true }).press('Enter');
  await expect(board.getByText(/E. P. was Elias Peters/)).toBeVisible();
  // A second valid link exercises tap/click wiring, including scroll offsets.
  await board.getByRole('button', { name: "Victoria's scarf", exact: true }).click();
  await board.getByRole('button', { name: 'Mr. Peters', exact: true }).click();
  await expect(board.getByText('67%', { exact: true })).toBeVisible();
  const bounds = await board.boundingBox();
  expect(bounds!.y).toBeGreaterThanOrEqual(0); expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
  await page.screenshot({ path: info.outputPath('deduction-mobile.png') });
  await board.getByRole('button', { name: 'Close dialog', exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 960 });
  await d.marker('Leave by the fire escape', 'Go to', { scene: 'return' });
  await d.choose(/O'Leary sent you/);
  await d.choose(/Follow the house plan/);
  await d.choose(/State the case/);
  await d.choose(/Reach the service-bell pull/);
  await d.choose(/Put every name/);
  await d.scene('gold');
  const headline = page.getByText('NO DEVIL BUT A HUMAN ONE', { exact: true });
  await expect(headline).toBeHidden();
  await d.advanceTo(page.getByText(/We would heal\. We would marry when we were ready/, { exact: false }).filter({ visible: true }));
  await expect(headline).toBeHidden();
  await page.screenshot({ path: info.outputPath('epilogue.png') });
  await d.advanceTo(headline);
  await page.screenshot({ path: info.outputPath('gold-ending.png') });
}

test('Black-Mass Bride: built-in newsstand to gold, crafting, lie, retry and mobile deductions', async ({ page }, info) => {
  test.setTimeout(240_000);
  const d = new AdventureDriver(page);
  await d.fromNewsstand();
  await finishGold(d, info);
});

test('Black-Mass Bride: Studio edit → Check → portable export/import → Publish → newsstand gold', async ({ page }, info) => {
  test.setTimeout(300_000);
  await page.goto('/');
  await page.getByRole('button', { name: /studio/i }).first().click();
  const initial = structuredClone(BLACK_MASS_BRIDE);
  initial.scenes.find((s) => s.id === 'bmb_dream')!.dialogueBeats![0].text = 'A shadow waits for a better sentence.';
  delete initial.scenes.find((s) => s.id === 'bmb_library')!.stage!.plateAspectRatio;
  const upload = page.getByLabel('Import reel file', { exact: true });
  await upload.setInputFiles({ name: 'black-mass-bride-draft.reel.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(initial)) });
  await expect(page.getByText('Opened "Black-Mass Bride" with 0 asset(s).', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Story title', exact: true })).toHaveValue('Black-Mass Bride');
  await page.getByRole('searchbox', { name: 'Search scenes' }).fill('');
  // Author the new framing control in the actual Stage inspector, too.
  await page.getByRole('combobox', { name: 'Jump to scene' }).selectOption('bmb_library');
  await page.getByRole('tab', { name: '🚶 Stage', exact: true }).click();
  const ratio = page.getByRole('spinbutton', { name: 'Room aspect ratio', exact: true });
  await expect(ratio).toBeVisible();
  await ratio.fill(String(1345 / 742));
  await page.getByRole('combobox', { name: 'Jump to scene' }).selectOption('bmb_dream');
  await page.getByRole('tab', { name: 'Beats', exact: true }).click();
  await page.getByRole('button', { name: /^💬 Beat 1/ }).click();
  await page.getByRole('textbox', { name: 'Line for beat bmb_dream1', exact: true }).fill(authoredLine);
  // Real immediate export while the editor still owns focus.
  await page.keyboard.press('Control+s');
  const dialog = page.getByRole('dialog', { name: 'Export reel' });
  await expect(dialog).toBeVisible({ timeout: 45_000 });
  const json = await exportedReelJson(page);
  const reel = JSON.parse(json);
  expect(reel.scenes.find((s: { id: string }) => s.id === 'bmb_dream').dialogueBeats[0].text).toBe(authoredLine);
  expect(reel.scenes.find((s: { id: string }) => s.id === 'bmb_library').stage.plateAspectRatio).toBeCloseTo(1345 / 742, 10);
  expect(reel.assets.length).toBe(31);
  expect(mediaByName(reel)).toEqual(mediaByName(BLACK_MASS_BRIDE));
  expect([...collectStoryAssetIds(reel)].every((id) => reel.assets.some((a: { id: string }) => a.id === id))).toBe(true);
  expect(reel.assets.every((a: { dataUrl: string; fileUrl?: string }) => a.dataUrl.startsWith('data:') && !a.fileUrl)).toBe(true);
  await writeFile(info.outputPath('black-mass-bride.reel.json'), json);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await upload.setInputFiles({ name: 'black-mass-bride.reel.json', mimeType: 'application/json', buffer: Buffer.from(json) });
  await expect(page.getByText(`Opened "Black-Mass Bride" with ${reel.assets.length} asset(s).`, { exact: true })).toBeVisible({ timeout: 30_000 });
  const check = page.getByRole('button', { name: '✔ Check', exact: true });
  if (await check.getAttribute('aria-expanded') === 'true') await check.click();
  await check.click();
  await expect(page.getByText(/Continuity Department — spotless reel/)).toBeVisible();
  await page.screenshot({ path: info.outputPath('studio-checked.png') });
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await expect(page.getByText('Published. The newsstand now uses this version.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Leave Studio', exact: true }).click();
  // Disable the original public files. The imported copy must render from
  // its bundled media, not accidentally lean on this machine's asset paths.
  const escaped: string[] = [];
  await page.route(/\/(?:img|audio)\/black-mass-bride\//, async (route) => { escaped.push(route.request().url()); await route.abort(); });
  const d = new AdventureDriver(page);
  await d.fromNewsstand();
  await finishGold(d, info);
  expect(escaped, 'Published portable reel never requests the original art/audio directory').toEqual([]);
});

test('Black-Mass Bride: wrong code and exhaustion recover to silver without optional preparations', async ({ page }, info) => {
  test.setTimeout(180_000);
  const d = new AdventureDriver(page); await d.fromNewsstand();
  await d.investigateToPhone(); await d.toApartment(true, true); await d.radioAndEscape();
  await d.choose(/Open the black door from the library/); await d.choose(/Look at who is still standing/);
  await d.choose(/Forget the argument/); await d.choose(/Kick the shovel/);
  const gold = page.getByRole('menuitem', { name: /Put every name/ });
  await d.advanceTo(page.getByRole('menuitem', { name: /Get Victoria into the morning/ }));
  await expect(gold).toBeDisabled();
  await d.choose(/Get Victoria into the morning/); await d.scene('silver');
  await d.advanceTo(page.getByText('THE LIVING COME FIRST', { exact: true }));
  await page.screenshot({ path: info.outputPath('silver-ending.png') });
});

test('Black-Mass Bride: surrender from a newsstand start reaches the framed ending', async ({ page }, info) => {
  test.setTimeout(180_000);
  const d = new AdventureDriver(page); await d.fromNewsstand(); await d.investigateToPhone();
  await d.choose(/Go to the police now/); await d.scene('framed');
  await d.advanceTo(page.getByText('A CASE TOO NEAT', { exact: true }));
  await page.screenshot({ path: info.outputPath('framed-ending.png') });
});

test('Black-Mass Bride: explicitly reckless confrontation reaches caught ending', async ({ page }, info) => {
  test.setTimeout(180_000);
  const d = new AdventureDriver(page); await d.fromNewsstand(); await d.investigateToPhone();
  await d.toApartment(); await d.radioAndEscape(); await d.choose(/Follow the house plan/);
  await d.choose(/Rush Peters/); await d.scene('caught');
  await d.advanceTo(page.getByText('THE DOOR STAYS SHUT', { exact: true }));
  await page.screenshot({ path: info.outputPath('caught-ending.png') });
});

test('Black-Mass Bride: fitted room, authored pickup description, and real decision rewind', async ({ page }, info) => {
  const d = new AdventureDriver(page); await d.fromNewsstand(); await d.toLibrary();
  await fittedRoom(page);
  await page.keyboard.press('h');
  await expect(page.getByText('🔍 Hotspots', { exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('library-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 }); await fittedRoom(page);
  const plan = page.getByRole('button', { name: 'House plan', exact: true });
  await expect(plan.locator('.stage-marker-index')).toBeVisible();
  await expect(plan.locator('.stage-marker-label')).toBeHidden();
  await page.screenshot({ path: info.outputPath('library-mobile.png') });
  // Object-first keyboard activation must work too; no pointerdown is fired
  // by Enter. An edge object's verb menu must stay wholly on screen.
  await page.getByRole('button', { name: 'Telephone Arthur', exact: true }).press('Enter');
  const menu = page.locator('[data-stage-object-menu]');
  await expect(menu.getByText('Telephone Arthur', { exact: true })).toBeVisible();
  const bounds = await menu.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  await page.screenshot({ path: info.outputPath('edge-menu-mobile.png') });
  await plan.press('Enter');
  await page.getByRole('button', { name: 'Pick up', exact: true }).click();
  await expect(plan).toBeHidden({ timeout: 15_000 });
  await expect(page.locator('[data-stage-caption]')).toContainText(/garden passage behind the chamber/);
  await page.getByRole('button', { name: /Rewind/ }).click();
  await expect(page.getByRole('button', { name: 'House plan', exact: true })).toBeVisible();
  await d.marker('House plan', 'Pick up', { gone: true });
});
