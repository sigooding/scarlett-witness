import type { Story, QuakeModeSettings } from "../types";
import type { FpsEntity, FpsSprite, FpsWeapon } from "../game/fps/types";
import { createFpsSettings } from "../game/fps/presets";
const art = (name: string) => `/img/quake-e1m1/${name}`;
const D = Math.PI / 180;

/**
 * The Slipgate Complex (E1M1-style) — an authored, editable reconstruction of
 * Quake's opening level, not an imported MAP/BSP. All art is newly drawn for
 * this engine (scripts/quake/prepare-art.py). See docs/quake-e1m1.md.
 *
 * Route (matches the original walkthrough):
 *  start hall → ledge (shoot the wall: secret 1 shells) → elevator room door
 *  → elevator down → yard (two 25-health) → bridge → big building door →
 *  lobby → pillar room (C-9, shells) → globe room (globe lift, 15 health,
 *  second globe → quad secret) → stair hall → catwalk elevator → bridge →
 *  NAILGUN (alcove grunt, nails) → overlook balcony → button (movable ledge)
 *  → two grunts → globe → double-barrelled shotgun secret → archway →
 *  ramp room (three buttons, biosuit) → slime → swim to the yellow-armor
 *  lift (secret 6, teleporter back over the lobby) → three-button door →
 *  exit corridor → slipgate room (exit wall opens secret 2's back door) →
 *  slipgate exit.
 * Water route: drop off the bridge → water passage → 100-health cave
 * (secret 2) → under the start building → elevator → green armor room.
 *
 * World units: X east, Z south, Y up. 72×46 cells.
 */
