import React from 'react';
import { Card, GameAction, LegalAction } from '../../../types/game';
import { PlayerHand } from '../../cards/PlayerHand';
import { PlayActionSheet } from '../play/PlayActionSheet';

type HandDockProps = {
  playerName: string;
  cards: Card[];
  selectedCardId: string | null;
  playableCardIds?: string[];
  onSelectCard: (id: string | null) => void;
  disabled: boolean;
  legalActions: LegalAction[];
  hand: Card[];
  showAllActions: boolean;
  onToggleShowAll: (open: boolean) => void;
  onSubmitAction: (action: GameAction) => Promise<void>;
  playerId: string;
  isMyTurn: boolean;
};

/** Uno-style bottom hand rail — cards + step-guided actions, not a form panel. */
export function HandDock({
  playerName,
  cards,
  selectedCardId,
  playableCardIds,
  onSelectCard,
  disabled,
  legalActions,
  hand,
  showAllActions,
  onToggleShowAll,
  onSubmitAction,
  playerId,
  isMyTurn,
}: HandDockProps) {
  return (
    <div className={`hand-dock-panel ${selectedCardId ? 'hand-dock-panel--card-selected' : ''}`}>
      <div className="hand-dock-panel__cards">
        <PlayerHand
          cards={cards}
          selectedCardId={selectedCardId}
          playableCardIds={playableCardIds}
          onSelectCard={onSelectCard}
          disabled={disabled}
          docked
        />
      </div>
      <div className="hand-dock-panel__actions">
        <PlayActionSheet
          legalActions={legalActions}
          hand={hand}
          selectedCardId={selectedCardId}
          showAllActions={showAllActions}
          onToggleShowAll={onToggleShowAll}
          onSubmitAction={onSubmitAction}
          playerId={playerId}
          isMyTurn={isMyTurn}
        />
      </div>
    </div>
  );
}
