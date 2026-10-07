// Turns the Nobody's Witness film (src/film/story.json, imported from PlayFrame) into a Scarlet Reel story:
//   node tools/build-film-story.mjs
// Writes src/data/nobodysWitnessFilm.ts and copies the pictures, voices and music to public/film/.
// One SceneNode per film scene; every shot is a dialogue beat's replacement background, so the engine's own
// dialogue player, Studio flowchart and saves all work on it unchanged.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const src = process.env.FILM_SRC || resolve(root, "../nobodys-witness");
const film = JSON.parse(readFileSync(resolve(root, "src/film/story.json"), "utf8"));
const P = p => `/film${p}`;
for (const dir of ["img", "voice"]) mkdirSync(resolve(root, "public/film", dir), { recursive: true });
for (const dir of ["img", "voice"]) cpSync(resolve(src, "public", dir), resolve(root, "public/film", dir), { recursive: true });
mkdirSync(resolve(root, "public/film/audio"), { recursive: true });
for (const f of ["nobodys-witness.mp3", "midnight-in-the-rain.mp3", "bad-guy.mp3"]) cpSync(resolve(src, "public/audio/music", f), resolve(root, "public/film/audio", f));

const nice = s => s.toLowerCase().replace(/(^|[\s.-])([a-z])/g, (_, a, b) => a + b.toUpperCase());
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const characters = new Map([["narrator", { id: "nw_narrator", name: "Narrator", role: "The screenplay's stage directions" }]]);
const charOf = who => {
  if (!who) return "nw_narrator";
  const id = `nw_${slug(who)}`;
  if (!characters.has(who)) characters.set(who, { id, name: nice(who), role: "Nobody's Witness" });
  return id;
};

