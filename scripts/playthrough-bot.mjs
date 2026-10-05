#!/usr/bin/env node
/**
 * Automated playthrough bot (npm run bot).
 *
 * Bundles the TypeScript body (./playthrough-bot.entry.ts — it imports the
 * real engine from src/) with esbuild, which ships with Vite, and runs it
 * under plain Node. Same pattern as scripts/engine-tests.mjs: no test
 * framework, no new dependencies.
 *
 *   npm run bot                                  200 runs of the first story
 *   npm run bot -- --story neon-diner --runs 1000
 *   npm run bot -- --seed unlucky --verbose      replay a specific session
 *   npm run bot -- --coverage cov.json --out cov.json
 *                                                weight toward the branches a
 *                                                human tester has been missing,
 *                                                and write the tally back
 *
 * Flags:
 *   --story <id>        which case to play (default: the first in the catalogue)
 *   --runs <n>          how many playthroughs (default 200)
 *   --max-steps <n>     step budget per run before it's called a loop (400)
 *   --seed <string>     pins the session; a failing run replays exactly
 *   --explore <0..1>    how hard to prefer never-taken branches (default 1)
 *   --qte-timeout <p>   chance of deliberately letting a QTE lapse (0.15)
 *   --coverage <path>   warm-start weighting from an exported coverage tally
 *   --out <path>        write the accumulated coverage tally
 *   --links             print a deep link to reproduce each problem
 *   --verbose           one line per run
 */
import { buildSync } from "esbuild";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(here, "playthrough-bot.entry.ts");
const dir = mkdtempSync(path.join(tmpdir(), "scarlet-playthrough-bot-"));
const outfile = path.join(dir, "playthrough-bot.bundle.mjs");

try {
  buildSync({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node18",
    outfile,
    logLevel: "warning",
    absWorkingDir: path.join(here, ".."),
    // The story data imports image/audio URLs through Vite's asset handling;
    // under Node they only need to resolve to a string.
    loader: { ".png": "dataurl", ".jpg": "dataurl", ".mp3": "dataurl" },
  });
  await import(pathToFileURL(outfile).href);
} catch (err) {
  console.error("playthrough bot failed to run:");
  console.error(err);
  process.exitCode = process.exitCode ?? 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
