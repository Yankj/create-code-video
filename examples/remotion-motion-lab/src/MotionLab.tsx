import React from 'react';
import {AbsoluteFill,useCurrentFrame,useVideoConfig} from 'remotion';
import {ParticleJourney} from './ParticleJourney';
import {mix,smooth,stageAt} from './motion.mjs';

const C={ink:'#0c1420',white:'#f5f2e8',mint:'#b8f4d7',orange:'#ff6c44',yellow:'#d6fa78'};
const names=['建立输入','沿因果路径交接','遮挡揭示验收','落句 · 停留'];
// A shared screen-space request object survives every semantic shot.
const Request:React.FC<{t:number}> = ({t}) => {
  const settled=smooth(t,9.8,11.3), verified=stageAt(t).verify;
  return <div style={{position:'absolute',left:96,top:mix(1200,820,settled),width:888,
    padding:'36px 40px',boxSizing:'border-box',borderRadius:28,color:C.ink,
    background:C.white,transform:`scale(${mix(.92,1,settled)})`,boxShadow:'0 18px 70px #0004'}}>
    <div style={{display:'flex',alignItems:'center',gap:22}}>
      <svg width="66" height="72" viewBox="0 0 66 72"><rect x="9" y="5" width="48" height="62" rx="9" fill={C.yellow} stroke={C.ink} strokeWidth="3"/><path d="M20 25h26M20 35h18M20 45h23" stroke={C.ink} strokeWidth="3"/></svg>
      <div style={{fontSize:34,fontWeight:700}}>同一份委托</div>
      <div style={{marginLeft:'auto',fontSize:23,fontFamily:'monospace',color:'#54606b'}}>ID / 001</div>
    </div>
    <div style={{marginTop:22,fontSize:44,fontWeight:800}}>{t<5?'输入正在聚合':t<11?'交接到可追踪的结果':'完成，需要证据'}</div>
    <div style={{height:3,background:'#d7d8ce',margin:'26px 0'}}/>
    {['身份保持','路径可追踪','结果可验收'].map((label,i)=> <div key={label} style={{display:'flex',gap:20,
      alignItems:'center',marginTop:15,fontSize:31,color:t>=11?C.ink:'#708079'}}>
      <div style={{width:28,height:28,borderRadius:8,border:'2px solid #789088',background:i<2||verified>.4?C.mint:'transparent',
        transform:`scale(${i===2?mix(.9,1,verified):1})`}}>{i<2||verified>.4?<svg width="26" height="26" viewBox="0 0 26 26"><path d="m5 13 5 5 11-12" fill="none" stroke={C.ink} strokeWidth="3"/></svg>:null}</div>{label}
    </div>)}
  </div>;
};

export const MotionLab:React.FC=()=>{
  const frame=useCurrentFrame(),{fps}=useVideoConfig(),t=frame/fps;
  const stage=t<5?0:t<11?1:t<15?2:3;
  const headline=t<5?['散落的信息','如何成为结果？']:t<11?['镜头沿着','因果关系前进']:t<15?['完成不是变绿','而是有证据']:['运动，','服务于理解。'];
  const curtain=smooth(t,10.55,10.95)-smooth(t,11.05,11.45);
  return <AbsoluteFill style={{background:C.ink,color:C.white,fontFamily:'"PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif'}}>
    <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 48%,#153846 0%,#0c1420 66%)'}}/>
    <ParticleJourney/>
    <div style={{position:'absolute',top:102,left:96,fontFamily:'monospace',fontSize:24,letterSpacing:3,color:C.mint}}>CREATE CODE VIDEO / MOTION LAB</div>
    <div style={{position:'absolute',top:222,left:96,fontSize:80,lineHeight:1.2,fontWeight:850,letterSpacing:-2}}>
      {headline[0]}<br/><span style={{color:stage===3?C.yellow:C.orange}}>{headline[1]}</span>
    </div>
    <div style={{position:'absolute',top:470,left:96,fontSize:29,color:'#92a9b6'}}>{names[stage]}</div>
    <Request t={t}/>
    <div style={{position:'absolute',left:96,right:96,top:1610,fontSize:39,lineHeight:1.45,fontWeight:650,
      opacity:smooth(t,.3,.8)}}><span style={{color:C.yellow}}>{stage===0?'粒子是输入':stage===1?'相机是叙事':stage===2?'转场有理由':'结尾留出空间'}</span><br/>
      {stage===0?'固定种子，按绝对时间聚合。':stage===1?'从动作抵达结果，然后落定。':stage===2?'同一个对象，进入新的状态。':'收束之后，停留。'}</div>
    <div style={{position:'absolute',left:96,top:1820,width:888,height:3,background:'#31424e'}}><div style={{width:`${frame/539*100}%`,height:3,background:C.mint}}/></div>
    <div style={{position:'absolute',left:96,top:1850,fontSize:19,fontFamily:'monospace',color:'#728c9b'}}>PROCEDURAL VISUALS · 18s · SILENT DEMO</div>
    {curtain>0?<AbsoluteFill style={{background:C.orange,clipPath:`polygon(0 0,${curtain*120}% 0,${curtain*120-20}% 100%,0 100%)`}}/>:null}
  </AbsoluteFill>;
};
