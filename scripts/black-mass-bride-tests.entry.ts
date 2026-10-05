/** Story + portable-media regressions. Uses the real engine and IndexedDB;
 * browser tests separately prove all four endings through real controls. */
import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { BLACK_MASS_BRIDE as story } from '../src/data/blackMassBride';
import { createInitialState, validateStory } from '../src/logic';
import { initialSim, availableDecisions, applyDecision, isStuck, type Decision } from '../src/game/decisions';
import { visitStoryMediaFields, type StoryMediaField } from '../src/data/storyMedia';
import { bundleStoryFileRefs, createPortableStoryBundle } from '../src/studio/exportBundle';
import { collectStoryAssetIds, collectStoryMediaRefs, compactStoryMedia, importStoryAssets, resolveStoryMedia } from '../src/data/mediaLibrary';
import { assetUrl } from '../src/assetPath';
import type { Story } from '../src/types';

let passed = 0;
const test = async (name: string, run: () => void | Promise<void>) => {
  try { await run(); passed++; console.log(`  ✔ ${name}`); }
  catch (error) { console.error(`  ✖ ${name}`, error); process.exitCode = 1; }
};
const id = (s: string) => `bmb_${s}`;
const choicesCovered = new Set<string>();
const scenesCovered = new Set<string>();
class Run {
  sim = initialSim(story, createInitialState(story));
  available() { return availableDecisions(story, this.sim); }
  take(matches: (d: Decision) => boolean, label: string) {
    const d = this.available().find(matches);
    assert.ok(d, `${this.sim.sceneId}: cannot take ${label}; available: ${this.available().map((x) => x.label).join(' | ')}`);
    if (d.kind === 'choice') choicesCovered.add(d.choiceId);
    scenesCovered.add(this.sim.sceneId);
    this.sim = applyDecision(story, this.sim, d).sim;
    scenesCovered.add(this.sim.sceneId);
    assert.equal(isStuck(story, this.sim), false, `${label} strands player`);
  }
  choice(key: string) { this.take((d) => d.kind === 'choice' && d.choiceId === id(key), key); }
  marker(key: string) { this.take((d) => d.kind === 'hotspot' && d.hotspotId === id(key) && !d.verb, key); }
  canChoose(key: string) { return this.available().some((d) => d.kind === 'choice' && d.choiceId === id(key)); }
  flag(key: string) { return this.sim.state.activeFlags.has(id(key)); }
  has(key: string) { return this.sim.state.inventory.some((i) => i.id === id(key)); }
  at(key: string) { assert.equal(this.sim.sceneId, id(key)); }
}

