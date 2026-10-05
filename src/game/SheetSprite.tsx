import { useEffect, useRef, useState } from "react";
import { assetUrl } from "../assetPath";
import { FPS_SCALE_MAX, frameFromPhase, sheetAnim, sheetCols, sheetFramePos, speedMatchedFpsScale, type SpriteSheet } from "./spriteSheet";

/**
 * Renders one animation of a SpriteSheet, stepped with CSS
 * background-position. The sheet image loads once (to learn the grid), then
 * a per-fps timer advances the frame; a single-frame animation never ticks.
 *
 * Sizing:
 *  - `height={px}` (default 96) — fixed pixel height, frame scaled uniformly.
 *  - `height="100%"` — fluid: fills the parent's height and derives its width
 *    from the frame's aspect ratio, so it can live inside %-sized wrappers
 *    (talking portraits, foreground extras).
 *
 * `freezeOnFallback`: when the REQUESTED animation name isn't on the sheet
 * and we fell back to another one, hold that animation's first frame instead
 * of playing it — a sheet with only "walk" stands still on walk frame 1
 * rather than moonwalking in place.
 *
 * `resolve` maps `asset:` references to blob/data URLs where the story
 * fields haven't been resolved yet (Studio previews).
 */
/** Module-level sheet image cache — every SheetSprite instance shares one
 *  Image per URL. Re-entering a room or remounting a cast member then has
 *  the grid on hand at FIRST render: no null frame, no pop-in. The scene
 *  warm-up (preloadStageArt) feeds the same cache. */
const sheetImgs = new Map<string, HTMLImageElement>();

/** Decoded enough to read the grid off immediately. `complete !== false`
 *  (not `complete &&`) keeps stubbed Image implementations — happy-dom's
 *  eager loader has no `complete` field and fires onload exactly once — on
 *  the instant path, so StrictMode remounts still render first frame. */
function sheetReady(img: HTMLImageElement): boolean {
  return img.naturalWidth > 0 && img.complete !== false;
}

function acquireSheetImg(url: string, cb: (img: HTMLImageElement) => void): void {
  let img = sheetImgs.get(url);
  if (!img) {
    img = new Image();
    img.src = url;
    sheetImgs.set(url, img);
  }
  if (sheetReady(img)) cb(img);
  else img.addEventListener("load", () => cb(img!), { once: true });
}

/** SCENE-ENTRY WARM-UP — start loading a room's art before its sprites
 *  mount, so the first frame of every character is on screen the moment
 *  the room shows (no one-frame sprite pop). Safe to call with anything:
 *  undefined entries are skipped, repeats are shared via the cache. */
export function preloadStageArt(urls: (string | undefined | null)[]): void {
  for (const u of urls) if (u) acquireSheetImg(assetUrl(u), () => {});
}

