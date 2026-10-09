/**
 * Cinematic authoring panels — the camera/foreground/lighting half of the
 * Scene tab, extracted from Studio.tsx.
 *
 * This was the single largest block in that file (~2,140 lines of the 16,200).
 * Moving it out is step 2 of the incremental split recorded in notes.txt: the
 * goal is purely to get Studio.tsx back under Babel's 500KB ceiling so Fast
 * Refresh hot-swaps instead of invalidating. Nothing here is redesigned — it
 * is the same code, verified byte-identical against its original.
 *
 * Three components, in dependency order:
 *   CinematicPreview          — live animated preview of the chosen camera move
 *   ForegroundPositionEditor  — drag the pinned foreground subject on the plate
 *   CinematicControls         — the full panel (camera, grade, foreground,
 *                               parallax, lights, lens flare, extras)
 */
import { useEffect, useRef, useState } from "react";
import {
  GRADE_PRESETS,
  GRADE_PRESET_LIST,
  LENS_FLARE_PRESETS,
  defaultLensFlare,
  defaultLight,
  lightPoints,
  lightStyle,
  parallaxStyle,
  parseGlowColor,
  resolveLensFlare,
  resolveLights,
} from "../cinematic";
import { useAllAssets } from "../data/mediaLibrary";
import {
  CinematicOverlays,
  ForegroundExtras,
  ForegroundLayer,
  LensFlareLayer,
  ParallaxMidLayers,
  cinematicLayer,
  parseAnchor,
  spriteGradeStyle,
} from "../game/Game";
import { ANIM_PRESETS, EASES, describeMotion } from "../game/animation";
import type { MotionPath } from "../game/animation";
import { Particles, AmbientAtmosphere } from "../game/AmbientParticles";
import type { ParticleKind } from "../game/AmbientParticles";
import { usePrefersReducedMotion } from "../game/useReducedMotion";
import { DepthParallaxLayer } from "../game/DepthParallax";
import { clamp } from "../logic";
import type {
  CinematicSettings,
  ForegroundAnimation,
  ForegroundAnimationMode,
  ForegroundExtra,
  LensFlareGhostTier,
  LensFlarePreset,
  LensFlareSettings,
  LightPoint,
} from "../types";
import { ImagePicker } from "./ImagePicker";
import { MediaUploadButton } from "./MediaLibrary";
import { EXTRA_PRESET, SpriteSheetControls } from "./SheetEditor";
import { SpriteBoxEditor } from "./SpriteBoxEditor";
import { CollapsibleSection, Field, bgStyle, inputCls, mediaField } from "./studioLeaves";

/** Live animated preview of the chosen cinematic — the same camera layer the
 * player sees, so authors can watch the motion instead of guessing. */
