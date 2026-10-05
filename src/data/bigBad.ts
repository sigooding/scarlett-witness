import type { Story } from "../types";
import { applyCreditsPreset } from "../credits";

/**
 * THE BIG BAD — an original Wolf Among Us–style case.
 * ─────────────────────────────────────────────────
 * Detective Rufus Wolfe — once the wolf of the stories, now sheriff of the
 * Ward, a decaying 1986 district where exiled story-folk hide among humans
 * under a failing glamour — must solve the murder of the one landlord whose
 * brick building could not be broken, while every witness is already certain
 * the wolf did it.
 *
 * The theme runs on the engine's Telltale machinery:
 *   · memoryLog + recalls + {said} — what Wolfe says in Act One is quoted back
 *     in Act Three;
 *   · rememberLine — the "…will remember that" card on every trust swing;
 *   · conversation timers (timeLimitSeconds WITHOUT quickTime) — Ruby prices
 *     silence; a promise not made in ten seconds is a promise not made;
 *   · interruptibleDialogue — Cobb can be cut off mid-lie;
 *   · press-the-lie — Cobb's seal, broken by the Ward's own vial;
 *   · the corkboard — the ration, the flourish and the inward-torn hinge;
 *   · trust meters on Adaline and Ruby; Suspicion as the Ward's fear of Wolfe.
 *
 * Art: docs/big-bad-production-notes.md. Title/credits look is the neon-night
 * cold open; the wartime newsreel gate is explicitly out for this case.
 */