type Route = { end: 'gold' | 'silver' | 'framed' | 'caught'; full?: boolean; alarm?: 'hook' | 'shovel' | 'call'; mistakes?: boolean; trap?: boolean; omit?: 'backup' | 'pat' | 'motive' };
function route(config: Route) {
  const r = new Run(); const full = !!config.full;
  r.choice('begin'); r.choice('answer'); r.choice(config.mistakes ? 'hide_dream' : 'share_dream');
  assert.equal(r.canChoose('file_truth'), false);
  r.marker('take_plan');
  assert.equal(r.available().some((d) => d.kind === 'hotspot' && d.hotspotId === id('leave_for_office')), false);
  if (full) {
    r.marker('take_wire'); r.marker('test_bell'); r.marker('ask_arthur');
    r.take((d) => d.kind === 'stage-convo-end', 'finish Arthur conversation');
    assert.equal(r.available().some((d) => d.kind === 'hotspot' && d.hotspotId === id('ask_arthur')), false, 'Arthur reward is one-shot');
  }
  r.marker('enter_chamber'); r.marker('drapes');
  if (full) {
    r.marker('glove_pickup'); r.marker('lamp');
    r.take((d) => d.kind === 'combine', 'wire + glove');
    assert.ok(r.has('hook')); assert.ok(!r.has('wire') && !r.has('glove'));
  }
  r.marker('back_library');
  // Room revisits cannot spend exits, and consumed ingredients cannot lock
  // the essential office gate, which correctly depends on enduring flags.
  r.marker('enter_chamber'); r.marker('back_library');
  r.marker('leave_for_office'); r.choice('office_investigate'); r.marker('save_envelope');
  if (full) { r.marker('take_news'); r.marker('take_roster'); }
  r.marker('visit_oleary'); r.choice(config.mistakes ? 'withhold_police' : 'tell_police'); r.choice('garden_search');
  if (full) { r.marker('scarf_pickup'); r.marker('key_ledger'); }
  r.marker('question_peters');
  if (full) {
    r.take((d) => d.kind === 'press-lie' && !d.correct, 'wrong evidence is recoverable');
    assert.equal(r.flag('peters_lie'), false);
    r.take((d) => d.kind === 'press-lie' && d.correct, 'scarf breaks the lie');
    assert.ok(r.flag('peters_lie'));
    r.take((d) => d.kind === 'deduction' && d.flagSet === id('transport'), 'scarf + Peters');
  }
  r.choice('peters_back'); r.marker('question_peters'); r.choice('peters_back'); r.marker('phone_office');
  if (config.end === 'framed') { r.choice('surrender'); r.at('framed'); return; }
  r.choice(config.mistakes ? 'blurt' : 'decode');
  if (config.mistakes) r.choice('recover_code');
  r.choice(config.mistakes ? 'rest' : 'stay_alert');
  if (config.mistakes) r.choice('wake_up');
  r.at('apartment');
  if (full) {
    r.take((d) => d.kind === 'minigame' && !d.won, 'wrong archive submission');
    assert.ok(!r.has('archive') && !r.flag('archive_found'));
    r.take((d) => d.kind === 'minigame' && d.won, 'retry archive with both records');
    assert.ok(r.has('archive') && r.flag('archive_found'));
    assert.equal(r.available().some((d) => d.kind === 'minigame'), false, 'solved archive becomes a review, not another reward');
    if (config.omit !== 'motive') r.take((d) => d.kind === 'deduction' && d.flagSet === id('motive'), 'archive + Peters');
    if (config.omit !== 'pat') r.marker('bolt_door');
  }
  r.marker('radio_bulletin');
  if (full && config.omit !== 'backup') r.marker('backup_call');
  r.marker('fire_escape'); assert.ok(r.has('shovel'), 'every return route grants the alarm tool');
  r.choice(r.flag('backup') ? 'patrol_truth' : 'janitor_bluff');
  r.choice(config.trap ? 'library_entry' : 'garden_entry');
  if (config.trap) r.choice('trap_continue');
  if (config.end === 'caught') { r.choice('rush_captor'); r.at('caught'); return; }
  if (full) r.take((d) => d.kind === 'deduction' && d.flagSet === id('plant'), 'key ledger + Mrs. Peters');
  r.choice(r.flag('motive') ? 'make_case' : 'save_people');
  r.choice(config.alarm === 'hook' ? 'hook_alarm' : config.alarm === 'call' ? 'call_patrol' : 'shovel_alarm');
  assert.equal(r.canChoose('file_truth'), full && !config.omit, 'gold requires proof + backup + protected Pat');
  r.choice(config.end === 'gold' ? 'file_truth' : 'choose_living'); r.at(config.end);
  assert.equal(r.available().length, 0, 'endings are terminal');
}

