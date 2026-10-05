import { useEffect, useMemo, useRef, useState } from "react";
import type { MeterKey, Story } from "../types";
import { buildDeepLink, METER_NAMES, parseDeepLink, resolveDeepLink } from "../game/deepLink";
import { collectFlags } from "../logic";

/* ------------------------------------------------------------------ */
/*  Studio ▶ Test tab: 🔗 Branch link.                                 */
/*                                                                     */
/*  Studio's Playtester fakes a world state in the INSPECTOR. This      */
/*  builds a URL that fakes the same state in the REAL RUNTIME — full   */
/*  screen, real audio, real cinematics. The difference between "the    */
/*  gate should open" and watching the gate open, and the cheapest way  */
/*  to hand a collaborator one specific branch.                        */
/* ------------------------------------------------------------------ */

function Chip({ on, label, onClick, title }: { on: boolean; label: string; onClick: () => void; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      className={`max-w-[16rem] truncate border px-1.5 py-0.5 font-type text-[9px] ${
        on ? "border-cyan-neon/70 bg-cyan-neon/15 text-cyan-neon" : "border-noir-700 text-paper/50 hover:border-paper/40 hover:text-paper/80"
      }`}
    >
      {label}
    </button>
  );
}

export function DeepLinkBuilder({ story, selectedSceneId }: { story: Story; selectedSceneId?: string }) {
  const [sceneId, setSceneId] = useState<string>(selectedSceneId ?? "");
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<Set<string>>(new Set());
  const [meters, setMeters] = useState<Partial<Record<MeterKey, number>>>({});
  const [trust, setTrust] = useState<Record<string, number>>({});
  const [seed, setSeed] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const linkRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { setSceneId(selectedSceneId ?? ""); }, [selectedSceneId]);

  const storyFlags = useMemo(() => collectFlags(story), [story]);

  const toggle = <T,>(set: Set<T>, apply: (s: Set<T>) => void, v: T) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    apply(next);
    setCopied(false);
  };

  // The link is built from the same helper the parser round-trips, and then
  // resolved back against this story so the warnings shown here are exactly
  // the warnings the runtime will log on boot.
  const query = buildDeepLink({
    storyId: story.id,
    sceneId: sceneId || story.startSceneId,
    flags,
    items,
    meters,
    trust,
    ...(seed.trim() ? { seed: seed.trim() } : {}),
  });
  const origin = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "";
  const url = query ? `${origin}${query}` : origin;
  const preview = resolveDeepLink(story, parseDeepLink(query));
  const empty = !story.scenes.length;

  useEffect(() => {
    setCopied(false);
    setCopyError("");
  }, [url]);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timer);
  }, [copied]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopied(false);
      setCopyError("Clipboard unavailable — the link is selected. Press Ctrl/Cmd+C to copy.");
      linkRef.current?.focus();
      linkRef.current?.select();
    }
  };

  return (
    <div className="mt-3 space-y-2 border border-gold/30 bg-gold/5 p-2">
      <div className="font-pulp text-[10px] uppercase tracking-widest text-gold">🔗 Branch link</div>
      <p className="font-type text-[9px] leading-snug text-paper/45">
        A URL that boots the real game into a fabricated world state — a scene, flags, items, meters and trust. Send it to a
        collaborator to hand them one exact branch, or open it yourself to watch a gate open at full screen instead of
        checking it in the inspector. Unknown ids are ignored with a warning, never an error, and a link never touches your
        save slots or season progress.
      </p>

      {/* scene */}
      <label className="block space-y-1">
        <span className="font-pulp text-[9px] uppercase tracking-widest text-paper/60">Open on scene</span>
        <select
          value={sceneId}
          onChange={(e) => {
            setSceneId(e.target.value);
            setCopied(false);
          }}
          className="w-full border border-noir-600 bg-noir-950 px-1 py-0.5 font-type text-[10px] text-paper"
        >
          <option value="">(the story's start scene)</option>
          {story.scenes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title || s.id}
              {s.isEnding ? " · ending" : ""}
            </option>
          ))}
        </select>
      </label>

      {/* flags */}
      {storyFlags.length > 0 && (
        <div className="space-y-1">
          <span className="font-pulp text-[9px] uppercase tracking-widest text-paper/60">Flags set ({flags.size})</span>
          <div className="flex max-h-28 flex-wrap gap-1 overflow-auto border border-noir-700 bg-noir-950/60 p-1">
            {storyFlags.map((f) => (
              <Chip key={f} on={flags.has(f)} label={f.replace(/_/g, " ")} title={f} onClick={() => toggle(flags, setFlags, f)} />
            ))}
          </div>
        </div>
      )}

      {/* items */}
      {story.items.length > 0 && (
        <div className="space-y-1">
          <span className="font-pulp text-[9px] uppercase tracking-widest text-paper/60">Items held ({items.size})</span>
          <div className="flex max-h-24 flex-wrap gap-1 overflow-auto border border-noir-700 bg-noir-950/60 p-1">
            {story.items.map((i) => (
              <Chip key={i.id} on={items.has(i.id)} label={`${i.icon} ${i.name}`} title={i.id} onClick={() => toggle(items, setItems, i.id)} />
            ))}
          </div>
        </div>
      )}

      {/* meters */}
      <div className="space-y-1">
        <span className="font-pulp text-[9px] uppercase tracking-widest text-paper/60">Meters</span>
        <div className="grid grid-cols-2 gap-1">
          {METER_NAMES.map((m) => (
            <label key={m} className="flex items-center gap-1">
              <span className="w-16 font-type text-[9px] text-paper/55">{m}</span>
              <input
                type="number"
                min={0}
                max={10}
                value={meters[m] ?? ""}
                placeholder="—"
                onChange={(e) => {
                  const v = e.target.value === "" ? undefined : Number(e.target.value);
                  setMeters((prev) => {
                    const next = { ...prev };
                    if (v === undefined || !Number.isFinite(v)) delete next[m];
                    else next[m] = v;
                    return next;
                  });
                  setCopied(false);
                }}
                className="w-14 border border-noir-600 bg-noir-950 px-1 py-0.5 font-type text-[10px] text-paper"
              />
            </label>
          ))}
        </div>
      </div>

      {/* trust */}
      {story.characters.length > 0 && (
        <div className="space-y-1">
          <span className="font-pulp text-[9px] uppercase tracking-widest text-paper/60">Trust</span>
          <div className="grid max-h-28 grid-cols-2 gap-1 overflow-auto">
            {story.characters.map((c) => (
              <label key={c.id} className="flex items-center gap-1">
                <span className="w-20 truncate font-type text-[9px] text-paper/55" title={c.name}>
                  {c.name}
                </span>
                <input
                  type="number"
                  min={-5}
                  max={5}
                  value={trust[c.id] ?? ""}
                  placeholder="—"
                  onChange={(e) => {
                    const v = e.target.value === "" ? undefined : Number(e.target.value);
                    setTrust((prev) => {
                      const next = { ...prev };
                      if (v === undefined || !Number.isFinite(v)) delete next[c.id];
                      else next[c.id] = v;
                      return next;
                    });
                    setCopied(false);
                  }}
                  className="w-14 border border-noir-600 bg-noir-950 px-1 py-0.5 font-type text-[10px] text-paper"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* seed */}
      <label className="flex items-center gap-1">
        <span className="w-24 font-pulp text-[9px] uppercase tracking-widest text-paper/60">Seed</span>
        <input
          value={seed}
          placeholder="(live randomness)"
          onChange={(e) => {
            setSeed(e.target.value);
            setCopied(false);
          }}
          title="Pins every gameplay draw, so the branch replays identically for whoever opens the link"
          className="flex-1 border border-noir-600 bg-noir-950 px-1 py-0.5 font-type text-[10px] text-paper"
        />
      </label>

      {/* the link */}
      <div className="space-y-1">
        <textarea
          ref={linkRef}
          aria-label="Branch link URL"
          readOnly
          value={empty ? "(pick a scene or some state above)" : url}
          rows={2}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full resize-none break-all border border-noir-600 bg-noir-950 px-1 py-0.5 font-type text-[9px] text-paper/80"
        />
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={empty}
            onClick={copy}
            className="border border-gold/50 px-2 py-0.5 font-pulp text-[9px] uppercase tracking-widest text-gold disabled:opacity-40 hover:bg-gold/15"
          >
            {copied ? "✓ copied" : "copy link"}
          </button>
          <button
            type="button"
            disabled={empty}
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
            className="border border-cyan-neon/50 px-2 py-0.5 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon disabled:opacity-40 hover:bg-cyan-neon/15"
          >
            open it ▶
          </button>
          <button
            type="button"
            onClick={() => {
              setSceneId("");
              setFlags(new Set());
              setItems(new Set());
              setMeters({});
              setTrust({});
              setSeed("");
              setCopied(false);
            }}
            className="border border-noir-600 px-2 py-0.5 font-pulp text-[9px] uppercase tracking-widest text-paper/55 hover:border-crimson/60 hover:text-crimson"
          >
            clear
          </button>
        </div>
      </div>

      {copyError && <p role="status" className="font-type text-[10px] text-gold">{copyError}</p>}
      <p className="font-type text-[9px] text-paper/50">This link opens {story.title}. A collaborator needs the same reel imported; the link does not contain the game or its media.</p>
      {preview.warnings.length > 0 && (
        <div className="space-y-0.5 border border-gold/40 bg-gold/5 p-1">
          {preview.warnings.map((w) => (
            <div key={w} className="font-type text-[9px] text-gold/90">
              ⚠ {w}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
