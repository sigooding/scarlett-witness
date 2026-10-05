import { useEffect, useMemo, useState } from "react";
import { uid } from "../logic";
import { scenesInAct } from "../game/routeGraph";
import { useResolvedMedia } from "../data/mediaLibrary";
import { AssetDropdown, MediaUploadButton } from "./MediaLibrary";
import { assetBackground, assetUrl } from "../assetPath";
import type { Act, Story } from "../types";

const inputCls =
  "w-full border border-noir-600 bg-noir-950 px-2 py-1 text-xs text-paper focus:border-neon outline-none";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block text-[10px] uppercase tracking-wider text-paper/50">
      {label}
      <div className="mt-0.5 normal-case tracking-normal">{children}</div>
      {hint && <p className="mt-0.5 font-type text-[9px] normal-case tracking-normal text-paper/35">{hint}</p>}
    </label>
  );
}

function mediaField(v?: string): string {
  if (!v) return "";
  if (v.startsWith("data:") || v.startsWith("asset:") || v.startsWith("video:asset:")) return "";
  return v;
}

/** Ribbon colours, matched to the act tint on the canvas nodes so the panel
 *  and the graph read as the same structure. */
export const ACT_TINTS = [
  { ring: "border-gold/70", chip: "bg-gold/15 text-gold", dot: "#e8b647" },
  { ring: "border-cyan-neon/70", chip: "bg-cyan-neon/15 text-cyan-neon", dot: "#2ad9d9" },
  { ring: "border-neon/70", chip: "bg-neon/15 text-neon", dot: "#ff2d95" },
  { ring: "border-emerald-400/70", chip: "bg-emerald-400/15 text-emerald-300", dot: "#34d399" },
  { ring: "border-orange-400/70", chip: "bg-orange-400/15 text-orange-300", dot: "#fb923c" },
];

/**
 * Acts tab — the structural spine of a single continuous case.
 *
 * The load-bearing idea, and the thing this panel exists to make visible:
 * act membership is DERIVED, never assigned. An act owns every scene
 * reachable by choice edges from its start scene, stopping at the next
 * act's start. Authors nominate only where an act BEGINS; the graph decides
 * the rest, so the structure can never drift from the story the player
 * actually walks.
 *
 * The cost of that is invisibility — one link across a boundary silently
 * merges two acts. So this panel always shows the live scene count and
 * lists exactly which scenes each act claims.
 */
