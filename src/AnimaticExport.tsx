/**
 * 🎞 EXPORT ANIMATIC — the home screen's dialog for rendering Nobody's Witness, the whole film or some of its scenes, to
 * an MP4 with every effect, the depth camera, the sound, and the spoken lines and the narration burned in as captions,
 * plus an .srt.
 *
 * Rendering runs on the dev server (`npm run dev`, tools/vite-animatic-export.mjs → tools/export-animatic.mjs). On a
 * static deploy there is no server: the dialog then gives the command line, and can still play the chosen scenes
 * hands-off in a new tab for a screen recorder. See docs/animatic-export.md.
 */
import { useEffect, useMemo, useState } from "react";
import type { DialogueBeat, SceneNode, Story } from "./types";

type Job = {
  id: string;
  status: "running" | "complete" | "failed" | "cancelled";
  options?: { from: string; to: string | null; whole?: boolean };
  progress: { seconds: number; title?: string; elapsed?: number; estimate?: number } | null;
  report: { seconds: number; captions: number; chapters: unknown[]; renderMinutes: number; warnings?: string[] } | null;
  error: string | null;
};

/** Scene ids in play order, following each scene's exit from the start. */
export function playOrder(story: Story): string[] {
  const by = new Map(story.scenes.map((s) => [s.id, s]));
  const out: string[] = [];
  for (let id: string | undefined = story.startSceneId; id && by.has(id) && !out.includes(id); ) {
    out.push(id);
    const s: SceneNode = by.get(id)!;
    const beats: DialogueBeat[] = s.dialogueBeats ?? [];
    id = beats[beats.length - 1]?.afterBeatTargetSceneId || s.autoAdvanceTargetSceneId || s.choices?.[0]?.targetSceneId;
  }
  return out;
}

/** What the scene lists offer: one entry a scene in play order. A scene's continuation parts (nw_s65_b), the later shots
 *  of a song-timed run (nw_song_raid_02…) and the scene part after it (nw_s92_after) belong to the entry they continue;
 *  `last` is the entry's last node, which is what "to" means. The ending node is not offered. */
export function sceneEntries(story: Story): { id: string; last: string; title: string }[] {
  const by = new Map(story.scenes.map((s) => [s.id, s]));
  const out: { id: string; last: string; title: string }[] = [];
  for (const id of playOrder(story)) {
    const s = by.get(id);
    if (!s || s.isEnding) continue;
    const continues = /_[a-h]$/.test(id) || /_after$/.test(id) || (/^nw_song_.+_\d+$/.test(id) && !/_0*1$/.test(id));
    if (continues && out.length) {
      out[out.length - 1].last = id;
      continue;
    }
    const title = s.title ?? id;
    out.push({ id, last: id, title: /^nw_song_/.test(id) ? `${title.split(":")[0]} (to its song)` : title.replace(/ \(cont\.\)$/, "") });
  }
  return out;
}

