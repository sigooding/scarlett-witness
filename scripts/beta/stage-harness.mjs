#!/usr/bin/env node
/**
 * Beta-test harness — THE WALKING STAGE (🚶 STAGE nodes).
 *
 * Same esbuild trick as scripts/engine-tests.mjs: bundles the TypeScript
 * probe (stage-probe.ts — imports the real engine from src/ and the real
 * <GamePlayer> mounted in happy-dom) and runs it under plain Node.
 *
 * The probe covers:
 *   1. Walking engine math (movement, clamping, routing, camera, edges).
 *   2. A real DOM play-through of a synthetic stage ↔ standard story:
 *      keyboard + click-to-walk, verb coin, conversations, walk-off-screen
 *      edge exits, and the stage→graphic-novel hand-off.
 *   3. NON-INTERFERENCE: classic graphic-novel scenes keep their prose
 *      panel, hotspots, keyboard shortcuts and cursor — no stage state
 *      (verb cursor, captions, markers, walker) ever leaks across.
 *   4. A real shipped story (Demo Lab: Press the Lie) stage round-trip.
 *
 * Run: node scripts/beta/stage-harness.mjs
 */

import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(here, "stage-probe.ts");
// The bundle lives INSIDE the repo (like dom-smoke's) so the external
// happy-dom import resolves from the project's node_modules.
const root = path.resolve(here, "..", "..");
const dir = path.join(root, "scripts", ".tmp-stage-beta");
const outfile = path.join(dir, "stage.bundle.mjs");

try {
  mkdirSync(dir, { recursive: true });
  const { build } = await import("esbuild");
  await build({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node18",
    outfile,
    logLevel: "warning",
    absWorkingDir: root,
    // Same shape as scripts/dom-smoke.mjs: TSX needs the automatic JSX
    // runtime, asset imports are stubbed, happy-dom stays external (it
    // pulls in `ws`, which cannot be bundled for ESM), and the vite
    // virtual modules (pulled in once the probe mounts the Studio) are
    // stubbed empty.
    jsx: "automatic",
    loader: { ".ts": "ts", ".tsx": "tsx", ".css": "empty", ".mp3": "empty", ".png": "dataurl", ".jpg": "dataurl" },
    define: { __SCARLET_REEL_BUILD_ID__: JSON.stringify("stage-beta") },
    external: ["happy-dom"],
    plugins: [
      {
        name: "virtuals",
        setup(b) {
          b.onResolve({ filter: /^virtual:builtin-(images|audio)$/ }, (a) => ({ path: a.path, namespace: "v" }));
          b.onLoad({ filter: /.*/, namespace: "v" }, () => ({ contents: "export default [];" }));
        },
      },
    ],
  });

  // Run as a child process with a hard timeout: happy-dom's rAF loop can
  // keep the event loop alive after the probe finishes, so the parent
  // enforces the exit (exactly like scripts/dom-smoke.mjs).
  const { spawnSync } = await import("node:child_process");
  const res = spawnSync(process.execPath, [outfile], { stdio: "inherit", cwd: root, timeout: 240000 });
  process.exitCode = res.status ?? 1;
} catch (err) {
  console.error("stage beta harness failed to run:");
  console.error(err);
  process.exitCode = 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
