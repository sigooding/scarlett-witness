#!/usr/bin/env node
/**
 * Beta-test harness — SCOOBY-DOO AND THE RAVENSWOOD PHANTOM.
 *
 * Bundles scooby-probe.ts with esbuild (same trick as engine-tests) and runs
 * it under plain Node. The probe walks three full runs through the REAL
 * gating/consequence machinery from src/logic.ts:
 *   1. GOLD RUN    — every clue found, both lies pressed, the interrogation
 *                    cracked (trust math checked against interrogationOutcome),
 *                    all three corkboard pins, trap sprung → gold ending.
 *   2. COLD RUN    — blunt approach, two wrong evidence presents, QTE
 *                    timeout in the corridor → the "caught" game-over.
 *   3. HEAT CHECK  — Suspicion pushed to heatLimit routes to the bust scene.
 * Plus: validateStory, sprite-sheet sanity for every sheet in the case, and
 * an item/flag producer check.
 */
import { buildSync } from "esbuild";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(here, "scooby-probe.ts");
const dir = mkdtempSync(path.join(tmpdir(), "scarlet-scooby-"));
const outfile = path.join(dir, "scooby.bundle.mjs");

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
  console.error("scooby harness failed to run:");
  console.error(err);
  process.exitCode = 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
