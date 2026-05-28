import React from 'react';
import { GameState } from '../../../types/game';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../ui/Button';
import { JakarooIcon } from '../../brand/JakarooIcon';

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
    <header className="game-table-hud">
      <div className="game-table-hud__brand-row min-w-0 flex items-center gap-2">
        <JakarooIcon size="sm" className="opacity-90" alt="" />
        <div className="game-table-hud__meta min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-cream-200/45 tabular-nums truncate">
            {roomCode} · {t('game.dealRound')} {gameState.dealState.dealRoundInBlock + 1}
          </p>
        </div>
      </div>
      <div
        className={`game-table-hud__turn ${isMyTurn ? 'game-table-hud__turn--yours' : ''}`}
        role="status"
        aria-live="polite"
      >
        {isMyTurn ? (
          <p className="text-sm font-bold text-gold-300 turn-pulse">{t('game.yourTurn')}</p>
        ) : (
          <p className="text-xs text-cream-200/70 truncate">
            {t('game.waiting')}{' '}
            <span className="text-cream-100 font-medium">{turnPlayerName || '…'}</span>
          </p>
        )}
      </div>
      <Button variant="danger" size="sm" onClick={onLeave} disabled={leaveBusy} className="shrink-0">
        {t('game.leaveGame')}
      </Button>
    </header>
  );
}
