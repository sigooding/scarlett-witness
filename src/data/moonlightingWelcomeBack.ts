import type { Story } from "../types";

/**
 * MOONLIGHTING: WELCOME BACK — a fan-made graphic-novel episode.
 * A romantic comedy about two detectives who came home from vacation with
 * different stories, matching luggage, and no agreement about the future.
 * The new plates in public/img/bg-moonlighting-* and the cover were made for
 * this reel; the dialogue is original and not a transcript of the series.
 */
export const MOONLIGHTING_WELCOME_BACK: Story = {
  id: "moonlighting-welcome-back",
  title: "Moonlighting: Welcome Back",
  tagline: "Two detectives. One answering machine. Zero chance of a quiet reunion.",
  coverImage: "/img/cover-moonlighting-welcome-back.jpg",
  startSceneId: "mw_credits",
  dialogueBox: { bodyFont: "type", headingFont: "pulp", hudTheme: "neon-noir", accentColor: "#ff4d9d", bordered: true, backdropBlur: 3, reserveLines: 3 },
  briefing: {
    objective: "Get Blue Moon Detective Agency back on the air, survive the office party, and decide whether David's family emergency is your emergency too.",
    winConditions: ["Welcome the viewers back without letting David hijack the show.", "Find out why David's father wants him at the altar."],
    loseConditions: ["Let the landlord's voicemail become the agency's only client.", "Leave David alone with his family problem."],
  },
  flagNotes: {
    mw_emmy_joke: "David turned an Emmy question into a medical bulletin about his mother.",
    mw_rent_heard: "The landlord's rent-and-repairs message is still blinking on the machine.",
    mw_vacations_shared: "Maddie and David finally compared vacations instead of competing over them.",
    mw_david_best_man: "David's father asked him to be best man. David heard a demand disguised as love.",
    mw_maddie_stayed: "Maddie stayed after the party, even when David told her not to.",
  },
  characters: [
    { id: "maddie", name: "Maddie Hayes", role: "Owner / Managing Partner", avatarUrl: "/img/ch-maddie-hayes.jpg", trustMeter: 1, voice: { pitch: 1.08, rate: 0.98 } },
    { id: "david", name: "David Addison", role: "Detective / Professional Distraction", avatarUrl: "/img/ch-david-addison.jpg", trustMeter: 0, voice: { pitch: 0.82, rate: 1.04 } },
    { id: "agnes", name: "Agnes DiPesto", role: "Receptionist & Human Switchboard", avatarUrl: "emoji:📞", trustMeter: 1 },
    { id: "bert", name: "Bert Viola", role: "Office Manager, Reluctantly", avatarUrl: "emoji:🧢", trustMeter: 0 },
    { id: "father", name: "David's Father", role: "The Voice on the Phone", avatarUrl: "emoji:📱", trustMeter: -1 },
    { id: "landlord", name: "The Landlord", role: "Past Due", avatarUrl: "emoji:🧾", trustMeter: -1 },
  ],
  items: [
    { id: "voicemail_tape", name: "Voicemail Tape", icon: "📼", isClue: true, description: "A cassette copy of the landlord's message, complete with a list of repairs and a deadline.", flavorText: "The tape hisses like it knows the building is one rainstorm from becoming a swimming pool." },
    { id: "wedding_invitation", name: "Wedding Invitation", icon: "💌", isClue: true, description: "David's father's formal invitation. David's name is underlined twice.", flavorText: "Heavy cream paper. The kind of envelope that expects you to show up." },
  ],
  scenes: [
    {
      id: "mw_credits", title: "Welcome Back", nodeType: "credits", background: "/img/cover-moonlighting-welcome-back.jpg", ambientAudio: "jazz", letterbox: true,
      credits: { titleEntrance: "slam", stagger: 0.45, duration: 1, accentColor: "#ff4d9d", lines: [{ role: "A Blue Moon Graphic Novel", name: "" }, { role: "Starring", name: "Maddie Hayes & David Addison" }, { role: "Featuring", name: "One Very Unwelcome Voicemail" }] },
      prose: "WELCOME BACK, LOS ANGELES.\n\nThe office is closed. The trouble is already inside.", dialogueBeats: [], hotspots: [],
      choices: [{ id: "mw_start", text: "Roll the opening.", targetSceneId: "mw_welcome", attitudeTag: "Neutral" }],
    },
    {
      id: "mw_welcome", title: "The Welcome Back", background: "/img/bg-moonlighting-office.jpg", ambientAudio: "jazz", letterbox: true, cinematic: { mode: "dolly", focalPoint: "50% 42%", zoomDuration: 12, dimAmount: 0.08 },
      prose: "The camera finds the Blue Moon office exactly as they left it: dusty, overconfident, and one bad decision away from an insurance claim. Maddie steps into frame with a smile designed for viewers. David steps into frame with a phone already ringing.",
      dialogueBeats: [
        { id: "mww_1", characterId: "maddie", expression: "smile", text: "Welcome back. We hope you had a restful vacation, because we certainly did." },
        { id: "mww_2", characterId: "david", expression: "grin", text: "I did. I rested in three states, two hotel rooms, and one emotionally significant elevator." },
        { id: "mww_3", characterId: "david", expression: "phone", text: "Hold that thought. It's my mother. Nobody interrupts my mother. Not even the Emmy Awards." },
        { id: "mww_4", characterId: "father", expression: "voice", text: "David, your mother is perfectly fine. She only fainted when the television announced the nominees." },
        { id: "mww_5", characterId: "david", expression: "phone", text: "See? Perfectly fine. And if she wins, I'll be the one accepting on her behalf. Emotionally. From the sofa." },
      ],
      choices: [
        { id: "mw_emmy", text: "Ask about the Emmy nominees.", reply: true, hidden: true, consequences: { setFlags: ["mw_emmy_joke"] }, gating: { excludesFlags: ["mw_emmy_joke"] } },
        { id: "mw_to_machine", text: "Let the machine answer the next call.", targetSceneId: "mw_voicemail", attitudeTag: "Neutral" },
      ], hotspots: [],
    },
    {
      id: "mw_voicemail", title: "Blue Moon Detective Agency", background: "gradient:linear-gradient(145deg,#17172d 0%,#33204c 52%,#0b1226 100%)", ambientAudio: "drone", letterbox: true,
      prose: "The office empties of people and fills with recorded voices. Agnes has labeled the answering machine: BLUE MOON — PLEASE SPEAK CLEARLY — WE ARE LISTENING.",
      dialogueBeats: [
        { id: "mwv_1", characterId: "agnes", text: "Thank you for calling Blue Moon Detective Agency. If this is an emergency, please leave your name, number, and a detailed description of the emergency. If it is not an emergency, please pretend it is. It makes the day go faster." },
        { id: "mwv_2", characterId: "landlord", expression: "angry", text: "This is your landlord. Rent is due, the ceiling is not attached, and someone has replaced the lobby light with a lava lamp. Call me back before I call somebody else." },
        { id: "mwv_3", characterId: "maddie", expression: "flat", text: "He sounds motivated." },
        { id: "mwv_4", characterId: "david", expression: "bright", text: "He sounds like a man who has never had a lava lamp improve his property value." },
      ],
      choices: [
        { id: "mw_copy_tape", text: "Copy the landlord's message.", targetSceneId: "mw_office", consequences: { addItems: ["voicemail_tape"], setFlags: ["mw_rent_heard"] }, rememberLine: "The landlord will remember this call." },
        { id: "mw_ignore_rent", text: "Let the machine blink.", targetSceneId: "mw_office", consequences: { setFlags: ["mw_rent_heard"], meterChanges: [{ meter: "Suspicion", delta: 1 }] }, attitudeTag: "Aggressive" },
      ], hotspots: [],
    },
    {
      id: "mw_office", title: "Return to the Office", background: "/img/bg-moonlighting-office.jpg", ambientAudio: "jazz", cinematic: { mode: "pan", focalPoint: "53% 44%", zoomDuration: 14, dimAmount: 0.06 },
      prose: "By noon, the staff has returned, along with the particular electricity of a workplace where everyone missed everyone and would prefer not to discuss it. David makes his entrance from the wrong door, carrying a hat, a newspaper, and no explanation.",
      dialogueBeats: [
        { id: "mwo_1", characterId: "david", expression: "grand", text: "Good afternoon, loyal employees, reluctant partners, and people who are only here because the lock on the front door is broken!" },
        { id: "mwo_2", characterId: "bert", text: "We were doing fine until you arrived." },
        { id: "mwo_3", characterId: "david", text: "That's the nicest thing anyone has said to me all week." },
        { id: "mwo_4", characterId: "maddie", expression: "dry", text: "How was your vacation, David? The version with facts." },
        { id: "mwo_5", characterId: "david", expression: "teasing", text: "I saw the Grand Canyon, a woman named Dolores, and the inside of my own head. I recommend the canyon." },
        { id: "mwo_6", characterId: "maddie", expression: "soft", text: "Mine was quiet. I read a book. Twice. Nobody called me at three in the morning." },
        { id: "mwo_7", characterId: "david", expression: "teasing", text: "You missed me." },
      ],
      choices: [
        { id: "mw_admit", text: "Admit you missed him.", targetSceneId: "mw_private", consequences: { setFlags: ["mw_vacations_shared"] }, attitudeTag: "Sultry" },
        { id: "mw_deflect", text: "Ask about the case files.", targetSceneId: "mw_private", consequences: { setFlags: ["mw_vacations_shared"] }, attitudeTag: "Neutral" },
      ], hotspots: [],
    },
    {
      id: "mw_private", title: "Between the Lines", background: "/img/bg-moonlighting-balcony.jpg", ambientAudio: "jazz", letterbox: true, cinematic: { mode: "zoom-hold", focalPoint: "54% 38%", zoomDuration: 8, dimAmount: 0.12 },
      prose: "The office noise falls away. On the balcony, Los Angeles glitters with the confidence of a city that has never had to apologize for itself. Maddie's phone rings. It is David's father, which is not the same thing as David.",
      dialogueBeats: [
        { id: "mwp_1", characterId: "father", text: "Maddie? Is David there? He said he was going to meet me at the church." },
        { id: "mwp_2", characterId: "maddie", text: "David is in the office. Unless he has invented a second office." },
        { id: "mwp_3", characterId: "father", text: "He has invented worse. Tell him I need an answer about the wedding. I want him beside me. Best man. Not just a name on a program." },
        { id: "mwp_4", characterId: "maddie", text: "I'll tell him. But he may hear 'best man' and interpret it as a challenge." },
        { id: "mwp_5", characterId: "david", expression: "caught", text: "I don't interpret anything. I receive information and improve it." },
        { id: "mwp_6", characterId: "maddie", expression: "serious", text: "Your father wants you at the wedding." },
        { id: "mwp_7", characterId: "david", expression: "guarded", text: "My father wants the version of me who shows up in a tuxedo, says the right toast, and doesn't mention why we stopped speaking." },
      ],
      choices: [{ id: "mw_confront", text: "Ask what happened between them.", targetSceneId: "mw_party", attitudeTag: "Aggressive" }, { id: "mw_give_space", text: "Give him room to answer.", targetSceneId: "mw_party", attitudeTag: "Sultry" }], hotspots: [],
    },
    {
      id: "mw_party", title: "The Party", background: "/img/bg-moonlighting-party.jpg", ambientAudio: "jazz", letterbox: true, cinematic: { mode: "pan", focalPoint: "48% 43%", zoomDuration: 10, dimAmount: 0.03 },
      prose: "The party begins because Agnes found champagne in a cupboard and ends because everyone remembers the rent. Streamers sway above the case board. David is briefly the life of the party, which is where he is most likely to hide.",
      dialogueBeats: [
        { id: "mwp2_1", characterId: "agnes", text: "To Blue Moon: may our clients be solvent, our suspects be talkative, and our landlord develop a hobby." },
        { id: "mwp2_2", characterId: "david", text: "Hear, hear! To the office — the only place where a broken ceiling is considered overhead." },
        { id: "mwp2_3", characterId: "maddie", text: "You can't joke your way out of every room." },
        { id: "mwp2_4", characterId: "david", text: "Not every room. Just the rooms with doors." },
        { id: "mwp2_5", characterId: "father", expression: "phone", text: "David. I am asking you once. Will you stand with me?" },
        { id: "mwp2_6", characterId: "david", expression: "quiet", text: "You didn't ask me to stand with you when you left. You asked me to understand. I was twelve." },
        { id: "mwp2_7", characterId: "father", text: "I was wrong. I am asking now." },
        { id: "mwp2_8", characterId: "david", expression: "shaken", text: "That's the problem. Now sounds a lot like a deadline." },
      ],
      choices: [
        { id: "mw_stay", text: "Stay beside David.", targetSceneId: "mw_dilemma", consequences: { setFlags: ["mw_david_best_man", "mw_maddie_stayed"] }, attitudeTag: "Sultry", rememberLine: "Maddie will remember that." },
        { id: "mw_push", text: "Push David to give his father an answer.", targetSceneId: "mw_dilemma", consequences: { setFlags: ["mw_david_best_man"] }, attitudeTag: "Aggressive" },
      ], hotspots: [],
    },
    {
      id: "mw_dilemma", title: "The Best Man", background: "/img/bg-moonlighting-balcony.jpg", ambientAudio: "drone", letterbox: true, cinematic: { mode: "dolly-zoom", focalPoint: "50% 44%", zoomDuration: 9, dimAmount: 0.18 },
      prose: "The party dissolves behind the glass. David holds the invitation as if it were evidence. He has always been good at finding the joke in a threat. Tonight, for once, the joke refuses to appear.",
      dialogueBeats: [
        { id: "mwd_1", characterId: "david", expression: "quiet", text: "If I say yes, I become the son he wants for one afternoon. If I say no, I become the son he tells people I am." },
        { id: "mwd_2", characterId: "maddie", expression: "soft", text: "You could go as yourself." },
        { id: "mwd_3", characterId: "david", expression: "wry", text: "Maddie, I have spent years making myself up as myself. It is a very convincing disguise." },
        { id: "mwd_4", characterId: "maddie", text: "Then don't decide tonight. But don't disappear either." },
        { id: "mwd_5", characterId: "david", expression: "half-smile", text: "Is that detective advice?" },
        { id: "mwd_6", characterId: "maddie", expression: "half-smile", text: "It's the closest thing you're getting to a toast." },
      ],
      choices: [{ id: "mw_end", text: "Leave the invitation open on the desk.", targetSceneId: "mw_end", consequences: { setFlags: ["mw_david_best_man"] }, attitudeTag: "Neutral" }], hotspots: [],
    },
    {
      id: "mw_end", title: "To Be Continued", isEnding: true, background: "/img/bg-moonlighting-office.jpg", ambientAudio: "drone", letterbox: true,
      prose: "Morning will bring a case, a landlord, and a wedding date with a question mark beside it. For now the invitation stays open. So does the door.", dialogueBeats: [], choices: [], hotspots: [],
      endingData: { tier: "victory-silver", headline: "THE DOOR STAYS OPEN", recap: "David has not answered his father. Maddie has not stopped asking. Blue Moon is back on the air, and the next episode has already begun in the silence after the party." },
    },
  ],
};
