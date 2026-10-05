import { SpriteAtlasControls } from "./SpriteAtlasControls";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { assetUrl } from "../assetPath";
import { uploadDataUrlAsset, useResolvedMedia } from "../data/mediaLibrary";
import { ImagePicker } from "./ImagePicker";
import {
  FORGE_SIZES,
  applyKey,
  evenFrameRuns,
  fileToImageData,
  keyStats,
  forgeSpriteSheet,
  despillEdges,
  frameRuns,
  spriteIslands,
  parseHex,
  sampleCorners,
  softnessForStrength,
  toHex,
  type ForgeKind,
} from "./spriteForge";
import { sheetCols, sheetFramePos, spriteSheetIssues, type SpriteSheet, type SpriteSheetAnimation } from "../game/spriteSheet";

/* ------------------------------------------------------------------ */
/*  SPRITE-SHEET EDITOR — shared by the stage walker, talking          */
/*  portraits, foreground extras and the Media tab's Sheet slicer.     */
/*  One image + frame grid + named animations, with a scrubbing        */
/*  preview so authors can find frame numbers without counting.        */
/* ------------------------------------------------------------------ */

const inputCls =
  "w-full border border-noir-600 bg-noir-950 px-2 py-1 text-xs text-paper focus:border-neon outline-none";

/** Keep preset animation recipes valid on short sheets (a one-frame upload
 * should still get useful idle/talk/loop animations rather than bad indices). */
const seq = (frames: number[], count: number) => frames.map((frame) => Math.min(Math.max(0, count - 1), frame));

/** Transparency checkerboard for the auto-build preview. */
const CHECKER = {
  backgroundImage:
    "linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
  backgroundColor: "#1a1a1f",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-[10px] uppercase tracking-wider text-paper/50">
      {label}
      <div className="mt-0.5 normal-case tracking-normal">{children}</div>
    </label>
  );
}

/** What a given use of a sheet expects, so the editor can seed sensible
 * defaults and suggest the animation names the engine actually looks up. */
export interface SheetPreset {
  frameWidth: number;
  frameHeight: number;
  /** animations seeded when the image is first picked */
  animations: Record<string, SpriteSheetAnimation>;
  /** names the engine looks up for this use — offered as quick-add buttons */
  suggested: string[];
}

export const WALKER_PRESET: SheetPreset = {
  frameWidth: 32,
  frameHeight: 48,
  animations: { idle: { frames: [0] }, walk: { frames: [0, 1, 2, 3], fps: 10 } },
  suggested: ["walk", "idle"],
};
export const TALKING_PRESET: SheetPreset = {
  frameWidth: 64,
  frameHeight: 64,
  animations: { rest: { frames: [0] }, talk: { frames: [0, 1], fps: 6 } },
  suggested: ["talk", "rest"],
};
export const EXTRA_PRESET: SheetPreset = {
  frameWidth: 64,
  frameHeight: 64,
  animations: { loop: { frames: [0, 1], fps: 8 } },
  suggested: ["loop"],
};

/** Which auto-build pipeline a preset maps to: decides frame height and the
 * animations the forge writes (talk+rest / walk+idle / loop). */
function presetForgeKind(preset: SheetPreset): ForgeKind {
  if (preset.suggested.includes("talk")) return "talking";
  if (preset.suggested.includes("walk")) return "walk";
  return "loop";
}

/* ------------------------------------------------------------------ */
/*  Preview: pick an animation, play it, or pause and scrub frames.    */
/* ------------------------------------------------------------------ */

