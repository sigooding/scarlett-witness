import type { Story } from "../types";

/**
 * THE NEON DINER — a short, feature-dense engine test case.
 *
 * Mabel Kowalski works the last shift of her life and doesn't show up to it.
 * You walk into her diner at 3 a.m. with a cold coffee, a hot grill, and a
 * man in booth four who has been watching the door all night.
 *
 * It is deliberately small (15 scenes, two acts, five endings) but it
 * exercises nearly every surface of the engine at least once — the header is
 * the checklist. Open it in Studio to inspect, "Play draft" to run it, and
 * the validator to confirm the wiring:
 *
 *  STRUCTURE
 *   · 2 acts (Act Two title card + end-of-act RouteMap), 1 part break on the
 *     porch (end-of-part Flowchart) — leaving the porch runs the FULL
 *     interstitial suite: Flowchart → RouteMap → Act Two title card.
 *   · Credits node (poster typeface, slam entrance, 35mm gate weave) with a
 *     hidden-timer auto-advance into the first scene.
 *   · 5 endings: gold / silver / 3 game-overs, one of them (Folded) reached
 *     only through the heat rule (briefing.heatLimit 3).
 *
 *  FLAGS & FLAG NOTES (the Studio 🏷 Flags tab)
 *   · `story.flagNotes` carries author notes for every meaningful flag.
 *   · `heard_the_knock` is set by a QUICK-TIME TIMEOUT, recalled by a beat,
 *     and the beat's `{said}` echoes the FLAG NOTE (flag-keyed recall).
 *   · `answered_door` / `trusted_vince` / `pressed_vince` show the flag-keyed
 *     gating ("Remembers" picker) AND the Case Progress "Story so far" list.
 *   · `ledger_page` comes from the PATTERN PUZZLE reward; `ledger_ruined`
 *     from its final-fail path — both are collectFlags() sources.
 *   · on-enter flags: `searched_freezer`, `backroom_searched`.
 *
 *  MEMORIES & RECALLS
 *   · `asked_mabel` (Choice.memoryLog) — a beat recalls it with `{said}`
 *     echoing the player's exact line.
 *   · Gated beats act as in-scene reply answers (conversational Q&A): the
 *     recall beats sit AFTER the plain beats so they unlock mid-scene.
 *
 *  PRESENT-ITEM VERB (show something to someone)
 *   · "Show him the photograph" presents `photo` — the choice stays hidden
 *     until you hold it, and presenting records the `item:photo` memory.
 *   · Ruiz's Act-Two beat (`nd_s4`) is keyed on that `item:photo` memory —
 *     an ITEM-KEYED recall, `{said}` = the item's name.
 *   · "Hand over the case file" / "Hand over the ledger" present + CONSUME
 *     (`consumePresentedItem`), so the evidence physically leaves your
 *     satchel — and each ending locks itself naturally if you never built
 *     the item it needs.
 *
 *  INTERROGATION (composure pressure on the core loop)
 *   · Booth four runs an `interrogation` (composure 3, crack at trust ≥ −1).
 *     The four attitude-tagged replies are the PRESSES (photo/press2/
 *     threat/press3); the neutral ask and silence don't chip.
 *   · WARM path: ask (+1 trust) then press to zero → CRACK — the broke beat
 *     plays, `vince_broke` sets (gate the payoff on it), trust/heat swing.
 *     The three plain presses cost 2 trust between them, so the warm-up is
 *     what carries the threshold.
 *   · COLD path: press without warming → trust ≤ −2 at zero → CLAMP — the
 *     clamped beat plays, `vince_clamped` sets, heat +2 backfire.
 *   · Composure is DERIVED from the one-shot presses (usedChoices) —
 *     save-proof, ungrindable; the composure bar shows above the dialogue.
 *
 *  EXAMINE (hold to inspect) — "Mabel's Station"
 *   · The counter scene has three EXAMINE hotspots (coffee, watch, note).
 *     The player HOLDS a zone: the camera zooms in on it, an "EXAMINING"
 *     meter fills over the authored hold (2–3s), release aborts. On
 *     completion: giveItem = the object is picked up (watch, note),
 *     showText = the description shows (coffee); the zone is then hidden.
 *   · Each action sets an examined_* flag and a narrator beat gated on that
 *     flag explains the find. Finding the note cross-links to Ruiz in
 *     Act Two (nd_s5). The background is a large, detailed plate on
 *     purpose — the zoom is a CSS magnification and blurs small images.
 *
 *  GATING — every clause of Gating is used at least once:
 *   · requiresItems: freezer door (key), case file (proof), ledger handover
 *   · requiresFlags: protect-Moreau ending, Ruiz's contradiction beat
 *   · excludesFlags: "Show him the photograph" (not after you've pressed him)
 *   · requiresMemories: memory tag (asked_mabel), FLAGS (heard_the_knock,
 *     trusted_vince, pressed_vince) — the Ruiz beats in Act Two
 *   · minMeters: Clever 2 to "lay out the contradictions"
 *   · minTrust: the photo choice needs Vince's trust at 1+
 *   · hidden choices, reply choices, exclusive groups
 *
 *  WORLD STATE
 *   · Items + a COMBINATION recipe: photograph + ledger → the case file.
 *   · Pattern puzzle (3-of-5, no retry — a final miss is narratively final:
 *     +1 Heat and the ledger is gone).
 *   · Deduction board: 3 suspects, 3 connections with revelations.
 *   · Meters via attitude-tagged choices + explicit meterChanges; heat
 *     sources total exactly 3 (press Vince / let the QTE lapse / botch the
 *     ledger) — one full-mistake run folds you.
 *
 *  CINEMATIC
 *   · Dolly (hall), zoom-hold (booth), static + light glow (kitchen),
 *     dolly-zoom push (confrontation), pan + letterbox + rain particles
 *     (porch/street), dimmed freezer, and a beat with a REPLACEMENT
 *     BACKGROUND + its own transition.
 *
 *  KNOWN VALIDATOR NOTE
 *   · "Folded" (the heat-bust ending) intentionally belongs to no act — the
 *     engine can drop the player there from ANY scene, so no act's walk
 *     reaches it. The "scenes in no act" warning is a note, not an error
 *     (same design as Last Call on Pier 7's drowned ending).
 *   · The freezer and back room are reachable ONLY through door hotspots,
 *     proving the act-membership walk follows scene-moving hotspot edges —
 *     they must appear on the end-of-act RouteMap. The engine test
 *     (npm test, scripts/engine-tests.mjs) asserts exactly that.
 *
 * New art for this case: /img/bg-nd-interior, /img/bg-nd-backroom,
 * /img/bg-nd-street, /img/ch-nd-mabel, /img/ch-nd-vince,
 * /img/cover-neon-diner.
 */
