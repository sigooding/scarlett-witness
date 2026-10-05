import { useEffect, useMemo, useRef, useState } from "react";
import builtinImages from "virtual:builtin-images";
import { useAllAssets } from "../data/mediaLibrary";
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

type ItemKind = "gradient" | "builtin" | "upload";
type Item = { kind: ItemKind; value: string; label: string; src?: string };

const isGradient = (v?: string) => !!v && v.startsWith("gradient:");
const gradientCss = (v: string) => v.slice("gradient:".length);

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
 * Image browser for the Studio. Replaces the cramped native <select> with a
 * searchable dropdown over EVERY available image — all built-in art shipped in
 * /img (via the `virtual:builtin-images` plugin), every uploaded image in the
 * global library, and the gradient presets. Rolling the pointer over any entry
 * pops a large preview so you can actually see what you're choosing.
 *
 * Stores stable values: `/img/…` paths for built-ins, `asset:<id>` (or the data
 * URL when returnReference is false) for uploads, and `gradient:…` for the
 * presets — so saves and exports stay compact and never break on rebuild.
 */
export function ImagePicker({
  value,
  onChange,
  storyId: _storyId,
  includeBuiltins = true,
  includeGradients = true,
  allowClear = true,
  /** for uploads, store `asset:<id>` (default) instead of the data URL */
  returnReference = true,
  placeholder = "Pick an image…",
  preferFolder,
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
  /** kept for call-site compatibility; uploads are read from the global library */
  storyId?: string;
  includeBuiltins?: boolean;
  includeGradients?: boolean;
  allowClear?: boolean;
  returnReference?: boolean;
  placeholder?: string;
  /** library folder whose uploads sort to the very top (e.g. "sprites") */
  preferFolder?: string;
}) {
  const uploads = useAllAssets("image");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hover, setHover] = useState<{ item: Item; rect: DOMRect } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

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
    }
  }, [open]);

  const items: Item[] = useMemo(() => {
    const out: Item[] = [];
    if (includeGradients) for (const g of GRADIENT_PRESETS) out.push({ kind: "gradient", ...g });
    if (includeBuiltins) for (const b of builtinImages) out.push({ kind: "builtin", value: b.url, label: b.label });
    for (const a of [...uploads].sort((x, y) => {
      // preferred folder first, then other folders A→Z, then unfiled
      const rank = (a2: typeof x) => (preferFolder && a2.folder === preferFolder ? "" : a2.folder ?? "\uffff");
      return rank(x).localeCompare(rank(y)) || x.name.localeCompare(y.name);
    }))
      out.push({
        kind: "upload",
        value: returnReference ? `asset:${a.id}` : a.dataUrl,
        label: a.folder ? `📁 ${a.folder} / ${a.name}` : a.name,
        src: a.dataUrl,
      });
    return out;
  }, [includeGradients, includeBuiltins, uploads, returnReference, preferFolder]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.label.toLowerCase().includes(q) || it.value.toLowerCase().includes(q));
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
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${inputCls} flex items-center gap-2 text-left`}
        title={value ?? ""}
      >
        {current ? (
          <>
            <Swatch kind={current.kind} value={current.value} src={current.src} className="h-5 w-8 shrink-0 rounded-sm border border-noir-600" />
            <span className="min-w-0 flex-1 truncate text-paper/85">{current.label}</span>
          </>
        ) : (
          <span className="flex-1 text-paper/40">{placeholder}</span>
        )}
        <span className="shrink-0 text-paper/40">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[16rem] border border-noir-600 bg-noir-950 shadow-2xl">
          <div className="border-b border-noir-700 p-1">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Filter ${items.length} images…`}
              className={`${inputCls} border-noir-700`}
            />
          </div>
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
            {filtered.length === 0 && (
              <p className="px-3 py-2 font-type text-[10px] text-paper/40">No images match “{query}”.</p>
            )}
            {filtered.map((it) => {
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
            Hover any image to preview · {builtinImages.length} built-in · {uploads.length} uploaded
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
