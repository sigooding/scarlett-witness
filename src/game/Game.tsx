import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { audio, resolveTransitionSound, transitionTravelDir, type MixChannel } from "../audio";
import { DialogFrame } from "../components/DialogFrame";
import {
  calculateGhostElements,
  GRADE_PRESETS,
  inGameThemeVars,
  lensFlareStyle,
  lightStyle,
  parallaxStyle,
  resolveLensFlares,
  resolveLights,
  type ResolvedLensFlare,
} from "../cinematic";
import {
  applyConsequences,
  carryOverState,
  characterOpinion,
  clamp,
  combineItems,
  bypassedSceneId,
  createInitialState,
  currentEpisode,
  effectiveChoiceGating,
  episodeOfScene,
  evidenceBreaksLie,
  examineZoom,
  applyLieCaught,
  applyLieWrong,
  beatLie,
  interrogationOutcome,
  isPressingReply,
  lieCanStillPress,
  lieWrongLine,
  pressComposure,
  pressReaction,
  steadyComposure,
  gatingHint,
  heatBustTarget,
  isEpisodic,
  mapAvailable,
  mapLocationsView,
  mapReplacedChoiceIds,
  meetsGating,
  METER_LABELS,
  nextEpisode,
  nextEpisodeForEnding,
  prettyFlagName,
  presentationConsequences,
  readSave,
  readSaveDetailed,
  readSaves,
  saveReadMessage,
  AUTO_SLOT,
  CHECKPOINT_MIN_GAP_MS,
  CHECKPOINT_QUIET_MS,
  recordEnding,
  recordEpisodeProgress,
  recordMemory,
  recordPresentation,
  resolveBeatText,
  resolveRecap,
  resolveHotspot,
  sceneById,
  seasonEpisodes,
  CURSOR_ICON,
  inventoryDisplay,
  resolveCursor,
  resolveVerbAction,
  itemsConsumedBy,
  wrongVerbLine,
  uid,
  writeSave,
} from "../logic";
import {
  exportSaveFile,
  importSaveFile,
  onFileMenu,
  openSavesDir,
  saveFilesAvailable,
  tailPath,
  writeSaveFile,
} from "./saveFiles";
import { assetBackground, assetUrl } from "../assetPath";
import { mediaPreloader, shouldPreloadMedia } from "../mediaPreload";
import { nextSceneMediaPlan } from "./scenePreload";
import { interruptibleNow, showsCountdownRing, silenceOutcome, TIMER_STYLE, timerFlavour } from "./conversationTimer";
import {
  ActTitleCard,
  EpisodeChip,
  EpisodeEndCard,
  EpisodeRecap,
  EpisodeTitleCard,
  NextTimeCard,
  SeasonScreen,
  episodeLabel,
  plateStyle,
} from "./Episode";
import { Flowchart } from "./Flowchart";
import { InventoryDock } from "./InventoryDock";
import { SheetSprite } from "./SheetSprite";
import { sheetDrawable, type SpriteSheet } from "./spriteSheet";
import { PatternPuzzleGame } from "./PatternPuzzle";
import { ArcadeGame } from "./ArcadeGame";
import type { PatternPuzzleConfig } from "./PatternPuzzleTypes";
import type { ArcadeGameConfig } from "../types";
import { EsperGame } from "./EsperGame";
import type { EsperConfig } from "./EsperTypes";
import { VkGame } from "./VkGame";
import { ScrollingLayer } from "./ScrollingLayer";
import type { VkConfig } from "./VkTypes";
import { RideGame } from "./RideGame";
import { TriangulateGame } from "./TriangulateGame";
import { RouteMap } from "./RouteMap";
import { Particles, AmbientAtmosphere } from "./AmbientParticles";
import type { ParticleKind } from "./AmbientParticles";
import { actOfScene } from "./routeGraph";
import { emptyCoverage, readCoverage, recordRun, recordVisit, writeCoverage, type PlaytestCoverage } from "./playtestCoverage";
import {
  motionAnimatable,
  motionAnimationSafe,
  motionKeyframes,
  presetStyle,
  scrollAnimatable,
  scrollKeyframes,
} from "./animation";
import { prefersReducedMotion as prefersReducedMotionPure, usePrefersReducedMotion, reducedMotionCinematicMode, reducedMotionTransition } from "./useReducedMotion";
import { DepthParallaxLayer } from "./DepthParallax";
import { CREDITS_TYPE_SPEED, creditsRollSeconds, creditsTiming, resolveCredits } from "../credits";
import type {
  Choice,
  CinematicSettings,
  CreditsSettings,
  DialogueBeat,
  DialogueBoxTheme,
  Episode,
  EpisodeProgress,
  ForegroundAnimation,
  ForegroundExtra,
  GameSave,
  GlobalState,
  Hotspot,
  HotspotAction,
  CursorKind,
  VerbId,
  Act,
  Item,
  JourneyStep,
  MeterKey,
  SceneNode,
  Story,
} from "../types";
import { initGameSeedFromUrl, restoreRngSnapshot, rngSnapshot } from "./rng";
/* The decision surface — the branching rules, extracted as pure functions so
 * the automated playthrough bot (scripts/playthrough-bot.mjs) drives the SAME
 * logic the player does. Game.tsx imports them rather than keeping private
 * copies, so the simulation can never silently drift from the runtime. */
import { adjustedConsequences, choiceRepeats, gambleFlag, getPerks, rollGamble, type Perks } from "./decisions";
import { canRewindDecision, emptyRewind, popRewind, pushRewind, rewindLabel, sealRewind, type RewindStack } from "./rewind";
import { simFromRuntime, strandedNow, STRANDED_GRACE_MS } from "./stranded";
import { deepLinkFromUrl, describeDeepLink, resolveDeepLink } from "./deepLink";
import { AFTER_VOICE_SECONDS, ANIMATIC, AnimaticCaptions, AnimaticEnd, captionFor, headingSeconds, noteCaption, noteScene, readingSeconds } from "./animatic";

/* SEEDED RUNS — ?seed=1234 on the URL pins every gameplay draw (minigame
 * shuffles, ride spawns) to one deterministic stream, applied once at
 * import before anything mounts. Same seed + same inputs = same run: a
 * bug that needs an unlucky roll replays on demand. */
const bootSeed = initGameSeedFromUrl();
if (bootSeed) console.info(`[seed] deterministic run — seed "${bootSeed}" (same seed + same inputs = same run)`);

/* INJECT-A-WORLD-STATE DEEP LINKS — ?scene=…&flags=…&items=…&meters=…&trust=…
 * boots the real runtime into a fabricated world state, so a specific branch
 * can be handed to a collaborator as a link and "the gate should open" can be
 * WATCHED opening at full screen instead of inspected in Studio.
 *
 * Read when the player MOUNTS, not once at module import the way the seed is.
 * The seed can be import-time because it only has to be applied before the
 * first draw; a deep link decides which scene to open, and the URL can change
 * between mounts without a reload (a Studio playtest window, an in-app
 * navigation, a remount in tests). Reading it at import captured whatever URL
 * happened to be live when the module first loaded and then applied it
 * forever. See src/game/deepLink.ts. */

/* ------------------------------------------------------------------ */
/*  helpers                                                            */
/* ------------------------------------------------------------------ */

type PrimedAudio = { url: string; el: HTMLAudioElement };

function playSceneProse(scene: SceneNode, primedNarration?: PrimedAudio | null) {
  if (!scene.prose) return;
  if (scene.narrationAudioUrl) {
    const prepared = primedNarration?.url === scene.narrationAudioUrl ? primedNarration.el : undefined;
    void audio.playClip(scene.narrationAudioUrl, prepared);
  } else {
    audio.speak(scene.prose);
  }
}

function shouldAutoNarrateSceneProse(scene: SceneNode) {
  if (!scene.prose || scene.autoNarrate === false) return false;
  // Credit/title nodes are usually visual cards, so avoid robotic Web Speech
  // reading their titles aloud. If the author explicitly attached recorded
  // prose narration, though, that audio is intentional and should play — this
  // is especially important when a credits/cutscene node is the start scene.
  if (scene.nodeType === "credits" && !scene.narrationAudioUrl) return false;
  return true;
}

function proseNarrationDelayMs(scene: SceneNode) {
  // Recorded clips and instant/ceremonial nodes should start with the frame.
  // The old blanket 600ms delay made short start cards easy to click past
  // before their narration had even been attempted.
  if (scene.narrationAudioUrl || scene.noTypewriter || scene.nodeType === "credits" || scene.nodeType === "cutscene") return 0;
  return 600;
}

/* ------------------------------------------------------------------ *
 *  MUSIC FADES
 *
 *  The soundtrack is a raw <audio> element outside the WebAudio graph, so
 *  there is no GainNode to automate — the fade is a rAF loop on .volume.
 *
 *  Two rules make this feel like a film rather than a playlist:
 *    · leaving a track always RAMPS DOWN, never cuts
 *    · a replacement track ramps UP over the same window, so the two
 *      overlap into a crossfade instead of leaving a hole
 *
 *  equalPower keeps perceived loudness steady through the overlap. A linear
 *  crossfade dips in the middle, because two signals at half amplitude are
 *  quieter than one at full.
 * ------------------------------------------------------------------ */

/** Default fade length. Long enough to read as intentional, short enough
 *  that it never delays a scene change the player has already committed to. */
const MUSIC_FADE_MS = 1400;

/** Equal-power crossfade pair. sin² + cos² = 1 at every t, so a track fading
 *  out on `down` and one fading in on `up` sum to constant perceived
 *  loudness. The obvious `1 - sin` for the outgoing side is NOT equivalent:
 *  it dips to ~0.51 of full power halfway through, an audible hole in the
 *  middle of the crossfade. */
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const fadeUpCurve = (t: number) => Math.sin((clamp01(t) * Math.PI) / 2);
const fadeDownCurve = (t: number) => Math.cos((clamp01(t) * Math.PI) / 2);

/**
 * Ramp an element's volume to `to` over `ms`, then optionally stop it.
 * Returns a cancel function. Any previous ramp on the same element is
 * cancelled first, so rapid scene changes can't leave two loops fighting
 * over one volume property.
 */
type FadeHandle = { cancel: () => void };
const activeFades = new WeakMap<HTMLAudioElement, FadeHandle>();

/** True while a ramp is in flight on this element. Callers that set .volume
 *  directly (the mixer faders) must not fight a running fade. */
const isFading = (el: HTMLAudioElement) => activeFades.has(el);

function fadeAudio(
  el: HTMLAudioElement,
  to: number,
  ms: number,
  onDone?: () => void
): FadeHandle {
  activeFades.get(el)?.cancel();
  const from = el.volume;
  // Nothing to do — still run onDone so callers can rely on it firing.
  if (ms <= 0 || Math.abs(to - from) < 0.001) {
    try {
      el.volume = clamp01(to);
    } catch {
      /* element detached */
    }
    onDone?.();
    const noop = { cancel: () => {} };
    return noop;
  }
  const start = performance.now();
  let raf = 0;
  let cancelled = false;
  const step = (now: number) => {
    if (cancelled) return;
    const t = Math.min(1, (now - start) / ms);
    // Going down travels the cos curve from `from` to `to`; going up travels
    // the sin curve. Run as a simultaneous pair they hold constant power.
    const v =
      to < from
        ? to + (from - to) * fadeDownCurve(t)
        : from + (to - from) * fadeUpCurve(t);
    try {
      el.volume = clamp01(v);
    } catch {
      /* element detached mid-ramp */
    }
    if (t < 1) {
      raf = requestAnimationFrame(step);
    } else {
      try {
        el.volume = clamp01(to);
      } catch {
        /* noop */
      }
      activeFades.delete(el);
      onDone?.();
    }
  };
  raf = requestAnimationFrame(step);
  const handle: FadeHandle = {
    cancel: () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      activeFades.delete(el);
    },
  };
  activeFades.set(el, handle);
  return handle;
}

const ATTITUDE_COLOR: Record<string, string> = {
  Sultry: "border-neon/70 text-neon",
  Aggressive: "border-crimson/70 text-crimson",
  Clever: "border-cyan-neon/70 text-cyan-neon",
  Neutral: "border-paper/40 text-paper/80",
};

const ATTITUDE_ICON: Record<string, string> = {
  Sultry: "💋",
  Aggressive: "✊",
  Clever: "🧠",
  Neutral: "💬",
};

/** Number-badge colours per attitude — the small circular index on each
 * choice button inherits the row's accent so the palette reads at a glance. */
const ATTITUDE_BADGE: Record<string, string> = {
  Sultry: "border-neon/50 text-neon",
  Aggressive: "border-crimson/50 text-crimson",
  Clever: "border-cyan-neon/50 text-cyan-neon",
  Neutral: "border-paper/30 text-paper/80",
};

/** Per-speaker accent colours for the bottom-panel nameplate, cycled by
 * cast order so every character has a consistent identity across the
 * whole case. The narrator keeps the house gold. */
const SPEAKER_ACCENTS = [
  { text: "text-gold", bar: "bg-gold", glow: "rgba(232,178,60,0.5)" },
  { text: "text-neon", bar: "bg-neon", glow: "rgba(255,46,136,0.5)" },
  { text: "text-cyan-neon", bar: "bg-cyan-neon", glow: "rgba(42,217,217,0.5)" },
  { text: "text-crimson", bar: "bg-crimson", glow: "rgba(226,59,78,0.5)" },
];
const speakerAccent = (story: Story, characterId: string) => {
  if (characterId === "narrator") return SPEAKER_ACCENTS[0];
  const idx = story.characters.findIndex((c) => c.id === characterId);
  // Offset by one so the first character doesn't share the narrator's gold.
  return SPEAKER_ACCENTS[((idx < 0 ? 0 : idx) + 1) % SPEAKER_ACCENTS.length];
};

/* ---------------------------------------------------------------------
 * DIALOGUE PANEL GEOMETRY
 *
 * The narrative panel is pinned to the bottom of the frame, so its height is
 * load-bearing for the whole HUD: every pixel it grows pushes its own inline
 * controls (narrate / skip / back) upward. Typing prose in one character at a
 * time changes that height continuously, which turned those buttons into a
 * moving target mid-sentence.
 *
 * The fix is to reserve the text area's height up front instead of letting it
 * grow into it. `min-height` is set from the number of lines the author wants
 * room for, so the box is full-size from the first character and the controls
 * never move. It is a floor, not a cap: prose longer than the reservation
 * still expands rather than clipping or scrolling away.
 * ------------------------------------------------------------------ */

/** Default lines of prose to reserve. Three covers the overwhelming majority
 *  of subtitle-length beats at the panel's max width. */
const DEFAULT_RESERVE_LINES = 3;

/** Panel prose is text-xl/2xl with leading-snug (~1.375). Track it here so
 *  the reserved height matches what the text actually occupies. */
const PROSE_LINE_EM = 1.375;

/** Height to hold open for the typing area, as a CSS length. Returns
 *  undefined when the author has switched the reservation off. */
function reservedProseHeight(theme: DialogueBoxTheme | undefined): string | undefined {
  const lines = theme?.reserveLines ?? DEFAULT_RESERVE_LINES;
  if (lines <= 0) return undefined;
  const scale = theme?.textScale ?? 1;
  return `${(lines * PROSE_LINE_EM * scale).toFixed(3)}em`;
}

/** Backdrop layer for the narrative panel. Sits behind the panel's content
 *  and, unlike the default scrim, can carry an authored image at an authored
 *  opacity. Pointer-events-none so it never intercepts a choice click. */
function DialogueBackdrop({ theme }: { theme: DialogueBoxTheme | undefined }) {
  const image = theme?.backgroundImage;
  const opacity = Math.max(0, Math.min(1, theme?.backgroundOpacity ?? 0.85));
  const blur = Math.max(0, theme?.backdropBlur ?? 0);
  const tint = theme?.backgroundColor ?? "#07080c";
  // Nothing authored and nothing to blur — the default gradient scrim already
  // handles this case, so don't stack a second layer over it.
  if (!image && !theme?.backgroundColor && !blur && theme?.backgroundOpacity === undefined) return null;
  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-[1] ${theme?.bordered ? "border border-paper/15 shadow-2xl shadow-black/60" : ""}`}
      style={{
        backgroundColor: tint,
        opacity,
        ...(image ? bgStyle(assetUrl(image)) : {}),
        // backgroundColor is painted under the image, so an image at partial
        // opacity still reads against a consistent base rather than the art.
        ...(blur ? { backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)` } : {}),
      }}
      aria-hidden
    />
  );
}

function bgStyle(bg: string): React.CSSProperties {
  const resolved = assetBackground(bg);
  if (resolved.startsWith("gradient:")) return { background: resolved.slice(9) };
  if (resolved.startsWith("video:")) return { background: "#05050a" };
  return { backgroundImage: `url(${resolved})`, backgroundSize: "cover", backgroundPosition: "center" };
}

/** Grade + film-stock + parallax classes for a cinematic plate. The colour
 * grade is a class only for non-dolly-zoom modes (the dolly-zoom keyframes
 * own `filter` for the blur, so its grade filter is baked into the keyframes
 * via --cin-grade-filter); the film treatment and parallax wrapper are plain
 * classes that work with any mode. */
function cinematicGradeClasses(c: CinematicSettings | undefined): string {
  const out: string[] = [];
  const grade = c?.colorGrade ? GRADE_PRESETS[c.colorGrade] : undefined;
  const film = !!c?.filmGrade;
  if (grade && (c?.mode ?? "pan") !== "dolly-zoom") out.push(`cin-grade-${grade.id}`);
  if (film) out.push("film-grade");
  return out.join(" ");
}

/** The clean (no-blur) grade filter for SPRITE layers — foreground extras,
 * the primary foreground subject, hotspot object images, talking portraits
 * and the stage walker. The plate takes the grade via its cin-grade-* class;
 * sprites render in layers above it, so without this they'd float ungraded
 * (full colour over a 1940s black & white plate). Same preset, same filter,
 * so sprite pixels match the plate exactly. */
export function spriteGradeStyle(c?: CinematicSettings): React.CSSProperties {
  const grade = c?.colorGrade ? GRADE_PRESETS[c.colorGrade] : undefined;
  if (!grade?.filter || grade.filter === "none") return {};
  return { filter: grade.filter };
}

/** The split-tone wash + scratch layer that sit ABOVE a graded/filmed plate
 * (also the only grade treatment video cutscenes can show — a video frame
 * can't take a CSS filter). Render inside the same relative container as the
 * plate so it covers it exactly. */
export function CinematicOverlays({ cinematic }: { cinematic?: CinematicSettings }) {
  const grade = cinematic?.colorGrade ? GRADE_PRESETS[cinematic.colorGrade] : undefined;
  const film = !!cinematic?.filmGrade;
  if (!grade && !film) return null;
  const strength = Math.max(0, Math.min(1, cinematic?.filmGradeStrength ?? 0.7));
  return (
    <>
      {grade && (
        <div
          className="grade-wash"
          aria-hidden
          style={{
            background: grade.tint,
            "--grade-wash-op": grade.tintOpacity,
            "--grade-wash-blend": grade.tintBlend,
          } as React.CSSProperties}
        />
      )}
      {film && (
        <div
          className="film-scratches"
          aria-hidden
          style={{ "--film-strength": strength } as React.CSSProperties}
        />
      )}
    </>
  );
}

/** Build the CSS class + variables that apply cinematic camera motion and
 * dimming to an image layer. Used for the scene background and per-beat
 * replacement backgrounds. Light glows are separate layers (see LightGlow).
 *
 * `still: true` renders the layer WITHOUT camera motion, frozen at the plate's
 * t=0 frame: the slide/zoom scene-transition overlays use it to show the
 * DESTINATION scene's background art during the move. Motion modes start
 * mid-move (pan zoomed in, dolly offset, dolly-zoom at its start scale), so
 * the frozen transform is the keyframe's 0% value — not a bare identity —
 * which is what makes the overlay pixel-match the plate at the swap instant. */
export function cinematicLayer(c: CinematicSettings | undefined, url: string, opts?: { reducedMotion?: boolean; still?: boolean }): { className: string; style: React.CSSProperties } {
  const reduced = !!opts?.reducedMotion;
  const still = !!opts?.still;
  // Reduced motion: every moving camera mode becomes static; shake amplitude
  // is zeroed. Dim, grade, letterbox and lights still apply (they don't move).
  const rawMode = c?.mode ?? "pan";
  const mode = reduced || still ? reducedMotionCinematicMode(rawMode) : rawMode;
  const focalPos = c?.focalPoint ?? "50% 50%";
  const zoomDur = c?.zoomDuration ?? 8;
  const shake = reduced || still ? 0 : Math.max(0, Math.min(1, c?.shakeAmount ?? 0.5));
  // Roll defaults to intensity-derived so pre-existing shake scenes look the
  // same; authors can override it (and the jitter tempo) for finer control.
  const shakeRot = c?.shakeRotation ?? shake * 0.7;
  const shakeDur = Math.max(0.1, c?.shakeDuration ?? 0.5);
  // Slow pan drift — 0 keeps the old gentle push-in behaviour.
  const panDist = Math.max(0, c?.panDistance ?? 0);
  const panDir = c?.panDirection === "left" ? "-" : "";
  // Vertigo dolly-zoom: direction chooses which half of the move plays.
  const zoomAmount = Math.max(1, c?.dollyZoomAmount ?? 1.35);
  const zoomDir = c?.dollyZoomDirection ?? "both";
  const style: React.CSSProperties = {
    ...bgStyle(url),
    "--cin-zoom-dur": `${zoomDur}s`,
    "--cin-zoom-end": `scale(1.22) translate(${focalPos.split(" ").map((v) => `${((50 - parseFloat(v)) * 0.14).toFixed(2)}%`).join(", ")})`,
    "--cin-pan-x": `${panDir}${panDist}%`,
    "--cin-pan-y": "0%",
    "--cin-pan-dur": `${zoomDur}s`,
    "--cin-dim": String(c?.dimAmount ?? 0),
    // Handheld shake: amplitude in px + rotation in deg, driven by intensity.
    "--cin-shake-amt": `${(shake * 6).toFixed(2)}px`,
    "--cin-shake-rot": `${shakeRot.toFixed(2)}deg`,
    "--cin-shake-dur": `${shakeDur}s`,
    // Rail/dolly track: travel distance + direction + one-pass duration, plus
    // an optional vertical drift for a diagonal/crane pan.
    "--cin-dolly-dist": `${Math.max(0, c?.dollyDistance ?? 8)}%`,
    "--cin-dolly-dir": c?.dollyDirection === "left" ? "-1" : "1",
    "--cin-dolly-dur": `${Math.max(1, c?.dollyDuration ?? 10)}s`,
    "--cin-dolly-vert": `${Math.max(0, Math.min(8, c?.dollyVertical ?? 0))}%`,
    // Vertigo dolly-zoom: start/end scale (push in, pull out, or both) + blur.
    "--cin-dolly-zoom-from": `${zoomDir === "pull" ? zoomAmount : 1}`,
    "--cin-dolly-zoom-to": `${zoomDir === "pull" ? 1 : zoomAmount}`,
    "--cin-dolly-zoom-blur": `${Math.max(0, c?.dollyZoomBlur ?? 0)}px`,
    "--cin-dolly-zoom-dur": `${Math.max(1, c?.dollyZoomDuration ?? 8)}s`,
    // Colour grade: dolly-zoom keyframes own `filter` (the blur), so the grade
    // filter is baked into the keyframe variable; other modes take a class.
    // Keyed on rawMode (not `mode`) so a `still` dolly-zoom layer can freeze
    // at the plate's clean t=0 grade.
    ...(rawMode === "dolly-zoom" && !reduced
      ? {
          // Keyframes consume these; defaults keep the blur-only behaviour.
          "--cin-grade-filter": c?.colorGrade
            ? (GRADE_PRESETS[c.colorGrade]?.filterWithBlur ?? GRADE_PRESETS[c.colorGrade]?.filter ?? `blur(${Math.max(0, c?.dollyZoomBlur ?? 0)}px)`)
            : `blur(${Math.max(0, c?.dollyZoomBlur ?? 0)}px)`,
          "--cin-grade-filter-clean": c?.colorGrade ? (GRADE_PRESETS[c.colorGrade]?.filter ?? "none") : "none",
        }
      : {}),
    // Film-stock strength (drives grain/halation/scratch opacity).
    ...(c?.filmGrade
      ? {
          "--film-strength": String(Math.max(0, Math.min(1, c.filmGradeStrength ?? 0.7))),
        }
      : {}),
  } as React.CSSProperties;
  // Dolly needs the image larger than the frame so it has room to travel —
  // pin the height and let the width overflow instead of cropping to cover.
  // Keyed on rawMode (not `mode`) so a `still` dolly layer keeps the same
  // sizing as the moving plate it is matched against at the swap.
  if (rawMode === "dolly" && !reduced) {
    style.backgroundSize = "auto 122%";
    style.backgroundPosition = "center center";
  }
  const className = [
    mode === "pan"
      ? "cin-pan"
      : mode === "zoom-hold"
        ? "cin-zoom-hold"
        : mode === "shake"
          ? "cin-shake"
          : mode === "dolly"
            ? "cin-dolly"
            : mode === "dolly-zoom"
              ? zoomDir === "push"
                ? "cin-dolly-zoom-push"
                : zoomDir === "pull"
                  ? "cin-dolly-zoom-pull"
                  : "cin-dolly-zoom"
              : "cin-static",
    (c?.dimAmount ?? 0) > 0 ? "cin-dim" : "",
    cinematicGradeClasses(c),
  ]
    .filter(Boolean)
    .join(" ");
  if (still && !reduced) {
    // Freeze at the plate's t=0 frame (each keyframe's 0% value, written with
    // the same --cin-* vars the animation consumes), so a moving scene's
    // overlay art lines up with the freshly-mounted plate at the swap.
    style.transform =
      rawMode === "pan"
        ? "scale(1.12) translate(calc(var(--cin-pan-x, 0%) * -0.5), calc(var(--cin-pan-y, 0%) * -0.5))"
        : rawMode === "dolly"
          ? "translateX(calc(var(--cin-dolly-dist, 8%) * -1 * var(--cin-dolly-dir, 1))) translateY(calc(var(--cin-dolly-vert, 0%) * -1))"
          : rawMode === "dolly-zoom"
            ? "scale(var(--cin-dolly-zoom-from, 1))"
            : rawMode === "shake"
              ? "scale(1.06)"
              : rawMode === "zoom-hold"
                ? "scale(1)"
                : undefined;
    // dolly-zoom keyframes own `filter`; at t=0 the plate is the clean grade.
    if (rawMode === "dolly-zoom") style.filter = "var(--cin-grade-filter-clean)";
  }
  return { className, style };
}

/* ------------------------------------------------------------------ */
/*  parallax depth planes                                             */
/* ------------------------------------------------------------------ */

/** Tracks the pointer over the stage and writes --par-x / --par-y
 * (range -1..1) onto the root element so parallax layers can shift. Honors
 * reduced-motion (no vars set → layers stay centred). The values are written
 * as CSS custom properties directly to avoid a React re-render per frame. */
function useParallaxTracker(rootRef: React.RefObject<HTMLElement | null>, enabled: boolean, reducedMotion?: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (reducedMotion) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const el = rootRef.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        el.style.setProperty("--par-x", nx.toFixed(3));
        el.style.setProperty("--par-y", ny.toFixed(3));
        el.classList.add("parallax-active");
      });
    };
    const onLeave = () => {
      el.style.removeProperty("--par-x");
      el.style.removeProperty("--par-y");
      el.classList.remove("parallax-active");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [rootRef, enabled, reducedMotion]);
}

/** True when the currently-shown plate should parallax (scene plate, or an
 * insert-shot beat background carrying its own parallax settings). */
function hasParallax(c: CinematicSettings | undefined): boolean {
  return (c?.parallaxDepth ?? 0) > 0;
}


/** Extra mid-ground depth planes (window frames, fog banks, crowds) that
 * parallax between the plate and the foreground subject. Each plane shifts
 * against --par-x/--par-y by its own depth (far planes slow, near planes
 * fast). Only rendered when parallax depth is enabled on the cinematic. */
export function ParallaxMidLayers({
  cinematic,
  resolve,
}: {
  cinematic?: CinematicSettings;
  /** Studio-preview asset resolver; the game passes nothing. */
  resolve?: (v?: string) => string | undefined;
}) {
  const depth = cinematic?.parallaxDepth ?? 0;
  const layers = cinematic?.parallaxLayers ?? [];
  if (!(depth > 0) || !layers.length) return null;
  const r = resolve ?? ((v?: string) => v);
  const planeVars = (depth: number): React.CSSProperties =>
    ({ "--plane-shift": `${(6 + depth * 22).toFixed(1)}px` } as React.CSSProperties);
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      {layers.map((layer, i) => {
        const src = assetUrl(r(layer.image));
        if (!src) return null;
        if (src.startsWith("gradient:")) {
          return (
            <div
              key={i}
              className="parallax-mid absolute inset-0"
              style={{ ...planeVars(layer.depth), background: src.slice(9) }}
              aria-hidden
            />
          );
        }
        const scale = Math.max(0.05, layer.scale ?? 1);
        const fit = layer.fit ?? "cover";
        return (
          <div key={i} className="parallax-mid absolute inset-0" style={planeVars(layer.depth)} aria-hidden>
            <img
              src={src}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full"
              style={{
                objectFit: fit === "native" ? undefined : fit,
                transform: `scale(${scale})`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/** Parse a CSS background-position style anchor ("50% 20%", "center bottom",
 * "left top", etc.) into percentage coordinates on the foreground image. */
export function parseAnchor(v?: string): { ax: number; ay: number } {
  let ax = 50;
  let ay = 50;
  if (!v) return { ax, ay };
  let xSet = false;
  let ySet = false;
  for (const raw of v.trim().split(/\s+/).filter(Boolean)) {
    let val: number | null = null;
    const t = raw.toLowerCase();
    if (/%$/.test(t)) val = clamp(parseFloat(t) || 0, 0, 100);
    else if (t === "left") val = 0;
    else if (t === "right") val = 100;
    else if (t === "top") val = 0;
    else if (t === "bottom") val = 100;
    else if (t === "center" || t === "centre") val = 50;
    if (val === null) continue;
    if (t === "left" || t === "right") {
      ax = val;
      xSet = true;
    } else if (t === "top" || t === "bottom") {
      ay = val;
      ySet = true;
    } else if (t === "center" || t === "centre") {
      if (!xSet) {
        ax = val;
        xSet = true;
      } else if (!ySet) {
        ay = val;
        ySet = true;
      }
    } else if (!xSet) {
      ax = val;
      xSet = true;
    } else if (!ySet) {
      ay = val;
      ySet = true;
    }
  }
  return { ax, ay };
}

/** Size the foreground image's box for the chosen fit mode. The result is the
 * box dimensions in frame pixels BEFORE the scale/zoom transform — scale is
 * applied as a CSS transform around the anchor point so zooming never moves the
 * focused point. */
function computeForegroundBox(
  fit: "contain" | "cover" | "fill" | "native",
  frame: { w: number; h: number },
  nat: { w: number; h: number } | null
): { w: number; h: number } {
  if (!nat || !nat.w || !nat.h || !frame.w || !frame.h) return { w: 0, h: 0 };
  const nw = nat.w;
  const nh = nat.h;
  switch (fit) {
    case "cover": {
      const s = Math.max(frame.w / nw, frame.h / nh);
      return { w: nw * s, h: nh * s };
    }
    case "fill":
      return { w: frame.w, h: frame.h };
    case "native":
      return { w: nw, h: nh };
    case "contain":
    default: {
      const s = Math.min(frame.w / nw, frame.h / nh);
      return { w: nw * s, h: nh * s };
    }
  }
}

/** A transparent foreground overlay (the "vertigo anchor"). Rendered as a
 * sibling of the moving background layer — never inside it — so it stays
 * perfectly still while the camera shakes, dollies or dolly-zooms behind it.
 * The subject is sized by `foregroundFit`, pinned by `foregroundAnchor` at
 * `foregroundX/foregroundY`, scaled by `foregroundScale`, and (optionally)
 * zoomed toward the anchor with `foregroundZoom`. */
export function ForegroundLayer({
  cinematic,
  src,
  resolve,
}: {
  cinematic?: CinematicSettings;
  src?: string;
  /** optional resolver for compact `asset:<id>` references — Studio previews
   * pass their live media resolver; the game passes nothing (already resolved). */
  resolve?: (v?: string) => string | undefined;
}) {
  const r = resolve ?? ((v?: string) => v);
  const base = assetUrl(r(src ?? cinematic?.foregroundImage));
  const anim = cinematic?.foregroundAnimation;
  const rawFrames = anim?.frames?.length ? anim.frames : base ? [base] : [];
  const frames = rawFrames.map((f) => assetUrl(r(f))).filter((f): f is string => !!f);
  if (!frames.length) return null;
  const scale = Math.max(0.05, cinematic?.foregroundScale ?? 1);
  const fit = cinematic?.foregroundFit ?? "contain";
  const x = clamp(cinematic?.foregroundX ?? 50, 0, 100);
  const y = clamp(cinematic?.foregroundY ?? 50, 0, 100);
  const anchor = parseAnchor(cinematic?.foregroundAnchor);
  const zoom = cinematic?.foregroundZoom !== undefined && cinematic.foregroundZoom !== 1 ? cinematic.foregroundZoom : undefined;
  const zoomDur = Math.max(1, cinematic?.foregroundZoomDuration ?? 8);
  // z-[1]: above the scene/beat background (z-auto) but below a beat's
  // replacement background layer (z-2), so insert shots cover the anchor.
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      <ForegroundFrames
        frames={frames}
        fit={fit}
        scale={scale}
        x={x}
        y={y}
        anchor={anchor}
        rotation={cinematic?.foregroundRotation ?? 0}
        zoom={zoom}
        zoomDur={zoomDur}
        anim={anim}
        blendMode={cinematic?.foregroundBlendMode}
        layerOpacity={cinematic?.foregroundOpacity}
      />
    </div>
  );
}

/** ADDITIONAL foreground images (the stacked extras). Each is an independent
 * character/prop/frame placed on top of the plate (behind the primary
 * foreground subject). Sizing is frame-relative: the image sits in a box
 * anchored at (x, y), scaled by `scale` (fraction of the frame height), and —
 * when parallax depth is on — shifts with the pointer by its own `depth`. */
function ForegroundExtraImage({
  extra,
  resolve,
  motionName,
  scrollNameProp,
  cam,
}: {
  extra: ForegroundExtra;
  resolve?: (v?: string) => string | undefined;
  /** set when this extra has a motion path — the compiled animation name */
  motionName?: string;
  /** set when this extra scrolls — the compiled @keyframes name */
  scrollNameProp?: string;
  /** wide-stage camera pan in screen-%, for `worldX` layers */
  cam?: number;
}) {
  const r = resolve ?? ((v?: string) => v);
  const src = assetUrl(r(extra.image));
  if (!src && !sheetDrawable(extra.sheet)) return null;
  // WORLD-PINNED SCENERY. On a wide stage, `worldX` places the prop in the
  // ROOM (0..worldWidth) and it pans with the camera; plain `x` is a
  // viewport position and stays put. Screen-% = worldX - cam.
  const x =
    extra.worldX !== undefined && cam !== undefined
      ? extra.worldX - cam
      : clamp(extra.x ?? 50, 0, 100);
  const y = clamp(extra.y ?? 50, 0, 100);
  const scale = Math.max(0.05, extra.scale ?? 1);
  const fit = extra.fit ?? "contain";
  const { ax, ay } = parseAnchor(extra.anchor ?? "50% 100%");
  const zoom = extra.zoom !== undefined && extra.zoom !== 1 ? extra.zoom : undefined;
  const zoomDur = Math.max(1, extra.zoomDuration ?? 8);
  // Anchor-position box, translated by its anchor point.
  // Box: fit modes fill the frame (subject spans the whole plate);
  // "contain"/"native" sit in a height-fractioned box that hugs the image
  // ratio, so e.g. a character at scale 0.8 occupies 80% of frame height.
  const boxStyle: React.CSSProperties = {
    left: `${x}%`,
    top: `${y}%`,
    opacity: clamp(extra.opacity ?? 1, 0, 1),
    mixBlendMode: extra.blendMode ?? "normal",
    width: fit === "cover" || fit === "fill" || extra.scroll ? "100%" : "auto",
    height: fit === "cover" || fit === "fill" ? "100%" : `${(scale * 100).toFixed(1)}%`,
    aspectRatio: fit === "cover" || fit === "fill" ? undefined : "auto",
    transform: `translate(${(-ax).toFixed(2)}%, ${(-ay).toFixed(2)}%) rotate(${extra.rotation ?? 0}deg)`,
    transformOrigin: `${ax}% ${ay}%`,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  };
  const flipScale = extra.flip ? -1 : 1;
  // Motion + idle preset. The path animates the BOX (left/top/transform), so
  // it carries the anchor translate through CSS variables; the preset animates
  // a WRAPPER around the art, so its transforms never fight the box's.
  const moving = motionName && motionAnimatable(extra.motion) ? motionAnimationSafe(extra.motion, motionName, { reducedMotion: prefersReducedMotionPure() }) : null;
  if (moving) {
    Object.assign(boxStyle, moving, {
      "--ex-ax": `${(-ax).toFixed(2)}%`,
      "--ex-ay": `${(-ay).toFixed(2)}%`,
    } as React.CSSProperties);
  }
  const preset = presetStyle(extra.anim, { reducedMotion: prefersReducedMotionPure() });
  // ALPHA MASK — clips the whole layer (art, scroll and all) to another
  // image's transparency, so a cut-out shape becomes a window it shows
  // through. Applied on the BOX, so it survives fit/scale/zoom changes.
  const maskStyle = layerMaskStyle(extra, r);
  Object.assign(boxStyle, maskStyle);
  const innerStyle: React.CSSProperties = {
    height: "100%",
    ...(fit === "cover" || fit === "fill" ? { width: "100%" } : {}),
    ...(preset.className ? { display: "flex", alignItems: "flex-end", justifyContent: "center" } : {}),
    ...(preset.vars as React.CSSProperties),
  };
  /** Wrap the art so a preset can transform it without disturbing placement. */
  const withPreset = (child: React.ReactNode) =>
    preset.className ? (
      <div className={`${preset.className}`} style={innerStyle} aria-hidden>
        {child}
      </div>
    ) : (
      child
    );
  // An animated extra: the sprite sheet replaces the static image entirely.
  if (sheetDrawable(extra.sheet)) {
    return (
      <div className="pointer-events-none absolute" style={boxStyle} aria-hidden>
        {withPreset(
          <SheetSprite
          sheet={extra.sheet}
          anim="loop"
          resolve={r}
          height="100%"
          className={zoom ? "fg-zoom" : ""}
          style={{
            transformOrigin: `${ax}% ${ay}%`,
            transform: zoom ? undefined : `scaleX(${flipScale})`,
            ...(zoom
              ? ({
                  "--fg-base": String(flipScale),
                  "--fg-zoom": String(zoom),
                  "--fg-zoom-dur": `${zoomDur}s`,
                } as React.CSSProperties)
              : {}),
          }}
          />
        )}
      </div>
    );
  }
  if (!src) return null;
  if (src.startsWith("gradient:")) {
    return <div className="pointer-events-none absolute" style={{ ...boxStyle, background: src.slice(9) }} aria-hidden />;
  }
  // SCROLLING LAYER — the art becomes a repeating background that crawls
  // endlessly, so rain slides down a window or a skyline passes under a
  // hovering car. Combined with `maskImage` this is the cockpit shot: the
  // city only shows through the windscreen cut-out.
  if (extra.scroll && scrollNameProp) {
    return (
      <div className="pointer-events-none absolute" style={boxStyle} aria-hidden>
        {withPreset(
          <ScrollingLayer src={src} scroll={extra.scroll!} name={scrollNameProp} fit={fit} flip={!!extra.flip} />
        )}
      </div>
    );
  }
  return (
    <div className="pointer-events-none absolute" style={boxStyle} aria-hidden>
      {withPreset(
        <img
          src={src}
          alt=""
          draggable={false}
          className={`select-none ${
            fit === "cover"
              ? "h-full w-full object-cover"
              : fit === "fill"
                ? "h-full w-full"
                : "h-auto w-auto max-h-full max-w-full object-contain"
          } ${zoom ? "fg-zoom" : ""}`}
          style={{
            transformOrigin: `${ax}% ${ay}%`,
            transform: zoom ? undefined : `scaleX(${flipScale})`,
            height: fit === "cover" || fit === "fill" ? "100%" : undefined,
            width: fit === "cover" || fit === "fill" ? "100%" : undefined,
            ...(zoom
              ? ({
                  "--fg-base": String(flipScale),
                  "--fg-zoom": String(zoom),
                  "--fg-zoom-dur": `${zoomDur}s`,
                } as React.CSSProperties)
              : {}),
          }}
        />
      )}
    </div>
  );
}

/** The CSS animation-name an extra's motion path is compiled under. */
const motionName = (index: number) => `sr-motion-${index}`;

/** The CSS animation-name an extra's endless scroll is compiled under. */
const scrollName = (index: number) => `sr-scroll-${index}`;

/** ALPHA-MASK CSS for a foreground layer. The mask image's ALPHA is what
 *  counts (luminance is ignored), it is scaled to the layer's box per
 *  `maskFit`, and `maskInvert` swaps which part shows. Returns an empty
 *  object when the layer isn't masked, so callers can spread it blindly.
 *  This is what lets a scrolling cityscape appear ONLY inside a cockpit
 *  windscreen: the dashboard cut-out is the mask, the city is the layer. */
function layerMaskStyle(
  extra: ForegroundExtra,
  resolve: (v?: string) => string | undefined
): React.CSSProperties {
  if (!extra.maskImage) return {};
  const mask = assetUrl(resolve(extra.maskImage));
  if (!mask) return {};
  const fit = extra.maskFit ?? "cover";
  const size = fit === "contain" ? "contain" : fit === "fill" ? "100% 100%" : "cover";
  const image = mask.startsWith("gradient:")
    ? mask.slice(9)
    : `url("${mask.replace(/"/g, "%22")}")`;
  // `mask-mode: alpha` is what makes a cut-out PNG work as a window: only
  // its transparency counts, its colours are ignored.
  const base = {
    maskMode: "alpha",
    WebkitMaskMode: "alpha",
  } as React.CSSProperties;
  if (!extra.maskInvert) {
    return {
      ...base,
      maskImage: image,
      WebkitMaskImage: image,
      maskSize: size,
      WebkitMaskSize: size,
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
      maskPosition: "center",
      WebkitMaskPosition: "center",
    };
  }
  // INVERTED — show what the alpha would HIDE. CSS has no "invert this mask"
  // flag, so the mask is stacked against a fully opaque layer and combined
  // with EXCLUDE (xor on the webkit prefix): a pixel shows where exactly one
  // of the two is opaque, which is the complement of the cut-out. Saves the
  // author from exporting a second plate when the one they have is the wrong
  // way round for the shot.
  return {
    ...base,
    maskImage: `${image}, linear-gradient(#000, #000)`,
    WebkitMaskImage: `${image}, linear-gradient(#000, #000)`,
    maskSize: `${size}, 100% 100%`,
    WebkitMaskSize: `${size}, 100% 100%`,
    maskRepeat: "no-repeat, no-repeat",
    WebkitMaskRepeat: "no-repeat, no-repeat",
    maskPosition: "center, center",
    WebkitMaskPosition: "center, center",
    maskComposite: "exclude",
    WebkitMaskComposite: "xor",
  } as React.CSSProperties;
}

/** The stack of additional foreground images for a cinematic. Renders in the
 * SAME parallax-fg wrapper as the primary foreground; each extra independently
 * shifts by its depth when parallax is on.

 * A sprite can also MOVE: `extra.motion` flies it along a polyline (sampled
 * into @keyframes — no JS runs per frame) and `extra.anim` gives it looping
 * idle motion (bob / sway / flicker / flutter…) from CSS alone. See
 * src/game/animation.ts. */
export function ForegroundExtras({
  cinematic,
  resolve,
  skip,
  only,
  cam,
}: {
  cinematic?: CinematicSettings;
  resolve?: (v?: string) => string | undefined;
  /** Indices to omit from this pass (they are being drawn in front instead). */
  skip?: Set<number>;
  /** When set, draw ONLY these indices (the walk-behind pass). */
  only?: Set<number>;
  /** wide-stage camera pan in screen-%, for `worldX` layers */
  cam?: number;
}) {
  const extras = cinematic?.foregroundExtras ?? [];
  // Motion paths compile to real @keyframes, one per animated extra, emitted
  // once per scene. The animationName the sprite references is derived from
  // its index, so the rule and the element can never drift apart.
  const motionCss = extras
    .map((e, i) => (motionAnimatable(e.motion) ? motionKeyframes(motionName(i), e.motion) : ""))
    .map((css, i) =>
      scrollAnimatable(extras[i].scroll)
        ? `${css ? css + "\n" : ""}${scrollKeyframes(scrollName(i), extras[i].scroll!)}`
        : css
    )
    .filter(Boolean)
    .join("\n");
  const wanted = extras
    .map((_e, i) => i)
    .filter((i) => extras[i].visible !== false)
    .filter((i) => (only ? only.has(i) : true) && !(skip && !only ? skip.has(i) : false));
  if (!extras.length || !wanted.length) return null;
  // When parallax is on, each extra wraps in a parallax-mid plane so it
  // shifts by its own depth; otherwise it renders as a plain layer.
  const parallaxOn = (cinematic?.parallaxDepth ?? 0) > 0;
  return (
    <>
      {motionCss ? <style>{motionCss}</style> : null}
      {wanted.map((i) => {
        const e = extras[i];
        const el = (
          <ForegroundExtraImage
            key={i}
            extra={e}
            resolve={resolve}
            {...(cam !== undefined ? { cam } : {})}
            {...(motionAnimatable(e.motion) ? { motionName: motionName(i) } : {})}
            {...(e.scroll ? { scrollNameProp: scrollName(i) } : {})}
          />
        );
        if (!parallaxOn || (e.depth ?? 0) <= 0) return el;
        return (
          <div
            key={`par-${i}`}
            className="parallax-mid pointer-events-none absolute inset-0"
            style={{ "--plane-shift": `${(4 + (e.depth ?? 0.5) * 26).toFixed(1)}px` } as React.CSSProperties}
          >
            {el}
          </div>
        );
      })}
    </>
  );
}

/** Stacks every animation keyframe and cycles through them. Frames swap hard
 * (opacity 1/0 with no transition) in "frames" mode, or cross-fade over
 * `fadeDuration` in "dissolve" mode — the Ace Attorney / Hotel Dusk limited
 * animation look vs. a smooth pose dissolve. Every frame shares one sized,
 * anchored box, so the pose never drifts between keyframes. */
function ForegroundFrames({
  frames,
  fit,
  scale,
  x,
  y,
  anchor,
  rotation,
  zoom,
  zoomDur,
  anim,
  blendMode,
  layerOpacity,
}: {
  frames: string[];
  fit: "contain" | "cover" | "fill" | "native";
  scale: number;
  x: number;
  y: number;
  anchor: { ax: number; ay: number };
  rotation: number;
  zoom?: number;
  zoomDur: number;
  anim?: ForegroundAnimation;
  blendMode?: CinematicSettings["foregroundBlendMode"];
  layerOpacity?: number;
}) {
  const [index, setIndex] = useState(0);
  const idxRef = useRef(0);
  const total = frames.length;
  const hold = Math.max(0.05, anim?.frameDuration ?? 0.2);
  const fade = anim?.mode === "dissolve" ? Math.max(0, anim?.fadeDuration ?? hold) : 0;
  const period = Math.max(0.05, hold + fade);
  const loops = anim?.loops;

  // Measure the frame and the image's natural size so the fit box can be
  // computed. The box is shared by all keyframes (assumed to be the same sprite
  // sheet / canvas, so a single natural size drives the layout).
  const frameRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    // Only publish real changes. Writing identical numbers still schedules a
    // React commit, and a commit that touches the observed element re-enters
    // the observer — which is what makes Chrome report "ResizeObserver loop
    // completed with undelivered notifications".
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setFrame((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };
    update();
    if (typeof ResizeObserver !== "undefined") {
      // Defer to the next frame so the callback never writes layout during
      // the browser's own observation pass.
      let raf = 0;
      const ro = new ResizeObserver(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(update);
      });
      ro.observe(el);
      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
      };
    }
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const onLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setNat((n) => n ?? { w: img.naturalWidth, h: img.naturalHeight });
    }
  }, []);

  const frameKey = frames.join("\u0000");
  // Restart the cycle whenever the sequence or timing changes.
  useEffect(() => {
    idxRef.current = 0;
    setIndex(0);
  }, [frameKey, anim?.mode, hold, fade, loops]);

  useEffect(() => {
    if (total <= 1) return;
    let cancelled = false;
    let timer: number | null = null;
    let completed = 0;
    const step = () => {
      if (cancelled) return;
      timer = window.setTimeout(() => {
        if (cancelled) return;
        const next = idxRef.current + 1;
        if (next < total) {
          idxRef.current = next;
          setIndex(next);
          step();
          return;
        }
        completed += 1;
        // Finite loop count: after the last pass, hold on the final frame.
        if (loops !== undefined && loops > 0 && completed >= loops) return;
        idxRef.current = 0;
        setIndex(0);
        step();
      }, period * 1000);
    };
    step();
    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [total, period, loops]);

  const box = computeForegroundBox(fit, frame, nat);
  const zoomOn = !!zoom;
  // Key each frame on the zoom + duration so the CSS zoom animation restarts
  // whenever the value changes (pushing in or pulling out). Without this the
  // foreground only ever animates once, so a value change in the preview never
  // re-renders the pull-out end state.
  const zoomKey = `${zoom ?? 1}-${zoomDur}`;
  // Always set a base transform so the element rests at scale(scale). When a
  // zoom is active the .fg-zoom animation overrides transform (forwards fill),
  // and this guarantees the *un-animated* / reduced-motion state is correct for
  // both push-in and pull-out (scale below the base).
  const restingTransform = `scale(${scale}) rotate(${rotation}deg)`;

  return (
    <div ref={frameRef} className="absolute inset-0">
      {frames.map((f, i) => (
        <div
          key={`${i}-${f.slice(-24)}-${zoomKey}`}
          data-fg-anchor-box="1"
          className="absolute"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: box.w ? `${box.w}px` : 0,
            height: box.h ? `${box.h}px` : 0,
            // translate by the anchor so the anchor point lands on (x, y).
            transform: `translate(${(-anchor.ax).toFixed(2)}%, ${(-anchor.ay).toFixed(2)}%)`,
            // Blend/opacity live on the BOX, not the <img>: the img already
            // owns opacity for the cross-dissolve between frames, so setting
            // them here keeps the two from fighting.
            mixBlendMode: blendMode ?? "normal",
            opacity: layerOpacity ?? 1,
          }}
        >
          <img
            src={f}
            alt=""
            draggable={false}
            decoding="async"
            onLoad={onLoad}
            data-fg-img="1"
            className={`absolute inset-0 select-none ${zoomOn ? "fg-zoom" : ""}`}
            style={{
              width: "100%",
              height: "100%",
              maxWidth: "none",
              transformOrigin: `${anchor.ax}% ${anchor.ay}%`,
              transform: restingTransform,
              opacity: i === index ? 1 : 0,
              transition: fade > 0 ? `opacity ${fade}s ease` : undefined,
              ...(zoomOn
                ? ({
                    "--fg-base": String(scale),
                    "--fg-zoom": String(zoom),
                    "--fg-zoom-dur": `${zoomDur}s`,
                  } as React.CSSProperties)
                : {}),
            }}
          />
        </div>
      ))}
    </div>
  );
}

/** Renders every animated light glow for a cinematic as stacked screen-blend
 * layers. Lives inside the transformed background container so glows stay
 * anchored to the image while the camera pans or zooms. */
/** A character on the scene floor. When `animate` is true it cycles the talking
 *  keyframes (the VN/Ace-Attorney animated-while-talking look); otherwise it
 *  shows the resting pose (or the first frame). `flip` mirrors them so two
 *  speakers can face each other, `y` lifts them off the floor, and `dim`
 *  fades non-active speakers back. z-[6] sits above the beat background but
 *  below the hotspots and dialogue panel, so the text box overlaps the lower
 *  edge the way a dialogue box sits in front of a standing character. */
function StageSprite({
  frames,
  rest,
  sheet,
  animate,
  frameDuration,
  x,
  y,
  scale,
  flip,
  dim,
  dimOpacity,
}: {
  frames: string[];
  rest?: string;
  sheet?: SpriteSheet;
  animate: boolean;
  frameDuration: number;
  x: number;
  y: number;
  scale: number;
  flip: boolean;
  dim: boolean;
  /** opacity while another character speaks (default 0.72) */
  dimOpacity?: number;
}) {
  const useSheet = sheetDrawable(sheet);
  const cycle = !useSheet && animate && frames.length > 1;
  const [i, setI] = useState(0);
  const frameKey = frames.join("\u0000");
  useEffect(() => {
    setI(0);
  }, [frameKey]);
  useEffect(() => {
    if (!cycle) return;
    const hold = Math.max(0.04, frameDuration) * 1000;
    let cancelled = false;
    let timer: number | null = null;
    const step = () => {
      timer = window.setTimeout(() => {
        if (cancelled) return;
        setI((v) => (v + 1) % frames.length);
        step();
      }, hold);
    };
    step();
    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [cycle, frames.length, frameDuration]);
  const shown = cycle ? frames[i] : rest ?? frames[0];
  if (!useSheet && !shown) return null;
  const heightPct = Math.min(96, Math.max(20, 72 * Math.max(0.2, scale)));
  return (
    <div
      className="talking-sprite pointer-events-none absolute z-[6]"
      style={{
        left: `${x}%`,
        bottom: `${y}%`,
        transform: `translateX(-50%)${flip ? " scaleX(-1)" : ""}`,
        height: `${heightPct}%`,
        opacity: dim ? Math.min(1, Math.max(0.2, dimOpacity ?? 0.72)) : 1,
        transition: "opacity .3s ease",
      }}
    >
      {useSheet ? (
        <SheetSprite
          sheet={sheet!}
          anim={animate ? "talk" : "rest"}
          fallbacks={animate ? ["rest", "idle"] : ["idle", "talk"]}
          height="100%"
          freezeOnFallback={!animate}
        />
      ) : (
        <img src={assetUrl(shown)} alt="" className="h-full w-auto max-w-none object-contain" />
      )}
    </div>
  );
}

function LightGlow({ cinematic }: { cinematic?: CinematicSettings }) {
  const lights = resolveLights(cinematic);
  if (!lights.length) return null;
  return (
    <>
      {lights.map((l, i) => (
        <div key={i} className="cin-light" style={lightStyle(l)} />
      ))}
    </>
  );
}

function SingleLensFlare({ flare }: { flare: ResolvedLensFlare }) {
  const ghosts = useMemo(() => calculateGhostElements(flare), [flare]);
  const style = useMemo(() => lensFlareStyle(flare), [flare]);

  const starburstRaysCount = flare.starburstRays;
  const rayAngles = useMemo(() => {
    const half = Math.max(2, Math.floor(starburstRaysCount / 2));
    const step = 180 / half;
    const angles: number[] = [];
    for (let i = 0; i < half; i++) {
      angles.push(i * step);
    }
    return angles;
  }, [starburstRaysCount]);

  return (
    <div className="cin-lensflare-container" style={style}>
      {/* 1. Anamorphic Horizontal Streak Beam */}
      {flare.streakIntensity > 0 && (
        <div className="cin-flare-streak-container">
          <div className="cin-flare-laser" />
          <div className="cin-flare-streak-wide" />
          <div className="cin-flare-streak-diffuse" />
        </div>
      )}

      {/* 2. Starburst / Diffraction Spikes */}
      {flare.starburstIntensity > 0 && (
        <div className="cin-flare-starburst-group">
          {rayAngles.map((angle, i) => (
            <div
              key={i}
              className="cin-flare-ray"
              style={{ "--ray-rot": `${angle}deg` } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* 3. Central Core & Corona Halo */}
      <div className="cin-flare-core-group">
        <div className="cin-flare-corona" />
        <div className="cin-flare-core" />
      </div>

      {/* 4. Optical Ghost Reflections Chain */}
      {flare.ghostIntensity > 0 &&
        ghosts.map((g) => {
          if (g.opacity <= 0.01) return null;
          const ghostStyle: React.CSSProperties = {
            left: `${g.x}%`,
            top: `${g.y}%`,
            width: `${g.size}vw`,
            height: `${g.size}vw`,
            maxWidth: `${g.size * 12}px`,
            maxHeight: `${g.size * 12}px`,
            opacity: g.opacity,
          };

          if (g.type === "halo-rainbow") {
            return (
              <div
                key={g.id}
                className="cin-flare-ghost-element cin-flare-halo-rainbow"
                style={ghostStyle}
              />
            );
          }

          if (g.type === "aperture") {
            return (
              <div
                key={g.id}
                className="cin-flare-ghost-element cin-flare-aperture-shape"
                style={{
                  ...ghostStyle,
                  transform: `translate(-50%, -50%) rotate(${g.rotateDeg ?? 0}deg)`,
                  background: `radial-gradient(circle at center, transparent 30%, ${g.color === "rainbow" ? flare.color : g.color} 100%)`,
                  border: `1.5px solid ${g.color === "rainbow" ? flare.color : g.color}`,
                  boxShadow: `inset 0 0 8px ${g.color === "rainbow" ? flare.color : g.color}`,
                }}
              />
            );
          }

          if (g.type === "ring" || g.type === "ring-thin") {
            return (
              <div
                key={g.id}
                className="cin-flare-ghost-element rounded-full"
                style={{
                  ...ghostStyle,
                  border: `${g.type === "ring" ? 1.5 : 1}px solid ${g.color}`,
                  boxShadow: g.type === "ring" ? `0 0 6px ${g.color}, inset 0 0 6px ${g.color}` : undefined,
                  background: `radial-gradient(circle at center, transparent 70%, ${g.color}33 90%)`,
                }}
              />
            );
          }

          if (g.type === "star-pin") {
            return (
              <div
                key={g.id}
                className="cin-flare-ghost-element flex items-center justify-center"
                style={{
                  ...ghostStyle,
                  width: `${g.size * 0.8}vw`,
                  height: `${g.size * 0.8}vw`,
                }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: "100%",
                    height: "100%",
                    background: `radial-gradient(circle at center, #ffffff 0%, ${g.color} 60%, transparent 85%)`,
                    boxShadow: `0 0 10px #ffffff, 0 0 18px ${g.color}`,
                  }}
                />
              </div>
            );
          }

          if (g.type === "disc-soft" || g.type === "disc-wide") {
            return (
              <div
                key={g.id}
                className="cin-flare-ghost-element rounded-full"
                style={{
                  ...ghostStyle,
                  background: `radial-gradient(circle at center, ${g.color} 0%, transparent 70%)`,
                  filter: `blur(${g.type === "disc-wide" ? 6 : 3}px)`,
                }}
              />
            );
          }

          // Standard disc
          return (
            <div
              key={g.id}
              className="cin-flare-ghost-element rounded-full"
              style={{
                ...ghostStyle,
                background: `radial-gradient(circle at center, ${g.color} 0%, ${g.color}66 45%, transparent 75%)`,
                boxShadow: `0 0 12px ${g.color}44`,
              }}
            />
          );
        })}
    </div>
  );
}

export function LensFlareLayer({
  cinematic,
  flareOverride,
}: {
  cinematic?: CinematicSettings;
  flareOverride?: ResolvedLensFlare | null;
}) {
  const flares = useMemo(() => {
    if (flareOverride) return [flareOverride];
    return resolveLensFlares(cinematic);
  }, [cinematic, flareOverride]);

  if (!flares.length) return null;

  return (
    <>
      {flares.map((f, i) => (
        <SingleLensFlare key={i} flare={f} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  focus trap modal                                                   */
/* ------------------------------------------------------------------ */

/** Scrollable transcript of the run. Auto-scrolls to the newest line so
 * opening the log mid-scene lands you on what was just said. */
function DialogueLogView({ lines }: { lines: { speaker: string; text: string }[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines.length]);
  return (
    <div className="max-h-[56vh] space-y-2 overflow-y-auto border border-noir-600 bg-noir-950/70 p-3">
      {lines.map((l, i) => (
        <div key={i} className="font-type text-xs leading-relaxed">
          {l.speaker ? (
            <span className="mr-2 font-pulp text-[10px] uppercase tracking-widest text-gold">{l.speaker}</span>
          ) : (
            <span className="mr-2 font-pulp text-[10px] uppercase tracking-widest text-paper/35">scene</span>
          )}
          <span className="text-paper/80">{l.text}</span>
        </div>
      ))}
      {!lines.length && <p className="font-type text-xs text-paper/40">Nothing spoken yet.</p>}
      <div ref={endRef} />
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <DialogFrame label={title} onDismiss={onClose} onKeyDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className={`pop-in relative flex max-h-[90dvh] flex-col border-2 border-gold/60 bg-noir-800 shadow-[0_0_60px_rgba(232,178,60,0.15)] ${
          wide ? "w-full max-w-4xl" : "w-full max-w-md"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gold/30 px-4 py-2">
          <h3 className="font-pulp text-gold tracking-wide text-sm uppercase">{title}</h3>
          <button
            onClick={onClose}
            className="text-paper/60 hover:text-neon text-lg leading-none px-2"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto p-4">{children}</div>
      </DialogFrame>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  typewriter                                                         */
/* ------------------------------------------------------------------ */

function Typewriter({
  text,
  speed,
  onDone,
  className,
  forceComplete,
}: {
  text: string;
  speed: number;
  onDone?: () => void;
  className?: string;
  forceComplete?: boolean;
}) {
  const [n, setN] = useState(0);
  const doneFired = useRef(false);
  useEffect(() => {
    setN(0);
    doneFired.current = false;
  }, [text]);
  useEffect(() => {
    if (forceComplete) setN(text.length);
  }, [forceComplete, text]);
  useEffect(() => {
    if (n >= text.length) {
      if (!doneFired.current) {
        doneFired.current = true;
        onDone?.();
      }
      return;
    }
    const t = window.setTimeout(() => {
      setN((v) => v + 1);
      if (n % 3 === 0) audio.tick();
    }, speed);
    return () => window.clearTimeout(t);
  }, [n, text, speed, onDone]);
  const done = n >= text.length;
  return (
    <span
      className={`${className ?? ""} ${done ? "" : "typewriter-caret"} cursor-pointer`}
      onClick={() => {
        if (!done) setN(text.length);
      }}
    >
      {text.slice(0, n)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  credits intro                                                      */
/* ------------------------------------------------------------------ */

/** Title-sequence typefaces. Each value is a CSS font stack backed by a web
 * font loaded in index.html. */
const CREDITS_FONTS: Record<string, string> = {
  pulp: "var(--font-pulp)",
  poster: "var(--font-poster)",
  elegant: "var(--font-elegant)",
  epic: "var(--font-epic)",
  modern: "var(--font-modern)",
  type: "var(--font-type)",
};

/** Per-face tracking. A condensed poster face wants air; a heavy slab does not. */
const CREDITS_TRACKING: Record<string, { title: string; line: string }> = {
  pulp: { title: "0.06em", line: "0.24em" },
  poster: { title: "0.14em", line: "0.34em" },
  elegant: { title: "0.04em", line: "0.26em" },
  epic: { title: "0.12em", line: "0.3em" },
  modern: { title: "0.2em", line: "0.36em" },
  type: { title: "0.08em", line: "0.26em" },
};

/* resolveCredits / creditsRollSeconds / the timing clamps live in
 * src/credits.ts: the renderer and the scene pacing both read the same
 * numbers, so a roll can never be timed by something other than itself. */

/** A cross-dissolving montage of full-bleed stills, used as the backdrop to a
 * title sequence. Every still is mounted and stacked; only the active one is
 * opaque, so the browser cross-fades between them instead of hard-cutting.
 * Each layer carries a slow Ken Burns drift so the frame is never static. */
export function CreditsMontage({
  images,
  seconds = 5,
  loop = true,
  transition = "dissolve",
  looks,
  reducedMotion,
}: {
  images: string[];
  seconds?: number;
  loop?: boolean;
  /** dissolve = long cross-fade; cut = hard cut, still to still (the
   * Tarantino title-sequence bang). */
  transition?: "dissolve" | "cut";
  /** a still's camera by its url: one with a depth map moves with the depth camera instead of the slow zoom */
  looks?: Record<string, CinematicSettings>;
  reducedMotion?: boolean;
}) {
  const [idx, setIdx] = useState(0);
  // the still before the one on screen (it is still dissolving out), and how many times each still has come up, so its
  // depth move starts again each time round
  const [prev, setPrev] = useState(-1);
  const [round, setRound] = useState(0);
  const hold = Math.max(1.5, seconds) * 1000;

  useEffect(() => {
    if (images.length <= 1) return;
    const t = window.setInterval(() => {
      setIdx((i) => {
        const next = i + 1 < images.length ? i + 1 : loop ? 0 : i; // hold on the last frame when not looping
        if (next !== i) {
          setPrev(i);
          setRound((r) => r + 1);
        }
        return next;
      });
    }, hold);
    return () => window.clearInterval(t);
  }, [images.length, hold, loop]);

  if (!images.length) return null;

  return (
    <div className="absolute inset-0 overflow-hidden bg-black" aria-hidden>
      {images.map((img, i) => {
        const look = looks?.[img];
        const depth = !!look?.depthMap && !reducedMotion;
        return (
          <div
            key={`${img}-${i}`}
            className={`absolute inset-0 ${depth ? "" : i % 2 === 0 ? "kenburns-a" : "kenburns-b"}`}
            style={{
              ...plateStyle(img),
              opacity: i === idx ? 1 : 0,
              // Long dissolve — half the hold, capped so it always completes.
              // A hard cut swaps instantly: no dissolve, the plate just bangs in.
              transition:
                transition === "cut"
                  ? "none"
                  : `opacity ${Math.min(2.2, Math.max(1.5, seconds) / 2)}s ease-in-out`,
            }}
          >
            {/* the depth camera on the still on screen (and the one dissolving out), its move fitted to the hold */}
            {depth && (i === idx || i === prev) && (
              <DepthParallaxLayer
                // the same layer while the still is on and while it dissolves out, so its move never restarts mid-fade
                key={`d-${i === idx ? round : round - 1}`}
                cinematic={{ ...look, depthSeconds: Math.min(look.depthSeconds ?? 14, hold / 1000 + 2) }}
                picture={img}
              />
            )}
          </div>
        );
      })}
      {/* Keeps white credit type legible over a bright neon still. */}
      <div className="absolute inset-0 bg-black/45" />
    </div>
  );
}

/** A film-style intro for `credits` nodes: kicker, big title, subtitle, a thin
 * divider, then a list of role/name credits. The title can type or fade up; the
 * list can stagger in place, roll as scrolling credits, or present as sequential
 * fade-in/fade-out cards over a montage. */
function Credits({
  prose,
  settings,
  onDone,
}: {
  prose: string;
  settings?: CreditsSettings;
  onDone: () => void;
}) {
  const { title, subtitle, lines } = useMemo(() => resolveCredits(prose, settings), [prose, settings]);
  const titleEntrance = settings?.titleEntrance ?? "fade-up";
  const style = settings?.style ?? "fade-up";
  // One set of clamps, shared with creditsRollSeconds() in src/credits.ts.
  const { stagger, duration, scrollDuration: scrollDur, cardSeconds } = creditsTiming(settings);
  const accent = settings?.accentColor ?? "#2ad9d9";
  // A custom title colour swaps the neon gold for the author's pick and re-tints
  // the glow to match, so a yellow title-card doesn't sit in a gold haze.
  const titleColor = settings?.titleColor;
  const titleStyle = (slamDelay?: number): React.CSSProperties =>
    titleColor
      ? {
          color: titleColor,
          textShadow: `0 0 12px ${titleColor}55, 0 0 44px ${titleColor}33`,
          ...(slamDelay !== undefined ? { animationDelay: `${slamDelay}s` } : {}),
        }
      : slamDelay !== undefined
        ? { animationDelay: `${slamDelay}s` }
        : {};
  const fontKey = settings?.font ?? "pulp";
  const fontFamily = CREDITS_FONTS[fontKey] ?? CREDITS_FONTS.pulp;
  const tracking = CREDITS_TRACKING[fontKey] ?? CREDITS_TRACKING.pulp;
  const cardMotion = settings?.cardMotion ?? "blur-rise";
  const gateWeave = settings?.gateWeave ?? "off";
  const [titleDone, setTitleDone] = useState(false);
  const showRest = titleEntrance !== "typewriter" || titleDone;
  const animated = style !== "scroll";

  // Keep a stable handle to onDone so re-renders don't reset the timer.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  /* --- "cards": a proper title sequence -----------------------------
   * One credit on screen at a time — fade in, hold, fade out, next. The
   * card list is [title, subtitle?, ...lines], so the image carries the
   * sequence and the type punctuates it. */
  const cards = useMemo(() => {
    const out: { role?: string; name: string; big?: boolean }[] = [{ name: title, big: true }];
    if (subtitle) out.push({ name: subtitle });
    lines.forEach((l) => out.push({ role: l.role, name: l.name }));
    return out;
  }, [title, subtitle, lines]);
  const [cardIdx, setCardIdx] = useState(0);

  useEffect(() => {
    if (style !== "cards") return;
    if (cardIdx >= cards.length) return;
    const t = window.setTimeout(() => setCardIdx((i) => i + 1), cardSeconds * 1000);
    return () => window.clearTimeout(t);
  }, [style, cardIdx, cards.length, cardSeconds]);

  useEffect(() => {
    if (style === "cards") {
      // Sequence is over once the last card has faded out.
      if (cardIdx >= cards.length) onDoneRef.current();
      return;
    }
    if (style === "scroll") {
      // The roll is a CSS animation running exactly --credits-scroll-dur, so
      // the sequence ends when the track does. (This used to fire after 700ms,
      // which cut every scrolling credits roll off after three-quarters of a
      // second and left the scene sitting on a moving card.)
      const t = window.setTimeout(() => onDoneRef.current(), scrollDur * 1000);
      return () => window.clearTimeout(t);
    }
    if (titleEntrance === "typewriter" && !titleDone) return;
    const lastDelay = (titleEntrance === "typewriter" ? lines.length : 2 + lines.length) * stagger;
    const t = window.setTimeout(() => onDoneRef.current(), lastDelay * 1000 + duration * 1000 + 450);
    return () => window.clearTimeout(t);
  }, [style, titleEntrance, titleDone, stagger, duration, scrollDur, lines.length, cardIdx, cards.length]);

  /* Wrap the whole title sequence in the gate. Three nested elements
   * because each one can only carry a single transform, and the point of
   * the effect is that the sway, the per-frame jitter and the splice bump
   * are independent mechanical errors that happen to stack. Nesting also
   * means the inner content is untouched — no layout, no reflow. */
  const inGate = (content: React.ReactNode) => {
    if (gateWeave === "off") return content;
    const inner = (
      <div className={`credits-gate credits-gate-${gateWeave}`}>
        <div className="credits-gate-jitter">{content}</div>
      </div>
    );
    // Only the tired projector throws splices.
    return gateWeave === "projector" ? (
      <div className="credits-gate-splice">{inner}</div>
    ) : (
      inner
    );
  };

  const rise = (delay: number): React.CSSProperties =>
    animated ? ({ animationDelay: `${delay}s` } as React.CSSProperties) : {};
  const riseCls = (_delay: number) => (animated ? "credits-rise" : "");

  const kicker = (
    <p className={`${riseCls(0)} font-type text-[10px] uppercase tracking-[0.6em] text-paper/50`} style={rise(0)}>
      Gaslight Reelworks presents
    </p>
  );
  const titleNode =
    titleEntrance === "typewriter" ? (
      <h1 className="credits-title mt-2 text-4xl uppercase leading-tight tracking-wide text-gold md:text-6xl" style={{ fontFamily }}>
        <Typewriter text={title} speed={CREDITS_TYPE_SPEED} onDone={() => setTitleDone(true)} className="text-gold" />
      </h1>
    ) : titleEntrance === "slam" ? (
      // The pulp main-title punch: lands oversized and snaps to size.
      <h1
        className={`credits-slam-title ${titleColor ? "" : "credits-title"} mt-2 text-4xl uppercase leading-tight tracking-wide md:text-6xl ${titleColor ? "" : "text-gold"}`}
        style={{ fontFamily, ...titleStyle(stagger) }}
      >
        {title}
      </h1>
    ) : (
      <h1 className={`${riseCls(stagger)} credits-title mt-2 text-4xl uppercase leading-tight tracking-wide text-gold md:text-6xl`} style={{ ...rise(stagger), fontFamily }}>
        {title}
      </h1>
    );
  const subtitleNode = subtitle ? (
    <p className={`${riseCls(titleEntrance === "typewriter" ? 0 : 2 * stagger)} font-type mt-4 text-sm uppercase tracking-[0.45em]`} style={{ ...rise(titleEntrance === "typewriter" ? 0 : 2 * stagger), color: accent }}>
      {subtitle}
    </p>
  ) : null;
  const ruleNode = (
    <div className={`${riseCls(titleEntrance === "typewriter" ? 0.5 * stagger : 2.5 * stagger)} credits-rule`} style={{ ...rise(titleEntrance === "typewriter" ? 0.5 * stagger : 2.5 * stagger), "--credits-accent": accent } as React.CSSProperties} />
  );
  const listNode = (
    <div className="flex flex-col items-center gap-5">
      {lines.map((line, i) => {
        const delay = (titleEntrance === "typewriter" ? 1 + i : 3 + i) * stagger;
        return (
          <div key={i} className={`${riseCls(delay)} flex flex-col items-center`} style={rise(delay)}>
            {line.role && <div className="credits-entry-role font-type" style={{ color: accent }}>{line.role}</div>}
            <div className="credits-entry-name text-paper" style={{ fontFamily }}>{line.name}</div>
          </div>
        );
      })}
    </div>
  );

  if (style === "cards") {
    const card = cards[cardIdx];
    // The main title has to be able to run near the full frame width — a heavy
    // slab face at display size is far wider than the panel's prose column, and
    // clamping it is what makes a title sequence wrap and fall apart. Long
    // titles step down a size rather than breaking.
    // Tiers are set against the widest face (Alfa Slab One, ~0.9em/char):
    // 16 chars ≈ 1060px at 7xl, which is the practical ceiling inside max-w-6xl.
    // Longer strings step down so a title never wraps mid-phrase.
    const titleLen = (card?.name ?? "").length;
    const titleSize =
      titleLen > 40
        ? "text-xl md:text-3xl"
        : titleLen > 28
          ? "text-2xl md:text-4xl"
          : titleLen > 16
            ? "text-3xl md:text-5xl"
            : "text-5xl md:text-7xl";
    return inGate(
      // Fixed height stops the montage jumping as cards of different sizes
      // swap in and out.
      <div className="flex min-h-[46vh] w-full flex-col items-center justify-center text-center">
        {card && (
          <div
            key={cardIdx}
            className={`credits-card credits-motion-${cardMotion} flex flex-col items-center`}
            style={
              {
                "--credits-card-dur": `${cardSeconds}s`,
                "--credits-track": card.big ? tracking.title : tracking.line,
              } as React.CSSProperties
            }
          >
            {card.role && (
              <div
                className="credits-card-line credits-entry-role"
                style={{ color: accent, fontFamily: CREDITS_FONTS.type }}
              >
                {card.role}
              </div>
            )}
            {card.big ? (
              <h1
                className={`credits-card-line ${titleColor ? "" : "credits-title"} ${titleSize} uppercase leading-[1.05] ${titleColor ? "" : "text-gold"}`}
                style={{ fontFamily, letterSpacing: tracking.title, ...titleStyle() }}
              >
                {card.name}
              </h1>
            ) : (
              // Supporting lines are short by nature; a long one (a subtitle,
              // say) wraps to a balanced second line rather than shrinking.
              <div
                className="credits-card-line max-w-4xl text-lg uppercase leading-snug text-paper md:text-2xl"
                style={{ fontFamily, letterSpacing: tracking.line, textWrap: "balance" } as React.CSSProperties}
              >
                {card.name}
              </div>
            )}
            {card.big && (
              <div className="credits-rule" style={{ "--credits-accent": accent } as React.CSSProperties} />
            )}
          </div>
        )}
      </div>
    );
  }

  if (style === "scroll") {
    return inGate(
      <div className="credits-scroll-viewport max-h-[60vh] w-full">
        <div className="credits-scroll-track flex flex-col items-center" style={{ "--credits-scroll-dur": `${scrollDur}s` } as React.CSSProperties}>
          {kicker}
          {titleNode}
          {subtitleNode}
          {ruleNode}
          <div className="mt-8">{listNode}</div>
        </div>
      </div>
    );
  }

  return inGate(
    <div className="flex flex-col items-center text-center" style={{ "--credits-dur": `${duration}s` } as React.CSSProperties}>
      {kicker}
      {titleNode}
      {showRest && subtitleNode}
      {showRest && ruleNode}
      {showRest && <div className="mt-6">{listNode}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  per-beat replacement background — now with dramatic transitions    */
/* ------------------------------------------------------------------ */

type BeatBackgroundTransition =
  | "cut"
  | "fade"
  | "crossfade"
  | "fade-black"
  | "slide-left"
  | "slide-right"
  | "iris-in"
  | "iris"
  | "wipe-left"
  | "wipe-right"
  | "wipe-up"
  | "wipe-down"
  | "zoom"
  | "glitch"
  | "burn";

interface BeatBgLayer {
  key: string;
  background: string;
  cinematic?: CinematicSettings;
  exiting: boolean;
}

/** Renders the current dialogue beat's replacement background and crossfades
 * between beats — the outgoing image stays mounted and fades out while the
 * incoming one animates in, so images transition beat-to-beat (not against the
 * scene default). When no beat has an image, the layers fade out to reveal the
 * scene background. */
function BeatBackground({
  beat,
  transitionName,
  transitionSpeed,
}: {
  beat: { id: string; background?: string; cinematic?: CinematicSettings } | null;
  transitionName: BeatBackgroundTransition;
  transitionSpeed: number;
}) {
  const [layers, setLayers] = useState<BeatBgLayer[]>([]);
  const activeBgRef = useRef<string | null>(null);
  const speed = Math.max(0.05, transitionSpeed);

  useEffect(() => {
    const bg = beat?.background;
    if (bg) {
      if (activeBgRef.current === bg) return; // same image already showing
      setLayers((prev) => {
        if (transitionName === "cut") {
          return [{ key: beat.id, background: bg, cinematic: beat.cinematic, exiting: false }];
        }
        return [
          ...prev.map((l) => ({ ...l, exiting: true })),
          { key: beat.id, background: bg, cinematic: beat.cinematic, exiting: false },
        ];
      });
      activeBgRef.current = bg;
    } else if (activeBgRef.current !== null) {
      // No replacement image: fade out whatever is showing (reveal scene bg).
      setLayers((prev) => prev.map((l) => ({ ...l, exiting: true })));
      activeBgRef.current = null;
    }
  }, [beat?.id, beat?.background, beat?.cinematic, transitionName]);

  // Prune layers whose exit animation has finished.
  useEffect(() => {
    if (!layers.some((l) => l.exiting)) return;
    const t = window.setTimeout(() => setLayers((prev) => prev.filter((l) => !l.exiting)), speed * 1000 + 120);
    return () => window.clearTimeout(t);
  }, [layers, speed]);

  if (!layers.length) return null;

  // A true dissolve: while a new picture comes in over it, the one going out stays solid underneath (it is removed once
  // the new one is in). Fading both at once let the scene's own picture, an earlier shot, show through mid-dissolve at a
  // quarter strength: a ghost of the previous shot. A dip to black goes through black for the same reason.
  const incoming = layers.some((l) => !l.exiting);
  const dissolving = incoming && layers.some((l) => l.exiting);
  return (
    <>
      {dissolving && transitionName === "fade-black" && <div className="absolute inset-0 z-[2] bg-black" />}
      {layers.map((l) => {
        const { className: cinClass, style: cinStyle } = cinematicLayer(l.cinematic, l.background.startsWith("video:") ? "" : l.background, { reducedMotion: prefersReducedMotionPure() });
        const animClass = l.exiting ? (incoming && transitionName !== "fade-black" ? "" : "beatbg-out") : `beatbg-in-${transitionName}`;
        const pOn = hasParallax(l.cinematic);
        return (
          <div
            key={l.key}
            className={`absolute inset-0 z-[2] ${animClass}`}
            style={{ "--beatbg-speed": `${speed}s` } as React.CSSProperties}
          >
            {l.background.startsWith("video:") ? (
              /* A beat may swap the picture for a clip (a lip-synced talking shot): it plays once, silent, and holds its last frame. */
              <video
                autoPlay
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 h-full w-full object-cover"
                style={spriteGradeStyle(l.cinematic)}
              >
                {/* Browsers without H.264 (some Chromium builds) fall through to a .webm beside the .mp4. */}
                <source src={assetBackground(l.background).slice(6)} />
                {/\.mp4(\?.*)?$/i.test(l.background) && <source src={assetBackground(l.background).slice(6).replace(/\.mp4/i, ".webm")} type="video/webm" />}
              </video>
            ) : (
            <div className={`absolute inset-0 ${pOn ? "parallax-plate" : ""}`} style={pOn ? parallaxStyle(l.cinematic) : undefined}>
              <div className={`absolute inset-0 ${cinClass}`} style={cinStyle}>
                <DepthParallaxLayer cinematic={l.cinematic} picture={l.background} reducedMotion={prefersReducedMotionPure()} />
                <LightGlow cinematic={l.cinematic} />
                <LensFlareLayer cinematic={l.cinematic} />
                <CinematicOverlays cinematic={l.cinematic} />
              </div>
            </div>
            )}
            {pOn && <ParallaxMidLayers cinematic={l.cinematic} />}
            <div className={`${pOn ? "parallax-fg " : ""}absolute inset-0`} style={spriteGradeStyle(l.cinematic)}>
              <ForegroundExtras cinematic={l.cinematic} />
              <ForegroundLayer cinematic={l.cinematic} />
            </div>
            {!l.exiting && transitionName === "fade-black" && (
              <div className="beatbg-black absolute inset-0 z-[3] bg-black" style={{ "--beatbg-speed": `${speed}s` } as React.CSSProperties} />
            )}
          </div>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  meters HUD                                                         */
/* ------------------------------------------------------------------ */

const METER_STYLE: Record<MeterKey, { bar: string; icon: string }> = {
  Sultry: { bar: "bg-neon", icon: "💋" },
  Aggressive: { bar: "bg-crimson", icon: "✊" },
  Clever: { bar: "bg-cyan-neon", icon: "🧠" },
  Suspicion: { bar: "bg-gold", icon: "🔥" },
};

const perkDefs: { key: keyof Perks; icon: string; name: string; desc: string; danger?: boolean }[] = [
  { key: "velvetTongue", icon: "💋", name: "Velvet Tongue", desc: "Charm 4+ · positive trust gains get +1" },
  { key: "ironNerve", icon: "✊", name: "Iron Nerve", desc: "Intimidate 4+ · hard-nosed choices stop costing Heat" },
  { key: "sharpEye", icon: "🧠", name: "Sharp Eye", desc: "Deduce 4+ · hotspots shimmer and bad board guesses stay quiet" },
  { key: "heat", icon: "🔥", name: "HEAT", desc: "Heat 6+ · trust gains are halved and wrong board links cost 2", danger: true },
];

function MetersHUD({
  state,
  story,
  sceneTitle,
  encounteredCharacters,
  visitedCount,
}: {
  state: GlobalState;
  story: Story;
  sceneTitle?: string;
  encounteredCharacters: Set<string>;
  visitedCount: number;
}) {
  const [open, setOpen] = useState(false);
  const clues = state.inventory.filter((i) => i.isClue);
  const suspects = story.characters.filter((c) =>
    story.deduction?.suspectIds.includes(c.id) && encounteredCharacters.has(c.id)
  );
  const perks = getPerks(state);
  const solved = story.deduction?.connections.filter((c) => state.activeFlags.has(c.flagSet)).length ?? 0;
  return (
    <div className="absolute left-3 top-3 z-50 w-64">
      <button
        onClick={() => setOpen((o) => !o)}
        className="mb-1 w-full border border-paper/20 bg-noir-950/85 px-2 py-1 text-left font-pulp text-[10px] uppercase tracking-widest text-paper/70 hover:text-gold"
        aria-expanded={open}
      >
        ▤ Case Progress {perks.heat && <span className="ml-1 text-crimson animate-pulse">HEAT</span>} {open ? "▾" : "▸"}
      </button>
      {open && (
        <div className="slide-up max-h-[calc(100dvh-5.5rem)] space-y-1.5 overflow-y-auto border border-paper/15 bg-noir-950/85 p-2 backdrop-blur-sm">
          <p className="border-b border-paper/10 pb-1 font-type text-[9px] leading-snug text-paper/45">
            This panel tracks your choices: attitude perks, people met, clues held, and corkboard progress.
          </p>
          {sceneTitle && (
            <div className="border border-gold/20 bg-gold/5 px-2 py-1">
              <div className="font-pulp text-[9px] uppercase tracking-widest text-gold">Current scene</div>
              <div className="flex items-center justify-between font-type text-[11px] text-paper/75">
                <span>{sceneTitle}</span>
                <span className="text-paper/35">{visitedCount} places visited</span>
              </div>
            </div>
          )}
          {(Object.keys(METER_STYLE) as MeterKey[]).map((k) => {
            const label = METER_LABELS[k];
            const threshold = k === "Suspicion" ? 6 : 4;
            return (
              <div key={k} className="flex items-center gap-1.5" title={`${label}: ${state.meters[k]}/10 · perk at ${threshold}`}>
                <span className="w-4 text-xs" aria-hidden>
                  {METER_STYLE[k].icon}
                </span>
                <span className="w-16 text-[10px] uppercase tracking-wider text-paper/60">{label}</span>
                <div className="relative h-1.5 flex-1 bg-noir-600" role="meter" aria-valuenow={state.meters[k]} aria-valuemin={0} aria-valuemax={10} aria-label={label}>
                  <div className={`h-full transition-all duration-500 ${METER_STYLE[k].bar} ${k === "Suspicion" && state.meters[k] >= 6 ? "animate-pulse" : ""}`} style={{ width: `${state.meters[k] * 10}%` }} />
                  <span className="absolute top-[-2px] h-2.5 w-0.5 bg-paper/50" style={{ left: `${threshold * 10}%` }} aria-hidden />
                </div>
              </div>
            );
          })}
          <div className="border-t border-paper/10 pt-1.5">
            <div className="mb-1 font-pulp text-[9px] uppercase tracking-widest text-neon">Active perks</div>
            <div className="space-y-1">
              {perkDefs.map((perk) => (
                <div key={perk.key} className={`text-[9px] ${perks[perk.key] ? (perk.danger ? "text-crimson" : "text-gold") : "text-paper/35"}`}>
                  <span className="mr-1">{perks[perk.key] ? perk.icon : "○"}</span>
                  <span className="font-pulp uppercase tracking-wider">{perk.name}</span>
                  {perks[perk.key] && <span className="ml-1 font-type">{perk.desc.split("·")[1]}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-paper/10 pt-1.5">
            <div className="mb-1 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">Known suspects</div>
            {suspects.length ? suspects.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-[10px] text-paper/60">
                <span>{c.name.split(" ")[0]}</span>
                <span className={state.characterTrust[c.id] > 0 ? "text-cyan-neon" : state.characterTrust[c.id] < 0 ? "text-crimson" : "text-paper/40"}>
                  {"♥".repeat(Math.max(0, state.characterTrust[c.id] ?? 0)) || (state.characterTrust[c.id] < 0 ? "✖".repeat(-state.characterTrust[c.id]) : "—")}
                </span>
              </div>
            )) : <div className="text-[10px] text-paper/35">No suspects pinned yet.</div>}
          </div>
          <div className="border-t border-paper/10 pt-1.5">
            <div className="mb-1 font-pulp text-[9px] uppercase tracking-widest text-crimson">Collected clues</div>
            {clues.length ? clues.map((clue) => (
              <div key={clue.id} className="flex items-center gap-2 text-[10px] text-paper/65">
                <span>{clue.icon}</span>
                <span>{clue.name}</span>
              </div>
            )) : <div className="text-[10px] text-paper/35">No clue cards collected.</div>}
          </div>
          <div className="border-t border-paper/10 pt-1.5">
            <div className="mb-1 font-pulp text-[9px] uppercase tracking-widest text-gold">Story so far — flags set</div>
            {state.activeFlags.size ? (
              <ul className="space-y-0.5">
                {[...state.activeFlags].map((flag) => (
                  <li key={flag} className="flex items-baseline gap-1 text-[10px] leading-snug" title={flag}>
                    <span className="shrink-0 text-gold/80">🏷</span>
                    <span className="text-paper/70">
                      {story.flagNotes?.[flag]?.trim() || prettyFlagName(flag)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-[10px] text-paper/35">No flags set yet — your story choices will list here.</div>
            )}
          </div>
          {!!story.deduction && (
            <div className="border-t border-paper/10 pt-1.5">
              <div className="mb-1 flex items-center justify-between font-pulp text-[9px] uppercase tracking-widest text-gold">
                <span>Board progress</span>
                <span>{solved}/{story.deduction.connections.length} links</span>
              </div>
              <div className="h-2 bg-noir-700">
                <div className="h-full bg-crimson transition-all" style={{ width: `${(solved / Math.max(1, story.deduction.connections.length)) * 100}%` }} />
              </div>
            </div>
          )}
          <div className="border-t border-paper/10 pt-1.5">
            <div className="mb-1 font-pulp text-[9px] uppercase tracking-widest text-gold">Relationships</div>
            {story.characters.filter((c) => encounteredCharacters.has(c.id)).length ? (
              <div className="space-y-1">
                {story.characters
                  .filter((c) => encounteredCharacters.has(c.id))
                  .map((c) => {
                    const op = characterOpinion(c, state.characterTrust[c.id] ?? c.trustMeter, state.activeFlags);
                    const col =
                      op.sentiment === "devoted" || op.sentiment === "trusting"
                        ? "text-emerald-400"
                        : op.sentiment === "warming"
                          ? "text-gold"
                          : op.sentiment === "hostile" || op.sentiment === "terrified"
                            ? "text-crimson"
                            : "text-paper/70";
                    return (
                      <div key={c.id} className="flex items-center justify-between gap-2 text-[10px]">
                        <span className="truncate">{c.name.split(" ")[0]}</span>
                        <span className={`text-right ${col}`}>{op.line}</span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-[10px] text-paper/35">No one trusts you yet — and no one fears you. Talk to people.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  travel map                                                         */
/* ------------------------------------------------------------------ */

/**
 * The 🗺 travel-map overlay: the story's map artwork with one pin per
 * location. Unlocks are derived live from meetsGating (flags/items/meters —
 * the same vocabulary as choices), so nothing map-related is stored in the
 * save. Locked pins show as "???" with the author's teaser (or the generic
 * gating hint); hiddenWhenLocked pins aren't drawn at all.
 */
function TravelMap({
  story,
  state,
  currentSceneId,
  visitedScenes,
  onTravel,
  onClose,
}: {
  story: Story;
  state: GlobalState;
  currentSceneId: string;
  visitedScenes: Set<string>;
  onTravel: (sceneId: string) => void;
  onClose: () => void;
}) {
  const pins = mapLocationsView(story, state);
  const bg = story.map?.backgroundImage;
  const bgStyle: React.CSSProperties = bg
    ? bg.startsWith("gradient:")
      ? { background: bg.slice(9) }
      : { backgroundImage: `url(${assetUrl(bg)})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: "linear-gradient(160deg,#14141f 0%,#0c0c14 70%)" };
  const unlockedCount = pins.filter((p) => p.unlocked).length;
  return (
    <Modal title={story.map?.title ?? "Travel Map"} onClose={onClose} wide>
      <p className="mb-2 font-type text-[10px] uppercase tracking-widest text-paper/40">
        {unlockedCount}/{story.map?.locations.length ?? 0} destinations open · what you learn opens doors · T or Esc closes
      </p>
      <div className="relative aspect-video min-h-[340px] w-full overflow-hidden border-2 border-noir-700 select-none" style={bgStyle}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/25" aria-hidden />
        {pins.map(({ location: loc, unlocked }) => {
          const here = bypassedSceneId(story, loc.targetSceneId) === currentSceneId;
          const visited = visitedScenes.has(bypassedSceneId(story, loc.targetSceneId));
          const hint = loc.lockedHint ?? gatingHint(loc.gating, story) ?? "Locked — you need something more.";
          return (
            <div
              key={loc.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
            >
              {unlocked ? (
                <button
                  onClick={() => {
                    if (here) return;
                    onTravel(loc.targetSceneId);
                  }}
                  disabled={here}
                  className={`group flex flex-col items-center gap-0.5 ${here ? "cursor-default" : "cursor-pointer"}`}
                  title={here ? `${loc.label} — you are here` : `Travel to ${loc.label}`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-lg shadow-[0_2px_10px_rgba(0,0,0,0.8)] transition-transform ${
                      here
                        ? "border-cyan-neon bg-cyan-neon/25 text-cyan-neon"
                        : "border-gold bg-noir-950/85 group-hover:scale-125 group-hover:border-neon"
                    }`}
                  >
                    {loc.icon ?? "📍"}
                  </span>
                  <span
                    className={`whitespace-nowrap border px-1.5 py-0.5 font-pulp text-[9px] uppercase tracking-widest backdrop-blur-sm ${
                      here
                        ? "border-cyan-neon/60 bg-noir-950/85 text-cyan-neon"
                        : "border-gold/60 bg-noir-950/85 text-gold group-hover:border-neon group-hover:text-neon"
                    }`}
                  >
                    {here ? `◉ ${loc.label}` : loc.label}
                    {visited && !here && <span className="ml-1 text-paper/50" title="Visited">✓</span>}
                  </span>
                </button>
              ) : (
                <div className="flex flex-col items-center gap-0.5 opacity-70" title={hint}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-paper/25 bg-noir-950/85 text-lg grayscale">
                    🔒
                  </span>
                  <span className="whitespace-nowrap border border-paper/25 bg-noir-950/85 px-1.5 py-0.5 font-pulp text-[9px] uppercase tracking-widest text-paper/50 backdrop-blur-sm">
                    ???
                  </span>
                  <span className="max-w-[180px] text-center font-type text-[9px] italic leading-tight text-paper/45">
                    {hint}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  deduction board                                                    */
/* ------------------------------------------------------------------ */

interface BoardCard {
  id: string;
  kind: "clue" | "suspect";
  title: string;
  icon: string;
  sub: string;
  img?: string;
}

function DeductionBoard({
  story,
  state,
  encounteredCharacters,
  onConnect,
  onClose,
}: {
  story: Story;
  state: GlobalState;
  encounteredCharacters: Set<string>;
  onConnect: (flag: string, revelation: string) => void;
  onClose: () => void;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const cards: BoardCard[] = useMemo(() => {
    const clues = state.inventory
      .filter((i) => i.isClue)
      .map((i) => ({ id: i.id, kind: "clue" as const, title: i.name, icon: i.icon, sub: i.flavorText, img: i.iconUrl }));
    const suspects = (story.deduction?.suspectIds ?? []).filter((id) => encounteredCharacters.has(id)).map((id) => {
      const c = story.characters.find((x) => x.id === id)!;
      return {
        id,
        kind: "suspect" as const,
        title: c.name,
        icon: c.avatarUrl.startsWith("emoji:") ? c.avatarUrl.slice(6) : "🕵️",
        sub: c.role,
        img: !c.avatarUrl || c.avatarUrl.startsWith("emoji:") ? undefined : c.avatarUrl,
      };
    });
    return [...clues, ...suspects];
  }, [story, state.inventory, encounteredCharacters]);

  const [columns, setColumns] = useState(4);
  useEffect(() => {
    const board = boardRef.current;
    if (!board || typeof ResizeObserver === "undefined") return;
    const resize = () => setColumns(Math.max(1, Math.min(4, Math.floor((board.clientWidth - 40) / 190))));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(board);
    return () => observer.disconnect();
  }, []);
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({});
  const previousColumns = useRef(columns);
  useEffect(() => {
    const reflow = previousColumns.current !== columns;
    previousColumns.current = columns;
    setPos((prev) => {
      const next = reflow ? {} : { ...prev };
      cards.forEach((c, i) => {
        if (!next[c.id]) next[c.id] = { x: 20 + (i % columns) * 190, y: 30 + Math.floor(i / columns) * 160 };
      });
      return next;
    });
  }, [cards, columns]);
  const boardHeight = Math.max(320, ...Object.values(pos).map((p) => p.y + 160));

  const [selected, setSelected] = useState<string | null>(null);
  const made = useMemo(
    () => (story.deduction?.connections ?? []).filter((c) => state.activeFlags.has(c.flagSet)),
    [story, state.activeFlags]
  );
  const profilePercent = useMemo(() => {
    const total = (story.deduction?.connections ?? []).length || 1;
    return Math.round((made.length / total) * 100);
  }, [story, made]);

  const drag = useRef<{
    id: string;
    dx: number;
    dy: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const [wire, setWire] = useState<{ from: string; x: number; y: number } | null>(null);

  const tryConnect = (a: string, b: string) => {
    const isClueToSuspect = (ca: string, cb: string) => {
      const clueIds = cards.filter((c) => c.kind === "clue").map((c) => c.id);
      const suspectIds = cards.filter((c) => c.kind === "suspect").map((c) => c.id);
      return (clueIds.includes(ca) && suspectIds.includes(cb)) || (clueIds.includes(cb) && suspectIds.includes(ca));
    };
    const conn = (story.deduction?.connections ?? []).find(
      (c) => ((c.a === a && c.b === b) || (c.a === b && c.b === a)) && isClueToSuspect(a, b)
    );
    if (conn && !state.activeFlags.has(conn.flagSet)) {
      audio.stringSnap();
      audio.success();
      onConnect(conn.flagSet, conn.revelation);
    } else if (conn) {
      audio.hover();
    } else {
      audio.fail();
      onConnect("", "Those two don't sing together. Yet.");
    }
  };

  const center = (id: string) => {
    const p = pos[id] ?? { x: 0, y: 0 };
    return { x: p.x + 80, y: p.y + 55 };
  };
  const pinPoint = (id: string) => {
    const p = pos[id] ?? { x: 0, y: 0 };
    return { x: p.x + 80, y: p.y + 2 };
  };
  const boardPoint = (e: React.PointerEvent) => {
    const r = boardRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left + boardRef.current!.scrollLeft, y: e.clientY - r.top + boardRef.current!.scrollTop };
  };

  return (
    <Modal title="Deduction Corkboard — pin the truth" onClose={onClose} wide>
      <p className="mb-2 font-type text-xs text-paper/70">
        Select a clue, then a person to connect them (click, tap, or Tab and Enter). Or drag from a card's <span className="text-crimson">red pin</span>. Scroll for more cards. Correct strings sharpen your case.
      </p>
      <div
        ref={boardRef}
        className="corkboard relative h-[52vh] min-h-[220px] max-h-[560px] w-full overflow-auto border-2 border-noir-700 select-none"
        onPointerMove={(e) => {
          if (wire) {
            const p = boardPoint(e);
            setWire((w) => (w ? { ...w, x: p.x, y: p.y } : w));
            return;
          }
          if (!drag.current || !boardRef.current) return;
          if (!drag.current.moved) {
            const distance = Math.hypot(e.clientX - drag.current.startX, e.clientY - drag.current.startY);
            if (distance < 6) return;
            drag.current.moved = true;
          }
          const r = boardRef.current.getBoundingClientRect();
          const x = clamp(e.clientX - r.left + boardRef.current.scrollLeft - drag.current.dx, 0, Math.max(0, r.width - 164));
          const y = clamp(e.clientY - r.top + boardRef.current.scrollTop - drag.current.dy, 0, boardHeight - 130);
          const id = drag.current.id;
          setPos((p) => ({ ...p, [id]: { x, y } }));
        }}
        onPointerUp={() => {
          if (wire) {
            setWire(null);
            audio.hover();
          }
          if (drag.current && !drag.current.moved) {
            const id = drag.current.id;
            if (selected && selected !== id) {
              tryConnect(selected, id);
              setSelected(null);
            } else {
              setSelected(selected === id ? null : id);
              audio.click();
            }
          }
          drag.current = null;
        }}
      >
        <div className="relative min-w-[210px]" style={{ height: boardHeight }}>
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {made.map((c) => {
            const a = center(c.a);
            const b = center(c.b);
            const mx = (a.x + b.x) / 2;
            const my = Math.max(a.y, b.y) + 36;
            return (
              <path
                key={c.flagSet}
                d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
                stroke="#e23b4e"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            );
          })}
          {wire && (
            <path
              d={`M ${pinPoint(wire.from).x} ${pinPoint(wire.from).y} Q ${(pinPoint(wire.from).x + wire.x) / 2} ${Math.max(pinPoint(wire.from).y, wire.y) + 30} ${wire.x} ${wire.y}`}
              stroke="#e8a24a"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </svg>
        {cards.map((c) => (
          <div
            key={c.id}
            data-board-card={c.id}
            aria-label={c.title}
            aria-pressed={selected === c.id}
            onPointerDown={(e) => {
              if (wire) return;
              const r = boardRef.current!.getBoundingClientRect();
              const p = pos[c.id] ?? { x: 0, y: 0 };
              boardRef.current?.setPointerCapture(e.pointerId);
              drag.current = {
                id: c.id,
                dx: e.clientX - r.left + boardRef.current!.scrollLeft - p.x,
                dy: e.clientY - r.top + boardRef.current!.scrollTop - p.y,
                startX: e.clientX,
                startY: e.clientY,
                moved: false,
              };
            }}
            onPointerUp={(e) => {
              if (wire && wire.from !== c.id) {
                e.stopPropagation();
                tryConnect(wire.from, c.id);
                setWire(null);
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.code === "Space") {
                e.preventDefault();
                if (selected && selected !== c.id) {
                  tryConnect(selected, c.id);
                  setSelected(null);
                } else setSelected(selected === c.id ? null : c.id);
              }
            }}
            className={`absolute w-40 cursor-grab border-2 p-2 shadow-lg transition-shadow ${
              c.kind === "suspect" ? "bg-noir-800 border-gold/70" : "bg-paper text-noir-900 border-crimson/60 rotate-1"
            } ${selected === c.id ? "ring-4 ring-crimson shadow-[0_0_24px_rgba(226,59,78,0.7)]" : ""} ${wire && wire.from !== c.id ? "ring-2 ring-neon/60" : ""}`}
            style={{ left: pos[c.id]?.x ?? 0, top: pos[c.id]?.y ?? 0 }}
          >
            <button
              aria-label={`Start string from ${c.title}`}
              title="Drag me onto another card"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const p = boardPoint(e);
                setWire({ from: c.id, x: p.x, y: p.y });
                audio.click();
              }}
              className="absolute -top-2.5 left-1/2 -ml-2 h-4 w-4 cursor-crosshair rounded-full border-2 border-noir-950 bg-crimson shadow-[0_0_8px_rgba(226,59,78,0.9)] transition-transform hover:scale-150"
            />
            <div className="flex items-center gap-2">
              {c.img ? (
                <img src={assetUrl(c.img)} alt="" loading="lazy" decoding="async" className="h-10 w-10 object-cover object-top border border-gold/40" />
              ) : (
                <span className="text-2xl">{c.icon}</span>
              )}
              <div>
                <div className={`font-pulp text-[10px] uppercase leading-tight ${c.kind === "suspect" ? "text-gold" : ""}`}>{c.title}</div>
                <div className={`text-[9px] italic ${c.kind === "suspect" ? "text-paper/50" : "text-noir-700/70"}`}>{c.sub}</div>
              </div>
            </div>
          </div>
        ))}
        {cards.filter((c) => c.kind === "clue").length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center font-type text-paper/80 bg-black/40 text-sm">
            No clue cards yet — go collect evidence, gumshoe.
          </div>
        )}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3 border-t border-paper/20 pt-2">
        <span className="font-pulp text-[9px] uppercase tracking-widest text-paper/40">Profile</span>
        <div className="h-2 w-32 bg-noir-600">
          <div className={`h-full transition-all duration-500 ${profilePercent === 100 ? "bg-emerald-500" : "bg-crimson"}`} style={{ width: `${profilePercent}%` }} />
        </div>
        <span className="font-type text-[10px] text-paper/70">{profilePercent}%</span>
        {profilePercent === 100 && (
          <span className="font-pulp text-[9px] uppercase tracking-widest text-gold">★ Full Profile ★</span>
        )}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-paper/20 pt-2">
        <div>
          <div className="mb-1 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">Nodes</div>
          <ul className="space-y-1">
            {cards.map((card) => {
              const connected = made.some((conn) => conn.a === card.id || conn.b === card.id);
              return (
                <li key={card.id} className={`font-type text-[10px] ${connected ? "text-gold" : "text-paper/45"}`}>
                  {connected ? "●" : "○"} {card.title}
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <div className="mb-1 font-pulp text-[9px] uppercase tracking-widest text-crimson">Unlocked deductions</div>
          {made.length > 0 ? (
            <ul className="space-y-1">
              {made.map((c) => (
                <li key={c.flagSet} className="font-type text-[10px] text-gold">
                  🔗 {c.revelation}
                </li>
              ))}
            </ul>
          ) : (
            <div className="font-type text-[10px] text-paper/40">Connect clue nodes to suspect nodes to unlock deductions.</div>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/*  main player                                                        */
/* ------------------------------------------------------------------ */

/** Overlay class for a scene entry transition — the one shared table so the
 * entry pass and an in-flight scene change (see goToScene) can never drift. */
function sceneTransitionClass(t: string): string {
  switch (t) {
    case "fade-black":
      return "scene-fade-black";
    case "cut":
      return "scene-cut";
    case "iris":
    case "iris-in":
      return "scene-iris";
    case "wipe-left":
      return "scene-wipe-left";
    case "wipe-right":
      return "scene-wipe-right";
    case "wipe-up":
      return "scene-wipe-up";
    case "wipe-down":
      return "scene-wipe-down";
    case "slide-left":
      return "scene-slide-left";
    case "slide-right":
      return "scene-slide-right";
    case "zoom":
      return "scene-zoom";
    case "glitch":
      return "scene-glitch";
    case "burn":
      return "scene-burn";
    default:
      return "scene-fade";
  }
}

interface Toast {
  id: string;
  text: string;
  kind: "info" | "fail" | "success";
}

/** An "X will remember that" impact card, shown briefly after a
 * consequential choice. Fades in, holds, then fades out. */
interface RememberCard {
  line: string;
  key: number;
}

type Overlay =
  | { type: "instructions" }
  | { type: "inspect"; item: Item }
  | { type: "board" }
  | { type: "map" }
  | { type: "relationships" }
  | { type: "log" }
  | { type: "save" }
  | { type: "load" }
  | { type: "quit" }
  | null;

/**
 * Plays one continuous run of a story. In an episodic season this is exactly
 * one episode: it opens on the episode's start scene, inherits the world state
 * carried out of the previous episode, keeps its own save slots, and reports
 * back through `onEpisodeComplete` when it reaches an ending.
 */
function CasePlayer({
  story,
  typeSpeed,
  isNewGamePlus,
  resumeSlot,
  primedMusic,
  primedNarration,
  episode,
  initialState,
  startSceneId,
  onEpisodeComplete,
  episodeEndPanel,
  onOpenSeason,
  onOpenInStudio,
  onExit,
}: {
  story: Story;
  typeSpeed: number;
  isNewGamePlus: boolean;
  resumeSlot?: number;
  primedMusic?: PrimedAudio | null;
  /** recorded prose narration that was started inside the user's Play click */
  primedNarration?: PrimedAudio | null;
  /** the episode being played, when the story is packed into a season */
  episode?: Episode;
  /** world state to open with (episode carry-over); defaults to a fresh state */
  initialState?: GlobalState;
  /** scene to open on; defaults to the story's start scene */
  startSceneId?: string;
  /** called when an episodic run reaches an ending scene */
  onEpisodeComplete?: (progress: EpisodeProgress, highlights: string[]) => void;
  /** replaces the case-closed panel on an ending scene — the season wrapper
   * supplies the end-of-episode card here */
  episodeEndPanel?: React.ReactNode;
  /** open the season / episode-list screen */
  onOpenSeason?: () => void;
  /** jump into the Studio with the current scene selected (authoring escape
   *  hatch from the in-game menu) */
  onOpenInStudio?: (sceneId: string) => void;
  /** Studio playtest: a direct from-scene run (fresh state, no save/resume
   *  chrome) — the case-closes panel offers an Exit instead of resume. */
  playtestMode?: boolean;
  onExit: () => void;
}) {
  const [state, setState] = useState<GlobalState>(() => initialState ?? createInitialState(story));
  // A playtest "from" a note placeholder starts on the scene past it — notes
  // are bypassed markers, never something the player stands in (unless a
  // wired-in note is a dead end, which the validator flags).
  const [sceneId, setSceneId] = useState(() => bypassedSceneId(story, startSceneId ?? story.startSceneId));
  const [entrySeq, setEntrySeq] = useState(0);
  const [proseDone, setProseDone] = useState(false);
  const [proseAcknowledged, setProseAcknowledged] = useState(false);

  const [beatIdx, setBeatIdx] = useState(0);
  const [beatDone, setBeatDone] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  /** Rotates the "that doesn't work" lines so a repeated verb doesn't loop. */
  const wrongVerbSeed = useRef(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  /* Subtitles presentation — a player-menu option.
   * "cinematic" (default): big pulp lettering centred over the art.
   * "classic": a compact reading-size caption — "SPEAKER: line" — for small
   * screens or players who prefer plain subtitles. Remembered per player. */
  /* Subtitles are ALWAYS the classic compact "SPEAKER — line" captions now;
   * the cinematic overlay style was pulled from the menu (it towers over the
   * art). Kept as a constant so the render branches below keep their shape. */
  const classicSubtitles = true;
  /* PULP PAPER — the halftone-dot + grain overlay. An option now: some
   * rooms read cleaner without it. Remembered per player. */
  const [pulpOn, setPulpOn] = useState(() => {
    try {
      const saved = localStorage.getItem("scarlet-reel-pulp");
      return saved === null ? story.pulpPaper !== false : saved !== "0";
    } catch {
      return story.pulpPaper !== false;
    }
  });
  const togglePulp = () => {
    setPulpOn((v) => {
      const next = !v;
      try {
        localStorage.setItem("scarlet-reel-pulp", next ? "1" : "0");
      } catch {
        /* session-only */
      }
      return next;
    });
    audio.click();
  };
  useEffect(() => {
    try {
      localStorage.setItem("scarlet-reel-subtitles", "classic");
    } catch {
      /* storage unavailable — lasts the session */
    }
  }, []);

  /* Pacing — one option, remembered per player.
   * ⏩ Auto-forward: hands-off reading. Once a line finishes typing it
   * advances on a comfortable timer, and stops at choices so the player still
   * decides. It starts OFF every session; the toggle lives on the dialogue
   * panel. Scene-authored auto-read (autoAdvanceTargetSceneId) always plays
   * itself, whether or not this is on. */
  const prefersReducedMotion = usePrefersReducedMotion();
  // Animatic mode (src/game/animatic.tsx) plays itself: the film's lines move on with no player.
  const [autoAdvance, setAutoAdvance] = useState(() => !!ANIMATIC);
  /* Auto-continue — scenes that carry an authored route (the film) used to play
   * themselves with no way to stop them. The same ⏩ button now switches that
   * authored reading on and off; the choice is remembered. Off, each line waits
   * for a click and the scene ends on a "▸ Next scene" button. */
  const [autoContinue, setAutoContinue] = useState(() => {
    if (ANIMATIC) return true;
    try { return localStorage.getItem("scarlet-reel-auto-continue") !== "off"; } catch { return true; }
  });
  useEffect(() => {
    if (ANIMATIC) return; // an animatic plays itself; it must not change the player's own setting
    try { localStorage.setItem("scarlet-reel-auto-continue", autoContinue ? "on" : "off"); } catch { /* storage unavailable */ }
  }, [autoContinue]);

  /* "Reveal hotspots" — a momentary shimmer over every interactable zone so a
   * stuck player can see what's clickable without spoilers. Auto-clears after
   * a few seconds and on scene change. */
  const [hintActive, setHintActive] = useState(false);
  const hintTimerRef = useRef<number | null>(null);
  const triggerHint = useCallback(() => {
    setHintActive(true);
    if (hintTimerRef.current !== null) window.clearTimeout(hintTimerRef.current);
    hintTimerRef.current = window.setTimeout(() => setHintActive(false), 3600);
  }, []);
  useEffect(
    () => () => {
      if (hintTimerRef.current !== null) window.clearTimeout(hintTimerRef.current);
    },
    []
  );

  /* Checkpoint confirmation — a brief "✓ Checkpoint" pulse the moment the
   * auto-save lands, so players know their progress is safe without digging
   * into a menu. */
  const [checkpointFlash, setCheckpointFlash] = useState(false);
  /* Examination card — what a hotspot tells you, printed where you can't
   * miss it: white text on a near-black card above the dialogue panel, with
   * the zone's label. Hotspot results (and locked-zone messages) used to
   * live in a small toast that was easy to click past; now they hold the
   * screen until dismissed (or ~7s pass). */
  const [examCard, setExamCard] = useState<{ label: string; text: string; kind: "info" | "fail" } | null>(null);
  /* Pattern puzzle — an in-place evidence mini-game. When active it covers
   * the screen with the ledger puzzle. Solved → reward consequences + close;
   * wrong → wrongSubmissionConsequences + retry or consequence scene. */
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [patternPuzzle, setPatternPuzzle] = useState<{ config: PatternPuzzleConfig; hotspot: Hotspot } | null>(null);
  const [esperModal, setEsperModal] = useState<{ config: EsperConfig; hotspot: Hotspot } | null>(null);
  const [vkModal, setVkModal] = useState<{ config: VkConfig; hotspot: Hotspot } | null>(null);
  /* Arcade cabinet — a playable mini-game rendered inside cabinet art. Like
   * the pattern puzzle it covers the screen; unlike it, losing is retryable
   * in place, because walking away from a cabinet is always allowed. */
  const [arcadeGame, setArcadeGame] = useState<{ config: ArcadeGameConfig; hotspot: Hotspot } | null>(null);
  const [rideChoice, setRideChoice] = useState<Choice | null>(null);
  const [triangulateChoice, setTriangulateChoice] = useState<Choice | null>(null);
  /* EXAMINE — hold-to-inspect. While active, the camera zooms onto the
   * hotspot bounds and a meter fills over examineSeconds; releasing early
   * aborts, completion fires the hotspot's normal action (pickup / the
   * description) and consumes the zone. */
  const [examining, setExamining] = useState<{ hs: Hotspot; progress: number } | null>(null);
  const examineRaf = useRef<number | null>(null);
  const examineStart = useRef(0);
  /* INTERROGATION — live composure + the urgency layer. `iqComposure` is the
   * per-scene live value (persisted to the save); `iqSteadied` tracks the
   * one-shot recovery. The rest are transient FX triggers (press jolt, steady
   * creep, reaction line, break/clamp stamp slam). */
  const [iqComposure, setIqComposure] = useState<Record<string, number>>({});
  const iqSteadied = useRef<Record<string, boolean>>({});
  const [iqPressKey, setIqPressKey] = useState(0);
  const [iqSteadyKey, setIqSteadyKey] = useState(0);
  const [iqReaction, setIqReaction] = useState<{ text: string; key: number } | null>(null);
  const [iqStamp, setIqStamp] = useState<{ kind: "broke" | "clamped"; key: number } | null>(null);

  /* PRESS THE LIE — the contradiction verb. While a beat carrying a `lie` is
   * on screen the player can press the speaker and must produce the evidence
   * that breaks the claim. `lieWrong` counts bad guesses per beat (reset on a
   * scene change); `pressLie` opens the evidence bag on a specific beat. */
  const [pressLieBeat, setPressLieBeat] = useState<DialogueBeat | null>(null);
  const [lieWrong, setLieWrong] = useState<Record<string, number>>({});
  const [lieBluff, setLieBluff] = useState<{ beatId: string; text: string; key: number } | null>(null);
  useEffect(() => {
    if (!examCard) return;
    const t = window.setTimeout(() => {
      // The card's 7s dwell is a READING time, not a speaking time — a long
      // examine line still has several seconds of narration left. Let the
      // voice finish; only tidy up if it has already stopped.
      audio.stopSpeechIfIdle();
      setExamCard(null);
    }, 7000);
    return () => window.clearTimeout(t);
  }, [examCard]);
  const [remember, setRemember] = useState<RememberCard | null>(null);
  const [usedHotspots, setUsedHotspots] = useState<Set<string>>(new Set());
  /* ---------- end-of-scene investigation nudge ----------
   * When a scene's dialogue has run out and there are still searchable
   * hotspots the player hasn't touched on this visit, the game tells them:
   * a toast when the choices appear, then a quiet pulsing banner until they
   * search (or dismiss it / leave). Exits (goToScene) don't count — the
   * nudge is about looking around, not moving on. */
  const [investigatedThisVisit, setInvestigatedThisVisit] = useState(false);
  const [investigateNudgeDismissed, setInvestigateNudgeDismissed] = useState(false);
  const investigateToastShown = useRef(false);
  useEffect(() => {
    setInvestigatedThisVisit(false);
    setInvestigateNudgeDismissed(false);
    investigateToastShown.current = false;
    // A hotspot reveal is for the scene you're stuck on — don't carry it into
    // the next one.
    setHintActive(false);
    if (hintTimerRef.current !== null) {
      window.clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
  }, [sceneId, entrySeq]);
  const [usedChoices, setUsedChoices] = useState<Set<string>>(new Set());
  const [visitedScenes, setVisitedScenes] = useState<Set<string>>(new Set());
  /** ordered decision log — powers the end-of-part flowchart */
  const [journey, setJourney] = useState<JourneyStep[]>([]);
  /* REWIND ONE DECISION — a bounded RAM-only stack of world snapshots, one
   * per decision (a choice, a lapsed quick-time window, a hotspot that
   * changes the world). ↺ Rewind restores the top entry through the SAME
   * restoreSave path a load slot uses, so items un-pick, flags un-set and
   * meters roll back by construction. See src/game/rewind.ts for the rules
   * (endings seal the stack; nothing is persisted). */
  const [rewind, setRewind] = useState<RewindStack>(emptyRewind);
  /** buildSave is defined below; the ref lets the decision paths above it
   *  snapshot without a temporal-dead-zone reference. */
  const buildSaveRef = useRef<(() => GameSave) | null>(null);
  /** when set, the part-break route chart is covering the screen; the parked
   * destination is entered once the player dismisses it */
  const [partBreak, setPartBreak] = useState<{ title: string; nextSceneId: string } | null>(null);
  /** when set, the full branching route map for the act just finished is
   * covering the screen. Shown at act boundaries only; ordinary part breaks
   * keep the lighter linear chart. */
  const [actMap, setActMap] = useState<{ actId: string; nextSceneId: string } | null>(null);
  /** an act title card waiting to play. Shown AFTER any part-break chart, so a
   * boundary reads: route chart -> act card -> first scene of the new act. */
  const [pendingAct, setPendingAct] = useState<{ act: Act; nextSceneId: string } | null>(null);
  /** acts whose card has already played this run, so re-entering a scene
   * (or stepping back) doesn't replay it */
  const seenActs = useRef<Set<string>>(new Set());
  /** how many journey steps had already been charted at the last part break,
   * so each part's chart shows only that part's decisions */
  const [chartedUpTo, setChartedUpTo] = useState(0);
  const [encounteredCharacters, setEncounteredCharacters] = useState<Set<string>>(new Set());
  const [fading, setFading] = useState(false);
  const [choiceFocus, setChoiceFocus] = useState(0);
  const [expiredChoices, setExpiredChoices] = useState<Set<string>>(new Set());
  const [choiceClocks, setChoiceClocks] = useState<Record<string, number>>({});
  const [banner, setBanner] = useState(isNewGamePlus);
  const [autoNarrate, setAutoNarrate] = useState(true);
  const [showCaseFile, setShowCaseFile] = useState(false);
  const [holdRemaining, setHoldRemaining] = useState(0);
  const [autoAdvanceRemaining, setAutoAdvanceRemaining] = useState(0);
  const [soundOn, setSoundOn] = useState(() => {
    // Mute survives the session — a player who silenced the reel once
    // shouldn't be ambushed by the theme on the next launch.
    try {
      return localStorage.getItem("scarlet-reel-muted") !== "1";
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("scarlet-reel-muted", soundOn ? "0" : "1");
    } catch {
      /* storage unavailable — mute lasts the session */
    }
  }, [soundOn]);
  // Sine-duck the scene music under dialogue/narration — on by default,
  // survives the session like the mute.
  const [duckOn, setDuckOn] = useState(() => {
    try {
      return localStorage.getItem("scarlet-reel-duck") !== "0";
    } catch {
      return true;
    }
  });
  useEffect(() => {
    audio.setVoiceDuckEnabled(duckOn);
    try {
      localStorage.setItem("scarlet-reel-duck", duckOn ? "1" : "0");
    } catch {
      /* storage unavailable — duck lasts the session */
    }
  }, [duckOn]);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicTrack, setMusicTrack] = useState<string | null>(null);
  const [mixerOpen, setMixerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [volumes, setVolumes] = useState<Record<MixChannel, number>>(() => ({ ...audio.volumes }));
  const episodeId = episode?.id;
  const [saves, setSaves] = useState<(GameSave | null)[]>(() => readSaves(story.id, episodeId));
  // Choices the player made during THIS episode, in order — replayed on the
  // end-of-episode card as "your defining choices".
  const [episodeHighlights, setEpisodeHighlights] = useState<string[]>([]);
  const highlightsRef = useRef<string[]>([]);
  highlightsRef.current = episodeHighlights;
  const sceneAudioRef = useRef<HTMLAudioElement | null>(null);
  // Per-scene music level for the currently-playing track (1 = default).
  const musicLevelRef = useRef<number>(1);
  // Elements currently fading out. They are detached from sceneAudioRef the
  // moment the fade starts, so the incoming track can be wired up immediately
  // and the two overlap into a crossfade rather than a gap.
  const fadingOutRef = useRef<Set<HTMLAudioElement>>(new Set());

  /** Ramp a detached element down, then pause it and release it. Tracked in
   *  fadingOutRef so unmount can cut any fade still in flight — otherwise a
   *  player leaving mid-fade would hear the tail continue over the menu. */
  const fadeOutAndStop = useCallback((el: HTMLAudioElement, ms = MUSIC_FADE_MS) => {
    fadingOutRef.current.add(el);
    const finish = () => {
      try {
        el.pause();
        el.currentTime = 0;
      } catch {
        /* already gone */
      }
      fadingOutRef.current.delete(el);
    };
    // A muted or already-silent element has nothing to ramp.
    if (el.paused || el.muted || el.volume < 0.001) {
      finish();
      return;
    }
    fadeAudio(el, 0, ms, finish);
  }, []);
  const musicSrcRef = useRef<string | null>(null);
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  // Stable ref to leaveFor so earlier callbacks (advanceBeat) can call it
  // without a forward dependency on its useCallback declaration.
  const leaveForRef = useRef<((dest: string, breakTitle?: string) => void) | null>(null);
  const narrationTimerRef = useRef<number | null>(null);
  const primedNarrationRef = useRef<PrimedAudio | null>(primedNarration ?? null);
  const craftHintShown = useRef(false);
  // Fire the corkboard hint once per run, on the first collected clue.
  const boardHintShown = useRef(false);
  const visitedRef = useRef<Set<string>>(new Set());
  /** Dialogue beats the player has actually seen play (by id), story-wide.
   *  Drives the revisit resume point: a scene re-entered picks up after the
   *  last SEEN beat rather than skipping all AUTHORED beats, so a gated beat
   *  that never played on the first visit still plays on a later one. */
  const seenBeatIdsRef = useRef<Set<string>>(new Set());
  const stateRef = useRef(state);
  stateRef.current = state;
  // The journey log is appended during the same handler that navigates, so
  // reads of it there must not go through the (lagging) state value.
  const journeyRef = useRef(journey);
  journeyRef.current = journey;
  const chartedUpToRef = useRef(chartedUpTo);
  chartedUpToRef.current = chartedUpTo;
  const sceneIdRef = useRef(sceneId);
  sceneIdRef.current = sceneId;
  // The scene we walked in FROM — stage rooms use it to pick the entry spawn
  // (stage.entrySpawns: come in from the bar, stand at the bar's door).
  const prevSceneRef = useRef<string | null>(null);
  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;
  // A save waiting to be applied on the next scene-entry pass, so restoring
  // does not get clobbered by the normal first-entry/reset logic.
  const restoreRef = useRef<GameSave | null>(null);
  // Which quick-time choices have already fired their heartbeat sting, so it
  // only sounds once per choice per window. Reset when a new set of clocks is
  // initialised (scene entry / resume).
  const qtHeartbeatFired = useRef<Set<string>>(new Set());
  // When true, the next successful save exits back to the newsstand.
  const saveThenExitRef = useRef(false);

  // A dead-end note (wired in but no route out — the validator flags it) is
  // the only note the player can stand in; show its placeholder text instead
  // of a blank plate.
  const rawScene = sceneById(story, sceneId);
  const scene = useMemo(() =>
    rawScene?.nodeType === "note" && !rawScene.prose ? { ...rawScene, prose: rawScene.title } : rawScene,
  [rawScene]);
  /** CREDITS node — a title sequence that paces itself. The roll's own length
   *  (cards × cardSeconds, or the scroll track, or the staggered list) is the
   *  scene's clock; nothing else times it. */
  const isCredits = scene?.nodeType === "credits";
  const creditsRoll = useMemo(
    () => (scene?.nodeType === "credits" ? creditsRollSeconds(scene.prose, scene.credits) : 0),
    [scene]
  );
  /** How long this credits node actually runs: the roll, which an authored
   *  `autoAdvanceDelaySeconds` may stretch (a longer music cue) but never cut
   *  short. One number drives the timer, the progress rule and the skip. */
  const creditsWait = isCredits && scene ? Math.max(scene.autoAdvanceDelaySeconds ?? 0, creditsRoll) : 0;
  /** NO-HUD layout (credits, cutscene, or any scene with hideHud set):
   *  zero in-game chrome — no menu, meters, leads panel, chips, dock or
   *  sound/help corner. Subtitles, stage markers and the verb coin stay;
   *  Esc still opens the quit dialog so the player is never trapped. */
  const hudHidden =
    scene?.nodeType === "credits" || scene?.nodeType === "cutscene" || !!scene?.hideHud;
  /** The walker's feet (scene %) in a STAGE room — drives walk-behind masks:
   *  a foreground extra flagged `occludes` is drawn OVER the character while
   *  they stand behind it, so they disappear behind the counter. */
  /* The walker's LIVE feet position stays in a ref — re-rendering the whole
   * Game on every position report would cascade passive updates 60x/s during
   * every walk in an occluder room (and trips React's nested-update limiter
   * in some environments). Only the flip moments — an `occludes` extra
   * gaining/losing the walker behind it — need a render, so the pos callback
   * diffs the membership set and setStates only when it changes. */

  /* ---- CURSOR ART: per-verb art (and the plain arrow) ---- */
  const [hoverCursor, setHoverCursor] = useState<CursorKind | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const cursorSlot = (hoverCursor ?? "default") as import("../logic").CursorSlot;
  const cursor = useMemo(() => resolveCursor(story, cursorSlot), [story, cursorSlot]);
  useEffect(() => {
    if (!cursor.animated) return;
    const move = (e: PointerEvent) => setPointer({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [cursor.animated]);
  /** Static art = a real CSS cursor. Animated art = hide the system cursor and
   *  draw a sprite that tracks the mouse. */
  const cursorStyle: React.CSSProperties = cursor.animated
    ? { cursor: "none" }
    : cursor.css
      ? { cursor: cursor.css }
      : {};

  // How THIS case shows what you're carrying (default: the classic chip rail,
  // so no existing game changes). See InventorySettings in src/types.ts.
  const invDisplay = useMemo(() => inventoryDisplay(story), [story]);
  // Entering a NO-HUD scene while the menu / mixer / case file was open
  // would strand floating chrome whose trigger buttons just disappeared —
  // close it all on entry.
  useEffect(() => {
    if (!hudHidden) return;
    setMenuOpen(false);
    setMixerOpen(false);
    setShowCaseFile(false);

  }, [hudHidden, sceneId]);
  const handleItemDrop = useCallback(
    (item: Item, hotspotId: string) => {
      const hs = (scene?.hotspots ?? []).find((h) => h.id === hotspotId);
      if (!hs) return;
      activateRef.current?.(hs, { verb: "use", itemId: item.id });
    },
    [scene]
  );
  /** activateHotspot is declared further down; the drop handler reaches it
   *  through a ref so ordering doesn't matter. */
  const activateRef = useRef<((hs: Hotspot, ctx?: { verb?: VerbId; itemId?: string }) => void) | null>(null);
  const playProse = useCallback((target: SceneNode) => {
    const primed = primedNarrationRef.current;
    primedNarrationRef.current = null;
    if (primed && primed.url === target.narrationAudioUrl) {
      playSceneProse(target, primed);
    } else {
      // A primer that doesn't match this scene's narration (e.g. the opening
      // clip left over from a resume-fired prime) must not keep playing.
      if (primed) {
        try {
          primed.el.pause();
        } catch {
          /* noop */
        }
      }
      playSceneProse(target);
    }
  }, []);

  // StrictMode double-mounts every component in dev (setup → cleanup → setup).
  // The scene-entry effect's `enteredRef` guard makes its SECOND run a no-op,
  // so any teardown this effect performs between the two runs kills the work
  // of the first: the opening track and the primed prose MP3 get paused and
  // the 0ms narration timer is cleared, and nothing restarts them. That made
  // recorded prose narration silently dead on a start scene in dev. Defer the
  // real teardown one tick and skip it if the effect re-ran (StrictMode);
  // a genuine unmount still tears down immediately after the tick.
  const audioTeardownRun = useRef({ run: 0 });
  const primedMusicRef = useRef(primedMusic ?? null);
  primedMusicRef.current = primedMusic ?? null;
  useEffect(() => {
    const fading = fadingOutRef.current;
    const lifecycle = audioTeardownRun.current;
    const run = ++lifecycle.run;
    return () => {
      window.setTimeout(() => {
        if (lifecycle.run !== run) return; // StrictMode re-mount — keep the audio
        if (sceneAudioRef.current) {
          try { sceneAudioRef.current.pause(); } catch {}
          sceneAudioRef.current = null;
        }
        // Leaving the player cuts immediately — a fade tail must not outlive
        // the story and bleed over the main menu.
        fading.forEach((el) => {
          try {
            el.pause();
          } catch {
            /* noop */
          }
        });
        fading.clear();
        if (narrationTimerRef.current !== null) window.clearTimeout(narrationTimerRef.current);
        if (primedNarrationRef.current) {
          try {
            primedNarrationRef.current.el.pause();
          } catch {
            /* noop */
          }
          primedNarrationRef.current = null;
        }
        // Primed opening track must also stop — otherwise quitting during the
        // title-theme prime leaves music playing over the menu.
        if (primedMusicRef.current) {
          try { primedMusicRef.current.el.pause(); } catch {}
          primedMusicRef.current = null;
        }
        if (primedMusic) {
          try { primedMusic.el.pause(); } catch {}
        }
        audio.stopSpeech();
        mediaPreloader.clear();
        audio.setAmbient(null);
      }, 0);
    };
  }, [primedMusic]);

  // Auto-dismiss the "New Game+" banner after 8 seconds so it doesn't sit over
  // the scene. Re-arms each time it reappears (e.g. after starting New Game+).
  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(false), 8000);
    return () => window.clearTimeout(t);
  }, [banner]);

  const pushToast = useCallback((text: string, kind: Toast["kind"] = "info") => {
    const id = uid();
    setToasts((t) => [...t.slice(-3), { id, text, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  // Auto-dismiss the "will remember that" card after a short hold.
  useEffect(() => {
    if (!remember) return;
    const t = window.setTimeout(() => setRemember(null), 2600);
    return () => window.clearTimeout(t);
  }, [remember]);

  const explainCrafting = useCallback(() => {
    // Context-aware crafting help. The previous version was useless because it
    // fired the same static string regardless of what was in the inventory.
    const inv = stateRef.current.inventory;
    if (!inv.length) {
      pushToast("Crafting hint: you need at least two items in your inventory. Search for hotspots first.", "info");
      return;
    }
    if (inv.length === 1) {
      pushToast(`Crafting hint: ${inv[0].icon} ${inv[0].name} is lonely. Find its partner in another scene.`, "info");
      return;
    }
    // Find an actual pair that will craft
    for (const a of inv) {
      const partner = inv.find((b) => b.id !== a.id && combineItems(story, a, b));
      if (partner) {
        pushToast(`✨ Recipe ready: choose Combine, then ${a.name} and ${partner.name} in your inventory (or drag one onto the other).`, "success");
        return;
      }
    }
    // Look for items that could combine with something we haven't found yet
    const pending = inv.find((i) => i.combinableWith);
    if (pending) {
      const missing = story.items.find((x) => x.id === pending.combinableWith?.targetItemId);
      pushToast(`Crafting hint: ${pending.icon} ${pending.name} needs ${missing?.icon ?? "another item"} ${missing?.name ?? "somewhere in the story"}.`, "info");
      return;
    }
    pushToast("These items don't combine with each other. Look for evidence in other scenes.", "info");
  }, [story, pushToast]);

  useEffect(() => {
    if (!craftHintShown.current && state.inventory.some((a) => state.inventory.some((b) => a.id !== b.id && combineItems(story, a, b)))) {
      craftHintShown.current = true;
      explainCrafting();
    }
  }, [state.inventory, story, explainCrafting]);

  const sceneTransition = useRef<number | null>(null);
  useEffect(() => () => { if (sceneTransition.current !== null) window.clearTimeout(sceneTransition.current); }, []);
  /* The destination of an in-flight scene change. The overlay plays the
   * DESTINATION's transition for the whole cover+reveal (that is what the
   * author attached to the scene being entered), and the plate swaps once the
   * cover is opaque — mid-cover — so a wipe covers and uncovers in the same
   * direction instead of snapping through black. */
  const [pendingScene, setPendingScene] = useState<{ transition: string; ms: number; sceneId?: string } | null>(null);
  const goToScene = useCallback(
    (id: string) => {
      if (sceneTransition.current !== null) return; // double-click / held key
      if (!ANIMATIC) audio.click(); // the press's feedback; an animatic has no presses
      // Notes are author placeholders: resolve them to the scene their single
      // outgoing route points at, so the player passes straight through.
      const targetId = bypassedSceneId(story, id);
      const target = sceneById(story, targetId);
      // Reduced motion: pure cut. The overlay only shows as a solid black
      // flash while `fading` is true, so skip the fade state entirely and
      // swap immediately — no dip through black, no timed hold.
      if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
        prevSceneRef.current = sceneIdRef.current;
        setSceneId(targetId);
        setEntrySeq((s) => s + 1);
        return;
      }
      // A hard cut is a hard cut: no fade state, no delay — the plate swaps
      // this tick. (The old fixed 380ms hold painted solid black for that
      // whole window, which turned every "cut" into a blink.)
      const rawT = target?.transition ?? "fade";
      if (rawT === "cut") {
        prevSceneRef.current = sceneIdRef.current;
        setSceneId(targetId);
        setEntrySeq((s) => s + 1);
        return;
      }
      const ms = Math.max(160, Math.round((target?.transitionSpeed ?? 0.5) * 1000));
      setPendingScene({ transition: rawT, ms, sceneId: targetId });
      setFading(true);
      // The move lands with sound: a synthesized whoosh swells across the
      // cover and the impact is scheduled (on the AudioContext clock) for the
      // swap instant. "cut" returned above — a cut is a cut and stays mute;
      // reduced motion took the pure-cut exit too. Author override per scene
      // via `transitionSound`; the sfx bus + sound toggle gate the rest.
      const sfxKind = resolveTransitionSound(rawT, target?.transitionSound);
      if (sfxKind !== "none" && soundOnRef.current) {
        audio.transitionSfx(sfxKind, ms / 1000, transitionTravelDir(rawT));
      }
      // Swap the plate when the cover is opaque (ms), then let the reveal run
      // its full duration — total travel = 2× the authored speed.
      sceneTransition.current = window.setTimeout(() => {
        sceneTransition.current = null;
        prevSceneRef.current = sceneIdRef.current;
        setSceneId(targetId);
        setEntrySeq((s) => s + 1);
        setFading(false);
        setPendingScene(null);
      }, ms);
    },
    [story]
  );

  /* Overlay art lifecycle (hygiene). The slide/zoom overlay carries the
   * destination's art stack (image + lights + flare + grade) INSIDE the
   * black overlay, which is exactly right while a move is playing — but the
   * overlay is never removed from the tree, so a scene whose ENTRY transition
   * is slide/zoom kept that whole invisible stack mounted at opacity 0 for
   * the rest of the scene (extra composited layers, per-light pulse loops,
   * the works, behind the real plate). Art is therefore live in exactly two
   * phases: the cover (while `fading`, driven by goToScene) and the reveal
   * window after each arrival (entry or swap), armed here and released when
   * the reveal duration lapses. At rest nothing renders, nothing animates. */
  const [overlayArtLive, setOverlayArtLive] = useState(true);
  const overlayRevealMs = Math.max(160, Math.round((scene?.transitionSpeed ?? 0.5) * 1000));
  useEffect(() => {
    // During the cover the art shows unconditionally (see showArt below) and
    // the swap re-runs this effect — no timer needed for the cover phase.
    if (fading) return;
    setOverlayArtLive(true); // (re-)arm: this render's arrival just started its reveal
    const id = window.setTimeout(() => setOverlayArtLive(false), overlayRevealMs + 160);
    return () => window.clearTimeout(id);
    // pendingScene flips alongside `fading` at cover start; the reveal clock
    // uses the ARRIVING scene's authored speed, which is `scene` by then.
  }, [fading, sceneId, entrySeq, overlayRevealMs]);

  /* -------- scene entry -------- */
  const enteredRef = useRef<string>("");
  const heatBustFired = useRef(false);
  useEffect(() => {
    if (!scene) return;
    const key = `${sceneId}#${entrySeq}`;
    if (enteredRef.current === key) return;
    enteredRef.current = key;

    const revisit = visitedRef.current.has(sceneId);
    visitedRef.current.add(sceneId);
    setVisitedScenes(new Set(visitedRef.current));

    // A restore (load slot) reapplies saved scene progress instead of the normal
    // first-entry/revisit reset, so the player lands exactly where they left off.
    const restoring = restoreRef.current;
    if (restoring) restoreRef.current = null;

    if (restoring) {
      setProseDone(restoring.proseAcknowledged || !!scene.noTypewriter);
      setProseAcknowledged(restoring.proseAcknowledged);
      setBeatIdx(restoring.proseAcknowledged ? Math.min(restoring.beatIdx, scene.dialogueBeats?.length ?? 0) : 0);
      setBeatDone(restoring.proseAcknowledged);
      setChoiceFocus(0);
      setExpiredChoices(new Set(restoring.expiredChoices ?? []));
      setChoiceClocks(restoring.choiceClocks ?? {});
      qtHeartbeatFired.current = new Set();
      setHoldRemaining(0);
      setAutoAdvanceRemaining(0);
    } else {
      // A scene whose prose is empty has nothing to read, so don't strand the
      // player on a blank panel with a "continue to dialogue" button: drop
      // straight into the beats (or choices). Credits/cutscene intros keep
      // their deliberate Begin/Continue flow even when terse.
      const emptyProse =
        scene.nodeType !== "credits" && scene.nodeType !== "cutscene" && (!(scene.prose ?? "").trim() || scene.nodeType === "stage");
      // If noTypewriter is enabled (for MP3 voice sync), show prose instantly
      // instead of animating it letter-by-letter. Credits nodes are the
      // exception: their animated intro controls when the Begin button appears.
      setProseDone(revisit || emptyProse || (!!scene.noTypewriter && scene.nodeType !== "credits"));
      setProseAcknowledged(revisit || emptyProse);
      // Revisit: resume AFTER the beats the player has already seen — not
      // past every AUTHORED beat. The old skip-to-end swallowed gated beats
      // that never played on the first visit (their flag wasn't set yet);
      // rebuilt here is the entry queue exactly as `visibleBeats` builds it:
      // authored beats passing their gate, each broken lie's caught beat
      // spliced after its claim, then the interrogation's broke/clamped beats.
      let revisitStart = 0;
      if (revisit && scene.nodeType !== "stage") {
        const st = stateRef.current;
        const queue: DialogueBeat[] = [];
        for (const b of scene.dialogueBeats ?? []) {
          if (!meetsGating(b.conditionRule, st)) continue;
          queue.push(b);
          if (b.lie && st.activeFlags.has(b.lie.contradictedFlag)) queue.push(b.lie.caughtBeat);
        }
        const iq = scene.interrogation;
        if (iq) {
          const iqBeats = [
            st.activeFlags.has(iq.brokeFlag) ? iq.brokeBeat : null,
            iq.clampFlag && iq.clampedBeat && st.activeFlags.has(iq.clampFlag) ? iq.clampedBeat : null,
          ].filter((b): b is DialogueBeat => !!b && meetsGating(b.conditionRule, st));
          queue.push(...iqBeats);
        }
        const firstUnseen = queue.findIndex((b) => !seenBeatIdsRef.current.has(b.id));
        revisitStart = firstUnseen < 0 ? queue.length : firstUnseen;
      }
      // STAGE nodes: beats NEVER auto-play — a startDialogue marker opens the
      // conversation — so the beat cursor always restarts at 0 on entry.
      setBeatIdx(scene.nodeType === "stage" ? 0 : revisit ? revisitStart : 0);
      setBeatDone(false);
      setChoiceFocus(0);
      setExpiredChoices(new Set());
      setChoiceClocks({});
      qtHeartbeatFired.current = new Set();
      // Press-the-lie: a new scene clears the open evidence bag and the
      // per-claim wrong-guess counts (a fresh scene is a fresh chance).
      setPressLieBeat(null);
      setLieWrong({});
      setLieBluff(null);
      // Cinematic hold: a scene with `choiceDelaySeconds` keeps its choices
      // locked until the timer elapses. Only applied on first entry — revisits
      // stay snappy. Credits nodes are exempt: their own roll length paces
      // them (see the scene auto-advance below), and a second hand-typed hold
      // stacked on top of the roll is what made the end credits sit on the
      // last card for another two minutes.
      setHoldRemaining(revisit || scene.nodeType === "credits" ? 0 : Math.max(0, scene.choiceDelaySeconds ?? 0));
      setAutoAdvanceRemaining(0);
    }
    audio.stopSpeech();
    if (narrationTimerRef.current !== null) {
      window.clearTimeout(narrationTimerRef.current);
      narrationTimerRef.current = null;
    }
    // Scene music — continuous across scenes. A scene with a track switches to
    // it, a scene with "no music" stops it, and everything else inherits the
    // currently-playing track so it keeps looping until changed or silenced.
    //
    // Nothing stops abruptly: leaving a track ramps it down over
    // MUSIC_FADE_MS and a new track ramps up over the same window, so a
    // switch reads as a crossfade the way a film reel changes cue.
    const musicUrl = scene.musicUrl ?? scene.sceneAudioUrl;
    const musicMode = scene.musicMode ?? "inherit";
    // Per-scene fade length. A long title sequence can breathe out slowly; a
    // hard cut into a shock scene sets this to 0.
    const fadeMs =
      scene.musicFadeSeconds === undefined
        ? MUSIC_FADE_MS
        : Math.max(0, scene.musicFadeSeconds) * 1000;

    const startTrack = (url: string) => {
      // Ramp the outgoing track down rather than cutting it. It is detached
      // from sceneAudioRef immediately so the incoming track can be wired up
      // straight away — the two overlap and read as a crossfade.
      const outgoing = sceneAudioRef.current;
      if (outgoing) {
        outgoing.onplaying = null;
        outgoing.onpause = null;
        sceneAudioRef.current = null;
        fadeOutAndStop(outgoing, fadeMs);
      }
      // Adopt the element primed inside the user's click gesture (see App.tsx)
      // so the opening track plays even though this effect runs after the
      // activation window. If it's a different track, stop the primer and start
      // a fresh element.
      const reuse = primedMusic && primedMusic.url === url ? primedMusic.el : null;
      if (primedMusic && !reuse && !primedMusic.el.paused) primedMusic.el.pause();
      const a = reuse ?? new Audio(assetUrl(url));
      // a song (musicLoop: false) plays once; a bed loops until changed or silenced
      a.loop = scene.musicLoop !== false;
      a.muted = !soundOnRef.current;
      // The voice-duck envelope multiplies in here too, so a track that
      // starts mid-dialogue comes in already ducked. A per-scene music level
      // lets the author start this track louder/lower than the player's
      // default music volume.
      const trackLevel = scene.musicLevel !== undefined && scene.musicLevel >= 0 ? scene.musicLevel : 1;
      musicLevelRef.current = trackLevel;
      const target = audio.volumes.master * audio.volumes.music * trackLevel * audio.duckFactor;
      // Start silent and ramp in. A track adopted from the priming click may
      // already be audible, so it fades from wherever it actually is.
      a.volume = reuse ? a.volume : 0;
      fadeAudio(a, target, fadeMs);
      a.onplaying = () => {
        setMusicPlaying(true);
        setSoundBlocked(false);
      };
      a.onpause = () => setMusicPlaying(false);
      // The primed element already fired `playing` before we adopted it, so
      // reflect the state directly instead of waiting for a second event.
      if (reuse && !a.paused) {
        setMusicPlaying(true);
        setSoundBlocked(false);
      }
      try {
        const attempt = a.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt
            .then(() => {
              setSoundBlocked(false);
              // Some webviews resolve play() but stay silent (a soft autoplay
              // block). Double-check the track is actually advancing.
              window.setTimeout(() => {
                if (a.paused && !a.error) {
                  setSoundBlocked(true);
                  pushToast("🔇 Music is paused — tap to enable sound.", "info");
                }
              }, 500);
            })
            .catch(() => {
              if (!a.error) {
                setSoundBlocked(true);
                pushToast("🔇 The browser blocked music autoplay — tap to enable sound.", "info");
              } else {
                pushToast(`Music couldn't be played (${a.error.message ?? `error ${a.error.code}`}).`, "fail");
              }
            });
        }
      } catch {
        // Some browsers throw synchronously instead of returning a rejected
        // promise — treat it the same as an autoplay block.
        setSoundBlocked(true);
        pushToast("🔇 The browser blocked music autoplay — tap to enable sound.", "info");
      }
      sceneAudioRef.current = a;
      musicSrcRef.current = url;
      setMusicTrack(url);
    };

    if (musicMode === "none") {
      // "No music" is a cue too: ramp the soundtrack out instead of dropping
      // it, so entering a silent scene lands rather than lurches.
      musicLevelRef.current = 1;
      if (sceneAudioRef.current) {
        const outgoing = sceneAudioRef.current;
        outgoing.onplaying = null;
        outgoing.onpause = null;
        sceneAudioRef.current = null;
        fadeOutAndStop(outgoing, fadeMs);
      }
      // A primed opening track that a "no music" scene won't use goes too.
      if (primedMusic && !primedMusic.el.paused) fadeOutAndStop(primedMusic.el, fadeMs);
      musicSrcRef.current = null;
      setMusicTrack(null);
      setMusicPlaying(false);
    } else if (musicUrl && (musicMode === "track" || musicSrcRef.current !== musicUrl)) {
      // A scene that sets a track (either explicitly or via legacy musicUrl)
      // switches to it; a scene re-using the SAME track keeps it running
      // without restarting.
      if (musicSrcRef.current !== musicUrl) startTrack(musicUrl);
      else if (scene.musicLevel !== undefined && scene.musicLevel >= 0 && scene.musicLevel !== musicLevelRef.current && sceneAudioRef.current) {
        // Same track, new level: swell or ease to it over the scene's fade, so a cue can build across scenes.
        musicLevelRef.current = scene.musicLevel;
        fadeAudio(sceneAudioRef.current, audio.volumes.master * audio.volumes.music * scene.musicLevel * audio.duckFactor, fadeMs);
      }
    } else {
      // Inherit: leave whatever is playing untouched (sync mute state only).
      const a = sceneAudioRef.current;
      if (a) a.muted = !soundOnRef.current;
      setMusicTrack(musicSrcRef.current);
    }
    audio.setAmbient(soundOnRef.current ? scene.ambientAudio ?? null : null);
    // Video cutscenes: start via a JS play() (not the autoplay attribute), the
    // same way music starts — the attribute is blocked by stricter autoplay
    // policies even after a click, which is why start-scene videos stayed silent.
    const bgVideo = bgVideoRef.current;
    if (bgVideo) {
      bgVideo.muted = !soundOnRef.current;
      bgVideo.volume = audio.volumes.master;
      bgVideo.play().then(() => setSoundBlocked(false)).catch(() => {
        if (!bgVideo.error) setSoundBlocked(true);
      });
    }
    // Auto-narrate only on first visit. Repeated narration made backtracking feel
    // like the whole scene had reset. Title cards skip generated TTS, but an
    // explicitly attached prose MP3 is authored audio and should play.
    const shouldPlayProse =
      !revisit &&
      !restoring &&
      overlay?.type !== "instructions" &&
      autoNarrate &&
      shouldAutoNarrateSceneProse(scene);
    if (shouldPlayProse) {
      narrationTimerRef.current = window.setTimeout(() => playProse(scene), proseNarrationDelayMs(scene));
    } else if (primedNarrationRef.current) {
      // The primed opening clip is adopted only by playProse. If this entry is
      // not going to call it (restore, revisit, narration off, or an
      // instructions overlay), stop it here — otherwise it keeps playing over
      // the scene, exactly like the music primer is paused when unused.
      const leftover = primedNarrationRef.current;
      primedNarrationRef.current = null;
      try {
        leftover.el.pause();
      } catch {
        /* noop */
      }
    }
    let next = stateRef.current;
    // onEnter actions are first-entry actions. Reapplying rewards and meters on
    // every backtrack was a major source of progression farming.
    if (!revisit && !restoring) {
      scene.onEnterActions?.forEach((a) => {
        if (a.conditionRule && !meetsGating(a.conditionRule, next)) return;
        next = applyConsequences(story, a.consequences, next);
      });
    }
    // Compute "who you met" against the post-onEnter state, so a beat that only
    // unlocks because of a same-scene trust/flag bump still counts correctly.
    const metHere = (scene.dialogueBeats ?? [])
      .filter((beat) => meetsGating(beat.conditionRule, next))
      .map((beat) => beat.characterId);
    if (metHere.length) {
      setEncounteredCharacters((old) => {
        const nextSet = new Set(old);
        metHere.forEach((id) => nextSet.add(id));
        return nextSet;
      });
    }
    if (next !== stateRef.current) setState(next);
    if (!restoring && scene.isEnding && scene.endingData) {
      audio.stinger();
      recordEnding(story.id, {
        sceneId: scene.id,
        headline: scene.endingData.headline,
        tier: scene.endingData.tier,
        unlockedAt: Date.now(),
        episodeId,
      });
      // Reaching an ending inside a season closes the EPISODE: snapshot the
      // world state so the next chapter opens with these consequences already
      // in place, and hand control back to the season wrapper.
      if (episode && onEpisodeComplete) {
        const carrying = next;
        onEpisodeComplete(
          {
            episodeId: episode.id,
            endingSceneId: scene.id,
            endingHeadline: scene.endingData.headline,
            endingTier: scene.endingData.tier,
            completedAt: Date.now(),
            carry: {
              activeFlags: [...carrying.activeFlags],
              inventory: carrying.inventory.map((i) => i.id),
              meters: { ...carrying.meters },
              characterTrust: { ...carrying.characterTrust },
              memories: { ...carrying.memories },
            },
          },
          highlightsRef.current
        );
      }
    }
    // First-visit discoverability: nudge the player when a scene hides
    // collectible evidence behind its hotspots.
    if (
      !revisit &&
      !restoring &&
      scene.nodeType !== "credits" &&
      scene.nodeType !== "cutscene" &&
      (scene.hotspots ?? []).some((hs) => hs.action.type === "giveItem" && hs.action.itemGranted && meetsGating(hs.gating, next))
    ) {
      pushToast("🔍 Look around the scene — evidence is hidden in the picture.", "info");
    }
    if (revisit && !restoring) pushToast(`Revisited: ${scene.title}. Previous narration skipped.`, "info");
  }, [scene, sceneId, entrySeq, story, startSceneId, autoNarrate, overlay?.type, pushToast, goToScene, playProse, episode, episodeId, onEpisodeComplete, fadeOutAndStop, primedMusic]);

  // Heat bust — evaluated continuously, not just on scene arrival. Meter
  // gains from reply choices, pattern-puzzle outcomes and on-enter effects
  // don't navigate, and the old entry-time-only check let a player keep
  // exploring a scene they should already have been folded out of (with no
  // "Heat rising" feedback at all). The isEnding guard keeps it from racing
  // a choice that is simultaneously navigating to a victory ending: if
  // you're at an ending, the case is decided.
  useEffect(() => {
    if (!scene) return;
    const bust = heatBustTarget(story, state, sceneId, episode);
    if (!bust || heatBustFired.current || scene.isEnding) return;
    heatBustFired.current = true;
    audio.stinger();
    pushToast("Too much heat. The city closes in.", "fail");
    enteredRef.current = "";
    goToScene(bust);
  }, [state, scene, sceneId, story, episode, goToScene, pushToast]);

  /* -------- save / load slots -------- */
  const buildSave = useCallback((): GameSave => {
    return {
      storyId: story.id,
      // Where the seeded dice have got to. Absent (undefined) on an unseeded
      // run, so ordinary saves don't grow a field they can't use.
      rng: rngSnapshot() ?? undefined,
      episodeId,
      sceneId,
      sceneTitle: scene?.title ?? "",
      savedAt: Date.now(),
      activeFlags: [...state.activeFlags],
      inventory: state.inventory.map((i) => i.id),
      meters: { ...state.meters },
      characterTrust: { ...state.characterTrust },
      memories: { ...state.memories },
      proseAcknowledged,
      beatIdx,
      usedHotspots: [...usedHotspots],
      usedChoices: [...usedChoices],
      visitedScenes: [...visitedScenes],
      seenBeats: [...seenBeatIdsRef.current],
      journey,
      chartedUpTo,
      seenActs: [...seenActs.current],
      encounteredCharacters: [...encounteredCharacters],
      expiredChoices: [...expiredChoices],
      choiceClocks: { ...choiceClocks },
      composure: { ...iqComposure },
      steadied: { ...iqSteadied.current },
    };
  }, [story, episodeId, scene, sceneId, state, proseAcknowledged, beatIdx, usedHotspots, usedChoices, visitedScenes, encounteredCharacters, expiredChoices, choiceClocks, journey, chartedUpTo, iqComposure]);

  const restoreSave = useCallback(
    (save: GameSave) => {
      // A save can be older than the current schema, hand-edited, or truncated
      // by a storage quota error mid-write. Every field is therefore treated as
      // optional here: a missing array must degrade to empty, never throw —
      // an exception in this path unmounts the whole app and leaves the player
      // staring at a white screen with no way back to the menu.
      const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
      // A seeded run's POSITION is part of its world: put the dice back where
      // the snapshot took them, so resuming a slot (or ↺ Rewind, which restores
      // through this same path) continues the run instead of re-rolling it.
      // An unseeded or hand-edited save leaves the stream untouched.
      if (restoreRngSnapshot(save.rng)) {
        console.info(`[seed] resumed deterministic run — seed "${save.rng!.seed}" at draw ${save.rng!.draws}`);
      }
      const inv = arr(save.inventory)
        .map((id) => story.items.find((i) => i.id === id))
        .filter((i): i is Item => !!i);
      const restored: GlobalState = {
        activeFlags: new Set(arr(save.activeFlags)),
        inventory: inv,
        meters: Object.assign({ Sultry: 0, Aggressive: 0, Clever: 0, Suspicion: 0 }, save.meters ?? {}),
        characterTrust: { ...(save.characterTrust ?? {}) },
        memories: { ...(save.memories ?? {}) },
      };
      // Stage the save so the scene-entry pass applies it without clobbering.
      restoreRef.current = save;
      visitedRef.current = new Set(arr(save.visitedScenes));
      seenBeatIdsRef.current = new Set(arr(save.seenBeats));
      enteredRef.current = "";
      heatBustFired.current = false;
      craftHintShown.current = true;
      setState(restored);
      setUsedHotspots(new Set(arr(save.usedHotspots)));
      setUsedChoices(new Set(arr(save.usedChoices)));
      setVisitedScenes(new Set(arr(save.visitedScenes)));
      setEncounteredCharacters(new Set(arr(save.encounteredCharacters)));
      setExpiredChoices(new Set(arr(save.expiredChoices)));
      setChoiceClocks(save.choiceClocks ?? {});
      setIqComposure(save.composure && typeof save.composure === "object" ? { ...save.composure } : {});
      iqSteadied.current = save.steadied && typeof save.steadied === "object" ? { ...save.steadied } : {};
      setJourney(Array.isArray(save.journey) ? save.journey : []);
      setChartedUpTo(save.chartedUpTo ?? 0);
      seenActs.current = new Set(arr(save.seenActs));
      setPartBreak(null);
      setPendingAct(null);
      setActMap(null);
      setOverlay(null);
      // A scene id can vanish between releases (a cut or renamed scene). Fall
      // back to the story's opening rather than rendering an undefined scene.
      const target = story.scenes.some((sc) => sc.id === save.sceneId)
        ? save.sceneId
        : story.startSceneId;
      setSceneId(bypassedSceneId(story, target));
      setEntrySeq((s) => s + 1);
    },
    [story]
  );

  /* -------- rewind one decision --------
   * Snapshot BEFORE a decision commits, so ↺ Rewind restores the world as it
   * stood the instant before the player chose. This is deliberately NOT a
   * per-frame or per-line snapshot: one entry per decision, collapsed when a
   * decision doesn't actually move the world, capped at REWIND_LIMIT, and
   * refused at an ending (the run is decided there — see rewind.ts). */
  useEffect(() => {
    buildSaveRef.current = buildSave;
  });
  const snapshotDecision = useCallback(
    (label: string) => {
      const build = buildSaveRef.current;
      if (!build) return;
      const atEnding = !!sceneById(story, sceneIdRef.current)?.isEnding;
      setRewind((r) => pushRewind(r, build(), label, { isEnding: atEnding }));
    },
    [story]
  );
  const doRewindDecision = useCallback(() => {
    setRewind((r) => {
      const { stack, entry } = popRewind(r);
      if (!entry) return r;
      audio.stopSpeech();
      audio.click();
      restoreSave(entry.save);
      pushToast(`↺ Rewound: ${entry.label}`, "info");
      return stack;
    });
  }, [restoreSave, pushToast]);

  /* -------- playtest coverage --------
   * A running tally of what this case has actually exercised: every scene
   * entered and every choice picked, accumulated across playthroughs and
   * surfaced in Studio's ▶ Test tab (the static validator can only say what
   * is reachable — this says what you have really played). Pure telemetry:
   * nothing here is ever read back into the running game. */
  const coverageRef = useRef<PlaytestCoverage | null>(null);
  useEffect(() => {
    coverageRef.current = readCoverage(story.id) ?? emptyCoverage(story.id);
  }, [story.id]);
  const markCoverage = useCallback(
    (kind: "scene" | "choice" | "offer" | "marker" | "cutscene", id: string) => {
      if (!id) return;
      const next = recordVisit(coverageRef.current ?? emptyCoverage(story.id), kind, id);
      coverageRef.current = next;
      writeCoverage(next);
    },
    [story.id]
  );

  /* -------- automatic checkpoint --------
   * A snapshot is written to the invisible AUTO slot on every scene arrival,
   * after the entry state has settled. "▶ Resume" on the newsstand and the
   * Load screen's Auto row both read it, so closing the tab mid-case never
   * costs more than the current scene. Manual slots are never touched.
   *
   * Two hardenings on top of the arrival write:
   *  · THE WRITE REPORTS. A full or unavailable localStorage used to fail
   *    silently here (doSave tells the player; the checkpoint didn't), so
   *    "▶ Resume" quietly pointed at an older scene while the checkpoint
   *    indicator kept flashing "saved". It now warns once per case.
   *  · IT ALSO REFRESHES MID-SCENE, throttled. A long room's pickups, flags,
   *    replies and place in the dialogue used to be lost on a reload or a
   *    crash because the only write was on arrival — the player came back to
   *    the top of a conversation they had already finished. */
  const checkpointFailedRef = useRef(false);
  const lastCheckpointAtRef = useRef(Date.now());
  // A new case gets a fresh warning budget: storage freed up (or the next
  // story's saves are smaller) shouldn't be masked by the last case's failure.
  useEffect(() => {
    checkpointFailedRef.current = false;
    lastCheckpointAtRef.current = Date.now();
  }, [story.id]);
  const writeCheckpoint = useCallback(
    (opts?: { flash?: boolean; mirror?: boolean }) => {
      const snapshot = buildSave();
      lastCheckpointAtRef.current = Date.now();
      const ok = writeSave(AUTO_SLOT, snapshot);
      // Desktop: keep the .sreel mirror current. Only the arrival checkpoint
      // mirrors — a mid-scene refresh is a localStorage concern, and writing a
      // real file every few seconds would churn the disk for no gain.
      if (opts?.mirror) void writeSaveFile(AUTO_SLOT, snapshot);
      if (ok) {
        if (opts?.flash) setCheckpointFlash(true);
        return;
      }
      if (checkpointFailedRef.current) return;
      checkpointFailedRef.current = true;
      pushToast(
        "⚠ Checkpoint failed — browser storage is full or unavailable. Use Save (a manual slot) before relying on ▶ Resume.",
        "fail"
      );
    },
    [buildSave, pushToast]
  );
  useEffect(() => {
    if (!scene) return;
    // Coverage counts endings too — they are the most interesting scenes to
    // know you have (or have not) reached.
    markCoverage("scene", sceneId);
    if (scene.isEnding) {
      // The run is decided. Seal the rewind stack so an ending can never be
      // re-rolled by undoing your way back out of it (see rewind.ts).
      setRewind(sealRewind);
      const next = recordRun(coverageRef.current ?? emptyCoverage(story.id));
      coverageRef.current = next;
      writeCoverage(next);
    }
    if (scene.isEnding) return;
    const t = window.setTimeout(() => writeCheckpoint({ flash: true, mirror: true }), 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId, entrySeq, markCoverage]);

  /* Mid-scene checkpointing lives further down, beside the stranded detector:
   * a dead end must never be checkpointed, or "⤴ Last checkpoint" would restore
   * the very room the player is stuck in. See the effect after strandedShown. */

  useEffect(() => {
    if (!checkpointFlash) return;
    const t = window.setTimeout(() => setCheckpointFlash(false), 1400);
    return () => window.clearTimeout(t);
  }, [checkpointFlash]);

  const doSave = useCallback(
    async (slot: number) => {
      const snapshot = buildSave();
      if (!writeSave(slot, snapshot)) {
        pushToast("Save failed — browser storage unavailable.", "fail");
        audio.fail();
        return;
      }
      // On the desktop shell, mirror to a real .sreel file so the save is a
      // thing the player can find and keep, not just browser storage.
      const filePath = await writeSaveFile(slot, snapshot);
      audio.success();
      if (saveThenExitRef.current) {
        saveThenExitRef.current = false;
        audio.stopSpeech();
        audio.setAmbient(null);
        try { sceneAudioRef.current?.pause(); } catch {}
        if (primedMusic) try { primedMusic.el.pause(); } catch {}
        if (primedMusicRef.current) try { primedMusicRef.current.el.pause(); } catch {}
        fadingOutRef.current.forEach((el) => { try { el.pause(); } catch {} });
        fadingOutRef.current.clear();
        onExit();
        return;
      }
      pushToast(
        filePath ? `Saved to slot ${slot} · ${tailPath(filePath)}` : `Saved to slot ${slot}.`,
        "success"
      );
      setSaves(readSaves(story.id, episodeId));
      setOverlay(null);
    },
    [buildSave, story, episodeId, onExit, pushToast]
  );

  // Export the current state to a player-chosen .sreel file.
  const doExportSave = useCallback(async () => {
    const res = await exportSaveFile(buildSave());
    if (res.canceled) return;
    if (res.error) {
      pushToast(res.error, "fail");
      audio.fail();
      return;
    }
    pushToast(`Save exported to ${res.path ? tailPath(res.path) : "your files"}.`, "success");
  }, [buildSave, pushToast]);

  // Import a .sreel file the player picked and resume from it.
  const doImportSave = useCallback(async () => {
    const res = await importSaveFile();
    if (res.canceled) return;
    if (!res.save) {
      pushToast(res.error ?? "That file couldn't be read as a save.", "fail");
      audio.fail();
      return;
    }
    if (res.save.storyId !== story.id) {
      pushToast("That save is from a different story.", "fail");
      audio.fail();
      return;
    }
    restoreSave(res.save);
    pushToast(`Loaded save from ${res.path ? tailPath(res.path) : "file"}.`, "success");
    setOverlay(null);
  }, [story.id, restoreSave, pushToast]);

  // Native File menu (Save/Load/Export/Import/Open Saves Folder).
  useEffect(() => {
    const off = onFileMenu((action) => {
      if (action === "save") {
        setSaves(readSaves(story.id, episodeId));
        setOverlay({ type: "save" });
      } else if (action === "load") {
        setSaves(readSaves(story.id, episodeId));
        setOverlay({ type: "load" });
      } else if (action === "export-save") {
        void doExportSave();
      } else if (action === "import-save") {
        void doImportSave();
      } else if (action === "open-saves-dir") {
        void openSavesDir();
      }
    });
    return off;
  }, [story.id, episodeId, doExportSave, doImportSave]);

  const doLoad = useCallback(
    (slot: number) => {
      // Read the slot WITH its reason: "empty" and "written by a newer build"
      // and "belongs to another case" all used to arrive as the same null, so
      // the player was told a slot was empty while their save sat right there.
      const res = readSaveDetailed(story.id, slot, episodeId);
      if (!res.save) {
        pushToast(saveReadMessage(res, slot), "fail");
        audio.fail();
        return;
      }
      restoreSave(res.save);
      pushToast(`Loaded from slot ${slot}.`, "success");
    },
    [story, episodeId, restoreSave, pushToast]
  );

  // The stranded panel's "last checkpoint" escape: the invisible AUTO slot,
  // which every scene arrival (and every mid-scene refresh) keeps current.
  // Worded for the player — "slot 0" is an implementation detail.
  const resumeCheckpoint = useCallback(() => {
    const res = readSaveDetailed(story.id, AUTO_SLOT, episodeId);
    if (!res.save) {
      pushToast("No checkpoint to return to — this case hasn't reached a scene break yet.", "fail");
      audio.fail();
      return;
    }
    audio.stopSpeech();
    restoreSave(res.save);
    pushToast("⤴ Back to your last checkpoint.", "info");
  }, [story.id, episodeId, restoreSave, pushToast]);

  // Resume straight into a save slot (the newsstand "▶ Resume" path).
  useEffect(() => {
    if (resumeSlot === undefined) return;
    const save = readSave(story.id, resumeSlot, episodeId);
    if (save) restoreSave(save);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------- sound toggle (music, ambient, video cutscene audio) -------- */
  // Persist the mixer to the same settings key the main-menu Sound Booth uses,
  // so in-story volume changes carry back out to the menu and vice versa.
  const applyElementVolumes = useCallback(() => {
    // The scene-music element is a raw Audio() that bypasses the WebAudio
    // buses, so it must be multiplied by master manually.
    //
    // Skip it while a fade is running: the ramp owns .volume for its
    // duration, and writing full volume underneath it would make the fader
    // and the fade fight, producing an audible stutter. The ramp already
    // targets the live mixer value, so the new level lands when it settles.
    if (sceneAudioRef.current && !isFading(sceneAudioRef.current)) {
      sceneAudioRef.current.volume = audio.volumes.master * audio.volumes.music * (musicLevelRef.current ?? 1) * audio.duckFactor;
    }
    // Video cutscenes follow master only.
    if (bgVideoRef.current) bgVideoRef.current.volume = audio.volumes.master;
  }, []);

  // Sine-duck envelope: the scene music is a raw Audio element outside the
  // WebAudio buses, so the stepped duck factor is re-applied to the live
  // track as the half-sine ramp progresses (and on release). The per-scene
  // music level for the *current* track multiplies in too.
  useEffect(() => {
    audio.onDuckChange = () => {
      const a = sceneAudioRef.current;
      if (a && !isFading(a)) {
        const level = musicLevelRef.current ?? 1;
        a.volume = audio.volumes.master * audio.volumes.music * level * audio.duckFactor;
      }
    };
    return () => {
      audio.onDuckChange = null;
    };
  }, []);

  const changeVolume = useCallback((ch: MixChannel, v: number) => {
    const next = { ...audio.volumes, [ch]: v };
    audio.setVolume(ch, v);
    setVolumes(next);
    applyElementVolumes();
    try {
      const raw = localStorage.getItem("scarlet-reel-settings-v1");
      const parsed = raw ? JSON.parse(raw) : {};
      localStorage.setItem("scarlet-reel-settings-v1", JSON.stringify({ ...parsed, volumes: next }));
    } catch {
      /* storage unavailable — volume still applies for this session */
    }
  }, [applyElementVolumes]);

  const retryMusic = useCallback(() => {
    const a = sceneAudioRef.current;
    // a song that has played to its end (musicLoop: false) stays finished
    if (a && soundOnRef.current && a.paused && !a.ended) {
      a.play().then(() => setSoundBlocked(false)).catch(() => setSoundBlocked(true));
    }
    // Video cutscenes are blocked by autoplay policy more often than audio —
    // retry the video too on any gesture.
    const v = bgVideoRef.current;
    if (v && soundOnRef.current && v.paused) {
      v.muted = false;
      v.play().then(() => setSoundBlocked(false)).catch(() => setSoundBlocked(true));
    }
  }, []);

  const enableSound = useCallback(() => {
    setSoundOn(true);
    setSoundBlocked(false);
    audio.unlock();
    const a = sceneAudioRef.current;
    if (a && !a.ended) {
      a.muted = false;
      // Turning sound on mid-scene fades the track up instead of slamming it
      // in at full level.
      a.volume = 0;
      a.play()
        .then(() => {
          setSoundBlocked(false);
          setMusicPlaying(true);
          // Keep the voice duck in the target — re-enabling sound mid-dialogue
          // shouldn't slam the track up over a line that's still talking.
          fadeAudio(a, audio.volumes.master * audio.volumes.music * (musicLevelRef.current ?? 1) * audio.duckFactor, MUSIC_FADE_MS);
        })
        .catch(() => setSoundBlocked(true));
    }
    const v = bgVideoRef.current;
    if (v) {
      v.muted = false;
      v.volume = audio.volumes.master;
      v.play().catch(() => {});
    }
    if (scene) audio.setAmbient(scene.ambientAudio ?? null);
  }, [scene]);

  useEffect(() => {
    const a = sceneAudioRef.current;
    if (a) {
      a.muted = !soundOn;
      if (soundOn && !a.ended) {
        a.play()
          .then(() => setMusicPlaying(true))
          .catch(() => setMusicPlaying(false));
      } else {
        setMusicPlaying(false);
      }
    }
    const v = bgVideoRef.current;
    if (v) {
      v.muted = !soundOn;
      if (soundOn) v.play().catch(() => {});
    }
    if (!soundOn) audio.setAmbient(null);
    else if (scene) audio.setAmbient(scene.ambientAudio ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundOn]);

  // If the browser blocked video-with-sound autoplay (no music to report the
  // rejection), detect it shortly after the cutscene mounts and surface the
  // "tap for sound" affordance.
  useEffect(() => {
    const v = bgVideoRef.current;
    if (!v) return;
    const t = window.setTimeout(() => {
      if (v.paused && !v.muted && soundOnRef.current) {
        setSoundBlocked(true);
        pushToast("🔇 The browser blocked the video's sound — tap the speaker (bottom-right) to enable it.", "info");
      }
    }, 800);
    return () => window.clearTimeout(t);
  }, [sceneId, entrySeq, scene?.background, pushToast]);

  // Beats must re-evaluate when world state changes, otherwise a beat gated on a
  // flag set by onEnterActions (or a just-collected item) never renders. Gating
  // also reads meters and character trust, so those are part of the signature
  // too — otherwise a trust/meter-gated reply beat never appears mid-scene.
  const beatsSignature = useMemo(
    () =>
      `${[...state.activeFlags].sort().join(",")}|${state.inventory.map((i) => i.id).sort().join(",")}|${Object.entries(state.meters).sort().map(([k, v]) => `${k}:${v}`).join(",")}|${Object.entries(state.characterTrust).sort().map(([k, v]) => `${k}:${v}`).join(",")}|${Object.keys(state.memories).sort().join(",")}`,
    [state.activeFlags, state.inventory, state.meters, state.characterTrust, state.memories]
  );
  const visibleBeats = useMemo(() => {
    if (!scene?.dialogueBeats && !scene?.interrogation) return [];
    const beats = [...(scene.dialogueBeats ?? [])];
    // The interrogation's broke / clamped beats join the queue the moment
    // their flag is set — the crack plays as the next line of the
    // conversation, no special scene cut needed.
    const q = scene.interrogation;
    if (q) {
      if (stateRef.current.activeFlags.has(q.brokeFlag)) beats.push(q.brokeBeat);
      if (q.clampFlag && q.clampedBeat && stateRef.current.activeFlags.has(q.clampFlag)) beats.push(q.clampedBeat);
    }
    const visible = beats.filter((b) => meetsGating(b.conditionRule, stateRef.current));
    // A broken lie's caught beat plays immediately AFTER the claim beat it
    // answers. It's authored on beat.lie.caughtBeat (and gated on the caught
    // flag, so it only appears once the player presents the right evidence),
    // so splice it in right after its claim beat rather than letting its
    // authored position in the queue decide.
    const out: DialogueBeat[] = [];
    for (const b of visible) {
      out.push(b);
      if (b.lie && stateRef.current.activeFlags.has(b.lie.contradictedFlag)) {
        out.push(b.lie.caughtBeat);
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, entrySeq, sceneId, beatsSignature]);

  /* Beats the player has played: everything the cursor has moved past is
   * remembered by id (story-wide, saved). Idempotent set-adds, so the queue
   * reordering (a gated beat surfacing later) never un-marks a seen line. */
  useEffect(() => {
    if (beatIdx <= 0) return;
    for (let i = 0; i < Math.min(beatIdx, visibleBeats.length); i++) {
      const b = visibleBeats[i];
      if (b?.id) seenBeatIdsRef.current.add(b.id);
    }
  }, [beatIdx, visibleBeats]);



  /* -------- cinematic hold countdown -------- */
  useEffect(() => {
    if (holdRemaining <= 0) return;
    const t = window.setTimeout(() => setHoldRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [holdRemaining]);

  /* -------- dialogue panel theme -------- */
  // Story-wide look for the bottom panel. The reserved height is the part
  // that matters mechanically: it stops the panel resizing as text types and
  // therefore stops the inline controls drifting under the player's cursor.
  const dialogueTheme = story.dialogueBox;
  const reservedProse = useMemo(() => reservedProseHeight(dialogueTheme), [dialogueTheme]);
  /* The panel's final height, computed from the LONGEST text this scene can
   * show (prose + every beat, including memory-recall variants). The full
   * text is rendered as an invisible sizer under the typed output, so the
   * box reaches its final height at the FIRST character of the scene and
   * never moves again — not while a line types, not between beats, not when
   * the choices arrive. Works at any width/font because it measures the real
   * text instead of estimating lines from character counts. */
  const panelSizerText = useMemo(() => {
    if (!scene || scene.nodeType === "credits" || scene.nodeType === "cutscene") return "";
    let longest = scene.prose ?? "";
    (scene.dialogueBeats ?? []).forEach((b) => {
      if (b.text.length > longest.length) longest = b.text;
      Object.values(b.recalls ?? {}).forEach((line) => {
        if (line.length > longest.length) longest = line;
      });
    });
    return longest;
  }, [scene]);
  // Only the standard bottom-anchored node needs its continue slot held open.
  // Credits and cutscene nodes are vertically centred, so a late button grows
  // the box symmetrically instead of shunting the controls.
  const reserveContinueSlot =
    !!reservedProse && scene?.nodeType !== "credits" && scene?.nodeType !== "cutscene";
  // A standard node with no prose has nothing to acknowledge, so its
  // "continue to dialogue" button must not render (the entry effect also drops
  // the player straight into the beats).
  const emptyProseScene =
    !!scene &&
    scene.nodeType !== "credits" &&
    scene.nodeType !== "cutscene" &&
    !(scene.prose ?? "").trim();

  /* -------- beats advancement -------- */
  const holdActive = holdRemaining > 0;
  const sceneReady = proseAcknowledged && !holdActive;
  const inBeats = proseAcknowledged && beatIdx < visibleBeats.length;
  const interactive = sceneReady && !inBeats;
  // An authored epilogue is still part of the story. The summary used to
  // cover it as soon as the prose finished, making every ending beat (and
  // its memory recall / recorded cue) unreadable. Prose-only endings retain
  // their original immediate-summary behavior.
  const endingReady = proseDone && (visibleBeats.length === 0 || (proseAcknowledged && !inBeats));
  const hasAuthoredRoute = !!scene?.autoAdvanceTargetSceneId && story.scenes.some((candidate) => candidate.id === scene.autoAdvanceTargetSceneId);
  // The authored route only plays itself while auto-continue is on; credits keep their own roll.
  const hasValidAutoAdvance = hasAuthoredRoute && (autoContinue || scene?.nodeType === "credits");
  // What the ⏩ button shows and switches: the authored reading where a scene has one, else the player's own auto-forward.
  const autoOn = hasAuthoredRoute ? autoContinue : autoAdvance;
  const toggleAuto = () => (hasAuthoredRoute ? setAutoContinue((v) => !v) : setAutoAdvance((v) => !v));
  const currentBeat = inBeats ? visibleBeats[beatIdx] : null;
  /* The insert shot to actually display on the current beat. A beat's own
   * replacement image PERSISTS by default: it stays up through later beats
   * (the characters keep talking over it) until another beat sets a new
   * image or any beat ends the insert. backgroundHold=false makes an image
   * last only its own beat; backgroundRevert=true drops back to the scene
   * plate. We walk the visible beats up to and including the current one to
   * find the active held insert. */
  const heldInsert = useMemo(() => {
    if (!inBeats) return null;
    let held: DialogueBeat | null = null;
    for (let i = 0; i <= beatIdx && i < visibleBeats.length; i += 1) {
      const b = visibleBeats[i];
      if (b.backgroundRevert) {
        held = null; // explicit drop back to the scene plate
      } else if (b.background) {
        held = b; // this beat sets (or replaces) the held insert
      } else if (held && held.backgroundHold === false) {
        held = null; // a one-beat-only insert expires on the next beat
      }
    }
    return held;
  }, [inBeats, beatIdx, visibleBeats]);
  // Effective text with memory recall substitution — an NPC echoing what you
  // said, not just a flag-gated generic line.
  const currentBeatText = currentBeat
    ? resolveBeatText(currentBeat, state.memories, state.activeFlags, story.flagNotes)
    : "";
  // Animatic mode draws its own captions (the reading panel is hidden) and reports them, with each scene change, to the
  // exporter on window.__animatic.
  const animaticCaption = ANIMATIC
    ? captionFor(ANIMATIC, scene, !proseAcknowledged, currentBeat, currentBeatText, currentBeat ? story.characters.find((c) => c.id === currentBeat.characterId)?.name : undefined)
    : null;
  useEffect(() => {
    if (ANIMATIC) noteCaption(animaticCaption, scene?.id, currentBeat?.id);
  });
  // In a browser the animatic ends on a black card once it leaves the chosen scenes (or reaches the ending), with the
  // sound stopped; the exporter stops filming before that frame.
  const [animaticOver, setAnimaticOver] = useState(false);
  useEffect(() => {
    if (!ANIMATIC || !scene) return;
    noteScene(scene);
    if (!window.__animatic?.done || window.__animaticAutostart) return;
    setAnimaticOver(true);
    audio.stopSpeech();
    audio.stopSfx();
    audio.setAmbient(null);
    try { sceneAudioRef.current?.pause(); } catch { /* none playing */ }
  }, [scene]);

  // Press-the-lie state for the beat on screen: the lie exists, it isn't
  // already broken, and the player still has wrong-guess chances left.
  const currentLie = beatLie(currentBeat);
  const currentLieBroken = !!(currentLie && state.activeFlags.has(currentLie.contradictedFlag));
  const currentLieWrongCount = currentBeat ? lieWrong[currentBeat.id] ?? 0 : 0;
  const currentLieShut = !!currentLie && !lieCanStillPress(currentLie, currentLieWrongCount);
  const canPressLie = !!currentBeat && beatDone && !!currentLie && !currentLieBroken && !currentLieShut;
  const currentLieWrongShown =
    lieBluff && currentBeat && lieBluff.beatId === currentBeat.id ? lieBluff.text : null;

  // noTypewriter scenes show their prose instantly; the dialogue must match.
  // Otherwise the first line types out behind a "skip" control and reads as a
  // phantom extra "continue" right after the prose button. Mark each beat done
  // the moment it becomes current so the line is fully shown and a single
  // click advances.
  useEffect(() => {
    if (scene?.noTypewriter) setBeatDone(true);
  }, [scene?.noTypewriter, currentBeat?.id]);

  /* ---- after-beat routing: an insert shot that ends the scene ----
   * A beat can carry afterBeatTargetSceneId so that when the LAST visible
   * beat finishes, instead of reverting to the scene plate and showing the
   * choices, the player routes straight to another scene — the replacement
   * background crossfades into the new scene with no cut back to the plate.
   * Mode: "auto" routes on a timer once the line is done; "continue" waits
   * for the ▸ Continue / Space press. */
  const beatRouteTarget = useMemo(() => {
    // The route fires only from the LAST visible beat of the queue — the one
    // the player dismisses when the dialogue runs out. (An earlier beat with
    // routing is simply overridden by whichever beat is actually last; the
    // validator warns if a non-final beat carries one so it's not a surprise.)
    const last = visibleBeats[visibleBeats.length - 1];
    return last?.afterBeatTargetSceneId ?? null;
  }, [visibleBeats]);
  const routingBeat = visibleBeats.length ? visibleBeats[visibleBeats.length - 1] : null;
  const beatRouteValid = !!beatRouteTarget && story.scenes.some((s) => s.id === beatRouteTarget);
  const beatRouteMode = routingBeat?.afterBeatMode === "continue" ? "continue" : "auto";
  const beatRouteDelay = Math.max(0, Math.min(600, routingBeat?.afterBeatDelaySeconds ?? 1.6));
  // The player is ON the final beat that routes into another scene — used to
  // suppress skip/back/timer chrome over the insert even while typing.
  const onRoutingBeat = beatRouteValid && !!currentBeat && currentBeat === routingBeat;

  /* -------- conversation timers: cutting in over the last line --------
   * INTERRUPTIBLE DIALOGUE (opt-in per scene) surfaces the replies over the
   * FINAL line instead of waiting for it to finish, so a `timeLimitSeconds`
   * clock is already running while the speaker is still talking — the Wolf
   * Among Us pressure. Everything else about the scene is unchanged: hotspots,
   * the stage floor and the keyboard's scene verbs still wait for `interactive`,
   * so a cut-in can only ever pick a reply, never wander the room mid-line.
   * An after-beat cut on that line owns the exit (`onRoutingBeat`), so choices
   * never surface over a scene that has already decided where it's going. */
  const cutInLive = interruptibleNow({
    scene,
    visibleBeatCount: visibleBeats.length,
    beatIdx,
    proseAcknowledged,
    onRoutingBeat,
    busy:
      menuOpen || mixerOpen || inventoryModalOpen || !!overlay || !!patternPuzzle || !!esperModal ||
      !!vkModal || !!partBreak || !!actMap || !!pendingAct || fading,
  });
  /** The choice rail is on screen: normally after the conversation, or over
   *  the last line when the scene is interruptible. */
  const choicesLive = interactive || cutInLive;
  // Routing is live once that line has finished typing (the timer counts from
  // when they've read it).
  const beatRouteReady = onRoutingBeat && beatDone;
  // Auto beat-route countdown (timer only; the HUD is hidden for the cut).
  const [, setBeatRouteRemaining] = useState(0);

  /* -------- dialogue log --------
   * Every spoken line of the run — prose and beats, with speakers — is
   * appended as it plays, so the L key / menu button can show exactly what
   * was said (and skipped text still lands in the record). A keyed set keeps
   * each line logged exactly once per scene entry even under double-invoked
   * effects. */
  const [dialogueLog, setDialogueLog] = useState<{ speaker: string; text: string }[]>([]);
  const loggedLinesRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!scene || scene.nodeType === "credits" || scene.nodeType === "cutscene") return;
    const key = `${sceneId}#${entrySeq}#prose`;
    if (scene.prose && !loggedLinesRef.current.has(key)) {
      loggedLinesRef.current.add(key);
      setDialogueLog((l) => [...l.slice(-199), { speaker: "", text: scene.prose }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId, entrySeq, scene?.prose]);
  useEffect(() => {
    if (!currentBeat) return;
    const key = `${sceneId}#${entrySeq}#${currentBeat.id}`;
    if (!loggedLinesRef.current.has(key)) {
      loggedLinesRef.current.add(key);
      const speaker =
        currentBeat.characterId === "narrator"
          ? "Narrator"
          : story.characters.find((c) => c.id === currentBeat.characterId)?.name ?? "—";
      setDialogueLog((l) => [...l.slice(-199), { speaker, text: currentBeatText }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId, entrySeq, currentBeat?.id]);

  const advanceBeat = useCallback(() => {
    if (!inBeats) return;
    if (!beatDone) {
      setBeatDone(true);
      return;
    }
    // Last beat with an after-beat route: dismissing it cuts straight to the
    // next scene, so the insert background never reverts to the plate.
    if (currentBeat === routingBeat && beatRouteValid) {
      audio.click();
      setBeatRouteRemaining(0);
      audio.stopSpeech();
      // leaveFor is declared below as a useCallback; it's stable enough that
      // the ref indirection avoids a TDZ reference at render time.
      leaveForRef.current?.(beatRouteTarget as string, scene?.partBreak);
      return;
    }
    audio.click();
    setBeatDone(false);
    setBeatIdx((i) => i + 1);
  }, [inBeats, beatDone, currentBeat, routingBeat, beatRouteValid, beatRouteTarget, scene?.partBreak]);

  // Rewind the scene's dialogue only — never into a previous scene. From the
  // choices it returns to the final line (shown instantly); from a beat it steps
  // back one line; from the first line — or a prose-only scene — it returns to
  // the opening prose, which is the start of the scene.
  const goBack = useCallback(() => {
    if (!proseAcknowledged) return; // already at the scene start
    audio.click();
    if (inBeats && beatIdx > 0) {
      setBeatDone(true); // show the previous line fully, no re-type
      setBeatIdx((i) => i - 1);
      return;
    }
    if (inBeats) {
      audio.stopSpeech();
      setBeatDone(false);
      setProseAcknowledged(false);
      return;
    }
    if (visibleBeats.length > 0) {
      setBeatDone(true);
      setBeatIdx(visibleBeats.length - 1);
    } else {
      audio.stopSpeech();
      setProseAcknowledged(false);
    }
  }, [proseAcknowledged, inBeats, beatIdx, visibleBeats.length]);

  // Jump straight back to the start of the current scene (the opening prose),
  // resetting the dialogue so it replays from the first line on continue.
  const goToSceneStart = useCallback(() => {
    if (!proseAcknowledged) return;
    audio.click();
    audio.stopSpeech();
    setBeatDone(false);
    setBeatIdx(0);
    setProseAcknowledged(false);
  }, [proseAcknowledged]);

  // Both rewind controls have somewhere to go once the opening prose has been
  // acknowledged; while the prose itself is showing there is nothing further
  // back within this scene.
  const canRewind = proseAcknowledged;

  /** ↺ Rewind (a whole decision, across scenes) is a different control from
   *  ◂ Back (one line, within the scene). It is live whenever the stack holds
   *  a decision and the run hasn't been sealed by an ending. */
  const canUndoDecision = canRewindDecision(rewind);
  const undoLabel = rewindLabel(rewind) ?? "the last decision";

  /* -------- stranded: nothing left to do here --------
   * The decision surface — the exact one the playthrough bot walks — says what
   * can still happen. When it comes back empty on a scene that isn't an
   * ending, the player is standing in a dead end: every exit consumed, every
   * reply spent, no auto-advance coming. The screen used to just sit there
   * while they clicked the background hoping something would fire. Now the
   * engine says so and offers the three real ways out.
   * Deliberately conservative — exempt scenes (credits, cutscenes, first-person
   * rooms) and busy moments are listed in stranded.ts, and the panel only
   * appears after STRANDED_GRACE_MS of the world staying empty, so a scene
   * that is about to carry the player onward never flashes it. */
  const strandedBusy =
    !!overlay || menuOpen || mixerOpen || !!partBreak || !!actMap || !!pendingAct ||
    !!patternPuzzle || !!esperModal || !!vkModal || !!arcadeGame || !!rideChoice || !!pressLieBeat ||
    holdRemaining > 0 || !proseAcknowledged;
  const strandedVerdict = useMemo(
    () =>
      strandedNow(
        story,
        simFromRuntime({
          sceneId,
          state,
          usedChoices,
          usedHotspots,
          visitedScenes,
          expiredChoices,
          composure: iqComposure,
          encounteredCharacters,
          lieWrongCounts: lieWrong,
        }),
        { scene, busy: strandedBusy, inBeats, episode }
      ),
    [story, scene, sceneId, state, usedChoices, usedHotspots, visitedScenes, expiredChoices, iqComposure, encounteredCharacters, lieWrong, strandedBusy, inBeats, episode]
  );
  const [strandedShown, setStrandedShown] = useState(false);
  const [strandedDismissed, setStrandedDismissed] = useState(false);
  // A new scene (or a rewind into one) is a fresh question: clear the panel and
  // the dismissal, so the next dead end gets its own warning.
  useEffect(() => {
    setStrandedShown(false);
    setStrandedDismissed(false);
  }, [sceneId, entrySeq]);
  useEffect(() => {
    // sceneReady, not interactive: `interactive` is false while WALKING a stage
    // room, and a stage whose markers are all spent is the dead end this exists
    // for. The verdict itself already exempts everything the decision surface
    // can't see (stranded.ts).
    if (!strandedVerdict.stranded || strandedBusy || !sceneReady || inBeats) {
      setStrandedShown(false);
      return;
    }
    const t = window.setTimeout(() => setStrandedShown(true), STRANDED_GRACE_MS);
    return () => window.clearTimeout(t);
  }, [strandedVerdict, strandedBusy, sceneReady, inBeats]);

  /* -------- mid-scene checkpoint --------
   * Any real movement of the world (a line read, a flag set, a marker spent, a
   * meter moved) re-arms a throttled write, so a reload or a crash costs the
   * last few lines instead of the whole scene. It waits for a lull of at least
   * CHECKPOINT_QUIET_MS and never writes more often than CHECKPOINT_MIN_GAP_MS,
   * so a fast reader doesn't turn into a stream of localStorage writes.
   *
   * Two things it never writes: an ENDING (the AUTO slot keeps holding the
   * moment before the case closed, exactly as before) and a DEAD END — the
   * arrival checkpoint is the escape the stranded panel offers, so refreshing
   * it with the spent world would poison the one recovery that always works. */
  useEffect(() => {
    if (!scene || scene.isEnding || strandedVerdict.stranded) return;
    const since = Date.now() - lastCheckpointAtRef.current;
    const wait = Math.max(CHECKPOINT_QUIET_MS, CHECKPOINT_MIN_GAP_MS - since);
    const t = window.setTimeout(() => writeCheckpoint({}), wait);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId, entrySeq, scene?.isEnding, state, usedChoices, usedHotspots, beatIdx, proseAcknowledged, strandedVerdict.stranded]);

  const skipCurrentText = useCallback(() => {
    audio.click();
    audio.stopSpeech();
    if (!proseDone) {
      setProseDone(true);
      return;
    }
    if (!proseAcknowledged) {
      setProseAcknowledged(true);
      return;
    }
    if (inBeats && !beatDone) {
      setBeatDone(true);
      return;
    }
    if (inBeats && beatDone) {
      if (onRoutingBeat) { advanceBeat(); return; }
      // Skip the current beat only — advance to the next one, not past all of
      // them. Previously this jumped beatIdx to the end, silently swallowing
      // every remaining line of dialogue.
      setBeatDone(false);
      setBeatIdx((i) => i + 1);
    }
  }, [proseDone, proseAcknowledged, inBeats, beatDone, onRoutingBeat, advanceBeat]);

  /* -------- auto-forward reader --------
   * Drives the dialogue forward with no input: the typewriter runs, the line
   * holds long enough to read, then the next beat starts. It stops at choices,
   * so the player still decides. A scene-level auto-route opts into the same
   * reader, so a prose-only cutscene can move on without the player pressing
   * Continue first. Manual clicks win: each advance changes state, which
   * cancels the pending timer and re-arms it for the next line, so the two
   * never double-advance.
   *
   * There is exactly ONE pacing toggle now. The old ⏭ skip fast-forward was a
   * second copy of this loop with its own "only skip what you've already seen"
   * bookkeeping, and the two fought over the same timers — it is gone, along
   * with its state, its buttons and its HUD chip. */
  useEffect(() => {
    // Runs when the player has ⏩ auto-forward on, or when the scene has an
    // authored auto-route and so has to play itself.
    if (!autoAdvance && !hasValidAutoAdvance) return;
    if (hasAuthoredRoute && !autoContinue && !autoAdvance) return;
    if (!scene || scene.isEnding) return;
    // A credits node paces itself — the roll owns the whole scene, and this
    // reader used to acknowledge its prose 0.9s after the roll ended, tearing
    // the sequence off screen and leaving a bare panel behind.
    if (isCredits) return;
    if (overlay || menuOpen || holdActive) return;
    if (!proseAcknowledged) {
      // Let the typewriter run, then hold a beat before the panel advances.
      if (!proseDone) return;
      const t = window.setTimeout(() => {
        // The typewriter finishing says nothing about whether the narrator has
        // finished READING. Cutting speech here truncated every long scene
        // opener and all three endings (the gold ending narrates ~30s).
        // Advance the panel, but let the voice run; a new beat or a scene
        // change stops it properly.
        audio.stopSpeechIfIdle();
        setProseAcknowledged(true);
      }, ANIMATIC ? ((scene.prose ?? "").trim() ? Math.round(headingSeconds(scene.prose ?? "", ANIMATIC.pace) * 1000) : 0) : 900);
      return () => window.clearTimeout(t);
    }
    if (inBeats) {
      if (!beatDone) return;
      // On the routing beat, the after-beat timer owns the cut — don't
      // advance the queue (which would revert the insert background) and
      // let the beat-route timer fire the leave.
      if (currentBeat === routingBeat && beatRouteValid) return;
      // The spoken line is usually longer than the subtitle's typed dwell, so
      // a fixed timer chopped the narration in half. Hold a short reading beat
      // after the text lands, then wait for the voice to actually finish
      // before the next line starts (capped so a stuck clip can't stall us).
      const startedAt = Date.now();
      // An animatic holds a silent line for its reading time and a spoken one until a moment after its voice ends.
      const spoken = !!currentBeat?.audioUrl;
      const hold = ANIMATIC ? (spoken ? 0 : readingSeconds(currentBeatText, ANIMATIC.pace * (scene?.animaticReadPace ?? 1)) * 1000) : 1150;
      let quietSince = 0;
      const iv = window.setInterval(() => {
        const now = Date.now();
        const elapsed = now - startedAt;
        const voiceDone = !audio.speechActive();
        if (!voiceDone) quietSince = 0;
        else if (!quietSince) quietSince = now;
        const settled = voiceDone && (!ANIMATIC || !spoken || now - quietSince >= AFTER_VOICE_SECONDS * 1000);
        if ((settled && elapsed >= hold) || elapsed > 45000) {
          window.clearInterval(iv);
          setBeatDone(false);
          setBeatIdx((i) => i + 1);
        }
      }, ANIMATIC ? 100 : 250); // an animatic checks more often, so its lines do not wait on the poll
      return () => window.clearInterval(iv);
    }
    // Choices are up — hands off until the player picks.
  }, [
    autoAdvance,
    hasValidAutoAdvance,
    hasAuthoredRoute,
    autoContinue,
    scene,
    isCredits,
    overlay,
    menuOpen,
    holdActive,
    proseAcknowledged,
    proseDone,
    inBeats,
    beatDone, currentBeat, currentBeatText, routingBeat, beatRouteValid,
  ]);

  const speakLine = useCallback(
    (beat: { text: string; characterId: string; audioUrl?: string; silent?: boolean }, textOverride?: string) => {
      // Recorded cues are sound effects as often as they are spoken lines.
      // Play the clip even when the authored beat is marked silent so a
      // silent text beat can still fire a gunshot, door slam, or other cue.
      if (beat.audioUrl) {
        audio.playClip(beat.audioUrl);
        return;
      }
      if (beat.silent) return; // no narration at all
      const ch = story.characters.find((c) => c.id === beat.characterId);
      audio.speak(textOverride ?? beat.text, beat.characterId, ch?.voice);
    },
    [story]
  );

  useEffect(() => {
    // Audio beats are intentional sound design and must not depend on the
    // player's Web Speech narration toggle. This also lets a textless beat
    // trigger a recorded cue as it enters the queue.
    if (currentBeat?.audioUrl || (autoNarrate && currentBeat && currentBeatText)) {
      const t = window.setTimeout(() => speakLine(currentBeat, currentBeatText), 220);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoNarrate, currentBeat, currentBeatText]);

  // Effects ride the beat: fired once as it enters, on the sfx bus, alongside any voice line.
  useEffect(() => {
    if (currentBeat?.sfxUrl) audio.playSfx(currentBeat.sfxUrl, currentBeat.sfxVolume ?? 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBeat?.id]);

  /* -------- choices -------- */
  const availableChoices = useMemo(() => {
    if (!scene?.choices) return [];
    // Travel-map absorption (opt-in): pure travel choices an unlocked pin
    // duplicates disappear from the rail — the "🗺 Open the map" action
    // below stands in for all of them.
    const absorbed = mapReplacedChoiceIds(story, scene, state);
    return scene.choices.filter((c) => {
      if (absorbed.has(c.id)) return false;
      if (expiredChoices.has(c.id)) return false;
      if (!choiceRepeats(c) && usedChoices.has(`${sceneId}:${c.id}`)) return false;
      // "hidden" choices stay invisible until their gate is met (sequential
      // dialogue), rather than rendering as a disabled hint. The effective
      // gate includes the item a present-item choice shows, so "show the
      // photograph" stays hidden until you actually hold the photograph.
      if (c.hidden && !meetsGating(effectiveChoiceGating(c), state)) return false;
      return true;
    });
  }, [scene, sceneId, expiredChoices, usedChoices, state, story]);
  const travelViaMap = useMemo(
    () => (scene && interactive && !scene.isEnding ? mapReplacedChoiceIds(story, scene, state).size : 0),
    [scene, interactive, story, state]
  );

  const hasUsableChoice = availableChoices.some((c) => meetsGating(effectiveChoiceGating(c), state) && (c.reply || !!c.targetSceneId));

  /* -------- choice offers (pick-rate telemetry) --------
   * Every time a PICKABLE choice is presented in the rail it counts one
   * offer, so Studio's coverage panel can show a per-choice pick rate: a
   * choice shown over and over but never taken is wasted writing, or a
   * wording that doesn't match its consequence. Locked (gated) choices are
   * deliberately NOT offers — being shown-but-disabled is not a real chance
   * to take it. The ref-diff makes offers idempotent across re-renders and
   * counts a choice again when it genuinely re-enters the rail. */
  const offeredChoicesRef = useRef<Set<string>>(new Set());
  // A new case is a fresh session: the last story's offered set must not
  // swallow a first offer in this one just because a scene/choice id matches.
  useEffect(() => {
    offeredChoicesRef.current = new Set();
  }, [story.id]);
  useEffect(() => {
    if (!scene || scene.isEnding || !interactive) return;
    const offered = new Set<string>();
    for (const c of availableChoices) {
      if (!meetsGating(effectiveChoiceGating(c), state)) continue;
      offered.add(`${sceneId}:${c.id}`);
    }
    const prev = offeredChoicesRef.current;
    for (const key of offered) {
      if (!prev.has(key)) markCoverage("offer", key);
    }
    offeredChoicesRef.current = offered;
  }, [scene, sceneId, interactive, availableChoices, state, markCoverage]);

  /* -------- quick-time prompt state (reactive) -------- */
  // A quick-time prompt is live while at least one QTE choice is still on the
  // table and its clock hasn't been picked or expired.
  const qteActive = availableChoices.some((c) => c.quickTime && c.timeLimitSeconds);

  /* -------- next-room media lookahead --------
   * Not gated on `interactive`: do the cheap work WHILE the current line
   * plays, including walking exits, note bypasses and deterministic cuts. */
  useEffect(() => {
    if (!scene || !shouldPreloadMedia()) return;
    const plan = nextSceneMediaPlan({
      story, scene, state, beats: visibleBeats, beatIndex: inBeats ? beatIdx : -1,
      usedChoices, usedHotspots, expiredChoices,
      visitedScenes: visitedRef.current, seenBeatIds: seenBeatIdsRef.current,
    });
    plan.images.forEach((url) => { void mediaPreloader.warmImage(url); });
    plan.audio.forEach((url) => { void mediaPreloader.warmAudio(url); });
  }, [story, scene, state, visibleBeats, inBeats, beatIdx, usedChoices, usedHotspots, expiredChoices]);
  // Once any QTE choice with qteShakyCam dips below ~30% remaining, swap the
  // scene's cinematic to SHAKY CAM for the duration of the choice option.
  const qtShakyRaw = availableChoices.some(
    (c) =>
      c.quickTime &&
      c.qteShakyCam &&
      c.timeLimitSeconds &&
      (choiceClocks[c.id] ?? c.timeLimitSeconds) / c.timeLimitSeconds <= 0.3
  );
  // Reduced motion: never swap to shaky cam — the plate stays still instead.
  const qtShaky = prefersReducedMotion ? false : qtShakyRaw;
  // The background cinematic used while a QTE is active. When the clock runs low
  // and qteShakyCam is on, we override to SHAKY CAM regardless of whether the
  // scene already has a base cinematic (otherwise the swap does nothing on a
  // scene with no cinematic configured).
  const bgCinematicBase = qtShaky ? { ...(scene?.cinematic ?? {}), mode: "shake" as const } : scene?.cinematic;
  /* STAGE rooms: the walker, interaction markers and the painted walk path
   * are anchored to the PLATE BOX, so the room art must sit perfectly still.
   * Any cinematic that moves the plate — the default pan push-in (zoom to
   * 1.22 while drifting), zoom-hold, dolly, shake, pointer parallax — slides
   * the art out from under the authored path (the Studio plate previews the
   * same room STATIC, which is why the painted path lined up there but not
   * in play). Pin stage backgrounds to static and strip parallax; colour
   * grade, lights, dim and letterbox still apply (they don't move pixels).
   * Talk-zoom stays aligned separately — the stage world wrapper shares the
   * plate's transform. */
  const bgCinematic: CinematicSettings | undefined =
    scene?.nodeType === "stage"
      ? { ...(bgCinematicBase ?? {}), mode: "static", parallaxDepth: undefined, parallaxLayers: undefined }
      : bgCinematicBase;
  // Parallax follows the pointer across the stage; enabled when the plate or
  // the currently showing insert-shot beat carries depth settings.
  const beatCinematic = inBeats ? currentBeat?.cinematic : undefined;
  const parallaxOn = hasParallax(bgCinematic) || hasParallax(beatCinematic);
  const parallaxCinematic = hasParallax(beatCinematic) ? beatCinematic : bgCinematic;
  useParallaxTracker(stageRef, parallaxOn, prefersReducedMotion);

  // Keep the latest closure values for the timer's interval callback so it never
  // reads a stale `scene`, `availableChoices`, or `choiceClocks` (which is what
  // made the heartbeat/shaky-cam and expiry checks unreliable).
  const qtSceneRef = useRef(scene);
  qtSceneRef.current = scene;
  const qtChoicesRef = useRef(availableChoices);
  qtChoicesRef.current = availableChoices;
  const qtClocksRef = useRef(choiceClocks);
  qtClocksRef.current = choiceClocks;
  const prefersReducedMotionRef = useRef(prefersReducedMotion);
  prefersReducedMotionRef.current = prefersReducedMotion;

  // Modal panels and scene fades pause time, including save/help opened
  // from the menu. No unseen choice may expire behind another activity.
  const choiceClockPaused = menuOpen || mixerOpen || inventoryModalOpen || !!overlay || !!patternPuzzle || !!esperModal || !!vkModal || !!partBreak || !!actMap || !!pendingAct || fading;
  // timers for timed choices
  useEffect(() => {
    // The menu pauses the clock: a player weighing a save or quit shouldn't
    // be routed down the "you hesitated" path while the screen is behind a
    // panel. The counts live in choiceClocks, so closing the menu resumes
    // from where the pause left off instead of restarting.
    if (!choicesLive || choiceClockPaused) return;
    const timed = availableChoices.filter((c) => c.timeLimitSeconds);
    if (!timed.length) return;
    setChoiceClocks((prev) => {
      const next = { ...prev };
      timed.forEach((c) => {
        if (next[c.id] === undefined) next[c.id] = c.timeLimitSeconds!;
      });
      return next;
    });
    const iv = window.setInterval(() => {
      // 1) Decrement the live clocks and collect expiries exactly once.
      const expiredNow: string[] = [];
      // Never collect expiries inside a React state updater: React may run
      // it AFTER this callback (or twice in StrictMode). That lost the expiry
      // and made a finished clock snap back to 100% forever.
      const nextClocks: Record<string, number> = {};
      for (const [k, v] of Object.entries(qtClocksRef.current)) {
        if (v <= 1) expiredNow.push(k);
        else nextClocks[k] = v - 1;
      }
      qtClocksRef.current = nextClocks;
      setChoiceClocks(nextClocks);
      // 2) Heartbeat sting for QTE choices that have just crossed ~30% left.
      //    Reads the LIVE clocks via the ref so the threshold check is accurate.
      const liveScene = qtSceneRef.current;
      const liveChoices = qtChoicesRef.current;
      const liveClocks = qtClocksRef.current;
      if (liveScene?.choices) {
        for (const c of liveChoices) {
          if (!c.quickTime || !c.qteHeartbeat || !c.timeLimitSeconds) continue;
          const total = c.timeLimitSeconds;
          const remaining = (liveClocks[c.id] ?? total) / total;
          if (remaining > 0 && remaining <= 0.3 && !qtHeartbeatFired.current.has(c.id)) {
            qtHeartbeatFired.current.add(c.id);
            if (soundOnRef.current && !prefersReducedMotionRef.current) audio.heartbeat();
          }
        }
      }
      // 3) Expiry is NOT silent removal for quick-time prompts — apply the
      //    timed-out consequences and route to the "you hesitated" target.
      if (expiredNow.length) {
        setExpiredChoices((e) => {
          const s = new Set(e);
          expiredNow.forEach((k) => s.add(k));
          return s;
        });
        // ANY timed choice expires, not just a quick-time prompt: a plain
        // conversation clock (`timeLimitSeconds` without `quickTime`) used to
        // tick down behind a ⏱ readout and then do nothing at all.
        const timedOut = liveChoices.find((c) => c.timeLimitSeconds && expiredNow.includes(c.id));
        if (timedOut) {
          const choice = timedOut;
          const silence = silenceOutcome(choice);
          // A quick-time lapse is a failure sting; a conversation clock running
          // out is just the moment passing, so it gets the quiet snap instead.
          if (silence.flavour === "qte") audio.fail();
          else audio.stringSnap();
          // An expired window is exactly the decision players most want back —
          // snapshot before its consequences land so ↺ Rewind puts the clock
          // back on the table.
          snapshotDecision(`the window closed on “${choice.text}”`);
          if (silence.consequences) {
            setState((s) => applyConsequences(story, silence.consequences!, s));
          }
          if (silence.dest && silence.dest !== sceneId) {
            // Letting the window close is a decision. Log it as one —
            // passing the choice so its timed-out consequences (flags,
            // heat) are captured for the route chart's notes.
            recordJourney(choice, { timedOut: true });
            leaveFor(silence.dest, liveScene?.partBreak);
          } else if (silence.flavour === "conversation" && choice.reply) {
            // Silence in place: the reply simply disappears from the rail
            // (expiredChoices already dropped it). Say so, or an option
            // vanishing with no sound and no navigation reads as a bug.
            pushToast("The moment passes. You said nothing.", "info");
          }
        }
      }
    }, 1000);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choicesLive, choiceClockPaused, sceneId, entrySeq, availableChoices.length, goToScene]);

  /** Would the part-break chart have anything to show? A break that charts
   * nothing must not interrupt the player with an empty screen. Mirrors the
   * filter inside <Flowchart>. */
  const hasChartableSteps = useCallback(
    (steps: JourneyStep[]) =>
      steps.some((s) => s.options.length > 1 || s.timedOut || s.rememberLine),
    []
  );

  /** The act a destination scene opens, if entering it begins a new act whose
   * card hasn't played yet. Only a scene that IS an act's startSceneId opens
   * one, so mid-act scenes never trigger a card. */
  const actOpenedBy = useCallback(
    (destSceneId: string): Act | null => {
      const act = story.acts?.find((a) => a.startSceneId === destSceneId);
      if (!act || seenActs.current.has(act.id)) return null;
      return act;
    },
    [story]
  );

  /** Single exit point for "leave the current scene for `dest`", applying the
   * boundary ceremony in order: route chart, then act card, then the scene. */
  const leaveFor = useCallback(
    (dest: string, breakTitle?: string) => {
      const act = actOpenedBy(dest);
      const chartable = hasChartableSteps(journeyRef.current.slice(chartedUpToRef.current));
      // At an act boundary the branching map supersedes the linear chart —
      // showing both would chart the same decisions twice in a row.
      const leavingAct = act ? actOfScene(story, sceneIdRef.current) : null;
      const actBoundary = !!act && !!leavingAct && leavingAct !== act.id;

      if (breakTitle && chartable && !actBoundary) {
        setPartBreak({ title: breakTitle, nextSceneId: dest });
        return;
      }
      if (breakTitle) setChartedUpTo(journeyRef.current.length);
      if (act) {
        // Leaving one act for another: show the whole shape of the act just
        // played before its successor's title card.
        if (actBoundary && leavingAct) {
          setActMap({ actId: leavingAct, nextSceneId: dest });
          return;
        }
        seenActs.current.add(act.id);
        setPendingAct({ act, nextSceneId: dest });
        return;
      }
      goToScene(dest);
    },
    [actOpenedBy, hasChartableSteps, goToScene, story]
  );
  // Keep the ref pointed at the latest leaveFor for advanceBeat to call.
  useEffect(() => {
    leaveForRef.current = leaveFor;
  }, [leaveFor]);

  /* -------- scene auto-advance --------
   * For pure cinematic / prose-only nodes: once the setup, dialogue and any
   * authored hold have finished, route to the configured target after a timer —
   * but only when there are no choices currently available. This lets authors
   * build hands-off transitions without showing a dummy "Continue" choice.
   * Credits nodes are exempt: the credits roll effect above owns them, paced by
   * the roll itself rather than by this scene-ready timer. */
  useEffect(() => {
    if (!scene || scene.isEnding || isCredits || overlay || menuOpen || !interactive || hasUsableChoice) {
      setAutoAdvanceRemaining(0);
      return;
    }
    const targetId = scene.autoAdvanceTargetSceneId;
    if (!targetId || targetId === sceneId || !hasValidAutoAdvance) {
      setAutoAdvanceRemaining(0);
      return;
    }
    const delay = Math.max(0, Math.min(600, scene.autoAdvanceDelaySeconds ?? 0));
    setAutoAdvanceRemaining(delay);

    const go = () => {
      setAutoAdvanceRemaining(0);
      audio.stopSpeech();
      leaveFor(targetId, scene.partBreak);
    };
    if (delay <= 0) {
      const t = window.setTimeout(go, 0);
      return () => window.clearTimeout(t);
    }

    const tick = window.setInterval(() => setAutoAdvanceRemaining((s) => Math.max(0, s - 1)), 1000);
    const t = window.setTimeout(go, delay * 1000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(t);
    };
  }, [scene, sceneId, hasValidAutoAdvance, isCredits, overlay, menuOpen, interactive, hasUsableChoice, leaveFor]);

  /* -------- after-beat auto route (insert shot that ends the scene) --------
   * AUTO mode: once the final beat has finished typing (and no menu/overlay is
   * up), hold for beatRouteDelay so the player can read it, then route to the
   * beat's target. The timer pauses under a menu/overlay exactly like the
   * scene auto-advance timer. CONTINUE mode shows the ▸ Continue pill / Space
   * so the player can cut early, but a fallback timer still carries an idle
   * player across — the button skips the wait, it never blocks the exit.
   * While this is pending the replacement background stays on screen — no
   * revert to the plate. */
  useEffect(() => {
    if (!beatRouteReady) {
      setBeatRouteRemaining(0);
      return;
    }
    if (overlay || menuOpen || holdActive) {
      return; // paused; resume on close
    }
    const target = beatRouteTarget as string;
    // AUTO cuts on its authored hold. CONTINUE still arms a generous fallback
    // timer so an idle player is carried into the next scene instead of being
    // left parked on the insert with a lone button — the button only ever
    // skips the wait, never gates the exit.
    // An animatic gives the default one-second scene-end cut a silent last line's reading time; any other authored
    // hold (the raid's song-timed cuts) is kept exactly.
    const readHold = ANIMATIC && routingBeat && !routingBeat.audioUrl ? readingSeconds(routingBeat.text ?? "", ANIMATIC.pace * (scene?.animaticReadPace ?? 1)) : 0;
    const delay = beatRouteMode === "auto" ? Math.max(0, beatRouteDelay === 1 ? Math.max(1, readHold) : beatRouteDelay) : Math.max(6, readHold);
    const go = () => {
      setBeatRouteRemaining(0);
      audio.stopSpeech();
      leaveFor(target, scene?.partBreak);
    };
    // The hold counts from the end of the recorded line, not from the end of the typing: the voice is usually
    // longer than the subtitle's typed dwell, and cutting on a fixed timer chopped the last take (capped at 45 s).
    let tick = 0, t = 0;
    const arm = () => {
      setBeatRouteRemaining(delay);
      if (delay <= 0) { t = window.setTimeout(go, 0); return; }
      tick = window.setInterval(() => setBeatRouteRemaining((s) => Math.max(0, s - 1)), 1000);
      t = window.setTimeout(go, delay * 1000);
    };
    const waitStart = Date.now();
    const wait = window.setInterval(() => {
      if (!audio.speechActive() || Date.now() - waitStart > 45000) {
        window.clearInterval(wait);
        arm();
      }
    }, 250);
    return () => {
      window.clearInterval(wait);
      window.clearInterval(tick);
      window.clearTimeout(t);
    };
  }, [beatRouteReady, beatRouteMode, beatRouteTarget, beatRouteDelay, routingBeat, overlay, menuOpen, holdActive, leaveFor, scene?.partBreak, scene?.animaticReadPace]);

  /** Append a decision to the ordered journey log. Captures the siblings
   *  that existed at this moment — including ones gated shut — because the
   *  whole point of the flowchart is showing the roads not taken.
   *  Conversational replies count as siblings too: the question you didn't
   *  ask is a road not taken as well, so an interrogation reads in the chart
   *  as the escalation it was. One-shot replies already spent earlier in the
   *  scene are shown locked — they were no longer on the table. */
  const recordJourney = useCallback(
    (choice: Choice | null, opts?: { timedOut?: boolean; used?: Set<string>; extraFlags?: string[] }) => {
      const liveScene = story.scenes.find((s) => s.id === sceneId);
      if (!liveScene) return;
      const st = stateRef.current;
      const siblings = (liveScene.choices ?? []).filter(
        (c) => c.reply || (c.targetSceneId !== undefined && c.targetSceneId !== "")
      );
      const used = opts?.used ?? usedChoices;
      const options = siblings
        // hidden choices that never unlocked were never really on the table
        .filter((c) => !(c.hidden && !meetsGating(effectiveChoiceGating(c), st)))
        .map((c) => ({
          id: c.id,
          text: c.text,
          // a timed-out prompt was not chosen — the player let it lapse
          taken: !!choice && !opts?.timedOut && c.id === choice.id,
          // gated shut, or a one-shot reply already spent in this scene
          locked: !meetsGating(effectiveChoiceGating(c), st) || used.has(`${liveScene.id}:${c.id}`),
          attitudeTag: c.attitudeTag,
        }));
      const step: JourneyStep = {
        sceneId: liveScene.id,
        sceneTitle: liveScene.title,
        choiceId: choice?.id ?? null,
        choiceText: choice?.text,
        attitudeTag: choice?.attitudeTag,
        options,
        rememberLine: choice?.rememberLine,
        timedOut: opts?.timedOut,
        trustChanges: choice?.consequences?.trustChanges,
        // Which flags this decision set — the route notes the flowchart and
        // route map list with their Story.flagNotes. extraFlags carries flags
        // the ENGINE applied on the player's behalf (the interrogation's
        // break/clamp), which don't sit on the choice itself.
        flagsSet: [
          ...(choice?.consequences?.setFlags ?? []),
          ...(opts?.timedOut ? (choice?.timedOutConsequences?.setFlags ?? []) : []),
          ...(opts?.extraFlags ?? []),
        ],
      };
      // Update the ref synchronously: the caller decides whether to raise a
      // part break in this same tick, before React has re-rendered.
      journeyRef.current = [...journeyRef.current, step];
      setJourney(journeyRef.current);
    },
    [story, sceneId, usedChoices]
  );

  const pickChoice = useCallback(
    (choice: Choice) => {
      if (sceneTransition.current !== null) return;
      // The effective gate includes the item a present-item choice shows —
      // "show the photograph" is un-pickable while you don't hold it.
      const gate = effectiveChoiceGating(choice);
      if (!meetsGating(gate, stateRef.current)) {
        audio.fail();
        pushToast(gatingHint(gate, story) ?? "Not yet, detective.", "fail");
        return;
      }
      // Playtest coverage: this branch was actually taken (replies included).
      markCoverage("choice", `${sceneId}:${choice.id}`);
      // Rewind: snapshot the world BEFORE this decision changes it. Taken
      // after the gate check (a refused pick is not a decision) and before
      // any state update, so ↺ Rewind lands exactly on the moment of choosing.
      snapshotDecision(`“${choice.text}”`);
      // A ride choice launches the steerable minigame instead of navigating at
      // once — the win/crash routes happen in <RideGame> via finishRide.
      if (choice.ride) {
        audio.click();
        setRideChoice(choice);
        return;
      }
      // Same contract as a ride, different game: the 3D triangulation bay
      // routes through finishRide (win → targetSceneId with the choice's
      // consequences, fail → timedOutTargetSceneId).
      if (choice.triangulate) {
        audio.click();
        setTriangulateChoice(choice);
        return;
      }
      // Conversational replies answer in place: apply consequences, stay in the
      // scene, and let the newly-unlocked gated beat become the response.
      if (choice.reply) {
        audio.click();
        const nextUsed = new Set(usedChoices);
        nextUsed.add(`${sceneId}:${choice.id}`);
        if (choice.exclusiveGroup) {
          (scene?.choices ?? [])
            .filter((candidate) => candidate.exclusiveGroup === choice.exclusiveGroup)
            .forEach((candidate) => nextUsed.add(`${sceneId}:${candidate.id}`));
        }
        setUsedChoices(nextUsed);
        if (choice.attitudeTag && choice.attitudeTag !== "Neutral") audio.stinger();
        // Interrogation: an attitude-tagged reply is PRESSURE. The suspect's
        // live composure drops by one; at zero their TRUST decides crack vs
        // clamp (the projected state includes this reply's own trust swing, so
        // a harsh press that also dents trust counts toward the clamp).
        const q = scene?.interrogation;
        let iqNext: number | null = null;
        let iqOutcome: "broke" | "clamped" | null = null;
        if (q && isPressingReply(choice)) {
          const initial = q.composure ?? 3;
          const live = iqComposure[sceneId] ?? initial;
          const resolved = stateRef.current.activeFlags.has(q.brokeFlag) || (q.clampFlag && stateRef.current.activeFlags.has(q.clampFlag));
          if (!resolved && live > 0) {
            const pr = pressComposure(live, initial);
            iqNext = pr.next;
            if (pr.broke) {
              const projected = recordPresentation(
                choice,
                story,
                recordMemory(choice, applyConsequences(story, presentationConsequences(choice), stateRef.current))
              );
              iqOutcome = interrogationOutcome(q, projected.characterTrust[q.characterId] ?? 0);
            }
          }
        }
        // presentationConsequences folds in the item handover (when the
        // choice consumes what it shows); recordPresentation writes the
        // `item:<id>` memory so later beats can recall the presentation.
        // The crack/clamp lands in the SAME state update as the press that
        // caused it, so the broke beat's gate already sees the flag.
        setState((s) => {
          let next = recordPresentation(choice, story, recordMemory(choice, applyConsequences(story, presentationConsequences(choice), s)));
          if (q && iqOutcome && !next.activeFlags.has(q.brokeFlag) && !(q.clampFlag && next.activeFlags.has(q.clampFlag))) {
            const flag = iqOutcome === "broke" ? q.brokeFlag : q.clampFlag;
            if (flag) next = { ...next, activeFlags: new Set(next.activeFlags).add(flag) };
            const cons = iqOutcome === "broke" ? q.brokeConsequences : q.clampConsequences;
            if (cons) next = applyConsequences(story, cons, next);
          }
          return next;
        });
        // The urgency layer: a press that lands jolts the gauge + a reaction;
        // a press that breaks the suspect slams the stamp + flash + sting.
        if (q && isPressingReply(choice) && iqNext !== null) {
          if (iqOutcome) {
            setIqComposure((c) => ({ ...c, [sceneId]: 0 }));
            setIqStamp((prev) => ({ kind: iqOutcome, key: (prev?.key ?? 0) + 1 }));
            const name = story.characters.find((c) => c.id === q.characterId)?.name ?? "The suspect";
            if (iqOutcome === "broke") {
              audio.stinger();
              pushToast(`${name} breaks.`, "success");
            } else {
              audio.fail();
              pushToast(`${name} clamps down.`, "fail");
            }
          } else {
            setIqComposure((c) => ({ ...c, [sceneId]: iqNext }));
            setIqPressKey((k) => k + 1);
            // A press resets the steadying window — restart the creep so the
            // visual "moment passing" clock restarts with the real timeout.
            setIqSteadyKey((k) => k + 1);
            audio.press();
            setIqReaction((prev) => ({ text: pressReaction(q, iqNext), key: (prev?.key ?? 0) + 1 }));
          }
        }
        if (choice.rememberLine) setRemember((r) => ({ line: choice.rememberLine!, key: (r?.key ?? 0) + 1 }));
        if (choice.rememberLine || choice.memoryLog) {
          setEpisodeHighlights((h) => (h.includes(choice.text) ? h : [...h, choice.text].slice(-6)));
        }
        // A reply that changes the world is a decision — the chart shows the
        // booth's escalation (ask → press → press → break) as the road taken,
        // with the answers not said as the roads not taken. Pure chit-chat
        // (no memory, no consequences) stays out of the log.
        if (choice.memoryLog || choice.rememberLine || choice.consequences) {
          recordJourney(choice, {
            used: usedChoices,
            extraFlags: iqOutcome && q ? [iqOutcome === "broke" ? q.brokeFlag : q.clampFlag ?? ""].filter(Boolean) : undefined,
          });
        }
        return;
      }
      if (!choice.targetSceneId) {
        audio.fail();
        pushToast("That path isn't wired to a scene yet — open this node in Studio and set a target.", "fail");
        return;
      }
      audio.click();
      if (!choiceRepeats(choice)) {
        setUsedChoices((old) => {
          const next = new Set(old);
          next.add(`${sceneId}:${choice.id}`);
          if (choice.exclusiveGroup) {
            (scene?.choices ?? [])
              .filter((candidate) => candidate.exclusiveGroup === choice.exclusiveGroup)
              .forEach((candidate) => next.add(`${sceneId}:${candidate.id}`));
          }
          return next;
        });
      }
      if (choice.attitudeTag && choice.attitudeTag !== "Neutral") audio.stinger();
      // CHANCE GAMBLE — the shared roll from the decision surface (the
      // playthrough bot applies the identical dice). A miss swaps in the
      // fail route + fail consequences BEFORE anything below reads the
      // choice, so the perk layer, toasts, journey log and navigation all
      // follow the dice. The flag is added in the state update further down.
      const gamble = rollGamble(choice);
      const gambleChoice = gamble === "miss" ? { ...choice, consequences: choice.failConsequences } : choice;
      // The perk layer (Velvet Tongue / HEAT / Iron Nerve) lives in
      // decisions.ts so the playthrough bot applies the identical maths.
      // It starts from the presentation-aware consequences, so an item
      // handover (consumePresentedItem) survives the adjustment.
      const cons = adjustedConsequences(gambleChoice, stateRef.current);
      if (gamble === "miss") {
        audio.fail();
        pushToast(`🎲 The gamble fails — the dice called it at ${Math.round(choice.chance ?? 0)}%.`, "fail");
      } else if (gamble === "hit") {
        pushToast(`🎲 The dice land — a ${Math.round(choice.chance ?? 100)}% gamble, taken.`, "success");
      }
      // Positive feedback: surface trust/meter/item gains so players know the
      // choice actually did something (previously only failures got a toast).
      if (cons?.trustChanges?.length) {
        cons.trustChanges.forEach((t) => {
          const ch = story.characters.find((c) => c.id === t.characterId);
          if (!ch) return;
          if (t.delta > 0) pushToast(`♥ ${ch.name.split(" ")[0]} trusts you a little more (+${t.delta}).`, "success");
          else if (t.delta < 0) pushToast(`✖ ${ch.name.split(" ")[0]} likes you less (${t.delta}).`, "fail");
        });
      }
      if (cons?.addItems?.length) {
        cons.addItems.forEach((id) => {
          const it = story.items.find((i) => i.id === id);
          if (it && !stateRef.current.inventory.some((x) => x.id === id)) {
            pushToast(`🎁 Received: ${it.icon} ${it.name}`, "success");
          }
        });
      }
      if (cons?.meterChanges?.some((m) => m.meter === "Suspicion" && m.delta > 0)) {
        const sus = cons.meterChanges.find((m) => m.meter === "Suspicion")!;
        pushToast(`🔥 Heat rising (+${sus.delta}).`, "fail");
      }
      setState((s) => {
        let next = recordPresentation(choice, story, recordMemory(choice, applyConsequences(story, cons, s)));
        if (gamble) {
          // Downstream beats/gates can branch on HOW the dice landed, not
          // just which scene the player ended up in.
          next = { ...next, activeFlags: new Set(next.activeFlags).add(gambleFlag(sceneId, choice.id, gamble)) };
        }
        return next;
      });
      if (choice.rememberLine) setRemember((r) => ({ line: choice.rememberLine!, key: (r?.key ?? 0) + 1 }));
      // Weighty choices (the ones an NPC will remember, or that carry a memory
      // tag) become the "your defining choices" list on the episode end card.
      if (choice.rememberLine || choice.memoryLog) {
        setEpisodeHighlights((h) => (h.includes(choice.text) ? h : [...h, choice.text].slice(-6)));
      }
      recordJourney(choice);
      // A part break shows the route chart for the part just played before
      // moving on. The destination is parked until the player dismisses it.
      const liveScene = story.scenes.find((s) => s.id === sceneId);
      // A missed gamble takes the authored "it didn't work" route; a hit (or
      // no gamble at all) takes the normal target.
      const destination = gamble === "miss" ? (choice.failTargetSceneId ?? choice.targetSceneId) : choice.targetSceneId;
      if (!destination) {
        audio.fail();
        pushToast("That gamble's miss route isn't wired — set a miss destination in Studio.", "fail");
        return;
      }
      leaveFor(destination, liveScene?.partBreak);
    },
    // iqComposure is read for the live interrogation value — it must be a dep
    // so the closure is never stale mid-interrogation. usedChoices must be
    // one too: the reply branch builds the next used-set from it, and a stale
    // copy dropped previously-spent replies, making one-shot replies
    // re-pickable (a trust farm inside an interrogation).
    [story, scene, sceneId, pushToast, recordJourney, leaveFor, iqComposure, usedChoices, snapshotDecision, markCoverage]
  );

  /** Pick a reply while the speaker is still talking (INTERRUPTIBLE DIALOGUE).
   *  The interruption is audible and visible: their line stops mid-word and
   *  finishes on screen, then the reply's own gated response beat plays next —
   *  the same mechanism a reply picked after the line uses, so a cut-in can
   *  never desync the beat queue. */
  const pickCutIn = useCallback(
    (choice: Choice) => {
      audio.stopSpeech();
      setBeatDone(true);
      pickChoice(choice);
    },
    [pickChoice]
  );

  /* -------- credits roll --------
   * A credits node is a piece of film, not a panel to click through: the title
   * sequence plays to its end and the scene leaves on its own. One exit, two
   * triggers — the player pressing "Skip title sequence", or the roll running
   * out. `autoAdvanceDelaySeconds` may only STRETCH the roll (a longer music
   * cue), never cut it short, so a hand-typed number can no longer end the
   * sequence mid-card. */
  const skipCredits = useCallback(() => {
    if (scene?.nodeType !== "credits") return;
    audio.stopSpeech();
    const firstExit = availableChoices.find(
      (c) => c.targetSceneId && meetsGating(effectiveChoiceGating(c), stateRef.current)
    );
    if (firstExit) {
      pickChoice(firstExit);
      return;
    }
    const target = scene.autoAdvanceTargetSceneId;
    if (target && target !== scene.id && story.scenes.some((s) => s.id === target)) {
      leaveFor(target, scene.partBreak);
      return;
    }
    // Nowhere authored to go: settle the node instead of stranding the player
    // behind a button that leads nowhere. The menu stays open to them.
    setProseDone(true);
    setProseAcknowledged(true);
  }, [scene, availableChoices, pickChoice, leaveFor, story]);
  // The roll timer must not restart because a memo identity changed, so it
  // reads the exit through a ref.
  const skipCreditsRef = useRef(skipCredits);
  useEffect(() => {
    skipCreditsRef.current = skipCredits;
  }, [skipCredits]);

  useEffect(() => {
    if (!isCredits || !scene || scene.isEnding) return;
    // The roll keeps playing behind an open menu or overlay — it is the
    // picture, not a paused panel — so nothing here pauses it either.
    const wait = creditsWait;
    setAutoAdvanceRemaining(wait);
    const tick = window.setInterval(() => setAutoAdvanceRemaining((s) => Math.max(0, s - 1)), 1000);
    const t = window.setTimeout(() => {
      setAutoAdvanceRemaining(0);
      skipCreditsRef.current();
    }, wait * 1000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(t);
    };
  }, [isCredits, scene, entrySeq, creditsWait]);

  /** Route out of a finished ride minigame. `won` = you ran the target down
   *  (apply the choice's consequences, head to targetSceneId); a crash applies
   *  the timed-out consequences and heads to timedOutTargetSceneId, the same
   *  "you hesitated" convention the QTE timeout uses. */
  const finishRide = useCallback(
    (choice: Choice, won: boolean) => {
      const liveScene = story.scenes.find((s) => s.id === sceneId);
      if (!choiceRepeats(choice)) {
        setUsedChoices((old) => {
          const next = new Set(old);
          next.add(`${sceneId}:${choice.id}`);
          return next;
        });
      }
      // Same shared perk layer as a normal pick — a crash routes through the
      // choice's timed-out consequences instead of its win consequences.
      const cons = adjustedConsequences(
        choice,
        stateRef.current,
        won ? presentationConsequences(choice) : choice.timedOutConsequences
      );
      if (cons?.trustChanges?.length) {
        cons.trustChanges.forEach((t) => {
          const ch = story.characters.find((c) => c.id === t.characterId);
          if (!ch) return;
          if (t.delta > 0) pushToast(`♥ ${ch.name.split(" ")[0]} trusts you a little more (+${t.delta}).`, "success");
          else if (t.delta < 0) pushToast(`✖ ${ch.name.split(" ")[0]} likes you less (${t.delta}).`, "fail");
        });
      }
      if (cons?.addItems?.length) {
        cons.addItems.forEach((id) => {
          const it = story.items.find((i) => i.id === id);
          if (it && !stateRef.current.inventory.some((x) => x.id === id)) {
            pushToast(`🎁 Received: ${it.icon} ${it.name}`, "success");
          }
        });
      }
      if (cons?.meterChanges?.some((m) => m.meter === "Suspicion" && m.delta > 0)) {
        const sus = cons.meterChanges.find((m) => m.meter === "Suspicion")!;
        pushToast(`🔥 Heat rising (+${sus.delta}).`, "fail");
      }
      setState(
        (s) => recordPresentation(choice, story, recordMemory(choice, applyConsequences(story, cons, s)))
      );
      if (choice.rememberLine) setRemember((r) => ({ line: choice.rememberLine!, key: (r?.key ?? 0) + 1 }));
      if (choice.rememberLine || choice.memoryLog) {
        setEpisodeHighlights((h) => (h.includes(choice.text) ? h : [...h, choice.text].slice(-6)));
      }
      recordJourney(choice, won ? undefined : { timedOut: true });
      const dest = won ? choice.targetSceneId : choice.timedOutTargetSceneId ?? choice.targetSceneId;
      setRideChoice(null);
      if (dest && dest !== sceneId) leaveFor(dest, liveScene?.partBreak);
      else if (dest) goToScene(dest);
    },
    [story, sceneId, goToScene, pushToast, recordJourney, leaveFor]
  );

  const previousPerks = useRef<Perks>(getPerks(state));
  useEffect(() => {
    const perks = getPerks(state);
    perkDefs.forEach((def) => {
      if (perks[def.key] && !previousPerks.current[def.key]) {
        pushToast(`${def.icon} ${def.name} unlocked — ${def.desc.split("·")[1]}`, def.danger ? "fail" : "success");
      }
    });
    previousPerks.current = perks;
  }, [state, pushToast]);

  useEffect(() => {
    const board = story.deduction;
    if (!board?.connections.length) return;
    const solvedAll = board.connections.every((c) => state.activeFlags.has(c.flagSet));
    if (solvedAll && !state.activeFlags.has("case_cracked")) {
      audio.success();
      audio.stinger();
      setState((s) => applyConsequences(story, { setFlags: ["case_cracked"], meterChanges: [{ meter: "Clever", delta: 1 }] }, s));
      pushToast("CASE CRACKED — every string on the board now points the same direction. (+1 Deduce)", "success");
    }
  }, [state.activeFlags, story, pushToast]);

  /* -------- press the lie (contradiction verb) --------
   * The player presents a held item against a beat's false claim. The right
   * evidence breaks the lie (caught beat, flag set, trust/heat swing, and in
   * an interrogation a chunk of composure gone); the wrong evidence is a
   * bluff the speaker calls — heat/trust cost, one fewer chance to press. */
  const pressLieWithItem = useCallback(
    (beat: DialogueBeat, itemId: string) => {
      const lie = beat.lie;
      if (!lie) return;
      const held = stateRef.current.inventory.map((i) => i.id);
      const correct = evidenceBreaksLie(lie, held, itemId);
      const itemName = story.items.find((i) => i.id === itemId)?.name ?? "that";
      const speaker = story.characters.find((c) => c.id === beat.characterId);
      const speakerName = speaker?.name?.split(" ")[0] ?? "They";

      if (correct) {
        audio.success();
        audio.stinger();
        setRemember(
          lie.rememberLine
            ? { line: lie.rememberLine, key: (remember?.key ?? 0) + 1 }
            : remember
        );
        // In an interrogation, a proven contradiction can shatter composure —
        // reuse the crack/clamp resolution so the suspect breaks or clamps.
        const q = scene?.interrogation;
        const resolved = q
          ? stateRef.current.activeFlags.has(q.brokeFlag) || (q.clampFlag && stateRef.current.activeFlags.has(q.clampFlag))
          : true;
        let shatterOutcome: "broke" | "clamped" | null = null;
        let composureTarget: number | null = null;
        if (q && lie.composureDamage && !resolved) {
          const initial = q.composure ?? 3;
          const live = iqComposure[sceneId] ?? initial;
          composureTarget = Math.max(0, live - lie.composureDamage);
          if (composureTarget === 0) {
            // Trust AFTER the lie's own swing decides crack vs clamp, exactly
            // as a breaking press does in pickChoice.
            const projected = applyLieCaught(story, lie, stateRef.current);
            shatterOutcome = interrogationOutcome(q, projected.characterTrust[q.characterId] ?? 0);
          }
        }
        // Composer FX for a shatter happen outside the state updater so it
        // stays pure; the gauge goes to zero and the stamp slams.
        if (q && shatterOutcome) {
          setIqComposure((c) => ({ ...c, [sceneId]: 0 }));
          setIqStamp((prev) => ({ kind: shatterOutcome!, key: (prev?.key ?? 0) + 1 }));
        }
        // A SINGLE state write: the lie is caught, and if the contradiction
        // shattered composure the crack/clamp lands in the same update — so
        // the lie's consequences are applied exactly once.
        setState((s) => {
          let next = applyLieCaught(story, lie, s);
          if (q && shatterOutcome) {
            if (!next.activeFlags.has(q.brokeFlag) && !(q.clampFlag && next.activeFlags.has(q.clampFlag))) {
              const flag = shatterOutcome === "broke" ? q.brokeFlag : q.clampFlag;
              if (flag) next = { ...next, activeFlags: new Set(next.activeFlags).add(flag) };
              const cons = shatterOutcome === "broke" ? q.brokeConsequences : q.clampConsequences;
              if (cons) next = applyConsequences(story, cons, next);
            }
          }
          return next;
        });
        // Composure FX for a hit that doesn't shatter (or the gauge update).
        if (q && composureTarget !== null) {
          if (shatterOutcome) {
            const name = story.characters.find((c) => c.id === q.characterId)?.name ?? "The suspect";
            if (shatterOutcome === "broke") {
              pushToast(`${name} breaks.`, "success");
            } else {
              audio.fail();
              pushToast(`${name} clamps down.`, "fail");
            }
          } else {
            setIqComposure((c) => ({ ...c, [sceneId]: composureTarget! }));
            setIqPressKey((k) => k + 1);
            audio.press();
            setIqReaction((prev) => ({ text: pressReaction(q, composureTarget!), key: (prev?.key ?? 0) + 1 }));
          }
        }
        pushToast(`Caught in the lie — ${speakerName} can't talk around ${itemName}.`, "success");
        setPressLieBeat(null);
        setLieBluff(null);
        // The caught beat is spliced in right AFTER this claim beat in
        // visibleBeats, so step into it (it types fresh on arrival).
        setBeatDone(false);
        setBeatIdx((i) => i + 1);
        return;
      }

      // Wrong evidence — the bluff is called.
      audio.fail();
      const key = beat.id;
      const wrongCount = (lieWrong[key] ?? 0) + 1;
      setLieWrong((m) => ({ ...m, [key]: wrongCount }));
      setState((s) => applyLieWrong(story, lie, s));
      const shut = !lieCanStillPress(lie, wrongCount);
      setLieBluff({
        beatId: beat.id,
        text: lieWrongLine(lie),
        key: (lieBluff?.key ?? 0) + 1,
      });
      const cons = lie.wrongConsequences;
      if (cons?.trustChanges?.length) {
        cons.trustChanges.forEach((t) => {
          const ch = story.characters.find((c) => c.id === t.characterId);
          if (ch && t.delta < 0) pushToast(`✖ ${ch.name.split(" ")[0]} likes you less (${t.delta}).`, "fail");
        });
      }
      if (cons?.meterChanges?.some((m) => m.meter === "Suspicion" && m.delta > 0)) {
        const sus = cons.meterChanges.find((m) => m.meter === "Suspicion")!;
        pushToast(`🔥 Heat rising (+${sus.delta}).`, "fail");
      }
      if (shut) {
        pushToast(`${speakerName} calls your bluff and shuts down. You've lost the chance to press this.`, "fail");
        setPressLieBeat(null);
      }
    },
    [story, scene, sceneId, iqComposure, lieWrong, lieBluff, remember, pushToast]
  );

  /* -------- hotspots -------- */
  const completeHotspot = useCallback(
    (hs: Hotspot, baseState?: GlobalState, action?: HotspotAction, markUsed = true) => {
      const act = action ?? hs.action;
      let s = baseState ?? stateRef.current;
      // Rewind: a zone that HANDS you something, sets a flag, moves a meter or
      // moves you is a decision. Reading a line ("showText" with no payload)
      // is not — snapshotting those would fill the stack with flavour text and
      // push the real decisions off the bottom.
      if (act.itemGranted || act.flagSet || act.meterChange || (act.targetSceneId && act.type !== "showText")) {
        snapshotDecision(`${hs.label}`);
      }
      if (act.itemGranted) {
        s = applyConsequences(story, { addItems: [act.itemGranted] }, s);
        const it = story.items.find((i) => i.id === act.itemGranted);
        audio.pickup();
        pushToast(`Picked up: ${it?.icon ?? ""} ${it?.name ?? act.itemGranted}`, "success");
        if (it?.isClue && story.deduction && !boardHintShown.current) {
          boardHintShown.current = true;
          pushToast("📌 Clue collected — open the Corkboard (B) to pin it.", "info");
        }
      }
      if (act.flagSet) s = applyConsequences(story, { setFlags: [act.flagSet] }, s);
      if (act.meterChange) s = applyConsequences(story, { meterChanges: [act.meterChange] }, s);
      // CHAINED ACTIONS — the follow-ups run here, in order, so one click can
      // show a line AND set a flag AND grant an item. Only the STATE effects
      // are chained (item/flag/meter/sfx) plus a final navigation: replaying
      // the whole activateHotspot switch per link would let a chain open a
      // board, start a conversation or run a script mid-flight, which is a
      // different feature and a much bigger blast radius.
      let chainTarget: string | undefined;
      for (const step of act.then ?? []) {
        if (step.sfxUrl) audio.playSfx(step.sfxUrl, step.sfxVolume ?? 1);
        if (step.itemGranted) {
          s = applyConsequences(story, { addItems: [step.itemGranted] }, s);
          const it = story.items.find((i) => i.id === step.itemGranted);
          audio.pickup();
          pushToast(`Picked up: ${it?.icon ?? ""} ${it?.name ?? step.itemGranted}`, "success");
        }
        if (step.flagSet) s = applyConsequences(story, { setFlags: [step.flagSet] }, s);
        if (step.meterChange) s = applyConsequences(story, { meterChanges: [step.meterChange] }, s);
        // Navigation ENDS the chain, exactly like a script's goToScene step.
        if (step.targetSceneId && step.type !== "showText") {
          chainTarget = step.targetSceneId;
          break;
        }
      }
      setState(s);
      // VERB COIN: a verb action is flavour and stays on the object (you can
      // look at the same bench twice). Only an action that TAKES something
      // away or MOVES the player consumes its marker.
      if (markUsed) setUsedHotspots((u) => new Set(u).add(`${sceneId}:${hs.id}`));
      // Any successful interaction means the player searched the scene.
      setInvestigatedThisVisit(true);
      // The primary action's navigation wins; a chained one only fires when
      // the primary didn't move us (otherwise two goToScene calls would race).
      if (act.targetSceneId && act.type !== "showText") goToScene(act.targetSceneId);
      else if (chainTarget) goToScene(chainTarget);
    },
    [story, sceneId, goToScene, pushToast, snapshotDecision]
  );

  const activateHotspot = useCallback(
    (hs: Hotspot, ctx?: { verb?: VerbId; itemId?: string }) => {
      // MULTI-STATE: act on the object as it stands RIGHT NOW — the active
      // state's action/cursor/label override the base. Callers usually pass
      // the already-resolved view from the render; resolving again here is
      // idempotent and covers fire paths that hold the raw hotspot.
      hs = resolveHotspot(hs, stateRef.current);
      // VERB COIN — "use the wrench on the bike" resolves to the action the
      // object answers with for that verb (and item), or to a refusal line.
      let act = hs.action;
      let actText: string | undefined;
      if (ctx?.verb) {
        const res = resolveVerbAction(hs, ctx.verb, ctx.itemId);
        if (!res.ok) {
          audio.fail();
          setInvestigatedThisVisit(true);
          const line = wrongVerbLine(ctx.verb, story, hs.wrongVerbText, wrongVerbSeed.current++);
          if (soundOnRef.current && autoNarrate) audio.speak(line);
          setExamCard({ label: hs.label, text: line, kind: "fail" });
          return;
        }
        act = res.action ?? hs.action;
        actText = res.text;
      }
      // A verb action is flavour: it does not consume the marker unless it
      // takes something or moves the player.
      const markUsed = !ctx?.verb || act.type === "giveItem" || act.type === "goToScene";
      if (!meetsGating(hs.gating, stateRef.current)) {
        audio.fail();
        // Trying a locked zone still counts as searching the scene.
        setInvestigatedThisVisit(true);
        const failText = hs.customFailMessage || gatingHint(hs.gating, story) || "That's locked up tighter than a nun's diary.";
        setExamCard({ label: hs.label, text: failText, kind: "fail" });
        if (soundOnRef.current && autoNarrate) audio.speak(failText);
        return;
      }
      // SOUND EFFECT — fires for EVERY action type, before the switch, so a
      // door creak plays whether the zone shows a line, grants an item or
      // walks you to another room. On the sfx bus, so it layers over the
      // narration instead of cutting it off (that is what audioUrl is for).
      if (act.sfxUrl) audio.playSfx(act.sfxUrl, act.sfxVolume ?? 1);
      switch (act.type) {
        case "showText": {
          audio.click();
          const examText = actText ?? act.text ?? "…";
          setExamCard({ label: hs.label, text: examText, kind: "info" });
          {
            // Voiced like the beats: a recorded clip wins over the TTS
            // reader. A per-item reply uses its own clip (an overridden
            // line must never lip-flap the action's default recording).
            const over = actText != null && actText !== act.text;
            const clip = over ? hs.itemAudio?.[ctx?.itemId ?? ""] : act.audioUrl;
            if (clip) audio.playClip(clip);
            else if (soundOnRef.current && autoNarrate) audio.speak(examText);
          }
          // READING A THING NEVER EATS ITS MARKER. A 💬 marker stays on the
          // scene after its line shows (you can read it again) — authored
          // extras (flag/meter) apply only the FIRST time so they can't be
          // re-farmed by re-reading. (Hotspot visibility keys off
          // usedHotspots with a showText exemption.)
          const spentKey = `${sceneId}:${hs.id}`;
          const rewardSpent = usedHotspots.has(spentKey);
          if (!rewardSpent || markUsed) {
            const firstTimeAct =
              rewardSpent && (act.flagSet || act.meterChange)
                ? { ...act, flagSet: undefined, itemGranted: undefined, meterChange: undefined }
                : act;
            completeHotspot(hs, undefined, firstTimeAct, markUsed);
          }
          break;
        }
        case "goToScene":
          if (act.targetSceneId) {
            completeHotspot(hs, undefined, act, markUsed);
          }
          break;
        case "giveItem":
        case "setFlag":
        case "meterChange": {
          // Reward actions can carry authored discovery text/voice too. A
          // pickup must not silently discard its description while showing
          // only the generic "Picked up" toast.
          const line = actText ?? act.text;
          if (line) setExamCard({ label: hs.label, text: line, kind: "info" });
          const clip = ctx?.itemId ? hs.itemAudio?.[ctx.itemId] ?? act.audioUrl : act.audioUrl;
          if (clip) audio.playClip(clip);
          else if (line && soundOnRef.current && autoNarrate) audio.speak(line);
          completeHotspot(hs, undefined, act, markUsed);
          break;
        }
        case "openBoard":
          setOverlay({ type: "board" });
          break;
        case "openMap":
          if (mapAvailable(story)) setOverlay({ type: "map" });
          break;
        case "patternPuzzle":
          if (act.patternPuzzle) {
            setPatternPuzzle({ config: act.patternPuzzle, hotspot: hs });
            setInvestigatedThisVisit(true);
          }
          break;
        case "esperPhoto":
          if (act.esperPhoto) {
            setEsperModal({ config: act.esperPhoto, hotspot: hs });
            setInvestigatedThisVisit(true);
          }
          break;
        case "vkTest":
          if (act.vkTest) {
            setVkModal({ config: act.vkTest, hotspot: hs });
            setInvestigatedThisVisit(true);
          }
          break;
        case "arcadeGame":
          if (act.arcadeGame) {
            setArcadeGame({ config: act.arcadeGame, hotspot: hs });
            setInvestigatedThisVisit(true);
          }
          break;
        case "useItem": {
          // Derive the post-consumption state and hand it straight to
          // completeHotspot instead of mutating the ref behind React's back.
          let nextState = stateRef.current;
          // Author-controlled vanishment: only an action that NAMES an item
          // in "consumes …" spends anything. An unnamed use-item action (or
          // any other kind) NEVER eats the armed item — it just plays its
          // line, like a say-a-line reply.
          const consumed = itemsConsumedBy(act)[0];
          if (consumed) {
            nextState = applyConsequences(story, { removeItems: [consumed] }, stateRef.current);
            if (nextState !== stateRef.current) {
              audio.pickup();
              pushToast(`Used: ${story.items.find((i) => i.id === consumed)?.name ?? consumed}`, "success");
            }
          }
          const useLine = actText ?? act.text;
          if (useLine) {
            setExamCard({ label: hs.label, text: useLine, kind: "info" });
            // Per-item reply clips take priority over the action's own
            // recording; only the TTS reader falls all the way through.
            const over = actText != null && actText !== act.text;
            const clip = over ? hs.itemAudio?.[ctx?.itemId ?? ""] : act.audioUrl;
            if (clip) audio.playClip(clip);
            else if (soundOnRef.current && autoNarrate) audio.speak(useLine);
          }
          completeHotspot(hs, nextState, act, markUsed);
          break;
        }
      }
    },
    [story, sceneId, pushToast, completeHotspot, autoNarrate, usedHotspots, markCoverage]
  );

  activateRef.current = activateHotspot;

  /* ---------- examine (hold to inspect) ---------- */
  const cancelExamineRaf = useCallback(() => {
    if (examineRaf.current !== null) {
      cancelAnimationFrame(examineRaf.current);
      examineRaf.current = null;
    }
  }, []);

  const startExamine = useCallback(
    (hs: Hotspot) => {
      if (examining) return;
      audio.click();
      cancelExamineRaf();
      examineStart.current = performance.now();
      setExamining({ hs, progress: 0 });
      const dur = Math.max(0.5, hs.examineSeconds ?? 2.5) * 1000;
      const tick = (now: number) => {
        const p = Math.min(1, (now - examineStart.current) / dur);
        setExamining({ hs, progress: p });
        if (p >= 1) {
          examineRaf.current = null;
          setExamining(null);
          // Completion fires the hotspot's normal action: giveItem picks the
          // object up, showText shows the description. The zone is consumed
          // (hidden) and any flag it sets lets the discovery beat fire.
          activateHotspot(hs);
        } else {
          examineRaf.current = requestAnimationFrame(tick);
        }
      };
      examineRaf.current = requestAnimationFrame(tick);
    },
    [examining, cancelExamineRaf, activateHotspot]
  );

  const abortExamine = useCallback(() => {
    cancelExamineRaf();
    setExamining(null);
  }, [cancelExamineRaf]);

  // A scene change, overlay, or menu open mid-examine aborts it cleanly.
  useEffect(() => {
    cancelExamineRaf();
    setExamining(null);
  }, [sceneId, overlay, cancelExamineRaf]);
  useEffect(() => () => cancelExamineRaf(), [cancelExamineRaf]);

  /* ---------- interrogation urgency ---------- */
  // Clear the transient FX (reaction line, stamp slam) on scene change so a
  // re-entry doesn't replay a break that already happened. The permanent
  // broke/clamped label is derived from the flag, not from these.
  useEffect(() => {
    setIqReaction(null);
    setIqStamp(null);
  }, [sceneId]);

  // STEADY ON HESITATION: if the suspect is pressed (0 < composure < full),
  // not yet resolved, and hasn't steadied, they recover +1 after steadySeconds
  // of inactivity — the moment passes if you stop pressing. Reschedules on
  // every composure change (a press resets the window).
  useEffect(() => {
    const q = scene?.interrogation;
    if (!q || !scene || overlay) return;
    const initial = q.composure ?? 3;
    const live = iqComposure[scene.id] ?? initial;
    if (live <= 0 || live >= initial) return;
    if (iqSteadied.current[scene.id]) return;
    if (state.activeFlags.has(q.brokeFlag) || (q.clampFlag && state.activeFlags.has(q.clampFlag))) return;
    const secs = Math.max(3, Math.min(12, q.steadySeconds ?? 7));
    const t = window.setTimeout(() => {
      const r = steadyComposure(iqComposure[scene.id] ?? initial, initial, iqSteadied.current[scene.id] ?? false);
      if (!r.recovered) return;
      iqSteadied.current = { ...iqSteadied.current, [scene.id]: true };
      setIqComposure((c) => ({ ...c, [scene.id]: r.next }));
      audio.steady();
      setIqReaction((prev) => ({ text: "They steady themselves.", key: (prev?.key ?? 0) + 1 }));
      setIqSteadyKey((k) => k + 1);
    }, secs * 1000);
    return () => window.clearTimeout(t);
  }, [iqComposure, scene, state.activeFlags, overlay]);

  // HEARTBEAT at critical: one press from the break, the suspect's pulse is
  // audible. A soft interval of lub-dub thumps while composure === 1.
  // Reduced-motion: skip heartbeat audio — it is an anxiety-inducing cue.
  useEffect(() => {
    if (prefersReducedMotion) return;
    const q = scene?.interrogation;
    if (!q || !scene || overlay) return;
    const initial = q.composure ?? 3;
    const live = iqComposure[scene.id] ?? initial;
    const resolved = state.activeFlags.has(q.brokeFlag) || (q.clampFlag && state.activeFlags.has(q.clampFlag));
    if (live !== 1 || resolved) return;
    audio.heartbeat();
    const iv = window.setInterval(() => audio.heartbeat(), 1100);
    return () => window.clearInterval(iv);
  }, [iqComposure, scene, state.activeFlags, overlay, prefersReducedMotion]);

  const visibleHotspots = useMemo(() => {
    if (!scene?.hotspots) return [];
    // A read marker is forever: 💬 showText stays on the scene after its
    // line plays (authored extras fire once — see activateHotspot). Only
    // something genuinely REMOVED by use — an item taken, a route used —
    // hides its marker.
    // MULTI-STATE: the survivors are then re-skinned by their active state
    // (Hotspot.states) — one marker that changes with the story instead of
    // flag-gated duplicates. Identity (id, bounds, verbs, items) is
    // untouched, so used-marker tracking and coin verbs stay stable while
    // the label/art/action follow the world. Resolving BEFORE the used-
    // filter matters: the 💬-exemption must read the action the object
    // would fire NOW — a safe whose "open" state grants the item is a
    // pickup, not a re-readable line, and must stay consumed.
    return scene.hotspots
      .map((hs) => resolveHotspot(hs, state))
      .filter((hs) => !hs.hiddenWhenLocked || meetsGating(hs.gating, state))
      .filter(
        (hs) => hs.isRepeatable || !usedHotspots.has(`${sceneId}:${hs.id}`) || hs.action.type === "showText",
      );
  }, [scene, usedHotspots, sceneId, state]);

  /* DOORS — gate-aware barriers: while a barrier's gate is shut it is a wall
   * (the router respects it); the moment the gate opens it stops existing.
   * Resolved here, where the world state lives, and handed to the Stage as
   * the obstacle list the walker actually collides with. */
  /* Searchable things left in this scene: anything that isn't a pure exit
   * and hasn't been read/collected yet. The end-of-scene nudge tells the
   * player these exist before the choices carry them off. */
  const searchableLeft = useMemo(
    () =>
      visibleHotspots.filter(
        (hs) =>
          hs.action.type !== "goToScene" &&
          (hs.isRepeatable || !usedHotspots.has(`${sceneId}:${hs.id}`)),
      ),
    [visibleHotspots, usedHotspots, sceneId]
  );
  const investigateNudge =
    !!scene &&
    interactive &&
    !scene.isEnding &&
    scene.nodeType !== "credits" &&
    scene.nodeType !== "cutscene" &&
    !overlay &&
    !investigatedThisVisit &&
    !investigateNudgeDismissed &&
    searchableLeft.length > 0;
  useEffect(() => {
    if (!investigateNudge) return;
    if (investigateToastShown.current) return;
    investigateToastShown.current = true;
    audio.hover();
    pushToast(
      `🔍 Before you move on — ${searchableLeft.length} thing${searchableLeft.length > 1 ? "s" : ""} to examine in this scene.`,
      "info"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investigateNudge, searchableLeft.length]);

  const objective = useMemo(() => {
    if (!scene) return "";
    if (!proseAcknowledged) return "Read the setup — press Continue when you're ready.";
    if (inBeats) return `${story.characters.find((c) => c.id === currentBeat?.characterId)?.name ?? "Someone"} is talking — click through or press Space.`;
    const takeable = visibleHotspots.find((hs) => meetsGating(hs.gating, state) && hs.action.type === "giveItem");
    if (takeable) return `Grab evidence: ${takeable.label}.`;
    const exit = visibleHotspots.find((hs) => meetsGating(hs.gating, state) && (hs.action.type === "goToScene" || hs.action.type === "useItem"));
    if (exit) return `Move on: ${exit.label}.`;
    const board = visibleHotspots.find((hs) => hs.action.type === "openBoard");
    if (board && story.deduction) return "Open the corkboard — connect what you've learned.";
    const openChoice = availableChoices.find((c) => meetsGating(effectiveChoiceGating(c), state));
    if (openChoice) return `Time to decide: "${openChoice.text.slice(0, 50)}${openChoice.text.length > 50 ? "…" : ""}"`;
    const lockedChoice = availableChoices.find((c) => effectiveChoiceGating(c));
    if (lockedChoice) return `Locked: ${gatingHint(effectiveChoiceGating(lockedChoice), story) ?? "you need something more."}`;
    if (travelViaMap > 0) return "Open the travel map (T) — your next stop is a pin away.";
    if (hasValidAutoAdvance) {
      const showTimer = !scene.autoAdvanceHideTimer && autoAdvanceRemaining > 0;
      return `The reel advances automatically${showTimer ? ` in ${autoAdvanceRemaining}s` : ""}.`;
    }
    return "Search the scene carefully — mouse over the picture for hidden hotspots.";
  }, [scene, proseAcknowledged, inBeats, currentBeat, story, visibleHotspots, state, availableChoices, travelViaMap, hasValidAutoAdvance, autoAdvanceRemaining]);

  /* The anti-softlock diagnostic used to live here as a private `isSoftlocked`
   * memo: no auto-advance, no map absorption, no gated-passing hotspot, choice
   * or craft. It was a second, narrower copy of the question the decision
   * surface already answers — it could not see corkboard deductions, pressing a
   * lie, stage walk-off edges, quick-time lapses, minigame outcomes or an
   * after-beat route, so a room it called playable could still be a dead end
   * (and one it called dead could have a way out it hadn't modelled). The
   * shared verdict now lives with the rest of the stranded wiring above
   * (strandedVerdict / strandedShown), which is the SAME surface the
   * playthrough bot walks, so the player and the bot can never disagree about
   * whether a room is finished. */

  /* -------- crafting -------- */
  const handleCombine = useCallback(
    (a: Item, b: Item) => {
      const result = combineItems(story, a, b);
      if (result) {
        audio.combine();
        setState((s) => applyConsequences(story, { removeItems: [a.id, b.id], addItems: [result.id] }, s));
        pushToast(`✨ Crafted: ${result.icon} ${result.name}!`, "success");
      } else {
        audio.fail();
        pushToast(`${a.icon} and ${b.icon} refuse to cooperate.`, "fail");
      }
    },
    [story, pushToast]
  );

  /* -------- keyboard -------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (mixerOpen) {
        if (e.key === "Escape") { e.preventDefault(); setMixerOpen(false); }
        return; // arrows adjust the sliders, never the choices underneath
      }
      if (overlay) {
        if (e.key === "Escape") { setOverlay(null); return; }
        // A toggle key closes the overlay IT opened — the travel map says
        // "T or Esc closes", so T must work while the map (not just Esc) is
        // up; likewise L for the log and B for the corkboard.
        if (overlay.type === "map" && (e.key === "t" || e.key === "T")) { setOverlay(null); return; }
        if (overlay.type === "log" && (e.key === "l" || e.key === "L")) { setOverlay(null); return; }
        if (overlay.type === "board" && (e.key === "b" || e.key === "B")) { setOverlay(null); return; }
        return;
      }
      if (menuOpen) {
        if (e.key === "Escape") setMenuOpen(false);
        return;
      }
      // Part-break / act-map / act-card interstitials own the keyboard.
      // Without this guard Escape opens the quit dialog BEHIND the chart,
      // and Space/Enter/digits fire the old scene's beats and choices
      // behind the interstitial (RouteMap double-fired exactly this way).
      if (partBreak || actMap || pendingAct) return;
      if (e.key === "Escape") {
        setOverlay({ type: "quit" });
        return;
      }
      // OVERLAY TOGGLES come FIRST, because they are not reading-mode
      // shortcuts and they do not collide with WASD/arrow movement. The
      // stage guard below used to swallow them, which meant the travel map
      // (T), the dialogue log (L) and the corkboard (B) were unreachable by
      // key in EVERY walkable room — i.e. exactly the rooms a player is in
      // when they want to check the map. Each is a toggle, so pressing the
      // key again closes the overlay it opened.
      {
        const tag = (e.target as HTMLElement).tagName;
        const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
        if (!typing) {
          if (e.key === "h" || e.key === "H") { e.preventDefault(); triggerHint(); return; }
          if (e.key === "m" || e.key === "M") {
            e.preventDefault();
            if (soundOn) setSoundOn(false); else enableSound();
            return;
          }
          if (e.key === "Backspace") { e.preventDefault(); doRewindDecision(); return; }
          if (e.key === "t" || e.key === "T") {
            if (mapAvailable(story)) {
              e.preventDefault();
              setOverlay((o) => (o?.type === "map" ? null : { type: "map" }));
              return;
            }
          }
          if (e.key === "l" || e.key === "L") {
            if (dialogueLog.length) {
              e.preventDefault();
              setOverlay((o) => (o?.type === "log" ? null : { type: "log" }));
              return;
            }
          }
          if (e.key === "b" || e.key === "B") {
            if (story.deduction && !story.dialogueBox?.hideCorkboard) {
              e.preventDefault();
              setOverlay((o) => (o?.type === "board" ? null : { type: "board" }));
              return;
            }
          }
        }
      }
      if ((e.code === "Space" || e.key === "Enter") && !overlay) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== "BUTTON" && tag !== "INPUT" && tag !== "TEXTAREA") {
          if (!proseAcknowledged && !proseDone) {
            // First press finishes the typing instead of doing nothing —
            // the player never has to hunt for "." mid-sentence.
            e.preventDefault();
            audio.stopSpeech();
            setProseDone(true);
            return;
          }
          if (!proseAcknowledged && proseDone) {
            e.preventDefault();
            audio.stopSpeech();
            setProseAcknowledged(true);
            audio.click();
            return;
          }
          if (inBeats) {
            e.preventDefault();
            advanceBeat();
            return;
          }
        }
      }
      if (e.key === "ArrowLeft") {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
          e.preventDefault();
          if (e.shiftKey) goToSceneStart();
          else goBack();
        }
      }
      if (choicesLive && availableChoices.length) {
        if (["ArrowDown", "s", "S"].includes(e.key)) {
          e.preventDefault();
          setChoiceFocus((f) => (f + 1) % availableChoices.length);
          audio.hover();
        } else if (["ArrowUp", "w", "W"].includes(e.key)) {
          e.preventDefault();
          setChoiceFocus((f) => (f - 1 + availableChoices.length) % availableChoices.length);
          audio.hover();
        } else if (e.key === "Enter" && !inBeats && (e.target as HTMLElement).tagName !== "BUTTON") {
          // Enter only picks once the conversation has finished; mid-line it
          // belongs to the beat (handled above), so a cut-in is a NUMBER key —
          // which is how the quick-time prompts have always been answered.
          e.preventDefault();
          const c = availableChoices[choiceFocus];
          if (c) (cutInLive ? pickCutIn(c) : pickChoice(c));
        } else if (/^[1-9]$/.test(e.key)) {
          const c = availableChoices[parseInt(e.key, 10) - 1];
          if (c) (cutInLive ? pickCutIn(c) : pickChoice(c));
        }
      }
      if (e.key === ".") {
        e.preventDefault();
        skipCurrentText();
      }
      /* T / L / B / H / M / Backspace are handled above the stage guard. */
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlay, menuOpen, mixerOpen, partBreak, actMap, pendingAct, proseAcknowledged, proseDone, inBeats, choicesLive, cutInLive, availableChoices, choiceFocus, advanceBeat, pickChoice, pickCutIn, skipCurrentText, goBack, goToSceneStart, doRewindDecision, story, dialogueLog.length, soundOn, enableSound, triggerHint]);

  // Characters "on stage": anyone with talking frames (or a resting pose) who
  // speaks in this scene. The active speaker cycles their keyframes; the rest
  // hold their resting pose (or first frame), so two characters can face each
  // other and only the one talking animates.
  const onStage = useMemo(
    () =>
      scene && scene.nodeType !== "credits" && scene.nodeType !== "cutscene"
        ? story.characters.filter((c) => {
            if (!((c.talkingFrames?.length ?? 0) > 0 || c.talkingRest || sheetDrawable(c.talkingSheet))) return false;
            return (scene.dialogueBeats ?? []).some((b) => b.characterId === c.id);
          })
        : [],
    [scene, story.characters]
  );

  if (!scene)
    return (
      <div className="flex h-full items-center justify-center bg-noir-950 text-crimson font-pulp">
        Missing scene: {sceneId}
        <button onClick={onExit} className="ml-4 underline">
          Exit
        </button>
      </div>
    );

  const beatChar = currentBeat ? story.characters.find((c) => c.id === currentBeat.characterId) : undefined;
  // Voice-over / narrator lines: a reserved "narrator" speaker or an expression
  // tagged "V.O." renders as first-person narration instead of dialogue.
  const beatIsVo = !!currentBeat && (
    currentBeat.characterId === "narrator" ||
    (currentBeat.expression ?? "").toUpperCase().startsWith("V.O.")
  );
  // The active beat's nameplate accent: V.O./narrator lines keep the house
  // gold; characters cycle through the cast palette by order of appearance.
  const beatAccent = currentBeat
    ? beatIsVo
      ? SPEAKER_ACCENTS[0]
      : speakerAccent(story, currentBeat.characterId)
    : null;
  const activeSpeakerId = inBeats && !beatIsVo && currentBeat ? currentBeat.characterId : null;
  const animateActive = !!activeSpeakerId && currentBeat?.useCharacterAnimation !== false;
  // STAGE nodes never overlay talking cutouts: the conversation plays as
  // captions while the (frozen, facing-you) NPC on the plate is the speaker
  // — portraits under the walkers read as glitchy double-vision.
  const showStage = proseAcknowledged && !overlay && !scene.isEnding && scene.nodeType !== "stage" && onStage.length > 0;
  // Extended particle kinds: dust motes (light-reactive), fog banks, ember/ash, snow/drizzle, fireflies
  const rawParticle = scene.particles ?? (scene.ambientAudio === "rain" ? "rain" : scene.ambientAudio === "tension" ? "smoke" : "none");
  // Normalize legacy names + allow auto-mapping for new moods
  const particleKind = ((): ParticleKind => {
    const v = rawParticle as string;
    if (v === "rain" || v === "smoke" || v === "storm" || v === "dust" || v === "fog" || v === "ember" || v === "ash" || v === "fireflies" || v === "snow" || v === "drizzle" || v === "motes" || v === "none") return v as ParticleKind;
    return "none";
  })();
  // A credits node can carry a montage of stills that cross-dissolve behind the
  // titles, replacing the single background plate for the length of the intro.
  const creditsMontage = (scene.nodeType === "credits" && scene.credits?.montage) || [];
  // Scene-level cinematic polish: letterbox bars + an entry transition.
  const letterbox = !!scene.letterbox;
  const rawTransition = scene.transition ?? "fade";
  const transition = prefersReducedMotion ? (reducedMotionTransition(rawTransition) as any) : rawTransition;
  const transitionMs = prefersReducedMotion ? 0 : Math.max(0, Math.round((scene.transitionSpeed ?? 0.5) * 1000));
  // While a scene change is in flight the overlay must play the DESTINATION's
  // transition (pendingScene) for both the cover and the reveal — the class
  // derived from `scene` above only becomes the destination's once the plate
  // has swapped, and using the current scene here would mix the source's
  // out-animation with the destination's in-animation (a left-wipe covering,
  // then a right-slide revealing).
  const activeTransition = pendingScene ? pendingScene.transition : transition;
  const activeTransitionMs = pendingScene ? pendingScene.ms : transitionMs;
  const activeTransitionClass = sceneTransitionClass(activeTransition);

  // Single cinematic background helper
  // Optional authored aspect ratio: the same fitted box contains BOTH art
  // and stage geometry. Cropping a wide plate with background-size: cover
  // while leaving markers in viewport percentages misplaces every hotspot
  // on a portrait screen. Legacy scenes keep their full-viewport layout.
  const roomRatio = undefined;
  const fitRoom = false;
  const roomFrame: React.CSSProperties | undefined = fitRoom ? {
    width: `min(100cqw, calc(100cqh * ${roomRatio}))`,
    height: `min(100cqh, calc(100cqw / ${roomRatio}))`,
    left: "50%", top: "50%", right: "auto", bottom: "auto", transform: "translate(-50%, -50%)",
  } : undefined;

  const buildSingleBg = () => {
    const resolvedBackground = assetBackground(scene.background);
    const { className: cinClass, style: cinStyle } = cinematicLayer(bgCinematic, scene.background, { reducedMotion: prefersReducedMotion });
    // Examine zoom: magnify the plate toward the examined hotspot's centre.
    // It's applied to a WRAPPER (not the plate itself) because the plate's
    // cinematic animation already owns its own `transform` property.
    const b = examining?.hs.bounds;
    const examineStyle: React.CSSProperties = {
      transform: b ? `scale(${examineZoom(b)})` : "scale(1)",
      transformOrigin: b ? `${b.x + b.w / 2}% ${b.y + b.h / 2}%` : "50% 50%",
      transition: "transform 0.55s cubic-bezier(0.3, 0.7, 0.3, 1)",
    };
    const plateParallax = hasParallax(bgCinematic) && !b;
    return (
      <div className="absolute inset-0 overflow-hidden" data-room-plate style={roomFrame}>
        <div
          className={`absolute inset-0 will-change-transform ${plateParallax ? "parallax-plate parallax-idle" : ""}`}
          style={{
            ...examineStyle,
            ...(plateParallax ? parallaxStyle(bgCinematic) : {}),
          }}
        >
          {resolvedBackground.startsWith("video:") ? (
            <>
              <video
                key={`${sceneId}-${entrySeq}`}
                ref={bgVideoRef}
                src={resolvedBackground.slice(6)}
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
                style={spriteGradeStyle(bgCinematic)}
              />
              <LightGlow cinematic={bgCinematic} />
              <LensFlareLayer cinematic={bgCinematic} />
              <CinematicOverlays cinematic={bgCinematic} />
            </>
          ) : (
            <div
              key={`${sceneId}-${entrySeq}`}
              className={`absolute inset-0 ${cinClass}`}
              style={cinStyle}
            >
              <DepthParallaxLayer cinematic={bgCinematic} picture={scene.background} reducedMotion={prefersReducedMotion} />
              <LightGlow cinematic={bgCinematic} />
              <LensFlareLayer cinematic={bgCinematic} />
              <CinematicOverlays cinematic={bgCinematic} />
            </div>
          )}
          {/* Mid-ground parallax depth planes — between plate and subject.
              Parallax layers aren't magnified by the examine zoom (they sit
              OUTSIDE the zoom wrapper): drawn after it, above it. */}
        </div>
        {hasParallax(bgCinematic) && (
          <ParallaxMidLayers key={`par-${sceneId}-${entrySeq}`} cinematic={bgCinematic} />
        )}
        <div
          className={`absolute inset-0 ${hasParallax(bgCinematic) ? "parallax-fg" : ""}`}
          style={spriteGradeStyle(bgCinematic)}
        >
          {/* Additional stacked foreground images (extras) — render BELOW the
              primary subject so the main foregroundImage stays on top. */}
          <ForegroundExtras
            key={`fge-${sceneId}-${entrySeq}`}
            cinematic={bgCinematic}
          />
          {/* Keyed by scene entry so a foreground zoom animation replays fresh
              each time the player enters the scene (not only on first mount). */}
          <ForegroundLayer key={`fg-${sceneId}-${entrySeq}`} cinematic={bgCinematic} />
          {/* Scene-object images: transparent cutouts (a cup, a watch, a key)
              drawn inside their hotspot zones. They live inside the zoom
              wrapper so the examine camera magnifies them with the plate,
              and they follow the zone's visibility — hidden while the gate
              is shut, gone for good once a one-shot zone is used (a
              picked-up object leaves the scene). */}
          {sceneReady &&
            !scene.isEnding &&
            (scene.hotspots ?? [])
              .filter((hs) => !!hs.image && !hs.image.startsWith("gradient:"))
              .filter((hs) => hs.isRepeatable || !usedHotspots.has(`${sceneId}:${hs.id}`) || hs.action.type === "showText")
              .filter((hs) => meetsGating(hs.gating, state))
              .map((hs) => (
                <div
                  key={`hsimg-${hs.id}`}
                  className="pointer-events-none absolute"
                  style={{
                    left: `${hs.bounds.x}%`,
                    top: `${hs.bounds.y}%`,
                    width: `${hs.bounds.w}%`,
                    height: `${hs.bounds.h}%`,
                  }}
                >
                  <img
                    src={assetUrl(hs.image)}
                    alt=""
                    draggable={false}
                    className={
                      hs.imageFit === "cover"
                        ? "absolute inset-0 h-full w-full object-cover"
                        : "absolute inset-0 m-auto max-h-full max-w-full object-contain"
                    }
                  />
                </div>
              ))}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={stageRef}
      data-story-id={story.id}
      data-scene-id={sceneId}
      data-scene-kind={scene.nodeType ?? "standard"}
      data-animatic={ANIMATIC ? "1" : undefined}
      className={`fx-grain fx-vignette relative h-full w-full overflow-hidden bg-noir-950 select-none ${dialogueTheme?.minimalHud ? "ingame-minimal-hud" : ""}`}
      style={{
        ...parallaxStyle(parallaxOn ? parallaxCinematic : undefined),
        ...inGameThemeVars(dialogueTheme),
        ...(fitRoom ? { containerType: "size" } : {}),
      }}
      onPointerDown={() => {
        audio.unlock();
        retryMusic();
      }}
    >
      {/* default plate renders first; dialogue beats mount their replacement background over it.
          A credits node carrying a montage swaps the static plate for a
          cross-dissolving title sequence instead. */}
      {creditsMontage.length > 0 ? (
        <CreditsMontage
          images={creditsMontage}
          looks={scene.credits?.montageLooks}
          reducedMotion={prefersReducedMotion}
          seconds={scene.credits?.montageSeconds}
          loop={scene.credits?.montageLoop ?? true}
          transition={scene.credits?.montageTransition ?? "dissolve"}
        />
      ) : (
        buildSingleBg()
      )}
      <BeatBackground
        beat={inBeats ? heldInsert : null}
        transitionName={(prefersReducedMotion ? reducedMotionTransition(heldInsert?.backgroundTransition ?? "fade") : (heldInsert?.backgroundTransition ?? "fade")) as any}
        transitionSpeed={heldInsert?.backgroundTransitionSpeed ?? 0.5}
      />

      {/* Characters on stage — the active speaker cycles their talking frames;
          the others hold their resting pose. Wrapped in a graded layer so the
          portraits take the scene's colour grade like every other sprite. */}
      {showStage && (
        <div className="pointer-events-none absolute inset-0 z-[6]" style={spriteGradeStyle(bgCinematic)}>
          {onStage.map((c) => {
          const isActive = c.id === activeSpeakerId;
          const frames = (c.talkingFrames ?? []).filter(Boolean);
          // Alternate sheet (outfit/mood/pose): while this character speaks a
          // beat whose `expression` matches a variant name, that sheet takes
          // over; everyone else keeps their default sheet.
          const expr = isActive ? (currentBeat?.expression ?? "").trim().toLowerCase() : "";
          const variant = expr
            ? c.talkingSheets?.find((v) => v.name.trim().toLowerCase() === expr)?.sheet
            : undefined;
          return (
            <StageSprite
              key={c.id}
              frames={frames}
              rest={c.talkingRest}
              sheet={variant ?? c.talkingSheet}
              animate={isActive && animateActive}
              frameDuration={c.talkingFrameDuration ?? 0.16}
              x={c.talkingX ?? 50}
              y={c.talkingY ?? 0}
              scale={c.talkingScale ?? 1}
              flip={!!c.talkingFlip}
              dim={!isActive}
              dimOpacity={c.talkingDim}
            />
          );
          })}
        </div>
      )}

      {pulpOn && <div className="fx-halftone absolute inset-0" aria-hidden />}
      {/* Smart ambient particles — dust is light-reactive, fog depth-based, embers rise, etc.
          Light shafts are parallax-mid drifting with --par-x and flicker on tension.
          Rain lens droplets with backdrop blur when raining. */}
      <Particles
        kind={particleKind}
        soundOn={soundOn}
        cinematic={bgCinematic}
        reducedMotion={prefersReducedMotion}
        ambientAudio={scene.ambientAudio}
      />
      {/* Subtle atmosphere underlay for light interaction when particles are heavy */}
      {particleKind !== "none" && particleKind !== "dust" && particleKind !== "motes" && particleKind !== "fog" && (
        <AmbientAtmosphere cinematic={bgCinematic} reducedMotion={prefersReducedMotion} ambientAudio={scene.ambientAudio} />
      )}

      {/* Scene entry/exit transition overlay. While a change is in flight it
          plays the destination's transition (cover, then reveal); at rest it
          plays the current scene's entry transition on mount.
          The slide/zoom transitions carry the DESTINATION scene's background
          art inside the overlay (frozen at its t=0 cinematic frame) instead
          of a black shape, so the next scene is visible through the whole
          move: the plate swaps behind identical art and the reveal is a
          gentle settle (characters + letterbox emerge) rather than a
          double-exposed re-slide. Black stays for the black-family
          transitions (fade/fade-black/iris/glitch/burn) and as a fallback
          for video backgrounds, which can't be frozen to a frame. */}
      {(() => {
        const artScene = pendingScene ? sceneById(story, pendingScene.sceneId ?? "") : scene;
        const artBg = artScene ? assetBackground(artScene.background) : "";
        // `overlayArtLive` covers the reveal window after the last arrival;
        // `fading` is the cover in flight. At rest (neither) the art stack
        // unmounts — see "Overlay art lifecycle" above goToScene.
        const showArt =
          (activeTransition === "slide-left" || activeTransition === "slide-right" || activeTransition === "zoom") &&
          (fading || overlayArtLive) &&
          !prefersReducedMotion &&
          !!artScene &&
          !artBg.startsWith("video:");
        const artLayer = showArt && artScene ? cinematicLayer(artScene.cinematic, artScene.background, { still: true }) : null;
        return (
          <div
            className={`pointer-events-none absolute inset-0 z-[70] ${showArt ? "" : "bg-black"} ${activeTransitionClass}`}
            style={{ "--scene-transition-ms": `${activeTransitionMs}ms` } as React.CSSProperties}
            data-transitioning={fading ? "1" : "0"}
          >
            {artLayer && artScene && (
              <div
                key={`art-${artScene.id}`}
                className={`absolute inset-0 ${artLayer.className}`}
                style={artLayer.style}
              >
                <LightGlow cinematic={artScene.cinematic} />
                <LensFlareLayer cinematic={artScene.cinematic} />
                <CinematicOverlays cinematic={artScene.cinematic} />
              </div>
            )}
          </div>
        );
      })()}

      {/* Cinematic letterbox bars */}
      {letterbox && (
        <div className="pointer-events-none absolute inset-0 z-[44]">
          <div className="letterbox-bar letterbox-top" style={{ "--letterbox-h": "9%" } as React.CSSProperties} />
          <div className="letterbox-bar letterbox-bottom" style={{ "--letterbox-h": "9%" } as React.CSSProperties} />
        </div>
      )}
      {/* Animatic mode: the captions sit where a film's subtitles go, over the bottom bar */}
      {ANIMATIC && !animaticOver && <AnimaticCaptions caption={animaticCaption} />}
      {animaticOver && <AnimaticEnd />}

      {/* Pulsing heat/risk vignette — danger reads on screen before the trapdoor fires */}
      {!scene.isEnding && state.meters.Suspicion >= (story.briefing?.heatLimit ? story.briefing.heatLimit - 2 : 6) && (
        <div className="heat-vignette pointer-events-none absolute inset-0 z-[43]" aria-hidden />
      )}
      {!scene.isEnding && state.meters.Suspicion >= (story.briefing?.heatLimit ? story.briefing.heatLimit - 2 : 6) && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[43] flex justify-center pb-2 font-pulp text-[10px] uppercase tracking-[0.4em] text-crimson animate-pulse">
          ⚠ Heat — lay low
        </div>
      )}

      {/* Interrogation critical vignette — one press from the break, the room
          closes in red and the suspect's pulse is audible (heartbeat in the
          urgency effect). */}
      {(() => {
        const q = scene?.interrogation;
        if (!q || !scene || scene.isEnding) return null;
        const live = iqComposure[scene.id] ?? (q.composure ?? 3);
        const resolved = state.activeFlags.has(q.brokeFlag) || (q.clampFlag && state.activeFlags.has(q.clampFlag));
        return live === 1 && !resolved ? <div className="iq-critical-vignette pointer-events-none absolute inset-0 z-[43]" aria-hidden /> : null;
      })()}

      {/* ANIMATED CURSOR — a sprite that tracks the mouse when a verb's
          cursor art is a sheet (a reaching hand, a turning key). Drawn above
          everything, clicks pass straight through it. */}
      {cursor.animated && cursor.art?.sheet && pointer && !overlay ? (
        <div
          className="pointer-events-none fixed z-[400] drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]"
          style={{ left: pointer.x - cursor.hx, top: pointer.y - cursor.hy }}
          aria-hidden
        >
          <SheetSprite sheet={cursor.art.sheet} anim="loop" fallbacks={["idle"]} height={cursor.size} />
        </div>
      ) : null}
      {/* Hotspots become available once the scene setup has been read, including
          while dialogue plays. The dialogue panel sits above them and stops
          propagation, so this is intentional access rather than click-through.
          */}
      {sceneReady && !scene.isEnding && !overlay && (
        <div className="absolute inset-0 z-[46] pointer-events-none" style={cursorStyle}>
          {visibleHotspots.map((hs) => {
            const unlocked = meetsGating(hs.gating, state);
            const perks = getPerks(state);
            // While the end-of-scene investigation nudge is live, searchable
            // zones breathe gold on the art itself — the player can literally
            // see where to look before the choices carry them off.
            const nudgeable = investigateNudge && hs.action.type !== "goToScene";
            // When enabled, the granted item's artwork is drawn in the zone so
            // players can literally see the object sitting in the scene.
            const grantedItem = hs.showItemImage && hs.action.itemGranted
              ? story.items.find((i) => i.id === hs.action.itemGranted)
              : undefined;
            return (
              <button
                key={hs.id}
                data-hs-id={hs.id}
                onClick={hs.examine ? undefined : () => activateHotspot(hs)}
                onPointerDown={(e) => {
                  if (!hs.examine) return;
                  // A locked examine zone behaves like any locked zone:
                  // the fail card, no zoom.
                  if (!unlocked) {
                    activateHotspot(hs);
                    return;
                  }
                  e.preventDefault();
                  // Capture the pointer so small drifts don't abort the
                  // hold; only a real release (or cancel) does.
                  e.currentTarget.setPointerCapture(e.pointerId);
                  startExamine(hs);
                }}
                onPointerUp={() => {
                  if (hs.examine && examining?.hs.id === hs.id) abortExamine();
                }}
                onPointerCancel={() => {
                  if (hs.examine && examining?.hs.id === hs.id) abortExamine();
                }}
                onMouseEnter={() => {
                  audio.hover();
                  setHoverCursor(hs.cursor);
                }}
                onMouseLeave={() => setHoverCursor((c) => (c === hs.cursor ? null : c))}
                className={`hotspot-box group absolute pointer-events-auto cursor-${hs.cursor} ${hs.examine ? "hotspot-examine" : ""} ${examining?.hs.id === hs.id ? "hotspot-examining" : ""} ${perks.sharpEye ? "ring-1 ring-cyan-neon/30 animate-pulse" : ""} ${nudgeable ? "hotspot-nudge" : ""} ${hintActive ? "hotspot-hint" : ""}`}
                style={{
                  left: `${hs.bounds.x}%`,
                  top: `${hs.bounds.y}%`,
                  width: `${hs.bounds.w}%`,
                  height: `${hs.bounds.h}%`,
                }}
                aria-label={`${hs.label}${hs.examine ? " — hold to examine" : ""}${unlocked ? "" : " (locked)"}`}
                title={hs.examine ? `Hold to examine: ${hs.label}` : hs.label}
              >
                <span className={`pointer-events-none absolute -top-7 left-1/2 z-[60] -translate-x-1/2 whitespace-nowrap border border-neon/60 bg-noir-950/95 px-2 py-1 font-pulp text-[9px] uppercase tracking-wider text-neon transition-opacity ${hintActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"}`}>
                  {hs.examine ? (
                    <>🔍 {hs.label} — hold to examine {!unlocked && "🔒"}</>
                  ) : (
                    <>
                      {CURSOR_ICON[hs.cursor]} {hs.label} {!unlocked && "🔒"}
                    </>
                  )}
                </span>
                {grantedItem && unlocked && (
                  grantedItem.iconUrl ? (
                    <img
                      src={assetUrl(grantedItem.iconUrl)}
                      alt={grantedItem.name}
                      className="pointer-events-none absolute inset-0 m-auto max-h-full max-w-full object-contain drop-shadow-[0_0_8px_rgba(232,178,60,0.5)] transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl drop-shadow-[0_0_8px_rgba(232,178,60,0.7)] transition-transform group-hover:scale-125">
                      {grantedItem.icon}
                    </span>
                  )
                )}
                {!unlocked && <span className="absolute bottom-1 right-1 text-sm drop-shadow pointer-events-none">🔒</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* EXAMINING — the hold-to-inspect meter. The camera is zoomed onto
          the hotspot; the box shows what's being examined and how much of
          the hold remains. Release early and the examine aborts. */}
      {examining && (
        <div className="pointer-events-none absolute inset-0 z-[47] flex items-center justify-center">
          <div className="examine-box w-72 border border-gold/60 bg-noir-950/92 px-4 py-3 text-center backdrop-blur-sm">
            <div className="font-pulp text-[10px] uppercase tracking-[0.3em] text-gold">
              🔍 Examining — {examining.hs.label}
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden bg-noir-700">
              <div
                className="examine-fill h-full"
                style={{ width: `${Math.round(examining.progress * 100)}%` }}
              />
            </div>
            <div className="mt-1.5 font-type text-[9px] uppercase tracking-widest text-paper/40">
              hold — release to abort
            </div>
          </div>
        </div>
      )}

      {/* HUD */}
      {!hudHidden && (
        <>
          {!story.dialogueBox?.hideCaseProgress && (
            <MetersHUD
              state={state}
              story={story}
              sceneTitle={scene.title}
              encounteredCharacters={encounteredCharacters}
              visitedCount={visitedScenes.size}
            />
          )}
          {!scene.hideSceneTitle && scene.nodeType !== "stage" && (
            <div
              key={`scene-title-${sceneId}-${entrySeq}`}
              className="scene-title-card pointer-events-none absolute inset-x-0 bottom-[34%] z-[46] flex justify-center"
            >
              <span className="border-y border-paper/25 bg-gradient-to-b from-black/35 to-transparent px-6 py-2 font-pulp text-2xl uppercase tracking-[0.3em] text-paper drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] md:text-3xl">
                {scene.title}
              </span>
              {episode && (
                <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap font-pulp text-[9px] uppercase tracking-[0.4em] text-gold/70">
                  {episodeLabel(episode.number ?? 1, episode.numberSuffix)} · {episode.title}
                </span>
              )}
            </div>
          )}
          {episode && onOpenSeason && (
            <div className="absolute left-1/2 top-3 z-50 -translate-x-1/2">
              <EpisodeChip episode={episode} onOpenSeason={onOpenSeason} />
            </div>
          )}
        </>
      )}

      {/* A visible action list keeps point-and-click interactions discoverable. */}
      {proseAcknowledged && !scene.isEnding && !hudHidden && scene.nodeType !== "stage" && (
        <aside
          className={`hud-frame absolute right-3 top-24 z-50 w-64 p-2.5 ${
            investigateNudge ? "hud-frame-gold animate-pulse" : ""
          }`}
        >
          {investigateNudge && (
            <div className="mb-2 border border-gold/30 bg-gold/[0.07] p-1.5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-type text-[10px] leading-snug text-gold">
                  🔍 <b>Before you go — look around.</b> {searchableLeft.length} thing
                  {searchableLeft.length > 1 ? "s" : ""} to examine before the scene ends.
                </p>
                <button
                  onClick={() => {
                    audio.click();
                    setInvestigateNudgeDismissed(true);
                  }}
                  className="shrink-0 px-1 text-[10px] leading-none text-paper/40 hover:text-crimson"
                  aria-label="Dismiss the search prompt"
                  title="Search anyway — click an action below"
                >
                  ✕
                </button>
              </div>
              <button
                onClick={() => {
                  const first = searchableLeft[0];
                  if (first) activateHotspot(first);
                }}
                className="hud-btn mt-1.5 w-full px-2 py-1"
                title="Examine the first thing you haven't looked at"
              >
                🔍 Examine “{searchableLeft[0]?.label.slice(0, 26)}{searchableLeft[0] && searchableLeft[0].label.length > 26 ? "…" : ""}”
              </button>
            </div>
          )}
          {/* hud-lead: the Minimal HUD theme setting fades these until hover. */}
          <div className="hud-kicker hud-kicker-left hud-lead mb-1.5">Current lead</div>
          <p className="hud-lead font-type mb-1 text-[11px] leading-snug text-paper/70">{objective}</p>
          {/* The dead-end escape hatch used to sit here, driven by a private
              softlock memo. It now lives in the STRANDED panel (bottom of the
              frame, so a 🚶 stage room gets it too) and offers the cheap
              recoveries — ↺ Rewind, the checkpoint, a save — before the
              destructive one. */}
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="hud-kicker hud-kicker-left">Scene actions</span>
            <button
              onClick={() => {
                audio.click();
                setOverlay({ type: "instructions" });
              }}
              data-color="cyan"
              className="hud-btn px-2 py-0.5"
              title="Open the game instructions"
            >
              ? Help
            </button>
            {inBeats && <span className="font-type text-[9px] text-paper/35">talking…</span>}
          </div>
          <hr className="hud-rule mb-1.5" />
          {(
          <div className="space-y-1">
            {visibleHotspots.map((hs) => {
              const unlocked = meetsGating(hs.gating, state);
              return (
                <button
                  key={`action-${hs.id}`}
                  data-hs-id={hs.id}
                  onClick={() => activateHotspot(hs)}
                  disabled={!unlocked}
                  className="hud-action"
                >
                  <span aria-hidden>{CURSOR_ICON[hs.cursor]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{hs.label}</span>
                    {!unlocked && <span className="block text-[9px] text-crimson/80">{gatingHint(hs.gating, story)}</span>}
                  </span>
                  {!unlocked && <span aria-label="Locked">🔒</span>}
                </button>
              );
            })}
            {!visibleHotspots.length && <p className="font-type text-[10px] text-paper/40">No interactive hotspots in this scene yet — draw some in Studio.</p>}
          </div>
          )}
        </aside>
      )}
      {checkpointFlash && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-40 -translate-x-1/2" data-animatic-hide>
          <span className="hud-chip pop-in px-3 py-1" data-kind="good">✓ Checkpoint</span>
        </div>
      )}
      {!hudHidden && (
        <div className="pointer-events-none absolute left-3 top-3 z-40 flex flex-col items-start gap-1">
          {(autoOn || hintActive) && (
            <div className="hud-chrome hud-frame flex items-center gap-1.5 px-2 py-1">
              {autoOn && (
                <span className="hud-chip" data-kind="good">⏩ Auto</span>
              )}
              {hintActive && (
                <span className="hud-chip" data-kind="info">🔍 Hotspots</span>
              )}
            </div>
          )}
        </div>
      )}
      {!hudHidden && (
        <div className="absolute right-3 top-3 z-[60]">
          <button
            onClick={() => {
              audio.click();
              setMenuOpen((o) => !o);
            }}
            className="hud-btn px-3 py-1.5"
            data-active={menuOpen || undefined}
            aria-expanded={menuOpen}
            title="Menu — Case File, Corkboard, Relationships, Save, Load, Quit"
          >
            <span aria-hidden>☰</span> Menu {menuOpen ? "▾" : "▸"}
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40 cursor-default" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="hud-frame hud-frame-gold absolute right-0 top-9 z-50 w-56 py-1">
                {onOpenInStudio && (
                  <button
                    onClick={() => {
                      audio.click();
                      setMenuOpen(false);
                      onOpenInStudio(sceneId);
                    }}
                    className="hud-menu-item text-cyan-neon"
                    title="Open the Studio on this exact scene to edit it"
                  >
                    🎬 Edit this scene in Studio
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowCaseFile((v) => !v);
                    setMenuOpen(false);
                  }}
                  className={`hud-menu-item ${showCaseFile ? "text-gold" : "text-paper/80"}`}
                >
                  🗂 Case File
                </button>
                {story.deduction && !story.dialogueBox?.hideCorkboard && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setOverlay({ type: "board" });
                    }}
                    className="hud-menu-item text-crimson"
                  >
                    📌 Corkboard (B)
                  </button>
                )}
                {mapAvailable(story) && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setOverlay({ type: "map" });
                    }}
                    className="hud-menu-item text-gold"
                    title="The city map — travel to any place you've unlocked (T)"
                  >
                    🗺 Travel map (T)
                  </button>
                )}
                {dialogueLog.length > 0 && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setOverlay({ type: "log" });
                    }}
                    className="hud-menu-item text-paper/80"
                    title="Everything said in this run — press L"
                  >
                    📜 Dialogue log (L)
                  </button>
                )}
                {story.characters.length > 0 && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setOverlay({ type: "relationships" });
                    }}
                    className="hud-menu-item text-gold"
                    title="Who trusts you, who fears you — the relationship ledger"
                  >
                    🎭 Relationships
                  </button>
                )}
                {episode && onOpenSeason && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenSeason();
                    }}
                    className="hud-menu-item text-crimson"
                    title="Season screen — every episode and its outcome"
                  >
                    🎞 Episode list
                  </button>
                )}
                <button
                  onClick={() => {
                    saveThenExitRef.current = false;
                    setSaves(readSaves(story.id, episodeId));
                    setMenuOpen(false);
                    setOverlay({ type: "save" });
                  }}
                  className="hud-menu-item text-emerald-400"
                >
                  💾 Save
                </button>
                <button
                  onClick={() => {
                    setSaves(readSaves(story.id, episodeId));
                    setMenuOpen(false);
                    setOverlay({ type: "load" });
                  }}
                  className="hud-menu-item text-cyan-neon"
                >
                  📂 Load
                </button>
                <hr className="hud-rule my-1" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setOverlay({ type: "quit" });
                  }}
                  className="hud-menu-item text-paper/70"
                >
                  Esc · Quit
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* auto-narrate / back / skip controls */}
      {!hudHidden && (
        <div className="hud-frame absolute right-[5.25rem] top-[52px] z-50 flex items-center gap-1.5 px-1.5 py-1">
          <button
            onClick={goBack}
            disabled={!canRewind}
            data-color={canRewind ? "cyan" : undefined}
            className="hud-btn px-2 py-1"
            title="Back — rewind one line at a time within this scene (←)"
          >
            ◂ Back
          </button>
          {/* ↺ REWIND — undo a whole DECISION, not a line: the choice, the
              quick-time window you let close, the flags and items it handed
              you, across scenes. Sealed once an ending is reached. */}
          <button
            onClick={doRewindDecision}
            disabled={!canUndoDecision}
            data-color={canUndoDecision ? "neon" : undefined}
            className="hud-btn px-2 py-1"
            title={
              canUndoDecision
                ? `Rewind one decision — undo ${undoLabel} (Backspace)`
                : rewind.sealed
                  ? "The case is closed — decisions are final now"
                  : "No decision to rewind yet"
            }
          >
            ↺ Rewind
          </button>
          <button
            onClick={() => {
              // Turning narration off must silence it immediately — a line
              // already being spoken (or a prose MP3 waiting on an autoplay
              // retry) used to keep going until the scene changed.
              if (autoNarrate) audio.stopSpeech();
              setAutoNarrate((v) => !v);
              audio.click();
            }}
            data-color={autoNarrate ? "neon" : undefined}
            className="hud-btn px-2 py-1"
            title="Toggle auto-narration"
          >
            🎙 {autoNarrate ? "Narration" : "Silent"}
          </button>
        </div>
      )}
      {/* Case File — the explicit win/lose contract */}
      {showCaseFile && (
        <div className="hud-frame hud-frame-gold pop-in absolute right-3 top-24 z-[58] w-80 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="hud-kicker hud-kicker-left">🗂 Case File</span>
            <button onClick={() => setShowCaseFile(false)} className="text-paper/50 hover:text-neon">✕</button>
          </div>
          <hr className="hud-rule mb-2" />

          <div className="mb-2">
            <div className="font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">Your objective</div>
            <p className="font-type text-[11px] leading-snug text-paper/85">
              {story.briefing?.objective ?? `Work the case: ${story.tagline}`}
            </p>
          </div>

          <div className="mb-2">
            <div className="font-pulp text-[9px] uppercase tracking-widest text-emerald-400">✔ How you win</div>
            <ul className="mt-0.5 space-y-0.5">
              {(story.briefing?.winConditions ?? [
                "Collect the clue items hidden in each scene.",
                "Wire clues to suspects on the corkboard to unlock accusations.",
                "Make your final accusation only when the evidence backs it.",
              ]).map((w, i) => (
                <li key={i} className="font-type text-[10px] leading-snug text-paper/70">• {w}</li>
              ))}
            </ul>
          </div>

          <div className="mb-2">
            <div className="font-pulp text-[9px] uppercase tracking-widest text-crimson">✖ How you lose</div>
            <ul className="mt-0.5 space-y-0.5">
              {(story.briefing?.loseConditions ?? [
                "Accuse someone without the evidence to prove it.",
                "Let Heat max out — the city stops tolerating you.",
                "Burn every character's trust so nobody talks to you.",
              ]).map((l, i) => (
                <li key={i} className="font-type text-[10px] leading-snug text-paper/70">• {l}</li>
              ))}
            </ul>
          </div>

          {/* Live danger read-out */}
          {!!story.briefing?.heatLimit && (
            <div className="border-t border-paper/15 pt-2">
              <div className="mb-1 flex items-center justify-between font-pulp text-[9px] uppercase tracking-widest">
                <span className="text-paper/50">Heat before bust</span>
                <span className={state.meters.Suspicion >= story.briefing.heatLimit - 2 ? "text-crimson animate-pulse" : "text-gold"}>
                  {state.meters.Suspicion}/{story.briefing.heatLimit}
                </span>
              </div>
              <div className="h-2 w-full bg-noir-700">
                <div
                  className={`h-full transition-all ${state.meters.Suspicion >= story.briefing.heatLimit - 2 ? "bg-crimson" : "bg-gold"}`}
                  style={{ width: `${Math.min(100, (state.meters.Suspicion / story.briefing.heatLimit) * 100)}%` }}
                />
              </div>
              {state.meters.Suspicion >= story.briefing.heatLimit - 2 && (
                <p className="mt-1 font-type text-[10px] text-crimson">Lay low. One more slip ends the case.</p>
              )}
            </div>
          )}

          {/* Live progress */}
          {story.deduction && (
            <div className="mt-2 border-t border-paper/15 pt-2 font-type text-[10px] text-paper/55">
              Evidence wired: {story.deduction.connections.filter((c) => state.activeFlags.has(c.flagSet)).length}/{story.deduction.connections.length} ·
              Clues held: {state.inventory.filter((i) => i.isClue).length}
            </div>
          )}
        </div>
      )}

      {/* new game plus banner */}
      {banner && (
        <div className="absolute left-1/2 top-14 z-50 -translate-x-1/2 pop-in border-2 border-gold bg-noir-950/95 px-5 py-2 text-center">
          <div className="font-pulp text-gold text-sm uppercase tracking-widest">★ New Game+ ★</div>
          <div className="font-type text-xs text-paper/70">The city remembers you, detective. Old endings stay in your gallery.</div>
          <button onClick={() => setBanner(false)} className="mt-1 text-[10px] uppercase text-neon hover:underline">
            dismiss
          </button>
        </div>
      )}

      {/* toasts */}
      <div className="pointer-events-none absolute right-3 top-[88px] z-[55] flex w-80 flex-col gap-1.5" data-animatic-hide>
        {toasts.map((t) => (
          <div key={t.id} data-kind={t.kind} className="hud-toast slide-up">
            {t.text}
          </div>
        ))}
      </div>

      {/* "X will remember that" impact card */}
      {remember && (
        <div key={remember.key} className="pointer-events-none absolute inset-0 z-[72] flex items-center justify-center">
          <div className="remember-card border-y-2 border-gold/60 bg-black/85 px-8 py-4 text-center shadow-[0_0_60px_rgba(0,0,0,0.8)]">
            <span className="font-pulp text-2xl uppercase tracking-[0.2em] text-gold md:text-3xl">{remember.line}</span>
          </div>
        </div>
      )}

      {/* Examination card — what the hotspot you just clicked told you.
       * Black card, white text, the zone's name on it: impossible to miss,
       * impossible to misread, and it holds until you click or 7s pass. */}
      {examCard && !overlay && !inventoryModalOpen && !patternPuzzle && !pressLieBeat && !menuOpen && !mixerOpen && (
        <div
          className={`hud-frame ${examCard.kind === "fail" ? "hud-frame-crimson" : "hud-frame-gold"} pop-in absolute inset-x-0 bottom-[42%] z-[73] mx-auto flex w-full max-w-2xl cursor-pointer items-start gap-3 px-4 py-3`}
          onClick={() => {
            audio.stopSpeech();
            setExamCard(null);
          }}
          role="button"
          aria-label="Dismiss examination result"
        >
          <span className={`mt-0.5 shrink-0 font-pulp text-[10px] uppercase tracking-[0.2em] ${examCard.kind === "fail" ? "text-crimson" : "text-gold"}`}>
            🔍 {examCard.kind === "fail" ? "Locked" : "Examined"}
          </span>
          <span className="min-w-0 flex-1">
            <span className={`mb-0.5 block font-pulp text-[9px] uppercase tracking-[0.25em] ${examCard.kind === "fail" ? "text-crimson/80" : "text-gold/80"}`}>
              {examCard.label}
            </span>
            <span className="block font-type text-sm leading-relaxed text-paper md:text-base">{examCard.text}</span>
          </span>
          <span className="shrink-0 px-1 text-sm text-paper/40" aria-hidden>✕</span>
        </div>
      )}

      {/* ACT ROUTE MAP — the whole branching shape of the act just finished,
          shown before the next act's title card. */}
      {actMap && (
        <RouteMap
          story={story}
          actId={actMap.actId}
          journey={journey}
          currentSceneId={sceneId}
          onDone={() => {
            const dest = actMap.nextSceneId;
            setActMap(null);
            const act = actOpenedBy(dest);
            if (act) {
              seenActs.current.add(act.id);
              setPendingAct({ act, nextSceneId: dest });
              return;
            }
            goToScene(dest);
          }}
        />
      )}

      {/* ACT TITLE CARD — plays after any route chart, before the new act. */}
      {pendingAct && (
        <ActTitleCard
          story={story}
          act={pendingAct.act}
          onDone={() => {
            const dest = pendingAct.nextSceneId;
            setPendingAct(null);
            goToScene(dest);
          }}
        />
      )}

      {/* END-OF-PART route chart. Covers the screen between parts, showing
          only the decisions made since the previous break. */}
      {partBreak && (
        <Flowchart
          story={story}
          journey={journey.slice(chartedUpTo)}
          title={partBreak.title}
          variant="screen"
          onDone={() => {
            setChartedUpTo(journeyRef.current.length);
            const dest = partBreak.nextSceneId;
            setPartBreak(null);
            const act = actOpenedBy(dest);
            if (act) {
              const leaving = actOfScene(story, sceneIdRef.current);
              if (leaving && leaving !== act.id) {
                setActMap({ actId: leaving, nextSceneId: dest });
                return;
              }
              seenActs.current.add(act.id);
              setPendingAct({ act, nextSceneId: dest });
              return;
            }
            goToScene(dest);
          }}
        />
      )}

      {/* Bottom scrim so subtitles read over the art (TWAU-style) */}
      {scene.nodeType !== "credits" && scene.nodeType !== "cutscene" && !overlay && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[45] h-48 bg-gradient-to-t from-black/90 via-black/45 to-transparent" aria-hidden data-animatic-hide />
      )}

      {/* STRANDED — the room has nothing left to give. The verdict comes from
          the same decision surface the playthrough bot walks
          (src/game/stranded.ts), so it can never disagree with the simulation,
          and it is only shown after a grace period, on scenes the surface
          actually models. It sits OUTSIDE the narrative panel on purpose: that
          panel is invisible while walking a 🚶 stage, and a stage room with
          every marker spent is exactly the dead end this is for. */}
      {sceneReady && !inBeats && !scene.isEnding && strandedShown && !strandedDismissed && (
        <div className="absolute inset-x-0 bottom-0 z-[49] flex justify-center p-4 pl-24">
          <div
            className="pop-in pointer-events-auto max-w-2xl border-2 border-crimson/70 bg-noir-950/95 px-4 py-3 shadow-[0_4px_18px_rgba(0,0,0,0.45)] backdrop-blur-sm"
            role="status"
            aria-live="polite"
            data-stranded="true"
          >
            <div className="font-pulp text-[9px] uppercase tracking-[0.35em] text-crimson">
              ⚠ Nothing left to do here
            </div>
            <p className="mt-1 font-pulp text-sm leading-snug text-paper/85">
              Every way out of “{scene.title}” is spent or locked. That's a dead end in the writing, not a puzzle you
              haven't solved — undo the last decision, jump back to your checkpoint, or pick a save.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {canUndoDecision && (
                <button
                  onClick={doRewindDecision}
                  data-color="neon"
                  className="hud-btn px-2 py-1"
                  title={`Undo ${undoLabel} (Backspace)`}
                >
                  ↺ Rewind
                </button>
              )}
              <button
                onClick={resumeCheckpoint}
                data-color="cyan"
                className="hud-btn px-2 py-1"
                title="Reload the automatic checkpoint — written when you arrived, and refreshed as the scene moved"
              >
                ⤴ Last checkpoint
              </button>
              <button
                onClick={() => {
                  setSaves(readSaves(story.id, episodeId));
                  setOverlay({ type: "load" });
                }}
                className="hud-btn px-2 py-1"
                title="Open the Load screen"
              >
                📂 Load a save
              </button>
              <button
                onClick={() => setOverlay({ type: "quit" })}
                className="hud-btn px-2 py-1"
                title="Quit to the newsstand — your checkpoint is kept"
              >
                ⏏ Quit
              </button>
              <button
                onClick={() => {
                  audio.click();
                  setStrandedDismissed(true);
                  pushToast(episode ? `Backtracking to the start of ${episode.title}.` : "Backtracking to the start of the case.", "info");
                  goToScene(episode?.startSceneId ?? story.startSceneId);
                }}
                data-color="crimson"
                className="hud-btn px-2 py-1"
                title={`Last resort — walk back in from the start of the ${episode ? "episode" : "case"}. Everything since then is replayed.`}
              >
                ⤺ Restart {episode ? "episode" : "case"}
              </button>
              <button
                onClick={() => {
                  audio.click();
                  setStrandedDismissed(true);
                }}
                className="hud-btn px-2 py-1"
                title="Hide this until the scene changes"
              >
                ✕ Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* narrative panel — pointer-events-auto so clicks stay contained. An animatic hides it on ordinary scenes and draws
          its own captions; the title and the credits keep it, their text IS the shot. */}
      <div
        data-animatic-hide={scene.nodeType === "credits" ? undefined : ""}
        className={`absolute inset-x-0 bottom-0 z-[47] flex justify-center p-4 pl-4 sm:pl-24 ${
          scene.nodeType === "credits"
            ? // A montage is the point of the shot, so it stays visible: only the
              // plain (image-less) credits node gets the black scrim.
              `top-0 h-full items-center pl-4 ${creditsMontage.length ? "" : "bg-black/85 backdrop-blur-md"}`
            : ""
        }`}
        onClick={(e) => {
          // Prevent clicks on the panel background reaching scene hotspots
          e.stopPropagation();
          if (inBeats) advanceBeat();
        }}
      >
        <div
          className={
            scene.nodeType === "credits"
              ? // A title sequence needs the frame, not a prose column: a display
                // face at 7xl overflows max-w-2xl and wraps into a mess.
                "relative w-full max-w-6xl px-6 text-center"
              : "relative w-full max-w-3xl"
          }
        >
          {/* Authored panel backdrop (image / tint / blur). Credits nodes own
              the whole frame and already have their own scrim, so they opt out. */}
          {scene.nodeType !== "credits" && <DialogueBackdrop theme={dialogueTheme} />}
          {/* cinematic hold countdown — a title sequence shouldn't show a
              stopwatch, so credits nodes get a quiet progress rule pinned to
              the bottom of the frame instead of the inline readout. */}
          {/* A title sequence shouldn't show a stopwatch, so credits nodes get
              a quiet progress rule pinned to the bottom of the frame instead.
              It reads the roll's own countdown, not a second authored timer. */}
          {isCredits && !proseAcknowledged && creditsWait > 0 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2">
              <div className="h-px w-40 overflow-hidden bg-paper/15">
                <div
                  className="h-full bg-gold/70"
                  style={{
                    width: `${100 - (autoAdvanceRemaining / creditsWait) * 100}%`,
                    transition: "width 1s linear",
                  }}
                />
              </div>
            </div>
          )}
          {holdActive && !isCredits && (
            <div className="mb-2 flex items-center justify-center gap-2">
              <span className="animate-pulse font-pulp text-[10px] uppercase tracking-[0.3em] text-gold">
                ⏳ {holdRemaining}s
              </span>
              <span className="font-type text-[9px] uppercase tracking-widest text-paper/40">hold before choices</span>
            </div>
          )}
          {/* prose / dialogue as cinematic subtitles (TWAU-style). Standard
              nodes wear the cinema frame: a shimmering hairline, viewfinder
              corner ticks, and a speaker nameplate that re-announces each
              beat in the speaker's own accent. */}
          <div
            key={!scene.nodeType || scene.nodeType === "stage" ? `subframe:${sceneId}:${entrySeq}` : undefined}
            className={
              scene.nodeType === "credits"
                ? "p-6 text-center select-none"
                : scene.nodeType === "cutscene"
                  ? "border border-paper/10 bg-black/95 p-4 shadow-2xl"
                  : "prose-enter relative w-full max-w-2xl px-2 pb-1 pt-3 text-center"
            }
            onClick={(e) => { e.stopPropagation(); if (inBeats) advanceBeat(); }}
          >
            {(!scene.nodeType || scene.nodeType === "stage") && (!scene.isEnding || !endingReady) && (
              <>
                <span className="subframe-line" aria-hidden />
                {/* Interrogation pressure gauge: pressing replies drop the
                    suspect's composure; the colour, the live "break them now"
                    prediction and the steadying creep make the stakes and the
                    clock legible. At zero, trust decides crack vs clamp. */}
                {scene.interrogation &&
                  (() => {
                    const q = scene.interrogation!;
                    const suspect = story.characters.find((c) => c.id === q.characterId);
                    const initial = q.composure ?? 3;
                    const live = iqComposure[scene.id] ?? initial;
                    const broke = state.activeFlags.has(q.brokeFlag);
                    const clamped = !!q.clampFlag && state.activeFlags.has(q.clampFlag);
                    const resolved = broke || clamped;
                    const critical = !resolved && live === 1;
                    const pressured = !resolved && live < initial;
                    const willCrack = (state.characterTrust[q.characterId] ?? 0) >= (q.crackTrust ?? 0);
                    const fill = resolved ? 0 : live / initial;
                    const stageColor = resolved ? (broke ? "#e8b23c" : "#e23b4e") : critical ? "#e23b4e" : pressured ? "#e8b23c" : "#2ad9d9";
                    const stageLabel = resolved ? (broke ? "broken" : "clamped") : critical ? "on the edge" : pressured ? "strained" : "steady";
                    const steadySecs = Math.max(3, Math.min(12, q.steadySeconds ?? 7));
                    const canSteady = pressured && !iqSteadied.current[scene.id];
                    return (
                      <div className="mb-1.5 select-none" title="Composure — press (attitude replies) to break them; hesitate and they steady. At zero, their trust decides: talk, or shut down.">
                        <div className="flex items-center gap-2">
                          <span className="w-24 truncate text-right font-pulp text-[9px] uppercase tracking-[0.22em] text-paper/70">
                            {suspect?.name ?? "Suspect"}
                          </span>
                          <div key={iqPressKey} className={`iq-gauge relative flex-1 ${pressured || critical ? "iq-jolt" : ""}`}>
                            <div className="relative h-2.5 overflow-hidden rounded-sm bg-noir-700">
                              <div
                                className="h-full rounded-sm transition-[width] duration-300 ease-out"
                                style={{
                                  width: `${fill * 100}%`,
                                  background: `linear-gradient(90deg, ${stageColor}99, ${stageColor})`,
                                  boxShadow: critical ? `0 0 12px ${stageColor}` : pressured ? `0 0 6px ${stageColor}66` : undefined,
                                }}
                              />
                              {canSteady && (
                                <div
                                  key={iqSteadyKey}
                                  className="iq-steady-creep absolute inset-y-0 left-0"
                                  style={{ animationDuration: `${steadySecs}s` }}
                                />
                              )}
                            </div>
                          </div>
                          <span
                            className={`w-16 font-pulp text-[9px] uppercase tracking-[0.18em] ${
                              resolved ? (broke ? "text-gold" : "text-crimson") : critical ? "animate-pulse text-crimson" : pressured ? "text-gold" : "text-cyan-neon"
                            }`}
                          >
                            {stageLabel}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          {!resolved ? (
                            <span className={`font-type text-[9px] uppercase tracking-wider ${willCrack ? "text-emerald-400" : "text-crimson"}`}>
                              ◈ break them now — {willCrack ? "they'll talk" : "they'll shut down"}
                            </span>
                          ) : (
                            <span className="font-type text-[9px] uppercase tracking-wider text-paper/40">
                              {broke ? "they talked" : "they shut down"}
                            </span>
                          )}
                          <div className="relative h-4 min-w-0 flex-1 overflow-hidden text-right">
                            {iqReaction && (
                              <span key={iqReaction.key} className="iq-reaction absolute right-0 font-type text-[10px] italic text-paper/70">
                                {iqReaction.text}
                              </span>
                            )}
                            {iqStamp && (
                              <span
                                key={iqStamp.key}
                                className={`iq-stamp absolute right-0 font-pulp text-[12px] uppercase tracking-[0.2em] ${iqStamp.kind === "broke" ? "text-gold" : "text-crimson"}`}
                              >
                                {iqStamp.kind === "broke" ? "★ BROKE" : "✖ CLAMPED"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                <span className="subframe-tick tl" aria-hidden />
                <span className="subframe-tick tr" aria-hidden />
                <span className="subframe-tick bl" aria-hidden />
                <span className="subframe-tick br" aria-hidden />
                {/* The slot height is always reserved so the text never jumps
                    when a beat starts; the nameplate itself is keyed per beat
                    so every new speaker slides in under their accent. */}
                <div className="mb-1.5 flex h-5 items-center justify-center gap-2">
                  {inBeats && currentBeat && beatAccent && (
                    <span key={currentBeat.id} className="nameplate-in flex items-center gap-2">
                      <span className={`h-2.5 w-[3px] ${beatAccent.bar}`} aria-hidden />
                      <span
                        className={`font-pulp text-[11px] uppercase ${beatAccent.text}`}
                        style={{ textShadow: `0 0 14px ${beatAccent.glow}` }}
                      >
                        {beatIsVo ? "🎙 Narrator" : beatChar?.name ?? "Narrator"}
                      </span>
                      {!beatIsVo && currentBeat.expression && (
                        <span className="font-type text-[9px] italic normal-case tracking-normal text-paper/45">
                          {currentBeat.expression}
                        </span>
                      )}
                      <span className={`h-2.5 w-[3px] ${beatAccent.bar}`} aria-hidden />
                    </span>
                  )}
                </div>
              </>
            )}

            {!proseAcknowledged && (
              <div className={scene.nodeType === "credits" ? "space-y-5" : ""}>
                {scene.nodeType === "credits" ? (
                  <Credits prose={scene.prose} settings={scene.credits} onDone={() => setProseDone(true)} />
                ) : (
                  <p
                    className={`relative max-w-2xl leading-snug text-paper [text-shadow:_0_1px_2px_rgba(0,0,0,0.95),_0_0_10px_rgba(0,0,0,0.7)] ${
                      classicSubtitles
                        ? "ingame-prose-classic font-type"
                        : "ingame-prose font-type font-medium tracking-wide"
                    }`}
                    // Hold the full height from the first character so the
                    // controls above don't ride up as the line types in. The
                    // invisible sizer carries the longest text the scene can
                    // show; the typed output overlays it, so typing (and beat
                    // changes) never move the panel.
                    style={{ minHeight: reservedProse }}
                  >
                    <span className="invisible" aria-hidden>{panelSizerText || scene.prose}</span>
                    <span className="absolute inset-0">
                      {scene.noTypewriter ? (
                        <span>{scene.prose}</span>
                      ) : (
                        <Typewriter
                          key={`${sceneId}:${entrySeq}`}
                          text={scene.prose}
                          speed={typeSpeed}
                          forceComplete={proseDone}
                          onDone={() => setProseDone(true)}
                        />
                      )}
                    </span>
                  </p>
                )}
                {/* The continue affordance appears only once prose finishes.
                    In the bottom-anchored panel that late arrival would shove
                    everything above it upward, so on the standard node the
                    slot is reserved from the start and merely filled in.
                    Credits/cutscene nodes are centred, not bottom-anchored,
                    and their button is a large deliberate beat — they keep the
                    original pop-in. */}
                {reserveContinueSlot ? (
                  <div className="mt-3 flex h-7 items-center justify-center gap-2">
                    {proseDone && !emptyProseScene && (
                      <button
                        onClick={() => {
                          audio.click();
                          audio.stopSpeech();
                          setProseAcknowledged(true);
                        }}
                        className="continue-pill"
                      >
                        {`▸ continue to ${visibleBeats.length ? "dialogue" : "choices"}`}
                      </button>
                    )}
                    <button
                      onClick={toggleAuto}
                      className={`beat-ctl text-[10px] ${autoOn ? "border-neon text-neon bg-neon/10" : ""}`}
                      aria-pressed={autoOn}
                      title="Auto-continue: advance each line and scene on its own (click to turn off)"
                    >
                      ⏩ auto
                    </button>
                  </div>
                ) : proseDone && !isCredits && !(scene.nodeType === "cutscene" && holdActive) && (
                  /* A credits node deliberately has NO button. The roll ends
                     and the film moves on by itself; the only control is
                     "Skip title sequence" in the corner. The old "▸ Begin
                     Case" button sat under the roll, appeared too late to be
                     useful and — with no choices wired — acknowledged the
                     prose and then went nowhere, which is what made the end
                     credits look stuck. */
                  <button
                    onClick={() => {
                      audio.click();
                      // A cutscene node has no side-panel choices, so its
                      // continue button advances straight into the first choice.
                      if (scene.nodeType === "cutscene") {
                        const firstExit = availableChoices.find((c) => c.targetSceneId);
                        if (firstExit) {
                          pickChoice(firstExit);
                          return;
                        }
                      }
                      // Moving from prose into dialogue must cut the scene's
                      // recorded narration — otherwise the MP3 keeps droning
                      // under the character lines.
                      audio.stopSpeech();
                      setProseAcknowledged(true);
                    }}
                    className={
                      scene.nodeType === "cutscene"
                        ? "mt-6 border border-paper/40 px-5 py-2 font-pulp text-xs uppercase tracking-[0.2em] text-paper/80 hover:border-neon hover:text-neon"
                        : "mt-3 font-pulp text-[10px] uppercase tracking-widest text-gold hover:underline"
                    }
                  >
                    {scene.nodeType === "cutscene"
                      ? "▸ Continue"
                      : `▸ continue to ${visibleBeats.length ? "dialogue" : "choices"}`}
                  </button>
                )}
              </div>
            )}

            {inBeats && currentBeat && (
              <div className={`flex flex-col items-center gap-1 ${beatIsVo ? "opacity-95" : ""}`}>
                <p
                  className={`relative max-w-2xl leading-snug text-paper [text-shadow:_0_1px_2px_rgba(0,0,0,0.95),_0_0_10px_rgba(0,0,0,0.7)] ${
                    classicSubtitles
                      ? "ingame-prose-classic font-type text-left"
                      : "ingame-prose font-type font-medium tracking-wide"
                  }`}
                  style={{ minHeight: reservedProse }}
                >
                  {/* Same trick as the prose: the invisible sizer holds the
                      scene's tallest line so the panel never moves. In
                      classic mode the speaker prefix is part of BOTH strings
                      so the heights stay aligned. */}
                  <span className="invisible" aria-hidden>
                    {classicSubtitles
                      ? `${story.characters.find((c) => c.id === currentBeat.characterId)?.name ?? (currentBeat.characterId === "narrator" ? "Narrator" : "—")} — ${panelSizerText || currentBeatText}`
                      : panelSizerText || currentBeatText}
                  </span>
                  <span className="absolute inset-0">
                    {classicSubtitles ? (
                      <span>
                        <span className="mr-2 font-pulp text-[10px] uppercase tracking-[0.2em] text-gold">
                          {story.characters.find((c) => c.id === currentBeat.characterId)?.name ?? (currentBeat.characterId === "narrator" ? "Narrator" : "—")}
                        </span>
                        {scene.noTypewriter ? (
                          <span>{currentBeatText}</span>
                        ) : (
                          <Typewriter key={`${currentBeat.id}-classic`} text={currentBeatText} speed={typeSpeed} forceComplete={beatDone} onDone={() => setBeatDone(true)} />
                        )}
                      </span>
                    ) : scene.noTypewriter ? (
                      <span>{currentBeatText}</span>
                    ) : (
                      <Typewriter key={currentBeat.id} text={currentBeatText} speed={typeSpeed} forceComplete={beatDone} onDone={() => setBeatDone(true)} />
                    )}
                  </span>
                </p>
                {/* When the last beat routes into another scene, the cut is
                    the beat's point — over the whole routing beat (even while
                    typing) hide skip/back/timer controls so the insert plays
                    clean. Auto mode shows nothing and cuts on its timer;
                    continue mode shows only a Continue button. */}
                {onRoutingBeat && beatRouteMode === "auto" ? null : onRoutingBeat && beatRouteMode === "continue" ? (
                  <div className="mt-2 flex justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        advanceBeat();
                      }}
                      className="beat-ctl beat-ctl-primary"
                    >
                      {beatDone ? "▸ Continue · space" : "▸ Continue · space"}
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex flex-col items-center gap-1.5">
                    {/* PRESS THE LIE — when the line is a false claim the
                        player can challenge it with evidence. Only shows on a
                        pressable beat; once broken it's gone (the caught beat
                        plays as the next line), and too many bluffs shut it. */}
                    {currentLie && !currentLieBroken && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!beatDone) {
                            setBeatDone(true);
                            return;
                          }
                          if (!canPressLie) return;
                          if (state.inventory.length === 0) {
                            pushToast("You're holding nothing to press them with — find evidence first.", "fail");
                            return;
                          }
                          audio.stinger();
                          setPressLieBeat(currentBeat);
                        }}
                        disabled={!canPressLie}
                        className={`beat-ctl ${currentLieShut ? "opacity-40" : "border-crimson text-crimson hover:bg-crimson/20 animate-pulse"}`}
                        title={currentLieShut ? "They called your bluff — this claim is shut" : "Challenge this statement with a piece of evidence"}
                      >
                        🎯 {currentLieShut ? "they shut you down" : "Press them on that"}
                      </button>
                    )}
                    {currentLieWrongShown && (
                      <p className="max-w-xl font-type text-[12px] italic text-crimson/90" key={lieBluff?.key}>
                        {currentLieWrongShown}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goBack();
                      }}
                      disabled={!canRewind}
                      className="beat-ctl"
                      title="Rewind one line (←)"
                    >
                      ◂ back
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        advanceBeat();
                      }}
                      className="beat-ctl beat-ctl-primary"
                    >
                      {!beatDone ? "▸▸ skip" : "▸ continue · space"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakLine(currentBeat, currentBeatText);
                      }}
                      className="beat-ctl"
                      title="Speak the line"
                    >
                      🎤
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAuto();
                      }}
                      className={`beat-ctl ${autoOn ? "border-neon text-neon bg-neon/10" : ""}`}
                      data-active={autoOn || undefined}
                      title="Auto-continue: advances after typing completes (click to turn off)"
                      aria-pressed={autoOn}
                    >
                      ⏩ auto
                    </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* choices — credits/cutscene nodes auto-advance via the centered continue
              button when a choice is wired; if none is (or the author left the
              target blank), fall back to showing the choices so the player can
              never get trapped on a cinematic node. */}
          {choicesLive && !scene.isEnding && availableChoices.length > 0 && (
            <>
              {/* Big on-screen quick-time prompt banner. */}
              {qteActive && (
                <div className={`pop-in relative z-[48] mb-2 overflow-hidden border-2 px-4 py-3 text-center ${qtShaky ? "border-crimson bg-crimson/15" : "border-neon bg-noir-950/95"}`}>
                  <div className="font-pulp text-[9px] uppercase tracking-[0.35em] text-neon">⚠ Quick-time · Act fast</div>
                  <div className="font-pulp mt-1 text-xl uppercase leading-tight text-paper">
                    {availableChoices.find((c) => c.quickTime)?.qtePrompt ?? "DECIDE!"}
                  </div>
                  {qtShaky && (
                    <div className="absolute inset-0 z-[-1] flex items-center justify-center opacity-30">
                      <span className="font-pulp text-4xl tracking-[0.5em] text-crimson">⋯</span>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-2 space-y-1.5" role="menu" aria-label="Choices">
                {availableChoices.map((c, i) => {
                  const gate = effectiveChoiceGating(c);
                  const ok = meetsGating(gate, state);
                  const clock = choiceClocks[c.id];
                  // EVERY timed choice gets a shrinking ring now. It used to
                  // require `quickTime`, so a plain conversation clock was
                  // invisible while its ⏱ readout still counted down to zero.
                  const flavour = timerFlavour(c);
                  const timerStyle = flavour ? TIMER_STYLE[flavour] : null;
                  const qtePct = showsCountdownRing(c)
                    ? (clock !== undefined ? clock / c.timeLimitSeconds! : 1)
                    : undefined;
                  const critical = qtePct !== undefined && qtePct <= 0.3;
                  return (
                    <button
                      key={c.id}
                      role="menuitem"
                      disabled={!ok || fading}
                      onClick={() => (cutInLive ? pickCutIn(c) : pickChoice(c))}
                      onMouseEnter={() => {
                        setChoiceFocus(i);
                        audio.hover();
                      }}
                      className={`pop-in choice-btn flex w-full items-center gap-2 px-3 py-2.5 text-left font-pulp text-base leading-tight backdrop-blur-sm shadow-[0_4px_18px_rgba(0,0,0,0.45)] transition-all hover:-translate-y-0.5 ${
                        c.reply
                          ? `rounded-xl border border-cyan-neon/40 bg-cyan-neon/10 text-cyan-neon hover:border-cyan-neon/80 hover:bg-cyan-neon/20 ${choiceFocus === i && ok ? "ring-2 ring-neon/50" : ""}`
                          : `border-l-4 bg-noir-950/90 ${ATTITUDE_COLOR[c.attitudeTag ?? "Neutral"]} ${choiceFocus === i && ok ? "bg-noir-700/95 ring-1 ring-neon/40" : ""} ${!ok ? "opacity-45 cursor-not-allowed" : "hover:bg-noir-700/95"}`
                      }`}
                      style={{ animationDelay: `${i * 70}ms` }}
                    >
                      {/* Countdown ring around a timed choice button: gold for
                          a quick-time prompt, cool cyan for a conversation
                          clock — same shrinking ring, calmer palette. */}
                      {qtePct !== undefined && (
                        <span
                          className="qte-ring relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                          data-timer={flavour}
                          style={{ "--qte-pct": `${Math.max(0, Math.min(100, qtePct * 100))}%`, "--qte-critical": critical ? "1" : "0", "--qte-col": critical ? timerStyle!.criticalRing : timerStyle!.ring } as React.CSSProperties}
                          aria-label={`${Math.round(qtePct * 100)}% time left`}
                        >
                          <span className="font-pulp text-[10px] text-paper/90">{i + 1}</span>
                        </span>
                      )}
                      {qtePct === undefined && (
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-noir-800/90 font-pulp text-[10px] ${ATTITUDE_BADGE[c.attitudeTag ?? "Neutral"]}`}
                        >
                          {i + 1}
                        </span>
                      )}
                      <span className="flex-1">
                        {!ok && "🔒 "}
                        {c.reply && <span className="mr-1" title="Conversational reply — stays in this scene">💬</span>}
                        {c.presentItem && (
                          <span
                            className="mr-1"
                            title={`Presents: ${story.items.find((i) => i.id === c.presentItem)?.name ?? c.presentItem}`}
                          >
                            {story.items.find((i) => i.id === c.presentItem)?.icon ?? "📜"}
                          </span>
                        )}
                        {c.text}
                        {!ok && gate && (
                          <span className="ml-2 text-[10px] uppercase tracking-wider text-paper/40">[{gatingHint(gate, story)}]</span>
                        )}
                        {ok && c.gating?.requiresFlags?.some((f) => story.deduction?.connections.some((d) => d.flagSet === f)) && (
                          <span className="ml-2 text-[10px] uppercase tracking-wider text-gold">[board unlock]</span>
                        )}
                      </span>
                      {c.attitudeTag && c.attitudeTag !== "Neutral" && (
                        <span className="shrink-0 font-pulp text-[9px] uppercase tracking-widest opacity-70" title={METER_LABELS[c.attitudeTag as MeterKey] ?? c.attitudeTag}>
                          <span className="mr-1" aria-hidden>{ATTITUDE_ICON[c.attitudeTag]}</span>
                          {METER_LABELS[c.attitudeTag as MeterKey] ?? c.attitudeTag}
                        </span>
                      )}
                      {/* CHANCE GAMBLE — the odds, up front, before the player commits. */}
                      {typeof c.chance === "number" && (
                        <span
                          className="shrink-0 border border-neon/60 bg-neon/10 px-1.5 py-0.5 font-pulp text-[9px] uppercase tracking-widest text-neon"
                          title={`A gamble — a ${Math.round(c.chance)}% chance it lands. A miss takes the fail route (and its own consequences). The roll is part of the seeded run.`}
                        >
                          🎲 {Math.round(c.chance)}%
                        </span>
                      )}
                      {clock !== undefined && (
                        <span className={`font-pulp text-xs ${critical ? "text-crimson animate-pulse" : timerStyle?.readout ?? "text-gold"}`}>⏱ {clock}s</span>
                      )}
                      {choiceFocus === i && ok && (
                        <span className="shrink-0 font-pulp text-[9px] uppercase tracking-widest text-paper/50">⏎</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Travel absorbed by the map: the road out lives on the 🗺 screen. */}
          {travelViaMap > 0 && (
            <div className="mt-2" role="menu" aria-label="Travel">
              <button
                onClick={() => setOverlay({ type: "map" })}
                className="group flex w-full items-center gap-2 border border-gold/50 bg-noir-950/95 px-3 py-2 text-left transition-colors hover:border-gold hover:bg-gold/10"
              >
                <span aria-hidden>🗺</span>
                <span className="min-w-0 flex-1 font-body text-sm text-paper/90 group-hover:text-paper">
                  Open the map — pick your next stop
                </span>
                <span className="shrink-0 font-pulp text-[9px] uppercase tracking-widest text-paper/40">T</span>
              </button>
            </div>
          )}

          {/* Auto beat-route timer is intentionally hidden for a clean
              cinematic cut. (Continue mode keeps its single button above.) */}

          {interactive && !scene.isEnding && !hasUsableChoice && hasValidAutoAdvance && !scene.autoAdvanceHideTimer && autoAdvanceRemaining > 0 && (
            <div className="hud-chrome mt-2 border border-gold/40 bg-noir-950/90 px-3 py-2 text-center">
              <p className="font-pulp text-[10px] uppercase tracking-widest text-gold">
                ⏱ Next scene in {autoAdvanceRemaining}s
              </p>
            </div>
          )}

          {/* cinematic nodes (credits/cutscene) with no reachable choices get a
              visible escape hatch — otherwise they'd silently strand the player
              with no HUD and no way forward. */}
          {interactive && !scene.isEnding && hasAuthoredRoute && !autoContinue && scene.nodeType !== "credits" && !hasUsableChoice && proseAcknowledged && (!inBeats || beatDone) && (
            <div className="mt-2 text-center">
              <button
                onClick={() => {
                  audio.click();
                  audio.stopSpeech();
                  leaveFor(scene.autoAdvanceTargetSceneId as string, scene.partBreak);
                }}
                className="border border-paper/40 px-4 py-1.5 font-pulp text-[10px] uppercase tracking-widest text-paper/80 hover:border-neon hover:text-neon"
              >
                ▸ Next scene
              </button>
            </div>
          )}

          {interactive && !scene.isEnding && !hasValidAutoAdvance && !hasAuthoredRoute && (scene.nodeType === "credits" || scene.nodeType === "cutscene") && availableChoices.length === 0 && (
            <div className="mt-2 border border-crimson/50 bg-crimson/10 p-3 text-center">
              <p className="font-type text-[11px] text-crimson">
                This {scene.nodeType} node has no choices wired — there's nowhere to go.
              </p>
              <button
                onClick={() => {
                  audio.click();
                  pushToast("Backtracking to the start.", "info");
                  goToScene(episode?.startSceneId ?? story.startSceneId);
                }}
                className="mt-2 border border-crimson/60 px-3 py-1.5 font-pulp text-[10px] uppercase tracking-widest text-crimson hover:bg-crimson/20"
              >
                ⤺ Return to start
              </button>
            </div>
          )}

          {/* Episode curtain — in a season, an ending closes the CHAPTER, so the
              wrapper supplies an end-of-episode card (defining choices, season
              progress, "next time on…") in place of the case-closed panel. */}
          {endingReady && scene.isEnding && scene.endingData && episodeEndPanel && (
            <>
              {episodeEndPanel}
              {/* The route map belongs to the run, and `journey` lives here in
                  CasePlayer, so the chart is rendered beside the episode card
                  rather than threaded up through SeasonPlayer. */}
              <Flowchart
                story={story}
                journey={journey}
                endingHeadline={scene.endingData.headline}
                endingTier={scene.endingData.tier}
                title={`${scene.title} — Your Route`}
              />
            </>
          )}

          {/* Full-screen ending — Detroit: Become Human style flowchart */}
          {endingReady && scene.isEnding && scene.endingData && !episodeEndPanel && (
            <div className="fixed inset-0 z-[85] flex flex-col bg-noir-950/98 overflow-hidden">
              <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-5 py-6">
                {/* Header: ending badge + headline */}
                <div className="shrink-0 border-b border-gold/25 pb-4 text-center">
                  <div className={`font-pulp text-[11px] uppercase tracking-[0.3em] ${
                    scene.endingData.tier === "gameover" ? "text-crimson"
                    : scene.endingData.tier === "victory-gold" ? "text-gold"
                    : "text-paper/70"}`}>
                    {scene.endingData.tier === "victory-gold" ? "★★ Gold Case ★★"
                    : scene.endingData.tier === "victory-silver" ? "★ Silver Case ★"
                    : "✖ Game Over ✖"}
                  </div>
                  <h2 className="font-pulp mt-1 text-3xl uppercase leading-tight text-paper drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{scene.endingData.headline}</h2>
                  <div className="font-type mt-1 text-[10px] uppercase tracking-[0.3em] text-paper/40">Chapter Complete · {story.title}</div>
                </div>

                {/* Scrollable flowchart */}
                <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
                  <Flowchart
                    story={story}
                    journey={journey}
                    endingHeadline={scene.endingData.headline}
                    endingTier={scene.endingData.tier}
                    title="Your Route"
                  />
                </div>

                {/* Footer: recap + buttons */}
                <div className="shrink-0 border-t border-gold/25 pt-3">
                  <p className="text-center font-type text-sm italic text-paper/55">{scene.endingData.recap}</p>
                  <p className="mt-2 text-center font-type text-[9px] uppercase tracking-[0.35em] text-paper/30">A Gaslight Reelworks Production</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => {
                        audio.click();
                        setState(createInitialState(story));
                        setUsedHotspots(new Set());
                        setUsedChoices(new Set());
                        setVisitedScenes(new Set());
                        setEncounteredCharacters(new Set());
                        setJourney([]);
                        setChartedUpTo(0);
                        setPartBreak(null);
                        setPendingAct(null);
                        setActMap(null);
                        seenActs.current = new Set();
                        visitedRef.current = new Set();
                        seenBeatIdsRef.current = new Set();
                        enteredRef.current = "";
                        heatBustFired.current = false;
                        craftHintShown.current = false;
                        setBanner(true);
                        goToScene(story.startSceneId);
                      }}
                      className="border-2 border-gold bg-gold/15 px-5 py-2 font-pulp text-xs uppercase tracking-widest text-gold hover:bg-gold hover:text-noir-950"
                    >
                      ↻ New Game+
                    </button>
                    {(() => {
                      const newest = saves.reduce<{ slot: number; at: number } | null>(
                        (best, s, i) => (s && (!best || s.savedAt > best.at) ? { slot: i + 1, at: s.savedAt } : best),
                        null
                      );
                      return newest ? (
                        <button
                          onClick={() => doLoad(newest.slot)}
                          className="border-2 border-cyan-neon/60 px-5 py-2 font-pulp text-xs uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/15"
                        >
                          ↺ Load last save
                        </button>
                      ) : null;
                    })()}
                    {saveFilesAvailable() && (
                      <button
                        onClick={() => void doExportSave()}
                        title="Save this completed run as a .sreel file you can keep"
                        className="border-2 border-gold/50 px-5 py-2 font-pulp text-xs uppercase tracking-widest text-gold hover:bg-gold/10"
                      >
                        📁 Export this playthrough
                      </button>
                    )}
                    <button
                      onClick={onExit}
                      className="border-2 border-paper/40 px-5 py-2 font-pulp text-xs uppercase tracking-widest text-paper/70 hover:border-gold hover:text-gold"
                    >
                      Back to the Newsstand
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!hudHidden && (
        <InventoryDock
          onModalOpenChange={setInventoryModalOpen}
          state={state}
          display={invDisplay}
          onInspect={(item) => setOverlay({ type: "inspect", item })}
          onCombine={handleCombine}
          onExplainCrafting={explainCrafting}
          hasCrafting={story.items.some((item) => item.combinableWith)}
          onUseItem={handleItemDrop}
        />
      )}

      {/* Floating sound + help — one mixer button and one help button.
          Suppressed in the NO-HUD layout (the M key still mutes). */}
      {!hudHidden && (
      <div className="hud-frame absolute bottom-4 right-4 z-[55] flex items-center gap-1.5 px-1.5 py-1">
        <button
          onClick={() => {
            audio.click();
            setMixerOpen((o) => !o);
          }}
          className="hud-btn relative px-2.5 py-1.5"
          data-active={mixerOpen || undefined}
          title="Sound mixer"
          aria-label="Sound mixer"
          aria-expanded={mixerOpen}
        >
          <span>{soundOn ? "🔊" : "🔇"}</span> Sound
          {soundBlocked && soundOn && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-crimson shadow-[0_0_8px_rgba(226,59,78,0.9)]" />
          )}
        </button>
        <button
          onClick={() => {
            audio.click();
            setOverlay({ type: "instructions" });
          }}
          className="hud-btn h-8 w-8 px-0 text-sm"
          title="How to play"
          aria-label="How to play"
        >
          ?
        </button>
      </div>
      )}

      {/* Sound mixer popover */}
      {mixerOpen && !hudHidden && !inventoryModalOpen && !overlay && !patternPuzzle && (
        <div className="hud-frame hud-frame-gold pop-in absolute bottom-16 right-4 z-[65] w-72 p-3">
          <div className="mb-2 flex items-center justify-between border-b border-gold/20 pb-1.5">
            <span className="hud-kicker hud-kicker-left">🎚 Sound</span>
            <button onClick={() => setMixerOpen(false)} className="px-1 text-paper/50 hover:text-neon" aria-label="Close mixer">✕</button>
          </div>

          <div className="mb-3 flex gap-2">
            <button
              onClick={() => { setSoundOn(false); audio.click(); }}
              data-color={!soundOn ? "crimson" : undefined}
              data-active={!soundOn || undefined}
              className="hud-btn flex-1 px-2 py-1.5"
            >
              🔇 Mute
            </button>
            <button
              onClick={() => enableSound()}
              data-color={soundOn ? "cyan" : undefined}
              className="hud-btn flex-1 px-2 py-1.5"
            >
              🔊 Unmute
            </button>
          </div>

          <button
            onClick={togglePulp}
            data-active={pulpOn || undefined}
            data-color={pulpOn ? "cyan" : undefined}
            className="hud-btn mb-3 w-full px-2 py-1.5"
            title="The pulp-paper halftone dots and grain over the art"
          >
            Pulp paper: {pulpOn ? "ON" : "OFF"}
          </button>

          {musicTrack && (
            <button
              onClick={() => {
                const a = sceneAudioRef.current;
                if (a) {
                  if (a.paused) enableSound();
                  else { a.pause(); setMusicPlaying(false); audio.click(); }
                }
              }}
              data-active={musicPlaying || undefined}
              className="hud-btn mb-2 w-full px-2 py-1.5"
            >
              🎵 Music {musicPlaying ? "playing — tap to pause" : "paused — tap to play"}
            </button>
          )}

          {/* Master + scene-music faders. Scene music is a raw Audio element, so its
              effective volume is master × music; the music fader lets the player duck
              just the soundtrack (e.g. under narration) without touching the rest. */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60">
              <span className="w-16 shrink-0">Master</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volumes.master ?? 0.8}
                onChange={(e) => changeVolume("master", Number(e.target.value))}
                className="flex-1 accent-pink-500"
                aria-label="Master volume"
              />
              <span className="w-9 shrink-0 text-right font-type text-paper/50">{Math.round((volumes.master ?? 0.8) * 100)}%</span>
            </label>
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60">
              <span className="w-16 shrink-0">Scene music</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volumes.music ?? 0.8}
                onChange={(e) => changeVolume("music", Number(e.target.value))}
                className="flex-1 accent-pink-500"
                aria-label="Scene music volume"
              />
              <span className="w-9 shrink-0 text-right font-type text-paper/50">{Math.round((volumes.music ?? 0.8) * 100)}%</span>
            </label>
            <label className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60">
              <span className="w-16 shrink-0">Voice duck</span>
              <button
                onClick={() => {
                  setDuckOn(!duckOn);
                  audio.click();
                }}
                data-color={duckOn ? "cyan" : undefined}
                data-active={duckOn || undefined}
                className="hud-btn flex-1 px-2 py-1"
              >
                {duckOn ? "On — sine dip under voice" : "Off — music stays level"}
              </button>
            </label>
          </div>
          <p className="mt-1 font-type text-[9px] leading-snug text-paper/40">
            Master scales everything · Scene music ducks just the soundtrack. Voice duck dips the music on a
            sine curve the moment dialogue or narration starts, and lets it back after a beat of silence.
            Ambience, voice and effects stay in the newsstand's Sound Booth.
          </p>
        </div>
      )}

      {/* Skip the title sequence. Up for the WHOLE roll — it used to be gated
          on `!proseDone && !holdActive`, which on the end credits left it
          visible for about a tenth of a second and unclickable, so the only
          way out of a two-minute roll was to sit through it. */}
      {isCredits && !proseAcknowledged && !overlay && (
        <button
          data-animatic-hide
          className="absolute bottom-5 right-5 z-[60] rounded border border-paper/30 bg-noir-950/85 px-4 py-2 font-type text-xs text-paper/80 hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-gold"
          onClick={() => {
            audio.click();
            skipCredits();
          }}
        >
          Skip title sequence
        </button>
      )}

      {/* overlays */}
      {overlay?.type === "instructions" && (
        <Modal
          title="How to Play Scarlet Reel"
          onClose={() => {
            setOverlay(null);
            if (autoNarrate && scene && !proseAcknowledged && shouldAutoNarrateSceneProse(scene)) {
              playProse(scene);
            }
          }}
          wide
        >
          <div className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
            <div>
              <h3 className="font-pulp text-lg uppercase text-gold">The gameplay loop</h3>
              <ol className="mt-3 space-y-3 font-type text-sm text-paper/80">
                <li><b className="text-cyan-neon">1. Read the scene.</b> Press Continue when the setup is clear. Skip only fast-forwards text.</li>
                <li><b className="text-cyan-neon">2. Investigate.</b> Use Scene Actions on the right or click glowing areas in the picture. Actions stay available during dialogue.</li>
                <li><b className="text-cyan-neon">3. Collect evidence.</b> Items go into the Inventory. If two items form a recipe, drag one item onto the other.</li>
                <li><b className="text-cyan-neon">4. Solve mini-games.</b> Their controls appear inside each puzzle. Winning gives a clue, flag, or route to the next scene.</li>
                <li><b className="text-cyan-neon">5. Build the case.</b> Open the Corkboard and drag from a clue's red pin onto the person it implicates. Correct links unlock deductions.</li>
                <li><b className="text-cyan-neon">6. Accuse carefully.</b> Open the Case File to see the exact win and lose rules. Accusing without proof usually loses the case.</li>
              </ol>
            </div>
            <div className="space-y-4">
              <div className="border border-gold/35 bg-gold/5 p-3">
                <h3 className="font-pulp text-sm uppercase text-gold">What Case Progress does</h3>
                <p className="mt-1 font-type text-xs leading-relaxed text-paper/70">
                  It is your detective notebook. It shows attitude meters, active perks, people you have met, clues in your inventory, and how many corkboard links you have solved. It does not require clicking to progress.
                </p>
              </div>
              <div className="border border-crimson/35 bg-crimson/5 p-3">
                <h3 className="font-pulp text-sm uppercase text-crimson">How you lose</h3>
                <p className="mt-1 font-type text-xs leading-relaxed text-paper/70">
                  Wrong accusations, failed puzzles, and intimidating choices can raise Heat. Some cases end automatically when Heat reaches its limit. The Case File always shows that limit.
                </p>
              </div>
              <div className="border border-paper/20 p-3">
                <h3 className="font-pulp text-sm uppercase text-paper/70">Controls</h3>
                <p className="mt-1 font-type text-xs leading-relaxed text-paper/60">
                  Space / Enter: continue dialogue (a press while text types finishes the line) · ←: back one line · Shift+←: restart scene · Backspace: rewind one decision · 1–9: choices · ↑↓ / W S: move choice focus · B: corkboard · L: dialogue log · M: mute · .: skip text · Esc: close / quit
                </p>
              </div>
              <button
                onClick={() => {
                  setOverlay(null);
                  if (autoNarrate && scene && !proseAcknowledged && shouldAutoNarrateSceneProse(scene)) {
                    playProse(scene);
                  }
                }}
                className="w-full border-2 border-neon bg-neon/10 py-3 font-pulp text-sm uppercase tracking-[0.18em] text-neon hover:bg-neon/20"
              >
                Start / Resume Case
              </button>
            </div>
          </div>
        </Modal>
      )}

      {overlay?.type === "inspect" && (
        <Modal title="Evidence Close-Up" onClose={() => setOverlay(null)}>
          <div className="flex items-start gap-4">
            <div className="flex h-24 w-24 items-center justify-center border-2 border-gold/50 bg-noir-950 sprite-sway">
              {overlay.item.iconUrl ? (
                <img src={assetUrl(overlay.item.iconUrl)} alt={overlay.item.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-6xl">{overlay.item.icon}</span>
              )}
            </div>
            <div>
              <h4 className="font-pulp text-gold uppercase tracking-wide">{overlay.item.name}</h4>
              {overlay.item.isClue && (
                <span className="font-pulp text-[9px] uppercase tracking-widest text-crimson">📌 Clue — pin it on the corkboard</span>
              )}
              <p className="font-type mt-2 text-sm text-paper/85">{overlay.item.description}</p>
              <p className="font-type mt-2 text-xs italic text-neon/80">“{overlay.item.flavorText}”</p>
              {overlay.item.combinableWith && (
                <p className="mt-2 text-[10px] uppercase tracking-wider text-paper/50">Feels like it pairs with something...</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {overlay?.type === "relationships" && (
        <Modal title="People & Relationships — the ledger" onClose={() => setOverlay(null)} wide>
          <p className="mb-3 font-type text-xs text-paper/70">
            Your standing with the people you've crossed. Trust and the flags you've set shape what each of them thinks of
            you — and it all carries across saves.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {story.characters.map((c) => {
              const met = encounteredCharacters.has(c.id);
              const op = characterOpinion(c, state.characterTrust[c.id] ?? c.trustMeter, state.activeFlags);
              const border =
                op.sentiment === "devoted" || op.sentiment === "trusting"
                  ? "border-emerald-500/50"
                  : op.sentiment === "warming"
                    ? "border-gold/50"
                    : op.sentiment === "hostile" || op.sentiment === "terrified"
                      ? "border-crimson/60"
                      : op.sentiment === "wary"
                        ? "border-paper/30"
                        : "border-noir-600";
              const textCol =
                op.sentiment === "devoted" || op.sentiment === "trusting"
                  ? "text-emerald-400"
                  : op.sentiment === "warming"
                    ? "text-gold"
                    : op.sentiment === "hostile" || op.sentiment === "terrified"
                      ? "text-crimson"
                      : op.sentiment === "wary"
                        ? "text-paper/70"
                        : "text-paper/60";
              return (
                <div key={c.id} className={`border ${border} bg-noir-900/60 p-2.5 ${met ? "" : "opacity-55"}`}>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden border border-gold/40 bg-noir-950">
                      {!c.avatarUrl || c.avatarUrl.startsWith("emoji:") ? (
                        <div className="flex h-full w-full items-center justify-center text-2xl">{c.avatarUrl.slice(6) || "👤"}</div>
                      ) : (
                        <img src={assetUrl(c.avatarUrl)} alt={c.name} className="h-full w-full object-cover object-top" loading="lazy" decoding="async" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-pulp text-[11px] uppercase tracking-wide text-paper">{c.name}</div>
                      <div className="truncate font-type text-[10px] text-paper/50">{c.role || "?"}</div>
                      <div className={`font-pulp text-[10px] uppercase tracking-widest ${textCol}`}>
                        {met ? op.label : "Not yet met"}
                      </div>
                    </div>
                    <div className="w-16 shrink-0 text-right">
                      <div className="h-1.5 w-full bg-noir-600">
                        <div
                          className={`h-full transition-all duration-500 ${state.characterTrust[c.id] > 0 ? "bg-emerald-500" : state.characterTrust[c.id] < 0 ? "bg-crimson" : "bg-paper/30"}`}
                          style={{ width: `${Math.min(100, (Math.abs(state.characterTrust[c.id] ?? 0) / 5) * 100)}%` }}
                        />
                      </div>
                      <div className="mt-0.5 font-type text-[9px] text-paper/45">
                        {state.characterTrust[c.id] > 0 ? `+${state.characterTrust[c.id]}` : state.characterTrust[c.id]}
                      </div>
                    </div>
                  </div>
                  <p className="mt-1.5 font-type text-[11px] leading-snug text-paper/80">{met ? op.line : "You haven't crossed paths yet."}</p>
                  {met && op.flags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {op.flags.map((f) => (
                        <span key={f} className="border border-gold/30 bg-gold/5 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-gold/80">
                          {f.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Modal>
      )}

      {patternPuzzle && (
        <PatternPuzzleGame
          config={patternPuzzle.config}
          onSolved={() => {
            const cfg = patternPuzzle.config;
            if (cfg.rewardConsequences) {
              setState((s) => applyConsequences(story, cfg.rewardConsequences, s));
            }
            if (cfg.payoffText) {
              setExamCard({ label: "Pattern cracked", text: cfg.payoffText, kind: "info" });
            }
            setUsedHotspots((u) => new Set(u).add(`${sceneId}:${patternPuzzle.hotspot.id}`));
            setInvestigatedThisVisit(true);
            const dest = cfg.targetSceneId;
            setPatternPuzzle(null);
            if (dest) window.setTimeout(() => goToScene(dest), 100);
          }}
          onWrong={() => {
            const cfg = patternPuzzle.config;
            if (cfg.wrongSubmissionConsequences) {
              setState((s) => applyConsequences(story, cfg.wrongSubmissionConsequences, s));
            }
            setUsedHotspots((u) => new Set(u).add(`${sceneId}:${patternPuzzle.hotspot.id}`));
            const dest = cfg.wrongTargetSceneId;
            setPatternPuzzle(null);
            if (dest) window.setTimeout(() => goToScene(dest), 100);
          }}
          onClose={() => setPatternPuzzle(null)}
        />
      )}

      {esperModal && (
        <EsperGame
          config={esperModal.config}
          onComplete={(region, allDone) => {
            const cfg = esperModal.config;
            if (region.flagSet) {
              setState((s) => applyConsequences(story, { setFlags: [region.flagSet!] }, s));
            }
            if (region.itemGranted) {
              setState((s) => applyConsequences(story, { addItems: [region.itemGranted!] }, s));
            }
            if (allDone && cfg.rewardConsequences) {
              setState((s) => applyConsequences(story, cfg.rewardConsequences, s));
            }
            setUsedHotspots((u) => new Set(u).add(`${sceneId}:${esperModal.hotspot.id}`));
            setInvestigatedThisVisit(true);
            if (allDone) {
              if (cfg.winText) {
                setExamCard({ label: "ESPER Analysis Complete", text: cfg.winText, kind: "info" });
              }
              const dest = cfg.targetSceneId;
              setEsperModal(null);
              if (dest) window.setTimeout(() => goToScene(dest), 100);
            }
          }}
          onCancel={() => setEsperModal(null)}
        />
      )}

      {vkModal && (
        <VkGame
          config={vkModal.config}
          onComplete={(isReplicant) => {
            const cfg = vkModal.config;
            if (isReplicant) {
              if (cfg.replicantFlagSet) {
                setState((s) => applyConsequences(story, { setFlags: [cfg.replicantFlagSet!] }, s));
              }
              if (cfg.rewardConsequences) {
                setState((s) => applyConsequences(story, cfg.rewardConsequences, s));
              }
              setExamCard({ label: "Voight-Kampff Result", text: "VERDICT CONFIRMED: REPLICANT DETECTED.", kind: "info" });
              const dest = cfg.replicantTargetSceneId || cfg.targetSceneId;
              setVkModal(null);
              if (dest) window.setTimeout(() => goToScene(dest), 100);
            } else {
              if (cfg.humanFlagSet) {
                setState((s) => applyConsequences(story, { setFlags: [cfg.humanFlagSet!] }, s));
              }
              setExamCard({ label: "Voight-Kampff Result", text: "VERDICT CONFIRMED: SUBJECT IS HUMAN.", kind: "info" });
              const dest = cfg.humanTargetSceneId || cfg.targetSceneId;
              setVkModal(null);
              if (dest) window.setTimeout(() => goToScene(dest), 100);
            }
            setUsedHotspots((u) => new Set(u).add(`${sceneId}:${vkModal.hotspot.id}`));
            setInvestigatedThisVisit(true);
          }}
          onCancel={() => setVkModal(null)}
        />
      )}

      {arcadeGame && (
        <ArcadeGame
          config={arcadeGame.config}
          onWin={() => {
            const cfg = arcadeGame.config;
            if (cfg.rewardConsequences) {
              setState((s) => applyConsequences(story, cfg.rewardConsequences!, s));
            }
            if (cfg.winText) setExamCard({ label: "High score", text: cfg.winText, kind: "info" });
            setUsedHotspots((u) => new Set(u).add(`${sceneId}:${arcadeGame.hotspot.id}`));
            const dest = cfg.targetSceneId;
            setArcadeGame(null);
            if (dest) window.setTimeout(() => goToScene(dest), 100);
          }}
          onLose={() => {
            const cfg = arcadeGame.config;
            if (cfg.loseConsequences) {
              setState((s) => applyConsequences(story, cfg.loseConsequences!, s));
            }
            const dest = cfg.loseTargetSceneId;
            setArcadeGame(null);
            if (dest) window.setTimeout(() => goToScene(dest), 100);
          }}
          onClose={() => setArcadeGame(null)}
        />
      )}

      {rideChoice && (
        <RideGame
          config={rideChoice.ride!}
          onWin={() => finishRide(rideChoice, true)}
          onCrash={() => finishRide(rideChoice, false)}
          onClose={() => setRideChoice(null)}
        />
      )}

      {triangulateChoice && (
        <TriangulateGame
          config={triangulateChoice.triangulate!}
          onWin={() => {
            const c = triangulateChoice;
            setTriangulateChoice(null);
            finishRide(c, true);
          }}
          onFail={() => {
            const c = triangulateChoice;
            setTriangulateChoice(null);
            finishRide(c, false);
          }}
          onClose={() => setTriangulateChoice(null)}
        />
      )}

      {pressLieBeat?.lie && (
        <Modal title="Press them — present your evidence" onClose={() => setPressLieBeat(null)} wide>
          <p className="mb-1 font-pulp text-[10px] uppercase tracking-widest text-crimson">
            The claim you're challenging
          </p>
          <p className="mb-3 border-l-2 border-crimson/60 pl-3 font-type text-sm italic text-paper/90">
            “{pressLieBeat.lie.claim?.trim() || resolveBeatText(pressLieBeat, state.memories, state.activeFlags, story.flagNotes)}”
          </p>
          <p className="mb-2 font-type text-xs text-paper/60">
            Produce the clue that proves it false. Present the wrong thing and they call your bluff —
            it costs you, and you only get a few tries before they shut down.
          </p>
          {state.inventory.length === 0 ? (
            <p className="font-type text-sm text-gold">Your inventory is empty — go find evidence first.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {state.inventory.map((item) => {
                const isEvidence = pressLieBeat.lie!.evidenceItemIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => pressLieWithItem(pressLieBeat, item.id)}
                    className={`flex items-center gap-2 border-2 p-2 text-left transition-transform hover:scale-[1.02] ${
                      isEvidence ? "border-gold/50 bg-gold/10" : "border-paper/25 bg-noir-700 hover:border-crimson/60"
                    }`}
                    title={item.description}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-paper/30 bg-noir-950 text-2xl">
                      {item.iconUrl ? <img src={assetUrl(item.iconUrl)} alt="" className="h-full w-full object-contain p-0.5" /> : item.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-pulp text-[11px] uppercase tracking-wide text-paper/90">{item.name}</span>
                      {item.isClue && <span className="block text-[9px] uppercase tracking-widest text-crimson">📌 clue</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Modal>
      )}

      {overlay?.type === "board" && (
        <DeductionBoard
          story={story}
          state={state}
          encounteredCharacters={encounteredCharacters}
          onClose={() => setOverlay(null)}
          onConnect={(flag, revelation) => {
            const perks = getPerks(stateRef.current);
            if (flag) {
              setState((s) => applyConsequences(story, { setFlags: [flag], meterChanges: [{ meter: "Clever", delta: 1 }] }, s));
              pushToast(`${revelation} (+1 Deduce)`, "success");
              return;
            }
            if (perks.sharpEye) {
              pushToast(`${revelation} Sharp Eye keeps the bad hunch off the books.`, "fail");
              return;
            }
            const cost = perks.heat ? 2 : 1;
            setState((s) => applyConsequences(story, { meterChanges: [{ meter: "Suspicion", delta: cost }] }, s));
            pushToast(`${revelation} (+${cost} Heat)`, "fail");
          }}
        />
      )}

      {overlay?.type === "map" && mapAvailable(story) && (
        <TravelMap
          story={story}
          state={state}
          currentSceneId={sceneId}
          visitedScenes={visitedScenes}
          onClose={() => setOverlay(null)}
          onTravel={(target) => {
            setOverlay(null);
            goToScene(target);
          }}
        />
      )}

      {overlay?.type === "log" && (
        <Modal title="Dialogue log — everything said this run" onClose={() => setOverlay(null)} wide>
          <p className="mb-2 font-type text-[10px] uppercase tracking-widest text-paper/40">
            Newest at the bottom · L or Esc closes
          </p>
          <DialogueLogView lines={dialogueLog} />
        </Modal>
      )}

      {overlay?.type === "save" && (
        <Modal
          title={episode ? `Save — ${episodeLabel(episode.number ?? 1, episode.numberSuffix)}` : "Save — choose a slot"}
          onClose={() => {
            saveThenExitRef.current = false;
            setOverlay(null);
          }}
        >
          <p className="mb-3 font-type text-xs text-paper/60">
            Snapshot your progress. Loading a save returns you to the same scene with your flags, inventory and meters intact.
            A separate ⏱ auto checkpoint is written every scene — it never fills these slots (find it under Load).
            {episode && <> These three slots belong to <b className="text-gold">{episode.title}</b> — every episode keeps its own.</>}
          </p>
          {saves.map((s, i) => {
            const slot = i + 1;
            return (
              <div key={slot} className="mb-2 flex items-center gap-3 border border-noir-600 p-2">
                <div className="min-w-0 flex-1">
                  <div className="font-pulp text-[10px] uppercase tracking-wider text-gold">Slot {slot}</div>
                  <div className="truncate font-type text-[10px] text-paper/60">
                    {s ? `${s.sceneTitle} · ${new Date(s.savedAt).toLocaleString()}` : "Empty"}
                  </div>
                </div>
                <button
                  onClick={() => void doSave(slot)}
                  className="shrink-0 border border-emerald-500/50 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/10"
                >
                  {saveThenExitRef.current ? "Save & exit" : "Save here"}
                </button>
              </div>
            );
          })}
          {saveFilesAvailable() && (
            <div className="mt-3 border-t border-noir-600 pt-3">
              <p className="mb-2 font-type text-[10px] leading-relaxed text-paper/50">
                Slot saves are also written as real <b className="text-gold">.sreel</b> files in your saves
                folder — export one to back it up or take it to another PC.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => void doExportSave()}
                  className="border border-gold/50 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-gold hover:bg-gold/10"
                >
                  💾 Export save…
                </button>
                <button
                  onClick={() => void doImportSave()}
                  className="border border-cyan-neon/50 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
                >
                  📂 Import save…
                </button>
                <button
                  onClick={() => void openSavesDir()}
                  className="border border-paper/30 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-paper/60 hover:border-gold hover:text-gold"
                >
                  📁 Open saves folder
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {overlay?.type === "load" && (
        <Modal title={episode ? `Load — ${episodeLabel(episode.number ?? 1)}` : "Load a save"} onClose={() => setOverlay(null)}>
          <p className="mb-3 font-type text-xs text-paper/60">
            Return to where you left off. Any unsaved progress in this run will be replaced.
            {episode && <> Showing the slots for <b className="text-gold">{episode.title}</b>.</>}
          </p>
          {(() => {
            const auto = readSave(story.id, AUTO_SLOT, episodeId);
            return auto ? (
              <div className="mb-3 flex items-center gap-3 border border-cyan-neon/40 bg-cyan-neon/5 p-2">
                <div className="min-w-0 flex-1">
                  <div className="font-pulp text-[10px] uppercase tracking-wider text-cyan-neon">⏱ Auto checkpoint</div>
                  <div className="truncate font-type text-[10px] text-paper/60">
                    {auto.sceneTitle} · {new Date(auto.savedAt).toLocaleString()} · written every scene
                  </div>
                </div>
                <button
                  onClick={() => doLoad(AUTO_SLOT)}
                  className="shrink-0 border border-cyan-neon/60 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
                >
                  Load
                </button>
              </div>
            ) : null;
          })()}
          {saves.map((s, i) => {
            const slot = i + 1;
            return (
              <div key={slot} className="mb-2 flex items-center gap-3 border border-noir-600 p-2">
                <div className="min-w-0 flex-1">
                  <div className="font-pulp text-[10px] uppercase tracking-wider text-gold">Slot {slot}</div>
                  <div className="truncate font-type text-[10px] text-paper/60">
                    {s ? `${s.sceneTitle} · ${new Date(s.savedAt).toLocaleString()}` : "Empty"}
                  </div>
                </div>
                <button
                  onClick={() => doLoad(slot)}
                  disabled={!s}
                  className={`shrink-0 border px-2 py-1 font-pulp text-[9px] uppercase tracking-widest ${
                    s ? "border-cyan-neon/60 text-cyan-neon hover:bg-cyan-neon/10" : "border-paper/20 text-paper/30 cursor-not-allowed"
                  }`}
                >
                  Load
                </button>
              </div>
            );
          })}
        </Modal>
      )}

      {overlay?.type === "quit" && (
        <Modal title="Leave the case?" onClose={() => setOverlay(null)}>
          <p className="font-type text-sm text-paper/85">Walk away now and this reel rewinds — save it to a slot first to pick up where you left off.</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                saveThenExitRef.current = true;
                setSaves(readSaves(story.id, episodeId));
                setOverlay({ type: "save" });
              }}
              className="flex-1 border border-emerald-500/60 bg-emerald-500/10 py-2 font-pulp text-xs uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/20"
            >
              💾 Save & exit
            </button>
            <button
              onClick={() => {
                audio.stopSpeech();
                audio.setAmbient(null);
                // immediate cut — the unmount teardown also pauses, but this guarantees no bleed
                try { sceneAudioRef.current?.pause(); } catch {}
                if (primedMusic) try { primedMusic.el.pause(); } catch {}
                if (primedMusicRef.current) try { primedMusicRef.current.el.pause(); } catch {}
                fadingOutRef.current.forEach((el) => { try { el.pause(); } catch {} });
                fadingOutRef.current.clear();
                onExit();
              }}
              className="flex-1 border border-crimson/60 bg-crimson/15 py-2 font-pulp text-xs uppercase tracking-widest text-crimson hover:bg-crimson/25"
            >
              Hang up the hat
            </button>
            <button
              onClick={() => setOverlay(null)}
              className="flex-1 border border-paper/40 py-2 font-pulp text-xs uppercase tracking-widest text-paper hover:border-gold hover:text-gold"
            >
              Stay on it
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  season wrapper — episodes, title cards, recaps, handoffs           */
/* ------------------------------------------------------------------ */

/** What the season wrapper is currently showing. */
type SeasonPhase =
  | { kind: "season" }
  | { kind: "recap"; episode: Episode }
  | { kind: "titleCard"; episode: Episode }
  | { kind: "play"; episode: Episode; resumeSlot?: number; runKey: number }
  | { kind: "nextTime"; from: Episode; to: Episode; /** per-ending teaser lines (forked seasons) */ lines?: string[] };

/**
 * The entry point the app plays a story through.
 *
 * A plain story drops straight into the case player, exactly as before. An
 * episodic story is presented as a season: pick an episode, watch a
 * "Previously on…" built from what you actually did, get a title card, play
 * the chapter with its own save slots, then close it with an end-of-episode
 * card that hands off to "Next time on…".
 */
export function GamePlayer({
  story,
  typeSpeed,
  isNewGamePlus,
  resumeSlot,
  resumeEpisodeId,
  primedMusic,
  primedNarration,
  onExit,
  playFromSceneId,
  onOpenInStudio,
}: {
  story: Story;
  typeSpeed: number;
  isNewGamePlus: boolean;
  resumeSlot?: number;
  /** which episode's slot to resume into (episodic stories only) */
  resumeEpisodeId?: string;
  primedMusic?: PrimedAudio | null;
  primedNarration?: PrimedAudio | null;
  onExit: () => void;
  /** Studio "Play from here": start the game directly at this scene.
   *  For episodic stories it launches the owning episode straight into
   *  the scene, skipping the season screen / recap / title card. */
  playFromSceneId?: string;
  /** jump into the Studio on the current scene (in-game menu) */
  onOpenInStudio?: (sceneId: string) => void;
}) {
  const episodic = isEpisodic(story);

  /* DEEP LINK — a URL that carries a world state. Resolved against THIS story
   * (so ids are validated and warnings name the story that lacks them), and
   * applied only on a fresh run: a resume has a save, and a link must never
   * overwrite one. Deliberately limited to world state — the journey log,
   * save slots and season progress stay read-only, so a link cannot fabricate
   * a "previously on…" recap or forge a completed season. */
  const deepLink = useMemo(() => {
    const req = deepLinkFromUrl();
    if (!req.present) return null;
    const res = resolveDeepLink(story, req);
    if (!res.applied) return null;
    return res;
  }, [story]);
  useEffect(() => {
    if (!deepLink) return;
    console.info(`[deep-link] injected world state — ${describeDeepLink(deepLink)}`);
    deepLink.warnings.forEach((w) => console.warn(`[deep-link] ${w}`));
  }, [deepLink]);
  // A resume is the player's own progress; never clobber it with a link.
  const linkActive = !!deepLink && resumeSlot === undefined && !resumeEpisodeId;
  const linkScene = linkActive ? deepLink.sceneId : undefined;

  // Non-episodic stories keep the original one-shot behaviour untouched.
  if (!episodic) {
    return (
      <CasePlayer
        story={story}
        typeSpeed={typeSpeed}
        isNewGamePlus={isNewGamePlus}
        resumeSlot={resumeSlot}
        primedMusic={primedMusic}
        primedNarration={primedNarration}
        startSceneId={playFromSceneId ?? linkScene}
        {...(linkActive ? { initialState: deepLink.state } : {})}
        onOpenInStudio={onOpenInStudio}
        onExit={onExit}
      />
    );
  }

  /* An episodic story deep-linked to a scene opens the owning episode
   * directly at it, with the injected state instead of the carry-over — the
   * link IS the premise you want to test. */
  if (linkActive && linkScene) {
    const owner = episodeOfScene(story, linkScene);
    if (owner) {
      return (
        <CasePlayer
          key={`deep-link-${owner.id}-${linkScene}`}
          story={story}
          typeSpeed={typeSpeed}
          isNewGamePlus={isNewGamePlus}
          primedMusic={primedMusic}
          primedNarration={primedNarration}
          episode={owner}
          initialState={deepLink.state}
          startSceneId={linkScene}
          playtestMode
          onOpenInStudio={onOpenInStudio}
          onExit={onExit}
        />
      );
    }
  }

  // Studio playtest for an episodic story: open the episode that owns the
  // scene directly, at that scene, with carried-over state but no save/resume
  // chrome (fresh world state, like a normal playtest).
  if (playFromSceneId) {
    const owner = episodeOfScene(story, playFromSceneId);
    if (owner) {
      return (
        <CasePlayer
          key={`playtest-${owner.id}`}
          story={story}
          typeSpeed={typeSpeed}
          isNewGamePlus={isNewGamePlus}
          primedMusic={primedMusic}
          primedNarration={primedNarration}
          episode={owner}
          initialState={carryOverState(story, owner.id)}
          startSceneId={playFromSceneId}
          playtestMode
          onOpenInStudio={onOpenInStudio}
          onExit={onExit}
        />
      );
    }
  }

  return (
    <SeasonPlayer
      story={story}
      typeSpeed={typeSpeed}
      isNewGamePlus={isNewGamePlus}
      resumeSlot={resumeSlot}
      resumeEpisodeId={resumeEpisodeId}
      primedMusic={primedMusic}
      onOpenInStudio={onOpenInStudio}
      onExit={onExit}
    />
  );
}

function SeasonPlayer({
  story,
  typeSpeed,
  isNewGamePlus,
  resumeSlot,
  resumeEpisodeId,
  primedMusic,
  onOpenInStudio,
  onExit,
}: {
  story: Story;
  typeSpeed: number;
  isNewGamePlus: boolean;
  resumeSlot?: number;
  resumeEpisodeId?: string;
  primedMusic?: { url: string; el: HTMLAudioElement } | null;
  onOpenInStudio?: (sceneId: string) => void;
  onExit: () => void;
}) {
  const episodes = useMemo(() => seasonEpisodes(story), [story]);

  // A "▶ Resume" from the newsstand should drop straight into the chapter that
  // save belongs to, skipping the season screen and the title card.
  const [phase, setPhase] = useState<SeasonPhase>(() => {
    if (resumeSlot !== undefined) {
      // Prefer the episode the newsstand actually resolved the save from —
      // slot numbers repeat across episodes, so searching by slot alone can
      // land on the wrong chapter.
      const named = resumeEpisodeId ? episodes.find((e) => e.id === resumeEpisodeId) : undefined;
      if (named && readSave(story.id, resumeSlot, named.id)) {
        return { kind: "play", episode: named, resumeSlot, runKey: 0 };
      }
      for (const ep of episodes) {
        const save = readSave(story.id, resumeSlot, ep.id);
        if (save) return { kind: "play", episode: ep, resumeSlot, runKey: 0 };
      }
      const fallback = currentEpisode(story) ?? episodes[0];
      if (fallback) return { kind: "play", episode: fallback, resumeSlot, runKey: 0 };
    }
    return { kind: "season" };
  });

  // Bumped on every fresh run so the case player fully remounts (state, scene,
  // narration and timers all reset) instead of leaking the previous episode.
  const runSeq = useRef(0);
  // The just-finished episode's result, held so the end card can render over
  // the ending scene before the "Next time on…" handoff.
  const [finished, setFinished] = useState<{ progress: EpisodeProgress; highlights: string[] } | null>(null);

  const startEpisode = useCallback(
    (episode: Episode, slot?: number) => {
      setFinished(null);
      runSeq.current += 1;
      const runKey = runSeq.current;
      if (slot !== undefined) {
        setPhase({ kind: "play", episode, resumeSlot: slot, runKey });
        return;
      }
      // A recap only makes sense once there is something to recap: the state
      // carried in from earlier chapters.
      const carried = carryOverState(story, episode.id);
      const hasRecap = resolveRecap(episode, carried).length > 0 || (episode.recapFromMemories && Object.keys(carried.memories).length > 0);
      setPhase(hasRecap ? { kind: "recap", episode } : { kind: "titleCard", episode });
    },
    [story]
  );

  const handleEpisodeComplete = useCallback(
    (progress: EpisodeProgress, highlights: string[]) => {
      recordEpisodeProgress(story.id, progress);
      setFinished({ progress, highlights });
    },
    [story.id]
  );

  const openSeason = useCallback(() => {
    audio.stopSpeech();
    setFinished(null);
    setPhase({ kind: "season" });
  }, []);

  if (phase.kind === "season") {
    return (
      <SeasonScreen
        story={story}
        onPlayEpisode={(ep) => startEpisode(ep)}
        onResume={(ep, slot) => startEpisode(ep, slot)}
        onExit={onExit}
      />
    );
  }

  if (phase.kind === "recap") {
    const carried = carryOverState(story, phase.episode.id);
    return (
      <div className="relative h-full w-full bg-noir-950">
        <EpisodeRecap
          story={story}
          episode={phase.episode}
          state={carried}
          onDone={() => setPhase({ kind: "titleCard", episode: phase.episode })}
        />
      </div>
    );
  }

  if (phase.kind === "titleCard") {
    return (
      <div className="relative h-full w-full bg-noir-950">
        <EpisodeTitleCard
          story={story}
          episode={phase.episode}
          onDone={() => {
            runSeq.current += 1;
            setPhase({ kind: "play", episode: phase.episode, runKey: runSeq.current });
          }}
        />
      </div>
    );
  }

  if (phase.kind === "nextTime") {
    return (
      <div className="relative h-full w-full bg-noir-950">
        <NextTimeCard
          story={story}
          fromEpisode={phase.from}
          toEpisode={phase.to}
          lines={phase.lines}
          onContinue={() => startEpisode(phase.to)}
          onSeasonScreen={openSeason}
        />
      </div>
    );
  }

  // phase.kind === "play"
  const episode = phase.episode;
  // A finale (or an ending explicitly flagged as season-ending) stops here
  // instead of teasing a chapter the story doesn't intend you to reach.
  const endingScene = finished ? story.scenes.find((s) => s.id === finished.progress.endingSceneId) : undefined;
  // Forked seasons route "next" per ending: each fork's curtain teases its
  // own continuation chapter, not the positional one.
  const following = endingScene ? nextEpisodeForEnding(story, episode.id, endingScene.id) : nextEpisode(story, episode.id);
  const seasonOver = !following || !!endingScene?.endingData?.endsSeason;

  return (
    <CasePlayer
      key={`${episode.id}-${phase.runKey}`}
      story={story}
      typeSpeed={typeSpeed}
      isNewGamePlus={isNewGamePlus}
      resumeSlot={phase.resumeSlot}
      primedMusic={primedMusic}
      episode={episode}
      initialState={carryOverState(story, episode.id)}
      startSceneId={episode.startSceneId}
      onEpisodeComplete={handleEpisodeComplete}
      onOpenSeason={openSeason}
      onOpenInStudio={onOpenInStudio}
      episodeEndPanel={
        finished ? (
          <EpisodeEndCard
            story={story}
            episode={episode}
            progress={finished.progress}
            choiceHighlights={finished.highlights}
            hasNext={!seasonOver}
            onNextTime={() =>
              following &&
              setPhase({
                kind: "nextTime",
                from: episode,
                to: following,
                lines: endingScene ? episode.nextTimeByEnding?.[endingScene.id] ?? episode.nextTimeLines : episode.nextTimeLines,
              })
            }
            onReplay={() => startEpisode(episode)}
            onSeasonScreen={openSeason}
            onExit={onExit}
          />
        ) : undefined
      }
      onExit={onExit}
    />
  );
}
