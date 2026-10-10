/**
 * Film depth-map wiring checks (bundled + run by scripts/film-depth-tests.mjs).
 *
 * The film (Nobody's Witness) asks the engine's depth-map camera for a picture by naming a
 * grayscale `depthMap` in `src/film/studio-edits.json` (pictureLook). A wrong path, a map that is a
 * different size from its picture, or a picture that also gets the 🚂 dolly camera would silently
 * switch the shot back to the still. These checks run the real engine decision (hasDepthParallax)
 * over every entry and assert the files on disk line up, so a bad depth entry fails `npm test`
 * instead of vanishing on screen.
 */
import { readFileSync, existsSync, globSync } from "node:fs";
import { join } from "node:path";
import type { CinematicSettings } from "../src/types";
import { hasDepthParallax } from "../src/game/DepthParallax";

// The runner is invoked from the repository root (npm run test:film-depth), so the cwd is the root.
const ROOT = process.cwd();
let failed = 0;
const check = (label: string, ok: boolean, detail?: unknown) => {
  if (ok) console.log("  ok  " + label);
  else { failed++; console.error("  BAD " + label + (detail === undefined ? "" : `  -> ${String(detail)}`)); }
};

/** Width/height of an image on disk without pulling in a codec. */
function imageSize(path: string): [number, number] | null {
  const b = readFileSync(path);
  if (b.length > 8 && b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const marker = b[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc)
        return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null;
}

const edits = JSON.parse(readFileSync(join(ROOT, "src/film/studio-edits.json"), "utf8"));
const look: Record<string, { cinematic?: CinematicSettings & { depthMap?: string } }> = edits.pictureLook ?? {};

const pictureFor = (name: string): string | null => {
  const hit = globSync(join(ROOT, "public/film/img/*", `${name}.{jpg,png}`));
  return hit.length ? hit[0] : null;
};

const depthEntries = Object.entries(look).filter(([, v]) => v.cinematic?.depthMap);
console.log(`film depth: ${depthEntries.length} pictureLook entries name a depthMap`);
// The shots this pass added: if any of these loses its depth entry the camera quietly falls back to a still.
for (const name of ["228-nine-oclock", "297-the-glass-office", "153-the-rain-has-stopped", "337-engine-off",
  "109-the-fortieth-floor", "160-were-closed", "229-like-a-date", "184-a-gap-in-someones-teeth"])
  check(`${name} is wired for depth`, depthEntries.some(([k]) => k === name));

for (const [name, entry] of depthEntries) {
  const c = entry.cinematic!;
  const pic = pictureFor(name);
  if (!pic) { check(`${name}: source picture exists`, false); continue; }
  const rel = pic.slice(pic.indexOf("public/") + "public".length); // "/film/img/<scene>/<name>.jpg"
  const mapPath = join(ROOT, "public", c.depthMap!.replace(/^\//, ""));
  check(`${name}: depth map file exists`, existsSync(mapPath), c.depthMap);
  const ps = imageSize(pic), ms = imageSize(mapPath);
  // The engine samples the map across the whole picture, so its aspect must equal the picture's, or the warp
  // slides against the picture as the camera moves. Depth-only maps are additionally kept at the picture's exact
  // size (the house style); the character-layer shots deliberately pair a 960x540 map with full-size plates and
  // cut-outs, so for those we only require the aspect to line up.
  const depthOnly = !c.depthPlate && !(c.depthCutouts ?? []).length;
  check(`${name}: map aspect matches picture`, !!ps && !!ms && Math.abs(ps[0] / ps[1] - ms[0] / ms[1]) < 1e-3,
    `picture ${ps} map ${ms}`);
  if (depthOnly)
    check(`${name}: depth-only map is the picture's exact size`, !!ps && !!ms && ps[0] === ms[0] && ps[1] === ms[1],
      `picture ${ps} map ${ms}`);
  check(`${name}: not the dolly camera`, c.mode !== "dolly", c.mode);
  check(`${name}: engine would use the depth layer`, hasDepthParallax(c, rel), JSON.stringify({ mode: c.mode }));
}

console.log(failed ? `\nfilm depth: ${failed} FAILURES` : "\nfilm depth: all checks passed");
if (failed) process.exitCode = 1;
