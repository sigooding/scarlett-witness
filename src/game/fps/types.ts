import type { SpriteSheet } from "../spriteSheet";

/** Additive extension to QuakeModeSettings. Legacy grid rooms are unchanged. */
export interface FpsMaterial {
  id: string;
  name: string;
  image?: string;
  color?: string;
  /** Texture repetitions per world unit (legacy default: 0.5). */
  repeat?: number;
  opacity?: number;
  alphaTest?: number;
  fullbright?: boolean;
}
export interface FpsTile {
  name: string;
  solid?: boolean;
  floor?: number;
  /** Rise per unit east/south, measured from this cell's north-west corner. */
  slope?: { x?: number; z?: number };
  ceiling?: number | null;
  /** A finite ceiling slab with an accessible roof above it. Omitted = solid above. */
  roof?: number;
  wallHeight?: number;
  floorMaterial?: string;
  wallMaterial?: string;
  ceilingMaterial?: string;
  light?: number;
  /** Damaging surface (Quake slime / lava): `damage` every `every` seconds
   * while the player's feet are in the cell. */
  hazard?: { damage: number; every: number; message?: string };
  /** A wading pool: translucent surface at this absolute height; movement is
   * slowed below it. The tile's floor remains the pool bed. */
  water?: number;
}
/** Batched, axis-aligned architecture. Unlike billboard props these have real
 * sides, tops and undersides. Solid details also provide collision and support. */
export interface FpsDetail {
  id: string;
  x: number;
  z: number;
  bottom: number;
  width: number;
  depth: number;
  height: number;
  material: string;
  topMaterial?: string;
  light?: number;
  solid?: boolean;
  /** Optional sloping top, relative to the north-west corner. */
  slope?: { x?: number; z?: number };
}
export type FpsSpriteKind =
  | "prop"
  | "enemy"
  | "pickup"
  | "explosive"
  | "breakable"
  | "switch"
  | "exit";
