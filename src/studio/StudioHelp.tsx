import { DialogFrame } from "../components/DialogFrame";
import React, { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Studio help system                                                 */
/*                                                                    */
/*  Two pieces:                                                       */
/*  1. HelpNote — a dismissable inline hint pinned to the editing      */
/*     surface it explains (tabs, gating, hotspots…). Dismissals are   */
/*     remembered in localStorage so a note never nags twice.          */
/*  2. StudioHelpModal — the instruction manual in a modal: workflow,  */
/*     the engine's contracts, shortcuts and the troubleshooting       */
/*     cheat sheet, distilled from Studio-Instruction-Manual.txt.      */
/* ------------------------------------------------------------------ */

const helpNoteKey = (id: string) => `scarlet-studio-helpnote-${id}`;
const HELPNOTE_PREFIX = "scarlet-studio-helpnote-";

/** Clear every "don't show again" marker so all inline notes return. */
export function resetHelpNotes() {
  try {
    const doomed: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(HELPNOTE_PREFIX)) doomed.push(k);
    }
    doomed.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* storage unavailable — nothing to reset */
  }
}

/** A small inline help note. Dismissing it is remembered per-note, and
 * "Restore all help notes" (in the Help modal) brings them back. */
export function HelpNote({
  id,
  title = "Help",
  children,
}: {
  /** unique id — the dismissal is stored under this key */
  id: string;
  title?: string;
  children: React.ReactNode;
}) {
  const [hidden, setHidden] = useState<boolean>(() => {
    try {
      return localStorage.getItem(helpNoteKey(id)) === "0";
    } catch {
      return false;
    }
  });
  // Re-check when a "restore all notes" sweep runs while mounted.
  useEffect(() => {
    const onStorage = () => {
      try {
        setHidden(localStorage.getItem(helpNoteKey(id)) === "0");
      } catch {
        /* ignore */
      }
    };
    const onReset = () => setHidden(false);
    window.addEventListener("storage", onStorage);
    window.addEventListener("scarlet-studio-help-reset", onReset as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("scarlet-studio-help-reset", onReset as EventListener);
    };
  }, [id]);
  if (hidden) return null;
  return (
    <div className="relative border border-gold/30 bg-gold/5 p-2 pr-6 text-[11px] leading-relaxed text-paper/80">
      <div className="mb-0.5 font-pulp text-[9px] uppercase tracking-widest text-gold">
        ? {title}
      </div>
      <div className="font-type">{children}</div>
      <button
        onClick={() => {
          try {
            localStorage.setItem(helpNoteKey(id), "0");
          } catch {
            /* storage unavailable — hide for this session only */
          }
          setHidden(true);
        }}
        className="absolute right-1 top-1 px-1 text-[10px] leading-none text-paper/40 hover:text-crimson"
        title="Hide this note (bring it back from ? Help → “Restore all help notes”)"
        aria-label="Hide this help note"
      >
        ✕
      </button>
    </div>
  );
}

/* --------------------------- the manual ---------------------------- */

function Section({ title, children, open }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="group border border-noir-600/80 bg-noir-900/60" open={open}>
      <summary className="cursor-pointer list-none px-3 py-2 font-pulp text-[10px] uppercase tracking-widest text-gold hover:bg-noir-800/60">
        <span className="mr-1 inline-block transition-transform group-open:rotate-90" aria-hidden>
          ▸
        </span>
        {title}
      </summary>
      <div className="space-y-2 border-t border-noir-700 px-3 py-2 font-type text-[10px] leading-relaxed text-paper/70">
        {children}
      </div>
    </details>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="border border-paper/25 bg-noir-800 px-1.5 py-0.5 font-mono text-[9px] text-paper/85">{children}</kbd>
  );
}

const SHORTCUTS: [string, string][] = [
  ["Ctrl+Z", "Undo"],
  ["Ctrl+Shift+Z / Ctrl+Y", "Redo"],
  ["Delete / Backspace", "Delete the selected node or edge"],
  ["Esc", "Close context menus / dialogs"],
];

const PLAYER_KEYS: [string, string][] = [
  ["1 – 9", "Pick a choice by number"],
  ["Up / Down · W / S", "Move choice focus"],
  ["Space / Enter", "Continue dialogue"],
  ["←", "Rewind one line"],
  ["Shift + ←", "Restart the scene"],
  ["B", "Open the corkboard"],
  ["M", "Mute / unmute"],
  [".", "Skip current text"],
  ["Esc", "Close / quit"],
];

