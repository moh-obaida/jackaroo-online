/**
 * Maps logical BoardPosition values to normalized (0–100) coordinates on the
 * premium empty gameplay board image.
 *
 * Calibration workflow — see docs/BOARD_CALIBRATION.md
 *
 * Step 1: VITE_ENABLE_BOARD_CALIBRATION=true
 * Step 2: Open gameplay board in the app (not screenshots)
 * Step 3: Click hole centers; copy x/y from console or dev panel
 * Step 4: Paste into IMAGE_COORDINATE_OVERRIDES or IMAGE_EXACT_POINTS below
 * Step 5: Refresh and verify marbles/rings align
 * Step 6: Disable calibration before production
 */

import {
  BoardPosition,
  COLORS_ORDER,
  HOME_LENGTH,
  PlayerColor,
  TRACK_LENGTH,
} from '../../types/game';
import { boardPositionToPoint, getBoardLayout } from './boardGeometry';
import type { BoardImagePoint } from './imageBoardCoordinateTypes';

export const IMAGE_BOARD_GAME_SRC = '/assets/board/jakaroo-board-game-empty.png';

/** Native asset dimensions — used to confirm square aspect ratio (1024×1024). */
export const IMAGE_BOARD_NATIVE_SIZE = { width: 1024, height: 1024 } as const;

/** Playable area inset on the square image (fractions 0–1). */
export const IMAGE_BOARD_CALIBRATION = {
  boardInset: { x: 0.052, y: 0.052, w: 0.896, h: 0.896 },
} as const;

const LAYOUT_SIZE = 100;
const BOARD_LAYOUT = getBoardLayout(LAYOUT_SIZE);

/** Stable key for overrides: "black:track:0", "green:start_gate:0", etc. */
export function boardPositionImageKey(position: BoardPosition): string {
  return `${position.color}:${position.type}:${position.index}`;
}


/** Emergency per-point overrides — prefer IMAGE_EXACT_POINTS; use only for last-minute tuning. */
const IMAGE_COORDINATE_OVERRIDES: Partial<Record<string, BoardImagePoint>> = {};

