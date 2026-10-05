import type { CreditsSettings } from "./types";

/* ------------------------------------------------------------------ */
/*  Credits-intro look presets                                        */
/* ------------------------------------------------------------------ */
/* The credits node has a LOT of knobs (typeface, card motion, title
 * entrance, two colours, presentation style, three timing sliders, gate
 * weave, montage pacing). DIALLING a look in by hand is slow, so the panel
 * offers a row of named looks — each one is a complete bundle of the style
 * knobs, and every knob stays editable afterwards.
 *
 * A preset is a LOOK, never CONTENT: it writes the style knobs only. The
 * authored title, subheading, credit lines and the montage stills belong to
 * the author and are always preserved when a preset is applied.
 */

export type CreditsPresetId =
  | "pulp-default"
  | "grindhouse-slam"
  | "serial-matinee"
  | "noir-forties"
  | "silent-intertitle"
  | "rep-house-roll"
  | "vhs-midnight"
  | "prestige-awards"
  | "epic-roadshow"
  | "candlelight-gothic"
  | "cold-war-dossier"
  | "studio-forties"
  | "newsreel-forties"
  | "daytime-drama"
  | "final-bow"
  | "streaming-cold-open"
  | "neon-night"
  | "giallo-flash";

/** Which picker section a preset files under. The grid has grown past a
 * flat wall of buttons — the Studio groups the cards so an author scanning
 * for "something worn" or "something modern" finds it fast. */
export type CreditsPresetGroup = "reset" | "worn" | "polish" | "electric";

export const CREDITS_PRESET_GROUPS: { id: CreditsPresetGroup; label: string; blurb: string }[] = [
  { id: "reset", label: "Start here", blurb: "the untouched look — also the reset button" },
  { id: "worn", label: "Worn print", blurb: "gate weave, flicker, splice bumps — film that has been through the projector too many times" },
  { id: "polish", label: "Prestige & polish", blurb: "steady, tasteful presentations — awards nights, roadshows, files and farewell cards" },
  { id: "electric", label: "Modern & electric", blurb: "locked-off, digital, neon — cold opens that belong to this century" },
];

/** The style knobs a preset writes. The authored text (title / subtitle /
 * lines) and the montage stills are deliberately excluded — a look never
 * overwrites content. */
export type CreditsLook = Omit<CreditsSettings, "title" | "subtitle" | "lines" | "montage">;

export interface CreditsPreset {
  id: CreditsPresetId;
  name: string;
  /** short reference in the picker button ("Tarantino chapter card"). */
  badge: string;
  /** what the look actually does, shown under the grid. */
  tagline: string;
  /** dot colour in the picker — the title colour the look dials in. */
  swatch: string;
  /** which picker section the card files under. */
  group: CreditsPresetGroup;
  /** the complete style bundle (every knob present, see `look()`). */
  look: CreditsLook;
}

/** What the renderer falls back to when a knob is unset. Mirrors the
 * defaults in src/game/Game.tsx (Credits) and the colour inputs in Studio. */
export const CREDITS_DEFAULTS: CreditsLook = {
  font: "pulp",
  cardMotion: "blur-rise",
  titleEntrance: "fade-up",
  titleColor: undefined,
  style: "fade-up",
  cardSeconds: 3.4,
  montageSeconds: 5,
  montageTransition: "dissolve",
  montageLoop: true,
  stagger: 0.4,
  duration: 0.85,
  scrollDuration: 24,
  accentColor: undefined,
  gateWeave: "off",
};

/** The gold the title uses when `titleColor` is blank (--color-gold). */
export const CREDITS_DEFAULT_TITLE_COLOR = "#e8b23c";
/** The cyan the subheading / role labels use when `accentColor` is blank. */
export const CREDITS_DEFAULT_ACCENT = "#2ad9d9";

/** Every knob a preset owns, in picker order. Kept as a literal list so a new
 * CreditsSettings field can't silently escape the comparison. */
export const CREDITS_LOOK_KEYS = [
  "font",
  "cardMotion",
  "titleEntrance",
  "titleColor",
  "style",
  "cardSeconds",
  "montageSeconds",
  "montageTransition",
  "montageLoop",
  "stagger",
  "duration",
  "scrollDuration",
  "accentColor",
  "gateWeave",
] as const satisfies readonly (keyof CreditsLook)[];

/** Fill a partial bundle out to every knob, so applying it always overwrites
 * the whole look (including resetting a knob back to its default). */
export const look = (overrides: CreditsLook = {}): CreditsLook => ({
  ...CREDITS_DEFAULTS,
  ...overrides,
});

