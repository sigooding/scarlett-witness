import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { BLADE_RUNNER_ACT1 as S } from '../src/data/bladeRunnerAct1';
import { BR_HD_SHEETS } from '../src/data/bladeRunnerHdAssets';
import { createInitialState, meetsGating, resolveHotspot, validateStory, hotspotFiresOnWalkOver, hotspotLeavesScene } from '../src/logic';
import { initialSim, availableDecisions, applyDecision, isStuck, type Decision } from '../src/game/decisions';
import { stageHotspotApproachable, stageExitProbes, stageReturnPath } from '../src/game/stageNavigation';
import { despillEdges, forgeFrameLayout } from '../src/studio/spriteForge';
import { nextSceneMediaPlan } from '../src/game/scenePreload';
import { EXPORT_PREVIEW_LIMIT, exportPreviewText, createPortableStoryBundle } from '../src/studio/exportBundle';
import { loadAssets, loadAllAssets, loadStoryAssetsForExport, collectStoryAssetIds, importStoryAssets, resolveStoryMedia } from '../src/data/mediaLibrary';
import { visitStoryMediaFields } from '../src/data/storyMedia';
import type { Story } from '../src/types';

let passed = 0;
async function test(name: string, run: () => void | Promise<void>) {
  try { await run(); passed++; console.log(`  ✔ ${name}`); }
  catch (e) { console.error(`  ✖ ${name}`, e); process.exitCode = 1; }
}
const scene = (id: string) => S.scenes.find(s => s.id === id)!;
class Run {
  sim = initialSim(S, createInitialState(S));
  offered() { return availableDecisions(S, this.sim); }
  take(predicate: (d: Decision) => boolean, label: string) {
    const d = this.offered().find(predicate);
    assert.ok(d, `${this.sim.sceneId}: ${label} not offered; ${this.offered().map(d => d.label).join(' | ')}`);
    this.sim = applyDecision(S, this.sim, d).sim;
    assert.equal(isStuck(S, this.sim), false, `${label} stranded the player`);
  }
  marker(id: string) { this.take(d => d.kind === 'hotspot' && d.hotspotId === id && !d.verb, id); }
  choice(id: string) { this.take(d => d.kind === 'choice' && d.choiceId === id, id); }
  canMarker(id: string) { return this.offered().some(d => d.kind === 'hotspot' && d.hotspotId === id); }
  at(id: string) { assert.equal(this.sim.sceneId, id); }
  flag(id: string) { return this.sim.state.activeFlags.has(id); }
  has(id: string) { return this.sim.state.inventory.some(i => i.id === id); }
}

