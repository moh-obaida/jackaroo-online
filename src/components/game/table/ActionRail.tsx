import React from 'react';
import { GameAction, LegalAction } from '../../../types/game';
import { ActionPanel } from '../ActionPanel';
import { useApp } from '../../../context/AppContext';

type ActionRailProps = {
  legalActions: LegalAction[];
  selectedCardId: string | null;
  onSubmitAction: (action: GameAction) => Promise<void>;
  playerId: string;
  isMyTurn: boolean;
};

export function ActionRail({
  legalActions,
  selectedCardId,
  onSubmitAction,
  playerId,
  isMyTurn,
}: ActionRailProps) {
  const { t } = useApp();

  if (!isMyTurn) {
    return (
      <p className="text-xs text-cream-200/50 text-center py-2 action-rail-wait">{t('game.waitTurn')}</p>
    );
  }

  return (
    <div className="action-rail mt-2 max-h-[38vh] overflow-y-auto rounded-lg border border-wood-800/50 bg-black/40 p-2">
      <ActionPanel
        legalActions={legalActions}
        selectedCardId={selectedCardId}
        onSubmitAction={onSubmitAction}
        playerId={playerId}
      />
    </div>
  );
}
