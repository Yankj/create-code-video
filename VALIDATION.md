# Validation — 2026-10-11

Environment: macOS ARM64, Node 22.17.1, Python 3.12, Remotion 4.0.534, React 19.2.3, R3F 9.5.0, Three.js 0.181.2.

| Check | Result |
| --- | --- |
| skill-creator quick_validate.py | Passed |
| Python storyboard/media tests | 9 passed, including actual encode/decode, spec mismatch, corruption and ending-tail checks |
| Motion Lab deterministic logic tests | 3 passed |
| GSAP seek test | 1 passed, forward/backward/scrambled seek |
| TypeScript | Passed |
| GPU still captures | 9 requested captures: representative frames, cut −1/0/+1, start/end, repeated frame |
| Same frame after scrambled independent render requests | Identical PNG SHA-256 |
| Visual inspection | Viewed contact sheet of start, gather, handoff, closing and end; occlusion peak deliberately covers the cut |
| Full MP4 | See the measured result below |

Measured full export: 1080×1920, 30fps, 18.000s, 540 frames, H.264, no audio. `qa_video.py` matched all requested delivery specs and completed full ffmpeg decode without errors. The generated preview GIF is reduced to 240px wide / 10fps; it does not replace the full render.

The default Remotion-downloaded Chrome Headless Shell 157 timed out at root loading on this machine, including a minimal 2D Composition. Chrome for Testing Headless Shell 148.0.7778.96 succeeded with the same project. Both CLI and render-check support `REMOTION_BROWSER_EXECUTABLE`; no developer-specific path is embedded in source.

These results establish reproducible logic and actual offline GPU capture on this environment. They do not establish identical typography/pixels on every operating system. Default fonts use local Chinese font fallback; production projects should package a permitted fixed font.

The Motion Lab is silent: no TTS or listening result is claimed. The HyperFrames entry's GSAP seek is tested; a complete HyperFrames CLI capture is not claimed. Scrambled independent render requests do not prove persistent-instance seek; check that separately in Studio/Player.

The GitHub Actions workflow tests structure, media utilities, deterministic logic and TypeScript. It does not run full GPU rendering or judge direction/listening quality.

Public-package audit: example lockfiles contain only `https://registry.npmjs.org` tarball URLs. The validated Remotion package versions and integrity values were retained while canonical public URLs replaced the developer mirror metadata. The repository checker rejects non-public registry addresses in these example lockfiles. No private screenshots, credentials, TTS references or model caches are included.
