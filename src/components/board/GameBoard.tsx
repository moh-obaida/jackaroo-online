import React, { useMemo } from 'react';
import {
  GameState,
  Marble,
  PlayerColor,
<<<<<<< HEAD
  BoardPosition,
=======
>>>>>>> origin/main
  COLORS_ORDER,
  TRACK_LENGTH,
  HOME_LENGTH,
  TOTAL_OUTER_SPOTS,
} from '../../types/game';
<<<<<<< HEAD
import { positionKey } from '../../lib/play/boardHighlights';
=======
>>>>>>> origin/main

interface GameBoardProps {
  gameState: GameState;
  selectedCardId: string | null;
  highlightPositions?: BoardPosition[];
  playerId: string;
  isMyTurn?: boolean;
}

const colorMap: Record<PlayerColor, string> = {
  black: '#3a3a3a',
  green: '#2d8a4e',
  blue: '#2563eb',
  white: '#f0ebe0',
};

const colorStroke: Record<PlayerColor, string> = {
  black: '#8a8a8a',
  green: '#6ee7a0',
  blue: '#93c5fd',
  white: '#d4c8a8',
};

const colorGlow: Record<PlayerColor, string> = {
  black: '#555',
  green: '#34d399',
  blue: '#60a5fa',
  white: '#fef3c7',
};

<<<<<<< HEAD
function drilledHole(
  key: string,
  cx: number,
  cy: number,
  r: number,
  opts?: { accent?: string; gate?: boolean }
) {
  return (
    <g key={key}>
      <ellipse cx={cx + 1} cy={cy + 2} rx={r + 1} ry={r * 0.85} fill="#000" opacity={0.35} />
      <circle cx={cx} cy={cy} r={r + 0.5} fill="#2a1c10" />
      <circle cx={cx} cy={cy} r={r} fill="url(#holeFace)" stroke="#5c4838" strokeWidth={0.6} />
      <circle cx={cx - r * 0.25} cy={cy - r * 0.25} r={r * 0.35} fill="#fff" opacity={0.12} />
      {opts?.accent && (
        <circle
          cx={cx}
          cy={cy}
          r={r + 3}
          fill="none"
          stroke={opts.accent}
          strokeWidth={opts.gate ? 2.5 : 1.2}
          opacity={opts.gate ? 0.9 : 0.55}
          strokeDasharray={opts.gate ? '3 2' : undefined}
        />
      )}
    </g>
  );
}

=======
>>>>>>> origin/main
function octagonPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

