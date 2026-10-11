<p align="center">
  <img src="assets/icon.svg" width="84" height="84" alt="Create Code Video 图标" />
</p>
<h1 align="center">Create Code Video</h1>
<p align="center"><strong>用代码让观点动起来，交付真正的视频文件。</strong></p>
<p align="center">面向 Agent 的视频制作 Skill：内容叙事、分镜导演、动态图形、声音与渲染验收。</p>
<p align="center">
  <a href="README.md">English</a> · <strong>简体中文</strong>
</p>
<p align="center">
  <a href=".github/workflows/validate.yml"><img src="https://github.com/Yankj/create-code-video/actions/workflows/validate.yml/badge.svg" alt="验证工作流" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-b8f4d7?labelColor=0c1420" alt="MIT 许可" /></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/skill-v3.2.0-d6fa78?labelColor=0c1420" alt="Skill 版本 3.2.0" /></a>
  <img src="https://img.shields.io/badge/visuals-pure_code-ff6c44?labelColor=0c1420" alt="纯代码视觉" />
</p>
<p align="center">
  <a href="#快速开始">🚀 快速开始</a> · <a href="#看看实际效果">▶ 动效示例</a> · <a href="#文档导航">📖 文档</a> · <a href="CONTRIBUTING.md">🛠 参与贡献</a>
</p>
<p align="center"><img src="assets/banner.svg" width="1000" alt="Ideas in motion. Built with code. 原创程序化绘制 Banner。" /></p>

把技术机制、产品对比或数据观点，做成有主线、有导演意图的视频。这套 Skill 带 Agent 从资料核验、叙事与分镜，一直完成到可播放的 **MP4 和可复现源码工程**。

仓库提供制作方法、可运行样例和检查工具，渲染由 Remotion、HyperFrames 等框架承担。视觉默认由代码绘制或编排，无需视频或图像生成模型。

有旁白的视频包含 **TTS 选型、声音导演、音频对齐字幕，以及开头和结尾的表达**；需要的封面与发布配文在开工时一起规划。下方 Motion Lab 用于独立验证渲染机制，其声音配置不代表正式项目的制作方式。

## 看看实际效果

<p align="center">
  <img src="assets/motion-lab-preview.gif" width="320" alt="18 秒动效示例：固定种子粒子聚合、空间交接、委托单验收与结尾停留，底部字幕独立留白。" />
</p>
<p align="center"><strong>输入 → 交接 → 证据 → 停留</strong><br />18 秒 · 9:16 · 无声 · 原创代码绘制</p>

运行 [Motion Lab](examples/remotion-motion-lab/README.md) 可导出完整的 1080×1920、30fps MP4。GIF 是从修正后的成片生成的 360px / 10fps 预览；[预览工具](scripts/build_preview.py) 检查时序、每一帧的转换一致性，以及源码是否已经改变。

## 能做什么

| | 制作决策 | 工程与方法支持 |
| --- | --- | --- |
| 🎬 **叙事与导演** | 收束一个核心 Topic，镜头表达原因与结果 | 分镜规格、持续对象、阅读停留 |
| ✨ **运动与空间** | 转场有理由，粒子与相机共用时钟 | 帧同步 Three.js Shader、固定种子、可 seek 的 GSAP 示例 |
| 🎨 **排版与身份** | 手机文字清晰，Logo、界面与角色服务内容 | 字幕保留区、实际测量的布局约束、资产清单、独立封面 |
| 🎙 **配音与表达** | 选择可用的 TTS，导演好奇、解释、强调与收束 | 供应商比较、固定参考、同稿小样、字幕对齐与整片响度 |
| 🖼 **发布交付包** | 开工确认封面和配文，包装清楚且准确的命题 | 制作 brief、独立封面设计与平台配文方法 |
| ✅ **导出与验收** | 交付文件，并说明具体检查证据 | MP4 探测/解码、抽帧、布局反例、预览来源校验 |

## 配音与发布

[TTS 选型](references/tts-selection.md)区分本地推理、限额云 API 和免费试听，记录这个案例的实际路线：Edge 草稿 → Qwen Vivian/Serena 小样 → 用户选 Vivian → 固定参考驱动 Qwen Base 的语义段合成。其他供应商有文档依据，但没有被写成实际试听胜者。

[声音导演](references/voice-and-sound.md)把声音身份、段落表演和朗读文本分开，给出开头、解释、转折、末句的具体方向，以及小样比较、接头、字幕对齐和混音方法。ASR 对稿、响度达标不能代替听感判断。

新制作任务开工时，[一并确认尚未明确的封面和配文需求](references/publishing-package.md)，同时推进独立工作；已经选择的偏好直接沿用。封面可以有独立风格，命题和配文仍须与成片一致。可编辑的 [制作 brief](examples/production-brief.example.json) 和 [声音配置](examples/voice-direction.example.json)帮助保留决策。

## 快速开始

### 1. 安装 Skill

```bash
git clone https://github.com/Yankj/create-code-video.git
mkdir -p ~/.codex/skills/create-code-video
cp -R create-code-video/SKILL.md create-code-video/agents \
  create-code-video/assets create-code-video/references \
  create-code-video/scripts create-code-video/examples \
  ~/.codex/skills/create-code-video/
```

