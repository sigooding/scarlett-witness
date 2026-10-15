import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uploadAsset, useAllAssets, setAssetFolder } from "../data/mediaLibrary";
import { assetUrl } from "../assetPath";
import { inputCls } from "./studioLeaves";
import builtinAudio from "virtual:builtin-audio";

/**
 * SOUND BROWSER FOR THE STUDIO — the one sound box the beat's "sound effect on
 * this beat" and the scene's recorded ambience loops use.
 *
 * It lists EVERY sound the project ships, not just the ones already uploaded:
 * the film's one-shots and ambience (public/film/sfx — where all 166 of the
 * film's `sfxUrl` references live), its music cues and voice takes, the other
 * reels' audio, public/uploads, and your own uploads. The list comes from
 * tools/builtin-audio.mjs through the `virtual:builtin-audio` plugin, so a file
 * dropped into the repo is offered as soon as the dev server reloads.
 *
 * Point at a row to HEAR it (one shared <audio>, so nothing overlaps), click to
 * take it. The panel has a filter box (Enter takes the first match), a window of
 * 250 rows with "Show all" past it, an ⇧ Upload row (a picked upload is filed
 * under `uploadFolder` and stored as `asset:<id>`), and drop-a-file-on-the-box.
 *
 * Asking for a path that is not in the library is still possible: when the
 * filter text looks like a path or a URL, the panel offers to use it verbatim —
 * so a remote file or a folder the scan does not cover stays reachable.
 */

/** Rows built at once. The project has ~1,600 sounds; a filter keystroke over
 *  the whole list is cheap, but a 1,600-row panel is not, so the list opens as
 *  a window with a way to see the rest. */
const ROW_WINDOW = 250;

const isPathLike = (q: string) => /^(https?:|\/|data:|asset:|file:)/.test(q.trim());

