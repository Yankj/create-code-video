export function buildTimeline(gsap, state) {
  return gsap.timeline({paused:true})
    .to(state,{x:430,scale:1,duration:1,ease:'power2.out'},.5)
    .to(state,{x:860,scale:.86,duration:1.2,ease:'power2.inOut'},2.2)
    .to(state,{verified:1,duration:.4,ease:'none'},3.8)
    .to(state,{closing:1,duration:.6,ease:'power2.out'},4.6);
}
