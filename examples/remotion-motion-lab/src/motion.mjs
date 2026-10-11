// All state is a pure function of absolute time, fixed seed and config.
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const smooth = (t, start, end) => {
  const p = clamp((t - start) / (end - start));
  return p * p * (3 - 2 * p);
};
export const mix = (a, b, p) => a + (b - a) * p;
export function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
export function particleData(count = 1800, seed = 1409) {
  const rand = seeded(seed);
  const base = new Float32Array(count * 3);
  const target = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const phi = rand() * Math.PI * 2, y = rand() * 2 - 1;
    const radius = 1.9 + rand() * 0.6;
    const r = Math.sqrt(1 - y * y);
    base.set([radius * r * Math.cos(phi), radius * y, radius * r * Math.sin(phi)], i * 3);
    const angle = i / count * Math.PI * 2, band = rand() * 0.2 - 0.1;
    target.set([(1 + band) * Math.cos(angle), (1 + band) * Math.sin(angle), band * 2], i * 3);
    phase[i] = rand() * Math.PI * 2;
  }
  return {base, target, phase};
}
export function stageAt(t) {
  return {gather: smooth(t, 1.6, 4.2), handoff: smooth(t, 5.2, 8.6),
    verify: smooth(t, 10.8, 11.8), closing: smooth(t, 15, 16),
    fieldAlpha: mix(1, 0.13, smooth(t, 10.8, 12.2))};
}
export function cameraAt(t) {
  const p = smooth(t, 5.2, 8.6);
  return {position: [mix(0, 2.2, p), 0.2 + Math.sin(p * Math.PI) * 0.55, mix(11, 9.5, p)],
    target: [mix(0, 2.2, p), 0, 0]};
}
// CPU counterpart for structural tests; GPU evaluates the same analytic stages.
export function particleAt(data, i, t) {
  const s = stageAt(t), ph = data.phase[i];
  const p = [0, 1, 2].map(axis => mix(data.base[i*3+axis] + Math.sin(t*0.6+ph+axis)*0.09,
    data.target[i*3+axis], s.gather));
  const angle = t * 0.45, x = p[0]*Math.cos(angle)-p[2]*Math.sin(angle);
  const z = p[0]*Math.sin(angle)+p[2]*Math.cos(angle);
  return [x+s.handoff*2.2, p[1]+Math.sin(s.handoff*Math.PI)*0.7, z];
}