export const BIG_BAD: Story = {
  id: "big-bad",
  title: "The Big Bad",
  tagline: "Three landlords are dead. Everyone already knows who did it.",
  coverImage: "/img/cover-big-bad.jpg",
  gameKind: "noir-rail",
  startSceneId: "bb_title",

  briefing: {
    objective:
      "Solve the murder of Otto Bramley before the Ward decides it already has. Nobody in the Ward talks to a wolf — earn their words, keep your face, and put the truth on the corkboard.",
    winConditions: [
      "Name the Piper with the ledger and the hinge, in front of the Ward.",
      "Or bury the case cleanly and keep the Ward's secret a little longer.",
    ],
    loseConditions: [
      "Let the glamour fail while the Ward is watching.",
      "Owe the Piper anything at all.",
    ],
  },

  flagNotes: {
    saw_sign: "The bodega's sign has been dark a week. Shops stop lighting signs when they start paying someone else.",
    saw_shoe: "One small shoe in the alley mouth, adult-sized, placed neatly against the wall. Not dropped. Placed.",
    saw_doors: "All three hinges gone from the Bramley door, screws still threaded, splinters pointing inward.",
    saw_clocks: "Nine clocks, nine times — and the cheap one behind the counter set to the ration office's hours.",
    compared_hands: "Side by side there is no argument: one hand, two books, one thief.",
    refused_vial: "He left the vial on her desk. Some men hold their shape without help.",
    held_tongue: "He let the moment pass in the hallway. Hettie noticed the silence.",
    saw_safe: "The wall safe was opened, not broken — Otto knew whoever came.",
    saw_window: "The window was locked from the inside. Nothing left that way.",
    saw_flourish: "A pale careful flourish, repeating down one column of the ration book.",
    fell_dark: "He went down the subway steps in the dark. The Ward heard about it.",
    saw_line: "Borrowed faces on a drying line, still warm. Somebody in the Ward is wearing a second skin tonight.",
    saw_switch: "A sign does not go dark on its own in the Ward. Somebody owns the switch, and Somebody threw it.",
    saw_crates: "Three crates short of the manifest count, and the office smells of wash-water.",
    solly_clammed: "He pressed Solly too fast and the old man folded into silence. Silence buys nothing in the Ward.",
    traded: "He took the Piper's trade. Some doors stay shut for a price.",
    held_off: "He let the Piper's offer sit unanswered. Nobody in the Ward owes a thing he did not say yes to.",
  },

  characters: [
    {
      id: "wolfe", name: "Det. Rufus Wolfe", role: "Sheriff of the Ward",
      avatarUrl: "/img/ch-bb-wolfe.jpg", trustMeter: 0,
      talkingRest: "/img/ch-bb-wolfe.jpg",
      talkingFrames: ["/img/ch-bb-wolfe.jpg", "/img/ch-bb-wolfe-talk.jpg"],
      talkingFrameDuration: 0.18,
    },
    {
      id: "adaline", name: "Adaline Frost", role: "Deputy-Mayor of the Ward",
      avatarUrl: "/img/ch-bb-adaline.jpg", trustMeter: 0,
      talkingRest: "/img/ch-bb-adaline.jpg",
      talkingFrames: ["/img/ch-bb-adaline.jpg", "/img/ch-bb-adaline-talk.jpg"],
      talkingFrameDuration: 0.18,
    },
    {
      id: "ruby", name: "Ruby Vale", role: "The Crimson Hood",
      avatarUrl: "/img/ch-bb-ruby.jpg", trustMeter: 0,
      talkingRest: "/img/ch-bb-ruby.jpg",
      talkingFrames: ["/img/ch-bb-ruby.jpg", "/img/ch-bb-ruby-talk.jpg"],
      talkingFrameDuration: 0.16,
    },
    {
      id: "cobb", name: "Cobb Renny", role: "Fixer, fence, toad",
      avatarUrl: "/img/ch-bb-cobb.jpg", trustMeter: 0,
      talkingRest: "/img/ch-bb-cobb.jpg",
      talkingFrames: ["/img/ch-bb-cobb.jpg", "/img/ch-bb-cobb-talk.jpg"],
      talkingFrameDuration: 0.12,
    },
    {
      id: "hettie", name: "Mrs Hettie Bramble", role: "Matriarch of the Bramleys",
      avatarUrl: "/img/ch-bb-hettie.jpg", trustMeter: 0,
      talkingRest: "/img/ch-bb-hettie.jpg",
      talkingFrames: ["/img/ch-bb-hettie.jpg", "/img/ch-bb-hettie-talk.jpg"],
      talkingFrameDuration: 0.2,
    },
    {
      id: "solly", name: "Solly Marsh", role: "Bodega owner, the Ward's gossip",
      avatarUrl: "/img/ch-bb-solly.jpg", trustMeter: 0,
      talkingRest: "/img/ch-bb-solly.jpg",
      talkingFrames: ["/img/ch-bb-solly.jpg", "/img/ch-bb-solly-talk.jpg"],
      talkingFrameDuration: 0.17,
    },
    {
      id: "piper", name: "The Piper", role: "Collects what is owed",
      avatarUrl: "/img/ch-bb-piper.jpg", trustMeter: 0,
      talkingRest: "/img/ch-bb-piper.jpg",
      talkingFrames: ["/img/ch-bb-piper.jpg", "/img/ch-bb-piper-talk.jpg"],
      talkingFrameDuration: 0.22,
    },
  ],

  items: [
    { id: "vial", name: "A Vial of Ward Glamour", icon: "🧪", description: "Rationed. Sealed with the Ward's own wax — a seal no toad can forge.", flavorText: "It hums, very slightly, like a held breath." },
    { id: "hinge", name: "The Torn Hinge", icon: "🚪", description: "Iron hinge, screws still threaded, splinters pointing INWARD.", flavorText: "A door is only forced from the side that isn't expecting." },
    { id: "feather", name: "A White Feather", icon: "🪶", description: "Goose-down, on a brick floor four storeys up. Ward glamour is feather-light.", flavorText: "It weighs nothing. That is the point." },
    { id: "receipt", name: "A Rent Receipt", icon: "🧾", description: "Solly's own rent receipt for the bodega — signed for in the same pale careful flourish that audits the Ward's ration.", flavorText: "Paid in full. In the Ward, that is the suspicious part." },
    { id: "ledger", name: "Otto's Rent Ledger", icon: "📒", description: "Every tenant, every week, every arrears — and one column in a pale careful flourish.", flavorText: "Otto kept two books. This is the one that got him killed." },
  ],

  episodes: [
    {
      id: "bb_ep1", number: 1, title: "Brick", kicker: "The Big Bad",
      tagline: "The one building that could not be broken, was.",
      startSceneId: "bb_title",
      sceneIds: ["bb_title", "bb_street", "bb_hallway", "bb_flat", "bb_office"],
      titleCardImage: "/img/bg-bb-end-credits.jpg",
      posterImage: "/img/bg-bb-brickflat.jpg",
      titleCardSeconds: 2.6,
      nextTimeLines: [
        "A bar where the neon is the only honest thing.",
        "A toad with a seal he cannot forge.",
      ],
    },
    {
      id: "bb_ep2", number: 2, title: "The Hood", kicker: "The Big Bad",
      tagline: "Three names, three favours, and a seal that is wrong.",
      startSceneId: "bb_hood",
      sceneIds: ["bb_hood", "bb_bodega", "bb_laundry", "bb_pawnshop", "bb_ration"],
      titleCardImage: "/img/bg-bb-crimsonhood.jpg",
      posterImage: "/img/bg-bb-pawnshop.jpg",
      titleCardSeconds: 2.6,
      recapFromMemories: true,
      nextTimeLines: [
        "Two books, one flourish, and a ration gone short since winter.",
        "He collects what is owed. He is owed.",
      ],
    },
    {
      id: "bb_ep3", number: 3, title: "Paper", kicker: "The Big Bad",
      tagline: "The door was never forced. Someone was let in.",
      startSceneId: "bb_subway",
      sceneIds: [
        "bb_subway", "bb_ledgerroom", "bb_pipertunnel", "bb_face",
        "bb_end_gold", "bb_end_silver", "bb_end_cold", "bb_end_fear", "bb_end_debt",
      ],
      titleCardImage: "/img/bg-bb-ledgerroom.jpg",
      posterImage: "/img/bg-bb-pipertunnel.jpg",
      titleCardSeconds: 2.6,
      recapFromMemories: true,
    },
  ],

  deduction: {
    suspectIds: ["piper"],
    connections: [
      {
        a: "hinge", b: "piper", flagSet: "pin_hinge",
        revelation:
          "The hinge tore INWARD, screws still threaded. Nobody broke into Otto Bramley's brick — Otto opened his door to the thing that ate him.",
      },
      {
        a: "receipt", b: "piper", flagSet: "pin_receipt",
        revelation:
          "Solly's rent receipt, signed for in the pale flourish. The Piper does not collect money in the Ward — he collects the Ward's own paper, and pays his rent collectors in silence.",
      },
      {
        a: "ledger", b: "piper", flagSet: "pin_ledger",
        revelation:
          "Otto's second book: rent paid in full every week since winter, in a pale careful flourish — the same hand that signs the Ward's stolen glamour ration.",
      },
    ],
  },

  layout: {
    bb_title: { x: 40, y: 60 }, bb_bodega: { x: 950, y: 20 },
    bb_laundry: { x: 950, y: 430 }, bb_ration: { x: 1210, y: 430 },
    bb_street: { x: 40, y: 220 }, bb_hallway: { x: 300, y: 120 }, bb_flat: { x: 300, y: 320 },
    bb_office: { x: 560, y: 220 }, bb_hood: { x: 820, y: 120 }, bb_pawnshop: { x: 820, y: 320 },
    bb_subway: { x: 1080, y: 220 }, bb_ledgerroom: { x: 1340, y: 120 }, bb_pipertunnel: { x: 1340, y: 320 },
    bb_face: { x: 1600, y: 220 },
    bb_end_gold: { x: 1860, y: 60 }, bb_end_silver: { x: 1860, y: 160 }, bb_end_cold: { x: 1860, y: 260 },
    bb_end_fear: { x: 1860, y: 360 }, bb_end_debt: { x: 1860, y: 460 },
  },

  scenes: [
    /* ============================ COLD OPEN ================================= */
    {
      // The neon-night cold open: a failing-sign title sequence over hard-cut
      // stills of the Ward. A preset is a LOOK, never content — so the look
      // comes from CREDITS_PRESETS and the title, lines and montage stay ours.
      id: "bb_title",
      title: "Cold Open",
      nodeType: "credits",
      letterbox: true,
      background: "/img/bg-bb-end-credits.jpg",
      prose: "",
      credits: {
        ...applyCreditsPreset("neon-night", {
          title: "THE BIG BAD",
          subtitle: "Three landlords are dead. Everyone already knows who did it.",
          lines: [
            { role: "A case from the Ward", name: "Scarlet Reel Studio" },
            { role: "Starring", name: "Det. Rufus Wolfe, sheriff of the Ward" },
            { role: "Content note", name: "A murder investigated off-stage — no body is ever shown" },
          ],
        }),
        cardSeconds: 3,
        montage: [
          "/img/bg-bb-end-credits.jpg",
          "/img/bg-bb-street.jpg",
          "/img/bg-bb-crimsonhood.jpg",
          "/img/bg-bb-ward-aerial.jpg",
        ],
        montageSeconds: 4,
      },
      dialogueBeats: [],
      hotspots: [],
      choices: [
        { id: "bb_t_c_begin", text: "Step into the rain.", targetSceneId: "bb_street" },
      ],
    },

    /* ============================ ACT ONE — BRICK ============================ */
    {
      id: "bb_street",
      title: "The Ward, Rain",
      background: "/img/bg-bb-street.jpg",
      prose:
        "Rain comes down the Ward like it is trying to erase it. Somewhere above the bodega, a Bramley is dead in the one building in this district that was supposed to hold.",
      dialogueBeats: [
        { id: "bb_s_b1", characterId: "narrator", expression: "V.O.", text: "Twenty years since the stories let him go. Twenty years of wearing a face like a coat. Tonight the coat feels thin." },
        { id: "bb_s_b2", characterId: "wolfe", text: "Brick doesn't break. That was the whole point of brick." },
      ],
      hotspots: [
        {
          id: "bb_s_h_bodega", label: "The bodega's dead neon", bounds: { x: 6, y: 34, w: 20, h: 30 }, cursor: "look",
          isRepeatable: false,
          action: { type: "showText", text: "The sign has been dark a week. In the Ward, a shop stops lighting its sign when it starts paying someone else instead.", flagSet: "saw_sign" },
        },
        {
          id: "bb_s_h_alley", label: "The alley mouth", bounds: { x: 78, y: 40, w: 18, h: 34 }, cursor: "look",
          isRepeatable: false,
          action: { type: "showText", text: "Mud and ash and one small shoe, adult-sized, placed neatly against the wall. Not dropped. Placed.", flagSet: "saw_shoe" },
        },
        {
          id: "bb_s_h_tenement", label: "The Bramley tenement", bounds: { x: 40, y: 18, w: 24, h: 44 }, cursor: "look",
          isRepeatable: false,
          action: { type: "showText", text: "Four storeys of good red brick, the only honest building on the block. The fourth-floor window is dark, and the door below it stands open on its hinges. All of them.", flagSet: "saw_doors" },
        },
      ],
      choices: [
        {
          id: "bb_s_c_in", text: "Push into the tenement. The stair first, always the stair.",
          targetSceneId: "bb_hallway", attitudeTag: "Clever",
          consequences: { meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
      ],
    },

    {
      id: "bb_hallway",
      title: "The Bramley Hallway",
      background: "/img/bg-bb-hallway.jpg",
      prose:
        "A bare bulb. Peeling roses. Mrs Hettie Bramble stands in the middle of her hallway like a woman holding up the whole building by sheer refusal.",
      dialogueBeats: [
        { id: "bb_h_b1", characterId: "hettie", text: "I know that walk. I know that coat. You are your father's appetite in a cheap tie, and you will not cross my threshold." },
        { id: "bb_h_b2", characterId: "wolfe", text: "I'm the Ward's sheriff, Mrs Bramble. Otto was my case before he was your son." },
        {
          id: "bb_h_b_truth", characterId: "hettie", conditionRule: { requiresFlags: ["told_truth"] },
          recalls: { mem_truth: "She repeats it back, testing the weight of it: “{said}”. No one has told her a true thing in a week." },
          text: "A wolf that does not lie to me. My Otto kept his books the same way, and look what it bought him.",
        },
        {
          id: "bb_h_b_silent", characterId: "hettie", conditionRule: { requiresFlags: ["held_tongue"] },
          text: "Silence. Yes. You wolves are always loudest when you say nothing at all.",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "bb_h_c_badge", text: "Show her the Ward's badge, not your face.",
          reply: true, attitudeTag: "Neutral",
          consequences: { setFlags: ["showed_badge"], trustChanges: [{ characterId: "hettie", delta: 1 }] },
          memoryLog: "mem_badge",
        },
        {
          id: "bb_h_c_tenants", text: "Ask who Otto was afraid of. Gently.",
          reply: true, attitudeTag: "Clever", gating: { requiresFlags: ["showed_badge"] },
          consequences: { setFlags: ["asked_afraid"], trustChanges: [{ characterId: "hettie", delta: 1 }] },
          memoryLog: "mem_afraid",
        },
        {
          id: "bb_h_c_truth", text: "Tell her the truth: it looks like a wolf did this. It wasn't me.",
          reply: true, attitudeTag: "Aggressive",
          timeLimitSeconds: 9,
          consequences: { setFlags: ["told_truth"], trustChanges: [{ characterId: "hettie", delta: 2 }] },
          memoryLog: "mem_truth",
          rememberLine: "Hettie will remember that the wolf did not lie to her.",
          timedOutConsequences: { setFlags: ["held_tongue"], trustChanges: [{ characterId: "hettie", delta: -1 }] },
        },
        {
          id: "bb_h_c_up", text: "Take the stair to Otto's floor.",
          targetSceneId: "bb_flat", isRepeatable: true,
        },
      ],
    },

    {
      id: "bb_flat",
      title: "Otto's Brick Flat",
      background: "/img/bg-bb-brickflat.jpg",
      prose:
        "Fourth floor. Good brick, good lock, good hinges — and the door standing open like a mouth. Nothing in here was broken except the door, and the door was not broken from out here.",
      dialogueBeats: [
        { id: "bb_f_b1", characterId: "narrator", expression: "V.O.", text: "A safe opened, not cracked. A window locked from inside. A chair overturned by a man reaching for the door, not running from it." },
        { id: "bb_f_b_hinge", characterId: "narrator", expression: "V.O.", conditionRule: { requiresFlags: ["took_hinge"] }, background: "/img/insert-bb-hinge.jpg", text: "He turns the hinge in the lamplight. Screws still threaded. Splinters pointing INWARD. A door is only forced from the side that isn't expecting." },
      ],
      hotspots: [
        {
          id: "bb_f_h_hinge", label: "The torn hinge", bounds: { x: 8, y: 30, w: 16, h: 34 }, cursor: "take",
          isRepeatable: false,
          action: { type: "giveItem", itemGranted: "hinge", flagSet: "took_hinge" },
        },
        {
          id: "bb_f_h_safe", label: "The open wall safe", bounds: { x: 70, y: 26, w: 16, h: 22 }, cursor: "look",
          isRepeatable: false,
          action: { type: "showText", text: "The safe door swings on oiled hinges. No drill, no pry. Otto opened it himself — and handed over what was inside.", flagSet: "saw_safe" },
        },
        {
          id: "bb_f_h_feather", label: "A white feather on the boards", bounds: { x: 44, y: 74, w: 12, h: 12 }, cursor: "take",
          isRepeatable: false,
          action: { type: "giveItem", itemGranted: "feather" },
        },
        {
          id: "bb_f_h_window", label: "The locked window", bounds: { x: 40, y: 12, w: 20, h: 24 }, cursor: "look",
          isRepeatable: false,
          action: { type: "showText", text: "Latch down, sash painted shut for a decade. Whatever left this room left through the door — politely.", flagSet: "saw_window" },
        },
      ],
      choices: [
        {
          id: "bb_f_c_call", text: "Call the deputy-mayor. This is bigger than a murder.",
          targetSceneId: "bb_office", attitudeTag: "Clever",
          consequences: { meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
      ],
    },

    {
      id: "bb_office",
      title: "The Deputy-Mayor's Office",
      background: "/img/bg-bb-office-frost.jpg",
      prose:
        "Frost ferns creep across the municipal glass. Adaline Frost does not look up from the ration books. She has not looked up at anyone in weeks.",
      partBreak: "Part One — Brick",
      dialogueBeats: [
        { id: "bb_o_b1", characterId: "adaline", text: "Otto Bramley paid for a door that would hold, and it held — from the outside. You understand what I am saying, detective? Nothing attacked that flat. Something was admitted to it." },
        { id: "bb_o_b2", characterId: "adaline", text: "The Ward's glamour ration has run short since winter. I have audited it four times. The books balance. The books LIE." },
        { id: "bb_o_b_vial", characterId: "narrator", expression: "V.O.", conditionRule: { requiresFlags: ["took_vial"] }, background: "/img/insert-bb-vial.jpg", text: "The Ward's own wax on the seal, unbroken. Whatever he wears tonight, it will be the Ward's face and not his — and the Ward keeps receipts." },
        {
          id: "bb_o_b_ration", characterId: "adaline", conditionRule: { requiresFlags: ["asked_ration"] },
          recalls: { mem_ration: "She answers the question he actually asked: “{said}” — and for the first time, she looks at him." },
          text: "Who audits the ration? I do. Which is why whoever is stealing it has been stealing from under my own hand.",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "bb_o_c_ration", text: "Ask her, plainly: who audits the glamour ration?",
          reply: true, attitudeTag: "Clever",
          consequences: { setFlags: ["asked_ration"] },
          memoryLog: "mem_ration",
        },
        {
          id: "bb_o_c_vial", text: "Take the vial. Wear a borrowed face tonight.",
          reply: true, attitudeTag: "Neutral",
          timeLimitSeconds: 10,
          consequences: { setFlags: ["took_vial"], addItems: ["vial"], trustChanges: [{ characterId: "adaline", delta: -1 }] },
          memoryLog: "mem_vial",
          rememberLine: "Adaline will remember what the vial cost her to give.",
          timedOutConsequences: { setFlags: ["refused_vial"], trustChanges: [{ characterId: "adaline", delta: 1 }] },
        },
        {
          id: "bb_o_c_hood", text: "Go down to the Hood. Ruby hears everything twice.",
          targetSceneId: "bb_hood", isRepeatable: true,
        },
      ],
    },

    /* ============================ ACT TWO — THE HOOD ========================= */
    {
      id: "bb_hood",
      title: "The Crimson Hood",
      background: "/img/bg-bb-crimsonhood.jpg",
      prose:
        "Closing time at the Crimson Hood. Ruby Vale polishes a glass that is already clean, watching the door watch him.",
      interruptibleDialogue: true,
      dialogueBeats: [
        { id: "bb_r_b1", characterId: "ruby", text: "Sheriff. In my bar, in your own face, in this of all weeks. You must want something badly." },
        { id: "bb_r_b2", characterId: "ruby", text: "Three names cost three favours. That is the price of doing business with a wolf who pretends he isn't." },
        {
          id: "bb_r_b_promise", characterId: "ruby", conditionRule: { requiresFlags: ["promised_ledger"] },
          recalls: { mem_promise: "She holds his promise up to the light: “{said}.” Then she nods, once, and the bar exhales." },
          text: "The Piper's ledger, in my hand, before the snow holds. Then I will tell you who came up that street.",
        },
        {
          id: "bb_r_b_nopromise", characterId: "ruby", conditionRule: { requiresFlags: ["no_promise"] },
          text: "You let the moment pass without promising me anything. Careful, sheriff. Silence is the one currency the Piper also accepts.",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "bb_r_c_promise", text: "Promise her the Piper's ledger, whatever it takes.",
          reply: true, attitudeTag: "Sultry",
          timeLimitSeconds: 9,
          consequences: { setFlags: ["promised_ledger"], trustChanges: [{ characterId: "ruby", delta: 1 }] },
          memoryLog: "mem_promise",
          rememberLine: "Ruby will remember the promise, and the price.",
          timedOutConsequences: { setFlags: ["no_promise"], trustChanges: [{ characterId: "ruby", delta: -1 }] },
        },
        {
          id: "bb_r_c_night", text: "Ask about the night Otto died. Who came up the street?",
          reply: true, attitudeTag: "Clever", gating: { requiresFlags: ["promised_ledger"] },
          consequences: { setFlags: ["ruby_night"], trustChanges: [{ characterId: "ruby", delta: 1 }] },
          memoryLog: "mem_night",
        },
        {
          id: "bb_r_c_pawn", text: "Ask about the bodega. Solly's sign went dark a week ago.",
          targetSceneId: "bb_bodega", isRepeatable: true,
        },
      ],
    },

    {
      id: "bb_bodega",
      title: "The Bodega with the Dead Sign",
      background: "/img/bg-bb-bodega.jpg",
      prose:
        "Solly Marsh has kept this counter for forty years and lied for most of them, gently, the way a man keeps change. The dead sign hangs in the window like a verdict.",
      dialogueBeats: [
        { id: "bb_g_b1", characterId: "solly", text: "Sign's dead a week, sheriff. Bulb's fine. Wire's fine. It just stopped wanting to light — same as everybody else on this block." },
        {
          id: "bb_g_b_sign", characterId: "solly", conditionRule: { requiresFlags: ["saw_sign"] },
          text: "You stood out in the rain looking at my sign. Everybody looks, nobody asks. ASK. A man in a coat softer than yours came in and paid my rent. All of it. In advance. In paper I didn't write for.",
        },
        {
          id: "bb_g_b_waited", characterId: "solly", conditionRule: { requiresFlags: ["solly_talked"] },
          recalls: { mem_solly: "He shakes his head at it, almost admiring: “{said}.” Then he leans in, because the shop has ears." },
          text: "Forty years on this counter and a wolf out-silences me in my own shop. Fine. FINE. Follow the wash-water smell to the coin laundry — they wash what they steal down there, and the film on the water glows if you let it stand.",
        },
        {
          id: "bb_g_b_clammed", characterId: "solly", conditionRule: { requiresFlags: ["solly_clammed"] },
          text: "That's it, then. We're done. Come back when you've learned patience — it's the only thing this district still sells cheap.",
        },
      ],
      hotspots: [
        {
          id: "bb_g_h_sign", label: "The dead sign, from inside", bounds: { x: 10, y: 14, w: 22, h: 34 }, cursor: "look",
          isRepeatable: false,
          action: { type: "showText", text: "From inside, the tubing is a dead white worm in the glass. A sign does not go dark on its own in the Ward. It is SWITCHED off — by whoever owns the switch.", flagSet: "saw_switch" },
        },
      ],
      choices: [
        {
          // The silence branch: wait him out and Solly talks; press him and the
          // old man folds. Both outcomes are consequences, so the clock is real.
          id: "bb_g_c_wait", text: "Wait him out. Let the silence do the asking.",
          reply: true, attitudeTag: "Clever",
          timeLimitSeconds: 10,
          consequences: { setFlags: ["solly_talked"], trustChanges: [{ characterId: "solly", delta: 1 }] },
          memoryLog: "mem_solly",
          rememberLine: "Solly will remember that the wolf could out-silence him.",
          timedOutConsequences: { setFlags: ["solly_clammed"], trustChanges: [{ characterId: "solly", delta: -1 }] },
        },
        {
          id: "bb_g_c_receipt", text: "Ask for his rent receipt. Every shop in the Ward has one now.",
          reply: true, attitudeTag: "Clever", gating: { requiresFlags: ["solly_talked"] },
          consequences: { addItems: ["receipt"], trustChanges: [{ characterId: "solly", delta: 1 }] },
          memoryLog: "mem_receipt",
        },
        {
          id: "bb_g_c_laundry", text: "Follow the wash-water smell to the coin laundry.",
          targetSceneId: "bb_laundry", isRepeatable: true,
        },
      ],
    },

    {
      id: "bb_laundry",
      title: "The Coin Laundry",
      background: "/img/bg-bb-laundry.jpg",
      prose:
        "The coin laundry has not taken a coin in a year. The machines run anyway, and the air is sweet in a way rain never is.",
      dialogueBeats: [
        { id: "bb_w_b1", characterId: "narrator", expression: "V.O.", text: "Zinc tubs, a wringer mangle, and a drying line of pale cloths cut in the shape of faces. Borrowed skins, hung to dry." },
        { id: "bb_w_b2", characterId: "wolfe", text: "Somebody is washing glamour. You can smell it — like rain on a hot street, only sweeter." },
        {
          id: "bb_w_b_solly", characterId: "narrator", expression: "V.O.", conditionRule: { requiresFlags: ["solly_talked"] },
          recalls: { mem_solly: "Solly's voice follows him in off the counter: “{said}.” He was right about the film." },
          text: "He lets the wash-water stand. A film rises on it, thin as breath, throwing pink and green in the fluorescent light — exactly as the old man said it would.",
        },
      ],
      hotspots: [
        {
          id: "bb_w_h_tubs", label: "The standing wash-water", bounds: { x: 60, y: 56, w: 34, h: 34 }, cursor: "look",
          isRepeatable: false,
          action: { type: "showText", text: "Let the wash-water stand and a film rises on it, thin as breath, throwing pink and green in the fluorescent light. Glamour, washed out of whatever it was stolen from.", flagSet: "saw_film" },
        },
        {
          id: "bb_w_h_line", label: "The drying line", bounds: { x: 4, y: 4, w: 60, h: 30 }, cursor: "look",
          isRepeatable: false,
          action: { type: "showText", text: "A line of pale cloths cut in the shape of faces, dripping slowly. One of them is still warm. Somebody in the Ward is wearing a second skin tonight.", flagSet: "saw_line" },
        },
        {
          id: "bb_w_h_mangle", label: "The wringer mangle", bounds: { x: 4, y: 44, w: 16, h: 36 }, cursor: "look",
          isRepeatable: false,
          action: { type: "showText", text: "The mangle is clean except for one corner, where goose-down is caught in the rollers. Ward glamour is feather-light. So is what is left of it." },
        },
      ],
      choices: [
        {
          id: "bb_w_c_pawn", text: "The crates down here smell like Cobb's back room. Take the service stair to the pawnshop.",
          targetSceneId: "bb_pawnshop", isRepeatable: true,
        },
      ],
    },

    {
      id: "bb_pawnshop",
      title: "Cobb Renny's Pawnshop",
      background: "/img/bg-bb-pawnshop.jpg",
      prose:
        "Every clock in Cobb Renny's shop tells a different time, which is how he accounts for being several places he wasn't.",
      dialogueBeats: [
        { id: "bb_c_b1", characterId: "cobb", text: "Sheriff! Wolfe! Friend! I heard about the Bramley, terrible, the whole block is sick, my vials are the only thing keeping this district on its feet—" },
        {
          id: "bb_c_b_lie", characterId: "cobb",
          text: "And my glamour is TRUE Ward glamour, sealed and warranted, I buy my stock from the ration office itself, ask anyone, ask the deputy-mayor!",
          lie: {
            claim: "“My vials are true Ward glamour, sealed and warranted.”",
            evidenceItemIds: ["vial"],
            contradictedFlag: "cobb_caught",
            caughtBeat: {
              id: "bb_c_b_caught", characterId: "cobb",
              text: "That seal— that's the ration office wax, that's HER hand, you wouldn't— alright! ALRIGHT. My stock comes up out of the tunnels, sealed by a man who plays a pipe, and I do not ask his name and I do not ask what's in the crates!",
            },
            contradictedConsequences: { setFlags: ["cobb_caught"], trustChanges: [{ characterId: "cobb", delta: -2 }], meterChanges: [{ meter: "Suspicion", delta: -1 }] },
            wrongBeat: { id: "bb_c_b_wrong", characterId: "cobb", text: "Oh, very good, very official, that's a CANDLE STUB, sheriff, you're holding a candle stub at a professional." },
            wrongEvidenceLimit: 2,
            wrongConsequences: { meterChanges: [{ meter: "Suspicion", delta: 1 }], trustChanges: [{ characterId: "cobb", delta: -1 }] },
          },
        },
        {
          id: "bb_c_b_caughtgate", characterId: "cobb", conditionRule: { requiresFlags: ["cobb_caught"] },
          text: "The tunnels, alright? The old platform past the subway mouth. He pays in rent books, sheriff. He pays people in their OWN rent books.",
        },
      ],
      hotspots: [
        {
          id: "bb_c_h_clocks", label: "The lying clocks", bounds: { x: 62, y: 14, w: 26, h: 34 }, cursor: "look",
          isRepeatable: false,
          action: { type: "showText", text: "Nine clocks, nine times. One of them — the cheap one, behind the counter — is set to the ration office's hours.", flagSet: "saw_clocks" },
        },
      ],
      choices: [
        {
          id: "bb_c_c_press", text: "Hold up the Ward's own vial and let the seal do the talking.",
          reply: true, attitudeTag: "Aggressive", gating: { requiresItems: ["vial"] },
        },
        {
          id: "bb_c_c_subway", text: "One clock in this shop keeps honest hours — the ration office's. Go see that office.",
          targetSceneId: "bb_ration", isRepeatable: true,
        },
      ],
    },

    {
      id: "bb_ration",
      title: "The Glamour Ration Office",
      background: "/img/bg-bb-ration.jpg",
      prose:
        "The ration office after hours: a green lamp, a sign-out book weighted with a brass rule, and three crates fewer than the manifest says there should be.",
      partBreak: "Part Two — The Hood",
      dialogueBeats: [
        { id: "bb_ra_b1", characterId: "narrator", expression: "V.O.", text: "Four audits and the books balanced. Standing in the room, he can hear why: the theft is not in the totals. It never was." },
        {
          id: "bb_ra_b_film", characterId: "narrator", expression: "V.O.", conditionRule: { requiresFlags: ["saw_film"] },
          text: "The wash-water smell is here too — on the crates, under the wax. What is stolen gets washed, what is washed gets crated, and what is crated walks out of the Ward in rent-shaped payments.",
        },
        {
          id: "bb_ra_b_clock", characterId: "wolfe", conditionRule: { requiresFlags: ["saw_clocks"] },
          text: "Cobb's cheap clock keeps these hours. The toad signed out on the office's time without ever standing in this room.",
        },
        {
          id: "bb_ra_b_book", characterId: "narrator", expression: "V.O.", conditionRule: { requiresFlags: ["saw_book"] }, background: "/img/insert-bb-ration-book.jpg",
          text: "The sign-out book, open at winter. Column after column of dashes and ticks — and down one column, over and over, the same pale careful flourish.",
        },
      ],
      hotspots: [
        {
          id: "bb_ra_h_book", label: "The sign-out book", bounds: { x: 72, y: 56, w: 26, h: 26 }, cursor: "look",
          isRepeatable: false,
          action: { type: "showText", text: "Nobody has signed the book OUT since winter. Somebody has been signing it IN — rent, week after week, in a hand that is not the Ward's.", flagSet: "saw_book" },
        },
        {
          id: "bb_ra_h_crates", label: "The short count of crates", bounds: { x: 20, y: 24, w: 28, h: 44 }, cursor: "look",
          isRepeatable: false,
          action: { type: "showText", text: "Three crates fewer than the manifest. The gaps in the shelving are dust-free. Whatever walked out, walked out recently — and it smelled of wash-water.", flagSet: "saw_crates" },
        },
        {
          id: "bb_ra_h_clock", label: "The office clock", bounds: { x: 82, y: 12, w: 12, h: 18 }, cursor: "look",
          isRepeatable: false,
          action: { type: "showText", text: "The only honest clock in the Ward: it keeps the office's hours, which is exactly how the cheap twin behind Cobb's counter gave him away." },
        },
      ],
      choices: [
        {
          id: "bb_ra_c_down", text: "Behind the office, past the crates: the tunnel mouth. The pipe-song is coming up the steps.",
          targetSceneId: "bb_subway", isRepeatable: true,
        },
      ],
    },

    {
      id: "bb_subway",
      title: "The Subway Mouth",
      background: "/img/bg-bb-subway.jpg",
      prose:
        "Behind him the ration office's green lamp still burns. Ahead, the steps go down into a black that swallows the streetlight whole — and from below, very faintly, something is playing a tune on pipes.",
      dialogueBeats: [
        {
          id: "bb_u_b_ruby", characterId: "narrator", expression: "V.O.", conditionRule: { requiresFlags: ["ruby_night"] },
          recalls: { mem_night: "Ruby's words come back down the steps with him: “{said}”." },
          text: "Nobody walked up that street after midnight. Nobody WALKED.",
        },
        { id: "bb_u_b1", characterId: "wolfe", text: "The rail is ice. The dark is total. The tune is getting closer." },
      ],
      hotspots: [],
      choices: [
        {
          id: "bb_u_c_rail", text: "Take the steps fast, before the tune finds its rhythm.",
          targetSceneId: "bb_ledgerroom", attitudeTag: "Aggressive",
          quickTime: true, timeLimitSeconds: 6, qtePrompt: "THE RAIL — CATCH IT",
          timedOutConsequences: { setFlags: ["fell_dark"], meterChanges: [{ meter: "Suspicion", delta: 1 }] },
        },
        {
          id: "bb_u_c_slow", text: "Go down slow and quiet, hand on the wall.",
          targetSceneId: "bb_ledgerroom", attitudeTag: "Clever",
          consequences: { meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
      ],
    },

    /* ============================ ACT THREE — PAPER ========================== */
    {
      id: "bb_ledgerroom",
      title: "The Records Room",
      background: "/img/bg-bb-ledgerroom.jpg",
      prose:
        "The Ward's memory, shelf on shelf on shelf. Somewhere in here is the hand that has been signing the ration away — and Otto's own second book, pulled from the shelf where he hid it.",
      dialogueBeats: [
        {
          id: "bb_l_b_ration", characterId: "narrator", expression: "V.O.", conditionRule: { requiresFlags: ["asked_ration"] },
          text: "She audited it four times and the books balanced. Standing in the ration column now, he can see why: the theft is not in the totals. It is in the handwriting.",
        },
        { id: "bb_l_b1", characterId: "wolfe", text: "Two books. One for the tenants, one for him. Otto knew exactly what he was paying for." },
        { id: "bb_l_b_book", characterId: "narrator", expression: "V.O.", conditionRule: { requiresFlags: ["took_ledger"] }, background: "/img/insert-bb-ledger.jpg", text: "Otto's second book, open at the winter column. Rent paid in full, every week, in a hand that is not Otto's — pale, careful, and very sure of itself." },
      ],
      hotspots: [
        {
          id: "bb_l_h_ledger", label: "Otto's hidden second book", bounds: { x: 30, y: 40, w: 16, h: 26 }, cursor: "take",
          isRepeatable: false,
          action: { type: "giveItem", itemGranted: "ledger", flagSet: "took_ledger" },
        },
        {
          id: "bb_l_h_column", label: "The ration column", bounds: { x: 62, y: 30, w: 18, h: 30 }, cursor: "look",
          isRepeatable: false,
          action: { type: "showText", text: "Week after week since winter, the ration signed out in a pale careful flourish — the same flourish that repeats down one column of Otto's own book.", flagSet: "saw_flourish" },
        },
        {
          id: "bb_l_h_insert", label: "Compare the two hands", bounds: { x: 44, y: 62, w: 14, h: 18 }, cursor: "look",
          isRepeatable: false, gating: { requiresItems: ["ledger"] },
          action: { type: "showText", text: "Side by side there is no argument: one hand, two books, one thief. The Ward's glamour has been walking out of the Ward in rent-shaped payments.", flagSet: "compared_hands" },
        },
      ],
      choices: [
        {
          id: "bb_l_c_board", text: "Put it on the corkboard. The hinge, the ledger, the flourish — all of it, pinned.",
          reply: true, attitudeTag: "Clever", gating: { requiresItems: ["ledger", "hinge"] },
          consequences: { setFlags: ["board_ready"], meterChanges: [{ meter: "Clever", delta: 2 }] },
          rememberLine: "The Ward will remember that he built the case instead of the story.",
          memoryLog: "mem_board",
        },
        {
          id: "bb_l_c_down", text: "Follow the pipe-song down to the platform.",
          targetSceneId: "bb_pipertunnel", isRepeatable: true,
        },
      ],
    },

    {
      id: "bb_pipertunnel",
      title: "The Piper's Platform",
      background: "/img/bg-bb-pipertunnel.jpg",
      prose:
        "An abandoned platform, candlelit. A throne of rusted pipes. And along the edge, row on row, hundreds of small shoes — each one placed, not dropped.",
      dialogueBeats: [
        { id: "bb_p_b1", characterId: "piper", text: "Sheriff. Do mind the shoes. Every one of them is a debt settled, and I am a great believer in settling." },
        { id: "bb_p_b2", characterId: "piper", text: "Otto owed. Otto paid, in rent books and in silence, and then Otto grew conscientious — which is, in my experience, the most expensive of the virtues." },
        { id: "bb_p_b3", characterId: "piper", text: "So. The ledger for your silence. Or your face, your true face, in front of your precious Ward — and we both know what they do to wolves there." },
      ],
      hotspots: [],
      choices: [
        {
          id: "bb_p_c_feather", text: "Hold up the white feather — the Ward's own sign, and his own receipt.",
          reply: true, attitudeTag: "Clever", gating: { requiresItems: ["feather"] },
          presentItem: "feather",
          consequences: { setFlags: ["showed_feather"], meterChanges: [{ meter: "Clever", delta: 1 }] },
          memoryLog: "mem_feather",
          rememberLine: "The Piper will remember that the wolf held up his receipt.",
        },
        {
          // A clock with real teeth: take the trade inside twelve seconds and the
          // case ends in the Piper's favour; let it run out and he keeps his
          // freedom — and the Ward keeps its ledger.
          id: "bb_p_c_trade", text: "Take the trade. The ledger for your silence.",
          reply: true, attitudeTag: "Sultry",
          quickTime: true, timeLimitSeconds: 12, qtePrompt: "HE EXTENDS THE LEDGER — TAKE IT",
          targetSceneId: "bb_end_debt",
          consequences: { setFlags: ["traded"] },
          rememberLine: "The Ward will never know what he traded away.",
          memoryLog: "mem_trade",
          timedOutConsequences: { setFlags: ["held_off"], meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
        {
          id: "bb_p_c_name", text: "Name him. Here. Now. With the board behind it.",
          reply: true, attitudeTag: "Aggressive", gating: { requiresFlags: ["board_ready"] },
          consequences: { setFlags: ["named_him"], trustChanges: [{ characterId: "adaline", delta: 1 }, { characterId: "ruby", delta: 1 }] },
          memoryLog: "mem_named",
          rememberLine: "The Ward will remember the night the wolf named the Piper.",
        },
        {
          id: "bb_p_c_up", text: "Back up the stairs. This ends in daylight, in front of everyone.",
          targetSceneId: "bb_face", isRepeatable: true,
        },
      ],
    },

    {
      id: "bb_face",
      title: "First Light",
      background: "/img/bg-bb-roof-dawn.jpg",
      prose:
        "Dawn over the Ward's roofs, rain clearing. Below, in the courtyard, the whole district is already gathering — because in the Ward, news travels faster than light and weighs more.",
      partBreak: "Part Three — Paper",
      dialogueBeats: [
        { id: "bb_fa_b1", characterId: "narrator", expression: "V.O.", text: "One last choice, and it is not about the case. It is about the face he wears into it." },
        {
          id: "bb_fa_b_refused", characterId: "narrator", expression: "V.O.", conditionRule: { requiresFlags: ["refused_vial"] },
          text: "He left the vial on Adaline's desk. Whatever happens in this courtyard happens in his own face — which was always the braver arithmetic.",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "bb_fa_c_own", text: "Do it in your own face. Let them see the wolf tell the truth.",
          targetSceneId: "bb_end_gold", attitudeTag: "Aggressive", gating: { requiresFlags: ["named_him"] },
        },
        {
          id: "bb_fa_c_glam", text: "Do it behind the glamour. Hold it steady while you name him.",
          targetSceneId: "bb_end_silver", attitudeTag: "Clever", gating: { requiresItems: ["vial"], requiresFlags: ["took_vial"] },
          quickTime: true, timeLimitSeconds: 8, qtePrompt: "HOLD THE GLAMOUR STEADY",
          timedOutTargetSceneId: "bb_end_fear",
          timedOutConsequences: { meterChanges: [{ meter: "Suspicion", delta: 2 }] },
        },
        {
          id: "bb_fa_c_fall", text: "Take the fall yourself. Close the case on the wolf, and keep their secret safe.",
          targetSceneId: "bb_end_cold", attitudeTag: "Neutral",
        },
      ],
    },

    /* ================================ ENDINGS ================================ */
    {
      id: "bb_end_gold", title: "In His Own Face", background: "/img/bg-bb-end-gold.jpg",
      prose: "", isEnding: true, dialogueBeats: [], hotspots: [], choices: [],
      endingData: {
        tier: "victory-gold", headline: "The Wolf Told the Truth",
        recap:
          "He named the Piper with the ledger and the hinge, in his own face, in front of the Ward — and nobody ran. The glamour ration goes back to the Ward; the shoes on the platform go back to their owners' doors. Mrs Bramble leaves her hallway door open now. Only a crack. It is enough.",
      },
    },
    {
      id: "bb_end_silver", title: "Behind the Glamour", background: "/img/bg-bb-end-silver.jpg",
      prose: "", isEnding: true, dialogueBeats: [], hotspots: [], choices: [],
      endingData: {
        tier: "victory-silver", headline: "The Case Closes Quietly",
        recap:
          "The Piper walks on a technicality and Adaline buries the ledger deep in a drawer that locks. The Ward is a little safer and a little more afraid, and nobody ever learns what the borrowed face cost the man wearing it. The frost on her window melts by spring. The books still balance.",
      },
    },
    {
      id: "bb_end_cold", title: "The Only Suspect", background: "/img/bg-bb-end-cold.jpg",
      prose: "", isEnding: true, dialogueBeats: [], hotspots: [], choices: [],
      endingData: {
        tier: "victory-silver", headline: "He Took the Fall",
        recap:
          "The case closes on the only suspect everyone already believed, and the Ward sleeps easier for it. He lets them lead him past the bodega in the rain without correcting a single word. Somewhere below the street, a pipe plays a satisfied little tune — and stops, disappointed, when the Ward does not turn on itself after all.",
      },
    },
    {
      id: "bb_end_fear", title: "The Glamour Fails", background: "/img/bg-bb-end-fear.jpg",
      prose: "", isEnding: true, dialogueBeats: [], hotspots: [], choices: [],
      endingData: {
        tier: "gameover", headline: "Every Door Opens a Crack",
        recap:
          "The vial gives out mid-sentence, in front of everyone, and the wolf stands in the courtyard with his shadow rearing on the brick. The Ward does not forgive being afraid. He gets out of the district alive, which is more than most stories manage — and less than he will ever forgive himself.",
      },
    },
    {
      id: "bb_end_debt", title: "What Is Owed", background: "/img/bg-bb-end-debt.jpg",
      prose: "", isEnding: true, dialogueBeats: [], hotspots: [], choices: [],
      endingData: {
        tier: "gameover", headline: "The Piper Collects",
        recap:
          "He took the trade, and the Piper is a great believer in settling. The ledger burns; the ration stays stolen; and on the platform, at the end of a row of hundreds, there is one fresh shoe, adult-sized, placed neatly — not dropped. Debts, in the Ward, are inherited.",
      },
    },
  ],
};
