import type { Story } from "../types";

/**
 * NOBODY'S WITNESS — a three-act noir graphic novel.
 *
 * Act One, Part 1 — "The Woman Who Sold Herself Twice": Vera Voss hires Jack
 *   Morrow to find David Voss at the Neon Diner. First-person V.O. narration
 *   with conversational reply branching.
 * Act One, Part 2 — "The Wrong Kind of Regulars": Moe & Desh at the corner
 *   store, a self-checkout conspiracy tangent, and the tip-off that proves Vera
 *   sold Jack out to Solomon's crew.
 * Act One, Part 3 — "A Trail Too Clean to Trust": the folder is a fabricated
 *   map; Jack is ambushed and knocked out.
 * Act One, Part 4 — captured: improvise a tool (crafting), escape, gunfight.
 * Act Two — Rosa clocks the con before Jack does; David is found alive with the
 *   real story (a heist with a fuse); first twist lands: David ran WITH Vera's
 *   blessing.
 * Act Three — Solomon closes in; David tries to run alone with the money; Jack
 *   can out-maneuver all three endgames, side with Vera and let her win, warn
 *   David and let him run, cut the fuse, or vanish — a spread of outcomes that
 *   all reach a bittersweet, ambiguous close.
 *
 * Eight endings: two gold (out-maneuver everyone / side with Vera), three
 * silver (cut the fuse / warn David / vanish), and three game-overs (turn the
 * case down / accuse empty / get caught by the heat).
 */
