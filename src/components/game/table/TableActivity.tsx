import React, { useId, useState } from 'react';
import { GameState } from '../../../types/game';
import { useApp } from '../../../context/AppContext';

type TableActivityProps = {
  gameState: GameState;
};

/** One-line table chatter (Uno-style); full log only when expanded. */
export function TableActivity({ gameState }: TableActivityProps) {
  const { t } = useApp();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const events = gameState.eventLog;
  const last = events[events.length - 1];

  if (!last) return null;

  return (
    <div className="table-activity">
      <button
        type="button"
        className="table-activity__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={listId}
      >
        <span className="table-activity__last truncate">{last.description}</span>
        <span className="table-activity__chevron">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <ul className="table-activity__list" id={listId}>
          {events
            .slice(-8)
            .reverse()
            .map((ev) => (
              <li key={ev.id}>{ev.description}</li>
            ))}
        </ul>
      )}
      <span className="sr-only">{t('game.eventLog')}</span>
    </div>
  );
}
