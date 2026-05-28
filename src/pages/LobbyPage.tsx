import React, { useEffect, useState } from 'react';
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
import { RoomData, PlayerState, COLORS_ORDER } from '../types/game';

export function LobbyPage() {
  const { t, user } = useApp();
  const { room, setRoomCode, startGame } = useGame();
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
  const maxPlayers = currentRoom?.mode === '4p_teams' ? 4 : currentRoom?.mode === '3p_solo' ? 3 : 2;
  const allReady = players.length === maxPlayers && players.every((p) => p.ready || p.isBot);

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
    if (!allReady) return;
    await startGame();
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'black': return 'bg-gray-800 border-gray-600';
      case 'green': return 'bg-green-800 border-green-600';
      case 'blue': return 'bg-blue-800 border-blue-600';
      case 'white': return 'bg-gray-100 border-gray-300 text-gray-900';
      default: return 'bg-gray-700 border-gray-500';
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
    <div className="flex-1 flex flex-col items-center px-4 py-8">
      <div className="card-container w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gold-400">{t('lobby.title')}</h1>
          <button onClick={handleLeave} className="btn-danger text-sm px-4 py-2">
            {t('lobby.leave')}
          </button>
        </div>

        {/* Room Code */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-board-dark rounded-lg">
          <span className="text-sm text-gray-400">{t('lobby.code')}:</span>
          <span className="text-2xl font-mono font-bold text-gold-300 tracking-widest">
            {code}
          </span>
          <button
            onClick={handleCopyCode}
            className="text-sm text-gold-400 hover:text-gold-300 transition-colors"
          >
            {copied ? t('lobby.copied') : t('lobby.copy')}
          </button>
        </div>

        {/* Room Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <span className="text-gray-400">{t('lobby.mode')}:</span>
            <span className="ml-2 text-white">
              {currentRoom.mode === '4p_teams' ? t('create.mode.4p') :
               currentRoom.mode === '3p_solo' ? t('create.mode.3p') :
               t('create.mode.2p')}
            </span>
          </div>
          <div>
            <span className="text-gray-400">{t('lobby.ruleset')}:</span>
            <span className="ml-2 text-white">
              {currentRoom.rulesetType === 'obaida_classic'
                ? t('create.ruleset.classic')
                : t('create.customLabel')}
            </span>
          </div>
        </div>

        {/* Players */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-200 mb-3">{t('lobby.players')}</h2>
          <div className="space-y-2">
            {Array.from({ length: maxPlayers }, (_, i) => {
              const player = players.find((p) => p.seat === i);
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    player ? getColorClass(player.color) : 'bg-board-dark border-wood-700 border-dashed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {t('lobby.seat')} {i + 1}
                    </span>
                    {player ? (
                      <>
                        <span className="font-medium">
                          {player.name}
                          {player.isBot && ' (Bot)'}
                        </span>
                        {currentRoom.mode === '4p_teams' && player.team && (
                          <span className="text-xs px-2 py-0.5 bg-black/30 rounded">
                            {t('lobby.team')} {player.team}
                          </span>
                        )}
                        {player.id === currentRoom.roomMakerUid && (
                          <span className="text-xs text-gold-400">
                            {t('lobby.roomMaker')}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-500 italic">{t('lobby.waiting')}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
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

        {/* Actions */}
        <div className="flex gap-3">
          {playerId && !isRoomMaker && (
            <button onClick={handleReady} className="btn-primary flex-1">
              {players.find((p) => p.id === playerId)?.ready
                ? t('lobby.unready')
                : t('lobby.setReady')}
            </button>
          )}
          {isRoomMaker && (
            <button
              onClick={handleStart}
              disabled={!allReady}
              className="btn-primary flex-1"
            >
              {allReady ? t('lobby.start') : t('lobby.cannotStart')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
