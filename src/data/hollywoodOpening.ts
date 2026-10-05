import type { Story, QuakeModeSettings } from "../types";
import type { FpsEntity, FpsSprite } from "../game/fps/types";
import { applyHollywoodFidelity } from "./hollywoodFidelity";
import { createFpsSettings } from "../game/fps/presets";
const art = (name: string) => `/img/hollywood-opening/${name}`;
const D = Math.PI / 180;

/** Hollywood Holocaust (E1L1) — an authored, editable reconstruction of the
 * original level's layout and progression, not an imported MAP/ART file.
 *
 * Route (matches the original walkthrough):
 *  rooftop → C-9 vent shaft → street (medkit landing, dumpster fire)
 *  → crate + sloped ledge → apartment windows (RPG ammo / poster steroids)
 *  → ledge under the INNOCENT? billboard (RPG) → atomic ledge → street
 *  → cracked wall beside the boarded entrance (foyer) OR the alley
 *  → alley door → stairs → theatre → lobby (counter, shotgun room, register lift)
 *  → restroom (mirror, stalls, vent) → captive woman → projector room (red card,
 *    projector atomic → RPG wall, curtain switch) → ramp down / elevator loop
 *  → theatre screen crack → backstage jetpack
 *  → red door → ramp → blown wall → bridge over the alley → glass → EXIT.
 * World units: X east, Z south, Y up. See docs/first-person.md.
 */