export const NOBODYS_WITNESS: Story = {
  id: "nobodys-witness",
  title: "Nobody's Witness (2026 Draft)",
  tagline: "She sold herself twice. Jack Morrow was only ever buying the first time.",
  coverImage: "/img/cover-nobodys-witness.jpg",
  startSceneId: "nw_credits",
  briefing: {
    objective: "Find David Voss — and decide whose witness you'll be at the end.",
    winConditions: [
      "Ask the right questions and follow the trail too clean to trust.",
      "Discover David is alive and learn the heist with a fuse.",
      "Choose an ending: out-maneuver them all, side with Vera, cut the fuse, or warn David.",
    ],
    loseConditions: [
      "Let Suspicion reach 6 — Solomon's crew catches you first.",
      "Confront Solomon with nothing but nerve.",
      "Turn the case down before it begins.",
    ],
    heatLimit: 6,
    heatFailSceneId: "nw_end_gameover",
  },
  layout: {
    nw_credits: { x: 0, y: 220 },
    nw_diner: { x: 320, y: 220 },
    nw_talking: { x: 480, y: 340 },
    nw_mart: { x: 640, y: 220 },
    nw_office: { x: 960, y: 220 },
    nw_ambush: { x: 1280, y: 220 },
    nw_captured: { x: 1600, y: 220 },
    nw_fight: { x: 1920, y: 220 },
    nw_rosa: { x: 2240, y: 220 },
    nw_david: { x: 2560, y: 220 },
    nw_twist: { x: 2880, y: 220 },
    nw_solomon: { x: 3200, y: 220 },
    nw_betrayal: { x: 3520, y: 220 },
    nw_endgame: { x: 3840, y: 220 },
    nw_end_gold: { x: 4160, y: -20 },
    nw_end_vera: { x: 4160, y: 100 },
    nw_end_silver: { x: 4160, y: 220 },
    nw_end_warn: { x: 4160, y: 340 },
    nw_end_vanish: { x: 4160, y: 460 },
    nw_end_refusal: { x: 4160, y: 580 },
    nw_end_gameover: { x: 4160, y: 700 },
  },
  characters: [
    { id: "jack", name: "Jack Morrow", role: "Private Detective / Narrator", avatarUrl: "/img/ch-jack-morrow.jpg", trustMeter: 0, voice: { pitch: 0.72, rate: 0.9 } },
    { id: "vera", name: "Vera Voss", role: "The Client", avatarUrl: "/img/ch-vera-nobody.jpg", trustMeter: 0, voice: { pitch: 1.15, rate: 0.88 } },
    { id: "david", name: "David Voss", role: "The Missing Husband", avatarUrl: "/img/ch-david-voss.jpg", trustMeter: 0, voice: { pitch: 0.8, rate: 0.95 } },
    { id: "solomon", name: "Solomon Reyes", role: "The Man Who Curates Debts", avatarUrl: "/img/ch-solomon-reyes.jpg", trustMeter: 0, voice: { pitch: 0.62, rate: 0.88 } },
    { id: "rosa", name: "Rosa", role: "All-Night Waitress / Eyes on the Street", avatarUrl: "/img/ch-rosa.jpg", trustMeter: 0, voice: { pitch: 1.05, rate: 0.95 } },
    { id: "moe", name: "Moe", role: "Night Clerk", avatarUrl: "/img/ch-moe.jpg", trustMeter: 0, voice: { pitch: 1.1, rate: 1.0 } },
    { id: "desh", name: "Desh", role: "Counter Kid", avatarUrl: "/img/ch-desh.jpg", trustMeter: 0, voice: { pitch: 1.15, rate: 1.05 } },
  ],
  items: [
    { id: "manila_folder", name: "Manila Folder", icon: "📂", description: "Everything Vera had on David Voss — bank statements, last known contacts, and a photo of a man the city keeps losing.", flavorText: "Paper. Old-fashioned. Something you can hold and trust the weight of.", isClue: true },
    { id: "tipoff_photo", name: "Security Still", icon: "📸", description: "A grainy still of the lot outside the corner store — a woman, late thirties, dark hair, phone to her ear.", flavorText: "A phone call made the moment you left the diner.", isClue: true },
    { id: "fabricated_map", name: "The Fabricated Map", icon: "🗺️", description: "The folder's map, folded too neatly: every stop on the trail, marked and waiting.", flavorText: "A trail too clean to trust.", isClue: true },
    { id: "bent_nail", name: "Bent Nail", icon: "🔩", description: "A loose nail worked out of the chair they tied you to.", flavorText: "Patience is its own kind of tool.", combinableWith: { targetItemId: "matchbook", resultItemId: "shim" } },
    { id: "matchbook", name: "Matchbook", icon: "🔥", description: "A book of matches from the Neon Diner, left under your chair.", flavorText: "Somebody's bad habit, and your good luck." },
    { id: "shim", name: "Improvised Shim", icon: "🗝️", description: "A bent nail wrapped in matchbook cardboard — stiff enough to jimmy a cheap lock.", flavorText: "Every cell has a loose tooth if you look long enough." },
    { id: "heist_ledger", name: "Heist Ledger", icon: "📒", description: "David's ledger: the job, the split, and the fuse.", flavorText: "Money always leaves a signature.", isClue: true },
    { id: "rosa_report", name: "Rosa's Report", icon: "📰", description: "Rosa's notes on Solomon's crew — boats, men, and a window on the docks.", flavorText: "The street sees everything, eventually.", isClue: true },
  ],
  deduction: {
    suspectIds: ["vera", "david", "solomon"],
    connections: [
      { a: "fabricated_map", b: "vera", flagSet: "vera_lied", revelation: "The folder was a fabricated map — Vera wanted Jack to walk the decoy trail." },
      { a: "tipoff_photo", b: "vera", flagSet: "vera_tipped_board", revelation: "Vera tipped Solomon's crew the moment Jack left the diner." },
      { a: "heist_ledger", b: "david", flagSet: "david_heist", revelation: "David never disappeared — he was the inside man on a heist with a fuse." },
      { a: "rosa_report", b: "solomon", flagSet: "solomon_moves", revelation: "Solomon's crew is already moving on the docks." },
    ],
  },
  scenes: [
    /* ================================================================ */
    {
      id: "nw_credits",
      title: "Opening Credits",
      nodeType: "credits",
      noTypewriter: true,
      credits: { titleEntrance: "fade-up", accentColor: "#e8b23c", lines: [{ role: "Starring", name: "Vera Voss" }, { role: "Directed by", name: "Gaslight Reelworks" }] },
      background: "gradient:linear-gradient(160deg,#07111e 0%,#1d0c22 55%,#07070c 100%)",
      ambientAudio: "drone",
      musicMode: "track",
      musicUrl: "/Soundtrack.mp3",
      prose: "NOBODY'S WITNESS\n\nA Graphic Novel in Three Acts\n\nStarring Vera Voss\n\nTap Begin",
      choices: [{ id: "nwc_begin", text: "Begin", targetSceneId: "nw_diner", attitudeTag: "Neutral" }],
      hotspots: [],
      dialogueBeats: [],
    },
    /* ================================================================ */
    {
      id: "nw_diner",
      title: "Act One — Part One: The Woman Who Sold Herself Twice",
      background: "/img/bg-neon-diner.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "track",
      musicUrl: "/Midnight%20in%20the%20Rain2.mp3",
      narrationAudioUrl: "/narrator_intro.mp3",
      cinematic: {
        mode: "pan",
        focalPoint: "50% 40%",
        zoomDuration: 14,
        dimAmount: 0.14,
        lights: [
          { x: 24, y: 22, color: "#ff2e88", intensity: 0.3, size: 34, pulseSeconds: 3.2, pulseAmount: 1 },
          { x: 74, y: 34, color: "#e8b23c", intensity: 0.26, size: 42, pulseSeconds: 2.8, pulseAmount: 0.8 },
        ],
      },
      prose:
        "Eleven forty-seven at night, and the Neon Diner had exactly one customer worth mentioning. Me. Tie loosened like it had given up on me hours ago. Coffee gone cold — I wasn't drinking it, I was just keeping it company. Phone face-down on the table. Some nights you don't want to know what it's got to say. Turned out that night, I didn't need the phone. The thing I should've been scared of walked in through the front door instead.",
      dialogueBeats: [
        { id: "nwd_v1", characterId: "vera", expression: "sizing him up", text: "You're the guy still running a burner phone in twenty-twenty-six. That's either real disciplined or real paranoid." },
        { id: "nwd_j1", characterId: "jack", expression: "dry", text: "Where I come from, those are the same word." },
        { id: "nwd_v2", characterId: "vera", expression: "unreadable", text: "Where do you come from?" },
        { id: "nwd_j2", characterId: "jack", expression: "flat", text: "Nowhere that stuck." },
        { id: "nwd_n1", characterId: "jack", expression: "V.O.", text: "I've got a bad habit of talking like the last line of a movie nobody made yet. She smiled like she'd already seen that movie. Twice. And didn't care much for the ending either time." },
        { id: "nwd_v3", characterId: "vera", expression: "measured", background: "/img/bg-vera-window.jpg", cinematic: { mode: "zoom-hold", focalPoint: "50% 42%", zoomDuration: 6, dimAmount: 0.18, lights: [{ x: 50, y: 30, color: "#ff2e88", intensity: 0.28, size: 40, pulseSeconds: 3.0, pulseAmount: 0.9 }] }, backgroundTransition: "crossfade", backgroundTransitionSpeed: 0.7, text: "My husband's missing." },

        { id: "nwd_v4a", characterId: "vera", expression: "matter-of-fact", conditionRule: { requiresFlags: ["asked_how"] }, text: "Three weeks. No calls, no cards used, no body. Police say he probably ran. I'd like a second opinion." },
        { id: "nwd_v4b", characterId: "vera", expression: "cool", conditionRule: { requiresFlags: ["asked_whynow"] }, text: "I called three others first. They all told me he ran. I want someone who doesn't like that answer." },
        { id: "nwd_v4c", characterId: "vera", expression: "wry", conditionRule: { requiresFlags: ["asked_fromtop"] }, text: "The beginning's the problem. There's no clean one. Three weeks ago, he simply stopped being there." },

        { id: "nwd_j3", characterId: "jack", expression: "professional", conditionRule: { requiresFlags: ["asked_how", "asked_whynow", "asked_fromtop"], requiresAll: false }, text: "Cops are usually right about the running part." },
        { id: "nwd_v5", characterId: "vera", expression: "a small, unreadable smile", background: "/img/bg-diner-booth.jpg", backgroundTransition: "crossfade", backgroundTransitionSpeed: 0.6, conditionRule: { requiresFlags: ["asked_how", "asked_whynow", "asked_fromtop"], requiresAll: false }, text: "I know. That's not the part I'm paying you to find out." },
        { id: "nwd_n2", characterId: "jack", expression: "V.O.", conditionRule: { requiresFlags: ["asked_how", "asked_whynow", "asked_fromtop"], requiresAll: false }, text: "No drive this time. Paper. Old-fashioned. I remember thinking that was almost a relief — something I could hold in my hand and trust the weight of. I want you to remember I thought that. It's going to be funny later." },
        { id: "nwd_j4", characterId: "jack", expression: "neutral", conditionRule: { requiresFlags: ["asked_how", "asked_whynow", "asked_fromtop"], requiresAll: false }, text: "What's his name?" },
        { id: "nwd_v6", characterId: "vera", expression: "even", conditionRule: { requiresFlags: ["asked_how", "asked_whynow", "asked_fromtop"], requiresAll: false }, text: "David Voss." },
        { id: "nwd_n3", characterId: "jack", expression: "V.O.", conditionRule: { requiresFlags: ["asked_how", "asked_whynow", "asked_fromtop"], requiresAll: false }, text: "Voss. I knew the name the way you know a name you've heard in a bar full of the wrong kind of people — not personally, but personally enough. David Voss ran numbers for a man named Solomon Reyes. A man who didn't so much collect debts as curate them. If David Voss disappeared owing Solomon Reyes anything, David Voss wasn't missing. David Voss was hiding, and there's a world of difference between the two — mostly involving how long you get to stay that way." },

        { id: "nwd_v7a", characterId: "vera", expression: "unbothered, like the question cost her nothing", conditionRule: { requiresFlags: ["asked_reyes"] }, text: "Everybody in this city does business with Solomon Reyes eventually. Some of us just don't advertise it over coffee." },
        { id: "nwd_v7b", characterId: "vera", expression: "crisp", conditionRule: { requiresFlags: ["asked_cops"] }, text: "The cops don't ask questions they don't want answered. I do. That's the difference." },
        { id: "nwd_v7c", characterId: "vera", expression: "hard", conditionRule: { requiresFlags: ["asked_suspect"] }, text: "If I already knew what happened, Mr. Morrow, I wouldn't need a detective. I'd need an alibi." },

        { id: "nwd_n4", characterId: "jack", expression: "V.O.", conditionRule: { requiresFlags: ["asked_reyes", "asked_cops", "asked_suspect"], requiresAll: false }, text: "There it was again — that smile that already knew the ending. I should've asked myself right then why a woman hiring a man to find her husband was so calm about the idea that her husband might be the kind of man worth hiding from. I didn't ask myself that. I asked myself something dumber instead." },

        { id: "nwd_v8a", characterId: "vera", expression: "quiet, almost gentle, almost honest", conditionRule: { requiresFlags: ["asked_whyleft"] }, text: "I want to know he's somewhere he chose to be. That's all. Whatever that turns out to mean." },
        { id: "nwd_v8b", characterId: "vera", expression: "cold", conditionRule: { requiresFlags: ["asked_whatif"] }, text: "Careful, Mr. Morrow. I didn't come here to be read. I came here to hire you." },
        { id: "nwd_v8c", characterId: "vera", expression: "knowing", conditionRule: { requiresFlags: ["asked_lost"] }, text: "Spoken like a man who's been lost. Maybe that's exactly why I picked you." },

        { id: "nwd_n5", characterId: "jack", expression: "V.O.", conditionRule: { requiresFlags: ["asked_whyleft", "asked_whatif", "asked_lost"], requiresAll: false }, text: "Now that — that was the first true thing she said to me all night. I didn't know it yet. Wouldn't know it for two more weeks, matter of fact. But I've replayed that line in my head more times than I've replayed anything else she ever told me, and I still can't decide if it was a confession or an alibi. Maybe with her those were always the same sentence." },
        { id: "nwd_v9", characterId: "vera", expression: "businesslike", background: "/img/bg-folder-closeup.jpg", cinematic: { mode: "static", dimAmount: 0.22, lights: [{ x: 50, y: 45, color: "#e8b23c", intensity: 0.32, size: 40, pulseSeconds: 3.0, pulseAmount: 0.9 }] }, backgroundTransition: "crossfade", backgroundTransitionSpeed: 0.7, conditionRule: { requiresFlags: ["asked_whyleft", "asked_whatif", "asked_lost"], requiresAll: false }, text: "Everything I've got is in there. Bank statements. Last known contacts. A photo, if you need to remind yourself what he looks like once you're three drinks into asking about him in the wrong bars." },
        { id: "nwd_j5", characterId: "jack", expression: "wry", conditionRule: { requiresFlags: ["asked_whyleft", "asked_whatif", "asked_lost"], requiresAll: false }, text: "You know me well for a first date." },
        { id: "nwd_v10", characterId: "vera", expression: "putting armor back on", conditionRule: { requiresFlags: ["asked_whyleft", "asked_whatif", "asked_lost"], requiresAll: false }, text: "I know men like you well, Mr. Morrow. That's not the same thing. Try not to confuse the two — it'll save us both some time." },
        { id: "nwd_n6", characterId: "jack", expression: "V.O.", background: "/img/bg-neon-diner.jpg", backgroundTransition: "crossfade", backgroundTransitionSpeed: 0.7, conditionRule: { requiresFlags: ["asked_whyleft", "asked_whatif", "asked_lost"], requiresAll: false }, text: "And that was it. No card with a number this time. Just a folder, a name I didn't like, and a feeling in my gut that I'd just been hired to go looking for something a lot more specific than a missing husband — even if I didn't have the first idea yet what that something was." },
      ],
      choices: [
        { id: "nwd_r1a", text: "\"How missing?\"", targetSceneId: "", reply: true, exclusiveGroup: "d1", attitudeTag: "Clever", consequences: { setFlags: ["asked_how"], meterChanges: [{ meter: "Clever", delta: 1 }] } },
        { id: "nwd_r1b", text: "\"Three weeks and you're only now calling me?\"", targetSceneId: "", reply: true, exclusiveGroup: "d1", attitudeTag: "Aggressive", consequences: { setFlags: ["asked_whynow"], meterChanges: [{ meter: "Aggressive", delta: 1 }] } },
        { id: "nwd_r1c", text: "\"Sit down. Start at the beginning.\"", targetSceneId: "", reply: true, exclusiveGroup: "d1", attitudeTag: "Sultry", consequences: { setFlags: ["asked_fromtop"], meterChanges: [{ meter: "Sultry", delta: 1 }], trustChanges: [{ characterId: "vera", delta: 1 }] } },

        { id: "nwd_r2a", text: "\"Your husband do business with Solomon Reyes?\"", targetSceneId: "", reply: true, exclusiveGroup: "d2", hidden: true, attitudeTag: "Clever", gating: { requiresFlags: ["asked_how", "asked_whynow", "asked_fromtop"], requiresAll: false }, consequences: { setFlags: ["asked_reyes"], meterChanges: [{ meter: "Clever", delta: 1 }] } },
        { id: "nwd_r2b", text: "\"The cops must've checked his books. What'd they miss?\"", targetSceneId: "", reply: true, exclusiveGroup: "d2", hidden: true, attitudeTag: "Clever", gating: { requiresFlags: ["asked_how", "asked_whynow", "asked_fromtop"], requiresAll: false }, consequences: { setFlags: ["asked_cops"], meterChanges: [{ meter: "Clever", delta: 1 }] } },
        { id: "nwd_r2c", text: "\"You already know what happened, don't you?\"", targetSceneId: "", reply: true, exclusiveGroup: "d2", hidden: true, attitudeTag: "Aggressive", gating: { requiresFlags: ["asked_how", "asked_whynow", "asked_fromtop"], requiresAll: false }, consequences: { setFlags: ["asked_suspect"], meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }], trustChanges: [{ characterId: "vera", delta: -1 }] } },

        { id: "nwd_r3a", text: "\"If I find him — do you want him back, or do you want to know why he left?\"", targetSceneId: "", reply: true, exclusiveGroup: "d3", hidden: true, attitudeTag: "Clever", gating: { requiresFlags: ["asked_reyes", "asked_cops", "asked_suspect"], requiresAll: false }, consequences: { setFlags: ["asked_whyleft"], meterChanges: [{ meter: "Clever", delta: 1 }] } },
        { id: "nwd_r3b", text: "\"What if I find out you don't want him found at all?\"", targetSceneId: "", reply: true, exclusiveGroup: "d3", hidden: true, attitudeTag: "Aggressive", gating: { requiresFlags: ["asked_reyes", "asked_cops", "asked_suspect"], requiresAll: false }, consequences: { setFlags: ["asked_whatif"], meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }], trustChanges: [{ characterId: "vera", delta: -1 }] } },
        { id: "nwd_r3c", text: "\"You sure you want him back? Some men are better lost.\"", targetSceneId: "", reply: true, exclusiveGroup: "d3", hidden: true, attitudeTag: "Sultry", gating: { requiresFlags: ["asked_reyes", "asked_cops", "asked_suspect"], requiresAll: false }, consequences: { setFlags: ["asked_lost"], meterChanges: [{ meter: "Sultry", delta: 1 }], trustChanges: [{ characterId: "vera", delta: 1 }] } },

        { id: "nwd_take", text: "Take the folder. Take the case.", targetSceneId: "nw_talking", hidden: true, attitudeTag: "Clever", gating: { requiresFlags: ["asked_whyleft", "asked_whatif", "asked_lost"], requiresAll: false }, consequences: { setFlags: ["took_case"], addItems: ["manila_folder"], meterChanges: [{ meter: "Clever", delta: 1 }], trustChanges: [{ characterId: "vera", delta: 1 }] } },
        { id: "nwd_walk", text: "Turn her down. Walk out into the rain.", targetSceneId: "nw_end_refusal", attitudeTag: "Neutral", consequences: { setFlags: ["walked_away"] } },
      ],
      hotspots: [],
    },
    /* ================================================================ */
    {
      id: "nw_talking",
      title: "Act One — Part One: The Woman on the Tape",
      nodeType: "cutscene",
      background: "video:/b_talking_woman.mp4",
      ambientAudio: "drone",
      prose:
        "She was still talking when the tape ran out — a face on a screen, a voice under the rain, selling me a story I was already too far in to drop. I watched her lips move and tried to remember the first true thing she'd said all night. I couldn't. Maybe she'd never said one. Maybe that was the point.",
      choices: [{ id: "nwt_next", text: "Follow the trail to the corner store.", targetSceneId: "nw_mart", attitudeTag: "Neutral" }],
      hotspots: [],
      dialogueBeats: [],
    },
    /* ================================================================ */
    {
      id: "nw_mart",
      title: "Act One — Part Two: The Wrong Kind of Regulars",
      background: "/img/bg-mini-mart.jpg",
      ambientAudio: "drone",
      particles: "smoke",
      cinematic: {
        mode: "static",
        dimAmount: 0.16,
        lights: [
          { x: 50, y: 18, color: "#2ad9d9", intensity: 0.22, size: 46, pulseSeconds: 4.0, pulseAmount: 0.5 },
        ],
      },
      prose:
        "The corner store at three in the morning is where the city keeps its secrets on layaway. Moe worked the register like a man auditioning for witness protection, and Desh leaned on the counter like he'd been born there. The self-checkout flickered between them like a third regular — the only one nobody trusted.",
      dialogueBeats: [
        { id: "nwm_moe1", characterId: "moe", expression: "nervous", text: "Help you, or you just casing the place?" },
        { id: "nwm_desh1", characterId: "desh", expression: "deadpan", text: "He's harmless. Thinks the self-checkout's skimming his pension." },
        { id: "nwm_jack1", characterId: "jack", expression: "flat", text: "I'm looking for a regular. David Voss." },
        { id: "nwm_moe2", characterId: "moe", expression: "blinking too fast", text: "Voss? Energy drink, every Tuesday, exact change. Like clockwork." },
        { id: "nwm_desh2", characterId: "desh", expression: "wary", text: "Guy kept a locker here. Paid cash. Then a couple weeks back, some big fellow in a good coat came around asking after him." },

        { id: "nwm_r_solomon", characterId: "desh", expression: "low, like the walls were listening", conditionRule: { requiresFlags: ["asked_solomon"] }, text: "Rings like knuckles. A smile that never reached anything. I told him nothing. I tell nobody nothing." },
        { id: "nwm_r_others", characterId: "moe", expression: "whispering", conditionRule: { requiresFlags: ["asked_others"] }, text: "Only the big fellow. And a woman. Late thirties, dark hair, phone to her ear in the lot." },
        { id: "nwm_r_voss", characterId: "desh", expression: "shrugging", conditionRule: { requiresFlags: ["asked_voss"] }, text: "Just the phone calls. He'd stand by the freezers talking low, then leave like the conversation followed him out." },

        { id: "nwm_n1", characterId: "jack", expression: "V.O.", conditionRule: { requiresFlags: ["asked_solomon", "asked_others", "asked_voss"], requiresAll: false }, text: "A woman with a phone to her ear in the lot. I knew the woman. I'd met her the night before, selling me a missing husband. If she'd made a call the moment I left the diner, then the trail I was on wasn't a search. It was a delivery." },
      ],
      choices: [
        { id: "nwm_q1a", text: "\"The big fellow — what did he look like?\"", targetSceneId: "", reply: true, exclusiveGroup: "m1", attitudeTag: "Clever", consequences: { setFlags: ["asked_solomon"], meterChanges: [{ meter: "Clever", delta: 1 }] } },
        { id: "nwm_q1b", text: "\"Who else came around asking?\"", targetSceneId: "", reply: true, exclusiveGroup: "m1", attitudeTag: "Sultry", consequences: { setFlags: ["asked_others"], meterChanges: [{ meter: "Sultry", delta: 1 }] } },
        { id: "nwm_q1c", text: "\"You ever see Voss with anyone?\"", targetSceneId: "", reply: true, exclusiveGroup: "m1", attitudeTag: "Neutral", consequences: { setFlags: ["asked_voss"] } },

        { id: "nwm_exit_read", text: "Pocket the security still. Go home and read the folder.", targetSceneId: "nw_office", hidden: true, attitudeTag: "Clever", gating: { requiresItems: ["tipoff_photo"] }, consequences: { setFlags: ["vera_tipped"] } },
        { id: "nwm_exit_plain", text: "Follow the trail home and read the folder.", targetSceneId: "nw_office", hidden: true, attitudeTag: "Neutral", gating: { requiresFlags: ["asked_solomon", "asked_others", "asked_voss"], requiresAll: false } },
      ],
      hotspots: [
        { id: "nwm_photo", label: "Security still of the lot", bounds: { x: 8, y: 30, w: 16, h: 22 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "tipoff_photo", flagSet: "got_photo" } },
        { id: "nwm_checkout", label: "The self-checkout", bounds: { x: 74, y: 26, w: 18, h: 34 }, cursor: "look", isRepeatable: true, action: { type: "showText", text: "Desh swears the machine short-changes you a penny every third item and calls it 'the silent skim.' Moe crosses himself. You decide not to ask who audits the auditors." } },
      ],
    },
    /* ================================================================ */
    {
      id: "nw_office",
      title: "Act One — Part Three: A Trail Too Clean to Trust",
      background: "/img/bg-office.jpg",
      ambientAudio: "rain",
      particles: "rain",
      prose:
        "Back at the office with the blinds down, I spread Vera's folder across the desk like a man laying out a deck of marked cards. Bank statements. Last known contacts. A map with every stop on David Voss's trail folded into it — neat, patient, and waiting for a sucker to follow it.",
      dialogueBeats: [
        { id: "nwo_n1", characterId: "jack", expression: "V.O.", background: "/img/bg-folder-closeup.jpg", cinematic: { mode: "zoom-hold", focalPoint: "50% 50%", zoomDuration: 6, dimAmount: 0.24, lights: [{ x: 50, y: 45, color: "#e8b23c", intensity: 0.3, size: 38, pulseSeconds: 3.0, pulseAmount: 0.8 }] }, backgroundTransition: "crossfade", backgroundTransitionSpeed: 0.7, text: "The first thing a real missing person leaves behind is mess. Crumbs, contradictions, a door left open. Vera's folder had none of that. It had a map. A map is what you leave when you want to be found — or when you want somebody else to be." },
        { id: "nwo_n2", characterId: "jack", expression: "V.O.", background: "/img/bg-office.jpg", backgroundTransition: "crossfade", backgroundTransitionSpeed: 0.7, text: "Every stop on that trail pointed somewhere I could be seen going. A decoy with a license. And the thing about a decoy — nobody tells him he's the decoy until the ambush does." },
        { id: "nwo_n2b", characterId: "jack", expression: "V.O.", background: "/img/bg-mini-mart.jpg", backgroundTransition: "crossfade", backgroundTransitionSpeed: 0.6, conditionRule: { requiresFlags: ["got_photo"] }, text: "I pinned the security still next to the map. Same lot. Same rain. The woman with the phone to her ear was Vera — and the trail in the folder had been laid for me to walk, one careful step at a time." },
        { id: "nwo_n3", characterId: "jack", expression: "V.O.", text: "I should've burned it. I should've gone home, packed, and left the city to its arithmetic. Instead I put on my coat. Some cases you don't take. This one had already taken me." },
      ],
      choices: [
        { id: "nwo_docks", text: "Follow the map to the docks.", targetSceneId: "nw_ambush", attitudeTag: "Neutral" },
      ],
      hotspots: [
        { id: "nwo_map", label: "The fabricated map", bounds: { x: 40, y: 40, w: 20, h: 24 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "fabricated_map", flagSet: "map_fake" } },
        { id: "nwo_board", label: "Open the corkboard", bounds: { x: 6, y: 10, w: 14, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
    },
    /* ================================================================ */
    {
      id: "nw_ambush",
      title: "Act One — Part Three: The Ambush",
      nodeType: "cutscene",
      background: "/img/bg-docks.jpg",
      ambientAudio: "tension",
      particles: "smoke",
      prose:
        "The docks were darker than they had any right to be. Three men stepped out of the fog with the patience of people who'd been told exactly when I'd arrive. The first one said something I didn't catch. The second one's fist said the rest. The last thing I remember is the wet asphalt coming up to meet me, and a voice I couldn't place saying, very politely, that I was a witness now.",
      choices: [{ id: "nwa_next", text: "Wake up.", targetSceneId: "nw_captured", attitudeTag: "Neutral" }],
      hotspots: [],
      dialogueBeats: [],
    },
    /* ================================================================ */
    {
      id: "nw_captured",
      title: "Act One — Part Four: Nobody's Witness",
      background: "/img/bg-basement.jpg",
      ambientAudio: "drone",
      particles: "smoke",
      cinematic: { mode: "shake", shakeAmount: 0.35, dimAmount: 0.24, lights: [{ x: 50, y: 14, color: "#e8b23c", intensity: 0.34, size: 30, pulseSeconds: 2.4, pulseAmount: 0.7 }] },
      prose:
        "I came to tied to a chair in a basement that smelled of rust and bad decisions. A single bulb swung on its cord, counting seconds. Nobody had asked me anything yet — which meant they would, and that whatever they wanted, I was better off not being around for the question.",
      dialogueBeats: [
        { id: "nwc_n1", characterId: "jack", expression: "V.O.", text: "Rule one of being a witness: leave before they write anything down. Rule two: every cell has a loose tooth if you look long enough." },
      ],
      hotspots: [
        { id: "nwc_nail", label: "A loose nail in the chair", bounds: { x: 30, y: 52, w: 18, h: 18 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "bent_nail", flagSet: "got_nail" } },
        { id: "nwc_match", label: "A matchbook under the chair", bounds: { x: 56, y: 66, w: 16, h: 16 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "matchbook", flagSet: "got_match" } },
        { id: "nwc_door", label: "Jimmy the lock with your shim", bounds: { x: 78, y: 30, w: 14, h: 34 }, cursor: "use", gating: { requiresItems: ["shim"] }, action: { type: "useItem", itemConsumed: "shim", targetSceneId: "nw_fight", flagSet: "escaped" } },
      ],
      choices: [
        { id: "nwc_kick", text: "Kick the door until somebody comes.", targetSceneId: "nw_fight", attitudeTag: "Aggressive", consequences: { setFlags: ["kicked_door"], meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 2 }] } },
      ],
    },
    /* ================================================================ */
    {
      id: "nw_fight",
      title: "Act One — Part Four: The Corridor",
      background: "/img/bg-corridor.jpg",
      ambientAudio: "tension",
      particles: "smoke",
      cinematic: { mode: "static", dimAmount: 0.2, lights: [{ x: 50, y: 10, color: "#e8b23c", intensity: 0.3, size: 30, pulseSeconds: 2.6, pulseAmount: 0.7 }] },
      prose:
        "The corridor outside was narrow as a grudge, and at the far end a guard was rolling a cigarette with his back to a stack of crates. One man between me and the street. One man, and the whole long night.",
      dialogueBeats: [
        { id: "nwf_n1", characterId: "jack", expression: "V.O.", text: "There's a moment in a fight before it starts where the city holds its breath. I've learned to move inside that moment — or to become it." },
      ],
      choices: [
        { id: "nwf_gun", text: "Rush him and take his gun.", targetSceneId: "nw_rosa", attitudeTag: "Aggressive", consequences: { setFlags: ["took_gun"], meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }] } },
        { id: "nwf_slip", text: "Slip past him in the dark.", targetSceneId: "nw_rosa", attitudeTag: "Clever", consequences: { setFlags: ["slipped_past"], meterChanges: [{ meter: "Clever", delta: 1 }] } },
        { id: "nwf_talk", text: "Talk the guard down — tell him Solomon sent you.", targetSceneId: "nw_rosa", attitudeTag: "Sultry", consequences: { setFlags: ["talked_guard"], meterChanges: [{ meter: "Sultry", delta: 1 }] } },
      ],
      hotspots: [],
    },
    /* ================================================================ */
    {
      id: "nw_rosa",
      title: "Act Two — Rosa Clocks the Con",
      background: "/img/bg-neon-diner.jpg",
      ambientAudio: "rain",
      particles: "rain",
      prose:
        "I limped back to the Neon Diner at four in the morning. Rosa set a coffee in front of me without being asked and looked at me the way a woman looks at a man who still believes he's the smartest one in the room. It's a look that's never once been wrong.",
      dialogueBeats: [
        { id: "nwr_r1", characterId: "rosa", expression: "knowing", text: "You're walking around with a woman's thumbprint on the back of your neck and you haven't felt it yet." },
        { id: "nwr_j1", characterId: "jack", expression: "V.O.", text: "Rosa'd seen more from behind a counter than most cops see from a squad car. I poured sugar into the coffee and pretended I hadn't heard her. I'd heard her." },

        { id: "nwr_used", characterId: "rosa", expression: "flat", conditionRule: { requiresFlags: ["asked_used"] }, text: "You're not a detective to her. You're a decoy with a license. Someone for Solomon's crew to watch while the real trail stays dark." },
        { id: "nwr_proof", characterId: "rosa", expression: "lighting a cigarette", conditionRule: { requiresFlags: ["asked_proof"] }, text: "Proof's on the counter. My eyes don't lie, Jack — and neither do the men who pay me for them." },

        { id: "nwr_talked", characterId: "rosa", expression: "half a grin", conditionRule: { requiresFlags: ["talked_guard"] }, text: "Heard you talked your way past Solomon's man by borrowing the boss's name. Either you're braver than you look or dumber than you walk. Coffee's on the house either way." },

        { id: "nwr_n1", characterId: "jack", expression: "V.O.", conditionRule: { requiresFlags: ["asked_used", "asked_proof"], requiresAll: false }, text: "She was right. I'd been hired to be seen looking. The best witnesses are the ones nobody thinks to count — and Vera had counted me twice." },
      ],
      choices: [
        { id: "nwr_q1a", text: "\"She's using me how?\"", targetSceneId: "", reply: true, exclusiveGroup: "r1", attitudeTag: "Clever", consequences: { setFlags: ["asked_used"], meterChanges: [{ meter: "Clever", delta: 1 }] } },
        { id: "nwr_q1b", text: "\"You got proof, Rosa?\"", targetSceneId: "", reply: true, exclusiveGroup: "r1", attitudeTag: "Sultry", consequences: { setFlags: ["asked_proof"], meterChanges: [{ meter: "Sultry", delta: 1 }], trustChanges: [{ characterId: "rosa", delta: 1 }] } },
        { id: "nwr_go", text: "Find David before Solomon does.", targetSceneId: "nw_david", hidden: true, attitudeTag: "Clever", gating: { requiresFlags: ["asked_used", "asked_proof"], requiresAll: false } },
      ],
      hotspots: [
        { id: "nwr_report", label: "Rosa's report on the counter", bounds: { x: 16, y: 46, w: 18, h: 16 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "rosa_report", flagSet: "got_report" } },
      ],
    },
    /* ================================================================ */
    {
      id: "nw_david",
      title: "Act Two — The Man Who Never Left",
      background: "/img/bg-safehouse.jpg",
      ambientAudio: "drone",
      particles: "smoke",
      cinematic: { mode: "static", dimAmount: 0.18, lights: [{ x: 30, y: 40, color: "#e8b23c", intensity: 0.3, size: 40, pulseSeconds: 3.2, pulseAmount: 0.8 }] },
      prose:
        "Rosa's directions led me to a walk-up with drawn blinds and a door that opened a crack before I knocked. David Voss stood in the gap — thinner, grayer, and very much not missing. The room behind him smelled of old coffee and newer fear.",
      dialogueBeats: [
        { id: "nwdv_d1", characterId: "david", expression: "resigned", text: "You found me. Means she sent you. Means I'm either a dead man or a rich one, and the difference is which of us moves first." },
        { id: "nwdv_j1", characterId: "jack", expression: "V.O.", text: "David Voss, alive, in a room that smelled of old coffee and newer fear. Three weeks the city had him down as a runaway. Three weeks he'd been sitting on something with a shorter fuse than a matchbook." },

        { id: "nwdv_heist", characterId: "david", expression: "exhausted", conditionRule: { requiresFlags: ["asked_heist"] }, text: "From? Jack, I didn't run from anything. I ran to something. A job with a fuse — the kind Solomon doesn't advertise." },
        { id: "nwdv_vera", characterId: "david", expression: "a dry, unlovely laugh", conditionRule: { requiresFlags: ["asked_vera"] }, text: "Vera knows everything I know. She just knows it two steps ahead, and she doesn't pay me to ask why." },
        { id: "nwdv_fuse", characterId: "david", expression: "grim", conditionRule: { requiresFlags: ["asked_fuse"] }, text: "A safe nobody can crack without my hands. When the fuse hits zero, the money's already gone — and so am I." },

        { id: "nwdv_n1", characterId: "jack", expression: "V.O.", conditionRule: { requiresFlags: ["asked_heist", "asked_vera", "asked_fuse"], requiresAll: false }, text: "And that was the first twist, the one that changed the shape of everything after. He hadn't run from her. He'd run with her blessing — her money, her plan, her little private war on Solomon Reyes. I'd been hired to walk the decoy trail. The real one had been running this whole time, two steps ahead, wearing her smile." },
      ],
      choices: [
        { id: "nwdv_q1a", text: "\"What did you run from?\"", targetSceneId: "", reply: true, exclusiveGroup: "d1", attitudeTag: "Clever", consequences: { setFlags: ["asked_heist"], meterChanges: [{ meter: "Clever", delta: 1 }] } },
        { id: "nwdv_q1b", text: "\"Does Vera know you're alive?\"", targetSceneId: "", reply: true, exclusiveGroup: "d1", attitudeTag: "Sultry", consequences: { setFlags: ["asked_vera"], meterChanges: [{ meter: "Sultry", delta: 1 }] } },
        { id: "nwdv_q1c", text: "\"What's the fuse?\"", targetSceneId: "", reply: true, exclusiveGroup: "d1", attitudeTag: "Aggressive", consequences: { setFlags: ["asked_fuse"], meterChanges: [{ meter: "Aggressive", delta: 1 }] } },

        { id: "nwdv_twist", text: "Let the twist land.", targetSceneId: "nw_twist", hidden: true, attitudeTag: "Clever", gating: { requiresFlags: ["asked_heist", "asked_vera", "asked_fuse"], requiresAll: false }, consequences: { setFlags: ["twist_known"], meterChanges: [{ meter: "Clever", delta: 1 }] } },
        { id: "nwdv_keep", text: "Keep pressing toward Act Three.", targetSceneId: "nw_twist", hidden: true, attitudeTag: "Neutral", gating: { requiresFlags: ["asked_heist", "asked_vera", "asked_fuse"], requiresAll: false } },
      ],
      hotspots: [
        { id: "nwdv_ledger", label: "The heist ledger on the table", bounds: { x: 42, y: 40, w: 20, h: 18 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "heist_ledger", flagSet: "got_ledger" } },
      ],
    },
    /* ================================================================ */
    {
      id: "nw_twist",
      title: "Act Two — The First Twist",
      nodeType: "cutscene",
      background: "/img/bg-alley.jpg",
      ambientAudio: "rain",
      particles: "rain",
      prose:
        "I'd spent three nights thinking David Voss ran from her. The truth was uglier and cleaner at once: he ran with her. She'd blessed it — financed it, even — and I'd been hired to walk the decoy trail while the real one stayed dark. A missing husband. A heist with a fuse. And me, the only witness nobody was counting on.",
      choices: [{ id: "nwt_next", text: "Steel yourself.", targetSceneId: "nw_solomon", attitudeTag: "Neutral" }],
      hotspots: [],
      dialogueBeats: [],
    },
    /* ================================================================ */
    {
      id: "nw_solomon",
      title: "Act Three — The Man Who Curates Debts",
      background: "/img/bg-solomon-office.jpg",
      ambientAudio: "tension",
      particles: "smoke",
      cinematic: { mode: "static", dimAmount: 0.22, lights: [{ x: 62, y: 30, color: "#e8b23c", intensity: 0.28, size: 30, pulseSeconds: 2.2, pulseAmount: 0.6 }] },
      prose:
        "Solomon Reyes kept an office above the city like a man keeping an eye on everything he owned. He poured two fingers of something expensive he didn't offer me, and sat back in a chair that had swallowed better men than the one I was pretending to be.",
      dialogueBeats: [
        { id: "nws_s1", characterId: "solomon", expression: "cold", text: "Mr. Morrow. You've been asking about a man who belongs to me. That's rude. I collect debts, not questions." },
        { id: "nws_j1", characterId: "jack", expression: "V.O.", text: "Solomon Reyes had a smile that never reached anything. I'd heard that before, from a kid behind a counter. The city's monsters all wore the same face — it was the suits that changed." },
      ],
      choices: [
        { id: "nws_buy", text: "Buy time. David's already gone.", targetSceneId: "nw_betrayal", attitudeTag: "Clever", consequences: { setFlags: ["bought_time"], meterChanges: [{ meter: "Clever", delta: 1 }, { meter: "Suspicion", delta: 1 }] } },
        { id: "nws_throw", text: "Throw Vera to him.", targetSceneId: "nw_betrayal", attitudeTag: "Aggressive", consequences: { setFlags: ["threw_vera"], meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 2 }], trustChanges: [{ characterId: "vera", delta: -3 }] } },
      ],
      hotspots: [],
    },
    /* ================================================================ */
    {
      id: "nw_betrayal",
      title: "Act Three — Every Man Alone at the Last",
      background: "/img/bg-betrayal.jpg",
      ambientAudio: "tension",
      particles: "smoke",
      cinematic: { mode: "zoom-hold", focalPoint: "50% 50%", zoomDuration: 7, dimAmount: 0.2, lights: [{ x: 50, y: 22, color: "#e8b23c", intensity: 0.3, size: 32, pulseSeconds: 2.6, pulseAmount: 0.7 }] },
      prose:
        "By the time I caught up with David, the money was in a duffel and the duffel was in his hands. He'd stopped being the man I'd found in the safehouse. He was the man running alone now — the way every man in this town ran, at the last, reaching for the bag.",
      dialogueBeats: [
        { id: "nwb_d1", characterId: "david", expression: "desperate", text: "The money's mine, Jack. You can have the story." },
        { id: "nwb_j1", characterId: "jack", expression: "V.O.", text: "There it was. Not a twist this time — a pattern. Vera sold him out, he sold her out, and both of them were counting on me to be too slow, or too loyal, or too dead to matter." },
      ],
      choices: [
        { id: "nwb_go", text: "Chase him to the end.", targetSceneId: "nw_endgame", attitudeTag: "Clever" },
      ],
      hotspots: [],
    },
    /* ================================================================ */
    {
      id: "nw_endgame",
      title: "Act Three — Nobody's Witness",
      background: "/img/bg-endgame.jpg",
      ambientAudio: "tension",
      particles: "storm",
      musicMode: "track",
      musicUrl: "/Soundtrack.mp3",
      cinematic: { mode: "pan", focalPoint: "50% 50%", zoomDuration: 16, dimAmount: 0.14, lights: [{ x: 30, y: 26, color: "#ff2e88", intensity: 0.24, size: 36, pulseSeconds: 3.4, pulseAmount: 0.9 }] },
      prose:
        "The docks. Rain. Three players and one witness. Solomon's crew was coming up the wet road. David was two steps from the water with the money. And somewhere behind me I could feel Vera watching — the way you feel a light switch before you find it in the dark.",
      dialogueBeats: [
        { id: "nwe_n1", characterId: "jack", expression: "V.O.", text: "Four strings on the board and I hadn't pulled one of them tight. Solomon's crew on the road, David on the water, Vera somewhere in the dark. If I was going to out-maneuver three people who'd been playing this game longer than I'd been alive, I needed the whole case pinned down — not a hunch." },
      ],
      choices: [
        { id: "nwe_gold", text: "Out-maneuver them all — pin Solomon, flip David, force Vera's hand.", targetSceneId: "nw_end_gold", attitudeTag: "Clever", gating: { requiresFlags: ["solomon_moves", "david_heist", "vera_lied", "vera_tipped_board"], requiresAll: true }, consequences: { setFlags: ["won_clean"], meterChanges: [{ meter: "Clever", delta: 1 }] } },
        { id: "nwe_vera", text: "Side with Vera — hand Solomon the money and let her finish the game.", targetSceneId: "nw_end_vera", hidden: true, attitudeTag: "Sultry", gating: { requiresFlags: ["vera_lied", "vera_tipped_board"], requiresAll: false }, consequences: { setFlags: ["sided_vera"], meterChanges: [{ meter: "Sultry", delta: 1 }], trustChanges: [{ characterId: "vera", delta: 2 }] } },
        { id: "nwe_silver", text: "Cut the fuse — take David's money and walk away clean.", targetSceneId: "nw_end_silver", attitudeTag: "Sultry", gating: { requiresItems: ["heist_ledger"] }, consequences: { setFlags: ["cut_fuse"] } },
        { id: "nwe_warn", text: "Warn David — give him a head start into the dark.", targetSceneId: "nw_end_warn", hidden: true, attitudeTag: "Clever", gating: { requiresItems: ["heist_ledger"] }, consequences: { setFlags: ["warned_david"], meterChanges: [{ meter: "Clever", delta: 1 }] } },
        { id: "nwe_vanish", text: "Vanish. Let the city have them all.", targetSceneId: "nw_end_vanish", attitudeTag: "Neutral", consequences: { setFlags: ["vanished"] } },
        { id: "nwe_bad", text: "Accuse Solomon with nothing but nerve.", targetSceneId: "nw_end_gameover", attitudeTag: "Aggressive", consequences: { setFlags: ["accused_empty"] } },
      ],
      hotspots: [
        { id: "nwe_board", label: "Open the corkboard", bounds: { x: 4, y: 10, w: 14, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
    },
    /* ================================================================ */
    {
      id: "nw_end_gold",
      title: "Gold Ending — The Case Jack Never Closed",
      background: "/img/bg-end-gold.jpg",
      ambientAudio: "jazz",
      particles: "rain",
      cinematic: { mode: "static", dimAmount: 0.12, lights: [{ x: 50, y: 26, color: "#e8b23c", intensity: 0.24, size: 40, pulseSeconds: 3.0, pulseAmount: 0.8 }] },
      prose:
        "I pinned Solomon with Rosa's report and the security still. I flipped David with his own ledger. And when Vera walked out of the dark at the end, I made her choose — and she chose me. Real, or the last good move on her board? I still don't know. Some nights, that's the only true thing about the whole case: a witness is just somebody who stays long enough to be uncertain.",
      isEnding: true,
      endingData: { tier: "victory-gold", headline: "THE CASE JACK NEVER CLOSED", recap: "You out-maneuvered Solomon, David, and Vera's endgame — and watched Vera pick you, real or not." },
    },
    {
      id: "nw_end_vera",
      title: "Gold Ending — Her Last Good Move",
      background: "/img/bg-end-vera.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: { mode: "zoom-hold", focalPoint: "50% 45%", zoomDuration: 8, dimAmount: 0.18, lights: [{ x: 50, y: 34, color: "#ff2e88", intensity: 0.28, size: 36, pulseSeconds: 3.2, pulseAmount: 0.9 }] },
      prose:
        "I handed Solomon the money and stepped back, and I watched Vera finish the game she'd been playing since the first night at the diner. She never looked away from the board — not even when she reached for my hand at the end. Real, or her last good move? That's the thing about Vera Voss. You can never tell, and you can never stop wanting to know.",
      isEnding: true,
      endingData: { tier: "victory-gold", headline: "HER LAST GOOD MOVE", recap: "You sided with Vera and let her win — and she reached for you, real or not." },
    },
    {
      id: "nw_end_silver",
      title: "Silver Ending — A Trail Left Warm",
      background: "/img/bg-neon-diner.jpg",
      ambientAudio: "rain",
      particles: "rain",
      prose:
        "You cut the fuse and took David's money, and you walked out of the city with a duffel and a story you'd never tell. The city kept its secret — and Vera Voss kept walking through other men's nights, selling herself twice to whoever was buying. Some trails you follow to the end. Some trails you leave warm, and walk away.",
      isEnding: true,
      endingData: { tier: "victory-silver", headline: "A TRAIL LEFT WARM", recap: "You took David's money and left the city with its secret intact." },
    },
    {
      id: "nw_end_warn",
      title: "Silver Ending — The Man Who Got Away",
      background: "/img/bg-end-warn.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: { mode: "pan", focalPoint: "50% 60%", zoomDuration: 12, dimAmount: 0.16, lights: [{ x: 70, y: 30, color: "#e23b4e", intensity: 0.26, size: 30, pulseSeconds: 2.6, pulseAmount: 0.7 }] },
      prose:
        "I gave David a head start and watched him take it — down the wet dock, into the dark, the duffel swinging like a heart in his fist. Solomon's crew came up empty, and the fuse burned out with nobody to take the heat. David Voss stayed a missing man forever. Maybe that was the kindest thing I ever did for anybody in this town.",
      isEnding: true,
      endingData: { tier: "victory-silver", headline: "THE MAN WHO GOT AWAY", recap: "You warned David and let him run — the missing man stayed missing." },
    },
    {
      id: "nw_end_vanish",
      title: "Silver Ending — Gone in the Rain",
      background: "/img/bg-end-vanish.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: { mode: "static", dimAmount: 0.16, lights: [{ x: 50, y: 20, color: "#2ad9d9", intensity: 0.22, size: 38, pulseSeconds: 3.6, pulseAmount: 0.6 }] },
      prose:
        "I walked away from the docks and kept walking. No duffel, no ledger, no name in the paper. Let Solomon have his money, let David have his water, let Vera have her board. Some cases don't end so much as you stop being in them. The rain was cold and even, and it didn't ask a single question.",
      isEnding: true,
      endingData: { tier: "victory-silver", headline: "GONE IN THE RAIN", recap: "You vanished and let the city have them all — nobody's witness to the end." },
    },
    {
      id: "nw_end_refusal",
      title: "Game Over — The Case Jack Never Took",
      background: "/img/bg-end-refusal.jpg",
      ambientAudio: "rain",
      particles: "rain",
      prose:
        "I turned her down and walked out into the rain, and Vera Voss let me go without a word — the way you let go of a thing you can always come back for. I finished my coffee and went home. Some nights you don't want to know what the phone's got to say. Some cases you don't take. And some women, you spend the rest of your life wondering what was in the folder.",
      isEnding: true,
      endingData: { tier: "gameover", headline: "THE CASE JACK NEVER TOOK", recap: "You turned Vera down before the story began — and never learned what she was really selling." },
    },
    {
      id: "nw_end_gameover",
      title: "Game Over — Nobody's Witness",
      background: "/img/bg-basement.jpg",
      ambientAudio: "drone",
      particles: "smoke",
      cinematic: { mode: "static", dimAmount: 0.26, lights: [{ x: 50, y: 14, color: "#e8b23c", intensity: 0.32, size: 30, pulseSeconds: 2.4, pulseAmount: 0.7 }] },
      prose:
        "Solomon's crew found you first — or the heat of the case finally caught up. In the end, nobody's witness means nobody to say what happened to the man who asked too many questions. The city closed over you like water, and the story went out with the light.",
      isEnding: true,
      endingData: { tier: "gameover", headline: "NOBODY'S WITNESS", recap: "Solomon won. You asked too many questions with nothing to back them — or the crew simply caught you first." },
    },
  ],
};
