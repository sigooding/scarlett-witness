/**
 * 🎞 EXPORT ANIMATIC — the home screen's dialog for rendering Nobody's Witness (or part of it) to an MP4 with every
 * effect, the depth camera, the sound, and the spoken lines and the narration burned in as captions, plus an .srt.
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
  progress: { seconds: number; title?: string; elapsed?: number } | null;
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

export function AnimaticExportDialog({ story, onClose }: { story: Story; onClose: () => void }) {
  // one entry a scene: a scene's continuation parts (nw_s65_b) play with it and are not offered on their own
  const scenes = useMemo(() => {
    const titles = new Map(story.scenes.map((s) => [s.id, s.title ?? s.id]));
    return playOrder(story)
      .filter((id) => !/_[a-h]$/.test(id) && id !== "nw_end")
      .map((id) => ({ id, title: titles.get(id) ?? id }));
  }, [story]);
  const firstScene = scenes.find((s) => /^nw_s\d/.test(s.id))?.id ?? scenes[0]?.id ?? "";
  const [from, setFrom] = useState(firstScene);
  const [to, setTo] = useState(firstScene);
  const [subtitles, setSubtitles] = useState(true);
  const [descriptions, setDescriptions] = useState(true);
  const [size, setSize] = useState("1280x720");
  const [fps, setFps] = useState(24);
  const [pace, setPace] = useState(1);
  const [server, setServer] = useState<"checking" | "yes" | "no">("checking");
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/__animatic/ping")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => live && setServer(j?.ok ? "yes" : "no"))
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

  const idx = (id: string) => scenes.findIndex((s) => s.id === id);
  const rangeOk = idx(from) >= 0 && idx(to) >= idx(from);
  const search = new URLSearchParams({ story: story.id, scene: from, animatic: "1", to, subs: subtitles ? "1" : "0", desc: descriptions ? "1" : "0", pace: String(pace) });
  const previewUrl = `${window.location.pathname}?${search}`;
  const command = `npm run export:animatic -- --from ${from} --to ${to} --size ${size} --fps ${fps}${pace !== 1 ? ` --pace ${pace}` : ""}${subtitles ? "" : " --no-subs"}${descriptions ? "" : " --no-desc"}`;

  const start = () => {
    setError(null);
    fetch("/__animatic/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, size, fps, pace, subtitles, descriptions }),
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

  const label = "font-pulp text-[10px] uppercase tracking-[0.25em] text-paper/60";
  const select = "w-full border border-paper/25 bg-noir-950 px-2 py-1.5 font-type text-sm text-paper";
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal aria-label="Export animatic" onClick={onClose}>
      <div className="w-full max-w-xl border border-gold/50 bg-noir-950 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-pulp text-xs uppercase tracking-[0.3em] text-gold">🎞 Export animatic</div>
            <p className="mt-1 font-type text-sm text-paper/70">
              {story.title} as a video: every effect and depth move as the game draws them, the sound, and the captions burned in.
            </p>
          </div>
          <button onClick={onClose} className="font-pulp text-xs text-paper/60 hover:text-gold" aria-label="Close">✕</button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
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
            Rendering… {job?.progress ? `${job.progress.seconds.toFixed(0)} s of film so far — ${job.progress.title ?? ""}` : "starting the film"}
          </p>
        )}
        {job?.status === "complete" && (
          <div className="mt-3 font-type text-sm text-paper/85" role="status">
            Done{job.report ? `: ${job.report.seconds.toFixed(0)} s, ${job.report.captions} captions, ${job.report.chapters.length} scenes` : ""}.{" "}
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
          Renders the real game frame by frame, so it takes longer than the film runs, much longer without a graphics card.
        </p>
      </div>
    </div>
  );
}
