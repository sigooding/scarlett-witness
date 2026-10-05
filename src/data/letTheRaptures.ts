import type { Character, DialogueBeat, SceneNode, Story } from "../types";

/* ------------------------------------------------------------------ *
 *  LET THE RAPTURES COMMENCE — Episode One
 *
 *  Written by [Writer] · Draft 21 September 2026
 *
 *  A LINEAR, SCENE-BY-SCENE CINEMATIC REEL. No choices, no hotspots:
 *  every storyboard frame from reel.json plays in order as a full-frame
 *  cutscene card, with the screenplay as captioned subtitle beats.
 *  Stage direction plays under a 🎙 Narrator card; dialogue plays under
 *  the speaker's nameplate (this is the screenplay shown as it reads).
 *
 *  Playback stays hands-off: each frame's final caption auto-advances
 *  to the next board after a short hold, so the whole episode plays
 *  straight through on Space / a single click per beat. One fallback
 *  "▸ Next" choice exists on every scene purely so the reel can never
 *  soft-lock. Esc still opens Save & exit.
 *
 *  Art: public/img/rapture/* — extracted 1:1 from reel.json's embedded
 *  images[] (source paths /images/rapture/...).
 * ------------------------------------------------------------------ */

const A = "/img/rapture";

/** One screenplay line: who speaks + optional parenthetical + the text. */
interface Line {
  who: string;
  text: string;
  exp?: string;
}

/** Hand-build a cutscene "board" node from a reel.json storyboard still. */
function boardScene(
  id: string,
  title: string,
  image: string,
  lines: Line[],
  next: string | null,
  transition: SceneNode["transition"] = "cut"
): SceneNode {
  const beats: DialogueBeat[] = lines.map((l, i) => ({
    id: `${id}-b${i + 1}`,
    characterId: l.who,
    text: l.text,
    ...(l.exp ? { expression: l.exp } : {}),
  }));
  if (next && beats.length) {
    const last = beats[beats.length - 1];
    const lastText = lines[lines.length - 1].text;
    // Hold each board long enough to read its final caption before the cut:
    // short direction lines breathe for ~3s, long ones up to ~15s. Space
    // always advances sooner, so the reel never stalls impatient players.
    const readSeconds = Math.max(3, Math.min(15, lastText.length / 12));
    beats[beats.length - 1] = {
      ...last,
      afterBeatTargetSceneId: next,
      afterBeatMode: "auto",
      afterBeatDelaySeconds: Number(readSeconds.toFixed(1)),
    };
  }
  return {
    id,
    title,
    // A STANDARD node: the screenplay beats play with speaker nameplates and
    // the after-beat auto-route advances the reel hands-free. No prose, so
    // the player drops straight into the scene's first caption.
    background: `${A}/${image}`,
    transition,
    prose: "",
    autoNarrate: false,
    noTypewriter: true,
    hideSceneTitle: true,
    // Clean film frame: suppress the case-progress rail, menu button, meters,
    // sound/mixer corner and the scene-title card. Subtitles stay; Esc still
    // opens Save & exit so nobody is ever trapped.
    hideHud: true,
    dialogueBeats: beats,
    // A friendly safety net only: on the auto-route path this never surfaces.
    choices: next ? [{ id: `${id}-cont`, text: "▸ Next board", targetSceneId: next }] : [],
  };
}

const D = (text: string, exp?: string): Line => ({ who: "narrator", text, ...(exp ? { exp } : {}) });

const cast: Character[] = [
  { id: "rapture-nina", name: "Sister Nina Doyle", role: "Protagonist / St Jude's", avatarUrl: `${A}/sheets/nina.jpg`, trustMeter: 0 },
  { id: "rapture-ray", name: "PC Ray Okonjo", role: "Police / moral justice", avatarUrl: `${A}/sheets/ray.jpg`, trustMeter: 0 },
  { id: "rapture-kath", name: "PC Kath Bridges", role: "Police / moral justice", avatarUrl: `${A}/sheets/kath.jpg`, trustMeter: 0 },
  { id: "rapture-danny", name: "Danny Crane", role: "Father / water scavenger", avatarUrl: `${A}/sheets/danny.jpg`, trustMeter: 0 },
  { id: "rapture-jodie", name: "Jodie Crane", role: "Daughter / water scavenger", avatarUrl: `${A}/sheets/jodie.jpg`, trustMeter: 0 },
  { id: "rapture-martin", name: "Martin", role: "Collector / Max's father", avatarUrl: `${A}/sheets/martin.jpg`, trustMeter: 0 },
  { id: "narrator", name: "Narrator", role: "Stage direction", avatarUrl: "emoji:🎬", trustMeter: 0 },
  { id: "rapture-mugger", name: "The Mugger", role: "19 · hood up, wired", avatarUrl: "emoji:🔪", trustMeter: 0 },
  { id: "rapture-oldwoman", name: "The Old Woman", role: "70s · good coat", avatarUrl: "emoji:👵", trustMeter: 0 },
  { id: "rapture-brian", name: "Brian", role: "St Jude's resident", avatarUrl: "emoji:🧔", trustMeter: 0 },
  { id: "rapture-terry", name: "Terry", role: "St Jude's resident", avatarUrl: "emoji:👴", trustMeter: 0 },
  { id: "rapture-col", name: "Col", role: "St Jude's resident · 30s", avatarUrl: "emoji:🙂", trustMeter: 0 },
  { id: "rapture-deborah", name: "Deborah", role: "St Jude's resident · 60s", avatarUrl: "emoji:👩‍🦳", trustMeter: 0 },
  { id: "rapture-maureen", name: "Maureen", role: "St Jude's resident · 40s", avatarUrl: "emoji:👩", trustMeter: 0 },
  { id: "rapture-volunteer", name: "The Volunteer", role: "20s · lanyard, keen", avatarUrl: "emoji:🙋", trustMeter: 0 },
  { id: "rapture-manblue", name: "The Man in the Blue Coat", role: "30s · thin", avatarUrl: "emoji:🧥", trustMeter: 0 },
  { id: "rapture-absconder", name: "The Absconder", role: "1980 · angel turned rockstar", avatarUrl: "emoji:🎸", trustMeter: 0 },
];

