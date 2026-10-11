# 三维、粒子与 Shader

## 先给粒子一个角色

粒子可以是输入数据、散落任务、执行信号、聚合证据或结果。不必全部发光：形状、体积、速度分布、遮挡和相机视差更能建立空间。背景粒子不应比主要文本更亮。

一条可用的导演链：散布 → 被目标吸引 → 沿路径输送 → 汇聚成结构 → 相机落在结果。每阶段有清楚的意义、时间窗和阅读落点；避免整片同速自转。

## 解析求值优先

对离线逐帧渲染，粒子状态需要能独立定位：

```text
seeded attributes = seed → position, phase, speed, size, target
free(t) = base + bounded periodic flow(t, phase)
gather(t) = mix(free(t), target, smoothProgress(t))
transport(t) = path(t) + localOrbit(t, phase)
position(t) = blend stages at declared boundaries
```

有机运动可以来自多个低频波、错相轨道、带时间的噪声与深度分布。不要把几条 sine 波命名为真实 curl noise；需要无散场才计算向量势的 curl。复杂流体/碰撞采用固定步长预模拟，再插值缓存；不要在随机 seek 时用上次位置继续积分。

GPU 粒子用 BufferGeometry 的固定 attributes + ShaderMaterial uniforms。`uTime = frame / fps`；颜色、大小和吸引强度也使用该时间。少量 CPU 粒子可用解析位置；上千颗尽量批处理，避免每颗一个 Mesh 和逐帧 new Vector3。

内置 [GPU 示例](../examples/remotion-motion-lab/src/ParticleJourney.tsx) 使用固定种子、球体→环形目标、输送到右侧结构的混合、深度点大小与圆形 fragment。它是解析近似，不是物理模拟。

## 相机与空间

- 正确设置 aspect、near/far 与世界尺度。相机不能穿过聚合目标；校验最接近镜头的粒子与物体。
- 遮挡、大小差、前景经过与不同深度速度能建立立体感。纯屏幕坐标漂浮加“3D”标签不能替代空间。
- 使用平滑的相机位置与 look-at 路径；在需要读取文字处固定镜头。字幕/关键正文可留在屏幕空间，避免随着相机缩得过小。
- GLTF AnimationMixer 使用绝对时间 `setTime(t)`；记录 clip、速度、循环范围。不能混用时钟增量和定位。
- 后期 motion blur、TAA 或 feedback 可能依赖前帧。需要可复现的预卷/多采样方案，否则使用无历史方案。

## 灯光与材质

先验证单帧：主光塑形，补光保留暗部，轮廓光帮助分离背景。金属需要反射来源；粗糙度与环境共同决定高光。不能用高 Bloom 把几何和文字融成一团。

顶点位移后，光照法线需要匹配：CPU 几何可重算法线，Shader 形变可用解析/导数法线或一致的法线修正。先检查 mesh 拓扑和包围体，不能靠提高灯光掩盖错误法线。

## 生命周期与性能

- 大量同材质物体用 Points/InstancedMesh。先测最重镜头的真实渲染成本，再提高粒子数量。
- 稳定分配 buffers、uniforms 和材质；只改数值。减少透明叠层造成的 overdraw，按画布分辨率测性能。
- 资源按所有权释放：几何、材质、纹理、render target 分别管理。释放材质不会自动释放其纹理。
- R3F 声明式资源通常由其生命周期管理；手动创建资源配套 cleanup。共享资源在最后一个所有者结束前不能释放，避免 double-dispose 或影响其他镜头。
- 不清除还在复用的 loader 缓存；私有克隆与共享原件分开。Renderer/context 仅在最终 teardown 销毁，不能每帧销毁。
- 用 renderer.info 看重复挂载前后几何/纹理基线；数值持续增长再定位泄漏。JS heap 正常不证明 GPU 资源正常。

## 集成边界

Remotion：ThreeCanvas 传 width/height，所有动画由 `useCurrentFrame()` 决定；ThreeCanvas 内的 Sequence 使用 `layout="none"`。示例依赖在 lockfile 固定。

HyperFrames：核对当前 Three adapter 的 `hf-seek` 事件与 readiness，根节点显式有限时长；渲染关键资源注册到当前框架就绪机制。不以自由运行 requestAnimationFrame 作为真值。

参考依据见 [调研记录](research-and-attribution.md)。不要直接复制交互 WebGL 示例中的 `Math.random()` / clock / 增量 loop 到离线视频。
