import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraAt,particleAt,particleData,stageAt} from '../src/motion.mjs';
test('independent seek has no frame history and fixed seed is repeatable',()=>{
  const data=particleData(120), repeated=particleData(120);
  assert.deepEqual(data,repeated);
  const first=Array.from({length:120},(_,i)=>particleAt(data,i,7));
  [17,0,12,2].forEach(t=>particleAt(data,0,t));
  assert.deepEqual(first,Array.from({length:120},(_,i)=>particleAt(data,i,7)));
  assert.notDeepEqual(data,particleData(120,24));
});
test('particles remain finite through boundaries and do not jump at shot cuts',()=>{
  const data=particleData(120);
  for(const t of [0,1.6,4.2,5.2,8.6,10.8,11.8,17.9667]){
    for(let i=0;i<120;i++){
      const p=particleAt(data,i,t), before=particleAt(data,i,t-1e-5);
      assert.ok(p.every(n=>Number.isFinite(n)&&Math.abs(n)<6));
      assert.ok(Math.hypot(...p.map((n,k)=>n-before[k]))<.001);
    }
  }
});
test('camera lands and closing stops adding energy',()=>{
  assert.deepEqual(cameraAt(8.6),cameraAt(17.9));
  assert.equal(stageAt(0).gather,0);
  assert.equal(stageAt(4.2).gather,1);
  assert.equal(stageAt(16).closing,1);
  assert.equal(stageAt(18).closing,1);
});
