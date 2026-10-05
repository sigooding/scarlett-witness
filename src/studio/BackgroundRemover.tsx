import { useCallback, useEffect, useRef, useState } from "react";
import { resolveAssetReference, uploadDataUrlAsset } from "../data/mediaLibrary";
import { ImagePicker } from "./ImagePicker";
import { applyEdgeFloodKey, applyKey, contentBounds, despeckle, keyStats, parseHex, sampleEdges, sampleCorners, toHex } from "./spriteForge";

/* ------------------------------------------------------------------ */
/*  Media Tools tab: Background Remover.                               */
/*                                                                     */
/*  Drop ANY image — a photo, a scan, an AI render, an existing        */
/*  sprite sheet — and get a transparent PNG back. No sprite-sheet     */
/*  workflow required: there is no grid to set, no frames to count,    */
/*  nothing to slice. Two strategies:                                  */
/*                                                                     */
/*    · EDGE FLOOD (default) — the magic wand. Floods inward from the  */
/*      border and removes only the backdrop CONNECTED to it, so a     */
/*      white shirt survives against a white wall.                     */
/*    · COLOUR KEY — the classic chroma key. Removes every pixel near  */
/*      the picked colour, which is what you want for flat-backdrop    */
/*      art (magenta/green-screen plates).                             */
/*                                                                     */
/*  The result saves straight into the media library (📁 cutouts) and  */
/*  is immediately pickable from every image dropdown.                 */
/* ------------------------------------------------------------------ */

type Mode = "flood" | "color";

const CHECKER = {
  backgroundImage:
    "linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
  backgroundColor: "#1a1a1f",
};

/** Read a File → ImageData, keeping the original pixels around so every
 *  slider move re-keys the source instead of re-encoding a previous pass. */
async function fileToImageData(file: File): Promise<{ data: ImageData; url: string }> {
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("couldn't read that file"));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("that file isn't an image this browser can read"));
    el.src = url;
  });
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(img, 0, 0);
  return { data: ctx.getImageData(0, 0, c.width, c.height), url };
}

