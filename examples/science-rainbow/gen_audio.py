import asyncio,json,subprocess,edge_tts,numpy as np,wave
S=[("hook",["雨停了，天上挂起一道彩虹。","咦？彩虹是从哪儿来的？"]),
("fact",["阳光看着白白的，其实藏着好多颜色。","红、橙、黄、绿、青、蓝、紫。"]),
("why",["雨后，空中飘着好多小水滴。","阳光钻进水滴，拐个弯，再弹出来。","每种颜色拐弯不一样多，就被分开啦。","小水滴，就像一块小三棱镜。"]),
("order",["彩虹的颜色是排好队的：","红色在最外圈，紫色在最里圈。","晴天背对太阳，请大人喷点水雾，你也能看到小彩虹。"]),
("board",["记住三件事：","阳光藏着好多颜色。","小水滴把颜色分开。","红在外，紫在里。"])]
FPS=30
async def tts(t,p): await edge_tts.Communicate(t,"zh-CN-XiaoxiaoNeural",rate="+0%",pitch="+4Hz").save(p)
def dur(p): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]))
async def main():
  out=[];t=0.8;k=0
  for si,(name,lines) in enumerate(S):
    sc={"name":name,"start":0 if si==0 else round((t-0.6)*FPS),"lines":[]}
    for L in lines:
      p=f"public/vo/{k:02d}.mp3"; await tts(L,p); d=dur(p)
      sc["lines"].append({"text":L,"file":f"vo/{k:02d}.mp3","from":round(t*FPS),"dur":round(d*FPS)})
      t+=d+0.3;k+=1
    t+=0.6; out.append(sc)
  total=round((t+0.8)*FPS)
  for i,sc in enumerate(out): sc["end"]=out[i+1]["start"] if i+1<len(out) else total
  json.dump({"total":total,"scenes":out},open("src/timeline.json","w"),ensure_ascii=False,indent=1)
  return out,total
out,total=asyncio.run(main())
sr=44100;T=total/FPS;N=int(sr*T);t=np.arange(N)/sr
# BGM: soft pad chords + plucked melody, C-Am-F-G, 96bpm
bpm=96;beat=60/bpm;bgm=np.zeros(N)
chords=[[261.63,329.63,392.0],[220.0,261.63,329.63],[174.61,220.0,261.63],[196.0,246.94,293.66]]
bar=beat*4
for b in range(int(T/bar)+1):
  ch=chords[b%4];i0=int(b*bar*sr);L=int(bar*sr*1.1);tt=np.arange(L)/sr
  env=np.minimum(1,tt/0.6)*np.exp(-tt/3)
  s=sum(np.sin(2*np.pi*f/2*tt)+0.4*np.sin(2*np.pi*f*tt) for f in ch)*env*0.03
  e=min(N,i0+L)
  if e>i0: bgm[i0:e]+=s[:e-i0]
  mel=[ch[0]*2,ch[1]*2,ch[2]*2,ch[1]*2,ch[2]*2,ch[0]*4,ch[2]*2,ch[1]*2]
  for j,f in enumerate(mel):
    i1=int((b*bar+j*beat/2)*sr);L2=int(sr*0.9);tt=np.arange(L2)/sr
    s=(np.sin(2*np.pi*f*tt)+0.25*np.sin(4*np.pi*f*tt))*np.exp(-tt*5)*0.05*(0.6 if j%2 else 1)
    e=min(N,i1+L2)
    if e>i1: bgm[i1:e]+=s[:e-i1]
bgm*=np.minimum(1,t/1.5)*np.minimum(1,(T-t)/2.5)
# SFX
sfx=np.zeros(N)
def add(sec,sig):
  i=int(sec*sr);e=min(N,i+len(sig))
  if e>i: sfx[i:e]+=sig[:e-i]
def chime(f0):
  tt=np.arange(int(sr*1.2))/sr; return sum(np.sin(2*np.pi*f0*m*tt)*np.exp(-tt*(3+m)) for m in (1,2.01,3.02))*0.12
def pop():
  tt=np.arange(int(sr*0.12))/sr; return np.sin(2*np.pi*(900-3000*tt)*tt)*np.exp(-tt*40)*0.18
def whoosh():
  L=int(sr*0.7);n=np.random.default_rng(1).standard_normal(L);n=np.convolve(n,np.ones(60)/60,'same');w=np.sin(np.linspace(0,np.pi,L))**2;return n*w*0.25
def drip():
  tt=np.arange(int(sr*0.25))/sr; return np.sin(2*np.pi*(600+1800*tt)*tt)*np.exp(-tt*18)*0.15
cues={"hook":[(1,"rain"),],}
for sc in out:
  s0=sc["start"]/FPS; add(s0+0.1,whoosh())
  if sc["name"]=="hook":
    for k in range(25): add(0.2+k*0.17+np.random.rand()*0.1,drip()*0.4)
    add(sc["lines"][0]["from"]/FPS+1.2,chime(1046))
  if sc["name"]=="fact":
    for i in range(7): add(sc["lines"][1]["from"]/FPS+0.1+i*0.3,pop()*0.8)
  if sc["name"]=="why": add(sc["lines"][0]["from"]/FPS+0.3,drip()); add(sc["lines"][2]["from"]/FPS+0.4,chime(784))
  if sc["name"]=="order": add(sc["lines"][1]["from"]/FPS,chime(1318)*0.7)
  if sc["name"]=="board":
    for j in range(1,4): add(sc["lines"][j]["from"]/FPS,pop())
mix=bgm*0.9+sfx
mix=(mix/max(1,np.abs(mix).max())*0.9*32767).astype(np.int16)
w=wave.open('public/bed.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes(mix.tobytes())
print(total,total/FPS)
