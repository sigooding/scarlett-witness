/**
 * Kid-friendly Studio coaching — hover tips, a "what to do next" panel, and
 * an empty-canvas starter card.
 *
 * Nothing here removes a Studio feature. It only explains the existing tools
 * in plain language and points at the next useful click.
 */
import { useEffect, useState } from "react";
import type { SceneNode, Story } from "../types";
import type { ValidationIssue } from "../logic";

export type StudioTabId =
  | "scene"
  | "beats"
  | "hotspots"
  | "stage"
  | "choices"
  | "test"
  | "characters"
  | "audio"
  | "items"
  | "flags"
  | "briefing"
  | "acts"
  | "episodes"
  | "media"
  | "ai"
  | "dialogueBox"
  | "globalTitle"
  | "map";

/** Button labels — keep these exact; the Studio beta probe matches on them. */
export const TAB_LABELS: Record<StudioTabId, string> = {
  scene: "Scene",
  beats: "Beats",
  hotspots: "Hotspots",
  stage: "🚶 Stage",
  choices: "Choices",
  audio: "🔊 Audio",
  briefing: "🎯 Game Objective",
  characters: "Characters",
  items: "Items",
  flags: "🏷 Flags",
  acts: "🎭 Acts",
  episodes: "🎞 Episodes",
  media: "🛠 Media Tools",
  ai: "🎨 AI Images",
  map: "🗺 Map",
  dialogueBox: "🎮 In-Game Theme",
  globalTitle: "🎼 Newsstand Theme",
  test: "▶ Test",
};

/** Hover tips for inspector tabs — short, 12-year-old readable. */
export const TAB_TIPS: Record<StudioTabId, string> = {
  scene: "This room. Pick a picture and write what the player reads when they arrive.",
  beats: "Talking lines. Add a beat, pick who says it, type the words.",
  hotspots: "Clickable spots on the picture. Drag a box, then pick what happens — look, take, talk, or go.",
  stage: "Walk-around room. Place the detective, draw the floor, and put markers they can walk up to.",
  choices: "Buttons the player presses. Write the words, then pick which room it goes to.",
  audio: "Music and sounds for this room. You can skip this until the story works.",
  briefing: "The goal of your game in one sentence. What is the player trying to do?",
  characters: "People in your game. Give them a name and a face (an emoji is fine). They can talk in Beats.",
  items: "Things the player can pick up — a key, a note, a photo. Later a door can ask for one.",
  flags: "Secret checkboxes the game remembers, like “found the key”. They appear when you use them.",
  acts: "Split a long game into chapters. Optional — skip this for a short story.",
  episodes: "Turn the case into a season of episodes. Optional extra.",
  media: "Your pictures, sounds, and videos. Upload a file, then pick it on a scene.",
  ai: "Ask the computer to draw a picture for a room. Optional extra.",
  map: "A map the player can open. Drop pins that jump to rooms. Optional extra.",
  dialogueBox: "Colours, fonts, and the look of the words on screen.",
  globalTitle: "The newsstand title screen — the menu before anyone hits Play.",
  test: "Pretend you already have items or flags, then see which choices would show. Then hit ▶ Play.",
};

export const TAB_GROUPS: { title: string; hint: string; ids: StudioTabId[] }[] = [
  {
    title: "This room",
    hint: "The card you clicked",
    ids: ["scene", "beats", "hotspots", "stage", "choices", "audio"],
  },
  {
    title: "Your game",
    hint: "People, stuff, testing",
    ids: ["briefing", "characters", "items", "flags", "test"],
  },
  {
    title: "More tools",
    hint: "Optional extras",
    ids: ["acts", "episodes", "map", "dialogueBox", "globalTitle", "media", "ai"],
  },
];

const PLACEHOLDER_PROSE = [
  "The scene opens on...",
  "Your story starts here. Set the mood, introduce the problem, and give the detective a reason to keep looking.",
];

