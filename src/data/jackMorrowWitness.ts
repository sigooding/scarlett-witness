import type { Story } from "../types";
import type { SpriteSheet } from "../game/spriteSheet";

/**
 * JACK MORROW — Part One: "Just Listen"
 * ─────────────────────────────────────────────────────────────────────────
 * A three-part detective game in the Scarlet Reel engine. It plays like
 * Telltale's The Wolf Among Us — conversations under a clock, "…will
 * remember that", trust that opens and closes doors, quick-time action, an
 * end-of-episode reckoning — and it LOOKS like NOBODY'S WITNESS: the film's
 * own plates (public/film/img/…), its midnight-teal grade, and talking
 * sprite portraits of the same cast.
 *
 * The plot is the film's, from src/film/story.json (read only). Part One
 * covers film scenes 1–20: Mara witnessing the killing in the Kanda
 * backstreet → Jack finding her hiding in the Hive's noodle-shop storeroom.
 * See docs/jack-morrow-season-plan.md for the three-part split and for the
 * trust + flags this part hands on to Parts Two and Three.
 *
 * THE RULES THIS CASE KEEPS
 *   · No meters, no attitude tags, no Interrogation mode, no inventory and
 *     no items anywhere — TRUST is the only memory that carries.
 *   · Flags are plain facts: a clue seen, a place visited, a promise made.
 *   · No walkable stage. Every scene is a picture, dialogue, choices and,
 *     where useful, clickable hotspots.
 *   · Every background, sound effect, music track and voice take is the
 *     film's own, referenced by path (never copied, never edited). A take is
 *     used only where this story's line is word-for-word the take's line.
 *
 * Art: public/img/jack-morrow/ — one four-frame talking plate per cast
 * member, sliced with scripts/make-sprite-sheet.mjs. Frame 0 rests, frames
 * 1–3 open the mouth, `talk` cycles [1,2,3,2] at 8fps.
 */

/** A four-frame talking portrait: rest on frame 0, mouth open on 1-2-3. */
const talkSheet = (image: string, frameWidth: number): SpriteSheet => ({
  image,
  frameWidth,
  frameHeight: 768,
  animations: {
    rest: { frames: [0] },
    talk: { frames: [1, 2, 3, 2], fps: 8 },
  },
});

/** The film's grade, on every plate in the case. */
const GRADE = "midnight-teal" as const;

