// Builds preview-depth/src/shots.json: every film picture whose pictureLook names a depth map, with the
// cinematic the film really plays (so the preview shows the engine's move, not an approximation), the
// picture's folder for grouping, and the 22 October review flags where one was raised for it.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const edits = JSON.parse(readFileSync(join(root, "src/film/studio-edits.json"), "utf8"));
const layers = JSON.parse(readFileSync(join(root, "docs/film-depth-layers.json"), "utf8"));
const people = layers.peopleInShot ?? {};

// "| [01-backstreet](01-backstreet.jpg) | 1 | cut-out 1 runs ... |"
const flags = new Map();
try {
  const readme = readFileSync(join(root, "public/film/review/2026-10-22-auto-cutouts/README.md"), "utf8");
  for (const line of readme.split("\n")) {
    const m = line.match(/^\|\s*\[([^\]]+)\]\([^)]*\)\s*\|\s*([^|]*?)\s*\|\s*(.*?)\s*\|\s*$/);
    if (m) flags.set(m[1], { cutouts: m[2], flags: m[3] });
  }
} catch { /* no review sheet: no flags */ }

// name -> the one picture file the film plays (public/film/img/<scene>/<name>.jpg, deepest match first)
const dirs = readdirSync(join(root, "public/film/img"), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
const picture = (name) => {
  for (const scene of dirs) {
    const hit = join(root, "public/film/img", scene, `${name}.jpg`);
    try { readFileSync(hit, { length: 1 }); return `/film/img/${scene}/${name}.jpg`; } catch { /* next */ }
  }
  return null;
};

const shots = [];
for (const [name, entry] of Object.entries(edits.pictureLook ?? {})) {
  const c = entry.cinematic;
  if (!c?.depthMap) continue;
  const pic = picture(name);
  if (!pic) continue;
  const scene = pic.split("/")[3];
  shots.push({
    name,
    scene,
    picture: pic,
    // only the fields the depth camera reads, plus the grade the shot is seen through
    cinematic: {
      mode: c.mode,
      depthMap: c.depthMap,
      depthPlate: c.depthPlate,
      depthCutouts: c.depthCutouts,
      depthMotion: c.depthMotion ?? "truck",
      depthAmount: c.depthAmount ?? 0.4,
      depthSeconds: c.depthSeconds ?? 14,
      depthFocus: c.depthFocus,
      depthDirection: c.depthDirection,
      focalPoint: c.focalPoint,
      colorGrade: c.colorGrade,
    },
    people: people[name] ?? null,
    cutoutCount: (c.depthCutouts ?? []).length,
    review: flags.get(name) ?? null,
  });
}
// Experiments (experiments.json): plain depth maps on shots with people, for comparison only — never wired into the
// film. They come first, and the app filters them separately.
let experiments = [];
try {
  experiments = JSON.parse(readFileSync(join(import.meta.dirname, "experiments.json"), "utf8")).map((e) => ({ ...e, experiment: e.experiment ?? true }));
} catch { /* none */ }

shots.sort((a, b) => a.scene.localeCompare(b.scene, undefined, { numeric: true }) || a.name.localeCompare(b.name));
const all = [...experiments, ...shots];
writeFileSync(join(import.meta.dirname, "src/shots.json"), JSON.stringify(all, null, 1) + "\n");

// --list: one tab-separated line per shot with the URL that opens it, for a script or an agent that has no mouse.
//   node shots.mjs --list [cuts|people|flagged|experiments|all]   (default: cuts)
if (process.argv.includes("--list")) {
  const want = process.argv[process.argv.indexOf("--list") + 1];
  const pick = {
    cuts: (s) => s.cutoutCount > 0,
    people: (s) => !!s.people,
    flagged: (s) => !!s.review?.flags,
    experiments: (s) => !!s.experiment,
    all: () => true,
  }[want] ?? ((s) => s.cutoutCount > 0);
  const base = process.env.DEPTH_PREVIEW_URL || "http://localhost:5179";
  for (const s of all.filter(pick)) {
    console.log([s.name, s.scene, s.cutoutCount, s.people ?? "-", s.review?.flags ?? "-", `${base}/?shot=${encodeURIComponent(s.name)}&play=1`].join("\t"));
  }
}
console.log(`${shots.length} film depth shots (${shots.filter((s) => s.cutoutCount).length} with cut-outs, ${shots.filter((s) => s.review?.flags).length} flagged on 22 Oct) + ${experiments.length} experiment(s)`);