export function ActEditor({
  story,
  onUpdate,
  onSelectScene,
}: {
  story: Story;
  onUpdate: (next: Story) => void;
  onSelectScene: (sceneId: string) => void;
}) {
  const acts = useMemo(() => story.acts ?? [], [story.acts]);
  const resolveMedia = useResolvedMedia(story.id);
  const [openId, setOpenId] = useState<string | null>(acts[0]?.id ?? null);
  // If the act being viewed was removed (delete / reorder), fall back to the
  // first act so the panel never points at a ghost.
  useEffect(() => {
    if (openId && !acts.some((a) => a.id === openId)) setOpenId(acts[0]?.id ?? null);
  }, [acts, openId]);

  // Live containment, recomputed from the graph on every edit.
  const owned = useMemo(() => {
    const m = new Map<string, Set<string>>();
    acts.forEach((a) => m.set(a.id, scenesInAct(story, a.id)));
    return m;
  }, [story, acts]);

  const claimed = useMemo(() => {
    const all = new Set<string>();
    owned.forEach((set) => set.forEach((id) => all.add(id)));
    return all;
  }, [owned]);

  // sceneId -> the first act that owns it, so the "Opens at" picker can tell
  // the author which act a candidate scene currently lives in.
  const ownerOf = useMemo(() => {
    const m = new Map<string, string>();
    acts.forEach((a) => {
      (owned.get(a.id) ?? new Set<string>()).forEach((sid) => {
        if (!m.has(sid)) m.set(sid, a.id);
      });
    });
    return m;
  }, [acts, owned]);

  const stranded = useMemo(() => story.scenes.filter((sc) => !claimed.has(sc.id)), [story.scenes, claimed]);

  // Scenes two acts both claim — the signature of a link crossing a boundary.
  const overlaps = useMemo(() => {
    const out: { a: Act; b: Act; shared: string[] }[] = [];
    for (let i = 0; i < acts.length; i++) {
      for (let j = i + 1; j < acts.length; j++) {
        const A = owned.get(acts[i].id) ?? new Set<string>();
        const B = owned.get(acts[j].id) ?? new Set<string>();
        const shared = [...A].filter((x) => B.has(x));
        if (shared.length) out.push({ a: acts[i], b: acts[j], shared });
      }
    }
    return out;
  }, [acts, owned]);

  const writeActs = (next: Act[]) => onUpdate({ ...story, acts: next.length ? next : undefined });
  const patch = (id: string, changes: Partial<Act>) =>
    writeActs(acts.map((a) => (a.id === id ? { ...a, ...changes } : a)));

  const addAct = () => {
    const n = acts.length + 1;
    const id = `act_${uid()}`;
    // Suggest a sensible opening scene so a second act immediately carves a
    // real chunk off the end of the last act, instead of opening empty and
    // tripping the "owns nothing" warning. We pick the first scene the last
    // act currently owns that the player actually ARRIVES at (a choice leads
    // into it), skipping that act's own opener and any endings. The last act's
    // walk then stops here — this scene becomes the new boundary — so the new
    // act owns it and everything forward. Falls back to blank when nothing fits.
    const prev = acts[acts.length - 1];
    let candidate = "";
    if (prev) {
      const prevOwned = owned.get(prev.id) ?? new Set<string>();
      const incoming = new Map<string, number>();
      for (const sc of story.scenes) {
        for (const c of sc.choices ?? []) {
          if (c.targetSceneId) incoming.set(c.targetSceneId, (incoming.get(c.targetSceneId) ?? 0) + 1);
          if (c.timedOutTargetSceneId)
            incoming.set(c.timedOutTargetSceneId, (incoming.get(c.timedOutTargetSceneId) ?? 0) + 1);
        }
      }
      const options = story.scenes.filter(
        (sc) => prevOwned.has(sc.id) && sc.id !== prev.startSceneId && !sc.isEnding
      );
      const arrivals = options.filter((sc) => (incoming.get(sc.id) ?? 0) > 0);
      candidate = (arrivals[0] ?? options[0])?.id ?? "";
    }
    writeActs([
      ...acts,
      {
        id,
        label: `Act ${["One", "Two", "Three", "Four", "Five", "Six"][n - 1] ?? n}`,
        title: "",
        startSceneId: candidate,
        titleCardSeconds: 2.6,
      },
    ]);
    setOpenId(id);
  };

  const removeAct = (id: string) => {
    const act = acts.find((a) => a.id === id);
    if (!confirm(`Remove "${act?.label || id}"? No scenes are deleted — they fold back into the previous act.`)) return;
    writeActs(acts.filter((a) => a.id !== id));
  };

  const moveAct = (id: string, dir: -1 | 1) => {
    const idx = acts.findIndex((a) => a.id === id);
    const t = idx + dir;
    if (idx < 0 || t < 0 || t >= acts.length) return;
    const next = [...acts];
    [next[idx], next[t]] = [next[t], next[idx]];
    writeActs(next);
  };

  /* ---------------- no acts yet ---------------- */
  if (!acts.length) {
    return (
      <div className="space-y-3">
        <h3 className="font-pulp text-[10px] uppercase tracking-widest text-gold">🎭 Acts — give the case a spine</h3>
        <p className="font-type text-[10px] leading-relaxed text-paper/55">
          Acts are a <b className="text-gold">presentational</b> grouping inside one continuous case. Unlike episodes
          they don't split saves or endings — they add a <b className="text-gold">title card</b> when the story turns,
          and they scope the <b className="text-gold">route map</b> so the player reviews one act at a time instead of
          the whole graph.
        </p>
        <p className="font-type text-[10px] leading-relaxed text-paper/45">
          You only say where each act <b className="text-gold">begins</b>. Every scene reachable from there belongs to
          it, until the next act's opening scene. Nothing to tag, nothing to keep in sync.
        </p>
        <button
          onClick={() => {
            writeActs([
              {
                id: `act_${uid()}`,
                label: "Act One",
                title: story.title,
                startSceneId: story.startSceneId,
                titleCardSeconds: 2.6,
              },
            ]);
          }}
          className="w-full border-2 border-gold/60 bg-gold/10 py-2 font-pulp text-[10px] uppercase tracking-[0.18em] text-gold hover:bg-gold/20"
        >
          🎭 Add an act structure
        </button>
        <p className="font-type text-[9px] text-paper/35">
          Act One starts at your start scene and claims the whole story. Add a second act to split it.
        </p>
      </div>
    );
  }

  /* ---------------- the acts ---------------- */
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-pulp text-[10px] uppercase tracking-widest text-gold">🎭 Acts</h3>
        <button
          onClick={() => {
            if (!confirm("Remove the act structure? The case plays as one continuous run. No scenes are deleted.")) return;
            const { acts: _drop, ...rest } = story;
            onUpdate(rest as Story);
          }}
          className="border border-paper/25 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/50 hover:border-crimson hover:text-crimson"
        >
          Remove structure
        </button>
      </div>

      <p className="font-type text-[9px] leading-relaxed text-paper/40">
        An act owns everything reachable from its opening scene, up to the next act's opening scene. Counts below are
        live — wire a new choice and they move.
      </p>

      {/* Story map — a proportional, colour-coded bar of how the case is split
          across acts (plus any stranded scenes), so the whole structure reads
          at a glance. Each segment opens its act. */}
      {(() => {
        const total = Math.max(1, claimed.size + stranded.length);
        return (
          <div className="border border-noir-600 bg-noir-900/40 p-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-pulp text-[9px] uppercase tracking-widest text-paper/45">Story map</span>
              <span className="font-type text-[9px] text-paper/40">
                {claimed.size} scene{claimed.size === 1 ? "" : "s"} placed
                {stranded.length > 0 && <span className="text-paper/55"> · {stranded.length} loose</span>}
              </span>
            </div>
            <div className="flex h-4 w-full overflow-hidden rounded border border-noir-700">
              {acts.map((a, i) => {
                const tint = ACT_TINTS[i % ACT_TINTS.length];
                const size = owned.get(a.id)?.size ?? 0;
                if (size === 0) return null;
                return (
                  <button
                    key={a.id}
                    type="button"
                    title={`${a.label || `Act ${i + 1}`}: ${size} scene${size === 1 ? "" : "s"} — click to open`}
                    onClick={() => setOpenId(a.id)}
                    style={{ width: `${(size / total) * 100}%`, background: tint.dot }}
                    className="h-full transition-[filter] hover:brightness-125"
                  />
                );
              })}
              {stranded.length > 0 && (
                <div
                  title={`${stranded.length} scene${stranded.length === 1 ? "" : "s"} in no act`}
                  style={{ width: `${(stranded.length / total) * 100}%` }}
                  className="h-full bg-noir-700"
                />
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
              {acts.map((a, i) => {
                const tint = ACT_TINTS[i % ACT_TINTS.length];
                const size = owned.get(a.id)?.size ?? 0;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setOpenId(a.id)}
                    className="font-type text-[9px] text-paper/60 hover:text-paper"
                    title="Open this act"
                  >
                    <span className="mr-1 inline-block h-2 w-2 align-middle" style={{ background: tint.dot }} />
                    {a.label || `Act ${i + 1}`} · {size}
                  </button>
                );
              })}
              {stranded.length > 0 && (
                <span className="font-type text-[9px] text-paper/40">◇ in no act · {stranded.length}</span>
              )}
            </div>
          </div>
        );
      })()}

      {overlaps.length > 0 && (
        <div className="border border-crimson/50 bg-crimson/5 p-2">
          <div className="font-pulp text-[9px] uppercase tracking-widest text-crimson">⚠ Acts overlap</div>
          {overlaps.map((o, i) => (
            <p key={i} className="mt-0.5 font-type text-[9px] leading-relaxed text-paper/55">
              <b className="text-paper/80">{o.a.label}</b> and <b className="text-paper/80">{o.b.label}</b> both claim{" "}
              {o.shared.length} scene{o.shared.length === 1 ? "" : "s"}. A choice links across the boundary, so the walk
              runs straight through it and both route maps show these scenes.
            </p>
          ))}
        </div>
      )}

      {stranded.length > 0 && (
        <div className="border border-gold/40 bg-gold/5 p-2">
          <div className="font-pulp text-[9px] uppercase tracking-widest text-gold">
            ◇ {stranded.length} scene{stranded.length === 1 ? "" : "s"} in no act
          </div>
          <p className="mt-0.5 font-type text-[9px] text-paper/50">
            No act can reach these by choice edges. They play fine, but get no title card and never appear on a route
            map. Normal for a scene the engine jumps to from anywhere, like a failure ending.
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {stranded.map((sc) => (
              <button
                key={sc.id}
                onClick={() => onSelectScene(sc.id)}
                className="max-w-full truncate border border-noir-600 px-1.5 py-0.5 font-type text-[9px] text-paper/70 hover:border-neon hover:text-neon"
                title={sc.id}
              >
                {sc.title || sc.id}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {acts.map((act, i) => {
          const tint = ACT_TINTS[i % ACT_TINTS.length];
          const set = owned.get(act.id) ?? new Set<string>();
          const open = openId === act.id;
          const startMissing = !!act.startSceneId && !story.scenes.some((sc) => sc.id === act.startSceneId);
          return (
            <div key={act.id} className={`border ${open ? tint.ring : "border-noir-600"} bg-noir-900/40`}>
              <div className="flex items-center gap-1 px-2 py-1.5">
                <button
                  onClick={() => setOpenId(open ? null : act.id)}
                  className="min-w-0 flex-1 text-left"
                  title={open ? "Collapse" : "Expand"}
                >
                  <span className={`mr-1.5 inline-block px-1 py-0.5 font-pulp text-[8px] uppercase tracking-widest ${tint.chip}`}>
                    {act.label || `Act ${i + 1}`}
                  </span>
                  <span className="font-type text-[10px] text-paper/70">{act.title || <i className="text-paper/35">untitled</i>}</span>
                </button>
                <span
                  className={`shrink-0 font-type text-[9px] ${set.size === 0 ? "text-crimson" : "text-paper/40"}`}
                  title="Scenes this act owns, derived from the graph"
                >
                  {set.size} scene{set.size === 1 ? "" : "s"}
                </span>
                <button onClick={() => moveAct(act.id, -1)} disabled={i === 0}
                  className="shrink-0 px-1 font-pulp text-[10px] text-paper/40 hover:text-gold disabled:opacity-20" title="Move up">▲</button>
                <button onClick={() => moveAct(act.id, 1)} disabled={i === acts.length - 1}
                  className="shrink-0 px-1 font-pulp text-[10px] text-paper/40 hover:text-gold disabled:opacity-20" title="Move down">▼</button>
                <button onClick={() => removeAct(act.id)}
                  className="shrink-0 px-1 font-pulp text-[10px] text-crimson/70 hover:text-crimson" title="Remove act">✕</button>
              </div>

              {(startMissing || set.size === 0) && (
                <p className="border-t border-crimson/25 bg-crimson/5 px-2 py-1 font-type text-[9px] text-crimson">
                  {startMissing
                    ? `Opening scene "${act.startSceneId}" no longer exists.`
                    : act.startSceneId
                      ? "Owns nothing — the next act's opening scene blocks the walk immediately."
                      : "No opening scene set, so this act never opens."}
                </p>
              )}

              {open && (
                <div className="space-y-2 border-t border-noir-700 p-2">
                  {/* Live preview of the act title card the player sees when
                      they cross into this act. Mirrors game/Episode.tsx
                      ActTitleCard so it's pixel-truthful enough to judge. */}
                  {(() => {
                    const raw =
                      act.titleCardImage ?? story.scenes.find((s) => s.id === act.startSceneId)?.background;
                    const resolved = raw ? resolveMedia(raw) : undefined;
                    const img = resolved ?? (raw && !raw.startsWith("asset:") ? raw : undefined);
                    const resolvedImg = img ? assetBackground(img) : undefined;
                    const bg: React.CSSProperties = !resolvedImg
                      ? { background: "#0c0c14" }
                      : resolvedImg.startsWith("gradient:")
                        ? { background: resolvedImg.slice(9) }
                        : resolvedImg.startsWith("video:")
                          ? { background: "#0c0c14" }
                          : { backgroundImage: `url(${resolvedImg})`, backgroundSize: "cover", backgroundPosition: "center" };
                    return (
                      <div className="relative aspect-[16/7] w-full overflow-hidden border border-noir-600">
                        <div className="absolute inset-0" style={bg} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/80" />
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-[10%] bg-black" />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[10%] bg-black" />
                        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
                          <div className="font-pulp text-[9px] uppercase tracking-[0.4em] text-gold/90">
                            {act.label || `Act ${i + 1}`}
                          </div>
                          {act.title ? (
                            <div className="font-pulp mt-1.5 text-lg uppercase leading-none text-paper drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                              {act.title}
                            </div>
                          ) : (
                            <div className="font-pulp mt-1.5 text-xs italic text-paper/40">Untitled act</div>
                          )}
                          <div className="mt-2 h-px w-20 bg-gold/60" />
                          {act.tagline && (
                            <div className="font-type mt-1.5 text-[10px] italic text-paper/70">{act.tagline}</div>
                          )}
                        </div>
                        <span className="pointer-events-none absolute right-1 top-1 z-10 rounded bg-noir-950/70 px-1 font-type text-[8px] uppercase tracking-widest text-paper/45">
                          title card
                        </span>
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Label" hint="Small caps above the title.">
                      <input className={inputCls} placeholder="Act Two" value={act.label ?? ""}
                        onChange={(e) => patch(act.id, { label: e.target.value })} />
                    </Field>
                    <Field label="Card seconds" hint="Hold before it can be dismissed.">
                      <input type="number" min={0} step={0.2} className={inputCls}
                        value={act.titleCardSeconds ?? 2.6}
                        onChange={(e) => patch(act.id, { titleCardSeconds: parseFloat(e.target.value) || 0 })} />
                    </Field>
                  </div>

                  <Field label="Title" hint="The act's dramatic title on the card.">
                    <input className={inputCls} placeholder="The Woman Who Sold Herself Twice"
                      value={act.title ?? ""} onChange={(e) => patch(act.id, { title: e.target.value })} />
                  </Field>

                  <Field label="Tagline" hint="Optional line under the title.">
                    <input className={inputCls} value={act.tagline ?? ""}
                      onChange={(e) => patch(act.id, { tagline: e.target.value || undefined })} />
                  </Field>

                  <Field
                    label="Opens at"
                    hint="The only thing you assign. Everything reachable from here joins this act."
                  >
                    <select
                      className={inputCls}
                      value={act.startSceneId ?? ""}
                      onChange={(e) => patch(act.id, { startSceneId: e.target.value })}
                    >
                      <option value="">— pick the opening scene —</option>
                      {story.scenes.filter((sc) => sc.nodeType !== "note").map((sc) => {
                        const ownerAct = acts.find((a) => a.id === ownerOf.get(sc.id));
                        const note = ownerAct && ownerAct.id !== act.id ? ` · in ${ownerAct.label}` : "";
                        const end = sc.isEnding ? " · ending" : "";
                        return (
                          <option key={sc.id} value={sc.id}>
                            {sc.title || sc.id}
                            {note}
                            {end}
                          </option>
                        );
                      })}
                    </select>
                  </Field>

                  <Field label="Title card image">
                    <div className="flex gap-1">
                      <input
                        className={inputCls}
                        placeholder="/img/… or gradient:…"
                        value={mediaField(act.titleCardImage)}
                        onChange={(e) => patch(act.id, { titleCardImage: e.target.value || undefined })}
                      />
                      <MediaUploadButton
                        storyId={story.id}
                        accept="image/*"
                        label="⇧"
                        onUploaded={(_u, assetId) => patch(act.id, { titleCardImage: `asset:${assetId}` })}
                      />
                    </div>
                    <div className="mt-1">
                      <AssetDropdown
                        storyId={story.id}
                        assetType="image"
                        returnReference
                        value={act.titleCardImage}
                        onChange={(url) => patch(act.id, { titleCardImage: url || undefined })}
                        placeholder="Or use an uploaded image..."
                      />
                    </div>
                    {act.titleCardImage && (
                      <img
                        src={assetUrl(resolveMedia(act.titleCardImage) ?? act.titleCardImage)}
                        alt=""
                        className="mt-1 h-16 w-full border border-noir-600 object-cover"
                      />
                    )}
                  </Field>

                  <div>
                    <div className="font-pulp text-[9px] uppercase tracking-widest text-paper/40">
                      Owns {set.size} scene{set.size === 1 ? "" : "s"}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {story.scenes
                        .filter((sc) => set.has(sc.id))
                        .map((sc) => (
                          <button
                            key={sc.id}
                            onClick={() => onSelectScene(sc.id)}
                            className={`max-w-full truncate border px-1.5 py-0.5 font-type text-[9px] hover:text-neon ${
                              sc.id === act.startSceneId
                                ? "border-gold/60 text-gold"
                                : "border-noir-600 text-paper/60 hover:border-neon"
                            }`}
                            title={sc.id === act.startSceneId ? "Opening scene" : sc.id}
                          >
                            {sc.id === act.startSceneId ? "▸ " : ""}
                            {sc.title || sc.id}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={addAct}
        className="w-full border border-gold/50 py-1.5 font-pulp text-[9px] uppercase tracking-widest text-gold hover:bg-gold/10"
      >
        + Add act
      </button>
    </div>
  );
}
