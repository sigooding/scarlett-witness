import type { Story } from "../types";

/* ────────────────────────────────────────────────────────────────────
 *  MOONLIGHTING — Season One, Episode One
 *  "Introduction: Maddie and David's Welcome Back"
 *
 *  A graphic-novel pastiche of the classic detective duet: Maddie Hayes
 *  and David Addison of the Blue Moon Detective Agency. Episode One plays
 *  as a plate-driven noir rail — one painted 16:9 plate per beat of the
 *  episode, wry third-person captions, and small conversational choices
 *  (replies + gated response beats) that flavour the run without derailing
 *  it. The season is structured so Episode Two (and beyond) can be added
 *  as further Episode entries on this same story.
 *
 *  All art lives in public/img/moonlighting/ (plates) — generated,
 *  consistent pulp-noir ink-and-wash style, 1980s Los Angeles.
 * ──────────────────────────────────────────────────────────────────── */

export const MOONLIGHTING: Story = {
  id: "moonlighting",
  title: "Moonlighting",
  tagline:
    "A detective agency by day. A moonlight job by night. And a best man's invitation no one knows how to refuse.",
  coverImage: "/img/moonlighting/cover.jpg",
  startSceneId: "ml_credits",
  seasonTitle: "Season One",

  episodes: [
    {
      id: "ml_ep1",
      number: 1,
      title: "Introduction: Maddie and David's Welcome Back",
      kicker: "MOONLIGHTING",
      tagline:
        "Two weeks in the sun, one answering machine, and a best man's invitation no one knows how to refuse.",
      sceneIds: [
        "ml_credits",
        "ml_welcome",
        "ml_voicemail",
        "ml_office",
        "ml_vacation",
        "ml_father_call",
        "ml_private",
        "ml_party",
        "ml_bestman",
        "ml_dilemma",
        "ml_end_silver",
        "ml_end_gold",
        "ml_end_game",
      ],
      startSceneId: "ml_credits",
      titleCardImage: "/img/moonlighting/ep1card.jpg",
      posterImage: "/img/moonlighting/ep1card.jpg",
      titleCardSeconds: 3.2,
      nextTimeLines: [
        "A wedding invitation arrives in the mail — with the wrong name on it.",
        "Maddie finds a second phone number in the files. It's the one that keeps ringing.",
      ],
    },
  ],

  acts: [
    {
      id: "ml_act1",
      label: "Act One",
      title: "Welcome Back",
      tagline: "The season's first moon, rising over the freeways like a bill not yet paid.",
      startSceneId: "ml_credits",
      titleCardSeconds: 0,
    },
    {
      id: "ml_act2",
      label: "Act Two",
      title: "The Best Man",
      tagline: "A wedding is one of the few rooms left where a family gets to choose its witnesses.",
      startSceneId: "ml_party",
      titleCardImage: "/img/moonlighting/party.jpg",
      titleCardSeconds: 3.0,
    },
  ],

  briefing: {
    objective:
      "It's week one of the new season. The Blue Moon Detective Agency is two weeks behind, one vacation richer, and one phone call from a decision. Keep the office standing — and the partner in it.",
    winConditions: [
      "Survive the welcome back, the answering machine, and the office party.",
      "Answer every phone that rings — including the ones with your name on them.",
      "Walk the street at the end and make a decision. Or don't. That's a decision too.",
    ],
    loseConditions: ["Call it in. The agency is open for business — with someone else."],
  },

  flagNotes: {
    ml_mothers_call:
      "Mrs. Addison called during the welcome back to confirm she is fine, you are fine, and the Emmys are real.",
    ml_waved_off: "Maddie let the mother call be the morning's only mystery, and closed it on the spot.",
    ml_named_it: "Maddie named the difference between a check-in and a check-up — and filed it.",
    ml_joked_cold: "Maddie made a joke about crying that the office is going to be paying for.",
    ml_left_message: "Maddie left a message on the answering machine — something the agency has never done.",
    ml_silence_kept: "The machine keeps Mr. Griggs's message as if it were the agency's own statement of policy.",
    ml_back_from_vacation:
      "The Blue Moon Detective Agency is open again: two weeks behind, one vacation richer, fully armed with opinions.",
    ml_stayed_honest: "Maddie traded the honest version of the vacation for the record.",
    ml_teased_fisherman: "The Bahamas fisherman is officially a scam that was paid for in sunburn.",
    ml_admiration: "Maddie admitted, for the record, that she missed her partner. It is in the files.",
    ml_father_first_call:
      "David's father called the office looking for David, who was in the room the entire time, in a different ocean.",
    ml_let_him_talk: "Maddie let David finish the speech about strangers. He finished it with a thank-you.",
    ml_said_straight: "Maddie said the straight version. David is still deciding whether to file it or frame it.",
    ml_turned_it: "Maddie turned the speech back on its author, and it did not know what to do with itself.",
    ml_rent_admitted: "David admitted the rent out loud, to the whole office, and called it a talent.",
    ml_smoked_it: "David turned a month of overdue rent into a folktale about a man named Griggs.",
    ml_father_asks:
      "Mr. Addison wants his son to stand as best man at the wedding to a woman who keeps the house standing.",
    ml_david_agreed: "David said yes to the wedding before the punch bowl was refilled.",
    ml_david_dodged:
      "David bought time on a party line, which is how he buys everything — in writing, on a deadline he sets.",
    ml_david_in_person:
      "David asked his father to come say it in person, at the office, in daylight, where the files can hear it.",
  },

  characters: [
    {
      id: "maddie",
      name: "Maddie Hayes",
      role: "Private Investigator · Blue Moon Detective Agency",
      avatarUrl: "/img/moonlighting/ch-maddie.jpg",
      trustMeter: 1,
      voice: { pitch: 0.95, rate: 1.0 },
    },
    {
      id: "david",
      name: "David Addison",
      role: "Partner · Showman · Can Open Jars",
      avatarUrl: "/img/moonlighting/ch-david.jpg",
      trustMeter: 1,
      voice: { pitch: 0.82, rate: 1.02 },
    },
    {
      id: "mother",
      name: "Mrs. Addison",
      role: "David's Mother · On the Phone",
      avatarUrl: "/img/moonlighting/ch-mother.jpg",
      trustMeter: 0,
      voice: { pitch: 1.05, rate: 0.97 },
    },
    {
      id: "father",
      name: "Mr. Addison",
      role: "David's Father · On the Phone",
      avatarUrl: "/img/moonlighting/ch-father.jpg",
      trustMeter: 0,
      voice: { pitch: 0.7, rate: 0.9 },
    },
    {
      id: "griggs",
      name: "Mr. Griggs",
      role: "The Landlord · On the Machine",
      avatarUrl: "/img/moonlighting/ch-griggs.jpg",
      trustMeter: -1,
      voice: { pitch: 0.72, rate: 1.0 },
    },
    {
      id: "gloria",
      name: "Gloria",
      role: "Receptionist · Blue Moon Detective Agency",
      avatarUrl: "/img/moonlighting/ch-gloria.jpg",
      trustMeter: 1,
      voice: { pitch: 1.0, rate: 1.05 },
    },
  ],

  items: [
    {
      id: "ml_rent_note",
      name: "Mr. Griggs's Note",
      icon: "📄",
      description:
        "THE RENT IS DUE. THE RADIATOR IN THE EAST OFFICE IS SICK. THE CEILING ON FOUR IS COMING DOWN AND I WANT IT UP BEFORE I SEE IT. COME UP AND LOOK AT MY CEILING. — G.",
      flavorText:
        "Typed, then crossed out, then typed again. The crossing out is the part that costs money.",
    },
    {
      id: "ml_postcard",
      name: "Postcard from the Côte d'Azur",
      icon: "🌊",
      description: "DEAR DAVID — the Riviera is a rumor and I am its witness. — M.",
      flavorText: "There's a stamp on the back. A real stamp. She mailed it.",
    },
    {
      id: "ml_invitation",
      name: "The Best Man's Invitation",
      icon: "💌",
      description:
        "Mr. Addison requests the honor of your presence as best man at the marriage of his family. The card is heavier than the request.",
      flavorText: "Formal paper, deep red seal. It does not rattle. That's how you know it's the real kind.",
    },
  ],

  layout: {
    ml_credits: { x: 0, y: 300 },
    ml_welcome: { x: 260, y: 300 },
    ml_voicemail: { x: 520, y: 300 },
    ml_office: { x: 780, y: 300 },
    ml_vacation: { x: 1040, y: 300 },
    ml_father_call: { x: 1300, y: 300 },
    ml_private: { x: 1560, y: 300 },
    ml_party: { x: 1820, y: 300 },
    ml_bestman: { x: 2080, y: 300 },
    ml_dilemma: { x: 2340, y: 300 },
    ml_end_silver: { x: 2600, y: 160 },
    ml_end_gold: { x: 2600, y: 300 },
    ml_end_game: { x: 2600, y: 440 },
  },

  scenes: [
    /* ============================================================ *
     *  ACT ONE — Welcome Back                                      *
     * ============================================================ */
    {
      id: "ml_credits",
      title: "Opening Credits",
      nodeType: "credits",
      background: "/img/moonlighting/cover.jpg",
      ambientAudio: "jazz",
      noTypewriter: true,
      transition: "cut",
      letterbox: true,
      choiceDelaySeconds: 8,
      credits: {
        title: "MOONLIGHTING",
        subtitle: "A detective serial from the Blue Moon Detective Agency",
        style: "cards",
        cardSeconds: 2.8,
        font: "poster",
        cardMotion: "letterspace",
        titleEntrance: "slam",
        accentColor: "#8fd8ff",
        gateWeave: "subtle",
        montage: [
          "/img/moonlighting/cover.jpg",
          "/img/moonlighting/welcome.jpg",
          "/img/moonlighting/office.jpg",
          "/img/moonlighting/party.jpg",
          "/img/moonlighting/street.jpg",
        ],
        montageSeconds: 3.5,
        montageTransition: "cut",
        lines: [
          { role: "Starring", name: "Maddie Hayes" },
          { role: "and", name: "David Addison" },
          { role: "Episode One", name: "Welcome Back" },
        ],
      },
      prose:
        "Los Angeles. The season's first moon, rising over the freeways like a bill not yet paid.",
      choices: [
        {
          id: "ml_c_begin",
          text: "Roll the tape",
          targetSceneId: "ml_welcome",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ── Welcome Back ─────────────────────────────────────────── */
    {
      id: "ml_welcome",
      title: "Welcome Back",
      background: "/img/moonlighting/welcome.jpg",
      ambientAudio: "jazz",
      letterbox: true,
      transition: "fade",
      onEnterActions: [{ consequences: { setFlags: ["ml_mothers_call"] } }],
      prose:
        "The camera is on. Somewhere behind it, a small television studio built out of a big detective agency: two people with exactly two weeks of sun and exactly one thing to say.",
      dialogueBeats: [
        {
          id: "ml_w_b1",
          characterId: "maddie",
          expression: "warm",
          text: "Welcome back. I'm Maddie Hayes, and I promise you — we saved the good cases for the season. The bad ones, we saved for the files.",
        },
        {
          id: "ml_w_b2",
          characterId: "david",
          expression: "grinning",
          text: "And I'm David Addison. The sun got to me. It took my hat, my shoes, and one very good argument. I'm back, and I apologize for none of it.",
        },
        {
          id: "ml_w_b3",
          characterId: "narrator",
          expression: "V.O. — the phone",
          text: "The phone rings. Of course the phone rings. It rings the way things do when you least want them to — politely, and all at once.",
        },
        {
          id: "ml_w_b4",
          characterId: "david",
          expression: "instantly professional",
          text: "David Addison.",
        },
        {
          id: "ml_w_b5",
          characterId: "mother",
          expression: "concerned",
          text: "David, darling. I just need you to hear my voice for a moment, so that you can keep it.",
        },
        {
          id: "ml_w_b6",
          characterId: "david",
          text: "Ma. You sound like a woman who has a request.",
        },
        {
          id: "ml_w_b7",
          characterId: "mother",
          text: "I have one. Are you going to be there? At the ceremony? They say you're in the running, and I need to know how much of that is true.",
        },
        {
          id: "ml_w_b8",
          characterId: "david",
          text: "Ma, I play a private eye on television. The Emmys are for people with a long list of things they're good at. I have a short list, and I lost the rest of it at the beach.",
        },
        {
          id: "ml_w_b9",
          characterId: "mother",
          text: "Oh, stop it. You're good at something, or the people who pay you wouldn't be paying you. Now — are you well? Are you feeding yourself? And what is that sound in the background?",
        },
        {
          id: "ml_w_b10",
          characterId: "david",
          text: "That's the agency, Ma. It's the sound of a business I own, being run by people I trust.",
        },
        {
          id: "ml_w_b11",
          characterId: "maddie",
          expression: "dry",
          text: "David. The camera is on.",
        },
        {
          id: "ml_w_b12",
          characterId: "david",
          text: "Ma, I have to go. I'm in a room with a very good listener.",
        },
        {
          id: "ml_w_b13",
          characterId: "mother",
          text: "You were never a good listener, David. That's the whole point of the call. How's your health?",
        },
        {
          id: "ml_w_b14",
          characterId: "david",
          text: "Excellent, Ma. I've been doing a lot of things in the sun. I'm stronger than I've ever been. I can open jars.",
        },
        {
          id: "ml_w_b15",
          characterId: "mother",
          text: "I know you can. I'm calling to make sure you know I can, too. We're both fine. That's the whole message. I love you, you wonderful disaster.",
        },
        {
          id: "ml_w_b16",
          characterId: "david",
          expression: "smiling, a little off",
          text: "She's fine. That's what she calls about. That's what I answer.",
        },
        /* responses to the mother call — one per reply, gated on its flag */
        {
          id: "ml_w_b17a",
          characterId: "maddie",
          expression: "dry",
          text: "…That was your mother. That's the agency's first file of the season, and I've already closed it.",
          conditionRule: { requiresFlags: ["ml_waved_off"] },
        },
        {
          id: "ml_w_b17b",
          characterId: "maddie",
          text: "I miss people who call to check on me. There's a difference. It's called the answering machine.",
          conditionRule: { requiresFlags: ["ml_named_it"] },
        },
        {
          id: "ml_w_b17c",
          characterId: "maddie",
          expression: "flat",
          text: "I don't cry on the job. It's a policy. It's on the wall, behind the files, with the rest of them.",
          conditionRule: { requiresFlags: ["ml_joked_cold"] },
        },
      ],
      choices: [
        /* the three ways to answer the ringing — one survives */
        {
          id: "ml_w_q_wave",
          text: "Say nothing. Keep waving.",
          targetSceneId: "",
          attitudeTag: "Neutral",
          reply: true,
          exclusiveGroup: "ml_welcome_q",
          consequences: { setFlags: ["ml_waved_off"] },
        },
        {
          id: "ml_w_q_named",
          text: "\u201cYou miss her, don't you.\u201d",
          targetSceneId: "",
          attitudeTag: "Clever",
          reply: true,
          exclusiveGroup: "ml_welcome_q",
          consequences: {
            setFlags: ["ml_named_it"],
            trustChanges: [{ characterId: "maddie", delta: 1 }],
          },
        },
        {
          id: "ml_w_q_cry",
          text: "\u201cAt least you didn't cry. That would have been embarrassing for her.\u201d",
          targetSceneId: "",
          attitudeTag: "Aggressive",
          reply: true,
          exclusiveGroup: "ml_welcome_q",
          consequences: {
            setFlags: ["ml_joked_cold"],
            meterChanges: [{ meter: "Suspicion", delta: 1 }],
          },
        },
        /* the exit reveals once the player has answered something */
        {
          id: "ml_w_go",
          text: "Let the welcome back finish",
          targetSceneId: "ml_voicemail",
          attitudeTag: "Neutral",
          hidden: true,
          gating: {
            requiresFlags: ["ml_waved_off", "ml_named_it", "ml_joked_cold"],
            requiresAll: false,
          },
        },
      ],
    },

    /* ── The Answering Machine ────────────────────────────────── */
    {
      id: "ml_voicemail",
      title: "The Answering Machine",
      background: "/img/moonlighting/machine.jpg",
      ambientAudio: "drone",
      letterbox: true,
      transition: "fade-black",
      prose:
        "Two weeks of messages, and the agency's voice is still the one on the machine. It plays every time, to every caller, in exactly the same key — which is how you can tell, right away, which messages are the real ones.",
      dialogueBeats: [
        {
          id: "ml_vm_b1",
          characterId: "david",
          expression: "V.O. — recorded",
          text: "You've reached the Blue Moon Detective Agency. We're the ones you call when the other one can't help. We've been out in the sun, and we've been back in it. We'll be back when it's dark again. Leave a message, or don't — the machine has time.",
        },
        {
          id: "ml_vm_b2",
          characterId: "narrator",
          text: "A click. Then a voice that has clearly been on hold for a long time.",
        },
        {
          id: "ml_vm_b3",
          characterId: "griggs",
          expression: "V.O. — grumpy, recorded",
          text: "This is Mr. Griggs, the landlord. I don't care where you went. The rent is due. The radiator in the east office is sick. And the ceiling on four is coming down, and I want it up before I see it. I'm coming up at nine. Don't make me knock. — G.",
        },
        {
          id: "ml_vm_b4",
          characterId: "maddie",
          expression: "dry",
          text: "He always signs with the G. It's a signature. I've been meaning to point out that the crossing out costs extra.",
        },
        {
          id: "ml_vm_b5",
          characterId: "david",
          text: "Maddie, I'm telling you, that man has a heart of stone. A stone heart that pays its own mortgage on time.",
        },
        {
          id: "ml_vm_b6a",
          characterId: "maddie",
          expression: "V.O. — recorded, calm",
          text: "This is a message from the agency. We are back. We are open. And if you are a landlord, we hope the ceiling gives you the satisfaction you deserve. Blue Moon Detective Agency — we answer, eventually.",
          conditionRule: { requiresFlags: ["ml_left_message"] },
        },
        {
          id: "ml_vm_b6b",
          characterId: "maddie",
          text: "Some machines are museums. I'm not in the business of curating.",
          conditionRule: { requiresFlags: ["ml_silence_kept"] },
        },
      ],
      choices: [
        {
          id: "ml_v_q_leave",
          text: "Add your own message to the tape",
          targetSceneId: "",
          attitudeTag: "Clever",
          reply: true,
          exclusiveGroup: "ml_machine_q",
          consequences: { setFlags: ["ml_left_message"] },
        },
        {
          id: "ml_v_q_keep",
          text: "Don't bother. Let it keep his.",
          targetSceneId: "",
          attitudeTag: "Neutral",
          reply: true,
          exclusiveGroup: "ml_machine_q",
          consequences: { setFlags: ["ml_silence_kept"] },
        },
        {
          id: "ml_v_go",
          text: "Head up to the office",
          targetSceneId: "ml_office",
          attitudeTag: "Neutral",
          hidden: true,
          gating: {
            requiresFlags: ["ml_left_message", "ml_silence_kept"],
            requiresAll: false,
          },
        },
      ],
    },

    /* ── Back at the Office ───────────────────────────────────── */
    {
      id: "ml_office",
      title: "Nine A.M., Blue Moon",
      background: "/img/moonlighting/office.jpg",
      ambientAudio: "jazz",
      letterbox: true,
      onEnterActions: [{ consequences: { setFlags: ["ml_back_from_vacation"] } }],
      prose:
        "The office smells like morning and old paper. The fan is going around, the clock is on time, and there's a note under the doorstop that no one has picked up — because for two weeks, no one was here to pick it up.",
      dialogueBeats: [
        {
          id: "ml_o_b1",
          characterId: "gloria",
          expression: "warm, tired",
          text: "You two are actually alive. I put your mail on the desk and your coffee in the good pot. I want you to know the good pot is a limit, not a right.",
        },
        {
          id: "ml_o_b2",
          characterId: "david",
          expression: "flamboyant",
          background: "/img/moonlighting/entrance.jpg",
          backgroundTransition: "cut",
          text: "Gloria. Darlings. The sun has set, the moon is on the clock, and the Blue Moon Detective Agency is open for business — business, as always, being people who have problems and the money to be seen having them.",
        },
        {
          id: "ml_o_b3",
          characterId: "gloria",
          expression: "rolling her eyes",
          text: "You're the only one here who came back from that vacation. The rest of us just aged it.",
        },
        {
          id: "ml_o_b4",
          characterId: "maddie",
          text: "Morning, Gloria. The files are on the left, the coffee is a limited resource, and the landlord is coming at nine.",
        },
        {
          id: "ml_o_b5",
          characterId: "david",
          text: "The landlord! My favorite kind of client. He's the one case I've never closed, and I've been at it since 1974.",
        },
        {
          id: "ml_o_b6a",
          characterId: "gloria",
          text: "And you left a message on the machine. A message. From the agency. I've been working here four years and I've never seen that. I'm keeping a copy.",
          conditionRule: { requiresFlags: ["ml_left_message"] },
        },
        {
          id: "ml_o_b6b",
          characterId: "gloria",
          text: "And you let Mr. Griggs keep his message on the machine. That's either respect or a war crime, and I'm still deciding which.",
          conditionRule: { requiresFlags: ["ml_silence_kept"] },
        },
      ],
      hotspots: [
        {
          id: "ml_o_h_note",
          label: "The note under the doorstop",
          cursor: "take",
          bounds: { x: 6, y: 64, w: 14, h: 16 },
          action: { type: "giveItem", itemGranted: "ml_rent_note" },
          showItemImage: true,
        },
        {
          id: "ml_o_h_machine",
          label: "The answering machine",
          cursor: "look",
          bounds: { x: 72, y: 58, w: 16, h: 18 },
          action: {
            type: "showText",
            text: "The red light is off. It holds two weeks of callers and exactly one landlord, and it keeps them all, in order, like a man who knows he will be heard eventually.",
          },
        },
      ],
      choices: [
        {
          id: "ml_o_go",
          text: "Show off the vacations",
          targetSceneId: "ml_vacation",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ── Two Vacations, One Desk ──────────────────────────────── */
    {
      id: "ml_vacation",
      title: "Two Vacations, One Desk",
      background: "/img/moonlighting/desk.jpg",
      ambientAudio: "jazz",
      letterbox: true,
      prose:
        "Two weeks of sun, and it comes back to the office in two different sizes. Hers is on a postcard. His is in a story that gets longer the more he tells it.",
      dialogueBeats: [
        {
          id: "ml_vac_b1",
          characterId: "maddie",
          expression: "calm, a little pleased",
          text: "I spent two weeks on the Côte d'Azur. I watched a man sell a hat, and I bought three, and I have no regrets. I would like to show you the proof.",
        },
        {
          id: "ml_vac_b2",
          characterId: "david",
          expression: "grinning",
          text: "I spent two weeks in the Bahamas. I lost a cruise to a fisherman who owed me money, I invented a new way to lose a card game, and I have a tan that could be notarized. Which vacation was better is a question I'd like to put to the staff.",
        },
        {
          id: "ml_vac_b3",
          characterId: "narrator",
          text: "The staff, having just seen him, votes with its shoulders.",
        },
        {
          id: "ml_v_b4a",
          characterId: "maddie",
          text: "The truth is, I missed the files. I took the postcards because the files wouldn't. That's the whole comparison, and it isn't a fair one.",
          conditionRule: { requiresFlags: ["ml_stayed_honest"] },
        },
        {
          id: "ml_v_b4b",
          characterId: "maddie",
          text: "A fisherman who owed you money. In the Bahamas. You didn't meet a fisherman, David. You met a scam, and you paid for it in sunburn.",
          conditionRule: { requiresFlags: ["ml_teased_fisherman"] },
        },
        {
          id: "ml_v_b4c",
          characterId: "maddie",
          expression: "flat",
          text: "…That's not what I said.",
          conditionRule: { requiresFlags: ["ml_admiration"] },
        },
        {
          id: "ml_v_b4d",
          characterId: "david",
          expression: "delighted",
          text: "That is exactly what you said. I'm writing it down. For the record. For the agency.",
          conditionRule: { requiresFlags: ["ml_admiration"] },
        },
      ],
      hotspots: [
        {
          id: "ml_v_h_postcard",
          label: "The postcard on the blotter",
          cursor: "take",
          bounds: { x: 42, y: 66, w: 14, h: 14 },
          action: { type: "giveItem", itemGranted: "ml_postcard" },
          showItemImage: true,
        },
      ],
      choices: [
        {
          id: "ml_v_q_honest",
          text: "Trade stories, honestly",
          targetSceneId: "",
          attitudeTag: "Neutral",
          reply: true,
          exclusiveGroup: "ml_vacation_q",
          consequences: {
            setFlags: ["ml_stayed_honest"],
            trustChanges: [{ characterId: "maddie", delta: 1 }],
          },
        },
        {
          id: "ml_v_q_tease",
          text: "Tease him about the fisherman",
          targetSceneId: "",
          attitudeTag: "Clever",
          reply: true,
          exclusiveGroup: "ml_vacation_q",
          consequences: {
            setFlags: ["ml_teased_fisherman"],
            meterChanges: [{ meter: "Clever", delta: 1 }],
          },
        },
        {
          id: "ml_v_q_missed",
          text: "\u201cI didn't miss the files. I missed you.\u201d",
          targetSceneId: "",
          attitudeTag: "Sultry",
          reply: true,
          exclusiveGroup: "ml_vacation_q",
          consequences: {
            setFlags: ["ml_admiration"],
            trustChanges: [{ characterId: "maddie", delta: 2 }],
          },
        },
        {
          id: "ml_vac_go",
          text: "Let the morning settle",
          targetSceneId: "ml_father_call",
          attitudeTag: "Neutral",
          hidden: true,
          gating: {
            requiresFlags: ["ml_stayed_honest", "ml_teased_fisherman", "ml_admiration"],
            requiresAll: false,
          },
        },
      ],
    },

    /* ── A Call From California ───────────────────────────────── */
    {
      id: "ml_father_call",
      title: "A Call From California",
      background: "/img/moonlighting/deskphone.jpg",
      ambientAudio: "drone",
      letterbox: true,
      onEnterActions: [{ consequences: { setFlags: ["ml_father_first_call"] } }],
      prose:
        "The phone rings at the exact moment the office has stopped talking, which never happens by accident. Maddie picks it up the way she picks everything up — without ceremony.",
      dialogueBeats: [
        {
          id: "ml_f_b1",
          characterId: "maddie",
          text: "Blue Moon Detective Agency, Maddie Hayes.",
        },
        {
          id: "ml_f_b2",
          characterId: "father",
          expression: "V.O. — formal, distant",
          text: "Maddie. It's Richard Addison. Is my son in?",
        },
        {
          id: "ml_f_b3",
          characterId: "maddie",
          text: "He's right here, Mr. Addison.",
        },
        {
          id: "ml_f_b4",
          characterId: "david",
          expression: "background",
          text: "Wait. I didn't know I had a father in Los Angeles.",
        },
        {
          id: "ml_f_b5",
          characterId: "father",
          text: "Of course he's in. I was told he was in Malibu, so I was calling about the house. The sea air there is no good for his coat, and I was starting to worry.",
        },
        {
          id: "ml_f_b6",
          characterId: "david",
          expression: "taking the phone",
          text: "Dad. I was in the Bahamas.",
        },
        {
          id: "ml_f_b7",
          characterId: "father",
          expression: "a pause",
          text: "The Bahamas. Well. I suppose the sea air is the same sea air. Are you well, son?",
        },
        {
          id: "ml_f_b8",
          characterId: "david",
          text: "I'm better than I've ever been. I can open jars.",
        },
        {
          id: "ml_f_b9",
          characterId: "maddie",
          expression: "quiet",
          text: "He says that to everyone now. I don't think it's a joke. I think it's a report.",
        },
        {
          id: "ml_f_b10",
          characterId: "father",
          text: "Good. Good. I'll call again, when I need to. Tell him I said it.",
        },
        {
          id: "ml_f_b11",
          characterId: "maddie",
          expression: "phone down",
          text: "Well. That was… something.",
        },
        {
          id: "ml_f_b12",
          characterId: "david",
          expression: "smiling, a little off",
          text: "Something's right. That's all my family ever was. I'll be right back.",
        },
      ],
      choices: [
        {
          id: "ml_f_go",
          text: "Let the day run out",
          targetSceneId: "ml_private",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ── After Hours ──────────────────────────────────────────── */
    {
      id: "ml_private",
      title: "After Hours",
      background: "/img/moonlighting/afterhours.jpg",
      ambientAudio: "drone",
      letterbox: true,
      transition: "fade-black",
      prose:
        "Nine comes and goes, and the ceiling on four waits patiently to come down. The office empties, and what's left of it sits in two chairs at the edge of the desk, saying the things that don't get said during the day.",
      dialogueBeats: [
        {
          id: "ml_p_b1",
          characterId: "maddie",
          text: "Two weeks. That was a long two weeks.",
        },
        {
          id: "ml_p_b2",
          characterId: "david",
          expression: "teasing",
          text: "Two weeks without me, and you've already learned to make coffee that isn't a crime. I'm proud of you. I'm also going to have to see it to believe it.",
        },
        {
          id: "ml_p_b3",
          characterId: "maddie",
          expression: "serious",
          text: "I didn't miss you. I got ahead on the files. There's a difference, and I'd like it noted.",
        },
        {
          id: "ml_p_b4",
          characterId: "david",
          text: "Noted. And I didn't miss you either. I just found a place where no one knew my name, and I spent two weeks being a stranger. It was the best two weeks of the year, and it's over, and the strangest part is that I don't want to go back to it.",
        },
        {
          id: "ml_p_b5",
          characterId: "narrator",
          text: "The neon across the street comes on in the window, one letter at a time. They sit in it. Neither of them reaches for the coffee, which is how you can tell this part is the real part.",
        },
        {
          id: "ml_p_b6a",
          characterId: "david",
          expression: "quiet, for once",
          text: "What I'm saying is, the agency is the only place where being me doesn't cost me anything. And you're the only person here who makes that true. So. Thanks for coming back. Even if it was only for the files.",
          conditionRule: { requiresFlags: ["ml_let_him_talk"] },
        },
        {
          id: "ml_p_b6b",
          characterId: "david",
          expression: "surprised, then still",
          text: "…That's the first time you've said that without a 'for the record' on the end of it. I'd like to put it in the files. Or frame it. I'm still deciding.",
          conditionRule: { requiresFlags: ["ml_said_straight"] },
        },
        {
          id: "ml_p_b6c",
          characterId: "david",
          expression: "the grin, slightly out of order",
          text: "Proud of either one, to be clear. The stranger was a good act. But the one who came back is the only role that has a chair at this desk.",
          conditionRule: { requiresFlags: ["ml_turned_it"] },
        },
      ],
      choices: [
        {
          id: "ml_p_q_let",
          text: "Let him keep talking",
          targetSceneId: "",
          attitudeTag: "Neutral",
          reply: true,
          exclusiveGroup: "ml_private_q",
          consequences: {
            setFlags: ["ml_let_him_talk"],
            trustChanges: [{ characterId: "maddie", delta: 1 }],
          },
        },
        {
          id: "ml_p_q_straight",
          text: "\u201cHere's the straight version. I didn't come back for the files.\u201d",
          targetSceneId: "",
          attitudeTag: "Clever",
          reply: true,
          exclusiveGroup: "ml_private_q",
          consequences: {
            setFlags: ["ml_said_straight"],
            trustChanges: [{ characterId: "maddie", delta: 2 }],
          },
        },
        {
          id: "ml_p_q_turn",
          text: "\u201cYou went to be a stranger so you wouldn't have to be you.\u201d",
          targetSceneId: "",
          attitudeTag: "Sultry",
          reply: true,
          exclusiveGroup: "ml_private_q",
          consequences: {
            setFlags: ["ml_turned_it"],
            meterChanges: [{ meter: "Sultry", delta: 1 }],
          },
        },
        {
          id: "ml_p_go",
          text: "Let the night run out",
          targetSceneId: "ml_party",
          attitudeTag: "Neutral",
          hidden: true,
          gating: {
            requiresFlags: ["ml_let_him_talk", "ml_said_straight", "ml_turned_it"],
            requiresAll: false,
          },
        },
      ],
    },

    /* ============================================================ *
     *  ACT TWO — The Best Man                                      *
     * ============================================================ */
    {
      id: "ml_party",
      title: "The Office Party",
      background: "/img/moonlighting/party.jpg",
      ambientAudio: "jazz",
      musicUrl: "/nwt-bluecue-jukebox.mp3",
      musicMode: "track",
      musicLevel: 0.7,
      letterbox: true,
      prose:
        "Some offices throw a party because the rent is paid. The Blue Moon Detective Agency throws one because a man in a white suit has decided that a Tuesday is a mistake, and he intends to correct it. There are balloons. There is a bar. There is a banner, and the banner is, frankly, a mistake.",
      dialogueBeats: [
        {
          id: "ml_pa_b1",
          characterId: "david",
          expression: "on his feet",
          text: "Welcome, everyone, to the most important party of the year: the party where we pretend the last two weeks didn't happen. Drinks are on the agency, the agency is on the rent, and the rent is on a man named Griggs, who I am told is a man of his word. All of his word.",
        },
        {
          id: "ml_pa_b2",
          characterId: "gloria",
          expression: "deadpan",
          text: "You mean the word where he comes up at nine. We are past nine, David. We have been past nine for a month. This party is how we're not answering the door.",
        },
        {
          id: "ml_pa_b3",
          characterId: "narrator",
          text: "For an hour it works. There is music, and there is punch, and there is a man in a white suit pouring drinks with the seriousness of a man defusing something. The office, for an hour, is a place where no one is owed anything.",
        },
        {
          id: "ml_pa_b4",
          characterId: "gloria",
          text: "Before the next thing — you're not going to tell the whole room, are you? About the rent? About the repairs? Because the room already knows, and the room is doing its very best not to say it out loud.",
        },
        {
          id: "ml_pa_b5a",
          characterId: "david",
          expression: "charming, with the edges in",
          text: "The rent is due, the ceiling is down, and I've been thinking about it all day. Here is the good news: I am a man who is very good at being late to exactly the things that matter. It's a talent. Tonight, it's a budget.",
          conditionRule: { requiresFlags: ["ml_rent_admitted"] },
        },
        {
          id: "ml_pa_b5b",
          characterId: "david",
          expression: "effortless",
          text: "Griggs is a myth. He's like the Loch Ness monster — everyone has seen him, and no one has ever had a meeting with him. The rent, like the monster, is a story the neighbors tell to scare new tenants. And the new tenants, in case you haven't noticed, are all of us.",
          conditionRule: { requiresFlags: ["ml_smoked_it"] },
        },
        {
          id: "ml_pa_b6",
          characterId: "narrator",
          expression: "V.O. — the phone",
          text: "And then the phone rings. It has been quiet all day, and everyone knows what that means. The room does not go quiet. The room goes the other way — everyone looks at the door, and the door looks at the phone, and the phone looks at David, who is the only one in the room who answers it without being asked.",
        },
      ],
      choices: [
        {
          id: "ml_pa_q_truth",
          text: "Tell the truth, briefly",
          targetSceneId: "",
          attitudeTag: "Neutral",
          reply: true,
          exclusiveGroup: "ml_party_q",
          consequences: { setFlags: ["ml_rent_admitted"] },
        },
        {
          id: "ml_pa_q_smoke",
          text: "Blow smoke",
          targetSceneId: "",
          attitudeTag: "Aggressive",
          reply: true,
          exclusiveGroup: "ml_party_q",
          consequences: {
            setFlags: ["ml_smoked_it"],
            meterChanges: [{ meter: "Suspicion", delta: 1 }],
          },
        },
        {
          id: "ml_pa_go",
          text: "Take the call",
          targetSceneId: "ml_bestman",
          attitudeTag: "Neutral",
          hidden: true,
          gating: {
            requiresFlags: ["ml_rent_admitted", "ml_smoked_it"],
            requiresAll: false,
          },
        },
      ],
    },

    /* ── The Request ──────────────────────────────────────────── */
    {
      id: "ml_bestman",
      title: "The Request",
      background: "/img/moonlighting/davidphone.jpg",
      ambientAudio: "jazz",
      musicMode: "inherit",
      letterbox: true,
      transition: "fade-black",
      onEnterActions: [{ consequences: { setFlags: ["ml_father_asks"] } }],
      prose:
        "The party keeps going behind him, which is the hardest part. He takes the phone to the window, out of the lights, and the room watches him the way a room watches a man who has just remembered his name.",
      dialogueBeats: [
        {
          id: "ml_bm_b1",
          characterId: "david",
          text: "Addison.",
        },
        {
          id: "ml_bm_b2",
          characterId: "father",
          text: "David. I'm not calling to check on the house this time.",
        },
        {
          id: "ml_bm_b3",
          characterId: "david",
          text: "Then what are you calling about. Because the last time you called, the house was in two different oceans.",
        },
        {
          id: "ml_bm_b4",
          characterId: "father",
          expression: "careful",
          text: "I'm calling about a wedding.",
        },
        {
          id: "ml_bm_b5",
          characterId: "david",
          expression: "a beat of silence",
          text: "Dad. That word is a door. What's behind it?",
        },
        {
          id: "ml_bm_b6",
          characterId: "father",
          text: "I'm getting married again, David. A woman who keeps a house, a garden, and a ledger. She keeps them all. I want you to be the best man.",
        },
        {
          id: "ml_bm_b7",
          characterId: "david",
          text: "The best man. The only witness my family ever asked for was to the other man's happiness. That's a lot of weight for a man who can't open a door without it swinging.",
        },
        {
          id: "ml_bm_b8",
          characterId: "father",
          text: "I'm not asking a client, David. I'm asking a son. I know what you think of me. I know what I gave you, and I know what I didn't. I'm not calling to fix any of it. I'm calling because a wedding is one of the few rooms left where a family gets to choose its own witnesses. I'd like you to be one of them.",
        },
        {
          id: "ml_bm_b9",
          characterId: "david",
          text: "You want me to stand there and be the witness. To what — that you found a better way to do it? That's the part I don't know how to say yes to. That's the part I don't know how to say no to either.",
        },
        {
          id: "ml_bm_b10",
          characterId: "father",
          text: "You don't have to say anything tonight. I'll send the card. Just — don't be the man who doesn't answer. That's the only request I have.",
        },
        {
          id: "ml_bm_b11",
          characterId: "narrator",
          text: "The phone goes down. The party, which has been holding its breath, lets it out all at once, and no one says anything, because there is nothing to say that isn't about the man by the window.",
        },
        {
          id: "ml_bm_b12",
          characterId: "gloria",
          background: "/img/moonlighting/courier.jpg",
          backgroundTransition: "cut",
          text: "Mr. Addison sent a courier. The card is on the bar.",
        },
        {
          id: "ml_bm_b13",
          characterId: "david",
          expression: "quiet",
          text: "It's a heavy piece of paper. It's always the heavy ones that cost you.",
        },
        /* the three answers — one survives */
        {
          id: "ml_bm_b14a",
          characterId: "david",
          expression: "into the phone, firm",
          text: "I'll be there. Tell her I'll be there. …I'll be there, Dad. I'll find out who I am by then.",
          conditionRule: { requiresFlags: ["ml_david_agreed"] },
        },
        {
          id: "ml_bm_b14b",
          characterId: "david",
          text: "I can't say yes to a wedding I can't see. Send me the details — the date, the church, the woman's name, the whole of it — and I'll answer you in writing. A man should be able to put 'yes' in a letter. That's the rule I'm asking for.",
          conditionRule: { requiresFlags: ["ml_david_dodged"] },
        },
        {
          id: "ml_bm_b14c",
          characterId: "david",
          expression: "standing taller",
          text: "Don't send the card. Come with it. Come to the office, sit in that chair, and say it to my face where the files can hear it. If you mean it, I want to see you mean it. If you don't, I'd rather know it with the lights on.",
          conditionRule: { requiresFlags: ["ml_david_in_person"] },
        },
      ],
      hotspots: [
        {
          id: "ml_bm_h_envelope",
          label: "The envelope on the bar",
          cursor: "take",
          bounds: { x: 60, y: 58, w: 16, h: 18 },
          action: { type: "giveItem", itemGranted: "ml_invitation" },
          showItemImage: true,
        },
      ],
      choices: [
        {
          id: "ml_bm_q_yes",
          text: "\u201cI'll be there.\u201d",
          targetSceneId: "",
          attitudeTag: "Neutral",
          reply: true,
          exclusiveGroup: "ml_bestman_q",
          consequences: { setFlags: ["ml_david_agreed"] },
        },
        {
          id: "ml_bm_q_written",
          text: "\u201cSend me the details. I'll answer in writing.\u201d",
          targetSceneId: "",
          attitudeTag: "Clever",
          reply: true,
          exclusiveGroup: "ml_bestman_q",
          consequences: { setFlags: ["ml_david_dodged"] },
        },
        {
          id: "ml_bm_q_person",
          text: "\u201cCome say it in person. In daylight. Where the files can hear it.\u201d",
          targetSceneId: "",
          attitudeTag: "Aggressive",
          reply: true,
          exclusiveGroup: "ml_bestman_q",
          consequences: { setFlags: ["ml_david_in_person"] },
        },
        {
          id: "ml_bm_go",
          text: "Walk out into the moonlight",
          targetSceneId: "ml_dilemma",
          attitudeTag: "Neutral",
          hidden: true,
          gating: {
            requiresFlags: ["ml_david_agreed", "ml_david_dodged", "ml_david_in_person"],
            requiresAll: false,
          },
        },
      ],
    },

    /* ── Moonlight (the dilemma) ──────────────────────────────── */
    {
      id: "ml_dilemma",
      title: "Moonlight",
      background: "/img/moonlighting/street.jpg",
      ambientAudio: "drone",
      letterbox: true,
      transition: "fade-black",
      prose:
        "The street is empty, which in Los Angeles is a kind of weather. The card is in his hand. The car is at the curb. And the moon, which has been watching all season, is doing what it does best: it's making everything look like a decision.",
      dialogueBeats: [
        {
          id: "ml_d_b1",
          characterId: "david",
          expression: "V.O.",
          text: "A best man is a witness. That's the job. You stand there, and you testify, and if anyone asks, you say he was the happiest man in the room. My family has asked me to be a witness a lot of times in my life. This is the first time it matters, and that's the part I can't put in a letter.",
        },
        {
          id: "ml_d_b2",
          characterId: "david",
          expression: "V.O.",
          text: "I could say yes and stand there and be happy for the man who taught me everything I ever did, and none of it in the same room. I could say no and be the son who doesn't answer, which is a role I've been auditioning for since I was sixteen. Or I could walk this street one more block and decide with my feet, like I do everything else.",
        },
        {
          id: "ml_d_b3",
          characterId: "maddie",
          expression: "V.O. — the office window",
          text: "The office window is still lit. He can see the blinds, and the blinds are the shape of the desk, and the desk is the shape of the phone, and the phone is the shape of a man who said: don't be the man who doesn't answer.",
        },
        {
          id: "ml_d_b4a",
          characterId: "david",
          expression: "V.O.",
          text: "I said yes on a party line, which is how he likes to hear it — fast, and from a distance. But I know what a promise from me weighs. It weighs about as much as it takes to keep, and I've been in the business of weighing things all my life. The card goes in the pocket either way. It just weighs different now.",
          conditionRule: { requiresFlags: ["ml_david_agreed"] },
        },
        {
          id: "ml_d_b4b",
          characterId: "david",
          expression: "V.O.",
          text: "I told him to come say it in person, where the files can hear it. He went quiet for a long time, and then he said: fine. I'll be at the office Friday. So now the decision is on a calendar, and a decision on a calendar is the only kind I keep.",
          conditionRule: { requiresFlags: ["ml_david_in_person"] },
        },
        {
          id: "ml_d_b4c",
          characterId: "david",
          expression: "V.O.",
          text: "A letter. I gave him a letter, and a letter is a door that opens both ways, and I've spent a long time being a man who opens doors both ways. The card goes in the pocket. It can wait until I've decided which way the hinge swings.",
          conditionRule: { requiresFlags: ["ml_david_dodged"] },
        },
      ],
      choices: [
        {
          id: "ml_d_c_silver",
          text: "Get in the car. Drive home with it.",
          targetSceneId: "ml_end_silver",
          attitudeTag: "Neutral",
          exclusiveGroup: "ml_final",
        },
        {
          id: "ml_d_c_gold",
          text: "Pull out the card. Decide at sunrise.",
          targetSceneId: "ml_end_gold",
          attitudeTag: "Clever",
          exclusiveGroup: "ml_final",
        },
        {
          id: "ml_d_c_game",
          text: "Call the office. Tell her it's over.",
          targetSceneId: "ml_end_game",
          attitudeTag: "Aggressive",
          exclusiveGroup: "ml_final",
          hidden: true,
          gating: { requiresFlags: ["ml_david_dodged"] },
        },
      ],
    },

    /* ── Endings ──────────────────────────────────────────────── */
    {
      id: "ml_end_silver",
      title: "The Card in the Pocket",
      background: "/img/moonlighting/endsilver.jpg",
      ambientAudio: "drone",
      letterbox: true,
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "DAVID ADDISON DEFERS THE WEDDING — AGAIN",
        recap:
          "The card goes in the pocket and stays there. The night ends the way the season began: a man in a white suit, a phone that's going to ring, and a decision parked at the curb with the motor running.",
      },
      prose:
        "He slips the card into his pocket the way you put down a phone you're not ready to pick up. The engine turns over. The moon doesn't comment. It just keeps rising.",
    },
    {
      id: "ml_end_gold",
      title: "To Be Continued",
      background: "/img/moonlighting/endgold.jpg",
      ambientAudio: "jazz",
      letterbox: true,
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "THE BEST MAN — MOONLIGHTING RETURNS NEXT WEEK",
        recap:
          "He doesn't answer the phone tonight. He answers it tomorrow, in daylight, in person, where the files can hear it. The card goes in his breast pocket, over the heart, where decisions go to be read.",
      },
      prose:
        "Sunrise over the skyline. In the high window, a man in a white suit holds a small piece of heavy paper up to the light, and for the first time all season, he looks like a man who's about to say yes to something. Or no. The moon has seen both. They look the same from here.",
    },
    {
      id: "ml_end_game",
      title: "The Smaller Agency",
      background: "/img/moonlighting/endgame.jpg",
      ambientAudio: "drone",
      letterbox: true,
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "BLUE MOON AGENCY REBRANDS — NEW PARTNER PAYS RENT ON TIME",
        recap:
          "He called it in, and the office answered, and Maddie said the only thing she ever needed to say: the Blue Moon Detective Agency is open for business. It was a goodbye, and it was on time, and that was the worst part.",
      },
      prose:
        "The line goes down. Across the street, the office lights go out one by one, the way a family leaves a room. The new partner starts on Monday. He has a hat. He pays his rent on time. The agency, somehow, is smaller — and somehow, it's running.",
    },
  ],
};
