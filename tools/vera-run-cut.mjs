// Vera's night run, from the hotel lounge to home (scenes 72 to 76), on the new vera_run_new/ set (18 October 2026).
//
//   node tools/vera-run-cut.mjs        then   FILM_SRC=/nonexistent node tools/build-film-story.mjs
//
// The director asked for more pictures and one consistent look for the run (vera_run_new/BRIEF.md is the brief the set was made
// from: one Vera, one dress, one route, the crossing from scenes 27 and 62, screen direction left to right). PLAN puts each new
// picture in front of the screenplay beat it covers, so the voice takes stay exactly where they are: a picture placed before a line
// is on screen while it is spoken. A picture not on disk yet falls back to the shipped one it replaces (`old`), or is left out, so
// re-running after an upload slots it in. Only scene 72 after the song starts is touched (the wait and the call before it keep their
// pictures), and scene 77 is untouched. The "bad-guy" soundtrack shares the song out between the pictures present; this also
// rewrites its captions and its sound cues for these scenes, and gives the running shots the running shake the old ones had.
//
// The director's picks (19 October 2026, PICKS below): each of the 54 was chosen against the picture the film played at that beat and
// that picture's earlier takes, so the run plays 27 of the new pictures, 14 of the shipped ones (ORIGINALS, with the captions and
// sounds they had) and 8 earlier takes (vera_run_takes/, one file per beat so each has its own caption).
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const IMG = resolve(root, "public/film/img");
// pic: [file in vera_run_new/ (no .jpg), title, caption]; old: the shipped picture kept until the new one exists
const p = (file, title, caption, extra = {}) => ({ file, title, caption, ...extra });
const old = (src, shot, title, quote) => ({ t: "bg", src, shot, title, hold: 0, quote });
export const PLAN = {
  72: [
    { at: "Vera doesn't move.", pics: [p("72-01-the-piano-plays-on", "The piano plays on", "Vera doesn't move. The piano plays on.")] },
    { at: "The phone slowly lowers", pics: [p("72-02-the-phone-lowers", "The phone lowers", "The phone slowly lowers from her ear.")] },
    { at: "The pianist plays. The clock ticks.", pics: [p("72-03-the-lighter-into-the-bag", "The lighter", "The clock ticks. She puts his lighter in her bag.")] },
    { at: "Vera walks out of the lounge.", pics: [p("72-04-walking-very-carefully", "Walking very carefully", "Not running yet. Walking very carefully.")] },
    { at: "The blue umbrella stays", pics: [p("72-05-the-umbrella-stays", "The umbrella stays", "The blue umbrella stays where she left it.")] },
  ],
  73: [
    { at: "Vera comes out of the hotel", pics: [
      p("73-01-the-lobby", "The lobby", "Through the lobby."),
      p("73-02-into-the-rain", "Into the rain", "Vera comes out of the hotel into the rain,"),
      p("73-03-she-runs", "She runs", "and starts to run.", { shake: 0.2 }),
    ] },
    { at: "The phone is still in her fist", pics: [
      p("73-04-the-call-still-lit", "The call still lit", "The call is still lit in her fist: ISHIDA.", { quote: "The phone is still in her fist, the call still lit on its screen: ISHIDA." }),
      p("73-05-toward-the-tracks", "Toward the tracks", "The railway glows at the end of the street. She runs at it.", { quote: "The elevated railway glows at the far end of the street", shake: 0.15 }),
    ] },
    { at: "Not elegantly. Badly.", pics: [
      p("73-06-her-face", "Her face", "Rain plasters her hair to her face.", { shake: 0.2 }),
      p("73-07-heels-on-wet-pavement", "Heels on wet pavement", "Not elegantly. Badly. In heels, in the red dress.", { shake: 0.2 }),
      p("73-08-she-slips", "She slips", "Slipping. Stumbling."),
      p("73-09-she-cannot-breathe", "She cannot breathe", "Stopping for half a second because she can't breathe."),
    ] },
    { at: "The song comes up under the rain", pics: [p("73-10-a-car-passes", "A car passes", "A car passes, its tyres hissing.", { shake: 0.2 })] },
    { at: "She runs past a vending machine", pics: [p("73-11-the-vending-machine", "The vending machine", "She runs past a vending machine. It glows, indifferent.")] },
    { at: "Just beyond it, at a crossing", pics: [
      p("73-12-the-crossing-chimes", "The crossing chimes", "At the crossing, the old melody chimes for her.", { quote: "Just beyond it, at a crossing, the old melody chimes for her," }),
      p("73-13-on-red", "On red", "She runs through it on red.", { quote: "and she runs through it on red.", shake: 0.2 }),
    ] },
    { at: "One heel skids.", pics: [
      p("73-14-the-heel-skids", "The heel skids", "One heel skids. Her ankle turns.", { shake: 0.3 }),
      p("73-15-the-shoe-stays-behind", "The shoe stays behind", "The shoe stays behind in a puddle. She doesn't stop."),
      p("73-16-one-shoe", "One shoe", "She runs on in one shoe.", { shake: 0.2 }),
    ] },
  ],
  74: [
    { at: "A long, empty street", pics: [p("74-01-no-one-else-is-here", "No one else is here", "In a city of fourteen million people, no one else is here.")] },
    { at: "Jack walks out of the dark", pics: [
      p("74-02-jack-out-of-the-dark", "Jack out of the dark", "Jack walks out of the dark from the direction of the Hive."),
      p("74-03-his-hands", "His hands", "His hands are dark. He has not washed them.", { quote: "His hands are dark." }),
    ] },
    { at: "Vera slows. Stops.", pics: [p("74-04-twenty-metres-apart", "Twenty metres apart", "Vera slows. Stops. Twenty metres apart.")] },
    { at: "For a moment neither of them", pics: [p("74-05-crying-almost-silently", "Crying almost silently", "She is crying, almost silently.")] },
    { at: "Jack takes one step toward her.", pics: [p("74-06-dont", "Don't", "Jack takes one step toward her.")] },
    { at: "She walks toward him. Slowly.", pics: [p("74-07-one-shoe-one-bare-foot", "One shoe, one bare foot", "She walks toward him. One shoe, one bare foot on the wet road.")] },
    { at: "You knew.", pics: [p("74-08-you-knew", "You knew", "")] },
    { at: "Jack doesn't answer.", pics: [p("74-09-his-silence", "His silence", "Jack doesn't answer. That silence is the answer.")] },
    { at: "She hits him. Not a big cinematic slap.", pics: [p("74-10-one-desperate-blow", "One desperate blow", "She hits him. One desperate blow against his chest.")] },
    { at: "She hits him again, weaker.", pics: [p("74-11-her-hands-fall", "Her hands fall", "The anger drains out of her. Her hands fall.")] },
    { at: "She was waiting for me.", pics: [p("74-12-she-was-waiting-for-me", "She was waiting for me", "")] },
    { at: "And that is when Vera finally breaks.", pics: [p("74-13-she-folds", "She folds", "And that is when Vera finally breaks. Her knees hit the wet pavement.")] },
    { at: "Her hands grab the front of his coat.", pics: [p("74-14-she-holds-on", "She holds on", "Her hands grab the front of his coat. She holds on.")] },
    { at: "Then she realises whose coat it is.", pics: [p("74-15-she-pushes-him-away", "She pushes him away", "Then she realises whose coat it is. She pushes him away.")] },
    { at: "And sits there, in the rain, in the red dress.", pics: [p("74-16-two-small-figures", "Two small figures", "Two small figures on a huge, empty, shining street.")] },
    { at: "In the black water beside Vera", pics: [p("74-17-the-reflection", "The reflection", "In the black water, her reflection. For a second, the street is different.")] },
    { at: "Vera covers her face with her hands.", pics: [p("74-18-she-covers-her-face", "She covers her face", "Vera covers her face with her hands.")] },
    { at: "Above them, an elevated train passes", pics: [p("74-19-nobody-looks-down", "Nobody looks down", "Above them, an elevated train passes. Nobody looks down.")] },
  ],
  75: [
    { at: "— A single red high-heeled shoe", pics: [p("75-01-the-red-shoe", "The red shoe", "A single red shoe in a puddle on an empty street.", {
      old: old("/img/s75/77-the-red-shoe.jpg", 79, "The red shoe", "A single red high-heeled shoe lying in a puddle on an empty street, rain dimpling the water around it.") })] },
    { at: "— The hotel lounge, empty", pics: [p("75-02-the-empty-lounge", "The empty lounge", "The hotel lounge, empty. The blue umbrella still leans on the stool.", {
      old: old("/img/s75/78-the-empty-lounge.jpg", 80, "The empty lounge", "The hotel lounge, empty, the chairs up. The pale blue umbrella still leaning against the bar stool.") })] },
    { at: "— The Hive at night", pics: [p("75-03-the-hive-shut", "The Hive shut", "The Hive at night. The noodle shop shutter is down.", {
      old: old("/img/s75/79-the-hive-shut.jpg", 81, "The hive shut", "The Hive at night, the noodle shop shutter down, its old sign still faintly glowing.") })] },
    { at: "— The vending machine on the empty street", pics: [p("75-04-the-machines-wait", "The machines wait", "The vending machines hum, lit, waiting for no one.", {
      old: old("/img/s75/80-the-machine-waits.jpg", 82, "The machine waits", "The vending machine on the empty street, humming, lit, waiting for no one.") })] },
    { at: "— A small television", pics: [p("75-05-static-in-a-window", "Static in a window", "A small television in a shop window, showing only static.", {
      old: old("/img/s75/81-static-in-a-window.jpg", 83, "Static in a window", "A small television in a shop window, showing only static.") })] },
    { at: "— The pedestrian crossing from 27 and 62", pics: [p("75-06-green-for-no-one", "Green for no one", "The signal turns green for no one. The old melody chimes.", {
      old: old("/img/s75/314-the-empty-crossing.jpg", 314, "The empty crossing", "The signal turns green for no one, and the old melody CHIMES across the wet street, all the way to the end.") })] },
  ],
  76: [
    { at: "Darkness. Rain on the window.", pics: [
      p("76-01-the-walkway", "The walkway", "Home."),
      p("76-02-the-empty-umbrella-stand", "The empty umbrella stand", "The umbrella stand by the door is empty."),
    ] },
    { at: "Vera sits on the floor", pics: [
      p("76-03-on-the-floor", "On the floor", "Vera sits on the floor, still in the ruined red dress.", {
        old: old("/img/s76/82-on-the-floor.jpg", 84, "On the floor", "Vera sits on the floor with her back against the bed, still in the ruined red dress, mascara dried on her face. One shoe.") }),
      p("76-04-mom", "Mom", "The phone lights her face. A contact: MOM.", {
        old: old("/img/s76/315-the-number-pressed.jpg", 315, "The number pressed", "The phone lights her face. A contact: MOM. She presses it.") }),
    ] },
    { at: "Vera? Honey?", pics: [p("76-05-vera-honey", "Vera? Honey?", "")] },
    { at: "Vera?", pics: [p("76-06-the-screen-goes-dark", "The screen goes dark", "")] },
    { at: "In her hand, the old steel lighter.", pics: [p("76-07-the-lighter", "The lighter", "The old steel lighter. She opens it. Closes it. Opens it.", {
      old: old("/img/s76/83-the-lighter.jpg", 85, "The lighter", "In her hand, the old steel lighter. She opens it. Closes it. Opens it.") })] },
    { at: "She should throw it away.", pics: [p("76-08-cries-without-a-sound", "Cries without a sound", "She holds it against her chest and cries without a sound.", {
      old: old("/img/s76/84-cries-without-a-sound.jpg", 86, "Cries without a sound", "She should throw it away. She holds it against her chest instead, and bends over it, and cries without making a sound.") })] },
  ],
};
// the shipped pictures this set replaces (their captions, cues and the old bg steps go)
const REPLACED = ["69-vera-runs", "547-the-call-still-lit", "387-the-street-too-long", "70-not-elegantly-badly", "548-the-machine-glows", "549-the-crossing-chimes",
  "388-through-the-crossing", "72-the-lost-heel", "500-no-one-else-is-here", "74-twenty-metres-apart", "501-one-shoe", "75-one-desperate-blow",
  "502-why-didnt-you-tell-me", "503-she-holds-on", "73-two-small-figures", "76-the-reflection", "504-nobody-looks-down"];
