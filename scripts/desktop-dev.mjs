#!/usr/bin/env node
/**
 * Live story-development loop: Vite dev server + Electron pointed at it.
 *
 *   npm run desktop:dev-live
 *
 * You get the best of both worlds:
 *  - browser-speed iteration (Vite hot reload, no rebuild between edits)
 *  - the desktop file bridge, so ElevenLabs MP3s are saved automatically as
 *    real files to public/voices/<person>/<scene>/ (and uploads to
 *    public/uploads/<storyId>/) with no folder linking
 *
 * It's the exact shell you ship, so it also catches packaging-only quirks
 * (file:// asset paths, window menu, fullscreen) while you still develop.
 *
 * If a Vite dev server is already running on the port, it's reused as-is
 * (just Electron is added). Closing the Electron window stops the Vite this
 * script started; Ctrl-C in the terminal stops everything it owns.
 */
import { spawn } from "node:child_process";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

/** The `electron` npm module exports the path to the electron binary.
 *  Resolved lazily (after the dev server is up) so a missing binary produces
 *  one readable error instead of a stack trace before anything starts. */
function resolveElectronBin() {
  try {
    return require("electron");
  } catch (err) {
    console.error(
      "[desktop-dev] Could not find the Electron binary — run `npm install` in the repo root, then try again.\n" +
        (err instanceof Error ? err.message : String(err))
    );
    return null;
  }
}

const PORT = Number(process.env.SCARLET_DEV_PORT || 5173);
const DEV_URL = `http://localhost:${PORT}`;
const VITE_BIN = path.join(root, "node_modules", "vite", "bin", "vite.js");

const portOpen = (port) =>
  new Promise((resolve) => {
    const req = http.get({ host: "localhost", port, path: "/", timeout: 700 }, (res) => {
      res.resume();
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });

let vite = null;
let electron = null;
let shuttingDown = false;

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of [vite, electron]) {
    if (child && child.exitCode === null) child.kill();
  }
  // Give the kids a moment, then let the script exit with the first failure.
  setTimeout(() => process.exit(typeof code === "number" && code !== 0 ? code : 0), 1500).unref();
}

async function waitForServer() {
  for (let i = 0; i < 240; i += 1) {
    if (await portOpen(PORT)) return true;
    if (vite && vite.exitCode !== null) return false;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

if (await portOpen(PORT)) {
  console.log(`[desktop-dev] Port ${PORT} already serving — assuming that's an existing Vite dev server for this repo; reusing it (no new Vite).`);
} else {
  vite = spawn(process.execPath, [VITE_BIN, "--strictPort"], {
    cwd: root,
    stdio: "inherit",
  });
  vite.on("exit", (code) => {
    console.log(`\n[desktop-dev] Vite exited (code ${code ?? 0}) — closing Electron.`);
    shutdown(code);
  });
}

if (!(await waitForServer())) {
  console.error(`[desktop-dev] No dev server available on port ${PORT} — check the Vite output above.`);
  shutdown(1);
  process.exit(1);
}

console.log(`[desktop-dev] Dev server up at ${DEV_URL} — starting Electron (same shell as the exe).`);
const electronBin = resolveElectronBin();
if (!electronBin) {
  shutdown(1);
  process.exit(1);
}
electron = spawn(electronBin, ["."], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, ELECTRON_START_URL: DEV_URL },
});

electron.on("exit", (code) => {
  // Code 0: the author closed the window — stop the Vite we started too.
  console.log(`\n[desktop-dev] Electron closed (code ${code ?? 0}) — stopping the dev loop.`);
  shutdown(code);
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
