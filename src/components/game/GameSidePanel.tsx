import React, { useState } from 'react';
import { GameState } from '../../types/game';
import { useApp } from '../../context/AppContext';
import { DeckInfoPanel } from './DeckInfoPanel';
import { EventLog } from './EventLog';

interface GameSidePanelProps {
  gameState: GameState;
  onShowDeckGuide: () => void;
}

export function GameSidePanel({ gameState, onShowDeckGuide }: GameSidePanelProps) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="game-side-panel w-full lg:w-56 shrink-0">
      <button
        type="button"
        className="lg:hidden w-full btn-secondary text-xs py-2 mb-2"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? t('game.hidePanel') : t('game.showPanel')}
      </button>
      <div className={`${open ? 'flex' : 'hidden'} lg:flex flex-col gap-2`}>
        <div className="game-panel-compact">
          <h3 className="text-xs font-semibold text-cream-200/70 mb-1.5 uppercase tracking-wide">
            {t('game.info')}
          </h3>
          <ul className="space-y-1 text-[11px]">
            {gameState.players.map((p) => (
              <li
                key={p.id}
                className={`flex justify-between gap-2 ${
                  p.id === gameState.currentTurnPlayerId ? 'text-gold-300' : 'text-cream-200/55'
                }`}
              >
                <span className="truncate">{p.name}</span>
                <span className="shrink-0 tabular-nums">
                  {gameState.handCounts[p.id] ?? 0}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <DeckInfoPanel gameState={gameState} onShowDeckGuide={onShowDeckGuide} compact />
        <EventLog events={gameState.eventLog || []} compact />
      </div>
    </div>
  );
}
