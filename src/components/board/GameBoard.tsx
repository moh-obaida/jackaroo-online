import React from 'react';
import { GameState, Marble, PlayerColor, COLORS_ORDER, TRACK_LENGTH, HOME_LENGTH, TOTAL_OUTER_SPOTS } from '../../types/game';

interface GameBoardProps {
  gameState: GameState;
  selectedCardId: string | null;
  playerId: string;
}

/**
 * Visual board representation.
 * Uses SVG for the octagonal Jackaroo board layout.
 * 18 track spots per color section + separate start/gate + 4 home spots.
 */
export function GameBoard({ gameState, selectedCardId, playerId }: GameBoardProps) {
  const { marbles, players } = gameState;

  // Board dimensions
  const size = 600;
  const center = size / 2;
  const outerRadius = 260;
  const homeRadius = 120;

  // Color mapping
  const colorMap: Record<PlayerColor, string> = {
    black: '#2a2a2a',
    green: '#2d8a4e',
    blue: '#2563eb',
    white: '#f0ebe0',
  };

  const colorStroke: Record<PlayerColor, string> = {
    black: '#555',
    green: '#4ade80',
    blue: '#60a5fa',
    white: '#d4c8a8',
  };

  // Calculate track positions around the board (octagonal layout)
  const getTrackPosition = (colorIndex: number, trackIndex: number): { x: number; y: number } => {
    // Outer loop has 19 spots per section: start/gate + 18 track spots.
    const sectionSize = TRACK_LENGTH + 1;
    const globalIndex = colorIndex * sectionSize + 1 + trackIndex;
    const angle = (globalIndex / TOTAL_OUTER_SPOTS) * Math.PI * 2 - Math.PI / 2;
    const x = center + outerRadius * Math.cos(angle);
    const y = center + outerRadius * Math.sin(angle);
    return { x, y };
  };

  // Start/gate position (first spot of each color section)
  const getStartGatePosition = (colorIndex: number): { x: number; y: number } => {
    const sectionSize = TRACK_LENGTH + 1;
    const globalIndex = colorIndex * sectionSize;
    const angle = (globalIndex / TOTAL_OUTER_SPOTS) * Math.PI * 2 - Math.PI / 2;
    return {
      x: center + outerRadius * Math.cos(angle),
      y: center + outerRadius * Math.sin(angle),
    };
  };

  // Home positions (toward center)
  const getHomePosition = (colorIndex: number, homeIndex: number): { x: number; y: number } => {
    const angle = ((colorIndex * (TRACK_LENGTH + 1)) / TOTAL_OUTER_SPOTS) * Math.PI * 2 - Math.PI / 2;
    const radius = homeRadius + (HOME_LENGTH - homeIndex - 1) * 25;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  };

  // Base positions (outside the board)
  const getBasePosition = (colorIndex: number, baseIndex: number): { x: number; y: number } => {
    const angle = ((colorIndex * (TRACK_LENGTH + 1)) / TOTAL_OUTER_SPOTS) * Math.PI * 2 - Math.PI / 2;
    const radius = outerRadius + 30 + baseIndex * 18;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  };

  // Get marble position on SVG
  const getMarblePosition = (marble: Marble): { x: number; y: number } | null => {
    const colorIndex = COLORS_ORDER.indexOf(marble.color);
    if (colorIndex === -1) return null;

    switch (marble.position.type) {
      case 'track': {
        return getTrackPosition(
          COLORS_ORDER.indexOf(marble.position.color),
          marble.position.index
        );
      }
      case 'start_gate': {
        return getStartGatePosition(COLORS_ORDER.indexOf(marble.position.color));
      }
      case 'home': {
        return getHomePosition(colorIndex, marble.position.index);
      }
      case 'base': {
        return getBasePosition(colorIndex, marble.position.index);
      }
    }
  };

  // Render track spots
  const renderTrackSpots = () => {
    const spots: JSX.Element[] = [];
    for (let ci = 0; ci < 4; ci++) {
      const color = COLORS_ORDER[ci];
      // Start/gate spot
      const sgPos = getStartGatePosition(ci);
      spots.push(
        <circle
          key={`sg_${color}`}
          cx={sgPos.x}
          cy={sgPos.y}
          r={8}
          fill="none"
          stroke={colorStroke[color]}
          strokeWidth={2.5}
          opacity={0.8}
        />
      );

      // Track spots (18 normal spots per section)
      for (let si = 0; si < TRACK_LENGTH; si++) {
        const pos = getTrackPosition(ci, si);
        spots.push(
          <circle
            key={`track_${color}_${si}`}
            cx={pos.x}
            cy={pos.y}
            r={6}
            fill="none"
            stroke="#5c3c18"
            strokeWidth={1}
            opacity={0.5}
          />
        );
      }

      // Home spots
      for (let hi = 0; hi < HOME_LENGTH; hi++) {
        const pos = getHomePosition(ci, hi);
        spots.push(
          <circle
            key={`home_${color}_${hi}`}
            cx={pos.x}
            cy={pos.y}
            r={7}
            fill="none"
            stroke={colorStroke[color]}
            strokeWidth={1.5}
            strokeDasharray="3,2"
            opacity={0.6}
          />
        );
      }
    }
    return spots;
  };

  // Render marbles
  const renderMarbles = () => {
    return marbles.map((marble) => {
      const pos = getMarblePosition(marble);
      if (!pos) return null;

      const isOwn = marble.color === players.find((p) => p.id === playerId)?.color;
      const isLocked = marble.position.type === 'start_gate' && marble.position.color === marble.color;

      return (
        <g key={marble.id}>
          <circle
            cx={pos.x}
            cy={pos.y}
            r={marble.position.type === 'base' ? 7 : 9}
            fill={colorMap[marble.color]}
            stroke={isLocked ? '#ffd633' : colorStroke[marble.color]}
            strokeWidth={isLocked ? 3 : isOwn ? 2 : 1.5}
            className={isOwn ? 'drop-shadow-lg' : ''}
          />
          {marble.isFinished && (
            <text
              x={pos.x}
              y={pos.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fill={marble.color === 'white' ? '#333' : '#fff'}
            >
              ✓
            </text>
          )}
          {isLocked && (
            <circle
              cx={pos.x}
              cy={pos.y}
              r={11}
              fill="none"
              stroke="#ffd633"
              strokeWidth={1}
              strokeDasharray="2,2"
              opacity={0.6}
            />
          )}
        </g>
      );
    });
  };

  // Render player labels
  const renderPlayerLabels = () => {
    return players.map((player, i) => {
      const colorIndex = COLORS_ORDER.indexOf(player.color);
      const angle = ((colorIndex * (TRACK_LENGTH + 1)) / TOTAL_OUTER_SPOTS) * Math.PI * 2 - Math.PI / 2;
      const labelRadius = outerRadius + 70;
      const x = center + labelRadius * Math.cos(angle);
      const y = center + labelRadius * Math.sin(angle);
      const isCurrentTurn = gameState.currentTurnPlayerId === player.id;

      return (
        <text
          key={player.id}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fill={isCurrentTurn ? '#ffd633' : '#a0a0a0'}
          fontWeight={isCurrentTurn ? 'bold' : 'normal'}
        >
          {player.name}
          {player.isBot && ' 🤖'}
        </text>
      );
    });
  };

  return (
    <div className="w-full max-w-[600px] aspect-square relative">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
      >
        {/* Board background */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius + 50}
          fill="#2a1a0a"
          stroke="#5c3c18"
          strokeWidth={3}
        />
        <circle
          cx={center}
          cy={center}
          r={outerRadius + 48}
          fill="none"
          stroke="#3d2810"
          strokeWidth={1}
        />

        {/* Center decoration */}
        <circle
          cx={center}
          cy={center}
          r={50}
          fill="#1a1208"
          stroke="#5c3c18"
          strokeWidth={1.5}
        />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fill="#e6b800"
          fontWeight="bold"
        >
          JAKAROO
        </text>

        {/* Track spots */}
        {renderTrackSpots()}

        {/* Marbles */}
        {renderMarbles()}

        {/* Player labels */}
        {renderPlayerLabels()}
      </svg>
    </div>
  );
}
