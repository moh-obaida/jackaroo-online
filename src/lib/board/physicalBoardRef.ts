/**
 * Physical Jackaroo board photo — used as the literal board surface (not SVG recreation).
 * Asset: public/board/physical-jackaroo-board.jpg
 * Tune `boardInset` / offsets if marbles sit slightly off the drilled holes.
 */

import type { BoardPoint } from './boardGeometry';

export const PHYSICAL_BOARD_IMAGE = '/board/physical-jackaroo-board.jpg';

/** Natural pixel size of the reference JPEG. */
export const PHYSICAL_BOARD_NATURAL = { width: 223, height: 226 } as const;

/**
 * Maps logical layout coordinates (0..layoutSize) into the photo’s playable area.
 * Values are normalized 0–1 relative to the displayed square.
 */
export const PHYSICAL_BOARD_CALIBRATION = {
  boardInset: { x: 0.028, y: 0.03, w: 0.944, h: 0.94 },
  scale: 1,
  offsetX: 0,
  offsetY: 0,
} as const;

/** Display size for SVG viewBox (square). */
export const PHYSICAL_BOARD_VIEW_SIZE = 640;

export function mapLayoutPointToPhoto(
  pt: BoardPoint,
  layoutSize: number,
  displaySize: number = PHYSICAL_BOARD_VIEW_SIZE
): BoardPoint {
  const { boardInset, scale, offsetX, offsetY } = PHYSICAL_BOARD_CALIBRATION;
  const nx = pt.x / layoutSize;
  const ny = pt.y / layoutSize;
  const bx = boardInset.x + nx * boardInset.w;
  const by = boardInset.y + ny * boardInset.h;
  return {
    x: bx * displaySize * scale + offsetX,
    y: by * displaySize * scale + offsetY,
  };
}

export function mapLayoutRadiusToPhoto(r: number, layoutSize: number, displaySize: number): number {
  const { boardInset, scale } = PHYSICAL_BOARD_CALIBRATION;
  const avgInset = (boardInset.w + boardInset.h) / 2;
  return r * (displaySize / layoutSize) * avgInset * scale;
}
