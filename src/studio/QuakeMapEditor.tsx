/**
 * QuakeMapEditor — the Studio's editor for the 🧱 3D Quake-style mode.
 *
 * Two parts:
 *  - <QuakeMapEditor/> paints the grid map visually: pick a brush (wall,
 *    floor, spawn, or any anchor letter already used by markers / npc
 *    anchors / props) and click-drag on the grid. The textarea in the
 *    panel stays in sync for authors who prefer typing ASCII.
 *  - <QuakePreview/> mounts the ACTUAL QuakeStage in a full-screen
 *    overlay so the author can walk-test the room without leaving the
 *    editor or entering play mode. Interactions announce themselves
 *    ("fires in play") instead of mutating story state.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { quakePropSpec } from "../game/quakeMath";
import type { ReactNode } from "react";
import type { SceneNode } from "../types";
import { FpsStage } from "../game/fps/FpsStage";
import { QuakeStage, webglAvailable } from "../game/QuakeStage";
import { SPRITES3D, TEXTURES3D } from "../data/sprites3d";
import { uploadAsset } from "../data/mediaLibrary";

/** Desktop bridge (electron/preload) — present only in the app shell. */
interface Sprite3dBridge {
  saveSprite3d?: (p: { relativePath: string; bytes: ArrayBuffer }) => Promise<{ url: string; path?: string }>;
}
const bridge = (): Sprite3dBridge =>
  (globalThis as { scarletReelDesktop?: Sprite3dBridge }).scarletReelDesktop ?? {};

/** Pulldown + upload for one 3D sprite slot. Desktop uploads are written
 *  into public/assets/sprites3d/ (committable); browser uploads become
 *  media-library `asset:` references. A value not in the catalogue shows
 *  as a custom URL field. */
export function Sprite3DPicker({
  kind,
  value,
  onChange,
  storyId,
  extra = [],
  onUploaded,
}: {
  kind: "prop" | "hand" | "texture";
  value?: string;
  onChange: (url: string | undefined) => void;
  storyId: string;
  extra?: { url: string; label: string }[];
  onUploaded?: (u: { url: string; label: string }) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [custom, setCustom] = useState(false);

  const list =
    kind === "texture"
      ? TEXTURES3D.map((t) => ({ url: t.url, label: t.label }))
      : SPRITES3D.filter((s) => (kind === "hand" ? s.kind === "hand" : true)).map((s) => ({ url: s.url, label: s.label }));
  const all = [...list, ...extra];
  const known = all.find((o) => o.url === value);
  const showCustom = custom || (!!value && !known);

  const onFile = async (f: File) => {
    setBusy(true);
    setNote(null);
    try {
      const name = f.name.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "sprite";
      const ext = (f.name.match(/\.(png|jpe?g|webp)$/i)?.[1] ?? "png").toLowerCase();
      const b = bridge();
      if (b.saveSprite3d) {
        const bytes = await f.arrayBuffer();
        const res = await b.saveSprite3d({ relativePath: `assets/sprites3d/${name}.${ext}`, bytes });
        onChange(res.url);
        setNote(`saved → ${res.url} (committable)`);
        onUploaded?.({ url: res.url, label: `${name} (sprites3d)` });
      } else {
        const res = await uploadAsset(storyId, f);
        if (res.success && res.assetId) {
          onChange(`asset:${res.assetId}`);
          setNote("stored in the media library as an asset reference");
          onUploaded?.({ url: `asset:${res.assetId}`, label: `${f.name} (library)` });
        } else setNote(res.error ?? "upload failed");
      }
    } catch (e) {
      setNote(String(e));
    }
    setBusy(false);
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <div className="flex items-center gap-1">
        <select
          className="min-w-0 flex-1 border border-noir-700 bg-noir-950 px-1 py-0.5 font-type text-[9px] text-paper/80"
          value={showCustom ? "__custom" : value ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "__custom") setCustom(true);
            else {
              setCustom(false);
              onChange(v || undefined);
            }
          }}
        >
          <option value="">— none —</option>
          {all.map((o) => (
            <option key={o.url} value={o.url}>
              {o.label}
            </option>
          ))}
          <option value="__custom">custom url…</option>
        </select>
        <button
          type="button"
          title="Upload into assets/sprites3d/ (desktop) or the media library (browser)"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="shrink-0 rounded border border-cyan-neon/50 px-1.5 py-0.5 font-type text-[9px] text-cyan-neon hover:bg-cyan-neon/10 disabled:opacity-40"
        >
          {busy ? "…" : "⬆ upload"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
            e.target.value = "";
          }}
        />
      </div>
      {showCustom && (
        <input
          className="border border-noir-700 bg-noir-950 px-1 py-0.5 font-mono text-[9px] text-paper/80"
          placeholder="/assets/sprites3d/… or asset:…"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || undefined)}
        />
      )}
      {note && <span className="font-type text-[8px] text-gold/80">{note}</span>}
    </div>
  );
}

