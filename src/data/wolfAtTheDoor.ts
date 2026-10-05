import type { Story } from "../types";

/**
 * WOLF AT THE DOOR — a fairy-tale noir in a modern city.
 *
 * The Fables live hidden among us. The player is a wolf-shifter detective
 * working the human/fable border of a rain-slick 1980s metropolis. A young
 * fable named Elsa Vane has vanished on the eve of a "contract" — the binding
 * pact that keeps the Woodlands settlement safe. Her disappearance threatens
 * to expose everyone. Two suspects, three clues, a corkboard finale, a memory
 * recall, and a quick-time showdown where hesitation costs the city its
 * peace of mind (but not necessarily the case).
 *
 * Exercises: conversational replies + memory recalls, a two-half crafted
 * clue, a deduction corkboard as the accusation gate, a heat/bust trapdoor,
 * a quick-time prompt with heartbeat + shaky cam and a distinct "you
 * hesitated" consequence path, and gold / silver / game-over endings.
 */
export const WOLF_AT_THE_DOOR: Story = {
  id: "wolf-at-the-door",
  title: "Wolf at the Door",
  tagline: "The woods moved into the city. The wolf was only ever keeping the door shut.",
  coverImage: "/img/wolf-cover.jpg",
  startSceneId: "wf_office",
  layout: {
    wf_office: { x: 0, y: 200 },
    wf_woodlands: { x: 420, y: 200 },
    wf_club: { x: 840, y: 200 },
    wf_cellar: { x: 1260, y: 200 },
    wf_confront: { x: 1680, y: 200 },
    wf_qte: { x: 2100, y: 200 },
    wf_end_gold: { x: 2520, y: 0 },
    wf_end_silver: { x: 2520, y: 200 },
    wf_end_bust: { x: 2520, y: 400 },
    wf_hesitated: { x: 2100, y: 480 },
  },
  briefing: {
    objective: "Find who took Elsa Vane before the city's fable-folk tear themselves apart — and before the humans find out.",
    winConditions: [
      "Recover the torn contract page and the silver mirror shard at the Woodlands.",
      "Combine the page to prove what Elsa was owed.",
      "Wire the evidence to the right fable, then take him down before the city bleeds.",
    ],
    loseConditions: [
      "Accuse the wrong fable without proof.",
      "Let Suspicion hit the limit — the city closes ranks and the trail goes cold.",
      "Hesitate too long in the final moment and lose the suspect.",
    ],
    heatLimit: 6,
    heatFailSceneId: "wf_end_bust",
  },
  characters: [
    { id: "lydia", name: "Lydia Hart", role: "First True Bride of the Woodlands", avatarUrl: "/img/wolf-lydia.jpg", trustMeter: 0, voice: { pitch: 1.1, rate: 0.9 } },
    { id: "caleb", name: "Caleb Crane", role: "Land Agent of the Hill", avatarUrl: "/img/wolf-caleb.jpg", trustMeter: 0, voice: { pitch: 0.75, rate: 0.92 } },
    { id: "marcus", name: "Marcus Vane", role: "Keeper of the Woodlands", avatarUrl: "/img/wolf-marcus.jpg", trustMeter: 0, voice: { pitch: 0.85, rate: 0.95 } },
  ],
  items: [
    { id: "page_a", name: "Torn Contract (half)", icon: "📄", description: "One half of the binding contract that keeps the Woodlands safe. Elsa's name, inked in a hand that trembled.", flavorText: "A page torn from a pact — and from the world.", isClue: true, combinableWith: { targetItemId: "page_b", resultItemId: "page_whole" } },
    { id: "page_b", name: "Torn Contract (half)", icon: "📜", description: "The other half, shoved under the Woodlands hearth. It names a bride and a reward.", flavorText: "Half a promise, waiting for the other half.", isClue: true, combinableWith: { targetItemId: "page_a", resultItemId: "page_whole" } },
    { id: "page_whole", name: "Reconstructed Contract", icon: "📜", description: "The whole pact: Elsa Vane was to be wed to the land itself — and someone stood to inherit her place and her woods.", flavorText: "A contract is a story with a signature.", isClue: true },
    { id: "mirror_shard", name: "Silver Mirror Shard", icon: "🪞", description: "A shard of the mirror that tells the truth. It reflects a liar as a cracked, wrong smile.", flavorText: "Even a mirror can catch a fable in a lie.", isClue: true },
    { id: "apple", name: "Sleeping Apple", icon: "🍎", description: "A single apple, half-eaten, on the Woodlands threshold. It wasn't poison — it was a warning.", flavorText: "Someone wanted her to sleep a long, long time.", isClue: true },
  ],
  deduction: {
    suspectIds: ["lydia", "caleb", "marcus"],
    connections: [
      { a: "page_whole", b: "caleb", flagSet: "contract_caleb", revelation: "The contract names a proxy bride — and Caleb Crane stood to take the woods in her place." },
      { a: "mirror_shard", b: "lydia", flagSet: "mirror_lydia", revelation: "The shard shows Lydia's lie — she saw Elsa leave, and was paid to keep the door shut." },
      { a: "apple", b: "marcus", flagSet: "apple_marcus", revelation: "The apple is Marcus's — he half-suspected his own niece; the failed warning left him an accomplice to silence." },
    ],
  },
  scenes: [
    /* ------------------------- the office (start) ------------------------- */
    {
      id: "wf_office",
      title: "The Dim Office",
      background: "/img/wolf-office.jpg",
      ambientAudio: "rain",
      particles: "rain",
      prose:
        "The office smelled of wet newspaper and old tobacco. Elsa Vane was gone the night before the contract was to be signed, and the Woodlands wanted it quiet. 'She's not dead,' the letter said. 'But the city is,' read the postscript. Someone had slipped a torn page under the door, and the name inked on it was Elsa's.",
      dialogueBeats: [
        { id: "wf_office_lydia", characterId: "lydia", expression: "guarded", text: "Everyone calls me the first true bride. Elsa was to be the next — the land's own. I want her found. I just don't want the city to know why it matters." },
        { id: "wf_office_recall", characterId: "lydia", expression: "watching you", text: "You asked me to start at the last thing I saw. The bulls never ask that. They just want a name.", conditionRule: { requiresFlags: ["asked_last"], requiresAll: true } },
      ],
      hotspots: [],
      choices: [
        { id: "wf_sultry", text: "\"Tell me about the last time you saw her — and who was listening.\"", reply: true, targetSceneId: "", exclusiveGroup: "opening", attitudeTag: "Sultry", memoryLog: "opening_sultry", rememberLine: "Lydia will remember that.", consequences: { setFlags: ["asked_last"], trustChanges: [{ characterId: "lydia", delta: 2 }], meterChanges: [{ meter: "Sultry", delta: 1 }] } },
        { id: "wf_clever", text: "\"Walk it backwards. Who stood to gain the moment she vanished?\"", reply: true, targetSceneId: "", exclusiveGroup: "opening", attitudeTag: "Clever", memoryLog: "opening_clever", rememberLine: "Lydia will remember that.", consequences: { setFlags: ["asked_last"], trustChanges: [{ characterId: "lydia", delta: 1 }], meterChanges: [{ meter: "Clever", delta: 1 }] } },
        { id: "wf_aggro", text: "\"Cut the fairy tales. If the city bleeds, it's on your head.\"", reply: true, targetSceneId: "", exclusiveGroup: "opening", attitudeTag: "Aggressive", memoryLog: "opening_aggro", rememberLine: "Lydia will remember that.", consequences: { setFlags: ["harsh_start"], trustChanges: [{ characterId: "lydia", delta: -1 }], meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }] } },
        { id: "wf_go", text: "Head to the Woodlands.", targetSceneId: "wf_woodlands", attitudeTag: "Neutral" },
      ],
    },
    /* ------------------------- the woodlands ------------------------- */
    {
      id: "wf_woodlands",
      title: "The Woodlands",
      background: "/img/wolf-woodlands.jpg",
      ambientAudio: "drone",
      prose:
        "A boarding house pretending to be a building, though its walls leaned like trees and its stairs creaked like branches. Marcus Vane — Elsa's uncle — stood in the doorway, and the hearth behind him hid a torn half-page among the ash.",
      dialogueBeats: [
        { id: "wf_wood_marcus", characterId: "marcus", expression: "hollow", text: "Elsa was my niece and the land's own. I keep the Woodlands the way an old dog keeps a gate. Someone has been letting wolves through." },
      ],
      hotspots: [
        { id: "wf_wood_pageb", label: "Torn half-page in the ash", bounds: { x: 30, y: 44, w: 22, h: 30 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "page_b" } },
        { id: "wf_wood_apple", label: "Half-eaten apple by the threshold", bounds: { x: 68, y: 56, w: 20, h: 26 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "apple" } },
        { id: "wf_wood_board", label: "Open the corkboard", bounds: { x: 4, y: 10, w: 14, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        { id: "wf_wood_club", text: "Follow the scent to the Blue Lantern Club.", targetSceneId: "wf_club", attitudeTag: "Neutral" },
        { id: "wf_wood_office", text: "Back to the office.", targetSceneId: "wf_office", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    /* ------------------------- the club ------------------------- */
    {
      id: "wf_club",
      title: "The Blue Lantern",
      background: "/img/wolf-club.jpg",
      ambientAudio: "jazz",
      particles: "smoke",
      prose:
        "The Blue Lantern glowed amber through the rain. Lydia Hart held court by the bar, one hand on a half-empty glass, the other on a silver mirror shard she'd meant to hide. Caleb Crane watched from the dark, a gaunt smile like a knife in a sheath.",
      dialogueBeats: [
        { id: "wf_club_caleb", characterId: "caleb", expression: "cold", text: "You're poking at a buried quiet, detective. The Woodlands were never more than a story with a roof. Some of us simply know how to read the ending." },
        { id: "wf_club_lydia", characterId: "lydia", expression: "confiding", text: "Elsa made a choice to vanish. I saw her go — I just can't say it out loud, or the hill eats what's left of us.", conditionRule: { minTrust: { lydia: 1 } } },
      ],
      hotspots: [
        { id: "wf_club_shard", label: "Silver mirror shard on the bar", bounds: { x: 44, y: 40, w: 20, h: 28 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "mirror_shard" } },
        { id: "wf_club_board", label: "Open the corkboard", bounds: { x: 4, y: 10, w: 14, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        { id: "wf_club_cellar", text: "Slip down to the cellar where the servants whisper.", targetSceneId: "wf_cellar", attitudeTag: "Clever" },
        { id: "wf_club_wood", text: "Return to the Woodlands.", targetSceneId: "wf_woodlands", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    /* ------------------------- the cellar ------------------------- */
    {
      id: "wf_cellar",
      title: "The Cellar",
      background: "/img/wolf-cellar.jpg",
      ambientAudio: "tension",
      prose:
        "Beneath the club the cellar smelled of earth, apples, and a terrible quiet. The other half of the contract was wedged behind a wine rack, and the apple on its stem had been bitten once — a warning, not a meal.",
      dialogueBeats: [
        { id: "wf_cellar_marcus", characterId: "marcus", expression: "low", text: "I half-knew before I let her walk out that door. Keep the Woodlands out of your hunt, detective — or the hill buries us all.", conditionRule: { requiresFlags: ["asked_last"], requiresAll: false } },
      ],
      hotspots: [
        { id: "wf_cellar_pagea", label: "Other half-page behind the wine rack", bounds: { x: 24, y: 40, w: 22, h: 30 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "page_a" } },
        { id: "wf_cellar_board", label: "Open the corkboard", bounds: { x: 4, y: 10, w: 14, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        { id: "wf_cellar_confront", text: "You've got the page and the shard — corner the real killer.", targetSceneId: "wf_confront", attitudeTag: "Clever", gating: { requiresFlags: ["contract_caleb", "mirror_lydia"], requiresAll: true } },
        { id: "wf_cellar_club", text: "Back to the club.", targetSceneId: "wf_club", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    /* ------------------------- confrontation ------------------------- */
    {
      id: "wf_confront",
      title: "The Confrontation",
      background: "/img/wolf-confront.jpg",
      ambientAudio: "tension",
      prose:
        "Rain hammered the glass as Caleb Crane turned, the contract page crumpled in his fist. The Blue Lantern held its breath. One wrong word and the hill would swallow the truth — and the city would learn what walked among them.",
      dialogueBeats: [
        { id: "wf_conf_caleb", characterId: "caleb", expression: "seething", text: "You found a page and a shard. That's clutter. The Woodlands were never mine to take — only to keep quiet." },
        { id: "wf_conf_lydia", characterId: "lydia", expression: "steady", text: "Say the name where the city can hear it, detective. If you're certain, be certain out loud.", conditionRule: { requiresFlags: ["asked_last"], requiresAll: false } },
      ],
      hotspots: [
        { id: "wf_conf_board", label: "Open the corkboard and connect the evidence", bounds: { x: 42, y: 16, w: 18, h: 20 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        { id: "wf_conf_gold", text: "Accuse Caleb Crane — the contract and the silence both point at him.", targetSceneId: "wf_qte", attitudeTag: "Clever", gating: { requiresFlags: ["contract_caleb", "mirror_lydia"], requiresAll: true } },
        { id: "wf_conf_silver", text: "Push Caleb out with the contract alone, but leave the rest of the city uneasy.", targetSceneId: "wf_end_silver", attitudeTag: "Aggressive", gating: { requiresFlags: ["contract_caleb"], requiresAll: true } },
        { id: "wf_conf_blame_lydia", text: "Blame Lydia — the bride who watched him leave.", targetSceneId: "wf_end_bust", attitudeTag: "Neutral" },
        { id: "wf_conf_cellar", text: "Not yet. Return to the cellar and finish the evidence.", targetSceneId: "wf_cellar", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    /* ------------------------- quick-time showdown ------------------------- */
    {
      id: "wf_qte",
      title: "The Wolf at the Door",
      background: "/img/wolf-club.jpg",
      ambientAudio: "tension",
      letterbox: true,
      transition: "fade-black",
      transitionSpeed: 0.8,
      prose:
        "Caleb lunges for the side door with the contract in his fist and the city's secret on his breath. You've got one split second — move, or let the hill take everything.",
      hotspots: [
        { id: "wf_qte_board", label: "Open the corkboard", bounds: { x: 4, y: 10, w: 14, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        { id: "wf_qte_stop", text: "Stop Caleb before he reaches the door.", quickTime: true, qtePrompt: "STOP HIM!", timeLimitSeconds: 6, qteHeartbeat: true, qteShakyCam: true, rememberLine: "The city will remember that.", targetSceneId: "wf_end_gold", attitudeTag: "Clever", gating: { requiresFlags: ["contract_caleb", "mirror_lydia"], requiresAll: true }, timedOutTargetSceneId: "wf_hesitated", timedOutConsequences: { setFlags: ["hesitated"], meterChanges: [{ meter: "Suspicion", delta: 2 }] } },
        { id: "wf_qte_slow", text: "Let him take the pages — follow the paper trail instead.", targetSceneId: "wf_end_silver", attitudeTag: "Neutral" },
        { id: "wf_qte_back", text: "Not yet. Back to the cellar.", targetSceneId: "wf_cellar", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    /* ------------------------- you hesitated ------------------------- */
    {
      id: "wf_hesitated",
      title: "You Hesitated",
      background: "/img/wolf-cellar.jpg",
      ambientAudio: "rain",
      prose:
        "You froze. Half a heartbeat too long, and Caleb was through the door and into the night. The contract went with him — but the truth didn't. The city's fables are still hiding, and you've a second chance to close the door on the man who opened it.",
      dialogueBeats: [
        { id: "wf_hes_lydia", characterId: "lydia", expression: "disappointed", text: "You hesitated, detective. The gold slipped through. I'm still here — don't waste the second chance on doubt.", conditionRule: { requiresFlags: ["hesitated"], requiresAll: true } },
      ],
      choices: [
        { id: "wf_hes_back", text: "Go back to the confrontation and move faster this time.", targetSceneId: "wf_confront", attitudeTag: "Neutral", isRepeatable: true },
        { id: "wf_hes_exit", text: "Hand the truth to the hill and walk.", targetSceneId: "wf_end_silver", attitudeTag: "Neutral" },
      ],
    },
    /* ------------------------- endings ------------------------- */
    { id: "wf_end_gold", title: "Gold — The Door Holds", background: "/img/wolf-end-gold.jpg", ambientAudio: "jazz", prose: "Caleb went down at the threshold with the contract still in his fist. The shard and the page named him, and the Woodlands kept its quiet. The city never learned what walks among them, and the wolf stayed just inside the door, watching.", isEnding: true, endingData: { tier: "victory-gold", headline: "LAND AGENT BROUGHT DOWN — CITY'S SECRET HOLDS", recap: "You proved the contract, wired it to Caleb, and beat the clock to stop him. The Woodlands is safe." } },
    { id: "wf_end_silver", title: "Silver — A Crack in the Door", background: "/img/bg-alley.jpg", ambientAudio: "rain", prose: "The contract enough to break Caleb's grip, but without the shard the city never fully closed the door. He was out by morning, the fables still hiding, and Elsa's name half-forgotten under the rain.", isEnding: true, endingData: { tier: "victory-silver", headline: "AGENT OUSTED, SECRET LEFT HALF-OPEN", recap: "Partial proof saved the Woodlands but left the case — and the city's secret — teetering." } },
    { id: "wf_end_bust", title: "Game Over — The Hill Buries It", background: "/img/wolf-cellar.jpg", ambientAudio: "rain", prose: "You named the wrong hand, or the city closed rank around its secret. The Woodlands went dark and quiet, Elsa's name folded into a story no one tells. The wolf, for once, was the one left outside the door.", isEnding: true, endingData: { tier: "gameover", headline: "CASE BURIED — CITY KEEPS ITS SECRET", recap: "You accused without proof or let the heat bury you. The door closes on the truth." } },
  ],
};
