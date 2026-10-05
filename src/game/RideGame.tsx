import { useCallback, useEffect, useRef, useState } from "react";
import { gameRandom } from "./rng";
import type { RideConfig } from "../types";
import { assetUrl } from "../assetPath";
import { SheetSprite } from "./SheetSprite";
import { audio } from "../audio";

/**
 * RideGame — a playable vehicle-ride minigame (a highway chase).
 *
 * The player steers a vehicle across a few lanes, dodging oncoming traffic
 * that scrolls toward them. Survive the ride's duration and you run the
 * target down (win); let traffic reach you in your lane and you crash (lose).
 *
 * Self-contained and routed by the caller: it takes `onWin` / `onCrash` /
 * `onClose` and owns nothing but its own motion. Steering is keyboard
 * (←/→ or A/D) plus tap/click on the lane you want. Traffic positions are
 * advanced in one requestAnimationFrame loop; obstacles are plain React
 * state (a handful of sprites for a ~20s ride), so no canvas is needed.
 */

const clampLane = (lane: number, lanes: number) => Math.max(0, Math.min(lanes - 1, lane));

/** Render a value as an emoji glyph, an image, or nothing — the same
 *  `emoji:` / url / bare-glyph convention the walker uses. */
function TrafficSprite({ value, className }: { value: string; className?: string }) {
  if (value.startsWith("emoji:")) {
    return <span className={className}>{value.slice("emoji:".length)}</span>;
  }
  if (value.startsWith("/") || value.startsWith("asset:") || value.startsWith("data:") || value.startsWith("http")) {
    return <img src={assetUrl(value)} alt="" draggable={false} className={className} />;
  }
  return <span className={className}>{value}</span>;
}

interface Obstacle {
  id: number;
  lane: number;
  y: number; // % of screen height, from the top (negative = still off-screen)
  sprite: string;
}