function isPlayable(scene: SceneNode): boolean {
  return scene.nodeType !== "note" && scene.nodeType !== "credits";
}

function proseIsEmpty(scene: SceneNode): boolean {
  const prose = (scene.prose ?? "").trim();
  if (!prose) return true;
  return PLACEHOLDER_PROSE.includes(prose);
}

function sceneHasWayOut(scene: SceneNode): boolean {
  if (scene.isEnding) return true;
  if (scene.nodeType === "note" || scene.nodeType === "credits") return true;
  if (scene.autoAdvanceTargetSceneId) return true;
  if ((scene.choices ?? []).some((c) => c.targetSceneId)) return true;
  if ((scene.hotspots ?? []).some((h) => h.action?.targetSceneId)) return true;
  const edges = scene.stage?.exitEdges;
  if (edges?.left?.targetSceneId || edges?.right?.targetSceneId) return true;
  if ((scene.dialogueBeats ?? []).some((b) => b.afterBeatTargetSceneId)) return true;
  return false;
}

export type NextHint = {
  id: string;
  title: string;
  body: string;
  cta: string;
  tab?: StudioTabId;
  action?: "add-scene" | "add-end" | "play" | "check" | "tab";
  ready?: boolean;
};

export type CoachProgress = {
  id: string;
  label: string;
  done: boolean;
}[];

export function studioProgress(story: Story): CoachProgress {
  const playable = story.scenes.filter(isPlayable);
  const hasWords = playable.some((s) => !proseIsEmpty(s) || (s.dialogueBeats ?? []).length > 0);
  const hasExit = playable.some((s) => !s.isEnding && sceneHasWayOut(s));
  const hasEnding = story.scenes.some((s) => s.isEnding);
  const named = !!story.title.trim() && story.title.trim() !== "Untitled Case";
  return [
    { id: "name", label: "Name", done: named },
    { id: "room", label: "Room", done: playable.length > 0 },
    { id: "words", label: "Words", done: hasWords },
    { id: "exit", label: "Exit", done: hasExit },
    { id: "end", label: "Ending", done: hasEnding },
    { id: "play", label: "Play", done: playable.length > 0 && hasEnding && hasExit },
  ];
}

export function nextStudioHint(
  story: Story,
  scene: SceneNode | null | undefined,
  issues: ValidationIssue[],
): NextHint {
  const playable = story.scenes.filter(isPlayable);
  const named = !!story.title.trim() && story.title.trim() !== "Untitled Case";
  const errors = issues.filter((i) => i.severity === "error");
  const focus =
    scene && isPlayable(scene)
      ? scene
      : playable.find((s) => s.id === story.startSceneId) ?? playable.find((s) => !s.isEnding) ?? playable[0];

  if (playable.length === 0) {
    return {
      id: "add-scene",
      title: "Add your first room",
      body: "Click ＋ Scene at the top. That’s the first place in your game — like the first page of a comic.",
      cta: "＋ Add a room",
      action: "add-scene",
    };
  }

  if (!named) {
    return {
      id: "name",
      title: "Name your game",
      body: "Type a name in the bar at the very top. Players will see it on the newsstand.",
      cta: "Got it",
      action: "tab",
      tab: "briefing",
    };
  }

  if (!story.startSceneId || !story.scenes.some((s) => s.id === story.startSceneId && s.nodeType !== "note")) {
    return {
      id: "start",
      title: "Pick where the game starts",
      body: "Open the Scene tab and tick ★ Start scene on the first room the player should see.",
      cta: "Open Scene tab",
      action: "tab",
      tab: "scene",
    };
  }

  if (focus && !focus.isEnding && focus.nodeType !== "stage" && proseIsEmpty(focus) && !(focus.dialogueBeats ?? []).length) {
    return {
      id: "words",
      title: "Write something to read",
      body: `Open “${focus.title}” and type what the player sees when they arrive. Even one sentence is enough.`,
      cta: "Open Scene tab",
      action: "tab",
      tab: "scene",
    };
  }

  if (focus && !focus.isEnding && !sceneHasWayOut(focus)) {
    return {
      id: "exit",
      title: "Give the player a way forward",
      body: "A room needs an exit. Open Choices, click ＋ Add choice, then pick where it goes. Or drag a line from this card to another card.",
      cta: "Open Choices",
      action: "tab",
      tab: "choices",
    };
  }

  if (!story.scenes.some((s) => s.isEnding)) {
    return {
      id: "ending",
      title: "Add an ending",
      body: "Click 🏁 End at the top. That’s a special room where the story can finish. Then point a choice at it.",
      cta: "🏁 Add an ending",
      action: "add-end",
    };
  }

  if (errors.length) {
    const first = errors[0];
    return {
      id: "fix",
      title: "Fix a problem",
      body: first.message,
      cta: "Show problems",
      action: "check",
    };
  }

  return {
    id: "play",
    title: "Play your game",
    body: "Click ▶ Play at the top to try it. You can always come back and change things. Hover any button if you get stuck.",
    cta: "▶ Play it",
    action: "play",
    ready: true,
  };
}

