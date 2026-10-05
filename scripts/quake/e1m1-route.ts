import type { FpsInput } from "../../src/game/fps/types";
import type { FpsWorld } from "../../src/game/fps/simulation";

/** The deterministic E1M1 tour used by the fast test gate: the original
 * walkthrough order, every counted secret, every enemy and the real exit.
 * Kept separate from the assertions so a browser driver can reuse the
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
export const E1M1_ENEMIES = 23;
export const E1M1_SECRETS = ["s1", "s2", "s3", "s4", "s5", "s6"];
const D = Math.PI / 180;

export function runE1M1Route(d: RouteDriver) {
  const { move, hop, shoot, door, use, tick, step } = d;
  step("spawn");
  shoot("g-hall");
  step("hall cleared");
  // Start hall -> hop onto the ledge -> shoot the cracked wall -> secret 1.
  move(18.5, 31.5);
  hop(19.5, 31.5);
  step("on ledge?");
  move(21.5, 30.5);
  step("shelf");
  shoot("s1-wall");
  tick(30);
  step("shot s1 wall");
  move(23.5, 30.5);
  step("secret 1 shells");
  move(21.5, 30.5);
  hop(18.5, 31.5);
  step("down from ledge");
  move(19.5, 29.5);
  step("at elevator door");
  door("d-elev");
  move(19.5, 27.5);
  step("through the mouth");
  move(20.5, 27.3);
  step("elevator room, onto lift");
  d.face(Math.PI);
  use();
  tick(180);
  step("at bottom?");
  move(19.9, 25.7);
  step("in tunnel");
  door("d-yard", -90 * D);
  step("door open, clearing yard");
  shoot("d-yard");
  shoot("g-yard");
  move(19.5, 23.5);
  shoot("g-yard2");
  step("yard cleared");
  // 25 healths, 15 health.
  move(14.5, 23.5);
  step("h25 x2");
  move(15.5, 22.5);
  step("h15");
  // Water route: drop into the trough, cave with 100 health (secret 2),
  // elevator up to the green armor, back through the hall and the yard lift.
  move(13.5, 22.5);
  hop(12.5, 23.0);
  step("in trough");
  move(12.5, 24.6);
  move(11.5, 25.3);
  step("in passage");
  move(10.5, 26.8);
  move(9.5, 27.3);
  step("100 health (secret 2)");
  move(10.5, 26.8);
  move(11.5, 29.4);
  step("at water lift");
  use();
  tick(200);
  step("lift up?");
  move(13.5, 29.5);
  step("green armor");
  door("d-ga");
  move(16.5, 30.5);
  step("back in hall");
  door("d-elev");
  move(20.5, 27.3);
  d.face(Math.PI);
  use();
  tick(200);
  step("yard lift up");
  use();
  tick(200);
  step("yard lift down");
  move(20.3, 27.0);
  move(20.2, 26.0);
  move(20.2, 25.8);
  door("d-yard");
  move(19.5, 23.5);
  step("yard again");
  // Bridge + big building door.
  move(16.5, 23.3);
  step("bridge");
  move(17.5, 22.5);
  step("at big door");
  door("d-main", 0);
  step("lobby doorway");
  shoot("d-lobby");
  shoot("g-lobby");
  move(17.5, 20.9);
  shoot("g-lobby2");
  step("lobby cleared");
  // Pillar room.
  move(30.5, 18.5);
  step("at pillar door");
  door("d-pillar", -90 * D);
  move(32.5, 18.5);
  step("pillar room");
  shoot("d-pillar");
  shoot("g-pillar");
  move(36.5, 18.8);
  shoot("c9-lobby");
  tick(30);
  move(32.5, 19.5);
  step("pillar shells");
  // Globe room.
  shoot("g-globe");
  move(37.5, 17.5);
  step("globe doorway");
  move(39.3, 16.6);
  step("globe room");
  // Ride the globe lift: step onto the slab, then shoot g1.
  move(41.5, 17.5);
  step("onto lift slab");
  d.face(90 * D);
  shoot("g1");
  tick(150);
  step("lift top?");
  move(42.5, 13.5);
  step("upper ledge");
  move(43.5, 13.5);
  step("h15 ledge");
  // g2 opens the quad secret.
  shoot("g2");
  tick(30);
  door("s3-front", -90 * D);
  move(41.5, 12.5);
  move(41.5, 11.5);
  step("quad (secret 3)");
  // Back down: ledge -> globe room floor -> doorway -> pillar -> lobby -> stair hall.
  move(41.5, 12.5);
  move(39.5, 13.5);
  hop(39.5, 15.5);
  step("back on globe room floor");
  move(37.5, 17.5);
  move(32.5, 18.5);
  move(30.5, 18.5);
  door("d-pillar");
  move(28.5, 18.5);
  move(17.5, 17.5);
  door("d-stairs");
  move(16.5, 15.5);
  step("stair hall");
  shoot("dog-stairs");
  shoot("g-stairs1");
  move(14.5, 12.5);
  step("h15 stairs");
  // Stairs up to the mid room, catwalk elevator up, bridge to the nailgun.
  move(16.5, 10.5);
  step("mid room");
  shoot("g-stairs2");
  move(15.5, 9.0);
  step("at lift");
  use();
  tick(150);
  step("lift up?");
  hop(15.5, 6.5);
  step("bridge");
  move(15.5, 4.5);
  step("nailgun room");
  shoot("g-ng-room");
  move(16.5, 4.5);
  step("nailgun +25 nails");
  shoot("g-ng-alcove");
  move(18.5, 6.5);
  step("nails on ledge");
  // Balcony: cross east, shoot the grunts, press the ledge button.
  move(16.5, 8.0);
  step("onto balcony");
  move(39.0, 8.5);
  step("balcony east end");
  shoot("g-e1");
  shoot("g-e2");
  step("grunts dead");
  d.face(-90 * D);
  use();
  tick(150);
  step("ledge extended?");
  move(38.5, 9.4);
  step("on ledge");
  // g4 opens the double-barrelled shotgun alcove.
  d.face(-90 * D);
  shoot("g4");
  tick(30);
  step("shot globe");
  // Walk off the ledge, around to the alcove door.
  move(38.6, 10.3);
  step("off ledge");
  move(38.4, 11.4);
  move(35.5, 12.5);
  step("at alcove");
  door("s4-alcove");
  move(37.4, 12.5);
  step("dbs (secret 4)");
  // Archway to the ramp room (hop over the quad passage).
  move(39.8, 10.6);
  hop(40.5, 10.5);
  step("on passage");
  move(43.4, 10.5);
  hop(44.5, 11.5);
  step("ramp upper");
  move(45.5, 10.5);
  step("b1");
  d.face(90 * D);
  use();
  move(45.5, 8.5);
  step("b2");
  d.face(90 * D);
  use();
  move(47.5, 4.5);
  step("bottom");
  shoot("g-ramp1");
  move(49.5, 3.5);
  step("b3");
  d.face(0);
  use();
  shoot("g-biosuit");
  move(50.5, 3.5);
  step("h15-ramp");
  move(51.3, 5.3);
  step("biosuit");
  // Secret 5 blocks.
  hop(52.3, 10.5);
  step("block a");
  hop(52.5, 9.5);
  step("block b (secret 5)");
  hop(51.5, 11.5);
  step("back");
  // Slime swim: biosuit on, annex -> corridor -> channel -> pool -> swim-under.
  move(49.5, 6.7);
  step("to slime");
  tick(1, { inventory: "biosuit" });
  step("biosuit on");
  move(53.3, 4.5);
  step("to annex");
  move(53.3, 1.5);
  move(52.3, 0.7);
  step("in corridor");
  move(33.5, 0.7);
  step("corridor west");
  move(33.5, 4.5);
  step("up the channel");
  move(36.5, 8.5);
  move(39.5, 9.5);
  step("swim-under");
  move(41.5, 8.5);
  move(41.5, 7.5);
  step("at s6 lift");
  use();
  tick(200);
  step("s6 lift up?");
  move(41.3, 6.5);
  move(41.9, 6.5);
  move(42.5, 6.5);
  step("yellow armor (secret 6)");
  // Teleporter back over the lobby.
  move(41.5, 5.5);
  step("tele pad");
  use();
  step("teleported?");
  // Back to the ramp room: lobby -> pillar -> globe lift -> ledge -> passage -> room -> archway.
  move(31.3, 18.3);
  door("d-pillar");
  move(32.5, 18.5);
  move(33.5, 19.3);
  move(37.5, 19.3);
  move(37.5, 17.5);
  move(39.3, 16.8);
  d.face(90 * D);
  shoot("g1");
  tick(150);
  move(40.3, 17.5);
  d.face(-90 * D);
  use();
  tick(150);
  step("lift called down");
  move(41.5, 17.5);
  use();
  tick(150);
  move(42.5, 13.5);
  move(41.5, 12.5);
  move(40.5, 10.5);
  move(43.5, 10.5);
  move(44.5, 11.5);
  move(45.5, 10.5);
  step("back at upper");
  // Descend to the exit.
  move(47.5, 4.5);
  move(50.5, 3.5);
  move(50.5, 2.2);
  step("at exit door");
  move(30.5, 1.5);
  step("exit corridor");
  shoot("d-corridor");
  move(19.2, 1.5);
  step("h15 corridor");
  hop(18.4, 1.5);
  step("up ramp 1");
  move(17.5, 1.5);
  hop(17.6, 2.2);
  step("up ramp 2");
  hop(17.6, 3.0);
  hop(17.5, 3.6);
  step("slipgate room");
  shoot("g-final");
  move(21.3, 3.6);
  shoot("g-slipgate");
  shoot("g-slip2");
  move(19.5, 3.7);
  step("nails");
  move(21.5, 4.5);
  move(24.5, 3.5);
  step("h25");
  // Exit wall opens secret 2's back door.
  d.face(Math.PI);
  shoot("exit-wall");
  tick(30);
  step("exit wall shot");
  move(23.5, 4.7);
  step("slipgate");
  tick(60);
}

/** Node-side driver over a live FpsWorld. */
export function worldDriver(
  w: FpsWorld,
  log?: (m: string) => void,
): RouteDriver {
  const p = w.state.player;
  const tick = (n: number, input: FpsInput = {}) => {
    for (let i = 0; i < n; i++) w.tick(0.025, input);
  };
  const threat = () =>
    w.state.actors.find((a) => {
      const def = w.definitions.get(w.placements.get(a.id)!.sprite)!;
      return (
        !a.hidden &&
        a.hp > 0 &&
        def.kind === "enemy" &&
        Math.hypot(a.x - p.x, a.z - p.z) < 8 &&
        w.clearLine(p.x, p.y + 1.45, p.z, a.x, a.y + 0.8, a.z)
      );
    });
  const d: RouteDriver = {
    tick,
    face: (yaw) => (p.yaw = yaw),
    pitch: (v) => (p.pitch = v),
    step: (m) =>
      log?.(
        `${m.padEnd(34)} @ ${p.x.toFixed(1)},${p.z.toFixed(1)} y=${p.y.toFixed(2)} hp=${p.health.toFixed(0)} secrets=${w.state.secrets.length}`,
      ),
    move(x, z) {
      for (let i = 0; i < 3000; i++) {
        if (Math.hypot(x - p.x, z - p.z) < 0.2) return;
        p.yaw = Math.atan2(-(x - p.x), -(z - p.z));
        const t = threat();
        if (t) {
          const dx = t.x - p.x,
            dz = t.z - p.z;
          p.yaw = Math.atan2(-dx, -dz);
          p.pitch = Math.atan2(t.y + 0.8 - (p.y + 1.45), Math.hypot(dx, dz));
          w.tick(0.025, { forward: 1, fire: true, weapon: "shotgun" });
        } else w.tick(0.025, { forward: 1 });
        if (p.health <= 0)
          throw Error(`Died near ${x},${z} at ${p.x.toFixed(1)},${p.z.toFixed(1)}`);
      }
      throw Error(
        `Blocked going to ${x},${z} from ${p.x.toFixed(2)},${p.z.toFixed(2)} y=${p.y.toFixed(2)}`,
      );
    },
    hop(x, z) {
      p.yaw = Math.atan2(-(x - p.x), -(z - p.z));
      for (let i = 0; i < 90 && Math.hypot(x - p.x, z - p.z) > 0.15; i++)
        w.tick(0.025, { forward: 1, jump: i < 3 });
      tick(20);
    },
    shoot(id, weapon = "shotgun") {
      for (let i = 0; i < 1200; i++) {
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
      const door = w.config.doors.find((d) => d.id === id)!;
      if (yaw !== undefined) p.yaw = yaw;
      p.pitch = 0;
      // Walk onto the slab: proximity auto-opens it. Anything that rushes
      // the door gets shot while we wait for the slab.
      d.move(door.x, door.z);
      for (let i = 0; i < 240 && w.state.doors[id].open < 0.9; i++) {
        const t = threat();
        if (t) {
          const dx = t.x - p.x,
            dz = t.z - p.z;
          p.yaw = Math.atan2(-dx, -dz);
          p.pitch = Math.atan2(t.y + 0.8 - (p.y + 1.45), Math.hypot(dx, dz));
          w.tick(0.025, { fire: true, weapon: "shotgun" });
        } else w.tick(0.025);
      }
      if (w.state.doors[id].open < 0.9)
        throw Error(
          `${id} did not open (open=${w.state.doors[id].open.toFixed(2)}, nearby: ${JSON.stringify(w.nearby())})`,
        );
      tick(30);
    },
    use() {
      w.tick(0.025);
      w.tick(0.025, { use: true });
    },
  };
  return d;
}
