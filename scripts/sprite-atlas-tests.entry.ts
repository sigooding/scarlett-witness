import assert from 'node:assert/strict';
import { spriteAtlasPlan } from '../src/studio/spriteAtlas';
import { applyKey, spriteIslands } from '../src/studio/spriteForge';
import { hasDiagonalWalk, stageDirection, stageDirectionAnimation } from '../src/game/stageFacing';
import { sheetAnim, sheetFrameAt, type SpriteSheet } from '../src/game/spriteSheet';
import { validateStory } from '../src/logic';
import type { Story } from '../src/types';

let passed = 0;
function test(name: string, run: () => void) { try { run(); passed++; console.log(`  ✔ ${name}`); } catch (e) { console.error(`  ✖ ${name}`, e); process.exitCode = 1; } }
const old: SpriteSheet = { image: 'old.png', frameWidth: 40, frameHeight: 80, animations: { idle: { frames: [0] }, walk: { frames: [0,1,2,3], fps: 7 } } };
const bank = { id: 'base', image: 'a.png', frameWidth: 40, frameHeight: 80, imageWidth: 160, imageHeight: 80, animations: old.animations };

test('atlas preserves all clip timing/loop flags and offsets the added bank', () => {
  const p = spriteAtlasPlan([bank, { ...bank, id: 'actions', frameWidth: 80, imageWidth: 160, animations: { duck: { frames: [1,0], fps: 3, loop: false } } }]);
  assert.equal(p.frameWidth, 80); assert.equal(p.frameHeight, 80); assert.equal(p.frameCount, 6);
  assert.deepEqual(p.animations.walk, old.animations.walk);
  assert.deepEqual(p.animations.duck, { frames: [5,4], fps: 3, loop: false });
  assert.deepEqual(p.ranges.actions, { first: 4, count: 2 }); assert.equal(p.padding, 0);
  assert.deepEqual(old.animations.walk.frames, [0,1,2,3], 'original data not mutated');
});
test('atlas uses a common canvas height, centres narrow banks and respects multi-row source coordinates', () => {
  const p = spriteAtlasPlan([{ ...bank, frameCount: 4, imageWidth: 80, imageHeight: 160 }, { ...bank, id: 'large', frameWidth: 100, frameHeight: 160, imageWidth: 100, imageHeight: 160, animations: undefined }], 80);
  assert.equal(p.frameWidth, 50); assert.equal(p.placements[0].x, 5);
  assert.equal(p.placements[2].sx, 0); assert.equal(p.placements[2].sy, 80);
  assert.equal(p.placements[4].height, 80); assert.equal(p.placements[4].width, 50);
  assert.equal(p.placements[4].y % 80, 0);
});
test('22-frame HD bank gets a complete, bounded atlas rather than a clipped long strip', () => {
  const p = spriteAtlasPlan([{ ...bank, frameWidth: 316, frameHeight: 704, imageWidth: 316 * 22, imageHeight: 704, frameCount: 22, animations: undefined }]);
  assert.equal(p.columns, 11); assert.equal(p.rows, 2); assert.equal(p.padding, 0);
  assert.ok(p.width <= 8192 && p.height <= 8192);
  assert.equal(p.placements[21].x, 10*316); assert.equal(p.placements[21].y, 704);
});
test('invalid banks, duplicate clip names and out-of-range indices fail without mutating input', () => {
  for (const banks of [[], [bank, bank], [{ ...bank, frameCount: 9 }], [{ ...bank, frameWidth: 0 }], [{ ...bank, animations: { bad: { frames: [-1] } } }], [bank, { ...bank, id: 'other' }]]) assert.throws(() => spriteAtlasPlan(banks));
  assert.throws(() => spriteAtlasPlan([bank], Infinity));
  assert.throws(() => spriteAtlasPlan([{ ...bank, frameWidth: 9000, imageWidth: 9000, frameCount: 1, animations: undefined }]));
});
test('ordinary four-way headings remain unchanged; zero vectors preserve last facing', () => {
  assert.equal(hasDiagonalWalk(old), false);
  assert.equal(stageDirection(1,1,'left'), 'right'); assert.equal(stageDirection(1,-4), 'up');
  assert.equal(stageDirection(0,0,'up-left',true), 'up-left'); assert.equal(stageDirection(NaN,3,'down'), 'down');
  assert.deepEqual(stageDirectionAnimation(old,'left',true), { anim: 'walk', fallbacks: ['idle'], flip: true });
});
test('eight-way sectors recognise diagonals without stealing mostly-horizontal or vertical motion', () => {
  assert.equal(stageDirection(1,-1,'right',true), 'up-right'); assert.equal(stageDirection(-1,1,'right',true), 'down-left');
  assert.equal(stageDirection(1,.1,'right',true), 'right'); assert.equal(stageDirection(-.1,-1,'right',true), 'up');
  assert.equal(hasDiagonalWalk({ ...old, animations: { ...old.animations, 'walk-up-right': { frames: [1] } } }), true);
});
test('explicit left art is never double-mirrored; missing left diagonal mirrors the right bank', () => {
  const s = { ...old, animations: { ...old.animations, 'walk-left': { frames: [2] }, 'walk-up-right': { frames: [1,3] } } };
  assert.equal(stageDirectionAnimation(s,'left',true).flip, false);
  assert.equal(stageDirectionAnimation(s,'left',true).anim, 'walk-left');
  assert.deepEqual(stageDirectionAnimation(s,'up-left',true), { anim: 'walk-up-right', fallbacks: ['idle'], flip: true });
});
test('missing diagonal art falls back to vertical, then legacy; walk-only sheets freeze at rest with correct facing', () => {
  const s = { ...old, animations: { 'walk-left': { frames: [2,3] }, 'walk-up': { frames: [1,0] } } };
  assert.equal(stageDirectionAnimation(s,'up-right',true).anim, 'walk-up');
  const idle = stageDirectionAnimation(s,'left',false);
  assert.equal(idle.anim, 'idle'); assert.equal(idle.flip, false); assert.equal(s.animations[idle.anim], undefined);
  assert.deepEqual(sheetAnim(s,idle.anim,idle.fallbacks)?.frames, [2,3]);
  assert.equal(sheetFrameAt({ frames: [4,5], fps: 4, loop: false }, 50), 5);
});
function islandsFixture() {
  const width=22,height=18,data=new Uint8ClampedArray(width*height*4);
  const rect=(x:number,y:number,w:number,h:number,color:number[]) => { for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)data.set([...color,255],(yy*width+xx)*4); };
  rect(2,2,5,8,[200,0,0]); rect(2,10,10,3,[200,0,0]); // left body and extended foot
  rect(14,2,5,11,[0,0,200]); rect(10,3,9,3,[0,0,200]); // right body and extended arm
  rect(21,0,1,1,[0,200,0]); // border speck, not a pose
  return {width,height,data};
}
test('island slicing separates overlapping x-projections without clipped limbs or neighbour fragments', () => {
  const frames = spriteIslands(islandsFixture(),2); assert.equal(frames.length,2);
  assert.equal(frames[0].w,10); assert.equal(frames[1].x,10);
  for (let f=0;f<2;f++) for(let p=0;p<frames[f].data.length;p+=4) if(frames[f].data[p+3]) assert.equal(frames[f].data[p+(f?0:2)],0,'no pixels belonging to neighbour');
  assert.equal(frames[0].data[(1*10+9)*4+3],0,'bounding-box overlap does not import the other arm');
  assert.equal(frames[0].data[(9*10+9)*4+3],255,'own extended foot retained');
});
test('island auto count ignores specks; impossible counts and touching actors are not silently invented', () => {
  const image = islandsFixture(); assert.equal(spriteIslands(image).length,2);
  assert.deepEqual(spriteIslands(image,3),[]); assert.deepEqual(spriteIslands(image,1),[]);
  // Connect the two bodies at the top: the tool cannot reconstruct occlusion.
  for(let x=6;x<15;x++) image.data.set([100,100,100,255],(2*image.width+x)*4);
  assert.deepEqual(spriteIslands(image,2),[]);
});
test('flat RGB key preserves dark brown props, while the default still clears shadowed magenta', () => {
  const original = globalThis.ImageData;
  globalThis.ImageData = class { data: Uint8ClampedArray; width:number; height:number; constructor(data:Uint8ClampedArray,width:number,height:number) { this.data=data;this.width=width;this.height=height; } } as typeof ImageData;
  try {
    const src = new ImageData(new Uint8ClampedArray([255,0,255,255,37,7,21,255]),2,1);
    assert.equal(applyKey(src,{r:255,g:0,b:255},60,24).data[7],0);
    const flat=applyKey(src,{r:255,g:0,b:255},60,24,'flat'); assert.equal(flat.data[3],0); assert.equal(flat.data[7],255);
    assert.deepEqual(Array.from(src.data),[255,0,255,255,37,7,21,255],'source unmodified');
  } finally { globalThis.ImageData=original; }
});
test('validator reports a mistyped conversation motion instead of silently claiming it animates', () => {
  const story = { id:'atlas-test', title:'Atlas', startSceneId:'s', characters:[], items:[], flags:{}, scenes:[{ id:'s',title:'Room',prose:'',nodeType:'stage',isEnding:true,dialogueBeats:[],choices:[],hotspots:[],stage:{ npcs:[{id:'actor',x:50,y:80,sheet:old,talkAnim:'typo'}] } }] } as Story;
  assert.ok(validateStory(story).some(i=>/conversation motion "typo"/.test(i.message)));
  story.scenes[0].stage!.npcs![0].talkAnim='idle';
  assert.ok(!validateStory(story).some(i=>/conversation motion/.test(i.message)));
});
console.log(`Sprite atlas / direction regressions: ${passed} passed.`);
