import type { QuakeModeSettings } from "../../types";
import { quakeMoveDelta } from "../quakeMath";
import { detailContains, detailTop, tileFloor } from "./geometry";
import { EQUIPMENT, inventoryActive, inventoryAmount, restoreInventory } from "./inventory";
import type {
  FpsActorState,
  FpsDoor,
  FpsDetail,
  FpsEntity,
  FpsEvent,
  FpsInput,
  FpsSettings,
  FpsSnapshot,
  FpsSprite,
  FpsTile,
} from "./types";

export const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
const finite = (v: unknown, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;
const TAU = Math.PI * 2;
export function directionFrame(
  yaw: number,
  x: number,
  z: number,
  cameraX: number,
  cameraZ: number,
  count = 4,
) {
  const toward = Math.atan2(-(cameraX - x), -(cameraZ - z));
  return (
    Math.round((((((toward - yaw) % TAU) + TAU) % TAU) / TAU) * count) % count
  );
}
export function tileAt(q: QuakeModeSettings, x: number, z: number): FpsTile {
  const char = q.map[Math.floor(z)]?.[Math.floor(x)];
  if (char === undefined)
    return { name: "Boundary", solid: true, wallHeight: 64 };
  return (
    q.fps?.tiles[char] ??
    (char === "#"
      ? { name: "Wall", solid: true, wallHeight: 8 }
      : { name: "Floor", floor: 0, ceiling: null })
  );
}
export const floorAt = (q: QuakeModeSettings, x: number, z: number) =>
  tileFloor(tileAt(q, x, z), x - Math.floor(x), z - Math.floor(z));
export function doorContains(d: FpsDoor, x: number, z: number, radius = 0) {
  const half = (d.depth ?? 0.24) / 2;
  return d.axis === "x"
    ? Math.abs(x - d.x) < d.width / 2 + radius &&
        Math.abs(z - d.z) < half + radius
    : Math.abs(z - d.z) < d.width / 2 + radius &&
        Math.abs(x - d.x) < half + radius;
}
/** Split doors have a growing opening at their centre. This same aperture is
 * used by bullets, interactions and the player capsule. */
export function doorBlocksAt(d: FpsDoor, open: number, x: number, z: number, radius = 0) {
  if (!doorContains(d, x, z, radius) || open >= 1 && d.lift === undefined) return false;
  return d.motion !== "split" || Math.abs((d.axis === "x" ? x - d.x : z - d.z)) + radius >= d.width * open / 2;
}
/** How far the slab travels between closed and open. Doors slide their own
 * height into the ceiling; lifts rise by their authored travel. */
export const doorTravel = (d: FpsDoor) => d.lift ?? d.height;
/** Vertical extent of the solid slab for the current open fraction. */
export function doorSlab(
  q: QuakeModeSettings,
  d: FpsDoor,
  open: number,
): { lo: number; hi: number } {
  const bottom = d.bottom ?? floorAt(q, d.x, d.z);
  if (d.lift !== undefined) {
    const lo = bottom + open * d.lift;
    return { lo, hi: lo + d.height };
  }
  if (d.motion === "split") return { lo: bottom, hi: bottom + d.height };
  return { lo: bottom + open * d.height, hi: bottom + d.height };
}

/** Deterministic, DOM-free movement/combat. UI tests use real inputs, not this API. */
export class FpsWorld {
  readonly config: FpsSettings;
  readonly definitions: Map<string, FpsSprite>;
  readonly placements: Map<string, FpsEntity>;
  state: FpsSnapshot;
  events: FpsEvent[] = [];
  private useHeld = false;
  private jumpHeld = false;
  private equipmentHeld = false;
  private cycleHeld = false;
  private bombHeld = false;
  private detonateHeld = false;
  private waterAt = -100;
  private hazardAt = 0;
  private cover: FpsActorState[] = [];
  private solidDetails: FpsDetail[] = [];
  private blockers: FpsActorState[] = [];
  private platforms: FpsActorState[] = [];
  private damageable: FpsActorState[] = [];
  constructor(
    readonly room: QuakeModeSettings,
    saved?: FpsSnapshot,
    private allowHotspot: (id: string) => boolean = () => true,
  ) {
    if (!room.fps) throw new Error("A first-person room needs fps settings");
    this.config = room.fps;
    const f = this.config;
    this.definitions = new Map(f.sprites.map((s) => [s.id, s]));
    this.placements = new Map(f.entities.map((e) => [e.id, e]));
    const first = f.weapons[0];
    const startingWeapons = f.weapons
      .filter((w) => w.id === first?.id || w.starting)
      .map((w) => w.id);
    this.state = {
      version: 1,
      skill: Math.max(1, Math.min(3, Math.round(finite(saved?.skill, f.defaultSkill ?? 2)))) as 1 | 2 | 3,
      time: 0,
      kills: 0,
      secrets: [],
      visited: [],
      pipebombs: [],
      projectiles: [],
      player: {
        ...f.spawn,
        y: floorAt(room, f.spawn.x, f.spawn.z),
        pitch: 0,
        vy: 0,
        health: f.health ?? 100,
        armor: f.armor ?? 0,
        weapons: startingWeapons,
        weapon: first?.id ?? "",
        ammo: Object.fromEntries(f.weapons.map((w) => [w.id, w.ammo])),
        clips: Object.fromEntries(
          f.weapons.map((w) => [w.id, Math.min(w.clipSize ?? 9999, w.ammo)]),
        ),
        pools: Object.fromEntries(
          [
            ...new Set(
              f.weapons
                .map((w) => w.ammoPool)
                .filter((id): id is string => !!id),
            ),
          ].map((pool) => [
            pool,
            Math.max(
              0,
              ...f.weapons
                .filter((w) => w.ammoPool === pool)
                .map((w) => w.ammo),
            ),
          ]),
        ),
        quadUntil: 0,
        keys: [],
        inventory: [],
        inventoryAmounts: {},
        activeInventory: [],
        kickAt: -100,
        grounded: true,
        crouched: false,
        shotAt: -100,
        reloadUntil: 0,
        hurtAt: -100,
      },
      actors: f.entities
        .filter((e) => this.definitions.has(e.sprite))
        .map((e) => ({
          id: e.id,
          x: e.x,
          z: e.z,
          y: e.y ?? floorAt(room, e.x, e.z),
          yaw: e.yaw ?? 0,
          hp: this.definitions.get(e.sprite)?.health ?? 1,
          hidden: false,
          alerted: false,
          attackAt: 1,
          hurtAt: -100,
          diedAt: -100,
        })),
      doors: Object.fromEntries(
        f.doors.map((d) => [
          d.id,
          { open: d.startsOpen ? 1 : 0, target: d.startsOpen ? 1 : 0 },
        ]),
      ),
    };
    this.cover = this.state.actors.filter((a) => {
      const d = this.definitions.get(this.placements.get(a.id)!.sprite)!;
      return d.kind === "prop" && d.solid;
    });
    // Static classifications are computed once. Walking a long hitscan/LOS ray
    // must not scan every decorative cornice, sign and light at every sample.
    this.solidDetails = (f.details ?? []).filter((d) => d.solid);
    this.blockers = this.state.actors.filter((a) => this.definitions.get(this.placements.get(a.id)!.sprite)?.solid);
    this.platforms = this.state.actors.filter((a) => this.definitions.get(this.placements.get(a.id)!.sprite)?.platform);
    this.damageable = this.state.actors.filter((a) => ["enemy", "explosive", "breakable"].includes(this.definitions.get(this.placements.get(a.id)!.sprite)!.kind));
    if (saved?.version === 1 && saved.player) this.restore(saved);
    restoreInventory(this.state.player);
  }
  snapshot(): FpsSnapshot {
    return structuredClone(this.state);
  }
  private restore(saved: FpsSnapshot) {
    const p = this.state.player,
      s = saved.player;
    this.state.time = Math.max(0, finite(saved.time, 0));
    this.state.kills = Math.max(0, finite(saved.kills, 0));
    this.state.secrets = Array.isArray(saved.secrets)
      ? saved.secrets.filter((x) => typeof x === "string")
      : [];
    this.state.visited = Array.isArray(saved.visited)
      ? saved.visited.filter((x) => typeof x === "string")
      : [];
    const x = finite(s.x, p.x),
      z = finite(s.z, p.z);
    if (!tileAt(this.room, x, z).solid) {
      p.x = x;
      p.z = z;
      p.y = Math.max(floorAt(this.room, x, z), finite(s.y, p.y));
    }
    p.yaw = finite(s.yaw, p.yaw);
    p.pitch = clamp(finite(s.pitch, 0), -0.85, 0.85);
    p.health = clamp(finite(s.health, 100), 0, 200);
    p.armor = clamp(finite(s.armor, 0), 0, 200);
    p.weapons = (Array.isArray(s.weapons) ? s.weapons : p.weapons).filter(
      (id) => this.config.weapons.some((w) => w.id === id),
    );
    if (!p.weapons.length && this.config.weapons[0])
      p.weapons = [this.config.weapons[0].id];
    p.weapon = p.weapons.includes(s.weapon) ? s.weapon : (p.weapons[0] ?? "");
    p.shotAt = finite(s.shotAt, -100);
    p.reloadUntil = Math.max(0, finite(s.reloadUntil, 0));
    p.hurtAt = finite(s.hurtAt, -100);
    p.vy = clamp(finite(s.vy, 0), -40, 12);
    p.crouched = s.crouched === true;
    p.keys = Array.isArray(s.keys)
      ? s.keys.filter((k) => typeof k === "string")
      : [];
    p.inventory = Array.isArray(s.inventory)
      ? s.inventory.filter((k) => typeof k === "string")
      : [];
    p.inventoryAmounts = s.inventoryAmounts;
    p.inventorySelected = s.inventorySelected;
    p.activeInventory = Array.isArray(s.activeInventory) ? s.activeInventory.filter((id) => typeof id === "string") : [];
    if (s.holoduke && [s.holoduke.x, s.holoduke.y, s.holoduke.z].every(Number.isFinite) &&
      !this.blocked(s.holoduke.x, s.holoduke.y + 0.5, s.holoduke.z)) p.holoduke = { ...s.holoduke };
    p.kickAt = finite(s.kickAt, -100);
    this.state.projectiles = (Array.isArray(saved.projectiles) ? saved.projectiles : [])
      .filter((b) => b && [b.x, b.y, b.z, b.vx, b.vy, b.vz, b.damage, b.life].every(Number.isFinite) &&
        b.damage >= 0 && b.damage <= 500 && b.life > 0 && b.life <= 20 &&
        Math.hypot(b.vx, b.vy, b.vz) <= 80 && typeof b.sourceId === "string" &&
        ((b.fromPlayer === true && b.sourceId === "player") || this.placements.has(b.sourceId)))
      .slice(0, 128).map((b) => ({
        ...b,
        color: /^#[0-9a-f]{6}$/i.test(b.color) ? b.color : "#8cfa47",
        gravity: finite(b.gravity, 0),
        bounce: finite(b.bounce, 0),
        fuse: finite(b.fuse, 0),
        splash: finite(b.splash, 0),
        splashDamage: finite(b.splashDamage, 0),
      }));
    this.state.pipebombs = (Array.isArray(saved.pipebombs) ? saved.pipebombs : [])
      .filter((b) => b && [b.x, b.y, b.z, b.vx, b.vy, b.vz].every(Number.isFinite) &&
        !tileAt(this.room, b.x, b.z).solid)
      .slice(0, 50).map((b) => ({ ...b }));
    for (const w of this.config.weapons) {
      p.ammo[w.id] = clamp(finite(s.ammo?.[w.id], p.ammo[w.id]), 0, w.maxAmmo ?? 999);
      p.clips[w.id] = clamp(
        finite(s.clips?.[w.id], p.clips[w.id]),
        0,
        w.clipSize ?? 999,
      );
    }
    p.pools = {};
    for (const pool of new Set(
      this.config.weapons
        .map((w) => w.ammoPool)
        .filter((id): id is string => !!id),
    ))
      p.pools[pool] = clamp(finite(s.pools?.[pool], 0), 0, 999);
    p.quadUntil = Math.max(0, finite(s.quadUntil, 0));
    for (const a of this.state.actors) {
      const old = Array.isArray(saved.actors)
        ? saved.actors.find((v) => v.id === a.id)
        : undefined;
      if (!old) continue;
      const ax = finite(old.x, a.x),
        az = finite(old.z, a.z);
      if (!tileAt(this.room, ax, az).solid) {
        a.x = ax;
        a.z = az;
        a.y = finite(old.y, a.y);
      }
      a.hp = clamp(finite(old.hp, a.hp), 0, a.hp);
      a.hidden = old.hidden === true;
      a.attackAt = finite(old.attackAt, 1);
      a.hurtAt = finite(old.hurtAt, -100);
      a.yaw = finite(old.yaw, a.yaw);
      a.diedAt = finite(old.diedAt, -100);
      a.alerted = old.alerted === true;
    }
    for (const d of this.config.doors)
      if (saved.doors?.[d.id])
        this.state.doors[d.id] = {
          open: clamp(finite(saved.doors[d.id].open, 0), 0, 1),
          target: saved.doors[d.id].target === 1 ? 1 : 0,
        };
    p.grounded =
      s.grounded === true && p.y <= this.groundAt(p.x, p.z, p.y) + 0.05;
    if (!this.canStand(p.x, p.z, p.y, 0.27)) {
      p.x = this.config.spawn.x;
      p.z = this.config.spawn.z;
      p.y = floorAt(this.room, p.x, p.z);
    }
  }
  /** Collision shared by movement, line of sight, interactions and weapons. */
  blocked(x: number, y: number, z: number, radius = 0): boolean {
    for (const [dx, dz] of [
      [-radius, -radius],
      [radius, -radius],
      [-radius, radius],
      [radius, radius],
    ]) {
      const t = tileAt(this.room, x + dx, z + dz);
      if (
        (t.solid && y < (t.wallHeight ?? 8)) ||
        y < floorAt(this.room, x + dx, z + dz) - 0.02 ||
        (t.ceiling != null && y > t.ceiling && (t.roof == null || y < t.roof))
      )
        return true;
    }
    if (
      this.cover.some((a) => {
        const def = this.definitions.get(this.placements.get(a.id)!.sprite)!;
        return (
          !a.hidden &&
          a.hp > 0 &&
          y > a.y &&
          y < a.y + def.height &&
          Math.hypot(a.x - x, a.z - z) <
            (def.radius ?? def.width * 0.3) + radius
        );
      })
    )
      return true;
    if (this.solidDetails.some((d) => detailContains(d, x, z, radius) &&
      y >= d.bottom && y < detailTop(d, x, z))) return true;
    return this.config.doors.some((d) => {
      if (!doorBlocksAt(d, this.state.doors[d.id].open, x, z, radius)) return false;
      const { lo, hi } = doorSlab(this.room, d, this.state.doors[d.id].open);
      return y >= lo - 0.02 && y < hi;
    });
  }
  canStand(
    x: number,
    z: number,
    y: number,
    radius = 0.27,
    actorId?: string,
  ): boolean {
    for (const [dx, dz] of [
      [-radius, -radius],
      [radius, -radius],
      [-radius, radius],
      [radius, radius],
    ]) {
      const t = tileAt(this.room, x + dx, z + dz);
      const floor = floorAt(this.room, x + dx, z + dz);
      if (
        (t.solid && y < (t.wallHeight ?? 8)) ||
        floor > y + 0.36 ||
        (t.ceiling != null && (t.roof == null || y < t.roof - 0.02) &&
          t.ceiling - Math.max(y, floor) <
            (this.state.player.crouched ? 0.9 : 1.65))
      )
        return false;
    }
    const height = this.state.player.crouched && !actorId ? 0.9 : 1.65;
    if (this.solidDetails.some((d) => detailContains(d, x, z, radius) &&
      y + height > d.bottom + 0.02 && y < detailTop(d, x, z) - 0.36)) return false;
    if (this.config.doors.some((d) => {
      const open = this.state.doors[d.id].open;
      if (!doorBlocksAt(d, open, x, z, radius) && !d.walkable && d.lift === undefined) return false;
      if (!doorContains(d, x, z, radius)) return false;
      const { lo, hi } = doorSlab(this.room, d, open);
      if (hi - lo < 0.001) return false;
      return y + height > lo + 0.02 && y < hi - (d.lift !== undefined || d.walkable ? 0.36 : 0.02);
    })) return false;
    return !this.blockers.some((a) => {
      if (a.id === actorId || a.hidden || a.hp <= 0) return false;
      const def = this.definitions.get(this.placements.get(a.id)!.sprite);
      return (
        def?.solid &&
        Math.abs(a.y - y) < def.height &&
        Math.hypot(a.x - x, a.z - z) < (def.radius ?? def.width * 0.3) + radius
      );
    });
  }
  clearLine(
    x: number,
    y: number,
    z: number,
    tx: number,
    ty: number,
    tz: number,
  ) {
    const steps = Math.ceil(Math.hypot(tx - x, ty - y, tz - z) / 0.075);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (this.blocked(x + (tx - x) * t, y + (ty - y) * t, z + (tz - z) * t))
        return false;
    }
    return true;
  }
  nearby(): { id: string; name: string; kind: "door" | "entity" } | null {
    const p = this.state.player;
    let best: ReturnType<FpsWorld["nearby"]> = null,
      distance = 2.25;
    const consider = (
      id: string,
      name: string,
      kind: "door" | "entity",
      x: number,
      y: number,
      z: number,
      standingOn = false,
      reach = 0.28,
      requireSight = true,
    ) => {
      const d = Math.hypot(x - p.x, z - p.z);
      // A rider on a lift platform operates it without having to face its centre.
      const aim = standingOn
        ? 1
        : (-Math.sin(p.yaw) * (x - p.x) - Math.cos(p.yaw) * (z - p.z)) /
          Math.max(0.01, d);
      // Stop just in front of a door so the closed panel itself isn't treated as an intervening wall.
      const ratio = Math.max(0, (d - reach) / Math.max(0.01, d));
      if (
        d < distance &&
        aim > 0.35 &&
        Math.abs(y - p.y) < 1.8 &&
        (!requireSight ||
          this.clearLine(
            p.x,
            p.y + 1,
            p.z,
            p.x + (x - p.x) * ratio,
            y + 1,
            p.z + (z - p.z) * ratio,
          ))
      ) {
        best = { id, name, kind };
        distance = d;
      }
    };
    for (const d of this.config.doors)
      if (!d.walkable)
        consider(
          d.id,
          d.name,
          "door",
          d.x,
          d.lift !== undefined
            ? doorSlab(this.room, d, this.state.doors[d.id].open).hi
            : (d.bottom ?? floorAt(this.room, d.x, d.z)),
          d.z,
          d.lift !== undefined && doorContains(d, p.x, p.z),
          (d.depth ?? 0.24) / 2 + 0.2,
          // A raised lift occludes its own call line; riders call it down
          // from beside the shaft by facing it.
          d.lift === undefined,
        );
    for (const a of this.state.actors) {
      const e = this.placements.get(a.id)!,
        def = this.definitions.get(e.sprite);
      if (
        !def ||
        a.hidden ||
        (a.hp <= 0 && def.use !== "water") ||
        (!["switch", "exit"].includes(def.kind) && !e.hotspotId && !def.use)
      )
        continue;
      consider(a.id, def.use === "water" ? (a.hp <= 0 ? "DRINK WATER" : "USE FIXTURE") : e.message ?? def.name,
        "entity", a.x, a.y, a.z);
    }
    return best;
  }
  private groundAt(x: number, z: number, feet: number) {
    let floor = floorAt(this.room, x, z);
    // The support footprint must match collision's footprint. Dropping as
    // soon as the center crossed a ledge stranded a stopped player with
    // their rear capsule still intersecting the tall floor behind them.
    for (const [dx, dz] of [
      [-0.27, -0.27],
      [0.27, -0.27],
      [-0.27, 0.27],
      [0.27, 0.27],
    ]) {
      const support = tileAt(this.room, x + dx, z + dz);
      const top = support.solid
        ? (support.wallHeight ?? 10)
        : floorAt(this.room, x + dx, z + dz);
      if (top <= feet + 0.36) floor = Math.max(floor, top);
      if (support.roof != null && support.roof <= feet + 0.36) floor = Math.max(floor, support.roof);
    }
    const tile = tileAt(this.room, x, z);
    if (tile.solid && feet >= (tile.wallHeight ?? 10) - 0.36)
      floor = tile.wallHeight ?? 10;
    for (const d of this.solidDetails) {
      const top = detailTop(d, x, z);
      if (d.solid && detailContains(d, x, z, 0.12) && top <= feet + 0.36) floor = Math.max(floor, top);
    }
    for (const d of this.config.doors) {
      if ((d.lift === undefined && !d.walkable) || !doorContains(d, x, z, 0.12))
        continue;
      const { lo, hi } = doorSlab(this.room, d, this.state.doors[d.id].open);
      if (hi - lo > 0.001 && feet >= hi - 0.36) floor = Math.max(floor, hi);
    }
    for (const a of this.platforms) {
      const def = this.definitions.get(this.placements.get(a.id)!.sprite)!;
      const top = a.y + def.height;
      if (
        def.platform &&
        !a.hidden &&
        a.hp > 0 &&
        feet >= top - 0.36 &&
        Math.hypot(a.x - x, a.z - z) < (def.radius ?? def.width * 0.3) + 0.12
      )
        floor = Math.max(floor, top);
    }
    return floor;
  }
  private secret(id: string) {
    if (this.state.secrets.includes(id)) return;
    this.state.secrets.push(id);
    this.events.push({ type: "secret", text: "A SECRET PLACE!", id });
  }
  private openTargets(e: FpsEntity) {
    for (const id of e.targets ?? [])
      if (this.state.doors[id]) this.state.doors[id].target = 1;
  }
  private use() {
    const near = this.nearby();
    if (!near) return;
    if (near.kind === "door") {
      const d = this.config.doors.find((d) => d.id === near.id)!;
      if (d.walkable) return;
      if (d.sealed || d.key && !this.state.player.keys.includes(d.key)) {
        this.events.push({
          type: "message",
          text: d.lockedMessage ?? (d.sealed ? "SEALED" : `${d.key!.toUpperCase()} KEYCARD REQUIRED`),
        });
        return;
      }
      this.state.doors[d.id].target = 1 - this.state.doors[d.id].target;
      this.events.push({ type: "door", text: d.name });
      if (d.secret) this.secret(d.id);
    } else {
      const e = this.placements.get(near.id)!,
        def = this.definitions.get(e.sprite)!;
      if (def.use === "teleport") {
        const dest = def.teleport ?? {
          x: this.config.spawn.x,
          z: this.config.spawn.z,
        };
        const p = this.state.player;
        if (!tileAt(this.room, dest.x, dest.z).solid) {
          p.x = dest.x;
          p.z = dest.z;
          p.y = floorAt(this.room, dest.x, dest.z);
          p.vy = 0;
          if (dest.yaw !== undefined) p.yaw = dest.yaw;
          this.events.push({ type: "door", text: "TELEPORTED" });
        } else
          this.events.push({
            type: "message",
            text: "The pad sparks but nothing happens.",
          });
        return;
      }
      if (def.use === "water") {
        const actor = this.state.actors.find((a) => a.id === e.id)!;
        if (actor.hp > 0 && def.kind === "breakable") {
          this.events.push({ type: "message", text: "SHOOT THE HYDRANT TO RELEASE WATER" });
        } else if (this.state.player.health < 100 && this.state.time - this.waterAt > 0.5) {
          this.state.player.health = Math.min(100, this.state.player.health + 1);
          this.waterAt = this.state.time;
          this.events.push({ type: "pickup", text: "+1 HEALTH" });
        }
        return;
      }
      if (e.hotspotId && !this.allowHotspot(e.hotspotId)) {
        this.events.push({
          type: "message",
          text: "That interaction is locked by the story.",
        });
        return;
      }
      this.openTargets(e);
      if (e.secret) this.secret(e.id);
      if (def.kind === "exit" || e.hotspotId)
        this.events.push({
          type: def.kind === "exit" ? "exit" : "interact",
          id: e.hotspotId,
        });
      else
        this.events.push({
          type: "door",
          text: e.message ?? "Switch activated",
        });
    }
  }
  private hurtPlayer(amount: number) {
    const retro =
      this.config.presentation === "classic" ||
      this.config.presentation === "quake";
    if (retro)
      amount *=
        this.state.skill === 1 ? 0.4 : this.state.skill === 3 ? 1.5 : 1;
    const p = this.state.player;
    if (p.health <= 0) return;
    const absorbed = Math.min(p.armor, amount * 0.55);
    p.armor -= absorbed;
    p.health = Math.max(0, p.health - (amount - absorbed));
    p.hurtAt = this.state.time;
    this.events.push({ type: p.health <= 0 ? "death" : "hurt" });
  }
  private damage(a: FpsActorState, amount: number, explosive = false) {
    if (a.hidden || a.hp <= 0) return;
    const e = this.placements.get(a.id)!,
      def = this.definitions.get(e.sprite)!;
    if (def.damageType === "explosive" && !explosive) return;
    a.hp = Math.max(0, a.hp - amount);
    a.hurtAt = this.state.time;
    a.alerted = true;
    this.events.push({
      type: "hit",
      x: a.x,
      y: a.y + def.height * 0.55,
      z: a.z,
    });
    if (a.hp > 0) return;
    a.diedAt = this.state.time;
    if (def.kind === "enemy") this.state.kills++;
    else a.hidden = !def.brokenImage;
    this.openTargets(e);
    if (e.secret) this.secret(e.id);
    if (def.kind === "explosive")
      this.explode(
        a.x,
        a.y + 0.7,
        a.z,
        def.range ?? 3.5,
        def.damage ?? 90,
        e.message,
        a,
      );
  }
  /** Radial blast shared by C-9 cylinders and splash weapons such as the RPG. */
  private explode(
    x: number,
    y: number,
    z: number,
    radius: number,
    power: number,
    text?: string,
    source?: FpsActorState,
  ) {
    this.events.push({ type: "explosion", x, y, z, text });
    for (const other of this.state.actors)
      if (other !== source && !other.hidden && other.hp > 0) {
        const od = this.definitions.get(this.placements.get(other.id)!.sprite)!;
        if (!["enemy", "explosive", "breakable"].includes(od.kind)) continue;
        const d = Math.hypot(x - other.x, z - other.z, y - other.y - 0.6);
        if (
          d < radius &&
          this.clearLine(x, y, z, other.x, other.y + 0.6, other.z)
        )
          this.damage(other, power * (1 - d / radius), true);
      }
    const p = this.state.player,
      d = Math.hypot(x - p.x, z - p.z, y - p.y - 0.8);
    if (d < radius && this.clearLine(x, y, z, p.x, p.y + 0.8, p.z))
      this.hurtPlayer(power * (1 - d / radius) * 0.5);
  }
  private reload() {
    const p = this.state.player,
      w = this.config.weapons.find((w) => w.id === p.weapon);
    if (
      !w?.clipSize ||
      p.reloadUntil > this.state.time ||
      p.clips[w.id] >= Math.min(w.clipSize, p.ammo[w.id])
    )
      return;
    p.reloadUntil = this.state.time + (w.reloadTime ?? 0.9);
  }
  private fire() {
    const p = this.state.player,
      w = this.config.weapons.find((w) => w.id === p.weapon),
      t = this.state.time;
    if (!w || t - p.shotAt < w.interval || p.reloadUntil > t) return;
    const poolAmmo = (): number =>
      w.ammoPool ? (p.pools?.[w.ammoPool] ?? 0) : p.ammo[w.id];
    const spendAmmo = () => {
      if (w.ammoPool) {
        p.pools ??= {};
        p.pools[w.ammoPool] = Math.max(0, poolAmmo() - 1);
      } else p.ammo[w.id]--;
    };
    if (!w.melee) {
      if (poolAmmo() <= 0) return;
      if (w.clipSize && p.clips[w.id] <= 0) {
        this.reload();
        return;
      }
    }
    p.shotAt = t;
    if (!w.melee) {
      spendAmmo();
      if (w.clipSize) p.clips[w.id]--;
    }
    const quad = (v: number) =>
      p.quadUntil && t < p.quadUntil ? v * 4 : v;
    this.events.push({ type: "shot", id: w.id });
    if (w.projectile) {
      const spec = w.projectile,
        speed = spec.speed ?? 12;
      const dx = -Math.sin(p.yaw),
        dz = -Math.cos(p.yaw),
        slant = Math.hypot(Math.tan(p.pitch), 1);
      const dir = {
        x: dx / slant,
        y: Math.tan(p.pitch) / slant,
        z: dz / slant,
      };
      const eye = p.y + (p.crouched ? 0.85 : 1.45);
      this.state.projectiles ??= [];
      if (this.state.projectiles.length < 128)
        this.state.projectiles.push({
          x: p.x + dir.x * 0.35,
          y: eye + dir.y * 0.35,
          z: p.z + dir.z * 0.35,
          vx: dir.x * speed,
          vy: dir.y * speed,
          vz: dir.z * speed,
          damage: quad(w.damage),
          life: (spec.fuse ?? Math.min(20, w.range / Math.max(0.1, speed))) +
            0.5,
          color: spec.color ?? "#e8d38a",
          gravity: spec.gravity,
          bounce: spec.bounce,
          fuse: spec.fuse,
          splash: spec.splash,
          splashDamage: quad(spec.splashDamage ?? w.damage),
          fromPlayer: true,
          sourceId: "player",
        });
      return;
    }
    const count = w.pellets ?? 1;
    for (let pellet = 0; pellet < count; pellet++) {
      const yaw =
        p.yaw +
        (count === 1 ? 0 : (pellet / (count - 1) - 0.5) * (w.spread ?? 0.12));
      const dx = -Math.sin(yaw),
        dz = -Math.cos(yaw),
        eye = p.y + (p.crouched ? 0.85 : 1.45);
      for (let d = 0.08; d < w.range; d += 0.065) {
        const x = p.x + dx * d,
          z = p.z + dz * d,
          y = eye + Math.tan(p.pitch) * d;
        // Check the target first: a solid enemy's own collision cylinder must
        // not swallow the damage test at point-blank ranges.
        const hit = this.damageable.find((a) => {
          const e = this.placements.get(a.id)!,
            def = this.definitions.get(e.sprite)!;
          return (
            !a.hidden &&
            a.hp > 0 &&
            ["enemy", "explosive", "breakable"].includes(def.kind) &&
            Math.hypot(x - a.x, z - a.z) <
              (def.radius ?? def.width * 0.34) * (e.scale ?? 1) &&
            y > a.y &&
            y < a.y + def.height * (e.scale ?? 1)
          );
        });
        if (hit) {
          if (w.splash)
            this.explode(x, y, z, w.splash, quad(w.splashDamage ?? w.damage));
          this.damage(hit, quad(w.damage), !!w.splash);
          if (this.definitions.get(this.placements.get(hit.id)!.sprite)?.damageType === "explosive" && !w.splash && pellet === 0)
            this.events.push({ type: "hit", x, y, z, text: "THIS CRACK NEEDS AN EXPLOSIVE" });
          break;
        }
        if (this.blocked(x, y, z)) {
          if (w.splash)
            this.explode(
              x - dx * 0.3,
              y,
              z - dz * 0.3,
              w.splash,
              quad(w.splashDamage ?? w.damage),
            );
          else if (pellet === 0) this.events.push({ type: "hit", x, y, z });
          break;
        }
      }
    }
  }
  private equipment(input: FpsInput, dt: number) {
    const p = this.state.player;
    p.activeInventory ??= [];
    p.inventoryAmounts ??= {};
    const usable = (p.inventory ?? []).filter((id) => inventoryAmount(p, id) > 0);
    if (input.cycleInventory && !this.cycleHeld && usable.length) {
      const at = usable.indexOf(p.inventorySelected ?? "");
      p.inventorySelected = usable[(at + Math.sign(input.cycleInventory) + usable.length) % usable.length];
      this.events.push({ type: "message", text: EQUIPMENT[p.inventorySelected]?.name ?? p.inventorySelected });
    }
    this.cycleHeld = !!input.cycleInventory;
    const requested = input.inventory ?? (input.useInventory ? p.inventorySelected : undefined);
    if (requested && !this.equipmentHeld && requested !== "pipebombs") {
      p.inventorySelected = requested;
      const spec = EQUIPMENT[requested], amount = inventoryAmount(p, requested);
      if (!spec || amount <= 0) {
        this.events.push({ type: "message", text: `${spec?.name ?? requested.toUpperCase()} NOT AVAILABLE` });
      } else if (requested === "medkit") {
        const heal = Math.min(amount, Math.max(0, 100 - p.health));
        p.health += heal;
        p.inventoryAmounts.medkit = amount - heal;
        this.events.push({ type: "pickup", text: heal ? `MEDKIT +${Math.ceil(heal)} HEALTH` : "HEALTH ALREADY FULL" });
      } else if (spec.drain) {
        if (p.activeInventory.includes(requested)) {
          p.activeInventory = p.activeInventory.filter((id) => id !== requested);
          if (requested === "holoduke") p.holoduke = undefined;
          this.events.push({ type: "message", text: `${spec.name} OFF` });
        } else {
          p.activeInventory.push(requested);
          if (requested === "holoduke") p.holoduke = { x: p.x, y: p.y, z: p.z };
          this.events.push({ type: "pickup", text: `${spec.name} ON` });
        }
      }
    }
    this.equipmentHeld = !!requested;
    for (const id of [...p.activeInventory]) {
      p.inventoryAmounts[id] = Math.max(0, inventoryAmount(p, id) - (EQUIPMENT[id]?.drain ?? 0) * dt);
      if (p.inventoryAmounts[id] <= 0) {
        p.activeInventory = p.activeInventory.filter((v) => v !== id);
        if (id === "holoduke") p.holoduke = undefined;
        this.events.push({ type: "message", text: `${EQUIPMENT[id]?.name ?? id} DEPLETED` });
      }
    }
    const throwing = input.throwBomb || (input.useInventory && p.inventorySelected === "pipebombs");
    if (throwing && !this.bombHeld) {
      const amount = inventoryAmount(p, "pipebombs");
      if (amount > 0) {
        const x = p.x - Math.sin(p.yaw) * 0.55, z = p.z - Math.cos(p.yaw) * 0.55, y = p.y + 0.8;
        if (!this.blocked(x, y, z, 0.06)) {
          p.inventoryAmounts.pipebombs = amount - 1;
          p.inventorySelected = "pipebombs";
          this.state.pipebombs ??= [];
          this.state.pipebombs.push({ x, y, z, vx: -Math.sin(p.yaw) * 6, vy: 2.3 + Math.sin(p.pitch) * 5, vz: -Math.cos(p.yaw) * 6 });
          this.events.push({ type: "shot", id: "pipebomb", text: "PIPE BOMB THROWN — G TO DETONATE" });
        }
      } else this.events.push({ type: "message", text: "NO PIPE BOMBS" });
    }
    this.bombHeld = !!throwing;
    if (input.detonate && !this.detonateHeld) {
      const bombs = this.state.pipebombs ?? [];
      this.state.pipebombs = [];
      for (const b of bombs) this.explode(b.x, b.y + 0.15, b.z, 4, 160);
    }
    this.detonateHeld = !!input.detonate;
  }
  private tickBombs(dt: number) {
    for (const b of this.state.pipebombs ?? []) {
      const steps = Math.max(1, Math.ceil(Math.hypot(b.vx, b.vz, b.vy) * dt / 0.1)), step = dt / steps;
      for (let i = 0; i < steps; i++) {
        b.vy -= 12 * step;
        const nx = b.x + b.vx * step, nz = b.z + b.vz * step;
        if (this.blocked(nx, b.y, b.z, 0.04)) b.vx *= -0.4; else b.x = nx;
        if (this.blocked(b.x, b.y, nz, 0.04)) b.vz *= -0.4; else b.z = nz;
        const next = b.y + b.vy * step, ground = floorAt(this.room, b.x, b.z) + 0.09;
        if (next < ground) {
          b.y = ground;
          b.vy = Math.abs(b.vy) < 1 ? 0 : -b.vy * 0.35;
          b.vx *= 0.88; b.vz *= 0.88;
        } else if (this.blocked(b.x, next, b.z)) { b.vy *= -0.3; b.vx *= 0.8; b.vz *= 0.8; }
        else b.y = next;
      }
    }
  }
  private tickProjectiles(dt: number) {
    const p = this.state.player;
    this.state.projectiles = (this.state.projectiles ?? []).filter((b) => {
      b.life -= dt;
      if (b.fuse !== undefined) b.fuse -= dt;
      if (b.life <= 0 || (b.fuse !== undefined && b.fuse <= 0)) {
        if (b.splash)
          this.explode(b.x, b.y, b.z, b.splash, b.splashDamage ?? b.damage);
        return false;
      }
      if (b.gravity) b.vy -= b.gravity * dt;
      const steps = Math.max(1, Math.ceil(Math.hypot(b.vx, b.vy, b.vz) * dt / 0.08));
      for (let i = 0; i < steps; i++) {
        const step = dt / steps;
        b.x += b.vx * step; b.y += b.vy * step; b.z += b.vz * step;
        // Target checks before walls: a solid enemy's own collision cylinder
        // must not swallow its own hits at close range.
        if (b.fromPlayer) {
          const hit = this.damageable.find((a) => {
            const e = this.placements.get(a.id)!,
              def = this.definitions.get(e.sprite)!;
            return (
              !a.hidden &&
              a.hp > 0 &&
              ["enemy", "explosive", "breakable"].includes(def.kind) &&
              Math.hypot(b.x - a.x, b.z - a.z) <
                (def.radius ?? def.width * 0.34) * (e.scale ?? 1) &&
              b.y > a.y &&
              b.y < a.y + def.height * (e.scale ?? 1)
            );
          });
          if (hit) {
            if (b.splash)
              this.explode(b.x, b.y, b.z, b.splash, b.splashDamage ?? b.damage);
            this.damage(hit, b.damage, !!b.splash);
            return false;
          }
        } else {
          if (Math.hypot(b.x - p.x, b.z - p.z) < 0.28 && b.y > p.y && b.y < p.y + (p.crouched ? 0.9 : 1.65)) {
            this.hurtPlayer(b.damage); return false;
          }
          const holo = p.holoduke;
          if (holo && inventoryActive(p, "holoduke") && Math.hypot(b.x - holo.x, b.z - holo.z) < 0.3 &&
            b.y > holo.y && b.y < holo.y + 1.85) return false;
        }
        if (this.blocked(b.x, b.y, b.z)) {
          if (b.bounce && Math.abs(b.vx) + Math.abs(b.vy) + Math.abs(b.vz) > 1.2) {
            // Roll back, then reflect the axes that hit. Bounced charges keep
            // their fuse; flat landings shed velocity and settle.
            b.x -= b.vx * step; b.y -= b.vy * step; b.z -= b.vz * step;
            if (this.blocked(b.x + b.vx * step, b.y, b.z)) b.vx *= -(b.bounce ?? 0.4);
            if (this.blocked(b.x, b.y, b.z + b.vz * step)) b.vz *= -(b.bounce ?? 0.4);
            if (this.blocked(b.x, b.y + b.vy * step, b.z)) b.vy *= -(b.bounce ?? 0.4);
            b.vx *= 0.9; b.vz *= 0.9;
            this.events.push({ type: "hit", x: b.x, y: b.y, z: b.z });
            break;
          }
          if (b.splash)
            this.explode(b.x, b.y, b.z, b.splash, b.splashDamage ?? b.damage);
          else this.events.push({ type: "hit", x: b.x, y: b.y, z: b.z });
          return false;
        }
      }
      return true;
    });
  }
  tick(seconds: number, input: FpsInput = {}) {
    const dt = clamp(finite(seconds, 0), 0, 0.05),
      p = this.state.player;
    if (p.health <= 0) return;
    this.state.time += dt;
    const t = this.state.time;
    if (input.weapon && p.weapons.includes(input.weapon) && p.reloadUntil === 0)
      p.weapon = input.weapon;
    p.yaw += (input.turn ?? 0) * dt * 2.1;
    p.pitch = clamp(p.pitch + (input.look ?? 0), -0.85, 0.85);
    // Never stand up into a low duct. A crouch release must pass headroom.
    p.crouched = !!input.crouch;
    if (!p.crouched && !this.canStand(p.x, p.z, p.y)) p.crouched = true;
    this.equipment(input, dt);
    const f = input.forward ?? 0,
      s = input.right ?? 0,
      norm = Math.max(1, Math.hypot(f, s));
    const { dx, dz } = quakeMoveDelta(p.yaw, f / norm, s / norm);
    const wading = tileAt(this.room, p.x, p.z).water;
    const speed =
      (this.config.moveSpeed ?? 3.4) *
      (input.run ? (this.config.runMultiplier ?? 1.65) : 1) *
      (p.crouched ? 0.5 : 1) *
      (inventoryActive(p, "steroids") ? 1.6 : 1) *
      (wading !== undefined && p.y < wading ? 0.55 : 1);
    const steps = Math.max(1, Math.ceil((speed * dt) / 0.18));
    for (let step = 0; step < steps; step++) {
      if (this.canStand(p.x + (dx * dt * speed) / steps, p.z, p.y))
        p.x += (dx * dt * speed) / steps;
      if (this.canStand(p.x, p.z + (dz * dt * speed) / steps, p.y))
        p.z += (dz * dt * speed) / steps;
    }
    const floor = this.groundAt(p.x, p.z, p.y);
    if (p.grounded && floor > p.y && floor - p.y <= 0.36) p.y = floor;
    if (input.jump && !this.jumpHeld && p.grounded && !inventoryActive(p, "jetpack")) {
      p.vy =
        (this.config.jumpSpeed ?? 6.5) *
        (wading !== undefined && p.y < wading ? 0.72 : 1);
      p.grounded = false;
    }
    this.jumpHeld = !!input.jump;
    const previousY = p.y;
    if (inventoryActive(p, "jetpack")) {
      p.vy = input.jump ? 3.4 : input.crouch ? -3.4 : 0;
      p.grounded = false;
      p.y += p.vy * dt;
    } else {
      // Exact constant-acceleration integration. Semi-implicit Euler shaved
      // ~0.16 units off a jump at 20fps, making 1.4-unit ledges unreachable on
      // software WebGL even though the same route passed at 40/60fps.
      p.y += p.vy * dt - 9 * dt * dt;
      p.vy -= 18 * dt;
    }
    const surface = tileAt(this.room, p.x, p.z);
    let ceiling = surface.roof != null && p.y >= surface.roof - 0.02 ? null : surface.ceiling;
    for (const d of this.solidDetails)
      if (d.solid && detailContains(d, p.x, p.z, 0.25) && previousY + (p.crouched ? 0.9 : 1.65) <= d.bottom + 0.02)
        ceiling = Math.min(ceiling ?? Infinity, d.bottom);
    for (const d of this.config.doors) {
      if (!doorContains(d, p.x, p.z, 0.25)) continue;
      const slab = doorSlab(this.room, d, this.state.doors[d.id].open);
      if (slab.hi > slab.lo && previousY + (p.crouched ? 0.9 : 1.65) <= slab.lo + 0.02)
        ceiling = Math.min(ceiling ?? Infinity, slab.lo);
    }
    if (ceiling != null && p.y + (p.crouched ? 0.9 : 1.65) > ceiling) {
      p.y = ceiling - (p.crouched ? 0.9 : 1.65);
      p.vy = Math.min(0, p.vy);
    }
    if (p.y <= floor) {
      if (p.vy < -10) this.hurtPlayer((-p.vy - 10) * 4);
      p.y = floor;
      p.vy = 0;
      p.grounded = true;
    } else p.grounded = false;
    for (const d of this.config.doors) {
      const s = this.state.doors[d.id];
      // Don't close a moving slab through a player.
      if (
        d.lift === undefined &&
        !d.walkable &&
        !d.sealed &&
        (!d.key || p.keys.includes(d.key)) &&
        s.target === 0 &&
        doorContains(d, p.x, p.z, 0.4) &&
        Math.abs(p.y - (d.bottom ?? floorAt(this.room, d.x, d.z))) < d.height
      )
        s.target = 1;
      const before = doorSlab(this.room, d, s.open).hi;
      s.open += clamp(
        s.target - s.open,
        -dt * (d.speed ?? 1.5),
        dt * (d.speed ?? 1.5),
      );
      // Riders travel with a lift instead of falling through or clipping it.
      if (
        d.lift !== undefined &&
        p.grounded &&
        doorContains(d, p.x, p.z, 0.12) &&
        Math.abs(p.y - before) < 0.1
      )
        p.y = doorSlab(this.room, d, s.open).hi;
    }
    if (input.use && !this.useHeld) this.use();
    this.useHeld = !!input.use;
    if (input.reload) this.reload();
    // Quad Damage runs on world time; a restored save keeps its expiry.
    if (p.quadUntil && p.quadUntil <= t) p.quadUntil = 0;
    // Damaging floors (Quake slime / lava). A biosuit negates them, and a
    // slab or ledge raised above the pool keeps you out of it.
    const hazard = tileAt(this.room, p.x, p.z).hazard;
    if (
      hazard &&
      !inventoryActive(p, "biosuit") &&
      Math.abs(p.y - floorAt(this.room, p.x, p.z)) < 0.75
    ) {
      this.hazardAt += dt;
      if (this.hazardAt >= (hazard.every || 1)) {
        this.hazardAt = 0;
        this.hurtPlayer(hazard.damage ?? 4);
        if (hazard.message)
          this.events.push({ type: "hurt", text: hazard.message });
      }
    } else this.hazardAt = 0;
    if (p.reloadUntil && t >= p.reloadUntil) {
      const w = this.config.weapons.find((w) => w.id === p.weapon)!;
      p.clips[w.id] = Math.min(w.clipSize ?? 999, p.ammo[w.id]);
      p.reloadUntil = 0;
    }
    if (input.fire) this.fire();
    this.tickBombs(dt);
    if (input.quickKick && t - (p.kickAt ?? -100) > 0.65) {
      p.kickAt = t;
      this.events.push({ type: "kick" });
      const hit = this.state.actors.find((a) => {
        const def = this.definitions.get(this.placements.get(a.id)!.sprite)!;
        const dx = a.x - p.x, dz = a.z - p.z, dist = Math.hypot(dx, dz);
        return !a.hidden && a.hp > 0 && ["enemy", "breakable", "explosive"].includes(def.kind) &&
          dist < 1.7 && Math.abs(a.y - p.y) < 1.5 &&
          (-Math.sin(p.yaw) * dx - Math.cos(p.yaw) * dz) / Math.max(0.01, dist) > 0.72 &&
          this.clearLine(p.x, p.y + 0.8, p.z, a.x, a.y + 0.8, a.z);
      });
      if (hit)
        this.damage(hit, p.quadUntil && t < p.quadUntil ? 72 : 18);
    }
    for (const a of this.state.actors) {
      if (a.hidden || a.hp <= 0) continue;
      const e = this.placements.get(a.id)!,
        def = this.definitions.get(e.sprite)!;
      const dist = Math.hypot(a.x - p.x, a.z - p.z);
      // Ground pickups are collected after landing damage, not a fraction of
      // a second before it. Explicitly elevated pickups remain reachable in air.
      const pickupReachable =
        p.grounded || p.vy >= 0 || a.y - floorAt(this.room, a.x, a.z) > 0.5;
      if (
        def.pickup &&
        dist < 0.7 &&
        Math.abs(a.y - p.y) < 1.2 &&
        pickupReachable &&
        this.clearLine(p.x, p.y + 0.5, p.z, a.x, a.y + 0.25, a.z)
      ) {
        const pick = def.pickup,
          amount = pick.amount ?? 25,
          cap = pick.max ?? 100;
        const ammoWeapon = pick.weaponId
          ? this.config.weapons.find((w) => w.id === pick.weaponId)
          : undefined;
        const poolAmount = ammoWeapon?.ammoPool
          ? (p.pools?.[ammoWeapon.ammoPool] ?? 0)
          : 0;
        if (
          (pick.type === "health" && p.health >= cap) ||
          (pick.type === "armor" && p.armor >= cap) ||
          (pick.type === "quad" && (p.quadUntil ?? 0) > t) ||
          (pick.type === "item" &&
            !!pick.itemId &&
            inventoryAmount(p, pick.itemId) >= (pick.itemId === "pipebombs" ? 50 : 100)) ||
          (pick.type === "ammo" &&
            pick.weaponId &&
            (ammoWeapon?.ammoPool
              ? poolAmount >= (pick.max ?? ammoWeapon?.maxAmmo ?? 999)
              : (p.ammo[pick.weaponId] ?? 0) >= (ammoWeapon?.maxAmmo ?? 999)))
        )
          continue;
        if (pick.type === "health") p.health = Math.min(cap, p.health + amount);
        if (pick.type === "armor") p.armor = Math.min(cap, p.armor + amount);
        if (pick.type === "quad")
          p.quadUntil = t + Math.max(1, pick.duration ?? 30);
        if (pick.type === "item" && pick.itemId) {
          const id = pick.itemId;
          const current = inventoryAmount(p, id);
          if (!(p.inventory ?? []).includes(id)) p.inventory = [...(p.inventory ?? []), id];
          p.inventoryAmounts ??= {};
          p.inventoryAmounts[id] = Math.min(id === "pipebombs" ? 50 : 100,
            current + (pick.amount ?? EQUIPMENT[id]?.charge ?? 100));
          p.inventorySelected = id;
        }
        if (pick.type === "key" && pick.keyId && !p.keys.includes(pick.keyId))
          p.keys.push(pick.keyId);
        if ((pick.type === "ammo" || pick.type === "weapon") && pick.weaponId) {
          const target = this.config.weapons.find(
            (w) => w.id === pick.weaponId,
          );
          if (target?.ammoPool) {
            p.pools ??= {};
            p.pools[target.ammoPool] = Math.min(
              pick.max ?? target.maxAmmo ?? 999,
              (p.pools[target.ammoPool] ?? 0) + amount,
            );
            if (pick.type === "weapon" && !p.weapons.includes(pick.weaponId)) {
              p.weapons.push(pick.weaponId);
              p.weapon = pick.weaponId;
              p.clips[pick.weaponId] = Math.min(
                amount,
                target.clipSize ?? amount,
              );
              p.reloadUntil = 0;
            }
          } else {
            p.ammo[pick.weaponId] = Math.min(
              target?.maxAmmo ?? 999,
              (p.ammo[pick.weaponId] ?? 0) + amount,
            );
            if (pick.type === "weapon" && !p.weapons.includes(pick.weaponId)) {
              p.weapons.push(pick.weaponId);
              p.weapon = pick.weaponId;
              p.clips[p.weapon] = Math.min(
                amount,
                target?.clipSize ?? amount,
              );
              p.reloadUntil = 0;
            }
          }
        }
        a.hidden = true;
        this.events.push({ type: "pickup", text: def.name });
        this.openTargets(e);
        if (e.secret) this.secret(e.id);
      }
      if (def.kind !== "enemy") continue;
      const decoy = inventoryActive(p, "holoduke") && p.holoduke &&
        Math.hypot(a.x - p.holoduke.x, a.z - p.holoduke.z) < dist + 3 &&
        this.clearLine(a.x, a.y + 1.1, a.z, p.holoduke.x, p.holoduke.y + 1, p.holoduke.z)
        ? p.holoduke : undefined;
      const target = decoy ?? p;
      const targetDist = Math.hypot(a.x - target.x, a.z - target.z);
      if (targetDist > (def.range ?? 16)) continue;
      const sight = this.clearLine(a.x, a.y + Math.min(1.1, def.height * 0.75), a.z, target.x, target.y + 1.15, target.z);
      if (!sight) continue;
      const retro =
        this.config.presentation === "classic" ||
        this.config.presentation === "quake";
      if (!a.alerted && retro) a.attackAt = t + 0.6;
      a.alerted = true;
      a.yaw = Math.atan2(-(target.x - a.x), -(target.z - a.z));
      const stopAt =
        def.attack === "melee" ? Math.max(0.5, (def.meleeRange ?? 1.1) * 0.55) : 3;
      if (targetDist > stopAt && Math.abs(a.y - target.y) < 2 && def.speed !== 0) {
        const speed = def.speed ?? 0.9,
          nx = a.x + ((target.x - a.x) / targetDist) * dt * speed,
          nz = a.z + ((target.z - a.z) / targetDist) * dt * speed;
        // Guards step up/down small heights but do not walk off ledges.
        const stepOk = (x: number, z: number) =>
          this.canStand(x, z, a.y, def.radius ?? 0.25, a.id) &&
          a.y - floorAt(this.room, x, z) < 0.5;
        if (stepOk(nx, a.z)) a.x = nx;
        if (stepOk(a.x, nz)) a.z = nz;
        a.y = floorAt(this.room, a.x, a.z);
      }
      if (t >= a.attackAt && t - a.hurtAt > 0.25) {
        if (def.attack === "projectile") {
          const y = a.y + Math.min(1.15, def.height * 0.75), speed = def.projectileSpeed ?? 8;
          const dx = target.x - a.x, dy = target.y + 0.85 - y, dz = target.z - a.z;
          const length = Math.max(0.01, Math.hypot(dx, dy, dz));
          const vx = dx / length * speed, vy = dy / length * speed, vz = dz / length * speed;
          this.state.projectiles ??= [];
          if (this.state.projectiles.length < 128) this.state.projectiles.push({
            x: a.x + dx / length * 0.4, y: y + dy / length * 0.4, z: a.z + dz / length * 0.4,
            vx, vy, vz, damage: def.damage ?? 5, life: (def.range ?? 16) / speed + 0.5,
            color: def.projectileColor ?? "#8cfa47", sourceId: a.id,
          });
          this.events.push({ type: "shot", id: "laser" });
        } else if (def.attack === "melee") {
          const reach = (def.meleeRange ?? 1.1) + (def.radius ?? 0.3);
          if (
            !decoy &&
            targetDist < reach &&
            Math.abs(a.y - target.y) < 1.4
          ) {
            this.hurtPlayer(def.damage ?? 5);
            this.events.push({ type: "shot", id: "bite" });
          }
        } else if (!decoy)
          this.hurtPlayer(
            (def.damage ?? 4) * (retro ? Math.max(0.25, 1 - targetDist / 20) : 1),
          );
        a.attackAt = t + (def.attackInterval ?? 1.7);
      }
    }
    this.tickProjectiles(dt);
    for (const zone of this.config.zones ?? [])
      if (
        p.x >= zone.x &&
        p.x < zone.x + zone.w &&
        p.z >= zone.z &&
        p.z < zone.z + zone.d &&
        (zone.bottom === undefined || p.y >= zone.bottom) &&
        (zone.top === undefined || p.y < zone.top)
      ) {
        if (this.state.visited.includes(zone.id)) continue;
        // A walk-in trigger (the slipgate) fires the story hotspot once. A
        // locked trigger stays unvisited so it can fire when it unlocks.
        if (zone.hotspotId) {
          if (!this.allowHotspot(zone.hotspotId)) continue;
          this.state.visited.push(zone.id);
          if (zone.secret) this.secret(zone.id);
          this.events.push({ type: "interact", id: zone.hotspotId });
        } else {
          this.state.visited.push(zone.id);
          if (zone.secret) this.secret(zone.id);
          this.events.push({ type: "message", text: zone.message ?? zone.name });
        }
      }
  }
}