export const JACK_MORROW_WITNESS: Story = {
  id: "jack-morrow-witness",
  title: "Jack Morrow",
  tagline: "A man is shot in a Kanda backstreet. The only witness is already gone.",
  coverImage: "/film/img/s1/01-backstreet.jpg",
  gameKind: "noir-rail",
  seasonTitle: "Jack Morrow",
  startSceneId: "jmw_p_alley",

  /** No satchel in this case: the story keeps no items, so the dock is off. */
  inventoryDisplay: { mode: "hidden" },
  dialogueBox: { hudTheme: GRADE },

  briefing: {
    objective:
      "Find Mara Voss before the men who shot Sakai find her. Every witness in Kanda is deciding whether to talk to you — make them want to.",
    winConditions: [
      "Earn enough of somebody's trust to be told where she is.",
      "Decide what to do with what you learn about her father.",
    ],
    // No Heat and no meters in this case, so "losing" is only ever a matter of
    // who still trusts you when the curtain comes down.
    loseConditions: [
      "Push every witness in Kanda until nobody will open a door for you.",
      "Let Mara run, or let her be found before you have somewhere safer to put her.",
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  CAST                                                                */
  /* ------------------------------------------------------------------ */
  characters: [
    {
      id: "jack",
      name: "Jack",
      role: "Private investigator, second floor, above the railway",
      avatarUrl: "/img/jack-morrow/plates/jm-jack-portrait.png",
      trustMeter: 0,
      voice: { pitch: 0.8, rate: 0.94 },
      talkingSheet: talkSheet("/img/jack-morrow/sprites/jm-jack-talk.png", 484),
      talkingX: 26,
      talkingScale: 1,
      talkingDim: 0.7,
    },
    {
      id: "vera",
      name: "Vera Voss",
      role: "The sister who won't stop calling",
      avatarUrl: "/img/jack-morrow/plates/jm-vera-portrait.png",
      trustMeter: 0,
      voice: { pitch: 1.05, rate: 1.0 },
      talkingSheet: talkSheet("/img/jack-morrow/sprites/jm-vera-talk.png", 342),
      talkingX: 72,
      talkingScale: 1,
      talkingFlip: true,
      talkingDim: 0.7,
    },
    {
      id: "mara",
      name: "Mara Voss",
      role: "The witness",
      avatarUrl: "/img/jack-morrow/plates/jm-mara-portrait.png",
      trustMeter: 0,
      voice: { pitch: 1.1, rate: 1.04 },
      talkingSheet: talkSheet("/img/jack-morrow/sprites/jm-mara-talk.png", 503),
      talkingX: 70,
      talkingScale: 1,
      talkingFlip: true,
      talkingDim: 0.7,
    },
    {
      id: "ishida",
      name: "Detective Ishida",
      role: "Kanda station. Twenty years of favours either way.",
      avatarUrl: "/img/jack-morrow/plates/jm-ishida-portrait.png",
      trustMeter: 0,
      voice: { pitch: 0.85, rate: 0.96 },
      talkingSheet: talkSheet("/img/jack-morrow/sprites/jm-ishida-talk.png", 545),
      talkingX: 71,
      talkingScale: 1,
      talkingFlip: true,
      talkingDim: 0.7,
    },
    {
      id: "okada",
      name: "Okada",
      role: "Owns six stools and a counter in Kanda",
      avatarUrl: "/img/jack-morrow/plates/jm-okada-portrait.png",
      trustMeter: 0,
      voice: { pitch: 0.82, rate: 0.92 },
      talkingSheet: talkSheet("/img/jack-morrow/sprites/jm-okada-talk.png", 378),
      talkingX: 72,
      talkingScale: 1,
      talkingFlip: true,
      talkingDim: 0.7,
    },
    {
      id: "kaneko",
      name: "Kaneko",
      role: "The noodle counter, under the tracks",
      avatarUrl: "/img/jack-morrow/plates/jm-kaneko-portrait.png",
      trustMeter: 0,
      voice: { pitch: 1.0, rate: 0.98 },
      talkingSheet: talkSheet("/img/jack-morrow/sprites/jm-kaneko-talk.png", 483),
      talkingX: 72,
      talkingScale: 1,
      talkingFlip: true,
      talkingDim: 0.7,
    },
    {
      id: "sakai",
      name: "Mr. Sakai",
      role: "Seventy years old, one hand pressed to his side",
      avatarUrl: "/img/jack-morrow/plates/jm-sakai-portrait.png",
      trustMeter: 0,
      voice: { pitch: 0.78, rate: 0.9 },
      talkingSheet: talkSheet("/img/jack-morrow/sprites/jm-sakai-talk.png", 653),
      talkingX: 70,
      talkingScale: 1,
      talkingFlip: true,
      talkingDim: 0.7,
    },
    // Voiced minor parts from the film's prologue — no portrait of their own.
    { id: "jmw_masked", name: "The Masked Man", role: "First position", avatarUrl: "emoji:🎭", trustMeter: 0 },
    { id: "jmw_journalist", name: "The Journalist", role: "A beer gone flat", avatarUrl: "emoji:📰", trustMeter: 0 },
    { id: "jmw_barber", name: "The Barber", role: "Asleep above the doorway", avatarUrl: "emoji:💈", trustMeter: 0 },
  ],

  items: [],

  /* ------------------------------------------------------------------ */
  /*  FLAGS — plain facts, one line each, for the 🏷 Flags tab             */
  /* ------------------------------------------------------------------ */
  flagNotes: {
    jmw_answered_vera: "Mara answered her sister's call at ten to one, and said nothing about Kanda.",
    jmw_declined_vera: "Mara watched her sister's name light up and let it go dark.",
    jmw_sakai_words: "She ran to him, and heard the only thing Sakai said that mattered.",
    jmw_watched_only: "She stayed in the doorway. Whatever he said went into the rain with him.",
    jmw_kept_clip: "She kept the red bird clip. It was still in her hair four nights later.",
    jmw_clip_lost: "She left the red bird clip under a shelf in a bar in Kanda. Somebody with a mop found it.",
    jmw_vera_gentle: "Vera's message had no anger in it at all.",
    jmw_vera_angry: "Vera's message let the anger show.",
    jmw_vera_silent: "Vera hung up without saying anything she meant to say.",
    jmw_ishida_formal: "Vera made Ishida answer her in Japanese. He did, and the answer was a door closing.",
    jmw_ishida_polite: "Vera took the card and the good advice and went home.",
    jmw_vera_card: "Vera is holding a card that says JACK. INVESTIGATIONS. An address. No surname.",
    jmw_asked_photos: "He asked for photographs before he promised anything.",
    jmw_named_price: "Ten thousand yen a day, plus expenses, before she had finished sitting down.",
    jmw_refused_case: "He sent her home first. She came back at the door.",
    jmw_made_her_wait: "He let the train pass and the blinds stop shivering before he spoke at all.",
    jmw_honest_pause: "He let the pause answer 'was she alive,' and Vera heard it.",
    jmw_deflected: "He answered her question with a question about her sister's Japanese.",
    jmw_told_ishida_lead: "He telephoned Ishida at twenty past midnight and told him the Voss girl had come.",
    jmw_kept_from_ishida: "He did not telephone Ishida. Ishida will hear it from somebody else.",
    jmw_clue_sakai_name: "Ishida said 'Sakai. Yes. That Sakai,' and would not say more.",
    jmw_clue_clipping: "AMERICAN INSURANCE INVESTIGATOR FOUND DEAD — POLICE RULE SUICIDE. Daniel Voss, 41.",
    jmw_clue_daniel_photo: "Two men at a tiny noodle counter, laughing: Daniel Voss, and a much younger Jack.",
    jmw_clue_strap: "A twist of torn leather at knee height in the barbershop doorway. Torn, not cut.",
    jmw_clue_one_car_twice: "The barber heard one car. Twice. It left. Then it came back.",
    jmw_clue_sightline: "From the doorway you can see the whole street, and the bar sign at the end of it.",
    jmw_clue_drains: "Everywhere on that street a small thing could fall, and only one of them is a drain.",
    jmw_barber_skipped: "He let the barber sleep. The street had to say it on its own.",
    jmw_clue_fridge: "Milk. A half-eaten cake. Someone who meant to come back for breakfast.",
    jmw_clue_suitcase: "A suitcase packed and zipped under the futon, and a flight booked for next month.",
    jmw_clue_sketchbook: "Page after page of the same tiny noodle counter under a railway, drawn for twenty years.",
    jmw_clue_wall: "A wall of drawings, and the story behind them: the last things Vera said to her sister.",
    jmw_comforted_vera: "He told her runners don't pack, and her sister wasn't running from her.",
    jmw_probed_dad: "He made Vera say out loud what happened to her father.",
    jmw_said_nothing_vera: "He let her stand in her sister's room and say it all to the wall.",
    jmw_leads_open: "He has two roads out of his sister's flat and he can only walk one first. (The travel map's pins read this; the Check panel does not count map gating as a reader.)",
    jmw_took_case: "He took it: ten thousand yen a day, and a promise he has not written down anywhere.",
    jmw_okada_asked: "In Okada's doorway he asked the old man what he saw, and made him say it out loud.",
    jmw_okada_bowed: "He bowed, took the card, and asked Okada nothing at all.",
    jmw_okada_polite: "He thanked Okada for the card and let the rest of it go. The bar's own memory stays shut.",
    jmw_okada_silent: "He stood in a closed bar and said nothing at all, and let a man with a mop finish his floor.",
    jmw_clue_notebook_old: "His own police notebook, twenty years old: three interviews, two names, and one line underlined twice.",
    jmw_okada_gentle: "He asked Okada about the man at the far stool, and Okada gave him the page.",
    jmw_okada_named: "Okada named the men at the end of his counter, having already been hit for it.",
    jmw_okada_closed: "Okada closed. Whoever got to him got there first.",
    jmw_okada_drank: "He ordered the drink and said nothing, and Okada talked when he could.",
    jmw_clue_notebook: "A page torn from a dead journalist's notebook: 1.00 — SAKAI — 'just listen'.",
    jmw_bar_done: "He has been to Okada's.",
    jmw_hive_done: "He has been inside the Hive.",
    jmw_bar_first: "He went to the bar first. The Hive knew he was coming by the time he walked to it.",
    jmw_hive_first: "He went to the Hive first, and Okada had an hour alone with his own thoughts.",
    jmw_slipped_in: "He got into the Hive without anybody writing his name down.",
    jmw_hive_noticed: "Somebody in the Hive saw him come in.",
    jmw_kaneko_ate: "He ate every mouthful she gave him and paid too much for it.",
    jmw_kaneko_pushed: "He pushed an old woman in her own shop. She has not forgotten it.",
    jmw_kaneko_paid: "He paid more than the bowl cost and left his card on top of it.",
    jmw_kaneko_cold: "He let the silence go on until she stopped looking at him.",
    jmw_vera_stayed: "He let her sit in the car in the rain and wait with him.",
    jmw_vera_sent_home: "He sent her home out of the rain. The lane was colder for it.",
    jmw_told_vera_alive: "He told Vera her sister might be alive, before he had proof, because she asked him to.",
    jmw_held_it_back: "He let the moment pass and told Vera nothing.",
    jmw_watcher_plate: "He wrote down the plate of the car that sat at the road end and did not start.",
    jmw_plate_missed: "He put his head down instead of writing the number down. It is gone now.",
    jmw_told_vera_letter: "He gave Vera her own letter, and with it the reason her sister went to Kanda.",
    jmw_kept_letter: "He kept Sakai's letter. She has not read her own name on the envelope.",
    jmw_burned_letter: "He burned it. Somebody had already died carrying it.",
    jmw_caught_her: "He caught her hand before she reached the curtain.",
    jmw_blocked_door: "He stood between her and the door and let them see only him.",
    jmw_mara_bolted: "He let go of her hand.",
    jmw_key_seen: "She showed him the brass key and its tag: 114.",
    jmw_promised_mara: "He gave her his word that Vera would not be told where she is.",
    jmw_mara_half: "One night. Then they talk about telling her.",
    jmw_mara_gone: "She is through the curtain and into the passages, and he is holding nothing.",
    jmw_out_promise: "ENDING — she believes him, and hands him the number.",
    jmw_out_flour: "ENDING — she accepts the night and nothing else.",
    jmw_out_bolt: "ENDING — the curtain, and shoes on the Hive stairs.",
    // A bookkeeping flag: it only exists so the storeroom cannot be left
    // before he answers her. It still shows in the journal, so it gets a
    // line that reads as a line.
    jmw_pledge_made: "He answered her. Everything after this is the shape of the answer he gave.",
  },

  /* ------------------------------------------------------------------ */
  /*  THE TRAVEL MAP — where to go next, and in what order                */
  /*  Four pins, but never more than two at once: the place you leave for
      later becomes a different place by the time you get there.          */
  /* ------------------------------------------------------------------ */
  map: {
    title: "Kanda — Where To",
    backgroundImage: "/film/img/s1/383-the-empty-lane.jpg",
    locations: [
      {
        id: "jmw_loc_bar",
        label: "Okada's Bar",
        targetSceneId: "jmw_bar",
        x: 16, y: 28, icon: "🍶",
        gating: { requiresFlags: ["jmw_leads_open"], excludesFlags: ["jmw_bar_done", "jmw_hive_done"] },
        lockedHint: "Somebody in Kanda knows what happened behind that counter.",
      },
      {
        id: "jmw_loc_hive",
        label: "The Hive",
        targetSceneId: "jmw_hive",
        x: 78, y: 66, icon: "🏚",
        gating: { requiresFlags: ["jmw_leads_open"], excludesFlags: ["jmw_hive_done", "jmw_bar_done"] },
        lockedHint: "A tiny noodle counter under a railway. She drew it a hundred times.",
      },
      {
        id: "jmw_loc_hive_late",
        label: "The Hive — after dark",
        targetSceneId: "jmw_hive_late",
        x: 78, y: 66, icon: "🏚",
        gating: { requiresFlags: ["jmw_bar_done"], excludesFlags: ["jmw_hive_done"] },
        lockedHint: "Somebody has been in the service road since Okada's.",
      },
      {
        id: "jmw_loc_bar_late",
        label: "Okada's — last orders",
        targetSceneId: "jmw_bar_late",
        x: 16, y: 28, icon: "🍶",
        gating: { requiresFlags: ["jmw_hive_done"], excludesFlags: ["jmw_bar_done"] },
        lockedHint: "The mat is gone. The stools are down. Two men are sitting at the far end.",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  EPISODE ONE                                                         */
  /* ------------------------------------------------------------------ */
  episodes: [
    {
      id: "jmw_ep1",
      number: 1,
      title: "Just Listen",
      kicker: "Jack Morrow",
      tagline: "Two men are shot in Kanda. The only witness is a girl with a key she can't name.",
      startSceneId: "jmw_p_alley",
      sceneIds: [
        "jmw_p_alley", "jmw_p_shot", "jmw_p_key", "jmw_p_bar",
        "jmw_v_wait", "jmw_station", "jmw_okada",
        "jmw_office", "jmw_box",
        "jmw_backstreet", "jmw_apartment",
        "jmw_bar", "jmw_bar_late", "jmw_hive", "jmw_hive_late",
        "jmw_passage", "jmw_counter",
        "jmw_stakeout", "jmw_letter",
        "jmw_storeroom", "jmw_ledger",
        "jmw_end_promise", "jmw_end_flour", "jmw_end_bolt",
      ],
      titleCardImage: "/film/img/s1/01-backstreet.jpg",
      posterImage: "/film/img/s1/01-backstreet.jpg",
      titleCardSeconds: 2.6,
      nextTimeLines: [
        "A brass key, and a number on a worn tag: 114.",
        "A sister who has not stopped calling, and a detective who has not told her everything.",
        "Next time: what the key opens, and who is already waiting at the lockers.",
      ],
    },
  ],

  scenes: [
    /* ================================================================ *
     *  PROLOGUE — MARA                                                  *
     * ================================================================ */
    {
      id: "jmw_p_alley",
      title: "The Backstreet",
      background: "/film/img/s1/01-backstreet.jpg",
      particles: "rain",
      particleConfig: { density: 1.1, wind: 0.8, opacity: 0.9 },
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "Rain. Not a storm. Just cold, steady, patient rain. A narrow street of shuttered shops. A vending machine hums on the corner. High up, one lit window, a radio playing behind it.",
      dialogueBeats: [
        { id: "jmw_pa_b1", characterId: "narrator", text: "MARA VOSS (24) walks fast, arms folded, soaked, no umbrella. Her phone lights up: VERA. She watches it ring." },
        { id: "jmw_pa_b2", characterId: "mara", text: "Not tonight.", audioUrl: "/film/voice/s1/05-mara-tired-not-tonight.mp3" },
        { id: "jmw_pa_b3", characterId: "narrator", text: "She declines it. The note in her hands. Her handwriting, in biro: 1.00 Sakai. Underneath is an address. Beneath that, underlined twice: \"just listen.\"" },
        { id: "jmw_pa_b4", characterId: "narrator", text: "She looks down the lane. At the far end, the bar sign. She checks her watch: 12.45. Early." },
      ],
      choices: [
        {
          id: "jmw_pa_c_call",
          text: "Call her back. Just say you got in safe.",
          reply: true,
          timeLimitSeconds: 8,
          consequences: { setFlags: ["jmw_answered_vera"] },
          timedOutConsequences: { setFlags: ["jmw_declined_vera"] },
          memoryLog: "mem_call",
        },
        {
          id: "jmw_pa_c_wait",
          text: "Put it away. Twelve forty-five. You're early, that's all.",
          reply: true,
          consequences: { setFlags: ["jmw_declined_vera"] },
          memoryLog: "mem_call",
        },
        {
          id: "jmw_pa_c_lane",
          text: "Walk down to the bar. Get out of the rain.",
          targetSceneId: "jmw_p_shot",
          isRepeatable: true,
        },
      ],
    },

    {
      id: "jmw_p_shot",
      title: "The Doorway",
      background: "/film/img/s1/06-barbershop-doorway.jpg",
      particles: "rain",
      particleConfig: { density: 1.2, wind: 0.9 },
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "The rain thickens. She slips into the barbershop doorway, behind the scooter and the crates, and presses back into the shadow. Somewhere nearby, a pedestrian crossing CHIMES its old melody for an empty intersection. Over and over. No one crosses.",
      dialogueBeats: [
        { id: "jmw_ps_b1", characterId: "narrator", text: "Footsteps. Hurried. Uneven. An OLD MAN (70s) in a cheap raincoat and a grey flat cap comes in from the road, one hand pressed to his side as if something is hidden there. He keeps looking back." },
        { id: "jmw_ps_b2", characterId: "narrator", text: "Mara sees him. Looks at the scrap. She leans out of the shadow. The red bird clip catches the street light. He sees it. He stops, six metres short of her. For one second his whole face changes." },
        { id: "jmw_ps_b3", characterId: "narrator", text: "Then he shakes his head. Barely. A man refusing a stranger. And he turns his back on her, slowly, to face the road." },
        {
          id: "jmw_ps_b4", characterId: "sakai",
          text: "After twenty years.",
          audioUrl: "/film/voice/s1/09-oldman-twenty-years.mp3",
        },
        {
          id: "jmw_ps_b5", characterId: "narrator",
          text: "Behind him, at the mouth of the lane, headlights. A black sedan pulls across the opening and stops, blocking it. Its high beams shine straight down the lane, lighting the rain in long white columns. Two MEN get out and walk in, black silhouettes against the glare. Black clothes. Masks. They don't run.",
        },
        {
          id: "jmw_ps_b6", characterId: "narrator",
          text: "The old man doesn't move. He stands between them and Mara's doorway, a small figure in the white light, his shadow stretching long down the lane toward her. A suppressed SHOT. Flat and ordinary, like a door closing. The old man folds onto the street.",
          sfxUrl: "/film/sfx/smg-burst-suppressed.mp3",
        },
        {
          id: "jmw_ps_b7", characterId: "jmw_masked",
          text: "First position done. Moving to second.",
          audioUrl: "/film/voice/s1/12-maskedman-first-position-done-moving-to-second.mp3",
        },
        {
          id: "jmw_ps_b_kept", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_sakai_words"] },
          text: "Six metres. You close them before you have decided to. His coat is wet through and his cap is somewhere in the road and there is a small brass thing in his hand that he is trying very hard to keep hold of.",
        },
        {
          id: "jmw_ps_b_watched", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_watched_only"] },
          text: "You don't move. You don't breathe. You watch two men walk back to a car that doesn't hurry, and you learn exactly how long a street is when you are standing at the wrong end of it.",
        },
      ],
      choices: [
        {
          // QUICK-TIME 1 — the chase in the rain.
          id: "jmw_ps_c_run",
          text: "Run to him. Now, before they turn round.",
          reply: true,
          quickTime: true,
          timeLimitSeconds: 6,
          qtePrompt: "SIX METRES — GO TO HIM",
          qteHeartbeat: true,
          consequences: { setFlags: ["jmw_sakai_words"] },
          timedOutConsequences: { setFlags: ["jmw_watched_only"] },
        },
        {
          id: "jmw_ps_c_stay",
          text: "Stay in the doorway. Don't move. Don't be a shape in the light.",
          reply: true,
          consequences: { setFlags: ["jmw_watched_only"] },
        },
        {
          id: "jmw_ps_c_key",
          text: "Go to the street. Whatever he was holding, he is still holding it.",
          targetSceneId: "jmw_p_key",
          isRepeatable: true,
        },
      ],
    },

    {
      id: "jmw_p_key",
      title: "Don't Let Them Have It",
      background: "/film/img/s1/16-the-key.jpg",
      particles: "rain",
      particleConfig: { density: 1.3, wind: 1.0 },
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose: "She runs to him. Her bag slides off her shoulder and spills across the wet street. She doesn't notice.",
      dialogueBeats: [
        {
          id: "jmw_pk_b1", characterId: "mara",
          text: "Mr. Sakai?",
          audioUrl: "/film/voice/s1/14-mara-trembling-voice-mr-sakai.mp3",
        },
        {
          id: "jmw_pk_b2", characterId: "mara",
          text: "It's okay — I'll get someone — Ambulance. I'll call. Ambulance.",
          audioUrl: "/film/voice/s1/14-mara-breathless-it-s-okay-i-ll.mp3",
        },
        {
          id: "jmw_pk_b3", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_sakai_words"] },
          text: "His eyes find hers for exactly as long as it takes. His hand comes out of his coat with something small and brass in it. He presses it into her palm and closes her fingers over it.",
        },
        {
          id: "jmw_pk_b3b", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_watched_only"] },
          text: "By the time she reaches him there is nothing left to find but his hand, open, and something small and brass going cold in it. She has to pry the fingers up herself.",
        },
        {
          id: "jmw_pk_b4", characterId: "sakai",
          text: "Don't let them have it.",
          audioUrl: "/film/voice/s1/15-oldman-strained-don-t-let-them-have.mp3",
        },
        {
          id: "jmw_pk_b5", characterId: "mara",
          text: "Have what? I don't —",
          audioUrl: "/film/voice/s1/15-mara-bewildered-have-what-i-don-t.mp3",
        },
        { id: "jmw_pk_b6", characterId: "narrator", text: "He's gone. Rain in his open eyes. In her hand: a small brass key on a stamped number tag. At the other end of the street, the amber glow of a bar. Behind her on the asphalt, her purse, open in the rain." },
      ],
      choices: [
        {
          id: "jmw_pk_c_run",
          text: "Run for the bar. Whatever it is, they came back for it.",
          targetSceneId: "jmw_p_bar",
          isRepeatable: true,
        },
      ],
    },

    {
      id: "jmw_p_bar",
      title: "Second Position",
      background: "/film/img/s2/19-the-bar.jpg",
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "Six stools and a counter. Shelves of bottles glowing amber. On a high shelf, an old CRT television plays a late-night variety show, sound low. Rain drums on the roof. A man in a raincoat on the far stool, a notebook beside a beer gone flat: the JOURNALIST (40s). Nobody behind the counter.",
      dialogueBeats: [
        { id: "jmw_pb_b1", characterId: "narrator", text: "Mara bursts in, the key in her fist." },
        {
          id: "jmw_pb_b2", characterId: "jmw_journalist",
          text: "Miss Voss?",
          audioUrl: "/film/voice/s2/21-journalist-startled-miss-voss.mp3",
        },
        { id: "jmw_pb_b3", characterId: "narrator", text: "He knows her name. Before she can answer, the door opens behind her." },
        {
          id: "jmw_pb_b4", characterId: "jmw_masked",
          text: "Shitsurei shimasu.",
          audioUrl: "/film/voice/s2/25-maskedman-shitsurei-shimasu.mp3",
        },
        {
          id: "jmw_pb_b5", characterId: "jmw_journalist",
          text: "Where is he?",
          audioUrl: "/film/voice/s2/25-journalist-where-is-he.mp3",
        },
        {
          id: "jmw_pb_b6", characterId: "narrator",
          text: "Two shots. On the high shelf, the television audience laughs.",
          sfxUrl: "/film/sfx/door-pounding-shots.mp3",
        },
        {
          id: "jmw_pb_b_kept", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_kept_clip"] },
          text: "She is behind the counter before she knows she's moved. She folds herself into the gap between the crates and the ice bin and doesn't breathe. The clip stays in her hair. He takes one step toward the counter. A voice in his earpiece: one word. He turns and goes.",
        },
        {
          id: "jmw_pb_b_lost", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_clip_lost"] },
          text: "She drops where she stands, behind the crates by the door. A hair clip slides out of her wet hair and skitters under the shelf, and she watches it go and doesn't go after it. He takes one step toward the counter. A voice in his earpiece: one word. He turns and goes.",
        },
        {
          id: "jmw_pb_b7", characterId: "jmw_masked",
          text: "Second position done.",
          audioUrl: "/film/voice/s2/27-maskedman-second-position-done.mp3",
        },
        { id: "jmw_pb_b8", characterId: "narrator", text: "The door swings shut. The television laughs again. Over black: RAIN." },
      ],
      choices: [
        {
          id: "jmw_pb_c_counter",
          text: "Get behind the counter. Between the crates and the ice bin.",
          reply: true,
          consequences: { setFlags: ["jmw_kept_clip"] },
        },
        {
          id: "jmw_pb_c_drop",
          text: "Drop behind the crates where you are. Don't cross the room.",
          reply: true,
          consequences: { setFlags: ["jmw_clip_lost"] },
        },
        {
          id: "jmw_pb_c_out",
          text: "Wait until the street is empty. Then move.",
          targetSceneId: "jmw_v_wait",
          isRepeatable: true,
        },
      ],
    },

    /* ================================================================ *
     *  THREE DAYS LATER — VERA                                          *
     * ================================================================ */
    {
      id: "jmw_v_wait",
      title: "It's Me Again",
      background: "/film/img/s4/36-vera-at-the-table.jpg",
      particles: "rain",
      particleConfig: { density: 0.7, wind: 0.4, opacity: 0.7 },
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "Three days later. Small and tidy. Grey light through rain-streaked glass. Two cups. Hers holds cold tea. The other is empty and clean, set out as though someone is expected. Her phone lies face up in front of her. She calls. Waits.",
      dialogueBeats: [
        { id: "jmw_vw_b1", characterId: "narrator", text: "\"It's Mara. You know what to do.\" BEEP. Vera opens her mouth. For a moment, nothing." },
        {
          id: "jmw_vw_b_gentle", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_vera_gentle"] },
          text: "It's me again. I'm not angry anymore. I wasn't really angry then, either. Whatever that man wants, it doesn't matter. I just — You left your umbrella. You'll get soaked. Just call me. You don't have to say anything. Just call, so I know.",
        },
        {
          id: "jmw_vw_b_angry", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_vera_angry"] },
          text: "It's me again. I know you're listening to these. I know because I would. You left your umbrella and you did it on purpose, and I want it back, and I want you to pick up the phone and tell me you're angry too, because at least then we'd be in the same city.",
        },
        {
          id: "jmw_vw_b_silent", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_vera_silent"] },
          text: "It's me. — No. Sorry. It's me again. Never mind. Call me.",
        },
        { id: "jmw_vw_b2", characterId: "narrator", text: "She hangs up. The old television murmurs to itself: police in Kanda are investigating a double shooting in a small bar in the early hours of Sunday. Two men were killed. Officers say it appears to be a dispute between criminal groups. No arrests have been made. She looks at the umbrella by the door. At the clean, empty cup. At the photograph." },
      ],
      choices: [
        {
          id: "jmw_vw_c_gentle",
          text: "Say it gently. No anger in it at all.",
          reply: true,
          timeLimitSeconds: 8,
          consequences: { setFlags: ["jmw_vera_gentle"] },
          timedOutConsequences: { setFlags: ["jmw_vera_silent"] },
          memoryLog: "mem_message",
        },
        {
          id: "jmw_vw_c_angry",
          text: "Let the anger show. Maybe that's the version she'll answer.",
          reply: true,
          consequences: { setFlags: ["jmw_vera_angry"] },
          memoryLog: "mem_message",
        },
        {
          id: "jmw_vw_c_silent",
          text: "…",
          reply: true,
          consequences: { setFlags: ["jmw_vera_silent"] },
        },
        {
          id: "jmw_vw_c_go",
          text: "Take the blue umbrella. Go and say it to someone who can do something.",
          targetSceneId: "jmw_station",
          isRepeatable: true,
        },
      ],
    },

    {
      id: "jmw_station",
      title: "Two Separate Things",
      background: "/film/img/s6/51-the-interview-room.jpg",
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "Kanda station. Small. A table, two chairs, a box of tissues nobody has touched in years. Rain on a frosted window. DETECTIVE ISHIDA (50s) sets a paper cup of tea in front of Vera. Gentle. Unhurried. Tired, in a way that looks like decency. His English is excellent.",
      dialogueBeats: [
        { id: "jmw_st_b1", characterId: "ishida", text: "You must be cold." },
        { id: "jmw_st_b2", characterId: "vera", text: "I speak Japanese." },
        { id: "jmw_st_b3", characterId: "ishida", text: "Of course. But this is a difficult thing. It is easier in your own language." },
        { id: "jmw_st_b4", characterId: "vera", text: "The officer made a phone call the moment he had my sister's name. Then you came." },
        { id: "jmw_st_b5", characterId: "ishida", text: "A foreign passport. We like to take care with these things." },
        { id: "jmw_st_b6", characterId: "vera", text: "Is she dead?" },
        { id: "jmw_st_b7", characterId: "ishida", text: "We have no reason to believe so." },
        { id: "jmw_st_b8", characterId: "vera", text: "Stop saying that. Stop saying what you have no reason to believe and tell me what you know." },
        { id: "jmw_st_b9", characterId: "narrator", text: "The paper cup crumples in her fist. Hot tea runs over her fingers and onto the table, across the corner of the form. She doesn't seem to feel it." },
        {
          id: "jmw_st_b_formal", characterId: "ishida",
          conditionRule: { requiresFlags: ["jmw_ishida_formal"] },
          text: "I do not know where she is. That is the truth. And if, on the off chance, she did see something she should not have, then the safest place for her is wherever she is now. And the safest thing you can do is nothing.",
        },
        {
          id: "jmw_st_b_polite", characterId: "ishida",
          conditionRule: { requiresFlags: ["jmw_ishida_polite"] },
          text: "Go home, Miss Voss. Keep your phone on. If she calls, call me first. Any hour.",
        },
        { id: "jmw_st_b10", characterId: "narrator", text: "He slides his card across the wet table. She looks at it. Then takes it. Stands. Picks up the blue umbrella. When the door closes behind her, Ishida sits alone a moment and wipes the spilled tea away with a tissue, slowly, until there is no trace of it." },
      ],
      choices: [
        {
          id: "jmw_st_c_push",
          text: "Push him. In Japanese. Every word placed.",
          reply: true,
          timeLimitSeconds: 9,
          consequences: { setFlags: ["jmw_ishida_formal"] },
          timedOutConsequences: { setFlags: ["jmw_ishida_polite"] },
          memoryLog: "mem_station",
        },
        {
          id: "jmw_st_c_cry",
          text: "Let it go. Take the card and go home.",
          reply: true,
          consequences: { setFlags: ["jmw_ishida_polite"] },
          memoryLog: "mem_station",
        },
        {
          id: "jmw_st_c_silent",
          text: "…",
          reply: true,
          consequences: { setFlags: ["jmw_ishida_polite"] },
        },
        {
          id: "jmw_st_c_out",
          text: "There is a bar in Kanda with a mop and a man behind it.",
          targetSceneId: "jmw_okada",
          isRepeatable: true,
        },
      ],
    },

    {
      id: "jmw_okada",
      title: "Not The Police. Him.",
      background: "/film/img/s9/163-behind-the-counter.jpg",
      particles: "rain",
      particleConfig: { density: 0.8, wind: 0.5 },
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose: "Rain. Vera walks away down the narrow street, no umbrella, head down.",
      dialogueBeats: [
        { id: "jmw_ok_b1", characterId: "okada", text: "Miss." },
        { id: "jmw_ok_b2", characterId: "narrator", text: "She turns. Okada stands in the bar doorway holding the blue umbrella, out of breath, as if deciding something cost him more than the walk. He hands it to her." },
        {
          id: "jmw_ok_b_lost", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_clip_lost"] },
          text: "Then he holds out his other hand. In it: the small red enamel bird clip. Vera stops breathing.",
        },
        {
          id: "jmw_ok_b_lost2", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_clip_lost"] },
          text: "It was mine. She took it when we were kids. She never gave it back.",
        },
        {
          id: "jmw_ok_b_kept", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_kept_clip"] },
          text: "He has nothing else in his hands. He looks at the empty doorway for a long moment, then back at her face, and makes up his mind about something.",
        },
        {
          id: "jmw_ok_b_kept2", characterId: "okada",
          conditionRule: { requiresFlags: ["jmw_kept_clip"] },
          text: "Behind the counter. After.",
        },
        { id: "jmw_ok_b3", characterId: "vera", text: "Did you give this to the police?" },
        { id: "jmw_ok_b4", characterId: "okada", text: "They didn't ask." },
        { id: "jmw_ok_b5", characterId: "narrator", text: "He takes a business card from his apron and presses it into her hand. Old, soft at the corners, handwritten on the back." },
        { id: "jmw_ok_b6", characterId: "okada", text: "Not the police. Him." },
        { id: "jmw_ok_b7", characterId: "vera", text: "Who is he?" },
        { id: "jmw_ok_b8", characterId: "okada", text: "He found my daughter once. When no one else would look." },
        { id: "jmw_ok_b9", characterId: "narrator", text: "He goes back inside before she can thank him. Vera looks at the card. Printed in English and in katakana: JACK. INVESTIGATIONS. An address. No surname." },
      ],
      choices: [
        {
          id: "jmw_ok_c_ask",
          text: "Ask him what he saw. Properly. Make him say it out loud.",
          reply: true,
          consequences: { setFlags: ["jmw_okada_asked"] },
        },
        {
          id: "jmw_ok_c_bow",
          text: "Bow. Small and polite. Take the card and go.",
          reply: true,
          consequences: { setFlags: ["jmw_okada_bowed"] },
        },
        {
          id: "jmw_ok_c_silent",
          text: "…",
          reply: true,
        },
        {
          id: "jmw_ok_c_office",
          text: "Second floor of an old building pressed against the elevated railway.",
          targetSceneId: "jmw_office",
          isRepeatable: true,
        },
      ],
    },

    /* ================================================================ *
     *  JACK                                                             *
     * ================================================================ */
    {
      id: "jmw_office",
      title: "Depends Who's Calling",
      onEnterActions: [{ consequences: { setFlags: ["jmw_vera_card"] } }],
      background: "/film/img/s10/164-depends-whos-calling.jpg",
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "Second floor of an old building pressed against the elevated railway. One room. Frosted glass door, JACK hand-lettered on it in English and in katakana. A desk. A black rotary phone. Filing cabinets. A small CRT television on the cabinet, muted, playing an old black-and-white samurai film. A sofa that has clearly been slept on.",
      dialogueBeats: [
        { id: "jmw_of_b1", characterId: "narrator", text: "A TRAIN passes outside. The blinds shiver. A spoon rattles in an empty cup. Then silence again. JACK (48) sits at the desk eating a convenience-store rice ball, watching the silent swordsmen. Handsome once, in a way he stopped maintaining. A good coat, badly kept. He flicks an old steel lighter open and shut, open and shut. There are no cigarettes anywhere." },
        { id: "jmw_of_b2", characterId: "narrator", text: "A knock on the frosted glass. Vera comes in, wet, the blue umbrella dripping." },
        { id: "jmw_of_b3", characterId: "vera", text: "Are you the one they call Jack?", audioUrl: "/film/voice/s10/166-vera-are-you-the-one-they-call.mp3" },
        { id: "jmw_of_b4", characterId: "jack", text: "Depends who's calling.", audioUrl: "/film/voice/s10/166-jack-dryly-depends-who-s-calling.mp3" },
        { id: "jmw_of_b5", characterId: "vera", text: "Mr. Okada. The bar in Kanda.", audioUrl: "/film/voice/s10/166-vera-mr-okada-the-bar-in-kanda.mp3" },
        { id: "jmw_of_b6", characterId: "narrator", text: "Jack puts the rice ball down." },
        { id: "jmw_of_b7", characterId: "jack", text: "Sit down.", audioUrl: "/film/voice/s10/166-jack-calmly-sit-down.mp3" },
        { id: "jmw_of_b8", characterId: "narrator", text: "She sits. He doesn't switch to English. He lets her speak in the language she chose. She notices." },
        { id: "jmw_of_b9", characterId: "vera", text: "My sister has been missing for four days. The police say to go home and wait.", audioUrl: "/film/voice/s10/166-vera-evenly-my-sister-has-been-missing.mp3" },
        { id: "jmw_of_b10", characterId: "jack", text: "I don't do missing persons. People who go missing usually want to.", audioUrl: "/film/voice/s10/166-jack-flatly-i-don-t-do-missing.mp3" },
        { id: "jmw_of_b11", characterId: "narrator", text: "She places the red bird clip on his desk." },
        { id: "jmw_of_b12", characterId: "vera", text: "She was in that bar. The night two men were shot there.", audioUrl: "/film/voice/s10/166-vera-steadily-she-was-in-that-bar.mp3" },
        { id: "jmw_of_b13", characterId: "narrator", text: "Jack looks at the clip for a long moment. The lighter stops." },
        { id: "jmw_of_b14", characterId: "jack", text: "What did the police tell you?", audioUrl: "/film/voice/s10/166-jack-what-did-the-police-tell-you.mp3" },
        { id: "jmw_of_b15", characterId: "vera", text: "To go home.", audioUrl: "/film/voice/s10/167-vera-to-go-home.mp3" },
        { id: "jmw_of_b16", characterId: "jack", text: "It's good advice.", audioUrl: "/film/voice/s10/167-jack-wearily-it-s-good-advice.mp3" },
        { id: "jmw_of_b17", characterId: "vera", text: "Is it yours, too?", audioUrl: "/film/voice/s10/167-vera-is-it-yours-too.mp3" },

        /* — the price first: she gets the terms and nothing else — */
        {
          id: "jmw_of_b_price1", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_named_price"] },
          text: "Ten thousand yen a day. Plus expenses. I'll need a key to her apartment, her phone number, her friends, where she worked, where she drank.",
          audioUrl: "/film/voice/s10/168-jack-businesslike-ten-thousand-yen-a-day.mp3",
        },
        {
          id: "jmw_of_b_price2", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_named_price"] },
          text: "So you'll look.",
          audioUrl: "/film/voice/s10/168-vera-so-you-ll-look.mp3",
        },
        {
          id: "jmw_of_b_price3", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_named_price"] },
          text: "I'll look.",
          audioUrl: "/film/voice/s10/168-jack-i-ll-look.mp3",
        },

        /* — refused: she gets to the door before he does — */
        {
          id: "jmw_of_b_refuse1", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_refused_case"] },
          text: "She stands. Picks up the blue umbrella. On the television behind him, a sword is drawn in total silence.",
        },
        {
          id: "jmw_of_b_refuse2", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_refused_case"] },
          text: "Mr. Okada said you found his daughter.",
          audioUrl: "/film/voice/s10/244-vera-mr-okada-said-you-found-his.mp3",
        },
        {
          id: "jmw_of_b_refuse3", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_refused_case"] },
          text: "I found her.",
          audioUrl: "/film/voice/s10/244-jack-i-found-her.mp3",
        },
        {
          id: "jmw_of_b_refuse4", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_refused_case"] },
          text: "Was she alive?",
          audioUrl: "/film/voice/s10/244-vera-was-she-alive.mp3",
        },

        /* — made her wait — */
        {
          id: "jmw_of_b_wait1", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_made_her_wait"] },
          text: "Another train passes. The blinds shiver. She is still standing there, holding the blue umbrella like something she has forgotten to put down, when he finally speaks.",
        },

        /* — the photographs, and the man in the picture — */
        {
          id: "jmw_of_b_ph1", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_asked_photos"] },
          text: "Do you have photographs of her?",
          audioUrl: "/film/voice/s10/167-jack-do-you-have-photographs-of-her.mp3",
        },
        {
          id: "jmw_of_b_ph2", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_asked_photos"] },
          text: "She takes an envelope from her bag. As she pulls out the photos, something slides out with them and falls face up on the desk: the old framed photograph, taken out of its frame. Twenty years ago. A Tokyo street. An American man in a rumpled suit, smiling, holding the hands of two small girls. Behind them, the sign of a noodle shop.",
        },
        {
          id: "jmw_of_b_ph3", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_asked_photos"] },
          text: "That's us. Before we left.",
          audioUrl: "/film/voice/s10/167-vera-that-s-us-pause-before-we.mp3",
        },
        {
          id: "jmw_of_b_ph4", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_asked_photos"] },
          text: "Your father.",
          audioUrl: "/film/voice/s10/167-jack-softly-your-father.mp3",
        },
        {
          id: "jmw_of_b_ph5", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_asked_photos"] },
          text: "He died. That year. Here.",
          audioUrl: "/film/voice/s10/167-vera-quietly-he-died-pause-that-year.mp3",
        },
        {
          id: "jmw_of_b_ph6", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_asked_photos"] },
          text: "I'm sorry.",
          audioUrl: "/film/voice/s10/168-jack-quietly-i-m-sorry.mp3",
        },
        {
          id: "jmw_of_b_ph7", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_asked_photos"] },
          text: "It was a long time ago.",
          audioUrl: "/film/voice/s10/168-vera-it-was-a-long-time-ago.mp3",
        },
        {
          id: "jmw_of_b_ph8", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_asked_photos"] },
          text: "Yes.",
          audioUrl: "/film/voice/s10/168-jack-yes.mp3",
        },
        {
          id: "jmw_of_b_ph9", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_asked_photos"] },
          text: "He picks the photograph up by its edges, the way you'd handle evidence, or something fragile. He looks a moment too long at the noodle shop sign. Then he sets it down, face up, and squares it to the edge of the desk.",
        },
        {
          id: "jmw_of_b_ph10", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_asked_photos"] },
          text: "Mr. Okada said you found his daughter.",
          audioUrl: "/film/voice/s10/244-vera-mr-okada-said-you-found-his.mp3",
        },
        {
          id: "jmw_of_b_ph11", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_asked_photos"] },
          text: "I found her.",
          audioUrl: "/film/voice/s10/244-jack-i-found-her.mp3",
        },
        {
          id: "jmw_of_b_ph12", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_asked_photos"] },
          text: "Was she alive?",
          audioUrl: "/film/voice/s10/244-vera-was-she-alive.mp3",
        },
        {
          id: "jmw_of_b_honest", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_honest_pause"] },
          text: "Jack looks at her. The honest answer is in the pause, and she is a woman who has been listening to pauses for three days, and she hears every word of it.",
        },
        {
          id: "jmw_of_b_deflect1", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_deflected"] },
          text: "Her Japanese. Your sister's. Is it good?",
          audioUrl: "/film/voice/s10/244-jack-long-pause-her-japanese-your-sister.mp3",
        },
        {
          id: "jmw_of_b_deflect2", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_deflected"] },
          text: "Some. Badly.",
          audioUrl: "/film/voice/s10/244-vera-some-badly.mp3",
        },
        {
          id: "jmw_of_b_deflect3", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_deflected"] },
          text: "Then she stands out. That helps.",
          audioUrl: "/film/voice/s10/244-jack-then-she-stands-out-that-helps.mp3",
        },
      ],
      choices: [
        /* — how he takes the case — */
        {
          id: "jmw_of_c_photos",
          text: "Ask for photographs. Photographs are not a promise.",
          reply: true,
          timeLimitSeconds: 9,
          consequences: { setFlags: ["jmw_asked_photos"], trustChanges: [{ characterId: "vera", delta: 1 }] },
          timedOutConsequences: { setFlags: ["jmw_made_her_wait"] },
          memoryLog: "mem_photos",
          rememberLine: "Vera will remember that he asked before he promised.",
        },
        {
          id: "jmw_of_c_price",
          text: "Name the price. Ten thousand a day, plus expenses.",
          reply: true,
          consequences: { setFlags: ["jmw_named_price"], trustChanges: [{ characterId: "vera", delta: -1 }] },
          memoryLog: "mem_price",
          rememberLine: "Vera will remember what it cost to sit down.",
        },
        {
          id: "jmw_of_c_refuse",
          text: "It's good advice. Go home, Miss Voss.",
          reply: true,
          consequences: { setFlags: ["jmw_refused_case"], trustChanges: [{ characterId: "vera", delta: -1 }] },
          memoryLog: "mem_refused",
          rememberLine: "Vera will remember that he sent her home first.",
        },
        {
          id: "jmw_of_c_silent",
          text: "…",
          reply: true,
          consequences: { setFlags: ["jmw_made_her_wait"] },
        },
        /* — the ways back from each of those — */
        {
          id: "jmw_of_c_after_price",
          text: "Then: do you have photographs of her?",
          reply: true,
          hidden: true,
          gating: { requiresFlags: ["jmw_named_price"], excludesFlags: ["jmw_asked_photos"] },
          consequences: { setFlags: ["jmw_asked_photos"] },
        },
        {
          id: "jmw_of_c_reconsider",
          text: "At the door, before she opens it: photographs. Do you have photographs of her?",
          reply: true,
          hidden: true,
          gating: { requiresFlags: ["jmw_refused_case"], excludesFlags: ["jmw_asked_photos"] },
          consequences: { setFlags: ["jmw_asked_photos"] },
        },
        {
          id: "jmw_of_c_after_silence",
          text: "Say the first useful thing you can think of: photographs. Do you have photographs of her?",
          reply: true,
          hidden: true,
          gating: { requiresFlags: ["jmw_made_her_wait"], excludesFlags: ["jmw_asked_photos"] },
          consequences: { setFlags: ["jmw_asked_photos"] },
        },
        /* — and the question at the door — */
        {
          id: "jmw_of_c_honest",
          text: "Let the pause answer her. It's the only honest thing you have.",
          reply: true,
          hidden: true,
          gating: { requiresFlags: ["jmw_asked_photos"] },
          timeLimitSeconds: 8,
          consequences: { setFlags: ["jmw_honest_pause"], trustChanges: [{ characterId: "vera", delta: 1 }] },
          timedOutConsequences: { setFlags: ["jmw_deflected"], trustChanges: [{ characterId: "vera", delta: -1 }] },
          memoryLog: "mem_honest",
          rememberLine: "Vera will remember that he let the silence say it.",
        },
        {
          id: "jmw_of_c_deflect",
          text: "Answer her question with one of your own. Her Japanese — is it good?",
          reply: true,
          hidden: true,
          gating: { requiresFlags: ["jmw_asked_photos"], excludesFlags: ["jmw_honest_pause", "jmw_deflected"] },
          consequences: { setFlags: ["jmw_deflected"], trustChanges: [{ characterId: "vera", delta: -1 }] },
          memoryLog: "mem_deflect",
          rememberLine: "Vera will remember that he did not answer.",
        },
        /* — out — */
        {
          id: "jmw_of_c_box",
          text: "See her out. Then open the cupboard under the window.",
          targetSceneId: "jmw_box",
          hidden: true,
          gating: { requiresFlags: ["jmw_asked_photos"] },
          isRepeatable: true,
        },
      ],
    },

    {
      id: "jmw_box",
      title: "Twenty Years",
      onEnterActions: [{ consequences: { setFlags: ["jmw_took_case"] } }],
      background: "/film/img/s11/167-two-men-laughing.jpg",
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "Past midnight. Only the desk lamp and the grey flicker of the television, now showing static. Jack crouches at the grey steel cupboard under the window, pulls its door open and takes out a cardboard box he has kept behind the files. Dust on the lid. He hasn't opened it in years.",
      dialogueBeats: [
        { id: "jmw_bx_b1", characterId: "narrator", text: "Inside: a police notebook. An old ID card with a younger face. A folded newspaper clipping." },
        { id: "jmw_bx_b2", characterId: "narrator", text: "An English-language newspaper, yellowed. A small headline: AMERICAN INSURANCE INVESTIGATOR FOUND DEAD - POLICE RULE SUICIDE. A photograph: the same man from Vera's picture. The caption: DANIEL VOSS, 41." },
        {
          id: "jmw_bx_b_photo", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_clue_daniel_photo"] },
          text: "Beneath the clipping, one more photograph. Two men at a tiny noodle counter, laughing, steam in the air: DANIEL VOSS, and a much younger JACK, still in a cheap police-issue suit. Behind them, the same noodle shop sign as the one in Vera's picture. Jack looks at it for a long time.",
        },
        /* — the telephone call, if he makes it — */
        {
          id: "jmw_bx_b_call1", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_told_ishida_lead"] },
          text: "The Voss girl came to see me.",
          audioUrl: "/film/voice/s11/251-jack-the-voss-girl-came-to-see.mp3",
        },
        {
          id: "jmw_bx_b_call2", characterId: "ishida",
          conditionRule: { requiresFlags: ["jmw_told_ishida_lead"] },
          text: "It's late, Jack.",
          audioUrl: "/film/voice/s11/251-ishida-tired-it-s-late-jack.mp3",
        },
        {
          id: "jmw_bx_b_call3", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_told_ishida_lead"] },
          text: "Her sister was in that bar.",
          audioUrl: "/film/voice/s11/251-jack-low-her-sister-was-in-that.mp3",
        },
        {
          id: "jmw_bx_b_call4", characterId: "ishida",
          conditionRule: { requiresFlags: ["jmw_told_ishida_lead"] },
          text: "The sister is a missing persons case. The bar is a gang matter. Two separate things.",
          audioUrl: "/film/voice/s11/251-ishida-the-sister-is-a-missing-persons.mp3",
        },
        {
          id: "jmw_bx_b_call5", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_told_ishida_lead"] },
          text: "And the old man in the street?",
          audioUrl: "/film/voice/s11/251-jack-and-the-old-man-in-the.mp3",
        },
        {
          id: "jmw_bx_b_call6", characterId: "ishida",
          conditionRule: { requiresFlags: ["jmw_told_ishida_lead"] },
          text: "Sakai. Yes. That Sakai. I know what you're thinking. Old debts, old enemies. It's a gang matter.",
          audioUrl: "/film/voice/s11/251-ishida-sakai-pause-yes-that-sakai-i.mp3",
        },
        {
          id: "jmw_bx_b_call7", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_told_ishida_lead"] },
          text: "Twenty years, Ishida.",
          audioUrl: "/film/voice/s11/251-jack-pause-twenty-years-ishida.mp3",
        },
        {
          id: "jmw_bx_b_call8", characterId: "ishida",
          conditionRule: { requiresFlags: ["jmw_told_ishida_lead"] },
          text: "Go to sleep, Jack. You found enough twenty years ago. You're too old to be haunted.",
          audioUrl: "/film/voice/s11/251-ishida-gently-go-to-sleep-jack-you.mp3",
        },
        {
          id: "jmw_bx_b_call9", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_told_ishida_lead"] },
          text: "The line goes dead. Jack holds the receiver a moment longer. A train passes. The photograph of the two laughing men trembles on the desk.",
        },
        /* — and if he doesn't — */
        {
          id: "jmw_bx_b_quiet1", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_kept_from_ishida"] },
          text: "He dials four numbers and then puts the receiver down before it connects. On the television, a sword is drawn in total silence. Flicks the lighter open. Shut.",
        },
        {
          id: "jmw_bx_b_quiet2", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_kept_from_ishida"] },
          text: "Whoever Ishida hears it from, it will not be you. He will remember that too, in his way, for the rest of this.",
        },
      ],
      hotspots: [
        {
          id: "jmw_bx_h_clipping",
          label: "The newspaper clipping",
          bounds: { x: 30, y: 34, w: 20, h: 26 },
          cursor: "look",
          isRepeatable: false,
          action: {
            type: "showText",
            text: "AMERICAN INSURANCE INVESTIGATOR FOUND DEAD — POLICE RULE SUICIDE. Daniel Voss, 41. A hotel room, a bathroom door locked from the inside, and a life insurance policy that paid out twice.",
            flagSet: "jmw_clue_clipping",
          },
        },
        {
          id: "jmw_bx_h_notebook",
          label: "The police notebook",
          bounds: { x: 58, y: 40, w: 18, h: 22 },
          cursor: "look",
          isRepeatable: false,
          action: {
            type: "showText",
            text: "His own handwriting, twenty years old, and careful in a way it stopped being later. Three interviews. Two names. One line underlined twice: the file on the desk was not the file he was given.",
            flagSet: "jmw_clue_notebook_old",
          },
        },
        {
          id: "jmw_bx_h_photo",
          label: "Two men at a noodle counter",
          bounds: { x: 12, y: 48, w: 16, h: 24 },
          cursor: "look",
          isRepeatable: false,
          action: {
            type: "showText",
            text: "Two men at a tiny noodle counter, laughing, steam in the air. Daniel Voss. And a much younger Jack, in a cheap police-issue suit. Behind them, hand-painted: the sign of a noodle shop.",
            flagSet: "jmw_clue_daniel_photo",
          },
        },
      ],
      choices: [
        {
          id: "jmw_bx_c_call",
          text: "Telephone Ishida. Tell him the Voss girl came to you.",
          reply: true,
          timeLimitSeconds: 10,
          consequences: {
            setFlags: ["jmw_told_ishida_lead"],
            trustChanges: [{ characterId: "ishida", delta: 1 }],
          },
          timedOutConsequences: {
            setFlags: ["jmw_kept_from_ishida"],
            trustChanges: [{ characterId: "ishida", delta: -1 }],
          },
          memoryLog: "mem_ishida_call",
          rememberLine: "Ishida will remember that you rang him before you rang anybody.",
        },
        {
          id: "jmw_bx_c_sakai",
          text: "Telephone Ishida — and ask him what he knows about the name Sakai.",
          reply: true,
          consequences: {
            setFlags: ["jmw_told_ishida_lead", "jmw_clue_sakai_name"],
            trustChanges: [{ characterId: "ishida", delta: 1 }],
          },
          memoryLog: "mem_ishida_sakai",
          rememberLine: "Ishida will remember that you said the name out loud.",
        },
        {
          id: "jmw_bx_c_quiet",
          text: "Say nothing. Not until you know what it is you've found.",
          reply: true,
          consequences: {
            setFlags: ["jmw_kept_from_ishida"],
            trustChanges: [{ characterId: "ishida", delta: -1 }],
          },
          memoryLog: "mem_ishida_quiet",
          rememberLine: "Ishida will hear it from somebody else.",
        },
        {
          id: "jmw_bx_c_silent",
          text: "…",
          reply: true,
          consequences: {
            setFlags: ["jmw_kept_from_ishida"],
            trustChanges: [{ characterId: "ishida", delta: -1 }],
          },
        },
        {
          id: "jmw_bx_c_street",
          text: "Coat. Umbrella. The backstreet, in the rain, at one in the morning.",
          targetSceneId: "jmw_backstreet",
          isRepeatable: true,
        },
      ],
    },

    {
      id: "jmw_backstreet",
      title: "Not Searching. Looking.",
      background: "/film/img/s12/420-not-searching-looking.jpg",
      particles: "rain",
      particleConfig: { density: 1.2, wind: 0.9 },
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "The street from four nights ago. The rain hasn't stopped since. Jack walks it slowly, a cheap clear plastic umbrella over his head. Not searching. Looking.",
      dialogueBeats: [
        { id: "jmw_bs_b1", characterId: "narrator", text: "The vending machine at the corner. He feeds it a coin. A can of hot coffee drops.", sfxUrl: "/film/sfx/coin-insert.mp3" },
        { id: "jmw_bs_b2", characterId: "narrator", text: "\"Thank you very much.\" He holds the can without drinking it and looks at the spot where Sakai died. Nothing there now. Rain on asphalt." },
        { id: "jmw_bs_b3", characterId: "narrator", text: "He turns and looks at the barbershop doorway. Steps into it. Stands exactly where she stood. From here, he can see the whole street. And, at the far end, the small lit sign of Okada's bar." },
        {
          id: "jmw_bs_b_barber1", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_clue_one_car_twice"] },
          text: "A shutter RATTLES up above him. A BARBER (80s), in pyjamas, looks down from the upstairs window.",
          sfxUrl: "/film/sfx/shutter-rattle-up.mp3",
        },
        {
          id: "jmw_bs_b_barber2", characterId: "jmw_barber",
          conditionRule: { requiresFlags: ["jmw_clue_one_car_twice"] },
          text: "Police again?",
        },
        {
          id: "jmw_bs_b_barber3", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_clue_one_car_twice"] },
          text: "Not for a long time.",
        },
        {
          id: "jmw_bs_b_barber4", characterId: "jmw_barber",
          conditionRule: { requiresFlags: ["jmw_clue_one_car_twice"] },
          text: "I told them. I was asleep. I heard the shot. Then a car.",
        },
        {
          id: "jmw_bs_b_barber5", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_clue_one_car_twice"] },
          text: "One car?",
        },
        {
          id: "jmw_bs_b_barber6", characterId: "jmw_barber",
          conditionRule: { requiresFlags: ["jmw_clue_one_car_twice"] },
          text: "One car. Twice. It left. Then it came back.",
        },
        {
          id: "jmw_bs_b_barber7", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_clue_one_car_twice"] },
          text: "Why come back?",
        },
        {
          id: "jmw_bs_b_barber8", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_clue_one_car_twice"] },
          text: "Nobody answers. The barber shrugs and pulls the shutter down. He looks down the street at the drains, the doorways, the gutter: everywhere a small thing could fall.",
        },
        {
          id: "jmw_bs_b_skipped", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_barber_skipped"] },
          text: "Upstairs, a window stays dark and a shutter stays down. Whatever the street has to say, it will have to say it in its own language.",
        },
        {
          id: "jmw_bs_b_strap", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_clue_strap"] },
          text: "He looks from the torn strap, to the spot where Sakai fell, to the bar sign. Reconstructing it. She was here. She saw it. She ran there. She saw that too. And whatever they came back for, she has it.",
        },
        {
          id: "jmw_bs_b_sight", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_clue_sightline"] },
          text: "From the doorway the whole street is one straight line, and at the end of it, small and amber, a bar sign. She stood here and watched the end of the street, and then she ran at it. Whatever she was afraid of, she ran toward the light.",
        },
        { id: "jmw_bs_b9", characterId: "narrator", text: "He drops the unopened coffee into the recycling bin. The can CLANKS. The crossing melody starts up somewhere, for no one." },
      ],
      hotspots: [
        {
          id: "jmw_bs_h_strap",
          label: "A rough metal edge at knee height",
          bounds: { x: 40, y: 62, w: 16, h: 16 },
          cursor: "take",
          isRepeatable: false,
          action: {
            type: "showText",
            text: "Caught on a rough metal edge at knee height: a short twist of torn leather strap. Torn, not cut. A bag taken off a shoulder in a hurry, or taken off a shoulder by somebody else.",
            flagSet: "jmw_clue_strap",
          },
        },
        {
          id: "jmw_bs_h_barber",
          label: "The shutter upstairs",
          bounds: { x: 46, y: 8, w: 16, h: 18 },
          cursor: "talk",
          isRepeatable: false,
          action: {
            type: "showText",
            text: "A shutter, and behind it an upstairs window, and behind that a man of eighty who has already told the police everything he is going to tell anybody.",
            flagSet: "jmw_clue_one_car_twice",
          },
        },
        {
          id: "jmw_bs_h_sightline",
          label: "The sightline down the lane",
          bounds: { x: 14, y: 20, w: 22, h: 18 },
          cursor: "look",
          isRepeatable: false,
          action: {
            type: "showText",
            text: "From this doorway: the whole street in one straight line, and at the far end the small amber sign of a bar. Whoever stood here could see everything, and be seen by nothing.",
            flagSet: "jmw_clue_sightline",
          },
        },
        {
          id: "jmw_bs_h_drains",
          label: "The gutter and the drains",
          bounds: { x: 62, y: 70, w: 20, h: 16 },
          cursor: "look",
          isRepeatable: false,
          action: {
            type: "showText",
            text: "Everywhere on this street a small thing could fall: a grate, a doorway lip, a gutter running black with four days of rain. Whatever came back to this street came back for something the size of a hand.",
            flagSet: "jmw_clue_drains",
          },
        },
      ],
      choices: [
        {
          id: "jmw_bs_c_barber",
          text: "Wake the barber. Ask him what he heard.",
          reply: true,
          timeLimitSeconds: 9,
          consequences: { setFlags: ["jmw_clue_one_car_twice"] },
          timedOutConsequences: { setFlags: ["jmw_barber_skipped"] },
          memoryLog: "mem_barber",
        },
        {
          id: "jmw_bs_c_quiet",
          text: "Let him sleep. Read the street instead.",
          reply: true,
          // Reading the street is its own reward: the sightline falls out of it.
          consequences: { setFlags: ["jmw_barber_skipped", "jmw_clue_sightline"] },
        },
        {
          id: "jmw_bs_c_silent",
          text: "…",
          reply: true,
          consequences: { setFlags: ["jmw_barber_skipped"] },
        },
        {
          id: "jmw_bs_c_apartment",
          text: "The sister has a key to the apartment. Use it.",
          targetSceneId: "jmw_apartment",
          isRepeatable: true,
        },
      ],
    },

    {
      id: "jmw_apartment",
      title: "Someone Who Meant To Come Back",
      background: "/film/img/s14/182-someone-who-meant-to-come-back.jpg",
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "A tiny studio in an old building. Grey daylight. Clothes on every surface. Sketches taped to the walls: pencil, charcoal, cheap watercolour. Trains. Rooftops. Laundry lines. Faces on the subway. The room smells of someone who meant to come back. Vera stands just inside the door. She hasn't taken her coat off. Jack moves through the room slowly, touching nothing yet.",
      dialogueBeats: [
        { id: "jmw_ap_b1", characterId: "jack", text: "When were you last here?", audioUrl: "/film/voice/s14/184-jack-when-were-you-last-here.mp3" },
        { id: "jmw_ap_b2", characterId: "vera", text: "A week ago. She made me coffee. It was terrible.", audioUrl: "/film/voice/s14/184-vera-wryly-a-week-ago-she-made.mp3" },
        { id: "jmw_ap_b3", characterId: "narrator", text: "He opens the fridge. Milk. A half-eaten cake in a box. He closes it." },
        { id: "jmw_ap_b4", characterId: "jack", text: "She wasn't planning to disappear.", audioUrl: "/film/voice/s14/184-jack-quietly-she-wasn-t-planning-to.mp3" },
        { id: "jmw_ap_b5", characterId: "vera", text: "No.", audioUrl: "/film/voice/s14/184-vera-no.mp3" },
        {
          id: "jmw_ap_b_case1", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_clue_suitcase"] },
          text: "That was for America. She'd booked a flight. Next month.",
          audioUrl: "/film/voice/s14/270-vera-quietly-that-was-for-america-she.mp3",
        },
        {
          id: "jmw_ap_b_case2", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_clue_suitcase"] },
          text: "You didn't want her to go.",
          audioUrl: "/film/voice/s14/270-jack-you-didn-t-want-her-to.mp3",
        },
        {
          id: "jmw_ap_b_case3", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_clue_suitcase"] },
          text: "I didn't want her to run away again. That's what I said. The night she left. That she always runs.",
          audioUrl: "/film/voice/s14/270-vera-i-didn-t-want-her-to.mp3",
        },
        {
          id: "jmw_ap_b_wall", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_clue_wall"] },
          text: "It was about Dad. It's always about Dad. She wanted to dig it all up. Who he was here. Why he — I told her to leave him dead. She said I was the one who ran. All the way back here, chasing a ghost, and I won't even look at it. I told her to go, then. Go home. Those were the last things I said to her.",
          audioUrl: "/film/voice/s14/270-vera-voice-breaking-it-was-about-dad.mp3",
        },
        {
          id: "jmw_ap_b_sk1", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_clue_sketchbook"] },
          text: "Page after page of the same place. A tiny noodle counter under a railway. Six stools. A curtain. A hand-painted sign. Drawn over and over, from different angles, in different years of her hand — a child's crayon version taped inside the cover, the newest in careful ink.",
        },
        {
          id: "jmw_ap_b_sk2", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_clue_sketchbook"] },
          text: "She drew this a lot.",
          audioUrl: "/film/voice/s14/185-jack-she-drew-this-a-lot.mp3",
        },
        {
          id: "jmw_ap_b_sk3", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_clue_sketchbook"] },
          text: "Since she was little. It's from a story I used to tell her. About the noodle shop Dad took us to. She was too young to remember it, so I told her. She made it up from what I said. It's not real.",
          audioUrl: "/film/voice/s14/185-vera-since-she-was-little-it-s.mp3",
        },
        {
          id: "jmw_ap_b_sk4", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_clue_sketchbook"] },
          text: "Jack turns a page. The sign, in careful ink. Every stroke of the kanji correct. He has seen this sign twice this week: once in the photograph on his own desk, and once in a box in his own cupboard.",
        },
        {
          id: "jmw_ap_b_fridge", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_clue_fridge"] },
          text: "Milk with four days on it. A cake with one slice gone. Nobody packs a fridge for a disappearance.",
        },
        /* — what he says to her — */
        {
          id: "jmw_ap_b_kind1", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_comforted_vera"] },
          text: "You don't know that.",
        },
        {
          id: "jmw_ap_b_kind2", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_comforted_vera"] },
          text: "No. But I'd bet on it.",
        },
        {
          id: "jmw_ap_b_dad", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_probed_dad"] },
          text: "He was an insurance investigator. He died in a hotel room with the door locked from the inside, and the police wrote a word on a form and everybody stopped asking. I was eleven. My mother took us to America and never said his name again. That's the whole of it. That's all I have.",
        },
        {
          id: "jmw_ap_b_nothing", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_said_nothing_vera"] },
          text: "Jack says nothing. He knows better than to comfort it away. Vera looks at the wall of drawings, not at him, and after a while she stops expecting an answer.",
        },
        {
          id: "jmw_ap_b_borrow1", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_clue_sketchbook"] },
          text: "Can I borrow this?",
          audioUrl: "/film/voice/s14/185-jack-can-i-borrow-this.mp3",
        },
        {
          id: "jmw_ap_b_borrow2", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_clue_sketchbook"] },
          text: "Why?",
          audioUrl: "/film/voice/s14/185-vera-why.mp3",
        },
        {
          id: "jmw_ap_b_borrow3", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_clue_sketchbook"] },
          text: "Jack doesn't answer. He looks at the drawing a moment too long. Vera takes the hair clip out of her coat pocket and sets it on the sketchbook.",
        },
        {
          id: "jmw_ap_b_borrow4", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_clue_sketchbook"] },
          text: "Take this too. It's mine. She stole it.",
          audioUrl: "/film/voice/s14/363-vera-wryly-take-this-too-it-s.mp3",
        },
      ],
      hotspots: [
        {
          id: "jmw_ap_h_fridge",
          label: "The fridge",
          bounds: { x: 8, y: 44, w: 14, h: 26 },
          cursor: "look",
          isRepeatable: false,
          action: {
            type: "showText",
            text: "Milk. A half-eaten cake in a box. Two eggs. Somebody who meant to come back for breakfast on Monday.",
            flagSet: "jmw_clue_fridge",
          },
        },
        {
          id: "jmw_ap_h_suitcase",
          label: "The suitcase under the futon",
          bounds: { x: 62, y: 68, w: 20, h: 16 },
          cursor: "look",
          isRepeatable: false,
          action: {
            type: "showText",
            text: "Packed and zipped. Not dragged out in a hurry, not half-done: finished, folded, and shut. Nobody runs with a suitcase like that.",
            flagSet: "jmw_clue_suitcase",
          },
        },
        {
          id: "jmw_ap_h_sketchbook",
          label: "The sketchbook on the desk",
          bounds: { x: 40, y: 52, w: 16, h: 18 },
          cursor: "take",
          isRepeatable: false,
          action: {
            type: "showText",
            text: "A thick sketchbook, its cover soft with use. Page after page of the same place: a tiny noodle counter under a railway, six stools, a curtain, a hand-painted sign. Drawn for twenty years, in a hand that got steadier every time.",
            flagSet: "jmw_clue_sketchbook",
          },
        },
        {
          id: "jmw_ap_h_wall",
          label: "The wall of drawings",
          bounds: { x: 70, y: 12, w: 22, h: 30 },
          cursor: "look",
          isRepeatable: false,
          action: {
            type: "showText",
            text: "Trains. Rooftops. Laundry lines. Faces on the subway. Somebody who looked at this city the way other people look for something they lost.",
            flagSet: "jmw_clue_wall",
          },
        },
      ],
      choices: [
        {
          id: "jmw_ap_c_kind",
          text: "Runners don't pack. She wasn't running from you.",
          reply: true,
          timeLimitSeconds: 9,
          consequences: { setFlags: ["jmw_comforted_vera"], trustChanges: [{ characterId: "vera", delta: 1 }] },
          timedOutConsequences: { setFlags: ["jmw_said_nothing_vera"], trustChanges: [{ characterId: "vera", delta: -1 }] },
          memoryLog: "mem_comfort",
          rememberLine: "Vera will remember what you said about her sister.",
        },
        {
          id: "jmw_ap_c_probe",
          text: "Tell me about your father. Properly, this time.",
          reply: true,
          consequences: { setFlags: ["jmw_probed_dad"], trustChanges: [{ characterId: "vera", delta: -1 }] },
          memoryLog: "mem_dad",
          rememberLine: "Vera will remember that you made her say it out loud.",
        },
        {
          id: "jmw_ap_c_silent",
          text: "…",
          reply: true,
          consequences: { setFlags: ["jmw_said_nothing_vera"] },
        },
        {
          id: "jmw_ap_c_bar",
          text: "Okada's bar. The clip came from behind that counter — start there.",
          targetSceneId: "jmw_bar",
          isRepeatable: true,
        },
        {
          // Only the sketchbook puts the Hive on the map — a clue flag that
          // opens a place, which is the whole point of looking round a room.
          id: "jmw_ap_c_hive",
          text: "The Hive. Find the noodle counter she drew a hundred times.",
          targetSceneId: "jmw_hive",
          hidden: true,
          gating: { requiresFlags: ["jmw_clue_sketchbook"] },
          isRepeatable: true,
        },
      ],
    },

    /* ================================================================ *
     *  THE TWO LEADS, IN THE ORDER THE PLAYER PICKS                     *
     * ================================================================ */
    {
      id: "jmw_bar",
      title: "We're Closed",
      onEnterActions: [{ consequences: { setFlags: ["jmw_leads_open", "jmw_bar_first"] } }],
      background: "/film/img/s8/160-were-closed.jpg",
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "The same bar in flat grey daylight. It looks smaller without the night. Chairs up on the counter. The CRT television is dark. Where the journalist fell, there is a new rubber floor mat, too clean for this room. OKADA (60s), the bar's owner, mops around it without looking at it. He has the stillness of a man who hasn't slept.",
      dialogueBeats: [
        { id: "jmw_br_b1", characterId: "okada", text: "We're closed." },
        { id: "jmw_br_b2", characterId: "narrator", text: "Jack puts his card on the counter. Then the passport photograph: Mara, unsmiling for once, a strand of hair across her eyes." },
        { id: "jmw_br_b3", characterId: "okada", text: "I looked. No." },
        { id: "jmw_br_b4", characterId: "narrator", text: "His eyes go, just once, to the far end of the counter. Then back to the mop." },
        {
          id: "jmw_br_b_gentle1", characterId: "okada",
          conditionRule: { requiresFlags: ["jmw_okada_gentle"] },
          text: "He was here every night for a week, the one at the far stool. Writing in a notebook. He asked me the same question three times: what time is it quietest here? I told him never.",
        },
        {
          id: "jmw_br_b_gentle2", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_okada_gentle"] },
          text: "He takes a folded page from the till and puts it on the counter without looking at it. A page torn from a notebook. The top line reads: 1.00 — SAKAI — \"just listen\".",
        },
        {
          id: "jmw_br_b_hard1", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_clue_notebook"] },
          text: "The mop stops. Okada looks at him for a long moment, then puts the mop in the bucket, takes a folded page out of the till and slides it across the counter without letting go of it for a second too long.",
        },
        {
          id: "jmw_br_b_hard2", characterId: "okada",
          conditionRule: { requiresFlags: ["jmw_clue_notebook"] },
          text: "He paid for his drink and left at ten minutes to one. There's a page of his notebook in the till. I didn't give it to the police. I am not giving it to you either. You are reading it here.",
        },
        {
          id: "jmw_br_b_hard3", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_clue_notebook"] },
          text: "A page torn from a notebook. The top line reads: 1.00 — SAKAI — \"just listen\". Under it, in the same hand: bring the girl's photo. She has to see a face she knows.",
        },
        {
          id: "jmw_br_b_polite", characterId: "okada",
          conditionRule: { requiresFlags: ["jmw_okada_polite"] },
          text: "Not the police. Her sister. — Yes. She was here. That is all I am saying today.",
        },
        {
          id: "jmw_br_b_silent", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_okada_silent"] },
          text: "The mop goes round the new mat again. Neither of them says anything for a long time. Okada does not look up. When Jack leaves, the door chime sounds like an apology.",
        },
      ],
      choices: [
        {
          id: "jmw_br_c_gentle",
          text: "Gentle. Ask about the man at the far stool, not about the girl.",
          reply: true,
          timeLimitSeconds: 10,
          consequences: {
            setFlags: ["jmw_okada_gentle", "jmw_clue_notebook"],
            trustChanges: [{ characterId: "okada", delta: 1 }],
          },
          timedOutConsequences: { setFlags: ["jmw_okada_silent"], trustChanges: [{ characterId: "okada", delta: -1 }] },
          memoryLog: "mem_okada",
          rememberLine: "Okada will remember that you didn't push.",
        },
        {
          id: "jmw_br_c_hard",
          text: "Hard. You've mopped that mat four times. Tell me what you saw.",
          reply: true,
          consequences: {
            setFlags: ["jmw_clue_notebook"],
            trustChanges: [{ characterId: "okada", delta: -1 }],
          },
          memoryLog: "mem_okada_hard",
          rememberLine: "Okada will remember that you made him say it.",
        },
        {
          id: "jmw_br_c_leave",
          text: "Let it go. Thank him for the card and go.",
          reply: true,
          consequences: { setFlags: ["jmw_okada_polite"] },
        },
        {
          id: "jmw_br_c_silent",
          text: "…",
          reply: true,
          consequences: { setFlags: ["jmw_okada_silent"] },
        },
        {
          id: "jmw_br_c_hive",
          text: "Out into the grey. There is a drawing in your coat, and a building in it.",
          targetSceneId: "jmw_hive_late",
          isRepeatable: true,
        },
      ],
    },

    {
      id: "jmw_bar_late",
      title: "Last Orders",
      background: "/film/img/s8/240-the-far-end.jpg",
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      // Whoever got to Okada got here first — the price of the Hive first.
      onEnterActions: [{ consequences: { setFlags: ["jmw_bar_done"] } }],
      prose:
        "Okada's, after dark. The new mat is gone. The stools are down. Two men Jack doesn't know sit at the far end of the counter with a bottle between them and no glasses. They are not drinking. Okada is behind the counter, and he does not look up when the door opens.",
      dialogueBeats: [
        { id: "jmw_bl_b1", characterId: "okada", text: "We're closed." },
        { id: "jmw_bl_b2", characterId: "narrator", text: "Somebody has been here since this morning, and it was not the police. Okada's left eye is puffed and yellowing. He sets a glass on the counter for Jack without being asked, and then moves it two inches away from where Jack's hand is going to be." },
        {
          id: "jmw_bl_b_named1", characterId: "okada",
          conditionRule: { requiresFlags: ["jmw_okada_named"] },
          text: "Kurose's men. They come in, they sit, they don't drink. That is the whole conversation.",
        },
        {
          id: "jmw_bl_b_named2", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_okada_named"] },
          text: "He slides a page across the counter, folded twice. A page torn from a notebook. The top line reads: 1.00 — SAKAI — \"just listen\". Under it: bring the girl's photo. She has to see a face she knows.",
        },
        {
          id: "jmw_bl_b_drank1", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_okada_drank"] },
          text: "Jack orders the drink and says nothing at all. It takes eleven minutes. Okada watches the two men in the mirror the whole time, and when he speaks it is very quiet and in Japanese and does not stop the mop.",
        },
        {
          id: "jmw_bl_b_drank2", characterId: "okada",
          conditionRule: { requiresFlags: ["jmw_okada_drank"] },
          text: "That page in the till. Take it now, in your pocket, and don't read it here. I can't have it found on me.",
        },
        {
          id: "jmw_bl_b_closed", characterId: "okada",
          conditionRule: { requiresFlags: ["jmw_okada_closed"] },
          text: "Go home.",
        },
        {
          id: "jmw_bl_b_closed2", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_okada_closed"] },
          text: "He goes back to wiping the counter with a cloth that is already clean. The two men at the far end have not moved, and they have not drunk, and they have not looked round once, which is how Jack knows they know exactly who he is.",
        },
      ],
      choices: [
        {
          id: "jmw_bl_c_name",
          text: "Name them. The two at the end of the counter — who are they?",
          reply: true,
          timeLimitSeconds: 8,
          consequences: {
            setFlags: ["jmw_okada_named", "jmw_clue_notebook"],
            trustChanges: [{ characterId: "okada", delta: 1 }],
          },
          timedOutConsequences: { setFlags: ["jmw_okada_closed"], trustChanges: [{ characterId: "okada", delta: -1 }] },
          memoryLog: "mem_okada_named",
          rememberLine: "Okada will remember that you asked him, not about him.",
        },
        {
          id: "jmw_bl_c_who",
          text: "Who did that to your face?",
          reply: true,
          consequences: { setFlags: ["jmw_okada_closed"], trustChanges: [{ characterId: "okada", delta: -1 }] },
          memoryLog: "mem_okada_face",
          rememberLine: "Okada will remember that you made him look at it.",
        },
        {
          id: "jmw_bl_c_drink",
          text: "Order the drink. Say nothing. Let him talk when he can.",
          reply: true,
          consequences: { setFlags: ["jmw_okada_drank", "jmw_clue_notebook"] },
        },
        {
          id: "jmw_bl_c_silent",
          text: "…",
          reply: true,
          consequences: { setFlags: ["jmw_okada_closed"] },
        },
        {
          id: "jmw_bl_c_car",
          text: "Back to the car. The lane, at one in the morning, in the rain.",
          targetSceneId: "jmw_stakeout",
          isRepeatable: true,
        },
      ],
    },

    {
      id: "jmw_hive",
      title: "Forgotten By The City",
      onEnterActions: [{ consequences: { setFlags: ["jmw_leads_open", "jmw_hive_first"] } }],
      background: "/film/img/s15/432-the-hive.jpg",
      particles: "rain",
      particleConfig: { density: 1.0, wind: 0.7 },
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "Rain. A wide street of new glass towers and chain stores. Between two towers, a long white construction hoarding: KUROSE DEVELOPMENT, and a painted plaza full of smiling people who don't exist. Behind it, low and dark and patched, the Hive. A dense, self-built block of stacked homes and workshops rising eleven storeys, balconies bolted onto balconies, air conditioners and pipes and laundry and hand-painted signs, all of it crushed together under the curve of the elevated railway. The city has grown up around it and forgotten it is there.",
      dialogueBeats: [
        { id: "jmw_hv_b1", characterId: "narrator", text: "Jack stands on the pavement with the sketchbook under his coat. He looks up at the Hive for a long moment, as if at someone he used to know. Then he goes in." },
        { id: "jmw_hv_b2", characterId: "narrator", text: "At the back, the tower steps down to a low rear wing pressed hard against the concrete railway viaduct. Old neon signs hang dead on its face. The service door at the bottom of it is swollen shut with four days of rain." },
        {
          id: "jmw_hv_b_slip", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_slipped_in"] },
          text: "One shoulder, one breath, and the door gives with a sound nobody two corridors away will hear over a train. The dark takes him in.",
        },
        {
          id: "jmw_hv_b_noticed", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_hive_noticed"] },
          text: "He knocks. Somewhere above him a window goes up, and a woman's voice asks him what he wants, and the whole building stops talking long enough to hear his answer. By the time he gets inside, three people have written his coat down in their heads.",
        },
      ],
      choices: [
        {
          // QUICK-TIME 2 — a door to get through.
          id: "jmw_hv_c_qte",
          text: "Shoulder it. One go, before anybody walks past.",
          reply: true,
          quickTime: true,
          timeLimitSeconds: 5,
          qtePrompt: "THE SERVICE DOOR — SHOULDER IT",
          qteHeartbeat: true,
          consequences: { setFlags: ["jmw_slipped_in"] },
          timedOutConsequences: { setFlags: ["jmw_hive_noticed"] },
        },
        {
          id: "jmw_hv_c_knock",
          text: "Knock. Ask. It's a building full of people; somebody will let you in.",
          reply: true,
          consequences: { setFlags: ["jmw_hive_noticed"] },
        },
        {
          id: "jmw_hv_c_passage",
          text: "Inside, then. The corridors are barely shoulder-wide.",
          targetSceneId: "jmw_passage",
          isRepeatable: true,
        },
      ],
    },

    {
      id: "jmw_hive_late",
      title: "The Hive — After Dark",
      background: "/film/img/s15/184-a-gap-in-someones-teeth.jpg",
      particles: "rain",
      particleConfig: { density: 1.1, wind: 0.8 },
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      onEnterActions: [{ consequences: { setFlags: ["jmw_bar_done"] } }],
      prose:
        "By the time he reaches the service road, the light has gone out of it. The long white hoarding, KUROSE DEVELOPMENT, a painted plaza full of smiling people who don't exist. Behind it the Hive, eleven storeys of stacked homes and workshops crushed together under the curve of the elevated railway, sitting in its own haze of steam and kitchen smoke, as if it had its own weather.",
      dialogueBeats: [
        { id: "jmw_hl_b1", characterId: "narrator", text: "Somebody has been here since Okada's. The service door stands open a hand's width, and inside, one bare bulb has been left burning over an empty stair. Somebody wanted it found." },
        { id: "jmw_hl_b2", characterId: "narrator", text: "On the step: a wet footprint, adult, facing outward. Not Jack's size. Going out, not coming in, and recent enough that the rain hasn't got to it yet." },
        {
          id: "jmw_hl_b_slip", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_slipped_in"] },
          text: "He goes in on the balls of his feet and lets the door close behind him at the same speed it was already closing. Whoever is two corridors ahead will hear a door, and doors in this building are always going off.",
        },
        {
          id: "jmw_hl_b_noticed", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_hive_noticed"] },
          text: "He waits an hour in the lee of the viaduct with his collar up, which is an hour in which the Hive decides what it thinks of him. When he finally goes in, a radio somewhere changes station, and he does not think that is a coincidence.",
        },
      ],
      choices: [
        {
          id: "jmw_hl_c_in",
          text: "Go in now, while the door is still warm.",
          reply: true,
          consequences: { setFlags: ["jmw_slipped_in"] },
        },
        {
          id: "jmw_hl_c_wait",
          text: "Wait him out. Nobody comes back for an empty doorway.",
          reply: true,
          consequences: { setFlags: ["jmw_hive_noticed"] },
        },
        {
          id: "jmw_hl_c_passage",
          text: "Inside, then. The corridors are barely shoulder-wide.",
          targetSceneId: "jmw_passage",
          isRepeatable: true,
        },
      ],
    },

    {
      id: "jmw_passage",
      title: "Everybody Sees Him",
      background: "/film/img/s16/186-everybody-sees-him.jpg",
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      onEnterActions: [{ consequences: { setFlags: ["jmw_hive_done"] } }],
      prose:
        "Narrow corridors, barely shoulder-wide, lit by bare bulbs. Water drips from somewhere above and runs along the floor in a thin shining line. Pipes overhead. Wires everywhere. What daylight gets in comes in thin cold shafts from gaps far overhead, thick with drifting steam.",
      dialogueBeats: [
        { id: "jmw_pg_b0", characterId: "narrator", text: "Somewhere in the stairwell, a bare bulb buzzes and water finds a floor.", sfxUrl: "/film/sfx/loop-hive-stairwell.mp3" },
        { id: "jmw_pg_b1", characterId: "narrator", text: "Doors stand open onto other lives. A MAN at a bench mending radios, a dozen of them murmuring different stations at once. A FAMILY eating dinner at four in the afternoon, the TV loud. An OLD WOMAN asleep in front of a sumo match. A dentist's chair behind a curtain, a hand-lettered price list taped to the wall." },
        { id: "jmw_pg_b2", characterId: "narrator", text: "Jack walks through it all. Nobody stops him. Everybody sees him." },
        { id: "jmw_pg_b3", characterId: "narrator", text: "A TRAIN passes overhead. The whole building trembles. Dust sifts down through the bulb light. Nobody looks up." },
        {
          id: "jmw_pg_b_noticed", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_hive_noticed"] },
          text: "Two passages back, a door that had been standing open closes. The radios don't miss a beat, but the corridor gets quieter in a way that has nothing to do with sound.",
        },
        {
          id: "jmw_pg_b_slip", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_slipped_in"] },
          text: "The steam takes him in and closes behind him like water. For a man who has been walking this city for twenty years, he is not being watched for the first time today, but it is the first time he doesn't mind.",
        },
        { id: "jmw_pg_b4", characterId: "narrator", text: "He turns a corner and stops. The noodle counter. Six stools. The curtain. The hand-painted sign, faded almost to nothing but unmistakable. It is exactly the drawing." },
      ],
      choices: [
        {
          id: "jmw_pg_c_sit",
          text: "Sit down at the counter.",
          targetSceneId: "jmw_counter",
          isRepeatable: true,
        },
      ],
    },

    {
      id: "jmw_counter",
      title: "You Got Old",
      background: "/film/img/s17/187-you-got-old.jpg",
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "Steam. A single fluorescent tube. Two customers slurping in silence at the far end. Behind the counter, KANEKO (70s), tiny and sharp-eyed, works a pot with long chopsticks. She looks up as Jack sits at the counter. She looks at him for a long time. Longer than a stranger would.",
      dialogueBeats: [
        { id: "jmw_co_b0", characterId: "narrator", text: "A pot, a radio somewhere behind the curtain, and the long hiss of steam.", sfxUrl: "/film/sfx/loop-noodle-counter.mp3" },
        { id: "jmw_co_b1", characterId: "kaneko", text: "You got old.", audioUrl: "/film/voice/s17/189-kaneko-dryly-you-got-old.mp3" },
        { id: "jmw_co_b2", characterId: "jack", text: "So did you.", audioUrl: "/film/voice/s17/189-jack-so-did-you.mp3" },
        { id: "jmw_co_b3", characterId: "kaneko", text: "I was already old. You were a boy in a cheap suit, the only foreign face on the force. Japanese papers, American face. You came here with the American. Everything is going. We are just slower.", audioUrl: "/film/voice/s17/189-kaneko-i-was-already-old-you-were.mp3" },
        { id: "jmw_co_b4", characterId: "jack", text: "I'm looking for his daughter. The younger one.", audioUrl: "/film/voice/s17/189-jack-quietly-i-m-looking-for-his.mp3" },
        { id: "jmw_co_b5", characterId: "kaneko", text: "The little one? She was four years old. She ate rice with her fingers.", audioUrl: "/film/voice/s17/189-kaneko-flatly-the-little-one-she-was.mp3" },
        { id: "jmw_co_b6", characterId: "jack", text: "She's twenty-four now. And someone wants to kill her.", audioUrl: "/film/voice/s17/189-jack-she-s-twenty-four-now-and.mp3" },
        { id: "jmw_co_b7", characterId: "narrator", text: "Kaneko's chopsticks don't pause. The two customers at the end of the counter have stopped slurping. She sets a bowl of noodles in front of Jack." },
        { id: "jmw_co_b8", characterId: "kaneko", text: "Eat. Then go. There is no one here but us.", audioUrl: "/film/voice/s17/189-kaneko-gruffly-eat-then-go-pause-there.mp3" },
        {
          id: "jmw_co_b_ate", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_kaneko_ate"] },
          text: "He eats. Slowly. He finishes everything. He puts down a little more than the bowl costs, and a business card on top of it.",
        },
        {
          id: "jmw_co_b_ate2", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_kaneko_ate"] },
          text: "He always paid too much, too.",
          audioUrl: "/film/voice/s17/189-jack-quietly-he-always-paid-too-much.mp3",
        },
        {
          id: "jmw_co_b_ate3", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_kaneko_ate"] },
          text: "Kaneko looks at the card for a long moment. Behind the curtain, in the dark of the storeroom, something moves. Neither of them acknowledges it.",
        },
        {
          id: "jmw_co_b_pushed", characterId: "kaneko",
          conditionRule: { requiresFlags: ["jmw_kaneko_pushed"] },
          text: "There is no one here but us. That is not me being careful. That is me telling you the truth, and you not liking it.",
        },
        {
          id: "jmw_co_b_pushed2", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_kaneko_pushed"] },
          text: "The two customers get up and leave without finishing their bowls. She does not look at the card on the counter, and when he takes it back she lets him.",
        },
        {
          id: "jmw_co_b_paid", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_kaneko_paid"] },
          text: "He puts down more than the bowl costs, and his card on top of it, and goes. Kaneko looks at the card for a long moment. Behind the curtain, nothing moves at all.",
        },
        {
          id: "jmw_co_b_cold", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_kaneko_cold"] },
          text: "The silence goes on. The fluorescent tube hums. Kaneko wipes the same square of counter until the cloth is wet, and the two customers at the end finish up and pay and go, and neither of the people left in the room says a word.",
        },
      ],
      choices: [
        {
          id: "jmw_co_c_eat",
          text: "Eat. Every mouthful. Pay too much. Say nothing else.",
          reply: true,
          timeLimitSeconds: 9,
          consequences: { setFlags: ["jmw_kaneko_ate"], trustChanges: [{ characterId: "kaneko", delta: 1 }] },
          timedOutConsequences: { setFlags: ["jmw_kaneko_cold"], trustChanges: [{ characterId: "kaneko", delta: -1 }] },
          memoryLog: "mem_kaneko",
          rememberLine: "Kaneko will remember that you ate what she gave you and asked for nothing.",
        },
        {
          id: "jmw_co_c_push",
          text: "Push. She's in this building. You know it.",
          reply: true,
          consequences: { setFlags: ["jmw_kaneko_pushed"], trustChanges: [{ characterId: "kaneko", delta: -1 }] },
          memoryLog: "mem_kaneko_push",
          rememberLine: "Kaneko will remember that you pushed her in her own shop.",
        },
        {
          id: "jmw_co_c_card",
          text: "Leave the card and the money. Go, without another word.",
          reply: true,
          consequences: { setFlags: ["jmw_kaneko_paid"] },
        },
        {
          id: "jmw_co_c_silent",
          text: "…",
          reply: true,
          consequences: { setFlags: ["jmw_kaneko_cold"] },
        },
        {
          // The bar is still standing between him and the car — but only on
          // the road that came here first.
          id: "jmw_co_c_bar",
          text: "Out into the rain. Okada's is still open, and he has had all day to think.",
          targetSceneId: "jmw_bar_late",
          hidden: true,
          gating: { excludesFlags: ["jmw_bar_done"] },
          isRepeatable: true,
        },
        {
          id: "jmw_co_c_car",
          text: "Back to the car. Somebody came back to that street once already.",
          targetSceneId: "jmw_stakeout",
          hidden: true,
          gating: { requiresFlags: ["jmw_bar_done"] },
          isRepeatable: true,
        },
      ],
    },

    /* ================================================================ *
     *  THE STAKEOUT — VERA, FORTY METRES BACK                           *
     * ================================================================ */
    {
      id: "jmw_stakeout",
      title: "Forty Metres",
      background: "/film/img/s14a/337-engine-off.jpg",
      particles: "rain",
      particleConfig: { density: 1.3, wind: 1.0 },
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "Rain. Wipers. He stops at the mouth of the lane, exactly where the sedan stopped, and kills the engine and lights. Rain on the windscreen, no wipers; the glass turns the lane into smears of light. At the far end, small and amber, the bar sign.",
      dialogueBeats: [
        { id: "jmw_so_b1", characterId: "narrator", text: "Forty metres back, a pair of headlights slows. Stops. Goes out. He waits, long enough to be sure. Then he gets out and walks back along the wet road toward the dark car, one hand in his pocket. A small, boxy, maroon hatchback, its glass steamed. He raps on the driver's window with a knuckle. It winds down. Vera, both hands on the wheel." },
        { id: "jmw_so_b2", characterId: "vera", text: "Is that what you were holding?" },
        { id: "jmw_so_b3", characterId: "narrator", text: "He takes his hand from his pocket. The old steel lighter, open, unlit. He snaps it shut." },
        { id: "jmw_so_b4", characterId: "jack", text: "It's what I had." },
        { id: "jmw_so_b5", characterId: "jack", text: "Forty metres. Twenty minutes. You never once lost me." },
        { id: "jmw_so_b6", characterId: "vera", text: "Is that bad?" },
        { id: "jmw_so_b7", characterId: "jack", text: "It's what a professional does." },
        { id: "jmw_so_b8", characterId: "vera", text: "Who did you think I was?" },
        { id: "jmw_so_b9", characterId: "jack", text: "Somebody who'd be worse company." },
        { id: "jmw_so_b10", characterId: "vera", text: "You said you'd look. You didn't say where. I waited outside your office." },
        { id: "jmw_so_b11", characterId: "jack", text: "If you can follow me, so can they." },
        { id: "jmw_so_b12", characterId: "vera", text: "I brought food." },
        { id: "jmw_so_b13", characterId: "narrator", text: "He sighs the sigh of a man who has lost an argument he was never allowed to make." },
        { id: "jmw_so_b14", characterId: "jack", text: "Park round the corner, then get in mine. One car is a man waiting. Two is somebody watching." },
        {
          id: "jmw_so_b_stay1", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_vera_stayed"] },
          text: "What are we waiting for?",
        },
        {
          id: "jmw_so_b_stay2", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_vera_stayed"] },
          text: "Whoever comes back.",
        },
        {
          id: "jmw_so_b_stay3", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_vera_stayed"] },
          text: "Back?",
        },
        {
          id: "jmw_so_b_stay4", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_vera_stayed"] },
          text: "Someone came back to this street that night. The barber heard one car, twice. Nobody comes back for what they already have.",
        },
        {
          id: "jmw_so_b_stay5", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_vera_stayed"] },
          text: "What didn't they have?",
        },
        {
          id: "jmw_so_b_stay6", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_vera_stayed"] },
          text: "I don't know yet.",
        },
        {
          id: "jmw_so_b_stay7", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_vera_stayed"] },
          text: "She shakes the blue umbrella out onto his floor. From a paper bag, two convenience-store rice balls. She holds one out: \"You were eating one when I came in. I assumed it was a lifestyle.\" — \"This is a stakeout. Nothing happens.\" — \"Then I won't miss anything.\" He takes it. Their fingers don't touch. Both notice that they don't. The red bird clip swings from the mirror on its loop of string.",
        },
        {
          id: "jmw_so_b_sent", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_vera_sent_home"] },
          text: "She goes, and the lane is quieter for it and colder. He eats one rice ball and leaves the other on the passenger seat where she put it, wrapped, for an hour, and then eats that one too, and hates himself a little for it.",
        },
        {
          id: "jmw_so_b_told1", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_told_vera_alive"] },
          text: "Alive?",
        },
        {
          id: "jmw_so_b_told2", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_told_vera_alive"] },
          text: "I don't know. I think so. I think somebody is hiding her, and I think they're doing it because of what she saw, and I think that makes her the safest she has been in four days and the least safe she is ever going to be again.",
        },
        {
          id: "jmw_so_b_told3", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_told_vera_alive"] },
          text: "Then take me with you.",
        },
        {
          id: "jmw_so_b_told4", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_told_vera_alive"] },
          text: "No.",
        },
        {
          id: "jmw_so_b_told5", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_told_vera_alive"] },
          text: "Jack —",
        },
        {
          id: "jmw_so_b_told6", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_told_vera_alive"] },
          text: "When I know, you'll know. That's not the same as no.",
        },
        {
          id: "jmw_so_b_held", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_held_it_back"] },
          text: "He lets it sit. The rice ball in her lap, unwrapped, uneaten. A long silence. She looks at him for the first time since she sat down. He is looking at the lane. He doesn't look back.",
        },
        { id: "jmw_so_b15", characterId: "narrator", text: "A figure at the road end, under a black umbrella tilted low, face lost beneath it. He walks past the car and into the lane. He goes to the bar's shuttered door. Tries the handle. Stands under the amber sign, looking up and down the lane." },
        {
          id: "jmw_so_b16", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_vera_stayed"] },
          text: "Then he turns back toward the road, and the umbrella swings toward the car. Jack's arm goes out across Vera, pressing her back into the seat. Not looking. Reflex. The umbrella holds on them. Then turns away.",
        },
        { id: "jmw_so_b17", characterId: "narrator", text: "The man walks to a small white car further up the road and gets in. He doesn't start it. He sits. They sit very still. After a long time the white car pulls out and goes, without hurry." },
      ],
      choices: [
        {
          id: "jmw_so_c_letstay",
          text: "Let her stay. Tell her what you're waiting for.",
          reply: true,
          hidden: true,
          gating: { minTrust: { vera: 1 } },
          consequences: { setFlags: ["jmw_vera_stayed"], trustChanges: [{ characterId: "vera", delta: 1 }] },
          memoryLog: "mem_stay",
          rememberLine: "Vera will remember that you let her sit in the car.",
        },
        {
          id: "jmw_so_c_sendhome",
          text: "Send her home. This is not a passenger seat.",
          reply: true,
          consequences: { setFlags: ["jmw_vera_sent_home"], trustChanges: [{ characterId: "vera", delta: -1 }] },
          memoryLog: "mem_sent",
          rememberLine: "Vera will remember that you sent her home out of the rain.",
        },
        {
          id: "jmw_so_c_truth",
          text: "Tell her. Mara may be alive, and you are close enough to smell it.",
          reply: true,
          timeLimitSeconds: 9,
          consequences: {
            setFlags: ["jmw_told_vera_alive"],
            trustChanges: [{ characterId: "vera", delta: 2 }, { characterId: "mara", delta: -1 }],
          },
          timedOutConsequences: { setFlags: ["jmw_held_it_back"] },
          memoryLog: "mem_told_vera",
          rememberLine: "Vera will remember that you told her. Mara will remember that you told her.",
        },
        {
          id: "jmw_so_c_silent",
          text: "…",
          reply: true,
          consequences: { setFlags: ["jmw_held_it_back"] },
        },
        {
          id: "jmw_so_c_plate",
          text: "Write the plate down. Paper bag, pencil stub, knee.",
          targetSceneId: "jmw_letter",
          exclusiveGroup: "jmw_plate",
          consequences: { setFlags: ["jmw_watcher_plate"] },
        },
        {
          id: "jmw_so_c_down",
          text: "Both of you down. Don't be seen. Let the number go.",
          targetSceneId: "jmw_letter",
          exclusiveGroup: "jmw_plate",
          consequences: { setFlags: ["jmw_plate_missed"] },
        },
      ],
    },

    {
      id: "jmw_letter",
      title: "After The Last Train",
      background: "/film/img/s18/189-after-the-last-train.jpg",
      particles: "rain",
      particleConfig: { density: 0.9, wind: 0.6 },
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "Rain. The old television plays static. Jack sits in the dark, the sketchbook open on the desk. He turns to the last page. Tucked inside the back cover: a letter, folded small, creased as though it had been crumpled into a ball and smoothed flat again.",
      dialogueBeats: [
        { id: "jmw_le_b1", characterId: "narrator", text: "He unfolds it under the lamp. Cheap lined paper. Careful, laborious English handwriting." },
        { id: "jmw_le_b2", characterId: "narrator", text: "\"Miss Voss. Your father did not kill himself. I can prove it. I have kept his papers for twenty years. I am old and I am ill and I do not want to carry them any more. Please telephone.\" A phone number. The signature: T. SAKAI." },
        { id: "jmw_le_b3", characterId: "narrator", text: "The envelope folded inside it is addressed to VERA VOSS. Jack reads the letter twice. Then he looks at the name on the envelope for a long time." },
        { id: "jmw_le_b4", characterId: "narrator", text: "The black rotary phone RINGS. He answers. Listens." },
        {
          // Whether the phone rings at all is Kaneko's trust, earned four
          // hours ago over a bowl of noodles.
          id: "jmw_le_b_call", characterId: "kaneko",
          conditionRule: { minTrust: { kaneko: 1 } },
          text: "Come back. Alone. After the last train.",
        },
        {
          id: "jmw_le_b_call2", characterId: "narrator",
          conditionRule: { minTrust: { kaneko: 1 } },
          text: "The line clicks dead. He holds the receiver a moment longer than he needs to.",
        },
        {
          id: "jmw_le_b_nocall", characterId: "narrator",
          conditionRule: { excludesFlags: ["jmw_kaneko_ate"] },
          text: "Static. A woman breathing once, on the other end of the line, saying nothing at all. Then the dial tone. He puts the receiver down and opens the sketchbook instead: six stools, a curtain, a hand-painted sign, and behind the counter, a door he did not go through this afternoon.",
        },
        {
          id: "jmw_le_b_vera1", characterId: "vera",
          conditionRule: { requiresFlags: ["jmw_told_vera_letter"] },
          text: "You had this. You had this in your desk and you did not tell me.",
        },
        {
          id: "jmw_le_b_vera2", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_told_vera_letter"] },
          text: "I had it for six hours. You had it for four days, in your bin, and you didn't read it either.",
        },
        {
          id: "jmw_le_b_vera3", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_told_vera_letter"] },
          text: "She reads it three times. When she looks up, her face has gone very still, the way it goes when she has decided something and is not going to say what.",
        },
        {
          id: "jmw_le_b_burn", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_burned_letter"] },
          text: "He holds it over the ashtray and lets the corner take. Cheap paper, careful handwriting, twenty years of a dead man's kept papers going up in one small orange curl. Somebody died carrying this. He is not going to be the second.",
        },
        {
          id: "jmw_le_b_keep", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_kept_letter"] },
          text: "He folds it back along its own creases and puts it inside his coat, next to the photograph of two men laughing at a noodle counter.",
        },
      ],
      choices: [
        {
          id: "jmw_le_c_vera",
          text: "Call Vera. She has a right to read her own letter.",
          reply: true,
          timeLimitSeconds: 9,
          consequences: {
            setFlags: ["jmw_told_vera_letter"],
            trustChanges: [{ characterId: "vera", delta: 2 }, { characterId: "mara", delta: -1 }],
          },
          timedOutConsequences: { setFlags: ["jmw_kept_letter"] },
          memoryLog: "mem_letter",
          rememberLine: "Vera will remember that you gave her the letter. Mara will remember that you gave it to her.",
        },
        {
          id: "jmw_le_c_keep",
          text: "Keep it. Not until you know what it proves.",
          reply: true,
          consequences: { setFlags: ["jmw_kept_letter"] },
        },
        {
          id: "jmw_le_c_burn",
          text: "Burn it. Somebody already died carrying it.",
          reply: true,
          consequences: { setFlags: ["jmw_burned_letter"], trustChanges: [{ characterId: "vera", delta: -1 }] },
          memoryLog: "mem_burned",
          rememberLine: "Vera will never know what was in it. Neither will her sister.",
        },
        {
          id: "jmw_le_c_silent",
          text: "…",
          reply: true,
          // Saying nothing here is its own answer, and Vera hears it.
          consequences: {
            setFlags: ["jmw_kept_letter"],
            trustChanges: [{ characterId: "vera", delta: -1 }],
          },
        },
        {
          id: "jmw_le_c_go",
          text: "Back to the Hive. After the last train. Alone.",
          targetSceneId: "jmw_storeroom",
          isRepeatable: true,
        },
      ],
    },

    /* ================================================================ *
     *  THE STOREROOM                                                    *
     * ================================================================ */
    {
      id: "jmw_storeroom",
      title: "Prove It",
      background: "/film/img/s20/191-prove-it.jpg",
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "Past midnight. The shutter half down. The single bulb burning. Kaneko lifts the curtain to the storeroom and stands aside. Flour sacks. The futon. The bare bulb. Mara sits on the futon with her knees up and her phone to her ear, listening.",
      dialogueBeats: [
        { id: "jmw_sr_b0", characterId: "narrator", text: "A train goes over the viaduct above the storeroom, and the whole building takes it.", sfxUrl: "/film/sfx/loop-viaduct.mp3" },
        { id: "jmw_sr_b1", characterId: "narrator", text: "\"You left your umbrella. You'll get soaked. Just call me. You don't have to say anything. Just call, so I know.\" The message ends. She plays it again. Jack is in the doorway. She scrambles back against the wall." },
        { id: "jmw_sr_b2", characterId: "jack", text: "My name is Jack. Your sister hired me.", audioUrl: "/film/voice/s20/193-jack-my-name-is-jack-your-sister.mp3" },
        { id: "jmw_sr_b3", characterId: "mara", text: "Prove it.", audioUrl: "/film/voice/s20/193-mara-shakily-prove-it.mp3" },
        {
          id: "jmw_sr_b_proof_lost", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_clip_lost"] },
          text: "Jack sets her sketchbook on a flour sack between them, and on top of it the small red enamel bird. The clip she lost under a shelf in a bar in Kanda four nights ago, and would have sworn nobody saw fall.",
        },
        {
          id: "jmw_sr_b_proof_kept", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_kept_clip"] },
          text: "Jack sets her sketchbook on a flour sack between them. That is all he has. The red bird is still in her hair, four nights on, and she touches it once, to be sure.",
        },
        { id: "jmw_sr_b5", characterId: "jack", text: "She says it was hers. She says you stole it when you were kids and never gave it back.", audioUrl: "/film/voice/s20/194-jack-she-says-it-was-hers-she.mp3" },
        { id: "jmw_sr_b6", characterId: "mara", text: "It was never hers. Dad gave it to me. She just says that.", audioUrl: "/film/voice/s20/194-mara-tearfully-it-was-never-hers-dad.mp3" },
        { id: "jmw_sr_b7", characterId: "narrator", text: "Something in Mara's face gives way. She pulls the sketchbook into her lap. She almost laughs, and then she is crying, silently, pressing the back of her wrist against her mouth." },
        { id: "jmw_sr_b8", characterId: "narrator", text: "Jack waits. He doesn't go to her. He sits down on a flour sack, slowly, making himself smaller." },
        { id: "jmw_sr_b9", characterId: "mara", text: "Is she okay? Is she — does she know you're —", audioUrl: "/film/voice/s20/194-mara-desperately-is-she-okay-is-she.mp3" },
        { id: "jmw_sr_b10", characterId: "narrator", text: "He doesn't answer. So she asks again." },
        { id: "jmw_sr_b11", characterId: "mara", text: "Is she okay?", audioUrl: "/film/voice/s20/194-mara-bitterly-is-she-okay.mp3" },
        { id: "jmw_sr_b12", characterId: "jack", text: "She's been calling you. She hasn't slept.", audioUrl: "/film/voice/s20/194-jack-she-s-been-calling-you-she.mp3" },
        { id: "jmw_sr_b13", characterId: "mara", text: "I know. I listen to them.", audioUrl: "/film/voice/s20/194-mara-flatly-i-know-i-listen-to.mp3" },
        { id: "jmw_sr_b14", characterId: "jack", text: "Why were you in Kanda, Mara?", audioUrl: "/film/voice/s20/194-jack-why-were-you-in-kanda-mara.mp3" },
        { id: "jmw_sr_b15", characterId: "narrator", text: "She looks at him. Decides." },
        { id: "jmw_sr_b16", characterId: "mara", text: "He wrote to Vera. Mr. Sakai. She threw it in the bin without even answering. I took it out. I called him. He said he had Dad's papers. He said to come to the bar at one o'clock. There'd be a man from a newspaper there too, so it couldn't be buried again. I sent them both a photo so they'd know me. He wrote back one line. \"You have his face.\"", audioUrl: "/film/voice/s20/194-mara-he-wrote-to-vera-mr-sakai.mp3" },
        { id: "jmw_sr_b17", characterId: "jack", text: "Vera doesn't know you went.", audioUrl: "/film/voice/s20/194-jack-vera-doesn-t-know-you-went.mp3" },
        { id: "jmw_sr_b18", characterId: "mara", text: "We had a fight about it. I called her a coward. And I'm the one hiding in a storeroom. Don't tell her I'm here.", audioUrl: "/film/voice/s20/284-mara-we-had-a-fight-about-it.mp3" },
        { id: "jmw_sr_b19", characterId: "jack", text: "She's your sister.", audioUrl: "/film/voice/s20/284-jack-she-s-your-sister.mp3" },
        { id: "jmw_sr_b20", characterId: "mara", text: "They have my purse. My passport. They know my name. They know where I live, where she lives, all of it. If she knows where I am, she'll come here. She won't be able to help it. And they'll follow her. They'll use her to get to me. And then they'll kill her too.", audioUrl: "/film/voice/s20/284-mara-urgently-they-have-my-purse-they.mp3" },
        { id: "jmw_sr_b21", characterId: "jack", text: "You don't know that.", audioUrl: "/film/voice/s20/284-jack-you-don-t-know-that.mp3" },
        { id: "jmw_sr_b22", characterId: "mara", text: "I watched them shoot two men like they were switching off lights.", audioUrl: "/film/voice/s20/284-mara-tearfully-i-watched-them-shoot-two.mp3" },
        {
          // If he has already told Vera anything, the room knows it.
          id: "jmw_sr_b_told1", characterId: "mara",
          conditionRule: { requiresFlags: ["jmw_told_vera_alive", "jmw_told_vera_letter"], requiresAll: false },
          text: "You told her.",
        },
        {
          id: "jmw_sr_b_told2", characterId: "jack",
          conditionRule: { requiresFlags: ["jmw_told_vera_alive", "jmw_told_vera_letter"], requiresAll: false },
          text: "I told her you might be alive. I did not tell her where, and I have not told her, and I am telling you before I tell her anything else.",
        },
        {
          id: "jmw_sr_b_told3", characterId: "mara",
          conditionRule: { requiresFlags: ["jmw_told_vera_alive", "jmw_told_vera_letter"], requiresAll: false },
          text: "She'll come. You know she'll come. She has never once in her life not come.",
        },
        { id: "jmw_sr_b23", characterId: "narrator", text: "Silence. The bulb hums." },
        {
          id: "jmw_sr_b_bolt1", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_mara_bolted"] },
          text: "Something moves in the passage outside. A foot on the stair, then another, then the particular silence of two men who have stopped to listen. She is off the futon before he has finished turning his head, and there is not enough room in a storeroom for a man his size to be quick.",
        },
        {
          id: "jmw_sr_b_caught", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_caught_her"] },
          text: "He gets two fingers of her sleeve and then her wrist, and she stops, and the two of them stand absolutely still with her arm across the doorway while the footsteps in the passage decide to go up instead of down.",
        },
        {
          id: "jmw_sr_b_blocked", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_blocked_door"] },
          text: "He puts himself between her and the curtain and keeps his hands where they can be seen, and when the curtain moves it is Kaneko, with a dishcloth, who looks at the two of them and says nothing and goes back to her pot.",
        },
        {
          id: "jmw_sr_b_key", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_key_seen"] },
          text: "She takes the key from around her neck, on its loop of shoelace, and holds it out — then thinks better of it, and only lets him look. A small brass key, worn smooth. Its stamped tag reads: 114.",
        },
        {
          id: "jmw_sr_b_key2", characterId: "mara",
          conditionRule: { requiresFlags: ["jmw_key_seen"] },
          text: "Find what it opens. And then this ends. I don't want to hide any more. I want my sister.",
        },
        { id: "jmw_sr_b24", characterId: "mara", text: "Promise me.", audioUrl: "/film/voice/s20/284-mara-promise-me.mp3" },
      ],
      choices: [
        /* — a noise in the passage; she goes for the curtain — */
        {
          // QUICK-TIME 3 — a hand to catch.
          id: "jmw_sr_c_qte",
          text: "Catch her. Two fingers, sleeve, wrist — anything.",
          reply: true,
          hidden: true,
          gating: { excludesFlags: ["jmw_mara_bolted", "jmw_caught_her", "jmw_blocked_door"] },
          quickTime: true,
          timeLimitSeconds: 5,
          qtePrompt: "HER HAND — CATCH IT",
          qteHeartbeat: true,
          qteShakyCam: true,
          consequences: { setFlags: ["jmw_caught_her"], trustChanges: [{ characterId: "mara", delta: 1 }] },
          timedOutConsequences: { setFlags: ["jmw_mara_bolted"], trustChanges: [{ characterId: "mara", delta: -1 }] },
        },
        {
          id: "jmw_sr_c_block",
          text: "Step between her and the curtain. Let them see only you.",
          reply: true,
          hidden: true,
          gating: { excludesFlags: ["jmw_mara_bolted", "jmw_caught_her", "jmw_blocked_door"] },
          consequences: { setFlags: ["jmw_blocked_door"], trustChanges: [{ characterId: "mara", delta: 1 }] },
        },
        {
          id: "jmw_sr_c_letgo",
          text: "Let her go. She's faster than you and she knows this building.",
          reply: true,
          hidden: true,
          gating: { excludesFlags: ["jmw_mara_bolted", "jmw_caught_her", "jmw_blocked_door"] },
          consequences: { setFlags: ["jmw_mara_bolted"], trustChanges: [{ characterId: "mara", delta: -1 }] },
        },
        /* — and then the promise — */
        {
          id: "jmw_sr_c_promise",
          text: "You have my word. I won't tell her.",
          reply: true,
          hidden: true,
          gating: { minTrust: { mara: 1 }, excludesFlags: ["jmw_mara_bolted", "jmw_pledge_made"] },
          timeLimitSeconds: 10,
          consequences: {
            setFlags: ["jmw_out_promise", "jmw_promised_mara", "jmw_key_seen", "jmw_pledge_made"],
            trustChanges: [{ characterId: "mara", delta: 1 }],
          },
          timedOutConsequences: { setFlags: ["jmw_out_flour", "jmw_mara_half", "jmw_pledge_made"] },
          memoryLog: "mem_promise",
          rememberLine: "Mara will remember that you gave her your word.",
        },
        {
          id: "jmw_sr_c_night",
          text: "One night. Then we talk about telling her.",
          reply: true,
          hidden: true,
          gating: { excludesFlags: ["jmw_mara_bolted", "jmw_pledge_made"] },
          consequences: { setFlags: ["jmw_out_flour", "jmw_mara_half", "jmw_pledge_made"] },
        },
        {
          id: "jmw_sr_c_tell",
          text: "She's out of her mind with it. I'm telling her tonight.",
          reply: true,
          hidden: true,
          gating: { excludesFlags: ["jmw_mara_bolted", "jmw_pledge_made"] },
          consequences: {
            setFlags: ["jmw_out_bolt", "jmw_mara_gone", "jmw_pledge_made"],
            trustChanges: [{ characterId: "mara", delta: -1 }, { characterId: "vera", delta: 1 }],
          },
          memoryLog: "mem_told_anyway",
          rememberLine: "Mara will remember that you told her. So will Vera.",
        },
        {
          id: "jmw_sr_c_silent",
          text: "…",
          reply: true,
          hidden: true,
          gating: { excludesFlags: ["jmw_mara_bolted", "jmw_pledge_made"] },
          consequences: { setFlags: ["jmw_out_flour", "jmw_mara_half", "jmw_pledge_made"] },
        },
        {
          id: "jmw_sr_c_toolate",
          text: "Go after her. Down the passage, into the steam, after a girl with a twenty-metre start.",
          reply: true,
          hidden: true,
          gating: { requiresFlags: ["jmw_mara_bolted"] },
          consequences: { setFlags: ["jmw_out_bolt", "jmw_pledge_made"] },
        },
        {
          // She has asked him a question. He does not get to leave the room
          // without answering it — which is also what keeps the ledger fed.
          id: "jmw_sr_c_ledger",
          text: "The bulb hums. Somewhere below, a pot goes down on steel.",
          targetSceneId: "jmw_ledger",
          hidden: true,
          gating: { requiresFlags: ["jmw_pledge_made"] },
          isRepeatable: true,
        },
      ],
    },

    /* ================================================================ *
     *  END OF EPISODE — what you did, then the ending you earned        *
     * ================================================================ */
    {
      id: "jmw_ledger",
      title: "What You Did",
      background: "/film/img/s20/346-the-bulb-hums.jpg",
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "The bulb hums. Two floors below, a pot is put down on a stainless counter and a radio is switched off for the night. The Hive goes on being a building with four hundred people in it, and not one of them is going to mention the man in the noodle-shop storeroom.",
      dialogueBeats: [
        {
          id: "jmw_lg_b_answered", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_answered_vera"] },
          text: "Her sister called her at ten to one in the morning. Mara answered, said nothing about Kanda, and hung up.",
        },
        {
          id: "jmw_lg_b_declined", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_declined_vera"] },
          text: "Her sister called her at ten to one in the morning. Mara watched the screen light up and let it go dark.",
        },
        {
          id: "jmw_lg_b_words", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_sakai_words"] },
          text: "She was six metres away when they shot him, and she ran to him, and she heard the only thing he said that mattered.",
        },
        {
          id: "jmw_lg_b_watched", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_watched_only"] },
          text: "She was six metres away when they shot him, and she stayed in the doorway, and whatever it was he came to say went into the rain with him.",
        },
        {
          id: "jmw_lg_b_clip", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_clip_lost"] },
          text: "She left a red bird clip under a shelf in a bar in Kanda. A man with a mop found it, and gave it to her sister, and did not give it to the police.",
        },
        {
          id: "jmw_lg_b_keptclip", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_kept_clip"] },
          text: "She kept the red bird clip. It was still in her hair four nights later, when a man she had never met sat down on a flour sack and told her who had sent him.",
        },
        {
          id: "jmw_lg_b_ishida_told", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_told_ishida_lead"] },
          text: "He telephoned Ishida at twenty past midnight and told him the Voss girl had come to his office.",
        },
        {
          id: "jmw_lg_b_ishida_quiet", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_kept_from_ishida"] },
          text: "He did not telephone Ishida. Ishida will hear about the Voss girl from somebody else, and he will know exactly when he was told.",
        },
        {
          id: "jmw_lg_b_notebook", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_clue_notebook"] },
          text: "He is carrying a page torn from a dead journalist's notebook. It says: 1.00 — SAKAI — \"just listen\". Under it: bring the girl's photo. She has to see a face she knows.",
        },
        {
          id: "jmw_lg_b_kaneko", characterId: "narrator",
          conditionRule: { minTrust: { kaneko: 1 } },
          text: "Kaneko fed him and did not put him out, and when the time came she telephoned him herself.",
        },
        {
          id: "jmw_lg_b_kaneko_push", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_kaneko_pushed"] },
          text: "He pushed an old woman in her own shop, in front of her own customers. She has not forgotten it, and the Hive has a long memory for that sort of thing.",
        },
        {
          id: "jmw_lg_b_asked", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_okada_asked"] },
          text: "In the doorway of a bar he had been told to leave, he asked an old man what he saw, and made him say it out loud in front of his own floor mat.",
        },
        {
          id: "jmw_lg_b_bowed", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_okada_bowed"] },
          text: "He bowed, took the card, and asked an old man nothing at all. Some doors stay shut because nobody pushes them, and some because somebody already did.",
        },
        {
          id: "jmw_lg_b_okada_named", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_okada_named"] },
          text: "Okada named the men at the end of his counter, having already been hit once for saying less.",
        },
        {
          id: "jmw_lg_b_okada_closed", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_okada_closed"] },
          text: "Okada closed. Whoever got to him got there before Jack did, and Jack will never know what the man was going to say.",
        },
        {
          id: "jmw_lg_b_bar_first", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_bar_first"] },
          text: "He went to the bar first. By the time he stood in the service road, somebody had already been through the Hive and left a light on to be found.",
        },
        {
          id: "jmw_lg_b_hive_first", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_hive_first"] },
          text: "He went to the Hive first. Okada had an hour alone with his own thoughts before anybody knocked, and by nightfall he had company he did not choose.",
        },
        {
          id: "jmw_lg_b_told", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_told_vera_alive", "jmw_told_vera_letter"], requiresAll: false },
          text: "He told Vera. Not where. But he told her, and now she is somewhere in this city not sleeping and knowing that much.",
        },
        {
          id: "jmw_lg_b_held", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_held_it_back"] },
          text: "He let the moment pass and told Vera nothing, and she sat in his car in the rain and ate nothing, and did not ask again.",
        },
        {
          id: "jmw_lg_b_vera_trust", characterId: "narrator",
          conditionRule: { minTrust: { vera: 2 } },
          text: "Vera Voss trusts him. Not wisely. Not entirely. Enough to sit in a parked car in the rain at one in the morning and wait for whatever comes back down the lane.",
        },
        {
          id: "jmw_lg_b_vera_cold", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_vera_sent_home"] },
          text: "Vera Voss does not trust him. She is paying him, and she is calling him, and she has stopped telling him anything she does not have to.",
        },
        {
          id: "jmw_lg_b_bolt", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_mara_bolted"] },
          text: "He let go of her hand.",
        },
        {
          id: "jmw_lg_b_promised", characterId: "narrator",
          conditionRule: { requiresFlags: ["jmw_promised_mara"] },
          text: "He gave her his word, and she gave him a number. Somewhere in this city there is a locker with that number on it, and tomorrow he is going to go and look at it.",
        },
      ],
      choices: [
        {
          id: "jmw_lg_c_bolt",
          text: "The curtain. Shoes on the stair. Go.",
          targetSceneId: "jmw_end_bolt",
          hidden: true,
          gating: { requiresFlags: ["jmw_out_bolt"] },
          isRepeatable: true,
        },
        {
          id: "jmw_lg_c_promise",
          text: "Down through the steam, out into the rain, and home to write down a number.",
          targetSceneId: "jmw_end_promise",
          hidden: true,
          gating: { requiresFlags: ["jmw_out_promise"] },
          isRepeatable: true,
        },
        {
          id: "jmw_lg_c_flour",
          text: "Down through the steam, out into the rain, and home to an office with the television on.",
          targetSceneId: "jmw_end_flour",
          hidden: true,
          gating: { requiresFlags: ["jmw_out_flour"] },
          isRepeatable: true,
        },
        {
          // Belt and braces: the storeroom always sets one of the three
          // outcome flags, so this never shows. It exists so that a future
          // edit which forgets to can never strand a player here.
          id: "jmw_lg_c_fallback",
          text: "Down through the steam, out into the rain, and home to an office with the television on.",
          targetSceneId: "jmw_end_flour",
          hidden: true,
          gating: { excludesFlags: ["jmw_out_bolt", "jmw_out_promise", "jmw_out_flour"] },
          isRepeatable: true,
        },
      ],
    },

    /* ================================================================ *
     *  THE THREE ENDINGS                                                *
     * ================================================================ */
    {
      id: "jmw_end_promise",
      title: "The Promise",
      background: "/film/img/s20/192-the-red-bird-clip.jpg",
      isEnding: true,
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "Jack looks at her for a long moment. Twenty years of silence sit behind his eyes. \"I promise.\" She believes him. She takes the key from around her neck, on its loop of shoelace, and holds it out — then thinks better of it, and only lets him look. A small brass key, worn smooth. Its stamped tag reads: 114. Find what it opens. And then this ends. I don't want to hide any more. I want my sister. A TRAIN passes overhead. Somewhere above them, eleven storeys of somebody's home hold together and go on. The Hive keeps its secret for one more night, and Jack Morrow keeps two.",
      endingData: {
        tier: "victory-gold",
        headline: "THE PROMISE",
        recap:
          "You found her, and she believed you. She is alive, in a storeroom under a noodle counter, and she has given you a number and your word back. Somewhere in this city a locker is waiting with 114 on the door — and somewhere else, a sister is still calling a phone nobody answers.",
      },
    },
    {
      id: "jmw_end_flour",
      title: "Flour Sacks",
      background: "/film/img/s20/346-the-bulb-hums.jpg",
      isEnding: true,
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "\"One night. Then we talk about telling her.\" She nods, because a night is a thing she can survive, and a conversation is not. She puts the key back inside her shirt and does not show him the number on it. Jack sits down on the flour sack again and makes himself smaller, and the two of them listen to a building going to bed around them. He has found her. That is all he has done. He has bought a night, and a girl who will still be here at seven in the morning if he comes back at seven in the morning, which he will, and which she does not yet believe. The bulb hums. The Hive holds its breath. One night.",
      endingData: {
        tier: "victory-silver",
        headline: "FLOUR SACKS",
        recap:
          "You found her, and she let you stay. No key, no number, no promise worth the word — a night, bought, in a storeroom under a noodle counter. Mara Voss is alive, and she does not trust you yet, and tomorrow is not promised to either of you.",
      },
    },
    {
      id: "jmw_end_bolt",
      title: "The Curtain",
      background: "/film/img/s20/437-vera-doesnt-know.jpg",
      isEnding: true,
      ambientAudio: "rain",
      cinematic: { mode: "static", colorGrade: GRADE },
      letterbox: true,
      prose:
        "She is through the curtain before he has both feet under him, and the storeroom is the wrong shape for a man his size to be quick in. By the time he is in the passage there is nothing in it but steam and a swinging curtain and the smell of a noodle pot going cold. Somewhere below, shoes on a stair, going down, unhurried, the way men walk when they have already found what they came for. On the futon, her phone, still lit, playing a message to nobody: \"You left your umbrella. You'll get soaked. Just call me. You don't have to say anything. Just call, so I know.\" He stands in the steam until it stops moving. Then he goes home, and the television is still on, and the lighter opens and shuts, opens and shuts, and there are no cigarettes anywhere in the room.",
      endingData: {
        tier: "gameover",
        headline: "THE CURTAIN",
        recap:
          "You found her and lost her in the same minute. Mara Voss is somewhere in eleven storeys of a building that does not talk to policemen or private investigators, with a brass key she did not show you and a sister who still does not know. Somebody else's shoes were already on the stair.",
      },
    },
  ],
};
