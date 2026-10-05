#!/usr/bin/env node
/**
 * Engine test runner (npm test).
 *
 * Bundles the TypeScript test body (./studio-ship-tests.entry.ts — it imports the
 * real engine from src/) with esbuild, which ships with Vite, and runs it
 * under plain Node. No test framework, no new dependencies: if `npm ci`
 * succeeded, `npm test` works.
 */
import { buildSync } from "esbuild";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(here, "studio-ship-tests.entry.ts");
const dir = mkdtempSync(path.join(tmpdir(), "scarlet-studio-ship-tests-"));
const outfile = path.join(dir, "studio-ship-tests.bundle.mjs");

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
  });
  await import(pathToFileURL(outfile).href);
} catch (err) {
  console.error("studio ship tests failed to run:");
  console.error(err);
  process.exitCode = process.exitCode ?? 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