export type ExactImagePoints = {
  track: Record<PlayerColor, BoardImagePoint[]>;
  gates: Record<PlayerColor, BoardImagePoint | null>;
  home: Record<PlayerColor, BoardImagePoint[]>;
  base: Record<PlayerColor, BoardImagePoint[]>;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function avg(nums: number[]): number {
  return nums.reduce((s, v) => s + v, 0) / nums.length;
}

/** Engine base order: 0 NW, 1 NE, 2 SW, 3 SE — balanced square from live-click cluster. */
function normalizeBaseNest(raw: BoardImagePoint[]): {
  points: BoardImagePoint[];
  center: BoardImagePoint;
  offset: { x: number; y: number };
} {
  const cx = avg(raw.map((p) => p.x));
  const cy = avg(raw.map((p) => p.y));
  const offsetX = avg(raw.map((p) => Math.abs(p.x - cx)));
  const offsetY = avg(raw.map((p) => Math.abs(p.y - cy)));
  return {
    center: { x: round2(cx), y: round2(cy) },
    offset: { x: round2(offsetX), y: round2(offsetY) },
    points: [
      { x: round2(cx - offsetX), y: round2(cy - offsetY) },
      { x: round2(cx + offsetX), y: round2(cy - offsetY) },
      { x: round2(cx - offsetX), y: round2(cy + offsetY) },
      { x: round2(cx + offsetX), y: round2(cy + offsetY) },
    ],
  };
}

/** Linear home path: index 0 = start (entry), index 3 = innermost. */
function normalizeHomePathLinear(
  start: BoardImagePoint,
  end: BoardImagePoint
): BoardImagePoint[] {
  return [0, 1, 2, 3].map((i) => ({
    x: round2(start.x + ((end.x - start.x) * i) / 3),
    y: round2(start.y + ((end.y - start.y) * i) / 3),
  }));
}

const BASE_BLACK = normalizeBaseNest([
  { x: 21.09, y: 19.13 },
  { x: 24.14, y: 22.19 },
  { x: 27.19, y: 25.62 },
  { x: 30.25, y: 28.48 },
]);
const BASE_GREEN = normalizeBaseNest([
  { x: 86.35, y: 31.73 },
  { x: 83.3, y: 34.78 },
  { x: 86.35, y: 38.41 },
  { x: 89.79, y: 35.16 },
]);
const BASE_BLUE = normalizeBaseNest([
  { x: 79.29, y: 80.96 },
  { x: 76.05, y: 77.15 },
  { x: 72.81, y: 74.28 },
  { x: 69.75, y: 71.23 },
]);
const BASE_WHITE = normalizeBaseNest([
  { x: 20.32, y: 80.58 },
  { x: 23.57, y: 77.72 },
  { x: 26.62, y: 74.09 },
  { x: 30.06, y: 70.66 },
]);

/**
 * Full exact image coordinate map (108 visual points).
 * Source: live clicked coordinates from calibration tool on rendered gameplay board.
 * Date: 2026-05-30 (base nests mathematically normalized)
 * Warning: valid only for IMAGE_BOARD_GAME_SRC (jakaroo-board-game-empty.png).
 *
 * Click-group → bucket map:
 * - home.black: clicks 0–3 (top V, kept shape)
 * - home.green: clicks 104–107 (UR diagonal, linearized)
 * - home.blue: clicks 84–87 (bottom V, kept shape)
 * - home.white: clicks 88–91 (left V, kept shape)
 * - base.black: clicks 100–103 (TL nest, normalized NW/NE/SW/SE)
 * - base.green: clicks 80–83 (TR nest, normalized)
 * - base.blue: clicks 96–99 (BR nest, normalized)
 * - base.white: clicks 92–95 (BL nest, normalized)
 * - perimeter 4–79: gate + 18 track × 4 (unchanged click order)
 *
 * Track arrays match BoardPosition { color, type: "track", index } — do not reorder unless engine changes.
 */
const IMAGE_EXACT_POINTS: ExactImagePoints = {
  track: {
    black: [
      { x: 27.58, y: 13.02 }, // 0 — click 5
      { x: 30.44, y: 16.46 }, // 1 — click 6
      { x: 33.30, y: 19.51 }, // 2 — click 7
      { x: 36.35, y: 22.57 }, // 3 — click 8
      { x: 39.41, y: 25.62 }, // 4 — click 9
      { x: 43.61, y: 25.43 }, // 5 — click 10
      { x: 47.61, y: 25.43 }, // 6 — click 11
      { x: 52.19, y: 25.62 }, // 7 — click 12
      { x: 56.20, y: 25.43 }, // 8 — click 13
      { x: 60.59, y: 25.62 }, // 9 — click 14
      { x: 63.65, y: 22.38 }, // 10 — click 15
      { x: 66.51, y: 19.32 }, // 11 — click 16
      { x: 69.56, y: 16.08 }, // 12 — click 17
      { x: 72.81, y: 13.02 }, // 13 — click 18
      { x: 75.67, y: 10.16 }, // 14 — click 19
      { x: 78.91, y: 13.22 }, // 15 — click 20
      { x: 81.77, y: 16.27 }, // 16 — click 21
      { x: 85.02, y: 19.13 }, // 17 — click 22
    ],
    green: [
      { x: 85.02, y: 25.62 }, // 0 — click 24
      { x: 82.16, y: 28.48 }, // 1 — click 25
      { x: 78.91, y: 31.92 }, // 2 — click 26
      { x: 76.05, y: 35.16 }, // 3 — click 27
      { x: 74.52, y: 38.79 }, // 4 — click 28
      { x: 74.33, y: 43.37 }, // 5 — click 29
      { x: 74.33, y: 47.57 }, // 6 — click 30
      { x: 74.52, y: 51.96 }, // 7 — click 31
      { x: 74.52, y: 56.15 }, // 8 — click 32
      { x: 74.52, y: 60.73 }, // 9 — click 33
      { x: 76.24, y: 64.55 }, // 10 — click 34
      { x: 79.29, y: 67.80 }, // 11 — click 35
      { x: 82.54, y: 71.04 }, // 12 — click 36
      { x: 85.40, y: 74.28 }, // 13 — click 37
      { x: 88.84, y: 77.53 }, // 14 — click 38
      { x: 85.78, y: 80.96 }, // 15 — click 39
      { x: 82.35, y: 84.02 }, // 16 — click 40
      { x: 79.29, y: 87.26 }, // 17 — click 41
    ],
    blue: [
      { x: 72.81, y: 86.88 }, // 0 — click 43
      { x: 69.94, y: 84.21 }, // 1 — click 44
      { x: 66.89, y: 80.77 }, // 2 — click 45
      { x: 63.84, y: 77.53 }, // 3 — click 46
      { x: 60.97, y: 74.28 }, // 4 — click 47
      { x: 56.58, y: 74.28 }, // 5 — click 48
      { x: 52.19, y: 73.90 }, // 6 — click 49
      { x: 47.81, y: 74.09 }, // 7 — click 50
      { x: 43.61, y: 74.09 }, // 8 — click 51
      { x: 39.41, y: 74.09 }, // 9 — click 52
      { x: 35.78, y: 77.91 }, // 10 — click 53
      { x: 32.73, y: 80.96 }, // 11 — click 54
      { x: 29.87, y: 84.40 }, // 12 — click 55
      { x: 26.43, y: 87.64 }, // 13 — click 56
      { x: 23.57, y: 91.08 }, // 14 — click 57
      { x: 20.13, y: 87.07 }, // 15 — click 58
      { x: 17.46, y: 84.40 }, // 16 — click 59
      { x: 14.03, y: 80.77 }, // 17 — click 60
    ],
    white: [
      { x: 14.22, y: 74.48 }, // 0 — click 62
      { x: 17.46, y: 71.04 }, // 1 — click 63
      { x: 20.52, y: 68.18 }, // 2 — click 64
      { x: 23.57, y: 64.55 }, // 3 — click 65
      { x: 25.10, y: 60.54 }, // 4 — click 66
      { x: 25.29, y: 55.96 }, // 5 — click 67
      { x: 25.29, y: 51.57 }, // 6 — click 68
      { x: 25.29, y: 47.19 }, // 7 — click 69
      { x: 25.29, y: 42.99 }, // 8 — click 70
      { x: 25.67, y: 38.98 }, // 9 — click 71
      { x: 23.57, y: 34.78 }, // 10 — click 72
      { x: 20.71, y: 31.92 }, // 11 — click 73
      { x: 17.84, y: 28.48 }, // 12 — click 74
      { x: 14.98, y: 25.81 }, // 13 — click 75
      { x: 11.74, y: 21.99 }, // 14 — click 76
      { x: 14.98, y: 19.70 }, // 15 — click 77
      { x: 17.84, y: 16.27 }, // 16 — click 78
      { x: 21.28, y: 12.64 }, // 17 — click 79
    ],
  },
  gates: {
    black: { x: 24.33, y: 9.97 }, // click 4
    green: { x: 88.07, y: 22.57 }, // click 23
    blue: { x: 76.05, y: 90.31 }, // click 42
    white: { x: 10.97, y: 77.53 }, // click 61
  },
  home: {
    // clicks 0–3 — top V; engine 0 = entry (min y)
    black: [
      { x: 37.88, y: 7.87 },
      { x: 34.06, y: 11.5 },
      { x: 41.51, y: 11.5 },
      { x: 37.69, y: 15.12 },
    ],
    // clicks 104–107 — UR diagonal; linearized outer → inner
    green: normalizeHomePathLinear(
      { x: 78.91, y: 19.51 },
      { x: 69.75, y: 28.67 }
    ),
    // clicks 84–87 — bottom V; engine 0 = entry (max y)
    blue: [
      { x: 62.5, y: 92.41 },
      { x: 65.94, y: 88.41 },
      { x: 59.26, y: 88.41 },
      { x: 62.5, y: 85.16 },
    ],
    // clicks 88–91 — left V; engine 0 = entry (min x)
    white: [
      { x: 9.83, y: 64.17 },
      { x: 13.26, y: 67.8 },
      { x: 16.89, y: 64.36 },
      { x: 13.26, y: 60.73 },
    ],
  },
  base: {
    // base.black — clicks 100–103; center { x: 25.67, y: 23.86 }, offset { x: 3.05, y: 3.2 }
    black: BASE_BLACK.points,
    // base.green — clicks 80–83; center { x: 86.45, y: 35.02 }, offset { x: 1.67, y: 1.76 }
    green: BASE_GREEN.points,
    // base.blue — clicks 96–99; center { x: 74.47, y: 75.91 }, offset { x: 3.2, y: 3.15 }
    blue: BASE_BLUE.points,
    // base.white — clicks 92–95; center { x: 25.14, y: 75.76 }, offset { x: 3.2, y: 3.39 }
    white: BASE_WHITE.points,
  },
};

function isValidPoint(p: BoardImagePoint | null | undefined): p is BoardImagePoint {
  if (!p) return false;
  return (
    Number.isFinite(p.x) &&
    Number.isFinite(p.y) &&
    p.x >= 0 &&
    p.x <= 100 &&
    p.y >= 0 &&
    p.y <= 100
  );
}

function isExactTrackComplete(): boolean {
  return COLORS_ORDER.every((c) => IMAGE_EXACT_POINTS.track[c].length === TRACK_LENGTH);
}

function isExactHomeComplete(): boolean {
  return COLORS_ORDER.every((c) => IMAGE_EXACT_POINTS.home[c].length === HOME_LENGTH);
}

function isExactBaseComplete(): boolean {
  return COLORS_ORDER.every((c) => IMAGE_EXACT_POINTS.base[c].length === 4);
}

function isExactGatesComplete(): boolean {
  return COLORS_ORDER.every((c) => IMAGE_EXACT_POINTS.gates[c] != null);
}

export function isExactImageMapComplete(): boolean {
  return isExactTrackComplete() && isExactHomeComplete() && isExactBaseComplete() && isExactGatesComplete();
}

let exactMapValidated = false;

/** Dev-only — warns once if exact map counts/ranges are invalid. */
function validateExactImagePoints(): void {
  if (!import.meta.env?.DEV || exactMapValidated) return;
  exactMapValidated = true;

  for (const color of COLORS_ORDER) {
    if (IMAGE_EXACT_POINTS.base[color].length !== 4) {
      console.warn('[imageBoard] exact base incomplete', color, IMAGE_EXACT_POINTS.base[color].length);
    }
    if (IMAGE_EXACT_POINTS.home[color].length !== HOME_LENGTH) {
      console.warn('[imageBoard] exact home incomplete', color, IMAGE_EXACT_POINTS.home[color].length);
    }
    if (IMAGE_EXACT_POINTS.track[color].length !== TRACK_LENGTH) {
      console.warn('[imageBoard] exact track incomplete', color, IMAGE_EXACT_POINTS.track[color].length);
    }
    if (!IMAGE_EXACT_POINTS.gates[color]) {
      console.warn('[imageBoard] exact gate missing', color);
    }

    const sections: BoardImagePoint[][] = [
      IMAGE_EXACT_POINTS.base[color],
      IMAGE_EXACT_POINTS.home[color],
      IMAGE_EXACT_POINTS.track[color],
    ];
    if (IMAGE_EXACT_POINTS.gates[color]) sections.push([IMAGE_EXACT_POINTS.gates[color]!]);

    for (const arr of sections) {
      for (const pt of arr) {
        if (!isValidPoint(pt)) console.warn('[imageBoard] invalid exact point', color, pt);
      }
    }
  }
}

function getExactImagePoint(position: BoardPosition): BoardImagePoint | null {
  const { color, type, index } = position;
  switch (type) {
    case 'track': {
      const pt = IMAGE_EXACT_POINTS.track[color][index];
      return isValidPoint(pt) ? pt : null;
    }
    case 'start_gate': {
      const pt = IMAGE_EXACT_POINTS.gates[color];
      return isValidPoint(pt) ? pt : null;
    }
    case 'home': {
      const pt = IMAGE_EXACT_POINTS.home[color][index];
      return isValidPoint(pt) ? pt : null;
    }
    case 'base': {
      const pt = IMAGE_EXACT_POINTS.base[color][index];
      return isValidPoint(pt) ? pt : null;
    }
    default:
      return null;
  }
}

/** Legacy manual home lanes — emergency fallback only when exact map slot missing. */
const IMAGE_HOME_LANE_FALLBACK: Record<PlayerColor, BoardImagePoint[]> = {
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

export type ImageBoardPoints = {
  mainTrack: BoardImagePoint[];
  gates: Record<PlayerColor, BoardImagePoint>;
  home: Record<PlayerColor, BoardImagePoint[]>;
  base: Record<PlayerColor, BoardImagePoint[]>;
};

function layoutPointToPercent(pt: { x: number; y: number }): BoardImagePoint {
  const { boardInset } = IMAGE_BOARD_CALIBRATION;
  return {
    x: boardInset.x * 100 + (pt.x / LAYOUT_SIZE) * boardInset.w * 100,
    y: boardInset.y * 100 + (pt.y / LAYOUT_SIZE) * boardInset.h * 100,
  };
}

function buildImageBoardPoints(): ImageBoardPoints {
  const mainTrack: BoardImagePoint[] = [];
  const gates = {} as Record<PlayerColor, BoardImagePoint>;
  const home = {} as Record<PlayerColor, BoardImagePoint[]>;
  const base = {} as Record<PlayerColor, BoardImagePoint[]>;

  for (const color of COLORS_ORDER) {
    const gatePt = getExactImagePoint({ color, type: 'start_gate', index: 0 });
    if (gatePt) gates[color] = gatePt;

    home[color] = [];
    for (let i = 0; i < HOME_LENGTH; i++) {
      const pt = getExactImagePoint({ color, type: 'home', index: i });
      if (pt) home[color].push(pt);
    }

    base[color] = [];
    for (let i = 0; i < 4; i++) {
      const pt = getExactImagePoint({ color, type: 'base', index: i });
      if (pt) base[color].push(pt);
    }

    for (let i = 0; i < TRACK_LENGTH; i++) {
      const pt = getExactImagePoint({ color, type: 'track', index: i });
      if (pt) mainTrack.push(pt);
    }
  }

  return { mainTrack, gates, home, base };
}

function getProceduralImagePoint(position: BoardPosition): BoardImagePoint | null {
  if (position.type === 'home') {
    const lanePt = IMAGE_HOME_LANE_FALLBACK[position.color]?.[position.index];
    if (lanePt) return lanePt;
  }

  const pt = boardPositionToPoint(position, BOARD_LAYOUT);
  if (!pt) return null;
  return layoutPointToPercent(pt);
}

export function getImagePointForBoardPosition(position: BoardPosition): BoardImagePoint | null {
  validateExactImagePoints();

  const overrideKey = boardPositionImageKey(position);
  const override = IMAGE_COORDINATE_OVERRIDES[overrideKey];
  if (override) return override;

  const exact = getExactImagePoint(position);
  if (exact) return exact;

  const procedural = getProceduralImagePoint(position);
  if (!procedural) {
    if (import.meta.env?.DEV) {
      console.warn('[imageBoard] unmapped position', position);
    }
    return null;
  }
  return procedural;
}

export const IMAGE_BOARD_POINTS = buildImageBoardPoints();

export function getBoardVisualPoint(position: BoardPosition): { xPercent: number; yPercent: number } | null {
  const pt = getImagePointForBoardPosition(position);
  if (!pt) return null;
  return { xPercent: pt.x, yPercent: pt.y };
}

export function getAllBoardPositions(activeColors: Set<PlayerColor>): BoardPosition[] {
  const out: BoardPosition[] = [];
  for (const color of COLORS_ORDER) {
    if (!activeColors.has(color)) continue;
    out.push({ color, type: 'start_gate', index: 0 });
    for (let i = 0; i < TRACK_LENGTH; i++) out.push({ color, type: 'track', index: i });
    for (let i = 0; i < HOME_LENGTH; i++) out.push({ color, type: 'home', index: i });
    for (let i = 0; i < 4; i++) out.push({ color, type: 'base', index: i });
  }
  return out;
}

const COLOR_LABEL: Record<PlayerColor, string> = {
  black: 'Black',
  green: 'Green',
  blue: 'Blue',
  white: 'White',
};

export function boardPositionShortLabel(position: BoardPosition): string {
  const c = position.color[0].toUpperCase();
  switch (position.type) {
    case 'start_gate':
      return `${c} gate`;
    case 'home':
      return `${c} H${position.index + 1}`;
    case 'base':
      return `${c} B${position.index + 1}`;
    case 'track':
      return `${c} T${position.index + 1}`;
    default:
      return c;
  }
}

export function boardPositionAriaLabel(position: BoardPosition): string {
  const c = COLOR_LABEL[position.color];
  switch (position.type) {
    case 'start_gate':
      return `${c} start gate`;
    case 'home':
      return `${c} home spot ${position.index + 1}`;
    case 'base':
      return `${c} nest spot ${position.index + 1}`;
    case 'track':
      return `${c} track space ${position.index + 1}`;
    default:
      return 'Board space';
  }
}

export function marbleAriaLabel(marble: { color: PlayerColor; id: string }, selected: boolean, selectable: boolean): string {
  const c = COLOR_LABEL[marble.color];
  if (selected) return `Selected ${c} marble`;
  if (selectable) return `Selectable ${c} marble`;
  return `${c} marble`;
}

export const IMAGE_BOARD_RADII = {
  marbleTrack: 1.88,
  marbleBase: 1.62,
  marbleHighlight: 2.35,
  marbleSelectionRingOffset: 0.58,
  marbleGateLockRingOffset: 0.7,
  hitZone: 3.15,
  hitZoneGate: 3.45,
  legalTarget: 2.05,
  calibrationDot: 0.42,
} as const;

export const CALIBRATION_DOT_COLORS: Record<BoardPosition['type'], string> = {
  track: '#e6c567',
  start_gate: '#5eead4',
  home: '#60a5fa',
  base: '#4ade80',
};
