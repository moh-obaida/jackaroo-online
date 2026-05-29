/**
 * Maps logical BoardPosition values to normalized (0–100) coordinates on the
 * premium empty gameplay board image. Tune IMAGE_BOARD_CALIBRATION to refine alignment.
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

/** Playable area inset on the square image (fractions 0–1). */
export const IMAGE_BOARD_CALIBRATION = {
  boardInset: { x: 0.052, y: 0.052, w: 0.896, h: 0.896 },
} as const;

const LAYOUT_SIZE = 100;
const BOARD_LAYOUT = getBoardLayout(LAYOUT_SIZE);

/**
 * Home lanes on the premium board image follow the cardinal V-slots toward center,
 * not the procedural geometry centerline (which lands in the deck well).
 * Tune with VITE_BOARD_CALIBRATION=1.
 */
const IMAGE_HOME_LANE_POINTS: Record<PlayerColor, BoardImagePoint[]> = {
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
  /** 72 outer track spots (18 × 4 colors, black section first). */
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
  const layout = BOARD_LAYOUT;
  const mainTrack: BoardImagePoint[] = [];
  const gates = {} as Record<PlayerColor, BoardImagePoint>;
  const home = {} as Record<PlayerColor, BoardImagePoint[]>;
  const base = {} as Record<PlayerColor, BoardImagePoint[]>;

  for (const color of COLORS_ORDER) {
    const gatePt = boardPositionToPoint({ color, type: 'start_gate', index: 0 }, layout);
    if (gatePt) gates[color] = layoutPointToPercent(gatePt);

    home[color] = [...IMAGE_HOME_LANE_POINTS[color]];

    base[color] = [];
    for (let i = 0; i < 4; i++) {
      const pt = boardPositionToPoint({ color, type: 'base', index: i }, layout);
      if (pt) base[color].push(layoutPointToPercent(pt));
    }

    for (let i = 0; i < TRACK_LENGTH; i++) {
      const pt = boardPositionToPoint({ color, type: 'track', index: i }, layout);
      if (pt) mainTrack.push(layoutPointToPercent(pt));
    }
  }

  return { mainTrack, gates, home, base };
}

export const IMAGE_BOARD_POINTS = buildImageBoardPoints();

export function getImagePointForBoardPosition(position: BoardPosition): BoardImagePoint | null {
  if (position.type === 'home') {
    const lanePt = IMAGE_HOME_LANE_POINTS[position.color]?.[position.index];
    if (lanePt) return lanePt;
  }

  const pt = boardPositionToPoint(position, BOARD_LAYOUT);
  if (!pt) {
    if (import.meta.env.DEV) {
      console.warn('[imageBoard] unmapped position', position);
    }
    return null;
  }
  return layoutPointToPercent(pt);
}

/** Canonical visual lookup — percentage coords (0–100) on the board image. */
export function getBoardVisualPoint(position: BoardPosition): { xPercent: number; yPercent: number } | null {
  const pt = getImagePointForBoardPosition(position);
  if (!pt) return null;
  return { xPercent: pt.x, yPercent: pt.y };
}

/** All logical positions for calibration/debug overlays. */
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

/** SVG radii in viewBox units (0–100). */
export const IMAGE_BOARD_RADII = {
  marbleTrack: 2.15,
  marbleBase: 1.85,
  marbleHighlight: 2.55,
  hitZone: 3.15,
  hitZoneGate: 3.45,
  /** Thin ring aligned to hole — not a filled blob */
  legalTarget: 2.05,
} as const;
