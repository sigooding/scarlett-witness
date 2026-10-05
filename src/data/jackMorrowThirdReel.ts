import type { Story } from "../types";

/**
 * JACK MORROW — THE THIRD REEL
 * The full-kit showcase: the case is the negative of the missing midnight
 * reel, and the syndicate is auctioning it at the Rialto on Friday night.
 *
 * Everything the engine can do for a move, this story spends on purpose:
 * - CHANCE GAMBLE (🎲) choices with real fail routes and Heat, in both the
 *   bid (55%) and the splice (45%), plus the final 35% call in the alley;
 * - ART TRANSITIONS at full travel: slide-left / slide-right carry the
 *   destination's plate inside the overlay, the zoom enters the lobby with
 *   its own frame, and every one of them now LANDS WITH SOUND — the
 *   synthesized transition bed. The booth demonstrates the studio option:
 *   a plain fade given a deliberate THUMP, and the shame of `tr_caught`
 *   staged in total silence (`transitionSound: "none"` over a fade-black);
 * - STAGE nodes everywhere the walking earns its keep — alley, booth, roof —
 *   with patrol NPCs, proximity markers, gated takes and captions;
 * - the dynamic visuals the pass added: rain-on-lens, depth fog, shadow
 *   casting, light-reactive dust, and DOF on the final conversation;
 * - three endings: gold (the blank reel), silver (the walk), busted (Heat).
 */
