import type { Choice, DialogueBeat, Hotspot, SceneNode, StageSettings, Story } from "../types";
import { applyCreditsPreset } from "../credits";

const art = (name: string) => `/img/black-mass-bride/${name}`;
const sound = (name: string) => `/audio/black-mass-bride/${name}.wav`;
const id = (value: string) => `bmb_${value}`;
const beat = (key: string, who: string, text: string, extra: Partial<DialogueBeat> = {}): DialogueBeat => ({
  id: id(key), characterId: who === "narrator" ? who : id(who), text, ...extra,
});
const choice = (key: string, text: string, target: string, extra: Partial<Choice> = {}): Choice => ({
  id: id(key), text, targetSceneId: id(target), ...extra,
});
const scene = (key: string, title: string, plate: string, extra: Partial<SceneNode>): SceneNode => ({
  id: id(key), title, background: art(`${plate}.webp`), prose: "", noTypewriter: true,
  autoNarrate: false, hideSceneTitle: true, particles: "none", ambientAudio: "none",
  transition: "fade", transitionSpeed: 0.35, cinematic: { mode: "static", dimAmount: 0 },
  choices: [], hotspots: [], ...extra,
});
const floor: StageSettings = {
  plateAspectRatio: 1345 / 742,
  spawn: { x: 48, y: 92 }, floor: { top: 83, bottom: 96 }, speed: 31, reach: 5,
  keyboard: true, depthScale: 0.12, playerScale: 1.3, hints: "always",
  verbCoin: true, objectVerbMenu: true, sentenceLine: true,
};
const exit = (key: string, label: string, target: string, x: number, extra: Partial<Hotspot> = {}): Hotspot => ({
  id: id(key), label, cursor: "go", bounds: { x, y: 48, w: 12, h: 34 }, isRepeatable: true,
  action: { type: "goToScene", targetSceneId: id(target) }, ...extra,
});

/**
 * BLACK-MASS BRIDE — an interactive adaptation of the user-supplied story by
 * Mindret Lord. Three acts, five walkable investigation rooms, four endings.
 * All characters are adults. Sexualized violence is omitted; injuries and
 * murders are reported non-graphically. The source's inexplicable dream stays
 * inexplicable, while the crime is a human conspiracy, not a supernatural one.
 *
 * Every mechanic is editable in Studio. Notes explain the gates and routes.
 * Stable ids protect saves. Art/sound live in public/, not browser storage.
 * See docs/black-mass-bride.md for the production notes and spoiler test route.
 */
