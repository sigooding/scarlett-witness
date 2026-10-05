import type { Story } from "../types";

/* ------------------------------------------------------------------ *
 *  GLASS ROAD — an original, X-Files-in-spirit paranormal case.
 *
 *  Two agents from the Bureau's "Unassigned / Anomalous Cases" annex are
 *  sent to a flyspeck Wyoming town that swears it was closed by a flu
 *  quarantine for eleven days. The dates don't line up. Neither does
 *  Route 9 — a county road that appears on no survey from 1966 to 1993,
 *  except in one retired surveyor's letters, which is exactly why the
 *  Bureau was told to bury it.
 *
 *  NOT noir: no fedoras, no rain-slicked 1940s pulp. The mood is cold —
 *  winter forest, federal-utility trucks, a town holding its breath.
 *  The believer/skeptic pairing is inverted from the stock template: the
 *  veteran agent (Oakes) is the believer; the young analyst (Winfield)
 *  does the math and keeps demanding a mechanism. Everyone is original.
 *
 *  Art: public/assets/glass-road/*.jpg (cold 35mm-style film stills)
 * ------------------------------------------------------------------ */

const A = "/assets/glass-road";

/* ------------------------------------------------------------------ *
 *  THE STORY
 *  ------------------------------------------------------------------ */
