import type { Story } from "../types";

/**
 * THE ASHFORD VANISHING — a three-episode noir season.
 *
 * This is the reference case for the engine's EPISODIC structure. The whole
 * story is one scene graph, but it's packed into three episodes, each with:
 *
 *   · its own title card ("Episode Two — The Long Drop")
 *   · its own "Previously on…" recap, assembled from the flags and memories
 *     the player actually carried out of the last chapter
 *   · its own three save slots
 *   · its own endings (gold / silver / game over) that close the CHAPTER, not
 *     the season, and hand off through a "Next time on…" teaser
 *
 * The corkboard spans the whole season on purpose: the matchbook and pawn
 * ticket you pocket in Episode One are what let you wire the ledger in Episode
 * Three. Skip them and the finale's best route stays locked — carry-over with
 * teeth.
 */
export const ASHFORD_VANISHING: Story = {
  id: "ashford-vanishing",
  title: "The Ashford Vanishing",
  tagline: "Three nights. One missing girl. Every door in this city locks from the outside.",
  coverImage: "/img/bg-vera-window.jpg",
  seasonTitle: "Season One",
  startSceneId: "av_office",
  briefing: {
    objective:
      "Find out what happened to Nadia Ashford — and survive the three nights it takes to prove it.",
    winConditions: [
      "Episode One: leave the first night holding both the matchbook and the pawn ticket.",
      "Episode Two: recover the harbour ledger and wire it to the man who signed it.",
      "Episode Three: walk into the penthouse with every string on the corkboard pulled tight.",
    ],
    loseConditions: [
      "Swing first and lose the only witness who was talking.",
      "Let Reyes see you coming before you have the ledger.",
      "Accuse the wrong hand in the last five seconds of the season.",
    ],
  },
  layout: {
    av_office: { x: 0, y: 240 },
    av_apartment: { x: 360, y: 240 },
    av_bar: { x: 720, y: 240 },
    av_ep1_finale: { x: 1080, y: 240 },
    av_ep1_gold: { x: 1440, y: 60 },
    av_ep1_silver: { x: 1440, y: 240 },
    av_ep1_bad: { x: 1440, y: 420 },
    av_docks: { x: 0, y: 760 },
    av_locker: { x: 360, y: 760 },
    av_reyes: { x: 720, y: 760 },
    av_ep2_gold: { x: 1080, y: 600 },
    av_ep2_silver: { x: 1080, y: 780 },
    av_ep2_bad: { x: 1080, y: 960 },
    av_penthouse: { x: 0, y: 1280 },
    av_showdown: { x: 360, y: 1280 },
    av_ep3_gold: { x: 760, y: 1100 },
    av_ep3_silver: { x: 760, y: 1290 },
    av_ep3_bad: { x: 760, y: 1470 },
  },

  /* ---------------------------- the season ---------------------------- */
  episodes: [
    {
      id: "ep1",
      number: 1,
      title: "A Girl Named Nobody",
      kicker: "The Ashford Vanishing",
      tagline: "She was gone eleven days before anyone bothered to notice.",
      startSceneId: "av_office",
      sceneIds: ["av_office", "av_apartment", "av_bar", "av_ep1_finale", "av_ep1_gold", "av_ep1_silver", "av_ep1_bad"],
      titleCardImage: "/img/bg-office.jpg",
      posterImage: "/img/bg-vera-window.jpg",
      titleCardSeconds: 2.6,
      nextTimeLines: [
        "The harbour keeps its own books.",
        "\"You were told to stop at the first door, detective.\"",
        "Some lockers are only ever opened once.",
      ],
    },
    {
      id: "ep2",
      number: 2,
      title: "The Long Drop",
      kicker: "The Ashford Vanishing",
      tagline: "Everything the harbour takes, it writes down first.",
      startSceneId: "av_docks",
      sceneIds: ["av_docks", "av_locker", "av_reyes", "av_ep2_gold", "av_ep2_silver", "av_ep2_bad"],
      titleCardImage: "/img/bg-docks.jpg",
      posterImage: "/img/bg-pier4.jpg",
      titleCardSeconds: 2.6,
      recapFromMemories: true,
      recapLines: [
        {
          id: "r2_open",
          text: "Vera Ashford walked into the office with her sister's name and eleven days of nobody caring.",
          characterId: "vera",
          image: "/img/bg-office.jpg",
        },
        {
          id: "r2_matchbook",
          text: "A Pier Four matchbook in an apartment nobody had lived in for a week.",
          gating: { requiresItems: ["av_matchbook"] },
          image: "/img/bg-low-apartment.jpg",
        },
        {
          id: "r2_ticket",
          text: "And a pawn ticket, signed in a hand that wasn't Nadia's.",
          gating: { requiresItems: ["av_pawn_ticket"] },
          image: "/img/bg-folder-closeup.jpg",
        },
        {
          id: "r2_lena",
          text: "Lena talked. That was the part Morrow hadn't planned for.",
          gating: { requiresFlags: ["av_lena_talks"] },
          characterId: "lena",
          image: "/img/bg-neon-diner.jpg",
        },
        {
          id: "r2_money",
          text: "You took Morrow's envelope. It's still in your coat, and it still weighs something.",
          gating: { requiresFlags: ["av_took_money"] },
          characterId: "morrow",
          image: "/img/bg-alley.jpg",
        },
        {
          id: "r2_clean",
          text: "You put Morrow's money back in his hand. He smiled like a man who'd try again.",
          gating: { excludesFlags: ["av_took_money"] },
          characterId: "morrow",
          image: "/img/bg-alley.jpg",
        },
      ],
      nextTimeLines: [
        "Forty floors up, the city looks like something you could own.",
        "\"You should have taken the money, detective.\"",
        "Everything burns. The only question is who's holding the match.",
      ],
    },
    {
      id: "ep3",
      number: 3,
      title: "Everything Burns",
      kicker: "The Ashford Vanishing — Season Finale",
      tagline: "Forty floors up, nobody can hear a confession.",
      startSceneId: "av_penthouse",
      sceneIds: ["av_penthouse", "av_showdown", "av_ep3_gold", "av_ep3_silver", "av_ep3_bad"],
      titleCardImage: "/img/bg-penthouse.jpg",
      posterImage: "/img/bg-endgame.jpg",
      titleCardSeconds: 3,
      recapFromMemories: true,
      recapLines: [
        {
          id: "r3_ledger",
          text: "The harbour ledger came out of locker fourteen with Nadia's name in the margin.",
          gating: { requiresItems: ["av_ledger_page"] },
          image: "/img/bg-vault.jpg",
        },
        {
          id: "r3_noledger",
          text: "Locker fourteen closed on you empty. Whatever the harbour wrote down, someone else is holding it.",
          gating: { excludesItems: ["av_ledger_page"] },
          image: "/img/bg-vault.jpg",
        },
        {
          id: "r3_reyes",
          text: "Solomon Reyes poured you a drink and told you the city was already spoken for.",
          characterId: "solomon",
          image: "/img/bg-solomon-office.jpg",
        },
        {
          id: "r3_warned",
          text: "You told Vera to run. She didn't.",
          gating: { requiresFlags: ["av_warned_vera"] },
          characterId: "vera",
          image: "/img/bg-vera-window.jpg",
        },
        {
          id: "r3_board",
          text: "Every string on the board points the same direction now.",
          gating: { requiresFlags: ["av_ledger_solomon", "av_matchbook_morrow"], requiresAll: true },
          image: "/img/UI/evidence_board.jpg",
        },
      ],
    },
  ],

  characters: [
    { id: "vera", name: "Vera Ashford", role: "The Sister", avatarUrl: "/img/ch-vera-nobody.jpg", trustMeter: 1, voice: { pitch: 1.12, rate: 0.92 } },
    { id: "morrow", name: "Jack Morrow", role: "Fixer, Pier Four", avatarUrl: "/img/ch-jack-morrow.jpg", trustMeter: 0, voice: { pitch: 0.78, rate: 0.95 } },
    { id: "solomon", name: "Solomon Reyes", role: "Harbour Money", avatarUrl: "/img/ch-solomon-reyes.jpg", trustMeter: -1, voice: { pitch: 0.7, rate: 0.88 } },
    { id: "lena", name: "Lena Cruz", role: "Bartender, The Blue Hour", avatarUrl: "/img/ch-lena.jpg", trustMeter: 0, voice: { pitch: 1.05, rate: 1 } },
  ],

  items: [
    { id: "av_matchbook", name: "Pier Four Matchbook", icon: "🔥", description: "A matchbook from a dock bar Nadia Ashford had no business knowing. Three matches gone, a phone number torn off.", flavorText: "People keep matches from the last place they felt safe.", isClue: true },
    { id: "av_pawn_ticket", name: "Pawn Ticket", icon: "🎫", description: "A pawn ticket for a locket, signed in a looping hand that isn't Nadia's — and dated two days after she vanished.", flavorText: "Somebody sold her jewellery while she was still warm.", isClue: true },
    { id: "av_locker_key", name: "Locker 14 Key", icon: "🗝️", description: "A brass harbour-locker key, still cold from the water it was fished out of.", flavorText: "Cheap metal, expensive secret.", isClue: false },
    { id: "av_ledger_page", name: "Harbour Ledger Page", icon: "📖", description: "One page torn from the harbour's real books: cargo that never landed, signed off by Solomon Reyes. Nadia's name is in the margin, in pencil.", flavorText: "Everything the harbour takes, it writes down first.", isClue: true },
  ],

  deduction: {
    suspectIds: ["morrow", "solomon", "lena"],
    connections: [
      { a: "av_matchbook", b: "morrow", flagSet: "av_matchbook_morrow", revelation: "The matchbook puts Nadia at Pier Four — Morrow's door — the night she disappeared." },
      { a: "av_pawn_ticket", b: "lena", flagSet: "av_pawn_lena", revelation: "Lena's handwriting on the pawn ticket. She wasn't stealing — she was hiding the locket where the harbour couldn't reach it." },
      { a: "av_ledger_page", b: "solomon", flagSet: "av_ledger_solomon", revelation: "Reyes signed off on cargo that never landed, on the night Nadia stopped existing. She wasn't a witness. She was manifest." },
    ],
  },

  scenes: [
    /* ================================================================== */
    /*  EPISODE ONE — A Girl Named Nobody                                  */
    /* ================================================================== */
    {
      id: "av_office",
      title: "The Office, 11:40 PM",
      background: "/img/bg-office.jpg",
      ambientAudio: "rain",
      particles: "rain",
      letterbox: true,
      transition: "fade-black",
      transitionSpeed: 0.9,
      prose:
        "Eleven days is a long time to be missing in a city that files people alphabetically. Vera Ashford sat in the client chair with her coat still buttoned, like she expected to be asked to leave. On the desk between us: a photograph of a girl who looked like her, five years younger and twice as certain.",
      dialogueBeats: [
        { id: "av_o_b1", characterId: "vera", expression: "steady", text: "Nadia isn't the kind of girl who runs. The precinct wrote 'transient' on the form and put the pen down. I'd like somebody to pick it back up." },
        { id: "av_o_b2", characterId: "vera", expression: "quieter", text: "I can pay for three nights. After that I'm out of money and you're out of a client.", recalls: { av_vow_soft: "You said: {said} — nobody's said anything like that to me since she went.", av_vow_hard: "You said: {said}. Good. I don't need gentle. I need found." } },
      ],
      choices: [
        {
          id: "av_o_soft",
          text: "\"Three nights is three nights. I'll find her or I'll find who took her.\"",
          reply: true,
          targetSceneId: "",
          exclusiveGroup: "av_open",
          attitudeTag: "Sultry",
          memoryLog: "av_vow_soft",
          rememberLine: "Vera will remember that.",
          consequences: { setFlags: ["av_promised"], trustChanges: [{ characterId: "vera", delta: 2 }], meterChanges: [{ meter: "Sultry", delta: 1 }] },
        },
        {
          id: "av_o_hard",
          text: "\"Don't hire me for comfort. I'll bring back what's true, not what's kind.\"",
          reply: true,
          targetSceneId: "",
          exclusiveGroup: "av_open",
          attitudeTag: "Clever",
          memoryLog: "av_vow_hard",
          rememberLine: "Vera will remember that.",
          consequences: { setFlags: ["av_promised"], trustChanges: [{ characterId: "vera", delta: 1 }], meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
        { id: "av_o_go", text: "Start where she stopped — Nadia's apartment.", targetSceneId: "av_apartment", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "av_apartment",
      title: "Nadia's Apartment",
      background: "/img/bg-low-apartment.jpg",
      ambientAudio: "drone",
      prose:
        "Nobody had lived here in a week and the room already knew it. Dust on the sill, milk gone solid, a bed made too neatly by somebody who wasn't the person who slept in it. Whoever cleaned up was tidy. Tidy people always miss the small stuff.",
      dialogueBeats: [
        { id: "av_a_b1", characterId: "narrator", expression: "V.O.", text: "Two things in this room don't belong to a girl who worked doubles at a laundry: a matchbook from a dock bar, and a pawn ticket dated after she vanished." },
      ],
      hotspots: [
        { id: "av_a_match", label: "Matchbook under the radiator", bounds: { x: 16, y: 58, w: 20, h: 24 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "av_matchbook" } },
        { id: "av_a_ticket", label: "Pawn ticket in the coat lining", bounds: { x: 62, y: 40, w: 22, h: 28 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "av_pawn_ticket" } },
        { id: "av_a_board", label: "Open the corkboard", bounds: { x: 4, y: 8, w: 13, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        { id: "av_a_go", text: "The matchbook says Pier Four. The Blue Hour opens at midnight.", targetSceneId: "av_bar", attitudeTag: "Neutral" },
        { id: "av_a_back", text: "Back to the office.", targetSceneId: "av_office", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    {
      id: "av_bar",
      title: "The Blue Hour",
      background: "/img/bg-neon-diner.jpg",
      ambientAudio: "jazz",
      particles: "smoke",
      prose:
        "The Blue Hour ran on cheap neon and expensive silence. Lena Cruz worked the bar like she was defusing it. And in the back booth, with his hat off and his hands flat on the table, sat Jack Morrow — the man they send when a problem needs to stop being one.",
      dialogueBeats: [
        { id: "av_b_b1", characterId: "morrow", expression: "pleasant", text: "You're the one asking about the Ashford girl. That's fine. Everybody gets to ask once." },
        { id: "av_b_b2", characterId: "lena", expression: "careful", text: "She sat right where you're standing. Eleven days ago. She had a locket she wouldn't put down and a look I've seen on women about to do something brave.", conditionRule: { minTrust: { lena: 1 } } },
        { id: "av_b_b3", characterId: "lena", expression: "low", text: "I pawned that locket for her. Under my own name, so nobody could trace it back to hers. That's the whole crime, detective.", conditionRule: { requiresFlags: ["av_lena_talks"] } },
      ],
      hotspots: [
        { id: "av_b_board", label: "Open the corkboard", bounds: { x: 4, y: 8, w: 13, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        {
          id: "av_b_drink",
          text: "\"Whatever she's having. And whatever she's not saying.\"",
          reply: true,
          targetSceneId: "",
          exclusiveGroup: "av_bar_open",
          attitudeTag: "Sultry",
          memoryLog: "av_bought_lena_a_drink",
          rememberLine: "Lena will remember that.",
          consequences: { setFlags: ["av_lena_talks"], trustChanges: [{ characterId: "lena", delta: 2 }], meterChanges: [{ meter: "Sultry", delta: 1 }] },
        },
        {
          id: "av_b_lean",
          text: "\"Morrow. Say her name out loud and see how it sits.\"",
          reply: true,
          targetSceneId: "",
          exclusiveGroup: "av_bar_open",
          attitudeTag: "Aggressive",
          memoryLog: "av_leaned_on_morrow",
          rememberLine: "Morrow will remember that.",
          consequences: { trustChanges: [{ characterId: "morrow", delta: -2 }], meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 2 }] },
        },
        { id: "av_b_go", text: "Morrow's already standing. Take it outside.", targetSceneId: "av_ep1_finale", attitudeTag: "Neutral" },
        { id: "av_b_back", text: "Back to the apartment — you missed something.", targetSceneId: "av_apartment", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    {
      id: "av_ep1_finale",
      title: "The Alley Behind the Blue Hour",
      background: "/img/bg-alley.jpg",
      ambientAudio: "rain",
      particles: "rain",
      letterbox: true,
      cinematic: { mode: "pan", panDistance: 4, dimAmount: 0.15 },
      prose:
        "Rain came down like it was being charged by the hour. Morrow followed me out with an envelope in his coat and the patient look of a man who's bought quiet before and knows the going rate.",
      dialogueBeats: [
        { id: "av_f_b1", characterId: "morrow", expression: "reasonable", text: "Nobody's angry with you. There's a number in here and the number is generous. Take it, sleep in, and the Ashford girl stays a story about a girl who left." },
      ],
      choices: [
        {
          id: "av_f_clean",
          text: "Put the envelope back in his hand — you've got the matchbook and the ticket.",
          targetSceneId: "av_ep1_gold",
          attitudeTag: "Clever",
          gating: { requiresItems: ["av_matchbook", "av_pawn_ticket"], requiresAll: true },
          memoryLog: "av_refused_the_money",
          rememberLine: "Morrow will remember that.",
          consequences: { setFlags: ["av_refused_money"], trustChanges: [{ characterId: "morrow", delta: -1 }], meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
        {
          id: "av_f_take",
          text: "Take the envelope. Money spends; principles don't.",
          targetSceneId: "av_ep1_silver",
          attitudeTag: "Neutral",
          memoryLog: "av_took_the_money",
          rememberLine: "Morrow will remember that.",
          consequences: { setFlags: ["av_took_money"], trustChanges: [{ characterId: "morrow", delta: 1 }], meterChanges: [{ meter: "Suspicion", delta: 1 }] },
        },
        {
          id: "av_f_swing",
          text: "Swing first. Ask questions never.",
          targetSceneId: "av_ep1_bad",
          attitudeTag: "Aggressive",
          rememberLine: "The whole bar will remember that.",
          consequences: { setFlags: ["av_swung_first"], trustChanges: [{ characterId: "morrow", delta: -3 }, { characterId: "lena", delta: -2 }], meterChanges: [{ meter: "Aggressive", delta: 2 }, { meter: "Suspicion", delta: 3 }] },
        },
        { id: "av_f_back", text: "Not yet — back inside.", targetSceneId: "av_bar", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    {
      id: "av_ep1_gold",
      title: "Night One — Clean Hands",
      background: "/img/bg-vera-window.jpg",
      ambientAudio: "rain",
      choiceDelaySeconds: 1,
      prose:
        "I walked back to the office with wet shoes, an empty wallet and two pieces of paper that shouldn't exist together. A matchbook that puts a laundry girl on Morrow's dock. A pawn ticket signed by a bartender protecting a stranger. Night one, and the city had already told me it was lying.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "NIGHT ONE — THE TRAIL HOLDS",
        recap: "You kept your hands clean, kept both clues, and left Morrow knowing he'd have to try something less polite.",
      },
    },
    {
      id: "av_ep1_silver",
      title: "Night One — The Envelope",
      background: "/img/bg-alley.jpg",
      ambientAudio: "rain",
      choiceDelaySeconds: 1,
      prose:
        "The envelope went in my coat and the coat felt heavier the whole way home. I didn't count it. Counting it would have made it a decision instead of a mistake. Somewhere across town a girl was still missing, and now she was cheaper.",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "NIGHT ONE — BOUGHT, NOT SOLD",
        recap: "You took Morrow's money. The case survives the night — but so does the receipt, and Morrow keeps receipts.",
      },
    },
    {
      id: "av_ep1_bad",
      title: "Night One — Blood in the Rain",
      background: "/img/bg-betrayal.jpg",
      ambientAudio: "tension",
      choiceDelaySeconds: 1,
      prose:
        "I got one good hit in before the alley got crowded. By the time the rain finished rinsing it off, Morrow was gone, Lena had stopped answering, and the only two people in this city who'd said Nadia's name out loud were done saying anything to me.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "NIGHT ONE — THE ONLY WITNESS STOPS TALKING",
        recap: "You swung first. The trail didn't die, but everybody on it learned to walk the other way when they see you coming.",
      },
    },

    /* ================================================================== */
    /*  EPISODE TWO — The Long Drop                                        */
    /* ================================================================== */
    {
      id: "av_docks",
      title: "Pier Four, 2:00 AM",
      background: "/img/bg-docks.jpg",
      ambientAudio: "drone",
      letterbox: true,
      transition: "fade-black",
      transitionSpeed: 1,
      cinematic: { mode: "dolly", dollyDistance: 10, dollyDuration: 14, dimAmount: 0.2 },
      prose:
        "Pier Four at two in the morning is a place that has already decided about you. Water slapping pilings, a crane standing over it all like a judge, and somewhere under the walkway a locker key that somebody threw where they thought the harbour would keep it.",
      dialogueBeats: [
        { id: "av_d_b1", characterId: "narrator", expression: "V.O.", text: "Eleven days becomes twelve. The city didn't notice that either." },
        { id: "av_d_b2", characterId: "morrow", expression: "cold", text: "You were told to stop at the first door. I was hoping you'd be smart. Now I'm hoping you'll be lucky.", conditionRule: { excludesFlags: ["av_took_money"] } },
        { id: "av_d_b3", characterId: "morrow", expression: "amused", text: "You took the money and came anyway. That's not courage, detective. That's arithmetic you haven't finished.", conditionRule: { requiresFlags: ["av_took_money"] } },
      ],
      hotspots: [
        { id: "av_d_key", label: "Something brass in the pilings", bounds: { x: 30, y: 62, w: 20, h: 24 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "av_locker_key" } },
        { id: "av_d_board", label: "Open the corkboard", bounds: { x: 4, y: 8, w: 13, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        { id: "av_d_go", text: "Harbour lockers. Fourteen.", targetSceneId: "av_locker", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "av_locker",
      title: "Harbour Lockers",
      background: "/img/bg-vault.jpg",
      ambientAudio: "tension",
      prose:
        "A hundred steel doors in a room that smelled of rust and rope. Fourteen had been opened once and closed hard. Whatever the harbour writes down, it writes down here — and then it forgets to burn it.",
      dialogueBeats: [
        { id: "av_l_b1", characterId: "narrator", expression: "V.O.", text: "The key turned like it had been waiting eleven days to be useful." },
      ],
      hotspots: [
        {
          id: "av_l_open",
          label: "Open locker fourteen",
          bounds: { x: 40, y: 34, w: 22, h: 34 },
          cursor: "use",
          showItemImage: true,
          gating: { requiresItems: ["av_locker_key"] },
          customFailMessage: "Locked. Somewhere out on that pier there's a key nobody meant you to find.",
          action: { type: "giveItem", itemGranted: "av_ledger_page" },
        },
        { id: "av_l_board", label: "Open the corkboard", bounds: { x: 4, y: 8, w: 13, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        { id: "av_l_go", text: "The signature on this page has an office uptown.", targetSceneId: "av_reyes", attitudeTag: "Neutral" },
        { id: "av_l_back", text: "Back out onto the pier.", targetSceneId: "av_docks", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    {
      id: "av_reyes",
      title: "Reyes & Co., Forty-First Floor",
      background: "/img/bg-solomon-office.jpg",
      ambientAudio: "drone",
      letterbox: true,
      prose:
        "Solomon Reyes kept an office you could land a plane in and a smile he kept in a drawer for visitors. He poured two drinks before I sat down, which is how a certain kind of man tells you he already knows why you're there.",
      dialogueBeats: [
        { id: "av_r_b1", characterId: "solomon", expression: "genial", text: "The harbour moves eleven thousand tons a night, detective. You're asking me to remember one girl the way you'd ask the ocean to remember one wave." },
        { id: "av_r_b2", characterId: "solomon", expression: "flat", text: "That page is a forgery. Prove otherwise and I'll have my lawyer send you a fruit basket.", conditionRule: { requiresItems: ["av_ledger_page"] } },
        { id: "av_r_b3", characterId: "vera", expression: "frightened", text: "They came to my building tonight. Two of them. They didn't knock, they just stood there so I'd know they could.", conditionRule: { minTrust: { vera: 2 } } },
      ],
      hotspots: [
        { id: "av_r_board", label: "Open the corkboard and wire the ledger", bounds: { x: 46, y: 14, w: 18, h: 20 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        {
          id: "av_r_warn",
          text: "\"Vera — get out of the city tonight. I'll finish it.\"",
          reply: true,
          targetSceneId: "",
          attitudeTag: "Sultry",
          memoryLog: "av_told_vera_to_run",
          rememberLine: "Vera will remember that.",
          consequences: { setFlags: ["av_warned_vera"], trustChanges: [{ characterId: "vera", delta: 2 }] },
        },
        {
          id: "av_r_gold",
          text: "Lay the ledger on his desk and let the silence do the work.",
          targetSceneId: "av_ep2_gold",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["av_ledger_solomon", "av_matchbook_morrow"], requiresAll: true },
          memoryLog: "av_showed_reyes_the_ledger",
          rememberLine: "Reyes will remember that.",
          consequences: { meterChanges: [{ meter: "Clever", delta: 2 }] },
        },
        {
          id: "av_r_silver",
          text: "Keep the page in your pocket. Let him think you've got less than you do.",
          targetSceneId: "av_ep2_silver",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["av_played_it_quiet"], meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
        {
          id: "av_r_bad",
          text: "Come over the desk at him. Forty-one floors, no witnesses.",
          targetSceneId: "av_ep2_bad",
          attitudeTag: "Aggressive",
          rememberLine: "Reyes will remember that.",
          consequences: { setFlags: ["av_burned_reyes"], meterChanges: [{ meter: "Aggressive", delta: 2 }, { meter: "Suspicion", delta: 4 }] },
        },
      ],
    },
    {
      id: "av_ep2_gold",
      title: "Night Two — The Books Open",
      background: "/img/bg-folder-closeup.jpg",
      ambientAudio: "tension",
      choiceDelaySeconds: 1,
      prose:
        "He read his own signature for a long time, the way people read a diagnosis. Then he set the glass down without drinking and said the only honest thing he'd say all season: 'You understand this doesn't stop at me.' I did. That's why I took the page back before I left.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "NIGHT TWO — THE HARBOUR'S REAL BOOKS SURFACE",
        recap: "Ledger recovered, wired, and shown to the man who signed it. Reyes knows exactly what you have — and now so do you.",
      },
    },
    {
      id: "av_ep2_silver",
      title: "Night Two — A Quiet Drink",
      background: "/img/bg-corridor.jpg",
      ambientAudio: "drone",
      choiceDelaySeconds: 1,
      prose:
        "I finished the drink, said nothing worth repeating, and rode forty-one floors down with a page in my pocket that neither of us mentioned. It bought me a night. It cost me the look on his face when he understood — and that look was going to be the whole case.",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "NIGHT TWO — NOBODY SHOWS THEIR HAND",
        recap: "You kept the ledger quiet. Safer, slower, and Reyes gets to finish the night still guessing what you know.",
      },
    },
    {
      id: "av_ep2_bad",
      title: "Night Two — Forty-One Floors",
      background: "/img/bg-basement.jpg",
      ambientAudio: "tension",
      choiceDelaySeconds: 1,
      prose:
        "Two men came through the door before my hands closed on his collar, and they were very good at their jobs. I woke up in a boiler room that smelled like the harbour with my pockets emptied and my name already circulating. Nadia was still missing. Now so was everything I'd found.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "NIGHT TWO — DETECTIVE FOUND IN A BOILER ROOM",
        recap: "You went over the desk. Reyes has your evidence and your description. The season goes on — you're just walking into it lighter.",
      },
    },

    /* ================================================================== */
    /*  EPISODE THREE — Everything Burns                                   */
    /* ================================================================== */
    {
      id: "av_penthouse",
      title: "The Penthouse, Night Three",
      background: "/img/bg-penthouse.jpg",
      ambientAudio: "tension",
      letterbox: true,
      transition: "fade-black",
      transitionSpeed: 1.1,
      cinematic: { mode: "zoom-hold", focalPoint: "50% 40%", zoomDuration: 12, dimAmount: 0.18 },
      prose:
        "Third night. Forty floors up, the city stops being a place and becomes a diagram — and everyone in this room helped draw it. Reyes at the window. Morrow by the door, hat off, hands where I could see them. And on the table between us, a locket that a bartender pawned to keep a girl alive.",
      dialogueBeats: [
        { id: "av_p_b1", characterId: "solomon", expression: "unhurried", text: "You've had three nights, detective. That's more than the police gave her and more than I'd have given you." },
        { id: "av_p_b2", characterId: "morrow", expression: "tired", text: "I moved her. I want that said out loud before anyone says anything else. I moved her, and she was breathing when I did it.", conditionRule: { requiresFlags: ["av_matchbook_morrow"] } },
        { id: "av_p_b3", characterId: "vera", expression: "unmoved", text: "I didn't run. You told me to and I didn't. She's my sister — I'm not hearing this second-hand.", conditionRule: { requiresFlags: ["av_warned_vera"] } },
        { id: "av_p_b4", characterId: "lena", expression: "steady", text: "Say it with the ledger in your hand or don't say it at all. These men have lawyers for anything softer.", conditionRule: { requiresFlags: ["av_pawn_lena"] } },
      ],
      hotspots: [
        { id: "av_p_board", label: "Open the corkboard — pull every string", bounds: { x: 6, y: 10, w: 15, h: 16 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        { id: "av_p_go", text: "Put it all on the table. Name the man.", targetSceneId: "av_showdown", attitudeTag: "Clever" },
      ],
    },
    {
      id: "av_showdown",
      title: "Five Seconds",
      background: "/img/bg-endgame.jpg",
      ambientAudio: "tension",
      letterbox: true,
      transition: "cut",
      cinematic: { mode: "shake", shakeAmount: 0.35, shakeDuration: 0.6, dimAmount: 0.25 },
      prose:
        "Reyes reached for the drawer and the room went very small. Morrow moved — toward me or toward him, and I had about as long as it takes to read this sentence to decide which.",
      hotspots: [
        { id: "av_s_board", label: "Open the corkboard", bounds: { x: 4, y: 8, w: 13, h: 14 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        {
          id: "av_s_gold",
          text: "Name Reyes — the ledger, the manifest, the girl who became cargo.",
          quickTime: true,
          qtePrompt: "NAME HIM!",
          timeLimitSeconds: 7,
          qteHeartbeat: true,
          qteShakyCam: true,
          targetSceneId: "av_ep3_gold",
          attitudeTag: "Clever",
          rememberLine: "This city will remember that.",
          gating: { requiresFlags: ["av_ledger_solomon", "av_matchbook_morrow", "av_pawn_lena"], requiresAll: true },
          timedOutTargetSceneId: "av_ep3_silver",
          timedOutConsequences: { setFlags: ["av_hesitated"], meterChanges: [{ meter: "Suspicion", delta: 2 }] },
        },
        {
          id: "av_s_silver",
          text: "Take Morrow's confession and let the ledger stay a rumour.",
          targetSceneId: "av_ep3_silver",
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["av_matchbook_morrow"] },
        },
        {
          id: "av_s_bad",
          text: "Name Morrow. He's the one who touched her.",
          targetSceneId: "av_ep3_bad",
          attitudeTag: "Aggressive",
          rememberLine: "Vera will remember that.",
        },
      ],
    },
    {
      id: "av_ep3_gold",
      title: "Finale — Everything Burns",
      background: "/img/bg-end-gold.jpg",
      ambientAudio: "jazz",
      choiceDelaySeconds: 2,
      prose:
        "The ledger did what ledgers do: it outlived everyone's version of the night. Reyes went down for cargo that was never cargo, Morrow went down beside him and didn't argue, and Nadia Ashford came home in a way that let her sister stop holding her breath. Three nights. One name. The harbour still writes everything down — but now somebody reads it.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "HARBOUR EMPIRE BURNS — ASHFORD CASE CLOSED",
        recap: "Every string pulled tight, every clue carried across three nights, and the right name said in the only five seconds that counted.",
        endsSeason: true,
      },
    },
    {
      id: "av_ep3_silver",
      title: "Finale — Half the Truth",
      background: "/img/bg-end-warn.jpg",
      ambientAudio: "rain",
      choiceDelaySeconds: 2,
      prose:
        "Morrow said it all out loud and meant every word, and it was enough to bring Nadia home and not nearly enough to touch the man who ordered it. Reyes sent flowers to the hearing. Vera didn't open them. Some nights you get the girl back and leave the city exactly as you found it.",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "FIXER CONFESSES — HARBOUR MONEY WALKS",
        recap: "You closed the case and left the empire standing. Nadia comes home; the pier keeps its books.",
        endsSeason: true,
      },
    },
    {
      id: "av_ep3_bad",
      title: "Finale — The Wrong Name",
      background: "/img/bg-end-refusal.jpg",
      ambientAudio: "tension",
      choiceDelaySeconds: 2,
      prose:
        "I said Morrow's name and the room relaxed, which is how you know you've said the wrong one. He took it — he'd have taken worse. Reyes shook my hand on the way out. Vera didn't. The harbour moved eleven thousand tons that night and nobody wrote down a single one.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "CASE CLOSED ON THE WRONG MAN — HARBOUR UNTOUCHED",
        recap: "You named the hand instead of the head. The season ends with the man who ordered it pouring himself a drink.",
        endsSeason: true,
      },
    },
  ],
};
