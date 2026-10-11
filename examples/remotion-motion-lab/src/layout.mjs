// Coordinates share one design plane. Other aspect ratios require reflow.
export const DESIGN = Object.freeze({width:1080,height:1920});
export const SLOTS = Object.freeze({
  eyebrow:{x:96,y:102,w:888,h:38}, headline:{x:96,y:222,w:888,h:224},
  stage:{x:96,y:470,w:888,h:44}, visual:{x:0,y:530,w:1080,h:580},
  caption:{x:96,y:1600,w:888,h:150}, progress:{x:96,y:1810,w:888,h:3},
  footer:{x:96,y:1840,w:888,h:32},
});
export const CARD = Object.freeze({x:96,w:888,h:420,gap:72,settledY:860});
export const requestY = progress => {
  const start = SLOTS.caption.y - CARD.gap - CARD.h;
  return start + (CARD.settledY-start)*progress;
};
/** @param {{x:number,y:number,w:number,h:number}} box
 * @returns {{position:'absolute',left:number,top:number,width:number,height:number}} */
export const boxStyle = box => ({position:'absolute',left:box.x,top:box.y,width:box.w,height:box.h});
export const LAYOUT_RULES = Object.freeze({
  // Clearance includes shadow space. Decorative layers may overlap on purpose.
  clearances:[{above:'request',below:'caption',min:CARD.gap}],
  containment:[{parent:'request',children:['request-header','request-title','request-label','request-meta','checklist'],inset:24}],
  safe:['eyebrow','headline','stage','request','caption','progress','footer'],
  tolerance:2,
});
