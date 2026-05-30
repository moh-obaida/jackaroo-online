/**
 * Maps logical BoardPosition values to normalized (0–100) coordinates on the
 * premium empty gameplay board image.
 *
 * Calibration workflow — see docs/BOARD_CALIBRATION.md
 *
 * Step 1: VITE_ENABLE_BOARD_CALIBRATION=true
 * Step 2: Open gameplay board in the app (not screenshots)
 * Step 3: Click hole centers; copy x/y from console or dev panel
 * Step 4: Update src/lib/board/board-coordinates.json (108 clicks) or IMAGE_COORDINATE_OVERRIDES
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
import { buildImageExactPointsFromCalibration } from './buildImageExactPointsFromCalibration';

export { CALIBRATION_CLICK_MAP, validateCalibrationBuckets } from './buildImageExactPointsFromCalibration';
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


/** Emergency per-point overrides — prefer board-coordinates.json map; use only for last-minute tuning. */
const IMAGE_COORDINATE_OVERRIDES: Partial<Record<string, BoardImagePoint>> = {};

/**
 * Full exact image coordinate map (108 visual points).
 * Built from src/lib/board/board-coordinates.json — live clicks from calibration tool.
 * Valid only for IMAGE_BOARD_GAME_SRC (jakaroo-board-game-empty.png).
 *
 * Track/gate arrays use click order directly. Base/home clusters are sorted into engine
 * slot order (NW→SE nests; home entry → inner). See buildImageExactPointsFromCalibration.ts.
 */
const IMAGE_EXACT_POINTS: ExactImagePoints = buildImageExactPointsFromCalibration();

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