/* ------------------------------------------------------------------ *
 *  SCENES
 * ------------------------------------------------------------------ */

const scenes: SceneNode[] = [];

/* ============================ COLD OPEN ============================ */
scenes.push(
  boardScene("rapture_study_01", "Cold open — still dark", "shot-01.jpg", [D("EXT. SIDE STREET — EARLY MORNING. Still dark. Sodium light. Bins. A cashpoint glowing to itself. Traffic somewhere else.")], "rapture_study_02", "fade"),
  boardScene("rapture_study_02", "The old woman", "shot-02.jpg", [D("An OLD WOMAN (70s, good coat, handbag over her forearm) walks toward us at her own pace.")], "rapture_study_03"),
  boardScene("rapture_study_03", "The mugger", "shot-03.jpg", [D("A figure steps out of a doorway. The MUGGER (19, hood up, wired). A knife held low and tight against his own body. He is considerably more frightened than she is.")], "rapture_study_04"),
  boardScene("rapture_study_04", "She stops", "shot-04.jpg", [
    D("She stops. Takes him in. Almost disappointed in him."),
    { who: "rapture-mugger", text: "Bag." },
  ], "rapture_study_05"),
  boardScene("rapture_study_05", "Unclipping", "shot-05.jpg", [
    D("She's already unclipping it, calmly, the way you'd hand over a bus pass."),
    { who: "rapture-mugger", text: "Come on. Come on —" },
  ], "rapture_study_06"),
  boardScene("rapture_study_06", "She holds it out", "shot-06.jpg", [
    D("She holds it out. He reaches for it."),
    { who: "rapture-mugger", text: "Just give it —" },
  ], "rapture_study_07"),
  boardScene("rapture_study_07", "And he isn't there", "shot-07.jpg", [D("And he isn't there.")], "rapture_study_08"),
  boardScene("rapture_study_08", "No flash", "shot-08.jpg", [D("No flash. No sound. The traffic in the next street carries on.")], "rapture_study_09"),
  boardScene("rapture_study_09", "The knife", "shot-09.jpg", [D("The knife drops. Hits the pavement. Rings. Lies still.")], "rapture_study_10"),
  boardScene("rapture_study_10", "Empty street", "shot-10.jpg", [D("The Old Woman stands in an empty street with her arm out, offering her handbag to nobody.")], "rapture_study_11"),
  boardScene("rapture_study_11", "She looks", "shot-11.jpg", [D("She looks behind her. She looks up — briefly, instinctively — and is slightly embarrassed to have done it. There is no one to tell.")], "rapture_study_12"),
  boardScene("rapture_study_12", "Concern", "shot-12.jpg", [D("She looks at the patch of pavement where he was. Concern. For him.")], "rapture_study_13"),
  boardScene("rapture_study_13", "The tissue", "shot-13.jpg", [D("She clips her bag shut. Takes a tissue from her sleeve.")], "rapture_study_14"),
  boardScene("rapture_study_14", "The knife, retrieved", "shot-14.jpg", [D("She crouches carefully, one hand on her knee, picks up the knife in the tissue, and puts it in her handbag.")], "rapture_study_15"),
  boardScene("rapture_study_15", "She walks on", "shot-15.jpg", [D("She walks on at her own pace.")], "rapture_study_16"),
  boardScene("rapture_study_16", "The empty street", "shot-16.jpg", [D("The street, empty.")], "rapture_study_17"),
  boardScene("rapture_study_17", "Lit orange", "shot-17.jpg", [D("Lit orange.")], "rapture_study_18"),
  boardScene("rapture_study_18", "Hold", "shot-18.jpg", [D("Hold on the empty street.")], "rapture_study_19"),
  boardScene("rapture_study_19", "The title", "shot-19.jpg", [
    D("A title card."),
    D("LET THE RAPTURES COMMENCE"),
    D("Companion look files: none — the cold open runs on the 19 legacy reference boards (shot-01…19)."),
  ], "rapture_stjudes_01")
);

