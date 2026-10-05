import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaAsset, AssetType } from "../types";
import {
  loadAssets, deleteAsset, uploadAsset, subscribeAssets, useAllAssets,
  setAssetFolder, getAssetLimits, setAssetLimits, assetLimitsAreCustom,
  DEFAULT_ASSET_LIMITS, ASSET_LIMIT_CEILING, type AssetLimits,
} from "../data/mediaLibrary";
import { listVoiceFilesForCharacter, voiceSlug, type VoiceFileEntry } from "./voiceFiles";
import { ImagePicker } from "./ImagePicker";
import builtinAudio from "virtual:builtin-audio";
import { assetUrl } from "../assetPath";

const inputCls = "w-full border border-noir-600 bg-noir-950 px-2 py-1 text-xs text-paper focus:border-neon outline-none";

/* ------------------------------------------------------------------ */
/*  ⚙ Upload limits — the caps are defaults, not laws.                 */
/*                                                                     */
/*  The shipped ceilings suit a browser-stored, shareable draft. They  */
/*  are the wrong ceilings for a desktop author with big painted       */
/*  plates or source-resolution sheets, so they are editable here.     */
/*  Stored per-machine (localStorage), never in the story file.        */
/* ------------------------------------------------------------------ */
function LimitsEditor({ usedBytes, onChanged }: { usedBytes: number; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [limits, setLimits] = useState<AssetLimits>(() => getAssetLimits());
  const custom = assetLimitsAreCustom();
  const toMB = (n: number) => Math.round((n / 1024 / 1024) * 10) / 10;
  const ceilingMB = Math.round(ASSET_LIMIT_CEILING / 1024 / 1024);

  const apply = (key: keyof AssetLimits, mb: number) => {
    const bytes = Math.max(1, mb) * 1024 * 1024;
    setLimits(setAssetLimits({ [key]: bytes } as Partial<AssetLimits>));
    onChanged();
  };

  const rows: { key: keyof AssetLimits; label: string }[] = [
    { key: "image", label: "Images" },
    { key: "audio", label: "Audio" },
    { key: "video", label: "Video" },
    { key: "total", label: "Whole library" },
  ];

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-pulp text-[9px] uppercase tracking-widest text-paper/50 hover:text-gold"
      >
        ⚙ limits {custom && <span className="text-gold">· customised</span>} {open ? "▲" : "▼"}
      </button>

      {open && (
        <div className="mt-1 space-y-1.5 border border-gold/25 bg-noir-950/60 p-2">
          <p className="font-type text-[9px] leading-snug text-paper/50">
            These caps are <b>defaults, not hard limits</b> — raise them if you work with big art. They exist because a
            browser draft keeps every asset in IndexedDB, and an exported <code>.reel.json</code> embeds them as base64,
            which adds about a third to the size. Bigger library = slower saves and a bulkier file to share. The desktop
            app copies uploads to a real folder, so it tolerates far more. Saved on this machine only, never in the story.
          </p>
          {rows.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 font-type text-[9px] text-paper/70">
              <span className="w-24 shrink-0">{label}</span>
              <input
                type="range"
                min={1}
                max={key === "total" ? ceilingMB : Math.round(ceilingMB / 2)}
                step={1}
                value={toMB(limits[key])}
                onChange={(e) => apply(key, Number(e.target.value))}
                className="w-40 accent-gold"
              />
              <input
                type="number"
                min={1}
                max={ceilingMB}
                value={toMB(limits[key])}
                onChange={(e) => apply(key, Number(e.target.value) || 1)}
                className="w-16 border border-noir-600 bg-noir-950 px-1 py-0.5 text-right text-[9px] text-paper/80"
              />
              <span className="text-paper/40">MB</span>
              {limits[key] !== DEFAULT_ASSET_LIMITS[key] && (
                <span className="text-[8px] text-gold/70">default {toMB(DEFAULT_ASSET_LIMITS[key])}MB</span>
              )}
            </label>
          ))}
          {usedBytes > limits.total && (
            <p className="border border-crimson/40 bg-crimson/10 px-2 py-1 font-type text-[9px] text-crimson">
              ⚠ This library already holds {(usedBytes / 1024 / 1024).toFixed(1)}MB, which is over the cap you just set.
              Nothing has been deleted — but new uploads are blocked until you raise the cap or remove some files.
            </p>
          )}
          <button
            type="button"
            disabled={!custom}
            onClick={() => {
              setLimits(setAssetLimits(undefined));
              onChanged();
            }}
            className="border border-noir-600 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/60 hover:border-gold/60 hover:text-gold disabled:opacity-30"
          >
            ⟲ restore defaults
          </button>
        </div>
      )}
    </div>
  );
}

