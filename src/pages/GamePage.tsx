import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { useRoomRouteState } from '../hooks/useRoomRouteState';
import { isTerminalRouteState } from '../lib/room/routeState';
import { RoomRouteFallback } from '../components/game/RoomRouteFallback';
import { FullScreenGameTable } from '../components/game/table/FullScreenGameTable';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

function normalizeRoomCode(raw: string | undefined): string | null {
  const code = raw?.trim();
  return code && code.length > 0 ? code : null;
}

function GamePageContent() {
  const { user } = useApp();
  const {
    bindRoomFromRoute,
    gameState,
    myHand,
    legalActions,
    isMyTurn,
    myPlayer,
    submitAction,
    error: gameError,
    leaveWarning,
    safeLeaveRoom,
  } = useGame();

  const { code: rawCode } = useParams<{ code: string }>();
  const roomCode = normalizeRoomCode(rawCode);
  const routeState = useRoomRouteState('game', roomCode);

  const [leaveBusy, setLeaveBusy] = useState(false);

  useEffect(() => {
    if (!roomCode) return;
    bindRoomFromRoute(roomCode);
  }, [roomCode, bindRoomFromRoute]);

  const handleLeaveGame = useCallback(async () => {
    if (!roomCode || leaveBusy) return;
    setLeaveBusy(true);
    try {
      await safeLeaveRoom(roomCode);
    } finally {
      setLeaveBusy(false);
    }
  }, [roomCode, leaveBusy, safeLeaveRoom]);

  if (isTerminalRouteState(routeState)) {
    return (
      <RoomRouteFallback
        state={routeState}
        roomCode={roomCode}
        onReload={() => window.location.reload()}
      />
    );
  }

  const playerId = user?.uid?.trim() || myPlayer?.id || null;
  if (!gameState || !roomCode || !playerId) {
    return <RoomRouteFallback state={{ kind: 'waiting_game_state' }} roomCode={roomCode} />;
  }

  return (
    <FullScreenGameTable
      roomCode={roomCode}
      gameState={gameState}
      playerId={playerId}
      myHand={myHand}
      legalActions={legalActions}
      isMyTurn={isMyTurn}
      onSubmitAction={submitAction}
      onLeave={handleLeaveGame}
      leaveBusy={leaveBusy}
      gameError={gameError}
      leaveWarning={leaveWarning}
    />
  );
}

export function GamePage() {
  return (
    <ErrorBoundary title="Game screen crashed">
      <GamePageContent />
    </ErrorBoundary>
  );
}
