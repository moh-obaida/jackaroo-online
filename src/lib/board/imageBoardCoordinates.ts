/**
 * Maps logical BoardPosition values to normalized (0–100) coordinates on the
 * premium empty gameplay board image.
 *
 * Calibration workflow — see docs/BOARD_CALIBRATION.md
 *
 * Step 1: VITE_ENABLE_BOARD_CALIBRATION=true
 * Step 2: Open gameplay board in the app (not screenshots)
 * Step 3: Click hole centers; copy x/y from console or dev panel
 * Step 4: Update IMAGE_EXACT_POINTS in this file (108 points, nest-first click order)
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
import type { BoardImagePoint, ExactImagePoints } from './imageBoardCoordinateTypes';

export type { ExactImagePoints } from './imageBoardCoordinateTypes';

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


/** Emergency per-point overrides — use only for last-minute single-hole tuning. */
const IMAGE_COORDINATE_OVERRIDES: Partial<Record<string, BoardImagePoint>> = {};

/**
 * Click index → bucket for the nest-first calibration sequence (108 points).
 * Extra accidental point { x: 32.15, y: 71.24 } was removed before mapping.
 */
export const CALIBRATION_CLICK_MAP = {
  base: {
    black: [0, 1, 2, 3],
    green: [4, 5, 6, 7],
    blue: [8, 9, 10, 11],
    white: [12, 13, 14, 15],
  },
  home: {
    black: [16, 17, 18, 19],
    green: [20, 21, 22, 23],
    blue: [24, 25, 26, 27],
    white: [28, 29, 30, 31],
  },
  gates: {
    black: 32,
    green: 51,
    blue: 70,
    white: 89,
  },
  track: {
    black: Array.from({ length: TRACK_LENGTH }, (_, i) => 33 + i),
    green: Array.from({ length: TRACK_LENGTH }, (_, i) => 52 + i),
    blue: Array.from({ length: TRACK_LENGTH }, (_, i) => 71 + i),
    white: Array.from({ length: TRACK_LENGTH }, (_, i) => 90 + i),
  },
} as const;

/**
 * Full exact image coordinate map (108 visual points).
 * Manually recalibrated 2026-05-30 — nest-first click order, mathematically cleaned.
 * Valid only for IMAGE_BOARD_GAME_SRC (jakaroo-board-game-empty.png).
 */