export function SheetSprite({
  sheet,
  anim,
  fallbacks = [],
  height = 96,
  freezeOnFallback = false,
  fpsScale = 1,
  resolve,
  className = "",
  style,
}: {
  sheet: SpriteSheet;
  anim: string;
  fallbacks?: string[];
  height?: number | "100%";
  freezeOnFallback?: boolean;
  /** Speed-match the cycle: how fast the sprite is REALLY crossing the floor
   *  relative to the speed its frames were drawn for (depth, an authored
   *  patrol speed, the double-click jog). 1 = the authored fps. Clamped by
   *  `speedMatchedFpsScale`, and applied by delta-time so a change mid-stride
   *  re-rates the legs without snapping the pose. */
  fpsScale?: number;
  resolve?: (v?: string) => string | undefined;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [tick, setTick] = useState(0);
  // Frames elapsed (a float), accumulated per tick. Previously the frame was
  // derived from a wall clock started at mount, which is exact but cannot
  // change rate: multiplying elapsed by a new fps jumps the phase, so a jog
  // starting mid-stride snapped the walker to a different foot.
  const phaseRef = useRef(0);
  const lastRef = useRef(0);
  const scaleRef = useRef(fpsScale);
  scaleRef.current = fpsScale;

  const url = assetUrl(resolve ? resolve(sheet.image) ?? sheet.image : sheet.image);
  // Cache hit = dims known synchronously: the very first render draws a
  // frame instead of the one-beat null that read as a "pop".
  const [dims, setDims] = useState<{ w: number; h: number } | null>(() => {
    const img = sheetImgs.get(url);
    return img && sheetReady(img) ? { w: img.naturalWidth, h: img.naturalHeight } : null;
  });
  const active = sheetAnim(sheet, anim, fallbacks);
  // Did the lookup land on the animation the caller asked for?
  const requested = sheet.animations?.[anim];
  const fellBack = !(requested && requested.frames?.length);
  const frozen = freezeOnFallback && fellBack;

  useEffect(() => {
    let cancelled = false;
    acquireSheetImg(url, (img) => {
      if (!cancelled) setDims({ w: img.naturalWidth, h: img.naturalHeight });
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  // Restart the cycle when the ANIMATION changes — never when the speed does,
  // or a jog/depth change would rewind the walk to frame one every step.
  useEffect(() => {
    phaseRef.current = 0;
    lastRef.current = performance.now();
    setTick(0);
  }, [anim, sheet, frozen, active?.frames.length]);

  // Only tick multi-frame loops. The interval is rated for the FASTEST the
  // cycle can be re-rated to, so a mid-walk speed change never needs to
  // rebuild the timer — the scale is read live through the ref and folded into
  // the phase each tick.
  useEffect(() => {
    if (!active || active.frames.length < 2 || frozen) return;
    const fps = active.fps && active.fps > 0 ? active.fps : 8;
    lastRef.current = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      // Clamp dt: a backgrounded tab throttles timers, and an unclamped gap
      // would fast-forward the cycle through several frames on return.
      const dt = Math.min(0.25, Math.max(0, (now - lastRef.current) / 1000));
      lastRef.current = now;
      phaseRef.current += dt * fps * speedMatchedFpsScale(scaleRef.current);
      setTick((t) => t + 1);
    }, Math.max(30, 1000 / (fps * FPS_SCALE_MAX)));
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim, sheet, frozen, active?.frames.length, active?.fps]);
  void tick;

  if (!active || !dims) return null;
  const cols = sheetCols(sheet, dims.w);
  const rows = Math.max(1, Math.floor(dims.h / Math.max(1, sheet.frameHeight)));
  // CLAMP the frame into the real grid: a frame index past cols*rows would
  // background-position onto a phantom row and render nothing (the classic
  // "character blinks out every few frames" bug on drift-trimmed sheets).
  const maxFrame = Math.max(0, cols * rows - 1);
  const rawFrame = frozen ? active.frames[0] : frameFromPhase(active, phaseRef.current);
  const frame = Math.min(rawFrame, maxFrame);
  const { col, row } = sheetFramePos(frame, cols);

  const common: React.CSSProperties = {
    backgroundImage: `url(${url})`,
    backgroundRepeat: "no-repeat",
    imageRendering: sheet.pixelated ? "pixelated" : undefined,
    ...style,
  };

  if (height === "100%") {
    // Fluid: %-based background stepping so no pixel measurements are needed.
    const xPct = cols > 1 ? (col * 100) / (cols - 1) : 0;
    const yPct = rows > 1 ? (row * 100) / (rows - 1) : 0;
    return (
      <div
        className={className}
        data-sheet-animation={anim}
        data-sheet-frame={frame}
        style={{
          height: "100%",
          aspectRatio: `${sheet.frameWidth} / ${sheet.frameHeight}`,
          backgroundSize: `${cols * 100}% ${rows * 100}%`,
          backgroundPosition: `${xPct}% ${yPct}%`,
          ...common,
        }}
        aria-hidden
      />
    );
  }

  const scale = height / sheet.frameHeight;
  return (
    <div
      className={className}
      data-sheet-animation={anim}
      data-sheet-frame={frame}
      style={{
        width: sheet.frameWidth * scale,
        height,
        backgroundSize: `${dims.w * scale}px ${dims.h * scale}px`,
        backgroundPosition: `-${col * sheet.frameWidth * scale}px -${row * sheet.frameHeight * scale}px`,
        ...common,
      }}
      aria-hidden
    />
  );
}