已有自定义版本请先保留备份。其他支持 `SKILL.md` 的 Agent 可使用其对应的 skills 目录。只读取 Skill，无需安装全部示例依赖；刷新技能列表或开启新会话后使用。

### 2. 提供主题和交付要求

```text
$create-code-video 把“个人 Agent 如何完成长期目标”做成 9:16 技术短视频，
重点解释执行、观察、修正与验收。用纯代码动态图形和聊天感女声，
附 MP4、源码、封面和发布配文。
```

已有对话可以直接提供主题、观众、参考和偏好。用户要求成片时，应继续做到实际可播放文件。

### 3. 独立运行样例

需要 **Node.js 22+** 与 npm；首次渲染需要下载浏览器。本例不会调用外部图片、模型或 TTS 服务。

```bash
cd create-code-video/examples/remotion-motion-lab
npm ci
npm test
npm run typecheck
npm run frames   # 真实渲染布局检查 + 故意制造的错误反例
npm run render   # out/motion-lab.mp4
npm run verify-export # 解码 + 成片/单帧一致性，需要 Python/Pillow/ffmpeg
```

`npm run studio` 用于编辑，`npm run smoke` 导出短小样。默认使用软件 WebGL；浏览器替代与字体要求见 [示例说明](examples/remotion-motion-lab/README.md)。

## 如何避免错位和旧预览

**把版式约束落实到实际渲染。** Motion Lab 共用一个设计坐标系，明确文字行高与卡片尺寸，为三维主体划定视口，并给字幕独立留区。字体就绪后，每个渲染帧检查变换后的 DOM 边界、文字溢出、卡片内部包含关系和字幕间距；超限立即停止导出。故意制造重叠和长文案，验证检查确实会拒绝错误。

**让预览绑定具体成片与源码。** `npm run preview:build` 会依次执行关键帧检查、完整导出、解码与成片/单帧对照，全部通过后才重建 GIF。 GIF 工具逐帧对照同样采样的 MP4，核对尺寸、时序和循环，并保存源码与动图校验值。CI 会拒绝过期或被改动的预览。转换一致性证明动图来自成片，画面好不好仍需另行检查。

约束可配置。本例的 9:16 坐标与间距不是所有平台的通用要求，其他比例需要重新设计版式。

## 文档导航

| 文档 | 解决的问题 |
| --- | --- |
| [Skill 入口](SKILL.md) | 按任务读取资源、完整制作流程 |
| [叙事与分镜导演](references/story-and-direction.md) | 核心观点、镜头目的、运动主次 |
| [版式与图形资产](references/layout-and-assets.md) | 手机排版、布局约束、品牌身份、封面 |
| [TTS 选型](references/tts-selection.md) · [声音导演](references/voice-and-sound.md) | 供应商、实际案例参数、拟人表达、衔接与音频对齐字幕 |
| [交付与发布](references/publishing-package.md) | 开工确认封面/配文与平台交付包 |
| [转场](references/transitions.md) · [三维与粒子](references/three-and-particles.md) | 连续性、相机、Shader 与 GPU 生命周期 |
| [渲染与验收](references/render-and-qa.md) | 捕获、导出、媒体检查、预览校验 |
| [Remotion 示例](examples/remotion-motion-lab/README.md) · [GSAP seek 示例](examples/hyperframes-seek/README.md) | 可运行的工程起点 |
| [调研与归因](references/research-and-attribution.md) | 上游提交、吸收方法与许可边界 |
| [验证记录](VALIDATION.md) · [变更记录](CHANGELOG.md) | 实际测量了什么、版本改了什么 |

<details>
<summary><strong>仓库验证命令</strong></summary>

在仓库根目录运行。图片/预览工具需要 Pillow；媒体检查需要在 `PATH` 中可用的 ffmpeg 与 ffprobe。

```bash
python3 -m pip install Pillow
python3 scripts/check_skill.py
python3 scripts/build_preview.py --check assets/motion-lab-preview.json
python3 -m unittest discover -s tests -v
python3 scripts/validate_storyboard.py examples/storyboard.example.json
python3 scripts/qa_video.py examples/remotion-motion-lab/out/motion-lab.mp4 \
  --width 1080 --height 1920 --fps 30 --duration 18
```

GitHub Actions 检查文档、预览新鲜度、Python 工具、确定性逻辑与 TypeScript。GPU 与真实布局检查通过 `npm run frames` 执行；完整渲染和艺术判断单独完成。具体边界见 [验证记录](VALIDATION.md)。

</details>

## 范围与许可

TTS 服务、模型权重和声音参考按制作环境选用，不随仓库分发。声音文档记录能力与已用过的案例配置，不提供永久的拟人程度排名。示例字体采用本机回退，不同系统的字形可能不同；正式项目应纳入有许可的指定字体并检查实际边界。自动检查能拦住声明的布局违规，仍需人工查看画面。

原创文本、工具与示例采用 [MIT](LICENSE)。依赖和第三方素材保留各自的许可条件，包括 [Remotion 许可](https://www.remotion.dev/license)。上游 Skills 用于研究，未直接复制或重新许可。

欢迎围绕具体镜头、实际输出问题与可复现改进贡献。见 [贡献约定](CONTRIBUTING.md)。
