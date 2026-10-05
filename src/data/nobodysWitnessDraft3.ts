import type { Choice, DialogueBeat, Story } from "../types";

/**
 * NOBODY'S WITNESS — DRAFT 3
 *
 * A composed noir rail: a nonlinear crime story told in panels, cuts, and
 * choices. There are deliberately no walkable stages in this cut.
 *
 * The writing pass is built around three rules:
 *  1. Jack narrates, but he never announces what he feels. His decisions do
 *     the talking: the chair he moves, the report he alters, the debt he signs.
 *  2. Vera can be frightened and calculating in the same breath. Her plan is
 *     not a secret wish to be rescued; it is a practical exit with a body in
 *     the middle of it.
 *  3. David's theft is an accounting trick, not a suitcase of movie money.
 *     He sees Vera find the trick, moves the money, and dies before its new
 *     hiding place becomes anybody else's knowledge.
 */

const beat = (
  id: string,
  characterId: string,
  text: string,
  extra: Partial<DialogueBeat> = {}
): DialogueBeat => ({ id, characterId, text, ...extra });

const reply = (
  id: string,
  text: string,
  extra: Partial<Choice> = {}
): Choice => ({ id, text, reply: true, ...extra });

const nav = (
  id: string,
  text: string,
  targetSceneId: string,
  extra: Partial<Choice> = {}
): Choice => ({ id, text, targetSceneId, ...extra });

