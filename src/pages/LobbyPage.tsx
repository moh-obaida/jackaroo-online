import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { setPlayerReady, kickPlayer, addBots } from '../lib/firebase/rooms';
import { getMaxPlayersForMode } from '../lib/game/normalize';
import { useRoomRouteState } from '../hooks/useRoomRouteState';
import { isTerminalRouteState } from '../lib/room/routeState';
import { RoomRouteFallback } from '../components/game/RoomRouteFallback';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { PageFrame } from '../components/ui/PageFrame';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { LobbySeatRing } from '../components/lobby/LobbySeatRing';
import { LobbyRulesSummary } from '../components/lobby/LobbyRulesSummary';

function normalizeRoomCode(raw: string | undefined): string | null {
  const code = raw?.trim();
  return code && code.length > 0 ? code : null;
}

function seatColorClass(color: string): string {
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
}

function LobbyPageContent() {
  const { t, user } = useApp();
  const {
    room,
    bindRoomFromRoute,
    startGame,
    loading,
    error: gameError,
    leaveWarning,
    safeLeaveRoom,
  } = useGame();
  const navigate = useNavigate();
  const { code: rawCode } = useParams<{ code: string }>();
  const roomCode = normalizeRoomCode(rawCode);
  const routeState = useRoomRouteState('lobby', roomCode);

  const [copied, setCopied] = useState(false);
  const [leaveBusy, setLeaveBusy] = useState(false);

  useEffect(() => {
    if (!roomCode) return;
    bindRoomFromRoute(roomCode);
  }, [roomCode, bindRoomFromRoute]);

  useEffect(() => {
    if (routeState.kind === 'redirect_to_game' && roomCode) {
      navigate(`/game/${roomCode}`, { replace: true });
    }
  }, [routeState.kind, roomCode, navigate]);

  const handleLeave = useCallback(async () => {
    if (!roomCode || leaveBusy) return;
    setLeaveBusy(true);
    try {
      await safeLeaveRoom(roomCode);
    } finally {
      setLeaveBusy(false);
    }
  }, [roomCode, leaveBusy, safeLeaveRoom]);

  const currentRoom = room;
  const playerId = user?.uid?.trim() || null;
  const players = currentRoom ? Object.values(currentRoom.players) : [];
  const maxPlayers = currentRoom ? getMaxPlayersForMode(currentRoom.mode) : 0;
  const seatedCount = players.length;
  const isRoomMaker = Boolean(currentRoom && playerId && currentRoom.roomMakerUid === playerId);

  const startReadiness = useMemo(() => {
    if (!currentRoom) {
      return { canStart: false, reason: null };
    }
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

    return { canStart, reason };
  }, [currentRoom, players, seatedCount, maxPlayers]);

  if (isTerminalRouteState(routeState)) {
    return <RoomRouteFallback state={routeState} roomCode={roomCode} />;
  }

  if (!currentRoom || !roomCode) {
    return <RoomRouteFallback state={{ kind: 'loading_room' }} roomCode={roomCode} />;
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReady = async () => {
    if (!playerId) return;
    const myPlayer = players.find((p) => p.id === playerId);
    await setPlayerReady(roomCode, playerId, !myPlayer?.ready);
  };

  const rulesetLabel =
    currentRoom.rulesetType === 'obaida_classic'
      ? t('create.ruleset.classic')
      : t('create.ruleset.custom');

  const modeLabel =
    currentRoom.mode === '4p_teams'
      ? t('create.mode.4p')
      : currentRoom.mode === '3p_solo'
        ? t('create.mode.3p')
        : t('create.mode.2p');

  return (
    <PageFrame variant="lobby">
      <Panel
        title={t('lobby.title')}
        subtitle={`${modeLabel} · ${rulesetLabel}`}
        glow
        className="lobby-page-panel"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <Button variant="danger" size="sm" onClick={handleLeave} disabled={leaveBusy}>
            {t('lobby.leave')}
          </Button>
          <button
            type="button"
            onClick={handleCopyCode}
            className="btn-ghost text-sm"
          >
            {copied ? t('lobby.copied') : t('lobby.copy')}
          </button>
        </div>

        {leaveWarning && <Alert variant="warn" className="mb-4 rounded-xl">{leaveWarning}</Alert>}

        <LobbyRulesSummary rulesetType={currentRoom.rulesetType} />

        <LobbySeatRing
          roomCode={roomCode}
          maxPlayers={maxPlayers}
          players={players}
          roomMakerUid={currentRoom.roomMakerUid}
          myPlayerId={playerId}
          isRoomMaker={isRoomMaker}
          onKick={(uid) => kickPlayer(roomCode, uid)}
          onAddBot={() =>
            addBots(roomCode, 1, currentRoom.botSettings.difficulty, currentRoom.mode)
          }
          botsEnabled={currentRoom.botSettings.enabled}
          getColorClass={seatColorClass}
        />

        <div className="grid grid-cols-3 gap-2 mt-2 mb-5 text-center text-xs">
          <div className="rounded-lg bg-black/30 border border-wood-800/50 py-2 px-2">
            <span className="text-cream-200/45 block">{t('lobby.mode')}</span>
            <span className="text-cream-100 font-medium">{modeLabel}</span>
          </div>
          <div className="rounded-lg bg-black/30 border border-wood-800/50 py-2 px-2">
            <span className="text-cream-200/45 block">{t('lobby.ruleset')}</span>
            <span className="text-cream-100 font-medium">{rulesetLabel}</span>
          </div>
          <div className="rounded-lg bg-black/30 border border-wood-800/50 py-2 px-2">
            <span className="text-cream-200/45 block">Seats</span>
            <span className="text-cream-100 font-medium">
              {seatedCount}/{maxPlayers}
            </span>
          </div>
        </div>

        {gameError && (
          <Alert variant="error" className="mb-4 rounded-xl">
            {gameError}
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          {playerId && !isRoomMaker && (
            <Button variant="primary" fullWidth onClick={handleReady}>
              {players.find((p) => p.id === playerId)?.ready
                ? t('lobby.unready')
                : t('lobby.setReady')}
            </Button>
          )}

          {isRoomMaker && (
            <>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => {
                  if (startReadiness.canStart) void startGame();
                }}
                disabled={!startReadiness.canStart || loading}
              >
                {loading ? t('general.loading') : t('lobby.start')}
              </Button>
              {!startReadiness.canStart && startReadiness.reason && (
                <p className="text-xs text-amber-300/90 text-center">{startReadiness.reason}</p>
              )}
            </>
          )}
        </div>
      </Panel>
    </PageFrame>
  );
}

export function LobbyPage() {
  return (
    <ErrorBoundary title="Lobby crashed">
      <LobbyPageContent />
    </ErrorBoundary>
  );
}