export const JACK_MORROW_THIRD_REEL: Story = {
  id: "jack-morrow-third-reel",
  title: "Jack Morrow — The Third Reel",
  tagline: "The negative was never lost. It was being kept warm for one showing — and the tickets are going cheap.",
  coverImage: "/img/sr-rooftop.jpg",
  startSceneId: "tr_credits",
  pulpPaper: true,
  layout: {
    tr_credits: { x: 0, y: 200 },
    tr_alley: { x: 380, y: 200 },
    tr_lobby: { x: 760, y: 200 },
    tr_heat: { x: 1000, y: 40 },
    tr_booth: { x: 1140, y: 200 },
    tr_caught: { x: 1380, y: 40 },
    tr_roof: { x: 1520, y: 200 },
    tr_end_gold: { x: 1900, y: 80 },
    tr_end_silver: { x: 1900, y: 320 },
    tr_end_busted: { x: 1900, y: 200 },
  },
  briefing: {
    objective:
      "Get the Rialto negative off the auction block before the syndicate buys its own secret back — and decide what you're willing to splice.",
    winConditions: [
      "Reach the projection booth with the negative (quiet feet or a won bid).",
      "Cut the print clean: the 45% splice decides whether you splice or you scramble.",
      "In the alley, call the auction's bluff — the 35% closes the case in gold.",
    ],
    loseConditions: [
      "Miss the final call: you walk with the story, the negative walks into the river.",
      "Stack Heat — the bid, the snagged splice, and the walk past the desk all remember your face, and at five the night closes on you.",
    ],
    heatLimit: 5,
    heatFailSceneId: "tr_end_busted",
  },
  characters: [
    { id: "jack", name: "Jack Morrow", role: "Detective, third time lucky", avatarUrl: "/img/ch-jack.png", trustMeter: 0, voice: { pitch: 0.85, rate: 0.95 } },
    { id: "vera", name: "Vera Voss", role: "The auction's anonymous consignee", avatarUrl: "/img/ch-vera.png", trustMeter: 0, voice: { pitch: 1.1, rate: 1.0 } },
    { id: "agent", name: "AG-3NT", role: "The voice in the static", avatarUrl: "/img/ch-agent.png", trustMeter: 0, voice: { pitch: 1.4, rate: 1.15 } },
    { id: "sid", name: "Sid Kellerman", role: "Projectionist, Rialto", avatarUrl: "emoji:🎞️", trustMeter: 0, voice: { pitch: 0.9, rate: 0.9 } },
    { id: "prosser", name: "Prosser", role: "The auctioneer with no paperwork", avatarUrl: "emoji:🧑‍⚖️", trustMeter: 0, voice: { pitch: 0.78, rate: 1.05 } },
  ],
  items: [
    { id: "tr_badge", name: "Usher's Badge", icon: "🎟️", description: "Brass, hot-stamped RIALTO. Still warm like someone left in a hurry.", flavorText: "The lanyard is cut, not unbuckled.", isClue: true },
    { id: "tr_ledgerpage", name: "Auction Page", icon: "📄", description: "Lot 13: 'one nitrate negative, no title, sold as-is.' The reserve is one dollar.", flavorText: "Nobody auctions a thing they're afraid of seeing. They auction the thing they're afraid of NOT seeing.", isClue: true },
    { id: "tr_negative", name: "The Negative", icon: "🎞️", description: "The midnight reel, reversed. Every lie the cut told, told straight.", flavorText: "Hold it to the light and the light loses." },
  ],
  flagNotes: {
    tr_badge_taken: "The usher's badge — someone left in a hurry.",
    tr_sid_talked: "Sid the projectionist knows what Lot 13 really is.",
    tr_bid_won: "You won the bid on nerve. Prosser's smile cost him something.",
    tr_heat: "The doorman knows your face now. The house keeps its receipts.",
    tr_ledger_found: "Lot 13 carries a one-dollar reserve. That's not a sale. That's a burial.",
    tr_spliced: "The splice held. The negative came with you.",
    tr_caught: "Prosser's man found you in the booth. You bought your way out.",
    tr_stub_found: "Lot 13 was withdrawn from inside the house. The auction is a trap.",
    tr_bluff_won: "You called the auction's bluff in the alley. Vera's buyer is on the record.",
    tr_walked: "You walked with the story. The river got the negative.",
  },
  dialogueBox: {
    bodyFont: "type",
    headingFont: "pulp",
    hudTheme: "neon-noir",
    accentColor: "#e23b4e",
    bordered: true,
    backdropBlur: 2,
  },
  scenes: [
    {
      id: "tr_credits",
      title: "The Third Reel — Credits",
      nodeType: "credits",
      background: "gradient:linear-gradient(180deg,#050308 0%,#1a0d12 55%,#050308 100%)",
      ambientAudio: "tension",
      musicUrl: "/Soundtrack.mp3",
      musicMode: "track",
      musicLevel: 0.55,
      transition: "fade-black",
      transitionSpeed: 1.6,
      choiceDelaySeconds: 2,
      credits: {
        font: "poster",
        style: "cards",
        cardMotion: "slam",
        titleEntrance: "slam",
        cardSeconds: 3.0,
        montage: ["/img/sr-credits.jpg", "/img/sr-docks.jpg", "/img/sr-rooftop.jpg"],
        montageSeconds: 3.5,
        montageTransition: "dissolve",
        titleColor: "#e23b4e",
        accentColor: "#e8b647",
      },
      prose: "JACK MORROW — THE THIRD REEL\nThe reel was cut. The static spoke. The negative kept quiet.\n\nTonight the quiet goes on the block,\none showing, no title, sold as-is.\n\nTap to thread the projector.",
      choices: [{ id: "tr_c1", text: "Thread the reel.", targetSceneId: "tr_alley", attitudeTag: "Neutral" }],
      hotspots: [],
      dialogueBeats: [],
    },

    {
      id: "tr_alley",
      title: "Scene 1 — The Alley Behind the Rialto",
      nodeType: "stage",
      background: "/img/sr-street.jpg",
      ambientAudio: "rain",
      particles: "rain",
      // ART TRANSITION, on purpose: slide-left carries the destination's own
      // plate across the move (no blackout), and `auto` sound gives it the
      // wide whoosh that cushions into the swap.
      transition: "slide-left",
      transitionSpeed: 1.0,
      letterbox: true,
      prose: "",
      cinematic: {
        mode: "pan",
        focalPoint: "52% 46%",
        zoomDuration: 13,
        dimAmount: 0.45,
        lights: [
          { x: 22, y: 28, color: "#ffaa44", intensity: 0.8, size: 38, pulseSeconds: 2.4, pulseAmount: 0.35 },
          { x: 80, y: 22, color: "#66d9ff", intensity: 0.5, size: 32, pulseSeconds: 3.1, pulseAmount: 0.25 },
        ],
        parallaxDepth: 0.55,
        depthFog: true,
        fogStrength: 0.4,
        shadowCasting: true,
        rainOnLens: true,
        rainLensIntensity: 1.0,
      },
      stage: {
        playerImage: "emoji:🕵️",
        spawn: { x: 22, y: 88 },
        speed: 20,
        reach: 6,
        keyboard: true,
        floor: { top: 60, bottom: 93 },
        depthScale: 0.4,
        hints: "proximity",
        worldWidth: 190,
        enterCaption: "Marquee dark, one lit window, and a trash can that used to hold a uniform.",
        obstacles: [{ x: 66, y: 70, w: 14, h: 10 }],
        npcs: [
          {
            id: "tr_npc_sid",
            image: "emoji:🎞️",
            x: 104,
            y: 86,
            scale: 1.05,
            facing: "left",
            idleAnim: "breathe",
            talkHotspotId: "tr_hs_sid",
            patrol: [
              { x: 98, y: 86, pause: 3, say: "*smokes, watching the door* " },
              { x: 112, y: 88, pause: 2.5, say: "Ain't no movie Friday. Just a funeral with seats." },
            ],
            patrolMode: "pingpong",
            speed: 7,
          },
        ],
      },
      hotspots: [
        {
          id: "tr_hs_sid",
          label: "Sid, the projectionist",
          bounds: { x: 96, y: 50, w: 16, h: 32 },
          cursor: "talk",
          isRepeatable: true,
          action: { type: "startDialogue" },
        },
        {
          id: "tr_hs_bin",
          label: "The overflowing trash can",
          bounds: { x: 34, y: 68, w: 12, h: 12 },
          cursor: "take",
          isRepeatable: false,
          action: { type: "giveItem", itemGranted: "tr_badge", flagSet: "tr_badge_taken" },
        },
        {
          id: "tr_hs_to_lobby",
          label: "Stage door — into the lobby",
          bounds: { x: 160, y: 64, w: 12, h: 24 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "tr_lobby" },
        },
      ],
      dialogueBeats: [
        { id: "tr_a1", characterId: "sid", text: "Friday's program is a cardboard. Lot 13, the house calls it. One negative, no title. The bids come in through Prosser and the money leaves with somebody who never raises a hand." },
        { id: "tr_a2", characterId: "jack", text: "An auction that won't say what it sells sells one of two things: worthless, or dangerous." },
        { id: "tr_a3", characterId: "sid", text: "Then you'll want the booth, not the seats. The booth sees the print before the block ever does." },
        { id: "tr_a4", characterId: "agent", text: "…[signal, from the alley payphone — of course]… The stage door wants a badge more than a bribe, detective. Check the can by the marquee light. People throw terrible things away in a hurry." },
      ],
      choices: [
        {
          id: "tr_a_to_lobby",
          text: "Take the stage door. Leave the rain.",
          targetSceneId: "tr_lobby",
          attitudeTag: "Neutral",
        },
      ],
    },

    {
      id: "tr_lobby",
      title: "Scene 2 — The Lobby Floor",
      nodeType: "standard",
      background: "/img/sr-office.jpg",
      ambientAudio: "tension",
      particles: "smoke",
      // The zoom: the destination's own frame scales in behind the lens, and
      // the auto bed climbs into a sub-hit at the swap.
      transition: "zoom",
      transitionSpeed: 1.2,
      letterbox: true,
      prose: "Velvet ropes, a chandelier that survived the Depression on spite, and twelve chairs set for an audience that will never publish its names.\n\nProsser works the floor like a man selling his own funeral plot — warm, patient, certain.",
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 42%",
        zoomDuration: 10,
        dimAmount: 0.55,
        lights: [{ x: 50, y: 20, color: "#ffdd88", intensity: 0.9, size: 48, pulseSeconds: 1.9, pulseAmount: 0.35 }],
        depthFog: true,
        fogStrength: 0.3,
      },
      dialogueBeats: [
        { id: "tr_l1", characterId: "prosser", text: "A buyer without a paddle is still a buyer, friend. Take a seat. The reserve is — I don't want to say — friendly." },
        { id: "tr_l2", characterId: "agent", text: "…[the lobby's service bell, talking]… One dollar, detective. A one-dollar reserve isn't a price, it's a tripwire. Somebody wants to see who raises a hand." },
        { id: "tr_l3", characterId: "jack", text: "Then I'll raise a hand they'll have to look at." },
      ],
      choices: [
        {
          id: "tr_l_bid",
          text: "Win the floor — turn the tripwire on him. 55%.",
          targetSceneId: "tr_booth",
          attitudeTag: "Clever",
          chance: 55,
          consequences: { setFlags: ["tr_bid_won"], addItems: ["tr_ledgerpage"], meterChanges: [{ meter: "Clever", delta: 1 }] },
          failTargetSceneId: "tr_heat",
          failConsequences: { setFlags: ["tr_heat"], meterChanges: [{ meter: "Suspicion", delta: 2 }] },
          // The 55% gamble: hit = the house thinks you're the buyer's buyer and
          // the ledger page comes to you; miss = the floor turns cold and the
          // doorman starts counting faces.
        },
        {
          id: "tr_l_booth",
          text: "No paddle. Take the ushers' stair to the booth.",
          targetSceneId: "tr_booth",
          attitudeTag: "Neutral",
          isRepeatable: true,
        },
      ],
    },

    {
      id: "tr_heat",
      title: "The Floor Turns",
      nodeType: "standard",
      background: "/img/sr-office.jpg",
      ambientAudio: "tension",
      particles: "smoke",
      // A glitch: the frame tears instead of moving. Auto gives it the zap
      // stutter — noise, square blips, no clean landing.
      transition: "glitch",
      transitionSpeed: 0.9,
      letterbox: true,
      prose: "Your hand went up and the whole room did the arithmetic.\n\nProsser thanks you for your interest in exactly the tone he'd use on a fire. The doorman stops counting hats and starts counting faces. Yours is on the list.",
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 44%",
        zoomDuration: 8,
        dimAmount: 0.6,
        lights: [{ x: 46, y: 24, color: "#ff6644", intensity: 0.85, size: 44, pulseSeconds: 1.7, pulseAmount: 0.4 }],
      },
      dialogueBeats: [
        { id: "tr_h1", characterId: "prosser", text: "The gallery is open to everyone, friend. The BOOTH is another clause. Remember which door you came in, in case you need to prove it." },
        { id: "tr_h2", characterId: "agent", text: "…[static, clipped]… You're a name on their wall now. Names get handled in the dark, not the lobby. Go up. The stair doesn't ask questions yet." },
      ],
      choices: [
        {
          id: "tr_h_booth",
          text: "Go up the ushers' stair anyway.",
          targetSceneId: "tr_booth",
          attitudeTag: "Aggressive",
        },
      ],
    },

    {
      id: "tr_booth",
      title: "Scene 3 — The Projection Booth",
      nodeType: "stage",
      background: "/img/sr-archive.jpg",
      ambientAudio: "none",
      particles: "dust",
      // A fade that the studio hands a THUMP — no air, just the low landing.
      // (In Studio this is the "Transition sound" select: auto → thump.)
      transition: "fade",
      transitionSpeed: 0.8,
      transitionSound: "thump",
      letterbox: true,
      prose: "",
      cinematic: {
        mode: "pan",
        focalPoint: "50% 40%",
        zoomDuration: 14,
        dimAmount: 0.5,
        lights: [
          { x: 28, y: 26, color: "#ffcc66", intensity: 0.7, size: 36, pulseSeconds: 2.6, pulseAmount: 0.3 },
          { x: 74, y: 22, color: "#88ff99", intensity: 0.55, size: 32, pulseSeconds: 3.3, pulseAmount: 0.25 },
        ],
        parallaxDepth: 0.6,
        depthFog: true,
        fogStrength: 0.5,
        shadowCasting: true,
      },
      stage: {
        playerImage: "emoji:🕵️",
        spawn: { x: 18, y: 88 },
        speed: 18,
        reach: 5,
        keyboard: true,
        floor: { top: 62, bottom: 92 },
        depthScale: 0.38,
        hints: "proximity",
        worldWidth: 200,
        enterCaption: "Two projectors, one carbon arc, and Lot 13 in a can that says LOT 12. The house lies with its own hands.",
        obstacles: [
          { x: 52, y: 70, w: 14, h: 8 },
          { x: 118, y: 68, w: 14, h: 8 },
        ],
        npcs: [
          {
            id: "tr_npc_sid_booth",
            image: "emoji:🎞️",
            x: 84,
            y: 86,
            scale: 1.0,
            facing: "right",
            idleAnim: "fidget",
            talkHotspotId: "tr_hs_sid_booth",
            patrol: [
              { x: 78, y: 86, pause: 3, say: "*threads nothing, from habit* " },
              { x: 92, y: 88, pause: 2.5, say: "One splice. That's the whole distance between sold and saved." },
            ],
            patrolMode: "pingpong",
            speed: 6,
          },
        ],
      },
      hotspots: [
        {
          id: "tr_hs_sid_booth",
          label: "Sid, at the bench",
          bounds: { x: 76, y: 50, w: 16, h: 32 },
          cursor: "talk",
          isRepeatable: true,
          action: { type: "startDialogue" },
        },
        {
          id: "tr_hs_can",
          label: "The can that says LOT 12",
          bounds: { x: 140, y: 58, w: 12, h: 14 },
          cursor: "take",
          isRepeatable: false,
          action: { type: "giveItem", itemGranted: "tr_negative" },
        },
        {
          id: "tr_hs_projector",
          label: "The left projector (cold)",
          bounds: { x: 46, y: 56, w: 12, h: 16 },
          cursor: "go",
          isRepeatable: false,
          action: { type: "setFlag", flagSet: "tr_ledger_found", text: "You open the door and hold Lot 13 up to the arc's afterglow. It isn't a publicity print. It's the midnight reel's negative — every cut the syndicate made, reversed, undeniable." },
        },
        {
          id: "tr_hs_leave",
          label: "Back stair — down to the lobby",
          bounds: { x: 6, y: 64, w: 10, h: 24 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "tr_lobby" },
        },
        {
          id: "tr_hs_roof",
          label: "The booth's roof hatch",
          bounds: { x: 182, y: 62, w: 10, h: 22 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "tr_roof" },
        },
      ],
      dialogueBeats: [
        { id: "tr_b1", characterId: "sid", text: "I can get the can out of the house in a coat. I can't get the coat past Prosser's man. The roof hatch sees the alley; the alley sees Vera's car. You do the math you came here to do." },
        { id: "tr_b2", characterId: "agent", text: "…[the arc hum, shaped into words]… There is a third math. The splice bench. Forty-five percent of clean cuts to one dirty print, and the rest is steadiness. I have watched you be steady, detective." },
        { id: "tr_b3", characterId: "jack", text: "Nobody taught me to splice. I learned on film the way I learned on people — by cutting things I shouldn't have." },
      ],
      choices: [
        {
          id: "tr_b_splice",
          text: "Cut Lot 13 at the bench. 45% it holds.",
          targetSceneId: "tr_roof",
          attitudeTag: "Clever",
          chance: 45,
          consequences: { setFlags: ["tr_spliced"], meterChanges: [{ meter: "Clever", delta: 1 }] },
          failTargetSceneId: "tr_caught",
          failConsequences: { setFlags: ["tr_caught"], meterChanges: [{ meter: "Suspicion", delta: 2 }] },
          // The 45% gamble: a clean splice puts the negative in your coat and
          // the roof between you and the street; a snagged one puts Prosser's
          // man in the doorway with the lights going amber.
        },
        {
          id: "tr_b_hatch",
          text: "No cut. Carry the can whole over the hatch.",
          targetSceneId: "tr_roof",
          attitudeTag: "Neutral",
        },
      ],
    },

    {
      id: "tr_caught",
      title: "Amber Light",
      nodeType: "standard",
      background: "/img/sr-sneak.jpg",
      ambientAudio: "tension",
      particles: "ash",
      // The author-staged silence: a fade-to-black with NO sound bed at all.
      // In Studio, this is "Transition sound: None". Being caught should be
      // the one move in the reel that the room doesn't hear.
      transition: "fade-black",
      transitionSpeed: 1.1,
      transitionSound: "none",
      letterbox: true,
      prose: "The splice snags a frame short of clean, and the booth door knows it — the amber work light says the same thing in one syllable: him.\n\nProsser's man is very polite. Politeness is what heat wears when it doesn't want an audience.",
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "48% 42%",
        zoomDuration: 8,
        dimAmount: 0.6,
        lights: [{ x: 58, y: 30, color: "#ffaa44", intensity: 0.85, size: 46, pulseSeconds: 1.8, pulseAmount: 0.4 }],
      },
      dialogueBeats: [
        { id: "tr_c1", characterId: "prosser", text: "House insurance, friend. The can stays; you go out the way the light went amber. That's the whole contract." },
        { id: "tr_c2", characterId: "agent", text: "…[static, flat]… He's offering a walk, not a truce. The roof is above the conversation. Conversations end. Roofs don't." },
        { id: "tr_c3", characterId: "jack", text: "The can stays. Fine. I didn't come for the can." },
      ],
      choices: [
        {
          id: "tr_c_roof",
          text: "Take the walk — let the house photograph you. Up through the hatch. (+1 Heat)",
          targetSceneId: "tr_roof",
          attitudeTag: "Neutral",
          // The walk past the desk is not free: being processed is another
          // name on the wall, and on a full-miss run this +1 is the fifth
          // point — the bust fires at the roof, before the last call ever
          // gets thrown (Heat outranks the ending this choice points at).
          consequences: { meterChanges: [{ meter: "Suspicion", delta: 1 }] },
        },
      ],
    },

    {
      id: "tr_roof",
      title: "Scene 4 — The Roof Over the Alley",
      nodeType: "stage",
      background: "/img/sr-rooftop.jpg",
      ambientAudio: "rain",
      particles: "rain",
      // slide-right, auto whoosh — the mirror of the alley's slide-left: the
      // reel literally slides you back the way you came.
      transition: "slide-right",
      transitionSpeed: 1.1,
      letterbox: true,
      prose: "",
      cinematic: {
        mode: "pan",
        focalPoint: "50% 34%",
        zoomDuration: 12,
        dimAmount: 0.5,
        lights: [
          { x: 22, y: 26, color: "#ff6644", intensity: 0.75, size: 40, pulseSeconds: 2.2, pulseAmount: 0.35 },
          { x: 78, y: 30, color: "#44ff88", intensity: 0.55, size: 36, pulseSeconds: 2.8, pulseAmount: 0.3 },
          { x: 50, y: 16, color: "#ffcc44", intensity: 0.85, size: 50, pulseSeconds: 1.9, pulseAmount: 0.4 },
        ],
        parallaxDepth: 0.7,
        depthFog: true,
        fogStrength: 0.6,
        shadowCasting: true,
        rainOnLens: true,
        rainLensIntensity: 1.2,
        dofOnTalk: true,
      },
      stage: {
        playerImage: "emoji:🕵️",
        spawn: { x: 30, y: 88 },
        speed: 18,
        reach: 5,
        keyboard: true,
        floor: { top: 60, bottom: 92 },
        depthScale: 0.42,
        hints: "proximity",
        worldWidth: 210,
        enterCaption: "Below: Vera's car, an engine keeping itself warm. Up here: the can, the rain, and the arithmetic of one last nerve.",
        obstacles: [
          { x: 96, y: 66, w: 16, h: 10 },
          { x: 156, y: 64, w: 18, h: 12 },
        ],
        npcs: [
          {
            id: "tr_npc_vera",
            image: "emoji:👩‍💼",
            x: 82,
            y: 86,
            scale: 1.08,
            facing: "right",
            idleAnim: "sway",
            talkHotspotId: "tr_hs_vera",
            patrol: [
              { x: 76, y: 86, pause: 3, say: "*counts the alley, not the money* " },
              { x: 90, y: 88, pause: 2.5, say: "The buyer is patient. I'm not. Choose, Morrow." },
            ],
            patrolMode: "pingpong",
            speed: 7,
          },
        ],
      },
      hotspots: [
        {
          id: "tr_hs_vera",
          label: "Vera, at the hatch",
          bounds: { x: 74, y: 48, w: 18, h: 36 },
          cursor: "talk",
          isRepeatable: true,
          action: { type: "startDialogue" },
        },
        {
          id: "tr_hs_down",
          label: "Stair — back down to the booth",
          bounds: { x: 186, y: 64, w: 12, h: 24 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "tr_booth" },
        },
        {
          id: "tr_hs_phone",
          label: "The alley payphone, off the hook",
          bounds: { x: 34, y: 60, w: 10, h: 16 },
          cursor: "look",
          isRepeatable: false,
          action: { type: "setFlag", flagSet: "tr_stub_found", text: "A stub of a bid paddle in the coin return, torn with intent: LOT 13 — WITHDRAWN. Somebody pulled the lot before the block even opened. The auction is a trap, and it was set from inside the house." },
        },
      ],
      dialogueBeats: [
        { id: "tr_r1", characterId: "vera", text: "The auction closes at twelve whether the block is occupied or not. You can have the story, or you can have the night. The negative gets neither." },
        { id: "tr_r2", characterId: "agent", text: "…[the rain, keeping time]… Say it exactly: 'Lot 13 is a blank. Your buyer paid one dollar to be photographed buying nothing. The negative is with me — and so is the man who can swear it.' The projectionist counts, detective. He's been counting all night." },
        { id: "tr_r3", characterId: "jack", text: "Thirty-five percent, Vera. The same odds you took at the docks. The house remembers who you were." },
      ],
      choices: [
        {
          id: "tr_r_bluff",
          text: "Call it: Lot 13 is a blank, and Sid will swear. 35%.",
          targetSceneId: "tr_end_gold",
          attitudeTag: "Clever",
          chance: 35,
          consequences: { setFlags: ["tr_bluff_won"], meterChanges: [{ meter: "Clever", delta: 1 }] },
          failTargetSceneId: "tr_end_silver",
          failConsequences: { setFlags: ["tr_walked"], meterChanges: [{ meter: "Suspicion", delta: 1 }] },
          // The final gamble: 35%. A hit unwrites the auction and the negative
          // walks; a miss keeps the story but loses the film to the river.
        },
        {
          id: "tr_r_walk",
          text: "No dice. Walk with the story; let them have the can.",
          targetSceneId: "tr_end_silver",
          attitudeTag: "Sultry",
          consequences: { setFlags: ["tr_walked"] },
        },
      ],
    },

    {
      id: "tr_end_gold",
      title: "Ending — Gold: The Blank",
      nodeType: "cutscene",
      background: "gradient:linear-gradient(180deg,#000000 0%,#1a0d12 55%,#2e1a10 100%)",
      ambientAudio: "rain",
      particles: "fireflies",
      transition: "fade-black",
      transitionSpeed: 2.2,
      letterbox: true,
      choiceDelaySeconds: 4,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 45%",
        zoomDuration: 11,
        dimAmount: 0.35,
        lights: [{ x: 50, y: 40, color: "#e8b647", intensity: 0.9, size: 60, pulseSeconds: 2.4, pulseAmount: 0.35 }],
      },
      prose: "Sid steps out of the stairwell with a projectionist's ledger and a witness's voice, and the word 'blank' falls into the lobby like a struck iris.\n\nThe buyer's photographs don't develop into anything. Prosser closes the block at nine minutes to twelve, and the cans — all of them — go back to the vault that never had a catalogue.\n\nThe case closes in gold: the negative is evidence now, the midnight reel is the midnight reel, and the alley is just wet asphalt.\n\nOn the marquee light, one line, no signature:\\n\\n'Lot 13, sold — to the truth. — A.G.'",
      isEnding: true,
      endingData: { tier: "victory-gold", headline: "THE AUCTION, UNWRITTEN", recap: "You called the 35% with a projectionist's ledger. The block closed on a blank, the negative became evidence, and the syndicate paid a dollar to buy its own funeral seat." },
      choices: [],
      hotspots: [],
      dialogueBeats: [],
    },

    {
      id: "tr_end_silver",
      title: "Ending — Silver: The Story",
      nodeType: "cutscene",
      background: "gradient:linear-gradient(180deg,#000000 0%,#101018 55%,#1a2333 100%)",
      ambientAudio: "rain",
      particles: "drizzle",
      transition: "fade-black",
      transitionSpeed: 2.2,
      letterbox: true,
      choiceDelaySeconds: 4,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 45%",
        zoomDuration: 11,
        dimAmount: 0.4,
        lights: [{ x: 50, y: 40, color: "#2ad9d9", intensity: 0.8, size: 54, pulseSeconds: 2.8, pulseAmount: 0.3 }],
      },
      prose: "The dice don't land — or you don't throw them. Either way the can stays in the building and the building stays above the river.\n\nVera ships at dawn to nobody. Prosser keeps the smile and loses the ledger. The story runs: three paragraphs, one misspelling, no photographs.\n\nBut on the roof, the hatch is still open, and in the alley the payphone is still off the hook, and in the static, for one more reel:\\n\\n'They kept the can. They didn't keep the cut. I did. — A.G.'",
      isEnding: true,
      endingData: { tier: "victory-silver", headline: "THE STORY, KEPT", recap: "The bluff didn't land — you walked with the story and the negative went back into the vault. The static kept the only copy that mattered." },
      choices: [],
      hotspots: [],
      dialogueBeats: [],
    },

    {
      id: "tr_end_busted",
      title: "Ending — Busted",
      nodeType: "cutscene",
      background: "gradient:linear-gradient(180deg,#000000 0%,#1a0d12 55%,#2e0d14 100%)",
      ambientAudio: "tension",
      particles: "ash",
      transition: "fade-black",
      transitionSpeed: 2.4,
      letterbox: true,
      choiceDelaySeconds: 4,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 45%",
        zoomDuration: 9,
        dimAmount: 0.5,
        lights: [{ x: 50, y: 30, color: "#e23b4e", intensity: 0.9, size: 56, pulseSeconds: 1.6, pulseAmount: 0.45 }],
      },
      prose: "A face at the stage door, a hand raised at the wrong bid, a snagged splice in the amber light — one photograph each, and the frame is full.\n\nThe police get a nice clean complaint from a very generous theater: trespass, attempted theft of auction goods. The judge uses the word 'nitrate' the way other judges use the word 'problem.'\n\nBut the negative was never in evidence. Nobody can prove a can. And on the block, Friday week, Lot 13 comes up again — the same lie, a different room, and a voice in the house bell that sounds almost pleased:\\n\\n'They kept the light on for you, detective. — A.G.'",
      isEnding: true,
      endingData: { tier: "gameover", headline: "THE HOUSE WINS THE NITRATE", recap: "You spent your nerve on the wrong three doors — Heat hit the limit and the theater filed you away with the rest of its receipts. Lot 13 goes up again Friday." },
      choices: [],
      hotspots: [],
      dialogueBeats: [],
    },
  ],
};