export function quakeE1M1Room(): QuakeModeSettings {
  const fps = createFpsSettings();
  const W = 72,
    H = 46;
  const grid = Array.from({ length: H }, () => Array(W).fill("#") as string[]);
  const rect = (x: number, z: number, w: number, d: number, tile: string) => {
    for (let j = z; j < z + d; j++)
      for (let i = x; i < x + w; i++) grid[j][i] = tile;
  };
  const T = fps.tiles;
  const tile = (
    key: string,
    name: string,
    floor: number,
    ceiling: number | null,
    floorMaterial: string,
    wallMaterial: string,
    light = 0.8,
    extra: Partial<(typeof T)[string]> = {},
  ) => {
    T[key] = {
      name,
      floor,
      ceiling,
      floorMaterial,
      wallMaterial,
      light,
      ...extra,
    };
    return key;
  };
  const solid = (
    key: string,
    name: string,
    wallHeight: number,
    wallMaterial: string,
  ) => {
    T[key] = { name, solid: true, wallHeight, wallMaterial };
    return key;
  };

  // ---- materials -----------------------------------------------------------
  const mat = (id: string, name: string, image?: string, color?: string, repeat = 1) =>
    fps.materials.push({ id, name, image, color, repeat });
  mat("tech", "Metal tech", art("tex-tech-panel.png"), undefined, 2);
  mat("tech-trim", "Tech trim", art("tex-tech-trim.png"), undefined, 2);
  mat("metal-floor", "Metal floor", art("tex-metal-floor.png"), undefined, 2);
  mat("brown-brick", "Brown brick", art("tex-brown-brick.png"), undefined, 2);
  mat("gray-block", "Gray block", art("tex-gray-block.png"), undefined, 2);
  mat("stone", "Stone", art("tex-stone.png"), undefined, 2);
  mat("dark-rock", "Dark rock", art("tex-dark-rock.png"), undefined, 2);
  mat("wood", "Wood planks", art("tex-wood.png"), undefined, 2);
  mat("crate", "Crate planks", art("tex-crate.png"), undefined, 2);
  mat("slime-wall", "Slime masonry", art("tex-slime-wall.png"), undefined, 2);
  mat("slime-floor", "Slime", art("tex-slipgate.png"), "#7cb14e", 2.5);
  mat("water", "Water", art("tex-water.png"), undefined, 1.5);
  mat("ceil", "Ceiling", art("tex-ceil.png"), undefined, 2);
  mat("light-panel", "Light panel", art("tex-light.png"), undefined, 1);
  mat("pipes", "Pipe wall", art("tex-pipes.png"), undefined, 2);

  // ---- surface tiles --------------------------------------------------------
  const startFloor = tile("A", "Start floor", 0, 4, "metal-floor", "tech-trim", 0.92);
  const hallFloor = tile("B", "Hall floor", 0, 4, "metal-floor", "brown-brick", 0.85);
  const armorFloor = tile("C", "Armor room floor", 0, 3, "metal-floor", "gray-block", 0.8);
  const ledgeFloor = tile("D", "Ledge floor", 0.5, 3, "metal-floor", "brown-brick", 0.9);
  const yardFloor = tile("E", "Yard floor", -2, null, "stone", "dark-rock", 0.95);
  const bridgeFloor = tile("F", "Bridge floor", -1.7, null, "wood", "dark-rock", 1);
  const lobbyFloor = tile("G", "Lobby floor", -2, 2, "metal-floor", "brown-brick", 0.72);
  const pillarFloor = tile("H", "Pillar room floor", -2, 2, "stone", "gray-block", 0.68);
  const globeFloor = tile("I", "Globe room floor", -2, 2, "metal-floor", "tech", 0.7);
  const ledgeHigh = tile("J", "Upper ledge", -1, 2, "metal-floor", "tech", 0.75);
  const stairFloor = tile("K", "Stair hall floor", -2, 2, "metal-floor", "gray-block", 0.7);
  const midFloor = tile("L", "Mid room floor", -1, 2, "metal-floor", "gray-block", 0.75);
  const catFloor = tile("M", "Catwalk floor", 0, 2.5, "metal-floor", "tech-trim", 0.8);
  const roomFloor = tile("O", "Slime room floor", -2, 4, "slime-wall", "slime-wall", 0.66);
  const slipFloor = tile("P", "Slipgate room floor", -4, 1, "metal-floor", "tech", 0.7);
  const s6Floor = tile("Q", "Secret room floor", -4, 1.5, "metal-floor", "tech", 0.75);
  const passageFloor = tile("R", "Quad passage floor", -1, 2, "metal-floor", "tech", 0.6);
  const tunnelFloor = tile("T", "Lift tunnel", -2, 0, "stone", "dark-rock", 0.6);
  const caveFloor = tile("V", "Cave floor", -4.2, -1, "stone", "dark-rock", 0.5);
  const waterBed = tile("W", "Water passage bed", -4.2, 0.5, "water", "dark-rock", 0.55, {
    water: -3.5,
  });
  const liftWell = tile("w", "Water lift well", -4.2, 3, "water", "dark-rock", 0.55, {
    water: -3.5,
  });
  const troughBed = tile("X", "Trough bed", -3.6, 0, "water", "dark-rock", 0.6, {
    water: -3.0,
  });
  const shaftFloor = tile("Y", "Lift shaft floor", -2, 3, "metal-floor", "tech-trim", 0.7);
  const catShaft = tile("p", "Catwalk lift shaft", -1, 2.5, "metal-floor", "tech-trim", 0.8);
  const eRoomFloor = tile("Z", "Elevator room floor", 0, 3, "metal-floor", "gray-block", 0.75);
  const notchFloor = tile("n", "Tunnel mouth", -2, -0.3, "stone", "dark-rock", 0.7);
  const slime = tile("1", "Slime", -8, 4, "slime-floor", "slime-wall", 0.6, {
    hazard: { damage: 5, every: 1, message: "You are in the slime!" },
  });
  const pillarBlock = solid("9", "Pillar", 2, "gray-block");
  // "." becomes a generic interior floor for door mouths at height 0.
  T["."] = {
    name: "Interior",
    floor: 0,
    ceiling: 4,
    floorMaterial: "metal-floor",
    wallMaterial: "gray-block",
    light: 0.8,
  };
  const bottomFloor = tile("m", "Bottom floor", -6, 8, "slime-wall", "slime-wall", 0.5);
  // Continuous ramps and stairs: per-cell step tiles so the rise stays within
  // the walker's 0.36 step-up (the Duke pattern; one sloping tile across
  // several cells would sawtooth at every cell boundary). Keys are picked at
  // paint time so they can never collide with the fixed surface tiles.
  const KEY_POOL = [
    ..."abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    ..."!$%&*+-/=?@^_~|:;<>[]{}()",
  ];
  const pickKey = () => {
    const key = KEY_POOL.find((c) => !T[c]);
    if (!key) throw new Error("Out of surface tile keys");
    return key;
  };
  const flight = (
    x: number,
    z: number,
    w: number,
    d: number,
    from: number,
    to: number,
    ceiling: number | null,
    floorMaterial: string,
    wallMaterial: string,
    light: number,
    extra: Partial<(typeof T)[string]> = {},
  ) => {
    const per = (to - from) / d;
    for (let j = 0; j < d; j++) {
      const key = pickKey();
      T[key] = {
        name: `Ramp ${(from + per * j).toFixed(2)}`,
        floor: from + per * j,
        ceiling,
        floorMaterial,
        wallMaterial,
        light,
        slope: { z: per },
        ...extra,
      };
      rect(x, z + j, w, 1, key);
    }
  };
  // Steep one-cell ramps (hop up, walk down).
  const hopRamp = (
    name: string,
    floor: number,
    slopeZ: number,
    ceiling: number | null,
    floorMaterial: string,
    wallMaterial: string,
    light: number,
    extra: Partial<(typeof T)[string]> = {},
  ) => {
    const key = pickKey();
    T[key] = {
      name,
      floor,
      ceiling,
      floorMaterial,
      wallMaterial,
      light,
      slope: { z: slopeZ },
      ...extra,
    };
    return key;
  };
  const rampOut = hopRamp("Wade out", -2, -1.6, null, "water", "dark-rock", 0.6, {
    water: -3.0,
  });
  const finalMouth = hopRamp("Door ramp", -8, 2, -4, "tech", "tech-trim", 0.5);

  // ---- start building (rows 26..35, x 10..22) ------------------------------
  rect(10, 26, 13, 10, "#");
  rect(15, 32, 6, 3, startFloor); // start room
  rect(15, 29, 6, 3, hallFloor); // hall
  rect(18, 28, 4, 1, "#"); // wall between hall and elevator room
  rect(19, 28, 1, 1, hallFloor); // door mouth (clear of the shells alcove)
  rect(18, 26, 4, 2, eRoomFloor); // elevator room
  rect(20, 26, 2, 2, shaftFloor); // lift shaft (pit at yard level)
  rect(20, 25, 1, 1, tunnelFloor); // tunnel cell from the shaft to the yard
  rect(11, 28, 5, 3, "#"); // armor room shell
  rect(11, 28, 2, 3, liftWell); // lift-well pool
  rect(12, 29, 3, 1, armorFloor); // armor room walkway
  rect(15, 29, 1, 1, armorFloor); // door mouth

  // secret 1 ledge + alcove + platform route
  rect(19, 30, 3, 2, ledgeFloor); // ledge
  rect(21, 30, 2, 2, ledgeFloor); // shelf
  rect(23, 30, 2, 2, ledgeFloor); // alcove
  rect(20, 28, 1, 2, ledgeFloor); // platform
  rect(17, 27, 2, 2, ledgeFloor); // shells alcove (drop back down beside the door)

  // ---- outdoor yard + water (rows 18..25, x 7..22) -------------------------
  rect(7, 18, 16, 8, "#");
  rect(12, 22, 10, 3, yardFloor); // yard
  rect(19, 24, 2, 2, notchFloor); // notch (low tunnel mouth) to the lift tunnel
  rect(20, 25, 1, 1, tunnelFloor); // tunnel cell (repainted above the notch)
  rect(12, 22, 2, 4, troughBed); // west trough
  rect(20, 22, 2, 3, troughBed); // east trough
  rect(12, 22, 2, 1, rampOut); // wade out (west)
  rect(20, 22, 2, 1, rampOut); // wade out (east)
  rect(14, 23, 4, 1, bridgeFloor); // bridge
  rect(8, 18, 4, 8, waterBed); // west water passage
  rect(10, 26, 2, 2, waterBed); // passage under the start building
  flight(11, 24, 1, 2, -3.6, -4.2, 0.5, "water", "dark-rock", 0.55, {
    water: -3.0,
  }); // ramps from passage to trough
  rect(9, 26, 1, 2, caveFloor); // cave with 100 health (secret 2)

  // ---- big building (rows 4..21, x 14..44) ---------------------------------
  rect(14, 4, 31, 18, "#");
  rect(14, 17, 17, 4, lobbyFloor); // lobby
  rect(17, 21, 2, 1, lobbyFloor); // big door mouth
  rect(32, 14, 7, 6, pillarFloor); // pillar room
  rect(31, 18, 1, 2, pillarFloor); // pillar door mouth
  rect(34, 16, 2, 2, pillarBlock); // pillar
  rect(39, 15, 6, 4, globeFloor); // globe/lift room
  rect(38, 15, 1, 1, "#"); // wall to the pillar room
  rect(38, 18, 1, 1, "#");
  rect(38, 16, 1, 2, globeFloor); // doorway
  rect(39, 13, 6, 2, ledgeHigh); // upper ledge
  rect(40, 16, 4, 3, "#"); // globe lift shaft shell
  rect(40, 16, 4, 3, globeFloor); // shaft floor
  rect(14, 12, 7, 4, stairFloor); // stair hall
  rect(16, 16, 1, 1, stairFloor); // stair door mouth
  rect(14, 8, 7, 2, midFloor); // mid room
  rect(15, 8, 2, 2, catShaft); // catwalk lift shaft
  flight(14, 10, 4, 4, -1, -2, 2, "metal-floor", "gray-block", 0.7); // stairs up
  rect(20, 8, 4, 2, roomFloor); // room under the balcony east of the lift
  rect(14, 4, 3, 2, catFloor); // nailgun room
  rect(17, 4, 3, 2, catFloor); // nailgun alcove
  rect(14, 6, 6, 2, catFloor); // bridge
  flight(33, 9, 2, 4, -1, -2, 2, "stone", "dark-rock", 0.8); // stairs down from the balcony

  // ---- slime room (rows 2..13, x 24..44) -----------------------------------
  rect(24, 2, 21, 12, roomFloor); // room floor
  rect(39, 12, 6, 1, pillarBlock); // wall between the upper ledge and the quad passage
  rect(41, 12, 1, 1, passageFloor); // secret wall mouth
  rect(39, 13, 6, 2, ledgeHigh); // upper ledge (repainted above the room)
  rect(40, 10, 4, 2, passageFloor); // secret 3 passage
  rect(41, 12, 1, 1, passageFloor); // secret wall mouth
  rect(35, 6, 4, 4, slime); // pool
  rect(39, 6, 13, 1, slime); // trench along the south wall of the room
  rect(33, 2, 2, 5, slime); // channel from the corridor up to the pool
  // secret 6 room (north-east corner of the pool): open floor, walls as
  // solid detail boxes so shots can pass over them and swimmers pass under
  rect(40, 4, 4, 5, s6Floor); // room floor
  rect(41, 7, 2, 2, slime); // lift well
  rect(39, 9, 5, 1, slime); // swim-under
  // secret 5 notch in the ramp room's east wall
  rect(52, 9, 1, 3, roomFloor);
  // secret 4 alcove (west wall of the room); its east wall stops at z11 so
  // the pool shore still connects to the west room
  rect(36, 10, 2, 1, "#"); // north wall
  rect(36, 13, 2, 1, "#"); // south wall
  rect(38, 12, 1, 1, "#"); // east wall
  rect(36, 11, 2, 2, roomFloor); // alcove interior
  rect(38, 11, 1, 1, roomFloor); // shore passage east of the alcove

  // ---- ramp room (rows 2..13, x 44..53) ------------------------------------
  rect(44, 2, 10, 12, "#");
  rect(44, 13, 1, 1, ledgeHigh); // upper ledge corner (repainted above the shell)
  rect(44, 11, 1, 1, roomFloor); // archway from the slime room
  rect(45, 11, 8, 2, roomFloor); // upper floor
  flight(45, 6, 8, 5, -6, -2, 8, "slime-wall", "slime-wall", 0.6); // continuous ramp
  rect(45, 3, 8, 3, bottomFloor); // bottom
  rect(50, 2, 2, 1, finalMouth); // exit door ramp
  rect(53, 1, 1, 6, slime); // annex: wade from the ramp bottom into the corridor

  // ---- exit corridor + slipgate room (rows 0..6) ---------------------------
  rect(10, 0, 44, 2, tile("o", "Exit corridor floor", -8, -4, "tech", "tech-trim", 0.45));
  flight(17, 1, 2, 2, -8, -4, -1, "tech", "tech-trim", 0.5); // ramp up into the room
  rect(15, 3, 12, 2, slipFloor); // slipgate room
  rect(14, 4, 3, 2, catFloor); // nailgun room (repainted above the slipgate room)
  rect(17, 4, 3, 2, catFloor); // nailgun alcove (repainted)
  rect(14, 6, 6, 2, catFloor); // bridge (repainted)

  // ---- doors ---------------------------------------------------------------
  const door = (
    id: string,
    name: string,
    x: number,
    z: number,
    axis: "x" | "z",
    width: number,
    height: number,
    extra: Partial<import("../game/fps/types").FpsDoor> = {},
  ) => fps.doors.push({ id, name, x, z, axis, width, height, ...extra });
  const lift = (
    id: string,
    name: string,
    x: number,
    z: number,
    travel: number,
    bottom: number,
    depth = 2,
  ) =>
    door(id, name, x, z, "x", depth, 0.3, {
      lift: travel,
      bottom,
      depth,
      speed: 1.2,
    });

  // start building
  door("d-elev", "Elevator room door", 19.5, 28.5, "z", 1.4, 2.4, {
    material: "tech",
  });
  lift("lift-yard", "Yard elevator", 20.5, 27, 2, -2, 1.6);
  Object.assign(fps.doors[fps.doors.length - 1], { startsOpen: true });
  door("d-yard", "Tunnel door", 20.5, 25.5, "x", 1.6, 2.4, { material: "tech" });
  door("d-ga", "Armor room door", 15, 29.5, "x", 1.6, 2.4, {
    material: "gray-block",
  });
  lift("lift-water", "Water elevator", 11.5, 29.5, 4.2, -4.2, 1.6);
  door("s2-back", "Secret wall", 9.5, 26.5, "x", 1.4, 2, {
    motion: "split",
    material: "dark-rock",
    sealed: true,
  });
  // yard
  door("d-main", "Big building door", 17.5, 21.5, "x", 2, 2.6, {
    material: "brown-brick",
  });
  // big building
  door("d-pillar", "Pillar room door", 31.5, 18.5, "z", 1.6, 2.4, {
    material: "gray-block",
  });
  door("d-stairs", "Stair hall door", 16.5, 16.5, "x", 1.6, 2.4, {
    material: "gray-block",
  });
  lift("lift-globe", "Globe lift", 42, 17.5, 1, -2, 3);
  lift("e-lift", "Catwalk elevator", 15.5, 8.5, 1, -1, 2);
  door("s-ng", "Nailgun alcove wall", 17, 4.5, "x", 1.6, 2.2, {
    motion: "split",
    material: "gray-block",
  });
  door("s3-front", "Secret wall", 41.5, 12.5, "x", 1.4, 2, {
    motion: "split",
    material: "tech",
    bottom: -2,
  });
  // slime room
  lift("lift-ledge", "Movable ledge", 38, 9, 6, -8, 1.5);
  lift("s6-lift", "Slime lift", 41.5, 7.5, 4, -8, 1.6);
  door("s4-alcove", "Secret wall", 36, 12.5, "x", 2.2, 2, {
    motion: "split",
    material: "slime-wall",
  });
  // ramp room + exit
  door("d-final", "Exit door", 51, 2.5, "x", 2.4, 2.6, {
    material: "tech",
    speed: 0.9,
    depth: 2.2,
  });

  // ---- sprites -------------------------------------------------------------
  // The base preset ships Duke-themed sprites; drop the ones this level
  // redefines or whose ammo references weapons that no longer exist.
  fps.sprites = fps.sprites.filter(
    (s) =>
      !["c9", "crate", "shells", "shotgun-pickup", "pistol-ammo"].includes(
        s.id,
      ),
  );
  const sprite = (
    id: string,
    name: string,
    kind: FpsSprite["kind"],
    width: number,
    height: number,
    extra: Partial<FpsSprite> = {},
  ) => fps.sprites.push({ id, name, kind, width, height, ...extra });
  sprite("grunt", "Grunt", "enemy", 1.1, 1.9, {
    image: art("grunt.png"),
    radius: 0.3,
    health: 30,
    damage: 6,
    speed: 1.1,
    range: 18,
    attackInterval: 2.1,
    attack: "hitscan",
    solid: true,
  });
  sprite("rottweiler", "Rottweiler", "enemy", 0.95, 0.85, {
    image: art("rottweiler.png"),
    radius: 0.28,
    health: 25,
    damage: 14,
    speed: 2.1,
    range: 14,
    attackInterval: 1.1,
    attack: "melee",
    meleeRange: 0.9,
    solid: true,
  });
  sprite("flame", "Torch flame", "prop", 0.6, 1.2, {
    image: art("flame.png"),
    fullbright: true,
  });
  sprite("c9", "Radioactive container", "explosive", 1.0, 1.7, {
    image: art("c9.png"),
    health: 18,
    damage: 90,
    range: 3.5,
    solid: true,
  });
  sprite("crate", "Crate", "prop", 1.1, 1.1, {
    image: art("tex-crate.png"),
    solid: true,
    platform: true,
  });
  sprite("slipgate", "Slipgate", "prop", 2.4, 2.4, {
    image: art("slipgate.png"),
    fullbright: true,
  });
  sprite("tele-pad", "Teleporter", "prop", 1.6, 0.1, {
    image: art("slipgate.png"),
    fullbright: true,
    facing: "floor",
    use: "teleport",
    teleport: { x: 28.5, z: 17.5, yaw: 90 * D },
  });
  const pickup = (
    id: string,
    name: string,
    image: string,
    p: NonNullable<FpsSprite["pickup"]>,
  ) =>
    sprite(id, name, "pickup", 0.5, 0.38, {
      image: art(image),
      fullbright: true,
      pickup: p,
    });
  pickup("health15", "15 HEALTH", "pickup-health15.png", {
    type: "health",
    amount: 15,
  });
  pickup("health25", "25 HEALTH", "pickup-health25.png", {
    type: "health",
    amount: 25,
  });
  pickup("health100", "100 HEALTH", "pickup-health100.png", {
    type: "health",
    amount: 100,
  });
  pickup("armor-green", "GREEN ARMOR +100", "pickup-armor-green.png", {
    type: "armor",
    amount: 100,
  });
  pickup("armor-yellow", "YELLOW ARMOR +150", "pickup-armor-yellow.png", {
    type: "armor",
    amount: 150,
    max: 150,
  });
  pickup("shells", "SHELLS +20", "pickup-shells.png", {
    type: "ammo",
    weaponId: "shotgun",
    amount: 20,
  });
  pickup("nails", "NAILS +25", "pickup-nails.png", {
    type: "ammo",
    weaponId: "nailgun",
    amount: 25,
  });
  pickup("shotgun-pickup", "SHOTGUN +25 SHELLS", "pickup-shotgun.png", {
    type: "weapon",
    weaponId: "shotgun",
    amount: 25,
  });
  pickup("dbs-pickup", "DOUBLE-BARRELLED SHOTGUN +25 SHELLS", "pickup-dbs.png", {
    type: "weapon",
    weaponId: "dbs",
    amount: 25,
  });
  pickup("nailgun-pickup", "NAILGUN +25 NAILS", "pickup-nailgun.png", {
    type: "weapon",
    weaponId: "nailgun",
    amount: 25,
  });
  pickup("quad", "QUAD DAMAGE", "pickup-quad.png", {
    type: "quad",
    duration: 30,
  });
  pickup("biosuit", "BIOSUIT", "pickup-biosuit.png", {
    type: "item",
    itemId: "biosuit",
    amount: 100,
  });
  const wall = (id: string, name: string, image: string, hp: number, solid = false) =>
    sprite(id, name, "breakable", 1.6, 1.4, {
      image: art(image),
      facing: "wall",
      health: hp,
      radius: 0.2,
      ...(solid ? { solid: true } : {}),
    });
  wall("s1-wall", "Cracked wall", "tex-brown-brick.png", 6, true);
  wall("g1", "Globe switch", "tex-light.png", 4);
  wall("g2", "Globe switch", "tex-light.png", 4);
  wall("g4", "Globe switch", "tex-light.png", 4);
  wall("exit-wall", "Loose wall", "tex-brown-brick.png", 6);
  sprite("btn", "Wall button", "switch", 0.4, 0.5, {
    image: art("tex-light.png"),
    facing: "wall",
    fullbright: true,
  });

  // ---- entities ------------------------------------------------------------
  const place = (
    id: string,
    sprite: string,
    x: number,
    z: number,
    extra: Partial<FpsEntity> = {},
  ) => fps.entities.push({ id, sprite, x, z, ...extra });
  const enemy = (id: string, sprite: string, x: number, z: number, yaw = 0) =>
    place(id, sprite, x, z, { yaw });
  const sw = (
    id: string,
    x: number,
    z: number,
    y: number,
    yaw: number,
    targets: string[],
  ) => place(id, "btn", x, z, { y, yaw, targets });

  // yard
  enemy("d-yard", "rottweiler", 17.5, 22.5, 90 * D);
  enemy("g-yard", "grunt", 19.5, 22.5, 45 * D);
  enemy("g-yard2", "grunt", 15.5, 24.5, 135 * D);
  place("h25-yard1", "health25", 14.5, 24.5);
  place("h25-yard2", "health25", 14.5, 23.5);
  place("h15-yard", "health15", 15.5, 22.5);
  place("torch1", "flame", 16.5, 24.5);
  // start building
  enemy("g-hall", "grunt", 17.5, 30.5, 0);
  place("shells-s1", "shells", 23.5, 30.5);
  place("shells-alcove", "shells", 17.5, 27.5);
  place("armor-green", "armor-green", 14.5, 29.5);
  place("s1-wall", "s1-wall", 22.8, 30.5, { y: 1.2, yaw: 90 * D });
  sw("sw-elev", 18.3, 27.3, 1.4, -90 * D, ["lift-yard"]);
  sw("sw-yard", 19.3, 24.5, -1.5, -90 * D, ["lift-yard"]);
  // lobby
  enemy("g-lobby", "grunt", 22.5, 18.5, -45 * D);
  enemy("d-lobby", "rottweiler", 16.5, 18.5, 90 * D);
  enemy("g-lobby2", "grunt", 14.5, 17.5, 45 * D);
  // pillar room
  enemy("d-pillar", "rottweiler", 33.5, 15.5, 45 * D);
  enemy("g-pillar", "grunt", 32.5, 17.5, 135 * D);
  place("c9-lobby", "c9", 36.5, 17.5);
  place("shells-pillar", "shells", 32.5, 19.5);
  // globe room
  enemy("g-globe", "grunt", 39.5, 16.5, -90 * D);
  place("g1", "g1", 44.6, 17.2, { y: 1.0, yaw: 90 * D, targets: ["lift-globe"] });
  place("g2", "g2", 44.6, 13.2, { y: 0.8, yaw: 0, targets: ["s3-front"] });
  place("h15-ledge", "health15", 43.5, 13.5);
  // secret 3 passage
  place("quad", "quad", 41.5, 11.5);
  // stair hall
  enemy("dog-stairs", "rottweiler", 17.5, 13.5, 0);
  enemy("g-stairs1", "grunt", 16.5, 12.5, 0);
  enemy("g-stairs2", "grunt", 18.5, 9.5, 45 * D);
  place("h15-stairs", "health15", 14.5, 12.5);
  // nailgun room
  enemy("g-ng-room", "grunt", 15.5, 4.5, -45 * D);
  enemy("g-ng-alcove", "grunt", 18.5, 4.5, 180 * D);
  place("nailgun", "nailgun-pickup", 16.5, 4.5, { targets: ["s-ng"] });
  place("nails-ng", "nails", 18.5, 6.5);
  // slime room
  sw("b-overlook", 39.75, 8.5, -1.2, 90 * D, ["lift-ledge"]);
  enemy("g-e1", "grunt", 44.5, 11.5, 135 * D);
  enemy("g-e2", "grunt", 34.5, 11.5, -135 * D);
  place("g4", "g4", 39.75, 7.3, { y: -1.5, yaw: 90 * D, targets: ["s4-alcove"] });
  place("dbs", "dbs-pickup", 37.4, 12.5);
  // ramp room
  sw("b1", 44.75, 10.3, -1.54, -90 * D, ["d-final"]);
  sw("b2", 44.75, 8.3, -3.14, -90 * D, ["d-final"]);
  sw("b3", 49.3, 2.7, -5.3, 180 * D, ["d-final"]);
  enemy("g-ramp1", "grunt", 47.5, 4.5, 0);
  enemy("g-biosuit", "grunt", 51.3, 3.3, 180 * D);
  place("biosuit", "biosuit", 51.3, 5.3);
  place("h15-ramp", "health15", 50.5, 3.5);
  // secret 5
  place("h100-s5", "health100", 52.5, 9.5, { y: -0.4 });
  // secret 6 room
  place("h25-s6", "health25", 41.3, 6.5);
  place("h15-s6", "health15", 41.9, 6.5);
  place("armor-yellow", "armor-yellow", 42.5, 6.5);
  place("tele-pad", "tele-pad", 41.5, 5.5);
  // lobby overlook (teleport destination); the pad lands you beside the
  // pillar-room doorway
  // exit corridor + slipgate room
  place("h15-corridor", "health15", 16.5, 1.5);
  enemy("d-corridor", "rottweiler", 19.5, 1.5, 90 * D);
  enemy("g-final", "grunt", 18.5, 5.5, -45 * D);
  enemy("g-slipgate", "grunt", 22.5, 3.5, 0);
  enemy("g-slip2", "grunt", 24.5, 3.5, 90 * D);
  place("nails-final", "nails", 19.5, 3.7);
  place("crate-nails", "crate", 20.5, 4.5);
  place("h15-final", "health15", 21.5, 4.5);
  place("h25-final", "health25", 24.5, 3.5);
  place("exit-wall", "exit-wall", 22.5, 4.7, { y: -2.9, yaw: 0, targets: ["s2-back"] });
  place("slipgate", "slipgate", 23.5, 4.6);
  place("crate-s1", "crate", 25.6, 4.4);
  
  // secret 2 cave
  place("h100-s2", "health100", 9.5, 27.3);
  // torches
  place("torch2", "flame", 19.5, 24.5);
  place("torch3", "flame", 25.5, 12.5);
  place("torch4", "flame", 44.5, 11.5);

  // ---- weapons -------------------------------------------------------------
  const axe: FpsWeapon = {
    id: "axe",
    name: "AXE",
    slot: 1,
    melee: true,
    damage: 24,
    interval: 0.5,
    range: 1.7,
    ammo: 0,
    view: { scale: 0.85, x: 0.12, y: -0.55 },
    image: art("axe-view.png"),
  };
  const shotgun: FpsWeapon = {
    id: "shotgun",
    name: "SHOTGUN",
    slot: 2,
    starting: true,
    ammoPool: "shells",
    damage: 9,
    interval: 0.5,
    range: 30,
    ammo: 25,
    maxAmmo: 100,
    pellets: 6,
    spread: 0.09,
    view: { scale: 0.8, x: 0.14, y: -0.58 },
    image: art("shotgun-view.png"),
  };
  const dbs: FpsWeapon = {
    id: "dbs",
    name: "DB SHOTGUN",
    slot: 3,
    ammoPool: "shells",
    damage: 10,
    interval: 0.7,
    range: 26,
    ammo: 0,
    maxAmmo: 100,
    pellets: 14,
    spread: 0.16,
    view: { scale: 0.82, x: 0.1, y: -0.56 },
    image: art("dbs-view.png"),
  };
  const nailgun: FpsWeapon = {
    id: "nailgun",
    name: "NAILGUN",
    slot: 4,
    ammoPool: "nails",
    damage: 9,
    interval: 0.11,
    range: 40,
    ammo: 0,
    maxAmmo: 200,
    projectile: { speed: 21, color: "#e8d38a" },
    view: { scale: 0.8, x: 0.14, y: -0.6 },
    image: art("nailgun-view.png"),
  };
  fps.weapons = [axe, shotgun, dbs, nailgun];

  // ---- details (dimensional architecture) ----------------------------------
  fps.details = [
    {
      id: "s6-wall-n",
      x: 42,
      z: 4.5,
      width: 4,
      depth: 1,
      bottom: -2,
      height: 2,
      material: "tech",
      solid: true,
      light: 0.7,
    },
    {
      id: "s6-wall-s",
      x: 42,
      z: 8.5,
      width: 4,
      depth: 1,
      bottom: -2,
      height: 2,
      material: "tech",
      solid: true,
      light: 0.7,
    },
    {
      id: "s6-wall-w",
      x: 40.5,
      z: 6.5,
      width: 1,
      depth: 4,
      bottom: -2,
      height: 2,
      material: "tech",
      solid: true,
      light: 0.7,
    },
    {
      id: "s6-wall-e",
      x: 43.5,
      z: 6.5,
      width: 1,
      depth: 4,
      bottom: -2,
      height: 2,
      material: "tech",
      solid: true,
      light: 0.7,
    },
    {
      id: "s5-block-a",
      x: 52.5,
      z: 10.5,
      width: 0.8,
      depth: 0.8,
      bottom: -2,
      height: 0.8,
      material: "slime-wall",
      solid: true,
      light: 0.7,
    },
    {
      id: "s5-block-b",
      x: 52.5,
      z: 9.5,
      width: 0.8,
      depth: 0.8,
      bottom: -1.2,
      height: 0.8,
      material: "slime-wall",
      solid: true,
      light: 0.7,
    },
    {
      id: "balcony",
      x: 27.75,
      z: 8.5,
      width: 23.5,
      depth: 2,
      bottom: -2,
      height: 1,
      material: "tech-trim",
      topMaterial: "metal-floor",
      solid: true,
      light: 0.85,
    },
  ];

  // ---- zones ---------------------------------------------------------------
  fps.zones = [
    { id: "s1", name: "Secret 1", x: 23, z: 30, w: 2, d: 2, secret: true, message: "SECRET 1: shells" },
    { id: "s2", name: "Secret 2", x: 9, z: 26, w: 1, d: 2, secret: true, message: "SECRET 2: 100 health" },
    { id: "s3", name: "Secret 3", x: 40, z: 10, w: 4, d: 2, secret: true, message: "SECRET 3: quad damage" },
    { id: "s4", name: "Secret 4", x: 36, z: 11, w: 2, d: 2, secret: true, message: "SECRET 4: double-barrelled shotgun" },
    { id: "s5", name: "Secret 5", x: 52.05, z: 9.05, w: 0.9, d: 0.9, secret: true, message: "SECRET 5: 100 health" },
    { id: "s6", name: "Secret 6", x: 41, z: 5, w: 2, d: 4, secret: true, message: "SECRET 6: yellow armor" },
    { id: "q1-exit", name: "The Slipgate", x: 21.5, z: 4.5, w: 4, d: 3, hotspotId: "q1-finish" },
  ];

  // ---- world settings ------------------------------------------------------
  fps.spawn = { x: 16.5, z: 33.5, yaw: 180 * D };
  fps.presentation = "quake";
  fps.defaultSkill = 2;
  fps.skillLabels = ["Easy", "Normal", "Hard"];
  fps.menuWordmark = "QUAKE";
  fps.menuKicker = "DIMENSION OF THE DOOMED · E1M1 · THE SLIPGATE COMPLEX";
  fps.skyColor = "#14100c";
  fps.skyImage = art("menu-sky.png");
  fps.skyMode = "sphere";
  fps.fogDistance = 60;
  fps.waterColor = "#3a6b63";
  fps.renderHeight = 400;
  fps.moveSpeed = 4.4;
  fps.runMultiplier = 1.6;
  fps.jumpSpeed = 6.8;
  fps.health = 100;
  fps.armor = 0;
  fps.effects = {
    explosionImages: [
      art("explosion-1.png"),
      art("explosion-2.png"),
      art("explosion-3.png"),
    ],
    impactImage: art("spark.png"),
  };
  fps.objective =
    "Descend the elevator, cross the yard, fight through the complex, take the nailgun and the double-barrelled shotgun, and step through the Slipgate. Six secrets are hidden: shells, 100 health, quad damage, the double shotgun, another 100 health, and the yellow armor.";
  fps.intro =
    "You got the phone number of an ancient, abandoned military base. Time to make the call. WASD move · F fire · E use · Space jump · 1 axe · 2 shotgun · 3 double shotgun · 4 nailgun · B biosuit";
  fps.credit = "E1M1 · THE SLIPGATE COMPLEX";

  return {
    map: grid.map((row) => row.join("")),
    fps,
    fov: 90,
    mouseLook: true,
  };
}

