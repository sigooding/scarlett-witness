import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Stage } from '../../src/game/Stage';
import { ForegroundExtras } from '../../src/game/Game';
import { BLADE_RUNNER_ACT1 } from '../../src/data/bladeRunnerAct1';
import { BR_HD_SHEETS } from '../../src/data/bladeRunnerHdAssets';
import type { Hotspot, StageSettings } from '../../src/types';
import '../../src/index.css';

// Only a mount harness: production Stage/ForegroundExtras own every input,
// animation and route. Outputs observe callbacks; no React-state injection.
const query = new URLSearchParams(location.search);
const policy = (['aim', 'smart', 'walkover'].includes(query.get('policy') ?? '') ? query.get('policy') : 'aim') as StageSettings['hotspotTrigger'];
const hs = (id: string, x: number, type: 'showText' | 'goToScene' | 'startDialogue'): Hotspot => ({
  id, label: id, bounds: { x, y: 45, w: 12, h: 43 }, cursor: type === 'goToScene' ? 'go' : 'use',
  isRepeatable: true, action: { type, ...(type === 'goToScene' ? { targetSceneId: 'elsewhere' } : { text: id }) },
});
function Fixture() {
  const [conversation, setConversation] = useState<string | null>(null);
  const [fired, setFired] = useState<string[]>([]);
  const [pos, setPos] = useState({ x: 10, y: 88 });
  const layers = query.has('layers');
  const hidden = query.has('hide');
  const cinematic = structuredClone(BLADE_RUNNER_ACT1.scenes.find(s => s.id === 'br_spinner_flight')!.cinematic!);
  if (query.has('still')) for (const e of cinematic.foregroundExtras ?? []) if (e.scroll) { e.scroll.speed = 0; e.scroll.crossSpeed = 0; }
  const settings: StageSettings = { spawn: { x: 10, y: 88 }, floor: { top: 65, bottom: 96 }, speed: 70, reach: 4,
    keyboard: true, depthScale: 0, hotspotTrigger: policy, hints: 'always', hidePlayer: hidden,
    playerSheet: BR_HD_SHEETS.mccoy, playerScale: 1.8,
    npcs: [{ id: 'scaled-npc', sheet: BR_HD_SHEETS.runciter, x: 60, y: 80, scale: 1.8, facing: 'left', talkHotspotId: 'NPC talk', talkAnim: 'talk' }],
  };
  if (query.has('directions')) { settings.spawn = { x: 50, y: 55 }; settings.floor = { top: 10, bottom: 96 }; settings.speed = 16; }
  return <>
    {query.has('convo') && <button onClick={() => setConversation(null)}>End fixture conversation</button>}
    <output data-fired={JSON.stringify(fired)} data-player-x={pos.x} data-player-y={pos.y} className="block h-10 text-white">{fired.join(', ') || 'No interactions'}</output>
    <div data-fixture-room className="relative mx-auto w-full" style={{ aspectRatio: '16 / 9', background: '#172329' }}>
      {layers ? <ForegroundExtras cinematic={cinematic} /> :
      <Stage settings={settings} hotspots={[
        hs('Spawn exit', 4, 'goToScene'), hs('Incidental object', 44, 'showText'),
        { ...hs('Far exit', 84, 'goToScene'), remote: hidden }, hs('Overlapping exit', 86, 'goToScene'),
        { ...hs('NPC talk', 58, 'startDialogue'), bounds: { x: 58, y: 40, w: 4, h: 40 } },
      ]} active={!conversation} convoHotspotId={conversation} unlocked={() => true} onInteract={h => { setFired(f => [...f, h.id]); if (query.has('convo') && h.action.type === 'startDialogue') setConversation(h.id); }} onPosChange={setPos} />}
    </div>
  </>;
}
createRoot(document.getElementById('root')!).render(<Fixture />);
