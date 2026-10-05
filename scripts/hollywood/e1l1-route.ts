import type { FpsInput } from "../../src/game/fps/types";
import type { FpsWorld } from "../../src/game/fps/simulation";

/** The deterministic E1L1 tour used by the fast test gate: the original
 * walkthrough order, every counted secret, every enemy and the real exit.
 * Kept separate from the assertions so the browser driver can reuse the
 * waypoints. Positions are world units (X east, Z south). */
export interface RouteDriver {
  move(x: number, z: number): void;
  hop(x: number, z: number): void;
  shoot(id: string, weapon?: string): void;
  door(id: string, yaw?: number): void;
  use(): void;
  tick(n: number, input?: FpsInput): void;
  step(label: string): void;
  face(yaw: number): void;
  pitch(v: number): void;
}
export const E1L1_ENEMIES = 17;
export const E1L1_SECRETS = [
  "s1-billboard",
  "s2-apartment",
  "s3-steroids",
  "s4-compartment",
  "s5-captive",
  "s6-projector",
  "s7-backstage",
  "s8-bachelor",
];
export function runE1L1Route(d: RouteDriver) {
  const { move, hop, shoot, door, use, tick, step } = d;
  step("spawn");
  shoot("roof-c9");
  tick(60);
  move(5.2, 7.2);
  move(4.4, 6);
  step("roof ammo");
  move(5.2, 7.2);
  move(12.5, 6);
  move(14.7, 6);
  tick(60);
  step("landed on medkit");
  shoot("street-trooper");
  move(17.2, 6.6);
  step("dumpster ammo");
  // Secret route: crate -> sloped ledge -> apartment -> billboard ledge -> atomic.
  move(15.5, 17.5);
  hop(14.7, 16.5);
  step("on crate?");
  hop(13.5, 16.3);
  step("on ledge bottom");
  move(13.5, 9.5);
  step("top of slope");
  shoot("apartment-trooper");
  move(12.5, 12.5);
  move(8, 14);
  hop(8.4, 12.6);
  step("bed (rockets?)");
  hop(8, 14.3);
  move(6.9, 13);
  door("poster-door", Math.PI / 2);
  move(5, 13);
  step("steroids");
  move(7, 14.5);
  move(12.5, 12.5);
  move(13.5, 9.5);
  move(13.5, 7.5);
  step("billboard rpg");
  move(13.5, 9.5);
  move(13.5, 16.3);
  move(13.5, 18.5);
  step("atomic ledge");
  move(14.7, 18.5);
  tick(40);
  step("street again");
  shoot("street-trooper-2");
  // Front entry via the cracked wall.
  shoot("street-pigcop");
  move(25.5, 17.5);
  d.face(-Math.PI / 2);
  shoot("front-crack", "rpg");
  tick(30);
  move(27.5, 17.5);
  tick(40);
  shoot("foyer-trooper");
  move(30.5, 19.5);
  move(30.5, 23.5);
  step("foyer ammo");
  move(31.5, 20.5);
  door("foyer-doors", -Math.PI / 2);
  shoot("lobby-trooper");
  move(35, 20.5);
  shoot("lobby-pigcop");
  move(38, 20);
  step("lobby");
  // Counter jump to the register, then the shotgun room.
  move(40, 16.6);
  d.face(0);
  tick(1, { jump: true });
  tick(30, { forward: 1 });
  step("behind counter?");
  move(40, 14.2);
  d.face(Math.PI);
  use();
  step("register used");
  move(41, 14.4);
  hop(41, 16.6);
  step("back over counter");
  move(46, 16.5);
  move(46, 15.9);
  door("shotgun-door", 0);
  move(46, 13.6);
  step("shotgun");
  move(46, 16.5);
  move(35, 16.5);
  door("nook-wall", 0);
  move(34.6, 13.6);
  step("nook atomic");
  move(41, 24.5);
  move(41, 26);
  tick(20);
  door("lobby-lift");
  tick(60);
  step("on lift top");
  move(41, 27.5);
  step("compartment armor");
  move(41, 26);
  door("lobby-lift", 0);
  tick(80);
  move(41, 24);
  // Restroom.
  move(49, 16);
  door("restroom-door", -Math.PI / 2);
  move(51, 16);
  move(54.5, 16.5);
  shoot("stall-trooper");
  move(50.5, 16.5);
  move(50.5, 18.5);
  move(50.5, 16.5);
  move(55.5, 16.5);
  hop(55.9, 17.9);
  step("restroom platform");
  d.face(-Math.PI / 2);
  shoot("restroom-vent");
  hop(56.5, 17.5);
  hop(58.5, 17.5);
  step("in duct");
  move(60, 17.5);
  move(60, 27);
  move(60.5, 29.5);
  step("captive woman");
  move(58.5, 29.5);
  door("woman-wall", Math.PI / 2);
  move(56.5, 29.5);
  shoot("projection-trooper");
  move(56.4, 31.4);
  step("red card");
  move(55.8, 31.4);
  hop(54.6, 31.2);
  step("crate?");
  hop(53, 29.6);
  step("projector top?");
  tick(10);
  hop(52, 31);
  move(51, 31);
  move(50.6, 29);
  step("rpg wall?");
  move(51, 30.6);
  door("curtain", Math.PI / 2);
  step("curtain opened via switch");
  // Down the ramp to the lobby, elevator, C-9 wall.
  move(50.5, 28.3);
  step("rpg pickup");
  move(51, 28.5);
  move(56, 28.5);
  move(56.5, 27.5);
  move(57, 26);
  move(54, 26);
  move(49, 26);
  move(49, 22);
  tick(20);
  door("elevator");
  tick(80);
  step("elevator top");
  move(51, 22);
  move(50.5, 21);
  door("can-compartment", Math.PI / 2);
  hop(49, 20.5);
  step("trash-can compartment");
  move(50.5, 21);
  move(52, 22);
  shoot("corridor-trooper");
  move(53.5, 22.5);
  shoot("corridor-c9");
  tick(40);
  move(55.5, 24.5);
  move(55.5, 26);
  step("down the blown wall");
  // Theatre via lobby doors.
  move(49, 26);
  move(43.5, 26);
  door("theatre-door-e", Math.PI);
  move(43.5, 29);
  shoot("theatre-trooper", "shotgun");
  move(46.5, 32.5);
  shoot("theatre-pigcop", "shotgun");
  move(46.5, 36);
  move(36, 36);
  move(34, 29.6);
  step("stage armor");
  move(36, 32.5);
  shoot("screen-crack", "rpg");
  tick(30);
  move(30, 32.5);
  step("jetpack backstage");
  // Side door to the upper room and out to the alley stairs.
  move(46, 34.5);
  move(48.6, 34.5);
  door("theatre-side-door", -Math.PI / 2);
  move(51, 34);
  shoot("upper-pigcop");
  move(53.5, 36.5);
  move(53.5, 38);
  door("alley-door", Math.PI);
  move(53.5, 40.5);
  step("alley");
  shoot("alley-pigcop-2");
  shoot("alley-pigcop");
  move(53.5, 37.5);
  move(56, 36);
  move(57, 36.5);
  door("red-door", Math.PI);
  move(57, 37.5);
  step("through red door");
  move(57, 37.6);
  shoot("bridge-c9");
  tick(40);
  move(57, 39);
  move(57, 43);
  step("on bridge");
  // Secret 8: drop to the ledge, follow it round to the street side and the pad.
  move(58.5, 42);
  move(58.5, 38.5);
  step("on ledge");
  move(55, 38.5);
  move(52, 38.5);
  move(27.5, 38.5);
  move(27.5, 27.7);
  hop(27.5, 26.5);
  move(29, 26.5);
  step("bachelor pad");
  move(27.5, 26.5);
  move(27.5, 27.7);
  move(27.5, 38.5);
  move(52, 38.5);
  move(58.5, 38.5);
  move(58.5, 42);
  move(57, 42);
  shoot("exit-pane");
  tick(20);
  // Jetpack to the roof above the exit: the two turrets are optional on the
  // critical path, but the 100% regression physically visits and clears them.
  tick(1, { inventory: "jetpack" });
  tick(85, { jump: true });
  shoot("v6-turret-west", "shotgun");
  shoot("v6-turret-east", "shotgun");
  d.pitch(0);
  tick(85, { crouch: true });
  tick(1, { inventory: "jetpack" });
  tick(30);
  move(57, 44.7);
  d.face(Math.PI);
  use();
}
/** Node-side driver over a live FpsWorld. */
export function worldDriver(
  w: FpsWorld,
  log?: (m: string) => void,
): RouteDriver {
  const p = w.state.player;
  const tick = (n: number, input = {}) => {
    for (let i = 0; i < n; i++) w.tick(0.025, input);
  };
  const d: RouteDriver = {
    tick,
    face: (yaw) => (p.yaw = yaw),
    pitch: (v) => (p.pitch = v),
    step: (m) =>
      log?.(
        `${m.padEnd(34)} @ ${p.x.toFixed(1)},${p.z.toFixed(1)} y=${p.y.toFixed(2)} hp=${p.health.toFixed(0)} secrets=${w.state.secrets.length}`,
      ),
    move(x, z) {
      for (let i = 0; i < 2400; i++) {
        if (Math.hypot(x - p.x, z - p.z) < 0.15) return;
        p.yaw = Math.atan2(-(x - p.x), -(z - p.z));
        w.tick(0.025, { forward: 1 });
        if (p.health <= 0) throw Error(`Died near ${x},${z}`);
      }
      throw Error(
        `Blocked going to ${x},${z} from ${p.x.toFixed(2)},${p.z.toFixed(2)} y=${p.y.toFixed(2)}`,
      );
    },
    hop(x, z) {
      p.yaw = Math.atan2(-(x - p.x), -(z - p.z));
      for (let i = 0; i < 60 && Math.hypot(x - p.x, z - p.z) > 0.1; i++)
        w.tick(0.025, { forward: 1, jump: i < 2 });
      tick(20);
    },
    shoot(id, weapon = "pistol") {
      for (let i = 0; i < 900; i++) {
        const a = w.state.actors.find((a) => a.id === id)!;
        if (!a) throw Error(`Unknown route target ${id}`);
        if (a.hp <= 0) return;
        const dx = a.x - p.x,
          dz = a.z - p.z,
          dist = Math.hypot(dx, dz);
        p.yaw = Math.atan2(-dx, -dz);
        const def = w.definitions.get(w.placements.get(id)!.sprite)!;
        p.pitch = Math.atan2(a.y + def.height * 0.72 - (p.y + 1.45), dist);
        w.tick(0.025, { fire: true, weapon });
        if (p.health <= 0) throw Error(`Died shooting ${id}`);
      }
      throw Error(`Could not shoot ${id}`);
    },
    door(id, yaw) {
      if (yaw !== undefined) p.yaw = yaw;
      p.pitch = 0;
      const before = w.state.doors[id].open;
      w.tick(0.025);
      w.tick(0.025, { use: true });
      tick(90);
      if (w.state.doors[id].open === before)
        throw Error(
          `${id} did not open (nearby: ${JSON.stringify(w.nearby())})`,
        );
    },
    use() {
      w.tick(0.025);
      w.tick(0.025, { use: true });
    },
  };
  return d;
}