export const CREDITS_PRESETS: Record<CreditsPresetId, CreditsPreset> = {
  "pulp-default": {
    id: "pulp-default",
    name: "Pulp Default",
    group: "reset",
    badge: "🥃 The reset button",
    tagline:
      "Heavy slab on the studio gold, staggered fade-up, dead steady. This is exactly what an untouched credits node does — pick it to back out of a preset.",
    swatch: CREDITS_DEFAULT_TITLE_COLOR,
    look: look(),
  },
  "grindhouse-slam": {
    id: "grindhouse-slam",
    name: "Grindhouse Slam",
    group: "worn",
    badge: "🩸 Tarantino chapter card",
    tagline:
      "Bebas caps in stark yellow, one credit SLAMMING in at a time over hard-cut stills, on a print that has done the rounds. Add black spacer stills for the chapter rhythm.",
    swatch: "#f5c518",
    look: look({
      font: "poster",
      style: "cards",
      cardMotion: "slam",
      titleEntrance: "slam",
      titleColor: "#f5c518",
      accentColor: "#f4f1e8",
      cardSeconds: 3.2,
      montageTransition: "cut",
      montageSeconds: 4,
      stagger: 0.45,
      duration: 0.9,
      gateWeave: "worn",
    }),
  },
  "serial-matinee": {
    id: "serial-matinee",
    name: "Saturday Matinee",
    group: "worn",
    badge: "🐴 Fifteen chapters",
    tagline:
      "Heavy slab in serial silver sliding in sideways under a scarlet flash, three-second cards over hard cuts, a print that has been screened weekly since 1938 — the cliffhanger chapter card.",
    swatch: "#d9dde2",
    look: look({
      font: "pulp",
      style: "cards",
      cardMotion: "slide",
      titleEntrance: "slam",
      titleColor: "#d9dde2",
      accentColor: "#c23b2e",
      cardSeconds: 3,
      montageTransition: "cut",
      montageSeconds: 3.5,
      stagger: 0.35,
      duration: 0.7,
      gateWeave: "worn",
    }),
  },
  "noir-forties": {
    id: "noir-forties",
    name: "Noir '40s",
    group: "worn",
    badge: "🚬 Typewriter on a worn print",
    tagline:
      "Newsreader ivory typed out under a slow gate weave, cool slate labels, a leisurely stagger — the opening card of a B-picture thriller.",
    swatch: "#eceae4",
    look: look({
      font: "type",
      style: "fade-up",
      titleEntrance: "typewriter",
      titleColor: "#eceae4",
      accentColor: "#9fb0bb",
      stagger: 0.6,
      duration: 1.1,
      gateWeave: "subtle",
    }),
  },
  "silent-intertitle": {
    id: "silent-intertitle",
    name: "Silent Intertitle",
    group: "worn",
    badge: "🎹 Piano & flicker",
    tagline:
      "Cinzel card stock settling down out of oversize, warm ivory type, a tired projector throwing splice bumps — a 1920s title card, dust and all.",
    swatch: "#f2efe4",
    look: look({
      font: "epic",
      style: "cards",
      cardMotion: "scale-down",
      titleEntrance: "fade-up",
      titleColor: "#f2efe4",
      accentColor: "#a89f8b",
      cardSeconds: 3.6,
      gateWeave: "projector",
    }),
  },
  "prestige-awards": {
    id: "prestige-awards",
    name: "Prestige Awards",
    group: "polish",
    badge: "🏆 Ivory & brass",
    tagline:
      "Playfair ivory on a plain dissolve, brass role labels, four seconds per card and no weave at all — the tasteful end-credits roll.",
    swatch: "#e9e2d0",
    look: look({
      font: "elegant",
      style: "cards",
      cardMotion: "fade",
      titleEntrance: "fade-up",
      titleColor: "#e9e2d0",
      accentColor: "#b08d57",
      cardSeconds: 4,
      gateWeave: "off",
    }),
  },
  "epic-roadshow": {
    id: "epic-roadshow",
    name: "Epic Roadshow",
    group: "polish",
    badge: "⚔️ 70mm overture",
    tagline:
      "Chiselled Roman capitals in gold, the title slamming in over long dissolves of stills, a barely-there weave — the roadshow presentation card.",
    swatch: "#d4af37",
    look: look({
      font: "epic",
      style: "cards",
      cardMotion: "blur-rise",
      titleEntrance: "slam",
      titleColor: "#d4af37",
      accentColor: "#cfd8e3",
      cardSeconds: 4.2,
      montageSeconds: 6,
      gateWeave: "subtle",
    }),
  },
  "candlelight-gothic": {
    id: "candlelight-gothic",
    name: "Candlelight Gothic",
    group: "polish",
    badge: "🕯 Candle in the parlour",
    tagline:
      "Playfair bone-white fading in slow under a dried-blood rule, long dissolves, a barely-there weave — a candle burning down in the parlour while the house keeps its secrets.",
    swatch: "#e7dfd1",
    look: look({
      font: "elegant",
      style: "cards",
      cardMotion: "fade",
      titleEntrance: "fade-up",
      titleColor: "#e7dfd1",
      accentColor: "#9e3b47",
      cardSeconds: 4.6,
      montageSeconds: 6.5,
      montageTransition: "dissolve",
      stagger: 0.7,
      duration: 1.2,
      gateWeave: "subtle",
    }),
  },
  "cold-war-dossier": {
    id: "cold-war-dossier",
    name: "Cold War Dossier",
    group: "polish",
    badge: "🕵 Typed on the file",
    tagline:
      "Newsreader ivory typed wide apart onto manila, olive file stamps, each credit letterspacing itself open like a folder across the table — the espionage thriller's war of paperwork.",
    swatch: "#e6e1d3",
    look: look({
      font: "type",
      style: "cards",
      cardMotion: "letterspace",
      titleEntrance: "typewriter",
      titleColor: "#e6e1d3",
      accentColor: "#a3a575",
      cardSeconds: 3.8,
      montageTransition: "cut",
      montageSeconds: 4.5,
      gateWeave: "subtle",
    }),
  },
  "studio-forties": {
    id: "studio-forties",
    name: "Studio Era '40s",
    group: "polish",
    badge: "🎩 A-picture title card",
    tagline:
      "Chiselled Cinzel capitals in warm ivory irising open out of black, one stately card at a time over long dissolves, aged-brass role labels and a well-kept gate — the 1940s studio A-picture opening title, tuxedo, orchestra and all.",
    swatch: "#f0e6cf",
    look: look({
      font: "epic",
      style: "cards",
      cardMotion: "iris",
      titleEntrance: "fade-up",
      titleColor: "#f0e6cf",
      accentColor: "#c9a35c",
      cardSeconds: 4.6,
      montageTransition: "dissolve",
      montageSeconds: 5.5,
      stagger: 0.6,
      duration: 1.1,
      gateWeave: "subtle",
    }),
  },
  "newsreel-forties": {
    id: "newsreel-forties",
    name: "Newsreel '40s",
    group: "worn",
    badge: "📰 March of the footage",
    tagline:
      "Newsreader ivory sliding across hard-cut stock shots, khaki stamps, sub-three-second cards and the worst gate in the building — a wartime newsreel title card run on a field projector.",
    swatch: "#efe9dc",
    look: look({
      font: "type",
      style: "cards",
      cardMotion: "slide",
      titleEntrance: "fade-up",
      titleColor: "#efe9dc",
      accentColor: "#8c8c7a",
      cardSeconds: 2.8,
      montageTransition: "cut",
      montageSeconds: 3,
      stagger: 0.3,
      duration: 0.6,
      gateWeave: "projector",
    }),
  },
  "daytime-drama": {
    id: "daytime-drama",
    name: "Daytime Drama",
    group: "polish",
    badge: "🌹 Syndicated roll",
    tagline:
      "A brisk 18-second Playfair roll, champagne names over rose labels, dead steady and gone in three minutes — the syndicated afternoon serial, opening credits and all.",
    swatch: "#f3ead8",
    look: look({
      font: "elegant",
      style: "scroll",
      titleEntrance: "fade-up",
      titleColor: "#f3ead8",
      accentColor: "#d4899f",
      scrollDuration: 18,
      stagger: 0.45,
      duration: 0.9,
      gateWeave: "off",
    }),
  },
  "final-bow": {
    id: "final-bow",
    name: "Final Bow",
    group: "polish",
    badge: "🕊 Holds the last still",
    tagline:
      "An unhurried fade-up in Playfair ivory and slate, the montage dissolving slowly and then holding on the last image without looping — the memorial card, the last look back.",
    swatch: "#f5f2ea",
    look: look({
      font: "elegant",
      style: "fade-up",
      titleEntrance: "fade-up",
      titleColor: "#f5f2ea",
      accentColor: "#8fa3b8",
      montageSeconds: 7,
      montageTransition: "dissolve",
      montageLoop: false,
      stagger: 0.8,
      duration: 1.4,
      gateWeave: "off",
    }),
  },
  "neon-night": {
    id: "neon-night",
    name: "Neon Night",
    group: "electric",
    badge: "💗 Failing sign",
    tagline:
      "Josefin pink flickering up like a sign with a bad transformer, cyan labels, hard cuts between stills, locked-off and clean — the neo-noir cold open.",
    swatch: "#ff2e88",
    look: look({
      font: "modern",
      style: "cards",
      cardMotion: "flicker",
      titleEntrance: "fade-up",
      titleColor: "#ff2e88",
      accentColor: "#2ad9d9",
      cardSeconds: 3.4,
      montageTransition: "cut",
      gateWeave: "off",
    }),
  },
  "rep-house-roll": {
    id: "rep-house-roll",
    name: "Rep-House Roll",
    group: "worn",
    badge: "📜 Tired projector",
    tagline:
      "A full 32-second rolling scroll of slab gold on amber labels, with the last surviving print of the projector doing the weave — the midnight repertory house.",
    swatch: "#e8b23c",
    look: look({
      font: "pulp",
      style: "scroll",
      titleEntrance: "fade-up",
      accentColor: "#d9a441",
      scrollDuration: 32,
      stagger: 0.5,
      duration: 1,
      gateWeave: "projector",
    }),
  },
  "streaming-cold-open": {
    id: "streaming-cold-open",
    name: "Streaming Cold Open",
    group: "electric",
    badge: "⚡ Fast, flat, modern",
    tagline:
      "Josefin white typed in fast over a crimson accent, tight stagger, short fades, nothing on the gate — the modern title card that gets out of the way.",
    swatch: "#ffffff",
    look: look({
      font: "modern",
      style: "fade-up",
      titleEntrance: "typewriter",
      titleColor: "#ffffff",
      accentColor: "#e50914",
      stagger: 0.25,
      duration: 0.6,
      gateWeave: "off",
    }),
  },
  "vhs-midnight": {
    id: "vhs-midnight",
    name: "VHS Midnight",
    group: "worn",
    badge: "📼 Fourth-gen tape",
    tagline:
      "Condensed acid green slamming in with a hot magenta accent, three-second cards, hard cuts, and the worst gate in the building — a tape you found in a drawer.",
    swatch: "#b8ff4a",
    look: look({
      font: "poster",
      style: "cards",
      cardMotion: "flicker",
      titleEntrance: "slam",
      titleColor: "#b8ff4a",
      accentColor: "#ff5cf4",
      cardSeconds: 3,
      montageTransition: "cut",
      montageSeconds: 3,
      gateWeave: "projector",
    }),
  },
  "giallo-flash": {
    id: "giallo-flash",
    name: "Giallo Flash",
    group: "electric",
    badge: "🔪 Blood & chrome",
    tagline:
      "Bebas blood-red blurring up out of the dark with acid-green labels, sub-three-second cards over hard cuts, nothing wrong with the gate — the Italian razor thriller's title card.",
    swatch: "#e5303c",
    look: look({
      font: "poster",
      style: "cards",
      cardMotion: "blur-rise",
      titleEntrance: "slam",
      titleColor: "#e5303c",
      accentColor: "#8df2a0",
      cardSeconds: 2.8,
      montageTransition: "cut",
      montageSeconds: 3.5,
      gateWeave: "off",
    }),
  },
};

