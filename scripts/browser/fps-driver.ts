import { expect, type Page } from "@playwright/test";
/** Observe the rendered world; operate ONLY real keyboard/pointer controls. No state/save injection. */
export class FpsDriver {
  constructor(readonly page: Page) {}
  async pose() {
    return this.page.locator("[data-fps-stage]").evaluate((el) => {
      const d = (el as HTMLElement).dataset;
      return {
        x: Number(d.fpsX),
        y: Number(d.fpsY),
        z: Number(d.fpsZ),
        yaw: Number(d.fpsYaw),
        pitch: Number(d.fpsPitch ?? 0),
        crouched: d.fpsCrouched === "1",
        health: Number(el.querySelector("[data-fps-health]")?.textContent ?? 0),
        actors: JSON.parse(d.fpsActors ?? "[]") as {
          id: string;
          x: number;
          y: number;
          z: number;
          hp: number;
          hidden: boolean;
          height: number;
        }[],
        doors: JSON.parse(d.fpsDoors ?? "{}") as Record<
          string,
          { open: number; target: number }
        >,
      };
    });
  }
  async start() {
    await this.page.goto("/");
    await this.page
      .getByRole("button", { name: /Duke Nukem 3D/ })
      .first()
      .click();
    const skip = this.page.getByRole("button", {
      name: "Skip title sequence",
      exact: true,
    });
    await expect(
      this.page.locator("[data-fps-stage]").or(skip).first(),
    ).toBeVisible();
    if (await skip.isVisible()) await skip.click();
    await expect(this.page.locator("[data-fps-stage]")).toHaveAttribute(
      "data-fps-ready",
      "1",
      { timeout: 25_000 },
    );
    const difficulty = this.page.getByLabel("Difficulty", { exact: true });
    if (await difficulty.isVisible()) await difficulty.selectOption("1");
    await this.page
      .getByRole("button", { name: /^(ENTER LEVEL|RESUME LEVEL)$/ })
      .click();
    await expect(this.page.locator("[data-fps-stage]")).toHaveAttribute(
      "data-fps-running",
      "1",
    );
  }
  async face(yaw: number) {
    // Right-drag look works without pointer-lock permissions in an embedded preview.
    for (let i = 0; i < 12; i++) {
      const p = await this.pose(),
        delta = Math.atan2(Math.sin(yaw - p.yaw), Math.cos(yaw - p.yaw));
      if (Math.abs(delta) < 0.008) return;
      const box = await this.page.locator(".fps-view").boundingBox();
      if (!box) throw new Error("No game viewport");
      const step =
        Math.sign(delta) * Math.min(Math.abs(delta), box.width * 0.3 * 0.0028);
      const x = box.x + box.width / 2,
        y = box.y + box.height / 2;
      await this.page.mouse.move(x, y);
      await this.page.mouse.down({ button: "right" });
      await this.page.mouse.move(x - step / 0.0028, y);
      await this.page.mouse.up({ button: "right" });
      await this.page.waitForFunction(
        (target) => {
          const d = (document.querySelector("[data-fps-stage]") as HTMLElement)
            ?.dataset;
          return Math.abs(Number(d?.fpsYaw) - target) < 0.008;
        },
        p.yaw + step,
        { timeout: 3000 },
      );
    }
    throw new Error("Unable to aim using real mouse drag");
  }
  async look(pitch: number) {
    const p = await this.pose();
    const target = Math.max(-0.8, Math.min(0.8, pitch));
    if (Math.abs(target - p.pitch) < 0.008) return;
    const box = await this.page.locator(".fps-view").boundingBox();
    if (!box) throw new Error("No game viewport");
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    await this.page.mouse.move(x, y);
    await this.page.mouse.down({ button: "right" });
    await this.page.mouse.move(x, y - (target - p.pitch) / 0.0028);
    await this.page.mouse.up({ button: "right" });
    await this.page.waitForFunction((target) => Math.abs(Number((document.querySelector("[data-fps-stage]") as HTMLElement)?.dataset.fpsPitch) - target) < 0.008,
      target, { timeout: 3000 });
  }
  async moveTo(x: number, z: number) {
    for (let i = 0; i < 50; i++) {
      const p = await this.pose(),
        distance = Math.hypot(x - p.x, z - p.z);
      if (distance < 0.24) return;
      await this.face(Math.atan2(-(x - p.x), -(z - p.z)));
      const before = await this.pose(),
        start = Math.hypot(x - before.x, z - before.z),
        travel = Math.max(0.08, Math.min(start > 2 ? 1.4 : 0.45, start - 0.15));
      if (start < 1.5) await this.page.keyboard.down("c");
      else await this.page.keyboard.down("Shift");
      await this.page.keyboard.down("w");
      try {
        await this.page.waitForFunction(
          ({ x, z, startX, startZ, travel }) => {
            const d = (document.querySelector("[data-fps-stage]") as HTMLElement)?.dataset;
            if (!d) return false;
            const px = Number(d.fpsX), pz = Number(d.fpsZ);
            // Re-steer after actual travel, including wall sliding. Waiting for
            // one shrinking target radius can miss the target indefinitely.
            return Math.hypot(px - x, pz - z) < 0.2 || Math.hypot(px - startX, pz - startZ) >= travel;
          },
          { x, z, startX: before.x, startZ: before.z, travel },
          { timeout: 5000 },
        );
      } catch (e) {
        throw new Error(
          `Movement to (${x},${z}) blocked at ${JSON.stringify((({ actors, ...p }) => p)(await this.pose()))}: ${e}`,
        );
      } finally {
        await this.page.keyboard.up("w");
        await this.page.keyboard.up("c");
        await this.page.keyboard.up("Shift");
      }
    }
    throw new Error(`Failed to reach ${x},${z}`);
  }
  async shoot(id: string) {
    for (let i = 0; i < 15; i++) {
      const p = await this.pose(),
        a = p.actors.find((a) => a.id === id);
      if (!a || a.hidden || a.hp <= 0) { await this.look(0); return; }
      if (p.health <= 0) throw new Error(`Defeated while aiming at ${id}`);
      await this.face(Math.atan2(-(a.x - p.x), -(a.z - p.z)));
      await this.look(Math.atan2(a.y + (a.height ?? 1.8) * 0.65 - p.y - (p.crouched ? 0.85 : 1.45), Math.hypot(a.x - p.x, a.z - p.z)));
      await this.page.keyboard.down("f");
      try {
        await this.page.waitForFunction(
          ({ id, hp }) => {
            const d = (
              document.querySelector("[data-fps-stage]") as HTMLElement
            )?.dataset;
            const a = JSON.parse(d?.fpsActors ?? "[]").find(
              (a: { id: string }) => a.id === id,
            );
            return !a || a.hidden || a.hp < hp;
          },
          { id, hp: a.hp },
          { timeout: 5000 },
        );
      } finally {
        await this.page.keyboard.up("f");
      }
    }
    throw new Error(`Could not defeat ${id}`);
  }
  async door(id: string) {
    if ((await this.pose()).doors[id]?.open > 0.95) return;
    await this.page.keyboard.press("e");
    await this.page.waitForFunction(
      (id) =>
        JSON.parse(
          (document.querySelector("[data-fps-stage]") as HTMLElement)?.dataset
            .fpsDoors ?? "{}",
        )[id]?.open > 0.95,
      id,
      { timeout: 5000 },
    );
  }
  /** Jump-assisted step onto a crate, ledge or platform. */
  async hop(x: number, z: number) {
    await this.face(
      Math.atan2(-(x - (await this.pose()).x), -(z - (await this.pose()).z)),
    );
    // Approach small ledges on an axis; callers line up first. Stop at the
    // observed destination rather than overshooting on a fixed-duration hold.
    await this.page.keyboard.down("w");
    await this.page.keyboard.down(" ");
    try {
      await this.page.waitForFunction(({ x, z }) => {
        const d = (document.querySelector("[data-fps-stage]") as HTMLElement)?.dataset;
        return !!d && Math.hypot(Number(d.fpsX) - x, Number(d.fpsZ) - z) < 0.24;
      }, { x, z }, { timeout: 3000 });
    } finally {
      await this.page.keyboard.up("w");
      await this.page.keyboard.up(" ");
    }
    await this.page.waitForTimeout(420);
  }
  async rooftopToStreet(beforeFight?: () => Promise<void>) {
    // The C-9 canisters are in the corner by the vent; the start faces them.
    await this.shoot("roof-c9");
    await expect(this.page.locator("[data-fps-stage]")).toHaveAttribute(
      "data-fps-removed",
      /roof-c9/,
    );
    await this.moveTo(12.5, 6);
    await this.moveTo(14.7, 6);
    await expect.poll(async () => (await this.pose()).y).toBeLessThan(0.05);
    if (beforeFight) await beforeFight();
    await this.shoot("street-trooper");
  }
  /** Street → cracked wall → foyer → lobby → shotgun room (critical path, no secrets). */
  async toLobby(beforeAlleyFight?: () => Promise<void>) {
    await this.moveTo(20, 12);
    await this.shoot("street-trooper-2");
    await this.moveTo(20, 20.5);
    if (beforeAlleyFight) await beforeAlleyFight();
    // The box-office crack requires an RPG. The ordinary first-visit route
    // uses the alley entrance instead of a pistol opening every masonry wall.
    await this.moveTo(23.5, 32);
    await this.shoot("street-pigcop");
    await this.moveTo(25.4, 41);
    await this.shoot("alley-pigcop");
    await this.moveTo(37, 41);
    await this.shoot("alley-pigcop-2");
    await this.moveTo(48, 41);
    await this.moveTo(53.5, 41);
    await this.moveTo(53.5, 40);
    await this.face(0);
    await this.door("alley-door");
    await this.moveTo(53.5, 36.5);
    await this.shoot("upper-pigcop");
    await this.moveTo(51, 34.5);
    await this.face(Math.PI / 2);
    await this.door("theatre-side-door");
    await this.moveTo(48.6, 34.5);
    await this.moveTo(46.5, 32.5);
    await this.shoot("theatre-pigcop");
    await this.shoot("theatre-trooper");
    await this.moveTo(46.5, 28.5);
    await this.moveTo(35, 28.5);
    await this.moveTo(34, 29.6); // collect the original stage armor before the lobby fight
    await this.moveTo(35, 28.5);
    await this.moveTo(37.5, 28.5);
    await this.face(0);
    await this.door("theatre-door-w");
    await this.moveTo(37.5, 26.2);
    await this.moveTo(34.5, 26.2); // actual lobby medkit, before engaging the next room
    await this.shoot("lobby-pigcop");
    await this.shoot("lobby-trooper");
    await this.moveTo(38, 26.2);
    await this.moveTo(38, 20);
    await this.moveTo(46, 16.5);
    await this.moveTo(46, 15.9);
    await this.face(0);
    await this.door("shotgun-door");
    await this.moveTo(46, 13.6);
    await expect(this.page.locator("[data-fps-ammo]")).not.toHaveText("0");
    await expect(this.page.locator(".fps-hud")).toContainText("SHOTGUN");
  }
  /** Restroom → vent → captive woman → projector room (red card) → ramp → theatre. */
  async tourCinema() {
    await this.moveTo(46, 16.5);
    await this.moveTo(49, 16);
    await this.face(-Math.PI / 2);
    await this.door("restroom-door");
    await this.moveTo(51, 16);
    await this.moveTo(54.5, 16.5);
    await this.shoot("stall-trooper");
    await this.moveTo(55.5, 16.5);
    await this.hop((await this.pose()).x, 17.9);
    await this.moveTo(56, 18); // deliberately collect the portable medkit
    await this.page.keyboard.press("m");
    await this.moveTo(56.5, 17.5); // same platform; no second jump needed
    await this.face(-Math.PI / 2);
    await this.shoot("restroom-vent");
    await this.hop(58.5, (await this.pose()).z);
    await this.moveTo(60, 17.5);
    await this.moveTo(60, 27);
    await this.moveTo(60.5, 29.5);
    await this.moveTo(58.5, 29.5);
    await this.face(Math.PI / 2);
    await this.door("woman-wall");
    await this.moveTo(56.5, 29.5);
    await this.shoot("projection-trooper");
    await this.moveTo(56.4, 31.4);
    await expect(this.page.locator(".fps-card-lights")).toHaveAttribute("aria-label", /red/);
    await this.moveTo(56, 28.5);
    await this.moveTo(51.65, 28.5); // north of the projector; east of the sealed RPG cache
    await this.moveTo(51.65, 30.6);
    await this.moveTo(51, 31);
    await this.moveTo(51, 30.6);
    await this.face(Math.PI / 2);
    await this.door("curtain");
    await this.moveTo(51.65, 30.6);
    await this.moveTo(51.65, 28.5);
    await this.moveTo(56, 28.5);
    await this.moveTo(56.5, 27.5);
    await this.moveTo(57, 26);
    await this.moveTo(54, 26);
    await this.moveTo(49, 26);
    await this.moveTo(43.5, 26);
    await this.face(Math.PI);
    await this.door("theatre-door-e");
    await this.moveTo(43.5, 29);
    await this.shoot("theatre-trooper");
    await this.moveTo(46.5, 32.5);
    await this.shoot("theatre-pigcop");
  }
  /** Theatre side door → upper room → alley → red door → C-9 → bridge → glass → exit. */
  async finish() {
    await this.moveTo(46.5, 34.5);
    await this.moveTo(48.6, 34.5);
    await this.face(-Math.PI / 2);
    await this.door("theatre-side-door");
    await this.moveTo(51, 34);
    await this.shoot("upper-pigcop");
    await this.moveTo(53.5, 36.5);
    await this.moveTo(56, 36);
    await this.moveTo(57, 36.5);
    await this.face(Math.PI);
    await this.door("red-door");
    await this.shoot("bridge-c9");
    await this.moveTo(57, 37.6);
    await this.moveTo(57, 39);
    await this.moveTo(57, 43);
    await this.shoot("exit-pane");
    await this.moveTo(57, 44.7);
    await this.face(Math.PI);
    await this.page.keyboard.press("e");
    await expect(this.page.locator('[data-scene-id="hh-end"]')).toBeVisible();
  }
}