export const NOBODYS_WITNESS_DRAFT_3: Story = {
  id: "nobodys-witness-draft-3",
  title: "Nobody's Witness (Draft 3)",
  tagline:
    "A missing collector, a careful wife, and a file that wants to be believed.",
  coverImage: "/img/cover-nobodys-witness.jpg",
  gameKind: "noir-rail",
  startSceneId: "nw3_coldopen",
  dialogueBox: {
    bodyFont: "type",
    headingFont: "pulp",
    hudTheme: "sepia-pulp",
    accentColor: "#c8862f",
    dangerColor: "#9c3040",
    bordered: true,
    backdropBlur: 2,
    reserveLines: 3,
  },
  briefing: {
    objective:
      "Find David Voss before his absence becomes somebody else's paperwork, then decide what Jack is willing to put his name on.",
    winConditions: [
      "Read the pages closely enough to tell an error from a habit.",
      "Work out why Vera keeps watching the front window.",
      "Find David before the town decides what happened for you.",
      "Choose what Jack's name is worth when the file changes hands.",
    ],
    loseConditions: [
      "Accept the first tidy version of a missing person's story.",
      "Treat Solomon's confidence as proof before you have something you can use.",
      "Mistake an empty room for an answer.",
    ],
  },
  acts: [
    {
      id: "nw3_act1",
      label: "Act One",
      title: "The Line",
      tagline: "A missing man leaves a line of ordinary questions.",
      startSceneId: "nw3_coldopen",
      titleCardImage: "/img/style/nw2-signature-a-neon80s.jpg",
    },
    {
      id: "nw3_act2",
      label: "Act Two",
      title: "The Missing Hours",
      tagline: "The useful answers arrive after people stop performing.",
      startSceneId: "nw3_vera",
      titleCardImage: "/img/nw2/bg-folder.jpg",
    },
    {
      id: "nw3_act3",
      label: "Act Three",
      title: "The Empty Room",
      tagline: "A room gets quiet. A name gets expensive.",
      startSceneId: "nw3_empty",
      titleCardImage: "/img/nw2/bg-final-street.jpg",
    },
  ],
  layout: {
    nw3_coldopen: { x: 0, y: 220 },
    nw3_titles: { x: 320, y: 220 },
    nw3_diner: { x: 640, y: 220 },
    nw3_folder: { x: 960, y: 220 },
    nw3_solomon: { x: 1280, y: 220 },
    nw3_vera: { x: 1600, y: 220 },
    nw3_bluecue: { x: 1920, y: 220 },
    nw3_david: { x: 2240, y: 220 },
    nw3_confession: { x: 2560, y: 220 },
    nw3_kill: { x: 2880, y: 220 },
    nw3_empty: { x: 3200, y: 220 },
    nw3_rosa: { x: 3520, y: 220 },
    nw3_solomon_final: { x: 3840, y: 220 },
    nw3_end_truth: { x: 4160, y: 40 },
    nw3_end_debt: { x: 4160, y: 200 },
    nw3_end_alibi: { x: 4160, y: 360 },
    nw3_end_empty: { x: 4160, y: 520 },
    nw3_end_refusal: { x: 960, y: 520 },
  },
  characters: [
    {
      id: "jack",
      name: "Jack Morrow",
      role: "Private detective and narrator; lives on small searches and keeps promises to himself.",
      avatarUrl: "/img/ch-jack-morrow.jpg",
      trustMeter: 0,
      voice: { pitch: 0.72, rate: 0.9 },
    },
    {
      id: "vera",
      name: "Vera Voss",
      role: "Runs the Blue Hour Diner; practical, exhausted, and careful about who sees her worry.",
      avatarUrl: "/img/ch-vera-voss.jpg",
      trustMeter: 0,
      voice: { pitch: 1.12, rate: 0.92 },
    },
    {
      id: "david",
      name: "David Voss",
      role: "Solomon's collector; meticulous with figures and careless with people.",
      avatarUrl: "/img/ch-david-voss.jpg",
      trustMeter: 0,
      voice: { pitch: 0.82, rate: 0.92 },
    },
    {
      id: "solomon",
      name: "Solomon Reyes",
      role: "Lender and landlord; treats overdue money like a scheduling problem.",
      avatarUrl: "/img/ch-solomon-reyes.jpg",
      trustMeter: 0,
      voice: { pitch: 0.62, rate: 0.86 },
    },
    {
      id: "moe",
      name: "Moe",
      role: "Solomon's collector; knows when a job has crossed from work into something else.",
      avatarUrl: "/img/ch-moe.jpg",
      trustMeter: 0,
      voice: { pitch: 0.78, rate: 0.9 },
    },
    {
      id: "desh",
      name: "Desh",
      role: "Solomon's collector; talks more freely when the bill is already paid.",
      avatarUrl: "/img/ch-desh.jpg",
      trustMeter: 0,
      voice: { pitch: 1.02, rate: 1.02 },
    },
    {
      id: "rosa",
      name: "Rosa Delgado",
      role: "Police detective and Jack's oldest friend; requires facts she can use in court.",
      avatarUrl: "/img/ch-rosa.jpg",
      trustMeter: 0,
      voice: { pitch: 0.96, rate: 0.94 },
    },
  ],
  items: [
    {
      id: "nw3_folder",
      name: "Vera's Folder",
      icon: "🗂",
      description:
        "A timeline, a photograph, and account pages arranged to make a missing husband look easy to find.",
      flavorText: "The order of the pages is doing as much talking as the pages themselves.",
      isClue: true,
    },
    {
      id: "nw3_accounts",
      name: "The Account Pages",
      icon: "📄",
      description:
        "Cash-route sheets with tiny adjustment codes repeated at the edges of David's clean totals.",
      flavorText: "A small number can be a door. Check who keeps walking through it.",
      isClue: true,
    },
    {
      id: "nw3_photo",
      name: "David's Photograph",
      icon: "📸",
      description:
        "David in a good jacket, smiling at somebody just outside the frame.",
      flavorText: "The camera gets the face. It misses the room after he leaves.",
    },
    {
      id: "nw3_debt_notice",
      name: "The Blue Hour Note",
      icon: "✉️",
      description:
        "Vera's own note for the diner lease and kitchen loan. The principal barely moved while the interest stayed busy.",
      flavorText: "Solomon lends people a door, then keeps the hinges.",
      isClue: true,
    },
    {
      id: "nw3_moe_receipt",
      name: "The Off-Book Receipt",
      icon: "🧾",
      description:
        "A carbon slip for cash paid to M. No company stamp. No signature. A private transaction pretending to be stationery.",
      flavorText: "Paper is brave until somebody knows where it came from.",
      isClue: true,
    },
    {
      id: "nw3_empty_safe",
      name: "The Empty Safe",
      icon: "🔒",
      description:
        "A clean safe and a warm dust-mark where a bag sat long enough to leave a memory.",
      flavorText: "The room has kept the outline and lost the answer.",
      isClue: true,
    },
  ],
  deduction: {
    suspectIds: ["vera", "david", "moe", "solomon"],
    connections: [
      {
        a: "nw3_accounts",
        b: "david",
        flagSet: "nw3_skimming_seen",
        revelation:
          "The adjustment codes are David's signature: six years of small withdrawals from cash routes Solomon thought were exact.",
      },
      {
        a: "nw3_debt_notice",
        b: "vera",
        flagSet: "nw3_debt_seen",
        revelation:
          "The Blue Hour loan is Vera's debt. David's name is nowhere on the note, and Solomon knows that.",
      },
      {
        a: "nw3_moe_receipt",
        b: "moe",
        flagSet: "nw3_offbook_seen",
        revelation:
          "Moe accepted private cash. Solomon did not order the killing; Vera used access to his orbit to reach Moe.",
      },
      {
        a: "nw3_empty_safe",
        b: "david",
        flagSet: "nw3_money_moved_seen",
        revelation:
          "David saw Vera in the accounts, moved the money, and died before its new hiding place became anybody else's knowledge.",
      },
    ],
  },
  flagNotes: {
    nw3_case_open:
      "Jack accepted Vera's case. The folder is now both an investigation and a potential police timeline.",
    nw3_folder_open:
      "Jack opened Vera's prepared folder and started turning a marriage into a paper trail.",
    nw3_accounts_seen:
      "Jack has held the account pages and seen the repeated adjustment codes.",
    nw3_photo_seen:
      "Jack has seen David's photograph and knows the face attached to the collection routes.",
    nw3_solomon_suspicious:
      "Solomon knows David is off his route; he has not tied that absence to the account irregularities.",
    nw3_debt_revealed:
      "The Blue Hour loan is Vera's own debt. Solomon can take the diner and the lease if she stops paying.",
    nw3_david_seen:
      "Jack found David alive in the rental house and left with the sense he was hiding more than a location.",
    nw3_david_bad:
      "David's cruelty is recorded in what he did to debtors, not in a label he would accept.",
    nw3_money_moved:
      "David noticed Vera looking through the accounts and moved the hidden money before she could take it.",
    nw3_vera_confessed:
      "Vera admitted she found the skim, paid Moe, planned to take the money, and hired Jack as insurance.",
    nw3_killer_paid:
      "Moe confirmed Vera paid him privately. Solomon did not send him to kill David.",
    nw3_david_dead:
      "David Voss is dead. The money is still missing, and nobody alive knows where it is.",
    nw3_empty_room:
      "Vera found the body and the empty safe. Her plan lost its only useful object.",
    nw3_chose_tell:
      "Jack told Vera the money was gone instead of letting her search the room alone.",
    nw3_chose_cover:
      "Jack kept the empty safe out of the first version of the report.",
    nw3_evidence_shared:
      "Jack gave Rosa the off-book receipt and made the private killing readable to the police.",
    nw3_evidence_kept:
      "Jack kept the receipt for one more conversation with Solomon.",
    nw3_jack_debt:
      "Jack offered Solomon his license, his file, and his own name in exchange for Vera's clean exit.",
    nw3_jack_steps_in:
      "Jack went to the rental house knowing he might not stop the killing, and went anyway.",
    nw3_told_truth:
      "Jack gave Solomon the confession and Moe's name instead of trading Vera's silence for his own.",
    nw3_kept_alibi:
      "Jack wrote the insurance case as if it were innocent and let Vera leave with the lie.",
    nw3_admitted_money_gone:
      "Jack told Solomon nobody alive knew where David put the money.",
    nw3_refused_case:
      "Jack refused the folder before he knew how much of Vera's plan was already in it.",
  },
  scenes: [
    /* ================================================================ */
    /* PRE-INTRO + CREDITS                                             */
    /* ================================================================ */
    {
      id: "nw3_coldopen",
      title: "Pre-Intro — The Straight Line",
      nodeType: "cutscene",
      background: "gradient:linear-gradient(#000,#000)",
      musicMode: "track",
      musicUrl: "/nobodys-witness.mp3",
      musicLevel: 0.5,
      musicFadeSeconds: 0,
      transition: "cut",
      transitionSpeed: 0,
      letterbox: true,
      noTypewriter: true,
      autoNarrate: false,
      choiceDelaySeconds: 1,
      prose: "straight, you draw a straight line and everyone stands in it",
      dialogueBeats: [
        beat(
          "nw3_pi_s1",
          "jack",
          "",
          {
            expression: "one second of black",
            silent: true,
            audioUrl: "/nwt-gunshot.wav",
            background: "gradient:linear-gradient(#000,#000)",
            backgroundTransition: "cut",
            backgroundTransitionSpeed: 0,
            afterBeatTargetSceneId: "nw3_titles",
            afterBeatMode: "auto",
            afterBeatDelaySeconds: 1,
          }
        ),
      ],
      choices: [],
      hotspots: [],
    },
    {
      id: "nw3_titles",
      title: "Nobody's Witness",
      nodeType: "credits",
      background: "/img/style/nw2-signature-a-neon80s.jpg",
      ambientAudio: "rain",
      musicMode: "track",
      musicUrl: "/nobodys-witness.mp3",
      musicLevel: 0.62,
      noTypewriter: true,
      transition: "cut",
      letterbox: true,
      choiceDelaySeconds: 11,
      credits: {
        title: "NOBODY'S WITNESS",
        subtitle: "DRAFT 3 · A BLACKWOOD REEL",
        titleEntrance: "slam",
        titleColor: "#e8b23c",
        accentColor: "#2ad9d9",
        font: "poster",
        style: "cards",
        cardMotion: "letterspace",
        cardSeconds: 3.1,
        gateWeave: "worn",
        montage: [
          "/img/style/nw2-signature-a-neon80s.jpg",
          "/img/nw2/mo-mainstreet.jpg",
          "/img/nw2/bg-diner-int.jpg",
          "/img/nw2/bg-folder.jpg",
          "/img/nw2/bg-yard-night.jpg",
        ],
        montageSeconds: 3.8,
        montageTransition: "cut",
        montageLoop: true,
        lines: [
          { role: "A Gaslight Reelworks Production", name: "" },
          { role: "Featuring", name: "Jack Morrow" },
          { role: "Featuring", name: "Vera Voss" },
          { role: "With", name: "David Voss · Solomon Reyes · Moe" },
          { role: "Act One", name: "The Line" },
        ],
      },
      prose:
        "NOBODY'S WITNESS\n\nDRAFT 3\n\nA graphic novel in three acts\n\nBlackwood. A town that keeps receipts.",
      choices: [
        nav("nw3_title_go", "Blackwood Diner. 11:47 p.m.", "nw3_diner", { attitudeTag: "Neutral" }),
      ],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ================================================================ */
    /* ACT ONE — THE WOMAN WITH THE FOLDER                             */
    /* ================================================================ */
    {
      id: "nw3_diner",
      title: "Chapter One — The Woman with the Folder",
      background: "/img/nw2/bg-diner-int.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "track",
      musicUrl: "/Midnight in the Rain2.mp3",
      musicLevel: 0.42,
      musicFadeSeconds: 2,
      transition: "fade-black",
      transitionSpeed: 1.1,
      letterbox: true,
      cinematic: {
        mode: "pan",
        focalPoint: "48% 46%",
        dollyDistance: 3,
        dollyDirection: "left",
        dollyDuration: 28,
        dimAmount: 0.14,
        lights: [
          { x: 20, y: 20, color: "#ff2e88", intensity: 0.24, size: 34, pulseSeconds: 3.4, pulseAmount: 0.9 },
          { x: 76, y: 22, color: "#2ad9d9", intensity: 0.18, size: 40, pulseSeconds: 4.8, pulseAmount: 0.6 },
        ],
      },
      prose:
        "INT. BLACKWOOD DINER — NIGHT. Eleven forty-seven. The coffee has been on the burner too long. Jack Morrow is in the back booth, reading the same page of a magazine for the fourth time.",
      dialogueBeats: [
        beat(
          "nw3_d_j1",
          "jack",
          "The bell gave two sick little rings when Vera came in. One was the bell. The other was the door catching on a warped mat.",
          { expression: "V.O." }
        ),
        beat(
          "nw3_d_v1",
          "vera",
          "They said you were the only detective in Blackwood who doesn't work for Solomon Reyes. That's not a compliment, is it?",
          { expression: "standing at the booth, coat still on" }
        ),
        beat("nw3_d_j2", "jack", "It is mostly a labor statistic.", { expression: "not looking up" }),
        beat(
          "nw3_d_v2",
          "vera",
          "My husband is missing. The police asked if he had left before. I said no. They wrote down 'no fixed pattern' and told me to wait until morning.",
          { expression: "sitting, arranging sugar packets into a line" }
        ),
        beat(
          "nw3_d_j3",
          "jack",
          "What does he do?",
          { expression: "finally looking at her" }
        ),
        beat(
          "nw3_d_v3",
          "vera",
          "He collects on Solomon's loans. He knows who has cash and who is lying about it. David Voss.",
          { expression: "the name lands without drama" }
        ),
        beat(
          "nw3_d_j4",
          "jack",
          "I know David. He collects for Solomon. He is careful about being seen doing it.",
          { expression: "V.O." }
        ),
        beat(
          "nw3_d_v4",
          "vera",
          "I brought a photograph, some account pages, and the address where he rents a room. I do not know which one will help.",
          { expression: "sliding the folder across" }
        ),
        beat(
          "nw3_d_j5",
          "jack",
          "You want him found, or you want a record that you asked? I can call Rosa and make it official.",
          { expression: "quiet" }
        ),
        beat("nw3_d_r_source", "vera", "A woman at the courthouse gave me your name. She said you can find someone without making the whole street watch you look.", { conditionRule: { requiresFlags: ["nw3_asked_source"] }, expression: "guarded" }),
        beat("nw3_d_r_work", "vera", "He handles collections for Solomon. He has a route, a schedule, and a habit of turning his phone off when I need him.", { conditionRule: { requiresFlags: ["nw3_asked_work"] }, expression: "careful" }),
        beat("nw3_d_r_police", "vera", "The police will call it a domestic matter until Solomon decides it is his matter. I want a private search first.", { conditionRule: { requiresFlags: ["nw3_asked_police"] }, expression: "the brightness gone" }),
        beat("nw3_d_r_why", "vera", "Because you ask questions before you decide what the answers cost. I need that kind of stubbornness, not a friend who will tell me what I want to hear.", { conditionRule: { requiresFlags: ["nw3_asked_why"] }, expression: "too honest" }),
      ],
      choices: [
        reply("nw3_d_q_source", "Who told you to come to me?", {
          exclusiveGroup: "nw3_d1",
          attitudeTag: "Clever",
          consequences: { setFlags: ["nw3_asked_source"], meterChanges: [{ meter: "Clever", delta: 1 }] },
        }),
        reply("nw3_d_q_work", "What did David collect for Solomon?", {
          exclusiveGroup: "nw3_d1",
          attitudeTag: "Aggressive",
          consequences: { setFlags: ["nw3_asked_work"], meterChanges: [{ meter: "Aggressive", delta: 1 }] },
        }),
        reply("nw3_d_q_police", "Why not let the police have the missing husband?", {
          exclusiveGroup: "nw3_d1",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["nw3_asked_police"] },
        }),
        reply("nw3_d_q_why", "Why hire a detective who is not Solomon's?", {
          exclusiveGroup: "nw3_d1",
          attitudeTag: "Sultry",
          consequences: { setFlags: ["nw3_asked_why"], meterChanges: [{ meter: "Sultry", delta: 1 }] },
        }),
        nav("nw3_d_take", "Take the folder. Take the case.", "nw3_folder", {
          hidden: true,
          attitudeTag: "Neutral",
          gating: {
            requiresFlags: ["nw3_asked_source", "nw3_asked_work", "nw3_asked_police", "nw3_asked_why"],
            requiresAll: false,
          },
          consequences: { setFlags: ["nw3_case_open"], addItems: ["nw3_folder"] },
          memoryLog: "nw3_case_taken",
        }),
        nav("nw3_d_refuse", "Slide the folder back. I do not take cases with a second purpose.", "nw3_end_refusal", {
          hidden: true,
          attitudeTag: "Neutral",
          gating: {
            requiresFlags: ["nw3_asked_source", "nw3_asked_work", "nw3_asked_police", "nw3_asked_why"],
            requiresAll: false,
          },
          consequences: { setFlags: ["nw3_refused_case"] },
        }),
      ],
      onEnterActions: [],
      hotspots: [
        {
          id: "nw3_d_phone",
          label: "Jack's face-down phone",
          bounds: { x: 52, y: 74, w: 12, h: 12 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Four missed calls from people who want a favor and three from people who want to sell one. Jack keeps the phone face-down so the room cannot watch him decide.",
          },
        },
        {
          id: "nw3_d_folder",
          label: "The folder Vera brought",
          bounds: { x: 34, y: 60, w: 22, h: 18 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Photograph on top. Account pages underneath. Nothing personal except the care taken to remove anything personal.",
          },
        },
      ],
    },
    {
      id: "nw3_folder",
      title: "Chapter Two — The Small Numbers",
      background: "/img/nw2/bg-folder.jpg",
      ambientAudio: "rain",
      musicMode: "none",
      transition: "fade",
      transitionSpeed: 0.8,
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 52%",
        zoomDuration: 18,
        dimAmount: 0.2,
        lights: [{ x: 44, y: 50, color: "#ffb761", intensity: 0.28, size: 34, pulseSeconds: 4.2, pulseAmount: 0.6 }],
      },
      prose:
        "INT. JACK'S OFFICE — LATER. One lamp. Two chairs. The folder has enough pages to need a third chair, and it sits there like it hired me.",
      onEnterActions: [{ consequences: { setFlags: ["nw3_folder_open"] } }],
      dialogueBeats: [
        beat(
          "nw3_f_j1",
          "jack",
          "Vera put the case in my hands. I called it a job so I would not have to call it a favor.",
          { expression: "V.O.", recalls: { nw3_case_taken: "Vera put the case in my hands. I called it a job so I would not have to call it a favor." } }
        ),
        beat(
          "nw3_f_j2",
          "jack",
          "David's name sat beside a handful of cash-route adjustments. Each one was small enough to dismiss. That was why I kept reading.",
          { expression: "V.O. — reading the pages" }
        ),
        beat(
          "nw3_f_j3",
          "jack",
          "Weather damage. Wet count. Correction. The same code repeated in different months, and somebody had underlined four digits in blue. The underline stopped before it became an accusation.",
          { expression: "V.O. — the pattern arriving" }
        ),
        beat(
          "nw3_f_j4",
          "jack",
          "The first rule of an account is not to decide what a number means before you know who benefits from it.",
          { expression: "V.O." }
        ),
        beat(
          "nw3_f_j5",
          "jack",
          "David Voss collected late payments for Solomon and knew which doorbell to press twice. The pages did not tell me whether he was thief or witness. They told me somebody wanted me to choose quickly.",
          { expression: "V.O." }
        ),
      ],
      choices: [
        nav("nw3_f_solomon", "Take David's name to Solomon.", "nw3_solomon", { attitudeTag: "Neutral" }),
      ],
      hotspots: [
        {
          id: "nw3_f_accounts",
          label: "The account pages",
          bounds: { x: 26, y: 42, w: 34, h: 28 },
          cursor: "take",
          showItemImage: true,
          isRepeatable: false,
          examine: true,
          examineSeconds: 2.2,
          action: { type: "giveItem", itemGranted: "nw3_accounts", flagSet: "nw3_accounts_seen" },
        },
        {
          id: "nw3_f_photo",
          label: "David's photograph",
          bounds: { x: 64, y: 42, w: 22, h: 26 },
          cursor: "take",
          showItemImage: true,
          isRepeatable: false,
          action: { type: "giveItem", itemGranted: "nw3_photo", flagSet: "nw3_photo_seen" },
        },
        {
          id: "nw3_f_margin",
          label: "The margin beside David's initials",
          bounds: { x: 62, y: 70, w: 28, h: 14 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "A blue pencil mark circles the same four digits on six different pages. Whoever made it stopped before adding an explanation.",
          },
        },
      ],
    },

    /* ================================================================ */
    /* ACT ONE — SOLOMON                                                */
    /* ================================================================ */
    {
      id: "nw3_solomon",
      title: "Chapter Three — The Man Who Owns the Hinges",
      background: "/img/nw2/bg-solomon-office.jpg",
      ambientAudio: "drone",
      particles: "smoke",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.1,
      letterbox: true,
      cinematic: {
        mode: "dolly",
        focalPoint: "54% 48%",
        dollyDistance: 3,
        dollyDuration: 24,
        dimAmount: 0.26,
        lights: [{ x: 68, y: 30, color: "#ffb761", intensity: 0.26, size: 30, pulseSeconds: 5.2, pulseAmount: 0.35 }],
      },
      onEnterActions: [{ consequences: { setFlags: ["nw3_solomon_suspicious"] } }],
      prose:
        "INT. SOLOMON'S OFFICE ABOVE THE FEED STORE — NIGHT. The heater ticks. Solomon has put out two cups. He only expects one of them to be used.",
      dialogueBeats: [
        beat(
          "nw3_s_s1",
          "solomon",
          "Mr. Morrow. David Voss is missing. His route sheet says he should have knocked on three doors tonight. He knocked on none."
        ),
        beat("nw3_s_j1", "jack", "You checked the route sheet before you called the police."),
        beat(
          "nw3_s_s2",
          "solomon",
          "I check what keeps the business moving. The police check what makes paperwork."
        ),
        beat(
          "nw3_s_j2",
          "jack",
          "You want him found.",
          { expression: "V.O." }
        ),
        beat(
          "nw3_s_s3",
          "solomon",
          "I want my collection route back on schedule. If David walked, he can explain where. If he did not, someone can explain why. Bring him back before the forty-eight hours run out."
        ),
        beat(
          "nw3_s_s4",
          "solomon",
          "Vera Voss has a payment due Friday. Her account is separate. Do not confuse a late payment with a missing man."
        ),
        beat(
          "nw3_s_j3",
          "jack",
          "He says Vera's name without checking the file. He knows the fact. The performance is for me.",
          { expression: "V.O." }
        ),
        beat("nw3_s_r_client", "solomon", "I know who Vera is. She pays on time when she can. I want to know if you can keep a client from making a bad situation worse.", { conditionRule: { requiresFlags: ["nw3_named_vera"] }, expression: "pleasant" }),
        beat("nw3_s_r_debt", "solomon", "Her note is for the Blue Hour lease and kitchen. The number is between her and me. Friday is when it becomes between her and the building.", { conditionRule: { requiresFlags: ["nw3_asked_debt"] }, expression: "administrative" }),
        beat("nw3_s_r_david", "solomon", "I think David is overdue. That is a business fact, not a murder theory. Bring me facts I can put in a drawer.", { conditionRule: { requiresFlags: ["nw3_asked_david"] }, expression: "a slight pause" }),
      ],
      choices: [
        reply("nw3_s_q_client", "You already know Vera hired me.", {
          exclusiveGroup: "nw3_s1",
          attitudeTag: "Aggressive",
          consequences: { setFlags: ["nw3_named_vera"], meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }] },
        }),
        reply("nw3_s_q_debt", "What does Vera owe you?", {
          exclusiveGroup: "nw3_s1",
          attitudeTag: "Clever",
          consequences: { setFlags: ["nw3_asked_debt"], meterChanges: [{ meter: "Clever", delta: 1 }] },
        }),
        reply("nw3_s_q_david", "You think David is the hole in the books.", {
          exclusiveGroup: "nw3_s1",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["nw3_asked_david"] },
        }),
        nav("nw3_s_leave", "Leave with the forty-eight hours.", "nw3_vera", {
          hidden: true,
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["nw3_named_vera", "nw3_asked_debt", "nw3_asked_david"], requiresAll: false },
        }),
      ],
      hotspots: [
        {
          id: "nw3_s_cabinet",
          label: "The filing cabinet",
          bounds: { x: 72, y: 36, w: 22, h: 46 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "The cabinet has tabs for every person who owes him. The dates are in pencil; the names are in ink.",
          },
        },
        {
          id: "nw3_s_heater",
          label: "The space heater",
          bounds: { x: 8, y: 54, w: 24, h: 28 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "The heater kicks once, then stops. Solomon looks at it, annoyed, as if it has missed a payment." },
        },
      ],
    },

    /* ================================================================ */
    /* ACT TWO — VERA'S DEBT                                            */
    /* ================================================================ */
    {
      id: "nw3_vera",
      title: "Chapter Four — The Blue Hour Note",
      partBreak: "Act Two — The Missing Hours",
      background: "/img/nw2/bg-vera-booth.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.2,
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "48% 44%",
        zoomDuration: 26,
        dimAmount: 0.24,
        lights: [
          { x: 24, y: 26, color: "#ff2e88", intensity: 0.22, size: 32, pulseSeconds: 3.6, pulseAmount: 0.7 },
          { x: 76, y: 34, color: "#2ad9d9", intensity: 0.14, size: 36, pulseSeconds: 5.6, pulseAmount: 0.55 },
        ],
      },
      onEnterActions: [{ consequences: { setFlags: ["nw3_debt_revealed"] } }],
      prose:
        "INT. THE BLUE HOUR DINER — AFTER CLOSING. Vera has counted the till twice and left one chair upside down. A black sedan has been parked opposite the window with its lights off.",
      dialogueBeats: [
        beat(
          "nw3_v_j1",
          "jack",
          "The car has been there at least twenty minutes. I know because the diner clock is four minutes slow.",
          { expression: "V.O." }
        ),
        beat("nw3_v_v1", "vera", "Do not look at it."),
        beat("nw3_v_j2", "jack", "I am looking at the clock."),
        beat(
          "nw3_v_v2",
          "vera",
          "He likes to sit where he can see the door. He never comes in. The note arrives, I open the till, and I choose which bill stays unpaid. If I call the cops, he hears it as an invitation. Fuck that.",
          { expression: "hands folded too tightly" }
        ),
        beat("nw3_v_j3", "jack", "What is the note?"),
        beat(
          "nw3_v_v3",
          "vera",
          "Mine. I borrowed twenty-three thousand to buy the Blue Hour lease and half the kitchen. The old owner left before he explained the boiler. I paid interest for five years. The principal has moved three inches.",
          { expression: "taking the folded notice from her purse" }
        ),
        beat(
          "nw3_v_v4",
          "vera",
          "If I miss Friday, Solomon takes the lease, the equipment, and the room I sleep in above the kitchen. The room is written into the same lease. That is my debt. Not David's. Mine.",
          { expression: "fear finally using its own voice" }
        ),
        beat(
          "nw3_j_v1",
          "jack",
          "She does not say she is scared. Her thumb has already said it three times against the edge of the paper.",
          { expression: "V.O." }
        ),
        beat(
          "nw3_v_v5",
          "vera",
          "I am frightened of him. There. You can write it down. He never has to put his hand on me. He owns the door, the lease, and enough people to make a closed diner feel crowded.",
          { expression: "looking through the glass" }
        ),
        beat(
          "nw3_v_j4",
          "jack",
          "You keep the diner open anyway.",
          { expression: "quiet" }
        ),
        beat(
          "nw3_v_v6",
          "vera",
          "People still need coffee. Fear does not excuse a bad breakfast."
        ),
        beat(
          "nw3_v_j5",
          "jack",
          "I moved the chair so the sedan could not see her face. She noticed. She pretended not to.",
          { expression: "V.O." }
        ),
        beat("nw3_v_r_books", "vera", "He handles Solomon's paperwork. I do not know what he does after he leaves here, and I stopped asking because the answers make breakfast harder to serve.", { conditionRule: { requiresFlags: ["nw3_asked_vera_books"] }, expression: "careful" }),
        beat("nw3_v_r_silence", "vera", "You should not sit beside me. But I am glad you did. That is not permission to promise anything.", { conditionRule: { requiresFlags: ["nw3_offered_silence"] }, expression: "a little less afraid" }),
        beat("nw3_v_r_leave", "vera", "I tried a bus once. The driver knew Solomon's name before I gave mine. I am not afraid of the city. I am afraid of what owns my name.", { conditionRule: { requiresFlags: ["nw3_asked_vera_leave"] }, expression: "a tired smile" }),
      ],
      choices: [
        reply("nw3_v_q_books", "What did David leave in the books?", {
          exclusiveGroup: "nw3_v1",
          attitudeTag: "Clever",
          consequences: { setFlags: ["nw3_asked_vera_books"], meterChanges: [{ meter: "Clever", delta: 1 }] },
        }),
        reply("nw3_v_q_silence", "You can tell me to leave and I will.", {
          exclusiveGroup: "nw3_v1",
          attitudeTag: "Sultry",
          consequences: { setFlags: ["nw3_offered_silence"], meterChanges: [{ meter: "Sultry", delta: 1 }], trustChanges: [{ characterId: "vera", delta: 1 }] },
        }),
        reply("nw3_v_q_leave", "Then leave town before Friday.", {
          exclusiveGroup: "nw3_v1",
          attitudeTag: "Aggressive",
          consequences: { setFlags: ["nw3_asked_vera_leave"], meterChanges: [{ meter: "Aggressive", delta: 1 }] },
        }),
        nav("nw3_v_next", "Ask around about David's associates.", "nw3_bluecue", {
          hidden: true,
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["nw3_asked_vera_books", "nw3_offered_silence", "nw3_asked_vera_leave"], requiresAll: false },
        }),
      ],
      hotspots: [
        {
          id: "nw3_v_notice",
          label: "The Blue Hour loan notice",
          bounds: { x: 58, y: 60, w: 20, h: 18 },
          cursor: "take",
          showItemImage: true,
          isRepeatable: false,
          action: { type: "giveItem", itemGranted: "nw3_debt_notice", flagSet: "nw3_debt_seen" },
        },
        {
          id: "nw3_v_window",
          label: "The black sedan",
          bounds: { x: 4, y: 24, w: 26, h: 40 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "No headlights. No engine sound. Just Solomon's car holding its place across from Vera's door.",
          },
        },
      ],
    },

    /* ================================================================ */
    /* ACT TWO — THE BLUE CUE                                           */
    /* ================================================================ */
    {
      id: "nw3_bluecue",
      title: "Chapter Five — The Wrong Kind of Regulars",
      background: "/img/nw2/bg-poolhall.jpg",
      ambientAudio: "jazz",
      musicUrl: "/nwt-bluecue-jukebox.mp3",
      musicMode: "track",
      musicLevel: 0.38,
      musicFadeSeconds: 1.4,
      particles: "smoke",
      transition: "fade",
      letterbox: true,
      cinematic: {
        mode: "dolly",
        focalPoint: "52% 46%",
        dollyDistance: 4,
        dollyDuration: 22,
        dimAmount: 0.3,
        lights: [
          { x: 28, y: 34, color: "#ff2e88", intensity: 0.22, size: 28, pulseSeconds: 3.2, pulseAmount: 0.7 },
          { x: 66, y: 38, color: "#ffb761", intensity: 0.24, size: 30, pulseSeconds: 4.8, pulseAmount: 0.45 },
        ],
      },
      prose:
        "INT. THE BLUE CUE — NIGHT. The jukebox has chosen a song about consequences and is playing it too fast. Moe and Desh sit beneath a television showing a horse race from last week.",
      dialogueBeats: [
        beat("nw3_b_j1", "jack", "Moe kept his coat over the chair. Desh had a newspaper folded to the race results, and his drink was already paid for. Neither man looked at the door when I came in.", { expression: "V.O." }),
        beat("nw3_b_d1", "desh", "David used to say a locked door was an invitation with better manners. He said it while he was checking whether the lock was expensive."),
        beat("nw3_b_m1", "moe", "David used to say many things. Most of them cost somebody a window."),
        beat("nw3_b_j2", "jack", "I need the room to stop pretending it did not hear David Voss."),
        beat("nw3_b_d2", "desh", "He took a woman's house over two late payments. Sat at her table and read the lease while Moe removed the front door. She kept asking what was happening, like the right answer would put the hinges back."),
        beat("nw3_b_m2", "moe", "The door was already bad."),
        beat("nw3_b_j3", "jack", "And David?"),
        beat("nw3_b_d3", "desh", "He kept a screwdriver in his coat. Said a door was cheaper to replace than an argument."),
        beat("nw3_b_j4", "jack", "I wrote down the address. Desh watched my pen, not my face. Moe watched the door.", { expression: "V.O." }),
        beat("nw3_b_m3", "moe", "Why are you looking for him?"),
        beat("nw3_b_j5", "jack", "His wife says he is missing."),
        beat("nw3_b_m4", "moe", "His wife says a lot?"),
        beat("nw3_b_j6", "jack", "Moe did not ask Vera's name. The pause did it for him.", { expression: "V.O." }),
        beat("nw3_b_r_bad", "desh", "He did not hit people because he lost his temper. He did it after checking the time. That was the part that bothered me.", { conditionRule: { requiresFlags: ["nw3_david_bad"] }, expression: "uncomfortable" }),
        beat("nw3_b_r_last", "moe", "He left the pool hall at nine. Took the service road instead of the main street. If he is hiding, he is hiding at the rental.", { conditionRule: { requiresFlags: ["nw3_asked_last_seen"] }, expression: "measuring the answer" }),
        beat("nw3_b_r_moe", "moe", "I work for Solomon. He pays on Fridays and asks questions on Mondays. Tonight is neither, so keep your question short.", { conditionRule: { requiresFlags: ["nw3_clocked_moe"] }, expression: "a warning" }),
      ],
      choices: [
        reply("nw3_b_q_bad", "What did David do when nobody was watching?", {
          exclusiveGroup: "nw3_b1",
          attitudeTag: "Clever",
          consequences: { setFlags: ["nw3_david_bad"], meterChanges: [{ meter: "Clever", delta: 1 }] },
        }),
        reply("nw3_b_q_last", "Who saw him last?", {
          exclusiveGroup: "nw3_b1",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["nw3_asked_last_seen"] },
        }),
        reply("nw3_b_q_moe", "You work for Solomon.", {
          exclusiveGroup: "nw3_b1",
          attitudeTag: "Aggressive",
          consequences: { setFlags: ["nw3_clocked_moe"], meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }] },
        }),
        nav("nw3_b_next", "Take the rental address.", "nw3_david", {
          hidden: true,
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["nw3_david_bad", "nw3_asked_last_seen", "nw3_clocked_moe"], requiresAll: false },
        }),
      ],
      hotspots: [
        {
          id: "nw3_b_juke",
          label: "The jukebox",
          bounds: { x: 4, y: 30, w: 18, h: 42 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "The song is about leaving. The jukebox has not managed it yet." },
        },
        {
          id: "nw3_b_moe_jacket",
          label: "Moe's jacket",
          bounds: { x: 42, y: 38, w: 18, h: 34 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "One side hangs wrong. A gun, a bad shoulder, or a secret can all pull a jacket the same way." },
        },
      ],
    },

    /* ================================================================ */
    /* ACT TWO — DAVID                                                   */
    /* ================================================================ */
    {
      id: "nw3_david",
      title: "Chapter Six — The Man Who Counted Dust",
      background: "/img/bg-safehouse.jpg",
      ambientAudio: "drone",
      particles: "rain",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.2,
      letterbox: true,
      cinematic: {
        mode: "static",
        dimAmount: 0.28,
        lights: [{ x: 30, y: 38, color: "#ffb761", intensity: 0.28, size: 40, pulseSeconds: 3.8, pulseAmount: 0.55 }],
      },
      onEnterActions: [{ consequences: { setFlags: ["nw3_david_seen"] } }],
      prose:
        "INT. A RENTAL HOUSE WITH NO NAME ON THE DOOR — NIGHT. David opens the chain before Jack knocks. He is holding a chipped Blue Hour mug, the sort Vera gives regulars who stop paying attention to the logo.",
      dialogueBeats: [
        beat("nw3_dv_j1", "jack", "David Voss. Your wife hired me to find you."),
        beat("nw3_dv_d1", "david", "No. Vera hired you to ask where I went. That is not the same as asking why."),
        beat("nw3_dv_j2", "jack", "The photograph was taken from below.", { expression: "V.O." }),
        beat("nw3_dv_d2", "david", "Makes me look taller. Vera marks pages with coffee rings. I used to think it was accidental."),
        beat("nw3_dv_j3", "jack", "How long have you been working for Solomon?"),
        beat("nw3_dv_d3", "david", "Six years. Long enough to know which numbers do not get checked."),
        beat("nw3_dv_j4", "jack", "You have been taking from Solomon."),
        beat("nw3_dv_d4", "david", "I have been taking care of myself. The accounts are a different argument."),
        beat("nw3_dv_d5", "david", "She saw a shape. She did not see me see her. That is the part you should keep to yourself."),
        beat("nw3_dv_j5", "jack", "What did you do with what she found?"),
        beat("nw3_dv_d6", "david", "I made sure what I took was no longer her problem. That is as generous as I get."),
        beat("nw3_dv_j6", "jack", "You collect for Solomon. What happens when a debtor cannot pay?"),
        beat("nw3_dv_d7", "david", "Last month a man missed two payments. I read him the warranty on his refrigerator while Moe took his front door off. The man remembers the warranty. That is the part people never expect."),
        beat("nw3_dv_j7", "jack", "You say that like it is an achievement."),
        beat("nw3_dv_d8", "david", "It is an achievement. The refrigerator still works."),
        beat("nw3_dv_j8", "jack", "He kept the chain on while he made the joke. David was afraid of somebody. It was not me.", { expression: "V.O." }),
        beat("nw3_dv_r_money", "david", "I moved what I took after I saw Vera in the accounts. It is not here. She does not know I saw her, and she has no idea where to look. I will die before I give you the rest of that sentence.", { conditionRule: { requiresFlags: ["nw3_asked_money"] }, expression: "smiling at the locked door" }),
        beat("nw3_dv_r_vera", "david", "Then she learned how much a mistake costs. You are the man she hired to make her search look ordinary.", { conditionRule: { requiresFlags: ["nw3_told_david_killer"] }, expression: "a flash of real fear" }),
        beat("nw3_dv_r_leave", "david", "Good. Go tell Vera I was here. She will ask whether I looked tired. Tell her yes.", { conditionRule: { requiresFlags: ["nw3_left_david"] }, expression: "dismissive" }),
      ],
      choices: [
        reply("nw3_dv_q_money", "Where did you put it?", {
          exclusiveGroup: "nw3_dv1",
          attitudeTag: "Clever",
          consequences: { setFlags: ["nw3_asked_money"], meterChanges: [{ meter: "Clever", delta: 1 }] },
        }),
        reply("nw3_dv_q_vera", "You know Vera paid somebody to stop you.", {
          exclusiveGroup: "nw3_dv1",
          attitudeTag: "Aggressive",
          consequences: { setFlags: ["nw3_told_david_killer"], meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }] },
        }),
        reply("nw3_dv_q_leave", "I am not here to rescue you.", {
          exclusiveGroup: "nw3_dv1",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["nw3_left_david"] },
        }),
        nav("nw3_dv_next", "Leave David with the locked door.", "nw3_confession", {
          hidden: true,
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["nw3_asked_money", "nw3_told_david_killer", "nw3_left_david"], requiresAll: false },
          consequences: { setFlags: ["nw3_money_moved"] },
        }),
      ],
      hotspots: [
        {
          id: "nw3_dv_bag",
          label: "The rectangular dust-mark",
          bounds: { x: 8, y: 58, w: 24, h: 28 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Something heavy sat here recently. The floor remembers the rectangle, not the address." },
        },
        {
          id: "nw3_dv_mug",
          label: "The chipped coffee mug",
          bounds: { x: 56, y: 58, w: 18, h: 18 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "The mug is chipped, with old coffee baked into the rim. David uses it as if nobody ever taught him to wash a dish." },
        },
      ],
    },

    /* ================================================================ */
    /* ACT TWO — THE CONFESSION                                         */
    /* ================================================================ */
    {
      id: "nw3_confession",
      title: "Chapter Seven — The Unpaid Question",
      background: "/img/bg-vera-window.jpg",
      ambientAudio: "rain",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.3,
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "52% 42%",
        zoomDuration: 32,
        dimAmount: 0.3,
        lights: [
          { x: 24, y: 28, color: "#ff2e88", intensity: 0.2, size: 34, pulseSeconds: 4.4, pulseAmount: 0.7 },
          { x: 74, y: 34, color: "#ffb761", intensity: 0.18, size: 36, pulseSeconds: 5.2, pulseAmount: 0.4 },
        ],
      },
      onEnterActions: [{ consequences: { setFlags: ["nw3_vera_confessed"] } }],
      prose:
        "INT. VERA'S APARTMENT — NIGHT. Vera has taken off her coat but not her shoes. On the table: the Blue Hour note, a glass of water, and a carbon receipt that has not yet decided whether it is evidence.",
      dialogueBeats: [
        beat(
          "nw3_c_j1",
          "jack",
          "David told me about the money. He did not give me the address. He told me something else, and it is the piece you do not know.",
          { expression: "V.O.", conditionRule: { requiresFlags: ["nw3_asked_money"] } }
        ),
        beat(
          "nw3_c_v1",
          "vera",
          "I found the skim because David left the route book open after a Friday payment. I knew the codes; you learn a lender's language when he owns your lease. Six years of it. Not one big theft, not the kind that gives you a villain in a coat. A dollar here, a code there. I was the only person besides David who had found it and could prove it.",
          { expression: "standing by the window" }
        ),
        beat(
          "nw3_c_j2",
          "jack",
          "Solomon never saw it.",
          { expression: "quiet" }
        ),
        beat(
          "nw3_c_v2",
          "vera",
          "Solomon sees totals. I saw the road to the totals. I thought the money was still where David kept it. That was the point of waiting.",
          { expression: "the plan trying to stay solid" }
        ),
        beat(
          "nw3_c_j3",
          "jack",
          "And if it is not there?",
          { expression: "low" }
        ),
        beat(
          "nw3_c_v3",
          "vera",
          "Then the plan dies with the money. I do not have another plan.",
          { expression: "looking at him now" }
        ),
        beat(
          "nw3_c_j4",
          "jack",
          "I did not tell her he moved the money. The sentence stayed behind my teeth. It was not mercy. It was the last fact in the room that belonged to me.",
          { expression: "V.O." }
        ),
        beat(
          "nw3_c_v4",
          "vera",
          "I paid Moe cash. He works Solomon's route. I carried Solomon's Friday payment upstairs, and nobody asked why I stayed after I handed him the envelope.",
          { expression: "matter-of-fact, which is how panic survives" }
        ),
        beat(
          "nw3_c_j5",
          "jack",
          "How much?",
          { expression: "the wrong question, asked anyway" }
        ),
        beat(
          "nw3_c_v5",
          "vera",
          "Eight thousand. He said he would make David quiet. Moe is a man who can turn quiet into a service."
        ),
        beat(
          "nw3_c_v5b",
          "vera",
          "Moe said David was already a problem for Solomon. I let myself hear that as permission. It was only an excuse.",
          { expression: "a correction she hates" }
        ),
        beat(
          "nw3_c_v6",
          "vera",
          "David dies. I take what he hid. I pay off the Blue Hour note. I leave Blackwood before Solomon has a reason to say my name twice. That was the plan.",
          { expression: "the plan laid out like a shopping list" }
        ),
        beat(
          "nw3_c_j6",
          "jack",
          "And the folder?",
          { expression: "quiet" }
        ),
        beat(
          "nw3_c_v7",
          "vera",
          "Insurance. If the killing got loud, the police would find a detective's file dated before the body. A frightened wife looking for a missing husband. You were supposed to be a clean fact with a receipt.",
          { expression: "no apology in it yet" }
        ),
        beat(
          "nw3_c_j7",
          "jack",
          "You hired me to make the search look real.",
          { expression: "V.O." }
        ),
        beat(
          "nw3_c_v8",
          "vera",
          "I hired you because you were outside Solomon's reach. I did not know you would keep coming back after the useful part was over.",
          { expression: "almost a smile" }
        ),
        beat("nw3_c_j8", "jack", "You could have told me to stop.", { expression: "quiet" }),
        beat("nw3_c_v9", "vera", "Would you?"),
        beat("nw3_c_j9", "jack", "No."),
        beat("nw3_c_j10", "jack", "She put the receipt between us. I put my hand over it, not hers. The distinction was getting harder to maintain.", { expression: "V.O." }),
      ],
      choices: [
        nav("nw3_c_receipt", "Take the receipt and ask when Moe arrives.", "nw3_kill", {
          attitudeTag: "Clever",
          consequences: { setFlags: ["nw3_jack_steps_in"], addItems: ["nw3_moe_receipt"] },
        }),
        nav("nw3_c_stay", "Put the receipt in your pocket. Say nothing useful.", "nw3_kill", {
          attitudeTag: "Sultry",
          consequences: { setFlags: ["nw3_jack_steps_in"], addItems: ["nw3_moe_receipt"], trustChanges: [{ characterId: "vera", delta: 1 }] },
        }),
        nav("nw3_c_time", "Ask for the time of the appointment.", "nw3_kill", {
          attitudeTag: "Aggressive",
          consequences: { setFlags: ["nw3_jack_steps_in"], addItems: ["nw3_moe_receipt"] },
        }),
      ],
      hotspots: [
        {
          id: "nw3_c_receipt_hs",
          label: "The carbon receipt",
          bounds: { x: 58, y: 58, w: 22, h: 20 },
          cursor: "take",
          showItemImage: true,
          isRepeatable: false,
          action: { type: "giveItem", itemGranted: "nw3_moe_receipt", flagSet: "nw3_offbook_seen" },
        },
        {
          id: "nw3_c_window",
          label: "The empty street",
          bounds: { x: 4, y: 12, w: 28, h: 40 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "The black sedan is gone. The street has not become safer. It has only stopped showing its work." },
        },
      ],
    },

    /* ================================================================ */
    /* ACT TWO — THE APPOINTMENT                                        */
    /* ================================================================ */
    {
      id: "nw3_kill",
      title: "Chapter Eight — The Appointment",
      nodeType: "cutscene",
      background: "/img/nw2/bg-yard-night.jpg",
      ambientAudio: "rain",
      particles: "storm",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.4,
      letterbox: true,
      choiceDelaySeconds: 4,
      cinematic: {
        mode: "shake",
        shakeAmount: 0.22,
        shakeDuration: 0.6,
        dimAmount: 0.4,
        lights: [
          { x: 76, y: 30, color: "#2a6cff", intensity: 0.26, size: 40, pulseSeconds: 1.9, pulseAmount: 1 },
          { x: 84, y: 34, color: "#ff2e3c", intensity: 0.24, size: 38, pulseSeconds: 2.3, pulseAmount: 1 },
        ],
      },
      prose:
        "EXT. DAVID'S RENTAL HOUSE — LATER. Jack arrives at the service road. Upstairs, somebody is arguing about coffee. A murder is often preceded by an argument about something that does not matter.",
      dialogueBeats: [
        beat(
          "nw3_k_j1",
          "jack",
          "I went because Vera gave me the time. I went because I had a receipt in my pocket. I went because the door was already in my head before I reached it.",
          { expression: "V.O." }
        ),
        beat("nw3_k_d1", "david", "Coffee is not supposed to taste like a tire fire."),
        beat("nw3_k_m1", "moe", "Then stop drinking motel coffee."),
        beat("nw3_k_d2", "david", "That is not an answer. That is a surrender with a lid on it."),
        beat("nw3_k_j2", "jack", "David. Open the door."),
        beat("nw3_k_d3", "david", "Morrow. Vera send you to check whether I am still breathing?"),
        beat("nw3_k_j3", "jack", "She sent me to find you. The rest is a matter between you and the room."),
        beat("nw3_k_d4", "david", "She found the numbers. I saw her find them. I moved the money. You can tell her that part if you want to make her night worse."),
        beat("nw3_k_m2", "moe", "Vera paid me for one job. I am not adding a second one for free."),
        beat("nw3_k_d5", "david", "Vera paid you to shoot a man and you are worried about the invoice?"),
        beat("nw3_k_j4", "jack", "I put one hand on the door. Moe saw it. David saw the gun. I had time to pull the door open. I spent it waiting for David to move."),
        beat("nw3_k_d6", "david", "The money is gone. I put it somewhere with no address and no witness. Nobody else alive knows where it is. When I am dead, that sentence gets shorter.", { expression: "to Jack" }),
        beat("nw3_k_j5", "jack", "You do not get to make the last line funny."),
        beat("nw3_k_d7", "david", "Everybody gets to make the last line funny. That is what the last line is for."),
        beat("nw3_k_s1", "jack", "One shot. The door opened into black.", { silent: true, audioUrl: "/nwt-gunshot.wav", background: "gradient:linear-gradient(#090b12,#000)", backgroundTransition: "cut" }),
        beat("nw3_k_m3", "moe", "She paid me for one job. Solomon did not send me. Do not make me remember whether you were here."),
        beat("nw3_k_j6", "jack", "Moe left. I picked up the casing and put it in the receipt envelope. It was the only thing in the room I could label. Then I waited for Vera, because somebody had to tell her the room had changed.", { expression: "V.O. — action, not confession" }),
      ],
      choices: [
        nav("nw3_k_enter", "Enter the room after the shot.", "nw3_empty", {
          attitudeTag: "Neutral",
          consequences: { setFlags: ["nw3_david_dead", "nw3_killer_paid", "nw3_empty_room"] },
        }),
      ],
      hotspots: [],
    },

    /* ================================================================ */
    /* ACT THREE — THE EMPTY ROOM                                       */
    /* ================================================================ */
    {
      id: "nw3_empty",
      title: "Chapter Nine — The Money Is Not There",
      partBreak: "Act Three — The Empty Room",
      background: "/img/nw2/bg-empty-booth.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.3,
      letterbox: true,
      cinematic: {
        mode: "static",
        dimAmount: 0.34,
        lights: [
          { x: 30, y: 28, color: "#ff2e88", intensity: 0.18, size: 32, pulseSeconds: 4.2, pulseAmount: 0.65 },
          { x: 70, y: 34, color: "#2ad9d9", intensity: 0.12, size: 38, pulseSeconds: 5.8, pulseAmount: 0.5 },
        ],
      },
      onEnterActions: [{ consequences: { setFlags: ["nw3_empty_room"] } }],
      prose:
        "INT. DAVID'S RENTAL HOUSE — AFTER. Vera enters with the key she was sure still worked. Jack is beside the body. The safe is open. The room has been edited.",
      dialogueBeats: [
        beat("nw3_e_v1", "vera", "Where is it?"),
        beat("nw3_e_j1", "jack", "The safe is empty."),
        beat("nw3_e_v2", "vera", "I did not ask about the safe. There was a bag. There was a second drawer. He kept cash where he could hear it being nervous."),
        beat("nw3_e_j2", "jack", "The dust had a rectangle in it. I knew what had occupied the rectangle. I did not tell her who moved it or when.", { expression: "V.O." }),
        beat("nw3_e_v3", "vera", "He took it."),
        beat("nw3_e_j3", "jack", "I do not know where it went."),
        beat("nw3_e_v4", "vera", "You know something."),
        beat("nw3_e_j4", "jack", "I know the room is empty. That is enough for now."),
        beat("nw3_e_v5", "vera", "No. It is not enough. The money was the exit. The money was the part that made the rest of this arithmetic instead of murder."),
        beat("nw3_e_j5", "jack", "Moe said your name."),
        beat("nw3_e_v6", "vera", "I paid him. I know what I did."),
        beat("nw3_e_v6b", "vera", "David was a bastard. He was still my husband. I did not plan for the room to look like this."),
        beat("nw3_e_v7", "vera", "I thought David would die, the money would be here, Solomon would get his note, and I would be gone by the time anybody had a question worth asking."),
        beat("nw3_e_j6", "jack", "You hired me to be the question that arrived first."),
        beat("nw3_e_v8", "vera", "I hired you to be a person the police could point at without pointing at me."),
        beat("nw3_e_j7", "jack", "She was shaking. I took off my coat and put it around her shoulders. She tried to hand it back. I held the collar closed until she stopped trying.", { expression: "V.O." }),
        beat("nw3_e_v9", "vera", "Do not make this kind by doing something kind now."),
        beat("nw3_e_j8", "jack", "I was not trying to make it kind. I was trying to keep you warm until the next bad decision.", { expression: "quiet" }),
      ],
      choices: [
        nav("nw3_e_tell", "Tell Vera the money is gone. Do not let her search alone.", "nw3_rosa", {
          attitudeTag: "Neutral",
          consequences: { setFlags: ["nw3_chose_tell"] },
        }),
        nav("nw3_e_cover", "Keep the empty safe out of the first report.", "nw3_rosa", {
          attitudeTag: "Clever",
          consequences: { setFlags: ["nw3_chose_cover"] },
        }),
      ],
      hotspots: [
        {
          id: "nw3_e_safe",
          label: "The empty safe",
          bounds: { x: 66, y: 36, w: 24, h: 42 },
          cursor: "take",
          showItemImage: true,
          isRepeatable: false,
          examine: true,
          examineSeconds: 2.4,
          action: { type: "giveItem", itemGranted: "nw3_empty_safe", flagSet: "nw3_money_moved_seen" },
        },
        {
          id: "nw3_e_phone",
          label: "David's phone",
          bounds: { x: 30, y: 72, w: 18, h: 14 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Three missed calls from Vera. The last call ended eleven minutes before David stopped answering." },
        },
      ],
    },

    /* ================================================================ */
    /* ACT THREE — ROSA                                                  */
    /* ================================================================ */
    {
      id: "nw3_rosa",
      title: "Chapter Ten — The File Is a Loaded Question",
      background: "/img/nw2/bg-rosa-car.jpg",
      ambientAudio: "drone",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.1,
      letterbox: true,
      cinematic: {
        mode: "static",
        dimAmount: 0.3,
        lights: [
          { x: 32, y: 58, color: "#ffb761", intensity: 0.22, size: 28, pulseSeconds: 6.2, pulseAmount: 0.35 },
          { x: 74, y: 32, color: "#2ad9d9", intensity: 0.14, size: 36, pulseSeconds: 7.2, pulseAmount: 0.4 },
        ],
      },
      prose:
        "INT. ROSA'S PARKED CAR — DAWN. Rosa has the folder on her lap and a stack of blank forms clipped to the wheel. Jack has dried rain on his sleeves and David's shell casing in his pocket.",
      dialogueBeats: [
        beat("nw3_r_j1", "jack", "Rosa read the first page twice. She did not look at me until she had checked the date.", { expression: "V.O." }),
        beat("nw3_r_r1", "rosa", "This file starts before the body. I checked the dates, the calls, and the places. Vera wanted a record that she had been looking for him."),
        beat("nw3_r_j2", "jack", "She wanted insurance."),
        beat("nw3_r_r2", "rosa", "Against the police?"),
        beat("nw3_r_j3", "jack", "A private detective's file. If the murder drew attention, it made me a possible suspect before it made her one."),
        beat("nw3_r_r3", "rosa", "That can be useful. It can also be perjury."),
        beat("nw3_r_j4", "jack", "She is afraid of Solomon. She is also the person who paid for David to be killed."),
        beat("nw3_r_r4", "rosa", "Those facts do not cancel each other. They make two separate charges."),
        beat("nw3_r_j5", "jack", "Moe did it. Private cash. Solomon did not order it."),
        beat("nw3_r_r5", "rosa", "Then the receipt is evidence. Who else has touched it?"),
        beat("nw3_r_j6", "jack", "Gone. David moved it before Vera knew he had seen her in the books. He died with the only address.", { expression: "V.O." }),
        beat("nw3_r_r6", "rosa", "You are not protecting her. You are making yourself part of the evidence. I am trying to keep you from becoming the part I have to file."),
        beat("nw3_r_j7", "jack", "I know.", { expression: "quiet" }),
      ],
      choices: [
        nav("nw3_r_share", "Give Rosa the off-book receipt.", "nw3_solomon_final", {
          hidden: true,
          attitudeTag: "Clever",
          presentItem: "nw3_moe_receipt",
          consumePresentedItem: false,
          consequences: { setFlags: ["nw3_evidence_shared"] },
        }),
        nav("nw3_r_keep", "Keep the receipt. Ask Rosa for one honest hour.", "nw3_solomon_final", {
          attitudeTag: "Sultry",
          consequences: { setFlags: ["nw3_evidence_kept"] },
        }),
      ],
      hotspots: [
        {
          id: "nw3_r_folder",
          label: "The insurance file",
          bounds: { x: 36, y: 42, w: 28, h: 30 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Every page says Vera was looking. No page says she had already bought the silence." },
        },
        {
          id: "nw3_r_windshield",
          label: "Rain on the windshield",
          bounds: { x: 28, y: 8, w: 44, h: 30 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Rosa looks forward. Jack looks at the folder. Both of them know which direction Vera went." },
        },
      ],
    },

    /* ================================================================ */
    /* ACT THREE — SOLOMON'S LAST OFFER                                 */
    /* ================================================================ */
    {
      id: "nw3_solomon_final",
      title: "Chapter Eleven — The Price of a Clean Name",
      background: "/img/nw2/bg-solomon-office.jpg",
      ambientAudio: "drone",
      particles: "smoke",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.2,
      letterbox: true,
      cinematic: {
        mode: "dolly",
        focalPoint: "50% 48%",
        dollyDistance: 3,
        dollyDuration: 26,
        dimAmount: 0.26,
        lights: [
          { x: 68, y: 30, color: "#ffb761", intensity: 0.28, size: 32, pulseSeconds: 5.8, pulseAmount: 0.4 },
          { x: 18, y: 46, color: "#2ad9d9", intensity: 0.1, size: 38, pulseSeconds: 8, pulseAmount: 0.35 },
        ],
      },
      prose:
        "INT. SOLOMON'S OFFICE — MORNING. Three folders lie on the desk: DAVID, VERA, JACK. Solomon opens Vera's file to the page marked Friday. The heater is silent for once. He does not need to ask which debt he is holding.",
      dialogueBeats: [
        beat("nw3_sf_s1", "solomon", "David Voss is dead. Moe has become difficult to locate. Two hundred and eleven thousand, four hundred and six dollars and seventeen cents is missing from my accounts."),
        beat("nw3_sf_j1", "jack", "David collected. The pages show he also kept two sets of numbers. He was careful with figures and careless with people."),
        beat("nw3_sf_s2", "solomon", "You are defending him by making him legible."),
        beat("nw3_sf_j2", "jack", "I am keeping the facts separate."),
        beat("nw3_sf_s3", "solomon", "Vera's payment is due Friday. The diner and apartment secure it. If she misses, I take both."),
        beat("nw3_sf_j3", "jack", "Moe takes cash jobs from whoever can find him."),
        beat("nw3_sf_s4", "solomon", "Moe takes private money from everybody. The question is whether he was paid to do a job or paid to become a witness."),
        beat("nw3_sf_j4", "jack", "He was paid to make David quiet. The money David stole is gone. Nobody alive knows where it is."),
        beat("nw3_sf_s5", "solomon", "Then Vera has a problem, you have a problem, and I have a missing number that refuses to die."),
        beat("nw3_sf_j5", "jack", "Solomon put the three folders in a row. I put my car keys on top of Vera's. He saw the move. He did not ask what it meant.", { expression: "V.O." }),
        beat("nw3_sf_s6", "solomon", "You are going to offer me something. People only put keys on paper when they are about to offer something."),
        beat("nw3_sf_j6", "jack", "Leave her name out of the first report. Take mine instead."),
        beat("nw3_sf_s7", "solomon", "That is collateral, Mr. Morrow. It is expensive because it is yours."),
        beat("nw3_sf_j7", "jack", "You charge for everything eventually."),
        beat("nw3_sf_s8", "solomon", "The money is gone. Vera's note is not. Your file is not. Which one of you should I believe when the police ask what happened in that room?"),
      ],
      choices: [
        nav("nw3_sf_truth", "Give Solomon Vera's confession and Moe's name.", "nw3_end_truth", {
          hidden: true,
          attitudeTag: "Clever",
          gating: { requiresFlags: ["nw3_evidence_shared"] },
          consequences: { setFlags: ["nw3_told_truth"] },
        }),
        nav("nw3_sf_debt", "Put the Blue Hour note on Jack's name.", "nw3_end_debt", {
          attitudeTag: "Sultry",
          consequences: { setFlags: ["nw3_jack_debt"] },
        }),
        nav("nw3_sf_alibi", "Keep Vera's name out. Let the file do its work.", "nw3_end_alibi", {
          attitudeTag: "Neutral",
          consequences: { setFlags: ["nw3_kept_alibi"] },
        }),
        nav("nw3_sf_empty", "Tell him the money is gone and nobody knows where.", "nw3_end_empty", {
          attitudeTag: "Aggressive",
          consequences: { setFlags: ["nw3_admitted_money_gone"] },
        }),
      ],
      hotspots: [
        {
          id: "nw3_sf_files",
          label: "The three folders",
          bounds: { x: 40, y: 52, w: 42, h: 26 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "David. Vera. Jack. Solomon has arranged the room as a sentence with three possible subjects." },
        },
        {
          id: "nw3_sf_heater",
          label: "The silent heater",
          bounds: { x: 8, y: 56, w: 22, h: 28 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "No ticking now. The silence is not an improvement." },
        },
      ],
    },

    /* ================================================================ */
    /* ENDINGS                                                          */
    /* ================================================================ */
    {
      id: "nw3_end_truth",
      title: "Ending — The Receipt Reads",
      background: "/img/bg-end-gold.jpg",
      ambientAudio: "rain",
      musicMode: "track",
      musicUrl: "/nobodys-witness.mp3",
      musicLevel: 0.48,
      transition: "fade-black",
      transitionSpeed: 1.6,
      letterbox: true,
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "THE RECEIPT READS",
        recap:
          "Jack gave Rosa the receipt, gave Solomon the name, and refused to let Vera's insurance file become the only version of her. Vera is alive. David is dead. The money remains missing, and the goodbye does not happen in a place built for goodbyes.",
      },
      prose:
        "I gave Rosa the receipt before I went upstairs. I gave Solomon the confession after. Vera did not look at me while they took her coat and asked her to sit down.",
      dialogueBeats: [
        beat("nw3_et_v1", "vera", "You put the keys on the folders."),
        beat("nw3_et_j1", "jack", "They were in the way."),
        beat("nw3_et_v2", "vera", "No. You put them where he could see them."),
        beat("nw3_et_j2", "jack", "Rosa will get you a lawyer."),
        beat("nw3_et_v3", "vera", "That is not what I asked."),
        beat("nw3_et_j3", "jack", "I know.", { expression: "V.O." }),
        beat("nw3_et_v4", "vera", "You kept coming back after the useful part was over."),
        beat("nw3_et_j4", "jack", "The useful part was never the part I was looking at.", { expression: "quiet" }),
        beat("nw3_et_v5", "vera", "Do not make a monument out of a bad decision."),
        beat("nw3_et_j5", "jack", "I moved the chair. I put the coat around her. I handed over the paper. Those were the only monuments I had.", { expression: "V.O. — final" }),
      ],
      choices: [],
      hotspots: [],
    },
    {
      id: "nw3_end_debt",
      title: "Ending — The Note Changes Hands",
      background: "/img/bg-end-vera.jpg",
      ambientAudio: "rain",
      musicMode: "track",
      musicUrl: "/nobodys-witness.mp3",
      musicLevel: 0.55,
      transition: "fade-black",
      transitionSpeed: 1.6,
      letterbox: true,
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "THE NOTE CHANGES HANDS",
        recap:
          "Jack put the Blue Hour note, his license, and his clean file on Solomon's desk. Vera's diner and apartment were released. Jack stayed in Solomon's orbit. Vera left with a bus ticket and no obligation to come back for the man who bought it.",
      },
      prose:
        "Solomon wrote my name under Vera's. He closed her note, not out of kindness, but because a debt that changes hands is still a debt and he likes his paperwork alive.",
      dialogueBeats: [
        beat("nw3_es_s1", "solomon", "Vera Voss owes me nothing. Jack Morrow owes me his working life. The money remains missing."),
        beat("nw3_es_j1", "jack", "Give her the keys."),
        beat("nw3_es_s2", "solomon", "You put them on the file yourself."),
        beat("nw3_es_j2", "jack", "I know where they are."),
        beat("nw3_es_v1", "vera", "You did not ask me to leave."),
        beat("nw3_es_j3", "jack", "The six o'clock bus is less patient than I am.", { expression: "at the station" }),
        beat("nw3_es_v2", "vera", "You put his hand on my door and called it an exit."),
        beat("nw3_es_j4", "jack", "I put your name on a debt he could collect from me instead."),
        beat("nw3_es_v3", "vera", "You put yours there instead."),
        beat("nw3_es_j5", "jack", "The bus door folded shut. I did not lift a hand. If she looked back, she would have had to decide what to do with me, and I had already made too many decisions for one morning.", { expression: "V.O. — final" }),
      ],
      choices: [],
      hotspots: [],
    },
    {
      id: "nw3_end_alibi",
      title: "Ending — The File Holds",
      background: "/img/bg-end-warn.jpg",
      ambientAudio: "rain",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.6,
      letterbox: true,
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "THE FILE HOLDS",
        recap:
          "Jack wrote the case as an innocent search and kept Vera's name out of the police version. The file held long enough for her to leave. Solomon kept the debt open, and Jack kept the receipt in the drawer beside his old badge.",
      },
      prose:
        "I wrote that Vera Voss hired me to find her missing husband. That was true. I left out the part where she had already chosen the ending.",
      dialogueBeats: [
        beat("nw3_ea_v1", "vera", "You can come with me."),
        beat("nw3_ea_j1", "jack", "No. The file needs one witness, not two.", { expression: "at the diner before dawn" }),
        beat("nw3_ea_v2", "vera", "You gave me your car."),
        beat("nw3_ea_j2", "jack", "It was parked."),
        beat("nw3_ea_v3", "vera", "You put the receipt in the drawer."),
        beat("nw3_ea_j3", "jack", "It was not doing anything useful on the table."),
        beat("nw3_ea_v4", "vera", "You keep making jokes when you want to say something else."),
        beat("nw3_ea_j4", "jack", "The jokes are cheaper.", { expression: "V.O." }),
        beat("nw3_ea_v5", "vera", "If the money turns up, do not find me."),
        beat("nw3_ea_j5", "jack", "She took the car and the clean report. I kept Solomon's deadline, the empty safe, and every sentence I had not said. The city got smaller behind her. I did not make it follow.", { expression: "V.O. — final" }),
      ],
      choices: [],
      hotspots: [],
    },
    {
      id: "nw3_end_empty",
      title: "Ending — The Money Stays Missing",
      background: "/img/bg-end-vanish.jpg",
      ambientAudio: "rain",
      musicMode: "track",
      musicUrl: "/nobodys-witness.mp3",
      musicLevel: 0.42,
      transition: "fade-black",
      transitionSpeed: 1.8,
      letterbox: true,
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "THE MONEY STAYS MISSING",
        recap:
          "Jack refused every trade and told Solomon the money was gone. Vera disappeared before morning. Solomon kept the debt open, the police kept the file, and nobody alive knew where David put the money. Jack kept the sentence that would have changed the ending to himself.",
      },
      prose:
        "I told Solomon the money was gone. He looked disappointed in the way a man looks at an empty vending machine: not hurt, just inconvenienced by the lack of a snack.",
      dialogueBeats: [
        beat("nw3_ee_s1", "solomon", "Then Vera's note remains open."),
        beat("nw3_ee_j1", "jack", "So does David's grave."),
        beat("nw3_ee_s2", "solomon", "A grave does not accrue interest."),
        beat("nw3_ee_j2", "jack", "Give it time.", { expression: "V.O." }),
        beat("nw3_ee_j3", "jack", "Vera was gone when I got back to the Blue Hour. Her keys were on the counter. The diner was unlocked. She had left the lights on for a place she did not intend to see again.", { expression: "V.O." }),
        beat("nw3_ee_v1", "vera", "Do not make promises you cannot pay.", { expression: "V.O. — remembered" }),
        beat("nw3_ee_j4", "jack", "I had not promised anything. That was the problem. I had only moved a chair, taken a coat, put my name where hers had been, and watched the door close without asking it to wait.", { expression: "V.O. — final" }),
      ],
      choices: [],
      hotspots: [],
    },
    {
      id: "nw3_end_refusal",
      title: "Ending — No Insurance",
      background: "/img/bg-end-refusal.jpg",
      ambientAudio: "rain",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.4,
      letterbox: true,
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "NO INSURANCE",
        recap:
          "Jack refused Vera's folder before he knew what was inside the second purpose. David still died, the money still vanished, and the police never got a file proving Vera had looked for him first.",
      },
      prose:
        "I slid the folder back. Vera took it without making a face. That was the last clean decision in the story, and it arrived before I knew what clean cost.",
      dialogueBeats: [
        beat("nw3_er_v1", "vera", "Thank you for being honest."),
        beat("nw3_er_j1", "jack", "It is a low bar."),
        beat("nw3_er_j2", "jack", "Three nights later, David Voss was dead and the morning paper used the phrase domestic uncertainty. Vera had no detective's file, no witness she had purchased in advance, and Solomon's name still fit the room.", { expression: "V.O." }),
        beat("nw3_er_j3", "jack", "I kept the coffee receipt from that night. Not because it meant anything. Because I had been there, and sometimes a man keeps the wrong proof.", { expression: "V.O. — final" }),
      ],
      choices: [],
      hotspots: [],
    },
  ],
};
