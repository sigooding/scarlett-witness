import type { QuakeModeSettings } from "../../types";
import type { FpsSettings, FpsSprite } from "./types";
const art = (name: string) => `/img/hollywood-opening/${name}`;
const prop = (
  id: string,
  name: string,
  width: number,
  height: number,
  solid = false,
): FpsSprite => ({
  id,
  name,
  kind: "prop",
  image: art(`${id}.png`),
  width,
  height,
  solid,
  radius: width * 0.3,
});
const pickup = (
  id: string,
  name: string,
  p: NonNullable<FpsSprite["pickup"]>,
): FpsSprite => ({
  ...prop(id, name, 0.65, 0.5),
  kind: "pickup",
  fullbright: true,
  pickup: p,
});
const enemy = (
  id: string,
  name: string,
  health: number,
  damage: number,
): FpsSprite => ({
  id,
  name,
  kind: "enemy",
  solid: true,
  width: 1.8,
  height: 1.8,
  radius: 0.34,
  health,
  damage,
  speed: 0.85,
  range: 15,
  attackInterval: 2.2,
  directions: 4,
  sheet: {
    image: art(`${id}-v3-sheet.png`),
    frameWidth: 96,
    frameHeight: 96,
    pixelated: true,
    animations: Object.fromEntries(
      [0, 1, 2, 3].flatMap((d) => [
        [`idle-${d}`, { frames: [d * 6] }],
        [`walk-${d}`, { frames: [d * 6 + 1, d * 6, d * 6 + 2, d * 6], fps: 7 }],
        [`attack-${d}`, { frames: [d * 6 + 3] }],
        [`death-${d}`, { frames: [d * 6 + 4, d * 6 + 5], fps: 7, loop: false }],
      ]),
    ),
  },
});
export function createFpsSettings(): FpsSettings {
  const sprites: FpsSprite[] = [
    prop("hvac", "Rooftop air conditioner", 2.1, 1.4, true),
    { ...prop("crate", "Wooden crate", 1.1, 1.1, true), platform: true },
    {
      ...prop("c9", "C-9 explosive cylinder", 0.75, 1.6, true),
      kind: "explosive",
      health: 24,
      damage: 90,
      range: 3.5,
    },
    prop("dumpster", "Dumpster", 2.4, 1.4, true),
    prop("hydrant", "Fire hydrant", 0.55, 1.0, true),
    prop("palm", "Palm tree", 3, 7),
    prop("streetlamp", "Street light", 1.5, 6),
    prop("newspaper", "Newspaper box", 0.7, 1.3, true),
    prop("trash-bags", "Trash bags", 1, 0.65),
    prop("trash-can", "Metal bin", 0.7, 1.1, true),
    prop("junction", "Junction box", 0.7, 1.0),
    {
      ...prop("fan", "Breakable ventilation fan", 1.8, 1.8),
      kind: "breakable",
      health: 24,
      facing: "wall",
    },
    prop("bench", "Street bench", 2, 1.0, true),
    prop("phonebooth", "Phone booth", 1.3, 2.4, true),
    prop("aerial", "Aerial", 2, 3),
    { ...prop("fire", "Fire", 0.9, 1.5), fullbright: true },
    {
      ...prop("seat-front", "Cinema seat / front", 0.85, 1.2, true),
      facing: "wall",
    },
    {
      ...prop("seat-back", "Cinema seat / back", 0.85, 1.2, true),
      facing: "wall",
    },
    { ...prop("arcade", "Arcade cabinet", 0.95, 2, true), facing: "wall" },
    prop("popcorn", "Popcorn machine", 1, 1.3),
    prop("register", "Cash register", 0.65, 0.5),
    prop("soda", "Soda cup", 0.22, 0.35),
    prop("urinal", "Urinal", 0.6, 1.2),
    prop("toilet", "Toilet", 0.8, 0.9, true),
    prop("sink", "Sink", 0.85, 0.9),
    prop("extinguisher", "Fire extinguisher", 0.35, 0.8),
    prop("projector", "Film projector", 1.2, 1.8, true),
    prop("fern", "Potted fern", 0.9, 1.5),
    prop("film-reel", "Film reel", 0.6, 0.6),
    prop("wastebasket", "Wastebasket", 0.55, 0.7),
    prop("payphone", "Wall payphone", 0.5, 0.8),
    prop("monitor", "Security monitor", 0.8, 0.7),
    ...[
      ["cinema-sign", "Vertical cinema sign", 1.5, 5],
      ["marquee", "Cinema marquee", 7, 1.6],
      ["innocent", "Innocent? billboard", 6, 2.4],
      ["exit-sign", "Illuminated exit sign", 1.3, 0.65],
      ["no-parking", "No parking sign", 0.7, 1],
      ["poster", "Movie poster", 1, 1.6],
      ["screen", "Movie screen", 7, 4],
    ].map(([id, name, w, h]) => ({
      ...prop(id as string, name as string, w as number, h as number),
      facing: "wall" as const,
      fullbright: true,
    })),
    {
      ...prop("switch", "Wall switch", 0.4, 0.6),
      kind: "switch",
      facing: "wall",
      fullbright: true,
    },
    {
      ...prop("end-switch", "End level switch", 0.65, 1),
      kind: "exit",
      facing: "wall",
      fullbright: true,
    },
    enemy("trooper", "Assault trooper", 60, 3),
    enemy("pigcop", "Pig cop", 95, 5),
    pickup("medkit", "LARGE MEDKIT +30", { type: "health", amount: 30 }),
    pickup("armor", "BODY ARMOR +50", { type: "armor", amount: 50 }),
    pickup("pistol-ammo", "PISTOL AMMO +24", {
      type: "ammo",
      weaponId: "pistol",
      amount: 24,
    }),
    pickup("shells", "SHOTGUN SHELLS +12", {
      type: "ammo",
      weaponId: "shotgun",
      amount: 12,
    }),
    pickup("shotgun-pickup", "SHOTGUN +12 SHELLS", {
      type: "weapon",
      weaponId: "shotgun",
      amount: 12,
    }),
    pickup("red-key", "RED ACCESS CARD", { type: "key", keyId: "red" }),
    pickup("blue-key", "BLUE ACCESS CARD", { type: "key", keyId: "blue" }),
  ];
  // Versioned files leave old authored/published atlases intact. Width and
  // height here describe the picture; existing collision radii are retained.
  const classicProps: Record<string, Partial<FpsSprite>> = {
    c9: { image: art("c9-v3.png"), width: 1.0 },
    medkit: { image: art("medkit-v3.png") },
    armor: { image: art("armor-v3.png"), height: 0.8 },
    "pistol-ammo": {
      image: art("pistol-ammo-v3.png"),
      width: 0.22,
      height: 0.48,
    },
    shells: { image: art("shells-v3.png"), width: 0.5, height: 0.35 },
    "shotgun-pickup": {
      image: art("shotgun-pickup-v3.png"),
      width: 1.05,
      height: 0.22,
    },
    popcorn: { image: art("popcorn-v3.png") },
    arcade: { image: art("arcade-v3.png") },
  };
  for (const sprite of sprites)
    Object.assign(sprite, classicProps[sprite.id] ?? {});
  return {
    version: 1,
    // Texture pass 2 (seamless 256px, Build-era palette). The legacy tex-*.webp
    // files stay on disk for older authored/published reels.
    materials: [
      ...["windows", "shutter", "asphalt", "gravel"].map((id) => ({
        id,
        name: id,
        image: art(`tex-${id}.webp`),
      })),
      ...[
        "brick",
        "concrete",
        "carpet",
        "facade",
        "curtain",
        "lobby-wall",
        "wood-panel",
        "metal-panel",
      ].map((id) => ({ id, name: id, image: art(`tex2-${id}.webp`) })),
      { id: "tiles", name: "tiles", image: art("tex2-bathroom-tile.webp") },
      {
        id: "bathroom-tile",
        name: "bathroom-tile",
        image: art("tex2-bathroom-tile.webp"),
      },
    ],
    tiles: {
      "#": {
        name: "Brick wall",
        solid: true,
        wallHeight: 10,
        wallMaterial: "brick",
      },
      ".": {
        name: "Street",
        floor: 0,
        ceiling: null,
        floorMaterial: "asphalt",
        wallMaterial: "brick",
        light: 0.8,
      },
      S: {
        name: "Spawn floor",
        floor: 0,
        ceiling: null,
        floorMaterial: "asphalt",
        light: 0.8,
      },
      r: {
        name: "Rooftop",
        floor: 5.4,
        ceiling: null,
        floorMaterial: "gravel",
        wallMaterial: "brick",
        light: 0.8,
      },
      p: {
        name: "Roof parapet",
        solid: true,
        wallHeight: 6.1,
        wallMaterial: "concrete",
      },
      i: {
        name: "Cinema lobby",
        floor: 0,
        ceiling: 4.2,
        floorMaterial: "carpet",
        wallMaterial: "brick",
        ceilingMaterial: "concrete",
        light: 0.85,
      },
      t: {
        name: "Auditorium",
        floor: 0,
        ceiling: 6,
        floorMaterial: "carpet",
        wallMaterial: "brick",
        ceilingMaterial: "concrete",
        light: 0.57,
      },
      b: {
        name: "Bathroom",
        floor: 0,
        ceiling: 3,
        floorMaterial: "tiles",
        wallMaterial: "tiles",
        ceilingMaterial: "tiles",
        light: 0.9,
      },
      u: {
        name: "Upper projection floor",
        floor: 2.4,
        ceiling: 6,
        floorMaterial: "gravel",
        wallMaterial: "concrete",
        light: 0.85,
      },
      c: {
        name: "Low counter",
        solid: true,
        wallHeight: 0.95,
        wallMaterial: "shutter",
      },
    },
    sprites,
    entities: [],
    doors: [],
    zones: [],
    spawn: { x: 3.5, z: 7.5, yaw: 0 },
    effects: {
      explosionImages: [
        art("blast-1.png"),
        art("blast-2.png"),
        art("blast-3.png"),
      ],
      impactImage: art("spark.png"),
    },
    skyImage: art("sky-v2.webp"),
    skyColor: "#1b1420",
    fogDistance: 65,
    renderHeight: 360,
    moveSpeed: 3.4,
    runMultiplier: 1.65,
    health: 100,
    armor: 0,
    weapons: [
      {
        id: "pistol",
        name: "PISTOL",
        view: { scale: 0.72, x: 0.06, y: -0.67 },
        sheet: {
          image: art("pistol-v3-sheet.png"),
          frameWidth: 128,
          frameHeight: 128,
          animations: {
            idle: { frames: [0] },
            fire: { frames: [1, 2, 0], fps: 14, loop: false },
            reload: { frames: [3] },
          },
        },
        damage: 26,
        interval: 0.25,
        range: 35,
        ammo: 60,
        clipSize: 12,
        reloadTime: 0.8,
      },
      {
        id: "shotgun",
        name: "SHOTGUN",
        view: { scale: 0.82, x: 0.16, y: -0.64 },
        sheet: {
          image: art("shotgun-v3-sheet.png"),
          frameWidth: 128,
          frameHeight: 128,
          animations: {
            idle: { frames: [0] },
            fire: { frames: [1, 2, 3, 0], fps: 7, loop: false },
          },
        },
        damage: 20,
        interval: 0.72,
        range: 27,
        ammo: 0,
        pellets: 7,
        spread: 0.14,
      },
    ],
    intro:
      "WASD to move • Mouse or arrow keys to aim • Click / F to fire • E to use • Space to jump • Shift to run",
    objective:
      "Explore the room. Connect an exit sprite to a Go to scene hotspot in Studio.",
  };
}
export function createFpsRoom(): QuakeModeSettings {
  const fps = createFpsSettings();
  fps.entities = [
    { id: "practice-cylinder", sprite: "c9", x: 3.5, z: 3.5 },
    { id: "practice-ammo", sprite: "pistol-ammo", x: 5.5, z: 6.5 },
  ];
  return {
    map: [
      "##########",
      "#........#",
      "#........#",
      "#........#",
      "#........#",
      "#........#",
      "#........#",
      "#..S.....#",
      "#........#",
      "##########",
    ],
    fps,
    fov: 90,
    mouseLook: true,
  };
}
