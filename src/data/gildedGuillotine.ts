import type { Story } from "../types";

/**
 * THE GILDED GUILLOTINE
 * A full-engine stress test: every mini-game (cipher, safe dial, memory match,
 * lockpick, tail suspect, shootout), item crafting, the deduction corkboard,
 * branching attitude choices with meters/trust/flags, gated dialogue beats,
 * cinematic storyboard frames with lighting, a credits node, a video cutscene,
 * heat bust, and three endings.
 */
export const GILDED_GUILLOTINE: Story = {
  id: "gilded-guillotine",
  title: "The Gilded Guillotine",
  tagline: "In this house, the house always wins. Until somebody changes the game.",
  coverImage: "/img/cover-gilded-guillotine.jpg",
  startSceneId: "gg_credits",
  layout: {
    gg_credits: { x: 0, y: 160 },
    gg_office: { x: 340, y: 160 },
    gg_casino: { x: 680, y: 160 },
    gg_cutscene: { x: 1020, y: 60 },
    gg_backroom: { x: 1020, y: 260 },
    gg_vault: { x: 1360, y: 160 },
    gg_confront: { x: 1700, y: 160 },
    gg_end_gold: { x: 2080, y: 0 },
    gg_end_silver: { x: 2080, y: 160 },
    gg_end_bust: { x: 2080, y: 320 },
  },
  briefing: {
    objective: "Prove who murdered croupier Clyde Marrow in the vault of the Gilded Guillotine.",
    winConditions: [
      "Decode the vault note, crack the safe, reconstruct the photo, and lift the dealer's marked card.",
      "Connect every clue to the right suspect on the corkboard.",
      "Corner the killer and win the final confrontation.",
    ],
    loseConditions: [
      "Accuse the wrong person without the full board.",
      "Let Suspicion reach 6 — the house calls the police on you.",
      "Lose the final shootout.",
    ],
    heatLimit: 6,
    heatFailSceneId: "gg_end_bust",
  },
  characters: [
    { id: "sam", name: "Sam Vane", role: "Private Detective", avatarUrl: "/img/ch-sam-vane.jpg", trustMeter: 0, voice: { pitch: 0.72, rate: 0.9 } },
    { id: "isadora", name: "Isadora Croft", role: "The Widow", avatarUrl: "/img/ch-isadora.jpg", trustMeter: 0, voice: { pitch: 1.15, rate: 0.88 } },
    { id: "malveaux", name: "Oscar Malveaux", role: "House Owner", avatarUrl: "/img/ch-malveaux.jpg", trustMeter: 0, voice: { pitch: 0.7, rate: 0.9 } },
    { id: "felix", name: "Felix Quill", role: "Card Dealer", avatarUrl: "/img/ch-felix.jpg", trustMeter: 0, voice: { pitch: 1.0, rate: 1.0 } },
  ],
  items: [
    { id: "case_file", name: "Case File", icon: "📁", description: "The Gilded Guillotine file: floor plans, staff list, and Clyde Marrow's autopsy note.", flavorText: "Paper. Old-fashioned. You can trust its weight." },
    { id: "revolver", name: "Pocket Revolver", icon: "🔫", description: "Your backup revolver. Six shots, less patience.", flavorText: "Not subtle. Sometimes useful." },
    { id: "coded_note", name: "Vault Note", icon: "📜", description: "Decoded: MEET IN THE VAULT AT MIDNIGHT.", flavorText: "Somebody summoned the victim.", isClue: true },
    { id: "betting_ledger", name: "Betting Ledger", icon: "📒", description: "The house ledger — Clyde was about to audit it, and the numbers don't add up.", flavorText: "Money always leaves a signature.", isClue: true },
    { id: "marked_card", name: "Marked Card", icon: "🃏", description: "A doctored ace the dealer dropped when you tailed him.", flavorText: "The game was rigged from the deal.", isClue: true },
    { id: "photo_left", name: "Torn Photo (Left)", icon: "🖼️", description: "Half a photograph from the vault. A gloved hand, mid-handshake.", flavorText: "Half a truth, waiting for its other half.", isClue: true, combinableWith: { targetItemId: "photo_right", resultItemId: "photo_whole" } },
    { id: "photo_right", name: "Torn Photo (Right)", icon: "🗂️", description: "The other half, from the evidence locker. A woman's face, turning away.", flavorText: "The other half of an alibi.", isClue: true },
    { id: "photo_whole", name: "Whole Photo", icon: "📷", description: "Reconstructed: Isadora was in the lounge, not the vault, when Clyde died.", flavorText: "An alibi in two pieces, finally whole.", isClue: true },
  ],
  deduction: {
    suspectIds: ["isadora", "malveaux", "felix"],
    connections: [
      { a: "coded_note", b: "malveaux", flagSet: "note_malveaux", revelation: "The vault note is in Malveaux's hand — he summoned Clyde to the vault at midnight." },
      { a: "betting_ledger", b: "malveaux", flagSet: "ledger_malveaux", revelation: "The doctored ledger shows Malveaux was skimming the house Clyde was about to audit." },
      { a: "marked_card", b: "felix", flagSet: "card_felix", revelation: "The marked card implicates Felix in running a crooked table on Malveaux's orders." },
      { a: "photo_whole", b: "isadora", flagSet: "photo_alibi", revelation: "The whole photo puts Isadora in the lounge at midnight — she couldn't have been in the vault." },
    ],
  },
  scenes: [
    /* ------------------------------------------------------------ */
    {
      id: "gg_credits",
      title: "Opening Credits",
      nodeType: "credits",
      noTypewriter: true,
      background: "gradient:linear-gradient(160deg,#07111e 0%,#1d0c22 55%,#07070c 100%)",
      prose: "THE GILDED GUILLOTINE\n\nDirected by Sam Cole\nWritten by the City\n\nTap Begin Case",
      choices: [{ id: "gg_cr_go", text: "Begin the Case", targetSceneId: "gg_office", attitudeTag: "Neutral" }],
      hotspots: [],
      dialogueBeats: [],
    },
    /* ------------------------------------------------------------ */
    {
      id: "gg_office",
      title: "Act I — Vane's Office",
      background: "/img/bg-office.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: { mode: "pan", focalPoint: "50% 40%", zoomDuration: 14, dimAmount: 0.12 },
      prose: "Isadora Croft arrived with rain on her veil and a headline already written in her eyes. Her husband — croupier Clyde Marrow — was dead in the vault of the Gilded Guillotine, and every cop in town liked her for it. She sang two numbers. She sat for one drink. The rest, she said, was somebody else's story.",
      dialogueBeats: [
        { id: "ggo_isa", characterId: "isadora", expression: "fragile control", text: "They're going to pin it on me, detective. I was in the lounge all night. Please — I need someone who'll actually look." },
      ],
      hotspots: [
        { id: "ggo_file", label: "Clyde's case file on the desk", bounds: { x: 14, y: 46, w: 16, h: 15 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "case_file" } },
        { id: "ggo_gun", label: "Pocket revolver in the drawer", bounds: { x: 70, y: 52, w: 15, h: 16 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "revolver" } },
      ],
      choices: [
        {
          id: "ggo_sultry",
          text: "Lean across the desk. \"Take your time, Mrs. Croft. Start at the chandelier and walk me through it.\"",
          targetSceneId: "gg_casino",
          attitudeTag: "Sultry",
          exclusiveGroup: "opening",
          consequences: { setFlags: ["sultry_open"], trustChanges: [{ characterId: "isadora", delta: 2 }], meterChanges: [{ meter: "Sultry", delta: 1 }] },
        },
        {
          id: "ggo_aggro",
          text: "Slap the desk. \"Cut the act. If I find out you're lying, I'll hand you to the bulls myself.\"",
          targetSceneId: "gg_casino",
          attitudeTag: "Aggressive",
          exclusiveGroup: "opening",
          consequences: { setFlags: ["aggressive_open"], trustChanges: [{ characterId: "isadora", delta: -1 }], meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }] },
        },
        {
          id: "ggo_clever",
          text: "\"Walk me through it backwards. What did you see, hear, and touch — in that order?\"",
          targetSceneId: "gg_casino",
          attitudeTag: "Clever",
          exclusiveGroup: "opening",
          consequences: { setFlags: ["clever_open"], trustChanges: [{ characterId: "isadora", delta: 1 }], meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "gg_casino",
      title: "Act I — The Gilded Guillotine",
      background: "/img/bg-casino.jpg",
      ambientAudio: "jazz",
      particles: "smoke",
      musicUrl: "/Soundtrack.mp3",
      prose: "The Gilded Guillotine breathed smoke and money. The roulette wheel still spun, and the vault door hung open like a dare. Oscar Malveaux moved through the crowd with a smile that never reached his eyes.",
      dialogueBeats: [
        { id: "ggc_isa", characterId: "isadora", expression: "hopeful", text: "That's the vault door behind the cage. Clyde kept everything that mattered back there." },
        { id: "ggc_mal", characterId: "malveaux", expression: "menacing", text: "You're in my house asking my people questions. Watch your step, gumshoe. In here, the house always wins.", conditionRule: { requiresFlags: ["aggressive_open"] } },
        { id: "ggc_felix", characterId: "felix", expression: "nervous", text: "Isadora was at the lounge table all night. I dealt every hand. She never left the felt — I'd swear it in front of God and the precinct.", conditionRule: { requiresFlags: ["sultry_open", "clever_open"], requiresAll: false } },
        { id: "ggc_isa2", characterId: "isadora", expression: "confiding", text: "You actually believe me. The safe in the back office — Clyde always set the dial to 7-3-1. His lucky number.", conditionRule: { minTrust: { isadora: 2 } } },
      ],
      hotspots: [
        { id: "ggc_note", label: "Read the note pinned at the cage", bounds: { x: 42, y: 34, w: 20, h: 26 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "coded_note" } },
      ],
      choices: [
        { id: "ggc_cutscene", text: "Follow the vault note into the back corridor.", targetSceneId: "gg_cutscene", attitudeTag: "Clever", gating: { requiresItems: ["coded_note"] } },
        { id: "ggc_backroom", text: "Slip backstage unseen.", targetSceneId: "gg_backroom", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "gg_cutscene",
      title: "The Back Corridor",
      nodeType: "cutscene",
      background: "video:/b_talking_woman.mp4",
      ambientAudio: "tension",
      prose: "The back corridor was all service lamps and old secrets. Somewhere ahead, a door clicked shut, and the sound of the house faded to a low, patient hum.",
      choices: [{ id: "ggcs_next", text: "Continue", targetSceneId: "gg_backroom", attitudeTag: "Neutral" }],
      hotspots: [],
      dialogueBeats: [],
    },
    /* ------------------------------------------------------------ */
    {
      id: "gg_backroom",
      title: "Act II — The Back Office",
      background: "/img/bg-backroom-casino.jpg",
      ambientAudio: "drone",
      particles: "smoke",
      prose: "Backstage, the glamour peeled away to brick and wire. A filing cabinet sat against the wall, its lock scratched from somebody else's earlier visit. A torn photograph lay scattered across the desk.",
      dialogueBeats: [
        { id: "ggb_felix", characterId: "felix", expression: "nervous", text: "Keep your voice down. Malveaux sleeps with a pistol under the register, and he counts his money with the lights off." },
      ],
      hotspots: [
        { id: "ggb_ledger", label: "Open the scratched filing cabinet", bounds: { x: 56, y: 38, w: 24, h: 32 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "betting_ledger" } },
      ],
      choices: [
        { id: "ggb_vault", text: "You've got enough — head for the vault.", targetSceneId: "gg_vault", attitudeTag: "Clever", gating: { requiresItems: ["photo_whole", "betting_ledger", "coded_note"], requiresAll: true } },
        { id: "ggb_casino", text: "Return to the hall.", targetSceneId: "gg_casino", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "gg_vault",
      title: "Act III — The Vault",
      background: "/img/bg-vault.jpg",
      ambientAudio: "tension",
      onEnterActions: [{ consequences: { setFlags: ["reached_vault"] } }],
      prose: "The vault was colder than the rest of the house. Clyde Marrow's chalk outline still marked the floor. The safe stood open, its dial silent, and the air smelled of brass and old money.",
      dialogueBeats: [
        { id: "ggv_mal", characterId: "malveaux", expression: "cold", text: "Go ahead, detective. Say my name. But if you don't have the whole story, you're just another body in the cold." },
      ],
      hotspots: [
        { id: "ggv_board", label: "Open the corkboard", bounds: { x: 4, y: 10, w: 14, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        {
          id: "ggv_accuse_gold",
          text: "Accuse Malveaux — the note, the ledger, the card, and the photo all line up.",
          targetSceneId: "gg_confront",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["note_malveaux", "ledger_malveaux", "card_felix", "photo_alibi"], requiresAll: true },
        },
        {
          id: "ggv_accuse_silver",
          text: "Confront Malveaux with partial proof — the note and the ledger are enough.",
          targetSceneId: "gg_end_silver",
          attitudeTag: "Aggressive",
          gating: { requiresItems: ["coded_note", "betting_ledger"], requiresAll: true },
        },
        { id: "ggv_blame_isa", text: "Blame Isadora. She had the motive, and the nerves.", targetSceneId: "gg_end_bust", attitudeTag: "Aggressive" },
        { id: "ggv_back", text: "Return to the back office.", targetSceneId: "gg_backroom", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "gg_confront",
      title: "Act III — The Confrontation",
      background: "/img/bg-casino.jpg",
      ambientAudio: "tension",
      particles: "smoke",
      prose: "Malveaux's sneer finally cracked. He kicked over the roulette wheel and ran for the back staircase. The house held its breath. You had seconds to stop him before the Guillotine swallowed him whole.",
      hotspots: [
              ],
      choices: [
        { id: "ggconf_subdue", text: "Cut him off at the back staircase.", targetSceneId: "gg_end_gold", attitudeTag: "Clever" },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "gg_end_gold",
      title: "Gold Ending — The House Loses",
      background: "/img/bg-casino.jpg",
      ambientAudio: "jazz",
      prose: "Malveaux went down before the staircase swallowed him. The note was his hand, the ledger his embezzlement, the card his crooked table, and the whole photo put Isadora clean. The house finally lost.",
      isEnding: true,
      endingData: { tier: "victory-gold", headline: "HOUSE OWNER ARRESTED — CROOKED GAME SHUT DOWN", recap: "You connected the full board, named the real killer, and gave Isadora her alibi back." },
    },
    {
      id: "gg_end_silver",
      title: "Silver Ending — Enough to Break Him",
      background: "/img/bg-office.jpg",
      ambientAudio: "rain",
      prose: "You had enough to break Malveaux's grip — the note and the ledger burned him — but not enough to close the book. He was out by morning, and the murder stayed technically open. Isadora walked, though. That was something.",
      isEnding: true,
      endingData: { tier: "victory-silver", headline: "OWNER OUSTED BUT MURDER REMAINS OPEN", recap: "Partial proof saved Isadora but left the killing unsolved." },
    },
    {
      id: "gg_end_bust",
      title: "Game Over — Wrong Hand",
      background: "/img/bg-alley.jpg",
      ambientAudio: "rain",
      prose: "You pointed the finger at the wrong hand, and the city smelled blood. The real killer slipped down the staircase, Isadora took the fall, and your name joined the long list of detectives who trusted the obvious story.",
      isEnding: true,
      endingData: { tier: "gameover", headline: "DETECTIVE FINGERS WRONG HAND — CASE COLLAPSES", recap: "You accused without the full board — or lost the final confrontation." },
    },
  ],
};
