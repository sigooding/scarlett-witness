// Mara's service (scene 97A) as the director's 32-shot cut (17 October 2026: "add more shots to lower the wait time").
//
//   node tools/service-cut.mjs        then   FILM_SRC=/nonexistent node tools/build-film-story.mjs
//
// The cut plays the service_new set (one doorway, all seven at the bow, the mother staying with the photograph) in place of the
// first fourteen stills in s97a/, which had two glued split frames (560, 567) and the same wide twice (561, 565). SHOTS is the
// whole cut in order; a shot whose picture is not on disk yet is left out, so re-running after an upload slots it in. The song
// ("service" soundtrack in src/film/studio-edits.json) is shared out evenly between the shots that are present: 16 pictures play
// about 11.7 s each, all 32 about 5.8 s. This rewrites scene 97A's steps in src/film/story.json and the soundtrack's captions and
// cues; nothing else. The pictures still to make, with their briefs, are in public/film/img/service_new/README.md.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const N = "service_new/", X = "service_new/extras/";
export const SHOTS = [
  [N + "574-the-viaduct-at-dusk", 574, "The viaduct at dusk", "Rain, the last of the light. A train crosses the viaduct."],
  [N + "556-the-lane-from-above", 556, "The lane from above", "Mourners under black umbrellas in the lane behind the Hive. One pale blue umbrella."],
  [N + "575-vera-and-her-mother-arrive", 575, "Vera and her mother arrive", "Vera and her mother walk the lane under the blue umbrella."],
  [N + "557-the-umbrellas", 557, "The umbrellas", "The umbrellas crowd the doorway. The blue one comes last."],
  [N + "558-vera-closes-the-blue-umbrella", 558, "The blue umbrella", "Vera closes Mara's blue umbrella and stands it with the black ones."],
  [N + "559-shoes-at-the-step", 559, "Shoes at the step", "Shoes in a row below the step."],
  [N + "576-onto-the-old-wood", 576, "Onto the old wood", "Stockinged feet on the old wood."],
  [N + "560-jack-at-the-door", 560, "Jack at the door", "Jack is the last one in. He looks back at the rain."],
  [N + "577-the-window", 577, "The window", "Kaneko's window. The next building, the rain."],
  [N + "578-maras-photograph", 578, "Mara's photograph", "Mara's photograph. Chrysanthemums, incense, a cup of tea."],
  [N + "561-the-small-service", 561, "The small service", "Kaneko's room. Nobody speaks."],
  [N + "579-her-drawings", 579, "Her drawings", "A few of her drawings, dried flat."],
  [N + "580-the-incense", 580, "The incense", "Kaneko lights the incense."],
  [N + "562-kanekos-parcel", 562, "Kaneko's parcel", "Rice balls wrapped in newspaper, as she gave them to Mara for the car."],
  [N + "563-the-saved-drawing", 563, "The saved drawing", "Jack straightens the photograph. Beside it, Mara's drawing of the arches in the rain."],
  [N + "581-veras-face", 581, "Vera's face", "Vera."],
  [X + "mom-01-her-face-at-the-table", null, "Her mother's face", "Her mother."],
  [N + "582-jacks-face", 582, "Jack's face", "Jack watches Vera."],
  [N + "583-the-neighbours", 583, "The neighbours", "Three neighbours from the Hive."],
  [N + "564-the-room-from-above", 564, "The room from above", "The incense goes straight up."],
  [N + "565-they-bow", 565, "They bow", "Vera and Jack bow. The room bows with them."],
  [N + "566-her-mothers-hand", 566, "Her mother's hand", "Her mother's hand finds Vera's."],
  [X + "mom-02-mother-and-daughter", null, "Mother and daughter", "Vera lets her."],
  [N + "584-the-tea-gone-cold", 584, "The tea gone cold", "The tea has gone cold."],
  [N + "567-okada-at-the-door", 567, "Okada at the door", "Okada from the bar, late, at the door. He doesn't come in."],
  [N + "585-kaneko-goes-to-him", 585, "Kaneko goes to him", "Kaneko goes to him."],
  [N + "568-kaneko-and-okada", 568, "Kaneko and Okada", "They sit together by the lamp."],
  [N + "586-his-hand-on-hers", 586, "His hand on hers", "His hand rests on hers, once."],
  [N + "587-the-blue-umbrella-opens", 587, "The blue umbrella opens", "Later. Vera opens the blue umbrella."],
  [N + "569-after-the-service", 569, "After the service", "They come out into the lane under their umbrellas. A train goes over."],
  [X + "mom-04-the-photograph-while-they-go", null, "The photograph", "Her mother stays with the photograph a while longer."],
  [N + "588-it-rains-all-night", 588, "It rains all night", "It rains all night."],
].map(([file, shot, title, caption]) => ({ file, shot, title, caption }));
const CUES = { "574-the-viaduct-at-dusk": [{ file: "train", volume: 0.35 }], "569-after-the-service": [{ file: "train", volume: 0.4 }] };

const base = f => f.replace(/^.*\//, "");
const present = SHOTS.filter(s => existsSync(resolve(root, "public/film/img", s.file + ".jpg")));
const storyFile = resolve(root, "src/film/story.json"), editsFile = resolve(root, "src/film/studio-edits.json");
const story = JSON.parse(readFileSync(storyFile, "utf8"));
const scenes = Array.isArray(story.scenes) ? story.scenes : story;
const scene = scenes.find(s => String(s.id) === "97A");
if (!scene) throw new Error("scene 97A not found in src/film/story.json");
scene.steps = [
  { t: "music", id: "service" },
  ...present.flatMap(s => [
    { t: "bg", src: `/img/${s.file}.jpg`, ...(s.shot ? { shot: s.shot } : {}), title: s.title, hold: 0, quote: s.caption },
    { t: "text", text: s.caption },
  ]),
];
writeFileSync(storyFile, JSON.stringify(story) + (readFileSync(storyFile, "utf8").endsWith("\n") ? "\n" : ""));

const edits = JSON.parse(readFileSync(editsFile, "utf8"));
const seg = edits.soundtracks.find(s => s.id === "service");
seg.captions = Object.fromEntries(SHOTS.map(s => [base(s.file), s.caption]));
seg.cues = CUES;
writeFileSync(editsFile, JSON.stringify(edits, null, 1) + "\n");

const missing = SHOTS.filter(s => !present.includes(s));
console.log(`service cut: ${present.length} of ${SHOTS.length} shots on disk, about ${((196 - 3 - 2 - 2.5) / present.length).toFixed(1)} s each`);
if (missing.length) console.log(`still to make (public/film/img/): ${missing.map(s => s.file + ".jpg").join(", ")}`);
