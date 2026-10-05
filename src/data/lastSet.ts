import type { Story } from "../types";

/**
 * THE LAST SET
 * A jazz-club noir authored to the Studio workflow and documented contract:
 *   Case File (objective + win/lose + heat bust) -> People (3 suspects, one
 *   gated on trust) -> Items (one clue crafted from two fragments, plus a
 *   motive ledger and a planted ring) -> Scenes (reply choices that gate a
 *   dialogue beat, in-place evidence hotspots, a corkboard finale) -> Test.
 *
 * Trumpeter Wes "Windy" Marlowe was found dead in the Blue Orchid's dressing
 * room the same night the till was emptied. Rosa, his lead singer, wants the
 * truth before the city hangs the case on her. The real killer is Moe, the
 * owner, skimming the books — but you can only prove it once you've cleared
 * Rosa's name with her stage alibi.
 */
export const LAST_SET: Story = {
  id: "the-last-set",
  title: "The Last Set",
  tagline: "The trumpet went quiet. The till went empty. Nobody left the Orchid.",
  coverImage: "gradient:linear-gradient(160deg,#120a08 0%,#3a1610 55%,#0a080c 100%)",
  startSceneId: "ls_office",
  layout: {
    ls_office: { x: 0, y: 200 },
    ls_club: { x: 420, y: 200 },
    ls_dressing: { x: 840, y: 200 },
    ls_confront: { x: 1260, y: 200 },
    ls_qte: { x: 1680, y: 200 },
    ls_end_gold: { x: 2080, y: 0 },
    ls_end_silver: { x: 2080, y: 200 },
    ls_end_bust: { x: 2080, y: 400 },
    ls_qte_missed: { x: 1680, y: 480 },
  },
  briefing: {
    objective: "Prove who killed Windy Marlowe at the Blue Orchid — and clear Rosa's name before the city closes the case on her.",
    winConditions: [
      "Recover both halves of the stage photo and combine them to prove Rosa's alibi.",
      "Find the doctored ledger and the engraved ring at the scene.",
      "Wire every clue to its person on the corkboard, then name the real killer.",
    ],
    loseConditions: [
      "Accuse Rosa without clearing her name.",
      "Let Suspicion hit the limit — the precinct files it and moves on.",
      "Push Rosa so far she stops talking.",
    ],
    heatLimit: 6,
    heatFailSceneId: "ls_end_bust",
  },
  characters: [
    {
      id: "rosa",
      name: "Rosa Reyes",
      role: "Lead Singer, The Blue Orchid",
      avatarUrl: "/img/ch-rosa.jpg",
      trustMeter: 0,
      voice: { pitch: 1.15, rate: 0.9 },
    },
    {
      id: "moe",
      name: "Moe Kessler",
      role: "Owner, The Blue Orchid",
      avatarUrl: "/img/ch-moe.jpg",
      trustMeter: 0,
      voice: { pitch: 0.72, rate: 0.92 },
    },
    {
      id: "felix",
      name: "Felix Deluca",
      role: "Band Manager",
      avatarUrl: "/img/ch-felix.jpg",
      trustMeter: 0,
      voice: { pitch: 1.0, rate: 1.0 },
    },
  ],
  items: [
    {
      id: "torn_a",
      name: "Torn Photo (right half)",
      icon: "🖼️",
      description: "Half a stage photograph, still warm from a flashbulb. Rosa's face and the marquee clock are on this side.",
      flavorText: "Half a picture, half a time-stamp.",
      isClue: false,
      combinableWith: { targetItemId: "torn_b", resultItemId: "full_photo" },
    },
    {
      id: "torn_b",
      name: "Torn Photo (left half)",
      icon: "🌆",
      description: "The other half, shoved under the dressing-room vanity. Rose's spotlight and the bandstand are on this piece.",
      flavorText: "Somebody wanted this second half lost.",
      isClue: false,
      combinableWith: { targetItemId: "torn_a", resultItemId: "full_photo" },
    },
    {
      id: "full_photo",
      name: "Reconstructed Stage Photo",
      icon: "📸",
      description: "Both halves reunited: Rosa is on stage at 11:44, the marquee clock says 11:44, and the till is still behind her. She could not have emptied it.",
      flavorText: "An alibi in two pieces, finally whole.",
      isClue: true,
    },
    {
      id: "ledger",
      name: "Doctored Ledger",
      icon: "📒",
      description: "The house ledger. The bottom line has been rewritten in a lighter ink — Windy was about to audit it, and the numbers no longer add up.",
      flavorText: "Money always leaves a signature. This one's been signed twice.",
      isClue: true,
    },
    {
      id: "ring",
      name: "Engraved Ring",
      icon: "💍",
      description: "A heavy signet ring tangled in the till's lock. The initials 'M.K.' are cut deep into the gold.",
      flavorText: "A man's monogram, paid for with somebody's life.",
      isClue: true,
    },
  ],
  deduction: {
    suspectIds: ["rosa", "moe", "felix"],
    connections: [
      { a: "ledger", b: "moe", flagSet: "moe_skim", revelation: "The doctored ledger is Moe's — he was skimming the till Windy was about to audit." },
      { a: "full_photo", b: "rosa", flagSet: "rosa_alibi", revelation: "The reconstructed photo puts Rosa on stage at 11:44 — she could not have emptied the till." },
      { a: "ring", b: "felix", flagSet: "felix_ring", revelation: "The engraved ring is Felix's — he was at the till during the last set, and he saw who opened it." },
    ],
  },
  scenes: [
    /* ------------------------- the office (start) ------------------------- */
    {
      id: "ls_office",
      title: "The Office",
      background: "/img/bg-office.jpg",
      ambientAudio: "rain",
      particles: "rain",
      prose:
        "Rosa Reyes arrived with rain on her stole and a headline already written in her eyes. Windy Marlowe — trumpet player and the best thing the Blue Orchid ever had — was dead in the dressing room, and the city had already decided it was her. 'They'll want a story,' she said. 'I'd like you to find the truth before the ink runs.'",
      dialogueBeats: [
        {
          id: "lso_rosa",
          characterId: "rosa",
          expression: "fragile",
          text: "Windy was the only one who took my side. Whoever killed him knew the Orchid the way a player knows his own horn.",
        },
        {
          id: "lso_confide",
          characterId: "rosa",
          expression: "confiding",
          text: "Moe's been sweating since Windy started counting the till. And Felix was by the register at the last set — I saw his ring catch the light.",
          conditionRule: { minTrust: { rosa: 1 } },
        },
        {
          id: "lso_cold",
          characterId: "rosa",
          expression: "guarded",
          text: "The police already have their story. If you're just going to repeat it back to me, I can save us both the rain.",
          conditionRule: { requiresFlags: ["harsh_start"] },
        },
        {
          id: "lso_recall",
          characterId: "rosa",
          expression: "watching you",
          text: "Most of them don't even look at me, detective. You did.",
          conditionRule: { requiresFlags: ["sultry_open", "harsh_start", "clever_open"], requiresAll: false },
          recalls: {
            opening_sultry: "You asked me to start at the last song we played together. You meant it. The bulls never do.",
            opening_clever: "You wanted it backwards — who heard Windy last, who was listening at the till. Nobody's asked me that before.",
            opening_aggro: "You barked at me, detective. I remember exactly what you said: \"{said}\". That takes nerve. Or no heart at all.",
          },
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "lso_sultry",
          text: "\"Take your time, Miss Reyes. Start with the last song the two of you played.\"",
          reply: true,
          targetSceneId: "",
          exclusiveGroup: "opening",
          attitudeTag: "Sultry",
          memoryLog: "opening_sultry",
          consequences: { setFlags: ["sultry_open"], trustChanges: [{ characterId: "rosa", delta: 2 }], meterChanges: [{ meter: "Sultry", delta: 1 }] },
        },
        {
          id: "lso_aggro",
          text: "\"Cut the tears. If you're lying to me about the last set, you'll be the headline.\"",
          reply: true,
          targetSceneId: "",
          exclusiveGroup: "opening",
          attitudeTag: "Aggressive",
          memoryLog: "opening_aggro",
          consequences: { setFlags: ["harsh_start"], trustChanges: [{ characterId: "rosa", delta: -1 }], meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }] },
        },
        {
          id: "lso_clever",
          text: "\"Walk me through it backwards. Who heard Windy last, and who was listening at the till?\"",
          reply: true,
          targetSceneId: "",
          exclusiveGroup: "opening",
          attitudeTag: "Clever",
          memoryLog: "opening_clever",
          consequences: { setFlags: ["clever_open"], trustChanges: [{ characterId: "rosa", delta: 1 }], meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
        {
          id: "lso_soften",
          text: "\"Forget how I came on. Start again — gentler.\"",
          reply: true,
          targetSceneId: "",
          hidden: true,
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["harsh_start"] },
          consequences: { clearFlags: ["harsh_start"], setFlags: ["sultry_open"], trustChanges: [{ characterId: "rosa", delta: 2 }] },
        },
        { id: "lso_go", text: "Head to the Blue Orchid.", targetSceneId: "ls_club", attitudeTag: "Neutral" },
      ],
    },
    /* ------------------------- the Blue Orchid ------------------------- */
    {
      id: "ls_club",
      title: "The Blue Orchid",
      background: "/img/bg-jazz-club.jpg",
      ambientAudio: "jazz",
      particles: "smoke",
      prose:
        "The Blue Orchid smelled of old smoke, spilled gin, and the kind of regret you only buy after midnight. The stage lights were still warm, and the dressing-room door hung open like a dare. Moe Kessler watched you from the bar with a smile that never reached his eyes.",
      dialogueBeats: [
        {
          id: "lsc_moe",
          characterId: "moe",
          expression: "menacing",
          text: "This is my club, gumshoe. I keep the lights on and the doors shut. Whatever happened in the dressing room, you're not going to make it cheaper for the press.",
        },
        {
          id: "lsc_felix",
          characterId: "felix",
          expression: "nervous",
          text: "I found him, alright? The door was latched from the inside and Windy was on the floor by the mirror. I didn't touch nothing — I know how that looks.",
          conditionRule: { requiresFlags: ["sultry_open", "clever_open"], requiresAll: false },
        },
      ],
      hotspots: [
        { id: "lsc_torna", label: "Torn photo half on the bandstand", bounds: { x: 34, y: 44, w: 18, h: 26 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "torn_a" } },
        { id: "lsc_board", label: "Open the corkboard", bounds: { x: 4, y: 10, w: 14, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        { id: "lsc_dress", text: "Step into the dressing room.", targetSceneId: "ls_dressing", attitudeTag: "Neutral" },
      ],
    },
    /* ------------------------- the dressing room ------------------------- */
    {
      id: "ls_dressing",
      title: "The Dressing Room",
      background: "/img/bg-dressing.jpg",
      ambientAudio: "tension",
      prose:
        "The dressing room was a study in broken glamour: scattered sheet music, a smashed mirror, and the house ledger lying open on the vanity. The other half of the stage photo was shoved beneath it, and something heavy and gold glinted in the till's lock.",
      dialogueBeats: [
        {
          id: "lsd_rosa",
          characterId: "rosa",
          expression: "steady",
          text: "That ledger. Windy said the house was bleeding money, and he'd gone quiet before he died. If you can read it, you can read who was draining the Orchid.",
        },
      ],
      hotspots: [
        { id: "lsd_tornb", label: "Torn photo half under the vanity", bounds: { x: 14, y: 52, w: 18, h: 26 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "torn_b" } },
        { id: "lsd_ledger", label: "The house ledger on the vanity", bounds: { x: 40, y: 34, w: 20, h: 26 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "ledger" } },
        { id: "lsd_ring", label: "Engraved ring in the till lock", bounds: { x: 70, y: 56, w: 18, h: 24 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "ring" } },
        { id: "lsd_board", label: "Open the corkboard", bounds: { x: 40, y: 8, w: 14, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        {
          id: "lsd_confront",
          text: "You've got the ledger and the ring — corner Moe.",
          targetSceneId: "ls_confront",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["moe_skim", "felix_ring"], requiresAll: true },
        },
        { id: "lsd_blame_rosa", text: "Accuse Rosa. She had the motive, the access, and the tears.", targetSceneId: "ls_end_bust", attitudeTag: "Neutral" },
        { id: "lsd_back", text: "Return to the main floor.", targetSceneId: "ls_club", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    /* ------------------------- the confrontation ------------------------- */
    {
      id: "ls_confront",
      title: "The Last Set",
      background: "/img/bg-penthouse.jpg",
      ambientAudio: "tension",
      prose:
        "The house lights dimmed for the last set. Moe stood by the exit, Felix by the register, and Rosa beneath the marquee. One minute before the room closed, and one accusation before somebody walked.",
      dialogueBeats: [
        {
          id: "lscf_moe",
          characterId: "moe",
          expression: "cold",
          text: "You found a ledger and a ring. That's clutter, gumshoe. It isn't a case.",
        },
        {
          id: "lscf_rosa",
          characterId: "rosa",
          expression: "steady",
          text: "Put the pieces together, detective. Then say the name where everyone can hear it.",
        },
      ],
      hotspots: [
        { id: "lscf_board", label: "Open the corkboard and connect the evidence", bounds: { x: 42, y: 16, w: 18, h: 20 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        {
          id: "lscf_gold",
          text: "Accuse Moe Kessler — the ledger proves motive, the ring ties him to the till, and Rosa's photo clears her.",
          targetSceneId: "ls_end_gold",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["moe_skim", "rosa_alibi", "felix_ring"], requiresAll: true },
        },
        {
          id: "lscf_silver",
          text: "Push Moe out with the ledger and the ring, but leave Rosa's name half-soiled.",
          targetSceneId: "ls_end_silver",
          attitudeTag: "Aggressive",
          gating: { requiresFlags: ["moe_skim", "felix_ring"], requiresAll: true },
        },
        {
          id: "lscf_blame_rosa",
          text: "Blame Rosa anyway. The city will thank you for a tidy name.",
          targetSceneId: "ls_end_bust",
          attitudeTag: "Neutral",
        },
        {
          id: "lscf_retreat",
          text: "Not yet. Return to the dressing room and finish the evidence.",
          targetSceneId: "ls_dressing",
          attitudeTag: "Neutral",
          isRepeatable: true,
        },
        {
          id: "lscf_qte",
          text: "He's making a run for it — move NOW.",
          targetSceneId: "ls_qte",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["moe_skim", "felix_ring"], requiresAll: true },
        },
      ],
    },
    /* ------------------------- quick-time prompt ------------------------- */
    {
      id: "ls_qte",
      title: "The Split Second",
      background: "/img/bg-club.jpg",
      ambientAudio: "tension",
      prose:
        "Moe lunges for the back exit with the ledger under his arm. One second — maybe two — and he's gone into the crowd. You've got to decide, right now.",
      choices: [
        {
          id: "lsqte_stop",
          text: "Stop Moe before he reaches the doors.",
          quickTime: true,
          qtePrompt: "STOP HIM!",
          timeLimitSeconds: 6,
          qteHeartbeat: true,
          qteShakyCam: true,
          targetSceneId: "ls_end_gold",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["moe_skim", "felix_ring"], requiresAll: true },
          timedOutTargetSceneId: "ls_qte_missed",
          timedOutConsequences: { setFlags: ["hesitated"], meterChanges: [{ meter: "Suspicion", delta: 2 }] },
        },
        {
          id: "lsqte_let",
          text: "Let him run — you'll catch him outside the city.",
          targetSceneId: "ls_end_silver",
          attitudeTag: "Neutral",
          isRepeatable: false,
        },
        { id: "lsqte_retreat", text: "Not yet. Back to the dressing room.", targetSceneId: "ls_dressing", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    /* -------- miss-but-survive consequence (you hesitated) -------- */
    {
      id: "ls_qte_missed",
      title: "You Hesitated",
      background: "/img/bg-alley.jpg",
      ambientAudio: "rain",
      prose:
        "You froze. Half a heartbeat too long, and Moe was through the doors and into the crowd. The ledger went with him, but Rosa's name is clean — the city just doesn't have its headline yet. There's still time to fix this... if you're faster next time.",
      dialogueBeats: [
        {
          id: "lsqte_missed_beat",
          characterId: "rosa",
          expression: "disappointed but steady",
          text: "You hesitated, detective. I saw it. The gold is gone, but I'm still here — don't waste the second chance.",
          conditionRule: { requiresFlags: ["hesitated"] },
        },
      ],
      choices: [
        { id: "lsqte_missed_back", text: "Go back to the confrontation and try again.", targetSceneId: "ls_confront", attitudeTag: "Neutral", isRepeatable: true },
        { id: "lsqte_missed_exit", text: "Hand it to the precinct and walk.", targetSceneId: "ls_end_silver", attitudeTag: "Neutral" },
      ],
    },
    /* ------------------------- endings ------------------------- */
    {
      id: "ls_end_gold",
      title: "Gold Ending — The House Loses",
      background: "/img/bg-end-gold.jpg",
      ambientAudio: "jazz",
      prose:
        "Moe's sneer cracked like bad plaster. The ledger was his hand, the ring his monogram, and Rosa's reconstructed photo put her on stage when the till was emptied. The Orchid closed its doors clean, Rosa kept her name, and the last set ended with the right man in a cell.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "ORCHID OWNER BUSTED — SINGER'S NAME CLEARED",
        recap: "You rebuilt Rosa's alibi, tied Moe to the till and the books, and named the real killer with the full board behind you.",
      },
    },
    {
      id: "ls_end_silver",
      title: "Silver Ending — Half a Note",
      background: "/img/bg-end-silver.jpg",
      ambientAudio: "jazz",
      prose:
        "The ledger and the ring were enough to break Moe's grip on the Orchid, but without Rosa's alibi the city still half-believed the headlines about the singer. Moe was out by morning, Rosa's name stayed muddy, and the murder read as another backstage rumor.",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "OWNER OUSTED, SINGER STILL SUSPECTED",
        recap: "Partial proof saved the club but left Rosa's name half-soiled — you never proved her stage alibi.",
      },
    },
    {
      id: "ls_end_bust",
      title: "Game Over — Wrong Note",
      background: "/img/bg-alley.jpg",
      ambientAudio: "rain",
      prose:
        "Either you accused Rosa without clearing her, or the heat got too high and the precinct closed the file without you. The Blue Orchid went dark, Rosa's name was in the papers by the midnight edition, and the real killer slipped out the service door into the rain.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "CASE CLOSED ON THE WRONG SONG",
        recap: "You named the wrong hand, or the city stopped tolerating your heat. The last set ended in the wrong headline.",
      },
    },
  ],
};
