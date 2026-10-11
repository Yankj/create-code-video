import test from 'node:test';
import assert from 'node:assert/strict';
import gsapPackage from 'gsap/dist/gsap.js';
import {buildTimeline} from './timeline.mjs';
const {gsap}=gsapPackage;
test('paused finite timeline returns the same state after backward seek',()=>{
  const state={x:80,scale:.9,verified:0,closing:0};
  const tl=buildTimeline(gsap,state);
  assert.equal(tl.duration(),5.2); // root data-duration=6 owns the final hold
  tl.seek(3);const a={x:state.x,scale:state.scale,verified:state.verified,closing:state.closing};
  tl.seek(6);assert.equal(state.closing,1);assert.equal(state.verified,1);
  tl.seek(0);assert.equal(state.x,80);assert.equal(state.closing,0);
  tl.seek(3);assert.deepEqual({x:state.x,scale:state.scale,verified:state.verified,closing:state.closing},a);
  tl.kill();gsap.ticker.sleep();
});