/* ============================ ST JUDE'S ============================ */
scenes.push(
  boardScene("rapture_stjudes_01", "St Jude's — exterior", "a1s1-01.jpg", [
    D("EXT. ST JUDE'S HOUSE — MORNING. Pebbledash. A wheelie bin on its side. A hand-painted sign: ST JUDE'S. Beneath it, smaller: NO VISITORS BEFORE 10. THIS MEANS YOU, TERRY."),
    D("Noise from inside."),
  ], "rapture_stjudes_02"),
  boardScene("rapture_stjudes_02", "The corridor", "a1s1-02.jpg", [
    D("INT. ST JUDE'S HOUSE — HALL — CONTINUOUS. Bedlam. BRIAN (50s) and TERRY (50s) block the corridor, mid-dispute. SISTER NINA DOYLE (45, sleeves up, a crate of tins on her hip) is trying to get past."),
    { who: "rapture-brian", text: "It's got my name on it." },
    { who: "rapture-terry", text: "That's not your name, that's nail varnish." },
    { who: "rapture-brian", text: "In my handwriting." },
    { who: "rapture-terry", text: "It's my nail varnish." },
    { who: "rapture-brian", text: "Why've you got nail varnish, Terry?" },
    { who: "rapture-nina", exp: "(not stopping)", text: "Brian. It's a charger. There's four in the lounge drawer." },
    { who: "rapture-brian", text: "Not with the fast bit." },
    { who: "rapture-nina", text: "Then get up earlier." },
  ], "rapture_stjudes_03"),
  boardScene("rapture_stjudes_03", "Col on the stairs", "a1s1-03.jpg", [
    D("COL (30s, freshly shaved, pleased with himself) comes down the stairs with a mug."),
    { who: "rapture-col", text: "Four weeks Thursday." },
    { who: "rapture-nina", text: "I know." },
    { who: "rapture-col", text: "So I was thinking. Given that. The room at the back —" },
    { who: "rapture-nina", text: "No." },
    { who: "rapture-col", text: "You haven't heard what I —" },
    { who: "rapture-nina", text: "You want Deborah's room because it's got the aerial. No." },
    D("She's gone. Col looks wounded, briefly, then files it for another attempt."),
  ], "rapture_stjudes_04"),
  boardScene("rapture_stjudes_04", "The office", "a1s1-04.jpg", [
    D("INT. ST JUDE'S HOUSE — OFFICE — CONTINUOUS. Paperwork in drifts. A fax machine that has no business existing. Nina on the landline, pleasant, fluent, lying."),
    { who: "rapture-nina", exp: "(into phone)", text: "Fourteen. ... No, fourteen. ... Then your records are wrong, love. ... Mm. ... Send someone. Tuesday's no good." },
    D("She hangs up and writes 22 in a ledger without pausing."),
  ], "rapture_stjudes_05"),
  boardScene("rapture_stjudes_05", "The volunteer", "a1s1-05.jpg", [
    D("INT. ST JUDE'S HOUSE — HALL — CONTINUOUS. Crate back on her hip. A VOLUNTEER (20s, lanyard, keen) appears beside her."),
    { who: "rapture-volunteer", text: "Let me take that." },
    { who: "rapture-nina", text: "No." },
    { who: "rapture-volunteer", text: "It's heavy." },
    { who: "rapture-nina", text: "I know." },
    D("She's past him."),
    { who: "rapture-volunteer", exp: "(calling after)", text: "I'll do the upstairs bins!" },
    { who: "rapture-nina", exp: "(not turning)", text: "Did them." },
    D("He stands there with his hands in his pockets."),
  ], "rapture_stjudes_06"),
  boardScene("rapture_stjudes_06", "The utility room", "a1s1-06.jpg", [
    D("INT. ST JUDE'S HOUSE — UTILITY ROOM — CONTINUOUS. She dumps the crate. DEBORAH (60s, cardigan, arms folded, born to complain) is waiting for her."),
    { who: "rapture-deborah", text: "The pressure's gone again." },
    { who: "rapture-nina", text: "I'll look at it." },
    { who: "rapture-deborah", text: "It's him upstairs. Forty minutes." },
    { who: "rapture-nina", text: "It's not him upstairs." },
    { who: "rapture-deborah", text: "Forty. I timed it." },
    { who: "rapture-nina", exp: "(flat)", text: "Why." },
    D("Behind them the tap coughs air. Water. Nothing. Water."),
  ], "rapture_stjudes_07"),
  boardScene("rapture_stjudes_07", "The dining room", "a1s1-07.jpg", [
    D("INT. ST JUDE'S HOUSE — DINING ROOM — CONTINUOUS. A long table. Twenty residents. Toast, tea, a dog under the table, a local radio station going in the kitchen next door. Genuine bedlam."),
    D("Nina finally sits. MAUREEN (40s) has been waiting for this moment all morning."),
    { who: "rapture-maureen", text: "Can I ask you something religious?" },
    { who: "rapture-nina", text: "You can ask." },
    { who: "rapture-maureen", text: "If someone's took something off you. And you take it back. But you take a bit more, for the inconvenience. Is that stealing?" },
    { who: "rapture-nina", text: "Yes." },
    { who: "rapture-maureen", text: "Even the inconvenience bit?" },
    { who: "rapture-nina", text: "Especially the inconvenience bit." },
    { who: "rapture-maureen", exp: "(considering this)", text: "What if I put it back." },
    { who: "rapture-nina", text: "Put it back, Maureen." },
    { who: "rapture-maureen", text: "I'm only asking hypothetical." },
    { who: "rapture-nina", text: "Put it back." },
  ], "rapture_stjudes_08"),
  boardScene("rapture_stjudes_08", "The plates", "a1s1-08.jpg", [
    D("Nina stands and reaches for a stack of plates. At the far end, Terry is mid-anecdote."),
    { who: "rapture-terry", text: "— so I said to him, that's not a dog, mate, that's a —" },
  ], "rapture_stjudes_09"),
  boardScene("rapture_stjudes_09", "Nothing", "a1s1-09.jpg", [
    D("Nothing."),
    D("The table is empty. Twenty chairs pushed back. Full plates. A knife spinning slowly on a plate rim."),
  ], "rapture_stjudes_10"),
  boardScene("rapture_stjudes_10", "No flash, no sound", "a1s1-10.jpg", [
    D("No flash. No sound. The radio carries on in the kitchen. The dog is still under the table."),
  ], "rapture_stjudes_11"),
  boardScene("rapture_stjudes_11", "Nina does not move", "a1s1-11.jpg", [
    D("Nina stands with both hands on the plates, still angled toward where Terry was. She does not move."),
  ], "rapture_stjudes_12"),
  boardScene("rapture_stjudes_12", "The saucer", "a1s1-12.jpg", [
    D("A cup rocks on its saucer. Settles."),
  ], "rapture_stjudes_13"),
  boardScene("rapture_stjudes_13", "All that food", "a1s1-13.jpg", [
    D("She looks at twenty untouched breakfasts. All that food."),
    { who: "rapture-nina", exp: "(genuinely aggrieved)", text: "Oh, for —" },
  ], "rapture_stjudes_14"),
  boardScene("rapture_stjudes_14", "The kitchen", "a1s1-14.jpg", [
    D("INT. ST JUDE'S HOUSE — KITCHEN — CONTINUOUS. She crosses to the radio, mid-jingle, and turns it off."),
  ], "rapture_stjudes_15"),
  boardScene("rapture_stjudes_15", "Silence", "a1s1-15.jpg", [
    D("Silence."),
  ], "rapture_stjudes_16"),
  boardScene("rapture_stjudes_16", "The empty house", "a1s1-16.jpg", [
    D("The dining room again. Twenty chairs. Sunlight. Nobody."),
  ], "rapture_stjudes_17"),
  boardScene("rapture_stjudes_17", "Interior, wide", "a1s1-17.jpg", [
    D("St Jude's, empty, shot through the doorway."),
  ], "rapture_stjudes_18"),
  boardScene("rapture_stjudes_18", "Hold", "a1s1-18.jpg", [
    D("Hold."),
  ], "rapture_stjudes_19"),
  boardScene("rapture_stjudes_19", "The house, quiet", "a1s1-19.jpg", [
    D("The house, quiet. Full of nothing."),
    D("Companion look files: Nina's thread continues in Episode 1 Scene 3 — the washing-up boards, /img/rapture/ep1-washing-up/."),
  ], "rapture_after_01")
);

