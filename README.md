# create-code-video

把核心观点做成有叙事、有空间、有声音设计的纯代码视频。支持技术机制解释、产品对比、数据叙事与三维抽象宣传片；交付实际视频文件和可复现工程。

**v3.0** 把制作经验与四套上游 Skills 的调研沉淀成导演方法、声音流程、可运行三维示例与验证脚本。默认不调用视频/图像生成模型。

<img src="assets/motion-lab-preview.gif" width="270" alt="纯代码三维粒子聚合、相机交接、委托单验收与结尾停留示例" />

上图是完整 18 秒无声样例的缩小预览；源码可导出 1080×1920 MP4。

## 安装 Skill

```bash
git clone https://github.com/Yankj/create-code-video.git
mkdir -p ~/.codex/skills/create-code-video
cp -R create-code-video/SKILL.md create-code-video/agents create-code-video/assets create-code-video/references create-code-video/scripts create-code-video/examples ~/.codex/skills/create-code-video/
```

其他支持 SKILL.md 的 Agent 可放到其对应的 skills 目录。安装前保留已有自定义版本；无需安装所有示例依赖即可读取 Skill。刷新技能列表或开启新会话后使用：

```text
$create-code-video 把“个人 Agent 如何完成长期目标”做成 9:16 技术短视频，
重点解释执行、观察、修正与验收。用纯代码动态图形，附 MP4 和源码。
```

## 内容

- [SKILL.md](SKILL.md)：目的、决策与制作流程，按需路由。
- [references/](references/)：分镜、排版、品牌资产、配音/结尾、转场、三维/粒子、渲染验收。
- [Remotion Motion Lab](examples/remotion-motion-lab/README.md)：18 秒无声竖屏演示，GPU 粒子、相机旅行、持续对象、遮挡揭示、结尾停留。
- [HyperFrames seek](examples/hyperframes-seek/README.md)：有限 GSAP 时间轴与可定位状态，面向 HyperFrames 的入口示例。
- [scripts/](scripts/)：视频抽帧、分镜验证、媒体探测与完整解码；工具不会冒充人工导演或听感评价。
- [调研与归因](references/research-and-attribution.md)：上游提交、吸收方法、许可证边界。

## 运行三维示例

Node.js 22，npm。首次渲染会安装 Remotion 的浏览器；需能获取依赖。示例不调用外部视频、图片或 TTS 服务。

```bash
cd examples/remotion-motion-lab
npm ci
npm test
npm run typecheck
npm run studio
npm run render
```

输出 `out/motion-lab.mp4`，1080×1920、30fps、18s、无声。可先运行 `npm run smoke` 导出 3 秒小样。默认用软件 WebGL 提高离线兼容性；可按实际 GPU 环境调整。

根目录结构/脚本验证：

```bash
python3 scripts/check_skill.py
python3 -m unittest discover -s tests -v
python3 scripts/validate_storyboard.py examples/storyboard.example.json
python3 scripts/qa_video.py examples/remotion-motion-lab/out/motion-lab.mp4 --width 1080 --height 1920 --fps 30 --duration 18
```

媒体脚本需要 ffmpeg/ffprobe；抽帧额外需要 Pillow。两套示例的确定性逻辑测试、Remotion 实际离线渲染结果见 [验证记录](VALIDATION.md)。GitHub Actions 检查 Python 工具、文档链接、Node 测试与 TypeScript；不把未执行的人工试听写成通过。

## 许可与贡献

本仓库原创文本、工具与示例采用 [MIT](LICENSE)。第三方依赖、字体、Logo、声音与其他资产使用其各自的条件；尤其 Remotion 运行库许可需按 [官方说明](https://www.remotion.dev/license) 核对。本仓库没有重新许可第三方素材或移植上游 Skills。

欢迎用实际镜头/输出问题提交改进。贡献请保留纯代码默认、证据与推断分离、确定性时钟、具体交付和检查边界。详情见 [贡献约定](CONTRIBUTING.md) 与 [变更记录](CHANGELOG.md)。
