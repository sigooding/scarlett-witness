import { useEffect, useMemo, useRef, useState } from "react";
import builtinImages from "virtual:builtin-images";
import { setAssetFolder, uploadAsset, useAllAssets } from "../data/mediaLibrary";
import { assetUrl } from "../assetPath";

const inputCls =
  "w-full border border-noir-600 bg-noir-950 px-2 py-1 text-xs text-paper focus:border-neon outline-none";

/** Gradient presets (not files, so not in /img) offered alongside the art. */
const GRADIENT_PRESETS: { value: string; label: string }[] = [
  { value: "gradient:linear-gradient(135deg,#1e1b4b 0%,#831843 100%)", label: "Indigo → Magenta" },
  { value: "gradient:linear-gradient(135deg,#134e4a 0%,#312e81 100%)", label: "Teal → Indigo" },
  { value: "gradient:linear-gradient(160deg,#713f12 0%,#0c0c14 70%)", label: "Amber → Noir" },
  { value: "gradient:linear-gradient(135deg,#0c0c14 0%,#2b2b3f 100%)", label: "Noir → Slate" },
];

/** Heading shown above a group of images the scan tagged with a `group`. */
const GROUP_LABELS: Record<string, string> = {
  "film-depth": "Film depth maps, plates & cut-outs",
};

const isGradient = (v?: string) => !!v && v.startsWith("gradient:");
const gradientCss = (v: string) => v.slice("gradient:".length);

/**
 * Story a picker upload is filed under when the call site didn't hand one over
 * (the depth-camera fields, cursor slots, masks and so on never did). Studio
 * points this at the case being edited, so an upload made anywhere in the
 * Studio belongs to that story — which is also what makes it travel with the
 * story on export — instead of sitting in a nameless bucket.
 */
let fallbackStoryId = "studio-uploads";
export function setImagePickerStoryId(id?: string): void {
  if (id) fallbackStoryId = id;
}

type ItemKind = "gradient" | "builtin" | "upload";
type Item = { kind: ItemKind; value: string; label: string; src?: string; section: string };

function Swatch({
  kind,
  value,
  src,
  className,
}: {
  kind: ItemKind;
  value: string;
  src?: string;
  className?: string;
}) {
  if (kind === "gradient") return <div className={className} style={{ background: gradientCss(value) }} />;
  return <img src={assetUrl(src)} alt="" loading="lazy" className={`object-cover ${className ?? ""}`} />;
}

/**
 * Image browser for the Studio — the one image box every picture field uses
 * (scene backgrounds, beat replacement shots, depth maps, plates, cut-outs,
 * sprites, masks, avatars, cursors…).
 *
 * It lists EVERY available image. Your own uploads lead the list (the folder
 * the field prefers first, e.g. "sprites" or "depth maps", then the rest A→Z),
 * then the gradient presets, then all built-in art shipped in `/img` and
 * `/assets` (via the `virtual:builtin-images` plugin) and — under its own
 * heading, and one click away behind “show every group” for pickers that
 * don't ask for it — the film's depth maps / plates / cut-outs from
 * `/film/depth`. Rows carry group headings, a filter box narrows the list
 * (Enter takes the first match), and rolling the pointer over any entry pops a
 * large preview so you can actually see what you're choosing.
 *
 * It also uploads: the ⇧ Upload row at the top of the panel takes a file
 * straight into the shared library and selects it, so no field needs a separate
 * upload button beside it. Dropping an image file onto the box does the same.
 *
 * Stores stable values: `/img/…` paths for built-ins, `asset:<id>` (or the data
 * URL when returnReference is false) for uploads, and `gradient:…` for the
 * presets — so saves and exports stay compact and never break on rebuild.
 */
