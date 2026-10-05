import { useEffect, useState } from "react";
import type { Story } from "../types";
import { createInitialState, meetsGating, resolveHotspot } from "../logic";
import { stageHotspotApproachable, stageExitProbes, stageReturnPath } from "../game/stageNavigation";

export function StageNavigationAudit({ story, onSelectScene }: { story: Story; onSelectScene: (id: string) => void }) {
  const rooms = story.scenes.filter(s => s.nodeType === "stage" && !s.isEnding);
  const [hub, setHub] = useState(story.startSceneId);
  const [report, setReport] = useState<Array<{ id: string; title: string; exits: number; path: string[] | null; blocked: string[]; unreachable: string[] }> | null>(null);
  useEffect(() => setReport(null), [story, hub]);
  if (!rooms.length) return null;
  const run = () => setReport(rooms.map(scene => {
    const state = createInitialState(story);
    const exits = stageExitProbes(story, scene, state);
    const unreachable = (scene.hotspots ?? []).map(h => resolveHotspot(h, state))
      .filter(h => meetsGating(h.gating, state) && !stageHotspotApproachable(scene, h, state)).map(h => h.label);
    return { id: scene.id, title: scene.title, exits: exits.filter(e => e.open).length,
      path: stageReturnPath(story, scene.id, hub), unreachable, blocked: exits.filter(e => !e.open).map(e => `${e.label}: ${e.reason}`) };
  }));
  return <section aria-label="Walking room navigation audit" className="space-y-2 border border-cyan-400/30 bg-cyan-400/5 p-3">
    <h3 className="font-pulp text-xs uppercase tracking-widest text-cyan-300">Walking room navigation audit</h3>
    <p className="font-type text-xs text-paper/65">Check a fresh, empty-inventory state. Maps do NOT count as doors. Tests the authored return path and approaches to exits, pickups and conversations from each spawn. Locked story progression may be intentional; playtest earned states and moving actors separately.</p>
    <label className="block font-type text-xs text-paper/70">Return destination
      <select aria-label="Navigation audit return destination" className="mt-1 w-full border border-noir-600 bg-noir-950 p-1" value={hub} onChange={e => setHub(e.target.value)}>
        {story.scenes.filter(s => !s.isEnding).map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
      </select>
    </label>
    <button type="button" onClick={run} className="w-full border border-cyan-400/50 p-2 font-pulp text-xs text-cyan-300">Run navigation audit</button>
    {report && <div role="status" className="space-y-2 font-type text-xs">
      <p className="text-paper/80">{report.filter(r => r.path && r.exits).length} / {report.length} rooms have a usable return route in this state.</p>
      {report.map(r => <div key={r.id} className={`border p-2 ${r.path && r.exits && !r.unreachable.length ? "border-neon/20" : "border-amber-400/60"}`}>
        <button type="button" className="text-left text-paper underline" onClick={() => onSelectScene(r.id)}>{r.title}</button>
        <p className="text-paper/65">{r.exits} usable exit{r.exits === 1 ? "" : "s"} · {r.path ? `${Math.max(0, r.path.length - 1)} hops back` : "NO RETURN ROUTE"}</p>
        {!r.exits && <p className="text-amber-300">No usable local exit — do not assume a travel map prevents a trap.</p>}
        {r.unreachable.length > 0 && <p className="text-amber-300">No clear approach: {r.unreachable.join(" · ")}. Move the marker off furniture, or make genuinely distant interactions remote.</p>}
        {r.blocked.length > 0 && <details className="text-paper/50"><summary>Locked / unreachable routes</summary>{r.blocked.map((b, i) => <p key={i}>{b}</p>)}</details>}
      </div>)}
    </div>}
  </section>;
}
