import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate, Easing, staticFile} from 'remotion';
import {Audio} from '@remotion/media';
import tl from './timeline.json';

const INK = '#22313F', PAPER = '#F4EDE1', SUN = '#F2B33D';
const C = ['#E5484D', '#F28C28', '#F5C518', '#46A758', '#12A594', '#3E7BFA', '#8E4EC6'];
const N = ['红', '橙', '黄', '绿', '青', '蓝', '紫'];
const FONT = '"Noto Sans CJK SC", sans-serif';
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const SPR = Easing.spring({damping: 200});
const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const S = Object.fromEntries(tl.scenes.map((s) => [s.name, s]));
// line start relative to its scene
const L = (scene: string, i: number) => S[scene].lines[i].from - S[scene].start;

/** One caption at a time, anchored to one side — never a centred wall. */
const Caption: React.FC<{scene: string; i: number; side: 'left' | 'right'; top: number; hl?: string}> = ({scene, i, side, top, hl}) => {
  const f = useCurrentFrame();
  const line = S[scene].lines[i];
  const a = line.from - S[scene].start;
  const b = a + line.dur + 10;
  const text = line.text;
  const parts = hl ? text.split(hl) : [text];
  return (
    <div style={{
      position: 'absolute', top, [side]: 72, maxWidth: 900, fontFamily: FONT, fontWeight: 700, fontSize: 54, lineHeight: 1.4,
      color: INK, background: 'rgba(255,252,245,0.94)', padding: '22px 34px', borderRadius: 20,
      borderLeft: side === 'left' ? `10px solid ${SUN}` : undefined, borderRight: side === 'right' ? `10px solid ${SUN}` : undefined,
      boxShadow: '0 10px 30px rgba(34,49,63,0.12)', textAlign: side,
      opacity: interpolate(f, [a, a + 8, b - 6, b], [0, 1, 1, 0], CL),
      translate: interpolate(f, [a, a + 18], [side === 'left' ? '-40px 0px' : '40px 0px', '0px 0px'], {...CL, easing: SPR}),
    }}>
      {parts.map((p, k) => (<React.Fragment key={k}>{p}{k < parts.length - 1 && <span style={{color: '#D9480F'}}>{hl}</span>}</React.Fragment>))}
    </div>
  );
};