export const CREDITS_PRESET_LIST: CreditsPreset[] = [
  // — reset —
  CREDITS_PRESETS["pulp-default"],
  // — worn print —
  CREDITS_PRESETS["grindhouse-slam"],
  CREDITS_PRESETS["serial-matinee"],
  CREDITS_PRESETS["noir-forties"],
  CREDITS_PRESETS["silent-intertitle"],
  CREDITS_PRESETS["rep-house-roll"],
  CREDITS_PRESETS["newsreel-forties"],
  CREDITS_PRESETS["vhs-midnight"],
  // — prestige & polish —
  CREDITS_PRESETS["prestige-awards"],
  CREDITS_PRESETS["epic-roadshow"],
  CREDITS_PRESETS["candlelight-gothic"],
  CREDITS_PRESETS["cold-war-dossier"],
  CREDITS_PRESETS["studio-forties"],
  CREDITS_PRESETS["daytime-drama"],
  CREDITS_PRESETS["final-bow"],
  // — modern & electric —
  CREDITS_PRESETS["streaming-cold-open"],
  CREDITS_PRESETS["neon-night"],
  CREDITS_PRESETS["giallo-flash"],
];

/* --- one-line knob read-out for the picker cards -------------------- */
/* The Studio cards show this under each preset so an author can see what
 * a look does before applying it: "Bebas · cards/slam · hard cuts · worn
 * weave". Kept here with the catalogue so the phrasing ships with it. */

