import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate, Easing, Audio, staticFile} from 'remotion';
const C = ['#ff4b4b','#ff9a3c','#ffd93c','#4cd964','#3cb8ff','#4a5cff','#9b4dff'];
const N = ['红','橙','黄','绿','蓝','靛','紫'];
const font = '"Noto Sans CJK SC","Noto Serif CJK SC",sans-serif';
const ease = Easing.bezier(0.33,0,0.2,1);
const fade = (f:number,a:number,b:number)=>interpolate(f,[a,a+15,b-15,b],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const inn = (f:number,a:number,d=20)=>interpolate(f,[a,a+d],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:ease});
const Cap: React.FC<{t:string;f:number;a:number;b:number;y?:number;size?:number}> = ({t,f,a,b,y=1450,size=64}) => (
  <div style={{position:'absolute',top:y,width:'100%',textAlign:'center',fontFamily:font,fontWeight:700,fontSize:size,color:'#fff',
    opacity:fade(f,a,b),transform:`translateY(${(1-inn(f,a))*20}px)`,textShadow:'0 4px 18px rgba(0,0,0,.35)',padding:'0 80px',boxSizing:'border-box',lineHeight:1.35}}>{t}</div>);
const Push: React.FC<{children:React.ReactNode;len:number}> = ({children,len}) => {
  const f=useCurrentFrame(); const s=interpolate(f,[0,len],[1,1.05]);
  return <AbsoluteFill style={{transform:`scale(${s})`,opacity:fade(f,0,len)}}>{children}</AbsoluteFill>;
};
const Sky: React.FC<{k:number}> = ({k}) => (
  <AbsoluteFill style={{background:`linear-gradient(${interpolate(k,[0,1],[0,0])}deg, ${k<0.5?'#5b6b80':'#5fb4ff'} 0%, ${k<0.5?'#8fa0b5':'#bfe6ff'} 100%)`}} />);
