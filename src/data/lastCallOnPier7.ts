import type { Story } from "../types";

/**
 * LAST CALL ON PIER 7 — the engine test bench.
 *
 * Written to exercise every structural feature the Studio now exposes, so a
 * regression in any of them shows up as a visibly broken playthrough rather
 * than a silent data problem. Deliberately compact: 16 scenes, ~10 minutes.
 *
 * What each feature is doing here, and why:
 *
 *  ACTS (3)         Act One opens cold with no card. Act Two and Act Three are
 *                   entered through choices, so both title cards fire. The act
 *                   walk must produce 5 / 4 / 6 — if a link ever crosses a
 *                   boundary the Studio's overlap panel lights up.
 *  PART BREAKS (4)  Four scenes carry `partBreak`, so the linear flowchart
 *                   renders four times mid-run, plus automatically at endings.
 *  GATE WEAVE       The credits node runs `gateWeave: "projector"` — the
 *                   strongest preset, including splice bumps, so the effect is
 *                   unmissable while testing.
 *  QTE              One hard four-second deadline with heartbeat and shaky cam,
 *                   routing to a distinct "you hesitated" scene rather than a
 *                   game over.
 *  EXCLUSIVE REPLY  A three-question interrogation in one scene using
 *                   `reply` + `exclusiveGroup` + `hidden`, with beats gated on
 *                   the flags those replies set.
 *  MEMORY RECALL    `memoryLog` on the interrogation, recalled verbatim two
 *                   acts later via a beat `recalls` map.
 *  GATING           An item gate, a flag gate, and a meter gate, one each.
 *  STRANDED SCENE   `p7_end_drowned` is reachable only by the heat rule, so it
 *                   belongs to no act. This is INTENTIONAL: it proves the
 *                   validator's "scenes in no act" warning is a note, not an
 *                   error, and mirrors the flagship's nw2_end_folded.
 *
 * Backgrounds are existing files in public/img plus CSS gradients, so the
 * story adds no new assets and check-setup stays green.
 */
