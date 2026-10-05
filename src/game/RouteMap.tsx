import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getBezierPath,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { audio } from "../audio";
import { prettyFlagName } from "../logic";
import { buildRouteGraph, scenesInAct, type RouteStatus } from "./routeGraph";
import type { JourneyStep, Story } from "../types";

/* ------------------------------------------------------------------ *
 *  BRANCHING ROUTE MAP
 *
 *  The whole shape of an act, Detroit style: every scene, every branch,
 *  the route you walked lit up and the ones you didn't greyed out.
 *
 *  Read-only by construction — this is a *reading* of the story, not an
 *  editing surface. All interaction handlers are off; the player can pan
 *  and zoom to inspect, and nothing else.
 * ------------------------------------------------------------------ */

const ACCENT: Record<string, string> = {
  Sultry: "#ff2d95",
  Aggressive: "#ff3b30",
  Clever: "#2ad9d9",
  Neutral: "#e8b647",
};

const COL_W = 250;
const ROW_H = 104;

/* ---------------- node ---------------- */

type RouteNodeData = {
  label: string;
  status: RouteStatus;
  isEnding: boolean;
  endingTier?: string;
  isCurrent: boolean;
  revealed: boolean;
};

const RouteMapNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as RouteNodeData;
  const taken = d.status === "taken";

  const tierColor =
    d.endingTier === "victory-gold"
      ? "#e8b647"
      : d.endingTier === "gameover"
        ? "#ff3b30"
        : "#2ad9d9";

  const border = d.isCurrent
    ? "#ffffff"
    : d.isEnding
      ? tierColor
      : taken
        ? "#e8b647"
        : "rgba(232,222,205,0.22)";

  return (
    <div
      className={`rm-node ${d.revealed ? "rm-in" : "rm-pre"} ${taken ? "rm-taken" : "rm-missed"}`}
      style={{ borderColor: border }}
      title={d.label}
    >
      <Handle type="target" position={Position.Left} isConnectable={false} className="rm-handle" />
      {d.isEnding && (
        <div className="rm-badge" style={{ color: tierColor }}>
          {d.endingTier === "gameover" ? "✖ ENDING" : "★ ENDING"}
        </div>
      )}
      <div className="rm-label" style={{ color: taken || d.isEnding ? "#f4ecdd" : "rgba(244,236,221,0.42)" }}>
        {d.label}
      </div>
      {d.isCurrent && <div className="rm-current">YOU ARE HERE</div>}
      <Handle type="source" position={Position.Right} isConnectable={false} className="rm-handle" />
    </div>
  );
});
RouteMapNode.displayName = "RouteMapNode";

/* ---------------- edge ---------------- */

const RouteMapEdge = memo(
  ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps) => {
    const isBack = (data as { isBack?: boolean })?.isBack;
    // Loop-back edges point left, against the reading direction — a looser
    // curve plus a dash keeps them reading as "returning" rather than as a
    // branch that goes backwards.
    const [path] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      curvature: isBack ? 0.5 : 0.32,
    });
    const status = (data as { status?: RouteStatus })?.status ?? "missed";
    const attitude = (data as { attitude?: string })?.attitude ?? "Neutral";
    const revealed = (data as { revealed?: boolean })?.revealed;
    const taken = status === "taken";

    return (
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: taken ? ACCENT[attitude] ?? ACCENT.Neutral : "rgba(232,222,205,0.16)",
          strokeWidth: taken ? 2.4 : 1.2,
          strokeDasharray: status === "locked" ? "3 5" : isBack ? "2 6" : taken ? undefined : "5 6",
          opacity: revealed ? 1 : 0,
          transition: "opacity 520ms ease",
        }}
      />
    );
  }
);
RouteMapEdge.displayName = "RouteMapEdge";

const nodeTypes = { routeNode: RouteMapNode };
const edgeTypes = { routeEdge: RouteMapEdge };

/* ---------------- map ---------------- */