const CUES = {
  "73-07-heels-on-wet-pavement": [{ file: "heels-running-wet", volume: 0.7 }],
  "73-10-a-car-passes": [{ file: "car-pass", volume: 0.8 }],
  "73-12-the-crossing-chimes": [{ file: "crossing", volume: 0.5 }],
  "73-14-the-heel-skids": [{ file: "shoe-splash", volume: 0.8 }],
  "74-19-nobody-looks-down": [{ file: "train", volume: 0.5 }],
  "75-05-static-in-a-window": [{ file: "tv-static", volume: 0.02 }],
  "75-06-green-for-no-one": [{ file: "crossing", volume: 0.5 }],
  "76-07-the-lighter": [{ file: "lighter-flick", volume: 0.5 }],
};
// What plays in each new picture's place: "new" the picture itself; "original:<name>" the shipped picture (ORIGINALS); "hold" no
// picture, so the one before stays on screen (the shipped film had none of its own there either); "take:<name>" an earlier take,
// installed in vera_run_takes/ as <beat>--<the take it is>.jpg.
export const PICKS = {
  "72-01-the-piano-plays-on": "new", "72-02-the-phone-lowers": "new", "72-03-the-lighter-into-the-bag": "new",
  "72-04-walking-very-carefully": "new", "72-05-the-umbrella-stays": "new",
  "73-01-the-lobby": "original:69-vera-runs", "73-02-into-the-rain": "original:69-vera-runs",
  "73-03-she-runs": "take:73-03-she-runs--69-vera-runs-v2",
  "73-04-the-call-still-lit": "original:547-the-call-still-lit", "73-05-toward-the-tracks": "new",
  "73-06-her-face": "take:73-06-her-face--70-not-elegantly-badly-playframe", "73-07-heels-on-wet-pavement": "new",
  "73-08-she-slips": "take:73-08-she-slips--70-not-elegantly-badly-playframe", "73-09-she-cannot-breathe": "new",
  "73-10-a-car-passes": "new", "73-11-the-vending-machine": "take:73-11-the-vending-machine--71-the-machine-glows-v2",
  "73-12-the-crossing-chimes": "original:549-the-crossing-chimes", "73-13-on-red": "new",
  "73-14-the-heel-skids": "original:72-the-lost-heel", "73-15-the-shoe-stays-behind": "original:72-the-lost-heel",
  "73-16-one-shoe": "original:72-the-lost-heel",
  "74-01-no-one-else-is-here": "new", "74-02-jack-out-of-the-dark": "hold", "74-03-his-hands": "new",
  "74-04-twenty-metres-apart": "original:74-twenty-metres-apart",
  "74-05-crying-almost-silently": "take:74-05-crying-almost-silently--74-twenty-metres-apart-v2", "74-06-dont": "new",
  "74-07-one-shoe-one-bare-foot": "original:501-one-shoe", "74-08-you-knew": "new", "74-09-his-silence": "new",
  "74-10-one-desperate-blow": "take:74-10-one-desperate-blow--75-one-desperate-blow-v2",
  "74-11-her-hands-fall": "take:74-10-one-desperate-blow--75-one-desperate-blow-v2",
  "74-12-she-was-waiting-for-me": "original:502-why-didnt-you-tell-me", "74-13-she-folds": "new",
  "74-14-she-holds-on": "original:503-she-holds-on", "74-15-she-pushes-him-away": "new",
  "74-16-two-small-figures": "original:73-two-small-figures", "74-17-the-reflection": "new",
  "74-18-she-covers-her-face": "take:74-18-she-covers-her-face--76-the-reflection-v1",
  "74-19-nobody-looks-down": "original:504-nobody-looks-down",
  "75-01-the-red-shoe": "new", "75-02-the-empty-lounge": "new", "75-03-the-hive-shut": "take:75-03-the-hive-shut--79-the-hive-shut-v1",
  "75-04-the-machines-wait": "new", "75-05-static-in-a-window": "new", "75-06-green-for-no-one": "original:314-the-empty-crossing",
  "76-01-the-walkway": "new", "76-02-the-empty-umbrella-stand": "new", "76-03-on-the-floor": "original:82-on-the-floor",
  "76-04-mom": "original:315-the-number-pressed", "76-05-vera-honey": "new", "76-06-the-screen-goes-dark": "new",
  "76-07-the-lighter": "new", "76-08-cries-without-a-sound": "original:84-cries-without-a-sound",
};
// the shipped pictures the picks keep, as the film had them before this set: the step, the run's caption (the shipped one, or the new
// picture's where the shipped picture had none or now covers less), its sound cues, and `from` where it came up a beat earlier than the
// new picture it stands in for (it comes up there again)
const keep = (src, shot, title, hold, quote, caption, cues, from) => ({ step: { t: "bg", src, shot, title, hold, quote }, caption, cues, from });
const ORIGINALS = {
  "69-vera-runs": keep("/img/s73/69-vera-runs.jpg", 71, "Vera runs", 0, "Vera comes out of the hotel into the rain and starts to run.",
    "Vera comes out of the hotel into the rain,"),
  "547-the-call-still-lit": keep("/img/s73/547-the-call-still-lit.jpg", 547, "The call still lit", 2.2,
    "The phone is still in her fist, the call still lit on its screen: ISHIDA.", "The call is still lit in her fist: ISHIDA."),
  "549-the-crossing-chimes": keep("/img/s73/549-the-crossing-chimes.jpg", 549, "The crossing chimes", 2.2,
    "Just beyond it, at a crossing, the old melody chimes for her,", "At the crossing, the old melody chimes for her.", [{ file: "crossing", volume: 0.5 }]),
  "72-the-lost-heel": keep("/img/s73/72-the-lost-heel.jpg", 74, "The lost heel", 0,
    "One heel skids. Her ankle turns. The shoe comes off and stays behind in a puddle. She doesn't stop. She runs on in one shoe.",
    "One heel skids. The shoe stays behind in a puddle. She runs on.", [{ file: "shoe-splash", volume: 0.8 }]),
  "74-twenty-metres-apart": keep("/img/s74/74-twenty-metres-apart.jpg", 75, "Twenty metres apart", 0, "Vera slows. Stops. Twenty metres apart.",
    "Vera slows. Stops. Twenty metres apart."),
  "501-one-shoe": keep("/img/s74/501-one-shoe.jpg", 501, "One shoe", 0, "She walks toward him. Slowly. One shoe, one bare foot on the wet road.",
    "She walks toward him. One shoe, one bare foot on the wet road."),
  "502-why-didnt-you-tell-me": keep("/img/s74/502-why-didnt-you-tell-me.jpg", 502, "Why didn't you tell me", 0, "Why didn't you tell me?", "",
    undefined, "Why didn't you tell me?"),
  "503-she-holds-on": keep("/img/s74/503-she-holds-on.jpg", 503, "She holds on", 0, "Her hands grab the front of his coat. She holds on.",
    "Her hands grab the front of his coat. She holds on."),
  "73-two-small-figures": keep("/img/s74/73-two-small-figures.jpg", 77, "Two small figures", 0,
    "Two small figures on a huge, empty, shining street. The vending machines hum. The rain falls through their light.",
    "Two small figures on a huge, empty, shining street."),
  "504-nobody-looks-down": keep("/img/s74/504-nobody-looks-down.jpg", 504, "Nobody looks down", 0,
    "Above them, an elevated train passes, a long ribbon of lit windows.", "Above them, an elevated train passes.", [{ file: "train", volume: 0.5 }]),
  "314-the-empty-crossing": keep("/img/s75/314-the-empty-crossing.jpg", 314, "The empty crossing", 0,
    "The signal turns green for no one, and the old melody CHIMES across the wet street, all the way to the end.",
    "The signal turns green for no one. The old melody chimes.", [{ file: "crossing", volume: 0.5 }]),
  "82-on-the-floor": keep("/img/s76/82-on-the-floor.jpg", 84, "On the floor", 2.2,
    "Vera sits on the floor with her back against the bed, still in the ruined red dress, mascara dried on her face. One shoe.",
    "Vera sits on the floor, still in the ruined red dress."),
  "315-the-number-pressed": keep("/img/s76/315-the-number-pressed.jpg", 315, "The number pressed", 0,
    "The phone lights her face. A contact: MOM. She presses it.", "The phone lights her face. A contact: MOM."),
  "84-cries-without-a-sound": keep("/img/s76/84-cries-without-a-sound.jpg", 86, "Cries without a sound", 0,
    "She should throw it away. She holds it against her chest instead, and bends over it, and cries without making a sound.",
    "She holds it against her chest and cries without a sound."),
};
// an earlier take shakes like the new picture of its beat, or, where that one holds still, like the running shot it was a take of
// (its depth map and lights stay with the picture they were made from)
const TAKE_SHAKE = { "73-08-she-slips--70-not-elegantly-badly-playframe": 0.25 };