export function BackgroundRemover({ storyId }: { storyId: string }) {
  const [source, setSource] = useState<ImageData | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState<Mode>("flood");
  const [keyHex, setKeyHex] = useState("#ffffff");
  const [autoKey, setAutoKey] = useState(true);
  const [tolerance, setTolerance] = useState(48);
  const [softness, setSoftness] = useState(28);
  const [trim, setTrim] = useState(true);
  const [clean, setClean] = useState(true);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [compare, setCompare] = useState(false);
  const [libRef, setLibRef] = useState<string | undefined>(undefined);
  /** Live "did this actually work?" readout, recomputed on every render pass. */
  const [diag, setDiag] = useState<{ removedPct: number; edgeSpread: number } | null>(null);
  /** The decoded source image — decoded once, then reused by the "show
   *  original" compare view (drawImage on a still-loading <img> paints
   *  nothing, so the element is kept rather than rebuilt per render). */
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Load an image the author dropped, picked from disk, or pasted. */
  const loadFile = useCallback(async (file: File) => {
    setLoading(true);
    setStatus(null);
    try {
      const { data, url } = await fileToImageData(file);
      setSource(data);
      setSourceUrl(url);
      setFileName(file.name.replace(/\.[^.]+$/, ""));
      setName(`${file.name.replace(/\.[^.]+$/, "")} (cutout)`);
      setLibRef(undefined);
      if (autoKey) setKeyHex(toHex(sampleEdges(data.data, data.width, data.height)));
    } catch (err) {
      setStatus(`⚠ ${err instanceof Error ? err.message : "couldn't load that image"}`);
    } finally {
      setLoading(false);
    }
  }, [autoKey]);

  /** Load an image that already lives in the media library. */
  useEffect(() => {
    if (!libRef) return;
    let alive = true;
    setLoading(true);
    resolveAssetReference(libRef)
      .then(async (url) => {
        if (!alive || !url) return;
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.crossOrigin = "anonymous";
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error("image failed to load"));
          el.src = url;
        });
        if (!alive) return;
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        try {
          const data = ctx.getImageData(0, 0, c.width, c.height);
          setSource(data);
          setSourceUrl(url);
          setFileName(libRef.startsWith("asset:") ? "library image" : (libRef.split("/").pop() ?? "image"));
          setName("cutout");
          if (autoKey) setKeyHex(toHex(sampleEdges(data.data, data.width, data.height)));
        } catch {
          setStatus("⚠ couldn't read that image's pixels (cross-origin image?)");
        }
      })
      .catch(() => alive && setStatus("⚠ couldn't resolve that library image"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libRef]);

  /* Decode once per source so the compare view can paint it immediately. */
  useEffect(() => {
    if (!sourceUrl) {
      setSourceImg(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setSourceImg(img);
    img.src = sourceUrl;
  }, [sourceUrl]);

  /* Re-key the source whenever any setting changes. */
  const render = useCallback(() => {
    const src = source;
    const canvas = canvasRef.current;
    if (!src || !canvas) return;
    const key = parseHex(keyHex);
    let keyed = mode === "flood" ? applyEdgeFloodKey(src, key, tolerance, softness) : applyKey(src, key, tolerance, softness);
    if (clean) keyed = despeckle(keyed);
    const stats = keyStats(src, keyed, key);
    setDiag((prev) =>
      prev && Math.abs(prev.removedPct - stats.removedPct) < 0.05 && Math.abs(prev.edgeSpread - stats.edgeSpread) < 0.5
        ? prev
        : { removedPct: stats.removedPct, edgeSpread: stats.edgeSpread },
    );
    const bounds = trim ? contentBounds(keyed) : null;
    const bx = bounds ?? { x: 0, y: 0, w: src.width, h: src.height };

    const out = document.createElement("canvas");
    out.width = bx.w;
    out.height = bx.h;
    const octx = out.getContext("2d");
    if (!octx) return;
    const stage = document.createElement("canvas");
    stage.width = src.width;
    stage.height = src.height;
    stage.getContext("2d")?.putImageData(keyed, 0, 0);
    octx.drawImage(stage, bx.x, bx.y, bx.w, bx.h, 0, 0, bx.w, bx.h);
    outputRef.current = out;

    const maxW = 520;
    const scale = Math.min(1, maxW / bx.w);
    canvas.width = Math.max(1, Math.round(bx.w * scale));
    canvas.height = Math.max(1, Math.round(bx.h * scale));
    const pctx = canvas.getContext("2d");
    if (!pctx) return;
    pctx.imageSmoothingQuality = "high";
    pctx.clearRect(0, 0, canvas.width, canvas.height);
    if (compare && sourceImg) {
      pctx.drawImage(sourceImg, bx.x, bx.y, bx.w, bx.h, 0, 0, canvas.width, canvas.height);
    } else {
      pctx.drawImage(out, 0, 0, canvas.width, canvas.height);
    }
  }, [source, keyHex, mode, tolerance, softness, trim, clean, compare, sourceImg]);

  useEffect(() => {
    render();
  }, [render]);

  /* Click the preview to pick the backdrop colour under the cursor. */
  const pickFromCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!source || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const key = parseHex(keyHex);
    const bounds = trim
      ? contentBounds(mode === "flood" ? applyEdgeFloodKey(source, key, tolerance, softness) : applyKey(source, key, tolerance, softness))
      : null;
    const ox = Math.floor(((e.clientX - rect.left) / rect.width) * (bounds?.w ?? source.width));
    const oy = Math.floor(((e.clientY - rect.top) / rect.height) * (bounds?.h ?? source.height));
    const sx = (bounds?.x ?? 0) + ox;
    const sy = (bounds?.y ?? 0) + oy;
    if (sx < 0 || sy < 0 || sx >= source.width || sy >= source.height) return;
    const i = (sy * source.width + sx) * 4;
    setAutoKey(false);
    setKeyHex(toHex({ r: source.data[i], g: source.data[i + 1], b: source.data[i + 2] }));
    setStatus(null);
  };

  const reSample = () => {
    if (!source) return;
    setAutoKey(true);
    setKeyHex(toHex(mode === "flood" ? sampleEdges(source.data, source.width, source.height) : sampleCorners(source.data, source.width, source.height)));
    setStatus(null);
  };

  const outUrl = () => outputRef.current?.toDataURL("image/png");

  const save = async () => {
    const out = outputRef.current;
    if (!out) return;
    setBusy(true);
    setStatus(null);
    try {
      const result = await uploadDataUrlAsset(storyId, `${name.trim() || "cutout"}.png`, "image", out.toDataURL("image/png"), "cutouts");
      setStatus(result.success ? `✓ saved to the library ▸ 📁 cutouts (${out.width}×${out.height})` : `⚠ ${result.error ?? "save failed"}`);
    } catch (err) {
      setStatus(`⚠ ${err instanceof Error ? err.message : "save failed"}`);
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    const url = outUrl();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.trim() || "cutout"}.png`;
    a.click();
  };

  const reset = () => {
    setSource(null);
    setSourceUrl(undefined);
    setLibRef(undefined);
    setStatus(null);
    setName("");
    setFileName("");
    outputRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mt-3 space-y-2 border border-emerald-400/30 bg-emerald-400/5 p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="font-pulp text-[10px] uppercase tracking-widest text-emerald-300">🪄 Background remover</div>
        {source && (
          <button onClick={reset} className="font-pulp text-[8px] uppercase tracking-widest text-paper/45 hover:text-crimson">
            ⟲ new image
          </button>
        )}
      </div>
      <p className="font-type text-[9px] leading-snug text-paper/45">
        Drop in <b>any</b> image — photo, scan, AI render, an existing sheet — and get a transparent PNG back. No grid to set and
        nothing to slice. <b>Edge flood</b> (default) removes only the backdrop touching the border, so a pale shirt survives a
        pale wall; <b>colour key</b> removes every pixel near the picked colour, which is right for flat magenta or green-screen art.
      </p>

      {!source && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void loadFile(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1 border border-dashed px-3 py-5 text-center transition-colors ${
            dragOver ? "border-emerald-300 bg-emerald-400/10" : "border-emerald-400/40 hover:bg-emerald-400/5"
          }`}
        >
          <span className="font-pulp text-[11px] uppercase tracking-widest text-emerald-300">
            {loading ? "⏳ reading image…" : "⇧ Upload an image"}
          </span>
          <span className="font-type text-[9px] text-paper/45">click to choose, or drag &amp; drop — PNG, JPG, WEBP, GIF</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void loadFile(file);
            }}
          />
        </div>
      )}

      {!source && (
        <div className="space-y-1">
          <div className="font-type text-[9px] text-paper/40">…or pick one already in the library:</div>
          <ImagePicker value={libRef} onChange={setLibRef} storyId={storyId} includeGradients={false} placeholder="Library image…" />
        </div>
      )}

      {source && (
        <>
          <div className="flex flex-wrap items-center gap-2 font-type text-[9px] text-paper/60">
            <span className="max-w-[14rem] truncate" title={fileName}>
              🖼 {fileName || "image"} <span className="text-paper/35">({source.width}×{source.height})</span>
            </span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="border border-noir-600 bg-noir-900 px-1 py-0.5 font-type text-[9px] text-paper/80"
              title="Edge flood = magic wand from the border · colour key = remove every matching pixel"
            >
              <option value="flood">🪄 edge flood (photos)</option>
              <option value="color">🎨 colour key (flat backdrop)</option>
            </select>
            <label className="flex items-center gap-1">
              key
              <input
                type="color"
                value={keyHex}
                onChange={(e) => {
                  setAutoKey(false);
                  setKeyHex(e.target.value);
                }}
                className="h-5 w-8 cursor-pointer border border-noir-600 bg-transparent"
              />
            </label>
            <button
              onClick={reSample}
              title="Re-sample the backdrop colour from the image edges"
              className="border border-noir-600 px-1.5 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/60 hover:border-emerald-300/60 hover:text-emerald-300"
            >
              ⟲ auto
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-type text-[9px] text-paper/60">
            <label className="flex items-center gap-1">
              tolerance
              <input type="range" min={0} max={200} value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))} className="w-24" />
              <span className="w-6 text-right">{tolerance}</span>
            </label>
            <label className="flex items-center gap-1">
              softness
              <input type="range" min={0} max={120} value={softness} onChange={(e) => setSoftness(Number(e.target.value))} className="w-24" />
              <span className="w-6 text-right">{softness}</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={clean} onChange={(e) => setClean(e.target.checked)} />
              clean specks
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} />
              trim to subject
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
              show original
            </label>
          </div>

          {/* Honest diagnosis. The old tool silently did nothing when the key
              colour was wrong, which reads as "the editor is broken". */}
          {diag && !compare && (
            <div
              className={`border px-2 py-1 font-type text-[9px] leading-snug ${
                diag.removedPct < 1
                  ? "border-crimson/50 bg-crimson/10 text-crimson"
                  : diag.removedPct > 97
                    ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
                    : "border-emerald-400/40 bg-emerald-400/5 text-emerald-300"
              }`}
            >
              {diag.removedPct < 1 ? (
                <>
                  <b>Nothing was removed.</b> The key colour doesn’t match this backdrop
                  {diag.edgeSpread > 60 ? " — and the border isn’t one flat colour, so no single key can cut it" : ""}.
                  Click the backdrop in the preview to pick the right colour, press <b>⟲ auto</b>, or raise tolerance.
                  {diag.edgeSpread > 60 && mode === "color" ? " Switch to 🪄 edge flood for a busy/graded backdrop." : ""}
                </>
              ) : diag.removedPct > 97 ? (
                <>
                  <b>Almost everything vanished</b> — tolerance is eating the subject too. Slide tolerance down, or switch to
                  🪄 edge flood so only the backdrop touching the border is cut.
                </>
              ) : (
                <>
                  ✓ removed <b>{diag.removedPct.toFixed(0)}%</b> of the image · backdrop flatness{" "}
                  {diag.edgeSpread < 30 ? "flat (ideal)" : diag.edgeSpread < 60 ? "slightly graded" : "busy — try edge flood"}
                </>
              )}
            </div>
          )}

          <div className="inline-block max-w-full border border-noir-600" style={CHECKER}>
            <canvas
              ref={canvasRef}
              onClick={pickFromCanvas}
              onMouseDown={() => setCompare(false)}
              title={compare ? "Showing the original" : "Click to pick the backdrop colour under the cursor"}
              className={`block max-w-full ${compare ? "" : "cursor-crosshair"}`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="asset name…"
              className="border border-noir-600 bg-noir-900 px-2 py-1 font-type text-[9px] text-paper/80 outline-none focus:border-emerald-300"
            />
            <button
              onClick={save}
              disabled={busy}
              className="border border-emerald-400/50 px-2 py-1 text-[9px] uppercase tracking-wider text-emerald-300 hover:border-emerald-300 hover:bg-emerald-400/10 disabled:opacity-40"
            >
              {busy ? "saving…" : "💾 save PNG to library"}
            </button>
            <button
              onClick={download}
              className="border border-noir-600 px-2 py-1 text-[9px] uppercase tracking-wider text-paper/60 hover:border-emerald-300/60 hover:text-emerald-300"
            >
              ⤓ download
            </button>
            {status && <span className="font-type text-[9px] text-paper/60">{status}</span>}
          </div>
          <p className="font-type text-[9px] leading-snug text-paper/35">
            Saved cutouts land in 📁 cutouts and are instantly pickable from every image dropdown (backgrounds, foreground extras,
            talking sprites, keyframes).
          </p>
        </>
      )}
    </div>
  );
}