export const LAST_CALL_ON_PIER_7: Story = {
  id: "last-call-pier-7",
  title: "Last Call on Pier 7",
  tagline: "Everyone on the waterfront owes somebody. Tonight the ledger closes.",
  coverImage: "/img/cover-last-call-pier-7.jpg",
  startSceneId: "p7_credits",

  characters: [
    { id: "quinn", name: "Del Quinn", role: "Harbour Investigator", avatarUrl: "/img/ch-sam-vane.jpg", trustMeter: 0 },
    { id: "marguerite", name: "Marguerite Sale", role: "Owns the Pier", avatarUrl: "/img/ch-isadora.jpg", trustMeter: 0 },
    { id: "boyd", name: "Tommy Boyd", role: "Night Watchman", avatarUrl: "/img/ch-mickey.jpg", trustMeter: 0 },
    { id: "harrow", name: "Lieutenant Harrow", role: "Bought and Paid For", avatarUrl: "emoji:🚬", trustMeter: 0 },
  ],

  items: [
    { id: "logbook", name: "Harbour Logbook", icon: "📒", isClue: true, description: "Tommy's night register for Pier 7.", flavorText: "Three hours on the fourteenth are torn out with a straight edge. Not panic — housekeeping." },
    { id: "keyring", name: "Bonded Warehouse Keys", icon: "🔑", description: "The spare ring off the watch-house hook.", flavorText: "Brass, unmarked, still warm from somebody else's pocket." },
    { id: "photo", name: "Photograph", icon: "📷", isClue: true, description: "Marguerite Sale on the customs house steps.", flavorText: "The man shaking her hand turns his face from the lens at exactly the right moment. Practised." },
  ],

  acts: [
    {
      id: "p7_act1",
      label: "Act One",
      title: "The Water Remembers",
      tagline: "Nobody drowns in four feet of water by accident.",
      startSceneId: "p7_credits",
      // No title card image: Act One opens cold, straight into the credits.
      titleCardSeconds: 0,
    },
    {
      id: "p7_act2",
      label: "Act Two",
      title: "What Tommy Saw",
      tagline: "A witness is only worth what he's still alive to say.",
      startSceneId: "p7_a2_watchhouse",
      titleCardImage: "/img/bg-docks.jpg",
      titleCardSeconds: 3.0,
    },
    {
      id: "p7_act3",
      label: "Act Three",
      title: "Last Call",
      tagline: "The tide goes out at four. So does everybody's story.",
      startSceneId: "p7_a3_office",
      titleCardImage: "/img/bg-velvet-office.jpg",
      titleCardSeconds: 3.0,
    },
  ],

  briefing: {
    objective: "Find out who put Ellis Vane in the harbour, and get it on the record before the tide turns.",
    winConditions: [
      "Recover the photograph from the bonded warehouse.",
      "Refuse Harrow, then close the case with evidence he cannot bury.",
    ],
    loseConditions: [
      "Let Suspicion reach 4 — the waterfront talks, and it talks about you.",
      "Take Harrow's number.",
    ],
    // Drives the stranded ending: the engine can jump here from ANY scene,
    // which is exactly why no act's choice-edge walk reaches it.
    heatLimit: 4,
    heatFailSceneId: "p7_end_drowned",
  },

  scenes: [
    /* ============================================================ *
     *  ACT ONE — The Water Remembers                               *
     * ============================================================ */
    {
      id: "p7_credits",
      title: "Opening Credits",
      nodeType: "credits",
      background: "/img/bg-pier4.jpg",
      ambientAudio: "rain",
      noTypewriter: true,
      transition: "cut",
      letterbox: true,
      choiceDelaySeconds: 6,
      credits: {
        title: "LAST CALL ON PIER 7",
        subtitle: "A harbour is just a place we agree not to look",
        style: "cards",
        cardSeconds: 3.0,
        font: "poster",
        cardMotion: "letterspace",
        // Strongest preset on purpose: this is the reference implementation
        // for the gate-weave feature, so it should be obvious it's running.
        gateWeave: "projector",
        accentColor: "#2ad9d9",
        lines: [
          { role: "Starring", name: "Del Quinn" },
          { role: "And", name: "Marguerite Sale" },
          { role: "Act One", name: "The Water Remembers" },
        ],
        montage: ["/img/bg-pier4.jpg", "/img/bg-docks.jpg", "/img/bg-alley.jpg"],
        montageSeconds: 4,
      },
      prose: "Rain on black water. Somewhere under the pier, something knocks against a piling and keeps knocking.",
      choices: [
        { id: "p7_c_begin", text: "Go down to the water", targetSceneId: "p7_pier", attitudeTag: "Neutral" },
      ],
    },

    {
      id: "p7_pier",
      title: "Pier 7, 2:40 AM",
      background: "/img/bg-pier4.jpg",
      ambientAudio: "rain",
      particles: "rain",
      letterbox: true,
      transition: "fade-black",
      cinematic: { mode: "pan", focalPoint: "50% 60%", zoomDuration: 14 },
      prose:
        "Ellis Vane is face down in four feet of harbour water, and four feet is the part that bothers me. A man that tall could have stood up and walked out of his own drowning.",
      dialogueBeats: [
        { id: "p7_b1", characterId: "quinn", text: "Twenty-two years on this waterfront and the harbour has never once been shy about giving a body back. This one it kept until somebody wanted it found.", silent: false },
        { id: "p7_b2", characterId: "boyd", text: "I called it in at two. I didn't touch nothing, Mr Quinn. I want that written down somewhere — I didn't touch nothing.", expression: "nervous" },
      ],
      choices: [
        {
          id: "p7_c_logbook",
          text: "Ask Tommy for the night register",
          targetSceneId: "p7_first_look",
          attitudeTag: "Clever",
          consequences: { addItems: ["logbook"], trustChanges: [{ characterId: "boyd", delta: 1 }] },
        },
        {
          id: "p7_c_lean",
          text: "Lean on him — he's already sweating",
          targetSceneId: "p7_first_look",
          attitudeTag: "Aggressive",
          consequences: {
            setFlags: ["p7_leaned_on_tommy"],
            meterChanges: [{ meter: "Suspicion", delta: 1 }],
            trustChanges: [{ characterId: "boyd", delta: -2 }],
          },
        },
      ],
    },

    {
      id: "p7_first_look",
      title: "Act One, Part 1 — Four Feet of Water",
      partBreak: "Part 1 — Four Feet of Water",
      background: "/img/bg-docks.jpg",
      ambientAudio: "rain",
      particles: "rain",
      letterbox: true,
      prose:
        "The logbook covers every hour of the fourteenth except three of them. Someone took a straight edge to the page and tore carefully, which is worse than tearing in a panic. A panic is a mistake. This was housekeeping.",
      dialogueBeats: [
        {
          id: "p7_b3",
          characterId: "boyd",
          text: "That book never leaves the watch house. Never. So whoever went at it had a key, and there's four keys on this whole pier.",
          conditionRule: { requiresItems: ["logbook"] },
        },
        {
          id: "p7_b4",
          characterId: "boyd",
          text: "You can look at me like that all night. I still don't know nothing.",
          conditionRule: { requiresFlags: ["p7_leaned_on_tommy"] },
        },
      ],
      choices: [
        {
          id: "p7_c_to_act2",
          text: "Walk up to the watch house with him",
          targetSceneId: "p7_a2_watchhouse",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ============================================================ *
     *  ACT TWO — What Tommy Saw                                    *
     * ============================================================ */
    {
      id: "p7_a2_watchhouse",
      title: "The Watch House",
      background: "/img/bg-basement.jpg",
      ambientAudio: "drone",
      letterbox: true,
      transition: "fade-black",
      onEnterActions: [{ consequences: { setFlags: ["p7_reached_watchhouse"] } }],
      prose:
        "One bulb, one stove, one chair with the stuffing coming out of it. Tommy Boyd has been keeping other people's hours in this room for eleven years and it shows in everything he owns.",
      dialogueBeats: [
        { id: "p7_b5", characterId: "boyd", text: "Ask me. Go on. But ask me quick, because at four I go off shift and after that I never saw you." },
      ],
      // Three sequential replies in ONE scene: the exclusiveGroup pattern.
      choices: [
        {
          id: "p7_q_who",
          text: "\"Who else has a key?\"",
          // A reply answers in place: an empty target is the contract.
          targetSceneId: "",
          attitudeTag: "Clever",
          reply: true,
          exclusiveGroup: "p7_tommy_q",
          consequences: { setFlags: ["p7_asked_who"] },
          memoryLog: "p7_tommy_question",
        },
        {
          id: "p7_q_saw",
          text: "\"What did you actually see that night?\"",
          // A reply answers in place: an empty target is the contract.
          targetSceneId: "",
          attitudeTag: "Neutral",
          reply: true,
          exclusiveGroup: "p7_tommy_q",
          consequences: { setFlags: ["p7_asked_saw"] },
          memoryLog: "p7_tommy_question",
        },
        {
          id: "p7_q_scared",
          text: "\"Who are you scared of, Tommy?\"",
          // A reply answers in place: an empty target is the contract.
          targetSceneId: "",
          attitudeTag: "Sultry",
          reply: true,
          exclusiveGroup: "p7_tommy_q",
          consequences: { setFlags: ["p7_asked_scared"], trustChanges: [{ characterId: "boyd", delta: 2 }] },
          memoryLog: "p7_tommy_question",
        },
        {
          id: "p7_c_leave_watchhouse",
          text: "Let him finish his shift",
          targetSceneId: "p7_a2_keys",
          attitudeTag: "Neutral",
          hidden: true,
          gating: { requiresFlags: ["p7_asked_who", "p7_asked_saw", "p7_asked_scared"], requiresAll: false },
        },
      ],
    },

    {
      id: "p7_a2_keys",
      title: "Act Two, Part 2 — Four Keys",
      partBreak: "Part 2 — Four Keys",
      background: "/img/bg-corridor.jpg",
      ambientAudio: "drone",
      letterbox: true,
      prose:
        "Four keys. Tommy's, the harbourmaster's, one in a safe in an office nobody's opened since the war, and one belonging to the woman who owns the pier outright.",
      dialogueBeats: [
        { id: "p7_b6", characterId: "boyd", text: "Miss Sale's had hers since her father died. She don't use it. That's what I'd swear to, anyway.", conditionRule: { requiresFlags: ["p7_asked_who"] } },
        { id: "p7_b7", characterId: "boyd", text: "I saw a car. Long one, lights off, sat at the head of the pier for maybe an hour. That's all. That's honestly all.", conditionRule: { requiresFlags: ["p7_asked_saw"] } },
        { id: "p7_b8", characterId: "boyd", text: "I got a daughter in Rochester. That's who I'm scared for. Not of.", conditionRule: { requiresFlags: ["p7_asked_scared"] } },
      ],
      choices: [
        {
          id: "p7_c_take_keys",
          text: "Take the spare ring off the hook",
          targetSceneId: "p7_a2_warehouse",
          attitudeTag: "Aggressive",
          consequences: { addItems: ["keyring"], meterChanges: [{ meter: "Suspicion", delta: 1 }] },
        },
        {
          id: "p7_c_ask_keys",
          text: "Ask him to sign the ring out to you",
          targetSceneId: "p7_a2_warehouse",
          attitudeTag: "Clever",
          gating: { minTrust: { boyd: 1 } },
          consequences: { addItems: ["keyring"], setFlags: ["p7_keys_on_record"] },
        },
      ],
    },

    {
      id: "p7_a2_warehouse",
      title: "Bonded Warehouse 3",
      background: "/img/bg-vault.jpg",
      ambientAudio: "tension",
      letterbox: true,
      transition: "fade",
      prose:
        "Crates stencilled for Lisbon that never went to Lisbon. And at the back, under a tarpaulin, a filing drawer that does not belong in a building full of coffee and rope.",
      dialogueBeats: [
        { id: "p7_b9", characterId: "quinn", text: "A man was killed for the three hours between eleven and two. Everything in this room is those three hours, boxed and labelled." },
      ],
      choices: [
        {
          id: "p7_c_open_drawer",
          text: "Open the drawer",
          targetSceneId: "p7_a2_photo",
          attitudeTag: "Neutral",
          gating: { requiresItems: ["keyring"] },
        },
      ],
    },

    {
      id: "p7_a2_photo",
      title: "Act Two, Part 3 — The Photograph",
      partBreak: "Part 3 — The Photograph",
      background: "/img/bg-folder-closeup.jpg",
      ambientAudio: "tension",
      letterbox: true,
      onEnterActions: [{ consequences: { addItems: ["photo"], setFlags: ["p7_has_photo"] } }],
      prose:
        "One photograph. Marguerite Sale on the steps of the customs house, shaking hands with a man who has turned his face away from the lens at exactly the right moment. Practised. He's done this before.",
      choices: [
        { id: "p7_c_to_act3", text: "Go and see Miss Sale", targetSceneId: "p7_a3_office", attitudeTag: "Neutral" },
      ],
    },

    /* ============================================================ *
     *  ACT THREE — Last Call                                       *
     * ============================================================ */
    {
      id: "p7_a3_office",
      title: "The Office Above the Pier",
      background: "/img/bg-velvet-office.jpg",
      ambientAudio: "jazz",
      letterbox: true,
      transition: "fade-black",
      cinematic: { mode: "zoom-hold", focalPoint: "45% 40%", zoomDuration: 12 },
      prose:
        "Marguerite Sale keeps her father's office exactly as he left it, including the whisky, and she pours two before I have said a word.",
      dialogueBeats: [
        { id: "p7_b10", characterId: "marguerite", text: "Ellis Vane worked for me for nine years. Whatever you've come to say, say it as though that were true, because it is." },
        {
          id: "p7_b11",
          characterId: "marguerite",
          text: "You've been talking to Tommy Boyd. He'd tell you the tide was a conspiracy if you asked him kindly enough.",
          recalls: {
            // The exact line the player used on Tommy, two acts ago.
            p7_tommy_question: "You've been talking to Tommy. You asked him {said} — he repeats it like scripture now.",
          },
        },
      ],
      choices: [
        {
          id: "p7_c_show_photo",
          text: "Put the photograph on the desk",
          targetSceneId: "p7_a3_qte",
          attitudeTag: "Clever",
          gating: { requiresItems: ["photo"] },
          consequences: { setFlags: ["p7_played_photo"] },
        },
        {
          id: "p7_c_bluff",
          text: "Bluff — tell her you already know",
          targetSceneId: "p7_a3_qte",
          attitudeTag: "Sultry",
          consequences: { meterChanges: [{ meter: "Sultry", delta: 1 }, { meter: "Suspicion", delta: 1 }] },
        },
      ],
    },

    {
      id: "p7_a3_qte",
      title: "Act Three, Part 4 — Four Seconds",
      partBreak: "Part 4 — Four Seconds",
      background: "/img/bg-velvet-office.jpg",
      ambientAudio: "tension",
      letterbox: true,
      prose:
        "Footsteps on the outside stair, heavy and unhurried, and Marguerite's eyes go to the door before mine do. She knew he was coming. She's known for the last ten minutes.",
      dialogueBeats: [
        { id: "p7_b12", characterId: "marguerite", text: "Whatever you do in the next few seconds, Mr Quinn, do it as though your licence depended on it. Because it does." },
      ],
      choices: [
        {
          id: "p7_c_hide_photo",
          text: "Get the photograph out of sight",
          targetSceneId: "p7_a3_harrow",
          attitudeTag: "Clever",
          quickTime: true,
          timeLimitSeconds: 4,
          qtePrompt: "HIDE IT",
          qteHeartbeat: true,
          qteShakyCam: true,
          consequences: { setFlags: ["p7_hid_photo"] },
          // Hesitating is a real branch, not a game over.
          timedOutTargetSceneId: "p7_a3_caught",
          timedOutConsequences: { setFlags: ["p7_harrow_saw_photo"], meterChanges: [{ meter: "Suspicion", delta: 1 }] },
        },
      ],
    },

    {
      id: "p7_a3_caught",
      title: "Too Slow",
      background: "/img/bg-betrayal.jpg",
      ambientAudio: "tension",
      letterbox: true,
      transition: "cut",
      prose:
        "Harrow is in the doorway before the photograph is anywhere but the middle of the desk, face up, in the light. He looks at it for a long moment and then he smiles like a man being handed a gift.",
      dialogueBeats: [
        { id: "p7_b13", characterId: "harrow", text: "Del Quinn. Still turning over rocks at three in the morning. Doesn't it ever tire you out, knowing how this ends?" },
      ],
      choices: [
        { id: "p7_c_caught_on", text: "Say nothing and let him talk", targetSceneId: "p7_a3_harrow", attitudeTag: "Neutral" },
      ],
    },

    {
      id: "p7_a3_harrow",
      title: "Lieutenant Harrow",
      background: "/img/bg-stranger.jpg",
      ambientAudio: "drone",
      letterbox: true,
      prose:
        "He takes the second whisky without being offered it, which tells me everything about how often he's been in this room.",
      dialogueBeats: [
        { id: "p7_b14", characterId: "harrow", text: "Vane was skimming off a bonded warehouse. He fell in the harbour. Those two facts are unrelated and I would like them to stay that way." },
        { id: "p7_b15", characterId: "harrow", text: "There's a number attached to them staying that way. There always is.", conditionRule: { requiresFlags: ["p7_harrow_saw_photo"] } },
      ],
      choices: [
        {
          id: "p7_c_take_deal",
          text: "Take the number and go home",
          targetSceneId: "p7_end_bought",
          attitudeTag: "Neutral",
          consequences: { meterChanges: [{ meter: "Suspicion", delta: 1 }] },
        },
        {
          id: "p7_c_refuse",
          text: "Refuse, and say why",
          targetSceneId: "p7_a3_final",
          attitudeTag: "Aggressive",
          consequences: { setFlags: ["p7_refused_harrow"] },
        },
        {
          id: "p7_c_clever_out",
          text: "Offer him a version he can live with",
          targetSceneId: "p7_a3_final",
          attitudeTag: "Clever",
          gating: { minMeters: { Clever: 1 } },
          consequences: { setFlags: ["p7_refused_harrow", "p7_played_it_clever"] },
        },
      ],
    },

    {
      id: "p7_a3_final",
      title: "Act Three, Part 5 — Last Call",
      partBreak: "Part 5 — Last Call",
      background: "/img/bg-endgame.jpg",
      ambientAudio: "rain",
      particles: "rain",
      letterbox: true,
      transition: "fade-black",
      prose:
        "Four in the morning on Pier 7. Tommy Boyd goes off shift. The tide turns and takes the harbour out from under the pilings, and whatever is left down there is left there for good.",
      dialogueBeats: [
        { id: "p7_b16", characterId: "quinn", text: "You get one of these a year if you're unlucky. A night where the whole thing is sitting in front of you and the only question left is what it costs to say it out loud." },
      ],
      choices: [
        {
          id: "p7_c_end_record",
          text: "Put it all on the record",
          targetSceneId: "p7_end_record",
          attitudeTag: "Aggressive",
          gating: { requiresFlags: ["p7_has_photo"] },
        },
        {
          id: "p7_c_end_tommy",
          text: "Get Tommy and his daughter out first",
          targetSceneId: "p7_end_tommy",
          attitudeTag: "Clever",
          gating: { minTrust: { boyd: 2 } },
        },
        {
          id: "p7_c_end_walk",
          text: "Walk away and let the tide have it",
          targetSceneId: "p7_end_walked",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ---------------- endings ---------------- */
    {
      id: "p7_end_record",
      title: "On the Record",
      background: "/img/bg-end-gold.jpg",
      ambientAudio: "jazz",
      letterbox: true,
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "HARBOUR LIEUTENANT CHARGED — PIER 7 LEDGERS SEIZED AT DAWN",
        recap:
          "You had the photograph, and a photograph is only worth the nerve of the man holding it. Harrow went out of the customs house in front of six reporters who had been told exactly when to be there.",
      },
      prose: "It runs in the second edition, under a photograph of a man turning his face away from a lens. He's had a lot of practice. Not enough.",
    },

    {
      id: "p7_end_tommy",
      title: "Rochester",
      background: "/img/bg-end-warn.jpg",
      ambientAudio: "rain",
      letterbox: true,
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "WITNESS RELOCATED — INQUIRY ADJOURNED WITHOUT FINDING",
        recap:
          "Tommy Boyd and his daughter were on the 6:15 before anybody thought to look for them. The case went nowhere. He's alive, and he sends a card at Christmas, and that is a kind of result.",
      },
      prose: "The inquiry finds nothing, which is what inquiries are for. But there's a man in Rochester who gets to keep being a man in Rochester.",
    },

    {
      id: "p7_end_walked",
      title: "The Tide Goes Out",
      background: "/img/bg-end-refusal.jpg",
      ambientAudio: "rain",
      letterbox: true,
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "DROWNING RULED ACCIDENTAL — NO FURTHER ACTION",
        recap: "You went home. The harbour kept it. Ellis Vane goes in the file as a man who fell in four feet of water and could not be bothered to stand up.",
      },
      prose: "I file it accidental. I've filed worse. That's not the part that keeps me up — the part that keeps me up is how easy the pen was.",
    },

    {
      id: "p7_end_bought",
      title: "The Number",
      background: "/img/bg-betrayal.jpg",
      ambientAudio: "drone",
      letterbox: true,
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "INVESTIGATOR'S LICENCE SURRENDERED — NO REASON GIVEN",
        recap: "You took the number. It was a good number. It lasted about as long as those numbers last, and then there was nothing to go back to.",
      },
      prose: "Harrow writes it on the back of a card and slides it over, and the worst thing about it is that I look at it before I say no. And then I don't say no.",
    },

    {
      // STRANDED BY DESIGN. Reached only when Suspicion hits the heat limit,
      // which the engine can trigger from anywhere, so no act's choice-edge
      // walk reaches it. The Studio's "scenes in no act" note should list
      // exactly this one scene — that warning is correct, not a bug.
      id: "p7_end_drowned",
      title: "Four Feet of Water",
      background: "/img/bg-end-vanish.jpg",
      ambientAudio: "drone",
      letterbox: true,
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "SECOND BODY RECOVERED AT PIER 7 — HARBOUR POLICE CITE TIDE",
        recap: "You asked too loudly, too early, of too many people who all drink in the same room. The harbour has never been shy about giving a body back.",
      },
      prose: "Four feet of water. A man that tall could have stood up. That was the whole case, and in the end it was the whole obituary too.",
    },
  ],
};