await test('25-scene first-act work-in-progress has zero validator errors or warnings', () => {
  assert.equal(S.scenes.length, 25); assert.deepEqual(validateStory(S), []);
  assert.equal(S.pulpPaper, false);
});
await test('canonical opening is Carson Street with McCoy’s equipment; revisits do not farm it', () => {
  const r = new Run(); r.at('br_runciter_ext');
  assert.ok(r.has('br_item_badge') && r.has('br_item_blaster') && r.flag('br_badge_granted'));
  r.marker('br_hs_ext_door'); r.marker('br_hs_runciter_exit'); r.at('br_runciter_ext');
  assert.equal(r.sim.state.inventory.filter(i => i.id === 'br_item_blaster').length, 1);
  assert.equal(S.characters.find(c => c.id === 'br_cop')!.name, 'Officer Leary');
  assert.equal(S.characters.find(c => c.id === 'br_bryant')!.name, 'Lieutenant Guzza');
  assert.equal(scene('br_runciter_int').hotspots!.find(h => h.id === 'br_hs_lucy_talk')!.action.type, 'showText');
});
await test('every walkable room has an approachable local exit and return to LAPD WITHOUT a map', () => {
  const noMap = { ...S, map: undefined };
  for (const s of S.scenes.filter(s => s.nodeType === 'stage' && !s.isEnding)) {
    assert.ok(stageExitProbes(noMap, s).some(e => e.open), s.id);
    assert.ok(stageReturnPath(noMap, s.id, 'br_mainframe_hub'), s.id);
    for (const h of s.hotspots ?? []) assert.equal(hotspotFiresOnWalkOver(h, s.stage!.hotspotTrigger), false, `${s.id}/${h.id}`);
  }
});
await test('navigation audit detects a removed apartment exit; a map cannot conceal it', () => {
  const broken: Story = structuredClone(S);
  const apt = broken.scenes.find(s => s.id === 'br_mccoy_apt')!;
  apt.hotspots = apt.hotspots!.filter(h => !hotspotLeavesScene(h));
  assert.equal(stageReturnPath(broken, apt.id, 'br_mainframe_hub'), null);
  assert.ok(stageReturnPath(broken, apt.id, 'br_mainframe_hub', undefined, true), 'explicit opt-in map report is separate');
});
await test('navigation audit rejects an exit sealed behind a wall even when its target exists', () => {
  const room = structuredClone(scene('br_runciter_int'));
  room.stage = { ...room.stage, spawn: { x: 90, y: 90 }, floor: { top: 70, bottom: 95 }, obstacles: [{ x: 40, y: 60, w: 20, h: 40 }] };
  const exits = stageExitProbes(S, room).filter(e => e.target === 'br_runciter_ext');
  assert.ok(exits.length); assert.ok(exits.every(e => !e.open && /walkable/.test(e.reason!)));
});
await test('shop disk is approachable; audit catches the old evidence marker placed against furniture', () => {
  const shop = scene('br_runciter_int');
  const disk = shop.hotspots!.find(h => h.id === 'br_hs_take_disk')!;
  assert.ok(stageHotspotApproachable(shop, disk, createInitialState(S)));
  const broken = { ...disk, bounds: { x: 22, y: 65, w: 10, h: 18 } };
  assert.equal(stageHotspotApproachable(shop, broken, createInitialState(S)), false);
});
await test('every new-room interaction is approachable from EVERY authored entry, before and after either outcome', () => {
  const rooms = ['br_zuben_evade','br_chinatown_alley','br_warehouse_stairs','br_zuben_warehouse','br_howie_street'];
  for (const id of rooms) for (const flags of [[], ['br_zuben_fled','br_zuben_ambush'], ['br_zuben_resolved','br_zuben_spared','br_gaff_aftermath'], ['br_zuben_resolved','br_zuben_retired','br_gaff_aftermath']]) {
    const source = scene(id), state = { ...createInitialState(S), activeFlags: new Set(flags) };
    const spawns = { default: source.stage!.spawn!, ...source.stage!.entrySpawns };
    for (const [entry, spawn] of Object.entries(spawns)) {
      const from = { ...source, stage: { ...source.stage!, spawn } };
      for (const h of from.hotspots ?? []) {
        const resolved = resolveHotspot(h,state);
        if (meetsGating(resolved.gating,state)) assert.ok(stageHotspotApproachable(from,resolved,state),`${id} from ${entry}: ${h.id} with ${flags}`);
      }
      assert.ok(stageReturnPath({ ...S, map: undefined, scenes: S.scenes.map(s=>s.id===id?from:s) },id,'br_mainframe_hub',state),`${id}/${entry}: local return`);
    }
  }
});
await test('ambush and Gaff debrief become harmless reviews; old resolved saves never revive Zuben', () => {
  const state = { ...createInitialState(S), activeFlags: new Set(['br_zuben_ambush','br_zuben_resolved','br_zuben_spared','br_gaff_aftermath']) };
  const door = resolveHotspot(scene('br_zuben_warehouse').hotspots!.find(h=>h.id==='br_hs_warehouse_door')!,state);
  assert.equal(door.action.type,'showText'); assert.match(door.action.text!,/confrontation is over/); assert.equal(door.isRepeatable,true); assert.equal(door.action.flagSet,undefined);
  assert.equal(meetsGating(scene('br_zuben_warehouse').stage!.npcs![0].gating,state),false);
  const gaff = resolveHotspot(scene('br_howie_street').hotspots!.find(h=>h.id==='br_hs_gaff_aftermath')!,state);
  assert.equal(gaff.isRepeatable,true); assert.equal(gaff.action.flagSet,undefined);
  for (const outcome of ['br_zuben_spared','br_zuben_retired']) for (const suffix of ['lapd','apt']) {
    const id = outcome==='br_zuben_spared'?`br_mercy_${suffix}`:`br_retire_${suffix}`;
    assert.equal(scene(outcome).choices!.find(c=>c.id===id)!.gating,undefined,'legacy recovery shortcut');
  }
});
await test('surveillance enhancements are registered evidence crops, not unrelated room placeholders', () => {
  const cfg=scene('br_mainframe_hub').hotspots!.find(h=>h.id==='br_hs_esper_terminal')!.action.esperPhoto!;
  assert.match(cfg.photoImage!,/pass3\/runciter-security/);
  assert.equal(cfg.regions.filter(r=>r.isTarget).length,1);
  for (const r of cfg.regions) assert.match(r.enhancedImage!,/pass3\/esper-/);
  assert.equal(cfg.regions.find(r=>r.id==='sec_shadow')!.flagSet,'br_esper_suspect_coat');
  assert.equal(cfg.regions.find(r=>r.id==='sec_mirror')!.itemGranted,'br_item_dragon_clue');
});
await test('large portable export previews stay bounded without changing the full payload', () => {
  const small = '{"test":1}'; assert.equal(exportPreviewText(small), small);
  const large = 'a'.repeat(EXPORT_PREVIEW_LIMIT + 5000);
  const preview = exportPreviewText(large);
  assert.ok(preview.length < EXPORT_PREVIEW_LIMIT + 150); assert.match(preview, /PREVIEW TRUNCATED/);
  assert.equal(large.length, EXPORT_PREVIEW_LIMIT + 5000);
});
await test('stage 12 elevator is ungated, repeatable and reaches the mainframe at zero evidence', () => {
  const r = new Run(); r.sim = initialSim(S, createInitialState(S), 'br_mccoy_apt');
  for (let n = 0; n < 3; n++) { r.marker('br_hs_apt_return'); r.at('br_mainframe_hub'); r.marker('br_hs_mainframe_home'); r.at('br_mccoy_apt'); }
  assert.equal(r.canMarker('br_hs_conclude_act1'), false);
});

