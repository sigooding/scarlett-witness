import type { Story } from "../types";

/**
 * STATIC OVER MARLOWE — a compact showcase reel built to prove every node type
 * and every transition works end-to-end:
 *   credits node (start) → framed scene (cut / slide / fade-black / hold / return-to-default)
 *   → frame-bound hotspot → lockpick mini-game → cutscene node → two endings.
 */
export const STATIC_MARLOWE: Story = {
  id: "static-marlowe",
  title: "Static Over Marlowe",
  tagline: "One microphone, one confession, and a city listening in the dark.",
  coverImage: "gradient:linear-gradient(160deg,#071118 0%,#12242e 50%,#0a1218 100%)",
  startSceneId: "sm_credits",
  layout: {
    sm_credits: { x: -360, y: 220 },
    sm_booth: { x: 0, y: 220 },
    sm_cutscene: { x: 360, y: 220 },
    sm_caller: { x: 720, y: 220 },
    sm_end_onair: { x: 1080, y: 60 },
    sm_end_deadair: { x: 1080, y: 380 },
  },
  briefing: {
    objective: "Get the confession tape on the air before the feed is cut.",
    winConditions: [
      "Pick the record cabinet lock in the booth to recover the confession tape.",
      "Answer the ringing telephone when its frame appears.",
      "Put the tape on air at the caller scene.",
    ],
    loseConditions: ["Cut the feed and walk — the confession dies in the static."],
    heatLimit: 0,
  },
  characters: [
    { id: "marlowe", name: "Jack Marlowe", role: "Late-Night Radio Host", avatarUrl: "emoji:🎙️", trustMeter: 0, voice: { pitch: 0.7, rate: 0.92 } },
    { id: "caller", name: "The Caller", role: "Voice in the Static", avatarUrl: "emoji:☎️", trustMeter: 0, voice: { pitch: 1.2, rate: 1.05 } },
  ],
  items: [
    { id: "confession_tape", name: "Confession Tape", icon: "📼", description: "A reel-to-reel tape holding a voice that names names.", flavorText: "Magnetic ribbon that could hang a man.", isClue: true },
  ],
  deduction: { suspectIds: ["caller"], connections: [] },
  scenes: [
    {
      id: "sm_credits",
      title: "Opening Credits",
      nodeType: "credits",
      noTypewriter: true,
      background: "gradient:linear-gradient(135deg,#04070c 0%,#101820 60%,#04070c 100%)",
      ambientAudio: "drone",
      prose: "STATIC OVER MARLOWE\n\nA Gaslight Reelworks Production\n\nStarring the City Itself",
      choices: [{ id: "smc_begin", text: "Begin", targetSceneId: "sm_booth", attitudeTag: "Neutral" }],
      hotspots: [],
      dialogueBeats: [],
    },
    {
      id: "sm_booth",
      title: "The Midnight Booth",
      background: "gradient:linear-gradient(180deg,#0a141c 0%,#15222c 55%,#0a141c 100%)",
      ambientAudio: "jazz",
      prose: "Midnight at Radio KMRW. Jack Marlowe lit one last cigarette before the ON AIR sign caught fire. Somewhere in the booth, a tape was waiting to be played — and a telephone was about to ring.",
      dialogueBeats: [
        { id: "smb_b1", characterId: "marlowe", expression: "tired", text: "Good evening, city of insomniacs. You're listening to Marlowe, and tonight the static has a story to tell." },
        { id: "smb_b2", characterId: "marlowe", expression: "leaning in", text: "But first — somebody left a reel on my desk. No name. Just a voice that wants to be heard." },
        { id: "smb_b3", characterId: "caller", expression: "static", text: "...Marlowe? Don't cut me off. I'm the one who buried the body, and I can prove who paid for the shovel." },
      ],
      hotspots: [
        { id: "smh_tape", label: "Pick the record-cabinet lock and recover the reel", bounds: { x: 16, y: 40, w: 26, h: 34 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "confession_tape" } },
        { id: "smh_phone", label: "Answer the telephone", bounds: { x: 66, y: 36, w: 18, h: 22 }, cursor: "use", action: { type: "goToScene", targetSceneId: "sm_cutscene" } },
              ],
      choices: [],
    },
    {
      id: "sm_cutscene",
      title: "On the Line",
      nodeType: "cutscene",
      background: "gradient:radial-gradient(circle at 50% 40%,#2a1016 0%,#100a10 60%,#060608 100%)",
      ambientAudio: "tension",
      prose: "The caller's voice came through in bursts of static — a name, a dock, a payoff. Marlowe kept the reel rolling the whole time.",
      choices: [{ id: "smcut_next", text: "Continue", targetSceneId: "sm_caller", attitudeTag: "Neutral" }],
      hotspots: [],
      dialogueBeats: [],
    },
    {
      id: "sm_caller",
      title: "The Feed",
      background: "gradient:linear-gradient(180deg,#0a141c 0%,#15222c 55%,#0a141c 100%)",
      ambientAudio: "tension",
      prose: "One lever between the confession and a million radios. The ON AIR sign hummed like it was hungry.",
      dialogueBeats: [
        { id: "smc_b1", characterId: "marlowe", expression: "steady", text: "City of insomniacs — you wanted a story. Here it is, straight off the tape." },
      ],
      hotspots: [],
      choices: [
        { id: "smc_onair", text: "Put the confession tape on the air.", targetSceneId: "sm_end_onair", attitudeTag: "Clever", gating: { requiresItems: ["confession_tape"] } },
        { id: "smc_walk", text: "Cut the feed and walk away with the tape.", targetSceneId: "sm_end_deadair", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "sm_end_onair",
      title: "Gold Ending — Dead Air Never Sounded So Loud",
      background: "gradient:linear-gradient(180deg,#12242e 0%,#1b3a34 55%,#0a141c 100%)",
      ambientAudio: "jazz",
      prose: "By morning the tape was evidence, the docks were raided, and Marlowe's sign read OFF AIR for the first time in nine years. He slept like a man with nothing left to broadcast.",
      isEnding: true,
      endingData: { tier: "victory-gold", headline: "RADIO HOST BROADCASTS CONFESSION — DOCK RING ROLLED UP BY DAWN", recap: "You recovered the tape and put it on the air. Credits, frames, transitions, and a lockpick — all in one reel." },
    },
    {
      id: "sm_end_deadair",
      title: "Game Over — Dead Air",
      background: "gradient:linear-gradient(180deg,#070b10 0%,#0a141c 100%)",
      ambientAudio: "drone",
      prose: "Marlowe cut the feed and sold the tape to the highest bidder. The story died in the static, and so did whatever was left of the midnight show.",
      isEnding: true,
      endingData: { tier: "gameover", headline: "KMRW GOES SILENT — CONFESSION TAPE VANISHES", recap: "You walked away with the tape instead of the truth. Dead air." },
    },
  ],
};