const Hook: React.FC = () => {
  const f=useCurrentFrame(); const k=inn(f,60,60);
  const drops=Array.from({length:40},(_,i)=>i);
  return <Push len={210}>
    <AbsoluteFill style={{background:'#5b6b80'}}/><AbsoluteFill style={{background:'linear-gradient(#5fb4ff,#d6f0ff)',opacity:k}}/>
    <svg width={1080} height={1920} style={{position:'absolute'}}>
      <circle cx={820} cy={interpolate(k,[0,1],[700,420])} r={110} fill="#ffd84a" opacity={k}/>
      {drops.map(i=>{const x=(i*137)%1080; const y=((f*28+i*211)%2000)-80; return <line key={i} x1={x} y1={y} x2={x-8} y2={y+50} stroke="#cfe3ff" strokeWidth={5} strokeLinecap="round" opacity={1-k}/>;})}
      {C.map((c,i)=><path key={i} d={`M ${140+i*22} 1250 A ${400-i*22} ${400-i*22} 0 0 1 ${940-i*22} 1250`} stroke={c} strokeWidth={22} fill="none" opacity={inn(f,130,40)*0.9}/>)}
    </svg>
    <Cap t="下过雨，太阳出来了……" f={f} a={10} b={120}/>
    <Cap t="咦？彩虹是从哪来的？" f={f} a={125} b={210} size={76}/>
  </Push>;
};
const Fact: React.FC = () => {
  const f=useCurrentFrame(); const sp=inn(f,150,60);
  return <Push len={390}><AbsoluteFill style={{background:'linear-gradient(#1d2a4a,#33476e)'}}/>
    <svg width={1080} height={1920} style={{position:'absolute'}}>
      <circle cx={180} cy={500} r={90} fill="#ffd84a"/>
      {C.map((c,i)=>{const y=500+(i-3)*sp*38; return <line key={i} x1={260} y1={500} x2={260+inn(f,20,50)*740} y2={y+(i-3)*sp*120} stroke={sp<0.05?'#fff':c} strokeWidth={sp<0.05?40:26} strokeLinecap="round" opacity={0.9}/>;})}
      {N.map((n,i)=><text key={i} x={960} y={500+(i-3)*158*sp+15} fill={C[i]} fontSize={48} fontFamily={font} fontWeight={700} opacity={inn(f,230+i*8,15)}>{n}</text>)}
    </svg>
    <Cap t="阳光看起来白白的" f={f} a={10} b={150}/>
    <Cap t="其实里面藏着好多颜色，混在一起" f={f} a={150} b={300}/>
    <Cap t="红、橙、黄、绿、蓝、靛、紫" f={f} a={300} b={390} size={70}/>
  </Push>;
};
const Why: React.FC = () => {
  const f=useCurrentFrame(); const a=inn(f,60,40); const b=inn(f,130,60);
  return <Push len={420}><AbsoluteFill style={{background:'linear-gradient(#20335c,#3d5a8a)'}}/>
    <svg width={1080} height={1920} style={{position:'absolute'}}>
      <circle cx={600} cy={700} r={250} fill="rgba(160,215,255,.35)" stroke="#bfe4ff" strokeWidth={6}/>
      <circle cx={520} cy={610} r={40} fill="rgba(255,255,255,.5)"/>
      <line x1={0} y1={560} x2={a*420} y2={560} stroke="#fff" strokeWidth={30} strokeLinecap="round"/>
      {C.map((c,i)=>{const ex=430-b*330; const ey=860+i*b*26+b*240; return <line key={i} x1={430} y1={570} x2={ex} y2={ey} stroke={c} strokeWidth={14} strokeLinecap="round" opacity={b}/>;})}
    </svg>
    <Cap t="雨停后，空中飘着好多小水滴" f={f} a={0} b={130}/>
    <Cap t="阳光钻进水滴，拐个弯，再跑出来" f={f} a={130} b={280}/>
    <Cap t="小水滴像小棱镜，把颜色一条条分开" f={f} a={280} b={420}/>
  </Push>;
};
const Order: React.FC = () => {
  const f=useCurrentFrame();
  return <Push len={360}><AbsoluteFill style={{background:'linear-gradient(#5fb4ff,#d6f0ff)'}}/>
    <svg width={1080} height={1920} style={{position:'absolute'}}>
      {C.map((c,i)=>{const r=440-i*30; const p=inn(f,20+i*14,30); return <path key={i} d={`M ${540-r} 1100 A ${r} ${r} 0 0 1 ${540+r} 1100`} stroke={c} strokeWidth={30} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1-p}/>;})}
      <text x={540} y={630} textAnchor="middle" fontSize={50} fill="#c62828" fontFamily={font} fontWeight={700} opacity={inn(f,140)}>↑ 红在最外圈</text>
      <text x={540} y={1060} textAnchor="middle" fontSize={50} fill="#5e2ca5" fontFamily={font} fontWeight={700} opacity={inn(f,170)}>紫在最里圈 ↓</text>
    </svg>
    <Cap t="看！颜色排队是有顺序的" f={f} a={0} b={200} y={1300}/>
    <Cap t="小实验：背对太阳喷水雾，也能看到小彩虹哦（请大人陪着）" f={f} a={200} b={360} y={1300} size={56}/>
  </Push>;
};
const Board: React.FC = () => {
  const f=useCurrentFrame(); const pts=['① 阳光里藏着好多颜色','② 小水滴像棱镜，把光分开','③ 红在外，紫在里'];
  return <Push len={240}><AbsoluteFill style={{background:'#2f4a3a',border:'28px solid #8b5a2b',boxSizing:'border-box'}}/>
    <div style={{position:'absolute',top:380,width:'100%',textAlign:'center',fontFamily:font,fontSize:84,color:'#ffe27a',fontWeight:700,opacity:inn(f,5)}}>今天的小收获</div>
    {pts.map((p,i)=><div key={i} style={{position:'absolute',top:640+i*190,left:120,fontFamily:font,fontSize:62,color:'#f4f4f0',opacity:inn(f,30+i*30),transform:`translateX(${(1-inn(f,30+i*30))*-20}px)`}}>{p}</div>)}
    <div style={{position:'absolute',top:1400,width:'100%',textAlign:'center',fontFamily:font,fontSize:48,color:'#cfe8d4',opacity:inn(f,140)}}>下次雨后，背对太阳找一找！</div>
  </Push>;
};
export const Rainbow: React.FC = () => (
  <AbsoluteFill style={{background:'#000'}}>
    <Audio src={staticFile('bgm.wav')} volume={0.5}/>
    <Sequence from={0} durationInFrames={210}><Hook/></Sequence>
    <Sequence from={210} durationInFrames={390}><Fact/></Sequence>
    <Sequence from={600} durationInFrames={420}><Why/></Sequence>
    <Sequence from={1020} durationInFrames={360}><Order/></Sequence>
    <Sequence from={1380} durationInFrames={240}><Board/></Sequence>
  </AbsoluteFill>);
