#!/usr/bin/env node
/**
 * Sprite-atlas and portable-media regression runner.
 *
 * Bundles the TypeScript test body (./sprite-atlas-tests.entry.ts — it imports the
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
const entry = path.join(here, "sprite-atlas-tests.entry.ts");
const dir = mkdtempSync(path.join(tmpdir(), "scarlet-sprite-atlas-tests-"));
const outfile = path.join(dir, "sprite-atlas-tests.bundle.mjs");

try {
  buildSync({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node18",
    outfile,
    logLevel: "warning",
    define: { "import.meta.env": JSON.stringify({ BASE_URL: "/case-library/" }) },
    absWorkingDir: path.join(here, ".."),
  });
  process.env.SCARLET_TEST_ROOT = path.join(here, "..");
  await import(pathToFileURL(outfile).href);
} catch (err) {
  console.error("Sprite-atlas tests failed to run:");
  console.error(err);
  process.exitCode = process.exitCode ?? 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
