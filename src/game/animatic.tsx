/**
 * ANIMATIC MODE — the film played hands-off as a clean picture with its captions burned in, for the animatic exporter
 * (tools/export-animatic.mjs, also behind "🎞 Export animatic" on the home screen) or to watch and screen-record in a
 * browser:
 *
 *   ?story=nobodys-witness-film&scene=nw_s65&animatic=1&to=nw_s66&subs=1&desc=1&pace=1
 *
 * In this mode the game shows every line at once (no typewriter) and moves on by itself: a silent line holds for its
 * reading time, a spoken one until its voice has finished. The reading panel and the controls are hidden; the game
 * draws the captions itself instead, the spoken lines as subtitles and the narration (the screenplay's action) and the
 * scene headings as descriptions. Every effect, the depth camera and the sound play exactly as they do in the game.
 *
 * Progress is reported on window.__animatic for the exporter: the scene on screen, every caption with the page-clock
 * time it appeared, and `done` once the scene after `to` begins (or the story reaches its ending).
 */
import { audio } from "../audio";
import type { DialogueBeat, SceneNode } from "../types";

export interface AnimaticOptions {
  /** The last scene to play (its continuation parts, `<id>_b`…, included); null plays to the end of the story. */
  to: string | null;
  /** Burn the spoken lines in as subtitles. */
  subtitles: boolean;
  /** Burn the narration and the scene headings in as descriptions. */
  descriptions: boolean;
  /** Multiplies every reading hold: 1 is normal, 0.8 brisker, 1.25 slower. */
  pace: number;
}

export function animaticFromUrl(search?: string): AnimaticOptions | null {
  if (typeof window === "undefined") return null;
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search ?? window.location.search);
  } catch {
    return null;
  }
  const on = params.get("animatic");
  if (on === null || on === "0" || on === "false") return null;
  const flag = (key: string, fallback: boolean) => {
    const v = params.get(key);
    return v === null ? fallback : v !== "0" && v !== "false";
  };
  const pace = Number(params.get("pace") ?? "1");
  return {
    to: params.get("to") || null,
    subtitles: flag("subs", true),
    descriptions: flag("desc", true),
    pace: Number.isFinite(pace) && pace >= 0.5 && pace <= 2 ? pace : 1,
  };
}

/** Read once: the URL does not change while the film plays. Null in ordinary play (and outside a browser). */
export const ANIMATIC: AnimaticOptions | null = animaticFromUrl();

/** Longest description an animatic makes by joining short action lines (about two lines on screen). */
export const JOIN_CHARS = 200;
const PLAIN_BEAT_KEYS = new Set(["id", "characterId", "text", "silent"]);
const silentLine = (b: DialogueBeat) => !b.audioUrl && !!b.silent && !!b.text && b.text !== "·";

/** Short action lines that follow each other on the same picture are shown as one description (up to JOIN_CHARS):
 *  a line joins the one before it only when it carries nothing of its own (no picture, voice, effect or condition). */
export function joinActionLines(beats: DialogueBeat[]): DialogueBeat[] {
  const out: DialogueBeat[] = [];
  for (const b of beats) {
    const prev = out[out.length - 1];
    const plain = Object.keys(b).every((k) => PLAIN_BEAT_KEYS.has(k));
    if (prev && silentLine(prev) && silentLine(b) && plain && prev.characterId === b.characterId && `${prev.text} ${b.text}`.length <= JOIN_CHARS) {
      out[out.length - 1] = { ...prev, text: `${prev.text} ${b.text}` };
    } else out.push(b);
  }
  return out;
}

/** Every ordinary scene shows its words at once, with its short action lines joined; the title and the credits keep
 *  their own design and timing. */
export function animaticStory<T extends { scenes: SceneNode[] }>(story: T): T {
  return {
    ...story,
    scenes: story.scenes.map((sc) =>
      sc.nodeType === "credits" ? sc : { ...sc, noTypewriter: true, dialogueBeats: sc.dialogueBeats ? joinActionLines(sc.dialogueBeats) : sc.dialogueBeats }),
  };
}

/** How long a silent line stays up: half a second to land plus an ordinary subtitle reading speed (18 characters a
 *  second), between 1.8 and 9 seconds, times the pace. (14 a second until 10 October: the film ran 2 h 36 min.) */
export function readingSeconds(text: string, pace = 1): number {
  const chars = text.replace(/\s+/g, " ").trim().length;
  return Math.min(9, Math.max(1.8, 0.5 + chars / 18)) * pace;
}

/** The pause after a recorded line before the next line comes up. */
export const AFTER_VOICE_SECONDS = 0.45;
/** How long a scene heading (or a scene's opening description) stays up before the scene's first line. */
export function headingSeconds(prose: string, pace = 1): number {
  return SLUGLINE.test(prose.trim()) ? 1.6 * pace : readingSeconds(prose, pace);
}

export type CaptionKind = "subtitle" | "description" | "heading";
export interface Caption {
  kind: CaptionKind;
  speaker?: string;
  text: string;
}

const SLUGLINE = /^(INT|EXT|I\/E)[./\s]/i;

/** Narration is the screenplay's own words (a narrator line, or a silent line with no voice); anything else is said. */
export function isNarration(beat: Pick<DialogueBeat, "characterId" | "audioUrl" | "silent">): boolean {
  return beat.characterId === "narrator" || /(^|_)narrator$/i.test(beat.characterId) || (!beat.audioUrl && !!beat.silent);
}

