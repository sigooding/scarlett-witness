import { useEffect, useMemo, useRef, useState } from "react";

type ManualTone = "gold" | "cyan" | "neon" | "crimson";

type ManualBlock =
  | { kind: "prose"; text: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "steps"; items: { label: string; text: string }[] }
  | { kind: "callout"; label: string; text: string; tone?: ManualTone }
  | { kind: "table"; headers: string[]; rows: string[][] };

type ManualArticle = {
  id: string;
  number: string;
  kicker: string;
  title: string;
  summary: string;
  keywords: string[];
  blocks: ManualBlock[];
};

const MANUAL_ARTICLES: ManualArticle[] = [
  {
    id: "start",
    number: "01",
    kicker: "Orientation",
    title: "The first reel",
    summary: "A fast, reliable route from an empty case file to a playable, publishable story.",
    keywords: ["quick start", "workflow", "draft", "published", "autosave", "newsstand"],
    blocks: [
      {
        kind: "callout",
        label: "The Studio pipeline",
        text: "Build a case → Studio autosaves the draft (about 0.8 seconds after changes) → Validate it → Play draft → Publish → Export a .reel.json backup. Large exports show a TRUNCATED preview so the UI stays responsive: Download / Copy contain the full file. Never import the preview. Masks, ESPER enhancements, VK eyes and sprite sheets travel with the portable bundle; test a reimport with original asset URLs unavailable.",
        tone: "cyan",
      },
      {
        kind: "steps",
        items: [
          { label: "Case File", text: "Write the objective, win and lose conditions, and—if the case uses pressure—set a heat limit and bust scene." },
          { label: "People", text: "Add the cast. Set each person's display details, voice, trust defaults, and whether a met character should appear on the corkboard." },
          { label: "Items", text: "Add props and clues. Mark clues for the deduction board and make sure every item used by a gate can be granted during a run." },
          { label: "Scenes", text: "Create the spine: a start scene, readable scenes with beats, choices or hotspots, and at least one ending. Wire exits on the canvas." },
          { label: "Test and ship", text: "Use the Test tab to fake state, run Play draft from the start and from important scenes, repair hard errors, then Publish." },
        ],
      },
      {
        kind: "table",
        headers: ["Tab", "Use it when you need to…"],
        rows: [
          ["Scene · Beats · Hotspots · Choices", "Build the selected scene's picture, script and interaction."],
          ["Stage · Audio", "Tune walkable movement, scene sound, narration and voice."],
          ["Game Objective · Characters · Items · Flags", "Define the case contract, cast, inventory and durable story facts."],
          ["Acts · Episodes · Map", "Organise the route, chapters and flag-gated travel locations."],
          ["In-Game Theme · Newsstand Theme", "Style the player's case and the outer catalogue page."],
          ["Media Tools · AI Images", "Manage portable assets and create optional image material."],
          ["Test", "Fake state, inspect reachability and run coverage checks."],
        ],
      },
      {
        kind: "prose",
        text: "When a case opens, Scarlet Reel prefers the published copy, then the live Studio draft, then the built-in story. That is useful during development, but it means publishing is a deliberate hand-off: a draft can be perfectly playable in Studio without being the version players see on the newsstand.",
      },
      {
        kind: "list",
        items: [
          "Start small: one scene, one decision, one consequence and two endings are enough to prove the loop.",
          "Use the note field on scene cards for production reminders. Notes stay in Studio and are never rendered in the game.",
          "Keep a backup before a large repair or media pass. Export is cheap; reconstructing a branched case is not.",
        ],
      },
    ],
  },
  {
    id: "graph",
    number: "02",
    kicker: "Structure",
    title: "The story graph",
    summary: "The canvas is your shooting board: every card is a scene, every edge is a possible cut or player decision.",
    keywords: ["canvas", "graph", "node", "edge", "wire", "handle", "start", "ending", "note", "layout"],
    blocks: [
      {
        kind: "prose",
        text: "Each scene card has exit handles on its right edge. Drag a handle to another card to connect an exit. Drop on “drag to add choice” to create a new choice already aimed at the target. A choice, a hotspot, and an after-beat route can all become edges, so read the label on the edge before assuming what it does.",
      },
      {
        kind: "list",
        items: [
          "Right-click a card for Edit, Duplicate, Copy, Paste, Set as start, Mark as ending, or Delete.",
          "Right-click empty canvas to add nodes, paste, or fit the graph to view.",
          "START identifies the entry scene. END identifies a scene with no normal output. CREDITS, CUTSCENE, STAGE and NOTE badges identify special node types.",
          "A red warning badge on a card is the number of validator issues attached to that scene.",
          "Click a card to see the gold path from the start scene to it. If there is no path, the scene is not currently reachable from the case opening.",
          "The minimap colours nodes by act; endings remain gold so the shape of the whole case is legible at a glance.",
        ],
      },
      {
        kind: "callout",
        label: "A graph rule worth keeping",
        text: "Every non-ending scene needs an intentional way forward. Make the main route obvious, then add locked, optional and failure routes around it. A beautiful graph that cannot be reached is still unused content.",
        tone: "gold",
      },
      {
        kind: "prose",
        text: "Use scene Notes as a production layer: record what a card demonstrates, which flag it expects, or which prop must be granted earlier. The note is metadata only; the player never sees it. Studio also heals missing or piled canvas positions when a draft opens, so layout recovery should not erase distinct author placements.",
      },
    ],
  },
  {
    id: "scenes",
    number: "03",
    kicker: "Scene craft",
    title: "Scenes, cameras and pacing",
    summary: "Treat a scene as a playable page: picture, prose, dialogue, interaction and a controlled exit.",
    keywords: ["scene", "scene tab", "standard", "credits", "cutscene", "stage", "note", "camera", "background", "ending", "auto advance", "repeatable", "return trap", "softlock", "dead end", "stranded", "stuck"],
    blocks: [
      {
        kind: "prose",
        text: "On the Scene tab, give the scene a title, prose and an image or video plate. Then choose the node type that matches the intended experience. A standard scene keeps the normal HUD; a credits node presents centered or rolling credits without the main HUD; a cutscene is a widescreen cinematic node without the main HUD; a stage node enables walkable play; a note node is a Studio-only annotation card.",
      },
      {
        kind: "table",
        headers: ["Node type", "Use it for", "Authoring note"],
        rows: [
          ["Standard", "Investigation, dialogue and choices", "The normal scene UI and scene interactions are available."],
          ["Credits", "Opening or closing title cards", "Set title, subtitle, role/name lines, font, motion and optional montage stills."],
          ["Cutscene", "A controlled cinematic beat", "Use video or a chained sequence of still scenes; no normal HUD during the shot."],
          ["Stage", "A room the player walks through", "Configure a walkable floor, spawn, hotspots and optional wide-world exits."],
          ["Ending", "A resolved outcome", "Mark the scene as ending and fill its ending data; an ending has no required output."],
        ],
      },
      {
        kind: "list",
        items: [
          "Prose leads the reader into the moment; dialogue beats follow in order; choices and hotspots give the player agency; the graph decides where the next shot goes.",
          "A scene's on-enter consequences fire only on first entry. Use that for a reward, flag or one-time reveal without allowing a player to farm it through a loop.",
          "Auto-advance is useful for a quiet cut, but an after-beat route on the final visible beat should own the cut when the story needs to guarantee that a line is read first.",
          "If the scene is a true ending, mark it as ending rather than leaving a dead-end standard scene. Dead ends are validator problems; endings are authored outcomes.",
          "A scene the player can return to needs a way out that survives the return. If every route out is one-shot — including an after-beat cut, which the player will not see twice — Validate reports a return trap.",
        ],
      },
      {
        kind: "callout",
        label: "Return traps",
        text: "A one-time reward is the right shape for most doors, but a door the player can walk back through must still be a door. If Validate says a scene can be returned to and every way out is consumed on the first visit, mark one route out repeatable — usually the plain navigation choice or GO marker that brought the player in — so the second visit can leave. The runtime agrees: if a room ever runs out of things to do, the player is told and offered a rewind, a checkpoint or a quit rather than being left stranded.",
        tone: "gold",
      },
      {
        kind: "callout",
        label: "Insert shots",
        text: "A beat's replacement background can persist over later dialogue, or be dropped with the end-insert-shot control. For a shot that should cut directly to another scene, put an After this beat route on the last visible beat and choose Auto or Continue. The picture then cuts forward instead of flashing back to the original plate.",
        tone: "neon",
      },
    ],
  },
  {
    id: "beats",
    number: "04",
    kicker: "Dialogue",
    title: "Beats are the script",
    summary: "Build the conversation line by line, then make every line earn its place on screen.",
    keywords: ["beats", "dialogue", "speaker", "narrator", "voice", "memory", "recall", "said", "replacement background", "batch voice", "elevenlabs", "press the lie"],
    blocks: [
      {
        kind: "prose",
        text: "Beats play in order after the scene prose. Choose a character or Narrator (V.O.) as speaker, write the line, and use the up/down controls in the beat title bar to set the read order. A condition rule can make a beat appear only when its gate passes; the condition is evaluated live as the scene runs.",
      },
      {
        kind: "list",
        items: [
          "Replacement background turns a beat into an insert shot. Keep the image on later beats when the conversation continues over it; turn that option off for a one-line flash; end the insert later when the scene should return to its plate.",
          "A voice MP3 replaces text-to-speech for that line. Mark a line silent when it must have no narration at all.",
          "Memories recalled are tag-to-line substitutions. If the player remembers a tag, its replacement line is used; `{said}` can echo the player's exact remembered line or presented item name.",
          "The Press the Lie block turns a line into a contradiction the player can challenge with an inventory clue. Define the breaking evidence, caught flag, bluff response and miss limit, then give the player an exit if the claim closes.",
          "An after-beat cut belongs on the last visible beat. The validator warns when a route is attached to a line that cannot be the final line the player sees.",
        ],
      },
      {
        kind: "callout",
        label: "Batch voice safely",
        text: "On Beats, assign character voice IDs first, choose a model, review the approximate credit cost, and confirm the warning. Generate one conversation at a time. Silent beats, memory-recall lines and speakers without a voice ID are skipped; existing MP3s can be regenerated all at once or only filled where missing.",
        tone: "crimson",
      },
      {
        kind: "prose",
        text: "For Eleven v3, the Insert sound chips add performed cues such as [laughs], [coughs] or [sighs]. Those cues are intended for v3; other models may read the brackets aloud. Treat generated voices as media assets: audition them in Play draft and keep the case exportable before a large generation pass.",
      },
    ],
  },
  {
    id: "choices",
    number: "05",
    kicker: "Agency",
    title: "Choices and consequences",
    summary: "A choice is more than a button label: it is a reply, a route, a state change, or a timed risk.",
    keywords: ["choices", "choice", "reply", "hidden", "timer", "quick time", "qte", "exclusive group", "memory tag", "present item", "repeatable", "consequence", "conversation timer", "countdown", "silence", "say nothing", "hesitate", "interruptible", "interrupt", "cut in", "cut off", "wolf among us"],
    blocks: [
      {
        kind: "table",
        headers: ["Choice feature", "What the player experiences", "Good use"],
        rows: [
          ["Reply", "Answers in place and does not navigate", "A question, reaction or line that sets up a later beat."],
          ["Hidden", "Does not appear until its gate passes", "A discovery or spoiler-sensitive option."],
          ["Exclusive group", "Choosing one resolves every choice with the same group", "Mutually exclusive approaches or opening stances."],
          ["Timer", "A shrinking ring and an ⏱ readout; at zero the player says nothing and the option is gone", "A short decision window without a separate action sequence — an ordinary conversation under a clock."],
          ["Quick-time prompt", "The same clock, loud: a banner, a heartbeat sting and shaky cam, and it can route on timeout", "A deliberate action-beat pressure moment with a visible hesitation branch."],
          ["Present item", "Requires the player to hold a selected item", "Interrogation evidence or showing a prop without necessarily spending it."],
        ],
      },
      {
        kind: "list",
        items: [
          "A reply does not navigate. Pair it with a flag or memory and gate a later beat or choice on that state.",
          "A quick-time choice needs a timed-out target and can have timed-out consequences. Make the timeout route an authored beat, not a silent failure.",
          "A plain Timer is the quiet version of the same clock: no banner, no heartbeat. Letting it run out is the player saying nothing — give it timed-out consequences (a flag a later beat reacts to) or a timed-out target, or Validate will warn that the deadline costs nothing. The character noticing your silence is the payoff.",
          "Interruptible dialogue (Scene tab) surfaces the replies over the LAST line instead of after it, so the player can cut the speaker off and a timer is already running while they are still talking. Answering early is a character choice in itself. It is suppressed when that final line routes to another scene — the cut owns the exit.",
          "A memory tag records the player's exact line. A later beat can recall it, and `{said}` can place the remembered words into the new line.",
          "Presenting an item records an item memory. If “hand it over” is enabled, the item leaves the inventory; otherwise it is shown and kept. You can gate on that memory later.",
          "Keep state-changing choices one-shot unless repetition is intentional. Enable Repeatable only for safe navigation or a choice the player should be able to revisit.",
        ],
      },
      {
        kind: "callout",
        label: "Design the fallback",
        text: "Every dramatic choice needs a legible consequence and a way forward. If all visible choices are gated, hidden, timed out or exhausted, the player can soft-lock even when every individual choice is valid.",
        tone: "gold",
      },
    ],
  },
  {
    id: "gating",
    number: "06",
    kicker: "State",
    title: "Gating and consequences",
    summary: "Gates decide what is available. Consequences decide what changes after the player acts.",
    keywords: ["gating", "gate", "requires", "excludes", "all", "any", "flags", "items", "meters", "trust", "remembers", "consequences", "one shot"],
    blocks: [
      {
        kind: "table",
        headers: ["Gate clause", "Passes when…", "Common mistake"],
        rows: [
          ["Required items or flags", "The player holds or has set every required value, or any value when ALL is off", "The required item/flag is never granted in the reachable route."],
          ["Excluded items or flags", "The value is absent or unset", "A prior choice quietly makes the branch impossible."],
          ["Meter range", "The meter is within its configured minimum/maximum", "A delta pushes the meter out of the intended range."],
          ["Minimum trust", "The named character's trust reaches the threshold", "The character is never met or no choice can change their trust."],
          ["Remembers", "The memory tag exists", "The author gates on a spelling variant instead of the exact tag that was recorded."],
        ],
      },
      {
        kind: "prose",
        text: "All enabled gate clauses must pass. Required items and flags can use ALL or ANY. Exclusions must remain absent. Consequences can set or clear flags, add or remove items, move meters, and move a character's trust. Meters are clamped to 0–10; trust is clamped to −5…+5.",
      },
      {
        kind: "list",
        items: [
          "Give a gate-required item through a hotspot, a choice reward, or a recipe result before the player encounters the gate.",
          "Set a gate-required flag through a choice, hotspot, deduction/corkboard connection, or another explicitly reachable action.",
          "Use a condition on a beat for information that should appear only after a reveal; use a choice gate when the player should see a locked or hidden option.",
          "Rewards attached to a scene's first entry, a choice or a hotspot should not be repeatable unless the reward is intentionally farmable. The validator warns about risky repeats.",
        ],
      },
      {
        kind: "callout",
        label: "Debug gates in place",
        text: "Open the Test tab, choose the scene, and fake the exact inventory, flags, meters, trust and memories you want. The preview tells you which beats, choices and hotspots pass without replaying the whole case.",
        tone: "cyan",
      },
    ],
  },
  {
    id: "hotspots",
    number: "07",
    kicker: "Interaction",
    title: "Hotspots and scene actions",
    summary: "Draw interaction zones over the plate, then give each zone one clear verb and one predictable result.",
    keywords: ["hotspots", "hotspot", "zone", "click", "action", "go to scene", "give item", "set flag", "show text", "meter", "corkboard", "use item", "fail message"],
    blocks: [
      {
        kind: "prose",
        text: "On the Hotspots tab, draw a zone over the scene preview. Bounds are stored as percentages, so they scale with the image. Give the hotspot one action: go to scene, give item, set flag, show text, meter change, open corkboard, or use item. Gate the hotspot when it should be visible but locked; add a custom fail message so the player understands why.",
      },
      {
        kind: "list",
        items: [
          "goToScene and useItem need a target. giveItem and setFlag can legitimately stay in the current scene; that is how you make pickups, safes, switches and ciphers.",
          "Put the zone over the object the player will recognise, not over a tiny pixel-perfect detail. Test at the intended aspect ratio and with the stage camera if the scene is walkable.",
          "A multi-state object's Repetition in this state can inherit, repeat or be one-shot. Use a one-shot briefing, then a flag-gated repeatable review with no new reward. The LAST matching state wins: put the most specific aftermath last. showText always repeats; the validator warns about replayable rewards in explicitly repeatable states.",
          "If the action is a reward, decide whether it is one-shot. A repeatable give-item or meter-change hotspot can turn a clue or stat into an infinite farm.",
          "Open corkboard is a useful authored pause: it lets players connect deductions without forcing a separate scene transition.",
        ],
      },
      {
        kind: "callout",
        label: "Same action, different input",
        text: "A walkable stage still fires the same hotspot action. The player reaches a zone by walking instead of clicking it, so gating, item pickup, text, exits and fail messages should be tested in both interaction styles.",
        tone: "neon",
      },
    ],
  },
  {
    id: "stage",
    number: "08",
    kicker: "Walkable stages",
    title: "Build a room the player can enter",
    summary: "Stage scenes add movement and spatial discovery without changing the underlying story graph.",
    keywords: ["stage", "walkable", "walking", "wasd", "arrow keys", "spawn", "walk speed", "reach distance", "world width", "wide world", "walk off", "entry spawn", "npc", "obstacle", "verb menu", "walk-behind", "foreground", "occlude", "depth"],
    blocks: [
      {
        kind: "steps",
        items: [
          { label: "Enable Stage", text: "Choose the Stage node type or tick the walkable-stage option. The scene plate becomes a floor with a player marker." },
          { label: "Place the player", text: "Set the spawn point, sprite or emoji tag, walk speed, reach distance and near/far depth settings. Make the first destination reachable." },
          { label: "Place interactions", text: "Draw hotspots where the player should walk to objects. The same actions and gates from a click scene run when the player reaches the zone." },
          { label: "Shape the room", text: "Use the walk polygon, blocked areas, barriers and optional NPC waypoints to make movement readable. Leave a clear route from spawn to the required interaction." },
          { label: "Connect exits", text: "For a wide world, set World width and place walk-off-screen exits on the strip edge. Add entry spawns so arrivals from different scenes land in the right place." },
        ],
      },
      {
        kind: "list",
        items: [
          "Use Stage → Interaction → aim for explicit clicks only: crossing a door or object cannot activate it. Smart keeps exits deliberate but allows ordinary object walk-over; walkover opts into the old automatic policy.",
          "A clicked target owns its whole approach. Arrow/WASD input or an empty-floor click cancels it; one arrival fires once. A click inside another object is a new interaction. Authored walk-off edge exits still work.",
          "Stage → Player character → Hide player sprite is for cockpits/close-ups. Make their controls remote too; hiding the walker alone does not change approach rules.",
          "World width creates a scrolling strip several screens long. Markers, spawns, barriers and exits use the whole-world percentage, not only the current viewport.",
          "A walk-off exit shows an edge arrow. A gated exit is marked as locked and should have a readable locked line or an alternate route.",
          "Entry spawns are cyan dots that can vary by the room the player arrived from. Test every arrival route, not just the default spawn.",
          "The object-first verb menu can open on click or as a hold-to-open radial menu. Its centrepiece sprite is configured in the In-Game Theme tab.",
        ],
      },
      {
        kind: "callout",
        label: "Stage test",
        text: "Test → Walking room navigation audit checks fresh-state exits, pickups and conversations from the default spawn, using the runtime wall-slide step. Choose the hub to return to and run it; maps do not count as doors. Then Play draft from every entry and earned state, at several sizes (including an upstairs return): moving NPCs, scripts, timed choices and HUD overlap still need real input tests. Concave floor polygons route around their own bends even without rectangular obstacles. One working exit does not prove the progression exit works. Keep a repeatable, ungated back route — never gate the exit behind the clue needed to finish.",
        tone: "crimson",
      },
    ],
  },
  {
    id: "npcs",
    number: "09",
    kicker: "Walkable stages",
    title: "People on stage: NPCs, patrols & set motion",
    summary: "Stage actors idle, walk a patrol, own a conversation marker, and talk as a LucasArts topic list.",
    keywords: ["npc", "ambient", "patrol", "waypoint", "walk", "idle", "set motion", "facing", "talk hotspot", "topic", "askable", "conversation", "character", "actor", "pingpong"],
    blocks: [
      {
        kind: "prose",
        text: "A stage scene's **NPCs** are the room's actors: they stand or patrol the floor, play a sprite sheet (or a static cutout), and can own a 🗣 conversation marker so the character IS the hotspot. Ambient NPCs with no link are pure set dressing — the crowd in the street, the cook at the bar — and cost nothing but a sprite and a route.",
      },
      {
        kind: "steps",
        items: [
          { label: "Add the actor", text: "In the Stage tab's NPC list, give the actor an id, a sprite sheet (or a static image / `emoji:` fallback), its spawn x/y in world-percent, a flat scale and an initial facing." },
          { label: "Give it a route", text: "A patrol is a list of waypoints: walk to each in turn, pause `pause` seconds there, play that stop's optional SET MOTION (`anim`) and facing, and repeat per `patrolMode` — `loop` returns to stop 1, `pingpong` walks the route backwards, `once` settles at the last stop." },
          { label: "Make it interactive", text: "Point `talkHotspotId` at a 🗣 start-conversation marker in this scene. The marker's diamond hides and the actor becomes the marker: the walker chases the actor's LIVE position (re-routing while it patrols) and the conversation fires on catch. Pressing N in play walks to the nearest linked character." },
          { label: "Gate a departing actor", text: "Stage → Ambient NPCs → Gating rules controls actor visibility. Give its linked hotspot the same gate and tick Hotspots → Hide marker when its gate is locked. Normal locked doors should remain visible. Enlarged sprites scale about their feet, keeping authored x/y fixed." },
          { label: "Give it a face", text: "Set an optional conversation motion (npc.talkAnim), e.g. talk or threat. It overrides the NPC's idle/waypoint motion while its linked conversation is open, then restores idle. It is a conversation gesture, not lip-sync. Beats/topics supply the words; a separate cropped avatar avoids squeezing an entire atlas into a portrait." },
        ],
      },
      {
        kind: "table",
        headers: ["NPC field", "What it does", "Tuning note"],
        rows: [
          ["`sheet` / `image`", "`idle` at rest, `walk` while patrolling", "A named extra animation (“dance”, “hammer”) powers set motion."],
          ["`idleAnim`", "SET MOTION at rest instead of plain idle", "The barman's polish, the mechanic's hammer."],
          ["`patrol[]` waypoints", "`x,y` + `pause?` + `anim?` + `facing?` + `say?` + `scale?`", "One waypoint at the spawn = a standing actor that cycles a motion (SCUMM set-dressing, zero walking)."],
          ["`say`", "Ambient line floating over the actor's head", "A speech line, not a dialogue beat — background chatter."],
          ["waypoint `scale`", "Size multiplier on arrival, interpolated along the walk", "Routes into the distance shrink the actor; routes toward the camera grow it."],
          ["`talkHotspotId`", "Links the actor to a 🗣 marker", "Must be a start-conversation marker or the validator warns; the linked marker's rewards keep one-shot/repeatable rules."],
          ["`speed`", "Walk speed in world-%/second", "Defaults to the room's NPC pace — slower than the player on purpose."],
        ],
      },
      {
        kind: "callout",
        label: "One room, many conversations",
        text: "When a stage scene has MORE THAN ONE speaker, give each 🗣 marker its own `topics` list (LucasArts topic dialogue: pick a question, hear the answer, ask again or leave) instead of putting everyone's lines in the scene's `dialogueBeats` — a shared scene queue would make Dektora read Roy's lines. A single-speaker room can keep the plain linear beats.",
        tone: "gold",
      },
      {
        kind: "list",
        items: [
          "NPCs live in the room's floor band and take the same depth scaling as the player: higher (far) on the plate, smaller; lower (near), bigger. Keep their stops inside the band.",
          "A linked conversation marker keeps its one-shot/repeatable rules: a first-meeting that grants a reward is one-shot; a gossip line with no reward can be repeatable and its topics `repeatable: true`.",
          "If the marker is one-shot, the actor stays on stage afterwards as set dressing — the diamond is gone, the person is not.",
          "Test every arrival: walk from both sides of the room to a patrolling actor and make sure the chase route never threads it through an obstacle.",
        ],
      },
    ],
  },
  {
    id: "walk-behind",
    number: "10",
    kicker: "Walkable stages",
    title: "Walk-behind props & foreground depth",
    summary: "Solid foreground objects the player really walks behind — plus parallax, scrolling, alpha-mask and atmosphere layers for the room.",
    keywords: ["walk-behind", "occlude", "foreground", "foreground extras", "prop", "counter", "desk", "baseline", "depth", "parallax", "anchor", "mask", "scroll", "cockpit", "window", "atmosphere", "z-order"],
    blocks: [
      {
        kind: "prose",
        text: "A stage scene's **foreground extras** (the scene's cinematic block, `foregroundExtras`) are separate cutout images composited into the room. Most are dressing; one special flag turns any of them into a **walk-behind occluder** — the LucasArts trick where the counter is a real object: while the player's feet sit ABOVE the object's baseline line, the art is drawn OVER the player, so they are genuinely behind the counter instead of pasted on top of it.",
      },
      {
        kind: "table",
        headers: ["Field", "Meaning", "Tuning note"],
        rows: [
          ["`image` / `sheet`", "The cutout, or an animated sheet (flickering neon, a flag)", "Key the plate to transparent — the cutout IS the mask, no extra asset."],
          ["`x`, `y`", "Where the anchor lands, % of the VIEWPORT", "Clamped 0..100 even in wide rooms; the prop's bottom-centre by convention."],
          ["`worldX`", "Pin the prop to the WORLD instead of the screen (wide stages only)", "Without it a prop slides across the room as the player walks."],
          ["`scale`, `fit`", "Size the cutout (default `contain` hugs the art's ratio)", "Height = scale × frame height; the top edge lands at y − that."],
          ["`anchor`", "The point ON the image pinned at x/y (default “50% 100%” = feet on the floor)", "Keep the feet anchored for floor props."],
          ["`depth`", "Parallax plane 0 (far) → 1 (near)", "Only drifts when the room has parallax depth on."],
          ["`occludes`", "Make this prop a walk-behind occluder", "Off by default; a room can mix occluders and plain dressing."],
          ["`occludeBaseline`", "The invisible depth line, % of plate HEIGHT (default the prop's y)", "Walker feet above the line = BEHIND the prop; below = in front. For a floor band of 68–95, 88 splits far/near nicely."],
          ["`maskImage` / `maskFit`", "Clip this layer to another image's ALPHA — the cockpit window", "Mask the scenery with an OPAQUE-glass / TRANSPARENT-cabin image: opacity reveals, transparency hides. The fixed cabin cutout is a separate layer with transparent glass, or reuse the full cockpit with the same mask and maskInvert:true. Do not use an inverse cabin cutout as the window mask."],
          ["`scroll`", "Axis + speed, crossSpeed, repeat and loop", "Tile sizes are measured after image load and resize. Each axis moves exactly one rendered tile per period; non-tileable art still needs an art pass. loop:false runs once; repeat:false paints one tile."],
          ["`scroll.offsetX` / `offsetY`", "Start X/Y, percent of the rendered TILE", "Negative moves up/left. Zero speed and reduced motion keep the same fit, mask and starting composition. Keep the cabin fixed; test pixels inside and outside the glass."],
          ["`opacity`, `blendMode`, `rotation`, `zoom`, `motion`, `anim`", "Atmosphere: ghosts, fog, a gull crossing, a flicker", "No per-frame JS — motion/anim sample into CSS keyframes."],
        ],
      },
      {
        kind: "steps",
        items: [
          { label: "Cut the prop", text: "Key a front-view prop cutout (counter, desk, console) to transparent. Frontal orthographic reads as solid; perspective fights the flat room." },
          { label: "Place it on the floor", text: "Anchor bottom-centre at x/y, then scale until the feet sit on the floor. In a wide room, pin with `worldX` so it stays put while the camera pans." },
          { label: "Draw the depth line", text: "Set `occludeBaseline` where “behind” should start — usually near the middle of the room's floor band. The line is invisible; the players feel it." },
          { label: "Sit the actors", text: "Put an NPC's far stop at or above the baseline (it hides behind its own counter, head over the edge) and its near stop below (it steps out in front)." },
          { label: "Test both bands", text: "Walk from the far band to the near band and back: the player must disappear behind the prop and reappear in front, and markers on the near side must stay clickable." },
        ],
      },
      {
        kind: "callout",
        label: "Two different “foregrounds”",
        text: "The cinematic **Foreground Overlay** (cameras/foreground tab on standard scenes and beats) is a per-shot subject layer with keyframes and zoom. Stage **foregroundExtras** are room dressing with occlusion, parallax, scrolling and alpha masks. Same word, different features — a stage room uses the second, a cinematic beat uses the first.",
        tone: "cyan",
      },
      {
        kind: "list",
        items: [
          "The occluder flips per player position: while the walker is behind the line the prop is drawn in front of the walker; in the near band the order reverses. One prop, both depths, no extra art.",
          "Stage controls (markers, the player's sprite shadow) stay on top of everything, so a busy foreground never hides the interaction layer.",
          "After regenerating any prop plate, re-check x/y/scale: image generators shift layouts, and a prop that floated 3% reads as a hologram.",
        ],
      },
    ],
  },
  {
    id: "sprite-sheets",
    number: "11",
    kicker: "Art & animation",
    title: "Sprite sheets: animation & plate prep",
    summary: "One image, a grid of frames, named animations — how walkers, NPCs and dialogue portraits move, and how to prep the plates that feed them.",
    keywords: ["sprite sheet", "animation", "frames", "fps", "walk cycle", "plate", "magenta", "chroma", "key", "facing", "flip", "pixelated", "frame width", "make-sprite-sheet", "portrait", "talk sheet", "atlas", "islands", "flat key", "diagonal", "conversation motion"],
    blocks: [
      {
        kind: "prose",
        text: "Everything that moves on a stage — the player's walker, ambient NPCs, the dialogue-portrait figure — runs on the same **sprite sheet**: one image holding a grid of equal frames, plus named animations that pick frame lists and a frame rate. Photoreal characters look smooth because the frames are resampled, not because they are pixel art; `pixelated` only flips the scaling mode.",
      },
      {
        kind: "table",
        headers: ["Field", "Meaning"],
        rows: [
          ["`image`", "The sheet image (url or `asset:` reference)."],
          ["`frameWidth` / `frameHeight`", "The grid cell size in pixels — the keyer prints it when it builds the sheet."],
          ["`animations`", "Named clips: `{ idle: { frames: [0] }, walk: { frames: [0,1,2,3], fps: 8 } }`. `loop` defaults to true; a one-shot clip sets `loop: false`."],
          ["`pixelated`", "Nearest-neighbour (pixel art) vs smooth (photoreal) scaling."],
        ],
      },
      {
        kind: "steps",
        items: [
          { label: "Shoot on magenta", text: "Generate or paint the character on a flat PURE MAGENTA #FF00FF background: a wide plate with N side-by-side poses — 4 for a walk cycle (contact, down, passing, up), 2 for a talk pair (neutral + one gesture). Full body, no shadow, no ground line, identical costume frame to frame." },
          { label: "Key the plate", text: "Run `node scripts/make-sprite-sheet.mjs --in plates/hero-walk-plate.png --out public/assets/<case>/hero-walk.png --frames 4 --height 384`. It keys the magenta to alpha, trims, splits uniform frames and prints the frameWidth to use in the data." },
          { label: "Wire the sheet", text: "Reference the keyed sheet in the data: the player's `playerSprite`, a stage NPC's `sheet`, or a cast member's `talkingSheet`. Walkers get `idle` + `walk` at fps 8; talk portraits get `idle` + `talk` at fps 4." },
          { label: "Mind the facing", text: "Base walk/idle art faces RIGHT and mirrors for left. Stage player clips can add -up, -down, -left, -right and diagonal suffixes (-up-left, -up-right, -down-left, -down-right). Any diagonal walk clip enables eight-way selection. Explicit left art is not double-mirrored; missing angles fall back. Verify movement, rest and action clips. The eight-angle walk preview uses the runtime resolver, including inherited sheets and library references." },
        ],
      },
      {
        kind: "list",
        items: [
          "The two-sheet recipe per character: a 4-frame walk sheet for stage movement and a 2-frame talk sheet for the dialogue box portrait — the same person, two framings.",
          "Named extra animations are what powers NPC SET MOTION and waypoint `anim`: “dance”, “polish”, “hammer” — a clip the actor plays while standing still.",
          "Keep ONE costume, ONE face and consistent scale across every frame of a sheet: at 8 fps, frame-to-frame drift reads as a flicker glitch.",
          "Image generators shift layouts between takes: after regenerating any plate, re-key it and re-check every x/y, baseline and click box that was tuned to the old one.",
          "The Studio forge's Preserve pose scale / align feet option uses one common scale and bottom-aligns the detected poses. A crouch stays shorter instead of stretching to standing height; legacy per-frame normalization remains available. Reduce edge colour spill optionally neutralises key-colour rims without changing alpha or interior costume colour; preview and built sheet use the same setting.",
          "Separate sprite islands cuts disconnected silhouettes without importing a neighbouring boot/pot when their horizontal ranges overlap. Nearby detached props join the nearest body; border specks drop out. It cannot reconstruct touching/occluded people. Preview/build use the same pixels and impossible counts are refused.",
          "Flat key / retain dark props uses RGB distance on genuinely flat, unshadowed backdrops; the default chroma mode still handles shadowed backdrops. Check narrow canes and soles rather than trusting a frame count.",
          "Combine pose banks into this atlas: choose another already-keyed grid, set its columns/rows, a NEW clip name, FPS and output canvas height. Assembly preserves old clips/timing, offsets the new bank, centres/bottom-aligns frames and bounds the canvas. Keep headroom in crouch frames. Duplicate clip names are refused; failed library saves keep the old atlas. Lower the height or raise Media Tools → Library → limits.",
          "Eight-way selection does not create eight photographic views: supply real frame banks for the angles you need. Missing idle clips hold a walk frame instead of walking in place. Named poses such as duck/draw/holster work with ordinary Stage scripts; loop:false holds the last frame.",
          "Inspect every frame and portrait over light and dark backgrounds for clipped shoes, head crops, magenta edges and costume drift. Four posed frames are not full eight-direction animation. Characters → Pulp paper can default photography to a clean presentation; saved player preferences still win.",
        ],
      },
      {
        kind: "callout",
        label: "Why magenta",
        text: "Bright flat #FF00FF is easy to distinguish from many costumes, but reflected magenta light can also tint hair, cloth and props. Inspect the key and edge spill; full tolerance is not automatically safe. A clean cutout can become a mask, portrait or HUD sprite. Touching figures may require better source art.",
        tone: "neon",
      },
    ],
  },
  {
    id: "cast-items",
    number: "12",
    kicker: "Case setup",
    title: "People, items and the corkboard",
    summary: "The case file supplies the vocabulary that scenes use: who can speak, what can be held, and what can be proved.",
    keywords: ["characters", "people", "items", "clues", "inventory", "corkboard", "trust", "recipe", "combine", "deduction", "flag"],
    blocks: [
      {
        kind: "prose",
        text: "Characters provide speakers, trust values and optional corkboard suspects. Tick “Show this met character on corkboard” when a person should become a deduction-board node after the player meets them. Items are inventory objects; mark a clue with is clue when it should be available to the corkboard, and use recipes to let players combine two items into a result.",
      },
      {
        kind: "list",
        items: [
          "Give characters a voice only after you know how their lines should sound. Web Speech auditioning is useful for blocking; recorded or generated MP3s are the production take.",
          "Every recipe partner and result should be reachable. A recipe that cannot be discovered is decoration, not gameplay.",
          "An item required by a choice or hotspot must enter the player's inventory through a reachable hotspot, reward or recipe result.",
          "The corkboard can resolve connections and set the case_cracked flag when every required deduction is solved. Gate the final accusation on that flag when appropriate.",
          "Use Flags for durable story facts; use Memories when the exact remembered line or presentation matters to later dialogue.",
        ],
      },
      {
        kind: "callout",
        label: "Inventory presentation",
        text: "The Items tab also controls how inventory looks in-game: Classic keeps the chip rail, Container places items inside a pouch or case sprite, and Hidden removes the on-screen inventory. If a case depends on presenting evidence, do not hide the inventory without providing another way to access that action.",
        tone: "gold",
      },
    ],
  },
  {
    id: "audio-media",
    number: "13",
    kicker: "Sound and assets",
    title: "Audio, images and media",
    summary: "Make the picture and sound serve the cut, then make sure another machine can receive the case intact.",
    keywords: ["audio", "music", "narration", "voice", "mp3", "media", "images", "video", "upload", "asset", "library", "export", "import", "elevenlabs"],
    blocks: [
      {
        kind: "table",
        headers: ["Asset", "Where it is authored", "Check in Play draft"],
        rows: [
          ["Scene music", "Audio tab or the scene music controls", "The intended track starts, loops or hands off cleanly and follows the Sound Booth mix."],
          ["Narration", "Scene narration controls", "The line starts once, respects typewriter/instant settings and does not overlap the next scene."],
          ["Beat voice", "Beat voice MP3 or batch voice generation", "The correct speaker's take plays; silent beats remain silent."],
          ["Images and video", "Scene, beat, hotspot, credits or media pickers", "The plate, insert, foreground and video resolve at the target aspect ratio."],
          ["Custom library assets", "Media Tools and upload controls", "The asset survives a refresh and is present after an export/import round trip."],
        ],
      },
      {
        kind: "prose",
        text: "Use the Media Library pickers or upload controls rather than hand-typing a path you have not verified. Built-in media references resolve through the app; uploaded assets are stored in the case media library and can be bundled into an export. A .reel.json case export is intended to carry the custom images, voices and video required by that case.",
      },
      {
        kind: "list",
        items: [
          "Set music intentionally: choose whether a scene plays a track or inherits the previous mix, and test the hand-off at scene boundaries.",
          "Recorded narration and beat voice replace generated text-to-speech. Do not leave a line with a stale voice reference after replacing its speaker.",
          "Large ElevenLabs batches spend credits. Read the live estimate and both confirmation prompts; generate a single conversation at a time and export afterwards.",
          "Use the Media Tools tab to inspect, upload and manage case assets. If a browser cannot write to a linked voice folder, the media library remains the portable path.",
        ],
      },
      {
        kind: "callout",
        label: "Portable case rule",
        text: "Before moving a case to another machine, export it from the newsstand or Studio and import the resulting .reel.json. A plain story JSON can describe the graph without carrying the uploaded media that graph points to.",
        tone: "cyan",
      },
    ],
  },
  {
    id: "themes",
    number: "14",
    kicker: "Look and feel",
    title: "Themes, grades and the newsstand",
    summary: "Set the case's reading surface separately from its cinematic treatment and the global newsstand identity.",
    keywords: ["theme", "in-game theme", "dialogue box", "fonts", "text size", "hud", "accent", "danger", "cinematic", "color grade", "film grade", "parallax", "newsstand theme", "title", "credits"],
    blocks: [
      {
        kind: "steps",
        items: [
          { label: "In-Game Theme", text: "Choose a HUD palette or custom accent/danger colours, body and heading fonts, reading text scale, minimal HUD behaviour and the dialogue panel treatment." },
          { label: "Cinematic controls", text: "On a scene or replacement background, choose a colour grade, film grade strength, parallax depth and camera treatment. Preview the result before repeating it across scenes." },
          { label: "Credits", text: "On a credits node, set title, subtitle, role/name lines, typography, line motion, card timing, gate weave and an optional full-bleed montage." },
          { label: "Game Info", text: "In Game Objective, write a spoiler-free synopsis for the Info button on your case's Newsreel card. Explain the premise, player role, mood and style of play; keep the objective field for the concrete in-game goal." },
          { label: "Newsstand Theme", text: "Shape the outer title page: title text, tagline, background and music. This is the catalogue frame, not a replacement for the case's in-game theme." },
        ],
      },
      {
        kind: "list",
        items: [
          "The body font is for prose and dialogue; the heading font is for names, labels and HUD typography. Check long lines at the largest reading scale.",
          "Reading text size ranges from 80% to 140%. The reserved line height scales with it, but a line can still overflow if the copy is written like a paragraph instead of a beat.",
          "Color grade is a filter and split-tone wash that also affects video cutscenes; film grade adds moving grain, gate weave, halation, flicker and occasional scratches above it.",
          "Parallax depth makes plate, mid-ground and foreground planes drift at different rates. Use reduced motion expectations: the app locks the frame for users who request reduced motion.",
          "A credits montage cross-dissolves full-bleed stills behind the credits. Keep stills visually related and make sure the sequence has enough time to read every line.",
        ],
      },
      {
        kind: "callout",
        label: "Consistency pass",
        text: "Pick one reading hierarchy before you polish every scene: what is prose, what is a spoken line, what is a choice, and what is an impact card? A strong theme makes those layers distinct even when the plate is busy.",
        tone: "neon",
      },
    ],
  },
  {
    id: "meters",
    number: "15",
    kicker: "Systems",
    title: "Meters, trust and pressure",
    summary: "Use numbers to make tone and risk legible—not to hide a route the player could never understand.",
    keywords: ["meters", "charm", "intimidate", "deduce", "heat", "trust", "perks", "velvet tongue", "iron nerve", "sharp eye", "bust", "suspicion"],
    blocks: [
      {
        kind: "table",
        headers: ["System", "Range", "What it can drive"],
        rows: [
          ["Charm", "0–10", "Charm gates and the Velvet Tongue perk."],
          ["Intimidate", "0–10", "Hard-nosed choices and the Iron Nerve perk."],
          ["Deduce", "0–10", "Investigation gates and the Sharp Eye perk."],
          ["Heat", "0–10", "Pressure, trust penalties, wrong-board costs and the bust threshold."],
          ["Trust", "−5…+5 per character", "Dialogue and choice gates, reactions and relationship consequences."],
        ],
      },
      {
        kind: "list",
        items: [
          "Velvet Tongue at Charm 4+ adds one to positive trust gains.",
          "Iron Nerve at Intimidate 4+ prevents hard-nosed choices from costing Heat.",
          "Sharp Eye at Deduce 4+ makes hotspots shimmer and removes the Heat cost from wrong board guesses.",
          "At Heat 6+, trust gains are halved and wrong corkboard links cost 2 Heat.",
          "Set a heat limit and bust scene in the Case File if the case should end when pressure gets too high. Test both below and above the threshold.",
        ],
      },
      {
        kind: "callout",
        label: "Readable pressure",
        text: "If a meter can close a route, show the player why their behaviour moves it and what range matters. Hidden thresholds feel like arbitrary punishment; named perks and visible consequences make the same system feel like authorship.",
        tone: "crimson",
      },
    ],
  },
  {
    id: "endings",
    number: "16",
    kicker: "Resolution",
    title: "Endings, acts and episodes",
    summary: "An ending is authored closure, not a missing wire. Give the player a consequence they can read and remember.",
    keywords: ["ending", "endings", "victory", "game over", "gold", "silver", "headline", "epilogue", "case cracked", "acts", "episodes", "season", "part break"],
    blocks: [
      {
        kind: "steps",
        items: [
          { label: "Mark the scene", text: "On the canvas context menu or scene controls, mark the destination as an ending. It no longer needs a normal output." },
          { label: "Write the result", text: "Fill the ending data: tier, headline, epilogue or result text, and any special presentation the case needs." },
          { label: "Gate the route", text: "Use choices, hotspots, beats or the corkboard to make the outcome depend on earned state. Keep the gate attainable." },
          { label: "Play the contrast", text: "Reach the ending through a clean run, then deliberately fail or take the costly route. A game-over ending is part of the design, not an error state." },
        ],
      },
      {
        kind: "list",
        items: [
          "Aim for at least one reachable victory ending and one authored game-over ending. More endings should express meaningful decisions, not tiny wording differences.",
          "A victory ending can be gated on case_cracked after all corkboard links are solved, but only if every required deduction has a reachable source.",
          "Acts organise the story spine and the route chart. Episodes divide a season into clear chapters; give each episode a clear clearable victory path and keep scenes assigned to the intended episode.",
          "Ending scenes have no required output. A normal scene with no output is a dead end and should be repaired or deliberately converted into an ending.",
          "Play each ending from a real route, not only by faking its final flag in Test. The surrounding setup, music hand-off and final line are part of the ending too.",
        ],
      },
      {
        kind: "callout",
        label: "The final image",
        text: "The best ending answers the case's promise while leaving a residue: a headline, a last line, a changed relationship, a cost paid. Use the ending data to make that consequence visible instead of relying on a generic “you won” screen.",
        tone: "gold",
      },
    ],
  },
  {
    id: "test-publish",
    number: "17",
    kicker: "Quality control",
    title: "Validate, playtest and publish",
    summary: "Use the tools in the order they were designed: catch structure first, then experience the case as a player.",
    keywords: ["validate", "validator", "repair", "playtest", "test tab", "coverage", "play draft", "publish", "ship readiness", "error", "warning"],
    blocks: [
      {
        kind: "steps",
        items: [
          { label: "Read the validator", text: "Errors block Play and Publish; warnings are advisory. Click an issue to jump to its scene. The red badge on a card keeps the problem visible on the graph." },
          { label: "Repair carefully", text: "Repair can fix dead ends, dangling links, phantom gates, missing ending data and some farmable reward hotspots. Export first so an automatic fix is reversible." },
          { label: "Fake state", text: "In Test, set flags, inventory, meters, trust and memories to inspect one scene's available beats, choices and hotspots without replaying the whole case." },
          { label: "Play the real route", text: "Use Play draft from the start, then test important branch points and endings. Play draft uses the live Studio case, not a stale published snapshot." },
          { label: "Publish", text: "When the full run is sound, Publish the draft. The newsstand then serves that exact published copy until you publish again." },
        ],
      },
      {
        kind: "table",
        headers: ["Severity", "Meaning", "Action"],
        rows: [
          ["Error", "The case has a structural or data problem", "Fix it or use Repair, then validate again."],
          ["Warning", "The case may be valid but risky or surprising", "Decide intentionally; playtest the affected route."],
          ["Ready", "Start, ending, objective and hard-error checks pass", "Still play the case. Readiness is not a substitute for a human run."],
        ],
      },
      {
        kind: "callout",
        label: "Coverage habit",
        text: "For every choice, test the branch it opens, the branch it hides, and the state it changes. For every gate, test pass and fail. For every ending, test a route that reaches it without faking the entire case.",
        tone: "cyan",
      },
    ],
  },
  {
    id: "transfer",
    number: "18",
    kicker: "Portability",
    title: "Export, import and duplicate",
    summary: "Treat a case file like a production package: graph, state, presentation and media should travel together.",
    keywords: ["export", "import", "reel.json", "bundle", "media assets", "duplicate story", "backup", "portable", "catalog"],
    blocks: [
      {
        kind: "prose",
        text: "Export from a newsstand card or from Studio to produce a .reel.json bundle. The bundle can include the story graph plus custom images, voice lines and video. Import the bundle from the newsstand or Studio to restore the case and its media library on another browser or machine.",
      },
      {
        kind: "list",
        items: [
          "Export before Repair, large-scale renaming, voice regeneration or a theme overhaul.",
          "Use single-case export to hand off one production. Use the newsstand's catalog export when you need an archive of multiple cases.",
          "After import, open the case in Studio, run the validator and play an asset-heavy scene. A successful JSON parse does not prove every image and voice resolves.",
          "Duplicate Story creates an independent copy with fresh IDs for scenes, beats, hotspots, choices and wires. Use it to branch an experiment without editing the original case.",
          "If a browser reports that storage is full, export first, use the Studio Storage tools to reclaim stale backups, then re-import the known-good bundle.",
        ],
      },
      {
        kind: "callout",
        label: "Do not confuse these files",
        text: "A draft is the live local working copy. A published copy is what the newsstand serves. A .reel.json is a portable backup or hand-off package. Keep all three roles clear when diagnosing why a change is not visible to players.",
        tone: "gold",
      },
    ],
  },
  {
    id: "errors",
    number: "19",
    kicker: "Field repairs",
    title: "Common errors and their fixes",
    summary: "Most broken cases are reachable-state problems. Find the missing grant, target, spawn or fallback before polishing the UI.",
    keywords: ["troubleshooting", "errors", "broken", "locked", "missing", "music", "prose", "foreground", "softlock", "stuck", "unreachable", "repair"],
    blocks: [
      {
        kind: "table",
        headers: ["Symptom", "Likely cause", "Fix"],
        rows: [
          ["Play or Publish is blocked", "A validator error exists", "Open Validator, click each red issue, fix or Repair, then run it again."],
          ["A scene has no way forward", "It is a dead end without ending data", "Add an exit, or mark and configure the scene as an ending."],
          ["A choice is locked forever", "A required item/flag is never granted or ALL is too strict", "Trace the grant from the start route; inspect the gate's ALL/ANY setting and exclusions."],
          ["A beat never appears", "Its live condition is false", "Use Test to fake the expected flag, item, trust, meter or memory, then find the action that should set it."],
          ["A hotspot does nothing", "The zone, action target, gate or stage reach is wrong", "Enlarge and retest the zone; verify the action target; test both click and walk reach."],
          ["A reward can be farmed", "A state-changing choice/hotspot is repeatable", "Turn Repeatable off or make the action idempotent with a flag/item gate."],
          ["Characters are absent from the corkboard", "They are not marked or not met", "Enable the met-character corkboard option and create a reachable first meeting."],
          ["Music does not loop or leaks across a cut", "Wrong music mode or an untested scene hand-off", "Set the intended track/inherit mode and play across both scene boundaries."],
          ["Prose or a line renders unexpectedly", "Instant/typewriter or narration settings disagree", "Check show instantly, auto-narrate, silent and voice MP3 settings; listen from a fresh scene entry."],
          ["A foreground or upload is missing", "The reference is stale or the asset was not bundled", "Re-pick it from Media Library, check the preview, then export/import a .reel.json round trip."],
          ["The stage player cannot reach an object", "Walk polygon, blocked area, spawn or reach distance prevents contact", "Move the spawn, clear the route, adjust the walk polygon/reach, and test the actual approach."],
          ["Storage or autosave fails", "Browser storage is full or unavailable", "Export the case, run Storage cleanup, refresh, and import the backup if needed."],
        ],
      },
      {
        kind: "callout",
        label: "The recovery order",
        text: "Export first. Repair second. Validate again. Then play the affected route from a clean scene entry. This order preserves a way back and separates structural fixes from player-experience fixes.",
        tone: "crimson",
      },
    ],
  },
  {
    id: "checklist",
    number: "20",
    kicker: "Before release",
    title: "The soft-lock checklist",
    summary: "Run this as a final production ritual before a case leaves Studio.",
    keywords: ["checklist", "softlock", "release", "publish", "reachability", "victory", "game over", "repeatable", "final", "quality"],
    blocks: [
      {
        kind: "list",
        ordered: true,
        items: [
          "The start scene exists and is set.",
          "Every intended scene is reachable from the start scene.",
          "Every non-ending scene has an open exit, or its gate depends only on something obtainable earlier in the same run.",
          "Every item required by a gate is granted somewhere: hotspot, choice reward or recipe result.",
          "Every flag required by a gate is set somewhere: choice, hotspot or deduction connection.",
          "Every conditional beat has a route that can make its condition true—or is deliberately optional.",
          "There is at least one reachable victory ending and at least one authored game-over ending.",
          "The final accusation or resolution is gated only on deductions and rewards the player can really earn.",
          "No repeatable choice or hotspot grants an unintended reward.",
          "Every custom image, voice and video survives a .reel.json export/import test.",
          "The case is published only after a fresh start run, a branch run and an ending run have been played.",
        ],
      },
      {
        kind: "callout",
        label: "Ship it when the player can explain it",
        text: "A player should be able to tell what they are trying to do, why a locked option is locked, what changed after a choice, and why the final outcome happened. If they cannot, add a line, clue, fail message or visible consequence before adding another system.",
        tone: "gold",
      },
    ],
  },
  {
    id: "shortcuts",
    number: "21",
    kicker: "Reference",
    title: "Keyboard shortcuts",
    summary: "A compact card for authors and playtesters who prefer the keyboard.",
    keywords: ["keyboard", "shortcut", "ctrl", "undo", "redo", "space", "enter", "corkboard", "mute", "rewind", "restart"],
    blocks: [
      {
        kind: "table",
        headers: ["Key", "Context", "Action"],
        rows: [
          ["Ctrl+Z", "Studio", "Undo."],
          ["Ctrl+Shift+Z / Ctrl+Y", "Studio", "Redo."],
          ["Delete / Backspace", "Studio", "Delete the selected node or edge."],
          ["Esc", "Studio", "Close context menus or dialogs."],
          ["1–9", "Player", "Pick a choice by number."],
          ["Up / Down · W / S", "Player", "Move choice focus."],
          ["Space / Enter", "Player", "Continue dialogue."],
          ["←", "Player", "Rewind one line."],
          ["Shift + ←", "Player", "Restart the scene."],
          ["B", "Player", "Open the corkboard."],
          ["M", "Player", "Mute or unmute."],
          [".", "Player", "Skip current text."],
          ["Esc", "Player", "Close or quit."],
        ],
      },
      {
        kind: "prose",
        text: "Shortcuts are a convenience, not a replacement for visible controls. Playtest with a mouse or touch-sized pointer as well: stage reach, hotspot size and choice focus need to work for the audience you are shipping to.",
      },
    ],
  },
];

