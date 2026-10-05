/**
 * AUTOMATED PLAYTHROUGH BOT — the TS body bundled and run by
 * scripts/playthrough-bot.mjs.
 *
 * It plays a case over and over through the SAME pure decision surface the
 * real runtime uses (src/game/decisions.ts), so a branch that works here works
 * in the game and a branch that breaks here breaks in the game. No React, no
 * DOM, no audio, no storage.
 *
 * What it finds FOR you:
 *   · dead ends       — a non-ending scene with nothing left to do
 *   · unreachable     — scenes / choices / endings no run ever hit
 *   · runaway loops   — a run that never terminates inside the step budget
 *   · crashes         — an exception thrown out of the decision surface
 *
 * How it explores: weighted randomness that PREFERS the branch nobody has
 * taken. The weight of a decision is 1/(1 + times it has been taken), counting
 * both this session's runs and — with --coverage — the real playtest coverage
 * tally exported from the browser, so the bot heads straight for the branches
 * a human tester has been avoiding.
 *
 * Determinism: --seed pins the whole session, so a failing run replays exactly.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { STORIES } from "../src/data/stories";
import { createInitialState, sceneById, isEpisodic, seasonEpisodes, carryOverState } from "../src/logic";
import {
  applyDecision,
  availableDecisions,
  decisionKey,
  initialSim,
  isStuck,
  type Decision,
  type SimState,
} from "../src/game/decisions";
import { coverageReport, emptyCoverage, recordRun, recordVisit, type PlaytestCoverage } from "../src/game/playtestCoverage";
import { setGameSeed } from "../src/game/rng";
import { buildDeepLink } from "../src/game/deepLink";
import type { Episode, Story } from "../src/types";

/* ------------------------------------------------------------------ */
/*  A local deterministic stream (mulberry32) — the bot's own dice.     */
/*  Kept separate from the game RNG so pinning the bot's exploration    */
/*  never perturbs the gameplay draws the runtime makes.               */
/* ------------------------------------------------------------------ */

function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/*  Options                                                            */
/* ------------------------------------------------------------------ */

interface Options {
  storyId?: string;
  runs: number;
  maxSteps: number;
  seed: string;
  /** how hard to prefer never-taken branches: 0 = uniform, 1 = full weighting */
  explore: number;
  /** probability a live quick-time window is deliberately allowed to lapse */
  qteTimeout: number;
  /** path to an exported PlaytestCoverage JSON to warm-start the weighting */
  coveragePath?: string;
  /** write the accumulated coverage tally here */
  outPath?: string;
  verbose: boolean;
  /** print a deep link for every problem found, so it can be reproduced */
  links: boolean;
}