const IMAGE_EXACT_POINTS: ExactImagePoints = {
  base: {
    black: [
      { x: 39.1, y: 7.99 },
      { x: 35.9, y: 11.43 },
      { x: 39.1, y: 14.87 },
      { x: 42.31, y: 11.43 },
    ],
    green: [
      { x: 82.36, y: 31.79 },
      { x: 85.24, y: 35.13 },
      { x: 79.48, y: 35.13 },
      { x: 82.36, y: 38.48 },
    ],
    blue: [
      { x: 61.19, y: 85.04 },
      { x: 64.31, y: 88.66 },
      { x: 61.19, y: 92.29 },
      { x: 58.06, y: 88.66 },
    ],
    white: [
      { x: 17.72, y: 67.94 },
      { x: 20.68, y: 64.41 },
      { x: 17.72, y: 60.88 },
      { x: 14.76, y: 64.41 },
    ],
  },
  home: {
    black: [
      { x: 24.42, y: 19.38 },
      { x: 27.11, y: 22.54 },
      { x: 29.79, y: 25.7 },
      { x: 32.48, y: 28.86 },
    ],
    green: [
      { x: 75.25, y: 19.38 },
      { x: 72.67, y: 22.48 },
      { x: 70.1, y: 25.57 },
      { x: 67.52, y: 28.67 },
    ],
    blue: [
      { x: 75.9, y: 81.09 },
      { x: 73.16, y: 77.81 },
      { x: 70.42, y: 74.52 },
      { x: 67.68, y: 71.24 },
    ],
    white: [
      { x: 21.13, y: 84.25 },
      { x: 23.87, y: 80.97 },
      { x: 26.62, y: 77.68 },
      { x: 29.36, y: 74.4 },
    ],
  },
  gates: {
    black: { x: 27.22, y: 9.9 },
    green: { x: 83.8, y: 22.54 },
    blue: { x: 73.27, y: 90.38 },
    white: { x: 15.71, y: 77.74 },
  },
  track: {
    black: [
      { x: 30.02, y: 13.24 },
      { x: 32.81, y: 16.4 },
      { x: 35.44, y: 19.19 },
      { x: 37.91, y: 22.35 },
      { x: 40.54, y: 25.45 },
      { x: 44.32, y: 25.47 },
      { x: 48.11, y: 25.46 },
      { x: 51.89, y: 25.45 },
      { x: 55.68, y: 25.44 },
      { x: 59.46, y: 25.43 },
      { x: 62.25, y: 22.35 },
      { x: 64.72, y: 19.19 },
      { x: 67.52, y: 16.03 },
      { x: 70.15, y: 13.06 },
      { x: 72.78, y: 10.08 },
      { x: 75.58, y: 13.06 },
      { x: 78.21, y: 16.03 },
      { x: 81.17, y: 19.19 },
    ],
    green: [
      { x: 81.0, y: 25.51 },
      { x: 78.37, y: 28.67 },
      { x: 75.74, y: 31.83 },
      { x: 73.11, y: 34.99 },
      { x: 71.68, y: 38.89 },
      { x: 71.66, y: 43.2 },
      { x: 71.67, y: 47.52 },
      { x: 71.67, y: 51.83 },
      { x: 71.71, y: 56.15 },
      { x: 71.7, y: 60.46 },
      { x: 73.11, y: 64.54 },
      { x: 75.9, y: 68.08 },
      { x: 78.7, y: 71.05 },
      { x: 81.5, y: 74.21 },
      { x: 84.29, y: 77.56 },
      { x: 81.5, y: 80.9 },
      { x: 78.7, y: 84.06 },
      { x: 75.9, y: 87.41 },
    ],
    blue: [
      { x: 70.31, y: 87.41 },
      { x: 67.68, y: 84.06 },
      { x: 65.05, y: 80.9 },
      { x: 62.25, y: 77.56 },
      { x: 59.62, y: 74.21 },
      { x: 55.77, y: 74.21 },
      { x: 51.92, y: 74.21 },
      { x: 48.08, y: 74.21 },
      { x: 44.23, y: 74.21 },
      { x: 40.38, y: 74.21 },
      { x: 37.58, y: 77.37 },
      { x: 34.79, y: 80.9 },
      { x: 32.15, y: 84.43 },
      { x: 29.19, y: 87.41 },
      { x: 26.56, y: 91.12 },
      { x: 23.93, y: 87.78 },
      { x: 21.13, y: 84.43 },
      { x: 18.34, y: 81.09 },
    ],
    white: [
      { x: 18.67, y: 74.58 },
      { x: 21.3, y: 71.24 },
      { x: 24.1, y: 68.26 },
      { x: 26.73, y: 64.92 },
      { x: 28.23, y: 60.46 },
      { x: 28.24, y: 56.22 },
      { x: 28.27, y: 51.98 },
      { x: 28.28, y: 47.75 },
      { x: 28.29, y: 43.51 },
      { x: 28.28, y: 39.27 },
      { x: 27.06, y: 34.99 },
      { x: 24.26, y: 32.2 },
      { x: 21.46, y: 28.86 },
      { x: 19.0, y: 25.7 },
      { x: 16.37, y: 22.54 },
      { x: 18.83, y: 19.56 },
      { x: 21.63, y: 16.03 },
      { x: 24.26, y: 13.06 },
    ],
  },
};

/** Dev helper — count validation for IMAGE_EXACT_POINTS. */
export function validateImageExactPointCounts(): { ok: boolean; total: number } {
  let total = 0;
  for (const color of COLORS_ORDER) {
    total += IMAGE_EXACT_POINTS.base[color].length;
    total += IMAGE_EXACT_POINTS.home[color].length;
    total += IMAGE_EXACT_POINTS.track[color].length;
    if (IMAGE_EXACT_POINTS.gates[color]) total += 1;
  }
  const ok =
    total === 108 &&
    isExactTrackComplete() &&
    isExactHomeComplete() &&
    isExactBaseComplete() &&
    isExactGatesComplete();
  return { ok, total };
}

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
  marbleTrack: 1.48,
  marbleBase: 1.3,
  marbleHighlight: 1.92,
  marbleSelectionRingOffset: 0.38,
  marbleGateLockRingOffset: 0.48,
  hitZone: 3.05,
  hitZoneGate: 3.35,
  legalTarget: 1.62,
  calibrationDot: 0.42,
} as const;

export const CALIBRATION_DOT_COLORS: Record<BoardPosition['type'], string> = {
  track: '#e6c567',
  start_gate: '#5eead4',
  home: '#60a5fa',
  base: '#4ade80',
};
