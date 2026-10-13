# Handoff: Nobody's Witness director notes (13 October 2026)

Branch: `arena/65558afb-scarlett-witness`. **Do not merge until the director has watched the preview.**

Please double-check this work before calling it done. Most of it was done in one session without a full run of the test suite or a watch of the preview.

## Build

- `node tools/build-film-story.mjs` now runs without the sibling `nobodys-witness` checkout. Media already in `public/film/` is used when that checkout is missing.
- The lip-sync clip map moved into `src/film/clips.json` so the build does not need `src/story/clips.ts` from the visual novel. The VN file still wins when it is present.
- Rebuilding from the committed sources is the only way `src/data/nobodysWitnessFilm.ts` should change. Do not hand-edit it.
- Not run this session: `npm test`, `npm run test:film-backend`, the browser spec, or a preview. node_modules was not installed. Run them first.

## Car in scenes 93–94 (latest)

- Kurose is in the right-hand rear seat in every interior picture (141, 368). Ishida gets in on the left (368 shows him climbing in).
- `s94/139-only-tea.jpg` was redone to match the sedan in `s93/138`.
- The "car still wrong" note is closed, but check the car in 137 and 140 in the preview.

## Done in the latest round

- **Newsroom, Jack walks in (×3).** `s82/new-jack-walks-in-1.jpg`, `-2.jpg`, `-3.jpg`, generated with the film's newsroom (`s82/104`) and Jack (`s82/105`, `s14a/426`) as references. Inserted into scene 82 after Harada is introduced and before the tape scene, with three short narration lines that are new: "Jack walks in through the glass doors, determined…", "He comes down the aisle…", "Nobody stops him." Check the wording against the screenplay.
- **Scene 20.** Last picture regenerated with Mara and Jack matched to references (`s20/346`).

## Done this session

- **Shake cam off in the Hive escape.** The shake modes on 128, 129, 131, 132, 133, 378, 379, 381 and 382 are now `zoom-hold`. I read "shake cam" as the Hive escape only. Other shakes in the film are untouched (for example the inn raid, scene 1 and scene 2).
- **Kaneko's pipe strikes are quieter.** The raid cue on 119 is 0.9 → 0.3. The cue on 382 is 0.4 → 0.12.
- **Kaneko strikes the pipe with a spanner (scene 86).** The picture `s86/123-fifty-years.jpg` was regenerated. The narration changed from "lowers the ladle" to "takes a spanner to the old iron water pipe".
- **Answerphone beep (scene 4).** Replaced by `public/film/sfx/answerphone-beep.mp3`, a generated 1 kHz tone (0.6 s). Check it in the preview; it may still need a level or length tweak.
- **No black transitions.** Every `fade-black` is now `fade`, and the two "cut to black" steps no longer insert a black picture. The film has no black-then-image beats now.
- **Scene 14A.** Jack's line is now "We have a plate number." The voice take still says "I think it's a plate number."
- **Scene 14A "Call me".** The text is now "Call me if you plan on going somewhere next time." The voice take still says "Call me when you go somewhere."
- **Scene 17 (Jack pays Kaneko).** The text is now "He puts down a little more than the bowl costs…" (was "far more"). The picture shows one note and a few coins.
- **Scene 20 (storeroom).** The last picture, `s20/346-the-bulb-hums.jpg`, was regenerated with Mara (blonde, dark jacket) and Jack (dark coat) matched to `s2/21-mara-bursts-in.jpg` and `s14a/426-forty-metres.jpg`.
- **Scene 54 (tobacco kiosk).** Vera holds a loose photo, not a framed one.
- **Scene 70 (run to the Hive door).** The car is behind Mara and off to the side. The car passing throws water over Vera. The puddle has no reflection of her.
- **Scene 93–94 (Ishida's car).** The black sedan matches between 137, 138 and 139.
- **Scene 97A (service).** Jack stands apart from Vera at the table (565).
- **Hive escape pictures.** 381 shows a plank across the gap, and 382 shows an iron pipe gallery.

## Not done

- **Service music into the rooftop (scene 98): needs a decision.** Scene 98 now has the service track set (`nw_s98` in `studio-edits.json`, same `musicUrl`), so the engine keeps the song running into the rooftop instead of fading it. But the song is 196 s and the silent service pictures use 191 s of it, so only about 5 s is left for the rooftop. Options for the director: (a) accept the song ending about 5 s into the rooftop, (b) re-cut the song so it runs longer, or (c) loop its last section.
- **Jack's backstory and flashback.** Not added. Jack's past is deliberately held back in the screenplay (scene 20: "Twenty years of silence sit behind his eyes"). A flashback would be new scenes and new pictures, so it needs the director's call.
- **Voice takes that no longer match the text.** Two lines need re-recording in ElevenLabs:
  - `public/film/voice/s14a/342-jack-dryly-i-think-it-s-a.mp3` (the old "I think it's a plate number")
  - `public/film/voice/s14a/343-jack-evenly-call-me-when-you-go.mp3` (the old "Call me when you go somewhere")
  The subtitles now show the new words. Until the takes are replaced, the preview will sound different from the text on screen.
- **Pictures not reviewed in detail:**
  - `s132/132-the-gap.jpg`
  - `s91/133-inches-apart.jpg`
  - `s93/141` and `s93/368`: the car interior does not yet match the exterior sedan
  - `s73` (scene 73) and `s25A` (scene 25A) money shots
  - `s100` (Vera's money)
  - `s69` (last Hive/Mara image)
- **Scene 20.** Confirm that the new picture of Mara and Jack is accepted in the preview. Other storeroom pictures (191, 192, 284, 309, 344, 345, 371, 372, 436, 437) were not regenerated and still show the earlier look. If they still look wrong, redo them with the same references.
- **Other money.** Scene 25A has "He is already at the till, paying. Too much." No picture was checked for it.

## Interpretations to confirm with the director

- "Shake cam" = the Hive escape only.
- "Kaneko's spanner on the pipes" = the pipe-alarm volume plus the picture at 123.
- "Detective in the car / plate number" = the line changed to "We have a plate number." No new picture was made for it.
- "Black transitions" = all `fade-black` removed, not just the ones in the Hive.
