import test from 'node:test';
import assert from 'node:assert/strict';
import {CARD,DESIGN,requestY,SLOTS,LAYOUT_RULES} from '../src/layout.mjs';
import {validateLayout} from '../src/layout-contract.mjs';
const snapshot=()=>({viewport:{w:DESIGN.width,h:DESIGN.height},boxes:{
  ...Object.fromEntries(Object.entries(SLOTS).map(([k,v])=>[k,{x:v.x,y:v.y,w:v.w,h:v.h}])),
  request:{x:CARD.x,y:requestY(0),w:CARD.w,h:CARD.h},
  'request-header':{x:136,y:1140,w:808,h:64},
  'request-label':{x:216,y:1145,w:330,h:54},
  'request-meta':{x:764,y:1152,w:180,h:40},
  'request-title':{x:136,y:1232,w:808,h:54},
  checklist:{x:136,y:1344,w:808,h:148}},texts:[]});
test('Layout contract detects the reported bottom-card regression',()=>{
  const s=snapshot();
  assert.equal(validateLayout(s,LAYOUT_RULES).passed,true);
  s.boxes.request={x:131.52,y:1217.6,w:816.96,h:435};
  assert.match(validateLayout(s,LAYOUT_RULES).errors.join('\n'),/request\/caption: gap/);
});
test('Every card animation position keeps the protected caption clearance',()=>{
  for(let i=0;i<=100;i++)assert.ok(SLOTS.caption.y-requestY(i/100)-CARD.h>=CARD.gap);
});
test('Text overflow and glyph bounds are checked, not silently clipped',()=>{
  const s=snapshot();
  s.texts=[{id:'request-title',overflowX:18,overflowY:0,ink:null}];
  assert.match(validateLayout(s,LAYOUT_RULES).errors.join('\n'),/text overflow/);
  s.texts=[{id:'request-title',overflowX:0,overflowY:0,ink:{x:100,y:1232,w:860,h:54}}];
  assert.match(validateLayout(s,LAYOUT_RULES).errors.join('\n'),/glyphs outside/);
});
