import { useMemo, useState } from "react";
import type { Story } from "../types";

/** Search the graph without zooming through hundreds of tiny cards. Native
 * controls keep the navigator usable with a keyboard and on touch screens. */
export function SceneNavigator({ story, selectedId, onSelect }: {
  story: Story; selectedId: string | null; onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return story.scenes.filter((s) => !q || `${s.title} ${s.id} ${s.nodeType ?? "scene"} ${s.note ?? ""}`.toLocaleLowerCase().includes(q));
  }, [story.scenes, query]);
  return <nav aria-label="Scene navigator" className="studio-scene-nav flex flex-wrap items-center gap-2 border-b border-noir-700 bg-noir-950 px-3 py-2">
    <span className="font-pulp text-[10px] uppercase tracking-widest text-gold">Scene navigator</span>
    <input type="search" aria-label="Search scenes" placeholder="Search title, ID or notes…" value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && matches[0]) { e.preventDefault(); onSelect(matches[0].id); }
        if (e.key === "Escape") { e.stopPropagation(); setQuery(""); }
      }}
      className="min-w-0 flex-1 border border-noir-600 bg-noir-900 px-2 py-1.5 font-sans text-xs text-paper outline-none focus:border-neon" />
    <select aria-label="Jump to scene" value={matches.some((s) => s.id === selectedId) ? selectedId ?? "" : ""}
      onChange={(e) => { if (e.target.value) onSelect(e.target.value); }}
      className="min-w-0 flex-[1.3] border border-noir-600 bg-noir-900 px-2 py-1.5 font-sans text-xs text-paper outline-none focus:border-neon">
      <option value="">{matches.length ? "Choose a scene…" : "No matching scenes"}</option>
      {matches.map((s) => <option key={s.id} value={s.id}>{s.id === story.startSceneId ? "START · " : s.isEnding ? "END · " : ""}{s.title || s.id}</option>)}
    </select>
    <span role="status" className="font-sans text-[10px] text-paper/65">{matches.length} / {story.scenes.length}</span>
  </nav>;
}