/** A line spoken as several takes becomes several beats, split at sentence ends in proportion to the takes' lengths. */
function splitLine(text, voice) {
  if (!voice?.length) return [{ text }];
  if (voice.length === 1) return [{ text, audioUrl: P(voice[0].src) }];
  const sentences = text.match(/[^.!?…]+[.!?…]+["”’)]*\s*|[^.!?…]+$/g)?.map(s => s.trim()).filter(Boolean) ?? [text];
  const total = voice.reduce((a, v) => a + v.dur, 0), chars = text.length;
  const out = voice.map(v => ({ text: "", audioUrl: P(v.src), want: (v.dur / total) * chars }));
  let i = 0, acc = 0;
  for (const s of sentences) { while (i < out.length - 1 && acc >= out.slice(0, i + 1).reduce((a, o) => a + o.want, 0) - s.length / 2) i++; out[i].text += (out[i].text ? " " : "") + s; acc += s.length; }
  return out.filter(o => o.text).map(({ text, audioUrl }) => ({ text, audioUrl }));
}

const SFX = { shot: "suppressed-shot", shot2: "shot2", train: "train", crossing: "crossing", clank: "clank", phone: "phone", chime: "shop-chime", car: "car-pass" };
// Recorded atmosphere: copy the loops from the visual novel and pick one per scene from its slugline (same rule as the VN's beds.ts).
mkdirSync(resolve(root, "public/film/sfx"), { recursive: true });
for (const f of ["amb-city-traffic", "amb-room-tone", "amb-hive", "amb-bar", "amb-vending", "amb-office", "car-pass"]) {
  const from = resolve(src, "public/audio/sfx", `${f}.mp3`);
  if (existsSync(from)) cpSync(from, resolve(root, "public/film/sfx", `${f}.mp3`));
}
// Talking shots: a lip-synced clip stands in for the still while the line is spoken (the clip carries no sound), then the still returns.
const CLIPS = existsSync(resolve(src, "src/story/clips.ts"))
  ? Object.fromEntries([...readFileSync(resolve(src, "src/story/clips.ts"), "utf8").matchAll(/"(\/voice\/[^"]+)":\s*"(\/video\/[^"]+)"/g)].map(m => [m[1], m[2]]))
  : {};
mkdirSync(resolve(root, "public/film/video"), { recursive: true });
for (const v of Object.values(CLIPS)) if (existsSync(resolve(src, "public", v.slice(1)))) cpSync(resolve(src, "public", v.slice(1)), resolve(root, "public/film", v.slice(1)));
const bedFor = sc => {
  const h = `${sc.heading} ${sc.place}`.toUpperCase();
  if (/HIVE|STOREROOM|PASSAGES|THROUGH THE ROOMS|KANEKO/.test(h)) return "hive";
  if (/APARTMENT|MARA'S|VERA'S|HOME/.test(h) && !sc.exterior) return "room-tone";
  if (/OFFICE/.test(h)) return "office";
  if (/\bBAR\b/.test(h) && !sc.exterior) return "bar";
  if (sc.exterior && /BACKSTREET|VENDING|ALLEY|LANE/.test(h)) return "vending";
  if (sc.exterior) return "city-traffic";
  return null;
};
// Director: indoors (INT. and not EXT.) there is no rain, neither the sound nor the falling particles.
const indoors = sc => /^\s*INT\b/i.test(sc.heading) && !/EXT/i.test(sc.heading);
const ambientOf = sc => {
  const bed = bedFor(sc);
  const have = bed && existsSync(resolve(root, "public/film/sfx", `amb-${bed}.mp3`));
  return [sc.rain > 0 && !indoors(sc) ? "rain" : "", have ? `file:${P(`/sfx/amb-${bed}.mp3`)}` : ""].filter(Boolean).join("+");
};
let beatNo = 0;
const hash = str => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
const FOCI = ["50% 45%", "35% 50%", "65% 50%", "50% 60%", "42% 38%", "60% 42%"];
/** A slow, varied camera for every shot: pushes, drifts and the odd dolly, graded for rain-city night. */
const camera = (src, held) => {
  const h = Math.abs(hash(src));
  const mode = held ? "zoom-hold" : ["zoom-hold", "zoom-hold", "pan", "dolly"][h % 4];
  return { mode, focalPoint: FOCI[h % FOCI.length], zoomDuration: 14 + (h % 9), panDirection: h % 2 ? "left" : "right", panDistance: 2, dollyDirection: h % 2 ? "left" : "right", dollyDistance: 3, dollyDuration: 24, colorGrade: "neon-noir", filmGrade: true, filmGradeStrength: 0.3 };
};
const bgFields = (bg, extra = {}) => bg.startsWith("gradient:")
  ? { background: bg, backgroundTransition: "fade-black", backgroundTransitionSpeed: 0.8, ...extra }
  : { background: bg, cinematic: camera(bg), backgroundTransition: "crossfade", backgroundTransitionSpeed: 0.9, ...extra };
let carry = null;
const beat = (who, fields) => { const b = { id: `nw_b${++beatNo}`, characterId: charOf(who), ...fields }; if (carry) { b.sfxUrl = carry; carry = null; } return b; };
const scenes = [];
const first = film.scenes[0];

// the prologue: Kaneko, over the Hive at night
const PRO = [
  ["This is how I remember it.", "hive1"],
  ["After the war they raised a block beside the railway, to house the factories. The factories closed. We stayed.", "hive2"],
  ["We built upward. A room for a daughter. A shop for a brother. A stair, a pipe, a balcony bolted onto a balcony. Sixty years, until nobody could say where the factory ended and we began.", "hive3"],
  ["The city grew up around us, and forgot we were here. That was all right. We were busy.", "hive4"],
  ["Now the land is worth more than we are. Everything is going. We are just slower.", "hive5"],
];
// the opening titles: a credits node over a montage, the theme tune under it
const keyStills = ["/img/s1/377-the-hive-remembered.jpg", "/img/s14a/337-engine-off.jpg", "/img/s1/10-the-shot.jpg", "/img/s2/21-mara-bursts-in.jpg"].filter(f => existsSync(resolve(root, "public/film", f.slice(1))));
scenes.push({
  id: "nw_title", title: "Opening titles", nodeType: "credits", background: P(keyStills[0]),
  prose: "Nobody's Witness\nAn interactive visual novel",
  credits: { title: "Nobody's Witness", subtitle: "An interactive visual novel", lines: [{ role: "A film of", name: "Tokyo in the rain" }, { role: "Starring", name: "Jack · Vera · Mara" }], font: "type", style: "cards", cardSeconds: 3.8, cardMotion: "letterspace", montage: keyStills.map(P), montageSeconds: 4.5, montageTransition: "dissolve", montageLoop: true, titleColor: "#eceae4", accentColor: "#e8a24a", titleEntrance: "fade-up", gateWeave: "subtle" },
  musicMode: "track", musicUrl: P("/audio/nobodys-witness.mp3"), musicFadeSeconds: 2, ambientAudio: "", transition: "fade-black", transitionSpeed: 1.5,
  dialogueBeats: [], hotspots: [], choices: [],
});
scenes.push({
  id: "nw_prologue", title: "Prologue — The Hive, remembered", background: P("/img/s1/377-the-hive-remembered.jpg"),
  particles: "rain", particleConfig: { density: 0.8, opacity: 0.5 }, hideHud: true, letterbox: true, transition: "fade-black", transitionSpeed: 2.2,
  cinematic: { mode: "zoom-hold", focalPoint: "50% 52%", zoomDuration: 60, colorGrade: "neon-noir", filmGrade: true, filmGradeStrength: 0.3 },
  prose: "Night. Rain. A nine-storey block of balconies and wires wedged between glass towers.", ambientAudio: "rain", musicMode: "none", musicFadeSeconds: 3,
  dialogueBeats: PRO.map(([text, k]) => beat("KANEKO", { text, audioUrl: P(`/voice/prologue/${k}.mp3`) })),
});

const MUSIC = { song: "bad-guy", midnight: "midnight-in-the-rain" };
const lookOf = sc => ({
  ambientAudio: ambientOf(sc),
  particles: indoors(sc) ? "motes" : sc.exterior && sc.rain > 0.4 ? "rain" : sc.rain > 0 ? "drizzle" : "motes", particleConfig: { density: sc.exterior ? 0.9 : 0.35, opacity: 0.55 },
  hideHud: true, letterbox: true,
});
film.scenes.forEach((sc, si) => {
  let beats = [];
  let pendingBg = null, caption = null, bg0 = null, lastBg = null, part = 0;
  let music = null;   // scene-level music for the node being built
  const close = () => {
    scenes.push({
      id: `nw_s${sc.id}${part ? `_${"abcdefgh"[part]}` : ""}`.toLowerCase(), title: `${sc.n} — ${sc.title}${part ? " (cont.)" : ""}`,
      background: (part ? lastBg : bg0) ?? "gradient:linear-gradient(#000,#000)", prose: part ? "" : `${sc.heading}`, ...lookOf(sc),
      transition: part ? "cut" : "fade-black", transitionSpeed: part ? 0.2 : 1.1, ...(music ?? {}), dialogueBeats: beats,
    });
    beats = []; part++; music = null;
  };
  for (const st of sc.steps) {
    if (st.t === "bg") { pendingBg = P(st.src); bg0 ??= pendingBg; lastBg = pendingBg; }
    else if (st.t === "insert") caption = st.text;
    else if (st.t === "sfx") carry = SFX[st.id] ? P(`/sfx/${SFX[st.id]}.mp3`) : carry;
    else if (st.t === "music") {
      // music is per scene node in this engine: a cue part-way through a scene starts a continuation node
      const cue = st.id === "off" ? { musicMode: "none", musicFadeSeconds: 4 } : { musicMode: "track", musicUrl: P(`/audio/${MUSIC[st.id] ?? "midnight-in-the-rain"}.mp3`), musicFadeSeconds: 5 };
      if (beats.length) { const carried = pendingBg; close(); pendingBg = carried; }
      music = cue;
    }
    else if (st.t === "black") { pendingBg = "gradient:linear-gradient(#000,#000)"; lastBg = pendingBg; }
    else if (st.t === "card") beats.push(beat(null, { text: st.text.toUpperCase(), silent: true, ...(pendingBg ? bgFields(pendingBg) : {}) })), (pendingBg = null);
    else if (st.t === "text" || st.t === "line") {
      const pieces = st.t === "line" ? splitLine(st.text, st.voice) : [{ text: st.text }];
      pieces.forEach((p, pi) => {
        const f = { text: p.text };
        if (p.audioUrl) f.audioUrl = p.audioUrl; else if (st.t === "text") f.silent = true;
        if (st.t === "line" && st.note && pi === 0) f.expression = st.note;
        const clip = st.t === "line" && p.audioUrl && CLIPS[p.audioUrl.replace(/^\/film/, "")];
        if (clip) {
          // the video replaces the picture for this line; the next beat puts the still back
          const still = pendingBg ?? lastBg;
          Object.assign(f, { background: `video:${P(clip)}`, cinematic: camera(still ?? clip), backgroundTransition: "crossfade", backgroundTransitionSpeed: 0.6 });
          pendingBg = still;
        } else if (pi === 0 && pendingBg) { Object.assign(f, bgFields(pendingBg)); pendingBg = null; }
        if (pi === 0 && caption && st.t === "text") { f.text = `${caption}\n\n${f.text}`; caption = null; }
        beats.push(beat(st.t === "line" ? st.who : null, f));
      });
    }
  }
  // a shot with no words still gets its moment
  if (pendingBg) beats.push(beat(null, { text: "·", silent: true, ...bgFields(pendingBg) }));
  close();
});
// link everything in a line, finishing on the credits ending
const cast = [...characters.values()].filter(c => c.id !== "nw_narrator").map(c => c.name);
const stills = film.scenes.flatMap(sc => sc.steps.filter(st => st.t === "bg").map(st => st.src));
const montage = Array.from({ length: 14 }, (_, i) => P(stills[Math.floor((i / 14) * stills.length)]));
const creditLines = [
  ...cast.map((name, i) => ({ role: "Cast", name })),
  { role: "Voices", name: "Synthesised with ElevenLabs" },
  { role: "Pictures", name: "Storyboarded in PlayFrame · generated with AI image tools" },
  { role: "Music", name: "“Nobody’s Witness” — Phoney Refuge mashup, echoingbongos756" },
  { role: "Engine", name: "Scarlet Reel" },
];
scenes.push({
  id: "nw_credits", title: "Credits", nodeType: "credits", background: P("/img/s1/377-the-hive-remembered.jpg"),
  prose: "Nobody's Witness\nTokyo as a memory that is still happening.",
  credits: { title: "Nobody's Witness", subtitle: "Tokyo as a memory that is still happening.", lines: creditLines, font: "elegant", style: "cards", cardSeconds: 3.2, cardMotion: "fade", montage, montageSeconds: 7.5, montageTransition: "dissolve", montageLoop: true, titleColor: "#e9e2d0", accentColor: "#e8a24a", titleEntrance: "fade-up", gateWeave: "subtle" },
  musicMode: "track", musicUrl: P("/audio/nobodys-witness.mp3"), musicFadeSeconds: 4, ambientAudio: "", transition: "fade-black", transitionSpeed: 2,
  dialogueBeats: [], hotspots: [], choices: [], choiceDelaySeconds: 100,
});
scenes.push({
  id: "nw_end", title: "The end", isEnding: true, background: P("/img/s1/377-the-hive-remembered.jpg"), prose: "Tokyo as a memory that is still happening.",
  dialogueBeats: [], hotspots: [], choices: [],
  endingData: { tier: "victory-gold", headline: "NOBODY'S WITNESS", recap: "Tokyo as a memory that is still happening." },
});
scenes.forEach((s, i) => {
  s.hotspots ??= [];
  if (!s.isEnding) {
    s.choices = [];
    Object.assign(s, { autoAdvanceTargetSceneId: scenes[i + 1].id, autoAdvanceDelaySeconds: s.id === "nw_credits" ? 108 : s.id === "nw_title" ? 22 : 1.5, autoAdvanceHideTimer: true });
  }
});

// Edits made in the Studio and kept in src/film/studio-edits.json (the title design and song, the music for scenes 1 and 3):
// applied over the generated scenes so a rebuild does not lose them. A null value removes the field.
const editsFile = resolve(root, "src/film/studio-edits.json");
if (existsSync(editsFile)) {
  const edits = JSON.parse(readFileSync(editsFile, "utf8")).scenes ?? {};
  for (const [id, fields] of Object.entries(edits)) {
    const sc = scenes.find(x => x.id === id);
    if (!sc) { console.warn(`studio-edits: no scene ${id}`); continue; }
    for (const [k, v] of Object.entries(fields)) { if (v === null) delete sc[k]; else sc[k] = v; }
  }
}

const layout = Object.fromEntries(scenes.map((s, i) => [s.id, { x: 40 + (i % 12) * 380, y: 40 + Math.floor(i / 12) * 260 }]));
const story = {
  id: "nobodys-witness-film", pulpPaper: false, title: "Nobody's Witness", tagline: "Tokyo as a memory that is still happening.", gameKind: "vn",
  coverImage: P("/img/s14a/337-engine-off.jpg"), startSceneId: scenes[0].id, layout,
  briefing: { gameInfo: "The film, played as a graphic novel: the screenplay's scenes, the storyboard pictures and the recorded voices.", objective: "Watch it through.", winConditions: ["Reach the credits."], loseConditions: [] },
  characters: [...characters.values()].map(c => ({ ...c, avatarUrl: "", trustMeter: 0 })), items: [], scenes,
};
writeFileSync(resolve(root, "src/data/nobodysWitnessFilm.ts"),
  `// GENERATED by tools/build-film-story.mjs from the Nobody's Witness film data — edit the screenplay or the tool, not this file.\nimport type { Story } from "../types";\n\nexport const NOBODYS_WITNESS_FILM: Story = ${JSON.stringify(story, null, 1)} as unknown as Story;\n`);
console.log(`${scenes.length} scenes, ${beatNo} beats, ${characters.size} characters`);