const TROUBLESHOOTING: [string, string][] = [
  ["Publish / Play blocked", "Open the Validator and fix or Repair the red errors."],
  ["A scene has no way forward", "It's a dead end: add a choice/hotspot exit, or mark it as an ending."],
  ["A choice is locked and you never get the item", "It's required but never granted — add a hotspot/choice that grants it."],
  ["Characters don't appear on the board", "Tick “Show this met character on corkboard” and make sure the player meets them."],
  ["The case is unwinnable", "Check you have a victory ending and that the final gate's flags are all settable via the corkboard/choices."],
  ["Music isn't looping", "Set the scene's music mode to “Play a track” (not inherit) and pick a file."],
  ["Prose shows as raw text", "Turn off “show instantly” (noTypewriter) or set a narration MP3."],
  ["A beat never appears", "Its condition rule isn't satisfied — check the gate and the state that sets it."],
  ["Foreground not visible", "Confirm the image loads, the foreground isn't empty, then check position/scale/fit."],
];

const SOFTLOCK_CHECKLIST = [
  "The start scene exists and is set.",
  "Every scene is reachable from the start.",
  "Every non-ending scene has at least one open (ungated) exit, or is gated only on something obtainable earlier in the same run.",
  "Every item a gate requires is granted somewhere (hotspot giveItem, a choice's reward, or a recipe result).",
  "Every flag a gate requires is set somewhere (a choice, a hotspot, or a corkboard connection).",
  "There is at least one victory ending, and it is reachable.",
  "There is at least one game-over ending.",
  "The final accusation is gated only on deductions/rewards that can really be earned.",
  "No repeatable choice/hotspot grants a reward (no farming).",
];

/** The full help modal. Sections mirror the instruction manual so the terms
 * match what the rest of Studio calls things. */
