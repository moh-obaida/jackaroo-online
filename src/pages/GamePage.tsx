import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { GameBoard } from '../components/board/GameBoard';
import { PlayerHand } from '../components/cards/PlayerHand';
import { ActionPanel } from '../components/game/ActionPanel';
import { EventLog } from '../components/game/EventLog';
import { WinOverlay } from '../components/game/WinOverlay';
import { GameStatusCard } from '../components/game/GameStatusCard';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { subscribeToRoom } from '../lib/firebase/rooms';
import { RoomData } from '../types/game';

function GamePageContent() {
  const { t, user, authLoading, firebaseReady } = useApp();
  const {
    room,
    gameState,
    myHand,
    legalActions,
    setRoomCode,
    submitAction,
    error: gameError,
  } = useGame();
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [localRoom, setLocalRoom] = useState<RoomData | null>(null);
  const [roomLoaded, setRoomLoaded] = useState(false);
  const [handLoaded, setHandLoaded] = useState(false);
  const [handError, setHandError] = useState<string | null>(null);

  const playerId = user?.uid || null;

  // Always bind room code from URL (direct /game/:code navigation).
  // Bind room code from URL (direct /game/:code navigation and lobby redirect).
  useEffect(() => {
    if (code) setRoomCode(code);
  }, [code, setRoomCode]);

  useEffect(() => {
    if (!code || !firebaseReady) {
      setRoomLoaded(true);
      return;
    }
    const unsub = subscribeToRoom(code, (roomData) => {
      setLocalRoom(roomData);
      setRoomLoaded(true);
    });
    return unsub;
  }, [code, firebaseReady]);

  useEffect(() => {
    if (myHand.length > 0 || gameState) {
      setHandLoaded(true);
      setHandError(null);
    }
  }, [myHand, gameState]);

  useEffect(() => {
    if (!gameState || !playerId) return;
    const timer = window.setTimeout(() => {
      if (myHand.length === 0 && gameState.handCounts[playerId] > 0) {
        setHandError('Failed to load your private hand. Check Firebase rules for privateHands.');
      }
      setHandLoaded(true);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [gameState, playerId, myHand.length]);

  const currentRoom = room || localRoom;
  const isMember = playerId && currentRoom?.players[playerId];
  const isMyTurn = Boolean(gameState && playerId && gameState.currentTurnPlayerId === playerId);

  const currentPlayer = useMemo(() => {
    if (!gameState || !playerId) return null;
    return gameState.players.find((p) => p.id === playerId) ?? null;
  }, [gameState, playerId]);

  const turnPlayer = useMemo(() => {
    if (!gameState) return null;
    return gameState.players.find((p) => p.id === gameState.currentTurnPlayerId) ?? null;
  }, [gameState]);

  if (authLoading) {
    return <GameStatusCard title="Loading session…" message="Restoring your player identity." />;
  }

  if (!firebaseReady) {
    return (
      <GameStatusCard
        title="Firebase not configured"
        message="Add VITE_FIREBASE_* environment variables to run multiplayer."
        variant="error"
      />
    );
  }

  if (!user || !playerId) {
    return (
      <GameStatusCard
        title="Sign in required"
        message="You need a guest or account session to play."
        action={
          <Link to="/auth" className="btn-primary inline-block">
            Continue as guest
          </Link>
        }
      />
    );
  }

  if (!code) {
    return (
      <GameStatusCard
        title="Invalid game link"
        message="No room code was found in the URL."
        action={
          <Link to="/" className="btn-primary inline-block">
            Back home
          </Link>
        }
      />
    );
  }

  if (!roomLoaded) {
    return <GameStatusCard title="Loading room…" message={`Connecting to room ${code}.`} />;
  }

  if (!currentRoom) {
    return (
      <GameStatusCard
        title="Room not found"
        message={`No room exists for code ${code}, or it has expired.`}
        variant="warn"
        action={
          <Link to="/" className="btn-primary inline-block">
            Back home
          </Link>
        }
      />
    );
  }

  if (!isMember) {
    return (
      <GameStatusCard
        title="You are not in this room"
        message="This account is not seated in the room. Join from the lobby with the room password."
        variant="warn"
        action={
          <Link to={`/join`} className="btn-primary inline-block">
            Join a room
          </Link>
        }
      />
    );
  }

  if (currentRoom.status === 'lobby') {
    return (
      <GameStatusCard
        title="Game not started"
        message="The room is still in the lobby. Return to ready up and start the match."
        action={
          <Link to={`/lobby/${code}`} className="btn-primary inline-block">
            Go to lobby
          </Link>
        }
      />
    );
  }

  if (!gameState) {
    return (
      <GameStatusCard
        title="Waiting for game state…"
        message="The match is marked as playing but board data has not arrived yet."
        action={
          <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>
            Reload
          </button>
        }
      />
    );
  }

  if (handError) {
    return (
      <GameStatusCard
        title="Private hand error"
        message={handError}
        variant="error"
        action={
          <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        }
      />
    );
  }

  if (!handLoaded && (gameState.handCounts[playerId] || 0) > 0) {
    return <GameStatusCard title="Loading your cards…" message="Fetching your private hand securely." />;
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto w-full min-h-[60vh]">
      {gameState.winner && <WinOverlay gameState={gameState} />}

      <div className="flex-1 flex flex-col items-center min-w-0">
        <div className="mb-4 text-center w-full">
          {isMyTurn ? (
            <div className="text-lg font-bold text-gold-400">{t('game.yourTurn')}</div>
          ) : (
            <div className="text-sm text-gray-400">
              {t('game.waiting')} {turnPlayer?.name || '…'}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            {currentPlayer?.name} · {currentPlayer?.color} · {t('game.dealRound')}{' '}
            {gameState.dealState.dealRoundInBlock + 1}
          </div>
          {gameError && (
            <p className="text-xs text-red-300 mt-2 bg-red-950/50 rounded px-2 py-1 inline-block">
              {gameError}
            </p>
          )}
        </div>

        <GameBoard
          gameState={gameState}
          selectedCardId={selectedCardId}
          playerId={playerId}
        />
      </div>

      <div className="lg:w-80 w-full flex flex-col gap-4 shrink-0">
        <div className="card-container">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">{t('game.hand')}</h3>
          <PlayerHand
            cards={myHand}
            selectedCardId={selectedCardId}
            onSelectCard={setSelectedCardId}
            disabled={!isMyTurn}
          />
          {myHand.length === 0 && (
            <p className="text-xs text-gray-500 mt-2">No cards in hand this round.</p>
          )}
        </div>

        {isMyTurn ? (
          legalActions.length > 0 ? (
            <ActionPanel
              legalActions={legalActions}
              selectedCardId={selectedCardId}
              onSubmitAction={submitAction}
              playerId={playerId}
            />
          ) : (
            <div className="card-container">
              <p className="text-sm text-gray-400">No legal moves available for your cards.</p>
            </div>
          )
        ) : (
          <div className="card-container">
            <p className="text-sm text-gray-400">Wait for your turn to play a card.</p>
          </div>
        )}

        <EventLog events={gameState.eventLog || []} />

        <button
          type="button"
          className="text-sm text-gray-500 hover:text-gray-300"
          onClick={() => navigate(`/lobby/${code}`)}
        >
          ← Back to lobby info
        </button>
      </div>
    </div>
  );
}

export function GamePage() {
  return (
    <ErrorBoundary title="Game screen crashed">
      <GamePageContent />
    </ErrorBoundary>
  );
}
