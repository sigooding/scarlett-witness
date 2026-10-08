// Turns a PlayFrame project (the storyboard, its recorded voices and its sound effects) into a Scarlet Reel story that plays straight through:
//
//   node tools/build-playframe-reel.mjs hangar|rapture [--from ../PlayFrame]
//
// Writes src/data/<name>Reel.ts and copies what the story needs to public/reels/<name>/ (pictures cut to 1024-1280 px wide, the takes, the
// sound effects). Needs FFMPEG (or ffmpeg on the PATH) for the pictures, the beds and the radio/television voices.
//
// How a PlayFrame frame becomes nodes. A frame is a picture held for `duration` seconds with `audio` clips at offsets. The engine advances a
// beat by a click or Space, and routes itself to the next scene after `afterBeatDelaySeconds`, so each frame becomes a short chain of scenes, one
// per stretch between two events (a spoken line or a one-shot effect starting), each holding the same picture and routing on after exactly that
// stretch. Played untouched the reel runs at the storyboard's own pace; Space skips ahead. The bed effects (the loops) become the scene's
// `ambientAudio`: baked at the frame's gain into public/reels/<name>/audio/sfx/<id>--g<gain>.mp3 and looped by the engine, so a bed that is
// still wanted in the next node carries on without a restart. One-shot effects ride a beat's `sfxUrl` at their gain.
// Lines with an `fx` in the PlayFrame manifest (the radio, the television) are baked with PlayFrame's own chain (scripts/neonoire/voice-fx.mjs).
//
// Everything is marked as a work in progress: the story's title, its tagline, its badge on the home screen (App.tsx), and a first card.
import { cpSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const args = process.argv.slice(2);
const which = args.find(a => !a.startsWith("--"));
const fromIdx = args.indexOf("--from");
const src = resolve(root, fromIdx >= 0 ? args[fromIdx + 1] : process.env.PLAYFRAME || "../PlayFrame");
const ffmpeg = process.env.FFMPEG || "ffmpeg";

const CONFIG = {
  hangar: {
    name: "hangar", project: "public/projects/hangar-cold-open.json", id: "hangar-cold-open-reel", prefix: "hg", export: "HANGAR_COLD_OPEN_REEL", file: "src/data/hangarColdOpenReel.ts",
    title: "Untitled: the cold open (work in progress)",
    tagline: "A pilot's radio in 1944, a crate marked INERT, a truck, a near-miss. Work in progress: American voices and sound effects laid on the painted boards; nobody has heard it yet.",
    width: 1280, quality: 5,
    objective: "Watch the cold open of an animated 1975 feature, a work in progress.",
    manifests: ["docs/hangar/voice/manifest.json"],
  },
  rapture: {
    name: "rapture", project: "public/projects/let-the-raptures-commence.json", id: "let-the-raptures-commence-reel", prefix: "lr", export: "LET_THE_RAPTURES_COMMENCE_REEL", file: "src/data/letTheRapturesCommenceReel.ts",
    title: "Let the Raptures Commence (work in progress)",
    tagline: "Eight episodes of British black comedy, boarded and voiced so far: episode one and the scenes of episodes two to five. Work in progress: some pictures are still to come and nobody has heard the voices yet.",
    width: 1024, quality: 6,
    objective: "Watch the boards play through with their recorded voices, a work in progress.",
    manifests: [],
  },
}[which];
if (!CONFIG) { console.error("usage: node tools/build-playframe-reel.mjs hangar|rapture [--from ../PlayFrame]"); process.exit(1); }
const C = CONFIG;
const publicDir = resolve(root, `public/reels/${C.name}`);
const URL_ROOT = `/reels/${C.name}`;
const project = JSON.parse(readFileSync(resolve(src, C.project), "utf8"));
const library = JSON.parse(readFileSync(resolve(src, "docs/sfx/library.json"), "utf8"));
const effectByFile = new Map(library.effects.filter(e => e.file).map(e => [e.file, e]));
const fxByFile = new Map();
for (const m of C.manifests) for (const l of JSON.parse(readFileSync(resolve(src, m), "utf8")).lines) if (l.fx) fxByFile.set(l.file, l.fx);
const { bakeFx } = await import(pathToFileURL(resolve(src, "scripts/neonoire/voice-fx.mjs")).href);

const run = (cmd, a) => { const r = spawnSync(cmd, a, { encoding: "utf8" }); if (r.status !== 0) throw new Error(`${cmd} ${a.join(" ")}\n${r.stderr}`); };
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const stale = (from, to) => !existsSync(to) || statSync(to).mtimeMs < statSync(from).mtimeMs;
const ensure = file => mkdirSync(dirname(file), { recursive: true });

/** PlayFrame image path → this story's smaller copy. */
const images = new Map();
const imageUrl = path => {
  if (!path) return null;
  if (images.has(path)) return images.get(path);
  const rel = path.replace(/^\/images\//, ""), to = resolve(publicDir, "img", rel);
  if (!path.startsWith("/images/")) throw new Error(`unexpected image path ${path}`);
  const from = resolve(src, "public" + path);
  if (!existsSync(from)) throw new Error(`missing image ${from}`);
  ensure(to);
  if (stale(from, to)) run(ffmpeg, ["-v", "error", "-y", "-i", from, "-vf", `scale='min(${C.width},iw)':-2`, "-q:v", String(C.quality), to]);
  const url = `${URL_ROOT}/img/${rel}`;
  images.set(path, url);
  return url;
};
/** PlayFrame audio path → the story's copy (a voice take is copied, or baked with its radio/television treatment). */
const takes = new Map();
const takeUrl = path => {
  if (takes.has(path)) return takes.get(path);
  const rel = path.replace(/^\/audio\//, ""), to = resolve(publicDir, "audio", rel), from = resolve(src, "public" + path);
  if (!existsSync(from)) throw new Error(`missing take ${from}`);
  ensure(to);
  if (stale(from, to)) { if (fxByFile.has(path)) bakeFx(ffmpeg, from, to, fxByFile.get(path)); else cpSync(from, to); }
  const url = `${URL_ROOT}/audio/${rel}`;
  takes.set(path, url);
  return url;
};
/** A bed: the loop at the frame's gain, baked once per (effect, gain). */
const beds = new Map();
const bedUrl = (path, gain) => {
  const key = `${path}@${gain}`;
  if (beds.has(key)) return beds.get(key);
  const id = path.replace(/^.*\//, "").replace(/\.mp3$/, ""), to = resolve(publicDir, "audio/sfx", `${id}--g${Math.round(gain * 100)}.mp3`), from = resolve(src, "public" + path);
  ensure(to);
  if (stale(from, to)) run(ffmpeg, ["-v", "error", "-y", "-i", from, "-af", `volume=${gain}`, "-c:a", "libmp3lame", "-q:a", "4", "-ac", "1", to]);
  const url = `${URL_ROOT}/audio/sfx/${id}--g${Math.round(gain * 100)}.mp3`;
  beds.set(key, url);
  return url;
};

const BLACK = "gradient:linear-gradient(#000,#000)";
const characters = new Map([["narrator", { id: `${C.prefix}_narrator`, name: "Narrator", role: "The boards" }]]);
const charOf = name => {
  if (!name) return characters.get("narrator").id;
  const id = `${C.prefix}_${slug(name)}`;
  if (!characters.has(name)) characters.set(name, { id, name, role: project.title });
  return id;
};
const TRANSITION = { "Cut": "cut", "Fade in": "fade-black", "Fade out": "fade-black", "Dissolve": "fade", "J-cut": "cut", "L-cut": "cut", "Smash cut": "cut", "Match cut": "cut", "Wipe": "wipe-left" };

// frames in scene order, the order the storyboard plays in
const sceneRank = new Map(project.scenes.map((s, i) => [s.id, i]));
const frames = project.frames.map((f, i) => ({ f, i })).sort((a, b) => (sceneRank.get(a.f.sceneId) - sceneRank.get(b.f.sceneId)) || (a.i - b.i)).map(x => x.f);

const nodes = [];
const startId = `${C.prefix}_wip`;
let beatNo = 0, merged = 0;
const round2 = x => Math.round(x * 100) / 100;
const missing = f => !f.image;
const caption = f => missing(f) ? `${f.title.replace(/\s*\(keyframe missing\)$/, "")}\n(picture to come)` : f.title;

nodes.push({
  id: startId, title: "Work in progress", background: imageUrl(project.coverImage), hideHud: true, letterbox: true, transition: "fade-black", transitionSpeed: 1,
  prose: "", ambientAudio: "", dialogueBeats: [{ id: `${C.prefix}_b${++beatNo}`, characterId: charOf(null), silent: true,
    text: `${C.title.replace(/ \(work in progress\)$/, "")}\n\nWORK IN PROGRESS. The storyboard plays at its own pace with the voices and sound effects recorded so far${frames.some(missing) ? "; shots without a picture yet show a black card" : ""}. Space skips ahead.` }],
});

for (const [fi, f] of frames.entries()) {
  const D = f.duration;
  const clips = (f.audio || []).map(c => ({ ...c, effect: c.id.startsWith("sfx-") ? effectByFile.get(c.src) : null }));
  for (const c of clips) if (c.id.startsWith("sfx-") && !c.effect) throw new Error(`${c.id}: not a library effect (${c.src})`);
  const speech = clips.filter(c => !c.effect).sort((a, b) => a.offset - b.offset);
  const shots = clips.filter(c => c.effect && !c.effect.loop).sort((a, b) => a.offset - b.offset);
  const loops = clips.filter(c => c.effect && c.effect.loop);
  // an effect that starts in the first third of a second belongs to the cut itself
  for (const c of shots.concat(loops)) if (c.offset < 0.3) c.offset = 0;
  // an effect that would split a spoken line in two (its node would end the voice) is moved to that line's start
  for (const c of shots.concat(loops)) {
    const inside = speech.find(s => c.offset > s.offset + 0.01 && c.offset < s.offset + (s.duration ?? 0) - 0.05);
    if (inside) { c.offset = inside.offset; merged++; }
  }
  const times = [...new Set([0, ...speech.map(c => c.offset), ...shots.map(c => c.offset), ...loops.map(c => c.offset)].map(round2))].sort((a, b) => a - b);
  const bg = imageUrl(f.image) ?? BLACK;
  const first = nodes.length;
  times.forEach((t, k) => {
    const end = k + 1 < times.length ? times[k + 1] : D, stretch = end - t;
    const line = speech.find(c => round2(c.offset) === t);
    const sfx = shots.filter(c => round2(c.offset) === t);
    if (sfx.length > 1) throw new Error(`${f.id}: two one-shot effects start together at ${t}`);
    const active = loops.filter(c => c.offset <= t + 0.001);
    const ambient = [...new Map(active.map(c => [c.src, c])).values()].map(c => `file:${bedUrl(c.src, c.gain ?? 1)}`).join("+");
    const beat = line
      ? { id: `${C.prefix}_b${++beatNo}`, characterId: charOf(line.character), text: line.text, audioUrl: takeUrl(line.src) }
      : { id: `${C.prefix}_b${++beatNo}`, characterId: charOf(null), silent: true, text: k === 0 ? caption(f) : "·" };
    if (sfx[0]) Object.assign(beat, { sfxUrl: takeUrl(sfx[0].src), sfxVolume: sfx[0].gain ?? 1 });
    const transition = k === 0 ? (TRANSITION[f.transition] ?? "cut") : "cut";
    const speed = k === 0 ? (transition === "cut" ? 0.1 : 0.8) : 0.05;
    // measured in the engine: a beat routes `afterBeatDelaySeconds` after its voice has ended (about 0.4 s after the take's own length) or, on a
    // silent beat, after the scene's entry transition; so the delay is what is left of the stretch once those are taken out
    const delay = Math.max(0.1, round2(line ? stretch - (line.duration ?? 0) - 0.4 : stretch - speed - 0.1));
    nodes.push({
      id: `${C.prefix}_${f.id.replace(/[^a-z0-9]+/gi, "_")}${k ? `_${k}` : ""}`.toLowerCase(), title: `${f.shotNumber ? `${f.shotNumber} · ` : ""}${f.title.replace(/\s*\(keyframe missing\)$/, "")}${k ? ` (${k + 1})` : ""}`,
      background: bg, hideHud: true, letterbox: true, transition, transitionSpeed: speed,
      prose: "", ambientAudio: ambient, dialogueBeats: [{ ...beat, afterBeatMode: "auto", afterBeatDelaySeconds: delay }],
    });
  });
}
const endId = `${C.prefix}_end`;
nodes.push({
  id: endId, title: "End of what exists", isEnding: true, background: imageUrl(project.coverImage), prose: "", dialogueBeats: [], hotspots: [], choices: [],
  endingData: { tier: "victory-gold", headline: `${C.title.replace(/ \(work in progress\)$/, "").toUpperCase()} — WORK IN PROGRESS`, recap: "That is everything boarded and voiced so far." },
});
nodes.forEach((n, i) => {
  n.hotspots ??= []; n.noTypewriter = true; n.autoNarrate = false;
  if (!n.isEnding) {
    n.choices = [];
    Object.assign(n.dialogueBeats[n.dialogueBeats.length - 1], { afterBeatTargetSceneId: nodes[i + 1].id, afterBeatMode: "auto" });
    n.dialogueBeats[n.dialogueBeats.length - 1].afterBeatDelaySeconds ??= 4;
  }
});
nodes[0].dialogueBeats[0].afterBeatDelaySeconds = 6;

const layout = Object.fromEntries(nodes.map((s, i) => [s.id, { x: 40 + (i % 24) * 300, y: 40 + Math.floor(i / 24) * 220 }]));
const story = {
  id: C.id, pulpPaper: false, title: C.title, tagline: C.tagline, gameKind: "vn", coverImage: imageUrl(project.coverImage), startSceneId: startId, layout,
  briefing: { gameInfo: `${project.title}, played as a reel: the storyboard pictures, the recorded voices and the shared sound effects, at the storyboard's own pace. A work in progress.`, objective: C.objective, winConditions: ["Reach the end of what exists."], loseConditions: [] },
  characters: [...characters.values()].map(c => ({ ...c, avatarUrl: c.id === `${C.prefix}_narrator` ? "emoji:🎙" : "emoji:🗣", trustMeter: 0 })), items: [], scenes: nodes,
};
writeFileSync(resolve(root, C.file),
  `// GENERATED by tools/build-playframe-reel.mjs ${C.name} from PlayFrame's ${C.project} — change the storyboard in PlayFrame or the tool, not this file.\nimport type { Story } from "../types";\n\nexport const ${C.export}: Story = ${JSON.stringify(story)} as unknown as Story;\n`);
const dur = frames.reduce((n, f) => n + f.duration, 0);
console.log(`${C.name}: ${frames.length} frames (${Math.round(dur)} s) → ${nodes.length} scenes, ${beatNo} beats, ${characters.size} characters; ${images.size} pictures, ${takes.size} takes and effects, ${beds.size} beds${merged ? `; ${merged} effect(s) moved to the start of the line they fell inside` : ""}`);