export function hollywoodRoom(): QuakeModeSettings {
  const fps = createFpsSettings();
  const W = 64,
    H = 50;
  const grid = Array.from({ length: H }, () => Array(W).fill("#") as string[]);
  const rect = (x: number, z: number, w: number, d: number, tile: string) => {
    for (let j = z; j < z + d; j++)
      for (let i = x; i < x + w; i++) grid[j][i] = tile;
  };
  const cell = (x: number, z: number, tile: string) => (grid[z][x] = tile);
  const T = fps.tiles;
  const tile = (
    key: string,
    name: string,
    floor: number,
    ceiling: number | null,
    floorMaterial: string,
    wallMaterial: string,
    light = 0.82,
    ceilingMaterial = "concrete",
  ) => {
    T[key] = {
      name,
      floor,
      ceiling,
      floorMaterial,
      wallMaterial,
      ceilingMaterial,
      light,
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

  // ---- Surface palette -------------------------------------------------
  solid("#", "Building facade", 12, "facade");
  solid("p", "Roof parapet", 6.2, "concrete");
  solid("K", "Brick wall", 12, "brick");
  solid("c", "Concession counter", 0.95, "wood-panel");
  solid("B", "Bathroom partition", 2.1, "bathroom-tile");
  solid("s", "Stage lip", 0.6, "wood-panel");
  tile(".", "Street", 0, null, "asphalt", "facade", 0.8);
  tile("a", "Alley", 0, null, "asphalt", "brick", 0.62);
  tile("r", "Rooftop", 5.4, null, "gravel", "concrete", 0.85);
  tile("v", "Vent shaft (rooftop)", 5.4, null, "gravel", "metal-panel", 0.7);
  tile("i", "Lobby", 0, 5.2, "carpet", "lobby-wall", 0.85);
  tile("f", "Front foyer", 0, 4.2, "carpet", "lobby-wall", 0.8);
  tile("n", "Behind the counter", 0, 4.5, "tiles", "wood-panel", 0.85);
  tile("g", "Shotgun room", 0, 3.2, "tiles", "wood-panel", 0.75);
  tile("t", "Theatre", 0, 7, "carpet", "curtain", 0.5);
  tile("S", "Stage", 0.35, 7, "wood-panel", "wood-panel", 0.55);
  tile("k", "Backstage", 0, 7, "concrete", "brick", 0.45);
  tile("b", "Restroom", 0, 3.6, "tiles", "bathroom-tile", 0.95, "tiles");
  tile("q", "Restroom step", 1.4, 4.4, "tiles", "bathroom-tile", 0.9, "tiles");
  tile(
    "V",
    "Air duct",
    2.4,
    4.2,
    "metal-panel",
    "metal-panel",
    0.55,
    "metal-panel",
  );
  tile("w", "Alien nest", 2.4, 5.4, "concrete", "brick", 0.5);
  tile("P", "Projection room", 3, 6.5, "concrete", "brick", 0.75);
  tile("W", "Projection window", 3, 5, "concrete", "concrete", 0.75);
  tile("e", "Elevator landing", 0, 4.8, "carpet", "lobby-wall", 0.8);
  tile(
    "E",
    "Upper corridor",
    1.8,
    4.6,
    "metal-panel",
    "metal-panel",
    0.7,
    "metal-panel",
  );
  tile("h", "Hallway", 0, 4.5, "carpet", "lobby-wall", 0.8);
  tile("A", "Apartment", 2.7, 5.6, "carpet", "wood-panel", 0.7);
  tile("N", "Apartment window", 2.7, 4.6, "concrete", "facade", 0.8);
  tile("Q", "Poster compartment", 2.7, 4.9, "concrete", "brick", 0.6);
  tile("L", "Billboard ledge", 3.3, null, "concrete", "facade", 0.8);
  tile("J", "Atomic ledge", 0.7, null, "concrete", "facade", 0.8);
  tile("u", "Upper theatre room", 1.05, 5, "concrete", "brick", 0.7);
  tile(
    "x",
    "Exit alcove",
    2.1,
    4.8,
    "concrete",
    "metal-panel",
    0.85,
    "metal-panel",
  );
  tile("m", "Lift compartment", 3, 5.2, "carpet", "lobby-wall", 0.85);
  tile("y", "Can compartment", 2.2, 4.5, "carpet", "lobby-wall", 0.7);
  tile("o", "Lobby atomic nook", 0, 3, "tiles", "brick", 0.6);
  tile("Z", "Bachelor pad", 3.1, 6.2, "carpet", "wood-panel", 0.7);
  tile("z", "Building ledge", 2.1, null, "concrete", "facade", 0.75);
  tile("X", "Pad window", 3.1, 5.6, "concrete", "facade", 0.8);
  // Numbered step tiles so ramps and stairs are walkable at ≤0.36 per cell.
  const STEP_KEYS = "0123456789!$%&*+-/=?@^_~|:;<>[]{}()";
  let stepSerial = 0;
  const step = (
    floor: number,
    ceiling: number | null,
    floorMaterial: string,
    wallMaterial: string,
    light = 0.8,
  ) => {
    const key = STEP_KEYS[stepSerial++]; // never collides with the letter tiles above
    return tile(
      key,
      `Step ${floor.toFixed(2)}`,
      floor,
      ceiling,
      floorMaterial,
      wallMaterial,
      light,
    );
  };

  // ---- Rooftop (spawn) ---------------------------------------------------
  rect(1, 1, 13, 10, "p");
  rect(2, 2, 11, 8, "r");
  rect(13, 5, 1, 2, "v"); // Blown vent opening in the east parapet.
  // ---- Street: north–south, 13 cells wide ---------------------------------
  rect(14, 2, 13, 46, ".");
  // West side: crate / sloped ledge / windows / billboard / atomic ledge.
  // The sloped ledge rises northward from the crate toward the billboard.
  const ledge = [3.0, 2.7, 2.5, 2.2, 1.9, 1.6, 1.3, 1.0];
  ledge.forEach((y, i) => {
    const key = step(y, null, "concrete", "facade");
    T[key].slope = { z: (ledge[i + 1] ?? 0.7) - y };
    cell(13, 9 + i, key);
  });
  rect(13, 7, 1, 2, "L"); // Ledge beneath the billboard (secret 1).
  rect(6, 10, 7, 6, "A"); // Apartment.
  rect(12, 11, 1, 3, "N"); // Three windows onto the sloped ledge.
  rect(4, 12, 2, 2, "Q"); // Steroids behind the poster (secret 3).
  rect(13, 17, 1, 3, "J"); // Lower sloped ledge with the atomic health.
  // ---- Cinema block ---------------------------------------------------------
  rect(28, 16, 5, 9, "f"); // Front foyer behind the boarded doors.
  cell(27, 17, "f"); // Cracked wall opening (breakable).
  rect(27, 19, 1, 3, "f"); // Boarded entrance recess.
  rect(33, 13, 15, 14, "i"); // Lobby.
  rect(36, 15, 8, 1, "c"); // Concession counter.
  rect(36, 13, 8, 2, "n"); // Behind the counter.
  rect(44, 13, 1, 3, "#"); // Counter end wall: the counter must be jumped.
  rect(45, 13, 3, 2, "g"); // Shotgun / monitor room off the lobby.
  rect(33, 13, 1, 2, "#");
  rect(34, 13, 2, 2, "o"); // Atomic nook at the west end of the counter.
  rect(48, 20, 2, 1, "y"); // Compartment above the elevator's trash can (opens onto the corridor).
  rect(40, 27, 2, 1, "m"); // Register compartment (armor, secret 4).
  rect(48, 15, 2, 2, "h"); // Hall to the restroom.
  rect(50, 13, 7, 6, "b"); // Restroom.
  rect(55, 17, 2, 2, "q"); // Platform left of the stalls (vent access).
  rect(51, 18, 4, 1, "B"); // Stall partitions.
  cell(52, 18, "b");
  cell(54, 18, "b");
  rect(57, 17, 4, 1, "V"); // Vent duct east…
  rect(59, 17, 2, 11, "V"); // …then south to the nest.
  rect(59, 28, 3, 4, "w"); // Captive woman (secret 5).
  rect(57, 29, 2, 1, step(2.7, 4.9, "concrete", "brick", 0.5)); // brick secret door passage
  rect(50, 28, 7, 4, "P"); // Projection room.
  rect(48, 29, 2, 2, "W"); // Window over the theatre.
  rect(48, 25, 2, 2, "h"); // Hall from the lobby to the ramp.
  for (let x = 50; x <= 57; x++) {
    const key = step(0.3 * (x - 49), 4.5, "concrete", "brick");
    T[key].slope = { x: 0.3 };
    rect(x, 25, 1, 2, key);
  } // Continuous ramp up to projection, not a flight of grid stairs.
  rect(56, 27, 2, 1, step(2.7, 5, "concrete", "brick")); // Top of the ramp.
  rect(48, 21, 2, 4, "e"); // Elevator landing: a passage off the lobby ends at the lift.
  rect(50, 20, 7, 4, "E"); // Upper corridor: C-9 canisters.
  cell(55, 24, "E"); // Blown wall down onto the ramp.
  rect(33, 28, 15, 9, "t"); // Theatre.
  rect(33, 29, 2, 7, "S"); // Stage.
  rect(32, 29, 1, 7, "S"); // Curtain line.
  rect(29, 29, 3, 7, "k"); // Backstage (jetpack, secret 7).
  rect(36, 27, 3, 1, "i"); // Theatre door (west).
  rect(42, 27, 3, 1, "i"); // Theatre door (east).
  rect(50, 33, 8, 4, "u"); // Upper room at the top of the alley stairs (red door).
  cell(49, 34, step(0.7, 5, "concrete", "brick"));
  cell(48, 34, step(0.35, 5, "concrete", "brick"));
  rect(27, 39, 35, 5, "a"); // Alley behind the cinema.
  cell(53, 38, step(0.35, 4.2, "concrete", "brick"));
  cell(53, 37, step(0.7, 4.2, "concrete", "brick"));
  rect(56, 37, 2, 1, step(1.4, 4.5, "concrete", "brick")); // Red door threshold.
  rect(56, 38, 2, 1, step(1.75, 4.5, "concrete", "brick")); // Ramp: the wall ahead blows.
  solid("R", "Exit building rooftop", 5.1, "brick");
  rect(55, 44, 7, 5, "R");
  T.x.roof = 5.1;
  rect(56, 44, 2, 2, "x"); // Exit alcove across the bridge.
  // Ledge from beside the exit alcove, along the cinema's alley face and up the
  // street side to the bachelor pad window (secret 8). Drop from the bridge.
  rect(27, 38, 26, 1, "z"); // x 27..52; the stair well and ramp keep their cells.
  rect(54, 38, 2, 1, "z");
  rect(58, 38, 1, 6, "z"); // Runs beside the bridge to the exit alcove.
  rect(27, 25, 1, 13, "z");
  rect(28, 25, 5, 3, "Z"); // Bachelor pad above the foyer.
  cell(27, 26, "X"); // Window onto the street ledge (a jump up from the ledge).

  fps.spawn = { x: 7.5, z: 6, yaw: -90 * D };
  fps.objective =
    "Hollywood Holocaust. Get off the roof, find the red access card in the projector room and reach the exit switch across the alley bridge.";
  fps.intro =
    "Damn. Those alien bastards are gonna pay for shooting up my ride.";
  fps.credit =
    "Unofficial Duke Nukem 3D E1L1 reconstruction. Newly created art and synthesized effects; no extracted game files. Not affiliated with the rights holders.";

  // ---- Doors, lifts and slabs ----------------------------------------------
  fps.doors = [
    {
      id: "roof-hatch",
      name: "Ventilation grate",
      x: 13.5,
      z: 6,
      width: 2,
      height: 1.6,
      bottom: 5.4,
      axis: "z",
      material: "shutter",
      key: "sealed",
      lockedMessage: "SHOOT THE C-9 CANISTERS",
    },
    {
      id: "front-door",
      name: "Boarded theatre entrance",
      x: 27.5,
      z: 20.5,
      width: 3,
      height: 3,
      axis: "z",
      material: "shutter",
      key: "sealed",
      lockedMessage: "BOARDED UP — THE CRACKED WALL LOOKS WEAK",
    },
    {
      id: "crack-door",
      name: "Cracked wall",
      x: 27.5,
      z: 17.5,
      width: 1,
      height: 3,
      axis: "z",
      depth: 1,
      material: "facade",
      key: "sealed",
      speed: 9,
      lockedMessage: "THE WALL IS CRACKED. SHOOT IT.",
    },
    {
      id: "foyer-doors",
      name: "Lobby double doors",
      x: 32.6,
      z: 20.5,
      width: 3,
      height: 3.2,
      axis: "z",
      material: "wood-panel",
    },
    {
      id: "shotgun-door",
      name: "Storeroom door",
      x: 46,
      z: 15,
      width: 2,
      height: 2.6,
      axis: "x",
      material: "wood-panel",
    },
    {
      id: "nook-wall",
      name: "Counter-end wall",
      x: 35,
      z: 15,
      width: 2,
      height: 3,
      axis: "x",
      depth: 0.9,
      material: "lobby-wall",
    },
    {
      id: "compartment",
      name: "Hidden compartment",
      x: 41,
      z: 26.9,
      width: 2,
      height: 1.5,
      bottom: 3,
      axis: "x",
      material: "lobby-wall",
      key: "sealed",
      lockedMessage: "SOLID WALL",
    },
    {
      id: "lobby-lift",
      name: "Hidden lift",
      x: 41,
      z: 26,
      width: 2,
      depth: 1.4,
      height: 0.25,
      axis: "x",
      material: "metal-panel",
      lift: 2.75,
      speed: 1.2,
    },
    {
      id: "restroom-door",
      name: "Restroom door",
      x: 50,
      z: 16,
      width: 2,
      height: 2.6,
      axis: "z",
      material: "wood-panel",
    },
    {
      id: "theatre-door-w",
      name: "Theatre doors",
      x: 37.5,
      z: 27.5,
      width: 3,
      height: 3,
      axis: "x",
      material: "wood-panel",
    },
    {
      id: "theatre-door-e",
      name: "Theatre doors",
      x: 43.5,
      z: 27.5,
      width: 3,
      height: 3,
      axis: "x",
      material: "wood-panel",
    },
    {
      id: "curtain",
      name: "Screen curtain",
      x: 32.7,
      z: 32.5,
      width: 7,
      height: 6.6,
      bottom: 0.35,
      axis: "z",
      depth: 0.5,
      material: "curtain",
      key: "sealed",
      speed: 0.8,
      lockedMessage: "THE CURTAIN IS CLOSED — TRY THE PROJECTOR ROOM",
    },
    {
      id: "screen-door",
      name: "Screen",
      x: 32,
      z: 32.5,
      width: 7,
      height: 6.4,
      axis: "z",
      depth: 0.4,
      material: "concrete",
      key: "sealed",
      speed: 12,
      lockedMessage: "THE SCREEN HAS A CRACK IN IT",
    },
    {
      id: "poster-door",
      name: "Movie poster",
      x: 6.4,
      z: 13,
      width: 2,
      height: 2.2,
      bottom: 2.7,
      axis: "z",
      depth: 0.8,
      material: "wood-panel",
    },
    {
      id: "woman-wall",
      name: "Brick wall",
      x: 57.5,
      z: 29.5,
      width: 1,
      height: 2.2,
      bottom: 2.7,
      axis: "z",
      depth: 0.9,
      material: "brick",
    },
    {
      id: "rpg-wall",
      name: "Projection room wall",
      x: 50.5,
      z: 28.4,
      width: 1.2,
      height: 1.6,
      bottom: 3,
      axis: "x",
      depth: 0.9,
      material: "brick",
      key: "sealed",
      lockedMessage: "SOLID WALL",
    },
    {
      id: "elevator",
      name: "Elevator",
      x: 49,
      z: 22,
      width: 2,
      depth: 2,
      height: 0.2,
      axis: "x",
      material: "metal-panel",
      lift: 1.6,
      speed: 1,
    },
    {
      id: "c9-wall",
      name: "Corridor wall",
      x: 55.5,
      z: 24.5,
      width: 1,
      height: 2.8,
      bottom: 1.8,
      axis: "x",
      depth: 1,
      material: "metal-panel",
      key: "sealed",
      speed: 9,
      lockedMessage: "SHOOT THE C-9",
    },
    {
      id: "alley-door",
      name: "Alley door",
      x: 53.5,
      z: 38.6,
      width: 1.6,
      height: 2.6,
      bottom: 0.35,
      axis: "x",
      material: "metal-panel",
    },
    {
      id: "theatre-side-door",
      name: "Theatre side door",
      x: 49.5,
      z: 34.5,
      width: 1.6,
      height: 2.6,
      bottom: 0.7,
      axis: "z",
      material: "wood-panel",
    },
    {
      id: "can-compartment",
      name: "Wall panel",
      x: 49.9,
      z: 20.5,
      width: 1,
      height: 2.2,
      bottom: 1.8,
      axis: "z",
      depth: 0.3,
      material: "lobby-wall",
    },
    {
      id: "red-door",
      name: "Red access door",
      x: 57,
      z: 37.3,
      width: 2,
      height: 2.8,
      bottom: 1.4,
      axis: "x",
      material: "shutter",
      key: "red",
    },
    {
      id: "blast-wall",
      name: "Bricked-up wall",
      x: 57,
      z: 38.6,
      width: 2,
      height: 2.6,
      bottom: 1.75,
      axis: "x",
      depth: 0.8,
      material: "brick",
      key: "sealed",
      speed: 9,
      lockedMessage: "A DEAD END. THE C-9 SHOULD FIX THAT.",
    },
    {
      id: "bridge",
      name: "Alley bridge",
      x: 57,
      z: 41.5,
      width: 5.2,
      depth: 2,
      height: 0.3,
      bottom: 1.8,
      axis: "z",
      material: "metal-panel",
      walkable: true,
    },
    {
      id: "exit-glass",
      name: "Window",
      x: 57,
      z: 44.1,
      width: 2,
      height: 2.6,
      bottom: 2.1,
      axis: "x",
      depth: 0.16,
      material: "glass",
      key: "sealed",
      speed: 12,
      lockedMessage: "GLASS. BREAK IT.",
    },
  ];
  fps.materials.push({ id: "glass", name: "glass", color: "#9fc7dc" });
  // Level-specific art for shared preset props (other levels keep theirs).
  for (const [id, file, size] of [
    ["arcade", "arcade-v5.png", [1, 2.1]],
    ["monitor", "monitor-v5.png", [0.9, 0.75]],
    ["projector", "projector-v5.png", [1.5, 1.6]],
    ["innocent", "innocent-v5.png", [6, 2.4]],
    ["red-key", "red-key-v5.png", [0.4, 0.45]],
    ["end-switch", "end-switch-v5.png", [0.7, 0.7]],
  ] as const) {
    Object.assign(fps.sprites.find((sp) => sp.id === id)!, {
      image: art(file),
      width: size[0],
      height: size[1],
    });
  }
  Object.assign(
    fps.sprites.find((s) => s.id === "projector")!,
    {
      platform: true,
      height: 1.6,
    },
  );
  // A standing jump clears ~1.15 units: keep step-up props under that.
  Object.assign(
    fps.sprites.find((s) => s.id === "crate")!,
    {
      height: 0.95,
      radius: 0.5,
    },
  );

  // ---- Extra sprite definitions for this level -----------------------------
  const extra = (
    id: string,
    name: string,
    width: number,
    height: number,
    more: Partial<FpsSprite> = {},
  ): FpsSprite => ({
    id,
    name,
    kind: "prop",
    image: art(`${id}.png`),
    width,
    height,
    radius: width * 0.3,
    ...more,
  });
  fps.sprites.push(
    extra("facade-windows", "Office window strip", 9, 2.8, {
      facing: "wall",
      image: art("tex-windows.webp"),
    }),
    extra("cracked-wall", "Cracked wall", 1, 3, {
      kind: "breakable",
      facing: "wall",
      health: 30,
      image: art("cracked-wall-v4.png"),
    }),
    extra("screen-crack", "Cracked screen", 1.1, 1.4, {
      kind: "breakable",
      facing: "wall",
      health: 140,
      image: art("cracked-wall-v4.png"),
    }),
    extra("glass", "Glass pane", 2, 2.6, {
      kind: "breakable",
      facing: "wall",
      health: 10,
      image: art("glass-v4.png"),
    }),
    extra("vent", "Air vent grate", 1, 0.7, {
      kind: "breakable",
      facing: "wall",
      health: 10,
      image: art("vent-v4.png"),
    }),
    extra("marquee-v2", "Theatre marquee", 8, 2, {
      facing: "wall",
      fullbright: true,
      image: art("marquee-v4.png"),
    }),
    extra("poster-bimbos", "Biker Bimbos poster", 1, 1.75, {
      facing: "wall",
      fullbright: true,
      image: art("poster-bimbos-v4.png"),
    }),
    extra("keep-out", "Keep out sign", 1.2, 0.6, {
      facing: "wall",
      fullbright: true,
    }),
    extra("ledge-sign", "Street sign", 2, 0.65, {
      facing: "wall",
      fullbright: true,
    }),
    extra("dumpster-burning", "Burning dumpster", 2.4, 2.1, {
      solid: true,
      fullbright: true,
      image: art("dumpster-v5.png"),
      radius: 1.1,
    }),
    extra("bed", "Bed", 2, 0.6, {
      solid: true,
      platform: true,
      image: art("bed-v4.png"),
    }),
    extra("couch", "Couch", 2, 0.9, { solid: true, image: art("couch-v4.png") }),
    extra("mirror", "Restroom mirror", 3, 1.2, {
      facing: "wall",
      fullbright: true,
      image: art("mirror-v4.png"),
    }),
    extra("pod-woman", "Captive woman (alien pod)", 1.4, 2.2, {
      solid: true,
      fullbright: true,
      image: art("pod-woman-v4.png"),
    }),
    extra("atomic", "ATOMIC HEALTH +50", 0.6, 0.6, {
      image: art("atomic-v4.png"),
      kind: "pickup",
      fullbright: true,
      pickup: { type: "health", amount: 50, max: 200 },
    }),
    extra("portable-medkit", "PORTABLE MEDKIT", 0.6, 0.5, {
      image: art("portable-medkit-v4.png"),
      kind: "pickup",
      fullbright: true,
      pickup: { type: "health", amount: 30 },
    }),
    extra("steroids", "STEROIDS", 0.35, 0.5, {
      image: art("steroids-v5.png"),
      kind: "pickup",
      fullbright: true,
      pickup: { type: "item", itemId: "steroids" },
    }),
    extra("jetpack", "JETPACK", 0.7, 0.8, {
      image: art("jetpack-v5.png"),
      kind: "pickup",
      fullbright: true,
      pickup: { type: "item", itemId: "jetpack" },
    }),
    extra("pipebombs", "PIPE BOMBS", 0.7, 0.45, {
      image: art("pipebombs-v5.png"),
      kind: "pickup",
      fullbright: true,
      pickup: { type: "item", itemId: "pipebombs" },
    }),
    extra("nightvision", "NIGHT VISION GOGGLES", 0.7, 0.4, {
      image: art("nightvision-v5.png"),
      kind: "pickup",
      fullbright: true,
      pickup: { type: "item", itemId: "nightvision" },
    }),
    extra("rockets", "RPG ROCKETS +5", 0.7, 0.45, {
      image: art("rockets-v4.png"),
      kind: "pickup",
      fullbright: true,
      pickup: { type: "ammo", weaponId: "rpg", amount: 5 },
    }),
    extra("rpg-pickup", "RPG +5 ROCKETS", 1.2, 0.4, {
      image: art("rpg-pickup-v4.png"),
      kind: "pickup",
      fullbright: true,
      pickup: { type: "weapon", weaponId: "rpg", amount: 5 },
    }),
  );
  fps.weapons.push({
    id: "rpg",
    name: "RPG",
    view: { scale: 0.95, x: 0.1, y: -0.62 },
    sheet: {
      image: art("rpg-v4-sheet.png"),
      frameWidth: 128,
      frameHeight: 128,
      animations: {
        idle: { frames: [0] },
        fire: { frames: [1, 2, 3, 0], fps: 8, loop: false },
      },
    },
    damage: 140,
    interval: 1.1,
    range: 45,
    ammo: 0,
    splash: 3.4,
    splashDamage: 140,
  });

  // ---- Placement -------------------------------------------------------------
  const entities: FpsEntity[] = [];
  let serial = 0;
  const place = (
    sprite: string,
    x: number,
    z: number,
    extra: Partial<FpsEntity> = {},
  ) =>
    entities.push({ id: `hh-${sprite}-${++serial}`, sprite, x, z, ...extra });
  const enemy = (sprite: string, id: string, x: number, z: number, yaw = 0) =>
    place(sprite, x, z, { id, yaw: yaw * D });

  // Rooftop. The C-9 canisters sit in the corner by the vent, as in the original.
  place("hvac", 4, 3.6);
  place("hvac", 9.6, 8.6);
  place("aerial", 3.2, 8.8);
  place("crate", 5.2, 6);
  place("pistol-ammo", 4.4, 6); // "Turn around to get the pistol ammo behind the box."
  place("c9", 12.2, 4.4, { id: "roof-c9", targets: ["roof-hatch"] });
  place("c9", 12.2, 7.6, { id: "roof-c9-2", targets: ["roof-hatch"] });
  place("fan", 13.45, 6, {
    id: "roof-fan",
    y: 5.4,
    yaw: 90 * D,
    targets: ["roof-hatch"],
  });
  enemy("trooper", "roof-trooper", 4.5, 9, 0);

  // Street. Land on the large medkit; the dumpster burns straight ahead.
  place("medkit", 14.7, 6, { id: "landing-medkit" });
  place("dumpster-burning", 17.2, 5.2);
  place("pistol-ammo", 17.2, 6.6);
  place("crate", 14.7, 16.5, { id: "ledge-crate" }); // Jump on the box, then the sloped ledge.
  place("innocent", 13.06, 8, { y: 4.4, yaw: 90 * D });
  place("rpg-pickup", 13.5, 7.5, { id: "billboard-rpg" });
  place("atomic", 13.5, 18.5, { id: "ledge-atomic" });
  place("facade-windows", 13.04, 20.5, { y: 4.8, yaw: 90 * D });
  place("facade-windows", 13.04, 31, { y: 2.2, yaw: 90 * D });
  place("facade-windows", 13.04, 31, { y: 6, yaw: 90 * D });
  place("facade-windows", 13.04, 42, { y: 2.2, yaw: 90 * D });
  place("facade-windows", 26.96, 6, { y: 5.2, yaw: -90 * D });
  place("facade-windows", 26.96, 31, { y: 5.2, yaw: -90 * D });
  place("facade-windows", 26.96, 31, { y: 8.4, yaw: -90 * D });
  place("hydrant", 25.4, 24.5); // Shoot and use it for health (decorative here).
  place("hydrant", 25.6, 38.4); // "Take the alley on the left, by the hydrant."
  place("palm", 24.6, 12.5);
  place("palm", 24.6, 28);
  place("palm", 15.6, 34);
  place("streetlamp", 15.4, 15);
  place("streetlamp", 25.2, 19);
  place("streetlamp", 15.4, 40);
  place("newspaper", 15.5, 24.5);
  place("phonebooth", 15.6, 44.6);
  place("no-parking", 26.96, 12, { y: 1.8, yaw: -90 * D });
  place("ledge-sign", 26.96, 44, { y: 3, yaw: -90 * D });
  place("bench", 16, 28.5);
  place("trash-can", 26.3, 44.5);
  enemy("trooper", "street-trooper", 20, 12, 0);
  enemy("trooper", "street-trooper-2", 22, 27, 0);
  enemy("pigcop", "street-pigcop", 20, 40, 0);

  // Apartment (secrets 2 & 3).
  place("bed", 8, 12.5, { id: "apartment-bed" });
  place("rockets", 8, 12.5, { id: "apartment-rockets", y: 3.3 });
  place("pistol-ammo", 10.5, 14.5);
  place("monitor", 11.5, 10.6, { y: 3.8 });
  place("poster-bimbos", 6.08, 13, { y: 3.1, yaw: 90 * D });
  place("steroids", 5, 13, { id: "poster-steroids" });
  place("wastebasket", 7, 10.6);
  enemy("trooper", "apartment-trooper", 10, 11.5, 90);

  // Cinema facade and front foyer.
  place("cinema-sign", 27.05, 15, { y: 5.4, yaw: -90 * D });
  place("marquee-v2", 27.06, 20.5, { y: 3.4, yaw: -90 * D });
  place("cracked-wall", 26.95, 17.5, {
    id: "front-crack",
    yaw: -90 * D,
    targets: ["crack-door", "front-door"],
  });
  place("poster", 26.94, 23.2, { y: 0.8, yaw: -90 * D });
  place("poster-bimbos", 26.94, 15.8, { y: 0.8, yaw: -90 * D });
  place("pistol-ammo", 30.5, 23.5);
  // Bachelor pad (secret 8): shotgun, RPG and pipe bombs.
  place("bed", 31, 26.5, { id: "pad-bed" });
  place("shotgun-pickup", 28.8, 25.6, { id: "pad-shotgun" });
  place("rpg-pickup", 29.6, 27.4, { id: "pad-rpg" });
  place("pipebombs", 28.8, 27.4);
  place("poster-bimbos", 32.94, 26.5, { y: 3.6, yaw: -90 * D });
  place("palm", 25.6, 26.5); // Jump from the tree to the window in the original.
  place("monitor", 28.6, 16.6, { y: 1.4 });
  place("fern", 31.5, 16.7);
  place("keep-out", 27.1, 20.5, { y: 1.9, yaw: 90 * D });
  enemy("trooper", "foyer-trooper", 30.5, 19.5, -90);

  // Lobby, counter and secrets 4.
  place("register", 40, 15.5, {
    id: "cash-register",
    y: 0.96,
    hotspotId: "hh-register",
    targets: ["compartment"],
    message: "CASH REGISTER",
  });
  place("popcorn", 37.5, 15.5, { y: 0.96 });
  place("soda", 42.2, 15.5, { y: 0.96 });
  place("soda", 38.9, 15.5, { y: 0.96 });
  place("shotgun-pickup", 46, 13.6, { id: "lobby-shotgun" });
  place("shells", 47.3, 14.4);
  place("monitor", 47.4, 13.3, { y: 1.3 });
  place("atomic", 34.6, 13.6, { id: "nook-atomic" });
  place("armor", 41, 27.5, { id: "compartment-armor", y: 3 });
  place("arcade", 33.06, 22.5, { yaw: 90 * D });
  place("arcade", 33.06, 23.5, { yaw: 90 * D });
  place("arcade", 33.06, 24.5, { yaw: 90 * D });
  place("arcade", 33.06, 25.5, { yaw: 90 * D });
  place("poster", 40, 13.06, { y: 1, yaw: 0 });
  place("poster", 46, 26.94, { y: 1, yaw: Math.PI });
  place("fern", 47.3, 26.2);
  place("fern", 33.8, 17);
  place("payphone", 47.94, 19, { y: 1, yaw: -90 * D });
  place("trash-can", 48.5, 21.5, { id: "elevator-can" });
  place("medkit", 34.5, 26.2);
  enemy("trooper", "lobby-trooper", 38, 20, -90);
  enemy("pigcop", "lobby-pigcop", 44, 23, 90);

  // Restroom (secret 5 via the vent).
  place("mirror", 53.5, 13.06, { y: 1.1 });
  place("sink", 52, 13.7);
  place("sink", 55, 13.7);
  place("couch", 51.5, 17.6, { id: "restroom-couch" });
  place("shells", 50.5, 18.5);
  place("urinal", 56.94, 14.5, { y: 0.4, yaw: -90 * D });
  place("urinal", 56.94, 15.5, { y: 0.4, yaw: -90 * D });
  place("toilet", 52.5, 18.6);
  place("toilet", 54.5, 18.6);
  enemy("trooper", "stall-trooper", 54.5, 18.4, 0);
  place("portable-medkit", 56, 18, { y: 1.4 });
  place("vent", 56.96, 17.5, {
    id: "restroom-vent",
    y: 2.6,
    yaw: -90 * D,
    targets: [],
  });
  place("pod-woman", 60.5, 30.5, { id: "captive" });
  place("monitor", 61.9, 29, { y: 3.6, yaw: -90 * D });
  place("extinguisher", 56.9, 30.6, { y: 4, yaw: -90 * D });

  // Projection room (secret 6) and the curtain switch.
  place("projector", 53, 29.6, { id: "projector" });
  place("crate", 54.6, 31.2, { id: "projector-step" }); // Hop: crate → projector.
  place("atomic", 53, 29.6, {
    id: "projector-atomic",
    y: 4.7,
    targets: ["rpg-wall"],
  });
  place("rpg-pickup", 50.5, 28.15, { id: "projector-rpg", y: 3 });
  place("red-key", 56.4, 31.4, { id: "projection-red-key" });
  place("film-reel", 55.5, 28.6);
  place("shells", 51.5, 31.4);
  place("switch", 50.06, 30.6, {
    y: 4.1,
    yaw: 90 * D,
    targets: ["curtain"],
    message: "PROJECTOR — CURTAIN",
  });
  place("glass", 48.06, 29.5, { id: "projection-glass", y: 3, yaw: -90 * D });
  enemy("trooper", "projection-trooper", 51.5, 29, 90);

  // Ramp / hallway and the elevator loop with the C-9 wall.
  place("medkit", 57.5, 26.5);
  place("fire", 52.5, 25.5, { y: 0.9 });
  place("c9", 56.3, 22.6, { id: "corridor-c9", targets: ["c9-wall"] });
  place("extinguisher", 56.9, 21, { y: 3, yaw: -90 * D });
  place("nightvision", 48.4, 20.5, { y: 2.2, id: "can-goggles" });
  place("pipebombs", 49.2, 20.5, { y: 2.2 });
  place("portable-medkit", 48.8, 20.3, { y: 2.2 });
  place("pistol-ammo", 51, 22);
  enemy("trooper", "corridor-trooper", 54, 22, 90);

  // Theatre: seats face the curtain in the west; the screen crack is behind it.
  for (const x of [38, 40, 42, 44])
    for (const z of [30, 31.5, 33.5, 35]) {
      place("seat-back", x + 0.025, z, { yaw: 90 * D });
      place("seat-front", x - 0.025, z, { yaw: -90 * D });
    }
  place("pistol-ammo", 41, 32.5);
  place("armor", 34, 29.6); // "Get the armor at the end of the stage."
  place("pistol-ammo", 47.4, 34.4); // Behind the side door you entered.
  place("screen", 32.25, 32.5, { y: 1, yaw: 90 * D });
  place("screen-crack", 32.3, 32.5, {
    id: "screen-crack",
    y: 1.2,
    yaw: 90 * D,
    targets: ["screen-door"],
  });
  place("jetpack", 30, 32.5, { id: "backstage-jetpack" });
  place("shells", 30, 34.5);
  place("monitor", 29.06, 30, { y: 1.5, yaw: 90 * D });
  enemy("pigcop", "theatre-pigcop", 40, 32.5, 90);
  enemy("trooper", "theatre-trooper", 45, 29.5, 180);

  // Alley, stairs, upper room, red door, bridge and exit.
  place("trash-bags", 30, 42.5);
  place("dumpster", 40, 42.8);
  place("junction", 45, 43.9, { y: 1.2 });
  place("trash-can", 52, 40);
  place("exit-sign", 53.5, 38.35, { y: 3.3, yaw: 0 });
  enemy("pigcop", "alley-pigcop", 34, 41, -90);
  enemy("pigcop", "alley-pigcop-2", 50, 41.5, -90);
  place("pistol-ammo", 51, 34);
  place("facade-windows", 57.94, 35, { y: 2, yaw: -90 * D });
  place("c9", 57.6, 38.3, { id: "bridge-c9", targets: ["blast-wall"] });
  enemy("pigcop", "upper-pigcop", 55, 35, -90);
  place("glass", 57, 44.02, {
    id: "exit-pane",
    y: 2.1,
    yaw: Math.PI,
    targets: ["exit-glass"],
  });
  place("end-switch", 57, 45.95, {
    id: "level-exit",
    y: 2.5,
    yaw: Math.PI,
    hotspotId: "hh-finish",
    message: "EXIT — HOLLYWOOD HOLOCAUST",
  });
  fps.entities = entities;
  fps.zones = [
    // The eight counted secrets of the original level.
    {
      id: "s1-billboard",
      name: "Secret 1 — beneath the billboard",
      x: 13,
      z: 7,
      w: 1,
      d: 2,
      secret: true,
      message: "",
    },
    {
      id: "s2-apartment",
      name: "Secret 2 — rockets on the apartment bed",
      x: 7,
      z: 12,
      w: 2,
      d: 1,
      secret: true,
      message: "",
    },
    {
      id: "s3-steroids",
      name: "Secret 3 — steroids behind the poster",
      x: 4,
      z: 12,
      w: 2,
      d: 2,
      secret: true,
      message: "",
    },
    {
      id: "s4-compartment",
      name: "Secret 4 — cash register compartment",
      x: 40,
      z: 27,
      w: 2,
      d: 1,
      secret: true,
      message: "",
    },
    {
      id: "s5-captive",
      name: "Secret 5 — captive woman",
      x: 59,
      z: 28,
      w: 3,
      d: 4,
      secret: true,
      message: "",
    },
    {
      id: "s6-projector",
      name: "Secret 6 — inside the projector room",
      x: 50,
      z: 28,
      w: 1,
      d: 1,
      secret: true,
      message: "",
    },
    {
      id: "s7-backstage",
      name: "Secret 7 — behind the cinema screen",
      x: 29,
      z: 29,
      w: 3,
      d: 7,
      secret: true,
      message: "",
    },
    {
      id: "s8-bachelor",
      name: "Secret 8 — bachelor pad above the cinema",
      x: 28,
      z: 25,
      w: 5,
      d: 3,
      secret: true,
      message: "",
    },
    {
      id: "street",
      name: "Hollywood Boulevard",
      x: 14,
      z: 2,
      w: 13,
      d: 46,
      message: "HOLLYWOOD BOULEVARD",
    },
    {
      id: "theatre",
      name: "Theatre",
      x: 33,
      z: 28,
      w: 15,
      d: 9,
      message: "THEATRE — THE EXITS LEAD TO THE LOBBY",
    },
    {
      id: "projection",
      name: "Projection room",
      x: 50,
      z: 28,
      w: 7,
      d: 4,
      message: "PROJECTION ROOM",
    },
  ];
  applyHollywoodFidelity(fps);
  fps.skyImage = art("sky-v6.png");
  fps.skyColor = "#070b0f";
  fps.fogDistance = 80;
  return {
    map: grid.map((row) => row.join("")),
    fps,
    fov: 90,
    mouseLook: true,
  };
}
export const HOLLYWOOD_OPENING: Story = {
  id: "hollywood-opening",
  title: "Duke Nukem 3D — Hollywood Holocaust",
  tagline: "L.A. Meltdown · E1L1. The city is under new management.",
  gameKind: "first-person",
  coverImage: art("cover-v2.webp"),
  startSceneId: "hh-opening",
  characters: [],
  items: [],
  briefing: {
    objective:
      "Escape the rooftop, fight through the theatre, find the red access card in the projector room and hit the exit switch across the alley bridge.",
    gameInfo:
      "An unofficial, newly illustrated reconstruction of Hollywood Holocaust (E1L1). An editable reconstruction with a classic status bar, dark city skyline, true slopes, dimensional architecture, dodgeable trooper bolts and usable equipment. Route: rooftop C-9 vent, street landing, crate and sloped ledge, apartment windows, INNOCENT? billboard, cracked wall or alley entry, alley stairs, theatre, lobby counter, shotgun room, cash-register lift, restroom vent, captive woman, projector room, curtain switch, screen crack, red door, ramp, blown wall, bridge and glass exit button. Eight counted secrets and 17 placed enemies, including the optional rooftop turrets. WASD move, mouse/arrows aim, F/click fire, E use, Space jump, C crouch, Shift run, 2 pistol, 3 shotgun, 5 RPG, 1 kick, R reload, J jetpack, B steroids, N night vision, M medkit, H Holoduke, 6 throw pipe bomb, G detonate, [ ] inventory, Enter use item, Tab map, Esc pause/save. Approx. 10–15 minutes. No extracted Duke game data; all art is new. Everything is editable under Studio → Stage → First-person tools.",
    winConditions: [
      "Find the red access card in the projection room.",
      "Cross the bridge over the alley and use the exit switch behind the glass.",
    ],
    loseConditions: ["Health reaches zero; restart the level or load a save."],
  },
  dialogueBox: {
    hudTheme: "sepia-pulp",
    accentColor: "#e7be75",
    minimalHud: true,
  },
  scenes: [
    {
      id: "hh-opening",
      title: "Hollywood Holocaust",
      nodeType: "stage",
      hideHud: true,
      hideSceneTitle: true,
      background: art("sky-v6.png"),
      prose: "",
      choices: [],
      noTypewriter: true,
      particles: "none",
      ambientAudio: "none",
      cinematic: { mode: "static", dimAmount: 0 },
      transitionSpeed: 0.2,
      stage: { keyboard: true, quake: hollywoodRoom() },
      hotspots: [
        {
          id: "hh-finish",
          label: "Leave Hollywood",
          cursor: "go",
          bounds: { x: 50, y: 50, w: 10, h: 10 },
          action: { type: "goToScene", targetSceneId: "hh-end" },
        },
        {
          id: "hh-register",
          label: "Cash register",
          cursor: "use",
          bounds: { x: 60, y: 50, w: 10, h: 10 },
          action: {
            type: "showText",
            text: "The drawer pops open. Somewhere behind you, a panel slides.",
          },
        },
      ],
      note: "FIRST-PERSON AUTHORING: Stage → First-person tools. Map 64×50. Spawn (7.5,6). Roof C-9 opens the vent at (13.5,6). Cracked wall (27,17.5) or alley door (53.5,38.6) → theatre side door (49.5,34.5). Shotgun room (44.5,14). Register lift (41,26). Restroom vent (57,17.5) → duct → captive woman (59..61,28..31) → brick wall (57.5,29.5) → projection room. Red card (56.4,31.4). Curtain switch (50,30.6). Red door (57,37.3), C-9 (57.6,38.3), bridge z 39–44, glass (57,44), exit switch (57,45.95). Full guide: docs/first-person.md.",
    },
    {
      id: "hh-end",
      title: "Hollywood Holocaust — Cleared",
      background: art("cover-v2.webp"),
      prose:
        "LEVEL CLEARED.\n\nYou dropped off the roof, cut through the theatre, took the red access card from the projector room and crossed the bridge over the alley.\n\nNext stop: Red Light District.",
      noTypewriter: true,
      choices: [],
      hotspots: [],
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "HOLLYWOOD HOLOCAUST — CLEARED",
        recap:
          "Rooftop, street, theatre, projector room, bridge, exit. Eight secrets and the optional turret roof were hidden along the way.",
      },
      particles: "none",
      ambientAudio: "none",
    },
  ],
};