/** 95 → "1 min 35 s", 5400 → "1 h 30 min" */
export function duration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s >= 3600) return `${Math.floor(s / 3600)} h ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")} min`;
  if (s >= 60) return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`;
  return `${s} s`;
}

export function AnimaticExportDialog({ story, onClose }: { story: Story; onClose: () => void }) {
  const scenes = useMemo(() => sceneEntries(story), [story]);
  const firstScene = scenes.find((s) => /^nw_s\d/.test(s.id))?.id ?? scenes[0]?.id ?? "";
  const [whole, setWhole] = useState(true);
  const [from, setFrom] = useState(firstScene);
  const [to, setTo] = useState(firstScene);
  const [subtitles, setSubtitles] = useState(true);
  const [descriptions, setDescriptions] = useState(true);
  const [size, setSize] = useState("1280x720");
  const [fps, setFps] = useState(24);
  const [pace, setPace] = useState(1);
  // a graphics card draws the frames and encodes the video much faster; parts render stretches of the film at once
  const [gpu, setGpu] = useState(true);
  const [parts, setParts] = useState(3);
  const [server, setServer] = useState<"checking" | "yes" | "no">("checking");
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Is there a dev server to render on? If so, show its latest export: a whole film takes hours, and the dialog may have
  // been closed (or the page reloaded) since it started.
  useEffect(() => {
    let live = true;
    fetch("/__animatic/ping")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!live) return;
        setServer(j?.ok ? "yes" : "no");
        if (!j?.ok) return;
        return fetch("/__animatic/jobs")
          .then((r) => (r.ok ? r.json() : []))
          .then((list: Job[]) => {
            if (live && list.length) setJob(list[0]);
          });
      })
      .catch(() => live && setServer("no"));
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (!job || job.status !== "running") return;
    const t = window.setInterval(() => {
      fetch(`/__animatic/jobs/${job.id}`)
        .then((r) => r.json())
        .then((j: Job) => setJob(j))
        .catch(() => undefined);
    }, 2000);
    return () => window.clearInterval(t);
  }, [job]);

  const entry = (id: string) => scenes.find((s) => s.id === id || s.last === id);
  const idx = (id: string) => scenes.findIndex((s) => s.id === id);
  const rangeOk = whole || (idx(from) >= 0 && idx(to) >= idx(from));
  const start0 = whole ? scenes[0]?.id ?? from : from;
  const toLast = whole ? null : entry(to)?.last ?? to;
  const search = new URLSearchParams({ story: story.id, scene: start0, animatic: "1", subs: subtitles ? "1" : "0", desc: descriptions ? "1" : "0", pace: String(pace) });
  if (toLast) search.set("to", toLast);
  const previewUrl = `${window.location.pathname}?${search}`;
  const flags = `${gpu ? " --gpu" : ""}${parts > 1 ? ` --parts ${parts}` : ""}${size !== "1280x720" ? ` --size ${size}` : ""}${fps !== 24 ? ` --fps ${fps}` : ""}${pace !== 1 ? ` --pace ${pace}` : ""}${subtitles ? "" : " --no-subs"}${descriptions ? "" : " --no-desc"}`;
  const command = `npm run export:animatic${whole ? (flags ? ` --${flags}` : "") : ` -- --from ${from} --to ${toLast}${flags}`}`;

  const start = () => {
    setError(null);
    fetch("/__animatic/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: start0, to: toLast, whole, size, fps, pace, subtitles, descriptions, gpu, parts }),
    })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? "The export could not start.");
        setJob(j);
      })
      .catch((e) => setError(String(e.message ?? e)));
  };
  const cancel = () => job && fetch(`/__animatic/jobs/${job.id}/cancel`, { method: "POST" }).then((r) => r.json()).then(setJob);
  const busy = job?.status === "running";
  const p = job?.progress;
  // time left, once enough of the film is done to judge this machine's speed
  const left = p?.estimate && p.elapsed && p.seconds > 20 ? Math.max(0, (p.elapsed * Math.max(0, p.estimate - p.seconds)) / p.seconds) : null;
  const o = job?.options;
  const jobWhat = !o ? "" : o.whole ? "the whole film" : `${entry(o.from)?.title ?? o.from} to ${o.to ? entry(o.to)?.title ?? o.to : "the end"}`;

  const label = "font-pulp text-[10px] uppercase tracking-[0.25em] text-paper/60";
  const select = "w-full border border-paper/25 bg-noir-950 px-2 py-1.5 font-type text-sm text-paper disabled:opacity-40";
  const radio = "flex items-center gap-2 font-type text-sm text-paper/85";
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal aria-label="Export animatic" onClick={onClose}>
      <div className="max-h-full w-full max-w-xl overflow-y-auto border border-gold/50 bg-noir-950 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-pulp text-xs uppercase tracking-[0.3em] text-gold">🎞 Export animatic</div>
            <p className="mt-1 font-type text-sm text-paper/70">
              {story.title} as a video: every effect and depth move as the game draws them, the sound, and the captions burned in.
            </p>
          </div>
          <button onClick={onClose} className="font-pulp text-xs text-paper/60 hover:text-gold" aria-label="Close">✕</button>
        </div>

        <div className="mt-4 space-y-2" role="radiogroup" aria-label="What to export">
          <label className={radio}>
            <input type="radio" name="animatic-what" checked={whole} disabled={busy} onChange={() => setWhole(true)} />
            The whole film, from the cold open (scenes 1 and 2, then the titles) to the end credits
          </label>
          <label className={radio}>
            <input type="radio" name="animatic-what" checked={!whole} disabled={busy} onChange={() => setWhole(false)} />
            Some scenes
          </label>
        </div>

        {!whole && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="block">
              <span className={label}>From</span>
              <select className={select} value={from} disabled={busy} onChange={(e) => { setFrom(e.target.value); if (idx(e.target.value) > idx(to)) setTo(e.target.value); }}>
                {scenes.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </label>
            <label className="block">
              <span className={label}>To (included)</span>
              <select className={select} value={to} disabled={busy} onChange={(e) => setTo(e.target.value)}>
                {scenes.map((s) => <option key={s.id} value={s.id} disabled={idx(s.id) < idx(from)}>{s.title}</option>)}
              </select>
            </label>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 font-type text-sm text-paper/80">
            <input type="checkbox" checked={subtitles} disabled={busy} onChange={(e) => setSubtitles(e.target.checked)} /> Subtitles (spoken lines)
          </label>
          <label className="flex items-center gap-2 font-type text-sm text-paper/80">
            <input type="checkbox" checked={descriptions} disabled={busy} onChange={(e) => setDescriptions(e.target.checked)} /> Descriptions (narration, scene headings)
          </label>
          <label className="block">
            <span className={label}>Size · frame rate</span>
            <div className="flex gap-2">
              <select className={select} value={size} disabled={busy} onChange={(e) => setSize(e.target.value)}>
                <option value="1280x720">1280 × 720</option>
                <option value="1920x1080">1920 × 1080</option>
              </select>
              <select className={select} value={fps} disabled={busy} onChange={(e) => setFps(Number(e.target.value))}>
                {[24, 25, 30, 12].map((f) => <option key={f} value={f}>{f} fps</option>)}
              </select>
            </div>
          </label>
          <label className="flex items-center gap-2 font-type text-sm text-paper/80">
            <input type="checkbox" checked={gpu} disabled={busy} onChange={(e) => setGpu(e.target.checked)} /> Use the graphics card
          </label>
          <label className="block">
            <span className={label}>Render at once</span>
            <select className={select} value={parts} disabled={busy} onChange={(e) => setParts(Number(e.target.value))}>
              {[1, 2, 3, 4, 6].map((n) => <option key={n} value={n}>{n === 1 ? "1 part (one browser)" : `${n} parts (${n} browsers)`}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={label}>Reading pace</span>
            <select className={select} value={pace} disabled={busy} onChange={(e) => setPace(Number(e.target.value))}>
              <option value={0.8}>Brisk</option>
              <option value={1}>Normal</option>
              <option value={1.25}>Slow</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {server === "yes" && !busy && (
            <button onClick={start} disabled={!rangeOk} className="border-2 border-gold bg-gold/15 px-4 py-2 font-pulp text-xs uppercase tracking-[0.2em] text-gold hover:bg-gold/25 disabled:opacity-40">
              ⏺ Render MP4
            </button>
          )}
          {busy && (
            <button onClick={cancel} className="border border-crimson/70 px-4 py-2 font-pulp text-xs uppercase tracking-[0.2em] text-crimson">
              Cancel
            </button>
          )}
          <a href={previewUrl} target="_blank" rel="noreferrer" className="border border-paper/30 px-4 py-2 font-pulp text-xs uppercase tracking-[0.2em] text-paper/80 hover:border-gold hover:text-gold">
            ▶ Play hands-off in a new tab
          </a>
        </div>

        {busy && (
          <p className="mt-3 font-type text-sm text-paper/80" role="status">
            Rendering {jobWhat}…{" "}
            {p
              ? `${duration(p.seconds)} of film${p.estimate ? ` (of about ${duration(p.estimate)})` : ""} done in ${duration(p.elapsed ?? 0)}${left !== null ? `, about ${duration(left)} to go` : ""}. Now: ${p.title ?? ""}`
              : "starting the film"}
          </p>
        )}
        {job?.status === "complete" && (
          <div className="mt-3 font-type text-sm text-paper/85" role="status">
            Done{jobWhat ? ` (${jobWhat})` : ""}{job.report ? `: ${duration(job.report.seconds)}, ${job.report.captions} captions, ${job.report.chapters.length} scenes` : ""}.{" "}
            <a className="text-gold underline" href={`/__animatic/jobs/${job.id}/animatic.mp4`}>Download the MP4</a>{" · "}
            <a className="text-gold underline" href={`/__animatic/jobs/${job.id}/captions.srt`}>the captions (.srt)</a>
            {!!job.report?.warnings?.length && <div className="mt-1 text-xs text-paper/50">Notes: {job.report.warnings.join("; ")}</div>}
          </div>
        )}
        {(job?.status === "failed" || error) && <p className="mt-3 font-type text-sm text-crimson" role="alert">{job?.error ?? error}</p>}
        {job?.status === "cancelled" && <p className="mt-3 font-type text-sm text-paper/60">Cancelled.</p>}

        {server === "no" && (
          <div className="mt-4 border-t border-paper/15 pt-3 font-type text-xs text-paper/60">
            Rendering an MP4 needs the app running on your computer (<code>npm run dev</code>, with ffmpeg and Playwright's
            Chromium installed): open it there and use this dialog, or run
            <pre className="mt-1 whitespace-pre-wrap break-all bg-black/50 p-2 text-paper/80">{command}</pre>
            Here you can play the scenes hands-off in a new tab and record them with a screen recorder.
          </div>
        )}
        <p className="mt-3 font-type text-[11px] text-paper/40">
          It renders the real game frame by frame, so it takes longer than the film runs: the whole film (about two hours at Normal
          pace, an hour and three quarters at Brisk) takes several hours, most of a day on a computer without a graphics card. Leave <code>npm run dev</code> running
          until it finishes; you can close this dialog and come back to it.
        </p>
      </div>
    </div>
  );
}
