import type { Story } from "../types";

/**
 * MIDNIGHT CONFESSION
 * A multi-path, fully voiced dockside homicide case featuring the Shootout mini-game
 * and branching narrative arcs depending on whether the suspect is caught or escapes.
 */
export const CONFESSION: Story = {
  id: "confession",
  title: "Midnight Confession",
  tagline: "Rain on tin, a dead singer, and a gold lighter that holds a cold truth.",
  coverImage: "/img/bg-warehouse.jpg",
  startSceneId: "S1",
  layout: {
    S1: { x: 0, y: 220 },
    S2: { x: 340, y: 60 },
    S3: { x: 340, y: 380 },
    S4: { x: 340, y: 600 },
    S5: { x: 680, y: 60 },
    S6: { x: 680, y: 380 },
    S7: { x: 1020, y: 380 },
    S8: { x: 1020, y: 600 },
    S9: { x: 1360, y: 380 },
    S10: { x: 1360, y: 600 },
    S11: { x: 1700, y: 380 },
    S12: { x: 1700, y: 600 },
    S13: { x: 1360, y: 820 },
    S14: { x: 2040, y: 60 },
    S15: { x: 2040, y: 260 },
    S15_lose: { x: 2380, y: 260 },
    S16: { x: 1020, y: 820 },
    S17: { x: 2040, y: 460 },
    S18: { x: 2040, y: 660 },
    S19: { x: 2380, y: 60 },
    S20: { x: 2380, y: 660 },
    S20_win: { x: 2720, y: 660 },
    S21: { x: 2380, y: 860 },
  },
  briefing: {
    objective: "Expose shipping magnate Victor Kessler for the murder of lounge singer Elena Voss before his enforcer clears the evidence.",
    winConditions: [
      "Search the warehouse body and desk to secure Elena's photo and Cole's service revolver.",
      "Crack the pawn shop ledger or intercept Elena's letters to secure hard evidence.",
      "Track Karl Doss to Pier 14, survive the shootout, and use your evidence to force a clean trial.",
    ],
    loseConditions: [
      "Accuse Kessler blindly without securing the ring or Elena's letter.",
      "Let Suspicion reach 6 — Doss's crew takes you out before you reach the pier.",
      "Get killed or outgunned in the shootout at the docks.",
    ],
    heatLimit: 6,
    heatFailSceneId: "S21",
  },
  characters: [
    { id: "sam", name: "Sam Cole", role: "Detective", avatarUrl: "emoji:🕵️", trustMeter: 0 },
    { id: "elena", name: "Elena Voss", role: "The Victim", avatarUrl: "emoji:🎤", trustMeter: 0 },
    { id: "cop", name: "Beat Cop", role: "Rookie Officer", avatarUrl: "emoji:👮", trustMeter: 0, voice: { pitch: 1.3, rate: 0.95 } },
    { id: "kessler", name: "Victor Kessler", role: "Shipping Magnate", avatarUrl: "emoji:🕴️", trustMeter: 0, voice: { pitch: 0.72, rate: 0.9 } },
    { id: "doss", name: "Karl Doss", role: "Kessler's Enforcer", avatarUrl: "emoji:👤", trustMeter: 0, voice: { pitch: 0.6, rate: 0.85 } },
    { id: "reyes", name: "Tommy Reyes", role: "Informant", avatarUrl: "emoji:🧣", trustMeter: 0, voice: { pitch: 1.15, rate: 0.95 } },
  ],
  items: [
    {
      id: "lighter",
      name: "Brass Lighter",
      icon: "🔥",
      description: "An elegant brass lighter found near Elena's hand, engraved 'E.V.' Cold, out of fluid.",
      flavorText: "Kessler gave her this. A warm gift from a cold man.",
      isClue: true,
    },
    {
      id: "photo_half",
      name: "Torn Photograph",
      icon: "🖼️",
      description: "Torn photograph showing half of Elena's face, cozy with someone whose face is torn away.",
      flavorText: "Half a picture, half an alibi.",
      isClue: true,
    },
    {
      id: "matchbook",
      name: "Lotus Matchbook",
      icon: "🎟️",
      description: "A matchbook from the Blue Lotus nightclub found tucked under the overturned chair.",
      flavorText: "Where the music plays late and the drinks are watered down.",
    },
    {
      id: "pawn_ticket",
      name: "Pawn Ticket",
      icon: "🎫",
      description: "A pawn ticket found near the entrance, logged the night of the murder.",
      flavorText: "Ticket #109. Kling's Pawn.",
    },
    {
      id: "flask",
      name: "Hip Flask",
      icon: "🍶",
      description: "A monogrammed hip flask found abandoned in the alley. Monogram: 'T.R.'",
      flavorText: "For Tommy Reyes. Warm rye, smelled like fear.",
    },
    {
      id: "letter",
      name: "Sealed Letter",
      icon: "✉️",
      description: "Elena's sealed confession, misfiled behind the folder at the precinct.",
      flavorText: "Her last confession. Unread, until now.",
      isClue: true,
    },
    {
      id: "ring",
      name: "VK Engraved Ring",
      icon: "💍",
      description: "Elena's ring, recovered from Kling's Pawn. Engraved: 'V.K. & E.V.'",
      flavorText: "V.K. for Victor Kessler. Proof of the secret.",
      isClue: true,
    },
    {
      id: "revolver",
      name: "Service Revolver",
      icon: "🔫",
      description: "Cole's standard .38 service revolver, fully loaded and cold to the touch.",
      flavorText: "The badge gives you authority; this gives you the final word.",
    },
  ],
  scenes: [
    {
      id: "S1",
      title: "The Tin Roof Warehouse",
      background: "/img/bg-warehouse.jpg",
      ambientAudio: "rain",
      prose:
        "Rain hammers the tin roof of a dockside warehouse. Detective Sam Cole stands over the body of Elena Voss, a lounge singer, found dead beside an overturned chair. A brass lighter engraved 'E.V.' lies near her hand, cold, out of fluid. Cole's service revolver rests in his trench pocket, a heavy weight.",
      hotspots: [
        {
          id: "hs_lighter",
          label: "Engraved Brass Lighter",
          bounds: { x: 38, y: 72, w: 12, h: 12 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "lighter" },
        },
        {
          id: "hs_revolver",
          label: "Your Service Revolver",
          bounds: { x: 8, y: 80, w: 14, h: 14 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "revolver" },
        },
      ],
      choices: [
        { id: "S1_S2", text: "Search Elena's body first.", targetSceneId: "S2", attitudeTag: "Neutral", exclusiveGroup: "warehouse-search" },
        { id: "S1_S3", text: "Search the warehouse floor first.", targetSceneId: "S3", attitudeTag: "Neutral", exclusiveGroup: "warehouse-search" },
        { id: "S1_S4", text: "Question the beat cop who found her.", targetSceneId: "S4", attitudeTag: "Neutral", exclusiveGroup: "warehouse-search" },
      ],
    },
    {
      id: "S2",
      title: "The Body of Elena",
      background: "/img/bg-warehouse.jpg",
      ambientAudio: "rain",
      prose:
        "Elena's silk coat is damp from the leaking roof. Tucked deep in her left pocket is a torn photograph — half a face, the other half torn away entirely. No other ID on her.",
      hotspots: [
        {
          id: "hs_photo",
          label: "Torn Photograph Half",
          bounds: { x: 42, y: 52, w: 14, h: 14 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "photo_half" },
        },
      ],
      choices: [
        { id: "S2_S5", text: "Check her hands for defensive wounds.", targetSceneId: "S5", attitudeTag: "Clever" },
        { id: "S2_S3", text: "Move on to search the room.", targetSceneId: "S3", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "S3",
      title: "The Overturned Chair",
      background: "/img/bg-warehouse.jpg",
      ambientAudio: "rain",
      prose:
        "Overturned furniture marks where the struggle went down. A matchbook from a nightclub called The Blue Lotus sits under the chair. On the brick wall behind it, a smear of blood that doesn't match the pool by the body.",
      hotspots: [
        {
          id: "hs_matchbook",
          label: "Lotus Matchbook",
          bounds: { x: 38, y: 78, w: 12, h: 12 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "matchbook" },
        },
      ],
      choices: [
        { id: "S3_S6", text: "Follow the second blood trail outside.", targetSceneId: "S6", attitudeTag: "Clever" },
        { id: "S3_S2", text: "Go back and search the body.", targetSceneId: "S2", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "S4",
      title: "The Rookie Cop",
      background: "/img/bg-warehouse.jpg",
      ambientAudio: "rain",
      prose:
        "The rookie cop is jumpy, shifting his boots in the sawdust. He swears he saw a man in a gray coat running from the docks twenty minutes before he found her. He hands over a pawn shop ticket he found near the entrance.",
      dialogueBeats: [
        { id: "cop_talk1", characterId: "cop", text: "I... I didn't touch anything, detective. But whoever was here left in a real hurry. This ticket was lying right in the sawdust.", expression: "nervous" },
      ],
      hotspots: [
        {
          id: "hs_ticket",
          label: "Pawn Shop Ticket",
          bounds: { x: 42, y: 60, w: 14, h: 14 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "pawn_ticket" },
        },
      ],
      choices: [
        { id: "S4_S6", text: "Chase the description of the man in gray outside.", targetSceneId: "S6", attitudeTag: "Aggressive" },
        { id: "S4_S3", text: "Search the warehouse floor yourself first.", targetSceneId: "S3", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "S5",
      title: "Signs of a Struggle",
      background: "/img/bg-warehouse.jpg",
      ambientAudio: "rain",
      prose:
        "Elena Voss fought back hard. There's skin and dark fibers under her fingernails. This wasn't a fall — it's homicide, officially. Cole radios it in to the precinct.",
      choices: [
        { id: "S5_S6", text: "Follow the trail outside into the alley.", targetSceneId: "S6", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "S6",
      title: "The Rain-Slicked Alley",
      background: "/img/bg-alley.jpg",
      ambientAudio: "rain",
      prose:
        "The second blood trail leads outside to an alley, stopping abruptly at a drainpipe. A hip flask sits abandoned nearby, monogrammed 'T.R.' — smelling of cheap rye and panic.",
      hotspots: [
        {
          id: "hs_flask",
          label: "Monogrammed Hip Flask",
          bounds: { x: 44, y: 74, w: 12, h: 12 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "flask" },
        },
      ],
      choices: [
        { id: "S6_S7", text: "Head to The Blue Lotus following the matchbook.", targetSceneId: "S7", attitudeTag: "Clever", gating: { requiresItems: ["matchbook"] } },
        { id: "S6_S16", text: "Head to Kling's Pawn Shop following the ticket.", targetSceneId: "S16", attitudeTag: "Clever", gating: { requiresItems: ["pawn_ticket"] } },
        { id: "S6_S8", text: "Go straight to the precinct and pull Elena's file.", targetSceneId: "S8", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "S7",
      title: "The Blue Lotus Club",
      background: "/img/bg-club.jpg",
      ambientAudio: "jazz",
      prose:
        "The Blue Lotus is smoky, half-empty this late. The bartender clams up until Cole flashes the matchbook. He admits Elena sang here Tuesdays, and had been seeing a scared kid named Tommy Reyes who left town two nights ago.",
      choices: [
        { id: "S7_S9", text: "Ask about the enforcer in the gray coat.", targetSceneId: "S9", attitudeTag: "Aggressive" },
        { id: "S7_S10", text: "Ask where Tommy Reyes might be hiding.", targetSceneId: "S10", attitudeTag: "Sultry" },
      ],
    },
    {
      id: "S8",
      title: "The Precinct Archives",
      background: "/img/bg-office.jpg",
      ambientAudio: "drone",
      prose:
        "At the precinct, Elena's file is thin — too thin. Someone's pulled pages. But a sealed letter, misfiled behind the folder, is addressed to her in her own handwriting.",
      hotspots: [
        {
          id: "hs_letter",
          label: "Sealed Letter",
          bounds: { x: 42, y: 58, w: 14, h: 14 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "letter" },
        },
      ],
      choices: [
        { id: "S8_S13", text: "Open the letter now.", targetSceneId: "S13", attitudeTag: "Clever", gating: { requiresItems: ["letter"] } },
        { id: "S8_S7", text: "Save the letter and head to the club.", targetSceneId: "S7", attitudeTag: "Neutral", gating: { requiresItems: ["matchbook"] } },
        { id: "S8_S16", text: "Go to the pawn shop with the ticket.", targetSceneId: "S16", attitudeTag: "Neutral", gating: { requiresItems: ["pawn_ticket"] } },
      ],
    },
    {
      id: "S9",
      title: "The Enforcer's Lead",
      background: "/img/bg-club.jpg",
      ambientAudio: "jazz",
      prose:
        "The bartender pales. The description matches Karl Doss, enforcer for shipping magnate Victor Kessler. Cole mentions the brass lighter — the bartender admits Kessler gave Elena that lighter himself months back.",
      choices: [
        { id: "S9_S11", text: "Go confront Kessler directly at his penthouse.", targetSceneId: "S11", attitudeTag: "Aggressive" },
        { id: "S9_S10", text: "Find Tommy Reyes first to get his side.", targetSceneId: "S10", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "S10",
      title: "Tommy's Motel Hideout",
      background: "/img/bg-alley.jpg",
      ambientAudio: "rain",
      prose:
        "Tommy Reyes is holed up in a cheap motel, terrified. Cole offers the hip flask as a peace gesture — Reyes relaxes and talks freely. Otherwise he stays guarded, giving only half the story.",
      choices: [
        { id: "S10_S11", text: "Confront Kessler with Tommy's leverage. (Gives +1 Sultry)", targetSceneId: "S11", attitudeTag: "Sultry", gating: { requiresItems: ["flask"] }, consequences: { meterChanges: [{ meter: "Sultry", delta: 1 }] } },
        { id: "S10_S12", text: "Get Reyes into protective custody first.", targetSceneId: "S12", attitudeTag: "Clever" },
      ],
    },
    {
      id: "S11",
      title: "Kessler's Penthouse Office",
      background: "/img/bg-penthouse.jpg",
      ambientAudio: "tension",
      prose:
        "Victor Kessler is calm, wealthy, untouchable-looking, in an office overlooking the docks he owns. Cole produces the torn photograph — Kessler's composure cracks. The photo is of Kessler and Elena; the torn half would show Doss.",
      choices: [
        { id: "S11_S14", text: "Push hard, accuse him outright of the murder.", targetSceneId: "S14", attitudeTag: "Aggressive" },
        { id: "S11_S15", text: "Play it patient, let him talk himself into a mistake.", targetSceneId: "S15", attitudeTag: "Clever" },
        { id: "S11_S17", text: "Draw the revolver and demand the truth.", targetSceneId: "S17", attitudeTag: "Aggressive", gating: { requiresItems: ["revolver"] } },
      ],
    },
    {
      id: "S12",
      title: "The Delayed Lead",
      background: "/img/bg-office.jpg",
      ambientAudio: "drone",
      prose:
        "Cole gets Reyes somewhere safe — but the delay costs time. By the time Cole reaches Kessler's office, it's empty, papers burned in the fireplace, Kessler already gone.",
      choices: [
        { id: "S12_S18", text: "Chase his last lead — the docks, tonight.", targetSceneId: "S18", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "S13",
      title: "Elena's Last Letter",
      background: "/img/bg-office.jpg",
      ambientAudio: "drone",
      prose:
        "The letter is a confession. Elena fell for Kessler once, but Doss found out. She was scared of what Kessler would do to protect his empire.",
      choices: [
        { id: "S13_S7", text: "Head to the nightclub.", targetSceneId: "S7", attitudeTag: "Neutral", gating: { requiresItems: ["matchbook"] } },
        { id: "S13_S11", text: "Head straight to Kessler's office.", targetSceneId: "S11", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "S14",
      title: "Ending B — The Case Goes Cold",
      background: "/img/bg-office.jpg",
      ambientAudio: "rain",
      prose:
        "Kessler lawyers up instantly, saying nothing further. Without hard evidence, this accusation goes nowhere. Doss disappears. Kessler walks free, and your license is suspended.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "GUMSHOE PINCHED IN ACCUSATION FLOP — KESSLER WALKS",
        recap: "You accused him outright with no hard evidence to back it up. The case went cold.",
      },
    },
    {
      id: "S15",
      title: "The Arrogant Slip",
      background: "/img/bg-penthouse.jpg",
      ambientAudio: "tension",
      prose:
        "Kessler, unchallenged, grows arrogant and lets slip a detail only the killer would know — where Elena's body was actually found before it was moved. A confession, just not one that holds up cleanly alone.",
      choices: [
        { id: "S15_S19_letter", text: "Confront him with the Sealed Letter.", targetSceneId: "S19", attitudeTag: "Clever", gating: { requiresItems: ["letter"] } },
        { id: "S15_S19_ring", text: "Confront him with the VK Engraved Ring.", targetSceneId: "S19", attitudeTag: "Clever", gating: { requiresItems: ["ring"] } },
        { id: "S15_S15_lose", text: "Take the weak confession and walk. (Gives Ending C)", targetSceneId: "S15_lose", attitudeTag: "Neutral", gating: { excludesItems: ["letter", "ring"] } },
      ],
    },
    {
      id: "S15_lose",
      title: "Ending C — Half a Truth",
      background: "/img/bg-penthouse.jpg",
      ambientAudio: "rain",
      prose:
        "Kessler is brought in, but the DA says it isn't enough to convict — only enough to end his career and his marriage. Justice, sort of. Cole isn't satisfied, but it's what the city gives him.",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "KESSLER EMPIRE CRUMBLES — BUT MURDER CONVICTION FAILS",
        recap: "His slip of the tongue ruined his name, but without the ring or letter, he dodged the cell.",
      },
    },
    {
      id: "S16",
      title: "Kling's Pawn Shop",
      background: "/img/bg-office.jpg",
      ambientAudio: "drone",
      prose:
        "The pawnbroker recognizes Elena's photo — she pawned a ring here two weeks before she died, desperate for cash to skip town. The ring is still in the display case.",
      hotspots: [
        {
          id: "hs_ring",
          label: "VK Engraved Ring",
          bounds: { x: 44, y: 52, w: 14, h: 14 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "ring" },
        },
      ],
      choices: [
        { id: "S16_S11", text: "Take the ring and head to Kessler's office.", targetSceneId: "S11", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "S17",
      title: "Ending D — The Detective Breaks",
      background: "/img/bg-office.jpg",
      ambientAudio: "rain",
      prose:
        "Cole crosses a line, forcing Kessler at gunpoint. Kessler talks, terrified and honest — but the confession was coerced. It won't hold up, and Internal Affairs takes your badge.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "DETECTIVE SUSPENDED FOR COERCED CONFESSION — SHAMUS BREAKS",
        recap: "You got the truth at gunpoint, but lost the badge. Kessler walked on a technicality.",
      },
    },
    {
      id: "S18",
      title: "Pier 14 Showdown",
      background: "/img/bg-docks.jpg",
      ambientAudio: "tension",
      prose:
        "By the time Cole reaches the docks, there's only Doss, waiting, gun already drawn — ordered to tie up loose ends. It's a shootout under the docks.",
      hotspots: [
              ],
      choices: [
        { id: "S18_win", text: "Return fire and survive the pier.", targetSceneId: "S20", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "S19",
      title: "Ending A — Justice, Rain-Soaked",
      background: "/img/bg-office.jpg",
      ambientAudio: "rain",
      prose:
        "The true ending. Kessler goes to trial. The city's papers run the story for a week before moving on, the way cities do. Cole stands outside the courthouse in the rain, lighter still in his coat pocket, wondering if he'll ever give it back to anyone — or just keep it, the way you keep the things a case leaves behind.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "KESSLER CONVICTED IN VOSS SLAYING — JUSTICE DELIVERED",
        recap: "You secured the airtight evidence (the ring or letter) and solved the shootout cleanly. Perfect victory.",
      },
    },
    {
      id: "S20",
      title: "The Escape Route",
      background: "/img/bg-docks.jpg",
      ambientAudio: "tension",
      prose:
        "Doss got away from the pier. He waits in the fog, gun lowered slightly. If you have the hip flask, you can talk him down. Otherwise, the encounter ends in blood.",
      choices: [
        { id: "S20_E_win", text: "Offer him the Hip Flask as a peace gesture.", targetSceneId: "S20_win", attitudeTag: "Sultry", gating: { requiresItems: ["flask"] } },
        { id: "S20_E_lose", text: "No flask — Doss fires into the fog.", targetSceneId: "S21", attitudeTag: "Neutral", gating: { excludesItems: ["flask"] } },
      ],
    },
    {
      id: "S20_win",
      title: "Ending E — Two Tired Men",
      background: "/img/bg-docks.jpg",
      ambientAudio: "rain",
      prose:
        "Doss's testimony, plus whatever evidence Cole gathered earlier, convicts Kessler without another shot fired. A quieter ending — no blaze of glory, just two tired men on a dock deciding not to add to the body count.",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "ENFORCER SINGS — KESSLER CONVICTED ON INSIDE STATEMENT",
        recap: "You used the hip flask to turn Doss into a witness. Kessler is behind bars, peacefully.",
      },
    },
    {
      id: "S21",
      title: "Ending F — Blood on the Dock",
      background: "/img/bg-docks.jpg",
      ambientAudio: "rain",
      prose:
        "Doss fires first. Cole returns fire. The case closes with two names on the coroner's report instead of one, and Kessler, once again, walks free and richer for the silence.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "P.I. SLAIN IN PIER SHOWDOWN — SHAMUS CASUALTY",
        recap: "You failed the shootout and had no peace offering to turn the suspect. The dock took you both.",
      },
    },
  ],
};
