import type { SceneNode } from "../types";
import { fx } from "./whatsOwedAssets";

/**
 * WHAT'S OWED — ACT ONE: THE CLIENT
 *
 * Los Angeles, 1984. Narrated by Jack Morrow — confidently, and wrongly.
 * Plates: /public/img/whats-owed (Pass 1 + Pass 2 of six).
 *
 * Production notes are in the scene `note` fields: Andrew Dominik blocking
 * (long holds, the camera interested in the wrong thing) on a Taylor
 * Sheridan page (short lines, everything unsaid louder than the rest).
 */

const img = (n: string) => `/img/whats-owed/${n}.jpg`;

export const WHATS_OWED_ACT_1: SceneNode[] = [
  /* ---------------------------------------------------------------- */
  /* TITLES                                                           */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s000",
    title: "WHAT'S OWED",
    nodeType: "credits",
    background: img("cover"),
    ambientAudio: "drone",
    noTypewriter: true,
    transition: "fade-black",
    transitionSpeed: 1.4,
    letterbox: true,
    choiceDelaySeconds: 3,
    credits: {
      title: "WHAT'S OWED",
      subtitle: "a graphic novel — Los Angeles, 1984",
      style: "cards",
      cardSeconds: 2.6,
      font: "poster",
      cardMotion: "letterspace",
      titleEntrance: "slam",
      accentColor: "#e8b23c",
      montage: [
        img("p010-city"),
        img("p130-vera-hotdog"),
        img("p170-killing"),
        img("p270-groceries-two"),
        img("p450-the-choice"),
        img("p550-goodbye"),
      ],
      montageSeconds: 3.2,
      montageTransition: "cut",
      lines: [
        { role: "narrated by", name: "Jack Morrow" },
        { role: "in three acts", name: "The Client · A Dead Woman's Case · The Choice" },
        { role: "Everything is documented", name: "Nothing is forgiven" },
      ],
    },
    prose: "",
    choices: [
      { id: "wo_c000", text: "Open the file", targetSceneId: "wo_s010", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 1 — THE CITY, THE OFFICE, THE MAN                                */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s010",
    title: "1. The City",
    note: "Beat 1. Dominik wide. Pan left-to-right, slow. Jack's voice owns the world before we've seen a face of it. Let the smog do the grading.",
    nodeType: "cutscene",
    background: img("p010-city"),
    ambientAudio: "drone",
    particles: "smoke",
    transition: "fade-black",
    transitionSpeed: 1.6,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "pan",
      panDistance: 7,
      panDirection: "right",
      dimAmount: 0.18,
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.5,
      foregroundExtras: [
      { image: fx("fx-fronds"), x: 16, y: 2, scale: 0.9, depth: 0.95, anim: { preset: "sway", intensity: 0.35, speed: 0.8 } },
      { image: fx("fx-fronds"), x: 86, y: 4, scale: 0.8, flip: true, depth: 0.95, anim: { preset: "sway", intensity: 0.3, speed: 0.7 } },
      { image: fx("fx-headlights"), x: 50, y: 88, scale: 0.55, opacity: 0.8, blendMode: "screen", depth: 0.9,
        motion: { points: [{ x: 120, y: 88 }, { x: -10, y: 86 }], duration: 13, loop: "loop", holdSeconds: 4, fadeTo: 0.2 } },
      ],
    },
    prose: "Los Angeles. Three o'clock in the afternoon and a hundred and two degrees.",
    dialogueBeats: [
      {
        id: "wo_b010a",
        characterId: "jack",
        expression: "V.O. — owned the city, once. Still doing the voice.",
        text: "The smog does something to the light out here. Turns it the color of a bill you argued about and lost.",
      },
      {
        id: "wo_b010b",
        characterId: "jack",
        expression: "V.O.",
        text: "Aerospace money downtown. Worse money up the coast. Same three guys at both tables, and they all play golf left-handed, which is how you know they're lying about their handicaps.",
      },
      {
        id: "wo_b010c",
        characterId: "jack",
        expression: "V.O.",
        text: "Me? I work small. Marriages that lie. Men who run. Two hundred a day and photos you couldn't sell to a sailor.",
      },
      {
        id: "wo_b010d",
        characterId: "jack",
        expression: "V.O. — the grievance, right on schedule. Unprompted. Ten years old. Ironed daily.",
        text: "Ten years ago the LAPD and I came to an arrangement. She kept the badge. I kept the grievance. It's the only thing I own free and clear — no lien on it, nobody's name on the title but mine. Solomon Reyes put it there. But we'll get to him. We always get to him.",
        background: img("p030-desk"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.2,
        backgroundHold: false,
      },
    ],
    choices: [
      { id: "wo_c010", text: "Get out of the heat", targetSceneId: "wo_s020", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 2 — ROSA, BEFORE ANY OF IT: THE BAR                              */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s020",
    title: "2. Rosa, Before Any of It",
    note: "Beat 2. The friendship as ordinary. Warm, profane, easy. Plant: she has something to lose, and there's a subject they don't discuss. She's glad to see him and wishes he'd stop.",
    nodeType: "cutscene",
    background: img("p040-bar"),
    ambientAudio: "jazz",
    transition: "fade",
    transitionSpeed: 0.8,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "static",
      dimAmount: 0.3,
      lights: [{ x: 34, y: 55, color: "#e8b23c", intensity: 0.4, size: 34, pulseSeconds: 5, pulseAmount: 0.25 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.45,
      foregroundImage: fx("fx-neon"),
      foregroundFit: "contain",
      foregroundX: 82,
      foregroundY: 22,
      foregroundScale: 0.5,
      // Real alpha now, so no blend hack is needed to hide a black box —
      // "screen" stays only because a neon sign IS additive light.
      foregroundBlendMode: "screen",
      foregroundAnimation: { mode: "frames", frames: [fx("fx-neon"), fx("fx-neon-b"), fx("fx-neon-c")], frameDuration: 1.1, loops: 0 },
    },
    prose: "The Landmark. A cop bar on Pico with brass rails and a fryer from the Nixon administration. Rosa Ibarra has the back booth and the basket of fries, and the fries are in no danger.",
    dialogueBeats: [
      {
        id: "wo_b020a",
        characterId: "rosa",
        expression: "glad and guarded at the same time",
        text: "Look what the cat dragged in and wouldn't bury. Sit. You're paying.",
      },
      {
        id: "wo_b020b",
        characterId: "jack",
        text: "I'm always paying. It's my whole economic program.",
      },
      {
        id: "wo_b020c",
        characterId: "rosa",
        expression: "the laugh, then the point under it",
        text: "How's the empire? Still catching men whose wives buy them tennis lessons with a straight face?",
      },
      {
        id: "wo_b020d",
        characterId: "jack",
        text: "Tennis lessons. Pool boys. One guy whose wife was secretly running a chinchilla farm. I don't judge. I invoice.",
      },
      {
        id: "wo_b020e",
        characterId: "rosa",
        expression: "quiet, level — the wish",
        text: "You could come back inside, you know. The door's not welded. You'd have a pension by now. A desk that isn't in a building with a psychic above it.",
      },
      {
        id: "wo_b020f",
        characterId: "jack",
        expression: "the grievance arrives, unprompted, as always",
        text: "And contribute to a department that took its orders from Solomon Reyes' Rolodex? I have a system, Rosa. It's called being right and broke.",
      },
      {
        id: "wo_b020g",
        characterId: "rosa",
        expression: "flat. The subject with the handle on it, being not-touched again.",
        text: "Right. Reyes. Of course. It's noon and you've already said his name once. That's what we'll call breakfast.",
        background: img("p050-rosa-desk"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.2,
      },
      {
        id: "wo_b020h",
        characterId: "jack",
        expression: "V.O. — he files her generosity under 'luck'. Watch her carry it.",
        text: "Rosa Ibarra. Homicide. Only person left downtown who takes my calls. She stayed when I walked — her choice, and I've never once asked what it cost, because in my version of the story I'm the one who paid.",
      },
      {
        id: "wo_b020i",
        characterId: "rosa",
        text: "One more thing. That file business you keep hinting at. Don't. Whatever you're cooking — don't spend me on it. I like you. I wish you'd stop.",
        background: img("p440-bar-last"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.1,
      },
    ],
    choices: [
      { id: "wo_c020", text: "Walk her back to Parker Center", targetSceneId: "wo_s030", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 2b — PARKER CENTER                                               */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s030",
    title: "2b. Parker Center",
    note: "Beat 2, continued. The weight she carries that nobody else in the building carries. Nobody looks at her twice; everybody sees her twice.",
    nodeType: "cutscene",
    background: img("p050-rosa-desk"),
    ambientAudio: "drone",
    transition: "fade",
    transitionSpeed: 0.8,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "zoom-hold",
      focalPoint: "44% 42%",
      zoomDuration: 10,
      dimAmount: 0.28,
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.4,
      foregroundExtras: [
      { image: fx("fx-tvglow"), x: 84, y: 38, scale: 0.5, opacity: 0.5, blendMode: "screen", anim: { preset: "flicker", intensity: 0.35, speed: 1.4 } },
      ],
    },
    prose: "Parker Center, third floor. Fluorescents the color of a headache. A homicide slot in 1984, held by a Mexican woman, which is a sentence that describes a job and an act of war.",
    dialogueBeats: [
      {
        id: "wo_b030a",
        characterId: "rosa",
        expression: "at her desk, phone in her lap, not looking up",
        text: "You can't be here, Jack. Two minutes. I mean it.",
      },
      {
        id: "wo_b030b",
        characterId: "jack",
        text: "Two minutes. I timed the last ones, I'm getting better.",
      },
      {
        id: "wo_b030c",
        characterId: "rosa",
        expression: "dry, tired, real",
        text: "You know what I am to these people? Not a detective. A favor with a badge. I clear a case, it's competent-for-her. I catch one, it's amazing-for-her. I cough wrong, it's a goddamn committee. So I don't cough. You'd know all about not coughing, except you made an entire lifestyle out of it.",
        background: img("p051-badge"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.1,
      },
      {
        id: "wo_b030d",
        characterId: "jack",
        expression: "V.O. — narrating his version. The image disagrees.",
        text: "She says it like a complaint. It's not. It's an accounting, and Rosa never gets an entry wrong. I'd tell you she liked it downtown. I'd be lying. I'm just the only one who gets to leave.",
        background: img("p052-parker-ext"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.1,
      },
      {
        id: "wo_b030e",
        characterId: "rosa",
        text: "Go on. And Jack — whatever's coming. I can hear it coming. You've got your field-recording voice.",
        background: img("p040-bar"),
        backgroundTransition: "crossfade",
        backgroundTransitionSpeed: 1.2,
      },
    ],
    choices: [
      { id: "wo_c030", text: "Back to the office", targetSceneId: "wo_s040", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 3 — VERA WALKS IN                                                */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s040",
    title: "3. Vera Walks In",
    note: "Beat 3. Composed and specific. Everything she says is true and nothing she says is complete. The fee she plainly can't cover. Camera holds on Jack longer than is polite.",
    nodeType: "cutscene",
    background: img("p060-vera-enters"),
    ambientAudio: "drone",
    transition: "fade",
    transitionSpeed: 0.9,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "zoom-hold",
      focalPoint: "52% 40%",
      zoomDuration: 12,
      dimAmount: 0.22,
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.5,
      foregroundExtras: [
      { image: fx("fx-lightshaft"), x: 34, y: 30, scale: 1.2, opacity: 0.55, blendMode: "screen", anim: { preset: "flicker", intensity: 0.12, speed: 0.4 } },
      ],
    },
    prose: "Her name was Vera Voss, and she used my door the way you'd use a lectern — a place to stand while delivering findings.",
    dialogueBeats: [
      {
        id: "wo_b040a",
        characterId: "vera",
        expression: "composed. Specific. Managing the room from the doorway.",
        text: "Mr. Morrow. My name is Vera Voss. I want to hire you to find my sister. I'm told you're discreet. I'm hoping the truth is more useful than the advertisement.",
      },
      {
        id: "wo_b040b",
        characterId: "jack",
        text: "Discreet's the premium package. Finding's included. Who's your sister?",
      },
      {
        id: "wo_b040c",
        characterId: "vera",
        text: "Jenny. Jennifer Voss. She's thirty-two. Four years ago she went into the keeping of a lender named Solomon Reyes, against a debt that was mine. She has not come out.",
        background: img("p061-client-two"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.1,
      },
      {
        id: "wo_b040d",
        characterId: "jack",
        text: "'Keeping.' That a legal term?",
      },
      {
        id: "wo_b040e",
        characterId: "vera",
        expression: "the pause that answers the question and refuses to be dramatic about it",
        text: "It's the accurate one. There's a house on Baxter Street. She is fed, she is housed, and she is not free to leave. Mr. Reyes calls it an arrangement. I've read the paperwork. It is an arrangement in the way a cage is a furniture solution.",
      },
      {
        id: "wo_b040f",
        characterId: "jack",
        text: "And the police—",
      },
      {
        id: "wo_b040g",
        characterId: "vera",
        text: "Are welcome to read the same paperwork I did. It's all documented, Mr. Morrow. That's rather the point of him.",
      },
      {
        id: "wo_b040h",
        characterId: "vera",
        expression: "the fee, offered like a receipt for something she pawned",
        text: "I can pay three thousand five hundred now. The balance inside a month, when the house clears escrow.",
        background: img("p070-paper"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.2,
      },
      {
        id: "wo_b040i",
        characterId: "jack",
        expression: "V.O. — justice, he'd tell you. Look at his hands.",
        text: "Three five. It was half a good month, and she held the checkbook the way people hold a receipt for something they already pawned. And then she said his name again — Reyes — and I'll be honest with you, which I save for when it's cheap: I'd stopped pricing the work.",
      },
    ],
    choices: [
      {
        id: "wo_c040a",
        text: "\"Tell me about the debt.\"",
        attitudeTag: "Clever",
        reply: true,
        consequences: { setFlags: ["wo_asked_debt"] },
      },
      {
        id: "wo_c040b",
        text: "\"Tell me about Jenny.\"",
        attitudeTag: "Neutral",
        reply: true,
        consequences: { setFlags: ["wo_asked_jenny"] },
      },
      {
        id: "wo_c040c",
        text: "Take the case",
        targetSceneId: "wo_s050",
        attitudeTag: "Aggressive",
        hidden: true,
        gating: { requiresFlags: ["wo_asked_debt", "wo_asked_jenny"] },
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 4 — THE WRONG REASON                                             */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s050",
    title: "4. The Wrong Reason",
    note: "Beat 4. Narration frames it as justice. Play it as appetite. He takes it too fast. Night office. The check stays on the desk — note he never cashes it.",
    nodeType: "cutscene",
    background: img("p030-desk"),
    ambientAudio: "jazz",
    particles: "smoke",
    transition: "fade-black",
    transitionSpeed: 1.1,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "dolly",
      dollyDirection: "left",
      dollyDistance: 7,
      dollyDuration: 14,
      dimAmount: 0.42,
      lights: [{ x: 62, y: 38, color: "#ffb761", intensity: 0.45, size: 16, pulseSeconds: 6, pulseAmount: 0.3 }],
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.55,
    },
    prose: "That night, in the office, with the check face-down under the ashtray where I could keep an eye on it.",
    dialogueBeats: [
      {
        id: "wo_b050a",
        characterId: "jack",
        expression: "V.O. — the case for justice, delivered like a closing argument.",
        text: "A man keeps a woman in a house against a debt. There are laws. There's a whole building of them downtown, marble floors, the works. This is the part where I tell you I took the case because of the laws.",
      },
      {
        id: "wo_b050b",
        characterId: "jack",
        expression: "V.O. — and here's the truth he thinks is the same thing.",
        text: "Solomon Reyes. Nineteen seventy-nine. I know what that name cost me, down to the penny, and here it comes walking up my stairs wearing a clients' clothes. Justice. That's the word I used.",
      },
      {
        id: "wo_b050c",
        characterId: "jack",
        expression: "V.O. — appetite, wearing justice's coat.",
        text: "Write that down. Justice. Ten years I've kept the receipt, and the man who owes it finally has a house with an address.",
      },
    ],
    choices: [
      { id: "wo_c050", text: "Work the paper", targetSceneId: "wo_s060", attitudeTag: "Clever" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 5 — THE DEBT                                                     */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s060",
    title: "5. The Debt",
    note: "Beat 5. Jack works the paper. Everything lawful. No authority to appeal to. That's the world. Card table, one lamp, documents like weather.",
    nodeType: "cutscene",
    background: img("p070-paper"),
    ambientAudio: "drone",
    transition: "fade",
    transitionSpeed: 0.9,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "zoom-hold",
      focalPoint: "50% 55%",
      zoomDuration: 11,
      dimAmount: 0.4,
      lights: [{ x: 50, y: 58, color: "#ffd9a0", intensity: 0.5, size: 12, pulseSeconds: 7, pulseAmount: 0.2 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.5,
    },
    prose: "Pacific Mercantile & Loan. A licensed lender with a compliance officer and a notary on retainer. I spent four days reading paper, and the paper was perfect.",
    dialogueBeats: [
      {
        id: "wo_b060a",
        characterId: "jack",
        expression: "V.O. — learning the shape of the machine.",
        text: "June, nineteen eighty. Vera Voss signs a promissory note. Twelve points, compounding, secured against real property and — clause eleven — against 'enumerated personal consideration.' Which is lawyer for: Jenny.",
      },
      {
        id: "wo_b060b",
        characterId: "jack",
        expression: "V.O.",
        text: "I looked for the crime the way you look for a waiter when you're ready to leave. An interest rate with a subpoena in it. Notarized. Filed. Enforceable in any courtroom with a roof.",
      },
      {
        id: "wo_b060c",
        characterId: "jack",
        expression: "V.O. — the world, stated plainly.",
        text: "Here's the thing nobody tells you about hell. It's not underground. It has business hours, a waiting room with out-of-date magazines, and when you stand up to appeal to the authority, the authority turns out to be him. That's the world. I drove home at a reasonable speed.",
      },
    ],
    choices: [
      { id: "wo_c060", text: "Wait with Vera", targetSceneId: "wo_s070", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 5b — VERA, OFF THE CASE                                          */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s070",
    title: "5b. Vera, Off the Case",
    note: "Beat 5b. The only scene from a different and happier film. Nothing advances the plot. Dry, unexpectedly filthy, hopeless at something small (the hot dog). The audience's single chance to love her. Beat 9 doesn't land without it.",
    nodeType: "cutscene",
    background: img("p130-vera-hotdog"),
    ambientAudio: "jazz",
    transition: "fade",
    transitionSpeed: 0.8,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "static",
      dimAmount: 0.12,
      lights: [{ x: 55, y: 45, color: "#ffe9c4", intensity: 0.35, size: 40, pulseSeconds: 6, pulseAmount: 0.15 }],
      colorGrade: "spielberg-golden",
      filmGrade: true,
      filmGradeStrength: 0.35,
      foregroundExtras: [
      { image: fx("fx-fronds"), x: 88, y: 3, scale: 0.85, flip: true, depth: 0.95, anim: { preset: "sway", intensity: 0.3, speed: 0.6 } },
      ],
    },
    prose: "County Hall steps, Tuesday, waiting on a records clerk with a limp and a philosophy. Two hot dogs from the cart at the bottom of the stairs. One of us was raised by wolves, and it wasn't me.",
    dialogueBeats: [
      {
        id: "wo_b070a",
        characterId: "vera",
        expression: "mustard on her wrist, examining it like evidence",
        text: "I want you to know I was going to be mysterious on this surveillance, and I'd practiced. Then they handed me this hot dog, and whatever I was, I'm a woman losing a fight with a condiment now.",
      },
      {
        id: "wo_b070b",
        characterId: "jack",
        text: "You're supposed to eat those from the side.",
      },
      {
        id: "wo_b070c",
        characterId: "vera",
        text: "You're supposed to eat them from the side. What a sentence to hand a stranger. Twenty years married to a man who quoted Camus at breakfast, and the first honest advice I get in this city is about hot dog geometry.",
      },
      {
        id: "wo_b070d",
        characterId: "jack",
        text: "Camus at breakfast. What'd he serve, despair with a side of despair?",
      },
      {
        id: "wo_b070e",
        characterId: "vera",
        expression: "the dirty laugh — unexpected, house-level volume",
        text: "Despair, with toast. God, I miss swearing. Proper swearing. Kitchen volume, full sentences. My husband said a woman who cursed had surrendered something. You know what he can surrender? The remote. The house. The entire concept of brunch.",
        background: img("p132-steps-wide"),
        backgroundTransition: "crossfade",
        backgroundTransitionSpeed: 1,
      },
      {
        id: "wo_b070f",
        characterId: "jack",
        text: "The ex is rich.",
      },
      {
        id: "wo_b070g",
        characterId: "vera",
        text: "The ex is rich, the sister's in hock to a lender, and I'm eating a hot dog on the steps of a records office with a detective who charges by the sigh. It's not the life I ordered. It's got a kind of tilt to it, though. I've done worse at better prices.",
        background: img("p010-city"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.1,
      },
      {
        id: "wo_b070h",
        characterId: "jack",
        expression: "V.O. — he doesn't file this anywhere. He should have.",
        text: "I don't know what to tell you. For twenty minutes on the steps of County Hall, the case was a woman laughing at her own wrist. Then the clerk came out with the file box, and the film we were in ended, and nobody clapped.",
      },
    ],
    choices: [
      { id: "wo_c070", text: "Pacific Mercantile & Loan", targetSceneId: "wo_s080", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 6 — FIRST CONTACT                                                */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s080",
    title: "6. First Contact",
    note: "Beat 6. Three plates in one scene: boulevard → office → elevator. Krantz does the talking. Ferris by the wall, zero lines. Solomon treats Jack's exile as an old shared joke. Jack leaves humiliated and more committed.",
    nodeType: "cutscene",
    background: img("p080-mercantile"),
    ambientAudio: "drone",
    transition: "fade",
    transitionSpeed: 0.9,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "dolly",
      dollyDirection: "right",
      dollyDistance: 6,
      dollyDuration: 12,
      dimAmount: 0.15,
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.45,
    },
    prose: "Pacific Mercantile & Loan keeps its money behind a brass door on a quiet boulevard, with the blinds up. Daylight. That's the first thing they teach you about Reyes: he operates in the sun, with a filing system.",
    dialogueBeats: [
      {
        id: "wo_b080a",
        characterId: "jack",
        expression: "V.O. — the establishment shot.",
        text: "No muscle at the door. No velvet rope. A receptionist with a ficus. If you want to hide a machine, don't put it in a basement. Put it in a bank.",
      },
      {
        id: "wo_b080b",
        characterId: "jack",
        text: "",
        background: img("p090-solomon-office"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1,
        silent: true,
      },
      {
        id: "wo_b080c",
        characterId: "solomon",
        expression: "warm. Unhurried. Delighted, almost.",
        text: "Jack Morrow. Sit down, sit down. Christ, they still tell the story about you downtown — you know the one I mean. You look well. You look like a man keeping a receipt.",
      },
      {
        id: "wo_b080d",
        characterId: "krantz",
        expression: "never raises her voice. Does more damage than anyone in the building.",
        text: "Mr. Morrow. Adele Krantz, counsel. Before you ask your question, I'll save us the afternoon. Everything Mr. Reyes holds is documented, notarized, and filed. If there's a crime in this room, it's on no floor of this building.",
      },
      {
        id: "wo_b080e",
        characterId: "jack",
        text: "You keep a woman on Baxter Street against a signature. That's not a filing system, that's a hostage.",
      },
      {
        id: "wo_b080f",
        characterId: "krantz",
        text: "It's clause eleven. Your client's sister was enumerated personal consideration under a note her own sister signed. If you'd like, I can walk you through security interests in chattel paper, Mr. Morrow, and in four or five hours you'll understand less and owe me a reading list.",
      },
      {
        id: "wo_b080g",
        characterId: "solomon",
        expression: "the old shared joke, offered across the desk like a after-dinner mint",
        text: "Adele. Leave the man his outrage, it's all he's carried since seventy-nine. Jack. Jack, Jack. Whatever you think happened to you — you were never on my books. Do you understand what a compliment that is? From me? The most dangerous thing I ever did to you was nothing.",
      },
      {
        id: "wo_b080h",
        characterId: "jack",
        text: "Something happened in seventy-nine.",
      },
      {
        id: "wo_b080i",
        characterId: "solomon",
        text: "Something happened to everybody in seventy-nine. Ask the Iranians.",
      },
      {
        id: "wo_b080j",
        characterId: "jack",
        expression: "V.O. — humiliated, and more committed. The correct diagnosis would take a mirror.",
        text: "Ferris stood by the file cabinets the whole visit. Big fella in a windbreaker, face like an unpaid toll. Never said a word. Never had to. And Reyes sat there being pleasant at me like I was a sales call. I walked out of there with my tail wired to a car battery, and I called it justice, because the other names for it were worse.",
        background: img("p091-ferris-wall"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.1,
      },
      {
        id: "wo_b080k",
        characterId: "jack",
        text: "",
        background: img("p100-elevator"),
        backgroundTransition: "fade-black",
        backgroundTransitionSpeed: 1.4,
        silent: true,
      },
      {
        id: "wo_b080l",
        characterId: "jack",
        expression: "V.O. — the void.",
        text: "Marble lobby. Brass doors. A building where everything gets decided on floors you'll never see. I pressed the button and the machine came when I called. One of us did.",
      },
    ],
    choices: [
      { id: "wo_c080", text: "Push anyway", targetSceneId: "wo_s090", attitudeTag: "Aggressive" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 7 — JACK PUSHES TOO HARD, AND ROSA PAYS                          */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s090",
    title: "7. Jack Pushes, Rosa Pays",
    note: "Beat 7. Against Vera's explicit warning. The leverage is Rosa. He talks her into a sealed file; it works; it tells Solomon Vera hired someone. Night. Her car. Watch his hands in this scene — they're never still and hers never move.",
    nodeType: "cutscene",
    background: img("p110-rosa-car"),
    ambientAudio: "drone",
    transition: "fade-black",
    transitionSpeed: 1.2,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "shake",
      shakeAmount: 0.18,
      shakeDuration: 0.7,
      dimAmount: 0.5,
      lights: [{ x: 70, y: 62, color: "#ffb761", intensity: 0.35, size: 12, pulseSeconds: 4, pulseAmount: 0.4 }],
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.55,
    },
    prose: "Eleven at night, Pico and Union, her beige sedan with the engine ticking. I had a name off the money trail — Delgado, a collector with a sealed 1980 complaint — and one person in the city who could open a sealed file without leaving fingerprints.",
    dialogueBeats: [
      {
        id: "wo_b090z",
        characterId: "jack",
        expression: "V.O. — quoting Vera's explicit warning verbatim, moments before violating it.",
        text: "She warned me. Word for word, on the County Hall steps, mustard still on her wrist: 'Whatever you're cooking, leave the department out of it. You need something from inside that building, you come tell me first, and I'll say no. Anyone you spend, Jack, I pay.' Vera Voss, explicit warning, entered into the record. I drove to Pico and Union anyway, because I already knew what I'd ask her for, and I wanted to hear myself ask.",
      },
      {
        id: "wo_b090a",
        characterId: "jack",
        text: "One file, Rosa. Delgado, 1980. It names the protection Reyes sold on Skid Row. You pull it, I hand it to a DA with a hard-on for racketeering, and your stock goes up a floor.",
      },
      {
        id: "wo_b090b",
        characterId: "rosa",
        expression: "the warning, on the record, so he can't say later that it wasn't",
        text: "You don't get to spend me, Jack. You hear me? You don't get to walk up to my whole life and make a withdrawal because your ten-year itch picked this week.",
        background: img("p113-dont-spend-me"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.1,
      },
      {
        id: "wo_b090c",
        characterId: "jack",
        text: "There's a woman in a house on Baxter.",
      },
      {
        id: "wo_b090d",
        characterId: "rosa",
        text: "Then bring me the woman and a body of evidence, in that order. Not a hunch wearing a sealed file. Jack — they watch who asks. That's the whole job down here. Watching who asks.",
      },
      {
        id: "wo_b090e",
        characterId: "jack",
        expression: "he leans. This is the one where the friendship becomes currency, and he spends it.",
        text: "Rosa. One drawer. I never heard your name in my life.",
        background: img("p112-the-drawer"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.1,
      },
      {
        id: "wo_b090f",
        characterId: "rosa",
        expression: "the pause. Then — because it's him.",
        text: "...Fourth floor, row nine, box eighty-one. You were never here. I was never born. And if this blows, Jack, you will be the one who tells me why, to my face, at my funeral, into a microphone.",
      },
      {
        id: "wo_b090g",
        characterId: "jack",
        expression: "V.O. — it works. Say it plain and the cost stays invisible. He keeps saying it plain.",
        text: "It worked. Delgado, eighty: receipts, route sheets, the Skid Row skim and who took a point off the top. Real paper. It also did one other thing, which I found out later. It told Solomon Reyes that Vera Voss had hired somebody. I got my file. She got my receipt, with her name on it. I call that a wash. I have to. I'm the one telling this.",
      },
    ],
    choices: [
      { id: "wo_c090", text: "The file, under a streetlamp", targetSceneId: "wo_s100", attitudeTag: "Clever" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 7b — THE SEALED FILE                                             */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s100",
    title: "7b. The Sealed File",
    note: "Beat 7, coda. Jack under a streetlamp with the photostats. Short. The victory lap that isn't one.",
    nodeType: "cutscene",
    background: img("p120-sealed"),
    ambientAudio: "drone",
    transition: "fade",
    transitionSpeed: 0.8,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "zoom-hold",
      focalPoint: "50% 45%",
      zoomDuration: 9,
      dimAmount: 0.55,
      lights: [{ x: 50, y: 30, color: "#ffb761", intensity: 0.55, size: 9, pulseSeconds: 5, pulseAmount: 0.45 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.5,
    },
    prose: "Sixth and Alameda, under a lamp that buzzed like it had opinions. Delgado's file. Photostats, soft in the middle from a bad copier.",
    dialogueBeats: [
      {
        id: "wo_b100a",
        characterId: "jack",
        expression: "V.O. — the win. Notice there's no one to show it to.",
        text: "You want to know what ten years of grievance looks like when it finally gets its teeth in something? It looks like a man reading a rent receipt under a streetlamp at midnight, grinning. I had him. I had his whole rental business on paper.",
      },
      {
        id: "wo_b100b",
        characterId: "jack",
        expression: "V.O. — one sentence of doubt, immediately paved over.",
        text: "Somewhere across town a light was going on in an office, and a phone was ringing, and a man in a windbreaker was being handed my name. But that's tomorrow's problem, and I've never once had a tomorrow I couldn't out-argue.",
      },
    ],
    choices: [
      { id: "wo_c100", text: "Find Vera", targetSceneId: "wo_s110", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 8 — AN ORDINARY CONVERSATION                                     */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s110",
    title: "8. An Ordinary Conversation",
    note: "Beat 8. Their last conversation reads as an ordinary one. She already knows what it costs. He doesn't. Give the audience the wedding-and-the-door line without pointing at it.",
    nodeType: "cutscene",
    background: img("p150-last-talk"),
    ambientAudio: "jazz",
    particles: "smoke",
    transition: "fade",
    transitionSpeed: 0.9,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "static",
      dimAmount: 0.3,
      lights: [{ x: 60, y: 40, color: "#ffd9a0", intensity: 0.35, size: 20, pulseSeconds: 6, pulseAmount: 0.25 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.45,
      foregroundImage: fx("fx-smoke"),
      foregroundFit: "contain",
      foregroundX: 78,
      foregroundY: 45,
      foregroundScale: 0.75,
      // Cigarette smoke: real alpha carries it, and a touch of screen keeps
      // the wisps luminous against the dim office without a black slab.
      foregroundBlendMode: "screen",
      foregroundOpacity: 0.85,
      foregroundAnimation: { mode: "dissolve", frames: [fx("fx-smoke"), fx("fx-smoke-b"), fx("fx-smoke-c")], frameDuration: 1.6, fadeDuration: 1.6, loops: 0 },
    },
    prose: "My office, Thursday, the fourteenth of the month by my desk calendar — remember the date, there's a test later. Vera brought coffee in paper cups, which the budget had previously ruled against.",
    dialogueBeats: [
      {
        id: "wo_b110a",
        characterId: "vera",
        text: "Any progress, or do I get the face you save for clients who ask?",
      },
      {
        id: "wo_b110b",
        characterId: "jack",
        text: "I don't have a face.",
      },
      {
        id: "wo_b110c",
        characterId: "vera",
        expression: "dry as the hot dog cart mustard",
        text: "You have six. I've catalogued them. That's the mercantile one — it means you've spent money you don't have on a lead you can't say out loud.",
      },
      {
        id: "wo_b110d",
        characterId: "jack",
        text: "Vera. About Reyes — I want you to stay someplace I know about for a while. The Delgado paper's got him cornered. There'll be noise.",
      },
      {
        id: "wo_b110e",
        characterId: "vera",
        expression: "everything true; nothing complete",
        text: "I appreciate the weather report. I'm going to return some things this week — papers, mostly. Personal effects. It's paperwork, Jack. I'm good at paperwork.",
      },
      {
        id: "wo_b110f",
        characterId: "jack",
        text: "To Reyes? Vera, no. Not while I'm—",
      },
      {
        id: "wo_b110g",
        characterId: "vera",
        expression: "the almost-smile. The door, from her side, closing gently.",
        text: "Jack. If it all goes loud — my sister's name is Jennifer Voss. She's better than both of us and she doesn't know it, so nobody's ever told her. Someone should tell her. That's not a retainer. That's a wedding and a door, someday, from someone who means it.",
        background: img("p153-door-smile"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.2,
      },
      {
        id: "wo_b110h",
        characterId: "jack",
        expression: "V.O. — the last lie of the act is the one he doesn't notice telling.",
        text: "She shook my hand. Nobody shakes my hand. I watched her cross the street with her coffee, and I went back to my murder board, and I thought: there goes a client. The city took her inside before the light changed. You'll want to argue with me about that. Get in line. I'm first.",
        background: img("p152-crossing"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.4,
        backgroundHold: false,
      },
    ],
    choices: [
      { id: "wo_c110", text: "That night", targetSceneId: "wo_s120", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 8b — WHAT VERA DID THAT NIGHT                                    */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s120",
    title: "8b. What Vera Did That Night",
    note: "Beat 8, coda. Wordless. Two plates: the window; the kitchen with two glasses out. Silent captions only — no voice. She goes back willingly, to buy Jack's life. We're not told that. We watch it.",
    nodeType: "cutscene",
    background: img("p140-vera-window"),
    ambientAudio: "drone",
    musicMode: "none",
    transition: "fade-black",
    transitionSpeed: 1.4,
    letterbox: true,
    autoNarrate: false,
    cinematic: {
      mode: "static",
      dimAmount: 0.55,
      lights: [{ x: 50, y: 46, color: "#9fc4d8", intensity: 0.25, size: 14, pulseSeconds: 7, pulseAmount: 0.3 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.5,
    },
    prose: "",
    dialogueBeats: [
      {
        id: "wo_b120a",
        characterId: "narrator",
        expression: "scene direction — unvoiced. Silence where the voiceover should be.",
        text: "Her kitchen, eleven forty. She stands at the sink a long time. Two glasses are out on the counter. She is not expecting anyone.",
        silent: true,
      },
      {
        id: "wo_b120b",
        characterId: "narrator",
        text: "She turns off the tap. She looks at the phone. She doesn't call anyone. There is no one to call.",
        silent: true,
      },
      {
        id: "wo_b120c",
        characterId: "narrator",
        text: "She puts on her coat. She takes the glasses to the sink first, because even now, the counter shouldn't be a mess for whoever finds the house.",
        background: img("p141-the-tap"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.1,
        silent: true,
      },
      {
        id: "wo_b120d",
        characterId: "narrator",
        text: "The front door closes without locking behind her. She is done with this house. She knows exactly what she is going to buy with it.",
        silent: true,
        background: img("p160-vera-kitchen"),
        backgroundTransition: "fade-black",
        backgroundTransitionSpeed: 1.6,
      },
    ],
    choices: [
      { id: "wo_c120", text: "West of Alameda", targetSceneId: "wo_s130", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 9 — ACT ONE CLIMAX: THE ACCOUNTING                               */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s130",
    title: "9. The Accounting",
    note: "ACT ONE CLIMAX — Beat 9. Not a punishment: an accounting. Ferris does it; Solomon watches Jack's face. Jack not killed — judged not worth the bullet. GIVE JACK NOTHING: no V.O., voiced narration off, silent captions only. Ferris unhurried, almost apologetic about the mess.",
    nodeType: "cutscene",
    background: img("p170-killing"),
    ambientAudio: "drone",
    particles: "smoke",
    musicMode: "none",
    transition: "fade-black",
    transitionSpeed: 1.8,
    letterbox: true,
    autoNarrate: false,
    choiceDelaySeconds: 4,
    cinematic: {
      mode: "dolly-zoom",
      dollyZoomAmount: 1.3,
      dollyZoomDuration: 12,
      dollyZoomDirection: "push",
      dollyZoomBlur: 5,
      dimAmount: 0.5,
      lights: [{ x: 44, y: 34, color: "#ffb761", intensity: 0.5, size: 8, pulseSeconds: 3, pulseAmount: 0.5 }],
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.6,
    },
    prose: "",
    dialogueBeats: [
      {
        id: "wo_b130a",
        characterId: "narrator",
        expression: "unvoiced — captions only. The voiceover stops cold here, and does not come back for two scenes.",
        text: "A warehouse alley west of Alameda. Gravel, sodium light, a dumpster with the lid up. They have Jack by the arms, facing the middle distance, and Solomon Reyes has a car door open and one shoe on the gravel, like a man at a viewing.",
        silent: true,
      },
      {
        id: "wo_b130b",
        characterId: "solomon",
        text: "Jack. Look at me. Not her — me. You're not in this. That's the whole point of the exercise, and I'd thank you to witness it properly.",
        background: img("p171-witness"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.2,
        silent: false,
      },
      {
        id: "wo_b130c",
        characterId: "vera",
        expression: "composed. She has already done the arithmetic. It came out her.",
        text: "Jack. Don't. Whatever you're loading — don't. It's settled. Do you hear me? It was always going to be settled one of two ways, and this is the cheaper one.",
        silent: false,
      },
      {
        id: "wo_b130d",
        characterId: "narrator",
        text: "Ferris comes around the car with the pistol already out. No speech. No ceremony. He might as well be carrying a clipboard.",
        silent: true,
      },
      {
        id: "wo_b130e",
        characterId: "ferris",
        expression: "mild. Apologetic about the mess, in advance.",
        text: "Ma'am. This way's fine. I'm sorry about the location.",
        silent: false,
      },
      {
        id: "wo_b130f",
        characterId: "narrator",
        text: "Solomon watches Jack's face while it happens. Not hers. Jack's. That is who the evening is for.",
        silent: true,
      },
      {
        id: "wo_b130g",
        characterId: "narrator",
        text: "Two shots, the size of the whole world, and then the alley is just an alley, with its light and its gravel, doing what alleys do.",
        silent: true,
      },
      {
        id: "wo_b130h",
        characterId: "ferris",
        text: "The concrete's the worst part. Doesn't come out. I'll need ten minutes of you, Jack. Sit down if you want. Nobody minds.",
        silent: false,
        background: img("p180-aftermath"),
        backgroundTransition: "fade-black",
        backgroundTransitionSpeed: 1.6,
      },
      {
        id: "wo_b130i",
        characterId: "narrator",
        text: "Ferris wipes the pistol with a handkerchief, folds the handkerchief, pockets it. He is almost done being mildly inconvenienced. Solomon gets back in the car.",
        silent: true,
      },
      {
        id: "wo_b130j",
        characterId: "solomon",
        text: "You're not worth a second bullet, Jack. Think about that on the walk home. It's the only present you're getting tonight, and it's a good one.",
        silent: false,
      },
    ],
    choices: [
      { id: "wo_c130", text: "After", targetSceneId: "wo_s140", attitudeTag: "Neutral" },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 9b — AFTER                                                       */
  /* ---------------------------------------------------------------- */
  {
    id: "wo_s140",
    title: "9b. After",
    note: "Beat 9 coda. Curbside, blanket, coffee he won't drink. NO Jack voiceover at all. One silent caption from him. Then the part break — Act One ends.",
    nodeType: "cutscene",
    background: img("p190-curb"),
    ambientAudio: "drone",
    particles: "smoke",
    musicMode: "none",
    transition: "fade-black",
    transitionSpeed: 1.6,
    letterbox: true,
    autoNarrate: false,
    partBreak: "ACT ONE — THE CLIENT",
    cinematic: {
      mode: "static",
      dimAmount: 0.45,
      lights: [{ x: 30, y: 50, color: "#ff4a3c", intensity: 0.18, size: 24, pulseSeconds: 4, pulseAmount: 0.6 }],
      colorGrade: "noir-1940s",
      filmGrade: true,
      filmGradeStrength: 0.55,
      foregroundExtras: [
      { image: fx("fx-headlights"), x: 18, y: 24, scale: 0.9, opacity: 0.45, blendMode: "screen", anim: { preset: "flicker", intensity: 0.5, speed: 0.8 } },
      ],
    },
    prose: "",
    dialogueBeats: [
      {
        id: "wo_b140a",
        characterId: "narrator",
        text: "Two patrol cars at the mouth of the alley with their light spilling red on the gravel, a blanket, a paper cup of coffee going cold in his hands. Nobody has told him anything he doesn't already know.",
        background: img("p191-the-cup"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.3,
        silent: true,
      },
      {
        id: "wo_b140b",
        characterId: "jack",
        text: "…",
        silent: true,
      },
      {
        id: "wo_b140c",
        characterId: "narrator",
        text: "The voiceover that has explained every scene since the freeway is silent. Some narrations quit because they're finished. This one quit because it's been caught.",
        silent: true,
      },
    ],
    choices: [
      { id: "wo_c140", text: "ACT TWO", targetSceneId: "wo_s200", attitudeTag: "Neutral" },
    ],
  },
];