export function ImagePicker({
  value,
  onChange,
  storyId,
  includeBuiltins = true,
  includeGradients = true,
  allowClear = true,
  /** for uploads, store `asset:<id>` (default) instead of the data URL */
  returnReference = true,
  placeholder = "Pick an image…",
  preferFolder,
  groups,
  uploadFolder,
  allowUpload = true,
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
  /** story an upload from this picker is filed under (default: the case Studio has open) */
  storyId?: string;
  includeBuiltins?: boolean;
  includeGradients?: boolean;
  allowClear?: boolean;
  returnReference?: boolean;
  placeholder?: string;
  /** library folder whose uploads sort to the very top (e.g. "sprites") */
  preferFolder?: string;
  /** extra built-in groups to list ("film-depth": the film's depth maps, plates and cut-outs); other groups stay behind the “show every group” switch */
  groups?: string[];
  /** library folder new uploads are filed under (default: preferFolder) */
  uploadFolder?: string;
  /** hide the ⇧ Upload row, for pickers that must stay pick-only */
  allowUpload?: boolean;
}) {
  const uploads = useAllAssets("image");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hover, setHover] = useState<{ item: Item; rect: DOMRect } | null>(null);
  const [showEveryGroup, setShowEveryGroup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [dropHot, setDropHot] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fileStoryId = storyId ?? fallbackStoryId;
  const uploadTo = uploadFolder ?? preferFolder;

  // Close on outside click / Esc.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setHover(null);
      setQuery("");
      setNote(null);
      setDropHot(false);
    }
  }, [open]);

  /** Everything this picker can offer, plus the group-tagged files it holds
   *  back until “show every group” is switched on (the film's depth maps would
   *  only clutter a background picker). */
  const { items, hiddenCount, hiddenSections, builtinCount } = useMemo(() => {
    const shown: Item[] = [];
    const heldBack = new Set<string>();
    let heldBackCount = 0;
    let builtins = 0;
    // Your own uploads come FIRST: the preferred folder leads (sprites for a
    // sprite field, “depth maps” for a depth-map field), then every other
    // folder A→Z, then the unfiled ones — so the picture you just added is at
    // the top of the box you added it from, never buried under the library.
    for (const a of [...uploads].sort((x, y) => {
      const rank = (a2: typeof x) => (preferFolder && a2.folder === preferFolder ? "" : a2.folder ?? "\uffff");
      return rank(x).localeCompare(rank(y)) || x.name.localeCompare(y.name);
    }))
      shown.push({
        kind: "upload",
        value: returnReference ? `asset:${a.id}` : a.dataUrl,
        label: a.folder ? `📁 ${a.folder} / ${a.name}` : a.name,
        src: a.dataUrl,
        section: "Your uploads",
      });
    if (includeGradients)
      for (const g of GRADIENT_PRESETS) shown.push({ kind: "gradient", ...g, section: "Gradient presets" });
    if (includeBuiltins)
      for (const b of builtinImages) {
        const section = b.group ? GROUP_LABELS[b.group] ?? `More images (${b.group})` : "Built-in art & sprites";
        const listed = !b.group || groups?.includes(b.group) || showEveryGroup;
        if (!listed) {
          heldBackCount += 1;
          heldBack.add(section);
          continue;
        }
        builtins += 1;
        shown.push({ kind: "builtin", value: b.url, label: b.label, section });
      }
    return {
      items: shown,
      hiddenCount: heldBackCount,
      hiddenSections: [...heldBack],
      builtinCount: builtins,
    };
  }, [includeGradients, includeBuiltins, uploads, returnReference, preferFolder, groups, showEveryGroup]);

  /** The visible rows: filtered, with a heading whenever the source changes —
   *  so a long list reads as tintable sections instead of one wall of names. */
  const { rows, matchCount } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? items.filter((it) => it.label.toLowerCase().includes(q) || it.value.toLowerCase().includes(q))
      : items;
    const out: ({ kind: "header"; label: string } | { kind: "item"; item: Item })[] = [];
    let lastSection = "";
    for (const it of list) {
      if (it.section !== lastSection) {
        out.push({ kind: "header", label: it.section });
        lastSection = it.section;
      }
      out.push({ kind: "item", item: it });
    }
    return { rows: out, matchCount: list.length };
  }, [items, query]);

  const firstMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return items.find((it) => it.label.toLowerCase().includes(q) || it.value.toLowerCase().includes(q)) ?? null;
  }, [items, query]);

  const current = useMemo<{ label: string; kind: ItemKind; value: string; src?: string } | null>(() => {
    if (!value) return null;
    if (isGradient(value)) return { label: "Gradient", kind: "gradient", value, src: value };
    const up = uploads.find((a) => (returnReference ? `asset:${a.id}` === value : a.dataUrl === value));
    if (up) return { label: up.name, kind: "upload", value, src: up.dataUrl };
    const bi = builtinImages.find((b) => b.url === value);
    if (bi) return { label: bi.label, kind: "builtin", value: bi.url, src: bi.url };
    if (value.startsWith("data:")) return { label: "Custom image", kind: "upload", value, src: value };
    return { label: value.split("/").pop() ?? value, kind: "builtin", value, src: value };
  }, [value, uploads, returnReference]);

  const select = (it: Item | null) => {
    onChange(it ? it.value : undefined);
    setOpen(false);
  };

  /** Upload one file into the shared library and pick it. The panel stays open
   *  so the new image is visible in “Your uploads” with a confirmation, which
   *  makes adding several in a row painless. */
  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setNote(`✕ “${file.name}” is not an image file.`);
      return;
    }
    setBusy(true);
    setNote(null);
    const result = await uploadAsset(fileStoryId, file);
    if (!result.success || !result.assetId) {
      setBusy(false);
      setNote(`✕ ${result.error ?? "Upload failed."}`);
      return;
    }
    if (uploadTo) await setAssetFolder(fileStoryId, result.assetId, uploadTo);
    setBusy(false);
    setQuery("");
    onChange(returnReference ? `asset:${result.assetId}` : result.url ?? `asset:${result.assetId}`);
    setNote(`✓ ${file.name} — picked and saved to the library${uploadTo ? ` in “${uploadTo}”` : ""}.`);
  };

  /** A file is being dragged anywhere over the picker (button or open panel). */
  const onDragOver = (e: React.DragEvent) => {
    if (!allowUpload || !e.dataTransfer?.types?.includes("Files")) return;
    e.preventDefault();
    e.stopPropagation();
    setDropHot(true);
  };

  const onDrop = (e: React.DragEvent) => {
    const file = e.dataTransfer?.files?.[0];
    if (!allowUpload || !file) return;
    e.preventDefault();
    e.stopPropagation();
    setDropHot(false);
    setOpen(true);
    void uploadFile(file);
  };

  const onRowEnter = (it: Item) => (e: React.MouseEvent<HTMLButtonElement>) =>
    setHover({ item: it, rect: e.currentTarget.getBoundingClientRect() });

  const PREVIEW_W = 256;
  const PREVIEW_H = 144;
  let previewStyle: React.CSSProperties | null = null;
  if (hover) {
    const r = hover.rect;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const vh = typeof window !== "undefined" ? window.innerHeight : 720;
    const placeLeft = r.left > PREVIEW_W + 24;
    const left = placeLeft ? r.left - PREVIEW_W - 10 : r.right + 10;
    previewStyle = {
      position: "fixed",
      left: Math.max(8, Math.min(left, vw - PREVIEW_W - 8)),
      top: Math.max(8, Math.min(r.top, vh - PREVIEW_H - 8)),
      width: PREVIEW_W,
      zIndex: 90,
    };
  }

  return (
    <div
      ref={wrapRef}
      className={`relative ${dropHot ? "outline outline-2 outline-dashed outline-cyan-neon/70" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={() => setDropHot(false)}
      onDrop={onDrop}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${inputCls} flex items-center gap-2 text-left`}
        title={allowUpload ? `${value ?? ""} — click to browse every image, or drop a file here to upload`.trim() : value ?? ""}
      >
        {current ? (
          <>
            <Swatch kind={current.kind} value={current.value} src={current.src} className="h-5 w-8 shrink-0 rounded-sm border border-noir-600" />
            <span className="min-w-0 flex-1 truncate text-paper/85">{current.label}</span>
          </>
        ) : (
          <span className="flex-1 text-paper/40">{placeholder}</span>
        )}
        {busy && <span className="shrink-0 text-[10px] text-cyan-neon">⏳</span>}
        <span className="shrink-0 text-paper/40">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[16rem] border border-noir-600 bg-noir-950 shadow-2xl">
          {allowUpload && (
            <div className="border-b border-noir-700 p-1">
              <button
                type="button"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
                className={`w-full border border-cyan-neon/50 px-2 py-1 font-pulp text-[10px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10 ${
                  busy ? "pointer-events-none opacity-50" : ""
                }`}
                title={uploadTo ? `Upload an image and file it under “${uploadTo}”` : "Upload an image into the library and pick it"}
              >
                {busy ? "⏳ Uploading…" : "⇧ Upload an image…"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void uploadFile(file);
                }}
              />
              <p className="mt-1 px-0.5 font-type text-[9px] leading-snug text-paper/40">
                …or drop a file on this box. Uploads land in the shared library and stay reusable everywhere.
              </p>
              {note && (
                <p
                  className={`mt-1 border px-2 py-1 font-type text-[9px] leading-snug ${
                    note.startsWith("✕")
                      ? "border-crimson/40 bg-crimson/10 text-crimson"
                      : "border-cyan-neon/40 bg-cyan-neon/10 text-cyan-neon"
                  }`}
                >
                  {note}
                </p>
              )}
            </div>
          )}
          <div className="border-b border-noir-700 p-1">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && firstMatch) select(firstMatch);
              }}
              placeholder={`Filter ${items.length} images…`}
              className={`${inputCls} border-noir-700`}
            />
          </div>
          {hiddenCount > 0 && (
            <label className="flex items-center gap-2 border-b border-noir-700 px-2 py-1 font-type text-[9px] text-paper/55">
              <input
                type="checkbox"
                className="h-3 w-3 accent-cyan-400"
                checked={showEveryGroup}
                onChange={(e) => setShowEveryGroup(e.target.checked)}
              />
              Show every group too ({hiddenCount} more — {hiddenSections.join(", ").toLowerCase()})
            </label>
          )}
          <div className="max-h-72 overflow-auto py-1">
            {allowClear && (
              <button
                type="button"
                onMouseEnter={() => setHover(null)}
                onClick={() => select(null)}
                className="flex w-full items-center gap-2 px-2 py-1 text-left text-xs text-paper/50 hover:bg-noir-800"
              >
                <span className="flex h-6 w-10 shrink-0 items-center justify-center rounded-sm border border-dashed border-noir-600 text-[8px]">
                  ✕
                </span>
                <span>— None —</span>
              </button>
            )}
            {matchCount === 0 && (
              <p className="px-3 py-2 font-type text-[10px] text-paper/40">
                No images match “{query}”. {allowUpload && "Use ⇧ Upload above to add it."}
              </p>
            )}
            {rows.map((row) => {
              if (row.kind === "header") {
                return (
                  <div
                    key={`h:${row.label}`}
                    className="sticky top-0 bg-noir-950/95 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/40"
                  >
                    {row.label}
                  </div>
                );
              }
              const it = row.item;
              const active = value === it.value;
              return (
                <button
                  key={`${it.kind}:${it.value}`}
                  type="button"
                  onMouseEnter={onRowEnter(it)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => select(it)}
                  className={`flex w-full items-center gap-2 px-2 py-1 text-left text-xs ${
                    active ? "bg-neon/15 text-neon" : "text-paper/80 hover:bg-noir-800"
                  }`}
                  title={it.label}
                >
                  <Swatch kind={it.kind} value={it.value} src={it.src} className="h-6 w-10 shrink-0 rounded-sm border border-noir-600" />
                  <span className="min-w-0 flex-1 truncate">{it.label}</span>
                  {it.kind === "upload" && (
                    <span className="shrink-0 text-[8px] uppercase tracking-wider text-cyan-neon/70">upload</span>
                  )}
                  {it.kind === "gradient" && (
                    <span className="shrink-0 text-[8px] uppercase tracking-wider text-paper/40">gradient</span>
                  )}
                  {active && <span className="shrink-0 text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>
          <div className="border-t border-noir-700 px-2 py-1 font-type text-[9px] text-paper/35">
            Hover any image to preview · Enter picks the first match · {builtinCount} built-in · {uploads.length} uploaded
          </div>
        </div>
      )}

      {hover && previewStyle && (
        <div
          style={previewStyle}
          className="pointer-events-none overflow-hidden rounded-sm border border-gold/40 bg-noir-950 shadow-2xl"
        >
          <div className="relative bg-noir-800" style={{ height: PREVIEW_H }}>
            {hover.item.kind === "gradient" ? (
              <div className="h-full w-full" style={{ background: gradientCss(hover.item.value) }} />
            ) : (
              <img
                src={assetUrl(hover.item.kind === "upload" ? hover.item.src : hover.item.value)}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="truncate bg-noir-950 px-2 py-1 font-type text-[10px] text-paper/80">{hover.item.label}</div>
        </div>
      )}
    </div>
  );
}