export function RideGame({
  config,
  onWin,
  onCrash,
  onClose,
}: {
  config: RideConfig;
  onWin: () => void;
  onCrash: () => void;
  onClose?: () => void;
}) {
  const lanes = Math.max(2, Math.min(5, config.lanes ?? 3));
  const duration = Math.max(4, config.durationSeconds ?? 18);
  const spawnMs = Math.max(400, config.spawnMs ?? 1200);
  const speed = Math.max(0.2, config.speed ?? 0.5); // screen-heights / second
  const traffic = config.traffic && config.traffic.length ? config.traffic : ["🚗"];
  const vehicle = config.vehicleImage ?? "🏍";

  /** DRIVER BEATS — the running commentary. `quip` is the line on screen; the
   *  pools are consumed in order and only recycled once exhausted, so a short
   *  ride doesn't repeat itself. */
  const [quip, setQuip] = useState<string | null>(null);
  const quipTimer = useRef(0);
  const nearMissPool = useRef<string[]>([]);
  /** Obstacles already scored for a near miss — each one may only quip once. */
  const missed = useRef<Set<number>>(new Set());

  const [lane, setLane] = useState(() => Math.floor(lanes / 2));
  const [phase, setPhase] = useState<"ready" | "riding" | "win" | "crash">("ready");
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [progress, setProgress] = useState(0);

  const laneRef = useRef(lane);
  laneRef.current = lane;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const obstaclesRef = useRef<Obstacle[]>([]);
  obstaclesRef.current = obstacles;
  const winRef = useRef(onWin);
  winRef.current = onWin;
  const crashRef = useRef(onCrash);
  crashRef.current = onCrash;
  const sayRef = useRef((_l?: string) => {});

  /** begin the ride on any key/tap. */
  const start = useCallback(() => {
    if (phaseRef.current !== "ready") return;
    audio.click();
    setPhase("riding");
    const openers = config.startLines ?? [];
    if (openers.length) sayRef.current(openers[Math.floor(gameRandom() * openers.length)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** steer one lane left/right (clamped). */
  const steer = useCallback(
    (dir: -1 | 1) => {
      if (phaseRef.current !== "riding") return;
      const next = clampLane(laneRef.current + dir, lanes);
      if (next !== laneRef.current) {
        audio.click();
        setLane(next);
      }
    },
    [lanes]
  );

  /** Put a line on screen for a beat. Later lines cut off earlier ones —
   *  during a scrape the newest reaction is always the relevant one. */
  const say = useCallback((line?: string) => {
    if (!line) return;
    window.clearTimeout(quipTimer.current);
    setQuip(line);
    quipTimer.current = window.setTimeout(() => setQuip(null), 1900);
  }, []);
  sayRef.current = say;
  useEffect(() => () => window.clearTimeout(quipTimer.current), []);

  /* ---- keyboard steering ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        if (phaseRef.current === "ready") start();
        else steer(-1);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        if (phaseRef.current === "ready") start();
        else steer(1);
      } else if (e.key === "Escape" && onClose) {
        onClose();
      } else if (phaseRef.current === "ready" && (e.key === " " || e.key === "Enter")) {
        start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [start, steer, onClose]);

  /* ---- the ride loop ---- */
  useEffect(() => {
    if (phase !== "riding") return;
    let raf = 0;
    let last = performance.now();
    let spawnAt = performance.now();
    let elapsed = 0;
    let nextId = 1;
    missed.current = new Set();
    nearMissPool.current = [];
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;
      const dy = speed * dt * 100; // % of screen height moved this frame
      let crashed = false;
      let objs = obstaclesRef.current.map((o) => {
        const y = o.y + dy;
        // The rider sits near the bottom of the frame; traffic in their lane
        // reaching that row is a hit.
        if (!crashed && o.lane === laneRef.current && y >= 76 && y <= 92) crashed = true;
        // NEAR MISS — it swept past the rider's row in an ADJACENT lane. This
        // is the beat the show is made of: the gag lands on the dodge, not on
        // the crash (a crash ends the ride, so a line there is nearly unseen).
        if (y >= 80 && y <= 96 && !missed.current.has(o.id) && Math.abs(o.lane - laneRef.current) === 1) {
          missed.current.add(o.id);
          const pool = config.nearMissLines ?? [];
          if (pool.length) {
            if (nearMissPool.current.length === 0) nearMissPool.current = [...pool];
            sayRef.current(nearMissPool.current.shift());
          }
        }
        return { ...o, y };
      });
      if (now >= spawnAt) {
        // Seeded via the game RNG: ?seed= pins spawn timing, lane and
        // sprite so a run that crashes at a specific pattern replays.
        spawnAt = now + spawnMs + gameRandom() * spawnMs * 0.4;
        objs.push({
          id: nextId++,
          lane: Math.floor(gameRandom() * lanes),
          y: -18,
          sprite: traffic[Math.floor(gameRandom() * traffic.length)],
        });
      }
      objs = objs.filter((o) => o.y < 108);
      obstaclesRef.current = objs;
      setObstacles(objs);
      setProgress(Math.min(1, elapsed / duration));
      if (crashed) {
        audio.stinger();
        setPhase("crash");
        return;
      }
      if (elapsed >= duration) {
        audio.pickup();
        setPhase("win");
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ---- route out after the result card ---- */
  useEffect(() => {
    if (phase !== "win" && phase !== "crash") return;
    const t = window.setTimeout(() => {
      if (phase === "win") winRef.current();
      else crashRef.current();
    }, 950);
    return () => window.clearTimeout(t);
  }, [phase]);

  const laneX = (i: number) => ((i + 0.5) / lanes) * 100;

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col overflow-hidden bg-noir-950 select-none"
      onPointerDown={(e) => {
        if (phase === "ready") start();
        else if (phase === "riding") {
          // Tap the half of the screen the target lane is on: taps near a lane
          // jump straight there, so touch feels like steering into a gap.
          const x = (e.clientX / window.innerWidth) * 100;
          setLane(clampLane(Math.floor((x / 100) * lanes), lanes));
        }
      }}
    >
      {/* scrolling asphalt + lane markings. With `roadImage` the built-in CSS
          asphalt is replaced by a real tiling plate scrolled toward the
          player; `horizonImage` sits behind it as static scenery (the speed
          reads off the road, not the skyline). */}
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-noir-900 to-noir-950" />
        {config.horizonImage ? (
          <img
            src={assetUrl(config.horizonImage)}
            alt=""
            className="absolute inset-x-0 top-0 h-1/3 w-full object-cover opacity-80"
          />
        ) : null}
        {config.roadImage ? (
          <div
            className="ride-road absolute inset-x-0 bottom-0 top-0"
            style={{
              backgroundImage: `url(${assetUrl(config.roadImage)})`,
              backgroundRepeat: "repeat-y",
              backgroundSize: "100% 50%",
              // Slower art = fewer, larger tiles; keep it tied to `speed` so
              // the road and the traffic agree about how fast this is.
              animationDuration: `${Math.max(0.35, 1 / speed).toFixed(2)}s`,
            }}
          />
        ) : (
          <div className="road-scroll absolute inset-x-0 top-0 h-full" />
        )}
        {Array.from({ length: lanes - 1 }).map((_, i) => {
          const x = ((i + 1) / lanes) * 100;
          return (
            <div key={i} className="absolute inset-y-0 w-px bg-paper/25" style={{ left: `${x}%` }} aria-hidden />
          );
        })}
      </div>

      {/* the prompt / countdown */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4">
        <div className="hud-frame px-3 py-1.5">
          <span className="font-pulp text-[9px] uppercase tracking-[0.3em] text-neon">{config.prompt ?? "RIDE"}</span>
        </div>
        <div className="hud-frame px-3 py-1.5 font-pulp text-[11px] text-paper/80">
          {phase === "ready" ? "steer with ← → · tap a lane to start" : `${Math.max(0, Math.ceil(duration * (1 - progress)))}s`}
        </div>
      </div>

      {/* progress rail */}
      <div className="relative z-10 mx-auto mt-2 h-1 w-64 overflow-hidden rounded bg-noir-800">
        <div className="h-full bg-neon transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* oncoming traffic */}
      {obstacles.map((o) => (
        <div
          key={o.id}
          className="absolute z-[5] -translate-x-1/2"
          style={{ left: `${laneX(o.lane)}%`, top: `${o.y}%` }}
          aria-hidden
        >
          <TrafficSprite value={o.sprite} className="road-traffic h-16 w-auto text-5xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]" />
        </div>
      ))}

      {/* the rider, fixed near the bottom in their lane */}
      <div
        className={`absolute z-[6] -translate-x-1/2 -translate-y-full transition-[left] duration-150 ease-out ${phase === "crash" ? "road-crash" : ""}`}
        style={{ left: `${laneX(lane)}%`, bottom: "12%" }}
      >
        <TrafficSprite value={vehicle} className="road-vehicle h-24 w-auto text-7xl drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]" />
      </div>

      {/* COCKPIT — drawn over the road and the traffic but under the HUD, so
          the ride reads as first-person without touching how it plays. */}
      {config.dashboardImage ? (
        <img
          src={assetUrl(config.dashboardImage)}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[8] w-full select-none object-cover object-bottom"
        />
      ) : null}

      {/* 💬 DRIVER BEAT — the deadpan running commentary. Sits above the
          cockpit so the joke is never hidden behind the steering wheel. */}
      {quip ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-[4%] z-[12] flex justify-center px-4">
          <div className="hud-frame pop-in flex max-w-lg items-center gap-2 bg-noir-950/90 px-3 py-2">
            {config.driverSheet ? (
              <span className="shrink-0">
                <SheetSprite sheet={config.driverSheet} anim="talk" fallbacks={["rest", "idle"]} height={44} />
              </span>
            ) : null}
            <span className="font-type text-[13px] leading-tight text-paper">
              {config.driverName ? (
                <b className="mr-1 font-pulp text-[10px] uppercase tracking-widest text-neon">{config.driverName}:</b>
              ) : null}
              {quip}
            </span>
          </div>
        </div>
      ) : null}

      {/* ready / result cards */}
      {phase === "ready" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-6">
          <div className="hud-frame hud-frame-gold pop-in max-w-md p-5 text-center">
            <div className="font-pulp text-[10px] uppercase tracking-[0.35em] text-gold">{config.prompt ?? "RIDE"}</div>
            <p className="mt-3 font-type text-sm text-paper/85">
              Weave through the oncoming traffic — steer with <b>← →</b> or tap the lane you want.
              <br />
              <span className="text-paper/50">Don't let it reach you.</span>
            </p>
            <button onClick={start} className="hud-btn mt-4 px-4 py-2 font-pulp text-xs uppercase tracking-widest">
              ▸ Ride
            </button>
          </div>
        </div>
      )}
      {phase === "win" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 p-6">
          <div className="hud-frame pop-in max-w-md p-5 text-center border-emerald-500/60">
            <div className="font-pulp text-xl uppercase tracking-[0.3em] text-emerald-400">✓</div>
            <p className="mt-2 font-type text-sm text-paper/90">{config.winText ?? "You catch him."}</p>
          </div>
        </div>
      )}
      {phase === "crash" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-crimson/20 p-6">
          {config.crashImage ? (
            <img src={assetUrl(config.crashImage)} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-70" />
          ) : null}
          <div className="hud-frame pop-in relative max-w-md p-5 text-center border-crimson/60">
            <div className="font-pulp text-xl uppercase tracking-[0.3em] text-crimson">✖</div>
            <p className="mt-2 font-type text-sm text-paper/90">{config.crashText ?? "You went down."}</p>
          </div>
        </div>
      )}
    </div>
  );
}
