# 彩虹样片对照（v1 / v2）

题材约定在 [儿童科普（纯代码）](../../references/science-kids.md)。这里只记录本目录两版成片差在哪。对照外部多模态儿童频道时，只看信息密度和中间是否加厚；**不要**把对方的 IP、生成管线或 G0–G12 门禁搬进本仓库。

## v1（`Rainbow`，54s）

| 时间 | 段落 | 内容 |
| --- | --- | --- |
| 0–7s | 开场钩子 | 下雨 → 太阳出来 → 彩虹浮现，「咦？彩虹是从哪来的？」 |
| 7–20s | 可记住事实 | 白光一束 → 散开成七色，标出红橙黄绿蓝靛紫 |
| 20–34s | 为什么 | 水滴示意：阳光进水滴拐弯，颜色分开（未画内部反射） |
| 34–46s | 小对照 / 小实验 | 七色弧逐条画出；喷水雾（大人陪同） |
| 46–54s | 结尾小黑板 | 3 条要点 + 一句行动引导 |

用到的能力：`Composition` / `Sequence`；`interpolate` + `Easing` 淡入；SVG 弧；`staticFile` + `<Audio>` 混 BGM；CLI 渲 H.264。

已知不足：无口播，知识靠居中字卡；整段 `scale(1 → 1.05)`；紫蓝渐变底；水滴光路不完整；颜色写成「靛」而不是课本「青」。

## v2（`RainbowV2`，约 58s）

用户评价 v1「太 low」后按 Remotion 官方写法重做。Remotion 4.0.539；当时装过 `remotion-dev/skills`（见 `skills-lock.json`）。

1. **有口播 + 声音设计**：edge-tts `zh-CN-XiaoxiaoNeural` 15 句儿童口语；合成 C–Am–F–G pad + 拨弦 BGM；轻 SFX。`gen_audio.py` 按真实配音时长写 `src/timeline.json`。
2. **一次只动一件事**：太阳升 → 彩虹画出 → 问号；白光 → 七色逐条分出；小水滴 → 大水滴 → 光路进入 / 反射 / 射出 → 七色扇出 → ≈ 三棱镜；彩虹逐圈画 → 红标 → 紫标 → 喷壶。去掉整段 scale 和全体同时淡入。
3. **字卡分边**：左右交替、带色条、关键词橙色高亮，一次一张；暖纸底 + 墨蓝字；小黑板项错位 + 粉笔下划线。
4. **写法**：inline `interpolate` + `Easing.bezier(0.16,1,0.3,1)` / `Easing.spring`；`translate` / `scale` 属性；`@remotion/media` 的 `<Audio>`。
5. **科学更准**：水滴光路画「进入折射 → 后壁反射 → 射出分色」；颜色用「红橙黄绿青蓝紫」。

仍不足：扁平矢量，无角色、无实拍；TTS 情绪有限；没有主 Skill 之外的自动对稿门。这些是题材边界，不是待移植的频道流水线。

## 再渲染

仓库已带上次生成的音频和时间线时：

```bash
npm i
npm run render
```

要按新口播重排时间轴：

```bash
python3 gen_audio.py
npm run render
```

`gen_audio.py` 需要联网、`edge-tts`、`numpy`、`ffprobe`。默认渲 V2：`npx remotion render src/index.ts RainbowV2 out/rainbow-remotion-v2.mp4 --codec h264 --crf 20`。