export const BLACK_MASS_BRIDE: Story = {
  id: "black-mass-bride",
  title: "Black-Mass Bride",
  tagline: "A dream foretold the crime. The morning papers named you as the devil.",
  gameKind: "adventure", coverImage: art("cover.webp"), startSceneId: id("title"),
  playerSprite: { sheet: {
    image: art("jay-sheet.png"), frameWidth: 174, frameHeight: 320,
    animations: { idle: { frames: [0] }, walk: { frames: [1, 2, 3, 2], fps: 7 } }, pixelated: false,
  } },
  verbMenuIcon: art("mark.svg"),
  inventoryDisplay: { mode: "modal", label: "Jay's casebook", startClosed: true, tileSize: 104 },
  dialogueBox: {
    bodyFont: "elegant", headingFont: "pulp", textScale: 1.05, reserveLines: 3,
    backgroundColor: "#0b1918", backgroundOpacity: 0.95, bordered: true,
    hudTheme: "sepia-pulp", accentColor: "#dac398", dangerColor: "#c76c63", minimalHud: true,
  },
  briefing: {
    objective: "Find Victoria Starr. Expose the hands behind the mark before the city closes its case on you.",
    gameInfo: "BLACK-MASS BRIDE • After the supplied story by Mindret Lord. A three-act, illustrated 1930s mystery: explore five rooms, collect evidence, combine useful objects, challenge a lie and build a case on the corkboard. Four endings; approximately 25–40 minutes. Click an object, then choose a verb. Double-click the floor to jog; H reveals hotspots; click the casebook to inspect or combine items; the Rewind control undoes a decision. Read at your own pace: there are no timed choices. Content: abduction, coercion, off-screen murder and non-graphic injury. All characters are adults; the original's sexualized violence is omitted. Original AI-assisted illustrations and a quiet synthesized underscore; no recorded or cloned character voices.",
    winConditions: [
      "Find the concealed route and preserve the evidence rather than trusting appearances.",
      "Protect Pat and arrange police backup before returning to the mansion.",
      "Use Pat's archive on the corkboard, then put the case to the culprits before sounding the alarm.",
    ],
    loseConditions: [
      "Hand yourself over while the planted evidence is the only story the police have.",
      "Rush an armed captor instead of creating an alarm.",
    ],
  },
  verbResponses: {
    look: ["Nothing there improves the case. Look for what a visitor could have touched."],
    take: ["Evidence, not souvenirs. Leave that where it is."],
    talk: ["The room keeps its own counsel."],
    use: ["Those do not fit together. Read the item in the casebook for a better lead."],
    go: ["That is not a way out. Try a door or the marked exit."],
  },
  characters: [
    { id: id("jay"), name: "Jay Arnold", role: "Advertising executive • the man in the headlines", avatarUrl: art("jay.webp"), trustMeter: 0 },
    { id: id("victoria"), name: "Victoria Starr", role: "Jay's fiancée • a witness, not a symbol", avatarUrl: art("victoria.webp"), trustMeter: 1 },
    { id: id("pat"), name: "Pat Elwin", role: "Secretary • better at keeping her head than her employer", avatarUrl: art("pat.webp"), trustMeter: 1 },
    { id: id("arthur"), name: "Arthur", role: "The Starr butler • an observant man in an invisible job", avatarUrl: art("arthur.webp"), trustMeter: 0 },
    { id: id("oleary"), name: "Jim O'Leary", role: "District attorney • an old acquaintance with difficult questions", avatarUrl: art("oleary.webp"), trustMeter: 0 },
    { id: id("peters"), name: "Mr. Peters", role: "Gardener and handyman to the neighborhood", avatarUrl: art("peters.webp"), trustMeter: 0 },
    { id: id("marne"), name: "Mrs. Peters", role: "Housekeeper to the same families", avatarUrl: art("marne.webp"), trustMeter: 0 },
    { id: id("starr"), name: "Henry Starr", role: "Victoria's father • supposedly away in Boston", avatarUrl: art("starr.webp"), trustMeter: 0 },
  ],
  items: [
    { id: id("mark"), name: "Victoria's sketch", icon: "✎", iconUrl: art("mark.svg"), description: "Victoria drew the split-hoof mark left on her forearm. The doctor's dressing stays in place; this sketch is all anyone needs to see.", flavorText: "A shape is not an explanation.", isClue: true },
    { id: id("plan"), name: "House plan", icon: "▱", iconUrl: art("plan.svg"), description: "An old plan of the Starr mansion: library, black chamber, garden passage. A service-bell cable runs through the partition. Builder's initials: E. P.", flavorText: "A room can be secret without being sealed.", isClue: true },
    { id: id("wire"), name: "Loose bell wire", icon: "⌁", iconUrl: art("wire.svg"), description: "A length of flexible wire from Arthur's maintenance tray. Its end is rough.", flavorText: "Combine with the work glove to make a padded hook.", combinableWith: { targetItemId: id("glove"), resultItemId: id("hook") } },
    { id: id("glove"), name: "Work glove", icon: "✋", iconUrl: art("glove.svg"), description: "A clean, heavy glove abandoned by the black chamber cabinet. Useful for handling the rough wire.", flavorText: "Combine with loose bell wire in the casebook." },
    { id: id("hook"), name: "Padded hook", icon: "⌁", iconUrl: art("wire.svg"), description: "The wire wrapped in the work glove. Long enough to reach a service-bell pull from an awkward position.", flavorText: "Sometimes rescue is a matter of inches." },
    { id: id("envelope"), name: "Marked envelope", icon: "✉", iconUrl: art("envelope.svg"), description: "A threatening split-hoof impression on cheap paper. Preserved by its edges, with Pat's record of when it arrived.", flavorText: "The same mark. An ordinary piece of mail.", isClue: true },
    { id: id("news"), name: "Afternoon edition", icon: "▤", iconUrl: art("newspaper.svg"), description: "Lorna Dane is dead. The paper reports a mark like Victoria's. It identifies the victim; it does not identify her killer.", flavorText: "A woman you knew. Not merely a clue.", isClue: true },
    { id: id("roster"), name: "Service roster", icon: "▥", iconUrl: art("testimony.svg"), description: "Pat's list: Peters gardens at the Starr, Dane and Lawson houses. Mrs. Peters cleans those houses and Jay's apartment. Both have had legitimate access for years.", flavorText: "Locked doors keep out strangers, not everyone.", isClue: true },
    { id: id("scarf"), name: "Victoria's scarf", icon: "≈", iconUrl: art("scarf.svg"), description: "An ivory scarf caught beneath the gardener's truck tarp. Victoria wore it this afternoon; the clasp is unmistakable.", flavorText: "Present this when Peters denies carrying anyone in the truck.", isClue: true },
    { id: id("keys"), name: "Spare-key ledger", icon: "⚿", iconUrl: art("keys.svg"), description: "The potting-shed ledger records duplicate house keys under initials. The Arnold entry is written in a second hand: M. P.", flavorText: "No broken window was ever necessary.", isClue: true },
    { id: id("archive"), name: "Pat's archive", icon: "▣", iconUrl: art("dossier.svg"), description: "Two records establish that Elias Peters built the Starr house and that his daughter died during a factory dispute after his business failed. A rejected loan appeal names Starr, Dane, Lawson and Arnold. The Peters family later returned as household staff.", flavorText: "Corkboard: connect this archive to Mr. Peters. Grief explains his grievance; it does not excuse his crimes.", isClue: true },
    { id: id("bulletin"), name: "Radio bulletin", icon: "▰", iconUrl: art("newspaper.svg"), description: "Rosetta Lawson is dead. Police found a supposed branding instrument in Jay's apartment while he was elsewhere. Pat has written down the broadcast time.", flavorText: "Call O'Leary. Give him a second account before the first hardens into fact.", isClue: true },
    { id: id("shovel"), name: "Caretaker's shovel", icon: "♠", iconUrl: art("shovel.svg"), description: "Borrowed on the fire-escape route. A convincing prop for a caretaker, and loud against a metal door.", flavorText: "An alarm is more useful than a weapon." },
  ],
  deduction: {
    suspectIds: [id("peters"), id("marne"), id("starr")],
    connections: [
      { a: id("archive"), b: id("peters"), flagSet: id("motive"), revelation: "E. P. was Elias Peters. He built the black chamber, lost his daughter, and returned to the four families under an ordinary workman's cap. Means, access and grievance belong to the same man." },
      { a: id("scarf"), b: id("peters"), flagSet: id("transport"), revelation: "Victoria left in the truck, not through either watched entrance. The gardener's ordinary work route was the hidden route." },
      { a: id("keys"), b: id("marne"), flagSet: id("plant"), revelation: "Marne's duplicate keys explain the intrusion and the planted evidence. Her access makes Jay's apparent guilt a manufactured story." },
    ],
  },
  flagNotes: {
    bmb_shared_dream: "You told Victoria about the dream instead of making her face it alone.",
    bmb_withheld_dream: "You kept the nightmare to yourself.",
    bmb_plan_taken: "You preserved the house plan. It marks the concealed garden passage.",
    bmb_bell: "You tested the service bell: the kitchen can hear a pull from the chamber.",
    bmb_hidden_door: "Fresh soil under the drapes proves someone used the garden door.",
    bmb_arthur: "Arthur heard movement behind the black door; he will stay attentive.",
    bmb_envelope_saved: "Pat witnessed you preserving the marked envelope.",
    bmb_police_truth: "O'Leary heard the truth about Victoria before he heard a rumor.",
    bmb_withheld_police: "You withheld Victoria's account from O'Leary.",
    bmb_missing: "Victoria disappeared while you were away.",
    bmb_peters_questioned: "You heard Peters's account of the truck.",
    bmb_peters_lie: "Victoria's scarf contradicted Peters's claim that he carried no passenger.",
    bmb_code: "You understood Pat's coded telephone warning.",
    bmb_exposed: "You said your real name on a monitored call.",
    bmb_pat_alert: "You chose to check Pat's apartment together before resting.",
    bmb_drowsy: "Exhaustion cost you several hours. Pat woke you for the news.",
    bmb_radio: "You recorded the second murder report and the planted evidence.",
    bmb_pat_safe: "Pat bolted the door and arranged to wait with her neighbor.",
    bmb_backup: "O'Leary knows about the secret room and is bringing officers to the garden.",
    bmb_archive_found: "You matched the building record and the inquest in Pat's file.",
    bmb_motive: "The archive connects Peters the builder to Peters the bereaved father.",
    bmb_transport: "The scarf connects Victoria's disappearance to the gardener's truck.",
    bmb_plant: "The key ledger connects Marne to the planted evidence.",
    bmb_garden_entry: "The house plan let you approach through the garden passage.",
    bmb_trapped: "You walked into the library-door ambush.",
    bmb_case_made: "You put the documentary case to the Peters couple and heard them admit it.",
    bmb_alarm: "You made the alarm that brought the people outside to the chamber.",
    bmb_precise: "The padded hook reached the bell pull without a struggle.",
  },
  acts: [
    { id: id("act1"), label: "Act I", title: "A mark in the dark", startSceneId: id("title"), titleCardSeconds: 0, titleCardImage: art("dream.webp") },
    { id: id("act2"), label: "Act II", title: "The city names its devil", startSceneId: id("office_intro"), titleCardSeconds: 0, titleCardImage: art("office.webp") },
    { id: id("act3"), label: "Act III", title: "The third janitor", startSceneId: id("return"), titleCardSeconds: 0, titleCardImage: art("garden.webp") },
  ],
  scenes: [
    scene("title", "Black-Mass Bride", "cover", {
      nodeType: "credits", musicMode: "track", musicUrl: sound("undertone"), musicLevel: 0.34,
      prose: "BLACK-MASS BRIDE\nAfter the story by Mindret Lord\nAn illustrated mystery in three acts",
      credits: { ...applyCreditsPreset("studio-forties", {
        title: "BLACK-MASS BRIDE", subtitle: "A dream. A mark. A manufactured devil.",
        lines: [{ role: "After the story by", name: "Mindret Lord" }, { role: "An interactive adaptation", name: "Scarlet Reel Studio" }, { role: "Content note", name: "Abduction • off-screen murder • non-graphic injury" }],
      }), cardSeconds: 2.4, montage: [art("cover.webp"), art("library.webp"), art("dream.webp")], montageSeconds: 5, gateWeave: "off" },
      note: "START / CREDIT. Adaptation of the supplied Mindret Lord story, not a transcription. Non-graphic treatment; adults only. No QTEs. All artwork and sound are portable local files. Begin here from the newsstand, not a branch link, for the shipping test.",
      choices: [choice("begin", "Begin the midnight call", "dream")],
    }),
    scene("dream", "The room I had never seen", "dream", {
      prose: "I dreamed of black velvet, rose-colored light, and a shadow with the wrong number of joints. Somewhere behind the drapes, someone was trying not to cry.",
      cinematic: { mode: "pan", panDistance: 1.5, zoomDuration: 18, dimAmount: 0 },
      dialogueBeats: [
        beat("dream1", "jay", "I could not see a face. Only the divided shape of a hoof, lowering like a seal onto an unwritten page."),
        beat("dream2", "narrator", "The telephone rang. The room vanished. The dread did not.", { silent: true, audioUrl: sound("phone") }),
      ],
      choices: [choice("answer", "Answer the telephone", "call")],
      note: "The supernatural element is a dream, never an instruction or an actual demon attack. One slow pan; no flashing, timer or jump scare.",
    }),
    scene("call", "Two in the morning", "library", {
      prose: "Half a mile in the cold. Victoria opened the mansion door before I could knock. The family doctor had dressed a strange injury on her forearm; she was still shaking.",
      onEnterActions: [{ consequences: { addItems: [id("mark")] } }],
      dialogueBeats: [
        beat("call1", "victoria", "I woke with a terrible pain. The window was fastened. I remember nothing before it. So I drew what the doctor saw. Look at the paper, Jay—not at me as if I were already a ghost."),
        beat("call2", "jay", "The sketch was the shape from my dream. Every sensible sentence I knew deserted me."),
        beat("call3", "victoria", "Father is in Boston. Arthur says the old black room has been making noises. We are going to find an ordinary explanation. Together."),
      ],
      choices: [
        choice("share_dream", "Tell Victoria about the dream. No more secrets between us.", "library", { exclusiveGroup: id("first_promise"), consequences: { setFlags: [id("shared_dream")], trustChanges: [{ characterId: id("victoria"), delta: 1 }] }, memoryLog: id("promise") }),
        choice("hide_dream", "Keep the dream to yourself. Promise to find a human explanation.", "library", { exclusiveGroup: id("first_promise"), consequences: { setFlags: [id("withheld_dream")] }, memoryLog: id("promise") }),
      ],
      note: "Opening relationship choice: both routes are viable. Victoria supplies her own sketch and has already received medical care. Memory is recalled in the ending, not used as a hidden punishment.",
    }),
    scene("library", "The Starr library", "library", {
      nodeType: "stage", stage: { ...floor, spawn: { x: 40, y: 94 }, enterCaption: "Take the house plan. Inspect the black chamber. Click an object, then a verb; double-click the floor to jog." },
      note: "ROOM 1. TAKE house plan and wire. TALK via telephone to Arthur. LOOK/test bell. GO black door; return to this room freely. Office exit needs only the plan flag and garden-door observation, never a consumable item. Hook crafting is optional, not a softlock.",
      dialogueBeats: [
        beat("arthur1", "arthur", "The telephone reaches the pantry, sir. I have heard something behind that black door. Mrs. Peters calls it rats. Rats do not usually turn a handle."),
        beat("arthur2", "jay", "Who services the room?"),
        beat("arthur3", "arthur", "Peters sees to the fittings. His wife does the cleaning. They work for most of the old families. I'll stay within hearing of the service bell."),
      ],
      hotspots: [
        { id: id("take_plan"), label: "House plan", cursor: "take", bounds: { x: 29, y: 53, w: 20, h: 16 }, action: { type: "giveItem", itemGranted: id("plan"), flagSet: id("plan_taken"), text: "A garden passage behind the chamber. A service-bell cable in the partition. Initials E. P. beside the original building date." }, verbs: { look: { type: "showText", text: "The old drawing is loose. Take it; the house may not be arranged as everyone remembers." } } },
        { id: id("take_wire"), label: "Maintenance tray", cursor: "take", bounds: { x: 37, y: 76, w: 12, h: 6 }, action: { type: "giveItem", itemGranted: id("wire"), text: "A loose length of bell wire. A glove around its rough end would make it safe to handle. Combine them in the casebook." } },
        { id: id("ask_arthur"), label: "Telephone Arthur", cursor: "talk", bounds: { x: 7, y: 54, w: 13, h: 10 }, action: { type: "startDialogue", flagSet: id("arthur") } },
        { id: id("test_bell"), label: "Test the service bell", cursor: "use", bounds: { x: 57, y: 42, w: 6, h: 11 }, action: { type: "showText", flagSet: id("bell"), text: "A bell answers in the kitchen. Arthur calls back: the chamber has its own pull, close to the chair. He will listen for it.", sfxUrl: sound("bell"), sfxVolume: 0.45 } },
        exit("enter_chamber", "The black door", "chamber", 67),
        exit("leave_for_office", "Leave for the office", "office_intro", 87, { gating: { requiresFlags: [id("plan_taken"), id("hidden_door")] }, customFailMessage: "First take the house plan and inspect the drapes in the black chamber. Those are your leads on how someone got inside." }),
      ],
    }),
    scene("chamber", "Behind the black drapes", "chamber", {
      nodeType: "stage", stage: { ...floor, spawn: { x: 31, y: 94 }, enterCaption: "The room from the dream. Look behind the right-hand drapes; then return to the library." },
      note: "ROOM 2. The garden exit is discovered, not opened. showText sets a permanent flag; rereading cannot farm a meter. The glove is an optional ingredient. Both room exits are repeatable.",
      hotspots: [
        { id: id("drapes"), label: "Garden-side drapes", cursor: "look", bounds: { x: 76, y: 31, w: 16, h: 43 }, action: { type: "showText", flagSet: id("hidden_door"), text: "Another door, concealed beneath velvet. Locked now, but fresh garden soil crosses its sill. Someone used it recently. No apparition needed a key—but a person did." } },
        { id: id("glove_pickup"), label: "Work glove on cabinet", cursor: "take", bounds: { x: 38, y: 59, w: 13, h: 16 }, action: { type: "giveItem", itemGranted: id("glove"), text: "An ordinary work glove. Combine it with the loose bell wire if you took it from the library." } },
        { id: id("lamp"), label: "The branching sconce", cursor: "look", bounds: { x: 57, y: 23, w: 10, h: 25 }, action: { type: "showText", text: "The brass branches cast a horned shadow. A trick of light explains the shape, not how you dreamed it before you came here." } },
        exit("back_library", "Back to the library", "library", 3),
      ],
    }),
    scene("office_intro", "The mark in the mail", "office", {
      prose: "Dawn found no intruder. By afternoon I was at my desk, trying to answer letters while Victoria rested under Arthur's watch. Pat Elwin brought me an envelope.",
      dialogueBeats: [
        beat("mail1", "pat", "No return address. I opened it with the rest. Is this supposed to be a joke?"),
        beat("mail2", "jay", "On the cheap white paper was the divided hoof. I almost threw it away. Pat caught my wrist."),
        beat("mail3", "pat", "If someone wants you frightened, don't do their tidying for them. Save the paper. I've started a list of everyone who can get into those houses."),
      ],
      choices: [choice("office_investigate", "Preserve the evidence. Read what Pat has found.", "office")],
      note: "ACT II. Pat intervenes in the source's destroyed-envelope mistake. The player still has to collect it in the room. This act cannot backtrack into Act I, keeping derived act membership unambiguous.",
    }),
    scene("office", "Arnold & Company", "office", {
      nodeType: "stage", stage: { ...floor, enterCaption: "Preserve the marked envelope. The paper and Pat's roster are optional evidence. Then meet O'Leary." },
      note: "ROOM 3. Three one-shot pickups; navigation uses a permanent flag, not an item that may be combined or presented. Roster and paper improve understanding but do not gate basic survival.",
      hotspots: [
        { id: id("save_envelope"), label: "Marked envelope", cursor: "take", bounds: { x: 30, y: 52, w: 11, h: 13 }, action: { type: "giveItem", itemGranted: id("envelope"), flagSet: id("envelope_saved"), text: "You keep the envelope flat. Pat signs a note of its arrival time. Someone sent a threat; someone else can now prove you received it." } },
        { id: id("take_news"), label: "Afternoon newspaper", cursor: "take", bounds: { x: 41, y: 57, w: 12, h: 12 }, action: { type: "giveItem", itemGranted: id("news"), text: "Lorna Dane was found dead in her family's garden. The report mentions the same mark. You knew her. You will not turn her death into a rumor about devils." } },
        { id: id("take_roster"), label: "Pat's service roster", cursor: "take", bounds: { x: 56, y: 43, w: 11, h: 29 }, action: { type: "giveItem", itemGranted: id("roster"), text: "Peters: gardener and handyman. Mrs. Peters: cleaning and keys. The same two names run through the Starr, Dane, Lawson and Arnold households." } },
        exit("visit_oleary", "Meet O'Leary", "oleary", 82, { gating: { requiresFlags: [id("envelope_saved")] }, customFailMessage: "Take the marked envelope first. Pat is right: don't leave the only physical threat in your wastebasket." }),
      ],
    }),
    scene("oleary", "An acquaintance with questions", "office", {
      prose: "O'Leary agreed to see me. He kept the report closed. There was nothing to be gained by looking at Lorna's body, and everything to be gained by asking who had been allowed near her.",
      dialogueBeats: [
        beat("law1", "oleary", "You've received a threat matching the mark on a murdered woman. Tell me why you came here before I have to ask formally."),
        beat("law2", "jay", "For an absurd second I thought that protecting Victoria meant keeping her out of the record."),
      ],
      choices: [
        choice("tell_police", "Tell him about Victoria. Show the envelope and her sketch.", "missing", { presentItem: id("envelope"), consequences: { setFlags: [id("police_truth")], trustChanges: [{ characterId: id("oleary"), delta: 2 }] } }),
        choice("withhold_police", "Say only that Lorna was a friend. Keep Victoria out of it.", "missing", { consequences: { setFlags: [id("withheld_police")], trustChanges: [{ characterId: id("oleary"), delta: -1 }] } }),
      ],
      note: "Both dialogue branches continue. An early mistake can be corrected by the later backup call; the best ending is not quietly lost in the first conversation.",
    }),
    scene("missing", "The empty chair", "library", {
      onEnterActions: [{ consequences: { setFlags: [id("missing")] } }],
      prose: "At the mansion, Victoria's chair was empty. Her book lay open. Arthur had been called to the kitchen by Mrs. Peters; the cook swore no one had passed the back door.",
      dialogueBeats: [
        beat("missing1", "arthur", "She said she would wait here for you. I was gone less than ten minutes."),
        beat("missing2", "jay", "The two watched entrances. The third door nobody counted. I ran toward the garden."),
      ],
      choices: [choice("garden_search", "Search the service courtyard", "garden")],
      note: "Victoria's abduction is conveyed by absence, never a spectacle. The player's earlier discovery supplies the reasoning.",
    }),
    scene("garden", "The gardener's way out", "garden", {
      nodeType: "stage", stage: { ...floor, spawn: { x: 56, y: 94 }, enterCaption: "Search the truck and shed. Hear Peters's account; his answer may not fit what you find." },
      note: "ROOM 4 / EVIDENCE LOOP. Take scarf BEFORE questioning Peters to challenge his live lie; you may return and question him again if you missed it. All goToScene markers repeat. The phone exit waits only for the conversation, not a perfect deduction.",
      hotspots: [
        { id: id("scarf_pickup"), label: "Scarf under the truck tarp", cursor: "take", bounds: { x: 18, y: 54, w: 20, h: 15 }, action: { type: "giveItem", itemGranted: id("scarf"), text: "Victoria's ivory scarf. One end is pinched under the truck tarp. You slip it into your pocket before the gardener turns around." } },
        { id: id("key_ledger"), label: "Potting-shed ledger", cursor: "take", bounds: { x: 77, y: 56, w: 15, h: 18 }, action: { type: "giveItem", itemGranted: id("keys"), text: "A little book of duplicate keys. Starr, Dane, Lawson, Arnold. Beside your name, the initials M. P. The black room was never the only place they could enter." } },
        exit("question_peters", "Question the gardener", "peters", 43, { cursor: "talk" }),
        exit("phone_office", "Telephone the office", "phone", 3, { gating: { requiresFlags: [id("peters_questioned")] }, customFailMessage: "Hear the gardener's account before leaving. The scarf may give you a way to test it." }),
      ],
    }),
    scene("peters", "A passenger nobody saw", "garden", {
      onEnterActions: [{ consequences: { setFlags: [id("peters_questioned")] } }],
      dialogueBeats: [
        beat("peters1", "peters", "Terrible business about Miss Dane, Mr. Jay. I used to see her around. My wife does your rooms today, you know."),
        beat("peters_claim", "peters", "Miss Starr? No. I haven't carried a passenger in that truck all afternoon. Only tools under the tarp.", {
          lie: {
            evidenceItemIds: [id("scarf")], contradictedFlag: id("peters_lie"),
            caughtBeat: beat("peters_caught", "peters", "That scarf? Must have caught on while I was working. You can't remember every little thing. Now if you'll excuse me...", { conditionRule: { requiresFlags: [id("peters_lie")] } }),
            wrongBeat: beat("peters_wrong", "peters", "That paper doesn't put anybody in my truck. You're tired, Mr. Jay. Perhaps you ought to sit down."),
            wrongEvidenceLimit: 3,
          },
        }),
        beat("peters2", "jay", "He smiled. For the first time, the smile looked like work."),
      ],
      choices: [choice("peters_back", "Let him talk. Keep your evidence. Return to the courtyard.", "garden")],
      note: "PRESS THE LIE on the second beat with Victoria's scarf. Wrong evidence is not lethal; the player may re-enter. Exit is pure repeatable navigation so re-questioning cannot strand the player.",
    }),
    scene("phone", "Mr. Arbuthnot", "library", {
      prose: "The office telephone clicked twice before Pat answered. Then came a small intake of breath—and a voice as bright and false as a shop-window smile.",
      dialogueBeats: [
        beat("code1", "pat", "Why, Mr. Arbuthnot! Of course. Seven o'clock. Apartment twelve F, forty-five-oh-two South Washington. Would you repeat that, so I know you have it?"),
        beat("code2", "jay", "My name was not Arbuthnot. Someone was listening beside her."),
      ],
      choices: [
        choice("decode", "Play along. Repeat the address, not your name.", "pat_entry", { consequences: { setFlags: [id("code")] } }),
        choice("blurt", "Pat, it's Jay Arnold. What is going on?", "wrong_line", { consequences: { setFlags: [id("exposed")] } }),
        choice("surrender", "Go to the police now. Let them sort everything out.", "framed"),
      ],
      note: "Fair, un-timed dialogue puzzle. A wrong answer gets a recoverable scene, not an arbitrary instant death. Voluntary surrender is clearly distinct and leads to the framed ending.",
    }),
    scene("wrong_line", "A name said too loudly", "office", {
      prose: "There was another click on the line. Pat changed the subject so quickly it sounded like a door slamming.",
      dialogueBeats: [beat("wrong1", "pat", "Wrong number, I'm afraid."), beat("wrong2", "jay", "She had given me an address. I could still use it. But the police now knew I was close enough to telephone." )],
      choices: [choice("recover_code", "Take the long way to Pat's apartment", "pat_entry")],
      note: "Recovery branch for exposing your identity. It rejoins the real investigation; no fabricated state is needed to finish.",
    }),
    scene("pat_entry", "Twelve F", "apartment", {
      prose: "Pat opened the door just far enough to recognize me. In the street below, an extra edition was already turning suspicion into certainty: JAY ARNOLD SOUGHT.",
      dialogueBeats: [
        beat("pat1", "pat", "The detectives were at your desk. I knew you'd recognize a name that wasn't yours.", { conditionRule: { requiresFlags: [id("code")] } }),
        beat("pat1_wrong", "pat", "Next time a woman calls you by the wrong name, consider that she may be saving your neck.", { conditionRule: { requiresFlags: [id("exposed")] } }),
        beat("pat2", "pat", "You look as if you haven't slept since Monday. There's water on the table. And before you decide my apartment is safe: Mrs. Peters cleans here too."),
        beat("pat3", "jay", "I had mistaken familiarity for innocence all day. I didn't want to do it again."),
      ],
      choices: [
        choice("stay_alert", "Check the apartment together before resting.", "apartment", { consequences: { setFlags: [id("pat_alert")] } }),
        choice("rest", "Sit down for a minute. Let exhaustion have its way.", "radio", { consequences: { setFlags: [id("drowsy")] } }),
      ],
      note: "Pat is a collaborator, never a sexualized victim. The rest branch costs time in fiction but remains recoverable. The explicit bolt/neighbor action in the room determines her protection.",
    }),
    scene("radio", "Three hours gone", "apartment", {
      prose: "I meant to close my eyes for a moment. Pat woke me with a hand on my shoulder and the radio turned high. The clock had lost three hours on my behalf.",
      dialogueBeats: [beat("wake1", "pat", "Jay. Listen. They've named another victim. And they've searched your apartment."), beat("wake2", "jay", "There would be time to hate myself later. There was work to do now.")],
      choices: [choice("wake_up", "Get up. Check the radio, the door and the telephone.", "apartment")],
      note: "An explicit cost-of-delay beat without a real-world timer. The player keeps agency and can still protect Pat, call backup and solve the case.",
    }),
    scene("apartment", "A refuge with too many keys", "apartment", {
      nodeType: "stage", stage: { ...floor, enterCaption: "Record the bulletin. Bolt Pat's door, call backup and examine her archive before taking the fire escape." },
      note: "ROOM 5. Radio is the only departure gate. Gold needs safe Pat + backup + a case made from the archive deduction. Archive puzzle is retryable and closable. Wrong submissions never consume its marker. All optional tasks are offered BEFORE the irreversible Act III exit.",
      hotspots: [
        { id: id("radio_bulletin"), label: "Record the radio bulletin", cursor: "use", bounds: { x: 35, y: 52, w: 13, h: 28 }, action: { type: "giveItem", itemGranted: id("bulletin"), flagSet: id("radio"), text: "Rosetta Lawson is dead. A supposed branding instrument was found in your apartment. Pat notes the time: you were elsewhere. The instrument was planted by someone who already had a key." } },
        { id: id("bolt_door"), label: "Secure Pat's door", cursor: "use", bounds: { x: 88, y: 35, w: 10, h: 38 }, action: { type: "showText", flagSet: id("pat_safe"), text: "Pat bolts the door herself, then telephones her neighbor. She will wait there, with a witness, until O'Leary arrives. Nobody else will be left alone for the sake of your investigation." }, states: [{ id: id("pat_protected"), when: { requiresFlags: [id("pat_safe")] }, label: "Pat has a safe place", action: { type: "showText", text: "The bolt is set. Her neighbor is expecting her. You have done something fear alone could not do." } }] },
        { id: id("backup_call"), label: "Telephone O'Leary", cursor: "use", bounds: { x: 74, y: 53, w: 10, h: 12 }, gating: { requiresFlags: [id("radio")] }, customFailMessage: "Record the radio bulletin first so you can give O'Leary facts, not just a plea.", action: { type: "showText", flagSet: id("backup"), text: "You give O'Leary the broadcast time, Pat's account and the location of the garden passage. He promises officers at the mansion. Whatever you withheld earlier, he has the truth now." }, states: [{ id: id("backup_set"), when: { requiresFlags: [id("backup")] }, label: "Backup is on its way", action: { type: "showText", text: "O'Leary is taking the garden entrance seriously. You do not need to call twice." } }] },
        { id: id("archive_puzzle"), label: "Examine Pat's archive", cursor: "use", bounds: { x: 49, y: 64, w: 11, h: 15 }, action: { type: "patternPuzzle", patternPuzzle: {
          title: "A name beneath the dust", instruction: "Find TWO records about the same Peters family: the builder of the black room, and the inquest into his daughter's death. Not rumor or coincidence.",
          targetCount: 2, allowRetry: true,
          rows: [
            { id: id("row_builder"), date: "1909", description: "Building register — Elias Peters: Starr house and private garden passage", amount: "SIGNED", isAnswer: true },
            { id: id("row_inquest"), date: "1913", description: "Inquest — Ruth Peters, daughter of builder Elias; factory dispute", amount: "FILED", isAnswer: true },
            { id: id("row_sermon"), date: "1936", description: "Anonymous letter — a preacher claims the marks are supernatural", amount: "RUMOR", isAnswer: false },
            { id: id("row_hotel"), date: "1936", description: "Hotel register — Henry Starr leaves Boston without a forwarding address", amount: "RECENT", isAnswer: false },
            { id: id("row_other"), date: "1910", description: "Marriage notice — Edward Peterson, a merchant from another city", amount: "NOTICE", isAnswer: false },
          ],
          payoffText: "The same father. The same address. Pat adds the failed loan appeal naming all four families. Open the corkboard and connect Pat's archive to Mr. Peters.",
          rewardConsequences: { addItems: [id("archive")], setFlags: [id("archive_found")] },
          wrongMessage: "A similar name or an ominous claim isn't evidence. Match ELIAS PETERS in the building register and his daughter's inquest. You can retry without penalty.",
        } }, states: [{ id: id("archive_done"), when: { requiresFlags: [id("archive_found")] }, label: "Review the archive finding", action: { type: "showText", text: "Elias Peters built the room. Ruth was his daughter. The loan refusal names the four families. Connect Pat's archive to Mr. Peters on the corkboard." }, cursor: "look" }], isRepeatable: true },
        exit("fire_escape", "Leave by the fire escape", "return", 8, { gating: { requiresFlags: [id("radio")] }, customFailMessage: "Listen to the radio first. Before leaving, you can also protect Pat, call O'Leary and finish her archive—this is your last chance to prepare." }),
      ],
    }),
    scene("return", "The third janitor", "garden", {
      onEnterActions: [{ consequences: { addItems: [id("shovel")] } }],
      prose: "The fire escape led to a caretaker's storeroom. I borrowed a coat and shovel, left a note, and walked back to the mansion. A constable's torch found me at the hedge.",
      dialogueBeats: [
        beat("return1", "narrator", "\"How many janitors does this place have?\" the constable asked. \"I've already seen one with a truck.\""),
        beat("return2", "jay", "A truck. A shovel. Ordinary jobs, if you didn't count them too carefully."),
      ],
      choices: [
        choice("patrol_truth", "O'Leary sent you. Watch the garden door; listen for an alarm.", "hall", { gating: { requiresFlags: [id("backup")] } }),
        choice("janitor_bluff", "The ashes are my job. Keep an ear open, officer.", "hall"),
      ],
      note: "ACT III. Shovel is guaranteed, giving every run an alarm option even if the player skipped both crafting and backup. Neither approach demands a perfect case or a confession.",
    }),
    scene("hall", "H. S.", "library", {
      prose: "A hat and walking stick lay under the hall lamp. H. S. Henry Starr was home. For a moment that seemed to solve everything. Then I remembered how conveniently every other clue had pointed at me.",
      dialogueBeats: [beat("hall1", "jay", "A man can return to his own house for more than one reason. Find him before you name him." )],
      choices: [
        choice("garden_entry", "Follow the house plan. Approach by the garden passage.", "reveal", { gating: { requiresFlags: [id("plan_taken"), id("hidden_door")] }, consequences: { setFlags: [id("garden_entry")] } }),
        choice("library_entry", "Open the black door from the library.", "trap"),
      ],
      note: "Two actual approaches to the same confrontation. The cautious route lets Jay hear a sentence first; both retain a fair escape. House-plan gating uses collected flags, not a potentially removed item.",
    }),
    scene("trap", "The soft thing in the dark", "dream", {
      prose: "A click inside the room. I reached for the switch. Something fell over my head; there was a struggle and then a short, merciful gap in the night.",
      onEnterActions: [{ consequences: { setFlags: [id("trapped")] } }],
      dialogueBeats: [beat("trap1", "jay", "When the light returned, my wrists were tied to a chair. Victoria sat opposite me. Henry Starr was beside her. So much for my theory." )],
      choices: [choice("trap_continue", "Look at who is still standing", "reveal")],
      note: "Non-graphic ambush. No procedural depiction of incapacitation. The source's capture is a branch, not a mandatory punishment for investigating.",
    }),
    scene("reveal", "The hands behind the mark", "chamber", {
      prose: "Old Peters and his wife stood in the rose-colored light. Nothing below either waist was inhuman. Somehow that was worse.",
      dialogueBeats: [
        beat("reveal_garden", "jay", "Through the garden door I heard Marne say, 'The iron is in his apartment.' Then Peters turned. I had time to see Victoria alive before he made me put the shovel down.", { conditionRule: { requiresFlags: [id("garden_entry")] } }),
        beat("reveal1", "starr", "I came home when Arthur reached me. They were waiting. Jay, listen to Victoria—she knows where the bell pull is."),
        beat("reveal2", "marne", "I left the evidence exactly where they would look. Your room. Your name. People believe what has been put in the proper place."),
        beat("reveal3", "peters", "I built this house. Those fathers knew me then. When my business failed, not one would help. Our daughter went to a factory and never came home. Years later they gave us work—and not one of them remembered."),
        beat("reveal4", "victoria", "What happened to your daughter was wrong. What you did to Lorna and Rosetta was wrong. You do not get to make one erase the other."),
        beat("reveal5", "jay", "They tied me into the third chair. Peters wanted an audience. I had evidence in my head, a casebook within reach, and a few seconds in which to make him keep talking."),
      ],
      choices: [
        choice("make_case", "State the case: Peters built the room. Marne manufactured the evidence.", "signal", { gating: { requiresFlags: [id("motive")] }, consequences: { setFlags: [id("case_made")] } }),
        choice("save_people", "Forget the argument. Concentrate on getting everyone out.", "signal"),
        choice("rush_captor", "Rush Peters with no alarm and no leverage.", "caught"),
      ],
      note: "Corkboard remains available: connect Pat's archive to Mr. Peters to open the reasoned accusation. Marne is now an encountered suspect, so the optional keys deduction becomes available too. Motive is explanation, not justification.",
    }),
    scene("signal", "An ordinary sound", "chamber", {
      prose: "Peters had mistaken silence for surrender. Victoria looked past him toward the service-bell pull. The shovel lay by my foot. Outside the walls, people still had ears.",
      dialogueBeats: [
        beat("admission", "peters", "Yes, the room was mine. The keys were ours. The mark was a device. We gave your city the devil it wanted, and you were going to wear its face.", { conditionRule: { requiresFlags: [id("case_made")] } }),
        beat("signal1", "victoria", "Jay. Not him. The bell."),
      ],
      choices: [
        choice("hook_alarm", "Reach the service-bell pull with the padded hook.", "rescue", { presentItem: id("hook"), gating: { requiresFlags: [id("bell")] }, consequences: { setFlags: [id("alarm"), id("precise")] } }),
        choice("shovel_alarm", "Kick the shovel against the metal door. Three hard knocks.", "rescue", { consequences: { setFlags: [id("alarm")] } }),
        choice("call_patrol", "Call to O'Leary's patrol at the garden door.", "rescue", { gating: { requiresFlags: [id("backup")] }, consequences: { setFlags: [id("alarm")] } }),
      ],
      note: "No timed choices. Three independently tested alarm routes. Guaranteed shovel is the safety valve; crafting is a satisfying alternative, not a mandatory obscure recipe. Evidence and rescue are separate achievements.",
    }),
    scene("rescue", "One janitor too many", "library", {
      prose: "The first shout beyond the panel was Arthur's. The second belonged to the constable. There should have been one janitor, he said. A truck and a shovel had made three.",
      dialogueBeats: [
        beat("rescue_knock", "narrator", "Three knocks. Then an answering fist against the panel.", { silent: true, audioUrl: sound("knock"), conditionRule: { excludesFlags: [id("precise")] } }),
        beat("rescue_bell", "arthur", "That bell is in the black room. I told him I would listen.", { conditionRule: { requiresFlags: [id("precise")] } }),
        beat("rescue_backup", "oleary", "Arnold told us about the garden passage. Open both doors. Now.", { conditionRule: { requiresFlags: [id("backup")] } }),
        beat("rescue_no_backup", "arthur", "The sound came from behind the panel. There's a room there. I don't care if I'm dismissed for telling you.", { conditionRule: { excludesFlags: [id("backup")] } }),
        beat("rescue1", "jay", "A lock gave way. Human beings came through an ordinary door. Victoria was the first to stand, and the first to ask where Pat was."),
        beat("rescue_pat", "oleary", "Safe with her neighbor. She has her notes. She was quite particular that we keep them.", { conditionRule: { requiresFlags: [id("pat_safe")] } }),
      ],
      choices: [
        choice("file_truth", "Put every name, every witness and every document into the record.", "gold", { gating: { requiresFlags: [id("case_made"), id("backup"), id("pat_safe")] } }),
        choice("choose_living", "Get Victoria into the morning air. The living come first.", "silver"),
      ],
      note: "Gold needs a proved case, planned backup and protection for Pat. Silver remains available even on a perfect run: the player may prioritize leaving over assembling the final record. No random checks or secret meter thresholds.",
    }),
    scene("gold", "No devil but a human one", "cover", {
      isEnding: true, musicLevel: 0.2,
      prose: "The papers printed a correction smaller than the accusation. It was enough. Pat's records, the hidden route, the keys and the witnesses left no room for the devil they had invented. Lorna and Rosetta were named as people, not as symbols.",
      endingData: { tier: "victory-gold", headline: "NO DEVIL BUT A HUMAN ONE", recap: "Victoria and Henry are safe. Pat has protection and a witnessed account. O'Leary has the case you assembled, not the one planted for him. The Peters couple will answer for their crimes. The dream remains the only fact that refuses an ordinary explanation." },
      dialogueBeats: [
        beat("gold1", "victoria", "You let me share the truth. Keep doing that when remembering becomes harder than forgetting.", { conditionRule: { requiresFlags: [id("shared_dream")] }, recalls: { bmb_promise: "You told me, '{said}' You kept that promise. Don't let the newspapers tell you otherwise." } }),
        beat("gold2", "jay", "We would heal. We would marry when we were ready, not when the world decided the marks were sufficiently invisible. But I never learned why I had dreamed that room."),
      ],
      note: "GOLD. The source's unexplained dream is preserved. Healing is not a requirement for Victoria to deserve love. Original source credit is in the title and briefing.",
    }),
    scene("silver", "The living come first", "garden", {
      isEnding: true,
      prose: "We came out alive. That was not a small thing. But a narrow rescue and a complete case are different kinds of victory; the paperwork would follow us longer than the bruises.",
      endingData: { tier: "victory-silver", headline: "THE LIVING COME FIRST", recap: "You rescued Victoria and her father. The Peters couple were stopped, but you left without the full, protected chain of witnesses and documentary proof—or chose not to finish that record. Next time: protect Pat, telephone O'Leary, connect her archive to Peters on the corkboard, and state the case before raising the alarm." },
      dialogueBeats: [beat("silver1", "victoria", "No more explaining tonight. Sit with me until the sun comes up."), beat("silver2", "jay", "When I closed my eyes, I saw the room again. This time its doors were open.")],
      note: "SILVER / SURVIVAL. This is a valid ending, not a softlock or a secret failure. Recap offers a specific replay route without pretending a random outcome was skill.",
    }),
    scene("framed", "A case too neat", "office", {
      isEnding: true,
      prose: "A threat in my office. An instrument in my apartment. My name on every tongue. I had offered certainty where the record needed proof. O'Leary could not simply wave the evidence away because I disliked its conclusion.",
      endingData: { tier: "gameover", headline: "A CASE TOO NEAT", recap: "The official story closed around Jay before the investigation was ready. Victoria is still missing. Preserve the evidence, hear Pat's warning, and arrange a witnessed backup plan rather than surrendering to the planted story." },
      note: "BAD END 1. Reachable from premature surrender. Off-screen uncertainty, no graphic punishment. A new run remains available through the normal ending screen.",
    }),
    scene("caught", "The door stays shut", "dream", {
      isEnding: true,
      prose: "I moved toward Peters when I should have moved the world outside the room. He stepped back, and the chance to make an ordinary sound was gone.",
      endingData: { tier: "gameover", headline: "THE DOOR STAYS SHUT", recap: "A desperate rush gave the captors control of the room. The people beyond the wall never heard the alarm in time. You had a shovel, perhaps a padded hook, perhaps a waiting patrol. Use one of those advantages instead of giving them away." },
      note: "BAD END 2. Only the explicitly reckless final choice leads here. No graphic violence. Every prepared or unprepared investigation has a safe alarm alternative.",
    }),
  ],
};

// Readable act lanes in Studio. No auto-layout dependency or browser-only data.
const lanes: string[][] = [
  ["title", "dream", "call", "library", "chamber"],
  ["office_intro", "office", "oleary", "missing", "garden", "peters", "phone", "wrong_line", "pat_entry", "radio", "apartment"],
  ["return", "hall", "trap", "reveal", "signal", "rescue", "gold", "silver"],
  ["framed", "caught"],
];
BLACK_MASS_BRIDE.layout = Object.fromEntries(lanes.flatMap((lane, row) => lane.map((key, col) => [id(key), { x: col * 340, y: row * 440 }])));