const FONT_LABEL: Record<NonNullable<CreditsLook["font"]>, string> = {
  pulp: "Slab",
  poster: "Bebas",
  elegant: "Playfair",
  epic: "Cinzel",
  modern: "Josefin",
  type: "Newsreader",
};

const WEAVE_LABEL: Record<NonNullable<CreditsLook["gateWeave"]>, string> = {
  off: "steady gate",
  subtle: "subtle weave",
  worn: "worn weave",
  projector: "projector weave",
};

/** A compact read-out of a look — typeface, presentation/motion, montage
 * handling and gate. `titleEntrance` only shows for the staggered list,
 * where the title gets its own entrance; in `cards` the title is the first
 * card (cardMotion rules), and `scroll` animates nothing but the roll. */
export function creditsLookSummary(l: CreditsLook): string {
  const bits: string[] = [FONT_LABEL[l.font ?? "pulp"]];
  if (l.style === "cards") bits.push(`cards/${l.cardMotion ?? "blur-rise"}`);
  else if (l.style === "scroll") bits.push(`scroll ${l.scrollDuration ?? 24}s`);
  else {
    bits.push("staggered list");
    if (l.titleEntrance && l.titleEntrance !== "fade-up") bits.push(l.titleEntrance);
  }
  bits.push(l.montageTransition === "cut" ? "hard cuts" : "dissolves");
  bits.push(WEAVE_LABEL[l.gateWeave ?? "off"]);
  return bits.join(" · ");
}

