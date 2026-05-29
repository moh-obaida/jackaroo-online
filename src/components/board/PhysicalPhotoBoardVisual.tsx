import React, { useMemo } from 'react';
import {
  BoardPosition,
  COLORS_ORDER,
  Marble,
  PlayerColor,
} from '../../types/game';
import {
  BOARD_VIEW_SIZE,
  BoardLayout,
  boardPositionToPoint,
  getBoardLayout,
  scaleLayout,
} from '../../lib/board/boardGeometry';
import {
  mapLayoutPointToPhoto,
  mapLayoutRadiusToPhoto,
  PHYSICAL_BOARD_IMAGE,
} from '../../lib/board/physicalBoardRef';
import { positionKey } from '../../lib/play/boardHighlights';
import { BoardMarblePiece } from './boardMarble';

export type PhysicalPhotoBoardVisualProps = {
  layout?: BoardLayout;
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

/** Board surface = literal reference photo; marbles and highlights overlaid on calibrated coords. */
export function PhysicalPhotoBoardVisual({
  layout: layoutProp,
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
}: PhysicalPhotoBoardVisualProps) {
  const layout = layoutProp ?? getBoardLayout(BOARD_VIEW_SIZE);
  const displaySize = layout.size;
  const pid = idPrefix;
  const viewPad = 12;

  const active = activeColors ?? new Set(COLORS_ORDER);

  const mapPt = (pt: { x: number; y: number }) =>
    mapLayoutPointToPhoto(pt, layout.size, displaySize);

  const highlightKeys = useMemo(
    () => new Set(highlightPositions.map(positionKey)),
    [highlightPositions]
  );

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

  return (
    <div
      className={`board-frame board-frame--photo w-full aspect-square mx-auto overflow-visible ${className}`}
    >
      <svg
        viewBox={`${-viewPad} ${-viewPad} ${displaySize + viewPad * 2} ${displaySize + viewPad * 2}`}
        className="w-full h-full board-svg board-svg--photo overflow-visible"
        role="img"
        aria-label="Jackaroo board"
      >
        <defs>
          <filter id={`${pid}-marbleShadow`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1.5" dy="2.5" stdDeviation="2" floodOpacity="0.6" />
          </filter>
        </defs>

        <image
          href={PHYSICAL_BOARD_IMAGE}
          x={0}
          y={0}
          width={displaySize}
          height={displaySize}
          preserveAspectRatio="xMidYMid meet"
          className="board-photo-surface"
        />

        {displayMarbles.map((marble) => {
          const raw = boardPositionToPoint(marble.position, layout);
          if (!raw) return null;
          const pos = mapPt(raw);
          const baseR = marble.position.type === 'base' ? 8 : 10;
          const r = mapLayoutRadiusToPhoto(baseR, layout.size, displaySize);
          const isOwn = marble.color === myColor;
          const isSelectable = Boolean(
            isMyTurn && selectableMarbleIds?.has(marble.id) && onMarbleClick
          );
          const isSelected = selectedMarbleId === marble.id;
          return (
            <BoardMarblePiece
              key={marble.id}
              marble={marble}
              pos={pos}
              r={r}
              isOwn={isOwn}
              isSelectable={isSelectable}
              isSelected={isSelected}
              shadowId={`${pid}-marbleShadow`}
              onClick={isSelectable ? () => onMarbleClick?.(marble.id) : undefined}
            />
          );
        })}

        {isMyTurn && highlightKeys.size > 0 && (
          <g className="board-highlights-layer">
            {highlightPositions.map((pos) => {
              const raw = boardPositionToPoint(pos, layout);
              if (!raw) return null;
              const pt = mapPt(raw);
              const hr = mapLayoutRadiusToPhoto(16, layout.size, displaySize);
              return (
                <circle
                  key={`hl_${positionKey(pos)}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={hr}
                  className="legal-target-highlight"
                  fill="rgba(230, 184, 0, 0.28)"
                  stroke="#f0c840"
                  strokeWidth={3}
                  pointerEvents="none"
                />
              );
            })}
            {onPositionClick &&
              highlightPositions.map((pos) => {
                const raw = boardPositionToPoint(pos, layout);
                if (!raw) return null;
                const pt = mapPt(raw);
                const hitR = mapLayoutRadiusToPhoto(16, layout.size, displaySize);
                return (
                  <circle
                    key={`hit_${positionKey(pos)}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={hitR}
                    fill="transparent"
                    className="board-hole-hit"
                    role="button"
                    tabIndex={0}
                    aria-label={`Select move target ${positionKey(pos)}`}
                    onClick={() => onPositionClick(pos)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onPositionClick(pos);
                      }
                    }}
                  />
                );
              })}
          </g>
        )}
      </svg>
    </div>
  );
}

export function BoardPreviewPhotoVisual({ size = 200 }: { size?: number }) {
  const layout = useMemo(() => scaleLayout(getBoardLayout(), size), [size]);
  return (
    <PhysicalPhotoBoardVisual
      layout={layout}
      idPrefix="preview"
      showDemoMarbles={false}
      activeColors={new Set(COLORS_ORDER)}
    />
  );
}