/* ============================ ST JUDE'S — AFTER ============================ */
scenes.push(
  boardScene("rapture_after_01", "The hall after the rapture", "ep1-washing-up/01-hall.jpg", [
    D("INT. ST JUDE'S HALL — DAY. The hall after the rapture. Chairs stacked against the wall. A mop bucket in the middle of the floor. On a clipboard by the door, one ignored complaint about water pressure from earlier — still there. Hold."),
  ], "rapture_after_02"),
  boardScene("rapture_after_02", "Washing up", "ep1-washing-up/02-kitchen.jpg", [
    D("INT. KITCHEN — DAY. Nina washing up. Methodical. The tap runs brown, then clear. She doesn't react. Stacks a plate. The radio is off."),
  ], "rapture_after_03"),
  boardScene("rapture_after_03", "Tea towel", "ep1-washing-up/03-tea-towel.jpg", [
    D("She dries the plates with a tea towel that says ST JUDE'S. Folds it afterwards, square. Puts it back on its hook."),
  ], "rapture_after_04"),
  boardScene("rapture_after_04", "Mugs", "ep1-washing-up/04-mugs.jpg", [
    D("INT. HALL — DAY. She collects mugs from the hall. Three of them, all with different slogans. She carries them two at a time, like someone who has done this every day for years."),
  ], "rapture_after_05"),
  boardScene("rapture_after_05", "Water butt", "ep1-washing-up/05-water-butt.jpg", [
    D("INT. UTILITY — DAY. She checks the water butt by the back door. Half full. She tops up two bottles from it, labels them with masking tape: KITCHEN."),
  ], "rapture_after_06"),
  boardScene("rapture_after_06", "Masking tape", "ep1-washing-up/06-tape.jpg", [
    D("INSERT — INT. UTILITY. The masking tape roll. The marker pen. Her handwriting, practical, small."),
  ], "rapture_after_07"),
  boardScene("rapture_after_07", "Mop corridor", "ep1-washing-up/07-mop.jpg", [
    D("INT. CORRIDOR — DAY. She pushes a mop down the corridor. The corridor is long, symmetrical, daylight from high windows. She doesn't look into the rooms as she passes."),
  ], "rapture_after_08"),
  boardScene("rapture_after_08", "Deborah's room", "ep1-washing-up/08-deborah-door.jpg", [
    D("INT. CORRIDOR — DAY. She stops outside Deborah's old room. Door ajar. She looks in for a second, then keeps going. No pendant here. No bedside rummage."),
  ], "rapture_after_09"),
  boardScene("rapture_after_09", "Tins", "ep1-washing-up/09-tins.jpg", [
    D("INT. STORE CUPBOARD — DAY. She counts tins. Writes a number on the clipboard. Tins, not water. Water is separate."),
  ], "rapture_after_10"),
  boardScene("rapture_after_10", "The chapel", "ep1-washing-up/10-chapel.jpg", [
    D("INT. CHAPEL — DAY. The chapel, empty. Six chairs. A wooden cross on the wall, slightly crooked. She straightens it without thinking."),
  ], "rapture_after_11"),
  boardScene("rapture_after_11", "Filing cabinet", "ep1-washing-up/11-filing.jpg", [
    D("INT. OFFICE — DAY. She opens a filing cabinet. Inside, a list of residents with dates. She crosses out two names with a biro. No ceremony."),
  ], "rapture_after_12"),
  boardScene("rapture_after_12", "Bins", "ep1-washing-up/12-bins.jpg", [
    D("EXT. ST JUDE'S — DAY. Daylight, overcast. She carries a black bag to the bins. The street outside is empty. No cars. She doesn't look up."),
  ], "rapture_after_13"),
  boardScene("rapture_after_13", "Laundry", "ep1-washing-up/13-laundry.jpg", [
    D("INT. LAUNDRY — DAY. She folds laundry. Someone else's. She folds it anyway. Puts it on a pile."),
  ], "rapture_after_14"),
  boardScene("rapture_after_14", "The pile", "ep1-washing-up/14-pile.jpg", [
    D("INT. LAUNDRY — DAY. The pile. She looks at it for a second, then leaves it. Someone will want it later, or they won't."),
  ], "rapture_after_15"),
  boardScene("rapture_after_15", "Fire exit", "ep1-washing-up/15-fire-exit.jpg", [
    D("INT. CORRIDOR — DAY. She checks the fire exit. Locked. She checks the log book. Signs it."),
  ], "rapture_after_16"),
  boardScene("rapture_after_16", "Alone in the corridor", "ep1-washing-up/16-corridor-alone.jpg", [
    D("INT. CORRIDOR — DAY. She stands in the corridor, alone. Listens. Nothing. She goes to her own room."),
  ], "rapture_after_17"),
  boardScene("rapture_after_17", "Own room doorway", "ep1-washing-up/17-own-room.jpg", [
    D("INT. NINA'S ROOM — DAY. Her own room at St Jude's. Narrow single bed, made. Wooden cross on the wall, slightly crooked. A bedside drawer. She opens it."),
  ], "rapture_after_18"),
  boardScene("rapture_after_18", "Torch batteries", "ep1-washing-up/19-drawer-rummage.jpg", [
    D("INT. NINA'S ROOM — DAY. She rummages in the drawer for torch batteries. Elastic bands, receipts, a rosary with a broken link, a nail file. She moves them aside."),
  ], "rapture_after_19"),
  boardScene("rapture_after_19", "Torch open", "ep1-washing-up/20-torch.jpg", [
    D("INSERT — INT. NINA'S ROOM. The torch, open. Batteries dead. She tips them into the bin."),
  ], "rapture_after_20"),
  boardScene("rapture_after_20", "New batteries", "ep1-washing-up/21-batteries-search.jpg", [
    D("INT. NINA'S ROOM. She looks for new batteries. The drawer is a mess. She sighs, not annoyed, just occupied."),
  ], "rapture_after_21"),
  boardScene("rapture_after_21", "Pack of batteries", "ep1-washing-up/22-batteries-found.jpg", [
    D("INT. NINA'S ROOM. She finds a pack of batteries at the back of the drawer. Holds them up to the light. Checks the date on them."),
  ], "rapture_after_22"),
  boardScene("rapture_after_22", "Pendant in drawer", "ep1-washing-up/23-own-room-drawer.jpg", [
    D("INT. NINA'S ROOM. A narrow single bed, made. A wooden cross on the wall, slightly crooked. She opens a bedside drawer. Among the junk — elastic bands, a rosary with a broken link, a nail file — a pendant on a cheap chain. Dull. Unremarkable."),
  ], "rapture_after_23"),
  boardScene("rapture_after_23", "Picks it up, practical", "ep1-washing-up/24-pendant-close.jpg", [
    D("CLOSE. She picks it up because it's in the way of the torch batteries. Looks at it for a second the way you'd look at something you've owned for forty years and never worn."),
    D("She puts it on anyway. No reverence. It's a practical decision — she's packing, and it's smaller round her neck than in a bag."),
  ], "rapture_after_24"),
  boardScene("rapture_after_24", "Corridor vision", "ep1-washing-up/25-corridor-vision.jpg", [
    D("INT. CORRIDOR — DAY. She walks the corridor, hand goes to her chest. First vision — recorded, not divine. Wrong aspect ratio, dropped frames, blown exposure and hiss. The thing she's ignored her whole life does something for the first time. Handheld only for the vision."),
  ], "rapture_after_25"),
  boardScene("rapture_after_25", "Drives, bearing", "ep1-washing-up/26-drives.jpg", [
    D("EXT. ST JUDE'S — DAY. She drives. Pendant bearing. The minibus on the empty road. Vision is tracker's recorded view, not divine. She pulls over, holds the pendant like it owes her money. The vision beat lands exactly where it was."),
    D("Note: Episode 1 Scene 3 shot 18 (pendant among a dead woman's things) is CUT — the pendant is her mother's, she always had it. The cut slot is honoured here."),
  ], "rapture_cops_01")
);

