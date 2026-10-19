// The cold open's picture pack, from one source: docs/hangar/cold-open-prompts.json.
//
//   node tools/cold-open-prompts.mjs list              # every plate, and whether the retake exists yet
//   node tools/cold-open-prompts.mjs show 4c           # the exact prompt to paste, with its reference plates
//   node tools/cold-open-prompts.mjs pack [--write]    # the human pack (docs/hangar/cold-open-second-pass.md)
//
// A prompt is never the subject alone: `show` appends the style block (shots and backgrounds) or the sheet block
// (model sheets), and prints the negative prompt and the reference pictures to attach. Refs are paths under
// public/reels/hangar/img/hangar-v2/ unless they start with "…/", which are first-pass plates in public/reels/hangar/.
//
// Status is the file on disk, not a word in the JSON: a plate counts as redrawn when its file exists.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const ART = "public/reels/hangar/img/hangar-v2";
const FIRST = "public/reels/hangar";
const DOC = "docs/hangar/cold-open-second-pass.md";
const pack = JSON.parse(readFileSync(resolve(root, "docs/hangar/cold-open-prompts.json"), "utf8"));

const args = process.argv.slice(2);
const cmd = args[0];
const flat = [...pack.sheets, ...pack.backgrounds, ...pack.shots];
const byId = id => flat.find(p => p.id.toLowerCase() === String(id).toLowerCase());

const exists = p => existsSync(resolve(root, ART, p.file));
const refPath = r => (r.startsWith("…/") ? resolve(root, FIRST, r.slice(2)) : resolve(root, ART, r));

/** "4c" → "4C": the pack is written 2A, 4C, 7E and typed lower-case half the time. */
const label = id => (byId(id) || {}).id || id;

function fullPrompt(p) {
  const block = pack.sheets.includes(p) ? pack.sheetBlock : pack.styleBlock;
  return `${p.subject}\n\n${block}`;
}

function show(id) {
  const p = byId(id);
  if (!p) {
    console.error(`no plate "${id}" — try: node tools/cold-open-prompts.mjs list`);
    process.exit(1);
  }
  console.log(`${p.id} · ${p.title}${p.beat ? ` (beat ${p.beat})` : ""}`);
  console.log(`file      ${ART}/${p.file}${exists(p) ? "  [redrawn]" : "  [not yet]"}`);
  console.log(`refs      ${p.refs.length ? "" : "(none — the sheets are the reference)"}`);
  for (const r of p.refs) console.log(`          ${refPath(r)}`);
  console.log(`\n${fullPrompt(p)}\n`);
  console.log(`NEGATIVE\n${pack.negative}`);
}

function list() {
  const rows = flat.map(p => ({
    id: p.id,
    title: p.title,
    beat: p.beat ? String(p.beat) : "—",
    file: p.file,
    state: exists(p) ? "redrawn" : p.status === "black" ? "black (to make)" : "—",
  }));
  const w = Math.max(...rows.map(r => r.title.length));
  console.log(`${"id".padEnd(4)} ${"beat".padEnd(4)} ${"title".padEnd(w)}  state`);
  for (const r of rows) console.log(`${r.id.padEnd(4)} ${r.beat.padEnd(4)} ${r.title.padEnd(w)}  ${r.state}`);
  const done = rows.filter(r => r.state === "redrawn").length;
  console.log(`\n${done}/${rows.length} plates in ${ART}/`);
}

