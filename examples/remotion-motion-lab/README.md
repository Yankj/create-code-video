# Remotion Motion Lab

一个 18 秒、1080×1920、30fps 的无声原创示例。演示机制：固定输入粒子 → 聚合 → 空间交接 → 遮挡揭示 → 持续对象验收 → 收束停留。图形与三维由代码产生，无远程图片、字体、模型或 TTS 调用。

```bash
npm ci
npm test
npm run typecheck
npm run studio
npm run smoke
npm run frames
npm run render
npm run verify-export
```

Node 22；需要获取 npm 依赖和首次安装的渲染浏览器。`out/` 被 Git 忽略。软件 WebGL 参数适用于离线环境，GPU 可用时按实际条件调整。默认字体使用操作系统中文字体回退，因此不同机器的字形与排版可能略有差别；正式交付应将有许可的指定字体纳入工程并等待加载。

若默认下载的浏览器发生 root component 超时，先用最小 Composition 判断是否与三维代码无关，再试兼容的 Chrome/Chromium。CLI 配置与 frames 脚本均支持 `REMOTION_BROWSER_EXECUTABLE` 指向本机浏览器可执行文件；不把开发者的绝对路径写进工程。本次实渲染使用了该替代路线，详见根目录验证记录。

## 可复用点

- `src/motion.mjs`：种子属性、平滑进度、绝对时间阶段、相机路径与粒子 CPU 结构检查。
- `src/ParticleJourney.tsx`：ThreeCanvas、GPU attributes、由帧同步的 Shader uniforms、真实三维相机、声明式资源生命周期。
- `src/layout.mjs` / `src/layout-contract.mjs` / `src/LayoutAudit.tsx`：统一设计坐标、实际字体就绪、变换后的 DOM/文字边界与卡片/字幕间距；每个导出帧超限会取消渲染。
- `src/MotionLab.tsx`：跨镜头持续对象、语义文字、明亮重点、SVG 图形、确定性遮挡与结尾落定。
- `scripts/render-check.mjs`：同帧、乱序独立取帧、切点前后、首尾与代表帧；实际 GPU 输出仍需查看。包含 1080/720 同比例输出与重叠、超长文案反例；只有明确的布局错误才计作预期拒绝。

“乱序独立取帧”不等于持续挂载实例的来回 seek；Studio/Player 中应另行检查持续实例。结构测试不证明 GPU 渲染效果，MP4 解码不证明流畅听感。本例没有配音，声音流程见主 Skill 的声音参考。

## 修改

文字内容在 MotionLab，布局坐标和保留区在 layout.mjs。卡片高度、明确行高、图标 flex 对齐与底部锚定保持一致；修改文案后运行 frames，检查不能用静默裁切代替。粒子数量/种子/目标结构在 motion，Shader 对应同一阶段函数。修改解析公式时同步 CPU 结构检查与 GPU 方程。更换比例必须重排文字、卡片和相机 aspect；不能直接裁切。

本示例的主要动作发生在机制主体，字幕是屏幕空间；没有把整片字幕或相机都做持续最大幅度运动。可以改变风格、画布与 Topic，不需要沿用本例的具体颜色、段数或对象。

## 重建 README 预览

已安装 Python/Pillow 与 ffmpeg/ffprobe 时，在本例目录运行 `npm run preview:build`，依次检查关键帧/反例、完整渲染、解码和成片/单帧一致性，全部通过后才写 GIF。

也可完成导出与画面检查后，从仓库根目录运行：

```bash
python3 scripts/build_preview.py examples/remotion-motion-lab/out/motion-lab.mp4 assets/motion-lab-preview.gif
python3 scripts/build_preview.py --check assets/motion-lab-preview.json
```

需要 Pillow、ffmpeg、ffprobe。工具记录预览对应的源码输入；改变渲染源码或依赖锁后，必须重新导出和生成 GIF。README Banner 是独立原创 SVG，可用 `python3 scripts/build_banner.py` 复现。
