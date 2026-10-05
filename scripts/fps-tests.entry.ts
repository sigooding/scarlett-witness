import assert from "node:assert/strict";
import { FpsWorld, directionFrame, floorAt } from "../src/game/fps/simulation";
import { createFpsRoom } from "../src/game/fps/presets";
import type { FpsInput } from "../src/game/fps/types";
import { runFidelityChecks } from "./hollywood/fidelity-checks";
let count = 0;
function check(name: string, fn: () => void) {
  fn();
  count++;
  console.log(`  ✔ ${name}`);
}
const tick = (w: FpsWorld, n: number, input: FpsInput = {}) => {
  for (let i = 0; i < n; i++) w.tick(1 / 60, input);
};
check("forward, strafe and wall collision use camera axes", () => {
  const q = createFpsRoom();
  q.fps!.entities = [];
  const w = new FpsWorld(q);
  tick(w, 120, { forward: 1 });
  assert(w.state.player.z < 2);
  tick(w, 120, { forward: 1 });
  assert(w.state.player.z > 0.26);
  tick(w, 30, { right: 1 });
  assert(w.state.player.x > 4);
});
check("diagonal movement is normalized", () => {
  const a = new FpsWorld(createFpsRoom()),
    b = new FpsWorld(createFpsRoom());
  tick(a, 20, { forward: 1 });
  tick(b, 20, { forward: 1, right: 1 });
  assert(
    Math.abs(
      Math.hypot(b.state.player.x - 3.5, b.state.player.z - 7.5) -
        (7.5 - a.state.player.z),
    ) < 0.001,
  );
});
check("jump lands and does not auto-repeat on held Space", () => {
  const w = new FpsWorld(createFpsRoom());
  tick(w, 12, { jump: true });
  assert(w.state.player.y > 0.5);
  tick(w, 80, { jump: true });
  assert.equal(w.state.player.y, 0);
});
check("shots consume ammunition and destroy a cylinder", () => {
  const w = new FpsWorld(createFpsRoom());
  tick(w, 1, { fire: true });
  assert.equal(w.state.actors[0].hp, 0);
  assert.equal(w.state.player.ammo.pistol, 59);
  assert(w.events.some((e) => e.type === "explosion"));
});
check("solid walls stop hitscan and line of sight", () => {
  const q = createFpsRoom();
  q.map[5] = "#..#.....#";
  const w = new FpsWorld(q);
  tick(w, 1, { fire: true });
  assert(w.state.actors[0].hp > 0);
  assert(!w.clearLine(3.5, 1, 7.5, 3.5, 1, 3.5));
});
check("keycard door cannot be used before its key", () => {
  const q = createFpsRoom();
  q.fps!.doors = [
    {
      id: "gate",
      name: "Red door",
      x: 3.5,
      z: 6,
      width: 2,
      height: 2.4,
      axis: "x",
      key: "red",
    },
  ];
  const w = new FpsWorld(q);
  tick(w, 1, { use: true });
  assert.equal(w.state.doors.gate.target, 0);
  w.state.player.keys.push("red");
  tick(w, 1);
  tick(w, 1, { use: true });
  assert.equal(w.state.doors.gate.target, 1);
  tick(w, 60);
  assert.equal(w.state.doors.gate.open, 1);
});
check("a rising floor cannot be walked through; low steps can", () => {
  const q = createFpsRoom();
  q.map[6] = "#..r.....#";
  let w = new FpsWorld(q);
  tick(w, 60, { forward: 1 });
  assert(w.state.player.z > 7.2);
  q.fps!.tiles.r.floor = 0.3;
  w = new FpsWorld(q);
  tick(w, 20, { forward: 1 });
  assert(w.state.player.z < 7);
  assert.equal(w.state.player.y, 0.3);
});
check("pickup is one-shot and persists in a JSON save", () => {
  const q = createFpsRoom();
  q.fps!.entities = [{ id: "card", sprite: "red-key", x: 3.5, z: 7.5 }];
  const w = new FpsWorld(q);
  tick(w, 1);
  assert.deepEqual(w.state.player.keys, ["red"]);
  const restored = new FpsWorld(q, JSON.parse(JSON.stringify(w.snapshot())));
  assert(restored.state.actors[0].hidden);
  assert.deepEqual(restored.state.player.keys, ["red"]);
});
check(
  "mid-room save keeps position, ammo, deaths, door state and secrets",
  () => {
    const q = createFpsRoom();
    q.fps!.doors = [
      { id: "door", name: "door", axis: "x", x: 6, z: 6, width: 1, height: 2 },
    ];
    const w = new FpsWorld(q);
    tick(w, 1, { fire: true });
    tick(w, 20, { right: 1 });
    w.state.doors.door = { open: 0.6, target: 1 };
    w.state.secrets.push("test");
    const s = w.snapshot(),
      r = new FpsWorld(q, s);
    assert.equal(r.state.player.x, s.player.x);
    assert.equal(r.state.player.ammo.pistol, 59);
    assert.equal(r.state.actors[0].hp, 0);
    assert.equal(r.state.doors.door.open, 0.6);
    assert.deepEqual(r.state.secrets, ["test"]);
  },
);
check(
  "corrupt saves cannot place the player outside the map or introduce NaN",
  () => {
    const q = createFpsRoom(),
      s = new FpsWorld(q).snapshot();
    s.player.x = NaN;
    s.player.z = 999;
    s.player.health = NaN;
    const w = new FpsWorld(q, s);
    assert.equal(w.state.player.x, 3.5);
    assert.equal(w.state.player.health, 100);
  },
);
check("directional sprites distinguish front, side and rear", () => {
  assert.equal(directionFrame(0, 0, 0, 0, -2), 0);
  assert.equal(directionFrame(0, 0, 0, 0, 2), 2);
  assert.notEqual(
    directionFrame(0, 0, 0, 2, 0),
    directionFrame(0, 0, 0, -2, 0),
  );
});
check("rooftop floor is authored and every boundary remains solid", () => {
  const q = createFpsRoom();
  assert.equal(floorAt({ ...q, map: ["rr"] }, 0.5, 0.5), 5.4);
  const w = new FpsWorld(q);
  assert(w.blocked(-1, 1, -1));
});

