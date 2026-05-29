import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { setPlayerReady, addBots } from '../lib/firebase/rooms';
import { getMaxPlayersForMode } from '../lib/game/normalize';
import { useRoomRouteState } from '../hooks/useRoomRouteState';
import { RoomRouteFallback } from '../components/game/RoomRouteFallback';
import { RoomRouteViewport } from '../components/game/RoomRouteViewport';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { PageFrame } from '../components/ui/PageFrame';
import { CardGuideModal } from '../components/cards/CardGuideModal';
import { BoardPreviewVisual } from '../components/board/boardVisual';
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
    error: sessionError,
    leaveWarning,
    safeLeaveRoom,
  } = useGame();
  const navigate = useNavigate();
  const { code: rawCode } = useParams<{ code: string }>();
  const roomCode = normalizeRoomCode(rawCode);
  const routeState = useRoomRouteState('lobby', roomCode);

  const [copied, setCopied] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [leaveBusy, setLeaveBusy] = useState(false);
  const [deckGuideOpen, setDeckGuideOpen] = useState(false);
  const playerId = user?.uid?.trim() || null;
  useVoiceChat(roomCode, playerId);

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
      reason =
        waiting.length > 0
          ? `${t('lobby.startWaitingAll')} (${t('lobby.startWaitingFor', { players: waiting.join(', ') })})`
          : t('lobby.startWaitingAll');
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

  const handleCopyInvite = useCallback(async () => {
    if (!roomCode) return;
    const inviteText = `Join my Jakaroo table. Code: ${roomCode}${hostPassword ? ` Password: ${hostPassword}` : ''}`;
    try {
      await navigator.clipboard.writeText(inviteText);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch {
      setPasswordCopied(false);
    }
  }, [roomCode, hostPassword]);

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

  const hostName = players.find((p) => p.uid === currentRoom.roomMakerUid)?.name || 'Host';

  return (
    <PageFrame variant="lobby" className="lobby-page-frame">
      <main className="lobby-wrap-donor lobby-wrap-fixed">
        <section className="lobby-title-donor lobby-title-fixed">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-gold-300 mb-1">
            {t('lobby.title')}
          </h1>
          <p className="text-cream-200/60 uppercase tracking-widest text-xs font-bold truncate">
            {t('lobby.hostTable', { name: hostName })}
          </p>
        </section>

        <section className="invite-plaque-donor invite-plaque-fixed">
          <span className="text-[10px] uppercase tracking-widest text-cream-200/40 font-bold mb-1 block">
            {t('lobby.code')}
          </span>
          <strong className="lobby-code-fixed">
            {roomCode}
          </strong>
          <div className="lobby-copy-row-fixed">
            <button type="button" onClick={handleCopyCode} className="btn-game-secondary px-4 py-2 text-xs">
              {copied ? t('lobby.copied') : t('lobby.copy')}
            </button>
            <button type="button" onClick={handleCopyInvite} className="btn-game-secondary px-4 py-2 text-xs">
              {passwordCopied ? t('lobby.copied') : t('lobby.copyInvite')}
            </button>
          </div>
        </section>

        <section className="lobby-table-area-donor lobby-table-area-fixed">
          <div className="mini-table-donor mini-table-fixed lobby-board-preview" aria-hidden>
            <BoardPreviewVisual size={280} />
          </div>

          {Array.from({ length: maxPlayers }).map((_, i) => {
            const player = players.find((p) => p.seat === i);
            const isMe = player?.id === playerId;
            const isMaker = player?.id === currentRoom.roomMakerUid;
            const position = ['bottom', 'right', 'top', 'left'][i] || 'bottom';
            const color = player?.color || ['black', 'green', 'blue', 'white'][i];

            return (
              <div
                key={i}
                className={`lobby-seat-donor lobby-seat-donor-${position} lobby-seat-fixed ${isMe ? 'me' : ''} ${!player ? 'empty' : ''}`}
              >
                <span
                  className="seat-color-donor"
                  style={{
                    backgroundColor: color === 'black' ? '#111' : color === 'white' ? '#eee' : color,
                    borderColor: color === 'black' ? '#7b7b7b' : 'rgba(255,255,255,0.55)',
                  }}
                />
                {player ? (
                  <>
                    <strong className="lobby-seat-name-fixed" title={player.name}>{player.name}</strong>
                    <div className="seat-badges-donor">
                      {isMe && <em>{t('lobby.you')}</em>}
                      {isMaker && <em>{t('lobby.roomMaker')}</em>}
                      {!isMaker && (
                        <em className={player.ready ? 'ready' : ''}>
                          {player.ready ? t('lobby.ready') : t('lobby.notReady')}
                        </em>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <strong className="text-xs text-cream-200/45">{t('lobby.waiting')}</strong>
                    {isRoomMaker && currentRoom.botSettings.enabled && (
                      <button
                        type="button"
                        onClick={() => handleAddBot(i)}
                        className="text-[10px] text-gold-500/60 hover:text-gold-500 transition-colors"
                      >
                        + {t('lobby.addBot')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <section className="rules-summary-donor rules-summary-fixed">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-cream-200/40 font-bold">{t('lobby.ruleset')}</span>
            <strong className="text-sm text-gold-300">{rulesetLabel}</strong>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[10px] uppercase tracking-widest text-cream-200/40 font-bold">{t('lobby.mode')}</span>
            <strong className="text-sm text-gold-300">{modeLabel}</strong>
          </div>
        </section>

        {leaveWarning && <p className="start-reason-donor">{leaveWarning}</p>}
        {sessionError && (
          <p className="start-reason-donor start-reason-donor--error" role="alert">
            {sessionError.startsWith('lobby.') || sessionError.startsWith('game.')
              ? t(sessionError)
              : sessionError}
          </p>
        )}
        {startReadiness.reason && (
          <p className="start-reason-donor" id="lobby-start-reason">
            {startReadiness.reason}
          </p>
        )}

        <section className="lobby-actions-donor lobby-actions-fixed">
          <button type="button" className="btn-game-secondary flex-1 py-3" onClick={handleLeave} disabled={leaveBusy}>
            {t('lobby.leave')}
          </button>

          {playerId && !isRoomMaker && (
            <button
              type="button"
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                myPlayer?.ready
                  ? 'bg-black/40 text-cream-200/60 border border-white/5'
                  : 'btn-game-primary'
              }`}
              onClick={handleReady}
            >
              {myPlayer?.ready ? t('lobby.unready') : t('lobby.setReady')}
            </button>
          )}

          {isRoomMaker && (
            <button
              type="button"
              className={`btn-game-primary flex-1 py-3 ${!startReadiness.canStart ? 'button-disabled-fixed' : ''}`}
              onClick={() => { if (startReadiness.canStart) void startGame(); }}
              disabled={!startReadiness.canStart || loading}
              aria-describedby={startReadiness.reason ? 'lobby-start-reason' : undefined}
            >
              {loading ? t('general.loading') : t('lobby.start')}
            </button>
          )}
        </section>
      </main>

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
