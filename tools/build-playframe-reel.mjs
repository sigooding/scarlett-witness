// Turns a PlayFrame project (the storyboard, its script, its recorded voices and its sound effects) into a Scarlet Reel story that plays the way the
// Nobody's Witness film does: one node per scene, every shot a beat's replacement picture, the screenplay's action as Narrator text, every spoken line
// under its speaker's name with the recorded take, and ▸ continue (click or Space) to go on.
//
//   node tools/build-playframe-reel.mjs hangar|rapture [--from ../PlayFrame] [--stats]
//
// Writes src/data/<name>Reel.ts and copies what the story needs to public/reels/<name>/ (pictures cut to 1024-1280 px wide, the takes, the sound
// effects). Needs FFMPEG (or ffmpeg on the PATH) for the pictures, the beds, the mixed effects and the radio/television voices.
//
// How a PlayFrame frame becomes beats (docs/playframe-reels.md has the longer version):
//  * the frame's text is its NUMBERED SCRIPT block (the Rapture's boards: header line, action lines, `SPEAKER: (direction) words` lines) or its `Script:`
//    quote and `NAME: (delivery) words` lines (the cold open). Action is Narrator text cut at sentence ends into pieces of at most ~150 characters;
//    a slugline (INT./EXT.) that changes becomes a card of its own; each spoken line is a beat under the speaker's name with the take that matches
//    it (a line with no take is text only).
//  * the picture is the first beat's replacement background; a shot with no picture yet holds the one before it (black at the start of a scene).
//  * one-shot effects ride the beat nearest their time in the frame (several on one beat are mixed into one file); looped beds are the node's
//    `ambientAudio` (a new node starts where the set of beds changes; the engine carries a bed that is still wanted on without a restart).
//  * runs of legacy reference boards (a picture and no story text) are a montage; a scene that is only an outline is a text card; the two episode-one
//    scenes written but never boarded (the storage facility, the 1980 tag) are read from their screenplay pages.
// Everything is marked as a work in progress: the story's title, its tagline, its badge on the home screen (App.tsx) and a first card.
import { cpSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const args = process.argv.slice(2);
const which = args.find(a => !a.startsWith("--"));
const fromIdx = args.indexOf("--from");
const src = resolve(root, fromIdx >= 0 ? args[fromIdx + 1] : process.env.PLAYFRAME || "../PlayFrame");
const ffmpeg = process.env.FFMPEG || "ffmpeg";
const STATS = args.includes("--stats");

const CONFIG = {
  hangar: {
    name: "hangar", project: "public/projects/hangar-cold-open.json", id: "hangar-cold-open-reel", prefix: "hg", export: "HANGAR_COLD_OPEN_REEL", file: "src/data/hangarColdOpenReel.ts",
    title: "Untitled: the cold open (work in progress)",
    tagline: "A pilot's radio in 1944, a crate marked INERT, a truck, a near-miss. Work in progress: American voices and sound effects laid on the painted boards; nobody has heard it yet.",
    width: 1280, quality: 5, format: "hangar",
    objective: "Read and watch the cold open of an animated 1975 feature, a work in progress.",
    manifests: ["docs/hangar/voice/manifest.json"], lookup: [], pages: {}, skip: [], screenplay: "docs/hangar/cold-open.fountain",
  },
  rapture: {
    name: "rapture", project: "public/projects/let-the-raptures-commence.json", id: "let-the-raptures-commence-reel", prefix: "lr", export: "LET_THE_RAPTURES_COMMENCE_REEL", file: "src/data/letTheRapturesCommenceReel.ts",
    title: "Let the Raptures Commence (work in progress)",
    tagline: "Eight episodes of British black comedy: the screenplay of episode one and the boarded scenes of episodes two to five, with the voices recorded so far and the outlines of the rest. Work in progress: some pictures are still to come and nobody has heard the voices yet.",
    width: 1024, quality: 6, format: "rapture",
    objective: "Read and watch the boards play through with their recorded voices, a work in progress.",
    manifests: [], lookup: ["docs/rapture/voice/manifest.json"], laxBeds: true,
    // episode-one scenes that are written but have no board: read from the screenplay pages, laid over the legacy pictures where the project has them.
    // `plan` switches the picture (1-based, in the scene's order) at the first beat whose text starts with the anchor (the longest anchor wins).
    pages: {
      "rapture-ep1-storage": { file: "docs/rapture/screenplay/ep1-06-storage-facility.md", plan: [
        ["EXT. STORAGE FACILITY", 1], ["INT. STORAGE FACILITY", 2], ["He stops at a bay", 3], ["INSERT - THE SHEET", 4], ["He cuts the padlock", 5], ["The shutter rolls up", 6],
        ["Martin in the doorway", 7], ["He goes through it", 8], ["A hotel bill", 9], ["A tour jacket", 10], ["He puts it on", 11], ["A guitar case", 12], ["He stops. Puts it back", 13],
        ["His phone buzzes", 14], ["INSERT - PHONE", 15], ["He goes back to the boxes", 16], ["From one of them", 18], ["He turns it over", 19], ["He runs his thumb", 20],
        ["EXT. STORAGE FACILITY - CAR PARK", 21], ["He throws the box", 22], ["The car pulls out", 23]] },
      "rapture-ep1-no": { file: "docs/rapture/screenplay/ep1-09-hotel-room.md", plan: [] },
    },
    skip: ["rapture-ep1-bearing"],
  },
}[which];
if (!CONFIG) { console.error("usage: node tools/build-playframe-reel.mjs hangar|rapture [--from ../PlayFrame] [--stats]"); process.exit(1); }
const C = CONFIG;
const publicDir = resolve(root, `public/reels/${C.name}`);
const URL_ROOT = `/reels/${C.name}`;
const project = JSON.parse(readFileSync(resolve(src, C.project), "utf8"));
const library = JSON.parse(readFileSync(resolve(src, "docs/sfx/library.json"), "utf8"));
const effectByFile = new Map(library.effects.filter(e => e.file).map(e => [e.file, e]));
const fxByFile = new Map(), lookupLines = [];
for (const m of C.manifests) for (const l of JSON.parse(readFileSync(resolve(src, m), "utf8")).lines) if (l.fx) fxByFile.set(l.file, l.fx);
for (const m of C.lookup) lookupLines.push(...JSON.parse(readFileSync(resolve(src, m), "utf8")).lines);
const { bakeFx } = await import(pathToFileURL(resolve(src, "scripts/neonoire/voice-fx.mjs")).href);

const run = (cmd, a) => { const r = spawnSync(cmd, a, { encoding: "utf8" }); if (r.status !== 0) throw new Error(`${cmd} ${a.join(" ")}\n${r.stderr}`); };
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const nice = s => s.toLowerCase().replace(/(^|[\s.-])([a-z])/g, (_, a, b) => a + b.toUpperCase()).replace(/\bTv\b/, "TV");
const up = s => String(s).toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim();
const norm = s => s.toLowerCase().replace(/\([^)]*\)/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
const stale = (from, to) => !existsSync(to) || statSync(to).mtimeMs < statSync(from).mtimeMs;
const ensure = file => mkdirSync(dirname(file), { recursive: true });
const round2 = x => Math.round(x * 100) / 100;
const warnings = [];
const warn = msg => { warnings.push(msg); };

/** PlayFrame image path → this story's smaller copy (null when the shot has no picture yet). */
const images = new Map();
const imageUrl = (path, width = C.width, quality = C.quality, dir = "img") => {
  if (!path) return null;
  const key = `${path}@${width}`;
  if (images.has(key)) return images.get(key);
  if (!path.startsWith("/images/")) throw new Error(`unexpected image path ${path}`);
  const rel = path.replace(/^\/images\//, ""), to = resolve(publicDir, dir, rel), from = resolve(src, "public" + path);
  if (!existsSync(from)) throw new Error(`missing image ${from}`);
  ensure(to);
  if (stale(from, to)) run(ffmpeg, ["-v", "error", "-y", "-i", from, "-vf", `scale='min(${width},iw)':-2`, "-q:v", String(quality), to]);
  const url = `${URL_ROOT}/${dir}/${rel}`;
  images.set(key, url);
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
  const id = path.replace(/^.*\//, "").replace(/\.mp3$/, ""), name = `${id}--g${Math.round(gain * 100)}.mp3`, to = resolve(publicDir, "audio/sfx", name), from = resolve(src, "public" + path);
  ensure(to);
  if (stale(from, to)) run(ffmpeg, ["-v", "error", "-y", "-i", from, "-af", `volume=${gain}`, "-c:a", "libmp3lame", "-q:a", "4", "-ac", "1", to]);
  const url = `${URL_ROOT}/audio/sfx/${name}`;
  beds.set(key, url);
  return url;
};
/** One-shot effects that belong to one beat, mixed into one file at their delays and gains. */
const mixes = new Map();
const mixUrl = parts => {
  const key = createHash("sha1").update(JSON.stringify(parts)).digest("hex").slice(0, 10), name = `mix-${key}.mp3`, to = resolve(publicDir, "audio/sfx", name);
  if (!mixes.has(key)) {
    ensure(to);
    if (!existsSync(to)) {
      const inputs = parts.flatMap(p => ["-i", resolve(src, "public" + p.src)]);
      const chains = parts.map((p, i) => `[${i}:a]adelay=${Math.round(p.delay * 1000)}:all=1,volume=${p.gain}[a${i}]`).join(";");
      const mix = parts.length > 1
        ? `${parts.map((_, i) => `[a${i}]`).join("")}amix=inputs=${parts.length}:normalize=0:dropout_transition=0,alimiter=limit=0.95:level=disabled[out]`
        : `[a0]alimiter=limit=0.95:level=disabled[out]`;
      run(ffmpeg, ["-v", "error", "-y", ...inputs, "-filter_complex", `${chains};${mix}`, "-map", "[out]", "-c:a", "libmp3lame", "-q:a", "4", "-ac", "1", to]);
    }
    mixes.set(key, `${URL_ROOT}/audio/sfx/${name}`);
  }
  return mixes.get(key);
};

const BLACK = "gradient:linear-gradient(#000,#000)";
const TRANSITION = { "Cut": "cut", "Fade in": "fade-black", "Fade out": "fade-black", "Dissolve": "crossfade", "J-cut": "cut", "L-cut": "cut", "Smash cut": "cut", "Match cut": "cut", "Wipe": "wipe-left" };
const bgFields = (bg, transition = "Cut") => {
  const t = bg === BLACK ? "fade-black" : (TRANSITION[transition] ?? "cut");
  return { background: bg, backgroundTransition: t, backgroundTransitionSpeed: t === "cut" ? 0.1 : 0.8 };
};
/** Sentence-aware chunks of at most `max` characters (a single longer sentence stays whole). */
const chunkText = (text, max = 150) => {
  text = text.replace(/[ \t]+/g, " ").trim();
  if (text.length <= max) return [text];
  const out = [];
  for (const sent of text.split(/(?<=[.!?…]["”')]?)\s+/)) {
    if (out.length && out[out.length - 1].length + 1 + sent.length <= max) out[out.length - 1] += " " + sent;
    else out.push(sent);
  }
  return out;
};

// ---- the cast: one character per speaker, with the character sheet as portrait where the project has one ----
const characters = new Map([["narrator", { id: `${C.prefix}_narrator`, name: "Narrator", role: "The screenplay's action", avatarUrl: "emoji:🎙", trustMeter: 0 }]]);
const SPEAKERS = new Set();
for (const f of project.frames) for (const a of f.audio || []) if (a.character !== "SFX") SPEAKERS.add(up(a.character));
for (const c of project.characters || []) for (const w of c.name.split(/\s+/)) if (/^[A-Z][a-z]/.test(w) && w.length > 2) SPEAKERS.add(up(w));
for (const l of lookupLines) SPEAKERS.add(up(l.speaker));
/** The character sheet of the project character whose first name is the speaker (a "The …" character is only matched by name, never by a shared word). */
const portraitFor = who => {
  const w = up(who);
  const c = (project.characters || []).find(c => c.image && !/^the\b/i.test(c.name) && up(c.name.replace(/^(Sister|PC)\s+/i, "").split(/\s+/)[0]) === w)
    ?? (w === "THE WOMAN" ? (project.characters || []).find(c => c.id === "rapture-woman-fourteen" && c.image) : null);
  return c ? imageUrl(c.image, 256, 5, "img/portraits") : null;
};
const charOf = who => {
  if (!who) return characters.get("narrator").id;
  const key = up(who);
  if (!characters.has(key)) characters.set(key, { id: `${C.prefix}_${slug(who)}`, name: nice(who), role: project.title, avatarUrl: portraitFor(who) ?? "emoji:🗣", trustMeter: 0 });
  return characters.get(key).id;
};

// ---- reading a frame's text ----
const SLUG = /^(INT\.\/EXT\.|EXT\.\/INT\.|INT\/EXT|EXT\/INT|I\/E\.?|INT\.?|EXT\.?)\s+/i;
const TIME = /^(MORNING|DAY|NIGHT|EVENING|AFTERNOON|DAWN|DUSK|NOON|CONTINUOUS|LATER|MOMENTS LATER|SAME TIME|MONTHS LATER|THE NEXT MORNING)\b/i;
const CAMERA = /(\b\d{2,3}\s?mm\b|^(STATIC|HANDHELD|CU|ECU|INSERT|FLASH|WIDE|MEDIUM|CLOSE|TWO-SHOT|2-SHOT|OTS|POV|LOCKED OFF|PUSH|DOLLY|PAN|TILT|TRACKING|AERIAL|OVERHEAD|LOW ANGLE|HIGH ANGLE|MASTER|SINGLE|CRANE|ZOOM|SLOW|REVERSE|MOVING)\b)/;
const DLG = /^\s*([A-Z][A-Z0-9 .'’#&\/-]{0,28}?)\s*(?:\(([^)]*)\))?\s*:\s*(.*)$/;
const leadingNote = rest => { const m = /^\(([^)]*)\)\s*(.*)$/.exec(rest); return m ? { note: `(${m[1]})`, text: m[2] } : { note: null, text: rest }; };

/** "STATIC WIDE — 28mm, locked off — INT. HALL — CONTINUOUS" (a header) → the slugline and any action the header carries. */
function readHeader(header) {
  const segs = header.split(/\s+—\s+/).map(s => s.trim()).filter(Boolean), action = [];
  let location = null, time = null;
  for (const seg of segs) {
    if (!location && SLUG.test(seg)) {
      const mm = /^(INT\.\/EXT\.|EXT\.\/INT\.|INT\/EXT|EXT\/INT|I\/E\.?|INT\.?|EXT\.?)\s+([^.]+?)(?:\.\s+(.*))?$/is.exec(seg);
      if (mm) { location = `${mm[1].replace(/\.?$/, ".")} ${mm[2]}`; if (mm[3]) action.push(mm[3]); continue; }
    }
    if (location && !time && TIME.test(seg)) { const [t, ...rest] = seg.split(/\.\s+/); time = t.replace(/\.$/, ""); if (rest.length) action.push(rest.join(". ")); continue; }
    const sentences = /[.!?]\s+[A-Z]/.test(seg) || seg.length > 90;
    if (!sentences && CAMERA.test(seg)) continue;
    action.push(seg);
  }
  return { slug: location ? [location, time].filter(Boolean).join(" — ") : null, action: action.join(" — ") };
}

/** The Rapture's frames: the NUMBERED SCRIPT block of the notes (null for a legacy board, which has none). */
function readRapture(f) {
  const n = f.notes || "", i = n.indexOf("NUMBERED SCRIPT");
  if (i < 0) return null;
  const out = { slug: null, items: [] };
  let para = [];
  const flush = () => { if (para.length) out.items.push({ kind: "text", text: para.join(" ") }); para = []; };
  n.slice(i).split("\n").slice(1).forEach((raw, k) => {
    const line = raw.trim();
    if (!line) return;
    if (k === 0 && /^\d+[a-z]?\.\s+/.test(line)) {
      const h = readHeader(line.replace(/^\d+[a-z]?\.\s+/, ""));
      out.slug = h.slug;
      if (h.action) para.push(h.action);
      return;
    }
    const m = DLG.exec(raw);
    if (m && SPEAKERS.has(up(m[1]))) {
      flush();
      const rest = leadingNote(m[3]);
      out.items.push({ kind: "line", who: m[1].trim(), note: rest.note ?? (m[2] ? `(${m[2]})` : null), text: rest.text });
      return;
    }
    para.push(line);
  });
  flush();
  return out;
}

/**
 * The cold open's action, from the screenplay itself (docs/hangar/cold-open.fountain): each frame's `Script:` quote names where in the scene the shot
 * begins, and the frame takes every sentence of the scene's action from there to the next shot's quote, so nothing the screenplay says is lost.
 */
const similar = (a, b) => { const x = norm(a), y = norm(b); return x === y || x.includes(y) || y.includes(x) || x.slice(0, 18) === y.slice(0, 18); };
const hangarText = new Map(), hangarIntro = [];
if (C.screenplay) {
  const paras = readFileSync(resolve(src, C.screenplay), "utf8").split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const seqOf = new Map();   // scene number → the screenplay in order: { a: a sentence of action } and { d: [speaker, words] }
  let scene = 0;
  for (let i = 0; i < paras.length; i++) {
    const p = paras[i], h = /^(?:INT|EXT)[^\n]*#(\d+)#\s*$/.exec(p);
    if (h) { scene = Number(h[1]); seqOf.set(scene, []); continue; }
    if (/^>THE (LOOK|SOUND)<$/.test(p)) { hangarIntro.push(`${p.slice(1, -1)}\n\n${(paras[++i] ?? "").replace(/\s+/g, " ")}`); continue; }
    if (!scene) continue;
    const lines = p.split("\n").map(l => l.trim());
    if (lines.length >= 2 && /^[A-Z][A-Z0-9 .'’\/-]*(\s*\([^)]*\))?$/.test(lines[0])) {
      seqOf.get(scene).push({ d: [lines[0].replace(/\s*\(.*$/, ""), lines.slice(/^\(.*\)$/.test(lines[1]) ? 2 : 1).join(" ")] });
      continue;
    }
    for (const a of p.replace(/\s+/g, " ").split(/(?<=[.!?…]["”')]?)\s+(?=[A-Z"“(])/)) seqOf.get(scene).push({ a });
  }
  for (const [n, seq] of seqOf) {
    const frames = project.frames.filter(f => f.sceneId === `hangar-s${n}`);
    const quoteOf = f => (/^Script:\s*"(.*)"\s*$/m.exec(f.notes || "")?.[1] ?? f.description ?? "").trim();
    let prev = -1;
    // a frame begins where its Script quote does; a frame whose quote is a spoken line begins at the action that sets that line up
    const anchors = frames.map(f => {
      const first = norm(quoteOf(f).split(/(?<=[.!?…])\s+/)[0] ?? "");
      let at = first ? seq.findIndex((x, k) => k > prev && x.a && norm(x.a).includes(first)) : -1;
      if (at < 0) {
        const m = /^([A-Z][A-Z ]*):\s+(?:\([^)]*\)\s+)?(\S.*)$/m.exec(f.notes || "");
        const d = m ? seq.findIndex((x, k) => k > prev && x.d && up(x.d[0]) === up(m[1]) && similar(x.d[1], m[2])) : -1;
        if (d >= 0) { at = d; while (at - 1 > prev && seq[at - 1].a) at--; }
      }
      if (at >= 0) prev = at;
      return at;
    });
    const parts = frames.map((f, k) => {
      const start = k === 0 ? 0 : anchors[k];
      const next = anchors.slice(k + 1).find(a => a >= 0) ?? seq.length;
      return (k === 0 || anchors[k] >= 0) && next > start ? seq.slice(start, next).filter(x => x.a).map(x => x.a) : [];
    });
    // a shot the screenplay has no sentence for (a paraphrased quote, no spoken line) takes the later sentences of the shot before it
    frames.forEach((f, k) => {
      if (k === 0 || anchors[k] >= 0 || /^[A-Z][A-Z ]*:\s/m.test(f.notes || "") || parts[k - 1].length < 2) return;
      const keep = Math.max(1, Math.floor(parts[k - 1].length / 2));
      parts[k] = parts[k - 1].slice(keep); parts[k - 1] = parts[k - 1].slice(0, keep);
    });
    frames.forEach((f, k) => hangarText.set(f.id, parts[k].join(" ")));
  }
}

/** The cold open's frames: the screenplay's action for the shot and the `NAME: (delivery) words` lines of the notes. */
function readHangar(f) {
  const n = f.notes || "";
  const out = { slug: null, items: [] };
  const action = (hangarText.has(f.id) ? hangarText.get(f.id) : /^Script:\s*"(.*)"\s*$/m.exec(n)?.[1] ?? f.description ?? "").trim();
  if (action) out.items.push({ kind: "text", text: action });
  for (const raw of n.split("\n")) {
    const m = /^([A-Z][A-Z ]*):\s+(?:\(([^)]*)\)\s+)?(\S.*)$/.exec(raw.trim());
    if (m && SPEAKERS.has(up(m[1]))) out.items.push({ kind: "line", who: m[1], note: m[2] ? `(${m[2]})` : null, text: m[3] });
  }
  return out;
}
const readFrame = f => (C.format === "hangar" ? readHangar(f) : readRapture(f));

// ---- a frame becomes beats ----
let beatNo = 0;
const mkBeat = (who, fields) => ({ id: `${C.prefix}_b${++beatNo}`, characterId: charOf(who), ...fields });
const locationOf = s => s.replace(/\s+—\s+(CONTINUOUS|LATER|MOMENTS LATER|SAME TIME)$/i, "");

function frameBeats(f, text, state) {
  const beats = [];
  const speech = (f.audio || []).filter(c => c.character !== "SFX").sort((a, b) => a.offset - b.offset);
  let k = 0, t = 0;
  const push = (who, fields, at, dur) => { if (at !== undefined) t = at; beats.push({ beat: mkBeat(who, fields), t, end: at !== undefined ? at + (dur ?? 0) : undefined }); };
  if (text?.slug) {
    const loc = locationOf(text.slug);
    if (!state.skipSlug && up(loc) !== up(state.lastSlug)) push(null, { text: text.slug.toUpperCase(), silent: true });
    state.lastSlug = loc; state.skipSlug = false;
  }
  for (const item of text?.items ?? []) {
    if (item.kind === "text") { for (const piece of chunkText(item.text)) push(null, { text: piece, silent: true }); continue; }
    const e = speech[k], note = item.note ? { expression: item.note } : {};
    if (e && up(e.character) === up(item.who) && similar(e.text, item.text)) { k++; push(item.who, { text: e.text, ...note, audioUrl: takeUrl(e.src) }, e.offset, e.duration); }
    else push(item.who, { text: item.text, ...note, silent: true });
  }
  for (; k < speech.length; k++) {
    warn(`${f.id}: the take "${speech[k].text.slice(0, 40)}" (${speech[k].character}) matches no line of the frame's script; kept as a beat at its offset`);
    push(speech[k].character, { text: speech[k].text, audioUrl: takeUrl(speech[k].src) }, speech[k].offset, speech[k].duration);
  }
  // the unvoiced beats between two voiced ones (or the frame's start and end) are spread over that stretch in proportion to their length, so an effect
  // that belongs to the middle of a long description lands on the beat that says it
  for (let i = 0; i < beats.length;) {
    if (beats[i].beat.audioUrl) { i++; continue; }
    let j = i;
    while (j < beats.length && !beats[j].beat.audioUrl) j++;
    const t0 = i > 0 ? (beats[i - 1].end ?? beats[i - 1].t) : 0, t1 = j < beats.length ? beats[j].t : f.duration;
    const total = beats.slice(i, j).reduce((n, b) => n + (b.beat.text || "").length, 0) || 1;
    let seen = 0;
    for (let q = i; q < j; q++) { beats[q].t = round2(t0 + Math.max(0, t1 - t0) * seen / total); seen += (beats[q].beat.text || "").length; }
    i = j;
  }
  return beats;
}

/** An episode-one scene read from its screenplay page (Fountain-style paragraphs), over the legacy pictures where the project has them. */
function readPage(file, scene, page, pics) {
  const text = readFileSync(file, "utf8");
  const body = text.slice(text.search(/^# /m)).split("\n").slice(1).join("\n").replace(/^===.*$/m, "").trim();
  const paragraphs = body.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const out = [];
  const emit = (who, fields, anchorText) => {
    const a = anchorText.toUpperCase(), hit = page.plan.filter(([anchor]) => a.startsWith(anchor.toUpperCase())).sort((x, y) => y[0].length - x[0].length)[0];
    if (hit && pics[hit[1] - 1]) fields = { ...fields, ...bgFields(pics[hit[1] - 1]) };
    out.push(mkBeat(who, fields));
  };
  let pendingInsert = null;
  for (let p = 0; p < paragraphs.length; p++) {
    const para = paragraphs[p], lines = para.split("\n").map(l => l.trim());
    if (/^(BACK TO SCENE|END MONTAGE|\[\[.*\]\])$/i.test(para)) continue;
    if (/^INSERT\b/i.test(para) && lines.length === 1) { pendingInsert = para.toUpperCase(); continue; }
    if (/^ON SCREEN:/i.test(para)) {
      const block = lines.length > 1 ? lines.slice(1) : (paragraphs[++p] ?? "").split("\n").map(l => l.trim());
      emit(null, { text: ["ON SCREEN:", ...block].join("\n"), silent: true }, "ON SCREEN:");
      continue;
    }
    if (lines.length >= 2 && SPEAKERS.has(up(lines[0])) && /^[A-Z][A-Z0-9 .'’-]*$/.test(lines[0])) {
      const who = nice(lines[0]), noteLine = /^\((.*)\)$/.exec(lines[1]), words = lines.slice(noteLine ? 2 : 1).join(" ");
      const taken = lookupLines.find(l => up(l.speaker) === up(who) && similar(l.text, words));
      emit(who, { text: words, ...(noteLine ? { expression: `(${noteLine[1]})` } : {}), ...(taken ? { audioUrl: takeUrl(taken.file) } : { silent: true }) }, words);
      continue;
    }
    if (lines.length > 1 && lines.every(l => l.startsWith("—"))) { for (const l of lines) emit(null, { text: l, silent: true }, l); continue; }
    if (/^(SUPER:|MONTAGE|> END|CUT TO BLACK|(INT|EXT)[. ])/i.test(para) && lines.length === 1) { emit(null, { text: para.toUpperCase(), silent: true }, para); continue; }
    const t = pendingInsert ? `${pendingInsert}\n\n${lines.join(" ")}` : lines.join(" ");
    const anchor = pendingInsert ?? lines.join(" ");
    pendingInsert = null;
    chunkText(t, 120).forEach((piece, k) => emit(null, { text: piece, silent: true }, k === 0 ? anchor : piece));
  }
  return out;
}

// ---- the project, scene by scene ----
const actIndex = new Map((project.acts || []).map((a, i) => [a.id, i]));
const scenes = project.scenes.map((s, i) => ({ s, i })).sort((a, b) => ((actIndex.get(a.s.actId) ?? 99) - (actIndex.get(b.s.actId) ?? 99)) || (a.i - b.i)).map(x => x.s).filter(s => !C.skip.includes(s.id));
const headingOf = s => [s.location, s.time].filter(Boolean).join(" — ");
const actTitle = id => (project.acts || []).find(a => a.id === id)?.title ?? "";
const sceneName = s => s.title.replace(/\s*—\s*outline$/i, "");
const NODE_FRAMES = 16;

const nodes = [];
let current = null, lastBg = null, lastAct = null;
const parts = new Map();
const openNode = (scene, { bg, key = "" }) => {
  const part = parts.get(scene.id) ?? 0;
  parts.set(scene.id, part + 1);
  const first = part === 0;
  const node = {
    id: `${C.prefix}_${slug(scene.id)}${part ? `_${part + 1}` : ""}`, title: `${sceneName(scene)}${part ? " (cont.)" : ""}`,
    background: bg ?? lastBg ?? BLACK, prose: first ? headingOf(scene) : "", ambientAudio: "", hideHud: true, letterbox: true,
    transition: first ? "fade-black" : "cut", transitionSpeed: first ? 1.1 : 0.2, dialogueBeats: [],
  };
  if (first && scene.actId !== lastAct) {
    lastAct = scene.actId;
    if (C.format === "rapture") node.dialogueBeats.push(mkBeat(null, { text: actTitle(scene.actId).replace(/^Episode (\d+) — /, "EPISODE $1 — ").toUpperCase(), silent: true, ...bgFields(BLACK) }));
  }
  nodes.push(node);
  finishNode();
  current = { node, key, frames: 0, scene, beds: new Map() };
  return node;
};
/** A node's beds are the loops of its frames, each at the mean of the gains its frames gave it (the reel is not a mixing desk: one level per node). */
const finishNode = () => {
  if (!current) return;
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  if (current.beds.size) current.node.ambientAudio = [...current.beds].map(([path, gains]) => `file:${bedUrl(path, Math.round(mean(gains) * 20) / 20)}`).join("+");
};
const closeNode = () => { finishNode(); current = null; };

const startId = `${C.prefix}_wip`;
nodes.push({
  id: startId, title: "Work in progress", background: imageUrl(project.coverImage) ?? BLACK, hideHud: true, letterbox: true, transition: "fade-black", transitionSpeed: 1,
  prose: "", ambientAudio: "", dialogueBeats: [mkBeat(null, { silent: true,
    text: `${C.title.replace(/ \(work in progress\)$/, "").toUpperCase()}\n\nWORK IN PROGRESS. The screenplay as it exists, with the voices and sound effects recorded so far. ▸ continue (click or Space) to go on. A shot with no picture yet keeps the picture before it, and black at the start of a scene.` }),
    ...hangarIntro.map(t => mkBeat(null, { silent: true, text: t }))],
});

const state = { lastSlug: "", skipSlug: true };
const sceneStats = [];
for (const scene of scenes) {
  const frames = project.frames.filter(f => f.sceneId === scene.id), page = C.pages[scene.id];
  const before = nodes.length, beatsBefore = beatNo;
  state.lastSlug = locationOf(headingOf(scene)); state.skipSlug = true;

  if (!frames.length && !page) {
    // a scene that is only an outline: a text card
    const node = openNode(scene, { bg: BLACK });
    node.prose = "";
    const description = scene.description.replace(/^OUTLINE ONLY — not a numbered shooting script\.\s*/i, "").replace(/^OUTLINE ONLY — /i, "");
    node.dialogueBeats.push(mkBeat(null, { text: `OUTLINE — ${sceneName(scene).toUpperCase()}${headingOf(scene) ? ` (${headingOf(scene)})` : ""}`, silent: true, ...bgFields(BLACK) }));
    for (const piece of chunkText(description, 220)) node.dialogueBeats.push(mkBeat(null, { text: piece, silent: true }));
    lastBg = BLACK; closeNode();
  } else if (page) {
    const pics = frames.map(f => imageUrl(f.image));
    const node = openNode(scene, { bg: pics[0] ?? BLACK });
    const beats = readPage(resolve(src, page.file), scene, page, pics);
    if (!beats[0].background) Object.assign(beats[0], bgFields(pics[0] ?? BLACK));
    node.dialogueBeats.push(...beats);
    lastBg = [...node.dialogueBeats].reverse().find(b => b.background)?.background ?? lastBg;
    closeNode();
  } else {
    // pictures and no story text (the legacy reference boards): a montage per run, after a card that says what the scene is
    const isLegacy = f => C.format === "rapture" && !(f.notes || "").includes("NUMBERED SCRIPT") && !(f.audio || []).length;   // a card holding the slot of a missing legacy file belongs to the run, with no picture
    const segments = [];
    for (const f of frames) {
      const last = segments[segments.length - 1], legacy = isLegacy(f);
      if (last && last.legacy === legacy) last.frames.push(f); else segments.push({ legacy, frames: [f] });
    }
    let first = true;
    for (const seg of segments) {
      if (seg.legacy) {
        const urls = seg.frames.filter(f => f.image).map(f => imageUrl(f.image));
        const seconds = Math.max(2, Math.round(seg.frames.reduce((n, f) => n + f.duration, 0) / seg.frames.length));
        const node = openNode(scene, { bg: urls[0] });
        const description = scene.description.replace(/^OUTLINE ONLY — ordered legacy reference board \([^)]*\), not approved coverage\.\s*/i, "").replace(/^OUTLINE ONLY — /i, "");
        chunkText(`${sceneName(scene).toUpperCase()} (OUTLINE, with the legacy reference pictures that follow). ${description}`, 240).forEach((piece, i) => node.dialogueBeats.push(mkBeat(null, { text: piece, silent: true, ...(i ? {} : bgFields(urls[0])) })));
        node.__montage = { urls, seconds, title: sceneName(scene) };
        lastBg = urls[urls.length - 1]; first = false; closeNode();
        continue;
      }
      for (const f of seg.frames) {
        const beats = frameBeats(f, readFrame(f), state);
        const clips = (f.audio || []).map(c => ({ ...c, effect: c.id.startsWith("sfx-") ? effectByFile.get(c.src) : null }));
        for (const c of clips) if (c.id.startsWith("sfx-") && !c.effect) throw new Error(`${c.id}: not a library effect (${c.src})`);
        const loops = clips.filter(c => c.effect?.loop), shots = clips.filter(c => c.effect && !c.effect.loop).sort((a, b) => a.offset - b.offset);
        const bedKey = [...new Set(loops.map(c => c.src))].sort().join("+");
        const bg = imageUrl(f.image);
        if (!beats.length) beats.push({ beat: mkBeat(null, { text: "·", silent: true }), t: 0 });
        // the node: a new one where the scene changes, the beds change or it has grown long
        // the beds of a node are the loops of its frames: a frame joins the node unless it brings a bed the node does not have (strictly: unless its beds differ)
        const srcs = [...new Set(loops.map(c => c.src))];
        const fits = current && current.scene === scene && (C.laxBeds ? (!current.beds.size || srcs.every(x => current.beds.has(x))) : current.key === bedKey);
        if (!fits || current.frames >= NODE_FRAMES) openNode(scene, { bg: first ? (bg ?? BLACK) : lastBg, key: bedKey });
        current.frames++;
        for (const c of loops) current.beds.set(c.src, [...(current.beds.get(c.src) ?? []), c.gain ?? 1]);
        // the picture: this shot's, else the one before it (black at the start of a scene)
        const picture = bg ?? (first ? BLACK : null);
        if (picture) { Object.assign(beats[0].beat, bgFields(picture, f.transition)); lastBg = picture; }
        first = false;
        // one-shot effects ride the beat nearest their time (the last whose time has come)
        const perBeat = new Map();
        for (const c of shots) {
          let at = 0;
          beats.forEach((b, i) => { if (b.t <= c.offset + 0.05) at = i; });
          if (!perBeat.has(at)) perBeat.set(at, []);
          perBeat.get(at).push({ src: c.src, delay: Math.max(0, round2(c.offset - beats[at].t)), gain: c.gain ?? 1 });
        }
        for (const [i, list] of perBeat) {
          if (list.length === 1 && list[0].delay < 0.05) Object.assign(beats[i].beat, { sfxUrl: takeUrl(list[0].src), sfxVolume: list[0].gain });
          else Object.assign(beats[i].beat, { sfxUrl: mixUrl(list), sfxVolume: 1 });
        }
        current.node.dialogueBeats.push(...beats.map(b => b.beat));
      }
    }
    closeNode();
  }
  sceneStats.push({ scene: scene.id, nodes: nodes.length - before, beats: beatNo - beatsBefore });
}

const endId = `${C.prefix}_end`;
nodes.push({
  id: endId, title: "End of what exists", isEnding: true, background: imageUrl(project.coverImage) ?? BLACK, prose: "", dialogueBeats: [], hotspots: [], choices: [],
  endingData: { tier: "victory-gold", headline: `${C.title.replace(/ \(work in progress\)$/, "").toUpperCase()} — WORK IN PROGRESS`, recap: "That is everything written, boarded and voiced so far." },
});

// a montage node follows each node that carries one; then link everything in a line: the last beat of each node hands over to the next on ▸ continue,
// montages advance on their own after their pictures have played
const flow = [];
for (const n of nodes) {
  flow.push(n);
  if (n.__montage) {
    const { urls, seconds, title } = n.__montage; delete n.__montage;
    flow.push({
      id: `${n.id}_boards`, title: `${title} (boards)`, nodeType: "credits", background: urls[0], prose: "", hideHud: true, letterbox: true,
      credits: { title: "", subtitle: "", lines: [], style: "cards", cardSeconds: 1, montage: urls, montageSeconds: seconds, montageTransition: "dissolve", montageLoop: false, gateWeave: "subtle" },
      musicMode: "none", transition: "fade-black", transitionSpeed: 0.8, dialogueBeats: [], hotspots: [], choices: [], __delay: urls.length * seconds,
    });
  }
}
flow.forEach((n, i) => {
  n.hotspots ??= []; n.noTypewriter = true; n.autoNarrate = false;
  if (n.isEnding) return;
  n.choices = [];
  const next = flow[i + 1].id;
  if (n.nodeType === "credits") { Object.assign(n, { autoAdvanceTargetSceneId: next, autoAdvanceDelaySeconds: n.__delay, autoAdvanceHideTimer: true }); delete n.__delay; }
  else Object.assign(n.dialogueBeats[n.dialogueBeats.length - 1], { afterBeatTargetSceneId: next, afterBeatMode: "continue" });
});

const layout = Object.fromEntries(flow.map((s, i) => [s.id, { x: 40 + (i % 12) * 380, y: 40 + Math.floor(i / 12) * 260 }]));
const story = {
  id: C.id, pulpPaper: false, title: C.title, tagline: C.tagline, gameKind: "vn", coverImage: imageUrl(project.coverImage) ?? BLACK, startSceneId: startId, layout,
  briefing: { gameInfo: `${project.title}, played as a graphic novel: the screenplay's scenes, the storyboard pictures, the recorded voices and the shared sound effects. A work in progress.`, objective: C.objective, winConditions: ["Reach the end of what exists."], loseConditions: [] },
  characters: [...characters.values()], items: [], scenes: flow,
};
writeFileSync(resolve(root, C.file),
  `// GENERATED by tools/build-playframe-reel.mjs ${C.name} from PlayFrame's ${C.project} — change the storyboard in PlayFrame or the tool, not this file.\nimport type { Story } from "../types";\n\nexport const ${C.export}: Story = ${JSON.stringify(story)} as unknown as Story;\n`);

// ---- report ----
const all = flow.flatMap(n => n.dialogueBeats ?? []);
const named = new Map([...characters.values()].map(c => [c.id, c.name]));
const narr = all.filter(b => named.get(b.characterId) === "Narrator").length, voiced = all.filter(b => b.audioUrl).length, sfx = all.filter(b => b.sfxUrl).length;
const chars = all.reduce((n, b) => n + (b.text || "").length, 0);
console.log(`${C.name}: ${flow.length} nodes, ${all.length} beats (${narr} narrator, ${all.length - narr} under a speaker's name, ${voiced} voiced, ${sfx} with an effect; ${chars} characters of text), ${characters.size} characters; ${images.size} pictures, ${takes.size} takes and effects, ${beds.size} beds, ${mixes.size} mixes`);
if (STATS) console.table(sceneStats);
for (const w of warnings.slice(0, 40)) console.log("  warning:", w);
if (warnings.length > 40) console.log(`  … ${warnings.length - 40} more warnings`);
