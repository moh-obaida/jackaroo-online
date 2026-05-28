import React from 'react';
import { GameState } from '../../../types/game';
import { useApp } from '../../../context/AppContext';

type ActivityStripProps = {
  gameState: GameState;
};

export function ActivityStrip({ gameState }: ActivityStripProps) {
  const { t } = useApp();
  const recent = gameState.eventLog.slice(-4).reverse();

  return (
    <div className="activity-strip hidden md:block max-h-24 overflow-y-auto text-[10px] text-cream-200/50 space-y-0.5">
      <p className="uppercase tracking-wider text-cream-200/35 mb-1">{t('game.eventLog')}</p>
      {recent.map((ev) => (
        <p key={ev.id} className="truncate leading-snug">
          {ev.description}
        </p>
      ))}
    </div>
  );
}