/** What the animatic shows at this moment: the scene's heading while its prose is up, else the line on screen. */
export function captionFor(
  options: AnimaticOptions,
  scene: SceneNode | null | undefined,
  proseShowing: boolean,
  beat: DialogueBeat | null,
  beatText: string,
  speaker: string | undefined
): Caption | null {
  if (!scene || scene.nodeType === "credits") return null;
  if (proseShowing) {
    const text = (scene.prose ?? "").trim();
    if (!text || !options.descriptions) return null;
    return { kind: SLUGLINE.test(text) ? "heading" : "description", text };
  }
  if (!beat) return null;
  const text = beatText.trim();
  if (!text || text === "·") return null;
  if (isNarration(beat)) return options.descriptions ? { kind: "description", text } : null;
  return options.subtitles ? { kind: "subtitle", speaker, text } : null;
}

export interface AnimaticCue extends Caption {
  /** page-clock milliseconds (performance.now) when the caption appeared */
  t: number;
  /** the scene and the line it came from */
  scene?: string;
  beat?: string;
}
export interface AnimaticState {
  options: AnimaticOptions;
  sceneId: string | null;
  sceneTitle: string;
  /** every caption change in order; a cue with empty text clears the screen */
  cues: AnimaticCue[];
  /** every scene entered, with the page-clock time */
  scenes: { t: number; id: string }[];
  reachedTo: boolean;
  done: boolean;
  /** page-clock milliseconds when the film left the chosen scenes (or reached its ending); nothing after it is filmed */
  doneAt?: number;
}

declare global {
  interface Window {
    /** set by the exporter: start at once (a browser waits for one click, so the sound may play) */
    __animaticAutostart?: boolean;
    __animatic?: AnimaticState;
    /** the game's sound engine, for the exporter (it logs the ambience and renders the synthesised sounds offline) */
    __sw_audio?: typeof audio;
  }
}

function state(): AnimaticState | null {
  if (!ANIMATIC || typeof window === "undefined") return null;
  if (!window.__animatic) {
    window.__animatic = { options: ANIMATIC, sceneId: null, sceneTitle: "", cues: [], scenes: [], reachedTo: false, done: false };
    window.__sw_audio = audio;
  }
  return window.__animatic;
}
// Ready before the first scene, so the exporter can find the sound engine as soon as the page has loaded.
state();

const sameCaption = (a: Caption | null | undefined, b: Caption | null | undefined) =>
  (a?.text ?? "") === (b?.text ?? "") && (a?.kind ?? "") === (b?.kind ?? "") && (a?.speaker ?? "") === (b?.speaker ?? "");

/** Records the caption now on screen (null: none) when it changes, with the scene and the line it came from. */
export function noteCaption(caption: Caption | null, sceneId?: string, beatId?: string) {
  const st = state();
  if (!st) return;
  const last = st.cues[st.cues.length - 1];
  if (last ? sameCaption(last, caption) : !caption) return;
  st.cues.push({ t: performance.now(), kind: caption?.kind ?? "description", speaker: caption?.speaker, text: caption?.text ?? "", scene: sceneId, beat: beatId });
}

/** Records a scene change, and finishes once the film has left `to` (or reached its ending). */
export function noteScene(scene: SceneNode) {
  const st = state();
  if (!st || st.done) return;
  st.sceneId = scene.id;
  st.sceneTitle = scene.title ?? scene.id;
  st.scenes.push({ t: performance.now(), id: scene.id });
  const to = st.options.to;
  const inTo = !!to && (scene.id === to || scene.id.startsWith(`${to}_`));
  if (inTo) st.reachedTo = true;
  else if (to && st.reachedTo) st.done = true;
  if (scene.isEnding) st.done = true;
  if (st.done) st.doneAt = performance.now();
}

/** The captions, drawn over the picture (and the letterbox bars) where a film's subtitles go. */
export function AnimaticCaptions({ caption }: { caption: Caption | null }) {
  if (!caption) return null;
  if (caption.kind === "heading") {
    return (
      <div className="animatic-heading" key={`h:${caption.text}`} data-animatic-caption="heading">
        {caption.text}
      </div>
    );
  }
  return (
    <div className="animatic-caption" key={`${caption.kind}:${caption.speaker ?? ""}:${caption.text}`} data-animatic-caption={caption.kind}>
      {caption.kind === "subtitle" ? (
        <>
          {caption.speaker && <div className="animatic-speaker">{caption.speaker}</div>}
          <div className="animatic-subtitle">{caption.text}</div>
        </>
      ) : (
        <div className="animatic-description">{caption.text}</div>
      )}
    </div>
  );
}

/** In a browser an animatic waits for one click, so its sound is allowed to start, then plays itself with no controls:
 *  watch it, or record it with any screen recorder. */
export function AnimaticStart({ title, onStart }: { title: string; onStart: () => void }) {
  const o = ANIMATIC;
  const parts = [
    o?.to ? `to ${o.to.replace(/^nw_s?/, "scene ")}` : "to the end",
    o?.subtitles ? "subtitles" : "no subtitles",
    o?.descriptions ? "descriptions" : "no descriptions",
  ];
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-black px-6 text-center">
      <div className="font-pulp text-xs uppercase tracking-[0.4em] text-gold">Animatic</div>
      <h1 className="font-pulp text-3xl uppercase text-paper">{title}</h1>
      <p className="max-w-lg font-type text-sm text-paper/70">
        Plays by itself with no controls: {parts.join(" · ")}. Record it with a screen recorder, or use
        🎞 Export animatic on the home screen for an MP4 and a subtitle file.
      </p>
      <button
        autoFocus
        onClick={onStart}
        className="border-2 border-gold bg-gold/15 px-6 py-2.5 font-pulp text-xs uppercase tracking-[0.2em] text-gold hover:bg-gold/25"
      >
        ▶ Start
      </button>
    </div>
  );
}
