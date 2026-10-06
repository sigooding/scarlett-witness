import { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  NodeResizer,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useUpdateNodeInternals,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Connection,
  type Edge,
  type EdgeProps,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
} from "@xyflow/react";
import { audio } from "../audio";
import { sceneRoutes, setSceneRouteTarget } from "../sceneRoutes";
import { DraftAutosave, draftKey, type DraftSaveStatus } from "./draftAutosave";
import { cloneScene, cloneStory } from "./cloneStory";
import { removeStoryScene, storyStructure } from "./storyEdits";
import { SceneNavigator } from "./SceneNavigator";
import { DialogFrame } from "../components/DialogFrame";
import { CREDITS_PRESETS, CREDITS_PRESET_GROUPS, CREDITS_PRESET_LIST, applyCreditsPreset, creditsLookSummary, matchCreditsPreset } from "../credits";
import {
  BODY_FONTS,
  HEADING_FONTS,
  HUD_THEMES,
  HUD_THEME_LIST,
  inGameThemeVars,
} from "../cinematic";
import {
  characterOpinion,
  clamp,
  collectFlags,
  normalizeLegacyStory,
  collectMemoryTags,
  deepClone,
  effectiveChoiceGating,
  encodeStory,
  flagSetSources,
  meetsGating,
  METER_LABELS,
  METER_SHORT,
  prettyFlagName,
  episodeOfScene,
  unassignedScenes,
  seasonEpisodes,
  stageFloor as stageFloorOf,
  storyEdges,
  CURSOR_ICON,
  CURSOR_SLOTS,
  CORE_VERB_IDS,
  VERB_ICON,
  VERB_IDS,
  VERB_LABEL,
  verbsForScene,
  hotspotReachableActions,
  uid,
  validateStory,
  type ValidationIssue,
} from "../logic";
import { MediaLibrary, AssetDropdown, MediaUploadButton, CharacterVoiceFiles } from "./MediaLibrary";
import { ImagePicker } from "./ImagePicker";
import { EXTRA_PRESET, SheetLab, SpriteSheetControls, TALKING_PRESET, WALKER_PRESET } from "./SheetEditor";
import { SheetSprite } from "../game/SheetSprite";
import { sheetDrawable } from "../game/spriteSheet";
import { SpriteCutoutLab } from "./SpriteCutout";
import { SheetSplitter } from "./SheetSplitter";
import { BackgroundRemover } from "./BackgroundRemover";
import { PlaytestCoveragePanel } from "./PlaytestCoverage";
import { DeepLinkBuilder } from "./DeepLinkBuilder";
import { SpriteBoxEditor } from "./SpriteBoxEditor";
import { CinematicControls } from "./CinematicControls";
import { AiImageStudio } from "./AiImageStudio";
import { EpisodeEditor } from "./EpisodeEditor";
import { ActEditor, ACT_TINTS } from "./ActEditor";
import { HelpNote, StudioHelpModal } from "./StudioHelp";
import { EmptyCanvasHint, StudioCoach, StudioTipLayer, TAB_GROUPS, TAB_LABELS, TAB_TIPS, type StudioTabId } from "./StudioCoach";
import {
  SCENE_CARD_DEFAULT_H,
  SCENE_CARD_DEFAULT_W,
  healLayout,
  sceneCardMinHeight,
  tidyLayoutPositions,
} from "./canvas";
import {
  audioTagsForModel,
  ELEVENLABS_MODELS,
  convertConfirmMessage,
  estimateVoiceCost,
  getElevenKey,
  getElevenModel,
  modelSupportsAudioTags,
  setElevenKey,
  setElevenModel,
  synthesizeElevenLabs,
} from "./aiVoice";
import {
  clearVoiceFolder,
  isDesktop,
  linkVoiceFolder,
  loadPersistedVoiceFolder,
  requestVoiceFolderPermission,
  saveGeneratedVoice,
  voiceFolderSupported,
} from "./voiceFiles";
import {
  CollapsibleSection,
  CommitTextArea,
  Field,
  inputCls,
  bgStyle,
  mediaField,
} from "./studioLeaves";
import { scenesInAct } from "../game/routeGraph";
import { assetBackground, assetUrl } from "../assetPath";
import {
  importStoryAssets,
  compactStoryMedia,
  uploadAsset,
  uploadDataUrlAsset,
  useResolvedMedia,
  useAllAssets,
  useStorageAvailable,
} from "../data/mediaLibrary";
import { onFileMenu } from "../game/saveFiles";
import { EXPORT_PREVIEW_LIMIT, exportPreviewText, createPortableStoryBundle } from "./exportBundle";
import { caseFilesAvailable, openCaseFile, parseCaseFile, saveCaseFile, suggestedCaseName, tailCasePath } from "./caseFiles";
import type {
  Character,
  Consequences,
  Contradiction,
  CreditsSettings,
  CursorKind,
  CursorArt,
  Gating,
  GlobalState,
  Hotspot,
  HotspotAction,
  HotspotState,
  InventorySettings,
  Item,
  MapLocation,
  MediaAsset,
  MeterKey,
  SceneNode,
  StageScriptStep,
  Story,
} from "../types";

/* ------------------------------------------------------------------ */

const ATTITUDE_STROKE: Record<string, string> = {
  Sultry: "#ff2e88",
  Aggressive: "#e23b4e",
  Clever: "#2ad9d9",
  Neutral: "#8b8b9e",
  Hotspot: "#e8b23c",
};

const BACKGROUNDS = [
  "/img/bg-office.jpg",
  "/img/bg-club.jpg",
  "/img/bg-alley.jpg",
  "/img/bg-penthouse.jpg",
  "/img/bg-dressing.jpg",
  "gradient:linear-gradient(135deg,#1e1b4b 0%,#831843 100%)",
  "gradient:linear-gradient(135deg,#134e4a 0%,#312e81 100%)",
  "gradient:linear-gradient(160deg,#713f12 0%,#0c0c14 70%)",
  "gradient:linear-gradient(135deg,#0c0c14 0%,#2b2b3f 100%)",
  // More ready-made pulp locations shipped in /img, so authors have a real set
  // to pick from without uploading. APPENDED after the first nine so the index
  // defaults used elsewhere (BACKGROUNDS[0], [2], [8]) stay stable.
  "/img/bg-diner-booth.jpg",
  "/img/bg-neon-diner.jpg",
  "/img/bg-jazz-club.jpg",
  "/img/bg-casino.jpg",
  "/img/bg-backroom-casino.jpg",
  "/img/bg-docks.jpg",
  "/img/bg-corridor.jpg",
  "/img/bg-basement.jpg",
  "/img/bg-vault.jpg",
  "/img/bg-safehouse.jpg",
  "/img/bg-mini-mart.jpg",
  "/img/bg-saltflats.jpg",
];

const AMBIENTS = ["none", "rain", "jazz", "drone", "tension"];

/** The title-sequence faces as CSS variables — used by the credits preset
 * picker to render each card's name in the very typeface the look dials in.
 * Inline vars rather than `font-*` classes so the map stays data-driven. */
const CREDITS_FONT_VAR: Record<string, string> = {
  pulp: "var(--font-pulp)",
  poster: "var(--font-poster)",
  elegant: "var(--font-elegant)",
  epic: "var(--font-epic)",
  modern: "var(--font-modern)",
  type: "var(--font-type)",
};
const METERS: MeterKey[] = ["Sultry", "Aggressive", "Clever", "Suspicion"];

/**
 * VerbMenuPiePreview — the object-first verb menu (the skull pie)
 * rendered at editor scale, so authors can tune it without a playtest: the
 * ring of verb chips + the centrepiece `verbMenuIcon` sprite. Same geometry
 * as Stage.tsx, shrunk.
 */
function VerbMenuPiePreview({
  verbs,
  icon,
  media,
  size = 200,
}: {
  verbs: CursorKind[];
  icon?: string;
  media: (v?: string) => string | undefined;
  size?: number;
}) {
  const n = Math.max(1, verbs.length);
  const R = size * 0.36; // verb ring radius (in-game 128 / 340 ≈ 0.376)
  const center = size / 2;
  return (
    <div
      className="relative shrink-0 rounded-full border border-noir-600 bg-noir-950/80"
      style={{ width: size, height: size, boxShadow: "0 0 30px rgba(232,178,60,0.18)" }}
    >
      {verbs.map((v, i) => {
        const rad = ((i * 360) / n - 90) * (Math.PI / 180);
        const x = center + R * Math.cos(rad);
        const y = center + R * Math.sin(rad);
        return (
          <div
            key={v}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 rounded-full border border-noir-600 bg-noir-950/95 px-2 py-1"
            style={{ left: x, top: y }}
          >
            <span className="text-base leading-none" aria-hidden>
              {VERB_ICON[v]}
            </span>
            <span className="font-pulp text-[6px] uppercase tracking-widest text-paper/70">{v}</span>
          </div>
        );
      })}
      {/* centrepiece — the story's verbMenuIcon (or the default skull) */}
      <div
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border-2 border-gold/60 bg-noir-950 shadow-[0_0_18px_rgba(232,178,60,0.35)]"
        style={{ width: size * 0.31, height: size * 0.31 }}
      >
        {icon?.startsWith("emoji:") ? (
          <span className="text-2xl leading-none">{icon.slice("emoji:".length)}</span>
        ) : icon ? (
          <img src={assetUrl(media(icon) ?? icon)} alt="" draggable={false} className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl leading-none">💀</span>
        )}
      </div>
    </div>
  );
}

/**

/** Remove stale `*-backup-pre-r*` keys left behind by content migrations.
 * These are the biggest hidden consumer of localStorage quota and are never
 * needed again — clearing them is safe and frees room for new saves. */
function clearStaleStorageBackups() {
  try {
    const doomed: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && /-backup-pre-r/.test(k)) doomed.push(k);
    }
    doomed.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* storage may already be unusable — nothing else to do */
  }
}

/* ------------------------------------------------------------------ */
/*  scene node card                                                    */
/* ------------------------------------------------------------------ */

type SceneNodeData = {
  scene: SceneNode;
  /** Author-set card size from Story.layout (absent = default width). */
  cardW?: number;
  cardH?: number;
  isStart: boolean;
  issueCount: number;
  /** which episode owns this scene, when the story is packed into a season */
  episodeNumber?: number;
  episodeTitle?: string;
  /** true when this scene opens its episode */
  isEpisodeStart?: boolean;
  /** which act owns this scene, derived from the graph walk (not declared) */
  actLabel?: string;
  actTitle?: string;
  actDot?: string;
  /** true when this scene is an act's nominated opening scene */
  isActStart?: boolean;
  /** true when more than one act's walk reaches this scene */
  actConflict?: boolean;
  /** true when this scene is on the lit path from the start scene to the
   *  selected one — the "where the story is" highlight */
  onPath?: boolean;
  /** Raw background reference (asset: / path / gradient: / video:) — kept tiny
   * so ReactFlow node data stays serializable and cheap. Resolved to a real URL
   * at render time via the MediaResolverContext below. */
  backgroundRef: string;
};

/** Provides the media resolver to node cards without putting a (non-serializable
 * and potentially stale) function or huge data URLs into ReactFlow node data —
 * both of which have caused the canvas to blank out. */
const MediaResolverContext = createContext<(v?: string) => string | undefined>(() => undefined);

const SceneFlowNode = memo(function SceneFlowNode({ data }: NodeProps) {
  const { scene, isStart, issueCount, backgroundRef, episodeNumber, episodeTitle, isEpisodeStart, actLabel, actTitle, actDot, isActStart, actConflict, onPath, cardW, cardH } = data as SceneNodeData;
  const resolveMedia = useContext(MediaResolverContext);
  const backgroundPreview = resolveMedia(backgroundRef) ?? backgroundRef;
  const isEnd = !!scene.isEnding;
  const routes = useMemo(() => sceneRoutes(scene), [scene]);
  const extraRoutes = routes.filter((r) => !r.handle.startsWith("choice:"));
  const updateNodeInternals = useUpdateNodeInternals();
  const handleSignature = routes.map((r) => r.handle).join("|");
  useEffect(() => { updateNodeInternals(scene.id); }, [scene.id, handleSignature, isEnd, updateNodeInternals]);
  const cardBorder =
    scene.nodeType === "credits"
      ? "border-neon shadow-[0_0_15px_rgba(255,46,136,0.3)]"
      : scene.nodeType === "cutscene"
        ? "border-cyan-neon shadow-[0_0_15px_rgba(42,217,217,0.3)]"
        : onPath
          ? "border-gold/80 shadow-[0_0_14px_rgba(232,178,60,0.3)]"
          : isStart
            ? "border-gold/80"
            : isEnd
            ? "border-crimson/60"
            : "border-noir-600";

  // Inline rename editor. window.prompt() does not exist in the Electron
  // shell (or a sandboxed iframe), so the card edits its own title in place:
  // click to type, Enter or click away saves, Esc cancels.
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const editingRef = useRef(false);
  const titleInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (editing) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [editing]);
  const startRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraftTitle(scene.title);
    editingRef.current = true;
    setEditing(true);
  };
  const commitRename = () => {
    if (!editingRef.current) return;
    editingRef.current = false;
    setEditing(false);
    const title = draftTitle.trim();
    // Notes may be empty (the card shows a placeholder); scene titles may not.
    if ((title || scene.nodeType === "note") && title !== scene.title) {
      window.dispatchEvent(
        new CustomEvent("scarlet-rename-scene", { detail: { sceneId: scene.id, title, isNote: scene.nodeType === "note" } })
      );
    }
  };
  const cancelRename = () => {
    if (!editingRef.current) return;
    editingRef.current = false;
    setEditing(false);
  };

  // MEASURED MINIMUM HEIGHT. Declared here, ABOVE the note-node early return,
  // so the hook order is identical on every render path — React requires it.
  // A pixel estimate can only approximate real rendered text (a choice that
  // wraps to two lines is taller than any formula thinks), so measure the card
  // itself: scrollHeight exceeds clientHeight exactly when content is clipped.
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [measuredOverflow, setMeasuredOverflow] = useState(0);
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    // MEASURE THE OVERFLOW, NOT THE HEIGHT — and never ratchet.
    //
    // This used to record `scrollHeight` and only ever grow ("lowering the
    // floor would fight the author's drag"). But the background preview is
    // `flex-1` on a resized card: it EXPANDS to fill whatever height you drag
    // to, so scrollHeight equals the card's current height. Growing a card
    // therefore raised its own minimum to the new size, and the floor could
    // never come back down — once you pulled a card out far enough for the
    // plate to reach its full aspect ratio, it was stuck there permanently.
    // The ratchet also outlived the content: deleting six choices left the
    // tall floor behind.
    //
    // What actually matters is whether content is CLIPPED, which is the gap
    // between scrollHeight and clientHeight. That is zero on a comfortably
    // sized card at any size, so the floor falls back to the content-derived
    // minimum and the card shrinks freely.
    const measure = () => {
      const over = Math.max(0, el.scrollHeight - el.clientHeight);
      setMeasuredOverflow((prev) => (prev === over ? prev : over));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scene.choices?.length, scene.hotspots?.length, scene.note, scene.title, actLabel, episodeNumber, cardW]);

  // ---- note placeholder node -------------------------------------------
  // An author marker ("Missing Scene Here") that wires into the graph on both
  // sides but is BYPASSED in play. One clickable body (type what belongs
  // here), one target handle, one outgoing "route out" handle.
  if (scene.nodeType === "note") {
    const route = (scene.choices ?? [])[0];
    return (
      <div
        className={`scene-card ${cardW ? "" : "w-56"} flex h-full flex-col border-2 border-dashed border-gold/70 bg-[#171410] text-paper shadow-[0_0_14px_rgba(232,178,60,0.2)]`}
        style={
          cardW
            ? {
                width: Math.max(SCENE_CARD_DEFAULT_W, cardW),
                height: cardH,
                minWidth: SCENE_CARD_DEFAULT_W,
                minHeight: SCENE_CARD_DEFAULT_H,
              }
            : undefined
        }
      >
      {/* RESIZE — drag any edge/corner. Only shows on the selected card so a
          busy canvas stays clean. Width/height land in Story.layout via the
          onNodesChange "dimensions" branch. A card with no authored size keeps
          the default w-56, so untouched stories look exactly as before. */}
      <NodeResizer
        minWidth={SCENE_CARD_DEFAULT_W}
        minHeight={SCENE_CARD_DEFAULT_H}
        lineClassName="!border-gold/40"
        handleClassName="scarlet-resizer"
      />
        <Handle type="target" position={Position.Left} style={{ background: "#e8b23c" }} />
        <div className="flex shrink-0 items-center justify-between gap-1 border-b border-dashed border-gold/30 px-2 py-1">
          <span className="min-w-0 flex-1 truncate font-pulp text-[10px] uppercase tracking-wider text-gold">
            📝 Note — bypassed in play
          </span>
          <span className="flex items-center gap-1 text-[9px]">
            {issueCount > 0 && (
              <span className="text-crimson" title={`${issueCount} issue(s)`}>
                ⚠{issueCount}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete note "${scene.title || "(empty)"}"?`)) {
                  window.dispatchEvent(new CustomEvent("scarlet-delete-scene", { detail: scene.id }));
                }
              }}
              className="ml-1 font-pulp px-1 text-crimson hover:text-white"
              title="Delete this note"
            >
              ✕
            </button>
          </span>
        </div>
        {editing ? (
          <textarea
            ref={(el) => {
              titleInputRef.current = el;
            }}
            className="nodrag nopan m-1 min-h-[64px] flex-1 resize-none overflow-auto border border-gold/70 bg-noir-950 p-2 font-type text-[11px] leading-snug text-paper outline-none focus:border-gold"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              e.stopPropagation();
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") commitRename();
              else if (e.key === "Escape") cancelRename();
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label="Note text"
            title="Ctrl+Enter or click away saves · Esc cancels"
            spellCheck={false}
          />
        ) : (
          <div
            className="m-1 min-h-[64px] flex-1 cursor-text overflow-auto whitespace-pre-wrap break-words rounded border border-dashed border-gold/25 bg-noir-950/40 p-2 font-type text-[11px] leading-snug text-paper/85 hover:border-gold/50"
            title="Click to type what belongs here · drag to move the note"
            onClick={() => {
              setDraftTitle(scene.title);
              editingRef.current = true;
              setEditing(true);
            }}
          >
            {scene.title || <span className="italic text-paper/35">Missing Scene Here</span>}
          </div>
        )}
        <div className="relative shrink-0 border-t border-dashed border-gold/30 px-2 py-1 text-[9px] italic text-gold/70">
          {route?.targetSceneId ? "route out → wired" : "drag from here to route out →"}
          <Handle
            type="source"
            id={route ? `choice:${route.id}` : "new"}
            position={Position.Right}
            style={{ top: "50%", background: "#e8b23c" }}
          />
        </div>
      </div>
    );
  }

  // MINIMUM HEIGHT FROM CONTENT — see sceneCardMinHeight(). A single constant
  // can't serve both an empty ending and a scene with eight exits: too low and
  // the busy card clips its own connection handles (an invisible row is an
  // unwireable one), too high and a sparse card can't be shrunk.
  const minCardH = sceneCardMinHeight({
    isEnding: isEnd,
    choices: scene.choices?.length ?? 0,
    linkedHotspots: extraRoutes.length,
    hasEpisodeBand: episodeNumber !== undefined,
    hasActBand: !!actLabel,
    hasNote: !!scene.note,
  });


  // The floor is what the CONTENT needs: the computed minimum, plus anything
  // still clipped beyond it. Both terms shrink again when the content does.
  // Never below the default card either: a resize should only ever make a card
  // BIGGER than the one you started with. Dragging under the default was what
  // squashed the "drag to add choice" row out of the bottom of the card.
  const floorH = Math.max(SCENE_CARD_DEFAULT_H, minCardH + measuredOverflow);

  return (
    <div
      ref={cardRef}
      className={`scene-card ${cardW ? "" : "w-56"} flex h-full flex-col border-2 shadow-xl text-paper ${cardBorder} bg-noir-800`}
      // Clamp on RENDER too, not just in the resizer: a card sized before its
      // scene grew (or by an older build with a lower floor) would otherwise
      // stay clipped forever. minHeight lets it push back out on its own.
      style={
        cardW
          ? {
              width: Math.max(SCENE_CARD_DEFAULT_W, cardW),
              height: cardH,
              minWidth: SCENE_CARD_DEFAULT_W,
              minHeight: floorH,
            }
          : undefined
      }
    >
      {/* RESIZE — drag any edge/corner. Only shows on the selected card so a
          busy canvas stays clean. Width/height land in Story.layout via the
          onNodesChange "dimensions" branch. A card with no authored size keeps
          the default w-56, so untouched stories look exactly as before. */}
      <NodeResizer
        minWidth={SCENE_CARD_DEFAULT_W}
        minHeight={floorH}
        lineClassName="!border-gold/40"
        handleClassName="scarlet-resizer"
      />
      <Handle type="target" position={Position.Left} style={{ background: "#8b8b9e" }} />
      <div className="flex shrink-0 items-center justify-between gap-1 border-b border-noir-600 px-2 py-1">
        {editing ? (
          <input
            ref={(el) => {
              titleInputRef.current = el;
            }}
            className="nodrag nopan min-w-0 flex-1 border border-gold/70 bg-noir-950 px-1 font-pulp text-[10px] uppercase tracking-wider text-paper outline-none focus:border-gold"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") commitRename();
              else if (e.key === "Escape") cancelRename();
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label="Scene name"
            title="Enter saves · Esc cancels"
            spellCheck={false}
          />
        ) : (
          <span
            className="min-w-0 flex-1 cursor-text truncate font-pulp text-[10px] uppercase tracking-wider text-gold hover:text-paper"
            title="Click to rename this scene"
            onClick={startRename}
          >
            {scene.nodeType === "credits" && "🎬 CREDITS · "}
            {scene.nodeType === "cutscene" && "🎥 CUTSCENE · "}
            {scene.nodeType === "stage" && (scene.hideHud ? "🚶 STAGE · NO HUD · " : "🚶 STAGE · ")}
            {isStart && "★ START · "}
            {isEnd && !isStart && !scene.nodeType && "🏁 END · "}
            {scene.title}
          </span>
        )}
        <span className="flex items-center gap-1 text-[9px]">
          {scene.isEnding && <span title="Ending — no output">🏁</span>}
          {isStart && <span title="Start scene — return routes are allowed">★</span>}
          {issueCount > 0 && (
            <span className="text-crimson" title={`${issueCount} issue(s)`}>
              ⚠{issueCount}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isStart) {
                alert("Cannot delete the start scene. Assign another start scene first.");
                return;
              }
              if (confirm(`Delete scene "${scene.title}"?`)) {
                // We dispatch a custom delete trigger or handle it in StudioInner
                const ev = new CustomEvent("scarlet-delete-scene", { detail: scene.id });
                window.dispatchEvent(ev);
              }
            }}
            className="ml-1 text-crimson hover:text-white font-pulp px-1"
            title="Delete this scene"
          >
            ✕
          </button>
        </span>
      </div>
      <div
        // On a hand-resized card the preview takes the leftover height (that is
        // the point of making a card bigger); otherwise it keeps its fixed
        // 56px strip. min-h-14 stops it collapsing when the exits are tall.
        className={`relative w-full ${cardH ? "min-h-14 flex-1" : "h-14 shrink-0"}`}
        style={bgStyle(backgroundPreview ?? scene.background)}
      >
        {scene.background.startsWith("video:") && (
          <span className="absolute inset-0 flex items-center justify-center text-2xl" title="Video cutscene">🎥</span>
        )}
        {isStart && <span className="absolute left-1 top-1 rounded bg-gold/20 px-1 text-[8px] text-gold">START</span>}
        {isEnd && <span className="absolute right-1 top-1 rounded bg-crimson/20 px-1 text-[8px] text-crimson">NO OUTPUT</span>}
      </div>
      {episodeNumber !== undefined && (
        <div className="flex items-center gap-1 border-b border-crimson/25 bg-crimson/10 px-2 py-0.5" title={`Episode ${episodeNumber}: ${episodeTitle}`}>
          <span className="font-pulp text-[8px] uppercase tracking-widest text-crimson">
            {isEpisodeStart ? "▸ OPENS" : "🎞"} Ep {episodeNumber}
          </span>
          <span className="min-w-0 flex-1 truncate font-type text-[8px] text-paper/50">{episodeTitle}</span>
        </div>
      )}
      {actLabel && (
        <div
          className="flex items-center gap-1 border-b px-2 py-0.5"
          style={{ borderColor: `${actDot}40`, background: `${actDot}14` }}
          title={actConflict ? `Claimed by more than one act — a choice links across the boundary` : `${actLabel}${actTitle ? `: ${actTitle}` : ""}`}
        >
          <span className="font-pulp text-[8px] uppercase tracking-widest" style={{ color: actDot }}>
            {isActStart ? "▸ OPENS" : "🎭"} {actLabel}
          </span>
          <span className="min-w-0 flex-1 truncate font-type text-[8px] text-paper/50">{actTitle}</span>
          {actConflict && <span className="shrink-0 text-[8px] text-crimson" title="Two acts reach this scene">⚠</span>}
        </div>
      )}
      {scene.note && (
        <div className="border-b border-gold/25 bg-gold/10 px-2 py-1" title={scene.note}>
          <span className="font-pulp text-[8px] uppercase tracking-widest text-gold">📝 note · </span>
          <span className={`font-type text-[8px] leading-tight text-paper/70 ${cardH ? "line-clamp-6" : "line-clamp-2"}`}>{scene.note}</span>
        </div>
      )}
      <div className="shrink-0 px-2 py-1 text-[9px] text-paper/50">
        ⌖ {scene.hotspots?.length ?? 0} hotspots · 💬 {scene.dialogueBeats?.length ?? 0} beats
      </div>
      <div className="shrink-0 divide-y divide-noir-600/60 border-t border-noir-600">
        {!isEnd &&
          (scene.choices ?? []).map((c) => (
            <div key={c.id} className="relative px-2 py-1 pr-4 text-[9px] leading-tight text-paper/75">
              <span style={{ color: ATTITUDE_STROKE[c.attitudeTag ?? "Neutral"] }}>▸</span> {c.text.slice(0, 34)}
              {c.text.length > 34 && "…"}
              <Handle
                type="source"
                id={`choice:${c.id}`}
                position={Position.Right}
                style={{ top: "50%", background: ATTITUDE_STROKE[c.attitudeTag ?? "Neutral"] }}
              />
            </div>
          ))}
        {!isEnd && extraRoutes.map((route) => (
          <div key={route.id} className="relative px-2 py-1 pr-4 text-[9px] leading-tight text-gold/75" title={route.label}>
            {route.label}
            <Handle type="source" id={route.handle} position={Position.Right}
              style={{ top: "50%", background: route.kind === "auto" ? "#2ad9d9" : "#e8b23c" }} />
          </div>
        ))}
        {!isEnd && (
          <div className="relative px-2 py-1 pr-4 text-[9px] italic text-paper/35">
            drag to add choice →
            <Handle type="source" id="new" position={Position.Right} style={{ top: "50%", background: "#4a4a5e" }} />
          </div>
        )}
        {isEnd && (
          <div className="px-2 py-1 text-[9px] italic text-crimson/60">ending — no outgoing connections</div>
        )}
      </div>
    </div>
  );
});

const nodeTypes = { scene: SceneFlowNode };

const RemovableEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <button
            className="flex h-5 w-5 items-center justify-center rounded-full border border-crimson bg-noir-950 text-[10px] text-crimson hover:scale-125 hover:bg-crimson hover:text-white transition-all shadow-[0_0_10px_rgba(226,59,78,0.5)]"
            onClick={(e) => {
              e.stopPropagation();
              const ev = new CustomEvent("scarlet-delete-edge", { detail: id });
              window.dispatchEvent(ev);
            }}
            title="Remove connection"
            aria-label="Remove connection"
            data-route-id={id}
          >
            ✕
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const edgeTypes = { removable: RemovableEdge };

/* ------------------------------------------------------------------ */
/*  small form helpers                                                 */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* SCRIPTED SEQUENCES — the compact step-list editor shared by the      */
/* runScript hotspot action and the stage tab's room-entry script.      */
/* One row per step: pick what it does, fill in the fields that kind    */
/* needs. Stage-only by design — classic scenes never see scripts.      */

const SCRIPT_STEP_KINDS: { v: StageScriptStep["do"]; label: string }[] = [
  { v: "walkTo", label: "🚶 Player walks to" },
  { v: "face", label: "↔ Player faces" },
  { v: "pose", label: "🧍 Player pose" },
  { v: "say", label: "💬 Say line" },
  { v: "wait", label: "⏱ Wait" },
  { v: "npcWalkTo", label: "🚶 NPC walks to" },
  { v: "npcMotion", label: "🎭 NPC motion" },
  { v: "setFlag", label: "🚩 Set flag" },
  { v: "goToScene", label: "→ Go to scene (ends script)" },
];

/** A fresh step of the given kind with sensible defaults. */
function defaultScriptStep(kind: StageScriptStep["do"], npcIds: string[], sceneId: string): StageScriptStep {
  switch (kind) {
    case "walkTo":
      return { do: "walkTo", x: 50, y: 80 };
    case "face":
      return { do: "face", dir: "left" };
    case "pose":
      return { do: "pose" };
    case "say":
      return { do: "say", text: "" };
    case "wait":
      return { do: "wait", seconds: 1 };
    case "npcWalkTo":
      return { do: "npcWalkTo", npcId: npcIds[0] ?? "", x: 50, y: 80 };
    case "npcMotion":
      return { do: "npcMotion", npcId: npcIds[0] ?? "" };
    case "setFlag":
      return { do: "setFlag", flag: "" };
    case "goToScene":
      return { do: "goToScene", targetSceneId: sceneId };
  }
}

function ScriptEditor({
  steps,
  onChange,
  npcIds,
  scenes,
  onPickPoint,
  picking,
}: {
  steps: StageScriptStep[];
  onChange: (next: StageScriptStep[]) => void;
  /** Ambient NPC ids in this scene (for the NPC step targets). */
  npcIds: string[];
  scenes: { id: string; title: string }[];
  /** Armed from a row: the next plate click becomes that step's x/y
   *  (the cutscene recorder — no hand-typed coordinates). */
  onPickPoint?: (index: number, npc: boolean) => void;
  /** Which row is currently waiting for its plate click. */
  picking?: { index: number; npc: boolean } | null;
}) {
  const upd = (i: number, patch: Record<string, unknown>) =>
    onChange(steps.map((s, si) => (si === i ? ({ ...s, ...patch } as StageScriptStep) : s)));
  const swap = (i: number, j: number) => {
    if (j < 0 || j >= steps.length) return;
    const next = steps.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const num = (v: string, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };
  return (
    <div className="space-y-1">
      {steps.map((st, i) => (
        <div key={i} className="rounded border border-noir-700 bg-noir-950/60 p-1.5">
          <div className="flex items-center gap-1">
            <span className="w-4 text-right font-type text-[9px] text-paper/40">{i + 1}</span>
            <select
              className={`${inputCls} flex-1`}
              value={st.do}
              onChange={(e) => onChange(steps.map((s, si) => (si === i ? defaultScriptStep(e.target.value as StageScriptStep["do"], npcIds, scenes[0]?.id ?? "") : s)))}
            >
              {SCRIPT_STEP_KINDS.map((k) => (
                <option key={k.v} value={k.v}>{k.label}</option>
              ))}
            </select>
            <button className="px-1 text-[10px] text-paper/50 hover:text-paper" title="Move up" onClick={() => swap(i, i - 1)}>▲</button>
            <button className="px-1 text-[10px] text-paper/50 hover:text-paper" title="Move down" onClick={() => swap(i, i + 1)}>▼</button>
            <button className="px-1 text-[10px] text-red-300/70 hover:text-red-300" title="Remove step" onClick={() => onChange(steps.filter((_, si) => si !== i))}>✕</button>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1 pl-5">
            {(st.do === "npcWalkTo" || st.do === "npcMotion" || (st.do === "say" && npcIds.length > 0)) && (
              <select
                className={`${inputCls} w-auto min-w-[90px] flex-none`}
                value={("npcId" in st ? st.npcId : "") ?? ""}
                onChange={(e) => upd(i, { npcId: e.target.value || undefined })}
                title="Which actor"
              >
                {st.do === "say" ? <option value="">player</option> : null}
                {npcIds.map((id) => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            )}
            {(st.do === "walkTo" || st.do === "npcWalkTo") && (
              <>
                <input className={`${inputCls} w-16 flex-none`} type="number" value={st.x} title="x % of the walkable world" onChange={(e) => upd(i, { x: num(e.target.value, st.x) })} />
                <input className={`${inputCls} w-16 flex-none`} type="number" value={st.y} title="y % of the stage floor" onChange={(e) => upd(i, { y: num(e.target.value, st.y) })} />
                {onPickPoint ? (
                  <button
                    onClick={() => onPickPoint(i, st.do === "npcWalkTo")}
                    className={`flex-none border px-1.5 py-0.5 font-pulp text-[8px] uppercase tracking-widest ${
                      picking?.index === i ? "border-neon bg-neon/20 text-neon" : "border-neon/40 bg-noir-900 text-neon/80 hover:bg-neon/10"
                    }`}
                    title={picking?.index === i ? "Waiting for a plate click — pick again to cancel" : "Click the stage plate to set this target visually"}
                  >
                    {picking?.index === i ? "Picking…" : "Pick on plate"}
                  </button>
                ) : null}
              </>
            )}
            {st.do === "face" && (
              <select className={`${inputCls} w-auto flex-none`} value={st.dir} onChange={(e) => upd(i, { dir: e.target.value })}>
                <option value="left">left</option>
                <option value="right">right</option>
              </select>
            )}
            {st.do === "pose" && (
              <input className={`${inputCls} flex-1`} value={st.pose ?? ""} placeholder="pose animation name (empty = back to idle)" onChange={(e) => upd(i, { pose: e.target.value || undefined })} />
            )}
            {st.do === "say" && (
              <input className={`${inputCls} flex-1`} value={st.text} placeholder="the spoken line" onChange={(e) => upd(i, { text: e.target.value })} />
            )}
            {st.do === "wait" && (
              <>
                <input className={`${inputCls} w-16 flex-none`} type="number" step="0.1" min="0" value={st.seconds} onChange={(e) => upd(i, { seconds: Math.max(0, num(e.target.value, st.seconds)) })} />
                <span className="text-[9px] text-paper/40">seconds</span>
              </>
            )}
            {st.do === "npcMotion" && (
              <>
                <input className={`${inputCls} w-24 flex-none`} value={st.anim ?? ""} placeholder="motion" title="Named sheet animation" onChange={(e) => upd(i, { anim: e.target.value || undefined })} />
                <input className={`${inputCls} flex-1`} value={st.say ?? ""} placeholder="say line" onChange={(e) => upd(i, { say: e.target.value || undefined })} />
                <select className={`${inputCls} w-auto flex-none`} value={st.facing ?? ""} title="Face" onChange={(e) => upd(i, { facing: e.target.value || undefined })}>
                  <option value="">face —</option>
                  <option value="left">left</option>
                  <option value="right">right</option>
                </select>
              </>
            )}
            {st.do === "setFlag" && (
              <input className={`${inputCls} flex-1`} value={st.flag} placeholder="flag id" onChange={(e) => upd(i, { flag: e.target.value })} />
            )}
            {st.do === "goToScene" && (
              <select className={`${inputCls} flex-1`} value={st.targetSceneId} onChange={(e) => upd(i, { targetSceneId: e.target.value })}>
                {scenes.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      ))}
      <button
        className="rounded border border-noir-600 px-2 py-0.5 text-[10px] text-paper/70 hover:border-neon hover:text-neon"
        onClick={() => onChange([...steps, defaultScriptStep(steps.length ? "say" : "walkTo", npcIds, scenes[0]?.id ?? "")])}
      >
        ＋ add step
      </button>
    </div>
  );
}




function resizeImageFile(file: File, maxSize = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Unsupported image"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/* ---------- cursor art (in-game theme) ---------- */
/** Per-verb cursor art. Lives on the 🎮 In-game theme tab and previews in the
 *  case's own theme, at real size, over a scrap of the plate — because a cursor
 *  is the one piece of UI the player touches literally everywhere. */
function CursorArtEditor({
  story,
  onUpdate,
  media,
  themeVars,
}: {
  story: Story;
  onUpdate: (next: Story) => void;
  media: (v?: string) => string | undefined;
  themeVars: React.CSSProperties;
}) {
  const [openSlot, setOpenSlot] = useState<string | null>(null);
  const art = story.cursorArt ?? {};
  const setSlot = (slot: string, patch: Partial<CursorArt>) => {
    const next = deepClone(story);
    next.cursorArt = { ...(next.cursorArt ?? {}) };
    (next.cursorArt as Record<string, CursorArt>)[slot] = { ...((art as Record<string, CursorArt>)[slot] ?? {}), ...patch };
    onUpdate(next);
  };
  const clearSlot = (slot: string) => {
    const next = deepClone(story);
    next.cursorArt = { ...(next.cursorArt ?? {}) };
    delete (next.cursorArt as Record<string, CursorArt | undefined>)[slot];
    if (!Object.keys(next.cursorArt).length) next.cursorArt = undefined;
    onUpdate(next);
  };
  return (
    <div className="space-y-1.5 border border-gold/30 bg-gold/5 p-2" style={themeVars}>
      <div className="font-pulp text-[9px] uppercase tracking-widest text-gold">🖱 Cursor art (per verb)</div>
      <p className="font-type text-[9px] leading-snug text-paper/45">
        Replace the system cursors with art: a pointing hand for <b>take</b>, an eye for <b>look</b>, a turning key
        for <b>use</b>. Give a verb a static <b>image</b> and it becomes the real mouse cursor; give it a <b>sprite
        sheet</b> and it animates as it follows the mouse. <b>default</b> is the plain arrow everywhere else. Nothing
        here is required — no art means the game keeps its system cursors.
      </p>
      {CURSOR_SLOTS.map((slot) => {
        const a = (art as Record<string, CursorArt | undefined>)[slot];
        const size = a?.size ?? 32;
        const open = openSlot === slot;
        const preview = (() => {
          if (a && sheetDrawable(a.sheet)) return <SheetSprite sheet={a.sheet!} anim="loop" fallbacks={["idle"]} height={Math.min(48, size)} />;
          if (a?.image) return <img src={assetUrl(media(a.image) ?? a.image)} alt="" className="w-auto object-contain" style={{ height: Math.min(48, size) }} />;
          return <span className="font-type text-[9px] uppercase tracking-widest text-paper/35">system cursor</span>;
        })();
        return (
          <div key={slot} className="border border-noir-700/70">
            <button
              className="flex w-full items-center gap-2 px-1.5 py-1 text-left hover:bg-noir-800/40"
              onClick={() => setOpenSlot(open ? null : slot)}
            >
              {/* the preview is a scrap of the plate, in the case's own theme */}
              <span className="relative flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden border border-gold/30 bg-noir-950">
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(232,178,60,0.12),transparent_70%)]" aria-hidden />
                {preview}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-pulp text-[9px] uppercase tracking-widest text-gold">
                  {CURSOR_ICON[slot] ?? "➤"} {slot}
                </span>
                <span className="block truncate font-type text-[9px] text-paper/45">
                  {a ? (sheetDrawable(a.sheet) ? "animated sprite sheet" : a.image ? "static image" : "empty") : "system cursor"}
                  {a ? ` · ${size}px · ${a.anchor === "center" ? "centred" : "tip: top-left"}` : ""}
                </span>
              </span>
              <span className="shrink-0 font-pulp text-[9px] text-paper/40">{open ? "▾" : "▸"}</span>
            </button>
            {open ? (
              <div className="space-y-1.5 border-t border-noir-700/70 p-1.5">
                <Field label="Static image (transparent PNG/WebP, ≤128px)">
                  <ImagePicker
                    preferFolder="sprites"
                    value={a?.image || undefined}
                    placeholder="Pick cursor art from the library…"
                    includeGradients={false}
                    onChange={(url) => setSlot(slot, { image: url ?? undefined, sheet: undefined })}
                  />
                </Field>
                {a?.image ? (
                  <div className="flex items-center gap-1">
                    <img src={assetUrl(media(a.image) ?? a.image)} alt="" className="h-8 w-auto object-contain" />
                    <button
                      className="border border-crimson/40 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
                      onClick={() => setSlot(slot, { image: undefined })}
                    >
                      ✕ remove
                    </button>
                  </div>
                ) : null}
                <div className="space-y-1 border border-cyan-neon/25 bg-cyan-neon/5 p-1.5">
                  <div className="font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">🎞 Animated cursor (sprite sheet)</div>
                  <p className="font-type text-[9px] leading-snug text-paper/45">
                    A looping sprite that follows the mouse — a reaching hand, a blinking eye. Beats the 128px CSS
                    cursor limit and can be any size.
                  </p>
                  <SpriteSheetControls
                    value={a?.sheet}
                    storyId={story.id}
                    preset={EXTRA_PRESET}
                    onChange={(sheet) => setSlot(slot, { sheet, image: sheet ? undefined : a?.image })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <Field label="Hotspot point">
                    <select className={inputCls} value={a?.anchor ?? "top-left"} onChange={(e) => setSlot(slot, { anchor: e.target.value as CursorArt["anchor"] })}>
                      <option value="top-left">top-left (pointing)</option>
                      <option value="center">centre (reticle)</option>
                    </select>
                  </Field>
                  <Field label={`Size ${size}px`}>
                    <input type="range" min={16} max={96} step={2} className="w-full accent-gold" value={size} onChange={(e) => setSlot(slot, { size: Number(e.target.value) })} />
                  </Field>
                </div>
                <button
                  className="w-full border border-paper/30 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/50 hover:text-crimson"
                  onClick={() => clearSlot(slot)}
                >
                  ⟲ back to the system cursor
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- character editor ---------- */
function ItemEditor({ story, onUpdate }: { story: Story; onUpdate: (next: Story) => void }) {
  return (
    <div className="space-y-2 border border-noir-600 p-2 bg-noir-800/40">
      <h3 className="font-pulp text-[10px] uppercase tracking-widest text-gold">Story Inventory (items granted by hotspots/choices)</h3>
      <p className="font-type text-[9px] text-paper/40">Add new items here — they become available in node dropdowns.</p>
      <div className="space-y-1.5">
        {story.items.map((item) => (
          <div key={item.id} className="flex gap-2 items-start border border-noir-600/70 p-2">
            <div className="flex flex-col gap-1 items-center">
              <input
                aria-label={`${item.name} icon emoji`}
                className="w-10 border border-noir-600 bg-noir-950 p-1 text-center text-xl"
                value={item.icon}
                onChange={(e) => {
                  const next = deepClone(story);
                  next.items.find((candidate) => candidate.id === item.id)!.icon = e.target.value;
                  onUpdate(next);
                }}
              />
              <label className="flex items-center justify-center cursor-pointer border border-cyan-neon/40 px-2 py-1 font-pulp text-[8px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10">
                ⇧
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    const result = await uploadAsset(story.id, file);
                    if (!result.success || !result.assetId) {
                      window.alert(result.error ?? "Upload failed.");
                      return;
                    }
                    const next = deepClone(story);
                    next.items.find((candidate) => candidate.id === item.id)!.iconUrl = `asset:${result.assetId}`;
                    onUpdate(next);
                  }}
                />
              </label>
              {item.iconUrl && (
                <button
                  onClick={() => {
                    const next = deepClone(story);
                    next.items.find((candidate) => candidate.id === item.id)!.iconUrl = undefined;
                    onUpdate(next);
                  }}
                  className="text-[8px] text-crimson hover:underline"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-type text-[9px] text-paper/35">{item.id}</span>
                <button
                  className="text-[9px] uppercase text-crimson hover:underline"
                  onClick={() => {
                    if (!window.confirm(`Delete ${item.name}? Existing gates will be flagged by Validator.`)) return;
                    const next = deepClone(story);
                    next.items = next.items.filter((candidate) => candidate.id !== item.id);
                    onUpdate(next);
                  }}
                >
                  delete
                </button>
              </div>
              <input
                className={inputCls}
                value={item.name}
                placeholder="Item name"
                onChange={(e) => {
                  const next = deepClone(story);
                  const it = next.items.find((x) => x.id === item.id)!;
                  it.name = e.target.value;
                  onUpdate(next);
                }}
              />
              <input
                className={inputCls}
                value={item.description}
                placeholder="Description"
                onChange={(e) => {
                  const next = deepClone(story);
                  const it = next.items.find((x) => x.id === item.id)!;
                  it.description = e.target.value;
                  onUpdate(next);
                }}
              />
              <label className="flex items-center gap-1 text-[9px] text-paper/40">
                <input
                  type="checkbox"
                  checked={!!item.isClue}
                  onChange={(e) => {
                    const next = deepClone(story);
                    const it = next.items.find((x) => x.id === item.id)!;
                    it.isClue = e.target.checked;
                    onUpdate(next);
                  }}
                />
                📌 is clue (appears on corkboard)
              </label>
              <div className="grid grid-cols-2 gap-1">
                <select
                  className={inputCls}
                  aria-label={`${item.name} combines with`}
                  value={item.combinableWith?.targetItemId ?? ""}
                  onChange={(e) => {
                    const next = deepClone(story);
                    const it = next.items.find((candidate) => candidate.id === item.id)!;
                    it.combinableWith = e.target.value
                      ? { targetItemId: e.target.value, resultItemId: it.combinableWith?.resultItemId ?? "" }
                      : undefined;
                    onUpdate(next);
                  }}
                >
                  <option value="">No recipe</option>
                  {story.items.filter((candidate) => candidate.id !== item.id).map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>+ {candidate.name}</option>
                  ))}
                </select>
                <select
                  className={inputCls}
                  aria-label={`${item.name} recipe result`}
                  disabled={!item.combinableWith?.targetItemId}
                  value={item.combinableWith?.resultItemId ?? ""}
                  onChange={(e) => {
                    const next = deepClone(story);
                    const it = next.items.find((candidate) => candidate.id === item.id)!;
                    if (it.combinableWith) it.combinableWith.resultItemId = e.target.value;
                    onUpdate(next);
                  }}
                >
                  <option value="">Result...</option>
                  {story.items.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>{candidate.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          const next = deepClone(story);
          next.items.push({
            id: `item_${uid()}`,
            name: "New Evidence",
            icon: "📜",
            description: "A newly discovered clue or prop.",
            flavorText: "Every mystery needs a fresh clue.",
            isClue: false,
          });
          onUpdate(next);
        }}
        className="w-full border border-cyan-neon/40 py-1.5 font-pulp text-[10px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
      >
        ＋ Add new item
      </button>
    </div>
  );
}

function useSpeechVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);
  return voices;
}

/** Live preview of a character's talking keyframes — cycles them on a timer so
 *  the author can see the mouth/pose animation they're building. */
function TalkingPreview({
  frames,
  duration,
  media,
}: {
  frames: string[];
  duration: number;
  media: (v?: string) => string | undefined;
}) {
  const resolved = frames.map((f) => media(f) ?? f).filter(Boolean);
  const resolvedKey = resolved.join("\u0000");
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
  }, [resolvedKey]);
  useEffect(() => {
    if (resolved.length <= 1) return;
    const hold = Math.max(0.04, duration) * 1000;
    let cancelled = false;
    let timer: number | null = null;
    const step = () => {
      timer = window.setTimeout(() => {
        if (cancelled) return;
        setI((v) => (v + 1) % resolved.length);
        step();
      }, hold);
    };
    step();
    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [resolved.length, duration]);
  if (!resolved.length) return <span className="font-type text-[9px] italic text-paper/35">No frames yet.</span>;
  return <img src={assetUrl(resolved[i])} alt="" className="h-24 w-auto max-w-full object-contain" />;
}

/** Global ElevenLabs settings for the Characters tab. The API key lives in
 *  localStorage only — never in the story data, saves, or exports. */
function AiVoiceSettings() {
  const [key, setKey] = useState(getElevenKey());
  const [model, setModel] = useState(getElevenModel());
  const desktop = isDesktop();
  const supported = voiceFolderSupported();
  const [folderName, setFolderName] = useState<string | null>(null);
  const [needsAuthorize, setNeedsAuthorize] = useState(false);

  // On load, re-discover a previously linked voice folder and whether it still
  // has write permission for this session.
  useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    void (async () => {
      const handle = await loadPersistedVoiceFolder();
      if (cancelled || !handle) return;
      const perm = await (handle.queryPermission?.({ mode: "readwrite" }) ?? "prompt");
      if (cancelled) return;
      if (perm === "granted") {
        setFolderName(handle.name);
        setNeedsAuthorize(false);
      } else if (perm === "prompt") {
        setFolderName(handle.name);
        setNeedsAuthorize(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supported]);

  const link = async () => {
    try {
      const handle = await linkVoiceFolder();
      if (!handle) return;
      setFolderName(handle.name);
      setNeedsAuthorize(false);
    } catch {
      /* the author cancelled the folder picker — nothing to do */
    }
  };
  const reauthorize = async () => {
    const handle = await loadPersistedVoiceFolder();
    if (!handle) {
      setFolderName(null);
      return;
    }
    const perm = await requestVoiceFolderPermission(handle);
    if (perm === "granted") setNeedsAuthorize(false);
    else window.alert("Voice-folder access wasn't authorised — MP3s will stay in the browser until it is. Use the browser prompt to allow it.");
  };
  const unlink = async () => {
    await clearVoiceFolder();
    setFolderName(null);
    setNeedsAuthorize(false);
  };

  return (
    <CollapsibleSection id="ai-voice-settings" title="🎙 AI Voice (ElevenLabs)" titleClass="text-neon" defaultOpen={false}>
      <p className="font-type text-[9px] leading-relaxed text-paper/45">
        Generate individual dialogue lines as MP3s from your ElevenLabs account — one line at a time, with a
        credit-cost confirm before every conversion. Assign each character a voice ID below (copy it from the
        ElevenLabs console — stock or cloned), then use the <b className="text-paper/70">🎙 Generate MP3</b> button on
        any dialogue line in a scene's Beats tab.
      </p>
      <Field label="API key (xi-api-key…)">
        <input
          className={inputCls}
          type="password"
          value={key}
          placeholder="Paste your ElevenLabs API key"
          onChange={(e) => {
            const v = e.target.value.trim();
            setKey(v);
            setElevenKey(v);
          }}
        />
      </Field>
      <Field label="Model">
        <select
          className={inputCls}
          value={model}
          onChange={(e) => {
            setModel(e.target.value);
            setElevenModel(e.target.value);
          }}
        >
          {ELEVENLABS_MODELS.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </Field>
      {desktop ? (
        <p className="font-type text-[8px] leading-relaxed text-paper/45">
          <b className="text-neon">Where MP3s go:</b> saved automatically as real files —{" "}
          <code className="text-gold">public/voices/&lt;person&gt;/&lt;scene&gt;/&lt;line&gt;.mp3</code> in this
          checkout — so they're in the repo and you can git-commit them with the story.
        </p>
      ) : supported ? (
        <div className="space-y-1.5">
          <Field label="Voice folder — where the MP3 files are saved">
            <div className="flex flex-wrap items-center gap-2">
              {folderName ? (
                <span className={needsAuthorize ? "text-gold" : "text-neon"}>
                  📁 {folderName} {needsAuthorize ? "· needs re-authorise" : "· linked ✓"}
                </span>
              ) : (
                <span className="text-paper/40">not linked — MP3s would stay in the browser only</span>
              )}
            </div>
          </Field>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => void link()} className="btn-tool" title="Pick the repo's public/voices folder">
              📁 {folderName ? "Re-link folder…" : "Link public/voices folder…"}
            </button>
            {folderName && needsAuthorize && (
              <button onClick={() => void reauthorize()} className="btn-tool">
                Authorise access
              </button>
            )}
            {folderName && !needsAuthorize && (
              <button onClick={() => void unlink()} className="btn-tool">
                Unlink
              </button>
            )}
          </div>
          <p className="font-type text-[8px] leading-relaxed text-paper/35">
            Pick your repo's <code className="text-paper/60">public/voices</code> folder (create it first if
            missing). Each converted line is then written as a real file —{" "}
            <code className="text-paper/60">&lt;person&gt;/&lt;scene&gt;/&lt;line&gt;.mp3</code> — so it's in the
            repo and you can git-commit it. Without a linked folder the MP3 lives in this browser only.
          </p>
        </div>
      ) : (
        <p className="font-type text-[8px] leading-relaxed text-paper/45">
          <b className="text-gold">Where MP3s go:</b> this browser can't write files into the repo, so converted
          MP3s are kept in the browser's media library only (they export fine, but aren't in the repo). Use a
          Chromium browser with folder access, or the desktop app, to save them as committable files.
        </p>
      )}
      <p className="font-type text-[8px] text-paper/35">
        The key is stored in local browser/app storage only — it is never written into the story, saves, or
        exports. Match the model to your voices (v3 voices need Eleven v3).
      </p>
    </CollapsibleSection>
  );
}

function CharacterEditor({
  story,
  onUpdate,
  media,
}: {
  story: Story;
  onUpdate: (next: Story) => void;
  media: (v?: string) => string | undefined;
}) {
  const voices = useSpeechVoices();
  const [aiTestBusy, setAiTestBusy] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      <h3 className="font-pulp text-[10px] uppercase tracking-widest text-gold">Characters</h3>
      <AiVoiceSettings />
      {story.characters.map((c) => (
        <div key={c.id} className="flex gap-2 border border-noir-600 p-1.5">
          <div className="flex w-16 shrink-0 flex-col items-center gap-1">
            <div className="h-14 w-14 overflow-hidden border border-gold/40 bg-noir-950">
              {c.avatarUrl.startsWith("emoji:") ? (
                <div className="flex h-full w-full items-center justify-center text-2xl">{c.avatarUrl.slice(6) || "👤"}</div>
              ) : (
                <img src={assetUrl(media(c.avatarUrl) ?? c.avatarUrl)} alt={c.name} className="h-full w-full object-cover" />
              )}
            </div>
            <label className="cursor-pointer border border-cyan-neon/40 px-1 py-0.5 text-center text-[8px] uppercase tracking-wider text-cyan-neon hover:bg-cyan-neon/10">
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  try {
                    const resized = await resizeImageFile(file);
                    const result = await uploadDataUrlAsset(
                      story.id,
                      file.name.replace(/\.[^.]+$/, "") + ".jpg",
                      "image",
                      resized
                    );
                    if (!result.success || !result.assetId) {
                      window.alert(result.error ?? "Upload failed.");
                      return;
                    }
                    const next = deepClone(story);
                    next.characters.find((x) => x.id === c.id)!.avatarUrl = `asset:${result.assetId}`;
                    onUpdate(next);
                  } catch {
                    window.alert("That image could not be processed. Try JPG, PNG or WebP under 10 MB.");
                  }
                }}
              />
            </label>
            {!c.avatarUrl.startsWith("emoji:") && (
              <button
                className="text-[8px] uppercase text-crimson hover:underline"
                onClick={() => {
                  const next = deepClone(story);
                  next.characters.find((x) => x.id === c.id)!.avatarUrl = "emoji:👤";
                  onUpdate(next);
                }}
              >
                clear
              </button>
            )}
          </div>
          <div className="flex-1 space-y-0.5">
            <input
              className={inputCls}
              value={c.name}
              onChange={(e) => {
                const next = deepClone(story);
                const ch = next.characters.find((x) => x.id === c.id)!;
                ch.name = e.target.value;
                onUpdate(next);
              }}
            />
            <ImagePicker
              value={c.avatarUrl.startsWith("emoji:") ? undefined : c.avatarUrl}
              onChange={(v) => {
                const next = deepClone(story);
                next.characters.find((x) => x.id === c.id)!.avatarUrl = v ?? "emoji:👤";
                onUpdate(next);
              }}
              placeholder="🖼 pick a portrait from the image library…"
              preferFolder="sprites"
              includeGradients={false}
            />
            <input
              className={inputCls}
              placeholder="Emoji fallback (e.g. 🎭) or image URL"
              value={c.avatarUrl.startsWith("emoji:") ? c.avatarUrl.slice(6) : mediaField(c.avatarUrl)}
              onChange={(e) => {
                const next = deepClone(story);
                const raw = e.target.value.trim();
                next.characters.find((x) => x.id === c.id)!.avatarUrl = raw
                  ? raw.startsWith("http") || raw.startsWith("/") || raw.startsWith("data:") || raw.startsWith("asset:")
                    ? raw
                    : `emoji:${raw}`
                  : "emoji:👤";
                onUpdate(next);
              }}
            />
            <input
              className={inputCls}
              value={c.role}
              placeholder="Role"
              onChange={(e) => {
                const next = deepClone(story);
                const ch = next.characters.find((x) => x.id === c.id)!;
                ch.role = e.target.value;
                onUpdate(next);
              }}
            />
            <label className="flex items-center gap-1 text-[9px] text-paper/45">
              <input
                type="checkbox"
                checked={story.deduction?.suspectIds.includes(c.id) ?? false}
                onChange={(e) => {
                  const next = deepClone(story);
                  next.deduction = next.deduction ?? { suspectIds: [], connections: [] };
                  if (e.target.checked && !next.deduction.suspectIds.includes(c.id)) next.deduction.suspectIds.push(c.id);
                  if (!e.target.checked) {
                    next.deduction.suspectIds = next.deduction.suspectIds.filter((id) => id !== c.id);
                    next.deduction.connections = next.deduction.connections.filter((link) => link.a !== c.id && link.b !== c.id);
                  }
                  onUpdate(next);
                }}
              />
              Show this met character on corkboard
            </label>
            <div className="space-y-1 border border-noir-600/60 p-1.5">
              <div className="font-pulp text-[8px] uppercase tracking-widest text-cyan-neon">🎙 Voice (Web Speech)</div>
              <select
                className={inputCls}
                value={c.voice?.voiceName ?? ""}
                onChange={(e) => {
                  const next = deepClone(story);
                  const ch = next.characters.find((x) => x.id === c.id)!;
                  ch.voice = { ...(ch.voice ?? {}), voiceName: e.target.value || undefined };
                  onUpdate(next);
                }}
              >
                <option value="">Auto (persona-based)</option>
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-1">
                <label className="text-[8px] uppercase tracking-wider text-paper/45">
                  Pitch {c.voice?.pitch ?? 1}
                  <input
                    type="range" min={0.5} max={2} step={0.1}
                    value={c.voice?.pitch ?? 1}
                    className="w-full accent-pink-500"
                    onChange={(e) => {
                      const next = deepClone(story);
                      const ch = next.characters.find((x) => x.id === c.id)!;
                      ch.voice = { ...(ch.voice ?? {}), pitch: Number(e.target.value) };
                      onUpdate(next);
                    }}
                  />
                </label>
                <label className="text-[8px] uppercase tracking-wider text-paper/45">
                  Rate {c.voice?.rate ?? 0.9}
                  <input
                    type="range" min={0.5} max={1.5} step={0.05}
                    value={c.voice?.rate ?? 0.9}
                    className="w-full accent-pink-500"
                    onChange={(e) => {
                      const next = deepClone(story);
                      const ch = next.characters.find((x) => x.id === c.id)!;
                      ch.voice = { ...(ch.voice ?? {}), rate: Number(e.target.value) };
                      onUpdate(next);
                    }}
                  />
                </label>
              </div>
              <button
                onClick={() => audio.speak(`Well hello, detective. ${c.name} speaking — do I sound right to you?`, c.id, c.voice)}
                className="w-full border border-neon/40 py-1 font-pulp text-[8px] uppercase tracking-widest text-neon hover:bg-neon/10"
              >
                ▶ Test voice
              </button>
              <p className="font-type text-[8px] text-paper/35">Tip: per-line MP3 voice files can be set on each dialogue beat (Beats tab).</p>
            </div>
            <div className="space-y-1 border border-noir-600/60 p-1.5">
              <div className="font-pulp text-[8px] uppercase tracking-widest text-neon">🎙 Voice (ElevenLabs AI)</div>
              <input
                className={inputCls}
                placeholder="Voice ID — from the ElevenLabs console (stock or clone)"
                value={c.elevenVoiceId ?? ""}
                onChange={(e) => {
                  const next = deepClone(story);
                  const ch = next.characters.find((x) => x.id === c.id)!;
                  ch.elevenVoiceId = e.target.value.trim() || undefined;
                  onUpdate(next);
                }}
              />
              <button
                disabled={!c.elevenVoiceId || aiTestBusy === c.id}
                onClick={async () => {
                  if (!c.elevenVoiceId) return;
                  const sample = `Well hello, detective. ${c.name || "Mystery voice"} speaking — do I sound right to you?`;
                  if (!window.confirm(convertConfirmMessage(`${c.name} (sample line)`, c.elevenVoiceId, getElevenModel(), sample))) return;
                  setAiTestBusy(c.id);
                  try {
                    const { dataUrl } = await synthesizeElevenLabs(sample, c.elevenVoiceId, getElevenModel());
                    await new Audio(dataUrl).play();
                  } catch (err) {
                    window.alert((err as Error).message);
                  } finally {
                    setAiTestBusy(null);
                  }
                }}
                className="w-full border border-neon/40 py-1 font-pulp text-[8px] uppercase tracking-widest text-neon hover:bg-neon/10 disabled:opacity-40"
              >
                {aiTestBusy === c.id ? "Converting sample…" : "▶ Test AI voice (spends credits)"}
              </button>
            </div>

            <CollapsibleSection
              id={`char-talking-${c.id}`}
              title="🗣 Talking animation"
              hint={(c.talkingFrames?.length ?? 0) ? `${c.talkingFrames!.length} frames` : undefined}
              titleClass="text-cyan-neon"
            >
              <p className="font-type text-[9px] leading-relaxed text-paper/45">
                Sprite frames that auto-cycle as a portrait while {c.name || "this character"} speaks in any scene — the animated-while-talking look. Transparent PNGs work best; they appear in-game the moment a dialogue beat in their voice starts.
              </p>

              <div className="flex items-center gap-2 border border-noir-600 bg-noir-950 p-1">
                <div className="flex h-24 items-center justify-center">
                  <TalkingPreview frames={c.talkingFrames ?? []} duration={c.talkingFrameDuration ?? 0.16} media={media} />
                </div>
                <span className="font-type text-[9px] text-paper/40">Live preview — this is how it animates in-game while they speak.</span>
              </div>

              {/* ---- one-image sprite sheet (takes over from the keyframes while set) ---- */}
              <div className="space-y-1 border border-cyan-neon/30 bg-cyan-neon/5 p-2">
                <div className="font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">🎞 Sprite-sheet portrait</div>
                <p className="font-type text-[9px] leading-snug text-paper/45">
                  One image holding all the mouth/pose frames in a grid instead of loose files. Name a
                  "talk" animation (plays while speaking) and a "rest" pose (held otherwise — a missing
                  "rest" holds talk frame 1). While a sheet is set it takes over from the keyframes below;
                  your keyframes stay saved and come back the moment you clear it. Position, scale and flip
                  still use the sliders below.
                </p>
                <SpriteSheetControls
                  value={c.talkingSheet}
                  storyId={story.id}
                  preset={TALKING_PRESET}
                  onChange={(sheet) => {
                    const next = deepClone(story);
                    next.characters.find((x) => x.id === c.id)!.talkingSheet = sheet;
                    onUpdate(next);
                  }}
                />
                {/* ---- alternate sheets: outfits / moods / poses ---- */}
                {(c.talkingSheet || (c.talkingSheets ?? []).length > 0) && (
                  <div className="mt-1 space-y-1 border border-purple-400/25 bg-purple-400/5 p-1.5">
                    <div className="font-pulp text-[9px] uppercase tracking-widest text-purple-300">🎭 Alternate sheets (outfits · moods · poses)</div>
                    <p className="font-type text-[8px] leading-snug text-paper/45">
                      Give a variant a name (e.g. <b>raincoat</b>, <b>furious</b>), then type that same name into a
                      dialogue beat's <b>expression</b> field — while this character speaks that beat, the variant's
                      sheet takes over. Every other beat uses the main sheet above.
                    </p>
                    {(c.talkingSheets ?? []).map((v, vi) => (
                      <div key={vi} className="space-y-1 border border-noir-700 p-1.5">
                        <div className="flex items-center gap-1">
                          <input
                            className="flex-1 border border-noir-600 bg-noir-950 px-2 py-1 text-xs text-paper focus:border-purple-300 outline-none"
                            value={v.name}
                            placeholder="variant name (matches beat expression)…"
                            onChange={(e) => {
                              const next = deepClone(story);
                              next.characters.find((x) => x.id === c.id)!.talkingSheets![vi].name = e.target.value;
                              onUpdate(next);
                            }}
                          />
                          <button
                            className="shrink-0 border border-crimson/50 px-2 py-1 font-pulp text-[9px] uppercase text-crimson hover:bg-crimson/10"
                            onClick={() => {
                              const next = deepClone(story);
                              const ch = next.characters.find((x) => x.id === c.id)!;
                              ch.talkingSheets = (ch.talkingSheets ?? []).filter((_, j) => j !== vi);
                              if (!ch.talkingSheets.length) delete ch.talkingSheets;
                              onUpdate(next);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                        <SpriteSheetControls
                          value={v.sheet}
                          storyId={story.id}
                          preset={TALKING_PRESET}
                          onChange={(sheet) => {
                            const next = deepClone(story);
                            const ch = next.characters.find((x) => x.id === c.id)!;
                            if (sheet) ch.talkingSheets![vi].sheet = sheet;
                            else {
                              ch.talkingSheets = (ch.talkingSheets ?? []).filter((_, j) => j !== vi);
                              if (!ch.talkingSheets.length) delete ch.talkingSheets;
                            }
                            onUpdate(next);
                          }}
                        />
                      </div>
                    ))}
                    <button
                      className="border border-purple-400/50 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-purple-300 hover:bg-purple-400/10"
                      onClick={() => {
                        const next = deepClone(story);
                        const ch = next.characters.find((x) => x.id === c.id)!;
                        const seed = ch.talkingSheet ?? ch.talkingSheets?.[0]?.sheet;
                        if (!seed) return;
                        ch.talkingSheets = [
                          ...(ch.talkingSheets ?? []),
                          { name: `variant ${(ch.talkingSheets?.length ?? 0) + 1}`, sheet: deepClone(seed) },
                        ];
                        onUpdate(next);
                      }}
                    >
                      ＋ Add alternate sheet
                    </button>
                  </div>
                )}
              </div>

              <Field label="Resting pose (shown when they're on scene but NOT speaking)">
                <div className="flex gap-1">
                  <ImagePicker
                    storyId={story.id}
                    includeBuiltins
                    includeGradients={false}
                    value={c.talkingRest}
                    onChange={(url) => { const next = deepClone(story); next.characters.find((x) => x.id === c.id)!.talkingRest = url || undefined; onUpdate(next); }}
                    placeholder="Resting pose (optional)…"
                  />
                  <MediaUploadButton
                    storyId={story.id}
                    accept="image/*"
                    label="⇧"
                    onUploaded={(_u, assetId) => { const next = deepClone(story); next.characters.find((x) => x.id === c.id)!.talkingRest = `asset:${assetId}`; onUpdate(next); }}
                  />
                </div>
                {c.talkingRest && (
                  <button onClick={() => { const next = deepClone(story); next.characters.find((x) => x.id === c.id)!.talkingRest = undefined; onUpdate(next); }} className="mt-1 text-[8px] uppercase text-crimson hover:underline">✕ clear resting pose</button>
                )}
              </Field>

              <div className="space-y-1">
                {(c.talkingFrames ?? []).map((f, i) => (
                  <div key={i} className="flex items-center gap-1 border border-noir-700/60 p-1">
                    <span className="w-4 shrink-0 text-center font-pulp text-[10px] text-paper/50">{i + 1}</span>
                    <img src={assetUrl(media(f) ?? f)} alt="" className="h-10 w-10 shrink-0 object-contain border border-noir-600 bg-noir-950" />
                    <span className="min-w-0 flex-1 truncate font-type text-[9px] text-paper/45" title={f}>
                      {f.startsWith("asset:") ? "uploaded image" : f.startsWith("data:") ? "(embedded)" : (f.split("/").pop() ?? f)}
                    </span>
                    <button
                      className="px-1 text-[10px] text-paper/50 hover:text-gold disabled:opacity-25"
                      disabled={i === 0}
                      title="Move earlier"
                      onClick={() => {
                        const next = deepClone(story);
                        const ch = next.characters.find((x) => x.id === c.id)!;
                        const arr = [...(ch.talkingFrames ?? [])];
                        [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                        ch.talkingFrames = arr;
                        onUpdate(next);
                      }}
                    >▲</button>
                    <button
                      className="px-1 text-[10px] text-paper/50 hover:text-gold disabled:opacity-25"
                      disabled={i === (c.talkingFrames?.length ?? 0) - 1}
                      title="Move later"
                      onClick={() => {
                        const next = deepClone(story);
                        const ch = next.characters.find((x) => x.id === c.id)!;
                        const arr = [...(ch.talkingFrames ?? [])];
                        [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
                        ch.talkingFrames = arr;
                        onUpdate(next);
                      }}
                    >▼</button>
                    <button
                      className="px-1 text-[10px] text-crimson hover:underline"
                      title="Remove this frame"
                      onClick={() => {
                        const next = deepClone(story);
                        const ch = next.characters.find((x) => x.id === c.id)!;
                        ch.talkingFrames = (ch.talkingFrames ?? []).filter((_, idx) => idx !== i);
                        onUpdate(next);
                      }}
                    >✕</button>
                  </div>
                ))}
              </div>

              <div className="flex gap-1">
                <ImagePicker
                  storyId={story.id}
                  includeBuiltins
                  includeGradients={false}
                  allowClear={false}
                  onChange={(url) => {
                    if (!url) return;
                    const next = deepClone(story);
                    const ch = next.characters.find((x) => x.id === c.id)!;
                    ch.talkingFrames = [...(ch.talkingFrames ?? []), url];
                    onUpdate(next);
                  }}
                  placeholder="＋ Pick a frame…"
                />
                <MediaUploadButton
                  storyId={story.id}
                  accept="image/*"
                  label="⇧ Upload"
                  onUploaded={(_u, assetId) => {
                    const next = deepClone(story);
                    const ch = next.characters.find((x) => x.id === c.id)!;
                    ch.talkingFrames = [...(ch.talkingFrames ?? []), `asset:${assetId}`];
                    onUpdate(next);
                  }}
                />
              </div>

              {/* Live preview over the opening scene — drag to place, corner-drag to resize. */}
              <SpriteBoxEditor
                mode="talking"
                backgroundUrl={(() => {
                  const bg = story.scenes.find((s) => s.id === story.startSceneId)?.background;
                  return bg ? media(bg) ?? bg : undefined;
                })()}
                image={(() => {
                  const f = c.talkingRest ?? (c.talkingFrames ?? []).find(Boolean);
                  return f ? media(f) ?? f : undefined;
                })()}
                sheet={c.talkingSheet}
                resolve={media}
                x={c.talkingX ?? 50}
                y={c.talkingY ?? 0}
                scale={c.talkingScale ?? 1}
                flip={!!c.talkingFlip}
                onChange={(p) => {
                  const next = deepClone(story);
                  const ch = next.characters.find((x) => x.id === c.id)!;
                  if (p.x !== undefined) ch.talkingX = p.x;
                  if (p.y !== undefined) ch.talkingY = p.y;
                  if (p.scale !== undefined) ch.talkingScale = p.scale;
                  onUpdate(next);
                }}
              />
              <div className="grid grid-cols-2 gap-2">
                <Field label={`Position X ${c.talkingX ?? 50}%`}>
                  <input type="range" min={0} max={100} step={1} className="w-full accent-pink-500" value={c.talkingX ?? 50}
                    onChange={(e) => { const next = deepClone(story); next.characters.find((x) => x.id === c.id)!.talkingX = Number(e.target.value); onUpdate(next); }} />
                </Field>
                <Field label={`Vertical ${c.talkingY ?? 0}%`}>
                  <input type="range" min={0} max={60} step={1} className="w-full accent-pink-500" value={c.talkingY ?? 0}
                    onChange={(e) => { const next = deepClone(story); next.characters.find((x) => x.id === c.id)!.talkingY = Number(e.target.value); onUpdate(next); }} />
                </Field>
                <Field label={`Scale ${(c.talkingScale ?? 1).toFixed(2)}×`}>
                  <input type="range" min={0.3} max={2} step={0.05} className="w-full accent-pink-500" value={c.talkingScale ?? 1}
                    onChange={(e) => { const next = deepClone(story); next.characters.find((x) => x.id === c.id)!.talkingScale = Number(e.target.value); onUpdate(next); }} />
                </Field>
                <Field label={`Frame time ${(c.talkingFrameDuration ?? 0.16).toFixed(2)}s`}>
                  <input type="range" min={0.04} max={0.6} step={0.02} className="w-full accent-pink-500" value={c.talkingFrameDuration ?? 0.16}
                    onChange={(e) => { const next = deepClone(story); next.characters.find((x) => x.id === c.id)!.talkingFrameDuration = Number(e.target.value); onUpdate(next); }} />
                </Field>
                <Field label={`Visibility when NOT speaking ${Math.round((c.talkingDim ?? 0.72) * 100)}% (100% = never fades)`}>
                  <input type="range" min={0.2} max={1} step={0.02} className="w-full accent-pink-500" value={c.talkingDim ?? 0.72}
                    onChange={(e) => {
                      const next = deepClone(story);
                      next.characters.find((x) => x.id === c.id)!.talkingDim = Number(e.target.value);
                      onUpdate(next);
                    }} />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-[9px] text-paper/55">
                <input type="checkbox" checked={!!c.talkingFlip} onChange={(e) => { const next = deepClone(story); next.characters.find((x) => x.id === c.id)!.talkingFlip = e.target.checked || undefined; onUpdate(next); }} />
                Mirror horizontally (face left) — pair with Position X so two speakers face each other
              </label>
              <p className="font-type text-[9px] text-paper/40">Cast: anyone who speaks in a scene appears here. Give characters different X positions (and mirror one) so they can face each other across the frame; the active speaker animates while the others hold their resting pose.</p>
            </CollapsibleSection>
          </div>
        </div>
      ))}
      <button
        onClick={() => {
          const next = deepClone(story);
          next.characters.push({ id: `ch_${uid()}`, name: "New Character", role: "Unknown", avatarUrl: "emoji:👤", trustMeter: 0 });
          onUpdate(next);
        }}
        className="w-full border border-cyan-neon/40 py-1.5 font-pulp text-[10px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
      >
        ＋ Add character
      </button>
    </div>
  );
}

/** Multi-flag picker. Selected flags render as removable chips, and typing
 * shows a dropdown (datalist) of every flag already defined in the story, so
 * authors can reuse names instead of re-typing them — the dropdown is how you
 * keep track of which flags exist. */
function FlagPicker({
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  value?: string[];
  onChange: (v: string[] | undefined) => void;
  suggestions?: string[];
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const listId = useRef(`flags-${uid()}`).current;
  const current = value ?? [];
  const available = (suggestions ?? []).filter((f) => !current.includes(f));

  const commitDraft = () => {
    const tokens = draft.split(",").map((s) => s.trim()).filter(Boolean);
    if (!tokens.length) {
      setDraft("");
      return;
    }
    const merged = [...current];
    for (const t of tokens) if (!merged.includes(t)) merged.push(t);
    onChange(merged.length ? merged : undefined);
    setDraft("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border border-noir-600 bg-noir-950 px-2 py-1 focus-within:border-neon">
      {current.map((f) => (
        <span key={f} className="flex items-center gap-1 border border-gold/40 bg-gold/10 px-1.5 py-0.5 text-[10px] leading-none text-gold" title={f}>
          <span className="max-w-[160px] truncate">{f}</span>
          <button
            type="button"
            onClick={() => onChange(current.filter((x) => x !== f).length ? current.filter((x) => x !== f) : undefined)}
            className="text-crimson hover:text-white"
            aria-label={`Remove flag ${f}`}
          >
            ✕
          </button>
        </span>
      ))}
      <input
        className="min-w-[110px] flex-1 bg-transparent py-0.5 text-xs text-paper outline-none placeholder:text-paper/30"
        list={listId}
        value={draft}
        placeholder={placeholder ?? "type or pick a flag…"}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commitDraft();
          } else if (e.key === "Backspace" && !draft && current.length) {
            onChange(current.slice(0, -1).length ? current.slice(0, -1) : undefined);
          }
        }}
        onBlur={commitDraft}
      />
      {available.length > 0 && (
        <datalist id={listId}>
          {available.map((f) => (
            <option key={f} value={f} />
          ))}
        </datalist>
      )}
    </div>
  );
}

/** Compact editor for a contradiction's outcome consequences: one heat
 * delta, one trust swing against the scene speaker, and any set flags. */
function LieConsequences({
  lie,
  field,
  story,
  onChange,
}: {
  lie: Contradiction;
  field: "contradictedConsequences" | "wrongConsequences";
  story: Story;
  onChange: (cons: Consequences | undefined) => void;
}) {
  const cons = lie[field];
  const setCons = (next: Consequences) => onChange(Object.values(next).some((v) => Array.isArray(v) && v.length) ? next : undefined);
  const heat = cons?.meterChanges?.find((m) => m.meter === "Suspicion")?.delta ?? 0;
  const trust = cons?.trustChanges?.[0]?.delta ?? 0;
  const trustChar = cons?.trustChanges?.[0]?.characterId ?? story.characters[0]?.id ?? "";
  const setHeat = (v: number) => {
    const list = (cons?.meterChanges ?? []).filter((m) => m.meter !== "Suspicion");
    if (v !== 0) list.push({ meter: "Suspicion", delta: v });
    setCons({ ...cons, meterChanges: list.length ? list : undefined });
  };
  const setTrust = (v: number) => {
    const list = (cons?.trustChanges ?? []).filter((t) => t.characterId !== trustChar);
    if (v !== 0) list.push({ characterId: trustChar, delta: v });
    setCons({ ...cons, trustChanges: list.length ? list : undefined });
  };
  return (
    <div className="space-y-1">
      <input
        type="number"
        className={inputCls}
        placeholder="Heat delta (e.g. -1 catch / +2 bluff)"
        value={heat || ""}
        onChange={(e) => setHeat(Number(e.target.value) || 0)}
      />
      <div className="flex gap-1">
        <select
          className={`${inputCls} w-24`}
          value={trustChar}
          onChange={(e) => {
            const list = (cons?.trustChanges ?? []).map((t) => ({ ...t, characterId: e.target.value }));
            setCons({ ...cons, trustChanges: list.length ? list : undefined });
          }}
        >
          {story.characters.map((c) => (
            <option key={c.id} value={c.id}>{c.name.split(" ")[0]}</option>
          ))}
        </select>
        <input
          type="number"
          className={inputCls}
          placeholder="Trust delta"
          value={trust || ""}
          onChange={(e) => setTrust(Number(e.target.value) || 0)}
        />
      </div>
      <FlagPicker
        value={cons?.setFlags}
        suggestions={[]}
        onChange={(v) => setCons({ ...cons, setFlags: v })}
        placeholder="set flag…"
      />
    </div>
  );
}

/** Single-flag input with a dropdown of every known flag in the story. */
function FlagInput({
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
  suggestions?: string[];
  placeholder?: string;
}) {
  const listId = useRef(`flaginput-${uid()}`).current;
  const available = (suggestions ?? []).filter((f) => f !== value);
  return (
    <>
      <input
        className={inputCls}
        list={listId}
        value={value ?? ""}
        placeholder={placeholder ?? "set a flag…"}
        onChange={(e) => onChange(e.target.value || undefined)}
      />
      {available.length > 0 && (
        <datalist id={listId}>
          {available.map((f) => (
            <option key={f} value={f} />
          ))}
        </datalist>
      )}
    </>
  );
}

function MeterGrid({
  value,
  onChange,
  label,
}: {
  value?: Partial<Record<MeterKey, number>>;
  onChange: (v: Partial<Record<MeterKey, number>> | undefined) => void;
  label: string;
}) {
  return (
    <Field label={label}>
      <div className="grid grid-cols-4 gap-1">
        {METERS.map((m) => (
          <input
            key={m}
            type="number"
            title={METER_LABELS[m]}
            placeholder={METER_SHORT[m]}
            className={inputCls}
            value={value?.[m] ?? ""}
            onChange={(e) => {
              const next = { ...(value ?? {}) };
              if (e.target.value === "") delete next[m];
              else next[m] = Number(e.target.value);
              onChange(Object.keys(next).length ? next : undefined);
            }}
          />
        ))}
      </div>
    </Field>
  );
}

function GatingEditor({
  gating,
  onChange,
  items = [],
  characters = [],
  flags = [],
  memoryTags = [],
  sectionId,
}: {
  gating?: Gating;
  onChange: (g: Gating | undefined) => void;
  items?: Item[];
  characters?: Character[];
  flags?: string[];
  /** Choice.memoryLog tags — the dropdown source for requiresMemories. */
  memoryTags?: string[];
  /** Unique id for this gate's own collapsible section (e.g. `beat-<id>`). */
  sectionId: string;
}) {
  const g = gating ?? {};
  const set = (patch: Partial<Gating>) => {
    const next = { ...g, ...patch };
    const empty =
      !next.requiresItems?.length &&
      !next.requiresFlags?.length &&
      !next.excludesItems?.length &&
      !next.excludesFlags?.length &&
      !next.requiresMemories?.length &&
      !next.minMeters &&
      !next.maxMeters &&
      !next.minTrust &&
      next.requiresAll === undefined;
    onChange(empty ? undefined : next);
  };
  const isActive =
    !!g.requiresItems?.length ||
    !!g.requiresFlags?.length ||
    !!g.excludesItems?.length ||
    !!g.excludesFlags?.length ||
    !!g.requiresMemories?.length ||
    !!g.minMeters ||
    !!g.maxMeters ||
    !!g.minTrust;
  return (
    <CollapsibleSection
      id={`gating-${sectionId}`}
      title="🔒 Gating rules"
      hint={isActive ? "active" : "none set"}
      titleClass="text-crimson"
    >
      <p className="border border-cyan-neon/20 bg-cyan-neon/5 p-2 font-type text-[9px] leading-snug text-paper/65">
        <b className="text-cyan-neon">What do these rules do?</b> A choice or hotspot is only offered when every gating rule is satisfied.
        Meters track the player's <b className="text-neon">Charm</b> (smooth-talking), <b className="text-crimson">Intimidate</b> (force),
        <b className="text-cyan-neon"> Deduce</b> (insight), and <b className="text-gold">Heat</b> (suspicion). They rise from
        choices tagged with that attitude. Use <b>Min meters</b> to require e.g. Charm 3+, or <b>Max meters</b> to lock out
        options once Heat gets too high. Use <b>Requires items/flags</b> for concrete story evidence.
      </p>
      <Field label="Requires item (player must be holding this)">
        <select
          className={inputCls}
          value={g.requiresItems?.[0] ?? ""}
          onChange={(e) => set({ requiresItems: e.target.value ? [e.target.value] : undefined })}
        >
          <option value="">— no required item —</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>{item.icon} {item.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Requires flags (from previous choices/hotspots)">
        <FlagPicker value={g.requiresFlags} onChange={(v) => set({ requiresFlags: v })} suggestions={flags} />
      </Field>
      <Field label="Remembers (memory tag OR flag — the player made that choice, or that flag is set)">
        <FlagPicker value={g.requiresMemories} onChange={(v) => set({ requiresMemories: v })} suggestions={memoryTags} placeholder="pick a memory tag or flag…" />
      </Field>
      <div className="grid grid-cols-2 gap-1">
        <Field label="Excludes item">
          <select
            className={inputCls}
            value={g.excludesItems?.[0] ?? ""}
            onChange={(e) => set({ excludesItems: e.target.value ? [e.target.value] : undefined })}
          >
            <option value="">— none —</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>{item.icon} {item.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Excludes flags">
          <FlagPicker value={g.excludesFlags} onChange={(v) => set({ excludesFlags: v })} suggestions={flags} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60">
        <input
          type="checkbox"
          checked={g.requiresAll !== false}
          onChange={(e) => set({ requiresAll: e.target.checked ? undefined : false })}
        />
        require ALL (unchecked = ANY satisfies)
      </label>
      <div className="border-t border-noir-700 pt-1">
        <MeterGrid
          label="Min meters — player must have AT LEAST this much (Charm/Intimidate/Deduce/Heat)"
          value={g.minMeters}
          onChange={(v) => set({ minMeters: v })}
        />
        <MeterGrid
          label="Max meters — player must have AT MOST this much"
          value={g.maxMeters}
          onChange={(v) => set({ maxMeters: v })}
        />
        <p className="mt-1 font-type text-[9px] text-paper/40">
          Meters go 0-10. To make a choice require a smooth opener: set Min meters → Charm 3. To hide a choice under too much heat: Max meters → Heat 3.
        </p>
      </div>
      {characters.length > 0 && (
        <div className="border-t border-noir-700 pt-1">
          <Field label="Minimum trust — a character must trust you this much before this unlocks (-5…+5)">
            <div className="grid grid-cols-2 gap-1">
              {characters.map((ch) => {
                const cur = g.minTrust?.[ch.id] ?? "";
                return (
                  <label key={ch.id} className="flex items-center gap-1 text-[9px] text-paper/60">
                    <span className="w-16 truncate">{ch.name.split(" ")[0]}</span>
                    <input
                      type="number"
                      className={inputCls}
                      value={cur}
                      onChange={(e) => {
                        const next = { ...(g.minTrust ?? {}) };
                        if (e.target.value === "") delete next[ch.id];
                        else next[ch.id] = Number(e.target.value);
                        set({ minTrust: Object.keys(next).length ? next : undefined });
                      }}
                    />
                  </label>
                );
              })}
            </div>
          </Field>
        </div>
      )}
    </CollapsibleSection>
  );
}

/* ------------------------------------------------------------------ */
/*  hotspot drawer preview                                             */
/* ------------------------------------------------------------------ */

type ZoneBounds = { x: number; y: number; w: number; h: number };
type ZoneHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

function HotspotCanvas({
  scene,
  items = [],
  selectedId,
  onSelect,
  onDraw,
  onMove,
  media,
  barrierMode,
  behindMode,
  occluders,
  selectedOccluder,
  onOccluderSelect,
  onOccluderDraw,
  onOccluderPoints,
  barriers = [],
  selectedBarrier,
  onBarrierSelect,
  onBarrierDraw,
  onBarrierMove,
  spawn,
  spawnMode,
  onSpawnMove,
  player,
  stageNpcs = [],
}: {
  scene: SceneNode;
  items?: Item[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDraw: (bounds: { x: number; y: number; w: number; h: number }) => void;
  /** Commit a MOVE/RESIZE of an existing hotspot (drag body / pull handles). */
  onMove?: (id: string, bounds: { x: number; y: number; w: number; h: number }) => void;
  media: (v?: string) => string | undefined;
  /** Draw NO-GO BARRIERS instead of hotspots (🚶 stage rooms). */
  barrierMode?: boolean;
  /** WALK-BEHIND draw mode — the desk/counter regions that cover the walker. */
  behindMode?: boolean;
  occluders?: { id?: string; points: { x: number; y: number }[]; baseline?: number; label?: string; visible?: boolean }[];
  selectedOccluder?: number | null;
  onOccluderSelect?: (i: number | null) => void;
  onOccluderDraw?: (bounds: { x: number; y: number; w: number; h: number }) => void;
  /** Corner editing — replaces one region's whole point list. */
  onOccluderPoints?: (i: number, points: { x: number; y: number }[]) => void;
  /** The room's no-go rectangles, always shown faintly as context. */
  barriers?: { x: number; y: number; w: number; h: number }[];
  selectedBarrier?: number | null;
  onBarrierSelect?: (i: number | null) => void;
  onBarrierDraw?: (bounds: { x: number; y: number; w: number; h: number }) => void;
  /** Commit a MOVE/RESIZE of an existing barrier (drag body / pull handles). */
  onBarrierMove?: (i: number, bounds: { x: number; y: number; w: number; h: number }) => void;
  /** 🚶 where the player character starts (scene %), drawn on the plate. */
  spawn?: { x: number; y: number };
  /** Dragging on the plate moves the player instead of drawing a box. */
  spawnMode?: boolean;
  onSpawnMove?: (p: { x: number; y: number }) => void;
  /** The walker art, so the marker is the actual character. */
  player?: { image?: string; sheet?: import("./../game/spriteSheet").SpriteSheet; scale?: number };
  /** AMBIENT CAST — drawn as ghosts on the plate so hotspots and barriers can
   *  be placed around the actors who will actually be standing there. */
  stageNpcs?: {
    id: string;
    x: number;
    y: number;
    scale?: number;
    image?: string;
    sheet?: import("./../game/spriteSheet").SpriteSheet;
  }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const floorBand = scene.stage?.floor;
  const onBarrierDrawRef = useRef(onBarrierDraw);
  onBarrierDrawRef.current = onBarrierDraw;
  const onOccluderDrawRef = useRef(onOccluderDraw);
  onOccluderDrawRef.current = onOccluderDraw;
  const onSpawnMoveRef = useRef(onSpawnMove);
  onSpawnMoveRef.current = onSpawnMove;
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const onBarrierMoveRef = useRef(onBarrierMove);
  onBarrierMoveRef.current = onBarrierMove;
  const onOccluderPointsRef = useRef(onOccluderPoints);
  onOccluderPointsRef.current = onOccluderPoints;
  /** MOVE/RESIZE an existing zone: drag its body to move it, pull the square
   *  handles on the selected one to resize. `drag` holds the gesture; `live`
   *  is the in-flight bounds drawn while the pointer is still down (committed
   *  once, on pointer-up). `liveRef` is the source of truth on release —
   *  React state can lag the last pointermove, which made reshape appear
   *  to do nothing. */
  const drag = useRef<{
    target: "hs" | "bar";
    id: string;
    index: number;
    mode: "move" | ZoneHandle;
    start: { x: number; y: number };
    orig: ZoneBounds;
  } | null>(null);
  const [live, setLive] = useState<{ target: "hs" | "bar"; id: string; index: number; b: ZoneBounds } | null>(null);
  const liveRef = useRef<{ target: "hs" | "bar"; id: string; index: number; b: ZoneBounds } | null>(null);
  /** True once the pointer actually travelled — suppresses the click that
   *  follows a drag so it doesn't toggle the selection. */
  const movedRef = useRef(false);
  /** WIDE WORLD: the canvas shows the whole strip shrunk to fit; pointer
   *  positions are scaled up to world-% and rendering scaled back down. */
  const worldW = Math.max(100, scene.stage?.worldWidth ?? 100);
  const scale = 100 / worldW;

  /** Live CORNER drag on a walk-behind: which region/vertex and where it is
   *  now. Committed on release, so one drag = one undo step. The ref is
   *  what pointermove/up read — the handle used to own those events, and
   *  a 12px handle that re-renders as it moves dropped the capture. */
  const [occDrag, setOccDrag] = useState<{ oi: number; pi: number; x: number; y: number } | null>(null);
  const occDragRef = useRef<{ oi: number; pi: number; x: number; y: number } | null>(null);

  const pct = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return {
      x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)) / scale,
      y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)),
    };
  };

  /** Turn the current pointer position into new bounds for the zone being
   *  moved/resized, clamped to the plate and a 2% minimum size. */
  const applyDrag = (p: { x: number; y: number }): ZoneBounds => {
    const d = drag.current!;
    const dx = p.x - d.start.x;
    const dy = p.y - d.start.y;
    const MIN = 2;
    if (d.mode === "move") {
      return {
        x: Math.min(Math.max(0, d.orig.x + dx), Math.max(0, worldW - d.orig.w)),
        y: Math.min(Math.max(0, d.orig.y + dy), Math.max(0, 100 - d.orig.h)),
        w: d.orig.w,
        h: d.orig.h,
      };
    }
    let L = d.orig.x;
    let T = d.orig.y;
    let R = d.orig.x + d.orig.w;
    let Bt = d.orig.y + d.orig.h;
    if (d.mode.includes("w")) L = Math.max(0, Math.min(L + dx, R - MIN));
    if (d.mode.includes("e")) R = Math.min(worldW, Math.max(R + dx, L + MIN));
    if (d.mode.includes("n")) T = Math.max(0, Math.min(T + dy, Bt - MIN));
    if (d.mode.includes("s")) Bt = Math.min(100, Math.max(Bt + dy, T + MIN));
    return { x: L, y: T, w: R - L, h: Bt - T };
  };

  const startZoneDrag = (
    e: React.PointerEvent,
    target: "hs" | "bar",
    id: string,
    index: number,
    mode: "move" | ZoneHandle,
    orig: ZoneBounds
  ) => {
    e.stopPropagation();
    e.preventDefault();
    movedRef.current = false;
    drag.current = { target, id, index, mode, start: pct(e), orig: { ...orig } };
    const liveVal = { target, id, index, b: { ...orig } };
    liveRef.current = liveVal;
    setLive(liveVal);
    // Capture on the plate: resize handles are 10px and move with the
    // live bounds, so capturing on the handle itself loses the pointer.
    ref.current?.setPointerCapture?.(e.pointerId);
  };

  return (
    <div
      ref={ref}
      className="relative aspect-video w-full cursor-crosshair touch-none select-none overflow-hidden border border-noir-600"
      style={bgStyle(media(scene.background) ?? scene.background)}
      onPointerMove={(e) => {
        // WALK-BEHIND corner drag — the plate owns the gesture so the
        // handle can move under the cursor without dropping capture.
        if (occDragRef.current) {
          const q = pct(e);
          const next = {
            ...occDragRef.current,
            x: Math.round(q.x * 10) / 10,
            y: Math.round(q.y * 10) / 10,
          };
          if (Math.abs(next.x - occDragRef.current.x) + Math.abs(next.y - occDragRef.current.y) > 0.05) {
            movedRef.current = true;
          }
          occDragRef.current = next;
          setOccDrag(next);
          return;
        }
        // MOVE/RESIZE in flight — track the pointer, commit on release.
        if (drag.current) {
          const p = pct(e);
          if (Math.abs(p.x - drag.current.start.x) + Math.abs(p.y - drag.current.start.y) > 0.3) movedRef.current = true;
          const d = drag.current;
          const liveVal = { target: d.target, id: d.id, index: d.index, b: applyDrag(p) };
          liveRef.current = liveVal;
          setLive(liveVal);
          return;
        }
        if (!start.current) return;
        const p = pct(e);
        // 🚶 player start: dragging moves the character (clamped to the floor
        // band, because that's where they can actually stand).
        if (spawnMode) {
          onSpawnMoveRef.current?.({ x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 });
          return;
        }
        setDraft({
          x: Math.min(start.current.x, p.x),
          y: Math.min(start.current.y, p.y),
          w: Math.abs(p.x - start.current.x),
          h: Math.abs(p.y - start.current.y),
        });
      }}
      onPointerDown={(e) => {
        if (drag.current) return;
        // In spawn mode a plain click places the character too.
        if (spawnMode && !(e.target as HTMLElement).dataset.bar && !(e.target as HTMLElement).dataset.hs) {
          start.current = pct(e);
          onSpawnMoveRef.current?.({ x: Math.round(start.current.x * 10) / 10, y: Math.round(start.current.y * 10) / 10 });
          return;
        }
        const hit = (e.target as HTMLElement).closest?.("[data-hs],[data-bar],[data-hd],[data-occ]") as HTMLElement | null;
        if (hit?.dataset.hs || hit?.dataset.bar || hit?.dataset.hd || hit?.dataset.occ) return;
        start.current = pct(e);
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
      onPointerUp={() => {
        // Commit a walk-behind corner drag (one undo step).
        if (occDragRef.current) {
          const d = occDragRef.current;
          const o = (occluders ?? [])[d.oi];
          if (o) {
            movedRef.current = true;
            onOccluderPointsRef.current?.(
              d.oi,
              o.points.map((q, qi) => (qi === d.pi ? { x: d.x, y: d.y } : q)),
            );
          }
          occDragRef.current = null;
          setOccDrag(null);
          return;
        }
        // Commit a MOVE/RESIZE (only if the bounds actually changed).
        if (drag.current) {
          const d = drag.current;
          const held = liveRef.current;
          const b = held && held.target === d.target && held.id === d.id && held.index === d.index ? held.b : d.orig;
          const r = {
            x: Math.round(b.x * 10) / 10,
            y: Math.round(b.y * 10) / 10,
            w: Math.round(b.w * 10) / 10,
            h: Math.round(b.h * 10) / 10,
          };
          const o = d.orig;
          const changed =
            r.x !== Math.round(o.x * 10) / 10 ||
            r.y !== Math.round(o.y * 10) / 10 ||
            r.w !== Math.round(o.w * 10) / 10 ||
            r.h !== Math.round(o.h * 10) / 10;
          if (changed) {
            if (d.target === "hs") {
              onMoveRef.current?.(d.id, r);
              onSelect(d.id);
            } else {
              onBarrierMoveRef.current?.(d.index, r);
              onBarrierSelect?.(d.index);
              onSelect("");
            }
          }
          drag.current = null;
          liveRef.current = null;
          setLive(null);
          return;
        }
        if (spawnMode) {
          start.current = null;
          setDraft(null);
          return;
        }
        if (draft && draft.w > 2 && draft.h > 2) {
          const bounds = {
            x: Math.round(draft.x * 10) / 10,
            y: Math.round(draft.y * 10) / 10,
            w: Math.round(draft.w * 10) / 10,
            h: Math.round(draft.h * 10) / 10,
          };
          if (behindMode) onOccluderDrawRef.current?.(bounds);
          else if (barrierMode) onBarrierDrawRef.current?.(bounds);
          else onDraw(bounds);
        }
        start.current = null;
        setDraft(null);
      }}
    >
      {scene.background.startsWith("video:") && (
        <video
          src={assetBackground(media(scene.background) ?? scene.background).slice(6)}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          muted
          loop
          autoPlay
        />
      )}
      {/* the walkable floor band — where the character may stand, and so
          where a barrier actually means something */}
      {floorBand ? (
        <div
          className="pointer-events-none absolute inset-x-0 border-y border-dashed border-cyan-neon/40 bg-cyan-neon/5"
          style={{ top: `${floorBand.top}%`, height: `${Math.max(0, floorBand.bottom - floorBand.top)}%` }}
        >
          <span className="absolute left-1 top-0 font-pulp text-[7px] uppercase tracking-widest text-cyan-neon/70">walkable floor</span>
        </div>
      ) : null}
      {/* WIDE WORLD: dashed viewport frames — what the player's camera
          shows at once. */}
      {worldW > 100 ? (
        <>
          {Array.from({ length: Math.floor(worldW / 100) }, (_, i) => {
            const left = i * 100 * scale;
            return (
              <div key={i}>
                <div className="pointer-events-none absolute inset-y-0 border-l-2 border-dashed border-cyan-neon/40" style={{ left: `${left}%` }} />
                <span className="pointer-events-none absolute z-[15] -translate-x-1/2 font-pulp text-[7px] uppercase tracking-widest text-cyan-neon/70" style={{ left: `${left}%`, top: 4 }}>
                  {i === 0 ? "▶ screen 1" : `▶ screen ${i + 1}`}
                </span>
              </div>
            );
          })}
        </>
      ) : null}
      {/* 🚶 THE PLAYER — where they start. Bright and named in spawn mode,
          a ghost in the other modes so you can place things around them. */}
      {spawn ? (
        <div
          className={`pointer-events-none absolute flex flex-col items-center ${spawnMode ? "" : "opacity-40"}`}
          style={{ left: `${spawn.x * scale}%`, top: `${spawn.y}%`, transform: "translate(-50%,-100%)", height: "28%" }}
          title="Player start"
        >
          {player && sheetDrawable(player.sheet) ? (
            <SheetSprite sheet={player.sheet!} anim="idle" fallbacks={["walk", "loop"]} height="100%" freezeOnFallback />
          ) : player?.image ? (
            <img src={assetUrl(media(player.image) ?? player.image)} alt="" className="h-full w-auto object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]" />
          ) : (
            <span className="text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">🚶</span>
          )}
          <span className={`mt-0.5 whitespace-nowrap font-pulp text-[7px] uppercase tracking-widest ${spawnMode ? "text-cyan-neon" : "text-paper/60"}`}>
            {spawnMode ? "🚶 player start — drag to move" : "🚶 start"}
          </span>
        </div>
      ) : null}
      {/* 🎭 THE AMBIENT CAST — the NPCs who will be standing in this room.
          Ghosted like the player start: the point is to place hotspots and
          barriers around the actors rather than discovering in playtest that
          a marker is behind someone's head. Not interactive here — the NPC
          tab owns positioning (drag them on its own plate). */}
      {stageNpcs.map((n, i) => (
        <div
          key={`npc-${n.id}-${i}`}
          className="pointer-events-none absolute flex flex-col items-center opacity-40"
          style={{
            left: `${n.x * scale}%`,
            top: `${n.y}%`,
            transform: "translate(-50%,-100%)",
            height: `${24 * (n.scale ?? 1)}%`,
          }}
          title={`${n.id} (ambient NPC — position it on the 🎭 NPCs tab)`}
        >
          {sheetDrawable(n.sheet) ? (
            <SheetSprite sheet={n.sheet!} anim="idle" fallbacks={["walk", "rest"]} height="100%" freezeOnFallback />
          ) : n.image && !n.image.startsWith("emoji:") ? (
            <img src={assetUrl(media(n.image) ?? n.image)} alt="" className="h-full w-auto object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]" />
          ) : (
            <span className="text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">{n.image?.startsWith("emoji:") ? n.image.slice(6) : "🚶"}</span>
          )}
          <span className="mt-0.5 whitespace-nowrap font-pulp text-[7px] uppercase tracking-widest text-teal-300/70">
            🎭 {n.id}
          </span>
        </div>
      ))}
      {/* NO-GO BARRIERS — hatched crimson. Click to select (then redraw to
          reshape); visible in both modes because they place the hotspots. */}
      {/* WALK-BEHIND regions — drawn as a violet wash with the depth line
          marked, so an author can see BOTH the shape and where "behind" ends.
          The plate can't show the real effect (the cutout is the background
          itself), so the baseline is what actually needs to be visible. */}
      {(occluders ?? []).map((o, oi) => {
        // Live drag preview: the dragged vertex follows the pointer while the
        // rest stay put, so the shape deforms under the cursor.
        const pts =
          occDrag && occDrag.oi === oi
            ? o.points.map((p, pi) => (pi === occDrag.pi ? { x: occDrag.x, y: occDrag.y } : p))
            : o.points;
        const xs = pts.map((p) => p.x);
        const ys = pts.map((p) => p.y);
        const x0 = Math.min(...xs), x1 = Math.max(...xs);
        const y0 = Math.min(...ys), y1 = Math.max(...ys);
        const base = o.baseline ?? y1;
        const sel = selectedOccluder === oi;
        return (
          <button
            key={`occ-${oi}`}
            data-occ="1"
            onClick={() => {
              if (movedRef.current) {
                movedRef.current = false;
                return;
              }
              onOccluderSelect?.(sel ? null : oi);
              onSelect("");
            }}
            className={`absolute border-2 ${sel ? "border-violet-400" : behindMode ? "border-violet-400/70" : "border-violet-400/25"} text-[8px] uppercase tracking-wider text-violet-300 ${o.visible === false ? "opacity-30" : ""}`}
            style={{
              left: `${x0 * scale}%`,
              top: `${y0}%`,
              width: `${(x1 - x0) * scale}%`,
              height: `${y1 - y0}%`,
              clipPath: `polygon(${pts
                .map((p) => `${(((p.x - x0) / Math.max(0.001, x1 - x0)) * 100).toFixed(2)}% ${(((p.y - y0) / Math.max(0.001, y1 - y0)) * 100).toFixed(2)}%`)
                .join(", ")})`,
              backgroundImage:
                "repeating-linear-gradient(-45deg, rgba(167,139,250,0.35) 0 6px, rgba(167,139,250,0.08) 6px 12px)",
            }}
            title={`Walk-behind ${o.label ?? oi + 1} — the walker is covered while their feet are above ${Math.round(base)}%`}
          >
            <span className="absolute left-1 top-0.5 truncate">
              {behindMode || sel ? `🪟 ${o.label ?? "behind"}` : ""}
            </span>
          </button>
        );
      })}
      {/* CORNER HANDLES — only on the selected region, and only in walk-behind
          mode. A dragged rectangle starts as four points, but the engine clips
          to any polygon, so pulling corners is what makes an L-shaped counter
          or a curved bar possible without hand-editing coordinates.
          Rendered OUTSIDE the clipped shape above: a handle sitting on the
          polygon's edge would be half-clipped and hard to grab. */}
      {behindMode && selectedOccluder != null && (occluders ?? [])[selectedOccluder]
        ? (() => {
            const oi = selectedOccluder;
            const o = occluders![oi];
            const pts =
              occDrag && occDrag.oi === oi
                ? o.points.map((p, pi) => (pi === occDrag.pi ? { x: occDrag.x, y: occDrag.y } : p))
                : o.points;
            return pts.map((p, pi) => (
              <div
                key={`occ-h-${oi}-${pi}`}
                data-occ="1"
                className="absolute z-30 h-3 w-3 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-violet-200 bg-violet-500 shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
                style={{ left: `${p.x * scale}%`, top: `${p.y}%`, touchAction: "none" }}
                title={`Corner ${pi + 1} — drag to reshape · double-click to remove`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const d = { oi, pi, x: p.x, y: p.y };
                  occDragRef.current = d;
                  setOccDrag(d);
                  movedRef.current = false;
                  // Capture on the plate so moving this 12px handle doesn't
                  // drop the pointer (the handle follows the corner).
                  ref.current?.setPointerCapture?.(e.pointerId);
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // A polygon needs 3 points; refuse to cut below that rather
                  // than silently producing an un-renderable shape.
                  if (o.points.length <= 3) return;
                  onOccluderPoints?.(oi, o.points.filter((_q, qi) => qi !== pi));
                }}
              />
            ));
          })()
        : null}
      {/* EDGE MIDPOINTS — click one to ADD a corner there. This is how a
          4-point box becomes an L: split the edge, then drag the new point. */}
      {behindMode && selectedOccluder != null && (occluders ?? [])[selectedOccluder]
        ? (() => {
            const oi = selectedOccluder;
            const o = occluders![oi];
            return o.points.map((p, pi) => {
              const q = o.points[(pi + 1) % o.points.length];
              const mx = (p.x + q.x) / 2;
              const my = (p.y + q.y) / 2;
              return (
                <button
                  key={`occ-m-${oi}-${pi}`}
                  data-occ="1"
                  className="absolute z-30 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-200/70 bg-noir-950/80 hover:scale-150 hover:bg-violet-400"
                  style={{ left: `${mx * scale}%`, top: `${my}%` }}
                  title="Add a corner here"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const next = [...o.points];
                    next.splice(pi + 1, 0, { x: Math.round(mx * 10) / 10, y: Math.round(my * 10) / 10 });
                    onOccluderPoints?.(oi, next);
                  }}
                />
              );
            });
          })()
        : null}
      {/* the depth lines, OUTSIDE the clipped shape so they're never cut off */}
      {(occluders ?? []).map((o, oi) => {
        const ys = o.points.map((p) => p.y);
        const base = o.baseline ?? Math.max(...ys);
        if (!behindMode && selectedOccluder !== oi) return null;
        return (
          <div
            key={`occ-base-${oi}`}
            className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-violet-300/80"
            style={{ top: `${base}%` }}
          >
            <span className="absolute right-1 -top-3 font-type text-[8px] text-violet-300/90">
              behind above {Math.round(base)}%
            </span>
          </div>
        );
      })}
      {barriers.map((b, bi) => {
        const bb = live && live.target === "bar" && live.index === bi ? live.b : b;
        return (
        <button
          key={`bar-${bi}`}
          data-bar="1"
          onClick={() => {
            if (movedRef.current) {
              movedRef.current = false;
              return;
            }
            onBarrierSelect?.(selectedBarrier === bi ? null : bi);
            onSelect("");
          }}
          onPointerDown={(e) => {
            if (!barrierMode || behindMode) return;
            startZoneDrag(e, "bar", "", bi, "move", b);
          }}
          className={`absolute border-2 ${selectedBarrier === bi ? "border-crimson" : barrierMode ? "border-crimson/70" : "border-crimson/25"} ${barrierMode ? "cursor-move" : ""} text-[8px] uppercase tracking-wider text-crimson`}
          style={{
            left: `${bb.x * scale}%`,
            top: `${bb.y}%`,
            width: `${bb.w * scale}%`,
            height: `${bb.h}%`,
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(226,59,78,0.35) 0 6px, rgba(226,59,78,0.08) 6px 12px)",
          }}
          title={`No-go barrier ${bi + 1} — drag to move; select it and pull the square handles to resize`}
        >
          <span className="absolute left-1 top-0.5 truncate">{barrierMode || selectedBarrier === bi ? "🚧 no-go" : ""}</span>
        </button>
        );
      })}
      {(scene.hotspots ?? []).map((h) => {
        const grantedItem = h.showItemImage && h.action.itemGranted ? items.find((i) => i.id === h.action.itemGranted) : undefined;
        const hb = live && live.target === "hs" && live.id === h.id ? live.b : h.bounds;
        return (
          <button
            key={h.id}
            data-hs="1"
            onClick={() => {
              if (movedRef.current) {
                movedRef.current = false;
                return;
              }
              onSelect(h.id);
            }}
            onPointerDown={(e) => {
              if (barrierMode || spawnMode || behindMode) return;
              startZoneDrag(e, "hs", h.id, -1, "move", h.bounds);
            }}
            className={`absolute border-2 text-[8px] uppercase tracking-wider ${
              selectedId === h.id ? "border-neon bg-neon/20 text-neon" : "border-gold/70 bg-gold/10 text-gold"
            } ${barrierMode || behindMode ? "pointer-events-none opacity-40" : spawnMode ? "" : "cursor-move"}`}
            style={{ left: `${hb.x * scale}%`, top: `${hb.y}%`, width: `${hb.w * scale}%`, height: `${hb.h}%` }}
            title={`${h.label} — drag to move; select it and pull the square handles to resize`}
          >
            {h.image ? (
              <>
                <img
                  src={assetUrl(media(h.image) ?? h.image)}
                  alt=""
                  className={`pointer-events-none absolute inset-0 ${
                    h.imageFit === "cover" ? "h-full w-full object-cover" : "m-auto max-h-full max-w-full object-contain"
                  }`}
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-noir-950/75 px-1 py-0.5 text-[7px]">
                  {h.remote ? "🔭 " : ""}{h.label}
                </span>
              </>
            ) : grantedItem ? (
              grantedItem.iconUrl ? (
                <img src={assetUrl(media(grantedItem.iconUrl) ?? grantedItem.iconUrl)} alt={grantedItem.name} className="pointer-events-none absolute inset-0 m-auto max-h-full max-w-full object-contain" />
              ) : (
                <span className="pointer-events-none text-xl">{grantedItem.icon}</span>
              )
            ) : (
              `${h.remote ? "🔭 " : ""}${h.label.slice(0, 12)}`
            )}
          </button>
        );
      })}
      {/* RESIZE HANDLES — eight squares on the selected zone's edges/corners.
          Pull one to resize; the body itself drags to move. */}
      {(() => {
        const selHs = !barrierMode && !spawnMode && !behindMode && selectedId ? (scene.hotspots ?? []).find((h) => h.id === selectedId) : undefined;
        const selBarB = barrierMode && selectedBarrier != null ? barriers[selectedBarrier] : undefined;
        if (!selHs && !selBarB) return null;
        const target: "hs" | "bar" = selHs ? "hs" : "bar";
        const id = selHs?.id ?? "";
        const index = selHs ? -1 : (selectedBarrier as number);
        const base = selHs ? selHs.bounds : (selBarB as ZoneBounds);
        const cur = live && live.target === target && live.id === id && live.index === index ? live.b : base;
        const color = target === "hs" ? "border-neon" : "border-crimson";
        const HANDLES: { m: ZoneHandle; fx: number; fy: number; c: string }[] = [
          { m: "nw", fx: 0, fy: 0, c: "nwse-resize" },
          { m: "n", fx: 0.5, fy: 0, c: "ns-resize" },
          { m: "ne", fx: 1, fy: 0, c: "nesw-resize" },
          { m: "e", fx: 1, fy: 0.5, c: "ew-resize" },
          { m: "se", fx: 1, fy: 1, c: "nwse-resize" },
          { m: "s", fx: 0.5, fy: 1, c: "ns-resize" },
          { m: "sw", fx: 0, fy: 1, c: "nesw-resize" },
          { m: "w", fx: 0, fy: 0.5, c: "ew-resize" },
        ];
        return HANDLES.map((hd) => (
          <div
            key={hd.m}
            data-hd="1"
            className={`absolute z-20 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 border-2 bg-noir-950 ${color}`}
            style={{
              left: `${(cur.x + cur.w * hd.fx) * scale}%`,
              top: `${cur.y + cur.h * hd.fy}%`,
              cursor: hd.c,
            }}
            onPointerDown={(e) => startZoneDrag(e, target, id, index, hd.m, base)}
            title="Drag to resize"
          />
        ));
      })()}
      {draft && (
        <div
          className={`absolute border-2 border-dashed ${behindMode ? "border-violet-400 bg-violet-400/10" : barrierMode ? "border-crimson bg-crimson/10" : "border-cyan-neon bg-cyan-neon/10"}`}
          style={{ left: `${draft.x * scale}%`, top: `${draft.y}%`, width: `${draft.w * scale}%`, height: `${draft.h}%` }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  simulated playtester                                               */
/* ------------------------------------------------------------------ */

function Playtester({ story, scene }: { story: Story; scene: SceneNode | null }) {
  const flags = useMemo(() => collectFlags(story), [story]);
  const memoryTags = useMemo(() => collectMemoryTags(story), [story]);
  const [on, setOn] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<Set<string>>(new Set());
  const [meters, setMeters] = useState<Record<MeterKey, number>>({ Sultry: 0, Aggressive: 0, Clever: 0, Suspicion: 0 });
  const [trust, setTrust] = useState<Record<string, number>>({});
  const [mems, setMems] = useState<Record<string, string>>({});

  const sim: GlobalState = useMemo(
    () => ({
      activeFlags: on,
      inventory: story.items.filter((i) => items.has(i.id)),
      meters,
      characterTrust: trust,
      memories: mems,
    }),
    [on, items, meters, trust, mems, story.items]
  );

  const toggle = (set: Set<string>, v: string, fn: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    fn(next);
  };

  return (
    <div className="space-y-3 text-xs">
      <p className="font-type text-paper/60">Fake the world state, then see what a live player could actually reach in this scene.</p>
      <div>
        <div className="font-pulp text-[9px] uppercase tracking-widest text-gold mb-1">Flags</div>
        <div className="flex flex-wrap gap-1">
          {flags.map((f) => (
            <button
              key={f}
              onClick={() => toggle(on, f, setOn)}
              className={`border px-1.5 py-0.5 text-[9px] ${on.has(f) ? "border-gold bg-gold/20 text-gold" : "border-noir-600 text-paper/50"}`}
            >
              {f}
            </button>
          ))}
          {!flags.length && <span className="text-paper/40">no flags in story</span>}
        </div>
      </div>
      <div>
        <div className="font-pulp text-[9px] uppercase tracking-widest text-gold mb-1">Inventory</div>
        <div className="flex flex-wrap gap-1">
          {story.items.map((i) => (
            <button
              key={i.id}
              onClick={() => toggle(items, i.id, setItems)}
              className={`border px-1.5 py-0.5 text-[9px] ${items.has(i.id) ? "border-cyan-neon bg-cyan-neon/15 text-cyan-neon" : "border-noir-600 text-paper/50"}`}
            >
              {i.icon} {i.id}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="font-pulp text-[9px] uppercase tracking-widest text-gold mb-1">Meters</div>
        {METERS.map((m) => (
          <label key={m} className="flex items-center gap-2 text-[10px] text-paper/60">
            <span className="w-20">{METER_LABELS[m]}</span>
            <input
              type="range"
              min={0}
              max={10}
              value={meters[m]}
              onChange={(e) => setMeters((s) => ({ ...s, [m]: Number(e.target.value) }))}
              className="flex-1 accent-pink-500"
            />
            <span className="w-4 text-right">{meters[m]}</span>
          </label>
        ))}
      </div>
      <div>
        <div className="font-pulp text-[9px] uppercase tracking-widest text-gold mb-1">Trust</div>
        {story.characters.map((c) => (
          <label key={c.id} className="flex items-center gap-2 text-[10px] text-paper/60">
            <span className="w-20 truncate">{c.name}</span>
            <input
              type="range"
              min={-5}
              max={5}
              value={trust[c.id] ?? 0}
              onChange={(e) => setTrust((s) => ({ ...s, [c.id]: Number(e.target.value) }))}
              className="flex-1 accent-pink-500"
            />
            <span className="w-4 text-right">{trust[c.id] ?? 0}</span>
          </label>
        ))}
      </div>
      <div>
        <div className="font-pulp text-[9px] uppercase tracking-widest text-gold mb-1">Memories</div>
        <div className="flex flex-wrap gap-1">
          {memoryTags.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                setMems((s) => {
                  const next = { ...s };
                  if (next[tag] != null) delete next[tag];
                  else next[tag] = `“${tag}”`;
                  return next;
                })
              }
              className={`border px-1.5 py-0.5 text-[9px] ${mems[tag] != null ? "border-gold bg-gold/20 text-gold" : "border-noir-600 text-paper/50"}`}
            >
              {tag}
            </button>
          ))}
          {!memoryTags.length && <span className="text-paper/40">no memoryLog tags in story</span>}
        </div>
      </div>
      <div className="border-t border-noir-600 pt-2">
        <div className="font-pulp text-[9px] uppercase tracking-widest text-neon mb-1">
          Live check — {scene ? scene.title : "select a scene node"}
        </div>
        {scene && (
          <ul className="space-y-1">
            {(scene.choices ?? []).map((c) => {
              const ok = meetsGating(effectiveChoiceGating(c), sim);
              return (
                <li key={c.id} className={ok ? "text-emerald-400" : "text-crimson"}>
                  {ok ? "✔" : "✖"} choice: {c.text.slice(0, 46)}
                </li>
              );
            })}
            {(scene.hotspots ?? []).map((h) => {
              const ok = meetsGating(h.gating, sim);
              return (
                <li key={h.id} className={ok ? "text-emerald-400" : "text-crimson"}>
                  {ok ? "✔" : "✖"} hotspot: {h.label}
                </li>
              );
            })}
            {(scene.dialogueBeats ?? []).map((b) => {
              const ok = meetsGating(b.conditionRule, sim);
              return (
                <li key={b.id} className={ok ? "text-emerald-400/70" : "text-paper/35"}>
                  {ok ? "💬" : "🚫"} beat: {b.text.slice(0, 44)}…
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="border-t border-noir-600 pt-2">
        <div className="font-pulp text-[9px] uppercase tracking-widest text-gold mb-1">Relationships (Trust + flags)</div>
        {story.characters.length ? (
          <div className="space-y-1">
            {story.characters.map((c) => {
              const op = characterOpinion(c, trust[c.id] ?? c.trustMeter, on);
              const col =
                op.sentiment === "devoted" || op.sentiment === "trusting"
                  ? "text-emerald-400"
                  : op.sentiment === "warming"
                    ? "text-gold"
                    : op.sentiment === "hostile" || op.sentiment === "terrified"
                      ? "text-crimson"
                      : "text-paper/60";
              return (
                <div key={c.id} className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="truncate text-paper/70">{c.name.split(" ")[0]}</span>
                  <span className={`${col} text-right`}>{op.line}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="font-type text-[10px] text-paper/40">No characters yet — add some in the Characters tab to see relationship opinions.</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  main studio                                                        */
/* ------------------------------------------------------------------ */

/** 🔊 VOICE A SPOKEN ACTION LINE — the hotspot/verb version of a beat's
 *  audio widgets: pick an upload, upload a file, or press 🎙 to synthesize
 *  the line with any character's ElevenLabs voice (spends credits, so it
 *  confirms first). The clip plays when the action's line shows, in place of
 *  the text-to-speech reader. Shared by the hotspot's own reply, each 🎚
 *  verb action, and each per-item reply line. */
function HotspotVoiceControls({
  story,
  sceneId,
  assetKey,
  line,
  value,
  onChange,
}: {
  story: Story;
  sceneId: string;
  /** naming key for generated assets (hotspot/verb/item id) */
  assetKey: string;
  /** the line the clip must read — the 🎙 button stays off while blank */
  line: string;
  value?: string;
  onChange: (url: string | undefined) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [voicePick, setVoicePick] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const voiced = story.characters.filter((c) => c.elevenVoiceId);
  const voice = voiced.find((c) => c.id === voicePick) ?? voiced[0];
  // asset:<id> refs resolve through the library so ▶ can audition uploads too.
  const uploads = useAllAssets("audio");
  const auditionSrc = value?.startsWith("asset:")
    ? uploads.find((a) => `asset:${a.id}` === value)?.dataUrl
    : value;
  return (
    <div className="mt-1 space-y-1">
      <div className="flex items-center gap-1">
        <span className="shrink-0 font-type text-[9px] text-paper/40" title="A recorded clip plays instead of the text-to-speech reader when this line shows">
          🔊
        </span>
        <AssetDropdown
          storyId={story.id}
          assetType="audio"
          returnReference
          value={value}
          onChange={(url) => onChange(url ?? undefined)}
          placeholder="voice clip (mp3) — optional…"
        />
        <MediaUploadButton
          storyId={story.id}
          accept="audio/*"
          label="⇧"
          onUploaded={(_u, assetId) => onChange(`asset:${assetId}`)}
        />
        {value && (
          <>
            <button
              type="button"
              title="Audition the clip"
              className="shrink-0 border border-paper/30 px-1.5 py-0.5 font-pulp text-[9px] text-paper/70 hover:text-gold"
              onClick={() => {
                if (auditionSrc) void new Audio(assetUrl(auditionSrc)).play();
              }}
            >
              ▶
            </button>
            <button
              type="button"
              title="Remove the clip (the line falls back to the text-to-speech reader)"
              className="shrink-0 border border-crimson/40 px-1.5 py-0.5 font-pulp text-[9px] text-crimson hover:bg-crimson/10"
              onClick={() => onChange(undefined)}
            >
              ✕
            </button>
          </>
        )}
      </div>
      {voiced.length > 0 && (
        <div className="flex items-center gap-1">
          <select
            className="w-24 shrink-0 border border-noir-600 bg-noir-950 px-1 py-0.5 font-type text-[9px] text-paper/80"
            value={voice?.id ?? ""}
            title="Which character's ElevenLabs voice reads this line"
            onChange={(e) => setVoicePick(e.target.value)}
          >
            {voiced.map((c) => (
              <option key={c.id} value={c.id}>{c.avatarUrl?.startsWith("emoji:") ? c.avatarUrl.slice(6) + " " : ""}{c.name}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy || !line.trim() || !voice}
            title={
              !line.trim()
                ? "Write the line first, then synthesize it"
                : `Synthesize this line as ${voice?.name ?? "?"} with ElevenLabs — spends credits, you'll be asked to confirm`
            }
            onClick={async () => {
              if (!voice || !line.trim()) return;
              if (!window.confirm(convertConfirmMessage(`${voice.name} — hotspot line`, voice.elevenVoiceId!, getElevenModel(), line.trim()))) return;
              setBusy(true);
              setNote(null);
              try {
                const { dataUrl, blob } = await synthesizeElevenLabs(line.trim(), voice.elevenVoiceId!, getElevenModel());
                const saved = await saveGeneratedVoice({
                  storyId: story.id,
                  characterId: voice.id,
                  sceneId,
                  beatId: assetKey,
                  blob,
                  dataUrl,
                  assetName: `voice-${assetKey}`,
                });
                onChange(saved.url);
                setNote(saved.note);
                void new Audio(dataUrl).play();
              } catch (err) {
                window.alert((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
            className="min-w-0 flex-1 border border-neon/40 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-neon hover:bg-neon/10 disabled:opacity-40"
          >
            {busy ? "Converting…" : value ? "↺ Regenerate MP3 (ElevenLabs)" : "🎙 Generate MP3 (ElevenLabs)"}
          </button>
        </div>
      )}
      {note && (
        <p className="font-type text-[8px] leading-snug text-gold/90" title={note}>
          {note}
        </p>
      )}
    </div>
  );
}

/** Guard rails for the In-game theme's custom accent/danger ink: these two
 *  colours take over --color-gold / --color-crimson EVERYWHERE (nameplates,
 *  choice focus, gate badges), so a too-dark or near-identical pick makes UI
 *  states look broken or invisible in play. Returns readable warnings; the
 *  colours still save — it's advice, not a block. */
function themeColorWarnings(accent?: string, danger?: string): string[] {
  const rgb = (hex?: string) => {
    if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return null;
    return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) };
  };
  /** relative luminance — the frame is near-black, so ink needs lum to read. */
  const lum = (c: { r: number; g: number; b: number }) => {
    const f = (v: number) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const out: string[] = [];
  const a = rgb(accent);
  const d = rgb(danger);
  // Built-in gold lum ≈ 0.5, built-in crimson ≈ 0.2 — warn well below those.
  if (a && lum(a) < 0.15) out.push("The custom accent is very dark — highlights, nameplates and the choice focus ring will be hard to see on the noir frame.");
  if (d && lum(d) < 0.08) out.push("The custom danger colour is nearly black — fail gates and HEAT warnings will be invisible.");
  if (a && d) {
    const dist = Math.sqrt((a.r - d.r) ** 2 + (a.g - d.g) ** 2 + (a.b - d.b) ** 2);
    // Built-in gold↔crimson separation ≈ 120 — anything much closer blurs
    // the good/bad distinction the player relies on.
    if (dist < 60) out.push("Accent and danger are nearly the same colour — bad gates and HEAT will look like normal UI.");
  }
  return out;
}

function StudioInner({
  baseStories,
  initialStoryId,
  initialSceneId,
  onExit,
  onPlay,
  onPublish,
  onDeleteStory,
  onCreateStory,
  onUpdateTitleTheme,
  onOpenManual,
}: {
  baseStories: Story[];
  /** open on this story (e.g. "edit this scene in Studio" from the game) */
  initialStoryId?: string;
  /** and select this scene once open */
  initialSceneId?: string;
  onExit: () => void;
  onPlay: (story: Story, opts?: { fromSceneId?: string }) => void;
  onPublish: (story: Story) => boolean;
  onDeleteStory: (storyId: string, deleteMedia?: boolean) => boolean;
  onCreateStory: (story: Story) => boolean;
  onUpdateTitleTheme: (theme: TitleTheme) => void;
  onOpenManual?: () => void;
}) {
  const [drafts] = useState(() => new DraftAutosave());
  const loadDraft = (id: string): Story => {
    const pending = drafts.snapshot(id);
    if (pending) return deepClone(pending);
    try {
      const raw = localStorage.getItem(draftKey(id));
      if (raw) {
        const stored = JSON.parse(raw) as Story;
        const base = baseStories.find((s) => s.id === id);
        // Self-heal the canvas layout. Two failure modes are repaired:
        //   1. MISSING positions (a draft saved before the story had a
        //      layout, or before scenes were added) — cards stack at origin.
        //   2. PILED positions (many scenes sharing one coordinate) — a
        //      corrupt or hand-wrecked draft.
        // The built-in layout is the floor; the author's own distinct drags
        // always win. Nobody loses real work, but the graph always opens
        // readable instead of as one pile of cards.
        if (base?.layout && stored.scenes?.length) {
          stored.layout = healLayout(stored.layout, base.layout);
        }
        return stored;
      }
    } catch {
      /* ignore */
    }
    return deepClone(baseStories.find((s) => s.id === id) ?? baseStories[0]);
  };

  const createBlankStory = (): Story => {
    const id = `case_${uid()}`;
    return {
      id,
      title: "Untitled Case",
      tagline: "A new mystery waits in the dark.",
      coverImage: "gradient:linear-gradient(160deg,#07111e 0%,#1d0c22 55%,#07070c 100%)",
      startSceneId: "",
      scenes: [],
      items: [],
      characters: [],
      layout: {},
      briefing: {
        objective: "What is the player trying to do? Write one sentence.",
        winConditions: [],
        loseConditions: [],
      },
    };
  };

  const [story, setStory] = useState<Story>(() => {
    // Studio reopens the last story you were editing (its draft, or the
    // built-in copy if there's no draft). If that story was deleted in the
    // meantime, fall back to the first case in the catalogue.
    let lastId: string | null = null;
    try {
      lastId = localStorage.getItem("scarlet-studio-last-story");
    } catch {
      /* storage unavailable — open the first story as before */
    }
    const openId =
      initialStoryId && baseStories.some((s) => s.id === initialStoryId)
        ? initialStoryId
        : lastId && baseStories.some((s) => s.id === lastId)
          ? lastId
          : baseStories[0].id;
    return loadDraft(openId);

  });
  // Remember which story is being edited so the next session reopens it.
  useEffect(() => {
    try {
      localStorage.setItem("scarlet-studio-last-story", story.id);
    } catch {
      /* storage unavailable — this session only */
    }
  }, [story.id]);
  const past = useRef<Story[]>([]);
  const future = useRef<Story[]>([]);
  const [, forceTick] = useState(0);
  // "Edit this scene in Studio" arrives with a target scene; select it on open
  // (only if it actually belongs to the story that was loaded).
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    initialSceneId && story.scenes.some((s) => s.id === initialSceneId) ? initialSceneId : story.scenes.find((s) => s.id === story.startSceneId)?.id ?? story.scenes[0]?.id ?? null
  );
  // beat id currently being synthesized by ElevenLabs (one line at a time)
  const [aiBusyBeat, setAiBusyBeat] = useState<string | null>(null);
  // where the most recent converted MP3 ended up (file path, or a warning)
  const [aiNote, setAiNote] = useState<{ text: string; at: number } | null>(null);
  // Batch voice generation state — converts every eligible beat (per scene
  // or the whole story) one character's voice at a time, saving each as its
  // own correctly-attributed MP3.
  const [batchBusy, setBatchBusy] = useState(false);
  const studioAlive = useRef(true);
  useEffect(() => { studioAlive.current = true; return () => { studioAlive.current = false; }; }, []);
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number; label: string } | null>(null);
  const [batchDone, setBatchDone] = useState<string | null>(null);
  // ElevenLabs model, mirrored into React state: setElevenModel() only writes
  // localStorage, so without this the cost preview / insert-cue list rendered
  // from the stored value would never update when the author picks a model.
  const [voiceModel, setVoiceModel] = useState(getElevenModel());
  const changeVoiceModel = (id: string) => {
    setVoiceModel(id);
    setElevenModel(id);
  };
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  /** Hotspots tab: drawing hotspots, or drawing 🚧 no-go barriers. */
  const [zoneMode, setZoneMode] = useState<"hotspot" | "barrier" | "spawn" | "behind">("hotspot");
  const [selectedBarrier, setSelectedBarrier] = useState<number | null>(null);
  const [selectedOccluder, setSelectedOccluder] = useState<number | null>(null);
  // Cutscene recorder: the walkTo/npcWalkTo step row waiting for a plate
  // click. `origin` routes the picked point back to the right script (the
  // stage tab's room-entry script or a hotspot's runScript); arming from a
  // hotspot row jumps to the stage tab so the plate is on screen.
  const [scriptPick, setScriptPick] = useState<{ index: number; npc: boolean; origin: "enter" | "hotspot" | "verb"; hotspotId?: string; verb?: string } | null>(null);
  const [focusedChoiceId, setFocusedChoiceId] = useState<string | null>(null);
  const [focusedBeatId, setFocusedBeatId] = useState<string | null>(null);
  // Which single beat is maximised in the Beats tab. Beats default to
  // minimised and at most one is open at a time: expanding a beat collapses
  // whichever was open before (accordion). Adding a beat opens just that one.
  const [expandedBeatId, setExpandedBeatId] = useState<string | null>(null);
  /** ✂ Beat extraction: the set of beats ticked for moving/copying out to a
   *  new scene. Keyed by beat id, scoped to one scene — switching scenes
   *  clears it (see the effect below) so a stale tick can't move a beat the
   *  author has stopped looking at. */
  const [pickedBeats, setPickedBeats] = useState<Set<string>>(new Set());
  const [beatPickMode, setBeatPickMode] = useState(false);
  // Drag-and-drop beat reordering: the beat id being dragged and the one
  // currently dragged over.
  const [dragBeatId, setDragBeatId] = useState<string | null>(null);
  const [dragOverBeatId, setDragOverBeatId] = useState<string | null>(null);
  // Move a beat to before/after the target index within the selected scene.
  const reorderBeat = (dragId: string, targetId: string) => {
    if (dragId === targetId) return;
    mutate((draft) => {
      const sc = draft.scenes.find((x) => x.id === selectedId) ?? draft.scenes[0];
      const beats = sc.dialogueBeats;
      if (!beats) return;
      const from = beats.findIndex((x) => x.id === dragId);
      const to = beats.findIndex((x) => x.id === targetId);
      if (from < 0 || to < 0) return;
      const [moved] = beats.splice(from, 1);
      beats.splice(to, 0, moved);
    });
  };
  const [tab, setTab] = useState<"scene" | "beats" | "hotspots" | "stage" | "choices" | "test" | "characters" | "audio" | "items" | "flags" | "briefing" | "acts" | "episodes" | "media" | "ai" | "dialogueBox" | "globalTitle" | "map">("scene");
  // Storage is the source of truth for the ElevenLabs model (the Characters
  // tab can change it elsewhere), so re-read it whenever the tab changes.
  useEffect(() => {
    setVoiceModel(getElevenModel());
  }, [tab]);
  const [globalTitleTheme, setGlobalTitleThemeState] = useState<TitleTheme>(() => {
    // Read the title settings on boot from the same key
    try {
      const raw = localStorage.getItem("scarlet-reel-global-title-theme");
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return {
      titleText: "Scarlet Reel",
      tagline: "A Dime-Store Detective Serial",
      bgImageUrl: "/img/bg-alley.jpg",
      neonColor: "#ff2e88",
    };
  });
  const [showValidator, setShowValidator] = useState(true);
  // The validator drawer is pinned to the bottom of the canvas and the minimap
  // and zoom controls are ReactFlow panels pinned to the same edge, so the
  // drawer used to sit straight on top of them. Measure the drawer (it grows
  // with the note count up to max-h-40, so a constant would be wrong) and lift
  // the panels clear of it.
  const validatorRef = useRef<HTMLDivElement | null>(null);
  const [validatorH, setValidatorH] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [toolbarExpanded, setToolbarExpanded] = useState(false);
  const [mobilePane, setMobilePane] = useState<"editor" | "map">("editor");
  const [menu, setMenu] = useState<{ x: number; y: number; fx: number; fy: number } | null>(null);
  const [nodeMenu, setNodeMenu] = useState<{ x: number; y: number; sceneId: string } | null>(null);
  const clipboardScene = useRef<SceneNode | null>(null);
  const [exportPayload, setExportPayload] = useState<string | null>(null);
  const [exportFilename, setExportFilename] = useState("case.reel.json");
  const [exportBusy, setExportBusy] = useState(false);
  const exportingRef = useRef(false);
  // Shown when both clipboard AND window.prompt are unavailable (Electron
  // shell / sandboxed iframe): a select-all box for the share link.
  const [shareBox, setShareBox] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<DraftSaveStatus>({ state: "pending" });
  // Save reminder: work autosaves to local storage only — this browser's
  // storage on the web, the app's data folder in the compiled app. It never
  // goes to the repo, GitHub or the cloud, so remind the author to Export a
  // .reel.json as the permanent copy. Dismissible, but re-showable via the
  // toolbar 💾 button so it's always one click away.
  const desktopApp = isDesktop();
  const [saveReminderDismissed, setSaveReminderDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("scarlet-studio-savereminder-dismissed") === "1";
    } catch {
      return false;
    }
  });
  const dismissSaveReminder = useCallback(() => {
    setSaveReminderDismissed(true);
    try {
      localStorage.setItem("scarlet-studio-savereminder-dismissed", "1");
    } catch {
      /* ignore */
    }
  }, []);
  const showSaveReminder = useCallback(() => {
    setSaveReminderDismissed(false);
    try {
      localStorage.removeItem("scarlet-studio-savereminder-dismissed");
    } catch {
      /* ignore */
    }
  }, []);
  const [notice, setNotice] = useState<string | null>(null);
  const rf = useReactFlow();
  const dragSnapshot = useRef<Story | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  /** Desktop path of the .screel / .reel.json this draft was opened from or
   *  last saved to. Ctrl+S overwrites it; switching stories forgets it so we
   *  never write story B on top of story A's file. */
  const caseFilePath = useRef<string | undefined>(undefined);
  const forgetCaseFile = () => {
    caseFilePath.current = undefined;
  };
  const saveCaseToDiskRef = useRef<(opts?: { saveAs?: boolean }) => Promise<void>>(async () => {});
  const openCaseFromDiskRef = useRef<() => Promise<void>>(async () => {});

  // Inspector panel width — user-resizable (drag the divider between canvas and
  // inspector) and expandable via the header button. Persisted so the chosen
  // size survives reloads.
  /** MINI MAP — on by default, but a big canvas sometimes wants the corner
   *  back. Persisted per machine like the other studio view prefs. */
  useEffect(() => {
    const el = validatorRef.current;
    if (!showValidator || !el) {
      setValidatorH(0);
      return;
    }
    const measure = () => {
      const h = el.getBoundingClientRect().height;
      setValidatorH((prev) => (Math.abs(prev - h) < 1 ? prev : h));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    // No issue-count dep: the ResizeObserver already reports the drawer
    // growing as notes are added.
  }, [showValidator]);

  const [showMiniMap, setShowMiniMap] = useState<boolean>(() => {
    try {
      return localStorage.getItem("scarlet-studio-minimap") !== "0";
    } catch {
      return true;
    }
  });
  const toggleMiniMap = () => {
    setShowMiniMap((v) => {
      const next = !v;
      try {
        localStorage.setItem("scarlet-studio-minimap", next ? "1" : "0");
      } catch {
        /* storage unavailable — still toggles for this session */
      }
      return next;
    });
  };

  const [inspectorWidth, setInspectorWidth] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem("scarlet-studio-inspector-width"));
      if (saved >= 320 && saved <= 960) return saved;
    } catch {
      /* ignore */
    }
    return 420;
  });
  const resizeInspector = useRef<{ startX: number; startW: number } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("scarlet-studio-inspector-width", String(inspectorWidth));
    } catch {
      /* storage may be unavailable */
    }
  }, [inspectorWidth]);

  const beginInspectorResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    resizeInspector.current = { startX: e.clientX, startW: inspectorWidth };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const moveInspectorResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resizeInspector.current) return;
    const viewportMax = Math.round(window.innerWidth * 0.75);
    const max = Math.min(960, Math.max(320, viewportMax));
    const next = Math.min(max, Math.max(320, resizeInspector.current.startW + (resizeInspector.current.startX - e.clientX)));
    setInspectorWidth(next);
  };
  const endInspectorResize = () => {
    resizeInspector.current = null;
  };
  const toggleInspectorWidth = () => setInspectorWidth((w) => (w >= 640 ? 420 : 720));

  const scene = story.scenes.find((s) => s.id === selectedId) ?? null;
  // The 🚶 Stage tab only exists for walkable-stage nodes. If the selection (or
  // the node's type) moves away from a stage while the tab is open, fall back to
  // the Scene tab so the inspector never points at an empty panel.
  useEffect(() => {
    if (tab === "stage" && scene?.nodeType !== "stage") setTab("scene");
  }, [tab, scene]);
  // A beat pick belongs to ONE scene. Switching scenes must drop it, or a
  // stale tick could move a beat the author is no longer looking at.
  useEffect(() => {
    setPickedBeats(new Set());
    setBeatPickMode(false);
  }, [selectedId]);
  // Every asset currently in the library (any type) — lets the validator flag
  // references to uploads that have since been deleted. Without this the
  // dangling-media check is skipped and behaviour is unchanged.
  const allLibraryAssets = useAllAssets();
  const knownAssetIds = useMemo(
    () => new Set(allLibraryAssets.map((a) => a.id)),
    [allLibraryAssets],
  );
  // Assets load asynchronously. Running the check against an empty set on the
  // first render would flag EVERY uploaded reference as missing, so hold the
  // check until the library has actually reported in.
  const libraryReady = allLibraryAssets.length > 0;
  const issues = useMemo(
    () => validateStory(story, libraryReady ? { knownAssetIds } : undefined),
    [story, knownAssetIds, libraryReady],
  );
  // Every flag referenced anywhere in the story — the source list for the flag
  // dropdowns so authors can pick (and keep track of) existing flag names.
  const allFlags = useMemo(() => collectFlags(story), [story]);
  // FLAGS TAB — "checked ok" marks. Purely an authoring aid (it never ships in
  // the story), so it lives in localStorage per story rather than in the doc:
  // a flag you've read, written a note for and confirmed is wired right.
  const [flagFilter, setFlagFilter] = useState("");
  const [flagsOnlyTodo, setFlagsOnlyTodo] = useState(false);
  // Which flag rows are expanded. Collapsed by default: the old tab rendered
  // every flag's textarea at once, which buried a 60-flag story.
  const [flagsOpen, setFlagsOpen] = useState<Set<string>>(new Set());
  const flagOkKey = `screel:flagsOk:${story.id}`;
  const [flagsOk, setFlagsOk] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const raw = localStorage.getItem(flagOkKey);
      setFlagsOk(new Set(raw ? (JSON.parse(raw) as string[]) : []));
    } catch {
      setFlagsOk(new Set());
    }
  }, [flagOkKey]);
  const toggleFlagOk = (flag: string) =>
    setFlagsOk((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      try {
        localStorage.setItem(flagOkKey, JSON.stringify([...next]));
      } catch {
        /* storage unavailable — the marks still hold for this session */
      }
      return next;
    });
  // Every Choice.memoryLog tag — the dropdown source for the "Remembers" gate
  // and the memory-recall editor on dialogue beats.
  const memoryTags = useMemo(() => collectMemoryTags(story), [story]);
  // The "Remembers" gate and the beat "Memories recalled" editor also offer
  // story FLAGS as recall keys — a character can remember what you SAW (a
  // flag is set) as well as what you SAID (a memoryLog tag).
  const recallSuggestions = useMemo(
    () => [...new Set([...memoryTags, ...allFlags])].sort(),
    [memoryTags, allFlags]
  );

  // Which image the Cinematic Image Controls currently grade: the scene
  // background or a dialogue beat's replacement image.
  const [cinematicTarget, setCinematicTarget] = useState<string>("__scene__");

  // Keep the inspector in sync after undo/redo/imports that remove the
  // currently-selected scene, so tabs don't silently point at a ghost node.
  useEffect(() => {
    if (selectedId && !story.scenes.some((s) => s.id === selectedId)) {
      setSelectedId(null);
      setSelectedHotspot(null);
      setCinematicTarget("__scene__");
    }
  }, [story, selectedId]);

  // If the beat being graded loses its background image (or is removed), fall
  // back to grading the scene background.
  useEffect(() => {
    if (cinematicTarget !== "__scene__" && scene) {
      const beat = (scene.dialogueBeats ?? []).find((b) => b.id === cinematicTarget);
      if (!beat || !beat.background) setCinematicTarget("__scene__");
    }
  }, [scene, cinematicTarget]);

  // Resolves `asset:<id>` references to real data URLs for Studio previews.
  // The story state itself keeps references (so autosave/publish stay small).
  const resolveMedia = useResolvedMedia(story.id);
  const media = useCallback((v?: string) => resolveMedia(v) ?? v, [resolveMedia]);

  // Every image in the library (global), surfaced directly in the Background
  // dropdown so an upload is reusable in any scene of any story.
  const uploadedImages = useAllAssets("image");
  const storageAvailable = useStorageAvailable();

  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const say = useCallback((msg: string) => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice(msg);
    noticeTimer.current = setTimeout(() => setNotice(null), 3600);
  }, []);
  useEffect(() => () => { if (noticeTimer.current) clearTimeout(noticeTimer.current); }, []);

  /* ---------- history ---------- */
  const lastCommitAt = useRef(0);
  const commit = useCallback((next: Story) => {
    // Coalesce a burst of rapid commits (typing in a text field) into ONE
    // undo step: only push when this commit lands >600ms after the
    // previous. The entry pushed is the state before the burst's first
    // commit, so one Ctrl+Z rewinds the whole run of typing instead of a
    // single character. Structural changes always get an independent step.
    const now = Date.now();
    const structural = storyStructure(storyRef.current) !== storyStructure(next);
    if (structural || !lastCommitAt.current || now - lastCommitAt.current > 600) {
      past.current.push(deepClone(storyRef.current));
      if (past.current.length > 100) past.current.shift();
    }
    lastCommitAt.current = structural ? 0 : now;
    future.current = [];
    storyRef.current = next;
    drafts.queue(next);
    setStory(next);
    forceTick((t) => t + 1);
  }, [drafts]);
  const storyRef = useRef(story);
  storyRef.current = story;

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(deepClone(storyRef.current));
    storyRef.current = prev;
    drafts.queue(prev);
    setStory(prev);
    // Break the coalesce window: the next edit must get a fresh undo
    // anchor, or typing right after a Ctrl+Z would be un-undoable.
    lastCommitAt.current = 0;
    forceTick((t) => t + 1);
    audio.click();
  }, [drafts]);
  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(deepClone(storyRef.current));
    storyRef.current = next;
    drafts.queue(next);
    setStory(next);
    lastCommitAt.current = 0;
    forceTick((t) => t + 1);
    audio.click();
  }, [drafts]);

  /* ---------- autosave ---------- */
  useEffect(() => drafts.subscribe(setSaveStatus), [drafts]);
  useEffect(() => { drafts.queue(story); }, [drafts, story]);
  useEffect(() => {
    const flush = () => { drafts.flushSync(); };
    const beforeUnload = (event: BeforeUnloadEvent) => {
      // A focused beat line has local editing state; blur commits it first.
      (document.activeElement as HTMLElement | null)?.blur?.();
      if (!drafts.flushSync()) { event.preventDefault(); event.returnValue = ""; }
    };
    const hide = () => { if (document.visibilityState === "hidden") flush(); };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("visibilitychange", hide);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("visibilitychange", hide);
      drafts.flushSync(); // Leaving Studio must not cancel the last 800ms.
    };
  }, [drafts]);

  /* ---------- mutation helpers ---------- */
  const updateScene = (id: string, patch: Partial<SceneNode>) => {
    const latest = storyRef.current;
    if (latest.id !== story.id) return;
    commit({ ...latest, scenes: latest.scenes.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  };
  const mutate = useCallback((fn: (draft: Story) => void) => {
    if (storyRef.current.id !== story.id) return;
    const next = deepClone(storyRef.current);
    fn(next);
    commit(next);
  }, [commit, story.id]);
  // All mutations now accumulate against the latest committed snapshot,
  // including blur + click in one gesture and asynchronous media operations.
  const mutateLatest = mutate;

  const addScene = (fx: number, fy: number) => {
    const id = `scene_${uid()}`;
    const isFirstScene = story.scenes.length === 0;
    // An author who sketches the ENDINGS first (🏁 End before any playable
    // scene) still needs a start: the first playable scene claims the start
    // marker whenever the story has none ("" only before one exists or after
    // the last scene was deleted — deleteScene already re-points it).
    const needsStart = !story.startSceneId;
    mutate((d) => {
      d.scenes.push({
        id,
        title: isFirstScene ? "Opening Scene" : "New Scene",
        background: BACKGROUNDS[8],
        ambientAudio: "drone",
        prose: isFirstScene
          ? "Your story starts here. Set the mood, introduce the problem, and give the detective a reason to keep looking."
          : "The scene opens on...",
        choices: [],
        hotspots: [],
        dialogueBeats: [],
      });
      d.layout = { ...(d.layout ?? {}), [id]: { x: fx, y: fy } };
      if (isFirstScene || needsStart) d.startSceneId = id;
    });
    setSelectedId(id);
    setTab("scene");
    if (isFirstScene || needsStart) say("Opening scene created and marked as your start scene — no input connection needed. Add exits from here.");
    audio.pickup();
  };

  const addEndScene = (fx: number, fy: number) => {
    const id = `scene_${uid()}`;
    mutate((d) => {
      d.scenes.push({
        id,
        title: "Ending — Case Closed",
        background: BACKGROUNDS[2],
        ambientAudio: "jazz",
        prose: "The final reel. How the case ends is up to what the player proved.",
        choices: [],
        hotspots: [],
        dialogueBeats: [],
        isEnding: true,
        endingData: {
          tier: "victory-silver",
          headline: "CASE CLOSED",
          recap: "The story ends here. Customize the headline and recap to fit your ending.",
        },
      });
      d.layout = { ...(d.layout ?? {}), [id]: { x: fx, y: fy } };
    });
    setSelectedId(id);
    setTab("scene");
    say("End scene created — it has no output node. Connect other scenes into it.");
    audio.pickup();
  };

  const addCreditsScene = (fx: number, fy: number) => {
    const id = `scene_${uid()}`;
    mutate((d) => {
      d.scenes.push({
        id,
        title: "Opening Credits",
        nodeType: "credits",
        background: "gradient:linear-gradient(135deg, #07070c 0%, #14141f 100%)",
        prose: "MIDNIGHT CONFESSION\n\nDirected by Sam Cole\nWritten by the City\n\nTap to continue",
        choices: [
          { id: `c_${uid()}`, text: "Begin the Case", targetSceneId: "", attitudeTag: "Neutral" }
        ],
        hotspots: [],
        dialogueBeats: [],
      });
      d.layout = { ...(d.layout ?? {}), [id]: { x: fx, y: fy } };
    });
    setSelectedId(id);
    setTab("scene");
    say("Opening Credits node created. This node auto-hides the main HUD for a gorgeous, clean cinema introduction.");
    audio.pickup();
  };

  const addCutsceneScene = (fx: number, fy: number) => {
    const id = `scene_${uid()}`;
    mutate((d) => {
      d.scenes.push({
        id,
        title: "Cinematic Cutscene",
        nodeType: "cutscene",
        background: "gradient:linear-gradient(135deg, #000000 0%, #0c0c14 100%)",
        prose: "A slow fade to black... as the rain hammers the roof.",
        choices: [
          { id: `c_${uid()}`, text: "Next Scene", targetSceneId: "", attitudeTag: "Neutral" }
        ],
        hotspots: [],
        dialogueBeats: [],
      });
      d.layout = { ...(d.layout ?? {}), [id]: { x: fx, y: fy } };
    });
    setSelectedId(id);
    setTab("scene");
    say("Cutscene node created. Hide the main HUD to maximize your screen layout during transitions.");
    audio.pickup();
  };

  const addNoteScene = (fx: number, fy: number) => {
    const id = `scene_${uid()}`;
    mutate((d) => {
      d.scenes.push({
        id,
        title: "Missing Scene Here",
        nodeType: "note",
        background: "gradient:linear-gradient(135deg,#1a150c 0%,#0c0c14 100%)",
        prose: "",
        choices: [],
        hotspots: [],
        dialogueBeats: [],
      });
      d.layout = { ...(d.layout ?? {}), [id]: { x: fx, y: fy } };
    });
    setSelectedId(id);
    setTab("scene");
    say("Note added — click its text to type what belongs here. Wire it in on both sides; the game bypasses it in play.");
    audio.pickup();
  };

  const deleteScene = useCallback((id: string) => {
    const current = storyRef.current;
    if (!current.scenes.some((s) => s.id === id)) return;
    const isStart = id === current.startSceneId;
    mutate((d) => removeStoryScene(d, id));
    if (selectedId === id) setSelectedId(storyRef.current.startSceneId || null);
    if (isStart) say("Start scene deleted — first remaining playable scene is now start. Undo restores the node and its links.");
    else say("Scene and incoming links removed. Undo restores both.");
  }, [mutate, selectedId, say]);

  /* ---------- node clipboard: duplicate / copy / paste ---------- */
  const cloneSceneWithNewIds = (src: SceneNode): SceneNode => cloneScene(src);

  /* ---------- ✂ extract beats into a new scene ----------
   * Takes the ticked beats OUT of `fromId` (in play order, never the order
   * they were ticked) and drops them into a brand-new scene placed to the
   * right of the source on the canvas.
   *
   * `link` decides how the two scenes relate afterwards:
   *   "chain"  — the source gains a choice pointing at the new scene, so the
   *              conversation still plays end to end. This is the common case:
   *              a scene grew too long and wants splitting in half.
   *   "loose"  — the new scene is left unconnected, for reordering by hand.
   * `copy` leaves the originals in place instead of moving them.
   *
   * Deliberately conservative about what it carries across: the new scene
   * inherits the source's PRESENTATION (background, audio, cinematic, layout
   * type) so the extracted lines look the same as they did, but none of its
   * hotspots, choices or endings — those belong to the source's structure and
   * silently duplicating them would create phantom exits and duplicate ids. */
  const extractBeats = (
    fromId: string,
    beatIds: string[],
    opts: { link: "chain" | "loose"; copy: boolean; title?: string },
  ) => {
    const src = story.scenes.find((s) => s.id === fromId);
    if (!src || !beatIds.length) return;
    const picked = new Set(beatIds);
    // Play order, not click order.
    const taken = (src.dialogueBeats ?? []).filter((b) => picked.has(b.id));
    if (!taken.length) return;

    const newId = `scene_${uid()}`;
    const base = story.layout?.[fromId] ?? { x: 60, y: 60 };
    const title = opts.title?.trim() || `${src.title} (cont.)`;

    mutate((d) => {
      const from = d.scenes.find((x) => x.id === fromId)!;
      // Fresh beat ids when copying, so the two scenes never share an id;
      // when moving, the ids travel with the beats and stay stable (voice
      // clips and deep links keyed to them keep working).
      const moved = taken.map((b) =>
        opts.copy ? { ...deepClone(b), id: `b_${uid()}` } : deepClone(b),
      );
      const next: SceneNode = {
        id: newId,
        title,
        // Presentation follows the lines so the split is invisible in play.
        background: from.background,
        ...(from.nodeType ? { nodeType: from.nodeType } : {}),
        ...(from.ambientAudio ? { ambientAudio: from.ambientAudio } : {}),
        ...(from.musicUrl ? { musicUrl: from.musicUrl } : {}),
        ...(from.letterbox ? { letterbox: from.letterbox } : {}),
        ...(from.transition ? { transition: from.transition } : {}),
        ...(from.transitionSound ? { transitionSound: from.transitionSound } : {}),
        ...(from.cinematic ? { cinematic: deepClone(from.cinematic) } : {}),
        ...(from.hideHud ? { hideHud: from.hideHud } : {}),
        prose: "",
        dialogueBeats: moved,
        hotspots: [],
        choices: [],
      };
      d.scenes.push(next);
      d.layout = { ...(d.layout ?? {}), [newId]: { x: base.x + 360, y: base.y } };

      if (!opts.copy) {
        from.dialogueBeats = (from.dialogueBeats ?? []).filter((b) => !picked.has(b.id));
      }
      if (opts.link === "chain") {
        from.choices = [
          ...(from.choices ?? []),
          { id: `c_${uid()}`, text: "Continue", targetSceneId: newId, attitudeTag: "Neutral" },
        ];
      }
    });

    setPickedBeats(new Set());
    setBeatPickMode(false);
    setSelectedId(newId);
    setTab("scene");
    say(
      `${opts.copy ? "Copied" : "Moved"} ${taken.length} beat${taken.length === 1 ? "" : "s"} into "${title}"` +
        (opts.link === "chain" ? " and wired a Continue choice to it." : " — unconnected, wire its exits when ready."),
    );
    audio.pickup();
  };

  const duplicateScene = (id: string, at?: { x: number; y: number }) => {
    const src = story.scenes.find((s) => s.id === id);
    if (!src) return;
    const copy = cloneSceneWithNewIds(src);
    const base = story.layout?.[id] ?? { x: 60, y: 60 };
    const pos = at ?? { x: base.x + 48, y: base.y + 48 };
    mutate((d) => {
      d.scenes.push(copy);
      d.layout = { ...(d.layout ?? {}), [copy.id]: pos };
      // A duplicated scene must not steal the start marker.
      if (src.id === d.startSceneId) copy.title = `${src.title} (copy)`;
    });
    setSelectedId(copy.id);
    setTab("scene");
    say(`Duplicated "${src.title}". Rewire its exits where needed.`);
    audio.pickup();
  };

  const copyScene = (id: string) => {
    const src = story.scenes.find((s) => s.id === id);
    if (!src) return;
    clipboardScene.current = deepClone(src);
    say(`Copied "${src.title}" — right-click the canvas to paste.`);
    audio.click();
  };

  const pasteScene = (at: { x: number; y: number }) => {
    const src = clipboardScene.current;
    if (!src) {
      say("Nothing on the clipboard yet — copy a node first.");
      return;
    }
    const copy = cloneSceneWithNewIds(src);
    mutate((d) => {
      d.scenes.push(copy);
      d.layout = { ...(d.layout ?? {}), [copy.id]: { x: at.x, y: at.y } };
    });
    setSelectedId(copy.id);
    setTab("scene");
    say(`Pasted "${src.title}" on the canvas.`);
    audio.pickup();
  };

  /* ---------- graph derivation ---------- */
  const issueCountByScene = useMemo(() => {
    const m: Record<string, number> = {};
    issues.forEach((i) => {
      if (i.sceneId) m[i.sceneId] = (m[i.sceneId] ?? 0) + 1;
    });
    return m;
  }, [issues]);

  // sceneId -> its episode, so the canvas can badge each node with the chapter
  // it belongs to and mark the one that opens it.
  const sceneEpisodes = useMemo(() => {
    const map: Record<string, { number: number; title: string; isStart: boolean }> = {};
    seasonEpisodes(story).forEach((ep) => {
      ep.sceneIds.forEach((sceneId) => {
        map[sceneId] = { number: ep.number ?? 0, title: ep.title, isStart: sceneId === ep.startSceneId };
      });
    });
    return map;
  }, [story]);

  // sceneId -> the act that owns it. Membership is DERIVED by walking choice
  // edges from each act's start scene, so this recomputes on every graph edit
  // and the canvas shows act boundaries moving as the author wires links.
  // A scene reached by two acts is flagged rather than silently assigned.
  const sceneActs = useMemo(() => {
    const map: Record<string, { label: string; title: string; dot: string; isStart: boolean; conflict: boolean }> = {};
    (story.acts ?? []).forEach((act, i) => {
      const tint = ACT_TINTS[i % ACT_TINTS.length];
      scenesInAct(story, act.id).forEach((sceneId) => {
        if (map[sceneId]) {
          map[sceneId].conflict = true;
          return;
        }
        map[sceneId] = {
          label: act.label || `Act ${i + 1}`,
          title: act.title ?? "",
          dot: tint.dot,
          isStart: sceneId === act.startSceneId,
          conflict: false,
        };
      });
    });
    return map;
  }, [story]);

  // The road the story takes to reach the selected scene: a BFS from the
  // start scene over the scene edges. Selecting a node lights that path so
  // "where the story is" is visible at a glance — which branch feeds the
  // scene, what it passes through — without tracing 68 cards by hand.
  const pathToSelected = useMemo(() => {
    if (!selectedId) return null;
    if (selectedId === story.startSceneId)
      return { scenes: new Set([story.startSceneId]), edges: new Set<string>() };
    const adj = new Map<string, { edgeId: string; to: string }[]>();
    storyEdges(story).forEach((e) => {
      if (!story.scenes.some((s) => s.id === e.target)) return;
      const list = adj.get(e.source) ?? [];
      list.push({ edgeId: e.id, to: e.target });
      adj.set(e.source, list);
    });
    const prev = new Map<string, { edgeId: string; from: string }>();
    const seen = new Set([story.startSceneId]);
    const queue = [story.startSceneId];
    while (queue.length) {
      const id = queue.shift()!;
      if (id === selectedId) break;
      for (const { edgeId, to } of adj.get(id) ?? []) {
        if (seen.has(to)) continue;
        seen.add(to);
        prev.set(to, { edgeId, from: id });
        queue.push(to);
      }
    }
    if (!prev.has(selectedId)) return null; // orphan — no road reaches it
    const scenes = new Set<string>();
    const edges = new Set<string>();
    let cur: string | undefined = selectedId;
    while (cur) {
      scenes.add(cur);
      const p = prev.get(cur);
      if (!p) break;
      edges.add(p.edgeId);
      cur = p.from;
    }
    return { scenes, edges };
  }, [story, selectedId]);

  const nodes: Node[] = useMemo(
    () =>
      story.scenes.map((sc) => ({
        id: sc.id,
        type: "scene",
        position: story.layout?.[sc.id] ?? { x: 0, y: 0 },
        selected: sc.id === selectedId,
        // Only set width/height when the author has actually resized this card;
        // leaving them undefined lets ReactFlow measure the default-width card.
        ...(story.layout?.[sc.id]?.w ? { width: story.layout[sc.id].w } : {}),
        ...(story.layout?.[sc.id]?.h ? { height: story.layout[sc.id].h } : {}),
        data: {
          scene: sc,
          cardW: story.layout?.[sc.id]?.w,
          cardH: story.layout?.[sc.id]?.h,
          isStart: sc.id === story.startSceneId,
          issueCount: issueCountByScene[sc.id] ?? 0,
          backgroundRef: sc.background,
          episodeNumber: sceneEpisodes[sc.id]?.number,
          episodeTitle: sceneEpisodes[sc.id]?.title,
          isEpisodeStart: sceneEpisodes[sc.id]?.isStart,
          actLabel: sceneActs[sc.id]?.label,
          actTitle: sceneActs[sc.id]?.title,
          actDot: sceneActs[sc.id]?.dot,
          isActStart: sceneActs[sc.id]?.isStart,
          actConflict: sceneActs[sc.id]?.conflict,
          onPath: pathToSelected ? pathToSelected.scenes.has(sc.id) && sc.id !== selectedId : false,
        } satisfies SceneNodeData,
      })),
    [story, selectedId, issueCountByScene, sceneEpisodes, sceneActs, pathToSelected]
  );

  const edges: Edge[] = useMemo(
    () =>
      storyEdges(story)
        .filter((e) => story.scenes.some((s) => s.id === e.target) && !story.scenes.find((s) => s.id === e.source)?.isEnding)
        .map((e) => {
          const onPath = pathToSelected?.edges.has(e.id) ?? false;
          const stroke = onPath ? "#ffd166" : ATTITUDE_STROKE[e.attitude] ?? "#8b8b9e";
          return {
            id: e.id,
            type: "removable",
            source: e.source,
            target: e.target,
            sourceHandle: e.handle,
            animated: e.kind === "hotspot" || e.kind === "auto",
            style: {
              stroke,
              strokeWidth: onPath ? 2.5 : 1.5,
              opacity: onPath ? 1 : 0.75,
              strokeDasharray: e.kind === "hotspot" ? "5 4" : e.kind === "auto" ? "3 6" : undefined,
            },
            markerEnd: { type: MarkerType.ArrowClosed, color: stroke },
            data: { sceneId: e.source, routeId: e.id },
          };
        }),
    [story, pathToSelected]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((ch) => {
        if (ch.type === "position" && ch.position) {
          // SPREAD THE EXISTING ENTRY: a card's authored w/h lives in the same
          // layout record, so replacing it wholesale here would silently reset
          // every resized card the moment it was dragged.
          setStory((s) => ({
            ...s,
            layout: {
              ...(s.layout ?? {}),
              [ch.id]: { ...(s.layout?.[ch.id] ?? {}), x: ch.position!.x, y: ch.position!.y },
            },
          }));
        } else if (ch.type === "dimensions" && ch.dimensions && ch.resizing) {
          // Persist a RESIZE. Guarded on `resizing` so we only store sizes the
          // author dragged — ReactFlow also emits dimensions changes when it
          // first measures a card, and recording those would freeze every node
          // at its default size and defeat the auto-width.
          const { width, height } = ch.dimensions;
          setStory((s) => ({
            ...s,
            layout: {
              ...(s.layout ?? {}),
              [ch.id]: {
                x: s.layout?.[ch.id]?.x ?? 0,
                y: s.layout?.[ch.id]?.y ?? 0,
                w: Math.round(width),
                h: Math.round(height),
              },
            },
          }));
        } else if (ch.type === "select" && ch.selected) {
          setSelectedId(ch.id);
        } else if (ch.type === "remove") {
          deleteScene(ch.id);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [story, selectedId]
  );

  const removeEdge = useCallback((edgeId: string) => {
    mutate((draft) => {
      const edge = storyEdges(draft).find((e) => e.id === edgeId);
      const sc = edge && draft.scenes.find((s) => s.id === edge.source);
      if (sc) setSceneRouteTarget(sc, edgeId);
    });
  }, [mutate]);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    changes.forEach((ch) => { if (ch.type === "remove") removeEdge(ch.id); });
  }, [removeEdge]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveCaseToDiskRef.current({ saveAs: e.shiftKey });
        return;
      }
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if (e.key === "Escape") {
        setMenu(null);
      }
    };
    const onDeleteCustom = (e: Event) => {
      const sceneId = (e as CustomEvent<string>).detail;
      if (sceneId) deleteScene(sceneId);
    };
    const onRenameCustom = (e: Event) => {
      const detail = (e as CustomEvent<{ sceneId: string; title: string; isNote?: boolean }>).detail;
      if (!detail?.sceneId) return;
      const title = detail.title.trim();
      // Notes may be left empty (the card shows a placeholder); titles may not.
      if (!title && !detail.isNote) return;
      mutate((draft) => {
        const sc = draft.scenes.find((s) => s.id === detail.sceneId);
        if (sc) sc.title = title;
      });
    };
    const onDeleteEdge = (e: Event) => { removeEdge((e as CustomEvent<string>).detail); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("scarlet-delete-scene", onDeleteCustom as EventListener);
    window.addEventListener("scarlet-delete-edge", onDeleteEdge as EventListener);
    window.addEventListener("scarlet-rename-scene", onRenameCustom as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scarlet-delete-scene", onDeleteCustom as EventListener);
      window.removeEventListener("scarlet-delete-edge", onDeleteEdge as EventListener);
      window.removeEventListener("scarlet-rename-scene", onRenameCustom as EventListener);
    };
  }, [undo, redo, mutate, deleteScene, removeEdge]);

  const onConnect = useCallback(
    (conn: Connection) => {
      if (!conn.source || !conn.target) return;
      // Newly-created choices need their id captured so we can auto-focus them
      // in the Choices tab immediately — otherwise a fresh "New choice..." is
      // silently dropped into the list with no way to know where it went.
      let newChoiceId: string | null = null;
      let focusChoice = true;
      mutate((d) => {
        const sc = d.scenes.find((s) => s.id === conn.source);
        if (!sc) return;
        const handle = conn.sourceHandle ?? "new";
        const existingRoute = sceneRoutes(sc).find((r) => r.handle === handle);
        if (existingRoute) {
          setSceneRouteTarget(sc, existingRoute.id, conn.target!);
          focusChoice = false;
        } else if (handle.startsWith("choice:")) {
          const c = sc.choices?.find((x) => `choice:${x.id}` === handle);
          if (c) c.targetSceneId = conn.target!;
        } else if (handle.startsWith("hotspot:")) {
          const h = sc.hotspots?.find((x) => `hotspot:${x.id}` === handle);
          if (h) h.action.targetSceneId = conn.target!;
        } else if (handle === "auto") {
          sc.autoAdvanceTargetSceneId = conn.target!;
          sc.autoAdvanceDelaySeconds = sc.autoAdvanceDelaySeconds ?? 3;
        } else {
          sc.choices = sc.choices ?? [];
          newChoiceId = `c_${uid()}`;
          // A note's single "route out" handle: the first connection becomes
          // its bypass route.
          const isNote = sc.nodeType === "note";
          if (isNote) focusChoice = false;
          sc.choices.push({
            id: newChoiceId,
            text: isNote ? "Bypass route" : "New choice — click to edit",
            targetSceneId: conn.target!,
            attitudeTag: "Neutral",
          });
        }
      });
      audio.stringSnap();
      if (newChoiceId && focusChoice) {
        setSelectedId(conn.source!);
        setTab("choices");
        setFocusedChoiceId(newChoiceId);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [story]
  );

  /**
   * Auto-repair the common authoring faults that silently strand players:
   * dead-end scenes, fully-gated scenes, dangling targets, phantom item gates
   * and broken crafting recipes.
   */
  const repairStory = () => {
    const next = deepClone(story);
    const sceneIds = new Set(next.scenes.map((s) => s.id));
    const itemIds = new Set(next.items.map((i) => i.id));
    const fixes: string[] = [];

    if (!sceneIds.has(next.startSceneId)) {
      // Notes are placeholders, never a start scene.
      const firstReal = next.scenes.find((s) => s.nodeType !== "note");
      if (firstReal) {
        next.startSceneId = firstReal.id;
        fixes.push("reset start scene");
      }
    }
    const start = next.startSceneId;

    next.scenes.forEach((sc) => {
      for (const route of sceneRoutes(sc)) {
        if (!sceneIds.has(route.target) && start) {
          setSceneRouteTarget(sc, route.id, start);
          fixes.push(`re-pointed ${route.label} in "${sc.title}"`);
        }
      }
      // strip gates that reference items which no longer exist
      const scrub = (g?: Gating) => {
        if (!g) return;
        (["requiresItems", "excludesItems"] as const).forEach((key) => {
          if (g[key]?.some((id) => !itemIds.has(id))) {
            g[key] = g[key]!.filter((id) => itemIds.has(id));
            if (!g[key]!.length) delete g[key];
            fixes.push(`cleaned phantom item gate in "${sc.title}"`);
          }
        });
      };
      sc.choices?.forEach((c) => {
        scrub(c.gating);
        // Conversational replies stay in their scene — never re-point them.
        if (!c.reply && (!c.targetSceneId || !sceneIds.has(c.targetSceneId))) {
          c.targetSceneId = start;
          fixes.push(`re-pointed dangling choice in "${sc.title}"`);
        }
        if (c.consequences?.addItems?.some((i) => !itemIds.has(i))) {
          c.consequences.addItems = c.consequences.addItems.filter((i) => itemIds.has(i));
          fixes.push(`removed unknown reward item in "${sc.title}"`);
        }
      });
      if (sc.autoAdvanceTargetSceneId && !sceneIds.has(sc.autoAdvanceTargetSceneId)) {
        sc.autoAdvanceTargetSceneId = start === sc.id && next.scenes[1] ? next.scenes[1].id : start;
        sc.autoAdvanceDelaySeconds = sc.autoAdvanceDelaySeconds ?? 3;
        fixes.push(`re-pointed auto-advance in "${sc.title}"`);
      }
      sc.hotspots?.forEach((h) => {
        scrub(h.gating);
        const needsTarget = ["goToScene", "useItem"].includes(h.action.type);
        if (needsTarget && (!h.action.targetSceneId || !sceneIds.has(h.action.targetSceneId))) {
          h.action.targetSceneId = start;
          fixes.push(`gave "${h.label}" a valid target scene`);
        }
        if (h.isRepeatable && ["giveItem", "setFlag", "meterChange"].includes(h.action.type)) {
          h.isRepeatable = false;
          fixes.push(`made reward hotspot "${h.label}" one-shot`);
        }
        if (h.action.itemGranted && !itemIds.has(h.action.itemGranted)) {
          delete h.action.itemGranted;
          fixes.push(`cleared unknown granted item on "${h.label}"`);
        }
        if (h.action.itemConsumed && !itemIds.has(h.action.itemConsumed)) {
          delete h.action.itemConsumed;
          fixes.push(`cleared unknown consumed item on "${h.label}"`);
        }
      });

      if (sc.isEnding && !sc.endingData) {
        sc.endingData = { tier: "victory-silver", headline: "CASE CLOSED", recap: "The reel runs out." };
        fixes.push(`added ending data to "${sc.title}"`);
      }

      if (!sc.isEnding) {
        // Mirror the validator's exit accounting (storyEdges): edge exits,
        // after-beat routes, entry scripts and puzzle branches are all ways
        // out too. Counting only choices/hotspots would "repair" a healthy
        // stage room whose door is a walk-off edge arrow by injecting a
        // bogus choice into it.
        const exits = [
          ...(sc.autoAdvanceTargetSceneId ? [{ gated: false }] : []),
          ...(sc.choices ?? []).map((c) => ({ gated: !!effectiveChoiceGating(c) })),
          ...(sc.hotspots ?? [])
            .filter((h) =>
              hotspotReachableActions(h).some(
                (a) =>
                  !!a.targetSceneId ||
                  (!!a.patternPuzzle && (!!a.patternPuzzle.targetSceneId || !!a.patternPuzzle.wrongTargetSceneId)) ||
                  (a.script ?? []).some((st) => st.do === "goToScene")
              )
            )
            .map((h) => ({ gated: !!h.gating })),
          ...(sc.dialogueBeats ?? [])
            .filter((b) => b.afterBeatTargetSceneId)
            .map((b) => ({ gated: !!b.conditionRule })),
          ...Object.values(sc.stage?.exitEdges ?? {})
            .filter((e) => e?.targetSceneId)
            .map((e) => ({ gated: !!e.gating })),
          ...(sc.stage?.enterScript ?? []).some((st) => st.do === "goToScene")
            ? [{ gated: false }]
            : [],
        ];
        const hasOpenExit = exits.some((e) => !e.gated);
        if (!hasOpenExit) {
          sc.choices = sc.choices ?? [];
          sc.choices.push({
            id: `c_${uid()}`,
            text: exits.length ? "Step back and look for another angle." : "Move on.",
            targetSceneId: start === sc.id && next.scenes[1] ? next.scenes[1].id : start,
            attitudeTag: "Neutral",
          });
          fixes.push(`added a guaranteed exit to "${sc.title}"`);
        }
      }
    });

    next.items.forEach((item) => {
      if (item.combinableWith) {
        const { targetItemId, resultItemId } = item.combinableWith;
        if (!itemIds.has(targetItemId) || !itemIds.has(resultItemId)) {
          delete item.combinableWith;
          fixes.push(`removed broken recipe on "${item.name}"`);
        }
      }
    });

    /* ---- scene links that live OUTSIDE the scene list ---- */
    // Stage rooms: walk-off edge exits, entry-script/run-script goToScene
    // steps, and entry spawns keyed by the incoming scene.
    next.scenes.forEach((sc) => {
      if (!sc.stage) return;
      for (const edge of ["left", "right"] as const) {
        const ex = sc.stage.exitEdges?.[edge];
        if (ex?.targetSceneId && !sceneIds.has(ex.targetSceneId)) {
          ex.targetSceneId = start;
          fixes.push(`re-pointed ${edge} edge exit in "${sc.title}"`);
        }
      }
      const fixScript = (steps: StageScriptStep[] | undefined, label: string) => {
        (steps ?? []).forEach((st) => {
          if (st.do === "goToScene" && !sceneIds.has(st.targetSceneId)) {
            st.targetSceneId = start;
            fixes.push(`re-pointed ${label} step in "${sc.title}"`);
          }
        });
      };
      fixScript(sc.stage.enterScript, "entry script");
      sc.hotspots?.forEach((h) => fixScript(h.action.script, `"${h.label}" script`));
      if (sc.stage.entrySpawns) {
        for (const fromId of Object.keys(sc.stage.entrySpawns)) {
          if (!sceneIds.has(fromId)) {
            delete sc.stage.entrySpawns[fromId];
            fixes.push(`removed stale entry spawn in "${sc.title}"`);
          }
        }
      }
    });
    // Travel map: a pin on a deleted scene re-lands on the start scene.
    (next.map?.locations ?? []).forEach((loc) => {
      if (!sceneIds.has(loc.targetSceneId)) {
        loc.targetSceneId = start;
        fixes.push(`re-pointed map location "${loc.label || loc.id}"`);
      }
    });
    // Episodes: drop deleted scenes from chapter lists; a chapter left with
    // no scenes can never finish, so it goes too (its siblings renumber).
    if (next.episodes?.length) {
      next.episodes.forEach((ep) => {
        const before = ep.sceneIds.length;
        ep.sceneIds = ep.sceneIds.filter((id) => sceneIds.has(id));
        if (ep.sceneIds.length !== before) fixes.push(`removed deleted scene(s) from episode "${ep.title}"`);
        if (ep.startSceneId && !sceneIds.has(ep.startSceneId)) {
          ep.startSceneId = ep.sceneIds[0] ?? "";
          fixes.push(`reset opening scene of episode "${ep.title}"`);
        } else if (!ep.startSceneId && ep.sceneIds.length) {
          ep.startSceneId = ep.sceneIds[0];
          fixes.push(`set opening scene of episode "${ep.title}"`);
        }
      });
      const empty = next.episodes.filter((ep) => !ep.sceneIds.length);
      if (empty.length) {
        next.episodes = next.episodes.filter((ep) => ep.sceneIds.length);
        // keep the unlock/handoff graph consistent with the new episode list
        const kept = new Set(next.episodes.map((e) => e.id));
        next.episodes.forEach((ep) => {
          ep.unlockAfter = ep.unlockAfter?.filter((u) => kept.has(u.episodeId));
          if (ep.nextEpisodeByEnding) {
            for (const k of Object.keys(ep.nextEpisodeByEnding)) {
              if (!kept.has(ep.nextEpisodeByEnding![k])) delete ep.nextEpisodeByEnding![k];
            }
          }
        });
        fixes.push(`removed emptied episode(s): ${empty.map((e) => e.title).join(", ")}`);
      }
    }
    // Acts: a title card that opens on a deleted scene opens on the start.
    (next.acts ?? []).forEach((act) => {
      if (act.startSceneId && !sceneIds.has(act.startSceneId)) {
        act.startSceneId = start;
        fixes.push(`re-pointed act "${act.label || act.title}"`);
      }
    });

    if (!fixes.length) {
      say("Nothing to repair — this reel is structurally sound.");
      return;
    }
    commit(next);
    say(`Repaired ${fixes.length} issue(s): ${fixes.slice(0, 2).join("; ")}${fixes.length > 2 ? "…" : ""}`);
    audio.success();
  };

  /* ---------- import / export / share ---------- */
  const exportJson = async () => {
    if (exportingRef.current) return;
    (document.activeElement as HTMLElement | null)?.blur?.();
    const snapshot = deepClone(storyRef.current);
    exportingRef.current = true;
    setExportBusy(true);
    say("Bundling this reel's artwork, sprites and sound. Your draft stays editable.");
    try {
      const bundled = await createPortableStoryBundle(snapshot);
      setExportPayload(JSON.stringify({ ...bundled.story, assets: bundled.assets }, null, 2));
      setExportFilename(`${snapshot.id}.reel.json`);
      const missingPart = bundled.missing.length
        ? ` WARNING: ${bundled.missing.length} media reference(s) could not be bundled: ${bundled.missing.slice(0, 5).join(", ")}${bundled.missing.length > 5 ? "…" : ""}`
        : " All referenced media is included.";
      say(`Bundled ${bundled.assets.length} media asset(s) for "${snapshot.title}". Use Download or Copy.${missingPart}`);
    } catch {
      say("Failed to export case bundle. Your draft has not changed.");
    } finally {
      exportingRef.current = false;
      setExportBusy(false);
    }
  };

  const downloadExportPayload = () => {
    if (!exportPayload) return;
    try {
      const blob = new Blob([exportPayload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportFilename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      say("Download started.");
    } catch {
      say("Download was blocked — use Copy and paste into a .reel.json file.");
    }
  };

  const copyExportPayload = async () => {
    if (!exportPayload) return;
    try {
      await navigator.clipboard.writeText(exportPayload);
      say("Case JSON copied to clipboard.");
      audio.success();
    } catch {
      if (exportPayload.length > EXPORT_PREVIEW_LIMIT) {
        say("Clipboard blocked — use Download for the complete reel. The preview is truncated and is NOT an importable file.");
        return;
      }
      // Clipboard blocked: small exports can still be selected in full.
      const ta = document.getElementById("reel-export-textarea") as HTMLTextAreaElement | null;
      ta?.focus();
      ta?.select();
      say("Clipboard blocked — the JSON is selected in the box below. Press Ctrl+C.");
    }
  };

  const shareLink = async () => {
    // Sharing via URL limits size, so we export references or compress.
    // For deep sharing, we recommend using .reel.json files.
    const url = `${location.origin}${location.pathname}#reel=${encodeStory(story)}`;
    try {
      await navigator.clipboard.writeText(url);
      say("Share link copied to clipboard! 📋");
    } catch {
      // Clipboard blocked: prompt() is the classic fallback, but it doesn't
      // exist in the Electron shell — show the link in a select-all box
      // instead of throwing.
      let showed = false;
      try {
        if (typeof window.prompt === "function") {
          window.prompt("Copy your share link:", url);
          showed = true;
        }
      } catch {
        /* dialog blocked in this shell */
      }
      if (!showed) {
        setShareBox(url);
        say("Clipboard blocked — the share link is in the box below, select and copy it.");
      }
    }
  };

  /* ---------- duplicate the whole story ----------
   * Makes an independent, editable copy of the CURRENT story (the built-in,
   * a custom case, or a draft): new story id and title, regenerated scene +
   * beat + hotspot ids remapped across every internal reference (choices,
   * hotspots, puzzles, acts, episodes, auto-advance, part breaks, start
   * scene) so the graph wires up identically, and the canvas layout is
   * offset so the copy doesn't stack on the original. Saved as a custom
   * story so the built-ins are never modified. */
  const duplicateStory = async () => {
    forgetCaseFile();
    const source = storyRef.current;
    const src = deepClone(source);
    const copy = cloneStory(src);
    const compact = await compactStoryMedia(copy);
    if (storyRef.current !== source) { say("The case changed while duplicating — copy cancelled. Try again."); return; }
    if (!onCreateStory(compact)) {
      say("Could not duplicate — browser storage may be full.");
      audio.fail();
      return;
    }
    past.current = [];
    future.current = [];
    setStory(compact);
    setSelectedId(null);
    setSelectedHotspot(null);
    setFocusedChoiceId(null);
    try {
      // Guarded like every other write: the duplicate is already committed at
      // this point, so a storage failure here must not throw past the success
      // toast and leave the author staring at a crash after a working copy.
      localStorage.setItem("scarlet-studio-last-story", compact.id);
    } catch {
      /* storage unavailable — the copy still opened, it just won't reopen next session */
    }
    say(`Duplicated "${src.title}" as "${compact.title}" — a fully independent copy.`);
    audio.success();
  };

  /* ---------- batch ElevenLabs voice generation ----------
   * Converts every eligible beat in ONE scene to a per-character MP3.
   * Each line is billed/synthesized separately and saved through the same
   * pipeline as the single Generate button, so the file lands in
   * public/voices/<person>/<scene>/ on desktop (linked folder / media
   * library in browser) with the correct character's voice on the line.
   * Conversational context (the surrounding turns) is sent so the delivery
   * responds to the previous speaker. Updates apply progressively onto the
   * latest draft so every line sticks. */
  const batchGenerateVoices = async (scopeSceneId: string, modelOverride?: string) => {
    const key = getElevenKey();
    if (!key) {
      window.alert("Add your ElevenLabs API key first — Characters tab → 🎙 AI Voice (ElevenLabs).");
      setTab("characters");
      return;
    }
    const scene = story.scenes.find((x) => x.id === scopeSceneId);
    if (!scene) return;
    const model = modelOverride ?? getElevenModel();

    type Job = { beatId: string; characterId: string; characterName: string; line: string; hasAudio: boolean; prev: string; next: string };
    const jobs: Job[] = [];
    const beats = scene.dialogueBeats ?? [];
    for (let bi = 0; bi < beats.length; bi += 1) {
      const b = beats[bi];
      const ch = story.characters.find((x) => x.id === b.characterId);
      const line = b.text?.trim();
      if (!line || b.silent) continue;
      if (b.recalls && Object.keys(b.recalls).length) continue; // route-dependent text stays on TTS
      if (!ch?.elevenVoiceId) continue; // speaker has no assigned voice
      // Label each turn with its speaker so ElevenLabs knows WHO is in the
      // exchange (e.g. a Vera/Jack back-and-forth) and voices the line as a
      // reply to the correct character rather than an isolated read.
      const spoken = (idx: number) => {
        const bb = beats[idx];
        if (!bb || !bb.text.trim()) return "";
        if (bb.characterId === "narrator") return `(Narration) ${bb.text.trim()}`;
        const who = story.characters.find((c) => c.id === bb.characterId)?.name ?? "Speaker";
        return `${who}: ${bb.text.trim()}`;
      };
      // Full preceding conversation in the scene (the API truncates to its
      // own context limit); next line is just the immediate follow-up.
      const prev = beats
        .slice(0, bi)
        .map((_bb, k) => spoken(k))
        .filter(Boolean)
        .join("\n");
      jobs.push({
        beatId: b.id,
        characterId: b.characterId,
        characterName: ch.name,
        line,
        hasAudio: !!b.audioUrl,
        prev,
        next: bi + 1 < beats.length ? spoken(bi + 1) : "",
      });
    }

    if (!jobs.length) {
      window.alert(
        "No convertible lines in this scene. Each beat needs spoken text and a character whose ElevenLabs voice ID is set in the Characters tab. Silent beats and memory-recall lines stay on text-to-speech."
      );
      return;
    }
    const existing = jobs.filter((j) => j.hasAudio).length;
    const modelLabel = ELEVENLABS_MODELS.find((m) => m.id === model)?.label ?? model;

    // Work out which lines would actually be generated (regenerate-all vs
    // only gaps) so the warning prices the real spend, not the whole scene.
    let onlyMissing = false;
    if (existing > 0) {
      onlyMissing = !window.confirm(
        `${jobs.length} line(s) in "${scene.title}" (${new Set(jobs.map((j) => j.characterName)).size} character(s)).\n\n` +
          `${existing} line(s) already have an MP3.\n\nOK = regenerate ALL ${jobs.length} lines.\nCancel = only generate the ${jobs.length - existing} that don't have an MP3 yet.`
      );
    }
    const toGenerate = onlyMissing ? jobs.filter((j) => !j.hasAudio) : jobs;
    const genChars = toGenerate.reduce((n, j) => n + j.line.length, 0);
    const genCost = estimateVoiceCost(model, genChars);
    const money =
      genCost.usd >= 5 ? `~$${genCost.usd.toFixed(0)}` : `~$${genCost.usd.toFixed(2)}`;

    // ---- Double-check / cost warning -------------------------------------
    const warning =
      `⚠ YOU ARE ABOUT TO SPEND ELEVENLABS CREDITS\n\n` +
      `Scene: ${scene.title}\nModel: ${modelLabel}\n` +
      `Lines to generate: ${toGenerate.length}\n` +
      `Characters: ${genChars.toLocaleString()}  (≈ ${Math.round(genChars / 6).toLocaleString()} words)\n\n` +
      `Estimated cost: ~${genCost.credits.toLocaleString()} credits (${money} list overage).\n` +
      `(Your plan's monthly credit grant may cover this; you are only charged overage.)\n\n` +
      `Each line is generated separately in its character's voice and applied automatically. This cannot be undone once the API call is made.\n\n` +
      `Proceed? Click OK to spend the credits, Cancel to abort.`;
    if (!window.confirm(warning)) return;
    // Second confirmation for any spend over a small threshold so an
    // accidental click never burns a large batch.
    if (genCost.credits >= 500) {
      let sure: string | null = null;
      let dialogOk = false;
      try {
        if (typeof window.prompt === "function") {
          sure = window.prompt(
            `Final check: this spends ~${genCost.credits.toLocaleString()} credits on ${toGenerate.length} line(s). Type GENERATE to proceed.`,
            ""
          );
          dialogOk = true;
        }
      } catch {
        /* dialog blocked in this shell */
      }
      if (!dialogOk) {
        // Fail closed: without the typed GENERATE confirmation we must not
        // spend credits, so abort with an explanation instead of throwing.
        setBatchDone(
          "Cancelled — this shell can't show the typed GENERATE confirmation, so the batch was not run. Try from a normal browser window, or keep each scene under the confirmation threshold."
        );
        return;
      }
      if ((sure ?? "").trim().toUpperCase() !== "GENERATE") return;
    }
    const queue = toGenerate;
    if (!queue.length) {
      setBatchDone("Nothing to generate — every line in this scene already has an MP3.");
      return;
    }
    setBatchBusy(true);
    setBatchDone(null);
    let ok = 0;
    let failed = 0;
    const failures: string[] = [];
    for (let i = 0; i < queue.length; i += 1) {
      const job = queue[i];
      if (!studioAlive.current || storyRef.current.id !== story.id) break;
      const liveBeat = storyRef.current.scenes.find((s) => s.id === scene.id)?.dialogueBeats?.find((b) => b.id === job.beatId);
      if (!liveBeat || liveBeat.text.trim() !== job.line || liveBeat.characterId !== job.characterId) continue;
      setBatchProgress({ done: i, total: queue.length, label: `${job.characterName}` });
      try {
        const { dataUrl, blob } = await synthesizeElevenLabs(
          job.line,
          story.characters.find((x) => x.id === job.characterId)!.elevenVoiceId!,
          model,
          { previousText: job.prev, nextText: job.next }
        );
        const saved = await saveGeneratedVoice({
          storyId: story.id,
          characterId: job.characterId,
          sceneId: scene.id,
          beatId: job.beatId,
          blob,
          dataUrl,
          assetName: `voice-${job.characterId}-${job.beatId}`,
        });
        // Apply onto the LATEST draft so rapid async saves accumulate instead
        // of overwriting each other.
        mutateLatest((d) => {
          if (d.id !== story.id || !studioAlive.current) return;
          const b = d.scenes.find((x) => x.id === scene.id)?.dialogueBeats?.find((x) => x.id === job.beatId);
          if (b && b.text.trim() === job.line && b.characterId === job.characterId) b.audioUrl = saved.url;
        });
        ok += 1;
      } catch (err) {
        failed += 1;
        failures.push(`${job.characterName}: ${(err as Error).message}`);
        const msg = (err as Error).message || "";
        // Fatal for the whole batch: bad key, missing voice, model mismatch,
        // out of credits. Continuing would burn the same failure on every line.
        if (
          msg.includes("401") ||
          msg.includes("403") ||
          msg.includes("400") ||
          msg.includes("404") ||
          msg.includes("refused") ||
          msg.includes("422") ||
          msg.includes("No ElevenLabs") ||
          msg.includes("voice not found")
        ) {
          break;
        }
        // Rate limit: brief back-off then continue with the next line.
        if (msg.includes("429") || msg.includes("Rate limited")) await new Promise((r) => setTimeout(r, 4000));
      }
    }
    setBatchProgress(null);
    setBatchBusy(false);
    const summary =
      `"${scene.title}" — ${ok} MP3${ok === 1 ? "" : "s"} saved & applied to beats` +
      (failed ? `, ${failed} failed.` : ".") +
      (failures.length ? `\n\n${failures.slice(0, 4).join("\n")}` : "");
    setBatchDone(summary);
    say(`Batch voices: ${ok} saved${failed ? `, ${failed} failed` : ""}.`);
    if (failed === 0) audio.success();
  };

  const applyImportedCase = async (incoming: { story: Story; assets: MediaAsset[] }, fromPath?: string) => {
    // Snapshot the story being edited when the import started. Reading the
    // file + compacting its media is async (IndexedDB round-trips); anything
    // the author does in between (add a scene, switch story, ＋ New Story)
    // must NOT be silently clobbered by the late import commit.
    const storyAtStart = storyRef.current;
    try {
      if (!incoming.story.scenes || !incoming.story.startSceneId) throw new Error("bad");
      if (incoming.assets.length > 0) {
        await importStoryAssets(incoming.story.id, incoming.assets);
      }
      // Old exports carried the bolt-on `stage2d` layer; imports map it to the
      // stage NODE so those cases keep walking.
      const compacted = await compactStoryMedia(normalizeLegacyStory(incoming.story));
      if (storyAtStart !== storyRef.current) {
        say("The case changed while the file was reading — import cancelled. Try again.");
        audio.fail();
        return;
      }
      past.current = [];
      future.current = [];
      commit(compacted);
      if (fromPath) caseFilePath.current = fromPath;
      else forgetCaseFile();
      say(`Opened "${compacted.title}" with ${incoming.assets.length} asset(s)${fromPath ? ` from ${tailCasePath(fromPath)}` : ""}.`);
    } catch {
      say("That file isn't a valid reel. Tragic.");
    }
  };

  const importJson = async (file: File) => {
    const storyAtStart = storyRef.current;
    try {
      const parsed = await parseCaseFile(file);
      if (storyAtStart !== storyRef.current) {
        say("The case changed while the file was reading — import cancelled. Try again.");
        audio.fail();
        return;
      }
      await applyImportedCase(parsed);
    } catch {
      say("That file isn't a valid reel. Tragic.");
    }
  };

  const collectCaseBundle = () => createPortableStoryBundle(deepClone(storyRef.current));

  const saveCaseToDisk = async ({ saveAs = false }: { saveAs?: boolean } = {}) => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    if (!caseFilesAvailable()) {
      // Browser: no native dialog. The export modal is the fallback — same
      // self-contained .reel.json Studio has always produced.
      await exportJson();
      return;
    }
    // Keep the write destination with its snapshot. Switching/importing a
    // different case while assets resolve must never overwrite that case.
    const originalPath = caseFilePath.current;
    try {
      const bundled = await collectCaseBundle();
      const res = await saveCaseFile({
        story: bundled.story,
        assets: bundled.assets,
        filePath: saveAs ? undefined : originalPath,
        suggestedName: suggestedCaseName(bundled.story, originalPath?.toLowerCase().endsWith(".json") ? "reel.json" : "screel"),
      });
      if (res.canceled) return;
      if (res.error) {
        say(res.error);
        audio.fail();
        return;
      }
      if (res.path && storyRef.current.id === bundled.story.id && caseFilePath.current === originalPath) caseFilePath.current = res.path;
      const missingPart = bundled.missing.length
        ? ` WARNING: ${bundled.missing.length} media reference(s) could not be bundled: ${bundled.missing.join(", ")}`
        : "";
      say(res.path ? `Saved ${tailCasePath(res.path)}.${missingPart}` : `Case saved.${missingPart}`);
      audio.success();
    } catch {
      say("Couldn't save that case file.");
      audio.fail();
    }
  };

  const openCaseFromDisk = async () => {
    if (!caseFilesAvailable()) {
      fileRef.current?.click();
      return;
    }
    const res = await openCaseFile();
    if (res.canceled) return;
    if (res.error || !res.story) {
      say(res.error ?? "That file isn't a valid reel. Tragic.");
      audio.fail();
      return;
    }
    await applyImportedCase({ story: res.story, assets: res.assets ?? [] }, res.path);
  };
  saveCaseToDiskRef.current = saveCaseToDisk;
  openCaseFromDiskRef.current = openCaseFromDisk;

  useEffect(() => {
    const off = onFileMenu((action) => {
      if (action === "save") void saveCaseToDiskRef.current({ saveAs: false });
      else if (action === "save-case-as") void saveCaseToDiskRef.current({ saveAs: true });
      else if (action === "load") void openCaseFromDiskRef.current();
    });
    return off;
  }, []);

  /* ---------- render ---------- */
  return (
    <MediaResolverContext.Provider value={media}>
      <div className="studio-shell flex h-full flex-col bg-noir-900 text-paper">
        {/* toolbar */}
      <div className="studio-toolbar flex flex-wrap items-center gap-1 border-b border-noir-700 bg-noir-950/80 px-2.5 py-1.5 font-sans">
        <span className="mr-1 select-none text-[13px] font-semibold uppercase tracking-[0.16em] text-gold">Studio</span>
        <select
          className="tb-select"
          value={story.id}
          onChange={(e) => {
            // Keyboard/assistive/programmatic selection need not blur the
            // previous textarea. Flush it while it still owns this story.
            (document.activeElement as HTMLElement | null)?.blur?.();
            drafts.flushSync();
            past.current = [];
            future.current = [];
            forgetCaseFile();
            const next = loadDraft(e.target.value);
            storyRef.current = next;
            setStory(next);
            setSelectedId(next.scenes.find((s) => s.id === next.startSceneId)?.id ?? next.scenes[0]?.id ?? null);
          }}
          aria-label="Choose story to edit"
        >
          {[...baseStories, ...(baseStories.some((s) => s.id === story.id) ? [] : [story])].map((s) => (
            <option key={s.id} value={s.id}>
              🎬 {s.title}
            </option>
          ))}
        </select>
        <input
          className="tb-input"
          value={story.title}
          onChange={(e) => commit({ ...story, title: e.target.value })}
          aria-label="Story title"
          title="This is the name of your game. Players see it on the newsstand."
          placeholder="Name your game"
        />
        <select
          className="tb-select"
          value={story.gameKind ?? "noir-rail"}
          onChange={(e) => {
            const kind = e.target.value as NonNullable<Story["gameKind"]>;
            commit({ ...story, gameKind: kind });
            say(
              kind === "first-person"
                ? "First-person mode: NEW rooms get the sprite-action engine. Existing scenes are unchanged; use Stage → 3D to enable the action tools in a legacy room."
                : kind === "adventure"
                ? "Adventure mode: new scenes come out as 🚶 walkable rooms, and they open on the dedicated 🚶 Stage tab."
                : kind === "vn"
                  ? "Visual novel mode: build around portraits and dialogue beats."
                  : "Noir rail mode: prose + choice rail, the house style.",
            );
            audio.pickup();
          }}
          aria-label="Kind of game"
          title="What kind of game this is. Noir Rail = read and pick choices. Adventure = walk around rooms. Visual Novel = talking portraits. First-person = sprite-rich 3D action rooms."
        >
          <option value="noir-rail">🕵 Noir Rail</option>
          <option value="adventure">🚶 Adventure</option>
          <option value="first-person">🎯 First-person</option>
          <option value="vn">🎭 Visual Novel</option>
        </select>
        <span className="tb-sep" />
        <button onClick={undo} disabled={!past.current.length} className="btn-tool" title="Undo (Ctrl+Z)">
          ↶ Undo
        </button>
        <button onClick={redo} disabled={!future.current.length} className="btn-tool" title="Redo (Ctrl+Shift+Z)">
          ↷ Redo
        </button>
        <button type="button" className="studio-only-mobile btn-tool" aria-expanded={toolbarExpanded}
          aria-controls="studio-secondary-toolbar" onClick={() => setToolbarExpanded((open) => !open)}>
          {toolbarExpanded ? "Less ▴" : "More ▾"}
        </button>
        <div id="studio-secondary-toolbar" className="studio-secondary-toolbar" data-expanded={toolbarExpanded}>
        <span className="tb-sep" />
        <button
          onClick={() => {
            const blank = createBlankStory();
            if (!onCreateStory(blank)) {
              say("Could not save the new blank story. Browser storage may be full.");
              audio.fail();
              return;
            }
            past.current = [];
            future.current = [];
            forgetCaseFile();
            setStory(blank);
            setSelectedId(null);
            setSelectedHotspot(null);
            setFocusedChoiceId(null);
            setTab("briefing");
            say("Blank canvas created. Click ＋ Scene to add your first room — the yellow box on the right will guide you.");
            audio.success();
          }}
          className="btn-tool"
          title="Start a brand-new empty game. Your other games stay safe."
        >
          ＋ New Story
        </button>
        <button
          onClick={() => { void duplicateStory(); }}
          className="btn-tool"
          title="Copy this whole game so you can try ideas without breaking the original."
        >
          ⧉ Duplicate Story
        </button>
        <button onClick={() => addScene(80 + Math.random() * 200, 80 + Math.random() * 200)} className="btn-tool" title="Add a room. Players move through rooms (scenes) to play your game.">
          ＋ Scene
        </button>
        <button
          onClick={() => addNoteScene(80 + Math.random() * 200, 80 + Math.random() * 200)}
          className="btn-tool"
          title="Add a sticky note on the map. Only you see it — players never do."
        >
          📝 Note
        </button>
        <button
          onClick={() => addCreditsScene(80 + Math.random() * 200, 80 + Math.random() * 200)}
          className="btn-tool"
          title="Add movie-style opening or ending credits."
        >
          🎬 Credits
        </button>
        <button
          onClick={() => addCutsceneScene(80 + Math.random() * 200, 80 + Math.random() * 200)}
          className="btn-tool"
          title="Add a full-screen video or storyboard moment."
        >
          🎥 Cutscene
        </button>
        <button
          onClick={() => addEndScene(560 + Math.random() * 200, 120 + Math.random() * 80)}
          className="btn-tool"
          title="Add an ending — a room where the story can finish."
        >
          🏁 End
        </button>
        <span className="tb-sep" />
        <button onClick={() => setShowValidator((v) => !v)} aria-expanded={showValidator} aria-controls="studio-validation" className="btn-tool" title="Check your game for problems. Red ones should be fixed before you publish.">
          {issues.length ? `⚠ ${issues.length}` : "✔"} Check
        </button>
        <button
          onClick={repairStory}
          className="btn-tool"
          title="Try to auto-fix common problems like broken doors and missing links."
        >
          🛠 Repair
        </button>
        <span className="tb-sep" />
        <button
          onClick={() => void saveCaseToDisk({ saveAs: false })}
          className="btn-tool"
          title={
            desktopApp
              ? "Save this case as a .screel file (Ctrl+S). Overwrites the file you opened or last saved. Autosave still only lives in this app's data folder."
              : "Download a .reel.json copy of this case (Ctrl+S). Autosave still only lives in THIS browser."
          }
        >
          💾 Save
        </button>
        {desktopApp ? (
          <button
            onClick={() => void saveCaseToDisk({ saveAs: true })}
            className="btn-tool"
            title="Save a copy under a new name (Ctrl+Shift+S)."
          >
            Save As
          </button>
        ) : (
          <button
            onClick={showSaveReminder}
            className="btn-tool"
            title="Your work lives in THIS browser — not the repo or GitHub. Shows the save reminder so you can Export a .reel.json to keep a copy."
          >
            💾 Reminder
          </button>
        )}
        <button onClick={exportJson} disabled={exportBusy} aria-busy={exportBusy} className="btn-tool" title="Export a self-contained .reel.json, including all referenced artwork, sprites, music and voice files.">{exportBusy ? "⏳ Bundling…" : "⤓ Export"}</button>
        <button onClick={() => void openCaseFromDisk()} className="btn-tool" title="Open a .screel or .reel.json you saved earlier.">⤒ Import</button>
        <input
          ref={fileRef}
          type="file"
          accept=".screel,.json,.reel.json"
          className="hidden"
          aria-label="Import reel file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void importJson(file);
          }}
        />
        <button onClick={shareLink} className="btn-tool" title="Copy a link so someone else can play this game.">🔗 Share</button>
        <span className="tb-sep" />
        <button
          onClick={() => {
            const fallback = baseStories.find((candidate) => candidate.id === story.id);
            if (!fallback || !window.confirm("Discard this draft and restore the built-in story?")) return;
            past.current = [];
            future.current = [];
            localStorage.removeItem(draftKey(story.id));
            setStory(deepClone(fallback));
            setSelectedId(null);
            say("Draft reset to the built-in version.");
          }}
          className="btn-tool"
          title="Throw away your edits and put the original built-in story back. You will be asked first."
        >
          Reset
        </button>
        <button
          onClick={() => {
            let freed = 0;
            try {
              for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && /-backup-pre-r/.test(k)) {
                  freed += (localStorage.getItem(k) ?? "").length;
                  localStorage.removeItem(k);
                }
              }
            } catch {
              /* ignore */
            }
            const kb = Math.round(freed / 1024);
            say(kb > 0 ? `Reclaimed ${kb}KB of stale backup data.` : "No stale backup data to reclaim.");
            audio.click();
          }}
          className="btn-tool"
          title="Free up space in this browser by deleting old backup copies."
        >
          🗜 Storage
        </button>
        <button
          onClick={() => {
            if (baseStories.length <= 1) {
              say("At least one playable story must remain.");
              return;
            }
            if (
              !window.confirm(
                `PERMANENTLY delete "${story.title}"?\n\nThis removes the story, its draft, and its published copy. This cannot be undone.`
              )
            ) {
              return;
            }
            // Default keeps media in the library; choosing Cancel explicitly deletes it too.
            const deleteMedia = !window.confirm(
              `Keep "${story.title}"'s media assets in the library?\n\nOK — keep audio, video and images (reusable in other stories).\nCancel — permanently delete them too.`
            );
            if (!onDeleteStory(story.id, deleteMedia)) {
              say("Could not delete that story.");
              audio.fail();
              return;
            }
            drafts.discard(story.id);
            const nextStory = baseStories.find((candidate) => candidate.id !== story.id);
            forgetCaseFile();
            if (nextStory) setStory(loadDraft(nextStory.id));
            setSelectedId(null);
            say(deleteMedia ? `"${story.title}" deleted permanently — media assets removed too.` : `"${story.title}" deleted permanently — media assets kept in the library.`);
          }}
          className="btn-tool btn-danger"
          title="Permanently delete this game. You will be asked twice. This cannot be undone."
        >
          🗑 Delete
        </button>
        <button
          onClick={() => {
            setTab("globalTitle");
            setSelectedId(null);
          }}
          className={`btn-tool ${tab === "globalTitle" ? "is-active" : ""}`}
          title="Edit the newsstand title screen — the menu people see before they hit Play."
        >
          🎼 Theme
        </button>
        <button
          onClick={() => setShowHelp(true)}
          className="btn-tool"
          title="Open the how-to guide. Start with “Make a game in 6 clicks”, then hover any button for a tip."
        >
          ? Help
        </button>
        </div>
        <button
          type="button"
          onClick={() => { void drafts.flush(); }}
          className={`ml-auto tb-status ${saveStatus.state === "error" ? "text-crimson" : saveStatus.state === "saved" ? "text-emerald-400" : "text-paper/60"}`}
          role="status" aria-live="polite" aria-label="Draft save status"
          title={saveStatus.state === "error" ? `${saveStatus.message ?? "Storage unavailable"}. Click to retry, or Export a copy.` : "Saved in this browser. Export to keep a portable copy. Click to save now."}
        >
          {saveStatus.state === "saved" ? "✓ autosaved" : saveStatus.state === "error" ? "⚠ Save failed · retry" : saveStatus.state === "saving" ? "Saving…" : "Unsaved changes…"}
        </button>
        <button
          onClick={async () => {
            if (story.scenes.length === 0) {
              setShowValidator(true);
              say("Publish blocked: a blank case needs at least one scene. Add a scene, then mark it as the start scene.");
              audio.fail();
              return;
            }
            const errors = issues.filter((issue) => issue.severity === "error");
            if (errors.length) {
              setShowValidator(true);
              say(`Publish blocked: fix ${errors.length} error(s), or click Repair.`);
              audio.fail();
              return;
            }
            const compacted = await compactStoryMedia(deepClone(story));
            let published = onPublish(compacted);
            if (!published) {
              // Reclaim stale backups and try once more.
              clearStaleStorageBackups();
              published = onPublish(compacted);
            }
            if (!published) {
              say("Publish failed: browser storage is full. Export your case, then clear stale data.");
              audio.fail();
              return;
            }
            say("Published. The newsstand now uses this version.");
            audio.success();
          }}
          className="btn-ok"
          title="Put this version on the newsstand so anyone can play it from the menu."
        >
          Publish
        </button>
        <button
          onClick={() => {
            if (story.scenes.length === 0) {
              setShowValidator(true);
              say("Add a first scene to play — or use the Test tab to check gates.");
              audio.fail();
              return;
            }
            const bad = issues.filter((i) => i.severity === "error");
            if (bad.length) {
              say(`Playing with ${bad.length} error(s) — open the Validator to review. Unfinished paths may dead-end.`);
              // Don't block — let the author test what they have so far.
            }
            onPlay(deepClone(story));
          }}
          className="btn-go"
          title="Play this draft"
        >
          ▶ Play
        </button>
        <button onClick={() => {
          if (drafts.flushSync()) onExit();
          else say("Your latest edit could not be saved. Export a copy before leaving Studio.");
        }} className="btn-tool" aria-label="Leave Studio" title="Leave Studio and go back to the newsstand.">✕</button>
      </div>

      {/* Save reminder — work autosaves to THIS browser only (localStorage +
          IndexedDB), NOT the repo or GitHub. Remind the author to Export a
          .reel.json to keep a permanent, committable copy. Dismissible, but
          the toolbar 💾 button brings it back. */}
      {!saveReminderDismissed && (
        <div className="studio-save-reminder flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-gold/30 bg-gold/10 px-3 py-2">
          <span className="select-none text-base" aria-hidden>
            💾
          </span>
          <span className="studio-only-desktop min-w-0 flex-1 font-type text-[11px] leading-snug text-paper/85">
            {desktopApp ? (
              <>
                <b className="text-gold">Your work autosaves to this app's data folder only</b> — it stays on this
                machine (Windows: %APPDATA%\Scarlet Reel), not in the cloud or your repo, and reinstalling the app
                or clearing its data erases it.{" "}
                <b className="text-gold">Save a .screel</b> (Ctrl+S) to keep a real file — story.json plus media/ in a
                zip, no giant inlined JSON. <b className="text-gold">.reel.json still imports</b> if you already have
                one.
              </>
            ) : (
              <>
                <b className="text-gold">Your work autosaves to this browser only</b> — it lives in this browser's
                storage, not in your repo or on GitHub, and clearing the browser erases it.{" "}
                <b className="text-gold">Export a .reel.json to keep a permanent copy</b>, then commit that file to
                your repo to share it or version your work.
              </>
            )}
          </span>
          <span className="studio-only-mobile min-w-0 flex-1 font-sans text-xs text-paper/85">Autosaved here, not in the cloud.</span>
          <button
            onClick={() => void (desktopApp ? saveCaseToDisk({ saveAs: false }) : exportJson())}
            className="btn-go shrink-0"
            title={desktopApp ? "Save this case as a .screel file" : "Export this case as .reel.json"}
          >
            <span className="studio-only-desktop">{desktopApp ? "💾 Save .screel" : "⤓ Export .reel.json"}</span>
            <span className="studio-only-mobile">⤓ Back up</span>
          </button>
          <button
            onClick={dismissSaveReminder}
            className="btn-tool shrink-0"
            title="Dismiss this reminder — bring it back with the 💾 Save button in the toolbar"
            aria-label="Dismiss save reminder"
          >
            ✕
          </button>
        </div>
      )}

      {notice && (
        <div className="pointer-events-none absolute left-1/2 top-14 z-[80] -translate-x-1/2 border border-gold/60 bg-noir-950/95 px-4 py-2 font-type text-xs text-gold pop-in">
          {notice}
        </div>
      )}

      {shareBox && (
        <div className="absolute bottom-4 left-1/2 z-[85] w-[min(92vw,640px)] -translate-x-1/2 border border-gold/60 bg-noir-950/95 p-2 shadow-2xl pop-in">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="font-pulp text-[9px] uppercase tracking-widest text-gold">
              📋 Share link — select all and copy
            </span>
            <button
              onClick={() => setShareBox(null)}
              className="px-1 text-paper/50 hover:text-neon"
              aria-label="Close share link box"
            >
              ✕
            </button>
          </div>
          <input
            readOnly
            value={shareBox}
            onFocus={(e) => e.target.select()}
            className="w-full border border-noir-600 bg-noir-900 px-2 py-1.5 font-mono text-[10px] text-paper/80 outline-none"
          />
        </div>
      )}

      <SceneNavigator key={story.id} story={story} selectedId={selectedId} onSelect={(id) => {
        (document.activeElement as HTMLElement | null)?.blur?.();
        setSelectedId(id); setSelectedHotspot(null); setMobilePane("editor");
        rf.fitView({ nodes: [{ id }], padding: 0.5, maxZoom: 1, duration: 300 });
      }} />
      <div className="studio-mobile-view studio-only-mobile" role="group" aria-label="Studio workspace view">
        <button type="button" aria-pressed={mobilePane === "editor"} onClick={() => setMobilePane("editor")}>Scene editor</button>
        <button type="button" aria-pressed={mobilePane === "map"} onClick={() => setMobilePane("map")}>Scene map</button>
      </div>
      <div className="studio-workspace flex min-h-0 flex-1" data-mobile-pane={mobilePane}>
        {/* canvas */}
        <div className="studio-canvas relative min-w-0 flex-1" onClick={() => { setMenu(null); setNodeMenu(null); }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, n) => {
              setMobilePane("editor");
              setSelectedId(n.id);
              setSelectedHotspot(null);
            }}
            onNodeContextMenu={(e, n) => {
              e.preventDefault();
              const evt = e as unknown as MouseEvent;
              setSelectedId(n.id);
              setNodeMenu({ x: evt.clientX, y: evt.clientY, sceneId: n.id });
              setMenu(null);
            }}
            onEdgeClick={(_, edge) => {
              // Clicking an edge on the canvas jumps to the source scene AND
              // opens the correct editor tab, so authors can edit the newly
              // wired choice or hotspot immediately.
              const route = storyEdges(story).find((r) => r.id === edge.id);
              if (!route) return;
              setSelectedId(route.source);
              if (route.path[0] === "choices") {
                setTab("choices");
                setFocusedChoiceId((route.ref as { id: string }).id);
              } else if (route.path[0] === "hotspots") {
                setTab("hotspots");
                setSelectedHotspot((route.ref as { id: string }).id);
              } else if (route.path[0] === "dialogueBeats") {
                setTab("beats");
                const beatId = story.scenes.find((s) => s.id === route.source)?.dialogueBeats?.[route.path[1] as number]?.id;
                if (beatId) { setFocusedBeatId(beatId); setExpandedBeatId(beatId); }
              } else setTab(route.path[0] === "stage" ? "stage" : "scene");
            }}
            onNodeDragStart={() => {
              dragSnapshot.current = deepClone(storyRef.current);
            }}
            onNodeDragStop={() => {
              if (dragSnapshot.current) {
                past.current.push(dragSnapshot.current);
                future.current = [];
                dragSnapshot.current = null;
              }
            }}
            onPaneContextMenu={(e) => {
              e.preventDefault();
              const evt = e as unknown as MouseEvent;
              const p = rf.screenToFlowPosition({ x: evt.clientX, y: evt.clientY });
              setMenu({ x: evt.clientX, y: evt.clientY, fx: p.x, fy: p.y });
            }}
            snapToGrid
            snapGrid={[20, 20]}
            fitView
            minZoom={0.2}
            maxZoom={2}
            selectionOnDrag={false}
            deleteKeyCode={["Delete", "Backspace"]}
            attributionPosition="top-right"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#2b2b3f" />
            {showMiniMap ? (
              <MiniMap
                pannable
                zoomable
                // Endings keep gold; everything else takes its act's tint, so
                // the minimap reads as the film's act structure at a glance.
                // A node has to READ against the map's near-black backdrop.
                // The old fallback (#2b2b3f, the canvas dot colour) sat at
                // 1.4:1 contrast — invisible — so any story without acts drew
                // an empty map. Slate is ~5:1 and still recedes behind the
                // meaningful tints.
                nodeColor={(n) => {
                  const d = n.data as SceneNodeData;
                  if (d.scene.isEnding) return "#e8b23c";
                  if (d.isStart) return "#7fd1c1";
                  if (d.actDot) return d.actDot;
                  // #6b5b34 was 1.18:1 once the 75% viewport mask was
                  // composited over it — notes simply vanished outside the
                  // viewport rectangle. Lifted to stay legible masked.
                  if (d.scene.nodeType === "note") return "#a08a4e";
                  return "#8b8b9e";
                }}
                // The START scene and the SELECTED one are the two you hunt for
                // on a big reel, so give them a visible outline in the map.
                nodeStrokeColor={(n) => {
                  const d = n.data as SceneNodeData;
                  if (n.selected) return "#ff2e88";
                  if (d.isStart) return "#e8b23c";
                  return "transparent";
                }}
                nodeStrokeWidth={6}
                // The mask is composited over BOTH the node and the map
                // backdrop, so a heavy alpha crushes every node to ~1.4:1 and
                // the off-screen part of the reel reads as blank. 0.45 keeps
                // the viewport rectangle obvious while leaving masked nodes
                // at 2.5-3.9:1 — still visibly recessed, but readable.
                maskColor="rgba(7,7,12,0.45)"
                // Sit above the validator drawer instead of underneath it.
                style={{ background: "#0c0c14", bottom: validatorH }}
                className="!border !border-noir-600"
              />
            ) : null}
            <Controls showInteractive={false} style={{ bottom: validatorH }} />
          </ReactFlow>

          {story.scenes.length === 0 && (
            <EmptyCanvasHint onAddScene={() => addScene(80 + Math.random() * 200, 80 + Math.random() * 200)} />
          )}

          {menu && (
            <div
              className="fixed z-[90] border border-noir-600 bg-noir-950 py-1 shadow-2xl"
              style={{ left: menu.x, top: menu.y }}
              role="menu"
            >
              <button
                role="menuitem"
                className="block w-full px-4 py-1.5 text-left text-xs hover:bg-noir-700"
                onClick={() => {
                  addScene(menu.fx, menu.fy);
                  setMenu(null);
                }}
              >
                ＋ Add scene here
              </button>
              <button
                role="menuitem"
                className="block w-full px-4 py-1.5 text-left text-xs hover:bg-noir-700 text-gold"
                onClick={() => {
                  addNoteScene(menu.fx, menu.fy);
                  setMenu(null);
                }}
              >
                📝 Add note here
              </button>
              <button
                role="menuitem"
                className="block w-full px-4 py-1.5 text-left text-xs hover:bg-noir-700 text-neon"
                onClick={() => {
                  addCreditsScene(menu.fx, menu.fy);
                  setMenu(null);
                }}
              >
                🎬 Add credits here
              </button>
              <button
                role="menuitem"
                className="block w-full px-4 py-1.5 text-left text-xs hover:bg-noir-700 text-cyan-neon"
                onClick={() => {
                  addCutsceneScene(menu.fx, menu.fy);
                  setMenu(null);
                }}
              >
                🎥 Add cutscene here
              </button>
              <button
                role="menuitem"
                className="block w-full px-4 py-1.5 text-left text-xs hover:bg-noir-700 text-crimson"
                onClick={() => {
                  addEndScene(menu.fx, menu.fy);
                  setMenu(null);
                }}
              >
                🏁 Add end scene here
              </button>
              {selectedId && (
                <button
                  role="menuitem"
                  className="block w-full px-4 py-1.5 text-left text-xs hover:bg-noir-700 text-crimson"
                  onClick={() => {
                    deleteScene(selectedId);
                    setMenu(null);
                  }}
                >
                  🗑 Delete selected scene
                </button>
              )}
              {clipboardScene.current && (
                <button
                  role="menuitem"
                  className="block w-full px-4 py-1.5 text-left text-xs hover:bg-noir-700 text-cyan-neon"
                  onClick={() => {
                    pasteScene({ x: menu.fx, y: menu.fy });
                    setMenu(null);
                  }}
                >
                  📋 Paste "{clipboardScene.current.title}" here
                </button>
              )}
              <div className="my-1 h-px bg-noir-700" />
              <button
                role="menuitem"
                className="block w-full px-4 py-1.5 text-left text-xs hover:bg-noir-700"
                title="Show or hide the mini map in the bottom-right corner"
                onClick={() => {
                  toggleMiniMap();
                  setMenu(null);
                }}
              >
                {showMiniMap ? "🗺 Hide mini map" : "🗺 Show mini map"}
              </button>
              <button
                role="menuitem"
                className="block w-full px-4 py-1.5 text-left text-xs hover:bg-noir-700"
                title="Re-flow every card into act rows — repairs a piled-up canvas"
                onClick={() => {
                  // Tidy layout: one row band per act (when the story has
                  // acts; rows of six otherwise), scenes in authoring order
                  // left → right. Deterministic, undoable, and the fastest
                  // cure for a canvas that has become one pile of cards.
                  const tidy = tidyLayoutPositions(story);
                  mutate((d) => {
                    d.layout = tidy;
                  });
                  say("Canvas tidied — every scene re-flowed into act rows. Ctrl+Z puts it back.");
                  audio.click();
                  setMenu(null);
                  window.setTimeout(() => rf.fitView({ duration: 400 }), 60);
                }}
              >
                🧹 Tidy layout (act rows)
              </button>
              <button
                role="menuitem"
                className="block w-full px-4 py-1.5 text-left text-xs hover:bg-noir-700"
                onClick={() => {
                  rf.fitView({ duration: 400 });
                  setMenu(null);
                }}
              >
                ⤢ Fit view
              </button>
            </div>
          )}

          {/* node right-click menu */}
          {nodeMenu && (() => {
            const target = story.scenes.find((s) => s.id === nodeMenu.sceneId);
            if (!target) return null;
            const isStart = target.id === story.startSceneId;
            return (
              <div
                className="fixed z-[90] min-w-52 border border-noir-600 bg-noir-950 py-1 shadow-2xl"
                style={{ left: nodeMenu.x, top: nodeMenu.y }}
                role="menu"
              >
                <div className="border-b border-noir-700 px-3 py-1 font-pulp text-[9px] uppercase tracking-widest text-gold">
                  {isStart && "★ "}
                  {target.isEnding && "🏁 "}
                  {target.title}
                </div>
                <button role="menuitem" className="block w-full px-4 py-1.5 text-left text-xs hover:bg-noir-700"
                  onClick={() => { setSelectedId(target.id); setTab("scene"); setNodeMenu(null); }}>
                  ✎ Edit scene
                </button>
                <button role="menuitem" className="block w-full px-4 py-1.5 text-left text-xs text-neon hover:bg-noir-700"
                  onClick={() => { onPlay(deepClone(story), { fromSceneId: target.id }); setNodeMenu(null); }}
                  title="Launch the game starting at this scene (fresh state)">
                  ▶ Play from here
                </button>
                <button role="menuitem" className="block w-full px-4 py-1.5 text-left text-xs hover:bg-noir-700"
                  onClick={() => { duplicateScene(target.id); setNodeMenu(null); }}>
                  ⧉ Duplicate node
                </button>
                {/* A resized card can only be shrunk back by hand, and dragging
                    it to the exact default is fiddly — so offer the reset. */}
                {(story.layout?.[target.id]?.w || story.layout?.[target.id]?.h) ? (
                  <button role="menuitem" className="block w-full px-4 py-1.5 text-left text-xs hover:bg-noir-700"
                    title="Drop the authored size and go back to the default card width"
                    onClick={() => {
                      mutate((d) => {
                        const e = d.layout?.[target.id];
                        if (!e) return;
                        delete e.w;
                        delete e.h;
                      });
                      setNodeMenu(null);
                    }}>
                    ⤢ Reset node size
                  </button>
                ) : null}
                <button role="menuitem" className="block w-full px-4 py-1.5 text-left text-xs hover:bg-noir-700"
                  onClick={() => { copyScene(target.id); setNodeMenu(null); }}>
                  ⎘ Copy node
                </button>
                {clipboardScene.current && (
                  <button role="menuitem" className="block w-full px-4 py-1.5 text-left text-xs hover:bg-noir-700 text-cyan-neon"
                    onClick={() => { pasteScene({ x: (story.layout?.[target.id]?.x ?? 80) + 48, y: (story.layout?.[target.id]?.y ?? 80) + 48 }); setNodeMenu(null); }}>
                    📋 Paste next to it
                  </button>
                )}
                <div className="my-1 h-px bg-noir-700" />
                <button role="menuitem" className="block w-full px-4 py-1.5 text-left text-xs hover:bg-noir-700 text-gold"
                  onClick={() => {
                    if (!isStart) { commit({ ...story, startSceneId: target.id }); say(`"${target.title}" is now the start scene.`); }
                    setNodeMenu(null);
                  }}>
                  ★ {isStart ? "This is the start scene" : "Set as start scene"}
                </button>
                <button role="menuitem" className="block w-full px-4 py-1.5 text-left text-xs hover:bg-noir-700 text-crimson"
                  onClick={() => {
                    updateScene(target.id, {
                      isEnding: !target.isEnding,
                      endingData: !target.isEnding
                        ? (target.endingData ?? { tier: "victory-silver", headline: "CASE CLOSED", recap: "The story ends here." })
                        : target.endingData,
                    });
                    say(target.isEnding ? `"${target.title}" is now a regular scene.` : `"${target.title}" is now an ending.`);
                    setNodeMenu(null);
                  }}>
                  🏁 {target.isEnding ? "Remove ending flag" : "Mark as ending"}
                </button>
                <button role="menuitem" className="block w-full px-4 py-1.5 text-left text-xs hover:bg-noir-700 text-crimson"
                  onClick={() => { deleteScene(target.id); setNodeMenu(null); }}>
                  🗑 Delete node
                </button>
              </div>
            );
          })()}

          {/* validator drawer */}
          {showValidator && (
            <div
              ref={validatorRef}
              id="studio-validation" role="region" aria-label="Continuity check results"
              className="absolute bottom-0 left-0 right-0 z-30 max-h-40 overflow-y-auto border-t border-noir-600 bg-noir-950/95 px-3 py-2 backdrop-blur"
            >
              <div className="font-pulp text-[9px] uppercase tracking-widest text-paper/50 mb-1">
                Continuity Department — {issues.length ? `${issues.length} note(s)` : "spotless reel 🎉"}
                <span className="ml-2 font-type text-[8px] normal-case tracking-normal text-paper/35">
                  red ERROR blocks Publish (Play is still available) · gold WARNING is advisory · click a note to fly to its scene · 🛠 Repair auto-fixes the common ones
                </span>
              </div>
              <ul className="space-y-0.5">
                {issues.map((iss: ValidationIssue, i) => (
                  <li key={i}>
                    <button
                      className={`text-left text-[11px] hover:underline ${iss.severity === "error" ? "text-crimson" : "text-gold"}`}
                      onClick={() => {
                        if (iss.sceneId) {
                          setSelectedId(iss.sceneId);
                          const p = story.layout?.[iss.sceneId];
                          if (p) rf.setCenter(p.x + 110, p.y + 100, { zoom: 1.1, duration: 500 });
                        }
                      }}
                    >
                      {iss.severity === "error" ? "⛔" : "⚠"} {iss.message}
                      {iss.sceneId && <span className="text-paper/40"> — jump to node ↗</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* inspector resize handle */}
        <div
          className="studio-inspector-resize relative z-10 w-1.5 shrink-0 cursor-col-resize border-x border-noir-700/50 bg-noir-800 transition-colors hover:bg-neon/40"
          onPointerDown={beginInspectorResize}
          onPointerMove={moveInspectorResize}
          onPointerUp={endInspectorResize}
          onPointerCancel={endInspectorResize}
          title="Drag to resize the inspector panel"
        >
          <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] text-paper/40">⋮</span>
        </div>

        {/* inspector */}
        <div
          className="studio-inspector flex shrink-0 flex-col border-l border-noir-600 bg-noir-950"
          style={{ width: inspectorWidth, maxWidth: "75vw" }}
        >
          <div className="flex items-center justify-between border-b border-noir-700 bg-noir-900/50 px-2 py-1">
            <span className="font-pulp text-[9px] uppercase tracking-widest text-paper/45" title="This side is the editor. Click a card on the left, then change its picture, words, and choices here.">⚙ Editor</span>
            <button
              onClick={toggleInspectorWidth}
              className="studio-inspector-expand border border-gold/40 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-gold hover:bg-gold/10"
              title={inspectorWidth >= 640 ? "Collapse the inspector panel" : "Expand the inspector panel"}
            >
              {inspectorWidth >= 640 ? "⤡ Collapse" : "⤢ Expand"}
            </button>
          </div>
          <div role="tablist" aria-label="Studio tools" className="border-b border-noir-600">
            {/* Tab order follows the build, grouped so a first-timer isn't
                dumped 18 tools at once. Labels stay byte-identical — the
                Studio beta probe matches on them. Every tab still exists. */}
            {TAB_GROUPS.map((group) => (
              <div key={group.title} className="border-b border-noir-800/80 last:border-b-0">
                <div className="flex items-center justify-between px-2 pt-1.5 pb-0.5">
                  <span className="font-pulp text-[8px] uppercase tracking-widest text-gold/80">{group.title}</span>
                  <span className="font-type text-[8px] text-paper/35">{group.hint}</span>
                </div>
                <div className="studio-tab-row">
                  {group.ids
                    .filter((t) => t !== "stage" || scene?.nodeType === "stage")
                    .map((t) => (
                      <button
                        key={t}
                        type="button"
                        id={`studio-tab-${t}`}
                        role="tab"
                        aria-selected={tab === t}
                        aria-controls="studio-editor-panel"
                        tabIndex={tab === t ? 0 : -1}
                        title={TAB_TIPS[t]}
                        onKeyDown={(e) => {
                          const tabs = TAB_GROUPS.flatMap((g) => g.ids).filter((id) => id !== "stage" || scene?.nodeType === "stage");
                          const i = tabs.indexOf(t);
                          const next = e.key === "Home" ? tabs[0] : e.key === "End" ? tabs[tabs.length - 1] : e.key === "ArrowRight" ? tabs[(i + 1) % tabs.length] : e.key === "ArrowLeft" ? tabs[(i + tabs.length - 1) % tabs.length] : undefined;
                          if (next) { e.preventDefault(); setTab(next); document.getElementById(`studio-tab-${next}`)?.focus(); }
                        }}
                        onClick={() => setTab(t)}
                        className={`border-b border-r border-noir-700 px-1 py-2 font-pulp text-[9px] uppercase tracking-wider ${
                          tab === t ? "bg-noir-800 text-neon" : "text-paper/50 hover:text-paper"
                        }`}
                      >
                        {TAB_LABELS[t]}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <div id="studio-editor-panel" role="tabpanel" aria-labelledby={`studio-tab-${tab}`} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            <StudioCoach
              story={story}
              scene={scene}
              tab={tab as StudioTabId}
              issues={issues}
              onGoTab={(t) => setTab(t)}
              onAddScene={() => addScene(80 + Math.random() * 200, 80 + Math.random() * 200)}
              onAddEnd={() => addEndScene(560 + Math.random() * 200, 120 + Math.random() * 80)}
              onPlay={() => {
                if (story.scenes.length === 0) {
                  setShowValidator(true);
                  say("Add a first scene to play — or use the Test tab to check gates.");
                  audio.fail();
                  return;
                }
                onPlay(deepClone(story));
              }}
              onCheck={() => setShowValidator(true)}
            />
            {(tab === "briefing" || tab === "test") && <>
            <CollapsibleSection id="workflow" title="Creator workflow" className="border border-cyan-neon/30 bg-cyan-neon/5">
              <div className="grid grid-cols-5 gap-1 font-type text-[9px] text-center">
                <button onClick={() => setTab("briefing")} className={`border p-1 ${story.briefing?.objective ? "border-emerald-500/40 text-emerald-400" : "border-crimson/50 text-crimson"}`}>
                  1. Case File<br />{story.briefing?.objective ? "✓" : "required"}
                </button>
                <button onClick={() => setTab("characters")} className={`border p-1 ${story.characters.length ? "border-emerald-500/40 text-emerald-400" : "border-crimson/50 text-crimson"}`}>
                  2. Characters<br />{story.characters.length} total
                </button>
                <button onClick={() => setTab("items")} className={`border p-1 ${story.items.length ? "border-emerald-500/40 text-emerald-400" : "border-gold/50 text-gold"}`}>
                  3. Items<br />{story.items.length} total
                </button>
                <button onClick={() => setTab("scene")} className={`border p-1 ${story.scenes.length >= 3 ? "border-emerald-500/40 text-emerald-400" : "border-gold/50 text-gold"}`}>
                  4. Scenes<br />{story.scenes.length} total
                </button>
                <button onClick={() => setTab("test")} className={`border p-1 ${issues.some((i) => i.severity === "error") ? "border-crimson/50 text-crimson" : "border-emerald-500/40 text-emerald-400"}`}>
                  5. Test<br />{issues.length ? `${issues.length} notes` : "✓ ready"}
                </button>
              </div>
            </CollapsibleSection>
            <CollapsibleSection id="readiness" title="Ship Readiness" titleClass="text-gold" className="border border-gold/35 bg-gold/5">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowValidator(true)}
                  className="border border-paper/20 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/60 hover:border-neon hover:text-neon"
                >
                  Open validator
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1 font-type text-[10px]">
                <div className={story.startSceneId ? "text-emerald-400" : "text-crimson"}> {story.startSceneId ? "✓" : "✖"} Start scene</div>
                <div className={story.scenes.some((s) => s.isEnding) ? "text-emerald-400" : "text-crimson"}> {story.scenes.some((s) => s.isEnding) ? "✓" : "✖"} Ending scene</div>
                <div className={issues.some((i) => i.severity === "error") ? "text-crimson" : "text-emerald-400"}> {issues.some((i) => i.severity === "error") ? "✖" : "✓"} No hard errors</div>
                <div className={story.briefing?.objective ? "text-emerald-400" : "text-gold"}> {story.briefing?.objective ? "✓" : "!"} Case objective</div>
                {!!story.episodes?.length && (() => {
                  const eps = seasonEpisodes(story);
                  const clearable = eps.filter((ep) =>
                    story.scenes.some((sc) => ep.sceneIds.includes(sc.id) && sc.isEnding && sc.endingData?.tier?.startsWith("victory"))
                  ).length;
                  const orphanCount = unassignedScenes(story).length;
                  return (
                    <>
                      <div className={clearable === eps.length ? "text-emerald-400" : "text-crimson"}>
                        {clearable === eps.length ? "✓" : "✖"} {clearable}/{eps.length} episodes clearable
                      </div>
                      <div className={orphanCount ? "text-gold" : "text-emerald-400"}>
                        {orphanCount ? "!" : "✓"} {orphanCount ? `${orphanCount} scene(s) unassigned` : "All scenes in an episode"}
                      </div>
                    </>
                  );
                })()}
              </div>
            </CollapsibleSection>
            <CollapsibleSection id="reference" title="Quick Reference" titleClass="text-gold" className="border border-noir-700 bg-noir-900/70">
              <div className="flex items-center justify-between gap-2">
                <div className="font-type text-[10px] text-paper/55">
                  {story.scenes.length} scenes · {story.characters.length} characters · {story.items.length} items
                </div>
                {scene && <span className="font-pulp text-[9px] uppercase tracking-widest text-neon">Editing: {scene.title}</span>}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <div className="mb-1 font-pulp uppercase tracking-wider text-cyan-neon">Characters</div>
                  <div className="flex flex-wrap gap-1">
                    {story.characters.map((c) => (
                      <span key={c.id} className="border border-noir-600 px-1 py-0.5 text-paper/70">{c.name}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-1 font-pulp uppercase tracking-wider text-crimson">Items</div>
                  <div className="flex flex-wrap gap-1">
                    {story.items.map((i) => (
                      <span key={i.id} className="border border-noir-600 px-1 py-0.5 text-paper/70">{i.icon} {i.name}</span>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleSection>
            </>}
            {tab === "test" && (
              <>
                <HelpNote id="test-tab" title="Try it without playing">
                  Pretend you already have items or flags, then see which choices would show. Faster than replaying the
                  whole game. When you're ready, click ▶ Play at the top to try the real thing. The Relationships
                  read-out is the same opinions the player's 🎭 ledger shows in-game.
                </HelpNote>
                <Playtester key={`tester:${story.id}`} story={story} scene={scene} />
                <PlaytestCoveragePanel
                  story={story}
                  onSelectScene={(sceneId) => {
                    setSelectedId(sceneId);
                    setTab("scene");
                  }}
                />
                <DeepLinkBuilder key={`link:${story.id}`} story={story} selectedSceneId={scene?.id} />
              </>
            )}
            {tab === "characters" && (
              <>
                <label className="flex items-center gap-2 border border-noir-600 p-2 font-type text-xs text-paper/70">
                  <input type="checkbox" checked={story.pulpPaper !== false} onChange={e => commit({ ...story, pulpPaper: e.target.checked })} />
                  Pulp paper by default (untick for photoreal art; player preference wins)
                </label>
                <HelpNote id="characters-tab" title="People in your game">
                  Click ＋ Add character, give them a name and a face (an emoji is fine). They can talk in Beats. Pick a
                  voice and hit <b>Test voice</b> to hear it. Tick <b>Show this met character on corkboard</b> if they
                  should appear on the deduction board once the player has met them. Trust (−5…+5) can lock or unlock
                  later choices.
                </HelpNote>
                <CharacterEditor story={story} onUpdate={commit} media={media} />
              </>
            )}
            {tab === "items" && (
              <>
                <HelpNote id="items-tab" title="Things the player can pick up">
                  Click ＋ Add new item — a key, a note, a photo. Tick <b>📌 is clue</b> so it appears on the corkboard.
                  A <b>recipe</b> (partner + result) lets players combine two items. If a door needs an item, that item
                  must be given somewhere (a hotspot, a choice reward, or a recipe) or Check will flag it.
                </HelpNote>
                {/* ---- how the inventory is PRESENTED (per case) ---- */}
                {(() => {
                  const inv = story.inventoryDisplay ?? {};
                  const setInv = (patch: Partial<InventorySettings>) =>
                    commit({ ...story, inventoryDisplay: { ...inv, ...patch } });
                  const mode = inv.mode ?? "classic";
                  return (
                    <div className="space-y-1.5 border border-gold/30 bg-gold/5 p-2">
                      <h3 className="font-pulp text-[10px] uppercase tracking-widest text-gold">🎒 Inventory display</h3>
                      <p className="font-type text-[9px] leading-snug text-paper/45">
                        How the player's inventory LOOKS in this case. Every case defaults to <b>Classic</b> — the chip
                        rail it already has — so nothing changes until you opt in. Pick <b>Container</b> for a pouch,
                        case or saddlebag sprite with the items inside it, and drop in your own art; <b>Big centre
                        screen</b> to open the loot as a full overlay with large art and item names; <b>Hidden</b> for
                        no dock at all.
                      </p>
                      <Field label="Mode">
                        <select className={inputCls} value={mode} onChange={(e) => setInv({ mode: e.target.value as InventorySettings["mode"] })}>
                          <option value="classic">Classic — chip rail (default, unchanged)</option>
                          <option value="container">Container — a bag/case sprite with items inside</option>
                          <option value="modal">Big centre screen — large item art in an overlay</option>
                          <option value="hidden">Hidden — no on-screen inventory</option>
                        </select>
                      </Field>
                      {mode !== "hidden" ? (
                        <>
                          <Field label="Heading (e.g. Satchel, Saddlebags, Case File)">
                            <input
                              className={inputCls}
                              value={inv.label ?? ""}
                              placeholder="Inventory"
                              onChange={(e) => setInv({ label: e.target.value })}
                            />
                          </Field>
                          {/* A centred overlay has no corner — only the
                              trigger button is docked, and that follows the
                              HUD row. */}
                          {mode !== "modal" ? (
                          <Field label="Corner">
                            <select className={inputCls} value={inv.anchor ?? "bottom-left"} onChange={(e) => setInv({ anchor: e.target.value as InventorySettings["anchor"] })}>
                              <option value="bottom-left">bottom-left</option>
                              <option value="bottom-right">bottom-right</option>
                              <option value="top-left">top-left</option>
                              <option value="top-right">top-right</option>
                            </select>
                          </Field>
                          ) : null}
                          {mode === "modal" ? (
                            <Field label="Item size (px) — how big each object is drawn">
                              <input
                                type="number"
                                min={64}
                                max={260}
                                className={inputCls}
                                value={inv.tileSize ?? 132}
                                onChange={(e) => setInv({ tileSize: Number(e.target.value) || undefined })}
                              />
                            </Field>
                          ) : null}
                          {mode === "container" ? (
                            <>
                              <Field label="Container art (transparent PNG — a bag, a case, a tool roll)">
                                <ImagePicker
                                  preferFolder="sprites"
                                  value={inv.image || undefined}
                                  placeholder="Pick art from the library (default: the house leather case)…"
                                  includeGradients={false}
                                  onChange={(url) => setInv({ image: url ?? undefined })}
                                />
                              </Field>
                              <div className="flex flex-wrap items-center gap-1">
                                <button
                                  className="border border-gold/40 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-gold hover:bg-gold/10"
                                  onClick={() => setInv({ image: "/assets/ui/inventory-case.png" })}
                                >
                                  👜 use the leather case
                                </button>
                                {inv.image ? (
                                  <button
                                    className="border border-crimson/40 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
                                    onClick={() => setInv({ image: undefined })}
                                  >
                                    ✕ clear art (house panel)
                                  </button>
                                ) : null}
                              </div>
                              {inv.image ? (
                                <img src={assetUrl(media(inv.image) ?? inv.image)} alt="" className="h-24 w-auto object-contain" />
                              ) : (
                                <p className="font-type text-[9px] text-paper/40">No art set — the dock draws a stitched leather panel.</p>
                              )}
                              <div className="grid grid-cols-3 gap-1">
                                <Field label={`Columns ${inv.columns ?? 4}`}>
                                  <input type="range" min={1} max={8} step={1} className="w-full accent-gold" value={inv.columns ?? 4} onChange={(e) => setInv({ columns: Number(e.target.value) })} />
                                </Field>
                                <Field label={`Inset ${inv.inset ?? 14}%`}>
                                  <input type="range" min={0} max={45} step={1} className="w-full accent-gold" value={inv.inset ?? 14} onChange={(e) => setInv({ inset: Number(e.target.value) })} />
                                </Field>
                                <Field label={`Height ${inv.height ?? 260}px`}>
                                  <input type="range" min={140} max={460} step={10} className="w-full accent-gold" value={inv.height ?? 260} onChange={(e) => setInv({ height: Number(e.target.value) })} />
                                </Field>
                              </div>
                              <label className="flex items-center gap-1 font-type text-[10px] text-paper/60">
                                <input type="checkbox" checked={!!inv.startClosed} onChange={(e) => setInv({ startClosed: e.target.checked || undefined })} />
                                Start collapsed (just the heading and the count)
                              </label>
                            </>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  );
                })()}
                <ItemEditor story={story} onUpdate={commit} />
              </>
            )}
            {tab === "flags" && (() => {
              const okCount = allFlags.filter((f) => flagsOk.has(f)).length;
              const q = flagFilter.trim().toLowerCase();
              const shown = allFlags.filter((flag) => {
                if (flagsOnlyTodo && flagsOk.has(flag)) return false;
                if (!q) return true;
                return (
                  flag.toLowerCase().includes(q) ||
                  prettyFlagName(flag).toLowerCase().includes(q) ||
                  (story.flagNotes?.[flag] ?? "").toLowerCase().includes(q)
                );
              });
              return (
              <div className="space-y-2">
                <HelpNote id="flags-tab" title="Secret checkboxes">
                  A flag is something the game remembers, like “found the key” or “made them angry”. You don't have to
                  add these by hand — they appear here when you use them on choices, hotspots, or the corkboard. Write a
                  note so you remember what each one <b>means</b>. A beat can <b>recall a flag</b> and echo that note
                  where <code>{`{said}`}</code> would go. Tick <b>✓ ok</b> once you've checked it — the mark is just for
                  you, it never ships with the game.
                </HelpNote>

                {/* ---- header: progress + filter, so a 60-flag story stays workable ---- */}
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-pulp text-[10px] uppercase tracking-widest text-gold">
                    🏷 Story flags ({allFlags.length})
                  </h3>
                  {allFlags.length > 0 && (
                    <span className={`font-type text-[9px] uppercase tracking-wider ${okCount === allFlags.length ? "text-emerald-300" : "text-paper/45"}`}>
                      {okCount === allFlags.length ? "✓ all checked" : `${okCount}/${allFlags.length} checked`}
                    </span>
                  )}
                </div>
                {allFlags.length > 1 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <input
                      className={`${inputCls} h-6 flex-1 min-w-[120px] font-type text-[10px]`}
                      placeholder="Filter flags, names or notes…"
                      value={flagFilter}
                      onChange={(e) => setFlagFilter(e.target.value)}
                    />
                    <button
                      type="button"
                      title="Show only the flags you haven't ticked ✓ ok yet"
                      aria-pressed={flagsOnlyTodo}
                      className={`border px-1.5 py-0.5 font-type text-[9px] uppercase tracking-wider ${flagsOnlyTodo ? "border-gold bg-gold/15 text-gold" : "border-noir-600 text-paper/50 hover:text-paper/80"}`}
                      onClick={() => setFlagsOnlyTodo((v) => !v)}
                    >
                      unchecked only
                    </button>
                    <button
                      type="button"
                      title="Expand every flag"
                      className="border border-noir-600 px-1.5 py-0.5 font-type text-[9px] uppercase tracking-wider text-paper/50 hover:text-paper/80"
                      onClick={() => setFlagsOpen(new Set(allFlags))}
                    >
                      ⤢ all
                    </button>
                    <button
                      type="button"
                      title="Collapse every flag"
                      className="border border-noir-600 px-1.5 py-0.5 font-type text-[9px] uppercase tracking-wider text-paper/50 hover:text-paper/80"
                      onClick={() => setFlagsOpen(new Set())}
                    >
                      ⤡ none
                    </button>
                  </div>
                )}

                {allFlags.length === 0 && (
                  <p className="font-type text-[10px] leading-relaxed text-paper/45">
                    No flags yet — set one on a choice (“Sets flags”), a hotspot (Set flag action), a
                    pattern puzzle reward, a quick-time timeout, an on-enter effect, or a corkboard
                    deduction, and it appears here with a note box.
                  </p>
                )}
                {allFlags.length > 0 && shown.length === 0 && (
                  <p className="font-type text-[10px] leading-relaxed text-paper/45">
                    {flagsOnlyTodo && okCount === allFlags.length
                      ? "Every flag is ticked ✓ ok."
                      : "No flag matches that filter."}
                  </p>
                )}

                {/* ---- one collapsed row per flag: name, note preview, ✓ ok ---- */}
                {shown.map((flag) => {
                  const ok = flagsOk.has(flag);
                  const open = flagsOpen.has(flag);
                  const note = story.flagNotes?.[flag] ?? "";
                  const sources = flagSetSources(story, flag);
                  return (
                    <div
                      key={flag}
                      className={`border ${ok ? "border-emerald-500/40 bg-emerald-500/5" : "border-noir-600"}`}
                    >
                      <div className="flex items-center gap-1.5 px-1.5 py-1">
                        <button
                          type="button"
                          aria-expanded={open}
                          title={open ? "Minimise this flag" : "Maximise this flag"}
                          className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                          onClick={() =>
                            setFlagsOpen((prev) => {
                              const next = new Set(prev);
                              if (next.has(flag)) next.delete(flag);
                              else next.add(flag);
                              return next;
                            })
                          }
                        >
                          <span className="shrink-0 text-paper/50" aria-hidden>{open ? "▾" : "▸"}</span>
                          <span className="shrink-0 font-mono text-[11px] text-gold" title={flag}>{flag}</span>
                          {!open && (
                            <span className="min-w-0 truncate font-type text-[9px] text-paper/40" title={note || prettyFlagName(flag)}>
                              {note || `“${prettyFlagName(flag)}” — no note yet`}
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          aria-pressed={ok}
                          title={ok ? "Checked — click to clear" : "Mark this flag checked ok"}
                          className={`shrink-0 border px-1.5 py-0.5 font-type text-[9px] uppercase tracking-wider ${ok ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-200" : "border-noir-600 text-paper/40 hover:text-paper/80"}`}
                          onClick={() => toggleFlagOk(flag)}
                        >
                          {ok ? "✓ ok" : "✓"}
                        </button>
                      </div>
                      {open && (
                        <div className="border-t border-noir-700/70 p-1.5">
                          <div className="font-type text-[9px] uppercase tracking-wider text-paper/35">
                            “{prettyFlagName(flag)}”
                          </div>
                          {sources.length > 0 && (
                            <p className="mt-1 font-type text-[9px] leading-snug text-paper/45">
                              Set: {sources.slice(0, 4).join(" · ")}{sources.length > 4 ? ` · +${sources.length - 4} more` : ""}
                            </p>
                          )}
                          <textarea
                            className={`${inputCls} mt-1.5 h-14 font-type`}
                            placeholder="What does this flag mean? (Echoed when a beat recalls it, and shown in the player's Story so far.)"
                            value={note}
                            onChange={(e) => {
                              const notes = { ...(story.flagNotes ?? {}) };
                              if (e.target.value.trim()) notes[flag] = e.target.value;
                              else delete notes[flag];
                              commit({ ...story, flagNotes: Object.keys(notes).length ? notes : undefined });
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* ---- verb coin: the story's "that doesn't work" lines ---- */}
                <CollapsibleSection
                  id="flags-verb-refusals"
                  title="🎛 Verb coin — refusal lines"
                  titleClass="text-gold"
                  className="mt-3 border border-gold/30 bg-gold/5"
                  hint={`${VERB_IDS.filter((v) => (story.verbResponses?.[v] ?? []).length).length}/${VERB_IDS.length} set`}
                >
                  <p className="font-type text-[9px] leading-snug text-paper/45">
                    What the player is told when they try a verb an object doesn't answer to (or use the wrong item
                    on it) in a room with the 🎛 verb coin on. One line per row — the engine varies them, so a failed
                    verb doesn't read like a stuck record. A hotspot's own “Refusal line” beats these.
                  </p>
                  {VERB_IDS.map((v) => (
                    <div key={v} className="mt-1">
                      <div className="font-pulp text-[9px] uppercase tracking-widest text-paper/40">
                        <span aria-hidden>{VERB_ICON[v]}</span> {VERB_LABEL[v]}
                      </div>
                      <textarea
                        className={`${inputCls} h-14 font-type`}
                        placeholder="One refusal line per row…"
                        value={(story.verbResponses?.[v] ?? []).join("\n")}
                        onChange={(e) => {
                          const lines = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
                          const next = { ...(story.verbResponses ?? {}) };
                          if (lines.length) next[v] = lines;
                          else delete next[v];
                          commit({ ...story, verbResponses: Object.keys(next).length ? next : undefined });
                        }}
                      />
                    </div>
                  ))}
                </CollapsibleSection>
              </div>
              );
            })()}
            {tab === "acts" && (
              <ActEditor
                story={story}
                onUpdate={commit}
                onSelectScene={(sceneId) => {
                  setSelectedId(sceneId);
                  setTab("scene");
                }}
              />
            )}
            {tab === "map" && (
              <MapEditor story={story} onUpdate={commit} />
            )}
            {tab === "episodes" && (
              <EpisodeEditor
                story={story}
                onUpdate={commit}
                onSelectScene={(sceneId) => {
                  setSelectedId(sceneId);
                  setTab("scene");
                }}
              />
            )}
            {tab === "media" && (
              <>
                <HelpNote id="media-tab" title="Pictures, sounds, videos">
                  Upload a file here, then pick it from a dropdown on a scene. Files are stored once and reused
                  everywhere. Drafts keep compact <code>asset:</code> references so big files don't fill the browser —
                  the indicator tells you whether uploads will survive a reload.
                </HelpNote>
                <MediaLibrary storyId={story.id} />
                <BackgroundRemover storyId={story.id} />
                <SheetLab storyId={story.id} />
                <SpriteCutoutLab storyId={story.id} />
                <SheetSplitter storyId={story.id} />
              </>
            )}
            {tab === "ai" && <AiImageStudio storyId={story.id} />}
            {tab === "dialogueBox" && (() => {
              const dbox = story.dialogueBox ?? {};
              const setBox = (patch: Partial<typeof dbox>) =>
                commit({ ...story, dialogueBox: { ...dbox, ...patch } });
              const reserve = dbox.reserveLines ?? 3;
              const opacity = dbox.backgroundOpacity ?? 0.85;
              return (
                <div className="space-y-2">
                  <h3 className="font-pulp text-[10px] uppercase tracking-widest text-gold">🎮 In-game theme</h3>
                  <p className="font-type text-[9px] leading-relaxed text-paper/45">
                    Story-wide look: the dialogue panel, the reading text type &amp; size, and the HUD accent colours.
                    Everything here applies to the whole case so the reading surface and HUD stay consistent scene to scene.
                  </p>

                  {/* ---- HUD colour scheme ---- */}
                  <div className="border border-gold/30 bg-gold/5 p-2 space-y-1.5" style={inGameThemeVars(dbox)}>
                    <div className="font-pulp text-[9px] uppercase tracking-widest text-gold">🎨 HUD colour scheme</div>
                    <select
                      className={inputCls}
                      value={dbox.hudTheme ?? "classic"}
                      onChange={(e) => setBox({ hudTheme: (e.target.value || "classic") as never })}
                    >
                      {HUD_THEME_LIST.map((h) => (
                        <option key={h.id} value={h.id}>{h.badge} {h.name} — {h.tagline}</option>
                      ))}
                    </select>
                    <p className="font-type text-[9px] leading-snug text-paper/45">
                      {HUD_THEMES[dbox.hudTheme ?? "classic"]?.tagline}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Custom accent">
                        <input type="color" className={`${inputCls} h-8 p-0.5`}
                          value={dbox.accentColor ?? HUD_THEMES[dbox.hudTheme ?? "classic"].colors.gold}
                          onChange={(e) => setBox({ accentColor: e.target.value })} />
                      </Field>
                      <Field label="Custom danger">
                        <input type="color" className={`${inputCls} h-8 p-0.5`}
                          value={dbox.dangerColor ?? HUD_THEMES[dbox.hudTheme ?? "classic"].colors.crimson}
                          onChange={(e) => setBox({ dangerColor: e.target.value })} />
                      </Field>
                    </div>
                    {themeColorWarnings(dbox.accentColor, dbox.dangerColor).map((w, i) => (
                      <p key={i} className="font-type text-[9px] leading-snug text-amber-400/90">⚠ {w}</p>
                    ))}
                    {(dbox.accentColor || dbox.dangerColor) && (
                      <button
                        className="w-full border border-paper/30 py-1 font-pulp text-[9px] uppercase tracking-widest text-paper/60 hover:text-gold"
                        onClick={() => setBox({ accentColor: undefined, dangerColor: undefined })}
                      >
                        ⟲ Use the scheme colours
                      </button>
                    )}
                    <label className="flex items-start gap-2 text-[10px] uppercase tracking-wider text-paper/60">
                      <input type="checkbox" className="mt-0.5"
                        checked={!!dbox.minimalHud}
                        onChange={(e) => setBox({ minimalHud: e.target.checked || undefined })} />
                      <span>Minimal HUD
                        <span className="block font-type text-[9px] normal-case tracking-normal text-paper/45">
                          Fades scene-label/lead readouts until you hover — a cleaner, more cinematic frame.
                        </span>
                      </span>
                    </label>
                  </div>

                  {/* ---- CURSOR ART (per verb) ---- */}
                  <CursorArtEditor story={story} onUpdate={commit} media={media} themeVars={inGameThemeVars(dbox)} />

                  {/* ---- VERB MENU (skull pie) — opt-in, live preview + icon ---- */}
                  {(() => {
                    const icon = story.verbMenuIcon;
                    const enabled = story.verbMenuEnabled !== false;
                    // Preview verbs: the union of every stage room's coin so the
                    // author sees the fullest ring (or the core five).
                    const stageScenes = story.scenes.filter((s) => s.nodeType === "stage");
                    const pieVerbs = verbsForScene({ stage: { ...(stageScenes[0]?.stage ?? {}) }, hotspots: (stageScenes[0]?.hotspots ?? []) as Hotspot[] });
                    const previewVerbs = pieVerbs.length ? pieVerbs : CORE_VERB_IDS;
                    return (
                      <div className="border border-gold/30 bg-gold/5 p-2 space-y-2" style={inGameThemeVars(dbox)}>
                        <div className="flex items-center justify-between">
                          <div className="font-pulp text-[9px] uppercase tracking-widest text-gold">💀 Verb menu (skull pie)</div>
                          <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-paper/70">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={(e) => commit({ ...story, verbMenuEnabled: e.target.checked ? undefined : false })}
                            />
                            <span className={enabled ? "text-gold" : "text-paper/40"}>{enabled ? "On" : "Off (never shown)"}</span>
                          </label>
                        </div>
                        <p className="font-type text-[9px] leading-snug text-paper/45">
                          The object-first verb menu — the skull pie. <b>Opt-in</b>: it only appears on a
                          Walkable Stage whose <b>Object-first verb menu</b> is on (see that panel). This switch is the
                          story-wide kill-switch: off = it never shows, in any scene. The sprite below sits at the
                          centre of the ring.
                        </p>
                        <div className="flex items-start gap-3">
                          <VerbMenuPiePreview verbs={previewVerbs} icon={icon} media={media} size={168} />
                          <div className="min-w-0 flex-1 space-y-2">
                            <Field label="Menu icon (centrepiece)">
                              <ImagePicker
                                value={icon && !icon.startsWith("emoji:") ? icon : undefined}
                                onChange={(v) => commit({ ...story, verbMenuIcon: v })}
                                placeholder="Pick an image… (or type an emoji below)"
                                preferFolder="sprites"
                              />
                            </Field>
                            <div className="flex items-center gap-2">
                              <input
                                className={`${inputCls} min-w-0 flex-1`}
                                value={icon ?? ""}
                                placeholder="…or an emoji: 💀 ☠️ 👁 🕹"
                                onChange={(e) => commit({ ...story, verbMenuIcon: e.target.value || undefined })}
                              />
                              {icon ? (
                                <button
                                  className="shrink-0 border border-paper/30 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/60 hover:text-gold"
                                  onClick={() => commit({ ...story, verbMenuIcon: undefined })}
                                >
                                  ⟲ default 💀
                                </button>
                              ) : null}
                            </div>
                            <p className="font-type text-[9px] leading-snug text-paper/40">
                              Make it any sprite: pick an uploaded image, or cut one out in the{" "}
                              <b className="text-paper/60">🎞 Sprite sheet editor</b> /{" "}
                              <b className="text-paper/60">Background remover</b> and pick it here. A transparent PNG
                              reads best in the ring.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ---- PLAYER CHARACTER (story-wide walker) ---- */}
                  {(() => {
                    const ps = story.playerSprite ?? {};
                    const setPs = (patch: Partial<typeof ps>) =>
                      commit({ ...story, playerSprite: Object.keys({ ...ps, ...patch }).length ? { ...ps, ...patch } : undefined });
                    return (
                      <div className="border border-gold/30 bg-gold/5 p-2 space-y-1.5">
                        <div className="font-pulp text-[9px] uppercase tracking-widest text-gold">🚶 Player character (story-wide walker)</div>
                        <p className="font-type text-[9px] leading-snug text-paper/45">
                          The walker every 🚶 stage scene uses unless that scene sets its own sprite in the
                          <b> Walkable Stage</b> panel. Define the protagonist ONCE here. Leave empty to keep
                          the per-scene default.
                        </p>
                        <Field label="Character image (pick from the library — or type an emoji)">
                          <input
                            className={inputCls}
                            value={ps.image ?? ""}
                            placeholder="emoji:🏍 — or pick art below"
                            onChange={(e) => setPs({ image: e.target.value || undefined })}
                          />
                          <div className="mt-1">
                            <ImagePicker
                              value={ps.image && !ps.image.startsWith("emoji:") ? ps.image : undefined}
                              onChange={(v) => setPs({ image: v || undefined })}
                              placeholder="…or pick art from your image library"
                              preferFolder="sprites"
                            />
                          </div>
                        </Field>
                        <div className="space-y-1 border border-cyan-neon/30 bg-cyan-neon/5 p-2">
                          <div className="font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">🎞 Sprite-sheet walker</div>
                          <p className="font-type text-[9px] leading-snug text-paper/45">
                            One image, gridded frames with <b>walk</b> / <b>idle</b> (and optional directional
                            <b> walk-up / walk-down / idle-up / idle-down</b>, plus diagonal suffixes such as <b>walk-up-right</b>). Overrides the image field above while set.
                          </p>
                          <SpriteSheetControls
                            value={ps.sheet}
                            storyId={story.id}
                            preset={WALKER_PRESET}
                            onChange={(sheet) => setPs({ sheet })}
                          />
                        </div>
                        {Object.keys(ps).length ? (
                          <button
                            className="w-full border border-paper/30 py-1 font-pulp text-[9px] uppercase tracking-widest text-paper/60 hover:text-gold"
                            onClick={() => commit({ ...story, playerSprite: undefined })}
                          >
                            ⟲ Clear (use per-scene walkers)
                          </button>
                        ) : null}
                      </div>
                    );
                  })()}

                  {/* ---- investigation panels ---- */}
                  <div className="border border-gold/30 bg-gold/5 p-2 space-y-1.5">
                    <div className="font-pulp text-[9px] uppercase tracking-widest text-gold">🗂 Investigation panels</div>
                    <p className="font-type text-[9px] leading-snug text-paper/45">
                      Each panel is automatic: it only appears when this story actually uses the feature
                      (corkboard needs a deduction board, travel map needs 🗺 Map locations). Tick a box to
                      force one OFF for a cleaner frame even when the story defines it.
                    </p>
                    <label className="flex items-start gap-2 text-[10px] uppercase tracking-wider text-paper/60">
                      <input type="checkbox" className="mt-0.5"
                        checked={!!dbox.hideCaseProgress}
                        onChange={(e) => setBox({ hideCaseProgress: e.target.checked || undefined })} />
                      <span>Hide ▤ Case Progress drawer
                        <span className="block font-type text-[9px] normal-case tracking-normal text-paper/45">
                          {story.deduction || story.map?.locations?.length ? "Shown by default." : "Shown by default (tracks perks, people met, clues)."}
                        </span>
                      </span>
                    </label>
                    <label className="flex items-start gap-2 text-[10px] uppercase tracking-wider text-paper/60">
                      <input type="checkbox" className="mt-0.5"
                        checked={!!dbox.hideCorkboard}
                        onChange={(e) => setBox({ hideCorkboard: e.target.checked || undefined })} />
                      <span>Hide 📌 Corkboard
                        <span className="block font-type text-[9px] normal-case tracking-normal text-paper/45">
                          {story.deduction ? "This story HAS a deduction board — hiding removes the menu entry and the B key." : "This story has no deduction board, so the corkboard is already hidden automatically."}
                        </span>
                      </span>
                    </label>
                    <label className="flex items-start gap-2 text-[10px] uppercase tracking-wider text-paper/60">
                      <input type="checkbox" className="mt-0.5"
                        checked={!!dbox.hideMap}
                        onChange={(e) => setBox({ hideMap: e.target.checked || undefined })} />
                      <span>Hide 🗺 Travel Map
                        <span className="block font-type text-[9px] normal-case tracking-normal text-paper/45">
                          {story.map?.locations?.length ? "This story HAS map locations — hiding removes the menu entry and the T key." : "This story has no map locations yet (add them on the 🗺 Map tab), so the map is already hidden automatically."}
                        </span>
                      </span>
                    </label>
                  </div>

                  {/* ---- text type & size ---- */}
                  <div className="border border-neon/30 bg-neon/5 p-2 space-y-1.5" style={inGameThemeVars(dbox)}>
                    <div className="font-pulp text-[9px] uppercase tracking-widest text-neon">📝 Text type &amp; size</div>
                    <Field label="Body font (prose & dialogue)">
                      <select className={inputCls} value={dbox.bodyFont ?? "type"}
                        onChange={(e) => setBox({ bodyFont: e.target.value as never })}>
                        {BODY_FONTS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </Field>
                    <Field label="Heading font (nameplates, HUD labels)">
                      <select className={inputCls} value={dbox.headingFont ?? "pulp"}
                        onChange={(e) => setBox({ headingFont: e.target.value as never })}>
                        {HEADING_FONTS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </Field>
                    <Field label={`Reading text size ${Math.round((dbox.textScale ?? 1) * 100)}%`}>
                      <input type="range" min={0.8} max={1.4} step={0.05}
                        className="w-full accent-pink-500"
                        value={dbox.textScale ?? 1}
                        onChange={(e) => setBox({ textScale: Number(e.target.value) })} />
                      <p className="mt-1 font-type text-[9px] text-paper/45">
                        Resizes the prose/dialogue text and the reserved line height so the panel stays stable.
                      </p>
                    </Field>
                  </div>

                  <div className="border border-paper/15 p-2 space-y-1.5">
                    <div className="font-pulp text-[9px] uppercase tracking-widest text-paper/70">🗨 Dialogue panel</div>


                  <Field label={`Reserve ${reserve === 0 ? "no" : reserve} line${reserve === 1 ? "" : "s"} of space`}>
                    <input
                      type="range"
                      min={0}
                      max={8}
                      step={1}
                      className="w-full"
                      value={reserve}
                      onChange={(e) => setBox({ reserveLines: parseInt(e.target.value, 10) })}
                    />
                    <p className="mt-1 font-type text-[9px] leading-relaxed text-paper/45">
                      Holds the text area open at a fixed height so the box does not grow while the
                      typewriter runs. Without it the panel resizes on every line and the Back /
                      Skip / narrate buttons move under the player's cursor. Longer prose still
                      expands past the reservation — this is a floor, not a limit.
                      <span className="text-paper/30"> 0 restores the old resizing behaviour.</span>
                    </p>
                  </Field>

                  <Field label="Backdrop image (optional)">
                    <input
                      className={inputCls}
                      placeholder="paste a gradient:linear-gradient(…) — or pick art below"
                      value={dbox.backgroundImage ?? ""}
                      onChange={(e) => setBox({ backgroundImage: e.target.value || undefined })}
                    />
                    <div className="mt-1">
                      <ImagePicker
                        value={dbox.backgroundImage}
                        onChange={(v) => setBox({ backgroundImage: v || undefined })}
                        placeholder="🖼 browse the image library (incl. gradient presets)…"
                      />
                    </div>
                  </Field>

                  <Field label={`Backdrop opacity ${Math.round(opacity * 100)}%`}>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-full"
                      value={opacity}
                      onChange={(e) => setBox({ backgroundOpacity: parseFloat(e.target.value) })}
                    />
                    <p className="mt-1 font-type text-[9px] text-paper/45">
                      How solid the panel sits over the scene art. Low values keep the shot visible;
                      high values make dialogue easiest to read.
                    </p>
                  </Field>

                  <div className="grid grid-cols-2 gap-1">
                    <Field label="Tint colour">
                      <input
                        type="color"
                        className={`${inputCls} h-8 p-0.5`}
                        value={dbox.backgroundColor ?? "#07080c"}
                        onChange={(e) => setBox({ backgroundColor: e.target.value })}
                      />
                    </Field>
                    <Field label={`Blur ${dbox.backdropBlur ?? 0}px`}>
                      <input
                        type="range"
                        min={0}
                        max={16}
                        step={1}
                        className="w-full"
                        value={dbox.backdropBlur ?? 0}
                        onChange={(e) => setBox({ backdropBlur: parseInt(e.target.value, 10) })}
                      />
                    </Field>
                  </div>

                    <label className="flex items-center gap-2 font-type text-[10px] text-paper/70">
                      <input
                        type="checkbox"
                        checked={!!dbox.bordered}
                        onChange={(e) => setBox({ bordered: e.target.checked })}
                      />
                      Draw a border + drop shadow (reads as a card rather than a gradient)
                    </label>
                  </div>

                  {/* Live preview of the panel against a stand-in scene. */}
                  <div className="mt-2">
                    <p className="mb-1 font-pulp text-[9px] uppercase tracking-widest text-paper/40">Preview — reflects HUD colours, fonts &amp; size</p>
                    <div
                      className="relative h-40 w-full overflow-hidden border border-noir-600"
                      style={{ ...inGameThemeVars(dbox), background: "linear-gradient(135deg,#1b2b3a,#432038 60%,#0b0d12)" }}
                    >
                      {/* a faux HUD label so the accent/heading font is visible */}
                      <div className="absolute left-2 top-2 flex items-center gap-2">
                        <span className="h-2.5 w-[3px] bg-gold" aria-hidden />
                        <span className="font-pulp text-[10px] uppercase tracking-widest text-gold">🎙 Narrator</span>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-2">
                        <div
                          className={`relative p-2 ${dbox.bordered ? "border border-paper/15 shadow-2xl shadow-black/60" : ""}`}
                          style={{
                            backgroundColor: dbox.backgroundColor ?? "#07080c",
                            opacity: opacity,
                            ...(dbox.backgroundImage && !dbox.backgroundImage.startsWith("asset:")
                              ? bgStyle(dbox.backgroundImage)
                              : {}),
                          }}
                        >
                          <p
                            className="ingame-prose font-type text-paper"
                            style={{ ["--ingame-text-scale" as string]: String(dbox.textScale ?? 1), minHeight: reserve > 0 ? `${(reserve * 1.375 * (dbox.textScale ?? 1)).toFixed(3)}em` : undefined }}
                          >
                            The rain hadn't let up since Tuesday.
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="mt-1 font-type text-[9px] text-paper/35">
                      Try a HUD scheme, swap the body font, or move the text-size slider — the preview updates live.
                    </p>
                  </div>
                </div>
              );
            })()}

            {tab === "globalTitle" && (
              <div className="space-y-4">
                <div className="border border-gold/40 bg-gold/5 p-2.5">
                  <div className="font-pulp text-[10px] uppercase tracking-widest text-gold">👑 Global Title Page Theme</div>
                  <p className="font-type text-[9px] text-paper/50 mt-1">
                    These settings apply globally to the main landing menu of Scarlet Reel. Changes are autosaved and applied instantly to the newsstand.
                  </p>
                </div>

                <Field label="Main title text">
                  <input
                    className={inputCls}
                    value={globalTitleTheme.titleText ?? ""}
                    placeholder="Scarlet Reel"
                    onChange={(e) => {
                      const next = { ...globalTitleTheme, titleText: e.target.value };
                      setGlobalTitleThemeState(next);
                      onUpdateTitleTheme(next);
                    }}
                  />
                </Field>

                {/* ★ FEATURED CASES — the front page of the newsstand. */}
                <Field label="★ Featured cases (big cards at the top of the newsstand)">
                  <div className="space-y-1">
                    <p className="font-type text-[9px] leading-snug text-paper/45">
                      Tick a case to give it a full-width banner card above the ordinary grid. The order you tick
                      them is the running order of the front page. Nothing ticked = the newsstand looks as it
                      always did.
                    </p>
                    {(() => {
                      const feat = globalTitleTheme.featuredStoryIds ?? [];
                      const setFeat = (ids: string[]) => {
                        const next = { ...globalTitleTheme, featuredStoryIds: ids.length ? ids : undefined };
                        setGlobalTitleThemeState(next);
                        onUpdateTitleTheme(next);
                      };
                      // ORPHANS — ids featured but no longer in the catalogue
                      // (the case was deleted). They render no checkbox row, so
                      // without this they could never be unticked.
                      const known = new Set(baseStories.map((b) => b.id));
                      const orphans = feat.filter((id) => !known.has(id));
                      return (
                        <div className="max-h-48 space-y-0.5 overflow-y-auto border border-noir-700 bg-noir-950/60 p-1">
                          {orphans.map((id) => (
                            <div key={id} className="flex items-center gap-1.5 px-1 py-0.5 font-type text-[10px] text-crimson">
                              <span className="truncate">⚠ {id} — no longer in the catalogue</span>
                              <button
                                className="ml-auto shrink-0 underline hover:text-paper"
                                onClick={() => setFeat(feat.filter((f) => f !== id))}
                              >
                                remove
                              </button>
                            </div>
                          ))}
                          {baseStories.map((st) => {
                            const at = feat.indexOf(st.id);
                            const on = at >= 0;
                            return (
                              <label
                                key={st.id}
                                className={`flex cursor-pointer items-center gap-1.5 px-1 py-0.5 font-type text-[10px] ${
                                  on ? "bg-gold/10 text-gold" : "text-paper/60 hover:bg-noir-800"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={on}
                                  onChange={() => setFeat(on ? feat.filter((f) => f !== st.id) : [...feat, st.id])}
                                />
                                {on ? <span className="font-pulp text-[9px]">★{at + 1}</span> : null}
                                <span className="truncate">{st.title}</span>
                              </label>
                            );
                          })}
                          {feat.length > 0 ? (
                            <button
                              className="mt-1 w-full border border-noir-700 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/50 hover:border-crimson hover:text-crimson"
                              onClick={() => setFeat([])}
                            >
                              clear featured strip
                            </button>
                          ) : null}
                        </div>
                      );
                    })()}
                  </div>
                </Field>

                <Field label="Title page tagline / header text">
                  <input
                    className={inputCls}
                    value={globalTitleTheme.tagline ?? ""}
                    placeholder="A Dime-Store Detective Serial"
                    onChange={(e) => {
                      const next = { ...globalTitleTheme, tagline: e.target.value };
                      setGlobalTitleThemeState(next);
                      onUpdateTitleTheme(next);
                    }}
                  />
                </Field>

                <Field label="Main soundtrack music (paste URL or upload MP3)">
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      <input
                        className={inputCls}
                        placeholder="/audio/main_theme.mp3"
                        value={globalTitleTheme.musicUrl?.startsWith("data:") || globalTitleTheme.musicUrl?.startsWith("asset:") ? "" : globalTitleTheme.musicUrl ?? ""}
                        onChange={(e) => {
                          const next = { ...globalTitleTheme, musicUrl: e.target.value || undefined };
                          setGlobalTitleThemeState(next);
                          onUpdateTitleTheme(next);
                        }}
                      />
                      <MediaUploadButton
                        storyId="__global__"
                        accept="audio/*"
                        label="⇧ Upload"
                        onUploaded={(_url, assetId) => {
                          const next = { ...globalTitleTheme, musicUrl: `asset:${assetId}` };
                          setGlobalTitleThemeState(next);
                          onUpdateTitleTheme(next);
                        }}
                      />
                    </div>
                    <AssetDropdown
                      storyId="__global__"
                      assetType="audio"
                      value={globalTitleTheme.musicUrl}
                      returnReference
                      onChange={(value) => {
                        const next = { ...globalTitleTheme, musicUrl: value };
                        setGlobalTitleThemeState(next);
                        onUpdateTitleTheme(next);
                      }}
                      placeholder="Pick an uploaded main theme..."
                    />
                    {globalTitleTheme.musicUrl && !globalTitleTheme.musicUrl.startsWith("asset:") && (
                      <div className="flex items-center gap-2">
                        <audio controls src={assetUrl(globalTitleTheme.musicUrl)} className="h-8 flex-1" />
                        <button
                          onClick={() => {
                            const next = { ...globalTitleTheme, musicUrl: undefined };
                            setGlobalTitleThemeState(next);
                            onUpdateTitleTheme(next);
                          }}
                          className="border border-crimson/40 px-2 py-0.5 font-pulp text-[9px] uppercase text-crimson hover:bg-crimson/10"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </Field>

                <Field label="Title page background image (paste URL or upload image)">
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      <input
                        className={inputCls}
                        placeholder="/img/bg-alley.jpg"
                        value={globalTitleTheme.bgImageUrl?.startsWith("data:") || globalTitleTheme.bgImageUrl?.startsWith("asset:") ? "" : globalTitleTheme.bgImageUrl ?? ""}
                        onChange={(e) => {
                          const next = { ...globalTitleTheme, bgImageUrl: e.target.value || undefined };
                          setGlobalTitleThemeState(next);
                          onUpdateTitleTheme(next);
                        }}
                      />
                      <MediaUploadButton
                        storyId="__global__"
                        accept="image/*"
                        label="⇧ Upload"
                        onUploaded={(_url, assetId) => {
                          const next = { ...globalTitleTheme, bgImageUrl: `asset:${assetId}` };
                          setGlobalTitleThemeState(next);
                          onUpdateTitleTheme(next);
                        }}
                      />
                    </div>
                    <ImagePicker
                      value={globalTitleTheme.bgImageUrl}
                      onChange={(value) => {
                        const next = { ...globalTitleTheme, bgImageUrl: value || undefined };
                        setGlobalTitleThemeState(next);
                        onUpdateTitleTheme(next);
                      }}
                      placeholder="🖼 browse the image library (uploads & built-ins)…"
                    />
                    {globalTitleTheme.bgImageUrl && !globalTitleTheme.bgImageUrl.startsWith("asset:") && (
                      <div className="flex items-center gap-2">
                        <img src={assetUrl(globalTitleTheme.bgImageUrl)} alt="Background preview" className="h-14 w-full object-cover" />
                        <button
                          onClick={() => {
                            const next = { ...globalTitleTheme, bgImageUrl: undefined };
                            setGlobalTitleThemeState(next);
                            onUpdateTitleTheme(next);
                          }}
                          className="border border-crimson/40 px-2 py-1 font-pulp text-[10px] uppercase text-crimson hover:bg-crimson/10"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </Field>

                <Field label="Neon pink glow override color (HEX code)">
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      className="w-10 h-8 border border-noir-600 bg-noir-950 cursor-pointer"
                      value={globalTitleTheme.neonColor ?? "#ff2e88"}
                      onChange={(e) => {
                        const next = { ...globalTitleTheme, neonColor: e.target.value };
                        setGlobalTitleThemeState(next);
                        onUpdateTitleTheme(next);
                      }}
                    />
                    <input
                      className={inputCls}
                      value={globalTitleTheme.neonColor ?? "#ff2e88"}
                      placeholder="#ff2e88"
                      onChange={(e) => {
                        const next = { ...globalTitleTheme, neonColor: e.target.value };
                        setGlobalTitleThemeState(next);
                        onUpdateTitleTheme(next);
                      }}
                    />
                  </div>
                </Field>
              </div>
            )}
            {tab === "briefing" && (
              <div className="space-y-2">
                <HelpNote id="briefing-tab" title="What's the player trying to do?">
                  Write one sentence: that's your game's goal. Players always see it. <b>Game Info</b> is the spoiler-free
                  blurb behind the Newsreel card's Info button. Later you can add a <b>heat limit</b> plus a <b>bust
                  scene</b> so too much Heat sends them to a game-over. The audit below counts victory / game-over
                  endings — Check likes at least one of each.
                </HelpNote>
                <h3 className="font-pulp text-[10px] uppercase tracking-widest text-gold">🗂 Case File — info, win &amp; lose rules</h3>
                <p className="font-type text-[9px] text-paper/45">Game Info appears from the Info button on this case's Newsreel card. The objective and rules appear in-game.</p>
                <Field label="Game Info (Newsreel synopsis)">
                  <textarea
                    className={`${inputCls} h-28 font-type`}
                    placeholder="Give players a spoiler-free synopsis: premise, mood, role and style of play."
                    value={story.briefing?.gameInfo ?? ""}
                    onChange={(e) => commit({ ...story, briefing: { ...(story.briefing ?? { objective: "", winConditions: [], loseConditions: [] }), gameInfo: e.target.value } })}
                  />
                </Field>
                <Field label="Objective (one line)">
                  <textarea
                    className={`${inputCls} h-14 font-type`}
                    placeholder="What is the detective actually trying to achieve?"
                    value={story.briefing?.objective ?? ""}
                    onChange={(e) => commit({ ...story, briefing: { ...(story.briefing ?? { objective: "", winConditions: [], loseConditions: [] }), objective: e.target.value } })}
                  />
                </Field>
                <Field label="Win conditions (one per line)">
                  <textarea
                    className={`${inputCls} h-24 font-type`}
                    placeholder={"Collect both photo halves\nWire the ledger to Rocco\nAccuse with full evidence"}
                    value={(story.briefing?.winConditions ?? []).join("\n")}
                    onChange={(e) => commit({ ...story, briefing: { ...(story.briefing ?? { objective: "", winConditions: [], loseConditions: [] }), winConditions: e.target.value.split("\n").filter((l) => l.trim()) } })}
                  />
                </Field>
                <Field label="Lose conditions (one per line)">
                  <textarea
                    className={`${inputCls} h-24 font-type`}
                    placeholder={"Accuse without evidence\nLet Heat max out"}
                    value={(story.briefing?.loseConditions ?? []).join("\n")}
                    onChange={(e) => commit({ ...story, briefing: { ...(story.briefing ?? { objective: "", winConditions: [], loseConditions: [] }), loseConditions: e.target.value.split("\n").filter((l) => l.trim()) } })}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-1">
                  <Field label="Heat limit (0 = off)">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      className={inputCls}
                      value={story.briefing?.heatLimit ?? 0}
                      onChange={(e) => commit({ ...story, briefing: { ...(story.briefing ?? { objective: "", winConditions: [], loseConditions: [] }), heatLimit: Math.max(0, Math.min(10, parseInt(e.target.value, 10) || 0)) } })}
                    />
                  </Field>
                  <Field label="Bust scene when heat maxes">
                    <select
                      className={inputCls}
                      value={story.briefing?.heatFailSceneId ?? ""}
                      onChange={(e) => commit({ ...story, briefing: { ...(story.briefing ?? { objective: "", winConditions: [], loseConditions: [] }), heatFailSceneId: e.target.value || undefined } })}
                    >
                      <option value="">— warn only —</option>
                      {story.scenes.filter((s) => s.isEnding).map((s) => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="border border-noir-600 p-2">
                  <div className="mb-1 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">Ending audit</div>
                  {["victory-gold", "victory-silver", "gameover"].map((tier) => {
                    const count = story.scenes.filter((s) => s.isEnding && s.endingData?.tier === tier).length;
                    return (
                      <div key={tier} className={`font-type text-[10px] ${count ? "text-paper/65" : "text-crimson"}`}>
                        {count ? "✔" : "✖"} {tier}: {count} ending{count === 1 ? "" : "s"}
                        {!count && tier !== "victory-silver" && <span className="ml-1">— players need this outcome</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {tab === "audio" && scene && (
              <div className="space-y-3">
                <HelpNote id="audio-tab" title="Music and sounds">
                  Pick music so the room feels like a movie. You can skip this until the story works. “Continue” keeps
                  the last track, “play a track” starts a new one (and loops it), “no music” stops it. Hand-off 0.0s is
                  a hard cut; 1–2s is a crossfade. If music leaks into a quiet room, set that room to “no music”. A
                  recorded <b>prose narration</b> MP3 replaces the robotic voice for this room's opening words.
                </HelpNote>
                <Field label="Scene music">
                  <select
                    className={inputCls}
                    value={scene.musicMode === "none" ? "none" : scene.musicMode === "track" || scene.musicUrl ? "track" : "inherit"}
                    onChange={(e) => {
                      if (e.target.value === "none") {
                        updateScene(scene.id, { musicMode: "none", musicUrl: undefined, sceneAudioUrl: undefined });
                      } else if (e.target.value === "track") {
                        updateScene(scene.id, { musicMode: "track" });
                      } else {
                        updateScene(scene.id, { musicMode: undefined, musicUrl: undefined, sceneAudioUrl: undefined });
                      }
                    }}
                  >
                    <option value="inherit">🔁 Continue previous music — the track keeps playing across scenes</option>
                    <option value="track">🎵 Play a track — hand off to this file (loops until changed)</option>
                    <option value="none">🔇 No music — hand the track OFF here (stop it at the cut)</option>
                  </select>
                </Field>
                {scene.musicMode && scene.musicMode !== "inherit" && (
                  <Field label={`Music hand-off ${(scene.musicFadeSeconds ?? 1.4).toFixed(1)}s`}>
                    <input
                      type="range"
                      min={0}
                      max={6}
                      step={0.1}
                      className="w-full"
                      value={scene.musicFadeSeconds ?? 1.4}
                      onChange={(e) =>
                        updateScene(scene.id, { musicFadeSeconds: parseFloat(e.target.value) })
                      }
                    />
                    <p className="mt-1 font-type text-[9px] text-paper/40">
                      How this scene hands the soundtrack over: the outgoing track ramps down while a new one ramps
                      up (a crossfade). <b className="text-gold">0.0s = a hard cut</b> — the theme stops dead at the
                      scene boundary, the way a title card kills the music sharp. Use it for shock cuts and title
                      sequences; use 1–2s everywhere else.
                    </p>
                  </Field>
                )}
                {(scene.musicMode === "track" || (!scene.musicMode && (scene.musicUrl || scene.sceneAudioUrl))) && (
                  <Field label="Looping music MP3 URL">
                    <div className="flex gap-1">
                      <input
                        className={inputCls}
                        placeholder="/audio/music.mp3 or https://..."
                        value={mediaField(scene.musicUrl ?? scene.sceneAudioUrl)}
                        onChange={(e) => updateScene(scene.id, { musicMode: "track", musicUrl: e.target.value || undefined, sceneAudioUrl: undefined })}
                      />
                      <MediaUploadButton
                        storyId={story.id}
                        accept="audio/*"
                        label="⇧ Upload"
                        onUploaded={(_url, assetId) => updateScene(scene.id, { musicMode: "track", musicUrl: `asset:${assetId}`, sceneAudioUrl: undefined })}
                      />
                    </div>
                    <div className="mt-1">
                      <AssetDropdown
                        storyId={story.id}
                        assetType="audio"
                        returnReference
                        value={scene.musicUrl ?? scene.sceneAudioUrl}
                        onChange={(url) => updateScene(scene.id, { musicMode: "track", musicUrl: url, sceneAudioUrl: undefined })}
                        placeholder="Or use uploaded audio..."
                      />
                    </div>
                    <p className="mt-1 font-type text-[9px] text-paper/40">
                      This track loops until another scene chooses a different track or a scene with <b className="text-crimson">No music</b> is reached.
                    </p>
                    <Field label={`Music level (${Math.round((scene.musicLevel ?? 1) * 100)}%) — loudness of THIS track`}>
                      <input
                        type="range"
                        min={0.1}
                        max={1.6}
                        step={0.05}
                        className="w-full accent-gold"
                        value={scene.musicLevel ?? 1}
                        onChange={(e) => updateScene(scene.id, { musicLevel: parseFloat(e.target.value) })}
                      />
                      <p className="mt-1 font-type text-[9px] text-paper/40">
                        Default starting volume for this scene's track — e.g. lower it for an ambient bed under dialogue, raise it for a title theme.
                        Stacks with the player's own music volume; 100% is the normal level.
                      </p>
                    </Field>
                  </Field>
                )}
                {scene.musicMode === "none" && (
                  <p className="border border-crimson/30 bg-crimson/5 p-2 font-type text-[9px] text-paper/60">
                    🔇 Music stops when the player reaches this scene and stays silent until a later scene picks a track.
                  </p>
                )}
                <Field label="Recorded prose narration MP3 (one-shot, optional)">
                  <div className="flex gap-1">
                    <input
                      className={inputCls}
                      placeholder="/audio/prose.mp3 — replaces Web Speech for this scene"
                      value={mediaField(scene.narrationAudioUrl)}
                      onChange={(e) => updateScene(scene.id, { narrationAudioUrl: e.target.value || undefined })}
                    />
                    <MediaUploadButton
                      storyId={story.id}
                      accept="audio/*"
                      label="⇧ Upload"
                      onUploaded={(_url, assetId) => updateScene(scene.id, { narrationAudioUrl: `asset:${assetId}` })}
                    />
                  </div>
                  <div className="mt-1">
                    <AssetDropdown
                      storyId={story.id}
                      assetType="audio"
                      returnReference
                      value={scene.narrationAudioUrl}
                      onChange={(url) => updateScene(scene.id, { narrationAudioUrl: url })}
                      placeholder="Or use uploaded audio..."
                    />
                  </div>
                </Field>
                <Field label="Narration">
                  <label className="flex items-center gap-2 text-[10px] text-paper/60">
                    <input
                      type="checkbox"
                      checked={scene.autoNarrate !== false}
                      onChange={(e) => updateScene(scene.id, { autoNarrate: e.target.checked })}
                    />
                    Auto-play prose voice on first scene entry
                  </label>
                </Field>
                <p className="font-type text-[10px] text-paper/40">Music loops until the next scene. Recorded narration plays once. If no narration MP3 is set, the selected Web Speech narrator is used.</p>
              </div>
            )}

            {!scene && !["test", "briefing", "characters", "items", "flags", "acts", "episodes", "dialogueBox", "globalTitle", "media", "ai"].includes(tab) && (
              <p className="font-type text-xs text-paper/50">
                Select a scene node on the canvas — or right-click the canvas to spawn a fresh one. Drag from a choice's pink
                handle straight onto another scene to wire the plot.
              </p>
            )}

            {scene && scene.nodeType === "note" && ["scene", "beats", "hotspots", "choices"].includes(tab) && (
              <div className="space-y-3">
                <div className="border border-gold/40 bg-gold/5 p-3">
                  <h3 className="font-pulp text-xs uppercase tracking-widest text-gold">📝 Note placeholder</h3>
                  <p className="mt-1 font-type text-[10px] leading-snug text-paper/60">
                    A marker for a scene that doesn't exist yet. It wires into the graph on both sides, but the game{" "}
                    <b className="text-gold">bypasses</b> it in play — a player who reaches it passes straight through to
                    the scene its right handle points at. When you've written the real scene, convert this note into a
                    full scene (or delete it and re-wire).
                  </p>
                </div>
                <Field label="What belongs here">
                  <textarea
                    className={`${inputCls} h-24 font-type`}
                    value={scene.title}
                    placeholder="e.g. Missing Scene Here"
                    onChange={(e) => updateScene(scene.id, { title: e.target.value })}
                  />
                </Field>
                {(() => {
                  const es = storyEdges(story);
                  const incoming = es.filter((e) => e.target === scene.id);
                  const outgoing = es.filter((e) => e.source === scene.id);
                  const name = (sid: string) => story.scenes.find((s) => s.id === sid)?.title ?? sid;
                  return (
                    <div className="space-y-1.5 border border-noir-600 bg-noir-900/40 p-2 font-type text-[10px] leading-snug text-paper/60">
                      <div>
                        ⬅ <b className="text-paper/80">In from:</b>{" "}
                        {incoming.length
                          ? incoming.map((e) => `${name(e.source)} (“${e.label}”)`).join(" · ")
                          : <span className="text-paper/35">nothing yet — drag a choice handle from a scene into its left side</span>}
                      </div>
                      <div>
                        ➡ <b className="text-paper/80">Route out (bypass target):</b>{" "}
                        {outgoing.length ? name(outgoing[0].target) : <span className="text-crimson">nowhere — a player reaching this note would be stuck</span>}
                      </div>
                    </div>
                  );
                })()}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      updateScene(scene.id, {
                        nodeType: undefined,
                        background: scene.background.startsWith("gradient:") ? BACKGROUNDS[8] : scene.background,
                        prose: scene.prose || "The scene opens on...",
                      });
                      say("Note converted to a full scene — author it in the Scene tab and give it exits.");
                    }}
                    className="flex-1 border border-cyan-neon/50 py-1.5 font-pulp text-[10px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
                  >
                    🎬 Convert to full scene
                  </button>
                  <button
                    onClick={() => deleteScene(scene.id)}
                    className="flex-1 border border-crimson/50 py-1.5 font-pulp text-[10px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
                  >
                    🗑 Delete note
                  </button>
                </div>
              </div>
            )}

            {scene && scene.nodeType !== "note" && tab === "scene" && (
              <>
                <HelpNote id="scene-tab" title="This room">
                  Pick a picture, then write what the player reads. Tick ★ Start if this is where the game begins. Tick
                  🏁 Ending when the story is over. The background can be an image, a <code>gradient:…</code>, an
                  uploaded asset, or <code>video:…</code>. Camera moves, lights, and letterbox live in the sections
                  below — skip them until the story works. <b>End-of-part route chart</b> plays a flowchart when the
                  player leaves this room (optional).
                </HelpNote>
                <CollapsibleSection id={`scene-${scene.id}-basics`} title="🪪 Scene basics" defaultOpen>
                <Field label="Scene id">
                  <input className={inputCls} value={scene.id} disabled />
                </Field>
                <Field label="Node Layout Type">
                  <select
                    className={inputCls}
                    value={scene.nodeType === "stage" && scene.hideHud ? "stageNoHud" : scene.nodeType ?? "standard"}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "standard") updateScene(scene.id, { nodeType: undefined, hideHud: undefined });
                      else if (v === "stageNoHud")
                        updateScene(scene.id, {
                          nodeType: "stage",
                          hideHud: true,
                          // A no-HUD room must walk from frame one: seed the
                          // stage settings if the scene doesn't have them yet.
                          stage:
                            scene.stage ??
                            ({
                              playerImage: "emoji:🕵️",
                              spawn: { x: 50, y: 86 },
                              speed: 18,
                              reach: 4,
                              keyboard: true,
                              floor: { top: 62, bottom: 94 },
                              depthScale: 0.35,
                              hints: "proximity",
                            } as const),
                        });
                      else if (v === "stage") updateScene(scene.id, { nodeType: "stage", hideHud: undefined });
                      else updateScene(scene.id, { nodeType: v as any, hideHud: undefined });
                    }}
                  >
                    <option value="standard">📁 Standard Game Scene (with HUD)</option>
                    <option value="credits">🎬 Opening Credits (Centered text, NO HUD)</option>
                    <option value="cutscene">🎥 Cinematic Cutscene (Widescreen, NO HUD)</option>
                  </select>
                </Field>
                </CollapsibleSection>
                {(scene.nodeType === "credits" || scene.nodeType === "cutscene") && (
                  <Field label="⏳ Cinematic hold — seconds before choices appear (0 = instant)">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={120}
                        className={inputCls}
                        value={scene.choiceDelaySeconds ?? 0}
                        onChange={(e) =>
                          updateScene(scene.id, {
                            choiceDelaySeconds: Math.max(0, Math.min(120, parseInt(e.target.value, 10) || 0)) || undefined,
                          })
                        }
                      />
                      <span className="shrink-0 font-type text-[9px] text-paper/40">seconds</span>
                    </div>
                      <p className="mt-1 font-type text-[9px] text-paper/40">
                        Holds the scene's continue button and choices for this long so the cinematic can breathe before the player can proceed.
                      </p>
                    </Field>
                )}
                {/* A beat-level auto route already ends this scene: the scene
                    timer is redundant (and could fight it), so hide it and tell
                    the author where to edit instead. */}
                {(scene.dialogueBeats ?? []).some((beat) => beat.afterBeatTargetSceneId && (beat.afterBeatMode ?? "auto") === "auto") ? (
                  <div className="space-y-1 border border-cyan-neon/20 bg-cyan-neon/5 p-2">
                    <div className="font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">⏱ Auto-advance</div>
                    <p className="font-type text-[9px] leading-snug text-paper/50">
                      A final beat on this scene is set to <b>auto-continue to another scene</b>, so the scene-level
                      auto-advance timer is hidden (the beat cut is the timer). Edit it on that beat in the Beats tab.
                    </p>
                  </div>
                ) : (
                <div className="space-y-2 border border-cyan-neon/30 bg-cyan-neon/5 p-2">
                  <div className="font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">⏱ Auto-advance when no choices are available</div>
                  <Field label="Target scene">
                    <select
                      className={inputCls}
                      value={scene.autoAdvanceTargetSceneId ?? ""}
                      onChange={(e) =>
                        updateScene(scene.id, {
                          autoAdvanceTargetSceneId: e.target.value || undefined,
                          autoAdvanceDelaySeconds: e.target.value ? scene.autoAdvanceDelaySeconds ?? 3 : undefined,
                          autoAdvanceHideTimer: e.target.value ? scene.autoAdvanceHideTimer : undefined,
                        })
                      }
                    >
                      <option value="">Off — wait for choices / player input</option>
                      {story.scenes
                        .filter((candidate) => candidate.id !== scene.id)
                        .map((candidate) => (
                          <option key={candidate.id} value={candidate.id}>
                            {candidate.title}
                          </option>
                        ))}
                    </select>
                  </Field>
                  <Field label="Timer before transition">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={600}
                        className={inputCls}
                        value={scene.autoAdvanceDelaySeconds ?? 3}
                        disabled={!scene.autoAdvanceTargetSceneId}
                        onChange={(e) =>
                          updateScene(scene.id, {
                            autoAdvanceDelaySeconds: Math.max(0, Math.min(600, parseInt(e.target.value, 10) || 0)),
                          })
                        }
                      />
                      <span className="shrink-0 font-type text-[9px] text-paper/40">seconds</span>
                    </div>
                    <label className="mt-2 flex items-center gap-2 font-type text-[10px] text-paper/65">
                      <input
                        type="checkbox"
                        disabled={!scene.autoAdvanceTargetSceneId}
                        checked={!!scene.autoAdvanceHideTimer}
                        onChange={(e) => updateScene(scene.id, { autoAdvanceHideTimer: e.target.checked || undefined })}
                      />
                      Hide countdown timer in player
                    </label>
                    <p className="mt-1 font-type text-[9px] text-paper/40">
                      Runs after prose, dialogue and the cinematic hold finish, but only if the scene currently has no selectable choices to show.
                    </p>
                  </Field>
                </div>
                )}
                {scene.nodeType === "credits" && (
                  <div className="space-y-2 border border-gold/40 bg-gold/5 p-2">
                    <div className="font-pulp text-[9px] uppercase tracking-widest text-gold">🎬 Credits intro</div>

                    {/* Look presets — one click sets the whole style bundle.
                        Authored text and montage stills are never touched.
                        Grouped into sections, and every card previews itself:
                        the preset's own typeface, title colour and a one-line
                        knob read-out. */}
                    {(() => {
                      const matchedPreset = matchCreditsPreset(scene.credits);
                      return (
                        <div className="space-y-1.5 border border-gold/25 bg-noir-950/40 p-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-pulp text-[9px] uppercase tracking-widest text-gold">Look presets</span>
                            <span className="font-type text-[8px] text-paper/40">
                              {matchedPreset ? (
                                <>
                                  matches: <b className="text-gold/90">{CREDITS_PRESETS[matchedPreset].name}</b>
                                </>
                              ) : (
                                "custom look"
                              )}
                            </span>
                          </div>
                          {CREDITS_PRESET_GROUPS.map((g) => {
                            const presets = CREDITS_PRESET_LIST.filter((p) => p.group === g.id);
                            if (!presets.length) return null;
                            return (
                              <div key={g.id}>
                                <div className="mb-1 flex items-baseline justify-between gap-2">
                                  <span className="font-pulp text-[8px] uppercase tracking-widest text-paper/45">{g.label}</span>
                                  <span className="truncate font-type text-[7.5px] italic text-paper/30">{g.blurb}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                                  {presets.map((p) => {
                                    const isSel = matchedPreset === p.id;
                                    const sampleColor = p.look.titleColor ?? p.swatch;
                                    return (
                                      <button
                                        key={p.id}
                                        type="button"
                                        title={p.tagline}
                                        onClick={() => updateScene(scene.id, { credits: applyCreditsPreset(p.id, scene.credits) })}
                                        className={`relative flex flex-col items-start rounded border p-1.5 text-left transition-all ${
                                          isSel
                                            ? "border-gold bg-gold/15 shadow-[0_0_8px_rgba(232,178,60,0.3)]"
                                            : "border-noir-700 bg-noir-950/70 hover:border-paper/40 hover:bg-noir-800"
                                        }`}
                                      >
                                        {isSel && <span className="absolute right-1 top-1 text-[8px] text-gold">✓</span>}
                                        {/* The look's own typeface + title colour —
                                            the card is its own preview. */}
                                        <span
                                          className="block w-full truncate text-[13px] leading-tight uppercase"
                                          style={{
                                            fontFamily: CREDITS_FONT_VAR[p.look.font ?? "pulp"] ?? CREDITS_FONT_VAR.pulp,
                                            color: sampleColor,
                                            textShadow: `0 0 7px ${sampleColor}55`,
                                          }}
                                        >
                                          {p.name}
                                        </span>
                                        <span className="mt-0.5 w-full truncate font-type text-[7.5px] text-paper/50">{p.badge}</span>
                                        <span className="mt-0.5 block w-full truncate font-type text-[7px] text-paper/35" title={creditsLookSummary(p.look)}>
                                          {creditsLookSummary(p.look)}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                          <p className="pt-0.5 font-type text-[8.5px] italic leading-snug text-paper/50">
                            {matchedPreset
                              ? CREDITS_PRESETS[matchedPreset].tagline
                              : "One click sets the typeface, motion, colours, gate weave and pacing — your title, credit lines and montage stills are kept. Every knob below stays editable."}
                          </p>
                        </div>
                      );
                    })()}

                    <Field label="Title">
                      <input
                        className={inputCls}
                        placeholder="Defaults to prose line 1"
                        value={scene.credits?.title ?? ""}
                        onChange={(e) => updateScene(scene.id, { credits: { ...(scene.credits ?? {}), title: e.target.value || undefined } })}
                      />
                    </Field>
                    <Field label="Subheading">
                      <input
                        className={inputCls}
                        placeholder="Defaults to prose line 2"
                        value={scene.credits?.subtitle ?? ""}
                        onChange={(e) => updateScene(scene.id, { credits: { ...(scene.credits ?? {}), subtitle: e.target.value || undefined } })}
                      />
                    </Field>

                    <Field label="Credits lines (role → name)">
                      <div className="space-y-1">
                        {(scene.credits?.lines ?? []).map((line, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <input
                              className={inputCls}
                              placeholder="Role"
                              value={line.role}
                              onChange={(e) =>
                                mutate((d) => {
                                  const sc = d.scenes.find((x) => x.id === scene.id)!;
                                  const lines = [...(sc.credits?.lines ?? [])];
                                  lines[i] = { ...lines[i], role: e.target.value };
                                  sc.credits = { ...(sc.credits ?? {}), lines };
                                })
                              }
                            />
                            <input
                              className={inputCls}
                              placeholder="Name"
                              value={line.name}
                              onChange={(e) =>
                                mutate((d) => {
                                  const sc = d.scenes.find((x) => x.id === scene.id)!;
                                  const lines = [...(sc.credits?.lines ?? [])];
                                  lines[i] = { ...lines[i], name: e.target.value };
                                  sc.credits = { ...(sc.credits ?? {}), lines };
                                })
                              }
                            />
                            <button
                              className="shrink-0 text-crimson hover:underline"
                              title="Remove line"
                              onClick={() =>
                                mutate((d) => {
                                  const sc = d.scenes.find((x) => x.id === scene.id)!;
                                  sc.credits = { ...(sc.credits ?? {}), lines: (sc.credits?.lines ?? []).filter((_, idx) => idx !== i) };
                                })
                              }
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          className="w-full border border-cyan-neon/40 py-1 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
                          onClick={() =>
                            mutate((d) => {
                              const sc = d.scenes.find((x) => x.id === scene.id)!;
                              sc.credits = { ...(sc.credits ?? {}), lines: [...(sc.credits?.lines ?? []), { role: "", name: "Name" }] };
                            })
                          }
                        >
                          ＋ Add credits line
                        </button>
                      </div>
                    </Field>

                    <Field label="Title typeface">
                      <select
                        className={inputCls}
                        value={scene.credits?.font ?? "pulp"}
                        onChange={(e) =>
                          updateScene(scene.id, {
                            credits: { ...(scene.credits ?? {}), font: e.target.value as CreditsSettings["font"] },
                          })
                        }
                      >
                        <option value="pulp">Alfa Slab One — heavy pulp slab</option>
                        <option value="poster">Bebas Neue — condensed film poster</option>
                        <option value="elegant">Playfair Display — prestige serif</option>
                        <option value="epic">Cinzel — chiselled Roman caps</option>
                        <option value="modern">Josefin Sans — light geometric</option>
                        <option value="type">Newsreader — clean literary serif</option>
                      </select>
                      <p className="mt-1 font-type text-[9px] text-paper/40">
                        Tracking is tuned per face. Long titles step down a size automatically.
                      </p>
                    </Field>
                    {scene.credits?.style === "cards" && (
                      <Field label="Card motion">
                        <select
                          className={inputCls}
                          value={scene.credits?.cardMotion ?? "blur-rise"}
                          onChange={(e) =>
                            updateScene(scene.id, {
                              credits: {
                                ...(scene.credits ?? {}),
                                cardMotion: e.target.value as CreditsSettings["cardMotion"],
                              },
                            })
                          }
                        >
                          <option value="blur-rise">Blur rise — lifts out of soft focus</option>
                          <option value="letterspace">Letterspace — tracking pulls in, releases</option>
                          <option value="scale-down">Scale down — settles from oversize</option>
                          <option value="slide">Slide — drifts across frame</option>
                          <option value="flicker">Flicker — failing neon</option>
                          <option value="fade">Fade — plain dissolve</option>
                          <option value="slam">Slam — lands oversized, snaps to size (Tarantino chapter card)</option>
                          <option value="iris">Iris — circular optical-matte wipe open and shut (1940s studio era)</option>
                        </select>
                        <p className="mt-1 font-type text-[9px] text-paper/40">
                          Every motion keyframes to the same in/hold/out schedule, so changing it
                          never changes the sequence length.
                        </p>
                      </Field>
                    )}

                    <Field label="Gate weave (35mm)">
                      <select
                        className={inputCls}
                        value={scene.credits?.gateWeave ?? "off"}
                        onChange={(e) =>
                          updateScene(scene.id, {
                            credits: {
                              ...(scene.credits ?? {}),
                              gateWeave: e.target.value as CreditsSettings["gateWeave"],
                            },
                          })
                        }
                      >
                        <option value="off">Off — locked off, digital</option>
                        <option value="subtle">Subtle — well-kept projector</option>
                        <option value="worn">Worn — print that has done the rounds</option>
                        <option value="projector">Projector — tired machine, splice bumps</option>
                      </select>
                      <p className="mt-1 font-type text-[9px] text-paper/40">
                        Optical titles were married to the picture on a second pass, so the type
                        drifted: a slow sideways sway from slop in the perforations, plus a
                        one-frame registration error from the pulldown claw. Suppressed under
                        reduced-motion.
                      </p>
                    </Field>

                    <Field label="Title entrance">
                      <select
                        className={inputCls}
                        value={scene.credits?.titleEntrance ?? "fade-up"}
                        onChange={(e) =>
                          updateScene(scene.id, { credits: { ...(scene.credits ?? {}), titleEntrance: e.target.value as CreditsSettings["titleEntrance"] } })
                        }
                      >
                        <option value="fade-up">⤴ Fade &amp; rise</option>
                        <option value="typewriter">⌨ Typewriter</option>
                        <option value="slam">💥 Slam — punches in oversized</option>
                      </select>
                    </Field>
                    <Field label="Title colour (leave blank for neon gold)">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          className="h-7 w-10 cursor-pointer border border-noir-600 bg-noir-950"
                          value={scene.credits?.titleColor ?? "#e8b23c"}
                          onChange={(e) =>
                            updateScene(scene.id, { credits: { ...(scene.credits ?? {}), titleColor: e.target.value } })
                          }
                          title="The big title's own colour — the glow re-tints to match"
                        />
                        <input
                          className={inputCls}
                          placeholder="#f5c518 (e.g. Tarantino yellow) — blank = default gold"
                          value={scene.credits?.titleColor ?? ""}
                          onChange={(e) =>
                            updateScene(scene.id, { credits: { ...(scene.credits ?? {}), titleColor: e.target.value.trim() || undefined } })
                          }
                        />
                      </div>
                    </Field>
                    <Field label="Credits style">
                      <select
                        className={inputCls}
                        value={scene.credits?.style ?? "fade-up"}
                        onChange={(e) => updateScene(scene.id, { credits: { ...(scene.credits ?? {}), style: e.target.value as CreditsSettings["style"] } })}
                      >
                        <option value="fade-up">⤴ Staggered fade-up</option>
                        <option value="scroll">📜 Rolling scroll</option>
                        <option value="cards">🎬 Title cards (one at a time)</option>
                      </select>
                    </Field>
                    {scene.credits?.style === "cards" && (
                      <Field label={`Seconds per card ${(scene.credits?.cardSeconds ?? 3.4).toFixed(1)}s`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={1.2}
                            max={8}
                            step={0.2}
                            value={scene.credits?.cardSeconds ?? 3.4}
                            onChange={(e) =>
                              updateScene(scene.id, {
                                credits: { ...(scene.credits ?? {}), cardSeconds: parseFloat(e.target.value) },
                              })
                            }
                            className="w-full"
                          />
                        </div>
                        <p className="mt-1 font-type text-[9px] text-paper/40">
                          Each credit fades in, holds, then fades out before the next.
                          Sequence runs {(((scene.credits?.lines?.length ?? 0) + 2) * (scene.credits?.cardSeconds ?? 3.4)).toFixed(0)}s.
                        </p>
                      </Field>
                    )}

                    {/* Montage — cross-dissolving stills behind the titles */}
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-pulp text-[9px] uppercase tracking-widest text-gold/80">Title montage stills</span>
                        <span className="font-type text-[8px] text-paper/40">{scene.credits?.montage?.length ?? 0} stills</span>
                      </div>
                      <p className="mb-1 font-type text-[9px] text-paper/40">
                        Stills cross-dissolve full-bleed behind the credits, replacing the scene background. Leave empty for a single static plate.
                      </p>
                      <div className="space-y-1">
                        {(scene.credits?.montage ?? []).map((m, i) => {
                          const arr = scene.credits?.montage ?? [];
                          const setMontage = (next: string[] | undefined) => updateScene(scene.id, { credits: { ...(scene.credits ?? {}), montage: next } });
                          return (
                            <div key={i} className="flex items-center gap-1 border border-noir-700/60 p-1">
                              <span className="w-4 shrink-0 text-center font-pulp text-[10px] text-paper/50">{i + 1}</span>
                              <img src={assetUrl(media(m) ?? m)} alt="" className="h-8 w-12 shrink-0 object-cover border border-noir-600 bg-noir-950" />
                              <span className="min-w-0 flex-1 truncate font-type text-[9px] text-paper/45" title={m}>
                                {m.startsWith("asset:") ? "uploaded" : m.startsWith("data:") ? "(embedded)" : (m.split("/").pop() ?? m)}
                              </span>
                              <button className="px-1 text-[10px] text-paper/50 hover:text-gold disabled:opacity-25" disabled={i === 0} title="Move earlier"
                                onClick={() => { const a = [...arr]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; setMontage(a); }}>▲</button>
                              <button className="px-1 text-[10px] text-paper/50 hover:text-gold disabled:opacity-25" disabled={i === arr.length - 1} title="Move later"
                                onClick={() => { const a = [...arr]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; setMontage(a); }}>▼</button>
                              <button className="px-1 text-[10px] text-crimson hover:underline" title="Remove this still"
                                onClick={() => setMontage(arr.filter((_, idx) => idx !== i).length ? arr.filter((_, idx) => idx !== i) : undefined)}>✕</button>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-1 flex gap-1">
                        <ImagePicker
                          storyId={story.id}
                          includeBuiltins
                          includeGradients={false}
                          allowClear={false}
                          onChange={(url) => { if (!url) return; updateScene(scene.id, { credits: { ...(scene.credits ?? {}), montage: [...(scene.credits?.montage ?? []), url] } }); }}
                          placeholder="＋ Add a still…"
                        />
                        <MediaUploadButton
                          storyId={story.id}
                          accept="image/*"
                          label="⇧ Upload"
                          onUploaded={(_u, assetId) => { updateScene(scene.id, { credits: { ...(scene.credits ?? {}), montage: [...(scene.credits?.montage ?? []), `asset:${assetId}`] } }); }}
                        />
                      </div>
                    </div>
                    {(scene.credits?.montage?.length ?? 0) > 0 && (
                      <>
                        <Field label={`Seconds per still ${(scene.credits?.montageSeconds ?? 5).toFixed(1)}s`}>
                          <input
                            type="range"
                            min={2}
                            max={12}
                            step={0.5}
                            value={scene.credits?.montageSeconds ?? 5}
                            onChange={(e) =>
                              updateScene(scene.id, {
                                credits: { ...(scene.credits ?? {}), montageSeconds: parseFloat(e.target.value) },
                              })
                            }
                            className="w-full"
                          />
                          <p className="mt-1 font-type text-[9px] text-paper/40">
                            {(scene.credits?.montage?.length ?? 0)} stills ·{" "}
                            {((scene.credits?.montage?.length ?? 0) * (scene.credits?.montageSeconds ?? 5)).toFixed(0)}s
                            per pass
                          </p>
                        </Field>
                        <Field label="Still transition">
                          <select
                            className={inputCls}
                            value={scene.credits?.montageTransition ?? "dissolve"}
                            onChange={(e) =>
                              updateScene(scene.id, {
                                credits: { ...(scene.credits ?? {}), montageTransition: e.target.value as CreditsSettings["montageTransition"] },
                              })
                            }
                          >
                            <option value="dissolve">Dissolve — long cross-fade</option>
                            <option value="cut">Cut — hard cut, still to still (Tarantino title sequence)</option>
                          </select>
                        </Field>
                        <label className="flex items-center gap-2 py-1 font-type text-[10px] text-paper/70">
                          <input
                            type="checkbox"
                            checked={scene.credits?.montageLoop ?? true}
                            onChange={(e) =>
                              updateScene(scene.id, {
                                credits: { ...(scene.credits ?? {}), montageLoop: e.target.checked },
                              })
                            }
                          />
                          Loop montage (off = hold on the last still)
                        </label>
                      </>
                    )}
                    <Field label={`Line stagger ${(scene.credits?.stagger ?? 0.4).toFixed(2)}s`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={2}
                          step={0.05}
                          value={scene.credits?.stagger ?? 0.4}
                          className="flex-1 accent-pink-500"
                          onChange={(e) => updateScene(scene.id, { credits: { ...(scene.credits ?? {}), stagger: Number(e.target.value) } })}
                        />
                        <span className="w-9 text-right font-type text-[10px] text-paper/70">{(scene.credits?.stagger ?? 0.4).toFixed(2)}s</span>
                      </div>
                    </Field>
                    <Field label={`Line duration ${(scene.credits?.duration ?? 0.85).toFixed(2)}s`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0.2}
                          max={2}
                          step={0.05}
                          value={scene.credits?.duration ?? 0.85}
                          className="flex-1 accent-pink-500"
                          onChange={(e) => updateScene(scene.id, { credits: { ...(scene.credits ?? {}), duration: Number(e.target.value) } })}
                        />
                        <span className="w-9 text-right font-type text-[10px] text-paper/70">{(scene.credits?.duration ?? 0.85).toFixed(2)}s</span>
                      </div>
                    </Field>
                    {(scene.credits?.style ?? "fade-up") === "scroll" && (
                      <Field label={`Scroll loop ${scene.credits?.scrollDuration ?? 24}s`}>
                        <input
                          type="number"
                          min={6}
                          max={120}
                          step={1}
                          className={inputCls}
                          value={scene.credits?.scrollDuration ?? 24}
                          onChange={(e) => updateScene(scene.id, { credits: { ...(scene.credits ?? {}), scrollDuration: Number(e.target.value) || 24 } })}
                        />
                      </Field>
                    )}
                    <Field label="Accent colour">
                      <input
                        type="color"
                        className="h-8 w-full cursor-pointer border border-noir-600 bg-noir-950"
                        value={scene.credits?.accentColor ?? "#2ad9d9"}
                        onChange={(e) => updateScene(scene.id, { credits: { ...(scene.credits ?? {}), accentColor: e.target.value } })}
                      />
                    </Field>
                    <p className="font-type text-[9px] text-paper/45">
                      Title, subheading and credits lines are optional — leave them blank to fall back to the scene's prose (line 1 =
                      title, line 2 = subheading, the rest = name-only lines).
                    </p>
                  </div>
                )}
                <CollapsibleSection id={`scene-${scene.id}-title`} title="🏷 Title & notes" defaultOpen>
                <Field label="Title" tip="The name of this room. Players may see it as a title card when they arrive.">
                  <input className={inputCls} value={scene.title} onChange={(e) => updateScene(scene.id, { title: e.target.value })} />
                </Field>
                <label className="flex items-center gap-2 border border-cyan-neon/20 bg-cyan-neon/5 px-2 py-1 text-[10px] uppercase tracking-wider text-paper/60">
                  <input
                    type="checkbox"
                    checked={!!scene.hideSceneTitle}
                    onChange={(e) => updateScene(scene.id, { hideSceneTitle: e.target.checked || undefined })}
                  />
                  🚫 Hide this title in-game (no title card on scene start)
                </label>

                <Field label="Note (shows on the canvas card)" tip="A sticky note only you see on the map. Players never read this.">
                  <textarea
                    className={`${inputCls} h-14 resize-y leading-snug`}
                    placeholder="Author's sticky for this node — what it's for, what not to touch, where it sits in the story…"
                    value={scene.note ?? ""}
                    onChange={(e) => updateScene(scene.id, { note: e.target.value || undefined })}
                  />
                </Field>

                </CollapsibleSection>
                <CollapsibleSection id={`scene-${scene.id}-look`} title="🖼 Look, atmosphere & camera">
                <Field label="Background image / gradient" tip="The picture for this room. Upload one, pick from the library, or use a gradient.">
                  {scene.background.startsWith("video:") ? (
                    <p className="border border-gold/30 bg-gold/5 px-2 py-1 font-type text-[10px] text-gold">
                      🎥 Video cutscene active — remove it below to pick an image.
                    </p>
                  ) : (
                    <ImagePicker
                      value={scene.background}
                      onChange={(v) => updateScene(scene.id, { background: v ?? BACKGROUNDS[0] })}
                      storyId={story.id}
                      includeBuiltins
                      includeGradients
                      allowClear={false}
                      placeholder="Browse all images…"
                    />
                  )}
                  <div className="mt-1 flex gap-1">
                    <MediaUploadButton
                      storyId={story.id}
                      accept="image/*"
                      label="⇧ Upload image"
                      onUploaded={(_url, assetId) => updateScene(scene.id, { background: `asset:${assetId}` })}
                    />
                    {(scene.background.startsWith("data:") || scene.background.startsWith("asset:")) && (
                      <button
                        onClick={() => updateScene(scene.id, { background: BACKGROUNDS[0] })}
                        className="border border-crimson/40 px-2 py-1 font-pulp text-[10px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
                      >
                        ✕ Remove uploaded image
                      </button>
                    )}
                  </div>
                  <p className="mt-1 font-type text-[9px] text-paper/40">
                    Browse every built-in scene plus your {uploadedImages.length} uploaded image{uploadedImages.length === 1 ? "" : "s"} — hover any name to preview it.
                    {storageAvailable === false && (
                      <span className="text-crimson"> ⚠ This browser can't store files — uploads won't survive a reload.</span>
                    )}
                  </p>
                </Field>
                <Field label="🎥 Video cutscene (overrides the background image above)">
                  <div className="flex gap-1">
                    <MediaUploadButton
                      storyId={story.id}
                      accept="video/*"
                      label="⇧ Upload video"
                      onUploaded={(_url, assetId) => updateScene(scene.id, { background: `video:asset:${assetId}` })}
                    />
                    {scene.background.startsWith("video:") && (
                      <button
                        onClick={() => updateScene(scene.id, { background: BACKGROUNDS[0] })}
                        className="border border-crimson/40 px-2 py-1 font-pulp text-[10px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
                      >
                        ✕ Remove video, use image instead
                      </button>
                    )}
                  </div>
                  <div className="mt-1">
                    <AssetDropdown
                      storyId={story.id}
                      assetType="video"
                      returnReference
                      value={scene.background.startsWith("video:") ? scene.background.slice(6) : undefined}
                      onChange={(url) => updateScene(scene.id, { background: url ? `video:${url}` : BACKGROUNDS[0] })}
                      placeholder="Or pick a previously uploaded video..."
                    />
                  </div>
                </Field>
                <div className="border border-noir-600 p-1">
                  <div className="mb-1 font-pulp text-[9px] uppercase tracking-widest text-paper/40">Live preview</div>
                  {scene.background.startsWith("video:") ? (
                    <video src={assetBackground(media(scene.background) ?? scene.background).slice(6)} className="h-24 w-full object-cover" muted loop autoPlay />
                  ) : (
                    <div className="h-20 w-full" style={bgStyle(media(scene.background) ?? scene.background)} />
                  )}
                </div>
                <Field label="Ambient loop (synth)">
                  <select
                    className={inputCls}
                    value={scene.ambientAudio ?? "none"}
                    onChange={(e) => updateScene(scene.id, { ambientAudio: e.target.value })}
                  >
                    {AMBIENTS.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Particle Effects (Weather/Atmosphere) — smart, light-reactive">
                  <select
                    className={inputCls}
                    value={scene.particles ?? ""}
                    onChange={(e) => updateScene(scene.id, { particles: e.target.value ? (e.target.value as any) : undefined })}
                  >
                    <option value="">Auto (based on audio loop)</option>
                    <option value="none">🚫 None (Off) — still shows subtle dust if lights/dim</option>
                    <option value="rain">🌧️ Rain — canvas, wind gusts, depth</option>
                    <option value="drizzle">🌦️ Drizzle — light rain, slower</option>
                    <option value="snow">❄️ Snow — swirl + 6-point flakes + wind</option>
                    <option value="smoke">💨 Smoke — soft plumes + tint</option>
                    <option value="storm">⛈️ Storm — rain + randomized lightning &amp; thunder</option>
                    <option value="dust">✨ Dust — light-reactive motes, parallax, twinkle</option>
                    <option value="motes">🌟 Motes — sparse dust (subtle)</option>
                    <option value="fog">🌫️ Fog — volumetric banks + light shafts</option>
                    <option value="ember">🔥 Ember — rising glowing sparks, flicker</option>
                    <option value="ash">🪶 Ash — gray drifting fall</option>
                    <option value="fireflies">🪰 Fireflies — warm pulsing glow</option>
                  </select>
                  {scene.particles && scene.particles !== "none" && (
                    <p className="mt-1 font-type text-[9px] leading-snug text-paper/40">
                      {scene.particles === "dust" || scene.particles === "motes"
                        ? "Dust reacts to cinematic lights (glow + attraction), parallax, twinkle. Add lights in Cinematic tab for beams."
                        : scene.particles === "fog"
                          ? "Fog banks drift with depth, opacity tied to dimAmount, plus volumetric shafts through lights."
                          : scene.particles === "ember"
                            ? "Embers rise with lift + flicker, glow orange. Use with dim + warm light."
                            : scene.particles === "snow"
                              ? "Snow swirls with wind gusts that change every 3s, depth + wobble."
                              : scene.particles === "fireflies"
                                ? "Fireflies pulse sharp on/off, warm glow, drift lazy."
                                : "Canvas-based, respects reduced-motion (static fallback)."}
                    </p>
                  )}
                </Field>

                {/* The 🚶 walkable-stage editor now lives on its own 🚶 Stage tab. */}
                {/* ---- Letterbox & entry transition (cinematic polish) ---- */}
                <div className="border border-gold/40 bg-gold/5 p-2 space-y-2">
                  <div className="font-pulp text-[10px] uppercase tracking-widest text-gold">🎞 Letterbox &amp; transition</div>
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60">
                    <input
                      type="checkbox"
                      checked={!!scene.letterbox}
                      onChange={(e) => updateScene(scene.id, { letterbox: e.target.checked || undefined })}
                    />
                    🎬 Letterbox bars (top &amp; bottom black bands)
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    <Field label="Entry transition — dramatic">
                      <select
                        className={inputCls}
                        value={scene.transition ?? "fade"}
                        onChange={(e) => updateScene(scene.id, { transition: e.target.value as SceneNode["transition"] })}
                      >
                        <option value="fade">⬛ Fade (dissolve)</option>
                        <option value="fade-black">🌑 Fade to black then back</option>
                        <option value="cut">⚡ Cut (instant)</option>
                        <option value="iris">⭕ Iris — circle wipe from center</option>
                        <option value="iris-in">🔵 Iris-in — classic film iris</option>
                        <option value="wipe-left">➡️ Wipe Left — reveals from left</option>
                        <option value="wipe-right">⬅️ Wipe Right — reveals from right</option>
                        <option value="wipe-up">⬆️ Wipe Up — reveals from bottom</option>
                        <option value="wipe-down">⬇️ Wipe Down — reveals from top</option>
                        <option value="slide-left">◀️ Slide Left — punch + fade</option>
                        <option value="slide-right">▶️ Slide Right — punch + fade</option>
                        <option value="zoom">🔍 Zoom — scale punch 1→1.28</option>
                        <option value="glitch">📺 Glitch — chromatic slices + skew</option>
                        <option value="burn">🔥 Burn — film burn flash</option>
                      </select>
                    </Field>
                    <Field label={`Transition speed ${(scene.transitionSpeed ?? 0.5).toFixed(2)}s`}>
                      <input
                        type="range"
                        min={0.1}
                        max={3}
                        step={0.05}
                        value={scene.transitionSpeed ?? 0.5}
                        className="w-full accent-pink-500"
                        onChange={(e) => updateScene(scene.id, { transitionSpeed: Number(e.target.value) })}
                      />
                    </Field>
                    <Field label="Transition sound (synthesized — zero asset budget)">
                      <select
                        className={inputCls}
                        value={scene.transitionSound ?? "auto"}
                        onChange={(e) => updateScene(scene.id, { transitionSound: e.target.value === "auto" ? undefined : (e.target.value as SceneNode["transitionSound"]) })}
                      >
                        <option value="auto">🎚 Auto — pick from the move (slides whoosh, wipes swish, zooms punch…)</option>
                        <option value="whoosh">🌬️ Whoosh — wide air + cushioned land (the slide)</option>
                        <option value="swish">💨 Swish — tight card pass + edge tick (the wipe/iris)</option>
                        <option value="riser">📈 Riser + sub-hit — pressure builds, the frame punches (the zoom)</option>
                        <option value="thump">🥁 Thump — low impact only, no air (fade-to-black landings)</option>
                        <option value="sizzle">🔥 Sizzle — crackle over a warm swell (the burn)</option>
                        <option value="zap">⚡ Zap — stuttered digital crack (the glitch)</option>
                        <option value="swell">🫧 Swell — barely-there air, no impact (a polite fade)</option>
                        <option value="none">🔇 None — silent move</option>
                      </select>
                      <p className="mt-0.5 font-type text-[9px] text-paper/45">
                        All synthesized through the WebAudio sfx bus — the sound swells across the cover and lands on the
                        swap. Respects the player&apos;s sound toggle; reduced motion and &ldquo;cut&rdquo; stay mute.
                      </p>
                    </Field>
                  </div>
                </div>

                {/* ---- Cinematic Image Controls ---- */}
                <div className="border border-gold/40 bg-gold/5 p-3 space-y-3">
                  <div className="font-pulp text-[11px] uppercase tracking-widest text-gold">🎬 Cinematic Image Controls</div>
                  <p className="font-type text-[9px] text-paper/50">
                    Pick which image to grade, then set its camera motion and lighting. Each dialogue beat with a replacement background image gets its own settings.
                  </p>
                  <Field label="Apply cinematic to">
                    <select
                      className={inputCls}
                      value={cinematicTarget}
                      onChange={(e) => setCinematicTarget(e.target.value)}
                    >
                      <option value="__scene__">🖼 Scene background</option>
                      {(scene.dialogueBeats ?? []).filter((b) => b.background).map((b, i) => (
                        <option key={b.id} value={b.id}>💬 Beat {i + 1} — {b.text.slice(0, 32)}</option>
                      ))}
                    </select>
                  </Field>
                  {!(scene.dialogueBeats ?? []).some((b) => b.background) && (
                    <p className="border border-cyan-neon/20 bg-cyan-neon/5 p-2 font-type text-[9px] text-paper/55">
                      Add a <b className="text-cyan-neon">replacement background image</b> to a beat in the Beats tab to give it its own cinematic settings here.
                    </p>
                  )}
                  <CinematicControls
                    cinematic={cinematicTarget === "__scene__" ? scene.cinematic : scene.dialogueBeats?.find((b) => b.id === cinematicTarget)?.cinematic}
                    previewUrl={media(cinematicTarget === "__scene__" ? scene.background : (scene.dialogueBeats?.find((b) => b.id === cinematicTarget)?.background ?? scene.background)) ?? (cinematicTarget === "__scene__" ? scene.background : (scene.dialogueBeats?.find((b) => b.id === cinematicTarget)?.background ?? scene.background))}
                    storyId={story.id}
                    media={media}
                    particles={scene.particles}
                    ambientAudio={scene.ambientAudio}
                    onChange={(next) => {
                      if (cinematicTarget === "__scene__") {
                        updateScene(scene.id, { cinematic: next });
                      } else {
                        mutate((d) => {
                          const s = d.scenes.find((x) => x.id === scene.id)!;
                          s.dialogueBeats!.find((x) => x.id === cinematicTarget)!.cinematic = next;
                        });
                      }
                    }}
                  />
                </div>
                <p className="border border-cyan-neon/20 bg-cyan-neon/5 p-2 font-type text-[10px] text-paper/55">
                  Need real music or recorded narration? Use the <b className="text-cyan-neon">Audio</b> tab — music and voice are separate there.
                </p>
                </CollapsibleSection>
                <CollapsibleSection id={`scene-${scene.id}-prose`} title="📜 Prose, pacing & structure">
                {scene.nodeType === "stage" && (
                  <p className="mb-2 border border-gold/30 bg-gold/5 p-2 font-type text-[10px] leading-snug text-paper/60">
                    🚶 <b>Stage nodes never show prose.</b> Anything typed here stays author-only — put the scene's
                    opening line in <b>🚶 Walkable Stage → "Caption on scene entry"</b>, and its narration into 💬
                    show-text markers.
                  </p>
                )}
                <Field label="Prose (narrator)" tip="What the player reads when they arrive. One or two sentences is enough to start.">
                  <textarea
                    className={`${inputCls} h-28 font-type`}
                    value={scene.prose}
                    onChange={(e) => updateScene(scene.id, { prose: e.target.value })}
                  />
                </Field>
                <label className="flex items-center gap-2 border border-cyan-neon/20 bg-cyan-neon/5 px-2 py-1 text-[10px] uppercase tracking-wider text-paper/60">
                  <input
                    type="checkbox"
                    checked={!!scene.noTypewriter}
                    onChange={(e) => updateScene(scene.id, { noTypewriter: e.target.checked || undefined })}
                  />
                  ⚡ Instant text — disable typewriter (use when MP3 voice is main narration)
                </label>
                <label
                  className="flex items-center gap-2 border border-cyan-neon/20 bg-cyan-neon/5 px-2 py-1 text-[10px] uppercase tracking-wider text-paper/60"
                  title="The replies appear over the LAST line of the conversation instead of after it, so the player can cut the speaker off and a choice timer is already running while they're still talking. Suppressed when that final line routes to another scene — the cut owns the exit."
                >
                  <input
                    type="checkbox"
                    checked={!!scene.interruptibleDialogue}
                    onChange={(e) => updateScene(scene.id, { interruptibleDialogue: e.target.checked || undefined })}
                  />
                  💬 Interruptible dialogue — the player can answer over the last line (Wolf Among Us style)
                </label>
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60">
                  <input
                    type="checkbox"
                    checked={story.startSceneId === scene.id}
                    onChange={() => commit({ ...story, startSceneId: scene.id })}
                  />
                  ★ start scene
                </label>
                <Field label="End-of-part route chart (shown when leaving this scene)">
                  <input
                    className={inputCls}
                    placeholder='e.g. "Part Two — The Long Drop" — leave empty for none'
                    value={scene.partBreak ?? ""}
                    onChange={(e) => updateScene(scene.id, { partBreak: e.target.value.trim() || undefined })}
                  />
                  <p className="mt-1 font-type text-[9px] leading-snug text-paper/40">
                    When the player leaves this scene, the flowchart of the stretch just played is shown — and if
                    the exit crosses an act boundary, the act's route map follows. Point it at a <b>choke point</b>
                    the player must pass through: a hub you backtrack through will re-chart on every exit.
                  </p>
                </Field>
                {scene && (
                  <button
                    onClick={() => { onPlay(deepClone(story), { fromSceneId: scene.id }); }}
                    className="w-full border border-neon/50 py-1.5 font-pulp text-[10px] uppercase tracking-widest text-neon hover:bg-neon/10"
                    title="Launch the game starting at this scene (fresh world state, does not change your start scene)"
                  >
                    ▶ Play from this scene
                  </button>
                )}
                {scene.background.startsWith("video:") && (
                  <p className="border border-gold/30 bg-gold/5 px-2 py-1 font-type text-[10px] text-gold">
                    🎥 This scene plays a video cutscene instead of a static background. Manage it above.
                  </p>
                )}
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60">
                  <input
                    type="checkbox"
                    checked={!!scene.isEnding}
                    onChange={(e) =>
                      updateScene(scene.id, {
                        isEnding: e.target.checked,
                        endingData: e.target.checked
                          ? scene.endingData ?? { tier: "victory-silver", headline: "HEADLINE!", recap: "How it ended." }
                          : scene.endingData,
                      })
                    }
                  />
                  🏁 this scene is an ending
                </label>
                {scene.isEnding && scene.endingData && (
                  <div className="space-y-1.5 border border-gold/40 p-2">
                    <Field label="Tier">
                      <select
                        className={inputCls}
                        value={scene.endingData.tier}
                        onChange={(e) =>
                          updateScene(scene.id, { endingData: { ...scene.endingData!, tier: e.target.value as never } })
                        }
                      >
                        <option value="victory-gold">victory-gold</option>
                        <option value="victory-silver">victory-silver</option>
                        <option value="gameover">gameover</option>
                      </select>
                    </Field>
                    <Field label="Pulp headline">
                      <input
                        className={inputCls}
                        value={scene.endingData.headline}
                        onChange={(e) => updateScene(scene.id, { endingData: { ...scene.endingData!, headline: e.target.value } })}
                      />
                    </Field>
                    <Field label="Recap">
                      <textarea
                        className={`${inputCls} h-16`}
                        value={scene.endingData.recap}
                        onChange={(e) => updateScene(scene.id, { endingData: { ...scene.endingData!, recap: e.target.value } })}
                      />
                    </Field>
                    {story.episodes?.length ? (
                      <>
                        <label className="flex items-start gap-2 border-t border-gold/20 pt-1.5 text-[10px] text-paper/60">
                          <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={!!scene.endingData.endsSeason}
                            onChange={(e) =>
                              updateScene(scene.id, { endingData: { ...scene.endingData!, endsSeason: e.target.checked || undefined } })
                            }
                          />
                          <span>
                            Ends the whole season here
                            <span className="block font-type text-[9px] normal-case text-paper/35">
                              Off (default): this closes the EPISODE and hands off to "Next time on…". On: a true finale — no next episode is offered.
                            </span>
                          </span>
                        </label>
                        {(() => {
                          const owner = episodeOfScene(story, scene.id);
                          return (
                            <p className={`font-type text-[9px] ${owner ? "text-paper/40" : "text-crimson"}`}>
                              {owner
                                ? `Closes Episode ${owner.number}: ${owner.title}.`
                                : "⚠ This ending isn't in any episode — assign it on the Episodes tab."}
                            </p>
                          );
                        })()}
                      </>
                    ) : null}
                  </div>
                )}
                </CollapsibleSection>
                <CollapsibleSection
                  id={`interrogation-${scene.id}`}
                  title="🎭 Interrogation (composure pressure)"
                  hint={scene.interrogation ? "active" : undefined}
                  titleClass="text-gold"
                >
                  <p className="font-type text-[9px] leading-snug text-paper/45">
                    Talking gets tension. Every <b>attitude-tagged reply</b> in this scene (Sultry / Aggressive /
                    Clever — neutral follow-ups don't count) chips the suspect's <b>composure</b>. At zero their{" "}
                    <b>trust</b> decides: at/above the crack threshold they <b className="text-gold">BREAK</b> (broke
                    beat + flag + the big swing); below it they <b className="text-crimson">CLAMP</b> (clamped beat +
                    flag + the backfire). Composure is derived from the presses you've made — one-shot, save-proof,
                    ungrindable. Gate the payoff content on the broke flag.
                  </p>
                  {!scene.interrogation ? (
                    <button
                      onClick={() => {
                        const ch = story.characters[0]?.id ?? "narrator";
                        updateScene(scene.id, {
                          interrogation: {
                            characterId: ch,
                            composure: 3,
                            crackTrust: 0,
                            brokeBeat: {
                              id: `iq_broke_${scene.id}`,
                              characterId: ch,
                              text: "They finally talk — write what spills.",
                            },
                            brokeFlag: `broke_${scene.id}`,
                            clampedBeat: {
                              id: `iq_clamp_${scene.id}`,
                              characterId: ch,
                              text: "They shut down — write the door closing.",
                            },
                            clampFlag: `clamped_${scene.id}`,
                          },
                        });
                      }}
                      className="w-full border border-gold/50 py-1.5 font-pulp text-[10px] uppercase tracking-widest text-gold hover:bg-gold/10"
                    >
                      ＋ Enable interrogation on this scene
                    </button>
                  ) : (
                    (() => {
                      const iq = scene.interrogation!;
                      const setIq = (patch: Partial<typeof iq>) =>
                        updateScene(scene.id, { interrogation: { ...iq, ...patch } });
                      const setBrokeBeat = (patch: Partial<typeof iq.brokeBeat>) =>
                        setIq({ brokeBeat: { ...iq.brokeBeat, ...patch } });
                      const swingOf = (cons: Consequences | undefined, characterId: string) => ({
                        trust: String(cons?.trustChanges?.find((t) => t.characterId === characterId)?.delta ?? ""),
                        heat: String(cons?.meterChanges?.find((m) => m.meter === "Suspicion")?.delta ?? ""),
                      });
                      const setSwing = (key: "brokeConsequences" | "clampConsequences", trust: string, heat: string) => {
                        const cons: Consequences = {};
                        if (trust !== "" && Number(trust) !== 0) cons.trustChanges = [{ characterId: iq.characterId, delta: Number(trust) }];
                        if (heat !== "" && Number(heat) !== 0) cons.meterChanges = [{ meter: "Suspicion", delta: Number(heat) }];
                        setIq({ [key]: Object.keys(cons).length ? cons : undefined });
                      };
                      const brokeSwing = swingOf(iq.brokeConsequences, iq.characterId);
                      const clampSwing = swingOf(iq.clampConsequences, iq.characterId);
                      return (
                      <>
                        <div className="grid grid-cols-2 gap-1">
                          <Field label="Suspect being pressed">
                            <select
                              className={inputCls}
                              value={iq.characterId}
                              onChange={(e) =>
                                setIq({
                                  characterId: e.target.value,
                                  brokeBeat: { ...iq.brokeBeat, characterId: e.target.value },
                                  clampedBeat: iq.clampedBeat ? { ...iq.clampedBeat, characterId: e.target.value } : undefined,
                                })
                              }
                            >
                              <option value="narrator">🎙 Narrator</option>
                              {story.characters.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </Field>
                          <Field label={`Composure (${iq.composure ?? 3} hits to break)`}>
                            <input
                              type="number"
                              min={1}
                              max={5}
                              className={inputCls}
                              value={iq.composure ?? 3}
                              onChange={(e) => setIq({ composure: Math.max(1, Math.min(5, parseInt(e.target.value, 10) || 3)) })}
                            />
                          </Field>
                        </div>
                        <Field label={`Crack threshold — trust ≥ this at zero composure = CRACK (now: ${iq.crackTrust ?? 0})`}>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={-5}
                              max={5}
                              step={1}
                              className="flex-1 accent-pink-500"
                              value={iq.crackTrust ?? 0}
                              onChange={(e) => setIq({ crackTrust: Number(e.target.value) })}
                            />
                            <span className="w-6 text-right font-type text-[10px] text-paper/70">{iq.crackTrust ?? 0}</span>
                          </div>
                          <p className="mt-1 font-type text-[9px] leading-snug text-paper/40">
                            The risk in the risk/reward: press cold and their trust is below the line, the pressure
                            rebounds. Charm them up first (trust-positive replies) and it pays.
                          </p>
                        </Field>
                        <div className="space-y-1.5 border border-gold/30 bg-gold/5 p-2">
                          <div className="font-pulp text-[9px] uppercase tracking-widest text-gold">★ On crack (they talk)</div>
                          <Field label="Broke beat — plays the moment they break">
                            <textarea className={`${inputCls} h-14 font-type`} value={iq.brokeBeat.text} onChange={(e) => setBrokeBeat({ text: e.target.value })} />
                          </Field>
                          <div className="grid grid-cols-3 gap-1">
                            <Field label="Broke flag">
                              <FlagInput value={iq.brokeFlag} suggestions={allFlags} onChange={(v) => setIq({ brokeFlag: v ?? iq.brokeFlag })} />
                            </Field>
                            <Field label="Trust swing">
                              <input type="number" className={inputCls} value={brokeSwing.trust} placeholder="0"
                                onChange={(e) => setSwing("brokeConsequences", e.target.value, brokeSwing.heat)} />
                            </Field>
                            <Field label="Heat swing">
                              <input type="number" className={inputCls} value={brokeSwing.heat} placeholder="0"
                                onChange={(e) => setSwing("brokeConsequences", brokeSwing.trust, e.target.value)} />
                            </Field>
                          </div>
                        </div>
                        <div className="space-y-1.5 border border-crimson/30 bg-crimson/5 p-2">
                          <div className="font-pulp text-[9px] uppercase tracking-widest text-crimson">✖ On clamp (they shut down)</div>
                          <Field label="Clamped beat — plays when they refuse to break (optional text)">
                            <textarea className={`${inputCls} h-14 font-type`} value={iq.clampedBeat?.text ?? ""} placeholder="Leave empty for no clamped beat (flag + swings still apply)"
                              onChange={(e) => setIq({ clampedBeat: { id: `iq_clamp_${scene.id}`, characterId: iq.characterId, text: e.target.value } })} />
                          </Field>
                          <div className="grid grid-cols-3 gap-1">
                            <Field label="Clamp flag">
                              <FlagInput value={iq.clampFlag} suggestions={allFlags} onChange={(v) => setIq({ clampFlag: v || undefined })} />
                            </Field>
                            <Field label="Trust swing">
                              <input type="number" className={inputCls} value={clampSwing.trust} placeholder="0"
                                onChange={(e) => setSwing("clampConsequences", e.target.value, clampSwing.heat)} />
                            </Field>
                            <Field label="Heat swing">
                              <input type="number" className={inputCls} value={clampSwing.heat} placeholder="0"
                                onChange={(e) => setSwing("clampConsequences", clampSwing.trust, e.target.value)} />
                            </Field>
                          </div>
                          <p className="font-type text-[9px] leading-snug text-paper/40">
                            Usually the backfire: Heat +, trust −. Gate the fallout on the clamp flag.
                          </p>
                        </div>
                        <p className="font-type text-[9px] leading-snug text-paper/40">
                          Presses = this scene's attitude-tagged REPLY choices ({(scene.choices ?? []).filter((c) => c.reply && (c.attitudeTag ?? "Neutral") !== "Neutral").length} found).
                          Author at least composure many of them, or the validator will warn that composure can never break.
                        </p>
                        <button
                          onClick={() => updateScene(scene.id, { interrogation: undefined })}
                          className="w-full border border-crimson/40 py-1 font-pulp text-[9px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
                        >
                          ✕ Remove interrogation
                        </button>
                      </>
                      );
                    })()
                  )}
                </CollapsibleSection>
                <button
                  onClick={() => deleteScene(scene.id)}
                  className="w-full border border-crimson/50 py-1.5 font-pulp text-[10px] uppercase tracking-widest text-crimson hover:bg-crimson/15"
                >
                  🗑 Delete scene
                </button>
              </>
            )}
            {scene && tab === "beats" && (
              <>
                <HelpNote id="beats-tab" title="Talking lines">
                  A Beat is one talking line. Click ＋ Add dialogue beat, pick who speaks (or Narrator), and type the
                  words. They play <b>in order</b> after the room's opening text. Drag the ⠿ grip (or ▲/▼) to reorder.
                  A <b>condition rule</b> hides a line until something is true (pair it with a 💬 reply).{" "}
                  <b>Memories recalled</b> swaps in a different line when the player said something earlier —{" "}
                  <code>{"{said}"}</code> echoes their words.
                </HelpNote>

                <div className="flex gap-1">
                  <button
                    type="button"
                    className="flex-1 border border-noir-600 py-1 font-pulp text-[9px] uppercase tracking-widest text-paper/60 hover:border-gold hover:text-gold"
                    onClick={() => setExpandedBeatId(null)}
                  >
                    ▸ Collapse all
                  </button>
                </div>

                {/* Batch ElevenLabs voice generation for THIS scene — every
                    eligible line converted separately, each in its speaker's
                    assigned voice with conversational context, then applied
                    to the beat automatically. Scene-scoped on purpose: do one
                    conversation at a time so delivery and credits stay sane. */}
                <div className="space-y-1.5 border border-neon/30 bg-neon/5 p-2">
                  <div className="font-pulp text-[9px] uppercase tracking-widest text-neon">
                    🎙 Batch voice — this scene
                  </div>
                  <Field label="Voice model">
                    <select
                      className={inputCls}
                      value={voiceModel}
                      onChange={(e) => changeVoiceModel(e.target.value)}
                    >
                      {ELEVENLABS_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                  </Field>
                  {/* Live cost preview for this scene, for the selected model. */}
                  {(() => {
                    const model = voiceModel;
                    const genChars = (scene.dialogueBeats ?? [])
                      .filter((b) => {
                        const t = b.text?.trim();
                        if (!t || b.silent) return false;
                        if (b.recalls && Object.keys(b.recalls).length) return false;
                        const ch = story.characters.find((x) => x.id === b.characterId);
                        return !!ch?.elevenVoiceId;
                      })
                      .reduce((n, b) => n + b.text.trim().length, 0);
                    const est = estimateVoiceCost(model, genChars);
                    return (
                      <div className="rounded border border-gold/30 bg-gold/5 px-2 py-1.5 text-center">
                        <p className="font-type text-[9px] leading-tight text-gold/90">
                          {genChars > 0 ? (
                            <>
                              ≈ {genChars.toLocaleString()} chars → <b>~{est.credits.toLocaleString()} credits</b>
                              {est.usd >= 0.5 ? ` (~$${est.usd.toFixed(2)} overage)` : ""}
                            </>
                          ) : (
                            "No convertible lines in this scene (set character voice IDs first)."
                          )}
                        </p>
                      </div>
                    );
                  })()}
                  <button
                    disabled={batchBusy}
                    onClick={() => { setBatchDone(null); void batchGenerateVoices(scene.id, voiceModel); }}
                    className="w-full border border-neon/50 py-1.5 font-pulp text-[10px] uppercase tracking-widest text-neon hover:bg-neon/10 disabled:opacity-40"
                    title="Generate MP3s for every convertible beat in THIS scene — each in its speaker's voice with conversational context, then applied automatically. Spends ElevenLabs credits; you'll confirm first."
                  >
                    {batchBusy
                      ? `Converting… ${batchProgress ? `${batchProgress.done + 1}/${batchProgress.total}` : ""}`
                      : "▶ Generate this scene's voices"}
                  </button>
                  {batchBusy && batchProgress && (
                    <>
                      <div className="h-1 w-full overflow-hidden rounded bg-noir-700">
                        <div
                          className="h-full bg-neon transition-all"
                          style={{ width: `${Math.round(((batchProgress.done) / batchProgress.total) * 100)}%` }}
                        />
                      </div>
                      <p className="font-type text-[9px] leading-snug text-gold">
                        {batchProgress.done + 1} / {batchProgress.total} · {batchProgress.label}
                      </p>
                    </>
                  )}
                  {batchDone && (
                    <p className="whitespace-pre-line border border-emerald-500/30 bg-emerald-500/5 p-1.5 font-type text-[9px] leading-snug text-emerald-300/90">
                      {batchDone}
                    </p>
                  )}
                  <p className="font-type text-[9px] leading-snug text-paper/45">
                    Converts the whole <b>conversation in this scene</b> — each line in that character's assigned voice,
                    reading the lines around it for natural back-and-forth, then applies each MP3 to its beat automatically.
                    Skips silent/recall lines and characters without a voice ID. Set voices (and the API key) in the
                    Characters tab.
                  </p>
                </div>
                {/* ---- ✂ EXTRACT BEATS ------------------------------------
                    Splitting an overgrown conversation used to mean copying
                    lines out by hand. Tick the beats, choose move or copy,
                    and they leave in PLAY order with the scene's look
                    carried across. */}
                {(scene.dialogueBeats?.length ?? 0) > 1 ? (
                  <div className="border border-neon/25 bg-neon/5 p-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-pulp text-[9px] uppercase tracking-widest text-neon">
                        ✂ Split this scene
                      </span>
                      <button
                        className="border border-neon/40 px-1.5 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-neon hover:bg-neon/10"
                        onClick={() => {
                          setBeatPickMode((v) => !v);
                          setPickedBeats(new Set());
                        }}
                      >
                        {beatPickMode ? "Cancel" : "Pick beats"}
                      </button>
                    </div>
                    {beatPickMode ? (
                      <div className="mt-1.5 space-y-1.5">
                        <p className="font-type text-[9px] leading-snug text-paper/55">
                          Tick the beats to lift out. They move in <b>play order</b>, not tick order, and the new scene
                          inherits this one's background, audio and camera — so the split is invisible in play. Hotspots,
                          choices and endings stay here.
                        </p>
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            className="border border-noir-600 px-1.5 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/60 hover:border-neon/50 hover:text-neon"
                            onClick={() => setPickedBeats(new Set((scene.dialogueBeats ?? []).map((x) => x.id)))}
                          >
                            All
                          </button>
                          <button
                            className="border border-noir-600 px-1.5 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/60 hover:border-neon/50 hover:text-neon"
                            onClick={() => setPickedBeats(new Set())}
                          >
                            None
                          </button>
                          <span className="ml-1 font-type text-[9px] text-paper/50">
                            {pickedBeats.size} of {scene.dialogueBeats?.length ?? 0} picked
                          </span>
                        </div>
                        {pickedBeats.size === (scene.dialogueBeats?.length ?? 0) && pickedBeats.size > 0 ? (
                          <p className="border border-gold/40 bg-gold/10 px-1.5 py-1 font-type text-[9px] text-gold">
                            ⚠ That's every beat — this scene would be left with no dialogue. Untick at least one, or use
                            Copy instead of Move.
                          </p>
                        ) : null}
                        <div className="flex flex-wrap gap-1">
                          <button
                            disabled={!pickedBeats.size || pickedBeats.size === (scene.dialogueBeats?.length ?? 0)}
                            className="border border-neon/50 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-neon hover:bg-neon/10 disabled:opacity-30"
                            title="Move the ticked beats into a new scene and wire a Continue choice to it"
                            onClick={() =>
                              extractBeats(scene.id, [...pickedBeats], { link: "chain", copy: false })
                            }
                          >
                            ✂ Move → linked scene
                          </button>
                          <button
                            disabled={!pickedBeats.size || pickedBeats.size === (scene.dialogueBeats?.length ?? 0)}
                            className="border border-noir-600 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/70 hover:border-neon/50 hover:text-neon disabled:opacity-30"
                            title="Move them into a new scene that is NOT connected — wire it yourself"
                            onClick={() =>
                              extractBeats(scene.id, [...pickedBeats], { link: "loose", copy: false })
                            }
                          >
                            ✂ Move → loose scene
                          </button>
                          <button
                            disabled={!pickedBeats.size}
                            className="border border-noir-600 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-paper/70 hover:border-gold/50 hover:text-gold disabled:opacity-30"
                            title="Leave the originals here and copy them into a new loose scene"
                            onClick={() =>
                              extractBeats(scene.id, [...pickedBeats], { link: "loose", copy: true })
                            }
                          >
                            ⧉ Copy → loose scene
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {(scene.dialogueBeats ?? []).map((b, i) => {
                  const speakerName =
                    b.characterId === "narrator"
                      ? "Narrator"
                      : story.characters.find((c) => c.id === b.characterId)?.name ?? "Narrator";
                  const snippet = b.text.replace(/\s+/g, " ").trim().slice(0, 30);
                  // Accordion: a beat is open only when it is the single
                  // expanded one. Everything else stays minimised, so a long
                  // list reads as a compact stack of title bars.
                  const isOpen = expandedBeatId === b.id;
                  return (
                    <CollapsibleSection
                      key={b.id}
                      id={`beat-${b.id}`}
                      title={<span>💬 Beat {i + 1} · {speakerName}{snippet ? ` — ${snippet}` : ""}</span>}
                      titleClass="text-gold"
                      defaultOpen={focusedBeatId === b.id}
                      controlledOpen={isOpen}
                      onToggle={(next) => setExpandedBeatId(next ? b.id : null)}
                      draggable
                      dragOver={dragOverBeatId === b.id && dragBeatId !== b.id}
                      onDragStartHandle={(e) => {
                        setDragBeatId(b.id);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", b.id);
                      }}
                      onDragEnterHandle={(e) => {
                        e.preventDefault();
                        if (dragBeatId && dragBeatId !== b.id) setDragOverBeatId(b.id);
                      }}
                      onDragOverHandle={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDropHandle={(e) => {
                        e.preventDefault();
                        const dropped = e.dataTransfer.getData("text/plain") || dragBeatId;
                        if (dropped) reorderBeat(dropped, b.id);
                        setDragBeatId(null);
                        setDragOverBeatId(null);
                      }}
                      onDragEndHandle={() => {
                        setDragBeatId(null);
                        setDragOverBeatId(null);
                      }}
                      headerRight={
                        <span className="flex items-center gap-1">
                          {beatPickMode ? (
                            <input
                              type="checkbox"
                              className="mr-1 h-3 w-3 shrink-0 accent-neon"
                              checked={pickedBeats.has(b.id)}
                              title={`Pick beat ${i + 1} for the split`}
                              aria-label={`Pick beat ${i + 1} for the split`}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                setPickedBeats((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(b.id)) next.delete(b.id);
                                  else next.add(b.id);
                                  return next;
                                });
                              }}
                            />
                          ) : null}
                          <button
                            className="px-1 text-[10px] text-paper/50 hover:text-gold disabled:opacity-25"
                            disabled={i === 0}
                            onClick={() =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                const beats = s.dialogueBeats!;
                                const j = beats.findIndex((x) => x.id === b.id);
                                if (j > 0) [beats[j - 1], beats[j]] = [beats[j], beats[j - 1]];
                              })
                            }
                            title="Move this beat earlier"
                            aria-label={`Move beat ${i + 1} up`}
                          >
                            ▲
                          </button>
                          <button
                            className="px-1 text-[10px] text-paper/50 hover:text-gold disabled:opacity-25"
                            disabled={i === (scene.dialogueBeats?.length ?? 0) - 1}
                            onClick={() =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                const beats = s.dialogueBeats!;
                                const j = beats.findIndex((x) => x.id === b.id);
                                if (j >= 0 && j < beats.length - 1) [beats[j + 1], beats[j]] = [beats[j], beats[j + 1]];
                              })
                            }
                            title="Move this beat later"
                            aria-label={`Move beat ${i + 1} down`}
                          >
                            ▼
                          </button>
                          <button
                            className="text-[10px] text-crimson hover:underline"
                            onClick={() =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.dialogueBeats = s.dialogueBeats?.filter((x) => x.id !== b.id);
                              })
                            }
                            title="Delete this beat"
                          >
                            ✕
                          </button>
                        </span>
                      }
                    >
                    <CollapsibleSection id={`beat-${b.id}-dlg`} title="💬 Dialogue" defaultOpen>
                    <div className="grid grid-cols-2 gap-1">
                      <Field label="Speaker">
                        <select
                          className={inputCls}
                          value={b.characterId}
                          onChange={(e) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.dialogueBeats!.find((x) => x.id === b.id)!.characterId = e.target.value;
                            })
                          }
                        >
                          <option value="narrator">🎙 Narrator (V.O.)</option>
                          {story.characters.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Expression">
                        <input
                          className={inputCls}
                          value={b.expression ?? ""}
                          onChange={(e) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.dialogueBeats!.find((x) => x.id === b.id)!.expression = e.target.value;
                            })
                          }
                        />
                      </Field>
                    </div>
                    <Field label="Line (autosaves while you type and when you leave)">
                      <CommitTextArea
                        className={`${inputCls} h-16 font-type`}
                        value={b.text}
                        ariaLabel={`Line for beat ${b.id}`}
                        onCommit={(next) =>
                          mutateLatest((d) => {
                            if (d.id !== story.id) return;
                            const line = d.scenes.find((x) => x.id === scene.id)?.dialogueBeats?.find((x) => x.id === b.id);
                            if (line) line.text = next;
                          })
                        }
                      />
                      <Field label="Voice MP3 URL (optional — replaces TTS for this line)">
                        <div className="flex gap-1">
                          <input
                            className={inputCls}
                            placeholder="/audio/line_01.mp3 or https://..."
                            value={mediaField(b.audioUrl)}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.dialogueBeats!.find((x) => x.id === b.id)!.audioUrl = e.target.value || undefined;
                              })
                            }
                          />
                          <MediaUploadButton
                            storyId={story.id}
                            accept="audio/*"
                            label="⇧ Upload"
                            onUploaded={(_url, assetId) => mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.dialogueBeats!.find((x) => x.id === b.id)!.audioUrl = `asset:${assetId}`;
                            })}
                          />
                        </div>
                        <div className="mt-1">
                          <AssetDropdown
                            storyId={story.id}
                            assetType="audio"
                            returnReference
                            value={b.audioUrl}
                            onChange={(url) => mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.dialogueBeats!.find((x) => x.id === b.id)!.audioUrl = url;
                            })}
                            placeholder="Or use uploaded audio..."
                          />
                        </div>
                        <div className="mt-1">
                          <CharacterVoiceFiles
                            characterId={b.characterId}
                            characterName={story.characters.find((x) => x.id === b.characterId)?.name}
                            value={b.audioUrl}
                            onChange={(url) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.dialogueBeats!.find((x) => x.id === b.id)!.audioUrl = url;
                              })
                            }
                          />
                        </div>
                        <div className="mt-1 flex gap-1">
                          <button
                            disabled={
                              aiBusyBeat !== null ||
                              !!b.silent ||
                              !b.text.trim() ||
                              !!(b.recalls && Object.keys(b.recalls).length) ||
                              !story.characters.find((x) => x.id === b.characterId)?.elevenVoiceId
                            }
                            title={
                              b.silent
                                ? "Silent beat — no line to convert"
                                : !b.text.trim()
                                  ? "Write the line first"
                                  : b.recalls && Object.keys(b.recalls).length
                                    ? "This line recalls memories — its text changes by route, so it stays on TTS"
                                    : !story.characters.find((x) => x.id === b.characterId)?.elevenVoiceId
                                      ? "Assign this character's ElevenLabs voice ID in the Characters tab first"
                                      : "Synthesize this line with ElevenLabs — spends credits, you'll be asked to confirm"
                            }
                            onClick={async () => {
                              const ch = story.characters.find((x) => x.id === b.characterId);
                              if (!ch?.elevenVoiceId) {
                                window.alert("Assign this character's ElevenLabs voice ID in the Characters tab first.");
                                return;
                              }
                              const line = b.text.trim();
                              if (!line) return;
                              if (!window.confirm(convertConfirmMessage(`${ch.name} — ${scene.title}`, ch.elevenVoiceId, getElevenModel(), line))) return;
                              setAiBusyBeat(b.id);
                              setAiNote(null);
                              try {
                                const { dataUrl, blob } = await synthesizeElevenLabs(line, ch.elevenVoiceId, getElevenModel());
                                // Save the MP3 as a real file (public/voices/<person>/<scene>/
                                // on desktop, the linked folder in the browser) and point the
                                // beat at wherever it actually landed.
                                const saved = await saveGeneratedVoice({
                                  storyId: story.id,
                                  characterId: b.characterId,
                                  sceneId: scene.id,
                                  beatId: b.id,
                                  blob,
                                  dataUrl,
                                  assetName: `voice-${b.characterId}-${b.id}`,
                                });
                                mutate((d) => {
                                  const current = d.scenes.find((x) => x.id === scene.id)?.dialogueBeats?.find((x) => x.id === b.id);
                                  if (current && current.text.trim() === line && current.characterId === b.characterId) current.audioUrl = saved.url;
                                });
                                const current = storyRef.current.scenes.find((s) => s.id === scene.id)?.dialogueBeats?.find((beat) => beat.id === b.id);
                                if (studioAlive.current && storyRef.current.id === story.id && current?.text.trim() === line && current.characterId === b.characterId) {
                                  setAiNote({ text: saved.note, at: Date.now() });
                                  void new Audio(dataUrl).play().catch(() => {});
                                }
                              } catch (err) {
                                window.alert((err as Error).message);
                              } finally {
                                setAiBusyBeat(null);
                              }
                            }}
                            className="w-full border border-neon/40 py-1 font-pulp text-[8px] uppercase tracking-widest text-neon hover:bg-neon/10 disabled:opacity-40"
                          >
                            {aiBusyBeat === b.id ? "Converting…" : b.audioUrl ? "↺ Regenerate MP3 (ElevenLabs)" : "🎙 Generate MP3 (ElevenLabs)"}
                          </button>
                          {aiNote && (
                            <p className="font-type text-[8px] leading-snug text-gold/90" title={aiNote.text}>
                              {aiNote.text}
                            </p>
                          )}
                          {b.audioUrl && (
                            <button
                              onClick={() =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.dialogueBeats!.find((x) => x.id === b.id)!.audioUrl = undefined;
                                })
                              }
                              title="Clear the MP3 — this line falls back to TTS"
                              className="border border-crimson/40 px-2 py-1 font-pulp text-[8px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
                            >
                              ✕ TTS
                            </button>
                          )}
                        </div>
                      </Field>
                      {/* Audio tags — v3 performs sound cues (laugh/cough);
                          older models get only voice-delivery direction like
                          whisper, with a note. */}
                      {b.characterId !== "narrator" && (() => {
                        const tags = audioTagsForModel(voiceModel);
                        const v3 = modelSupportsAudioTags(voiceModel);
                        if (!tags.length) return null;
                        return (
                          <div className="mt-1 rounded border border-neon/25 bg-neon/5 p-1.5">
                            <div className="font-pulp text-[8px] uppercase tracking-widest text-neon">
                              🎙 Insert cue · {v3 ? "sound + delivery" : "delivery only"}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {tags.map((t) => (
                                <button
                                  key={t.tag}
                                  type="button"
                                  title={t.hint}
                                  onClick={() =>
                                    mutate((d) => {
                                      const beat = d.scenes
                                        .find((x) => x.id === scene.id)!
                                        .dialogueBeats!.find((x) => x.id === b.id)!;
                                      beat.text = `${beat.text ? beat.text.replace(/\s*$/, "") + " " : ""}${t.tag} `;
                                    })
                                  }
                                  className="border border-neon/40 px-1.5 py-0.5 font-pulp text-[9px] uppercase tracking-wide text-neon hover:bg-neon/15"
                                >
                                  {t.label}
                                </button>
                              ))}
                            </div>
                            <p className="mt-1 font-type text-[8px] leading-snug text-paper/40">
                              {v3 ? (
                                <>Bracketed cues like <b>[laughs]</b> are performed by the v3 voice — place them where the sound happens.</>
                              ) : (
                                <>This model only handles delivery cues like <b>[whispers]</b>. Switch to <b>Eleven v3</b> for performed sounds ([laughs], [coughs]…) — other models read the brackets aloud.</>
                              )}
                            </p>
                          </div>
                        );
                      })()}
                    </Field>
                    </CollapsibleSection>
                    <CollapsibleSection id={`beat-${b.id}-bg`} title="🖼 Background & camera">
                    <Field label="🖼 Replacement background image or 🎞 video clip (persists over later beats by default — see options below)">
                      <div className="flex gap-1">
                        <input
                          className={inputCls}
                          placeholder="/img/scene.jpg, gradient:… or video:/path.mp4 (leave blank for scene default)"
                          value={mediaField(b.background)}
                          onChange={(e) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.dialogueBeats!.find((x) => x.id === b.id)!.background = e.target.value || undefined;
                            })
                          }
                        />
                        <MediaUploadButton
                          storyId={story.id}
                          accept="image/*"
                          label="⇧"
                          onUploaded={(_url, assetId) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.dialogueBeats!.find((x) => x.id === b.id)!.background = `asset:${assetId}`;
                            })
                          }
                        />
                        <MediaUploadButton
                          storyId={story.id}
                          accept="video/*"
                          label="🎞 Video"
                          onUploaded={(_url, assetId) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.dialogueBeats!.find((x) => x.id === b.id)!.background = `video:asset:${assetId}`;
                            })
                          }
                        />
                        {b.background && (
                          <button
                            type="button"
                            title="Clear (use the scene default background)"
                            onClick={() =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.dialogueBeats!.find((x) => x.id === b.id)!.background = undefined;
                              })
                            }
                            className="shrink-0 border border-crimson/40 px-2 font-pulp text-[9px] uppercase text-crimson hover:bg-crimson/10"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <div className="mt-1">
                        <ImagePicker
                          value={b.background}
                          onChange={(v) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.dialogueBeats!.find((x) => x.id === b.id)!.background = v || undefined;
                            })
                          }
                          placeholder="🖼 or browse the image library… (leave blank for scene default)"
                        />
                      </div>
                      {b.background && b.background.startsWith("video:") && (
                        <video
                          className="mt-1 h-24 w-full border border-noir-600 object-cover"
                          src={(media(b.background) ?? b.background).replace(/^video:/, "")}
                          muted
                          controls
                          playsInline
                        />
                      )}
                      {b.background && !b.background.startsWith("video:") && (
                        <div
                          className="mt-1 h-14 w-full border border-noir-600"
                          style={bgStyle(media(b.background) ?? b.background)}
                        />
                      )}
                      {b.background && (
                        <div className="grid grid-cols-2 gap-1">
                          <Field label="Image transition — dramatic">
                            <select
                              className={inputCls}
                              value={b.backgroundTransition ?? "fade"}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.dialogueBeats!.find((x) => x.id === b.id)!.backgroundTransition = e.target.value as never;
                                })
                              }
                            >
                              <option value="cut">⚡ Cut</option>
                              <option value="fade">⬛ Fade</option>
                              <option value="crossfade">〰 Crossfade</option>
                              <option value="fade-black">🌑 Fade from black</option>
                              <option value="slide-left">⬅ Slide left</option>
                              <option value="slide-right">➡ Slide right</option>
                              <option value="iris-in">◉ Iris in</option>
                              <option value="iris">⭕ Iris</option>
                              <option value="wipe-left">➡️ Wipe left</option>
                              <option value="wipe-right">⬅️ Wipe right</option>
                              <option value="wipe-up">⬆️ Wipe up</option>
                              <option value="wipe-down">⬇️ Wipe down</option>
                              <option value="zoom">🔍 Zoom</option>
                              <option value="glitch">📺 Glitch</option>
                              <option value="burn">🔥 Burn</option>
                            </select>
                          </Field>
                          <Field label={`Transition speed ${(b.backgroundTransitionSpeed ?? 0.5).toFixed(1)}s`}>
                            <input
                              type="range"
                              min={0}
                              max={2}
                              step={0.1}
                              className="w-full accent-pink-500"
                              value={b.backgroundTransitionSpeed ?? 0.5}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.dialogueBeats!.find((x) => x.id === b.id)!.backgroundTransitionSpeed = Number(e.target.value);
                                })
                              }
                            />
                          </Field>
                        </div>
                      )}
                      {b.background && !b.background.startsWith("video:") && (
                        <div className="mt-1 space-y-2 border border-gold/20 bg-gold/5 p-2">
                          <div className="font-pulp text-[9px] uppercase tracking-widest text-gold">
                            🎬 Beat camera — zoom to subject &amp; motion
                          </div>
                          <CinematicControls
                            cinematic={b.cinematic}
                            previewUrl={media(b.background) ?? b.background}
                            storyId={story.id}
                            media={media}
                            particles={scene.particles}
                            ambientAudio={scene.ambientAudio}
                            onChange={(next) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.dialogueBeats!.find((x) => x.id === b.id)!.cinematic = next;
                              })
                            }
                          />
                        </div>
                      )}
                      <div className="mt-1 space-y-1 border border-gold/20 bg-gold/5 p-1.5">
                        <label className="flex items-start gap-2 text-[10px] uppercase tracking-wider text-paper/70">
                          <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={b.backgroundHold !== false}
                            onChange={(e) =>
                              mutate((d) => {
                                const beat = d.scenes.find((x) => x.id === scene.id)!.dialogueBeats!.find((x) => x.id === b.id)!;
                                beat.backgroundHold = e.target.checked ? undefined : false;
                              })
                            }
                          />
                          <span>
                            📌 Keep image on later beats
                            <span className="block font-type text-[9px] normal-case tracking-normal text-paper/45">
                              On by default — this insert stays up while later beats talk over it, until another beat
                              sets a new image. Turn OFF to show it only during this beat, then snap back to the scene.
                            </span>
                          </span>
                        </label>
                      </div>
                    </Field>
                    {/* On any beat: end a held insert and return to the scene plate. */}
                    <label className="flex items-start gap-2 border border-cyan-neon/25 bg-cyan-neon/5 px-2 py-1 text-[10px] uppercase tracking-wider text-paper/70">
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={!!b.backgroundRevert}
                        onChange={(e) =>
                          mutate((d) => {
                            const beat = d.scenes.find((x) => x.id === scene.id)!.dialogueBeats!.find((x) => x.id === b.id)!;
                            beat.backgroundRevert = e.target.checked || undefined;
                          })
                        }
                      />
                      <span>
                        🔙 End insert shot here — return to the scene image
                        <span className="block font-type text-[9px] normal-case tracking-normal text-paper/45">
                          Drops a held replacement background when this beat begins (use on a beat with no image of its own).
                        </span>
                      </span>
                    </label>
                    <label className="flex items-center gap-2 border border-neon/20 bg-neon/5 px-2 py-1 text-[10px] uppercase tracking-wider text-paper/60">
                      <input
                        type="checkbox"
                        checked={!!b.silent}
                        onChange={(e) =>
                          mutate((d) => {
                            const s = d.scenes.find((x) => x.id === scene.id)!;
                            s.dialogueBeats!.find((x) => x.id === b.id)!.silent = e.target.checked || undefined;
                          })
                        }
                      />
                      🔇 Silent beat — no narration (text only)
                    </label>
                    </CollapsibleSection>
                    <CollapsibleSection id={`beat-${b.id}-route`} title="🎬 Routing & animation">
                    {/* ---- after this beat: route to another scene ---- */}
                    <div className="border border-cyan-neon/30 bg-cyan-neon/5 p-2 space-y-1.5">
                      <Field label="🎬 After this beat — cut to scene (insert shot ends the scene)">
                        <select
                          className={inputCls}
                          value={b.afterBeatTargetSceneId ?? ""}
                          onChange={(e) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              const beat = s.dialogueBeats!.find((x) => x.id === b.id)!;
                              beat.afterBeatTargetSceneId = e.target.value || undefined;
                              if (e.target.value && beat.afterBeatMode === undefined) {
                                beat.afterBeatMode = "auto";
                                beat.afterBeatDelaySeconds = 1.6;
                              }
                            })
                          }
                        >
                          <option value="">— stay in this scene after the beat —</option>
                          {story.scenes
                            .filter((s) => s.id !== scene.id)
                            .map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.isEnding ? "🏁 " : "🎞 "}
                                {s.title}
                              </option>
                            ))}
                        </select>
                      </Field>
                      {b.afterBeatTargetSceneId && (
                        <>
                          <p className="font-type text-[9px] leading-snug text-paper/45">
                            When this beat (the LAST visible line) is dismissed, the game cuts straight to that scene —
                            this insert background fades directly into the next, with no flash back to the scene plate.
                            Put it on the scene's final beat.
                          </p>
                          <Field label="When to cut">
                            <select
                              className={inputCls}
                              value={b.afterBeatMode ?? "auto"}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.dialogueBeats!.find((x) => x.id === b.id)!.afterBeatMode = e.target.value as "auto" | "continue";
                                })
                              }
                            >
                              <option value="auto">⏱ Auto — hold on a timer, then cut</option>
                              <option value="continue">▸ Continue button / Space — the player cuts</option>
                            </select>
                          </Field>
                          {(b.afterBeatMode ?? "auto") === "auto" && (
                            <Field label={`Hold ${b.afterBeatDelaySeconds ?? 1.6}s after the line finishes (the timer guarantees the beat is read)`}>
                              <input
                                type="range"
                                min={0.5}
                                max={12}
                                step={0.5}
                                className="w-full accent-cyan-400"
                                value={b.afterBeatDelaySeconds ?? 1.6}
                                onChange={(e) =>
                                  mutate((d) => {
                                    const s = d.scenes.find((x) => x.id === scene.id)!;
                                    s.dialogueBeats!.find((x) => x.id === b.id)!.afterBeatDelaySeconds = Number(e.target.value);
                                  })
                                }
                              />
                            </Field>
                          )}
                        </>
                      )}
                    </div>
                    {b.characterId !== "narrator" && story.characters.some((ch) => ch.id === b.characterId) && (
                      <label className="flex items-center gap-2 border border-cyan-neon/20 bg-cyan-neon/5 px-2 py-1 text-[10px] uppercase tracking-wider text-paper/60">
                        <input
                          type="checkbox"
                          checked={b.useCharacterAnimation !== false}
                          onChange={(e) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.dialogueBeats!.find((x) => x.id === b.id)!.useCharacterAnimation = e.target.checked || undefined;
                            })
                          }
                        />
                        🗣 Talking animation — {b.useCharacterAnimation !== false ? "animate" : "resting pose"} while they speak
                        {!(story.characters.find((ch) => ch.id === b.characterId)?.talkingFrames?.length) && (
                          <span className="text-paper/35 normal-case">(set frames in the Characters tab first)</span>
                        )}
                      </label>
                    )}
                    </CollapsibleSection>
                    <CollapsibleSection id={`beat-${b.id}-cond`} title="🧠 Conditions & memories">
                    {/* Memory recall substitutions — the NPC echoes a specific
                        earlier choice instead of a generic line. */}
                    <Field label="Memories recalled (memory tag OR flag → line). Replaces the Line above when that choice was made — or that flag is set. Use {said} for the player's exact words (or the flag's note from the 🏷 Flags tab).">
                      <div className="space-y-1">
                        {(Object.entries(b.recalls ?? {})).map(([tag, line]) => (
                          <div key={tag} className="grid grid-cols-[1fr_2fr_auto] items-center gap-1">
                            <input
                              className={inputCls}
                              value={tag}
                              placeholder="tag"
                              list={`recall-tags-${b.id}`}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  const rec = { ...(s.dialogueBeats!.find((x) => x.id === b.id)!.recalls ?? {}) };
                                  const nv = e.target.value;
                                  if (nv === tag) return;
                                  const entry = rec[tag];
                                  delete rec[tag];
                                  if (entry != null) rec[nv] = entry;
                                  s.dialogueBeats!.find((x) => x.id === b.id)!.recalls = Object.keys(rec).length ? rec : undefined;
                                })
                              }
                            />
                            <datalist id={`recall-tags-${b.id}`}>
                              {recallSuggestions.filter((t) => t !== tag && !(b.recalls?.[t] != null)).map((t) => (
                                <option key={t} value={t} />
                              ))}
                            </datalist>
                            <input
                              className={inputCls}
                              value={line}
                              placeholder="recall line (use {said})"
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  const rec = { ...(s.dialogueBeats!.find((x) => x.id === b.id)!.recalls ?? {}) };
                                  rec[tag] = e.target.value;
                                  s.dialogueBeats!.find((x) => x.id === b.id)!.recalls = rec;
                                })
                              }
                            />
                            <button
                              onClick={() =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  const rec = { ...(s.dialogueBeats!.find((x) => x.id === b.id)!.recalls ?? {}) };
                                  delete rec[tag];
                                  s.dialogueBeats!.find((x) => x.id === b.id)!.recalls = Object.keys(rec).length ? rec : undefined;
                                })
                              }
                              className="shrink-0 border border-crimson/40 px-1.5 py-1 font-pulp text-[9px] uppercase text-crimson hover:bg-crimson/10"
                              title="Remove this recall"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              const rec = { ...(s.dialogueBeats!.find((x) => x.id === b.id)!.recalls ?? {}) };
                              rec[recallSuggestions.find((t) => !(rec[t] != null)) ?? "recall_tag"] = "You said: {said}";
                              s.dialogueBeats!.find((x) => x.id === b.id)!.recalls = rec;
                            })
                          }
                          className="w-full border border-cyan-neon/40 py-1 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
                        >
                          ＋ Add recall
                        </button>
                      </div>
                    </Field>
                    <GatingEditor
                      sectionId={`beat-${b.id}`}
                      gating={b.conditionRule}
                      items={story.items}
                      characters={story.characters}
                      flags={allFlags}
                      memoryTags={recallSuggestions}
                      onChange={(g) =>
                        mutate((d) => {
                          const s = d.scenes.find((x) => x.id === scene.id)!;
                          s.dialogueBeats!.find((x) => x.id === b.id)!.conditionRule = g;
                        })
                      }
                    />
                    </CollapsibleSection>

                    {/* PRESS THE LIE — the contradiction verb. This beat is a
                        false claim; the player presses and must present the
                        evidence that breaks it. */}
                    <CollapsibleSection id={`beat-${b.id}-lie`} title="🎯 Press the Lie (contradiction)">
                      {!b.lie ? (
                        <button
                          onClick={() =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              const beat = s.dialogueBeats!.find((x) => x.id === b.id)!;
                              beat.lie = {
                                evidenceItemIds: [],
                                contradictedFlag: `${scene.id.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_lie_broken`,
                                caughtBeat: {
                                  id: `b_${uid()}`,
                                  characterId: b.characterId,
                                  text: "That's not — how did you…? All right. You've got me.",
                                  conditionRule: { requiresFlags: [] },
                                },
                              };
                            })
                          }
                          className="w-full border border-crimson/40 py-1 font-pulp text-[9px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
                        >
                          ＋ This line is a lie the player can catch
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <p className="font-type text-[10px] leading-snug text-paper/60">
                            While this line is on screen the player gets a <b className="text-crimson">🎯 Press them on that</b> button.
                            They open their inventory and must present the clue that proves it false. Right clue → the caught
                            line plays and the flag sets; wrong clue → heat/trust cost, and they get only a few tries.
                          </p>
                          <Field label="The claim (what the player challenges — defaults to the line above)">
                            <input
                              className={inputCls}
                              value={b.lie.claim ?? ""}
                              placeholder={b.text.slice(0, 80)}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  const lie = s.dialogueBeats!.find((x) => x.id === b.id)!.lie!;
                                  lie.claim = e.target.value || undefined;
                                })
                              }
                            />
                          </Field>
                          <Field label="Breaking evidence — the clue item(s) that prove this false (player must be HOLDING one)">
                            <div className="space-y-1">
                              {story.items.length === 0 && (
                                <p className="font-type text-[10px] text-crimson">No items in this story yet — add a clue item first.</p>
                              )}
                              {story.items.map((it) => {
                                const on = b.lie!.evidenceItemIds.includes(it.id);
                                return (
                                  <label key={it.id} className="flex items-center gap-1.5 font-type text-[11px] text-paper/85">
                                    <input
                                      type="checkbox"
                                      checked={on}
                                      onChange={(e) =>
                                        mutate((d) => {
                                          const s = d.scenes.find((x) => x.id === scene.id)!;
                                          const lie = s.dialogueBeats!.find((x) => x.id === b.id)!.lie!;
                                          lie.evidenceItemIds = e.target.checked
                                            ? [...lie.evidenceItemIds, it.id]
                                            : lie.evidenceItemIds.filter((x) => x !== it.id);
                                        })
                                      }
                                    />
                                    {it.icon} {it.name}{it.isClue ? " 📌" : ""}
                                  </label>
                                );
                              })}
                            </div>
                          </Field>
                          <Field label="Caught flag (set when the lie breaks — gate the aftermath on it)">
                            <input
                              className={inputCls}
                              list={`flag-tags-${b.id}`}
                              value={b.lie.contradictedFlag}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.dialogueBeats!.find((x) => x.id === b.id)!.lie!.contradictedFlag = e.target.value;
                                })
                              }
                            />
                            <datalist id={`flag-tags-${b.id}`}>
                              {allFlags.filter((f) => f !== b.lie!.contradictedFlag).map((f) => (
                                <option key={f} value={f} />
                              ))}
                            </datalist>
                          </Field>
                          <div className="border border-gold/30 bg-gold/5 p-2">
                            <p className="mb-1 font-pulp text-[9px] uppercase tracking-widest text-gold">Caught-in-a-lie reaction (plays when the right evidence lands)</p>
                            <div className="grid grid-cols-2 gap-1">
                              <Field label="Speaker">
                                <select
                                  className={inputCls}
                                  value={b.lie.caughtBeat.characterId}
                                  onChange={(e) =>
                                    mutate((d) => {
                                      const s = d.scenes.find((x) => x.id === scene.id)!;
                                      s.dialogueBeats!.find((x) => x.id === b.id)!.lie!.caughtBeat.characterId = e.target.value;
                                    })
                                  }
                                >
                                  <option value="narrator">🎙 Narrator (V.O.)</option>
                                  {story.characters.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                </select>
                              </Field>
                              <Field label="Gate (auto-set to the caught flag)">
                                <span className="font-type text-[10px] text-paper/50">
                                  requires: <b className="text-gold">{b.lie.contradictedFlag}</b>
                                </span>
                              </Field>
                            </div>
                            <Field label="Reaction line">
                              <CommitTextArea
                                className={`${inputCls} h-14 font-type`}
                                value={b.lie.caughtBeat.text}
                                ariaLabel={`Caught reaction for beat ${b.id}`}
                                onCommit={(next) =>
                                  mutateLatest((d) => {
                                    if (d.id !== story.id) return;
                                    const lie = d.scenes.find((x) => x.id === scene.id)?.dialogueBeats?.find((x) => x.id === b.id)?.lie;
                                    if (!lie) return;
                                    lie.caughtBeat.text = next;
                                    lie.caughtBeat.conditionRule = { requiresFlags: [lie.contradictedFlag] };
                                  })
                                }
                              />
                            </Field>
                          </div>
                          <Field label='"They will remember that" card on a successful catch (optional)'>
                            <input
                              className={inputCls}
                              value={b.lie.rememberLine ?? ""}
                              placeholder='e.g. Vera knows you’ve got her.'
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.dialogueBeats!.find((x) => x.id === b.id)!.lie!.rememberLine = e.target.value || undefined;
                                })
                              }
                            />
                          </Field>
                          <div className="grid grid-cols-2 gap-1">
                            <Field label="Composure damage (in an interrogation; 0 = none, 2+ cracks)">
                              <input
                                type="number" min={0} max={6}
                                className={inputCls}
                                value={b.lie.composureDamage ?? 0}
                                onChange={(e) =>
                                  mutate((d) => {
                                    const s = d.scenes.find((x) => x.id === scene.id)!;
                                    s.dialogueBeats!.find((x) => x.id === b.id)!.lie!.composureDamage = Number(e.target.value) || 0;
                                  })
                                }
                              />
                            </Field>
                            <Field label="Wrong-evidence guesses before they shut down (default 2)">
                              <input
                                type="number" min={1} max={9}
                                className={inputCls}
                                value={b.lie.wrongEvidenceLimit ?? 2}
                                onChange={(e) =>
                                  mutate((d) => {
                                    const s = d.scenes.find((x) => x.id === scene.id)!;
                                    s.dialogueBeats!.find((x) => x.id === b.id)!.lie!.wrongEvidenceLimit = Number(e.target.value) || 2;
                                  })
                                }
                              />
                            </Field>
                          </div>
                          <Field label="Bluff-called line (wrong evidence — defaults to a generic scoff)">
                            <CommitTextArea
                              className={`${inputCls} h-12 font-type`}
                              value={b.lie.wrongBeat?.text ?? ""}
                                ariaLabel={`Wrong evidence reply for beat ${b.id}`}
                              onCommit={(next) =>
                                mutateLatest((d) => {
                                  if (d.id !== story.id) return;
                                  const lie = d.scenes.find((x) => x.id === scene.id)?.dialogueBeats?.find((x) => x.id === b.id)?.lie;
                                  if (!lie) return;
                                  if (next.trim()) {
                                    lie.wrongBeat = lie.wrongBeat ?? { id: `b_${uid()}`, characterId: b.characterId, text: "" };
                                    lie.wrongBeat.text = next;
                                  } else {
                                    lie.wrongBeat = undefined;
                                  }
                                })
                              }
                            />
                          </Field>
                          <div className="grid grid-cols-2 gap-1">
                            <Field label="Correct-catch consequences (trust + / heat − / flags)">
                              <LieConsequences
                                lie={b.lie}
                                field="contradictedConsequences"
                                story={story}
                                onChange={(cons) =>
                                  mutate((d) => {
                                    const s = d.scenes.find((x) => x.id === scene.id)!;
                                    s.dialogueBeats!.find((x) => x.id === b.id)!.lie!.contradictedConsequences = cons;
                                  })
                                }
                              />
                            </Field>
                            <Field label="Bluff-called consequences (heat + / trust −)">
                              <LieConsequences
                                lie={b.lie}
                                field="wrongConsequences"
                                story={story}
                                onChange={(cons) =>
                                  mutate((d) => {
                                    const s = d.scenes.find((x) => x.id === scene.id)!;
                                    s.dialogueBeats!.find((x) => x.id === b.id)!.lie!.wrongConsequences = cons;
                                  })
                                }
                              />
                            </Field>
                          </div>
                          <button
                            onClick={() =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.dialogueBeats!.find((x) => x.id === b.id)!.lie = undefined;
                              })
                            }
                            className="w-full border border-crimson/40 py-1 font-pulp text-[9px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
                          >
                            ✕ Remove the lie
                          </button>
                        </div>
                      )}
                    </CollapsibleSection>
                    </CollapsibleSection>
                  );
                })}
                <button
                  onClick={() => {
                    const id = `b_${uid()}`;
                    mutate((d) => {
                      const s = d.scenes.find((x) => x.id === scene.id)!;
                      s.dialogueBeats = s.dialogueBeats ?? [];
                      s.dialogueBeats.push({
                        id,
                        characterId: story.characters[0]?.id ?? "narrator",
                        text: "New line of smoky dialogue...",
                      });
                    });
                    // The fresh beat becomes the one maximised card (and folds
                    // whatever was open), so the author lands straight in it.
                    setExpandedBeatId(id);
                    setFocusedBeatId(id);
                    window.setTimeout(() => setFocusedBeatId(null), 1600);
                  }}
                  className="w-full border border-cyan-neon/50 py-1.5 font-pulp text-[10px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
                >
                  ＋ Add dialogue beat
                </button>
              </>
            )}

            {scene && scene.nodeType !== "note" && tab === "hotspots" && (
              <>
                <HelpNote id="hotspots-tab" title="Clickable spots on the picture">
                  Drag a box on the preview. That's something the player can click. Pick what happens: go to another
                  room, give an item, set a flag, show text, change a meter, open the corkboard, or use an item. Only{" "}
                  <b>go to scene</b> / <b>use item</b> need a target — a give-item hotspot stays in place (that's how
                  you build safes). Add <b>gating</b> to lock it. An <b>object image</b> (a transparent PNG) is drawn
                  inside the zone.
                </HelpNote>
                {scene.nodeType === "stage" ? (
                  <div className="flex items-center gap-1">
                    <span className="font-pulp text-[9px] uppercase tracking-widest text-paper/40">Draw</span>
                    <button
                      className={`border px-2 py-0.5 font-pulp text-[9px] uppercase tracking-widest ${
                        zoneMode === "spawn" ? "border-cyan-neon bg-cyan-neon/15 text-cyan-neon" : "border-noir-600 text-paper/50"
                      }`}
                      onClick={() => setZoneMode("spawn")}
                      title="Where the player character starts — click or drag on the plate"
                    >
                      🚶 Player start
                    </button>
                    <button
                      className={`border px-2 py-0.5 font-pulp text-[9px] uppercase tracking-widest ${
                        zoneMode === "hotspot" ? "border-neon bg-neon/15 text-neon" : "border-noir-600 text-paper/50"
                      }`}
                      onClick={() => setZoneMode("hotspot")}
                    >
                      ⌖ Hotspots
                    </button>
                    <button
                      className={`border px-2 py-0.5 font-pulp text-[9px] uppercase tracking-widest ${
                        zoneMode === "barrier" ? "border-crimson bg-crimson/15 text-crimson" : "border-noir-600 text-paper/50"
                      }`}
                      onClick={() => setZoneMode("barrier")}
                      title="No-go areas: walls, counters, furniture the walker must route around"
                    >
                      🚧 Barriers (no-go)
                    </button>
                    <button
                      className={`border px-2 py-0.5 font-pulp text-[9px] uppercase tracking-widest ${
                        zoneMode === "behind" ? "border-violet-400 bg-violet-400/15 text-violet-300" : "border-noir-600 text-paper/50"
                      }`}
                      onClick={() => setZoneMode("behind")}
                      title="Walk-behinds: draw around a desk or counter that's painted into the background and the walker is covered when they stand behind it"
                    >
                      🪟 Walk-behinds
                    </button>
                  </div>
                ) : null}
                <p className="font-type text-[11px] text-paper/60">
                  {zoneMode === "spawn" && scene.nodeType === "stage"
                    ? "Click or drag on the plate to place the PLAYER CHARACTER — they stand where you drop them, clamped to the walkable floor."
                    : zoneMode === "barrier" && scene.nodeType === "stage"
                      ? "Drag on empty plate to fence off a NEW no-go area — a wall, a counter, a parked truck; the walker routes around it. Drag a barrier to MOVE it, and pull the square handles on the selected one to RESIZE."
                      : zoneMode === "behind" && scene.nodeType === "stage"
                        ? "Drag around something ALREADY PAINTED INTO THE BACKGROUND — a desk, a counter, a parked car — and the walker is covered by it when they stand behind it. No extra art needed: the region redraws the room's own background. The dashed line is the depth line; feet above it = behind. Select a region to get CORNER HANDLES — drag them to reshape, click a small edge dot to add a corner (an L-shaped counter), double-click a corner to remove it."
                        : "Drag on empty plate to draw a NEW hotspot. Drag an existing hotspot to MOVE it, and pull the square handles on the selected one to RESIZE. (Drawing a fresh box while one is selected also reshapes it.)"}
                </p>
                {zoneMode === "behind" && scene.nodeType === "stage"
                  ? (() => {
                      const occ = scene.stage?.occluders ?? [];
                      const setOcc = (list: typeof occ) =>
                        updateScene(scene.id, {
                          stage: { ...(scene.stage ?? {}), occluders: list.length ? list : undefined },
                        });
                      return (
                        <div className="space-y-1 border border-violet-400/30 bg-violet-400/5 p-2">
                          <div className="font-pulp text-[9px] uppercase tracking-widest text-violet-300">
                            🪟 Walk-behinds ({occ.length})
                          </div>
                          <p className="font-type text-[9px] leading-snug text-paper/45">
                            Something painted into the plate that the character can stand BEHIND. The region
                            redraws the room's own background clipped to your shape, so it lines up with the art
                            perfectly and needs no separate cutout. Purely visual — add a 🚧 barrier over the same
                            shape if it should also stop the walker.
                          </p>
                          {occ.length === 0 ? (
                            <p className="font-type text-[9px] text-paper/45">
                              None yet — drag around the desk on the plate.
                            </p>
                          ) : null}
                          {occ.map((o, oi) => {
                            const ys = o.points.map((p) => p.y);
                            const autoBase = Math.max(...ys, 0);
                            const base = o.baseline ?? autoBase;
                            const patch = (d: Partial<typeof o>) => setOcc(occ.map((x, j) => (j === oi ? { ...x, ...d } : x)));
                            return (
                              <div key={o.id ?? oi} className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <button
                                    className={`flex-1 border px-1.5 py-0.5 text-left font-type text-[10px] ${
                                      selectedOccluder === oi
                                        ? "border-violet-400 bg-violet-400/15 text-violet-300"
                                        : "border-noir-700 text-paper/60"
                                    }`}
                                    onClick={() => setSelectedOccluder(selectedOccluder === oi ? null : oi)}
                                  >
                                    🪟 {o.label ?? `region ${oi + 1}`} — {o.points.length} pts, depth {Math.round(base)}%
                                    {o.visible === false ? " (hidden)" : ""}
                                  </button>
                                  <button
                                    className="shrink-0 px-1 font-pulp text-[9px] text-crimson"
                                    title="Remove this walk-behind"
                                    onClick={() => {
                                      setOcc(occ.filter((_, j) => j !== oi));
                                      setSelectedOccluder(null);
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                                {selectedOccluder === oi ? (
                                  <div className="space-y-1 border border-violet-400/20 bg-violet-400/5 p-1">
                                    <input
                                      className="w-full border border-noir-700 bg-noir-950 px-1 py-0.5 font-type text-[10px] text-paper"
                                      placeholder="what is it? (the sergeant's desk)"
                                      value={o.label ?? ""}
                                      onChange={(e) => patch({ label: e.target.value || undefined })}
                                    />
                                    <label className="flex items-center gap-1 font-type text-[9px] text-paper/60">
                                      <span className="shrink-0">Depth line</span>
                                      <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        step={0.5}
                                        value={base}
                                        onChange={(e) => patch({ baseline: Number(e.target.value) })}
                                        className="flex-1"
                                      />
                                      <span className="w-8 shrink-0 text-right tabular-nums">{Math.round(base)}%</span>
                                    </label>
                                    <p className="font-type text-[9px] leading-snug text-paper/45">
                                      The walker is covered while their feet are ABOVE this line. Defaults to the
                                      shape's front edge ({Math.round(autoBase)}%), which is usually right.
                                      {o.baseline !== undefined ? (
                                        <button
                                          className="ml-1 underline hover:text-violet-300"
                                          onClick={() => patch({ baseline: undefined })}
                                        >
                                          reset to front edge
                                        </button>
                                      ) : null}
                                    </p>
                                    <label className="flex items-center gap-1 font-type text-[9px] text-paper/60">
                                      <input
                                        type="checkbox"
                                        checked={o.visible !== false}
                                        onChange={(e) => patch({ visible: e.target.checked ? undefined : false })}
                                      />
                                      Visible in play
                                    </label>
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  : null}
                {zoneMode === "barrier" && scene.nodeType === "stage"
                  ? (() => {
                      const obs = scene.stage?.obstacles ?? [];
                      const setObs = (list: { x: number; y: number; w: number; h: number }[]) =>
                        updateScene(scene.id, { stage: { ...(scene.stage ?? {}), obstacles: list.length ? list : undefined } });
                      return (
                        <div className="space-y-1 border border-crimson/30 bg-crimson/5 p-2">
                          <div className="font-pulp text-[9px] uppercase tracking-widest text-crimson">
                            🚧 No-go areas ({obs.length})
                          </div>
                          {obs.length === 0 ? (
                            <p className="font-type text-[9px] text-paper/45">
                              None yet — drag a box on the plate to fence something off.
                            </p>
                          ) : null}
                          {obs.map((o, oi) => (
                            <div key={oi} className="space-y-1">
                              <div className="flex items-center gap-1">
                                <button
                                  className={`flex-1 border px-1.5 py-0.5 text-left font-type text-[10px] ${
                                    selectedBarrier === oi ? "border-crimson bg-crimson/15 text-crimson" : "border-noir-700 text-paper/60"
                                  }`}
                                  onClick={() => setSelectedBarrier(selectedBarrier === oi ? null : oi)}
                                >
                                  🚧 {Math.round(o.x)},{Math.round(o.y)} — {Math.round(o.w)}×{Math.round(o.h)}%{o.gating ? " 🚪" : ""}
                                </button>
                                <button
                                  className="shrink-0 px-1 font-pulp text-[9px] text-crimson"
                                  title="Remove this barrier"
                                  onClick={() => {
                                    setObs(obs.filter((_, j) => j !== oi));
                                    setSelectedBarrier(null);
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                              {selectedBarrier === oi ? (
                                <div className="border border-crimson/20 bg-crimson/5 p-1">
                                  <p className="font-type text-[9px] leading-snug text-paper/45">
                                    🚪 <b className="text-crimson">Door:</b> give the barrier a gate and it blocks only
                                    while the gate is SHUT — the moment it opens (a flag set by a key hotspot, a
                                    conversation, a state's action) the walker can pass through. A barrier with no gate
                                    always blocks (furniture).
                                  </p>
                                  <GatingEditor
                                    gating={o.gating}
                                    onChange={(g) => setObs(obs.map((b, j) => (j === oi ? { ...b, gating: g } : b)))}
                                    items={story.items}
                                    characters={story.characters}
                                    flags={allFlags}
                                    sectionId={`stage-barrier-${scene.id}-${oi}`}
                                  />
                                </div>
                              ) : null}
                            </div>
                          ))}
                          <button
                            className="w-full border border-crimson/40 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
                            onClick={() => {
                              setObs([...obs, { x: 40, y: 68, w: 18, h: 12 }]);
                              setSelectedBarrier(obs.length);
                            }}
                          >
                            ＋ add barrier
                          </button>
                        </div>
                      );
                    })()
                  : null}
                <HotspotCanvas
                  scene={scene}
                  items={story.items}
                  selectedId={selectedHotspot}
                  media={media}
                  barrierMode={zoneMode === "barrier" && scene.nodeType === "stage"}
                  behindMode={zoneMode === "behind" && scene.nodeType === "stage"}
                  occluders={scene.stage?.occluders ?? []}
                  selectedOccluder={selectedOccluder}
                  onOccluderSelect={(i) => setSelectedOccluder(i)}
                  onOccluderPoints={(i, points) => {
                    const list = scene.stage?.occluders ?? [];
                    if (!list[i]) return;
                    updateScene(scene.id, {
                      stage: {
                        ...(scene.stage ?? {}),
                        occluders: list.map((o, j) => (j === i ? { ...o, points } : o)),
                      },
                    });
                  }}
                  onOccluderDraw={(b) => {
                    // A dragged rectangle becomes a four-point shape; the
                    // author refines the corners in the list below.
                    const list = scene.stage?.occluders ?? [];
                    const shape = {
                      id: `occ_${Math.random().toString(36).slice(2, 7)}`,
                      points: [
                        { x: b.x, y: b.y },
                        { x: b.x + b.w, y: b.y },
                        { x: b.x + b.w, y: b.y + b.h },
                        { x: b.x, y: b.y + b.h },
                      ],
                    };
                    const next =
                      selectedOccluder !== null && list[selectedOccluder]
                        ? list.map((o, j) => (j === selectedOccluder ? { ...o, points: shape.points } : o))
                        : [...list, shape];
                    updateScene(scene.id, { stage: { ...(scene.stage ?? {}), occluders: next } });
                    if (selectedOccluder === null) setSelectedOccluder(next.length - 1);
                  }}
                  spawnMode={zoneMode === "spawn" && scene.nodeType === "stage"}
                  spawn={scene.stage?.spawn ?? { x: 50, y: 88 }}
                  player={{
                    image: scene.stage?.playerImage ?? story.playerSprite?.image,
                    sheet: scene.stage?.playerSheet ?? story.playerSprite?.sheet,
                    ...(scene.stage?.playerScale ? { scale: scene.stage.playerScale } : {}),
                  }}
                  onSpawnMove={(p) => {
                    const floor = stageFloorOf(scene.stage);
                    updateScene(scene.id, {
                      stage: {
                        ...(scene.stage ?? {}),
                        spawn: { x: p.x, y: clamp(p.y, floor.top, floor.bottom) },
                      },
                    });
                  }}
                  stageNpcs={scene.nodeType === "stage" ? (scene.stage?.npcs ?? []) : []}
                  barriers={scene.stage?.obstacles ?? []}
                  selectedBarrier={selectedBarrier}
                  onBarrierSelect={(i) => setSelectedBarrier(i)}
                  onBarrierDraw={(bounds) => {
                    const obs = scene.stage?.obstacles ?? [];
                    const next =
                      selectedBarrier !== null && obs[selectedBarrier]
                        ? obs.map((o, j) => (j === selectedBarrier ? bounds : o))
                        : [...obs, bounds];
                    updateScene(scene.id, { stage: { ...(scene.stage ?? {}), obstacles: next } });
                    if (selectedBarrier === null) setSelectedBarrier(next.length - 1);
                  }}
                  onBarrierMove={(i, bounds) => {
                    const obs = scene.stage?.obstacles ?? [];
                    if (!obs[i]) return;
                    updateScene(scene.id, {
                      stage: { ...(scene.stage ?? {}), obstacles: obs.map((o, j) => (j === i ? bounds : o)) },
                    });
                  }}
                  onSelect={(id) => {
                    setSelectedHotspot(id);
                    if (id) setSelectedBarrier(null);
                  }}
                  onDraw={(bounds) => {
                    if (selectedHotspot && scene.hotspots?.some((h) => h.id === selectedHotspot)) {
                      mutate((d) => {
                        const s = d.scenes.find((x) => x.id === scene.id)!;
                        s.hotspots!.find((h) => h.id === selectedHotspot)!.bounds = bounds;
                      });
                    } else {
                      const id = `hs_${uid()}`;
                      mutate((d) => {
                        const s = d.scenes.find((x) => x.id === scene.id)!;
                        s.hotspots = s.hotspots ?? [];
                        s.hotspots.push({
                          id,
                          label: "New hotspot",
                          bounds,
                          cursor: "look",
                          isRepeatable: true,
                          action: { type: "showText", text: "You see something interesting." },
                        });
                      });
                      setSelectedHotspot(id);
                    }
                  }}
                  onMove={(id, bounds) => {
                    mutate((d) => {
                      const s = d.scenes.find((x) => x.id === scene.id)!;
                      const h = s.hotspots?.find((x) => x.id === id);
                      if (h) h.bounds = bounds;
                    });
                  }}
                />
                {(scene.hotspots ?? []).map((h) => {
                  // Does this object hand anything over? Its own action OR any
                  // multi-state override — the 🖼 "show the item's image"
                  // toggle used to test only h.action.itemGranted, so it went
                  // missing on exactly the objects that change with the story
                  // (a drawer that is empty until a later state fills it).
                  const itemGrantedHere =
                    !!h.action.itemGranted ||
                    (h.states ?? []).some((st) => !!st.action?.itemGranted) ||
                    (h.action.then ?? []).some((c) => !!c.itemGranted);
                  return (
                  <div key={h.id} onClick={() => setSelectedHotspot(h.id)}>
                    <CollapsibleSection
                      id={`hotspot-${h.id}`}
                      title={<span>⌖ {h.label || "Hotspot"}{(h.states?.length ?? 0) > 0 ? ` 🔁${h.states!.length}` : ""}</span>}
                      titleClass="text-gold"
                      defaultOpen={selectedHotspot === h.id}
                      className={`border ${selectedHotspot === h.id ? "border-neon" : "border-noir-600"}`}
                      headerRight={
                        <button
                          className="text-[10px] text-crimson hover:underline"
                          onClick={() =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.hotspots = s.hotspots?.filter((x) => x.id !== h.id);
                            })
                          }
                          title="Delete this hotspot"
                        >
                          ✕
                        </button>
                      }
                    >
                    <div className="grid grid-cols-2 gap-1">
                      <Field label="Label">
                        <input
                          className={inputCls}
                          value={h.label}
                          onChange={(e) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.hotspots!.find((x) => x.id === h.id)!.label = e.target.value;
                            })
                          }
                        />
                      </Field>
                      <Field label="Cursor">
                        <select
                          className={inputCls}
                          value={h.cursor}
                          onChange={(e) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.hotspots!.find((x) => x.id === h.id)!.cursor = e.target.value as CursorKind;
                            })
                          }
                        >
                          {VERB_IDS.map((c) => (
                            <option key={c} value={c}>
                              {VERB_ICON[c]} {VERB_LABEL[c]}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label="Zone bounds — X · Y · W · H (%) — or drag/resize it on the plate above">
                      <div className="grid grid-cols-4 gap-1">
                        {(["x", "y", "w", "h"] as const).map((k) => (
                          <input
                            key={k}
                            type="number"
                            step={0.1}
                            min={0}
                            className={inputCls}
                            title={{ x: "Left edge %", y: "Top edge %", w: "Width %", h: "Height %" }[k]}
                            value={h.bounds[k]}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                const hs = s.hotspots!.find((x) => x.id === h.id)!;
                                hs.bounds = { ...hs.bounds, [k]: Math.max(0, Number(e.target.value) || 0) };
                              })
                            }
                          />
                        ))}
                      </div>
                    </Field>
                    <div className="grid grid-cols-2 gap-1">
                      <Field label="Action type">
                        <select
                          className={inputCls}
                          value={h.action.type}
                          onChange={(e) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.hotspots!.find((x) => x.id === h.id)!.action.type = e.target.value as never;
                            })
                          }
                        >
                          {[
                            { v: "goToScene", label: "→ Go to scene" },
                            { v: "giveItem", label: "🎁 Give item" },
                            { v: "useItem", label: "🗝 Use item (consumes)" },
                            { v: "setFlag", label: "🚩 Set flag" },
                            { v: "showText", label: "💬 Show text" },
                            { v: "openBoard", label: "📌 Open corkboard" },
                            { v: "openMap", label: "🗺 Open travel map" },
                            { v: "patternPuzzle", label: "🔍 Pattern puzzle" },
                            { v: "arcadeGame", label: "🕹 Arcade cabinet" },
                            { v: "startDialogue", label: "🗣 Start conversation (stage)" },
                            { v: "setPlayerPose", label: "🧍 Set player pose (stage)" },
                            { v: "runScript", label: "🎬 Run scripted sequence (stage)" },
                          ].map((t) => (
                            <option key={t.v} value={t.v}>{t.label}</option>
                          ))}
                        </select>
                      </Field>
                    {(() => {
                      // The destination control only exists where a scene jump
                      // can actually happen: → goToScene always; 🗝 use-item
                      // when it carries one (a locked door that swings open).
                      const canTravel = h.action.type === "goToScene" || h.action.type === "useItem";
                      const needsTarget = h.action.type === "goToScene" && !h.action.targetSceneId;
                      if (!canTravel && !h.action.targetSceneId) return null;
                      return (
                        <Field label="🗺 Target scene — where this goes">
                          <select
                            className={`${inputCls} ${needsTarget ? "border-crimson/70 text-crimson" : ""}`}
                            value={h.action.targetSceneId ?? ""}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.hotspots!.find((x) => x.id === h.id)!.action.targetSceneId = e.target.value || undefined;
                              })
                            }
                          >
                            <option value="">{needsTarget ? "⚠ pick a scene…" : "— nowhere —"}</option>
                            {story.scenes.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.title}
                              </option>
                            ))}
                          </select>
                          {needsTarget && (
                            <p className="mt-1 font-type text-[9px] leading-snug text-crimson/90">
                              A → go-to-scene marker without a target does nothing (the validator errors on it too).
                            </p>
                          )}
                        </Field>
                      );
                    })()}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <Field label="Object image (transparent)">
                        <ImagePicker
                          value={h.image}
                          onChange={(v) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.hotspots!.find((x) => x.id === h.id)!.image = v;
                            })
                          }
                          storyId={story.id}
                          includeGradients={false}
                          placeholder="Pick an object image…"
                        />
                        <div className="mt-1 flex gap-1">
                          <MediaUploadButton
                            storyId={story.id}
                            accept="image/*"
                            label="⇧ Upload PNG"
                            onUploaded={(_url, assetId) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.hotspots!.find((x) => x.id === h.id)!.image = `asset:${assetId}`;
                              })
                            }
                          />
                          {h.image && (
                            <button
                              onClick={() =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  const hs = s.hotspots!.find((x) => x.id === h.id)!;
                                  hs.image = undefined;
                                  hs.imageFit = undefined;
                                })
                              }
                              className="border border-crimson/40 px-2 py-1 font-pulp text-[10px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
                            >
                              ✕ Remove
                            </button>
                          )}
                        </div>
                        <p className="mt-1 font-type text-[9px] leading-snug text-paper/40">
                          Transparent PNG/WebP of the object — the zone's bounds are its frame, so drag the zone to
                          position and scale it. It zooms with the scene and vanishes when the zone is used.
                        </p>
                      </Field>
                      <div className="flex flex-col gap-1">
                        <Field label="Image fit">
                          <select
                            className={inputCls}
                            value={h.imageFit ?? "contain"}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.hotspots!.find((x) => x.id === h.id)!.imageFit = e.target.value as "contain" | "cover";
                              })
                            }
                          >
                            <option value="contain">contain — whole object</option>
                            <option value="cover">cover — fill the zone</option>
                          </select>
                        </Field>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <Field label="Grants item">
                        <select
                          className={inputCls}
                          value={h.action.itemGranted ?? ""}
                          onChange={(e) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.hotspots!.find((x) => x.id === h.id)!.action.itemGranted = e.target.value || undefined;
                            })
                          }
                        >
                          <option value="">—</option>
                          {story.items.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.icon} {i.name}
                            </option>
                          ))}
                        </select>
                        {/* Per-hotspot, and shown HERE rather than 1,300 lines
                            further down the inspector: this only means anything
                            for the item chosen directly above it, and readers
                            of the old layout reasonably took a lone checkbox
                            floating among the scene-wide toggles for a global
                            setting. It has always written h.showItemImage on
                            this one hotspot. */}
                        {itemGrantedHere && (
                          <label className="mt-1 flex items-start gap-2 text-[10px] uppercase tracking-wider text-paper/60">
                            <input
                              type="checkbox"
                              className="mt-0.5"
                              checked={!!h.showItemImage}
                              onChange={(e) =>
                                mutate((d) => {
                                  const sc2 = d.scenes.find((x) => x.id === scene.id)!;
                                  sc2.hotspots!.find((x) => x.id === h.id)!.showItemImage = e.target.checked;
                                })
                              }
                            />
                            <span>🖼 show this item&apos;s image in the scene (players see the object to grab)</span>
                          </label>
                        )}
                      </Field>
                      <Field label="Sets flag">
                        <FlagInput
                          value={h.action.flagSet}
                          suggestions={allFlags}
                          onChange={(v) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.hotspots!.find((x) => x.id === h.id)!.action.flagSet = v;
                            })
                          }
                        />
                      </Field>
                    </div>
                    {/* ---- VERB COIN: what else this object answers to ---- */}
                    {(() => {
                      const hsSet = (patch: Partial<Hotspot>) =>
                        mutate((d) => {
                          const s = d.scenes.find((x) => x.id === scene.id)!;
                          Object.assign(s.hotspots!.find((x) => x.id === h.id)!, patch);
                        });
                      const verbs = h.verbs ?? {};
                      const used = Object.keys(verbs) as (typeof VERB_IDS)[number][];
                      const setVerbAction = (v: string, action: Hotspot["action"]) =>
                        hsSet({ verbs: { ...verbs, [v]: { ...(verbs as Record<string, Hotspot["action"]>)[v], ...action } } });
                      const dropVerb = (v: string) => {
                        const next: Record<string, Hotspot["action"]> = { ...verbs };
                        delete next[v];
                        hsSet({ verbs: Object.keys(next).length ? (next as Hotspot["verbs"]) : undefined });
                      };
                      const accepts = h.acceptsItems ?? [];
                      const toggleAccept = (id: string) =>
                        hsSet({ acceptsItems: accepts.includes(id) ? accepts.filter((x) => x !== id) : [...accepts, id] });
                      const setResponse = (id: string, text: string) =>
                        hsSet({ itemResponses: { ...(h.itemResponses ?? {}), [id]: text } });
                      const setItemAudio = (id: string, url?: string) => {
                        const map = { ...(h.itemAudio ?? {}) };
                        if (url) map[id] = url;
                        else delete map[id];
                        hsSet({ itemAudio: Object.keys(map).length ? map : undefined });
                      };
                      const unsetVerbs = VERB_IDS.filter((v) => !used.includes(v));
                      const actType = (v: string) => (verbs as Record<string, Hotspot["action"]>)[v]?.type ?? "showText";
                      return (
                        <div className="space-y-1 border border-gold/30 bg-gold/5 p-2">
                          <div className="font-pulp text-[9px] uppercase tracking-widest text-gold">🎚 Verb coin — other verbs</div>
                          <p className="font-type text-[9px] leading-snug text-paper/45">
                            What this object says when the player uses a DIFFERENT verb on it (the action above is the
                            default, and is what plays with the coin off). Verb actions are repeatable — looking at a
                            thing never uses it up. Anything not listed gets the story's "that doesn't work" line.
                          </p>
                          {used.map((v) => {
                            const a = (verbs as Record<string, Hotspot["action"]>)[v];
                            return (
                              <div key={v} className="space-y-1 border border-noir-700/60 p-1">
                                <div className="flex items-center gap-1">
                                  <span className="w-14 shrink-0 font-pulp text-[9px] uppercase tracking-widest text-gold/80">
                                    <span aria-hidden>{VERB_ICON[v]}</span> {v}
                                  </span>
                                  <select
                                    className={inputCls}
                                    value={actType(v)}
                                    onChange={(e) => {
                                      const ty = e.target.value as Hotspot["action"]["type"];
                                      const base: Hotspot["action"] =
                                        ty === "showText" ? { type: "showText", text: "" }
                                        : ty === "giveItem" ? { type: "giveItem", itemGranted: undefined }
                                        : ty === "goToScene" ? { type: "goToScene", targetSceneId: undefined }
                                        : ty === "useItem" ? { type: "useItem", itemConsumed: undefined }
                                        : ty === "setPlayerPose" ? { type: "setPlayerPose", playerPose: "" }
                                        : ty === "runScript" ? { type: "runScript", script: [] }
                                        : { type: "showText", text: "" };
                                      setVerbAction(v, base);
                                    }}
                                  >
                                    <option value="showText">💬 Say a line</option>
                                    <option value="giveItem">🎁 Give item</option>
                                    <option value="goToScene">→ Go to scene</option>
                                    <option value="useItem">🗝 Use item (consumes it)</option>
                                    <option value="setPlayerPose">🧍 Set player pose (stage)</option>
                                    <option value="runScript">🎬 Run scripted sequence (stage)</option>
                                  </select>
                                  <button className="shrink-0 px-1 font-pulp text-[9px] text-crimson" title="Remove this verb" onClick={() => dropVerb(v)}>✕</button>
                                </div>
                                {a?.type === "showText" ? (
                                  <textarea
                                    className={`${inputCls} h-14 font-type`}
                                    placeholder="What it says…"
                                    value={a.text ?? ""}
                                    onChange={(e) => setVerbAction(v, { ...a, text: e.target.value })}
                                  />
                                ) : null}
                                {a?.type === "giveItem" ? (
                                  <select className={inputCls} value={a.itemGranted ?? ""} onChange={(e) => setVerbAction(v, { ...a, itemGranted: e.target.value || undefined })}>
                                    <option value="">— pick an item —</option>
                                    {story.items.map((it) => (<option key={it.id} value={it.id}>{it.icon} {it.name}</option>))}
                                  </select>
                                ) : null}
                                {a?.type === "goToScene" ? (
                                  <select className={inputCls} value={a.targetSceneId ?? ""} onChange={(e) => setVerbAction(v, { ...a, targetSceneId: e.target.value || undefined })}>
                                    <option value="">— pick a scene —</option>
                                    {story.scenes.map((s) => (<option key={s.id} value={s.id}>{s.title}</option>))}
                                  </select>
                                ) : null}
                                {a?.type === "useItem" ? (
                                  <>
                                    <textarea
                                      className={`${inputCls} h-14 font-type`}
                                      placeholder="The line it says when the item is used…"
                                      value={a.text ?? ""}
                                      onChange={(e) => setVerbAction(v, { ...a, text: e.target.value })}
                                    />
                                    <select className={inputCls} value={a.itemConsumed ?? ""} onChange={(e) => setVerbAction(v, { ...a, itemConsumed: e.target.value || undefined })}>
                                      <option value="">— consumes nothing (a say-a-line use) —</option>
                                      {story.items.map((it) => (<option key={it.id} value={it.id}>{it.icon} {it.name}</option>))}
                                    </select>
                                    <p className="font-type text-[8px] leading-snug text-paper/40">
                                      Only the item picked above ever leaves the satchel — arming an item never
                                      consumes it on its own.
                                    </p>
                                  </>
                                ) : null}
                                {a?.type === "setPlayerPose" ? (
                                  <>
                                    <input
                                      className={inputCls}
                                      value={a.playerPose ?? ""}
                                      placeholder="Pose — named animation, e.g. bend · crouch · lie"
                                      onChange={(e) => setVerbAction(v, { ...a, playerPose: e.target.value.trim() || undefined })}
                                    />
                                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60">
                                      <input
                                        type="checkbox"
                                        checked={!!a.playerPoseOnce}
                                        onChange={(e) => setVerbAction(v, { ...a, playerPoseOnce: e.target.checked || undefined })}
                                      />
                                      ▶ Play once, then revert
                                    </label>
                                    <p className="font-type text-[8px] leading-snug text-paper/40">
                                      The walker switches to this animation when the verb fires. Empty clears back to
                                      idle. 🚶 Walkable stages only.
                                    </p>
                                  </>
                                ) : null}
                                {a?.type === "runScript" ? (
                                  <>
                                    <p className="font-type text-[8px] leading-snug text-paper/40">
                                      Steps play IN ORDER with input locked and letterbox bars down.
                                      {scene.nodeType !== "stage" ? " ⚠ This scene is NOT a walkable stage — the script is ignored here." : ""}
                                    </p>
                                    <ScriptEditor
                                      steps={a.script ?? []}
                                      onChange={(next) => setVerbAction(v, { ...a, script: next.length ? next : undefined })}
                                      npcIds={(scene.stage?.npcs ?? []).map((n) => n.id)}
                                      scenes={story.scenes.map((s) => ({ id: s.id, title: s.title }))}
                                      onPickPoint={(index, npc) => {
                                        setScriptPick({ index, npc, origin: "verb", hotspotId: h.id, verb: v });
                                        setTab("stage");
                                      }}
                                      picking={scriptPick?.origin === "verb" && scriptPick.hotspotId === h.id && scriptPick.verb === v ? scriptPick : null}
                                    />
                                  </>
                                ) : null}
                                <div className="flex items-center gap-1">
                                  <span className="shrink-0 font-type text-[8px] uppercase tracking-wider text-paper/40">🚩 flag</span>
                                  <FlagInput
                                    value={a?.flagSet}
                                    suggestions={allFlags}
                                    onChange={(val) => setVerbAction(v, { ...a, flagSet: val || undefined })}
                                  />
                                </div>
                                {(a?.type === "showText" || a?.type === "useItem") && (
                                  <HotspotVoiceControls
                                    story={story}
                                    sceneId={scene.id}
                                    assetKey={`${h.id}-${v}`}
                                    line={a?.text ?? ""}
                                    value={a?.audioUrl}
                                    onChange={(url) => setVerbAction(v, { ...a, audioUrl: url })}
                                  />
                                )}
                              </div>
                            );
                          })}
                          {unsetVerbs.length ? (
                            <select
                              className={inputCls}
                              value=""
                              onChange={(e) => {
                                if (!e.target.value) return;
                                setVerbAction(e.target.value, { type: "showText", text: "" });
                              }}
                            >
                              <option value="">＋ add a verb action…</option>
                              {unsetVerbs.map((v) => (
                                <option key={v} value={v}>{VERB_ICON[v]} {VERB_LABEL[v]}</option>
                              ))}
                            </select>
                          ) : null}

                          {/* ---- items this object accepts (the USE verb) ---- */}
                          <div className="border-t border-gold/20 pt-1">
                            <div className="font-pulp text-[9px] uppercase tracking-widest text-gold/80">🎒 Accepts these items (USE)</div>
                            <p className="font-type text-[9px] leading-snug text-paper/45">
                              Tick what WORKS here. The player arms it in the coin and clicks this object; anything
                              else gets refused. Write the line it gets back — that's the joke, and the clue.
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {story.items.map((it) => {
                                const on = accepts.includes(it.id);
                                return (
                                  <button
                                    key={it.id}
                                    type="button"
                                    className={`border px-1.5 py-0.5 font-type text-[10px] ${on ? "border-gold bg-gold/20 text-gold" : "border-noir-700 text-paper/50"}`}
                                    onClick={() => toggleAccept(it.id)}
                                  >
                                    {it.icon} {it.name}
                                  </button>
                                );
                              })}
                            </div>
                            {accepts.map((id) => {
                              const it = story.items.find((x) => x.id === id);
                              return (
                                <div key={id} className="mt-1">
                                  <div className="font-pulp text-[9px] uppercase tracking-widest text-paper/40">
                                    {it?.icon} {it?.name ?? id} — line
                                  </div>
                                  <textarea
                                    className={`${inputCls} h-14 font-type`}
                                    placeholder="What happens when they use it here…"
                                    value={h.itemResponses?.[id] ?? ""}
                                    onChange={(e) => setResponse(id, e.target.value)}
                                  />
                                  <HotspotVoiceControls
                                    story={story}
                                    sceneId={scene.id}
                                    assetKey={`${h.id}-item-${id}`}
                                    line={h.itemResponses?.[id] ?? ""}
                                    value={h.itemAudio?.[id]}
                                    onChange={(url) => setItemAudio(id, url)}
                                  />
                                </div>
                              );
                            })}
                          </div>
                          <Field label="Refusal line (wrong verb / wrong item)">
                            <input
                              className={inputCls}
                              value={h.wrongVerbText ?? ""}
                              placeholder="Leave blank for the story's default"
                              onChange={(e) => hsSet({ wrongVerbText: e.target.value || undefined })}
                            />
                          </Field>
                        </div>
                      );
                    })()}

                    {/* ---- MULTI-STATE OBJECT: one marker that changes with the story ---- */}
                    {(() => {
                      const hsSetBase = (patch: Partial<Hotspot>) =>
                        mutate((d) => {
                          const s = d.scenes.find((x) => x.id === scene.id)!;
                          Object.assign(s.hotspots!.find((x) => x.id === h.id)!, patch);
                        });
                      const states = h.states ?? [];
                      const setStates = (next: Hotspot["states"]) =>
                        hsSetBase({ states: next?.length ? next : undefined });
                      const patchState = (idx: number, patch: Partial<HotspotState>) =>
                        setStates(states.map((st, i) => (i === idx ? { ...st, ...patch } : st)));
                      const addState = () =>
                        setStates([
                          ...states,
                          {
                            id: `st_${uid()}`,
                            when: { requiresFlags: [] },
                            label: "",
                          },
                        ]);
                      const moveState = (idx: number, dir: -1 | 1) => {
                        const j = idx + dir;
                        if (j < 0 || j >= states.length) return;
                        const next = [...states];
                        [next[idx], next[j]] = [next[j], next[idx]];
                        setStates(next);
                      };
                      return (
                        <CollapsibleSection
                          id={`hotspot-states-${h.id}`}
                          title={<span>🔁 States {states.length ? `· ${states.length}` : ""}</span>}
                          hint={states.length ? `${states.length} state${states.length > 1 ? "s" : ""}` : "one object, many faces"}
                          titleClass="text-cyan-neon"
                          className="border border-cyan-neon/30 bg-cyan-neon/5"
                        >
                          <p className="font-type text-[9px] leading-snug text-paper/45">
                            ONE marker that changes with the story — a lever up/down, a drawer full/empty, a door
                            locked/open — instead of stacking gated duplicate hotspots. States are checked in order and
                            the <b>last one whose gate passes wins</b>: list the unconditional default <b>first</b>,
                            then the specific ones. A state only overrides what you fill in (label / art / cursor /
                            action / gate); the object's zone, verbs and accepted items are shared. Typical pair: the
                            base object takes the thing and sets a flag; the flag-gated state re-skins the same marker
                            as the aftermath ("the empty bench hook").
                          </p>
                          {states.map((st, idx) => (
                            <div key={st.id} className="space-y-1 border border-noir-700/60 bg-noir-950/40 p-1.5">
                              <div className="flex items-center gap-1">
                                <span className="font-pulp text-[9px] uppercase tracking-widest text-cyan-neon/80">
                                  {idx + 1} · {st.when?.requiresFlags?.length || st.when?.requiresItems?.length || st.when?.requiresMemories?.length ? `after ${st.when?.requiresFlags?.[0] ?? st.when?.requiresItems?.[0] ?? "…"}` : "default (always)"}
                                </span>
                                <span className="flex-1" />
                                <button className="px-1 text-paper/50 hover:text-paper" title="Move up (earlier = less specific)" onClick={() => moveState(idx, -1)}>↑</button>
                                <button className="px-1 text-paper/50 hover:text-paper" title="Move down (later = wins over the ones above)" onClick={() => moveState(idx, 1)}>↓</button>
                                <button className="px-1 font-pulp text-[9px] text-crimson hover:underline" title="Remove this state" onClick={() => setStates(states.filter((_, i) => i !== idx))}>✕</button>
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <Field label="Label (blank = keep the object's)">
                                  <input
                                    className={inputCls}
                                    value={st.label ?? ""}
                                    placeholder={h.label}
                                    onChange={(e) => patchState(idx, { label: e.target.value || undefined })}
                                  />
                                </Field>
                                <Field label="Cursor (blank = keep)">
                                  <select
                                    className={inputCls}
                                    value={st.cursor ?? ""}
                                    onChange={(e) => patchState(idx, { cursor: (e.target.value || undefined) as HotspotState["cursor"] })}
                                  >
                                    <option value="">— keep the object's —</option>
                                    {VERB_IDS.map((c) => (
                                      <option key={c} value={c}>{VERB_ICON[c]} {VERB_LABEL[c]}</option>
                                    ))}
                                  </select>
                                </Field>
                              </div>
                              <Field label="Repetition in this state">
                                <select aria-label="State repetition" className={inputCls}
                                  value={st.isRepeatable === undefined ? "inherit" : st.isRepeatable ? "repeat" : "once"}
                                  onChange={e => patchState(idx, { isRepeatable: e.target.value === "inherit" ? undefined : e.target.value === "repeat" })}>
                                  <option value="inherit">Inherit the object's setting</option>
                                  <option value="repeat">Repeatable (no replayable rewards)</option>
                                  <option value="once">One-shot (showText still repeats)</option>
                                </select>
                              </Field>
                              <Field label="Object image in this state (blank = keep · 'none' = no art)">
                                <ImagePicker
                                  value={st.image ?? ""}
                                  onChange={(v) => patchState(idx, { image: v === undefined ? undefined : v || "" })}
                                  storyId={story.id}
                                  includeGradients={false}
                                  placeholder="Pick the state's art…"
                                />
                                <div className="mt-1 flex gap-1">
                                  {st.image ? (
                                    <>
                                      {st.image !== "" && (
                                        <button
                                          className="border border-cyan-neon/40 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
                                          onClick={() => patchState(idx, { image: "" })}
                                        >
                                          ◻ No art in this state
                                        </button>
                                      )}
                                      <button
                                        className="border border-crimson/40 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
                                        onClick={() => patchState(idx, { image: undefined })}
                                      >
                                        ✕ Keep the object's art
                                      </button>
                                    </>
                                  ) : null}
                                </div>
                              </Field>
                              <GatingEditor
                                gating={st.when}
                                onChange={(g) => patchState(idx, { when: g })}
                                items={story.items}
                                characters={story.characters}
                                flags={allFlags}
                                sectionId={`hsstate-when-${h.id}-${st.id}`}
                              />
                                <Field label="Accepted items in this state">
                                  <select className={inputCls}
                                    value={st.acceptsItems === undefined ? "inherit" : st.acceptsItems?.length ? "custom" : "none"}
                                    onChange={(e) => patchState(idx, { acceptsItems: e.target.value === "inherit" ? undefined : e.target.value === "none" ? null : story.items[0] ? [story.items[0].id] : [] })}>
                                    <option value="inherit">Inherit the object's items</option>
                                    <option value="none">No item needed — act directly</option>
                                    <option value="custom" disabled={!story.items.length}>Different accepted items</option>
                                  </select>
                                  {!!st.acceptsItems?.length && <select multiple aria-label="Accepted state items" className={inputCls}
                                    value={st.acceptsItems}
                                    onChange={(e) => patchState(idx, { acceptsItems: [...e.target.selectedOptions].map((o) => o.value) })}>
                                    {story.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                                  </select>}
                                </Field>
                              {/* ---- the state's ACTION override ---- */}
                              <div className="space-y-1 border border-gold/20 bg-gold/5 p-1.5">
                                <div className="flex items-center gap-1">
                                  <span className="font-pulp text-[9px] uppercase tracking-widest text-gold/80">⚙ Action in this state</span>
                                  <span className="flex-1" />
                                  {st.action ? (
                                    <button
                                      className="px-1 font-pulp text-[9px] text-crimson hover:underline"
                                      onClick={() => patchState(idx, { action: undefined })}
                                    >
                                      ✕ keep the object's action
                                    </button>
                                  ) : null}
                                </div>
                                <select
                                  className={inputCls}
                                  value={st.action?.type ?? ""}
                                  onChange={(e) => {
                                    if (!e.target.value) { patchState(idx, { action: undefined }); return; }
                                    const ty = e.target.value as HotspotAction["type"];
                                    patchState(idx, {
                                      action:
                                        ty === "showText" ? { type: "showText", text: "" }
                                        : ty === "giveItem" ? { type: "giveItem", itemGranted: undefined }
                                        : ty === "goToScene" ? { type: "goToScene", targetSceneId: undefined }
                                        : ty === "useItem" ? { type: "useItem", itemConsumed: undefined }
                                        : ty === "setFlag" ? { type: "setFlag", flagSet: "" }
                                        : { type: "showText", text: "" },
                                    });
                                  }}
                                >
                                  <option value="">— keep the object's action —</option>
                                  <option value="showText">💬 Say a line</option>
                                  <option value="giveItem">🎁 Give item</option>
                                  <option value="goToScene">→ Go to scene</option>
                                  <option value="useItem">🗝 Use item (consumes it)</option>
                                  <option value="setFlag">🚩 Set flag</option>
                                  <option value="startDialogue">🗣 Start conversation (stage)</option>
                                </select>
                                {st.action?.type === "showText" || st.action?.type === "useItem" ? (
                                  <textarea
                                    className={`${inputCls} h-14 font-type`}
                                    placeholder="What it says in this state…"
                                    value={st.action.text ?? ""}
                                    onChange={(e) => patchState(idx, { action: { ...st.action!, text: e.target.value } })}
                                  />
                                ) : null}
                                {st.action?.type === "giveItem" ? (
                                  <select
                                    className={inputCls}
                                    value={st.action.itemGranted ?? ""}
                                    onChange={(e) => patchState(idx, { action: { ...st.action!, itemGranted: e.target.value || undefined } })}
                                  >
                                    <option value="">— pick an item —</option>
                                    {story.items.map((it) => (<option key={it.id} value={it.id}>{it.icon} {it.name}</option>))}
                                  </select>
                                ) : null}
                                {st.action?.type === "goToScene" ? (
                                  <select
                                    className={inputCls}
                                    value={st.action.targetSceneId ?? ""}
                                    onChange={(e) => patchState(idx, { action: { ...st.action!, targetSceneId: e.target.value || undefined } })}
                                  >
                                    <option value="">— pick a scene —</option>
                                    {story.scenes.map((s) => (<option key={s.id} value={s.id}>{s.title}</option>))}
                                  </select>
                                ) : null}
                                <FlagInput
                                  value={st.action?.flagSet}
                                  suggestions={allFlags}
                                  onChange={(v) => st.action && patchState(idx, { action: { ...st.action, flagSet: v } })}
                                />
                                {(st.action?.type === "showText" || st.action?.type === "useItem") && (
                                  <HotspotVoiceControls
                                    story={story}
                                    sceneId={scene.id}
                                    assetKey={`${h.id}-state-${st.id}`}
                                    line={st.action.text ?? ""}
                                    value={st.action.audioUrl}
                                    onChange={(url) => st.action && patchState(idx, { action: { ...st.action, audioUrl: url } })}
                                  />
                                )}
                              </div>
                              {/* ---- the state's GATE override (locked door → open door) ---- */}
                              <div className="flex flex-wrap items-center gap-1 border border-crimson/20 bg-crimson/5 p-1.5">
                                <span className="font-pulp text-[9px] uppercase tracking-widest text-crimson/80">🔒 Lock while in this state</span>
                                <select
                                  className={inputCls}
                                  value={st.gating === null ? "open" : st.gating ? "replace" : "inherit"}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    if (v === "inherit") patchState(idx, { gating: undefined });
                                    else if (v === "open") patchState(idx, { gating: null });
                                    else patchState(idx, { gating: st.gating ?? { requiresFlags: [] } });
                                  }}
                                >
                                  <option value="inherit">inherit the object's gate</option>
                                  <option value="open">always unlocked (e.g. the opened door)</option>
                                  <option value="replace">use its own gate…</option>
                                </select>
                                {st.gating ? (
                                  <div className="w-full">
                                    <GatingEditor
                                      gating={st.gating === null ? undefined : st.gating}
                                      onChange={(g) => patchState(idx, { gating: g ?? null })}
                                      items={story.items}
                                      characters={story.characters}
                                      flags={allFlags}
                                      sectionId={`hsstate-gate-${h.id}-${st.id}`}
                                    />
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={addState}
                            className="w-full border border-cyan-neon/40 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
                          >
                            ＋ Add a state (e.g. "after it's been taken")
                          </button>
                        </CollapsibleSection>
                      );
                    })()}
                    {h.action.type === "arcadeGame" && (
                      (() => {
                        const ag = h.action.arcadeGame ?? {};
                        const setAG = (patch: Partial<typeof ag>) => mutate((d) => {
                          const s = d.scenes.find((x) => x.id === scene.id)!;
                          const hs = s.hotspots!.find((x) => x.id === h.id)!;
                          hs.action.arcadeGame = { ...ag, ...patch };
                        });
                        // The screen hole's placement, as percentages of the
                        // cabinet art. This is the whole point of the editor:
                        // swap in any cabinet plate and nudge these until the
                        // playfield sits inside the bezel.
                        const rect = ag.screenRect ?? { x: 20, y: 26.6, w: 60, h: 28.4 };
                        const setRect = (patch: Partial<typeof rect>) => setAG({ screenRect: { ...rect, ...patch } });
                        const art = ag.cabinetImage ? (media(ag.cabinetImage) ?? ag.cabinetImage) : undefined;
                        return (
                          <div className="space-y-2 border border-cyan-neon/25 bg-cyan-neon/5 p-2">
                            <div className="font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">🕹 Arcade Cabinet</div>
                            <p className="font-type text-[9px] text-paper/45">
                              A playable barrel-dodging climber, drawn INSIDE the cabinet art through its
                              transparent screen. Use the sliders to line the playfield up with the bezel —
                              the preview shows exactly what the player sees.
                            </p>
                            <Field label="Cabinet title (attract screen)">
                              <input className={inputCls} value={ag.title ?? ""} onChange={(e) => setAG({ title: e.target.value })} placeholder="HOLLOW CLIMB" />
                            </Field>
                            <Field label="Cabinet artwork — monitor must be keyed transparent">
                              <ImagePicker
                                preferFolder="sprites"
                                value={ag.cabinetImage || undefined}
                                placeholder="Pick cabinet art…"
                                includeGradients={false}
                                onChange={(url) => setAG({ cabinetImage: url ?? undefined })}
                              />
                            </Field>

                            {/* live placement preview */}
                            <div className="space-y-1">
                              <span className="font-pulp text-[9px] uppercase tracking-widest text-paper/40">Screen placement</span>
                              <div className="relative mx-auto" style={{ width: 130 }}>
                                <div
                                  className="absolute bg-emerald-400/70"
                                  style={{
                                    left: `${rect.x}%`,
                                    top: `${rect.y}%`,
                                    width: `${rect.w}%`,
                                    height: `${rect.h}%`,
                                  }}
                                />
                                {art ? (
                                  <img src={assetUrl(art)} alt="" className="relative w-full select-none" />
                                ) : (
                                  <div className="relative flex h-40 w-full items-center justify-center border border-dashed border-noir-600 font-type text-[9px] text-paper/30">
                                    no cabinet art
                                  </div>
                                )}
                              </div>
                              <p className="font-type text-[9px] text-paper/40">
                                The green block is the playfield. It should sit exactly inside the monitor bezel.
                              </p>
                            </div>
                            {([
                              ["x", "Left", 0, 100],
                              ["y", "Top", 0, 100],
                              ["w", "Width", 5, 100],
                              ["h", "Height", 5, 100],
                            ] as const).map(([k, label, lo, hi]) => (
                              <Field key={k} label={`${label} — ${rect[k]}%`}>
                                <input
                                  type="range"
                                  min={lo}
                                  max={hi}
                                  step={0.1}
                                  className="w-full accent-pink-500"
                                  value={rect[k]}
                                  onChange={(e) => setRect({ [k]: Number(e.target.value) } as Partial<typeof rect>)}
                                />
                              </Field>
                            ))}

                            <div className="grid grid-cols-2 gap-1">
                              <Field label="Boards to clear">
                                <input type="number" min={1} max={9} className={inputCls} value={ag.boardsToClear ?? 3} onChange={(e) => setAG({ boardsToClear: Number(e.target.value) })} />
                              </Field>
                              <Field label="Lives">
                                <input type="number" min={1} max={9} className={inputCls} value={ag.lives ?? 3} onChange={(e) => setAG({ lives: Number(e.target.value) })} />
                              </Field>
                              <Field label="Barrel interval (s)">
                                <input type="number" min={0.4} max={5} step={0.1} className={inputCls} value={ag.spawnSeconds ?? 1.6} onChange={(e) => setAG({ spawnSeconds: Number(e.target.value) })} />
                              </Field>
                              <Field label="Cabinet height (vh)">
                                <input type="number" min={40} max={100} className={inputCls} value={ag.cabinetHeight ?? 92} onChange={(e) => setAG({ cabinetHeight: Number(e.target.value) })} />
                              </Field>
                            </div>
                            <Field label="Phosphor colour">
                              <input className={inputCls} value={ag.screenTint ?? "#54ff9f"} onChange={(e) => setAG({ screenTint: e.target.value })} placeholder="#54ff9f" />
                            </Field>
                            <Field label="Win caption">
                              <input className={inputCls} value={ag.winText ?? ""} onChange={(e) => setAG({ winText: e.target.value })} placeholder="THE SCREEN GOES DARK" />
                            </Field>
                            <Field label="Lose caption">
                              <input className={inputCls} value={ag.failText ?? ""} onChange={(e) => setAG({ failText: e.target.value })} placeholder="PRESS ENTER TO RETRY" />
                            </Field>
                            <Field label="Flag set on winning">
                              <input className={inputCls} value={ag.rewardConsequences?.setFlags?.[0] ?? ""} onChange={(e) => setAG({ rewardConsequences: { ...(ag.rewardConsequences ?? {}), setFlags: e.target.value ? [e.target.value] : undefined } })} placeholder="hs_arcade_beaten" />
                            </Field>
                          </div>
                        );
                      })()
                    )}
                    {h.action.type === "patternPuzzle" && (
                      (() => {
                        const pp = h.action.patternPuzzle ?? { title: "Bank Statements", instruction: "Find the entries that don't belong", rows: [], targetCount: 3, payoffText: "" };
                        const setPP = (patch: Partial<typeof pp>) => mutate((d) => {
                          const s = d.scenes.find((x) => x.id === scene.id)!;
                          const hs = s.hotspots!.find((x) => x.id === h.id)!;
                          hs.action.patternPuzzle = { ...pp, ...patch };
                        });
                        // The player must flag every marked answer, so the flag
                        // count is derived from the answers — not a free slider.
                        const marked = pp.rows.filter((r) => r.isAnswer).length;
                        const setReward = (patch: Partial<Consequences>) => setPP({ rewardConsequences: { ...(pp.rewardConsequences ?? {}), ...patch } });
                        const setWrong = (patch: Partial<Consequences>) => setPP({ wrongSubmissionConsequences: { ...(pp.wrongSubmissionConsequences ?? {}), ...patch } });
                        const meterOf = (cons: Consequences | undefined, meter: MeterKey) => cons?.meterChanges?.find((m) => m.meter === meter)?.delta ?? "";
                        const setMeter = (cons: Consequences | undefined, setCons: (patch: Partial<Consequences>) => void, meter: MeterKey, val: string) => {
                          const list = (cons?.meterChanges ?? []).filter((m) => m.meter !== meter);
                          if (val !== "" && Number(val) !== 0) list.push({ meter, delta: Number(val) });
                          setCons({ meterChanges: list.length ? list : undefined });
                        };
                        return (
                          <div className="space-y-2 border border-cyan-neon/25 bg-cyan-neon/5 p-2">
                            <div className="font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">🔍 Pattern Puzzle</div>
                            <p className="font-type text-[9px] text-paper/45">A ledger mini-game: the player flags rows that share a hidden pattern. Correct → payoff + rewards; wrong → narrative consequences (Heat, flags, trust).</p>
                            <Field label="Puzzle title"><input className={inputCls} value={pp.title} onChange={(e) => setPP({ title: e.target.value })} placeholder="Bank Statements" /></Field>
                            <Field label="Instruction"><input className={inputCls} value={pp.instruction} onChange={(e) => setPP({ instruction: e.target.value })} placeholder="Find the three withdrawals that don't belong" /></Field>
                            <Field label={`Flag count — ${marked} answer(s) marked${marked > 0 ? " · syncs automatically" : " · mark answers below"}`}>
                              <input type="range" min={1} max={6} className="w-full accent-pink-500" value={marked > 0 ? marked : pp.targetCount} onChange={(e) => setPP({ targetCount: Number(e.target.value) })} />
                              <p className="mt-1 font-type text-[9px] text-paper/40">In play the player must flag every row you tick as an answer, so the count tracks your answers automatically.</p>
                            </Field>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-pulp text-[9px] uppercase tracking-widest text-paper/40">Rows ({pp.rows.length})</span>
                                <button onClick={() => setPP({ rows: [...pp.rows, { id: `r_${uid()}`, date: "", description: "", amount: "", isAnswer: false }] })} className="border border-cyan-neon/40 px-2 py-0.5 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10">＋ Row</button>
                              </div>
                              {pp.rows.map((row, ri) => (
                                <div key={row.id} className="space-y-1 border border-noir-700/60 p-1.5">
                                  <div className="flex items-center gap-1">
                                    <input className={`${inputCls} w-16`} placeholder="Aug 6" value={row.date} onChange={(e) => { const next = [...pp.rows]; next[ri] = { ...row, date: e.target.value }; setPP({ rows: next }); }} />
                                    <input className={`${inputCls} flex-1`} placeholder="Blackwood First Nat'l — Main Br." value={row.description} onChange={(e) => { const next = [...pp.rows]; next[ri] = { ...row, description: e.target.value }; setPP({ rows: next }); }} />
                                    <input className={`${inputCls} w-24`} placeholder="-$9,800" value={row.amount} onChange={(e) => { const next = [...pp.rows]; next[ri] = { ...row, amount: e.target.value }; setPP({ rows: next }); }} />
                                    <button onClick={() => setPP({ rows: pp.rows.filter((_, idx) => idx !== ri) })} className="shrink-0 text-crimson hover:underline text-[10px]">✕</button>
                                  </div>
                                  <label className="flex items-center gap-1 text-[9px] text-paper/50">
                                    <input type="checkbox" checked={row.isAnswer} onChange={(e) => { const next = [...pp.rows]; next[ri] = { ...row, isAnswer: e.target.checked }; const ac = next.filter((r) => r.isAnswer).length; setPP({ rows: next, targetCount: ac > 0 ? ac : pp.targetCount }); }} />
                                    Part of the pattern (answer)
                                  </label>
                                </div>
                              ))}
                              {marked === 0 && <p className="border border-crimson/30 bg-crimson/5 px-2 py-1 font-type text-[9px] text-crimson">⚠ No rows are marked as answers yet — the puzzle is unsolvable until at least one is.</p>}
                            </div>
                            <Field label="Payoff text (shown when cracked)"><textarea className={`${inputCls} h-16 font-type`} value={pp.payoffText} onChange={(e) => setPP({ payoffText: e.target.value })} placeholder="Jack's voice echoes: 'Three branches, three days, near ten grand each. Someone was draining the account before the audit...'" /></Field>

                            {/* ---- On solve: reward + route ---- */}
                            <div className="space-y-2 border-t border-emerald-500/20 pt-2">
                              <div className="font-pulp text-[9px] uppercase tracking-widest text-emerald-400">✓ On solve — reward &amp; route</div>
                              <div className="grid grid-cols-2 gap-1">
                                <Field label="Grant item">
                                  <select className={inputCls} value={pp.rewardConsequences?.addItems?.[0] ?? ""} onChange={(e) => setReward({ addItems: e.target.value ? [e.target.value] : undefined })}>
                                    <option value="">— none —</option>
                                    {story.items.map((it) => (<option key={it.id} value={it.id}>{it.icon} {it.name}</option>))}
                                  </select>
                                </Field>
                                <Field label="Deduce delta">
                                  <input type="number" className={inputCls} value={meterOf(pp.rewardConsequences, "Clever")} onChange={(e) => setMeter(pp.rewardConsequences, setReward, "Clever", e.target.value)} />
                                </Field>
                              </div>
                              <Field label="Sets flags"><FlagPicker value={pp.rewardConsequences?.setFlags} suggestions={allFlags} onChange={(v) => setReward({ setFlags: v })} /></Field>
                              <Field label="Go to scene on solve (optional — leave blank to stay put)">
                                <select className={inputCls} value={pp.targetSceneId ?? ""} onChange={(e) => setPP({ targetSceneId: e.target.value || undefined })}>
                                  <option value="">— stay in this scene —</option>
                                  {story.scenes.map((s) => (<option key={s.id} value={s.id}>{s.title}</option>))}
                                </select>
                              </Field>
                            </div>

                            {/* ---- On wrong: consequences + route ---- */}
                            <div className="space-y-2 border-t border-crimson/20 pt-2">
                              <div className="font-pulp text-[9px] uppercase tracking-widest text-crimson">✗ On wrong — message, consequences &amp; route</div>
                              <label className="flex items-center gap-2 text-[9px] text-paper/50">
                                <input type="checkbox" checked={pp.allowRetry !== false} onChange={(e) => setPP({ allowRetry: e.target.checked || undefined })} />
                                Allow retry after a wrong guess (off = a wrong submission is narratively final — apply the consequences and route below)
                              </label>
                              <Field label="Wrong-guess message (shown on a retryable miss)"><input className={inputCls} value={pp.wrongMessage ?? ""} onChange={(e) => setPP({ wrongMessage: e.target.value || undefined })} placeholder="Those three are clean — look again." /></Field>
                              <div className="grid grid-cols-2 gap-1">
                                <Field label="Heat delta (on final wrong)"><input type="number" className={inputCls} value={meterOf(pp.wrongSubmissionConsequences, "Suspicion")} onChange={(e) => setMeter(pp.wrongSubmissionConsequences, setWrong, "Suspicion", e.target.value)} /></Field>
                                <Field label="Go to scene on final wrong (optional)">
                                  <select className={inputCls} value={pp.wrongTargetSceneId ?? ""} onChange={(e) => setPP({ wrongTargetSceneId: e.target.value || undefined })}>
                                    <option value="">— stay in this scene —</option>
                                    {story.scenes.map((s) => (<option key={s.id} value={s.id}>{s.title}</option>))}
                                  </select>
                                </Field>
                              </div>
                              <Field label="Sets flags (on final wrong)"><FlagPicker value={pp.wrongSubmissionConsequences?.setFlags} suggestions={allFlags} onChange={(v) => setWrong({ setFlags: v })} /></Field>
                              {pp.allowRetry !== false && (pp.wrongSubmissionConsequences || pp.wrongTargetSceneId) && (
                                <p className="border border-gold/25 bg-gold/5 px-2 py-1 font-type text-[9px] text-gold/80">ℹ Retry is ON, so these wrong-consequences only fire if you switch retry OFF — otherwise the player just tries again.</p>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    )}
                    {h.action.type === "showText" && (
                      <Field label="Text shown">
                        <textarea
                          className={`${inputCls} h-14 font-type`}
                          value={h.action.text ?? ""}
                          onChange={(e) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.hotspots!.find((x) => x.id === h.id)!.action.text = e.target.value;
                            })
                          }
                        />
                        <HotspotVoiceControls
                          story={story}
                          sceneId={scene.id}
                          assetKey={`${h.id}-main`}
                          line={h.action.text ?? ""}
                          value={h.action.audioUrl}
                          onChange={(url) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.hotspots!.find((x) => x.id === h.id)!.action.audioUrl = url;
                            })
                          }
                        />
                      </Field>
                    )}
                    {h.action.type === "setPlayerPose" && (
                      <div className="space-y-1.5 border border-gold/30 bg-gold/5 p-2">
                        <Field label="Pose (named animation on the player's sheet)">
                          <input
                            className={inputCls}
                            value={h.action.playerPose ?? ""}
                            placeholder="e.g. bend · crouch · reach"
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.hotspots!.find((x) => x.id === h.id)!.action.playerPose = e.target.value.trim() || undefined;
                              })
                            }
                          />
                          <span className="mt-1 block font-type text-[9px] italic leading-snug text-paper/45">
                            The walker switches to this animation when the hotspot fires — a "bend down" to look under
                            the bar. Empty clears back to idle / the scene's default pose. Add the animation to the
                            player's sprite sheet (Characters tab ▸ walk sheet) under a name like "bend".
                          </span>
                        </Field>
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60">
                          <input
                            type="checkbox"
                            checked={!!h.action.playerPoseOnce}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.hotspots!.find((x) => x.id === h.id)!.action.playerPoseOnce = e.target.checked || undefined;
                              })
                            }
                          />
                          ▶ Play once, then revert (a quick bend-and-straighten)
                        </label>
                      </div>
                    )}
                    {h.action.type === "runScript" && (
                      <div className="space-y-1.5 border border-gold/30 bg-gold/5 p-2">
                        <div className="font-pulp text-[9px] uppercase tracking-widest text-gold">🎬 Scripted sequence (stage cutscene)</div>
                        <p className="font-type text-[9px] leading-snug text-paper/45">
                          Steps play IN ORDER with input locked and letterbox bars down: walk the player, walk an NPC,
                          float say lines, wait a beat, set a flag, or cut to another scene. 🚶 Walkable stages only —
                          classic scenes ignore this action.
                          {scene.nodeType !== "stage" ? " ⚠ This scene is NOT a walkable stage." : ""}
                        </p>
                        <ScriptEditor
                          steps={h.action.script ?? []}
                          onChange={(next) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.hotspots!.find((x) => x.id === h.id)!.action.script = next.length ? next : undefined;
                            })
                          }
                          npcIds={(scene.stage?.npcs ?? []).map((n) => n.id)}
                          scenes={story.scenes.map((s) => ({ id: s.id, title: s.title }))}
                          onPickPoint={(index, npc) => {
                            // Jump to the stage tab so the plate is on screen;
                            // after the click the editor hops back here.
                            setScriptPick({ index, npc, origin: "hotspot", hotspotId: h.id });
                            setTab("stage");
                          }}
                          picking={scriptPick?.origin === "hotspot" && scriptPick.hotspotId === h.id ? scriptPick : null}
                        />
                      </div>
                    )}
                    {h.action.type === "startDialogue" && (
                      <div className="space-y-2 border border-cyan-neon/30 bg-cyan-neon/5 p-2">
                        <div className="font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">💬 Topic-list conversation (opt-in)</div>
                        <p className="font-type text-[9px] leading-snug text-paper/45">
                          Instead of playing this scene's Beats straight through, the talk opens as a HUB of questions
                          the player can ask ("ask the bartender…"). Pick a topic, its lines play, then
                          it returns to the hub; <b>leave</b> ends the conversation. Leave empty to keep the classic
                          linear conversation.
                        </p>
                        {(h.action.topics?.length ?? 0) === 0 ? (
                          <button
                            className="btn-tool w-full"
                            onClick={() =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                const a = s.hotspots!.find((x) => x.id === h.id)!.action;
                                a.topics = [
                                  {
                                    id: `topic_${uid()}`,
                                    label: "What do you want to know?",
                                    beats: [
                                      { id: `b_${uid()}`, characterId: story.characters[0]?.id ?? "narrator", text: "The answer…" },
                                    ],
                                  },
                                ];
                              })
                            }
                          >
                            ＋ Turn this into a topic list
                          </button>
                        ) : (
                          <>
                            <Field label="Hub heading (what the player sees above the questions)">
                              <input
                                className={inputCls}
                                value={h.action.topicPrompt ?? ""}
                                placeholder="What do you want to ask?"
                                onChange={(e) =>
                                  mutate((d) => {
                                    const s = d.scenes.find((x) => x.id === scene.id)!;
                                    s.hotspots!.find((x) => x.id === h.id)!.action.topicPrompt = e.target.value || undefined;
                                  })
                                }
                              />
                            </Field>
                            <Field label="Leave option label">
                              <input
                                className={inputCls}
                                value={h.action.topicLeaveLabel ?? ""}
                                placeholder="Never mind"
                                onChange={(e) =>
                                  mutate((d) => {
                                    const s = d.scenes.find((x) => x.id === scene.id)!;
                                    s.hotspots!.find((x) => x.id === h.id)!.action.topicLeaveLabel = e.target.value || undefined;
                                  })
                                }
                              />
                            </Field>
                            {h.action.topics!.map((t, ti) => (
                              <div key={t.id} className="space-y-1.5 border border-noir-700 bg-noir-950/60 p-1.5">
                                <div className="flex items-center gap-1">
                                  <span className="font-pulp text-[8px] uppercase tracking-widest text-cyan-neon">Q{ti + 1}</span>
                                  <input
                                    className={`${inputCls} min-w-0 flex-1`}
                                    value={t.label}
                                    placeholder="Where's my gang?"
                                    onChange={(e) =>
                                      mutate((d) => {
                                        const s = d.scenes.find((x) => x.id === scene.id)!;
                                        s.hotspots!.find((x) => x.id === h.id)!.action.topics![ti].label = e.target.value;
                                      })
                                    }
                                  />
                                  <button
                                    className="shrink-0 px-1 font-pulp text-[9px] text-crimson"
                                    title="Remove this topic"
                                    onClick={() =>
                                      mutate((d) => {
                                        const s = d.scenes.find((x) => x.id === scene.id)!;
                                        const a = s.hotspots!.find((x) => x.id === h.id)!.action;
                                        a.topics = a.topics!.filter((_, j) => j !== ti);
                                      })
                                    }
                                  >
                                    ✕
                                  </button>
                                </div>
                                <div className="flex items-center gap-3 text-[9px]">
                                  <label className="flex shrink-0 items-center gap-1 text-paper/70">
                                    <input
                                      type="checkbox"
                                      checked={!!t.repeatable}
                                      onChange={(e) =>
                                        mutate((d) => {
                                          const s = d.scenes.find((x) => x.id === scene.id)!;
                                          s.hotspots!.find((x) => x.id === h.id)!.action.topics![ti].repeatable = e.target.checked || undefined;
                                        })
                                      }
                                    />
                                    askable again
                                  </label>
                                  <label className="flex min-w-0 flex-1 items-center gap-1">
                                    <span className="shrink-0 text-paper/50">sets flag</span>
                                    {/* FlagInput, not a bare text box: every other
                                        flag field in the Studio offers the story's
                                        existing flags. Typing one by hand here was
                                        the easiest way in the app to invent a
                                        near-miss flag that silently never fires. */}
                                    <div className="min-w-0 flex-1">
                                      <FlagInput
                                        value={t.flagSet}
                                        suggestions={allFlags}
                                        placeholder="optional"
                                        onChange={(v) =>
                                          mutate((d) => {
                                            const s = d.scenes.find((x) => x.id === scene.id)!;
                                            s.hotspots!.find((x) => x.id === h.id)!.action.topics![ti].flagSet = v?.trim() || undefined;
                                          })
                                        }
                                      />
                                    </div>
                                  </label>
                                </div>
                                <GatingEditor
                                  sectionId={`topic-${t.id}`}
                                  gating={t.gating}
                                  items={story.items}
                                  characters={story.characters}
                                  flags={allFlags}
                                  memoryTags={recallSuggestions}
                                  onChange={(g) =>
                                    mutate((d) => {
                                      const s = d.scenes.find((x) => x.id === scene.id)!;
                                      s.hotspots!.find((x) => x.id === h.id)!.action.topics![ti].gating = g;
                                    })
                                  }
                                />
                                <div className="space-y-1">
                                  <div className="font-pulp text-[8px] uppercase tracking-widest text-paper/50">Lines</div>
                                  {t.beats.map((b, bi) => (
                                    <div key={b.id} className="flex items-start gap-1">
                                      <select
                                        className={`${inputCls} w-24 shrink-0`}
                                        value={b.characterId}
                                        onChange={(e) =>
                                          mutate((d) => {
                                            const s = d.scenes.find((x) => x.id === scene.id)!;
                                            s.hotspots!.find((x) => x.id === h.id)!.action.topics![ti].beats[bi].characterId = e.target.value;
                                          })
                                        }
                                      >
                                        <option value="narrator">Narrator</option>
                                        {story.characters.map((c) => (
                                          <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                      </select>
                                      <textarea
                                        className={`${inputCls} min-w-0 flex-1 font-type`}
                                        value={b.text}
                                        rows={2}
                                        onChange={(e) =>
                                          mutate((d) => {
                                            const s = d.scenes.find((x) => x.id === scene.id)!;
                                            s.hotspots!.find((x) => x.id === h.id)!.action.topics![ti].beats[bi].text = e.target.value;
                                          })
                                        }
                                      />
                                      <button
                                        className="shrink-0 px-1 font-pulp text-[9px] text-crimson"
                                        title="Remove line"
                                        onClick={() =>
                                          mutate((d) => {
                                            const s = d.scenes.find((x) => x.id === scene.id)!;
                                            const a = s.hotspots!.find((x) => x.id === h.id)!.action;
                                            a.topics![ti].beats = a.topics![ti].beats.filter((_, j) => j !== bi);
                                          })
                                        }
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    className="w-full border border-cyan-neon/40 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
                                    onClick={() =>
                                      mutate((d) => {
                                        const s = d.scenes.find((x) => x.id === scene.id)!;
                                        const a = s.hotspots!.find((x) => x.id === h.id)!.action;
                                        const last = a.topics![ti].beats[a.topics![ti].beats.length - 1];
                                        a.topics![ti].beats = [
                                          ...a.topics![ti].beats,
                                          { id: `b_${uid()}`, characterId: last?.characterId ?? story.characters[0]?.id ?? "narrator", text: "" },
                                        ];
                                      })
                                    }
                                  >
                                    ＋ Add line
                                  </button>
                                </div>
                              </div>
                            ))}
                            <div className="flex gap-1">
                              <button
                                className="flex-1 border border-cyan-neon/50 py-1 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
                                onClick={() =>
                                  mutate((d) => {
                                    const s = d.scenes.find((x) => x.id === scene.id)!;
                                    const a = s.hotspots!.find((x) => x.id === h.id)!.action;
                                    a.topics = [
                                      ...(a.topics ?? []),
                                      { id: `topic_${uid()}`, label: "…", beats: [{ id: `b_${uid()}`, characterId: story.characters[0]?.id ?? "narrator", text: "" }] },
                                    ];
                                  })
                                }
                              >
                                ＋ Add topic
                              </button>
                              <button
                                className="border border-crimson/50 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-crimson hover:bg-crimson/10"
                                onClick={() =>
                                  mutate((d) => {
                                    const s = d.scenes.find((x) => x.id === scene.id)!;
                                    s.hotspots!.find((x) => x.id === h.id)!.action.topics = undefined;
                                  })
                                }
                              >
                                ✕ Clear
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    {h.action.type === "useItem" && (
                      <>
                        <Field label="Reply line (shows when it's used)">
                          <textarea
                            className={`${inputCls} h-14 font-type`}
                            placeholder="“That fits!” — what it says as the item is used…"
                            value={h.action.text ?? ""}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.hotspots!.find((x) => x.id === h.id)!.action.text = e.target.value || undefined;
                              })
                            }
                          />
                          <HotspotVoiceControls
                            story={story}
                            sceneId={scene.id}
                            assetKey={`${h.id}-main`}
                            line={h.action.text ?? ""}
                            value={h.action.audioUrl}
                            onChange={(url) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.hotspots!.find((x) => x.id === h.id)!.action.audioUrl = url;
                              })
                            }
                          />
                        </Field>
                        <Field label="Consumes item (leaves the satchel)">
                          <select
                            className={inputCls}
                            value={h.action.itemConsumed ?? ""}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.hotspots!.find((x) => x.id === h.id)!.action.itemConsumed = e.target.value || undefined;
                              })
                            }
                          >
                            <option value="">— consumes nothing (the item stays; only the line plays) —</option>
                            {story.items.map((i) => (
                              <option key={i.id} value={i.id}>{i.icon} {i.name}</option>
                            ))}
                          </select>
                          <p className="mt-1 font-type text-[8px] leading-snug text-paper/40">
                            The engine ONLY spends the item picked here — arming an item is never enough to lose it.
                          </p>
                        </Field>
                      </>
                    )}
                    {/* ---- 🔊 SOUND EFFECT ---------------------------------
                        Fires on EVERY action type, and on the sfx bus — so it
                        layers over a spoken line instead of replacing it. The
                        voice clip above is for "someone says something"; this
                        is for "something makes a noise". */}
                    <div className="space-y-1.5 border border-cyan-neon/25 bg-cyan-neon/5 p-2">
                      <div className="font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">
                        🔊 Sound effect on trigger
                      </div>
                      <p className="font-type text-[9px] leading-snug text-paper/45">
                        A door creak, a gunshot, a phone. Plays on the <b>sfx</b> channel the moment this zone fires,
                        <b> alongside</b> any spoken line (it never cuts narration off) and whatever the action does.
                      </p>
                      <div className="flex gap-1">
                        <input
                          className={inputCls}
                          placeholder="/audio/door-creak.mp3"
                          value={mediaField(h.action.sfxUrl)}
                          onChange={(e) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.hotspots!.find((x) => x.id === h.id)!.action.sfxUrl = e.target.value || undefined;
                            })
                          }
                        />
                        <MediaUploadButton
                          storyId={story.id}
                          accept="audio/*"
                          label="⇧ Upload"
                          onUploaded={(_url, assetId) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.hotspots!.find((x) => x.id === h.id)!.action.sfxUrl = `asset:${assetId}`;
                            })
                          }
                        />
                      </div>
                      <AssetDropdown
                        storyId={story.id}
                        assetType="audio"
                        returnReference
                        value={h.action.sfxUrl}
                        onChange={(url) =>
                          mutate((d) => {
                            const s = d.scenes.find((x) => x.id === scene.id)!;
                            s.hotspots!.find((x) => x.id === h.id)!.action.sfxUrl = url || undefined;
                          })
                        }
                        placeholder="Or pick uploaded audio..."
                      />
                      {h.action.sfxUrl ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="border border-cyan-neon/40 px-2 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
                            title="Hear it exactly as the game will play it"
                            onClick={() => audio.playSfx(media(h.action.sfxUrl) ?? h.action.sfxUrl!, h.action.sfxVolume ?? 1)}
                          >
                            ▶ Test
                          </button>
                          <label className="flex flex-1 items-center gap-2 font-type text-[9px] text-paper/60">
                            Volume {Math.round((h.action.sfxVolume ?? 1) * 100)}%
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.05}
                              className="flex-1 accent-cyan-neon"
                              value={h.action.sfxVolume ?? 1}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  const v = Number(e.target.value);
                                  s.hotspots!.find((x) => x.id === h.id)!.action.sfxVolume = v === 1 ? undefined : v;
                                })
                              }
                            />
                          </label>
                          <button
                            type="button"
                            className="text-[10px] text-crimson hover:underline"
                            title="Remove the sound effect"
                            onClick={() =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                const a = s.hotspots!.find((x) => x.id === h.id)!.action;
                                a.sfxUrl = undefined;
                                a.sfxVolume = undefined;
                              })
                            }
                          >
                            ✕
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {/* ---- ⛓ CHAINED ACTIONS -------------------------------
                        The action above stays the PRIMARY (it sets the cursor,
                        the gating and whether the marker is consumed). These
                        run straight after it, in order. */}
                    <div className="space-y-1.5 border border-gold/25 bg-gold/5 p-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-pulp text-[9px] uppercase tracking-widest text-gold">
                          ⛓ Also do{(h.action.then?.length ?? 0) > 0 ? ` (${h.action.then!.length})` : ""}
                        </span>
                        <button
                          className="border border-gold/40 px-1.5 py-0.5 font-pulp text-[8px] uppercase tracking-widest text-gold hover:bg-gold/10"
                          onClick={() =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              const a = s.hotspots!.find((x) => x.id === h.id)!.action;
                              a.then = [...(a.then ?? []), { type: "setFlag" }];
                            })
                          }
                        >
                          ＋ Add
                        </button>
                      </div>
                      <p className="font-type text-[9px] leading-snug text-paper/45">
                        One click, several outcomes — show a line <b>and</b> set a flag <b>and</b> grant an item.
                        Follow-ups apply their item / flag / meter / sound only; they can't open a board, start a
                        conversation or run a script (use the primary action for those). A follow-up that
                        <b> goes to a scene</b> ends the chain.
                      </p>
                      {(h.action.then ?? []).map((step, si) => (
                        <div key={si} className="space-y-1 border border-noir-600 bg-noir-950/50 p-1.5">
                          <div className="flex items-center gap-1">
                            <span className="font-pulp text-[8px] uppercase tracking-widest text-paper/40">{si + 1}.</span>
                            <select
                              className={`${inputCls} flex-1`}
                              value={step.type}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.hotspots!.find((x) => x.id === h.id)!.action.then![si].type = e.target.value as never;
                                })
                              }
                            >
                              <option value="setFlag">🚩 Set flag</option>
                              <option value="giveItem">🎒 Give item</option>
                              <option value="meterChange">📊 Change meter</option>
                              <option value="goToScene">➜ Go to scene (ends the chain)</option>
                            </select>
                            <button
                              className="px-1 text-[10px] text-paper/50 hover:text-gold disabled:opacity-25"
                              disabled={si === 0}
                              title="Run this earlier"
                              onClick={() =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  const t = s.hotspots!.find((x) => x.id === h.id)!.action.then!;
                                  [t[si - 1], t[si]] = [t[si], t[si - 1]];
                                })
                              }
                            >
                              ▲
                            </button>
                            <button
                              className="px-1 text-[10px] text-paper/50 hover:text-gold disabled:opacity-25"
                              disabled={si === (h.action.then?.length ?? 0) - 1}
                              title="Run this later"
                              onClick={() =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  const t = s.hotspots!.find((x) => x.id === h.id)!.action.then!;
                                  [t[si + 1], t[si]] = [t[si], t[si + 1]];
                                })
                              }
                            >
                              ▼
                            </button>
                            <button
                              className="text-[10px] text-crimson hover:underline"
                              title="Remove this follow-up"
                              onClick={() =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  const a = s.hotspots!.find((x) => x.id === h.id)!.action;
                                  a.then = a.then!.filter((_, j) => j !== si);
                                  if (!a.then.length) a.then = undefined;
                                })
                              }
                            >
                              ✕
                            </button>
                          </div>
                          {step.type === "setFlag" && (
                            <FlagInput
                              value={step.flagSet ?? ""}
                              suggestions={allFlags}
                              onChange={(v) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.hotspots!.find((x) => x.id === h.id)!.action.then![si].flagSet = v || undefined;
                                })
                              }
                            />
                          )}
                          {step.type === "giveItem" && (
                            <select
                              className={inputCls}
                              value={step.itemGranted ?? ""}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.hotspots!.find((x) => x.id === h.id)!.action.then![si].itemGranted = e.target.value || undefined;
                                })
                              }
                            >
                              <option value="">— pick an item —</option>
                              {story.items.map((it) => (
                                <option key={it.id} value={it.id}>{it.icon} {it.name}</option>
                              ))}
                            </select>
                          )}
                          {step.type === "meterChange" && (
                            <div className="flex items-center gap-1">
                              <select
                                className={`${inputCls} flex-1`}
                                value={step.meterChange?.meter ?? "Suspicion"}
                                onChange={(e) =>
                                  mutate((d) => {
                                    const s = d.scenes.find((x) => x.id === scene.id)!;
                                    const st = s.hotspots!.find((x) => x.id === h.id)!.action.then![si];
                                    st.meterChange = { meter: e.target.value as MeterKey, delta: st.meterChange?.delta ?? 1 };
                                  })
                                }
                              >
                                {METERS.map((m) => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                              </select>
                              <input
                                type="number"
                                step={1}
                                className={`${inputCls} w-20`}
                                title="How much to move the meter (negative lowers it)"
                                value={step.meterChange?.delta ?? 1}
                                onChange={(e) =>
                                  mutate((d) => {
                                    const s = d.scenes.find((x) => x.id === scene.id)!;
                                    const st = s.hotspots!.find((x) => x.id === h.id)!.action.then![si];
                                    st.meterChange = { meter: st.meterChange?.meter ?? "Suspicion", delta: Number(e.target.value) || 0 };
                                  })
                                }
                              />
                            </div>
                          )}
                          {step.type === "goToScene" && (
                            <select
                              className={inputCls}
                              value={step.targetSceneId ?? ""}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.hotspots!.find((x) => x.id === h.id)!.action.then![si].targetSceneId = e.target.value || undefined;
                                })
                              }
                            >
                              <option value="">— pick a scene —</option>
                              {story.scenes.map((sc2) => (
                                <option key={sc2.id} value={sc2.id}>{sc2.title}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>

                    {(h.action.type === "giveItem" || h.action.type === "showText") && (
                      <div className="space-y-1.5 border border-gold/30 bg-gold/5 p-2">
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60">
                          <input
                            type="checkbox"
                            checked={!!h.examine}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                const hs = s.hotspots!.find((x) => x.id === h.id)!;
                                hs.examine = e.target.checked || undefined;
                                if (!e.target.checked) hs.examineSeconds = undefined;
                              })
                            }
                          />
                          🔍 EXAMINE — hold to inspect (camera zooms in)
                        </label>
                        {h.examine && (
                          <>
                            <Field label={`Examine hold — ${(h.examineSeconds ?? 2.5).toFixed(1)}s`}>
                              <input
                                type="range"
                                min={1}
                                max={6}
                                step={0.5}
                                className="w-full accent-amber-500"
                                value={h.examineSeconds ?? 2.5}
                                onChange={(e) =>
                                  mutate((d) => {
                                    const s = d.scenes.find((x) => x.id === scene.id)!;
                                    s.hotspots!.find((x) => x.id === h.id)!.examineSeconds = Number(e.target.value);
                                  })
                                }
                              />
                            </Field>
                            <p className="font-type text-[9px] leading-snug text-paper/45">
                              The player HOLDS this zone: the camera zooms in, an “EXAMINING” meter fills, and on
                              completion the {h.action.type === "giveItem" ? "item is picked up" : "description shows"}
                              — then the zone is hidden. Set a <b>flag</b> on the action and gate a beat on it to
                              narrate the discovery. Use a <b>LARGE, detailed</b> background image: the zoom is a CSS
                              magnification, so a small plate will blur.
                            </p>
                          </>
                        )}
                      </div>
                    )}
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60">
                      <input
                        type="checkbox"
                        checked={!!h.isRepeatable}
                        onChange={(e) =>
                          mutate((d) => {
                            const s = d.scenes.find((x) => x.id === scene.id)!;
                            s.hotspots!.find((x) => x.id === h.id)!.isRepeatable = e.target.checked;
                          })
                        }
                      />
                      repeatable
                    </label>
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60">
                      <input
                        type="checkbox"
                        checked={!!h.remote}
                        onChange={(e) =>
                          mutate((d) => {
                            const s = d.scenes.find((x) => x.id === scene.id)!;
                            s.hotspots!.find((x) => x.id === h.id)!.remote = e.target.checked || undefined;
                          })
                        }
                      />
                      🔭 out of reach — works from a distance (no walk-up)
                    </label>
                    <div className="space-y-0.5">
                      <div className="text-[10px] uppercase tracking-wider text-paper/60">🚪 fires when walked onto</div>
                      <select
                        className="w-full border border-noir-700 bg-noir-950 px-1 py-0.5 font-type text-[10px] text-paper"
                        value={h.walkOver === undefined ? "inherit" : h.walkOver ? "yes" : "no"}
                        onChange={(e) =>
                          mutate((d) => {
                            const s = d.scenes.find((x) => x.id === scene.id)!;
                            const hs = s.hotspots!.find((x) => x.id === h.id)!;
                            hs.walkOver = e.target.value === "inherit" ? undefined : e.target.value === "yes";
                          })
                        }
                      >
                        <option value="inherit">Room default (smart — doors need a click)</option>
                        <option value="yes">Always — fires the moment they step on it</option>
                        <option value="no">Never — only when clicked / aimed at</option>
                      </select>
                      <p className="font-type text-[9px] leading-snug text-paper/45">
                        Overrides the room's 🎛 Interaction trigger policy for this one marker. A 👣 exit left on
                        "always" under the spawn point ejects the player on their first step — the validator warns on
                        that.
                      </p>
                    </div>
                    {h.remote && (
                      <p className="-mt-1 pl-6 font-type text-[9px] leading-snug text-paper/45">
                        On a 🚶 walkable stage the character normally walks over before a zone fires. With this ON they
                        interact from wherever they stand — the walker just turns to face it. Use it for things they can
                        SEE but never REACH: a clock high on a tower, a sign across the water — any verb the zone answers
                        works at range, and strolling underneath never triggers it. (Plain <b>👁 looks</b> and 💬
                        show-text zones already fire from a distance without this box.)
                      </p>
                    )}
                    <Field label="Custom fail message">
                      <input
                        className={inputCls}
                        value={h.customFailMessage ?? ""}
                        onChange={(e) =>
                          mutate((d) => {
                            const s = d.scenes.find((x) => x.id === scene.id)!;
                            s.hotspots!.find((x) => x.id === h.id)!.customFailMessage = e.target.value || undefined;
                          })
                        }
                      />
                    </Field>
                    <label className="flex items-center gap-2 font-type text-[10px] text-paper/70">
                      <input type="checkbox" checked={!!h.hiddenWhenLocked}
                        onChange={e => mutate(d => { d.scenes.find(s => s.id === scene.id)!.hotspots!.find(hs => hs.id === h.id)!.hiddenWhenLocked = e.target.checked || undefined; })} />
                      Hide marker when its gate is locked
                    </label>
                    <GatingEditor
                      sectionId={`hotspot-${h.id}`}
                      gating={h.gating}
                      items={story.items}
                      characters={story.characters}
                      flags={allFlags}
                      memoryTags={recallSuggestions}
                      onChange={(g) =>
                        mutate((d) => {
                          const s = d.scenes.find((x) => x.id === scene.id)!;
                          s.hotspots!.find((x) => x.id === h.id)!.gating = g;
                        })
                      }
                    />
                    </CollapsibleSection>
                  </div>
                  );
                })}
              </>
            )}

            {scene && scene.nodeType !== "note" && tab === "choices" && (
              <>
                <HelpNote id="choices-tab" title="Buttons the player presses">
                  Write the words they see, then pick which room it goes to — or drag a line from this card to another
                  card. A <b>💬 reply</b> answers in place and never leaves the room (pair it with a Beat).{" "}
                  <b>Hidden</b> stays invisible until its gate passes. An <b>exclusive group</b> means picking one
                  knocks the others out. <b>⚡ Quick-time</b> is a timed “you hesitated” branch. Pure navigation can
                  be used again; choices that give items fire once.
                </HelpNote>
                {(scene.choices ?? []).map((c, i) => (
                  <div
                    key={c.id}
                    ref={(el) => {
                      if (el && focusedChoiceId === c.id) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                        window.setTimeout(() => setFocusedChoiceId(null), 1600);
                      }
                    }}
                  >
                    <CollapsibleSection
                      id={`choice-${c.id}`}
                      title={
                        <span style={{ color: ATTITUDE_STROKE[c.attitudeTag ?? "Neutral"] }}>
                          ▸ Choice {i + 1} · {c.text.replace(/\s+/g, " ").trim().slice(0, 24)}
                          {c.text.length > 24 && "…"}
                        </span>
                      }
                      titleClass=""
                      defaultOpen={focusedChoiceId === c.id}
                      className={`border ${focusedChoiceId === c.id ? "border-neon bg-neon/10" : "border-noir-600"}`}
                      headerRight={
                        <button
                          className="text-[10px] text-crimson hover:underline"
                          onClick={() =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.choices = s.choices?.filter((x) => x.id !== c.id);
                            })
                          }
                          title="Delete this choice"
                        >
                          ✕
                        </button>
                      }
                    >
                    <Field label="Text" tip="The words on the button the player presses.">
                      <textarea
                        className={`${inputCls} h-14 font-type`}
                        value={c.text}
                        onChange={(e) =>
                          mutate((d) => {
                            const s = d.scenes.find((x) => x.id === scene.id)!;
                            s.choices!.find((x) => x.id === c.id)!.text = e.target.value;
                          })
                        }
                      />
                    </Field>
                    <label className="flex items-center gap-2 border border-cyan-neon/25 bg-cyan-neon/5 p-1.5 text-[9px] text-paper/70">
                      <input
                        type="checkbox"
                        checked={!!c.reply}
                        onChange={(e) =>
                          mutate((d) => {
                            const s = d.scenes.find((x) => x.id === scene.id)!;
                            s.choices!.find((x) => x.id === c.id)!.reply = e.target.checked || undefined;
                          })
                        }
                      />
                      <span>
                        💬 <b className="text-cyan-neon">Conversational reply</b> — stays in this scene instead of navigating.
                        Set a flag below, then gate a Dialogue beat on it: that beat becomes the reply.
                      </span>
                    </label>
                    <label className="flex items-center gap-2 border border-noir-600/60 p-1.5 text-[9px] text-paper/55">
                      <input
                        type="checkbox"
                        checked={!!c.hidden}
                        onChange={(e) =>
                          mutate((d) => {
                            const s = d.scenes.find((x) => x.id === scene.id)!;
                            s.choices!.find((x) => x.id === c.id)!.hidden = e.target.checked || undefined;
                          })
                        }
                      />
                      <span>
                        🙈 <b className="text-gold">Hidden until unlocked</b> — don't show this choice at all until its gating is satisfied
                        (keeps sequential dialogue from spoiling upcoming questions).
                      </span>
                    </label>
                    <div className={`grid gap-1 ${c.reply ? "grid-cols-2" : "grid-cols-3"}`}>
                      <Field label="Attitude">
                        <select
                          className={inputCls}
                          value={c.attitudeTag ?? "Neutral"}
                          onChange={(e) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.choices!.find((x) => x.id === c.id)!.attitudeTag = e.target.value as never;
                            })
                          }
                        >
                          {["Neutral", "Sultry", "Aggressive", "Clever"].map((a) => (
                            <option key={a} value={a}>
                              {a === "Neutral" ? a : METER_LABELS[a as MeterKey]}
                            </option>
                          ))}
                        </select>
                      </Field>
                      {!c.reply && (
                        <Field label="Target" tip="Which room this button goes to. Pick one, or drag a line from this card.">
                          <select
                            className={inputCls}
                            value={c.targetSceneId}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.choices!.find((x) => x.id === c.id)!.targetSceneId = e.target.value;
                              })
                            }
                          >
                            <option value="">— dangling —</option>
                            {story.scenes.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.title}
                              </option>
                            ))}
                          </select>
                        </Field>
                      )}
                      <Field label="Timer (s) — conversation clock: a shrinking ring on this option, and when it runs out the player says nothing (routes to the timed-out scene below, or the reply just disappears)">
                        <input
                          type="number"
                          min={1}
                          max={120}
                          className={inputCls}
                          value={c.timeLimitSeconds ?? ""}
                          onChange={(e) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              s.choices!.find((x) => x.id === c.id)!.timeLimitSeconds = e.target.value
                                ? Number(e.target.value)
                                : undefined;
                            })
                          }
                        />
                      </Field>
                    </div>
                    {/* ---- Quick-time prompt ---- */}
                    <label className="flex items-center gap-2 border border-crimson/25 bg-crimson/5 p-1.5 text-[9px] text-paper/70">
                      <input
                        type="checkbox"
                        checked={!!c.quickTime}
                        onChange={(e) =>
                          mutate((d) => {
                            const s = d.scenes.find((x) => x.id === scene.id)!;
                            const ch = s.choices!.find((x) => x.id === c.id)!;
                            ch.quickTime = e.target.checked || undefined;
                            if (e.target.checked) {
                              ch.ride = undefined; // mutually exclusive with the ride minigame
                              ch.triangulate = undefined; // …and the triangulation bay
                            }
                            // A quick-time prompt with no timer produces no countdown
                            // ring or banner in-game. Give it a sensible default
                            // deadline so the feature is visible the moment it's on.
                            if (e.target.checked && !ch.timeLimitSeconds) ch.timeLimitSeconds = 5;
                          })
                        }
                      />
                      <span>
                        ⚡ <b className="text-crimson">Quick-time prompt</b> — a hard deadline with a big on-screen prompt and a countdown ring. Expiry routes to a "you hesitated" consequence path.
                      </span>
                    </label>
                    {c.quickTime && (
                      <div className="space-y-1.5 border border-crimson/25 bg-crimson/5 p-1.5">
                        <Field label="Timer (seconds) — the hard deadline (enables the countdown ring &amp; banner)">
                          <input
                            type="number"
                            min={1}
                            max={120}
                            className={inputCls}
                            value={c.timeLimitSeconds ?? ""}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.choices!.find((x) => x.id === c.id)!.timeLimitSeconds = e.target.value
                                  ? Number(e.target.value)
                                  : undefined;
                              })
                            }
                          />
                        </Field>
                        <Field label="Big on-screen prompt (defaults to the choice text)">
                          <input
                            className={inputCls}
                            placeholder="DECIDE!"
                            value={c.qtePrompt ?? ""}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.choices!.find((x) => x.id === c.id)!.qtePrompt = e.target.value || undefined;
                              })
                            }
                          />
                        </Field>
                        <div className="grid grid-cols-2 gap-1">
                          <label className="flex items-center gap-1 text-[9px] text-paper/60">
                            <input
                              type="checkbox"
                              checked={!!c.qteHeartbeat}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.choices!.find((x) => x.id === c.id)!.qteHeartbeat = e.target.checked || undefined;
                                })
                              }
                            />
                            💓 heartbeat sting
                          </label>
                          <label className="flex items-center gap-1 text-[9px] text-paper/60">
                            <input
                              type="checkbox"
                              checked={!!c.qteShakyCam}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.choices!.find((x) => x.id === c.id)!.qteShakyCam = e.target.checked || undefined;
                                })
                              }
                            />
                            📹 shaky cam on low time
                          </label>
                        </div>
                        <Field label="Timed-out target scene (the 'you hesitated' path — usually a consequence scene)">
                          <select
                            className={inputCls}
                            value={c.timedOutTargetSceneId ?? ""}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.choices!.find((x) => x.id === c.id)!.timedOutTargetSceneId = e.target.value || undefined;
                              })
                            }
                          >
                            <option value="">(default to the choice's own target)</option>
                            {story.scenes.map((s) => (
                              <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                          </select>
                        </Field>
                        <div className="grid grid-cols-2 gap-1">
                          <Field label="Timed-out sets flag (react to the silence)">
                            <FlagPicker
                              value={c.timedOutConsequences?.setFlags}
                              suggestions={allFlags}
                              onChange={(v) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  const ch = s.choices!.find((x) => x.id === c.id)!;
                                  ch.timedOutConsequences = { ...(ch.timedOutConsequences ?? {}), setFlags: v };
                                })
                              }
                            />
                          </Field>
                          <Field label="Timed-out Heat delta">
                            <input
                              type="number"
                              className={inputCls}
                              value={c.timedOutConsequences?.meterChanges?.find((m) => m.meter === "Suspicion")?.delta ?? ""}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  const ch = s.choices!.find((x) => x.id === c.id)!;
                                  const list = (ch.timedOutConsequences?.meterChanges ?? []).filter((x) => x.meter !== "Suspicion");
                                  if (e.target.value !== "" && Number(e.target.value) !== 0)
                                    list.push({ meter: "Suspicion", delta: Number(e.target.value) });
                                  ch.timedOutConsequences = { ...(ch.timedOutConsequences ?? {}), meterChanges: list.length ? list : undefined };
                                })
                              }
                            />
                          </Field>
                        </div>
                      </div>
                    )}
                    {/* ---- CHANCE GAMBLE (a dice roll on the choice itself) ---- */}
                    <label className="flex items-center gap-2 border border-neon/25 bg-neon/5 p-1.5 text-[9px] text-paper/70">
                      <input
                        type="checkbox"
                        checked={typeof c.chance === "number"}
                        onChange={(e) =>
                          mutate((d) => {
                            const s = d.scenes.find((x) => x.id === scene.id)!;
                            const ch = s.choices!.find((x) => x.id === c.id)!;
                            ch.chance = e.target.checked ? (ch.chance ?? 50) : undefined;
                          })
                        }
                      />
                      <span>
                        🎲 <b className="text-neon">Chance gamble</b> — this choice is a bet: on pick, the engine rolls the odds (one seeded draw) and routes hit/miss.
                      </span>
                    </label>
                    {typeof c.chance === "number" && (
                      <div className="space-y-1 border-l-2 border-neon/40 pl-2">
                        <div className="grid grid-cols-2 gap-1">
                          <Field label="Odds of success (%)">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              className={inputCls}
                              value={Math.round(c.chance)}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  const ch = s.choices!.find((x) => x.id === c.id)!;
                                  const v = Number(e.target.value);
                                  ch.chance = Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 50;
                                })
                              }
                            />
                          </Field>
                          <Field label="Miss route (the 'it didn't work' path)">
                            <select
                              className={inputCls}
                              value={c.failTargetSceneId ?? ""}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.choices!.find((x) => x.id === c.id)!.failTargetSceneId = e.target.value || undefined;
                                })
                              }
                            >
                              <option value="">(a miss still takes the normal target)</option>
                              {story.scenes.map((s) => (
                                <option key={s.id} value={s.id}>{s.title}</option>
                              ))}
                            </select>
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <Field label="Miss sets flag">
                            <FlagPicker
                              value={c.failConsequences?.setFlags}
                              suggestions={allFlags}
                              onChange={(v) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  const ch = s.choices!.find((x) => x.id === c.id)!;
                                  ch.failConsequences = { ...(ch.failConsequences ?? {}), setFlags: v };
                                })
                              }
                            />
                          </Field>
                          <Field label="Miss Heat delta">
                            <input
                              type="number"
                              className={inputCls}
                              value={c.failConsequences?.meterChanges?.find((m) => m.meter === "Suspicion")?.delta ?? ""}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  const ch = s.choices!.find((x) => x.id === c.id)!;
                                  const list = (ch.failConsequences?.meterChanges ?? []).filter((x) => x.meter !== "Suspicion");
                                  if (e.target.value !== "" && Number(e.target.value) !== 0)
                                    list.push({ meter: "Suspicion", delta: Number(e.target.value) });
                                  ch.failConsequences = { ...(ch.failConsequences ?? {}), meterChanges: list.length ? list : undefined };
                                })
                              }
                            />
                          </Field>
                        </div>
                        <p className="text-[9px] leading-snug text-paper/45">
                          Hit → the normal target + its consequences. Miss → the miss route + the miss consequences above. Either
                          way the engine sets the flag <code>chance:&lt;scene&gt;:&lt;choice&gt;:hit|miss</code>, so later beats and
                          gates can react to how the dice landed. The roll is part of the seeded run — a <code>?seed=</code> replay
                          reproduces the exact dice.
                        </p>
                      </div>
                    )}
                    {/* ---- Ride minigame (road chase) ---- */}
                    <label className="flex items-center gap-2 border border-emerald-500/25 bg-emerald-500/5 p-1.5 text-[9px] text-paper/70">
                      <input
                        type="checkbox"
                        checked={!!c.ride}
                        onChange={(e) =>
                          mutate((d) => {
                            const s = d.scenes.find((x) => x.id === scene.id)!;
                            const ch = s.choices!.find((x) => x.id === c.id)!;
                            if (e.target.checked) {
                              ch.ride = ch.ride ?? {};
                              ch.quickTime = undefined; // mutually exclusive with quick-time
                              ch.triangulate = undefined; // …and with the triangulation bay
                            } else {
                              ch.ride = undefined;
                            }
                          })
                        }
                      />
                      <span>
                        🏍 <b className="text-emerald-400">Ride minigame</b> — a steerable road chase (dodge oncoming traffic). Survive to the target; crash routes to the timed-out target. Mutually exclusive with quick-time.
                      </span>
                    </label>
                    {c.ride && (
                      <div className="space-y-1.5 border border-emerald-500/25 bg-emerald-500/5 p-1.5">
                        <Field label="Big on-screen prompt (defaults to 'RIDE')">
                          <input
                            className={inputCls}
                            placeholder="OUTRUN THE MIDNIGHT PACK"
                            value={c.ride.prompt ?? ""}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.choices!.find((x) => x.id === c.id)!.ride!.prompt = e.target.value || undefined;
                              })
                            }
                          />
                        </Field>
                        <div className="grid grid-cols-2 gap-1">
                          <Field label="Lanes (2–5)">
                            <input
                              type="number"
                              min={2}
                              max={5}
                              className={inputCls}
                              value={c.ride.lanes ?? 3}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.choices!.find((x) => x.id === c.id)!.ride!.lanes = Number(e.target.value) || 3;
                                })
                              }
                            />
                          </Field>
                          <Field label="Duration (seconds)">
                            <input
                              type="number"
                              min={4}
                              max={120}
                              className={inputCls}
                              value={c.ride.durationSeconds ?? 18}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.choices!.find((x) => x.id === c.id)!.ride!.durationSeconds = Number(e.target.value) || 18;
                                })
                              }
                            />
                          </Field>
                          <Field label="Spawn rate (ms)">
                            <input
                              type="number"
                              min={400}
                              max={5000}
                              className={inputCls}
                              value={c.ride.spawnMs ?? 1200}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.choices!.find((x) => x.id === c.id)!.ride!.spawnMs = Number(e.target.value) || 1200;
                                })
                              }
                            />
                          </Field>
                          <Field label="Traffic speed (screen-heights/sec)">
                            <input
                              type="number"
                              min={0.2}
                              max={2}
                              step={0.05}
                              className={inputCls}
                              value={c.ride.speed ?? 0.5}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.choices!.find((x) => x.id === c.id)!.ride!.speed = Number(e.target.value) || 0.5;
                                })
                              }
                            />
                          </Field>
                        </div>
                        <Field label="Rider's vehicle (pick from the library — or type an emoji: tag / glyph)">
                          <input
                            className={inputCls}
                            placeholder="emoji:🏍 — or pick art below"
                            value={c.ride.vehicleImage ?? ""}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.choices!.find((x) => x.id === c.id)!.ride!.vehicleImage = e.target.value || undefined;
                              })
                            }
                          />
                          <div className="mt-1">
                            <ImagePicker
                              value={c.ride.vehicleImage && !c.ride.vehicleImage.startsWith("emoji:") ? c.ride.vehicleImage : undefined}
                              onChange={(v) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.choices!.find((x) => x.id === c.id)!.ride!.vehicleImage = v || undefined;
                                })
                              }
                              placeholder="…or pick art from the image library"
                              preferFolder="sprites"
                            />
                          </div>
                        </Field>
                        <Field label="Oncoming traffic (comma-separated — emoji: tags, glyphs, or picked art)">
                          <input
                            className={inputCls}
                            placeholder="emoji:🚚, emoji:🚗, emoji:🚓"
                            value={c.ride.traffic?.join(", ") ?? ""}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                const list = e.target.value.split(",").map((x) => x.trim()).filter(Boolean);
                                s.choices!.find((x) => x.id === c.id)!.ride!.traffic = list.length ? list : undefined;
                              })
                            }
                          />
                          <div className="mt-1">
                            <ImagePicker
                              value={undefined}
                              onChange={(v) => {
                                if (!v) return;
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  const list = [...(s.choices!.find((x) => x.id === c.id)!.ride!.traffic ?? []), v];
                                  s.choices!.find((x) => x.id === c.id)!.ride!.traffic = list;
                                });
                              }}
                              placeholder="＋ add a vehicle from the image library…"
                              preferFolder="sprites"
                              allowClear={false}
                            />
                          </div>
                        </Field>
                        <div className="grid grid-cols-2 gap-1">
                          <Field label="Win caption (clean run)">
                            <input
                              className={inputCls}
                              placeholder="You catch him."
                              value={c.ride.winText ?? ""}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.choices!.find((x) => x.id === c.id)!.ride!.winText = e.target.value || undefined;
                                })
                              }
                            />
                          </Field>
                          <Field label="Crash caption">
                            <input
                              className={inputCls}
                              placeholder="You went down."
                              value={c.ride.crashText ?? ""}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.choices!.find((x) => x.id === c.id)!.ride!.crashText = e.target.value || undefined;
                                })
                              }
                            />
                          </Field>
                        </div>
                      </div>
                    )}
                    {/* ---- Triangulation minigame (3D signal fix) ---- */}
                    <label className="flex items-center gap-2 border border-[#7de2ff]/25 bg-[#7de2ff]/5 p-1.5 text-[9px] text-paper/70">
                      <input
                        type="checkbox"
                        checked={!!c.triangulate}
                        onChange={(e) =>
                          mutate((d) => {
                            const s = d.scenes.find((x) => x.id === scene.id)!;
                            const ch = s.choices!.find((x) => x.id === c.id)!;
                            if (e.target.checked) {
                              ch.triangulate = ch.triangulate ?? {};
                              // One minigame per choice — they all take over the screen.
                              ch.quickTime = undefined;
                              ch.ride = undefined;
                            } else {
                              ch.triangulate = undefined;
                            }
                          })
                        }
                      />
                      <span>
                        📡 <b className="text-[#7de2ff]">Triangulation minigame</b> — a 3D night bay (three.js): sweep a
                        directional antenna from each shore post, commit a bearing at the signal peak, and cross the
                        lines on the boat. A fix routes to the target; the clock routes to the timed-out target.
                        Mutually exclusive with quick-time and the ride.
                      </span>
                    </label>
                    {c.triangulate && (
                      <div className="space-y-1.5 border border-[#7de2ff]/25 bg-[#7de2ff]/5 p-1.5">
                        <p className="font-type text-[9px] leading-snug text-paper/45">
                          Difficulty is the relationship between <b>tolerance</b> and <b>bearings required</b>: the
                          signal lobe is 22° wide, so a careful sweep lands within ~1.5° and a fix inside ~2 units.
                          Tolerance 9 with 3 bearings is a fair test; drop the tolerance to tighten the screws.
                        </p>
                        <Field label="Big on-screen prompt">
                          <input
                            className={inputCls}
                            placeholder="Triangulate the signal"
                            value={c.triangulate.prompt ?? ""}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                s.choices!.find((x) => x.id === c.id)!.triangulate!.prompt = e.target.value || undefined;
                              })
                            }
                          />
                        </Field>
                        <div className="grid grid-cols-2 gap-1">
                          <Field label="Seconds on the clock">
                            <input
                              type="number"
                              min={10}
                              max={180}
                              className={inputCls}
                              value={c.triangulate.durationSeconds ?? 45}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.choices!.find((x) => x.id === c.id)!.triangulate!.durationSeconds =
                                    Number(e.target.value) || 45;
                                })
                              }
                            />
                          </Field>
                          <Field label="Crossing tolerance (world units)">
                            <input
                              type="number"
                              min={2}
                              max={30}
                              className={inputCls}
                              value={c.triangulate.toleranceMeters ?? 9}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.choices!.find((x) => x.id === c.id)!.triangulate!.toleranceMeters =
                                    Number(e.target.value) || 9;
                                })
                              }
                            />
                          </Field>
                          <Field label="Bearings required to call a fix">
                            <input
                              type="number"
                              min={2}
                              max={6}
                              className={inputCls}
                              value={c.triangulate.bearingsRequired ?? 3}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.choices!.find((x) => x.id === c.id)!.triangulate!.bearingsRequired =
                                    Number(e.target.value) || 3;
                                })
                              }
                            />
                          </Field>
                          <Field label="Bearings allowed (the margin for error)">
                            <input
                              type="number"
                              min={2}
                              max={12}
                              className={inputCls}
                              value={c.triangulate.bearingsAllowed ?? 5}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.choices!.find((x) => x.id === c.id)!.triangulate!.bearingsAllowed =
                                    Number(e.target.value) || 5;
                                })
                              }
                            />
                          </Field>
                        </div>
                        <Field label="Shore posts — one per line as x,z,label (blank = the three default posts)">
                          <textarea
                            className={`${inputCls} h-16 font-mono text-[10px]`}
                            placeholder={"-38,34,Post A — Dinner Key\n40,30,Post B — Rickenbacker\n2,-40,Post C — Coast Guard"}
                            value={(c.triangulate.posts ?? [])
                              .map((p) => `${p.x},${p.z}${p.label ? `,${p.label}` : ""}`)
                              .join("\n")}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                const list = e.target.value
                                  .split("\n")
                                  .map((row) => row.trim())
                                  .filter(Boolean)
                                  .map((row) => {
                                    const [x, z, ...rest] = row.split(",");
                                    return { x: Number(x) || 0, z: Number(z) || 0, label: rest.join(",").trim() || undefined };
                                  });
                                s.choices!.find((x) => x.id === c.id)!.triangulate!.posts = list.length >= 2 ? list : undefined;
                              })
                            }
                          />
                        </Field>
                        <Field label="Boat position — x,z (blank = a seeded random spot, different each playthrough)">
                          <input
                            className={`${inputCls} font-mono text-[10px]`}
                            placeholder="blank = random"
                            value={c.triangulate.target ? `${c.triangulate.target.x},${c.triangulate.target.z}` : ""}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                const raw = e.target.value.trim();
                                const [x, z] = raw.split(",");
                                s.choices!.find((x2) => x2.id === c.id)!.triangulate!.target =
                                  raw && z !== undefined ? { x: Number(x) || 0, z: Number(z) || 0 } : undefined;
                              })
                            }
                          />
                        </Field>
                        <div className="grid grid-cols-2 gap-1">
                          <Field label="Win caption">
                            <input
                              className={inputCls}
                              placeholder="Fix confirmed"
                              value={c.triangulate.winText ?? ""}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.choices!.find((x) => x.id === c.id)!.triangulate!.winText = e.target.value || undefined;
                                })
                              }
                            />
                          </Field>
                          <Field label="Out-of-time caption">
                            <input
                              className={inputCls}
                              placeholder="Signal lost"
                              value={c.triangulate.failText ?? ""}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  s.choices!.find((x) => x.id === c.id)!.triangulate!.failText = e.target.value || undefined;
                                })
                              }
                            />
                          </Field>
                        </div>
                      </div>
                    )}
                    <label className="flex items-center gap-2 border border-noir-600/60 p-1.5 text-[9px] text-paper/55">
                      <input
                        type="checkbox"
                        checked={c.isRepeatable ?? !Object.values(c.consequences ?? {}).some((value) => Array.isArray(value) && value.length > 0)}
                        onChange={(e) =>
                          mutate((d) => {
                            const s = d.scenes.find((x) => x.id === scene.id)!;
                            s.choices!.find((x) => x.id === c.id)!.isRepeatable = e.target.checked;
                          })
                        }
                      />
                      <span>
                        <b className="text-gold">Repeatable choice</b> — enable only for navigation/backtracking. Reward, trust and meter choices should stay one-shot.
                      </span>
                    </label>
                    <Field label="Exclusive group (optional — choosing one resolves all with the same group)">
                      <input
                        className={inputCls}
                        placeholder="e.g. opening-approach"
                        value={c.exclusiveGroup ?? ""}
                        onChange={(e) =>
                          mutate((d) => {
                            const s = d.scenes.find((x) => x.id === scene.id)!;
                            s.choices!.find((x) => x.id === c.id)!.exclusiveGroup = e.target.value || undefined;
                          })
                        }
                      />
                    </Field>
                    <Field label="Memory tag (memoryLog) — record this choice so an NPC can recall it later. Use matching tags in a beat's 'Memories recalled'.">
                      <input
                        className={inputCls}
                        placeholder="e.g. opening_sultry"
                        value={c.memoryLog ?? ""}
                        onChange={(e) =>
                          mutate((d) => {
                            const s = d.scenes.find((x) => x.id === scene.id)!;
                            s.choices!.find((x) => x.id === c.id)!.memoryLog = e.target.value || undefined;
                          })
                        }
                      />
                    </Field>
                    <Field label="&quot;X will remember that&quot; card (impact card shown after picking this choice)">
                      <input
                        className={inputCls}
                        placeholder="e.g. Lydia will remember that."
                        value={c.rememberLine ?? ""}
                        onChange={(e) =>
                          mutate((d) => {
                            const s = d.scenes.find((x) => x.id === scene.id)!;
                            s.choices!.find((x) => x.id === c.id)!.rememberLine = e.target.value || undefined;
                          })
                        }
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-1">
                      <Field label="Sets flags">
                        <FlagPicker
                          value={c.consequences?.setFlags}
                          suggestions={allFlags}
                          onChange={(v) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              const ch = s.choices!.find((x) => x.id === c.id)!;
                              ch.consequences = { ...(ch.consequences ?? {}), setFlags: v };
                            })
                          }
                        />
                      </Field>
                      <Field label="Clears flags (undoes previous choices)">
                        <FlagPicker
                          value={c.consequences?.clearFlags}
                          suggestions={allFlags}
                          onChange={(v) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              const ch = s.choices!.find((x) => x.id === c.id)!;
                              ch.consequences = { ...(ch.consequences ?? {}), clearFlags: v };
                            })
                          }
                        />
                      </Field>
                      <Field label="Reward item">
                        <select
                          className={inputCls}
                          value={c.consequences?.addItems?.[0] ?? ""}
                          onChange={(e) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              const ch = s.choices!.find((x) => x.id === c.id)!;
                              ch.consequences = {
                                ...(ch.consequences ?? {}),
                                addItems: e.target.value ? [e.target.value] : undefined,
                              };
                            })
                          }
                        >
                          <option value="">— none —</option>
                          {story.items.map((it) => (
                            <option key={it.id} value={it.id}>{it.icon} {it.name}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label="Consume item">
                      <select
                        className={inputCls}
                        value={c.consequences?.removeItems?.[0] ?? ""}
                        onChange={(e) =>
                          mutate((d) => {
                            const s = d.scenes.find((x) => x.id === scene.id)!;
                            const ch = s.choices!.find((x) => x.id === c.id)!;
                            ch.consequences = {
                              ...(ch.consequences ?? {}),
                              removeItems: e.target.value ? [e.target.value] : undefined,
                            };
                          })
                        }
                      >
                        <option value="">— none —</option>
                        {story.items.map((it) => (
                          <option key={it.id} value={it.id}>{it.icon} {it.name}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Present item (the noir verb — show it to the character)">
                      <div className="flex items-center gap-2">
                        <select
                          className={inputCls}
                          value={c.presentItem ?? ""}
                          onChange={(e) =>
                            mutate((d) => {
                              const s = d.scenes.find((x) => x.id === scene.id)!;
                              const ch = s.choices!.find((x) => x.id === c.id)!;
                              ch.presentItem = e.target.value || undefined;
                            })
                          }
                        >
                          <option value="">— none —</option>
                          {story.items.map((it) => (
                            <option key={it.id} value={it.id}>{it.icon} {it.name}</option>
                          ))}
                        </select>
                        <label
                          className="flex shrink-0 items-center gap-1 text-[9px] text-paper/55"
                          title="Hand it over: the item leaves your inventory (they keep it). Off = you flash it and keep it."
                        >
                          <input
                            type="checkbox"
                            disabled={!c.presentItem}
                            checked={!!c.consumePresentedItem}
                            onChange={(e) =>
                              mutate((d) => {
                                const s = d.scenes.find((x) => x.id === scene.id)!;
                                const ch = s.choices!.find((x) => x.id === c.id)!;
                                ch.consumePresentedItem = e.target.checked || undefined;
                              })
                            }
                          />
                          hand it over
                        </label>
                      </div>
                      <p className="mt-1 font-type text-[9px] leading-snug text-paper/40">
                        The choice locks (and, if hidden, stays hidden) until the player holds the item. Presenting
                        records <code>item:{c.presentItem ?? "…"}</code> as a memory — recall it in a beat
                        (<code>{'recalls: { "item:photo": "You flashed {said}." }'}</code>, where <code>{"{said}"}</code> = the
                        item's name) or gate on it with "Remembers".
                      </p>
                    </Field>
                    <Field label="Meter deltas (Chm/Int/Ded/Heat)">
                      <div className="grid grid-cols-4 gap-1">
                        {METERS.map((m) => {
                          const cur = c.consequences?.meterChanges?.find((x) => x.meter === m)?.delta ?? "";
                          return (
                            <input
                              key={m}
                              type="number"
                              title={METER_LABELS[m]}
                              placeholder={METER_SHORT[m]}
                              className={inputCls}
                              value={cur}
                              onChange={(e) =>
                                mutate((d) => {
                                  const s = d.scenes.find((x) => x.id === scene.id)!;
                                  const ch = s.choices!.find((x) => x.id === c.id)!;
                                  const list = (ch.consequences?.meterChanges ?? []).filter((x) => x.meter !== m);
                                  if (e.target.value !== "" && Number(e.target.value) !== 0)
                                    list.push({ meter: m, delta: Number(e.target.value) });
                                  ch.consequences = { ...(ch.consequences ?? {}), meterChanges: list.length ? list : undefined };
                                })
                              }
                            />
                          );
                        })}
                      </div>
                    </Field>
                    {story.characters.length > 0 && (
                      <Field label="Trust deltas — how this reply moves each person's trust (-5…+5)">
                        <div className="grid grid-cols-2 gap-1">
                          {story.characters.map((ch) => {
                            const cur = c.consequences?.trustChanges?.find((x) => x.characterId === ch.id)?.delta ?? "";
                            return (
                              <label key={ch.id} className="flex items-center gap-1 text-[9px] text-paper/60">
                                <span className="w-16 truncate">{ch.name.split(" ")[0]}</span>
                                <input
                                  type="number"
                                  className={inputCls}
                                  value={cur}
                                  onChange={(e) =>
                                    mutate((d) => {
                                      const s = d.scenes.find((x) => x.id === scene.id)!;
                                      const choice = s.choices!.find((x) => x.id === c.id)!;
                                      const list = (choice.consequences?.trustChanges ?? []).filter((x) => x.characterId !== ch.id);
                                      if (e.target.value !== "" && Number(e.target.value) !== 0)
                                        list.push({ characterId: ch.id, delta: Number(e.target.value) });
                                      choice.consequences = { ...(choice.consequences ?? {}), trustChanges: list.length ? list : undefined };
                                    })
                                  }
                                />
                              </label>
                            );
                          })}
                        </div>
                      </Field>
                    )}
                    <GatingEditor
                      sectionId={`choice-${c.id}`}
                      gating={c.gating}
                      items={story.items}
                      characters={story.characters}
                      flags={allFlags}
                      memoryTags={recallSuggestions}
                      onChange={(g) =>
                        mutate((d) => {
                          const s = d.scenes.find((x) => x.id === scene.id)!;
                          s.choices!.find((x) => x.id === c.id)!.gating = g;
                        })
                      }
                    />
                    </CollapsibleSection>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const id = `c_${uid()}`;
                    mutate((d) => {
                      const s = d.scenes.find((x) => x.id === scene.id)!;
                      s.choices = s.choices ?? [];
                      s.choices.push({ id, text: "A new dangerous idea...", targetSceneId: "", attitudeTag: "Neutral" });
                    });
                    setFocusedChoiceId(id);
                    window.setTimeout(() => setFocusedChoiceId(null), 1600);
                  }}
                  className="w-full border border-neon/50 py-1.5 font-pulp text-[10px] uppercase tracking-widest text-neon hover:bg-neon/10"
                  title="Add a button the player can press. Then pick which room it goes to."
                >
                  ＋ Add choice
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showHelp && <StudioHelpModal onClose={() => setShowHelp(false)} onOpenManual={onOpenManual} />}
      <StudioTipLayer />

      {exportPayload !== null && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setExportPayload(null)}
        >
          <DialogFrame label="Export reel" onDismiss={() => setExportPayload(null)}
            className="pop-in flex max-h-[85vh] w-full max-w-2xl flex-col border-2 border-gold/60 bg-noir-950 shadow-[0_0_60px_rgba(232,178,60,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gold/30 px-4 py-2">
              <h3 className="font-pulp text-sm uppercase tracking-wide text-gold">
                ⇩ Export "{story.title}" · {(exportPayload.length / 1024).toFixed(0)} KB
              </h3>
              <button onClick={() => setExportPayload(null)} className="px-2 text-lg leading-none text-paper/60 hover:text-neon" aria-label="Close export">
                ✕
              </button>
            </div>
            <p className="border-b border-noir-700 px-4 py-2 font-type text-[10px] text-paper/55">
              Self-contained .reel.json — includes every uploaded image, voice line, and video in this case. Import it from any
              newsstand or Studio to restore it exactly.
              {exportPayload.length > EXPORT_PREVIEW_LIMIT && <strong className="mt-1 block text-amber-300">Large reel: the box below is a truncated preview. Download / Copy JSON include the COMPLETE file.</strong>}
            </p>
            <textarea
              id="reel-export-textarea"
              aria-label={exportPayload.length > EXPORT_PREVIEW_LIMIT ? "Export preview (truncated)" : "Exported reel JSON"}
              wrap="off"
              readOnly
              spellCheck={false}
              value={exportPreviewText(exportPayload)}
              className="min-h-0 flex-1 resize-none border-b border-noir-700 bg-noir-900 p-3 font-mono text-[10px] leading-relaxed text-paper/70 outline-none"
            />
            <div className="flex items-center gap-2 px-4 py-3">
              <button
                onClick={downloadExportPayload}
                className="border border-emerald-500/60 bg-emerald-500/10 px-4 py-2 font-pulp text-[10px] uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/20"
              >
                ⇩ Download .reel.json
              </button>
              <button
                onClick={copyExportPayload}
                className="border border-cyan-neon/60 bg-cyan-neon/10 px-4 py-2 font-pulp text-[10px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/20"
              >
                ⎘ Copy JSON
              </button>
              <span className="ml-auto font-type text-[10px] text-paper/45">
                If download is blocked, Copy and save it as <b>{story.id}.reel.json</b>.
              </span>
            </div>
          </DialogFrame>
        </div>
      )}

        <style>{`
.btn-tool{display:inline-flex;align-items:center;gap:.3rem;border:1px solid #26263a;background:#13131f;color:#b6abd0;padding:4px 9px;border-radius:6px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Noto Emoji Variable",sans-serif;font-size:11px;font-weight:500;letter-spacing:.01em;line-height:1;cursor:pointer;transition:background-color .12s,border-color .12s,color .12s}
.btn-tool:hover{border-color:#ff2e88;color:#fff;background:#1a1326}
.btn-tool:disabled{opacity:.3;pointer-events:none}
.btn-tool.is-active{border-color:#ff2e88;color:#ff7ac0;background:#1a1326}
.btn-danger:hover{border-color:#e23b4e;color:#ff7180;background:#1d1014}
.btn-go{display:inline-flex;align-items:center;gap:.3rem;border:1px solid #b8862f;background:#2a2110;color:#f4cf6b;padding:4px 11px;border-radius:6px;font-family:ui-sans-serif,system-ui,"Noto Emoji Variable",sans-serif;font-size:11px;font-weight:600;line-height:1;cursor:pointer}
.btn-go:hover{background:#3a2c14;color:#ffd97a}
.btn-ok{display:inline-flex;align-items:center;gap:.3rem;border:1px solid #1f6f74;background:#0f2a2c;color:#56d6db;padding:4px 11px;border-radius:6px;font-family:ui-sans-serif,system-ui,"Noto Emoji Variable",sans-serif;font-size:11px;font-weight:600;line-height:1;cursor:pointer}
.btn-ok:hover{background:#103438;color:#7ef0f5}
.tb-sep{display:inline-block;width:1px;height:18px;background:#2a2a3a;margin:0 .3rem;flex:0 0 auto}
.tb-status{font-family:ui-sans-serif,system-ui,"Noto Emoji Variable",sans-serif;font-size:10px;letter-spacing:.04em;text-transform:uppercase}
.tb-input,.tb-select{border:1px solid #26263a;background:#13131f;color:#e9e2f3;border-radius:6px;padding:4px 8px;font-family:ui-sans-serif,system-ui,"Noto Emoji Variable",sans-serif;font-size:11px;line-height:1;outline:none}
.tb-input:focus,.tb-select:focus{border-color:#ff2e88}
.studio-tip-bubble{position:fixed;z-index:200;pointer-events:none;max-width:min(280px,calc(100vw - 16px));padding:8px 10px;background:#14141f;border:1px solid #e8b23c;color:#f2e8d5;font-family:Newsreader,Georgia,serif;font-size:12px;line-height:1.35;box-shadow:0 8px 28px rgba(0,0,0,.55);white-space:pre-wrap}
`}</style>
      </div>
    </MediaResolverContext.Provider>
  );
}

import type { TitleTheme } from "../types";

export function Studio(props: {
  baseStories: Story[];
  initialStoryId?: string;
  initialSceneId?: string;
  onExit: () => void;
  onPlay: (story: Story, opts?: { fromSceneId?: string }) => void;
  onPublish: (story: Story) => boolean;
  onDeleteStory: (storyId: string, deleteMedia?: boolean) => boolean;
  onCreateStory: (story: Story) => boolean;
  onUpdateTitleTheme: (theme: TitleTheme) => void;
  onOpenManual?: () => void;
}) {
  // GUARD — StudioInner opens `baseStories[0]` when there is no remembered or
  // requested story, so an empty catalogue crashed the whole app with
  // "Cannot read properties of undefined (reading 'id')" before anything
  // rendered. A caller passing an empty list is a bug, but it must not take
  // the editor down with no way back to the newsstand.
  if (props.baseStories.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-noir-950 p-8 text-center">
        <div className="font-pulp text-sm uppercase tracking-[0.3em] text-crimson">No cases to edit</div>
        <p className="max-w-sm font-type text-[12px] text-paper/60">
          Studio needs at least one case in the catalogue. Head back to the newsstand and create or restore one.
        </p>
        <button
          onClick={props.onExit}
          className="border border-gold/60 px-4 py-1.5 font-pulp text-[10px] uppercase tracking-widest text-gold hover:bg-gold/10"
        >
          ← Back to the newsstand
        </button>
      </div>
    );
  }
  return (
    <ReactFlowProvider>
      <StudioInner {...props} />
    </ReactFlowProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  travel-map editor (🗺 Map tab)                                     */
/* ------------------------------------------------------------------ */

/**
 * Editor for Story.map — the flag-gated travel screen. Pins are placed by
 * clicking the preview (the selected location moves to where you click), and
 * unlocking uses the same gating vocabulary as choices: a comma-separated
 * flag list here writes `gating.requiresFlags`. Deleting the last location
 * removes `story.map` entirely so the player-side map vanishes cleanly.
 */
function MapEditor({ story, onUpdate }: { story: Story; onUpdate: (s: Story) => void }) {
  const map = story.map ?? { locations: [] };
  const resolveMedia = useResolvedMedia(story.id);
  const flags = useMemo(() => collectFlags(story), [story]);
  const [selectedLocId, setSelectedLocId] = useState<string | null>(map.locations[0]?.id ?? null);
  const previewRef = useRef<HTMLDivElement>(null);

  const setMap = (patch: Partial<typeof map>) => onUpdate({ ...story, map: { ...map, ...patch } });
  const updateLoc = (id: string, patch: Partial<MapLocation>) =>
    setMap({ locations: map.locations.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  const removeLoc = (id: string) => {
    const rest = map.locations.filter((l) => l.id !== id);
    if (rest.length === 0 && !map.backgroundImage && !map.title) {
      const { map: _gone, ...noMap } = story;
      onUpdate(noMap as Story);
    } else {
      setMap({ locations: rest });
    }
    if (selectedLocId === id) setSelectedLocId(rest[0]?.id ?? null);
  };
  const addLoc = () => {
    const id = `loc-${Date.now().toString(36)}`;
    const loc: MapLocation = {
      id,
      label: `Location ${map.locations.length + 1}`,
      targetSceneId: story.scenes[0]?.id ?? "",
      x: 20 + ((map.locations.length * 17) % 60),
      y: 25 + ((map.locations.length * 23) % 50),
    };
    setMap({ locations: [...map.locations, loc] });
    setSelectedLocId(id);
  };

  const bgRaw = map.backgroundImage;
  const bgResolved = resolveMedia(bgRaw) ?? bgRaw;
  const bgStyle: React.CSSProperties = bgResolved
    ? bgResolved.startsWith("gradient:")
      ? { background: bgResolved.slice(9) }
      : { backgroundImage: `url(${assetUrl(bgResolved)})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: "linear-gradient(160deg,#14141f 0%,#0c0c14 70%)" };

  const placePin = (e: React.MouseEvent) => {
    if (!selectedLocId || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
    updateLoc(selectedLocId, { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  };

  const selected = map.locations.find((l) => l.id === selectedLocId) ?? null;

  return (
    <div className="space-y-3">
      <div className="border border-gold/30 bg-gold/5 p-2">
        <div className="font-pulp text-[10px] uppercase tracking-widest text-gold">🗺 Travel Map</div>
        <p className="mt-1 font-type text-[10px] leading-snug text-paper/55">
          A screen of destinations the player can jump to (menu → 🗺 Travel map, or T). Each location
          unlocks when its required flags are set — earn the tip, open the door. Locked pins show as
          “???” unless you hide them entirely. In play, travel resolves through note placeholders like
          every other route, and the validator checks every pin.
        </p>
      </div>

      <Field label="Map title (heading on the player's screen)">
        <input className={inputCls} value={map.title ?? ""} placeholder="Travel Map"
          onChange={(e) => setMap({ title: e.target.value || undefined })} />
      </Field>

      <Field label="Map artwork (pins are placed on this)">
        <ImagePicker value={map.backgroundImage} storyId={story.id}
          onChange={(v) => setMap({ backgroundImage: v })} placeholder="Pick the map image…" />
      </Field>

      {/* ---- map absorbs pure travel choices ---- */}
      <div className="space-y-1 border border-gold/30 bg-gold/5 p-2">
        <label className="flex items-start gap-2 text-[10px] uppercase tracking-wider text-paper/70">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={!!map.replaceTravelChoices}
            onChange={(e) => setMap({ replaceTravelChoices: e.target.checked || undefined })}
          />
          <span>🗺 Map absorbs travel choices</span>
        </label>
        <p className="font-type text-[9px] leading-snug text-paper/45">
          When on, a choice whose ONLY job is going to a scene an unlocked pin also reaches is hidden in
          play — the choice rail shows a single “🗺 Open the map” action instead, so travel has one home.
          Safety rails: choices that set flags, move meters, give items, reply in place, present evidence
          or run a timer are NEVER absorbed (the map applies no consequences), and a locked pin never
          absorbs a choice — the authored line stays until the pin is earned. Your choices are untouched
          in the draft; this is purely a play-time swap.
        </p>
      </div>

      {/* click-to-place preview */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="font-pulp text-[9px] uppercase tracking-widest text-paper/50">
            {selected ? `Click the map to place “${selected.label}”` : "Add a location, then click the map to place its pin"}
          </span>
          <button onClick={addLoc} className="border border-gold/60 px-2 py-0.5 font-pulp text-[9px] uppercase tracking-widest text-gold hover:bg-gold/15">
            + Add location
          </button>
        </div>
        <div ref={previewRef} onClick={placePin}
          className={`relative aspect-video w-full overflow-hidden border-2 border-noir-600 ${selected ? "cursor-crosshair" : ""}`}
          style={bgStyle}>
          {map.locations.map((loc) => (
            <button
              key={loc.id}
              onClick={(e) => { e.stopPropagation(); setSelectedLocId(loc.id); }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
              title={`${loc.label} → ${story.scenes.find((s) => s.id === loc.targetSceneId)?.title ?? loc.targetSceneId}`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${
                loc.id === selectedLocId ? "border-neon bg-neon/25" : "border-gold bg-noir-950/85"
              }`}>
                {loc.icon ?? (loc.gating ? "🔒" : "📍")}
              </span>
              <span className={`mt-0.5 block whitespace-nowrap border px-1 font-pulp text-[8px] uppercase tracking-widest backdrop-blur-sm ${
                loc.id === selectedLocId ? "border-neon/60 bg-noir-950/85 text-neon" : "border-gold/50 bg-noir-950/85 text-gold"
              }`}>
                {loc.label}
              </span>
            </button>
          ))}
          {map.locations.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center font-type text-xs italic text-paper/45">
              No locations yet — “+ Add location” to drop the first pin.
            </div>
          )}
        </div>
      </div>

      {/* per-location editors */}
      <div className="space-y-2">
        {map.locations.map((loc) => {
          const gateFlags = loc.gating?.requiresFlags ?? [];
          const isSel = loc.id === selectedLocId;
          return (
            <div key={loc.id}
              className={`space-y-1.5 border p-2 ${isSel ? "border-neon/60 bg-neon/5" : "border-noir-600 bg-noir-900/50"}`}
              onClick={() => setSelectedLocId(loc.id)}>
              <div className="flex items-center gap-2">
                <input className={inputCls} value={loc.label}
                  onChange={(e) => updateLoc(loc.id, { label: e.target.value })} placeholder="Location name" />
                <input className={`${inputCls} !w-14 text-center`} value={loc.icon ?? ""} maxLength={4}
                  onChange={(e) => updateLoc(loc.id, { icon: e.target.value || undefined })} placeholder="📍" title="Pin emoji" />
                <button onClick={(e) => { e.stopPropagation(); removeLoc(loc.id); }}
                  className="shrink-0 border border-crimson/40 px-2 py-1 font-pulp text-[9px] uppercase text-crimson hover:bg-crimson/10">
                  ✕
                </button>
              </div>
              <Field label="Travels to scene">
                <select className={inputCls} value={loc.targetSceneId}
                  onChange={(e) => updateLoc(loc.id, { targetSceneId: e.target.value })}>
                  {story.scenes.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.nodeType === "note" ? `📝 ${sc.title} (note — passes through)` : sc.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Unlocked by flags (comma-separated — empty = always open)">
                <input className={inputCls} value={gateFlags.join(", ")} list={`map-flags-${story.id}`}
                  onChange={(e) => {
                    const requiresFlags = e.target.value.split(",").map((f) => f.trim()).filter(Boolean);
                    const gating: Gating | undefined = requiresFlags.length
                      ? { ...(loc.gating ?? {}), requiresFlags }
                      : (() => {
                          const { requiresFlags: _r, ...rest } = loc.gating ?? {};
                          return Object.keys(rest).length ? rest : undefined;
                        })();
                    updateLoc(loc.id, { gating });
                  }}
                  placeholder="e.g. found_pier_tip" />
              </Field>
              {!!loc.gating && (
                <>
                  <Field label="Teaser on the locked pin (else an automatic hint)">
                    <input className={inputCls} value={loc.lockedHint ?? ""}
                      onChange={(e) => updateLoc(loc.id, { lockedHint: e.target.value || undefined })}
                      placeholder="Someone in the diner knows the pier number…" />
                  </Field>
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-paper/60">
                    <input type="checkbox" checked={!!loc.hiddenWhenLocked}
                      onChange={(e) => updateLoc(loc.id, { hiddenWhenLocked: e.target.checked || undefined })} />
                    Hide the pin completely until unlocked (a secret place)
                  </label>
                </>
              )}
            </div>
          );
        })}
      </div>
      <datalist id={`map-flags-${story.id}`}>
        {flags.map((f) => <option key={f} value={f} />)}
      </datalist>
    </div>
  );
}
