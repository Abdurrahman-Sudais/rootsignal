/**
 * Procedural root imagery used for the demonstration.
 *
 * Each growing zone has a seed. The seed produces a stable root "tree" so that
 * observations of the same zone share structure, and individual observations
 * vary only by visible density, tone and photo quality. This lets the demo show
 * a believable previous-versus-current comparison without shipping photographs.
 */

export const IMAGE_W = 400;
export const IMAGE_H = 300;

export interface RootSegment {
  d: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  /** 0–1. Segment is visible when rank <= density. */
  rank: number;
  /** 0–1 per-segment tone variation. */
  tone: number;
  length: number;
}

export interface RootImageParams {
  seed: number;
  /** Visible root density 0–1. */
  density: number;
  /** Visible darkening of root tone 0–1 (appearance only). */
  browning: number;
  quality: 'good' | 'poor';
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cache = new Map<number, RootSegment[]>();

export function generateRootTree(seed: number): RootSegment[] {
  const cached = cache.get(seed);
  if (cached) return cached;
  const rng = mulberry32(seed);
  const segments: RootSegment[] = [];

  const grow = (x: number, y: number, angle: number, width: number, steps: number, depth: number, parentRank: number) => {
    let cx = x;
    let cy = y;
    let a = angle;
    const stepLen = depth === 0 ? 20 : 13 - depth * 2;
    for (let i = 0; i < steps; i++) {
      a += (rng() - 0.5) * 0.5;
      // gravity pulls roots downward
      a += (Math.PI / 2 - a) * (depth === 0 ? 0.12 : 0.04);
      const nx = cx + Math.cos(a) * stepLen;
      const ny = cy + Math.sin(a) * stepLen;
      const mx = (cx + nx) / 2 + (rng() - 0.5) * 6;
      const my = (cy + ny) / 2 + (rng() - 0.5) * 6;
      const own = rng();
      const rank = depth === 0 ? 0 : Math.max(parentRank, own * 0.9 + depth * 0.05);
      const w = Math.max(0.5, width * (1 - i / (steps * 1.6)));
      segments.push({
        d: `M${cx.toFixed(1)} ${cy.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)}`,
        x: nx,
        y: ny,
        width: w,
        depth,
        rank,
        tone: rng(),
        length: stepLen,
      });
      if (depth < 3 && rng() < (depth === 0 ? 0.62 : 0.4)) {
        const side = rng() < 0.5 ? -1 : 1;
        grow(nx, ny, a + side * (0.7 + rng() * 0.6), w * 0.6, Math.round(3 + rng() * (7 - depth * 2)), depth + 1, rank);
      }
      cx = nx;
      cy = ny;
      if (cy > IMAGE_H + 10 || cx < -10 || cx > IMAGE_W + 10) break;
    }
  };

  const primaries = 4 + Math.floor(rng() * 3);
  for (let p = 0; p < primaries; p++) {
    const x = 90 + (p + 0.5) * (220 / primaries) + (rng() - 0.5) * 20;
    grow(x, -4, Math.PI / 2 + (rng() - 0.5) * 0.9, 3.4 + rng() * 1.2, 12 + Math.floor(rng() * 4), 0, 0);
  }
  cache.set(seed, segments);
  return segments;
}

export function isVisible(seg: RootSegment, density: number): boolean {
  return seg.rank <= density;
}

const CREAM: [number, number, number] = [236, 228, 204];
const BROWN: [number, number, number] = [122, 88, 52];

export function segmentBrowning(seg: RootSegment, browning: number): number {
  const lowerBias = 0.45 + (seg.y / IMAGE_H) * 0.9;
  return Math.min(1, browning * lowerBias * (0.6 + seg.tone * 0.8));
}

export function segmentColor(seg: RootSegment, browning: number): string {
  const t = segmentBrowning(seg, browning);
  const c = CREAM.map((v, i) => Math.round(v + (BROWN[i] - v) * t));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
}

export interface DiffCell {
  x: number;
  y: number;
  w: number;
  h: number;
  score: number;
}

/**
 * Simulated visual change detection: splits the frame into a grid and compares
 * visible root length and tone per cell between two observations.
 */
export function diffObservations(
  seed: number,
  a: Pick<RootImageParams, 'density' | 'browning'>,
  b: Pick<RootImageParams, 'density' | 'browning'>,
  cols = 5,
  rows = 4,
): { cells: DiffCell[]; changeScore: number; densityDelta: number; toneDelta: number } {
  const segs = generateRootTree(seed);
  const cw = IMAGE_W / cols;
  const ch = IMAGE_H / rows;
  const stats = Array.from({ length: cols * rows }, () => ({ la: 0, lb: 0, ta: 0, tb: 0 }));
  let totalA = 0;
  let totalB = 0;
  let toneA = 0;
  let toneB = 0;
  for (const s of segs) {
    const col = Math.min(cols - 1, Math.max(0, Math.floor(s.x / cw)));
    const row = Math.min(rows - 1, Math.max(0, Math.floor(s.y / ch)));
    const st = stats[row * cols + col];
    const len = s.length * s.width;
    if (isVisible(s, a.density)) {
      st.la += len;
      st.ta += segmentBrowning(s, a.browning) * len;
      totalA += len;
      toneA += segmentBrowning(s, a.browning) * len;
    }
    if (isVisible(s, b.density)) {
      st.lb += len;
      st.tb += segmentBrowning(s, b.browning) * len;
      totalB += len;
      toneB += segmentBrowning(s, b.browning) * len;
    }
  }
  const cells: DiffCell[] = [];
  stats.forEach((st, i) => {
    const max = Math.max(st.la, st.lb);
    if (max < 20) return;
    const lenDiff = Math.abs(st.la - st.lb) / max;
    const toneDiff = Math.abs((st.ta / (st.la || 1)) - (st.tb / (st.lb || 1)));
    const score = lenDiff + toneDiff * 1.4;
    if (score > 0.5) {
      cells.push({ x: (i % cols) * cw, y: Math.floor(i / cols) * ch, w: cw, h: ch, score: Math.min(1, score) });
    }
  });
  const densityDelta = totalA ? (totalB - totalA) / totalA : 0;
  const toneDelta = (toneB / (totalB || 1)) - (toneA / (totalA || 1));
  const changeScore = Math.min(100, Math.round(Math.abs(densityDelta) * 100 + Math.abs(toneDelta) * 180));
  // Outline only the strongest regions so the overlay stays readable.
  const strongest = cells.sort((x, y) => y.score - x.score).slice(0, 6);
  return { cells: strongest, changeScore, densityDelta, toneDelta };
}
