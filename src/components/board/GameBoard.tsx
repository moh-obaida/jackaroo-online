import React, { useMemo } from 'react';
import {
  GameState,
  Marble,
  PlayerColor,
  COLORS_ORDER,
  TRACK_LENGTH,
  HOME_LENGTH,
  TOTAL_OUTER_SPOTS,
} from '../../types/game';

interface GameBoardProps {
  gameState: GameState;
  selectedCardId: string | null;
  playerId: string;
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

function octagonPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

export function GameBoard({ gameState, selectedCardId: _selectedCardId, playerId }: GameBoardProps) {
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
          })}
        </g>
      );
    });

  const renderTrackSpots = () => {
    const spots: JSX.Element[] = [];
    for (let ci = 0; ci < 4; ci++) {
      const color = COLORS_ORDER[ci];
      if (!activePlayerColors.has(color)) continue;

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
      }
    }
    return spots;
  };

  const renderMarbles = () =>
    marbles.map((marble) => {
      const pos = getMarblePosition(marble);
      if (!pos) return null;

      const isOwn = marble.color === players.find((p) => p.id === playerId)?.color;
      const isLocked =
        marble.position.type === 'start_gate' && marble.position.color === marble.color;
      const r = marble.position.type === 'base' ? 8 : 10;

      return (
        <g key={marble.id}>
          <circle cx={pos.x} cy={pos.y} r={r + 2} fill="black" opacity={0.25} />
          <circle
            cx={pos.x}
            cy={pos.y}
            r={r}
            fill={colorMap[marble.color]}
            stroke={isLocked ? '#ffd633' : colorStroke[marble.color]}
            strokeWidth={isLocked ? 3 : isOwn ? 2.5 : 1.5}
          />
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

  const renderPlayerLabels = () =>
    players.map((player) => {
      const colorIndex = COLORS_ORDER.indexOf(player.color);
      const angle =
        ((colorIndex * (TRACK_LENGTH + 1)) / TOTAL_OUTER_SPOTS) * Math.PI * 2 - Math.PI / 2;
      const labelRadius = outerRadius + 88;
      const x = center + labelRadius * Math.cos(angle);
      const y = center + labelRadius * Math.sin(angle);
      const isCurrentTurn = gameState.currentTurnPlayerId === player.id;
      const cardCount = gameState.handCounts[player.id] ?? 0;

      return (
        <g key={player.id}>
          <text
            x={x}
            y={y - 6}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fill={isCurrentTurn ? '#ffd633' : '#c9b896'}
            fontWeight={isCurrentTurn ? 'bold' : 'normal'}
          >
            {player.name}
          </text>
          <text x={x} y={y + 8} textAnchor="middle" fontSize="10" fill="#8a7a68">
            {cardCount} cards
          </text>
        </g>
      );
    });

  const outerOct = octagonPoints(center, center, outerRadius + 52);
  const boardOct = octagonPoints(center, center, outerRadius + 38);
  const innerOct = octagonPoints(center, center, outerRadius - 8);

  return (
    <div className="w-full max-w-[min(100%,640px)] aspect-square mx-auto">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full drop-shadow-board"
        role="img"
        aria-label="Jackaroo game board"
      >
        <defs>
          <linearGradient id="woodBase" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a3520" />
            <stop offset="45%" stopColor="#2d2010" />
            <stop offset="100%" stopColor="#1a1208" />
          </linearGradient>
          <linearGradient id="woodInner" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#5c3c18" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1a1208" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3d2810" />
            <stop offset="100%" stopColor="#14100c" />
          </radialGradient>
        </defs>

        <polygon points={outerOct} fill="#0f0c09" stroke="#5c3c18" strokeWidth={4} />
        <polygon points={boardOct} fill="url(#woodBase)" stroke="#7d5220" strokeWidth={2} />
        <polygon points={innerOct} fill="url(#woodInner)" stroke="#5c3c18" strokeWidth={1} opacity={0.85} />

        {renderNestAreas()}
        {renderTrackSpots()}

        <circle cx={center} cy={center} r={58} fill="url(#centerGlow)" stroke="#5c3c18" strokeWidth={1.5} />
        <text
          x={center}
          y={center - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="15"
          fill="#e6b800"
          fontWeight="bold"
          letterSpacing="3"
        >
          JAKAROO
        </text>
        <text x={center} y={center + 14} textAnchor="middle" fontSize="9" fill="#8a7a68">
          ONLINE
        </text>

        {renderMarbles()}
        {renderPlayerLabels()}
      </svg>
    </div>
  );
}