export const NEON_DINER: Story = {
  id: "neon-diner",
  title: "The Neon Diner",
  tagline: "She works the last shift of her life. You just walked in.",
  coverImage: "/img/cover-neon-diner.jpg",
  startSceneId: "nd_credits",

  flagNotes: {
    answered_door: "You answered the back door at 3 a.m. — and you'll never know who was standing there.",
    heard_the_knock: "You heard the knock at the back door and let it pass unanswered.",
    trusted_vince: "You showed Vince the photograph. He owes you now — and Ruiz watched from the window.",
    pressed_vince: "You pressed the wrong man, and Vince keeps score.",
    vince_broke: "You broke Vince Moreau. He talked — and he'll never forgive you for it.",
    vince_clamped: "You pressed Vince into silence. The door is shut, and Heat noticed.",
    examined_coffee: "You examined Mabel's coffee: one sip, then she waited for something that never came.",
    examined_watch: "You took Mabel's watch — stopped at 3:47, the strap unfastened on purpose.",
    examined_note: "You found Mabel's note: “If I don't clock in, it's because I found out.”",
    ledger_page: "You read the forged page: three nights, one hand, a number that belongs to Precinct 12.",
    ledger_ruined: "The ledger is just paper now. The numbers died in the back room.",
    cabinet_ripped: "You tore Louie's cabinet apart. The pass fell out like it was waiting.",
    searched_freezer: "You were in Mabel's freezer before the police were allowed.",
    backroom_searched: "You've seen the back room. The hole in the ledger is smaller than you thought.",
    saw_the_threads: "You laid out the contradictions and watched Ruiz do the arithmetic.",
    linked_vince_coin: "The board: the man in the photograph is the man in booth four.",
    linked_ruiz_number: "The board: the burned page is Precinct 12's ledger number.",
    linked_louie_bus: "The board: Louie didn't catch the 3 a.m. bus. He took the other one.",
  },

  characters: [
    { id: "mabel", name: "Mabel Kowalski", role: "The Cook", avatarUrl: "/img/ch-nd-mabel.jpg", trustMeter: 0 },
    { id: "vince", name: "Vince Moreau", role: "Booth Four", avatarUrl: "/img/ch-nd-vince.jpg", trustMeter: 0 },
    { id: "ruiz", name: "Detective Ruiz", role: "Precinct 12", avatarUrl: "emoji:🚔", trustMeter: 0 },
    { id: "louie", name: "Louie Dumas", role: "Night Janitor", avatarUrl: "emoji:🧹", trustMeter: 0 },
  ],

  items: [
    {
      id: "key",
      name: "Freezer Key",
      icon: "🔑",
      description: "A brass key on a hook under the register. The freezer door has been waiting all night.",
      flavorText: "It's heavier than it needs to be. Mabel added a weight.",
    },
    {
      id: "photo",
      name: "Mabel's Photograph",
      icon: "📷",
      isClue: true,
      description: "Mabel at the counter, mid-laugh, holding up a glass. On the back: \"booth four — pay in coins, count in years.\"",
      flavorText: "The man across from her turns his face from the lens at exactly the right moment. Practised.",
      combinableWith: { targetItemId: "ledger", resultItemId: "proof" },
    },
    {
      id: "burner",
      name: "Burner Phone",
      icon: "📱",
      isClue: true,
      description: "Mabel's second phone, warm in the ice. One contact, no name. Last call: 2:51 a.m.",
      flavorText: "The screen cracks the second you pull it out. Or maybe it's the ice.",
    },
    {
      id: "ledger",
      name: "The Ledger",
      icon: "📒",
      isClue: true,
      description: "Mabel's real ledger. The middle is burned away — a clean hole, not a torn one.",
      flavorText: "Whoever did this wanted the numbers gone and the book kept. A message in the margin: \"the rest is true.\"",
    },
    {
      id: "bus_pass",
      name: "Expired Bus Pass",
      icon: "🎫",
      isClue: true,
      description: "A transit pass in the back-room cabinet. Louie's. Expired three months ago.",
      flavorText: "No bus runs to the depot at 3 a.m. There never has.",
    },
    {
      id: "proof",
      name: "The Case File",
      icon: "📁",
      description: "The photograph and the ledger, stapled together. Every entry in the burned page, every coin in the booth.",
      flavorText: "It's not pretty. It's enough.",
    },
    {
      id: "mabel_watch",
      name: "Mabel's Watch",
      icon: "⌚",
      isClue: true,
      description: "A woman's wristwatch, stopped at 3:47. The strap is unfastened — she took it off deliberately.",
      flavorText: "Eleven minutes after her last order. Whatever stopped her, it was fast.",
    },
    {
      id: "mabel_note",
      name: "Mabel's Note",
      icon: "📝",
      isClue: true,
      description: "A folded note in Mabel's hand: “If I don't clock in, it's because I found out. — M.”",
      flavorText: "She knew something was coming. She was trying to tell someone.",
    },
  ],

  deduction: {
    suspectIds: ["vince", "ruiz", "louie"],
    connections: [
      {
        a: "photo",
        b: "vince",
        flagSet: "linked_vince_coin",
        revelation: "The face in Mabel's photograph. Booth four. A year of coins. The man in the booth is the man in the photo.",
      },
      {
        a: "ledger",
        b: "ruiz",
        flagSet: "linked_ruiz_number",
        revelation: "The burned page. Ruiz's precinct ledger number, written in Mabel's hand. The money was moving through the station.",
      },
      {
        a: "bus_pass",
        b: "louie",
        flagSet: "linked_louie_bus",
        revelation: "Louie's pass expired three months ago. There was no 3 a.m. bus. There's only the bus he didn't catch — and the one he took instead.",
      },
    ],
  },

  acts: [
    {
      id: "nd_act1",
      label: "Act One",
      title: "Last Order",
      tagline: "The diner closes at three. She closed it at 2:51.",
      startSceneId: "nd_credits",
      titleCardSeconds: 0,
    },
    {
      id: "nd_act2",
      label: "Act Two",
      title: "The 3 A.M. Ledger",
      tagline: "The rain does its best impression of innocence.",
      startSceneId: "nd_street",
      titleCardImage: "/img/bg-nd-street.jpg",
      titleCardSeconds: 3,
    },
  ],

  briefing: {
    objective: "Find out where Mabel Kowalski went — and why her ledger has a hole burned in the middle of it.",
    winConditions: [
      "Close the case with the full file: the photograph and the ledger, stapled.",
      "Hand Ruiz enough to close it — imperfect, but closed.",
    ],
    loseConditions: [
      "Accuse with nothing in your hand.",
      "Let Heat reach 3 — the precinct talks, and it talks about you.",
    ],
    heatLimit: 3,
    heatFailSceneId: "nd_end_folded",
  },

  layout: {
    nd_credits: { x: 0, y: 200 },
    nd_arrive: { x: 400, y: 200 },
    nd_vince: { x: 800, y: 0 },
    nd_kitchen: { x: 800, y: 200 },
    nd_freezer: { x: 1200, y: 80 },
    nd_backroom: { x: 1200, y: 320 },
    nd_porch: { x: 1200, y: 560 },
    nd_street: { x: 1600, y: 400 },
    nd_accuse: { x: 2000, y: 400 },
    nd_end_gold: { x: 2400, y: 120 },
    nd_end_silver: { x: 2400, y: 320 },
    nd_end_protected: { x: 2400, y: 520 },
    nd_end_blown: { x: 2400, y: 720 },
    nd_end_folded: { x: 2000, y: 760 },
  },

  scenes: [
    /* ============================================================ */
    /*  CREDITS                                                     */
    /* ============================================================ */
    {
      id: "nd_credits",
      title: "Opening Credits",
      nodeType: "credits",
      background: "/img/bg-nd-street.jpg",
      ambientAudio: "rain",
      particles: "rain",
      letterbox: true,
      prose: "Rain on the sign.",
      credits: {
        title: "THE NEON DINER",
        subtitle: "A short case in two acts",
        lines: [
          { role: "Written for", name: "the engine test kitchen" },
          { role: "Directed by", name: "Studio & the diner" },
          { role: "Starring", name: "you, the rain, and a jukebox" },
        ],
        font: "poster",
        style: "fade-up",
        titleEntrance: "slam",
        accentColor: "#ff2e88",
        gateWeave: "subtle",
      },
      autoAdvanceTargetSceneId: "nd_arrive",
      autoAdvanceDelaySeconds: 5,
    },

    /* ============================================================ */
    /*  ACT ONE — Last Order                                        */
    /* ============================================================ */
    {
      id: "nd_arrive",
      title: "The Hall",
      background: "/img/bg-nd-interior.jpg",
      ambientAudio: "rain",
      cinematic: { mode: "dolly", dollyDirection: "right", dollyDuration: 10 },
      prose:
        "The Neon Diner, 3:12 a.m. Rain writes its name on the glass and erases it. Inside: the coat by the door, still warm at the shoulders. The grill under the glass, still hot. The jukebox dead mid-song — and in booth four, a man in a grey coat who has been watching the door all night.",
      dialogueBeats: [
        {
          id: "nd_a1",
          characterId: "narrator",
          text: "Mabel Kowalski works the last shift of her life and doesn't show up to it. That's the kind of thing that only happens to somebody who's about to be somebody's problem.",
        },
        {
          id: "nd_a2",
          characterId: "narrator",
          text: "The police call it a disappearance. The sign outside disagrees. The sign says DINER — and DINER doesn't close.",
        },
      ],
      hotspots: [
        {
          id: "nd_h_coat",
          label: "The coat on the hook",
          bounds: { x: 2, y: 18, w: 16, h: 36 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Mabel's coat on its hook by the door. Still warm at the shoulders. Whatever happened, it happened close." },
        },
        {
          id: "nd_h_jukebox",
          label: "The jukebox",
          bounds: { x: 78, y: 28, w: 19, h: 38 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "The jukebox died mid-song. Nobody kills a jukebox. It just stops — like the rest of the night." },
        },
        {
          id: "nd_h_counter",
          label: "The counter",
          bounds: { x: 36, y: 30, w: 32, h: 24 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Two coffees on the counter. One untouched, one cold. Mabel drank the cold one." },
        },
      ],
      choices: [
        { id: "nd_c_booth", text: "Booth four. The man in the grey coat.", targetSceneId: "nd_vince", attitudeTag: "Neutral" },
        { id: "nd_c_station", text: "The counter — her last order.", targetSceneId: "nd_station", attitudeTag: "Clever" },
        { id: "nd_c_kitchen", text: "The kitchen. The grill is still warm.", targetSceneId: "nd_kitchen", attitudeTag: "Neutral" },
        { id: "nd_c_porch", text: "Step out into the rain.", targetSceneId: "nd_porch", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "nd_vince",
      title: "Booth Four",
      note: "Interrogation: composure 3, crack at trust ≥ −1. Warm first — the soft ask is +1 trust and carries the threshold. Pressing cold (no warm-up) clamps him and bounces +2 Heat. The photo press needs trust 1 and sets trusted_vince (the protect-Moreau ending).",
      background: "/img/bg-nd-interior.jpg",
      ambientAudio: "rain",
      cinematic: { mode: "zoom-hold", focalPoint: "72% 42%", zoomDuration: 8 },
      prose:
        "Vince Moreau. Booth four, coffee untouched, fedora off for once — you can see the worry lines when the neon goes through the window. A man who has been in this booth so long the vinyl knows his shape.",
      dialogueBeats: [
        {
          id: "nd_v1",
          characterId: "vince",
          text: "Booth four. I was here when the sign went out, and I'm still here because the coffee gets cold fast and the night's long.",
        },
        {
          id: "nd_v2",
          characterId: "vince",
          text: "You're either new or you've come about the cook. The rain says it's the cook.",
        },
        // Gated answers — they sit AFTER the plain beats so they unlock
        // mid-scene as the player's replies change the world state.
        {
          id: "nd_v3",
          characterId: "vince",
          text: "…",
          conditionRule: { requiresMemories: ["asked_mabel"] },
          recalls: {
            asked_mabel: "“{said}” — that's what she asked me, three nights ago. I told her the truth. That's the problem with Mabel. She only ever wanted the truth.",
          },
        },
        {
          id: "nd_v4",
          characterId: "vince",
          text: "…",
          conditionRule: { requiresMemories: ["heard_the_knock"] },
          recalls: {
            heard_the_knock: "Someone knocked at the back door while you were in there, and you let it pass — {said}. Mabel answered every knock. Even the ones she was afraid of. That's the night I stopped coming in to say goodnight.",
          },
        },
        {
          id: "nd_v5",
          characterId: "vince",
          text: "…",
          conditionRule: { requiresMemories: ["trusted_vince"] },
          recalls: {
            trusted_vince: "You showed me the photograph. You don't show a photograph to a man in booth four unless you're ready for what it means. It means I'm not the one who left. It means somebody made me into the one who left.",
          },
        },
      ],
      choices: [
        {
          id: "nd_v_ask",
          text: "What's the one thing about Mabel you don't tell people?",
          targetSceneId: "",
          reply: true,
          attitudeTag: "Neutral",
          memoryLog: "asked_mabel",
          exclusiveGroup: "first_question",
          consequences: { trustChanges: [{ characterId: "vince", delta: 1 }] },
        },
        {
          id: "nd_v_silent",
          text: "Say nothing. Let the booth hold its silence.",
          targetSceneId: "",
          reply: true,
          attitudeTag: "Neutral",
          exclusiveGroup: "first_question",
          consequences: { trustChanges: [{ characterId: "vince", delta: -1 }] },
        },
        {
          id: "nd_v_threat",
          text: "I want to know what you saw, and I want it before the sign burns out.",
          targetSceneId: "",
          reply: true,
          attitudeTag: "Aggressive",
          consequences: {
            setFlags: ["pressed_vince"],
            meterChanges: [{ meter: "Suspicion", delta: 1 }],
            trustChanges: [{ characterId: "vince", delta: -1 }],
          },
        },
        // PRESS 2 — steady pressure, no trust cost. The soft hammer.
        {
          id: "nd_v_press2",
          text: "Lean across the booth. \"The coat's still warm. You were last in. Talk.\"",
          targetSceneId: "",
          reply: true,
          attitudeTag: "Aggressive",
          consequences: {
            meterChanges: [{ meter: "Suspicion", delta: 1 }],
          },
        },
        // PRESS 3 — the hard one. Costs trust; press cold and it helps push
        // him under the crack threshold.
        {
          id: "nd_v_press3",
          text: "Slide the case file across the table. \"I can make this a very long night.\"",
          targetSceneId: "",
          reply: true,
          attitudeTag: "Aggressive",
          consequences: {
            meterChanges: [{ meter: "Suspicion", delta: 1 }],
            trustChanges: [{ characterId: "vince", delta: -1 }],
          },
        },
        {
          id: "nd_v_photo",
          text: "Show him the photograph.",
          targetSceneId: "",
          reply: true,
          attitudeTag: "Sultry",
          hidden: true,
          // The present-item verb owns the "you must hold it" rule (and keeps
          // this hidden choice hidden until you do); trust + not-pressed stay
          // authored gates.
          presentItem: "photo",
          gating: { minTrust: { vince: 1 }, excludesFlags: ["pressed_vince"] },
          consequences: {
            setFlags: ["trusted_vince"],
            trustChanges: [{ characterId: "vince", delta: 1 }],
          },
        },
        { id: "nd_v_leave", text: "Leave the booth.", targetSceneId: "nd_arrive", attitudeTag: "Neutral" },
      ],
      // INTERROGATION — the risk/reward core of the case. Composure 3; the
      // presses are the four attitude-tagged replies above (photo, press2,
      // threat, press3) plus the soft ask is neutral (no chip). Warm path:
      // ask (+1 trust) then press to zero → trust ≥ 0 → CRACK. Cold path:
      // press without warming → trust < 0 → CLAMP (heat +2 backfire).
      interrogation: {
        characterId: "vince",
        composure: 3,
        // -1, not 0: the three plain presses cost 2 trust between them
        // (press3 −1, threat −1, press2 0), so "ask (+1) then press to zero"
        // lands at −1 — the advertised warm path clamped at threshold 0.
        // At −1 one warm-up cancels one harsh press (warm → CRACK) while
        // pressing cold (no ask) still lands ≤ −2 (CLAMP, heat backfire).
        crackTrust: -1,
        // Urgency: a 6s window before he steadies (hesitate and you lose a
        // point of composure), and his own escalating reactions as he's wound.
        steadySeconds: 6,
        pressReactions: [
          "He goes still, spoon halfway to the cup.",
          "His jaw tightens. The spoon stops.",
          "His eyes flick to the door, then back, harder.",
        ],
        brokeBeat: {
          id: "nd_v_broke",
          characterId: "vince",
          expression: "broke — eyes on you, hands flat",
          text: "…Fine. FINE. She was here. Every night — booth four, same hour, and she'd watch the door like it owed her money. Last night she was scared, detective. Scared, and she kept saying the same thing: “If I don't clock in tomorrow, it's because I found out.” She meant it.",
        },
        brokeFlag: "vince_broke",
        brokeConsequences: {
          trustChanges: [{ characterId: "vince", delta: -1 }],
          meterChanges: [{ meter: "Suspicion", delta: 1 }],
        },
        clampedBeat: {
          id: "nd_v_clamp",
          characterId: "vince",
          expression: "shut down — chin tucked, gaze to the floor",
          text: "He goes quiet. The kind of quiet that's a door closing. “I said what I said. You can press all night, detective — this booth don't give up its secrets twice.”",
        },
        clampFlag: "vince_clamped",
        clampConsequences: {
          trustChanges: [{ characterId: "vince", delta: -1 }],
          meterChanges: [{ meter: "Suspicion", delta: 2 }],
        },
      },
    },
    /* INVESTIGATION SCENE — the examine mechanic. The player HOLDS each
       hotspot: the camera zooms in on it, an "EXAMINING" meter fills, and on
       completion the pickup happens (watch, note) or the description shows
       (coffee). Each action sets an examined_* flag, and a narrator beat
       gated on that flag explains the find. The background is a large,
       detailed plate on purpose — the zoom is a CSS magnification. */
    {
      id: "nd_station",
      title: "Mabel's Station",
      background: "/img/bg-nd-station.jpg",
      ambientAudio: "jazz",
      cinematic: { mode: "static", dimAmount: 0.12 },
      prose:
        "Her station. A cold coffee, a watch, a folded note — a last order no one came back to finish. The neon buzzes through the rain-streaked glass, pink and patient. Hold a thing to examine it close: the camera will come to you.",
      dialogueBeats: [
        {
          id: "nd_sb_coffee",
          characterId: "narrator",
          conditionRule: { requiresFlags: ["examined_coffee"] },
          text: "The coffee. Cold — hours cold — and untouched past the first sip. She sat at her own station and waited for something that never came.",
        },
        {
          id: "nd_sb_watch",
          characterId: "narrator",
          conditionRule: { requiresFlags: ["examined_watch"] },
          text: "Mabel's watch. Stopped at 3:47 — eleven minutes after her last order. The strap is unfastened. She took it off on purpose, and whatever came for her was fast.",
        },
        {
          id: "nd_sb_note",
          characterId: "narrator",
          conditionRule: { requiresFlags: ["examined_note"] },
          text: "A folded note in Mabel's hand: “If I don't clock in, it's because I found out. — M.” She knew something was coming. She was trying to tell someone.",
        },
      ],
      hotspots: [
        {
          id: "nd_s_note",
          label: "The folded note",
          bounds: { x: 5, y: 50, w: 23, h: 22 },
          cursor: "take",
          isRepeatable: false,
          examine: true,
          examineSeconds: 2.5,
          action: { type: "giveItem", itemGranted: "mabel_note", flagSet: "examined_note" },
        },
        {
          id: "nd_s_coffee",
          label: "The cold coffee",
          bounds: { x: 26, y: 40, w: 11, h: 22 },
          cursor: "look",
          isRepeatable: false,
          examine: true,
          examineSeconds: 2,
          action: {
            type: "showText",
            text: "One sip's worth. The paper cup is dented where her thumb was. She came in, sat, and waited.",
            flagSet: "examined_coffee",
          },
        },
        {
          id: "nd_s_watch",
          label: "The wristwatch",
          bounds: { x: 30, y: 58, w: 20, h: 16 },
          cursor: "take",
          isRepeatable: false,
          examine: true,
          examineSeconds: 3,
          action: { type: "giveItem", itemGranted: "mabel_watch", flagSet: "examined_watch" },
        },
      ],
      choices: [
        { id: "nd_s_back", text: "Back to the diner.", targetSceneId: "nd_arrive", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "nd_kitchen",
      title: "The Kitchen",
      background: "/img/bg-nd-interior.jpg",
      ambientAudio: "jazz",
      cinematic: {
        mode: "static",
        lights: [{ x: 55, y: 10, color: "#e8b23c", size: 34, intensity: 0.55, pulseSeconds: 3.4 }],
      },
      prose:
        "The kitchen smells like burnt sugar and hot metal. The grill holds its heat like a secret. Mabel kept her life in plain sight: the daybook, the coffee tins, the register drawer hanging half open, like it was closed in a hurry.",
      dialogueBeats: [
        {
          id: "nd_k1",
          characterId: "narrator",
          text: "The photograph is in the drawer where the light reaches it. Not hidden. Placed — the way you place a thing you want someone to find, and the way you place a thing you want to be missed.",
        },
      ],
      hotspots: [
        {
          id: "nd_k_photo",
          label: "Drawer, half open",
          bounds: { x: 28, y: 34, w: 28, h: 26 },
          cursor: "take",
          isRepeatable: false,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "photo" },
        },
        {
          id: "nd_k_key",
          label: "A hook under the register",
          bounds: { x: 60, y: 40, w: 16, h: 22 },
          cursor: "take",
          isRepeatable: false,
          action: { type: "giveItem", itemGranted: "key" },
        },
        {
          id: "nd_k_freezer",
          label: "Walk-in freezer",
          bounds: { x: 82, y: 28, w: 15, h: 46 },
          cursor: "go",
          isRepeatable: true,
          gating: { requiresItems: ["key"] },
          action: { type: "goToScene", targetSceneId: "nd_freezer" },
          customFailMessage: "The freezer door is locked. The key is on a hook under the register.",
        },
        {
          id: "nd_k_backroom",
          label: "Back room door",
          bounds: { x: 5, y: 38, w: 20, h: 34 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "nd_backroom" },
        },
      ],
      // Doors are hotspots — the act-membership walk follows scene-moving
      // hotspot edges, so the freezer/back room stay on the end-of-act
      // RouteMap even though only a hotspot reaches them.
      choices: [{ id: "nd_k_back", text: "Back to the hall.", targetSceneId: "nd_arrive", attitudeTag: "Neutral" }],
    },
    {
      id: "nd_freezer",
      title: "The Walk-In",
      background: "gradient:linear-gradient(160deg,#05070d 0%,#0b1420 60%,#04050a 100%)",
      ambientAudio: "drone",
      particles: "none",
      letterbox: true,
      cinematic: { mode: "static", dimAmount: 0.5 },
      onEnterActions: [{ consequences: { setFlags: ["searched_freezer"] } }],
      prose:
        "The freezer is a blue-white tomb. The light buzzes at the door like it's about to say something and won't. The ice has built up on the shelves in the shape of the shelves — except in one place, where somebody stood for a long time and let the cold keep them company.",
      dialogueBeats: [
        {
          id: "nd_f1",
          characterId: "mabel",
          expression: "voicemail · 2:51 a.m.",
          text: "Mabel? If you hear this — the numbers in the ledger are the real ones. The rest is true, that's what I kept. Don't let Ruiz read them. Don't let anyone read them. Mabel.",
        },
      ],
      hotspots: [
        {
          id: "nd_f_ice",
          label: "A crack in the ice",
          bounds: { x: 34, y: 30, w: 32, h: 36 },
          cursor: "take",
          isRepeatable: false,
          showItemImage: true,
          // Carries the Clever point the exit choice used to (see nd_f_out):
          // a one-shot zone can't be farmed, so the reward is safe here.
          action: { type: "giveItem", itemGranted: "burner", meterChange: { meter: "Clever", delta: 1 } },
        },
      ],
      choices: [
        {
          id: "nd_f_out",
          // The freezer is re-enterable from the kitchen, so its only exit
          // MUST repeat. A choice carrying consequences is one-shot by
          // default (so meters can't be farmed by looping a scene), which
          // left the room with no way out on a second visit — a softlock the
          // playthrough bot hit in ~10% of runs. The Clever point is a
          // first-visit reward, so it moves onto the ice hotspot (already
          // one-shot) and the exit becomes pure, repeatable navigation.
          isRepeatable: true,
          text: "Out. The cold is in your teeth now.",
          targetSceneId: "nd_kitchen",
          attitudeTag: "Clever",
        },
      ],
    },
    {
      id: "nd_backroom",
      title: "The Back Room",
      background: "/img/bg-nd-backroom.jpg",
      ambientAudio: "tension",
      particles: "none",
      cinematic: {
        mode: "static",
        dimAmount: 0.35,
        lights: [{ x: 50, y: 8, color: "#e8b23c", size: 24, intensity: 0.5, pulseSeconds: 2.2 }],
      },
      onEnterActions: [{ consequences: { setFlags: ["backroom_searched"] } }],
      prose:
        "The back room is a coffin with a desk. A bare bulb over the ledger. The hole in the middle of it is the size of a fist and the color of a matchhead — burned, not torn. Somebody wanted the numbers gone and the book kept.",
      dialogueBeats: [
        {
          id: "nd_b1",
          characterId: "narrator",
          text: "On the corkboard, string and paper: the diner's life pinned up like a crime scene. It is a crime scene. Mabel just did it with a pushpin.",
        },
      ],
      hotspots: [
        {
          id: "nd_b_puzzle",
          label: "The ledger on the desk",
          bounds: { x: 30, y: 38, w: 42, h: 46 },
          cursor: "use",
          isRepeatable: false,
          action: {
            type: "patternPuzzle",
            patternPuzzle: {
              title: "Mabel's Ledger",
              instruction: "Three of these entries were written by someone else. Flag them.",
              rows: [
                { id: "nd_r1", date: "Nov 3", description: "R. Moreau — cash, coins only", amount: "-$400", isAnswer: true },
                { id: "nd_r2", date: "Nov 4", description: "M. Kowalski — house, regulars' tab", amount: "-$120", isAnswer: false },
                { id: "nd_r3", date: "Nov 5", description: "Unmarked — cash, no change needed", amount: "-$900", isAnswer: true },
                { id: "nd_r4", date: "Nov 6", description: "R. Moreau — cash, coins only", amount: "-$400", isAnswer: true },
                { id: "nd_r5", date: "Nov 7", description: "L. Dumas — night shift, janitorial", amount: "-$80", isAnswer: false },
              ],
              targetCount: 3,
              payoffText:
                "Three entries. Same hand, different days — a page that writes itself. Mabel had it circled in red. Whoever burned this page knew exactly which three.",
              allowRetry: false,
              wrongMessage: "Those entries are Mabel's own hand — look again.",
              rewardConsequences: {
                addItems: ["ledger"],
                setFlags: ["ledger_page"],
                meterChanges: [{ meter: "Clever", delta: 1 }],
              },
              wrongSubmissionConsequences: {
                setFlags: ["ledger_ruined"],
                meterChanges: [{ meter: "Suspicion", delta: 1 }],
              },
            },
          },
        },
        {
          id: "nd_b_board",
          label: "The corkboard",
          bounds: { x: 5, y: 18, w: 24, h: 42 },
          cursor: "talk",
          isRepeatable: true,
          action: { type: "openBoard" },
        },
      ],
      choices: [
        {
          id: "nd_b_door_qte",
          text: "Answer the door!",
          targetSceneId: "nd_arrive",
          attitudeTag: "Neutral",
          quickTime: true,
          timeLimitSeconds: 5,
          qtePrompt: "SOMEONE'S AT THE DOOR",
          qteHeartbeat: true,
          qteShakyCam: true,
          timedOutTargetSceneId: "nd_arrive",
          consequences: { setFlags: ["answered_door"] },
          timedOutConsequences: {
            setFlags: ["heard_the_knock"],
            meterChanges: [{ meter: "Suspicion", delta: 1 }],
          },
          isRepeatable: false,
        },
        {
          id: "nd_b_cabinet",
          text: "Rip the filing cabinet open.",
          targetSceneId: "",
          reply: true,
          attitudeTag: "Clever",
          consequences: {
            addItems: ["bus_pass"],
            setFlags: ["cabinet_ripped"],
            meterChanges: [{ meter: "Clever", delta: 1 }],
          },
        },
        { id: "nd_b_back", text: "Back to the kitchen.", targetSceneId: "nd_kitchen", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "nd_porch",
      title: "The Porch",
      note: "Leaving here runs the act-boundary interstitial: Act One route map → Act Two title card. (The part-break flowchart is suppressed at the boundary — the act map supersedes it.)",
      partBreak: "Part One — Last Order",
      background: "/img/bg-nd-street.jpg",
      ambientAudio: "rain",
      particles: "rain",
      letterbox: true,
      cinematic: { mode: "pan", panDistance: 8, panDirection: "right" },
      prose:
        "You step out. The rain closes behind you like a curtain, and the neon smears the street in pink. Somewhere inside, the jukebox plays the last four bars of a song nobody's dancing to.",
      dialogueBeats: [
        {
          id: "nd_p1",
          characterId: "narrator",
          text: "The unmarked car is parked against the curb, engine running, headlights off. It's been here a long time. The rain hasn't washed the shine off it.",
        },
      ],
      autoAdvanceTargetSceneId: "nd_street",
      autoAdvanceDelaySeconds: 4,
      autoAdvanceHideTimer: true,
    },
    /* ============================================================ */
    /*  ACT TWO — The 3 A.M. Ledger                                 */
    /* ============================================================ */
    {
      id: "nd_street",
      title: "The Unmarked Car",
      background: "/img/bg-nd-street.jpg",
      ambientAudio: "rain",
      particles: "rain",
      letterbox: true,
      cinematic: {
        mode: "pan",
        panDistance: 10,
        panDirection: "left",
        lights: [{ x: 22, y: 16, color: "#ff2e88", size: 30, intensity: 0.4, pulseSeconds: 4 }],
      },
      prose:
        "Detective Ruiz stands under the awning like he owns the rain, which he might — the precinct and the street have a long, complicated relationship, and the diner is in the middle of it.",
      dialogueBeats: [
        {
          id: "nd_s1",
          characterId: "ruiz",
          text: "Three-twelve in the morning and the cook's coat is still warm. I like that detail. It means she left in a hurry, or she was taken out of one. Which is it, detective?",
        },
        // Flag-keyed "Remembers" gates: these fire on FLAGS, not memory tags.
        {
          id: "nd_s2",
          characterId: "ruiz",
          text: "…",
          conditionRule: { requiresMemories: ["trusted_vince"] },
          recalls: {
            trusted_vince: "I watched you show Moreau the photograph. From the window. Don't pretend I wasn't there — I was the one who made sure the window was clean.",
          },
        },
        {
          id: "nd_s3",
          characterId: "ruiz",
          text: "…",
          conditionRule: { requiresMemories: ["pressed_vince"] },
          recalls: {
            pressed_vince: "You scared the witness. That's two strikes, and I'm the only one keeping score.",
          },
        },
        // Item-keyed recall: fires because the player PRESENTED the photo
        // (the present-item verb recorded `item:photo`); {said} = the item
        // name. A gate on a thing you did with an object, not a flag you set.
        {
          id: "nd_s4",
          characterId: "ruiz",
          text: "…",
          conditionRule: { requiresMemories: ["item:photo"] },
          recalls: {
            "item:photo": "So that's the {said}. I've seen it in the file, but I never expected it to come back out of the diner. Files have a way of agreeing with whoever opens them. Yours just opened with a different hand.",
          },
        },
        // Cross-link from the investigation scene: finding Mabel's note pays
        // off here in Act Two.
        {
          id: "nd_s5",
          characterId: "ruiz",
          conditionRule: { requiresFlags: ["examined_note"] },
          text: "So you've read the note. “If I don't clock in…” I've seen notes like that. It's how you know the writer meant it. Keep that paper, detective — it's the only honest thing on that counter.",
        },
      ],
      choices: [
        { id: "nd_s_in", text: "Into the diner. Let's finish this.", targetSceneId: "nd_accuse", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "nd_accuse",
      title: "The Counter",
      background: "/img/bg-nd-interior.jpg",
      ambientAudio: "tension",
      letterbox: true,
      cinematic: { mode: "dolly-zoom", dollyZoomDirection: "push", dollyZoomDuration: 9 },
      prose:
        "3:40 a.m. The sign outside has stopped buzzing — either it's giving up or it's listening. Ruiz sets his notebook on the counter like a body. Mabel's cold coffee is still there, keeping its shape.",
      dialogueBeats: [
        {
          id: "nd_ac1",
          characterId: "ruiz",
          text: "Well? What do we have? I don't do the rain, detective. I do the paper.",
        },
        {
          id: "nd_ac2",
          characterId: "ruiz",
          text: "…",
          background: "/img/bg-nd-street.jpg",
          backgroundTransition: "fade",
          backgroundTransitionSpeed: 0.8,
          cinematic: { mode: "pan", panDistance: 6, panDirection: "right" },
          recalls: {
            saw_the_threads: "Outside, the rain does its best impression of innocence. I've seen that rain in eleven years. It never meant a thing.",
          },
        },
        {
          id: "nd_ac3",
          characterId: "ruiz",
          text: "…",
          conditionRule: { requiresFlags: ["saw_the_threads"] },
          recalls: {
            saw_the_threads: "…that ledger number. I didn't write that page. Nobody at the precinct wrote that page. So whose ledger is it, detective?",
          },
        },
      ],
      choices: [
        {
          id: "nd_ac_threads",
          text: "Lay out the contradictions. Slowly.",
          targetSceneId: "",
          reply: true,
          attitudeTag: "Clever",
          gating: { minMeters: { Clever: 2 } },
          consequences: {
            setFlags: ["saw_the_threads"],
            meterChanges: [{ meter: "Clever", delta: 1 }],
          },
        },
        {
          id: "nd_ac_gold",
          text: "Hand over the case file.",
          targetSceneId: "nd_end_gold",
          attitudeTag: "Clever",
          // The evidence physically leaves your satchel — and, because the
          // present verb owns the holding rule, this choice also locks
          // naturally if you never built the file.
          presentItem: "proof",
          consumePresentedItem: true,
          rememberLine: "Ruiz reads it twice. The second time, he reads it slowly.",
        },
        {
          id: "nd_ac_silver",
          text: "Hand over the ledger.",
          targetSceneId: "nd_end_silver",
          attitudeTag: "Neutral",
          presentItem: "ledger",
          consumePresentedItem: true,
        },
        {
          id: "nd_ac_protect",
          text: "Protect Moreau. Take the fall.",
          targetSceneId: "nd_end_protected",
          attitudeTag: "Aggressive",
          gating: { requiresFlags: ["trusted_vince"] },
        },
        {
          id: "nd_ac_silence",
          text: "Say nothing.",
          targetSceneId: "nd_end_blown",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ============================================================ */
    /*  ENDINGS                                                     */
    /* ============================================================ */
    {
      id: "nd_end_gold",
      title: "The Case File",
      background: "/img/bg-nd-interior.jpg",
      letterbox: true,
      ambientAudio: "jazz",
            prose: "The case file goes into Ruiz's coat. The diner lights come up, one by one, like the night is apologising.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "THE CASE FILE",
        recap:
          "You hand Ruiz the case file — the photograph and the ledger, stapled, every forged entry in the burned page. Ruiz reads it twice; the second time he reads it slowly, the way you read a death warrant. Booth four is empty by dawn. The sign burns out at 4:00 a.m., and for the first time in eleven years, the diner closes on time.",
      },
    },
    {
      id: "nd_end_silver",
      title: "A Partial Truth",
      background: "/img/bg-nd-street.jpg",
      letterbox: true,
      ambientAudio: "rain",
            prose: "Ruiz drives off with half a truth, and the rain keeps the other half.",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "A PARTIAL TRUTH",
        recap:
          "The ledger is enough to open the file and not enough to close it. Ruiz takes it, and he takes your name off the door. Some nights, truth arrives in pieces. You keep the cold coffee as evidence. It testifies better than you would.",
      },
    },
    {
      id: "nd_end_protected",
      title: "The Fall Guy",
      background: "/img/bg-nd-street.jpg",
      letterbox: true,
      ambientAudio: "rain",
            prose: "Booth four is empty by dawn. The coffee in it is still warm.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "THE FALL GUY",
        recap:
          "You take the fall and you do it well — the rain, the coat, the quiet confidence of a man who has decided what he is. Ruiz doesn't even write it down; he just files you under “diners”. Vince gets out at dawn. He doesn't look at you once. He knows what you did. That's the worst part of it. He's polite about it for the rest of his life.",
      },
    },
    {
      id: "nd_end_blown",
      title: "Accuse the Rain",
      background: "gradient:linear-gradient(160deg,#0c0c14 0%,#2b1030 60%,#05050a 100%)",
      ambientAudio: "tension",
            prose: "The sign keeps buzzing its one bright word into the dark.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "ACCUSE THE RAIN",
        recap:
          "You accuse with nothing in your hand, and the rain takes the rest of the story from you. Ruiz closes the file. Mabel stays a disappearance. The sign keeps buzzing its one bright word into the dark, and nobody inside the diner has ever been able to explain why it stopped when she did.",
      },
    },
    {
      id: "nd_end_folded",
      title: "Folded",
      background: "/img/bg-nd-backroom.jpg",
      ambientAudio: "drone",
            prose: "The bare bulb overhead does its best to be kind. It isn't.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "FOLDED",
        recap:
          "Heat finds you the way rain finds the diner: not all at once, but all of a sudden. The precinct talks, and it talks about you. Ruiz doesn't even sigh. He walks you to the back room, where the ledger is still on the desk, and tells you the book you burned your way through is about to be read by somebody who can't be bribed, scared, or folded. The bare bulb overhead does its best to be kind. It isn't.",
      },
    },
  ],
};
