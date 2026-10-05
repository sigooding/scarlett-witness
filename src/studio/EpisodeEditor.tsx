import { useMemo, useState } from "react";
import { episodeOfScene, seasonEpisodes, uid, unassignedScenes } from "../logic";
import { useResolvedMedia } from "../data/mediaLibrary";
import { AssetDropdown, MediaUploadButton } from "./MediaLibrary";
import { STORIES } from "../data/stories";
import { assetBackground } from "../assetPath";
import type { Episode, Gating, RecapLine, Story } from "../types";

const inputCls =
  "w-full border border-noir-600 bg-noir-950 px-2 py-1 text-xs text-paper focus:border-neon outline-none";

/** Every image path the shipped catalogue references — the studio's own art
 *  library on disk. Self-maintaining: new art referenced by any built-in
 *  story (like the Nobody's Witness episode plates) appears here
 *  automatically, so an author can hang it on any episode without typing
 *  paths or uploading duplicates. */
const SHIPPED_ART: string[] = (() => {
  const refs = new Set<string>();
  const keep = (v?: string) => {
    if (v?.startsWith("/img/") && !v.startsWith("/img/nw2/ch-")) refs.add(v);
  };
  STORIES.forEach((s) => {
    s.scenes.forEach((sc) => {
      keep(sc.background?.replace(/^video:/, ""));
      (sc.dialogueBeats ?? []).forEach((b) => keep(b.background));
      (sc.credits?.montage ?? []).forEach((m) => keep(m));
    });
    (s.acts ?? []).forEach((a) => keep(a.titleCardImage));
    (s.episodes ?? []).forEach((e) => {
      keep(e.titleCardImage);
      keep(e.posterImage);
      (e.recapLines ?? []).forEach((l) => keep(l.image));
    });
  });
  return [...refs].sort();
})();

/** Compact dropdown of the shipped catalogue art for the episode image
 *  fields (title card + poster). */
function ShippedArtPicker({ value, onChange }: { value?: string; onChange: (url: string) => void }) {
  return (
    <select
      className={inputCls}
      value={value?.startsWith("/img/") ? value : ""}
      onChange={(e) => e.target.value && onChange(e.target.value)}
      title="Art that ships with the game — reuse any catalogue plate"
    >
      <option value="">🎞 Shipped art ({SHIPPED_ART.length})…</option>
      {SHIPPED_ART.map((p) => (
        <option key={p} value={p}>
          {p.replace("/img/", "")}
        </option>
      ))}
    </select>
  );
}

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

/**
 * Episodes tab — pack a story's scene graph into a TV-style season.
 *
 * Everything here writes straight onto `story.episodes`. Scene assignment is
 * the load-bearing part: a scene belongs to exactly one episode, and the
 * editor shows the unassigned pile prominently so a season can't silently
 * strand half the graph.
 */
