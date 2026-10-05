import type { Story } from "../types";

/**
 * THE GLASS HOUR
 * A cleaner, studio-style flagship case: readable acts, one core suspect chain,
 * visible evidence, three mini-games, corkboard payoff, and a shootout finale.
 */
export const GLASS_HOUR: Story = {
  id: "glass-hour",
  title: "The Glass Hour",
  tagline: "At 1:17 a.m., every clock in the hotel stopped. One guest kept moving.",
  coverImage: "/img/bg-penthouse.jpg",
  startSceneId: "gh_office",
  layout: {
    gh_office: { x: 0, y: 220 },
    gh_lobby: { x: 360, y: 220 },
    gh_service: { x: 720, y: 60 },
    gh_suite: { x: 720, y: 380 },
    gh_roof: { x: 1080, y: 220 },
    gh_shootout: { x: 1440, y: 220 },
    gh_end_gold: { x: 1800, y: 40 },
    gh_end_silver: { x: 1800, y: 240 },
    gh_end_loss: { x: 1800, y: 440 },
  },
  briefing: {
    objective: "Prove who murdered hotel magnate Armand Vale during the one-minute blackout at the glass hotel.",
    winConditions: [
      "Recover the lobby timetable, switchboard code, and broken glass eye.",
      "Connect all three clues on the corkboard before accusing anyone.",
      "Corner Silas Vale on the roof and win the shootout before he reaches the elevator cage.",
    ],
    loseConditions: [
      "Accuse Ava without evidence — Silas pins the murder on her.",
      "Let Suspicion reach 6 — hotel security destroys the switchboard logs.",
      "Lose the roof shootout and Silas escapes with the murder weapon.",
    ],
    heatLimit: 6,
    heatFailSceneId: "gh_end_loss",
  },
  characters: [
    { id: "ava", name: "Ava Vale", role: "Glass Heiress", avatarUrl: "/img/ch-vivienne.png", trustMeter: 0, voice: { pitch: 1.15, rate: 0.86 } },
    { id: "silas", name: "Silas Vale", role: "Hotel Manager", avatarUrl: "/img/ch-rocco.png", trustMeter: 0, voice: { pitch: 0.7, rate: 0.9 } },
    { id: "eddie_bell", name: "Eddie Bell", role: "Bellhop and Switchboard Runner", avatarUrl: "emoji:🛎️", trustMeter: 0, voice: { pitch: 1.05, rate: 0.96 } },
  ],
  items: [
    { id: "room_key", name: "Suite 917 Key", icon: "🗝️", description: "A brass key to the suite where Armand died.", flavorText: "Nine seventeen. The hour stopped at one seventeen." },
    { id: "timetable", name: "Stopped Timetable", icon: "🕰️", description: "The lobby timetable freezes Silas's alibi exactly one minute before the blackout.", flavorText: "Time lied. Paper did not.", isClue: true },
    { id: "switch_code", name: "Switchboard Code", icon: "☎️", description: "A decoded switchboard note showing Eddie patched Silas into Suite 917 at 1:16 a.m.", flavorText: "One call before the lights died.", isClue: true },
    { id: "glass_eye", name: "Broken Glass Eye", icon: "👁️", description: "A decorative glass eye from Armand's cane. It shattered in the killer's hand.", flavorText: "The hotel watched its owner die.", isClue: true },
    { id: "revolver", name: "Pocket Revolver", icon: "🔫", description: "Your backup revolver. Six shots, less patience.", flavorText: "Not subtle. Sometimes useful." },
  ],
  deduction: {
    suspectIds: ["ava", "silas", "eddie_bell"],
    connections: [
      { a: "timetable", b: "silas", flagSet: "silas_time_lie", revelation: "Silas's alibi depends on a clock that stopped before the blackout. He lied about when he left the lobby." },
      { a: "switch_code", b: "eddie_bell", flagSet: "eddie_patched_call", revelation: "Eddie patched Silas through to Suite 917 one minute before the lights failed. Eddie was used, not the killer." },
      { a: "glass_eye", b: "ava", flagSet: "ava_framed", revelation: "The broken glass eye was planted near Ava's room. She was meant to look guilty." },
    ],
  },
  scenes: [
    {
      id: "gh_office",
      title: "Act I — Cole's Office",
      background: "/img/bg-office.jpg",
      ambientAudio: "rain",
      particles: "rain",
      prose: "Ava Vale arrived with a raincoat, a hotel key, and the look of someone who had already been accused in private. Her father was dead at the Glass Hour Hotel. Every clock in the building stopped at 1:17.",
      dialogueBeats: [
        { id: "gho_ava", characterId: "ava", expression: "fragile control", text: "They think I killed him, detective. I did hate him. But I didn't touch him. Please find the minute everyone keeps lying about." },
      ],
      hotspots: [
        { id: "gho_key", label: "Ava's Suite 917 key", bounds: { x: 12, y: 64, w: 16, h: 15 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "room_key" } },
        { id: "gho_gun", label: "Pocket revolver in the desk", bounds: { x: 70, y: 70, w: 16, h: 14 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "revolver" } },
      ],
      choices: [
        { id: "gho_go", text: "Go to the Glass Hour Hotel.", targetSceneId: "gh_lobby", attitudeTag: "Neutral", gating: { requiresItems: ["room_key"] } },
      ],
    },
    {
      id: "gh_lobby",
      title: "Act I — The Glass Lobby",
      background: "/img/bg-club.jpg",
      ambientAudio: "jazz",
      prose: "The lobby glittered with mirrored columns. Silas Vale smiled under all of them. Behind him, a bellhop kept glancing at the switchboard as if it might start confessing.",
      dialogueBeats: [
        { id: "ghl_silas", characterId: "silas", expression: "silken contempt", text: "Miss Vale is distraught. Grief does ugly things to memory. Let the police handle the unpleasant details." },
        { id: "ghl_eddie", characterId: "eddie_bell", expression: "nervous", text: "I didn't hear nothin'. Switchboard was dead the whole blackout. Mostly dead. I mean — dead enough." },
      ],
      hotspots: [
        { id: "ghl_time", label: "Lobby timetable frozen at 1:16", bounds: { x: 16, y: 18, w: 20, h: 30 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "timetable" } },
              ],
      choices: [
        { id: "ghl_suite", text: "Use Ava's key and inspect Suite 917.", targetSceneId: "gh_suite", attitudeTag: "Neutral", gating: { requiresItems: ["room_key"] } },
        { id: "ghl_service", text: "Pressure Eddie into showing you the switchboard room. (+Suspicion)", targetSceneId: "gh_service", attitudeTag: "Aggressive", consequences: { meterChanges: [{ meter: "Suspicion", delta: 1 }] } },
      ],
    },
    {
      id: "gh_service",
      title: "Act II — Service Corridor",
      background: "/img/bg-office.jpg",
      ambientAudio: "drone",
      prose: "Behind the lobby, the hotel was all steam pipes and phone wire. Eddie's hand shook as he pointed to the switchboard cabinet. The lock had been scratched open once already.",
      hotspots: [
        { id: "ghs_code", label: "Read the note taped to the switchboard cabinet", bounds: { x: 46, y: 34, w: 22, h: 26 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "switch_code" } },
      ],
      choices: [
        { id: "ghs_suite", text: "Take the switchboard note and inspect Suite 917.", targetSceneId: "gh_suite", attitudeTag: "Clever", gating: { requiresItems: ["switch_code"] } },
        { id: "ghs_lobby", text: "Return to the lobby.", targetSceneId: "gh_lobby", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "gh_suite",
      title: "Act II — Suite 917",
      background: "/img/bg-penthouse.jpg",
      ambientAudio: "tension",
      prose: "Armand Vale died beside the writing desk. No blood spray, no broken window — just a smashed cane handle and a scattering of glass fragments arranged too neatly to be accidental.",
      hotspots: [
        { id: "ghs_eye", label: "Pick up the shattered glass eye from the cane", bounds: { x: 40, y: 46, w: 22, h: 28 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "glass_eye" } },
      ],
      choices: [
        { id: "ghs_roof", text: "The fragments point upward — head to the roof garden.", targetSceneId: "gh_roof", attitudeTag: "Clever", gating: { requiresItems: ["glass_eye"] } },
      ],
    },
    {
      id: "gh_roof",
      title: "Act III — Roof Garden",
      background: "/img/bg-penthouse.jpg",
      ambientAudio: "tension",
      prose: "Rain ran down the greenhouse glass. Silas waited by the elevator cage with a wrapped cane in one hand and a pistol in the other. He'd planned for Ava to take the blame. He had not planned on you.",
      hotspots: [
        { id: "ghr_board", label: "Open corkboard before accusing", bounds: { x: 40, y: 18, w: 20, h: 20 }, cursor: "use", isRepeatable: true, action: { type: "openBoard" } },
      ],
      choices: [
        { id: "ghr_accuse", text: "Accuse Silas: the clock, call, and planted glass all line up.", targetSceneId: "gh_shootout", attitudeTag: "Clever", gating: { requiresFlags: ["silas_time_lie", "eddie_patched_call", "ava_framed"] } },
        { id: "ghr_blame_ava", text: "Accuse Ava without completing the board.", targetSceneId: "gh_end_loss", attitudeTag: "Neutral" },
        { id: "ghr_deal", text: "Force Silas to resign with partial evidence.", targetSceneId: "gh_end_silver", attitudeTag: "Aggressive", gating: { requiresItems: ["switch_code", "timetable"], requiresAll: true } },
      ],
    },
    {
      id: "gh_shootout",
      title: "Act III — Elevator Cage Shootout",
      background: "/img/bg-penthouse.jpg",
      ambientAudio: "tension",
      prose: "Silas kicked open the elevator cage and ran for the service stairs. Rain hit the glass roof like applause. You had seconds to stop him before the hotel swallowed him whole.",
      hotspots: [
              ],
      choices: [
        { id: "ghs_stop", text: "Cut him off at the service stairs.", targetSceneId: "gh_end_gold", attitudeTag: "Clever" },
      ],
    },
    {
      id: "gh_end_gold",
      title: "Gold Ending — Time Tells",
      background: "/img/bg-penthouse.jpg",
      ambientAudio: "jazz",
      prose: "Silas went down before the elevator doors opened. The clock, call log, and glass eye survived him. Ava walked out clean, and the hotel finally showed the city its real face.",
      isEnding: true,
      endingData: { tier: "victory-gold", headline: "HOTEL HEIR EXPOSED — CLOCKWORK ALIBI SHATTERS", recap: "You proved the frame-up, completed the board, and stopped Silas before he escaped." },
    },
    {
      id: "gh_end_silver",
      title: "Silver Ending — The Resignation",
      background: "/img/bg-office.jpg",
      ambientAudio: "rain",
      prose: "Silas resigned before sunrise. It saved Ava but buried the murder in legal smoke. You had enough to break his grip, not enough to put him away.",
      isEnding: true,
      endingData: { tier: "victory-silver", headline: "VALE HOTEL MANAGER RESIGNS AMID BLACKOUT SCANDAL", recap: "Partial evidence saved Ava but left the murder technically open." },
    },
    {
      id: "gh_end_loss",
      title: "Game Over — Broken Glass",
      background: "/img/bg-alley.jpg",
      ambientAudio: "rain",
      prose: "Silas escaped with the cane, the hotel burned the records, and Ava became tomorrow's headline. The city kept its clocks running. None of them told the truth.",
      isEnding: true,
      endingData: { tier: "gameover", headline: "HEIRESS CHARGED AS DETECTIVE LOSES SUSPECT", recap: "You accused without a completed board or lost Silas in the final shootout." },
    },
  ],
};