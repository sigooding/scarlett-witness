/**
 * INJECT-A-WORLD-STATE DEEP LINKS.
 *
 * `?seed=1234` already pins the RNG. This does the same trick for the WORLD:
 *
 *   ?scene=tt_light&flags=tt_caught_lie,tt_heard_signal&items=tt_manifest_page
 *   ?scene=booth&trust=lydia:3,marco:-2&meters=Suspicion:5&memories=alibi:I%20lied
 *
 * The engine boots straight into that scene with that state, at full screen,
 * with real audio and cinematics — the difference between "the gate should
 * open" in Studio's inspector and watching the gate open in the game. It is
 * also the cheapest way to hand a collaborator one specific branch: send them
 * a link.
 *
 * Design rules, deliberately strict in one direction and forgiving in the
 * other:
 *
 *  · UNKNOWN IDS ARE WARNINGS, NEVER ERRORS. A renamed flag or a cut item must
 *    degrade to "that part was ignored" and still boot the scene — a deep link
 *    that hard-fails is a deep link nobody trusts.
 *  · ONLY WORLD STATE IS INJECTABLE. Flags, items, meters, trust, memories and
 *    the target scene. The journey log, save slots and episode progress stay
 *    read-only, so a link can never fabricate a "previously on…" recap or
 *    forge a completed season.
 *  · A LINK NEVER TOUCHES SAVES. It seeds the run in memory; the normal
 *    checkpoint machinery takes over from the first scene arrival.
 */

import { createInitialState } from "../logic";
import type { GlobalState, MeterKey, Story } from "../types";

export const METER_NAMES: MeterKey[] = ["Sultry", "Aggressive", "Clever", "Suspicion"];

export interface DeepLinkRequest {
  /** the scene to open on, if the link named one */
  sceneId?: string;
  flags: string[];
  items: string[];
  meters: Partial<Record<MeterKey, number>>;
  trust: Record<string, number>;
  memories: Record<string, string>;
  /** true when the link carried any world-state parameter at all */
  present: boolean;
}

export interface DeepLinkResolution {
  request: DeepLinkRequest;
  /** the scene the game should open on (validated), or undefined for the
   *  story's own start scene */
  sceneId?: string;
  /** the world state to open with */
  state: GlobalState;
  /** ids the link asked for that this story doesn't have — surfaced to the
   *  author, never fatal */
  warnings: string[];
  /** did anything actually get injected? */
  applied: boolean;
}

const KEYS = ["scene", "flags", "items", "meters", "trust", "memories"] as const;

