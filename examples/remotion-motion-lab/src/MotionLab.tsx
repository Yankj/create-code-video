import React,{useRef} from 'react';
import {AbsoluteFill,useCurrentFrame,useVideoConfig} from 'remotion';
import {ParticleJourney} from './ParticleJourney';
import {mix,smooth,stageAt} from './motion.mjs';
import {boxStyle,CARD,DESIGN,requestY,SLOTS} from './layout.mjs';
import {useLayoutAudit} from './LayoutAudit';
const C={ink:'#0c1420',white:'#f5f2e8',mint:'#b8f4d7',orange:'#ff6c44',yellow:'#d6fa78'};
const names=['建立输入','沿因果路径交接','遮挡揭示验收','落句 · 停留'];
export type MotionLabProps={layoutProbe?:boolean;layoutFault?:'overlap'|'text'};
// Explicit typography and box sizes keep font fallback from moving the caption.
const Request:React.FC<{t:number;fault?:MotionLabProps['layoutFault']}> = ({t,fault}) => {
  const settled=smooth(t,9.8,11.3), verified=stageAt(t).verify;
  const title=fault==='text'?'这是一段故意超出卡片宽度的长文案，用来证明真实渲染检查能够阻止文字溢出':t<5?'输入正在聚合':t<11?'交接到可追踪的结果':'完成，需要证据';
  return <div data-layout-id="request" style={{position:'absolute',left:CARD.x,
    top:requestY(settled)+(fault==='overlap'?140:0),width:CARD.w,height:CARD.h,
    display:'flex',flexDirection:'column',gap:20,padding:'32px 40px',boxSizing:'border-box',
    borderRadius:28,color:C.ink,background:C.white,transform:`scale(${mix(.92,1,settled)})`,
    transformOrigin:'50% 100%',boxShadow:'0 14px 36px #0004'}}>
    <div data-layout-id="request-header" style={{display:'flex',alignItems:'center',gap:20,height:64,flexShrink:0}}>
      <svg width="60" height="64" viewBox="0 0 66 72" style={{flexShrink:0}}><rect x="9" y="5" width="48" height="62" rx="9" fill={C.yellow} stroke={C.ink} strokeWidth="3"/><path d="M20 25h26M20 35h18M20 45h23" stroke={C.ink} strokeWidth="3"/></svg>
      <div data-layout-id="request-label" data-layout-text style={{width:330,height:54,flexShrink:0,fontSize:34,lineHeight:'54px',fontWeight:700,whiteSpace:'nowrap'}}>同一份委托</div>
      <div data-layout-id="request-meta" data-layout-text style={{width:180,height:40,flexShrink:0,marginLeft:'auto',fontSize:23,lineHeight:'40px',textAlign:'right',fontFamily:'monospace',color:'#54606b'}}>ID / 001</div>
    </div>
    <div data-layout-id="request-title" data-layout-text style={{height:68,flexShrink:0,
      fontSize:44,lineHeight:'64px',fontWeight:800,whiteSpace:'nowrap'}}>{title}</div>
    <div style={{height:2,flexShrink:0,background:'#d7d8ce'}}/>
    <div data-layout-id="checklist" style={{display:'flex',flexDirection:'column',gap:12,height:156,flexShrink:0}}>
      {['身份保持','路径可追踪','结果可验收'].map((label,i)=> <div key={label} style={{display:'flex',gap:20,
        height:44,alignItems:'center',fontSize:31,lineHeight:'44px',color:t>=11?C.ink:'#708079'}}>
        <div style={{width:32,height:32,boxSizing:'border-box',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
          borderRadius:8,border:'2px solid #789088',background:i<2||verified>.4?C.mint:'transparent',
          transform:`scale(${i===2?mix(.9,1,verified):1})`}}>{i<2||verified>.4?<svg width="24" height="24" viewBox="0 0 26 26"><path d="m5 13 5 5 11-12" fill="none" stroke={C.ink} strokeWidth="3"/></svg>:null}</div>
        <span data-layout-id={`check-${i}`} data-layout-text style={{width:650,height:44,whiteSpace:'nowrap'}}>{label}</span>
      </div>)}
    </div>
  </div>;
};
export const MotionLab:React.FC<MotionLabProps>=({layoutProbe=false,layoutFault})=>{
  const frame=useCurrentFrame(),{fps,width,height}=useVideoConfig(),t=frame/fps;
  if(Math.abs(width/height-DESIGN.width/DESIGN.height)>.001)throw new Error('This design supports 9:16. Reflow for another aspect ratio.');
  const plane=useRef<HTMLDivElement>(null);
  useLayoutAudit(plane,frame,layoutProbe);
  const stage=t<5?0:t<11?1:t<15?2:3;
  const headline=t<5?['散落的信息','如何成为结果？']:t<11?['镜头沿着','因果关系前进']:t<15?['完成不是变绿','而是有证据']:['运动，','服务于理解。'];
  const curtain=smooth(t,10.55,10.95)-smooth(t,11.05,11.45);
  return <AbsoluteFill style={{background:C.ink,color:C.white,fontFamily:'"PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif'}}>
    <div ref={plane} data-layout-root style={{position:'absolute',width:DESIGN.width,height:DESIGN.height,
      transform:`scale(${width/DESIGN.width})`,transformOrigin:'0 0'}}>
      <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 48%,#153846 0%,#0c1420 66%)'}}/>
      <ParticleJourney viewport={SLOTS.visual}/>
      <div data-layout-id="eyebrow" data-layout-text style={{...boxStyle(SLOTS.eyebrow),fontFamily:'monospace',fontSize:24,lineHeight:'38px',letterSpacing:3,color:C.mint,whiteSpace:'nowrap'}}>CREATE CODE VIDEO / MOTION LAB</div>
      <div data-layout-id="headline" data-layout-text style={{...boxStyle(SLOTS.headline),paddingTop:10,boxSizing:'border-box',fontSize:80,lineHeight:'100px',fontWeight:850,letterSpacing:-2,whiteSpace:'nowrap'}}>
        {headline[0]}<br/><span style={{color:stage===3?C.yellow:C.orange}}>{headline[1]}</span>
      </div>
      <div data-layout-id="stage" data-layout-text style={{...boxStyle(SLOTS.stage),fontSize:29,lineHeight:'44px',color:'#92a9b6',whiteSpace:'nowrap'}}>{names[stage]}</div>
      <Request t={t} fault={layoutFault}/>
      <div data-layout-id="caption" data-layout-text style={{...boxStyle(SLOTS.caption),fontSize:39,lineHeight:'64px',fontWeight:650,
        whiteSpace:'nowrap',opacity:smooth(t,.3,.8)}}><span style={{color:C.yellow}}>{stage===0?'粒子是输入':stage===1?'相机是叙事':stage===2?'转场有理由':'结尾留出空间'}</span><br/>
        {stage===0?'固定种子，按绝对时间聚合。':stage===1?'从动作抵达结果，然后落定。':stage===2?'同一个对象，进入新的状态。':'收束之后，停留。'}</div>
      <div data-layout-id="progress" style={{...boxStyle(SLOTS.progress),background:'#31424e'}}><div style={{width:`${frame/539*100}%`,height:3,background:C.mint}}/></div>
      <div data-layout-id="footer" data-layout-text style={{...boxStyle(SLOTS.footer),fontSize:19,lineHeight:'32px',fontFamily:'monospace',color:'#728c9b',whiteSpace:'nowrap'}}>PROCEDURAL VISUALS · 18s · SILENT DEMO</div>
      {curtain>0?<AbsoluteFill style={{background:C.orange,clipPath:`polygon(0 0,${curtain*120}% 0,${curtain*120-20}% 100%,0 100%)`}}/>:null}
    </div>
  </AbsoluteFill>;
};
