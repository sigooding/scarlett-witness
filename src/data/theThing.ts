import type { Story } from "../types";

/**
 * THE THING FROM SECTOR 7
 * A 1951-inspired Arctic horror case using every engine feature:
 *  - 18 scenes across four acts
 *  - All 5 mini-games (lockpick, safeDial, cipher, memoryMatch, shootout)
 *  - Crafting (sample + accelerant = fire weapon)
 *  - Corkboard deduction (who is already assimilated)
 *  - Dossier with perk thresholds that matter
 *  - Exclusive choice groups
 *  - Heat / Suspicion auto-bust
 *  - Particle effects (smoke/rain)
 *  - Character voice overrides
 *  - Per-beat conditional dialogue
 *  - 6 distinct endings (A–F)
 */
export const THE_THING: Story = {
  id: "the-thing",
  title: "The Thing from Sector 7",
  tagline: "One of the crew is no longer human. Everyone is a suspect. Nothing can be trusted.",
  coverImage: "gradient:linear-gradient(160deg,#0a1628 0%,#0d2840 40%,#071420 70%,#030810 100%)",
  startSceneId: "t_camp",
  layout: {
    t_camp: { x: 0, y: 300 },
    t_lab: { x: 420, y: 300 },
    t_generator: { x: 840, y: 300 },
    t_supply: { x: 840, y: 560 },
    t_greenhouse: { x: 1260, y: 300 },
    t_morgue: { x: 420, y: 560 },
    t_radio: { x: 1260, y: 560 },
    t_hangar: { x: 1680, y: 300 },
    t_blood_test: { x: 2100, y: 300 },
    t_confront: { x: 2100, y: 560 },
    t_escape: { x: 2100, y: 820 },
    t_end_fire: { x: 2520, y: 60 },
    t_end_survive: { x: 2520, y: 280 },
    t_end_frozen: { x: 2520, y: 500 },
    t_end_assimilated: { x: 2520, y: 720 },
    t_end_betrayal: { x: 2520, y: 940 },
    t_end_sacrifice: { x: 2520, y: 1160 },
  },
  briefing: {
    objective:
      "You are Dr. Grace Halliday, Arctic Station Omega's science officer. Something buried in the ice has thawed. Three crew members are dead. Determine who among the survivors has been replaced — before it reaches the rescue helicopter.",
    winConditions: [
      "Gather blood or tissue samples from suspected crew and run the blood test.",
      "Connect clues to suspects on the corkboard to confirm who has been assimilated.",
      "Use fire (the flamethrower or incendiary charge) on a confirmed Thing before it escapes.",
      "Signal the helicopter or escape the station with at least one genuine human.",
    ],
    loseConditions: [
      "Let Suspicion reach 7 — the crew turns on you and votes you out into the blizzard.",
      "Fail the blood test without enough evidence — a Thing escapes in disguise.",
      "Use the flamethrower on the wrong person — you are court-martialled and left behind.",
    ],
    heatLimit: 7,
    heatFailSceneId: "t_end_frozen",
  },
  deduction: {
    suspectIds: ["koval", "morrow", "briggs"],
    connections: [
      {
        a: "blood_sample",
        b: "koval",
        flagSet: "koval_infected",
        revelation:
          "Dr. Koval's blood sample reacts violently to heat — the cells move independently. He has been replaced.",
      },
      {
        a: "tissue_chart",
        b: "morrow",
        flagSet: "morrow_clean",
        revelation:
          "Sergeant Morrow's tissue chart matches base-normal human biology. He is still himself — a rare fact worth protecting.",
      },
      {
        a: "radio_log",
        b: "briggs",
        flagSet: "briggs_saboteur",
        revelation:
          "The radio log shows Briggs transmitting on a frequency that doesn't exist in the station manifest. She was calling something that was listening.",
      },
    ],
  },
  characters: [
    {
      id: "halliday",
      name: "Dr. Grace Halliday",
      role: "Science Officer (Player)",
      avatarUrl: "emoji:👩‍🔬",
      trustMeter: 0,
      voice: { pitch: 1.05, rate: 0.9 },
    },
    {
      id: "koval",
      name: "Dr. Anton Koval",
      role: "Station Commander / Primary Suspect",
      avatarUrl: "emoji:👨‍✈️",
      trustMeter: 0,
      voice: { pitch: 0.65, rate: 0.88 },
    },
    {
      id: "morrow",
      name: "Sgt. Ray Morrow",
      role: "Security Officer (Clean)",
      avatarUrl: "emoji:💂",
      trustMeter: 0,
      voice: { pitch: 0.72, rate: 0.92 },
    },
    {
      id: "briggs",
      name: "Dr. Petra Briggs",
      role: "Communications Officer / Accomplice",
      avatarUrl: "emoji:📡",
      trustMeter: 0,
      voice: { pitch: 1.18, rate: 0.95 },
    },
  ],
  items: [
    {
      id: "ice_core",
      name: "Ice Core Sample",
      icon: "🧊",
      description:
        "A cylindrical core of ancient Arctic ice, taken from the excavation site. Something is visible inside, dark and motionless.",
      flavorText: "It was frozen for 100,000 years. Now it's warm.",
      isClue: true,
    },
    {
      id: "blood_sample",
      name: "Blood Vial — Koval",
      icon: "🩸",
      description:
        "A sealed vial of Dr. Koval's blood, taken while he was unconscious. The label reads 'AK-3'. The blood is darker than it should be.",
      flavorText: "It moved when the lid was sealed. Slightly. Impossibly.",
      isClue: true,
    },
    {
      id: "tissue_chart",
      name: "Morrow Tissue Chart",
      icon: "📋",
      description:
        "Morrow's full tissue analysis from last month's mandatory physical. All values normal — baseline human.",
      flavorText: "There's still one person here we can trust.",
      isClue: true,
    },
    {
      id: "radio_log",
      name: "Encrypted Radio Log",
      icon: "📻",
      description:
        "A decoded transmission log showing outgoing signals on an unregistered frequency. Briggs's access code is embedded in the header.",
      flavorText: "She was calling something. It was calling back.",
      isClue: true,
    },
    {
      id: "incendiary",
      name: "Incendiary Charge",
      icon: "💣",
      description:
        "A military-grade thermite charge from the emergency kit. Burns at 2500°C. One use.",
      flavorText: "Fire is the only thing it cannot assimilate.",
    },
    {
      id: "flamethrower",
      name: "Station Flamethrower",
      icon: "🔥",
      description:
        "A pressurized fuel flamethrower from the equipment bay, fully charged. Heavy, conspicuous, decisive.",
      flavorText: "There is no negotiating with something that wears your face.",
    },
    {
      id: "serum",
      name: "Anomaly Serum",
      icon: "🧪",
      description:
        "A distilled compound made from the ice core sample and station antiseptic. Reacts violently to non-human cell biology.",
      flavorText: "Ten minutes from concept to field test. The most terrifying ten minutes of her career.",
      isClue: true,
      combinableWith: { targetItemId: "incendiary", resultItemId: "fire_charge" },
    },
    {
      id: "fire_charge",
      name: "Serum Fire Charge",
      icon: "☢️",
      description:
        "The incendiary charge coated in the anomaly serum — an improvised weapon designed to defeat the Thing's ability to survive fire by attacking it at the cellular level.",
      flavorText: "Science and desperation, combined.",
    },
    {
      id: "keycard",
      name: "Commander's Keycard",
      icon: "🔑",
      description: "Dr. Koval's access keycard — grants entry to the station's restricted hangar bay.",
      flavorText: "He dropped it. He didn't notice. He no longer needed it.",
    },
    {
      id: "specimen_jar",
      name: "Specimen Jar",
      icon: "🫙",
      description:
        "A sealed specimen jar from the greenhouse containing a small amount of the organism's tissue, preserved in formaldehyde.",
      flavorText: "It twitches against the glass even through the preservative.",
      isClue: true,
    },
  ],
  scenes: [
    /* ==================  ACT I — DISCOVERY  ================== */
    {
      id: "t_camp",
      title: "Act I · Base Camp — The First Night",
      background: "gradient:linear-gradient(160deg,#0a1628 0%,#0d2840 40%,#07141e 100%)",
      ambientAudio: "rain",
      particles: "rain",
      prose:
        "Station Omega's base camp sits at the edge of the world. The blizzard outside sounds like screaming. Three crew members are dead — Dr. Park, Engineer Santos, and Technician Walsh. Whatever killed them is still here. You are Dr. Grace Halliday. This is day fourteen. You have not slept.",
      dialogueBeats: [
        {
          id: "tc_b1",
          characterId: "koval",
          text: "Halliday. The heating unit in Lab Three failed. Everyone is in the common room. I suggest you stay there as well — it is not safe to be alone.",
          expression: "measured calm",
        },
        {
          id: "tc_b2",
          characterId: "morrow",
          text: "Doc — don't go near Koval alone. I'm not saying it's him. I'm saying I don't know what it is yet. But whatever killed Park, it wasn't the cold.",
          expression: "low, urgent",
        },
        {
          id: "tc_b3",
          characterId: "briggs",
          text: "I've been trying to raise McMurdo on the radio. Static. Complete static. Six hours now. Something is blocking the signal from inside the station.",
          expression: "controlled fear",
          conditionRule: { minMeters: { Clever: 1 } },
        },
      ],
      hotspots: [
        {
          id: "tc_hs_crate",
          label: "Emergency Equipment Crate",
          bounds: { x: 6, y: 68, w: 18, h: 20 },
          cursor: "use",
          action: { type: "giveItem", itemGranted: "incendiary" },
          showItemImage: true,
        },
        {
          id: "tc_hs_log",
          label: "Dead crew member's journal",
          bounds: { x: 72, y: 62, w: 16, h: 16 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text:
              "Walsh's last entry reads: 'Koval was in the greenhouse alone for four hours. No one was watching him. No one was watching any of us. I heard something in the walls that wasn't pipes.'",
          },
        },
        {
          id: "tc_hs_window",
          label: "Frosted porthole window",
          bounds: { x: 42, y: 8, w: 20, h: 28 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text:
              "Through six inches of frost, you can see the glow of the excavation site lights — still on, still humming, impossible to reach in this wind. Something disturbed the snow in a wide arc around Trench 7.",
          },
        },
      ],
      choices: [
        {
          id: "t_camp_c1",
          text: "Go to Lab Three and begin your own investigation.",
          targetSceneId: "t_lab",
          attitudeTag: "Clever",
          consequences: { meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
        {
          id: "t_camp_c2",
          text: "Head to the generator room — if the power goes, everyone dies.",
          targetSceneId: "t_generator",
          attitudeTag: "Aggressive",
          consequences: { meterChanges: [{ meter: "Aggressive", delta: 1 }] },
        },
        {
          id: "t_camp_c3",
          text: "Tell Morrow your suspicions about Koval directly.",
          targetSceneId: "t_morgue",
          attitudeTag: "Sultry",
          consequences: {
            meterChanges: [{ meter: "Sultry", delta: 1 }],
            trustChanges: [{ characterId: "morrow", delta: 2 }],
          },
        },
      ],
    },
    {
      id: "t_lab",
      title: "Act I · Lab Three — Specimens",
      background: "gradient:linear-gradient(180deg,#041208 0%,#0a1e0f 45%,#071a0d 100%)",
      ambientAudio: "drone",
      particles: "smoke",
      prose:
        "Lab Three smells of antiseptic and something deeper beneath it — organic, wrong, like meat left too close to an electrical fire. The specimen freezer door is ajar. Inside the temperature log, a six-hour gap. Someone was here.",
      hotspots: [
        {
          id: "tl_freezer",
          label: "Specimen Freezer — temperature gap",
          bounds: { x: 60, y: 18, w: 22, h: 42 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text:
              "The temperature log shows a flatline from 03:00 to 09:00. Whoever opened this door disabled the alarm first. The log requires a station commander keycard to edit.",
            flagSet: "saw_freezer_gap",
          },
        },
        {
          id: "tl_ice_core",
          label: "Ice Core Sample — trench excavation",
          bounds: { x: 14, y: 30, w: 20, h: 32 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "ice_core" },
        },
                {
          id: "tl_antiseptic",
          label: "Rack of Station Antiseptic",
          bounds: { x: 76, y: 62, w: 18, h: 26 },
          cursor: "take",
          gating: { requiresItems: ["ice_core"] },
          action: { type: "giveItem", itemGranted: "serum", flagSet: "made_serum" },
          customFailMessage: "You need a biological sample to synthesize a reaction compound.",
        },
        {
          id: "tl_blood",
          label: "Sealed vial labelled 'AK-3' on the bench",
          bounds: { x: 40, y: 56, w: 20, h: 28 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "blood_sample" },
        },
      ],
      choices: [
        {
          id: "tl_c1",
          text: "Take the ice core to the greenhouse for comparison with the excavation specimens.",
          targetSceneId: "t_greenhouse",
          attitudeTag: "Clever",
          gating: { requiresItems: ["ice_core"] },
          consequences: { meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
        {
          id: "tl_c2",
          text: "Go to the morgue — the three bodies will tell you more than the specimens will.",
          targetSceneId: "t_morgue",
          attitudeTag: "Neutral",
        },
        {
          id: "tl_c3",
          text: "Go back to base camp — you need to speak to Morrow.",
          targetSceneId: "t_camp",
          attitudeTag: "Neutral",
        },
      ],
    },
    {
      id: "t_generator",
      title: "Act I · Generator Room — Sabotage",
      background: "gradient:linear-gradient(180deg,#1a0800 0%,#2a1200 50%,#0f0600 100%)",
      ambientAudio: "tension",
      particles: "smoke",
      prose:
        "The diesel generators roar. The room smells of fuel and hot metal. Three of the six generators are offline — manually shut down in a sequence that required a safety override key. The switch panel is scratched. Something tried the switches before knowing which order.",
      hotspots: [
                {
          id: "tg_panel_nokey",
          label: "Sabotaged generator panel",
          bounds: { x: 18, y: 30, w: 30, h: 30 },
          cursor: "look",
          isRepeatable: true,
          gating: { excludesFlags: ["saw_freezer_gap"] },
          action: {
            type: "showText",
            text:
              "The panel is locked. There's a restart code stamped on the back cover — but someone peeled the label. Walsh kept all the emergency codes.",
          },
        },
        {
          id: "tg_restore",
          label: "Enter Walsh's restart code and bring the generators back online",
          bounds: { x: 18, y: 30, w: 30, h: 30 },
          cursor: "use",
          gating: { requiresFlags: ["found_generator_code"] },
          action: { type: "setFlag", flagSet: "generators_restored" },
          customFailMessage: "You need the restart code — Walsh kept all the emergency codes.",
        },
        {
          id: "tg_flamethrower",
          label: "Equipment bay — field flamethrower",
          bounds: { x: 68, y: 52, w: 22, h: 36 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "flamethrower" },
        },
        {
          id: "tg_fuel_leak",
          label: "Fuel line — irregular pressure",
          bounds: { x: 44, y: 70, w: 18, h: 20 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text:
              "The fuel line feeding Generator 4 has been partially severed — not by a tool. The cut is irregular, biological. Something bit through it.",
          },
        },
      ],
      choices: [
        {
          id: "tg_c1",
          text: "Head to the supply room — something useful has to be in there.",
          targetSceneId: "t_supply",
          attitudeTag: "Neutral",
        },
        {
          id: "tg_c2",
          text: "Go back to the lab — the specimen freezer gap is still unexplained.",
          targetSceneId: "t_lab",
          attitudeTag: "Clever",
        },
      ],
    },
    {
      id: "t_morgue",
      title: "Act I · Station Morgue — The Bodies",
      background: "gradient:linear-gradient(160deg,#080810 0%,#0c0c18 60%,#04040a 100%)",
      ambientAudio: "tension",
      prose:
        "The three bodies are covered in thermal sheets. Park's sheet has slipped. The expression on his face is wrong — not fear, but something stranger. Recognition. As if what killed him was something he knew.",
      dialogueBeats: [
        {
          id: "tm_b1",
          characterId: "morrow",
          text: "I've been coming in here every night. Looking for something to tell me which one of the others it is. I can't find it. I don't know what I'm supposed to find.",
          expression: "hollow exhaustion",
        },
        {
          id: "tm_b2",
          characterId: "morrow",
          text: "Koval says it can only spread through direct physical contact. But Koval is the only one with unrestricted access to all three rooms where the bodies were found.",
          expression: "quiet accusation",
          conditionRule: { minTrust: { morrow: 1 } },
        },
      ],
      hotspots: [
                {
          id: "tmg_body",
          label: "Walsh's personal effects",
          bounds: { x: 62, y: 56, w: 22, h: 30 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text:
              "Walsh's pocket: a folded piece of paper. The restart code for the generator panel — 4-7-2, written in ink that has run from sweat. He was frightened. He was right to be.",
            flagSet: "found_generator_code",
          },
        },
      ],
      choices: [
        {
          id: "tmg_c1",
          text: "Go to the generator room — you have the restart code now.",
          targetSceneId: "t_generator",
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["found_generator_code"] },
        },
        {
          id: "tmg_c2",
          text: "Head to the greenhouse — Koval spent four hours there.",
          targetSceneId: "t_greenhouse",
          attitudeTag: "Clever",
          consequences: { meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
        {
          id: "tmg_c3",
          text: "Go to the radio room — Briggs's signal needs to be investigated.",
          targetSceneId: "t_radio",
          attitudeTag: "Neutral",
        },
      ],
    },
    /* ==================  ACT II — ISOLATION  ================== */
    {
      id: "t_supply",
      title: "Act II · Supply Room — Locked Manifest",
      background: "gradient:linear-gradient(160deg,#0c080a 0%,#180c10 50%,#0a0608 100%)",
      ambientAudio: "drone",
      prose:
        "The supply room has been ransacked. Not by a person searching — by something clearing a path. The floor lockers are torn open. But the overhead cabinet is still padlocked. Whatever was here couldn't figure out the lock.",
      hotspots: [
                {
          id: "ts_wreckage",
          label: "Torn-open floor lockers",
          bounds: { x: 8, y: 66, w: 40, h: 26 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text:
              "The tears in the metal are too wide and too deep for a human hand. The edges are curved inward — as if something pulled from inside and outside simultaneously.",
          },
        },
        {
          id: "ts_cabinet",
          label: "Padlocked overhead cabinet",
          bounds: { x: 60, y: 16, w: 26, h: 30 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "keycard" },
        },
      ],
      choices: [
        {
          id: "ts_c1",
          text: "Take the keycard and go to the hangar bay.",
          targetSceneId: "t_hangar",
          attitudeTag: "Neutral",
          gating: { requiresItems: ["keycard"] },
        },
        {
          id: "ts_c2",
          text: "Head back to base camp and report the damage.",
          targetSceneId: "t_camp",
          attitudeTag: "Neutral",
        },
        {
          id: "ts_c3",
          text: "Go to the greenhouse — it is the one place no one seems to want to discuss.",
          targetSceneId: "t_greenhouse",
          attitudeTag: "Clever",
        },
      ],
    },
    {
      id: "t_greenhouse",
      title: "Act II · Greenhouse — The Organism",
      background: "gradient:linear-gradient(160deg,#041a08 0%,#0a2e0f 40%,#061208 100%)",
      ambientAudio: "drone",
      particles: "smoke",
      prose:
        "The greenhouse is too warm. The UV lamps are all running. And something has grown between the experiment trays — translucent tendril-like structures, not there three days ago, not in any biology textbook. They pull slightly toward heat sources. Including you.",
      dialogueBeats: [
        {
          id: "tgh_b1",
          characterId: "briggs",
          text: "Koval told me to stay out of here. He said the specimen was degrading. But this — this has been growing. How long has he been lying to us?",
          expression: "frightened",
          conditionRule: { minMeters: { Clever: 2 } },
        },
      ],
      hotspots: [
        {
          id: "tgh_specimen",
          label: "Specimen jar — organism tendril",
          bounds: { x: 36, y: 30, w: 20, h: 28 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "specimen_jar" },
        },
        {
          id: "tgh_growth",
          label: "Unknown growth between trays",
          bounds: { x: 8, y: 58, w: 30, h: 28 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text:
              "The growth contains cells arranged in a pattern unlike any known organism. They mimic surrounding plant cells precisely — but produce no chlorophyll, no oxygen, no waste. They only consume.",
          },
        },
        {
          id: "tgh_log",
          label: "Koval's greenhouse access log",
          bounds: { x: 70, y: 22, w: 22, h: 18 },
          cursor: "look",
          action: {
            type: "showText",
            text:
              "Four hours. Alone. No radio check-in. The log shows he requested the UV lamps be set to 98°F — well above standard — two days before any of the crew died.",
            flagSet: "saw_greenhouse_log",
          },
        },
      ],
      choices: [
        {
          id: "tgh_c1",
          text: "Go to the radio room — you suspect Briggs's signal is connected to this.",
          targetSceneId: "t_radio",
          attitudeTag: "Clever",
          consequences: { meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
        {
          id: "tgh_c2",
          text: "Go to the hangar — the helicopter is your only exit if this gets worse.",
          targetSceneId: "t_hangar",
          attitudeTag: "Aggressive",
          gating: { requiresItems: ["keycard"] },
        },
        {
          id: "tgh_c3",
          text: "Return to the lab — the serum can be completed now.",
          targetSceneId: "t_lab",
          attitudeTag: "Neutral",
          gating: { requiresItems: ["specimen_jar"] },
        },
      ],
    },
    /* ==================  ACT II — THE RADIO  ================== */
    {
      id: "t_radio",
      title: "Act II · Radio Room — The Transmission",
      background: "gradient:linear-gradient(160deg,#0a0a1a 0%,#0c0c22 50%,#060610 100%)",
      ambientAudio: "tension",
      prose:
        "Briggs is here, headphones around her neck, face pale. The radio is tuned to a frequency not in the station register. And it is receiving — a low repeating pulse, like a heartbeat in static, from somewhere beneath the ice.",
      dialogueBeats: [
        {
          id: "tr_b1",
          characterId: "briggs",
          text: "I didn't start the transmission. I picked it up. It had been broadcasting for eleven days — before any of us died. I just didn't understand what it was saying until now.",
          expression: "desperate honesty",
        },
        {
          id: "tr_b2",
          characterId: "briggs",
          text: "The signal pattern is biological. It's a homing signal. And something inside this station is answering it.",
          expression: "horrified certainty",
          conditionRule: { minMeters: { Clever: 2 } },
        },
        {
          id: "tr_b3",
          characterId: "koval",
          text: "Briggs is lying. I caught her transmitting last night — she is trying to lead something here. Do not believe a word she says.",
          expression: "cold authority",
          conditionRule: { requiresFlags: ["koval_infected"] },
        },
      ],
      hotspots: [
        {
          id: "trr_log",
          label: "Transmission log — Briggs's access header",
          bounds: { x: 24, y: 42, w: 22, h: 20 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "radio_log" },
        },
              ],
      choices: [
        {
          id: "trr_c1",
          text: "Trust Briggs. She knows something Koval doesn't want you to know.",
          targetSceneId: "t_blood_test",
          attitudeTag: "Sultry",
          gating: { requiresItems: ["radio_log", "blood_sample"], requiresAll: false },
          consequences: {
            meterChanges: [{ meter: "Sultry", delta: 1 }],
            trustChanges: [{ characterId: "briggs", delta: 2 }],
            setFlags: ["trusted_briggs"],
          },
        },
        {
          id: "trr_c2",
          text: "You have enough evidence. Go to the hangar and run the blood test.",
          targetSceneId: "t_blood_test",
          attitudeTag: "Clever",
          gating: { requiresItems: ["blood_sample"] },
          consequences: { meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
        {
          id: "trr_c3",
          text: "Confront Briggs directly — her access code is in the log.",
          targetSceneId: "t_confront",
          attitudeTag: "Aggressive",
          gating: { requiresItems: ["radio_log"] },
          consequences: { meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }] },
        },
      ],
    },
    /* ==================  ACT III — CONFRONTATION  ================== */
    {
      id: "t_hangar",
      title: "Act III · Hangar Bay — The Helicopter",
      background: "gradient:linear-gradient(160deg,#0e1018 0%,#161a24 45%,#090c14 100%)",
      ambientAudio: "rain",
      particles: "rain",
      prose:
        "The helicopter is here — intact, fuelled, ready. The hangar is locked from the inside, which means someone with a keycard came in and did not leave. The tracks in the ice-dust lead to the helicopter, then stop. They don't lead back out.",
      hotspots: [
        {
          id: "thg_chopper",
          label: "Helicopter interior — check the cabin",
          bounds: { x: 22, y: 28, w: 44, h: 42 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text:
              "The radio has been ripped out of the helicopter dashboard. Professionally. Whoever did it knew exactly which wire to cut — and took the microphone with them. No one is calling for rescue.",
            flagSet: "chopper_sabotaged",
          },
        },
        {
          id: "thg_drain",
          label: "Drainage grate beneath the helicopter",
          bounds: { x: 36, y: 70, w: 22, h: 18 },
          cursor: "look",
          action: {
            type: "showText",
            text:
              "Something has been beneath the grate. The bolt pattern is stretched outward. The grate could have been removed from below — by something with more than human reach.",
            flagSet: "found_hangar_grate",
          },
        },
      ],
      choices: [
        {
          id: "thg_c1",
          text: "Go to the blood-testing station — you can determine who is still human.",
          targetSceneId: "t_blood_test",
          attitudeTag: "Clever",
          gating: { requiresItems: ["blood_sample"] },
          consequences: { meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
        {
          id: "thg_c2",
          text: "Confront all three crew members at once in the common room.",
          targetSceneId: "t_confront",
          attitudeTag: "Aggressive",
          gating: { requiresFlags: ["koval_infected", "briggs_saboteur"], requiresAll: false },
          consequences: { meterChanges: [{ meter: "Aggressive", delta: 1 }] },
        },
        {
          id: "thg_c3",
          text: "Disable the helicopter yourself — nothing gets out if you wreck the fuel cell.",
          targetSceneId: "t_hangar",
          attitudeTag: "Neutral",
          gating: { excludesFlags: ["helicopter_disabled"] },
          consequences: {
            setFlags: ["helicopter_disabled"],
            meterChanges: [{ meter: "Clever", delta: 1 }],
          },
        },
      ],
    },
    {
      id: "t_blood_test",
      title: "Act III · Blood Test — Who Is Human",
      background: "gradient:linear-gradient(180deg,#041208 0%,#081a0e 50%,#030a05 100%)",
      ambientAudio: "tension",
      prose:
        "The lab centrifuge is running. You have Koval's blood vial. The protocol is simple: expose blood to controlled heat. Human blood clots. The Thing's blood tries to escape. But even if the test works — you will need to hold everyone still while you run it. And one of them knows exactly what you are doing.",
      dialogueBeats: [
        {
          id: "tbt_b1",
          characterId: "morrow",
          text: "Run it. Whatever it shows — I'll back your play. Even if the test says it's Koval and he comes at both of us.",
          expression: "steady",
          conditionRule: { minTrust: { morrow: 1 } },
        },
        {
          id: "tbt_b2",
          characterId: "koval",
          text: "There is no scientific basis for this test, Halliday. You are panicking and calling it methodology. Stand down.",
          expression: "authoritative menace",
          conditionRule: { requiresFlags: ["koval_infected"] },
        },
      ],
      hotspots: [
                {
          id: "tbt_serum_craft",
          label: "Lab synthesis station — combine serum with incendiary",
          bounds: { x: 66, y: 52, w: 24, h: 28 },
          cursor: "use",
          gating: { requiresItems: ["serum", "incendiary"] },
          action: { type: "showText", text: "Drag the serum onto the incendiary charge in your satchel to craft the fire charge." },
          isRepeatable: true,
        },
        {
          id: "tbt_run",
          label: "Run the blood test on Koval's vial",
          bounds: { x: 14, y: 50, w: 22, h: 30 },
          cursor: "use",
          gating: { requiresItems: ["blood_sample"] },
          action: { type: "setFlag", flagSet: "blood_test_complete" },
          customFailMessage: "You need a blood sample to run the test.",
        },
      ],
      choices: [
        {
          id: "tbt_c1",
          text: "The test confirms it — take the evidence to the confrontation now.",
          targetSceneId: "t_confront",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["blood_test_complete"] },
          consequences: { meterChanges: [{ meter: "Clever", delta: 2 }] },
        },
        {
          id: "tbt_c2",
          text: "Go to the corkboard — connect your findings before the confrontation.",
          targetSceneId: "t_blood_test",
          attitudeTag: "Neutral",
          consequences: { setFlags: [] },
        },
      ],
    },
    {
      id: "t_confront",
      title: "Act III · The Confrontation",
      background: "gradient:linear-gradient(160deg,#0a0308 0%,#140610 50%,#060105 100%)",
      ambientAudio: "tension",
      prose:
        "All three of them are in the room. The lights flicker. You lay out everything you know. Koval's expression doesn't change — and that is the most frightening thing in the room. Morrow's hand moves toward his sidearm. Briggs backs toward the wall. Something is about to give.",
      dialogueBeats: [
        {
          id: "tc_b1",
          characterId: "koval",
          text: "You think it's me. That is a predictable conclusion for someone who doesn't understand what they're looking at.",
          expression: "inhuman calm",
        },
        {
          id: "tc_b2",
          characterId: "morrow",
          text: "He hasn't blinked in six minutes, doc. I've been counting.",
          expression: "terrified restraint",
          conditionRule: { requiresFlags: ["morrow_clean"] },
        },
        {
          id: "tc_b3",
          characterId: "briggs",
          text: "If it's Koval — and the board confirms it — we have to do it now. In five minutes this place will be in full dark. And it will do what it does in the dark.",
          expression: "urgent",
          conditionRule: { requiresFlags: ["briggs_saboteur"] },
        },
      ],
      hotspots: [
        {
          id: "tcf_board",
          label: "Open the corkboard — connect the evidence",
          bounds: { x: 40, y: 20, w: 20, h: 18 },
          cursor: "use",
          isRepeatable: true,
          action: { type: "openBoard" },
        },
      ],
      choices: [
        {
          id: "tcf_fire",
          text: "Use the flamethrower on Koval — the board confirmed him.",
          targetSceneId: "t_end_fire",
          attitudeTag: "Aggressive",
          gating: {
            requiresItems: ["flamethrower"],
            requiresFlags: ["koval_infected"],
          },
          consequences: { meterChanges: [{ meter: "Aggressive", delta: 2 }] },
        },
        {
          id: "tcf_charge",
          text: "Deploy the serum fire charge — precision strike on Koval alone.",
          targetSceneId: "t_end_fire",
          attitudeTag: "Clever",
          gating: {
            requiresItems: ["fire_charge"],
            requiresFlags: ["koval_infected"],
          },
          consequences: { meterChanges: [{ meter: "Clever", delta: 2 }] },
        },
        {
          id: "tcf_escape",
          text: "Signal for extraction and run — let McMurdo's team deal with it.",
          targetSceneId: "t_escape",
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["generators_restored"] },
        },
        {
          id: "tcf_wrong",
          text: "It's Briggs — you're certain of it. Use the flamethrower on her.",
          targetSceneId: "t_end_betrayal",
          attitudeTag: "Aggressive",
          gating: { requiresItems: ["flamethrower"] },
          consequences: { meterChanges: [{ meter: "Aggressive", delta: 1 }] },
        },
      ],
    },
    {
      id: "t_escape",
      title: "Act III · The Escape Run",
      background: "gradient:linear-gradient(160deg,#0a1628 0%,#0d2840 40%,#07141e 100%)",
      ambientAudio: "rain",
      particles: "rain",
      prose:
        "You've triggered the external beacon. Rescue is 40 minutes out. Koval moves between you and the door. He is faster than he should be. The corridor is dark. Morrow is behind you, breathing hard. This ends here.",
      hotspots: [
              ],
      choices: [
        {
          id: "tesc_sacrifice",
          text: "Lock Morrow inside and trigger the emergency purge alone — saving him, ending it.",
          targetSceneId: "t_end_sacrifice",
          attitudeTag: "Sultry",
          gating: { requiresFlags: ["morrow_clean"] },
          consequences: { meterChanges: [{ meter: "Sultry", delta: 2 }] },
        },
      ],
    },
    /* ==================  ACT IV — ENDINGS  ================== */
    {
      id: "t_end_fire",
      title: "Ending A — The Last Warm Thing",
      background: "gradient:linear-gradient(160deg,#3a0800 0%,#5a1000 50%,#200400 100%)",
      ambientAudio: "tension",
      prose:
        "The corridor fills with fire. What was Koval makes a sound that no human vocal cord has ever produced — a frequency that vibrates in the chest wall and the back teeth. Then it is quiet. Morrow's hand is on your shoulder. The generator hums. The blizzard hammers the roof. You are both still standing.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "STATION OMEGA INCIDENT DECLARED CONTAINED — DR. HALLIDAY CREDITED",
        recap:
          "You identified Koval through the blood test, connected every piece of evidence on the corkboard, and eliminated the organism before it could reach the helicopter. Gold verdict: the only clean ending.",
      },
    },
    {
      id: "t_end_survive",
      title: "Ending B — Managed Retreat",
      background: "gradient:linear-gradient(160deg,#0a1628 0%,#0d2840 40%,#07141e 100%)",
      ambientAudio: "rain",
      prose:
        "The helicopter lifts off. Below, Station Omega burns — you triggered the emergency purge before boarding. McMurdo will send another team in spring. Whatever was down there will stay frozen. For now.",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "OMEGA STATION EVACUATED — FACILITY INTENTIONALLY DESTROYED",
        recap:
          "You escaped without a confirmed kill, but burned the station on exit. The organism is likely still alive under the ice. Silver — a survival, not a victory.",
      },
    },
    {
      id: "t_end_frozen",
      title: "Ending C — Lost in the White",
      background: "gradient:linear-gradient(160deg,#0a1628 0%,#c8d8e8 80%,#e0eaf2 100%)",
      ambientAudio: "rain",
      particles: "rain",
      prose:
        "The crew voted in the dark. Three against one. You are left at the door with a flashlight that lasts two hours and a blizzard that will last three days. The light fails at 03:14. The temperature is forty below. Station Omega will not receive another inspection for six months.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "DR. HALLIDAY DECLARED MISSING — SEARCH SUSPENDED DUE TO CONDITIONS",
        recap:
          "Suspicion peaked and the crew turned against you. You needed to reduce Suspicion and present clear evidence before confronting anyone.",
      },
    },
    {
      id: "t_end_assimilated",
      title: "Ending D — What It Wears Now",
      background: "gradient:linear-gradient(160deg,#080810 0%,#0c0c18 60%,#04040a 100%)",
      ambientAudio: "tension",
      prose:
        "It reaches you in the corridor. The last thing you see is your own face looking back at you — the thing has already been practicing. The helicopter lifts off at 04:40. Two passengers. Neither of them human.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "OMEGA STATION SILENT — RESCUE TEAM REPORTS 'ALL CLEAR'",
        recap:
          "The shootout failed and you ran out of ammunition. You needed either more evidence on the corkboard or a stronger weapon before the escape run.",
      },
    },
    {
      id: "t_end_betrayal",
      title: "Ending E — The Wrong Answer",
      background: "gradient:linear-gradient(160deg,#1a0800 0%,#2a1200 50%,#0f0600 100%)",
      ambientAudio: "tension",
      prose:
        "Briggs was human. The fire confirms what the board should have told you — Briggs was clean. Koval watches from the doorway, unhurried, as the evidence disappears. He helps you radio McMurdo. He tells them it was an accident. He is very convincing.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "ACCIDENT AT OMEGA — CREW MEMBER DECEASED, INVESTIGATION ONGOING",
        recap:
          "You used fire on an innocent crew member. Always complete the corkboard before using any weapon — guessing costs lives.",
      },
    },
    {
      id: "t_end_sacrifice",
      title: "Ending F — One Warm Match",
      background: "gradient:linear-gradient(160deg,#3a0800 0%,#5a1000 50%,#200400 100%)",
      ambientAudio: "tension",
      prose:
        "You lock Morrow in the storage unit and trigger the station purge from the main board. The corridor fills. You don't run. Morrow's voice through the panel is the last human sound you hear. Six months later, McMurdo retrieves one survivor and one destroyed station. The report says it was a gas fire. Morrow knows different. He doesn't tell anyone.",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "STATION OMEGA — ONE SURVIVOR, DR. HALLIDAY CONFIRMED DECEASED",
        recap:
          "A sacrifice victory. You destroyed the organism and saved Morrow, but gave your life to do it. The silver ending with the most weight.",
      },
    },
  ],
};
