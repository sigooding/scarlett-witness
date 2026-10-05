/**
 * PLAYTEST COVERAGE — what your last run actually exercised.
 *
 * The validator answers "can this be reached?" (static: it walks the graph
 * from the start scene). It cannot answer "did I actually reach it?" — the
 * branch you have never played is exactly the branch most likely to be
 * broken, and finding out means replaying the whole case.
 *
 * So the engine keeps a tally while you play: every scene you ENTER and every
 * choice you PICK is counted, per story, in localStorage — plus every choice
 * OFFERED (presented pickable in the choice rail), so Studio can show a
 * per-choice pick rate: a choice shown again and again but never taken is
 * wasted writing or a wording/consequence mismatch. It survives reloads and
 * closing the tab, accumulates across playthroughs (so coverage grows as you
 * test different branches), and resets on demand from Studio.
 *
 * Nothing here affects play — no state is read back into the game, and a
 * missing or corrupt record is simply treated as "nothing recorded yet".
 */

import type { Story } from "../types";

export const COVERAGE_VERSION = 2;

export interface PlaytestCoverage {
  version: number;
  storyId: string;
  /** when recording first started */
  startedAt: number;
  /** last time anything was recorded */
  updatedAt: number;
  /** how many times a playthrough reached an ending scene */
  runs: number;
  /** scene id → number of visits */
  scenes: Record<string, number>;
  /** `${sceneId}:${choiceId}` → number of times picked */
  choices: Record<string, number>;
  /** `${sceneId}:${choiceId}` → number of times PRESENTED as a pickable
   *  choice (offers). Together with `choices` this gives the pick rate. */
  offers: Record<string, number>;
  /** 🚶 STAGE nodes — `${sceneId}:${hotspotId}` → number of marker actions FIRED */
  markers: Record<string, number>;
  /** 🚶 STAGE nodes — cutscene steps that actually ran:
   *  `${sceneId}:#${index}` for the room-entry script,
   *  `${sceneId}:${hotspotId}#${index}` for a runScript hotspot's script. */
  cutscene: Record<string, number>;
}

export const coverageKey = (storyId: string) => `scarlet-reel-coverage:${storyId}`;

export function emptyCoverage(storyId: string, at = Date.now()): PlaytestCoverage {
  return { version: COVERAGE_VERSION, storyId, startedAt: at, updatedAt: at, runs: 0, scenes: {}, choices: {}, offers: {}, markers: {}, cutscene: {} };
}

/** A stored record, or null when there isn't one (or it is unreadable /
 *  malformed / from an older schema — a bad value must never break play). */
export function readCoverage(storyId: string): PlaytestCoverage | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(coverageKey(storyId));
  } catch {
    return null; // storage unavailable (private mode, disabled cookies)
  }
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const c = parsed as Partial<PlaytestCoverage>;
  if (c.version !== COVERAGE_VERSION) return null; // old format: start fresh
  if (typeof c.storyId !== "string" || c.storyId !== storyId) return null;
  return {
    version: COVERAGE_VERSION,
    storyId,
    startedAt: typeof c.startedAt === "number" ? c.startedAt : Date.now(),
    updatedAt: typeof c.updatedAt === "number" ? c.updatedAt : Date.now(),
    runs: typeof c.runs === "number" && c.runs >= 0 ? c.runs : 0,
    scenes: isCountMap(c.scenes) ? c.scenes : {},
    choices: isCountMap(c.choices) ? c.choices : {},
    // A tally written before offers existed simply has no offers recorded —
    // additive, so old records keep their value instead of resetting.
    offers: isCountMap(c.offers) ? c.offers : {},
    markers: isCountMap(c.markers) ? c.markers : {},
    cutscene: isCountMap(c.cutscene) ? c.cutscene : {},
  };
}

function isCountMap(v: unknown): v is Record<string, number> {
  return !!v && typeof v === "object" && !Array.isArray(v) && Object.values(v as Record<string, unknown>).every((n) => typeof n === "number");
}

export function writeCoverage(cov: PlaytestCoverage): void {
  try {
    localStorage.setItem(coverageKey(cov.storyId), JSON.stringify(cov));
  } catch {
    /* storage unavailable — coverage just won't persist */
  }
}

