import type { Story } from "../types";

/**
 * DEMO 3 — "THE BRANCHING REEL LAB"
 * ─────────────────────────────────
 * A seven-scene teaching case for STRUCTURE & CONSEQUENCES. Each scene's 📝
 * note explains how it was built, step by step, in Studio.
 *
 * Teaches:
 *   · Choices with CONSEQUENCES — meters (attitude tags), trust, flags, items
 *   · GATING — locked choices (requires item / flag / meter) with hints
 *   · The quick-time prompt — quickTime, countdown, heartbeat, shaky cam,
 *     and the distinct "you hesitated" timeout branch
 *   · exclusiveGroup — mutually exclusive options that resolve together
 *   · Part breaks — the mid-case route chart ("end of part" field)
 *   · Acts — title cards + scoped route maps (membership is graph-derived)
 *   · Ending tiers + the win/lose Case File (🗂 Win/Lose tab)
 *   · Heat — the briefing heatLimit and automatic bust routing
 */
export const DEMO_STRUCTURE: Story = {
  id: "demo-branching-reel-lab",
  title: "Demo Lab: Branching Reel",
  tagline: "A teaching reel on choices, gates, timers, acts and endings.",
  coverImage: "gradient:linear-gradient(160deg,#1a0f16 0%,#220d1a 55%,#07070c 100%)",
  startSceneId: "br_brief",
  layout: {
    br_brief: { x: 0, y: 220 },
    br_chase: { x: 380, y: 220 },
    br_roof: { x: 760, y: 60 },
    br_lost_him: { x: 760, y: 400 },
    br_interrogate: { x: 1140, y: 60 },
    br_gold: { x: 1520, y: 60 },
    br_bust: { x: 1520, y: 420 },
  },
  acts: [
    {
      id: "br_act_pursuit",
      label: "Act One",
      title: "The Man With The Satchel",
      tagline: "A chase across the rain-soaked block.",
      startSceneId: "br_brief",
      titleCardImage: "/img/bg-alley.jpg",
      titleCardSeconds: 3,
    },
    {
      id: "br_act_roof",
      label: "Act Two",
      title: "Twelve Seconds On The Roof",
      tagline: "Everything the first act earned comes due.",
      startSceneId: "br_roof",
      titleCardImage: "/img/bg-saltflats.jpg",
      titleCardSeconds: 3,
    },
  ],
  briefing: {
    objective: "Run the collar down — and survive the twelve seconds on the roof.",
    winConditions: [
      "Win the rooftop quick-time (gold ending).",
    ],
    loseConditions: [
      "Hesitate when the clock is running and then let him walk (game over).",
      "Let Suspicion reach 6 — the heat pops and the case busts.",
    ],
    heatLimit: 6,
    heatFailSceneId: "br_bust",
  },
  flagNotes: {
    br_took_shortcut: "You cut through the back alley (aggressive).",
    br_stayed_crowd: "You stayed with the crowd (smooth).",
    br_hesitated_roof: "You froze on the rooftop — he saw you decide.",
  },
  characters: [
    {
      id: "br_marlowe",
      name: "Delia Marlowe",
      role: "Your partner on the chase",
      avatarUrl: "emoji:🕵️‍♀️",
      trustMeter: 0,
      voice: { pitch: 1.05, rate: 1.05 },
    },
    {
      id: "br_runner",
      name: "The Runner",
      role: "The man with the satchel",
      avatarUrl: "emoji:🧥",
      trustMeter: 0,
      voice: { pitch: 0.8, rate: 0.95 },
    },
  ],
  items: [
    {
      id: "br_badge",
      name: "Your Badge",
      icon: "🛡️",
      description: "The tin. Flashing it is loud, fast, and raises the temperature of the whole block.",
      flavorText: "It opens doors. It also lights up the street.",
      isClue: false,
    },
  ],
  scenes: [
    /* ── SCENE 1 — briefing + exclusive choices ────────────────────── */
    {
      id: "br_brief",
      title: "The Briefing on the Sidewalk",
      note:
        "STEP 1 — CHOICES WITH WEIGHT. ① Choices tab: add choices. Each choice gets an ATTITUDE TAG (Charm/Press/Deduce) that colours the button and nudges its meter. " +
        "② Consequences: the first two choices below set a FLAG (+Suspicion or +Clever) and share one EXCLUSIVE GROUP ('approach') — picking one resolves the whole group, so you can't take both. " +
        "③ The third choice is GATED + HIDDEN: Requires item = badge, and it doesn't even render until you pick the badge up from the hotspot on the car roof (the take hotspot at the bottom-left). With 'hidden' OFF you instead get the 🔒 disabled button with its built-in hint — try both. Gating also accepts flags and meter thresholds, and can combine them. " +
        "④ The 🗂 Win/Lose tab is where you write the briefing you're reading now, including the heatLimit that makes Suspicion 6 a bust.",
      background: "/img/bg-nd-street.jpg",
      ambientAudio: "tension",
      particles: "rain",
      prose:
        "Rain on 5th. A man with a stolen satchel is three storefronts ahead and moving fast. Delia Marlowe materialises at your elbow. 'He's got maybe forty seconds before he hits the roof access. How do you want to play it?'",
      dialogueBeats: [
        {
          id: "br_brief_m1",
          characterId: "br_marlowe",
          expression: "urgent",
          text: "Pick your approach. The shortcut is fast and ugly — the crowd is slow and clean. And don't flash tin unless you mean it.",
        },
      ],
      hotspots: [
        {
          id: "br_hs_badge",
          label: "Your badge, on the car roof where you set it down",
          bounds: { x: 6, y: 62, w: 15, h: 18 },
          cursor: "take",
          isRepeatable: false,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "br_badge" },
        },
      ],
      choices: [
        {
          id: "br_go_shortcut",
          text: "Cut through the back alley — vault the fence. (Press, +1 Suspicion)",
          targetSceneId: "br_chase",
          attitudeTag: "Aggressive",
          exclusiveGroup: "approach",
          consequences: { setFlags: ["br_took_shortcut"], meterChanges: [{ meter: "Suspicion", delta: 1 }] },
        },
        {
          id: "br_go_crowd",
          text: "Stay with the crowd, read his shoulders. (Deduce, +1 Clever)",
          targetSceneId: "br_chase",
          attitudeTag: "Clever",
          exclusiveGroup: "approach",
          consequences: { setFlags: ["br_stayed_crowd"], meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
        {
          id: "br_go_badge",
          text: "🔒 Flash the badge and clear the sidewalk. (gated on the badge — see the hotspot on the car)",
          targetSceneId: "br_chase",
          attitudeTag: "Aggressive",
          hidden: true,
          gating: { requiresItems: ["br_badge"] },
          consequences: { meterChanges: [{ meter: "Suspicion", delta: 2 }] },
        },
      ],
    },

    /* ── SCENE 2 — part break + gated follow-up ────────────────────── */
    {
      id: "br_chase",
      title: "The Chase",
      note:
        "STEP 2 — PART BREAKS & FLAGS THAT PAY OFF. ① The Scene tab field 'End-of-part route chart' = 'Part 1 — The Foot Chase'. When the player LEAVES this scene, the game shows the route chart for everything played so far — the road taken and the roads not taken. " +
        "② Both choices arrive here, but the dialogue beats differ: Delia's line is GATED on the flag your approach set (requiresFlags), so her reaction matches what you did. This is flags-as-memory. " +
        "③ Auto-consequences: smooth route gives +1 trust; loud route gives +1 more Suspicion. By now Suspicion can be 2 of 6 — keep pushing and the heatLimit in the briefing sends you to the bust scene.",
      background: "/img/bg-corridor.jpg",
      ambientAudio: "tension",
      particles: "rain",
      partBreak: "Part 1 — The Foot Chase",
      transition: "fade",
      prose:
        "The corridor spat you out one block over. The fire escape clangs overhead — he's going up. Rain hammers the skylights.",
      dialogueBeats: [
        {
          id: "br_chase_short",
          characterId: "br_marlowe",
          expression: "winded but grinning",
          conditionRule: { requiresFlags: ["br_took_shortcut"] },
          text: "Vault the fence?! Half the block saw that. We're loud now — but we're HERE. After you.",
        },
        {
          id: "br_chase_crowd",
          characterId: "br_marlowe",
          expression: "approving",
          conditionRule: { requiresFlags: ["br_stayed_crowd"] },
          text: "Nice. Nobody on the street even knows we're chasing him. Clean feet. Roof's ours.",
        },
        {
          id: "br_chase_up",
          characterId: "narrator",
          text: "The act changes up there: the chart you'll see in a moment is scoped to the next act automatically — act membership is derived from the graph, so you only nominate where Act Two STARTS (the roof scene, in the 🎭 Acts tab).",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "br_chase_roof",
          text: "Take the fire escape to the roof.",
          targetSceneId: "br_roof",
          attitudeTag: "Neutral",
          consequences: { trustChanges: [{ characterId: "br_marlowe", delta: 1 }] },
        },
      ],
    },

    /* ── SCENE 3 — QTE + timeout branch (Act Two start) ────────────── */
    {
      id: "br_roof",
      title: "Twelve Seconds on the Roof",
      note:
        "STEP 3 — THE QUICK-TIME PROMPT. ① Choices tab: tick 'Quick-time' on the first choice. ② timeLimitSeconds 10 → the big banner (qtePrompt), the countdown ring and the ⏱ readout appear. ③ qteHeartbeat + qteShakyCam: under ~30% left the heartbeat stings and the cinematic swaps to SHAKY CAM. " +
        "④ If the clock EXPIRES it does NOT silently vanish — timedOutTargetSceneId routes to a distinct 'you hesitated' beat, and timedOutConsequences apply (+2 Suspicion here, sets br_hesitated_roof). " +
        "⑤ rememberLine gives the '…will remember that' impact card. ⑥ This scene is also the ACT TWO start (🎭 Acts tab) — the act title card plays on arrival.",
      background: "/img/bg-saltflats.jpg",
      ambientAudio: "tension",
      transition: "fade-black",
      cinematic: { mode: "shake", shakeAmount: 0.25, shakeDuration: 0.6, dimAmount: 0.85 },
      prose:
        "The roof is a sheet of black rain. The runner is ten feet from the parapet, satchel swinging. Beyond it: a four-storey drop to the next building's awning. He's going to jump. You have one breath to decide.",
      dialogueBeats: [
        {
          id: "br_roof_m1",
          characterId: "br_marlowe",
          expression: "shouting over rain",
          text: "TEN SECONDS AND HE'S AIRBORNE — MOVE!",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "br_roof_tackle",
          text: "Tackle him at the parapet!",
          quickTime: true,
          qtePrompt: "STOP HIM!",
          timeLimitSeconds: 10,
          qteHeartbeat: true,
          qteShakyCam: true,
          rememberLine: "The runner will remember that.",
          targetSceneId: "br_interrogate",
          attitudeTag: "Aggressive",
          timedOutTargetSceneId: "br_lost_him",
          timedOutConsequences: {
            setFlags: ["br_hesitated_roof"],
            meterChanges: [{ meter: "Suspicion", delta: 2 }],
          },
        },
        {
          id: "br_roof_warn",
          text: "Warn him the gap is wider than it looks — stall him. (Charm)",
          targetSceneId: "br_interrogate",
          attitudeTag: "Sultry",
          consequences: { trustChanges: [{ characterId: "br_runner", delta: 2 }] },
        },
      ],
    },

    /* ── SCENE 4 — hesitate branch ─────────────────────────────────── */
    {
      id: "br_lost_him",
      title: "The Gap Between the Buildings",
      note:
        "STEP 4 — THE HESITATION BEAT. Quick-time timeouts route HERE, not to a game-over: a distinct scene with its own consequences applied. It still offers two exits, so the player who froze isn't dead — the story just KNOWS they froze (br_hesitated_flag + Suspicion). The second choice here deliberately pushes Suspicion past 6 to demo the automatic heat bust: briefing heatLimit 6 → heatFailSceneId.",
      background: "/img/bg-vault.jpg",
      ambientAudio: "drone",
      transition: "fade",
      prose:
        "You decided too late. His boot leaves the parapet, the satchel clears the gap, and he's gone across the next roof before your hand closes on empty rain. Somewhere behind you, a siren answers the shouts from the street.",
      dialogueBeats: [
        {
          id: "br_lost_m1",
          characterId: "br_marlowe",
          expression: "stony",
          text: "You HESITATED. I watched you do it. He's gone, the block's awake, and we're standing on a roof with a building full of witnesses. We can still salvage this — quietly.",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "br_lost_salvage",
          text: "Salvage it — get downstairs and work the witnesses. (Deduce)",
          targetSceneId: "br_interrogate",
          attitudeTag: "Clever",
        },
        {
          id: "br_lost_loud",
          text: "Kick the door down and shake the building yourself. (Press, +2 Suspicion)",
          targetSceneId: "br_bust",
          attitudeTag: "Aggressive",
          consequences: { meterChanges: [{ meter: "Suspicion", delta: 4 }] },
        },
      ],
    },

    /* ── SCENE 5 — interrogation / resolution gate ─────────────────── */
    {
      id: "br_interrogate",
      title: "After the Chase",
      note:
        "STEP 5 — CONVERGENCE & CONDITIONAL CONTENT. Every surviving route lands here. The dialogue beats are gated on your flags: came smooth (trust), came loud (flag), or froze (hesitation flag). Each player sees their own version. " +
        "The ENDING this routes to reads the same state — gold if you stopped him before the jump (the QTE win or the stall), silver-style beats aside. The gate on the final choice shows requiresFlags + minMeters combined: a gate can demand a flag AND a Clever threshold at the same time.",
      background: "/img/bg-backroom-casino.jpg",
      ambientAudio: "jazz",
      transition: "fade",
      prose:
        "Back on solid ground. The satchel is on the table between you — whether it got there by tackle, by stall, or by the witnesses who saw where it fell. The Runner sits wet and glaring under a bare bulb.",
      dialogueBeats: [
        {
          id: "br_int_qte_win",
          characterId: "br_runner",
          expression: "winded",
          conditionRule: { requiresFlags: ["br_stayed_crowd"] },
          text: "You were on me the whole block. Never even broke stride. I respect the feet.",
        },
        {
          id: "br_int_loud",
          characterId: "br_runner",
          expression: "snarling",
          conditionRule: { requiresFlags: ["br_took_shortcut"] },
          text: "Vaulting fences in the RAIN? Subtle. Half the neighbourhood knows your face now.",
        },
        {
          id: "br_int_hesit",
          characterId: "br_runner",
          expression: "smug",
          conditionRule: { requiresFlags: ["br_hesitated_roof"] },
          text: "I saw you freeze up there. Whole two seconds where you didn't exist. That gap was MINE.",
        },
        {
          id: "br_int_partner",
          characterId: "br_marlowe",
          expression: "wrap-up",
          text: "Book him, tag the satchel, file it. The chart at the end shows every second of that chase — the road we ran and the roads we didn't. That's the gig.",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "br_int_close",
          text: "Close the case — satchel in evidence. (gold)",
          targetSceneId: "br_gold",
          attitudeTag: "Neutral",
          isRepeatable: false,
        },
      ],
    },

    /* ── ENDING: gold ──────────────────────────────────────────────── */
    {
      id: "br_gold",
      title: "Case Closed — Collar",
      isEnding: true,
      note:
        "ENDINGS: 🏁 End scene → endingData tier victory-gold with headline + recap. Ending tiers drive the newsstand stars: victory-gold, victory-silver, gameover. Your 📝 notes never show in play — they live on the Studio canvas node card only.",
      background: "/img/bg-end-gold.jpg",
      ambientAudio: "jazz",
      letterbox: true,
      prose:
        "The satchel clicks into evidence. Somewhere the rain finally lets up. The act chart lays the whole chase out in lines and knots — every choice you made, lit up, next to the ones you didn't.",
      dialogueBeats: [],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "victory-gold",
        headline: "THE ROOFTOP COLLAR",
        recap:
          "You learned the structure kit: consequence choices, an exclusive group, a gated option with its hint, a quick-time prompt with a heartbeat, shaky cam and a real hesitation branch, a part-break chart, an act title card, and heat that can bust the whole case.",
      },
    },

    /* ── ENDING: heat bust ─────────────────────────────────────────── */
    {
      id: "br_bust",
      title: "Case Closed — The Heat Pops",
      isEnding: true,
      note:
        "HEAT BUST: the 🗂 Win/Lose tab's heatLimit (6) + heatFailSceneId routes here the INSTANT Suspicion hits the cap — even mid-scene. The shortcut (1), the hesitation (2) and the door-kick (4) stack to 6+. Also wired as the direct fail for the loud roof choice. gameover tier.",
      background: "/img/bg-endgame.jpg",
      ambientAudio: "drone",
      transition: "fade-black",
      prose:
        "The sirens don't stop at the kerb — they come UP. Four uniforms on the roof, radios screaming, and every eye on the two detectives who turned a quiet tail into a three-alarm rooftop mess. Internal Affairs is already on the way up.",
      dialogueBeats: [
        {
          id: "br_bust_m1",
          characterId: "br_marlowe",
          expression: "furious",
          text: "Six heat. You maxed the meter. The case doesn't belong to us anymore — it belongs to the uniforms. That's the bust. Replay, and keep your powder dry.",
        },
      ],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "gameover",
        headline: "TOO HOT",
        recap:
          "Suspicion hit the limit and the case busted open. The heatLimit in the Win/Lose briefing is a hard cap — every loud choice pushes toward it, and the bust fires the moment it lands.",
      },
    },
  ],
};
