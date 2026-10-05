import type { FpsDetail, FpsEntity, FpsSettings, FpsSprite } from "../game/fps/types";

const art = (name: string) => `/img/hollywood-opening/${name}`;
const D = Math.PI / 180;
/** E1L1-specific art direction. All geometry is ordinary editable FPS data;
 * no renderer branches on the story ID and no older publication is overwritten. */
export function applyHollywoodFidelity(fps: FpsSettings) {
  fps.presentation = "classic";
  fps.skyMode = "cylinder";
  fps.renderHeight = 300;
  fps.objective = "Find the red access card in the projection room. Reach the exit across the alley.";
  const textures: Record<string, string> = {
    facade: "facade", brick: "brick", concrete: "concrete", gravel: "roof", asphalt: "asphalt",
    carpet: "carpet", curtain: "curtain", "lobby-wall": "lobby", "wood-panel": "wood",
    "metal-panel": "metal", shutter: "vent", "bathroom-tile": "bathroom", tiles: "tiles", windows: "windows",
  };
  for (const m of fps.materials) {
    if (textures[m.id]) m.image = art(`tex6-${textures[m.id]}.png`);
    m.repeat = m.id === "lobby-wall" ? 0.25 : m.id === "facade" ? 0.35 : 0.5;
  }
  Object.assign(fps.materials.find((m) => m.id === "glass")!, { color: "#85a1a5", opacity: 0.18 });
  fps.materials.push(
    { id: "chainlink", name: "Cutout chain-link fence", image: art("tex6-chainlink.png"), repeat: 1.6, alphaTest: 0.5 },
    { id: "boarded", name: "Boarded entrance", image: art("tex6-boarded.png"), repeat: 0.45 },
    { id: "steel-trim", name: "Dark steel trim", color: "#46473e" },
    { id: "brass-trim", name: "Tarnished brass trim", color: "#b0a06c" },
    { id: "black-trim", name: "Black framing", color: "#191c18" },
    { id: "warm-light", name: "Warm fluorescent light", color: "#eee2a2", fullbright: true },
    { id: "red-light", name: "Red neon", color: "#e84924", fullbright: true },
    { id: "road-paint", name: "Faded yellow road paint", color: "#b99e54" },
  );
  // Low, fenced rooftop and differentiated interior sectors. The adjoining
  // room now owns its wall material, which the mesher previously ignored.
  Object.assign(fps.tiles["#"], { wallHeight: 8.8 });
  Object.assign(fps.tiles.p, { wallHeight: 5.65, wallMaterial: "brick" });
  Object.assign(fps.tiles.r, { floorMaterial: "gravel", light: 0.68 });
  Object.assign(fps.tiles.v, { floorMaterial: "metal-panel", light: 0.64 });
  Object.assign(fps.tiles["."], { light: 0.69 });
  Object.assign(fps.tiles.a, { light: 0.55 });
  Object.assign(fps.tiles.i, { light: 0.75 });
  Object.assign(fps.tiles.t, { light: 0.43, wallMaterial: "wood-panel" });
  Object.assign(fps.tiles.b, { light: 0.81 });
  Object.assign(fps.tiles.P, { light: 0.62 });

  const sprite = (id: string, values: Partial<FpsSprite>) => Object.assign(fps.sprites.find((s) => s.id === id)!, values);
  sprite("trooper", { attack: "projectile", projectileSpeed: 8, projectileColor: "#8be846", damage: 5 });
  sprite("cinema-sign", { image: art("cinema-sign-v6.png"), width: 1.05, height: 4.9 });
  sprite("marquee-v2", { image: art("marquee-v6.png"), width: 7.5, height: 1.7 });
  sprite("facade-windows", { image: art("tex6-windows.png"), fullbright: false });
  sprite("cracked-wall", { image: art("crack-v6.png"), health: 1, damageType: "explosive" });
  sprite("screen-crack", { image: art("crack-v6.png"), health: 1, damageType: "explosive" });
  sprite("glass", { image: art("glass-v6.png") });
  sprite("screen", { image: art("screen-v6.png") });
  sprite("exit-sign", { image: art("exit-sign-v6.png") });
  sprite("portable-medkit", { name: "PORTABLE MEDKIT", pickup: { type: "item", itemId: "medkit", amount: 100 } });
  sprite("hydrant", { kind: "breakable", health: 12, use: "water", brokenImage: art("hydrant-broken-v6.png"), width: 0.7, height: 1.25 });
  sprite("urinal", { use: "water", facing: "wall" });
  sprite("toilet", { use: "water" });
  // The original begins with 48 pistol rounds; each magazine contains 12.
  Object.assign(fps.weapons[0], { ammo: 48, maxAmmo: 200, slot: 2, interval: 0.2, view: { scale: 0.82, x: 0.17, y: -0.66 } });
  Object.assign(fps.weapons[1], { maxAmmo: 50, slot: 3 });
  Object.assign(fps.weapons.find((w) => w.id === "rpg")!, { maxAmmo: 50, slot: 5 });
  // Never change the shared starter's weapon tuning or character atlases.
  sprite("armor", { name: "BODY ARMOR", pickup: { type: "armor", amount: 100 } });

  const addSprite = (id: string, name: string, image: string, width: number, height: number, extra: Partial<FpsSprite> = {}) =>
    fps.sprites.push({ id, name, image: art(image), kind: "prop", width, height, ...extra });
  addSprite("skycar", "Duke's falling skycar", "skycar-v6.png", 5, 2.5, { fullbright: true });
  addSprite("turret", "Rooftop turret", "turret-v6.png", 1.2, 1.0, {
    kind: "enemy", solid: true, health: 60, damage: 3, attack: "projectile", projectileSpeed: 10, projectileColor: "#ffad36", radius: 0.4, speed: 0, range: 18, attackInterval: 1.5,
  });
  addSprite("holoduke", "HOLODUKE", "holoduke-v6.png", 0.45, 0.55, {
    kind: "pickup", fullbright: true, pickup: { type: "item", itemId: "holoduke" },
  });
  addSprite("holo-decoy", "Activated Holoduke", "holo-decoy-v6.png", 1.1, 1.85, { fullbright: true });
  addSprite("boot-view", "Mighty foot view", "boot-v6.png", 1, 1);
  addSprite("restroom-sign", "Restrooms", "restroom-sign-v6.png", 1.7, 0.42, { facing: "wall" });
  addSprite("box-office-sign", "Box office", "box-office-v6.png", 1.5, 0.38, { facing: "wall" });
  addSprite("red-reader", "Red access-card reader", "reader-v6.png", 0.26, 0.4, { facing: "wall", fullbright: true });

  const doors = new Map(fps.doors.map((d) => [d.id, d]));
  for (const id of ["roof-hatch", "crack-door", "screen-door", "c9-wall", "blast-wall", "exit-glass"])
    Object.assign(doors.get(id)!, { motion: "break" });
  for (const id of ["foyer-doors", "theatre-door-w", "theatre-door-e", "curtain"])
    Object.assign(doors.get(id)!, { motion: "split" });
  Object.assign(doors.get("front-door")!, { material: "boarded", sealed: true, key: undefined, lockedMessage: "BOARDED UP. LOOK FOR THE ALLEY ENTRANCE." });
  Object.assign(doors.get("crack-door")!, { lockedMessage: "A CRACK IN THE WALL. TRY AN EXPLOSIVE." });
  Object.assign(doors.get("roof-hatch")!, { material: "metal-panel", height: 1.6 });
  // A boot-high bridge lip is not an opaque wall; its real underside can be
  // passed beneath from the alley. Door collision uses the same slab bounds.
  Object.assign(doors.get("bridge")!, { material: "metal-panel" });

  const entity = (id: string) => fps.entities.find((e) => e.id === id)!;
  // The opening roof is a quiet establishing shot, not an invented ambush.
  fps.entities = fps.entities.filter((e) => e.id !== "roof-trooper" &&
    !["facade-windows", "hvac"].includes(e.sprite));
  entity("front-crack").targets = ["crack-door"];
  Object.assign(entity("roof-fan"), { x: 13.34, yaw: -90 * D, attachedTo: "roof-hatch" });
  // Art must not remain floating across a passage after the panel is opened.
  fps.entities.find((e) => e.sprite === "screen")!.attachedTo = "screen-door";
  fps.entities.find((e) => e.sprite === "poster-bimbos" && e.x < 7)!.attachedTo = "poster-door";
  entity("exit-pane").attachedTo = "exit-glass";
  // Show the cinema sign from the street instead of embedding it in solid stone.
  const cinema = fps.entities.find((e) => e.sprite === "cinema-sign")!;
  Object.assign(cinema, { x: 26.76, z: 15, y: 3.65 });
  Object.assign(fps.entities.find((e) => e.sprite === "marquee-v2")!, { x: 26.12, y: 3.35 });
  fps.entities.find((e) => e.sprite === "keep-out")!.yaw = -90 * D;
  // Hydrant/palm collision and billboard presentation retain stable instance IDs.
  const put = (id: string, sprite: string, x: number, z: number, more: Partial<FpsEntity> = {}) =>
    fps.entities.push({ id: `v6-${id}`, sprite, x, z, ...more });
  put("skycar", "skycar", 15, 9.5, { y: 9.5, flyby: { x: 15, y: -4, z: -20, duration: 2.4 } });
  put("turret-west", "turret", 56.2, 47.3, { y: 5.1 });
  put("turret-east", "turret", 60.5, 46.4, { y: 5.1 });
  put("roof-shells", "shells", 59, 47.6, { y: 5.1 });
  put("roof-jetpack", "jetpack", 60, 47.8, { y: 5.1 });
  put("restrooms", "restroom-sign", 49.78, 16, { y: 2.85, yaw: -90 * D });
  put("box-office", "box-office-sign", 26.93, 17.5, { y: 3.1, yaw: -90 * D });
  put("red-reader", "red-reader", 55.94, 36.9, { y: 2.7, yaw: Math.PI });
  // Press the Duke Nukem II cabinet to reveal its uncounted Holoduke cache.
  const cabinet = fps.entities.find((e) => e.sprite === "arcade")!;
  cabinet.targets = ["arcade-cache"];
  cabinet.message = "DUKE NUKEM II — PLAY";
  // Only this cabinet is interactive; all still use the same newly authored art.
  addSprite("duke-arcade", "Duke Nukem II arcade", "arcade-v5.png", 1, 2.1, { use: "arcade", facing: "wall", solid: true, radius: 0.3 });
  cabinet.sprite = "duke-arcade";
  fps.doors.push({ id: "arcade-cache", name: "Arcade wall compartment", x: 34, z: 24.8, width: 0.7,
    depth: 0.35, height: 0.8, bottom: 1.0, axis: "x", material: "wood-panel", key: "sealed" });
  put("arcade-holoduke", "holoduke", 34, 25.12, { y: 1.1 });
  // Pickups may not be collected through the sealed wall (simulation verifies LOS).
  // Add vertical bounds so jetpack shortcuts don't award secrets from far above.
  for (const zone of fps.zones ?? []) if (zone.secret) {
    const floor = zone.id === "s1-billboard" ? 3.3 : zone.id === "s5-captive" ? 2.4 :
      ["s2-apartment", "s3-steroids"].includes(zone.id) ? 2.7 :
      ["s4-compartment", "s6-projector", "s8-bachelor"].includes(zone.id) ? 3 : 0;
    zone.bottom = floor - 0.1;
    zone.top = floor + 2;
  }

  const details: FpsDetail[] = [];
  const box = (id: string, x: number, z: number, bottom: number, width: number, depth: number, height: number,
    material: string, extra: Partial<FpsDetail> = {}) => details.push({ id, x, z, bottom, width, depth, height, material, ...extra });
  // Roof: diamond mesh fence, steel posts and two low sloping vent housings.
  const fence = (id: string, x: number, z: number, width: number, depth: number) => {
    box(`${id}-mesh`, x, z, 5.65, width, depth, 1.55, "chainlink", { solid: true, light: 0.7 });
    box(`${id}-rail`, x, z, 7.18, width, depth + 0.035, 0.05, "steel-trim");
    const n = Math.ceil(Math.max(width, depth) / 2.5);
    for (let i = 0; i <= n; i++) box(`${id}-post-${i}`, x + (width > depth ? (i / n - 0.5) * width : 0),
      z + (depth > width ? (i / n - 0.5) * depth : 0), 5.6, 0.08, 0.08, 1.7, "steel-trim", { solid: true });
  };
  fence("roof-north", 7.5, 2.02, 10.9, 0.04);
  fence("roof-south", 7.5, 9.98, 10.9, 0.04);
  fence("roof-west", 2.02, 6, 0.04, 7.9);
  fence("roof-east-n", 12.98, 3.48, 0.04, 2.95);
  fence("roof-east-s", 12.98, 8.52, 0.04, 2.95);
  box("north-vent", 5.4, 3.8, 5.4, 4.3, 1.7, 0.5, "metal-panel", { solid: true, topMaterial: "shutter", slope: { z: 0.32 }, light: 0.6 });
  box("south-vent", 8.8, 8.5, 5.4, 3.8, 1.6, 0.5, "metal-panel", { solid: true, topMaterial: "shutter", slope: { z: -0.22 }, light: 0.65 });
  box("vent-hood-top", 13.22, 6, 7.02, 1.3, 2.2, 0.12, "metal-panel");
  // Concrete sidewalks and curb lips: visual additions do not change the
  // canonical jump/landing heights or block the crate-to-ledge secret.
  for (const x of [14.4, 26.3]) {
    box(`sidewalk-${x}-north`, x, 10.5, 0.002, 0.7, 17, 0.035, "concrete");
    box(`sidewalk-${x}-south`, x, 32.5, 0.002, 0.7, 27, 0.035, "concrete");
  }
  for (let z = 9; z < 45; z += 5) for (const x of [20.36, 20.64])
    box(`road-line-${x}-${z}`, x, z, 0.005, 0.07, 2.7, 0.006, "road-paint", { light: 0.7 });
  // Actual bays and lintels replace giant flat wallpaper strips. Architecture
  // stays clear of the apartment openings, marquee, bachelor pad and alley.
  const windows = (side: "east" | "west", z: number, y: number, count: number) => {
    const x = side === "east" ? 26.93 : 13.06;
    for (let i = 0; i < count; i++) {
      const zz = z + i * 2.5, id = `window-${side}-${y}-${zz}`;
      box(id, x, zz, y, 0.06, 1.9, 1.65, "windows", { light: 0.76 });
      box(`${id}-sill`, x, zz, y - 0.08, 0.15, 2.1, 0.09, "concrete");
      box(`${id}-lintel`, x, zz, y + 1.65, 0.1, 2.1, 0.08, "steel-trim");
    }
  };
  windows("east", 4, 4.9, 4);
  windows("east", 29.5, 5.3, 6);
  windows("west", 22, 4.9, 10);
  windows("west", 25, 2.4, 8);
  for (const x of [13.03, 26.97]) for (const y of [4.55, 8.6])
    box(`street-cornice-${x}-${y}`, x, 27, y, 0.15, 40, 0.14, "concrete");
  for (const z of [11.02, 12.02, 13.02, 14])
    box(`apartment-mullion-${z}`, 12.96, z, 2.7, 0.14, 0.065, 1.9, "steel-trim");
  // Marquee protrudes, with a lit underside, fascia, framed entrance and poster cases.
  box("marquee-canopy", 26.53, 20.5, 3.23, 1.0, 7.8, 0.17, "steel-trim");
  box("marquee-soffit", 26.45, 20.5, 3.2, 0.8, 7.45, 0.03, "warm-light");
  box("marquee-top", 26.51, 20.5, 5.02, 1.03, 7.85, 0.15, "steel-trim");
  for (const z of [16.52, 24.48]) {
    box(`marquee-pillar-${z}`, 26.92, z, 0, 0.18, 0.22, 5.17, "steel-trim");
    box(`marquee-neon-${z}`, 26.8, z, 0.5, 0.03, 0.07, 4.4, "red-light");
  }
  for (const z of [15.8, 23.2]) {
    box(`poster-case-${z}`, 27.01, z, 0.7, 0.12, 1.12, 1.91, "brass-trim");
  }
  // Cinema: dropped ceiling strips and small brass rails instead of generic
  // enormous stone textures. These are all batched, not hundreds of draw calls.
  for (const x of [34, 38, 42, 46]) {
    box(`lobby-light-${x}`, x, 20.4, 5.06, 0.17, 9.7, 0.04, "warm-light");
    box(`lobby-light-frame-${x}`, x, 20.4, 5.1, 0.3, 10, 0.08, "steel-trim");
  }
  box("counter-top", 40, 15.5, 0.95, 8.08, 1.04, 0.035, "black-trim");
  box("counter-brass", 40, 16.008, 0.65, 8, 0.025, 0.06, "brass-trim");
  for (const x of [36, 39, 42, 44.9])
    box(`counter-panel-${x}`, x, 16.01, 0.04, 0.025, 0.02, 0.58, "brass-trim");
  // Theatre seats gain a physical plinth without changing walkable aisles.
  for (const x of [38, 40, 42, 44]) for (const z of [30, 31.5, 33.5, 35])
    box(`seat-foot-${x}-${z}`, x, z, 0, 0.45, 0.6, 0.12, "black-trim");
  for (const z of [28.04, 36.96]) {
    box(`theatre-brass-${z}`, 40.5, z, 1.1, 14.8, 0.05, 0.06, "brass-trim");
    box(`aisle-light-${z}`, 40.5, z, 0.09, 14.8, 0.02, 0.025, "red-light");
  }
  box("proscenium-top", 33.15, 32.5, 6.13, 0.4, 7.7, 0.32, "brass-trim");
  for (const z of [28.82, 36.18]) box(`proscenium-${z}`, 33.15, z, 0.35, 0.4, 0.28, 6.1, "wood-panel");
  for (const x of [51.3, 54.8]) box(`bathroom-light-${x}`, x, 15.5, 3.51, 0.12, 3.3, 0.04, "warm-light");
  box("bathroom-mirror-frame", 53.5, 13.035, 1.04, 3.16, 0.05, 1.31, "steel-trim");
  // Alley bridge hand rails and red-door trim leave the ledge shortcut intact.
  for (const x of [56.04, 57.96]) {
    box(`bridge-rail-${x}`, x, 41.4, 2.9, 0.04, 4.4, 0.06, "steel-trim");
    for (const z of [39.3, 41.4, 43.5]) box(`bridge-post-${x}-${z}`, x, z, 2.1, 0.06, 0.06, 0.84, "steel-trim");
  }
  for (const x of [55.93, 58.07]) box(`red-door-frame-${x}`, x, 37.3, 1.4, 0.12, 0.27, 2.9, "red-light");
  box("arcade-cache-left", 33.52, 25.08, 0, 0.15, 0.6, 2.0, "wood-panel", { solid: true });
  box("arcade-cache-right", 34.48, 25.08, 0, 0.15, 0.6, 2.0, "wood-panel", { solid: true });
  box("arcade-cache-back", 34, 25.42, 0, 1.1, 0.12, 2.0, "wood-panel", { solid: true });
  box("arcade-cache-base", 34, 25.08, 0, 0.82, 0.6, 1, "wood-panel", { solid: true });
  box("arcade-cache-top", 34, 25.08, 1.85, 1.1, 0.6, 0.15, "wood-panel", { solid: true });
  fps.details = details;
}