export function EpisodeEditor({
  story,
  onUpdate,
  onSelectScene,
}: {
  story: Story;
  onUpdate: (next: Story) => void;
  onSelectScene: (sceneId: string) => void;
}) {
  const episodes = useMemo(() => seasonEpisodes(story), [story]);
  const orphans = useMemo(() => unassignedScenes(story), [story]);
  const resolveMedia = useResolvedMedia(story.id);
  const [openId, setOpenId] = useState<string | null>(episodes[0]?.id ?? null);

  const writeEpisodes = (next: Episode[]) => onUpdate({ ...story, episodes: next });

  const patch = (id: string, changes: Partial<Episode>) =>
    writeEpisodes(episodes.map((ep) => (ep.id === id ? { ...ep, ...changes } : ep)));

  const addEpisode = () => {
    const id = `ep_${uid()}`;
    const n = episodes.length + 1;
    // A brand-new episode claims nothing; the author assigns scenes below.
    const next: Episode = {
      id,
      number: n,
      title: `Episode ${n}`,
      kicker: story.title,
      tagline: "",
      sceneIds: [],
      startSceneId: "",
      titleCardSeconds: 2.4,
    };
    writeEpisodes([...episodes, next]);
    setOpenId(id);
  };

  const removeEpisode = (id: string) => {
    const ep = episodes.find((e) => e.id === id);
    if (!confirm(`Remove episode "${ep?.title}"? Its scenes stay in the story and become unassigned.`)) return;
    writeEpisodes(episodes.filter((e) => e.id !== id).map((e, i) => ({ ...e, number: i + 1 })));
  };

  const moveEpisode = (id: string, dir: -1 | 1) => {
    const idx = episodes.findIndex((e) => e.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= episodes.length) return;
    const next = [...episodes];
    [next[idx], next[target]] = [next[target], next[idx]];
    writeEpisodes(next.map((e, i) => ({ ...e, number: i + 1 })));
  };

  /** Move a scene into an episode, pulling it out of whichever one held it. */
  const assignScene = (sceneId: string, episodeId: string | "") => {
    writeEpisodes(
      episodes.map((ep) => {
        const without = ep.sceneIds.filter((s) => s !== sceneId);
        const claimed = ep.id === episodeId ? [...without, sceneId] : without;
        // Never leave a dangling opening scene behind.
        const startSceneId = claimed.includes(ep.startSceneId) ? ep.startSceneId : claimed[0] ?? "";
        return { ...ep, sceneIds: claimed, startSceneId };
      })
    );
  };

  /* ---------------- season not started yet ---------------- */
  if (!story.episodes) {
    return (
      <div className="space-y-3">
        <h3 className="font-pulp text-[10px] uppercase tracking-widest text-crimson">🎞 Episodes — pack this case into a season</h3>
        <p className="font-type text-[10px] leading-relaxed text-paper/55">
          An episodic story is presented like a TV season: a season screen, a{" "}
          <b className="text-gold">title card</b> per chapter, a <b className="text-gold">"Previously on…"</b> recap
          built from what the player actually did, <b className="text-gold">its own three save slots</b>, and{" "}
          <b className="text-gold">its own endings</b> that close the chapter and hand off to "Next time on…" instead of
          ending the whole story.
        </p>
        <p className="font-type text-[10px] leading-relaxed text-paper/45">
          Your flags, items, meters, trust and remembered lines carry from one episode into the next, so a choice in
          episode one can still be paying off in the finale.
        </p>
        <button
          onClick={() => {
            // Seed episode one with everything that already exists, so an
            // existing case becomes a one-episode season the author can split.
            const first: Episode = {
              id: `ep_${uid()}`,
              number: 1,
              title: story.title,
              kicker: story.title,
              tagline: story.tagline,
              sceneIds: story.scenes.map((s) => s.id),
              startSceneId: story.startSceneId,
              titleCardSeconds: 2.4,
            };
            onUpdate({ ...story, seasonTitle: story.seasonTitle ?? "Season One", episodes: [first] });
            setOpenId(first.id);
          }}
          className="w-full border-2 border-crimson/60 bg-crimson/10 py-2 font-pulp text-[10px] uppercase tracking-[0.18em] text-crimson hover:bg-crimson/20"
        >
          🎞 Turn this case into a season
        </button>
        <p className="font-type text-[9px] text-paper/35">
          Every scene starts in episode one. Add more episodes and drag scenes across to split the story.
        </p>
      </div>
    );
  }

  /* ---------------- the season ---------------- */
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-pulp text-[10px] uppercase tracking-widest text-crimson">🎞 Episodes</h3>
        <button
          onClick={() => {
            if (!confirm("Remove the episode structure? The story plays as one continuous case again. No scenes are deleted.")) return;
            const { episodes: _drop, ...rest } = story;
            onUpdate(rest as Story);
          }}
          className="border border-paper/25 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/50 hover:border-crimson hover:text-crimson"
        >
          Unpack season
        </button>
      </div>

      <Field label="Season title" hint="Shown above the story title on the season screen.">
        <input
          className={inputCls}
          placeholder="Season One"
          value={story.seasonTitle ?? ""}
          onChange={(e) => onUpdate({ ...story, seasonTitle: e.target.value || undefined })}
        />
      </Field>

      {orphans.length > 0 && (
        <div className="border border-crimson/50 bg-crimson/5 p-2">
          <div className="font-pulp text-[9px] uppercase tracking-widest text-crimson">
            ⚠ {orphans.length} scene{orphans.length === 1 ? "" : "s"} not in any episode
          </div>
          <p className="mt-0.5 font-type text-[9px] text-paper/50">
            Unassigned scenes still play, but they get no title card, no recap and no save slots. Assign them below.
          </p>
          <div className="mt-1.5 space-y-1">
            {orphans.map((sc) => (
              <div key={sc.id} className="flex items-center gap-1">
                <button
                  onClick={() => onSelectScene(sc.id)}
                  className="min-w-0 flex-1 truncate border border-noir-600 px-1.5 py-1 text-left font-type text-[10px] text-paper/75 hover:border-neon hover:text-neon"
                  title={sc.title}
                >
                  {sc.title}
                </button>
                <select
                  className="w-28 shrink-0 border border-noir-600 bg-noir-950 px-1 py-1 text-[10px] text-paper"
                  value=""
                  onChange={(e) => e.target.value && assignScene(sc.id, e.target.value)}
                >
                  <option value="">→ episode…</option>
                  {episodes.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      Ep {ep.number}. {ep.title.slice(0, 18)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {episodes.map((ep, i) => {
          const open = openId === ep.id;
          const epScenes = story.scenes.filter((s) => ep.sceneIds.includes(s.id));
          const epEndings = epScenes.filter((s) => s.isEnding);
          const canClear = epEndings.some((s) => s.endingData?.tier?.startsWith("victory"));
          return (
            <div key={ep.id} className={`border ${open ? "border-crimson/60 bg-noir-900/60" : "border-noir-600 bg-noir-900/30"}`}>
              <div className="flex items-center gap-1 border-b border-noir-700 px-1.5 py-1">
                <button
                  onClick={() => setOpenId(open ? null : ep.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span className="font-pulp text-[9px] uppercase tracking-widest text-gold">Ep {ep.number}</span>
                  <span className="min-w-0 flex-1 truncate font-pulp text-[11px] uppercase text-paper">{ep.title}</span>
                  <span className={`shrink-0 font-type text-[9px] ${epScenes.length ? "text-paper/40" : "text-crimson"}`}>
                    {epScenes.length} sc
                  </span>
                  <span className={`shrink-0 font-type text-[9px] ${canClear ? "text-emerald-400" : "text-crimson"}`} title={canClear ? "Has a clearable ending" : "No victory ending — the player can't clear this episode"}>
                    {canClear ? "✓" : "✖"}
                  </span>
                  <span className="shrink-0 text-paper/40">{open ? "▾" : "▸"}</span>
                </button>
                <button onClick={() => moveEpisode(ep.id, -1)} disabled={i === 0} className="px-1 text-[10px] text-paper/50 disabled:opacity-25 hover:text-neon" title="Move earlier">▲</button>
                <button onClick={() => moveEpisode(ep.id, 1)} disabled={i === episodes.length - 1} className="px-1 text-[10px] text-paper/50 disabled:opacity-25 hover:text-neon" title="Move later">▼</button>
                <button onClick={() => removeEpisode(ep.id)} className="px-1 font-pulp text-[10px] text-crimson hover:text-white" title="Remove episode">✕</button>
              </div>

              {open && (
                <div className="space-y-2 p-2">
                  {/* -------- title card -------- */}
                  <div className="border border-noir-700 bg-noir-950/50 p-2">
                    <div className="mb-1.5 font-pulp text-[9px] uppercase tracking-widest text-gold">🎬 Title card</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <Field label="Episode title">
                        <input className={inputCls} value={ep.title} onChange={(e) => patch(ep.id, { title: e.target.value })} />
                      </Field>
                      <Field label="Kicker (small line above)">
                        <input className={inputCls} placeholder={story.title} value={ep.kicker ?? ""} onChange={(e) => patch(ep.id, { kicker: e.target.value || undefined })} />
                      </Field>
                    </div>
                    <Field label="Tagline">
                      <input className={inputCls} placeholder="One line under the title" value={ep.tagline ?? ""} onChange={(e) => patch(ep.id, { tagline: e.target.value || undefined })} />
                    </Field>
                    <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                      <Field label="Hold (seconds)" hint="How long the card sits before Begin appears.">
                        <input
                          type="number"
                          min={0}
                          max={12}
                          step={0.2}
                          className={inputCls}
                          value={ep.titleCardSeconds ?? 2.4}
                          onChange={(e) => patch(ep.id, { titleCardSeconds: Math.max(0, Math.min(12, Number(e.target.value) || 0)) })}
                        />
                      </Field>
                      <Field label="Unlocked from the start">
                        <label className="flex items-center gap-2 pt-1 text-[10px] text-paper/60">
                          <input
                            type="checkbox"
                            checked={!!ep.unlockedByDefault}
                            onChange={(e) => patch(ep.id, { unlockedByDefault: e.target.checked || undefined })}
                          />
                          Playable without clearing the previous
                        </label>
                      </Field>
                    </div>
                    <Field label="Title-card still" hint="Defaults to the opening scene's background.">
                      <div className="flex gap-1">
                        <input
                          className={inputCls}
                          placeholder="/img/… or gradient:…"
                          value={mediaField(ep.titleCardImage)}
                          onChange={(e) => patch(ep.id, { titleCardImage: e.target.value || undefined })}
                        />
                        <MediaUploadButton storyId={story.id} accept="image/*" label="⇧" onUploaded={(_u, assetId) => patch(ep.id, { titleCardImage: `asset:${assetId}` })} />
                      </div>
                      <div className="mt-1">
                        <AssetDropdown storyId={story.id} assetType="image" returnReference value={ep.titleCardImage} onChange={(url) => patch(ep.id, { titleCardImage: url })} placeholder="Or use an uploaded image..." />
                      </div>
                      <div className="mt-1">
                        <ShippedArtPicker value={ep.titleCardImage} onChange={(url) => patch(ep.id, { titleCardImage: url })} />
                      </div>
                    </Field>
                    <Field label="Season-screen poster">
                      <div className="flex gap-1">
                        <input
                          className={inputCls}
                          placeholder="Defaults to the title-card still"
                          value={mediaField(ep.posterImage)}
                          onChange={(e) => patch(ep.id, { posterImage: e.target.value || undefined })}
                        />
                        <MediaUploadButton storyId={story.id} accept="image/*" label="⇧" onUploaded={(_u, assetId) => patch(ep.id, { posterImage: `asset:${assetId}` })} />
                      </div>
                      <div className="mt-1">
                        <ShippedArtPicker value={ep.posterImage} onChange={(url) => patch(ep.id, { posterImage: url })} />
                      </div>
                    </Field>
                    {/* live preview of the card */}
                    <div className="relative mt-2 h-24 overflow-hidden border border-noir-700" style={plate(resolveMedia(ep.titleCardImage) ?? story.scenes.find((s) => s.id === ep.startSceneId)?.background)}>
                      <div className="absolute inset-0 bg-black/60" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="font-pulp text-[7px] uppercase tracking-[0.5em] text-cyan-neon">{ep.kicker ?? story.title}</span>
                        <span className="font-pulp text-[8px] uppercase tracking-[0.4em] text-gold">Episode {ep.number}</span>
                        <span className="font-pulp text-lg uppercase leading-none text-paper">{ep.title}</span>
                        {ep.tagline && <span className="mt-1 font-type text-[8px] italic text-paper/60">{ep.tagline}</span>}
                      </div>
                    </div>
                  </div>

                  {/* -------- scenes -------- */}
                  <div className="border border-noir-700 bg-noir-950/50 p-2">
                    <div className="mb-1.5 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">🎞 Scenes in this episode</div>
                    <Field label="Opens on">
                      <select
                        className={inputCls}
                        value={ep.startSceneId}
                        onChange={(e) => patch(ep.id, { startSceneId: e.target.value })}
                      >
                        <option value="">— pick an opening scene —</option>
                        {epScenes.filter((sc) => sc.nodeType !== "note").map((sc) => (
                          <option key={sc.id} value={sc.id}>{sc.title}</option>
                        ))}
                      </select>
                    </Field>
                    <div className="mt-1.5 max-h-52 space-y-1 overflow-y-auto">
                      {story.scenes.filter((sc) => sc.nodeType !== "note").map((sc) => {
                        const owner = episodeOfScene(story, sc.id);
                        const mine = owner?.id === ep.id;
                        const takenElsewhere = owner && !mine;
                        return (
                          <div key={sc.id} className={`flex items-center gap-1.5 border px-1.5 py-1 ${mine ? "border-crimson/40 bg-crimson/5" : "border-noir-700"}`}>
                            <input
                              type="checkbox"
                              checked={mine}
                              onChange={(e) => assignScene(sc.id, e.target.checked ? ep.id : "")}
                              title={takenElsewhere ? `Currently in "${owner!.title}" — checking moves it here` : "Assign to this episode"}
                            />
                            <button
                              onClick={() => onSelectScene(sc.id)}
                              className="min-w-0 flex-1 truncate text-left font-type text-[10px] text-paper/75 hover:text-neon"
                            >
                              {sc.id === ep.startSceneId && <span className="mr-1 text-gold">★</span>}
                              {sc.isEnding && <span className="mr-1 text-crimson">🏁</span>}
                              {sc.title}
                            </button>
                            {takenElsewhere && (
                              <span className="shrink-0 font-type text-[8px] uppercase tracking-wider text-paper/35">Ep {owner!.number}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className={`mt-1.5 font-type text-[9px] ${canClear ? "text-emerald-400" : "text-crimson"}`}>
                      {epEndings.length
                        ? canClear
                          ? `✓ ${epEndings.length} ending${epEndings.length === 1 ? "" : "s"} — the player can clear this episode.`
                          : `✖ ${epEndings.length} ending${epEndings.length === 1 ? "" : "s"}, but none is a victory — the player can't clear this episode or unlock the next.`
                        : "✖ No ending in this episode — it can never finish or hand off."}
                    </div>
                  </div>

                  {/* -------- recap -------- */}
                  <RecapEditor story={story} episode={ep} index={i} onPatch={(changes) => patch(ep.id, changes)} />

                  {/* -------- next time -------- */}
                  <div className="border border-noir-700 bg-noir-950/50 p-2">
                    <div className="mb-1 font-pulp text-[9px] uppercase tracking-widest text-neon">📺 "Next time on…" teaser</div>
                    <p className="mb-1 font-type text-[9px] text-paper/40">
                      Shown after this episode's ending card, over the next episode's art. One line per row.
                    </p>
                    <textarea
                      className={`${inputCls} h-20 font-type`}
                      placeholder={"The harbour keeps its own books.\n\"You were told to stop at the first door.\""}
                      value={(ep.nextTimeLines ?? []).join("\n")}
                      onChange={(e) => patch(ep.id, { nextTimeLines: e.target.value.split("\n").filter((l) => l.trim()) || undefined })}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={addEpisode}
        className="w-full border border-crimson/50 py-1.5 font-pulp text-[9px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
      >
        + Add episode
      </button>
    </div>
  );
}

function plate(image?: string): React.CSSProperties {
  if (!image) return { background: "linear-gradient(160deg,#07111e 0%,#1d0c22 55%,#07070c 100%)" };
  const resolved = assetBackground(image);
  if (resolved.startsWith("gradient:")) return { background: resolved.slice(9) };
  if (resolved.startsWith("video:")) return { background: "#05050a" };
  return { backgroundImage: `url(${resolved})`, backgroundSize: "cover", backgroundPosition: "center" };
}

/* ------------------------------------------------------------------ */
/*  "Previously on…" editor                                            */
/* ------------------------------------------------------------------ */

function RecapEditor({
  story,
  episode,
  index,
  onPatch,
}: {
  story: Story;
  episode: Episode;
  index: number;
  onPatch: (changes: Partial<Episode>) => void;
}) {
  const lines = episode.recapLines ?? [];
  const allFlags = useMemo(() => {
    const flags = new Set<string>();
    story.scenes.forEach((sc) => {
      sc.choices?.forEach((c) => c.consequences?.setFlags?.forEach((f) => flags.add(f)));
      sc.hotspots?.forEach((h) => h.action.flagSet && flags.add(h.action.flagSet));
      sc.onEnterActions?.forEach((a) => a.consequences?.setFlags?.forEach((f) => flags.add(f)));
    });
    story.deduction?.connections.forEach((c) => flags.add(c.flagSet));
    return [...flags].sort();
  }, [story]);

  const setLines = (next: RecapLine[]) => onPatch({ recapLines: next.length ? next : undefined });
  const patchLine = (id: string, changes: Partial<RecapLine>) =>
    setLines(lines.map((l) => (l.id === id ? { ...l, ...changes } : l)));
  const patchGate = (id: string, changes: Partial<Gating>) => {
    const line = lines.find((l) => l.id === id);
    const gating = { ...(line?.gating ?? {}), ...changes };
    // Drop empty gate keys so a cleared dropdown means "always show".
    (Object.keys(gating) as (keyof Gating)[]).forEach((k) => {
      const v = gating[k];
      if (v === undefined || (Array.isArray(v) && !v.length)) delete gating[k];
    });
    patchLine(id, { gating: Object.keys(gating).length ? gating : undefined });
  };

  return (
    <div className="border border-noir-700 bg-noir-950/50 p-2">
      <div className="mb-1 font-pulp text-[9px] uppercase tracking-widest text-crimson">📼 "Previously on…" recap</div>
      {index === 0 ? (
        <p className="mb-1.5 font-type text-[9px] text-paper/40">
          Episode one usually has nothing to recap — but you can still open cold with a line or two here.
        </p>
      ) : (
        <p className="mb-1.5 font-type text-[9px] text-paper/40">
          Plays before the title card. Gate a line on a flag or item so the recap shows what <b className="text-gold">this</b>{" "}
          player actually did, not a fixed trailer.
        </p>
      )}

      <label className="mb-2 flex items-center gap-2 text-[10px] text-paper/60">
        <input
          type="checkbox"
          checked={!!episode.recapFromMemories}
          onChange={(e) => onPatch({ recapFromMemories: e.target.checked || undefined })}
        />
        Also replay the player's own remembered lines
      </label>

      <div className="space-y-1.5">
        {lines.map((line, i) => (
          <div key={line.id} className="border border-noir-700 bg-noir-900/50 p-1.5">
            <div className="mb-1 flex items-center gap-1">
              <span className="font-pulp text-[8px] uppercase tracking-widest text-paper/40">Beat {i + 1}</span>
              <div className="flex-1" />
              <button
                onClick={() => setLines(lines.filter((l) => l.id !== line.id))}
                className="px-1 font-pulp text-[10px] text-crimson hover:text-white"
                title="Remove beat"
              >
                ✕
              </button>
            </div>
            <textarea
              className={`${inputCls} h-12 font-type`}
              placeholder="A Pier Four matchbook in an apartment nobody had lived in for a week."
              value={line.text}
              onChange={(e) => patchLine(line.id, { text: e.target.value })}
            />
            <div className="mt-1 grid grid-cols-2 gap-1">
              <select
                className={inputCls}
                value={line.characterId ?? ""}
                onChange={(e) => patchLine(line.id, { characterId: e.target.value || undefined })}
              >
                <option value="">— narration —</option>
                {story.characters.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                className={inputCls}
                value={line.gating?.requiresFlags?.[0] ?? ""}
                onChange={(e) => patchGate(line.id, { requiresFlags: e.target.value ? [e.target.value] : undefined })}
              >
                <option value="">show always</option>
                {allFlags.map((f) => (
                  <option key={f} value={f}>only if: {f}</option>
                ))}
              </select>
            </div>
            <div className="mt-1 grid grid-cols-2 gap-1">
              <select
                className={inputCls}
                value={line.gating?.requiresItems?.[0] ?? ""}
                onChange={(e) => patchGate(line.id, { requiresItems: e.target.value ? [e.target.value] : undefined })}
              >
                <option value="">any inventory</option>
                {story.items.map((it) => (
                  <option key={it.id} value={it.id}>only if holding: {it.name}</option>
                ))}
              </select>
              <select
                className={inputCls}
                value={line.gating?.excludesFlags?.[0] ?? ""}
                onChange={(e) => patchGate(line.id, { excludesFlags: e.target.value ? [e.target.value] : undefined })}
              >
                <option value="">no exclusion</option>
                {allFlags.map((f) => (
                  <option key={f} value={f}>hide if: {f}</option>
                ))}
              </select>
            </div>
            <div className="mt-1">
              <input
                className={inputCls}
                placeholder="Still behind this beat — /img/… (optional)"
                value={mediaField(line.image)}
                onChange={(e) => patchLine(line.id, { image: e.target.value || undefined })}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setLines([...lines, { id: `rc_${uid()}`, text: "" }])}
        className="mt-1.5 w-full border border-noir-600 py-1 font-pulp text-[9px] uppercase tracking-widest text-paper/60 hover:border-crimson hover:text-crimson"
      >
        + Add recap beat
      </button>
    </div>
  );
}
