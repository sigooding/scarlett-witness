#!/usr/bin/env node
/**
 * Beta-test harness — THE ARCADE CABINET (🕹 arcadeGame hotspots).
 *
 * Same esbuild trick as scripts/engine-tests.mjs: bundles the TypeScript
 * probe (arcade-probe.ts — imports the real engine from src/ and the real
 * <ArcadeGame>/<GamePlayer> mounted in happy-dom) and runs it under plain Node.
 *
 * The probe covers the Hollow Signal cabinet end to end:
 *   1. Config contract — screenRect sane, art on disk, win flag pays off.
 *   2. The real <ArcadeGame>: canvas mounts behind the cabinet art, the
 *      screen is positioned by the authored percentages, ENTER starts the
 *      attract screen, the loop runs frames without a console error.
 *   3. Engine side — an arcadeGame hotspot surfaces both outcomes as
 *      decisions, winning sets its flag and spends the marker, losing leaves
 *      the cabinet playable (you can always put another quarter in).
 *   4. NON-INTERFERENCE — a story with no cabinet is untouched, and the
 *      cabinet's key handling doesn't leak to the stage walker.
 *   Plus reachability of every stage hotspot, the full use-the-cabinet click
 *   path, the minigame being playable, the art contract, the kitchen/travel-map
 *   gates, and the centred inventory. (See arcade-probe.ts for the exact parts.)
 *
 * Run: node scripts/beta/arcade-harness.mjs
 */

import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(here, "arcade-probe.ts");
// The bundle lives INSIDE the repo (like dom-smoke's) so the external
// happy-dom import resolves from the project's node_modules.
const root = path.resolve(here, "..", "..");
const dir = path.join(root, "scripts", ".tmp-arcade-beta");
const outfile = path.join(dir, "arcade.bundle.mjs");

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
    define: { __SCARLET_REEL_BUILD_ID__: JSON.stringify("arcade-beta") },
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
  console.error("arcade beta harness failed to run:");
  console.error(err);
  process.exitCode = 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
