import { useEffect, useMemo, useRef, useState } from "react";
import { DepthParallaxLayer, hasDepthParallax } from "../../src/game/DepthParallax";
import type { CinematicSettings } from "../../src/types";
import shots from "./shots.json";

type Shot = (typeof shots)[number];

type Filter = "experiments" | "cuts" | "flagged" | "people" | "all";

const FILTERS: { id: Filter; label: string; test: (s: Shot) => boolean }[] = [
  { id: "experiments", label: "Experiments", test: (s) => !!(s as Shot & { experiment?: string | true }).experiment },
  { id: "cuts", label: "Cut-out shots", test: (s) => s.cutoutCount > 0 },
  { id: "flagged", label: "Flagged 22 Oct", test: (s) => !!s.review?.flags },
  { id: "people", label: "People in shot", test: (s) => !!s.people },
  { id: "all", label: "Every depth shot", test: () => true },
];

/** A browser only keeps a handful of live WebGL contexts (about 16 in Chrome, and it drops the oldest past that), so the
 *  grid never runs more cameras than this at once; the big view always runs just one. */
const MAX_LIVE = 6;

/** The film's cinematic with the preview's own speed knob applied: the move is the shot's real one, only quicker, so the end
 *  of a 14 s settle can be seen without waiting. */
function withSpeed(c: CinematicSettings, speed: number): CinematicSettings {
  const seconds = Math.max(2, c.depthSeconds ?? 14);
  return { ...c, depthSeconds: Math.max(2, seconds / speed) };
}

