/**
 * Builds IMAGE_EXACT_POINTS from live-clicked calibration JSON (108 points).
 * Source: src/lib/board/board-coordinates.json
 *
 * Clicks are classified into buckets, then sorted into engine slot order.
 * Track/gate indices are never mixed — gates sit between track sections in click order.
 */

import type { PlayerColor } from '../../types/game';
import { COLORS_ORDER, TRACK_LENGTH } from '../../types/game';
import type { BoardImagePoint, ExactImagePoints } from './imageBoardCoordinateTypes';
import calibrationClicks from './board-coordinates.json';

const BOARD_CENTER: BoardImagePoint = { x: 50, y: 50 };

/** Live calibration click index → bucket (108 clicks total). */
export const CALIBRATION_CLICK_MAP = {
  home: {
    black: [0, 1, 2, 3],
    green: [104, 105, 106, 107],
    blue: [84, 85, 86, 87],
    white: [88, 89, 90, 91],
  },
  gates: {
    black: 4,
    green: 23,
    blue: 42,
    white: 61,
  },
  track: {
    black: Array.from({ length: TRACK_LENGTH }, (_, i) => 5 + i),
    green: Array.from({ length: TRACK_LENGTH }, (_, i) => 24 + i),
    blue: Array.from({ length: TRACK_LENGTH }, (_, i) => 43 + i),
    white: Array.from({ length: TRACK_LENGTH }, (_, i) => 62 + i),
  },
  base: {
    green: [80, 81, 82, 83],
    white: [92, 93, 94, 95],
    blue: [96, 97, 98, 99],
    black: [100, 101, 102, 103],
  },
} as const;

/** Expected board quadrant for each nest centroid (validates base ≠ home swap). */
const BASE_NEST_REGION: Record<PlayerColor, { x: 'low' | 'high'; y: 'low' | 'high' }> = {
  black: { x: 'low', y: 'low' },
  green: { x: 'high', y: 'low' },
  blue: { x: 'high', y: 'high' },
  white: { x: 'low', y: 'high' },
};

