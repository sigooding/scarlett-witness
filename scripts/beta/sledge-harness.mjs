#!/usr/bin/env node
/**
 * Beta-test harness — SLEDGE HAMMER! "The Caliber of a Gentleman".
 *
 * Bundles sledge-probe.ts with esbuild (same trick as engine-tests) and runs
 * it under plain Node. The probe drives four full runs through the REAL
 * gating/consequence machinery from src/logic.ts — gold, silver, hesitation
 * and heat bust — plus the multi-state grille, the extended verb coin, both
 * lies, the interrogation trust branch and the asset/bookkeeping contracts.
 */
import { buildSync } from "esbuild";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(here, "sledge-probe.ts");
const dir = mkdtempSync(path.join(tmpdir(), "scarlet-sledge-"));
const outfile = path.join(dir, "sledge.bundle.mjs");

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