export function StudioHelpModal({ onClose, onOpenManual }: { onClose: () => void; onOpenManual?: () => void }) {
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");
  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <DialogFrame label="Studio help" onDismiss={onClose}
        className="pop-in flex max-h-[88vh] w-full max-w-3xl flex-col border-2 border-gold/60 bg-noir-950 shadow-[0_0_60px_rgba(232,178,60,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-gold/30 px-4 py-2">
          <h3 className="font-pulp text-sm uppercase tracking-wide text-gold">
            ? Studio Help — the field manual
          </h3>
          <div className="flex items-center gap-2">
            {onOpenManual && (
              <button
                onClick={onOpenManual}
                className="border border-cyan-neon/50 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/10"
              >
                ↗ Full manual
              </button>
            )}
            <button onClick={onClose} className="px-2 text-lg leading-none text-paper/60 hover:text-neon" aria-label="Close help">
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-2 overflow-y-auto p-4">
          <p className="border border-cyan-neon/25 bg-cyan-neon/5 p-2 font-type text-[12px] leading-relaxed text-paper/80">
            <b className="text-cyan-neon">Start here:</b> hover any button for a tip. The yellow{" "}
            <b>What to do next</b> box on the right always points at the next click. Nothing is deleted — extra tools
            live under <b>More tools</b>.
          </p>

          <Section title="0 · Make a game in 6 clicks" open>
            <ol className="list-decimal space-y-1 pl-5 font-type text-[12px] text-paper/80">
              <li>Click <b>＋ New Story</b> (top bar).</li>
              <li>Type a name in the bar at the top.</li>
              <li>Click <b>＋ Scene</b> — that’s your first room.</li>
              <li>Write some words in the <b>Scene</b> tab.</li>
              <li>Click <b>🏁 End</b>, then add a <b>Choice</b> that goes there.</li>
              <li>Click <b>▶ Play</b>.</li>
            </ol>
            <p>
              Left side = story map (each card is a room). Right side = editor. Top = tools. Drag a line from one card
              to another to connect them.
            </p>
            <p className="text-paper/55">
              <b>The pipeline:</b> you build a case here → Studio autosaves the draft (~0.8s) → <b>Validate</b> it →{" "}
              <b>▶ Play</b> to test → <b>Publish</b> so the newsstand serves that exact version → <b>Save</b> a{" "}
              <code>.screel</code> (or <b>Export</b> a <code>.reel.json</code>) to back it up. When a case is opened, the game loads the <b>published</b> copy
              first, else the live <b>draft</b>, else the built-in version.
            </p>
          </Section>

          <Section title="1 · The story graph (canvas)">
            <p>
              Each card is a scene. The handles on a card's right edge are its <b>exits</b> — drag one onto another card
              to wire that choice/hotspot to a target scene. Dropping onto <b>“drag to add choice →”</b> creates a new
              choice aimed at that scene and opens it for editing.
            </p>
            <p>
              <b>Right-click</b> a card for <i>Edit / Duplicate / Copy / Paste / Set as start / Mark as ending / Delete</i>;
              right-click empty canvas to add nodes, paste, or fit view. A quick-time choice's <b>(timed out)</b> branch
              draws as its own edge — that's the “you hesitated” route.
            </p>
            <p>
              Badges: <b>START</b> = entry scene (no inputs), <b>END</b> = ending (no outputs), plus CREDITS / CUTSCENE
              node types. The red <b>⚠N</b> is that scene's validator issue count.
            </p>
            <p>
              <b>Seeing where the story is:</b> click any card and the <b>gold path</b> from the start scene to it
              lights up (thick gold edges, glowing cards) — the road the story takes to reach that scene. The
              minimap colours every node by its act (endings stay gold), so the film's structure reads at a glance.
            </p>
            <p>
              <b>📝 Notes:</b> the “Note” field in the inspector writes a sticky note straight onto the card (first two
              lines shown, full text on hover). Studio metadata only — the game never renders it.
            </p>
          </Section>

          <Section title="2 · The five-step authoring workflow">
            <ol className="list-decimal space-y-1 pl-5">
              <li><b className="text-gold">Case File</b> — objective, win/lose conditions, heat limit + bust scene for real stakes.</li>
              <li><b className="text-gold">People</b> — the cast; tick “Show this met character on corkboard” for suspects; tune voices.</li>
              <li><b className="text-gold">Items</b> — clues &amp; props; mark clues; set combining recipes. Every gate-required item must be granted somewhere.</li>
              <li><b className="text-gold">Scenes</b> — prose, dialogue beats, hotspots, choices. Wire exits by dragging handles. Finish with a victory ending AND a game-over ending.</li>
              <li><b className="text-gold">Test</b> — fake world state in the ▶ Test tab, then ▶ Play draft, fix red errors, Publish.</li>
            </ol>
            <p>The “Creator workflow” panel at the top of the inspector lights each step up as it's satisfied.</p>
          </Section>

          <Section title="3 · Gating & consequences (the engine's contract)">
            <p>
              A <b>gate</b> decides what's <i>available</i>; a <b>consequence</b> decides what <i>changes</i>. Gates live on
              choices, hotspots and dialogue beats.
            </p>
            <p>
              A gate passes when <b>every enabled clause</b> passes: requires items/flags held (ALL, or ANY with the ALL
              switch off), excludes items/flags absent, min/max meters, min trust, and <i>Remembers</i> (memory tags).
            </p>
            <p>
              Consequences: set/clear flags, add/remove items, meter deltas (clamped 0–10), trust deltas (clamped −5…+5).
              A scene's <b>on-enter</b> consequences fire only on <i>first</i> entry, so rewards can't be farmed by looping.
            </p>
            <p>
              State-changing choices and hotspots are <b>one-shot by default</b>. Only pure navigation is repeatable —
              the validator warns about farmable rewards.
            </p>
          </Section>

          <Section title="4 · Choices — replies, hidden, groups, timers, quick-time">
            <ul className="list-disc space-y-1 pl-5">
              <li><b>Reply</b> 💬 — answers in place, never navigates; pair it with a dialogue beat gated on the flag it sets.</li>
              <li><b>Hidden</b> — invisible until its gate passes (no spoiler hint shown).</li>
              <li><b>Exclusive group</b> — picking one resolves all choices sharing the group (“choose your approach”).</li>
              <li><b>Timer</b> — the choice expires at 0 (recorded as expired).</li>
              <li><b>⚡ Quick-time prompt</b> — a hard deadline: big banner, countdown ring, optional heartbeat + shaky cam below ~30% left. On expiry it routes to the <i>timed-out target</i> and applies <i>timed-out consequences</i> — a distinct “you hesitated” branch, not a silent loss.</li>
              <li><b>Memory tag</b> — records the player's exact line; a beat can <i>recall</i> it later with <code>{"{said}"}</code>.</li>
              <li><b>“X will remember that” card</b> — full-screen impact line after the pick.</li>
            </ul>
          </Section>

          <Section title="5 · Dialogue beats">
            <p>
              Beats play in order after the prose. Speaker can be a character or <b>Narrator (V.O.)</b>. Order them with the
              ▲/▼ buttons in each beat's title bar.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li><b>Replacement background</b> — an insert shot with its own transition + cinematic. By default it <b>persists over later beats</b> (characters keep talking over it) until another beat sets a new image. Turn <b>“Keep image on later beats”</b> OFF to show it only for that beat; use <b>“🔙 End insert shot here”</b> on a later beat to drop back to the scene's own image.</li>
              <li><b>Voice MP3</b> — a recorded take that replaces text-to-speech for the line; <b>silent</b> = no narration at all.</li>
              <li><b>Condition rule</b> — the beat only appears when the gate passes (re-evaluates live mid-scene).</li>
              <li><b>Memories recalled</b> — tag → line; the line replaces the text when that memory exists. <code>{"{said}"}</code> echoes the player's words.</li>
            </ul>
            <p>
              <b>🎙 Batch voice — this scene (ElevenLabs)</b> — on the Beats tab, pick a <b>voice model</b> and press <b>▶
              Generate this scene's voices</b>. It converts the whole <i>conversation in that scene</i>: each line is synthesized
              <b> separately</b> in its speaker's assigned voice (set the character's <b>ElevenLabs voice ID</b> in the Characters
              tab first), reads the surrounding lines as <b>conversational context</b> so delivery responds naturally to the
              previous speaker, and each finished MP3 is <b>applied to its beat automatically</b> (no manual wiring). Desktop saves
              to <code>public/voices/&lt;person&gt;/&lt;scene&gt;/</code>; browser saves via the linked voice folder or media library.
              A live <b>≈ credits estimate</b> shows above the button for the chosen model, and clicking opens a <b>cost warning
              that asks you to confirm twice</b> (large batches require typing GENERATE) before any credit is spent; when MP3s exist
              you choose regenerate-all or fill-the-gaps.
              Do one conversation/scene at a time — silent beats, memory-recall lines, and characters without a voice ID are skipped.
              On the <b>Eleven v3</b> model, use the <b>🎙 Insert sound</b> chips under a line to add performed cues like
              <code>[laughs]</code>, <code>[coughs]</code>, <code>[sighs]</code> — v3 acts them out (v2/turbo would read the
              brackets aloud, so the chips only appear when v3 is selected).
            </p>
          </Section>

          <Section title="5b · Color grade, film stock & parallax">
            <p>
              In the Cinematic Image Controls (Scene tab):
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li><b>🎨 Color grade</b> — one-click director looks on any camera mode (and on a beat's replacement background): <b>Nolan IMAX</b> (cold desaturated steel/teal), <b>Tarantino 35mm</b> (hot warm bleach-bypass), <b>Spielberg golden hour</b> (amber magic hour), <b>1940s Noir</b> (high-contrast black &amp; white). It is a filter + split-tone wash, so video cutscenes still get the wash.</li>
              <li><b>🎞 Film grade</b> — 35mm print emulation: moving grain, gate weave, highlight halation bloom, flicker and occasional scratches, with a strength slider. Sits above the color grade like the physical print.</li>
              <li><b>🌆 Parallax depth</b> — the camera subtly follows the cursor; the plate drifts slowest, the foreground fastest. <b>Mid-ground planes</b> (transparent cutouts or a gradient fog layer) shift by their own depth % for a diorama feel. Idle sway plays when the mouse is still; reduced-motion users get a locked frame. Try it live on the camera preview — it responds to your mouse.</li>
            </ul>
            <p>
              See them in action in <b>Demo Lab: Scene Craft</b> — “Take Three — The Grade” and “Take Four — Parallax Depth” — each with a 📝 step-by-step note.
            </p>
          </Section>

          <Section title="5c · Insert shots that end a scene (after-beat routing) & duplicating stories">
            <p>
              By default a beat's <b>replacement background</b> plays for that one line and the picture reverts to the scene plate
              when the dialogue ends. If you want an insert shot to <b>lead somewhere</b> — a cutscene built from beats, an
              ending card, or just a straight cut with no flash back to the scene image — give the beat an <b>“After this beat — cut to scene”</b>:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li><b>Where:</b> on the beat in the Dialogue tab. It only fires on the <b>LAST visible beat</b> of the scene — put it on your final line (the validator warns if you don't).</li>
              <li><b>⏱ Auto</b> — after the line finishes typing, hold for the timer (default 1.6s) then cut automatically. <b>This is the timer that guarantees the beat is read</b> before the scene changes; a live “⏱ cut in Ns” shows. It pauses while the menu is open.</li>
              <li><b>▸ Continue</b> — no timer: the ▸ Continue pill / Space advances straight into the next scene, so the player controls the cut.</li>
              <li>The insert background fades <b>directly</b> into the next scene — it never reverts to the scene plate. Part-break charts, act cards, endings and music crossfades all work normally through the route.</li>
            </ul>
            <p>
              <b>Recommended workflow for a cutscene from stills:</b> make one short scene per shot (or per line), give each its
              background/grade, and chain them with after-beat routes — that's more flexible than cramming one scene, because each
              link can branch, chart and end independently. If the scene also has auto-advance, the beat route wins while a beat is
              live — no timer conflict.
            </p>
            <p>
              <b>⧉ Duplicate Story</b> (toolbar) copies the whole current case into a brand-new, independent story — every scene, beat,
              hotspot, choice and wire gets fresh ids so nothing collides, the title gets “(copy)”, and the canvas is offset. Use it to
              branch from an existing case or to experiment without touching the original; built-ins are copied, never edited in place.
            </p>
          </Section>

          <Section title="5d · In-game theme (HUD colours, fonts & text size)">
            <p>
              The <b>🎮 In-Game Theme</b> tab styles the whole case, story-wide:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li><b>HUD colour scheme</b> — one-click palettes (Classic Noir, Neon Rain, Sepia Pulp, Midnight Teal, Venetian Red, Ghost Green) that re-tint the accents, nameplates, meters and choice focus; or set <b>custom accent/danger</b> colours by hand. The stage uses CSS variables so the whole game subtree follows instantly.</li>
              <li><b>Body font</b> — the prose/dialogue reading face (Newsreader, Playfair, Josefin Sans, Cinzel, Bebas, Alfa Slab); <b>heading font</b> — nameplates and HUD labels.</li>
              <li><b>Reading text size</b> — 80%–140% scale; the reserved line height scales with it so the panel stays stable.</li>
              <li><b>Minimal HUD</b> — fades the scene-label/lead readouts until you hover, for a cleaner frame.</li>
              <li>The <b>Dialogue panel</b> section still sets the backdrop image, opacity, tint, blur and bordered card look.</li>
            </ul>
            <p>The tab preview updates live for colours, fonts and size — set it once and every scene matches.</p>
          </Section>

          <Section title="5e · Press the Lie — catch a character in a contradiction">
            <p>
              Turn a dialogue line into a false claim the player must <b>prove</b>, not just read. On a beat, open{" "}
              <b>🎯 Press the Lie (contradiction)</b> and tick <b>“This line is a lie the player can catch.”</b> While that
              line is on screen the player gets a <b className="text-crimson">🎯 Press them on that</b> button: they open
              their inventory and must present the clue that proves the statement false.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li><b>Breaking evidence</b> — tick only the item(s) that ACTUALLY disprove the claim. Every other held item is a bluff the speaker calls. Handing the player many clues is fine; they still have to pick the one that matters.</li>
              <li><b>Caught flag</b> — set when the lie breaks; the <b>caught reaction</b> beat auto-gates on it (the Check warns if you forget) and plays as the very next line. Gate follow-up choices/beat on the flag.</li>
              <li><b>Bluff-called line + limit</b> — what they say when shown the wrong thing, and how many misses (default 2) before the claim shuts for the scene. Misses cost trust / raise heat via the consequences.</li>
              <li><b>Inside an interrogation</b> — set <b>composure damage</b> and a proven lie shatters the suspect's composure (2+ cracks them), running the normal crack-vs-clamp resolution by trust.</li>
              <li>Always give a failed press a way OUT (an ungated exit choice) so a shut-down claim can't soft-lock.</li>
            </ul>
            <p>
              See <b>Demo Lab: Press the Lie</b> — the pawn ticket breaks the alibi, the signed bar tab cracks the back-room
              interrogation, and the charred matchbook is a deliberate red herring. Each scene carries a 📝 note.
            </p>
          </Section>

          <Section title="6 · Hotspots — actions on the scene art">
            <p>
              Drag on the preview to draw a zone (percent bounds). One action each: <b>go to scene</b>, <b>give item</b>,{" "}
              <b>set flag</b>, <b>show text</b>, <b>meter change</b>, <b>open corkboard</b>, <b>use item</b> (consume then run).
            </p>
            <p>
              Only <i>goToScene</i> / <i>useItem</i> need a target — a giveItem/setFlag hotspot legitimately stays in place
              (that's how you author lockpicks, safes and ciphers). Gate a hotspot to lock it; the <b>custom fail
              message</b> replaces the generic “locked up tighter…” hint.
            </p>
            <p>
              <b>🚶 Stage 2D — walkable character (Scene tab).</b> Tick <b>“Player walks around this scene”</b> and the plate
              becomes a stage: the player clicks the ground to move (a 🕵️ sprite/emoji walks there) or uses arrow / WASD keys.
              Walking onto a hotspot zone fires it <b>through the same hotspot action</b> — give-item pickups, show-text, exits
              and gating all behave identically; it's only the input that changes from click-the-zone to walk-to-the-zone.
              Set the spawn point, walk speed, reach distance and sprite (image / <code>emoji:…</code>). Put hotspots where the
              player should walk to something. The 💀 <b>object-first verb menu</b> can open on
              click, or <b>hold-to-open</b> as a big circular pie in the middle of the screen — its centrepiece sprite
              is set on the 🎮 <b>In-game theme</b> tab. Try the office in <b>Demo Lab: Press the Lie</b>.
            </p>
            <p>
              <b>🎥 Wide worlds & walk-off exits (Scene tab → Walkable Stage).</b> <b>World width</b> makes a room a
              scrolling strip several screens long — the camera follows the player (a LucasArts alley). Markers, spawns and
              barriers are then placed in % of the whole strip (dashed viewport frames show what one screen holds).
              <b>Walk-off-screen exits</b> put the red/yellow edge arrow on the plate: walk into the edge (or click the arrow)
              and the character strides off-screen into the target scene — yellow means gated, with a locked line. <b>Entry
              spawns</b> (cyan dots, draggable) pick where the player appears depending on the room they arrived from.
              <b>Character size</b> (<code>stage.playerScale</code>) fits the walker to the scene — the 🕵️ on the plate grows
              and shrinks live (1 = classic look; near/far sliders still control the walk-toward-camera perspective).
            </p>
          </Section>

          <Section title="7 · Meters, trust, perks & heat">
            <p>
              Four meters (0–10): <b className="text-neon">Charm</b>, <b className="text-crimson">Intimidate</b>,{" "}
              <b className="text-cyan-neon">Deduce</b>, <b className="text-gold">Heat</b>. Trust is per character (−5…+5).
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>💋 <b>Velvet Tongue</b> — Charm 4+: positive trust gains get +1.</li>
              <li>✊ <b>Iron Nerve</b> — Intimidate 4+: hard-nosed choices stop costing Heat.</li>
              <li>🧠 <b>Sharp Eye</b> — Deduce 4+: hotspots shimmer; wrong board guesses draw no Heat.</li>
              <li>🔥 <b>HEAT</b> — Heat 6+: trust gains halved; wrong board links cost 2.</li>
            </ul>
            <p>
              With a <b>heat limit</b> + <b>bust scene</b> set in the Case File, landing on a scene at Heat ≥ limit triggers
              the bust ending (“Too much heat. The city closes in.”). Solving every corkboard connection fires{" "}
              <b>CASE CRACKED</b> and sets the <code>case_cracked</code> flag — a handy gate for the final accusation.
            </p>
            <p>
              The “The Perk Range” case is a four-station proving ground for the perks; the “Quick-Time Demo” case
              smoke-tests QTEs — pick either from the story selector and ▶ Play draft.
            </p>
            <p>
              <b>New? Learn by example.</b> The three <b>“Demo Lab”</b> cases on the newsstand —
              <b> Conversation</b> (dialogue, replies, memory recalls, present-item),
              <b> Scene Craft</b> (credits, cameras, lights, examine, music, auto-advance) and
              <b> Branching Reel</b> (consequences, gating, QTEs, acts, heat) — are step-by-step teaching reels.
              Open any of them here in Studio: every scene card carries a 📝 <b>note</b> strip that explains exactly how
              the scene was built, click by click. Read the note, press ▶ Play, then copy the move in your own case.
            </p>
          </Section>

          <Section title="8 · Validator, Repair, Publish">
            <p>
              <span className="text-crimson">ERROR</span> blocks Publish and Play; gold <span className="text-gold">WARNING</span>{" "}
              is advisory. Click an issue to fly to its scene. <b>Repair</b> auto-fixes dead ends, dangling links, phantom
              gates, missing ending data, and one-shots farmable reward hotspots.
            </p>
            <p>Blank cases are guided drafts — Publish unlocks once a first scene exists and is marked as the start scene.</p>
          </Section>

          <Section title="9 · Keyboard shortcuts">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="mb-1 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">Studio</div>
                <ul className="space-y-1">
                  {SHORTCUTS.map(([k, d]) => (
                    <li key={k} className="flex items-baseline justify-between gap-2">
                      <Key>{k}</Key>
                      <span className="text-right">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-1 font-pulp text-[9px] uppercase tracking-widest text-cyan-neon">In-game (player)</div>
                <ul className="space-y-1">
                  {PLAYER_KEYS.map(([k, d]) => (
                    <li key={k} className="flex items-baseline justify-between gap-2">
                      <Key>{k}</Key>
                      <span className="text-right">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section title="10 · Troubleshooting cheat sheet">
            <ul className="space-y-1.5">
              {TROUBLESHOOTING.map(([q, a]) => (
                <li key={q}>
                  <b className="text-paper/90">{q}</b>
                  <br />
                  <span className="text-paper/60">{a}</span>
                </li>
              ))}
            </ul>
            <p className="border-t border-noir-700 pt-2">
              Autosave fails on a full browser storage? Export the case, run <b>Storage</b> (reclaims stale backups), then
              re-import. When in doubt: Export first, then Repair, then re-check the Validator.
            </p>
          </Section>

          <Section title="11 · The softlock checklist (before you publish)">
            <ul className="space-y-1">
              {SOFTLOCK_CHECKLIST.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-gold" aria-hidden>
                    ☐
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-noir-700 px-4 py-3">
          <button
            onClick={() => {
              resetHelpNotes();
              window.dispatchEvent(new Event("scarlet-studio-help-reset"));
            }}
            className="border border-cyan-neon/60 bg-cyan-neon/10 px-3 py-2 font-pulp text-[10px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/20"
            title="Bring back every inline ? note you dismissed"
          >
            ↺ Restore all help notes
          </button>
          <button
            onClick={async () => {
              try {
                const res = await fetch("Studio-Instruction-Manual.txt");
                if (!res.ok) throw new Error();
                const text = await res.text();
                const blob = new Blob([text], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "Studio-Instruction-Manual.txt";
                a.click();
                URL.revokeObjectURL(url);
                setCopied("ok");
              } catch {
                setCopied("fail");
              }
            }}
            className="border border-gold/60 bg-gold/10 px-3 py-2 font-pulp text-[10px] uppercase tracking-widest text-gold hover:bg-gold/20"
            title="Download the full detailed manual from the repo"
          >
            ⇩ Full manual
          </button>
          {copied === "ok" && <span className="font-type text-[10px] text-emerald-400">Manual downloaded.</span>}
          {copied === "fail" && (
            <span className="font-type text-[10px] text-paper/50">Manual file not reachable from the dev server — find it in the repo root.</span>
          )}
          <span className="ml-auto font-type text-[10px] text-paper/45">Esc closes this window.</span>
        </div>
      </DialogFrame>
    </div>
  );
}
