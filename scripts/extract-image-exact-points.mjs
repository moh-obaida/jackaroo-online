/**
 * Build IMAGE_EXACT_POINTS from board image hole detection.
 * Track order follows boardGeometry clockwise outer track (black section first).
 * Run: node scripts/extract-image-exact-points.mjs > scripts/image-exact-points.json
 */

import fs from 'fs';
import jpeg from 'jpeg-js';
import { execSync } from 'child_process';

const COLORS_ORDER = ['black', 'green', 'blue', 'white'];
const TRACK_LENGTH = 18;
const HOME_LENGTH = 4;

const buf = fs.readFileSync('public/assets/board/jakaroo-board-game-empty.png');
const { width: W, height: H, data } = jpeg.decode(buf, { useTArray: true });

function lum(x, y) {
  const i = (W * y + x) * 4;
  return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
}

function score(x, y) {
  let s = 0;
  let n = 0;
  for (let dy = -10; dy <= 10; dy++) {
    for (let dx = -10; dx <= 10; dx++) {
      const xx = x + dx;
      const yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
      const L = lum(xx, yy);
      if (L < 52) {
        s += 52 - L;
        n++;
      }
    }
  }
  return n > 28 ? s / n : 0;
}

const peaks = [];
for (let y = 8; y < H - 8; y += 3) {
  for (let x = 8; x < W - 8; x += 3) {
    const s = score(x, y);
    if (s < 9) continue;
    let isMax = true;
    for (let dy = -14; dy <= 14 && isMax; dy++) {
      for (let dx = -14; dx <= 14 && isMax; dx++) {
        if (!dx && !dy) continue;
        if (score(x + dx, y + dy) > s + 0.25) isMax = false;
      }
    }
    if (isMax) peaks.push({ x, y, s });
  }
}

peaks.sort((a, b) => b.s - a.s);
const holes = [];
for (const p of peaks) {
  if (holes.some((h) => (h.x - p.x) ** 2 + (h.y - p.y) ** 2 < 42 ** 2)) continue;
  holes.push({ x: p.x, y: p.y, s: p.s, used: false });
}

function pct(h) {
  return { x: +((h.x / W) * 100).toFixed(2), y: +((h.y / H) * 100).toFixed(2) };
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function snapHint(hint, maxDist = 4) {
  let best = null;
  let bestD = Infinity;
  for (const h of holes) {
    if (h.used) continue;
    const p = pct(h);
    const d = dist(hint, p);
    if (d < bestD && d <= maxDist) {
      bestD = d;
      best = h;
    }
  }
  if (best) {
    best.used = true;
    return pct(best);
  }
  return { x: +Number(hint.x).toFixed(2), y: +Number(hint.y).toFixed(2) };
}

/** Pass 1 live-calibrated base + gates. */
const BASE = {
  black: [
    { x: 21.68, y: 17.38 },
    { x: 28.91, y: 19.53 },
    { x: 21.29, y: 25.78 },
    { x: 24.8, y: 29.88 },
  ],
  green: [
    { x: 69.73, y: 15.23 },
    { x: 81.84, y: 15.23 },
    { x: 69.73, y: 27.73 },
    { x: 82.81, y: 27.73 },
  ],
  blue: [
    { x: 66.02, y: 73.63 },
    { x: 77.73, y: 73.05 },
    { x: 68.65, y: 77.73 },
    { x: 79.79, y: 78.91 },
  ],
  white: [
    { x: 21.68, y: 73.05 },
    { x: 25.98, y: 68.95 },
    { x: 22.07, y: 84.18 },
    { x: 27.15, y: 80.08 },
  ],
};

const GATES = {
  black: { x: 50.2, y: 20.51 },
  green: { x: 79.49, y: 47.85 },
  blue: { x: 47.46, y: 78.13 },
  white: { x: 17.19, y: 45.7 },
};

/** V-slot home groove seeds (outer index 0 → finish index 3). */
const HOME_SEEDS = {
  black: [
    { x: 50.0, y: 24.2 },
    { x: 50.0, y: 30.1 },
    { x: 50.0, y: 36.0 },
    { x: 50.0, y: 41.8 },
  ],
  green: [
    { x: 75.8, y: 50.0 },
    { x: 69.9, y: 50.0 },
    { x: 64.0, y: 50.0 },
    { x: 58.2, y: 50.0 },
  ],
  blue: [
    { x: 50.0, y: 75.8 },
    { x: 50.0, y: 69.9 },
    { x: 50.0, y: 64.0 },
    { x: 50.0, y: 58.2 },
  ],
  white: [
    { x: 24.2, y: 50.0 },
    { x: 30.1, y: 50.0 },
    { x: 36.0, y: 50.0 },
    { x: 41.8, y: 50.0 },
  ],
};

for (const c of COLORS_ORDER) {
  for (const pt of BASE[c]) snapHint(pt, 2.5);
  snapHint(GATES[c], 2.5);
}

const hintsJson = execSync(
  `npx tsx -e "
import { boardPositionToPoint, getBoardLayout } from './src/lib/board/boardGeometry.ts';
import { COLORS_ORDER, TRACK_LENGTH } from './src/types/game.ts';
const L=100; const inset={x:0.052,y:0.052,w:0.896,h:0.896};
const layout=getBoardLayout(L);
const toPct=(pt)=>({x:inset.x*100+(pt.x/L)*inset.w*100,y:inset.y*100+(pt.y/L)*inset.h*100});
const out={track:{}};
for(const c of COLORS_ORDER){
  out.track[c]=[];
  for(let i=0;i<${TRACK_LENGTH};i++) out.track[c].push(toPct(boardPositionToPoint({color:c,type:'track',index:i},layout)));
}
console.log(JSON.stringify(out));
"`,
  { cwd: process.cwd(), encoding: 'utf8' }
);
const hints = JSON.parse(hintsJson.trim());

const exact = {
  base: BASE,
  gates: GATES,
  home: {},
  track: {},
};

for (const color of COLORS_ORDER) {
  exact.home[color] = HOME_SEEDS[color].map((h) => snapHint(h, 3.5));

  exact.track[color] = [];
  for (let i = 0; i < TRACK_LENGTH; i++) {
    const hint = hints.track[color][i];
    // Outer ring only — ignore nest/home holes already used
    exact.track[color].push(snapHint(hint, 4.5));
  }
}

fs.writeFileSync('scripts/image-exact-points.json', JSON.stringify(exact, null, 2));
console.log('Wrote scripts/image-exact-points.json (108 points)');
