#!/usr/bin/env node
/**
 * Beta-test harness — NOBODY'S WITNESS: TRUE ROMANCE CUT
 *
 * Bundles a small TypeScript probe with esbuild (same trick as engine-tests)
 * and runs it under plain Node. The probe:
 *   1. Runs validateStory() over the True cut and prints every issue.
 *   2. Full-graph walk: from the start scene, enumerates every choice path,
 *      applies consequences, honours gating/notes, and records reachability.
 *   3. Flag accounting: flags with no producer / no consumer.
 *   4. Item accounting: items granted vs used.
 *   5. Beat order sanity: conditional beats gated on flags set only by
 *      hotspots inside the SAME scene — check the hotspot is clickable
 *      before the beat's point in the play order (beats play linearly).
 *   6. Timed-choice / QTE sweep (should be none here).
 */
import { buildSync } from "esbuild";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(here, "beta-probe.ts");
const dir = mkdtempSync(path.join(tmpdir(), "scarlet-beta-"));
const outfile = path.join(dir, "beta.bundle.mjs");

try {
  buildSync({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node18",
    outfile,
    logLevel: "warning",
    absWorkingDir: path.resolve(here, "..", ".."),
  });
  await import(pathToFileURL(outfile).href);
} catch (err) {
  console.error("beta harness failed to run:");
  console.error(err);
  process.exitCode = 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
