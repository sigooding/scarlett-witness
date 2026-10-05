import { hasDiagonalWalk, stageDirection, stageDirectionAnimation, type StageDirection } from "./stageFacing";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import type { Hotspot, StageExitEdge, StageNpc, StageOccluder, StageScriptStep, StageSettings } from "../types";
import { CURSOR_ICON, hotspotAnswersVerb, hotspotFiresOnWalkOver } from "../logic";
import {
  STAGE2D_DEFAULT_NPC_SPEED,
  STAGE2D_DEFAULT_REACH,
  STAGE2D_JOG_MULT,
  STAGE2D_DEFAULT_SPEED,
  STAGE_GRID_STEP,
  VERB_ICON,
  VERB_LABEL,
  clampToWalkPoly,
  hotspotAtPoint,
  posReachesMarker,
  stageAtWorldEdge,
  stageBlockedPoly,
  stageCamX,
  stageMarkerPointPoly,
  stagePlayerScale,
  stageRoutePoly,
  activeStageOccluders,
  occluderCoversWalker,
  occluderPolygonCss,
  stageSpeedScale,
  stageSpritePx,
  stageSpriteScale,
  stageWalkDepth,
  stageWalkPoly,
  stageWalkStep,
  sentenceLineText,
} from "../logic";
import type { VerbId } from "../logic";
import { assetUrl } from "../assetPath";
import { audio } from "../audio";
import { glowColorWithAlpha, resolveLights } from "../cinematic";
import type { CinematicSettings } from "../types";
import { SheetSprite, preloadStageArt } from "./SheetSprite";
import { jogAnimation, sheetAnim, sheetDrawable } from "./spriteSheet";
import { presetStyle } from "./animation";
import { usePrefersReducedMotion } from "./useReducedMotion";

/** Fill used by the panning plate AND by walk-behind slices, so a clipped
 *  desk lands on the same pixels as the room art (image or CSS gradient).
 *  Wide rooms stretch the strip 1:1 onto the world (`100% 100%`); single-screen
 *  rooms use `cover` to match Game's viewport plate. */
function stagePlateFill(background?: string, worldW = 100): React.CSSProperties {
  if (!background || background.startsWith("video:")) return {};
  if (background.startsWith("gradient:")) return { background: background.slice(9) };
  return {
    backgroundImage: `url(${background})`,
    backgroundSize: worldW > 100 ? "100% 100%" : "cover",
    backgroundPosition: "center",
  };
}

/** One clipped plate-slice. Painted BEFORE the walker when the feet are in
 *  front of the region (so the sprite wins even if sibling z-index is ignored)
 *  and AFTER the walker, at z 160, when the feet are behind it (so the slice
 *  covers even if z-index is ignored). transform:translateZ(0) on the covering
 *  pass forces its own compositor layer. */
function stageOccluderLayer(
  o: StageOccluder,
  i: number,
  worldW: number,
  background: string | undefined,
  covering: boolean,
) {
  const fill = stagePlateFill(background, worldW);
  if (!fill.backgroundImage && !fill.background) return null;
  const poly = `polygon(${occluderPolygonCss(o, worldW)})`;
  return (
    <div
      key={`${o.id ?? `occ-${i}`}-${covering ? "cover" : "under"}`}
      data-stage-occluder={o.id ?? String(i)}
      data-stage-occluder-cover={covering ? "1" : "0"}
      className="pointer-events-none absolute inset-y-0 left-0"
      style={{
        width: `${worldW}%`,
        ...fill,
        clipPath: poly,
        WebkitClipPath: poly,
        zIndex: covering ? 160 : 1,
        transform: covering ? "translateZ(0)" : undefined,
        pointerEvents: "none",
      }}
    />
  );
}

/**
 * Stage — the walkable layer of a STAGE node (free-roam exploration).
 *
 * Pure presentation + movement. The reel (flags, items, choices, beats,
 * captions) is owned by Game.tsx; this component:
 *
 *  - draws the walkable floor and walks the player character across it
 *    (click-to-walk + arrow/WASD), with perspective depth scaling;
 *  - renders every hotspot as an interaction MARKER (a reticle + label ON
 *    the object, bottom-centre of the drawn zone — a wall poster keeps its
 *    marker on the poster), fading in on approach;
 *  - renders hotspot object images (NPCs, props) anchored at the marker;
 *  - fires a marker through `onInteract` — the exact same callback a clicked
 *    hotspot uses, so gating, items, showText, exits and conversations all
 *    behave. LOOKS fire from where the character stands (an 👁 verb, an
 *    object-menu Look, or a classic 💬 show-text zone — no walk-up);
 *    use/talk/go and pickups walk the character to the floor point beneath
 *    the object first.
 *  - WIDE WORLDS (`worldWidth > 100`): the room is one continuous strip
 *    wider than the viewport, the camera pans after the walker (a LucasArts
 *    scrolling alley), and the plate edge becomes a WALK-OFF-SCREEN EXIT
 *    (`exitEdges`): red/yellow chevron arrows sit at the viewport edges and
 *    the character literally walks off the plate into the next scene.
 *
 * Coordinates are scene percentages (0–100) of the WORLD: x is a % of world
 * width, y a % of plate height; the y step is aspect-corrected so walk
 * speed is uniform across the plate. `active` is false while a conversation
 * plays or an overlay is open: movement stops and the markers hide.
 */

const HINT_RADIUS = 16; // scene-width % — labels fade in within this of a marker

/** HOLD-TO-OPEN skull pie (stage.objectMenuHold): press an object this long
 *  before the big circular menu opens in the middle of the screen. */
const PIE_HOLD_MS = 320;
/** Pie geometry, px from the screen-centre: verbs sit on this ring, the
 *  skull fills the inner disc (releasing there cancels). */
const PIE_VERB_RADIUS = 128;
const PIE_SKULL_RADIUS = 52;
const PIE_HIT_SLACK = 26; // generous pickup around the verb ring

/** An inventory item the USE verb can arm. */
export interface CoinItem {
  id: string;
  name: string;
  icon?: string;
}

/** An ambient scene actor — idles (loops its `idle` animation) and, when it
 *  carries a `patrol`, walks between the waypoints (switching to `walk`) and
 *  pauses idle at each before looping back to the start. Rendered exactly
 *  like the walker: depth-scaled by its y, flipped by facing, and z-sorted by
 *  its feet so it overlaps the player the way people overlap in a room. */
/** Imperative handle a running SCRIPTED SEQUENCE uses to drive an ambient
 *  NPC: walk it somewhere (resolves on arrival), fire a set motion, and
 *  release it back to its authored patrol when the script ends. */
export interface StageNpcCtrl {
  walkTo: (x: number, y: number) => Promise<void>;
  motion: (m: { anim?: string; say?: string; facing?: "left" | "right" }) => void;
  release: () => void;
}