const BRUSH_META: { id: string; label: string; cls: string }[] = [
  { id: "#", label: "🧱 Wall", cls: "bg-paper/25 text-paper" },
  { id: ".", label: "· Floor", cls: "bg-noir-900 text-paper/50" },
  { id: "S", label: "S Spawn", cls: "bg-emerald-500/30 text-emerald-300" },
];

export function QuakeMapEditor({
  map,
  markers = {},
  npcAnchors = {},
  props = {},
  onChange,
}: {
  map: string[];
  markers?: Record<string, string>;
  npcAnchors?: Record<string, string>;
  props?: Record<string, string>;
  onChange: (map: string[]) => void;
}) {
  const cols = Math.max(8, ...map.map((r) => r.length));
  const rows = Math.max(4, map.length);
  const cellAt = (x: number, z: number) => map[z]?.[x] ?? "#";
  const [brush, setBrush] = useState("#");
  const painting = useRef(false);

  const letters = useMemo(() => {
    const legend: { id: string; what: string }[] = [];
    for (const [k, v] of Object.entries(markers)) legend.push({ id: k, what: `marker → ${v}` });
    for (const [k, v] of Object.entries(npcAnchors)) legend.push({ id: k, what: `npc → ${v}` });
    for (const [k, v] of Object.entries(props)) legend.push({ id: k, what: `prop → ${v.split("@")[0].split("/").pop()}` });
    return legend.sort((a, b) => a.id.localeCompare(b.id));
  }, [markers, npcAnchors, props]);

  useEffect(() => {
    const up = () => (painting.current = false);
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  const paint = (x: number, z: number) => {
    const grid: string[][] = [];
    for (let r = 0; r < rows; r++) grid.push((map[r] ?? "#".repeat(cols)).padEnd(cols, "#").split(""));
    if (brush === "S") for (const row of grid) for (let i = 0; i < row.length; i++) if (row[i] === "S") row[i] = ".";
    grid[z][x] = brush;
    onChange(grid.map((r) => r.join("")));
  };

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-1">
        {BRUSH_META.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setBrush(b.id)}
            className={`rounded border px-1.5 py-0.5 font-type text-[9px] ${b.cls} ${
              brush === b.id ? "border-gold ring-1 ring-gold" : "border-noir-700 hover:border-paper/40"
            }`}
          >
            {b.label}
          </button>
        ))}
        {letters.map((l) => (
          <button
            key={l.id}
            type="button"
            title={l.what}
            onClick={() => setBrush(l.id)}
            className={`rounded border px-1.5 py-0.5 font-mono text-[9px] text-cyan-neon ${
              brush === l.id ? "border-gold ring-1 ring-gold" : "border-noir-700 hover:border-paper/40"
            }`}
          >
            {l.id} <span className="text-paper/40">{l.what.split("→")[0]}</span>
          </button>
        ))}
      </div>
      <div
        className="inline-block select-none border border-noir-700 bg-noir-950 p-1"
        onMouseLeave={() => (painting.current = false)}
        onContextMenu={(e) => {
          e.preventDefault();
          setBrush("#");
        }}
      >
        {Array.from({ length: rows }, (_, z) => (
          <div key={z} className="flex">
            {Array.from({ length: cols }, (_, x) => {
              const c = cellAt(x, z);
              const isWall = c === "#";
              const isSpawn = c === "S";
              const isLetter = /[A-Z]/.test(c);
              return (
                <div
                  key={x}
                  role="button"
                  tabIndex={-1}
                  title={`${x},${z} — ${isWall ? "wall" : isSpawn ? "spawn" : isLetter ? `anchor ${c}` : "floor"}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    painting.current = true;
                    paint(x, z);
                  }}
                  onMouseEnter={() => painting.current && paint(x, z)}
                  className={`flex h-[15px] w-[15px] items-center justify-center border border-noir-900/70 font-mono text-[9px] leading-none ${
                    isWall
                      ? "bg-paper/30"
                      : isSpawn
                        ? "bg-emerald-500/40 text-emerald-200"
                        : isLetter
                          ? "bg-cyan-neon/15 text-cyan-neon"
                          : "bg-noir-900 text-transparent"
                  }`}
                >
                  {isSpawn ? "S" : isLetter ? c : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="font-type text-[8.5px] text-paper/40">
        Click-drag to paint with the selected brush · letters place the anchor used by markers / NPCs / props ·
        right-click resets the brush to wall.
      </p>
    </div>
  );
}

/** Full-screen walk-test of the room with the real QuakeStage. */
export function QuakePreview({ scene }: { scene: SceneNode }) {
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const quake = scene.stage?.quake;

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  if (!quake || !scene.stage) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setCaption(null);
          setOpen(true);
        }}
        className="w-full border border-cyan-neon/50 py-1 font-pulp text-[10px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
      >
        🚶 Walk-test the room in 3D
      </button>
      {open && (
        <div className="fixed inset-0 z-[999] bg-black">
          {quake.fps ? (
            <FpsStage preview quake={quake} title={scene.title} hotspots={scene.hotspots ?? []}
              onInteract={hs => setCaption(`▶ ${hs.label} — fires for real in Play`)}
              onMenu={() => setOpen(false)} />
          ) : webglAvailable() ? (
            <QuakeStage
              settings={scene.stage}
              quake={quake}
              hotspots={scene.hotspots ?? []}
              unlocked={() => true}
              onInteract={(hs) => setCaption(`▶ ${hs.label} — fires for real in Play`)}
              onCaption={(t) => setCaption(t)}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center font-type text-sm text-paper/70">
              No WebGL context in this browser — the 3D preview can't start here. In Play the room falls back to the
              classic 2D stage.
            </div>
          )}
          {caption && (
            <div className="pointer-events-none absolute inset-x-0 top-4 z-[1001] flex justify-center">
              <span className="rounded border border-gold/50 bg-noir-950/90 px-3 py-1 font-type text-[11px] text-gold">
                {caption}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-3 top-3 z-[1001] rounded border border-crimson/60 bg-noir-950/90 px-2 py-1 font-pulp text-[10px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
          >
            ✕ Close (Esc)
          </button>
        </div>
      )}
    </>
  );
}

/** The whole "sprite selection" half of the 3D panel: per-letter prop rows
 *  with pulldown + upload (stored in the sprites3d folder on desktop),
 *  wall/floor texture pulldowns and the hand-overlay pulldown. Owns its
 *  hooks so Studio can mount it inside a conditional without trouble. */
export function QuakeSpritePanel({
  q,
  storyId,
  onPatch,
}: {
  q: import("../types").QuakeModeSettings;
  storyId: string;
  onPatch: (patch: Partial<import("../types").QuakeModeSettings>) => void;
}) {
  const [uploaded3d, setUploaded3d] = useState<{ url: string; label: string }[]>([]);
  const [newLetter, setNewLetter] = useState("");
  const [newUrl, setNewUrl] = useState<string | undefined>(undefined);
  const remember = (u: { url: string; label: string }) =>
    setUploaded3d((prev) => (prev.some((p) => p.url === u.url) ? prev : [...prev, u]));

  const rows = Object.entries(q.props ?? {}).map(([letter, val]) => {
    const spec = quakePropSpec(val);
    const yawDeg = Math.round((spec.yaw * 180) / Math.PI);
    const setProp = (url?: string, h?: number, yaw?: number) => {
      const props = { ...(q.props ?? {}) };
      if (!url) delete props[letter];
      else props[letter] = `${url}@${h ?? spec.height}@${yaw ?? yawDeg}`;
      onPatch({ props });
    };
    return (
      <div key={letter} className="flex items-center gap-1">
        <span className="w-4 shrink-0 text-center font-mono text-[10px] text-cyan-neon">{letter}</span>
        <Sprite3DPicker kind="prop" storyId={storyId} extra={uploaded3d} onUploaded={remember} value={spec.url} onChange={(u) => setProp(u)} />
        <input
          type="number" step={0.1} min={0.2} max={4} title="height in world units (door ≈ 2.1)"
          className="w-12 shrink-0 border border-noir-700 bg-noir-950 px-1 py-0.5 font-type text-[9px] text-paper/80"
          value={spec.height}
          onChange={(e) => setProp(spec.url, parseFloat(e.target.value) || 2.05)}
        />
        <input
          type="number" step={15} min={-180} max={360} title="facing yaw ° (0 = south, 90 = east)"
          className="w-14 shrink-0 border border-noir-700 bg-noir-950 px-1 py-0.5 font-type text-[9px] text-paper/80"
          value={yawDeg}
          onChange={(e) => setProp(spec.url, spec.height, parseFloat(e.target.value) || 0)}
        />
        <button type="button" className="shrink-0 text-crimson hover:underline" title="remove prop" onClick={() => setProp(undefined)}>
          ✕
        </button>
      </div>
    );
  });

  return (
    <div className="space-y-1.5">
      <Field3 label="Props — sprite per anchor letter (static quads: height + facing)">
        <div className="space-y-1">
          {rows}
          <div className="flex items-center gap-1">
            <input
              className="w-4 shrink-0 border border-noir-700 bg-noir-950 text-center font-mono text-[10px] uppercase text-cyan-neon"
              maxLength={1}
              placeholder="A"
              value={newLetter}
              onChange={(e) => setNewLetter(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
            />
            <Sprite3DPicker kind="prop" storyId={storyId} extra={uploaded3d} onUploaded={remember} value={newUrl} onChange={setNewUrl} />
            <button
              type="button"
              disabled={!newLetter || !newUrl || !!q.props?.[newLetter]}
              className="shrink-0 rounded border border-cyan-neon/50 px-1.5 py-0.5 font-type text-[9px] text-cyan-neon hover:bg-cyan-neon/10 disabled:opacity-40"
              onClick={() => {
                onPatch({ props: { ...(q.props ?? {}), [newLetter]: `${newUrl}@2.05@0` } });
                setNewLetter("");
                setNewUrl(undefined);
              }}
            >
              + add
            </button>
          </div>
          <p className="font-type text-[8px] text-paper/40">
            height = world units (door 2.1 · plant 0.8) · yaw = facing in degrees (0 = south, 90 = east). Props are
            static upright quads — doors stay put; only markers and characters billboard.
          </p>
        </div>
      </Field3>
      <div className="grid grid-cols-2 gap-1">
        <Field3 label="Wall texture">
          <Sprite3DPicker kind="texture" storyId={storyId} extra={uploaded3d} onUploaded={remember} value={q.wallTexture} onChange={(u) => onPatch({ wallTexture: u })} />
        </Field3>
        <Field3 label="Floor texture">
          <Sprite3DPicker kind="texture" storyId={storyId} extra={uploaded3d} onUploaded={remember} value={q.floorTexture} onChange={(u) => onPatch({ floorTexture: u })} />
        </Field3>
      </div>
      <Field3 label="First-person hand overlay">
        <Sprite3DPicker kind="hand" storyId={storyId} extra={uploaded3d} onUploaded={remember} value={q.handImage} onChange={(u) => onPatch({ handImage: u })} />
      </Field3>
    </div>
  );
}

/** Tiny local field wrapper so the panel doesn't depend on Studio's. */
function Field3({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-0.5 block font-pulp text-[8px] uppercase tracking-widest text-paper/50">{label}</span>
      {children}
    </label>
  );
}
