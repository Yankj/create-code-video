// Pure rules plus measured DOM geometry, portable to other capture frameworks.
export function validateLayout(snapshot, rules) {
  const errors=[], b=snapshot.boxes, tolerance=rules.tolerance??2;
  const inside=(child,parent,inset=0)=>child.x>=parent.x+inset-tolerance &&
    child.y>=parent.y+inset-tolerance && child.x+child.w<=parent.x+parent.w-inset+tolerance &&
    child.y+child.h<=parent.y+parent.h-inset+tolerance;
  for(const id of rules.safe){
    if(!b[id])errors.push(`Missing box: ${id}`);
    else if(!inside(b[id],{x:0,y:0,...snapshot.viewport}))errors.push(`${id}: outside viewport`);
  }
  for(const {above,below,min} of rules.clearances){
    if(!b[above]||!b[below]){errors.push(`Missing clearance pair: ${above}/${below}`);continue;}
    const gap=b[below].y-b[above].y-b[above].h;
    if(gap<min-tolerance)errors.push(`${above}/${below}: gap ${gap.toFixed(1)} < ${min}`);
  }
  for(const {parent,children,inset} of rules.containment){
    for(const id of children){
      if(!b[id]||!b[parent])errors.push(`Missing containment: ${parent}/${id}`);
      else if(!inside(b[id],b[parent],inset))errors.push(`${id}: outside ${parent} content area`);
    }
  }
  for(const text of snapshot.texts){
    if(text.overflowX>tolerance||text.overflowY>tolerance)
      errors.push(`${text.id}: text overflow (${text.overflowX.toFixed(1)}, ${text.overflowY.toFixed(1)})`);
    if(text.ink&&!inside(text.ink,b[text.id]))errors.push(`${text.id}: glyphs outside text slot`);
  }
  return {passed:errors.length===0,errors};
}
export function measureLayout(root, viewport) {
  const r=root.getBoundingClientRect(), sx=viewport.w/r.width, sy=viewport.h/r.height;
  const convert=rect=>({x:(rect.x-r.x)*sx,y:(rect.y-r.y)*sy,w:rect.width*sx,h:rect.height*sy});
  const boxes={}, texts=[];
  for(const el of root.querySelectorAll('[data-layout-id]')){
    const id=el.getAttribute('data-layout-id');
    boxes[id]=convert(el.getBoundingClientRect());
    if(el.hasAttribute('data-layout-text')){
      const range=document.createRange();range.selectNodeContents(el);
      const rect=range.getBoundingClientRect();
      const localScale=boxes[id].w/el.clientWidth;
      texts.push({id,overflowX:Math.max(0,el.scrollWidth-el.clientWidth)*localScale,
        overflowY:Math.max(0,el.scrollHeight-el.clientHeight)*localScale,
        ink:rect.width&&rect.height?convert(rect):null});
    }
  }
  return {viewport:{w:viewport.w,h:viewport.h},boxes,texts};
}
