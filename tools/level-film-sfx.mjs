// Builds the film's scene effects and TV/radio voices from the raw ElevenLabs takes listed in docs/film-sfx-generations-2026-10-09.json.
//
//   FFMPEG=/path/to/ffmpeg node tools/level-film-sfx.mjs
//
// Effects: the take is picked by measurement, not by ear (among takes whose loudest moment is above -25 dB, the one with the most
// energy), then leveled: a hit to a peak of -3 dBFS with a 40 ms fade-out, a loop to an average of -24 dB (and never past -3 dBFS),
// never lifted more than 14 dB. Voices: the clean take is heard through a television or a radio (the chains PlayFrame's
// scripts/neonoire/voice-fx.mjs uses for the screenplay's phone/TV/tape lines) and brought back to its clean level. Everything is
// written to public/film/sfx/<id>.mp3, where src/film/studio-edits.json ("sfx", "ambientAdd") places it. The raw takes are never
// touched; re-running rebuilds the same files and writes each pick and level back into the generations file.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const ffmpeg = process.env.FFMPEG || "ffmpeg";
const listFile = resolve(root, "docs/film-sfx-generations-2026-10-09.json");
const list = JSON.parse(readFileSync(listFile, "utf8"));
const WEAK_PEAK = -25, MAX_BOOST = 14, LOOP_MEAN = -24, HIT_PEAK = -3;
// a television on a shelf, a radio behind a counter (thinner, a little compressed)
const FX = {
  tv: "highpass=f=300,lowpass=f=5000,aecho=0.8:0.6:35:0.25,volume=1.2",
  radio: "highpass=f=320,lowpass=f=3600,acompressor=threshold=0.05:ratio=4,volume=1.4",
};
const VOICE_FX = { "radio-baseball": "radio", "tv-baseball-inn": "tv", "tv-cooking-show": "tv", "tv-cooking-lid": "tv" };

const measure = file => {
  const err = spawnSync(ffmpeg, ["-hide_banner", "-i", file, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf8" }).stderr || "";
  const num = re => { const m = re.exec(err); return m ? Number(m[1]) : null; };
  const t = [...err.matchAll(/time=(\d+):(\d+):([\d.]+)/g)].at(-1);
  return { peak: num(/max_volume: (-?[\d.]+) dB/), mean: num(/mean_volume: (-?[\d.]+) dB/), duration: t ? Math.round((+t[1] * 3600 + +t[2] * 60 + +t[3]) * 100) / 100 : null };
};
const run = args => execFileSync(ffmpeg, ["-y", "-v", "error", ...args], { stdio: ["ignore", "ignore", "inherit"] });

for (const [id, e] of Object.entries(list.effects)) {
  const takes = e.takes.map(t => ({ ...t, ...measure(resolve(root, t.file)) }));
  const usable = takes.filter(t => t.peak !== null && t.peak > WEAK_PEAK);
  const best = (usable.length ? usable : takes).reduce((a, b) => (b.mean > a.mean ? b : a));
  const byPeak = HIT_PEAK - best.peak, byMean = LOOP_MEAN - best.mean;
  const gain = Math.min(MAX_BOOST, e.loop ? Math.min(byPeak, byMean) : byPeak);
  const fade = e.loop ? "" : `,afade=t=out:st=${Math.max(0, best.duration - 0.04)}:d=0.04`;
  const out = resolve(root, `public/film/sfx/${id}.mp3`);
  run(["-i", resolve(root, best.file), "-af", `volume=${gain.toFixed(2)}dB,alimiter=limit=0.708:level=disabled${fade}`, "-c:a", "libmp3lame", "-q:a", "2", out]);
  const after = measure(out);
  e.pick = `v${best.v}`;
  e.level = { gainDb: Math.round(gain * 10) / 10, sourcePeakDb: best.peak, sourceMeanDb: best.mean, peakDb: after.peak, meanDb: after.mean, duration: after.duration, weak: best.peak <= WEAK_PEAK || gain >= MAX_BOOST };
  e.file = `public/film/sfx/${id}.mp3`;
}
for (const [id, v] of Object.entries(list.voices)) {
  const fx = VOICE_FX[id];
  const src = resolve(root, v.raw), out = resolve(root, `public/film/sfx/${id}.mp3`), tmp = `${out}.filtered.wav`;
  run(["-i", src, "-af", `aresample=44100,aformat=channel_layouts=mono,${FX[fx]}`, tmp]);
  const gain = Math.max(-12, Math.min(14, measure(src).mean - measure(tmp).mean));
  run(["-i", tmp, "-af", `volume=${gain.toFixed(2)}dB,alimiter=limit=0.89:level=0`, "-ar", "44100", "-ac", "1", "-b:a", "128k", out]);
  execFileSync("rm", ["-f", tmp]);
  const after = measure(out);
  v.fx = fx;
  v.file = `public/film/sfx/${id}.mp3`;
  v.level = { gainDb: Math.round(gain * 10) / 10, peakDb: after.peak, meanDb: after.mean, duration: after.duration };
}
writeFileSync(listFile, JSON.stringify(list, null, 1) + "\n");
const weak = Object.entries(list.effects).filter(([, e]) => e.level.weak).map(([id]) => id);
console.log(`${Object.keys(list.effects).length} effects and ${Object.keys(list.voices).length} voices written to public/film/sfx/${weak.length ? `; weak (quiet even after leveling): ${weak.join(", ")}` : ""}`);
if (!existsSync(resolve(root, "public/film/sfx"))) throw new Error("public/film/sfx is missing");