/* ============================ THE COPS ============================ */
scenes.push(
  boardScene("rapture_cops_01", "Police car, parked", "a2s1-01.jpg", [
    D("INT. POLICE CAR (PARKED) — SUPERMARKET CAR PARK — DAY. A patrol car parked across two bays in a car park full of abandoned cars. PC KATH BRIDGES (30s, white) in the driver's seat, eating a petrol station sandwich. PC RAY OKONJO (30s, black) in the passenger seat, arms folded."),
    D("They've been here a while. Four seconds of nothing."),
  ], "rapture_cops_02"),
  boardScene("rapture_cops_02", "No birds", "a2s1-02.jpg", [
    { who: "rapture-kath", text: "There's no birds." },
    { who: "rapture-ray", text: "There's birds." },
    { who: "rapture-kath", text: "Not that many." },
    { who: "rapture-ray", text: "They weren't raptured, Kath." },
    { who: "rapture-kath", text: "I'm not saying they were raptured." },
    { who: "rapture-ray", text: "You are saying that." },
    { who: "rapture-kath", text: "I'm saying there's less of them." },
    D("A long pause."),
    { who: "rapture-ray", text: "Some of them'll have been in cages." },
  ], "rapture_cops_03"),
  boardScene("rapture_cops_03", "The car, alone", "a2s1-03.jpg", [
    D("EXT. SUPERMARKET CAR PARK — CONTINUOUS. The car, alone, across two bays in a hundred empty spaces."),
  ], "rapture_cops_04"),
  boardScene("rapture_cops_04", "Why are we still policing?", "a2s1-04.jpg", [
    D("INT. POLICE CAR (PARKED) — CONTINUOUS."),
    { who: "rapture-kath", text: "Why are we still policing?" },
    { who: "rapture-ray", text: "Because it's what we signed up for." },
    { who: "rapture-kath", text: "Everyone that's left is guilty though. Surely." },
    { who: "rapture-ray", text: "Technically." },
    { who: "rapture-kath", text: "So we should arrest everyone." },
    { who: "rapture-ray", text: "We can't arrest everyone." },
    { who: "rapture-kath", text: "We should arrest ourselves." },
    D("An eight-second pause."),
    { who: "rapture-ray", text: "It's what we signed up for." },
  ], "rapture_cops_05"),
  boardScene("rapture_cops_05", "The dashboard", "a2s1-05.jpg", [
    D("On the dashboard: a dead radio, a ticket book, a crossword with three letters in it."),
    { who: "rapture-kath", text: "We're here for a reason." },
    { who: "rapture-ray", text: "Mm." },
    { who: "rapture-kath", text: "To teach moral justice." },
    { who: "rapture-ray", text: "Who told you that?" },
    { who: "rapture-kath", text: "You did." },
    { who: "rapture-ray", exp: "(pause)", text: "Sounds like me." },
    { who: "rapture-kath", text: "The man upstairs might still save us. If we keep order." },
    { who: "rapture-ray", text: "Might." },
    { who: "rapture-kath", text: "That's a purpose, that." },
    { who: "rapture-ray", exp: "(not unkindly)", text: "Eat your sandwich." },
  ], "rapture_cops_06"),
  boardScene("rapture_cops_06", "The trolley", "a2s1-06.jpg", [
    D("Outside, a shopping trolley rolls slowly across the car park on its own. Neither of them looks at it."),
    { who: "rapture-kath", text: "You've not eaten." },
    { who: "rapture-ray", text: "I'm not hungry." },
    { who: "rapture-kath", text: "I've never seen you eat." },
    { who: "rapture-ray", text: "You've seen me eat." },
    { who: "rapture-kath", text: "When?" },
    { who: "rapture-ray", text: "Gav's leaving do." },
    { who: "rapture-kath", exp: "(pause)", text: "That was a buffet." },
    { who: "rapture-ray", text: "So?" },
    { who: "rapture-kath", text: "Anyone can stand at a buffet." },
  ], "rapture_cops_07"),
  boardScene("rapture_cops_07", "The man in the blue coat", "a2s1-07.jpg", [
    D("EXT. SUPERMARKET — CONTINUOUS. The glass doors are already smashed. A MAN IN A BLUE COAT (30s, black, thin) walks up. Looks around. Sees the police car. Considers it. Decides, correctly, that it doesn't matter any more. Goes in."),
  ], "rapture_cops_08"),
  boardScene("rapture_cops_08", "Male, thirties", "a2s1-08.jpg", [
    D("INT. POLICE CAR (PARKED) — CONTINUOUS. Both watch him through the windscreen. Neither moves. Kath dictates aloud, meticulously, to nobody."),
    { who: "rapture-kath", text: "Male, thirties, blue coat. Entered the premises at —" },
    { who: "rapture-ray", text: "Twenty past." },
    { who: "rapture-kath", text: "— approximately quarter past —" },
    { who: "rapture-ray", text: "It's twenty past." },
    { who: "rapture-kath", text: "— via a door that was already open." },
    { who: "rapture-ray", text: "It wasn't open. It was smashed." },
    { who: "rapture-kath", text: "Open is smashed, Ray." },
    { who: "rapture-ray", exp: "(pause)", text: "Not in a statement it isn't." },
  ], "rapture_cops_09"),
  boardScene("rapture_cops_09", "The water", "a2s1-09.jpg", [
    D("Through the glass: the man loading a trolley with slabs of bottled water. Methodical. A great deal of it."),
    { who: "rapture-kath", text: "That's more than he needs." },
    { who: "rapture-ray", text: "That's a lot of water." },
    { who: "rapture-kath", text: "He's selling that." },
    { who: "rapture-ray", exp: "(a beat)", text: "To who?" },
  ], "rapture_cops_10"),
  boardScene("rapture_cops_10", "The way out", "a2s1-10.jpg", [
    { who: "rapture-kath", text: "Do we go in?" },
    { who: "rapture-ray", text: "That's entering premises." },
    { who: "rapture-kath", text: "Right." },
    { who: "rapture-ray", text: "We'll have him on the way out." },
  ], "rapture_cops_11"),
  boardScene("rapture_cops_11", "The trolley comes out", "a2s1-11.jpg", [
    D("EXT. SUPERMARKET — CONTINUOUS. The trolley comes out through the broken doors. It takes him a while."),
    D("Both car doors open at once — abrupt, slightly too fast."),
    { who: "rapture-ray", exp: "(entirely official)", text: "Police! Stay where you are!" },
  ], "rapture_cops_12"),
  boardScene("rapture_cops_12", "He runs", "a2s1-12.jpg", [
    D("The man tries to run. He gets about four feet, because he's pushing a quarter of a tonne of water. He's already stopping, hands coming up —"),
    D("Kath fires the taser anyway."),
  ], "rapture_cops_13"),
  boardScene("rapture_cops_13", "The taser", "a2s1-13.jpg", [
    D("He goes down rigid. The trolley goes with him. Slabs of water burst across the tarmac."),
    { who: "rapture-ray", text: "Kath." },
    { who: "rapture-kath", text: "He was running." },
    { who: "rapture-ray", text: "That's a form." },
    { who: "rapture-kath", text: "It's not a form." },
    { who: "rapture-ray", text: "Discharge of a taser is a form." },
    { who: "rapture-kath", exp: "(pause)", text: "Who's it going to?" },
  ], "rapture_cops_14"),
  boardScene("rapture_cops_14", "No court", "a2s1-14.jpg", [
    D("The man face down in an inch of spreading water, twitching. Kath stands over him and recites from memory, absolutely sincerely."),
    { who: "rapture-kath", text: "You do not have to say anything, but it may harm your defence if you do not mention when questioned something which you later rely on in court." },
    { who: "rapture-manblue", exp: "(barely)", text: "There's no court." },
    { who: "rapture-kath", text: "There's no court yet." },
  ], "rapture_cops_15"),
  boardScene("rapture_cops_15", "The bottle", "a2s1-15.jpg", [
    D("One intact bottle rolls slowly across the tarmac. Ray's boot stops it. He picks it up."),
  ], "rapture_cops_16"),
  boardScene("rapture_cops_16", "Moments later", "a2s1-16.jpg", [
    D("INT. POLICE CAR (PARKED) — MOMENTS LATER. Both back in their seats. Doors shut. The bottle in the cup holder between them. Nothing in how either of them sits suggests anything has happened."),
    D("Four seconds."),
    { who: "rapture-ray", text: "They'll have gone south." },
    { who: "rapture-kath", text: "Who?" },
    { who: "rapture-ray", text: "The birds." },
    { who: "rapture-kath", text: "It's July." },
    D("A long pause."),
    { who: "rapture-ray", text: "Some of them go early." },
  ], "rapture_cops_17"),
  boardScene("rapture_cops_17", "The car park", "a2s1-17.jpg", [
    D("EXT. SUPERMARKET CAR PARK — CONTINUOUS. The car, alone, across two bays."),
  ], "rapture_cops_18"),
  boardScene("rapture_cops_18", "He gets to his knees", "a2s1-18.jpg", [
    D("Far in the background, the man in the blue coat slowly gets to his knees in a spill of water."),
  ], "rapture_cops_19"),
  boardScene("rapture_cops_19", "The cops, held", "a2s1-19.jpg", [
    D("The car, alone, across two bays. Hold."),
    D("Companion look files: the cops' second beat follows — /img/rapture/ep1-cops-second/."),
  ], "rapture_cops2_01")
);

