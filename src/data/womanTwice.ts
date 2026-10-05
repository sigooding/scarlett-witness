import type { Story } from "../types";

/**
 * THE WOMAN WHO SOLD HERSELF TWICE
 * Act One, Part 1 — "The Woman Who Sold Herself Twice"
 *
 * A first-person, voice-over noir scene. Jack Morrow narrates (V.O.), and the
 * player answers Vera's questions with conversational replies that stay in the
 * scene — no mini-games, no navigation. Each reply sets a flag that unlocks the
 * gated dialogue beat which becomes Vera's response. The final choice decides
 * the ending.
 */
export const WOMAN_TWICE: Story = {
  id: "woman-twice",
  title: "The Woman Who Sold Herself Twice",
  tagline: "At 11:47 the Neon Diner had one customer worth mentioning. Then she walked in.",
  coverImage: "/img/cover-woman-twice.jpg",
  startSceneId: "wt_act1",
  briefing: {
    objective: "Hear out Vera Voss, ask the right questions, and decide whether Jack Morrow takes the case of her missing husband.",
    winConditions: [
      "Get Vera to tell you the truth she came to say.",
      "Accept the manila folder and turn the page.",
    ],
    loseConditions: [
      "Let Suspicion burn the bridge before she hires you.",
      "Close the folder and walk away.",
    ],
  },
  layout: {
    wt_act1: { x: 0, y: 200 },
    wt_end_tbc: { x: 420, y: 60 },
    wt_end_walk: { x: 420, y: 340 },
  },
  characters: [
    { id: "jack", name: "Jack Morrow", role: "Private Detective / Narrator", avatarUrl: "/img/ch-jack-morrow.jpg", trustMeter: 0, voice: { pitch: 0.72, rate: 0.9 } },
    { id: "vera", name: "Vera Voss", role: "The Client", avatarUrl: "/img/ch-vera-voss.jpg", trustMeter: 0, voice: { pitch: 1.15, rate: 0.88 } },
  ],
  items: [
    { id: "manila_folder", name: "Manila Folder", icon: "📂", description: "Everything Vera had on David Voss — bank statements, last known contacts, and a photo of a man the city keeps losing.", flavorText: "Paper. Old-fashioned. Something you can hold and trust the weight of.", isClue: true },
  ],
  scenes: [
    {
      id: "wt_act1",
      title: "Act One — The Neon Diner",
      background: "/img/bg-neon-diner.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: { mode: "pan", focalPoint: "50% 40%", zoomDuration: 14, dimAmount: 0.14, lights: [{ x: 50, y: 30, color: "#e8b23c", intensity: 0.28, size: 40, pulseSeconds: 2.8, pulseAmount: 1 }] },
      prose:
        "Eleven forty-seven at night, and the Neon Diner had exactly one customer worth mentioning. Me. Tie loosened like it had given up on me hours ago. Coffee gone cold — I wasn't drinking it, I was just keeping it company. Phone face-down on the table. Some nights you don't want to know what it's got to say. Turned out that night, I didn't need the phone. The thing I should've been scared of walked in through the front door instead.",
      dialogueBeats: [
        /* ---- Phase A: the opening ---- */
        { id: "wt_v1", characterId: "vera", expression: "sizing him up", text: "You're the guy still running a burner phone in twenty-twenty-six. That's either real disciplined or real paranoid." },
        { id: "wt_j1", characterId: "jack", expression: "dry", text: "Where I come from, those are the same word." },
        { id: "wt_v2", characterId: "vera", expression: "unreadable", text: "Where do you come from?" },
        { id: "wt_j2", characterId: "jack", expression: "flat", text: "Nowhere that stuck." },
        { id: "wt_n1", characterId: "jack", expression: "V.O.", text: "I've got a bad habit of talking like the last line of a movie nobody made yet. She smiled like she'd already seen that movie. Twice. And didn't care much for the ending either time." },
        { id: "wt_v3", characterId: "vera", expression: "measured", text: "My husband's missing." },

        /* ---- Decision 1 responses ---- */
        { id: "wt_v4a", characterId: "vera", expression: "matter-of-fact", conditionRule: { requiresFlags: ["asked_how"] }, text: "Three weeks. No calls, no cards used, no body. Police say he probably ran. I'd like a second opinion." },
        { id: "wt_v4b", characterId: "vera", expression: "cool", conditionRule: { requiresFlags: ["asked_whynow"] }, text: "I called three others first. They all told me he ran. I want someone who doesn't like that answer." },
        { id: "wt_v4c", characterId: "vera", expression: "wry", conditionRule: { requiresFlags: ["asked_fromtop"] }, text: "The beginning's the problem. There's no clean one. Three weeks ago, he simply stopped being there." },

        /* ---- Phase C: shared continuation ---- */
        { id: "wt_j3", characterId: "jack", expression: "professional", conditionRule: { requiresFlags: ["asked_how", "asked_whynow", "asked_fromtop"], requiresAll: false }, text: "Cops are usually right about the running part." },
        { id: "wt_v5", characterId: "vera", expression: "a small, unreadable smile", conditionRule: { requiresFlags: ["asked_how", "asked_whynow", "asked_fromtop"], requiresAll: false }, text: "I know. That's not the part I'm paying you to find out." },
        { id: "wt_n2", characterId: "jack", expression: "V.O.", conditionRule: { requiresFlags: ["asked_how", "asked_whynow", "asked_fromtop"], requiresAll: false }, text: "No drive this time. Paper. Old-fashioned. I remember thinking that was almost a relief — something I could hold in my hand and trust the weight of. I want you to remember I thought that. It's going to be funny later." },
        { id: "wt_j4", characterId: "jack", expression: "neutral", conditionRule: { requiresFlags: ["asked_how", "asked_whynow", "asked_fromtop"], requiresAll: false }, text: "What's his name?" },
        { id: "wt_v6", characterId: "vera", expression: "even", conditionRule: { requiresFlags: ["asked_how", "asked_whynow", "asked_fromtop"], requiresAll: false }, text: "David Voss." },
        { id: "wt_n3", characterId: "jack", expression: "V.O.", conditionRule: { requiresFlags: ["asked_how", "asked_whynow", "asked_fromtop"], requiresAll: false }, text: "Voss. I knew the name the way you know a name you've heard in a bar full of the wrong kind of people — not personally, but personally enough. David Voss ran numbers for a man named Solomon Reyes. A man who didn't so much collect debts as curate them. If David Voss disappeared owing Solomon Reyes anything, David Voss wasn't missing. David Voss was hiding, and there's a world of difference between the two — mostly involving how long you get to stay that way." },

        /* ---- Decision 2 responses ---- */
        { id: "wt_v7a", characterId: "vera", expression: "unbothered, like the question cost her nothing", conditionRule: { requiresFlags: ["asked_reyes"] }, text: "Everybody in this city does business with Solomon Reyes eventually. Some of us just don't advertise it over coffee." },
        { id: "wt_v7b", characterId: "vera", expression: "crisp", conditionRule: { requiresFlags: ["asked_cops"] }, text: "The cops don't ask questions they don't want answered. I do. That's the difference." },
        { id: "wt_v7c", characterId: "vera", expression: "hard", conditionRule: { requiresFlags: ["asked_suspect"] }, text: "If I already knew what happened, Mr. Morrow, I wouldn't need a detective. I'd need an alibi." },

        /* ---- Phase E: shared continuation ---- */
        { id: "wt_n4", characterId: "jack", expression: "V.O.", conditionRule: { requiresFlags: ["asked_reyes", "asked_cops", "asked_suspect"], requiresAll: false }, text: "There it was again — that smile that already knew the ending. I should've asked myself right then why a woman hiring a man to find her husband was so calm about the idea that her husband might be the kind of man worth hiding from. I didn't ask myself that. I asked myself something dumber instead." },

        /* ---- Decision 3 responses ---- */
        { id: "wt_v8a", characterId: "vera", expression: "quiet, almost gentle, almost honest", conditionRule: { requiresFlags: ["asked_whyleft"] }, text: "I want to know he's somewhere he chose to be. That's all. Whatever that turns out to mean." },
        { id: "wt_v8b", characterId: "vera", expression: "cold", conditionRule: { requiresFlags: ["asked_whatif"] }, text: "Careful, Mr. Morrow. I didn't come here to be read. I came here to hire you." },
        { id: "wt_v8c", characterId: "vera", expression: "knowing", conditionRule: { requiresFlags: ["asked_lost"] }, text: "Spoken like a man who's been lost. Maybe that's exactly why I picked you." },

        /* ---- Phase G: the folder and the exit ---- */
        { id: "wt_n5", characterId: "jack", expression: "V.O.", conditionRule: { requiresFlags: ["asked_whyleft", "asked_whatif", "asked_lost"], requiresAll: false }, text: "Now that — that was the first true thing she said to me all night. I didn't know it yet. Wouldn't know it for two more weeks, matter of fact. But I've replayed that line in my head more times than I've replayed anything else she ever told me, and I still can't decide if it was a confession or an alibi. Maybe with her those were always the same sentence." },
        { id: "wt_v9", characterId: "vera", expression: "businesslike", conditionRule: { requiresFlags: ["asked_whyleft", "asked_whatif", "asked_lost"], requiresAll: false }, text: "Everything I've got is in there. Bank statements. Last known contacts. A photo, if you need to remind yourself what he looks like once you're three drinks into asking about him in the wrong bars." },
        { id: "wt_j5", characterId: "jack", expression: "wry", conditionRule: { requiresFlags: ["asked_whyleft", "asked_whatif", "asked_lost"], requiresAll: false }, text: "You know me well for a first date." },
        { id: "wt_v10", characterId: "vera", expression: "putting armor back on", conditionRule: { requiresFlags: ["asked_whyleft", "asked_whatif", "asked_lost"], requiresAll: false }, text: "I know men like you well, Mr. Morrow. That's not the same thing. Try not to confuse the two — it'll save us both some time." },
        { id: "wt_n6", characterId: "jack", expression: "V.O.", conditionRule: { requiresFlags: ["asked_whyleft", "asked_whatif", "asked_lost"], requiresAll: false }, text: "And that was it. No card with a number this time. Just a folder, a name I didn't like, and a feeling in my gut that I'd just been hired to go looking for something a lot more specific than a missing husband — even if I didn't have the first idea yet what that something was." },
      ],
      choices: [
        /* Decision 1 — how to answer "my husband's missing" */
        { id: "wt_r1a", text: "\"How missing?\"", targetSceneId: "", reply: true, exclusiveGroup: "d1", attitudeTag: "Clever", consequences: { setFlags: ["asked_how"], meterChanges: [{ meter: "Clever", delta: 1 }] } },
        { id: "wt_r1b", text: "\"Three weeks and you're only now calling me?\"", targetSceneId: "", reply: true, exclusiveGroup: "d1", attitudeTag: "Aggressive", consequences: { setFlags: ["asked_whynow"], meterChanges: [{ meter: "Aggressive", delta: 1 }] } },
        { id: "wt_r1c", text: "\"Sit down. Start at the beginning.\"", targetSceneId: "", reply: true, exclusiveGroup: "d1", attitudeTag: "Sultry", consequences: { setFlags: ["asked_fromtop"], meterChanges: [{ meter: "Sultry", delta: 1 }], trustChanges: [{ characterId: "vera", delta: 1 }] } },

        /* Decision 2 — after learning the name David Voss */
        { id: "wt_r2a", text: "\"Your husband do business with Solomon Reyes?\"", targetSceneId: "", reply: true, exclusiveGroup: "d2", hidden: true, attitudeTag: "Clever", gating: { requiresFlags: ["asked_how", "asked_whynow", "asked_fromtop"], requiresAll: false }, consequences: { setFlags: ["asked_reyes"], meterChanges: [{ meter: "Clever", delta: 1 }] } },
        { id: "wt_r2b", text: "\"The cops must've checked his books. What'd they miss?\"", targetSceneId: "", reply: true, exclusiveGroup: "d2", hidden: true, attitudeTag: "Clever", gating: { requiresFlags: ["asked_how", "asked_whynow", "asked_fromtop"], requiresAll: false }, consequences: { setFlags: ["asked_cops"], meterChanges: [{ meter: "Clever", delta: 1 }] } },
        { id: "wt_r2c", text: "\"You already know what happened, don't you?\"", targetSceneId: "", reply: true, exclusiveGroup: "d2", hidden: true, attitudeTag: "Aggressive", gating: { requiresFlags: ["asked_how", "asked_whynow", "asked_fromtop"], requiresAll: false }, consequences: { setFlags: ["asked_suspect"], meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }], trustChanges: [{ characterId: "vera", delta: -1 }] } },

        /* Decision 3 — the real question */
        { id: "wt_r3a", text: "\"If I find him — do you want him back, or do you want to know why he left?\"", targetSceneId: "", reply: true, exclusiveGroup: "d3", hidden: true, attitudeTag: "Clever", gating: { requiresFlags: ["asked_reyes", "asked_cops", "asked_suspect"], requiresAll: false }, consequences: { setFlags: ["asked_whyleft"], meterChanges: [{ meter: "Clever", delta: 1 }] } },
        { id: "wt_r3b", text: "\"What if I find out you don't want him found at all?\"", targetSceneId: "", reply: true, exclusiveGroup: "d3", hidden: true, attitudeTag: "Aggressive", gating: { requiresFlags: ["asked_reyes", "asked_cops", "asked_suspect"], requiresAll: false }, consequences: { setFlags: ["asked_whatif"], meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }], trustChanges: [{ characterId: "vera", delta: -1 }] } },
        { id: "wt_r3c", text: "\"You sure you want him back? Some men are better lost.\"", targetSceneId: "", reply: true, exclusiveGroup: "d3", hidden: true, attitudeTag: "Sultry", gating: { requiresFlags: ["asked_reyes", "asked_cops", "asked_suspect"], requiresAll: false }, consequences: { setFlags: ["asked_lost"], meterChanges: [{ meter: "Sultry", delta: 1 }], trustChanges: [{ characterId: "vera", delta: 1 }] } },

        /* Decision 4 — the ending */
        { id: "wt_e1", text: "Turn the page.", targetSceneId: "wt_end_tbc", exclusiveGroup: "ending", hidden: true, attitudeTag: "Clever", gating: { requiresFlags: ["asked_whyleft", "asked_whatif", "asked_lost"], requiresAll: false }, consequences: { setFlags: ["turned_page"], addItems: ["manila_folder"], meterChanges: [{ meter: "Clever", delta: 1 }] } },
        { id: "wt_e2", text: "Close the folder. Finish the coffee. Go home.", targetSceneId: "wt_end_walk", exclusiveGroup: "ending", hidden: true, attitudeTag: "Neutral", gating: { requiresFlags: ["asked_whyleft", "asked_whatif", "asked_lost"], requiresAll: false }, consequences: { setFlags: ["walked_away"] } },
      ],
      hotspots: [],
    },
    {
      id: "wt_end_tbc",
      title: "To Be Continued",
      background: "/img/bg-folder-closeup.jpg",
      ambientAudio: "rain",
      prose: "I should've closed that folder, finished my coffee, and gone home. Instead I did what every idiot in a story like this does. I turned the page.",
      isEnding: true,
      endingData: { tier: "victory-silver", headline: "TO BE CONTINUED — PART TWO", recap: "You took Vera Voss's case and turned the page. The Neon Diner will keep its secrets a little longer." },
    },
    {
      id: "wt_end_walk",
      title: "Jack Walks Away",
      background: "/img/bg-neon-diner.jpg",
      ambientAudio: "rain",
      prose: "I closed the folder, finished the cold coffee, and went home. Some nights you don't want to know what the phone's got to say. Some cases you don't take. The woman who sold herself twice would find another detective by morning — and I'd spend the rest of my life wondering what was in that folder.",
      isEnding: true,
      endingData: { tier: "gameover", headline: "JACK MORROW WALKS AWAY — CASE NEVER TAKEN", recap: "You turned Vera Voss away before the story began." },
    },
  ],
};
