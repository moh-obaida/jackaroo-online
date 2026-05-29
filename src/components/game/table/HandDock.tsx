import React from 'react';
import { Card, GameAction, LegalAction } from '../../../types/game';
import { NoLegalMoveReasonKey } from '../../../lib/game/explainNoLegalMove';
import { formatPlayerName } from '../../../lib/player/displayName';
import { useApp } from '../../../context/AppContext';
import { PlayerHand } from '../../cards/PlayerHand';
import { PlayActionSheet } from '../play/PlayActionSheet';

type HandDockProps = {
  playerName: string;
  playerColor?: string | null;
  hand: Card[];
  selectedCardId: string | null;
  playableCardIds?: string[];
  onSelectCard: (id: string | null) => void;
  disabled: boolean;
  legalActions: LegalAction[];
  showAllActions: boolean;
  onToggleShowAll: (open: boolean) => void;
  onSubmitAction: (action: GameAction) => Promise<void>;
  playerId: string;
  isMyTurn: boolean;
  noLegalReasonKey?: NoLegalMoveReasonKey | null;
  boardFlowHintKey?: string | null;
};

/** Uno-style bottom hand rail — cards + step-guided actions, not a form panel. */
export function HandDock({
  playerName,
  playerColor,
  hand,
  selectedCardId,
  playableCardIds,
  onSelectCard,
  disabled,
  legalActions,
  showAllActions,
  onToggleShowAll,
  onSubmitAction,
  playerId,
  isMyTurn,
  noLegalReasonKey,
  boardFlowHintKey,
}: HandDockProps) {
  const { t } = useApp();
  const label = formatPlayerName(playerName, 12);

  return (
    <div
      className={`hand-dock-panel ${selectedCardId ? 'hand-dock-panel--card-selected' : ''}${!isMyTurn ? ' hand-dock-panel--waiting' : ''}`}
    >
      <div className="hand-dock-panel__header">
        <span className="hand-dock-panel__label">{t('game.yourHand')}</span>
        {playerColor && (
          <span className={`hand-dock-panel__color hand-dock-panel__color--${playerColor}`}>
            {t(`game.color.${playerColor}`)}
          </span>
        )}
        {label && <span className="hand-dock-panel__you">{label}</span>}
      </div>
      <div className="hand-dock-panel__cards">
        <PlayerHand
          cards={hand}
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
          noLegalReasonKey={noLegalReasonKey}
          boardFlowHintKey={boardFlowHintKey}
        />
      </div>
      {!isMyTurn && (
        <div className="hand-dock-panel__waiting-overlay" aria-hidden>
          <span>{t('game.waitTurn')}</span>
        </div>
      )}
    </div>
  );
}