// Real authored data, schema traversal and portable media are part of the fast gate.
import { HOLLYWOOD_OPENING, hollywoodRoom } from "../src/data/hollywoodOpening";
import {
  E1L1_ENEMIES,
  E1L1_SECRETS,
  runE1L1Route,
  worldDriver,
} from "./hollywood/e1l1-route";
import { validateFpsRoom } from "../src/game/fps/validate";
import { validateStory } from "../src/logic";
import { collectStoryMediaRefs } from "../src/data/mediaLibrary";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
check("Hollywood world and story pass Studio Check", () => {
  const errors = validateStory(HOLLYWOOD_OPENING);
  assert.deepEqual(errors, []);
});
check(
  "all first-person sprite, weapon, sky, material and effect files are collected",
  () => {
    const refs = collectStoryMediaRefs(HOLLYWOOD_OPENING);
    assert(refs.some((r) => r.value.endsWith("trooper-v3-sheet.png")));
    assert(refs.some((r) => r.value.endsWith("shotgun-v3-sheet.png")));
    assert(refs.some((r) => r.value.endsWith("blast-2.png")));
    assert(refs.some((r) => r.value.endsWith("tex6-carpet.png")));
    assert(refs.some((r) => r.value.endsWith("rpg-v4-sheet.png")));
    assert(refs.some((r) => r.value.endsWith("sky-v6.png")));
    for (const { value } of refs)
      if (value.startsWith("/"))
        assert(existsSync(resolve("public", value.slice(1))), value);
  },
);
check(
  "Check rejects missing sprite/material/door/action and malformed geometry",
  () => {
    const q = hollywoodRoom();
    q.fps!.entities.push({ id: "bad", sprite: "missing", x: 1000, z: -1 });
    q.fps!.tiles.i.floor = NaN;
    q.fps!.doors[0].material = "missing";
    q.fps!.entities[0].targets = ["missing"];
    const issues = validateFpsRoom(q, HOLLYWOOD_OPENING.scenes[0].hotspots);
    assert(issues.filter((i) => i.severity === "error").length >= 5);
  },
);
check(
  "Hollywood rooftop is a physical descent unlocked by one C-9 shot",
  () => {
    const w = new FpsWorld(hollywoodRoom());
    const p = w.state.player;
    p.yaw = Math.atan2(-(12.2 - p.x), -(4.4 - p.z));
    tick(w, 1, { fire: true });
    assert.equal(w.state.doors["roof-hatch"].target, 1);
    assert(w.state.actors.find((a) => a.id === "roof-c9")!.hidden);
    tick(w, 120);
    p.yaw = -Math.PI / 2;
    tick(w, 150, { forward: 1 });
    assert(p.x > 14);
    tick(w, 100);
    assert.equal(p.y, 0);
  },
);
check("solid set dressing supplies real bullet cover", () => {
  const q = createFpsRoom();
  q.fps!.entities = [{ id: "box", sprite: "crate", x: 3.5, z: 5.5 }];
  const w = new FpsWorld(q);
  assert(!w.clearLine(3.5, 0.8, 7.5, 3.5, 0.8, 3.5));
  assert(w.clearLine(3.5, 1.5, 7.5, 3.5, 1.5, 3.5));
});
check(
  "complete physical E1L1 tour: original route, all eight secrets, every enemy and the real exit",
  () => {
    const w = new FpsWorld(hollywoodRoom());
    runE1L1Route(worldDriver(w));
    assert(w.events.some((e) => e.type === "exit" && e.id === "hh-finish"));
    assert.equal(w.state.kills, E1L1_ENEMIES);
    assert.deepEqual([...w.state.secrets].sort(), E1L1_SECRETS);
    assert(w.state.player.keys.includes("red"));
    assert.deepEqual([...(w.state.player.inventory ?? [])].sort(), [
      "jetpack",
      "medkit",
      "nightvision",
      "pipebombs",
      "steroids",
    ]);
    assert(w.state.player.weapons.includes("rpg"));
  },
);
check(
  "lifts carry a rider, rise by their travel and can be ridden back down",
  () => {
    const q = createFpsRoom();
    q.fps!.entities = [];
    q.fps!.doors = [
      {
        id: "lift",
        name: "lift",
        x: 3.5,
        z: 5.5,
        axis: "x",
        width: 1.4,
        depth: 1.4,
        height: 0.2,
        lift: 2,
      },
    ];
    const w = new FpsWorld(q);
    const p = w.state.player;
    p.yaw = 0;
    tick(w, 40, { forward: 1 });
    assert(Math.abs(p.z - 5.5) < 0.5, `rider at ${p.z}`);
    assert.equal(p.y, 0.2);
    w.tick(1 / 60, { use: true });
    tick(w, 200);
    assert(Math.abs(p.y - 2.2) < 0.01, `top at ${p.y}`);
    w.tick(1 / 60);
    w.tick(1 / 60, { use: true });
    tick(w, 200);
    assert(Math.abs(p.y - 0.2) < 0.01);
  },
);
check(
  "splash weapons damage through blast radius and hurt a careless player",
  () => {
    const q = createFpsRoom();
    q.fps!.weapons.push({
      id: "rpg",
      name: "RPG",
      damage: 100,
      interval: 1,
      range: 30,
      ammo: 5,
      splash: 3,
      splashDamage: 100,
    });
    q.fps!.entities = [
      { id: "a", sprite: "trooper", x: 3.5, z: 2.5 },
      { id: "b", sprite: "trooper", x: 5, z: 2.5 },
    ];
    const w = new FpsWorld(q);
    w.state.player.weapons.push("rpg");
    w.state.player.yaw = 0;
    w.tick(1 / 60, { fire: true, weapon: "rpg" });
    assert(w.state.actors.every((a) => a.hp < 60));
    assert.equal(w.state.player.health, 100);
    w.state.player.z = 3.2;
    tick(w, 70);
    w.tick(1 / 60, { fire: true });
    assert(w.state.player.health < 100);
  },
);
check(
  "item and capped-health pickups: inventory is recorded and atomic health exceeds 100",
  () => {
    const q = createFpsRoom();
    q.fps!.sprites.push(
      {
        id: "jet",
        name: "JETPACK",
        kind: "pickup",
        width: 0.5,
        height: 0.5,
        pickup: { type: "item", itemId: "jetpack" },
      },
      {
        id: "atom",
        name: "ATOMIC",
        kind: "pickup",
        width: 0.5,
        height: 0.5,
        pickup: { type: "health", amount: 50, max: 200 },
      },
    );
    q.fps!.entities = [
      { id: "j", sprite: "jet", x: 3.5, z: 6.5 },
      { id: "h", sprite: "atom", x: 3.5, z: 5.5 },
    ];
    const w = new FpsWorld(q);
    w.state.player.yaw = 0;
    tick(w, 60, { forward: 1 });
    assert.deepEqual(w.state.player.inventory, ["jetpack"]);
    assert.equal(w.state.player.health, 150);
    const restored = new FpsWorld(q, w.snapshot());
    assert.deepEqual(restored.state.player.inventory, ["jetpack"]);
  },
);
check(
  "interactive props call the shared hotspot pipeline and honor gating before opening doors",
  () => {
    const q = createFpsRoom();
    q.fps!.entities = [
      {
        id: "console",
        sprite: "monitor",
        x: 3.5,
        z: 6.2,
        hotspotId: "terminal",
        targets: ["gate"],
      },
    ];
    q.fps!.doors = [
      { id: "gate", name: "gate", x: 5, z: 5, axis: "x", width: 1, height: 2 },
    ];
    const blocked = new FpsWorld(q, undefined, () => false);
    tick(blocked, 1, { use: true });
    assert(!blocked.events.some((e) => e.type === "interact"));
    assert.equal(blocked.state.doors.gate.target, 0);
    const open = new FpsWorld(q, undefined, () => true);
    tick(open, 1, { use: true });
    assert(
      open.events.some((e) => e.type === "interact" && e.id === "terminal"),
    );
    assert.equal(open.state.doors.gate.target, 1);
  },
);
check(
  "death stops simulation and a fresh restart restores the configured loadout",
  () => {
    const q = createFpsRoom();
    q.fps!.health = 3;
    q.fps!.entities = [{ id: "enemy", sprite: "trooper", x: 3.5, z: 4.5 }];
    const w = new FpsWorld(q);
    tick(w, 180);
    assert.equal(w.state.player.health, 0);
    const time = w.state.time;
    tick(w, 90, { forward: 1, fire: true });
    assert.equal(w.state.time, time);
    assert.equal(new FpsWorld(q).state.player.ammo.pistol, 60);
  },
);
check(
  "saved mid-air velocity and weapon / enemy cooldowns survive a round trip",
  () => {
    const q = createFpsRoom(),
      w = new FpsWorld(q);
    tick(w, 8, { jump: true });
    w.state.player.reloadUntil = w.state.time + 0.5;
    w.state.actors[0].attackAt = 17;
    const restored = new FpsWorld(q, w.snapshot());
    assert.equal(restored.state.player.vy, w.state.player.vy);
    assert.equal(restored.state.player.grounded, false);
    assert.equal(restored.state.player.reloadUntil, w.state.player.reloadUntil);
    assert.equal(restored.state.actors[0].attackAt, 17);
  },
);
check(
  "high authored sprint speeds cannot tunnel through a one-cell wall",
  () => {
    const q = createFpsRoom();
    q.fps!.entities = [];
    q.fps!.moveSpeed = 12;
    q.fps!.runMultiplier = 3;
    q.map[5] = "#..#.....#";
    const w = new FpsWorld(q);
    tick(w, 60, { forward: 1, run: true });
    assert(w.state.player.z > 6.25);
  },
);