for (const timeout of [false, true]) for (const retire of [false, true]) {
  await test(`earned golden route: ${timeout ? 'missed pot, recover' : 'dodge pot'} → ${retire ? 'retire' : 'spare'} → upload and file`, () => {
    const r = new Run();
    r.marker('br_hs_ext_door'); r.marker('br_hs_take_disk'); r.marker('br_hs_take_casing'); r.marker('br_hs_runciter_exit');
    r.take(d => d.kind === 'stage-exit' && d.edge === 'left', 'street to mainframe'); r.at('br_mainframe_hub');
    r.marker('br_hs_mainframe_home'); assert.equal(r.canMarker('br_hs_conclude_act1'), false); r.marker('br_hs_apt_return');
    r.take(d => d.kind === 'minigame' && d.sourceId === 'br_hs_esper_terminal' && d.won, 'ESPER target clue');
    assert.ok(r.flag('br_esper_dragon_revealed') && r.has('br_item_dragon_clue'));
    r.marker('br_hs_mainframe_sync'); assert.ok(r.flag('br_mainframe_synced'));
    r.marker('br_hs_mainframe_sync'); assert.equal(r.sim.state.inventory.filter(i => i.id === 'br_item_photo_disk').length, 1);
    r.marker('br_hs_spinner_takeoff'); r.marker('br_hs_flight_arrive'); r.marker('br_hs_chinatown_travel');
    r.marker('br_hs_howie_kitchen'); r.marker('br_hs_zuben_question');
    if (timeout) { r.take(d => d.kind === 'qte-timeout', 'let the pot timer expire'); r.at('br_zuben_spilled'); r.choice('br_spill_follow'); }
    else { r.choice('br_zuben_dodge'); r.at('br_zuben_evade'); r.marker('br_hs_evade_continue'); } // browser separately proves the automatic script
    assert.equal(r.flag('br_zuben_dodged'), !timeout); assert.ok(r.flag('br_zuben_fled'));
    r.at('br_chinatown_alley'); assert.equal(r.canMarker('br_hs_alley_plate'), false, 'dumpster clue is not premature');
    r.marker('br_hs_alley_return'); r.marker('br_hs_howie_kitchen');
    assert.equal(r.canMarker('br_hs_zuben_question'), false);
    r.marker('br_hs_kitchen_alley');
    r.marker('br_hs_alley_warehouse'); r.at('br_warehouse_stairs'); r.marker('br_hs_stairs_upper');
    assert.equal(r.canMarker('br_hs_zuben_standoff'), false, 'try the locked door first');
    r.marker('br_hs_warehouse_door'); assert.ok(r.flag('br_zuben_ambush'));
    r.marker('br_hs_zuben_standoff'); r.choice('br_zuben_backaway');
    assert.equal(r.flag('br_zuben_resolved'), false);
    r.marker('br_hs_alley_warehouse'); r.marker('br_hs_stairs_upper'); r.marker('br_hs_zuben_standoff');
    r.choice(retire ? 'br_zuben_shoot' : 'br_zuben_mercy');
    assert.ok(r.flag('br_zuben_resolved')); assert.equal(r.flag('br_zuben_retired'), retire); assert.equal(r.flag('br_zuben_spared'), !retire);
    if (retire) { r.choice('br_retire_search'); assert.ok(r.has('br_item_zuben_photo')); assert.ok(!r.offered().some(d=>d.kind==='choice'&&d.choiceId==='br_retire_search')); }
    r.choice(retire ? 'br_retire_street' : 'br_mercy_street'); r.at('br_howie_street');
    r.marker('br_hs_gaff_aftermath'); assert.ok(r.flag('br_gaff_aftermath'));
    r.take(d=>d.kind==='stage-convo-end','leave Gaff’s conversation');
    r.marker('br_hs_street_alley'); r.marker('br_hs_alley_plate'); assert.ok(r.has('br_item_alley_plate'));
    r.marker('br_hs_alley_street'); r.marker('br_hs_street_alley'); assert.equal(r.canMarker('br_hs_alley_plate'),false,'physical pickup is spent');
    r.marker('br_hs_alley_street'); r.marker('br_hs_street_home'); r.at('br_mccoy_apt');
    const vid = resolveHotspot(scene('br_mccoy_apt').hotspots!.find(h => h.id === 'br_hs_vidphon')!, r.sim.state);
    assert.match(vid.action.text!, retire ? /retir/i : /holster|mercy|let him/i);
    r.marker('br_hs_apt_return'); r.marker('br_hs_mainframe_home');
    r.marker('br_hs_conclude_act1'); r.at('br_act1_conclusion'); assert.equal(r.offered().length, 0);
  });
}
await test('filing is locked if ANY of ESPER, mainframe upload, or Zuben resolution is missing', () => {
  const gate = scene('br_mccoy_apt').hotspots!.find(h => h.id === 'br_hs_conclude_act1')!.gating;
  const flags = ['br_esper_dragon_revealed', 'br_mainframe_synced', 'br_zuben_resolved'];
  for (const omit of flags) assert.equal(meetsGating(gate, { ...createInitialState(S), activeFlags: new Set(flags.filter(f => f !== omit)) }), false, omit);
  assert.equal(meetsGating(gate, { ...createInitialState(S), activeFlags: new Set(flags) }), true);
});
await test('NPC and linked-marker gates agree after flight/resolution, and bad NPC flag references are audited', () => {
  const room = scene('br_howie_kitchen');
  for (const flag of [undefined, 'br_zuben_fled', 'br_zuben_resolved']) {
    const state = { ...createInitialState(S), activeFlags: new Set(flag ? [flag] : []) };
    const marker = room.hotspots!.find(h => h.id === 'br_hs_zuben_question')!;
    assert.ok(marker.hiddenWhenLocked);
    assert.equal(meetsGating(room.stage!.npcs![0].gating, state), !flag);
    assert.equal(meetsGating(resolveHotspot(marker, state).gating, state), !flag);
  }
  const copy = structuredClone(S); copy.scenes.find(s => s.id === room.id)!.stage!.npcs![0].gating = { requiresFlags: ['never_authored'] };
  assert.ok(validateStory(copy).some(i => /never_authored/.test(i.message)));
});
await test('forge common scale preserves relative pose heights and gives every frame the same foot baseline', () => {
  const layout = forgeFrameLayout([{ w: 60, h: 100 }, { w: 40, h: 80 }, { w: 90, h: 100 }], 200, true);
  assert.deepEqual(layout.frames.map(f => f.h), [200, 160, 200]);
  assert.deepEqual(layout.frames.map(f => f.y + f.h), [200, 200, 200]);
  assert.equal(layout.frameWidth, 180);
  for (const [i, f] of layout.frames.entries()) assert.ok(f.x >= i * layout.frameWidth && f.x + f.w <= (i + 1) * layout.frameWidth);
  assert.deepEqual(forgeFrameLayout([{ w: 60, h: 100 }, { w: 40, h: 80 }], 200).frames.map(f => f.h), [200, 200]);
});
await test('edge-spill cleanup reduces magenta rims without changing alpha, interior colour or red costume', () => {
  const data = new Uint8ClampedArray(12*12*4);
  for (let i = 0; i < data.length; i += 4) data.set([180, 100, 200, 255], i);
  const red = (5*12)*4; data.set([190, 30, 40, 255], red);
  const out = despillEdges(data, 12, 12, { r: 255, g: 0, b: 255 });
  assert.ok(out[0] < data[0]); assert.equal(out[1], data[1]);
  assert.deepEqual(out.slice((6*12+6)*4, (6*12+6)*4+4), data.slice((6*12+6)*4, (6*12+6)*4+4));
  assert.deepEqual(out.slice(red, red+4), data.slice(red, red+4));
  assert.ok(data.every((v, i) => i % 4 !== 3 || v === out[i]));
  assert.deepEqual(despillEdges(data, 12, 12, { r: 255, g: 255, b: 255 }), data);
});
await test('eight HD atlases / 54 poses agree with multi-row PNG geometry and valid, smooth-rendered clips', () => {
  let total = 0;
  for (const sheet of Object.values(BR_HD_SHEETS)) {
    const png = readFileSync(path.join(process.env.SCARLET_TEST_ROOT!, 'public', sheet.image));
    const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
    assert.equal(width % sheet.frameWidth, 0); assert.equal(height % sheet.frameHeight, 0);
    const count = width / sheet.frameWidth * height / sheet.frameHeight; total += count;
    assert.equal(png[25], 6, 'RGBA PNG'); assert.ok(sheet.frameHeight >= 650); assert.equal(sheet.pixelated, false);
    for (const animation of Object.values(sheet.animations)) assert.ok(animation.frames.every(n => n >= 0 && n < count));
  }
  assert.equal(total, 54);
});
await test('next-room preload includes BOTH moving scenery and stationary cockpit masks', () => {
  const hub = scene('br_mainframe_hub');
  const minimal = { ...hub, hotspots: [hub.hotspots!.find(h => h.id === 'br_hs_spinner_takeoff')!] };
  const plan = nextSceneMediaPlan({ story: S, scene: minimal, state: createInitialState(S) });
  for (const ex of scene('br_spinner_flight').cinematic!.foregroundExtras!) {
    if (ex.image) assert.ok(plan.images.includes(ex.image), ex.image);
    if (ex.maskImage) assert.ok(plan.images.includes(ex.maskImage), ex.maskImage);
  }
});
await test('portable export + fresh import resolves real ESPER, VK, masks and HD sheets byte-for-byte under a non-root base', async () => {
  const originalFetch = globalThis.fetch;
  const sources = new Map<string, string>();
  globalThis.fetch = async input => {
    const url = String(input); assert.ok(url.startsWith('/case-library/'), url);
    const bytes = readFileSync(path.join(process.env.SCARLET_TEST_ROOT!, 'public', url.slice('/case-library/'.length)));
    const mime = /\.png$/.test(url) ? 'image/png' : /\.webp$/.test(url) ? 'image/webp' : 'image/jpeg';
    sources.set(url.slice('/case-library'.length), `data:${mime};base64,${bytes.toString('base64')}`);
    return new Response(bytes, { headers: { 'Content-Type': mime } });
  };
  try {
    const bundle = await createPortableStoryBundle(S);
    assert.deepEqual(bundle.missing, []); assert.ok(bundle.assets.length > 40);
    const refs = collectStoryAssetIds(bundle.story); assert.equal(refs.size, bundle.assets.length);
    await importStoryAssets(S.id, bundle.assets);
    const imported = await resolveStoryMedia(bundle.story); assert.equal(collectStoryAssetIds(imported).size, 0);
    const expected = structuredClone(S);
    visitStoryMediaFields(expected, ({ value, set }) => { if (sources.has(value)) set(sources.get(value)!); });
    delete imported.assets; delete expected.assets;
    assert.deepEqual(imported, expected);
    assert.deepEqual(validateStory(imported), []);
  } finally { globalThis.fetch = originalFetch; }
});

await test('HD library and export read through bounded cursors, never a giant getAll IPC response', async () => {
  const storeGetAll = IDBObjectStore.prototype.getAll, indexGetAll = IDBIndex.prototype.getAll;
  IDBObjectStore.prototype.getAll = IDBIndex.prototype.getAll = () => { throw new Error('unbounded bulk media read'); };
  try {
    const own = await loadAssets(S.id), all = await loadAllAssets('image'), exported = await loadStoryAssetsForExport(S);
    assert.equal(own.length, 83); assert.ok(all.length >= own.length); assert.equal(exported.length, own.length);
    assert.ok(own.every(a => a.dataUrl.startsWith('data:image/')));
  } finally { IDBObjectStore.prototype.getAll = storeGetAll; IDBIndex.prototype.getAll = indexGetAll; }
});

console.log(`Blade Runner tests: ${passed} passed${process.exitCode ? " (failures above)" : ""}`);
