import { BoardPosition } from '../../types/game';
import { boardPositionImageKey } from './imageBoardCoordinates';
import type { BoardImagePoint } from './imageBoardCoordinateTypes';

export function roundBoardPercent(value: number): number {
  return Number(value.toFixed(2));
}

export function formatBoardImagePoint(point: BoardImagePoint): string {
  return `{ x: ${point.x}, y: ${point.y} }`;
}

export function formatBoardImagePointPaste(point: BoardImagePoint): string {
  return `{ x: ${point.x}, y: ${point.y} },`;
}

/** JSON array item for board-coordinates.json (no trailing comma on last item). */
export function formatBoardJsonArrayItem(point: BoardImagePoint, index: number): string {
  return `  // click ${index}\n  { "x": ${point.x}, "y": ${point.y} }`;
}

/** Log click coordinates and optional override snippet to the dev console. */
export function logCalibrationClick(
  point: BoardImagePoint,
  position?: BoardPosition,
  clickIndex?: number
): void {
  const rounded = { x: roundBoardPercent(point.x), y: roundBoardPercent(point.y) };
  console.log('[board-calibration] click', rounded);
  if (clickIndex != null) {
    console.log('[board-calibration] json-index', clickIndex, formatBoardJsonArrayItem(rounded, clickIndex));
  }
  console.log('[board-calibration] paste', formatBoardImagePointPaste(rounded));
  if (position) {
    const key = boardPositionImageKey(position);
    console.log('[board-calibration] position', key, position);
    console.log(
      '[board-calibration] override',
      `"${key}": { x: ${rounded.x}, y: ${rounded.y} },`
    );
  }
}

/** Convert a mouse event on the board stage to 0–100 SVG coordinates. */
export function boardStagePointFromMouseEvent(
  e: { clientX: number; clientY: number },
  element: HTMLElement
): BoardImagePoint {
  const rect = element.getBoundingClientRect();
  return {
    x: roundBoardPercent(((e.clientX - rect.left) / rect.width) * 100),
    y: roundBoardPercent(((e.clientY - rect.top) / rect.height) * 100),
  };
}