/** Split a comma-separated list, trimming and dropping blanks. */
function list(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Parse `a:1,b:-2` into pairs. A missing value means 1 (so `?flags=` style
 *  bare ids work in the numeric params too). */
function pairs(raw: string | null): [string, string][] {
  return list(raw).map((entry) => {
    const idx = entry.indexOf(":");
    if (idx < 0) return [entry, "1"] as [string, string];
    return [entry.slice(0, idx).trim(), entry.slice(idx + 1).trim()] as [string, string];
  });
}

/** Read a world-state request out of a query string. Pure — no story needed,
 *  so it can be unit tested and reused by Studio's link builder. */
export function parseDeepLink(search: string): DeepLinkRequest {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search ?? "");
  } catch {
    params = new URLSearchParams();
  }
  const present = KEYS.some((k) => params.get(k) !== null && params.get(k) !== "");

  const meters: Partial<Record<MeterKey, number>> = {};
  for (const [rawKey, rawVal] of pairs(params.get("meters"))) {
    // Meter names are matched case-insensitively so ?meters=suspicion:5 works.
    const key = METER_NAMES.find((m) => m.toLowerCase() === rawKey.toLowerCase());
    const val = Number(rawVal);
    if (key && Number.isFinite(val)) meters[key] = val;
  }

  const trust: Record<string, number> = {};
  for (const [id, rawVal] of pairs(params.get("trust"))) {
    const val = Number(rawVal);
    if (id && Number.isFinite(val)) trust[id] = val;
  }

  const memories: Record<string, string> = {};
  for (const [tag, val] of pairs(params.get("memories"))) {
    if (tag) memories[tag] = val;
  }

  const scene = (params.get("scene") ?? "").trim();
  return {
    ...(scene ? { sceneId: scene } : {}),
    flags: list(params.get("flags")),
    items: list(params.get("items")),
    meters,
    trust,
    memories,
    present,
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Resolve a parsed request against a real story: validate every id, build the
 * `GlobalState` to boot with, and collect warnings for anything the story
 * doesn't recognise. Unknown flags are the one exception to validation —
 * flags are free-form strings and an author may deep-link a flag that is only
 * *set* by content they haven't written yet, so an unknown flag is applied
 * with a warning rather than dropped.
 */
export function resolveDeepLink(story: Story, request: DeepLinkRequest): DeepLinkResolution {
  const warnings: string[] = [];
  const state = createInitialState(story);

  // ---- scene -------------------------------------------------------
  let sceneId: string | undefined;
  if (request.sceneId) {
    if (story.scenes.some((s) => s.id === request.sceneId)) sceneId = request.sceneId;
    else warnings.push(`unknown scene "${request.sceneId}" — opening the story's start scene instead`);
  }

  // ---- flags -------------------------------------------------------
  const known = new Set<string>();
  for (const sc of story.scenes) {
    for (const c of sc.choices ?? []) {
      c.consequences?.setFlags?.forEach((f) => known.add(f));
      c.timedOutConsequences?.setFlags?.forEach((f) => known.add(f));
    }
    for (const h of sc.hotspots ?? []) {
      if (h.action.flagSet) known.add(h.action.flagSet);
    }
    if (sc.interrogation) {
      known.add(sc.interrogation.brokeFlag);
      if (sc.interrogation.clampFlag) known.add(sc.interrogation.clampFlag);
    }
  }
  for (const f of request.flags) {
    // Applied either way — a flag no scene sets yet is still a legitimate
    // thing to test a gate against.
    state.activeFlags.add(f);
    if (!known.has(f)) warnings.push(`flag "${f}" is never set by this story — applied anyway`);
  }

  // ---- items -------------------------------------------------------
  for (const id of request.items) {
    const item = story.items.find((i) => i.id === id);
    if (!item) {
      warnings.push(`unknown item "${id}" — ignored`);
      continue;
    }
    if (!state.inventory.some((i) => i.id === id)) state.inventory.push(item);
  }

  // ---- meters ------------------------------------------------------
  for (const key of METER_NAMES) {
    const v = request.meters[key];
    if (v === undefined) continue;
    state.meters[key] = clamp(Math.round(v), 0, 10);
    if (v < 0 || v > 10) warnings.push(`meter ${key}=${v} clamped to 0–10`);
  }

  // ---- trust -------------------------------------------------------
  for (const [id, v] of Object.entries(request.trust)) {
    if (!story.characters.some((c) => c.id === id)) {
      warnings.push(`unknown character "${id}" in trust — ignored`);
      continue;
    }
    state.characterTrust[id] = clamp(Math.round(v), -5, 5);
    if (v < -5 || v > 5) warnings.push(`trust ${id}=${v} clamped to -5–5`);
  }

  // ---- memories ----------------------------------------------------
  for (const [tag, line] of Object.entries(request.memories)) {
    state.memories[tag] = line;
  }

  const applied =
    !!sceneId ||
    request.flags.length > 0 ||
    state.inventory.length > 0 ||
    Object.keys(request.meters).length > 0 ||
    Object.keys(state.characterTrust).length > 0 ||
    Object.keys(request.memories).length > 0;

  return { request, ...(sceneId ? { sceneId } : {}), state, warnings, applied };
}

/** Read the live URL (boot-time convenience). Safe outside a browser. */
export function deepLinkFromUrl(): DeepLinkRequest {
  let search = "";
  try {
    search = globalThis.location?.search ?? "";
  } catch {
    search = "";
  }
  return parseDeepLink(search);
}

/** Build a shareable link for a world state — the inverse of the parser, used
 *  by Studio's "copy a deep link" affordance. `base` defaults to the current
 *  page with its query string dropped. */
export function buildDeepLink(
  opts: {
    storyId?: string;
    sceneId?: string;
    flags?: Iterable<string>;
    items?: Iterable<string>;
    meters?: Partial<Record<MeterKey, number>>;
    trust?: Record<string, number>;
    memories?: Record<string, string>;
    seed?: string;
  },
  base = ""
): string {
  const parts: string[] = [];
  const add = (k: string, v: string) => {
    if (v) parts.push(`${k}=${encodeURIComponent(v)}`);
  };
  if (opts.storyId) add("story", opts.storyId);
  if (opts.sceneId) add("scene", opts.sceneId);
  const flags = [...(opts.flags ?? [])];
  if (flags.length) add("flags", flags.join(","));
  const items = [...(opts.items ?? [])];
  if (items.length) add("items", items.join(","));
  const meters = Object.entries(opts.meters ?? {}).filter(([, v]) => typeof v === "number");
  if (meters.length) add("meters", meters.map(([k, v]) => `${k}:${v}`).join(","));
  const trust = Object.entries(opts.trust ?? {});
  if (trust.length) add("trust", trust.map(([k, v]) => `${k}:${v}`).join(","));
  const memories = Object.entries(opts.memories ?? {});
  if (memories.length) add("memories", memories.map(([k, v]) => `${k}:${v}`).join(","));
  if (opts.seed) add("seed", opts.seed);
  if (!parts.length) return base;
  return `${base}?${parts.join("&")}`;
}

/** A one-line summary for the boot console / the in-game toast. */
export function describeDeepLink(res: DeepLinkResolution): string {
  const bits: string[] = [];
  if (res.sceneId) bits.push(`scene ${res.sceneId}`);
  if (res.request.flags.length) bits.push(`${res.request.flags.length} flag(s)`);
  if (res.state.inventory.length) bits.push(`${res.state.inventory.length} item(s)`);
  const meters = Object.keys(res.request.meters).length;
  if (meters) bits.push(`${meters} meter(s)`);
  const trust = Object.keys(res.state.characterTrust).length;
  if (trust) bits.push(`${trust} trust value(s)`);
  const memories = Object.keys(res.request.memories).length;
  if (memories) bits.push(`${memories} memory/memories`);
  return bits.length ? bits.join(" · ") : "nothing to inject";
}
