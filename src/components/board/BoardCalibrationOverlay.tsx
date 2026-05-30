import React from 'react';
import { BoardPosition } from '../../types/game';
import {
  boardPositionAriaLabel,
  boardPositionShortLabel,
  CALIBRATION_DOT_COLORS,
  getImagePointForBoardPosition,
  IMAGE_BOARD_RADII,
} from '../../lib/board/imageBoardCoordinates';
import { positionKey } from '../../lib/play/boardHighlights';
import type { BoardImagePoint } from '../../lib/board/imageBoardCoordinateTypes';

type BoardCalibrationOverlayProps = {
  positions: BoardPosition[];
  hoveredPosition: BoardPosition | null;
  selectedPosition: BoardPosition | null;
  cursor: BoardImagePoint | null;
};

function isSamePosition(a: BoardPosition | null, b: BoardPosition | null): boolean {
  if (!a || !b) return false;
  return positionKey(a) === positionKey(b);
}

/** Dev-only overlay — VITE_BOARD_CALIBRATION=1 or VITE_ENABLE_BOARD_CALIBRATION=true */
export function BoardCalibrationOverlay({
  positions,
  hoveredPosition,
  selectedPosition,
  cursor,
}: BoardCalibrationOverlayProps) {
  return (
    <g className="board-calibration-overlay" pointerEvents="none">
      {cursor && (
        <g className="board-calibration-cursor" aria-hidden>
          <line x1={cursor.x} y1={0} x2={cursor.x} y2={100} className="board-calibration-crosshair board-calibration-crosshair--v" />
          <line x1={0} y1={cursor.y} x2={100} y2={cursor.y} className="board-calibration-crosshair board-calibration-crosshair--h" />
        </g>
      )}

      {positions.map((pos) => {
        const pt = getImagePointForBoardPosition(pos);
        if (!pt) return null;

        const isHovered = isSamePosition(pos, hoveredPosition);
        const isSelected = isSamePosition(pos, selectedPosition);
        const showLabel = isHovered || isSelected;
        const dotColor = CALIBRATION_DOT_COLORS[pos.type];
        const r = isSelected ? IMAGE_BOARD_RADII.calibrationDot * 1.6 : IMAGE_BOARD_RADII.calibrationDot;

        return (
          <g
            key={`cal_${positionKey(pos)}`}
            className={`board-calibration-point${isSelected ? ' board-calibration-point--selected' : ''}${isHovered ? ' board-calibration-point--hovered' : ''}`}
          >
            <circle
              cx={pt.x}
              cy={pt.y}
              r={r}
              fill={dotColor}
              className="board-calibration-dot"
            />
            {isSelected && (
              <circle
                cx={pt.x}
                cy={pt.y}
                r={IMAGE_BOARD_RADII.legalTarget}
                fill="none"
                stroke={dotColor}
                strokeWidth={0.2}
                opacity={0.85}
                className="board-calibration-ring"
              />
            )}
            {showLabel && (
              <g className="board-calibration-label-group">
                <rect
                  x={pt.x + 0.5}
                  y={pt.y - 2.8}
                  width={14}
                  height={3.6}
                  rx={0.4}
                  fill="rgba(8, 6, 4, 0.82)"
                />
                <text
                  x={pt.x + 1}
                  y={pt.y - 0.15}
                  fontSize={1.15}
                  fill={dotColor}
                  className="board-calibration-label"
                >
                  {boardPositionShortLabel(pos)}
                </text>
                <text
                  x={pt.x + 1}
                  y={pt.y + 1.5}
                  fontSize={0.95}
                  fill="rgba(240,235,224,0.75)"
                  className="board-calibration-label board-calibration-label--coords"
                >
                  {pt.x.toFixed(2)}, {pt.y.toFixed(2)}
                </text>
              </g>
            )}
            <title>
              {boardPositionAriaLabel(pos)} — {pt.x.toFixed(2)}, {pt.y.toFixed(2)}
            </title>
          </g>
        );
      })}
    </g>
  );
}
