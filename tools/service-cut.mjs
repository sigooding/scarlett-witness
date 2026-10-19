// Mara's service (scene 97A) as the director's 34-shot cut (17 October 2026: "add more shots to lower the wait time", then "does
// that logically and visually make sense?").
//
//   node tools/service-cut.mjs        then   FILM_SRC=/nonexistent node tools/build-film-story.mjs
//
// The cut plays the service_new set (one doorway, all seven at the bow, the mother staying with the photograph) in place of the
// first fourteen stills in s97a/, which had two glued split frames (560, 567) and the same wide twice (561, 565). SHOTS is the
// whole cut in order; a shot whose picture is not on disk yet is left out, so re-running after an upload slots it in. The song
// ("service" soundtrack in src/film/studio-edits.json) is shared out evenly between the shots that are present: 15 pictures play
// about 12.6 s each, all 34 about 5.6 s. This rewrites scene 97A's steps in src/film/story.json and the soundtrack's captions and
// cues; nothing else. The pictures still to make, with their briefs, are in public/film/img/service_new/README.md.
//
// The order follows what the pictures show, not only the screenplay's order: 557 (the blue umbrella still coming up the lane)
// plays before 556 (it has reached the door); 568 shows Kaneko and Okada alone in an emptied room, so it plays after the others
// have gone; the incense is lit (580) before any shot that shows it burning. It carries the three beats of the director's
// stills in public/film/img/service/ (Jack over the photograph, Okada's umbrella beside the blue one, the circle made whole);
// 571 is the director's still itself, 570, 572 and 573 are to be redone in this room with the director's stills as the
// composition. Left out on purpose: service_new/558-the-blue-umbrella (her mother, not Vera, closes it), extras/mom-04 (another
// lane, and a different face in the photograph).
//
// The director's picks (19 October 2026), made shot by shot against every version of each: twelve shots play the director's own
// pictures instead of the redone ones. Ten are the fourteen stills of art/mara-service as the film first installed them (s97a/:
// 557, 561 to 567, 568, 569; 565 is the s97a picture as corrected on 13 October), and 570 and 573 are the director's stills from
// service/ themselves, installed full size as s97a/570 and s97a/573 (both in another room; 573 has Vera in a cream sweater).
// 576 plays extras/mom-02 (another room, kept for the faces), and extras/mom-03 (her mother leaving) is added after 573, once
// she has stayed a while longer. Thirty-five shots.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const N = "service_new/", X = "service_new/extras/", S = "s97a/";
export const SHOTS = [
  [N + "574-the-viaduct-at-dusk", 574, "The viaduct at dusk", "Rain. The last of the light."],
  [S + "557-the-umbrellas", 557, "The umbrellas", "Mourners under black umbrellas crowd the doorway. The blue one comes last."],
  [N + "575-vera-and-her-mother-arrive", 575, "Vera and her mother arrive", "Vera and her mother under Mara's blue umbrella. Jack a step behind."],
  [N + "556-the-lane-from-above", 556, "The lane from above", "The mourners make way at the door."],
  [N + "558-vera-closes-the-blue-umbrella", 558, "The blue umbrella", "Vera closes Mara's blue umbrella and stands it with the black ones."],
  [N + "559-shoes-at-the-step", 559, "Shoes at the step", "Shoes in a row below the step. Stockinged feet on the old wood."],
  [N + "560-jack-at-the-door", 560, "Jack at the door", "Jack is the last one in. He looks back at the rain."],
  [S + "570-before-he-kneels", 570, "Before he kneels", "He stands over the photograph a long moment before he kneels."],
  [N + "580-the-incense", 580, "The incense", "Kaneko lights the incense."],
  [N + "578-maras-photograph", 578, "Mara's photograph", "Mara's photograph. Chrysanthemums, incense, a cup of tea."],
  [N + "579-her-drawings", 579, "Her drawings", "A few of her drawings, dried flat."],
  [S + "561-the-small-service", 561, "The small service", "Kaneko's room. Nobody speaks."],
  [N + "581-veras-face", 581, "Vera's face", "Vera."],
  [X + "mom-01-her-face-at-the-table", null, "Her mother's face", "Her mother."],
  [N + "582-jacks-face", 582, "Jack's face", "Jack watches Vera."],
  [N + "583-the-neighbours", 583, "The neighbours", "Three neighbours from the Hive."],
  [S + "562-kanekos-parcel", 562, "Kaneko's parcel", "Rice balls wrapped in newspaper, as she gave them to Mara for the car."],
  [S + "563-the-saved-drawing", 563, "The saved drawing", "Jack straightens the photograph. Beside it, Mara's drawing of the arches in the rain."],
  [S + "564-the-room-from-above", 564, "The room from above", "The incense goes straight up."],
  [S + "565-they-bow", 565, "They bow", "Vera goes to the table. Jack goes with her. They bow."],
  [S + "566-her-mothers-hand", 566, "Her mother's hand", "Her mother's hand finds Vera's."],
  [X + "mom-02-mother-and-daughter", 576, "Mother and daughter", "Vera lets her."],
  [N + "577-the-window", 577, "The window", "Rain on the window. The light going."],
  [S + "567-okada-at-the-door", 567, "Okada at the door", "Okada from the bar, late, at the door. He doesn't come in."],
  [N + "571-okadas-umbrella", 571, "Okada's umbrella", "At last he stands his umbrella in the rack, beside the blue one."],
  [N + "585-kaneko-goes-to-him", 585, "Kaneko goes to him", "Kaneko goes to him."],
  [N + "572-the-circle-is-whole", 572, "The circle is whole", "Okada kneels with the others, and the circle is whole."],
  [N + "584-the-tea-gone-cold", 584, "The tea gone cold", "The tea has gone cold."],
  [N + "587-the-blue-umbrella-opens", 587, "The blue umbrella opens", "Later. Vera opens the blue umbrella."],
  [S + "569-after-the-service", 569, "After the service", "They come out into the lane. A train goes over. Her mother stays behind with the photograph."],
  [S + "573-her-mother-stays", 573, "Her mother stays", "A while longer."],
  [X + "mom-03-what-she-wears-home", null, "Her mother goes", "Then she goes too, in her black coat."],
  [S + "568-kaneko-and-okada", 568, "Kaneko and Okada", "Kaneko and Okada sit together by the lamp."],
  [N + "586-his-hand-on-hers", 586, "His hand on hers", "His hand rests on hers, once."],
  [N + "588-it-rains-all-night", 588, "It rains all night", "It rains all night."],
].map(([file, shot, title, caption]) => ({ file, shot, title, caption }));
// the train goes over once, as the screenplay has it, when they come out into the lane
const CUES = { "569-after-the-service": [{ file: "train", volume: 0.4 }] };

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
