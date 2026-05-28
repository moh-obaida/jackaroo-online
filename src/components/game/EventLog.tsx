import React from 'react';
import { GameEvent } from '../../types/game';
import { useApp } from '../../context/AppContext';

interface EventLogProps {
  events: GameEvent[];
  compact?: boolean;
}

export function EventLog({ events, compact = false }: EventLogProps) {
  const { t } = useApp();

  const getEventIcon = (type: string): string => {
    switch (type) {
      case 'move': return '➡️';
      case 'eat': return '💥';
      case 'swap': return '🔄';
      case 'burn': return '🔥';
      case 'bring_out': return '🎯';
      case 'skip': return '⏭️';
      case 'burn_all': return '💀';
      case 'deal': return '🃏';
      case 'win': return '🏆';
      case 'disconnect': return '⚠️';
      case 'reconnect': return '✅';
      default: return '▶️';
    }
  };

  const wrapperClass = compact ? 'game-panel-compact' : 'card-container';
  const maxH = compact ? 'max-h-24' : 'max-h-40';

  return (
    <div className={wrapperClass}>
      <h3 className="text-xs font-semibold text-cream-200/70 mb-1.5">{t('game.eventLog')}</h3>
      <div className={`space-y-1 ${maxH} overflow-y-auto`}>
        {events.length === 0 ? (
          <p className="text-[10px] text-cream-200/40">—</p>
        ) : (
          [...events].reverse().slice(0, compact ? 8 : 20).map((event) => (
            <div key={event.id} className="flex items-start gap-1.5 text-[10px] sm:text-xs">
              <span className="shrink-0">{getEventIcon(event.type)}</span>
              <span className="text-cream-200/55 leading-snug">{event.description}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
