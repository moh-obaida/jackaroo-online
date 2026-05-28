import React, { useState } from 'react';
import { LegalAction, GameAction } from '../../types/game';
import { useApp } from '../../context/AppContext';

interface ActionPanelProps {
  legalActions: LegalAction[];
  selectedCardId: string | null;
  onSubmitAction: (action: GameAction) => Promise<void>;
  playerId: string;
}

export function ActionPanel({ legalActions, selectedCardId, onSubmitAction, playerId }: ActionPanelProps) {
  const { t } = useApp();
  const [loading, setLoading] = useState(false);

  // Filter actions for selected card
  const filteredActions = selectedCardId
    ? legalActions.filter((a) => a.cardId === selectedCardId || a.cardId === '')
    : legalActions.filter((a) => a.cardId === ''); // burn_all, skip

  const handleAction = async (action: LegalAction) => {
    setLoading(true);
    try {
      const gameAction: GameAction = {
        type: action.type,
        playerId,
        cardId: action.cardId || undefined,
        marbleId: action.marbleId,
        targetPosition: action.targetPosition,
        swapMarbleId1: action.swapMarbleId1,
        swapMarbleId2: action.swapMarbleId2,
        splitMoves: action.splitMoves,
        burnTargetPlayerId: action.burnTargetPlayerId,
      };
      await onSubmitAction(gameAction);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (type: string): string => {
    switch (type) {
      case 'bring_out': return '🎯';
      case 'move': return '➡️';
      case 'move_backward': return '⬅️';
      case 'split_seven': return '7️⃣';
      case 'swap': return '🔄';
      case 'burn_next_player': return '🔥';
      case 'burn_all_cards': return '💀';
      case 'skip_no_cards': return '⏭️';
      default: return '▶️';
    }
  };

  if (filteredActions.length === 0 && !selectedCardId) {
    return (
      <div className="card-container">
        <p className="text-sm text-gray-400 text-center">{t('game.selectCard')}</p>
      </div>
    );
  }

  if (filteredActions.length === 0 && selectedCardId) {
    return (
      <div className="card-container">
        <p className="text-sm text-gray-400 text-center">{t('game.selectAction')}</p>
        {/* Show all actions for this card from unfiltered list */}
        <div className="mt-2 space-y-1">
          {legalActions
            .filter((a) => a.cardId === selectedCardId)
            .slice(0, 10)
            .map((action, i) => (
              <button
                key={i}
                onClick={() => handleAction(action)}
                disabled={loading}
                className="w-full text-left px-3 py-2 text-sm bg-board-dark hover:bg-wood-800 rounded-lg border border-wood-700 transition-colors disabled:opacity-50"
              >
                <span className="mr-2">{getActionIcon(action.type)}</span>
                {action.description}
              </button>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card-container">
      <h3 className="text-sm font-semibold text-gray-300 mb-2">{t('game.selectAction')}</h3>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {filteredActions.slice(0, 15).map((action, i) => (
          <button
            key={i}
            onClick={() => handleAction(action)}
            disabled={loading}
            className="w-full text-left px-3 py-2 text-sm bg-board-dark hover:bg-wood-800 rounded-lg border border-wood-700 transition-colors disabled:opacity-50"
          >
            <span className="mr-2">{getActionIcon(action.type)}</span>
            {action.description}
          </button>
        ))}
        {filteredActions.length > 15 && (
          <p className="text-xs text-gray-500 text-center pt-1">
            +{filteredActions.length - 15} more actions
          </p>
        )}
      </div>
    </div>
  );
}
