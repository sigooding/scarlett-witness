#!/usr/bin/env node
/**
 * Beta-test harness — INSPECTOR GADGET: THE CLOCKWORK CAPER
 *
 * Same esbuild trick as scripts/engine-tests.mjs: bundles the TypeScript
 * probe (gadget-probe.ts — imports the real engine from src/) and runs it
 * under plain Node. The probe validates the story, walks the gold path,
 * and asserts the new 🔭 OUT-OF-REACH (Hotspot.remote) behaviour contract.
 *
 * Run: node scripts/beta/gadget-harness.mjs
 */
import { buildSync } from "esbuild";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(here, "gadget-probe.ts");
const dir = mkdtempSync(path.join(tmpdir(), "scarlet-gadget-beta-"));
const outfile = path.join(dir, "gadget.bundle.mjs");

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
  console.error("gadget beta harness failed to run:");
  console.error(err);
  process.exitCode = 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