export const GLASS_ROAD: Story = {
  id: "glass-road",
  title: "Glass Road",
  tagline:
    "Renwick, Wyoming. Every twenty-seven years the county closes Route 9 for eleven days. This time a surveyor wrote to the FBI before he disappeared.",
  gameKind: "noir-rail",
  coverImage: `${A}/cover.jpg`,
  startSceneId: "gr_cold",

  briefing: {
    gameInfo:
      "An original paranormal case in the spirit of a classic federal X-file. Two agents — Mara Oakes, who has seen the impossible too many times to keep denying it, and Cole Winfield, an analyst who believes in the file, the chain of custody and the math. Cold winter setting, deliberately NOT film-noir.",
    objective:
      "Find out what actually happens to Renwick every twenty-seven years — and who is waiting behind the 'quarantine.'",
    winConditions: [
      "Recover the 1977 survey tape, the AM loop recording, and Ellery's survey maps.",
      "Decide what the Loop is — and what should happen to it.",
    ],
    loseConditions: [
      "Let the heat get too high and the county truck collects you.",
      "Try to take the road by force.",
      "Walk away and leave the file sealed.",
    ],
    heatLimit: 5,
    heatFailSceneId: "gr_busted",
  },

  flagNotes: {
    gr_farm_done: "The 1977 survey tape was recovered from the Ellery farmhouse.",
    gr_radio_done: "The AM loop recording was recovered from Walt Prine's shack.",
    gr_ready: "All three pieces of evidence are in hand. The agents understand what the Loop is.",
    gr_trusted: "Oakes called Vessey and asked him to stand the county down.",
    gr_opened: "The crossing was opened on schedule.",
    gr_sealed: "Route 9 was sealed and the file was buried.",
  },

  layout: {
    gr_cold: { x: 40, y: 120 },
    gr_sheriff: { x: 330, y: 120 },
    gr_farm: { x: 620, y: 30 },
    gr_radio: { x: 620, y: 220 },
    gr_sheriff2: { x: 930, y: 120 },
    gr_ridge: { x: 1240, y: 120 },
    gr_convoy: { x: 1540, y: 30 },
    gr_crossing: { x: 1540, y: 220 },
    gr_decision: { x: 1850, y: 120 },
    gr_win_gold: { x: 2140, y: 30 },
    gr_win_silver: { x: 2140, y: 180 },
    gr_busted: { x: 2140, y: 330 },
    gr_silence: { x: 1850, y: 380 },
  },

  dialogueBox: {
    hudTheme: "midnight-teal",
    bodyFont: "type",
    headingFont: "type",
    accentColor: "#a9c6d8",
    dangerColor: "#d96a5f",
  },

  characters: [
    {
      id: "c_mara",
      name: "Mara Oakes",
      role: "FBI — Anomalous Cases Annex · agent",
      avatarUrl: "emoji:🕵️‍♀️",
      trustMeter: 0,
    },
    {
      id: "c_cole",
      name: "Cole Winfield",
      role: "FBI — analyst, seconded from Archives",
      avatarUrl: "emoji:🧠",
      trustMeter: 0,
    },
    {
      id: "c_sheriff",
      name: "Sheriff Dale Vessey",
      role: "Sheriff, Renwick County",
      avatarUrl: "emoji:🚔",
      trustMeter: 0,
    },
    {
      id: "c_june",
      name: "June Ellery",
      role: "Widow of the surveyor",
      avatarUrl: "emoji:👵",
      trustMeter: 0,
    },
    {
      id: "c_walt",
      name: "Walt Prine",
      role: "Amateur radio operator",
      avatarUrl: "emoji:🎙",
      trustMeter: 0,
    },
    {
      id: "c_tom",
      name: "Thomas Ellery",
      role: "Surveyor (retired)",
      avatarUrl: "emoji:🧭",
      trustMeter: 0,
    },
  ],

  items: [
    {
      id: "it_vhs",
      name: "Survey Tape — 1977",
      icon: "🎞️",
      description: "June Ellery's husband filmed the Route 9 survey crew in 1977.",
      flavorText:
        "On the tape a county crew marks a centreline. For fifty-three seconds the crew's own van isn't there. Then it is, parked facing the wrong way, timecode jumped eleven days.",
      isClue: true,
    },
    {
      id: "it_tape",
      name: "AM Loop Recording",
      icon: "📼",
      description: "Walt Prine's reel of a voice counting down on a frequency that isn't licensed.",
      flavorText:
        "Two hours of a flat voice counting — eleven, ten, nine — then static, then it restarts. The counter and the wall clock disagree by eleven days.",
      isClue: true,
    },
    {
      id: "it_map",
      name: "Ellery's Survey Maps",
      icon: "🗺️",
      description: "County survey maps, 1966–1993, with Route 9 pencilled where no road exists.",
      flavorText:
        "The road is surveyed on every other sheet; the odd years leave a gap like a missing tooth. Someone kept re-filing Route 9 out of existence, and Thomas Ellery kept finding it.",
      isClue: true,
    },
    {
      id: "it_ledger",
      name: "Quarantine Ledger Page",
      icon: "📄",
      description: "A single page from the county clerk dated to the last 'quarantine.'",
      flavorText:
        "An eleven-day entry signed by the Sheriff, next to pages that are somehow both water-stained and never folded. The ink says flu. The spine says the book was never opened for the decade around it.",
      isClue: true,
    },
  ],

  scenes: [
    /* ============================================================ *
     *  1 · COLD OPEN — the barricade at the base of the ridge
     * ============================================================ */
    {
      id: "gr_cold",
      title: "Route 9 — 10:42 PM",
      background: `${A}/cold-open-road.jpg`,
      prose:
        "A rented sedan stops where the blacktop runs out under a barricade. Two agents get out into falling snow and a silence so complete the wind sounds recorded and played back too slowly. Route 9 is closed, the sign says, for maintenance. The county's maintenance of this particular road has been suspended since 1966 — which is why they are here.",
      cinematic: {
        mode: "shake",
        shakeAmount: 0.08,
        colorGrade: "nolan-imax",
        filmGrade: true,
        filmGradeStrength: 0.35,
      },
      dialogueBeats: [
        {
          id: "gr_cold_b1",
          characterId: "c_cole",
          text: "For the record, I think this is a four-hour drive to stare at a road sign and drink bad coffee. A crank surveyor re-filing an imaginary road.",
        },
        {
          id: "gr_cold_b2",
          characterId: "c_mara",
          text: "Thomas Ellery surveyed this county for thirty-one years. He wrote us because the road he surveyed isn't on the maps anymore. And now he isn't answering his phone, Cole.",
          background: `${A}/casefile-open.jpg`,
          backgroundTransition: "fade",
          backgroundHold: false,
        },
        {
          id: "gr_cold_b3",
          characterId: "c_cole",
          text: "People move. People stop answering phones. That's not a file.",
        },
        {
          id: "gr_cold_b4",
          characterId: "c_mara",
          text: "No. Eleven days is a file. Every twenty-seven years the county shuts a road that isn't supposed to exist, for eleven days, and the town behind it reports a flu nobody can produce records for. You run numbers, Cole. Run them.",
        },
      ],
      hotspots: [
        {
          id: "gr_cold_barricade",
          label: "Barricade & closure sign",
          bounds: { x: 42, y: 52, w: 16, h: 14 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "CLOSED FOR MAINTENANCE. The stencil is fresh, but the reflector bolts are rusted through — nobody has opened this barricade in years. Somebody repainted it this week, for a road nobody maintains.",
          },
        },
        {
          id: "gr_cold_tracks",
          label: "Tire tracks in the snow",
          bounds: { x: 66, y: 70, w: 20, h: 12 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Two sets of tracks go around the barricade and into the fog: one narrow sedan, one wide and heavy — a truck. They both go in. Neither set comes back.",
          },
        },
      ],
      choices: [
        {
          id: "gr_cold_around",
          text: "Drive around the barricade. Records can wait.",
          targetSceneId: "gr_sheriff",
          attitudeTag: "Clever",
          consequences: { meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
        {
          id: "gr_cold_log",
          text: "Log the open barricade with dispatch first. An unsecured federal barrier is a chain-of-custody problem.",
          targetSceneId: "gr_sheriff",
          attitudeTag: "Neutral",
          consequences: { meterChanges: [{ meter: "Sultry", delta: 1 }] },
        },
      ],
    },

    /* ============================================================ *
     *  2 · THE SHERIFF'S OFFICE — first contact
     * ============================================================ */
    {
      id: "gr_sheriff",
      title: "Renwick — Sheriff's Office",
      background: `${A}/sheriff-office.jpg`,
      prose:
        "The Sheriff's office smells of floor wax and a heater that has been on since October. Sheriff Dale Vessey doesn't get up. He looks at two federal badges the way a man looks at a debt he thought was settled.",
      cinematic: { mode: "zoom-hold", focalPoint: "50% 45%", zoomDuration: 14 },
      dialogueBeats: [
        {
          id: "gr_sheriff_b1",
          characterId: "c_sheriff",
          text: "Anomalous Cases Annex. You're not even the real bureau. You're the ones who get sent when the real bureau wants a file to go away quietly.",
        },
        {
          id: "gr_sheriff_b2",
          characterId: "c_mara",
          text: "Thomas Ellery wrote to us, Sheriff. He said Route 9 was surveyed, then struck from every county map. He had the sheets to prove it. Then he stopped answering.",
        },
        {
          id: "gr_sheriff_b3",
          characterId: "c_cole",
          text: "You've closed Route 9 twice in living memory — 'maintenance,' the county logs say. What exactly gets maintained?",
        },
        {
          id: "gr_sheriff_b4",
          characterId: "c_sheriff",
          text: "Road's been closed since '66. Nothin' up there but forest and a dead radio tower. Ellery was a good surveyor who lost a man up that way once and never let it go. Every few years he got religion about a road.",
        },
      ],
      hotspots: [
        {
          id: "gr_sheriff_wall_map",
          label: "County maps on the wall",
          bounds: { x: 20, y: 18, w: 26, h: 30 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "A current county map. Where Route 9 should climb to the ridge the paper is clean — the pin is gone. Beside it hangs an older map, yellowed, and on that one the road is still printed, unpinned, left in like an oversight.",
          },
        },
        {
          id: "gr_sheriff_quarantine",
          label: "The quarantine report on the desk",
          bounds: { x: 62, y: 58, w: 22, h: 18 },
          cursor: "look",
          isRepeatable: false,
          action: {
            type: "showText",
            text: "You read the single page over his shoulder. Eleven days. Flu. Signed Vessey. The paper is new — and dated to a week every other record in this office says he was on leave.",
          },
        },
      ],
      choices: [
        {
          id: "gr_sheriff_go_farm",
          text: "Keep it human — ask about June Ellery and let him point you to the farm.",
          targetSceneId: "gr_farm",
          attitudeTag: "Neutral",
        },
        {
          id: "gr_sheriff_go_radio",
          text: "Press him about the open barricade, then start with the radio man.",
          targetSceneId: "gr_radio",
          attitudeTag: "Aggressive",
          consequences: { meterChanges: [{ meter: "Suspicion", delta: 1 }] },
        },
      ],
    },

    /* ============================================================ *
     *  3 · THE ELLERY FARMHOUSE — the survey tape
     * ============================================================ */
    {
      id: "gr_farm",
      title: "The Ellery Farmhouse",
      background: `${A}/ellery-farmhouse.jpg`,
      prose:
        "June Ellery is eighty and not afraid of anything, including two federal agents on her porch at nine at night. She pours coffee and answers before they ask: no, Tom didn't sell up and go south. He left her a note she didn't understand and a box of tapes she didn't want.",
      cinematic: { mode: "zoom-hold", focalPoint: "40% 42%", zoomDuration: 16 },
      dialogueBeats: [
        {
          id: "gr_farm_b1",
          characterId: "c_june",
          text: "Tom always said the road was real and the county was lyin'. When the maps went, he kept his own. Said one day the road'd come back and he wanted to be standin' on it.",
          background: `${A}/evidence-letter.jpg`,
          backgroundTransition: "fade",
          backgroundHold: false,
        },
        {
          id: "gr_farm_b2",
          characterId: "c_cole",
          text: "He mailed a box to the Bureau, ma'am. We need the tape from 1977 — the survey crew he filmed on Route 9.",
        },
        {
          id: "gr_farm_b3",
          characterId: "c_june",
          text: "That one's here. He kept it under the television, the way a man keeps a thing he's afraid of losin' and ashamed of watchin'. I never could bring myself to throw it out.",
          background: `${A}/evidence-vhs.jpg`,
          backgroundTransition: "fade",
          backgroundHold: false,
        },
      ],
      hotspots: [
        {
          id: "gr_farm_vcr",
          label: "The tape under the television",
          bounds: { x: 56, y: 60, w: 26, h: 18 },
          cursor: "take",
          isRepeatable: false,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "it_vhs", flagSet: "gr_farm_done" },
        },
        {
          id: "gr_farm_note",
          label: "Tom's note on the sideboard",
          bounds: { x: 28, y: 46, w: 20, h: 16 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "In a tight surveyor's hand: 'June — if the road comes back and I'm not here, tell whoever asks that the tape and the road are the same lie told forward and backward. I went up to see it one more time.'",
          },
        },
      ],
      choices: [
        {
          id: "gr_farm_to_radio",
          text: "Next: Walt Prine's shack — the loop recording.",
          targetSceneId: "gr_radio",
          attitudeTag: "Clever",
        },
        {
          id: "gr_farm_to_sheriff",
          text: "Both leads checked — back to the Sheriff with everything.",
          targetSceneId: "gr_sheriff2",
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["gr_farm_done", "gr_radio_done"], requiresAll: true },
        },
      ],
    },

    /* ============================================================ *
     *  4 · WALT PRINE'S RADIO SHACK — the AM loop
     * ============================================================ */
    {
      id: "gr_radio",
      title: "Walt Prine's Radio Shack",
      background: `${A}/walt-radio-shack.jpg`,
      prose:
        "Walt Prine is thin and cheerful in a way that stops at the eyes. The shack is warm, wallpapered in dials, and smells of solder and instant coffee. He has been waiting for the bureau for thirty years; he just assumed they'd come from the FCC.",
      cinematic: { mode: "zoom-hold", focalPoint: "46% 55%", zoomDuration: 16 },
      dialogueBeats: [
        {
          id: "gr_radio_b1",
          characterId: "c_walt",
          text: "It isn't on any band you'd license, and it doesn't bleed off anything real. Starts up every twenty-seven years to the day. Counts down from eleven. Static. Restarts. Same voice every time.",
        },
        {
          id: "gr_radio_b2",
          characterId: "c_cole",
          text: "A countdown loop on a dead frequency. Could be a tape someone forgot to unplug in '66.",
        },
        {
          id: "gr_radio_b3",
          characterId: "c_walt",
          text: "I told myself that for twenty years. Then I logged the loop against the wall clock and a WWV time signal. Agent, the loop is exactly as long as the gap it counts down to. Eleven days, to the second. Somebody's countin' to something, and whatever it is, this town is the something.",
          background: `${A}/evidence-am-tape.jpg`,
          backgroundTransition: "fade",
          backgroundHold: false,
        },
        {
          id: "gr_radio_b4",
          characterId: "c_walt",
          text: "Last time it ran, the county shut the road and told everyone flu. Eleven days nobody can remember. I remember. I didn't sleep the whole time — I knew if I blinked I'd lose a year like the rest of 'em.",
        },
      ],
      hotspots: [
        {
          id: "gr_radio_reel",
          label: "The reel-to-reel with the loop",
          bounds: { x: 46, y: 56, w: 26, h: 22 },
          cursor: "take",
          isRepeatable: false,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "it_tape", flagSet: "gr_radio_done" },
        },
        {
          id: "gr_radio_log",
          label: "The thirty-year logbook",
          bounds: { x: 20, y: 28, w: 20, h: 28 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Handwritten pages back to 1966. Every twenty-seven years the same three marks in the margin: a rising road, an eleven, and one circled word — 'Ellery.' Walt and the surveyor compared notes for decades.",
          },
        },
      ],
      choices: [
        {
          id: "gr_radio_to_farm",
          text: "Next: the widow's farmhouse — the survey tape.",
          targetSceneId: "gr_farm",
          attitudeTag: "Clever",
        },
        {
          id: "gr_radio_to_sheriff",
          text: "Both leads checked — back to the Sheriff with everything.",
          targetSceneId: "gr_sheriff2",
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["gr_farm_done", "gr_radio_done"], requiresAll: true },
        },
      ],
    },

    /* ============================================================ *
     *  5 · SECOND VISIT — press Vessey for Ellery's file
     * ============================================================ */
    {
      id: "gr_sheriff2",
      title: "The Second Ask",
      background: `${A}/sheriff-office.jpg`,
      prose:
        "This time Vessey meets them at the threshold, coat half on, unsurprised. Oakes lays the survey tape and Walt's recording side by side on the step and tells him exactly what the date maths say. The sheriff goes very still — the way a man does when the debt he thought was settled hands him the invoice again.",
      onEnterActions: [{ consequences: { setFlags: ["gr_ready"] } }],
      cinematic: { mode: "zoom-hold", focalPoint: "58% 55%", zoomDuration: 18 },
      dialogueBeats: [
        {
          id: "gr_sheriff2_b1",
          characterId: "c_sheriff",
          text: "So you found the loop and the film. Good for you. Tom Ellery found the same things forty years ago, and now he's gone. That's the whole lesson, agents.",
        },
        {
          id: "gr_sheriff2_b2",
          characterId: "c_mara",
          text: "Where is he, Sheriff? His file says south. His wife says he left a note about the road coming back. One of those is a lie.",
        },
        {
          id: "gr_sheriff2_b3",
          characterId: "c_sheriff",
          text: "Both of 'em are true, and that's the part you won't understand till you're on it. The road's real. It comes back. When it does, the town goes with it — every twenty-seven years, for eleven days, Renwick isn't where it was. And the people who stay? They're the ones who can't tell you, 'cause they don't come back the same.",
        },
        {
          id: "gr_sheriff2_b4",
          characterId: "c_sheriff",
          text: "Every closure there's men with trucks who come up the ridge and hold the road. Federal contractor, they say. I stopped askin' questions the first time they showed me what happens to men who ask questions. You want his maps — take 'em. Maybe you'll be the ones who don't go up the road.",
          background: `${A}/evidence-survey-map.jpg`,
          backgroundTransition: "fade",
          backgroundHold: false,
        },
      ],
      hotspots: [
        {
          id: "gr_sheriff2_files",
          label: "Ellery's file box on the step",
          bounds: { x: 40, y: 62, w: 26, h: 20 },
          cursor: "take",
          isRepeatable: false,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "it_map" },
        },
        {
          id: "gr_sheriff2_ledger",
          label: "The quarantine ledger page",
          bounds: { x: 72, y: 40, w: 18, h: 22 },
          cursor: "look",
          isRepeatable: false,
          action: {
            type: "giveItem",
            itemGranted: "it_ledger",
          },
        },
      ],
      choices: [
        {
          id: "gr_sheriff2_ridge",
          text: "Drive up the ridge. Route 9 comes back tonight.",
          targetSceneId: "gr_ridge",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["gr_ready"], requiresAll: true },
        },
        {
          id: "gr_sheriff2_barge",
          text: "Skip the ridge recon — barge straight at the closure with badges and file.",
          targetSceneId: "gr_convoy",
          attitudeTag: "Aggressive",
          consequences: { meterChanges: [{ meter: "Suspicion", delta: 2 }] },
        },
      ],
    },

    /* ============================================================ *
     *  6 · THE RIDGE AT NIGHT — Route 9 opens
     * ============================================================ */
    {
      id: "gr_ridge",
      title: "Where the Road Comes Back",
      background: `${A}/ridge-route9.jpg`,
      prose:
        "The sedan climbs past the barricade they drove around hours ago — and now the barricade is gone. The blacktop simply continues where the map says there should be forest: new asphalt, cold, unlit, climbing into fog. Somewhere below, Renwick's lights blink out one by one, as if a hand is drawing a curtain across the town.",
      cinematic: { mode: "dolly", dollyDirection: "right", dollyDistance: 6, colorGrade: "nolan-imax", filmGrade: true, filmGradeStrength: 0.35 },
      dialogueBeats: [
        {
          id: "gr_ridge_b1",
          characterId: "c_cole",
          text: "Oakes. The town — the lights just went out all at once.",
        },
        {
          id: "gr_ridge_b2",
          characterId: "c_mara",
          text: "No. It didn't go out, Cole. It went somewhere else. Look at the road — it's not wet, it's not even cold. It's new.",
        },
        {
          id: "gr_ridge_b3",
          characterId: "c_cole",
          text: "New asphalt on a road not paved since '66. That's not possible either, and I'm running out of ways to say that.",
          background: `${A}/ridge-tower.jpg`,
          backgroundTransition: "fade",
          backgroundHold: false,
        },
        {
          id: "gr_ridge_b4",
          characterId: "c_mara",
          text: "Ellery's note. 'The tape and the road are the same lie told forward and backward.' Forward: a road that was never built. Backward: a town that was never gone. Same eleven days, Cole. We're standing on the seam.",
        },
      ],
      hotspots: [
        {
          id: "gr_ridge_center",
          label: "The centreline at the seam",
          bounds: { x: 46, y: 68, w: 14, h: 12 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Half a crisp new centreline stops dead at a line of frost — and on the far side the same line continues, faded, thirty years older. Two seasons of one road pressed edge to edge.",
          },
        },
        {
          id: "gr_ridge_voice",
          label: "A voice on the wind",
          bounds: { x: 30, y: 40, w: 20, h: 22 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Far off, thin as a station at the edge of its range, a voice is counting. Eleven. Ten. Nine. Not a voice with a body — a voice with a transmitter that isn't there.",
          },
        },
      ],
      choices: [
        {
          id: "gr_ridge_follow",
          text: "Follow the voice up the new asphalt.",
          targetSceneId: "gr_convoy",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["gr_ready"], requiresAll: true },
        },
        {
          id: "gr_ridge_call_vessey",
          text: "Call Vessey and ask him to stand the county down before anyone else goes up the road.",
          targetSceneId: "gr_convoy",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["gr_trusted"] },
        },
      ],
    },

    /* ============================================================ *
     *  7 · THE CONVOY — the federal 'contractor'
     * ============================================================ */
    {
      id: "gr_convoy",
      title: "The County Truck",
      background: `${A}/doe-convoy.jpg`,
      prose:
        "Three unmarked trucks sit nose-to-nose across the road where it opens onto the ridge, engines running against the cold, fog curling through the headlight beams. A man in a heavy coat and no insignia stands between them with a clipboard. He isn't surprised to see them. He's been expecting the bureau — just not the little annex that asks questions.",
      cinematic: { mode: "shake", shakeAmount: 0.12, colorGrade: "nolan-imax", filmGrade: true, filmGradeStrength: 0.4 },
      dialogueBeats: [
        {
          id: "gr_convoy_b1",
          characterId: "c_mara",
          text: "Route 9 is closed, and you're not county and you're not here for maintenance. Who signed the work order for a road that isn't on the map?",
          background: `${A}/convoy-pov.jpg`,
          backgroundTransition: "fade",
          backgroundHold: false,
        },
        {
          id: "gr_convoy_b2",
          characterId: "c_cole",
          text: "There's no work order in any county system for this stretch. There never has been. But there's a truck with a federal plate on a road that doesn't exist. That takes a department. Which one?",
        },
        {
          id: "gr_convoy_b3",
          characterId: "c_mara",
          text: "Thomas Ellery. You have him, don't you. He's not south. He's up the road with the town that isn't here.",
        },
        {
          id: "gr_convoy_b4",
          characterId: "c_cole",
          text: "You've been mapping the loop since '66 — watching the double, taking counts. Ellery found your road, and you took him so he couldn't put it on any map anyone could follow.",
        },
      ],
      hotspots: [
        {
          id: "gr_convoy_plate",
          label: "Federal plate on the lead truck",
          bounds: { x: 58, y: 58, w: 16, h: 14 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "A federal utility plate, faded. The registration prefix was retired and reissued twice since '66 — which means this plate predates the department it claims. It's been re-stencilled onto the same truck for thirty years.",
          },
        },
        {
          id: "gr_convoy_clipboard",
          label: "The man's clipboard",
          bounds: { x: 32, y: 50, w: 12, h: 14 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Under the sodium light you catch the column headers: not mile markers — counts. A column for 'ours,' a column for 'theirs,' and a running eleven-day difference. He is counting people.",
          },
        },
      ],
      choices: [
        {
          id: "gr_convoy_through",
          text: "Walk past him. The road isn't his to close.",
          targetSceneId: "gr_crossing",
          attitudeTag: "Clever",
          consequences: { setFlags: ["gr_opened"] },
        },
        {
          id: "gr_convoy_force",
          text: "Take the lead truck by force and open the road yourselves.",
          targetSceneId: "gr_busted",
          attitudeTag: "Aggressive",
          consequences: { meterChanges: [{ meter: "Suspicion", delta: 3 }] },
        },
        {
          id: "gr_convoy_stand_down",
          text: "Stand down. This is bigger than two agents, and it was never your road.",
          targetSceneId: "gr_silence",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ============================================================ *
     *  8 · INSIDE THE DOUBLED TOWN
     * ============================================================ */
    {
      id: "gr_crossing",
      title: "The Other Renwick",
      background: `${A}/other-renwick.jpg`,
      prose:
        "Past the trucks the fog parts like a curtain, and Oakes steps into a Renwick that isn't hers. The main street is the same and not the same — the hardware store where the diner should be, cars from three different decades parked in a row. No snow falls, though the sky is heavy with it. It is quiet in the way a held breath is quiet. The countdown is here, all around them, eleven-ten-nine — and out of the stillness a man in a surveyor's vest walks toward them with thirty-one years of patient anger on his face.",
      letterbox: true,
      cinematic: { mode: "dolly-zoom", colorGrade: "nolan-imax", filmGrade: true, filmGradeStrength: 0.4 },
      dialogueBeats: [
        {
          id: "gr_crossing_b1",
          characterId: "c_mara",
          text: "Thomas Ellery.",
        },
        {
          id: "gr_crossing_b2",
          characterId: "c_tom",
          text: "Don't you worry about me, agent. I came up the road to see it one more time, like I told my June I would. I found it. It's been wanting to go home for thirty years, and the men with the trucks keep countin' us instead of lettin' us cross.",
        },
        {
          id: "gr_crossing_b3",
          characterId: "c_cole",
          text: "Us? You're not — you wrote the letter. You're the one who's been missing. The soft voices on Walt's loop, the ones counting… they're the copy. The Renwick that gets left behind.",
        },
        {
          id: "gr_crossing_b4",
          characterId: "c_cole",
          text: "And you're one of them now. You came up the road eleven years early, and you got sorted into the copy. You've been counting down ever since, waiting for your turn to cross back.",
        },
        {
          id: "gr_crossing_b5",
          characterId: "c_tom",
          text: "Every twenty-seven years the town opens for eleven days, and we cross — the ones who belong here go home, and the quiet ones who've been waitin' get their turn to be real. The trucks don't want that. They want to study the seam, keep us counted, keep the road open on paper and closed to us forever. You two are the first who ever walked up here askin' the right question instead of the wrong one.",
        },
      ],
      hotspots: [
        {
          id: "gr_crossing_neighbour",
          label: "A quiet figure on the porch",
          bounds: { x: 20, y: 40, w: 14, h: 22 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "A neighbour of June's — or of the other June's — watches with a calm, tired patience. It raises a hand in greeting, palm out. It is not afraid. It has been waiting its whole existence for someone to come and open the door.",
          },
        },
      ],
      choices: [
        {
          id: "gr_crossing_decide",
          text: "Stand on the seam and make the call.",
          targetSceneId: "gr_decision",
          attitudeTag: "Clever",
        },
      ],
    },

    /* ============================================================ *
     *  9 · THE DECISION
     * ============================================================ */
    {
      id: "gr_decision",
      title: "The Door",
      background: `${A}/other-renwick.jpg`,
      prose:
        "Eleven. Ten. Nine. The count is down to hours, and two men with a clipboard are the only ones who know how to open the seam on schedule instead of letting it tear. Cole holds Ellery's maps. Oakes holds Walt's recording. Somewhere behind them the trucks are waiting to seal the road and write the whole night off as flu. The choice is theirs — the only one that has ever been on the table.",
      letterbox: true,
      cinematic: { mode: "static" },
      dialogueBeats: [
        {
          id: "gr_decision_b1",
          characterId: "c_mara",
          text: "We know what this is now. The question was never what's behind the quarantine. It's what we do, standing on the seam with the count at nine.",
          background: `${A}/crossing-door.jpg`,
          backgroundTransition: "fade",
          backgroundHold: false,
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "gr_dec_open",
          text: "Open the road on schedule, so every quiet one gets its turn to cross home — then tell the world.",
          targetSceneId: "gr_win_gold",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["gr_ready"], requiresAll: true },
          consequences: { setFlags: ["gr_opened"] },
        },
        {
          id: "gr_dec_seal",
          text: "Seal Route 9 for good — no one gets the Loop, not the trucks and not the road.",
          targetSceneId: "gr_win_silver",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["gr_ready"], requiresAll: true },
          consequences: { setFlags: ["gr_sealed"] },
        },
        {
          id: "gr_dec_force",
          text: "Go through the trucks and tear the road open by main strength.",
          targetSceneId: "gr_busted",
          attitudeTag: "Aggressive",
          consequences: { meterChanges: [{ meter: "Suspicion", delta: 4 }] },
        },
      ],
    },

    /* ============================================================ *
     *  ENDINGS
     * ============================================================ */
    {
      id: "gr_win_gold",
      title: "The Quiet Crossing",
      isEnding: true,
      background: `${A}/route9-dawn.jpg`,
      prose:
        "At dawn the road is open and the town below is whole. There is no quarantine this year, no maintenance closure, no clipboard at the seam. The countdown ended at zero, and the crossing went the way it was always meant to — on schedule, in daylight, with two agents and a very old surveyor standing on the frost line to wave the quiet ones home. Ellery shakes Oakes's hand and walks south to a farmhouse where a woman has kept his coffee warm for eleven years. The trucks are gone. The file, for once, tells the truth.",
      cinematic: { mode: "static", colorGrade: "nolan-imax", filmGrade: true, filmGradeStrength: 0.25 },
      dialogueBeats: [
        {
          id: "gr_win_gold_b1",
          characterId: "c_cole",
          text: "I still can't file this. There's no mechanism. But I can file that we were here, and that we were the first ones who didn't count them.",
        },
        {
          id: "gr_win_gold_b2",
          characterId: "c_mara",
          text: "That's the whole file, Cole. We open the road, and the road goes home. Some mysteries are just doors.",
        },
      ],
      endingData: {
        tier: "victory-gold",
        headline: "THE QUIET CROSSING",
        recap:
          "You opened Route 9 on schedule and every copy walked home to be real. Renwick keeps its eleven days — but now they're a homecoming, not a secret.",
      },
    },
    {
      id: "gr_win_silver",
      title: "Under Glass",
      isEnding: true,
      background: `${A}/sheriff-office.jpg`,
      prose:
        "They seal Route 9 with their own hands — not for the trucks, but against them. Oakes logs the coordinates, Cole buries the maps in an annex file with a classification no one will dare open for a generation, and together they tell the programme the road is no longer on any map — including theirs. The quiet ones stay quiet. The loop stays closed. Renwick wakes from its eleven days with no memory and no visitors, and somewhere a clipboard goes looking for a road that has been filed away where even the men with the trucks can't count.",
      dialogueBeats: [
        {
          id: "gr_win_silver_b1",
          characterId: "c_mara",
          text: "We couldn't save the road. Maybe nobody could. But we could take it away from the people who were counting it like livestock.",
        },
        {
          id: "gr_win_silver_b2",
          characterId: "c_cole",
          text: "Every twenty-seven years, then, it just… stays shut. A door we chose not to open.",
        },
        {
          id: "gr_win_silver_b3",
          characterId: "c_mara",
          text: "A door we chose who gets to open. That's the whole difference, Cole. It was never a county road. It was a threshold — and now nobody owns the key. Not even us.",
          background: `${A}/archive-room.jpg`,
          backgroundTransition: "fade",
          backgroundHold: false,
        },
      ],
      endingData: {
        tier: "victory-silver",
        headline: "UNDER GLASS",
        recap:
          "You sealed Route 9 and took the Loop off every map, theirs included. The quiet ones wait, the trucks can't count them — and you sleep at night.",
      },
    },
    {
      id: "gr_busted",
      title: "The County Truck",
      isEnding: true,
      background: `${A}/ridge-route9.jpg`,
      prose:
        "It ends the way it always ends for the ones who ask the wrong question. The road closes, the fog comes down, and by the time anyone looks there are no federal agents in Renwick at all — just a town that slept through a bad flu, a sheriff with a brand-new coat, and a file, already stamped and sealed, saying the anomalous cases annex never sent anyone up Route 9.",
      cinematic: { mode: "shake", shakeAmount: 0.1, colorGrade: "nolan-imax" },
      dialogueBeats: [
        {
          id: "gr_busted_b1",
          characterId: "narrator",
          text: "Route 9 is closed for maintenance. It has always been closed for maintenance. Some roads are not a place you investigate. Some roads are a place that investigates you.",
        },
      ],
      endingData: {
        tier: "gameover",
        headline: "RELIEVED OF DUTY",
        recap:
          "The heat got too high, or the road was taken by force. Either way, two agents left Renwick the way Ellery did — on no manifest, and no one the wiser.",
      },
    },
    {
      id: "gr_silence",
      title: "The File Goes Cold",
      isEnding: true,
      background: `${A}/sheriff-office.jpg`,
      prose:
        "They get back in the sedan and drive south with the heater on, and neither of them speaks until the town is a smear of light behind the trees. Oakes writes the report by hand in a motel at two in the morning — open barricade, courteous sheriff, no bodies, no case, recommend closure. She seals the envelope before Cole can ask what she left out of it. Some files are kept warm by never being opened. The quiet ones will still be counting, eleven days every twenty-seven years, and nobody on either side of the road will know they were ever offered a door.",
      dialogueBeats: [
        {
          id: "gr_silence_b1",
          characterId: "c_cole",
          text: "You're not really filing that.",
          background: `${A}/renwick-dusk.jpg`,
          backgroundTransition: "fade",
          backgroundHold: false,
        },
        {
          id: "gr_silence_b2",
          characterId: "c_mara",
          text: "I'm filing what lets us sleep, Cole. The road keeps its secret. So do we.",
        },
      ],
      endingData: {
        tier: "gameover",
        headline: "THE FILE GOES COLD",
        recap:
          "You walked away and sealed the file. No one is silenced, no one is saved, and Route 9 keeps its eleven days. Some doors stay closed because you closed them.",
      },
    },
  ],
};
