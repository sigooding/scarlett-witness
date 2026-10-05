# Dev server "keeps restarting" — root cause & fix

## Symptom

During `npm run dev` (or `desktop:dev-live`), the browser preview reloads
on its own — usually right after doing something in Studio (generating a
voice line, uploading/dropping an image, removing a background). It looks like
a crash or a game bug, but it is **not**: it is Vite's dev server performing a
full page reload.

## Root cause

Vite watches the project directory. By default, **any change under `public/`
triggers a full page reload** (that's documented Vite behaviour — `public/`
files are served as-is, so Vite can't hot-swap them, it reloads).

The Studio **writes files into `public/` at runtime**:

- ElevenLabs voice lines auto-save to `public/voices/<person>/<scene>/<line>.mp3`
  (see DEVELOPMENT-NOTES §"command cheat sheet" / desktop:dev-live).
- Uploads and background-removal outputs land under `public/uploads/`.
- The desktop shell mirrors media into a `game-media/` folder.

So every generated line / dropped asset fired the watcher → the whole page
reloaded → "the preview keeps restarting."

A secondary (cosmetic) contributor: `src/App.tsx` exports a non-component
(`loadGlobalTitleTheme`) alongside components, so React Fast Refresh can't
apply and Vite falls back to a full page reload when that file changes. That
only matters while editing source, not while using the app — it's noted here
so nobody chases it as a bug.

## Fix

`vite.config.ts` → `server.watch.ignored` now excludes the runtime-written
directories (`public/uploads/`, `public/voices/`, `game-media/`) plus the huge
`*.reel.json` export drafts at the repo root. Ignored paths are still **served
fresh from disk** on every request — the only thing that changes is that Vite
stops reloading the page when they appear.

## If it still reloads

1. **Check what changed on disk.** Look at the Vite log line right before the
   reload (`[vite] (client) page reload …`); it names the file. If it's under
   a directory the Studio writes to, add that path to `server.watch.ignored`.
2. **Studio writes elsewhere too.** New write paths land as the app grows —
   the rule is: *any directory the app mutates at runtime must be watched-out
   or it will reload the page.*
3. **Not a watcher issue** if the reload happens with no disk change and no
   HMR line — then suspect the preview proxy dropping a slow first-compile
   (cold transform of the ~500 KB `src/studio/Studio.tsx` can take a while) and
   retrying. That's environmental, not code.

## Rule of thumb for the future

> A full page reload in dev is **almost always Vite reacting to a file change**
> (in `public/`, or a source file that can't Fast-Refresh). Read the log line
> before assuming the game crashed.
