import React, { useMemo } from 'react';
import {
  BoardPosition,
  COLORS_ORDER,
  GameState,
  HOME_LENGTH,
  Marble,
  PlayerColor,
  TRACK_LENGTH,
} from '../../types/game';
import {
  BoardLayout,
  BoardPoint,
  BOARD_VIEW_SIZE,
  boardPositionToPoint,
  getBoardLayout,
  octagonOutlinePoints,
  scaleLayout,
} from '../../lib/board/boardGeometry';
import { positionKey } from '../../lib/play/boardHighlights';

const COLOR_FILL: Record<PlayerColor, string> = {
  black: '#3a3a3a',
  green: '#2d8a4e',
  blue: '#2563eb',
  white: '#f0ebe0',
};

const COLOR_STROKE: Record<PlayerColor, string> = {
  black: '#9ca3af',
  green: '#6ee7a0',
  blue: '#93c5fd',
  white: '#d4c8a8',
};

const COLOR_GLOW: Record<PlayerColor, string> = {
  black: '#6b7280',
  green: '#34d399',
  blue: '#60a5fa',
  white: '#fef3c7',
};

type BoardVisualProps = {
  layout?: BoardLayout;
  idPrefix?: string;
  activeColors?: Set<PlayerColor>;
  marbles?: Marble[];
  highlightPositions?: BoardPosition[];
  myColor?: PlayerColor | null;
  isMyTurn?: boolean;
  showDemoMarbles?: boolean;
  onPositionClick?: (pos: BoardPosition) => void;
  className?: string;
};

function holeRadius(type: BoardPosition['type']): number {
  if (type === 'start_gate') return 9;
  if (type === 'home') return 7;
  if (type === 'base') return 5.5;
  return 6.5;
}

