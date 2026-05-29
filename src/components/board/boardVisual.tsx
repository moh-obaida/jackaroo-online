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
  homeLanePolyline,
  octagonOutlinePoints,
  scaleLayout,
  trackSectionPolylines,
} from '../../lib/board/boardGeometry';
import { positionKey } from '../../lib/play/boardHighlights';
import { BoardPreviewPhotoVisual, PhysicalPhotoBoardVisual } from './PhysicalPhotoBoardVisual';
import { ImageMappedBoardVisual } from './ImageMappedBoardVisual';

const COLOR_FILL: Record<PlayerColor, string> = {
  black: '#2e2e2e',
  green: '#1f6b3f',
  blue: '#1e4a9e',
  white: '#e8e0d0',
};

const COLOR_STROKE: Record<PlayerColor, string> = {
  black: '#8b9299',
  green: '#5ecf8a',
  blue: '#7eb3ff',
  white: '#c4b896',
};

const COLOR_GLOW: Record<PlayerColor, string> = {
  black: '#9ca3af',
  green: '#34d399',
  blue: '#60a5fa',
  white: '#fde68a',
};

const COLOR_ZONE_TINT: Record<PlayerColor, string> = {
  black: '#1a1814',
  green: '#0f2418',
  blue: '#0c1828',
  white: '#2a2620',
};

/** Corner nest pocket centers (visual only — holes use geometry). */
const ZONE_ANCHOR: Record<PlayerColor, 'tl' | 'tr' | 'br' | 'bl'> = {
  black: 'tl',
  green: 'tr',
  blue: 'br',
  white: 'bl',
};