/** Live-updating list of assets for one story. Refreshes whenever anything
 * (this component, an inline upload button, another dropdown) changes the
 * library, without needing prop drilling or manual refresh calls. */
export function useAssetList(storyId: string, assetType?: AssetType) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      loadAssets(storyId).then((all) => {
        if (cancelled) return;
        setAssets(assetType ? all.filter((a) => a.type === assetType) : all);
      });
    };
    refresh();
    const unsubscribe = subscribeAssets(storyId, refresh);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [storyId, assetType]);

  return assets;
}

/** Reusable direct-upload button used next to any media field in Studio.
 * Uploads immediately apply to the field AND register in the shared library
 * so the same file is reusable from every dropdown afterward. */
export function MediaUploadButton({
  storyId,
  accept,
  label,
  onUploaded,
}: {
  storyId: string;
  accept: "audio/*" | "video/*" | "image/*";
  label: string;
  onUploaded: (url: string, assetId: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <label
      className={`flex shrink-0 items-center justify-center gap-1 cursor-pointer border border-cyan-neon/40 px-3 py-1 font-pulp text-[10px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10 ${
        busy ? "pointer-events-none opacity-50" : ""
      }`}
    >
      {busy ? "⏳ Uploading…" : label}
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          const result = await uploadAsset(storyId, file);
          setBusy(false);
          if (!result.success || !result.url || !result.assetId) {
            window.alert(result.error ?? "Upload failed.");
            return;
          }
          onUploaded(result.url, result.assetId);
        }}
      />
    </label>
  );
}

/** Dropdown of previously uploaded assets of one type, with a live preview of
 * whichever one is currently selected so authors can confirm it's the right
 * file before leaving the field.
 *
 * Reads the GLOBAL library (every asset of this type, across all stories) so
 * any image/audio/video is reachable from every pulldown — matching the scene
 * Background dropdown. Previously this was scoped to a single story, which is
 * why a background image you'd already used wouldn't show up in the foreground,
 * beat-background, avatar and other pickers. `storyId` is kept in the prop type
 * for call-site compatibility but is intentionally unused here. */
export function AssetDropdown({
  assetType,
  value,
  onChange,
  placeholder,
  returnReference = false,
  preferFolder,
}: {
  storyId?: string;
  assetType: AssetType;
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  /** return `asset:<id>` instead of a large data URL (for localStorage config) */
  returnReference?: boolean;
  /** library folder to surface first in the image browser */
  preferFolder?: string;
}) {
  const assets = useAllAssets(assetType);
  // Images get the rich browser: every built-in /img asset + all uploads +
  // gradient presets, with a rollover preview. Audio/video keep the compact
  // native select (with inline playback) below.
  if (assetType === "image") {
    return (
      <ImagePicker
        value={value}
        onChange={onChange}
        includeBuiltins
        includeGradients={false}
        allowClear
        returnReference={returnReference}
        placeholder={placeholder ?? "Pick an image…"}
        preferFolder={preferFolder}
      />
    );
  }
  const selected = assets.find((a) => a.dataUrl === value || `asset:${a.id}` === value);

  return (
    <div className="space-y-1">
      <select className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value || undefined)}>
        <option value="">{placeholder ?? `Select uploaded ${assetType}...`}</option>
        {assets.map((asset) => (
          <option key={asset.id} value={returnReference ? `asset:${asset.id}` : asset.dataUrl}>
            {asset.name} ({(asset.size / 1024).toFixed(0)}KB)
          </option>
        ))}
      </select>
      {selected && assetType === "audio" && <audio controls src={selected.dataUrl} className="h-8 w-full" />}
      {selected && assetType === "video" && <video controls src={selected.dataUrl} className="h-24 w-full object-cover" />}
      {!assets.length && <p className="font-type text-[9px] text-paper/35">No {assetType} uploaded yet — use Upload above or the 🛠 Media Tools tab.</p>}
    </div>
  );
}

