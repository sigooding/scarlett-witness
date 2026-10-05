import type { Story } from "../types";

/**
 * THE PERK RANGE
 * A deliberately tiny, self-describing case designed to TEST the four perks in
 * isolation. It is not a mystery with a twist — it is a proving ground so you
 * can watch each perk unlock and confirm its effect by reading the toast/Case
 * Progress readouts. There is no heat bust; endings are purely "you verified
 * the perk(s)".
 *
 * Perk threshold & effect (see src/game/Game.tsx perkDefs):
 *   VELVET TONGUE  Sultry 4+    positive trust gains get +1
 *   IRON NERVE     Aggressive 4+  Aggressive-tagged choices stop costing Suspicion
 *   SHARP EYE      Clever 4+    wrong corkboard guesses draw no Suspicion
 *   HEAT           Suspicion 6+  trust gains halved; wrong corkboard links cost 2
 *
 * Ranges:
 *   1. BAR — press each attitude button N times to push that meter to its
 *      threshold (each Sultry/Aggressive/Clever button also bumps its meter).
 *   2. DOUBLE-BAR — Sultry 4+ makes the "trust" button grant +2 instead of +1.
 *      Aggressive 4+ makes the same "push" button add Suspicion... until Iron
 *      Nerve turns it off.
 *   3. BOARD — a single wrong guess shows Sharp Eye absorbing the cost (Clever
 *      4+), or adding Suspicion (and x2 with HEAT) when the perks are absent.
 *   4. CROWD — a slider to raise Suspicion to 6 to see HEAT.
 */
