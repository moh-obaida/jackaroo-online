import React from 'react';
import { GameState } from '../../../types/game';
import { useApp } from '../../../context/AppContext';

type GameHUDProps = {
  roomCode: string;
  gameState: GameState;
  isMyTurn: boolean;
  turnPlayerName: string;
  onLeave: () => void;
  leaveBusy: boolean;
};

export function GameHUD({
  roomCode,
  gameState,
  isMyTurn,
  turnPlayerName,
  onLeave,
  leaveBusy,
}: GameHUDProps) {
  const { t } = useApp();

  return (
    <header className="game-table-hud flex items-center justify-between gap-2 px-3 py-2 shrink-0">
      <div className="min-w-0 flex-1">
        {isMyTurn ? (
          <p className="text-sm font-bold text-gold-300 turn-pulse inline-block">{t('game.yourTurn')}</p>
        ) : (
          <p className="text-xs text-cream-200/70 truncate">
            {t('game.waiting')} <span className="text-cream-100">{turnPlayerName || '…'}</span>
          </p>
        )}
        <p className="text-[10px] text-cream-200/40 tabular-nums mt-0.5">
          {roomCode} · {t('game.dealRound')} {gameState.dealState.dealRoundInBlock + 1}
        </p>
      </div>
      <button
        type="button"
        className="btn-danger text-xs px-3 py-1.5 shrink-0"
        onClick={onLeave}
        disabled={leaveBusy}
      >
        {t('game.leaveGame')}
      </button>
    </header>
  );
}
