import { useState } from "react";
import { assetUrl } from "../assetPath";
import { uploadDataUrlAsset, useResolvedMedia } from "../data/mediaLibrary";
import type { SpriteSheet } from "../game/spriteSheet";
import { ImagePicker } from "./ImagePicker";
import { assembleSpriteAtlas } from "./spriteAtlas";

const input = "w-full border border-noir-600 bg-noir-950 px-2 py-1 text-xs text-paper";

/** Add another already-keyed pose bank without replacing the current clips.
 * The same assembler is used by built-in reel preparation; no private art
 * pipeline is needed to reproduce multi-angle/action atlases in Studio. */
export function SpriteAtlasControls({ value, onChange, storyId }: { value: SpriteSheet; onChange: (sheet: SpriteSheet) => void; storyId: string }) {
  const resolve = useResolvedMedia(storyId);
  const [image, setImage] = useState<string | undefined>();
  const [columns, setColumns] = useState(4), [rows, setRows] = useState(1);
  const [name, setName] = useState("walk-up"), [fps, setFps] = useState(7);
  const [height, setHeight] = useState<number | undefined>();
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  async function combine() {
    if (!image || busy) return;
    setBusy(true); setMessage("");
    try {
      const clip = name.trim();
      if (!clip) throw new Error("Give the new bank a clip name.");
      if (Object.prototype.hasOwnProperty.call(value.animations, clip)) throw new Error(`Clip “${clip}” already exists. Choose a new name; existing clips are never overwritten.`);
      const url = assetUrl(resolve(image) ?? image);
      const img = new Image(); img.crossOrigin = "anonymous"; img.src = url; await img.decode();
      if (img.naturalWidth % columns || img.naturalHeight % rows) throw new Error("The source image must divide evenly into the chosen columns and rows.");
      const count = columns * rows;
      const atlas = await assembleSpriteAtlas([
        { id: "existing", ...value, image: assetUrl(resolve(value.image) ?? value.image) },
        { id: "addition", image: url, frameWidth: img.naturalWidth / columns, frameHeight: img.naturalHeight / rows,
          animations: { [clip]: { frames: Array.from({ length: count }, (_, i) => i), fps } } },
      ], height ?? value.frameHeight);
      const saved = await uploadDataUrlAsset(storyId, `atlas-${clip}.png`, "image", atlas.dataUrl, "sprites");
      if (!saved.success || !saved.assetId) throw new Error(`${saved.error ?? "Atlas could not be saved."} Original sheet kept. Lower the output height or adjust Media storage limits.`);
      onChange({ ...value, image: `asset:${saved.assetId}`, frameWidth: atlas.frameWidth, frameHeight: atlas.frameHeight, animations: atlas.animations });
      const range = atlas.ranges.addition;
      setMessage(`Saved ${atlas.frameCount} frames (${atlas.columns} × ${atlas.rows}). “${clip}” uses frames ${range.first}–${range.first + range.count - 1}; existing clips/timing preserved.`);
      setImage(undefined);
    } catch (error) {
      setMessage(`⚠ ${error instanceof Error ? error.message : "Could not assemble atlas."}`);
    } finally { setBusy(false); }
  }
  return <details className="space-y-2 border border-cyan-neon/25 bg-cyan-neon/5 p-2" data-atlas-controls>
    <summary className="cursor-pointer font-pulp text-[10px] uppercase tracking-wider text-cyan-neon">Combine pose banks into this atlas</summary>
    <p className="font-type text-[10px] leading-relaxed text-paper/60">Add another transparent, evenly gridded sheet. Key each source with Auto-build / Cutout Lab first. Banks share a canvas height and foot baseline; keep headroom inside duck/action frames. This does not invent new poses.</p>
    <ImagePicker value={image} storyId={storyId} includeGradients={false} preferFolder="sprites" onChange={setImage} />
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      <label className="text-[10px] text-paper/70">Bank columns<input aria-label="Bank columns" className={input} type="number" min={1} max={64} value={columns} onChange={e => setColumns(Math.min(64, Math.max(1, Math.trunc(Number(e.target.value) || 1))))} /></label>
      <label className="text-[10px] text-paper/70">Bank rows<input aria-label="Bank rows" className={input} type="number" min={1} max={64} value={rows} onChange={e => setRows(Math.min(64, Math.max(1, Math.trunc(Number(e.target.value) || 1))))} /></label>
      <label className="text-[10px] text-paper/70">New clip name<input aria-label="New clip name" className={input} value={name} onChange={e => setName(e.target.value)} /></label>
      <label className="text-[10px] text-paper/70">FPS<input aria-label="New clip FPS" className={input} type="number" min={1} max={60} value={fps} onChange={e => setFps(Math.min(60, Math.max(1, Number(e.target.value) || 1)))} /></label>
      <label className="text-[10px] text-paper/70">Frame height<input aria-label="Atlas frame height" className={input} type="number" min={16} max={2048} value={height ?? value.frameHeight} onChange={e => setHeight(Math.min(2048, Math.max(16, Math.trunc(Number(e.target.value) || 16))))} /></label>
    </div>
    <button type="button" disabled={busy || !image} onClick={() => void combine()} className="border border-cyan-neon/50 px-2 py-1 font-pulp text-[10px] text-cyan-neon disabled:opacity-40">{busy ? "Assembling…" : "Assemble atlas"}</button>
    {message && <p role="status" className="font-type text-[10px] text-paper/75">{message}</p>}
    <p className="font-type text-[9px] text-paper/45">Use walk/idle plus -up, -down, -left, -right, -up-left, -up-right, -down-left, -down-right for Stage player directions. Diagonal walk clips enable eight-way facing; missing angles fall back safely. Edit frame lists/loop timing below after assembly.</p>
  </details>;
}
