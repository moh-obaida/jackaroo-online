/**
 * Octagonal Jackaroo board layout — flat-sided octagon matching physical boards.
 * Topology: 76 outer (18 track + 1 gate × 4), 16 home, 16 base nests.
 * Black nest top-left; track runs clockwise.
 */

import {
  BoardPosition,
  COLORS_ORDER,
  HOME_LENGTH,
  PlayerColor,
  TRACK_LENGTH,
} from '../../types/game';
import { getGlobalTrackIndex } from '../game/board';

export const BOARD_VIEW_SIZE = 640;

export type BoardPoint = { x: number; y: number };

export type BoardLayout = {
  size: number;
  center: number;
  outerTrack: BoardPoint[];
  home: Record<PlayerColor, BoardPoint[]>;
  base: Record<PlayerColor, BoardPoint[]>;
  nestCenter: Record<PlayerColor, BoardPoint>;
  homeEntry: Record<PlayerColor, BoardPoint>;
  /** V-notch centers on each cardinal side (home path origin) */
  vNotch: Record<PlayerColor, BoardPoint>;
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPt(a: BoardPoint, b: BoardPoint, t: number): BoardPoint {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

function dist(a: BoardPoint, b: BoardPoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Place `count` holes along a polyline (first = start, last = end). */
function placeHolesAlongPolyline(waypoints: BoardPoint[], count: number): BoardPoint[] {
  if (count <= 0) return [];
  if (count === 1) return [waypoints[0]];

  const segLens: number[] = [];
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const d = dist(waypoints[i], waypoints[i + 1]);
    segLens.push(d);
    total += d;
  }

  const sampleAt = (target: number): BoardPoint => {
    if (target <= 0) return { ...waypoints[0] };
    if (target >= total) return { ...waypoints[waypoints.length - 1] };
    let acc = 0;
    for (let s = 0; s < segLens.length; s++) {
      if (acc + segLens[s] >= target) {
        const t = (target - acc) / segLens[s];
        return lerpPt(waypoints[s], waypoints[s + 1], t);
      }
      acc += segLens[s];
    }
    return { ...waypoints[waypoints.length - 1] };
  };

  const out: BoardPoint[] = [];
  for (let h = 0; h < count; h++) {
    const target = (total * h) / (count - 1);
    out.push(sampleAt(target));
  }
  return out;
}

/** One quarter of the closed perimeter polyline (dense samples for arc-length placement). */
function sectionPolyline(waypoints: BoardPoint[], sectionIndex: number, samples = 56): BoardPoint[] {
  const n = waypoints.length - 1;
  const startT = sectionIndex / 4;
  const endT = (sectionIndex + 1) / 4;
  const pts: BoardPoint[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = lerp(startT, endT, i / samples);
    let pos = t * n;
    if (pos >= n) pos = n - 1e-6;
    const seg = Math.floor(pos);
    const frac = pos - seg;
    pts.push(lerpPt(waypoints[seg], waypoints[seg + 1], frac));
  }
  return pts;
}

type PerimeterFrame = {
  c: number;
  hw: number;
  hh: number;
  cut: number;
  notch: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  vTL: BoardPoint;
  vTR: BoardPoint;
  vBR: BoardPoint;
  vBL: BoardPoint;
  topMid: BoardPoint;
  rightMid: BoardPoint;
  bottomMid: BoardPoint;
  leftMid: BoardPoint;
  gateBlack: BoardPoint;
};

function buildFrame(c: number, hw: number, hh: number, cut: number, notch: number): PerimeterFrame {
  const x0 = c - hw;
  const x1 = c + hw;
  const y0 = c - hh;
  const y1 = c + hh;
  return {
    c,
    hw,
    hh,
    cut,
    notch,
    x0,
    x1,
    y0,
    y1,
    vTL: { x: x0 + cut, y: y0 + cut },
    vTR: { x: x1 - cut, y: y0 + cut },
    vBR: { x: x1 - cut, y: y1 - cut },
    vBL: { x: x0 + cut, y: y1 - cut },
    topMid: { x: c, y: y0 + notch },
    rightMid: { x: x1 - notch, y: c },
    bottomMid: { x: c, y: y1 - notch },
    leftMid: { x: x0 + notch, y: c },
    gateBlack: { x: x0 + cut * 0.38, y: y0 + cut * 0.72 },
  };
}

/**
 * Clockwise perimeter from black gate: TL diag → top (V) → TR diag → right (V) → …
 */
function buildPerimeterWaypoints(f: PerimeterFrame): BoardPoint[] {
  const { c, hw, hh, cut, notch, x0, x1, y0, y1 } = f;

  return [
    f.gateBlack,
    { x: x0 + cut * 0.52, y: y0 + cut * 0.42 },
    f.vTL,
    { x: x0 + cut * 0.62, y: y0 + cut * 0.12 },
    { x: x0 + hw * 0.28, y: y0 },
    { x: c - hw * 0.38, y: y0 },
    { x: c - notch * 0.65, y: y0 + notch * 0.42 },
    f.topMid,
    { x: c + notch * 0.65, y: y0 + notch * 0.42 },
    { x: c + hw * 0.38, y: y0 },
    { x: x1 - hw * 0.28, y: y0 },
    { x: x1 - cut * 0.62, y: y0 + cut * 0.12 },
    f.vTR,
    { x: x1 - cut * 0.52, y: y0 + cut * 0.42 },
    { x: x1, y: y0 + cut * 0.62 },
    { x: x1, y: c - hh * 0.38 },
    { x: x1 - notch * 0.42, y: c - notch * 0.65 },
    f.rightMid,
    { x: x1 - notch * 0.42, y: c + notch * 0.65 },
    { x: x1, y: c + hh * 0.38 },
    { x: x1, y: y1 - cut * 0.62 },
    { x: x1 - cut * 0.52, y: y1 - cut * 0.42 },
    f.vBR,
    { x: x1 - cut * 0.62, y: y1 - cut * 0.12 },
    { x: x1 - hw * 0.28, y: y1 },
    { x: c + hw * 0.38, y: y1 },
    { x: c + notch * 0.65, y: y1 - notch * 0.42 },
    f.bottomMid,
    { x: c - notch * 0.65, y: y1 - notch * 0.42 },
    { x: c - hw * 0.38, y: y1 },
    { x: x0 + hw * 0.28, y: y1 },
    { x: x0 + cut * 0.62, y: y1 - cut * 0.12 },
    f.vBL,
    { x: x0 + cut * 0.52, y: y1 - cut * 0.42 },
    { x: x0, y: y1 - cut * 0.62 },
    { x: x0, y: c + hh * 0.38 },
    { x: x0 + notch * 0.42, y: c + notch * 0.65 },
    f.leftMid,
    { x: x0 + notch * 0.42, y: c - notch * 0.65 },
    { x: x0, y: c - hh * 0.38 },
    { x: x0, y: y0 + cut * 0.62 },
    f.gateBlack,
  ];
}

function buildOuterTrackFromWaypoints(waypoints: BoardPoint[]): BoardPoint[] {
  const perSection = TRACK_LENGTH + 1;
  const out: BoardPoint[] = [];
  for (let s = 0; s < 4; s++) {
    const poly = sectionPolyline(waypoints, s);
    out.push(...placeHolesAlongPolyline(poly, perSection));
  }
  return out;
}

function nestAndBase(f: PerimeterFrame): {
  nestCenter: Record<PlayerColor, BoardPoint>;
  base: Record<PlayerColor, BoardPoint[]>;
} {
  const spread = f.hw * 0.048;
  const nests: Record<PlayerColor, BoardPoint> = {
    black: lerpPt(f.gateBlack, f.vTL, 0.42),
    green: lerpPt(
      { x: f.x1 - f.cut * 0.38, y: f.y0 + f.cut * 0.72 },
      f.vTR,
      0.42
    ),
    blue: lerpPt(
      { x: f.x1 - f.cut * 0.38, y: f.y1 - f.cut * 0.72 },
      f.vBR,
      0.42
    ),
    white: lerpPt(
      { x: f.x0 + f.cut * 0.38, y: f.y1 - f.cut * 0.72 },
      f.vBL,
      0.42
    ),
  };

  const base: Record<PlayerColor, BoardPoint[]> = {} as Record<PlayerColor, BoardPoint[]>;
  for (const color of COLORS_ORDER) {
    const nc = nests[color];
    base[color] = [
      { x: nc.x - spread, y: nc.y - spread },
      { x: nc.x + spread, y: nc.y - spread },
      { x: nc.x - spread, y: nc.y + spread },
      { x: nc.x + spread, y: nc.y + spread },
    ];
  }
  return { nestCenter: nests, base };
}

function homePaths(f: PerimeterFrame): {
  home: Record<PlayerColor, BoardPoint[]>;
  homeEntry: Record<PlayerColor, BoardPoint>;
  vNotch: Record<PlayerColor, BoardPoint>;
} {
  const { c } = f;
  const step = f.hw * 0.1;
  const inward = 20;

  const vNotch: Record<PlayerColor, BoardPoint> = {
    black: f.topMid,
    green: f.rightMid,
    blue: f.bottomMid,
    white: f.leftMid,
  };

  const homeEntry = { ...vNotch };

  const home: Record<PlayerColor, BoardPoint[]> = {
    black: Array.from({ length: HOME_LENGTH }, (_, i) => ({
      x: c,
      y: f.topMid.y + inward + i * step,
    })),
    green: Array.from({ length: HOME_LENGTH }, (_, i) => ({
      x: f.rightMid.x - inward - i * step,
      y: c,
    })),
    blue: Array.from({ length: HOME_LENGTH }, (_, i) => ({
      x: c,
      y: f.bottomMid.y - inward - i * step,
    })),
    white: Array.from({ length: HOME_LENGTH }, (_, i) => ({
      x: f.leftMid.x + inward + i * step,
      y: c,
    })),
  };

  return { home, homeEntry, vNotch };
}

const layoutCache = new Map<number, BoardLayout>();

export function getBoardLayout(size = BOARD_VIEW_SIZE): BoardLayout {
  const cached = layoutCache.get(size);
  if (cached) return cached;

  const c = size / 2;
  const hw = size * 0.358;
  const hh = size * 0.358;
  const cut = size * 0.112;
  const notch = size * 0.052;

  const frame = buildFrame(c, hw, hh, cut, notch);
  const waypoints = buildPerimeterWaypoints(frame);
  const outerTrack = buildOuterTrackFromWaypoints(waypoints);
  const { nestCenter, base } = nestAndBase(frame);
  const { home, homeEntry, vNotch } = homePaths(frame);

  const layout: BoardLayout = {
    size,
    center: c,
    outerTrack,
    home,
    base,
    nestCenter,
    homeEntry,
    vNotch,
  };
  layoutCache.set(size, layout);
  return layout;
}

export function boardPositionToPoint(pos: BoardPosition, layout = getBoardLayout()): BoardPoint | null {
  const ci = COLORS_ORDER.indexOf(pos.color);
  if (ci === -1) return null;

  switch (pos.type) {
    case 'track': {
      const gi = getGlobalTrackIndex(pos);
      if (gi < 0 || gi >= layout.outerTrack.length) return null;
      return layout.outerTrack[gi];
    }
    case 'start_gate': {
      const gi = ci * (TRACK_LENGTH + 1);
      return layout.outerTrack[gi] ?? null;
    }
    case 'home':
      return layout.home[pos.color]?.[pos.index] ?? null;
    case 'base':
      return layout.base[pos.color]?.[pos.index] ?? null;
    default:
      return null;
  }
}

export function marbleToPoint(
  marble: { color: PlayerColor; position: BoardPosition },
  layout = getBoardLayout()
): BoardPoint | null {
  return boardPositionToPoint(marble.position, layout);
}

export function octagonOutlinePoints(layout: BoardLayout, inset = 0): string {
  const c = layout.center;
  const hw = layout.size * 0.358 - inset;
  const hh = layout.size * 0.358 - inset;
  const cut = layout.size * 0.112 - inset * 0.4;
  const x0 = c - hw;
  const x1 = c + hw;
  const y0 = c - hh;
  const y1 = c + hh;
  const pts = [
    { x: x0 + cut, y: y0 },
    { x: x1 - cut, y: y0 },
    { x: x1, y: y0 + cut },
    { x: x1, y: y1 - cut },
    { x: x1 - cut, y: y1 },
    { x: x0 + cut, y: y1 },
    { x: x0, y: y1 - cut },
    { x: x0, y: y0 + cut },
  ];
  return pts.map((p) => `${p.x},${p.y}`).join(' ');
}

export function scaleLayout(layout: BoardLayout, targetSize: number): BoardLayout {
  if (targetSize === layout.size) return layout;
  const scale = targetSize / layout.size;
  const mapPt = (p: BoardPoint): BoardPoint => ({ x: p.x * scale, y: p.y * scale });
  const mapRecord = (rec: Record<PlayerColor, BoardPoint[]>) => {
    const out = {} as Record<PlayerColor, BoardPoint[]>;
    for (const col of COLORS_ORDER) out[col] = rec[col].map(mapPt);
    return out;
  };
  const mapSingle = (rec: Record<PlayerColor, BoardPoint>) => {
    const out = {} as Record<PlayerColor, BoardPoint>;
    for (const col of COLORS_ORDER) out[col] = mapPt(rec[col]);
    return out;
  };
  return {
    size: targetSize,
    center: layout.center * scale,
    outerTrack: layout.outerTrack.map(mapPt),
    home: mapRecord(layout.home),
    base: mapRecord(layout.base),
    nestCenter: mapSingle(layout.nestCenter),
    homeEntry: mapSingle(layout.homeEntry),
    vNotch: mapSingle(layout.vNotch),
  };
}