await test('authored story has zero errors AND warnings; scene, ending and room counts', () => {
  assert.deepEqual(validateStory(story), []);
  assert.equal(story.scenes.length, 26);
  assert.equal(story.scenes.filter((s) => s.nodeType === 'stage').length, 5);
  assert.equal(story.scenes.filter((s) => s.isEnding).length, 4);
  for (const s of story.scenes) {
    assert.ok((s.cinematic?.dimAmount ?? 0) < 1, `${s.id} must not black out its art`);
    for (const c of s.choices) assert.ok(!c.quickTime && !c.timeLimitSeconds, 'read at your own pace');
  }
});
for (const [name, config] of Object.entries({
  'gold: crafted bell-hook rescue': { end: 'gold', full: true, alarm: 'hook' },
  'gold: secrecy, wrong code, exhaustion and ambush are repairable': { end: 'gold', full: true, alarm: 'shovel', mistakes: true, trap: true },
  'gold: called patrol is an independent alarm': { end: 'gold', full: true, alarm: 'call' },
  'silver: no optional clues, crafting, backup or puzzle': { end: 'silver', mistakes: true, trap: true },
  'silver remains a valid choice even with a complete case': { end: 'silver', full: true },
  'framed: premature surrender': { end: 'framed' },
  'caught: explicitly reckless rush': { end: 'caught' },
  'gold is gated without protected Pat': { end: 'silver', full: true, omit: 'pat' },
  'early police honesty is not a substitute for calling backup': { end: 'silver', full: true, omit: 'backup' },
  'collecting the archive is not a substitute for making the deduction': { end: 'silver', full: true, omit: 'motive' },
} as Record<string, Route>)) await test(name, () => route(config));
await test('deterministic routes cover every authored scene and choice', () => {
  assert.deepEqual([...scenesCovered].sort(), story.scenes.map((s) => s.id).sort());
  assert.deepEqual([...choicesCovered].sort(), story.scenes.flatMap((s) => s.choices.map((c) => c.id)).sort());
});
await test('Studio catches a fully black image and invalid fitted-room ratios', () => {
  const copy = structuredClone(story); copy.scenes[0].cinematic!.dimAmount = 1;
  assert.ok(validateStory(copy).some((i) => /dims its image completely/.test(i.message)));
  const stage = copy.scenes.find((s) => s.stage)!;
  for (const bad of [0, -1, NaN, Infinity, 10]) {
    stage.stage!.plateAspectRatio = bad;
    assert.ok(validateStory(copy).some((i) => i.severity === 'error' && /aspect ratio/.test(i.message)));
  }
});

/** Independent manifest: generated when ASSIGNING fields, not by the walker
 * under test. A missing nested field therefore fails the path-count assertion. */