function CinematicPreview({
  cinematic,
  url,
  media,
  particles,
  ambientAudio,
}: {
  cinematic: CinematicSettings | undefined;
  url: string;
  media: (v?: string) => string | undefined;
  /** the scene's particle kind — rendered with the REAL engine (the same
   * components the player sees) so Dynamic Visuals can be previewed live. */
  particles?: ParticleKind;
  /** the scene's ambience track — drives the tension shaft flicker. */
  ambientAudio?: string;
}) {
  // NOTE: every hook must run before the video early-return below. Switching a
  // cinematic's media between an image and a "video:" URL re-renders this same
  // component, so a hook placed after the return changes the hook count between
  // renders and React throws "rendered fewer hooks than expected".
  const previewRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  if (url.startsWith("video:")) {
    return (
      <div className="flex aspect-video w-full items-center justify-center border border-gold/30 bg-noir-950 font-pulp text-[8px] uppercase tracking-widest text-paper/40">
        🎥 video cutscene — camera motion doesn't apply
      </div>
    );
  }
  const { className, style } = cinematicLayer(cinematic, url);
  const pOn = (cinematic?.parallaxDepth ?? 0) > 0;
  // Pointer parallax in the preview — write the same --par-x / --par-y vars the
  // game uses so the preview is live and truthful.
  const onPreviewMove = (e: React.PointerEvent) => {
    const el = previewRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--par-x", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty("--par-y", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };
  const onPreviewLeave = () => {
    previewRef.current?.style.removeProperty("--par-x");
    previewRef.current?.style.removeProperty("--par-y");
  };
  return (
    <div
      ref={previewRef}
      onPointerMove={pOn ? onPreviewMove : undefined}
      onPointerLeave={pOn ? onPreviewLeave : undefined}
      className="relative aspect-video w-full overflow-hidden border border-gold/30 bg-noir-950"
      style={pOn ? parallaxStyle(cinematic) : undefined}
    >
      <div className={`absolute inset-0 ${pOn ? "parallax-plate" : ""}`} style={pOn ? parallaxStyle(cinematic) : undefined}>
        <div className={`absolute inset-0 ${className}`} style={style}>
          <DepthParallaxLayer
            cinematic={cinematic?.depthMap ? { ...cinematic, depthMap: media(cinematic.depthMap) } : cinematic}
            picture={url}
            reducedMotion={reducedMotion}
          />
          {resolveLights(cinematic).map((l, i) => (
            <div key={i} className="cin-light" style={lightStyle(l)} />
          ))}
          <LensFlareLayer cinematic={cinematic} />
          <CinematicOverlays cinematic={cinematic} />
        </div>
      </div>
      {pOn && <ParallaxMidLayers cinematic={cinematic} resolve={media} />}
      <div className={pOn ? "parallax-fg absolute inset-0" : "absolute inset-0"} style={spriteGradeStyle(cinematic)}>
        <ForegroundExtras cinematic={cinematic} resolve={media} />
        <ForegroundLayer cinematic={cinematic} resolve={media} />
      </div>
      {/* The REAL particle engine, over the plate — exactly what the player
       * gets in this scene, so ✨ Dynamic Visuals (shafts, depth fog, rain on
       * lens, the particle kind itself) is previewed live instead of claimed.
       * Mirrors Game.tsx: Particles for the scene kind, plus the atmosphere
       * underlay for the kinds that don't carry their own. Sound stays off —
       * a preview must not start thunder. */}
      {particles && particles !== "none" && (
        <Particles kind={particles} soundOn={false} cinematic={cinematic} reducedMotion={reducedMotion} ambientAudio={ambientAudio} />
      )}
      {particles &&
        particles !== "none" &&
        particles !== "dust" &&
        particles !== "motes" &&
        particles !== "fog" && (
          <AmbientAtmosphere cinematic={cinematic} reducedMotion={reducedMotion} ambientAudio={ambientAudio} />
        )}
      <span className="pointer-events-none absolute bottom-1 right-1 z-[5] rounded bg-noir-950/70 px-1 py-0.5 font-pulp text-[7px] uppercase tracking-widest text-gold/70">
        {cinematic?.mode ?? "pan"}
        {cinematic?.colorGrade ? ` · ${GRADE_PRESETS[cinematic.colorGrade]?.name?.split(" — ")[0] ?? ""}` : ""}
        {pOn ? " · parallax" : ""}
        {particles && particles !== "none" ? ` · ${particles}` : ""}
      </span>
    </div>
  );
}

/** Drag-to-place editor for the foreground overlay. Shows the actual scene
 * background with the foreground subject (and any keyframe animation) overlaid
 * at its current scale / fit / position, so authors can drag the subject's
 * anchor point anywhere in the frame — or click a spot on the image to set the
 * zoom focus (anchor) — exactly as it will appear in the game. Renders the real
 * ForegroundLayer, so the preview is pixel-truthful. */
function ForegroundPositionEditor({
  previewUrl,
  cinematic,
  media,
  x,
  y,
  anchor,
  replayEpoch,
  onChange,
  onAnchorAt,
}: {
  previewUrl: string;
  cinematic?: CinematicSettings;
  media: (v?: string) => string | undefined;
  x: number;
  y: number;
  anchor: string;
  /** bump to restart the foreground zoom animation in this preview */
  replayEpoch?: number;
  onChange: (x: number, y: number) => void;
  /** click-to-anchor: pin this image point at this frame position (no jump) */
  onAnchorAt: (anchor: string, x: number, y: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const moving = useRef(false);
  const movedRef = useRef(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  // Measured preview size drives the pixel-offset readouts and sliders, so the
  // X/Y controls show concrete pixels (offset from centre) instead of abstract
  // percentages. The stored value stays a %, so scenes still scale responsively.
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Same guard as the player's frame observer: skip no-op writes and defer
    // to the next frame, so resizing never re-enters the observation pass.
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };
    update();
    if (typeof ResizeObserver !== "undefined") {
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

  const toPx = (p: number, axis: "x" | "y") => Math.round(((p - 50) / 100) * (axis === "x" ? size.w : size.h));
  const fromPx = (px: number, axis: "x" | "y") => {
    const half = axis === "x" ? size.w : size.h;
    if (!half) return 50;
    return clamp(50 + (px / half) * 100, 0, 100);
  };
  const offsetX = toPx(x, "x");
  const offsetY = toPx(y, "y");

  const moveTo = (clientX: number, clientY: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    onChange(
      Math.round(clamp(((clientX - r.left) / r.width) * 100, 0, 100)),
      Math.round(clamp(((clientY - r.top) / r.height) * 100, 0, 100))
    );
  };

  /** Click = define the anchor: the clicked point ON THE SUBJECT becomes the
   * zoom-focus anchor, and it is pinned at the clicked frame position, so the
   * subject doesn't jump — the clicked spot just becomes the pivot. */
  const anchorAt = (clientX: number, clientY: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const box = ref.current?.querySelector("[data-fg-anchor-box]");
    const br = box?.getBoundingClientRect();
    const fx = Math.round(clamp(((clientX - r.left) / r.width) * 100, 0, 100));
    const fy = Math.round(clamp(((clientY - r.top) / r.height) * 100, 0, 100));
    if (!br || br.width <= 0 || br.height <= 0) return;
    // Only anchor when the click lands on the subject itself.
    if (clientX < br.left || clientX > br.right || clientY < br.top || clientY > br.bottom) return;
    const ax = Math.round(clamp(((clientX - br.left) / br.width) * 100, 0, 100));
    const ay = Math.round(clamp(((clientY - br.top) / br.height) * 100, 0, 100));
    onAnchorAt(`${ax}% ${ay}%`, fx, fy);
  };

  const a = parseAnchor(anchor);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-pulp text-[8px] uppercase tracking-widest text-paper/45">Position &amp; focus point</span>
        <span className="rounded bg-noir-950/70 px-1 font-type text-[8px] text-gold">focus {a.ax}% {a.ay}%</span>
      </div>
      <div
        ref={ref}
        className="relative aspect-video w-full cursor-move touch-none overflow-hidden border border-gold/30"
        style={{ ...bgStyle(previewUrl) }}
        title="Click a point on the subject to set the zoom focus · drag to move it"
        onPointerDown={(e) => {
          moving.current = true;
          movedRef.current = false;
          startRef.current = { x: e.clientX, y: e.clientY };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!moving.current) return;
          if (!movedRef.current && startRef.current) {
            const d = Math.hypot(e.clientX - startRef.current.x, e.clientY - startRef.current.y);
            if (d < 6) return; // still a click
            movedRef.current = true;
          }
          moveTo(e.clientX, e.clientY);
        }}
        onPointerUp={() => {
          if (!moving.current) return;
          moving.current = false;
          const start = startRef.current;
          startRef.current = null;
          if (!movedRef.current && start) anchorAt(start.x, start.y);
        }}
        onPointerCancel={() => {
          moving.current = false;
          startRef.current = null;
        }}
      >
        <div key={replayEpoch ?? 0} className="absolute inset-0" style={spriteGradeStyle(cinematic)}>
          {/* Render the complete foreground stack in the positioning preview,
              not just the primary foreground subject. This keeps opacity,
              blend mode, ordering, parallax, occlusion and sprite-sheet
              changes visible while editing a stage/cinematic scene. */}
          <ForegroundExtras cinematic={cinematic} resolve={media} />
          <ForegroundLayer cinematic={cinematic} resolve={media} />
        </div>
        {/* crosshair marker at the anchor / focus point (also the pin) */}
        <div
          className="pointer-events-none absolute z-[2] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold shadow-[0_0_10px_#e8b23c]"
          style={{ left: `${x}%`, top: `${y}%` }}
        />
        <p className="pointer-events-none absolute inset-x-0 bottom-1 z-[2] text-center font-pulp text-[8px] uppercase tracking-widest text-paper/70">
          Click the subject to set the focus point · drag to move
        </p>
      </div>

      {/* Offset from centre, in pixels of this preview — concrete numbers the
          author can read against the scene, stored as % so it stays responsive. */}
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[10px] uppercase tracking-wider text-paper/50">
          Horizontal offset <span className="text-paper/70">{offsetX >= 0 ? "+" : ""}{offsetX}px</span>
          <input
            type="range"
            min={size.w ? -Math.round(size.w / 2) : -400}
            max={size.w ? Math.round(size.w / 2) : 400}
            step={1}
            value={offsetX}
            className="mt-0.5 w-full accent-pink-500"
            aria-label="Horizontal offset (pixels from centre)"
            onChange={(e) => onChange(fromPx(Number(e.target.value), "x"), y)}
          />
        </label>
        <label className="block text-[10px] uppercase tracking-wider text-paper/50">
          Vertical offset <span className="text-paper/70">{offsetY >= 0 ? "+" : ""}{offsetY}px</span>
          <input
            type="range"
            min={size.h ? -Math.round(size.h / 2) : -72}
            max={size.h ? Math.round(size.h / 2) : 72}
            step={1}
            value={offsetY}
            className="mt-0.5 w-full accent-pink-500"
            aria-label="Vertical offset (pixels from centre)"
            onChange={(e) => onChange(x, fromPx(Number(e.target.value), "y"))}
          />
        </label>
      </div>
    </div>
  );
}

/** Reusable cinematic camera/lighting controls (mode, motion, focal point, dim,
 * lights) bound to one image. Used for the scene background and for each
 * dialogue beat with a replacement background image. */
export function CinematicControls({
  cinematic,
  previewUrl,
  storyId,
  media,
  onChange,
  particles,
  ambientAudio,
}: {
  cinematic: CinematicSettings | undefined;
  previewUrl: string;
  storyId: string;
  media: (v?: string) => string | undefined;
  onChange: (next: CinematicSettings | undefined) => void;
  /** scene particle kind — live in the preview (see CinematicPreview). */
  particles?: ParticleKind;
  /** scene ambience — drives the tension shaft flicker in the preview. */
  ambientAudio?: string;
}) {
  const c = cinematic ?? {};
  const set = (patch: Partial<CinematicSettings>) => onChange({ ...c, ...patch });
  const isActive = !!cinematic;
  const mode = c.mode ?? "pan";
  // Editable light list — legacy single-light fields merge into the first entry
  // so old drafts keep their glow and migrate to the `lights` array on edit.
  const points = lightPoints(c);
  const commitPoints = (next: LightPoint[]) =>
    set({ lights: next.length ? next : undefined, lightSource: undefined, lightColor: undefined, lightRadius: undefined });
  // Roll defaults to intensity-derived so existing shake scenes keep their look
  // until the author explicitly overrides it.
  const shake = c.shakeAmount ?? 0.5;
  const shakeRot = c.shakeRotation ?? Math.round(shake * 0.7 * 100) / 100;
  // Dynamic lens flare state
  const flare = resolveLensFlare(c);
  const hasFlare = !!(c.lensFlare && c.lensFlare.enabled !== false);
  const setFlare = (patch: Partial<LensFlareSettings>) => {
    const base = flare ?? defaultLensFlare("anamorphic-blue", points[0] ? { x: points[0].x, y: points[0].y } : undefined);
    set({ lensFlare: { ...base, ...patch } });
  };
  const flareGlow = parseGlowColor(flare?.color);
  const flareSecGlow = parseGlowColor(flare?.secondaryColor);
  // Foreground keyframe animation state.
  const animMode: ForegroundAnimationMode | "none" = c.foregroundAnimation?.mode ?? "none";
  const frames = c.foregroundAnimation?.frames ?? [];
  // Keep the shared scene preview alive for extras-only shots too. Previously
  // a stage with only stacked foreground sprites had no preview window at all,
  // so layer controls appeared to do nothing until a primary foreground image
  // was added.
  const hasForeground = !!(c.foregroundImage || frames.length || c.foregroundExtras?.length);
  // Bump to restart the foreground zoom animation in the position preview.
  const [zoomEpoch, setZoomEpoch] = useState(0);
  const setAnim = (patch: Partial<ForegroundAnimation>) =>
    set({ foregroundAnimation: { mode: "frames", frames: [], ...(c.foregroundAnimation ?? {}), ...patch } });
  // Uploaded images for this story — used to display each keyframe's real file
  // name and populate the "pick an uploaded keyframe" pulldown. Reads the
  // GLOBAL library so a keyframe pointing at an image uploaded anywhere
  // resolves its name (consistent with the global asset pickers).
  const imageAssets = useAllAssets("image");
  const frameName = (f: string): string => {
    if (!f) return "";
    if (f.startsWith("asset:")) return imageAssets.find((a) => `asset:${a.id}` === f)?.name ?? f;
    if (f.startsWith("data:")) return "(embedded image)";
    return f;
  };

  return (
    <div className="space-y-3">
      <Field label="Camera mode">
        <select
          className={inputCls}
          value={mode}
          onChange={(e) => set({ mode: e.target.value as CinematicSettings["mode"] })}
        >
          <option value="pan">🎞 Slow pan — gentle drift across the frame</option>
          <option value="zoom-hold">🔍 Zoom to subject — zooms in and holds on the focal point</option>
          <option value="shake">📹 Shaky cam — handheld jitter</option>
          <option value="dolly">🛤 Rail / dolly track — slides across a wide image</option>
          <option value="dolly-zoom">🌀 Dolly zoom — vertigo push-pull</option>
          <option value="static">🖼 Static — no movement, locked frame</option>
        </select>
      </Field>

      <CollapsibleSection id="cin-camera" title="📷 Camera" hint="live preview">
        <CinematicPreview cinematic={cinematic} url={previewUrl} media={media} particles={particles} ambientAudio={ambientAudio} />

        {mode !== "static" && (
          <>
            {mode === "shake" && (
            <div className="space-y-2">
              <Field label={`Shake intensity ${Math.round(shake * 100)}%`}>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0.05}
                    max={1}
                    step={0.05}
                    value={shake}
                    className="flex-1 accent-pink-500"
                    onChange={(e) => set({ shakeAmount: Number(e.target.value) })}
                  />
                  <span className="w-8 text-right font-type text-[10px] text-paper/70">{Math.round(shake * 100)}%</span>
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label={`Roll ${shakeRot.toFixed(2)}°`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={3}
                      step={0.05}
                      value={shakeRot}
                      className="flex-1 accent-pink-500"
                      onChange={(e) => set({ shakeRotation: Number(e.target.value) })}
                    />
                    <span className="w-7 text-right font-type text-[10px] text-paper/70">{shakeRot.toFixed(1)}°</span>
                  </div>
                </Field>
                <Field label={`Jitter speed ${(c.shakeDuration ?? 0.5).toFixed(2)}s`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0.15}
                      max={1.5}
                      step={0.05}
                      value={c.shakeDuration ?? 0.5}
                      className="flex-1 accent-pink-500"
                      onChange={(e) => set({ shakeDuration: Number(e.target.value) })}
                    />
                    <span className="w-7 text-right font-type text-[10px] text-paper/70">{(c.shakeDuration ?? 0.5).toFixed(2)}s</span>
                  </div>
                </Field>
              </div>
              <p className="font-type text-[9px] text-paper/40">
                Intensity = jitter size · Roll = camera twist · Speed = how fast it trembles (lower = faster, more panicked).
              </p>
            </div>
          )}

          {mode === "dolly" && (
            <div className="space-y-2">
              <Field label="Dolly direction">
                <select
                  className={inputCls}
                  value={c.dollyDirection ?? "right"}
                  onChange={(e) => set({ dollyDirection: e.target.value as CinematicSettings["dollyDirection"] })}
                >
                  <option value="right">Travel right →</option>
                  <option value="left">Travel left ←</option>
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label={`Distance ${c.dollyDistance ?? 8}%`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={2}
                      max={20}
                      step={1}
                      value={c.dollyDistance ?? 8}
                      className="flex-1 accent-pink-500"
                      onChange={(e) => set({ dollyDistance: Number(e.target.value) })}
                    />
                    <span className="w-7 text-right font-type text-[10px] text-paper/70">{c.dollyDistance ?? 8}%</span>
                  </div>
                </Field>
                <Field label={`Vertical drift ${c.dollyVertical ?? 0}%`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={8}
                      step={0.5}
                      value={c.dollyVertical ?? 0}
                      className="flex-1 accent-pink-500"
                      onChange={(e) => set({ dollyVertical: Number(e.target.value) })}
                    />
                    <span className="w-7 text-right font-type text-[10px] text-paper/70">{c.dollyVertical ?? 0}%</span>
                  </div>
                </Field>
              </div>
              <Field label="Duration (seconds per pass)">
                <input
                  type="number"
                  min={3}
                  max={60}
                  step={1}
                  className={inputCls}
                  value={c.dollyDuration ?? 10}
                  onChange={(e) => set({ dollyDuration: Number(e.target.value) || 10 })}
                />
              </Field>
              <p className="border border-cyan-neon/20 bg-cyan-neon/5 p-2 font-type text-[9px] text-paper/55">
                The camera travels sideways, so use a <b className="text-cyan-neon">wide panoramic image</b>. Add{" "}
                <b className="text-cyan-neon">vertical drift</b> to tilt the track into a diagonal crane pan.
              </p>
            </div>
          )}

          {mode === "dolly-zoom" && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Field label={`Background zoom ${(c.dollyZoomAmount ?? 1.35).toFixed(2)}×`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1}
                      max={2}
                      step={0.05}
                      value={c.dollyZoomAmount ?? 1.35}
                      className="flex-1 accent-pink-500"
                      onChange={(e) => set({ dollyZoomAmount: Number(e.target.value) })}
                    />
                    <span className="w-9 text-right font-type text-[10px] text-paper/70">{(c.dollyZoomAmount ?? 1.35).toFixed(2)}×</span>
                  </div>
                </Field>
                <Field label={`Cycle ${c.dollyZoomDuration ?? 8}s`}>
                  <input
                    type="number"
                    min={2}
                    max={30}
                    step={1}
                    className={inputCls}
                    value={c.dollyZoomDuration ?? 8}
                    onChange={(e) => set({ dollyZoomDuration: Number(e.target.value) || 8 })}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field label="Zoom direction">
                  <select
                    className={inputCls}
                    value={c.dollyZoomDirection ?? "both"}
                    onChange={(e) => set({ dollyZoomDirection: e.target.value as CinematicSettings["dollyZoomDirection"] })}
                  >
                    <option value="both">Push &amp; pull — in and back, looping</option>
                    <option value="push">Push in — zoom in and hold</option>
                    <option value="pull">Pull out — zoom out and hold</option>
                  </select>
                </Field>
                <Field label={`Background blur ${(c.dollyZoomBlur ?? 0).toFixed(1)}px`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={0.5}
                      value={c.dollyZoomBlur ?? 0}
                      className="flex-1 accent-pink-500"
                      onChange={(e) => set({ dollyZoomBlur: Number(e.target.value) })}
                    />
                    <span className="w-9 text-right font-type text-[10px] text-paper/70">{(c.dollyZoomBlur ?? 0).toFixed(1)}px</span>
                  </div>
                </Field>
              </div>

              <p className="border border-cyan-neon/20 bg-cyan-neon/5 p-2 font-type text-[9px] text-paper/55">
                The classic <b className="text-cyan-neon">Hitchcock vertigo</b>: push in, pull out, or breathe both ways. Add{" "}
                <b className="text-cyan-neon">blur</b> to soften the moving background — pair it with a{" "}
                <b className="text-cyan-neon">foreground overlay</b> so the subject stays sharp, which is what sells the vertigo.
              </p>
            </div>
          )}

          {mode === "pan" && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Pan direction">
                  <select
                    className={inputCls}
                    value={c.panDirection ?? "right"}
                    onChange={(e) => set({ panDirection: e.target.value as CinematicSettings["panDirection"] })}
                  >
                    <option value="right">Drift right →</option>
                    <option value="left">Drift left ←</option>
                  </select>
                </Field>
                <Field label={`Pan drift ${c.panDistance ?? 0}%`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={12}
                      step={1}
                      value={c.panDistance ?? 0}
                      className="flex-1 accent-pink-500"
                      onChange={(e) => set({ panDistance: Number(e.target.value) })}
                    />
                    <span className="w-7 text-right font-type text-[10px] text-paper/70">{c.panDistance ?? 0}%</span>
                  </div>
                </Field>
              </div>
              <p className="font-type text-[9px] text-paper/40">
                Pan drift slides the frame while it eases in — 0% keeps the gentle push-in only.
              </p>
            </div>
          )}

          {mode === "zoom-hold" && (
            <Field label="Zoom duration (seconds before it holds)">
              <input
                type="number"
                min={2}
                max={30}
                step={1}
                className={inputCls}
                value={c.zoomDuration ?? 8}
                onChange={(e) => set({ zoomDuration: Number(e.target.value) || 8 })}
              />
            </Field>
          )}

          {(mode === "pan" || mode === "zoom-hold") && (
            <Field label="Focal point (where camera looks — CSS % e.g. '60% 40%' for upper right)">
              <div className="space-y-1">
                <input
                  className={inputCls}
                  placeholder="50% 50%"
                  value={c.focalPoint ?? ""}
                  onChange={(e) => set({ focalPoint: e.target.value || undefined })}
                />
                <p className="font-type text-[9px] text-paper/40">
                  X% Y% — top-left is 0% 0%, bottom-right is 100% 100%, centre is 50% 50%.
                </p>
                {/* click-to-set focal point on a live preview */}
                <div
                  className="relative mt-1 aspect-video w-full cursor-crosshair overflow-hidden border border-gold/30"
                  style={{ ...bgStyle(previewUrl) }}
                  title="Click to set focal point"
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const x = Math.round(((e.clientX - r.left) / r.width) * 100);
                    const y = Math.round(((e.clientY - r.top) / r.height) * 100);
                    set({ focalPoint: `${x}% ${y}%` });
                  }}
                >
                  {c.focalPoint && (() => {
                    const [px, py] = c.focalPoint.split(" ").map((v) => parseFloat(v));
                    return (
                      <div
                        className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-neon shadow-[0_0_10px_#ff2e88]"
                        style={{ left: `${px}%`, top: `${py}%` }}
                      />
                    );
                  })()}
                  <p className="pointer-events-none absolute inset-0 flex items-end justify-center pb-1 font-pulp text-[8px] uppercase tracking-widest text-paper/60">
                    Click to set focal point
                  </p>
                </div>
              </div>
            </Field>
          )}
          </>
        )}
      </CollapsibleSection>

      <CollapsibleSection id="cin-grade" title="🎨 Color grade & film stock" titleClass="text-neon">
        <Field label="Director / stock grade">
          <select
            className={inputCls}
            value={c.colorGrade ?? ""}
            onChange={(e) => set({ colorGrade: (e.target.value || undefined) as CinematicSettings["colorGrade"] })}
          >
            <option value="">— no grade (straight plate) —</option>
            {GRADE_PRESET_LIST.map((g) => (
              <option key={g.id} value={g.id}>{g.badge} {g.name}</option>
            ))}
          </select>
        </Field>
        {c.colorGrade && (
          <p className="border border-neon/20 bg-neon/5 p-2 font-type text-[9px] leading-snug text-paper/55">
            <b className="text-neon">{GRADE_PRESETS[c.colorGrade]?.name}</b> — {GRADE_PRESETS[c.colorGrade]?.tagline}{" "}
            The grade works on every camera mode and on insert-shot beat backgrounds.
          </p>
        )}
        <label className="flex items-start gap-2 border border-gold/25 bg-gold/5 px-2 py-1.5 text-[10px] uppercase tracking-wider text-paper/70">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={!!c.filmGrade}
            onChange={(e) => set({ filmGrade: e.target.checked || undefined })}
          />
          <span>
            🎞 Film grade — 35mm print emulation
            <span className="block font-type text-[9px] normal-case tracking-normal text-paper/45">
              Animated grain (heavier than the ambient grain), gate weave, highlight halation bloom, light flicker and the
              occasional scratch/dust pass. Sits above the color grade like the physical print of the graded image.
            </span>
          </span>
        </label>
        {c.filmGrade && (
          <Field label={`Film strength ${Math.round((c.filmGradeStrength ?? 0.7) * 100)}%`}>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0.15}
                max={1}
                step={0.05}
                value={c.filmGradeStrength ?? 0.7}
                className="flex-1 accent-pink-500"
                onChange={(e) => set({ filmGradeStrength: Number(e.target.value) })}
              />
              <span className="w-8 text-right font-type text-[10px] text-paper/70">{Math.round((c.filmGradeStrength ?? 0.7) * 100)}%</span>
            </div>
          </Field>
        )}
      </CollapsibleSection>

      <CollapsibleSection id="cin-parallax" title="🌆 Parallax depth" titleClass="text-cyan-neon">
        <Field label={`Depth ${Math.round((c.parallaxDepth ?? 0) * 100)}%`}>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={c.parallaxDepth ?? 0}
              className="flex-1 accent-cyan-400"
              onChange={(e) => set({ parallaxDepth: Number(e.target.value) || undefined })}
            />
            <span className="w-8 text-right font-type text-[10px] text-paper/70">{Math.round((c.parallaxDepth ?? 0) * 100)}%</span>
          </div>
        </Field>
        <p className="font-type text-[9px] leading-snug text-paper/45">
          The camera subtly follows the cursor — the plate drifts slowest, mid planes and the foreground subject faster,
          like a diorama. A gentle idle sway plays when the mouse is still. Move your mouse over the live preview above to
          feel it.
        </p>
        <Field label="Mid-ground depth planes (transparent cutouts)">
          {(c.parallaxLayers ?? []).map((layer, i) => (
            <div key={i} className="mb-2 space-y-1 border border-cyan-neon/20 bg-cyan-neon/5 p-2">
              <div className="flex items-center justify-between gap-2">
                <ImagePicker
                  value={layer.image}
                  placeholder="Pick a transparent plane image from the library…"
                  onChange={(v) => {
                    const layers = [...(c.parallaxLayers ?? [])];
                    layers[i] = { ...layer, image: v ?? "" };
                    set({ parallaxLayers: layers.filter((l) => l.image) });
                  }}
                />
                <button
                  className="shrink-0 border border-crimson/50 px-2 py-1 font-pulp text-[9px] uppercase text-crimson hover:bg-crimson/10"
                  onClick={() => set({ parallaxLayers: (c.parallaxLayers ?? []).filter((_, j) => j !== i) })}
                >
                  ✕
                </button>
              </div>
              <Field label={`Depth ${Math.round(layer.depth * 100)}% (0=far / 1=near)`}>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={layer.depth}
                  className="w-full accent-cyan-400"
                  onChange={(e) => {
                    const layers = [...(c.parallaxLayers ?? [])];
                    layers[i] = { ...layer, depth: Number(e.target.value) };
                    set({ parallaxLayers: layers });
                  }}
                />
              </Field>
            </div>
          ))}
          <div className="flex gap-2">
            <MediaUploadButton
              accept="image/*"
              storyId={storyId}
              label="⤒ Upload plane"
              onUploaded={(_url, assetId) =>
                set({ parallaxLayers: [...(c.parallaxLayers ?? []), { image: `asset:${assetId}`, depth: 0.5 }] })
              }
            />
            <button
              className="shrink border border-cyan-neon/40 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
              onClick={() => set({ parallaxLayers: [...(c.parallaxLayers ?? []), { image: "gradient:linear-gradient(180deg, rgba(10,12,20,0) 40%, rgba(10,12,20,0.55) 100%)", depth: 0.35 }] })}
              title="Add a gradient fog plane (uses the picker above to swap for an image)"
            >
              ＋ Fog plane
            </button>
          </div>
        </Field>
      </CollapsibleSection>

      <CollapsibleSection id="cin-depth" title="🧊 Depth-map camera (2.5D)" hint={c.depthMap ? "on" : "off"} titleClass="text-cyan-neon">
        <p className="font-type text-[9px] leading-snug text-paper/45">
          Pair the picture with a grayscale <b>depth map</b> of the same shape — white = near the camera, black = far —
          and the still frame moves like a camera drifting through the scene: near things slide one way, far things the
          other, the still plane holds. Works with every camera mode except 🛤 dolly. Players who ask for reduced motion
          see the still picture.
        </p>
        <Field label="Depth map (grayscale, white = near)">
          <ImagePicker
            value={c.depthMap}
            includeGradients={false}
            placeholder="Pick this picture's depth map…"
            onChange={(v) => set({ depthMap: v || undefined })}
          />
        </Field>
        {c.depthMap && (
          <>
            <Field label={`Amount ${Math.round((c.depthAmount ?? 0.4) * 100)}%`}>
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={c.depthAmount ?? 0.4}
                className="w-full accent-cyan-400"
                onChange={(e) => set({ depthAmount: Number(e.target.value) })}
              />
            </Field>
            <Field label={`Still plane ${Math.round((c.depthFocus ?? 0.5) * 100)}% (0 = far, 100 = near)`}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={c.depthFocus ?? 0.5}
                className="w-full accent-cyan-400"
                onChange={(e) => set({ depthFocus: Number(e.target.value) })}
              />
            </Field>
            <Field label="Move">
              <select
                className={inputCls}
                value={c.depthMotion ?? "orbit"}
                onChange={(e) => set({ depthMotion: e.target.value as CinematicSettings["depthMotion"] })}
              >
                <option value="orbit">∞ Orbit — a slow figure-eight around the still plane</option>
                <option value="sway">↔ Sway — side to side</option>
                <option value="push">⇥ Push — a dolly in and back, near things grow faster</option>
              </select>
            </Field>
            <Field label={`Cycle ${c.depthSeconds ?? 12}s`}>
              <input
                type="range"
                min={4}
                max={40}
                step={1}
                value={c.depthSeconds ?? 12}
                className="w-full accent-cyan-400"
                onChange={(e) => set({ depthSeconds: Number(e.target.value) })}
              />
            </Field>
            <label className="flex items-center gap-2 font-type text-[10px] text-paper/70">
              <input type="checkbox" checked={c.depthPointer !== false} onChange={(e) => set({ depthPointer: e.target.checked ? undefined : false })} />
              Lean the camera toward the mouse
            </label>
          </>
        )}
      </CollapsibleSection>

      <CollapsibleSection id="cin-dynamic-visuals" title="✨ Dynamic Visuals (new)" hint="shafts, fog, shadows, rain lens, DOF" titleClass="text-gold">
        <p className="font-type text-[9px] leading-snug text-paper/45">
          New engine features — toggle each and tune intensity. All respect reduced-motion (static fallback) and are previewed live.
        </p>

        <label className="flex items-start gap-2 border border-gold/25 bg-gold/5 px-2 py-1.5 text-[10px] uppercase tracking-wider text-paper/70">
          <input type="checkbox" className="mt-0.5" checked={c.volumetricShafts !== false} onChange={(e) => set({ volumetricShafts: e.target.checked ? true : false })} />
          <span>
            ☀️ Volumetric shafts — light through dust/fog
            <span className="block font-type text-[9px] normal-case tracking-normal text-paper/45">
              Parallax-mid drift with --par-x, flicker sin(t*1.8)*0.15 when ambientAudio=tension. Needs lights + dim. On by default when lights exist.
            </span>
          </span>
        </label>
        {c.volumetricShafts !== false && (
          <Field label={`Shafts intensity ${((c.shaftsIntensity ?? 1) * 100).toFixed(0)}%`}>
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={2} step={0.1} value={c.shaftsIntensity ?? 1} className="flex-1 accent-pink-500" onChange={(e) => set({ shaftsIntensity: Number(e.target.value) })} />
              <span className="w-8 text-right font-type text-[10px] text-paper/70">{((c.shaftsIntensity ?? 1) * 100).toFixed(0)}%</span>
            </div>
          </Field>
        )}

        <label className="flex items-start gap-2 border border-gold/25 bg-gold/5 px-2 py-1.5 text-[10px] uppercase tracking-wider text-paper/70">
          <input type="checkbox" className="mt-0.5" checked={c.depthFog !== false} onChange={(e) => set({ depthFog: e.target.checked ? true : false })} />
          <span>
            🌫️ Depth fog — thicker at back
            <span className="block font-type text-[9px] normal-case tracking-normal text-paper/45">
              Fog banks opacity = lerp(0.1,0.6, y/100). Background hazier. Auto with fog particles, toggle for any scene.
            </span>
          </span>
        </label>
        {c.depthFog !== false && (
          <Field label={`Fog strength ${((c.fogStrength ?? 0.6) * 100).toFixed(0)}%`}>
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={1} step={0.05} value={c.fogStrength ?? 0.6} className="flex-1 accent-pink-500" onChange={(e) => set({ fogStrength: Number(e.target.value) })} />
              <span className="w-8 text-right font-type text-[10px] text-paper/70">{((c.fogStrength ?? 0.6) * 100).toFixed(0)}%</span>
            </div>
          </Field>
        )}

        <label className="flex items-start gap-2 border border-gold/25 bg-gold/5 px-2 py-1.5 text-[10px] uppercase tracking-wider text-paper/70">
          <input type="checkbox" className="mt-0.5" checked={c.shadowCasting !== false} onChange={(e) => set({ shadowCasting: e.target.checked ? true : false })} />
          <span>
            🌓 Light-cast shadows — NPC + walker
            <span className="block font-type text-[9px] normal-case tracking-normal text-paper/45">
              Shadow skewed toward nearest light: skewX((light.x-npc.x)*0.18) scaleY 0.8+depth*0.4+intensity*0.3. Needs lights.
            </span>
          </span>
        </label>
        {c.shadowCasting !== false && (
          <Field label={`Shadow intensity ${((c.shadowIntensity ?? 0.8) * 100).toFixed(0)}%`}>
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={1} step={0.05} value={c.shadowIntensity ?? 0.8} className="flex-1 accent-pink-500" onChange={(e) => set({ shadowIntensity: Number(e.target.value) })} />
              <span className="w-8 text-right font-type text-[10px] text-paper/70">{((c.shadowIntensity ?? 0.8) * 100).toFixed(0)}%</span>
            </div>
          </Field>
        )}

        <label className="flex items-start gap-2 border border-gold/25 bg-gold/5 px-2 py-1.5 text-[10px] uppercase tracking-wider text-paper/70">
          {/* Reads the EFFECTIVE state (the explicit override, else the
              engine default for this scene's particle kind) and writes an
              explicit true/false — writing undefined would mean "use the
              default" and toggling off would silently do nothing. */}
          <input
            type="checkbox"
            className="mt-0.5"
            checked={c.rainOnLens ?? (particles === "rain" || particles === "drizzle" || particles === "storm")}
            onChange={(e) => set({ rainOnLens: e.target.checked ? true : false })}
          />
          <span>
            💧 Rain on lens — glass droplets
            <span className="block font-type text-[9px] normal-case tracking-normal text-paper/45">
              Improved: tiny static beads + sliding drops with tail + large beads, subtle blur 0.8px, highlight, streak. Auto with rain particles or toggle here.
            </span>
          </span>
        </label>
        {c.rainOnLens && (
          <Field label={`Lens intensity ${((c.rainLensIntensity ?? 1) * 100).toFixed(0)}%`}>
            <div className="flex items-center gap-2">
              <input type="range" min={0.2} max={2} step={0.1} value={c.rainLensIntensity ?? 1} className="flex-1 accent-pink-500" onChange={(e) => set({ rainLensIntensity: Number(e.target.value) })} />
              <span className="w-8 text-right font-type text-[10px] text-paper/70">{((c.rainLensIntensity ?? 1) * 100).toFixed(0)}%</span>
            </div>
          </Field>
        )}

        <label className="flex items-start gap-2 border border-gold/25 bg-gold/5 px-2 py-1.5 text-[10px] uppercase tracking-wider text-paper/70">
          <input type="checkbox" className="mt-0.5" checked={c.dofOnTalk !== false} onChange={(e) => set({ dofOnTalk: e.target.checked ? true : false })} />
          <span>
            🔍 DOF on talk — blur background
            <span className="block font-type text-[9px] normal-case tracking-normal text-paper/45">
              When stage conversation open, plate blur 2px + brightness 0.92 + saturate 0.85, foreground extras sharp. On by default.
            </span>
          </span>
        </label>
        {c.dofOnTalk !== false && (
          <Field label={`DOF blur ${(c.dofBlur ?? 2).toFixed(1)}px`}>
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={6} step={0.5} value={c.dofBlur ?? 2} className="flex-1 accent-pink-500" onChange={(e) => set({ dofBlur: Number(e.target.value) })} />
              <span className="w-8 text-right font-type text-[10px] text-paper/70">{(c.dofBlur ?? 2).toFixed(1)}px</span>
            </div>
          </Field>
        )}
      </CollapsibleSection>

      <CollapsibleSection id="cin-foreground" title="🧍 Foreground overlay">
        <p className="font-type text-[9px] text-paper/40">
          Layers a fixed image over the scene, in front of any camera motion — great for a character, prop or frame. Works with every
          camera mode (and static).
        </p>

        <Field label="Foreground image (transparent PNG works best)">
          <div className="flex gap-1">
            <input
              className={inputCls}
              placeholder="/img/foreground.png"
              value={mediaField(c.foregroundImage)}
              onChange={(e) => set({ foregroundImage: e.target.value || undefined })}
            />
            <MediaUploadButton
              storyId={storyId}
              accept="image/*"
              label="⇧"
              onUploaded={(_url, assetId) => set({ foregroundImage: `asset:${assetId}` })}
            />
          </div>
          <div className="mt-1">
            <ImagePicker
              value={c.foregroundImage}
              onChange={(v) => set({ foregroundImage: v || undefined })}
              placeholder="🖼 browse the image library (uploads, cutouts, built-ins)…"
            />
          </div>
        </Field>

        {hasForeground && (
          <>
            <ForegroundPositionEditor
              previewUrl={previewUrl}
              cinematic={cinematic}
              media={media}
              x={c.foregroundX ?? 50}
              y={c.foregroundY ?? 50}
              anchor={c.foregroundAnchor ?? "50% 50%"}
              replayEpoch={zoomEpoch}
              onChange={(x, y) => set({ foregroundX: x, foregroundY: y })}
              onAnchorAt={(anchor, x, y) => set({ foregroundAnchor: anchor, foregroundX: x, foregroundY: y })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Field label={`Scale ${(c.foregroundScale ?? 1).toFixed(2)}×`}>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0.25}
                    max={2.5}
                    step={0.05}
                    value={c.foregroundScale ?? 1}
                    className="flex-1 accent-pink-500"
                    onChange={(e) => set({ foregroundScale: Number(e.target.value) })}
                  />
                  <span className="w-9 text-right font-type text-[10px] text-paper/70">{(c.foregroundScale ?? 1).toFixed(2)}×</span>
                </div>
              </Field>
              <Field label={`Rotation ${Math.round(c.foregroundRotation ?? 0)}°`}>
                <input type="range" min={-180} max={180} step={1} value={c.foregroundRotation ?? 0} className="w-full accent-pink-500"
                  onChange={(e) => set({ foregroundRotation: Number(e.target.value) || undefined })} />
              </Field>
              <Field label="Fit">
                <select
                  className={inputCls}
                  value={c.foregroundFit ?? "contain"}
                  onChange={(e) => set({ foregroundFit: e.target.value as CinematicSettings["foregroundFit"] })}
                >
                  <option value="contain">Contain — whole image fits</option>
                  <option value="cover">Cover — fill the frame, crop edges</option>
                  <option value="fill">Fill — stretch to fill the frame</option>
                  <option value="native">Native — draw at its real size</option>
                </select>
              </Field>
            </div>
            <p className="border border-gold/25 bg-gold/5 p-2 font-type text-[9px] leading-snug text-paper/55">
              The <b className="text-gold">focus point</b> is set by <b className="text-gold">clicking the spot on the subject</b> in the
              preview above — it stays fixed while the foreground zoom plays. Drag to move the subject.
            </p>
            <div className="space-y-2 border border-gold/25 bg-gold/5 p-2">
              <span className="font-pulp text-[9px] uppercase tracking-widest text-gold">🔍 Foreground zoom</span>
              {/* Direction quick-set: push in (multiplier >1), pull out (multiplier <1), or off (1×). */}
              <div className="flex gap-1">
                <button
                  onClick={() => set({ foregroundZoom: 1.25 })}
                  className={`flex-1 border py-1 font-pulp text-[9px] uppercase tracking-widest ${(c.foregroundZoom ?? 1) > 1 ? "border-gold bg-gold/15 text-gold" : "border-paper/30 text-paper/70 hover:border-gold hover:text-gold"}`}
                  title="Push in — zoom toward the anchor"
                >
                  ↗ Push in
                </button>
                <button
                  onClick={() => set({ foregroundZoom: 0.8 })}
                  className={`flex-1 border py-1 font-pulp text-[9px] uppercase tracking-widest ${(c.foregroundZoom ?? 1) < 1 ? "border-gold bg-gold/15 text-gold" : "border-paper/30 text-paper/70 hover:border-gold hover:text-gold"}`}
                  title="Pull out — zoom away from the anchor"
                >
                  ↘ Pull out
                </button>
                <button
                  onClick={() => set({ foregroundZoom: undefined })}
                  className={`flex-1 border py-1 font-pulp text-[9px] uppercase tracking-widest ${(c.foregroundZoom ?? 1) === 1 ? "border-paper/40 text-paper" : "border-paper/30 text-paper/50 hover:border-paper/60 hover:text-paper"}`}
                  title="No zoom — leave the foreground at its base scale"
                >
                  Off
                </button>
              </div>
              <Field label={`Zoom ${(c.foregroundZoom ?? 1) === 1 ? "off (1.00×)" : `${(c.foregroundZoom ?? 1) < 1 ? "1.00× → pull to " : "1.00× → push to "}${(c.foregroundZoom ?? 1).toFixed(2)}×`}`}>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0.5}
                    max={3}
                    step={0.05}
                    value={c.foregroundZoom ?? 1}
                    className="flex-1 accent-pink-500"
                    aria-label="Foreground zoom amount (below 1× = pull out, above 1× = push in)"
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      set({ foregroundZoom: Math.abs(v - 1) < 0.001 ? undefined : v });
                    }}
                  />
                  <span className="w-12 text-right font-type text-[10px] text-paper/70">
                    {(c.foregroundZoom ?? 1) === 1 ? "off" : `${(c.foregroundZoom ?? 1).toFixed(2)}×`}
                  </span>
                </div>
              </Field>
              {(c.foregroundZoom ?? 1) !== 1 && (
                <div className="grid grid-cols-2 gap-2">
                  <Field label={`Zoom duration ${Math.round(c.foregroundZoomDuration ?? 8)}s`}>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      step={1}
                      className={inputCls}
                      value={c.foregroundZoomDuration ?? 8}
                      onChange={(e) => set({ foregroundZoomDuration: Math.max(1, Number(e.target.value) || 8) })}
                    />
                  </Field>
                  <div className="flex items-end">
                    <button
                      onClick={() => setZoomEpoch((n) => n + 1)}
                      className="w-full border border-gold/50 py-1 font-pulp text-[9px] uppercase tracking-widest text-gold hover:bg-gold/10"
                      title="Replay the zoom animation in the preview"
                    >
                      ↺ Replay zoom
                    </button>
                  </div>
                </div>
              )}
              <p className="font-type text-[9px] text-paper/45">
                A slow push-in (or pull-out, below 1×) that stays focused on the anchor point. The anchor is pinned at the offset set in the preview above.
              </p>
            </div>

            {/* ---- keyframe animation ---- */}
            <div className="space-y-2 border border-cyan-neon/25 bg-cyan-neon/5 p-2">
              <span className="font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">🎞 Keyframe animation</span>
              <Field label="Animation style">
                <select
                  className={inputCls}
                  value={animMode}
                  onChange={(e) => {
                    const mode = e.target.value as ForegroundAnimationMode | "none";
                    if (mode === "none") {
                      set({ foregroundAnimation: undefined });
                      return;
                    }
                    const next: ForegroundAnimation = {
                      ...(c.foregroundAnimation ?? { frames: [] }),
                      mode,
                    };
                    if (!next.frames.length && c.foregroundImage) next.frames = [c.foregroundImage];
                    set({ foregroundAnimation: next });
                  }}
                >
                  <option value="none">🖼 Static — single pose (no animation)</option>
                  <option value="dissolve">🌫 Dissolve — cross-fade between poses</option>
                  <option value="frames">🎞 Keyframes — hard sprite swap (Ace Attorney style)</option>
                </select>
              </Field>

              {animMode !== "none" && (
                <>
                  <Field label={`Keyframes (${frames.length}) — played in order`}>
                    <div className="space-y-1">
                      {frames.map((f, i) => (
                        <div key={i} className="space-y-1 border border-noir-700/60 p-1.5">
                          <div className="flex items-center gap-1">
                            <span className="w-4 shrink-0 text-center font-pulp text-[10px] text-paper/50">{i + 1}</span>
                            <input
                              className={inputCls}
                              placeholder={`/img/frame${i + 1}.png`}
                              value={frameName(f)}
                              title={f}
                              onChange={(e) => {
                                const next = [...frames];
                                next[i] = e.target.value;
                                setAnim({ frames: next });
                              }}
                            />
                            <MediaUploadButton
                              storyId={storyId}
                              accept="image/*"
                              label="⇧"
                              onUploaded={(_url, assetId) => {
                                const next = [...frames];
                                next[i] = `asset:${assetId}`;
                                setAnim({ frames: next });
                              }}
                            />
                            <button
                              onClick={() => {
                                const next = [...frames];
                                next.splice(i, 1);
                                if (next.length) setAnim({ frames: next });
                                else set({ foregroundAnimation: undefined });
                              }}
                              className="shrink-0 border border-crimson/40 px-1.5 py-1 font-pulp text-[9px] uppercase text-crimson hover:bg-crimson/10"
                              title="Remove this frame"
                            >
                              ✕
                            </button>
                          </div>
                          <ImagePicker
                            value={f}
                            onChange={(v) => {
                              const next = [...frames];
                              if (v) next[i] = v;
                              else next.splice(i, 1);
                              if (next.length) setAnim({ frames: next });
                              else set({ foregroundAnimation: undefined });
                            }}
                            placeholder="🖼 pick this keyframe from the library…"
                          />
                        </div>
                      ))}
                      <div className="flex gap-1">
                        <button
                          onClick={() => setAnim({ frames: [...frames, frames[frames.length - 1] ?? c.foregroundImage ?? ""] })}
                          className="border border-cyan-neon/40 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
                        >
                          ＋ Add frame
                        </button>
                        {c.foregroundImage && !frames.includes(c.foregroundImage) && (
                          <button
                            onClick={() => setAnim({ frames: [...frames, c.foregroundImage!] })}
                            className="border border-paper/30 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-paper/70 hover:border-gold hover:text-gold"
                            title="Append the static foreground image as another keyframe"
                          >
                            ＋ Use foreground image
                          </button>
                        )}
                      </div>
                    </div>
                  </Field>

                  <div className="grid grid-cols-2 gap-2">
                    <Field label={`Frame time ${(c.foregroundAnimation?.frameDuration ?? 0.2).toFixed(2)}s`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0.05}
                          max={1.5}
                          step={0.05}
                          value={c.foregroundAnimation?.frameDuration ?? 0.2}
                          className="flex-1 accent-pink-500"
                          onChange={(e) => setAnim({ frameDuration: Number(e.target.value) })}
                        />
                        <span className="w-9 text-right font-type text-[10px] text-paper/70">
                          {(c.foregroundAnimation?.frameDuration ?? 0.2).toFixed(2)}s
                        </span>
                      </div>
                    </Field>
                    {animMode === "dissolve" ? (
                      <Field
                        label={`Fade time ${(c.foregroundAnimation?.fadeDuration ?? c.foregroundAnimation?.frameDuration ?? 0.2).toFixed(2)}s`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={0}
                            max={1.5}
                            step={0.05}
                            value={c.foregroundAnimation?.fadeDuration ?? c.foregroundAnimation?.frameDuration ?? 0.2}
                            className="flex-1 accent-pink-500"
                            onChange={(e) => setAnim({ fadeDuration: Number(e.target.value) })}
                          />
                          <span className="w-9 text-right font-type text-[10px] text-paper/70">
                            {(c.foregroundAnimation?.fadeDuration ?? c.foregroundAnimation?.frameDuration ?? 0.2).toFixed(2)}s
                          </span>
                        </div>
                      </Field>
                    ) : (
                      <Field label="Playback">
                        <select
                          className={inputCls}
                          value={(c.foregroundAnimation?.loops ?? 0) <= 0 ? "loop" : String(c.foregroundAnimation?.loops)}
                          onChange={(e) => setAnim({ loops: e.target.value === "loop" ? undefined : Number(e.target.value) })}
                        >
                          <option value="loop">∞ Loop forever</option>
                          <option value="1">▶ Play once — hold last frame</option>
                          <option value="2">▶▶ Play twice</option>
                          <option value="3">▶▶▶ Play 3×</option>
                        </select>
                      </Field>
                    )}
                  </div>
                  {animMode === "dissolve" && (
                    <div className="grid grid-cols-1">
                      <Field label="Playback">
                        <select
                          className={inputCls}
                          value={(c.foregroundAnimation?.loops ?? 0) <= 0 ? "loop" : String(c.foregroundAnimation?.loops)}
                          onChange={(e) => setAnim({ loops: e.target.value === "loop" ? undefined : Number(e.target.value) })}
                        >
                          <option value="loop">∞ Loop forever</option>
                          <option value="1">▶ Play once — hold last frame</option>
                          <option value="2">▶▶ Play twice</option>
                          <option value="3">▶▶▶ Play 3×</option>
                        </select>
                      </Field>
                    </div>
                  )}
                  <p className="font-type text-[9px] text-paper/45">
                    {animMode === "dissolve"
                      ? "Each pose holds for the frame time, then cross-fades into the next — smooth, dreamlike (a neutral pose melting into a head-turned shock)."
                      : "Keyframes swap instantly, one per frame time — traditional comic-panel / limited-frame animation, the Ace Attorney & Hotel Dusk look."}
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => set({ foregroundX: 50, foregroundY: 50, foregroundAnchor: undefined, foregroundZoom: undefined, foregroundZoomDuration: undefined })}
                className="flex-1 border border-paper/30 py-1 font-pulp text-[9px] uppercase tracking-widest text-paper/70 hover:border-gold hover:text-gold"
              >
                ⟲ Center foreground
              </button>
              <button
                onClick={() =>
                  set({
                    foregroundImage: undefined,
                    foregroundScale: undefined,
                    foregroundFit: undefined,
                    foregroundX: undefined,
                    foregroundY: undefined,
                    foregroundAnchor: undefined,
                    foregroundZoom: undefined,
                    foregroundZoomDuration: undefined,
                    foregroundAnimation: undefined,
                  })
                }
                className="flex-1 border border-crimson/40 py-1 font-pulp text-[9px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
              >
                ✕ Remove foreground
              </button>
            </div>
          </>
        )}
      </CollapsibleSection>

      {/* ---- sprite sheet editor: stacked foreground sprites ---- */}
      <CollapsibleSection id="cin-foreground-extras" title="🎞 Sprite sheet editor — foreground sprites" titleClass="text-neon">
        <p className="font-type text-[9px] text-paper/40">
          Layer sprites over the plate — characters, props, cars, signs. These controls work on both cinematic scenes
          and 🚶 walkable stage rooms. Each layer is positioned, scaled, ordered, blended and mirrored on the preview below,
          can loop a sprite-sheet animation, and parallaxes by its own depth.
        </p>
        <div className="space-y-1 border border-gold/25 bg-gold/5 p-2 font-type text-[9px] leading-snug text-paper/55">
          <div className="font-pulp text-[9px] uppercase tracking-widest text-gold">📐 How to make a sprite sheet (the whole recipe)</div>
          <p>
            <b className="text-paper/75">The fast way (no rules to remember):</b> get art with frames side by side on
            ONE flat backdrop colour — from the 🤖 AI tab (sprite starters, or style-transfer your own upload), a
            drawing, or a photo — then press <b>⚡ Upload art → auto-build</b> below. It removes the backdrop, slices
            the frames, sets the sizes and animations, and files the sheet under 📁 sprites in the media library.
            If removal eats into the art, set backdrop removal to <b>gentle</b>; if specks survive, <b>strong</b>;
            for full manual control use Media Tools ▸ ✂ Sprite Cutout Lab.
          </p>
          <p>
            <b className="text-paper/75">Doing it by hand instead:</b> one transparent PNG, every frame EXACTLY the
            same size, side by side. Frames count 0, 1, 2… left to right (extra rows continue the count). 3 frames of
            200 × 300 → one 600 × 300 image, and Frame W/H below = 200 × 300 (a SINGLE frame, not the whole image).
          </p>
          <p>
            <b className="text-paper/75">Sizes.</b> Exact size doesn't matter — the engine scales everything. Aim for
            frames ≈ 384–512 px tall for characters, ≈ 256 px for props/signs, up to ≈ 640 px for big pieces (a car),
            and keep the whole sheet under ≈ 4096 px a side. Bigger = crisper but heavier.
          </p>
          <p>
            <b className="text-paper/75">Animations.</b> Just lists of frame numbers, e.g. loop = 0, 1, 2, 1.
            Foreground sprites here play <b>loop</b> · stage walkers use <b>walk</b> + <b>idle</b> · talking
            portraits use <b>talk</b> + <b>rest</b> (characters can also hold 🎭 alternate sheets — outfits/moods
            switched by a beat's expression, see the Characters tab).
          </p>
          <p>
            <b className="text-paper/75">Placing it.</b> Every sprite gets a live preview — drag it into position on
            the scene, drag the ◢ corner (or scroll) to resize. Colour grades apply to sprites the same as the
            background, so they always sit in the scene's look.
          </p>
        </div>
        {(c.foregroundExtras ?? []).length > 0 && (
          <div className="space-y-1 border border-cyan-neon/35 bg-noir-950/60 p-2">
            <div className="flex items-center justify-between">
              <span className="font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">▤ Layer stack</span>
              <span className="font-type text-[8px] text-paper/40">back → front</span>
            </div>
            <div className="space-y-0.5">
              {(c.foregroundExtras ?? []).map((layer: ForegroundExtra, layerIndex: number) => (
                <div key={`layer-${layerIndex}`} className={`flex items-center gap-1 border px-1.5 py-1 ${layer.visible === false ? "border-noir-700/50 opacity-45" : "border-noir-700 bg-noir-900/70"}`}>
                  <button
                    type="button"
                    title={layer.visible === false ? "Show layer" : "Hide layer"}
                    aria-label={`${layer.visible === false ? "Show" : "Hide"} foreground layer ${layerIndex + 1}`}
                    onClick={() => {
                      const next = [...(c.foregroundExtras ?? [])];
                      next[layerIndex] = { ...next[layerIndex], visible: next[layerIndex].visible === false ? undefined : false };
                      set({ foregroundExtras: next });
                    }}
                    className="w-5 text-sm text-paper/70 hover:text-gold"
                  >{layer.visible === false ? "○" : "◉"}</button>
                  <div className="h-7 w-10 shrink-0 overflow-hidden border border-noir-700 bg-noir-950">
                    {layer.image && !layer.image.startsWith("gradient:") ? <img src={media(layer.image) ?? layer.image} alt="" className="h-full w-full object-contain" /> : <span className="flex h-full items-center justify-center text-[10px] text-paper/30">∎</span>}
                  </div>
                  <span className="min-w-0 flex-1 truncate font-type text-[9px] text-paper/70">{layer.image ? frameName(layer.image) : `Layer ${layerIndex + 1} — empty`}</span>
                  <span className="font-type text-[8px] tabular-nums text-paper/35">{Math.round((layer.opacity ?? 1) * 100)}%</span>
                  <button type="button" disabled={layerIndex === 0} onClick={() => { const next = [...(c.foregroundExtras ?? [])]; [next[layerIndex - 1], next[layerIndex]] = [next[layerIndex], next[layerIndex - 1]]; set({ foregroundExtras: next }); }} className="px-1 text-paper/50 enabled:hover:text-neon disabled:opacity-25" title="Move toward back">↑</button>
                  <button type="button" disabled={layerIndex === (c.foregroundExtras ?? []).length - 1} onClick={() => { const next = [...(c.foregroundExtras ?? [])]; [next[layerIndex], next[layerIndex + 1]] = [next[layerIndex + 1], next[layerIndex]]; set({ foregroundExtras: next }); }} className="px-1 text-paper/50 enabled:hover:text-neon disabled:opacity-25" title="Move toward front">↓</button>
                </div>
              ))}
            </div>
            <p className="font-type text-[8px] text-paper/35">Use ◉ to preview a layer, ↑/↓ to change draw order. The selected stack state is shared with stage previews.</p>
          </div>
        )}
        {(c.foregroundExtras ?? []).map((extra: ForegroundExtra, i: number) => {
          const update = (patch: Partial<ForegroundExtra>) => {
            const n = [...(c.foregroundExtras ?? [])];
            n[i] = { ...extra, ...patch };
            set({ foregroundExtras: n });
          };
          const remove = () => set({ foregroundExtras: (c.foregroundExtras ?? []).filter((_: ForegroundExtra, j: number) => j !== i) });
          return (
          <div key={i} className="space-y-1.5 border border-neon/20 bg-neon/5 p-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-pulp text-[9px] uppercase tracking-widest text-neon">Image {i + 1}{!extra.image ? " — choose an image" : ""}</span>
              <button
                className="shrink-0 border border-crimson/50 px-2 py-0.5 font-pulp text-[9px] uppercase text-crimson hover:bg-crimson/10"
                onClick={remove}
              >
                ✕
              </button>
            </div>
            <ImagePicker
              preferFolder="sprites"
              value={extra.image || undefined}
              placeholder="Pick a transparent image from the library…"
              onChange={(url) => update({ image: url ?? "" })}
            />
            {/* Live preview — drag the sprite onto the plate, corner-drag to resize. */}
            <SpriteBoxEditor
              mode="extra"
              backgroundUrl={previewUrl}
              image={media(extra.image) ?? extra.image ?? undefined}
              sheet={extra.sheet}
              resolve={media}
              x={extra.x ?? 50}
              y={extra.y ?? 80}
              scale={extra.scale ?? 1}
              flip={!!extra.flip}
              onChange={(p) => update(p)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Field label={`Position X ${extra.x ?? 50}% · Y ${extra.y ?? 80}%`}>
                <div className="space-y-1">
                  <input type="range" min={0} max={100} step={1} value={extra.x ?? 50} className="w-full accent-pink-500"
                    onChange={(e) => update({ x: Number(e.target.value) })} />
                  <input type="range" min={0} max={100} step={1} value={extra.y ?? 80} className="w-full accent-pink-500"
                    onChange={(e) => update({ y: Number(e.target.value) })} />
                </div>
              </Field>
              <Field label={`Scale ${(extra.scale ?? 1).toFixed(2)}×`}>
                <input type="range" min={0.2} max={2.5} step={0.05} value={extra.scale ?? 1} className="w-full accent-pink-500"
                  onChange={(e) => update({ scale: Number(e.target.value) })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Fit">
                <select className={inputCls} value={extra.fit ?? "contain"} onChange={(e) => update({ fit: e.target.value as never })}>
                  <option value="contain">Contain (whole fits)</option>
                  <option value="cover">Cover (fill frame)</option>
                  <option value="fill">Fill (stretch)</option>
                  <option value="native">Native size</option>
                </select>
              </Field>
              <Field label={`Parallax depth ${Math.round((extra.depth ?? 0) * 100)}%`}>
                <input type="range" min={0} max={1} step={0.05} value={extra.depth ?? 0} className="w-full accent-cyan-400"
                  onChange={(e) => update({ depth: Number(e.target.value) || undefined })} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60">
              <input type="checkbox" checked={!!extra.flip} onChange={(e) => update({ flip: e.target.checked || undefined })} />
              ↔ Flip horizontally (face the other way)
            </label>
            <div className="grid grid-cols-2 gap-2 border border-paper/15 bg-noir-950/30 p-2">
              <Field label={`Opacity ${Math.round((extra.opacity ?? 1) * 100)}%`}>
                <input type="range" min={0} max={1} step={0.05} value={extra.opacity ?? 1} className="w-full accent-pink-500"
                  onChange={(e) => update({ opacity: Number(e.target.value) >= 0.99 ? undefined : Number(e.target.value) })} />
              </Field>
              <Field label={`Rotation ${Math.round(extra.rotation ?? 0)}°`}>
                <input type="range" min={-180} max={180} step={1} value={extra.rotation ?? 0} className="w-full accent-pink-500"
                  onChange={(e) => update({ rotation: Number(e.target.value) || undefined })} />
              </Field>
              <Field label="Blend style">
                <select className={inputCls} value={extra.blendMode ?? "normal"} onChange={(e) => update({ blendMode: e.target.value as ForegroundExtra["blendMode"] })}>
                  <option value="normal">Normal — solid layer</option>
                  <option value="screen">Screen — light / neon / fog</option>
                  <option value="multiply">Multiply — ink / shadow</option>
                  <option value="overlay">Overlay — contrast</option>
                  <option value="soft-light">Soft light — haze</option>
                  <option value="difference">Difference — electric effect</option>
                </select>
              </Field>
              <div className="col-span-2 flex items-center justify-between gap-2">
                <span className="font-type text-[9px] text-paper/45">Layer {i + 1} · stacked order: back → front</span>
                <div className="flex gap-1">
                  <button type="button" disabled={i === 0} onClick={() => { const n = [...(c.foregroundExtras ?? [])]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; set({ foregroundExtras: n }); }} className="border border-noir-600 px-2 py-0.5 font-pulp text-[8px] uppercase text-paper/60 enabled:hover:border-neon enabled:hover:text-neon disabled:opacity-30">↑ Back</button>
                  <button type="button" disabled={i === (c.foregroundExtras ?? []).length - 1} onClick={() => { const n = [...(c.foregroundExtras ?? [])]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; set({ foregroundExtras: n }); }} className="border border-noir-600 px-2 py-0.5 font-pulp text-[8px] uppercase text-paper/60 enabled:hover:border-neon enabled:hover:text-neon disabled:opacity-30">↓ Front</button>
                </div>
              </div>
            </div>
            {/* ---- alpha mask: clip the layer to a cut-out shape ---- */}
            <div className="space-y-1 border border-cyan-400/30 bg-cyan-400/5 p-2">
              <div className="font-pulp text-[9px] uppercase tracking-widest text-cyan-300">🪟 Alpha mask — clip this layer to a shape</div>
              <label className="flex items-center gap-2 font-type text-[10px] text-paper/70">
                <input
                  type="checkbox"
                  checked={!!extra.maskImage}
                  onChange={(e) => update({ maskImage: e.target.checked ? (extra.image || "gradient:linear-gradient(#000,#000)") : undefined })}
                />
                Show this layer through another image's alpha mask
              </label>
              <p className="font-type text-[9px] leading-snug text-paper/45">
                The mask's <b>alpha</b> is what counts — its colours are ignored. This is the cockpit-window trick: a
                scrolling cityscape on one layer and a mask OPAQUE in the glass, transparent elsewhere.
                Opaque pixels REVEAL the city. If your mask is an opaque dashboard with a transparent window, enable Invert. Combine it with <b>Scroll</b> below and the vehicle reads as
                flying through traffic.
              </p>
              {extra.maskImage ? (
                <>
                  <ImagePicker
                    preferFolder="sprites"
                    value={extra.maskImage}
                    placeholder="Pick the cut-out to use as the mask…"
                    onChange={(url) => update({ maskImage: url ?? undefined })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Mask fit">
                      <select
                        className={inputCls}
                        value={extra.maskFit ?? "cover"}
                        onChange={(e) => update({ maskFit: e.target.value as ForegroundExtra["maskFit"] })}
                      >
                        <option value="cover">Cover — fill the layer box</option>
                        <option value="contain">Contain — show the whole mask</option>
                        <option value="fill">Fill — stretch to fit</option>
                      </select>
                    </Field>
                    <label className="flex items-end gap-2 pb-1 font-type text-[10px] text-paper/70">
                      <input type="checkbox" checked={!!extra.maskInvert} onChange={(e) => update({ maskInvert: e.target.checked || undefined })} />
                      Invert (show what's HIDDEN)
                    </label>
                  </div>
                </>
              ) : null}
            </div>
            {/* ---- scroll: endless crawl (rain on glass, passing skyline) ---- */}
            <div className="space-y-1 border border-emerald-400/30 bg-emerald-400/5 p-2">
              <div className="font-pulp text-[9px] uppercase tracking-widest text-emerald-300">🌀 Scroll — endless crawl</div>
              <label className="flex items-center gap-2 font-type text-[10px] text-paper/70">
                <input
                  type="checkbox"
                  checked={!!extra.scroll}
                  onChange={(e) => update({ scroll: e.target.checked ? { axis: "x", speed: 12 } : undefined })}
                />
                Crawl this layer's art forever
              </label>
              <p className="font-type text-[9px] leading-snug text-paper/45">
                The art tiles edge-to-edge and slides in a seamless loop, so it never runs out: rain down a window,
                streetlights raking a windscreen, a skyline passing under a hovering car. Pure CSS — nothing runs per
                frame. A mask above still clips it.
              </p>
              {extra.scroll ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Axis">
                      <select
                        className={inputCls}
                        value={extra.scroll.axis ?? "x"}
                        onChange={(e) => update({ scroll: { ...extra.scroll!, axis: e.target.value as "x" | "y" } })}
                      >
                        <option value="x">↔ Sideways (passing skyline)</option>
                        <option value="y">↕ Vertical (rain on glass)</option>
                      </select>
                    </Field>
                    <Field label={`Speed — ${Math.round(extra.scroll.speed ?? 12)}%/s`}>
                      <input
                        type="range"
                        min={-60}
                        max={60}
                        step={1}
                        value={extra.scroll.speed ?? 12}
                        className="w-full accent-emerald-400"
                        onChange={(e) => update({ scroll: { ...extra.scroll!, speed: Number(e.target.value) } })}
                      />
                    </Field>
                  </div>
                  <Field label={`Cross drift — ${Math.round(extra.scroll.crossSpeed ?? 0)}%/s (diagonal streak)`}>
                    <input
                      type="range"
                      min={-40}
                      max={40}
                      step={1}
                      value={extra.scroll.crossSpeed ?? 0}
                      className="w-full accent-emerald-400"
                      onChange={(e) => update({ scroll: { ...extra.scroll!, crossSpeed: Number(e.target.value) || undefined } })}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    {(["offsetX", "offsetY"] as const).map(axis => <Field key={axis} label={`Start ${axis === "offsetX" ? "X" : "Y"} (% of tile)`}>
                      <input type="number" min={-100} max={100} className={inputCls} value={extra.scroll![axis] ?? 0}
                        onChange={e => update({ scroll: { ...extra.scroll!, [axis]: Number(e.target.value) || undefined } })} />
                    </Field>)}
                  </div>
                  <label className="flex items-center gap-2 font-type text-[10px] text-paper/70">
                    <input
                      type="checkbox"
                      checked={extra.scroll.repeat !== false}
                      onChange={(e) => update({ scroll: { ...extra.scroll!, repeat: e.target.checked ? undefined : false } })}
                    />
                    Repeat tiles continuously (off = one pass, then hold)
                  </label>
                </>
              ) : null}
            </div>
            {/* ---- walk-behind mask: the cutout IS the mask ---- */}
            <div className="space-y-1 border border-amber-400/30 bg-amber-400/5 p-2">
              <div className="font-pulp text-[9px] uppercase tracking-widest text-amber-300">🚶 Walk-behind mask (🚶 stage rooms)</div>
              <label className="flex items-center gap-2 font-type text-[10px] text-paper/70">
                <input type="checkbox" checked={!!extra.occludes} onChange={(e) => update({ occludes: e.target.checked || undefined })} />
                Draw this OVER the player when they walk behind it
              </label>
              <p className="font-type text-[9px] leading-snug text-paper/45">
                Turn any foreground cutout into an occluder — no second asset. While the walker's feet are ABOVE the
                depth line they are standing behind the object, so the art is drawn over them (they vanish behind the
                counter, the truck, the pillar). Step below the line and they're in front of it again. Pair it with a
                🚧 barrier so they can't walk through it either.
              </p>
              {extra.occludes ? (
                <Field label={`Depth line (base of the object) — ${extra.occludeBaseline ?? extra.y ?? 80}% down the plate`}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={extra.occludeBaseline ?? extra.y ?? 80}
                    className="w-full accent-amber-400"
                    onChange={(e) => update({ occludeBaseline: Number(e.target.value) })}
                  />
                </Field>
              ) : null}
            </div>
            {/* ---- world pinning: stop the prop sliding on a wide stage ---- */}
            <div className="space-y-1 border border-violet-400/30 bg-violet-400/5 p-2">
              <div className="font-pulp text-[9px] uppercase tracking-widest text-violet-300">📌 Pin to the room (wide stages)</div>
              <label className="flex items-center gap-2 font-type text-[10px] text-paper/70">
                <input
                  type="checkbox"
                  checked={extra.worldX !== undefined}
                  onChange={(e) =>
                    update({ worldX: e.target.checked ? (extra.x ?? 50) : undefined })
                  }
                />
                This prop belongs to the ROOM, not the screen
              </label>
              <p className="font-type text-[9px] leading-snug text-paper/45">
                On a wide stage (🚶 stage room → world width over 100) the camera pans as the player walks. By default a
                foreground layer is pinned to the <b>screen</b>, so it slides across the artwork — a dumpster drifting
                down the alley. Tick this and it stays where you put it in the <b>room</b> instead. Anything the player
                walks behind should be pinned.
              </p>
              {extra.worldX !== undefined ? (
                <Field label={`Position in the room — ${Math.round(extra.worldX)} (0 to the room's world width)`}>
                  <input
                    type="range"
                    min={0}
                    max={400}
                    step={1}
                    value={extra.worldX}
                    className="w-full accent-violet-400"
                    onChange={(e) => update({ worldX: Number(e.target.value) })}
                  />
                </Field>
              ) : null}
            </div>
            {/* ---- animate with a sprite sheet (flickering neon, rain-lashed flags) ---- */}
            <div className="space-y-1 border border-cyan-neon/30 bg-cyan-neon/5 p-2">
              <div className="font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">🎞 Animate with a sprite sheet</div>
              <p className="font-type text-[9px] leading-snug text-paper/45">
                Loop a frame grid instead of the static image — a flickering neon sign, a rain-lashed flag. The
                "loop" animation plays on repeat; the static image above stays as your fallback. Position, scale,
                flip and depth still apply.
              </p>
              <SpriteSheetControls
                value={extra.sheet}
                storyId={storyId}
                preset={EXTRA_PRESET}
                onChange={(sheet) => update({ sheet })}
              />
            </div>
            {/* ---- motion path + idle preset (🎬 the gull flies across) ---- */}
            <div className="space-y-1 border border-emerald-400/30 bg-emerald-400/5 p-2">
              <div className="font-pulp text-[9px] uppercase tracking-widest text-emerald-300">🎬 Motion &amp; idle animation</div>
              <p className="font-type text-[9px] leading-snug text-paper/45">
                <b>Idle motion</b> loops a CSS preset — no extra art. A <b>motion path</b> flies the sprite along its
                waypoints at a constant speed: a gull crossing the harbour, a car passing outside, a rat along the
                skirting. Paths compile to real keyframes, so nothing runs in JavaScript while they play.
              </p>
              <Field label="Idle motion">
                <select
                  className={inputCls}
                  value={extra.anim?.preset ?? "none"}
                  onChange={(e) => update({ anim: { ...(extra.anim ?? {}), preset: e.target.value as never } })}
                >
                  {ANIM_PRESETS.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.label} — {pr.blurb}
                    </option>
                  ))}
                </select>
              </Field>
              {(extra.anim?.preset ?? "none") !== "none" && (
                <div className="grid grid-cols-2 gap-2">
                  <Field label={`Speed ${(extra.anim?.speed ?? 1).toFixed(2)}×`}>
                    <input
                      type="range"
                      min={0.25}
                      max={3}
                      step={0.05}
                      value={extra.anim?.speed ?? 1}
                      className="w-full accent-emerald-400"
                      onChange={(e) => update({ anim: { ...(extra.anim ?? {}), speed: Number(e.target.value) } })}
                    />
                  </Field>
                  <Field label={`Intensity ${(extra.anim?.intensity ?? 1).toFixed(2)}`}>
                    <input
                      type="range"
                      min={0.2}
                      max={2}
                      step={0.05}
                      value={extra.anim?.intensity ?? 1}
                      className="w-full accent-emerald-400"
                      onChange={(e) => update({ anim: { ...(extra.anim ?? {}), intensity: Number(e.target.value) } })}
                    />
                  </Field>
                </div>
              )}
              <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60">
                <input
                  type="checkbox"
                  checked={!!extra.motion}
                  onChange={(e) =>
                    update({
                      motion: e.target.checked
                        ? { points: [{ x: 8, y: 28 }, { x: 92, y: 20 }], duration: 11, ease: "arc", loop: "loop", holdSeconds: 2, faceTravel: true }
                        : undefined,
                    })
                  }
                />
                Fly along a path
              </label>
              {extra.motion &&
                (() => {
                  const m = extra.motion;
                  const setM = (patch: Partial<MotionPath>) => update({ motion: { ...m, ...patch } });
                  const setPt = (i: number, patch: Partial<{ x: number; y: number }>) =>
                    setM({ points: m.points.map((pt, j) => (j === i ? { ...pt, ...patch } : pt)) });
                  const last = m.points[m.points.length - 1];
                  return (
                    <div className="space-y-1.5 border border-noir-600 bg-noir-950/60 p-2">
                      <div className="font-type text-[9px] text-emerald-300/90">{describeMotion(m)}</div>
                      {m.points.map((pt, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="w-5 shrink-0 font-pulp text-[8px] text-paper/40">{i + 1}</span>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={Math.round(pt.x)}
                            title="X — % across the frame"
                            className={`${inputCls} w-14`}
                            onChange={(e) => setPt(i, { x: Number(e.target.value) })}
                          />
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={Math.round(pt.y)}
                            title="Y — % down the frame"
                            className={`${inputCls} w-14`}
                            onChange={(e) => setPt(i, { y: Number(e.target.value) })}
                          />
                          <button
                            type="button"
                            className="shrink-0 px-1 font-pulp text-[9px] text-crimson disabled:opacity-30"
                            title="Remove this waypoint"
                            disabled={m.points.length <= 2}
                            onClick={() => setM({ points: m.points.filter((_, j) => j !== i) })}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="w-full border border-emerald-400/40 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-emerald-300 hover:bg-emerald-400/10"
                        onClick={() => setM({ points: [...m.points, { x: Math.min(100, Math.round(last.x + 12)), y: last.y }] })}
                      >
                        ＋ add waypoint
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label={`Pass time ${m.duration}s`}>
                          <input
                            type="range"
                            min={0.5}
                            max={60}
                            step={0.5}
                            value={m.duration}
                            className="w-full accent-emerald-400"
                            onChange={(e) => setM({ duration: Number(e.target.value) })}
                          />
                        </Field>
                        <Field label={`Pause at end ${(m.holdSeconds ?? 0).toFixed(1)}s`}>
                          <input
                            type="range"
                            min={0}
                            max={20}
                            step={0.5}
                            value={m.holdSeconds ?? 0}
                            className="w-full accent-emerald-400"
                            onChange={(e) => setM({ holdSeconds: Number(e.target.value) || undefined })}
                          />
                        </Field>
                        <Field label="Repeat">
                          <select className={inputCls} value={m.loop ?? "loop"} onChange={(e) => setM({ loop: e.target.value as never })}>
                            <option value="loop">loop (restart)</option>
                            <option value="pingpong">ping-pong (there &amp; back)</option>
                            <option value="once">once (play and hold)</option>
                          </select>
                        </Field>
                        <Field label="Easing">
                          <select className={inputCls} value={m.ease ?? "linear"} onChange={(e) => setM({ ease: e.target.value as never })}>
                            {EASES.map((ez) => (
                              <option key={ez.id} value={ez.id}>
                                {ez.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label={`End size ${(m.scaleTo ?? 1).toFixed(2)}×`}>
                          <input
                            type="range"
                            min={0.2}
                            max={2}
                            step={0.05}
                            value={m.scaleTo ?? 1}
                            className="w-full accent-emerald-400"
                            onChange={(e) => setM({ scaleTo: Number(e.target.value) })}
                          />
                        </Field>
                        <Field label={`End fade ${(m.fadeTo ?? 1).toFixed(2)}`}>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={m.fadeTo ?? 1}
                            className="w-full accent-emerald-400"
                            onChange={(e) => setM({ fadeTo: Number(e.target.value) })}
                          />
                        </Field>
                      </div>
                      <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60">
                        <input
                          type="checkbox"
                          checked={m.faceTravel !== false}
                          onChange={(e) => setM({ faceTravel: e.target.checked })}
                        />
                        Turn to face the way it travels
                      </label>
                    </div>
                  );
                })()}
            </div>
          </div>
          );
        })}
        <div className="flex gap-2">
          <button
            className="flex-1 border border-neon/50 py-1.5 font-pulp text-[9px] uppercase tracking-widest text-neon hover:bg-neon/10"
            onClick={() =>
              set({
                foregroundExtras: [
                  ...(c.foregroundExtras ?? []),
                  { image: "", x: 50, y: 80, scale: 1, fit: "contain", anchor: "50% 100%", depth: 0.6 },
                ],
              })
            }
          >
            ＋ Add foreground image
          </button>
          <MediaUploadButton
            storyId={storyId}
            accept="image/*"
            label="⤒ Upload new"
            onUploaded={(_url, assetId) =>
              set({
                foregroundExtras: [
                  ...(c.foregroundExtras ?? []),
                  { image: `asset:${assetId}`, x: 50, y: 80, scale: 1, fit: "contain", anchor: "50% 100%", depth: 0.6 },
                ],
              })
            }
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection id="cin-lighting" title="💡 Lighting" titleClass="text-gold">
        <Field label="Image dimming (0 = full brightness, 1 = fully dark)">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={0.9}
              step={0.05}
              value={c.dimAmount ?? 0}
              className="flex-1 accent-pink-500"
              onChange={(e) => set({ dimAmount: Number(e.target.value) || undefined })}
            />
            <span className="w-8 text-right font-type text-[10px] text-paper/70">
              {((c.dimAmount ?? 0) * 100).toFixed(0)}%
            </span>
          </div>
        </Field>

        <div className="border-t border-gold/20 pt-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-pulp text-[9px] uppercase tracking-wider text-gold">
            💡 Light glows {points.length ? `· ${points.length}` : ""}
          </div>
          <button
            onClick={() => commitPoints([...points, defaultLight()])}
            className="border border-gold/50 px-2 py-0.5 font-pulp text-[9px] uppercase tracking-widest text-gold hover:bg-gold/10"
          >
            ＋ Add light
          </button>
        </div>

        {points.length === 0 && (
          <p className="font-type text-[9px] text-paper/45">
            No lights yet. Add one to make a lamp, window, or neon sign feel alive — each glows additively (screen blend) and
            breathes on a smooth sine wave.
          </p>
        )}

        {points.map((light, i) => {
          const glow = parseGlowColor(light.color);
          const upd = (patch: Partial<typeof light>) =>
            commitPoints(points.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
          return (
            <div key={i} className="space-y-1.5 border border-noir-600 p-2">
              <div className="flex items-center justify-between">
                <span className="font-pulp text-[9px] uppercase text-gold">Light {i + 1}</span>
                <button
                  onClick={() => commitPoints(points.filter((_, idx) => idx !== i))}
                  className="text-[9px] uppercase text-crimson hover:underline"
                >
                  ✕ remove
                </button>
              </div>

              {/* click-to-place preview showing every light, this one ringed.
                  The dim overlay sits BELOW the light glows — a light source
                  stays bright when the image darkens — so only the image dims. */}
              <div
                className="relative aspect-video w-full cursor-crosshair overflow-hidden isolate border border-gold/30"
                style={{ ...bgStyle(previewUrl) }}
                title="Click to move this light"
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  upd({ x: Math.round(((e.clientX - r.left) / r.width) * 100), y: Math.round(((e.clientY - r.top) / r.height) * 100) });
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0 z-[1] bg-black"
                  style={{ opacity: c.dimAmount ?? 0 }}
                />
                {resolveLights(c).map((l, li) => (
                  <div key={li} className="cin-light" style={lightStyle(l)} />
                ))}
                <LensFlareLayer cinematic={c} />
                <div
                  className="pointer-events-none absolute z-[4] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-neon shadow-[0_0_8px_#ff2e88]"
                  style={{ left: `${light.x}%`, top: `${light.y}%` }}
                />
                <p className="pointer-events-none absolute inset-0 z-[4] flex items-end justify-center pb-1 font-pulp text-[8px] uppercase tracking-widest text-paper/60">
                  Click to move light {i + 1}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field label="Colour">
                  <input
                    type="color"
                    className="h-8 w-full border border-noir-600 bg-noir-950 cursor-pointer"
                    value={glow.hex}
                    onChange={(e) => upd({ color: e.target.value })}
                  />
                </Field>
                <Field label={`Size ${light.size ?? 40}%`}>
                  <input
                    type="range"
                    min={10}
                    max={90}
                    step={1}
                    className="w-full accent-pink-500"
                    value={light.size ?? 40}
                    onChange={(e) => upd({ size: Number(e.target.value) })}
                  />
                </Field>
              </div>

              <Field label={`Brightness ${Math.round((light.intensity ?? 0.5) * 100)}%`}>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={1}
                  className="w-full accent-pink-500"
                  value={Math.round((light.intensity ?? 0.5) * 100)}
                  onChange={(e) => upd({ intensity: Number(e.target.value) / 100 })}
                />
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <Field label={`Position X ${light.x}%`}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    className="w-full accent-pink-500"
                    value={light.x}
                    onChange={(e) => upd({ x: Number(e.target.value) })}
                  />
                </Field>
                <Field label={`Position Y ${light.y}%`}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    className="w-full accent-pink-500"
                    value={light.y}
                    onChange={(e) => upd({ y: Number(e.target.value) })}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field label={`Pulse speed ${(light.pulseSeconds ?? 2.8).toFixed(1)}s`}>
                  <input
                    type="range"
                    min={0.5}
                    max={8}
                    step={0.1}
                    className="w-full accent-pink-500"
                    value={light.pulseSeconds ?? 2.8}
                    onChange={(e) => upd({ pulseSeconds: Number(e.target.value) })}
                  />
                </Field>
                <Field label={`Pulse depth ${Math.round((light.pulseAmount ?? 1) * 100)}%`}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    className="w-full accent-pink-500"
                    value={Math.round((light.pulseAmount ?? 1) * 100)}
                    onChange={(e) => upd({ pulseAmount: Number(e.target.value) / 100 })}
                  />
                </Field>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFlare({
                    x: light.x,
                    y: light.y,
                    color: glow.hex,
                    preset: "warm-amber",
                    intensity: Math.max(0.6, light.intensity ?? 0.75),
                  });
                }}
                className="w-full border border-cyan-neon/40 bg-cyan-neon/5 py-1 font-pulp text-[8px] uppercase tracking-wider text-cyan-neon hover:bg-cyan-neon/15 transition-colors"
              >
                ✨ Cast dynamic lens flare from Light {i + 1}
              </button>
            </div>
          );
        })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="cin-lensflare"
        title="✨ Dynamic Lens Flare"
        titleClass="text-cyan-neon"
        hint={hasFlare && flare ? (LENS_FLARE_PRESETS[flare.preset]?.name ?? flare.preset) : undefined}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-pulp text-[10px] uppercase tracking-wider text-paper/90">
                Dynamic Lens Flare
              </span>
              <p className="font-type text-[9px] text-paper/45">
                Simulates optical anamorphic laser streaks, diffraction starbursts, and chromatic ghost reflections along the optical axis.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (hasFlare) {
                  set({ lensFlare: undefined });
                } else {
                  const firstLight = points[0];
                  set({
                    lensFlare: defaultLensFlare(
                      "anamorphic-blue",
                      firstLight ? { x: firstLight.x, y: firstLight.y } : undefined
                    ),
                  });
                }
              }}
              className={`border px-2.5 py-1 font-pulp text-[9px] uppercase tracking-widest transition-colors ${
                hasFlare
                  ? "border-crimson/50 text-crimson hover:bg-crimson/10"
                  : "border-cyan-neon bg-cyan-neon/10 text-cyan-neon hover:bg-cyan-neon/20 shadow-[0_0_8px_rgba(42,217,217,0.3)]"
              }`}
            >
              {hasFlare ? "✕ Remove flare" : "＋ Enable lens flare"}
            </button>
          </div>

          {hasFlare && flare && (
            <>
              {/* Presets Grid */}
              <div className="space-y-1.5 border border-noir-600 bg-noir-900/60 p-2">
                <span className="font-pulp text-[9px] uppercase tracking-wider text-cyan-neon">
                  Optical Profiles & Presets
                </span>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                  {(Object.keys(LENS_FLARE_PRESETS) as LensFlarePreset[]).map((pkey) => {
                    const pr = LENS_FLARE_PRESETS[pkey];
                    const isSel = (flare.preset ?? "anamorphic-blue") === pkey;
                    return (
                      <button
                        key={pkey}
                        type="button"
                        onClick={() => {
                          const base = defaultLensFlare(pkey, { x: flare.x, y: flare.y });
                          setFlare({ ...base, x: flare.x, y: flare.y });
                        }}
                        className={`flex flex-col items-start rounded border p-1.5 text-left transition-all ${
                          isSel
                            ? "border-cyan-neon bg-cyan-neon/15 shadow-[0_0_8px_rgba(42,217,217,0.3)]"
                            : "border-noir-700 bg-noir-950/70 hover:border-paper/40 hover:bg-noir-800"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="font-pulp text-[8.5px] font-semibold text-paper truncate">
                            {pr.name}
                          </span>
                          <span
                            className="h-2 w-2 rounded-full border border-black/40 shrink-0"
                            style={{ backgroundColor: pr.color, boxShadow: `0 0 4px ${pr.color}` }}
                          />
                        </div>
                        <span className="mt-0.5 font-type text-[7.5px] text-paper/50 truncate w-full">
                          {pr.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="font-type text-[8.5px] text-paper/50 italic pt-0.5">
                  {LENS_FLARE_PRESETS[flare.preset]?.tagline ?? ""}
                </p>
              </div>

              {/* Click-to-Place Interactive Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-pulp text-[9px] uppercase tracking-wider text-gold">
                    Position ({flare.x}%, {flare.y}%)
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setFlare({ x: 50, y: 50 })}
                      className="border border-paper/20 px-1.5 py-0.5 font-pulp text-[7.5px] uppercase tracking-widest text-paper/70 hover:border-gold hover:text-gold"
                    >
                      ⟲ Center
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlare({ x: 25, y: 20 })}
                      className="border border-paper/20 px-1.5 py-0.5 font-pulp text-[7.5px] uppercase tracking-widest text-paper/70 hover:border-gold hover:text-gold"
                    >
                      ↖ Top-L
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlare({ x: 75, y: 20 })}
                      className="border border-paper/20 px-1.5 py-0.5 font-pulp text-[7.5px] uppercase tracking-widest text-paper/70 hover:border-gold hover:text-gold"
                    >
                      ↗ Top-R
                    </button>
                    {points.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const l = points[0];
                          if (l) setFlare({ x: l.x, y: l.y, color: l.color });
                        }}
                        className="border border-cyan-neon/40 bg-cyan-neon/10 px-1.5 py-0.5 font-pulp text-[7.5px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/20"
                        title="Snap flare to light 1 position and color"
                      >
                        🔗 Snap to Light 1
                      </button>
                    )}
                  </div>
                </div>

                <div
                  className="relative aspect-video w-full cursor-crosshair overflow-hidden isolate border border-cyan-neon/40 shadow-inner"
                  style={{ ...bgStyle(previewUrl) }}
                  title="Click to place the lens flare light source"
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const nx = Math.round(((e.clientX - r.left) / r.width) * 100);
                    const ny = Math.round(((e.clientY - r.top) / r.height) * 100);
                    setFlare({ x: clamp(nx, 0, 100), y: clamp(ny, 0, 100) });
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 z-[1] bg-black"
                    style={{ opacity: c.dimAmount ?? 0 }}
                  />
                  {resolveLights(c).map((l, li) => (
                    <div key={li} className="cin-light" style={lightStyle(l)} />
                  ))}

                  {/* Real-time Lens Flare Preview */}
                  <LensFlareLayer flareOverride={flare} />

                  {/* Optical Axis line */}
                  <svg className="pointer-events-none absolute inset-0 h-full w-full z-[5] opacity-40">
                    <line
                      x1={`${flare.x}%`}
                      y1={`${flare.y}%`}
                      x2={`${100 - flare.x}%`}
                      y2={`${100 - flare.y}%`}
                      stroke="#2ad9d9"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <circle cx="50%" cy="50%" r="3" fill="#2ad9d9" />
                  </svg>

                  {/* Light Source Target Ring */}
                  <div
                    className="pointer-events-none absolute z-[6] h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-neon shadow-[0_0_10px_#2ad9d9]"
                    style={{ left: `${flare.x}%`, top: `${flare.y}%` }}
                  >
                    <div className="absolute inset-1 rounded-full bg-cyan-neon/30 animate-ping" />
                  </div>

                  <p className="pointer-events-none absolute bottom-1 inset-x-0 z-[6] flex justify-center font-pulp text-[8px] uppercase tracking-widest text-paper/70 bg-black/40 py-0.5">
                    Click to move flare source · Optical axis lines up across center
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Field label={`Position X: ${flare.x}%`}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      className="w-full accent-cyan-400"
                      value={flare.x}
                      onChange={(e) => setFlare({ x: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label={`Position Y: ${flare.y}%`}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      className="w-full accent-cyan-400"
                      value={flare.y}
                      onChange={(e) => setFlare({ y: Number(e.target.value) })}
                    />
                  </Field>
                </div>
              </div>

              {/* Colors & Overall Intensity */}
              <div className="space-y-2 border-t border-noir-700 pt-2">
                <Field label={`Overall Intensity: ${Math.round(flare.intensity * 100)}%`}>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={1}
                    className="w-full accent-cyan-400"
                    value={Math.round(flare.intensity * 100)}
                    onChange={(e) => setFlare({ intensity: Number(e.target.value) / 100 })}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-2">
                  <Field label="Primary Flare Color">
                    <input
                      type="color"
                      className="h-8 w-full border border-noir-600 bg-noir-950 cursor-pointer"
                      value={flareGlow.hex}
                      onChange={(e) => setFlare({ color: e.target.value })}
                    />
                  </Field>
                  <Field label="Secondary / Ghost Tint">
                    <input
                      type="color"
                      className="h-8 w-full border border-noir-600 bg-noir-950 cursor-pointer"
                      value={flareSecGlow.hex}
                      onChange={(e) => setFlare({ secondaryColor: e.target.value })}
                    />
                  </Field>
                </div>
              </div>

              {/* Anamorphic Streak Controls */}
              <div className="space-y-2 border-t border-noir-700 pt-2">
                <div className="font-pulp text-[9px] uppercase tracking-wider text-cyan-neon">
                  🎬 Anamorphic Streak Beam
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label={`Beam Intensity: ${Math.round(flare.streakIntensity * 100)}%`}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      className="w-full accent-cyan-400"
                      value={Math.round(flare.streakIntensity * 100)}
                      onChange={(e) => setFlare({ streakIntensity: Number(e.target.value) / 100 })}
                    />
                  </Field>
                  <Field label={`Beam Thickness: ${flare.streakWidth.toFixed(1)}×`}>
                    <input
                      type="range"
                      min={0.2}
                      max={3.0}
                      step={0.1}
                      className="w-full accent-cyan-400"
                      value={flare.streakWidth}
                      onChange={(e) => setFlare({ streakWidth: Number(e.target.value) })}
                    />
                  </Field>
                </div>
                <Field label={`Streak Angle: ${flare.streakAngle}° (0° = horizontal)`}>
                  <input
                    type="range"
                    min={-45}
                    max={45}
                    step={1}
                    className="w-full accent-cyan-400"
                    value={flare.streakAngle}
                    onChange={(e) => setFlare({ streakAngle: Number(e.target.value) })}
                  />
                </Field>
              </div>

              {/* Optical Ghost Reflections */}
              <div className="space-y-2 border-t border-noir-700 pt-2">
                <div className="font-pulp text-[9px] uppercase tracking-wider text-cyan-neon">
                  🔮 Optical Ghost Reflections
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label={`Ghost Brightness: ${Math.round(flare.ghostIntensity * 100)}%`}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      className="w-full accent-cyan-400"
                      value={Math.round(flare.ghostIntensity * 100)}
                      onChange={(e) => setFlare({ ghostIntensity: Number(e.target.value) / 100 })}
                    />
                  </Field>
                  <Field label={`Axis Spread: ${flare.ghostSpread.toFixed(2)}×`}>
                    <input
                      type="range"
                      min={0.5}
                      max={2.0}
                      step={0.05}
                      className="w-full accent-cyan-400"
                      value={flare.ghostSpread}
                      onChange={(e) => setFlare({ ghostSpread: Number(e.target.value) })}
                    />
                  </Field>
                </div>

                <Field label="Ghost Reflection Detail">
                  <select
                    className={inputCls}
                    value={flare.ghostCount}
                    onChange={(e) => setFlare({ ghostCount: e.target.value as LensFlareGhostTier })}
                  >
                    <option value="subtle">Subtle — 4 key aperture rings & discs</option>
                    <option value="standard">Standard — 8 chromatic elements & rainbow halo</option>
                    <option value="rich">Rich — 12 multi-spectral cinema optical elements</option>
                  </select>
                </Field>
              </div>

              {/* Starburst Diffraction & Core Size */}
              <div className="space-y-2 border-t border-noir-700 pt-2">
                <div className="font-pulp text-[9px] uppercase tracking-wider text-cyan-neon">
                  ⭐ Starburst Diffraction & Core Halo
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label={`Starburst Intensity: ${Math.round(flare.starburstIntensity * 100)}%`}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      className="w-full accent-cyan-400"
                      value={Math.round(flare.starburstIntensity * 100)}
                      onChange={(e) => setFlare({ starburstIntensity: Number(e.target.value) / 100 })}
                    />
                  </Field>
                  <Field label="Starburst Rays">
                    <select
                      className={inputCls}
                      value={flare.starburstRays}
                      onChange={(e) => setFlare({ starburstRays: Number(e.target.value) })}
                    >
                      <option value={4}>4 Rays (Classic Cross)</option>
                      <option value={6}>6 Rays (Cinema Star)</option>
                      <option value={8}>8 Rays (Sunburst)</option>
                      <option value={12}>12 Rays (Fine Diffraction)</option>
                    </select>
                  </Field>
                </div>

                <Field label={`Core Glow & Corona Diameter: ${flare.coreSize}%`}>
                  <input
                    type="range"
                    min={15}
                    max={85}
                    step={1}
                    className="w-full accent-cyan-400"
                    value={flare.coreSize}
                    onChange={(e) => setFlare({ coreSize: Number(e.target.value) })}
                  />
                </Field>
              </div>

              {/* Dynamic Shimmer & Motion */}
              <div className="space-y-2 border-t border-noir-700 pt-2">
                <div className="font-pulp text-[9px] uppercase tracking-wider text-cyan-neon">
                  🌊 Dynamic Shimmer & Camera Reactivity
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label={`Shimmer Speed: ${flare.pulseSeconds.toFixed(1)}s`}>
                    <input
                      type="range"
                      min={0.5}
                      max={8.0}
                      step={0.1}
                      className="w-full accent-cyan-400"
                      value={flare.pulseSeconds}
                      onChange={(e) => setFlare({ pulseSeconds: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label={`Shimmer Depth: ${Math.round(flare.pulseAmount * 100)}%`}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      className="w-full accent-cyan-400"
                      value={Math.round(flare.pulseAmount * 100)}
                      onChange={(e) => setFlare({ pulseAmount: Number(e.target.value) / 100 })}
                    />
                  </Field>
                </div>

                <Field label={`Camera Parallax Reactivity: ${flare.reactivity.toFixed(1)}×`}>
                  <input
                    type="range"
                    min={0}
                    max={2.0}
                    step={0.1}
                    className="w-full accent-cyan-400"
                    value={flare.reactivity}
                    onChange={(e) => setFlare({ reactivity: Number(e.target.value) })}
                  />
                </Field>
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>

      {isActive && (
        <button
          onClick={() => onChange(undefined)}
          className="w-full border border-crimson/40 py-1 font-pulp text-[9px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
        >
          Reset all cinematic settings
        </button>
      )}
    </div>
  );
}