/* ============================ THE COPS, SECOND BEAT ============================ */
scenes.push(
  boardScene("rapture_cops2_01", "He'll be all right", "ep1-cops-second/01-windscreen.jpg", [
    D("INT. POLICE CAR (PARKED) — STREET — NIGHT. Dark. Both lit by the dashboard. Kath eating. Ray not. The bottle of water in the cup holder, untouched."),
    D("Four seconds."),
    { who: "rapture-kath", text: "He'll be all right, that lad." },
    { who: "rapture-ray", text: "Which lad?" },
    { who: "rapture-kath", text: "The one from the car park." },
    { who: "rapture-ray", text: "He was thirty-odd." },
    { who: "rapture-kath", text: "He looked younger." },
    { who: "rapture-ray", text: "They do." },
    D("A six-second pause."),
    { who: "rapture-kath", text: "I only tasered him." },
    { who: "rapture-ray", text: "I know." },
    { who: "rapture-kath", text: "People get tasered." },
    { who: "rapture-ray", text: "They do." },
  ], "rapture_cops2_02"),
  boardScene("rapture_cops2_02", "The car alone", "ep1-cops-second/02-exterior-wide.jpg", [
    D("EXT. STREET — CONTINUOUS. The car, alone, parked across two bays in an empty street. Interior light on."),
  ], "rapture_cops2_03"),
  boardScene("rapture_cops2_03", "There's a form", "ep1-cops-second/03-form.jpg", [
    D("INT. POLICE CAR (PARKED) — CONTINUOUS."),
    { who: "rapture-ray", text: "There's a form." },
    { who: "rapture-kath", text: "Ray." },
    { who: "rapture-ray", text: "I'm only saying there's a form." },
    { who: "rapture-kath", exp: "(a beat)", text: "Have you got the form?" },
    { who: "rapture-ray", exp: "(immediately)", text: "No." },
    D("Five seconds. Neither of them has touched the water."),
    { who: "rapture-kath", text: "Then there isn't a form." },
  ], "rapture_cops2_04"),
  boardScene("rapture_cops2_04", "The bottle untouched", "ep1-cops-second/04-bottle.jpg", [
    D("INSERT. The bottle in the cup holder. Neither of them has drunk any of it."),
  ], "rapture_cops2_05"),
  boardScene("rapture_cops2_05", "Who's in charge", "ep1-cops-second/05-in-charge.jpg", [
    D("Hold. Five seconds."),
    { who: "rapture-ray", text: "Kath." },
    { who: "rapture-kath", text: "Mm." },
    { who: "rapture-ray", text: "Who do you think's in charge now?" },
    { who: "rapture-kath", exp: "(no hesitation whatsoever)", text: "Us." },
  ], "rapture_cops2_06"),
  boardScene("rapture_cops2_06", "Empty street, interior light on", "ep1-cops-second/06-same-exterior.jpg", [
    D("EXT. STREET — CONTINUOUS. The car in an empty street, interior light on, two people sat in it. Hold. CUT."),
  ], "rapture_martin")
);