function mediaFixture() {
  const paths = new Set<string>();
  const file = (label: string, ext = 'svg') => { const url = `/portable/${label}.${ext}`; paths.add(url); return url; };
  const shared = file('shared', 'webp');
  const sheet = (label: string) => ({ image: file(label, 'png'), frameWidth: 32, frameHeight: 32, animations: { idle: { frames: [0] } } });
  const cine = (label: string) => ({ foregroundImage: file(`${label}-fg`), foregroundAnimation: { frames: [file(`${label}-anim`)] }, foregroundExtras: [{ image: file(`${label}-extra`), sheet: sheet(`${label}-sheet`) }], parallaxLayers: [{ image: file(`${label}-parallax`) }] });
  const beat = (label: string) => ({ id: label, characterId: 'narrator', text: '/portable/prose-must-not-change.svg', audioUrl: file(`${label}-voice`, 'mp3'), background: file(`${label}-bg`), cinematic: cine(label) });
  const base = {
    id: 'portable-fixture', title: 'Media traversal fixture', tagline: '/portable/not-media.svg', startSceneId: 'room', coverImage: shared,
    verbMenuIcon: file('global-verb', 'avif'), playerSprite: { image: file('global-walker'), sheet: sheet('global-walker-sheet') },
    inventoryDisplay: { mode: 'container', image: file('casebook'), sheet: sheet('casebook-sheet') },
    dialogueBox: { backgroundImage: file('dialogue') }, map: { backgroundImage: file('map') },
    cursorArt: { use: { image: file('cursor'), sheet: sheet('cursor-sheet') } },
    items: [{ id: 'clue', name: 'Clue', icon: '!', iconUrl: file('clue-icon'), description: '', flavorText: '' }],
    characters: [{ id: 'person', name: 'Person', role: '', trustMeter: 0, avatarUrl: file('portrait'), talkingRest: file('rest'), talkingFrames: [file('talk')], talkingSheet: sheet('talk-sheet'), talkingSheets: [{ name: 'Coat', sheet: sheet('outfit') }] }],
    acts: [{ id: 'act', title: 'Act', startSceneId: 'room', titleCardImage: file('act') }],
    episodes: [{ id: 'episode', title: 'Episode', startSceneId: 'room', titleCardImage: file('episode'), posterImage: file('poster'), titleCardMusicUrl: file('episode-music', 'wav'), recapLines: [{ text: '', image: file('recap') }] }],
    scenes: [{ id: 'room', title: 'Room', background: `video:${file('scene', 'mp4')}`, musicUrl: file('music', 'wav'), ambientAudio: `mp3:${file('ambience', 'mp3')}`, sceneAudioUrl: file('scene-cue', 'ogg'), narrationAudioUrl: file('narration', 'mp3'), prose: shared,
      cinematic: cine('scene'), credits: { montage: [shared, file('montage')] }, choices: [{ id: 'drive', text: 'Drive', ride: { vehicleImage: file('ride-vehicle'), roadImage: file('ride-road'), horizonImage: file('ride-horizon'), dashboardImage: file('ride-dashboard'), crashImage: file('ride-crash'), traffic: [file('ride-traffic'), 'emoji:🚗'], driverSheet: sheet('ride-driver') } }],
      stage: { playerImage: file('local-player'), playerSheet: sheet('local-player-sheet'), walkFrames: [file('walk-frame')], objectMenuIcon: file('local-verb'), npcs: [{ id: 'npc', image: file('npc'), sheet: sheet('npc-sheet') }], quake: { wallTexture: file('wall'), floorTexture: file('floor'), handImage: file('hand'), props: { barrel: `${file('barrel')}@0.75`, lamp: `${file('lamp')}@2`, emoji: 'emoji:🌲@2' } } },
      hotspots: [{ id: 'object', label: 'Object', cursor: 'use', bounds: { x: 0, y: 0, w: 20, h: 20 }, image: file('object'), sheet: sheet('object-sheet'), itemAudio: { clue: file('item-reply', 'mp3') },
        action: { type: 'startDialogue', audioUrl: file('action', 'mp3'), sfxUrl: file('action-sfx', 'wav'), arcadeGame: { cabinetImage: file('cabinet') }, topics: [{ id: 'topic', label: 'Topic', beats: [beat('topic')] }], then: [{ type: 'showText', sfxUrl: file('chain', 'wav'), then: [{ type: 'showText', audioUrl: file('deep-chain', 'mp3') }] }] },
        verbs: { look: { type: 'showText', audioUrl: file('verb-line', 'mp3'), topics: [{ id: 'verb-topic', label: 'Verb topic', beats: [beat('verb-topic')] }] } },
        states: [{ id: 'state', image: file('state'), action: { type: 'showText', audioUrl: file('state-voice', 'mp3'), sfxUrl: file('state-sfx', 'wav'), topics: [{ id: 'state-topic', label: 'State topic', beats: [beat('state-topic')] }] } }],
      }],
      dialogueBeats: [{ ...beat('main-beat'), lie: { evidenceItemIds: ['clue'], contradictedFlag: 'truth', caughtBeat: beat('caught'), wrongBeat: beat('wrong') } }],
      interrogation: { brokeBeat: beat('broke'), clampedBeat: beat('clamped') },
    }],
  } as unknown as Story;
  return { story: base, paths };
}
const originalFetch = globalThis.fetch;
const mockFetch = (fn: (url: string, init?: RequestInit) => Response | Promise<Response>) => {
  globalThis.fetch = ((url: string | URL | Request, init?: RequestInit) => fn(String(url), init)) as typeof fetch;
};