export const PERK_RANGE: Story = {
  id: "perk-range",
  title: "The Perk Range",
  tagline: "A proving ground for the four perks — watch each one unlock and confirm its effect.",
  coverImage: "gradient:linear-gradient(160deg,#0a141c 0%,#10202b 55%,#07070c 100%)",
  startSceneId: "pk_bar",
  layout: {
    pk_bar: { x: 0, y: 200 },
    pk_double: { x: 420, y: 200 },
    pk_board: { x: 840, y: 200 },
    pk_crowd: { x: 1260, y: 200 },
    pk_end_verified: { x: 1680, y: 120 },
    pk_end_unverified: { x: 1680, y: 320 },
  },
  briefing: {
    objective: "Push each meter to its perk threshold and confirm the perk's effect reads out as described.",
    winConditions: [
      "Reach Sultry 4, Aggressive 4, Clever 4 and Suspicion 6 at least once each.",
      "Read the perk unlock toast and confirm its effect on the choice/corkboard.",
    ],
    loseConditions: [
      "Leave with a meter still below its threshold — a perk left unverified.",
    ],
  },
  characters: [
    { id: "ringmaster", name: "The Ringmaster", role: "Range Instructor", avatarUrl: "emoji:🎪", trustMeter: 0, voice: { pitch: 0.9, rate: 0.95 } },
  ],
  items: [
    {
      id: "score_card",
      name: "Perk Scorecard",
      icon: "🗒️",
      description: "A printed card with the four perk thresholds and what each one should do.",
      flavorText: "Read the card, push the meter, watch the perk light up.",
      isClue: true,
    },
  ],
  deduction: {
    suspectIds: ["ringmaster"],
    connections: [
      { a: "score_card", b: "ringmaster", flagSet: "perks_read", revelation: "You read the scorecard and confirmed the four perk thresholds." },
    ],
  },
  scenes: [
    /* ------------------------- 1. THE BAR ------------------------- */
    {
      id: "pk_bar",
      title: "The Bar — Pump the Meters",
      background: "/img/bg-club.jpg",
      ambientAudio: "jazz",
      particles: "smoke",
      prose:
        "The Perk Range is a backroom testing floor. The Ringmaster hands you a scorecard and a bar of attitude buttons. 'Push each meter to its line,' he says, 'and the perk will tell you it's awake.' The card reads: Sultry 4 → Velvet Tongue. Aggressive 4 → Iron Nerve. Clever 4 → Sharp Eye. Suspicion 6 → HEAT.",
      dialogueBeats: [
        {
          id: "pk_bar_rm",
          characterId: "ringmaster",
          expression: "proctor",
          text: "Each button under the bar nudges its own meter. Slip one, then watch the perk flash up in the Case Progress panel top-left.",
        },
      ],
      hotspots: [
        { id: "pk_bar_card", label: "Read the perk scorecard", bounds: { x: 6, y: 12, w: 16, h: 18 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "score_card" } },
        { id: "pk_bar_board", label: "Open the corkboard", bounds: { x: 4, y: 10, w: 14, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        { id: "pk_coin", text: "Flip a coin to Sultry (+1 Sultry, +1 trust)", targetSceneId: "pk_bar", attitudeTag: "Sultry", consequences: { meterChanges: [{ meter: "Sultry", delta: 1 }], trustChanges: [{ characterId: "ringmaster", delta: 1 }] } },
        { id: "pk_pew", text: "Lean hard into Aggressive (+1 Aggressive, +1 Suspicion)", targetSceneId: "pk_bar", attitudeTag: "Aggressive", consequences: { meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }] } },
        { id: "pk_percept", text: "Spot the detail (+1 Clever)", targetSceneId: "pk_bar", attitudeTag: "Clever", consequences: { meterChanges: [{ meter: "Clever", delta: 1 }] } },
        { id: "pk_next", text: "Head to the double-check bar.", targetSceneId: "pk_double", attitudeTag: "Neutral" },
      ],
    },
    /* ------------------------- 2. DOUBLE-CHECK BAR ------------------------- */
    {
      id: "pk_double",
      title: "The Double-Check Bar",
      background: "/img/bg-club.jpg",
      ambientAudio: "jazz",
      prose:
        "A second bar, with two buttons that read out the two most counterintuitive perks. 'Velvet Tongue should turn a one-heart trust gain into two,' the Ringmaster says. 'And Iron Nerve should finally stop your harsh button from feeding Suspicion.'",
      dialogueBeats: [
        {
          id: "pk_double_rm",
          characterId: "ringmaster",
          expression: "coaching",
          text: "Gain trust with the charm button, then hit the hard button. If you've reached Aggressive 4, the Suspicion toast won't fire — that's Iron Nerve doing its job.",
        },
      ],
      hotspots: [
        { id: "pk_double_board", label: "Open the corkboard", bounds: { x: 4, y: 10, w: 14, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        { id: "pk_dbl_charm", text: "Charm the Ringmaster (+1 trust; Velvet Tongue makes it +2)", targetSceneId: "pk_double", attitudeTag: "Sultry", consequences: { trustChanges: [{ characterId: "ringmaster", delta: 1 }] } },
        { id: "pk_dbl_push", text: "Bark at the Ringmaster (+1 Aggressive, +1 Suspicion — Iron Nerve cancels the Suspicion)", targetSceneId: "pk_double", attitudeTag: "Aggressive", consequences: { meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }] } },
        { id: "pk_dbl_back", text: "Back to the first bar.", targetSceneId: "pk_bar", attitudeTag: "Neutral", isRepeatable: true },
        { id: "pk_dbl_board", text: "Head to the corkboard range.", targetSceneId: "pk_board", attitudeTag: "Clever" },
      ],
    },
    /* ------------------------- 3. THE BOARD RANGE ------------------------- */
    {
      id: "pk_board",
      title: "The Board Range",
      background: "/img/bg-club.jpg",
      ambientAudio: "tension",
      prose:
        "A single corkboard with one suspect. 'Drag the scorecard's pin onto the Ringmaster for the correct link,' he says. 'But try a bogus pair first. With Sharp Eye, a bad hunch whispers and walks. Without it, it costs Suspicion — double if HEAT is up.'",
      dialogueBeats: [
        {
          id: "pk_board_rm",
          characterId: "ringmaster",
          expression: "testing",
          text: "This board has exactly one good string. Make a wrong guess first to see Sharp Eye (Clever 4+) swallow the cost — then make the right one for the payout.",
        },
      ],
      hotspots: [
        { id: "pk_board_board", label: "Open the corkboard", bounds: { x: 40, y: 8, w: 14, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        { id: "pk_board_good", text: "Wire the scorecard to the Ringmaster (the correct string)", targetSceneId: "pk_board", attitudeTag: "Clever", consequences: { setFlags: ["perks_read"] } },
        { id: "pk_board_crowd", text: "Head to the crowd range.", targetSceneId: "pk_crowd", attitudeTag: "Neutral" },
        { id: "pk_board_back", text: "Return to the double-check bar.", targetSceneId: "pk_double", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    /* ------------------------- 4. THE CROWD (HEAT) ------------------------- */
    {
      id: "pk_crowd",
      title: "The Crowd — HEAT",
      background: "/img/bg-club.jpg",
      ambientAudio: "drone",
      prose:
        "The last station simulates a hostile room. There is no bust here — the heat just builds. 'Get Suspicion to 6 and HEAT lights up,' the Ringmaster says. 'From then on, every trust gain you make is halved, and any bad corkboard link costs you two instead of one.'",
      dialogueBeats: [
        {
          id: "pk_crowd_rm",
          characterId: "ringmaster",
          expression: "warning",
          text: "Suspicion has no ceiling here. Keep pushing the harsh button and HEAT will pulse in the Case Progress panel — then watch your charm gains get cut in half.",
        },
      ],
      hotspots: [
        { id: "pk_crowd_board", label: "Open the corkboard", bounds: { x: 4, y: 10, w: 14, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        { id: "pk_crowd_press", text: "Press the crowd (+2 Suspicion)", targetSceneId: "pk_crowd", attitudeTag: "Aggressive", consequences: { meterChanges: [{ meter: "Suspicion", delta: 2 }] } },
        { id: "pk_crowd_charm", text: "Charm the crowd (+1 trust; HEAT halves it)", targetSceneId: "pk_crowd", attitudeTag: "Sultry", consequences: { trustChanges: [{ characterId: "ringmaster", delta: 1 }] } },
        { id: "pk_crowd_back", text: "Back to the board range.", targetSceneId: "pk_board", attitudeTag: "Neutral", isRepeatable: true },
        { id: "pk_end_verified", text: "Done — I've verified the perks.", targetSceneId: "pk_end_verified", attitudeTag: "Clever", gating: { requiresFlags: ["perks_read"] } },
        { id: "pk_end_unverified", text: "Walk out without confirming much.", targetSceneId: "pk_end_unverified", attitudeTag: "Neutral", gating: { excludesFlags: ["perks_read"] } },
      ],
    },
    /* ------------------------- endings ------------------------- */
    {
      id: "pk_end_verified",
      title: "Verified — Range Passed",
      background: "/img/bg-end-gold.jpg",
      ambientAudio: "jazz",
      prose:
        "You read the scorecard, pushed each meter past its line, and watched every perk wake up. Velvet Tongue, Iron Nerve, Sharp Eye and HEAT all confirmed — the range's work is done.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "RANGE PASSED — ALL FOUR PERKS VERIFIED",
        recap: "You confirmed each perk's effect: trust gains, the Aggressive Suspicion cut, the bad-guess grace, and the heat-doubled cost.",
      },
    },
    {
      id: "pk_end_unverified",
      title: "Unverified — Range Incomplete",
      background: "/img/bg-office.jpg",
      ambientAudio: "rain",
      prose:
        "You walked out without reading the scorecard or pushing the meters to their lines. The perks stayed dark and unproven — a range half-attended, and the Ringmaster will have to call in someone with the nerve to actually test the gear.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "RANGE LEFT UNVERIFIED",
        recap: "You didn't confirm the perk thresholds, so the range counts as a missed session.",
      },
    },
  ],
};
