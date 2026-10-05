#!/usr/bin/env node
/**
 * Beta-test harness — DYNAMIC VISUALS OVERHAUL
 *
 * Same esbuild trick as scripts/engine-tests.mjs: bundles the TypeScript
 * probe (visuals-probe.ts — imports the real <Particles>, <CinematicControls>
 * and <GamePlayer> from src/) and runs it under plain Node in happy-dom.
 *
 * The probe covers:
 *   1. glowColorWithAlpha (the "white1A" crash class) + the CSS contract
 *      (iris-out reveal, 130px storm bolt, HUD corner brackets).
 *   2. All 12 particle kinds through the REAL engine: structural mount,
 *      storm bolt firing + size + forked clip-path, reduced-motion, and the
 *      rain-on-lens on/off semantics (explicit false must win).
 *   3. Studio's CinematicControls live preview renders the real particle
 *      engine and honours rainOnLens (the ✨ Dynamic Visuals promise).
 *   4. Scene transitions in the real player: the plate holds on the old
 *      scene until the wipe is fully closed (no mid-cover black flash),
 *      "cut" flips instantly, and slide/zoom carry the destination's art.
 *   4b. The overlay art lifecycle: the art stack unmounts once the reveal
 *      settles (no zombie layers at opacity 0), and under reduced motion the
 *      art path never mounts — a slide scene cuts, silently and instantly.
 *   5. Jack Morrow — Midnight Reel: mounts, skips credits, reaches the
 *      dust warehouse stage.
 *   6. The chance gamble through the real player (odds chip, hit/miss
 *      routes, seeded dice) + the Second Reel's mount smoke.
 *   7. Jack Morrow — The Second Reel showcase smoke.
 *   8. Jack Morrow — The Third Reel: the full-kit showcase (slide entry
 *      with real destination art, stage markers, authored transition-sound
 *      picks).
 *
 * Run: node scripts/beta/visuals-harness.mjs
 */
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(here, "visuals-probe.ts");
const root = path.resolve(here, "..", "..");
const dir = path.join(root, "scripts", ".tmp-visuals-beta");
const outfile = path.join(dir, "visuals.bundle.mjs");

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
    jsx: "automatic",
    loader: { ".ts": "ts", ".tsx": "tsx", ".css": "empty", ".mp3": "empty", ".png": "dataurl", ".jpg": "dataurl" },
    define: { __SCARLET_REEL_BUILD_ID__: JSON.stringify("visuals-beta") },
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
  // keep the event loop alive after the probe finishes.
  const { spawnSync } = await import("node:child_process");
  const res = spawnSync(process.execPath, [outfile], { stdio: "inherit", cwd: root, timeout: 300000 });
  process.exitCode = res.status ?? 1;
} catch (err) {
  console.error("visuals beta harness failed to run:");
  console.error(err);
  process.exitCode = 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