export function App() {
  const hasExperiments = shots.some((s) => (s as Shot & { experiment?: unknown }).experiment);
  const [filter, setFilter] = useState<Filter>(hasExperiments ? "experiments" : "cuts");
  const [speed, setSpeed] = useState(1);
  const [showMap, setShowMap] = useState(true);
  const [live, setLive] = useState<string[]>([]);
  const [open, setOpen] = useState<Shot | null>(null);
  const [tick, setTick] = useState(0);

  const active = FILTERS.find((f) => f.id === filter) ?? FILTERS[0];
  const list = useMemo(() => shots.filter(active.test), [active]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // A new filter or a "replay all" stops every camera first, so the freed contexts go back to the browser.
  useEffect(() => setLive([]), [filter, tick]);

  const play = (name: string) => {
    setLive((cur) => (cur.includes(name) ? cur : [...cur, name].slice(-MAX_LIVE)));
  };
  const stop = (name: string) => setLive((cur) => cur.filter((n) => n !== name));
  const playFirst = () => setLive(list.slice(0, MAX_LIVE).map((s) => s.name));

  return (
    <>
      <header className="top">
        <h1>
          Depth camera preview <span>· Nobody's Witness · {list.length} of {shots.length} shots</span>
        </h1>
        <div className="controls">
          <div className="seg" role="group" aria-label="Which shots">
            {FILTERS.map((f) => (
              <button key={f.id} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
          <label className="field">
            Speed
            <input type="range" min={1} max={8} step={1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
            <output>{speed}×</output>
          </label>
          <div className="seg" role="group" aria-label="Depth map inset">
            <button aria-pressed={showMap} onClick={() => setShowMap(true)}>Map</button>
            <button aria-pressed={!showMap} onClick={() => setShowMap(false)}>No map</button>
          </div>
          <button className="action" onClick={playFirst}>▶ Play first {MAX_LIVE}</button>
          <button className="action" onClick={() => setTick((t) => t + 1)}>■ Stop all</button>
        </div>
      </header>

      <main>
        <p className="hint">
          Click <b>▶</b> on a card to run the real <code>DepthParallaxLayer</code> — the same shader, plate, depth map and
          cut-outs the film plays — on that shot's own move from <code>studio-edits.json</code> — at 1× that is exactly what the film plays. <b>Speed</b> only shortens{" "}
          <code>depthSeconds</code> further; the geometry is untouched. Only {MAX_LIVE} cameras run at once
          (a browser keeps about 16 WebGL contexts; more would blank the cards). Click a card for a bigger look with its
          still, map and plate beside the move.
        </p>

        <div className="grid">
          {list.map((shot) => (
            <Card
              key={`${shot.name}-${tick}`}
              shot={shot}
              speed={speed}
              showMap={showMap}
              playing={live.includes(shot.name)}
              onPlay={() => play(shot.name)}
              onStop={() => stop(shot.name)}
              onOpen={() => setOpen(shot)}
            />
          ))}
        </div>
      </main>

      {open && <Big key={`${open.name}-big-${speed}`} shot={open} speed={speed} onClose={() => setOpen(null)} />}
    </>
  );
}

function Card({ shot, speed, showMap, playing, onPlay, onStop, onOpen }: {
  shot: Shot;
  speed: number;
  showMap: boolean;
  playing: boolean;
  onPlay: () => void;
  onStop: () => void;
  onOpen: () => void;
}) {
  const c = shot.cinematic as CinematicSettings;
  const motion = c.depthMotion ?? "truck";
  const on = hasDepthParallax(withSpeed(c, speed), shot.picture);
  const [remain, setRemain] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  // A push or truck settles and holds; once it has, the camera is stopped so the context goes back to the browser.
  useEffect(() => {
    window.clearInterval(timer.current);
    if (!playing) return setRemain(0);
    const seconds = withSpeed(c, speed).depthSeconds ?? 14;
    const until = Date.now() + seconds * 1000;
    setRemain(Math.ceil(seconds));
    timer.current = window.setInterval(() => {
      const left = Math.ceil((until - Date.now()) / 1000);
      if (left <= 0) {
        window.clearInterval(timer.current);
        setRemain(0);
        onStop();
      } else setRemain(left);
    }, 250);
    return () => window.clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, speed]);

  return (
    <article className={`card${playing ? " playing" : ""}`}>
      <div className="stage" style={{ backgroundImage: `url(${shot.picture})` }} onClick={onOpen}>
        {playing && on && <DepthParallaxLayer cinematic={withSpeed(c, speed)} picture={shot.picture} />}
        {showMap && (
          <div className="mapinset">
            <img src={c.depthMap} alt="" loading="lazy" />
          </div>
        )}
        <button
          className="playbtn"
          onClick={(e) => { e.stopPropagation(); playing ? onStop() : onPlay(); }}
          aria-label={playing ? "Stop" : "Play the depth move"}
        >
          {playing ? `■ ${remain || 1}s` : "▶"}
        </button>
      </div>
      <div className="meta">
        <div className="row1">
          <span className="name">{shot.name}</span>
          <span className="scene">scene {shot.scene}</span>
        </div>
        <div className="tags">
          <span className="tag">{motion} {(c.depthAmount ?? 0.4).toFixed(2)} · {c.depthSeconds ?? 14}s</span>
          {shot.cutoutCount > 0 && <span className="tag cuts">{shot.cutoutCount} cut-out{shot.cutoutCount > 1 ? "s" : ""}</span>}
          {!shot.cutoutCount && <span className="tag">map only</span>}
          {shot.people && <span className="tag flag">people: {shot.people}</span>}
          {shot.review?.flags && <span className="tag bad">⚠ {shot.review.flags}</span>}
          {(shot as Shot & { experiment?: unknown }).experiment && <span className="tag exp">experiment · no cut-outs</span>}
        </div>
      </div>
    </article>
  );
}

function Big({ shot, speed, onClose }: { shot: Shot; speed: number; onClose: () => void }) {
  const c = shot.cinematic as CinematicSettings;
  const [round, setRound] = useState(0);
  const fast = withSpeed(c, speed);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="bar" onClick={(e) => e.stopPropagation()}>
        <span className="name">{shot.name}</span>
        <span className="tag">{c.depthMotion ?? "truck"} {(c.depthAmount ?? 0.4).toFixed(2)}</span>
        <span className="tag">{c.depthSeconds ?? 14}s</span>
        <span className="tag">focus {(c.depthFocus ?? 0.5).toFixed(2)}</span>
        <span className="tag">{c.mode ?? "—"}</span>
        <span className="spacer" />
        <button className="action" onClick={() => setRound((r) => r + 1)}>↻ Replay</button>
        <button className="action" onClick={onClose}>Close (Esc)</button>
      </div>

      <div className="panes" onClick={(e) => e.stopPropagation()}>
        <div className="pane">
          <span className="cap">the picture, as the film holds it</span>
          <div className="frame"><img className="full" src={shot.picture} alt="" /></div>
        </div>
        <div className="pane">
          <span className="cap">the depth camera, {speed}× (the shot's own move)</span>
          <div className="frame" style={{ backgroundImage: `url(${shot.picture})` }}>
            <DepthParallaxLayer key={round} cinematic={fast} picture={shot.picture} />
          </div>
        </div>
        <div className="pane">
          <span className="cap">depth map — white near, black far</span>
          <div className="frame"><img className="full" src={c.depthMap} alt="" style={{ filter: "grayscale(1)" }} /></div>
        </div>
        {c.depthPlate && (
          <div className="pane">
            <span className="cap">plate — the picture with the people painted out</span>
            <div className="frame"><img className="full" src={c.depthPlate} alt="" /></div>
          </div>
        )}
      </div>

      <div className="detail" onClick={(e) => e.stopPropagation()}>
        {shot.cutoutCount > 0 ? (
          <>
            {shot.cutoutCount} cut-out{shot.cutoutCount > 1 ? "s" : ""} at depth{" "}
            {(c.depthCutouts ?? []).map((k) => k.depth.toFixed(2)).join(", ")}.{" "}
          </>
        ) : (
          <>No cut-outs: the map alone moves this shot.{" "}</>
        )}
        {shot.people && <>Listed in <code>peopleInShot</code>: {shot.people}. </>}
        {(shot as Shot & { experiment?: string }).experiment && (
          <p className="expnote">
            <b>Experiment, not wired into the film.</b> {(shot as Shot & { experiment?: string }).experiment}
          </p>
        )}
        {shot.review ? (
          <>
            Review sheet (22 Oct, automatic): {shot.review.cutouts} cut-out(s).{" "}
            {shot.review.flags ? <>Flagged — {shot.review.flags}.</> : <>No flags.</>}
          </>
        ) : (
          <>No automatic review sheet for this one.</>
        )}
      </div>
    </div>
  );
}
