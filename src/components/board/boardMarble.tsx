import React from 'react';
import { Marble, PlayerColor } from '../../types/game';
import { BoardPoint } from '../../lib/board/boardGeometry';

export const MARBLE_COLOR_FILL: Record<PlayerColor, string> = {
  black: '#2e2e2e',
  green: '#1f6b3f',
  blue: '#1e4a9e',
  white: '#e8e0d0',
};

export const MARBLE_COLOR_STROKE: Record<PlayerColor, string> = {
  black: '#8b9299',
  green: '#5ecf8a',
  blue: '#7eb3ff',
  white: '#c4b896',
};

export function BoardMarblePiece({
  marble,
  pos,
  r,
  isOwn,
  isSelectable,
  isSelected,
  onClick,
  shadowId = 'marbleShadow',
}: {
  marble: Marble;
  pos: BoardPoint;
  r: number;
  isOwn: boolean;
  isSelectable: boolean;
  isSelected: boolean;
  onClick?: () => void;
  shadowId?: string;
}) {
  const isLocked =
    marble.position.type === 'start_gate' && marble.position.color === marble.color;

  return (
    <g
      className={`board-marble${isSelectable ? ' board-marble--selectable' : ''}${isSelected ? ' board-marble--selected' : ''}`}
      style={{ transition: 'transform 0.28s ease-out', cursor: onClick ? 'pointer' : undefined }}
      transform={`translate(${pos.x}, ${pos.y})`}
      onClick={onClick}
    >
      {isSelectable && (
        <circle
          r={r + 5}
          fill="none"
          stroke={isSelected ? '#ffd633' : '#5eead4'}
          strokeWidth={isSelected ? 3 : 2}
          className={
            isSelected ? 'marble-glow marble-glow--selected' : 'marble-glow marble-glow--selectable'
          }
          opacity={isSelected ? 1 : 0.9}
        />
      )}
      {isLocked && (
        <circle
          r={r + 6}
          fill="none"
          stroke="#ffd633"
          strokeWidth={2.5}
          opacity={0.95}
          className="gate-lock-ring"
        />
      )}
      <ellipse cx={1.8} cy={3} rx={r + 0.5} ry={r * 0.92} fill="#000" opacity={0.45} />
      <circle
        r={r}
        fill={MARBLE_COLOR_FILL[marble.color]}
        stroke={isLocked ? '#ffd633' : MARBLE_COLOR_STROKE[marble.color]}
        strokeWidth={isLocked ? 3 : isOwn ? 2.5 : 1.5}
        filter={`url(#${shadowId})`}
      />
      <circle cx={-r * 0.32} cy={-r * 0.32} r={r * 0.28} fill="#fff" opacity={0.38} />
      <ellipse cx={r * 0.15} cy={r * 0.2} rx={r * 0.55} ry={r * 0.35} fill="#fff" opacity={0.08} />
      {marble.isFinished && (
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={9}
          fill={marble.color === 'white' ? '#333' : '#fff'}
          fontWeight="bold"
        >
          ✓
        </text>
      )}
    </g>
  );
}
