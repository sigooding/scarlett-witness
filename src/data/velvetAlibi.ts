import type { Story } from "../types";

/**
 * THE VELVET ALIBI
 * Beta-test flagship built entirely against the Studio schema. Exercises the
 * full engine surface: credits node, cinematic storyboard frames, gated
 * dialogue beats, attitude-based multi-choice replies that reshape the ending,
 * five mini-games, item crafting, the deduction corkboard, trust and meters,
 * and a heat-limit bust.
 */
export const VELVET_ALIBI: Story = {
  id: "velvet-alibi",
  title: "The Velvet Alibi",
  tagline: "She was on stage when the shots rang out. The city wants a quick confession.",
  coverImage: "/img/cover-velvet-alibi.jpg",
  startSceneId: "vb_credits",
  layout: {
    vb_credits: { x: 0, y: 120 },
    vb_office: { x: 320, y: 120 },
    vb_lounge: { x: 640, y: 120 },
    vb_backroom: { x: 960, y: 60 },
    vb_rooftop: { x: 1280, y: 120 },
    vb_end_gold: { x: 1680, y: 0 },
    vb_end_silver: { x: 1680, y: 200 },
    vb_end_gameover: { x: 1680, y: 400 },
  },
  briefing: {
    objective: "Prove torch singer Cora Valdez didn't murder club owner Tony Ferrara — and expose who really did.",
    winConditions: [
      "Decode the stage-door note, reconstruct the torn ticket, and crack the green-room safe.",
      "Connect every clue to the right suspect on the corkboard before accusing.",
      "Corner the real killer on the rooftop.",
    ],
    loseConditions: [
      "Accuse the wrong person without proof.",
      "Let Suspicion reach 6 — the cops shut the case for you.",
      "Fail the rooftop confrontation.",
    ],
    heatLimit: 6,
    heatFailSceneId: "vb_end_gameover",
  },
  characters: [
    { id: "cora", name: "Cora Valdez", role: "Torch Singer", avatarUrl: "/img/ch-cora.jpg", trustMeter: 0, voice: { pitch: 1.12, rate: 0.88 } },
    { id: "frankie", name: "Frankie Blue", role: "House Pianist", avatarUrl: "/img/ch-frankie.jpg", trustMeter: 0, voice: { pitch: 0.9, rate: 0.95 } },
    { id: "mickey", name: "Mickey Scales", role: "Club Manager", avatarUrl: "/img/ch-mickey.jpg", trustMeter: 0, voice: { pitch: 0.7, rate: 0.9 } },
  ],
  items: [
    { id: "case_file", name: "Case File", icon: "📁", description: "The Velvet Lounge file: floor plans, staff list, and Tony Ferrara's autopsy note.", flavorText: "Every good case starts with paper." },
    { id: "cipher_note", name: "Stage-Door Note", icon: "📜", description: "A note in blocky capitals, decoded: MEET ME BACKSTAGE AT TEN.", flavorText: "Somebody summoned the victim.", isClue: true },
    { id: "torn_ticket", name: "Torn Ticket (Left)", icon: "🎟️", description: "Half a torn show ticket from the ashtray. Cora's name is on this side.", flavorText: "Half a truth, waiting for its other half.", isClue: true, combinableWith: { targetItemId: "ticket_stub", resultItemId: "full_ticket" } },
    { id: "ticket_stub", name: "Ticket Stub (Right)", icon: "🎫", description: "The other half of the ticket, stamped with the time Cora took the stage.", flavorText: "The other half of a perfect alibi.", isClue: true },
    { id: "full_ticket", name: "Whole Ticket", icon: "🎟️", description: "Reconstructed: Cora took the stage at 11:48 — exactly when Tony died backstage.", flavorText: "An alibi in two pieces, finally whole.", isClue: true },
    { id: "ledger", name: "Doctored Ledger", icon: "📒", description: "Tony was about to audit the books. Someone's skimming is written all over these pages.", flavorText: "Money always leaves a signature.", isClue: true },
  ],
  deduction: {
    suspectIds: ["cora", "frankie", "mickey"],
    connections: [
      { a: "cipher_note", b: "mickey", flagSet: "mickey_note", revelation: "The stage-door note is in Mickey's handwriting — he summoned Tony backstage at ten." },
      { a: "ledger", b: "mickey", flagSet: "mickey_ledger", revelation: "The doctored ledger shows Mickey was skimming the till Tony was about to audit." },
      { a: "full_ticket", b: "cora", flagSet: "cora_alibi", revelation: "The whole ticket puts Cora on stage at 11:48 — she couldn't have been backstage when Tony died." },
    ],
  },
  scenes: [
    /* ------------------------------------------------------------ */
    {
      id: "vb_credits",
      title: "Opening Credits",
      nodeType: "credits",
      background: "gradient:linear-gradient(160deg,#07111e 0%,#1d0c22 55%,#07070c 100%)",
      noTypewriter: true,
      prose: "THE VELVET ALIBI\n\nDirected by Sam Cole\nWritten by the City\n\nTap Begin Case",
      choices: [{ id: "vb_cr_go", text: "Begin the Case", targetSceneId: "vb_office", attitudeTag: "Neutral" }],
      hotspots: [],
      dialogueBeats: [],
    },
    /* ------------------------------------------------------------ */
    {
      id: "vb_office",
      title: "Act I — Cole's Office",
      background: "/img/bg-velvet-office.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: { mode: "pan", focalPoint: "50% 40%", zoomDuration: 14, dimAmount: 0.12 },
      prose: "Cora Valdez arrived at two in the morning with rain on her stole and a headline already written in her eyes. Tony Ferrara was dead in the green room of the Velvet Lounge — and every cop in town liked her for it. She sang two numbers. She sat for one drink. The rest, she said, was somebody else's story.",
      dialogueBeats: [
        { id: "vbo_cora", characterId: "cora", expression: "frightened", text: "They're going to pin it on me, detective. I sang my numbers, took one drink, and Tony was dead before the last chorus. Please — I need someone who'll actually look." },
      ],
      hotspots: [
        { id: "vbo_file", label: "Cora's case file on the desk", bounds: { x: 14, y: 46, w: 16, h: 15 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "case_file" } },
        { id: "vbo_glass", label: "A second glass by the window", bounds: { x: 68, y: 30, w: 15, h: 16 }, cursor: "look", action: { type: "showText", text: "Two glasses. Someone was here before Cora — or someone wants you to think so.", flagSet: "saw_second_glass" } },
      ],
      choices: [
        {
          id: "vbo_sultry",
          text: "Lean across the desk. \"Take your time, Cora. Start at the velvet curtains and walk me through it.\"",
          targetSceneId: "vb_lounge",
          attitudeTag: "Sultry",
          exclusiveGroup: "opening_approach",
          consequences: {
            setFlags: ["sultry_open"],
            trustChanges: [{ characterId: "cora", delta: 2 }],
            meterChanges: [{ meter: "Sultry", delta: 1 }],
          },
        },
        {
          id: "vbo_aggro",
          text: "Slap the desk. \"Cut the act. If I find out you're lying, I'll hand you to the bulls myself.\"",
          targetSceneId: "vb_lounge",
          attitudeTag: "Aggressive",
          exclusiveGroup: "opening_approach",
          consequences: {
            setFlags: ["aggressive_open"],
            trustChanges: [{ characterId: "cora", delta: -1 }],
            meterChanges: [
              { meter: "Aggressive", delta: 1 },
              { meter: "Suspicion", delta: 1 },
            ],
          },
        },
        {
          id: "vbo_clever",
          text: "\"Walk me through it backwards. What did you see, hear, and touch — in that order?\"",
          targetSceneId: "vb_lounge",
          attitudeTag: "Clever",
          exclusiveGroup: "opening_approach",
          consequences: {
            setFlags: ["clever_open"],
            trustChanges: [{ characterId: "cora", delta: 1 }],
            meterChanges: [{ meter: "Clever", delta: 1 }],
          },
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "vb_lounge",
      title: "Act I — The Velvet Lounge",
      background: "/img/bg-velvet-lounge.jpg",
      ambientAudio: "jazz",
      particles: "smoke",
      prose: "The Velvet Lounge breathed smoke and saxophone. The stage lights were still warm, and the green-room door hung open like a dare. Mickey Scales moved through the crowd with a smile that never reached his eyes.",
      dialogueBeats: [
        { id: "vbl_cora", characterId: "cora", expression: "hopeful", text: "That's the green-room door behind the stage. Tony kept everything that mattered back there." },
        { id: "vbl_frankie", characterId: "frankie", expression: "nervous", text: "Cora was on stage for both numbers. I played every bar. She never left the spotlight — I'd swear it in front of God and the precinct.", conditionRule: { requiresFlags: ["sultry_open", "clever_open"], requiresAll: false } },
        { id: "vbl_mickey", characterId: "mickey", expression: "menacing", text: "You're in my club asking my people questions. Watch your step, gumshoe. Back here, accidents happen to curious people.", conditionRule: { requiresFlags: ["aggressive_open"] } },
        { id: "vbl_cora_safe", characterId: "cora", expression: "confiding", text: "You actually believe me. The green-room safe — Tony always set the dial to 3-1-4. His mother's birthday.", conditionRule: { minTrust: { cora: 2 } } },
      ],
      hotspots: [
                                        { id: "vbl_board", label: "Open the corkboard", bounds: { x: 6, y: 12, w: 14, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
                                        { id: "vbl_note", label: "Read the stage-door note in the slot", bounds: { x: 42, y: 36, w: 20, h: 24 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "cipher_note" } },
      ],
      choices: [
        { id: "vbl_backroom", text: "Follow the stage-door note into the green room.", targetSceneId: "vb_backroom", attitudeTag: "Clever", gating: { requiresItems: ["cipher_note"] } },
        { id: "vbl_office", text: "Return to the office.", targetSceneId: "vb_office", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "vb_backroom",
      title: "Act II — The Green Room",
      background: "/img/bg-velvet-backroom.jpg",
      ambientAudio: "drone",
      particles: "smoke",
      onEnterActions: [{ consequences: { setFlags: ["saw_backroom"] } }],
      prose: "Backstage, the glamour peeled away to brick and wire. A filing cabinet sat against the wall, its lock scratched from somebody else's earlier visit. Somewhere above, a rooftop door banged in the wind.",
      dialogueBeats: [
        { id: "vbb_frankie", characterId: "frankie", expression: "nervous", text: "Keep your voice down. Mickey sleeps with a pistol under the register, and he counts his money with the lights off." },
        { id: "vbb_mickey", characterId: "mickey", expression: "menacing", text: "You again. This is the last time I tell you nice: leave my club, or the alley gets a new stain.", conditionRule: { requiresFlags: ["tailed_mickey"] } },
      ],
      hotspots: [
        { id: "vbb_ledger", label: "Open the scratched filing cabinet", bounds: { x: 58, y: 38, w: 22, h: 32 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "ledger" } },
      ],
      choices: [
        { id: "vbb_rooftop", text: "You've got enough — head for the rooftop.", targetSceneId: "vb_rooftop", attitudeTag: "Clever", gating: { requiresItems: ["full_ticket", "ledger", "cipher_note"], requiresAll: true } },
        { id: "vbb_charm", text: "Flirt your way past the stage door to the roof.", targetSceneId: "vb_rooftop", attitudeTag: "Sultry", gating: { minMeters: { Sultry: 1 } } },
        { id: "vbb_lounge", text: "Return to the lounge.", targetSceneId: "vb_lounge", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "vb_rooftop",
      title: "Act III — The Rooftop",
      background: "/img/bg-velvet-rooftop.jpg",
      ambientAudio: "tension",
      particles: "rain",
      cinematic: { mode: "pan", focalPoint: "50% 45%", dimAmount: 0.2, lights: [{ x: 22, y: 30, color: "#ff2e88", intensity: 0.28, size: 40, pulseSeconds: 2.8, pulseAmount: 1 }] },
      prose: "Rain hammered the rooftop as Mickey Scales turned to face you, cigar glowing like a third eye. The fire escape rattled behind him. One wrong word now, and the city would close this case however it pleased.",
      dialogueBeats: [
        { id: "vbr_mickey", characterId: "mickey", expression: "cold", text: "Go ahead, detective. Say my name. But if you don't have the whole story, you're just another body in the rain." },
      ],
      hotspots: [
        { id: "vbr_board", label: "Open the corkboard one last time", bounds: { x: 4, y: 10, w: 14, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
              ],
      choices: [
        {
          id: "vbr_accuse_gold",
          text: "Accuse Mickey — the note, the ledger, and the ticket all line up.",
          targetSceneId: "vb_end_gold",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["mickey_note", "mickey_ledger", "cora_alibi"], requiresAll: true },
        },
        {
          id: "vbr_accuse_silver",
          text: "Confront Mickey with partial proof — the note and the ledger are enough.",
          targetSceneId: "vb_end_silver",
          attitudeTag: "Aggressive",
          gating: { requiresItems: ["cipher_note", "ledger"], requiresAll: true },
        },
        {
          id: "vbr_blame_frankie",
          text: "Blame Frankie. He had the access, and the nerves.",
          targetSceneId: "vb_end_gameover",
          attitudeTag: "Aggressive",
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "vb_end_gold",
      title: "Gold Ending — The Whole Truth",
      background: "/img/bg-velvet-rooftop.jpg",
      ambientAudio: "jazz",
      prose: "Mickey's sneer finally cracked. The note was his hand, the ledger his embezzlement, and the whole ticket put Cora on stage when Tony died. The handcuffs clicked, and the city's headline stopped pointing at an innocent woman.",
      isEnding: true,
      endingData: { tier: "victory-gold", headline: "SINGER CLEARED — CLUB MANAGER ARRESTED FOR MURDER", recap: "You connected the full board, named the real killer, and gave Cora her alibi back." },
    },
    {
      id: "vb_end_silver",
      title: "Silver Ending — Enough to Break Him",
      background: "/img/bg-velvet-office.jpg",
      ambientAudio: "rain",
      prose: "You had enough to break Mickey's grip — the note and the ledger burned him — but not enough to close the book. He was out by morning, and the murder stayed technically open. Cora walked, though. That was something.",
      isEnding: true,
      endingData: { tier: "victory-silver", headline: "MANAGER OUSTED BUT MURDER REMAINS OPEN", recap: "Partial proof saved Cora but left the killing unsolved." },
    },
    {
      id: "vb_end_gameover",
      title: "Game Over — Wrong Man",
      background: "/img/bg-alley.jpg",
      ambientAudio: "rain",
      prose: "You pointed the finger at the wrong man, and the city smelled blood. The real killer slipped down the fire escape, Cora took the fall, and your name joined the long list of detectives who trusted the obvious story.",
      isEnding: true,
      endingData: { tier: "gameover", headline: "DETECTIVE FINGERS WRONG MAN — CASE COLLAPSES", recap: "You accused without the full board — or lost the confrontation in the rain." },
    },
  ],
};
