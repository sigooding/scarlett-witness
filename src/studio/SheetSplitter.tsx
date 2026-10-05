import { useCallback, useEffect, useRef, useState } from "react";
import { resolveAssetReference, uploadDataUrlAsset } from "../data/mediaLibrary";
import { ImagePicker } from "./ImagePicker";

/* ------------------------------------------------------------------ */
/*  Media tab: Sheet Splitter.                                         */
/*                                                                     */
/*  The reverse of the Sheet Lab: give it ANY sprite sheet (a 4-frame  */
/*  walk row, a 3×5 grid, an old Discworld-era strip) and cut it into  */
/*  individual transparent PNG frames — download them, or save them    */
/*  straight into the media library so the Sheet Lab / sprite boxes    */
/*  can reassemble or animate them.                                    */
/* ------------------------------------------------------------------ */

const PRESETS: [string, number, number][] = [
  ["3×1", 3, 1],
  ["4×1", 4, 1],
  ["4×2", 4, 2],
  ["3×5", 3, 5],
  ["5×2", 5, 2],
];

const inputCls =
  "border border-gold/30 bg-noir-950 px-1.5 py-1 font-type text-[10px] text-paper outline-none focus:border-gold/70";

export function SheetSplitter({ storyId }: { storyId: string }) {
  const [sourceRef, setSourceRef] = useState<string | undefined>(undefined);
  const [sourceUrl, setSourceUrl] = useState<string | undefined>(undefined);
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const framesRef = useRef<string[]>([]);

  useEffect(() => {
    let alive = true;
    if (!sourceRef) {
      setSourceUrl(undefined);
      return;
    }
    resolveAssetReference(sourceRef).then((url) => {
      if (alive) setSourceUrl(url);
    });
    return () => {
      alive = false;
    };
  }, [sourceRef]);

  /* Draw the sheet with the grid overlay; cache nothing else. */
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;
    const scale = Math.min(1, 640 / img.naturalWidth);
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const fw = canvas.width / cols;
    const fh = canvas.height / rows;
    ctx.strokeStyle = "rgba(232,178,60,0.9)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let c = 1; c < cols; c++) {
      ctx.moveTo(Math.round(c * fw) + 0.5, 0);
      ctx.lineTo(Math.round(c * fw) + 0.5, canvas.height);
    }
    for (let r = 1; r < rows; r++) {
      ctx.moveTo(0, Math.round(r * fh) + 0.5);
      ctx.lineTo(canvas.width, Math.round(r * fh) + 0.5);
    }
    ctx.stroke();
    // Frame numbers
    ctx.fillStyle = "rgba(232,178,60,0.95)";
    ctx.font = "10px monospace";
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) ctx.fillText(String(r * cols + c), c * fw + 3, r * fh + 11);
  }, [cols, rows]);

  useEffect(() => {
    if (!sourceUrl) {
      imgRef.current = null;
      framesRef.current = [];
      redraw();
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      redraw();
    };
    img.src = sourceUrl;
    return () => {
      img.onload = null;
    };
  }, [sourceUrl, redraw]);

  /** Cut every cell into a PNG data URL (source resolution, no scaling). */
  const cutFrames = useCallback((): string[] => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return [];
    const fw = Math.floor(img.naturalWidth / cols);
    const fh = Math.floor(img.naturalHeight / rows);
    const out: string[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement("canvas");
        cell.width = fw;
        cell.height = fh;
        const ctx = cell.getContext("2d");
        if (!ctx) continue;
        ctx.drawImage(img, c * fw, r * fh, fw, fh, 0, 0, fw, fh);
        out.push(cell.toDataURL("image/png"));
      }
    }
    framesRef.current = out;
    return out;
  }, [cols, rows]);

  const baseName = () => {
    const raw = sourceRef?.startsWith("asset:") ? "sheet" : (sourceRef?.split("/").pop() ?? "sheet");
    return raw.replace(/\.[a-z]+$/i, "") || "sheet";
  };

  const downloadAll = () => {
    const frames = cutFrames();
    if (!frames.length) {
      setStatus("Pick a sheet image first.");
      return;
    }
    frames.forEach((dataUrl, i) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${baseName()}-frame-${String(i).padStart(2, "0")}.png`;
        a.click();
      }, i * 250);
    });
    setStatus(`Downloading ${frames.length} frames (${cols}×${rows}).`);
  };

  const saveToLibrary = async () => {
    const frames = cutFrames();
    if (!frames.length) {
      setStatus("Pick a sheet image first.");
      return;
    }
    setBusy(true);
    setStatus(`Saving ${frames.length} frames to the library…`);
    let saved = 0;
    for (let i = 0; i < frames.length; i++) {
      const res = await uploadDataUrlAsset(storyId, `${baseName()}-frame-${String(i).padStart(2, "0")}.png`, "image", frames[i], "sheet-frames");
      if (res.success) saved++;
    }
    setBusy(false);
    setStatus(`Saved ${saved}/${frames.length} frames to the “sheet-frames” library folder.`);
  };

  const frameCount = cols * rows;

  return (
    <div className="mt-3 border border-gold/30 bg-noir-900/60 p-2">
      <h3 className="font-pulp text-[10px] uppercase tracking-widest text-gold">✂️ Sheet Splitter</h3>
      <p className="mt-1 font-type text-[9px] leading-relaxed text-paper/45">
        Cut a sprite sheet into individual frames — pick the sheet, set the grid (3×1 walk row, 3×5 costume
        grid, anything), check the numbered overlay, then download the frames or save them to the library.
      </p>
      <div className="mt-2 space-y-2">
        <ImagePicker
          value={sourceRef}
          onChange={(v) => setSourceRef(v)}
          storyId={storyId}
          includeGradients={false}
          placeholder="Pick a sprite sheet…"
          preferFolder="sheet-frames"
        />
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1 font-type text-[9px] text-paper/60">
            cols
            <input
              type="number"
              min={1}
              max={12}
              value={cols}
              className={`${inputCls} w-12`}
              onChange={(e) => setCols(Math.max(1, Math.min(12, parseInt(e.target.value || "1", 10) || 1)))}
            />
          </label>
          <label className="flex items-center gap-1 font-type text-[9px] text-paper/60">
            rows
            <input
              type="number"
              min={1}
              max={12}
              value={rows}
              className={`${inputCls} w-12`}
              onChange={(e) => setRows(Math.max(1, Math.min(12, parseInt(e.target.value || "1", 10) || 1)))}
            />
          </label>
          {PRESETS.map(([label, c, r]) => (
            <button
              key={label}
              className={`border px-1.5 py-0.5 font-type text-[9px] ${cols === c && rows === r ? "border-gold bg-gold/20 text-gold" : "border-gold/30 text-paper/60 hover:border-gold/60"}`}
              onClick={() => {
                setCols(c);
                setRows(r);
              }}
            >
              {label}
            </button>
          ))}
          <span className="font-type text-[9px] text-paper/40">{frameCount} frames</span>
        </div>
        <canvas ref={canvasRef} className="max-w-full border border-noir-700 bg-[repeating-conic-gradient(#1a1a1a_0%_25%,#222_0%_50%)] bg-[length:16px_16px]" />
        <div className="flex flex-wrap gap-2">
          <button className="border border-gold/40 bg-gold/10 px-2 py-1 font-type text-[10px] text-gold hover:bg-gold/20" onClick={downloadAll}>
            ⤓ download {frameCount} frames
          </button>
          <button
            className="border border-gold/40 bg-gold/10 px-2 py-1 font-type text-[10px] text-gold hover:bg-gold/20 disabled:opacity-40"
            onClick={saveToLibrary}
            disabled={busy}
          >
            {busy ? "saving…" : "➕ save frames to library"}
          </button>
        </div>
        {status && <p className="font-type text-[9px] text-emerald-300/80">{status}</p>}
      </div>
    </div>
  );
}
