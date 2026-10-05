import type { Story } from "../types";

/**
 * INSPECTOR GADGET: THE CLOCKWORK CAPER — a Saturday-morning homage built as
 * a STUDIO BETA-TEST CASE. It is deliberately small (6 scenes, 3 endings) but
 * it walks the studio's main surfaces in one sitting, and it is the reference
 * case for the new 🔭 OUT-OF-REACH hotspot option:
 *
 *  🔭 OUT OF REACH (Hotspot.remote — the new option this case exercises)
 *   · "The tower clock" on the plaza stage is a LOOK zone drawn high on the
 *     clock tower, far above the walkable floor. `remote: true` means
 *     clicking it fires the action from wherever Gadget stands — he just
 *     turns to face it, no walk-up. The reticle sits ON the clock face
 *     instead of being clamped down to the pavement, and strolling under
 *     the tower never triggers it by accident.
 *   · It sets `ig_clock_stuck`, which gates the service door — proving a
 *     remote look can feed the same flag economy as any walked-to zone.
 *
 *  STAGE NODE (🚶 walkable plaza)
 *   · spawn / floor band / an obstacle (the fountain — walk around it)
 *   · look zone (wanted poster), take zone with showItemImage (the dropped
 *     M.A.D. gauntlet), startDialogue marker (Penny & Brain), and a GATED
 *     go zone (the service door: requiresFlags + requiresItems, with a
 *     customFailMessage) — every stage marker verb in one room.
 *
 *  CLASSIC SURFACES
 *   · dialogue beats with expressions, a beat gated on a flag (Quimby only
 *     mentions the clock if you already read the M.A.D. ransom note),
 *     a QUICK-TIME choice (GO-GO GADGET UMBRELLA — heartbeat + shaky cam +
 *     timeout branch with meter consequences), a Clever-gated deduction
 *     choice, attitude tags, flagNotes for the Flags tab, a briefing, and
 *     three endings (gold / silver / game-over).
 *
 * Art: /img/cover-inspector-gadget.jpg, /img/bg-ig-plaza.jpg,
 * /img/bg-ig-lair.jpg (all generated for this case); HQ reuses a gradient.
 */
