#!/usr/bin/env node
/* ------------------------------------------------------------------ *
 *  zone-map.mjs — render every authored hotspot zone onto its scene   *
 *  plate, so a headless content pass can be eyeballed without         *
 *  opening Studio.                                                    *
 *                                                                     *
 *    node scripts/beta/zone-map.mjs [--story scooby-ravenswood]       *
 *                                    [--out zone-maps]                *
 *                                     [--only <sceneId>]              *
 *                                                                     *
 *  For every scene with hotspots (or a walkable stage), writes        *
 *  <out>/<storyId>/<sceneId>.jpg: the background at 1280×720 with     *
 *  each zone drawn — SOLID RED = open hotspot, AMBER DASHED = gated,  *
 *  "(hold)" marks an examine zone — plus the stage floor band (blue)  *
 *  and obstacles (orange). Requires ImageMagick (`convert`).          *
 * ------------------------------------------------------------------ */
import { buildSync } from "esbuild";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "..");

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const storyId = arg("story", "scooby-ravenswood");
const outDir = arg("out", path.join(ROOT, "zone-maps"));
const only = arg("only", "");

if (!existsSync(path.join(ROOT, "public"))) {
  console.error("run me from the repo root (public/ not found)");
  process.exit(1);
}
if (spawnSync("convert", ["-version"], { stdio: "ignore" }).status !== 0) {
  console.error("ImageMagick `convert` is required (sudo apt install imagemagick)");
  process.exit(1);
}
/* IM6 can't find "helvetica" on a bare server — use a real TTF when present. */
const FONT_CANDIDATES = [
  "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
  "/usr/share/fonts/dejavu/DejaVuSans.ttf",
  "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
];
const FONT = FONT_CANDIDATES.find((f) => existsSync(f));
const fontArgs = FONT ? ["-font", FONT] : [];

/* ---- bundle a tiny probe that dumps the story's zone geometry ---- */
const dir = mkdtempSync(path.join(tmpdir(), "zone-map-"));
try {
  const entry = path.join(dir, "probe.ts");
  const bundle = path.join(dir, "probe.mjs");
  writeFileSync(
    entry,
    `import { STORIES } from ${JSON.stringify(path.join(ROOT, "src/data/stories"))};\n` +
      `const s = STORIES.find((x) => x.id === ${JSON.stringify(storyId)});\n` +
      `if (!s) { console.error("no story " + ${JSON.stringify(storyId)}); process.exit(2); }\n` +
      `console.log(JSON.stringify({ id: s.id, scenes: s.scenes.map((sc) => ({\n` +
      `  id: sc.id, title: sc.title, background: sc.background, nodeType: sc.nodeType ?? "standard",\n` +
      `  stage: sc.stage ? { floor: sc.stage.floor ?? null, spawn: sc.stage.spawn ?? null,\n` +
      `    obstacles: sc.stage.obstacles ?? [] } : null,\n` +
      `  hotspots: (sc.hotspots ?? []).map((h) => ({ id: h.id, label: h.label, bounds: h.bounds,\n` +
      `    cursor: h.cursor, gated: !!h.gating, examine: !!h.examine, routes: !!h.action.targetSceneId })),\n` +
      `})) }));\n`
  );
  buildSync({ entryPoints: [entry], bundle: true, platform: "node", format: "esm", target: "node18", outfile: bundle, logLevel: "warning", absWorkingDir: ROOT });
  const run = spawnSync(process.execPath, [bundle], { encoding: "utf8" });
  if (run.status !== 0) { console.error(run.stderr || "probe failed"); process.exit(1); }
  const story = JSON.parse(run.stdout);

  const scenes = story.scenes.filter((sc) => only ? sc.id === only : (sc.hotspots?.length || sc.stage));
  if (!scenes.length) { console.error("no scenes with zones"); process.exit(1); }
  const storyOut = path.join(outDir, story.id);
  mkdirSync(storyOut, { recursive: true });

  const W = 1280, H = 720;
  let written = 0;
  for (const sc of scenes) {
    const bg = path.join(ROOT, "public", sc.background.replace(/^\//, ""));
    if (!existsSync(bg)) { console.error(`  ! ${sc.id}: missing plate ${sc.background}`); continue; }
    const args = [bg, "-resize", `${W}x${H}^`, "-gravity", "center", "-extent", `${W}x${H}`, "-gravity", "northwest", ...fontArgs];
    // title bar
    args.push("-fill", "#000000c0", "-draw", `rectangle 0,0 ${W},30`,
      "-fill", "yellow", "-pointsize", "18", "-annotate", `+8+22`,
      `${sc.title} — ${sc.id}${sc.nodeType !== "standard" ? ` [${sc.nodeType}]` : ""} · ${sc.hotspots.length} zone(s)`);
    // stage floor band + obstacles + spawn
    if (sc.stage) {
      const f = sc.stage.floor ?? { top: 62, bottom: 94 };
      for (const y of [f.top, f.bottom])
        args.push("-stroke", "#38bdf8", "-strokewidth", "2", "-fill", "none", "-draw", `line 0,${Math.round(y * H / 100)} ${W},${Math.round(y * H / 100)}`);
      for (const o of sc.stage.obstacles ?? [])
        args.push("-stroke", "#f97316", "-strokewidth", "3", "-fill", "none",
          "-draw", `rectangle ${Math.round(o.x * W / 100)},${Math.round(o.y * H / 100)} ${Math.round((o.x + o.w) * W / 100)},${Math.round((o.y + o.h) * H / 100)}`,
          "-fill", "#f97316", "-pointsize", "14", "-annotate", `+${Math.round(o.x * W / 100) + 4}+${Math.round(o.y * H / 100) + 16}`, "obstacle");
      if (sc.stage.spawn)
        args.push("-fill", "#38bdf8", "-pointsize", "16", "-annotate",
          `+${Math.round(sc.stage.spawn.x * W / 100) + 4}+${Math.round(sc.stage.spawn.y * H / 100) - 6}`, "▲ spawn");
    }
    // hotspot zones
    for (const h of sc.hotspots) {
      const x1 = Math.round(h.bounds.x * W / 100), y1 = Math.round(h.bounds.y * H / 100);
      const x2 = Math.round((h.bounds.x + h.bounds.w) * W / 100), y2 = Math.round((h.bounds.y + h.bounds.h) * H / 100);
      // NB: dasharray is an MVG primitive setting, not a convert option — it
      // goes inside the -draw string (IM6 rejects a -stroke-dasharray flag).
      const mvg = `${h.gated ? "stroke-dasharray 8 6 " : ""}rectangle ${x1},${y1} ${x2},${y2}`;
      args.push("-stroke", h.gated ? "#fbbf24" : "#ef4444", "-strokewidth", "3",
        "-fill", "none", "-draw", mvg);
      const label = `${h.examine ? "HOLD·" : ""}${h.cursor}${h.routes ? "→" : ""} ${h.label}`.slice(0, 52);
      args.push("-fill", "white", "-pointsize", "15", "-annotate", `+${Math.min(x1 + 4, W - 400)}+${Math.max(y1 + 18, 42)}`, label);
    }
    const out = path.join(storyOut, `${sc.id}.jpg`);
    const r = spawnSync("convert", args.concat(["-quality", "82", out]), { encoding: "utf8" });
    if (r.status !== 0) { console.error(`  ! ${sc.id}: convert failed: ${r.stderr.slice(0, 200)}`); continue; }
    console.log(`✓ ${path.relative(ROOT, out)}`);
    written++;
  }
  console.log(`\n${written} zone map(s) → ${path.relative(ROOT, storyOut)}/`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