/** Every audio file a beat can use, in one picker:
 *
 *  - the character's own takes from `voices/<person>/<scene>/` — read live from
 *    the desktop voices folder (IPC) or the author's linked folder, merged with
 *    the build-time scan of `public/`, so the list also works in the browser
 *    preview where neither a bridge nor a linked folder exists;
 *  - then every other audio file in the project (imports, music, other
 *    characters), so nothing sitting on disk is unreachable.
 *
 *  Hovering a file name auditions it through one shared hidden <audio> element
 *  (the same interaction as the image picker); clicking assigns it. Nothing
 *  plays until you hover, and moving the pointer out of the list stops it. */
export function CharacterVoiceFiles({
  characterId,
  characterName,
  value,
  onChange,
}: {
  characterId: string;
  characterName?: string;
  value?: string;
  onChange: (url: string) => void;
}) {
  const [files, setFiles] = useState<VoiceFileEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [liveNote, setLiveNote] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [hovered, setHovered] = useState<{ url: string; label: string } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const allAudio = useAllAssets("audio");

  /** Re-read the live voices folder (desktop IPC / linked folder). */
  const refresh = useCallback(async () => {
    if (!characterId || characterId === "narrator") {
      setFiles([]);
      setLiveNote(null);
      return;
    }
    setBusy(true);
    try {
      const list = await listVoiceFilesForCharacter(characterId);
      setFiles(list);
      setLiveNote(list.length ? null : "Live folder empty — showing what the build scanned from public/.");
    } catch (err) {
      setLiveNote((err as Error).message);
    } finally {
      setBusy(false);
    }
  }, [characterId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Never leave audio playing behind when the beat collapses or unmounts.
  useEffect(() => () => audioRef.current?.pause(), []);

  const who = characterName?.trim() || characterId;
  const person = characterId && characterId !== "narrator" ? voiceSlug(characterId) : "";

  /** A URL this browser can actually play: public paths need the deploy base,
   *  `asset:` references resolve through the library, file:// is desktop-only. */
  const playable = useCallback(
    (url: string): string | undefined => {
      if (!url) return undefined;
      if (url.startsWith("data:") || url.startsWith("http")) return url;
      if (url.startsWith("asset:")) return allAudio.find((a) => `asset:${a.id}` === url)?.dataUrl;
      if (url.startsWith("/")) return assetUrl(url);
      return undefined;
    },
    [allAudio]
  );

  /** Hover a name to audition it — no assignment, no commitment. */
  const audition = useCallback(
    (row: { url: string; label: string } | null) => {
      setHovered(row);
      const el = audioRef.current;
      if (!el) return;
      const src = row ? playable(row.url) : undefined;
      if (!src) {
        el.pause();
        return;
      }
      el.src = src;
      el.currentTime = 0;
      void el.play().catch(() => {
        /* autoplay policy — the click-to-assign still works */
      });
    },
    [playable]
  );

  // This character's takes: live folder first (freshest), then the build scan.
  const seen = new Set<string>();
  const mine: { url: string; label: string }[] = [];
  for (const f of files) {
    if (seen.has(f.url)) continue;
    seen.add(f.url);
    mine.push({ url: f.url, label: `${f.scene}/${f.name}${f.size ? ` (${(f.size / 1024).toFixed(0)}KB)` : ""}` });
  }
  for (const a of builtinAudio) {
    if (a.person !== person || seen.has(a.url)) continue;
    seen.add(a.url);
    mine.push({ url: a.url, label: `${a.scene}/${a.label}` });
  }
  // Everything else in the project, so no audio file is hidden from the picker.
  const others = builtinAudio
    .filter((a) => a.person !== person && !seen.has(a.url))
    .map((a) => ({ url: a.url, label: `${a.folder ? `${a.folder}/` : ""}${a.label}` }));

  const q = query.trim().toLowerCase();
  const matches = (row: { url: string; label: string }) => !q || row.label.toLowerCase().includes(q) || row.url.toLowerCase().includes(q);
  const mineShown = mine.filter(matches);
  const othersShown = others.filter(matches);

  const row = (r: { url: string; label: string }) => {
    const active = value === r.url;
    return (
      <button
        key={r.url}
        type="button"
        title={r.url}
        onMouseEnter={() => audition(r)}
        onFocus={() => audition(r)}
        onClick={() => {
          audition(r);
          onChange(r.url);
        }}
        className={`flex w-full items-center gap-1.5 px-2 py-0.5 text-left font-type text-[9px] ${
          active ? "bg-cyan-neon/15 text-cyan-neon" : "text-paper/75 hover:bg-noir-800"
        }`}
      >
        <span className="w-2 shrink-0 text-[8px]">{active ? "\u2713" : "\u25b6"}</span>
        <span className="min-w-0 flex-1 truncate">{r.label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-1">
      {/* one shared player for every hover audition */}
      <audio ref={audioRef} preload="none" className="hidden" />
      <div className="flex items-center justify-between gap-1">
        <span className="font-pulp text-[8px] uppercase tracking-widest text-cyan-neon/80" title={person ? `Files under voices/${person}/ plus every other audio file in the project` : "Every audio file in this project"}>
          \ud83d\udcc2 Audio for {who} \u00b7 {mine.length + others.length} files
        </span>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={busy}
          title="Re-scan the voices folder"
          className="border border-noir-600 px-1.5 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/60 hover:border-cyan-neon/50 hover:text-cyan-neon disabled:opacity-40"
        >
          {busy ? "\u23f3" : "\u21bb"}
        </button>
      </div>
      <input
        className={inputCls}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter by name or folder\u2026"
      />
      <div className="border border-noir-700 bg-noir-950" onMouseLeave={() => audition(null)}>
        <div className="max-h-52 overflow-auto py-1">
          {!mineShown.length && !othersShown.length && (
            <p className="px-2 py-1.5 font-type text-[9px] text-paper/40">
              {mine.length + others.length ? `No audio matches \u201c${query}\u201d.` : "No audio files found \u2014 upload one above, or drop files into public/ and rebuild."}
            </p>
          )}
          {mineShown.length > 0 && (
            <>
              <div className="sticky top-0 z-10 bg-noir-900 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-cyan-neon/70">
                \ud83c\udf99 {who} \u2014 voices/{person} ({mineShown.length})
              </div>
              {mineShown.map(row)}
            </>
          )}
          {othersShown.length > 0 && (
            <>
              <div className="sticky top-0 z-10 bg-noir-900 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/45">
                \ud83d\udcc1 All other audio ({othersShown.length})
              </div>
              {othersShown.map(row)}
            </>
          )}
        </div>
        <div className="border-t border-noir-700 px-2 py-1 font-type text-[9px] text-paper/35">
          {hovered ? `\u25b6 auditioning ${hovered.label}` : "Hover a name to audition it \u00b7 click to use it"}
        </div>
      </div>
      {liveNote && <p className="font-type text-[9px] leading-snug text-paper/40">{liveNote}</p>}
    </div>
  );
}

export function MediaLibrary({ storyId }: { storyId: string }) {
  const assets = useAssetList(storyId);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    for (const file of Array.from(files)) {
      const result = await uploadAsset(storyId, file);
      if (!result.success) {
        setError(result.error ?? "Upload failed");
        break;
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm("Delete this asset? Any scene still pointing at it will need a new file selected.")) return;
    await deleteAsset(storyId, assetId);
  };

  const totalSize = assets.reduce((sum, a) => sum + a.size, 0);
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
  // Re-read on every limits change so the header reflects the live cap.
  const [, setLimitsTick] = useState(0);
  const liveLimits = getAssetLimits();
  const totalLimitMB = (liveLimits.total / 1024 / 1024).toFixed(0);
  const usedPct = Math.min(100, (totalSize / liveLimits.total) * 100);

  const groups: { type: AssetType; icon: string; label: string }[] = [
    { type: "audio", icon: "🎵", label: "Audio" },
    { type: "video", icon: "🎥", label: "Video" },
    { type: "image", icon: "🖼️", label: "Images" },
  ];

  return (
    <div className="space-y-4">
      <div className="border border-gold/40 bg-gold/5 p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-pulp text-[11px] uppercase tracking-widest text-gold">🛠 Media Tools — Library</div>
          <div className="font-type text-[10px] text-paper/60">
            <span className={usedPct > 90 ? "text-crimson" : usedPct > 70 ? "text-gold" : undefined}>
              {totalSizeMB}MB
            </span>{" "}
            / {totalLimitMB}MB used
          </div>
        </div>

        <label className="flex items-center justify-center cursor-pointer border border-cyan-neon/40 px-4 py-2 font-pulp text-[11px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10">
          {uploading ? "⏳ Uploading..." : "⇧ Upload Files"}
          <input type="file" multiple accept="audio/*,video/*,image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>

        {error && <div className="mt-2 border border-crimson/40 bg-crimson/10 p-2 font-type text-[10px] text-crimson">⚠ {error}</div>}

        {/* Usage bar — the ceiling should never arrive as a surprise. */}
        <div className="mt-2 h-1 w-full bg-noir-800">
          <div
            className={`h-full transition-all ${usedPct > 90 ? "bg-crimson" : usedPct > 70 ? "bg-gold" : "bg-cyan-neon/70"}`}
            style={{ width: `${Math.max(usedPct, totalSize > 0 ? 1 : 0)}%` }}
          />
        </div>

        <p className="mt-2 font-type text-[9px] text-paper/45">
          Audio up to {(liveLimits.audio / 1024 / 1024).toFixed(0)}MB, video up to {(liveLimits.video / 1024 / 1024).toFixed(0)}MB, images up to{" "}
          {(liveLimits.image / 1024 / 1024).toFixed(0)}MB. In the desktop app, uploads are copied into the game media folder automatically; in browsers they are stored in IndexedDB.
        </p>

        <LimitsEditor usedBytes={totalSize} onChanged={() => setLimitsTick((t) => t + 1)} />
      </div>

      {groups.map(({ type, icon, label }) => {
        const items = assets.filter((a) => a.type === type);
        if (!items.length) return null;
        return (
          <div key={type} className="border border-noir-600 p-2">
            <div className="mb-2 font-pulp text-[10px] uppercase tracking-widest text-cyan-neon">
              {icon} {label} ({items.length})
            </div>
            <div className="space-y-2">
              {/* folders first (sprites etc.), then unfiled — so generated
                  sheets/cutouts are always easy to find again */}
              {[...new Set(items.map((a) => a.folder ?? ""))]
                .sort((a, b) => (a === "" ? 1 : b === "" ? -1 : a.localeCompare(b)))
                .map((folder) => (
                  <div key={folder || "(unfiled)"} className="space-y-1">
                    <div className="font-pulp text-[9px] uppercase tracking-widest text-amber-300/80">
                      {folder ? `📁 ${folder}` : items.some((a) => a.folder) ? "📄 unfiled" : null}
                    </div>
                    {items
                      .filter((a) => (a.folder ?? "") === folder)
                      .map((asset) => (
                        <div key={asset.id} className="border border-noir-700 bg-noir-900/50 p-1.5">
                          <div className="flex items-center gap-2">
                            {type === "image" && <img src={asset.dataUrl} alt={asset.name} className="h-8 w-8 shrink-0 object-cover" />}
                            <span className="flex-1 truncate font-type text-[10px] text-paper/80">{asset.name}</span>
                            <select
                              className="w-20 shrink-0 border border-noir-600 bg-noir-950 px-1 py-0.5 font-type text-[8px] text-paper/60"
                              value={asset.folder ?? ""}
                              title="Move to folder"
                              onChange={(e) => {
                                const v = e.target.value;
                                if (v === "__new__") {
                                  const name = prompt("New folder name:")?.trim();
                                  if (name) void setAssetFolder(storyId, asset.id, name);
                                } else void setAssetFolder(storyId, asset.id, v || undefined);
                              }}
                            >
                              <option value="">unfiled</option>
                              {[...new Set(assets.map((a) => a.folder).filter(Boolean))].map((f) => (
                                <option key={f} value={f}>📁 {f}</option>
                              ))}
                              <option value="__new__">+ new folder…</option>
                            </select>
                            <span className="shrink-0 font-type text-[9px] text-paper/40">
                              {asset.size > 1024 * 1024 ? `${(asset.size / 1024 / 1024).toFixed(1)}MB` : `${(asset.size / 1024).toFixed(0)}KB`}
                            </span>
                            <button onClick={() => handleDelete(asset.id)} className="shrink-0 text-[10px] text-crimson hover:underline">
                              Delete
                            </button>
                          </div>
                          {type === "audio" && <audio controls src={asset.dataUrl} className="mt-1 h-8 w-full" />}
                          {type === "video" && <video controls src={asset.dataUrl} className="mt-1 h-28 w-full object-cover" />}
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          </div>
        );
      })}

      {assets.length === 0 && (
        <div className="border border-noir-600 p-4 text-center font-type text-[11px] text-paper/45">
          No media uploaded yet. Upload audio, video, or images to use in your story.
        </div>
      )}
    </div>
  );
}