function StageNpcActor({
  npc,
  floor,
  settings,
  register,
  linkedHotspot,
  onPress,
  onContext,
  onPos,
  flash,
  frozen,
  faceX,
  spriteH,
  cinematic,
}: {
  npc: StageNpc;
  floor: { top: number; bottom: number };
  settings: StageSettings;
  /** Script hook — registers this actor's control handle by npc id. */
  register?: (id: string, ctrl: StageNpcCtrl | null) => void;
  /** INTERACTABLE NPC — when the actor is linked to a talker marker
   *  (npc.talkHotspotId), that hotspot is passed here and the actor BECOMES
   *  the marker: clickable, chipped, and the walker chases its live pos. */
  linkedHotspot?: Hotspot;
  /** Pressed (click/tap) — Stage routes the walker over and talks. */
  onPress?: (npc: StageNpc) => void;
  /** RIGHT-CLICKED — Stage opens the linked hotspot's object-first verb menu. */
  onContext?: (npc: StageNpc) => void;
  /** Live position reports for pursuit + the N key (world %). */
  onPos?: (id: string, pos: { x: number; y: number }) => void;
  /** The hint-key pulse, shared with markers. */
  flash?: boolean;
  /** CONVERSATION OPEN — the patrol suspends (the actor stands, drops its
   *  ambient chatter and faces the walker) until the talk is over. */
  frozen?: boolean;
  /** The walker's live x (world %) — which way to face while frozen. */
  faceX?: number;
  /** Un-scaled sprite height in px, derived from the measured plate so an
   *  ambient NPC is the same fraction of the room as the walker (see
   *  stageSpritePx). `npc.scale` still multiplies on top. */
  spriteH?: number;
  /** Cinematic lights for shadow casting — shadow skews toward nearest light */
  cinematic?: CinematicSettings;
}) {
  const [pos, setPos] = useState({ x: npc.x, y: npc.y });
  const [facing, setFacing] = useState<"left" | "right">(npc.facing ?? "right");
  const [walking, setWalking] = useState(false);
  /** WALK-AWAY / WALK-TOWARD SIZE — the live size multiplier. Starts at the
   *  NPC's base scale and interpolates along each patrol leg toward the
   *  destination waypoint's `scale` (see StageNpcWaypoint.scale). */
  const [wScale, setWScale] = useState(npc.scale ?? 1);
  const wScaleRef = useRef(npc.scale ?? 1);
  // Re-baseline the live size when the authored base scale changes (Studio
  // live-editing); the next walk leg interpolates from here.
  useEffect(() => {
    wScaleRef.current = npc.scale ?? 1;
    setWScale(npc.scale ?? 1);
  }, [npc.scale]);
  /** The SET MOTION currently held at a waypoint pause: which named sheet
   *  animation plays and which ambient line floats over their head. Null
   *  while walking (or for a patrol-less stander, which uses idleAnim). */
  const [motion, setMotion] = useState<{ anim?: string; say?: string } | null>(null);
  const posRef = useRef(pos);
  posRef.current = pos;
  // Report the live position upward (pursuit + the N key read it).
  const onPosRef = useRef(onPos);
  onPosRef.current = onPos;
  useEffect(() => {
    onPosRef.current?.(npc.id, pos);
  }, [npc.id, pos]);
  /** SCRIPT OVERRIDE — while set, the patrol is suspended: `target` walks
   *  the actor there (resolve fires on arrival), then it holds in place
   *  until the script releases it. */
  const overrideRef = useRef<{ target?: { x: number; y: number }; resolve?: () => void } | null>(null);
  /** CONVERSATION FREEZE — mirrors the `frozen` prop for the rAF loop; on
   *  the rising edge the actor turns to face the walker (they've been
   *  addressed, after all). */
  const frozenRef = useRef(frozen ?? false);
  const faceXRef = useRef(faceX);
  faceXRef.current = faceX;
  useEffect(() => {
    const was = frozenRef.current;
    frozenRef.current = frozen ?? false;
    if (!was && frozen) setFacing((faceXRef.current ?? posRef.current.x) >= posRef.current.x ? "right" : "left");
  }, [frozen]);

  const hasSheet = sheetDrawable(npc.sheet);
  const reducedMotion = usePrefersReducedMotion();

  /* ---- RICHER IDLE REACTIONS ---- */
  const [fidgetAnim, setFidgetAnim] = useState<string | null>(null);
  const [idleSay, setIdleSay] = useState<string | null>(null);
  const [lookAt, setLookAt] = useState(false);
  const idleSayTimerRef = useRef<number | null>(null);
  const fidgetTimerRef = useRef<number | null>(null);

  // Build a pool of ambient lines from patrol waypoints + any existing motion.say
  const ambientSayPool = useMemo(() => {
    const pool: string[] = [];
    if (npc.patrol) {
      for (const wp of npc.patrol) if (wp.say) pool.push(wp.say);
    }
    // add generic murmurs if pool empty and npc is non-interactive ambient
    if (pool.length === 0 && !linkedHotspot) {
      pool.push(...["…", "Hmm.", "*shifts*", "*looks around*", "—", "· · ·"]);
    }
    return pool;
  }, [npc.patrol, linkedHotspot]);

  // Fidget loop: while standing idle, occasionally play a micro-animation
  // (breathe, sway, bob, weight-shift) so the NPC never feels frozen.
  useEffect(() => {
    if (reducedMotion) return;
    if (frozen) return;
    const schedule = () => {
      const delay = 2800 + Math.random() * 4200;
      fidgetTimerRef.current = window.setTimeout(() => {
        if (frozenRef.current || overrideRef.current) {
          schedule();
          return;
        }
        // Don't fidget while walking or mid waypoint say
        if (posRef.current && (motion?.say || walking)) {
          schedule();
          return;
        }
        const candidates = ["breathe", "sway", "bob", "drift", "pulse"];
        // If NPC has a custom idle, 40% chance to re-play it as fidget
        if (npc.idleAnim && Math.random() < 0.4) candidates.push(npc.idleAnim);
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        setFidgetAnim(pick);
        window.setTimeout(() => setFidgetAnim(null), 1400 + Math.random() * 1600);
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      if (fidgetTimerRef.current !== null) window.clearTimeout(fidgetTimerRef.current);
    };
  }, [reducedMotion, frozen, npc.idleAnim, walking, motion?.say]);

  // Ambient chatter: when idle for a while, float a low-key line
  useEffect(() => {
    if (reducedMotion) return;
    if (frozen) return;
    if (!ambientSayPool.length) return;
    if (linkedHotspot) return; // talkers shouldn't mutter over their own interaction
    const schedule = () => {
      const delay = 7000 + Math.random() * 9000;
      idleSayTimerRef.current = window.setTimeout(() => {
        if (frozenRef.current || overrideRef.current) {
          schedule();
          return;
        }
        if (walking || motion?.say) {
          schedule();
          return;
        }
        const line = ambientSayPool[Math.floor(Math.random() * ambientSayPool.length)];
        // 35% chance to actually show — keeps it sparse
        if (Math.random() < 0.35) {
          setIdleSay(line);
          window.setTimeout(() => setIdleSay(null), 1800 + Math.min(4000, line.length * 55));
        }
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      if (idleSayTimerRef.current !== null) window.clearTimeout(idleSayTimerRef.current);
    };
  }, [ambientSayPool, reducedMotion, frozen, walking, motion?.say, linkedHotspot]);

  // Proximity look-at: if player is close (faceX), NPC occasionally glances at them
  useEffect(() => {
    if (reducedMotion) return;
    if (frozen) return;
    if (faceX === undefined) return;
    if (walking) return;
    const id = window.setInterval(() => {
      if (frozenRef.current || overrideRef.current) return;
      const dist = Math.abs((faceX ?? posRef.current.x) - posRef.current.x);
      if (dist > 22) {
        if (lookAt) setLookAt(false);
        return;
      }
      // close: 28% chance to look at player for 2-4s
      if (!lookAt && Math.random() < 0.28) {
        setFacing((faceX ?? 0) >= posRef.current.x ? "right" : "left");
        setLookAt(true);
        window.setTimeout(() => setLookAt(false), 2000 + Math.random() * 2200);
      }
    }, 2200);
    return () => window.clearInterval(id);
  }, [faceX, reducedMotion, frozen, walking, lookAt]);

  // Register the script control handle (walk / motion / release).
  useEffect(() => {
    if (!register) return;
    const ctrl: StageNpcCtrl = {
      walkTo: (x, y) =>
        new Promise<void>((resolve) => {
          overrideRef.current = { target: { x, y }, resolve };
        }),
      motion: (m) => {
        overrideRef.current = overrideRef.current ?? {};
        if (m.facing) setFacing(m.facing);
        setMotion(m.anim || m.say ? { anim: m.anim, say: m.say } : null);
      },
      release: () => {
        overrideRef.current = null;
      },
    };
    register(npc.id, ctrl);
    return () => register(npc.id, null);
  }, [npc.id, register]);

  // Movement loop — a single rAF drives BOTH the authored patrol and any
  // script override. Waypoints are authored on the floor, so movement is a
  // straight line between them (no A*, no obstacle routing — ambient NPCs
  // keep it simple); speed is depth-scaled so a distant NPC doesn't skate.
  useEffect(() => {
    const waypoints = npc.patrol && npc.patrol.length > 0 ? npc.patrol : null;
    let raf = 0;
    let last = performance.now();
    let idx = 0;
    /** pingpong direction: +1 out, -1 back. */
    let dir = 1;
    let routeDone = false;
    let idleUntil = 0;
    const mode = npc.patrolMode ?? "loop";
    // An NPC without an authored speed walks at the ambient default — never
    // the PLAYER's room speed (a fast player must not make every bystander
    // sprint their beat).
    const speed = npc.speed ?? STAGE2D_DEFAULT_NPC_SPEED;
    const baseScale = npc.scale ?? 1;
    /** The current walk leg's size interpolation: captured once when a new
     *  destination is aimed at (start size → the stop's authored size). */
    let leg: { tx: number; ty: number; total: number; s0: number; s1: number } | null = null;
    const aimLeg = (wp: { x: number; y: number }, s1: number) => {
      if (leg && leg.tx === wp.x && leg.ty === wp.y) return;
      const cur = posRef.current;
      leg = { tx: wp.x, ty: wp.y, total: Math.hypot(wp.x - cur.x, wp.y - cur.y), s0: wScaleRef.current, s1: Math.max(0.05, s1) };
    };
    const setScale = (s: number) => {
      if (Math.abs(s - wScaleRef.current) > 0.002) {
        wScaleRef.current = s;
        setWScale(s);
      }
    };
    /** Advance idx per patrolMode; returns false when the route is finished
     *  ("once" — hold the current waypoint's motion forever). */
    const advance = () => {
      if (!waypoints) return false;
      if (mode === "once") {
        if (idx >= waypoints.length - 1) return false;
        idx += 1;
        return true;
      }
      if (mode === "pingpong" && waypoints.length > 1) {
        if (idx + dir < 0 || idx + dir >= waypoints.length) dir = -dir;
        idx += dir;
        return true;
      }
      idx = (idx + 1) % waypoints.length;
      return true;
    };
    /** Walk straight at a point; true once arrived. Interpolates the size
     *  along the aimed leg — walking away shrinks, walking toward grows. */
    const walkToward = (wp: { x: number; y: number }, dt: number) => {
      const cur = posRef.current;
      const dx = wp.x - cur.x;
      const dy = wp.y - cur.y;
      const dist = Math.hypot(dx, dy);
      if (Math.abs(dx) > 0.05) setFacing(dx > 0 ? "right" : "left");
      if (dist <= 0.5) {
        setPos({ x: wp.x, y: wp.y });
        setWalking(false);
        if (leg && leg.tx === wp.x && leg.ty === wp.y) {
          setScale(leg.s1); // land exactly on the stop's authored size
          leg = null;
        }
        return true;
      }
      if (leg && leg.tx === wp.x && leg.ty === wp.y && leg.total > 0.01) {
        const p = Math.min(1, Math.max(0, 1 - dist / leg.total));
        setScale(leg.s0 + (leg.s1 - leg.s0) * p);
      }
      const t = Math.min(1, (speed * dt) / dist);
      setPos({ x: cur.x + dx * t, y: cur.y + dy * t });
      setWalking(true);
      setMotion(null);
      return false;
    };
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // SCRIPT OVERRIDE — walk to the ordered point (then hold), or just
      // hold in place while the script performs around us.
      const ov = overrideRef.current;
      if (ov) {
        if (ov.target) {
          // Scripts keep the current size — no authored stop to aim at.
          aimLeg(ov.target, wScaleRef.current);
          if (walkToward(ov.target, dt)) {
            ov.target = undefined;
            ov.resolve?.();
            ov.resolve = undefined;
          }
        } else {
          setWalking(false);
        }
        raf = requestAnimationFrame(step);
        return;
      }
      // CONVERSATION — hold the feet, drop the chatter, face the walker.
      if (frozenRef.current) {
        setWalking(false);
        setMotion(null);
        raf = requestAnimationFrame(step);
        return;
      }
      // AUTHORED PATROL — nothing to drive without one (or once finished).
      if (!waypoints || routeDone) {
        setWalking(false);
        raf = requestAnimationFrame(step);
        return;
      }
      if (now < idleUntil) {
        setWalking(false);
        raf = requestAnimationFrame(step);
        return;
      }
      const wp = waypoints[idx];
      aimLeg(wp, wp.scale ?? baseScale);
      if (walkToward(wp, dt)) {
        // ARRIVED — plant the feet and play this stop's SET MOTION: optional
        // facing override, named animation, ambient say line.
        if (wp.facing) setFacing(wp.facing);
        setMotion(wp.anim || wp.say ? { anim: wp.anim, say: wp.say } : null);
        const pause = (wp.pause ?? 2) * 1000;
        if (!advance()) routeDone = true; // "once": hold this stop's motion forever
        idleUntil = now + pause;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // NPC speed is the ambient default unless authored — the PLAYER's room
    // speed deliberately does NOT drive this loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [npc.id, npc.patrol, npc.speed, npc.patrolMode]);

  const depth = stageSpriteScale(pos.y, floor, settings) * wScale;
  // Speed-match the walk cycle to how fast this NPC really crosses the floor:
  // an authored patrol speed above the ambient default steps faster, and a
  // distant NPC takes smaller, slower steps. Same depth factor the movement
  // loop already applies, so the feet keep up with the ground instead of
  // skating across it.
  const npcWalkRate = walking
    ? ((npc.speed ?? STAGE2D_DEFAULT_NPC_SPEED) / STAGE2D_DEFAULT_NPC_SPEED) * depth
    : 1;
  const flip = facing === "left" ? -1 : 1;
  const isEmoji = (npc.image ?? "").startsWith("emoji:");
  /** Which named animation plays at rest: waypoint SET MOTION beats fidget beats
   *  idleAnim beats plain "idle" — with graceful sheet fallbacks. Fidget is the
   *  micro-idle (breathe/sway/bob) that keeps a stander alive. */
  const conversationAnim = frozen ? npc.talkAnim : undefined;
  const restAnim = conversationAnim ?? motion?.anim ?? fidgetAnim ?? npc.idleAnim ?? "idle";
  // Idle preset style: breathe/sway/bob for standers, plus look-at pulse when glancing at player
  const toExtraAnim = (name?: string | null) => (name ? ({ preset: name as any } as any) : undefined);
  const idlePresetName = !walking && !frozen && !motion?.anim ? (fidgetAnim ?? (lookAt ? "pulse" : npc.idleAnim ?? "breathe")) : undefined;
  const idlePresetStyle = presetStyle(toExtraAnim(idlePresetName), { reducedMotion });
  const isLooking = lookAt && !walking && !frozen;

  // Shadow casting — skewed toward nearest cinematic light for 3D feel (toggleable in Studio)
  const shadowCastingOn = (cinematic as any)?.shadowCasting !== false;
  const shadowIntensity = (cinematic as any)?.shadowIntensity ?? 0.8;
  const lights = useMemo(() => resolveLights(cinematic), [cinematic]);
  const nearestLight = useMemo(() => {
    if (!lights.length || !shadowCastingOn) return null;
    let best = lights[0];
    let bestDist = Infinity;
    for (const l of lights) {
      const d = Math.hypot(l.x - pos.x, l.y - pos.y);
      if (d < bestDist) {
        bestDist = d;
        best = l;
      }
    }
    return best;
  }, [lights, pos.x, pos.y, shadowCastingOn]);
  const shadowSkew = nearestLight ? (nearestLight.x - pos.x) * 0.18 * shadowIntensity : 0;
  const shadowScaleY = nearestLight ? 0.8 + depth * 0.4 + (nearestLight.intensity ?? 0.5) * 0.3 * shadowIntensity : 0.8 + depth * 0.3;
  const shadowOpacity = nearestLight ? Math.min(0.55, 0.25 + depth * 0.15 + (nearestLight.intensity ?? 0.5) * 0.15) * shadowIntensity : 0.32 * shadowIntensity;
  // Outer handles world position + facing + depth; inner handles idle anims so transforms don't fight.
  const outerStyle: React.CSSProperties = {
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    transform: `translate(-50%,-100%) scaleX(${flip}) scale(${depth})`,
    transformOrigin: "50% 100%",
    zIndex: 50 + Math.round(pos.y),
  };
  const innerStyle: React.CSSProperties = {
    transformOrigin: "50% 100%",
    ...(idlePresetStyle.vars as React.CSSProperties),
    ["--npc-flip" as any]: String(flip),
    ["--npc-depth" as any]: String(depth),
  };

  const sayText = !walking ? (motion?.say ?? idleSay) : null;
  const sayIsIdle = !motion?.say && !!idleSay;

  return (
    <div
      data-npc-id={npc.id}
      data-npc-looking={isLooking ? "1" : "0"}
      role={linkedHotspot ? "button" : undefined}
      tabIndex={linkedHotspot ? 0 : undefined}
      aria-label={linkedHotspot?.label}
      onKeyDown={linkedHotspot ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          onPress?.(npc);
        }
      } : undefined}
      className={`${linkedHotspot ? "pointer-events-auto cursor-pointer" : "pointer-events-none"} absolute`}
      style={outerStyle}
      title={linkedHotspot ? `${linkedHotspot.label} — click to walk over and talk` : undefined}
      onPointerDown={
        linkedHotspot
          ? (e) => {
              e.stopPropagation();
              onPress?.(npc);
            }
          : undefined
      }
      onContextMenu={
        linkedHotspot
          ? (e) => {
              // RIGHT-CLICK on a character = their object-first verb menu.
              e.preventDefault();
              e.stopPropagation();
              onContext?.(npc);
            }
          : undefined
      }
    >
      {/* inner handles idle/fidget/look anims — outer handles world pos/flip/depth so anims don't fight.
          NOTE: the fidget pick is already routed through idlePresetName →
          presetStyle (→ `.anim-*`), so a second `npc-fidget-*` class here
          would declare a competing `animation` on the same element and lose
          to `.anim-*` (declared later in index.css) — the fidget would never
          actually play. One animation, one source. */}
      <div
        className={`${idlePresetStyle.className ?? ""} ${isLooking ? "npc-looking" : ""}`}
        style={innerStyle}
      >
        {/* ambient SAY line — SCUMM background chatter, floated over the head.
            Counter-flipped so the text never mirrors with the sprite. */}
        {sayText ? (
          <span
            className={`pointer-events-none absolute bottom-full left-1/2 mb-1 block max-w-[26ch] whitespace-normal text-center font-type text-[11px] leading-tight drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] ${sayIsIdle ? "text-amber-200/70 italic" : "text-amber-200"}`}
            style={{ transform: `translateX(-50%) scaleX(${flip})`, width: "max-content" }}
          >
            {sayText}
          </span>
        ) : null}
        {/* look-at indicator — subtle eye glint when NPC glances at player */}
        {isLooking && (
          <span
            className="pointer-events-none absolute bottom-[72%] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-amber-200/80 shadow-[0_0_6px_rgba(252,211,77,0.9)]"
            style={{ transform: `translateX(-50%) scaleX(${flip})` }}
            aria-hidden
          />
        )}
        {hasSheet ? (
          <SheetSprite
            sheet={npc.sheet!}
            anim={walking ? "walk" : restAnim}
            fallbacks={walking ? ["idle"] : restAnim !== "idle" ? ["idle", "walk"] : ["walk"]}
            height={spriteH ?? 96}
            fpsScale={npcWalkRate}
            freezeOnFallback={!walking && !conversationAnim && !motion?.anim && !npc.idleAnim}
            className="drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]"
          />
        ) : npc.image ? (
          isEmoji ? (
            <span
              className="block leading-none drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]"
              style={{ fontSize: (spriteH ?? 96) * 0.5 }}
            >
              {npc.image!.slice("emoji:".length)}
            </span>
          ) : (
            <img
              src={assetUrl(npc.image!)}
              alt=""
              draggable={false}
              className="w-auto object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]"
              style={{ height: spriteH ?? 96 }}
            />
          )
        ) : (
          <span
            className="block leading-none drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]"
            style={{ fontSize: (spriteH ?? 96) * 0.5 }}
          >
            🚶
          </span>
        )}
      </div>
      {/* ground shadow — light-cast: skewed toward nearest light, scaleY by depth. Lives in outer so it inherits world pos but not inner sway */}
      <span
        className="pointer-events-none absolute left-1/2 top-full block h-2 w-10 -translate-x-1/2 rounded-[100%] bg-black/40 blur-[2px] will-change-transform"
        style={{
          transform: `translate(-50%, -50%) skewX(${shadowSkew}deg) scaleY(${shadowScaleY.toFixed(2)})`,
          opacity: shadowOpacity,
          background: nearestLight
            ? `radial-gradient(ellipse at 50% 50%, ${glowColorWithAlpha(nearestLight.color, 0.2)}, rgba(0,0,0,0.45) 70%)`
            : undefined,
        }}
      />
      {/* INTERACTABLE: the talk chip — counter-flipped like the say line so it never mirrors */}
      {linkedHotspot ? (
        <span
          className={`stage-npc-chip pointer-events-none absolute top-full left-1/2 mt-1 block whitespace-nowrap rounded border border-amber-200/70 bg-noir-950/85 px-1 font-pulp text-[8px] uppercase tracking-wider text-amber-200${flash ? " stage-marker-flash" : ""}`}
          style={{ transform: `translateX(-50%) scaleX(${flip})`, width: "max-content" }}
        >
          💬 {linkedHotspot.label.slice(0, 20)}
        </span>
      ) : null}
    </div>
  );
}


export function Stage({
  settings,
  hotspots,
  unlocked,
  onInteract,
  active,
  verbs,
  convoHotspotId,
  inventory,
  onPosChange,
  onCamChange,
  dropRequest,
  cursorStyle,
  onVerbChange,
  background,
  onEdgeExit,
  onEdgeLocked,
  edgeUnlocked,
  pose,
  poseOnce,
  onPoseEnd,
  scriptRequest,
  enterScript,
  onScriptEffect,
  onScriptStep,
  activeObstacles,
  cinematic,
}: {
  settings: StageSettings;
  hotspots: Hotspot[];
  /** Whether a marker is currently usable (gate passes). */
  unlocked: (hs: Hotspot) => boolean;
  /** `ctx` carries the verb-coin selection: the verb (and, for USE, the
   *  armed inventory item). Undefined = the classic click-to-activate. */
  onInteract: (hs: Hotspot, ctx?: { verb?: VerbId; itemId?: string }) => void;
  /** Movement + input only while the scene is in exploration mode. */
  active: boolean;
  /** VERB COIN: the verbs this room offers. Undefined/empty = no coin, and
   *  the room behaves exactly as it always has. */
  verbs?: VerbId[];
  /** The hotspot id whose conversation is playing (startDialogue) — ONLY
   *  the linked NPC holds their patrol and faces the walker; everyone else
   *  carries on living. Null = nobody is talking. */
  convoHotspotId?: string | null;
  /** Carried inventory, listed under the coin when USE is selected. */
  inventory?: CoinItem[];
  /** The walker's feet (scene %), reported whenever they move — Game uses it
   *  to decide which foreground extras are drawn OVER the character. */
  onPosChange?: (p: { x: number; y: number }) => void;
  /** Wide worlds: the camera's current pan, in screen-% (0..worldW-100), so
   *  the parent can keep world-pinned foreground scenery in register. */
  onCamChange?: (cam: number) => void;
  /** An item dropped on a scene object: walk there, then USE it. */
  dropRequest?: { hotspotId: string; itemId: string; key: number } | null;
  /** Custom cursor art for the plate (see Story.cursorArt). */
  cursorStyle?: React.CSSProperties;
  /** Reports the coin's selected verb upward — it drives the cursor art. */
  onVerbChange?: (verb: VerbId) => void;
  /** The room's plate (image URL or `gradient:…`) — rendered by Stage itself
   *  on WIDE worlds so it pans with the camera, and reused as the fill for
   *  walk-behind slices so they register with the art. Game's plate stays
   *  fixed to the viewport on single-screen rooms. */
  background?: string;
  /** Walk-off-screen exit: the walker has left the world edge. Game routes
   *  to the edge's targetSceneId (with its own fade). */
  onEdgeExit?: (edge: "left" | "right") => void;
  /** The walker clicked a LOCKED edge arrow — Game shows the exit's
   *  lockedLine as a caption. */
  onEdgeLocked?: (edge: "left" | "right", line: string) => void;
  /** Whether an edge exit's gate currently passes (red arrow = open,
   *  yellow = locked). Defaults to open. */
  edgeUnlocked?: (edge: "left" | "right") => boolean;
  /** The walker's current POSE — a named animation on the player's sheet
   *  overriding idle/walk (a "bend", "crouch"). Undefined = normal. */
  pose?: string;
  /** When true, play `pose` once then call onPoseEnd (transient). */
  poseOnce?: boolean;
  /** Fired when a one-shot pose's loop completes — Game clears the pose. */
  onPoseEnd?: () => void;
  /** SCRIPTED SEQUENCE ordered by a hotspot (`runScript` action): play these
   *  steps now. `key` dedupes — same request object, run once. `coverageTag`
   *  (a hotspot id) lets playtest coverage attribute the steps that ran. */
  scriptRequest?: { steps: StageScriptStep[]; key: number; coverageTag?: string } | null;
  /** SCRIPTED SEQUENCE played once when the scene mounts (the SCUMM
   *  room-entry script). Game handles the run-once flag latch. */
  enterScript?: StageScriptStep[];
  /** Story-level side effects a script step asks for — Game owns flags,
   *  navigation and the walker's pose state. */
  onScriptEffect?: (
    eff:
      | { type: "setFlag"; flag: string }
      | { type: "goToScene"; targetSceneId: string }
      | { type: "pose"; pose?: string },
  ) => void;
  /** Playtest coverage: one cutscene STEP actually started running. `tag`
   *  is the hotspot id (or "enter" for the room-entry script); Game turns
   *  it into the stored coverage key. */
  onScriptStep?: (info: { tag: string; index: number; total: number }) => void;
  /** DOORS — the barriers that are SOLID right now, resolved against world
   *  state by Game (a gated barrier blocks only while its gate is shut).
   *  Defaults to the scene's full list (ungated = always solid). */
  activeObstacles?: StageSettings["obstacles"];
  /** Cinematic lights for shadow casting + DOF — passed from Game's bgCinematic */
  cinematic?: CinematicSettings;
}) {
  const plateRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  /** WIDE WORLD: room width in viewport-% (100 = single screen). */
  const worldW = Math.max(100, settings.worldWidth ?? 100);
  const wide = worldW > 100;
  // The walkable region: a path polygon when the scene authors one, else the
  // flat floor band as a rectangle. `floor` is its y-extent (depth band) —
  // sprite scale / speed read it, so band rooms are pixel-identical to before.
  const poly = stageWalkPoly(settings, worldW);
  const floor = stageWalkDepth(poly);
  const spawn = clampToWalkPoly(settings.spawn?.x ?? 50, settings.spawn?.y ?? floor.bottom - 2, poly, worldW);
  const speed = settings.speed ?? STAGE2D_DEFAULT_SPEED;
  const reach = settings.reach ?? STAGE2D_DEFAULT_REACH;
  const keyboard = settings.keyboard !== false;
  const hints = settings.hints ?? "proximity";
  const baseScale = stagePlayerScale(settings);
  /** SPRITE SIZE — the walker and the ambient NPCs used to render at a HARD
   *  96px tall whatever the room measured, so on any sizeable screen the cast
   *  came out tiny against a plate that scales with the viewport: a detective
   *  the height of a doorknob. A character should be a consistent FRACTION of
   *  the room, so measure the plate and derive the sprite height from it.
   *  See stageSpritePx / STAGE_SPRITE_FRACTION in logic.ts: the fraction
   *  reproduces the old 96px look at the ~440px-tall plate the layout used to
   *  assume, and now holds that proportion at every size. Authors keep full
   *  control through stage.playerScale / npc.scale, which multiply on top. */
  const [plateH, setPlateH] = useState(0);
  useEffect(() => {
    const el = plateRef.current;
    if (!el) return;
    const measure = () => setPlateH(el.clientHeight || 0);
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  /** The un-scaled sprite height in px for this room (before depth/author
   *  scale). Falls back to the historical 96 until the plate is measured. */
  const spriteH = stageSpritePx(plateH);

  const obstacles = activeObstacles ?? settings.obstacles ?? [];
  /** WALK-BEHIND regions — visual only, so unlike obstacles they need no
   *  world state: an author hides one with `visible: false`, nothing else. */
  const occluders = activeStageOccluders(settings.occluders);
  /** Cinematic lights for shadow casting — from Game's bgCinematic prop */
  const stageCinematicLights = useMemo(() => resolveLights(cinematic), [cinematic]);

  /** Where the marker RENDERS: on the object itself, bottom-centre of the
   *  drawn zone — a wall poster's reticle and label stay on the poster, not
   *  dropped onto the pavement below ("jumping into the walkable area").
   *  The top clamp leaves room for the label that stacks above the reticle. */
  const markerPoint = (hs: Hotspot): { x: number; y: number } => ({
    x: Math.min(Math.max(hs.bounds.x + hs.bounds.w / 2, 1), worldW - 1),
    y: Math.min(Math.max(hs.bounds.y + hs.bounds.h, 12), 100),
  });
  /** Where the walker GOES to use a hotspot: the zone's base clamped into
   *  the walkable region — the character approaches the spot on the floor
   *  beneath the object. (Remote zones never walk, so this is unused for
   *  them.) */
  // INTERACTABLE NPCs: hotspot-id -> npc-id for every linked actor. A
  // linked hotspot's "marker point" is the actor's LIVE position, so every
  // piece of marker machinery (click-to-walk, reach, brush-past fire) tracks
  // a character that MOVES.
  const npcLinks = useMemo(() => {
    const m: Record<string, string> = {};
    for (const n of settings.npcs ?? []) if (n.talkHotspotId) m[n.talkHotspotId] = n.id;
    return m;

  }, [settings.npcs]);
  const npcLinksRef = useRef(npcLinks);
  npcLinksRef.current = npcLinks;
  /** Live actor positions by npc id (reported by StageNpcActor). */
  const npcPosRef = useRef<Record<string, { x: number; y: number }>>({});
  const walkPoint = (hs: Hotspot): { x: number; y: number } => {
    const npcId = npcLinksRef.current[hs.id];
    const live = npcId ? npcPosRef.current[npcId] : undefined;
    if (live) return clampToWalkPoly(live.x, live.y, poly, worldW);
    return stageMarkerPointPoly(hs, poly, worldW);
  };

  const [pos, setPos] = useState(spawn);
  const targetRef = useRef<{ x: number; y: number; hotspotId?: string } | null>(null);
  /** Remaining corners of the current route — click-to-walk follows the whole
   *  polyline, not just its last point (see the arrival branch below). */
  const routeRef = useRef<{ x: number; y: number }[]>([]);
  const posRef = useRef(pos);
  posRef.current = pos;
  // Report the feet upward whenever they change — Game needs them to decide
  // which foreground extras are in FRONT of the walker (walk-behind masks).
  const posCbRef = useRef(onPosChange);
  posCbRef.current = onPosChange;
  const camCbRef = useRef(onCamChange);
  camCbRef.current = onCamChange;
  useEffect(() => {
    posCbRef.current?.({ x: pos.x, y: pos.y });
  }, [pos.x, pos.y]);
  // The rAF loop persists across renders, so it reads hotspots through a
  // ref — a marker consumed mid-walk (a one-shot pickup) must vanish from
  // the loop the same frame it vanishes from the plate.
  const hotspotsRef = useRef(hotspots);
  hotspotsRef.current = hotspots;
  // Diagonal frame banks opt in to eight-way art; older sheets stay four-way.
  const [dir, setDir] = useState<StageDirection>("right");
  const dirRef = useRef(dir);
  dirRef.current = dir;
  const sheetRef = useRef(settings.playerSheet);
  sheetRef.current = settings.playerSheet;
  // The animation loop outlives renders. Read live headings/sheets rather
  // than capturing the initial "right" facing or a Studio-edited old sheet.
  const dirOf = (dx: number, dy: number): StageDirection => stageDirection(dx, dy, dirRef.current, hasDiagonalWalk(sheetRef.current));
  const [walking, setWalking] = useState(false);
  const [frameIdx, setFrameIdx] = useState(0);
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);
  const [nearId, setNearId] = useState<string | null>(null);
  // VERB COIN — the selected verb and, for USE, the armed item. Both are
  // mirrored into refs because the rAF loop fires interactions.
  // `verbMode` = verbs drive the firing (either the verb-first coin OR the
  // object-first menu); `coinOn` = the bottom-left coin RAIL specifically.
  const verbMode = !!verbs && verbs.length > 0;
  const objectMenu = settings.objectVerbMenu === true;
  const coinOn = verbMode && !objectMenu;
  const [verb, setVerb] = useState<VerbId>(verbs?.[0] ?? "look");
  const verbsRef = useRef(verbs);
  verbsRef.current = verbs;
  const [heldItem, setHeldItem] = useState<string | null>(null);
  // SENTENCE LINE — the object under the pointer, for the SCUMM strip
  // ("Look at the drop-safe"). Null = the floor ("Walk to").
  const [hoverObj, setHoverObj] = useState<{ label: string; cursor: Hotspot["cursor"] } | null>(null);
  // HINT KEY (H) — pulse every marker + NPC chip for ~2s so the player can
  // see what's interactive. Filter-only animation; layout never jumps.
  const [flashOn, setFlashOn] = useState(false);
  const flashTimerRef = useRef<number | null>(null);
  const flashRef = useRef(false);
  flashRef.current = flashOn;
  const triggerFlash = () => {
    setFlashOn(true);
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => setFlashOn(false), 2200);
  };
  // DOUBLE-CLICK JOG — a second press on the same spot within 320ms puts the
  // walker into a jog (5x speed) until they arrive or steer. The classic
  // adventure fast-travel across a wide room.
  const lastTapRef = useRef<{ t: number; x: number; y: number } | null>(null);
  const jogRef = useRef(1);
  const [jogOn, setJogOn] = useState(false);
  const setJog = (on: boolean) => {
    jogRef.current = on ? STAGE2D_JOG_MULT : 1;
    setJogOn((was) => (was === on ? was : on));
  };
  const tapJog = (x: number, y: number) => {
    const now = Date.now();
    const last = lastTapRef.current;
    lastTapRef.current = { t: now, x, y };
    if (last && now - last.t < 320 && Math.abs(x - last.x) + Math.abs(y - last.y) < 6) setJog(true);
    else setJog(false);
  };
  const verbRef = useRef<VerbId>(verbs?.[0] ?? "look");
  const heldRef = useRef<string | null>(null);
  verbRef.current = verb;
  heldRef.current = heldItem;
  // OBJECT-FIRST verb menu (the "skull pie"): click an object and a
  // small pie menu of the verbs it answers pops up next to it. `menu` holds the
  // open object + its marker point; `menuUse` is the object whose USE was
  // picked and is waiting for an inventory item to arm.
  const [menu, setMenu] = useState<{ hs: Hotspot; x: number; y: number; via: "object" | "context" } | null>(null);
  const [menuUse, setMenuUse] = useState<Hotspot | null>(null);
  // HOLD-TO-OPEN (stage.objectMenuHold): press and hold an object and the
  // big skull pie opens in the MIDDLE of the screen; release over a verb to
  // act with it. The gesture runs on window listeners (so the pointer can
  // roam the pie freely) and the hover is computed geometrically — the pie
  // itself never intercepts the pointer.
  const holdMode = settings.objectMenuHold === true && objectMenu && !coinOn;
  // SENTENCE LINE (SCUMM strip) - see sentenceLineText in logic.ts.
  const sentenceOn = settings.sentenceLine === true;
  const holdTimerRef = useRef<number | null>(null);
  const holdRef = useRef<{ hs: Hotspot; startX: number; startY: number } | null>(null);
  const pieRef = useRef<{ open: boolean; cx: number; cy: number; verbs: VerbId[] }>({ open: false, cx: 0, cy: 0, verbs: [] });
  const [pieHover, setPieHover] = useState<VerbId | null>(null);
  const pieHoverRef = useRef<VerbId | null>(null);
  pieHoverRef.current = pieHover;
  /** The verbs an object answers, for the menu (respects the room's verb list). */
  const menuVerbs = (hs: Hotspot): VerbId[] => {
    const room = verbs ?? [];
    return room.filter((v) => v === "use" ? (hs.acceptsItems?.length ? true : hotspotAnswersVerb(hs, v)) : hotspotAnswersVerb(hs, v));
  };
  /** The marker the player explicitly clicked, with the verb it was clicked
   *  with — so a coin room only fires what was aimed at, never a brushed
   *  past marker. */
  const pendingRef = useRef<{ hotspotId: string; verb: VerbId; itemId?: string } | null>(null);
  /** CLICK-WALK STUCK TIMER — seconds a click-target walk has spent fully
   *  blocked (no slide axis open). Past STUCK_GIVEUP the walk is abandoned
   *  so a click beyond a wall can't pin the walker against it forever. */
  const stuckRef = useRef(0);
  /** PURSUIT — an aimed NPC-linked marker: the actor MOVES, so the plotted
   *  route goes stale and the loop must keep re-routing until they're caught
   *  (cleared the moment the interaction fires, like pendingRef). */
  const pursueRef = useRef<{ hotspotId: string } | null>(null);
  const coinRef = useRef(verbMode);
  coinRef.current = verbMode;
  // The selected verb is the cursor in a coin room — hand it to the parent so
  // its art can follow the mouse.
  const verbCbRef = useRef(onVerbChange);
  verbCbRef.current = onVerbChange;
  useEffect(() => {
    if (coinOn) verbCbRef.current?.(verb);
  }, [verb, coinOn]);
  const firedRef = useRef<Set<string>>(new Set());
  /** Markers the player was already standing on when this scene mounted —
   *  they never auto-fire (see the spawn guard in the arrival loop). */
  const spawnTrapRef = useRef<Set<string>>(new Set());
  /** The room's hotspot trigger policy, read through a ref because the rAF
   *  loop outlives renders. */
  const triggerRef = useRef<StageSettings["hotspotTrigger"]>(settings.hotspotTrigger);
  triggerRef.current = settings.hotspotTrigger;
  const keysRef = useRef<Set<string>>(new Set());
  // Same story for onInteract: the loop outlives the parent's re-renders,
  // so it fires through a ref that always points at the latest callback.
  const interactRef = useRef(onInteract);
  interactRef.current = onInteract;
  const exitCbRef = useRef(onEdgeExit);
  exitCbRef.current = onEdgeExit;
  const lockedCbRef = useRef(onEdgeLocked);
  lockedCbRef.current = onEdgeLocked;
  const edgeUnlockedRef = useRef(edgeUnlocked);
  edgeUnlockedRef.current = edgeUnlocked;
  /** WALK-OFF-SCREEN EXIT — the edge the walker is currently leaving by.
   *  While set, the character ignores input and keeps walking horizontally
   *  off the plate; once they're clear of the world edge, onEdgeExit fires. */
  const exitRef = useRef<"left" | "right" | null>(null);
  const frameClock = useRef(0);
  const frameDur = Math.max(0.04, settings.walkFrameDuration ?? 0.14);
  const walkFrames = (settings.walkFrames ?? []).filter(Boolean);
  // A sprite sheet (one image, gridded frames) beats loose walkFrames when
  // it actually has a drawable animation.
  const hasSheet = sheetDrawable(settings.playerSheet);

  /** THE CAMERA — the left edge of the viewport in world-% (0 on a
   *  single-screen room). Follows the walker with light smoothing; the world
   *  div is translated by -cam, so markers, props and the walker all pan
   *  together. */
  const camRef = useRef(0);
  const [cam, setCam] = useState(0);
  /** The last rounded camera value pushed to state — the rAF loop outlives
   *  renders, so it can't read `cam` from its closure (that copy is stale);
   *  comparing against this ref keeps idle rooms from re-running setState
   *  every frame. */
  const camShownRef = useRef(0);

  const aspect = () => {
    const el = plateRef.current;
    if (!el || el.clientHeight === 0) return 16 / 9;
    return el.clientWidth / el.clientHeight;
  };

  /** Map a pointer event to WORLD coordinates: the viewport % plus whatever
   *  the camera is currently showing. */
  const platePoint = (e: React.PointerEvent): { x: number; y: number } => {
    const r = plateRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * 100 + camRef.current,
      y: ((e.clientY - r.top) / r.height) * 100,
    };
  };

  const nearestNpcRef = useRef(() => {});
  /* --- keyboard movement --- */
  useEffect(() => {
    if (!active || !keyboard) return;
    const heldKeys = keysRef.current;
    const down = (e: KeyboardEvent) => {
      if (scriptOnRef.current) return; // cutscene: input locked
      // Never steal keys from a field (save dialog, search box).
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return;
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(k)) {
        keysRef.current.add(k);
        // Direct steering cancels a click-to-walk target (and any jog).
        targetRef.current = null;
        routeRef.current = [];
        pendingRef.current = null;
        pursueRef.current = null;
        if (jogRef.current !== 1) setJog(false);
        return;
      }
      // HINT KEY — pulse every marker + NPC chip.
      if (k === "h") {
        triggerFlash();
        return;
      }
      // NEAREST CHARACTER — walk to + talk with the nearest linked NPC.
      if (k === "n") {
        nearestNpcRef.current();
        return;
      }
      // COIN HOTKEYS — 1..9 pick the coin's verbs in order (SCUMM grid).
      if (coinRef.current && /^[1-9]$/.test(e.key)) {
        const list = verbsRef.current;
        const idx = Number(e.key) - 1;
        if (list && idx < list.length) {
          e.preventDefault();
          audio.click();
          setVerb(list[idx]);
          if (list[idx] !== "use") setHeldItem(null);
        }
      }
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
      // The listener is gone while inactive (a conversation opens, an overlay
      // drops), so a keyup fired then is never seen — drop every held key on
      // deactivation or the walker sprints off on its own the moment the
      // floor is handed back.
      heldKeys.clear();
    };
  }, [active, keyboard]);

  /* --- movement loop --- */
  useEffect(() => {
    if (!active) {
      setWalking(false);
      exitRef.current = null;
      keysRef.current.clear(); // held keys can't outlive the floor lock
      return;
    }
    let raf = 0;
    /** PURSUIT clock — re-route cadence while chasing a moving NPC. */
    let pursueClock = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const a = aspect();
      const cur = posRef.current;
      let next: { x: number; y: number } = cur;
      let moved = false;
      let arrived = false;
      let stop = false;

      // WALK-OFF-SCREEN phase: no input, no clamps — the character strides
      // off the world edge, then the exit fires (the scene fades out).
      const exiting = exitRef.current;
      if (exiting) {
        const dirSign = exiting === "left" ? -1 : 1;
        const step = speed * stageSpeedScale(cur.y, floor, settings) * jogRef.current * dt;
        next = { x: cur.x + dirSign * step, y: cur.y };
        moved = true;
        setDir(exiting);
        if ((dirSign < 0 && next.x <= -2.4) || (dirSign > 0 && next.x >= worldW + 2.4)) {
          exitRef.current = null;
          stop = true;
          exitCbRef.current?.(exiting);
        }
      } else {
        // STANDING IN A SOLID — a spawn inside the furniture (an earlier shipped
        // alley drops Ben inside the dumpster he climbed out of), or an
        // obstacle that appeared on top of the walker when a state changed.
        // Walls bind from the OUTSIDE: while inside, every step would test
        // blocked and the walker could never leave. Let them move freely;
        // the checks re-engage the frame they're clear.
        const inSolid = obstacles.length > 0 && stageBlockedPoly(cur.x, cur.y, obstacles, poly, a, worldW);
        const ks = keysRef.current;
        const kb =
          ks.has("arrowleft") || ks.has("a") ? -1 : ks.has("arrowright") || ks.has("d") ? 1 : 0;
        const vf =
          ks.has("arrowup") || ks.has("w") ? -1 : ks.has("arrowdown") || ks.has("s") ? 1 : 0;

        if (kb !== 0 || vf !== 0) {
          // Keyboard: walk directly, normalised so diagonals aren't faster.
          const len = Math.hypot(kb, vf) || 1;
          // Walking away from the camera covers less SCREEN per second — the
          // sprite is smaller, so the step should be too.
          const step = speed * stageSpeedScale(cur.y, floor, settings) * jogRef.current * dt;
          const want = { x: cur.x + (kb / len) * step, y: cur.y + (vf / len) * step / a };
          // Wall sliding: if the diagonal is blocked, take whichever single
          // axis still works, so brushing a counter skims along it instead of
          // pinning the character in place.
          if (obstacles.length && !inSolid && stageBlockedPoly(want.x, want.y, obstacles, poly, a, worldW)) {
            const slideX = { x: want.x, y: cur.y };
            const slideY = { x: cur.x, y: want.y };
            if (!stageBlockedPoly(slideX.x, slideX.y, obstacles, poly, a, worldW)) next = slideX;
            else if (!stageBlockedPoly(slideY.x, slideY.y, obstacles, poly, a, worldW)) next = slideY;
          } else {
            next = clampToWalkPoly(want.x, want.y, poly, worldW);
          }
          if (kb !== 0 || vf !== 0) setDir(dirOf(kb, vf));
          moved = next.x !== cur.x || next.y !== cur.y;
        } else if (targetRef.current) {
          const t = targetRef.current;
          const r = stageWalkStep(cur, t, speed * stageSpeedScale(cur.y, floor, settings) * jogRef.current, dt, obstacles, poly, a, worldW);
          next = { x: r.x, y: r.y };
          if (Math.abs(t.x - cur.x) > 0.5 || Math.abs(t.y - cur.y) > 0.5) setDir(dirOf(t.x - cur.x, t.y - cur.y));
          moved = next.x !== cur.x || next.y !== cur.y;
          if (!moved && !r.arrived) {
            // Fully blocked with no way through: give the walk up after a
            // beat. The pending verb simply doesn't fire (a locked marker's
            // refusal is answered before the walk ever starts).
            stuckRef.current += dt;
            if (stuckRef.current > 0.75) {
              targetRef.current = null;
              routeRef.current = [];
              pendingRef.current = null;
              pursueRef.current = null;
              stuckRef.current = 0;
              setWalking(false);
              setFrameIdx(0);
            }
          } else {
            stuckRef.current = 0;
          }
          if (r.arrived) arrived = true;
        } else {
          // No drive (keys released, no click target): settle the walk cycle
          // back to idle the frame the player lets go — otherwise the sprite
          // keeps "moonwalking" in place after a keyboard stroll. Same-value
          // setStates bail out cheaply, so idling here costs nothing.
          setWalking(false);
          setFrameIdx(0);
        }

        // WALK-OFF-SCREEN trigger: the walker reached a world edge with an
        // open exit there — start the leaving phase.
        if (!exiting && (settings.exitEdges?.left?.targetSceneId || settings.exitEdges?.right?.targetSceneId)) {
          const at = stageAtWorldEdge(next.x, worldW);
          if (at) {
            const ex = settings.exitEdges[at];
            if (ex?.targetSceneId && (!ex.gating || edgeUnlockedRef.current?.(at))) {
              targetRef.current = null;
              routeRef.current = [];
              exitRef.current = at;
              setWalking(true);
            }
          }
        }
      }

      if (moved && !exiting) {
        setPos(next);
        setWalking(true);
        // Cycle the walk frames while moving.
        if (walkFrames.length > 1) {
          frameClock.current += dt;
          if (frameClock.current >= frameDur) {
            frameClock.current = 0;
            setFrameIdx((i) => (i + 1) % walkFrames.length);
          }
        }
        // Fire any marker the character has walked into. Keyboard walkers
        // get interactions by stepping onto the marker; click walkers
        // usually arrive because they clicked the marker. NEVER during a
        // scripted sequence — a cutscene walk isn't the player searching.
        for (const hs of scriptOnRef.current ? [] : hotspotsRef.current) {
          if (firedRef.current.has(hs.id)) continue;
          // OUT-OF-REACH zones only ever fire by clicking them — strolling
          // underneath the clock tower shouldn't read it aloud.
          if (hs.remote) continue;
          const m = walkPoint(hs);
          if (!posReachesMarker(next, m, reach, a)) continue;
          // AIMED MARKER — a marker the player DELIBERATELY clicked (a verb
          // queued on it, or a walk-up whose target still names it) fires
          // the moment the walk-up arrives, even when the room's trigger
          // policy would not let it fire on a mere step-on. The policy
          // governs ACCIDENTAL walk-overs: "smart" says scene-leaving
          // markers need a deliberate choice, and this walk-up IS that
          // choice. Without this, "Go to" + a far door would walk the
          // character to the doorway and then… do nothing.
          const pending = pendingRef.current;
          const aimedId = pending?.hotspotId ?? targetRef.current?.hotspotId ?? null;
          const aimed = aimedId === hs.id;
          // An explicit command owns the walk. An incidental object must not
          // steal it on the way, even in a legacy walk-over room.
          if (aimedId && !aimed) continue;
          // TRIGGER POLICY — a marker only fires on step-on if the room's
          // policy (or the marker's own `walkOver`) allows it. Under the
          // default "smart" policy a SCENE-LEAVING marker needs a deliberate
          // click, so a doorway parked on the spawn point no longer ejects
          // the player on their first step and a shop counter you can walk
          // around doesn't throw you out of the shop.
          if (!aimed && !hotspotFiresOnWalkOver(hs, triggerRef.current)) continue;
          // SPAWN GUARD — never auto-fire a marker the player was ALREADY
          // standing on when the scene mounted. Entry is not a search
          // action; an exit authored under the spawn would otherwise fire
          // the moment the player takes any step at all. Only applies under
          // the safe policies: a story that explicitly chose "walkover" is
          // asking for the exact legacy behaviour, spawn guard included-free.
          // (An aimed marker under the spawn fires instantly in
          // walkToMarker's ALREADY-THERE branch, so it never gets here.)
          if (!aimed && triggerRef.current !== "walkover" && spawnTrapRef.current.has(hs.id)) continue;
          // A coin room is verb-first: only the marker the player actually
          // aimed at fires, and it fires with the verb they picked. Brushing
          // past the bar on the way to the door does not talk to the bar.
          if (coinRef.current && (!pending || pending.hotspotId !== hs.id)) continue;
          firedRef.current.add(hs.id);
          pendingRef.current = null;
          pursueRef.current = null;
          targetRef.current = null;
          routeRef.current = [];
          arrived = true;
          audio.hover();
          interactRef.current(
            hs,
            coinRef.current ? { verb: pending?.verb ?? verbRef.current, itemId: pending?.itemId ?? heldRef.current ?? undefined } : undefined,
          );
          break; // one interaction per arrival, never two overlapping exits
        }
        // Which marker is "near" (for proximity labels)? Nearness is measured
        // to the WALK spot on the floor beneath the object, even though the
        // label renders up on the object itself.
        let best: { id: string; d: number } | null = null;
        for (const hs of hotspotsRef.current) {
          const m = walkPoint(hs);
          const a2 = a;
          const d = Math.hypot(next.x - m.x, (next.y - m.y) * a2);
          if (!best || d < best.d) best = { id: hs.id, d };
        }
        setNearId(best && best.d <= HINT_RADIUS ? best.id : null);
      } else if (exiting && moved) {
        setPos(next);
        setWalking(true);
      }

      // PURSUIT — an aimed NPC-linked marker tracks the ACTOR: re-route
      // toward their live position ~3x/second until the fire loop catches
      // them (or the aim is cancelled by steering / a fresh click).
      if (!scriptOnRef.current && !keysRef.current.size && (pendingRef.current || pursueRef.current)) {
        const aimedId = pendingRef.current?.hotspotId ?? pursueRef.current?.hotspotId;
        const npcId = aimedId ? npcLinksRef.current[aimedId] : undefined;
        const live = npcId ? npcPosRef.current[npcId] : undefined;
        if (live) {
          pursueClock += dt;
          if (pursueClock >= 0.35) {
            pursueClock = 0;
            const lp = clampToWalkPoly(live.x, live.y, poly, worldW);
            const here = posRef.current;
            const dd = here ? Math.hypot(here.x - lp.x, (here.y - lp.y) * a) : Infinity;
            if (dd > reach) {
              const route = here
                ? stageRoutePoly(here, lp, obstacles, poly, floor, STAGE_GRID_STEP, worldW)
                : [];
              if (route.length) followRoute(route);
              else if (here) targetRef.current = { x: lp.x, y: lp.y };
            }
          }
        }
      } else {
        pursueClock = 0;
      }

      if (arrived && !exiting) {
        const rest = routeRef.current;
        if (rest.length) {
          // Next corner of the route — the marker the walk is aimed at rides
          // along, or the arrival fire would lose the "aimed" signal at the
          // last corner (the very spot the walk-up lands).
          const nextWp = rest.shift()!;
          const hsId = targetRef.current?.hotspotId;
          targetRef.current = { x: nextWp.x, y: nextWp.y, ...(hsId ? { hotspotId: hsId } : {}) };
          setWalking(true);
        } else {
          targetRef.current = null;
          setWalking(false);
          setFrameIdx(0);
          if (jogRef.current !== 1) setJog(false);
        }
      }

      // Camera follows the walker (wide worlds only).
      if (wide) {
        const target = stageCamX(next.x, worldW);
        camRef.current += (target - camRef.current) * Math.min(1, dt * 8);
        const shown = Math.round(camRef.current * 10) / 10;
        if (Math.abs(shown - camShownRef.current) > 0.011) {
          camShownRef.current = shown;
          setCam(shown);
          camCbRef.current?.(shown);
        }
      }

      if (stop) return;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // hotspots/unlocked/onInteract are read via refs/closures that the
    // parent re-creates each render; the loop intentionally persists.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, speed, reach, floor.top, floor.bottom, obstacles.length, settings.depthScale, settings.playerNearScale, settings.playerFarScale, worldW]);

  // Reset position when a fresh scene mounts (component keyed by scene id).
  useEffect(() => {
    setPos(spawn);
    firedRef.current.clear();
    targetRef.current = null;
    exitRef.current = null;
    // SPAWN TRAP — record every marker the walker is ALREADY within reach of
    // at entry. Stepping out of a doorway that sits under the spawn point is
    // not the player choosing that doorway, so those markers stay inert for
    // the whole visit (they still work when clicked directly).
    spawnTrapRef.current = new Set(
      hotspotsRef.current
        .filter((hs) => !hs.remote && posReachesMarker(spawn, walkPoint(hs), reach, aspect()))
        .map((hs) => hs.id),
    );
    if (wide) {
      const startCam = stageCamX(spawn.x, worldW);
      camRef.current = startCam;
      camShownRef.current = startCam;
      setCam(startCam);
      camCbRef.current?.(startCam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SCENE-ENTRY WARM-UP — kick off loads for everything this room draws
  // (player, cast, marker art, menu icon) the moment the scene mounts.
  // SheetSprite's module image cache shares the results, so first frames
  // render on arrival instead of popping in a beat later.
  useEffect(() => {
    preloadStageArt([
      settings.playerSheet?.image,
      ...(settings.npcs ?? []).flatMap((n) => [n.sheet?.image, n.image?.startsWith("emoji:") ? undefined : n.image]),
      ...hotspots.flatMap((h) => [h.sheet?.image, h.image]),
      settings.objectMenuIcon,
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Follow a route: the first waypoint becomes the live target, the rest wait
   *  in `routeRef` and are picked up on arrival. `aimedId` carries the marker
   *  the player DELIBERATELY clicked through the multi-corner route, so the
   *  walk-up still fires it when the final corner lands (the fire loop reads
   *  `targetRef.current.hotspotId` to tell "the door I chose" from "a door I
   *  happened to stroll past"). */
  const followRoute = (route: { x: number; y: number }[], aimedId?: string) => {
    if (!route.length) return false;
    routeRef.current = route.slice(1);
    targetRef.current = { x: route[0].x, y: route[0].y, ...(aimedId ? { hotspotId: aimedId } : {}) };
    setWalking(true);
    return true;
  };

  /* ---------------- SCRIPTED SEQUENCES (SCUMM cutscenes) ----------------
     A script is an ordered list of StageScriptSteps played with input locked
     and letterbox bars down: walk the player, walk NPCs, float say lines,
     wait beats, then hand control back. Steps that touch story state (flags,
     navigation, poses) are forwarded to Game via onScriptEffect — the stage
     itself stays presentation-only. STAGE NODES ONLY by construction: this
     component never renders for a classic graphic-novel scene. */
  const [scriptOn, setScriptOn] = useState(false);
  const scriptOnRef = useRef(false);
  /** The player's floating cutscene line (null = none). */
  const [playerSay, setPlayerSay] = useState<string | null>(null);
  /** Live NPC control handles, registered by each StageNpcActor. */
  const npcCtrlRef = useRef<Map<string, StageNpcCtrl>>(new Map());
  const registerNpc = useCallback((id: string, ctrl: StageNpcCtrl | null) => {
    if (ctrl) npcCtrlRef.current.set(id, ctrl);
    else npcCtrlRef.current.delete(id);
  }, []);
  const scriptEffectRef = useRef(onScriptEffect);
  scriptEffectRef.current = onScriptEffect;
  /** Coverage tap — Game records that this step genuinely started running. */
  const scriptStepRef = useRef(onScriptStep);
  scriptStepRef.current = onScriptStep;
  /** False once unmounted — a running script checks it between steps. */
  const scriptAliveRef = useRef(true);
  useEffect(() => {
    scriptAliveRef.current = true;
    return () => {
      scriptAliveRef.current = false;
    };
  }, []);

  const scriptSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  /** Reading time for a floated line: 1.6s floor, ~0.055s per character, 6s cap. */
  const sayMs = (t: string) => Math.round(Math.min(6, Math.max(1.6, 0.055 * t.length)) * 1000);

  /** Walk the player to a floor point exactly like a click would — routed
   *  around obstacles, clamped into the walk area — and resolve on arrival
   *  (polled: the rAF walk loop owns the actual movement). */
  const scriptWalkPlayer = (x: number, y: number) =>
    new Promise<void>((resolve) => {
      const cur = posRef.current;
      const dest = clampToWalkPoly(x, y, poly, worldW);
      pendingRef.current = null;
      const route = stageRoutePoly(cur, dest, obstacles, poly, floor, STAGE_GRID_STEP, worldW);
      if (route.length) followRoute(route);
      else {
        targetRef.current = { x: dest.x, y: dest.y };
        setWalking(true);
      }
      const t0 = performance.now();
      const iv = window.setInterval(() => {
        const done = !targetRef.current && routeRef.current.length === 0;
        // 15s failsafe: a blocked route must never wedge the cutscene.
        if (done || performance.now() - t0 > 15000 || !scriptAliveRef.current) {
          window.clearInterval(iv);
          if (!done) {
            targetRef.current = null;
            routeRef.current = [];
          }
          resolve();
        }
      }, 100);
    });

  /** Play a script. Locks input, drops the letterbox, runs steps in order,
   *  then releases everything (even on a mid-script scene exit). `tag`
   *  attributes the run for playtest coverage ("enter" or a hotspot id). */
  const runScript = async (steps: StageScriptStep[], tag = "enter") => {
    if (scriptOnRef.current || !steps.length) return;
    scriptOnRef.current = true;
    setScriptOn(true);
    // Cut any in-flight player intent: keys, pending verb aims, open menus.
    keysRef.current.clear();
    pendingRef.current = null;
    setMenu(null);
    setMenuUse(null);
    try {
      for (const [index, step] of steps.entries()) {
        if (!scriptAliveRef.current) return;
        scriptStepRef.current?.({ tag, index, total: steps.length });
        switch (step.do) {
          case "walkTo":
            await scriptWalkPlayer(step.x, step.y);
            break;
          case "face":
            setDir(step.dir);
            break;
          case "pose":
            scriptEffectRef.current?.({ type: "pose", pose: step.pose });
            break;
          case "wait":
            await scriptSleep(Math.max(0, step.seconds) * 1000);
            break;
          case "say": {
            if (step.npcId) {
              const ctrl = npcCtrlRef.current.get(step.npcId);
              ctrl?.motion({ say: step.text });
              await scriptSleep(sayMs(step.text));
              ctrl?.motion({});
            } else {
              setPlayerSay(step.text);
              await scriptSleep(sayMs(step.text));
              setPlayerSay(null);
            }
            break;
          }
          case "npcWalkTo": {
            const ctrl = npcCtrlRef.current.get(step.npcId);
            if (ctrl) await ctrl.walkTo(step.x, step.y);
            break;
          }
          case "npcMotion": {
            const ctrl = npcCtrlRef.current.get(step.npcId);
            ctrl?.motion({ anim: step.anim, say: step.say, facing: step.facing });
            break;
          }
          case "setFlag":
            scriptEffectRef.current?.({ type: "setFlag", flag: step.flag });
            break;
          case "goToScene":
            // Navigation ends the script — steps after it never run.
            scriptEffectRef.current?.({ type: "goToScene", targetSceneId: step.targetSceneId });
            return;
        }
      }
    } finally {
      // Hand the room back: NPCs resume their patrols, lines clear, input
      // unlocks. Runs even when the script bailed via goToScene/unmount.
      for (const ctrl of npcCtrlRef.current.values()) ctrl.release();
      setPlayerSay(null);
      scriptOnRef.current = false;
      setScriptOn(false);
    }
  };

  // Hotspot-ordered scripts (runScript actions) — keyed like dropRequest.
  // Adopt, don't play, on mount: a request that predates this mount belongs
  // to another room (Game holds the last request across scenes) — playing it
  // here would replay the previous room's cutscene with its input lock.
  // Only requests that ARRIVE after mount play. (StrictMode's double-effect
  // is safe: the first pass adopts, the second sees the adopted key.)
  const scriptKeyRef = useRef<number | null>(null);
  useEffect(() => {
    if (scriptKeyRef.current === null) {
      scriptKeyRef.current = scriptRequest?.key ?? 0;
      return;
    }
    if (!scriptRequest || scriptRequest.key === scriptKeyRef.current) return;
    scriptKeyRef.current = scriptRequest.key;
    void runScript(scriptRequest.steps, scriptRequest.coverageTag ?? "enter");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptRequest?.key]);

  // Room-entry script — latched once per mount (the component is keyed by
  // scene id, so "per mount" IS "per entry"). A short beat first so the
  // scene fade lands before the letterbox drops. The latch is set when the
  // timer FIRES, not when it's scheduled — StrictMode's throwaway first
  // mount cancels the timer in cleanup, and a schedule-time latch would
  // leave the real mount thinking the script already played.
  const enterRanRef = useRef(false);
  useEffect(() => {
    if (!enterScript || enterScript.length === 0) return;
    const t = window.setTimeout(() => {
      if (enterRanRef.current) return;
      enterRanRef.current = true;
      void runScript(enterScript, "enter");
    }, 450);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Walk toward a marker, stopping just short of it (at ~reach) so the
   *  character doesn't stand inside the thing they're interacting with.
   *  Routed around the scene's obstacles, so the counter between you and the
   *  barman is walked around rather than through. */
  /** Fire a hotspot immediately, from wherever the character stands: they
   *  just turn to face it, no walk-up. Used by OUT-OF-REACH zones and by
   *  LOOKS (below) — the character doesn't cross the room to read a poster. */
  const fireFromHere = (hs: Hotspot, ctx?: { verb?: VerbId; itemId?: string }) => {
    const m0 = markerPoint(hs);
    const cur0 = posRef.current;
    // A click is a new command: any walk already under way stops where the
    // character stands (and the walk cycle must settle back to idle — the
    // rAF only clears `walking` on arrival).
    pendingRef.current = null;
    targetRef.current = null;
    routeRef.current = [];
    setWalking(false);
    setFrameIdx(0);
    setDir(dirOf(hs.bounds.x + hs.bounds.w / 2 - cur0.x, m0.y - cur0.y));
    audio.hover();
    interactRef.current(
      hs,
      coinRef.current
        ? { verb: ctx?.verb ?? verbRef.current, itemId: ctx?.itemId ?? heldRef.current ?? undefined }
        : ctx?.verb
          ? { verb: ctx.verb, itemId: ctx.itemId }
          : undefined,
    );
  };

  const walkToMarker = (hs: Hotspot, ctx?: { verb?: VerbId; itemId?: string }): boolean => {
    if (scriptOnRef.current) return false; // cutscene: input locked
    // OUT OF REACH — the object can't be walked to (a clock high on a wall,
    // a window across the chasm). Fire its action from wherever the character
    // stands: they just turn to face it, no walk-up.
    if (hs.remote) {
      fireFromHere(hs, ctx);
      return false;
    }
    // LOOK AT A DISTANCE — look-verbs and 💬 show-text zones never walk up:
    // with 👁 armed (coin room), with Look picked off an object menu, or a
    // plain click on a classic room's read/describe zone, the character
    // answers from right where they're standing.
    const clickVerb = ctx?.verb ?? (coinRef.current ? verbRef.current : null);
    if (clickVerb === "look" || (!coinRef.current && !ctx?.verb && hs.action.type === "showText")) {
      fireFromHere(hs, ctx);
      return false;
    }
    if (coinRef.current || ctx) {
      const v = ctx?.verb ?? verbRef.current;
      pendingRef.current = {
        hotspotId: hs.id,
        verb: v,
        itemId: v === "use" ? ctx?.itemId ?? heldRef.current ?? undefined : undefined,
      };
    }
    const m = stageMarkerPointPoly(hs, poly, worldW);
    const a = aspect();
    const cur = posRef.current;
    const dx = cur.x - m.x;
    const dy = (cur.y - m.y) * a;
    const dist = Math.hypot(dx, dy);
    const stop = reach * 0.72;
    // ALREADY THERE — fire now, don't wait to be walked to.
    //
    // The arrival fire-loop only runs on a frame where the walker actually
    // MOVED. When the player is already standing within reach (the usual
    // case for a repeatable object: you interact, you stay put, you
    // interact again) the route is zero-length, `moved` stays false, and
    // the pending verb was never dispatched — the object simply ignored
    // every click after the first.
    //
    // Worse, the walk-up leaves the character at exactly `stop`, so
    // `dist <= stop` was a floating-point coin toss (3.600 vs
    // 3.5999999999999996) and the object became unusable at the very spot
    // the engine had just parked them. Testing real reach — not the
    // stand-off distance — and firing straight away removes both problems.
    if (posReachesMarker(cur, m, reach, a)) {
      fireFromHere(hs, ctx);
      return false;
    }
    let tx: number;
    let ty: number;
    if (dist <= stop || dist === 0) {
      tx = cur.x;
      ty = cur.y;
    } else {
      tx = m.x + (dx / dist) * stop;
      ty = m.y + ((dy / dist) * stop) / a;
    }
    firedRef.current.clear();
    const route = stageRoutePoly(cur, { x: tx, y: ty }, obstacles, poly, floor, STAGE_GRID_STEP, worldW);
    if (route.length) {
      setDir(dirOf(hs.bounds.x + hs.bounds.w / 2 - cur.x, m.y - cur.y));
      if (followRoute(route, hs.id)) return true;
    }
    // No route (walled off) — fall back to walking straight at it.
    if (!unlocked(hs)) {
      // …unless the marker behind the wall is LOCKED: pressing the walker
      // into the barrier forever buys nothing. Answer from right here — the
      // gate's refusal caption beats a silent wall-hug the player can't read.
      fireFromHere(hs, ctx);
      return false;
    }
    targetRef.current = { x: tx, y: ty, hotspotId: hs.id };
    setDir(dirOf(hs.bounds.x + hs.bounds.w / 2 - cur.x, m.y - cur.y));
    return true;
  };

  /** INTERACTABLE NPCs — press / N-key entry: aim the walker at the linked
   *  talker marker. The walkPoint override + the pursuit loop do the rest —
   *  the chase tracks the actor's LIVE position until they're caught. */
  const pressNpc = (npc: StageNpc) => {
    if (!active || scriptOnRef.current) return;
    const hs = hotspots.find((h) => h.id === npc.talkHotspotId);
    if (!hs) return;
    const live = npcPosRef.current[npc.id];
    tapJog(live?.x ?? npc.x, live?.y ?? npc.y);
    audio.click();
    if (objectMenu && !coinOn) {
      setMenu({ hs, x: live?.x ?? npc.x, y: live?.y ?? npc.y, via: "object" });
      setMenuUse(null);
      return;
    }
    // TALK, not whatever the coin has armed: N (and an NPC click) is a talk
    // intent — with 👁 LOOK armed the old code "examined" the character from
    // across the street and never walked. Forcing the verb keeps the chase;
    // the linked marker answers TALK through its cursor (the validator's
    // NPC-link check enforces exactly that).
    if (walkToMarker(hs, { verb: "talk" })) pursueRef.current = { hotspotId: hs.id };
  };
  /** RIGHT-CLICK on a character — open the linked hotspot's object-first
   *  verb menu at the actor's live position (no walking implied). */
  const openNpcMenu = (npc: StageNpc) => {
    if (!active || scriptOnRef.current) return;
    const hs = hotspots.find((h) => h.id === npc.talkHotspotId);
    if (!hs) return;
    const live = npcPosRef.current[npc.id];
    audio.click();
    setMenu({ hs, x: live?.x ?? npc.x, y: live?.y ?? npc.y, via: "context" });
    setMenuUse(null);
  };

  /** N KEY — walk to + talk with the NEAREST linked character (cycling
   *  through them is what the map is for; nearest is what the hands want). */
  const nearestNpc = () => {
    const cur = posRef.current;
    if (!cur || scriptOnRef.current) return;
    let best: { npc: StageNpc; d: number } | null = null;
    for (const n of settings.npcs ?? []) {
      if (!n.talkHotspotId) continue;
      const live = npcPosRef.current[n.id] ?? { x: n.x, y: n.y };
      const d = Math.hypot(cur.x - live.x, (cur.y - live.y) * 1.78);
      if (!best || d < best.d) best = { npc: n, d };
    }
    if (!best) return;
    const hs = hotspots.find((h) => h.id === best.npc.talkHotspotId);
    if (!hs) return;
    audio.click();
    if (walkToMarker(hs, { verb: "talk" })) pursueRef.current = { hotspotId: hs.id };
  };
  nearestNpcRef.current = nearestNpc;

  /** Object-first menu: the player picked a verb for the open object. USE on
   *  an object that accepts items first arms one from the inventory; otherwise
   *  it acts directly. Closes the menu and walks the character over. */
  const pickVerb = (hs: Hotspot, v: VerbId, itemId?: string) => {
    if (v === "use" && (hs.acceptsItems?.length ?? 0) > 0 && !itemId) {
      setMenuUse(hs);
      return;
    }
    setMenu(null);
    setMenuUse(null);
    walkToMarker(hs, { verb: v, itemId: v === "use" ? itemId : undefined });
  };

  /** HOLD-TO-OPEN: the player pressed an object. A quick release walks to it;
   *  holding past PIE_HOLD_MS opens the big skull pie in the middle of the
   *  screen with the verbs this object answers. */
  const beginHold = (hs: Hotspot, e: React.PointerEvent) => {
    if (scriptOnRef.current) return; // cutscene: input locked
    holdRef.current = { hs, startX: e.clientX, startY: e.clientY };
    pieRef.current.open = false;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    holdTimerRef.current = window.setTimeout(() => {
      holdTimerRef.current = null;
      const g = holdRef.current;
      if (!g) return;
      const vs = menuVerbs(g.hs);
      if (!vs.length) return; // nothing to pick — release does nothing
      const pie = pieRef.current;
      pie.open = true;
      pie.cx = window.innerWidth / 2;
      pie.cy = window.innerHeight / 2;
      pie.verbs = vs;
      setMenu({ hs: g.hs, x: 50, y: 50, via: "object" });
      setMenuUse(null);
      setPieHover(null);
    }, PIE_HOLD_MS);
  };

  // An item dropped on a scene object: walk over, then USE it there.
  const dropKeyRef = useRef<number | null>(null);
  useEffect(() => {
    if (!dropRequest || dropRequest.key === dropKeyRef.current) return;
    dropKeyRef.current = dropRequest.key;
    const hs = hotspotsRef.current.find((h) => h.id === dropRequest.hotspotId);
    if (!hs) return;
    walkToMarker(hs, { verb: "use", itemId: dropRequest.itemId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropRequest?.key]);

  // HOLD-TO-OPEN GESTURE — window listeners live for the whole stage mount
  // but only act while a hold is in progress (holdRef set). Before the pie
  // opens, straying >12px cancels the hold (so a drag never misfires); a
  // release before the threshold is a quick TAP and walks to the object.
  // Once the pie is open, hover is geometric — angle/distance from the
  // screen-centre — so the pie itself never needs to intercept the pointer.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const g = holdRef.current;
      if (!g) return;
      const pie = pieRef.current;
      if (!pie.open) {
        if (Math.hypot(e.clientX - g.startX, e.clientY - g.startY) > 12) {
          if (holdTimerRef.current !== null) {
            window.clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
          }
          holdRef.current = null;
        }
        return;
      }
      const dx = e.clientX - pie.cx;
      const dy = e.clientY - pie.cy;
      const dist = Math.hypot(dx, dy);
      let v: VerbId | null = null;
      if (dist >= PIE_SKULL_RADIUS && dist <= PIE_VERB_RADIUS + PIE_HIT_SLACK) {
        const n = pie.verbs.length;
        if (n > 0) {
          const ang = (Math.atan2(dy, dx) * 180) / Math.PI; // -180..180, 0 = right
          const sector = 360 / n;
          const idx = Math.floor(((((ang + 90 + sector / 2) % 360) + 360) % 360) / sector) % n;
          v = pie.verbs[idx];
        }
      }
      if (v !== pieHoverRef.current) {
        setPieHover(v);
        if (v) audio.hover();
      }
    };
    const onUp = (e: PointerEvent) => {
      const g = holdRef.current;
      if (!g) return;
      holdRef.current = null;
      if (holdTimerRef.current !== null) {
        // Quick tap (or a hold cancelled before the threshold): walking to
        // the object is the tap's meaning — HOLDING is what opens the pie.
        window.clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
        if (!pieRef.current.open) walkToMarker(g.hs);
        return;
      }
      const pie = pieRef.current;
      if (!pie.open) return;
      const dx = e.clientX - pie.cx;
      const dy = e.clientY - pie.cy;
      const dist = Math.hypot(dx, dy);
      const v = pieHoverRef.current;
      pie.open = false;
      setMenu(null);
      setMenuUse(null);
      setPieHover(null);
      if (v && dist >= PIE_SKULL_RADIUS && dist <= PIE_VERB_RADIUS + PIE_HIT_SLACK) {
        // pickVerb with USE+items keeps the pie up (armed for an item) —
        // exactly like the click-to-open menu.
        pickVerb(g.hs, v);
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (holdTimerRef.current !== null) window.clearTimeout(holdTimerRef.current);
      holdRef.current = null;
    };
    // The handlers only touch refs + stable setters; the mount-time closure
    // is all that's ever needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Click an edge arrow: locked exits say their line; open exits walk the
   *  character to the world edge, where the leaving phase takes over. */
  const clickEdge = (edge: "left" | "right") => {
    if (!active) return;
    const ex = settings.exitEdges?.[edge];
    // No destination = not a real exit: don't walk the player at it.
    if (!ex?.targetSceneId) return;
    const open = !ex.gating || !!edgeUnlockedRef.current?.(edge);
    if (!open) {
      audio.fail();
      lockedCbRef.current?.(edge, ex.lockedLine ?? "Not yet. Something's still holding you here.");
      return;
    }
    audio.click();
    targetRef.current =
      edge === "left" ? { x: 0.7, y: posRef.current.y } : { x: worldW - 0.7, y: posRef.current.y };
    routeRef.current = [];
    setDir(edge);
    setWalking(true);
  };

  const isEmoji = (settings.playerImage ?? "").startsWith("emoji:");
  const emoji = isEmoji ? settings.playerImage!.slice("emoji:".length) : "🕵️";
  // POSE — a named animation overriding idle/walk (a "bend down"). One-shot
  // poses play their loop once then revert via onPoseEnd.
  const poseAnim = pose && hasSheet ? sheetAnim(settings.playerSheet!, pose, ["idle"]) : null;
  useEffect(() => {
    if (!pose || !poseOnce || !onPoseEnd || !hasSheet) return;
    const a = sheetAnim(settings.playerSheet!, pose, ["idle"]);
    if (!a || a.frames.length < 2) {
      onPoseEnd();
      return;
    }
    const fps = a.fps && a.fps > 0 ? a.fps : 8;
    const t = window.setTimeout(onPoseEnd, Math.max(200, (a.frames.length / fps) * 1000));
    return () => window.clearTimeout(t);
  }, [pose, poseOnce, onPoseEnd, hasSheet, settings.playerSheet]);
  // Perspective: big up close, small in the distance (near/far ends are
  // authorable; `depthScale` still works as "shrink by this much at the back").
  const playerDepth = stageSpriteScale(pos.y, floor, settings) * baseScale;
  // Walker shadow casting — skewed toward nearest light (toggleable)
  const walkerShadowOn = (cinematic as any)?.shadowCasting !== false;
  const walkerShadowIntensity = (cinematic as any)?.shadowIntensity ?? 0.8;
  const walkerNearestLight = useMemo(() => {
    if (!stageCinematicLights.length || !walkerShadowOn) return null;
    let best = stageCinematicLights[0];
    let bestDist = Infinity;
    for (const l of stageCinematicLights) {
      const d = Math.hypot(l.x - pos.x, l.y - pos.y);
      if (d < bestDist) {
        bestDist = d;
        best = l;
      }
    }
    return best;
  }, [stageCinematicLights, pos.x, pos.y, walkerShadowOn]);
  const walkerShadowSkew = walkerNearestLight ? (walkerNearestLight.x - pos.x) * 0.18 * walkerShadowIntensity : 0;
  const walkerShadowScaleY = walkerNearestLight ? 0.8 + playerDepth * 0.4 + (walkerNearestLight.intensity ?? 0.5) * 0.3 * walkerShadowIntensity : 0.8 + playerDepth * 0.3;
  const walkerShadowOpacity = walkerNearestLight ? Math.min(0.55, 0.25 + playerDepth * 0.15 + (walkerNearestLight.intensity ?? 0.5) * 0.15) * walkerShadowIntensity : 0.32 * walkerShadowIntensity;

  const markerIcon = (hs: Hotspot) => CURSOR_ICON[hs.cursor] ?? "◆";

  // The skull-pie centrepiece: the story's verbMenuIcon sprite (In-game
  // theme) resolved through Game, or a stage override — big in the middle of
  // the ring of verbs — the classic skull-pie presentation.
  const menuIcon = settings.objectMenuIcon;
  const menuIconEl =
    menuIcon?.startsWith("emoji:") ? (
      <span className="text-5xl leading-none">{menuIcon.slice("emoji:".length)}</span>
    ) : menuIcon ? (
      <img src={assetUrl(menuIcon)} alt="" draggable={false} className="h-full w-full select-none object-cover" />
    ) : (
      <span className="text-5xl leading-none">💀</span>
    );

  // Edge arrows — the LucasArts red (open) / yellow (locked) chevron. On a
  // single-screen room they sit at the plate edges whenever an exit exists;
  // on a wide world each arrow only shows while the camera is parked at that
  // end of the strip (you can't walk left past the left end).
  const edgeArrow = (edge: "left" | "right"): { exit: StageExitEdge; open: boolean } | null => {
    const ex = settings.exitEdges?.[edge];
    // An edge with no target scene is half-authored: no arrow, no exit.
    if (!ex?.targetSceneId || !active || exitRef.current) return null;
    if (wide) {
      const atEnd = edge === "left" ? cam <= 0.6 : cam >= worldW - 100 - 0.6;
      if (!atEnd) return null;
    }
    return { exit: ex, open: !ex.gating || !!edgeUnlockedRef.current?.(edge) };
  };
  const leftArrow = edgeArrow("left");
  const rightArrow = edgeArrow("right");

  return (
    <div
      ref={plateRef}
      data-stage-floor
      className={`absolute inset-0 z-[45] ${active ? "cursor-pointer" : "pointer-events-none"}`}
      style={{ pointerEvents: active ? "auto" : "none", ...(cursorStyle ?? {}) }}
      onPointerDown={(e) => {
        if (!active) return;
        // Anywhere else dismisses the object-first menu.
        setMenu(null);
        setMenuUse(null);
        const p = platePoint(e);
        const floorPoint = clampToWalkPoly(p.x, p.y, poly, worldW);
        // DOUBLE-CLICK JOG — two presses on the same floor spot jog there.
        tapJog(floorPoint.x, floorPoint.y);
        audio.click();
        setRipple({ x: floorPoint.x, y: floorPoint.y, key: Date.now() });
        // Clicking a zone walks to that zone's marker; empty floor walks
        // to the point. Markers themselves are buttons — this branch is
        // their fallback (and the walk-shortcut for touch users).
        const hit = hotspotAtPoint(hotspotsRef.current, p);
        if (hit) {
          if (objectMenu && !coinOn) {
            const m = markerPoint(hit);
            setMenu({ hs: hit, x: m.x, y: m.y, via: "object" });
          } else {
            walkToMarker(hit);
          }
        } else {
          // Empty floor: just walk — routed around the furniture. The fired
          // set persists, so brushed-past markers don't re-rattle on every
          // stroll. A fresh walk is also a CANCELLED aim: any verb the player
          // had queued on a marker must not fire later just because the path
          // happens to brush past that marker — and a chase is off too.
          pendingRef.current = null;
          pursueRef.current = null;
          routeRef.current = [];
          const route = stageRoutePoly(posRef.current, floorPoint, obstacles, poly, floor, STAGE_GRID_STEP, worldW);
          if (route.length) {
            routeRef.current = route.slice(1);
            targetRef.current = { x: route[0].x, y: route[0].y };
            setWalking(true);
          } else {
            // Walled off (or a click outside the floor): slide as close as the
            // furniture allows rather than refusing the click outright.
            targetRef.current = { x: floorPoint.x, y: floorPoint.y };
          }
        }
      }}
    >
      {/* THE WORLD — one continuous strip on wide worlds. The container is a
          single VIEWPORT (100% wide) so child `left: ${x}%` values are in
          screen-%, and the camera pans it via translateX(-cam%) in the same
          units — the walker stays centred as it moves. The wide background
          and the path overlay are worldW-wide children, so they pan through
          the viewport. Single-screen rooms render this at 100% with no
          transform, exactly the old behaviour. */}
      <div
        className="absolute inset-y-0 left-0"
        style={{
          width: "100%",
          transform: `translateX(-${cam}%)`,
          willChange: wide ? "transform" : undefined,
          isolation: "isolate",
        }}
      >
        {/* the world's own background on wide worlds — spans the whole strip
            and pans with the camera instead of standing still behind it */}
        {wide && Object.keys(stagePlateFill(background, worldW)).length ? (
          <div
            className="absolute inset-y-0 left-0"
            style={{ width: `${worldW}%`, ...stagePlateFill(background, worldW) }}
            aria-hidden
          />
        ) : null}

        {/* the walk path is an AUTHORING aid — painted and previewed in the
            Studio plate, but never drawn in the game. No off-band dim, no
            dashed outline: the floor reads from the room's art itself, and
            the marker reticles/proximity labels say where the player can go. */}

        {/* walk target ripple */}
        {ripple && active && (
          <span
            key={ripple.key}
            className="stage2d-ripple pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-neon/70"
            style={{ left: `${ripple.x}%`, top: `${ripple.y}%` }}
            onAnimationEnd={() => setRipple(null)}
          />
        )}

        {/* interaction markers — one per visible hotspot, standing where the
            thing stands. The object art (NPC / prop) and the reticle+label are
            SEPARATE plate-anchored elements so percent widths stay relative to
            the plate; both depth-sort by the marker's y. */}
        {hotspots
          // INTERACTABLE NPCs: a linked talker's static diamond HIDES — the
          // actor carries it (click the character, chase the character).
          .filter((hs) => !npcLinks[hs.id])
          .map((hs, markerIndex) => {
          const m = markerPoint(hs);
          const ok = unlocked(hs);
          const near = hints === "always" || (hints === "proximity" && (nearId === hs.id || posReachesMarker(pos, walkPoint(hs), HINT_RADIUS, aspect())));
          const z = 50 + Math.round(m.y);
          return (
            <div key={hs.id} className="contents">
              {/* the object itself (NPC / prop art), feet planted on the marker */}
              {hs.image || sheetDrawable(hs.sheet) ? (
                <div
                  className={`pointer-events-none absolute ${ok ? "" : "opacity-80 saturate-[0.7]"}`}
                  style={{ left: `${m.x}%`, top: `${m.y}%`, width: `${hs.bounds.w}%`, maxWidth: "none", transform: "translate(-50%,-100%)", zIndex: hs.occludes ? 160 : z }}
                >
                  {(() => {
                    const preset = presetStyle(hs.anim, { reducedMotion: prefersReducedMotion });
                    const inner = (child: React.ReactNode) =>
                      preset.className ? (
                        <div className={preset.className} style={{ ...(preset.vars as React.CSSProperties), transformOrigin: "50% 100%" }} aria-hidden>
                          {child}
                        </div>
                      ) : (
                        child
                      );
                    if (sheetDrawable(hs.sheet))
                      return inner(
                        <div
                          style={{ width: "100%", aspectRatio: `${Math.max(1, hs.sheet.frameWidth)} / ${Math.max(1, hs.sheet.frameHeight)}` }}
                        >
                          <SheetSprite
                            sheet={hs.sheet}
                            anim="loop"
                            fallbacks={["idle", "walk"]}
                            height="100%"
                            className="drop-shadow-[0_6px_10px_rgba(0,0,0,0.55)]"
                          />
                        </div>
                      );
                    return inner(
                      <img
                        src={assetUrl(hs.image!)}
                        alt=""
                        draggable={false}
                        className={`pointer-events-none w-full select-none object-contain object-bottom drop-shadow-[0_6px_10px_rgba(0,0,0,0.55)]`}
                      />
                    );
                  })()}
                </div>
              ) : null}
              <button
                tabIndex={active ? 0 : -1}
                aria-label={`${hs.label}${ok ? "" : " (locked)"}`}
                data-hs-id={hs.id}
                disabled={!active}
                className={`stage-marker pointer-events-auto absolute ${ok ? "" : "stage-marker-locked"}${flashOn ? " stage-marker-flash" : ""}`}
                style={{ left: `${m.x}%`, top: `${m.y}%`, zIndex: hs.occludes ? 161 : z + 1,
                  "--stage-label-left": m.x - cam < 12 ? "0%" : m.x - cam > 88 ? "100%" : "50%",
                  "--stage-label-shift": m.x - cam < 12 ? "0%" : m.x - cam > 88 ? "-100%" : "-50%",
                } as React.CSSProperties}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (!active) return;
                  audio.click();
                  // DOUBLE-CLICK JOG — a second press on the same marker jogs.
                  tapJog(walkPoint(hs).x, walkPoint(hs).y);
                  if (holdMode) {
                    // OBJECT-FIRST, HOLD-TO-OPEN: press and hold → the big
                    // skull pie opens in the middle of the screen; a quick
                    // tap walks to the object (the gesture lives on window
                    // listeners, so nothing else needs handling here).
                    beginHold(hs, e);
                  } else if (objectMenu && !coinOn) {
                    // OBJECT-FIRST, CLICK-TO-OPEN: the object → a small pie
                    // menu of its verbs pops up next to it (FT's "skull").
                    setMenu({ hs, x: m.x, y: m.y, via: "object" });
                    setMenuUse(null);
                  } else {
                    walkToMarker(hs);
                  }
                }}
                onClick={(e) => {
                  // Pointer-down owns a pointer command. Its subsequent click
                  // must not dispatch the same remote/already-there action twice.
                  if (!active || e.detail !== 0) return;
                  // Pointer presses open the menu above. Keyboard activation
                  // has no pointerdown, so it needs its own object-first path.
                  if (objectMenu && !coinOn) {
                    if (e.detail === 0) { setMenu({ hs, x: m.x, y: m.y, via: "object" }); setMenuUse(null); }
                  } else walkToMarker(hs);
                }}
                onFocus={() => setHoverObj({ label: hs.label, cursor: hs.cursor })}
                onBlur={() => setHoverObj((cur) => cur?.label === hs.label ? null : cur)}
                onMouseEnter={() => {
                  if (!active) return;
                  audio.hover();
                  // SENTENCE LINE: the strip reads out the object under the
                  // pointer ("Look at the drop-safe").
                  setHoverObj({ label: hs.label, cursor: hs.cursor });
                }}
                onMouseLeave={() => setHoverObj((cur) => (cur?.label === hs.label ? null : cur))}
                // RIGHT-CLICK: a quick Look in sentence-line rooms (SCUMM
                // muscle memory); everywhere else it opens the OBJECT-FIRST
                // verb menu for this object — the fastest route to "kick the
                // black ice" without switching modes or hunting the coin.
                onContextMenu={(e) => {
                  if (!active || scriptOnRef.current) return;
                  if (sentenceOn) {
                    e.preventDefault();
                    e.stopPropagation();
                    pickVerb(hs, "look");
                  } else if (verbMode && menuVerbs(hs).length) {
                    e.preventDefault();
                    e.stopPropagation();
                    // right-click again on the open object closes its pie
                    if (menu?.via === "context" && menu.hs.id === hs.id) setMenu(null);
                    else {
                      setMenu({ hs, x: m.x, y: m.y, via: "context" });
                      setMenuUse(null);
                    }
                  }
                }}
              >
                <span className={`stage-marker-label ${near ? "stage-marker-label-on" : ""}`}>
                  {coinOn ? VERB_ICON[verb] : markerIcon(hs)} {hs.label}
                  {verb === "use" && heldItem ? ` ← ${inventory?.find((i) => i.id === heldItem)?.name ?? ""}` : ""}
                  {!ok && " 🔒"}
                </span>
                <span className="stage-marker-reticle" aria-hidden />
                <span className="stage-marker-index" aria-hidden>{markerIndex + 1}</span>
              </button>
            </div>
          );
          })}

        {/* OBJECT-FIRST VERB MENU — a small pie of the verbs THIS object
            answers, popped up at the object (the "skull pie"). USE
            expands to the inventory when the object accepts items. */}
        {(menu?.via === "context" || (objectMenu && !holdMode)) && menu && active ? (
          <div
            className="pointer-events-auto absolute z-[200] w-max max-w-[208px]"
            data-stage-object-menu
            // Clamp in viewport coordinates, then restore the scrolling
            // world's offset. Edge objects must not open half a menu offscreen.
            style={{ left: `calc(clamp(104px, ${menu.x - cam}%, calc(100% - 104px)) + ${cam}%)`, top: `clamp(110px, ${Math.max(8, menu.y - 8)}%, calc(100% - 8px))`, transform: "translate(-50%,-100%)" }}
          >
            <div className="flex flex-col items-center gap-1.5 rounded border border-noir-700 bg-noir-950/92 p-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.6)] backdrop-blur-sm">
              <span className="max-w-[190px] whitespace-normal break-words px-1 text-center font-pulp text-[9px] uppercase tracking-widest text-paper/70">{menu.hs.label}</span>
              <div className="flex flex-wrap justify-center gap-1">
                {menuVerbs(menu.hs).map((v) => (
                  <button
                    key={v}
                    aria-label={VERB_LABEL[v]}
                    className="flex min-w-[40px] flex-col items-center rounded border px-1.5 py-1 font-pulp text-[9px] uppercase tracking-wide transition-colors border-noir-700 bg-noir-900/85 text-paper/80 hover:border-gold hover:text-gold"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      audio.click();
                      pickVerb(menu.hs, v);
                    }}
                  >
                    <span className="text-sm leading-none" aria-hidden>{VERB_ICON[v]}</span>
                    {v}
                  </button>
                ))}
              </div>
              {menuUse && menuUse.id === menu.hs.id ? (
                <div className="flex max-w-[200px] flex-wrap justify-center gap-1 border-t border-noir-700 pt-1">
                  {((inventory ?? []).length
                    ? inventory!
                    : []).map((it) => (
                      <button
                        key={it.id}
                        className="flex items-center gap-1 rounded border border-noir-700 bg-noir-900/85 px-1.5 py-1 font-type text-[10px] text-paper/80 hover:border-gold hover:text-gold"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          audio.click();
                          pickVerb(menu.hs, "use", it.id);
                        }}
                      >
                        <span aria-hidden>{it.icon ?? "📦"}</span> {it.name}
                      </button>
                    ))}
                  {(inventory ?? []).length === 0 ? (
                    <span className="px-1 font-type text-[9px] italic text-paper/40">Nothing to use here — nothing in your pockets.</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* HOLD-TO-OPEN SKULL PIE — press and hold an object and this BIG
            circular menu opens in the MIDDLE of the screen: the story's
            verbMenuIcon sprite sits large in the centre, the verbs the
            object answers ring it. Release over a verb to act; release over
            the skull or outside to cancel. The pie never intercepts the
            pointer — the window-gesture computes hover geometrically. */}
        {holdMode && menu && active ? (
          <div className="pointer-events-none fixed left-1/2 top-1/2 z-[210] -translate-x-1/2 -translate-y-1/2 select-none" aria-hidden>
            <div className="relative h-[340px] w-[340px]">
              {pieRef.current.verbs.map((v, i) => {
                const n = Math.max(1, pieRef.current.verbs.length);
                const rad = ((i * 360) / n - 90) * (Math.PI / 180);
                const x = 50 + (PIE_VERB_RADIUS / 3.4) * Math.cos(rad);
                const y = 50 + (PIE_VERB_RADIUS / 3.4) * Math.sin(rad);
                const hovered = pieHover === v;
                return (
                  <div
                    key={v}
                    data-pie-verb={v}
                    aria-label={VERB_LABEL[v]}
                    className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 rounded-full border px-3.5 py-2 transition-all duration-100 ${
                      hovered
                        ? "scale-110 border-gold bg-noir-900 text-gold shadow-[0_0_26px_rgba(232,178,60,0.45)]"
                        : "border-noir-600 bg-noir-950/90 text-paper/70"
                    }`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <span className="text-2xl leading-none" aria-hidden>{VERB_ICON[v]}</span>
                    <span className="font-pulp text-[8px] uppercase tracking-widest">{v}</span>
                  </div>
                );
              })}
              {/* the skull — the story's verbMenuIcon sprite, big in the middle */}
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
                <div className="flex h-[104px] w-[104px] items-center justify-center overflow-hidden rounded-full border-2 border-gold/60 bg-noir-950 shadow-[0_0_34px_rgba(232,178,60,0.4)]">
                  {menuIconEl}
                </div>
                <span className="whitespace-nowrap font-pulp text-[8px] uppercase tracking-widest text-paper/45">
                  {menuUse && menuUse.id === menu.hs.id ? "pick an item to use" : "release on a verb · skull cancels"}
                </span>
              </div>
              {menuUse && menuUse.id === menu.hs.id ? (
                <div className="absolute left-1/2 top-[calc(50%+92px)] flex -translate-x-1/2 flex-wrap justify-center gap-1.5">
                  {(inventory ?? []).map((it) => (
                    <button
                      key={it.id}
                      className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-gold/50 bg-noir-950/95 px-3 py-1.5 font-type text-[11px] text-paper/85 hover:border-gold hover:text-gold"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        audio.click();
                        pickVerb(menu.hs, "use", it.id);
                      }}
                    >
                      <span aria-hidden>{it.icon ?? "📦"}</span> {it.name}
                    </button>
                  ))}
                  {(inventory ?? []).length === 0 ? (
                    <span className="font-type text-[9px] italic text-paper/40">Nothing in your pockets.</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* WALK-BEHIND — IN FRONT of the walker. Feet past the baseline:
            paint the slice first so the sprite (later sibling) wins even
            when sibling z-index is ignored by the compositor. */}
        {occluders.map((o, i) =>
          occluderCoversWalker(o, pos.y) ? null : stageOccluderLayer(o, i, worldW, background, false),
        )}

        {/* the player character — outer handles position + facing (scaleX for
            left/right, directional anims for up/down) + depth scale, inner
            handles the idle/walk bob so the transforms don't fight. z-index
            tracks the feet so the party overlaps like people standing in a
            room, not like stickers. */}
        {!settings.hidePlayer && (() => {
          // A POSE overrides the directional idle/walk: the named animation
          // plays (still flipping with facing), and movement keeps the pose
          // rather than switching to the walk cycle.
          const posed = poseAnim
            ? { anim: poseAnim && pose ? pose : "idle", fallbacks: ["idle", "walk"], flip: dir === "left" || dir.endsWith("-left") }
            : stageDirectionAnimation(settings.playerSheet, dir, walking);
          // A JOG covers the floor STAGE2D_JOG_MULT times faster than a walk.
          // Play the sheet's RUN bank when it drew one; otherwise speed-match
          // the walk cycle so the feet keep up with the floor instead of
          // skating under it. Depth always re-rates the legs — a distant walker
          // takes smaller, slower steps, exactly as their movement already does.
          const run = walking && jogOn && !poseAnim ? jogAnimation(settings.playerSheet, dir) : null;
          const da = run ?? posed;
          const flip = da.flip ? -1 : 1;
          const walkRate =
            stageSpeedScale(pos.y, floor, settings) * (walking && jogOn && !run ? STAGE2D_JOG_MULT : 1);
          return (
            <div
              data-stage-player
              data-stage-facing={dir}
              data-jog={jogOn ? "1" : undefined}
              className="pointer-events-none absolute"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `translate(-50%,-100%) scaleX(${flip}) scale(${playerDepth})`,
                transformOrigin: "50% 100%",
                zIndex: 50 + Math.round(pos.y),
              }}
            >
              <div className={walking && walkFrames.length < 2 && !hasSheet ? "stage2d-walk" : walking ? "" : "stage2d-idle"}>
                {hasSheet ? (
                  <SheetSprite
                    sheet={settings.playerSheet!}
                    anim={da.anim}
                    fallbacks={da.fallbacks}
                    height={spriteH}
                    fpsScale={walkRate}
                    freezeOnFallback={!walking && !poseAnim}
                    className="drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]"
                  />
                ) : walkFrames.length > 0 ? (
                  <img
                    src={assetUrl(walkFrames[walking ? frameIdx % walkFrames.length : 0])}
                    alt=""
                    className="w-auto object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]"
                    style={{ height: spriteH }}
                    draggable={false}
                  />
                ) : settings.playerImage && !isEmoji ? (
                  <img
                    src={assetUrl(settings.playerImage)}
                    alt=""
                    className="w-auto object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]"
                    style={{ height: spriteH }}
                    draggable={false}
                  />
                ) : (
                  <span
                    className="block leading-none drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]"
                    style={{ fontSize: spriteH * 0.5 }}
                  >
                    {emoji}
                  </span>
                )}
                {/* ground shadow — light-cast skewed toward nearest light (outer already flipped) */}
                <span
                  className="pointer-events-none absolute left-1/2 top-full block h-2 w-10 rounded-[100%] bg-black/40 blur-[2px] will-change-transform"
                  style={{
                    transform: `translate(-50%, -50%) skewX(${walkerShadowSkew}deg) scaleY(${walkerShadowScaleY.toFixed(2)})`,
                    opacity: walkerShadowOpacity,
                    background: walkerNearestLight
                      ? `radial-gradient(ellipse at 50% 50%, ${glowColorWithAlpha(walkerNearestLight.color, 0.2)}, rgba(0,0,0,0.45) 70%)`
                      : undefined,
                  }}
                />
              </div>
              {/* CUTSCENE SAY LINE — the player's floating speech during a
                  scripted sequence. Counter-flipped so the text never mirrors
                  with the sprite. Keep the local -50% centering: reversing that
                  translation displaced left-facing captions by a full label width. */}
              {playerSay ? (
                <span
                  data-stage-player-say
                  className="pointer-events-none absolute -top-7 left-1/2 max-w-[240px] rounded border border-noir-700 bg-noir-950/85 px-2 py-1 text-center font-type text-[11px] leading-tight text-paper shadow-[0_4px_14px_rgba(0,0,0,0.5)]"
                  style={{ transform: `translateX(-50%) scaleX(${flip})`, width: "max-content" }}
                >
                  {playerSay}
                </span>
              ) : null}
            </div>
          );
        })()}

        {/* AMBIENT NPCS — scene actors that idle and (optionally) patrol,
            depth-scaled and z-sorted with the walker so everyone overlaps
            like people standing in a room. Pure stage life: they don't take
            input and don't gate anything — except during a SCRIPTED
            SEQUENCE, which can walk them and put lines over their heads
            through the registered control handles. */}
        {(settings.npcs ?? []).map((npc) => (
          <StageNpcActor
            key={npc.id}
            npc={npc}
            floor={floor}
            settings={settings}
            register={registerNpc}
            linkedHotspot={npc.talkHotspotId ? hotspots.find((h) => h.id === npc.talkHotspotId) : undefined}
            onPress={pressNpc}
            onContext={openNpcMenu}
            onPos={(id, pos) => {
              npcPosRef.current[id] = pos;
            }}
            flash={flashOn}
            frozen={convoHotspotId != null && npc.talkHotspotId === convoHotspotId}
            faceX={posRef.current?.x}
            spriteH={spriteH}
            cinematic={cinematic}
          />
        ))}
        {/* WALK-BEHIND — COVERING the walker. Feet on/behind the baseline:
            paint the slice AFTER the party so it covers even when sibling
            z-index is ignored. z 160 clears the tallest walker (50+y).
            pointer-events-none: this is paint, not collision. */}
        {occluders.map((o, i) =>
          occluderCoversWalker(o, pos.y) ? stageOccluderLayer(o, i, worldW, background, true) : null,
        )}

      </div>

      {/* EDGE ARROWS — fixed to the VIEWPORT (not the world): the red/yellow
          chevron of the classic adventure. Click to walk off the edge. */}
      {leftArrow ? (
        <button
          className="pointer-events-auto absolute top-1/2 z-[70] -translate-y-1/2 select-none"
          style={{ left: 6 }}
          title={leftArrow.exit.label ?? "walk left"}
          aria-label={leftArrow.exit.label ?? "Walk off the left edge"}
          onClick={() => clickEdge("left")}
        >
          <span
            className={`flex h-16 w-9 flex-col items-center justify-center gap-0.5 rounded-r-lg border-2 font-pulp text-[9px] uppercase tracking-widest shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-colors ${
              leftArrow.open
                ? "border-red-300 bg-red-700/90 text-white hover:bg-red-500"
                : "border-yellow-200 bg-yellow-600/90 text-yellow-950 hover:bg-yellow-500"
            }`}
          >
            <span className="text-xl leading-none" aria-hidden>◀</span>
            {leftArrow.open ? "OUT" : "LOCKED"}
          </span>
        </button>
      ) : null}
      {rightArrow ? (
        <button
          className="pointer-events-auto absolute top-1/2 z-[70] -translate-y-1/2 select-none"
          style={{ right: 6 }}
          title={rightArrow.exit.label ?? "walk right"}
          aria-label={rightArrow.exit.label ?? "Walk off the right edge"}
          onClick={() => clickEdge("right")}
        >
          <span
            className={`flex h-16 w-9 flex-col items-center justify-center gap-0.5 rounded-l-lg border-2 font-pulp text-[9px] uppercase tracking-widest shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-colors ${
              rightArrow.open
                ? "border-red-300 bg-red-700/90 text-white hover:bg-red-500"
                : "border-yellow-200 bg-yellow-600/90 text-yellow-950 hover:bg-yellow-500"
            }`}
          >
            <span className="text-xl leading-none" aria-hidden>▶</span>
            {rightArrow.open ? "OUT" : "LOCKED"}
          </span>
        </button>
      ) : null}

      {/* VERB COIN — bottom-left, the way a LucasArts room puts it. Pick a
          verb, then click the object; USE arms an inventory item first. */}
      {coinOn && active && !scriptOn ? (
        <div className="pointer-events-auto absolute bottom-3 left-3 z-[200] flex flex-col items-start gap-1.5">
          {verb === "use" && (inventory?.length ?? 0) > 0 ? (
            <div className="flex max-w-[min(70vw,640px)] flex-wrap gap-1 rounded border border-noir-700 bg-noir-950/90 p-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.5)] backdrop-blur-sm">
              <span className="self-center px-1 font-pulp text-[9px] uppercase tracking-[0.2em] text-gold/70">Use</span>
              {inventory!.map((it) => {
                const on = heldItem === it.id;
                return (
                  <button
                    key={it.id}
                    aria-label={`Use ${it.name}`}
                    aria-pressed={on}
                    className={`flex items-center gap-1 rounded border px-2 py-1 font-type text-[11px] transition-colors ${
                      on
                        ? "border-gold bg-gold/20 text-gold"
                        : "border-noir-700 bg-noir-900/80 text-paper/80 hover:border-gold/60 hover:text-gold"
                    }`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      audio.click();
                      setHeldItem(on ? null : it.id);
                    }}
                  >
                    <span aria-hidden>{it.icon ?? "📦"}</span> {it.name}
                  </button>
                );
              })}
              <span className="self-center px-1 font-type text-[10px] italic text-paper/45">
                …then click what you want to use it on
              </span>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-1 rounded border border-noir-700 bg-noir-950/90 p-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.5)] backdrop-blur-sm">
            {verbs!.map((v) => {
              const on = verb === v;
              return (
                <button
                  key={v}
                  aria-label={VERB_LABEL[v]}
                  aria-pressed={on}
                  className={`flex min-w-[64px] flex-col items-center rounded border px-2 py-1 font-pulp text-[10px] uppercase tracking-[0.15em] transition-colors ${
                    on
                      ? "border-gold bg-gold/20 text-gold"
                      : "border-noir-700 bg-noir-900/80 text-paper/70 hover:border-gold/60 hover:text-gold"
                  }`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    audio.click();
                    setVerb(v);
                    if (v !== "use") setHeldItem(null);
                  }}
                >
                  <span className="text-base leading-none" aria-hidden>
                    {VERB_ICON[v]}
                  </span>
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* SENTENCE LINE — the SCUMM strip: the pending interaction read out
          along the bottom of the room ("Look at the drop-safe", "Use wrench
          on the bike", "Walk to"). Rooms without it render nothing. */}
      {sentenceOn && active && !scriptOn ? (
        <div
          className="stage-sentence pointer-events-none absolute inset-x-0 bottom-0 z-[72] flex h-6 items-center justify-center border-t border-noir-700/70 bg-noir-950/75 px-16 font-type text-[11px] tracking-wide text-paper/85 backdrop-blur-[2px]"
          aria-live="polite"
        >
          {sentenceLineText({
            verb: coinOn ? verb : null,
            heldItemName:
              coinOn && verb === "use" && heldItem
                ? inventory?.find((i) => i.id === heldItem)?.name
                : null,
            target: hoverObj,
          })}
        </div>
      ) : null}

      {/* SCRIPTED SEQUENCE — cutscene dressing: letterbox bars slide in and
          a full-plate shield swallows every click while the script runs.
          The bars are the whole "input locked" UI — no spinner, no text;
          the scene itself is the show. */}
      {scriptOn ? (
        <div className="pointer-events-auto absolute inset-0 z-[200] cursor-wait" data-stage-cutscene aria-hidden>
          <div className="stage-letterbox absolute inset-x-0 top-0 h-[9%] bg-black/95" />
          <div className="stage-letterbox absolute inset-x-0 bottom-0 h-[9%] bg-black/95" />
        </div>
      ) : null}
    </div>
  );
}
