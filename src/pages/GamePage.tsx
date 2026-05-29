import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { useRoomRouteState } from '../hooks/useRoomRouteState';
import { getAuthUserOrCurrent } from '../lib/firebase/auth';
import { RoomRouteFallback } from '../components/game/RoomRouteFallback';
import { RoomRouteViewport } from '../components/game/RoomRouteViewport';
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
    legalMovesReady,
    isSubmittingAction,
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

  const reload = useCallback(() => window.location.reload(), []);

  if (!roomCode) {
    return (
      <RoomRouteViewport variant="game">
        <RoomRouteFallback state={{ kind: 'invalid_code' }} roomCode={null} onReload={reload} />
      </RoomRouteViewport>
    );
  }

  if (routeState.kind !== 'ready_play') {
    return (
      <RoomRouteViewport variant="game">
        <RoomRouteFallback state={routeState} roomCode={roomCode} onReload={reload} />
      </RoomRouteViewport>
    );
  }

  const playerId =
    (user ?? getAuthUserOrCurrent())?.uid?.trim() || myPlayer?.id?.trim() || null;

  if (!gameState || !playerId) {
    return (
      <RoomRouteViewport variant="game">
        <RoomRouteFallback
          state={{ kind: 'waiting_game_state' }}
          roomCode={roomCode}
          onReload={reload}
        />
      </RoomRouteViewport>
    );
  }

  return (
    <RoomRouteViewport variant="game">
      <FullScreenGameTable
        roomCode={roomCode}
        gameState={gameState}
        playerId={playerId}
        myHand={myHand}
        legalActions={legalActions}
        legalMovesReady={legalMovesReady}
        isMyTurn={isMyTurn}
        isSubmittingAction={isSubmittingAction}
        onSubmitAction={submitAction}
        onLeave={handleLeaveGame}
        leaveBusy={leaveBusy}
        gameError={gameError}
        leaveWarning={leaveWarning}
      />
    </RoomRouteViewport>
  );
}

export function GamePage() {
  return (
    <ErrorBoundary title="Game screen crashed">
      <GamePageContent />
    </ErrorBoundary>
  );
}
