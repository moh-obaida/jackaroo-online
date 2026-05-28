import React from 'react';
import { PlayerState, GameMode } from '../../types/game';
import { useApp } from '../../context/AppContext';
import { BoardPreviewVisual } from '../board/boardVisual';
import { VoiceStatusBadge } from '../voice/VoiceStatusBadge';
import { VoiceParticipantStatus } from '../../lib/voice/types';

type LobbySeatRingProps = {
  maxPlayers: number;
  mode: GameMode;
  players: PlayerState[];
  roomMakerUid: string;
  myPlayerId: string | null;
  isRoomMaker: boolean;
  onKick: (uid: string) => void;
  onAddBot: () => void;
  botsEnabled: boolean;
  getVoiceStatus?: (playerId: string) => VoiceParticipantStatus;
};

function seatColorClass(color: string, filled: boolean): string {
  const base: Record<string, string> = {
    black: 'lobby-seat--black',
    green: 'lobby-seat--green',
    blue: 'lobby-seat--blue',
    white: 'lobby-seat--white',
  };
  return filled ? base[color] ?? 'lobby-seat--neutral' : 'lobby-seat--empty';
}

/** Seats around a mini board — table-first lobby. */
export function LobbySeatRing({
  maxPlayers,
  mode,
  players,
  roomMakerUid,
  myPlayerId,
  isRoomMaker,
  onKick,
  onAddBot,
  botsEnabled,
  getVoiceStatus,
}: LobbySeatRingProps) {
  const { t } = useApp();

  const seatPositions: { top: string; left: string }[] =
    maxPlayers === 2
      ? [
          { top: '6%', left: '50%' },
          { top: '90%', left: '50%' },
        ]
      : maxPlayers === 3
        ? [
            { top: '8%', left: '50%' },
            { top: '82%', left: '16%' },
            { top: '82%', left: '84%' },
          ]
        : [
            { top: '5%', left: '50%' },
            { top: '50%', left: '94%' },
            { top: '90%', left: '50%' },
            { top: '50%', left: '6%' },
          ];

  const showTeams = mode === '4p_teams';

  return (
    <div className="lobby-table">
      <div className="lobby-table__felt" aria-hidden />
      <div className="lobby-table__board jkr-layer-board">
        <BoardPreviewVisual size={maxPlayers >= 4 ? 240 : 220} />
      </div>

      {Array.from({ length: maxPlayers }, (_, seatIndex) => {
        const pos = seatPositions[seatIndex] || seatPositions[0];
        const player = players.find((p) => p.seat === seatIndex);
        const isReady = Boolean(player?.ready || player?.isBot);
        const colorClass = seatColorClass(player?.color ?? '', Boolean(player));
        const voiceStatus = player && getVoiceStatus ? getVoiceStatus(player.id) : 'not_joined';

        return (
          <div
            key={seatIndex}
            className="lobby-seat-slot"
            style={{ top: pos.top, left: pos.left }}
          >
            <div
              className={`lobby-seat ${colorClass} ${isReady ? 'lobby-seat--ready' : ''} ${
                player ? '' : 'lobby-seat--vacant'
              }`}
            >
              <p className="lobby-seat__label">
                {t('lobby.seat')} {seatIndex + 1}
              </p>
              {player ? (
                <>
                  <p className="lobby-seat__name">{player.name}</p>
                  <div className="lobby-seat__badges">
                    {getVoiceStatus && (
                      <VoiceStatusBadge status={voiceStatus} className="lobby-seat__voice-badge" />
                    )}
                    {player.isBot && (
                      <span className="lobby-seat__badge lobby-seat__badge--bot">BOT</span>
                    )}
                    {showTeams && player.team && (
                      <span className="lobby-seat__badge lobby-seat__badge--team">
                        {t('lobby.team')} {player.team}
                      </span>
                    )}
                    <span
                      className={`lobby-seat__badge ${
                        isReady ? 'lobby-seat__badge--ready' : 'lobby-seat__badge--waiting'
                      }`}
                    >
                      {isReady ? t('lobby.ready') : t('lobby.notReady')}
                    </span>
                  </div>
                  {player.id === roomMakerUid && (
                    <span className="lobby-seat__host">{t('lobby.roomMaker')}</span>
                  )}
                  {isRoomMaker && myPlayerId != null && player.id !== myPlayerId && !player.isBot && (
                    <button
                      type="button"
                      onClick={() => onKick(player.id)}
                      className="lobby-seat__kick"
                    >
                      {t('lobby.kick')}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="lobby-seat__vacant">{t('lobby.waiting')}</p>
                  {isRoomMaker && botsEnabled && (
                    <button type="button" onClick={onAddBot} className="lobby-seat__add-bot">
                      + {t('lobby.addBot')}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
