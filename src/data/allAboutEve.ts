import type { Story } from "../types";

/* ────────────────────────────────────────────────────────────────────
 *  BUMPY NIGHT — an All About Eve pastiche, and the video-plate demo.
 *
 *  What this story exists to beta-test:
 *  - scene.background = "video:<url>" — the driving scene plays over a
 *    real video plate (night highway over the bridge), with a painted
 *    front-view car sprite as an animated foreground extra: the classic
 *    1950 rear-projection driving shot.
 *  - NON-pixel sprite sheets end to end — Margo and Eve's talking
 *    portraits and the car judder sheet are painted art (pixelated:
 *    false), the same kind of asset the Media tab's ✂ Sprite Cutout Lab
 *    produces.
 *  - press-the-lie — Eve's war-widow story folds to the wire from the
 *    Curran Theatre, San Francisco.
 * ──────────────────────────────────────────────────────────────────── */

export const BUMPY_NIGHT: Story = {
  id: "bumpy-night",
  title: "Bumpy Night",
  tagline:
    "The girl in the trench coat says she's your biggest admirer. Fasten your seatbelt — and check her story against the wire in your glove.",
  coverImage: "/img/cover-alleve.jpg",
  startSceneId: "av_dressing",
  layout: {
    av_dressing: { x: 40, y: 220 },
    av_party: { x: 420, y: 100 },
    av_drive: { x: 800, y: 220 },
    av_stalled: { x: 1180, y: 100 },
    av_confront: { x: 1560, y: 220 },
    av_end_cold: { x: 1940, y: 400 },
    av_end_silver: { x: 1940, y: 220 },
    av_end_gold: { x: 1940, y: 40 },
  },
  briefing: {
    objective:
      "You are Margo Channing, first lady of Broadway — and the quiet girl you took in is quietly taking everything. Prove who Eve Harrington really is before she stands up at the Sarah Siddons banquet.",
    winConditions: [
      "Pocket Addison's wire from San Francisco at the party.",
      "Press Eve's war-widow story with the wire and put the truth on the record.",
    ],
    loseConditions: ["Say nothing, and applaud."],
  },
  flagNotes: {
    av_suspicion: "You said the seatbelt line out loud. The whole party knows you smell smoke.",
    av_karen_confessed: "Karen admits she drained the tank — the stalled car was staged so Eve could go on for you.",
    av_eve_lie_broken: "The Curran Theatre wire killed Eve's San Francisco story in front of witnesses.",
  },
  items: [
    {
      id: "av_wire",
      name: "Wire from the Curran Theatre",
      icon: "📜",
      description:
        "Western Union, San Francisco: 'RE HARRINGTON QUERY — NO RECORD ANY MRS EDDIE HARRINGTON AT STAGE DOOR ANY WEEK OF RUN. NO EDDIE HARRINGTON ANY CASUALTY LIST WE CAN FIND. REGARDS.'",
      flavorText: "Addison DeWitt checks everything. It's the closest thing he has to a heart.",
    },
  ],
  characters: [
    { id: "narrator", name: "Narrator", role: "V.O.", avatarUrl: "emoji:🎙", trustMeter: 0 },
    {
      id: "av_margo",
      name: "Margo Channing",
      role: "First Lady of Broadway",
      avatarUrl: "/img/ch-av-margo.jpg",
      trustMeter: 1,
      voice: { pitch: 0.95, rate: 0.92 },
      // Painted (NON-pixel) talking sheet — frames: 0 open, 1 mid-word,
      // 2 closed/wry. Rest holds the wry frame.
      talkingSheet: {
        image: "/assets/sprites/av-margo-talk.png",
        frameWidth: 258,
        frameHeight: 384,
        animations: {
          rest: { frames: [2] },
          talk: { frames: [0, 1, 2, 1], fps: 7 },
        },
        pixelated: false,
      },
      talkingX: 22,
      talkingScale: 1.04,
    },
    {
      id: "av_eve",
      name: "Eve Harrington",
      role: "Her Biggest Admirer",
      avatarUrl: "/img/ch-av-eve.jpg",
      trustMeter: -1,
      voice: { pitch: 1.12, rate: 0.98 },
      talkingSheet: {
        image: "/assets/sprites/av-eve-talk.png",
        frameWidth: 228,
        frameHeight: 384,
        animations: {
          rest: { frames: [2] },
          talk: { frames: [0, 1, 2, 1], fps: 7 },
        },
        pixelated: false,
      },
      talkingX: 78,
      talkingScale: 1.02,
    },
    {
      id: "av_karen",
      name: "Karen Richards",
      role: "The Playwright's Wife",
      avatarUrl: "emoji:🧣",
      trustMeter: 2,
      voice: { pitch: 1.02, rate: 0.95 },
    },
    {
      id: "av_addison",
      name: "Addison DeWitt",
      role: "Critic & Connoisseur of Careers",
      avatarUrl: "emoji:🖋",
      trustMeter: 0,
      voice: { pitch: 0.78, rate: 0.88 },
    },
  ],
  scenes: [
    /* ── 1 · THE DRESSING ROOM — enter the admirer ─────────────────── */
    {
      id: "av_dressing",
      title: "Dressing Room, The Curtain Down",
      background: "/img/bg-dressing.jpg",
      ambientAudio: "rain",
      prose:
        "Cold cream, cigarette smoke, and the roar of a house you just emptied. Karen slips through the door with a girl in a wet trench coat — a mouse with the eyes of a first-nighter. She's seen every performance, Karen says. Every one.",
      dialogueBeats: [
        {
          id: "av_dr_karen",
          characterId: "av_karen",
          text: "Margo, this is Eve Harrington. She's been standing at that stage door every night, rain or no rain. I couldn't just leave her there.",
        },
        {
          id: "av_dr_eve",
          characterId: "av_eve",
          text: "I know it's terribly rude, barging in like this. It's only that — seeing you on that stage is the nearest thing to being alive I know. I'd sweep your floors to stay near it.",
        },
        {
          id: "av_dr_margo",
          characterId: "av_margo",
          text: "Well. Either you're the saddest little sparrow ever blown in off Forty-Fourth Street, or the best actress in this room. Sit down, both of you — I'll decide over a drink.",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "av_dr_take_in",
          text: "Take Eve on — secretary, dresser, shadow. Then throw the party.",
          targetSceneId: "av_party",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ── 2 · THE PARTY — seatbelts, and a wire on the piano ────────── */
    {
      id: "av_party",
      title: "The Party on East 52nd",
      background: "/img/bg-av-party.jpg",
      ambientAudio: "jazz",
      cinematic: { filmGrade: true },
      prose:
        "Six weeks later, Eve runs your life like a Swiss watch that keeps someone else's time. Tonight your own party hums below while she holds court on the staircase, doing your laugh better than you do. Addison DeWitt watches from the piano with the smile of a man reading tomorrow's column. Something folded and yellow sits under his martini glass.",
      dialogueBeats: [
        {
          id: "av_pt_addison",
          characterId: "av_addison",
          text: "Radiant child, your Miss Harrington. She was just telling the Cort crowd about her late husband — Eddie, was it? — and the little theatre in San Francisco where she first saw your play. Touching. Almost verifiable.",
        },
        {
          id: "av_pt_margo",
          characterId: "av_margo",
          text: "Almost, Addison? You say 'almost' the way other men draw a knife.",
        },
      ],
      hotspots: [
        {
          id: "av_pt_wire",
          label: "The yellow wire under Addison's glass",
          bounds: { x: 62, y: 64, w: 14, h: 12 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "av_wire" },
        },
      ],
      choices: [
        {
          id: "av_pt_seatbelts",
          text: "Raise your glass to the staircase: “Fasten your seatbelts — it's going to be a bumpy night.”",
          reply: true,
          attitudeTag: "Aggressive",
          consequences: {
            setFlags: ["av_suspicion"],
            trustChanges: [{ characterId: "av_eve", delta: -1 }],
          },
        },
        {
          id: "av_pt_leave",
          text: "Let Karen drive you out to the country place — you need air that isn't perfumed.",
          targetSceneId: "av_drive",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ── 3 · THE DRIVE — video plate + painted car sprite ──────────── */
    {
      id: "av_drive",
      title: "The Drive North",
      // Real video plate: night highway over the bridge. The engine loops
      // it as the scene background ("video:" prefix).
      background:
        "video:/YTDown.com_YouTube_Highway-driving-at-night-over-the-bridge_Media_fo3WjGm0bTQ_006_144p.mp4",
      ambientAudio: "tension",
      letterbox: true,
      cinematic: {
        foregroundExtras: [
          {
            // Painted front-view sedan over the moving plate — the classic
            // 1950 rear-projection driving shot. Two-frame judder loop,
            // NON-pixel sheet (pixelated: false).
            image: "/assets/sprites/av-car-front.png",
            sheet: {
              image: "/assets/sprites/av-car-front.png",
              frameWidth: 640,
              frameHeight: 490,
              animations: {
                loop: { frames: [0, 0, 1, 0, 1, 1, 0, 1, 0, 0], fps: 6 },
              },
              pixelated: false,
            },
            x: 50,
            y: 62,
            scale: 0.92,
            depth: 0.1,
          },
        ],
      },
      prose:
        "The bridge lights come at the windshield like flashbulbs. Karen drives; you smoke and watch the rail slide by. Somewhere behind you, Eve is telling your party your stories in your timing.",
      dialogueBeats: [
        {
          id: "av_dv_margo1",
          characterId: "av_margo",
          text: "Funny little thing, isn't she. Six weeks ago she was a wet sparrow at the stage door. Now my maid reports to her, my calendar reports to her — I half expect my reflection to start reporting to her.",
        },
        {
          id: "av_dv_karen",
          characterId: "av_karen",
          text: "You're being unjust, Margo. She worships you. Everything she does, she does for you.",
        },
        {
          id: "av_dv_margo2",
          characterId: "av_margo",
          text: "So does a taxidermist, darling. Watch the road.",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "av_dv_onward",
          text: "Let the white lines swallow the argument — there's a train back at six",
          targetSceneId: "av_stalled",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ── 4 · THE STALL — an empty tank tells a full story ──────────── */
    {
      id: "av_stalled",
      title: "Mile Marker Nothing",
      background: "/img/bg-av-roadside.jpg",
      ambientAudio: "rain",
      letterbox: true,
      cinematic: { filmGrade: true },
      prose:
        "The engine coughs twice, politely, like a butler announcing bad news, and dies. Snow ticks on the hood. The gauge reads empty — a car Karen filled yesterday. Sixty miles from a curtain that goes up at eight-forty, and your understudy is Eve Harrington.",
      dialogueBeats: [
        {
          id: "av_st_karen1",
          characterId: "av_karen",
          text: "Margo — the tank. I don't understand it, I had it filled...",
        },
        {
          id: "av_st_margo",
          characterId: "av_margo",
          text: "Don't play the second act, Karen, you haven't the face for it. You knew there's no phone for five miles, and you know who's standing in the wings tonight with my lines learned. Whose idea — yours, or the sparrow's?",
        },
        {
          id: "av_st_karen2",
          characterId: "av_karen",
          conditionRule: { requiresFlags: ["av_suspicion"] },
          text: "...It was supposed to be a joke. A little humbling, one missed curtain. Eve said — Eve said you'd laugh about it someday. I drained the tank, Margo. Me. And God help me, I think I was her alibi, not her friend.",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "av_st_press_karen",
          text: "Take Karen's hand instead of her head off — you'll need her at the banquet",
          reply: true,
          attitudeTag: "Neutral",
          consequences: {
            setFlags: ["av_karen_confessed"],
            trustChanges: [{ characterId: "av_karen", delta: 1 }],
          },
        },
        {
          id: "av_st_back",
          text: "Flag the milk truck at dawn and get back to town — the Sarah Siddons banquet is tonight",
          targetSceneId: "av_confront",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ── 5 · THE BANQUET — press the lie ───────────────────────────── */
    {
      id: "av_confront",
      title: "The Sarah Siddons Banquet",
      background: "/img/bg-av-banquet.jpg",
      ambientAudio: "jazz",
      letterbox: true,
      prose:
        "Candlelight, white linen, and the award with the little gold face waiting on the dais. Eve went on for you that night — with the press mysteriously in attendance — and tonight Broadway's youngest sensation is about to be anointed. She finds you by the cloakroom first, all wet eyes and gratitude, and gives the room her origin story one more time.",
      dialogueBeats: [
        {
          id: "av_cf_eve_lie",
          characterId: "av_eve",
          text: "Everything I am, I owe to Margo. When Eddie was killed in the Pacific I thought my life was over — the only light left was the little theatre in San Francisco, seeing her play every single week of the run, right from the second balcony. That's what brought me to that stage door. Grief, and gratitude.",
          lie: {
            claim:
              "Eve says she's Eddie Harrington's war widow, and saw every week of the San Francisco run from the second balcony.",
            evidenceItemIds: ["av_wire"],
            contradictedFlag: "av_eve_lie_broken",
            caughtBeat: {
              id: "av_cf_eve_caught",
              characterId: "av_eve",
              conditionRule: { requiresFlags: ["av_eve_lie_broken"] },
              text: "She reads the wire once. The wet eyes dry all at once, like a stage light snapping off. \"...The Curran keeps poor records,\" she says, and the voice is new — flat, quick, unafraid. \"All right. There's no Eddie. There was never any San Francisco. You'd have done the same in my place, and you know it. The question is what the room hears tonight — your proof, or my speech.\"",
            },
            wrongBeat: {
              id: "av_cf_eve_wrong",
              characterId: "av_eve",
              text: "She blinks at what you're holding and the tears simply deepen. \"I don't understand what that has to do with Eddie,\" she says, gently, and two producers glare at you for bullying the poor child. The room is hers. Come back with paper that has her name on it.",
            },
            wrongEvidenceLimit: 2,
            contradictedConsequences: {
              trustChanges: [{ characterId: "av_eve", delta: -2 }],
            },
            wrongConsequences: {
              trustChanges: [{ characterId: "av_eve", delta: 1 }],
            },
            rememberLine: "Eve knows you've read the Curran wire. The mask is off between you two.",
          },
        },
        {
          id: "av_cf_addison",
          characterId: "av_addison",
          text: "Careful, Margo. Sainthood is this year's fashion, and the child wears it beautifully. If you mean to unfrock her, do it with a document — the town never believes an actress, only an exhibit.",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "av_cf_expose",
          text: "Stand up before the award does — read the wire to the room, with Karen beside you",
          targetSceneId: "av_end_gold",
          attitudeTag: "Aggressive",
          gating: { requiresFlags: ["av_eve_lie_broken"] },
        },
        {
          id: "av_cf_walk",
          text: "Leave the theatre to her — take Bill, take the license, take the life",
          targetSceneId: "av_end_silver",
          attitudeTag: "Neutral",
        },
        {
          id: "av_cf_applaud",
          text: "Say nothing. Applaud with everyone else.",
          targetSceneId: "av_end_cold",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ── ENDING — cold ─────────────────────────────────────────────── */
    {
      id: "av_end_cold",
      title: "Curtain — The Understudy's Town",
      isEnding: true,
      background: "/img/bg-av-banquet.jpg",
      ambientAudio: "jazz",
      prose:
        "The little gold face changes hands, the flashbulbs go off like the bridge lights on that long drive, and Eve Harrington thanks you — by name, with a catch in her voice — for everything. The room weeps. You applaud until your palms sting, which is the performance of your career. In her hotel room tonight there is already a girl in a wet coat, studying how Eve holds an award.",
      dialogueBeats: [],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "gameover",
        headline: "APPLAUSE, APPLAUSE",
        recap:
          "You held the proof — or never picked it up — and let the speech win the room. Eve gets the award, the part, and the town. The wheel keeps turning: somewhere at a stage door, her own Eve is already waiting.",
      },
    },

    /* ── ENDING — silver ───────────────────────────────────────────── */
    {
      id: "av_end_silver",
      title: "Curtain — Fasten Your Seatbelts, Darling",
      isEnding: true,
      background: "/img/bg-av-roadside.jpg",
      ambientAudio: "rain",
      prose:
        "Let her have the cardboard crown. You walk out past the dais into the snow with Bill's coat around your shoulders, and discover — somewhere on the highway north, about where the car died — that Margo Channing was a role too, and you're allowed to leave the stage while they still love you. Eve can play 'Margo' to the empty seats. You're booked.",
      dialogueBeats: [],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "victory-silver",
        headline: "THE ROLE OF A LIFETIME",
        recap:
          "You didn't beat Eve — you stopped competing for a prize she can have. The bumpy night ends on a quiet road: the career goes to the girl who lied for it, the life goes to the woman who didn't need it.",
      },
    },

    /* ── ENDING — gold ─────────────────────────────────────────────── */
    {
      id: "av_end_gold",
      title: "Curtain — The Exhibit Speaks",
      isEnding: true,
      background: "/img/bg-av-banquet.jpg",
      ambientAudio: "tension",
      prose:
        "You don't raise your voice; you never had to. One yellow wire, read slowly, with Karen Richards standing up beside you to say the words 'I drained the tank.' The room goes so quiet you can hear the candles. Eve gets her award — the committee had already engraved it — but she carries it out of a silence shaped exactly like her future. Addison, damn him, is smiling. Tomorrow's column writes itself: the town never believes an actress. Only an exhibit.",
      dialogueBeats: [],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "victory-gold",
        headline: "NO RECORD ANY MRS HARRINGTON",
        recap:
          "The wire killed the war widow, Karen's confession killed the accident, and you put both on the record before the speech could start. Press the Lie, staged in 1950: hold the right paper, know what it proves, and read it to the whole room.",
      },
    },
  ],
};
