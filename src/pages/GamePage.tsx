<<<<<<< HEAD
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { useRoomRouteState } from '../hooks/useRoomRouteState';
import { isTerminalRouteState } from '../lib/room/routeState';
import { RoomRouteFallback } from '../components/game/RoomRouteFallback';
import { FullScreenGameTable } from '../components/game/table/FullScreenGameTable';
=======
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { GameBoard } from '../components/board/GameBoard';
import { PlayerHand } from '../components/cards/PlayerHand';
import { CardGuideModal } from '../components/cards/CardGuideModal';
import { ActionPanel } from '../components/game/ActionPanel';
import { GameSidePanel } from '../components/game/GameSidePanel';
import { OpponentStrip } from '../components/game/OpponentStrip';
import { WinOverlay } from '../components/game/WinOverlay';
import { GameStatusCard } from '../components/game/GameStatusCard';
import { BackHomeButton } from '../components/common/BackHomeButton';
>>>>>>> origin/main
import { ErrorBoundary } from '../components/common/ErrorBoundary';

function normalizeRoomCode(raw: string | undefined): string | null {
  const code = raw?.trim();
  return code && code.length > 0 ? code : null;
}

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
<<<<<<< HEAD
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
=======
    isLeaving,
    leaveWarning,
    safeLeaveRoom,
  } = useGame();

  const { code: rawCode } = useParams<{ code: string }>();
  const roomCode = normalizeRoomCode(rawCode);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [localRoom, setLocalRoom] = useState<RoomData | null>(null);
  const [roomLoaded, setRoomLoaded] = useState(false);
  const [handLoaded, setHandLoaded] = useState(false);
  const [handError, setHandError] = useState<string | null>(null);
  const [deckGuideOpen, setDeckGuideOpen] = useState(false);
  const [leaveBusy, setLeaveBusy] = useState(false);

  const playerId = user?.uid?.trim() || null;

  useEffect(() => {
    if (isLeaving || !roomCode) return;
    setRoomCode(roomCode);
  }, [roomCode, isLeaving, setRoomCode]);

  useEffect(() => {
    if (isLeaving || !roomCode || !firebaseReady) {
      if (!roomCode) setRoomLoaded(true);
      return;
    }
    setRoomLoaded(false);
    const unsub = subscribeToRoom(roomCode, (roomData) => {
      setLocalRoom(roomData);
      setRoomLoaded(true);
    });
    return unsub;
  }, [roomCode, firebaseReady, isLeaving]);

  useEffect(() => {
    if (myHand.length > 0 || gameState) {
      setHandLoaded(true);
      setHandError(null);
    }
  }, [myHand, gameState]);

  useEffect(() => {
    if (!gameState || !playerId) return;
    const timer = window.setTimeout(() => {
      if (myHand.length === 0 && (gameState.handCounts[playerId] ?? 0) > 0) {
        setHandError('Failed to load your private hand. Check Firebase rules for privateHands.');
      }
      setHandLoaded(true);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [gameState, playerId, myHand.length]);

  const handleLeaveGame = useCallback(async () => {
    if (!roomCode || leaveBusy || isLeaving) return;
    setLeaveBusy(true);
    try {
      await safeLeaveRoom(roomCode);
    } finally {
      setLeaveBusy(false);
    }
  }, [roomCode, leaveBusy, isLeaving, safeLeaveRoom]);

  const currentRoom = room || localRoom;
  const isMember = Boolean(playerId && currentRoom?.players?.[playerId]);

  const isMyTurn = Boolean(gameState && playerId && gameState.currentTurnPlayerId === playerId);

  const currentPlayer = useMemo(() => {
    if (!gameState || !playerId) return null;
    return gameState.players.find((p) => p.id === playerId) ?? null;
  }, [gameState, playerId]);

  const turnPlayer = useMemo(() => {
    if (!gameState) return null;
    return gameState.players.find((p) => p.id === gameState.currentTurnPlayerId) ?? null;
  }, [gameState]);

  if (isLeaving || leaveBusy) {
    return (
      <GameStatusCard
        title={t('game.leaving')}
        message={t('game.leavingMessage')}
      />
    );
  }

  if (authLoading) {
    return <GameStatusCard title={t('game.loadingSession')} message={t('game.loadingSessionMessage')} />;
  }

  if (!firebaseReady) {
    return (
      <GameStatusCard
        title={t('game.firebaseMissing')}
        message={t('game.firebaseMissingMessage')}
        variant="error"
        action={<BackHomeButton />}
>>>>>>> origin/main
      />
    );
  }

<<<<<<< HEAD
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
=======
  if (!user || !playerId) {
    return (
      <GameStatusCard
        title={t('game.signInRequired')}
        message={t('game.signInRequiredMessage')}
        action={<BackHomeButton />}
      />
    );
  }

  if (!roomCode) {
    return (
      <GameStatusCard
        title={t('game.invalidLink')}
        message={t('game.invalidLinkMessage')}
        action={<BackHomeButton />}
      />
    );
  }

  if (!roomLoaded) {
    return (
      <GameStatusCard
        title={t('game.loadingRoom')}
        message={t('game.loadingRoomMessage', { code: roomCode })}
      />
    );
  }

  if (!currentRoom) {
    return (
      <GameStatusCard
        title={t('game.roomNotFound')}
        message={t('game.roomNotFoundMessage', { code: roomCode })}
        variant="warn"
        action={<BackHomeButton />}
      />
    );
  }

  if (!isMember) {
    return (
      <GameStatusCard
        title={t('game.notInRoom')}
        message={t('game.notInRoomMessage')}
        variant="warn"
        action={<BackHomeButton />}
      />
    );
  }

  if (currentRoom.status === 'lobby') {
    return (
      <GameStatusCard
        title={t('game.notStarted')}
        message={t('game.notStartedMessage')}
        action={<BackHomeButton />}
      />
    );
  }

  if (!gameState) {
    return (
      <GameStatusCard
        title={t('game.waitingState')}
        message={t('game.waitingStateMessage')}
        action={
          <div className="flex flex-col gap-2 w-full">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => window.location.reload()}
            >
              {t('game.reload')}
            </button>
            <BackHomeButton className="w-full" />
          </div>
        }
      />
    );
  }

  if (handError) {
    return (
      <GameStatusCard
        title={t('game.handError')}
        message={handError}
        variant="error"
        action={
          <div className="flex flex-col gap-2 w-full">
            <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
              {t('game.reload')}
            </button>
            <BackHomeButton className="w-full" />
          </div>
        }
      />
    );
  }

  if (!handLoaded && (gameState.handCounts[playerId] ?? 0) > 0) {
    return <GameStatusCard title={t('game.loadingHand')} message={t('game.loadingHandMessage')} />;
  }

  return (
    <div className="game-table-root flex flex-col min-h-[calc(100dvh-3rem)] lg:min-h-[calc(100dvh-3.5rem)]">
      {gameState.winner && <WinOverlay gameState={gameState} />}

      <header className="game-table-bar flex items-center justify-between gap-2 px-3 py-2 border-b border-wood-800/80 bg-black/50 backdrop-blur-md shrink-0">
        <div className="min-w-0 flex-1">
          {isMyTurn ? (
            <p className="text-sm font-bold text-gold-300 turn-pulse inline-block">{t('game.yourTurn')}</p>
          ) : (
            <p className="text-xs text-cream-200/70 truncate">
              {t('game.waiting')} <span className="text-cream-100">{turnPlayer?.name || '…'}</span>
            </p>
          )}
          <p className="text-[10px] text-cream-200/40 tabular-nums mt-0.5">
            {roomCode} · {t('game.dealRound')} {gameState.dealState.dealRoundInBlock + 1}
          </p>
        </div>
        <button
          type="button"
          className="btn-danger text-xs px-3 py-1.5 shrink-0"
          onClick={handleLeaveGame}
          disabled={leaveBusy}
        >
          {t('game.leaveGame')}
        </button>
      </header>

      {(gameError || leaveWarning) && (
        <p className="text-xs text-amber-200/90 bg-amber-950/40 px-3 py-1.5 text-center shrink-0">
          {gameError || leaveWarning}
        </p>
      )}

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 min-w-0 p-2 sm:p-3">
          <div className="shrink-0 min-h-[2.5rem] flex items-center justify-center mb-1">
            {playerId && <OpponentStrip gameState={gameState} myPlayerId={playerId} slot="top" />}
          </div>

          <div className="flex-1 grid grid-cols-[minmax(0,3rem)_1fr_minmax(0,3rem)] sm:grid-cols-[4.5rem_1fr_4.5rem] gap-1 min-h-0 items-center">
            <div className="hidden sm:flex justify-center">
              {playerId && <OpponentStrip gameState={gameState} myPlayerId={playerId} slot="left" />}
            </div>

            <div className="board-stage flex items-center justify-center min-h-0 min-w-0">
              <GameBoard
                gameState={gameState}
                selectedCardId={selectedCardId}
                playerId={playerId}
                isMyTurn={isMyTurn}
              />
            </div>

            <div className="hidden sm:flex justify-center">
              {playerId && <OpponentStrip gameState={gameState} myPlayerId={playerId} slot="right" />}
            </div>
          </div>

          <div className="hand-dock shrink-0 mt-2 pt-2 border-t border-wood-800/60 bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-[10px] uppercase tracking-wider text-cream-200/45 mb-1.5 text-center sm:text-start px-1">
              {currentPlayer?.name} · {t('game.hand')}
            </p>
            <PlayerHand
              cards={myHand}
              selectedCardId={selectedCardId}
              onSelectCard={setSelectedCardId}
              disabled={!isMyTurn}
              docked
            />
            <div className="mt-2 max-h-[40vh] overflow-y-auto">
              {isMyTurn ? (
                <ActionPanel
                  legalActions={legalActions}
                  selectedCardId={selectedCardId}
                  onSubmitAction={submitAction}
                  playerId={playerId}
                />
              ) : (
                <p className="text-xs text-cream-200/50 text-center py-2">{t('game.waitTurn')}</p>
              )}
            </div>
          </div>
        </div>

        <aside className="lg:border-s border-wood-800/50 p-2 lg:p-3 lg:overflow-y-auto shrink-0">
          <GameSidePanel gameState={gameState} onShowDeckGuide={() => setDeckGuideOpen(true)} />
        </aside>
      </div>

      <CardGuideModal open={deckGuideOpen} onClose={() => setDeckGuideOpen(false)} />
    </div>
>>>>>>> origin/main
  );
}

export function GamePage() {
  return (
    <ErrorBoundary title="Game screen crashed">
      <GamePageContent />
    </ErrorBoundary>
  );
}
