import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BoardPosition,
  COLORS_ORDER,
  Marble,
  PlayerColor,
} from '../../types/game';
import {
  boardPositionAriaLabel,
  getAllBoardPositions,
  getImagePointForBoardPosition,
  IMAGE_BOARD_GAME_SRC,
  IMAGE_BOARD_RADII,
  marbleAriaLabel,
} from '../../lib/board/imageBoardCoordinates';
import {
  boardStagePointFromMouseEvent,
  logCalibrationClick,
} from '../../lib/board/boardCalibrationLog';
import { isBoardCalibrationEnabled } from '../../lib/board/isBoardCalibrationEnabled';
import type { BoardImagePoint } from '../../lib/board/imageBoardCoordinateTypes';
import { positionKey } from '../../lib/play/boardHighlights';
import { BoardCalibrationOverlay } from './BoardCalibrationOverlay';
import { BoardCalibrationPanel } from './BoardCalibrationPanel';

export type ImageMappedBoardVisualProps = {
  idPrefix?: string;
  activeColors?: Set<PlayerColor>;
  marbles?: Marble[];
  highlightPositions?: BoardPosition[];
  selectableMarbleIds?: Set<string>;
  selectedMarbleId?: string | null;
  myColor?: PlayerColor | null;
  isMyTurn?: boolean;
  showDemoMarbles?: boolean;
  onMarbleClick?: (marbleId: string) => void;
  onPositionClick?: (pos: BoardPosition) => void;
  className?: string;
};

const MARBLE_GRADIENT: Record<PlayerColor, [string, string]> = {
  black: ['#4a4a4a', '#1a1a1a'],
  green: ['#3ecf7a', '#157a42'],
  blue: ['#4a7fd4', '#1a4088'],
  white: ['#f5f0e6', '#c4b8a8'],
};

function ImageMappedMarble({
  marble,
  point,
  r,
  isOwn,
  isSelectable,
  isSelected,
  onClick,
  pid,
}: {
  marble: Marble;
  point: { x: number; y: number };
  r: number;
  isOwn: boolean;
  isSelectable: boolean;
  isSelected: boolean;
  onClick?: () => void;
  pid: string;
}) {
  const isLocked =
    marble.position.type === 'start_gate' && marble.position.color === marble.color;
  const gradId = `${pid}-marble-${marble.color}`;

  const activate = () => {
    onClick?.();
  };

  return (
    <g
      className={`image-board-marble${isSelectable ? ' image-board-marble--selectable' : ''}${isSelected ? ' image-board-marble--selected' : ''}`}
      transform={`translate(${point.x}, ${point.y})`}
      style={{
        cursor: onClick ? 'pointer' : undefined,
        pointerEvents: onClick ? 'auto' : 'none',
        transition: 'transform 0.28s ease-out',
      }}
      role={isSelectable ? 'button' : 'img'}
      tabIndex={isSelectable ? 0 : undefined}
      aria-pressed={isSelectable ? isSelected : undefined}
      aria-label={marbleAriaLabel(marble, isSelected, isSelectable)}
      onClick={(e) => {
        e.stopPropagation();
        activate();
      }}
      onKeyDown={
        isSelectable && onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                activate();
              }
            }
          : undefined
      }
    >
      {isSelectable && (
        <circle
          r={r + IMAGE_BOARD_RADII.marbleSelectionRingOffset}
          fill="none"
          stroke={isSelected ? '#ffd633' : '#5eead4'}
          strokeWidth={isSelected ? 0.24 : 0.18}
          className={isSelected ? 'marble-glow marble-glow--selected' : 'marble-glow marble-glow--selectable'}
        />
      )}
      {isLocked && (
        <circle
          r={r + IMAGE_BOARD_RADII.marbleGateLockRingOffset}
          fill="none"
          stroke="#ffd633"
          strokeWidth={0.22}
          className="gate-lock-ring"
        />
      )}
      <ellipse cx={0.1} cy={r * 0.32} rx={r * 0.82} ry={r * 0.5} fill="#000" opacity={0.28} />
      <circle r={r} fill={`url(#${gradId})`} stroke={isLocked ? '#ffd633' : isOwn ? '#e6c567' : 'rgba(255,255,255,0.3)'} strokeWidth={isLocked ? 0.28 : isOwn ? 0.22 : 0.14} />
      <circle cx={-r * 0.3} cy={-r * 0.34} r={r * 0.26} fill="#fff" opacity={0.4} />
    </g>
  );
}