await test('schema-complete portable export: nested beats, states, chains, sheets, wrappers, dedupe and no mutation', async () => {
  const f = mediaFixture(); const before = JSON.stringify(f.story); const requests: string[] = [];
  let busy = 0, peak = 0;
  mockFetch(async (url) => {
    requests.push(url); busy++; peak = Math.max(peak, busy);
    await new Promise((resolve) => setTimeout(resolve, 1)); busy--;
    return new Response(new Uint8Array([80, 78, 71, 1]), { headers: { 'content-type': 'application/octet-stream' } });
  });
  try {
    const bundle = await bundleStoryFileRefs(f.story);
    assert.deepEqual(bundle.missing, []);
    assert.equal(bundle.assets.length, f.paths.size);
    assert.deepEqual(new Set(requests), new Set([...f.paths].map(assetUrl)));
    assert.equal(requests.length, f.paths.size, 'shared paths fetched once');
    assert.ok(peak <= 4 && peak > 1, 'bounded parallel fetching');
    assert.equal(JSON.stringify(f.story), before, 'immutable snapshot');
    assert.equal(bundle.story.scenes[0].prose, f.story.scenes[0].prose, 'URL-shaped prose is not rewritten');
    assert.equal(bundle.story.tagline, '/portable/not-media.svg');
    assert.match(bundle.story.scenes[0].background, /^video:asset:/);
    assert.match(bundle.story.scenes[0].ambientAudio!, /^mp3:asset:/);
    assert.match(bundle.story.scenes[0].stage!.quake!.props!.barrel, /^asset:.*@0\.75$/);
    assert.ok(bundle.assets.some((a) => a.name.endsWith('.avif') && a.dataUrl.startsWith('data:image/avif;')));
    assert.ok(bundle.assets.some((a) => a.name.endsWith('.svg') && a.dataUrl.startsWith('data:image/svg+xml;')));
    // Genuine empty IndexedDB on the receiving side of this fixture.
    await importStoryAssets(bundle.story.id, bundle.assets);
    const resolved = await resolveStoryMedia(bundle.story);
    assert.equal(collectStoryAssetIds(resolved).size, 0);
    visitStoryMediaFields(resolved, ({ value }) => assert.match(value, /^(?:mp3:|video:)?data:/));
    assert.equal(JSON.stringify(f.story), before);
  } finally { globalThis.fetch = originalFetch; }
});

await test('deferred media setters still update Quake props without losing height suffixes', async () => {
  const f = mediaFixture(); const fields: StoryMediaField[] = [];
  visitStoryMediaFields(f.story, (field) => { if (field.label.startsWith('first-person prop')) fields.push(field); });
  await Promise.resolve();
  fields.forEach((f, i) => f.set(`asset:deferred-${i}`));
  assert.equal(f.story.scenes[0].stage!.quake!.props!.barrel, 'asset:deferred-0@0.75');
  assert.equal(f.story.scenes[0].stage!.quake!.props!.lamp, 'asset:deferred-1@2');
  assert.equal(f.story.scenes[0].stage!.quake!.props!.emoji, 'emoji:🌲@2');
});

await test('compaction uses the same schema for nested data URLs and recorded-ambience prefixes', async () => {
  const f = mediaFixture(); let n = 0;
  visitStoryMediaFields(f.story, ({ value, set, kind }) => {
    const prefix = value.startsWith('video:') ? 'video:' : value.startsWith('mp3:') ? 'mp3:' : '';
    set(`${prefix}data:${kind === 'image' ? 'image/png' : kind === 'audio' ? 'audio/mpeg' : 'video/mp4'};base64,${Buffer.from(`unique-${n++}`).toString('base64')}`);
  });
  const before = JSON.stringify(f.story);
  const compact = await compactStoryMedia(f.story);
  assert.ok(collectStoryAssetIds(compact).size > 75);
  visitStoryMediaFields(compact, ({ value }) => assert.match(value, /^(?:mp3:|video:)?asset:/));
  assert.equal(JSON.stringify(f.story), before);
  const resolved = await resolveStoryMedia(compact);
  visitStoryMediaFields(resolved, ({ value }) => assert.match(value, /^(?:mp3:|video:)?data:/));
});

