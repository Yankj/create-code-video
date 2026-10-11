import {useLayoutEffect} from 'react';
import {cancelRender,continueRender,delayRender} from 'remotion';
import {measureLayout,validateLayout} from './layout-contract.mjs';
import {DESIGN,LAYOUT_RULES} from './layout.mjs';
export function useLayoutAudit(root:React.RefObject<HTMLDivElement|null>,frame:number,probe:boolean){
  useLayoutEffect(()=>{
    const handle=delayRender('Fonts ready and measured layout checked');
    let active=true;
    document.fonts.ready.then(()=>{
      if(!active||!root.current)return;
      const snapshot=measureLayout(root.current,{w:DESIGN.width,h:DESIGN.height});
      const result=validateLayout(snapshot,LAYOUT_RULES);
      if(probe||!result.passed)console.info('__CCV_LAYOUT__'+JSON.stringify({frame,...result,...snapshot}));
      if(!result.passed){cancelRender(new Error('Layout contract: '+result.errors.join('; ')));return;}
      continueRender(handle);
    }).catch(error=>{if(active)cancelRender(error);});
    return ()=>{active=false;continueRender(handle);};
  },[root,frame,probe]);
}
