import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

export function LobbyPage() {
  const { t, user } = useApp();
  const { room, setRoomCode, startGame, loading, error: gameError } = useGame();
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [localRoom, setLocalRoom] = useState<RoomData | null>(null);

  useEffect(() => {
    if (code) {
      setRoomCode(code);
    }
  }, [code, setRoomCode]);

  useEffect(() => {
    if (!code) return;
    const unsub = subscribeToRoom(code, (roomData) => {
      setLocalRoom(roomData);
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
  const hasBots = players.some((p) => p.isBot);
  const seatedCount = players.length;

  const startReadiness = useMemo(() => {
    const humans = players.filter((p) => !p.isBot);
    const allSeatsFilled = seatedCount >= maxPlayers;
    const allHumansReady = humans.length > 0 && humans.every((p) => p.ready);
    const canStart = allSeatsFilled && allHumansReady && !hasBots;

    let reason: string | null = null;
    if (hasBots) {
      reason = 'Bot games are not supported in gameplay yet.';
    } else if (seatedCount < maxPlayers) {
      const need = maxPlayers - seatedCount;
      reason = `Need ${need} more player${need === 1 ? '' : 's'} (${seatedCount}/${maxPlayers} seats).`;
    } else if (!allHumansReady) {
      const waiting = humans.filter((p) => !p.ready).map((p) => p.name);
      reason = `Waiting for: ${waiting.join(', ')}`;
    }

    return { canStart, reason, allSeatsFilled, allHumansReady };
  }, [players, seatedCount, maxPlayers, hasBots]);

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
    await leaveRoom(code, playerId);
    setRoomCode(null);
    navigate('/');
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

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">{t('general.loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-6">
      <div className="card-container w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gold-400">{t('lobby.title')}</h1>
          <button onClick={handleLeave} className="btn-danger text-sm px-4 py-2">
            {t('lobby.leave')}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-board-dark rounded-lg">
          <span className="text-sm text-gray-400">{t('lobby.code')}:</span>
          <span className="text-2xl font-mono font-bold text-gold-300 tracking-normal tabular-nums">
            {code}
          </span>
          <button
            onClick={handleCopyCode}
            className="text-sm text-gold-400 hover:text-gold-300 transition-colors"
          >
            {copied ? t('lobby.copied') : t('lobby.copy')}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <span className="text-gray-400">{t('lobby.mode')}:</span>
            <span className="ml-2 text-white">
              {currentRoom.mode === '4p_teams'
                ? t('create.mode.4p')
                : currentRoom.mode === '3p_solo'
                  ? t('create.mode.3p')
                  : t('create.mode.2p')}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Seats:</span>
            <span className="ml-2 text-white">
              {seatedCount}/{maxPlayers}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-200 mb-2">{t('lobby.players')}</h2>
          <div className="space-y-2">
            {Array.from({ length: maxPlayers }, (_, i) => {
              const player = players.find((p) => p.seat === i);
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2.5 rounded-lg border ${
                    player
                      ? getColorClass(player.color)
                      : 'bg-board-dark border-wood-700 border-dashed'
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