function parseArgs(argv: string[]): Options {
  const get = (name: string): string | undefined => {
    const eq = argv.find((a) => a.startsWith(`--${name}=`));
    if (eq) return eq.slice(name.length + 3);
    const i = argv.indexOf(`--${name}`);
    if (i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--")) return argv[i + 1];
    return undefined;
  };
  const has = (name: string) => argv.includes(`--${name}`);
  const num = (name: string, dflt: number) => {
    const v = get(name);
    const n = v === undefined ? NaN : Number(v);
    return Number.isFinite(n) ? n : dflt;
  };
  return {
    ...(get("story") ? { storyId: get("story") } : {}),
    runs: Math.max(1, Math.floor(num("runs", 200))),
    maxSteps: Math.max(1, Math.floor(num("max-steps", 400))),
    seed: get("seed") ?? "scarlet",
    explore: Math.min(1, Math.max(0, num("explore", 1))),
    qteTimeout: Math.min(1, Math.max(0, num("qte-timeout", 0.15))),
    ...(get("coverage") ? { coveragePath: get("coverage") } : {}),
    ...(get("out") ? { outPath: get("out") } : {}),
    verbose: has("verbose"),
    links: has("links"),
  };
}

/* ------------------------------------------------------------------ */
/*  Findings                                                           */
/* ------------------------------------------------------------------ */

interface DeadEnd {
  sceneId: string;
  sceneTitle: string;
  /** the decisions that led here, most recent last */
  path: string[];
  runIndex: number;
}

interface Crash {
  sceneId: string;
  message: string;
  path: string[];
  runIndex: number;
}

interface RunResult {
  ended: boolean;
  endingSceneId?: string;
  steps: number;
  stuck?: DeadEnd;
  crash?: Crash;
  looped?: boolean;
}

/* ------------------------------------------------------------------ */
/*  One run                                                            */
/* ------------------------------------------------------------------ */

function weightedPick(decisions: Decision[], taken: Map<string, number>, rand: () => number, explore: number): Decision {
  if (decisions.length === 1) return decisions[0];
  // 1/(1+n) makes an untaken branch (n=0) worth 1 and a branch taken nine
  // times worth 0.1 — a strong pull toward the unexplored without ever
  // making a well-trodden branch impossible (some branches are only
  // reachable THROUGH a common one).
  const weights = decisions.map((d) => {
    const n = taken.get(decisionKey(d)) ?? 0;
    const preferNew = 1 / (1 + n);
    return 1 - explore + explore * preferNew;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rand() * total;
  for (let i = 0; i < decisions.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return decisions[i];
  }
  return decisions[decisions.length - 1];
}

function playOnce(
  story: Story,
  opts: Options,
  rand: () => number,
  taken: Map<string, number>,
  cov: { current: PlaytestCoverage },
  runIndex: number,
  episode?: Episode
): RunResult {
  const startState = episode ? carryOverState(story, episode.id) : createInitialState(story);
  const startScene = episode ? episode.sceneIds?.[0] : undefined;
  let sim: SimState = initialSim(story, startState, startScene);
  cov.current = recordVisit(cov.current, "scene", sim.sceneId);
  const path: string[] = [];
  // Pick-rate telemetry: which choices were PRESENTED at the previous step,
  // so an offer is counted when a choice first appears (and again when it
  // genuinely re-enters after leaving) — the same diff the runtime keeps.
  let prevOffered = new Set<string>();

  for (let step = 0; step < opts.maxSteps; step++) {
    const scene = sceneById(story, sim.sceneId);
    if (!scene) {
      return { ended: false, steps: step, crash: { sceneId: sim.sceneId, message: "scene does not exist", path: [...path], runIndex } };
    }
    if (scene.isEnding) {
      cov.current = recordRun(cov.current);
      return { ended: true, endingSceneId: sim.sceneId, steps: step };
    }

    let decisions: Decision[];
    try {
      decisions = availableDecisions(story, sim, episode);
    } catch (err) {
      return {
        ended: false,
        steps: step,
        crash: { sceneId: sim.sceneId, message: err instanceof Error ? err.message : String(err), path: [...path], runIndex },
      };
    }

    if (!decisions.length) {
      return {
        ended: false,
        steps: step,
        stuck: { sceneId: sim.sceneId, sceneTitle: scene.title, path: [...path], runIndex },
      };
    }

    // Offer every pickable choice presented at this moment. A ride is
    // presented through its source choice (the won/lost twins share one
    // offer); a QTE's lapse twin is the same choice deciding-by-not-deciding,
    // so it is not a second offer.
    const offeredNow = new Set<string>();
    for (const d of decisions) {
      if (d.kind === "choice") offeredNow.add(`${d.sceneId}:${d.choiceId}`);
      else if (d.kind === "minigame" && d.game === "ride") offeredNow.add(`${d.sceneId}:${d.sourceId}`);
    }
    for (const offeredKey of offeredNow) {
      if (!prevOffered.has(offeredKey)) cov.current = recordVisit(cov.current, "offer", offeredKey);
    }
    prevOffered = offeredNow;

    // Deliberately let some quick-time windows close: the hesitation branch is
    // real content, and it is the branch a human tester almost never plays on
    // purpose. Otherwise ignore the timeout twins so the bot mostly ACTS.
    const wantTimeout = rand() < opts.qteTimeout;
    const pool = wantTimeout ? decisions : decisions.filter((d) => d.kind !== "qte-timeout");
    const choice = weightedPick(pool.length ? pool : decisions, taken, rand, opts.explore);

    const key = decisionKey(choice);
    taken.set(key, (taken.get(key) ?? 0) + 1);
    path.push(`${choice.sceneId} → ${choice.kind}:${choice.label}`);

    try {
      const effect = applyDecision(story, sim, choice);
      // The decision surface is the single source of truth for coverage: the
      // pick a choice or marker earns is recorded here exactly once. (It used
      // to be tallied a second time from the decision's coverage bucket, which
      // double-counted every taken branch and would have corrupted the pick
      // rates alongside these offers.)
      effect.coverage.forEach((c) => {
        cov.current = recordVisit(cov.current, c.kind, c.id);
      });
      // A decision that changes nothing and moves nowhere would spin forever;
      // count it, and if the scene offers only such decisions the loop guard
      // below catches it.
      sim = effect.sim;
    } catch (err) {
      return {
        ended: false,
        steps: step,
        crash: { sceneId: sim.sceneId, message: err instanceof Error ? err.message : String(err), path: [...path], runIndex },
      };
    }
  }

  return { ended: false, steps: opts.maxSteps, looped: true };
}

/* ------------------------------------------------------------------ */
/*  Reporting                                                          */
/* ------------------------------------------------------------------ */

const pct = (done: number, total: number) => (total <= 0 ? 100 : Math.round((Math.min(done, total) / total) * 100));

function bar(done: number, total: number, width = 24): string {
  const filled = Math.round((pct(done, total) / 100) * width);
  return `${"█".repeat(filled)}${"░".repeat(Math.max(0, width - filled))}`;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  const story = opts.storyId ? STORIES.find((s) => s.id === opts.storyId) : STORIES[0];
  if (!story) {
    console.error(`playthrough bot: no story with id "${opts.storyId}".`);
    console.error(`Available: ${STORIES.map((s) => s.id).join(", ")}`);
    process.exit(1);
  }

  // Pin BOTH streams: the bot's exploration dice and the game's own gameplay
  // draws, so a reported failure replays byte for byte.
  const rand = mulberry32(hashSeed(opts.seed));
  setGameSeed(opts.seed);

  // Warm-start the weighting from a real coverage export, when one is given:
  // the bot then heads for the branches the human tester has been avoiding.
  const taken = new Map<string, number>();
  let cov: PlaytestCoverage = emptyCoverage(story.id);
  if (opts.coveragePath) {
    try {
      const parsed = JSON.parse(readFileSync(opts.coveragePath, "utf8")) as PlaytestCoverage;
      Object.entries(parsed.choices ?? {}).forEach(([k, n]) => taken.set(k, n));
      Object.entries(parsed.markers ?? {}).forEach(([k, n]) => taken.set(k, (taken.get(k) ?? 0) + n));
      cov = { ...cov, ...parsed, storyId: story.id };
      console.log(`  warm-started from ${opts.coveragePath} (${Object.keys(parsed.choices ?? {}).length} choices already taken)\n`);
    } catch (err) {
      console.warn(`  could not read --coverage ${opts.coveragePath}: ${err instanceof Error ? err.message : err}\n`);
    }
  }

  const episodes = isEpisodic(story) ? seasonEpisodes(story) : [];
  console.log(`▶ Automated playthrough bot`);
  console.log(`  story    ${story.title} (${story.id})`);
  console.log(`  runs     ${opts.runs}   max steps ${opts.maxSteps}   seed "${opts.seed}"`);
  console.log(`  explore  ${opts.explore}   qte-timeout ${opts.qteTimeout}`);
  if (episodes.length) console.log(`  episodic — ${episodes.length} episode(s), run round-robin`);
  console.log("");

  const covBox = { current: cov };
  const deadEnds = new Map<string, DeadEnd>();
  const crashes: Crash[] = [];
  const endings = new Map<string, number>();
  let completed = 0;
  let looped = 0;
  let totalSteps = 0;

  const t0 = Date.now();
  for (let i = 0; i < opts.runs; i++) {
    const episode = episodes.length ? episodes[i % episodes.length] : undefined;
    const res = playOnce(story, opts, rand, taken, covBox, i, episode);
    totalSteps += res.steps;
    if (res.ended && res.endingSceneId) {
      completed++;
      endings.set(res.endingSceneId, (endings.get(res.endingSceneId) ?? 0) + 1);
    }
    if (res.looped) looped++;
    if (res.stuck && !deadEnds.has(res.stuck.sceneId)) deadEnds.set(res.stuck.sceneId, res.stuck);
    if (res.crash) crashes.push(res.crash);
    if (opts.verbose) {
      const outcome = res.ended ? `ending ${res.endingSceneId}` : res.stuck ? `DEAD END ${res.stuck.sceneId}` : res.crash ? `CRASH` : "loop budget";
      console.log(`  run ${String(i + 1).padStart(4)} · ${String(res.steps).padStart(4)} steps · ${outcome}`);
    }
  }
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  /* ---- coverage --------------------------------------------------- */
  const report = coverageReport(story, covBox.current);
  console.log(`── coverage after ${opts.runs} runs (${elapsed}s) ──`);
  console.log(`  scenes   ${bar(report.sceneVisited, report.sceneTotal)}  ${report.sceneVisited}/${report.sceneTotal}  ${pct(report.sceneVisited, report.sceneTotal)}%`);
  console.log(`  choices  ${bar(report.choiceTaken, report.choiceTotal)}  ${report.choiceTaken}/${report.choiceTotal}  ${pct(report.choiceTaken, report.choiceTotal)}%`);
  console.log(`  endings  ${bar(report.endingSeen, report.endingTotal)}  ${report.endingSeen}/${report.endingTotal}  ${pct(report.endingSeen, report.endingTotal)}%`);
  if (report.markerTotal) {
    console.log(`  markers  ${bar(report.markerFired, report.markerTotal)}  ${report.markerFired}/${report.markerTotal}  ${pct(report.markerFired, report.markerTotal)}%`);
  }
  console.log(`  runs completed ${completed}/${opts.runs} · avg ${Math.round(totalSteps / opts.runs)} steps` + (looped ? ` · ${looped} hit the step budget` : ""));
  console.log("");

  /* ---- endings ---------------------------------------------------- */
  if (endings.size) {
    console.log(`── endings reached ──`);
    [...endings.entries()]
      .sort((a, b) => b[1] - a[1])
      .forEach(([id, n]) => {
        const sc = sceneById(story, id);
        console.log(`  ${String(n).padStart(4)}×  ${sc?.title ?? id}${sc?.ending?.tier ? ` [${sc.ending.tier}]` : ""}`);
      });
    console.log("");
  }

  /* ---- problems --------------------------------------------------- */
  let problems = 0;

  if (crashes.length) {
    problems += crashes.length;
    console.log(`── ✖ ${crashes.length} crash(es) ──`);
    crashes.slice(0, 10).forEach((c) => {
      console.log(`  ${c.sceneId}: ${c.message}`);
      c.path.slice(-4).forEach((p) => console.log(`      ${p}`));
    });
    console.log("");
  }

  if (deadEnds.size) {
    problems += deadEnds.size;
    console.log(`── ✖ ${deadEnds.size} dead end(s) — a non-ending scene with nothing left to do ──`);
    [...deadEnds.values()].forEach((d) => {
      console.log(`  ${d.sceneTitle} (${d.sceneId})`);
      d.path.slice(-3).forEach((p) => console.log(`      … ${p}`));
      if (opts.links) console.log(`      repro: ${buildDeepLink({ sceneId: d.sceneId, seed: opts.seed })}`);
    });
    console.log("");
  }

  if (report.missedEndings.length) {
    console.log(`── ⚠ ${report.missedEndings.length} ending(s) no run reached ──`);
    report.missedEndings.forEach((g) => {
      console.log(`  ${g.text} (${g.sceneId})`);
      if (opts.links) console.log(`      open it: ${buildDeepLink({ sceneId: g.sceneId! })}`);
    });
    console.log("");
  }

  if (report.missedScenes.length) {
    console.log(`── ⚠ ${report.missedScenes.length} scene(s) no run reached ──`);
    report.missedScenes.slice(0, 25).forEach((g) => console.log(`  ${g.text} (${g.sceneId})`));
    if (report.missedScenes.length > 25) console.log(`  … and ${report.missedScenes.length - 25} more`);
    console.log("");
  }

  if (report.missedChoices.length) {
    console.log(`── ⚠ ${report.missedChoices.length} choice(s) no run took ──`);
    report.missedChoices.slice(0, 25).forEach((g) => console.log(`  ${g.sceneTitle} — “${g.text}”`));
    if (report.missedChoices.length > 25) console.log(`  … and ${report.missedChoices.length - 25} more`);
    console.log("");
  }

  // Pick rates: a choice offered often but never taken is wasted writing, or
  // a wording that doesn't match its consequence. Only the worst offenders
  // are worth printing — the full tally rides along in --out.
  const unloved = report.pickRates.filter((p) => p.offers >= 3 && p.rate <= 25);
  if (unloved.length) {
    console.log(`── 🎯 ${unloved.length} choice(s) offered but rarely taken (≤25%) ──`);
    unloved.slice(0, 15).forEach((p) =>
      console.log(`  ${p.rate}%  ${p.picks}/${p.offers}  ${p.sceneTitle ?? p.sceneId} — “${p.text}”`)
    );
    if (unloved.length > 15) console.log(`  … and ${unloved.length - 15} more`);
    console.log("");
  }

  if (opts.outPath) {
    try {
      writeFileSync(opts.outPath, JSON.stringify(covBox.current, null, 2));
      console.log(`coverage written to ${opts.outPath}`);
      console.log(`(import it in Studio ▶ Test, or feed it back with --coverage to keep exploring)\n`);
    } catch (err) {
      console.warn(`could not write --out ${opts.outPath}: ${err instanceof Error ? err.message : err}`);
    }
  }

  // Only genuine breakage fails the process. Unreached scenes and choices are
  // reported as advice: a story with a rare branch is not a broken story, and
  // a bot that fails CI over exploration luck is a bot people switch off.
  if (problems) {
    console.log(`✖ ${problems} problem(s) found.`);
    process.exit(1);
  }
  console.log(`✔ no crashes and no dead ends in ${opts.runs} runs.`);
  process.exit(0);
}

main();
