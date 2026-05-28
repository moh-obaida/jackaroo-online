import React from 'react';
import { GameState } from '../../../types/game';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../ui/Button';

type GameHUDProps = {
  roomCode: string;
  gameState: GameState;
  onLeave: () => void;
  leaveBusy: boolean;
};

export function GameHUD({ roomCode, gameState, onLeave, leaveBusy }: GameHUDProps) {
  const { t } = useApp();

  return (
    <header className="game-table-hud flex items-center justify-between gap-2 px-3 py-2 shrink-0">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-cream-200/45">
          {t('game.dealRound')} {gameState.dealState.dealRoundInBlock + 1}
        </p>
        <p className="text-xs text-cream-200/60 tabular-nums font-mono">{roomCode}</p>
      </div>
      <Button variant="danger" size="sm" onClick={onLeave} disabled={leaveBusy}>
        {t('game.leaveGame')}
      </Button>
    </header>
  );
}
