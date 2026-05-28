import React from 'react';
import { PlayerState } from '../../types/game';
import { useApp } from '../../context/AppContext';

type LobbySeatRingProps = {
  roomCode: string;
  maxPlayers: number;
  players: PlayerState[];
  roomMakerUid: string;
  myPlayerId: string | null;
  isRoomMaker: boolean;
  onKick: (uid: string) => void;
  onAddBot: () => void;
  botsEnabled: boolean;
  getColorClass: (color: string) => string;
};

/** Seats arranged around a felt circle — table-first lobby, not a list. */
export function LobbySeatRing({
  roomCode,
  maxPlayers,
  players,
  roomMakerUid,
  myPlayerId,
  isRoomMaker,
  onKick,
  onAddBot,
  botsEnabled,
  getColorClass,
}: LobbySeatRingProps) {
  const { t } = useApp();

  const seatPositions: { top: string; left: string }[] =
    maxPlayers === 2
      ? [
          { top: '8%', left: '50%' },
          { top: '88%', left: '50%' },
        ]
      : maxPlayers === 3
        ? [
            { top: '10%', left: '50%' },
            { top: '78%', left: '18%' },
            { top: '78%', left: '82%' },
          ]
        : [
            { top: '8%', left: '50%' },
            { top: '50%', left: '92%' },
            { top: '88%', left: '50%' },
            { top: '50%', left: '8%' },
          ];

  return (
    <div className="lobby-table">
      <div className="lobby-table__felt" aria-hidden />
      <div className="lobby-table__code">
        <span className="text-[10px] uppercase tracking-widest text-cream-200/40">
          {t('lobby.code')}
        </span>
        <span className="text-3xl font-mono font-bold text-gold-300 tabular-nums mt-1">
          {roomCode}
        </span>
      </div>

      {Array.from({ length: maxPlayers }, (_, seatIndex) => {
        const pos = seatPositions[seatIndex] || seatPositions[0];
        const player = players.find((p) => p.seat === seatIndex);

        return (
          <div
            key={seatIndex}
            className="lobby-seat-slot"
            style={{ top: pos.top, left: pos.left }}
          >
            <div
              className={`rounded-xl border p-2.5 text-xs shadow-lg ${
                player
                  ? getColorClass(player.color)
                  : 'bg-black/40 border-wood-700/60 border-dashed text-cream-200/40'
              }`}
            >
              <p className="text-[9px] uppercase opacity-60 mb-0.5">
                {t('lobby.seat')} {seatIndex + 1}
              </p>
              {player ? (
                <>
                  <p className="font-semibold truncate">{player.name}</p>
                  <div className="flex items-center justify-between gap-1 mt-1">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded ${
                        player.ready || player.isBot
                          ? 'bg-emerald-900/80 text-emerald-300'
                          : 'bg-red-950/80 text-red-300'
                      }`}
                    >
                      {player.ready || player.isBot ? t('lobby.ready') : t('lobby.notReady')}
                    </span>
                    {player.id === roomMakerUid && (
                      <span className="text-[9px] text-gold-400">{t('lobby.roomMaker')}</span>
                    )}
                  </div>
                  {isRoomMaker && player.id !== myPlayerId && (
                    <button
                      type="button"
                      onClick={() => onKick(player.id)}
                      className="text-[9px] text-red-400 mt-1 hover:text-red-300"
                    >
                      {t('lobby.kick')}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="italic opacity-70">{t('lobby.waiting')}</p>
                  {isRoomMaker && botsEnabled && (
                    <button
                      type="button"
                      onClick={onAddBot}
                      className="text-[9px] text-gold-400 mt-1 hover:text-gold-300"
                    >
                      {t('lobby.addBot')}
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