export interface FpsSprite {
  id: string;
  name: string;
  kind: FpsSpriteKind;
  image?: string;
  sheet?: SpriteSheet;
  width: number;
  height: number;
  facing?: "billboard" | "wall" | "floor";
  directions?: 1 | 4 | 8;
  fullbright?: boolean;
  solid?: boolean;
  platform?: boolean;
  radius?: number;
  health?: number;
  damage?: number;
  speed?: number;
  range?: number;
  attackInterval?: number;
  attack?: "hitscan" | "projectile" | "melee";
  /** Melee reach in world units (dogs, knights, fiends, chainsaws). */
  meleeRange?: number;
  projectileSpeed?: number;
  projectileColor?: string;
  /** Cracked masonry/screens require a blast; bullets still leave impacts. */
  damageType?: "any" | "explosive";
  /** Recognised world interactions; kept separate from story hotspots. */
  use?: "water" | "arcade" | "teleport";
  /** Destination for `use: "teleport"` pads. */
  teleport?: { x: number; z: number; yaw?: number };
  /** Kept visible and usable after being shot (e.g. a leaking hydrant). */
  brokenImage?: string;
  pickup?: {
    type: "health" | "armor" | "ammo" | "weapon" | "key" | "item" | "quad";
    amount?: number;
    /** Health/armor cap for this pickup (atomic health raises it to 200). */
    max?: number;
    weaponId?: string;
    keyId?: string;
    /** Recognised items have charge, use effects and save persistence. */
    itemId?: string;
    /** Seconds for the Quad Damage power-up (default 30). */
    duration?: number;
  };
}
export interface FpsEntity {
  id: string;
  sprite: string;
  x: number;
  z: number;
  /** Absolute foot elevation. Omit to rest on the tile floor. */
  y?: number;
  yaw?: number;
  scale?: number;
  /** Doors opened on use (switch) or destruction (explosive / breakable). */
  targets?: string[];
  hotspotId?: string;
  message?: string;
  secret?: boolean;
  /** Move wall art with a door; destroyed/split panels hide it when open. */
  attachedTo?: string;
  /** A one-off fly-by relative to the placement, evaluated using saved world time. */
  flyby?: { x: number; y: number; z: number; duration: number };
}
export interface FpsDoor {
  id: string;
  name: string;
  x: number;
  z: number;
  width: number;
  height: number;
  /** x = panel spans east/west; z = panel spans north/south. */
  axis: "x" | "z";
  bottom?: number;
  material?: string;
  key?: string;
  speed?: number;
  startsOpen?: boolean;
  secret?: boolean;
  lockedMessage?: string;
  /** Intentionally never usable, such as a boarded entrance. */
  sealed?: boolean;
  /** Thickness across the panel plane. Doors default to a thin slab; lifts use a square footprint. */
  depth?: number;
  /** A lift: the slab is a standing surface that rises `lift` units when used. */
  lift?: number;
  /** Static walkable slab (a bridge or catwalk over a lower passage). */
  walkable?: boolean;
  /** Omission retains the original rising panel. */
  motion?: "raise" | "split" | "break";
}
export interface FpsZone {
  id: string;
  name: string;
  x: number;
  z: number;
  w: number;
  d: number;
  /** Optional vertical range: flying over a secret does not discover it. */
  bottom?: number;
  top?: number;
  message?: string;
  secret?: boolean;
  /** Fire this story hotspot when the player walks in (a slipgate exit, a
   * trigger line). Gated by the story's unlock rules, fired once. */
  hotspotId?: string;
}
export interface FpsWeapon {
  /** Optional view-only scale and normalized screen offsets. Legacy reels
   * keep their original framing when this is omitted. */
  view?: { scale?: number; x?: number; y?: number };
  id: string;
  name: string;
  image?: string;
  sheet?: SpriteSheet;
  damage: number;
  interval: number;
  range: number;
  ammo: number;
  maxAmmo?: number;
  /** Keyboard slot; omitted weapons retain their array-index shortcut. */
  slot?: number;
  pellets?: number;
  spread?: number;
  clipSize?: number;
  reloadTime?: number;
  /** Splash radius: the shot explodes where it lands (RPG). */
  splash?: number;
  splashDamage?: number;
  /** A swung weapon (Quake axe): no ammunition, short hitscan reach. */
  melee?: boolean;
  /** Owned from the start (Quake starts with axe + shotgun), not just the
   * first weapon in the list. */
  starting?: boolean;
  /** Shared ammunition pool id — shotguns share "shells", nailguns share
   * "nails". The HUD counts the pool, not the weapon. */
  ammoPool?: string;
  /** A launched weapon (nailgun, grenade launcher, rocket launcher). */
  projectile?: {
    speed: number;
    /** Downward acceleration for arcing shots (0 = straight). */
    gravity?: number;
    /** Restitution against walls/floors (grenades bounce). */
    bounce?: number;
    /** Seconds before the charge detonates; omitted = impact only. */
    fuse?: number;
    /** Splash radius when it explodes on impact or fuse expiry. */
    splash?: number;
    splashDamage?: number;
    color?: string;
  };
}
export interface FpsSettings {
  version: 1;
  tiles: Record<string, FpsTile>;
  materials: FpsMaterial[];
  sprites: FpsSprite[];
  entities: FpsEntity[];
  doors: FpsDoor[];
  weapons: FpsWeapon[];
  zones?: FpsZone[];
  details?: FpsDetail[];
  /** Optional game-specific presentation; old authored rooms keep the standard HUD. */
  presentation?: "classic" | "quake";
  /** Optional game-specific menu dressing (wordmark, kicker line and skill
   * names) shown on the enter/pause screen of a themed presentation. */
  menuWordmark?: string;
  menuKicker?: string;
  skillLabels?: [string, string, string];
  /** Classic incoming-damage skill: 1 easy, 2 normal, 3 hard. */
  defaultSkill?: 1 | 2 | 3;
  skyMode?: "sphere" | "cylinder";
  spawn: { x: number; z: number; yaw: number };
  effects?: { explosionImages?: string[]; impactImage?: string };
  skyImage?: string;
  skyColor?: string;
  fogDistance?: number;
  /** Tint of translucent wading-water surfaces (default greenish teal). */
  waterColor?: string;
  /** Logical render height. Nearest-neighbour canvas scaling preserves the retro look. */
  renderHeight?: number;
  health?: number;
  armor?: number;
  moveSpeed?: number;
  runMultiplier?: number;
  jumpSpeed?: number;
  intro?: string;
  objective?: string;
  credit?: string;
}
export interface FpsPlayer {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  vy: number;
  health: number;
  armor: number;
  weapons: string[];
  weapon: string;
  ammo: Record<string, number>;
  clips: Record<string, number>;
  /** Shared ammunition pools (shells, nails, rockets, cells). */
  pools?: Record<string, number>;
  /** World time the Quad Damage power-up expires (0 = inactive). */
  quadUntil?: number;
  keys: string[];
  inventory?: string[];
  inventoryAmounts?: Record<string, number>;
  inventorySelected?: string;
  activeInventory?: string[];
  holoduke?: { x: number; y: number; z: number };
  kickAt?: number;
  grounded: boolean;
  crouched: boolean;
  shotAt: number;
  reloadUntil: number;
  hurtAt: number;
}
export interface FpsActorState {
  id: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  hp: number;
  hidden: boolean;
  alerted: boolean;
  attackAt: number;
  hurtAt: number;
  diedAt: number;
}
export interface FpsProjectile {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  damage: number; life: number; color: string; sourceId: string;
  /** Downward acceleration (arcing enemy gibs / lobbed grenades). */
  gravity?: number;
  /** Restitution: -velocity * bounce when it strikes a surface. */
  bounce?: number;
  /** Seconds until it detonates on its own (grenades). */
  fuse?: number;
  splash?: number;
  splashDamage?: number;
  /** Player-launched shots hurt enemies instead of the player. */
  fromPlayer?: boolean;
}
export interface FpsSnapshot {
  version: 1;
  skill?: 1 | 2 | 3;
  time: number;
  player: FpsPlayer;
  actors: FpsActorState[];
  doors: Record<string, { open: number; target: number }>;
  kills: number;
  secrets: string[];
  visited: string[];
  projectiles?: FpsProjectile[];
  pipebombs?: { x: number; y: number; z: number; vx: number; vy: number; vz: number }[];
}
export interface FpsInput {
  forward?: number;
  right?: number;
  turn?: number;
  look?: number;
  jump?: boolean;
  crouch?: boolean;
  run?: boolean;
  fire?: boolean;
  use?: boolean;
  reload?: boolean;
  weapon?: string;
  inventory?: string;
  cycleInventory?: number;
  useInventory?: boolean;
  throwBomb?: boolean;
  detonate?: boolean;
  quickKick?: boolean;
}
export interface FpsEvent {
  type:
    | "shot"
    | "hit"
    | "explosion"
    | "pickup"
    | "door"
    | "message"
    | "interact"
    | "exit"
    | "hurt"
    | "secret"
    | "death"
    | "kick";
  text?: string;
  id?: string;
  x?: number;
  y?: number;
  z?: number;
}