await test('failed HTTP, empty files and SPA HTML fallbacks stay visible as missing media', async () => {
  const f: Story = { ...story, id: 'failures', characters: [], items: [], acts: [], scenes: [{ id: 'x', title: 'X', prose: '', background: '/404.png', choices: [], sceneAudioUrl: '/empty.wav', musicUrl: '/offline.mp3', narrationAudioUrl: '/mislabelled.svg' }], coverImage: '/fallback.svg', playerSprite: undefined, verbMenuIcon: undefined };
  mockFetch((url) => {
    if (url.endsWith('/offline.mp3')) throw new Error('offline');
    if (url.endsWith('/404.png')) return new Response('missing', { status: 404 });
    if (url.endsWith('/empty.wav')) return new Response(new Uint8Array(), { headers: { 'content-type': 'audio/wav' } });
    return new Response('<!doctype html><title>SPA fallback</title>', { headers: { 'content-type': url.endsWith('/mislabelled.svg') ? 'image/svg+xml' : 'text/html' } });
  });
  try {
    const result = await bundleStoryFileRefs(f);
    assert.equal(result.assets.length, 0); assert.equal(result.missing.length, 5);
    assert.equal(result.story.coverImage, '/fallback.svg'); assert.equal(result.story.scenes[0].background, '/404.png');
  } finally { globalThis.fetch = originalFetch; }
});

await test('existing embedded assets are retained, file URLs stripped, missing asset IDs reported', async () => {
  const f = mediaFixture(); f.story.id = 'embedded-fixture';
  visitStoryMediaFields(f.story, ({ value, set }) => set(value.startsWith('mp3:') ? 'mp3:asset:lost' : 'asset:embedded'));
  f.story.assets = [{ id: 'embedded', type: 'image', name: 'inline.png', dataUrl: 'data:image/png;base64,UE5H', size: 3, uploadedAt: 1, fileUrl: 'file:///author-only/inline.png' }];
  const result = await createPortableStoryBundle(f.story);
  assert.deepEqual(result.missing, ['asset:lost']);
  assert.equal(result.assets.length, 1); assert.equal(result.assets[0].fileUrl, undefined);
  assert.equal(f.story.assets[0].fileUrl, 'file:///author-only/inline.png');
});

await test('deployment subpaths, already-based paths and external URLs', async () => {
  assert.equal(assetUrl('/image.svg'), '/case-library/image.svg');
  assert.equal(assetUrl('/case-library/image.svg'), '/case-library/image.svg');
  assert.equal(assetUrl('https://example.invalid/image.svg'), 'https://example.invalid/image.svg');
  assert.equal(assetUrl('//cdn.invalid/image.svg'), '//cdn.invalid/image.svg');
  assert.equal(assetUrl('relative.svg'), 'relative.svg');
});