export function clearCoverage(storyId: string): void {
  try {
    localStorage.removeItem(coverageKey(storyId));
  } catch {
    /* nothing to clear */
  }
}

/** Record one visit / one pick / one stage-marker fire / one cutscene step
 *  run. Pure — returns the new record, writes nothing. */
export function recordVisit(
  cov: PlaytestCoverage,
  kind: "scene" | "choice" | "offer" | "marker" | "cutscene",
  id: string,
  at = Date.now()
): PlaytestCoverage {
  if (!id) return cov;
  if (kind === "scene") return { ...cov, updatedAt: at, scenes: { ...cov.scenes, [id]: (cov.scenes[id] ?? 0) + 1 } };
  if (kind === "choice") return { ...cov, updatedAt: at, choices: { ...cov.choices, [id]: (cov.choices[id] ?? 0) + 1 } };
  if (kind === "offer") return { ...cov, updatedAt: at, offers: { ...cov.offers, [id]: (cov.offers[id] ?? 0) + 1 } };
  if (kind === "marker") return { ...cov, updatedAt: at, markers: { ...cov.markers, [id]: (cov.markers[id] ?? 0) + 1 } };
  return { ...cov, updatedAt: at, cutscene: { ...cov.cutscene, [id]: (cov.cutscene[id] ?? 0) + 1 } };
}

/** Count a finished playthrough (a run that landed on an ending). */
export function recordRun(cov: PlaytestCoverage, at = Date.now()): PlaytestCoverage {
  return { ...cov, runs: cov.runs + 1, updatedAt: at };
}

/* ------------------------------------------------------------------ */
/*  Reporting                                                          */
/* ------------------------------------------------------------------ */

export interface CoverageGap {
  sceneId?: string;
  sceneTitle?: string;
  choiceId?: string;
  hotspotId?: string;
  text: string;
}

/** One choice's offer → pick balance. `rate` is 0–100 (the share of offers
 *  that were actually taken), so a low rate is the signal: it was shown and
 *  declined, or never touched at all. */
export interface PickRate {
  key: string;
  sceneId?: string;
  sceneTitle?: string;
  choiceId: string;
  text: string;
  offers: number;
  picks: number;
  /** 0–100, rounded. */
  rate: number;
}

export interface CoverageReport {
  /** scene tallies */
  sceneTotal: number;
  sceneVisited: number;
  missedScenes: CoverageGap[];
  /** choice tallies */
  choiceTotal: number;
  choiceTaken: number;
  missedChoices: CoverageGap[];
  /** pick-rate telemetry: how often each offered choice was actually taken */
  choiceOffered: number;
  choicePicks: number;
  choiceOffers: number;
  pickRates: PickRate[];
  /** endings */
  endingTotal: number;
  endingSeen: number;
  missedEndings: CoverageGap[];
  /** 🚶 stage markers fired (`sceneId:hotspotId` keys) */
  markerTotal: number;
  markerFired: number;
  missedMarkers: CoverageGap[];
  /** 🚶 authored cutscene steps, and how many have actually played */
  cutsceneTotal: number;
  cutsceneRun: number;
  missedCutsceneSteps: CoverageGap[];
  /** completed playthroughs */
  runs: number;
  /** last recorded activity, if any */
  updatedAt?: number;
  startedAt?: number;
}

/** The coverage key of one authored cutscene step: `#index` under the scene
 *  for the room-entry script, `hotspotId#index` for a runScript hotspot.
 *  Shared by the recorder (Game) and the report so they can never drift. */
export function cutsceneStepKey(sceneId: string, hotspotId: string | undefined, index: number): string {
  return `${sceneId}:${hotspotId ?? ""}#${index}`;
}