export const INSPECTOR_GADGET: Story = {
  id: "inspector-gadget-clockwork",
  title: "Inspector Gadget: The Clockwork Caper",
  tagline: "The town clock stopped at 3:12. So did three armored cars. Go-Go Gadget… everything!",
  coverImage: "/img/cover-inspector-gadget.jpg",
  startSceneId: "ig_hq",
  layout: {
    ig_hq: { x: 0, y: 240 },
    ig_plaza: { x: 400, y: 240 },
    ig_lair: { x: 800, y: 240 },
    ig_scramble: { x: 1200, y: 480 },
    ig_end_gold: { x: 1200, y: 60 },
    ig_end_silver: { x: 1600, y: 300 },
    ig_end_bust: { x: 1600, y: 540 },
  },
  briefing: {
    objective:
      "Three armored cars vanished at exactly 3:12 — the same minute the plaza clock stopped. Find out what M.A.D. wants with the clock tower, and stop it.",
    winConditions: [
      "Spot what's wrong with the tower clock, find M.A.D.'s calling card, and get inside (gold ending).",
      "Lose the moment but salvage the arrest on the ground (silver ending).",
    ],
    loseConditions: ["Accuse the wrong culprit in the lair (game over)."],
  },
  flagNotes: {
    ig_read_note: "Read the M.A.D. ransom note at HQ — Quimby's clock beat is gated on it.",
    ig_clock_stuck: "Looked at the tower clock FROM THE PLAZA (🔭 remote hotspot) — hands stuck at 3:12, cameras face away. Gates the service door.",
    ig_read_poster: "Read the newsstand reward poster — pure flavour, shows a look zone that is NOT remote.",
    ig_found_gauntlet: "Picked the M.A.D. gauntlet up off the cobbles — the PROOF half of the service-door gate (the item does the gating; this flag paints Case Progress).",
    ig_met_penny: "Talked to Penny & Brain on the plaza (startDialogue marker).",
  },
  characters: [
    { id: "ig_quimby", name: "Chief Quimby", role: "Chief of Police", avatarUrl: "emoji:👮", trustMeter: 2 },
    { id: "ig_penny", name: "Penny", role: "Niece / actual detective", avatarUrl: "emoji:👧", trustMeter: 3 },
    { id: "ig_brain", name: "Brain", role: "Dog / undercover everything", avatarUrl: "emoji:🐕", trustMeter: 3 },
    { id: "ig_claw", name: "Dr. Claw", role: "M.A.D. mastermind (voice)", avatarUrl: "emoji:🐈‍⬛", trustMeter: -3 },
    { id: "ig_gadget", name: "Inspector Gadget", role: "Cyborg inspector", avatarUrl: "emoji:🕵️", trustMeter: 0 },
  ],
  items: [
    {
      id: "ig_gauntlet",
      name: "M.A.D. Gauntlet",
      icon: "🧤",
      description: "A single armored glove, dropped by the fountain. The knuckles are stamped M.A.D.",
      flavorText: "Whoever wears the other one is very confident, or very careless.",
      isClue: true,
    },
  ],
  scenes: [
    /* ---------------------------------------------------------------- */
    {
      id: "ig_hq",
      title: "Quimby's Briefing",
      background: "gradient:linear-gradient(160deg,#0b1626 0%,#12233a 55%,#070a12 100%)",
      ambientAudio: "tension",
      prose:
        "Metro City HQ, 8 a.m. Chief Quimby slides a folder across the desk with the resigned face of a man who has read it twice and believed it neither time. Three armored cars, gone without a tire mark — every dashboard clock in them frozen at 3:12.",
      dialogueBeats: [
        {
          id: "igb_hq1",
          characterId: "ig_quimby",
          expression: "grim",
          text: "Three cars, Gadget. Same minute, same street, same nothing on the cameras. M.A.D. left us exactly one thing — this note.",
        },
        {
          id: "igb_hq2",
          characterId: "ig_gadget",
          expression: "confident",
          text: "Don't worry, Chief! I always get my man. Wowsers — is this note ticking?",
        },
        {
          id: "igb_hq3",
          characterId: "ig_quimby",
          expression: "annoyed",
          conditionRule: { requiresFlags: ["ig_read_note"] },
          text: "You READ it, so I'll say it plainly: 'TIME IS MONEY, INSPECTOR.' Signed with a claw. Start at the plaza — and Gadget… look UP for once. The tower, Gadget. The tower.",
        },
      ],
      hotspots: [
        {
          id: "igh_note",
          label: "The M.A.D. note",
          bounds: { x: 40, y: 62, w: 20, h: 18 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            flagSet: "ig_read_note",
            text: "Magazine letters glued to card stock: 'TIME IS MONEY, INSPECTOR.' Below it, a claw drawn in red — and the paper smells faintly of clock oil.",
          },
        },
      ],
      choices: [
        {
          id: "igc_go_plaza",
          text: "This message will self-destruct — head to the plaza.",
          targetSceneId: "ig_plaza",
          attitudeTag: "Clever",
          consequences: { meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "ig_plaza",
      title: "Clock Tower Plaza",
      nodeType: "stage",
      note: "STAGE — the beta-test room. 🔭 'The tower clock' is the new OUT-OF-REACH hotspot: remote:true, look fires from anywhere on the floor, reticle stays on the clock face. Door is gated on the clock flag + the gauntlet.",
      background: "/img/bg-ig-plaza.jpg",
      ambientAudio: "jazz",
      prose: "",
      stage: {
        playerImage: "emoji:🕵️",
        spawn: { x: 12, y: 88 },
        speed: 16,
        reach: 5,
        hints: "proximity",
        floor: { top: 66, bottom: 94 },
        depthScale: 0.35,
        obstacles: [{ x: 28, y: 64, w: 24, h: 13 }],
        enterCaption: "Clock Tower Plaza. The hands up there say 3:12. Your watch disagrees, loudly.",
        // SCRIPTED SEQUENCE (SCUMM room-entry cutscene): plays ONCE — letterbox
        // bars drop, input locks, Brain trots up with a warning, then the
        // plaza is handed back to the player. `enterScriptFlag` is the
        // save-proof run-once latch; the setFlag step is story-visible proof
        // the cutscene ran (nothing gates on it, it's a demo breadcrumb).
        enterScript: [
          { do: "npcWalkTo", npcId: "npc_brain", x: 20, y: 88 },
          { do: "npcMotion", npcId: "npc_brain", facing: "left" },
          { do: "say", text: "Rrrf! Rrrrrf!", npcId: "npc_brain" },
          { do: "say", text: "Easy, boy. One mystery at a time — first, that clock." },
          { do: "npcWalkTo", npcId: "npc_brain", x: 34, y: 90 },
          { do: "setFlag", flag: "ig_brain_warned_me" },
        ],
        enterScriptFlag: "ig_plaza_intro_played",
        npcs: [
          {
            // Brain in his postman disguise — a SET-MOTION patrol: he does a
            // round of the plaza, pausing to "inspect" and mutter at each
            // stop. Ambient say-lines are SCUMM background chatter, not beats.
            id: "npc_brain",
            image: "emoji:🐕",
            x: 34,
            y: 90,
            scale: 0.9,
            patrol: [
              { x: 55, y: 86, pause: 3, facing: "left", say: "(Brain sniffs the dropped glove, then points at it with his whole body.)" },
              { x: 70, y: 78, pause: 2.5, say: "(He circles the newsstand like it owes him money.)" },
              { x: 34, y: 90, pause: 4, facing: "right", say: "(Rrrf. Which, translated, means: LOOK UP, INSPECTOR.)" },
            ],
            speed: 9,
          },
          {
            // A commuter crossing the square, pingpong — pure moving scenery.
            // Her far stop carries a WALK-AWAY SIZE (scale 0.55): the leg out
            // shrinks her into the distance, the leg back grows her again.
            id: "npc_commuter",
            image: "emoji:🚶‍♀️",
            x: 4,
            y: 72,
            scale: 0.85,
            patrolMode: "pingpong",
            patrol: [
              { x: 96, y: 70, pause: 6, scale: 0.55, say: "…late, late, LATE — that useless clock…" },
              { x: 4, y: 72, pause: 8 },
            ],
            speed: 7,
          },
        ],
      },
      dialogueBeats: [
        {
          id: "igb_pl1",
          characterId: "ig_penny",
          expression: "urgent",
          text: "Uncle Gadget! The armored cars all stalled the second the tower chimed — and the chime came four hours LATE. Somebody's using the clock as a signal.",
        },
        {
          id: "igb_pl2",
          characterId: "ig_brain",
          expression: "nervous",
          text: "(Brain, in a postman's hat nobody questions, points a paw straight up at the tower, then at the dropped glove by the fountain, then covers his eyes.)",
        },
        {
          id: "igb_pl3",
          characterId: "ig_penny",
          expression: "clever",
          text: "The service door behind the newsstand goes up the tower. If you can prove it's M.A.D. — that glove would do it — the super will HAVE to let you in.",
        },
      ],
      hotspots: [
        {
          id: "igh_clock",
          label: "The tower clock",
          bounds: { x: 14, y: 18, w: 15, h: 18 },
          cursor: "look",
          remote: true,
          isRepeatable: true,
          action: {
            type: "showText",
            flagSet: "ig_clock_stuck",
            text: "Eighty feet up — no ladder, and for once no Go-Go-Gadget legs required: squinting does the job. The hands are STUCK at 3:12, but the minute hand trembles like it's being held. And every security camera on the square has been turned to face AWAY from the tower.",
          },
        },
        {
          id: "igh_poster",
          label: "Newsstand poster",
          bounds: { x: 60, y: 40, w: 13, h: 26 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            flagSet: "ig_read_poster",
            text: "'REWARD — for information on the armored car disappearances. Contact Metro City P.D.' Someone has doodled a small claw in the corner. Recently. In red.",
          },
        },
        {
          id: "igh_gauntlet",
          label: "Dropped glove",
          bounds: { x: 47, y: 80, w: 8, h: 9 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "ig_gauntlet", flagSet: "ig_found_gauntlet" },
        },
        {
          id: "igh_penny",
          label: "Penny & Brain",
          bounds: { x: 2, y: 60, w: 9, h: 30 },
          cursor: "talk",
          action: { type: "startDialogue", flagSet: "ig_met_penny" },
        },
        {
          id: "igh_door",
          label: "Tower service door",
          bounds: { x: 84, y: 42, w: 13, h: 46 },
          cursor: "go",
          gating: { requiresFlags: ["ig_clock_stuck"], requiresItems: ["ig_gauntlet"] },
          customFailMessage:
            "The superintendent blocks the door. 'Closed for repairs.' You'll need a REASON (look at that clock — 🔭 you can see it from right here) and PROOF (M.A.D. leaves litter) before he steps aside.",
          action: { type: "goToScene", targetSceneId: "ig_lair" },
        },
      ],
      choices: [],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "ig_lair",
      title: "Top of the Tower",
      background: "/img/bg-ig-lair.jpg",
      ambientAudio: "drone",
      prose:
        "The stairs end in gears the size of carousel wheels — and a wall of monitors that has no business in a municipal clock tower. A high-backed chair faces the screens. On its armrest: the OTHER gauntlet, drumming its fingers.",
      dialogueBeats: [
        {
          id: "igb_l1",
          characterId: "ig_claw",
          expression: "smug",
          text: "Inspector Gadget. You're four hours late — or exactly on time, depending on whose clock we use. MINE, for instance, has been paying beautifully. Every time it 'chimes', another armored car forgets where it was going.",
        },
        {
          id: "igb_l2",
          characterId: "ig_gadget",
          expression: "confident",
          text: "Give it up, Claw! You're surrounded — by me, and by at least eleven of my more reliable attachments!",
        },
        {
          id: "igb_l3",
          characterId: "ig_claw",
          expression: "cold",
          text: "I'd love to stay and watch you malfunction, but my cat gets airsick. NEXT TIME, GADGET… — the chair swivels toward the shattered skylight, rotor blades already whining — …NEXT TIME!",
        },
      ],
      choices: [
        {
          id: "igc_umbrella",
          text: "GO-GO GADGET UMBRELLA — snag the chair before it lifts off!",
          quickTime: true,
          qtePrompt: "STOP THAT CHAIR!",
          timeLimitSeconds: 6,
          qteHeartbeat: true,
          qteShakyCam: true,
          rememberLine: "For once, the right gadget came out on the first try.",
          targetSceneId: "ig_end_gold",
          attitudeTag: "Aggressive",
          timedOutTargetSceneId: "ig_scramble",
          timedOutConsequences: { meterChanges: [{ meter: "Suspicion", delta: 2 }] },
        },
        {
          id: "igc_deduce",
          text: "Let him go — jam the clock mechanism so the 'chime' can never fire again.",
          targetSceneId: "ig_end_silver",
          attitudeTag: "Clever",
          gating: { minMeters: { Clever: 1 } },
        },
        {
          id: "igc_wrong",
          text: "Arrest the superintendent — he had the only key!",
          targetSceneId: "ig_end_bust",
          attitudeTag: "Aggressive",
        },
      ],
      hotspots: [],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "ig_scramble",
      title: "Wowsers.",
      background: "gradient:linear-gradient(160deg,#3a2a10 0%,#14141f 70%)",
      ambientAudio: "tension",
      prose:
        "The umbrella came out as a badminton racket. The chair is through the skylight and shrinking into the evening — but the clock mechanism is still here, still humming, still M.A.D.'s money machine (+2 Suspicion back at HQ for the mid-air racket incident).",
      choices: [
        { id: "igc_scr_jam", text: "Jam the mechanism. Claw escapes; the scheme doesn't.", targetSceneId: "ig_end_silver", attitudeTag: "Clever" },
        { id: "igc_scr_blame", text: "Storm downstairs and arrest the superintendent anyway.", targetSceneId: "ig_end_bust", attitudeTag: "Aggressive" },
      ],
      hotspots: [],
      dialogueBeats: [],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "ig_end_gold",
      title: "Case Closed — Gold",
      isEnding: true,
      background: "gradient:linear-gradient(135deg,#134e4a 0%,#1e3a8a 100%)",
      prose: "The umbrella hooked the chair's leg at the skylight. For once, gravity did the paperwork.",
      endingData: {
        tier: "victory-gold",
        headline: "TIME'S UP, DR. CLAW",
        recap:
          "The chair, the cat, and both gauntlets came down in the fountain. The clock runs on time, the armored cars remember where they were going, and Quimby has already stopped saying thank you. Penny and Brain solved most of it — but that stays in this recap.",
      },
      hotspots: [],
      dialogueBeats: [],
      choices: [],
    },
    {
      id: "ig_end_silver",
      title: "Case Closed — Silver",
      isEnding: true,
      background: "gradient:linear-gradient(135deg,#0c0c14 0%,#2b2b3f 100%)",
      prose: "The chair got away. The scheme didn't.",
      endingData: {
        tier: "victory-silver",
        headline: "THE CLOCK KEEPS HONEST TIME",
        recap:
          "With a wrench in its 'chime', the tower is just a tower again. Somewhere over the city line a voice swears NEXT TIME, GADGET — but the armored cars roll on schedule, and 3:12 is only a minute now.",
      },
      hotspots: [],
      dialogueBeats: [],
      choices: [],
    },
    {
      id: "ig_end_bust",
      title: "Case Closed — Bust",
      isEnding: true,
      background: "gradient:linear-gradient(135deg,#07070c 0%,#1f1420 100%)",
      prose: "The superintendent's lawyer enjoyed this immensely.",
      endingData: {
        tier: "gameover",
        headline: "WRONG MAN, WRONG TOWER",
        recap:
          "While you were reading the superintendent his rights, the real mechanism chimed twice more. Two more armored cars, gone. Quimby's next note to you self-destructed out of sheer frustration.",
      },
      hotspots: [],
      dialogueBeats: [],
      choices: [],
    },
  ],
};