const TONE_STYLES: Record<ManualTone, { border: string; bg: string; text: string; label: string }> = {
  gold: { border: "border-gold/45", bg: "bg-gold/8", text: "text-gold", label: "text-gold" },
  cyan: { border: "border-cyan-neon/45", bg: "bg-cyan-neon/8", text: "text-cyan-neon", label: "text-cyan-neon" },
  neon: { border: "border-neon/45", bg: "bg-neon/8", text: "text-neon", label: "text-neon" },
  crimson: { border: "border-crimson/45", bg: "bg-crimson/8", text: "text-crimson", label: "text-crimson" },
};

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={`${part}-${index}`} className="font-semibold text-paper/95">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={`${part}-${index}`} className="border border-noir-600 bg-noir-950/70 px-1 text-[0.9em] text-gold">{part.slice(1, -1)}</code>;
        }
        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

function blockText(block: ManualBlock): string {
  if (block.kind === "prose") return block.text;
  if (block.kind === "callout") return `${block.label} ${block.text}`;
  if (block.kind === "list") return block.items.join(" ");
  if (block.kind === "steps") return block.items.map((item) => `${item.label} ${item.text}`).join(" ");
  return `${block.headers.join(" ")} ${block.rows.flat().join(" ")}`;
}

function ManualBlockView({ block }: { block: ManualBlock }) {
  if (block.kind === "prose") {
    return <p className="font-type text-[14px] leading-7 text-paper/70"><RichText text={block.text} /></p>;
  }

  if (block.kind === "callout") {
    const tone = TONE_STYLES[block.tone ?? "gold"];
    return (
      <div className={`border ${tone.border} ${tone.bg} p-3`}>
        <div className={`mb-1 font-pulp text-[10px] uppercase tracking-[0.18em] ${tone.label}`}>{block.label}</div>
        <p className="font-type text-[13px] leading-6 text-paper/75"><RichText text={block.text} /></p>
      </div>
    );
  }

  if (block.kind === "steps") {
    return (
      <ol className="grid gap-2 md:grid-cols-2">
        {block.items.map((item, index) => (
          <li key={item.label} className="flex gap-3 border border-noir-600/80 bg-noir-900/55 p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-gold/50 font-pulp text-[11px] text-gold">{index + 1}</span>
            <span className="font-type text-[13px] leading-6 text-paper/70">
              <strong className="font-pulp text-[10px] uppercase tracking-wider text-paper/95">{item.label}</strong>
              <br />
              <RichText text={item.text} />
            </span>
          </li>
        ))}
      </ol>
    );
  }

  if (block.kind === "list") {
    const ListTag = block.ordered ? "ol" : "ul";
    return (
      <ListTag className={`${block.ordered ? "list-decimal" : "list-disc"} space-y-2 pl-5 font-type text-[13px] leading-6 text-paper/70`}>
        {block.items.map((item) => <li key={item}><RichText text={item} /></li>)}
      </ListTag>
    );
  }

  return (
    <div className="overflow-x-auto border border-noir-600/80">
      <table className="w-full min-w-[620px] border-collapse text-left">
        <thead className="bg-noir-800/80">
          <tr>
            {block.headers.map((header) => <th key={header} className="border-b border-noir-600 px-3 py-2 font-pulp text-[9px] uppercase tracking-[0.14em] text-gold">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={`${row[0]}-${rowIndex}`} className="border-b border-noir-700/70 last:border-0 even:bg-noir-900/45">
              {row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className="align-top px-3 py-2.5 font-type text-[12px] leading-5 text-paper/68"><RichText text={cell} /></td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Article({ article, onCopyLink }: { article: ManualArticle; onCopyLink: (id: string) => void }) {
  return (
    <article id={article.id} className="scroll-mt-28 border border-noir-600/90 bg-noir-900/75 shadow-[0_16px_60px_rgba(0,0,0,0.2)]">
      <header className="border-b border-noir-700/80 p-5 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-pulp text-[10px] uppercase tracking-[0.22em] text-cyan-neon">{article.number} · {article.kicker}</div>
            <h2 className="mt-2 font-pulp text-2xl uppercase leading-tight tracking-wide text-paper md:text-3xl">{article.title}</h2>
          </div>
          <button
            onClick={() => onCopyLink(article.id)}
            className="shrink-0 border border-paper/20 px-2 py-1 font-pulp text-[9px] uppercase tracking-widest text-paper/45 hover:border-gold/70 hover:text-gold"
            title="Copy a deep link to this manual section"
            aria-label={`Copy link to ${article.title}`}
          >
            ⛓ Link
          </button>
        </div>
        <p className="mt-3 max-w-3xl font-type text-[15px] leading-7 text-paper/60">{article.summary}</p>
      </header>
      <div className="space-y-5 p-5 md:p-7">
        {article.blocks.map((block, index) => <ManualBlockView key={`${article.id}-${index}`} block={block} />)}
      </div>
    </article>
  );
}

function getInitialSection() {
  if (typeof window === "undefined") return "start";
  const match = window.location.hash.match(/^#manual\/(.+)$/);
  return MANUAL_ARTICLES.some((article) => article.id === match?.[1]) ? match![1] : "start";
}

export function CreatorManual({ onExit, onOpenStudio }: { onExit: () => void; onOpenStudio: () => void }) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(getInitialSection);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialScrollDone = useRef(false);
  const cleanQuery = query.trim().toLowerCase();

  const visibleArticles = useMemo(() => {
    if (!cleanQuery) return MANUAL_ARTICLES;
    const terms = cleanQuery.split(/\s+/).filter(Boolean);
    return MANUAL_ARTICLES.filter((article) => {
      const searchable = `${article.title} ${article.kicker} ${article.summary} ${article.keywords.join(" ")} ${article.blocks.map(blockText).join(" ")}`.toLowerCase();
      return terms.every((term) => searchable.includes(term));
    });
  }, [cleanQuery]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape" && query) setQuery("");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [query]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const onScroll = () => {
      let current = MANUAL_ARTICLES[0].id;
      for (const article of MANUAL_ARTICLES) {
        const element = document.getElementById(article.id);
        if (element && element.getBoundingClientRect().top <= 150) current = article.id;
      }
      setActiveId(current);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (!initialScrollDone.current) {
      initialScrollDone.current = true;
      const initialSection = getInitialSection();
      if (initialSection !== "start") {
        window.requestAnimationFrame(() => document.getElementById(initialSection)?.scrollIntoView({ behavior: "auto", block: "start" }));
      }
    }
    return () => root.removeEventListener("scroll", onScroll);
  }, [visibleArticles.length]);

  const goTo = (id: string) => {
    setQuery("");
    setActiveId(id);
    window.history.replaceState(null, "", `#manual/${id}`);
    window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const copyLink = async (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#manual/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((current) => current === id ? null : current), 1800);
    } catch {
      window.history.replaceState(null, "", `#manual/${id}`);
      setCopiedId(null);
    }
  };

  const leaveManual = () => {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    onExit();
  };

  const openStudio = () => {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    onOpenStudio();
  };

  return (
    <div ref={scrollRef} id="creator-manual-scroll" className="fx-grain fx-halftone fx-vignette relative h-full overflow-y-auto bg-noir-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_12%,rgba(42,217,217,0.13),transparent_28%),radial-gradient(circle_at_12%_42%,rgba(255,46,136,0.09),transparent_26%)]" aria-hidden />
      <div className="relative z-50">
        <header className="sticky top-0 z-40 border-b border-gold/25 bg-noir-950/92 shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3 md:px-7">
            <button onClick={leaveManual} className="border border-paper/25 px-3 py-2 font-pulp text-[10px] uppercase tracking-widest text-paper/65 hover:border-gold hover:text-gold">← Newsstand</button>
            <div className="mr-auto min-w-[180px]">
              <div className="font-pulp text-[10px] uppercase tracking-[0.22em] text-gold">Scarlet Reel Studio</div>
              <div className="font-type text-[11px] text-paper/45">Creator documentation / v1 field edition</div>
            </div>
            <button onClick={openStudio} className="border border-cyan-neon/55 bg-cyan-neon/8 px-3 py-2 font-pulp text-[10px] uppercase tracking-widest text-cyan-neon hover:bg-cyan-neon/15">🎬 Open Studio</button>
          </div>
          <div className="mx-auto max-w-[1500px] px-4 pb-3 md:px-7">
            <label className="relative block max-w-3xl">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-pulp text-sm text-gold">⌕</span>
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search scenes, gates, audio, stages, endings…"
                aria-label="Search the Studio creator manual"
                className="w-full border border-paper/25 bg-noir-900/90 py-2.5 pl-9 pr-20 font-type text-sm text-paper placeholder:text-paper/35 focus:border-neon focus:outline-none"
              />
              {query ? (
                <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 px-2 font-pulp text-[9px] uppercase tracking-widest text-paper/50 hover:text-neon">Clear</button>
              ) : (
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 border border-paper/20 px-1.5 py-0.5 font-mono text-[9px] text-paper/35">Ctrl K</kbd>
              )}
            </label>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-7 md:grid-cols-[220px_minmax(0,1fr)] md:px-7 lg:gap-10">
          <aside className="hidden md:block">
            <div className="sticky top-32">
              <div className="mb-3 font-pulp text-[10px] uppercase tracking-[0.2em] text-paper/40">Manual index</div>
              <nav aria-label="Manual sections" className="space-y-1 border-l border-noir-600 pl-3">
                {MANUAL_ARTICLES.map((article) => {
                  const active = article.id === activeId && !cleanQuery;
                  const matching = visibleArticles.some((visible) => visible.id === article.id);
                  return (
                    <button
                      key={article.id}
                      onClick={() => goTo(article.id)}
                      className={`block w-full border-l-2 py-1.5 pl-3 text-left font-type text-xs transition-colors ${active ? "-ml-[14px] border-neon text-neon" : matching ? "border-transparent text-paper/60 hover:text-gold" : "border-transparent text-paper/20"}`}
                    >
                      <span className="mr-1 font-mono text-[9px] text-paper/35">{article.number}</span>{article.title}
                    </button>
                  );
                })}
              </nav>
              <div className="mt-5 border border-gold/25 bg-gold/5 p-3 font-type text-[11px] leading-5 text-paper/55">
                <div className="font-pulp text-[9px] uppercase tracking-widest text-gold">Working rule</div>
                Export before a risky change. Validate before a playtest. Playtest before Publish.
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mb-4 flex items-center gap-3 md:hidden">
              <label htmlFor="manual-jump" className="shrink-0 font-pulp text-[9px] uppercase tracking-widest text-gold">Jump to</label>
              <select
                id="manual-jump"
                value={activeId}
                onChange={(event) => goTo(event.target.value)}
                className="min-w-0 flex-1 border border-paper/25 bg-noir-900 px-2 py-2 font-type text-xs text-paper"
              >
                {MANUAL_ARTICLES.map((article) => <option key={article.id} value={article.id}>{article.number} · {article.title}</option>)}
              </select>
            </div>
            <section className="relative overflow-hidden border border-gold/40 bg-noir-900/80 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.25)] md:p-10">
              <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-cyan-neon/20" aria-hidden />
              <div className="absolute -right-5 -top-9 h-44 w-44 rounded-full border border-neon/15" aria-hidden />
              <div className="relative max-w-4xl">
                <div className="font-pulp text-[10px] uppercase tracking-[0.3em] text-cyan-neon">A creator-facing field manual</div>
                <h1 className="mt-3 max-w-3xl font-pulp text-4xl uppercase leading-[0.95] tracking-wide text-paper md:text-6xl">Build the case.<br /><span className="text-gold">Cut the reel.</span></h1>
                <p className="mt-5 max-w-2xl font-type text-lg leading-8 text-paper/65">Everything you need to build, validate, playtest, publish, export and import a Scarlet Reel case—without leaving the newsstand.</p>
                <div className="mt-7 grid gap-2 sm:grid-cols-4">
                  {[
                    ["01", "Set the premise", "Case File, people and items"],
                    ["02", "Build the graph", "Scenes, beats and choices"],
                    ["03", "Test the state", "Gates, meters and routes"],
                    ["04", "Ship the cut", "Validate, publish, export"],
                  ].map(([number, title, text]) => (
                    <button key={number} onClick={() => goTo(["start", "scenes", "gating", "test-publish"][Number(number) - 1])} className="border border-paper/15 bg-noir-950/45 p-3 text-left hover:border-gold/60">
                      <div className="font-mono text-[10px] text-gold">{number}</div>
                      <div className="mt-1 font-pulp text-[10px] uppercase tracking-wide text-paper/90">{title}</div>
                      <div className="mt-1 font-type text-[11px] leading-4 text-paper/45">{text}</div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-y border-noir-700 py-3">
              <div className="font-type text-sm text-paper/55">
                {cleanQuery ? <><span className="text-gold">{visibleArticles.length}</span> matching section{visibleArticles.length === 1 ? "" : "s"} for “{query}”</> : <><span className="text-gold">{MANUAL_ARTICLES.length}</span> sections · searchable field notes</>}
              </div>
              <div className="font-type text-[11px] text-paper/35">Tip: use Ctrl/Cmd + K to search, Esc to clear.</div>
            </div>

            {visibleArticles.length > 0 ? (
              <div className="mt-6 space-y-6">
                {visibleArticles.map((article) => <Article key={article.id} article={article} onCopyLink={copyLink} />)}
              </div>
            ) : (
              <div className="mt-6 border border-crimson/45 bg-crimson/8 p-8 text-center">
                <div className="font-pulp text-lg uppercase tracking-wide text-crimson">No matching page</div>
                <p className="mt-2 font-type text-sm text-paper/60">Try a shorter term such as “gate”, “stage”, “voice”, “ending” or “export”.</p>
                <button onClick={() => setQuery("")} className="mt-4 border border-gold/50 px-4 py-2 font-pulp text-[10px] uppercase tracking-widest text-gold hover:bg-gold/10">Show all sections</button>
              </div>
            )}

            <footer className="flex flex-wrap items-center justify-between gap-3 py-10 font-type text-xs text-paper/35">
              <span>Scarlet Reel Studio · creator documentation</span>
              <span>Build → Validate → Play → Publish → Export</span>
            </footer>
          </main>
        </div>
      </div>
      {copiedId && (
        <div className="fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 border border-emerald-400/60 bg-noir-950/95 px-4 py-2 font-type text-xs text-emerald-300 shadow-xl">
          Deep link copied for “{MANUAL_ARTICLES.find((article) => article.id === copiedId)?.title}”.
        </div>
      )}
    </div>
  );
}

export type { ManualArticle };
