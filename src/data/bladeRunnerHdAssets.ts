import type { SpriteSheet } from "../game/spriteSheet";
import sizes from "../../public/assets/blade-runner/hd/sheets.json" with { type: "json" };

import pass3 from "../../public/assets/blade-runner/hd/pass3/sheets.json" with { type: "json" };

export const brHd3 = (name: string) => `/assets/blade-runner/hd/pass3/${name}`;

function assembled(name: keyof typeof pass3): SpriteSheet {
  return { image: brHd3(`${name}-sheet.png`), frameWidth: pass3[name].frameWidth, frameHeight: pass3[name].frameHeight,
    pixelated: false, animations: pass3[name].animations };
}

export const brHd = (name: string) => `/assets/blade-runner/hd/${name}`;

function sheet(name: keyof typeof sizes, walk: number[] = [2, 0, 3, 0], talk = [0, 1, 0, 1]): SpriteSheet {
  return {
    image: brHd(`${name}-sheet.png`),
    frameWidth: sizes[name].frameWidth,
    frameHeight: sizes[name].frameHeight,
    pixelated: false,
    animations: {
      idle: { frames: [0] }, rest: { frames: [0] },
      walk: { frames: walk, fps: name === "mccoy" ? 7 : 5 },
      talk: { frames: talk, fps: 3 },
    },
  };
}

/** Multi-bank McCoy/Zuben and HD Gaff are prepared through the same Studio
 * forge/assembler. Other first-act cast retain four-pose pass-2 sheets. Eight
 * facing selections share side/near/away banks; not eight independent angles. */
export const BR_HD_SHEETS = {
  mccoy: assembled("mccoy"),
  runciter: sheet("runciter"),
  howie: sheet("howie"),
  guzza: sheet("guzza", [0], [0, 1, 2, 3]),
  leary: sheet("leary"),
  gordo: sheet("gordo", [0], [0, 1, 2, 3]),
  zuben: assembled("zuben"),
  gaff: assembled("gaff"),
};
