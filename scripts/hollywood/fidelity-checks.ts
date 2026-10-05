import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { FpsWorld, doorBlocksAt, doorSlab, floorAt, tileAt } from "../../src/game/fps/simulation";
import { detailQuads, mapQuads, tileFloor } from "../../src/game/fps/geometry";
import { inventoryActive, inventoryAmount } from "../../src/game/fps/inventory";
import { createFpsRoom } from "../../src/game/fps/presets";
import { hollywoodRoom } from "../../src/data/hollywoodOpening";
import { validateFpsRoom } from "../../src/game/fps/validate";
import type { FpsInput } from "../../src/game/fps/types";

export function runFidelityChecks(check: (name: string, test: () => void) => void) {
  const empty = () => { const q = createFpsRoom(); q.fps!.entities = []; return q; };
  const tick = (w: FpsWorld, n = 60, input: FpsInput = {}) => { for (let i = 0; i < n; i++) w.tick(1 / 60, input); };
  const gear = (w: FpsWorld, ...ids: string[]) => {
    w.state.player.inventory = ids;
    w.state.player.inventoryAmounts = Object.fromEntries(ids.map((id) => [id, id === "pipebombs" ? 5 : 100]));
  };
  check("continuous slopes use identical corner heights in collision and the mesher", () => {
    const q = empty();
    q.map[6] = "#..a.....#";
    q.fps!.tiles.a = { name: "Ramp", floor: 0.3, slope: { z: -0.3 }, floorMaterial: "concrete" };
    const w = new FpsWorld(q);
    const ys: number[] = [];
    for (let i = 0; i < 20; i++) { w.tick(1 / 60, { forward: 1 }); ys.push(w.state.player.y); }
    assert(ys.some((y) => y > 0.01 && y < 0.29));
    assert(Math.abs(floorAt(q, 3.5, 6.5) - 0.15) < 0.000001);
    assert.equal(tileFloor(q.fps!.tiles.a, 0, 1), 0);
    const quads = mapQuads(10, 10, (x, z) => tileAt(q, x, z));
    assert(quads.some((f) => f.vertices.some(([x, y, z]) => x === 3 && z === 6 && y === 0.3)));
  });
  check("interior walls belong to their room and mismatched ceilings get soffits", () => {
    const tiles = [
      { name: "Wall", solid: true, wallHeight: 10, wallMaterial: "facade" },
      { name: "Room", floor: 0, ceiling: 4, wallMaterial: "lobby", light: 0.6 },
    ];
    const quads = mapQuads(2, 1, (x) => tiles[x === 1 ? 1 : 0]);
    assert(quads.some((f) => f.material === "lobby" && f.vertices.every(([x]) => x === 1) && Math.max(...f.vertices.map((v) => v[1])) === 4));
    const portal = mapQuads(2, 1, (x) => x === 0 ? tiles[1] : { name: "Outside", ceiling: null, floor: 0, wallMaterial: "facade" });
    assert(portal.some((f) => f.vertices.every(([x]) => x === 1) && Math.min(...f.vertices.map((v) => v[1])) === 4));
  });
  check("architecture has sloped tops, collidable sides, support and an underside", () => {
    const q = empty();
    const detail = { id: "canopy", x: 3.5, z: 6, width: 2, depth: 2, bottom: 2.5, height: 0.3, slope: { x: 0.2 }, material: "concrete", solid: true };
    q.fps!.details = [detail];
    const w = new FpsWorld(q);
    assert(w.canStand(3.5, 6, 0));
    assert(w.blocked(3.5, 2.7, 6));
    assert(w.canStand(3.5, 6, 3.1));
    assert.equal(detailQuads(detail).length, 6);
    w.state.player.z = 6; gear(w, "jetpack");
    tick(w, 1, { inventory: "jetpack" }); tick(w, 100, { jump: true });
    assert(w.state.player.y <= 0.851, "jetpack stops under the canopy");
  });
  check("finite ceiling slabs allow a roof and room at the same X/Z", () => {
    const q = empty(); q.map[7] = "#..a.....#";
    q.fps!.tiles.a = { name: "Room and roof", floor: 0, ceiling: 3, roof: 3.3 };
    const w = new FpsWorld(q);
    assert(w.canStand(3.5, 7.5, 0));
    assert(w.blocked(3.5, 3.15, 7.5));
    assert(w.canStand(3.5, 7.5, 3.3));
    w.state.player.y = 4; tick(w, 60);
    assert.equal(w.state.player.y, 3.3);
  });
  check("split-door apertures agree for bullets and player collision", () => {
    const q = empty(); const d = { id: "split", name: "Curtains", x: 3.5, z: 6, width: 2, height: 2.4, axis: "x" as const, motion: "split" as const };
    q.fps!.doors = [d]; const w = new FpsWorld(q); w.state.doors.split.open = 0.5;
    assert(!doorBlocksAt(d, 0.5, 3.5, 6));
    assert(w.canStand(3.5, 6, 0));
    assert(w.blocked(4.3, 1, 6));
    assert(!w.canStand(3.9, 6, 0), "capsule cannot overlap a half-open panel");
    assert.equal(doorSlab(q, { ...d, motion: "raise" }, 1).lo, 2.4);
  });
  check("a cracked wall rejects pistol damage but responds to an explosive", () => {
    const q = empty(); q.fps!.sprites.push({ id: "crack", name: "Crack", kind: "breakable", health: 1, width: 1, height: 2, damageType: "explosive" });
    q.fps!.entities = [{ id: "crack", sprite: "crack", x: 3.5, z: 4 }];
    q.fps!.weapons[0].splash = undefined;
    let w = new FpsWorld(q); tick(w, 1, { fire: true }); assert.equal(w.state.actors[0].hp, 1);
    q.fps!.weapons[0].splash = 3; w = new FpsWorld(q); tick(w, 1, { fire: true }); assert.equal(w.state.actors[0].hp, 0);
  });
  check("jetpack toggles once per press, hovers, descends and spends saved fuel", () => {
    const w = new FpsWorld(empty()); gear(w, "jetpack");
    tick(w, 30, { inventory: "jetpack", jump: true });
    assert(inventoryActive(w.state.player, "jetpack")); assert(w.state.player.y > 1.5);
    const y = w.state.player.y; tick(w, 30); assert.equal(w.state.player.y, y);
    const charge = inventoryAmount(w.state.player, "jetpack"); assert(charge < 100);
    const r = new FpsWorld(w.room, JSON.parse(JSON.stringify(w.snapshot())));
    assert.equal(inventoryAmount(r.state.player, "jetpack"), charge); assert(inventoryActive(r.state.player, "jetpack"));
    tick(r, 20, { crouch: true }); assert(r.state.player.y < y);
    tick(r, 1, { inventory: "jetpack" }); assert(!inventoryActive(r.state.player, "jetpack"));
  });
  check("empty fuel falls normally; steroids speed is temporary and does not tunnel", () => {
    const a = new FpsWorld(empty()), b = new FpsWorld(empty()); gear(a, "steroids");
    tick(a, 1, { inventory: "steroids" }); tick(a, 30, { forward: 1 }); tick(b, 30, { forward: 1 });
    assert(a.state.player.z < b.state.player.z);
    a.state.player.inventoryAmounts!.steroids = 0.01; tick(a, 1); assert(!inventoryActive(a.state.player, "steroids"));
    gear(a, "jetpack"); a.state.player.y = 3; a.state.player.inventoryAmounts!.jetpack = 0.01;
    tick(a, 100, { inventory: "jetpack" }); assert.equal(a.state.player.y, 0);
  });
  check("portable medkit heals only missing health and preserves unused charge", () => {
    const w = new FpsWorld(empty()); gear(w, "medkit"); w.state.player.health = 64;
    tick(w, 1, { inventory: "medkit" }); assert.equal(w.state.player.health, 100); assert.equal(inventoryAmount(w.state.player, "medkit"), 64);
    tick(w, 1); tick(w, 1, { inventory: "medkit" }); assert.equal(inventoryAmount(w.state.player, "medkit"), 64);
  });
  check("old name-only inventory saves migrate without losing custom items", () => {
    const w = new FpsWorld(empty()); w.state.player.inventory = ["jetpack", "author-token"]; delete w.state.player.inventoryAmounts;
    const restored = new FpsWorld(w.room, JSON.parse(JSON.stringify(w.snapshot())));
    assert.equal(inventoryAmount(restored.state.player, "jetpack"), 100); assert(restored.state.player.inventory!.includes("author-token"));
    assert.deepEqual(restored.state.player.activeInventory, []);
  });
  check("night vision and Holoduke have charge; the decoy distracts a visible guard", () => {
    const q = empty(); q.fps!.entities = [{ id: "guard", sprite: "trooper", x: 3.5, z: 3.5 }];
    const w = new FpsWorld(q); gear(w, "nightvision", "holoduke");
    tick(w, 1, { inventory: "nightvision" }); tick(w, 1); tick(w, 1, { inventory: "holoduke" });
    const hp = w.state.player.health; tick(w, 100);
    assert(inventoryActive(w.state.player, "nightvision")); assert(w.state.player.holoduke);
    assert.equal(w.state.player.health, hp);
    assert(inventoryAmount(w.state.player, "holoduke") < 100);
  });
  check("pipe bombs throw once, persist in saves, detonate and consume ammunition", () => {
    const w = new FpsWorld(empty()); gear(w, "pipebombs");
    tick(w, 30, { throwBomb: true }); assert.equal(w.state.pipebombs!.length, 1); assert.equal(inventoryAmount(w.state.player, "pipebombs"), 4);
    const r = new FpsWorld(w.room, JSON.parse(JSON.stringify(w.snapshot())));
    assert.equal(r.state.pipebombs!.length, 1); tick(r, 1, { detonate: true });
    assert.equal(r.state.pipebombs!.length, 0); assert(r.events.some((e) => e.type === "explosion"));
  });
  check("the mighty foot hits nearby actors without consuming pistol ammo", () => {
    const q = empty(); q.fps!.entities = [{ id: "guard", sprite: "trooper", x: 3.5, z: 6.2 }];
    const w = new FpsWorld(q); tick(w, 1, { quickKick: true });
    assert.equal(w.state.player.ammo.pistol, 60); assert(w.state.actors[0].hp < 60); assert(w.events.some((e) => e.type === "kick"));
  });
  check("vertical secrets cannot be collected by flying far above them", () => {
    const q = empty(); q.fps!.zones = [{ id: "secret", name: "Secret", x: 3, z: 7, w: 1, d: 1, bottom: 0, top: 2, secret: true }];
    const w = new FpsWorld(q); w.state.player.y = 8; gear(w, "jetpack"); tick(w, 1, { inventory: "jetpack" });
    assert.equal(w.state.secrets.length, 0); w.state.player.y = 0; tick(w, 1); assert.equal(w.state.secrets.length, 1);
  });
  check("ammo caps leave full pickups in the world and survive save restoration", () => {
    const q = empty(); q.fps!.weapons[0].maxAmmo = 60; q.fps!.entities = [{ id: "ammo", sprite: "pistol-ammo", x: 3.5, z: 7.5 }];
    const w = new FpsWorld(q); tick(w, 1); assert(!w.state.actors[0].hidden);
    w.state.player.ammo.pistol = 48; tick(w, 1); assert.equal(w.state.player.ammo.pistol, 60); assert(w.state.actors[0].hidden);
  });
  check("Check catches bad slopes, geometry, attachment IDs and equipment settings", () => {
    const q = empty(); q.fps!.tiles["."].slope = { x: NaN }; q.fps!.tiles["."].roof = -4;
    q.fps!.details = [{ id: "bad", x: 3, z: 3, bottom: 0, width: -2, depth: 1, height: 1, material: "missing" }];
    q.fps!.weapons[0].slot = 3.2; q.fps!.entities = [{ id: "bad", sprite: "medkit", x: 3, z: 3, attachedTo: "missing" }];
    assert(validateFpsRoom(q).filter((i) => i.severity === "error").length >= 6);
  });
  check("trooper bolts are dodgeable projectiles, stop at cover and survive a save", () => {
    const q = empty(); q.fps!.sprites.find((s) => s.id === "trooper")!.attack = "projectile";
    q.fps!.sprites.find((s) => s.id === "trooper")!.speed = 0;
    q.fps!.entities = [{ id: "guard", sprite: "trooper", x: 3.5, z: 3.5 }];
    const w = new FpsWorld(q); tick(w, 61);
    assert(w.state.projectiles!.length > 0); assert.equal(w.state.player.health, 100, "not an instantaneous hitscan hit");
    const saved = new FpsWorld(q, JSON.parse(JSON.stringify(w.snapshot())));
    assert.equal(saved.state.projectiles!.length, w.state.projectiles!.length);
    tick(w, 35, { right: 1 }); assert.equal(w.state.player.health, 100, "strafing dodges the aimed bolt");
    // An authored slab between an in-flight projectile and the player stops it.
    q.fps!.details = [{ id: "cover", x: 3.5, z: 5.5, width: 2, depth: 0.2, height: 2, bottom: 0, material: "concrete", solid: true }];
    const covered = new FpsWorld(q, saved.snapshot());
    tick(covered, 60); assert.equal(covered.state.player.health, 100);
  });
  check("shot hydrants remain usable and heal a point without exceeding 100", () => {
    const q = empty(); const hydrant = q.fps!.sprites.find((s) => s.id === "hydrant")!;
    Object.assign(hydrant, { kind: "breakable", health: 1, height: 1.8, use: "water", brokenImage: "/img/hollywood-opening/hydrant-broken-v6.png" });
    q.fps!.entities = [{ id: "hydrant", sprite: "hydrant", x: 3.5, z: 6 }];
    const w = new FpsWorld(q); tick(w, 1, { fire: true });
    assert.equal(w.state.actors[0].hp, 0); assert(!w.state.actors[0].hidden);
    w.state.player.health = 99; tick(w, 1, { use: true }); assert.equal(w.state.player.health, 100);
    tick(w, 60); tick(w, 1, { use: true }); assert.equal(w.state.player.health, 100);
  });
  check("the arcade cabinet opens its physical, uncounted Holoduke cache", () => {
    const q = hollywoodRoom(); q.fps!.entities = q.fps!.entities.filter((e) =>
      ["duke-arcade", "holoduke"].includes(e.sprite));
    q.fps!.spawn = { x: 34.1, z: 22.5, yaw: Math.PI / 2 };
    const w = new FpsWorld(q); tick(w, 1, { use: true });
    assert.equal(w.state.doors["arcade-cache"].target, 1);
    assert.equal(w.state.secrets.length, 0);
    // Stand at the opened cache and jump onto its shelf using real movement.
    const p = w.state.player; p.x = 34; p.z = 24.35; p.yaw = Math.PI;
    tick(w, 60); tick(w, 1, { jump: true }); tick(w, 16, { forward: 1 }); tick(w, 25);
    assert(w.state.player.inventory!.includes("holoduke"));
  });
  check("classic difficulty changes incoming damage and persists without changing the starter", () => {
    const q = empty(); q.fps!.presentation = "classic";
    q.fps!.entities = [{ id: "guard", sprite: "trooper", x: 3.5, z: 4 }];
    q.fps!.defaultSkill = 1; const easy = new FpsWorld(q);
    q.fps!.defaultSkill = 3; const hard = new FpsWorld(q);
    tick(easy, 180); tick(hard, 180);
    assert(easy.state.player.health > hard.state.player.health);
    assert.equal(new FpsWorld(q, easy.snapshot()).state.skill, 1);
    assert.equal(new FpsWorld(empty()).state.skill, 2);
  });
  check("jump height and the restroom ledge work at both 20fps and 60fps", () => {
    const heights: number[] = [];
    for (const dt of [0.05, 1 / 60]) {
      const w = new FpsWorld(empty()); let high = 0;
      for (let i = 0; i < Math.ceil(1 / dt); i++) { w.tick(dt, { jump: i === 0 }); high = Math.max(high, w.state.player.y); }
      heights.push(high); assert(high > 1.15);
      const q = hollywoodRoom(); q.fps!.entities = []; q.fps!.spawn = { x: 55.5, z: 16.5, yaw: Math.atan2(-0.4, -1.4) };
      const ledge = new FpsWorld(q);
      for (let i = 0; i < Math.ceil(1 / dt); i++) ledge.tick(dt, { jump: i === 0, forward: Math.hypot(ledge.state.player.x - 55.9, ledge.state.player.z - 17.9) > 0.2 ? 1 : 0 });
      assert.equal(ledge.state.player.y, 1.4, `ledge at ${1 / dt}fps`);
    }
    assert(Math.abs(heights[0] - heights[1]) < 0.02);
  });
  check("Hollywood fidelity data retains eight secrets and old starter presentation", () => {
    const q = hollywoodRoom();
    assert.equal(q.fps!.presentation, "classic"); assert.equal(q.fps!.skyMode, "cylinder");
    assert(q.fps!.details!.length > 150); assert(q.fps!.sprites.some((s) => s.id === "turret"));
    assert.equal(q.fps!.zones!.filter((z) => z.secret).length, 8);
    assert.equal(createFpsRoom().fps!.presentation, undefined);
    assert.equal(createFpsRoom().fps!.weapons[0].ammo, 60);
  });
  check("versioned fidelity textures and keyed sprites match their asset manifest", () => {
    const files = JSON.parse(readFileSync("public/img/hollywood-opening/fidelity-v6-manifest.json", "utf8"));
    assert(Object.keys(files).length >= 32);
    for (const [file, entry] of Object.entries(files) as [string, { sha256: string }][]) {
      assert.equal(createHash("sha256").update(readFileSync(`public/img/hollywood-opening/${file}`)).digest("hex"), entry.sha256, file);
    }
  });
}
