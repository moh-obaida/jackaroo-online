import React from 'react';
import type { BoardImagePoint } from '../../lib/board/imageBoardCoordinateTypes';
import {
  formatBoardImagePoint,
  formatBoardImagePointPaste,
} from '../../lib/board/boardCalibrationLog';

type BoardCalibrationPanelProps = {
  cursor: BoardImagePoint | null;
  lastClick: BoardImagePoint | null;
};

/** Floating dev-only panel — rendered only when calibration env flag is on. */
export function BoardCalibrationPanel({ cursor, lastClick }: BoardCalibrationPanelProps) {
  return (
    <div className="board-calibration-panel" aria-hidden>
      <div className="board-calibration-panel__title">Board calibration</div>
      <div className="board-calibration-panel__row">
        <span className="board-calibration-panel__key">x</span>
        <span className="board-calibration-panel__val">{cursor ? cursor.x : '—'}</span>
      </div>
      <div className="board-calibration-panel__row">
        <span className="board-calibration-panel__key">y</span>
        <span className="board-calibration-panel__val">{cursor ? cursor.y : '—'}</span>
      </div>
      <div className="board-calibration-panel__divider" />
      <div className="board-calibration-panel__row board-calibration-panel__row--last">
        <span className="board-calibration-panel__key">last clicked</span>
        <code className="board-calibration-panel__code">
          {lastClick ? formatBoardImagePoint(lastClick) : '—'}
        </code>
      </div>
      {lastClick && (
        <code className="board-calibration-panel__paste">{formatBoardImagePointPaste(lastClick)}</code>
      )}
    </div>
  );
}