check("landing medkit is not consumed just before fall damage", () => {
  const q = createFpsRoom();
  q.fps!.entities = [{ id: "medkit", sprite: "medkit", x: 3.5, z: 7.5 }];
  const w = new FpsWorld(q);
  w.state.player.health = 50;
  w.state.player.y = 0.9;
  w.state.player.vy = -12;
  w.state.player.grounded = false;
  w.tick(0.025);
  assert(!w.state.actors[0].hidden);
  assert.equal(w.state.player.health, 50);
  tick(w, 30);
  assert(w.state.actors[0].hidden);
  assert(w.state.player.health > 50);
});
check(
  "enemies block movement while alive and stop blocking after defeat",
  () => {
    const q = createFpsRoom();
    q.fps!.entities = [{ id: "guard", sprite: "trooper", x: 3.5, z: 6.5 }];
    const w = new FpsWorld(q);
    assert(!w.canStand(3.5, 6.5, 0));
    w.state.actors[0].hp = 0;
    assert(w.canStand(3.5, 6.5, 0));
  },
);

import { checkSpriteArt } from "./hollywood/sprite-art-checks";
checkSpriteArt(check);

check(
  "stopping across a rooftop edge keeps support until the full capsule clears",
  () => {
    const q = createFpsRoom();
    q.fps!.entities = [];
    q.map[7] = "#..r.....#";
    const w = new FpsWorld(q);
    for (let i = 0; i < 10; i++) w.tick(1 / 60, { forward: 1 });
    assert(w.state.player.z < 7 && w.state.player.z > 6.73);
    tick(w, 120);
    assert.equal(
      w.state.player.y,
      5.4,
      "rear footprint still stands on the roof",
    );
    tick(w, 80, { forward: 1 });
    tick(w, 90);
    assert(w.state.player.z < 6.7, "not pinned by the ledge behind");
    assert.equal(w.state.player.y, 0);
  },
);
runFidelityChecks(check);

