import type { SceneNode } from "../types";
import { fx } from "./whatsOwedAssets";

/**
 * WHAT'S OWED — ACT TWO: A DEAD WOMAN'S CASE
 *
 * No client, no fee, no standing. He keeps working. The narration returns
 * with the first outright lie he tells us — and believes it. Plates are
 * Pass 3 + Pass 4 of six.
 */

const img = (n: string) => `/img/whats-owed/${n}.jpg`;

export const WHATS_OWED_ACT_2: SceneNode[] = [
  /* ---------------------------------------------------------------- */
  /* 10 — AFTERMATH                                                   */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s200",
    title: "10. Aftermath",
    note: "Beat 10. Narration returns and reframes the case as a debt he owes Vera — the first outright lie. He believes it. Office, rain on the glass, the uncollected retainer pinned to the wall like a lien.",
    nodeType: "cutscene",
    background: img("p200-office-rain"),
    ambientAudio: "rain",
    particles: "smoke",
    transition: "fade-black",
    transitionSpeed: 1.6,
    letterbox: true,
    choiceDelaySeconds: 3,
    cinematic: {
      mode: "dolly",
      dollyDirection: "left",
      dollyDistance: 6,
      dollyDuration: 13,
      dimAmount: 0.5,
      lights: [{ x: 58, y: 40, color: "#ffb761", intensity: 0.4, size: 14, pulseSeconds: 6, pulseAmount: 0.35 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.55,
    },
    prose: "It rained for a week, which in Los Angeles is a civic event. The buses ran late. The gutters ran. The check for three thousand five hundred stayed pinned over my desk, uncashed, like a lien against something I couldn't name yet.",
    dialogueBeats: [
      {
        id: "wo_b200a",
        characterId: "jack",
        expression: "V.O. — back on duty. Listen to the hinge he swings on.",
        text: "People think grief is a fog. It's not. Grief is a filing system. Everything gets a new folder, and the folders all say the same thing.",
      },
      {
        id: "wo_b200b",
        characterId: "jack",
        expression: "V.O. — the first outright lie. He believes it. That's what makes it a lie.",
        text: "Vera hired me to find her sister. That's the job. That's all the job ever was. I owe Vera the end of it — a debt of my own, and debts are the only thing I've ever honored. Ask anyone. Ask my ex-wife. Ask my tailor, who I also owe.",
      },
      {
        id: "wo_b200c",
        characterId: "jack",
        expression: "V.O. — the case file of a dead woman, kept the way widows keep lights on.",
        text: "No client. No fee. No standing. The police had a stapled-together incident and a man with a revoked badge who says he saw it, and me with a hard-on ten years long for the man who did it. Case of the century. I kept working.",
      },
    ],
    choices: [
      { id: "wo_c200", text: "Downtown, with the file", targetSceneId: "wo_s210", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 11 — ROSA CLOSES THE DOOR                                        */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s210",
    title: "11. Rosa Closes the Door",
    note: "Beat 11. Play her wanting to help and being unable — then the harder truth: Jack is the worst possible witness. His obsession is what disqualifies the case. He spent ten years making himself useless for exactly this moment.",
    nodeType: "cutscene",
    background: img("p210-rosa-door"),
    ambientAudio: "drone",
    transition: "fade",
    transitionSpeed: 0.9,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "zoom-hold",
      focalPoint: "40% 45%",
      zoomDuration: 11,
      dimAmount: 0.4,
      lights: [{ x: 36, y: 42, color: "#cfe3ee", intensity: 0.3, size: 18, pulseSeconds: 7, pulseAmount: 0.2 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.5,
    },
    prose: "Homicide keeps an interview room on the third floor with a table you could perform surgery on. Rosa sat across it from me like a woman across from bad news she'd already read.",
    dialogueBeats: [
      {
        id: "wo_b210a",
        characterId: "jack",
        text: "I watched it happen, Rosa. West of Alameda, warehouse alley. Reyes held my arms, Ferris shot her twice, and the cavalry dusted a dumpster for an hour and went to lunch.",
      },
      {
        id: "wo_b210b",
        characterId: "rosa",
        expression: "wanting to help. Genuinely. Saying the arithmetic out loud anyway.",
        text: "Jack. No body's been logged matching Vera Voss — do you understand what that means? No scene. No shell casings logged. No witness but you. And Ferris has paper putting him in Van Nuys at a deposition with three lawyers and a court reporter.",
      },
      {
        id: "wo_b210c",
        characterId: "jack",
        text: "The paper's wrong.",
      },
      {
        id: "wo_b210d",
        characterId: "rosa",
        text: "The paper is ALWAYS right, that's what paper is FOR. You of all people — you spent a week deep-throating that man's filing system and now you're surprised the filing system works for him?",
        background: img("p213-worst-witness"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.1,
      },
      {
        id: "wo_b210e",
        characterId: "rosa",
        expression: "the harder truth. She gives it to him because she loves him. It's the kindest cruelty in the film.",
        text: "And here's the part you're really not going to enjoy. Even if I had a case — even if the alley turned up gold — I can't build it on you. Everyone downtown knows what you think about Solomon Reyes. Ten years of letters to the captain, the bar stool sermons, the murder board I know you keep. You're not a witness, Jack. You're a motive. A DA would sooner indict the weather.",
        background: img("p212-corkboard"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.2,
      },
      {
        id: "wo_b210f",
        characterId: "jack",
        expression: "V.O. — the diagnosis he can't file.",
        text: "She wasn't wrong. That's the part I'd change if I could. She looked at me like an x-ray and read out loud: ten years making yourself useless, and the meter comes due all at once. I sat there being right about everything except the thing.",
      },
      {
        id: "wo_b210g",
        characterId: "rosa",
        text: "Go home. And Jack — I'm sorry. I'd burn him down myself if the matches would testify.",
      },
    ],
    choices: [
      { id: "wo_c210", text: "Build Jenny from traces", targetSceneId: "wo_s220", attitudeTag: "Clever" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 12 — JENNY IN ABSENCE                                            */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s220",
    title: "12. Jenny in Absence",
    note: "Beat 12. He assembles a person out of secondhand pieces and starts caring about the assembly. Corkboard: photograph, school record, landlady's account, the coat in Vera's closet.",
    nodeType: "cutscene",
    background: img("p220-traces"),
    ambientAudio: "jazz",
    transition: "fade",
    transitionSpeed: 0.9,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "dolly",
      dollyDirection: "right",
      dollyDistance: 8,
      dollyDuration: 14,
      dimAmount: 0.38,
      lights: [{ x: 50, y: 45, color: "#ffd9a0", intensity: 0.4, size: 18, pulseSeconds: 5, pulseAmount: 0.25 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.45,
    },
    prose: "You can build a person the way you frame a house, if you don't mind living in it alone. A photograph, eighth grade, front row, biggest smile in the frame and none of the other kids' smiles look rehearsed next to it, which is a miracle of physics.",
    dialogueBeats: [
      {
        id: "wo_b220a",
        characterId: "jack",
        expression: "V.O. — the assembly.",
        text: "A school record. Straight C's and one A, in drama, with a note from a teacher: 'a generous scene partner.' A social security card, same address nine years. A library card, expired, fine of one dollar and ten cents, unpaid. Jennifer Voss owed the city of Los Angeles a dollar ten. I found myself hoping nobody ever collected.",
      },
      {
        id: "wo_b220b",
        characterId: "jack",
        expression: "V.O. — the coat.",
        text: "And in Vera's closet — the sister kept her sister's coat. Wool, powder blue, a mitten in one pocket and a movie stub in the other. 'Cinema City. Matinee.' Who keeps a coat for four years? Somebody who isn't done. Vera was never done. That's the whole tragedy in a hanger, and I stood there holding it like a bus schedule, getting it wrong the entire time.",
      },
      {
        id: "wo_b220c",
        characterId: "jack",
        text: "",
        background: img("p230-landlady"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.1,
        silent: true,
      },
      {
        id: "wo_b220d",
        characterId: "narrator",
        text: "Marisol Quevedo, landlady, ninety-two pounds of Vietnam-era Widestax and porch plants, remembers everything.",
        silent: true,
      },
      {
        id: "wo_b220e",
        characterId: "narrator",
        text: "\"She paid early. She said thank you like it was information. Jenny? Jenny made a bad house kind. You don't meet many.\"",
        silent: true,
      },
      {
        id: "wo_b220f",
        characterId: "jack",
        expression: "V.O. — the caring creeps in under the door of the craft.",
        text: "I'd been on the job nineteen days. Somewhere in there the file grew a pulse, and I started carrying it around like afkir with a rabbit's foot. You want to know the exact moment a case stops being work? It's when you catch yourself lying to it. Telling it things will be all right.",
        background: img("p030-desk"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.1,
      },
    ],
    choices: [
      { id: "wo_c220", text: "The short list", targetSceneId: "wo_s230", attitudeTag: "Clever" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 12b — THREE ADDRESSES                                            */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s230",
    title: "12b. Three Addresses",
    note: "Beat 12 cont. He narrows it to three houses and sits on all of them. Plant Tomás WITHOUT NAMING him: a young man carrying groceries. Jack takes him for a nobody.",
    nodeType: "cutscene",
    background: img("p240-three-houses"),
    ambientAudio: "drone",
    transition: "fade",
    transitionSpeed: 0.9,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "pan",
      panDistance: 9,
      panDirection: "right",
      dimAmount: 0.25,
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.45,
    },
    prose: "Three addresses. A bungalow in Echo Park, a duplex off Baxter, and a stucco job in Glassell Park with a lemon tree and a flatbed across the lawn. I sat on all three, on rotation, out of a Plymouth I'm still making payments on to a man named Cliff who pronounces it ' obligations.'",
    dialogueBeats: [
      {
        id: "wo_b230a",
        characterId: "jack",
        expression: "V.O. — the stakeout liturgy.",
        text: "You want to know private investigation? It's a thermos, a windshield, and your own thoughts with the cage door open. Day nine, I knew the garbage routes of eleven households. Day ten, I could tell you whose marriage was in the garage and whose was on the porch.",
      },
      {
        id: "wo_b230b",
        characterId: "jack",
        text: "",
        background: img("p250-groceries"),
        backgroundTransition: "crossfade",
        backgroundTransitionSpeed: 1,
        silent: true,
      },
      {
        id: "wo_b230c",
        characterId: "jack",
        expression: "V.O. — the plant. He looks directly at the most important person in the film and calls him nothing.",
        text: "At the stucco place, a young guy came out most evenings around five and walked to the corner market and came back with two bags. Young. Moustache like an audition. Carried the bags like they were eggs. A keeper of nothing — a nephew, a yard boy, a nobody. I wrote 'male, 20s, domestic' in the book and underlined it twice, which is what I do instead of thinking.",
      },
      {
        id: "wo_b230d",
        characterId: "jack",
        expression: "V.O. — the audience has already met the point of the scene. He hasn't.",
        text: "You get so you can read a street. Houses tell you where the body's buried, or the money, or the marriage. I read that one as a lemon tree and a flatbed and a man with groceries. File under: nobody.",
        background: img("p231-the-curb"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.1,
      },
    ],
    choices: [
      { id: "wo_c230", text: "Keep the vigil", targetSceneId: "wo_s240", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 12c — NIGHTS                                                     */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s240",
    title: "12c. Nights",
    note: "Breath between 12 and the midpoint. Short. Dashboard, coffee, the city not caring.",
    nodeType: "cutscene",
    background: img("p260-stakeout"),
    ambientAudio: "rain",
    particles: "none",
    transition: "fade",
    transitionSpeed: 0.8,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "shake",
      shakeAmount: 0.08,
      shakeDuration: 1.1,
      dimAmount: 0.55,
      lights: [{ x: 66, y: 55, color: "#ffb761", intensity: 0.3, size: 10, pulseSeconds: 6, pulseAmount: 0.4 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.55,
    },
    prose: "Nights, the stucco house kept one kitchen light on until around midnight. I matched it with a pint of bourbon and called it surveillance.",
    dialogueBeats: [
      {
        id: "wo_b240a",
        characterId: "jack",
        expression: "V.O. — talking to the dead woman's case like it answers.",
        text: "Four years in that house, Jenny. Four years of somebody's cooking smells and somebody's radio. I sat out there on your behalf, getting your room ready in my head. That's the part I want you to know. I furnished it. I put in a window. I'm a hell of a decorator for a man who's never met you.",
      },
    ],
    choices: [
      { id: "wo_c240", text: "Evening, the corner market run", targetSceneId: "wo_s250", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 13 — MIDPOINT: PROOF OF LIFE                                     */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s250",
    title: "13. Proof of Life",
    note: "MIDPOINT. The groceries are for two. Grief converts into mission — the moment he's most dangerous and least honest with himself.",
    nodeType: "cutscene",
    background: img("p270-groceries-two"),
    ambientAudio: "drone",
    transition: "fade-black",
    transitionSpeed: 1.1,
    letterbox: true,
    choiceDelaySeconds: 3,
    cinematic: {
      mode: "zoom-hold",
      focalPoint: "55% 50%",
      zoomDuration: 8,
      dimAmount: 0.3,
      lights: [{ x: 52, y: 48, color: "#ffb761", intensity: 0.45, size: 12, pulseSeconds: 4, pulseAmount: 0.35 }],
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.5,
    },
    prose: "Thursday, 5:40 p.m. The kid came out of the market with two bags, and the porch light met him halfway, and she came to the door for the bags.",
    dialogueBeats: [
      {
        id: "wo_b250a",
        characterId: "jack",
        expression: "V.O. — the count. Two of everything.",
        text: "Two loaves. Two of the little milks. A bunch of those welfare bananas — two hands' worth. Coffee for a pot that takes two scoops a morning, and I know the arithmetic of that pot better than any man living.",
      },
      {
        id: "wo_b250b",
        characterId: "jack",
        expression: "V.O. — the conversion. Grief into mission. Watch him build the plan and call it love.",
        text: "Not a hostage. A household. Something in my chest reorganized itself at that porch rail — I heard it, like a revolver with a bad cylinder finally clicking into line. She was alive, and she was forty feet from my bumper, and everything after this moment was going to be a plan.",
      },
      {
        id: "wo_b250c",
        characterId: "jack",
        expression: "V.O. — least honest with himself, on the record, in his own words.",
        text: "Here's the plan, and it's a good one. Find her. Tell her. Get her out. Avenge Vera. Keep the client's account open. Simple, clean, and mine. Write that down too. I was never so dangerous as that Thursday, and I have never once been able to say why, out loud, all the way to the end of the sentence. You'll see why. Give it two acts.",
      },
    ],
    choices: [
      { id: "wo_c250", text: "Knock on the door", targetSceneId: "wo_s260", attitudeTag: "Aggressive" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 14 — JENNY, IN THE ROOM                                          */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s260",
    title: "14. Jenny, In the Room",
    note: "Beat 14. She is nothing like the picture he built. Warm to him immediately, without suspicion, doesn't require him to be sorry. Tomás present; the ease between them is the disturbing part. He stops the exit without voice or hands. It's worse than a cell — it's a home.",
    nodeType: "cutscene",
    background: img("p280-kitchen"),
    ambientAudio: "jazz",
    transition: "fade",
    transitionSpeed: 1,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "static",
      dimAmount: 0.15,
      lights: [
        { x: 50, y: 42, color: "#ffd9a0", intensity: 0.4, size: 26, pulseSeconds: 5, pulseAmount: 0.2 },
        { x: 84, y: 55, color: "#9fc4d8", intensity: 0.12, size: 14, pulseSeconds: 8, pulseAmount: 0.3 },
      ],
      colorGrade: "spielberg-golden",
      filmGrade: true,
      filmGradeStrength: 0.35,
      foregroundExtras: [
      { image: fx("fx-fan"), x: 50, y: 8, scale: 1.15, depth: 1, anim: { preset: "spin", intensity: 0.3, speed: 0.08 } },
      { image: fx("fx-steam"), x: 72, y: 55, scale: 0.6, opacity: 0.55, blendMode: "screen", anim: { preset: "drift", intensity: 0.45, speed: 0.7 } },
      ],
    },
    prose: "I had a story about a water meter. I'd used it in eleven kitchens. She opened the door with a dish towel over her shoulder, looked at me the way you look at weather, and said:",
    dialogueBeats: [
      {
        id: "wo_b260a",
        characterId: "jenny",
        expression: "immediate. Unguarded. No irony anywhere in the building.",
        text: "You're the detective. Vera's detective — you've got the face from her letters, the tired one. Come in, your shoes are fine, don't listen to the mat. Tomás, it's the detective! We have the good soup.",
      },
      {
        id: "wo_b260b",
        characterId: "tomas",
        expression: "from the sink, easy, years-deep",
        text: "The good soup is gone. I ate the good soup Tuesday.",
      },
      {
        id: "wo_b260c",
        characterId: "jenny",
        expression: "delighted, at his expense, entirely without fear",
        text: "See? This is what happens here. Anarchy. Sit down, detective. The OK soup is also good.",
        background: img("p283-ease"),
        backgroundTransition: "crossfade",
        backgroundTransitionSpeed: 1.1,
      },
      {
        id: "wo_b260d",
        characterId: "jack",
        expression: "V.O. — prepared for a victim. Meets a person already whole.",
        text: "I came in with the room I'd furnished — the bad lights, the flinching, the grateful tears, chapter and verse. She sat me down and fed me and asked about my day. I want to repeat that, because it broke something in me that never healed right. She asked. About my day.",
        background: img("p281-jenny-laugh"),
        backgroundTransition: "crossfade",
        backgroundTransitionSpeed: 1.1,
      },
      {
        id: "wo_b260e",
        characterId: "jenny",
        text: "Four years is four years — don't make the face. You can't save somebody's life at them, detective, it doesn't take. I know exactly what the world is. I decided to stay soft anyway. It's not naivety. It's a discipline. Takes work.",
      },
      {
        id: "wo_b260f",
        characterId: "jack",
        text: "Jenny. Listen to me. I can get you out. Tonight, the car, my office, we're gone before—",
      },
      {
        id: "wo_b260g",
        characterId: "jenny",
        text: "Get my coat? It's powder blue — Vera kept it, didn't she. That coat's been more places than I have.",
      },
      {
        id: "wo_b260h",
        characterId: "tomas",
        expression: "not raising his voice. Not moving from the sink. The door is a conversation.",
        text: "Jack. Buddy. The door's a conversation, not a door. Sit down. Finish the soup. Nobody's mad. That's not how we do it here, and you'll want to be real clear on that before you make it a police thing.",
        background: img("p282-tomas-sink"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.2,
      },
      {
        id: "wo_b260i",
        characterId: "jack",
        expression: "V.O. — the cell, dismantled in one line of dialogue.",
        text: "I had him for a guard. Wrong. I had him for staff. There's a lock you can pick and a lock you can't, and the one you can't is made out of somebody being kind to you for four years, and both of you knowing the whole arrangement, and the soup still being good. It's worse than a cell. It's a home.",
      },
    ],
    choices: [
      { id: "wo_c260", text: "The thing he doesn't know", targetSceneId: "wo_s270", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 15 — THE TWIST: WHAT VERA DID                                    */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s270",
    title: "15. What Vera Did",
    note: "THE TWIST. Vera sold Jenny, years ago, drowning, to clear her own debt. Everything since was Vera buying her back. Jenny forgives Vera in front of him, easily — and forgives him too. Every Act One scene now reads differently. Two plates: the truth, then the forgiveness.",
    nodeType: "cutscene",
    background: img("p290-jenny-truth"),
    ambientAudio: "drone",
    musicMode: "none",
    transition: "fade-black",
    transitionSpeed: 1.2,
    letterbox: true,
    choiceDelaySeconds: 3,
    cinematic: {
      mode: "zoom-hold",
      focalPoint: "42% 44%",
      zoomDuration: 10,
      dimAmount: 0.28,
      lights: [{ x: 44, y: 45, color: "#ffd9a0", intensity: 0.42, size: 18, pulseSeconds: 6, pulseAmount: 0.2 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.5,
    },
    prose: "I told her the way you carry a vase across a room — that her sister died getting her out. That Vera paid for her. That the debt ended at the alley west of Alameda.",
    dialogueBeats: [
      {
        id: "wo_b270a",
        characterId: "jenny",
        expression: "steady. Kind. Putting it down in front of him like a heavy tray.",
        text: "Oh. Oh, Jack. No. Sit — sit. Vera didn't die getting me out. Vera put me IN. June, nineteen eighty. I was there. I watched her sign. She was drowning and I was the thing she had, so she signed me over to Solomon, and I've spent four years being the life raft she wasn't using.",
        background: img("p291-the-signing"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.4,
      },
      {
        id: "wo_b270b",
        characterId: "jack",
        text: "She said — the keeping, she said it was against a debt that was hers—",
      },
      {
        id: "wo_b270c",
        characterId: "jenny",
        text: "It was. That's what I'm telling you. It was hers. All of it was hers, from the first signature to the last one. Everything after was her trying to buy me back. You were part of the buying, Jack. The fee she didn't have. The detective she couldn't afford. She was coming for me. With you. That's not nothing. That's four years of a woman working a second job at being sorry.",
      },
      {
        id: "wo_b270d",
        characterId: "jack",
        expression: "V.O. — the floor of Act One, cut out from under him mid-sentence.",
        text: "You want to feel a room spin? Stand in a kitchen holding somebody's absolution and find out the saint was a seller, the victim was the buyer's only asset, and every frame you've been watching this whole picture through just — turned around. Vera's control. Her caution. The fee she couldn't cover. Her going back without an argument. It all still happened. It just happened for different reasons than the ones I'd been screening.",
      },
      {
        id: "wo_b270e",
        characterId: "jenny",
        expression: "the forgiveness — easy, immediate, expensive-sounding and free",
        text: "Don't do the penance face. She was drowning. People don't drown politely — they climb on whatever floats, and I float, ask anybody. I forgave her before she finished the sentence. It's not expensive, forgiveness. People just don't carry it — no, that's not true either. They carry it like it's expensive so they don't have to give it away.",
        background: img("p300-forgiveness"),
        backgroundTransition: "crossfade",
        backgroundTransitionSpeed: 1.2,
      },
      {
        id: "wo_b270f",
        characterId: "jenny",
        expression: "her hand over his on the table. He came to deliver absolution. He gets handed it.",
        text: "And you. You came here to hand me something to feel about Vera, and you're so tired your face has a lean on it. You're forgiven too. All of it, whatever it is — the thing you're not saying loudest. Forgiven. It's done. Eat your soup.",
      },
    ],
    choices: [
      { id: "wo_c270", text: "After", targetSceneId: "wo_s280", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 16 — LOW POINT, AND THE LEASH                                    */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s280",
    title: "16. The Leash",
    note: "LOW POINT. Revenge has no object: can't avenge a martyr who was a seller, can't punish a contract, can't accept forgiveness. Then Krantz makes him an offer that isn't a threat — and he accepts. Narration turns on itself and can't finish the thought.",
    nodeType: "cutscene",
    background: img("p310-lowpoint"),
    ambientAudio: "drone",
    transition: "fade-black",
    transitionSpeed: 1.3,
    letterbox: true,
    choiceDelaySeconds: 3,
    cinematic: {
      mode: "dolly",
      dollyDirection: "right",
      dollyDistance: 6,
      dollyDuration: 12,
      dimAmount: 0.55,
      lights: [{ x: 40, y: 38, color: "#ffb761", intensity: 0.35, size: 12, pulseSeconds: 7, pulseAmount: 0.4 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.55,
    },
    prose: "Three nights I sat with the file open and the bourbon level dropping, doing arithmetic that wouldn't hold still.",
    dialogueBeats: [
      {
        id: "wo_b280a",
        characterId: "jack",
        expression: "V.O. — the object of revenge, deleted line by line.",
        text: "Avenge Vera. Against what? She sold her sister. Can't avenge a saint who turns out to hold the note. Punish Reyes. For what? Enforcing a contract the victim's own sister signed, notarized, filed. He didn't even do anything. That's the part that eats the wax out of your ears. The man never once did anything.",
      },
      {
        id: "wo_b280b",
        characterId: "jack",
        text: "And take her forgiveness. She handed it to me across a soup bowl like a joke, and I couldn't — it doesn't fit, Rosa, it doesn't fit in any pocket I—",
        background: img("p320-krantz-offer"),
        backgroundTransition: "fade-black",
        backgroundTransitionSpeed: 1.4,
      },
      {
        id: "wo_b280c",
        characterId: "krantz",
        expression: "explaining the reasoning to his face, which is what makes it unbearable",
        text: "Mr. Morrow. Ms. Krantz, again. You've been sitting outside the Baxter house for nineteen days, so let's save the meter. You may visit. Freely. Tuesdays, Thursdays, whenever the spirit moves. No escort, no conditions.",
      },
      {
        id: "wo_b280d",
        characterId: "jack",
        text: "Why in God's name would you do that.",
      },
      {
        id: "wo_b280e",
        characterId: "krantz",
        text: "Because a man who visits is a man who isn't attacking. Inside the house you're a guest; outside it you're a problem with a murderer's script in his pocket. I'd rather have you at the kitchen table than at my client's window, and I don't imagine you disagree, because you've been at the kitchen table for nineteen days and the coffee is free. I'm not hiding the reasoning, Mr. Morrow. The reasoning being known is part of how it works.",
      },
      {
        id: "wo_b280f",
        characterId: "jack",
        expression: "V.O. — turning on itself. He tries to justify it and can't finish the thought.",
        text: "Say something. Come on. You've got a mouth full of teeth and ten years of— the leash is the access, don't you see, if I'm inside then I can— I can what. Finish the thought. Finish it.",
      },
      {
        id: "wo_b280g",
        characterId: "jack",
        text: "…",
        silent: true,
      },
      {
        id: "wo_b280h",
        characterId: "krantz",
        expression: "the pen, uncapped. The click is the whole scene.",
        text: "Then we're agreed. I'll inform the house. Thursdays tend to be quiet. Good evening, Mr. Morrow.",
        background: img("p321-the-pen"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.2,
      },
    ],
    choices: [
      { id: "wo_c280", text: "The paperwork of the thing", targetSceneId: "wo_s290", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 16b — THE CLOCK                                                  */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s290",
    title: "16b. The Clock",
    note: "THE CLOCK. Solomon is selling the book. Everything transfers — Jenny included. A closing date. Made of paperwork, which is exactly right for this world. Krantz mentions it like a dentist appointment.",
    nodeType: "cutscene",
    background: img("p330-the-clock"),
    ambientAudio: "drone",
    transition: "fade",
    transitionSpeed: 0.9,
    letterbox: true,
    choiceDelaySeconds: 3,
    cinematic: {
      mode: "dolly",
      dollyDirection: "left",
      dollyDistance: 7,
      dollyDuration: 12,
      dimAmount: 0.35,
      lights: [{ x: 55, y: 40, color: "#e8f2ff", intensity: 0.25, size: 22, pulseSeconds: 8, pulseAmount: 0.15 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.45,
    },
    prose: "One scheduling note, delivered on her way to the door with her portfolio under her arm.",
    dialogueBeats: [
      {
        id: "wo_b290a",
        characterId: "krantz",
        text: "Mr. Reyes is simplifying. Consolidating the book and retiring from the personal trade — the volume has become, in his word, heavy. The entire portfolio sells on the fourteenth of next month to a licensed lender out of state. All obligations transfer at closing. Personnel, singular, included.",
        background: img("p331-the-date"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.1,
      },
      {
        id: "wo_b290b",
        characterId: "jack",
        text: "Personnel.",
      },
      {
        id: "wo_b290c",
        characterId: "krantz",
        text: "Your access, Mr. Morrow, is personal to Mr. Reyes. The new holder will not know your face, and their mercy will be of a different make — out-of-state paper is worked by telephone and credit bureaus, not kitchens. After the fourteenth there is no visiting, no standing, and no address you're welcome at. Do plan around it.",
        background: img("p292-krantz-leaves"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.1,
      },
      {
        id: "wo_b290d",
        characterId: "jack",
        expression: "V.O. — the clock, installed. It ticks in filing cabinets.",
        text: "And that was the whole conversation. No gun under the chin. No threat you could point at. Just a date. The film's one ticking clock, and it's made of paper — which is right. This whole world runs on paper. I've been fighting paper for ten years and losing, and the fourteenth was coming whether I believed in it or not.",
      },
    ],
    choices: [
      { id: "wo_c290", text: "Thursday. The kitchen.", targetSceneId: "wo_s300", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 17 — HE KEEPS COMING BACK                                        */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s300",
    title: "17. The Visits",
    note: "Beat 17. Ostensibly to work. Actually to sit in a kitchen. Tomás pours the coffee. The most dangerous house in the film is the only warm room in it, and Jack starts arriving earlier and leaving later. The audience notices before Jack does. He is on the leash and it is comfortable.",
    nodeType: "cutscene",
    background: img("p340-visits"),
    ambientAudio: "jazz",
    transition: "fade",
    transitionSpeed: 1,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "static",
      dimAmount: 0.12,
      lights: [
        { x: 48, y: 40, color: "#ffd9a0", intensity: 0.42, size: 28, pulseSeconds: 6, pulseAmount: 0.18 },
        { x: 12, y: 60, color: "#ffb761", intensity: 0.15, size: 16, pulseSeconds: 9, pulseAmount: 0.3 },
      ],
      colorGrade: "spielberg-golden",
      filmGrade: true,
      filmGradeStrength: 0.3,
      foregroundExtras: [
      { image: fx("fx-fan"), x: 46, y: 6, scale: 1.2, depth: 1, anim: { preset: "spin", intensity: 0.3, speed: 0.07 } },
      { image: fx("fx-steam"), x: 30, y: 62, scale: 0.5, opacity: 0.5, blendMode: "screen", anim: { preset: "drift", intensity: 0.4, speed: 0.6 } },
      ],
    },
    prose: "I kept a working file. Surveillance logs, plate numbers, the movements of one Solomon Reyes, cross-referenced nightly. It was the thinnest file in Los Angeles and it was never why I went.",
    dialogueBeats: [
      {
        id: "wo_b300a",
        characterId: "tomas",
        expression: "pouring. The ritual. Four years of it in the wrists.",
        text: "Regular?",
      },
      {
        id: "wo_b300b",
        characterId: "jack",
        text: "Regular.",
        background: img("p342-regular"),
        backgroundTransition: "crossfade",
        backgroundTransitionSpeed: 0.9,
      },
      {
        id: "wo_b300c",
        characterId: "tomas",
        text: "It's terrible. You want it anyway.",
      },
      {
        id: "wo_b300d",
        characterId: "jack",
        text: "I want it anyway.",
      },
      {
        id: "wo_b300e",
        characterId: "jenny",
        expression: "at the stove, not turning around, saying it to the window",
        text: "He came at four today. Hours early. Tomás, make a note — the detective's hours are drifting.",
        background: img("p343-hours"),
        backgroundTransition: "crossfade",
        backgroundTransitionSpeed: 1,
      },
      {
        id: "wo_b300f",
        characterId: "tomas",
        text: "Noted. Clock's in the shop.",
      },
      {
        id: "wo_b300g",
        characterId: "jack",
        expression: "V.O. — narrating everything except the thing.",
        text: "The most dangerous house I've ever sat in. Floor plan's a kill box, sight lines to the door from every chair, and a man in the doorway who could hold it against a swat team with a dish rag. And it was — and I'm going to say this word and you're going to have to live with it like I do — it was nice. It was a nice room, and I kept arriving earlier, and the coffee was terrible, and I wanted it anyway.",
      },
    ],
    choices: [
      { id: "wo_c300", text: "The porch", targetSceneId: "wo_s310", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 17b — THE PORCH                                                  */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s310",
    title: "17b. The Porch",
    note: "Beat 17 breath. Two chairs, evening. Little dialogue. The comfortable leash, held one scene longer than he can defend.",
    nodeType: "cutscene",
    background: img("p350-porch"),
    ambientAudio: "jazz",
    transition: "fade",
    transitionSpeed: 0.9,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "zoom-hold",
      focalPoint: "50% 55%",
      zoomDuration: 12,
      dimAmount: 0.2,
      lights: [{ x: 70, y: 35, color: "#ffb761", intensity: 0.35, size: 24, pulseSeconds: 7, pulseAmount: 0.25 }],
      colorGrade: "spielberg-golden",
      filmGrade: true,
      filmGradeStrength: 0.35,
      foregroundExtras: [
      { image: fx("fx-branch"), x: 84, y: 10, scale: 1.05, depth: 0.95, anim: { preset: "sway", intensity: 0.3, speed: 0.55 } },
      ],
    },
    prose: "Evenings, the lemon tree kept the light. We didn't always talk. I want that in the record too — the silences were good, and I noticed they were good, and I filed that under 'tactical rapport,' which should tell the whole jury everything.",
    dialogueBeats: [
      {
        id: "wo_b310a",
        characterId: "jenny",
        text: "You breathe different out here. Did you know? In you go — SWAT breathing. Out here — a person.",
      },
      {
        id: "wo_b310b",
        characterId: "jack",
        text: "That's surveillance breathing. It's a discipline.",
      },
      {
        id: "wo_b310c",
        characterId: "jenny",
        text: "Uh-huh. Breathe, detective.",
      },
    ],
    choices: [
      { id: "wo_c310", text: "She asks for something", targetSceneId: "wo_s320", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 18 — SHE ASKS FOR SOMETHING ORDINARY                             */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s320",
    title: "18. An Afternoon",
    note: "Beat 18. Not rescue — something small. She's been inside one house for years and wants an afternoon, not a future. The scene where the audience falls for her. Most screen time, least incident. Two plates: the drive, the reservoir.",
    nodeType: "cutscene",
    background: img("p360-drive"),
    ambientAudio: "jazz",
    transition: "fade",
    transitionSpeed: 1,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "pan",
      panDistance: 8,
      panDirection: "left",
      dimAmount: 0.15,
      colorGrade: "spielberg-golden",
      filmGrade: true,
      filmGradeStrength: 0.3,
    },
    prose: "Thursday I came at two with a surveillance log nobody was going to read, and she was waiting on the porch in the powder blue coat with her hair doing something unsupervised.",
    dialogueBeats: [
      {
        id: "wo_b320a",
        characterId: "jenny",
        expression: "asking for an afternoon like other people ask for a bank loan",
        text: "Drive me somewhere. Anywhere with a horizon. Tomás will say yes — he always says yes, but he can't drive and he won't leave, and I want the windows down. I've been inside one house for four years, Jack. I don't want a future. I want an afternoon.",
      },
      {
        id: "wo_b320b",
        characterId: "jack",
        text: "Krantz said freely. I'm choosing to believe her, which makes me an idiot, and Thursdays I'm fine with that.",
      },
      {
        id: "wo_b320c",
        characterId: "tomas",
        expression: "from the doorway, hands in pockets, easy",
        text: "Back by the late news or I start a search party. One man search party. I'm very slow, it'll take years, don't test me.",
      },
      {
        id: "wo_b320d",
        characterId: "jack",
        expression: "V.O. — the afternoon, narrated like a case he's losing.",
        text: "She directed me like a person who'd planned escapes she never intended to make. Left on the boulevard. The donut place on Cypress with the revolving sign. She ordered nine things and dared me to comment. I've never admired a crime more.",
        background: img("p010-city"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.2,
      },
      {
        id: "wo_b320e",
        characterId: "jenny",
        expression: "in the passenger seat, window down, honey-colored light, the city going by — hers for an afternoon",
        text: "Look at it. Four years and it just kept happening out here without me. Rude. Keep driving — Silver Lake, there's water. I've been rationing horizons, and today I'm spending.",
      },
      {
        id: "wo_b320f",
        characterId: "jack",
        text: "",
        background: img("p370-reservoir"),
        backgroundTransition: "crossfade",
        backgroundTransitionSpeed: 1.2,
        silent: true,
      },
      {
        id: "wo_b320g",
        characterId: "jenny",
        expression: "walking the fence line, coat open, the wind finally winning",
        text: "Solomon isn't a monster, that's the thing nobody gets. A monster you can hide from. He's a ledger. A ledger knows where you live because you told it. The trick is not owing. Not — out-running. Nobody out-runs paper.",
      },
      {
        id: "wo_b320h",
        characterId: "jack",
        text: "And Tomás? He's staff.",
      },
      {
        id: "wo_b320i",
        characterId: "jenny",
        text: "He's kind. Both. He's staff and he's kind, and someday one of those is going to have a bad week, and I know which one wins, and I love him anyway. So is everybody, Jack. So are you.",
      },
    ],
    choices: [
      { id: "wo_c320", text: "The thing he almost says", targetSceneId: "wo_s330", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 19 — HE ALMOST TELLS HER                                         */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s330",
    title: "19. He Almost Tells Her",
    note: "Beat 19. That he's the reason Vera went back. He gets close and doesn't. THE beat the ending is built on — she forgives him for everything except the one thing he never says out loud.",
    nodeType: "cutscene",
    background: img("p380-almost"),
    ambientAudio: "drone",
    musicMode: "none",
    transition: "fade",
    transitionSpeed: 1,
    letterbox: true,
    choiceDelaySeconds: 3,
    cinematic: {
      mode: "zoom-hold",
      focalPoint: "46% 42%",
      zoomDuration: 9,
      dimAmount: 0.3,
      lights: [{ x: 46, y: 42, color: "#ffd9a0", intensity: 0.4, size: 16, pulseSeconds: 5, pulseAmount: 0.3 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.5,
    },
    prose: "The kitchen, that night, the dishes done. She was re-ringing the ledger of the day out loud — the donuts, the reservoir, the dog on the boulevard that looked like a small mayor. And the truth got as far as my teeth.",
    dialogueBeats: [
      {
        id: "wo_b330a",
        characterId: "jack",
        expression: "the almost.",
        text: "Jenny. There's something you should know about why Vera went back that night. It wasn't only you she was—",
      },
      {
        id: "wo_b330b",
        characterId: "jenny",
        expression: "light as a lid going on a jar. She doesn't know what she's lifting off him — or she does, and she's saving him a second time.",
        text: "You're doing the face where you swallow it. Whatever it is: keep it or burp it, but don't do the face. Everyone's got one thing they don't say out loud. You've got a bigger one than most, is all. I can afford your silence, detective. I've been owned by cheaper men's talking.",
      },
      {
        id: "wo_b330c",
        characterId: "jack",
        expression: "V.O. — and here it is, the sentence the ending is built on, narrated by a man drowning in a glass of water.",
        text: "Say it. It's six words. The file was bait and she paid with— six words, Jack. I want you to understand that later, when everything's billed and closed: it was six words, and I kept them. She forgave me for everything I ever did, and everything I was going to do. She just didn't know about the six words. Nobody forgives what they've never heard.",
      },
    ],
    choices: [
      { id: "wo_c330", text: "The honest exit", targetSceneId: "wo_s340", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 19b — HE TRIES TO BUY HER                                        */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s340",
    title: "19b. The Honest Exit",
    note: "Beat 19b. Play it straight — the audience must believe he might make it. The tragedy of beat 22 is that he had a decent option and it was merely difficult. Two plates: the pawn counter; the 3 a.m. count.",
    nodeType: "cutscene",
    background: img("p390-pawn"),
    ambientAudio: "drone",
    transition: "fade-black",
    transitionSpeed: 1.2,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "zoom-hold",
      focalPoint: "52% 48%",
      zoomDuration: 10,
      dimAmount: 0.45,
      lights: [{ x: 55, y: 45, color: "#ffd9a0", intensity: 0.35, size: 14, pulseSeconds: 6, pulseAmount: 0.3 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.5,
    },
    prose: "You want to know what a detective is worth, liquid? Everything I owned fit on two shelves behind wire glass on Sixth Street, and the man at the counter had seen a hundred of me and was unimpressed on a professional level.",
    dialogueBeats: [
      {
        id: "wo_b340a",
        characterId: "narrator",
        text: "The watch was his father's. Railroad shield, cheap movement, kept bad time for forty years and never once stopped.",
        silent: true,
      },
      {
        id: "wo_b340b",
        characterId: "narrator",
        text: "\"For the watch? It's your father's, the engraving—\" \"It's a watch.\" It was his father's.",
        silent: true,
      },
      {
        id: "wo_b340c",
        characterId: "jack",
        expression: "V.O. — the ledger of everything.",
        text: "The watch. The typewriter. The .38 I never cleaned. Three hundred and ten from a skip trace I'd have turned down last year — a man's mother, if you want the flavor. The camera. The good coat. Jenny's paper was thirty-eight thousand, and the sale closed on the fourteenth, and I worked the phones like it was a kidnapping, because it was, I just happened to be the last kidnapper in Los Angeles with a receipt for everything.",
        background: img("p120-sealed"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.2,
      },
      {
        id: "wo_b340d",
        characterId: "jack",
        text: "",
        background: img("p400-counting"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.1,
        silent: true,
      },
      {
        id: "wo_b340e",
        characterId: "jack",
        expression: "V.O. — the count, at three in the morning, on the kitchen table that isn't his.",
        text: "Six thousand two hundred. Six one, if the calculator in my head was honest, and it wasn't, because it's me. Most of the way there. Most of the way is nothing. Most of the way is the same as nothing, only tired. But you play it straight, you hear me? Get up tomorrow and sell the rest. A man with a number and a date. It was the decent exit. It was sitting right there. All it cost was everything, and I want you to remember that I could see it. From here to the fourteenth, I could see it.",
      },
    ],
    choices: [
      { id: "wo_c340", text: "What it cost Rosa", targetSceneId: "wo_s350", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 19c — WHAT IT COST ROSA                                          */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s350",
    title: "19c. What It Cost Rosa",
    note: "Beat 19c. Jack hears secondhand — never from her — that the sealed file went into her jacket. Off homicide, riding a desk, promotion gone. He does not go to her. He goes back to the house instead. The narration barely survives this beat, and doesn't know it.",
    nodeType: "cutscene",
    background: img("p410-rosa-desked"),
    ambientAudio: "drone",
    transition: "fade",
    transitionSpeed: 1,
    letterbox: true,
    choiceDelaySeconds: 3,
    cinematic: {
      mode: "zoom-hold",
      focalPoint: "38% 45%",
      zoomDuration: 11,
      dimAmount: 0.5,
      lights: [{ x: 36, y: 42, color: "#cfe3ee", intensity: 0.25, size: 16, pulseSeconds: 8, pulseAmount: 0.2 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.55,
    },
    prose: "A downtown bondsman I do favors for owed me a coffee and repaid it with a rumor, unasked-for, which is the only kind that's true.",
    dialogueBeats: [
      {
        id: "wo_b350a",
        characterId: "narrator",
        text: "\"Your friend Ibarra. She's on two now — records retention, sub-basement, the microfiche desert. The Delgado file, when it surfaced, went into somebody's jacket, and somebody's jacket went up before a review board with a Mexican woman's name inside it. That promotion was hers twice over. Ask anyone. Then ask why nobody says her name loud.\"",
        silent: true,
      },
      {
        id: "wo_b350b",
        characterId: "jack",
        expression: "V.O. — the failure to arrive. Note what he does with the information. Note what the narration does instead.",
        text: "There was a thing I should do about that. Drive to the sub-basement. Stand in front of the desk she got demoted behind and say the six words to the only person in Los Angeles who never asked for them. There's always a thing. The kitchen was closer.",
      },
      {
        id: "wo_b350c",
        characterId: "jack",
        text: "…",
        silent: true,
      },
    ],
    choices: [
      { id: "wo_c350", text: "ACT THREE", targetSceneId: "wo_s500", attitudeTag: "Neutral" },
    ],
  },
];