export function AudioPicker({
  value,
  onChange,
  storyId,
  placeholder = "Pick a sound…",
  allowClear = true,
  allowUpload = true,
  uploadFolder,
  /** resolves `asset:<id>` / uploaded values to something playable */
  resolve,
  /** volume for the trigger's ▶ Test (the beat's own sfx volume) */
  testVolume = 1,
  /** aria-label prefix, so several pickers on one screen can be told apart */
  label,
}: {
  value?: string;
  onChange: (value: string | undefined) => void;
  storyId: string;
  placeholder?: string;
  allowClear?: boolean;
  allowUpload?: boolean;
  uploadFolder?: string;
  resolve?: (v?: string) => string | undefined;
  testVolume?: number;
  label?: string;
}) {
  const uploads = useAllAssets("audio");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showAllRows, setShowAllRows] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [dropHot, setDropHot] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      setQuery("");
      setShowAllRows(false);
      setNote(null);
      setDropHot(false);
      setPlaying(null);
      audioRef.current?.pause();
    }
  }, [open]);

  /** A URL the browser can actually play: an `asset:` reference needs the
   *  library, a `/…` path needs the deploy base (desktop builds ship under
   *  one). */
  const playable = useCallback(
    (url?: string): string | undefined => {
      if (!url && url !== "") return undefined;
      const resolved = resolve?.(url) ?? url;
      if (!resolved) return undefined;
      if (resolved.startsWith("data:") || resolved.startsWith("http")) return resolved;
      if (resolved.startsWith("asset:")) {
        return uploads.find((a) => `asset:${a.id}` === resolved)?.dataUrl ?? resolved;
      }
      if (resolved.startsWith("/")) return assetUrl(resolved);
      return resolved;
    },
    [resolve, uploads],
  );

  /** Play one URL (or stop with null) through the shared player, so auditions
   *  never stack on top of each other. */
  const play = useCallback(
    (url: string | null, volume: number) => {
      const el = audioRef.current;
      if (!el) return;
      if (!url) {
        el.pause();
        setPlaying(null);
        return;
      }
      const src = playable(url);
      if (!src) return;
      el.pause();
      el.src = src;
      el.currentTime = 0;
      el.volume = Math.min(1, Math.max(0, volume));
      setPlaying(url);
      void el.play().catch(() => {
        /* autoplay policy — clicking the row to take it still works */
      });
    },
    [playable],
  );

  /** Point at a row to hear it — no assignment, no commitment. */
  const audition = useCallback((url: string | null) => play(url, 0.85), [play]);

  type Row = { value: string; label: string; section: string; folder: string };
  const items = useMemo<Row[]>(() => {
    const out: Row[] = [];
    for (const a of [...uploads].sort((x, y) => x.name.localeCompare(y.name)))
      out.push({
        value: `asset:${a.id}`,
        label: a.folder ? `📁 ${a.folder} / ${a.name}` : a.name,
        section: "Your uploads",
        folder: a.folder ?? "",
      });
    for (const b of builtinAudio)
      out.push({
        value: b.url,
        label: b.scene ? `${b.scene}/${b.label}` : b.label,
        section: b.section,
        folder: b.folder,
      });
    return out;
  }, [uploads]);

  const { rows, matchCount, shownCount, windowedOut } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? items.filter((it) => it.label.toLowerCase().includes(q) || it.value.toLowerCase().includes(q)) : items;
    // A windowed list still shows what the field is set to.
    const windowed = !showAllRows && list.length > ROW_WINDOW;
    const shown = windowed ? list.slice(0, ROW_WINDOW) : list;
    const out: ({ kind: "header"; label: string } | { kind: "item"; item: Row })[] = [];
    let lastSection = "";
    const push = (it: Row) => {
      if (it.section !== lastSection) {
        out.push({ kind: "header", label: it.section });
        lastSection = it.section;
      }
      out.push({ kind: "item", item: it });
    };
    const picked = value ? list.find((it) => it.value === value) : undefined;
    if (picked && !shown.includes(picked)) push(picked);
    for (const it of shown) push(it);
    return { rows: out, matchCount: list.length, shownCount: shown.length, windowedOut: list.length - shown.length };
  }, [items, query, value, showAllRows]);

  const firstMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return items.find((it) => it.label.toLowerCase().includes(q) || it.value.toLowerCase().includes(q)) ?? null;
  }, [items, query]);

  /** What the field is set to, as a row: an upload, a scanned file, or a path
   *  the scan does not know (shown as it is, so nothing hides). */
  const current = useMemo<{ label: string; sub: string } | null>(() => {
    if (!value) return null;
    const up = uploads.find((a) => `asset:${a.id}` === value);
    if (up) return { label: up.name, sub: up.folder ? `upload · ${up.folder}` : "upload" };
    const bi = builtinAudio.find((b) => b.url === value);
    if (bi) return { label: bi.label, sub: bi.folder || "built-in" };
    if (value.startsWith("asset:")) return { label: "uploaded sound", sub: "asset" };
    return { label: value.split("/").pop() ?? value, sub: value.split("/").slice(0, -1).join("/") || "path" };
  }, [value, uploads]);

  const select = (next: string | undefined) => {
    onChange(next);
    setOpen(false);
  };

  /** Upload one file into the shared library. The panel stays open so the new
   *  sound is visible under "Your uploads" with a confirmation. */
  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("audio/") && !/\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name)) {
      setNote(`✕ “${file.name}” is not an audio file.`);
      return;
    }
    setBusy(true);
    setNote(null);
    const result = await uploadAsset(storyId, file);
    if (!result.success || !result.assetId) {
      setBusy(false);
      setNote(`✕ ${result.error ?? "Upload failed."}`);
      return;
    }
    if (uploadFolder) await setAssetFolder(storyId, result.assetId, uploadFolder);
    setBusy(false);
    setQuery("");
    onChange(`asset:${result.assetId}`);
    setNote(`✓ ${file.name} — picked and saved to the library${uploadFolder ? ` in “${uploadFolder}”` : ""}.`);
  };

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

  return (
    <div
      ref={wrapRef}
      className={`relative ${dropHot ? "outline outline-2 outline-dashed outline-cyan-neon/70" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={() => setDropHot(false)}
      onDrop={onDrop}
    >
      {/* One shared audition player — hover a row to hear it, nothing overlaps. */}
      <audio ref={audioRef} preload="none" className="hidden" onEnded={() => setPlaying(null)} />
      <div className="flex items-stretch gap-1">
        <button
          type="button"
          aria-label={label ? `${label} — browse every sound` : undefined}
          onClick={() => setOpen((o) => !o)}
          className={`${inputCls} flex min-w-0 flex-1 items-center gap-2 text-left`}
          title={
            allowUpload
              ? `${value ?? ""} — click to browse every sound the project ships, or drop a file here to upload`.trim()
              : value ?? ""
          }
        >
          {current ? (
            <>
              <span className="shrink-0 text-[10px] text-cyan-neon">♪</span>
              <span className="min-w-0 flex-1 truncate text-paper/85">{current.label}</span>
              <span className="hidden shrink-0 font-type text-[8px] text-paper/35 sm:inline">{current.sub}</span>
            </>
          ) : (
            <span className="flex-1 text-paper/40">{placeholder}</span>
          )}
          {busy && <span className="shrink-0 text-[10px] text-cyan-neon">⏳</span>}
          <span className="shrink-0 text-paper/40">{open ? "▴" : "▾"}</span>
        </button>
        {current && (
          <button
            type="button"
            className="shrink-0 border border-cyan-neon/40 px-2 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
            title="Hear it exactly as the game will play it, at this beat's volume"
            onClick={() => play(value ?? null, testVolume)}
          >
            ▶ Test
          </button>
        )}
        {allowClear && current && (
          <button
            type="button"
            className="shrink-0 border border-crimson/40 px-2 font-pulp text-[9px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
            title="Clear this sound"
            onClick={() => onChange(undefined)}
          >
            ✕
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[20rem] border border-noir-600 bg-noir-950 shadow-2xl">
          {allowUpload && (
            <div className="border-b border-noir-700 p-1">
              <button
                type="button"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
                className={`w-full border border-cyan-neon/50 px-2 py-1 font-pulp text-[10px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10 ${
                  busy ? "pointer-events-none opacity-50" : ""
                }`}
                title={uploadFolder ? `Upload a sound and file it under “${uploadFolder}”` : "Upload a sound into the library and pick it"}
              >
                {busy ? "⏳ Uploading…" : "⇧ Upload a sound…"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="audio/*"
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
              aria-label={label ? `${label} — filter sounds` : "Filter sounds"}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (firstMatch) select(firstMatch.value);
                  else if (isPathLike(query)) select(query.trim());
                }
              }}
              placeholder={`Filter ${items.length} sounds…`}
              className={`${inputCls} border-noir-700`}
            />
          </div>
          <div
            className="max-h-72 overflow-auto overscroll-contain py-1"
            onMouseLeave={() => audition(null)}
          >
            {allowClear && (
              <button
                type="button"
                onClick={() => select(undefined)}
                className="flex w-full items-center gap-2 px-2 py-1 text-left text-xs text-paper/50 hover:bg-noir-800"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-dashed border-noir-600 text-[8px]">
                  ✕
                </span>
                <span>— None —</span>
              </button>
            )}
            {matchCount === 0 && (
              <p className="px-3 py-2 font-type text-[10px] text-paper/40">
                No sounds match “{query}”. {isPathLike(query) ? "Press Enter to use it as it is." : allowUpload ? "Use ⇧ Upload above to add it." : ""}
              </p>
            )}
            {rows.map((row, rowIndex) =>
              row.kind === "header" ? (
                <div
                  key={`h:${rowIndex}:${row.label}`}
                  className="sticky top-0 bg-noir-950/95 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/40"
                >
                  {row.label}
                </div>
              ) : (
                <button
                  key={row.item.value}
                  type="button"
                  title={`${row.item.value} — point here to hear it, click to take it`}
                  onMouseEnter={() => audition(row.item.value)}
                  onFocus={() => audition(row.item.value)}
                  onClick={() => select(row.item.value)}
                  className={`flex w-full items-center gap-2 px-2 py-0.5 text-left font-type text-[10px] ${
                    value === row.item.value ? "bg-cyan-neon/15 text-cyan-neon" : "text-paper/75 hover:bg-noir-800"
                  }`}
                >
                  {/* aria-hidden: the row's accessible name is the sound's
                      name, not the glyph in front of it. */}
                  <span aria-hidden className="w-3 shrink-0 text-center text-[9px]">
                    {value === row.item.value ? "✓" : playing === row.item.value ? "♪" : "▶"}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{row.item.label}</span>
                </button>
              ),
            )}
            {isPathLike(query) && (
              <button
                type="button"
                onClick={() => select(query.trim())}
                className="mt-1 flex w-full items-center gap-2 border-t border-noir-700 px-2 py-1 text-left font-type text-[10px] text-gold/90 hover:bg-noir-800"
                title="Store this path or URL exactly as typed"
              >
                <span className="w-3 shrink-0 text-center text-[9px]">⏎</span>
                <span className="min-w-0 flex-1 truncate">Use “{query.trim()}” as it is</span>
              </button>
            )}
          </div>
          {windowedOut > 0 && (
            <div className="flex items-center gap-2 border-t border-noir-700 bg-noir-900/60 px-2 py-1 font-type text-[9px] text-paper/60">
              <span>
                Showing {shownCount} of {matchCount} — type to narrow
              </span>
              <button
                type="button"
                onClick={() => setShowAllRows(true)}
                className="ml-auto shrink-0 border border-noir-600 px-1.5 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/70 hover:border-gold/60 hover:text-gold"
              >
                Show all {matchCount}
              </button>
            </div>
          )}
          <div className="border-t border-noir-700 px-2 py-1 font-type text-[9px] text-paper/35">
            Point at a name to hear it · Enter takes the first match · {builtinAudio.length} built-in · {uploads.length} uploaded
            {testVolume !== 1 && ` · plays at ${Math.round(testVolume * 100)}% in the game`}
          </div>
        </div>
      )}
    </div>
  );
}
