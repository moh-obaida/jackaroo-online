import React from 'react';
import { useApp } from '../../../context/AppContext';

type TurnCueProps = {
  isMyTurn: boolean;
  turnPlayerName: string;
};

/** One-line turn signal — obvious when it's your move. */
export function TurnCue({ isMyTurn, turnPlayerName }: TurnCueProps) {
  const { t } = useApp();

  return (
    <div className={`turn-cue ${isMyTurn ? '' : 'turn-cue--waiting'}`} role="status" aria-live="polite">
      {isMyTurn ? (
        <p className="text-sm font-bold text-gold-300 turn-pulse">{t('game.yourTurn')}</p>
      ) : (
        <p className="text-xs text-cream-200/70">
          {t('game.waiting')}{' '}
          <span className="text-cream-100 font-medium">{turnPlayerName || '…'}</span>
        </p>
      )}
    </div>
  );
}