export function SheetPreview({ sheet, storyId, height = 96 }: { sheet: SpriteSheet; storyId: string; height?: number }) {
  const media = useResolvedMedia(storyId);
  const url = assetUrl(media(sheet.image) ?? sheet.image);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const animNames = Object.keys(sheet.animations ?? {}).filter((n) => sheet.animations[n]?.frames?.length);
  const [animName, setAnimName] = useState(animNames[0] ?? "");
  const [playing, setPlaying] = useState(true);
  const [step, setStep] = useState(0);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setExpanded(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  const anim = sheet.animations?.[animNames.includes(animName) ? animName : animNames[0] ?? ""];

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setDims({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = url;
    return () => {
      cancelled = true;
    };
  }, [url]);

  const frameKey = anim?.frames.join(",");
  useEffect(() => setStep(0), [animName, frameKey]);
  useEffect(() => {
    if (!playing || !anim || anim.frames.length < 2) return;
    const fps = anim.fps && anim.fps > 0 ? anim.fps : 8;
    // LOOP FIDELITY: a `loop: false` animation holds its last frame (exactly
    // what sheetFrameAt does in play) instead of wrapping back to frame 1 —
    // the preview must not promise an animation the game will never run.
    const id = window.setInterval(
      () => setStep((s) => (anim.loop === false ? Math.min(s + 1, anim.frames.length - 1) : (s + 1) % anim.frames.length)),
      Math.max(30, 1000 / fps),
    );
    return () => window.clearInterval(id);
  }, [playing, anim, animName]);

  if (!url || !dims || !anim) return <p className="font-type text-[9px] italic text-paper/35">Pick an image and add an animation to preview.</p>;

  const cols = sheetCols(sheet, dims.w);
  const rows = Math.max(1, Math.floor(dims.h / Math.max(1, sheet.frameHeight)));
  const idx = Math.min(step, anim.frames.length - 1);
  // CLAMP exactly as SheetSprite does in play. Without this the preview paints
  // a phantom row (blank) for an over-range frame while the game clamps and
  // shows the last real frame — the preview would be lying about the bug.
  const maxFrame = Math.max(0, cols * rows - 1);
  const rawFrame = anim.frames[idx] ?? 0;
  const frame = Math.min(rawFrame, maxFrame);
  const overRange = rawFrame > maxFrame;
  const { col, row } = sheetFramePos(frame, cols);
  const previewHeight = expanded ? Math.min(420, Math.max(220, Math.round(window.innerHeight * 0.52))) : height;
  const scale = previewHeight / Math.max(1, sheet.frameHeight);

  return (
    <div className={expanded ? "fixed inset-4 z-[100] m-auto max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] overflow-auto border border-gold/60 bg-noir-900 p-4 shadow-[0_0_0_9999px_rgba(3,5,12,.88),0_0_40px_rgba(232,178,60,.35)]" : "space-y-1"}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">🎞 Frame player · {animName || "no animation"}</span>
        <button type="button" onClick={() => setExpanded((v) => !v)} className="border border-gold/60 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-gold hover:bg-gold/15">
          {expanded ? "✕ close" : "⛶ full screen"}
        </button>
      </div>
      <div className="flex items-end gap-2">
        <div
          className="shrink-0 border border-noir-600 bg-noir-950/60"
          style={{
            width: Math.max(8, sheet.frameWidth * scale),
            height: previewHeight,
            backgroundImage: `url(${url})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${dims.w * scale}px ${dims.h * scale}px`,
            backgroundPosition: `-${col * sheet.frameWidth * scale}px -${row * sheet.frameHeight * scale}px`,
            imageRendering: sheet.pixelated ? "pixelated" : undefined,
          }}
          aria-hidden
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1">
            <select className={`${inputCls} !w-auto`} value={animNames.includes(animName) ? animName : animNames[0]} onChange={(e) => setAnimName(e.target.value)}>
              {animNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <button
              onClick={() => {
                // Pressing play on a held non-looping animation restarts it
                // from frame 1 (a player that can't replay is a broken player).
                if (!playing && anim && anim.loop === false && step >= anim.frames.length - 1) setStep(0);
                setPlaying((p) => !p);
              }}
              className="border border-noir-600 px-2 py-1 text-[10px] uppercase tracking-wider text-paper/70 hover:border-neon hover:text-neon"
            >
              {playing ? "⏸ pause" : "▶ play"}
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, anim.frames.length - 1)}
            value={idx}
            onChange={(e) => {
              setPlaying(false);
              setStep(parseInt(e.target.value, 10) || 0);
            }}
            className="w-full accent-amber-400"
          />
          <p className="font-type text-[9px] text-paper/45">
            frame{" "}
            {overRange ? (
              <span className="text-crimson" title={`This animation asks for frame ${rawFrame}, but the sheet only has ${cols * rows} (0–${maxFrame}).`}>
                {rawFrame} ⚠ → {frame}
              </span>
            ) : (
              <span className="text-amber-300">{frame}</span>
            )}{" "}
            (step {idx + 1}/{anim.frames.length}) · grid {cols}×{rows} · image {dims.w}×{dims.h}px
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Controls: the full editor for one SpriteSheet value.               */
/* ------------------------------------------------------------------ */

export function SpriteSheetControls({
  value,
  onChange,
  storyId,
  preset,
  pickerLabel = "Sheet image (clear to remove)",
}: {
  value?: SpriteSheet;
  onChange: (v: SpriteSheet | undefined) => void;
  storyId: string;
  preset: SheetPreset;
  pickerLabel?: string;
}) {
  const patch = (p: Partial<SpriteSheet>) => value && onChange({ ...value, ...p });
  const setAnim = (name: string, anim: SpriteSheetAnimation | undefined) => {
    if (!value) return;
    const animations = { ...value.animations };
    if (anim) animations[name] = anim;
    else delete animations[name];
    onChange({ ...value, animations });
  };
  const renameAnim = (from: string, to: string) => {
    if (!value || !to || from === to || value.animations[to]) return;
    const animations: Record<string, SpriteSheetAnimation> = {};
    for (const [k, v] of Object.entries(value.animations)) animations[k === from ? to : k] = v;
    onChange({ ...value, animations });
  };
  const parseFrames = (csv: string) =>
    csv.split(/[,\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isInteger(n) && n >= 0);

  const missingSuggested = value ? preset.suggested.filter((n) => !value.animations[n]) : [];

  /* How many frames the sheet image ACTUALLY holds (cols × rows from its
   * natural size) — the truth animation presets adapt to. A 1-frame upload
   * must get frame 0 in every generated animation, not indices that only
   * exist on a longer strip; a 5-frame sheet gets its full range even when
   * the seeded animations only mention frames 0 and 1. Until the image has
   * decoded (or when it fails to), fall back to the authored frame lists. */
  const media = useResolvedMedia(storyId);
  const [sheetDims, setSheetDims] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    if (!value?.image || value.image.startsWith("gradient:")) {
      setSheetDims(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled && img.naturalWidth && img.naturalHeight) setSheetDims({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = assetUrl(media(value.image) ?? value.image);
    return () => {
      cancelled = true;
    };
  }, [value?.image, media]);
  const gridFrameCount = useMemo(() => {
    if (!value || !sheetDims) return null;
    const cols = sheetCols(value, sheetDims.w);
    const rows = Math.max(1, Math.floor(sheetDims.h / Math.max(1, value.frameHeight)));
    return Math.max(1, cols * rows);
  }, [value, sheetDims]);

  const issues = useMemo(
    () => (value ? spriteSheetIssues(value, "sheet", preset.suggested, gridFrameCount ?? undefined) : []),
    [value, preset, gridFrameCount],
  );

  // ⚡ Auto-build from an upload — now a LOOK-BEFORE-YOU-APPLY flow: pick the
  // file FIRST, then tune the backdrop-removal strength on a live preview
  // (slider, not gentle/normal/strong presets), see how many sprites the
  // gap-detector found, override the count when it's wrong (two figures
  // touching merge into one run), and only then build + save the sheet.
  const [forging, setForging] = useState(false);
  const [forgeMsg, setForgeMsg] = useState<string | null>(null);
  const [outSize, setOutSize] = useState("standard");
  /** The uploaded art, decoded once — every slider tick re-keys THESE pixels. */
  const [draft, setDraft] = useState<{ data: ImageData; url: string; name: string } | null>(null);
  const [draftImg, setDraftImg] = useState<HTMLImageElement | null>(null);
  /** Backdrop removal strength = colour-distance tolerance, 5–160 (~gentle…strong). */
  const [strength, setStrength] = useState(60);
  const [keyHex, setKeyHex] = useState("#ffffff");
  /** Sprite count: starts at the auto-detected number; editing it switches
   *  the slicer to even bands and shows them on the preview before applying. */
  const [frames, setFrames] = useState(1);
  const [detected, setDetected] = useState(0);
  const [countTouched, setCountTouched] = useState(false);
  const [compare, setCompare] = useState(false);
  const [loading, setLoading] = useState(false);
  /** Frame bands currently drawn on the preview — drives the build button's
   *  count label and disables building when nothing survived the key. */
  const [previewCount, setPreviewCount] = useState(0);
  const [despill, setDespill] = useState(false);
  const [preserveScale, setPreserveScale] = useState(false);
  const [flatKey, setFlatKey] = useState(false);
  const [islands, setIslands] = useState(false);
  /** Live "did the backdrop actually come off?" readout for the preview. */
  const [keyDiag, setKeyDiag] = useState<{ removedPct: number; edgeSpread: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const forgeCanvasRef = useRef<HTMLCanvasElement>(null);
  const forgeKind = presetForgeKind(preset);

  const clearDraft = () => {
    setDraft(null);
    setDraftImg(null);
    setCompare(false);
    setCountTouched(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /** Upload lands here: decode, auto-key from the corners, count sprites. */
  const pickFile = async (file: File) => {
    setLoading(true);
    setForgeMsg(null);
    try {
      const { data, url } = await fileToImageData(file);
      setDraft({ data, url, name: file.name.replace(/\.[a-z0-9]+$/i, "") || "sheet" });
      const sampled = toHex(sampleCorners(data.data, data.width, data.height));
      setKeyHex(sampled);
      setStrength(60);
      const keyed = applyKey(data, parseHex(sampled), 60, softnessForStrength(60));
      const runs = forgeKind === "single" ? [[0, data.width]] : frameRuns(keyed);
      setDetected(runs.length);
      setFrames(Math.max(1, runs.length));
      setCountTouched(false);
    } catch (err) {
      setForgeMsg(`⚠ ${err instanceof Error ? err.message : "couldn't load that image"}`);
    } finally {
      setLoading(false);
    }
  };

  /* Keep a decoded <img> for the "show original" compare pass. */
  useEffect(() => {
    if (!draft?.url) {
      setDraftImg(null);
      return;
    }
    const img = new Image();
    img.onload = () => setDraftImg(img);
    img.src = draft.url;
  }, [draft?.url]);

  /* Re-key + redraw the preview whenever a knob moves, WITH the frame bands
   * drawn on top — the author sees exactly where the sheet will be sliced. */
  const renderForgePreview = useCallback(() => {
    const canvas = forgeCanvasRef.current;
    if (!draft || !canvas) return;
    const key = parseHex(keyHex);
    const soft = softnessForStrength(strength);
    const keyed = applyKey(draft.data, key, strength, soft, flatKey ? "flat" : "chroma");
    if (despill) keyed.data.set(despillEdges(keyed.data, keyed.width, keyed.height, key));
    const separated = islands && forgeKind !== "single" ? spriteIslands(keyed, countTouched ? frames : undefined) : null;
    const runs: Array<[number, number]> = separated ? separated.map(f => [f.x, f.x + f.w]) : countTouched
      ? evenFrameRuns(keyed, frames)
      : forgeKind === "single"
        ? [[0, draft.data.width]]
        : frameRuns(keyed);
    setPreviewCount((c) => (c === runs.length ? c : runs.length));
    if (!countTouched) { setDetected(runs.length); setFrames(Math.max(1, runs.length)); }
    const st = keyStats(draft.data, keyed, key);
    setKeyDiag((prev) =>
      prev && Math.abs(prev.removedPct - st.removedPct) < 0.05 ? prev : { removedPct: st.removedPct, edgeSpread: st.edgeSpread },
    );

    const maxW = 520;
    const scale = Math.min(1, maxW / draft.data.width);
    canvas.width = Math.max(1, Math.round(draft.data.width * scale));
    canvas.height = Math.max(1, Math.round(draft.data.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (compare && draftImg) {
      ctx.drawImage(draftImg, 0, 0, canvas.width, canvas.height);
    } else {
      const stage = document.createElement("canvas");
      stage.width = draft.data.width;
      stage.height = draft.data.height;
      stage.getContext("2d")?.putImageData(keyed, 0, 0);
      if (separated) {
        // Paint exactly the retained silhouette pixels, not neighbouring
        // fragments/border noise the actual build discards.
        const clean = stage.getContext("2d")!; clean.clearRect(0, 0, stage.width, stage.height);
        for (const f of separated) {
          const piece = document.createElement("canvas"); piece.width = f.w; piece.height = f.h;
          piece.getContext("2d")!.putImageData(new ImageData(f.data, f.w, f.h), 0, 0);
          clean.drawImage(piece, f.x, f.y);
        }
      }
      ctx.drawImage(stage, 0, 0, canvas.width, canvas.height);
    }
    // Slice guides: band fill + boundaries + the frame number each band
    // becomes. Skipped in compare mode (guides still drawn — they frame the
    // original too, so the author can check the spacing against the art).
    ctx.font = `bold ${Math.max(11, Math.round(14 * scale))}px sans-serif`;
    ctx.textBaseline = "top";
    runs.forEach(([x0, x1], i) => {
      const sx0 = x0 * scale;
      const sx1 = x1 * scale;
      ctx.fillStyle = "rgba(52, 211, 153, 0.10)";
      ctx.fillRect(sx0, 0, sx1 - sx0, canvas.height);
      ctx.strokeStyle = "rgba(52, 211, 153, 0.85)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx0 + 0.5, 0);
      ctx.lineTo(sx0 + 0.5, canvas.height);
      ctx.moveTo(sx1 - 0.5, 0);
      ctx.lineTo(sx1 - 0.5, canvas.height);
      ctx.stroke();
      const tag = `${i + 1}`;
      const tw = ctx.measureText(tag).width;
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillRect(sx0 + 3, 3, tw + 6, 16);
      ctx.fillStyle = "#fbbf24";
      ctx.fillText(tag, sx0 + 6, 5);
    });
  }, [draft, keyHex, strength, frames, countTouched, compare, draftImg, forgeKind, despill, flatKey, islands]);

  useEffect(() => {
    renderForgePreview();
  }, [renderForgePreview]);

  /** The slice the build will actually use — even bands only when the author
   *  overrode the auto-detected count. */
  const buildWithForcedCount = forgeKind !== "single" && countTouched && frames > 0;

  const build = async () => {
    if (!draft) return;
    setForging(true);
    setForgeMsg(null);
    try {
      const size = FORGE_SIZES.find((s) => s.id === outSize) ?? FORGE_SIZES[0];
      const sheet = await forgeSpriteSheet(draft.url, forgeKind, {
        // Build with the SAME key the author tuned on the preview above —
        // without this the forge re-sampled the corners and could cut
        // differently from what was previewed.
        preserveScale,
        despill,
        keyMode: flatKey ? "flat" : "chroma",
        islands,
        key: parseHex(keyHex),
        tolerance: strength,
        softness: softnessForStrength(strength),
        ...(size.height ? { targetHeight: size.height } : {}),
        ...(buildWithForcedCount ? { frameCount: frames } : {}),
      });
      const up = await uploadDataUrlAsset(storyId, `sheet-${draft.name}.png`, "image", sheet.dataUrl, "sprites");
      onChange({
        image: up.success && up.assetId ? `asset:${up.assetId}` : sheet.dataUrl,
        frameWidth: sheet.frameWidth,
        frameHeight: sheet.frameHeight,
        animations: sheet.animations,
        pixelated: false,
      });
      setForgeMsg(
        `✓ ${sheet.frameCount} frame${sheet.frameCount === 1 ? "" : "s"} · ${sheet.frameWidth} × ${sheet.frameHeight} each — ${up.success ? "sheet saved to the library and filled in below." : `kept inline, NOT saved to library: ${up.error ?? "storage unavailable"}. Adjust Media storage limits to save it.`}`
      );
      clearDraft();
    } catch (err) {
      setForgeMsg(`⚠ ${err instanceof Error ? err.message : "auto-build failed"}`);
    } finally {
      setForging(false);
    }
  };

  return (
    <div className="space-y-1">
      {/* One-click path: upload art on a flat backdrop and everything below
          fills itself in. A single figure works too (you get a clean 1-frame
          cutout sheet). */}
      <div className="space-y-1 border border-amber-400/25 bg-amber-400/5 p-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <label className={`cursor-pointer border border-amber-400/50 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-amber-300 hover:bg-amber-400/10 ${forging || loading ? "opacity-50" : ""}`}>
            {loading ? "⏳ reading image…" : forging ? "⚙ building…" : draft ? "⇪ swap image…" : "⚡ Upload art → auto-build sheet"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={forging || loading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void pickFile(f);
                e.target.value = "";
              }}
            />
          </label>
          <span className="font-type text-[8px] leading-snug text-paper/45">
            Frames side by side on ONE flat backdrop colour (magenta, green — anything flat). Nothing is applied yet:
            upload first, tune the removal and sprite count on the preview, then build. A single figure gives a
            1-frame cutout.
          </span>
        </div>

        {draft && (
          <div className="space-y-1.5 border-t border-amber-400/20 pt-1.5">
            {/* strength + key — tuned AFTER upload, against the live preview */}
            <div className="flex flex-wrap items-center gap-3 font-type text-[9px] text-paper/60">
              <label className="flex items-center gap-1.5" title="Colour distance treated as backdrop. Slide left if the key eats into the art, right if backdrop specks survive.">
                backdrop removal strength
                <input
                  type="range"
                  min={5}
                  max={160}
                  step={1}
                  value={strength}
                  onChange={(e) => setStrength(Number(e.target.value))}
                  className="w-36 accent-amber-400"
                />
                <span className="w-8 text-right tabular-nums">{strength}</span>
                <span className="text-paper/35">← gentle · strong →</span>
              </label>
              <label className="flex items-center gap-1">
                key
                <input
                  type="color"
                  value={keyHex}
                  onChange={(e) => setKeyHex(e.target.value)}
                  className="h-5 w-8 cursor-pointer border border-noir-600 bg-transparent"
                />
              </label>
              <button
                onClick={() => setKeyHex(toHex(sampleCorners(draft.data.data, draft.data.width, draft.data.height)))}
                title="Re-sample the backdrop colour from the image corners"
                className="border border-noir-600 px-1.5 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/60 hover:border-amber-300/60 hover:text-amber-300"
              >
                ⟲ auto
              </button>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
                show original
              </label>
            </div>

            {/* sprite count — auto-detected, overridable */}
            {forgeKind !== "single" && (
              <div className="flex flex-wrap items-center gap-2 font-type text-[9px] text-paper/60">
                <label className="flex items-center gap-1.5" title="Sprites the slicer will cut. Starts at the auto-detected number — edit it when the detector merges or splits frames; the preview switches to even bands so you can check the spacing.">
                  sprites
                  <input
                    type="number"
                    min={1}
                    max={32}
                    className="w-14 border border-noir-600 bg-noir-950 px-1 py-0.5 text-[9px] text-paper/80"
                    value={frames}
                    onChange={(e) => {
                      setCountTouched(true);
                      setFrames(Math.max(1, Math.min(32, parseInt(e.target.value, 10) || 1)));
                    }}
                  />
                </label>
                <span className="text-paper/40">
                  auto-detected {detected}.
                  {countTouched && frames !== detected
                    ? ` ${islands ? "Separating" : "Slicing evenly into"} ${frames} — check the guide lines below.`
                    : " Wrong count (e.g. two figures touching count as one)? Type the real number."}
                </span>
                {countTouched && (
                  <button
                    onClick={() => {
                      setCountTouched(false);
                      setFrames(Math.max(1, detected));
                    }}
                    className="border border-noir-600 px-1.5 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/60 hover:border-amber-300/60 hover:text-amber-300"
                  >
                    ⟲ use detected
                  </button>
                )}
              </div>
            )}

            {islands && previewCount === 0 && <p role="status" className="font-type text-[10px] text-amber-300">No matching silhouette count. Check the key/count; touching figures need manual editing, not forced cuts.</p>}
            {keyDiag && !compare && (
              <div
                className={`border px-2 py-1 font-type text-[9px] leading-snug ${
                  keyDiag.removedPct < 1
                    ? "border-crimson/50 bg-crimson/10 text-crimson"
                    : keyDiag.removedPct > 97
                      ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
                      : "border-emerald-400/40 bg-emerald-400/5 text-emerald-300"
                }`}
              >
                {keyDiag.removedPct < 1 ? (
                  <>
                    <b>The backdrop didn't come off.</b> The key colour doesn't match this art
                    {keyDiag.edgeSpread > 60 ? " — and the backdrop isn't one flat colour" : ""}. Press <b>⟲ auto</b>,
                    set the key swatch to the real backdrop colour, or raise the strength slider.
                  </>
                ) : keyDiag.removedPct > 97 ? (
                  <>
                    <b>Strength is eating the sprites.</b> Almost every pixel was removed — slide the strength down.
                  </>
                ) : (
                  <>✓ backdrop removed ({keyDiag.removedPct.toFixed(0)}% of the image)</>
                )}
              </div>
            )}

            <div className="inline-block max-w-full border border-noir-600" style={CHECKER}>
              <canvas ref={forgeCanvasRef} className="block max-w-full" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1 font-type text-[8px] text-paper/55">
                output size:
                <select
                  className="border border-noir-600 bg-noir-950 px-1 py-0.5 text-[9px] text-paper/80"
                  title="Frame height of the built sheet. A CAP, not a stretch: big art keeps its pixels up to it, small art is never upscaled into blur. Standard matches the classic presets (light story files)."
                  value={outSize}
                  onChange={(e) => setOutSize(e.target.value)}
                >
                  {FORGE_SIZES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-1 font-type text-[9px] text-paper/70" title="RGB distance instead of shadow-tolerant chroma. Preserves dark props on genuinely flat plates; shadowed backdrops may remain.">
                <input type="checkbox" checked={flatKey} onChange={e => setFlatKey(e.target.checked)} />
                Flat key / retain dark props
              </label>
              {forgeKind !== "single" && <label className="flex items-center gap-1 font-type text-[9px] text-paper/70" title="Separate disconnected silhouettes instead of vertical strips. Keeps overlapping-in-x boots/props with their own actor. Cannot reconstruct touching figures.">
                <input type="checkbox" checked={islands} onChange={e => setIslands(e.target.checked)} />
                Separate sprite islands
              </label>}
              <label className="flex items-center gap-1 font-type text-[9px] text-paper/70">
                <input type="checkbox" checked={preserveScale} onChange={e => setPreserveScale(e.target.checked)} />
                Preserve pose scale / align feet
              </label>
              <label className="flex items-center gap-1 font-type text-[9px] text-paper/70">
                <input type="checkbox" checked={despill} onChange={e => setDespill(e.target.checked)} />
                Reduce edge colour spill
              </label>
              <button
                onClick={build}
                disabled={forging || previewCount === 0}
                title="Key the backdrop, slice the frames as previewed, save the sheet to the library and fill this editor in"
                className="border border-amber-400/50 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-amber-300 hover:bg-amber-400/10 disabled:opacity-40"
              >
                {forging ? "⚙ building…" : `✓ build sheet (${previewCount || "?"} sprite${previewCount === 1 ? "" : "s"})`}
              </button>
              <button
                onClick={clearDraft}
                className="border border-noir-600 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-paper/60 hover:border-crimson/60 hover:text-crimson"
              >
                ✕ cancel
              </button>
              <span className="font-type text-[8px] text-paper/35">Big art? Pick big / source to keep detail (4MB/image cap). Full manual control: Media Tools ▸ ✂ Sprite Cutout Lab.</span>
            </div>
          </div>
        )}

        {forgeMsg && <p className="font-type text-[9px] text-paper/60">{forgeMsg}</p>}
      </div>
      <Field label={pickerLabel}>
        <ImagePicker
          value={value?.image}
          storyId={storyId}
          includeGradients={false}
          preferFolder="sprites"
          onChange={(v) =>
            v
              ? onChange({
                  frameWidth: preset.frameWidth,
                  frameHeight: preset.frameHeight,
                  animations: preset.animations,
                  ...(value ?? {}),
                  image: v,
                })
              : onChange(undefined)
          }
          placeholder="Pick the sprite sheet…"
        />
      </Field>
      {value && (
        <>
          <div className="grid grid-cols-3 gap-1">
            <Field label="Frame width (px)">
              <input
                type="number" min={1} className={inputCls} value={value.frameWidth}
                onChange={(e) => patch({ frameWidth: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              />
            </Field>
            <Field label="Frame height (px)">
              <input
                type="number" min={1} className={inputCls} value={value.frameHeight}
                onChange={(e) => patch({ frameHeight: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              />
            </Field>
            <label className="flex items-end gap-1 pb-1 text-[10px] uppercase tracking-wider text-paper/60">
              <input type="checkbox" checked={!!value.pixelated} onChange={(e) => patch({ pixelated: e.target.checked || undefined })} />
              Pixel art
            </label>
          </div>

          {Object.entries(value.animations).map(([name, anim]) => (
            <div key={name} className="grid grid-cols-[5rem_1fr_3.2rem_2.4rem_1.2rem] items-end gap-1">
              <Field label="Name">
                <input className={inputCls} defaultValue={name} onBlur={(e) => renameAnim(name, e.target.value.trim())} />
              </Field>
              <Field label="Frames (e.g. 0, 1, 2)">
                <input
                  className={inputCls}
                  defaultValue={anim.frames.join(", ")}
                  onBlur={(e) => {
                    const frames = parseFrames(e.target.value);
                    setAnim(name, frames.length ? { ...anim, frames } : undefined);
                  }}
                />
              </Field>
              <Field label="fps">
                <input
                  type="number" min={1} max={60} className={inputCls} value={anim.fps ?? 8}
                  onChange={(e) => setAnim(name, { ...anim, fps: Math.max(1, parseInt(e.target.value, 10) || 8) })}
                />
              </Field>
              <label className="flex flex-col items-center gap-0.5 pb-1 text-[8px] uppercase tracking-wider text-paper/50">
                loop
                <input type="checkbox" checked={anim.loop !== false} onChange={(e) => setAnim(name, { ...anim, loop: e.target.checked ? undefined : false })} />
              </label>
              <button
                onClick={() => setAnim(name, undefined)}
                className="pb-1 text-[10px] text-crimson hover:underline"
                title={`remove "${name}"`}
              >
                ✕
              </button>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-1">
            {missingSuggested.map((n) => (
              <button
                key={n}
                onClick={() => setAnim(n, { frames: [0] })}
                className="border border-noir-600 px-2 py-0.5 text-[9px] uppercase tracking-wider text-paper/60 hover:border-neon hover:text-neon"
              >
                + "{n}"
              </button>
            ))}
            <button
              onClick={() => {
                let i = 1;
                while (value.animations[`anim${i}`]) i++;
                setAnim(`anim${i}`, { frames: [0] });
              }}
              className="border border-noir-600 px-2 py-0.5 text-[9px] uppercase tracking-wider text-paper/60 hover:border-neon hover:text-neon"
            >
              + animation
            </button>
          </div>

          <div className="space-y-1 border-t border-noir-700/60 pt-1">
            <div className="flex flex-wrap items-center gap-1">
              <span className="mr-1 font-pulp text-[8px] uppercase tracking-widest text-paper/40">animation presets</span>
              <span className="font-type text-[8px] text-paper/35">creates the named animations below</span>
            </div>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
              {[
                { id: "prop", label: "✨ Prop loop", hint: "loop · flicker · hold", make: (n: number) => ({ loop: { frames: seq([0, 1, 2], n), fps: 8 }, flicker: { frames: seq([0, 1, 0, 2], n), fps: 12 }, hold: { frames: [0], fps: 1, loop: false } }) },
                { id: "character", label: "🕵 Character", hint: "idle · walk · talk", make: (n: number) => ({ idle: { frames: [0], fps: 1 }, walk: { frames: seq([0, 1, 2, 3], n), fps: 10 }, talk: { frames: seq([0, 1, 2, 1], n), fps: 7 }, rest: { frames: [0], fps: 1, loop: false } }) },
                { id: "talking", label: "💬 Talking", hint: "rest · talk", make: (n: number) => ({ rest: { frames: [0], fps: 1 }, talk: { frames: seq([0, 1, 2, 1], n), fps: 7 } }) },
                { id: "pingpong", label: "↔ Ping-pong", hint: "loop · reverse", make: (n: number) => ({ loop: { frames: seq([0, 1, 2, 3, 2, 1], n), fps: 8 }, reverse: { frames: seq([3, 2, 1, 0], n), fps: 8 } }) },
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    // Adapt to the REAL grid when the image has decoded
                    // (cols×rows); otherwise to the authored frame lists.
                    const maxFrame = Math.max(1, ...Object.values(value.animations).flatMap((a) => a.frames));
                    const generated = preset.make(Math.max(1, gridFrameCount ?? maxFrame + 1));
                    onChange({ ...value, animations: { ...value.animations, ...generated } });
                  }}
                  className="border border-noir-600 px-1.5 py-1 text-left hover:border-cyan-neon hover:bg-cyan-neon/10"
                  title={`Create ${preset.hint} animations (existing animations with these names are replaced)`}
                >
                  <span className="block font-pulp text-[8px] uppercase tracking-wider text-paper/75">{preset.label}</span>
                  <span className="block font-type text-[8px] text-paper/40">{preset.hint}</span>
                </button>
              ))}
            </div>
            <p className="font-type text-[8px] text-paper/35">Presets adapt frame numbers to the sheet and replace only matching animation names; custom animations stay intact.</p>
          </div>

          {issues.length > 0 && (
            <ul className="space-y-0.5">
              {issues.map((msg, i) => (
                <li key={i} className="font-type text-[9px] text-amber-400/80">⚠ {msg}</li>
              ))}
            </ul>
          )}

          <SpriteAtlasControls value={value} onChange={onChange} storyId={storyId} />
          <SheetPreview sheet={value} storyId={storyId} />
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Media tab: the standalone Sheet slicer / lab.                      */
/* ------------------------------------------------------------------ */

export function SheetLab({ storyId }: { storyId: string }) {
  const [sheet, setSheet] = useState<SpriteSheet | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-3 space-y-1 border border-cyan-neon/30 bg-cyan-neon/5 p-2">
      <div className="font-pulp text-[10px] uppercase tracking-widest text-cyan-neon">🎞 Sheet slicer</div>
      <p className="font-type text-[9px] leading-snug text-paper/45">
        Work out a sprite sheet's grid here: pick the image, set the frame size, scrub the preview to find frame
        numbers, and name the animations. Then use the same settings where the sheet lives — a stage walker
        (Scene tab → 🚶 Walkable Stage), a talking portrait (Characters tab), or an animated foreground extra
        (🎬 Cinematics) — or copy the JSON below into a draft.
      </p>
      <SpriteSheetControls value={sheet} onChange={setSheet} storyId={storyId} preset={EXTRA_PRESET} pickerLabel="Sheet image" />
      {sheet && (
        <button
          onClick={() => {
            navigator.clipboard?.writeText(JSON.stringify(sheet, null, 2)).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            });
          }}
          className="border border-noir-600 px-2 py-1 text-[9px] uppercase tracking-wider text-paper/60 hover:border-neon hover:text-neon"
        >
          {copied ? "✓ copied" : "⧉ copy sheet JSON"}
        </button>
      )}
    </div>
  );
}