function RouteMapInner({
  story,
  actId,
  journey,
  currentSceneId,
}: {
  story: Story;
  actId: string;
  journey: JourneyStep[];
  currentSceneId?: string;
}) {
  const graph = useMemo(
    () => buildRouteGraph(story, actId, journey, currentSceneId),
    [story, actId, journey, currentSceneId]
  );

  // Reveal rank by rank, so the act draws itself left to right.
  const maxDepth = useMemo(
    () => graph.nodes.reduce((m, n) => Math.max(m, n.depth), 0),
    [graph]
  );
  const [wave, setWave] = useState(-1);
  const { fitView } = useReactFlow();

  useEffect(() => {
    setWave(-1);
    let d = -1;
    const t = window.setInterval(() => {
      d += 1;
      setWave(d);
      if (d > maxDepth) window.clearInterval(t);
    }, 240);
    return () => window.clearInterval(t);
  }, [maxDepth, actId]);

  useEffect(() => {
    const t = window.setTimeout(() => fitView({ padding: 0.18, duration: 600 }), 80);
    return () => window.clearTimeout(t);
  }, [fitView, graph]);

  const nodes: Node[] = useMemo(
    () =>
      graph.nodes.map((n) => ({
        id: n.id,
        type: "routeNode",
        position: { x: n.depth * COL_W, y: n.lane * ROW_H },
        data: {
          label: n.label,
          status: n.status,
          isEnding: n.isEnding,
          endingTier: n.endingTier,
          isCurrent: n.isCurrent,
          revealed: n.depth <= wave,
        },
        draggable: false,
        selectable: false,
        connectable: false,
      })) as Node[],
    [graph, wave]
  );

  const depthOf = useMemo(() => {
    const m = new Map<string, number>();
    for (const n of graph.nodes) m.set(n.id, n.depth);
    return m;
  }, [graph]);

  const edges: Edge[] = useMemo(
    () =>
      graph.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: "routeEdge",
        data: {
          status: e.status,
          attitude: e.attitude,
          isBack: e.isBack ?? false,
          revealed: (depthOf.get(e.target) ?? 0) <= wave,
        },
        selectable: false,
        focusable: false,
      })),
    [graph, wave, depthOf]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      // Read-only: inspect, don't edit.
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      edgesFocusable={false}
      nodesFocusable={false}
      panOnDrag
      zoomOnScroll
      zoomOnDoubleClick={false}
      minZoom={0.25}
      maxZoom={1.4}
      attributionPosition="top-right"
    >
      <Background variant={BackgroundVariant.Dots} gap={26} size={1} color="rgba(232,222,205,0.10)" />
    </ReactFlow>
  );
}

export function RouteMap(props: {
  story: Story;
  actId: string;
  journey: JourneyStep[];
  currentSceneId?: string;
  title?: string;
  onDone?: () => void;
}) {
  const { title, onDone } = props;
  const act = props.story.acts?.find((a) => a.id === props.actId);

  // Route notes: the flags this act's playthrough set (journey steps whose
  // scene sits in the act), each with its author note — the act recap's
  // "what has changed in this case" log.
  const routeNotes = useMemo(() => {
    const inAct = scenesInAct(props.story, props.actId);
    const seen = new Set<string>();
    const notes: { flag: string; note: string }[] = [];
    for (const step of props.journey) {
      if (!inAct.has(step.sceneId)) continue;
      for (const flag of step.flagsSet ?? []) {
        if (seen.has(flag)) continue;
        seen.add(flag);
        notes.push({ flag, note: props.story.flagNotes?.[flag]?.trim() ?? "" });
      }
    }
    return notes;
  }, [props.story, props.actId, props.journey]);

  const close = useCallback(() => {
    audio.click();
    onDone?.();
  }, [onDone]);

  useEffect(() => {
    if (!onDone) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.code === "Space") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDone, close]);

  return (
    <div className="rm-screen fx-grain absolute inset-0 z-[86] flex flex-col bg-black">
      <div className="relative z-10 flex items-baseline justify-between border-b border-gold/25 px-6 py-4">
        <div>
          <div className="font-pulp text-[10px] uppercase tracking-[0.5em] text-cyan-neon">
            Route Map
          </div>
          <h2 className="font-pulp mt-1 text-2xl uppercase tracking-[0.12em] text-paper md:text-3xl">
            {title ?? (act ? `${act.label} — ${act.title}` : "Your Route")}
          </h2>
        </div>
        <div className="hidden gap-4 font-pulp text-[9px] uppercase tracking-[0.2em] md:flex">
          <span className="text-gold">● Your route</span>
          <span className="text-paper/35">○ Not taken</span>
          <span className="text-paper/35">┄ Locked</span>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <ReactFlowProvider>
          <RouteMapInner {...props} />
        </ReactFlowProvider>
        {routeNotes.length > 0 && (
          <div className="pointer-events-auto absolute left-4 top-4 z-[5] max-h-64 max-w-xs overflow-y-auto border border-gold/40 bg-noir-950/85 p-3 backdrop-blur-sm">
            <div className="font-pulp text-[8px] uppercase tracking-[0.3em] text-gold">🏷 Route notes</div>
            <ul className="mt-1 space-y-0.5">
              {routeNotes.map(({ flag, note }) => (
                <li key={flag} className="font-type text-[11px] leading-snug text-paper/75" title={flag}>
                  <span className="text-gold/90">{note || prettyFlagName(flag)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {onDone && (
        <div className="relative z-10 flex items-center justify-between border-t border-gold/25 px-6 py-4">
          <span className="font-type text-[11px] italic text-paper/40">
            Drag to pan · scroll to zoom
          </span>
          <button
            onClick={close}
            className="rm-continue border-2 border-gold bg-gold/10 px-7 py-2.5 font-pulp text-xs uppercase tracking-[0.22em] text-gold hover:bg-gold/30"
          >
            ▸ Continue
          </button>
        </div>
      )}
    </div>
  );
}
