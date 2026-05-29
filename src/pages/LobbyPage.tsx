import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { setPlayerReady, kickPlayer, addBots } from '../lib/firebase/rooms';
import { getMaxPlayersForMode } from '../lib/game/normalize';
import { useRoomRouteState } from '../hooks/useRoomRouteState';
import { RoomRouteFallback } from '../components/game/RoomRouteFallback';
import { RoomRouteViewport } from '../components/game/RoomRouteViewport';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { PageFrame } from '../components/ui/PageFrame';
import { Panel } from '../components/ui/Panel';
import { Alert } from '../components/ui/Alert';
import { LobbySeatRing } from '../components/lobby/LobbySeatRing';
import { LobbyRulesSummary } from '../components/lobby/LobbyRulesSummary';
import { CardGuideModal } from '../components/cards/CardGuideModal';
import { VoiceControls } from '../components/voice/VoiceControls';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { getHostRoomPassword } from '../lib/room/hostRoomPassword';

function normalizeRoomCode(raw: string | undefined): string | null {
  const code = raw?.trim();
  return code && code.length > 0 ? code : null;
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
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [leaveBusy, setLeaveBusy] = useState(false);
  const [deckGuideOpen, setDeckGuideOpen] = useState(false);
  const playerId = user?.uid?.trim() || null;
  const voice = useVoiceChat(roomCode, playerId);

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
  const players = currentRoom ? Object.values(currentRoom.players) : [];
  const maxPlayers = currentRoom ? getMaxPlayersForMode(currentRoom.mode) : 0;
  const seatedCount = players.length;
  const isRoomMaker = Boolean(currentRoom && playerId && currentRoom.roomMakerUid === playerId);
  const hostPassword = roomCode ? getHostRoomPassword(roomCode) : null;

  const startReadiness = useMemo(() => {
    if (!currentRoom) {
      return { canStart: false, reason: null as string | null };
    }
    const humans = players.filter((p) => !p.isBot);
    const allSeatsFilled = seatedCount >= maxPlayers;
    const allHumansReady = humans.length > 0 && humans.every((p) => p.ready);
    const canStart = allSeatsFilled && allHumansReady;

    let reason: string | null = null;
    if (seatedCount < maxPlayers) {
      const need = maxPlayers - seatedCount;
      reason = t('lobby.startNeedPlayers', {
        need: String(need),
        seats: `${seatedCount}/${maxPlayers}`,
      });
    } else if (!allHumansReady) {
      const waiting = humans.filter((p) => !p.ready).map((p) => p.name);
      reason = t('lobby.startWaitingFor', { players: waiting.join(', ') });
    }

    return { canStart, reason };
  }, [currentRoom, players, seatedCount, maxPlayers, t]);

  const myPlayer = useMemo(
    () => (playerId ? players.find((p) => p.id === playerId) : undefined),
    [players, playerId]
  );

  const rulesetLabel = useMemo(() => {
    if (!currentRoom) return '';
    return currentRoom.rulesetType === 'obaida_classic'
      ? t('create.ruleset.classic')
      : t('create.ruleset.custom');
  }, [currentRoom, t]);

  const modeLabel = useMemo(() => {
    if (!currentRoom) return '';
    return currentRoom.mode === '4p_teams'
      ? t('create.mode.4p')
      : currentRoom.mode === '3p_solo'
        ? t('create.mode.3p')
        : t('create.mode.2p');
  }, [currentRoom, t]);

  const handleCopyCode = useCallback(async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [roomCode]);

  const handleCopyPassword = useCallback(async () => {
    if (!hostPassword) return;
    try {
      await navigator.clipboard.writeText(hostPassword);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch {
      setPasswordCopied(false);
    }
  }, [hostPassword]);

  const handleReady = useCallback(async () => {
    if (!playerId || !roomCode) return;
    await setPlayerReady(roomCode, playerId, !myPlayer?.ready);
  }, [playerId, roomCode, myPlayer?.ready]);

  const handleAddBot = useCallback(
    (seatIndex?: number) => {
      if (!roomCode || !currentRoom) return;
      addBots(roomCode, 1, currentRoom.botSettings.difficulty, currentRoom.mode, seatIndex);
    },
    [roomCode, currentRoom]
  );

  const reload = useCallback(() => window.location.reload(), []);

  if (!roomCode) {
    return (
      <RoomRouteViewport variant="marketing">
        <RoomRouteFallback state={{ kind: 'invalid_code' }} roomCode={null} onReload={reload} />
      </RoomRouteViewport>
    );
  }

  if (routeState.kind !== 'lobby_ready') {
    return (
      <RoomRouteViewport variant="marketing">
        <RoomRouteFallback state={routeState} roomCode={roomCode} onReload={reload} />
      </RoomRouteViewport>
    );
  }

  if (!currentRoom) {
    return (
      <RoomRouteViewport variant="marketing">
        <RoomRouteFallback state={{ kind: 'loading_room' }} roomCode={roomCode} onReload={reload} />
      </RoomRouteViewport>
    );
  }

  return (
    <PageFrame variant="lobby">
      <Panel
        title={t('lobby.title')}
        subtitle={`${modeLabel} · ${rulesetLabel} · ${seatedCount}/${maxPlayers}`}
        glow
        className="lobby-page-panel jkr-panel--compact"
      >
        {leaveWarning && (
          <Alert variant="warn" className="mb-3 rounded-xl text-xs py-2">
            {leaveWarning}
          </Alert>
        )}

        <div className="lobby-setup">
          <div className="lobby-invite-plaque">
            <div className="lobby-invite-plaque__row">
              <span className="lobby-invite-plaque__label">{t('lobby.code')}</span>
              <span className="lobby-invite-plaque__code">{roomCode}</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="btn-game-secondary lobby-invite-plaque__copy"
              >
                {copied ? t('lobby.copied') : t('lobby.copy')}
              </button>
            </div>

            {isRoomMaker && (
              <div className="lobby-invite-plaque__row lobby-invite-plaque__row--password">
                <span className="lobby-invite-plaque__label">{t('lobby.password')}</span>
                {hostPassword ? (
                  <>
                    <span
                      className="lobby-invite-plaque__secret"
                      aria-label={t('lobby.password')}
                    >
                      {passwordVisible ? hostPassword : '•'.repeat(hostPassword.length)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPasswordVisible((v) => !v)}
                      className="btn-game-secondary lobby-invite-plaque__toggle"
                      aria-pressed={passwordVisible}
                    >
                      {passwordVisible ? t('lobby.hidePassword') : t('lobby.showPassword')}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCopyPassword()}
                      className="btn-game-secondary lobby-invite-plaque__copy"
                    >
                      {passwordCopied ? t('lobby.passwordCopied') : t('lobby.copy')}
                    </button>
                  </>
                ) : (
                  <p className="lobby-invite-plaque__password-hint">{t('lobby.passwordUnavailable')}</p>
                )}
              </div>
            )}
          </div>

          <div className="lobby-setup__main">
            <div className="lobby-setup__table">
              <LobbySeatRing
                maxPlayers={maxPlayers}
                mode={currentRoom.mode}
                players={players}
                roomMakerUid={currentRoom.roomMakerUid}
                myPlayerId={playerId}
                isRoomMaker={isRoomMaker}
                onKick={(uid) => kickPlayer(roomCode, uid)}
                onAddBot={handleAddBot}
                botsEnabled={currentRoom.botSettings.enabled}
                getVoiceStatus={voice.getParticipantStatus}
              />
            </div>

            <aside className="lobby-setup__rules">
              <LobbyRulesSummary
                rulesetType={currentRoom.rulesetType}
                compact
                showDeckLink={false}
              />
            </aside>
          </div>

          {gameError && (
            <Alert variant="error" className="rounded-xl text-xs py-2 mt-3">
              {gameError}
            </Alert>
          )}

          {!startReadiness.canStart && startReadiness.reason && isRoomMaker && (
            <p className="lobby-setup__hint text-xs text-amber-300/90 text-center mt-2">
              {startReadiness.reason}
            </p>
          )}
          {!startReadiness.canStart && !isRoomMaker && (
            <p className="lobby-setup__hint text-xs text-cream-200/60 text-center mt-2">
              {startReadiness.reason ?? t('lobby.waitingForMaker')}
            </p>
          )}
        </div>

        <footer className="lobby-action-bar">
          <VoiceControls
            compact
            connectionState={voice.connectionState}
            isSupported={voice.isSupported}
            onJoin={voice.joinVoice}
            onLeave={voice.leaveVoice}
            onMute={voice.mute}
            onUnmute={voice.unmute}
            onRetry={voice.retryJoin}
          />

          <button
            type="button"
            className="btn-game-danger"
            onClick={handleLeave}
            disabled={leaveBusy}
          >
            {t('lobby.leave')}
          </button>

          <button
            type="button"
            className="btn-game-secondary"
            onClick={() => setDeckGuideOpen(true)}
          >
            {t('game.showDeck')}
          </button>

          {isRoomMaker && currentRoom.botSettings.enabled && (
            <button type="button" className="btn-game-secondary" onClick={() => handleAddBot()}>
              {t('lobby.addBot')}
            </button>
          )}

          <div className="lobby-action-bar__primary">
            {playerId && !isRoomMaker && (
              <button type="button" className="btn-game-primary" onClick={handleReady}>
                {myPlayer?.ready ? t('lobby.unready') : t('lobby.setReady')}
              </button>
            )}

            {isRoomMaker && (
              <button
                type="button"
                className="btn-game-primary"
                onClick={() => {
                  if (startReadiness.canStart) void startGame();
                }}
                disabled={!startReadiness.canStart || loading}
              >
                {loading ? t('general.loading') : t('lobby.start')}
              </button>
            )}
          </div>
        </footer>
      </Panel>

      <CardGuideModal open={deckGuideOpen} onClose={() => setDeckGuideOpen(false)} />
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
