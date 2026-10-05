import type { Story } from "../types";

/**
 * NOBODY'S WITNESS — flagship build.
 *
 * A straight run-through of the shooting script: COLD OPEN (pre-titles),
 * the title card, and ACT ONE / PART 1 — "The Woman Who Sold Herself Twice."
 *
 * Structure notes for whoever picks this up next:
 *
 *  · The SIGNATURE SHOT bookends the piece. `nw2_signature` opens the film
 *    before Part 1's dialogue and `nw2_bookend` closes it, unchanged — same
 *    image, same framing, same cinematic block. When Parts 2–6 are written,
 *    re-point the end of Part 1 at Part 2 and let `nw2_bookend` stay exactly
 *    where it is: the last frame after Part 6.
 *
 *  · Jack's V.O. is authored as dialogue beats on the `jack` character with
 *    the expression "V.O.", so the narrator sits in the dialogue rail rather
 *    than the prose block. Prose is reserved for the scene's establishing
 *    paragraph.
 *
 *  · The conversation is six gated rounds. Every round has one line lifted
 *    verbatim from the script plus tonal variants; the script's beats are
 *    gated on the flag that round sets, so the canonical path plays the
 *    scene as written and the variants colour it without breaking it.
 *
 *  · The fail state is earned, not arbitrary: hostility raises Suspicion, and
 *    at 4 Vera takes the folder back. That is the heat trapdoor.
 *
 * Art direction is 1980s neon noir (teal/magenta against dead sodium).
 * Alternate style plates for the signature shot live in /img/style/ —
 * see the comment at the bottom of this file.
 */
