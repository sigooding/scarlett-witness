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
for (const f of ["nobodys-witness.mp3", "midnight-in-the-rain.mp3", "bad-guy.mp3", "soundtrack_nobodys_witness.mp3"]) cpSync(resolve(src, "public/audio/music", f), resolve(root, "public/film/audio", f));

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
const voiceDur = new Map();   // a take's URL → its length in seconds (the soundtrack segments below time their chains by it)
function splitLine(text, voice) {
  if (!voice?.length) return [{ text }];
  for (const v of voice) voiceDur.set(P(v.src), v.dur);
  if (voice.length === 1) return [{ text, audioUrl: P(voice[0].src) }];
  const sentences = text.match(/[^.!?…]+[.!?…]+["”’)]*\s*|[^.!?…]+$/g)?.map(s => s.trim()).filter(Boolean) ?? [text];
  const total = voice.reduce((a, v) => a + v.dur, 0), chars = text.length;
  const out = voice.map(v => ({ text: "", audioUrl: P(v.src), want: (v.dur / total) * chars }));
  let i = 0, acc = 0;
  for (const s of sentences) { while (i < out.length - 1 && acc >= out.slice(0, i + 1).reduce((a, o) => a + o.want, 0) - s.length / 2) i++; out[i].text += (out[i].text ? " " : "") + s; acc += s.length; }
  return out.filter(o => o.text).map(({ text, audioUrl }) => ({ text, audioUrl }));
}

// Body falls (8 October 2026, generated in ElevenLabs): "shot2" is the two shots with the journalist coming off his stool a second later
// (shot2.mp3 + the bar fall, mixed once with ffmpeg), "fall-street" the old man in scene 1, "fall-door" Mara through the Hive door in scene 70.
const SFX = { shot: "suppressed-shot", shot2: "shot2-fall", "fall-street": "body-fall-street", "fall-door": "body-fall-doorway", train: "train", crossing: "crossing", clank: "clank", phone: "phone", chime: "shop-chime", car: "car-pass" };
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
// Per-picture looks (src/film/studio-edits.json "pictureLook", keyed by the picture's file name without extension): camera and lens
// effects that belong to one shot (a handheld shake on a gunshot, rain on the lens in a parked car, a flare off headlights) and,
// optionally, the cut into it ("backgroundTransition": "zoom" punches in, "burn" flashes, "glitch" jolts). Merged over the slow
// default camera wherever that picture is shown, so the Studio sees and can change them like any other beat's camera.
const pictureLook = (() => { try { return JSON.parse(readFileSync(resolve(root, "src/film/studio-edits.json"), "utf8")).pictureLook ?? {}; } catch { return {}; } })();
const lookFor = bg => pictureLook[bg.replace(/^.*\//, "").replace(/\.[a-z0-9]+$/i, "")];
const bgFields = (bg, extra = {}) => {
  if (bg.startsWith("gradient:")) return { background: bg, backgroundTransition: "fade-black", backgroundTransitionSpeed: 0.8, ...extra };
  const { cinematic, ...cut } = lookFor(bg) ?? {};
  return { background: bg, cinematic: { ...camera(bg), ...(cinematic ?? {}) }, backgroundTransition: "crossfade", backgroundTransitionSpeed: 0.9, ...cut, ...extra };
};
let carry = null;
/** Sentence-aware chunks of at most `max` characters (a single longer sentence stays whole). */
const chunkText = (text, max = 140) => {
  if (text.length <= max) return [text];
  const sentences = text.split(/(?<=[.!?…]["”')]?)\s+/);
  const out = [];
  for (const sent of sentences) {
    if (out.length && out[out.length - 1].length + 1 + sent.length <= max) out[out.length - 1] += " " + sent;
    else out.push(sent);
  }
  return out;
};
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
  credits: { title: "Nobody's Witness", subtitle: "An interactive visual novel", lines: [{ role: "A film of", name: "Tokyo in the rain" }, { role: "Written by", name: "Scott Gooding" }, { role: "Starring", name: "Jack · Vera · Mara" }, { role: "Music", name: "Scott Gooding · enhanced with suno.ai" }], font: "type", style: "cards", cardSeconds: 3.8, cardMotion: "letterspace", montage: keyStills.map(P), montageSeconds: 4.5, montageTransition: "dissolve", montageLoop: true, titleColor: "#eceae4", accentColor: "#e8a24a", titleEntrance: "fade-up", gateWeave: "subtle" },
  musicMode: "track", musicUrl: P("/audio/nobodys-witness.mp3"), musicFadeSeconds: 2, musicLoop: false, ambientAudio: "", transition: "fade-black", transitionSpeed: 1.5,
  dialogueBeats: [], hotspots: [], choices: [],
});
scenes.push({
  id: "nw_prologue", title: "Prologue — The Hive, remembered", background: P("/img/s1/377-the-hive-remembered.jpg"),
  particles: "rain", particleConfig: { density: 0.8, opacity: 0.5 }, hideHud: true, letterbox: true, transition: "fade-black", transitionSpeed: 2.2,
  // Its backdrop takes the picture's look (studio-edits "pictureLook") like any beat's picture, its depth move with it.
  cinematic: { mode: "zoom-hold", focalPoint: "50% 52%", zoomDuration: 60, colorGrade: "neon-noir", filmGrade: true, filmGradeStrength: 0.3, ...(lookFor("/img/s1/377-the-hive-remembered.jpg")?.cinematic ?? {}) },
  prose: "Night. Rain. An eleven-storey block of balconies and wires wedged between glass towers.", ambientAudio: "rain", musicMode: "none", musicFadeSeconds: 3,
  dialogueBeats: PRO.map(([text, k]) => beat("KANEKO", { text, audioUrl: P(`/voice/prologue/${k}.mp3`) })),
});

const MUSIC = { song: "bad-guy", midnight: "midnight-in-the-rain", radio: "soundtrack_nobodys_witness" };
// The neighbour's radio through Vera's wall (65) plays the director's song: in quickly, as a radio starts, and under the score's level.
const CUE_FIELDS = { radio: { musicFadeSeconds: 2, musicLevel: 0.6 } };
const lookOf = sc => ({
  ambientAudio: ambientOf(sc),
  particles: indoors(sc) ? "motes" : sc.exterior && sc.rain > 0.4 ? "rain" : sc.rain > 0 ? "drizzle" : "motes", particleConfig: { density: sc.exterior ? 0.9 : 0.35, opacity: 0.55 },
  hideHud: true, letterbox: true,
});
// Pictures waiting for words. Several shots can share one paragraph of the screenplay (the visual novel holds each for 2.2 s); the film
// gives each its own words instead of letting the last one win: a paragraph is cut where the next shot's quoted beat begins (PlayFrame's
// boards quote the words each shot covers; the visual novel's importer passes them on), a spoken line's takes are shared out between the
// pictures whose beat it is, and a picture left with no words of its own gets a short caption (studio-edits "pictureCaptions", else its
// title). No shot is skipped.
const pictureCaptions = (() => { try { return JSON.parse(readFileSync(resolve(root, "src/film/studio-edits.json"), "utf8")).pictureCaptions ?? {}; } catch { return {}; } })();
const normal = text => text.replace(/\s+/g, " ").trim();
const baseOf = path => path.replace(/^.*\//, "").replace(/\.[a-z0-9]+$/i, "");
const findQuote = (text, quote) => {
  if (!quote) return null;
  for (const q of [normal(quote), normal(quote.replace(/\([^)]*\)/g, " "))]) {
    const at = q ? text.indexOf(q) : -1;
    if (at >= 0) return [at, at + q.length];
  }
  return null;
};
const sentencesOf = text => text.match(/[^.!?…]+[.!?…]+["”’')]*\s*|[^.!?…]+$/g)?.map(x => x.trim()).filter(Boolean) ?? [text];
/** Share a paragraph between the waiting pictures, in order: [{ pic, text }]; pic null keeps the picture already showing, text "" means a caption. */
function shareText(text, pics) {
  const T = normal(text);
  if (pics.length <= 1) return [{ pic: pics[0] ?? null, text: T }];
  const spans = pics.map(pic => findQuote(T, pic.quote));
  // a picture's words begin at its quote, or, when its quote runs on past the end of the one before, where that one ends
  const starts = spans.map((span, i) => !span ? -1 : i && spans[i - 1] && span[0] < spans[i - 1][1] && span[1] > spans[i - 1][1] ? spans[i - 1][1] : span[0]);
  const groups = [];
  let last = -1;
  pics.forEach((pic, i) => {
    if (starts[i] > last) {
      if (!groups.length && starts[i] > 0) groups.push({ start: 0, pics: [] });
      groups.push({ start: starts[i], pics: [pic] }); last = starts[i];
    } else if (groups.length) groups.at(-1).pics.push(pic);
    else { groups.push({ start: 0, pics: [pic] }); last = 0; }
  });
  return groups.flatMap((group, g) => {
    const words = T.slice(group.start, groups[g + 1]?.start ?? T.length).trim();
    if (!group.pics.length) return words ? [{ pic: null, text: words }] : [];
    // pictures that share one beat share its sentences, as evenly as they go; any left over get a caption
    const sentences = sentencesOf(words), n = Math.min(group.pics.length, sentences.length);
    return group.pics.map((pic, k) => {
      if (k >= n) return { pic, text: "" };
      const from = Math.round((k * sentences.length) / n), to = Math.round(((k + 1) * sentences.length) / n);
      return { pic, text: sentences.slice(from, to).join(" ") };
    });
  });
}
const captionFor = pic => pictureCaptions[pic.base] ?? pic.title ?? "·";
const captionBeat = pic => beat(null, { text: captionFor(pic), silent: true, ...bgFields(pic.bg) });
film.scenes.forEach((sc, si) => {
  let beats = [];
  let pend = [], caption = null, bg0 = null, lastBg = null, part = 0;
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
    if (st.t === "bg") { const bg = P(st.src); pend.push({ bg, quote: st.quote, title: st.title, base: baseOf(st.src) }); bg0 ??= bg; lastBg = bg; }
    else if (st.t === "insert") caption = st.text;
    else if (st.t === "sfx") carry = SFX[st.id] ? P(`/sfx/${SFX[st.id]}.mp3`) : carry;
    else if (st.t === "music") {
      // music is per scene node in this engine: a cue part-way through a scene starts a continuation node (the waiting pictures carry over)
      const cue = st.id === "off" ? { musicMode: "none", musicFadeSeconds: 4 } : { musicMode: "track", musicUrl: P(`/audio/${MUSIC[st.id] ?? "midnight-in-the-rain"}.mp3`), musicFadeSeconds: 5, musicLoop: false, ...CUE_FIELDS[st.id] };
      if (beats.length) close();
      music = cue;
    }
    else if (st.t === "black") { for (const pic of pend.splice(0)) beats.push(captionBeat(pic)); pend.push({ bg: "gradient:linear-gradient(#000,#000)" }); lastBg = pend[0].bg; }
    else if (st.t === "card") {
      if (pend.length > 1) pend = pend.filter(pic => !pic.restore);
      while (pend.length > 1) beats.push(captionBeat(pend.shift()));
      beats.push(beat(null, { text: st.text.toUpperCase(), silent: true, ...(pend.length ? bgFields(pend.shift().bg) : {}) }));
    }
    else if (st.t === "text" || st.t === "line") {
      // Silent narration is cut at sentence ends into pieces of at most ~140 characters, so a long action paragraph never fills the screen
      // (a recorded line stays whole: its take is one file).
      // A line spoken in another language shows its English subtitle after the words ("Shitsurei shimasu. (Excuse me.)"); the visual novel
      // keeps it on its own line under the words, a beat has only the one.
      let parts, extra = [];
      if (pend.length > 1) pend = pend.filter(pic => !pic.restore);   // a new shot makes putting the still back moot
      if (st.t === "line") {
        const pieces = splitLine(st.sub ? `${st.text} (${st.sub})` : st.text, st.voice);
        const mine = pend.length ? [pend.shift()] : [];
        while (pend.length && findQuote(normal(st.text), pend[0].quote)) mine.push(pend.shift());
        parts = pieces.map((piece, i) => ({ ...piece, pic: mine[i] ?? null }));
        extra = mine.slice(pieces.length);
      } else {
        parts = shareText(st.text, pend.splice(0)).flatMap(seg => seg.text
          ? chunkText(seg.text).map((text, k) => ({ text, pic: k ? null : seg.pic }))
          : [{ text: "", pic: seg.pic, captionOnly: true }]);
      }
      parts.forEach((p, pi) => {
        if (p.captionOnly) { beats.push(captionBeat(p.pic)); return; }
        const f = { text: p.text };
        if (p.audioUrl) f.audioUrl = p.audioUrl; else if (st.t === "text") f.silent = true;
        if (st.t === "line" && st.note && pi === 0) f.expression = st.note;
        const clip = st.t === "line" && p.audioUrl && CLIPS[p.audioUrl.replace(/^\/film/, "")];
        if (clip) {
          // the video replaces the picture for this line; the next beat puts the still back
          const still = p.pic ?? { bg: lastBg };
          Object.assign(f, { background: `video:${P(clip)}`, cinematic: camera(still.bg ?? clip), backgroundTransition: "crossfade", backgroundTransitionSpeed: 0.6 });
          if (still.bg) pend.unshift({ ...still, restore: true });
        } else if (p.pic) Object.assign(f, bgFields(p.pic.bg));
        if (pi === 0 && caption && st.t === "text") { f.text = `${caption}\n\n${f.text}`; caption = null; }
        beats.push(beat(st.t === "line" ? st.who : null, f));
      });
      for (const pic of extra) beats.push(captionBeat(pic));
    }
  }
  // a shot with no words still gets its moment (a closing CUT TO BLACK needs none: the next scene fades in through black)
  for (const pic of pend.splice(0)) if (!pic.restore && !pic.bg.startsWith("gradient:")) beats.push(captionBeat(pic));
  close();
});
// link everything in a line, finishing on the credits ending
const cast = [...characters.values()].filter(c => c.id !== "nw_narrator").map(c => c.name);
const stills = film.scenes.flatMap(sc => sc.steps.filter(st => st.t === "bg").map(st => st.src));
const montage = Array.from({ length: 14 }, (_, i) => P(stills[Math.floor((i / 14) * stills.length)]));
const creditLines = [
  { role: "Written by", name: "Scott Gooding" },
  ...cast.map((name, i) => ({ role: "Cast", name })),
  { role: "Voices", name: "Synthesised with ElevenLabs" },
  { role: "Pictures", name: "Storyboarded in PlayFrame · generated with AI image tools" },
  { role: "Music", name: "All music written by Scott Gooding · enhanced with suno.ai" },
  { role: "Engine", name: "Scarlet Reel" },
];
scenes.push({
  id: "nw_credits", title: "Credits", nodeType: "credits", background: P("/img/s1/377-the-hive-remembered.jpg"),
  prose: "Nobody's Witness\nTokyo as a memory that is still happening.",
  credits: { title: "Nobody's Witness", subtitle: "Tokyo as a memory that is still happening.", lines: creditLines, font: "elegant", style: "cards", cardSeconds: 3.2, cardMotion: "fade", montage, montageSeconds: 7.5, montageTransition: "dissolve", montageLoop: true, titleColor: "#e9e2d0", accentColor: "#e8a24a", titleEntrance: "fade-up", gateWeave: "subtle" },
  musicMode: "track", musicUrl: P("/audio/nobodys-witness.mp3"), musicFadeSeconds: 4, ambientAudio: "", transition: "fade-black", transitionSpeed: 2,
  dialogueBeats: [], hotspots: [], choices: [],
});
scenes.push({
  id: "nw_end", title: "The end", isEnding: true, background: P("/img/s1/377-the-hive-remembered.jpg"), prose: "Tokyo as a memory that is still happening.",
  dialogueBeats: [], hotspots: [], choices: [],
  endingData: { tier: "victory-gold", headline: "NOBODY'S WITNESS", recap: "Tokyo as a memory that is still happening." },
});
// Montage scenes (src/film/studio-edits.json "montages"): a run of stills over a track, auto-cycling, inserted after a scene or
// part-way through one (the scene is split after `afterBeat`, 1-based, and its remaining beats play after the montage).
const editsFile = resolve(root, "src/film/studio-edits.json");
const edits = existsSync(editsFile) ? JSON.parse(readFileSync(editsFile, "utf8")) : {};
for (const m of edits.montages ?? []) {
  const at = scenes.findIndex(x => x.id === m.after);
  if (at < 0) { console.warn(`montage ${m.id}: no scene ${m.after}`); continue; }
  const host = scenes[at];
  const montage = {
    id: m.id, title: m.title, nodeType: "credits", background: P(m.images[0]), prose: "", hideHud: true, letterbox: true,
    credits: { title: "", subtitle: "", lines: [], style: "cards", cardSeconds: 1, montage: m.images.map(P), montageSeconds: m.seconds ?? 5, montageTransition: "dissolve", montageLoop: false, gateWeave: "subtle" },
    musicMode: "track", musicUrl: P(m.musicUrl), musicLevel: m.musicLevel ?? 0.6, musicFadeSeconds: m.musicFadeSeconds ?? 2, transition: "fade-black", transitionSpeed: 1.2,
    dialogueBeats: [], hotspots: [], choices: [],
  };
  const fresh = [montage];
  if (m.afterBeat) {
    const rest = host.dialogueBeats.splice(m.afterBeat);
    const lastBg = [...host.dialogueBeats].reverse().find(b => b.background)?.background ?? host.background;
    const { id: _id, title: _t, dialogueBeats: _b, ...look } = host;
    fresh.push({ ...look, id: `${host.id}_b`, title: `${host.title} (cont.)`, background: lastBg, prose: "", transition: "cut", transitionSpeed: 0.2, musicMode: "none", musicFadeSeconds: 3, dialogueBeats: rest });
  }
  scenes.splice(at + 1, 0, ...fresh);
}
scenes.forEach((s, i) => {
  s.hotspots ??= [];
  s.noTypewriter = true;   // the recorded voice sets the pace; the words are simply there
  s.autoNarrate = false;   // no text-to-speech reading of the scene prose (Studio → Audio → Narration); the recorded voices are the beats
  if (!s.isEnding) {
    s.choices = [];
    if (s.dialogueBeats.length) {
      // "After this beat — cut to scene": the last beat hands over to the next scene, so the scene's own background never shows between them
      Object.assign(s.dialogueBeats[s.dialogueBeats.length - 1], { afterBeatTargetSceneId: scenes[i + 1].id, afterBeatMode: "auto", afterBeatDelaySeconds: 1 });
    } else {
      // the opening titles and the end credits are timed by their own roll (a Studio edit may stretch the titles to their song);
      // a montage runs its stills once; anything else moves straight on
      const timed = s.id === "nw_credits" || s.id === "nw_title" ? {} : { autoAdvanceDelaySeconds: s.credits?.montage ? s.credits.montage.length * s.credits.montageSeconds : 1.5 };
      Object.assign(s, { autoAdvanceTargetSceneId: scenes[i + 1].id, ...timed, autoAdvanceHideTimer: true });
    }
  }
});

let startSceneId = scenes[0].id;
let dialogueBox;
// Edits made in the Studio and kept in src/film/studio-edits.json (the title design and song, the music for scenes 1 and 3, the running order):
// applied over the generated scenes so a rebuild does not lose them. A null value removes the field.
if (existsSync(editsFile)) {
  const file = edits;
  const set = (o, fields) => { for (const [k, v] of Object.entries(fields)) { if (v === null) delete o[k]; else o[k] = v; } };
  for (const [id, fields] of Object.entries(file.scenes ?? {})) {
    const sc = scenes.find(x => x.id === id);
    if (!sc) { console.warn(`studio-edits: no scene ${id}`); continue; }
    set(sc, fields);
  }
  // A montage (the opening titles, 18, 53) shows its own stills instead of the scene's picture: each still with a depth map
  // (its "pictureLook", or the scene's own camera for the scene's own picture) gets the depth camera there too.
  for (const sc of scenes) {
    const stills = sc.credits?.montage;
    if (!stills?.length) continue;
    const looks = {};
    for (const url of stills) {
      const cin = (url === sc.background && sc.cinematic?.depthMap ? sc.cinematic : null) ?? lookFor(url)?.cinematic;
      if (cin?.depthMap) looks[url] = cin;
    }
    if (Object.keys(looks).length) sc.credits.montageLooks = looks;
    else delete sc.credits.montageLooks;
  }
  // dropBeats: { sceneId: [1-based beat numbers] } — beats taken out in the Studio (unwanted title cards)
  for (const [id, nums] of Object.entries(file.dropBeats ?? {})) {
    const sc = scenes.find(x => x.id === id);
    // numbers are 1-based beat positions; strings are the beat's exact text (stable when long narration is split)
    if (sc) sc.dialogueBeats = sc.dialogueBeats.filter((b, k) => !nums.includes(k + 1) && !nums.includes(b.text));
  }
  // beats: { sceneId: { last: {...fields} } } — the scene's last beat ("After this beat — cut to scene")
  for (const [id, byBeat] of Object.entries(file.beats ?? {})) {
    const sc = scenes.find(x => x.id === id);
    if (!sc?.dialogueBeats?.length) { console.warn(`studio-edits: no beats in ${id}`); continue; }
    if (byBeat.last) set(sc.dialogueBeats[sc.dialogueBeats.length - 1], byBeat.last);
  }
  // ambientAdd: { sceneId: [loop names in public/film/sfx] } — recorded loops layered under the scene's atmosphere
  for (const [id, names] of Object.entries(file.ambientAdd ?? {})) {
    const sc = scenes.find(x => x.id === id);
    if (!sc) { console.warn(`studio-edits: no scene ${id}`); continue; }
    sc.ambientAudio = [sc.ambientAudio, ...names.map(n => `file:${P(`/sfx/${n}.mp3`)}`)].filter(Boolean).join("+");
  }
  // sfx: [{ scene, find, file, volume }] — a one-shot on the beat whose text contains `find` (the scene's later parts included)
  for (const e of file.sfx ?? []) {
    const beat = scenes.filter(x => x.id === e.scene || x.id.startsWith(`${e.scene}_`)).flatMap(x => x.dialogueBeats).find(b => b.text?.includes(e.find));
    if (!beat) { console.warn(`studio-edits: no beat in ${e.scene} containing "${e.find}"`); continue; }
    if (beat.sfxUrl) console.warn(`studio-edits: ${e.scene} "${e.find}" already had ${beat.sfxUrl}`);
    Object.assign(beat, { sfxUrl: P(`/sfx/${e.file}.mp3`), sfxVolume: e.volume ?? 0.7 });
  }
  if (file.startSceneId) startSceneId = file.startSceneId;
  // dialogueBox: the story-wide look of the reading panel (Studio → In-game theme: fonts, size, HUD colour scheme)
  if (file.dialogueBox) dialogueBox = file.dialogueBox;
}

// Soundtrack segments (src/film/studio-edits.json "soundtracks"): a run of scenes that plays hands-off for the length of a song, as a cutscene (the
// letterbox bars are on). The song starts on the run's first node and keeps playing across the nodes after it; the node after the run fades it out. Every
// shot of the run is a node of its own that moves on by itself: a silent shot shows a short caption saying what it shows (`captions`, by picture) and
// carries its sound cues (`cues`, by picture), a spoken line is a node with the take and its subtitle. The narration under the pictures is left out
// (it cannot be read at the song's pace). `stopBefore` ends the run before the beat that starts with that text: the rest of the last scene plays
// as an ordinary click-through node after the song. Timing is the engine's, measured in headless Chromium: a voiced beat routes `afterBeatDelaySeconds`
// after its voice has ended (about 0.4 s after the take's own length); a silent beat routes after its node's entry transition and that delay.
for (const seg of edits.soundtracks ?? []) {
  const a = scenes.findIndex(s => s.id === seg.from);
  const b = scenes.reduce((last, s, i) => (s.id === seg.to || s.id.startsWith(`${seg.to}_`) ? i : last), -1);
  if (a < 0 || b < a || b + 1 >= scenes.length) { console.warn(`soundtrack ${seg.id}: scenes ${seg.from} to ${seg.to} not found`); continue; }
  const block = scenes.slice(a, b + 1), next = scenes[b + 1];
  const LOOK = ["ambientAudio", "particles", "particleConfig"];
  const looks = n => Object.fromEntries(LOOK.filter(k => n[k] !== undefined).map(k => [k, n[k]]));
  const round = x => Math.round(x * 100) / 100;
  const base = bg => bg.replace(/^.*\//, "").replace(/\.[a-z]+$/i, "");
  // the shots in order, with the voiced lines that fall on each; the run stops before `stopBefore`
  const shots = [];
  let cur = null, rest = null;
  const open = (bg, node) => { cur = bg; shots.push({ bg, look: looks(node), lines: [] }); };
  scan: for (const node of block) {
    if (node.background !== cur) open(node.background, node);
    const beats = node.dialogueBeats ?? [];
    for (let i = 0; i < beats.length; i++) {
      const beat = beats[i];
      if (seg.stopBefore && beat.text?.startsWith(seg.stopBefore)) { rest = { node, from: i, bg: cur }; break scan; }
      if (beat.background && !beat.background.startsWith("video:") && beat.background !== cur) open(beat.background, node);
      if (beat.audioUrl) shots.at(-1).lines.push(beat);
    }
  }
  if (seg.stopBefore && !rest) console.warn(`soundtrack ${seg.id}: no beat starts with "${seg.stopBefore}"`);
  // LAG: measured in headless Chromium, every node takes about this much longer than its delay says (render, fade-in)
  const GAP = 0.65, CAPTION = seg.captionSeconds ?? 2.6, TRAN = 0.3, END = seg.endHold ?? 2.5, LAG = seg.lag ?? 0.18;
  const lenOf = beat => voiceDur.get(beat.audioUrl) ?? (console.warn(`soundtrack ${seg.id}: no length for ${beat.audioUrl}`), 3);
  const caption = s => seg.captions?.[base(s.bg)];
  for (const s of shots) if (!s.lines.length && !caption(s)) console.warn(`soundtrack ${seg.id}: no caption for ${base(s.bg)}`);
  // the time the voiced shots take (their lines, the caption before them, a short hold after); the silent shots share the rest of the song
  const voiced = shots.filter(s => s.lines.length);
  const voicedTime = voiced.reduce((n, s) => n + (caption(s) ? CAPTION : 0) + s.lines.reduce((m, l) => m + lenOf(l) + GAP, 0), 0) + END + (voiced.length - 1) * 0.8;
  const silent = shots.filter(s => !s.lines.length);
  const total = seg.seconds - (seg.fadeOut ?? 3) - (seg.slack ?? 0.5);
  const each = (total - voicedTime) / silent.length;
  if (each < 2.5) console.warn(`soundtrack ${seg.id}: only ${each.toFixed(1)} s a silent shot`);
  const chain = [];
  const nodeId = () => `nw_song_${seg.id}_${String(chain.length + 1).padStart(2, "0")}`;
  let beatNo2 = 0;
  const cueOf = s => { const c = seg.cues?.[base(s.bg)] ?? []; return c.length ? { sfxUrl: P(`/sfx/${c[0].file}.mp3`), sfxVolume: c[0].volume ?? 0.8 } : {}; };
  const node = (s, beat, ...more) => ({
    id: nodeId(), title: `${seg.title ?? seg.id}: ${(beat.text || "").slice(0, 40)}`, background: s.bg, cinematic: { ...camera(s.bg), ...(lookFor(s.bg)?.cinematic ?? {}) }, prose: "", ...s.look, hideHud: true, letterbox: true,
    transition: "fade", transitionSpeed: TRAN, noTypewriter: true, autoNarrate: false, hotspots: [], choices: [], dialogueBeats: [beat], ...Object.assign({}, ...more),
  });
  const captionBeat = (s, seconds, cue) => ({ id: `nw_song_b${++beatNo2}`, characterId: charOf(null), text: caption(s) ?? "·", silent: true, ...cue, afterBeatMode: "auto", afterBeatDelaySeconds: round(Math.max(0.1, seconds - TRAN - 0.1 - LAG)) });
  for (const s of shots) {
    let cue = cueOf(s);
    if (!s.lines.length) { chain.push(node(s, captionBeat(s, each, cue))); continue; }
    if (caption(s)) { chain.push(node(s, captionBeat(s, CAPTION, cue))); cue = {}; }
    s.lines.forEach((line, k) => {
      const last = k === s.lines.length - 1, isEnd = s === voiced.at(-1);
      const { background: _bg, backgroundTransition: _bt, backgroundTransitionSpeed: _bs, cinematic: _c, ...beat } = line;
      const hold = last ? (isEnd ? END : 0.8) : 0;
      chain.push(node(s, { ...beat, ...cue, afterBeatMode: "auto", afterBeatDelaySeconds: round(Math.max(0.1, GAP - 0.4 + hold - LAG)) }));
      cue = {};
    });
  }
  Object.assign(chain[0], { musicMode: "track", musicUrl: P(seg.musicUrl), musicLevel: seg.musicLevel ?? 0.9, musicFadeSeconds: seg.fadeIn ?? 1.5, musicLoop: false });
  // what is left of the last scene after the song plays as an ordinary node, and fades the song out
  let after = next;
  if (rest) {
    const { id: _i, title: _t, dialogueBeats: _b, prose: _p, background: _g, transition: _tr, transitionSpeed: _ts, cinematic: _ci, ...look } = rest.node;
    after = { ...look, id: `${rest.node.id}_after`, title: `${rest.node.title} (after the song)`, background: rest.bg, prose: "", transition: "cut", transitionSpeed: 0.2, dialogueBeats: rest.node.dialogueBeats.slice(rest.from) };
  }
  chain.forEach((nd, k) => {
    const nextId = k + 1 < chain.length ? chain[k + 1].id : after.id;
    Object.assign(nd.dialogueBeats[0], { afterBeatTargetSceneId: nextId });
  });
  if (after.musicMode === undefined) Object.assign(after, { musicMode: "none", musicFadeSeconds: seg.fadeOut ?? 3 });
  const removed = new Set(block.map(s => s.id));
  scenes.splice(a, b - a + 1, ...chain, ...(rest ? [after] : []));
  for (const s of scenes) {
    if (chain.includes(s)) continue;
    for (const bt of s.dialogueBeats ?? []) if (removed.has(bt.afterBeatTargetSceneId)) bt.afterBeatTargetSceneId = chain[0].id;
    if (removed.has(s.autoAdvanceTargetSceneId)) s.autoAdvanceTargetSceneId = chain[0].id;
  }
  console.log(`soundtrack ${seg.id}: ${block.length} scenes (${seg.from} to ${seg.to}) → ${chain.length} timed nodes over ${shots.length} shots (${silent.length} captioned, ${voiced.length} with ${shots.reduce((n, s) => n + s.lines.length, 0)} lines), ${each.toFixed(2)} s a silent shot, ${total.toFixed(1)} s of the song's ${seg.seconds} s${rest ? `; the rest of ${rest.node.id} follows the song` : ""}; ${after.id} fades it out`);
}

// Cutscenes (src/film/studio-edits.json "cutscenes", 11 October 2026: the director asked for the inn raid to play as fast action): a run of
// scenes replaced by an authored list of quick shots that plays hands-off, with no song. Each entry of `shots` is a picture (`pic`, its file
// name without extension) with either a short caption (`text`, held `seconds`, default `shotSeconds`) or a recorded line of the run (`line`,
// the start of its words; the take plays and the shot moves on just after it), and an optional sound (`sfx`, a file in public/film/sfx).
// Several shots on one picture cut straight to each other, so one picture can carry several sounds. The captions are the narration; the
// run's own beats are left out. The scene after the run follows as usual.
for (const seg of edits.cutscenes ?? []) {
  const a = scenes.findIndex(s => s.id === seg.from);
  const b = scenes.reduce((last, s, i) => (s.id === seg.to || s.id.startsWith(`${seg.to}_`) ? i : last), -1);
  if (a < 0 || b < a || b + 1 >= scenes.length) { console.warn(`cutscene ${seg.id}: scenes ${seg.from} to ${seg.to} not found`); continue; }
  const block = scenes.slice(a, b + 1), next = scenes[b + 1];
  const base = bg => bg.replace(/^.*\//, "").replace(/\.[a-z0-9]+$/i, "");
  const round = x => Math.round(x * 100) / 100;
  const LOOK = ["ambientAudio", "particles", "particleConfig"];
  const pics = new Map(), lines = [], sounds = new Map();
  for (const node of block) {
    if (node.background) pics.set(base(node.background), { bg: node.background, node });
    for (const beat of node.dialogueBeats ?? []) {
      if (beat.background && !beat.background.startsWith("video:")) pics.set(base(beat.background), { bg: beat.background, node });
      if (beat.audioUrl) lines.push(beat);
      if (beat.sfxUrl) sounds.set(base(beat.sfxUrl), { sfxUrl: beat.sfxUrl, sfxVolume: beat.sfxVolume ?? 0.8 });
    }
  }
  const soundOf = name => sounds.get(name) ?? (existsSync(resolve(root, `public/film/sfx/${name}.mp3`)) ? { sfxUrl: P(`/sfx/${name}.mp3`), sfxVolume: 0.8 } : (console.warn(`cutscene ${seg.id}: no sound ${name}`), {}));
  const norm = t => (t ?? "").replace(/[—–-]+/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
  const TRAN = 0.3, LAG = seg.lag ?? 0.18, GAP = 0.65;
  const chain = [], used = new Set();
  let prev = null, total = 0;
  for (const sh of seg.shots) {
    const pic = pics.get(sh.pic);
    if (!pic) { console.warn(`cutscene ${seg.id}: no picture ${sh.pic} in ${seg.from}–${seg.to}`); continue; }
    const look = Object.fromEntries(LOOK.filter(k => pic.node[k] !== undefined).map(k => [k, pic.node[k]]));
    const same = prev === sh.pic;
    const sound = sh.sfx ? soundOf(sh.sfx) : {};
    let beat;
    if (sh.line) {
      const line = lines.find(l => !used.has(l) && norm(l.text).startsWith(norm(sh.line)));
      if (!line) { console.warn(`cutscene ${seg.id}: no recorded line "${sh.line}"`); continue; }
      used.add(line);
      const { background: _bg, backgroundTransition: _bt, backgroundTransitionSpeed: _bs, cinematic: _c, sfxUrl: _s, sfxVolume: _v, ...rest } = line;
      const hold = sh.hold ?? 0.5;
      beat = { ...rest, ...sound, afterBeatMode: "auto", afterBeatDelaySeconds: round(Math.max(0.1, GAP - 0.4 + hold - LAG)) };
      total += (voiceDur.get(line.audioUrl) ?? 2.5) + GAP + hold;
    } else {
      const seconds = sh.seconds ?? seg.shotSeconds ?? 2.4;
      beat = { id: `nw_cut_${seg.id}_b${chain.length + 1}`, characterId: charOf(null), text: sh.text, silent: true, ...sound, afterBeatMode: "auto", afterBeatDelaySeconds: round(Math.max(0.1, seconds - (same ? 0 : TRAN) - 0.1 - LAG)) };
      total += seconds;
    }
    chain.push({
      id: `nw_cut_${seg.id}_${String(chain.length + 1).padStart(2, "0")}`, title: `${seg.title ?? seg.id}: ${(beat.text || "").slice(0, 40)}`,
      background: pic.bg, cinematic: { ...camera(pic.bg), ...(lookFor(pic.bg)?.cinematic ?? {}) }, prose: "", ...look, hideHud: true,
      transition: same ? "cut" : "fade", transitionSpeed: same ? 0.05 : TRAN, noTypewriter: true, autoNarrate: false, hotspots: [], choices: [], dialogueBeats: [beat],
    });
    prev = sh.pic;
  }
  const missed = lines.filter(l => !used.has(l));
  if (missed.length) console.warn(`cutscene ${seg.id}: ${missed.length} recorded line(s) of the run not used: ${missed.map(l => `"${l.text}"`).join(", ")}`);
  chain.forEach((nd, k) => Object.assign(nd.dialogueBeats[0], { afterBeatTargetSceneId: k + 1 < chain.length ? chain[k + 1].id : next.id }));
  const removed = new Set(block.map(s => s.id));
  scenes.splice(a, b - a + 1, ...chain);
  for (const s of scenes) {
    if (chain.includes(s)) continue;
    for (const bt of s.dialogueBeats ?? []) if (removed.has(bt.afterBeatTargetSceneId)) bt.afterBeatTargetSceneId = chain[0].id;
    if (removed.has(s.autoAdvanceTargetSceneId)) s.autoAdvanceTargetSceneId = chain[0].id;
  }
  console.log(`cutscene ${seg.id}: ${block.length} scenes (${seg.from} to ${seg.to}) → ${chain.length} timed shots, about ${Math.round(total)} s`);
}

// Animatic reading pace per scene (studio-edits "readPace", scene id → multiplier): a scene whose narration would hold one picture for
// half a minute reads its silent lines faster in the animatic (0.75 = a quarter quicker). In the game the reader sets the pace.
for (const s of scenes) {
  const pace = edits.readPace?.[s.id.replace(/_[a-z]$/, "")];
  if (pace) s.animaticReadPace = pace;
}

// No letterbox bars (11 October 2026, the director): they are drawn over the picture and cut off its top and bottom
// rather than changing its shape. Taken off every node last, after the Studio edits and the soundtracks have set them.
for (const s of scenes) delete s.letterbox;

const layout = Object.fromEntries(scenes.map((s, i) => [s.id, { x: 40 + (i % 12) * 380, y: 40 + Math.floor(i / 12) * 260 }]));
const story = {
  id: "nobodys-witness-film", pulpPaper: false, title: "Nobody's Witness", tagline: "Tokyo as a memory that is still happening.", gameKind: "vn",
  coverImage: P("/img/s14a/337-engine-off.jpg"), startSceneId, layout, ...(dialogueBox ? { dialogueBox } : {}),
  briefing: { gameInfo: "The film, played as a graphic novel: the screenplay's scenes, the storyboard pictures and the recorded voices.", objective: "Watch it through.", winConditions: ["Reach the credits."], loseConditions: [] },
  characters: [...characters.values()].map(c => ({ ...c, avatarUrl: "", trustMeter: 0 })), items: [], scenes,
};
writeFileSync(resolve(root, "src/data/nobodysWitnessFilm.ts"),
  `// GENERATED by tools/build-film-story.mjs from the Nobody's Witness film data — edit the screenplay or the tool, not this file.\nimport type { Story } from "../types";\n\nexport const NOBODYS_WITNESS_FILM: Story = ${JSON.stringify(story, null, 1)} as unknown as Story;\n`);
console.log(`${scenes.length} scenes, ${beatNo} beats, ${characters.size} characters`);