const arc = (r: number, cx = 540, cy = 1180) => `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const l0 = L('hook', 0), l1 = L('hook', 1);
  return (<AbsoluteFill>
    <AbsoluteFill style={{background: '#7E8C96'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#9FD3F0 0%,#F7E8CF 100%)', opacity: interpolate(f, [l0 + 10, l0 + 50], [0, 1], {...CL, easing: OUT})}} />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {Array.from({length: 36}, (_, i) => { const x = (i * 157) % 1080; const y = ((f * 30 + i * 233) % 2000) - 80;
        return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 46} stroke="#E3EEF5" strokeWidth={4} strokeLinecap="round"
          opacity={interpolate(f, [l0 + 10, l0 + 40], [0.8, 0], CL)} />; })}
      <circle cx={830} r={120} fill={SUN}
        cy={interpolate(f, [l0 + 20, l0 + 70], [620, 430], {...CL, easing: OUT})}
        opacity={interpolate(f, [l0 + 20, l0 + 45], [0, 1], CL)} />
      {C.map((c, i) => (<path key={i} d={arc(430 - i * 26)} stroke={c} strokeWidth={26} fill="none" pathLength={1} strokeDasharray={1}
        strokeDashoffset={interpolate(f, [l0 + 55, l0 + 100], [1, 0], {...CL, easing: OUT})} opacity={0.92} />))}
      <path d="M0 1180 Q 270 1120 540 1170 T 1080 1150 L1080 1920 L0 1920 Z" fill="#8DBF7A" />
      <path d="M0 1260 Q 300 1210 620 1260 T 1080 1250 L1080 1920 L0 1920 Z" fill="#6FA862" />
    </svg>
    <div style={{position: 'absolute', left: 470, top: 860, fontFamily: FONT, fontWeight: 900, fontSize: 150, color: '#D9480F',
      opacity: interpolate(f, [l1 + 20, l1 + 30], [0, 1], CL),
      scale: interpolate(f, [l1 + 20, l1 + 40], [0.4, 1], {...CL, easing: Easing.spring({damping: 12}), output: 'perceptual-scale'} as any)}}>?</div>
    <Caption scene="hook" i={0} side="left" top={1420} />
    <Caption scene="hook" i={1} side="right" top={1420} hl="彩虹" />
  </AbsoluteFill>);
};

const Fact: React.FC = () => {
  const f = useCurrentFrame();
  const l0 = L('fact', 0), l1 = L('fact', 1);
  return (<AbsoluteFill style={{background: PAPER}}>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <circle cx={150} cy={760} r={95} fill={SUN} opacity={interpolate(f, [0, 15], [0, 1], CL)} />
      <line x1={250} y1={760} y2={760} stroke={SUN} strokeOpacity={0.8} strokeWidth={58} strokeLinecap="round"
        x2={interpolate(f, [l0 + 10, l0 + 45], [250, 560], {...CL, easing: OUT})} />
      <line x1={250} y1={760} y2={760} stroke="#FFFFFF" strokeWidth={46} strokeLinecap="round"
        x2={interpolate(f, [l0 + 10, l0 + 45], [250, 560], {...CL, easing: OUT})} style={{filter: 'drop-shadow(0 0 10px rgba(242,179,61,.7))'}} />
      {C.map((c, i) => { const s = l1 + 4 + i * 9; return (<g key={i}>
        <line x1={560} y1={760} stroke={c} strokeWidth={22} strokeLinecap="round" opacity={interpolate(f, [s, s + 2], [0, 1], CL)}
          x2={interpolate(f, [s, s + 16], [560, 880], {...CL, easing: OUT})}
          y2={interpolate(f, [s, s + 16], [760, 520 + i * 80], {...CL, easing: OUT})} />
        <text x={915} y={535 + i * 80} fontFamily={FONT} fontWeight={700} fontSize={42} fill={c}
          opacity={interpolate(f, [s + 10, s + 18], [0, 1], CL)}>{N[i]}</text></g>); })}
    </svg>
    <Caption scene="fact" i={0} side="left" top={1100} hl="好多颜色" />
    <Caption scene="fact" i={1} side="right" top={1100} />
  </AbsoluteFill>);
};

const Why: React.FC = () => {
  const f = useCurrentFrame();
  const l0 = L('why', 0), l1 = L('why', 1), l2 = L('why', 2), l3 = L('why', 3);
  const cx = 600, cy = 760, r = 270;
  return (<AbsoluteFill style={{background: PAPER}}>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {/* small drops first, then one drop grows into the hero */}
      {[[200, 330], [880, 300], [320, 1150], [930, 1080], [140, 700]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={22} fill="#BFE3F2" stroke="#7DB9D6" strokeWidth={3}
          opacity={interpolate(f, [l0 + 4 + i * 6, l0 + 14 + i * 6], [0, 1], CL)} />))}
      <circle cx={cx} cy={cy} fill="rgba(191,227,242,.55)" stroke="#5FA4C6" strokeWidth={6}
        r={interpolate(f, [l0 + 40, l0 + 75], [0, r], {...CL, easing: OUT})} />
      <ellipse cx={cx - 110} cy={cy - 120} rx={46} ry={28} fill="rgba(255,255,255,.7)" opacity={interpolate(f, [l0 + 70, l0 + 80], [0, 1], CL)} />
      {/* light path: enter top-left, bend, reflect at back, exit lower-left */}
      <polyline points={`0,560 ${cx - 200},${cy - 182} ${cx + 230},${cy + 140} ${cx - 120},${cy + 242}`} fill="none" stroke="#FFFFFF"
        strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1}
        strokeDashoffset={interpolate(f, [l1 + 6, l1 + 70], [1, 0], {...CL, easing: Easing.bezier(0.45, 0, 0.55, 1)})}
        style={{filter: 'drop-shadow(0 0 6px rgba(242,179,61,.9))'}} />
      <circle cx={cx + 230} cy={cy + 140} r={18} fill={SUN} opacity={interpolate(f, [l1 + 40, l1 + 48, l1 + 70], [0, 1, 0.4], CL)} />
      {C.map((c, i) => { const s = l2 + 6 + i * 6; return (
        <line key={i} x1={cx - 120} y1={cy + 242} stroke={c} strokeWidth={12} strokeLinecap="round" opacity={interpolate(f, [s, s + 2], [0, 1], CL)}
          x2={interpolate(f, [s, s + 18], [cx - 120, 90 + i * 34], {...CL, easing: OUT})}
          y2={interpolate(f, [s, s + 18], [cy + 242, 1240 - i * 18], {...CL, easing: OUT})} />); })}
      <g opacity={interpolate(f, [l3 + 10, l3 + 22], [0, 1], CL)}
         style={{translate: interpolate(f, [l3 + 10, l3 + 30], ['60px 0px', '0px 0px'], {...CL, easing: SPR})}}>
        <text x={830} y={1190} fontFamily={FONT} fontWeight={900} fontSize={80} fill={INK}>≈</text>
        <polygon points="900,1220 1000,1220 950,1120" fill="rgba(191,227,242,.8)" stroke="#5FA4C6" strokeWidth={5} />
      </g>
    </svg>
    <Caption scene="why" i={0} side="right" top={1380} />
    <Caption scene="why" i={1} side="left" top={1380} hl="拐个弯" />
    <Caption scene="why" i={2} side="right" top={1380} hl="分开" />
    <Caption scene="why" i={3} side="left" top={1380} hl="三棱镜" />
  </AbsoluteFill>);
};

const Order: React.FC = () => {
  const f = useCurrentFrame();
  const l0 = L('order', 0), l1 = L('order', 1), l2 = L('order', 2);
  return (<AbsoluteFill style={{background: PAPER}}>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <g opacity={interpolate(f, [l2, l2 + 15], [1, 0.25], CL)}>
        {C.map((c, i) => { const s = l0 + 6 + i * 8; return (
          <path key={i} d={arc(440 - i * 32, 540, 980)} stroke={c} strokeWidth={30} fill="none" pathLength={1} strokeDasharray={1}
            strokeDashoffset={interpolate(f, [s, s + 22], [1, 0], {...CL, easing: OUT})} />); })}
      </g>
      <g opacity={interpolate(f, [l1 + 4, l1 + 14, l2, l2 + 10], [0, 1, 1, 0], CL)}>
        <line x1={110} y1={600} x2={140} y2={700} stroke={C[0]} strokeWidth={6} />
        <text x={70} y={580} fontFamily={FONT} fontWeight={700} fontSize={48} fill={C[0]}>红 · 最外圈</text>
      </g>
      <g opacity={interpolate(f, [l1 + 50, l1 + 60, l2, l2 + 10], [0, 1, 1, 0], CL)}>
        <line x1={540} y1={880} x2={540} y2={790} stroke={C[6]} strokeWidth={6} />
        <text x={540} y={940} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={48} fill={C[6]}>紫 · 最里圈</text>
      </g>
      {/* mini experiment: sun behind you, mist in front */}
      <g opacity={interpolate(f, [l2 + 10, l2 + 22], [0, 1], CL)}>
        <circle cx={140} cy={380} r={60} fill={SUN} />
        <text x={230} y={395} fontFamily={FONT} fontSize={40} fill={INK}>太阳在背后</text>
      </g>
      <g opacity={interpolate(f, [l2 + 40, l2 + 52], [0, 1], CL)}>
        <rect x={720} y={760} width={90} height={150} rx={20} fill="#7DB9D6" />
        <rect x={740} y={720} width={50} height={44} rx={8} fill={INK} />
        <rect x={680} y={728} width={70} height={18} rx={6} fill={INK} />
        {Array.from({length: 18}, (_, i) => (<circle key={i} r={6} fill="#BFE3F2"
          cx={interpolate(f, [l2 + 50 + i * 2, l2 + 90 + i * 2], [680, 420 - (i % 6) * 40], CL)}
          cy={interpolate(f, [l2 + 50 + i * 2, l2 + 90 + i * 2], [737, 640 + (i % 5) * 40], CL)}
          opacity={interpolate(f, [l2 + 50 + i * 2, l2 + 56 + i * 2], [0, 0.9], CL)} />))}
      </g>
      {C.map((c, i) => (<path key={i} d={arc(150 - i * 9, 430, 820)} stroke={c} strokeWidth={9} fill="none" pathLength={1} strokeDasharray={1}
        strokeDashoffset={interpolate(f, [l2 + 95, l2 + 125], [1, 0], {...CL, easing: OUT})} opacity={0.9} />))}
    </svg>
    <Caption scene="order" i={0} side="left" top={1250} hl="排好队" />
    <Caption scene="order" i={1} side="right" top={1250} />
    <Caption scene="order" i={2} side="left" top={1250} hl="背对太阳" />
  </AbsoluteFill>);
};

const Board: React.FC = () => {
  const f = useCurrentFrame();
  const items = ['阳光藏着好多颜色', '小水滴把颜色分开', '红在外，紫在里'];
  return (<AbsoluteFill style={{background: '#2E4A3B'}}>
    <AbsoluteFill style={{border: '26px solid #9A6B3F', boxSizing: 'border-box'}} />
    <div style={{position: 'absolute', left: 110, top: 360, fontFamily: FONT, fontWeight: 900, fontSize: 80, color: '#FFE08A',
      opacity: interpolate(f, [L('board', 0), L('board', 0) + 10], [0, 1], CL),
      translate: interpolate(f, [L('board', 0), L('board', 0) + 18], ['0px 30px', '0px 0px'], {...CL, easing: SPR})}}>今天的小收获</div>
    {items.map((t, i) => { const a = L('board', i + 1); return (
      <div key={i} style={{position: 'absolute', left: i % 2 ? 200 : 110, top: 620 + i * 230, fontFamily: FONT, fontWeight: 700, fontSize: 64, color: '#F3F1E8',
        opacity: interpolate(f, [a, a + 10], [0, 1], CL),
        translate: interpolate(f, [a, a + 20], ['-36px 0px', '0px 0px'], {...CL, easing: SPR})}}>
        <span style={{color: C[i * 3], marginRight: 24}}>●</span>{t}
        <div style={{height: 6, background: 'rgba(255,224,138,.6)', marginTop: 14, borderRadius: 3,
          width: interpolate(f, [a + 18, a + 40], [0, 100], {...CL, easing: OUT}) + '%'}} />
      </div>); })}
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {C.map((c, i) => (<path key={i} d={arc(120 - i * 8, 860, 1600)} stroke={c} strokeWidth={8} fill="none" pathLength={1} strokeDasharray={1}
        strokeDashoffset={interpolate(f, [L('board', 3) + 70, L('board', 3) + 100], [1, 0], {...CL, easing: OUT})} />))}
    </svg>
  </AbsoluteFill>);
};

const COMP: Record<string, React.FC> = {hook: Hook, fact: Fact, why: Why, order: Order, board: Board};

export const RainbowV2: React.FC = () => (
  <AbsoluteFill style={{background: PAPER}}>
    <Audio src={staticFile('bed.wav')} volume={0.55} />
    {tl.scenes.flatMap((s) => s.lines).map((l, i) => (
      <Sequence key={'vo' + i} from={l.from} durationInFrames={l.dur + 15} name={`VO ${i}`}><Audio src={staticFile(l.file)} /></Sequence>))}
    {tl.scenes.map((s) => { const X = COMP[s.name]; return (
      <Sequence key={s.name} from={s.start} durationInFrames={s.end - s.start} name={s.name}><SceneFade len={s.end - s.start}><X /></SceneFade></Sequence>); })}
  </AbsoluteFill>
);

/** Short cut-dissolve between scenes only (10 frames), no whole-scene zoom. */
const SceneFade: React.FC<{len: number; children: React.ReactNode}> = ({len, children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: interpolate(f, [0, 10, len - 6, len], [0, 1, 1, 1], CL)}}>{children}</AbsoluteFill>;
};