function pack_() {
  const L = [];
  const done = flat.filter(exists).length;
  L.push("# The cold open — second pass");
  L.push("");
  L.push(`*Untitled (working title), the 1975 cold open. Retake of the painted boards: late-1990s cel animation, painted backgrounds, 2.39:1. Generated from \`docs/hangar/cold-open-prompts.json\` by \`node tools/cold-open-prompts.mjs pack\` — change the JSON, not this page.*`);
  L.push("");
  L.push(`**Status:** ${done}/${flat.length} plates redrawn, in \`${ART}/\`. The playable second pass is \`src/data/hangarColdOpenV2Reel.ts\`, rebuilt with \`node tools/retake-reel-pictures.mjs hangar\`.`);
  L.push("");
  L.push("## How to use this pack");
  L.push("");
  L.push("Make the sheets first, then the shots. The sheets are the reference images that keep faces, wardrobe and the crate consistent from shot to shot.");
  L.push("");
  L.push("1. Generate the character, vehicle, prop and location sheets. Keep the best take of each.");
  L.push("2. For every shot, attach the matching sheets as reference images, then paste the shot prompt.");
  L.push("3. Every shot and background prompt ends with the Style Block, every sheet prompt with the Sheet Block, and every generation gets the Negative Prompt.");
  L.push("4. Shots are painted 16:9 and composed inside a 2.39:1 centre band — the reel letterboxes the frame. Sheets are 16:9.");
  L.push("5. **Leave all lettering out.** Every stencil panel and sign is painted blank, and the three strings are tracked in over the finished picture in a stencil face:");
  for (const s of pack.post.lettering) L.push(`   - \`${s}\``);
  L.push(`   ${pack.post.note}`);
  L.push("6. Don't name the film whose look you're after. The Style Block describes the look instead.");
  L.push("");
  L.push("## Blocks");
  L.push("");
  L.push("**Style Block** (shots and backgrounds)");
  L.push("");
  L.push("```");
  L.push(pack.styleBlock);
  L.push("```");
  L.push("");
  L.push("**Sheet Block** (model sheets)");
  L.push("");
  L.push("```");
  L.push(pack.sheetBlock);
  L.push("```");
  L.push("");
  L.push("**Negative Prompt**");
  L.push("");
  L.push("```");
  L.push(pack.negative);
  L.push("```");
  L.push("");
  L.push("## Colour script");
  L.push("");
  L.push("| Beat | Light | Key colours |");
  L.push("|---|---|---|");
  for (const p of pack.palette) L.push(`| ${p.beat} | ${p.light} | ${p.keys.join(" · ")} |`);
  L.push("");

  const section = (title, items, note) => {
    L.push(`## ${title}`);
    L.push("");
    if (note) L.push(note, "");
    for (const p of items) {
      L.push(`### ${p.id} · ${p.title} ${exists(p) ? "✅" : "▫️"}`);
      L.push("");
      L.push(`\`${ART}/${p.file}\``);
      L.push("");
      L.push("```");
      L.push(fullPrompt(p));
      L.push("```");
      if (p.refs.length) {
        L.push("");
        L.push("Reference plates:");
        for (const r of p.refs) L.push(`- \`${refPath(r).replace(root + "/", "")}\``);
      }
      L.push("");
    }
  };

  section("Model sheets", pack.sheets, "Faces, wardrobe and the crate, fixed. Every later shot references these.");
  section("Location backgrounds", pack.backgrounds, "Painted empty, then characters are composited over them or the plate is used as a reference.");
  section("Shots", pack.shots, "Beat 1 is audio over black and has no picture: those plates are pure black on purpose. The rest run in shooting order.");

  L.push("## Consistency checklist");
  L.push("");
  L.push("- The airman's corduroy jacket, the trucker's cap and the mom's white cap never change.");
  L.push("- The wagon is always avocado green with woodgrain panels, and its driver's mirror is gone from 4C on.");
  L.push("- The crate's coffee ring, corner brackets and rope handles match in every shot.");
  L.push("- Fog and moonlight hold steady through beats 3 to 5; from 6B on, the flares own the light.");
  L.push("- Nothing in the woods or the crate looks like a figure. If a generation sneaks one in, regenerate: the robot stays unseen.");
  L.push("- No lettering anywhere except what is added in post.");
  L.push("- Beat 1 stays black. A picture there is a generation mistake, not a shot.");
  L.push("");

  const text = L.join("\n");
  if (args.includes("--write")) {
    writeFileSync(resolve(root, DOC), text);
    console.log(`wrote ${DOC} (${flat.length} plates, ${done} redrawn)`);
  } else {
    process.stdout.write(text);
  }
}

if (cmd === "show") show(args[1]);
else if (cmd === "list" || !cmd) list();
else if (cmd === "pack") pack_();
else {
  console.error("usage: node tools/cold-open-prompts.mjs list | show <id> | pack [--write]");
  process.exit(1);
}