type BoardVisualProps = {
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

function holeRadius(type: BoardPosition['type']): number {
  if (type === 'start_gate') return 9;
  if (type === 'home') return 7;
  if (type === 'base') return 5.5;
  return 6.5;
}

function DrilledHole({
  holeKey,
  holeFaceId,
  holeRimId,
  cx,
  cy,
  r,
  accent,
  gate,
}: {
  holeKey: string;
  holeFaceId: string;
  holeRimId: string;
  cx: number;
  cy: number;
  r: number;
  accent?: string;
  gate?: boolean;
}) {
  return (
    <g key={holeKey} className="board-hole">
      <ellipse cx={cx + 1.4} cy={cy + 2.4} rx={r + 1.3} ry={r * 0.9} fill="#000" opacity={0.5} />
      <circle cx={cx} cy={cy} r={r + 1.35} fill={`url(#${holeRimId})`} />
      <circle cx={cx} cy={cy} r={r + 0.75} fill="#2a1c10" />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${holeFaceId})`} stroke="#5c4834" strokeWidth={0.6} />
      <ellipse
        cx={cx - r * 0.22}
        cy={cy - r * 0.28}
        rx={r * 0.38}
        ry={r * 0.28}
        fill="#fff"
        opacity={0.22}
      />
      {gate && (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={r + 4.5}
            fill="none"
            stroke="#d4af37"
            strokeWidth={2}
            opacity={0.85}
          />
          <circle cx={cx} cy={cy} r={2.2} fill="#d4af37" opacity={0.9} />
        </>
      )}
      {accent && !gate && (
        <circle
          cx={cx}
          cy={cy}
          r={r + 2.5}
          fill="none"
          stroke={accent}
          strokeWidth={1}
          opacity={0.4}
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
  isSelectable,
  isSelected,
  onClick,
}: {
  marble: Marble;
  pos: BoardPoint;
  r: number;
  isOwn: boolean;
  isSelectable: boolean;
  isSelected: boolean;
  onClick?: () => void;
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
          className={isSelected ? 'marble-glow marble-glow--selected' : 'marble-glow marble-glow--selectable'}
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
        fill={COLOR_FILL[marble.color]}
        stroke={isLocked ? '#ffd633' : COLOR_STROKE[marble.color]}
        strokeWidth={isLocked ? 3 : isOwn ? 2.5 : 1.5}
        filter="url(#marbleShadow)"
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

function WoodGrainLines({ c, size, pid }: { c: number; size: number; pid: string }) {
  const lines = useMemo(() => {
    const out: { x1: number; y1: number; x2: number; y2: number; w: number }[] = [];
    for (let i = 0; i < 18; i++) {
      const t = i / 17;
      const y = c - size * 0.34 + t * size * 0.68;
      out.push({
        x1: c - size * 0.38,
        y1: y + Math.sin(i * 0.85) * 2.5,
        x2: c + size * 0.38,
        y2: y + Math.cos(i * 0.75) * 2.5,
        w: 0.35 + (i % 4) * 0.2,
      });
    }
    return out;
  }, [c, size]);

  return (
    <g opacity={0.28} stroke={`url(#${pid}-grainLine)`} fill="none">
      {lines.map((ln, i) => (
        <path
          key={`grain_${i}`}
          d={`M ${ln.x1} ${ln.y1} Q ${c} ${(ln.y1 + ln.y2) / 2} ${ln.x2} ${ln.y2}`}
          strokeWidth={ln.w}
        />
      ))}
    </g>
  );
}

function CenterCardWell({ layout, pid }: { layout: BoardLayout; pid: string }) {
  const c = layout.center;
  const outerRim = octagonOutlinePoints(layout, 34);
  const liner = octagonOutlinePoints(layout, 40);
  const innerFloor = octagonOutlinePoints(layout, 46);
  const innerLip = octagonOutlinePoints(layout, 50);

  return (
    <g className="board-center-well">
      <polygon points={outerRim} fill="#1a1208" stroke="#6b4e28" strokeWidth={2.2} />
      <polygon
        points={liner}
        fill={`url(#${pid}-centerLiner)`}
        stroke="#9a7a52"
        strokeWidth={1.4}
      />
      <polygon points={innerFloor} fill={`url(#${pid}-centerFloor)`} stroke="#b8a078" strokeWidth={0.8} />
      <polygon points={innerLip} fill="none" stroke="#d4c4a0" strokeWidth={0.8} opacity={0.65} />
      {/* Fold seam (many physical boards are hinged) */}
      <line
        x1={c}
        y1={c - layout.size * 0.14}
        x2={c}
        y2={c + layout.size * 0.14}
        stroke="#2a1c10"
        strokeWidth={1.2}
        opacity={0.35}
      />
      {/* Subtle stacked-card hint (decorative, not playable) */}
      {[
        { dx: -8, dy: -4, rot: -8 },
        { dx: 4, dy: -6, rot: 4 },
        { dx: -2, dy: 6, rot: -2 },
      ].map((card, i) => (
        <rect
          key={`deck_hint_${i}`}
          x={c + card.dx - 10}
          y={c + card.dy - 14}
          width={20}
          height={28}
          rx={2}
          fill="#f5f0e6"
          stroke="#8b7355"
          strokeWidth={0.8}
          opacity={0.42 - i * 0.07}
          transform={`rotate(${card.rot} ${c + card.dx} ${c + card.dy})`}
        />
      ))}
    </g>
  );
}

function NestPocket({
  color,
  nc,
  size,
  pid,
}: {
  color: PlayerColor;
  nc: BoardPoint;
  size: number;
  pid: string;
}) {
  const rx = size * 0.072;
  const ry = size * 0.058;
  return (
    <g className={`board-nest board-nest--${color}`}>
      <ellipse
        cx={nc.x + 1}
        cy={nc.y + 2}
        rx={rx + 2}
        ry={ry + 2}
        fill="#000"
        opacity={0.35}
      />
      <ellipse
        cx={nc.x}
        cy={nc.y}
        rx={rx}
        ry={ry}
        fill={`url(#${pid}-nestRecess-${color})`}
        stroke={COLOR_STROKE[color]}
        strokeWidth={1.8}
      />
      <ellipse
        cx={nc.x}
        cy={nc.y}
        rx={rx * 0.68}
        ry={ry * 0.68}
        fill="#3d2810"
        fillOpacity={0.35}
        stroke="none"
      />
    </g>
  );
}

function ColorZoneWash({
  layout,
  color,
  active,
}: {
  layout: BoardLayout;
  color: PlayerColor;
  active: boolean;
}) {
  if (!active) return null;
  const c = layout.center;
  const s = layout.size;
  const nc = layout.nestCenter[color];
  const anchor = ZONE_ANCHOR[color];

  let path = '';
  const pad = s * 0.06;
  if (anchor === 'tl') {
    path = `M ${c - s * 0.36} ${c - s * 0.36} L ${nc.x + pad} ${c - s * 0.36} L ${nc.x} ${nc.y + pad} L ${c - s * 0.36} ${nc.y} Z`;
  } else if (anchor === 'tr') {
    path = `M ${c + s * 0.36} ${c - s * 0.36} L ${nc.x - pad} ${c - s * 0.36} L ${nc.x} ${nc.y + pad} L ${c + s * 0.36} ${nc.y} Z`;
  } else if (anchor === 'br') {
    path = `M ${c + s * 0.36} ${c + s * 0.36} L ${nc.x - pad} ${c + s * 0.36} L ${nc.x} ${nc.y - pad} L ${c + s * 0.36} ${nc.y} Z`;
  } else {
    path = `M ${c - s * 0.36} ${c + s * 0.36} L ${nc.x + pad} ${c + s * 0.36} L ${nc.x} ${nc.y - pad} L ${c - s * 0.36} ${nc.y} Z`;
  }

  return (
    <path
      d={path}
      fill={COLOR_ZONE_TINT[color]}
      fillOpacity={0.18}
      stroke="none"
      pointerEvents="none"
    />
  );
}

/** SVG wood board — only when VITE_BOARD_PROCEDURAL=1 */
function ProceduralBoardVisual({
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
}: BoardVisualProps) {
  const layout = layoutProp ?? getBoardLayout(BOARD_VIEW_SIZE);
  const c = layout.center;
  const pid = idPrefix;

  const active = activeColors ?? new Set(COLORS_ORDER);

  const highlightKeys = useMemo(
    () => new Set(highlightPositions.map(positionKey)),
    [highlightPositions]
  );

  const trackSections = useMemo(() => trackSectionPolylines(layout), [layout]);

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
          r={16}
          className="legal-target-highlight"
          fill="rgba(230, 184, 0, 0.22)"
          stroke="#f0c840"
          strokeWidth={3}
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

  const outerOct = octagonOutlinePoints(layout, -8);
  const boardOct = octagonOutlinePoints(layout, 6);
  const bevelOct = octagonOutlinePoints(layout, 14);

  const viewPad = 28;

  return (
    <div className={`board-frame w-full aspect-square mx-auto overflow-visible ${className}`}>
      <svg
        viewBox={`${-viewPad} ${-viewPad} ${layout.size + viewPad * 2} ${layout.size + viewPad * 2}`}
        className="w-full h-full board-svg overflow-visible"
        role="img"
        aria-label="Jackaroo board"
      >
        <defs>
          <linearGradient id={`${pid}-woodBase`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7a5230" />
            <stop offset="22%" stopColor="#5c3a1e" />
            <stop offset="55%" stopColor="#3d2812" />
            <stop offset="100%" stopColor="#1a0f06" />
          </linearGradient>
          <linearGradient id={`${pid}-woodEdge`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b8925a" stopOpacity="0.5" />
            <stop offset="40%" stopColor="#4a3018" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0a0604" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id={`${pid}-woodSheen`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.12" />
            <stop offset="35%" stopColor="#fff" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id={`${pid}-grainLine`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3d2810" stopOpacity="0" />
            <stop offset="50%" stopColor="#d4a563" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3d2810" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${pid}-holeFace`} cx="40%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#f2ead8" />
            <stop offset="42%" stopColor="#d4c4a4" />
            <stop offset="78%" stopColor="#8a7058" />
            <stop offset="100%" stopColor="#4a3828" />
          </radialGradient>
          <radialGradient id={`${pid}-holeRim`} cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor="#4a3018" />
            <stop offset="100%" stopColor="#120a06" />
          </radialGradient>
          <linearGradient id={`${pid}-centerLiner`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c9b898" />
            <stop offset="100%" stopColor="#8a7058" />
          </linearGradient>
          <radialGradient id={`${pid}-centerFloor`} cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor="#ebe3d2" />
            <stop offset="55%" stopColor="#d0c0a4" />
            <stop offset="100%" stopColor="#9a8468" />
          </radialGradient>
          {COLORS_ORDER.map((color) => (
            <radialGradient
              key={`nest-${color}`}
              id={`${pid}-nestRecess-${color}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor="#2a1c10" />
              <stop offset="100%" stopColor="#0e0a06" />
            </radialGradient>
          ))}
          <filter id="marbleShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1.5" dy="2.5" stdDeviation="2" floodOpacity="0.6" />
          </filter>
          <filter id={`${pid}-boardDepth`} x="-18%" y="-18%" width="136%" height="136%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000" floodOpacity="0.6" />
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#c9a227" floodOpacity="0.15" />
          </filter>
          <clipPath id={`${pid}-boardClip`}>
            <polygon points={boardOct} />
          </clipPath>
        </defs>

        <g filter={`url(#${pid}-boardDepth)`}>
          {/* Base slab + bevel */}
          <polygon points={outerOct} fill="#080604" stroke="#1a0f06" strokeWidth={5} />
          <polygon points={boardOct} fill={`url(#${pid}-woodBase)`} stroke="#a67c2a" strokeWidth={2.5} />
          <polygon points={bevelOct} fill={`url(#${pid}-woodEdge)`} stroke="none" opacity={0.88} />
          <polygon points={boardOct} fill={`url(#${pid}-woodSheen)`} stroke="none" pointerEvents="none" />

          <g clipPath={`url(#${pid}-boardClip)`}>
            <WoodGrainLines c={c} size={layout.size} pid={pid} />

            {COLORS_ORDER.map((color) => (
              <ColorZoneWash key={`zone_${color}`} layout={layout} color={color} active={active.has(color)} />
            ))}

            {/* Carved outer track — follows real hole path, not straight octagon sides */}
            {trackSections.map((pts, i) => (
              <polyline
                key={`track_ch_${i}`}
                points={pts}
                fill="none"
                stroke="#1a1008"
                strokeWidth={layout.size * 0.016}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.45}
              />
            ))}

            {/* V-notches on cardinal sides (home entry) */}
            {COLORS_ORDER.map((color) => {
              if (!active.has(color)) return null;
              const vn = layout.vNotch[color];
              const s = 7;
              let d = '';
              if (color === 'black') {
                d = `M ${vn.x} ${vn.y - s} L ${vn.x + s} ${vn.y + 4} L ${vn.x - s} ${vn.y + 4} Z`;
              } else if (color === 'green') {
                d = `M ${vn.x + s} ${vn.y} L ${vn.x - 4} ${vn.y + s} L ${vn.x - 4} ${vn.y - s} Z`;
              } else if (color === 'blue') {
                d = `M ${vn.x} ${vn.y + s} L ${vn.x + s} ${vn.y - 4} L ${vn.x - s} ${vn.y - 4} Z`;
              } else {
                d = `M ${vn.x - s} ${vn.y} L ${vn.x + 4} ${vn.y + s} L ${vn.x + 4} ${vn.y - s} Z`;
              }
              return (
                <path
                  key={`vnotch_${color}`}
                  d={d}
                  fill="#1a1008"
                  stroke={COLOR_STROKE[color]}
                  strokeWidth={1.2}
                  opacity={0.9}
                />
              );
            })}

            {/* Home lanes — inward grooves */}
            {COLORS_ORDER.map((color) => {
              if (!active.has(color)) return null;
              const lane = homeLanePolyline(layout, color);
              return (
                <g key={`home_lane_${color}`}>
                  <polyline
                    points={lane}
                    fill="none"
                    stroke="#1a1008"
                    strokeWidth={layout.size * 0.014}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.5}
                  />
                </g>
              );
            })}

            {COLORS_ORDER.map((color) => {
              if (!active.has(color)) return null;
              return (
                <NestPocket
                  key={`nest_${color}`}
                  color={color}
                  nc={layout.nestCenter[color]}
                  size={layout.size}
                  pid={pid}
                />
              );
            })}

            <CenterCardWell layout={layout} pid={pid} />

            {/* Drilled holes */}
            {allHoles.map(({ pos, pt, r }) => (
              <DrilledHole
                holeKey={positionKey(pos)}
                holeFaceId={`${pid}-holeFace`}
                holeRimId={`${pid}-holeRim`}
                cx={pt.x}
                cy={pt.y}
                r={r}
                accent={
                  pos.type === 'home' ? COLOR_GLOW[pos.color] : undefined
                }
                gate={pos.type === 'start_gate'}
              />
            ))}
          </g>

          {/* Marbles above board surface */}
          {displayMarbles.map((marble) => {
            const pt = boardPositionToPoint(marble.position, layout);
            if (!pt) return null;
            const r = marble.position.type === 'base' ? 8 : 10;
            const isOwn = marble.color === myColor;
            const isSelectable = Boolean(
              isMyTurn && selectableMarbleIds?.has(marble.id) && onMarbleClick
            );
            const isSelected = selectedMarbleId === marble.id;
            return (
              <MarblePiece
                key={marble.id}
                marble={marble}
                pos={pt}
                r={r}
                isOwn={isOwn}
                isSelectable={isSelectable}
                isSelected={isSelected}
                onClick={
                  isSelectable ? () => onMarbleClick?.(marble.id) : undefined
                }
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
        </g>
      </svg>
    </div>
  );
}

/** Default: image-mapped premium board. VITE_BOARD_PROCEDURAL=1 for SVG; VITE_BOARD_PHYSICAL=1 for old photo. */
export function BoardVisual(props: BoardVisualProps) {
  if (import.meta.env.VITE_BOARD_PROCEDURAL === '1') {
    return <ProceduralBoardVisual {...props} />;
  }
  if (import.meta.env.VITE_BOARD_PHYSICAL === '1') {
    return <PhysicalPhotoBoardVisual {...props} />;
  }
  return <ImageMappedBoardVisual {...props} />;
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

function BoardPreviewProcedural({ size = 200 }: { size?: number }) {
  const layout = useMemo(() => scaleLayout(getBoardLayout(), size), [size]);
  return (
    <ProceduralBoardVisual
      layout={layout}
      idPrefix="preview"
      showDemoMarbles
      activeColors={new Set(COLORS_ORDER)}
    />
  );
}

function BoardPreviewImageMapped({ size = 200 }: { size?: number }) {
  return (
    <div className="board-preview-image-mapped" style={{ width: size, height: size }}>
      <ImageMappedBoardVisual
        idPrefix="preview"
        showDemoMarbles
        activeColors={new Set(COLORS_ORDER)}
        className="image-board-stage--preview"
      />
    </div>
  );
}

export function BoardPreviewVisual({ size = 200 }: { size?: number }) {
  if (import.meta.env.VITE_BOARD_PROCEDURAL === '1') {
    return <BoardPreviewProcedural size={size} />;
  }
  if (import.meta.env.VITE_BOARD_PHYSICAL === '1') {
    return <BoardPreviewPhotoVisual size={size} />;
  }
  return <BoardPreviewImageMapped size={size} />;
}