export const NOBODYS_WITNESS_FLAGSHIP: Story = {
  id: "nobodys-witness-flagship",
  title: "Nobody's Witness",
  tagline: "Straight. You leave a straight line, and everybody stands in it.",
  coverImage: "/img/style/nw2-signature-a-neon80s.jpg",
  startSceneId: "nw2_coldopen",
  briefing: {
    objective:
      "Blackwood Diner, eleven forty-seven at night. Hear Vera Voss out, and decide what you're going to believe.",
    winConditions: [
      "Let the conversation run its length — every question you ask opens the next one.",
      "Ask her why she came to you, and tell her the truth about the file.",
      "Take the folder, and take the case.",
    ],
    loseConditions: [
      "Push her hard enough, often enough, and she takes the folder back.",
      "Turn the case down and walk out into the rain.",
    ],
    heatLimit: 4,
    heatFailSceneId: "nw2_end_folded",
  },
  acts: [
    {
      id: "act1",
      label: "Act One",
      title: "The Woman Who Sold Herself Twice",
      tagline: "Blackwood Diner, eleven forty-seven at night.",
      startSceneId: "nw2_coldopen",
      titleCardImage: "/img/style/nw2-signature-a-neon80s.jpg",
    },
    {
      id: "act2",
      label: "Act Two",
      title: "Eleven Weeks",
      tagline: "Six tables. Bread in the morning. One thing he'd have to be bad at first.",
      startSceneId: "nw2_a2_office",
      titleCardImage: "/img/nw2/bg-office-night.jpg",
    },
    {
      id: "act3",
      label: "Act Three",
      title: "Nobody's Witness",
      tagline: "Straight. You leave a straight line, and everybody stands in it.",
      startSceneId: "nw2_p1_call",
      titleCardImage: "/img/nw2/bg-yard-night.jpg",
    },
  ],
  layout: {
    nw2_coldopen: { x: 0, y: 240 },
    nw2_signature: { x: 340, y: 240 },
    nw2_diner: { x: 680, y: 240 },
    nw2_deal: { x: 1020, y: 240 },
    nw2_bookend: { x: 1360, y: 240 },
    nw2_end_refusal: { x: 1020, y: 460 },
    nw2_end_folded: { x: 1020, y: 660 },
    nw2_a2_office: { x: 1700, y: 240 },
    nw2_a2_phone: { x: 2040, y: 240 },
    nw2_p1_call: { x: 2380, y: 240 },
    nw2_p1_after: { x: 2040, y: 240 },
    nw2_p2_rosa: { x: 2380, y: 240 },
    nw2_p3_mill: { x: 2720, y: 240 },
    nw2_p3_after: { x: 3060, y: 240 },
    nw2_p4_cost: { x: 3400, y: 240 },
    nw2_p4b_poolhall: { x: 3740, y: 240 },
    nw2_p4b_door: { x: 4080, y: 240 },
    nw2_p5_office: { x: 4420, y: 240 },
    nw2_p6_booth: { x: 4760, y: 240 },
    nw2_p6_told: { x: 5100, y: 240 },
    nw2_final_street: { x: 5440, y: 240 },
    nw2_end_kept: { x: 5100, y: 460 },
    nw2_end_nothing: { x: 5100, y: 660 },
    nw2_end_bought: { x: 4420, y: 460 },
    // Version 2 — the licence branch
    nw2_p6_bag: { x: 5440, y: 900 },
    nw2_p6_stay: { x: 5780, y: 900 },
    nw2_end_stayed: { x: 6120, y: 900 },
  },
  characters: [
    {
      id: "jack",
      name: "Jack Morrow",
      role: "Private Detective / Narrator",
      avatarUrl: "/img/nw2/ch-jack.jpg",
      trustMeter: 0,
      voice: { pitch: 0.7, rate: 0.88 },
    },
    {
      id: "vera",
      name: "Vera Voss",
      role: "The Client",
      avatarUrl: "/img/nw2/ch-vera.jpg",
      trustMeter: 0,
      voice: { pitch: 1.12, rate: 0.9 },
    },
    {
      id: "solomon",
      name: "Solomon Reyes",
      role: "The Lender",
      avatarUrl: "/img/nw2/ch-solomon.jpg",
      trustMeter: 0,
      voice: { pitch: 0.82, rate: 0.8 },
    },
    {
      id: "rosa",
      name: "Det. Rosa Iglesias",
      role: "Blackwood PD / The One Who Stayed",
      avatarUrl: "/img/nw2/ch-rosa.jpg",
      trustMeter: 0,
      voice: { pitch: 0.96, rate: 0.92 },
    },
    {
      id: "moe",
      name: "Moe",
      role: "Solomon's Man",
      avatarUrl: "/img/nw2/ch-moe.jpg",
      trustMeter: 0,
      voice: { pitch: 0.72, rate: 0.82 },
    },
    {
      id: "desh",
      name: "Desh",
      role: "Solomon's Other Man",
      avatarUrl: "/img/nw2/ch-desh.jpg",
      trustMeter: 0,
      voice: { pitch: 1.02, rate: 1.02 },
    },
  ],
  items: [
    {
      id: "nw2_folder",
      name: "Vera's Folder",
      icon: "📂",
      description:
        "Plain, unmarked, worn soft at the corners. Bank statements, last known contacts, and three weeks of a woman looking for her husband on her own.",
      flavorText: "Handled and reread. That's the part you can't fake.",
      isClue: true,
    },
    {
      id: "nw2_matchbook",
      name: "Diner Matchbook",
      icon: "🔥",
      description: "Blackwood Diner. Half the matches gone, the striker worn down to card.",
      flavorText: "Lonely, dressed up as a work ethic.",
    },
  ],
  scenes: [
    /* ================================================================= */
    /*  COLD OPEN — pre-titles                                           */
    /* ================================================================= */
    {
      id: "nw2_coldopen",
      title: "Cold Open",
      nodeType: "cutscene",
      background: "/img/nw2/bg-coldopen-fence.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.6,
      letterbox: true,
      choiceDelaySeconds: 7,
      cinematic: {
        // No movement. One image, held. The script is specific about that.
        mode: "static",
        dimAmount: 0.42,
        lights: [
          { x: 62, y: 30, color: "#ffb761", intensity: 0.34, size: 26, pulseSeconds: 5.2, pulseAmount: 0.35 },
        ],
        lensFlare: {
          preset: "warm-amber",
          x: 62,
          y: 30,
          intensity: 0.8,
          streakIntensity: 0.85,
          streakWidth: 1.1,
          ghostIntensity: 0.75,
        },
      },
      // THE SPINE FLAG. Jack starts having never taken Solomon's money. It can
      // only ever be cleared, never re-set. It is the only thing he owns that
      // Solomon wants, so losing it anywhere upstream silently removes the
      // gold trade in Part 5. The asset is the refusal.
      onEnterActions: [
        { consequences: { setFlags: ["nw2_never_took"] } },
      ],
      prose:
        "Silence. Then, low and close: the sodium light from the mill lot, buzzing. Rain. Nothing else.\n\nA wet chain-link fence, out of focus. A single working light behind it. We don't know where we are yet.",
      dialogueBeats: [
        {
          id: "nw2_co_1",
          characterId: "jack",
          expression: "V.O.",
          text: "Straight. You leave a straight line, and everybody stands in it.",
        },
        {
          id: "nw2_co_2",
          characterId: "jack",
          expression: "V.O.",
          text: "None of us get out of the way.",
        },
        {
          id: "nw2_co_3",
          characterId: "jack",
          expression: "V.O.",
          silent: true,
          background: "gradient:linear-gradient(#000,#000)",
          backgroundTransition: "cut",
          text: "— one gunshot. Flat. Close. Not dramatic. It sounds like a door slamming. —",
        },
      ],
      choices: [
        {
          id: "nw2_co_go",
          text: "…",
          targetSceneId: "nw2_signature",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ================================================================= */
    /*  THE SIGNATURE SHOT + TITLE                                       */
    /* ================================================================= */
    {
      id: "nw2_signature",
      title: "Nobody's Witness",
      nodeType: "credits",
      // The signature shot leads the montage, so it is also the still plate
      // behind everything if the montage is ever removed.
      background: "/img/style/nw2-signature-a-neon80s.jpg",
      ambientAudio: "rain",
      musicMode: "track",
      musicUrl: "/nobodys-witness.mp3",
      noTypewriter: true,
      transition: "cut",
      letterbox: true,
      // The theme gets a full 32 seconds before the player can leave — the
      // title sequence runs its own length underneath.
      choiceDelaySeconds: 32,
      credits: {
        title: "NOBODY'S WITNESS",
        subtitle: "Population four thousand, and falling",
        titleEntrance: "fade-up",
        // One card at a time: fade in, hold, fade out. The image carries it.
        style: "cards",
        cardSeconds: 4.2,
        // Tall condensed caps — a film-poster face. Reads clean at display size
        // over a busy neon plate, where a heavy slab would fight the image.
        font: "poster",
        // Tracking pulls in from wide and releases: the main-title move.
        cardMotion: "letterspace",
        // The titles were optically printed onto the picture, so they drift
        // against the plate the way a 90s release print does. "worn" rather
        // than "subtle": this is a rep-house reel, not a fresh answer print.
        gateWeave: "worn",
        accentColor: "#2ad9d9",
        lines: [
          { role: "A Story In Six Parts", name: "Gaslight Reelworks" },
          { role: "Starring", name: "Jack Morrow" },
          { role: "And", name: "Vera Voss" },
          { role: "Act One", name: "The Woman Who Sold Herself Twice" },
        ],
        // Seven stills, ~5s each, cross-dissolving under the titles. Opens and
        // closes on the signature shot so the sequence resolves where it began.
        montage: [
          "/img/style/nw2-signature-a-neon80s.jpg",
          "/img/nw2/mo-mainstreet.jpg",
          "/img/nw2/mo-mill.jpg",
          "/img/nw2/mo-neon-tube.jpg",
          "/img/nw2/mo-diner-ext.jpg",
          "/img/nw2/mo-rain-glass.jpg",
          "/img/style/nw2-signature-a-neon80s.jpg",
        ],
        montageSeconds: 5,
        montageLoop: true,
      },
      prose:
        "NOBODY'S WITNESS\n\nBlackwood — population four thousand, and falling\n\nAct One, Part 1 — The Woman Who Sold Herself Twice",
      choices: [
        {
          id: "nw2_sig_go",
          text: "Blackwood Diner. Eleven forty-seven.",
          targetSceneId: "nw2_diner",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ================================================================= */
    /*  PART 1 — THE WOMAN WHO SOLD HERSELF TWICE                        */
    /* ================================================================= */
    {
      id: "nw2_diner",
      title: "Part 1 — The Woman Who Sold Herself Twice",
      background: "/img/nw2/bg-diner-int.jpg",
      ambientAudio: "rain",
      particles: "rain",
      // Theme cuts out hard on the title. Silence after it, sharp.
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.2,
      cinematic: {
        mode: "pan",
        focalPoint: "48% 46%",
        panDistance: 4,
        panDirection: "left",
        zoomDuration: 30,
        dimAmount: 0.12,
        lights: [
          { x: 18, y: 20, color: "#ff2e88", intensity: 0.26, size: 34, pulseSeconds: 3.4, pulseAmount: 0.9 },
          { x: 76, y: 22, color: "#2ad9d9", intensity: 0.2, size: 40, pulseSeconds: 4.8, pulseAmount: 0.6 },
        ],
        lensFlare: {
          preset: "neon-noir",
          x: 18,
          y: 20,
          intensity: 0.8,
          streakIntensity: 0.9,
          streakWidth: 1.0,
          ghostIntensity: 0.75,
        },
      },
      prose:
        "Rain on glass. A ceiling fan ticking in slow lazy circles. A diner hum underneath it all, the kind you stop hearing after the first year.",
      dialogueBeats: [
        /* --- opening V.O. ------------------------------------------- */
        {
          id: "nw2_d_vo1",
          characterId: "jack",
          expression: "V.O.",
          text:
            "Nobody took what I lost. I handed it over. In order. So when I tell you I didn't see it coming — I saw it. That's the only thing I need you to believe.",
        },
        {
          id: "nw2_d_vo2",
          characterId: "jack",
          expression: "V.O.",
          text:
            "Eleven forty-seven. Blackwood Diner. Same booth most nights, phone turned face-down because I already know who's not calling.",
        },
        {
          id: "nw2_d_vo3",
          characterId: "jack",
          expression: "V.O.",
          text:
            "Blackwood. Mill closed in '09, then everything that fed it. Four thousand people left, a clinic with a waiting list, and Solomon Reyes, who employs more of this town than the county does. Nobody here's bad. They're hungry. Different thing.",
        },
        {
          id: "nw2_d_vo4",
          characterId: "jack",
          expression: "V.O.",
          background: "/img/nw2/bg-vera-booth.jpg",
          backgroundTransition: "crossfade",
          backgroundTransitionSpeed: 0.9,
          cinematic: {
            mode: "zoom-hold",
            focalPoint: "50% 38%",
            zoomDuration: 12,
            dimAmount: 0.14,
            lights: [
              { x: 22, y: 26, color: "#ff2e88", intensity: 0.34, size: 32, pulseSeconds: 3.2, pulseAmount: 0.9 },
            ],
            lensFlare: {
              preset: "neon-noir",
              x: 22,
              y: 26,
              intensity: 0.85,
              streakIntensity: 0.9,
              ghostIntensity: 0.8,
            },
          },
          text:
            "She didn't scan the room. Walked straight to my booth. Like she'd already had this conversation in her head a few times before her body caught up.",
        },
        {
          id: "nw2_d_v1",
          characterId: "vera",
          expression: "direct, flat",
          text: "They told me you're the only one in this town who doesn't work for Solomon Reyes.",
        },

        /* --- ROUND 1 responses --------------------------------------- */
        {
          id: "nw2_d_r1_who",
          characterId: "vera",
          expression: "sitting",
          conditionRule: { requiresFlags: ["nw2_asked_who"] },
          text:
            "Three people. All of them said it the same way, like it was the only thing about you worth knowing. Vera Voss.",
        },
        {
          id: "nw2_d_r1_flat",
          characterId: "vera",
          expression: "unmoved",
          conditionRule: { requiresFlags: ["nw2_denied"] },
          text:
            "That's not what I asked. Three people said it the same way, like it was the only thing about you worth knowing. Vera Voss.",
        },
        {
          id: "nw2_d_r1_wait",
          characterId: "vera",
          expression: "sitting anyway",
          conditionRule: { requiresFlags: ["nw2_let_her_sit"] },
          text:
            "You're going to make me do this whole thing on my own, aren't you. Fine. Three people told me. All of them said it the same way. Vera Voss.",
        },
        {
          id: "nw2_d_j1",
          characterId: "jack",
          expression: "dry, still not looking up",
          conditionRule: {
            requiresFlags: ["nw2_asked_who", "nw2_denied", "nw2_let_her_sit"],
            requiresAll: false,
          },
          text: "Mrs. Voss. That make this personal or professional?",
        },
        {
          id: "nw2_d_vo5",
          characterId: "jack",
          expression: "V.O.",
          conditionRule: {
            requiresFlags: ["nw2_asked_who", "nw2_denied", "nw2_let_her_sit"],
            requiresAll: false,
          },
          text:
            "I looked up. Not beautiful, exactly — held together with both hands, hoping nobody noticed the effort.",
        },

        /* --- ROUND 2 responses --------------------------------------- */
        {
          id: "nw2_d_r2_help",
          characterId: "vera",
          expression: "straightforward, a small crack in the composure",
          conditionRule: { requiresFlags: ["nw2_offered"] },
          text:
            "My husband's missing. Three weeks now. Cops filed it, did nothing, told me he probably just left. I don't believe that. And I need somebody better than the cops to find out if I'm wrong.",
        },
        {
          id: "nw2_d_r2_clock",
          characterId: "vera",
          expression: "taking the two minutes",
          conditionRule: { requiresFlags: ["nw2_clocked"] },
          text:
            "Then I'll use them. My husband's missing. Three weeks. Cops filed it, did nothing, told me he probably just left. I don't believe that, and I need somebody better than the cops to find out if I'm wrong.",
        },

        /* --- ROUND 3 responses --------------------------------------- */
        {
          id: "nw2_d_r3_sure",
          characterId: "vera",
          expression: "a beat — quieter, honest",
          conditionRule: { requiresFlags: ["nw2_asked_found"] },
          text: "I want to know where he is. What I feel about that once I know is my own business.",
        },
        {
          id: "nw2_d_r3_cops",
          characterId: "vera",
          expression: "flat",
          conditionRule: { requiresFlags: ["nw2_sided_cops"] },
          text:
            "The cops are usually right. I've had three weeks to sit with usually. I want to know where he is. What I feel about that once I know is my own business.",
        },
        {
          id: "nw2_d_r3_calm",
          characterId: "vera",
          expression: "the control slipping half an inch",
          conditionRule: { requiresFlags: ["nw2_called_calm_early"] },
          text:
            "Three weeks is exactly long enough to get calm. I want to know where he is. What I feel about that once I know is my own business.",
        },
        {
          id: "nw2_d_folder",
          characterId: "jack",
          expression: "V.O.",
          background: "/img/nw2/bg-folder.jpg",
          backgroundTransition: "crossfade",
          backgroundTransitionSpeed: 0.8,
          cinematic: {
            mode: "zoom-hold",
            focalPoint: "50% 55%",
            zoomDuration: 9,
            dimAmount: 0.2,
            lights: [
              { x: 46, y: 52, color: "#ff2e88", intensity: 0.24, size: 34, pulseSeconds: 3.6, pulseAmount: 0.7 },
              { x: 70, y: 34, color: "#2ad9d9", intensity: 0.18, size: 30, pulseSeconds: 4.2, pulseAmount: 0.6 },
            ],
          },
          conditionRule: {
            requiresFlags: ["nw2_asked_found", "nw2_sided_cops", "nw2_called_calm_early"],
            requiresAll: false,
          },
          text:
            "A slim folder, set down on the formica between us. First real answer all night. And I remember deciding, right there, that I was going to believe her. Not that I did. That I was going to.",
        },
        {
          id: "nw2_d_name_q",
          characterId: "jack",
          expression: "opening the folder, scanning",
          conditionRule: {
            requiresFlags: ["nw2_asked_found", "nw2_sided_cops", "nw2_called_calm_early"],
            requiresAll: false,
          },
          text: "Name?",
        },
        {
          id: "nw2_d_name_a",
          characterId: "vera",
          expression: "even",
          conditionRule: {
            requiresFlags: ["nw2_asked_found", "nw2_sided_cops", "nw2_called_calm_early"],
            requiresAll: false,
          },
          text: "David Voss.",
        },
        {
          id: "nw2_d_vo6",
          characterId: "jack",
          expression: "V.O., low",
          background: "/img/nw2/bg-diner-int.jpg",
          backgroundTransition: "crossfade",
          backgroundTransitionSpeed: 0.9,
          conditionRule: {
            requiresFlags: ["nw2_asked_found", "nw2_sided_cops", "nw2_called_calm_early"],
            requiresAll: false,
          },
          text:
            "I knew the name. Blackwood's four thousand people and half of them owe Solomon Reyes something — David Voss ran his money, everybody knew that the way you know which houses have somebody in them. So a man who works for Solomon disappears, and his wife comes to the one person in town who doesn't. That's not a coincidence. That's a shape.",
        },
        {
          id: "nw2_d_vo7",
          characterId: "jack",
          expression: "V.O., quieter",
          conditionRule: {
            requiresFlags: ["nw2_asked_found", "nw2_sided_cops", "nw2_called_calm_early"],
            requiresAll: false,
          },
          text:
            "I looked at the shape for about as long as it takes to read this sentence, and then I put it somewhere I wouldn't have to look at it again.",
        },

        /* --- ROUND 4 responses --------------------------------------- */
        {
          id: "nw2_d_r4_yes",
          characterId: "vera",
          expression: "even, unbothered on the surface",
          conditionRule: { requiresFlags: ["nw2_asked_reyes"] },
          text: "Yes.",
        },
        {
          id: "nw2_d_r4_yes2",
          characterId: "jack",
          expression: "a little surprised she just said it",
          conditionRule: { requiresFlags: ["nw2_asked_reyes"] },
          text: "Most people dance around that question.",
        },
        {
          id: "nw2_d_r4_yes3",
          characterId: "vera",
          expression: "flat, tired underneath it",
          conditionRule: { requiresFlags: ["nw2_asked_reyes"] },
          text:
            "I'm not most people. I don't have time to dance, Mr. Morrow. I have three weeks of nothing and a folder full of everything I could find. You want to help me or not?",
        },
        {
          id: "nw2_d_r4_yes4",
          characterId: "jack",
          expression: "V.O.",
          conditionRule: { requiresFlags: ["nw2_asked_reyes"] },
          text: "I liked her for that.",
        },
        {
          id: "nw2_d_r4_coat",
          characterId: "vera",
          expression: "answering the small question, watching him not ask the big one",
          conditionRule: { requiresFlags: ["nw2_looked_away"] },
          text:
            "Grey coat. The good one. He wore it on days he wanted to look like somebody who had somewhere to be.",
        },
        {
          id: "nw2_d_r4_coat2",
          characterId: "jack",
          expression: "V.O.",
          conditionRule: { requiresFlags: ["nw2_looked_away"] },
          text:
            "That's the question I asked. Not the other one. I want that on the record too — that I had it in my mouth and I swallowed it and asked about a coat instead.",
        },
        {
          id: "nw2_d_r4_hard",
          characterId: "vera",
          expression: "very still",
          conditionRule: { requiresFlags: ["nw2_blamed_her"] },
          text:
            "I knew exactly what he was. I married him anyway. If you need me to be ashamed of that before you'll take my money, say so now and I'll find somebody cheaper.",
        },

        /* --- ROUND 5 responses --------------------------------------- */
        {
          id: "nw2_d_r5_why1",
          characterId: "vera",
          expression: "evenly",
          conditionRule: { requiresFlags: ["nw2_asked_why"] },
          text:
            "They said you were a detective for sixteen years and then you weren't, and that Solomon had something to do with which one it was. Nobody said more than that.",
        },
        {
          id: "nw2_d_r5_why2",
          characterId: "jack",
          expression: "flat",
          conditionRule: { requiresFlags: ["nw2_asked_why"] },
          text:
            "There was a file. Solomon's name in it. I was asked to lose it. Didn't. Asked again by somebody higher up. Didn't again.",
        },
        {
          id: "nw2_d_r5_why3",
          characterId: "vera",
          expression: "quiet",
          conditionRule: { requiresFlags: ["nw2_asked_why"] },
          text: "And?",
        },
        {
          id: "nw2_d_r5_why4",
          characterId: "jack",
          expression: "matter-of-fact",
          conditionRule: { requiresFlags: ["nw2_asked_why"] },
          text:
            "Nobody charged me with anything. Isn't how it works here. They just made me somebody nothing gets assigned to. Eleven months at that desk. Then I quit and called it a decision.",
        },
        {
          id: "nw2_d_r5_why5",
          characterId: "vera",
          expression: "quiet",
          conditionRule: { requiresFlags: ["nw2_asked_why"] },
          text: "And the file?",
        },
        {
          id: "nw2_d_r5_why6",
          characterId: "jack",
          expression: "dry",
          conditionRule: { requiresFlags: ["nw2_asked_why"] },
          text: "Lost. Just not by me. That's the part I got to keep.",
        },
        {
          id: "nw2_d_r5_why7",
          characterId: "jack",
          expression: "V.O., spare",
          conditionRule: { requiresFlags: ["nw2_asked_why"] },
          text:
            "That's the whole story. People in Blackwood think it's tragic. It isn't. Tragic would've been fast. What actually happened is I said no to a thing one time, correctly, and then nothing else happened to me for ten years.",
        },
        {
          id: "nw2_d_r5_calm1",
          characterId: "vera",
          expression: "quiet, and for a second, something real underneath the control",
          conditionRule: { requiresFlags: ["nw2_asked_calm"] },
          text:
            "I've had three weeks to get calm about it. Don't mistake it for not caring. I care. I just don't have anybody left to fall apart in front of.",
        },
        {
          id: "nw2_d_r5_calm2",
          characterId: "jack",
          expression: "V.O.",
          conditionRule: { requiresFlags: ["nw2_asked_calm"] },
          text: "Truth and performance, same room, taking turns. I picked. I want that on the record.",
        },
        {
          id: "nw2_d_r5_terms",
          characterId: "vera",
          expression: "waiting",
          conditionRule: { requiresFlags: ["nw2_skipped_to_terms"] },
          text:
            "Good. I was starting to think you were going to ask me about myself all night and bill me for it.",
        },
      ],
      choices: [
        /* --- ROUND 1 ------------------------------------------------- */
        {
          id: "nw2_c1a",
          text: "\"Who's they.\"",
          targetSceneId: "",
          reply: true,
          exclusiveGroup: "nw2_r1",
          attitudeTag: "Clever",
          memoryLog: "nw2_open",
          consequences: {
            setFlags: ["nw2_asked_who"],
            meterChanges: [{ meter: "Clever", delta: 1 }],
          },
        },
        {
          id: "nw2_c1b",
          text: "\"I don't work for anybody. That's not the same as being on your side.\"",
          targetSceneId: "",
          reply: true,
          exclusiveGroup: "nw2_r1",
          attitudeTag: "Aggressive",
          memoryLog: "nw2_open",
          consequences: {
            setFlags: ["nw2_denied"],
            meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }],
            trustChanges: [{ characterId: "vera", delta: -1 }],
          },
        },
        {
          id: "nw2_c1c",
          text: "Say nothing. Let her sit down on her own.",
          targetSceneId: "",
          reply: true,
          exclusiveGroup: "nw2_r1",
          attitudeTag: "Sultry",
          memoryLog: "nw2_open",
          consequences: {
            setFlags: ["nw2_let_her_sit"],
            meterChanges: [{ meter: "Sultry", delta: 1 }],
          },
        },

        /* --- ROUND 2 ------------------------------------------------- */
        {
          id: "nw2_c2a",
          text: "\"What can I do for you.\"",
          targetSceneId: "",
          reply: true,
          hidden: true,
          exclusiveGroup: "nw2_r2",
          attitudeTag: "Sultry",
          gating: {
            requiresFlags: ["nw2_asked_who", "nw2_denied", "nw2_let_her_sit"],
            requiresAll: false,
          },
          consequences: {
            setFlags: ["nw2_offered"],
            meterChanges: [{ meter: "Sultry", delta: 1 }],
            trustChanges: [{ characterId: "vera", delta: 1 }],
          },
        },
        {
          id: "nw2_c2b",
          text: "\"You've got until this coffee gets colder than it already is.\"",
          targetSceneId: "",
          reply: true,
          hidden: true,
          exclusiveGroup: "nw2_r2",
          attitudeTag: "Aggressive",
          gating: {
            requiresFlags: ["nw2_asked_who", "nw2_denied", "nw2_let_her_sit"],
            requiresAll: false,
          },
          consequences: {
            setFlags: ["nw2_clocked"],
            meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }],
          },
        },

        /* --- ROUND 3 ------------------------------------------------- */
        {
          id: "nw2_c3a",
          text: "\"Missing people usually want to stay missing. You sure you want him found?\"",
          targetSceneId: "",
          reply: true,
          hidden: true,
          exclusiveGroup: "nw2_r3",
          attitudeTag: "Clever",
          memoryLog: "nw2_found",
          rememberLine: "Vera will remember that.",
          gating: { requiresFlags: ["nw2_offered", "nw2_clocked"], requiresAll: false },
          consequences: {
            setFlags: ["nw2_asked_found"],
            meterChanges: [{ meter: "Clever", delta: 1 }],
            trustChanges: [{ characterId: "vera", delta: 1 }],
          },
        },
        {
          id: "nw2_c3b",
          text: "\"The cops were probably right. Men leave.\"",
          targetSceneId: "",
          reply: true,
          hidden: true,
          exclusiveGroup: "nw2_r3",
          attitudeTag: "Aggressive",
          memoryLog: "nw2_found",
          gating: { requiresFlags: ["nw2_offered", "nw2_clocked"], requiresAll: false },
          consequences: {
            setFlags: ["nw2_sided_cops"],
            meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }],
            trustChanges: [{ characterId: "vera", delta: -1 }],
          },
        },
        {
          id: "nw2_c3c",
          text: "\"Three weeks. You're very calm for three weeks.\"",
          targetSceneId: "",
          reply: true,
          hidden: true,
          exclusiveGroup: "nw2_r3",
          attitudeTag: "Sultry",
          memoryLog: "nw2_found",
          gating: { requiresFlags: ["nw2_offered", "nw2_clocked"], requiresAll: false },
          consequences: {
            setFlags: ["nw2_called_calm_early"],
            meterChanges: [{ meter: "Sultry", delta: 1 }],
          },
        },

        /* --- ROUND 4 ------------------------------------------------- */
        {
          id: "nw2_c4a",
          text: "\"Your husband do business with Solomon Reyes?\"",
          targetSceneId: "",
          reply: true,
          hidden: true,
          exclusiveGroup: "nw2_r4",
          attitudeTag: "Clever",
          memoryLog: "nw2_shape",
          rememberLine: "Vera will remember that.",
          gating: {
            requiresFlags: ["nw2_asked_found", "nw2_sided_cops", "nw2_called_calm_early"],
            requiresAll: false,
          },
          consequences: {
            setFlags: ["nw2_asked_reyes"],
            meterChanges: [{ meter: "Clever", delta: 1 }],
            trustChanges: [{ characterId: "vera", delta: 1 }],
          },
        },
        {
          id: "nw2_c4b",
          text: "\"What was he wearing, last time you saw him?\"",
          targetSceneId: "",
          reply: true,
          hidden: true,
          exclusiveGroup: "nw2_r4",
          attitudeTag: "Neutral",
          memoryLog: "nw2_shape",
          gating: {
            requiresFlags: ["nw2_asked_found", "nw2_sided_cops", "nw2_called_calm_early"],
            requiresAll: false,
          },
          consequences: { setFlags: ["nw2_looked_away"] },
        },
        {
          id: "nw2_c4c",
          text: "\"You knew what he was when you married him.\"",
          targetSceneId: "",
          reply: true,
          hidden: true,
          exclusiveGroup: "nw2_r4",
          attitudeTag: "Aggressive",
          memoryLog: "nw2_shape",
          gating: {
            requiresFlags: ["nw2_asked_found", "nw2_sided_cops", "nw2_called_calm_early"],
            requiresAll: false,
          },
          consequences: {
            setFlags: ["nw2_blamed_her"],
            meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 2 }],
            trustChanges: [{ characterId: "vera", delta: -2 }],
          },
        },

        /* --- ROUND 5 ------------------------------------------------- */
        {
          id: "nw2_c5a",
          text: "\"Your three people. Did any of them tell you why I don't work for him?\"",
          targetSceneId: "",
          reply: true,
          hidden: true,
          exclusiveGroup: "nw2_r5",
          attitudeTag: "Clever",
          memoryLog: "nw2_file",
          rememberLine: "Vera will remember that.",
          gating: {
            requiresFlags: ["nw2_asked_reyes", "nw2_looked_away", "nw2_blamed_her"],
            requiresAll: false,
          },
          consequences: {
            setFlags: ["nw2_asked_why", "nw2_told_the_truth"],
            meterChanges: [{ meter: "Clever", delta: 1 }],
            trustChanges: [{ characterId: "vera", delta: 2 }],
          },
        },
        {
          id: "nw2_c5b",
          text: "\"You're awfully calm for a woman whose husband might be hiding from a guy like Reyes.\"",
          targetSceneId: "",
          reply: true,
          hidden: true,
          exclusiveGroup: "nw2_r5",
          attitudeTag: "Sultry",
          memoryLog: "nw2_file",
          rememberLine: "Vera will remember that.",
          gating: {
            requiresFlags: ["nw2_asked_reyes", "nw2_looked_away", "nw2_blamed_her"],
            requiresAll: false,
          },
          consequences: {
            setFlags: ["nw2_asked_calm"],
            meterChanges: [{ meter: "Sultry", delta: 1 }],
            trustChanges: [{ characterId: "vera", delta: 1 }],
          },
        },
        {
          id: "nw2_c5c",
          text: "Skip it. Go straight to terms.",
          targetSceneId: "",
          reply: true,
          hidden: true,
          exclusiveGroup: "nw2_r5",
          attitudeTag: "Neutral",
          gating: {
            requiresFlags: ["nw2_asked_reyes", "nw2_looked_away", "nw2_blamed_her"],
            requiresAll: false,
          },
          consequences: { setFlags: ["nw2_skipped_to_terms"] },
        },

        /* --- THE DECISION -------------------------------------------- */
        {
          id: "nw2_take",
          text: "\"Two hundred a day plus expenses.\" Take the folder.",
          targetSceneId: "nw2_deal",
          hidden: true,
          attitudeTag: "Neutral",
          rememberLine: "You took the case.",
          gating: {
            requiresFlags: ["nw2_asked_why", "nw2_asked_calm", "nw2_skipped_to_terms"],
            requiresAll: false,
          },
          consequences: {
            setFlags: ["nw2_took_case"],
            addItems: ["nw2_folder"],
            trustChanges: [{ characterId: "vera", delta: 1 }],
          },
        },
        {
          id: "nw2_refuse",
          text: "Slide the folder back. Turn her down.",
          targetSceneId: "nw2_end_refusal",
          hidden: true,
          attitudeTag: "Neutral",
          gating: {
            requiresFlags: ["nw2_asked_why", "nw2_asked_calm", "nw2_skipped_to_terms"],
            requiresAll: false,
          },
          consequences: { setFlags: ["nw2_walked_away"] },
        },
      ],
      hotspots: [
        {
          id: "nw2_hs_phone",
          label: "Your phone, face-down",
          bounds: { x: 52, y: 74, w: 12, h: 12 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text:
              "Face-down since ten. You already know who's not calling. Turning it over would only make it official.",
          },
        },
        {
          id: "nw2_hs_window",
          label: "The rain on the window",
          bounds: { x: 4, y: 24, w: 24, h: 44 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text:
              "Half the signs on Main are dead. The ones still lit are doing all the work of a much bigger city, and doing it for nobody.",
          },
        },
        {
          id: "nw2_hs_fan",
          label: "The ceiling fan",
          bounds: { x: 60, y: 8, w: 18, h: 16 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Slow lazy circles. It's been turning since '09 and it hasn't moved any air yet.",
          },
        },
        {
          id: "nw2_hs_matches",
          label: "A matchbook on the table",
          bounds: { x: 28, y: 78, w: 10, h: 10 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "nw2_matchbook", flagSet: "nw2_got_matches" },
        },
      ],
    },

    /* ================================================================= */
    /*  THE DEAL — she goes                                              */
    /* ================================================================= */
    {
      id: "nw2_deal",
      title: "Part 1 — Terms",
      background: "/img/nw2/bg-folder.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "none",
      transition: "fade",
      transitionSpeed: 0.8,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 52%",
        zoomDuration: 14,
        dimAmount: 0.2,
        lights: [
          { x: 44, y: 50, color: "#ff2e88", intensity: 0.22, size: 34, pulseSeconds: 3.8, pulseAmount: 0.7 },
          { x: 72, y: 30, color: "#2ad9d9", intensity: 0.16, size: 30, pulseSeconds: 4.6, pulseAmount: 0.6 },
        ],
      },
      prose:
        "Two hundred a day plus expenses. I find him, I tell you where he is. What you do after that's yours to carry.",
      dialogueBeats: [
        {
          id: "nw2_deal_v1",
          characterId: "vera",
          expression: "standing, sliding the folder the rest of the way over",
          text: "Thank you. I mean that.",
        },
        {
          id: "nw2_deal_j1",
          characterId: "jack",
          expression: "half-smiling",
          text: "You always this easy to negotiate with?",
        },
        {
          id: "nw2_deal_v2",
          characterId: "vera",
          expression: "putting her coat back into place, something unreadable and a little sad",
          text: "No. You just haven't asked for anything worth fighting over yet.",
        },
        {
          id: "nw2_deal_vo1",
          characterId: "jack",
          expression: "V.O.",
          background: "/img/nw2/bg-diner-int.jpg",
          backgroundTransition: "crossfade",
          backgroundTransitionSpeed: 1.0,
          text:
            "Her footsteps going. The bell. Rain swelling loud for a beat, then hushing as the door shut. No napkin, no line. A folder, a name I didn't like, and a woman too honest to be lying about all of it.",
        },
        {
          id: "nw2_deal_vo2",
          characterId: "jack",
          expression: "V.O.",
          recalls: {
            nw2_file:
              "I'd told her about the file. Ten years I hadn't said it out loud to anybody, and I gave it to a stranger in a booth because she asked me straight. Smart move was letting it go. I'm not smart about that.",
          },
          text: "Smart move was letting it go. I'm not smart about that.",
        },
        {
          id: "nw2_deal_vo3",
          characterId: "jack",
          expression: "V.O.",
          text: "Lonely, dressed up as a work ethic. I turned the page.",
        },
      ],
      choices: [
        {
          id: "nw2_deal_go",
          text: "Turn the page.",
          targetSceneId: "nw2_bookend",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ================================================================= */
    /*  ACT TWO — THE ELEVEN WEEKS                                       */
    /*                                                                   */
    /*  The bridge Act One always implied and never had. It delivers the */
    /*  three facts Act Three quotes (the bakery, the motel clerk, the   */
    /*  trail going cold) and stages the 3 a.m. office beat that Part 6  */
    /*  calls back to: Vera starts to confess, the phone rings, and Jack */
    /*  has four seconds. Losing that window is canonical.               */
    /* ================================================================= */
    {
      id: "nw2_a2_office",
      title: "Act Two — Eleven Weeks",
      background: "/img/nw2/bg-office-night.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.4,
      cinematic: {
        mode: "dolly",
        focalPoint: "50% 54%",
        zoomDuration: 34,
        dollyDistance: 3,
        dimAmount: 0.34,
        lights: [
          { x: 22, y: 58, color: "#ffb761", intensity: 0.3, size: 24, pulseSeconds: 7.0, pulseAmount: 0.25 },
          { x: 82, y: 34, color: "#2ad9d9", intensity: 0.2, size: 34, pulseSeconds: 6.2, pulseAmount: 0.45 },
        ],
      },
      onEnterActions: [
        { consequences: { setFlags: ["nw2_knows_bakery", "nw2_knows_motel_tip"] } },
      ],
      prose:
        "Eleven weeks. That's the part nobody puts in the story, because eleven weeks of a man reading bank statements under a lamp doesn't cut together.\n\nWhat I had: a building on Ash Street with two cast-iron ovens still in it, because nobody could work out how to get them down the stairs. Six tables, he'd told her. Bread in the morning. One thing he'd have to be bad at first.\n\nWhat I also had: a motel four hours north where a man matching David Voss tipped the night clerk two dollars nine days after he ran. A man with two hundred grand in a bag, sleeping in his shoes, and he tipped the clerk.\n\nThree in the morning and she was in my office because neither of us had anywhere better to be at three in the morning.",
      dialogueBeats: [
        {
          id: "nw2_a2_v1",
          characterId: "vera",
          expression: "coat still on, not sitting properly",
          text: "You've been at this eleven weeks and you still haven't asked me the thing you want to ask me.",
        },
        {
          id: "nw2_a2_j1",
          characterId: "jack",
          expression: "not looking up from the folder",
          text: "I've asked you plenty.",
        },
        {
          id: "nw2_a2_v2",
          characterId: "vera",
          text: "You've asked me about David. That's not the same as asking me.",
        },
        {
          id: "nw2_a2_j2",
          characterId: "jack",
          expression: "V.O.",
          text:
            "She was right, and she'd been right for about nine of the eleven weeks. I'd built a very careful machine for not asking her anything, and I'd been running it every day, and she'd been standing next to it watching me run it.",
        },
        {
          id: "nw2_a2_v3",
          characterId: "vera",
          expression: "and something in her decides",
          text: "Jack. I need to tell you something and I need to do it now, because if I sit down I won't.",
        },
        {
          id: "nw2_a2_j3",
          characterId: "jack",
          expression: "putting the folder down at last",
          text: "Then tell me.",
        },
        {
          id: "nw2_a2_v4",
          characterId: "vera",
          expression: "starting, genuinely starting",
          text: "Fourteen months ago I—",
        },
        {
          id: "nw2_a2_ring",
          characterId: "jack",
          expression: "V.O.",
          silent: true,
          text: "— the phone. Flat and loud in a small room at three in the morning. —",
        },
      ],
      choices: [
        {
          id: "nw2_a2_answer",
          text: "\"Don't stop. Say it.\"",
          targetSceneId: "nw2_a2_phone",
          attitudeTag: "Sultry",
          quickTime: true,
          timeLimitSeconds: 4,
          qtePrompt: "ANSWER HER",
          qteHeartbeat: true,
          consequences: { setFlags: ["nw2_heard_her_out", "nw2_four_seconds"] },
          memoryLog: "nw2_3am",
          rememberLine: "Vera will remember that.",
          // Letting it lapse is canonical: Part 6 needs Jack to have his own
          // four seconds to set against hers.
          timedOutTargetSceneId: "nw2_a2_phone",
          timedOutConsequences: { setFlags: ["nw2_four_seconds", "nw2_didnt_answer"] },
        },
        {
          id: "nw2_a2_pickup",
          text: "Pick up the phone.",
          targetSceneId: "nw2_a2_phone",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["nw2_four_seconds", "nw2_didnt_answer", "nw2_took_the_call"] },
          memoryLog: "nw2_3am",
        },
      ],
      hotspots: [],
    },

    /* ================================================================= */
    /*  ACT TWO, CONT. — the call that was actually the case             */
    /* ================================================================= */
    {
      id: "nw2_a2_phone",
      title: "Four Hours North",
      partBreak: "Act Two — Eleven Weeks",
      background: "/img/nw2/bg-office-night.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "none",
      transition: "fade",
      transitionSpeed: 0.9,
      cinematic: {
        mode: "static",
        dimAmount: 0.36,
        lights: [
          { x: 22, y: 58, color: "#ffb761", intensity: 0.26, size: 24, pulseSeconds: 7.0, pulseAmount: 0.25 },
        ],
      },
      prose: "",
      dialogueBeats: [
        {
          id: "nw2_a2p_j0",
          characterId: "jack",
          expression: "V.O.",
          conditionRule: { requiresFlags: ["nw2_heard_her_out"] },
          text:
            "I let it ring. Four rings, and I kept my eyes on her the whole time, and she got about six words further than she'd ever got before. Not all of it. But six words is six words, and I'd earned them by not reaching for a telephone.",
        },
        {
          id: "nw2_a2p_v0",
          characterId: "vera",
          expression: "quiet, having said the six words",
          conditionRule: { requiresFlags: ["nw2_heard_her_out"] },
          text: "I tracked it. Fourteen months. I'm not finished, but I've started, and I'm not going to unstart it.",
        },
        {
          id: "nw2_a2p_j0b",
          characterId: "jack",
          expression: "V.O.",
          conditionRule: { requiresFlags: ["nw2_didnt_answer"] },
          text:
            "I picked it up. Four seconds is how long it takes to decide that a ringing telephone at three in the morning is more important than a woman with her coat still on, and I spent all four of them reaching.",
        },
        {
          id: "nw2_a2p_j0c",
          characterId: "jack",
          expression: "V.O.",
          conditionRule: { requiresFlags: ["nw2_didnt_answer"] },
          text: "She didn't finish the sentence. She never tried again, either. I want that noted.",
        },
        {
          id: "nw2_a2p_j1",
          characterId: "jack",
          expression: "on the phone, flat",
          text: "Morrow.",
        },
        {
          id: "nw2_a2p_j2",
          characterId: "jack",
          expression: "V.O.",
          text:
            "Night clerk at a motel four hours north, calling back about a photograph I'd mailed him nine days earlier and a twenty I'd folded inside it. Room eleven. Paid cash, three nights, hadn't checked out.",
        },
        {
          id: "nw2_a2p_j3",
          characterId: "jack",
          expression: "V.O.",
          text:
            "I stood in my own office with the receiver in my hand and I understood that I'd found him, and that finding him was the last easy thing that was going to happen.",
        },
        {
          id: "nw2_a2p_v1",
          characterId: "vera",
          expression: "reading his face",
          text: "That's him.",
        },
        {
          id: "nw2_a2p_j4",
          characterId: "jack",
          text: "That's him.",
        },
        {
          id: "nw2_a2p_v2",
          characterId: "vera",
          expression: "and this is the last thing she says before the yard",
          text: "Then go. Don't tell me the address. I don't want to know it until you're standing in it.",
        },
        {
          id: "nw2_a2p_j5",
          characterId: "jack",
          expression: "V.O.",
          text:
            "I have thought about that sentence every day since. At the time it sounded like a woman who couldn't bear to hope. Eleven weeks later, in a wet lot behind a mill, I found out she already had the address, and had had it for eleven hours.",
        },
      ],
      choices: [
        {
          id: "nw2_a2p_go",
          text: "Get in the car.",
          targetSceneId: "nw2_p1_call",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ================================================================= */
    /*  ACT THREE, PART 1 — THE CALL                                     */
    /*                                                                   */
    /*  The fork the V.O. names out loud: tell her, or hold it back and  */
    /*  see what she says without being steered there.                   */
    /* ================================================================= */
    {
      id: "nw2_p1_call",
      title: "Act Three, Part 1 — The Call",
      background: "/img/nw2/bg-yard-night.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.4,
      letterbox: true,
      cinematic: {
        mode: "static",
        dimAmount: 0.42,
        lights: [
          { x: 76, y: 30, color: "#2a6cff", intensity: 0.26, size: 40, pulseSeconds: 1.9, pulseAmount: 1.0 },
          { x: 84, y: 34, color: "#ff2e3c", intensity: 0.24, size: 38, pulseSeconds: 2.3, pulseAmount: 1.0 },
        ],
      },
      // Jack's four rings. The mirror of Vera's four seconds in Part 6.
      onEnterActions: [
        { consequences: { setFlags: ["nw2_david_dead", "nw2_four_seconds"] } },
      ],
      prose:
        "Still in the yard. State-police radios somewhere behind me, distant and indistinct, and the strobes going red and blue through the rain without ever quite landing on anything.\n\nI let it ring four times. Not because I didn't know I was going to answer. Because I needed those four rings to remember something before I did.\n\nSix tables. Bread in the morning. One thing he'd have to be bad at first.",
      dialogueBeats: [
        {
          id: "nw2_p1_j1",
          characterId: "jack",
          expression: "flat, guarded, exhausted",
          text: "Yeah.",
        },
        {
          id: "nw2_p1_v1",
          characterId: "vera",
          expression: "filtered, phone — controlled, something underneath fraying",
          text: "Jack. Thank God. I've been calling since this morning.",
        },
        {
          id: "nw2_p1_j2",
          characterId: "jack",
          expression: "careful, testing",
          text: "Been a long night.",
        },
        {
          id: "nw2_p1_v2",
          characterId: "vera",
          expression: "filtered, phone — quick, urgent",
          text: "Have you found him? Please tell me you found him.",
        },
        {
          id: "nw2_p1_j3",
          characterId: "jack",
          expression: "V.O.",
          text:
            "There it was. The exact fork in the road. Tell her everything and watch what her face does. Or hold it back and see what she says next without me steering her there.",
        },
      ],
      choices: [
        {
          id: "nw2_p1_tell",
          text: "\"I found him.\"",
          targetSceneId: "nw2_p1_after",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["nw2_told_phone"] },
          memoryLog: "nw2_phone",
          rememberLine: "Vera will remember that.",
        },
        {
          id: "nw2_p1_hold",
          text: "Say nothing. Let the silence do it.",
          targetSceneId: "nw2_p1_after",
          attitudeTag: "Clever",
          consequences: { setFlags: ["nw2_held_phone"] },
          memoryLog: "nw2_phone",
        },
      ],
      hotspots: [],
    },

    /* ================================================================= */
    /*  PART 1, CONT. — the rest of the call                             */
    /* ================================================================= */
    {
      id: "nw2_p1_after",
      partBreak: "Act Three, Part 1 — The Call",
      title: "One Hour",
      background: "/img/nw2/bg-yard-night.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "none",
      transition: "fade",
      transitionSpeed: 0.9,
      letterbox: true,
      cinematic: {
        mode: "static",
        dimAmount: 0.42,
        lights: [
          { x: 76, y: 30, color: "#2a6cff", intensity: 0.24, size: 40, pulseSeconds: 1.9, pulseAmount: 1.0 },
          { x: 84, y: 34, color: "#ff2e3c", intensity: 0.22, size: 38, pulseSeconds: 2.3, pulseAmount: 1.0 },
        ],
      },
      prose: "",
      dialogueBeats: [
        {
          id: "nw2_p1a_v1",
          characterId: "vera",
          expression: "filtered, phone — a sharp breath",
          conditionRule: { requiresFlags: ["nw2_told_phone"] },
          text: "Where. Is he safe?",
        },
        {
          id: "nw2_p1a_j1",
          characterId: "jack",
          expression: "flat, after the silence goes on too long",
          conditionRule: { requiresFlags: ["nw2_told_phone"] },
          text: "I was standing about twenty feet away.",
        },
        {
          id: "nw2_p1a_v1b",
          characterId: "vera",
          expression: "filtered, phone — into the silence, quieter",
          conditionRule: { requiresFlags: ["nw2_held_phone"] },
          text: "Jack. You're not saying anything. [beat] You'd have said it by now if it was the other thing.",
        },
        {
          id: "nw2_p1a_j1b",
          characterId: "jack",
          expression: "V.O.",
          conditionRule: { requiresFlags: ["nw2_held_phone"] },
          text:
            "I didn't steer her anywhere. She got there on her own in under three seconds, which told me something I'd have rather not learned on a phone in a wet yard.",
        },
        {
          id: "nw2_p1a_v2",
          characterId: "vera",
          expression: "filtered, phone — after a long moment, very small",
          text: "Okay.",
        },
        {
          id: "nw2_p1a_j2",
          characterId: "jack",
          text: "That's it? Okay?",
        },
        {
          id: "nw2_p1a_v3",
          characterId: "vera",
          expression: "filtered, phone — barely",
          text: "I don't know what the other thing is. Nobody's ever told me one before.",
        },
        {
          id: "nw2_p1a_v4",
          characterId: "vera",
          expression: "filtered, phone — breaking, and it doesn't sound performed anymore",
          text: "Jack, I swear to you—",
        },
        {
          id: "nw2_p1a_j3",
          characterId: "jack",
          expression: "cutting her off, exhausted",
          text:
            "Don't. Not on the phone. Whatever you're gonna swear to me, you're gonna say it to my face, where I can watch you say it.",
        },
        {
          id: "nw2_p1a_v5",
          characterId: "vera",
          expression: "filtered, phone — quiet, resolved",
          text: "Okay. Where.",
        },
        {
          id: "nw2_p1a_j4",
          characterId: "jack",
          expression: "flat",
          text: "I'll text you an address. One hour.",
        },
        {
          id: "nw2_p1a_j5",
          characterId: "jack",
          expression: "V.O.",
          text:
            "I still love her. I want that on the record, whatever happens after this. Knowing what I know now didn't put it out. It just means I'm walking toward her with my eyes open instead of closed. I'm not sure that's braver. I think it might just be sadder.",
        },
      ],
      choices: [
        {
          id: "nw2_p1a_go",
          text: "Lower the phone.",
          targetSceneId: "nw2_p2_rosa",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ================================================================= */
    /*  ACT THREE, PART 2 — WHAT ROSA KNOWS                              */
    /* ================================================================= */
    {
      id: "nw2_p2_rosa",
      partBreak: "Act Three, Part 2 — What Rosa Knows",
      title: "Act Three, Part 2 — What Rosa Knows",
      background: "/img/nw2/bg-rosa-car.jpg",
      ambientAudio: "drone",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.2,
      cinematic: {
        mode: "static",
        dimAmount: 0.3,
        lights: [
          { x: 34, y: 62, color: "#ffb761", intensity: 0.24, size: 26, pulseSeconds: 6.4, pulseAmount: 0.3 },
          { x: 72, y: 30, color: "#2ad9d9", intensity: 0.14, size: 34, pulseSeconds: 7.2, pulseAmount: 0.4 },
        ],
      },
      prose:
        "Rosa didn't ask where I'd been. She never does when it's bad. She just opens the door.",
      onEnterActions: [
        { consequences: { setFlags: ["nw2_rosa_transfer"] } },
      ],
      dialogueBeats: [
        {
          id: "nw2_p2_r1",
          characterId: "rosa",
          expression: "not looking at him, eyes on the street, calm and cold",
          text: "David Voss is dead, Jack. Or he will be by morning. You know that.",
        },
        {
          id: "nw2_p2_j1",
          characterId: "jack",
          expression: "flat, no argument left in him",
          text: "I know that.",
        },
        {
          id: "nw2_p2_r2",
          characterId: "rosa",
          text: "I can bring people in. Real ones. Badges that mean something.",
        },
        {
          id: "nw2_p2_j2",
          characterId: "jack",
          expression: "quiet",
          text: "Not yet.",
        },
        {
          id: "nw2_p2_r3",
          characterId: "rosa",
          expression: "turning to him now, sharp",
          text: "Not yet. Christ, Jack. You keep saying that like there's a version of \"yet\" where it gets easier.",
        },
        {
          id: "nw2_p2_j3",
          characterId: "jack",
          expression: "low, looking out his own window",
          text: "Maybe there isn't. Doesn't mean I stop trying to find it.",
        },
        {
          id: "nw2_p2_r4",
          characterId: "rosa",
          expression: "quiet, controlled anger",
          text: "You're protecting her. Still. After all this.",
        },
        {
          id: "nw2_p2_j4",
          characterId: "jack",
          expression: "after a long pause",
          text: "Yeah.",
        },
        {
          id: "nw2_p2_r5",
          characterId: "rosa",
          expression: "not cruel, just done pretending",
          text:
            "I used to think you were the most honest man I knew, Jack. Turns out you just hadn't met anybody worth lying to yourself about yet.",
        },
        {
          id: "nw2_p2_r6",
          characterId: "rosa",
          expression: "quieter",
          text:
            "You wouldn't lose a file for them. Eleven months at an empty desk and you wouldn't do it. I watched you do that. Twenty-six years old. Thought it was the most impressive thing a person could be.",
        },
        {
          id: "nw2_p2_r7",
          characterId: "rosa",
          expression: "flat",
          text:
            "I stayed. You didn't. I've made my peace with which of us was right about that. What I can't work out is how a man who wouldn't bend for the whole department bends this fast for one woman in a diner.",
        },
        {
          id: "nw2_p2_r8",
          characterId: "rosa",
          expression: "quieter, and this is not something she planned to say",
          text:
            "There's a transfer sitting on my captain's desk. County sheriff's, forty minutes from here. Actual budget. Actual backup that shows up. I've been sitting on the paperwork eight months because signing it means admitting I've given up on this place ever being anything else.",
        },
        {
          id: "nw2_p2_j5",
          characterId: "jack",
          expression: "low",
          text: "Rosa. I didn't know that.",
        },
        {
          id: "nw2_p2_r9",
          characterId: "rosa",
          expression: "flat",
          text:
            "Nobody knows. That's rather the point of not signing it. I sign it, I file it Monday, I'm gone by spring. Simple. Except every time I go to sign it I think about who's left holding the department if I do, and I put the pen down.",
        },
        {
          id: "nw2_p2_r10",
          characterId: "rosa",
          expression: "quiet",
          text:
            "If I help you and it goes bad, that transfer doesn't happen. Not because they'd fire me. Because nobody signs off on moving a detective who let a murder walk uninvestigated to protect a friend. I've done the arithmetic on that too. I'm not walking into this blind either.",
        },
        {
          id: "nw2_p2_r11",
          characterId: "rosa",
          expression: "softer now, almost gentle, which somehow lands harder",
          text: "I'm not gonna stop you. I want you to know that. I'm just not gonna help you walk into it blind, either.",
        },
      ],
      choices: [
        {
          id: "nw2_p2_know",
          text: "\"I know what I'm walking into.\"",
          targetSceneId: "nw2_p3_mill",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["nw2_said_i_know"] },
        },
        {
          id: "nw2_p2_ask",
          text: "\"Then tell me. Don't spare me any of it.\"",
          targetSceneId: "nw2_p3_mill",
          attitudeTag: "Clever",
          consequences: { setFlags: ["nw2_asked_rosa"], trustChanges: [{ characterId: "rosa", delta: 1 }] },
        },
      ],
      hotspots: [],
    },

    /* ================================================================= */
    /*  ACT THREE, PART 3 — TWO HUNDRED AND ELEVEN THOUSAND              */
    /*                                                                   */
    /*  The confession. Everything the ending quotes gets established    */
    /*  here: the figure, the maiden name, the furnace, the eleven       */
    /*  hours, the motel clerk.                                          */
    /* ================================================================= */
    {
      id: "nw2_p3_mill",
      title: "Act Three, Part 3 — Two Hundred and Eleven Thousand",
      background: "/img/nw2/bg-mill-lot.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.3,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 50%",
        zoomDuration: 40,
        dimAmount: 0.32,
        lights: [
          { x: 52, y: 22, color: "#ffb761", intensity: 0.3, size: 26, pulseSeconds: 0.9, pulseAmount: 0.35 },
        ],
      },
      onEnterActions: [
        {
          consequences: {
            setFlags: [
              "nw2_knows_voss_debt",
              "nw2_knows_kessler_debt",
              "nw2_vera_maiden_kessler",
              "nw2_vera_tipped",
              "nw2_knows_motel_tip",
            ],
          },
        },
      ],
      prose:
        "I picked the mill lot because nobody comes here. That's not true. Nobody comes here anymore. There's a difference, and in Blackwood it's most of the town.\n\nShe crossed the lot under the one working sodium light. No coat this time. Hair flat with rain, walking like the ten feet between us cost her something.\n\nShe didn't bring the coat.",
      dialogueBeats: [
        {
          id: "nw2_p3_v1",
          characterId: "vera",
          expression: "quiet, no performance in it",
          text: "Is he alive?",
        },
        {
          id: "nw2_p3_j1",
          characterId: "jack",
          expression: "flat",
          text: "I don't know.",
        },
        {
          id: "nw2_p3_v2",
          characterId: "vera",
          expression: "a breath",
          text: "Okay.",
        },
        {
          id: "nw2_p3_j2",
          characterId: "jack",
          text: "That's it? Okay?",
        },
        {
          id: "nw2_p3_v3",
          characterId: "vera",
          expression: "steady",
          text: "What else is there.",
        },
        {
          id: "nw2_p3_j3",
          characterId: "jack",
          expression: "not raising his voice",
          text: "I want to hear you say it. All of it. Out loud, standing there, where I can see your face.",
        },
        {
          id: "nw2_p3_v4",
          characterId: "vera",
          expression: "after a beat",
          text: "You already know all of it.",
        },
        {
          id: "nw2_p3_j4",
          characterId: "jack",
          text: "Say it anyway.",
        },
        {
          id: "nw2_p3_v5",
          characterId: "vera",
          expression: "measured, factual — the way people talk about things they've rehearsed alone",
          text:
            "Two hundred and eleven thousand dollars. Fourteen months. David moved it, I tracked it. I picked the date, I built the folder, I picked you.",
        },
        {
          id: "nw2_p3_j5",
          characterId: "jack",
          text: "Why me.",
        },
        {
          id: "nw2_p3_v6",
          characterId: "vera",
          expression: "simply",
          text: "Because you're the only man in Blackwood who doesn't work for Solomon and doesn't want to.",
        },
        {
          id: "nw2_p3_j6",
          characterId: "jack",
          expression: "quiet",
          text: "That's not a compliment. That's a spec sheet.",
        },
        {
          id: "nw2_p3_v7",
          characterId: "vera",
          expression: "not denying it",
          text: "No. It's not a compliment.",
        },
        {
          id: "nw2_p3_j7",
          characterId: "jack",
          expression: "lower",
          text: "Why'd you do it.",
        },
        {
          id: "nw2_p3_v8",
          characterId: "vera",
          expression: "first crack",
          text: "Does it matter now?",
        },
        {
          id: "nw2_p3_j8",
          characterId: "jack",
          expression: "hard",
          text: "A man got put in a car in front of me nine hours ago. Yeah. It matters now.",
        },
        {
          id: "nw2_p3_v9",
          characterId: "vera",
          expression: "flat, and she volunteers it — he hasn't asked",
          text: "I knew Solomon had the address before you did.",
        },
        {
          id: "nw2_p3_j9",
          characterId: "jack",
          expression: "dangerous, quiet",
          text: "Say that again.",
        },
        {
          id: "nw2_p3_v10",
          characterId: "vera",
          text:
            "Doc Sato sold it to them Tuesday. Six hundred dollars. I found out about eleven hours before you got there. I could have called David. I have the number. I didn't.",
        },
        {
          id: "nw2_p3_j10",
          characterId: "jack",
          expression: "barely controlled",
          text: "Why.",
        },
        {
          id: "nw2_p3_v11",
          characterId: "vera",
          expression: "not defending it, just answering",
          text:
            "Because if I called him he'd have run, and if he ran with the money I'd have had nothing, and I hadn't finished deciding what I was willing to lose. I spent eleven hours deciding. That's how long he had, and I spent all of it thinking about myself.",
        },
        {
          id: "nw2_p3_v12",
          characterId: "vera",
          expression: "quiet",
          text: "You wanted it out loud. That's the part I'd have left out.",
        },
        {
          id: "nw2_p3_v13",
          characterId: "vera",
          expression: "smaller, and she doesn't perform any of it",
          text: "My father borrowed four thousand dollars from Solomon Reyes. 2011. A furnace.",
        },
        {
          id: "nw2_p3_j11",
          characterId: "jack",
          expression: "quiet",
          text: "How much did he end up owing.",
        },
        {
          id: "nw2_p3_v14",
          characterId: "vera",
          text: "Eleven. Nine years and it grew. You don't pay it off here. You pay on it. Forever. Then you hand it to whoever's left.",
        },
        {
          id: "nw2_p3_j12",
          characterId: "jack",
          expression: "low",
          text: "And that was you.",
        },
        {
          id: "nw2_p3_v15",
          characterId: "vera",
          expression: "flat",
          text: "Kessler. That was my name before David. In case you wondered why Solomon's never once called me Mrs. Voss.",
        },
        {
          id: "nw2_p3_v16",
          characterId: "vera",
          expression: "flat",
          text:
            "It came to me at the funeral. Solomon shook my hand at my father's funeral and told me he was sorry for my loss and that we'd talk when I was ready. That's the whole town, Jack. That's Blackwood in one handshake.",
        },
        {
          id: "nw2_p3_v17",
          characterId: "vera",
          expression: "quieter",
          text:
            "So no, I didn't do it for a bag of money. I did it because there's no version of staying here where I ever stop owing him. Not for me. Not for anybody I'd ever have. I wanted out. That's all it ever was. I wanted out and I didn't care what it cost, and then it cost something, and now I care. That's not redemption. That's just arithmetic catching up.",
        },
        {
          id: "nw2_p3_j13",
          characterId: "jack",
          expression: "very quiet",
          text: "Were you gonna cut him out?",
        },
        {
          id: "nw2_p3_v18",
          characterId: "vera",
          expression: "honest, and it's worse than a lie",
          text: "I hadn't decided.",
        },
        {
          id: "nw2_p3_j14",
          characterId: "jack",
          expression: "barely audible",
          text: "Jesus, Vera.",
        },
        {
          id: "nw2_p3_v19",
          characterId: "vera",
          expression: "not defending it",
          text:
            "You asked. I'm not going to start lying to you now. That's the one thing I've got left to give you, and it's not worth much.",
        },
        {
          id: "nw2_p3_v20",
          characterId: "vera",
          expression: "quiet",
          text: "Tell me how it happened.",
        },
      ],
      choices: [
        {
          id: "nw2_p3_mercy",
          text: "\"No. You get to not have that one.\"",
          targetSceneId: "nw2_p3_after",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["nw2_gave_mercy"], trustChanges: [{ characterId: "vera", delta: 1 }] },
          memoryLog: "nw2_mercy",
          rememberLine: "Vera will remember that.",
        },
        {
          id: "nw2_p3_tell",
          text: "Tell her all of it. She asked.",
          targetSceneId: "nw2_p3_after",
          attitudeTag: "Aggressive",
          consequences: { setFlags: ["nw2_told_the_yard"] },
          memoryLog: "nw2_mercy",
        },
      ],
      hotspots: [],
    },

    /* ================================================================= */
    /*  PART 3, CONT. — the sentence nobody finishes                     */
    /* ================================================================= */
    {
      id: "nw2_p3_after",
      partBreak: "Act Three, Part 3 — Two Hundred and Eleven Thousand",
      title: "The Sentence Nobody Finishes",
      background: "/img/nw2/bg-mill-lot.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "none",
      transition: "fade",
      transitionSpeed: 0.9,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 50%",
        zoomDuration: 30,
        dimAmount: 0.34,
        lights: [
          { x: 52, y: 22, color: "#ffb761", intensity: 0.28, size: 26, pulseSeconds: 0.9, pulseAmount: 0.35 },
        ],
      },
      prose: "",
      dialogueBeats: [
        {
          id: "nw2_p3a_j0",
          characterId: "jack",
          expression: "quiet, and this is mercy, not cruelty",
          conditionRule: { requiresFlags: ["nw2_gave_mercy"] },
          text: "No. You get to not have that one. It's the only thing left I can give you and I'm giving it.",
        },
        {
          id: "nw2_p3a_j0b",
          characterId: "jack",
          expression: "V.O.",
          conditionRule: { requiresFlags: ["nw2_told_the_yard"] },
          text:
            "So I told her. The fence, the three steps, the twenty feet. She asked for it and I handed it over, and I watched it go into her and settle somewhere it isn't ever coming back out of. I'd told myself that was respect. Standing there watching her take it, I couldn't find the part that was respect.",
        },
        {
          id: "nw2_p3a_v1",
          characterId: "vera",
          expression: "after a while, barely",
          text: "He couldn't sleep in a room with the door shut. Since he was a kid. He used to say—",
        },
        {
          id: "nw2_p3a_j1",
          characterId: "jack",
          expression: "V.O.",
          text:
            "She didn't finish it. Whatever David used to say about doors, she's the only person alive who knew it, and she couldn't get it out of her mouth. That's what it actually is. Not the body. The sentence nobody finishes.",
        },
        {
          id: "nw2_p3a_v2",
          characterId: "vera",
          expression: "quiet, wrecked",
          text: "You should go home, Jack.",
        },
        {
          id: "nw2_p3a_j2",
          characterId: "jack",
          expression: "flat",
          text: "Not a chance.",
        },
        {
          id: "nw2_p3a_v3",
          characterId: "vera",
          expression: "not looking at him",
          text: "I've already cost one man everything he had. I'm standing here doing the math on the second one.",
        },
        {
          id: "nw2_p3a_j3",
          characterId: "jack",
          expression: "quiet, and completely sincere",
          text: "Then stop doing math.",
        },
        {
          id: "nw2_p3a_j4",
          characterId: "jack",
          expression: "V.O.",
          text:
            "She looked at me for a long time. And I understood, standing in a wet lot behind a mill that closed when I was thirty-two, that she was going to try to save me. That she'd decided it somewhere in the last four seconds, and she was going to be quiet about it, and she was going to be better at it than I was going to be at stopping her.",
        },
        {
          id: "nw2_p3a_j5",
          characterId: "jack",
          expression: "V.O.",
          text:
            "He tipped a motel clerk. Nine days ago. Man on the run with two hundred grand in a bag, and he tipped a motel clerk. I keep coming back to that. I don't know why that's the part I can't put down.",
        },
      ],
      choices: [
        {
          id: "nw2_p3a_go",
          text: "Watch her car go.",
          targetSceneId: "nw2_p4_cost",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ================================================================= */
    /*  ACT THREE, PART 4 — THE COST                                     */
    /*                                                                   */
    /*  Friday is the clock. Rosa pays with her opinion of herself.      */
    /* ================================================================= */
    {
      id: "nw2_p4_cost",
      partBreak: "Act Three, Part 4 — The Cost",
      title: "Act Three, Part 4 — The Cost",
      background: "/img/nw2/bg-rosa-car.jpg",
      ambientAudio: "drone",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.2,
      cinematic: {
        mode: "static",
        dimAmount: 0.32,
        lights: [
          { x: 34, y: 62, color: "#ffb761", intensity: 0.22, size: 26, pulseSeconds: 6.4, pulseAmount: 0.3 },
          { x: 74, y: 32, color: "#2ad9d9", intensity: 0.14, size: 34, pulseSeconds: 7.2, pulseAmount: 0.4 },
        ],
      },
      onEnterActions: [
        { consequences: { setFlags: ["nw2_friday_clock", "nw2_vera_confessing"] } },
      ],
      prose:
        "I didn't have a car. Walked out there, same as I said — an hour to think, no vehicle to think in. So I stood in an empty lot behind a dead mill and called the one person left who'd still come get me.\n\nShe got in beside me rather than the other way round. She'd come to sit with me, not to drive off yet.",
      dialogueBeats: [
        {
          id: "nw2_p4_r1",
          characterId: "rosa",
          text: "You told her.",
        },
        {
          id: "nw2_p4_j1",
          characterId: "jack",
          expression: "flat",
          text: "Yeah.",
        },
        {
          id: "nw2_p4_r2",
          characterId: "rosa",
          expression: "quiet",
          text: "Good. She deserved to hear it from someone who was actually there.",
        },
        {
          id: "nw2_p4_j2",
          characterId: "jack",
          expression: "V.O.",
          text: "Twenty minutes before, he was telling me about a building on Ash Street with the ovens still in it.",
          background: "/img/nw2/bg-ash-street.jpg",
          backgroundTransition: "fade",
          backgroundTransitionSpeed: 1.4,
        },
        {
          id: "nw2_p4_j3",
          characterId: "jack",
          expression: "V.O., barely audible",
          text:
            "I said \"don't thank me yet.\" Those were my words. I've got the rest of my life to find better ones and it won't matter, because he's not in the room for them.",
          background: "/img/nw2/bg-ash-street.jpg",
        },
        {
          id: "nw2_p4_r3",
          characterId: "rosa",
          expression: "eyes forward, flat, driving now",
          text: "Solomon's put the debt on her. It's formal now. He told two people, which in Blackwood is the same as publishing it.",
        },
        {
          id: "nw2_p4_j4",
          characterId: "jack",
          expression: "flat",
          text: "How much.",
        },
        {
          id: "nw2_p4_r4",
          characterId: "rosa",
          text: "All of it. Two-eleven, plus what her father still owed. He's calling it one number now.",
        },
        {
          id: "nw2_p4_j5",
          characterId: "jack",
          expression: "quiet",
          text: "That's not a debt. That's a sentence.",
        },
        {
          id: "nw2_p4_r5",
          characterId: "rosa",
          expression: "still not looking at him",
          text: "Yeah. He knows that. He gave her till Friday.",
        },
        {
          id: "nw2_p4_j6",
          characterId: "jack",
          expression: "very quiet",
          text: "It's Wednesday.",
        },
        {
          id: "nw2_p4_r6",
          characterId: "rosa",
          expression: "flat",
          text: "It's Wednesday.",
        },
        {
          id: "nw2_p4_j7",
          characterId: "jack",
          text: "What happens Friday.",
        },
        {
          id: "nw2_p4_r7",
          characterId: "rosa",
          expression: "plainly, because dressing it up would be worse",
          text:
            "The same thing that happened in that yard. He's not going to make a speech about it, Jack. It'll just be Friday, and then it'll be Saturday, and she won't be anywhere.",
        },
        {
          id: "nw2_p4_r8",
          characterId: "rosa",
          expression: "carefully",
          text: "She came to see me. Two hours ago.",
        },
        {
          id: "nw2_p4_j8",
          characterId: "jack",
          expression: "sharp — first real reaction in the scene",
          text: "She what?",
        },
        {
          id: "nw2_p4_r9",
          characterId: "rosa",
          text:
            "Walked into the station and asked me what happens to a person who confesses to a theft the victim can't report to the police. She wasn't asking about jail, Jack. She was asking how to make it land on her and nobody else.",
        },
        {
          id: "nw2_p4_j9",
          characterId: "jack",
          expression: "low",
          text: "She's putting her name on all of it.",
        },
        {
          id: "nw2_p4_r10",
          characterId: "rosa",
          text: "She's doing it quiet. She didn't ask me to tell you.",
        },
        {
          id: "nw2_p4_j10",
          characterId: "jack",
          text: "Then why are you.",
        },
        {
          id: "nw2_p4_r11",
          characterId: "rosa",
          expression: "quiet, and it costs her",
          text:
            "Because I've spent three days trying to keep you out of this, and I've lost. So now I'd rather you go in knowing what she's doing than find out after. That's not me helping. That's me giving up. I want you to understand the difference.",
        },
        {
          id: "nw2_p4_r12",
          characterId: "rosa",
          expression: "flat",
          text:
            "I pulled the transfer paperwork off my captain's desk this morning. Before you called. Not because of you. Because I already knew what I was going to do this week, and there's no version of it that looks good on a form asking whether I've got any active conflicts of interest.",
        },
        {
          id: "nw2_p4_j11",
          characterId: "jack",
          expression: "low",
          text: "Rosa, don't do that because of me.",
        },
        {
          id: "nw2_p4_r13",
          characterId: "rosa",
          expression: "flat, not unkind",
          text:
            "I'm not. I'm doing it because of David Voss, same as you. You just get to feel like you're doing it for love. I don't get that part. I just get the paperwork.",
        },
        {
          id: "nw2_p4_j12",
          characterId: "jack",
          expression: "quiet",
          conditionRule: { requiresFlags: ["nw2_rosa_transfer"] },
          text: "I know what that transfer was.",
        },
        {
          id: "nw2_p4_r14",
          characterId: "rosa",
          expression: "flat",
          conditionRule: { requiresFlags: ["nw2_rosa_transfer"] },
          text:
            "Then you know what I'm telling you. Eight months I couldn't sign it because I didn't want to admit I'd given up on this place. Turns out I didn't give up on the place. I gave up on the form. Same drawer, either way.",
        },
        {
          id: "nw2_p4_j13",
          characterId: "jack",
          expression: "quiet",
          text: "Rosa—",
        },
        {
          id: "nw2_p4_r15",
          characterId: "rosa",
          expression: "cutting him off, not unkind",
          text:
            "Don't. If you say something decent right now I'm going to have to arrest one of you, and I've already decided I'm not going to, and I'd like to keep not deciding that for a few more hours.",
        },
        {
          id: "nw2_p4_j14",
          characterId: "jack",
          expression: "V.O.",
          text:
            "That's what it cost her. Not her badge. Her opinion of herself. She handed it over in a parked car in the rain and didn't make me watch her do it.",
        },
        {
          id: "nw2_p4_r16",
          characterId: "rosa",
          expression: "through the open door, last thing",
          text: "Jack. Whatever you're about to go do. Don't tell me about it.",
        },
      ],
      choices: [
        {
          id: "nw2_p4_go",
          text: "Close the door.",
          targetSceneId: "nw2_p4b_poolhall",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ================================================================= */
    /*  ACT THREE, PART 4B — THE BLUE CUE, AGAIN                         */
    /*                                                                   */
    /*  THE decisive scene. Moe opens a four-second window for violence. */
    /*  Taking it costs Jack Desh's disclosure — the thing the gold      */
    /*  ending is built on. Letting the window close is the canonical    */
    /*  path, and restraint is what buys the information.                */
    /* ================================================================= */
    {
      id: "nw2_p4b_poolhall",
      title: "Act Three, Part 4b — The Blue Cue, Again",
      background: "/img/nw2/bg-poolhall.jpg",
      ambientAudio: "tension",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.1,
      cinematic: {
        mode: "static",
        dimAmount: 0.28,
        lights: [
          { x: 26, y: 34, color: "#ff2e88", intensity: 0.24, size: 26, pulseSeconds: 3.4, pulseAmount: 0.7 },
          { x: 66, y: 40, color: "#ffb761", intensity: 0.26, size: 30, pulseSeconds: 5.0, pulseAmount: 0.4 },
        ],
      },
      prose:
        "Wednesday night. Two days left on her.\n\nI knew before I opened the door — Blackwood's four thousand people and Solomon keeps two men for the far end of things. There was never going to be anybody else.\n\nSame pool hall. Same warped jukebox. Same balls clacking. The room didn't react.",
      dialogueBeats: [
        {
          id: "nw2_p4b_d1",
          characterId: "desh",
          expression: "mid-conversation, exactly as before",
          text:
            "— all I'm saying is if the machine can tell it's the wrong item, the machine already knows what the right item is. So why's it asking me?",
        },
        {
          id: "nw2_p4b_m1",
          characterId: "moe",
          expression: "flat",
          text: "It's not asking you.",
        },
        {
          id: "nw2_p4b_d2",
          characterId: "desh",
          text: "It says \"please.\"",
        },
        {
          id: "nw2_p4b_m2",
          characterId: "moe",
          text:
            "That's not asking. That's a recording of somebody who asked once, in nineteen ninety-whatever, and now it just plays.",
        },
        {
          id: "nw2_p4b_j1",
          characterId: "jack",
          expression: "V.O., very quiet",
          text:
            "Nine days ago I stood in this room and thought that was funny. I want you to understand I laughed. I remember laughing.",
        },
        {
          id: "nw2_p4b_m3",
          characterId: "moe",
          expression: "still not turning",
          text: "Mr. Morrow.",
        },
        {
          id: "nw2_p4b_j2",
          characterId: "jack",
          expression: "low, and it costs him not to shout it",
          text: "Was it you. Just — tell me straight, don't make me stand here and guess like a fucking idiot.",
        },
        {
          id: "nw2_p4b_m4",
          characterId: "moe",
          expression: "calm, no evasion at all",
          text: "Yeah.",
        },
        {
          id: "nw2_p4b_j3",
          characterId: "jack",
          text: "The yard.",
        },
        {
          id: "nw2_p4b_m5",
          characterId: "moe",
          text: "Yeah.",
        },
        {
          id: "nw2_p4b_j4",
          characterId: "jack",
          expression: "voice not raised, which is worse",
          text: "He was three steps from the fence.",
        },
        {
          id: "nw2_p4b_m6",
          characterId: "moe",
          expression: "a beat — the first thing that lands on him",
          text: "I know. I was closer than I wanted to be.",
        },
        {
          id: "nw2_p4b_d3",
          characterId: "desh",
          expression: "quiet, not defensive, genuinely explaining",
          text:
            "He didn't know it was coming. If that's — I know that's not nothing to some people. He was still running. He never turned round.",
        },
        {
          id: "nw2_p4b_j5",
          characterId: "jack",
          expression: "very quiet",
          text: "Why are you telling me that.",
        },
        {
          id: "nw2_p4b_d4",
          characterId: "desh",
          expression: "simply",
          text:
            "'Cause you're gonna build a worse one in your head every night for the rest of your life, and I'd rather you had the true one to put against it.",
        },
        {
          id: "nw2_p4b_j6",
          characterId: "jack",
          expression: "V.O., spare, devastated",
          text:
            "That's the part nobody warns you about. I came in here ready for them to be monsters. They weren't. They were two men at a bar who did a job and remembered a detail and thought I might want it.",
        },
        {
          id: "nw2_p4b_m7",
          characterId: "moe",
          expression: "flat, not unkind",
          text: "You want to do something about it, now's the time. Nobody in here'd stop you and I wouldn't blame you.",
        },
        {
          id: "nw2_p4b_m8",
          characterId: "moe",
          expression: "reaching into his jacket, entirely matter-of-fact",
          text:
            "Or. Mr. Reyes said if you came in here I was to give you this. Four hundred. It's not for anything — that's the point of it. It's for the three days you already worked.",
        },
        {
          id: "nw2_p4b_j7",
          characterId: "jack",
          expression: "V.O.",
          text:
            "Four hundred dollars on a bar in a room where the rent was due and the office door leaked. Not a bribe. Nobody in Blackwood has ever had to say the word. You arrive at the number by yourself.",
        },
      ],
      choices: [
        {
          id: "nw2_p4b_take",
          text: "Take the four hundred.",
          targetSceneId: "nw2_p4b_door",
          attitudeTag: "Neutral",
          // The trapdoor. This is the ONLY place the spine flag can be lost,
          // and it is deliberately the most sympathetic offer in the film.
          consequences: {
            clearFlags: ["nw2_never_took"],
            setFlags: ["nw2_took_money", "nw2_desh_told_me", "nw2_holds_desh_secret"],
          },
          memoryLog: "nw2_poolhall",
          rememberLine: "Solomon Reyes will remember that.",
        },
        {
          id: "nw2_p4b_swing",
          text: "Swing at him.",
          targetSceneId: "nw2_p4b_door",
          attitudeTag: "Aggressive",
          quickTime: true,
          timeLimitSeconds: 4,
          qtePrompt: "NOW'S THE TIME",
          qteHeartbeat: true,
          qteShakyCam: true,
          consequences: { setFlags: ["nw2_swung"] },
          // Letting the window close is the canonical path. Restraint is what
          // buys Desh's disclosure, and Desh's disclosure is the gold ending.
          timedOutTargetSceneId: "nw2_p4b_door",
          timedOutConsequences: { setFlags: ["nw2_desh_told_me", "nw2_holds_desh_secret"] },
          memoryLog: "nw2_poolhall",
        },
        {
          id: "nw2_p4b_ask",
          text: "\"Would you fight back?\"",
          targetSceneId: "nw2_p4b_door",
          attitudeTag: "Clever",
          consequences: { setFlags: ["nw2_desh_told_me", "nw2_holds_desh_secret", "nw2_asked_moe"] },
          memoryLog: "nw2_poolhall",
        },
      ],
      hotspots: [],
    },

    /* ================================================================= */
    /*  PART 4B, CONT. — the doorway                                     */
    /*                                                                   */
    /*  Desh's parting line is the whole of Part 6's second half. It is  */
    /*  only spoken to a man who didn't swing.                           */
    /* ================================================================= */
    {
      id: "nw2_p4b_door",
      partBreak: "Act Three, Part 4b — The Blue Cue, Again",
      title: "Six Hundred Got Us The House",
      background: "/img/nw2/bg-poolhall.jpg",
      ambientAudio: "tension",
      musicMode: "none",
      transition: "fade",
      transitionSpeed: 0.9,
      cinematic: {
        mode: "static",
        dimAmount: 0.3,
        lights: [
          { x: 26, y: 34, color: "#ff2e88", intensity: 0.22, size: 26, pulseSeconds: 3.4, pulseAmount: 0.7 },
        ],
      },
      prose: "",
      dialogueBeats: [
        {
          id: "nw2_p4bd_t0",
          characterId: "jack",
          expression: "V.O.",
          conditionRule: { requiresFlags: ["nw2_took_money"] },
          text:
            "I folded it and put it in my coat, and Moe went back to his drink, and that was the whole transaction. No handshake. Nobody said a word about what it meant. I told myself it was owed wages. It was owed wages. That's what made it work.",
        },
        {
          id: "nw2_p4bd_m0",
          characterId: "moe",
          expression: "honest, after taking it",
          conditionRule: { requiresFlags: ["nw2_asked_moe"] },
          text: "Yeah. But I'd feel bad about it.",
        },
        {
          id: "nw2_p4bd_j0",
          characterId: "jack",
          expression: "V.O., very quiet",
          conditionRule: { requiresFlags: ["nw2_asked_moe"] },
          text:
            "And there it was. The whole town in one sentence. Everybody's willing, nobody's cruel, and the arithmetic gets done anyway.",
        },
        {
          id: "nw2_p4bd_j0s",
          characterId: "jack",
          expression: "V.O.",
          conditionRule: { requiresFlags: ["nw2_swung"] },
          text:
            "I got one in. It was a bad one and it landed badly and Moe took it the way you'd take weather. Then he put me on the floor without any particular enthusiasm and helped me up afterward, and that was somehow the whole of it.",
        },
        {
          id: "nw2_p4bd_m1s",
          characterId: "moe",
          expression: "no anger in it at all",
          conditionRule: { requiresFlags: ["nw2_swung"] },
          text: "Alright. You got that out. Go home, Mr. Morrow.",
        },
        {
          id: "nw2_p4bd_j1s",
          characterId: "jack",
          expression: "V.O.",
          conditionRule: { requiresFlags: ["nw2_swung"] },
          text:
            "Desh had his mouth open to say something as I went past. He looked at me, and then he looked at the floor, and he shut it again. I've wondered about that since. Whatever it was, I'd made it into a thing you don't say to a man like that.",
        },
        {
          id: "nw2_p4bd_d1",
          characterId: "desh",
          expression: "calling after him, and he means it",
          conditionRule: { requiresFlags: ["nw2_desh_told_me"] },
          text:
            "Hey — Morrow. For what it's worth. He didn't give her up. They asked him where she was and he wouldn't say.",
        },
        {
          id: "nw2_p4bd_d2",
          characterId: "desh",
          conditionRule: { requiresFlags: ["nw2_desh_told_me"] },
          text: "Six hundred bucks got us the house. Nothing got us her.",
        },
        {
          id: "nw2_p4bd_j2",
          characterId: "jack",
          expression: "V.O., spare, breaking",
          conditionRule: { requiresFlags: ["nw2_desh_told_me"] },
          text:
            "Two hundred and eleven thousand dollars in a bag and eleven hours where she could have called him, and at the end of it he still wouldn't say her name. I've thought about which one of us that makes the fool. I keep getting the same answer and I keep not liking it.",
        },
        {
          id: "nw2_p4bd_m2",
          characterId: "moe",
          expression: "last line, to Desh, as the door closes — casual, back to it",
          text: "It plays a recording, Desh. That's all it is. It's a recording.",
        },
        {
          id: "nw2_p4bd_j3",
          characterId: "jack",
          expression: "V.O.",
          text:
            "Thursday morning I went up a staircase over a feed store that had never once been swept. One day left on her.",
        },
      ],
      choices: [
        {
          id: "nw2_p4bd_go",
          text: "Go and see Solomon Reyes.",
          targetSceneId: "nw2_p5_office",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },


    /* ================================================================= */
    /*  ACT THREE, PART 5 — THE TRADE                                    */
    /*                                                                   */
    /*  Solomon's office over the feed store. Jack has exactly one       */
    /*  asset: ten years of never having taken anything. He spends it.   */
    /* ================================================================= */
    {
      id: "nw2_p5_office",
      partBreak: "Act Three, Part 5 — The Trade",
      title: "Act Three, Part 5 — The Trade",
      background: "/img/nw2/bg-solomon-office.jpg",
      ambientAudio: "drone",
      musicMode: "none",
      transition: "fade",
      transitionSpeed: 1.0,
      cinematic: {
        mode: "dolly",
        focalPoint: "48% 52%",
        zoomDuration: 30,
        dollyDistance: 4,
        dimAmount: 0.24,
        lights: [
          { x: 68, y: 30, color: "#ffb761", intensity: 0.26, size: 32, pulseSeconds: 7.0, pulseAmount: 0.3 },
          { x: 18, y: 44, color: "#2ad9d9", intensity: 0.12, size: 38, pulseSeconds: 8.0, pulseAmount: 0.4 },
        ],
      },
      prose:
        "Solomon Reyes ran the money in this town out of two rooms over a feed store, up a staircase that had never once been swept. I'd expected worse. That was the thing about Solomon — you kept expecting worse and it kept not arriving, and that was how he got you.\n\nA space heater. A filing cabinet with a coffee ring on it. A man in a cardigan who looked like he'd retired from teaching eighth-grade civics.",
      dialogueBeats: [
        {
          id: "nw2_p5_s1",
          characterId: "solomon",
          expression: "not getting up",
          text: "Mr. Morrow. Eleven years and you've never come up these stairs. I'd started to take it personally.",
        },
        {
          id: "nw2_p5_j0b",
          characterId: "jack",
          expression: "V.O., flat",
          text:
            "Moe and Desh by the door. Not sitting. That's the difference between a conversation and a room somebody's controlling the exits on.",
        },
        {
          id: "nw2_p5_s1b",
          characterId: "solomon",
          expression: "unhurried, pleasant",
          text:
            "I heard you were standing there. I'm sorry about that — the standing there part. It wasn't an instruction.",
        },
        {
          id: "nw2_p5_j0c",
          characterId: "jack",
          expression: "flat",
          text: "Wasn't it.",
        },
        {
          id: "nw2_p5_s1c",
          characterId: "solomon",
          expression: "mild",
          text: "It was a permission. There's a difference. It matters to me even if it doesn't to you.",
        },
        {
          id: "nw2_p5_j1",
          characterId: "jack",
          text: "I'm here about the Voss paper.",
        },
        {
          id: "nw2_p5_s2",
          characterId: "solomon",
          expression: "opening a drawer without hurrying",
          text: "Two hundred and eleven thousand. Plus the father's eleven. Two twenty-two, and the father's is the older of the two by some distance.",
        },
        {
          id: "nw2_p5_j2",
          characterId: "jack",
          expression: "flat",
          text: "Eleven thousand. On a four-thousand-dollar furnace loan you wrote in November of 2011.",
        },
        {
          id: "nw2_p5_s3",
          characterId: "solomon",
          expression: "agreeing, mildly",
          text: "November. He came up here in a coat with no lining and asked me for four thousand dollars so his daughter wouldn't be cold. I gave it to him in cash and I didn't ask him for anything he couldn't give.",
        },
        {
          id: "nw2_p5_s4",
          characterId: "solomon",
          text: "You want to know the truth of it, Mr. Morrow? I have never once had to ask. That's the whole business. People arrive at the number by themselves.",
        },
        {
          id: "nw2_p5_j3",
          characterId: "jack",
          expression: "still standing",
          text: "Close it. Both of them. The father's and the husband's.",
        },
        {
          id: "nw2_p5_s5",
          characterId: "solomon",
          expression: "the first flicker of interest in eleven years",
          text: "With what.",
        },
        {
          id: "nw2_p5_j4",
          characterId: "jack",
          expression: "V.O.",
          conditionRule: { requiresFlags: ["nw2_offered_loyalty"] },
          text:
            "Here's what I had. In 2015 a man in a good coat asked me twice to lose a file with Solomon's name in it, and twice I said no, and I sat at an empty desk for eleven months afterward and called it having principles. It was never principles. It was inventory. I'd been keeping it clean for ten years without ever once knowing what I was saving it for.",
        },
        {
          id: "nw2_p5_j5",
          characterId: "jack",
          conditionRule: { requiresFlags: ["nw2_offered_loyalty"] },
          text: "Put it on me.",
        },
        {
          id: "nw2_p5_s6",
          characterId: "solomon",
          expression: "very still",
          conditionRule: { requiresFlags: ["nw2_offered_loyalty"] },
          text: "You understand what you're offering.",
        },
        {
          id: "nw2_p5_j6",
          characterId: "jack",
          conditionRule: { requiresFlags: ["nw2_offered_loyalty"] },
          text: "I'm offering the only thing in this town you've never been able to buy. Ten years, Solomon. Nobody's ever been able to say you had me. After today they can.",
        },
        {
          id: "nw2_p5_s7",
          characterId: "solomon",
          expression: "quiet, and this is the part that stays with you",
          conditionRule: { requiresFlags: ["nw2_offered_loyalty"] },
          text:
            "In 2017 a man named Kessler stood where you're standing and offered me the identical thing. His own back for his daughter's. I turned him down. I want you to know I turned him down, because I don't want you thinking I've enjoyed any of this.",
        },
        {
          id: "nw2_p5_s8",
          characterId: "solomon",
          expression: "picking up a pen",
          conditionRule: { requiresFlags: ["nw2_offered_loyalty"] },
          text: "I've thought about you for ten years, Mr. Morrow. Every man in Blackwood has a number. I could never find yours. It turns out it just wasn't for sale to me — it was for sale to her.",
        },
        {
          id: "nw2_p5_s9",
          characterId: "solomon",
          expression: "sliding the paper across",
          conditionRule: { requiresFlags: ["nw2_offered_loyalty"] },
          text: "The Kessler debt is closed. The Voss debt is closed. Welcome upstairs.",
        },
        {
          id: "nw2_p5_s10",
          characterId: "solomon",
          expression: "closing the drawer",
          conditionRule: { excludesFlags: ["nw2_never_took"] },
          text:
            "With what, Mr. Morrow? You took four hundred dollars off me in the second week of this and you've been mine since the moment you folded it into your pocket. You can't sell me a thing I already own.",
        },
        {
          id: "nw2_p5_j7",
          characterId: "jack",
          expression: "V.O.",
          conditionRule: { excludesFlags: ["nw2_never_took"] },
          text:
            "He was right, and he wasn't even unkind about it. That was the worst of it. I'd spent the only thing I had in a diner in the second week, on rent, in the rain, and I hadn't even noticed it going.",
        },
        /* --- VERSION 2: the licence, not the loyalty ------------------ */
        {
          id: "nw2_p5_v2_s1",
          characterId: "solomon",
          expression: "genuinely interested",
          conditionRule: { requiresFlags: ["nw2_offered_licence"] },
          text: "Say more.",
        },
        {
          id: "nw2_p5_v2_j1",
          characterId: "jack",
          expression: "flat",
          conditionRule: { requiresFlags: ["nw2_offered_licence"] },
          text:
            "Sixteen years of files. Every cop I still know in three counties. Every person in Blackwood who talks to me because I don't talk to you. Licence in a drawer, files to you. Next time somebody here needs somebody who isn't yours — there isn't one.",
        },
        {
          id: "nw2_p5_v2_s2",
          characterId: "solomon",
          expression: "standing, slow footsteps to the window",
          conditionRule: { requiresFlags: ["nw2_offered_licence"] },
          text:
            "You understand what you're describing. There's no version of Blackwood after this where you're a man anybody comes to. You'd be here. Just — not that.",
        },
        {
          id: "nw2_p5_v2_s3",
          characterId: "solomon",
          expression: "turning, curious",
          conditionRule: { requiresFlags: ["nw2_offered_licence"] },
          text:
            "2015. There was a file with my name in it and a young detective asked twice to lose it. Do you know what I thought when I heard he wouldn't? I thought: there's a man who's found the one thing he won't sell. Everybody's got a number. Most men never find out what theirs is because nobody offers it. You found out at thirty-four.",
        },
        {
          id: "nw2_p5_v2_s4",
          characterId: "solomon",
          expression: "quiet",
          conditionRule: { requiresFlags: ["nw2_offered_licence"] },
          text: "And now you've walked up my stairs to sell it to me for a woman whose father I said no to.",
        },
        {
          id: "nw2_p5_v2_s5",
          characterId: "solomon",
          expression: "almost gently",
          conditionRule: { requiresFlags: ["nw2_offered_licence"] },
          text: "Say it once more before I take it. Not for me. It won't be worth anything to you afterward if you got it cheap.",
        },
        {
          id: "nw2_p5_v2_j2",
          characterId: "jack",
          expression: "flat, complete",
          conditionRule: { requiresFlags: ["nw2_offered_licence"] },
          text:
            "I spent sixteen years and everything after them proving I wouldn't hand you anything. I'm handing you all of it. Take it and say her name.",
        },
        {
          id: "nw2_p5_v2_s6",
          characterId: "solomon",
          expression: "turning back, closest he comes to feeling",
          conditionRule: { requiresFlags: ["nw2_offered_licence"] },
          text:
            "Her father sat in that chair. 2011. Four thousand, for a furnace, in November. I gave it to him at a rate I knew he couldn't clear. That's the business. He knew it too. Took it anyway. It was November.",
        },
        {
          id: "nw2_p5_v2_s7",
          characterId: "solomon",
          expression: "sitting back down, unreadable",
          conditionRule: { requiresFlags: ["nw2_offered_licence"] },
          text:
            "Now I'm older, and there's a man dead in a yard because I gave permission for it, and I find I don't like the arithmetic as much as I used to. Take the deal off the table before I remember I'm a businessman.",
        },
        {
          id: "nw2_p5_v2_j3",
          characterId: "jack",
          expression: "not moving",
          conditionRule: { requiresFlags: ["nw2_offered_licence"] },
          text: "Say it. Her name, clear. Out loud.",
        },
        {
          id: "nw2_p5_v2_s8",
          characterId: "solomon",
          expression: "flat, formal",
          conditionRule: { requiresFlags: ["nw2_offered_licence"] },
          text:
            "Vera Voss owes me nothing. The Kessler debt is closed. I'll say it to the two men I told, and it'll be around town by noon, which is what you actually came for.",
        },
        {
          id: "nw2_p5_v2_s9",
          characterId: "solomon",
          expression: "not unkind — and this is the line that seeds the ending",
          conditionRule: { requiresFlags: ["nw2_offered_licence"] },
          text:
            "Mr. Morrow. One thing, since we're unlikely to do this again. You've bought her the ability to leave. I'd want to be sure that's the same thing as her leaving. In my experience it very rarely is.",
        },
        {
          id: "nw2_p5_v2_s10",
          characterId: "solomon",
          expression: "quietly",
          conditionRule: { requiresFlags: ["nw2_offered_licence"] },
          text:
            "People here don't leave when you hand them the door. They stay and they find something new to owe. It's the only shape they know. I'd think about that before tonight.",
        },
        {
          id: "nw2_p5_v2_j4",
          characterId: "jack",
          expression: "V.O.",
          conditionRule: { requiresFlags: ["nw2_offered_licence"] },
          text:
            "I put sixteen years on a desk in a room over a feed store and walked down the stairs. Eleven months at an empty desk because I wouldn't lose one file. Ten years of nothing after, because I wouldn't. That was the whole thing I was. The only asset I ever had, and I'd carried it so long I'd started mistaking it for a personality.",
        },
        {
          id: "nw2_p5_v2_j5",
          characterId: "jack",
          expression: "V.O., very quiet",
          conditionRule: { requiresFlags: ["nw2_offered_licence"] },
          text: "It didn't feel like losing. It felt like paying. Those are different and only one of them is a tragedy.",
        },
        {
          id: "nw2_p5_v2_j6",
          characterId: "jack",
          expression: "V.O., flat",
          conditionRule: { requiresFlags: ["nw2_offered_licence"] },
          text: "What I didn't do — and I've been honest about the rest of it — is ask her first.",
        },
      ],
      choices: [
        /* THE PRICE. Two ways to buy the same debt, and they are not the same
           purchase. Loyalty makes Jack Solomon's man and keeps him a detective;
           the licence ends the detective and leaves him free of Solomon. The
           endings diverge accordingly. Both are in-place replies so the room
           plays on rather than cutting. */
        {
          id: "nw2_p5_offer_loyalty",
          text: "\"Put it on me.\" Sell him the one thing he could never buy.",
          targetSceneId: "",
          reply: true,
          hidden: true,
          attitudeTag: "Clever",
          exclusiveGroup: "nw2_p5_price",
          gating: { requiresFlags: ["nw2_never_took"] },
          consequences: { setFlags: ["nw2_offered_loyalty"] },
        },
        {
          id: "nw2_p5_offer_licence",
          text: "\"Nothing. That's not what I'm paying with.\" Offer the licence and the files.",
          targetSceneId: "",
          reply: true,
          hidden: true,
          attitudeTag: "Neutral",
          exclusiveGroup: "nw2_p5_price",
          gating: { requiresFlags: ["nw2_never_took"] },
          consequences: { setFlags: ["nw2_offered_licence"] },
        },
        {
          id: "nw2_p5_sign",
          text: "Sign it.",
          targetSceneId: "nw2_p6_booth",
          attitudeTag: "Clever",
          hidden: true,
          gating: { requiresFlags: ["nw2_offered_loyalty"] },
          consequences: { setFlags: ["nw2_signed", "nw2_debt_closed"] },
          memoryLog: "nw2_price",
          rememberLine: "Two twenty-two, and my name at the bottom of it.",
        },
        {
          id: "nw2_p5_surrender",
          text: "Set the case on the desk. Walk down the stairs.",
          targetSceneId: "nw2_p6_booth",
          attitudeTag: "Neutral",
          hidden: true,
          gating: { requiresFlags: ["nw2_offered_licence"] },
          consequences: {
            setFlags: ["nw2_gave_licence", "nw2_debt_closed", "nw2_solomon_warned"],
          },
          memoryLog: "nw2_price",
          rememberLine: "Sixteen years, on a desk over a feed store.",
        },
        {
          id: "nw2_p5_leave",
          text: "Go down the stairs with nothing.",
          targetSceneId: "nw2_end_bought",
          attitudeTag: "Neutral",
          gating: { excludesFlags: ["nw2_never_took"] },
        },
      ],
      hotspots: [],
    },

    /* ================================================================= */
    /*  ACT THREE, PART 6 — NOBODY'S WITNESS                             */
    /*                                                                   */
    /*  The last withheld thing. Jack has been sitting on Desh's account */
    /*  for two days. This is the scene where he either says it or       */
    /*  doesn't, and it is the only real choice left in the film.        */
    /* ================================================================= */
    {
      id: "nw2_p6_booth",
      title: "Act Three, Part 6 — Nobody's Witness",
      background: "/img/nw2/bg-vera-booth.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "none",
      transition: "fade",
      transitionSpeed: 1.0,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "46% 50%",
        zoomDuration: 34,
        dimAmount: 0.22,
        lights: [
          { x: 26, y: 26, color: "#ff2e88", intensity: 0.24, size: 32, pulseSeconds: 4.2, pulseAmount: 0.8 },
          { x: 74, y: 34, color: "#2ad9d9", intensity: 0.16, size: 36, pulseSeconds: 5.4, pulseAmount: 0.6 },
        ],
      },
      prose:
        "Same booth. Same rain doing the same thing to the same window. She'd ordered coffee for both of us and hadn't touched hers, and I understood that the coffee was there so her hands would have somewhere to be.",
      dialogueBeats: [
        {
          id: "nw2_p6_v1",
          characterId: "vera",
          text: "They told me at the courthouse it was closed. Both of them. Mine and my father's.",
        },
        {
          id: "nw2_p6_j1",
          characterId: "jack",
          text: "That's right.",
        },
        {
          id: "nw2_p6_v2",
          characterId: "vera",
          expression: "not looking up",
          text: "I'm not going to ask you what it cost, because you'd tell me, and then I'd have to carry it.",
        },
        {
          id: "nw2_p6_v3",
          characterId: "vera",
          expression: "and here it comes",
          text:
            "I have to say a thing. That night — three in the morning, in your office, before the phone went. I was going to tell you all of it. I had it in my mouth. And then the phone rang, and I had about four seconds to decide, and I decided wrong.",
        },
        {
          id: "nw2_p6_j2",
          characterId: "jack",
          expression: "V.O.",
          text:
            "Four seconds. That's what she'd been carrying for eleven weeks. Four seconds for her, and four seconds for me, the same night, over a question I never got around to answering.",
        },
        {
          id: "nw2_p6_j3",
          characterId: "jack",
          expression: "V.O.",
          conditionRule: { requiresFlags: ["nw2_desh_told_me"] },
          text:
            "And I had a thing in my mouth too, and I'd had it for two days. Desh told it to me in a parking lot with the engine running, and I'd been turning it over ever since trying to work out who it belonged to. It didn't belong to me. That was the answer. It had never belonged to me.",
        },
      ],
      choices: [
        {
          id: "nw2_p6_tell",
          text: "\"They asked him where you were.\"",
          targetSceneId: "nw2_p6_told",
          attitudeTag: "Sultry",
          gating: { requiresFlags: ["nw2_desh_told_me"] },
          consequences: { setFlags: ["nw2_told_her_everything"] },
          memoryLog: "nw2_told_her",
          rememberLine: "Vera will remember that.",
        },
        {
          id: "nw2_p6_withhold",
          text: "Let her keep the version she's got.",
          targetSceneId: "nw2_end_kept",
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["nw2_desh_told_me"], excludesFlags: ["nw2_gave_licence"] },
        },
        {
          id: "nw2_p6_nothing",
          text: "Say the only true thing you've got: nothing.",
          targetSceneId: "nw2_end_nothing",
          attitudeTag: "Neutral",
          gating: { excludesFlags: ["nw2_desh_told_me", "nw2_gave_licence"] },
        },
        /* On the licence path she has nowhere to go, so every route runs into
           the bag rather than out of town. Withholding still costs her the
           truth — it just doesn't cost her the booth. */
        {
          id: "nw2_p6_withhold_v2",
          text: "Let her keep the version she's got.",
          targetSceneId: "nw2_p6_bag",
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["nw2_desh_told_me", "nw2_gave_licence"] },
          consequences: { setFlags: ["nw2_kept_it_from_her"] },
        },
        {
          id: "nw2_p6_nothing_v2",
          text: "Say the only true thing you've got: nothing.",
          targetSceneId: "nw2_p6_bag",
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["nw2_gave_licence"], excludesFlags: ["nw2_desh_told_me"] },
        },
      ],
      hotspots: [],
    },

    /* ================================================================= */
    /*  PART 6, CONT. — he says it                                       */
    /* ================================================================= */
    {
      id: "nw2_p6_told",
      title: "Six Hundred For One, Nothing For The Other",
      background: "/img/nw2/bg-vera-booth.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "none",
      transition: "fade",
      transitionSpeed: 1.0,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "46% 50%",
        zoomDuration: 30,
        dimAmount: 0.24,
        lights: [
          { x: 26, y: 26, color: "#ff2e88", intensity: 0.24, size: 32, pulseSeconds: 4.2, pulseAmount: 0.8 },
        ],
      },
      prose: "",
      dialogueBeats: [
        {
          id: "nw2_p6t_j1",
          characterId: "jack",
          text: "Your father gave them David for six hundred dollars. I'm not going to pretty that up for you.",
        },
        {
          id: "nw2_p6t_v1",
          characterId: "vera",
          expression: "nodding at the tabletop like she'd known it from the beginning, and maybe she had",
          text: "I know. I've known since the funeral. Nobody had to tell me.",
        },
        {
          id: "nw2_p6t_j2",
          characterId: "jack",
          text: "Then they asked him where you were.",
        },
        {
          id: "nw2_p6t_v2",
          characterId: "vera",
          expression: "looking up for the first time",
          text: "...What?",
        },
        {
          id: "nw2_p6t_j3",
          characterId: "jack",
          text:
            "Desh was standing right there. They asked him where you were, Vera, and he said no. They went at him about it a while and he kept saying no. They didn't get you. He didn't take a dollar for it.",
        },
        {
          id: "nw2_p6t_j4",
          characterId: "jack",
          text:
            "Six hundred for David. Nothing for you. He sold the one and he wouldn't sell the other, and I've been sitting on that for two days trying to work out whether it makes him better or worse.",
        },
        {
          id: "nw2_p6t_v3",
          characterId: "vera",
          expression: "after a long time, very level",
          text: "It doesn't make him anything. It just makes him mine.",
        },
        {
          id: "nw2_p6t_j5",
          characterId: "jack",
          expression: "V.O.",
          recalls: {
            nw2_told_her:
              "She put her coat on. She'd been in the coat too good for this room the first night too, and it hadn't got any worse and neither had she.",
          },
          text: "She put her coat on.",
        },
      ],
      choices: [
        {
          id: "nw2_p6t_go",
          text: "Let her go first.",
          targetSceneId: "nw2_final_street",
          attitudeTag: "Neutral",
          gating: { excludesFlags: ["nw2_gave_licence"] },
        },
        {
          id: "nw2_p6t_bag",
          text: "Watch the bag.",
          targetSceneId: "nw2_p6_bag",
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["nw2_gave_licence"] },
        },
      ],
      hotspots: [],
    },

    /* ================================================================= */
    /*  VERSION 2 — PART 6, CONT.: THE BAG                               */
    /*                                                                   */
    /*  Only reachable when Jack paid with the licence. Solomon warned    */
    /*  him on the stairs: you've bought her the ability to leave, which  */
    /*  is not the same as her leaving. This is that warning coming true. */
    /*  The player cannot stop it and is not offered the chance to — the  */
    /*  only choice is whether Jack asks her to stay, and he already      */
    /*  forfeited that right by not asking her first.                     */
    /* ================================================================= */
    {
      id: "nw2_p6_bag",
      title: "Eleven Forty-Nine",
      background: "/img/nw2/bg-vera-booth.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "track",
      musicUrl: "/nobodys-witness.mp3",
      transition: "fade",
      transitionSpeed: 1.2,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "44% 52%",
        zoomDuration: 44,
        dimAmount: 0.26,
        lights: [
          { x: 26, y: 26, color: "#ff2e88", intensity: 0.2, size: 32, pulseSeconds: 4.6, pulseAmount: 0.7 },
          { x: 72, y: 36, color: "#2ad9d9", intensity: 0.14, size: 36, pulseSeconds: 6.0, pulseAmount: 0.5 },
        ],
      },
      prose:
        "She'd had a bag with her all night. Not a big one. It went onto the vinyl beside her rather than the floor — close enough to pick up fast. We both noticed it. Neither of us said anything about it.",
      dialogueBeats: [
        {
          id: "nw2_p6b_v1",
          characterId: "vera",
          expression: "standing, steady, and she means every word",
          text: "I'm going to go.",
        },
        {
          id: "nw2_p6b_j1",
          characterId: "jack",
          expression: "not moving",
          text: "Okay.",
        },
        {
          id: "nw2_p6b_v2",
          characterId: "vera",
          expression: "flat, the speech she's been building since the lot",
          text:
            "He bought me nine hours with everything he had. You bought me the rest of my life. I'm not letting a third person do it. I'm not going to stand next to you until the arithmetic gets to you too.",
        },
        {
          id: "nw2_p6b_v3",
          characterId: "vera",
          expression: "sharper, because he isn't fighting her",
          text: "Don't do that. Say something.",
        },
      ],
      choices: [
        {
          id: "nw2_p6b_bus",
          text: "\"There's a bus at six.\"",
          targetSceneId: "nw2_p6_stay",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["nw2_didnt_ask"] },
          memoryLog: "nw2_bus",
          rememberLine: "Vera will remember that.",
        },
        {
          id: "nw2_p6b_ask",
          text: "Ask her to stay.",
          targetSceneId: "nw2_p6_stay",
          attitudeTag: "Sultry",
          consequences: { setFlags: ["nw2_asked_her_to_stay"] },
          memoryLog: "nw2_bus",
          rememberLine: "Vera will remember that.",
        },
      ],
      hotspots: [],
    },

    /* ================================================================= */
    /*  VERSION 2 — THE TWO MINUTES                                      */
    /* ================================================================= */
    {
      id: "nw2_p6_stay",
      title: "Eleven Fifty-One",
      background: "/img/nw2/bg-vera-booth.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "track",
      musicUrl: "/nobodys-witness.mp3",
      transition: "fade",
      transitionSpeed: 1.0,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "44% 52%",
        zoomDuration: 40,
        dimAmount: 0.28,
        lights: [
          { x: 26, y: 26, color: "#ff2e88", intensity: 0.18, size: 32, pulseSeconds: 5.0, pulseAmount: 0.6 },
        ],
      },
      prose: "",
      dialogueBeats: [
        {
          id: "nw2_p6s_j0",
          characterId: "jack",
          expression: "flat — and this is the cruelest thing he does in the film, and he does it by being honest",
          conditionRule: { requiresFlags: ["nw2_didnt_ask"] },
          text:
            "There's a bus at six. There won't be another one till Tuesday. I'm not going to stop you and I'm not going to ask you to stay. I asked you for something once already and I didn't have the right.",
        },
        {
          id: "nw2_p6s_j0b",
          characterId: "jack",
          expression: "quiet",
          conditionRule: { requiresFlags: ["nw2_asked_her_to_stay"] },
          text: "Stay.",
        },
        {
          id: "nw2_p6s_v0b",
          characterId: "vera",
          expression: "and it lands wrong, and they both hear it land wrong",
          conditionRule: { requiresFlags: ["nw2_asked_her_to_stay"] },
          text:
            "That's the second thing you've decided for me today. You don't get to buy the door and then stand in it.",
        },
        {
          id: "nw2_p6s_j1",
          characterId: "jack",
          expression: "V.O., very quiet",
          text:
            "Eleven forty-nine. I know because I looked. She stood there for two minutes with a bag in her hand and I watched a person try to be better than this town and find out she's from here.",
        },
        {
          id: "nw2_p6s_v1",
          characterId: "vera",
          expression: "not moving, smaller, no longer performing conviction",
          text: "I don't have anywhere to go.",
        },
        {
          id: "nw2_p6s_j2",
          characterId: "jack",
          expression: "quiet",
          text: "I know.",
        },
        {
          id: "nw2_p6s_v2",
          characterId: "vera",
          expression: "breaking, quietly",
          text:
            "That's not — I mean I have money. I have two hundred and eleven thousand dollars and a bus at six and I don't have anywhere to go, Jack. There isn't a place. I've been doing arithmetic since I was nineteen and I never once did it on what happens after.",
        },
        {
          id: "nw2_p6s_v3",
          characterId: "vera",
          expression: "very quiet",
          text: "I thought there'd be a place.",
        },
        {
          id: "nw2_p6s_j3",
          characterId: "jack",
          expression: "V.O., spare, flat, no relief in it at all",
          text:
            "That's the sound. If you want to know the exact moment — that's it. A bag going back down on a vinyl seat at eleven fifty-one at night. Not dropped. Placed.",
        },
        {
          id: "nw2_p6s_v4",
          characterId: "vera",
          expression: "eventually, not looking up",
          text: "I should go.",
        },
        {
          id: "nw2_p6s_j4",
          characterId: "jack",
          expression: "flat",
          text: "Yeah.",
        },
        {
          id: "nw2_p6s_v5",
          characterId: "vera",
          expression: "quiet",
          text: "I'm not going to.",
        },
        {
          id: "nw2_p6s_j5",
          characterId: "jack",
          expression: "quiet",
          text: "I know.",
        },
      ],
      choices: [
        {
          id: "nw2_p6s_go",
          text: "Let the long part start.",
          targetSceneId: "nw2_end_stayed",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ================================================================= */
    /*  VERSION 2 ENDING — THE LONG PART                                 */
    /*                                                                   */
    /*  The town's own logic applied to a marriage: you don't pay a debt  */
    /*  off here, you pay on it, forever, and you hand it to whoever's    */
    /*  left. They stay. They become the thing they're both paying on.    */
    /* ================================================================= */
    {
      id: "nw2_end_stayed",
      title: "Nobody's Witness",
      background: "/img/nw2/bg-booth-cold.jpg",
      ambientAudio: "rain",
      musicMode: "track",
      musicUrl: "/nobodys-witness.mp3",
      transition: "fade-black",
      transitionSpeed: 1.8,
      letterbox: true,
      cinematic: {
        mode: "static",
        dimAmount: 0.2,
        lights: [
          { x: 30, y: 30, color: "#2ad9d9", intensity: 0.1, size: 40, pulseSeconds: 9.0, pulseAmount: 0.3 },
        ],
      },
      prose:
        "That's the whole ending. Nobody drove off. Nobody said anything that would look good in a letter. A woman put a bag down and sat back down in a booth, and the two of us started the long part.\n\nI've thought a lot about what I bought off Solomon that morning. I thought I was buying her a door. He knew better. He told me on the stairs and I didn't listen, because listening would have meant knowing what I actually wanted — which was for her to have the door and not use it.\n\nI got exactly that. Every part of it. Whatever else I've lost, I want to be clear that I got what I wanted.\n\nPeople think the hard part is losing them. The hard part is the part after, where you got what you wanted and it's sitting across the table looking at you, and neither of you can think of the thing to say that makes a man in a yard four hours north any less dead.\n\nHe tipped a motel clerk. Nine days out, two hundred grand in a bag, sleeping in his shoes — and he tipped a motel clerk. I still can't put it down. Neither can she. That's most of what we've got in common now, and it's more than some people have.",
      dialogueBeats: [
        {
          id: "nw2_es_j0",
          characterId: "jack",
          expression: "V.O., flat",
          conditionRule: { requiresFlags: ["nw2_kept_it_from_her"] },
          text:
            "And I never told her what Desh said. Not that night, not after. It sat in me across a thousand cold coffees. She thinks her father sold all of her for six hundred dollars, and the true version is in a drawer with everything else I kept.",
        },
        {
          id: "nw2_es_v1",
          characterId: "vera",
          expression: "quiet, out of nowhere, the first thing either of them has said in a long time",
          text: "Doors.",
        },
        {
          id: "nw2_es_j1",
          characterId: "jack",
          expression: "low",
          text: "What?",
        },
        {
          id: "nw2_es_v2",
          characterId: "vera",
          expression: "not looking up",
          text: "He used to say a shut door is just a wall that's lying about it.",
        },
        {
          id: "nw2_es_v3",
          characterId: "vera",
          expression: "barely",
          text: "I remembered it. Three weeks. I've been trying to remember it for three weeks.",
        },
        {
          id: "nw2_es_j2",
          characterId: "jack",
          expression: "V.O., very quiet — and this really is the last line",
          background: "/img/nw2/bg-final-street-two.jpg",
          backgroundTransition: "fade",
          backgroundTransitionSpeed: 2.0,
          text:
            "She got it back. That's the one thing that came back. Eleven fifty-one on a Friday, a woman put a bag down and a sentence took three weeks to finish, and in this town that's about as close to a happy ending as anybody's ever come.",
        },
      ],
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "NOBODY'S WITNESS — THE LONG PART",
        recap:
          "You put sixteen years on a desk over a feed store and bought Vera Voss a door she didn't walk through. She had the money, the bus and the whole rest of her life, and no place to go — because nobody here ever does the arithmetic on what happens after. So she put the bag down. You don't pay a debt off in Blackwood. You pay on it, forever, and you hand it to whoever's left. She finished David's sentence about doors, three weeks late, and that's the one thing that came back.",
        endsSeason: true,
      },
      choices: [],
      hotspots: [],
    },

    /* ================================================================= */
    /*  THE LAST FRAME — the signature shot with the car gone            */
    /* ================================================================= */
    {
      id: "nw2_final_street",
      title: "Nobody's Witness",
      background: "/img/nw2/bg-final-street.jpg",
      ambientAudio: "rain",
      musicMode: "track",
      musicUrl: "/nobodys-witness.mp3",
      transition: "fade-black",
      transitionSpeed: 1.6,
      letterbox: true,
      // The signature shot, framed exactly as the opener. The car is gone.
      cinematic: {
        mode: "pan",
        focalPoint: "42% 52%",
        panDistance: 3,
        panDirection: "right",
        zoomDuration: 26,
        dimAmount: 0.06,
        lights: [
          { x: 58, y: 26, color: "#ff2e88", intensity: 0.22, size: 38, pulseSeconds: 4.4, pulseAmount: 0.8 },
          { x: 22, y: 40, color: "#2ad9d9", intensity: 0.2, size: 44, pulseSeconds: 5.6, pulseAmount: 0.7 },
        ],
      },
      prose:
        "She left first. I sat in the booth a while after, across from an impression in the red vinyl and a cup of coffee nobody drank.\n\nThen Main Street, the way it was the first night and the way it'll be after. Half the signs dead, the rest smearing teal and magenta down the wet. Same frame. Same rain.\n\nNo car in it. I work for Solomon Reyes now, and men who work for Solomon Reyes don't park on Main.\n\nThere was nobody there to see her go and nobody there to see me stay. That's the job. You stand in the one place nobody's looking and you hold the thing nobody else can carry, and when it's done there's no record of it anywhere except in you.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "NOBODY'S WITNESS",
        recap:
          "You spent ten years of not being for sale on a woman who never asked you to. Vera Voss is out from under both debts and gone. Solomon Reyes finally has your number. And she knows what her father wouldn't sell — which is the only thing you had left to give her, and the only one that cost you nothing.",
        endsSeason: true,
      },
      choices: [],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ================================================================= */
    /*  ENDING — told her nothing                                        */
    /* ================================================================= */
    {
      id: "nw2_end_kept",
      title: "The Version She's Got",
      background: "/img/nw2/bg-empty-booth.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.4,
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 54%",
        zoomDuration: 22,
        dimAmount: 0.3,
        lights: [
          { x: 30, y: 28, color: "#ff2e88", intensity: 0.2, size: 30, pulseSeconds: 4.0, pulseAmount: 0.7 },
        ],
      },
      prose:
        "I let it go by. She talked a while longer about nothing much, and then she put her coat on and thanked me in a way that had a door in it, and the bell went.\n\nAn impression in the red vinyl. A cup of coffee nobody drank.\n\nShe'll go the rest of her life believing her father sold her, all of her, for six hundred dollars — because I decided in a booth that she couldn't hold the true version, which was not a decision I had any business making. Desh gave it to me to pass on. I kept it. I've got a drawer full of things I kept.",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "NOBODY'S WITNESS — AND NOBODY TOLD HER",
        recap:
          "The debts are closed and Vera Voss is free, and you paid for it with everything you had. But you sat on the last true thing in the case because you'd decided she was too breakable to hold it. She wasn't. She never was. You're the only one who knows what her father wouldn't sell, and now you're the only one who ever will.",
        endsSeason: true,
      },
      choices: [],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ================================================================= */
    /*  ENDING — never earned the account, so there was nothing to give  */
    /* ================================================================= */
    {
      id: "nw2_end_nothing",
      title: "Nothing To Tell",
      background: "/img/nw2/bg-empty-booth.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.4,
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 54%",
        zoomDuration: 22,
        dimAmount: 0.3,
        lights: [
          { x: 30, y: 28, color: "#2ad9d9", intensity: 0.18, size: 32, pulseSeconds: 5.2, pulseAmount: 0.6 },
        ],
      },
      prose:
        "\"Four seconds,\" I said. \"You had four seconds and you were twenty-nine years old and your husband was already dead by then. There's no version of that where you decided anything.\"\n\nIt was true and it wasn't enough, and we both sat in the fact that it wasn't enough.\n\nDesh never talked to me. I went at him three times and the third time he looked at me like I was a man asking for directions in a language he didn't have, and I let it go. So there was a thing about her father I never learned, and she'd have taken it from me if I'd had it, and I didn't.\n\nAn impression in the red vinyl. A cup of coffee nobody drank.",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "NOBODY'S WITNESS — WHAT YOU NEVER LEARNED",
        recap:
          "You paid the whole price and got her out from under both debts. But you never got Desh to open his mouth, so you never learned that her father refused to sell her — and you can't give away a thing you were never handed. She goes on believing he sold all of her. You go on not knowing you could have fixed it.",
        endsSeason: true,
      },
      choices: [],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ================================================================= */
    /*  ENDING — already bought                                          */
    /* ================================================================= */
    {
      id: "nw2_end_bought",
      title: "Nothing Left To Sell",
      background: "/img/nw2/bg-final-street.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.4,
      letterbox: true,
      cinematic: {
        mode: "static",
        dimAmount: 0.36,
        lights: [
          { x: 62, y: 30, color: "#ffb761", intensity: 0.22, size: 30, pulseSeconds: 6.0, pulseAmount: 0.4 },
        ],
      },
      prose:
        "Down the stairs, past the feed store, out into it.\n\nFour hundred dollars on a bar on a Wednesday night. That's what the whole thing cost me, and I didn't even feel it go — I felt relieved, is what I felt, because the rent was due and the rain was coming in under the office door and it was owed wages, and it was. That's what made it work.\n\nThat's the trick of the place. Solomon never has to ask. You arrive at the number by yourself and you hand it over for something small and entirely reasonable, and then it's Thursday and there's a woman with two debts and a dead husband and one day left on her, and you've got nothing in your pockets to put on the table.\n\nFriday came. I'm not going to write down what Friday was.\n\nI never went back to the diner. I've driven past it. That's not the same as going back.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "NOTHING LEFT TO SELL — THE DEBTS STAND",
        recap:
          "You took four hundred dollars off Moe in the pool hall. It was owed wages, it was entirely reasonable, and it was the only asset you had. Ten years of not being for sale, spent on rent. Two hundred and twenty-two thousand dollars still sits on Vera Voss and her dead father, and the one man in Blackwood who could have moved it had already been bought.",
        endsSeason: true,
      },
      choices: [],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ================================================================= */
    /*  THE BOOKEND — the signature shot, unchanged                      */
    /*  (After Part 6 this is the last frame of the film.)               */
    /* ================================================================= */
    {
      id: "nw2_bookend",
      partBreak: "Act One — The Woman Who Sold Herself Twice",
      title: "End of Act One",
      background: "/img/style/nw2-signature-a-neon80s.jpg",
      ambientAudio: "rain",
      musicMode: "track",
      musicUrl: "/nobodys-witness.mp3",
      transition: "fade-black",
      transitionSpeed: 1.4,
      letterbox: true,
      // Identical cinematic block to nw2_signature. The shot does not change.
      cinematic: {
        mode: "pan",
        focalPoint: "42% 52%",
        panDistance: 3,
        panDirection: "right",
        zoomDuration: 26,
        dimAmount: 0.06,
        lights: [
          { x: 58, y: 26, color: "#ff2e88", intensity: 0.22, size: 38, pulseSeconds: 4.4, pulseAmount: 0.8 },
          { x: 22, y: 40, color: "#2ad9d9", intensity: 0.2, size: 44, pulseSeconds: 5.6, pulseAmount: 0.7 },
        ],
      },
      prose:
        "The car on Main again, the way it was before any of it. Half the signs dead, the rest doing all the work of a much bigger city, smearing teal and magenta down the windshield. Dashboard light on my face. I didn't look at any of it.\n\nEleven weeks from this, the same street, the same rain, and no car in the frame at all.",
      // ACT BREAK, not an ending. The shot is unchanged from nw2_signature by
      // design; the car is still in it. Compare nw2_final_street, which is the
      // identical frame with the car gone.
      choices: [
        {
          id: "nw2_bookend_go",
          text: "ACT TWO",
          targetSceneId: "nw2_a2_office",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ================================================================= */
    /*  ENDING — turned it down                                          */
    /* ================================================================= */
    {
      id: "nw2_end_refusal",
      title: "The Smart Move",
      background: "/img/nw2/bg-mill-lot.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.2,
      cinematic: {
        mode: "static",
        dimAmount: 0.34,
        lights: [
          { x: 60, y: 28, color: "#ffb761", intensity: 0.3, size: 28, pulseSeconds: 5.0, pulseAmount: 0.4 },
        ],
      },
      prose:
        "I slid the folder back across the formica and watched her decide not to argue about it. She said thank you anyway, which was worse. Then the bell, and the rain, and a booth with nobody in the other side of it.\n\nSmart move was letting it go. Turns out I'm smart about it exactly once, and I spent it here.",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "CASE DECLINED — BLACKWOOD KEEPS ITS ARITHMETIC",
        recap:
          "You turned Vera Voss down. David Voss stays missing, Solomon Reyes stays employed, and you stay exactly where you were. Nothing happened to you. Again.",
      },
      choices: [],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ================================================================= */
    /*  ENDING — she takes the folder back (heat trapdoor)               */
    /* ================================================================= */
    {
      id: "nw2_end_folded",
      title: "She Takes It Back",
      background: "/img/nw2/bg-vera-booth.jpg",
      ambientAudio: "rain",
      particles: "rain",
      musicMode: "none",
      transition: "fade-black",
      transitionSpeed: 1.0,
      cinematic: {
        mode: "static",
        dimAmount: 0.3,
        lights: [
          { x: 26, y: 26, color: "#ff2e88", intensity: 0.3, size: 30, pulseSeconds: 3.0, pulseAmount: 0.9 },
        ],
      },
      prose:
        "She let me finish. That was the part that stung — she let me get all the way to the end of it, and then she reached over and took the folder back, unhurried, the way you'd take a drink off someone who'd had enough.\n\n\"I said I didn't have anybody left to fall apart in front of,\" she said. \"I didn't say I was desperate.\"\n\nThe bell. The rain. Three weeks of a woman's work, walking out the door in a coat too good for this room.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "CLIENT WALKS — YOU TALKED YOURSELF OUT OF THE ONLY CASE IN TOWN",
        recap:
          "You pushed her, and pushed her, and she was never as breakable as you were betting. Vera Voss found somebody cheaper. You never found out what the shape was.",
      },
      choices: [],
      hotspots: [],
      dialogueBeats: [],
    },
  ],
};

/* ---------------------------------------------------------------------
 * SIGNATURE SHOT — alternate style plates
 *
 * All five are the same frame (Jack's car on Main, dashboard light, neon on
 * a wet windshield). Swap the `background` on BOTH `nw2_signature` and
 * `nw2_bookend`, and `coverImage` at the top, to change the film's look:
 *
 *   /img/style/nw2-signature-a-neon80s.jpg     1980s neon noir  ← current
 *   /img/style/nw2-signature-b-monochrome.jpg  1947 monochrome
 *   /img/style/nw2-signature-c-inkwash.jpg     painted ink & gouache
 *   /img/style/nw2-signature-d-rustbelt.jpg    1970s naturalist rust belt
 *   /img/style/nw2-signature-e-spotcolour.jpg  graphic ink + spot colour
 * ------------------------------------------------------------------- */
