# Validation — v3.1.0 — 2026-10-11

Environment: macOS ARM64, Node 22.17.1, Python 3.12, Remotion 4.0.534, React 19.2.3, R3F 9.5.0, Three.js 0.181.2.

## Corrected export

The previous demo allowed an intrinsic-height card to overlap a separately positioned caption. This revision shares a design plane, fixes card/typography dimensions, anchors its scale to the bottom, and reserves the caption area. The actual font glyph bounds required additional space beyond nominal font-size calculations.

A second check found fresh stills and the continuous export disagreed in particle state. Stable Shader uniform objects with frame-derived `.value` updates corrected the cached state. The older export was rejected by the encoded/still comparison at 6 sampled frames; its maximum visual-region RGB MAE was 12.3202 (limit 6).

| Check | Result |
| --- | --- |
| skill-creator quick_validate.py | Passed |
| Python utilities | 14 tests passed: storyboard, real media encode/decode, HTML/Markdown links, current and stale preview cases |
| Motion Lab deterministic/layout rules | 6 tests passed, including overlap and text overflow regressions |
| GSAP seek | 1 test passed, forward/backward/scrambled seek |
| TypeScript | Passed |
| Actual font-ready DOM/GPU still checks | 18 captures passed, including 1080×1920 and 720×1280 layouts, cut −1/0/+1, action/occlusion states and first/last frames |
| Card/caption clearance | Minimum measured 72 design pixels; transformed bounds checked |
| Broken-layout negative cases | Both overlap and long text were rejected by real browser measurement |
| Repeated frame after scrambled independent requests | Identical PNG SHA-256 |
| Full export | 1080×1920, 30fps, 18.000s, 540 frames, H.264, silent |
| Every export frame's layout guard | Completed full export with no declared layout violations |
| Full MP4 decode/specs | Passed |
| Encoded frames vs independent stills | 16 samples passed; maximum full-frame MAE 2.1694, visual-region MAE 2.7442 (limits 5 / 6) |
| GIF | 360×640, 180 frames at 100ms each, 18.000s, infinite loop |
| GIF vs same sampled/scaled MP4 | All 180 frames passed; maximum RGB MAE 2.1985 (palette tolerance 8) |
| Preview provenance | GIF hash, source MP4 hash and source-file hashes recorded; stale source/asset negative cases rejected |
| Visual inspection | Viewed corrected full-export contact sheet, handoff frame, GIF frame and original Banner render; card, labels and caption have separate readable regions |

The continuous export checks run before the preview is replaced through `npm run preview:build`. A failed media check left the prior preview intact; after fixing the local ffprobe environment, decoding/comparison passed and the corrected GIF was generated. The preview's source record is [assets/motion-lab-preview.json](assets/motion-lab-preview.json).

## Reproduction and boundaries

The default Remotion-downloaded Chrome Headless Shell 157 timed out at root loading on this machine, including a minimal 2D composition. Chrome Headless Shell 148.0.7778.96 succeeded. CLI and render-check support `REMOTION_BROWSER_EXECUTABLE`; no developer-specific path is embedded in source. Use a working native ffmpeg/ffprobe installation for media utilities.

Fonts use local Chinese fallback. Actual layout checks catch declared violations on the rendering machine, but do not prove identical glyphs/pixels across operating systems. Production projects should package a permitted font. Export/still comparisons allow codec and capture-scale differences in the same environment; thresholds are configurable, not universal quality scores.

The 16 encoded/still samples do not prove every GPU pixel or persistent-player seek. Check continuous playback and persistent seek separately in Studio/Player. The declared DOM layout guard runs each export frame, but does not judge artistic hierarchy, every decorative overlap or platform UI outside its configured regions.

The Motion Lab is silent; no listening or TTS result is claimed. The HyperFrames entry's GSAP seek is tested; full HyperFrames CLI capture is not claimed.

GitHub Actions runs the 21 Python/Node tests, TypeScript, document targets and preview source/hash freshness. It does not run full GPU export or artistic/listening review. The source MP4 is not stored in Git: CI checks the committed GIF and current source hashes, while frame fidelity was measured against the local verified export.

Public lockfiles contain only public npm HTTPS tarball URLs. The checker rejects developer mirrors. Original Banner/icon assets are code drawn. No private screenshots, credentials, voice references or model caches are included.