const base = f => f.replace(/^.*\//, "").replace(/\.[a-z0-9]+$/i, "");
const has = file => existsSync(resolve(IMG, "vera_run_new", file + ".jpg"));
const storyFile = resolve(root, "src/film/story.json"), editsFile = resolve(root, "src/film/studio-edits.json");
const rawStory = readFileSync(storyFile, "utf8");
const story = JSON.parse(rawStory);
const used = [], missing = [], fallback = [], kept = new Map(), takes = new Map(), held = [];
for (const [id, slots] of Object.entries(PLAN)) {
  const scene = story.scenes.find(s => String(s.id) === id);
  if (!scene) throw new Error(`scene ${id} not found`);
  // scene 72 is only touched after the song starts; everything before keeps its pictures
  const from = id === "72" ? scene.steps.findIndex(st => st.t === "music") + 1 : 0;
  if (from === 0 && id === "72") throw new Error("scene 72 has no music step");
  const head = scene.steps.slice(0, from), tail = scene.steps.slice(from).filter(st => st.t !== "bg");
  const out = [];
  let k = 0, next = 0, shown = null;
  // a picture already on screen is not put up again (two beats picked for the same shipped picture or the same take)
  const show = step => { if (step.src !== shown) out.push(step); shown = step.src; };
  for (const slot of slots) {
    // each slot anchors on the next beat that starts with its words ("Vera?" comes after "Vera? Honey?")
    const at = tail.findIndex((st, i) => i >= next && (st.t === "text" || st.t === "line") && st.text.trim().startsWith(slot.at));
    if (at < 0) throw new Error(`scene ${id}: no beat starts with "${slot.at}"`);
    out.push(...tail.slice(k, at));
    k = at; next = at + 1;
    for (const pic of slot.pics) {
      const pick = PICKS[pic.file] ?? "new";
      if (pick === "hold") held.push(pic.file);
      else if (pick.startsWith("original:")) {
        const name = pick.slice("original:".length), o = ORIGINALS[name];
        if (!o) throw new Error(`${pic.file}: no shipped picture ${name} in ORIGINALS`);
        const early = o.from ? out.findLastIndex(st => (st.t === "text" || st.t === "line") && st.text.trim().startsWith(o.from)) : -1;
        if (o.from && (early < 0 || out.slice(early).some(st => st.t === "bg"))) throw new Error(`${pic.file}: no beat starting "${o.from}" just before it`);
        if (early >= 0 && o.step.src !== shown) { out.splice(early, 0, o.step); shown = o.step.src; } else show(o.step);
        kept.set(name, o);
      } else if (pick.startsWith("take:")) {
        const name = pick.slice("take:".length);
        if (!existsSync(resolve(IMG, "vera_run_takes", name + ".jpg"))) throw new Error(`${pic.file}: vera_run_takes/${name}.jpg is not on disk`);
        show({ t: "bg", src: `/img/vera_run_takes/${name}.jpg`, title: pic.title, hold: 0, quote: pic.quote ?? [].concat(pic.caption)[0] ?? "" });
        if (!takes.has(name)) takes.set(name, pic);
      } else if (has(pic.file)) {
        show({ t: "bg", src: `/img/vera_run_new/${pic.file}.jpg`, title: pic.title, hold: 0, quote: pic.quote ?? [].concat(pic.caption)[0] ?? "" });
        used.push(pic);
      } else {
        missing.push(pic.file);
        if (pic.old) { show(pic.old); fallback.push(base(pic.old.src)); }
      }
    }
  }
  out.push(...tail.slice(k));
  scene.steps = [...head, ...out];
}
writeFileSync(storyFile, JSON.stringify(story) + (rawStory.endsWith("\n") ? "\n" : ""));

const edits = JSON.parse(readFileSync(editsFile, "utf8"));
const seg = edits.soundtracks.find(s => s.id === "bad-guy");
const shake = (name, amount) => {
  const look = (edits.pictureLook[name] ??= {});
  look.cinematic = { ...(look.cinematic ?? {}), mode: "shake", shakeAmount: amount, shakeDuration: 0.7 };
};
const shakeOnly = look => look && Object.keys(look).join() === "cinematic" &&
  Object.keys(look.cinematic ?? {}).every(k => ["mode", "shakeAmount", "shakeDuration"].includes(k));
const allPics = Object.values(PLAN).flat().flatMap(s => s.pics);
// the shipped pictures the run no longer shows lose their captions and cues; the ones the picks keep get back what they had
for (const k of [...REPLACED, ...allPics.filter(p => p.old).map(p => base(p.old.src))]) {
  if (!kept.has(k) && !fallback.includes(k)) { delete seg.captions[k]; delete seg.cues[k]; }
}
for (const [name, o] of kept) {
  if (o.caption) seg.captions[name] = o.caption; else delete seg.captions[name];
  if (o.cues) seg.cues[name] = o.cues; else delete seg.cues[name];
}
// the new pictures that play carry their caption, sound cues and the running shake the shipped run pictures had; the others carry nothing
const playing = new Set(used.map(p => p.file));
for (const pic of allPics) {
  const on = playing.has(pic.file);
  if (on && pic.caption && pic.caption.length) seg.captions[pic.file] = pic.caption; else delete seg.captions[pic.file];
  if (on && CUES[pic.file]) seg.cues[pic.file] = CUES[pic.file]; else delete seg.cues[pic.file];
  if (!on && shakeOnly(edits.pictureLook[pic.file])) delete edits.pictureLook[pic.file];
  if (on && pic.shake) shake(pic.file, pic.shake);
}
// an earlier take carries the caption and sound of the beat it plays on
for (const [name, pic] of takes) {
  if (pic.caption && pic.caption.length) seg.captions[name] = pic.caption; else delete seg.captions[name];
  if (CUES[pic.file]) seg.cues[name] = CUES[pic.file]; else delete seg.cues[name];
  const amount = pic.shake ?? TAKE_SHAKE[name];
  if (amount) shake(name, amount);
}
writeFileSync(editsFile, JSON.stringify(edits, null, 1) + "\n");

console.log(`vera run: ${used.length} new pictures, ${kept.size} shipped pictures and ${takes.size} earlier takes in scenes 72-76` +
  `${held.length ? `; no picture of its own at ${held.join(", ")}` : ""}` +
  `${fallback.length ? `; ${fallback.length} shipped pictures kept until theirs arrive (${fallback.join(", ")})` : ""}`);
if (missing.length) console.log(`still to make (public/film/img/vera_run_new/): ${missing.map(f => f + ".jpg").join(", ")}`);