export function GameBoard({
  gameState,
  selectedCardId: _selectedCardId,
<<<<<<< HEAD
  highlightPositions = [],
=======
>>>>>>> origin/main
  playerId,
  isMyTurn = false,
}: GameBoardProps) {
  const { marbles, players } = gameState;

  const size = 640;
  const center = size / 2;
  const outerRadius = 268;
  const homeRadius = 108;

  const geometry = useMemo(() => {
    const getTrackPosition = (colorIndex: number, trackIndex: number) => {
      const sectionSize = TRACK_LENGTH + 1;
      const globalIndex = colorIndex * sectionSize + 1 + trackIndex;
      const angle = (globalIndex / TOTAL_OUTER_SPOTS) * Math.PI * 2 - Math.PI / 2;
      return {
        x: center + outerRadius * Math.cos(angle),
        y: center + outerRadius * Math.sin(angle),
      };
    };

    const getStartGatePosition = (colorIndex: number) => {
      const sectionSize = TRACK_LENGTH + 1;
      const globalIndex = colorIndex * sectionSize;
      const angle = (globalIndex / TOTAL_OUTER_SPOTS) * Math.PI * 2 - Math.PI / 2;
      return {
        x: center + outerRadius * Math.cos(angle),
        y: center + outerRadius * Math.sin(angle),
      };
    };

    const getHomePosition = (colorIndex: number, homeIndex: number) => {
      const angle =
        ((colorIndex * (TRACK_LENGTH + 1)) / TOTAL_OUTER_SPOTS) * Math.PI * 2 - Math.PI / 2;
      const radius = homeRadius + (HOME_LENGTH - homeIndex - 1) * 22;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      };
    };

    const getBasePosition = (colorIndex: number, baseIndex: number) => {
      const angle =
        ((colorIndex * (TRACK_LENGTH + 1)) / TOTAL_OUTER_SPOTS) * Math.PI * 2 - Math.PI / 2;
      const radius = outerRadius + 42 + (baseIndex % 2) * 16;
      const spread = baseIndex < 2 ? -10 : 10;
      const perp = angle + Math.PI / 2;
      const x = center + radius * Math.cos(angle) + spread * Math.cos(perp);
      const y = center + radius * Math.sin(angle) + spread * Math.sin(perp);
      return { x, y };
    };

    return { getTrackPosition, getStartGatePosition, getHomePosition, getBasePosition };
  }, [center, outerRadius, homeRadius]);

  const getMarblePosition = (marble: Marble): { x: number; y: number } | null => {
    const colorIndex = COLORS_ORDER.indexOf(marble.color);
    if (colorIndex === -1) return null;

    switch (marble.position.type) {
      case 'track':
        return geometry.getTrackPosition(
          COLORS_ORDER.indexOf(marble.position.color),
          marble.position.index
        );
      case 'start_gate':
        return geometry.getStartGatePosition(COLORS_ORDER.indexOf(marble.position.color));
      case 'home':
        return geometry.getHomePosition(colorIndex, marble.position.index);
      case 'base':
        return geometry.getBasePosition(colorIndex, marble.position.index);
    }
  };

  const activePlayerColors = new Set(players.map((p) => p.color));

  const renderNestAreas = () =>
    COLORS_ORDER.map((color, ci) => {
      if (!activePlayerColors.has(color)) return null;
      const angle = ((ci * (TRACK_LENGTH + 1)) / TOTAL_OUTER_SPOTS) * Math.PI * 2 - Math.PI / 2;
      const nx = center + (outerRadius + 58) * Math.cos(angle);
      const ny = center + (outerRadius + 58) * Math.sin(angle);
      return (
        <g key={`nest_${color}`}>
          <ellipse
            cx={nx}
            cy={ny}
            rx={36}
            ry={28}
            fill={colorMap[color]}
            fillOpacity={0.35}
            stroke={colorStroke[color]}
            strokeWidth={2}
          />
          {[0, 1, 2, 3].map((bi) => {
            const bp = geometry.getBasePosition(ci, bi);
<<<<<<< HEAD
            return drilledHole(`nest_hole_${color}_${bi}`, bp.x, bp.y, 5);
=======
            return (
              <circle
                key={`nest_hole_${color}_${bi}`}
                cx={bp.x}
                cy={bp.y}
                r={5}
                fill="#1a1208"
                stroke="#5c3c18"
                strokeWidth={0.8}
                opacity={0.7}
              />
            );
>>>>>>> origin/main
          })}
        </g>
      );
    });

  const renderTrackSpots = () => {
    const spots: JSX.Element[] = [];
    for (let ci = 0; ci < 4; ci++) {
      const color = COLORS_ORDER[ci];
<<<<<<< HEAD

      const sgPos = geometry.getStartGatePosition(ci);
      if (activePlayerColors.has(color)) {
        spots.push(
          drilledHole(`sg_${color}`, sgPos.x, sgPos.y, 9, {
            accent: colorGlow[color],
            gate: true,
          })
        );
      }

      for (let si = 0; si < TRACK_LENGTH; si++) {
        const pos = geometry.getTrackPosition(ci, si);
        spots.push(drilledHole(`track_${color}_${si}`, pos.x, pos.y, 6.5));
      }

=======

      const sgPos = geometry.getStartGatePosition(ci);
      spots.push(
        <g key={`sg_${color}`}>
          <circle cx={sgPos.x} cy={sgPos.y} r={10} fill="#c9b896" stroke={colorStroke[color]} strokeWidth={2.5} />
          <circle cx={sgPos.x} cy={sgPos.y} r={12} fill="none" stroke={colorGlow[color]} strokeWidth={1} opacity={0.5} />
        </g>
      );

      for (let si = 0; si < TRACK_LENGTH; si++) {
        const pos = geometry.getTrackPosition(ci, si);
        spots.push(
          <circle
            key={`track_${color}_${si}`}
            cx={pos.x}
            cy={pos.y}
            r={7}
            fill="#c9b896"
            stroke="#8b7355"
            strokeWidth={1}
          />
        );
      }

>>>>>>> origin/main
      const homeLine: { x: number; y: number }[] = [];
      for (let hi = 0; hi < HOME_LENGTH; hi++) {
        homeLine.push(geometry.getHomePosition(ci, hi));
      }
      spots.push(
        <polyline
          key={`home_line_${color}`}
          points={homeLine.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={colorStroke[color]}
          strokeWidth={2}
          strokeDasharray="4 3"
          opacity={0.55}
        />
      );
      for (let hi = 0; hi < HOME_LENGTH; hi++) {
        const pos = homeLine[hi];
<<<<<<< HEAD
        if (activePlayerColors.has(color)) {
          spots.push(
            drilledHole(`home_${color}_${hi}`, pos.x, pos.y, 7, { accent: colorStroke[color] })
          );
        }
=======
        spots.push(
          <circle
            key={`home_${color}_${hi}`}
            cx={pos.x}
            cy={pos.y}
            r={8}
            fill="#b8a078"
            stroke={colorStroke[color]}
            strokeWidth={1.5}
          />
        );
>>>>>>> origin/main
      }
    }
    return spots;
  };

<<<<<<< HEAD
  const highlightKeys = new Set(highlightPositions.map(positionKey));

  const renderLegalHighlights = () =>
    highlightPositions.map((pos) => {
      const colorIndex = COLORS_ORDER.indexOf(pos.color);
      if (colorIndex === -1) return null;

      let spot: { x: number; y: number } | null = null;
      switch (pos.type) {
        case 'track':
          spot = geometry.getTrackPosition(COLORS_ORDER.indexOf(pos.color), pos.index);
          break;
        case 'start_gate':
          spot = geometry.getStartGatePosition(COLORS_ORDER.indexOf(pos.color));
          break;
        case 'home':
          spot = geometry.getHomePosition(colorIndex, pos.index);
          break;
        case 'base':
          spot = geometry.getBasePosition(colorIndex, pos.index);
          break;
      }
      if (!spot) return null;

      return (
        <circle
          key={`hl_${positionKey(pos)}`}
          cx={spot.x}
          cy={spot.y}
          r={14}
          className="legal-move-highlight"
          fill="none"
          stroke="#e6b800"
          strokeWidth={2.5}
        />
      );
    });

=======
>>>>>>> origin/main
  const renderMarbles = () =>
    marbles.map((marble) => {
      const pos = getMarblePosition(marble);
      if (!pos) return null;

      const isOwn = marble.color === players.find((p) => p.id === playerId)?.color;
      const isLocked =
        marble.position.type === 'start_gate' && marble.position.color === marble.color;
      const r = marble.position.type === 'base' ? 8 : 10;
      const glow = isOwn && isMyTurn;

      return (
        <g key={marble.id}>
          {glow && (
            <circle
              cx={pos.x}
              cy={pos.y}
              r={r + 5}
              fill="none"
              stroke={colorGlow[marble.color]}
              strokeWidth={2}
              className="marble-glow"
              opacity={0.85}
            />
          )}
<<<<<<< HEAD
          <ellipse cx={pos.x + 1.5} cy={pos.y + 2.5} rx={r} ry={r * 0.9} fill="#000" opacity={0.4} />
=======
          <circle cx={pos.x} cy={pos.y} r={r + 2} fill="black" opacity={0.25} />
>>>>>>> origin/main
          <circle
            cx={pos.x}
            cy={pos.y}
            r={r}
            fill={colorMap[marble.color]}
            stroke={isLocked ? '#ffd633' : colorStroke[marble.color]}
            strokeWidth={isLocked ? 3 : isOwn ? 2.5 : 1.5}
<<<<<<< HEAD
            filter="url(#marbleShadow)"
=======
>>>>>>> origin/main
          />
          <circle cx={pos.x - r * 0.3} cy={pos.y - r * 0.3} r={r * 0.25} fill="#fff" opacity={0.35} />
          {marble.isFinished && (
            <text
              x={pos.x}
              y={pos.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fill={marble.color === 'white' ? '#333' : '#fff'}
              fontWeight="bold"
            >
              ✓
            </text>
          )}
        </g>
      );
    });

  const renderColorWedges = () =>
    COLORS_ORDER.map((color, ci) => {
      const startAngle = ((ci * (TRACK_LENGTH + 1)) / TOTAL_OUTER_SPOTS) * Math.PI * 2 - Math.PI / 2;
      const sweep = ((TRACK_LENGTH + 1) / TOTAL_OUTER_SPOTS) * Math.PI * 2;
      const endAngle = startAngle + sweep;
      const r0 = outerRadius - 12;
      const r1 = outerRadius + 36;
      const x1 = center + r0 * Math.cos(startAngle);
      const y1 = center + r0 * Math.sin(startAngle);
      const x2 = center + r1 * Math.cos(startAngle);
      const y2 = center + r1 * Math.sin(startAngle);
      const x3 = center + r1 * Math.cos(endAngle);
      const y3 = center + r1 * Math.sin(endAngle);
      const x4 = center + r0 * Math.cos(endAngle);
      const y4 = center + r0 * Math.sin(endAngle);
      const active = activePlayerColors.has(color);
      return (
        <path
          key={`wedge_${color}`}
          d={`M ${x1} ${y1} L ${x2} ${y2} A ${r1} ${r1} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${r0} ${r0} 0 0 0 ${x1} ${y1}`}
          fill={colorMap[color]}
          fillOpacity={active ? 0.12 : 0.04}
          stroke="none"
        />
      );
    });

  const outerOct = octagonPoints(center, center, outerRadius + 52);
  const boardOct = octagonPoints(center, center, outerRadius + 38);
  const innerOct = octagonPoints(center, center, outerRadius - 8);

  return (
    <div className="w-full max-w-[min(100vw-1.5rem,42rem)] aspect-square mx-auto board-frame">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full drop-shadow-board board-svg"
        role="img"
        aria-label="Jackaroo game board"
      >
        <defs>
          <linearGradient id="woodBase" x1="0%" y1="0%" x2="100%" y2="100%">
<<<<<<< HEAD
            <stop offset="0%" stopColor="#6b4a28" />
            <stop offset="40%" stopColor="#3d2810" />
=======
            <stop offset="0%" stopColor="#4a3520" />
            <stop offset="45%" stopColor="#2d2010" />
>>>>>>> origin/main
            <stop offset="100%" stopColor="#1a1208" />
          </linearGradient>
          <linearGradient id="woodInner" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#5c3c18" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1a1208" stopOpacity="0.9" />
          </linearGradient>
<<<<<<< HEAD
          <linearGradient id="woodBevel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a67c42" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient id="holeFace" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e8dcc8" />
            <stop offset="55%" stopColor="#b8a078" />
            <stop offset="100%" stopColor="#5c4838" />
          </radialGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4a3520" />
            <stop offset="100%" stopColor="#14100c" />
          </radialGradient>
          <filter id="marbleShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodOpacity="0.55" />
          </filter>
        </defs>

        <polygon points={outerOct} fill="#080604" stroke="#3d2810" strokeWidth={6} />
        <polygon points={boardOct} fill="url(#woodBase)" stroke="#a67c42" strokeWidth={3} />
        <polygon points={boardOct} fill="url(#woodBevel)" stroke="none" opacity={0.5} />
        <polygon points={innerOct} fill="url(#woodInner)" stroke="#5c3c18" strokeWidth={1} opacity={0.92} />
=======
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3d2810" />
            <stop offset="100%" stopColor="#14100c" />
          </radialGradient>
        </defs>

        <polygon points={outerOct} fill="#0a0806" stroke="#4a3018" strokeWidth={5} />
        <polygon points={boardOct} fill="url(#woodBase)" stroke="#8b5a28" strokeWidth={2.5} />
        <polygon points={innerOct} fill="url(#woodInner)" stroke="#5c3c18" strokeWidth={1} opacity={0.9} />
>>>>>>> origin/main

        {renderColorWedges()}
        {renderNestAreas()}
        {renderTrackSpots()}

<<<<<<< HEAD
        <circle cx={center} cy={center} r={48} fill="url(#centerGlow)" stroke="#6b4420" strokeWidth={1.2} />
        <path
          d={`M ${center} ${center - 14} L ${center + 4} ${center - 4} L ${center + 14} ${center} L ${center + 4} ${center + 4} L ${center} ${center + 14} L ${center - 4} ${center + 4} L ${center - 14} ${center} L ${center - 4} ${center - 4} Z`}
          fill="none"
          stroke="#c9a227"
          strokeWidth={1.2}
          opacity={0.45}
        />

        {isMyTurn && highlightKeys.size > 0 && renderLegalHighlights()}
=======
        <circle cx={center} cy={center} r={52} fill="url(#centerGlow)" stroke="#6b4420" strokeWidth={1.5} />
        <circle cx={center} cy={center} r={38} fill="none" stroke="#e6b800" strokeWidth={0.75} opacity={0.35} />

>>>>>>> origin/main
        {renderMarbles()}
      </svg>
    </div>
  );
}