/** Expected region for each home path centroid. */
const HOME_PATH_REGION: Record<PlayerColor, { x: 'low' | 'mid' | 'high'; y: 'low' | 'mid' | 'high' }> = {
  black: { x: 'mid', y: 'low' },
  green: { x: 'high', y: 'low' },
  blue: { x: 'mid', y: 'high' },
  white: { x: 'low', y: 'mid' },
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function pt(raw: { x: number; y: number }): BoardImagePoint {
  return { x: round2(raw.x), y: round2(raw.y) };
}

function pick(index: number): BoardImagePoint {
  const raw = calibrationClicks[index];
  if (!raw) {
    throw new Error(`[board-coordinates.json] missing click index ${index}`);
  }
  return pt(raw);
}

function pickMany(indices: readonly number[]): BoardImagePoint[] {
  return indices.map(pick);
}

function centroid(points: BoardImagePoint[]): BoardImagePoint {
  return {
    x: round2(points.reduce((s, p) => s + p.x, 0) / points.length),
    y: round2(points.reduce((s, p) => s + p.y, 0) / points.length),
  };
}

function dist(a: BoardImagePoint, b: BoardImagePoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function distFromCenter(p: BoardImagePoint): number {
  return dist(p, BOARD_CENTER);
}

/**
 * Nest slots 0→3 run outer → inner (away from board center → toward center).
 * Matches engine NW/NE/SW/SE for corner nests on the live board image.
 */
function sortBaseClusterToEngine(raw: BoardImagePoint[]): BoardImagePoint[] {
  return [...raw].sort((a, b) => distFromCenter(b) - distFromCenter(a));
}

/** Top V — entry is tip (min y), then left-to-right on each row. */
function sortHomeBlack(raw: BoardImagePoint[]): BoardImagePoint[] {
  return [...raw].sort((a, b) => a.y - b.y || a.x - b.x);
}

/** UR diagonal — clicks captured entry → inner along the groove. */
function sortHomeGreen(raw: BoardImagePoint[]): BoardImagePoint[] {
  return raw;
}

/** Bottom V — entry is lowest point (max y), path inward. */
function sortHomeBlue(raw: BoardImagePoint[]): BoardImagePoint[] {
  return [...raw].sort((a, b) => b.y - a.y || a.x - b.x);
}

/** Left V — entry is leftmost; slot order verified from live clicks 90→89→88→91. */
function sortHomeWhiteFromIndices(): BoardImagePoint[] {
  const order = [90, 89, 88, 91] as const;
  return order.map((clickIndex) => pick(clickIndex));
}

function regionOk(
  c: BoardImagePoint,
  region: { x: 'low' | 'mid' | 'high'; y: 'low' | 'mid' | 'high' }
): boolean {
  const xOk =
    region.x === 'low' ? c.x < 45 : region.x === 'high' ? c.x > 55 : c.x >= 30 && c.x <= 70;
  const yOk =
    region.y === 'low' ? c.y < 45 : region.y === 'high' ? c.y > 55 : c.y >= 30 && c.y <= 70;
  return xOk && yOk;
}

export type CalibrationValidation = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

/** Verify bucket assignment — catches home/base swaps and gate/track bleed. */
export function validateCalibrationBuckets(points: ExactImagePoints): CalibrationValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const usedIndices = new Set<number>();
  const register = (indices: number[], label: string) => {
    for (const i of indices) {
      if (usedIndices.has(i)) errors.push(`Click ${i} assigned twice (${label})`);
      usedIndices.add(i);
    }
  };

  for (const color of COLORS_ORDER) {
    register([...CALIBRATION_CLICK_MAP.track[color]], `${color} track`);
    register([CALIBRATION_CLICK_MAP.gates[color]], `${color} gate`);
    register([...CALIBRATION_CLICK_MAP.home[color]], `${color} home`);
    register([...CALIBRATION_CLICK_MAP.base[color]], `${color} base`);
  }

  if (usedIndices.size !== 108) {
    errors.push(`Expected 108 unique click indices, got ${usedIndices.size}`);
  }

  for (const color of COLORS_ORDER) {
    if (points.track[color].length !== TRACK_LENGTH) {
      errors.push(`${color} track has ${points.track[color].length} points, expected ${TRACK_LENGTH}`);
    }

    const gate = points.gates[color];
    if (!gate) {
      errors.push(`${color} gate missing`);
    } else {
      const gateInTrack = points.track[color].some((t) => t.x === gate.x && t.y === gate.y);
      if (gateInTrack) errors.push(`${color} gate coordinate duplicated inside track array`);
    }

    const baseC = centroid(points.base[color]);
    const baseRegion = BASE_NEST_REGION[color];
    if (baseRegion.x === 'low' && baseC.x > 45) errors.push(`${color} base centroid x=${baseC.x} — not in nest region`);
    if (baseRegion.x === 'high' && baseC.x < 55) errors.push(`${color} base centroid x=${baseC.x} — not in nest region`);
    if (baseRegion.y === 'low' && baseC.y > 45) errors.push(`${color} base centroid y=${baseC.y} — not in nest region`);
    if (baseRegion.y === 'high' && baseC.y < 55) errors.push(`${color} base centroid y=${baseC.y} — not in nest region`);

    const homeC = centroid(points.home[color]);
    if (!regionOk(homeC, HOME_PATH_REGION[color])) {
      warnings.push(`${color} home centroid (${homeC.x}, ${homeC.y}) outside expected ${HOME_PATH_REGION[color].x}/${HOME_PATH_REGION[color].y} region`);
    }

    const baseHomeDist = dist(baseC, homeC);
    if (baseHomeDist < 8) {
      errors.push(`${color} base and home centroids too close (${baseHomeDist.toFixed(1)}) — possible swap`);
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function buildImageExactPointsFromCalibration(): ExactImagePoints {
  if (calibrationClicks.length !== 108) {
    throw new Error(
      `[board-coordinates.json] expected 108 clicks, got ${calibrationClicks.length}`
    );
  }

  const track = {} as ExactImagePoints['track'];
  const gates = {} as ExactImagePoints['gates'];
  const home = {} as ExactImagePoints['home'];
  const base = {} as ExactImagePoints['base'];

  for (const color of COLORS_ORDER) {
    track[color] = pickMany(CALIBRATION_CLICK_MAP.track[color]);
    gates[color] = pick(CALIBRATION_CLICK_MAP.gates[color]);

    const homeRaw = pickMany(CALIBRATION_CLICK_MAP.home[color]);
    switch (color) {
      case 'black':
        home[color] = sortHomeBlack(homeRaw);
        break;
      case 'green':
        home[color] = sortHomeGreen(homeRaw);
        break;
      case 'blue':
        home[color] = sortHomeBlue(homeRaw);
        break;
      case 'white':
        home[color] = sortHomeWhiteFromIndices();
        break;
    }

    base[color] = sortBaseClusterToEngine(pickMany(CALIBRATION_CLICK_MAP.base[color]));
  }

  const validation = validateCalibrationBuckets({ track, gates, home, base });
  if (!validation.ok) {
    throw new Error(
      `[board-coordinates.json] calibration validation failed:\n${validation.errors.join('\n')}`
    );
  }

  if (import.meta.env?.DEV && validation.warnings.length > 0) {
    console.warn('[imageBoard] calibration warnings:', validation.warnings);
  }

  return { track, gates, home, base };
}
