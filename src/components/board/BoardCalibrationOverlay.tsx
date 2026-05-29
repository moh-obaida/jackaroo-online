import React from 'react';
import { BoardPosition } from '../../types/game';
import {
  boardPositionAriaLabel,
  getImagePointForBoardPosition,
} from '../../lib/board/imageBoardCoordinates';
import { positionKey } from '../../lib/play/boardHighlights';

type BoardCalibrationOverlayProps = {
  positions: BoardPosition[];
};

/** Dev-only overlay — shows mapped points when VITE_BOARD_CALIBRATION=1. */
export function BoardCalibrationOverlay({ positions }: BoardCalibrationOverlayProps) {
  return (
    <g className="board-calibration-overlay" pointerEvents="none">
      {positions.map((pos) => {
        const pt = getImagePointForBoardPosition(pos);
        if (!pt) return null;
        return (
          <g key={`cal_${positionKey(pos)}`}>
            <circle cx={pt.x} cy={pt.y} r={0.35} fill="#e6c567" opacity={0.85} />
            <text
              x={pt.x + 0.6}
              y={pt.y + 0.25}
              fontSize={1.2}
              fill="rgba(230,197,103,0.85)"
              className="board-calibration-label"
            >
              {pos.type === 'track' ? 'T' : pos.type === 'home' ? 'H' : pos.type === 'base' ? 'B' : 'G'}
            </text>
            <title>{boardPositionAriaLabel(pos)}</title>
          </g>
        );
      })}
    </g>
  );
}
