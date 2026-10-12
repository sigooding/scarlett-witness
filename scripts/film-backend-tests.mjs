#!/usr/bin/env node
/**
 * Film ⇄ backend reproducibility runner (npm run test:film-backend).
 *
 * Bundles scripts/film-backend.entry.ts (it imports the real engine's DepthParallax) with esbuild
 * and runs it under plain Node — same shape as engine-tests.mjs, no test framework, no new deps.
 */
import { buildSync } from "esbuild";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(here, "film-backend.entry.ts");
const dir = mkdtempSync(path.join(tmpdir(), "scarlet-film-backend-"));
const outfile = path.join(dir, "film-backend.bundle.mjs");

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
  console.error("film backend tests failed to run:");
  console.error(err);
  process.exitCode = process.exitCode ?? 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
