import { expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

/** Inspect the actual downloadable artifact, not a potentially truncated UI
 * preview. This also proves that Save/Export produced a usable full file. */
export async function exportedReelJson(page: Page): Promise<string> {
  const dialog = page.getByRole('dialog', { name: 'Export reel', exact: true });
  await expect(dialog).toBeVisible({ timeout: 45_000 });
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: '⇩ Download .reel.json', exact: true }).click(),
  ]);
  expect(await download.failure()).toBeNull();
  const file = await download.path();
  expect(file).toBeTruthy();
  return readFile(file!, 'utf8');
}
