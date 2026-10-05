import type { Hotspot, QuakeModeSettings } from "../../types";
import { spriteSheetIssues } from "../spriteSheet";
import { tileAt } from "./simulation";
import { tileFloor } from "./geometry";
export interface FpsIssue {
  severity: "error" | "warning";
  message: string;
}
/** Studio Check / CLI validation for the action layer, not just its story graph. */
export function validateFpsRoom(
  q: QuakeModeSettings,
  hotspots: Hotspot[] = [],
): FpsIssue[] {
  const f = q.fps,
    issues: FpsIssue[] = [];
  if (!f) return issues;
  const error = (message: string) =>
    issues.push({ severity: "error", message: `First-person: ${message}` });
  const warn = (message: string) =>
    issues.push({ severity: "warning", message: `First-person: ${message}` });
  const number = (value: unknown, min: number, max: number, label: string) => {
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < min ||
      value > max
    )
      error(`${label} must be ${min}–${max}.`);
  };
  if (f.version !== 1) error("unsupported action-layer version.");
  if (
    !Array.isArray(q.map) ||
    q.map.length < 3 ||
    q.map.length > 96 ||
    !q.map.every(
      (r) => typeof r === "string" && r.length === q.map[0].length,
    ) ||
    q.map[0].length < 3 ||
    q.map[0].length > 96
  ) {
    error("map must be rectangular, 3–96 cells on each side.");
    return issues;
  }
  for (const key of [
    "sprites",
    "entities",
    "doors",
    "weapons",
    "materials",
  ] as const)
    if (
      !Array.isArray(f[key]) ||
      f[key].some((x) => !x || typeof x !== "object")
    ) {
      error(`${key} must be an array of records.`);
      return issues;
    }
  if (!f.tiles || typeof f.tiles !== "object" || !f.spawn) {
    error("missing tile palette or spawn.");
    return issues;
  }
  const ids = (xs: { id: string }[], label: string) => {
    const seen = new Set<string>();
    for (const x of xs) {
      if (!x.id || seen.has(x.id))
        error(`${label} has a missing/duplicate id: ${x.id}`);
      seen.add(x.id);
    }
    return seen;
  };
  const mats = ids(f.materials, "materials"),
    sprites = ids(f.sprites, "sprites"),
    doors = ids(f.doors, "doors"),
    weapons = ids(f.weapons, "weapons");
  ids(f.entities, "placements");
  if (!f.weapons.length) error("add at least one starting weapon.");
  const position = (x: number, z: number, label: string) => {
    number(x, 0, q.map[0].length - 0.001, `${label} X`);
    number(z, 0, q.map.length - 0.001, `${label} Z`);
  };
  position(f.spawn.x, f.spawn.z, "spawn");
  number(f.spawn.yaw, -1000, 1000, "spawn facing");
  if (tileAt(q, f.spawn.x, f.spawn.z).solid)
    error("spawn is inside a solid wall.");
  number(q.fov ?? 90, 50, 120, "horizontal FOV");
  number(f.renderHeight ?? 360, 180, 720, "render height");
  number(f.health ?? 100, 1, 200, "starting health");
  number(f.moveSpeed ?? 3.4, 0.2, 12, "walk speed");
  number(f.runMultiplier ?? 1.65, 1, 3, "run multiplier");
  number(f.jumpSpeed ?? 6.5, 1, 12, "jump impulse");
  number(f.fogDistance ?? 65, 5, 150, "fog distance");
  if (f.waterColor && !/^#[0-9a-f]{6}$/i.test(f.waterColor))
    error("water tint needs a six-digit color.");
  if (f.defaultSkill !== undefined && ![1, 2, 3].includes(f.defaultSkill)) error("skill must be 1, 2 or 3.");
  if (f.presentation !== undefined && !["classic", "quake"].includes(f.presentation)) error("unknown presentation.");
  if (f.skyMode !== undefined && !["sphere", "cylinder"].includes(f.skyMode)) error("unknown sky projection.");
  for (const m of f.materials) {
    if (m.repeat !== undefined) number(m.repeat, 0.01, 32, `${m.id} texture repeat`);
    if (m.opacity !== undefined) number(m.opacity, 0, 1, `${m.id} opacity`);
    if (m.alphaTest !== undefined) number(m.alphaTest, 0, 1, `${m.id} alpha cutout`);
  }
  const slope = (s: { x?: number; z?: number } | undefined, label: string) => {
    if (!s) return;
    number(s.x ?? 0, -4, 4, `${label} east slope`);
    number(s.z ?? 0, -4, 4, `${label} south slope`);
  };
  for (const [key, t] of Object.entries(f.tiles)) {
    if (key.length !== 1 || !t) {
      error(`invalid surface tile ${key}`);
      continue;
    }
    number(t.floor ?? 0, -16, 48, `${key} floor`);
    slope(t.slope, key);
    if (t.roof !== undefined) {
      number(t.roof, -15, 64, `${key} roof`);
      if (t.ceiling == null || t.roof <= t.ceiling) error(`${key} roof must be above an enclosed ceiling.`);
    }
    if (t.solid) number(t.wallHeight ?? 10, 0.1, 64, `${key} wall height`);
    if (t.ceiling != null) {
      number(t.ceiling, -15, 64, `${key} ceiling`);
      if (t.ceiling - Math.max(tileFloor(t, 0, 0), tileFloor(t, 1, 0), tileFloor(t, 0, 1), tileFloor(t, 1, 1)) < 0.9)
        error(`${key} has insufficient headroom, even crouched.`);
    }
    number(t.light ?? 0.82, 0.05, 2, `${key} brightness`);
    if (t.hazard) {
      number(t.hazard.damage, 0.1, 500, `${key} hazard damage`);
      number(t.hazard.every, 0.1, 30, `${key} hazard interval`);
    }
    if (t.water !== undefined) number(t.water, -15, 40, `${key} water surface`);
    for (const id of [t.floorMaterial, t.wallMaterial, t.ceilingMaterial])
      if (id && !mats.has(id))
        error(`${key} references missing material ${id}.`);
  }
  for (const s of f.sprites) {
    number(s.width, 0.02, 32, `${s.id} width`);
    number(s.height, 0.02, 32, `${s.id} height`);
    if (!s.image && !s.sheet?.image)
      warn(`${s.id} needs an image (currently a colored placeholder).`);
    if (s.sheet)
      spriteSheetIssues(s.sheet, `${s.id} sprite sheet`).forEach((message) =>
        error(message),
      );
    if (["enemy", "explosive", "breakable"].includes(s.kind))
      number(s.health ?? 1, 1, 10000, `${s.id} hit points`);
    if (s.kind === "pickup" && !s.pickup)
      error(`${s.id} has no pickup effect.`);
    if (
      s.pickup &&
      ["ammo", "weapon"].includes(s.pickup.type) &&
      !weapons.has(s.pickup.weaponId ?? "")
    )
      error(`${s.id} pickup references a missing weapon.`);
    if (s.pickup?.type === "key" && !s.pickup.keyId)
      error(`${s.id} needs a key ID.`);
    if (s.pickup?.type === "item" && !s.pickup.itemId)
      error(`${s.id} needs an inventory item ID.`);
    if (s.attack && !["hitscan", "projectile", "melee"].includes(s.attack)) error(`${s.id} has an unknown attack type.`);
    if (s.meleeRange !== undefined) number(s.meleeRange, 0.1, 10, `${s.id} melee reach`);
    if (s.projectileSpeed !== undefined) number(s.projectileSpeed, 1, 80, `${s.id} projectile speed`);
    if (s.projectileColor && !/^#[0-9a-f]{6}$/i.test(s.projectileColor)) error(`${s.id} needs a six-digit projectile color.`);
    if (s.damageType && !["any", "explosive"].includes(s.damageType)) error(`${s.id} has an unknown damage type.`);
    if (s.use && !["water", "arcade", "teleport"].includes(s.use)) error(`${s.id} has an unknown use behavior.`);
    if (s.use === "teleport" && s.teleport) {
      number(s.teleport.x, 0, 100, `${s.id} teleport X`);
      number(s.teleport.z, 0, 100, `${s.id} teleport Z`);
    }
    if (s.pickup?.amount !== undefined) number(s.pickup.amount, 0, 999, `${s.id} pickup amount`);
    if (s.pickup?.max !== undefined)
      number(s.pickup.max, 1, 400, `${s.id} pickup cap`);
    if (s.pickup?.duration !== undefined)
      number(s.pickup.duration, 1, 600, `${s.id} pickup duration`);
  }
  for (const e of f.entities) {
    position(e.x, e.z, e.id);
    if (e.y !== undefined) number(e.y, -16, 64, `${e.id} elevation`);
    number(e.scale ?? 1, 0.05, 20, `${e.id} scale`);
    if (!sprites.has(e.sprite)) {
      error(`${e.id} references missing sprite ${e.sprite}.`);
      continue;
    }
    if (e.attachedTo && !doors.has(e.attachedTo)) error(`${e.id} is attached to missing door ${e.attachedTo}.`);
    if (e.flyby) {
      number(e.flyby.duration, 0.1, 60, `${e.id} fly-by duration`);
      for (const axis of ["x", "y", "z"] as const) number(e.flyby[axis], -150, 150, `${e.id} fly-by ${axis}`);
    }
    for (const id of e.targets ?? [])
      if (!doors.has(id)) error(`${e.id} targets missing door ${id}.`);
    if (e.hotspotId && !hotspots.some((h) => h.id === e.hotspotId))
      error(`${e.id} references missing story hotspot ${e.hotspotId}.`);
    const s = f.sprites.find((s) => s.id === e.sprite)!;
    if (s.kind === "exit" && !e.hotspotId)
      warn(`${e.id} is an exit without a linked story hotspot.`);
    if (
      tileAt(q, e.x, e.z).solid &&
      (e.y ?? 0) < (tileAt(q, e.x, e.z).wallHeight ?? 10) &&
      s.facing !== "wall" &&
      s.facing !== "floor"
    )
      warn(`${e.id} is inside a solid tile.`);
  }
  for (const d of f.doors) {
    position(d.x, d.z, d.id);
    if (d.motion && !["raise", "split", "break"].includes(d.motion)) error(`${d.id} has an unknown door motion.`);
    if (d.motion === "split" && (d.lift !== undefined || d.walkable)) error(`${d.id} cannot be both a split door and a standing slab.`);
    number(d.width, 0.2, 16, `${d.id} width`);
    number(d.height, 0.1, 16, `${d.id} height`);
    number(d.speed ?? 1.5, 0.1, 20, `${d.id} speed`);
    if (d.depth !== undefined) number(d.depth, 0.1, 16, `${d.id} depth`);
    if (d.lift !== undefined) number(d.lift, 0.1, 40, `${d.id} lift travel`);
    if (d.material && !mats.has(d.material))
      error(`${d.id} references missing material ${d.material}.`);
    if (
      d.key && !d.sealed &&
      !f.sprites.some((s) => s.pickup?.keyId === d.key) &&
      !f.entities.some((e) => e.targets?.includes(d.id))
    )
      warn(
        `${d.id} requires key ${d.key}, but no pickup or linked switch/explosive supplies a way to open it.`,
      );
  }
  for (const list of ["details", "zones"] as const) {
    if (f[list] !== undefined && (!Array.isArray(f[list]) || f[list]!.some((v) => !v || typeof v !== "object"))) {
      error(`${list} must be an array of records.`); return issues;
    }
    ids(f[list] ?? [], list);
  }
  for (const d of f.details ?? []) {
    position(d.x, d.z, d.id);
    number(d.bottom, -16, 64, `${d.id} detail elevation`);
    number(d.width, 0.001, 96, `${d.id} detail width`);
    number(d.depth, 0.001, 96, `${d.id} detail depth`);
    number(d.height, 0.001, 64, `${d.id} detail height`);
    number(d.light ?? 0.82, 0.05, 2, `${d.id} detail brightness`);
    slope(d.slope, d.id);
    if (d.height + Math.min(0, (d.slope?.x ?? 0) * d.width) + Math.min(0, (d.slope?.z ?? 0) * d.depth) <= 0)
      error(`${d.id} slope inverts the detail's top.`);
    if (!mats.has(d.material) || d.topMaterial && !mats.has(d.topMaterial)) error(`${d.id} detail references a missing material.`);
  }
  for (const z of f.zones ?? []) {
    position(z.x, z.z, z.id);
    number(z.w, 0.01, 96, `${z.id} zone width`); number(z.d, 0.01, 96, `${z.id} zone depth`);
    if (z.bottom !== undefined) number(z.bottom, -16, 64, `${z.id} zone bottom`);
    if (z.top !== undefined) number(z.top, -16, 64, `${z.id} zone top`);
    if (z.bottom !== undefined && z.top !== undefined && z.top <= z.bottom) error(`${z.id} zone top must exceed its bottom.`);
    if (z.hotspotId && !hotspots.some((h) => h.id === z.hotspotId))
      error(`${z.id} references missing story hotspot ${z.hotspotId}.`);
  }
  const slots = new Set<number>();
  for (const w of f.weapons) {
    if (w.slot !== undefined) {
      number(w.slot, 0, 9, `${w.id} keyboard slot`);
      if (!Number.isInteger(w.slot) || slots.has(w.slot)) error(`${w.id} needs a unique integer keyboard slot.`);
      slots.add(w.slot);
    }
    if (w.maxAmmo !== undefined) number(w.maxAmmo, w.ammo, 999, `${w.id} maximum ammo`);
    if (w.view?.scale !== undefined)
      number(w.view.scale, 0.2, 2, `${w.id} view scale`);
    if (w.view?.x !== undefined)
      number(w.view.x, -1.5, 1.5, `${w.id} view horizontal offset`);
    if (w.view?.y !== undefined)
      number(w.view.y, -1.6, 1, `${w.id} view vertical offset`);
    number(w.damage, 0.1, 5000, `${w.id} damage`);
    number(w.interval, 0.04, 10, `${w.id} interval`);
    number(w.range, 0.2, 100, `${w.id} range`);
    number(w.pellets ?? 1, 1, 32, `${w.id} pellets`);
    if (w.splash !== undefined) number(w.splash, 0.2, 20, `${w.id} splash`);
    number(w.ammo, 0, 999, `${w.id} ammo`);
    if (w.clipSize !== undefined)
      number(w.clipSize, 1, 999, `${w.id} clip size`);
    if (w.ammoPool && !/^[a-z0-9-]{1,32}$/i.test(w.ammoPool))
      error(`${w.id} needs a short ammo pool id (letters, digits, dashes).`);
    if (w.projectile) {
      number(w.projectile.speed, 0.5, 80, `${w.id} projectile speed`);
      if (w.projectile.gravity !== undefined) number(w.projectile.gravity, -50, 50, `${w.id} projectile gravity`);
      if (w.projectile.bounce !== undefined) number(w.projectile.bounce, 0, 1, `${w.id} projectile bounce`);
      if (w.projectile.fuse !== undefined) number(w.projectile.fuse, 0.05, 30, `${w.id} projectile fuse`);
      if (w.projectile.splash !== undefined) number(w.projectile.splash, 0.2, 20, `${w.id} projectile splash`);
      if (w.projectile.splashDamage !== undefined) number(w.projectile.splashDamage, 0.1, 5000, `${w.id} projectile splash damage`);
      if (w.projectile.color && !/^#[0-9a-f]{6}$/i.test(w.projectile.color)) error(`${w.id} needs a six-digit projectile color.`);
    }
    if (w.sheet)
      spriteSheetIssues(w.sheet, `${w.id} weapon sheet`).forEach(error);
  }
  if (f.presentation !== undefined && !["classic", "quake"].includes(f.presentation))
    error("unknown presentation.");
  if (f.skillLabels !== undefined && (!Array.isArray(f.skillLabels) || f.skillLabels.length !== 3 || f.skillLabels.some((v) => typeof v !== "string")))
    error("skill labels must be an array of three names.");
  return issues;
}
