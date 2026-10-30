# Science Rainbow

3–8 岁口语科普的 Remotion 样例：雨后彩虹从哪来。默认成片是 **RainbowV2**（约 58s，1080×1920，30fps，有口播）。图形由代码绘制；旁白、底乐和提示音已放进 `public/`，复现渲染不必重新合成。

本目录是主 Skill 的题材样例，不是平行 Skill。制作约定见 [儿童科普（纯代码）](../../references/science-kids.md)。v1 / v2 对照见 [COMPARE-NOTES.md](COMPARE-NOTES.md)。

```bash
npm i
npm test
npm run typecheck
python3 gen_audio.py          # 可选：重做口播、bed.wav 与 timeline.json
npm run render                # RainbowV2 → out/rainbow-remotion-v2.mp4
```

| 命令 | 做什么 |
| --- | --- |
| `npm i` | 安装锁定的 Remotion / React。也可用 `npm ci`（有 lockfile 时）。 |
| `python3 gen_audio.py` | 用 edge-tts `zh-CN-XiaoxiaoNeural` 合成 15 句旁白，按真实时长写 `src/timeline.json`，并合成 `public/bed.wav`（BGM + SFX）。需要联网、`edge-tts`、`numpy`、`ffprobe`。仓库已包含上次生成的 `public/vo/*.mp3`、`public/bed.wav` 和 `timeline.json`，只改画面时跳过即可。 |
| `npm run render` | `remotion render src/index.ts RainbowV2 out/rainbow-remotion-v2.mp4 --codec h264 --crf 20` |

预览用 `npm run studio`。对照用的无口播 v1：`npm run render:v1`（`Rainbow` → `out/rainbow-remotion.mp4`，只用 `public/bgm.wav`）。

Node 20+ 可跑（样例在 Node 20.19 / 22 上装过依赖）。首次渲染会下载 Remotion 浏览器。`out/` 被 Git 忽略。CLI 支持 `REMOTION_BROWSER_EXECUTABLE` 指向本机 Chrome/Chromium，不把开发者绝对路径写进工程。

`gen_audio.py` 会覆盖 `public/vo/`、`public/bed.wav` 和 `src/timeline.json`。重跑后必须再 `npm run render`，因为画面帧区间跟着新的口播时长走。该脚本不是离线的，也不代表正式项目必须用 Edge TTS。

## 可复用点

- `src/timeline.json`：场景名、半开帧区间、每句 `text` / `file` / `from` / `dur`。由真实音频时长写成。
- `src/RainbowV2.tsx`：五段 `Sequence`；每句一个主动作；字卡左右错位；水滴光路画进入折射、后壁反射、射出分色；课本口径「红橙黄绿青蓝紫」。
- `src/Rainbow.tsx`：v1 反例。居中字墙、整段 `scale(1 → 1.05)`、紫蓝底、「靛」口径、无口播。不要把 v1 当风格模板。
- `gen_audio.py`：口播 → 时间线 → 程序化 bed。BGM / SFX 是正弦波和噪声，不是第三方曲库。
- `skills-lock.json`：当时安装的 `remotion-dev/skills` 哈希，只作写法出处，不是本仓库 Skill。

结构测试检查五段顺序、旁白文件存在、v2 用「青」不用「靛」。它们不证明 GPU 成片、听感或口播同步。本例没有 Motion Lab 那种逐帧布局合同；改文案后用人眼看字卡分边和一次一事。

## 许可

本目录的说明、脚本和示例源码与仓库其余部分一样使用 [MIT](../../LICENSE)。

渲染依赖 [Remotion](https://www.remotion.dev/license)。Remotion 对团队规模和商业使用有自己的条件；本仓库 MIT **不**覆盖、不改变、不转授该许可。使用本样例前按 Remotion 当前条款自行核对。`@remotion/media`、React 与 TypeScript 保留各自条款。

旁白由 Microsoft Edge 在线 TTS（第三方客户端 [edge-tts](https://github.com/rany2/edge-tts)）生成，音色 `zh-CN-XiaoxiaoNeural` 的权利由微软服务条款约束，不随本仓库再许可。发布或商用前更换为你有权使用的声音。程序化 `bed.wav` / `bgm.wav` 无第三方采样。