export const QUAKE_E1M1: Story = {
  id: "quake-e1m1",
  title: "Quake — The Slipgate Complex",
  tagline: "Dimension of the Doomed · E1M1. The slipgate is waiting.",
  gameKind: "first-person",
  coverImage: art("cover.png"),
  startSceneId: "q1-start",
  characters: [],
  items: [],
  briefing: {
    objective:
      "Fight through the base, open the three-button door and step through the Slipgate. Find all six secrets.",
    gameInfo:
      "An unofficial, newly illustrated reconstruction of Quake's E1M1 (The Slipgate Complex), playable and editable in Studio. The shared Quake-style engine adds melee Rottweilers, a swingable axe, shared ammo pools, the nailgun's launched nails, damaging slime, wading water, the biosuit, Quad Damage, walk-in slipgate exits and a Quake-style status bar. Route: elevator down, bridge over the yard, big building door, pillar room, globe lift, quad secret, catwalk nailgun, slime overlook, movable ledge, double-shotgun secret, three-button ramps, biosuit slime run, yellow-armor secret with the teleporter back over the lobby, exit corridor and the slipgate. Drop off the bridge for the water route: 100-health cave and the green armor elevator. WASD move, F/click fire, E use, Space jump, C crouch, Shift run, 1 axe, 2 shotgun, 3 double shotgun, 4 nailgun, B biosuit, Tab automap, Esc pause/save. Approx. 15-20 minutes. No extracted Quake game data; all art is new. Everything is editable under Studio → Stage → First-person tools.",
    winConditions: [
      "Press all three buttons to open the exit door.",
      "Step through the Slipgate at the end of the exit corridor.",
    ],
    loseConditions: ["Health reaches zero; restart the level or load a save."],
  },
  dialogueBox: {
    hudTheme: "sepia-pulp",
    accentColor: "#d9a441",
    minimalHud: true,
  },
  scenes: [
    {
      id: "q1-start",
      title: "The Slipgate Complex",
      nodeType: "stage",
      hideHud: true,
      hideSceneTitle: true,
      background: art("menu-sky.png"),
      prose: "",
      choices: [],
      noTypewriter: true,
      particles: "none",
      ambientAudio: "none",
      cinematic: { mode: "static", dimAmount: 0 },
      transitionSpeed: 0.2,
      stage: { keyboard: true, quake: quakeE1M1Room() },
      hotspots: [
        {
          id: "q1-finish",
          label: "Enter the Slipgate",
          cursor: "go",
          bounds: { x: 50, y: 50, w: 10, h: 10 },
          action: { type: "goToScene", targetSceneId: "q1-end" },
        },
      ],
      note: "QUAKE E1M1 AUTHORING: Stage → First-person tools. Map 72×46. Spawn (16.5,33.5). Elevator (20.5,27) down to the yard; tunnel door (19.5,25.5). Big building door (17.5,21.5). Globe lift (42,17.5); quad secret (40.5,11.5). Catwalk elevator (15.5,8); nailgun (16.5,4.5) opens its alcove wall (17,4.5). Balcony button (35.1,9.5) extends the slime ledge (37,8.5); globe (39.75,7.5) opens the double-shotgun secret (38.5,12.5). Ramp buttons (45.3,10.3) (45.3,8.3) (49.3,3.5) open the exit door (51,2.5). Biosuit (51.3,5.3); slime trench along z6; slime lift (41.5,7.5) up to the yellow-armor secret; its teleporter returns over the lobby. Exit wall (22.5,5.9) unlocks secret 2's back door (15,24.5). Water: west trough → passage → cave (13.5,23.5) → water elevator (11.5,29.5) → green armor. Slipgate (23.5,5.5) fires q1-finish. Full guide: docs/quake-e1m1.md.",
    },
    {
      id: "q1-end",
      title: "The Slipgate Complex — Cleared",
      background: art("cover.png"),
      prose:
        "LEVEL CLEARED.\n\nYou rode the elevator into the yard, crossed the bridge, fought through the base, took the nailgun, pressed the three buttons and stepped into the Slipgate.\n\nNext stop: The Castle of the Damned.",
      noTypewriter: true,
      choices: [],
      hotspots: [],
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "SLIPGATE COMPLEX — CLEARED",
        recap:
          "Six secrets hid along the way: the cracked wall, the water cave, the quad passage, the double-barrelled shotgun, the overhang and the yellow armor.",
      },
      particles: "none",
      ambientAudio: "none",
    },
  ],
};
