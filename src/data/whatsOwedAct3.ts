import type { SceneNode } from "../types";

/**
 * WHAT'S OWED — ACT THREE: THE CHOICE
 *
 * Two exits. Rosa's last offer and the truth. He chooses himself. The
 * narration is failing — going quiet in the places it used to explain.
 * Plates are Pass 5 + Pass 6 of six.
 */

const img = (n: string) => `/img/whats-owed/${n}.jpg`;

export const WHATS_OWED_ACT_3: SceneNode[] = [
  /* ---------------------------------------------------------------- */
  /* 20 — TWO EXITS                                                   */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s500",
    title: "20. Two Exits",
    note: "Beat 20. The sale closes in days. Money or the gun — he cannot do both. The visits end either way, which is the part he can't look at directly. The wall scene: two columns, both in his handwriting.",
    nodeType: "cutscene",
    background: img("p420-two-exits"),
    ambientAudio: "drone",
    particles: "smoke",
    transition: "fade-black",
    transitionSpeed: 1.4,
    letterbox: true,
    choiceDelaySeconds: 3,
    cinematic: {
      mode: "dolly",
      dollyDirection: "right",
      dollyDistance: 8,
      dollyDuration: 13,
      dimAmount: 0.5,
      lights: [{ x: 50, y: 40, color: "#ffb761", intensity: 0.3, size: 18, pulseSeconds: 6, pulseAmount: 0.35 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.55,
    },
    prose: "Nine days to the fourteenth. The office wall had two columns on it now, in the same handwriting, which is the tell nobody warns you about.",
    dialogueBeats: [
      {
        id: "wo_b500a",
        characterId: "jack",
        expression: "V.O. — laying out the two exits like they're equivalent. They never were.",
        text: "The quiet exit: keep selling. Six two against thirty-eight, with nine days — it's arithmetic, not sentiment. You find the rest or you find a rich fool. Paper for paper. You take her someplace out of state and never touch Solomon Reyes again as long as you live.",
      },
      {
        id: "wo_b500b",
        characterId: "jack",
        expression: "V.O. — the loud exit, dressed up as the other one.",
        text: "The loud exit: you kill him. And the beautiful thing — the thing my ten years spent polishing this up to — the loud exit looks like the quiet one from a distance. Same goal. Girl free, debt dead, bill settled. It's only up close you can see that one of them is for her.",
      },
      {
        id: "wo_b500c",
        characterId: "jack",
        expression: "V.O. — the part he can't look at directly, stated while looking directly away from it.",
        text: "One more feature of the product line. The quiet exit ends the visits. So does the loud one. The house stops being a house either way, and the terrible coffee stops being poured, and the porch goes back to being a porch. I didn't look at that. I want that on the record — I did not look at that.",
      },
    ],
    choices: [
      { id: "wo_c500", text: "The sub-basement. One more time.", targetSceneId: "wo_s510", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 21 — ROSA'S LAST OFFER, AND THE TRUTH                            */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s510",
    title: "21. Rosa's Last Offer",
    note: "Beat 21. Thin, slow, legitimate — two years. She asks him to wait, and tells him what it cost. When he refuses she finally tells him why he really lost the badge. SHE ends the friendship. Two plates.",
    nodeType: "cutscene",
    background: img("p430-rosa-truth"),
    ambientAudio: "drone",
    transition: "fade",
    transitionSpeed: 1,
    letterbox: true,
    choiceDelaySeconds: 3,
    cinematic: {
      mode: "static",
      dimAmount: 0.45,
      lights: [{ x: 40, y: 42, color: "#cfe3ee", intensity: 0.3, size: 18, pulseSeconds: 7, pulseAmount: 0.25 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.5,
    },
    prose: "She found me before I found the fourteenth. Parking structure, third level, her sedan with the engine ticking — the same pose as the night I spent her, and this time I was the one with something to hand over.",
    dialogueBeats: [
      {
        id: "wo_b510a",
        characterId: "rosa",
        expression: "the offer — thin, slow, legitimate, real",
        text: "I built something. You get one conversation before I go back to being a rumor in a sub-basement. Delgado's file, the Skid Row ledger, the notary who's been signing Reyes paper since Ford — cross-indexed, notarized, slow as a court date. It might work, Jack. In two years. I need you to not be stupid for two years.",
      },
      {
        id: "wo_b510b",
        characterId: "jack",
        text: "Two years. Rosa, she gets sold out of state in nine days.",
      },
      {
        id: "wo_b510c",
        characterId: "rosa",
        text: "Then buy her out. You've got six thousand, don't look at me like that, everybody knows a man liquidating. Write letters to Sacramento. Be ready to be a pen pal for two years, because THAT is what legal looks like when it's honest. And it cost — you know what building it cost. You know because you're the reason. Say it. SAY IT.",
      },
      {
        id: "wo_b510d",
        characterId: "jack",
        text: "Rosa—",
      },
      {
        id: "wo_b510e",
        characterId: "rosa",
        expression: "the truth. Finally. She has carried it for ten years like a wire with a hook in it, and she puts it down here, on purpose, because the true version finishes him and she's done paying for his version.",
        text: "Fine. Here it is. Nineteen seventy-nine. You took money. Four hundred dollars from Pacific Mercantile's people to look the wrong way on a skimming case — a liquor store, Jack, a MINOR thing, beneath you, the kind of thing you've spent a decade calling the rot of the city. And Solomon sat on it. Never used it. Never called. A receipt in a drawer for a man who wasn't worth collecting. Then IA came asking about the eighth floor, and Solomon Reyes — the man your whole life is organized against — declined to intervene. Declined, Jack. You sold yourself for four hundred dollars and the man who bought you didn't even come back for the rest of you.",
        background: img("p431-the-truth"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.3,
      },
      {
        id: "wo_b510f",
        characterId: "jack",
        expression: "V.O. — failing. The voice that explained every scene, trying to explain this one.",
        text: "That's not— the eighth floor took the badge, Reyes owned the eighth floor, ten years I've had the— four hundred. Four hundred dollars. I built a cathedral on it. A whole religion of being wronged, candles and everything, and the pillar it stands on says FOUR HUNDRED in a ledger nobody ever even looked at until—",
      },
      {
        id: "wo_b510g",
        characterId: "rosa",
        expression: "she ends it. The friendship ends here, and she ends it, and it's mercy.",
        text: "I let you keep your version because the true one would finish you, and I liked — I LIKED, goddammit — the guy who got up in the morning. I liked him better broke. So. Two years. Be my witness. Be the guy I liked.",
      },
      {
        id: "wo_b510h",
        characterId: "jack",
        text: "Nine days, Rosa.",
        background: img("p440-bar-last"),
        backgroundTransition: "fade-black",
        backgroundTransitionSpeed: 1.3,
      },
      {
        id: "wo_b510i",
        characterId: "rosa",
        expression: "flat. Finished. The booth, the empty glasses, her hand flat on the table between them and then gone.",
        text: "Then we're done, Jack. Not fighting. Done. Go home. Don't call me for the file, don't call me for the funeral, don't call me from the scene. You've had the last thing I had left to give you — it was the truth, and it was free, and look what it bought.",
      },
      {
        id: "wo_b510j",
        characterId: "jack",
        text: "…",
        silent: true,
      },
    ],
    choices: [
      { id: "wo_c510", text: "The night of the twelfth", targetSceneId: "wo_s520", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 22 — HE CHOOSES HIMSELF                                          */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s520",
    title: "22. The Choice",
    note: "Beat 22. Stage it so the audience sees the choice against Jenny's interest while the narration insists it's for her. THE detail: the money stays on the table. He takes the gun.",
    nodeType: "cutscene",
    background: img("p450-the-choice"),
    ambientAudio: "drone",
    musicMode: "none",
    transition: "fade-black",
    transitionSpeed: 1.5,
    letterbox: true,
    choiceDelaySeconds: 3,
    cinematic: {
      mode: "dolly-zoom",
      dollyZoomAmount: 1.25,
      dollyZoomDuration: 12,
      dollyZoomDirection: "push",
      dollyZoomBlur: 4,
      dimAmount: 0.55,
      lights: [{ x: 60, y: 45, color: "#ffb761", intensity: 0.3, size: 10, pulseSeconds: 4, pulseAmount: 0.5 }],
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.6,
    },
    prose: "The night of the twelfth. The Plymouth, outside the Baxter house, windows down. On the passenger seat: the envelope with six thousand one hundred dollars. In the door pocket, wrapped in a dish towel: the .38 I never cleaned.",
    dialogueBeats: [
      {
        id: "wo_b520a",
        characterId: "jack",
        expression: "V.O. — insisting it's for her. The image: the money, untouched, on the seat.",
        text: "This is for Jenny. Say it. She's free when he's— say it. This is for Jenny. She'll be safe, the paper burns with him, no sale, no out-of-state, no ledger with her in the back of it. This is for her. This is for—",
      },
      {
        id: "wo_b520b",
        characterId: "narrator",
        text: "He checked the envelope one more time — counted what was left of the decent exit — and left it on the table of his office when he went back for the towel.",
        silent: true,
      },
      {
        id: "wo_b520c",
        characterId: "jack",
        expression: "V.O. — the last full paragraph the voiceover will ever get, and it's this.",
        text: "Two years of letters, and she's in an office park in Phoenix answering somebody else's terrible coffee, and the man who built the cage is alive in a restaurant somewhere saying her name into a frog phone. Or: the cage builder stops building cages, tonight, and the whole sick book burns with him. Both plans are for her. One of them is for me. I got in the car. Draw your own conclusions. I drew mine in advance and I'm sticking with the press release.",
      },
    ],
    choices: [
      { id: "wo_c520", text: "The safe", targetSceneId: "wo_s530", attitudeTag: "Aggressive" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 22b — THE GUN                                                    */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s530",
    title: "22b. The Gun",
    note: "Beat 22 coda. The office, the towel, the narration going quiet on him mid-explanation. One short beat. After this the V.O. barely survives two more lines in the whole act.",
    nodeType: "cutscene",
    background: img("p460-the-gun"),
    ambientAudio: "drone",
    transition: "fade",
    transitionSpeed: 0.9,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "zoom-hold",
      focalPoint: "50% 55%",
      zoomDuration: 8,
      dimAmount: 0.5,
      lights: [{ x: 52, y: 50, color: "#ffd9a0", intensity: 0.35, size: 10, pulseSeconds: 5, pulseAmount: 0.4 }],
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.55,
    },
    prose: "The safe combination is my badge number. Still is. Ten years and I never changed it, which tells you everything about how much of me ever left that building.",
    dialogueBeats: [
      {
        id: "wo_b530a",
        characterId: "jack",
        expression: "V.O. — trying for one more clean paragraph and losing the thread in the middle.",
        text: "A man does a thing like this for one of two reasons, and if you've been paying attention you know which one— you know which one it— it's four hundred dollars, that's the joke, four hundred, and every road in this town runs through a ledger, and mine runs through—",
      },
      {
        id: "wo_b530b",
        characterId: "jack",
        text: "…",
        silent: true,
      },
    ],
    choices: [
      { id: "wo_c530", text: "The parking structure on Baxter", targetSceneId: "wo_s540", attitudeTag: "Aggressive" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 23 — FERRIS                                                      */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s540",
    title: "23. Ferris",
    note: "Beat 23. Not a duel. Ugly, short, closer than it should be. Jack survives it badly. Ferris does not become interesting on the way out. Two plates; shaky cam; the narration has almost nothing left and knows it.",
    nodeType: "cutscene",
    background: img("p470-fight"),
    ambientAudio: "drone",
    transition: "fade-black",
    transitionSpeed: 1.3,
    letterbox: true,
    choiceDelaySeconds: 3,
    cinematic: {
      mode: "shake",
      shakeAmount: 0.65,
      shakeDuration: 0.4,
      dimAmount: 0.5,
      lights: [{ x: 50, y: 60, color: "#ffb761", intensity: 0.25, size: 12, pulseSeconds: 3, pulseAmount: 0.6 }],
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.6,
    },
    prose: "The basement laundry room of the Baxter house. One bulb, four dryers, a mop sink. Ferris was doing a load of towels. He saw the gun the way you see weather coming, and sighed, and took it away from me in four seconds.",
    dialogueBeats: [
      {
        id: "wo_b540a",
        characterId: "ferris",
        expression: "evenly. He is polite to you throughout.",
        text: "Evening, Jack.",
      },
      {
        id: "wo_b540b",
        characterId: "narrator",
        text: "It wasn't a duel. A duel has rules and an audience and a reason. This was two men in a hot room, and a gun that changed hands twice, and a dryery door, and teeth. Ninety seconds. It was closer than it should have been, and it was ugly, and nothing in it will ever be described as fighting.",
        silent: true,
        background: img("p480-fight-after"),
        backgroundTransition: "fade-black",
        backgroundTransitionSpeed: 1.2,
      },
      {
        id: "wo_b540c",
        characterId: "narrator",
        text: "At the end of it Ferris was on the concrete by the mop sink, being nobody, the same way he'd been nobody the whole time. It didn't feel like winning. It felt like a room where a load of towels was going to need re-washing.",
        background: img("p541-the-dryers"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.1,
        silent: true,
      },
      {
        id: "wo_b540d",
        characterId: "jack",
        expression: "V.O. — what's left of it. Almost nothing. Quiet in the place it used to explain.",
        text: "My hand was ruined and my ribs were a filing cabinet someone kicked over, and the gun was back in my hand, and I stood there breathing like a debt. That's it. That's the whole report. There's nothing to be learned from a man like that dying in a laundry room. I looked anyway.",
      },
    ],
    choices: [
      { id: "wo_c540", text: "Upstairs", targetSceneId: "wo_s550", attitudeTag: "Aggressive" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 24 — SOLOMON, LAST SCENE                                         */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s550",
    title: "24. Solomon",
    note: "Beat 24. Krantz present and leaves before anything happens — nothing to say to a man with a gun and no standing. Solomon isn't frightened, doesn't plead, and points out — accurately, gently — that he and Jack want the same thing: to be owed. Jack kills him anyway. It resolves nothing. Three plates.",
    nodeType: "cutscene",
    background: img("p490-solomon-final"),
    ambientAudio: "drone",
    musicMode: "none",
    transition: "fade-black",
    transitionSpeed: 1.6,
    letterbox: true,
    choiceDelaySeconds: 3,
    cinematic: {
      mode: "dolly-zoom",
      dollyZoomAmount: 1.35,
      dollyZoomDuration: 14,
      dollyZoomDirection: "push",
      dollyZoomBlur: 5,
      dimAmount: 0.45,
      lights: [{ x: 50, y: 38, color: "#ffd9a0", intensity: 0.35, size: 12, pulseSeconds: 5, pulseAmount: 0.4 }],
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.6,
    },
    prose: "His office was lit like a Sunday. Solomon at the long window with a glass of something, no staff in the building I could hear. Krantz was at the desk, capping her pen over a stack of closing documents as thick as a Bible.",
    dialogueBeats: [
      {
        id: "wo_b550a",
        characterId: "krantz",
        expression: "assessing. Nothing here to manage. She gathers the portfolio and leaves before anything happens.",
        text: "Mr. Morrow. You have a gun, no standing, and no attorney I'd wish on you. There's nothing in this room for me to manage. Mr. Reyes — the fourteenth documents are executed. Good evening, gentlemen.",
      },
      {
        id: "wo_b550b",
        characterId: "narrator",
        text: "She left the way weather leaves. Nobody in the history of that building ever saw Adele Krantz hurry, and nobody ever saw her stay where the air was bad.",
        silent: true,
      },
      {
        id: "wo_b550c",
        characterId: "solomon",
        expression: "unhurried. Not frightened. Doesn't plead. Turns, glass in hand, mildly interested.",
        text: "Jack. You look terrible. The hand too — sit down, there's ice— no? All right. All right.",
      },
      {
        id: "wo_b550d",
        characterId: "jack",
        text: "It's done, Solomon. He's done in a laundry room downstairs. The book is yours tonight and it's worth nothing, and you're going to call the house and take her name off it, and then we'll see what the courts do with the rest.",
      },
      {
        id: "wo_b550e",
        characterId: "solomon",
        expression: "accurate. Gentle. The one speech he gets, and it's the diagnosis.",
        text: "Jack. Jack, Jack, Jack. You and I want the same thing, and neither of us can help it. To be owed. Me, I keep books — somebody owes, I feel rich. You keep feelings — somebody owes you, you feel alive. Vera owed. Jenny owes — don't make that face, she's the only one in this story who never owed anybody, which is why she's the only one leaving whole, and you can't stand it, because if she doesn't need you then you're just a man with a gun in a nice office, and that's all you ever were. The difference between us, Jack, is I keep books and you keep feelings, and mine balance.",
      },
      {
        id: "wo_b550f",
        characterId: "jack",
        text: "She was going to be free in a fortnight. You knew that. The new holder writes off bad paper — you KNEW, and you were going to sell her anyway. That's the difference between us.",
      },
      {
        id: "wo_b550g",
        characterId: "solomon",
        text: "That's the difference between a lender and a— Jack. Nobody fights paperwork. Not even you.",
      },
      {
        id: "wo_b550h",
        characterId: "narrator",
        text: "It resolved nothing. That's the honest report. Two shots, and the room stayed exactly as it was — the lamp on the floor, still on; the paperwork snowing down off the desk; and Solomon on the rug looking surprised at nothing, the way he looked at everything, unhurried.",
        silent: true,
        background: img("p500-kill"),
        backgroundTransition: "fade-black",
        backgroundTransitionSpeed: 1.2,
      },
      {
        id: "wo_b550i",
        characterId: "jack",
        expression: "V.O. — the shortest entry the voiceover has made since the alley.",
        text: "He never took his hand out of his pocket. I keep coming back to that. A man stands in front of a gun and keeps his hand where it was, like the whole thing was beneath his dignity, and part of me— no. There's no part of me. There's a room.",
        background: img("p510-office-after"),
        backgroundTransition: "crossfade",
        backgroundTransitionSpeed: 1.4,
      },
    ],
    choices: [
      { id: "wo_c550", text: "The house on Baxter, that minute", targetSceneId: "wo_s560", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 25 — TOMÁS STANDS ASIDE                                          */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s560",
    title: "25. Tomás Stands Aside",
    note: "Beat 25. Nobody's paying him this week, nobody's answering the phone, so he lets her go — pleasantly, with real affection. Not releasing her: clocking off. Years of her kindness bought nothing; an interruption in payroll bought everything. Jenny sees it clearly. Jack doesn't. Two plates.",
    nodeType: "cutscene",
    background: img("p520-tomas-door"),
    transition: "fade",
    transitionSpeed: 1.1,
    letterbox: true,
    choiceDelaySeconds: 3,
    cinematic: {
      mode: "static",
      dimAmount: 0.25,
      lights: [{ x: 50, y: 44, color: "#ffd9a0", intensity: 0.35, size: 20, pulseSeconds: 6, pulseAmount: 0.2 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.45,
    },
    prose: "Jack came up the drive through a house gone wrong — phones dead, the office door standing open, nobody's radio on. Jenny was already on the stairs with a bag. And Tomás was in the doorway, holding it, with a paper bag of groceries in one hand.",
    dialogueBeats: [
      {
        id: "wo_b560a",
        characterId: "tomas",
        expression: "unhurried. Nobody's paid him this week. Nobody's answering the phone.",
        text: "Hey. Before you — phones are dead. Landline, cell, the office line, all of it. Nobody came by today with the envelope. Nobody called about next week. I called the city number and it rings to a machine that says the number's changed.",
      },
      {
        id: "wo_b560b",
        characterId: "jenny",
        text: "Tomás—",
      },
      {
        id: "wo_b560c",
        characterId: "tomas",
        expression: "pleasantly. With real affection. He isn't releasing her. He's clocking off.",
        text: "Go on, then. Go be a person. It's Thursday — you always liked Thursdays.",
      },
      {
        id: "wo_b560d",
        characterId: "narrator",
        text: "Four years of her kindness bought nothing. An interruption in payroll bought everything. Jenny saw it in one look — you could watch her understand it, the whole ledger of the thing, a ledger she'd been the asset in twice.",
        silent: true,
        background: img("p530-clockoff"),
        backgroundTransition: "crossfade",
        backgroundTransitionSpeed: 1.1,
      },
      {
        id: "wo_b560e",
        characterId: "jenny",
        expression: "her hand on his cheek. Mean it. Then to Jack, seeing it clear as glass.",
        text: "You understand? All those years he was kind, and it was the paycheck that let me go. Not the kindness. The kindness got me soup, Jack. Do you get it? No. You will anyway. You'll get it at three in the morning some night and it'll do you good.",
        background: img("p560-empty-kitchen"),
        backgroundTransition: "crossfade",
        backgroundTransitionSpeed: 1.3,
      },
      {
        id: "wo_b560f",
        characterId: "jack",
        expression: "V.O. — a voice with a limper and a limp.",
        text: "I said something. I don't remember what. He nodded at me like a man at a bus stop.",
      },
    ],
    choices: [
      { id: "wo_c560", text: "She goes", targetSceneId: "wo_s570", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 26 — SHE GOES                                                    */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s570",
    title: "26. She Goes",
    note: "Beat 26. Free — or free enough. Leaves, not in anger. Warm to the end. Forgives him on the way out the door — that's what makes it unbearable. She never learns he caused Vera's death; the audience carries that alone. Three plates.",
    nodeType: "cutscene",
    background: img("p540-she-goes"),
    transition: "fade",
    transitionSpeed: 1.1,
    letterbox: true,
    choiceDelaySeconds: 3,
    cinematic: {
      mode: "pan",
      panDistance: 6,
      panDirection: "right",
      dimAmount: 0.15,
      colorGrade: "spielberg-golden",
      filmGrade: true,
      filmGradeStrength: 0.35,
    },
    prose: "Morning came up grey and warm, the way it does here, like the city had been up all night too and couldn't be judged for anything. She walked down the porch steps with the powder blue coat over her arm and didn't put it on.",
    dialogueBeats: [
      {
        id: "wo_b570a",
        characterId: "jenny",
        expression: "plain. Warm. Not angry — decided.",
        text: "I've spent my whole life belonging to men who settle accounts with guns. My father. The bank. Vera — she settled with paper, which is its own kind. And now you. I'm not doing it again by choice. You understand? By CHOICE. That's the whole fortune I've got, and I'm spending it on a bus station.",
      },
      {
        id: "wo_b570b",
        characterId: "jack",
        text: "Jenny—",
      },
      {
        id: "wo_b570c",
        characterId: "jenny",
        expression: "the forgiveness, on the way out the door. Free. Immediate. Unbearable.",
        text: "I know. I know what you didn't say — all of it, every piece. You're forgiven. I know you think you need to be asked first. You don't. That's the trick nobody tells you — the asking was always the price, and it was never mine to charge.",
        background: img("p550-goodbye"),
        backgroundTransition: "crossfade",
        backgroundTransitionSpeed: 1.2,
      },
      {
        id: "wo_b570d",
        characterId: "jenny",
        text: "Eat something today that isn't from a cart. And when you tell this story — because you will, it's the only thing you do — tell it right for once. Tell it with her name in it. Both of them.",
      },
      {
        id: "wo_b570e",
        characterId: "narrator",
        text: "She went down the walk and turned left, toward the boulevard, and the city took her the way the city takes everyone — immediately, and without comment. The kitchen door stood open behind him. Three cups on the table. Nobody coming back for them.",
        silent: true,
        background: img("p560-empty-kitchen"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.6,
      },
      {
        id: "wo_b570f",
        characterId: "jack",
        expression: "V.O. — a voice with nothing left to organize.",
        text: "I stood in the kitchen a while. It was a nice room.",
      },
    ],
    choices: [
      { id: "wo_c570", text: "Weeks later", targetSceneId: "wo_s580", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 27 — THE NOTICE                                                  */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s580",
    title: "27. The Notice",
    note: "Beat 27. The sale closed regardless — accelerated, executed by Krantz the way she'd execute anything. A courtesy copy, administratively thorough and not cruel. The new holder wrote Jenny's line off. She was free in a fortnight either way. Give him no reaction shot worth the name.",
    nodeType: "cutscene",
    background: img("p570-notice"),
    ambientAudio: "drone",
    musicMode: "none",
    transition: "fade-black",
    transitionSpeed: 1.5,
    letterbox: true,
    choiceDelaySeconds: 3,
    cinematic: {
      mode: "zoom-hold",
      focalPoint: "52% 46%",
      zoomDuration: 12,
      dimAmount: 0.35,
      lights: [{ x: 55, y: 40, color: "#e8f2ff", intensity: 0.25, size: 16, pulseSeconds: 9, pulseAmount: 0.1 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.5,
    },
    prose: "Death doesn't stop paper. It accelerates it. The sale closed eleven days after the alley — Krantz executed the thing the way she'd execute anything, on time, without comment. A copy came to my office a month later, first class, mailed as a courtesy. Krantz is administratively thorough and not cruel. That's what makes it lethal. It isn't gloating. Gloating has a pulse. This was a filing.",
    dialogueBeats: [
      {
        id: "wo_b580a",
        characterId: "narrator",
        text: "Crest of the new holder — some lender out of state. A cover letter, an assignment schedule, one page highlighted. The new holder had reviewed the book and written off the uncollectable lines. One line item highlighted in the margin note: female, thirty-six, no assets, no prospect of recovery, not worth collecting.",
        background: img("p571-the-line"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.3,
        silent: true,
      },
      {
        id: "wo_b580b",
        characterId: "narrator",
        text: "Two thousand miles away, in a house she'd have been carried to and outlived, a debt that outlived everybody in this story died quietly in a review queue. She was going to be free in a fortnight either way. An accounting clerk who will never know her name did what he couldn't, by doing nothing at all, on a Tuesday.",
        silent: true,
      },
      {
        id: "wo_b580c",
        characterId: "jack",
        expression: "no reaction shot worth the name. The coffee is the whole scene.",
        text: "The coffee was cold. I drank it anyway.",
      },
    ],
    choices: [
      { id: "wo_c580", text: "Last image", targetSceneId: "wo_s590", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 28 — LAST IMAGE                                                  */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s590",
    title: "28. Last Image",
    note: "Beat 28. Jack alone, everything he said he wanted, obtained. Final narration: the shortest in the film, and it explains nothing.",
    nodeType: "cutscene",
    background: img("p580-office-final"),
    ambientAudio: "drone",
    transition: "fade-black",
    transitionSpeed: 1.8,
    letterbox: true,
    choiceDelaySeconds: 4,
    cinematic: {
      mode: "static",
      dimAmount: 0.25,
      lights: [{ x: 60, y: 35, color: "#ffb761", intensity: 0.4, size: 22, pulseSeconds: 10, pulseAmount: 0.15 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.5,
    },
    prose: "",
    dialogueBeats: [
      {
        id: "wo_b590a",
        characterId: "jack",
        expression: "V.O. — what he got. Read flat. No music under it anywhere.",
        text: "Solomon Reyes: dead. The book: burned before it could be sold. Jenny Voss: free. Everything I said I wanted, obtained.",
      },
      {
        id: "wo_b590b",
        characterId: "jack",
        expression: "V.O. — the final line. The shortest in the film. It explains nothing.",
        text: "Paid.",
        background: img("p590-city-final"),
        backgroundTransition: "fade-black",
        backgroundTransitionSpeed: 2,
      },
    ],
    choices: [
      { id: "wo_c590", text: "Roll credits", targetSceneId: "wo_s600", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* END CREDITS                                                      */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s600",
    title: "WHAT'S OWED — end",
    nodeType: "credits",
    background: img("p590-city-final"),
    ambientAudio: "jazz",
    noTypewriter: true,
    transition: "fade-black",
    transitionSpeed: 1.6,
    letterbox: true,
    choiceDelaySeconds: 3,
    credits: {
      title: "WHAT'S OWED",
      subtitle: "Los Angeles forgave nobody. It never does — it isn't built for it.",
      style: "cards",
      cardSeconds: 2.8,
      font: "poster",
      cardMotion: "letterspace",
      titleEntrance: "slam",
      accentColor: "#e8b23c",
      gateWeave: "subtle",
      lines: [
        { role: "narrated by", name: "Jack Morrow" },
        { role: "with", name: "Vera Voss" },
        { role: "and", name: "Jenny Voss" },
        { role: "the ledger", name: "Solomon Reyes" },
        { role: "the fine print", name: "Adele Krantz" },
        { role: "the balance", name: "Det. Rosa Ibarra" },
        { role: "the mess", name: "Ferris" },
        { role: "the kindness", name: "Tomás" },
        { role: "Everyone in this film sold someone", name: "Only Jenny never did" },
        { role: "That's why she leaves intact", name: "and why the ending isn't hers" },
      ],
    },
    prose: "",
    choices: [
      { id: "wo_c600", text: "From the top", targetSceneId: "wo_s000", attitudeTag: "Neutral" },
    ],
  },
];