/** Lowercase and expand a 3-digit hex so "#FFF" and "#ffffff" compare equal. */
const normColor = (v: string | undefined): string | undefined => {
  if (!v) return undefined;
  const t = v.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(t)) return `#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`;
  return t;
};

/** A fully-resolved look: every knob filled in, colours normalised. Used for
 * the comparison so an unset knob and an explicit default match. */
export function resolveCreditsLook(partial?: CreditsSettings): Record<keyof CreditsLook, string | number | boolean> {
  return {
    font: partial?.font ?? CREDITS_DEFAULTS.font!,
    cardMotion: partial?.cardMotion ?? CREDITS_DEFAULTS.cardMotion!,
    titleEntrance: partial?.titleEntrance ?? CREDITS_DEFAULTS.titleEntrance!,
    titleColor: normColor(partial?.titleColor) ?? CREDITS_DEFAULT_TITLE_COLOR,
    style: partial?.style ?? CREDITS_DEFAULTS.style!,
    cardSeconds: partial?.cardSeconds ?? CREDITS_DEFAULTS.cardSeconds!,
    montageSeconds: partial?.montageSeconds ?? CREDITS_DEFAULTS.montageSeconds!,
    montageTransition: partial?.montageTransition ?? CREDITS_DEFAULTS.montageTransition!,
    montageLoop: partial?.montageLoop ?? CREDITS_DEFAULTS.montageLoop!,
    stagger: partial?.stagger ?? CREDITS_DEFAULTS.stagger!,
    duration: partial?.duration ?? CREDITS_DEFAULTS.duration!,
    scrollDuration: partial?.scrollDuration ?? CREDITS_DEFAULTS.scrollDuration!,
    accentColor: normColor(partial?.accentColor) ?? CREDITS_DEFAULT_ACCENT,
    gateWeave: partial?.gateWeave ?? CREDITS_DEFAULTS.gateWeave!,
  };
}

const sameKnob = (a: string | number | boolean, b: string | number | boolean): boolean =>
  typeof a === "number" && typeof b === "number" ? Math.abs(a - b) < 1e-6 : a === b;

/** Which preset a credits node's style knobs currently spell out, or
 * undefined when the author has dialled in their own combination. Only the
 * style knobs count — authored text and montage stills never affect it. */
export function matchCreditsPreset(credits?: CreditsSettings): CreditsPresetId | undefined {
  const have = resolveCreditsLook(credits);
  for (const p of CREDITS_PRESET_LIST) {
    const want = resolveCreditsLook(p.look);
    if (CREDITS_LOOK_KEYS.every((k) => sameKnob(have[k], want[k]))) return p.id;
  }
  return undefined;
}

/** A preset merged over the node's current credits: the whole look is
 * replaced, while title / subtitle / lines / montage (and any field this
 * module doesn't own) are carried through untouched. */
export function applyCreditsPreset(id: CreditsPresetId, current?: CreditsSettings): CreditsSettings {
  const p = CREDITS_PRESETS[id];
  if (!p) return { ...(current ?? {}) };
  return { ...(current ?? {}), ...p.look };
}
