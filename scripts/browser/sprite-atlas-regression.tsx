import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SpriteSheetControls, WALKER_PRESET } from '../../src/studio/SheetEditor';
import { BR_HD_SHEETS } from '../../src/data/bladeRunnerHdAssets';
import type { SpriteSheet } from '../../src/game/spriteSheet';
import '../../src/index.css';
// Real Studio controls; the output only observes their public onChange value.
function Fixture() {
  const [sheet, setSheet] = useState<SpriteSheet | undefined>(BR_HD_SHEETS.runciter);
  return <main className="mx-auto max-w-4xl bg-noir-900 p-6 text-paper">
    <SpriteSheetControls storyId="atlas-regression" value={sheet} onChange={setSheet} preset={WALKER_PRESET} pickerLabel="Existing sheet" />
    <output data-sheet-result className="block break-all">{JSON.stringify(sheet)}</output>
  </main>;
}
createRoot(document.getElementById('root')!).render(<Fixture />);