/** Premium empty-board skin with SVG overlay for marbles, hits, and highlights. */
export function ImageMappedBoardVisual({
  idPrefix = 'board',
  activeColors,
  marbles = [],
  highlightPositions = [],
  selectableMarbleIds,
  selectedMarbleId = null,
  myColor = null,
  isMyTurn = false,
  showDemoMarbles = false,
  onMarbleClick,
  onPositionClick,
  className = '',
}: ImageMappedBoardVisualProps) {
  const { t } = useApp();
  const [imageFailed, setImageFailed] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const pid = idPrefix;
  const calibrationEnabled = isBoardCalibrationEnabled();

  const [cursorPoint, setCursorPoint] = useState<BoardImagePoint | null>(null);
  const [lastClickPoint, setLastClickPoint] = useState<BoardImagePoint | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<BoardPosition | null>(null);
  const [selectedCalPosition, setSelectedCalPosition] = useState<BoardPosition | null>(null);

  const active = activeColors ?? new Set(COLORS_ORDER);

  const highlightKeys = useMemo(
    () => new Set(highlightPositions.map(positionKey)),
    [highlightPositions]
  );

  const allPositions = useMemo(() => getAllBoardPositions(active), [active]);

  const demoMarbles: Marble[] = showDemoMarbles
    ? COLORS_ORDER.flatMap((color) =>
        [0, 1, 2, 3].map((i) => ({
          id: `demo_${color}_${i}`,
          color,
          position: { color, type: 'base' as const, index: i },
          isFinished: false,
        }))
      )
    : [];

  const displayMarbles = showDemoMarbles ? demoMarbles : marbles;

  const marbleRadius = (type: BoardPosition['type']) =>
    type === 'base' ? IMAGE_BOARD_RADII.marbleBase : IMAGE_BOARD_RADII.marbleTrack;

  const updateCursorFromEvent = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!calibrationEnabled || !stageRef.current) return;
      setCursorPoint(boardStagePointFromMouseEvent(e, stageRef.current));
    },
    [calibrationEnabled]
  );

  const handleStageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!calibrationEnabled || !stageRef.current) return;
      const point = boardStagePointFromMouseEvent(e, stageRef.current);
      setLastClickPoint(point);
      logCalibrationClick(point);
    },
    [calibrationEnabled]
  );

  const handleCalPositionClick = useCallback(
    (pos: BoardPosition, e: React.MouseEvent) => {
      if (!calibrationEnabled || !stageRef.current) return;
      e.stopPropagation();
      const mapped = getImagePointForBoardPosition(pos);
      const point = mapped ?? boardStagePointFromMouseEvent(e, stageRef.current);
      setLastClickPoint(point);
      setSelectedCalPosition(pos);
      logCalibrationClick(point, pos);
    },
    [calibrationEnabled]
  );

  const stageClassName = [
    'image-board-stage',
    'board-frame',
    calibrationEnabled ? 'image-board-stage--calibration' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={stageRef}
      className={stageClassName}
      onClick={calibrationEnabled ? handleStageClick : undefined}
      onMouseMove={calibrationEnabled ? updateCursorFromEvent : undefined}
      onMouseLeave={calibrationEnabled ? () => setCursorPoint(null) : undefined}
    >
      {calibrationEnabled && (
        <BoardCalibrationPanel cursor={cursorPoint} lastClick={lastClickPoint} />
      )}

      {imageFailed ? (
        <div className="image-board-fallback" role="status">
          {t('game.boardUnavailable')}
        </div>
      ) : (
        <img
          src={IMAGE_BOARD_GAME_SRC}
          alt=""
          className="image-board-image"
          draggable={false}
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      )}

      <svg
        viewBox="0 0 100 100"
        className="image-board-overlay"
        role="img"
        aria-label="Jackaroo board"
      >
        <defs>
          {COLORS_ORDER.map((color) => (
            <radialGradient key={color} id={`${pid}-marble-${color}`} cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor={MARBLE_GRADIENT[color][0]} />
              <stop offset="100%" stopColor={MARBLE_GRADIENT[color][1]} />
            </radialGradient>
          ))}
        </defs>

        {calibrationEnabled && (
          <BoardCalibrationOverlay
            positions={allPositions}
            hoveredPosition={hoveredPosition}
            selectedPosition={selectedCalPosition}
            cursor={cursorPoint}
          />
        )}

        {/* Legal target rings */}
        {isMyTurn &&
          highlightPositions.map((pos) => {
            const pt = getImagePointForBoardPosition(pos);
            if (!pt) return null;
            return (
              <circle
                key={`hl_${positionKey(pos)}`}
                cx={pt.x}
                cy={pt.y}
                r={IMAGE_BOARD_RADII.legalTarget}
                className="image-board-target-ring image-board-target-ring--legal legal-target-highlight"
                pointerEvents="none"
              />
            );
          })}

        {/* Marbles — rendered above calibration dots */}
        {displayMarbles.map((marble) => {
          const pt = getImagePointForBoardPosition(marble.position);
          if (!pt) return null;
          const r = marbleRadius(marble.position.type);
          const isOwn = marble.color === myColor;
          const isSelectable = Boolean(
            isMyTurn && selectableMarbleIds?.has(marble.id) && onMarbleClick
          );
          const isSelected = selectedMarbleId === marble.id;
          return (
            <ImageMappedMarble
              key={marble.id}
              marble={marble}
              point={pt}
              r={r}
              isOwn={isOwn}
              isSelectable={isSelectable}
              isSelected={isSelected}
              pid={pid}
              onClick={isSelectable ? () => onMarbleClick?.(marble.id) : undefined}
            />
          );
        })}

        {/* Hit zones on top so occupied legal targets (swap, capture) stay clickable */}
        {(calibrationEnabled || (isMyTurn && onPositionClick)) &&
          (calibrationEnabled ? allPositions : highlightPositions).map((pos) => {
            const pt = getImagePointForBoardPosition(pos);
            if (!pt) return null;
            const isTarget = highlightKeys.has(positionKey(pos));
            const interactive =
              calibrationEnabled ||
              (isMyTurn && isTarget && onPositionClick && selectedMarbleId != null);
            const r =
              pos.type === 'start_gate' ? IMAGE_BOARD_RADII.hitZoneGate : IMAGE_BOARD_RADII.hitZone;
            return (
              <circle
                key={`hit_${positionKey(pos)}`}
                cx={pt.x}
                cy={pt.y}
                r={r}
                className={`image-board-hit-zone${calibrationEnabled ? ' image-board-hit-zone--debug' : ''}`}
                fill={calibrationEnabled ? 'rgba(255,255,255,0.08)' : 'transparent'}
                stroke={calibrationEnabled ? 'rgba(230,197,103,0.28)' : 'transparent'}
                strokeWidth={calibrationEnabled ? 0.12 : 0}
                style={{
                  cursor: interactive ? 'crosshair' : undefined,
                  pointerEvents: interactive ? 'auto' : 'none',
                }}
                role={interactive && !calibrationEnabled ? 'button' : undefined}
                tabIndex={interactive && !calibrationEnabled ? 0 : undefined}
                aria-label={boardPositionAriaLabel(pos)}
                onMouseEnter={
                  calibrationEnabled
                    ? () => setHoveredPosition(pos)
                    : undefined
                }
                onMouseLeave={
                  calibrationEnabled ? () => setHoveredPosition(null) : undefined
                }
                onClick={
                  interactive
                    ? (e) => {
                        if (calibrationEnabled) {
                          handleCalPositionClick(pos, e);
                          return;
                        }
                        e.stopPropagation();
                        onPositionClick?.(pos);
                      }
                    : undefined
                }
                onKeyDown={
                  interactive && !calibrationEnabled
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onPositionClick?.(pos);
                        }
                      }
                    : undefined
                }
              />
            );
          })}
      </svg>
    </div>
  );
}
