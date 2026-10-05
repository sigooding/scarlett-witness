import { expect, type Locator, type Page } from '@playwright/test';

/** Drive the real game controls, never React state or a forged save. Data
 * attributes below are observation-only; failures print the live scene. */
export class AdventureDriver {
  constructor(readonly page: Page) {}

  async fromNewsstand(title = 'Black-Mass Bride') {
    await this.page.goto('/');
    await this.page.getByRole('button', { name: new RegExp(title) }).first().click();
    await this.page.getByRole('button', { name: 'Skip title sequence', exact: true }).click();
    await this.scene('dream');
  }

  async scene(id: string) {
    await expect(this.page.locator(`[data-scene-id="bmb_${id}"]`)).toBeVisible({ timeout: 15_000 });
  }

  async advanceTo(target: Locator) {
    let readyLastTick = false;
    for (let i = 0; i < 90; i++) {
      // A scene change can expose the destination's choices for one render
      // before its entry effect resets prose/beat cursors. Do not stop on
      // that transient frame, or wait inside isEnabled for a vanished node.
      // Inspect visible DOM atomically; this never touches game state.
      const ready = await target.evaluateAll((nodes) => nodes.some((node) =>
        node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden' &&
        !node.matches(':disabled') && node.getAttribute('aria-disabled') !== 'true'));
      const transitioning = await this.page.locator('[data-transitioning="1"]').count() > 0;
      if (ready && !transitioning) {
        if (readyLastTick) return;
        readyLastTick = true;
        await this.page.waitForTimeout(100);
        continue;
      }
      readyLastTick = false;
      if (transitioning) { await this.page.waitForTimeout(100); continue; }
      const next = this.page.locator('button').filter({
        hasText: /^(?:▸ )?(?:continue to|Continue$|continue$|Start \/ Resume Case)/i,
      }).first();
      if (await next.isVisible()) await next.click();
      else {
        // Blur only the old UI focus: Space on a focused button activates it
        // instead of advancing text. This never reads/writes game progress.
        await this.page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
        await this.page.keyboard.press('Space');
      }
      await this.page.waitForTimeout(100);
    }
    throw new Error(`Could not advance to ${target}; scene=${await this.page.locator('[data-scene-id]').getAttribute('data-scene-id')}\n${(await this.page.locator('body').innerText()).slice(-4500)}`);
  }

  async choose(name: RegExp) {
    const choice = this.page.getByRole('menuitem', { name }).first();
    await this.advanceTo(choice);
    await expect(choice).toBeEnabled();
    // Black-Mass Bride's choices all navigate. Wait for that observed scene
    // change rather than typing into the outgoing scene during its dissolve.
    const from = await this.page.locator('[data-scene-id]').getAttribute('data-scene-id');
    await choice.click();
    await expect(this.page.locator('[data-scene-id]')).not.toHaveAttribute('data-scene-id', from!);
  }

  async marker(name: string, verb: 'Pick up' | 'Go to' | 'Use' | 'Talk to' | 'Look at', outcome: { scene?: string; gone?: boolean; text?: string | RegExp; label?: string } = {}) {
    const marker = this.page.getByRole('button', { name, exact: true });
    await expect(marker).toBeEnabled({ timeout: 15_000 });
    await marker.click();
    await this.page.getByRole('button', { name: verb, exact: true }).click();
    if (outcome.scene) await this.scene(outcome.scene);
    else if (outcome.label) await expect(this.page.getByRole('button', { name: outcome.label, exact: true })).toBeVisible({ timeout: 15_000 });
    else if (outcome.gone) await expect(marker).toBeHidden({ timeout: 15_000 });
    if (outcome.text) await expect(this.page.locator('[data-stage-caption]')).toContainText(outcome.text, { timeout: 15_000 });
  }

  async toLibrary() {
    await this.choose(/Answer the telephone/);
    await this.choose(/Tell Victoria about the dream/);
    await this.scene('library');
  }

  async investigateToPhone(thorough = false) {
    await this.toLibrary();
    await this.marker('House plan', 'Pick up', { gone: true, text: /garden passage behind the chamber/ });
    if (thorough) {
      await this.marker('Maintenance tray', 'Pick up', { gone: true });
      await this.marker('Test the service bell', 'Use', { text: /kitchen/ });
      await this.marker('Telephone Arthur', 'Talk to');
      const door = this.page.getByRole('button', { name: 'The black door', exact: true });
      await expect(door).toBeDisabled({ timeout: 15_000 });
      await this.advanceTo(door);
    }
    await this.marker('The black door', 'Go to', { scene: 'chamber' });
    await this.marker('Garden-side drapes', 'Look at', { text: /garden soil/ });
    if (thorough) {
      await this.marker('Work glove on cabinet', 'Pick up', { gone: true });
      await this.page.getByRole('button', { name: /Combine/, exact: false }).first().click();
      const book = this.page.getByRole('dialog', { name: "Jay's casebook" });
      await expect(book).toBeVisible();
      await book.getByRole('button', { name: 'Loose bell wire', exact: true }).click();
      await book.getByRole('button', { name: 'Work glove', exact: true }).click();
      await expect(book.getByRole('button', { name: 'Padded hook', exact: true })).toBeVisible();
      await book.getByRole('button', { name: /Close/ }).click();
    }
    await this.marker('Back to the library', 'Go to', { scene: 'library' });
    await this.marker('Leave for the office', 'Go to', { scene: 'office_intro' });
    await this.choose(/Preserve the evidence/);
    await this.marker('Marked envelope', 'Pick up', { gone: true });
    if (thorough) {
      await this.marker('Afternoon newspaper', 'Pick up', { gone: true });
      await this.marker("Pat's service roster", 'Pick up', { gone: true });
    }
    await this.marker("Meet O'Leary", 'Go to', { scene: 'oleary' });
    await this.choose(thorough ? /Tell him about Victoria/ : /Say only that Lorna/);
    await this.choose(/Search the service courtyard/);
    await this.marker('Scarf under the truck tarp', 'Pick up', { gone: true });
    if (thorough) await this.marker('Potting-shed ledger', 'Pick up', { gone: true });
    await this.marker('Question the gardener', 'Talk to', { scene: 'peters' });
    if (thorough) {
      const challenge = this.page.getByRole('button', { name: /Present evidence|Challenge|Press them/i }).first();
      await this.advanceTo(challenge);
      await challenge.click();
      await this.page.getByRole('dialog', { name: /present your evidence/i }).getByRole('button', { name: /Victoria's scarf/ }).click();
    }
    await this.choose(/Let him talk/);
    await this.marker('Telephone the office', 'Go to', { scene: 'phone' });
  }

  async toApartment(wrongLine = false, exhausted = false) {
    await this.choose(wrongLine ? /Pat, it's Jay/ : /Play along/);
    if (wrongLine) await this.choose(/Take the long way/);
    await this.choose(exhausted ? /Sit down for a minute/ : /Check the apartment together/);
    if (exhausted) await this.choose(/Get up. Check the radio/);
    await this.scene('apartment');
  }

  async radioAndEscape() {
    await this.marker('Record the radio bulletin', 'Use', { gone: true, text: /planted/ });
    await this.marker('Leave by the fire escape', 'Go to', { scene: 'return' });
    await this.choose(/The ashes are my job/);
  }
}
