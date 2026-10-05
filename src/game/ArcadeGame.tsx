import { useEffect, useRef, useState } from "react";
import { audio } from "../audio";
import { assetUrl } from "../assetPath";
import type { ArcadeGameConfig } from "../types";

/* ------------------------------------------------------------------ *
 *  ARCADE CABINET MINI-GAME — a barrel-dodging climber.
 *
 *  Rendered on a plain 2D canvas at a fixed internal resolution and
 *  scaled to fit, so the playfield maths never depends on the size of
 *  the screen hole in the cabinet art. The canvas is positioned behind
 *  the cabinet PNG using the config's `screenRect`, and the monitor of
 *  that PNG is keyed transparent — so the game shows THROUGH the art.
 *
 *  Controls: ←/→ or A/D to run, ↑ or W to climb a ladder, Space to jump.
 * ------------------------------------------------------------------ */

/** Internal playfield resolution. Everything below is in these units. */
const VW = 224;
const VH = 256;

const GRAVITY = 0.32;
const RUN = 1.05;
const CLIMB = 0.75;
const JUMP = -4.3;

const DEFAULT_RECT = { x: 20, y: 26.6, w: 60, h: 28.4 };

interface Girder {
  x: number;
  y: number;
  w: number;
  /** girders slope slightly, like the original */
  slope: number;
}
interface Ladder {
  x: number;
  /** top and bottom y */
  y0: number;
  y1: number;
}
interface Barrel {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGirder: number;
  /** rolling animation phase */
  spin: number;
}

/** Height of one girder level and the y of the lowest one. */
const LEVELS = 5;
const FLOOR_Y = VH - 22;
const LEVEL_H = 40;

function buildBoard(board: number): { girders: Girder[]; ladders: Ladder[] } {
  const girders: Girder[] = [];
  const ladders: Ladder[] = [];
  for (let i = 0; i < LEVELS; i++) {
    const y = FLOOR_Y - i * LEVEL_H;
    // alternate the slope direction per level, like the arcade original
    const slope = i === LEVELS - 1 ? 0 : (i % 2 === 0 ? 1 : -1) * 0.045;
    const w = i === LEVELS - 1 ? VW * 0.5 : VW - 16;
    const x = i === LEVELS - 1 ? 14 : 8;
    girders.push({ x, y, w, slope });
  }
  // Ladders connect level i to level i+1. Their x alternates so the player
  // has to traverse each girder; the offset shifts per board for variety.
  //
  // The endpoints are measured off the ACTUAL girder surfaces via girderY(),
  // not off the flat level height. The girders slope, so a ladder pinned to
  // `FLOOR_Y - i * LEVEL_H` could sit up to ~4px above the player's feet —
  // outside the grab window — and pressing UP silently did nothing on half
  // the ladders of every odd-numbered board.
  for (let i = 0; i < LEVELS - 1; i++) {
    const side = (i + board) % 2 === 0;
    const x = side ? VW * 0.22 + (board % 3) * 7 : VW * 0.74 - (board % 3) * 7;
    // Clamp into both girders so a ladder can never hang off an end.
    const lower = girders[i];
    const upper = girders[i + 1];
    const lo = Math.max(lower.x + 6, upper.x + 6);
    const hi = Math.min(lower.x + lower.w - 6, upper.x + upper.w - 6);
    const lx = Math.max(lo, Math.min(hi, x));
    ladders.push({ x: lx, y0: girderY(upper, lx), y1: girderY(lower, lx) });
  }
  return { girders, ladders };
}

/** y of a girder's surface at a given x (they slope). */
function girderY(g: Girder, x: number): number {
  return g.y + (x - g.x) * g.slope;
}
function onGirderAt(girders: Girder[], x: number, y: number, tol = 3): number {
  for (let i = 0; i < girders.length; i++) {
    const g = girders[i];
    if (x < g.x - 2 || x > g.x + g.w + 2) continue;
    const gy = girderY(g, x);
    if (y >= gy - tol && y <= gy + tol + 2) return i;
  }
  return -1;
}
function ladderAt(ladders: Ladder[], x: number, y: number): Ladder | null {
  for (const l of ladders) {
    if (Math.abs(x - l.x) < 6 && y >= l.y0 - 6 && y <= l.y1 + 4) return l;
  }
  return null;
}