function DrilledHole({
  holeKey,
  holeFaceId,
  cx,
  cy,
  r,
  accent,
  gate,
}: {
  holeKey: string;
  holeFaceId: string;
  cx: number;
  cy: number;
  r: number;
  accent?: string;
  gate?: boolean;
}) {
  return (
    <g key={holeKey} className="board-hole">
      <ellipse cx={cx + 1} cy={cy + 2} rx={r + 1} ry={r * 0.85} fill="#000" opacity={0.35} />
      <circle cx={cx} cy={cy} r={r + 0.5} fill="#2a1c10" />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${holeFaceId})`} stroke="#5c4838" strokeWidth={0.6} />
      <circle cx={cx - r * 0.25} cy={cy - r * 0.25} r={r * 0.35} fill="#fff" opacity={0.12} />
      {accent && (
        <circle
          cx={cx}
          cy={cy}
          r={r + 3}
          fill="none"
          stroke={accent}
          strokeWidth={gate ? 2.5 : 1.2}
          opacity={gate ? 0.95 : 0.55}
          strokeDasharray={gate ? '3 2' : undefined}
        />
      )}
    </g>
  );
}

function MarblePiece({
  marble,
  pos,
  r,
  isOwn,
  isMyTurn,
  onClick,
}: {
  marble: Marble;
  pos: BoardPoint;
  r: number;
  isOwn: boolean;
  isMyTurn: boolean;
  onClick?: () => void;
}) {
  const isLocked =
    marble.position.type === 'start_gate' && marble.position.color === marble.color;
  const glow = isOwn && isMyTurn;

  return (
    <g
      className="board-marble"
      style={{ transition: 'transform 0.28s ease-out' }}
      transform={`translate(${pos.x}, ${pos.y})`}
      onClick={onClick}
    >
      {glow && (
        <circle
          r={r + 5}
          fill="none"
          stroke={COLOR_GLOW[marble.color]}
          strokeWidth={2}
          className="marble-glow"
          opacity={0.85}
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
      <ellipse cx={1.5} cy={2.5} rx={r} ry={r * 0.9} fill="#000" opacity={0.4} />
      <circle
        r={r}
        fill={COLOR_FILL[marble.color]}
        stroke={isLocked ? '#ffd633' : COLOR_STROKE[marble.color]}
        strokeWidth={isLocked ? 3 : isOwn ? 2.5 : 1.5}
        filter={`url(#marbleShadow)`}
      />
      <circle cx={-r * 0.3} cy={-r * 0.3} r={r * 0.25} fill="#fff" opacity={0.35} />
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

export function BoardVisual({
  layout: layoutProp,
  idPrefix = 'board',
  activeColors,
  marbles = [],
  highlightPositions = [],
  myColor = null,
  isMyTurn = false,
  showDemoMarbles = false,
  onPositionClick,
  className = '',
}: BoardVisualProps) {
  const layout = layoutProp ?? getBoardLayout(BOARD_VIEW_SIZE);
  const c = layout.center;
  const pid = idPrefix;

  const active = activeColors ?? new Set(COLORS_ORDER);

  const highlightKeys = useMemo(
    () => new Set(highlightPositions.map(positionKey)),
    [highlightPositions]
  );

  const allHoles = useMemo(() => {
    const holes: { pos: BoardPosition; pt: BoardPoint; r: number }[] = [];
    for (const color of COLORS_ORDER) {
      if (!active.has(color)) continue;
      const gate: BoardPosition = { color, type: 'start_gate', index: 0 };
      const gp = boardPositionToPoint(gate, layout);
      if (gp) holes.push({ pos: gate, pt: gp, r: holeRadius('start_gate') });

      for (let i = 0; i < TRACK_LENGTH; i++) {
        const pos: BoardPosition = { color, type: 'track', index: i };
        const pt = boardPositionToPoint(pos, layout);
        if (pt) holes.push({ pos, pt, r: holeRadius('track') });
      }

      for (let i = 0; i < HOME_LENGTH; i++) {
        const pos: BoardPosition = { color, type: 'home', index: i };
        const pt = boardPositionToPoint(pos, layout);
        if (pt) holes.push({ pos, pt, r: holeRadius('home') });
      }

      for (let i = 0; i < 4; i++) {
        const pos: BoardPosition = { color, type: 'base', index: i };
        const pt = boardPositionToPoint(pos, layout);
        if (pt) holes.push({ pos, pt, r: holeRadius('base') });
      }
    }
    return holes;
  }, [layout, active]);

  const renderHighlights = () =>
    highlightPositions.map((pos) => {
      const pt = boardPositionToPoint(pos, layout);
      if (!pt) return null;
      return (
        <circle
          key={`hl_${positionKey(pos)}`}
          cx={pt.x}
          cy={pt.y}
          r={14}
          className="legal-move-highlight"
          fill="none"
          stroke="#e6b800"
          strokeWidth={2.5}
          pointerEvents="none"
        />
      );
    });

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

  const outerOct = octagonOutlinePoints(layout, -6);
  const boardOct = octagonOutlinePoints(layout, 8);
  const innerOct = octagonOutlinePoints(layout, 22);

  return (
    <div className={`board-frame w-full aspect-square mx-auto ${className}`}>
      <svg
        viewBox={`0 0 ${layout.size} ${layout.size}`}
        className="w-full h-full board-svg"
        role="img"
        aria-label="Jackaroo board"
      >
        <defs>
          <linearGradient id={`${pid}-woodBase`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7a5230" />
            <stop offset="35%" stopColor="#4a3018" />
            <stop offset="100%" stopColor="#1a1008" />
          </linearGradient>
          <linearGradient id={`${pid}-woodGrain`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a67c42" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1a1008" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id={`${pid}-woodBevel`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d4a563" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.25" />
          </linearGradient>
          <radialGradient id={`${pid}-holeFace`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e8dcc8" />
            <stop offset="55%" stopColor="#b8a078" />
            <stop offset="100%" stopColor="#5c4838" />
          </radialGradient>
          <radialGradient id={`${pid}-centerPit`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3d2810" />
            <stop offset="100%" stopColor="#0e0a06" />
          </radialGradient>
          <filter id="marbleShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodOpacity="0.55" />
          </filter>
          <filter id={`${pid}-boardDepth`} x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.55" />
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#c9a227" floodOpacity="0.12" />
          </filter>
        </defs>

        <g filter={`url(#${pid}-boardDepth)`}>
        <polygon points={outerOct} fill="#060504" stroke="#1a0f06" strokeWidth={6} />
        <polygon points={boardOct} fill={`url(#${pid}-woodBase)`} stroke="#d4af37" strokeWidth={3.5} />
        <polygon points={boardOct} fill={`url(#${pid}-woodBevel)`} stroke="none" opacity={0.5} />
        <polygon points={boardOct} fill={`url(#${pid}-woodGrain)`} stroke="none" opacity={0.38} />
        <polygon points={innerOct} fill="#2a1c10" fillOpacity={0.18} stroke="#6b4420" strokeWidth={1.2} />

        {/* Flat-edge track rails (octagon sides) */}
        {[
          { x1: c - layout.size * 0.28, y1: c - layout.size * 0.358, x2: c + layout.size * 0.28, y2: c - layout.size * 0.358 },
          { x1: c + layout.size * 0.358, y1: c - layout.size * 0.28, x2: c + layout.size * 0.358, y2: c + layout.size * 0.28 },
          { x1: c - layout.size * 0.28, y1: c + layout.size * 0.358, x2: c + layout.size * 0.28, y2: c + layout.size * 0.358 },
          { x1: c - layout.size * 0.358, y1: c - layout.size * 0.28, x2: c - layout.size * 0.358, y2: c + layout.size * 0.28 },
        ].map((edge, i) => (
          <line
            key={`flat_edge_${i}`}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke="#c9a227"
            strokeWidth={2}
            opacity={0.55}
            strokeLinecap="round"
          />
        ))}
        <rect
          x={c - 3}
          y={c - layout.size * 0.358 + 4}
          width={6}
          height={layout.size * 0.07}
          rx={1}
          fill="#c9a227"
          opacity={0.75}
        />
        <rect
          x={c - 3}
          y={c + layout.size * 0.358 - layout.size * 0.07 - 4}
          width={6}
          height={layout.size * 0.07}
          rx={1}
          fill="#c9a227"
          opacity={0.75}
        />

        {COLORS_ORDER.map((color) => {
          if (!active.has(color)) return null;
          const nc = layout.nestCenter[color];
          const vn = layout.vNotch[color];
          const homeEnd = layout.home[color][HOME_LENGTH - 1];
          return (
            <g key={`zone_${color}`}>
              <ellipse
                cx={nc.x}
                cy={nc.y}
                rx={layout.size * 0.059}
                ry={layout.size * 0.05}
                fill={COLOR_FILL[color]}
                fillOpacity={0.38}
                stroke={COLOR_STROKE[color]}
                strokeWidth={2}
              />
              <circle
                cx={vn.x}
                cy={vn.y}
                r={5}
                fill="none"
                stroke={COLOR_STROKE[color]}
                strokeWidth={1}
                opacity={0.35}
              />
              <line
                x1={vn.x}
                y1={vn.y}
                x2={homeEnd?.x ?? vn.x}
                y2={homeEnd?.y ?? vn.y}
                stroke={COLOR_STROKE[color]}
                strokeWidth={2}
                strokeDasharray="5 4"
                opacity={0.5}
              />
            </g>
          );
        })}

        {allHoles.map(({ pos, pt, r }) => (
          <DrilledHole
            holeKey={positionKey(pos)}
            holeFaceId={`${pid}-holeFace`}
            cx={pt.x}
            cy={pt.y}
            r={r}
            accent={
              pos.type === 'start_gate' || pos.type === 'home' ? COLOR_GLOW[pos.color] : undefined
            }
            gate={pos.type === 'start_gate'}
          />
        ))}

        <polygon
          points={octagonOutlinePoints(layout, 52)}
          fill={`url(#${pid}-centerPit)`}
          stroke="#6b4420"
          strokeWidth={1}
        />
        <rect
          x={c - 22}
          y={c - 30}
          width={44}
          height={58}
          rx={4}
          fill="#4a1515"
          stroke="#8b2020"
          strokeWidth={0.8}
          opacity={0.92}
        />
        <line x1={c - 14} y1={c - 18} x2={c + 14} y2={c - 18} stroke="#c9a227" strokeWidth={0.6} opacity={0.4} />
        <line x1={c - 14} y1={c - 8} x2={c + 10} y2={c - 8} stroke="#c9a227" strokeWidth={0.6} opacity={0.35} />

        {displayMarbles.map((marble) => {
          const pt = boardPositionToPoint(marble.position, layout);
          if (!pt) return null;
          const r = marble.position.type === 'base' ? 8 : 10;
          const isOwn = marble.color === myColor;
          return (
            <MarblePiece
              key={marble.id}
              marble={marble}
              pos={pt}
              r={r}
              isOwn={isOwn}
              isMyTurn={isMyTurn}
            />
          );
        })}

        {isMyTurn && highlightKeys.size > 0 && (
          <g className="board-highlights-layer">
            {renderHighlights()}
            {onPositionClick &&
              highlightPositions.map((pos) => {
                const pt = boardPositionToPoint(pos, layout);
                if (!pt) return null;
                return (
                  <circle
                    key={`hit_${positionKey(pos)}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={16}
                    fill="transparent"
                    className="board-hole-hit"
                    onClick={() => onPositionClick(pos)}
                  />
                );
              })}
          </g>
        )}
        </g>
      </svg>
    </div>
  );
}

export function BoardVisualFromGame({
  gameState,
  playerId,
  ...rest
}: Omit<BoardVisualProps, 'marbles' | 'activeColors'> & {
  gameState: GameState;
  playerId: string;
}) {
  const activeColors = useMemo(
    () => new Set(gameState.players.map((p) => p.color)),
    [gameState.players]
  );
  const myColor = gameState.players.find((p) => p.id === playerId)?.color ?? null;
  return (
    <BoardVisual
      marbles={gameState.marbles}
      activeColors={activeColors}
      myColor={myColor}
      {...rest}
    />
  );
}

export function BoardPreviewVisual({ size = 200 }: { size?: number }) {
  const layout = useMemo(() => scaleLayout(getBoardLayout(), size), [size]);
  return (
    <BoardVisual
      layout={layout}
      idPrefix="preview"
      showDemoMarbles
      activeColors={new Set(COLORS_ORDER)}
    />
  );
}
