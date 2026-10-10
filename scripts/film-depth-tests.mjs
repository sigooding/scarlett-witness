#!/usr/bin/env node
/**
 * Film depth-map wiring runner (npm run test:film-depth).
 *
 * Bundles scripts/film-depth.entry.ts (it imports the real engine's DepthParallax) with esbuild
 * and runs it under plain Node — same shape as engine-tests.mjs, no test framework, no new deps.
 */
import { buildSync } from "esbuild";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(here, "film-depth.entry.ts");
const dir = mkdtempSync(path.join(tmpdir(), "scarlet-film-depth-"));
const outfile = path.join(dir, "film-depth.bundle.mjs");

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
  console.error("film depth tests failed to run:");
  console.error(err);
  process.exitCode = process.exitCode ?? 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