export function ArcadeGame({
  config,
  onWin,
  onLose,
  onClose,
}: {
  config: ArcadeGameConfig;
  onWin: () => void;
  onLose: () => void;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<"attract" | "playing" | "won" | "lost">("attract");
  const [board, setBoard] = useState(1);
  const [lives, setLives] = useState(config.lives ?? 3);
  const [score, setScore] = useState(0);

  const rect = config.screenRect ?? DEFAULT_RECT;
  const tint = config.screenTint || "#54ff9f";
  const boardsToClear = config.boardsToClear ?? 3;
  const cabinet = config.cabinetImage ? assetUrl(config.cabinetImage) : undefined;

  /** Everything the loop mutates lives in a ref: React state drives the
   *  chrome (lives, board, phase), never the 60fps simulation. */
  const world = useRef({
    px: 20,
    py: FLOOR_Y,
    vx: 0,
    vy: 0,
    onGround: true,
    climbing: false,
    face: 1,
    barrels: [] as Barrel[],
    spawn: 0,
    t: 0,
    walkPhase: 0,
    dead: false,
    deadT: 0,
    boardData: buildBoard(1),
  });
  const keys = useRef<Record<string, boolean>>({});
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const boardRef = useRef(board);
  boardRef.current = board;

  const resetPlayer = () => {
    const w = world.current;
    w.px = 20;
    w.py = FLOOR_Y;
    w.vx = 0;
    w.vy = 0;
    w.onGround = true;
    w.climbing = false;
    w.barrels = [];
    w.spawn = 0;
    w.dead = false;
    w.deadT = 0;
  };

  const startBoard = (n: number) => {
    world.current.boardData = buildBoard(n);
    resetPlayer();
    setBoard(n);
  };

  /* ---------------- input ---------------- */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s", " "].includes(k)) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (k === "escape") {
        onClose();
        return;
      }
      if (k === "enter" && (phaseRef.current === "attract" || phaseRef.current === "lost")) {
        if (phaseRef.current === "lost") {
          setLives(config.lives ?? 3);
          setScore(0);
          startBoard(1);
        }
        setPhase("playing");
        return;
      }
      keys.current[k] = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    // Capture phase: the stage's own WASD walker must not also move.
    window.addEventListener("keydown", down, true);
    window.addEventListener("keyup", up, true);
    return () => {
      window.removeEventListener("keydown", down, true);
      window.removeEventListener("keyup", up, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  /* ---------------- the loop ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      // Fixed-ish timestep, clamped so a background tab doesn't teleport
      // everything across the board on return.
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;
      const w = world.current;
      const { girders, ladders } = w.boardData;
      w.t += dt;

      if (phaseRef.current === "playing" && !w.dead) {
        /* ---- player ---- */
        const left = keys.current["arrowleft"] || keys.current["a"];
        const right = keys.current["arrowright"] || keys.current["d"];
        const up = keys.current["arrowup"] || keys.current["w"];
        const downK = keys.current["arrowdown"] || keys.current["s"];
        const jump = keys.current[" "];

        const lad = ladderAt(ladders, w.px, w.py);
        if (lad && (up || downK)) {
          w.climbing = true;
          w.vy = 0;
          w.px = lad.x;
        }

        if (w.climbing) {
          if (up) w.py -= CLIMB * dt;
          if (downK) w.py += CLIMB * dt;
          w.walkPhase += dt * 0.25;
          const stillOn = ladderAt(ladders, w.px, w.py);
          if (!stillOn || w.py <= (lad?.y0 ?? 0) - 4) {
            w.climbing = false;
            const gi = onGirderAt(girders, w.px, w.py, 8);
            if (gi >= 0) {
              w.py = girderY(girders[gi], w.px);
              w.onGround = true;
            }
          }
        } else {
          if (left) {
            w.vx = -RUN;
            w.face = -1;
          } else if (right) {
            w.vx = RUN;
            w.face = 1;
          } else w.vx = 0;

          if (jump && w.onGround) {
            w.vy = JUMP;
            w.onGround = false;
            audio.click();
          }

          w.px += w.vx * dt;
          if (Math.abs(w.vx) > 0.01 && w.onGround) w.walkPhase += dt * 0.3;
          w.vy += GRAVITY * dt;
          w.py += w.vy * dt;
          w.px = Math.max(6, Math.min(VW - 6, w.px));

          const gi = onGirderAt(girders, w.px, w.py, w.vy >= 0 ? 5 : 1);
          if (gi >= 0 && w.vy >= 0) {
            w.py = girderY(girders[gi], w.px);
            w.vy = 0;
            w.onGround = true;
          } else if (w.py < VH + 40) {
            w.onGround = false;
          }
          // fell off the bottom
          if (w.py > VH + 20) {
            w.dead = true;
            w.deadT = 0;
          }
        }

        /* ---- barrels ---- */
        const interval = Math.max(0.55, (config.spawnSeconds ?? 1.6) - (boardRef.current - 1) * 0.28);
        w.spawn += dt / 60;
        if (w.spawn > interval) {
          w.spawn = 0;
          const top = girders[girders.length - 1];
          w.barrels.push({
            x: top.x + 12,
            y: girderY(top, top.x + 12) - 3,
            vx: 0.85,
            vy: 0,
            onGirder: girders.length - 1,
            spin: 0,
          });
        }
        for (const b of w.barrels) {
          b.vy += GRAVITY * dt;
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.spin += Math.abs(b.vx) * dt * 0.2;
          const gi = onGirderAt(girders, b.x, b.y, 5);
          if (gi >= 0 && b.vy >= 0) {
            b.y = girderY(girders[gi], b.x) - 3;
            b.vy = 0;
            b.onGirder = gi;
            // roll downhill along the slope
            const g = girders[gi];
            if (g.slope !== 0) b.vx = g.slope > 0 ? -0.85 : 0.85;
          } else {
            b.onGirder = -1;
          }
          // BARRELS FALL OFF GIRDER ENDS — they do not bounce off the screen.
          //
          // This used to reflect vx at the screen edge (x<4 || x>VW-4). The
          // girders span x=8..216, so a barrel that rolled off an end kept
          // going to the wall, bounced back, landed on the SAME girder, was
          // re-aimed downhill by the slope, and rolled at the wall again —
          // an infinite loop. Barrels piled up forever and never reached the
          // bottom, which is both the "stuck barrels" bug and a slow leak
          // (the retire filter only drops them below the floor).
          //
          // Now they simply run out of girder and fall, which is what makes
          // a barrel drop from level to level like the arcade original.
          // The screen edge is only a last-resort clamp for a barrel that is
          // already in free fall.
          if (b.x < 2 || b.x > VW - 2) {
            b.x = Math.max(2, Math.min(VW - 2, b.x));
            b.vx = Math.abs(b.vx) * (b.x <= 2 ? 1 : -1);
          }

          // collision with the player
          if (!w.dead && Math.abs(b.x - w.px) < 7 && Math.abs(b.y - (w.py - 7)) < 9) {
            w.dead = true;
            w.deadT = 0;
            audio.fail();
          }
        }
        // retire barrels that rolled off the bottom, scoring as they pass
        w.barrels = w.barrels.filter((b) => b.y < VH + 30);

        /* ---- win: reach the top girder's far end ---- */
        const topG = girders[girders.length - 1];
        if (w.py <= girderY(topG, w.px) + 3 && w.px > topG.x + topG.w - 22) {
          audio.success();
          const next = boardRef.current + 1;
          setScore((s) => s + 500);
          if (next > boardsToClear) {
            setPhase("won");
            window.setTimeout(() => onWin(), 1600);
          } else {
            startBoard(next);
          }
        }
      }

      /* ---- death / respawn ---- */
      if (w.dead && phaseRef.current === "playing") {
        w.deadT += dt;
        if (w.deadT > 45) {
          const remaining = lives - 1;
          if (remaining <= 0) {
            setPhase("lost");
            window.setTimeout(() => onLose(), 1600);
          } else {
            setLives(remaining);
            resetPlayer();
          }
        }
      }

      /* ---------------- draw ---------------- */
      ctx.clearRect(0, 0, VW, VH);
      ctx.fillStyle = "#05070a";
      ctx.fillRect(0, 0, VW, VH);

      // subtle CRT vignette bands
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = tint;
      for (let y = 0; y < VH; y += 3) ctx.fillRect(0, y, VW, 1);
      ctx.globalAlpha = 1;

      // girders
      ctx.strokeStyle = "#ff4d6d";
      ctx.lineWidth = 3;
      for (const g of girders) {
        ctx.beginPath();
        ctx.moveTo(g.x, girderY(g, g.x));
        ctx.lineTo(g.x + g.w, girderY(g, g.x + g.w));
        ctx.stroke();
        // rivets
        ctx.fillStyle = "#7a1d2e";
        for (let x = g.x + 5; x < g.x + g.w; x += 14) ctx.fillRect(x, girderY(g, x) + 2, 2, 2);
      }

      // ladders
      ctx.strokeStyle = "#48c8ff";
      ctx.lineWidth = 1.5;
      for (const l of ladders) {
        ctx.beginPath();
        ctx.moveTo(l.x - 4, l.y0);
        ctx.lineTo(l.x - 4, l.y1);
        ctx.moveTo(l.x + 4, l.y0);
        ctx.lineTo(l.x + 4, l.y1);
        ctx.stroke();
        for (let y = l.y0; y < l.y1; y += 6) {
          ctx.beginPath();
          ctx.moveTo(l.x - 4, y);
          ctx.lineTo(l.x + 4, y);
          ctx.stroke();
        }
      }

      // the goal — a caged shape at the top right
      const topG = girders[girders.length - 1];
      const gx = topG.x + topG.w - 14;
      const gy = girderY(topG, gx) - 16;
      ctx.fillStyle = "#ffd166";
      ctx.globalAlpha = 0.5 + Math.sin(w.t * 0.08) * 0.3;
      ctx.fillRect(gx - 5, gy, 11, 14);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#8d6b2a";
      ctx.lineWidth = 1;
      ctx.strokeRect(gx - 5, gy, 11, 14);

      // the antagonist — a squat silhouette on the top girder
      const bx = topG.x + 14;
      const by = girderY(topG, bx) - 14;
      ctx.fillStyle = "#c2b6ff";
      ctx.fillRect(bx - 7, by, 14, 14);
      ctx.fillStyle = "#05070a";
      ctx.fillRect(bx - 4, by + 4, 3, 3);
      ctx.fillRect(bx + 1, by + 4, 3, 3);

      // barrels
      for (const b of w.barrels) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.spin);
        ctx.fillStyle = "#ffa23a";
        ctx.fillRect(-4, -4, 8, 8);
        ctx.strokeStyle = "#7a3d00";
        ctx.lineWidth = 1;
        ctx.strokeRect(-4, -4, 8, 8);
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(4, 0);
        ctx.stroke();
        ctx.restore();
      }

      // player
      if (!w.dead || Math.floor(w.deadT / 5) % 2 === 0) {
        const bob = w.onGround && Math.abs(w.vx) > 0.01 ? Math.sin(w.walkPhase * 2) * 1 : 0;
        ctx.fillStyle = "#5ef2a0";
        ctx.fillRect(w.px - 4, w.py - 13 + bob, 8, 9); // body
        ctx.fillStyle = "#ffe0bd";
        ctx.fillRect(w.px - 3, w.py - 18 + bob, 6, 5); // head
        ctx.fillStyle = "#2b6cff";
        // legs
        const legSplit = w.onGround && Math.abs(w.vx) > 0.01 ? Math.sin(w.walkPhase * 2) * 2 : 0;
        ctx.fillRect(w.px - 3 - legSplit, w.py - 4 + bob, 2, 4);
        ctx.fillRect(w.px + 1 + legSplit, w.py - 4 + bob, 2, 4);
      }

      // HUD inside the screen
      ctx.fillStyle = tint;
      ctx.font = "8px monospace";
      ctx.fillText(`SCORE ${String(score).padStart(5, "0")}`, 6, 10);
      ctx.fillText(`L${boardRef.current}`, VW - 40, 10);
      ctx.fillText("♥".repeat(Math.max(0, lives)), VW - 24, 10);

      if (phaseRef.current === "attract") {
        ctx.fillStyle = "rgba(0,0,0,0.72)";
        ctx.fillRect(0, VH * 0.3, VW, VH * 0.4);
        ctx.fillStyle = tint;
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "center";
        ctx.fillText(config.title || "HOLLOW CLIMB", VW / 2, VH * 0.42);
        ctx.font = "8px monospace";
        ctx.fillText("← → RUN   ↑ CLIMB   SPACE JUMP", VW / 2, VH * 0.53);
        if (Math.floor(w.t / 30) % 2 === 0) ctx.fillText("PRESS ENTER", VW / 2, VH * 0.63);
        ctx.textAlign = "left";
      }
      if (phaseRef.current === "won" || phaseRef.current === "lost") {
        ctx.fillStyle = "rgba(0,0,0,0.78)";
        ctx.fillRect(0, VH * 0.34, VW, VH * 0.3);
        ctx.fillStyle = phaseRef.current === "won" ? "#ffd166" : "#ff4d6d";
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "center";
        ctx.fillText(phaseRef.current === "won" ? "YOU WIN" : "GAME OVER", VW / 2, VH * 0.46);
        ctx.font = "7px monospace";
        ctx.fillStyle = tint;
        const msg =
          phaseRef.current === "won"
            ? config.winText || "THE SCREEN GOES DARK"
            : config.failText || "PRESS ENTER TO RETRY";
        ctx.fillText(msg.slice(0, 34), VW / 2, VH * 0.56);
        ctx.textAlign = "left";
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lives, score, tint, boardsToClear]);

  /* ---------------- layout ---------------- */
  // The canvas is absolutely positioned INSIDE the cabinet's screen hole,
  // using the authored percentages. With no cabinet art it just fills.
  const screenStyle: React.CSSProperties = cabinet
    ? {
        position: "absolute",
        left: `${rect.x}%`,
        top: `${rect.y}%`,
        width: `${rect.w}%`,
        height: `${rect.h}%`,
      }
    : { position: "absolute", inset: "0" };

  const height = config.cabinetHeight ?? 92;

  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/92 backdrop-blur-sm"
      role="dialog"
      aria-label={config.title || "Arcade cabinet"}
    >
      <div className="relative" style={{ height: `${height}vh`, aspectRatio: cabinet ? "570 / 950" : "224 / 256" }}>
        {/* the playfield, behind the bezel */}
        <div style={screenStyle} className="overflow-hidden">
          <canvas
            ref={canvasRef}
            width={VW}
            height={VH}
            className="h-full w-full"
            style={{ imageRendering: "pixelated", display: "block" }}
          />
        </div>
        {/* the cabinet art, with its monitor keyed transparent */}
        {cabinet && (
          <img
            src={cabinet}
            alt=""
            className="pointer-events-none relative h-full w-full select-none"
            style={{ imageRendering: "auto" }}
          />
        )}
      </div>

      <button
        onClick={onClose}
        className="absolute right-6 top-6 border border-paper/30 px-3 py-1 font-pulp text-[10px] uppercase tracking-widest text-paper/70 hover:bg-paper/10"
      >
        ✕ Step away
      </button>
      <p className="absolute bottom-5 left-0 right-0 text-center font-type text-[10px] uppercase tracking-widest text-paper/40">
        ← → run · ↑ climb · space jump · esc to step away
      </p>
    </div>
  );
}