/** Compare a story against what has been played. Pure — safe to unit test. */
export function coverageReport(story: Story, cov: PlaytestCoverage | null): CoverageReport {
  const scenes = (story.scenes ?? []).filter((s) => s.nodeType !== "note");
  const missedScenes: CoverageGap[] = [];
  const missedChoices: CoverageGap[] = [];
  const missedEndings: CoverageGap[] = [];
  const missedMarkers: CoverageGap[] = [];
  const missedCutsceneSteps: CoverageGap[] = [];
  const pickRates: PickRate[] = [];
  let sceneVisited = 0;
  let choiceTotal = 0;
  let choiceTaken = 0;
  let choiceOffered = 0;
  let choicePicks = 0;
  let choiceOffers = 0;
  let endingTotal = 0;
  let endingSeen = 0;
  let markerTotal = 0;
  let markerFired = 0;
  let cutsceneTotal = 0;
  let cutsceneRun = 0;

  for (const sc of scenes) {
    const visits = cov?.scenes?.[sc.id] ?? 0;
    const isStage = sc.nodeType === "stage";
    if (visits > 0) sceneVisited++;
    else missedScenes.push({ sceneId: sc.id, sceneTitle: sc.title, text: sc.title });
    if (sc.isEnding) {
      endingTotal++;
      if (visits > 0) endingSeen++;
      else missedEndings.push({ sceneId: sc.id, sceneTitle: sc.title, text: sc.title });
    }
    for (const c of sc.choices ?? []) {
      choiceTotal++;
      const key = `${sc.id}:${c.id}`;
      const picks = cov?.choices?.[key] ?? 0;
      const offers = cov?.offers?.[key] ?? 0;
      choicePicks += picks;
      choiceOffers += offers;
      if (picks > 0) choiceTaken++;
      else missedChoices.push({ sceneId: sc.id, sceneTitle: sc.title, choiceId: c.id, text: c.text });
      if (offers > 0) {
        choiceOffered++;
        pickRates.push({
          key,
          sceneId: sc.id,
          sceneTitle: sc.title,
          choiceId: c.id,
          text: c.text,
          offers,
          picks,
          rate: Math.round((Math.min(picks, offers) / offers) * 100),
        });
      }
    }
    if (!isStage) continue;
    // Stage markers: every interactive marker's action firing counts.
    for (const h of sc.hotspots ?? []) {
      markerTotal++;
      const key = `${sc.id}:${h.id}`;
      if ((cov?.markers?.[key] ?? 0) > 0) markerFired++;
      else missedMarkers.push({ sceneId: sc.id, sceneTitle: sc.title, hotspotId: h.id, text: h.label });
    }
    // Authored cutscene steps, by the same keys the recorder writes at play
    // time: the room-entry script and every runScript hotspot's script.
    (sc.stage?.enterScript ?? []).forEach((_step, i) => {
      cutsceneTotal++;
      const key = cutsceneStepKey(sc.id, undefined, i);
      if ((cov?.cutscene?.[key] ?? 0) > 0) cutsceneRun++;
      else missedCutsceneSteps.push({ sceneId: sc.id, sceneTitle: sc.title, text: `entry step ${i + 1}` });
    });
    for (const h of sc.hotspots ?? []) {
      (h.action.script ?? []).forEach((_step, i) => {
        cutsceneTotal++;
        const key = cutsceneStepKey(sc.id, h.id, i);
        if ((cov?.cutscene?.[key] ?? 0) > 0) cutsceneRun++;
        else missedCutsceneSteps.push({ sceneId: sc.id, sceneTitle: sc.title, hotspotId: h.id, text: `${h.label} — step ${i + 1}` });
      });
    }
  }

  // Worst first: never-picked choices on top, then by most offers (the
  // strongest evidence of a dead choice), then by lowest rate.
  pickRates.sort((a, b) => a.rate - b.rate || b.offers - a.offers || b.picks - a.picks);

  return {
    sceneTotal: scenes.length,
    sceneVisited,
    missedScenes,
    choiceTotal,
    choiceTaken,
    missedChoices,
    choiceOffered,
    choicePicks,
    choiceOffers,
    pickRates,
    endingTotal,
    endingSeen,
    missedEndings,
    markerTotal,
    markerFired,
    missedMarkers,
    cutsceneTotal,
    cutsceneRun,
    missedCutsceneSteps,
    runs: cov?.runs ?? 0,
    ...(cov?.updatedAt ? { updatedAt: cov.updatedAt } : {}),
    ...(cov?.startedAt ? { startedAt: cov.startedAt } : {}),
  };
}

/** 0–100, or 0 for an empty story (nothing to cover). */
export function coveragePercent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((Math.min(done, total) / total) * 100);
}
