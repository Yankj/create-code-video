# 上游调研与归因

调研日期：2026-10-11。以下为当时检出的提交，不代表后续永远最新。本文与本仓库示例为重新组织的方法与原创实现，未整包复制上游 Skills、脚本或品牌资产。

| 来源与提交 | 借鉴的优势 | 在本 Skill 的落点 | 保留的边界 |
| --- | --- | --- | --- |
| [Remotion Skills](https://github.com/remotion-dev/skills/tree/32b241b97f4e0e4ab61fe9a41b05e6e64503f8c5) | 创建/预览/导出分工；帧同步；具体 API | Motion Lab、依赖锁、ThreeCanvas、transition 时间账本 | 示例版本不等于最新；不把 React 栈强加给所有视频 |
| [HyperFrames](https://github.com/heygen-com/hyperframes/tree/9e9b613ccf867f98838617f7424967e056e63de2) | 原子运动→多阶段镜头；相机旅行；seek 与分析 | 分镜导演、因果相机、有限时间轴、GSAP seek 示例 | DOM→纹理限制只约束对应 capture；不泛化全部 CSS |
| [iart Motion Design](https://github.com/iart-ai/motion-design-skills/tree/3c129f769d90a1328c209c386492333c9ac62312) | 把风格变成缓动、时长、错峰、幅度、停留；逐镜主次 | DESIGN 数值规范、hero/support/texture、能量曲线、删动效检查 | 不强制每片固定一个高潮或所有时长整除同一单位 |
| [iart WebGL](https://github.com/iart-ai/webgl-animation-skills/tree/50697d659fbf70152f48f9f8aadf1efe78bbdde1) | GPU 粒子、Shader、相机、资源释放与性能 | 粒子角色、解析求值、固定属性/时间 uniforms、所有权 cleanup | 交互 loop 的随机数和增量积分需改写后才能离线复现 |

## 直接核对的资料

- Remotion：[3D 帧同步](https://github.com/remotion-dev/skills/blob/32b241b97f4e0e4ab61fe9a41b05e6e64503f8c5/skills/remotion-markup/3d.md)、[TransitionSeries](https://github.com/remotion-dev/skills/blob/32b241b97f4e0e4ab61fe9a41b05e6e64503f8c5/skills/remotion-markup/transitions.md)。
- HyperFrames：[animation router](https://github.com/heygen-com/hyperframes/blob/9e9b613ccf867f98838617f7424967e056e63de2/skills/hyperframes-animation/SKILL.md)、[camera journey](https://github.com/heygen-com/hyperframes/blob/9e9b613ccf867f98838617f7424967e056e63de2/skills/hyperframes-animation/blueprints/camera-journey.md)、[transition overview](https://github.com/heygen-com/hyperframes/blob/9e9b613ccf867f98838617f7424967e056e63de2/skills/hyperframes-animation/transitions/overview.md)、[Three adapter](https://github.com/heygen-com/hyperframes/blob/9e9b613ccf867f98838617f7424967e056e63de2/skills/hyperframes-animation/adapters/three.md)。
- iart Motion Design：[art direction](https://github.com/iart-ai/motion-design-skills/blob/3c129f769d90a1328c209c386492333c9ac62312/skills/motion-art-direction/SKILL.md)、[direction playbook](https://github.com/iart-ai/motion-design-skills/blob/3c129f769d90a1328c209c386492333c9ac62312/skills/motion-art-direction/references/direction-playbook.md)。
- iart WebGL：[particle system](https://github.com/iart-ai/webgl-animation-skills/blob/50697d659fbf70152f48f9f8aadf1efe78bbdde1/skills/particle-system/SKILL.md)、[resource disposal](https://github.com/iart-ai/webgl-animation-skills/blob/50697d659fbf70152f48f9f8aadf1efe78bbdde1/skills/threejs-animation/references/resource-disposal.md)。

Remotion 的截至此提交仓库根目录未发现 LICENSE，不能因此推定其 Skill 文本可按 MIT 复制。HyperFrames 根许可证为 Apache-2.0；两套 iart 仓库为 MIT。以上来源用于分析与归因，本仓库未移植其代码。Remotion 运行库有自己的许可条件，见 [Remotion license](https://www.remotion.dev/license)，本仓库 MIT 不改变依赖、素材或声音的权利条件。

## 本次案例增加的方法

公开记录 [案例复盘](case-agent-video.md) 的可迁移经验：从页数转向语义段，从逐句 TTS 转向固定参考与上下文，从图标装饰转向身份/机制配图，从模板切页转向持续委托单；技术事实与产品热度推断始终分开。

当前 Skill 保留“先叙事，后空间/材质/运动，再渲染”的方向，补齐可运行范例、结构化分镜、文件验收与声音边界。它不取代 Remotion/HyperFrames 的完整 API 文档，也不宣称自动保证专业配音或所有题材的导演效果。

## README 结构调研

2026-10-11 直接查看公开 README，借鉴信息组织方式，不复制项目文案、品牌图形或界面：

- [Mermaid](https://github.com/mermaid-js/mermaid/blob/develop/README.md)：居中 Logo/标题、明确的一句话用途、快速入口和语言切换。用于本仓库的顶部入口。
- [LobeHub](https://github.com/lobehub/lobehub/blob/canary/README.md)：视觉 Banner、英文/中文切换与状态徽章。本仓库只保留相关徽章，不增加无依据的下载量或排行榜装饰。
- [Remotion](https://github.com/remotion-dev/remotion/blob/main/README.md)：从用途到 Get started，再到文档/许可/贡献入口。用于安装与样例运行的分工。
- [shadcn/ui](https://github.com/shadcn-ui/ui/blob/main/README.md)：简短产品定义、Hero 图与清楚的文档/贡献/许可入口。用于控制主 README 的解释负担，详细检查命令折叠，方法留在参考文档。

英文与中文 README 保持同等入口与检查范围。Banner 用独立原创 SVG 程序生成；演示 GIF 从修正成片重建并绑定源码版本。