await test('all 31 shipped Black-Mass Bride media files really exist and form a portable bundle', async () => {
  const files = new Set(collectStoryMediaRefs(story).map((r) => r.value.replace(/^(?:mp3:|video:)/, '')));
  assert.equal(files.size, 31);
  for (const f of files) assert.ok(readFileSync(path.join(process.env.SCARLET_TEST_ROOT!, 'public', f)).byteLength > 0, f);
  const calls: string[] = [];
  mockFetch((url) => { calls.push(url); const relative = url.replace(/^\/case-library\//, ''); return new Response(readFileSync(path.join(process.env.SCARLET_TEST_ROOT!, 'public', relative))); });
  try {
    const bundle = await createPortableStoryBundle(story);
    assert.deepEqual(bundle.missing, []); assert.equal(bundle.assets.length, 31); assert.equal(calls.length, 31);
    assert.equal(collectStoryAssetIds(bundle.story).size, 31);
    await importStoryAssets(story.id, bundle.assets);
    const resolved = await resolveStoryMedia(bundle.story);
    assert.equal(collectStoryAssetIds(resolved).size, 0);
    assert.deepEqual(validateStory(resolved), []);
  } finally { globalThis.fetch = originalFetch; }
});

await test('missing data in an embedded library row is not reported as portable', async () => {
  const f = mediaFixture(); f.story.id = 'empty-row';
  visitStoryMediaFields(f.story, ({ set }) => set('asset:empty'));
  f.story.assets = [{ id: 'empty', type: 'image', name: 'empty.png', dataUrl: '', size: 0, uploadedAt: 1 }];
  const bundle = await createPortableStoryBundle(f.story);
  assert.deepEqual(bundle.missing, ['asset:empty']); assert.equal(bundle.assets.length, 0);
});

await test('desktop file reads use the existing scoped bridge and retain the media wrapper', async () => {
  const global = globalThis as unknown as { window?: unknown };
  const previousWindow = global.window;
  const f = mediaFixture(); f.story.id = 'desktop-bridge';
  visitStoryMediaFields(f.story, ({ set }) => set('mp3:file:///recorded/cue.wav'));
  let calls = 0;
  global.window = { scarletReelDesktop: { readVoice: async (url: string) => {
    calls++; assert.equal(url, 'file:///recorded/cue.wav');
    return { base64: Buffer.from('WAV').toString('base64'), name: 'cue.wav' };
  } } };
  try {
    const bundle = await bundleStoryFileRefs(f.story);
    assert.deepEqual(bundle.missing, []); assert.equal(calls, 1); assert.equal(bundle.assets.length, 1);
    assert.match(bundle.assets[0].dataUrl, /^data:audio\/wav;base64,/);
    visitStoryMediaFields(bundle.story, ({ value }) => assert.match(value, /^mp3:asset:/));
  } finally { if (previousWindow === undefined) delete global.window; else global.window = previousWindow; }
});

await test('stalled requests are aborted rather than leaving Export busy forever', async () => {
  const f = mediaFixture(); visitStoryMediaFields(f.story, ({ set }) => set('/stalled.svg'));
  const setTimeoutOriginal = globalThis.setTimeout;
  globalThis.setTimeout = ((fn: () => void, ms: number) => setTimeoutOriginal(fn, ms === 15_000 ? 2 : ms)) as typeof setTimeout;
  mockFetch((_url, init) => new Promise((_resolve, reject) => {
    assert.ok(init?.signal); init.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  }));
  try {
    const result = await bundleStoryFileRefs(f.story);
    assert.deepEqual(result.missing, ['/stalled.svg']); assert.equal(result.assets.length, 0);
  } finally { globalThis.fetch = originalFetch; globalThis.setTimeout = setTimeoutOriginal; }
});

await test('source-export CLI embeds the same 31 files, including all SVG evidence icons', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'bmb-cli-'));
  try {
    const out = path.join(dir, 'black-mass-bride.reel.json');
    execFileSync(process.execPath, ['scripts/export-reel.mjs', 'src/data/blackMassBride.ts', story.id, out], { cwd: process.env.SCARLET_TEST_ROOT });
    const reel = JSON.parse(readFileSync(out, 'utf8')) as Story;
    assert.equal(reel.assets?.length, 31); assert.equal(collectStoryAssetIds(reel).size, 31);
    assert.equal(reel.assets?.filter((a) => a.dataUrl.startsWith('data:image/svg+xml;')).length, 11);
    assert.equal(reel.scenes.find((s) => s.id === 'bmb_dream')!.dialogueBeats![0].text, story.scenes.find((s) => s.id === 'bmb_dream')!.dialogueBeats![0].text);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

console.log(`\nBlack-Mass Bride / portable media: ${passed} checks passed; ${scenesCovered.size} scenes, ${choicesCovered.size} choices covered deterministically.`);
