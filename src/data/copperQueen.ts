import type { Story } from "../types";

/**
 * THE COPPER QUEEN
 * A born-in-Stonebrook backstage mystery. Rex Duval — the theatre's owner and
 * resident old-school rake — is found dead in the Copper Queen's green room,
 * one act before the curtain he'd promised would save the house. The papers
 * want a headline before the matinee; Vera, his leading lady, wants the truth
 * before the city decides she did it. Three suspects, three clues, one sealed
 * note, and a ledger that says everyone's hands were in the till.
 *
 * Demonstrates: conversational replies, trust-gated dialogue, the deduction
 * corkboard (clue → suspect strings as the win gate), a heat/bust trapdoor,
 * and both a gold and silver victory plus a game-over.
 */
export const COPPER_QUEEN: Story = {
  id: "copper-queen",
  title: "The Copper Queen",
  tagline: "Every theatre has a ghost. This one was still warm when the lights went up.",
  coverImage: "gradient:linear-gradient(160deg,#1a0a0e 0%,#43121b 55%,#0a080c 100%)",
  startSceneId: "cq_office",
  layout: {
    cq_office: { x: 0, y: 220 },
    cq_club: { x: 400, y: 220 },
    cq_greenroom: { x: 800, y: 220 },
    cq_confront: { x: 1200, y: 220 },
    cq_end_gold: { x: 1600, y: 0 },
    cq_end_silver: { x: 1600, y: 220 },
    cq_end_bust: { x: 1600, y: 440 },
  },
  briefing: {
    objective: "Prove who killed Rex Duval backstage at the Copper Queen — without letting the city hang Vera for it.",
    winConditions: [
      "Find the backstage ledger and the sealed note Rex hid in the green room.",
      "Wire the clues to the right person on the corkboard.",
      "Name the killer with the full board behind you.",
    ],
    loseConditions: [
      "Accuse the wrong person.",
      "Let Suspicion hit the curtain — the city closes the case without you.",
      "Push Vera so far she stops talking.",
    ],
    heatLimit: 6,
    heatFailSceneId: "cq_end_bust",
  },
  characters: [
    {
      id: "vera",
      name: "Vera Voss",
      role: "Leading Lady",
      avatarUrl: "emoji:💃",
      trustMeter: 0,
      voice: { pitch: 1.15, rate: 0.9 },
    },
    {
      id: "solomon",
      name: "Solomon Reyes",
      role: "Owner of the Copper Queen",
      avatarUrl: "emoji:🎩",
      trustMeter: 0,
      voice: { pitch: 0.75, rate: 0.92 },
    },
    {
      id: "desh",
      name: "Desh Anand",
      role: "Stage Manager",
      avatarUrl: "emoji:🛠️",
      trustMeter: 0,
      voice: { pitch: 1.0, rate: 1.0 },
    },
  ],
  items: [
    {
      id: "sealed_note",
      name: "The Sealed Note",
      icon: "📜",
      description: "A folded note in a wax-sealed envelope, hidden in the green-room safe. 'Change the green-room lock tonight. She must not get in.'",
      flavorText: "Somebody wrote an order, then made sure nobody could read it until after the kill.",
      isClue: true,
    },
    {
      id: "ledger",
      name: "Backstage Ledger",
      icon: "📒",
      description: "Rex's private ledger. The bottom line has been doctored — a new hand has been writing entries that don't match the box office takings.",
      flavorText: "Money always leaves a signature. This one's been signed twice.",
      isClue: true,
    },
    {
      id: "perfume",
      name: "Crystal Perfume Vial",
      icon: "🧴",
      description: "A cracked crystal vial under the vanity. It smells of gardenia — the scent Rex bought for whoever he was courting this week.",
      flavorText: "It was planted to point at the wrong woman.",
      isClue: true,
    },
  ],
  deduction: {
    suspectIds: ["vera", "solomon", "desh"],
    connections: [
      { a: "ledger", b: "solomon", flagSet: "ledger_solomon", revelation: "The doctored ledger is Solomon's — he was skimming the till Rex was about to audit." },
      { a: "sealed_note", b: "solomon", flagSet: "note_solomon", revelation: "The sealed note is in Solomon's hand. He ordered the lock changed so Vera couldn't get in." },
      { a: "perfume", b: "vera", flagSet: "perfume_vera", revelation: "The perfume was planted to frame Vera — it points at her, but it proves she was set up." },
    ],
  },
  scenes: [
    /* ------------------------- office (start) ------------------------- */
    {
      id: "cq_office",
      title: "The Office",
      background: "/img/bg-office.jpg",
      ambientAudio: "rain",
      particles: "rain",
      prose:
        "Vera Voss arrived with rain on her stole and the wrong kind of calm in her eyes. Rex Duval — owner of the Copper Queen and half the city's scandals — was dead in the green room, and the matinee was in three hours. 'They'll want a headline,' she said. 'I'd like you to find the truth before the ink dries.'",
      dialogueBeats: [
        {
          id: "cqv_vera",
          characterId: "vera",
          expression: "fragile",
          text: "Rex wasn't kind, detective. But he wasn't stupid. Whoever did it knew the theatre the way a man knows his own coat pocket.",
        },
        {
          id: "cqv_confide",
          characterId: "vera",
          expression: "confiding",
          text: "He was going to audit the books this week. Solomon has been walking around the Copper Queen like its owner with a weight on his shoulders.",
          conditionRule: { minTrust: { vera: 1 } },
        },
        {
          id: "cqv_cold",
          characterId: "vera",
          expression: "guarded",
          text: "The police already have their story. If you're just going to repeat it back to me, I can save us both the rain.",
          conditionRule: { requiresFlags: ["harsh_start"] },
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "cqo_sultry",
          text: "\"Take your time, Miss Voss. Start with the last song the two of you sang.\"",
          reply: true,
          targetSceneId: "",
          exclusiveGroup: "opening",
          attitudeTag: "Sultry",
          consequences: { setFlags: ["sultry_open"], trustChanges: [{ characterId: "vera", delta: 2 }], meterChanges: [{ meter: "Sultry", delta: 1 }] },
        },
        {
          id: "cqo_aggro",
          text: "\"Cut the tears. If you're lying to me about the last hour, you'll be the headline.\"",
          reply: true,
          targetSceneId: "",
          exclusiveGroup: "opening",
          attitudeTag: "Aggressive",
          consequences: { setFlags: ["harsh_start"], trustChanges: [{ characterId: "vera", delta: -1 }], meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }] },
        },
        {
          id: "cqo_clever",
          text: "\"Walk me through it backwards. Who heard Rex last, and who was listening?\"",
          reply: true,
          targetSceneId: "",
          exclusiveGroup: "opening",
          attitudeTag: "Clever",
          consequences: { setFlags: ["clever_open"], trustChanges: [{ characterId: "vera", delta: 1 }], meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
        {
          id: "cqo_soften",
          text: "\"Forget how I came on. Start again — gentler.\"",
          reply: true,
          targetSceneId: "",
          hidden: true,
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["harsh_start"] },
          consequences: { clearFlags: ["harsh_start"], setFlags: ["sultry_open"], trustChanges: [{ characterId: "vera", delta: 2 }] },
        },
        { id: "cqo_go", text: "Head to the Copper Queen.", targetSceneId: "cq_club", attitudeTag: "Neutral" },
      ],
    },
    /* ------------------------- the Copper Queen ------------------------- */
    {
      id: "cq_club",
      title: "The Copper Queen",
      background: "/img/bg-jazz-club.jpg",
      ambientAudio: "jazz",
      particles: "smoke",
      prose:
        "The Copper Queen smelled of old stage grease and newer perfume. The green-room door stood ajar behind the curtain, and the stage lights were still warm. Solomon Reyes watched you from the bar with a smile that never reached his eyes.",
      dialogueBeats: [
        {
          id: "cqc_solomon",
          characterId: "solomon",
          expression: "menacing",
          text: "This is my theatre, gumshoe. I keep the lights on and the doors shut. Whatever happened in the green room, you're not going to make it cheaper for the press.",
        },
        {
          id: "cqc_desh",
          characterId: "desh",
          expression: "nervous",
          text: "I found him, alright? The door was latched from the inside and Rex was on the floor by the vanity. I didn't touch nothing — I know how that looks.",
        },
      ],
      hotspots: [
        { id: "cqc_greenroom", label: "The green-room door", bounds: { x: 44, y: 26, w: 20, h: 44 }, cursor: "go", action: { type: "goToScene", targetSceneId: "cq_greenroom" } },
        { id: "cqc_board", label: "Open the corkboard", bounds: { x: 4, y: 10, w: 14, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        { id: "cqc_office", text: "Return to the office.", targetSceneId: "cq_office", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    /* ------------------------- green room ------------------------- */
    {
      id: "cq_greenroom",
      title: "The Green Room",
      background: "/img/bg-dressing.jpg",
      ambientAudio: "tension",
      prose:
        "The green room was a study in broken glamour: a smashed crystal vial under the vanity, a scratched filing cabinet, and a safe behind the mirror hanging open like a dare. Somebody had been here before you — and wanted it to look like the wrong somebody.",
      dialogueBeats: [
        {
          id: "cqg_vera",
          characterId: "vera",
          expression: "steady",
          text: "That safe behind the mirror. Rex kept the one thing he never showed anyone in there. If he wrote his own ending, it's in that box.",
        },
      ],
      hotspots: [
        { id: "cqg_note", label: "Sealed note in the open safe", bounds: { x: 58, y: 20, w: 20, h: 30 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "sealed_note" } },
        { id: "cqg_ledger", label: "Scratched filing cabinet", bounds: { x: 14, y: 44, w: 22, h: 34 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "ledger" } },
        { id: "cqg_perfume", label: "Cracked perfume vial by the vanity", bounds: { x: 74, y: 52, w: 18, h: 26 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "perfume" } },
        { id: "cqg_board", label: "Open the corkboard", bounds: { x: 36, y: 8, w: 14, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        {
          id: "cqg_confront",
          text: "You've got enough — the ledger, the note, and the frame all line up. Confront them.",
          targetSceneId: "cq_confront",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["ledger_solomon", "note_solomon", "perfume_vera"], requiresAll: true },
        },
        { id: "cqg_club", text: "Step back into the main house.", targetSceneId: "cq_club", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    /* ------------------------- confrontation ------------------------- */
    {
      id: "cq_confront",
      title: "The Curtain",
      background: "/img/bg-penthouse.jpg",
      ambientAudio: "tension",
      prose:
        "The house lights dimmed for the matinee. Vera stood beneath the curtain, Solomon beside the exit, and Desh by the stage door. One minute before the audience arrived, and one accusation before somebody walked.",
      dialogueBeats: [
        {
          id: "cqconf_solomon",
          characterId: "solomon",
          expression: "cold",
          text: "You found a ledger and a note. That's clutter, detective. It isn't a case.",
        },
        {
          id: "cqconf_vera",
          characterId: "vera",
          expression: "steady",
          text: "Put the pieces together. Then say the name where everyone can hear it.",
        },
      ],
      hotspots: [
        { id: "cqconf_board", label: "Open the corkboard and connect the evidence", bounds: { x: 42, y: 16, w: 18, h: 20 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        {
          id: "cqconf_gold",
          text: "Accuse Solomon Reyes — the ledger, the note, and the planted perfume all point at him.",
          targetSceneId: "cq_end_gold",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["ledger_solomon", "note_solomon", "perfume_vera"], requiresAll: true },
        },
        {
          id: "cqconf_silver",
          text: "Confront Solomon with the ledger and the note — enough to ruin him, not enough to hang him.",
          targetSceneId: "cq_end_silver",
          attitudeTag: "Aggressive",
          gating: { requiresFlags: ["ledger_solomon", "note_solomon"], requiresAll: true },
        },
        {
          id: "cqconf_blame_vera",
          text: "Accuse Vera Voss. She had the motive, the access, and the tears.",
          targetSceneId: "cq_end_bust",
          attitudeTag: "Neutral",
        },
        {
          id: "cqconf_retreat",
          text: "Not yet. Return to the green room and finish the evidence.",
          targetSceneId: "cq_greenroom",
          attitudeTag: "Neutral",
        },
      ],
    },
    /* ------------------------- endings ------------------------- */
    {
      id: "cq_end_gold",
      title: "Gold Ending — Curtain Falls on the Owner",
      background: "/img/bg-end-gold.jpg",
      ambientAudio: "jazz",
      prose:
        "Solomon's sneer cracked like bad plaster. The ledger was his hand, the note his order to change the lock, and the perfume nothing but a woman's name thrown in the dirt. Vera walked out clean, the Copper Queen kept its doors, and the matinee went up exactly on time.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "COPPER QUEEN OWNER BUSTED — FRAMED STAR WALKS",
        recap: "You connected the full board, exonerated Vera, and named the man who skimmed the till and stopped Rex from checking the books.",
      },
    },
    {
      id: "cq_end_silver",
      title: "Silver Ending — The Illusion Holds",
      background: "/img/bg-end-silver.jpg",
      ambientAudio: "jazz",
      prose:
        "The ledger and the note were enough to break Solomon's grip on the theatre, but the city's lawyers turned it into a lawsuit instead of a confession. He was out by morning. Vera kept her part, and the Queen stayed open — but the murder would always read as another backstage rumor.",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "OWNER OUSTED, MURDER LEFT OPEN",
        recap: "Partial proof saved Vera and survived the night, but the case closed with an asterisk.",
      },
    },
    {
      id: "cq_end_bust",
      title: "Game Over — Curtain Call",
      background: "/img/bg-alley.jpg",
      ambientAudio: "rain",
      prose:
        "Either the wrong suspect took the fall, or the heat got too high and the city closed the case without you. The Copper Queen went dark, Vera's name was in the papers by the midnight edition, and the real killer slipped down the stage door into the rain.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "WRONG HAND NAMED — QUEEN GOES DARK",
        recap: "You accused without the full board, or the city stopped tolerating your heat. The case ended in the wrong headline.",
      },
    },
  ],
};