export function tabHint(tab: StudioTabId): string {
  return TAB_TIPS[tab] ?? "";
}

/**
 * One floating bubble for every toolbar / tab button that has a title.
 * Steals the native tooltip so the OS one doesn't stack on top.
 */
export function StudioTipLayer() {
  const [tip, setTip] = useState<{ text: string; x: number; y: number; above: boolean } | null>(null);

  useEffect(() => {
    let stolen: { el: HTMLElement; title: string } | null = null;
    let current: HTMLElement | null = null;

    const restore = () => {
      if (stolen) {
        stolen.el.setAttribute("title", stolen.title);
        stolen = null;
      }
    };

    const hide = () => {
      restore();
      current = null;
      setTip(null);
    };

    const find = (t: EventTarget | null): HTMLElement | null => {
      if (!(t instanceof Element)) return null;
      const el = t.closest("button[title], button[data-tip], [data-tip], label[title]") as HTMLElement | null;
      if (!el) return null;
      const text = el.getAttribute("data-tip") || el.getAttribute("title");
      if (!text || text.trim().length < 6) return null;
      return el;
    };

    const showFor = (el: HTMLElement) => {
      if (el === current) return;
      restore();
      current = el;
      const native = el.getAttribute("title");
      const text = el.getAttribute("data-tip") || native || "";
      if (native) {
        stolen = { el, title: native };
        el.removeAttribute("title");
        if (!el.getAttribute("data-tip")) el.setAttribute("data-tip", native);
      }
      const r = el.getBoundingClientRect();
      const above = r.bottom + 96 > window.innerHeight;
      const x = Math.min(Math.max(r.left + r.width / 2, 148), window.innerWidth - 148);
      setTip({ text, x, y: above ? r.top - 8 : r.bottom + 8, above });
    };

    const onOver = (e: MouseEvent) => {
      const el = find(e.target);
      if (!el) {
        if (current && current.contains(e.target as Node)) return;
        hide();
        return;
      }
      showFor(el);
    };

    document.addEventListener("mouseover", onOver);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("keydown", hide);
    return () => {
      document.removeEventListener("mouseover", onOver);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("keydown", hide);
      restore();
    };
  }, []);

  if (!tip) return null;
  return (
    <div
      role="tooltip"
      className="studio-tip-bubble"
      style={{
        left: tip.x,
        top: tip.y,
        transform: tip.above ? "translate(-50%, -100%)" : "translate(-50%, 0)",
      }}
    >
      {tip.text}
    </div>
  );
}

const COACH_MIN_KEY = "scarlet-studio-coach-min";

