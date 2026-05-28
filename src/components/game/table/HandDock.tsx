import React from 'react';
import { Card } from '../../../types/game';
import { PlayerHand } from '../../cards/PlayerHand';
import { useApp } from '../../../context/AppContext';

type HandDockProps = {
  playerName: string;
  cards: Card[];
  selectedCardId: string | null;
  onSelectCard: (id: string | null) => void;
  disabled: boolean;
  children?: React.ReactNode;
};

export function HandDock({
  playerName,
  cards,
  selectedCardId,
  onSelectCard,
  disabled,
  children,
}: HandDockProps) {
  const { t } = useApp();

  return (
    <div className="hand-dock-panel shrink-0 pt-2 pb-safe">
      <p className="text-[10px] uppercase tracking-wider text-cream-200/45 mb-1.5 text-center sm:text-start px-1">
        {playerName} · {t('game.hand')}
      </p>
      <PlayerHand
        cards={cards}
        selectedCardId={selectedCardId}
        onSelectCard={onSelectCard}
        disabled={disabled}
        docked
      />
      {children}
    </div>
  );
}
