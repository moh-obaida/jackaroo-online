import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import {
  setPlayerReady,
  kickPlayer,
  leaveRoom,
  addBots,
  subscribeToRoom,
} from '../lib/firebase/rooms';
import { getMaxPlayersForMode } from '../lib/game/normalize';
import { RoomData } from '../types/game';
import { GameStatusCard } from '../components/game/GameStatusCard';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

function LobbyPageContent() {
  const { t, user } = useApp();
  const { room, setRoomCode, startGame, loading, error: gameError } = useGame();
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [localRoom, setLocalRoom] = useState<RoomData | null>(null);
  const [roomLoaded, setRoomLoaded] = useState(false);
  const [leftRoom, setLeftRoom] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      setRoomCode(code);
    }
  }, [code, setRoomCode]);

  useEffect(() => {
    if (!code) return;
    setRoomLoaded(false);
    const unsub = subscribeToRoom(code, (roomData) => {
      setLocalRoom(roomData);
      setRoomLoaded(true);
      if (roomData?.status === 'playing') {
        navigate(`/game/${code}`);
      }
    });
    return unsub;
  }, [code, navigate]);

  const currentRoom = room || localRoom;
  const playerId = user?.uid;
  const isRoomMaker = currentRoom?.roomMakerUid === playerId;
  const players = currentRoom ? Object.values(currentRoom.players) : [];
  const maxPlayers = getMaxPlayersForMode(currentRoom?.mode);
  const seatedCount = players.length;

  const startReadiness = useMemo(() => {
    const humans = players.filter((p) => !p.isBot);
    const allSeatsFilled = seatedCount >= maxPlayers;
    const allHumansReady = humans.length > 0 && humans.every((p) => p.ready);
    const canStart = allSeatsFilled && allHumansReady;

    let reason: string | null = null;
    if (seatedCount < maxPlayers) {
      const need = maxPlayers - seatedCount;
      reason = `Need ${need} more player${need === 1 ? '' : 's'} (${seatedCount}/${maxPlayers} seats).`;
    } else if (!allHumansReady) {
      const waiting = humans.filter((p) => !p.ready).map((p) => p.name);
      reason = `Waiting for: ${waiting.join(', ')}`;
    }

    return { canStart, reason, allSeatsFilled, allHumansReady };
  }, [players, seatedCount, maxPlayers]);

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReady = async () => {
    if (!code || !playerId) return;
    const myPlayer = players.find((p) => p.id === playerId);
    await setPlayerReady(code, playerId, !myPlayer?.ready);
  };

  const handleKick = async (playerUid: string) => {
    if (!code) return;
    await kickPlayer(code, playerUid);
  };

  const handleLeave = async () => {
    if (!code || !playerId) return;
    setLeaveError(null);
    try {
      await leaveRoom(code, playerId);
      setLeftRoom(true);
      setRoomCode(null);
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('leaveRoom failed:', err);
      setLeaveError(err?.message || 'Failed to leave room safely.');
    }
  };

  const handleAddBot = async () => {
    if (!code || !currentRoom) return;
    await addBots(code, 1, currentRoom.botSettings.difficulty, currentRoom.mode);
  };

  const handleStart = async () => {
    if (!startReadiness.canStart) return;
    await startGame();
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'black':
        return 'bg-gray-800 border-gray-600';
      case 'green':
        return 'bg-green-800 border-green-600';
      case 'blue':
        return 'bg-blue-800 border-blue-600';
      case 'white':
        return 'bg-gray-100 border-gray-300 text-gray-900';
      default:
        return 'bg-gray-700 border-gray-500';
    }
  };

  if (!roomLoaded) {
    return (
      <GameStatusCard title="Loading room…" message={`Connecting to room ${code || ''}.`} />
    );
  }

  if (leftRoom) {
    return (
      <GameStatusCard
        title="You left the room"
        message="You have exited the lobby safely."
        action={
          <Link to="/" className="btn-primary inline-block">
            Back home
          </Link>
        }
      />
    );
  }

  if (!currentRoom) {
    return (
      <GameStatusCard
        title="Room not found"
        message="This room no longer exists or has already been closed."
        variant="warn"
        action={
          <Link to="/" className="btn-primary inline-block">
            Back home
          </Link>
        }
      />
    );
  }

  const isStillInRoom = Boolean(playerId && currentRoom.players?.[playerId]);
  if (!isStillInRoom) {
    return (
      <GameStatusCard
        title="You are no longer in this room"
        message="Leave/join state changed. Return home and join again if needed."
        variant="warn"
        action={
          <Link to="/" className="btn-primary inline-block">
            Back home
          </Link>
        }
      />
    );
  }

  const rulesetLabel =
    currentRoom.rulesetType === 'obaida_classic'
      ? t('create.ruleset.classic')
      : t('create.ruleset.custom');

  return (
    <div className="page-shell flex flex-col items-center">
      <div className="card-container w-full max-w-2xl">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="page-title mb-0">{t('lobby.title')}</h1>
          <button type="button" onClick={handleLeave} className="btn-danger text-sm px-4 py-2 shrink-0">
            {t('lobby.leave')}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-4 bg-surface-inset/80 rounded-xl border border-wood-700/50">
          <div>
            <span className="text-xs text-cream-200/50 uppercase tracking-wide">{t('lobby.code')}</span>
            <p className="text-2xl font-mono font-bold text-gold-300 tracking-normal tabular-nums mt-0.5">
              {code}
            </p>
          </div>
          <button
            onClick={handleCopyCode}
            className="text-sm text-gold-400 hover:text-gold-300 transition-colors"
          >
            {copied ? t('lobby.copied') : t('lobby.copy')}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-sm">
          <div className="bg-surface-inset/50 rounded-lg px-3 py-2 border border-wood-800/50">
            <span className="text-cream-200/50 text-xs">{t('lobby.mode')}</span>
            <p className="text-cream-100 font-medium mt-0.5">
              {currentRoom.mode === '4p_teams'
                ? t('create.mode.4p')
                : currentRoom.mode === '3p_solo'
                  ? t('create.mode.3p')
                  : t('create.mode.2p')}
            </p>
          </div>
          <div className="bg-surface-inset/50 rounded-lg px-3 py-2 border border-wood-800/50">
            <span className="text-cream-200/50 text-xs">{t('lobby.ruleset')}</span>
            <p className="text-cream-100 font-medium mt-0.5">{rulesetLabel}</p>
          </div>
          <div className="bg-surface-inset/50 rounded-lg px-3 py-2 border border-wood-800/50 col-span-2 sm:col-span-1">
            <span className="text-cream-200/50 text-xs">Seats</span>
            <p className="text-cream-100 font-medium mt-0.5">
              {seatedCount}/{maxPlayers}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-base font-semibold text-cream-200/90 mb-2">{t('lobby.players')}</h2>
          <div className="space-y-2">
            {Array.from({ length: maxPlayers }, (_, i) => {
              const player = players.find((p) => p.seat === i);
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2.5 rounded-lg border ${
                    player
                      ? getColorClass(player.color)
                      : 'bg-surface-inset/40 border-wood-700/60 border-dashed'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-gray-400 shrink-0">
                      {t('lobby.seat')} {i + 1}
                    </span>
                    {player ? (
                      <>
                        <span className="font-medium truncate">{player.name}</span>
                        {player.id === currentRoom.roomMakerUid && (
                          <span className="text-xs text-gold-400 shrink-0">
                            {t('lobby.roomMaker')}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-500 italic text-sm">{t('lobby.waiting')}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {player && (
                      <>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            player.ready || player.isBot
                              ? 'bg-green-900 text-green-300'
                              : 'bg-red-900 text-red-300'
                          }`}
                        >
                          {player.ready || player.isBot ? t('lobby.ready') : t('lobby.notReady')}
                        </span>
                        {isRoomMaker && player.id !== playerId && (
                          <button
                            onClick={() => handleKick(player.id)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            {t('lobby.kick')}
                          </button>
                        )}
                      </>
                    )}
                    {!player && isRoomMaker && currentRoom.botSettings.enabled && (
                      <button
                        onClick={handleAddBot}
                        className="text-xs text-gold-400 hover:text-gold-300"
                      >
                        {t('lobby.addBot')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {gameError && (
          <p className="text-sm text-red-300 mb-3 bg-red-950/40 rounded-lg px-3 py-2">{gameError}</p>
        )}
        {leaveError && (
          <p className="text-sm text-red-300 mb-3 bg-red-950/40 rounded-lg px-3 py-2">{leaveError}</p>
        )}

        <div className="flex flex-col gap-2">
          {playerId && !isRoomMaker && (
            <button onClick={handleReady} className="btn-primary w-full">
              {players.find((p) => p.id === playerId)?.ready
                ? t('lobby.unready')
                : t('lobby.setReady')}
            </button>
          )}

          {isRoomMaker && (
            <>
              <button
                onClick={handleStart}
                disabled={!startReadiness.canStart || loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? t('general.loading') : t('lobby.start')}
              </button>
              {!startReadiness.canStart && startReadiness.reason && (
                <p className="text-xs text-amber-300/90 text-center">{startReadiness.reason}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function LobbyPage() {
  return (
    <ErrorBoundary title="Lobby crashed">
      <LobbyPageContent />
    </ErrorBoundary>
  );
}