// Quake E1M1 — The Slipgate Complex (the fast gate's second full campaign).
import { QUAKE_E1M1, quakeE1M1Room } from "../src/data/quakeE1M1";
import {
  E1M1_ENEMIES,
  E1M1_SECRETS,
  runE1M1Route,
  worldDriver as quakeWorldDriver,
} from "./quake/e1m1-route";
const D = Math.PI / 180;

check("Quake E1M1 story passes Studio Check", () => {
  assert.deepEqual(validateStory(QUAKE_E1M1), []);
});
check("all Quake sprite, weapon, sky, material and effect files are collected", () => {
  const refs = collectStoryMediaRefs(QUAKE_E1M1);
  assert(refs.some((r) => r.value.endsWith("grunt.png")));
  assert(refs.some((r) => r.value.endsWith("rottweiler.png")));
  assert(refs.some((r) => r.value.endsWith("nailgun-view.png")));
  assert(refs.some((r) => r.value.endsWith("tex-slipgate.png")));
  assert(refs.some((r) => r.value.endsWith("pickup-quad.png")));
  assert(refs.some((r) => r.value.endsWith("menu-sky.png")));
  for (const { value } of refs)
    if (value.startsWith("/"))
      assert(existsSync(resolve("public", value.slice(1))), value);
});
check(
  "complete physical E1M1 tour: original route, all six secrets, every enemy and the slipgate exit",
  () => {
    const w = new FpsWorld(quakeE1M1Room());
    runE1M1Route(quakeWorldDriver(w));
    assert(
      w.events.some((e) => e.type === "interact" && e.id === "q1-finish"),
      "the slipgate fires its story hotspot",
    );
    assert.equal(w.state.kills, E1M1_ENEMIES);
    assert.deepEqual([...w.state.secrets].sort(), E1M1_SECRETS);
    const p = w.state.player;
    assert(p.weapons.includes("nailgun"));
    assert(p.weapons.includes("dbs"));
    assert((p.pools?.shells ?? 0) > 0);
    assert(p.armor > 100, "yellow armor raises the cap above green");
  },
);
check(
  "shared ammo pools: shotgun and double shotgun draw one shells count",
  () => {
    const w = new FpsWorld(quakeE1M1Room());
    const p = w.state.player;
    assert.deepEqual(p.weapons, ["axe", "shotgun"]);
    assert.equal(p.pools?.shells, 25);
    p.weapons.push("dbs");
    p.weapon = "dbs";
    p.pools!.shells = 30;
    p.yaw = 0;
    w.tick(1 / 60, { fire: true });
    assert.equal(p.pools?.shells, 29);
    assert(p.ammo.dbs === 0, "pool weapons keep no per-weapon count");
  },
);
check("nailgun launches dodgeable nails that kill grunts", () => {
  const q = quakeE1M1Room();
  const w = new FpsWorld(q);
  const p = w.state.player;
  p.weapons.push("nailgun");
  p.weapon = "nailgun";
  p.pools!.nails = 60;
  p.x = 31.5;
  p.z = 3.5;
  p.y = -2;
  p.yaw = -90 * D;
  p.pitch = 0;
  const a = w.state.actors.find((a) => a.id === "g-e1")!;
  a.x = 37;
  a.z = 3.5;
  a.y = -2;
  a.alerted = false;
  w.tick(1 / 60, { fire: true });
  assert(w.state.projectiles!.length > 0);
  assert(w.state.projectiles![0].fromPlayer);
  for (let i = 0; i < 60; i++) w.tick(1 / 60);
  assert.equal(a.hp, 21, "one nail for 9 damage");
  for (let i = 0; i < 360; i++) w.tick(1 / 60, { fire: true });
  assert.equal(a.hp, 0, "the nailgun finishes the grunt");
});
check("melee rottweilers bite only in reach; the axe needs no ammo", () => {
  const q = quakeE1M1Room();
  // Pin the dog in place so "reach" is the only variable.
  q.fps!.sprites.find((s) => s.id === "rottweiler")!.speed = 0;
  const w = new FpsWorld(q);
  const p = w.state.player;
  w.state.actors.find((a) => a.id === "g-hall")!.hp = 0; // silence the hall grunt
  const dog = w.state.actors.find((a) => a.id === "d-yard")!;
  dog.x = p.x + 2;
  dog.z = p.z;
  dog.y = p.y;
  for (let i = 0; i < 120; i++) w.tick(1 / 60);
  assert.equal(p.health, 100, "out of bite reach");
  dog.x = p.x + 0.7;
  for (let i = 0; i < 240; i++) w.tick(1 / 60);
  assert(p.health < 100, "in reach");
  p.weapon = "axe";
  const shells = p.pools!.shells;
  w.tick(1 / 60, { fire: true });
  assert.equal(p.pools!.shells, shells, "axe spends nothing");
  assert(w.events.some((e) => e.type === "shot" && e.id === "axe"));
});
check("slime hurts on the bed, not on a slab above it, and the biosuit negates it", () => {
  const w = new FpsWorld(quakeE1M1Room());
  const p = w.state.player;
  for (const a of w.state.actors) {
    const def = w.definitions.get(w.placements.get(a.id)!.sprite)!;
    if (def.kind === "enemy") a.hp = 0;
  }
  p.x = 35.5;
  p.z = 7.5;
  p.y = -8;
  p.grounded = true;
  tick(w, 60);
  assert.equal(p.health, 95, "one second of slime at normal skill");
  // Standing on the extended ledge above the pool is safe.
  p.x = 38;
  p.z = 9.4;
  p.y = -1.7;
  w.state.doors["lift-ledge"].open = 1;
  w.state.doors["lift-ledge"].target = 1;
  tick(w, 120);
  assert.equal(p.health, 95);
  // Biosuit drains instead of health.
  p.x = 35.5;
  p.z = 7.5;
  p.y = -8;
  p.inventory = ["biosuit"];
  p.inventoryAmounts = { biosuit: 100 };
  p.activeInventory = ["biosuit"];
  tick(w, 120);
  assert.equal(p.health, 95);
  assert(p.inventoryAmounts.biosuit < 100);
});
check("quad damage quadruples weapon damage for its duration", () => {
  const q = quakeE1M1Room();
  const w = new FpsWorld(q);
  const p = w.state.player;
  w.state.actors.find((a) => a.id === "g-hall")!.hp = 0;
  p.x = 16.5;
  p.z = 33.5;
  const crack = w.state.actors.find((a) => a.id === "s1-wall")!;
  crack.x = 18.5;
  crack.z = 33.5;
  crack.y = 0.5;
  crack.hp = 100;
  p.yaw = -90 * D;
  p.weapon = "shotgun";
  p.quadUntil = w.state.time + 10;
  w.tick(1 / 60, { fire: true });
  assert(crack.hp <= 64, `quad damage x4 (hp ${crack.hp})`);
});
check("wading water slows movement and sealed doors stay shut", () => {
  const w = new FpsWorld(quakeE1M1Room());
  const p = w.state.player;
  const walked = () => {
    p.x = 14.5;
    p.z = 23.5;
    p.y = -2;
    p.yaw = Math.PI;
    p.grounded = true;
    for (let i = 0; i < 30; i++) w.tick(1 / 60, { forward: 1 });
    return p.z;
  };
  const dry = walked();
  p.x = 10.5;
  p.z = 27.5;
  p.y = -4.2;
  p.yaw = Math.PI;
  p.grounded = true;
  for (let i = 0; i < 30; i++) w.tick(1 / 60, { forward: 1 });
  assert(p.z > dry, "wading is slower than walking");
  // The secret 2 back wall never auto-opens on approach.
  p.x = 9.5;
  p.z = 27.3;
  p.y = -4.2;
  tick(w, 60);
  assert.equal(w.state.doors["s2-back"].target, 0);
});
check("the slipgate zone fires its hotspot once and locks with the story", () => {
  const q = quakeE1M1Room();
  const w = new FpsWorld(q, undefined, () => false); // story lock: everything locked
  const p = w.state.player;
  p.x = 23.5;
  p.z = 4.7;
  p.y = -4;
  tick(w, 10);
  assert.equal(w.state.visited.includes("q1-exit"), false, "locked stays locked");
  const w2 = new FpsWorld(quakeE1M1Room());
  const p2 = w2.state.player;
  p2.x = 23.5;
  p2.z = 4.7;
  p2.y = -4;
  tick(w2, 10);
  assert.equal(w2.events.filter((e) => e.type === "interact").length, 1);
  tick(w2, 30);
  assert.equal(w2.events.filter((e) => e.type === "interact").length, 1);
});

console.log(`First-person regressions: ${count} checks passed`);