/* ============================ TAG — 1980 / MARTIN ============================ */
scenes.push(
  boardScene("rapture_martin", "Three months earlier & 1980 — the absconder", "a1s4-01.jpg", [
    D("SUPER: THREE MONTHS EARLIER. EXT. STORAGE FACILITY — DAY. A low industrial unit behind chain link. A bored attendant in the booth, radio on, doesn't look up. The barrier lifts."),
    D("MARTIN (40s) drives through. Denim jacket that was correct in 1994. Hair long at the back on principle. Rings."),
    D("INT. STORAGE FACILITY — CORRIDOR. A long corridor of orange roller doors receding to a vanishing point. Strip lights, one flickering. Martin walks down the middle of it with bolt cutters."),
    D("He stops at a bay and checks the number against a printed sheet — an online auction listing for a deceased estate. In the margin, in biro, underlined twice: GABE HOLLAND."),
    D("He cuts the padlock. Three attempts. He is not a strong man. The shutter rolls up: one man's life in stacked boxes and bin bags. Guitar cases. A rolled rug. A wardrobe on its side."),
    D("Martin in the doorway. He doesn't move for a while. This is, transparently, the best day of his life."),
    D("He goes through it. A gold disc in bubble wrap. A box marked PERSONAL EFFECTS — DO NOT SELL. A hotel bill from 1980, itemised. He reads it like scripture: two bottles of Scotch, a club sandwich, room service, 4 a.m."),
    D("A tour jacket. He holds it up against himself. Shoulders. Length. He puts it on. It fits. He takes it off, folds it badly, and puts it back in the box."),
    D("A guitar case. He opens it and lifts the guitar out with both hands. He sits on an upturned crate and plays four bars of Don't Call Me Home. Badly. His fingers know the shape and not much else. He stops. Puts it back. Closes the case."),
    D("From one of the boxes: a beige plastic housing. Vents. A serial plate with no manufacturer on it. On top of the casing, a small rectangular gap where something has been snapped off. He turns it over. No make. No model. No badge. He shrugs and drops it in with three other dead machines."),
    D("EXT. STORAGE FACILITY — CAR PARK — LATER. He loads the car. Careful with the guitar case. He throws the box with the machine in it on top of the others. The attendant lifts the barrier without looking up."),
    D("SUPER: 1980. INT. HOTEL ROOM — DAY. An ordinary hotel room, made, empty. Ashtray, clean. Room key on the dresser. A desk calendar. Dust turning in the light through the net curtains."),
    D("The air near the foot of the bed distorts. Barely. A figure assembles out of light — not dramatically, like a photograph developing. He drops the last inch to the carpet and braces on his knees. First breath."),
    D("THE MAN (late 30s) checks his own hands like they're borrowed. In his palm: a small silver rectangle. Frost blooms across it and retreats. It unfolds, quietly — mechanical, not magical."),
    D("On the desk, components arrive and assemble into a beige terminal and a CRT. Cables find the wall socket on their own. Clipped to the top of the casing: a small tracker. A single red light, slow pulse. He snaps it off and puts it in his jacket pocket."),
    D("He sits. Green phosphor. A cursor. USER PARAMETERS — APPEARANCE +20%, CONFIDENCE +20%, TALENT +30%, CHARISMA MAX, MUSICAL ABILITY 95, SOCIAL STATUS 50. The cursor passes over SOCIAL STATUS and leaves it alone."),
    D("At the mirror, his features shift and settle better. A beard arrives. He runs a thumb along the jaw. Approves. Across the room, a guitar materialises, leaning against the armchair. He sits on the end of the bed and plays — clumsy, then competent, then good. Fragments of Don't Call Me Home come together."),
    D("The light through the nets goes from afternoon to dark. The ashtray fills. He never looks up. At the mirror, a leather jacket resolves onto him. He looks at it. He doesn't smile."),
    D("MONTAGE — Don't Call Me Home, live. Newsprint. A record pressing. An arena from the back of the hall, hands reaching, flashbulbs. A backstage corridor: he fastens something round a young woman's neck from behind. She's laughing at him. Half a second."),
    D("INT. HOTEL ROOM — DAY — MONTHS LATER. A different hotel. The same geometry. Curtains shut mid-afternoon. A whisky bottle, glasses, room service going cold. Pills tipped onto glass. He's slumped. Awake. Doing nothing."),
    D("His hand goes to his chest. He stands up wrong. He goes down. The room: destroyed. He lies face down on the carpet. On the desk, the terminal glows. STATUS: ACTIVE. ERROR."),
    D("A long hold. Only the high whine of the CRT. UNDO? The cursor blinks for a long time. NO. The cursor drops to the next line and keeps blinking."),
    D("END OF EPISODE ONE."),
  ], null, "fade")
);

/* The final scene doubles as the episode's single ending. */
scenes[scenes.length - 1] = {
  ...scenes[scenes.length - 1],
  isEnding: true,
  endingData: {
    tier: "victory-gold",
    headline: "DON'T CALL ME HOME",
    recap: "The absconder declines undo with NO. The pendant — the terminal's tracker — passes to a daughter who never knew him: Sister Nina Doyle, who runs St Jude's and finds being called a saint ridiculous.",
  },
};

export const LET_THE_RAPTURES: Story = {
  id: "let-the-raptures",
  title: "Let the Raptures Commence",
  tagline: "Episode One — four billion people sorted while the washing up still gets done.",
  gameKind: "vn",
  pulpPaper: false,
  coverImage: `${A}/shot-01.jpg`,
  startSceneId: "rapture_study_01",
  briefing: {
    objective: "Watch Episode One of Let the Raptures Commence, scene by scene.",
    winConditions: ["Play straight through to the 1980 tag."],
    loseConditions: [],
  },
  characters: cast,
  items: [],
  scenes,
};
