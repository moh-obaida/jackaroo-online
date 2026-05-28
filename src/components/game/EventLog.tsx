import React from 'react';
import { GameEvent } from '../../types/game';
import { useApp } from '../../context/AppContext';

interface EventLogProps {
  events: GameEvent[];
}

export function EventLog({ events }: EventLogProps) {
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

  return (
    <div className="card-container">
      <h3 className="text-sm font-semibold text-gray-300 mb-2">{t('game.eventLog')}</h3>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-xs text-gray-500">No events yet</p>
        ) : (
          [...events].reverse().slice(0, 20).map((event) => (
            <div key={event.id} className="flex items-start gap-2 text-xs">
              <span>{getEventIcon(event.type)}</span>
              <span className="text-gray-400">{event.description}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
