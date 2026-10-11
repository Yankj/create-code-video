# HyperFrames / GSAP seek 示例

这个最小入口演示有限、暂停、可定位的 GSAP 主时间轴，以及对象跨阶段延续。不是完整的 HyperFrames 渲染工程；已验证 GSAP 的正向/反向 seek，HyperFrames CLI 捕获需要在实际环境另行验证。

```bash
npm ci
npm test
python3 -m http.server 8080
```

浏览器打开 `http://localhost:8080/index.html?t=3`。也可在浏览器控制台调用 `renderAt(0)` / `renderAt(6)` / `renderAt(3)`；没有自主播放循环。

当前 HyperFrames 集成约定使用根节点有限 `data-duration`、注册 `window.__timelines` 和 seek 协议。合入 HyperFrames 项目后先核对其版本与 adapter，运行其 lint/check，再使用它的 preview/render；不能声称浏览器可打开就证明完整捕获通过。

`timeline.mjs` 的相同逻辑用于 Node 测试与浏览器。DOM 只读取时间轴状态，几何参数预先定义；不在 tween 更新时测量 layout。示例不依赖远程 CDN。