export function StudioCoach({
  story,
  scene,
  tab,
  issues,
  onGoTab,
  onAddScene,
  onAddEnd,
  onPlay,
  onCheck,
}: {
  story: Story;
  scene: SceneNode | null | undefined;
  tab: StudioTabId;
  issues: ValidationIssue[];
  onGoTab: (tab: StudioTabId) => void;
  onAddScene: () => void;
  onAddEnd: () => void;
  onPlay: () => void;
  onCheck: () => void;
}) {
  const hint = nextStudioHint(story, scene, issues);
  const progress = studioProgress(story);
  const [min, setMin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(COACH_MIN_KEY);
      return saved === null ? !!hint.ready : saved === "1";
    } catch {
      return false;
    }
  });

  const run = () => {
    if (hint.action === "add-scene") onAddScene();
    else if (hint.action === "add-end") onAddEnd();
    else if (hint.action === "play") onPlay();
    else if (hint.action === "check") onCheck();
    else if (hint.tab) onGoTab(hint.tab);
  };

  return (
    <div
      className={`border ${hint.ready ? "border-emerald-500/40 bg-emerald-500/5" : "border-gold/40 bg-gold/8"} p-2`}
      data-studio-coach={hint.id}
      data-minimized={min || undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="studio-coach-kicker font-pulp text-[9px] uppercase tracking-widest text-gold">What to do next</div>
          <div className="font-pulp text-[12px] leading-snug text-paper">{hint.title}</div>
        </div>
        <button
          type="button"
          className="shrink-0 px-1 text-[10px] leading-none text-paper/40 hover:text-gold"
          title={min ? "Show the next-step tip" : "Hide the next-step tip (it will still be here if you need it)"}
          aria-label={min ? "Show next-step tip" : "Hide next-step tip"}
          onClick={() => {
            const next = !min;
            setMin(next);
            try {
              localStorage.setItem(COACH_MIN_KEY, next ? "1" : "0");
            } catch {
              /* session only */
            }
          }}
        >
          {min ? "▸" : "▾"}
        </button>
      </div>
      {!min && (
        <>
          <p className="mt-1 font-type text-[12px] leading-snug text-paper/80">{hint.body}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={run}
              className="border border-gold/60 bg-gold/15 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-gold hover:bg-gold/25"
            >
              {hint.cta}
            </button>
            <span className="font-type text-[10px] text-paper/45">On this tab: {tabHint(tab)}</span>
          </div>
        </>
      )}
      <div className="mt-2 flex flex-wrap gap-1" aria-label="Game-building progress">
        {progress.map((step) => (
          <span
            key={step.id}
            title={step.done ? `${step.label} — done` : `${step.label} — still to do`}
            className={`border px-1.5 py-0.5 font-pulp text-[8px] uppercase tracking-widest ${
              step.done ? "border-emerald-500/40 text-emerald-400" : "border-noir-600 text-paper/35"
            }`}
          >
            {step.done ? "✓" : "○"} {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function EmptyCanvasHint({ onAddScene }: { onAddScene: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-6">
      <div className="pointer-events-auto max-w-sm border-2 border-gold/50 bg-noir-950/95 p-5 text-center shadow-[0_0_40px_rgba(232,178,60,0.18)]">
        <div className="font-pulp text-sm uppercase tracking-widest text-gold">Your game is empty</div>
        <p className="mt-2 font-type text-[13px] leading-snug text-paper/80">
          Click <b className="text-gold">＋ Scene</b> at the top to add the first room. Then write some words, add a
          choice, and hit <b className="text-gold">▶ Play</b>.
        </p>
        <button
          type="button"
          onClick={onAddScene}
          className="mt-3 border border-gold/70 bg-gold/15 px-3 py-2 font-pulp text-[11px] uppercase tracking-widest text-gold hover:bg-gold/25"
        >
          ＋ Add a room
        </button>
        <p className="mt-3 font-type text-[11px] text-paper/45">Hover any button for a tip. The yellow box on the right always says what to do next.</p>
      </div>
    </div>
  );
}
