# Nobody's Witness on the Scarlet Reel engine

The catalogue (`src/data/stories.ts`) holds one story, the film. It is generated, not hand-written:

    node tools/build-film-story.mjs     # src/film/story.json -> src/data/nobodysWitnessFilm.ts + public/film/*

One scene node per film scene; every shot is a dialogue beat's background, so the dialogue player, Studio flowchart and saves work unchanged. The prologue (Kaneko over the Hive) is the first node and the credits (over `nobodys-witness.mp3`) the ending. `src/film/story.json` is the same data the standalone visual novel on `main` is built from. The other stories are untouched in `src/data/`; import them in `stories.ts` to bring one back.

## Notes on the pictures, clips and sound (as of 6 October 2026)

**The pictures come from PlayFrame** (`sigooding/PlayFrame`, `public/images/neonoire/`) by way of the visual novel's importer; this repo only copies them into `public/film/img/`. The decisions behind them are in PlayFrame's `docs/neonoire/story-bible.md` (Part 9, items 19 and 20) and `docs/neonoire/handoff.md`. Do not edit the images here; regenerate with `node tools/build-film-story.mjs` after the visual novel's importer has run.

- **Shot 73 (the vending-machine frame) is retired.** Vera's run is three handheld frames, then the lost heel.
- **Retaken to one lane layout** (barbershop doorway, scooter and crates left; vending machine right; bar at the far end; sedan gone after the men leave): shots **14, 17, 18**, and **333** (sedan broadside across the lane mouth, old man between camera and men).
- **New frames:** 383 (the empty lane), 384–386 (Vera in her apartment, for emptiness), 387–388 (Vera's run in the red dress: the long street and the crossing).
- **Still wrong, queued for a retake when image credits are available:** shot **10** (a second car and a third masked man; Mara drawn dark-haired and in view), shot **12** (a brick alley, the car nose-on, Mara in view) and shot **13** (a wide UK-style road with yellow lines, Mara in view). Until then the car scene's pictures do not all agree with each other.

**Video beats.** A beat's `background` may be `video:<path>`: a silent clip that plays once and holds its last frame (`BeatBackground` in `src/game/Game.tsx`). The Studio beat editor has a 🎞 Video upload button and a preview. The clip lists a `.webm` beside the `.mp4` so browsers without H.264 still play it. The only clip is shot 14's lip-synced take of Mara's line (OmniHuman 1.5 from the still and her recorded voice, 5.6 s); the builder reads the list from the visual novel's `src/story/clips.ts`, so adding a talking shot there adds it here. The clip carries no sound; the beat's own voice file plays.

**Sound.** `ambientAudio` may layer built-in presets and recorded loops with `+`: `rain+file:/film/sfx/amb-hive.mp3`. The builder picks one bed per scene from its slugline (vending hum for the backstreet, city traffic for other exteriors, room tone, the Hive, a bar, an office). Recorded with ElevenLabs sound effects (`amb-*.mp3` and `car-pass.mp3` in `public/film/sfx/`). **No rain, sound or particles, in `INT.` scenes** (an `INT./EXT.` slugline still counts as outdoors). The running-in-heels effect was tried and cut.
