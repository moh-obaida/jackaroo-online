import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useGame } from '../../context/GameContext';

export type BackHomeIntent = 'navigate' | 'clearSession';

/**
 * navigate — go home only (create/join/home). No room cleanup.
 * clearSession — drop local session without Firebase leave (fallbacks after errors / not in room).
 * For Leave Room / Leave Game use safeLeaveRoom from session layer, not this button.
 */
export function BackHomeButton({
  className = '',
  intent = 'navigate',
}: {
  className?: string;
  intent?: BackHomeIntent;
}) {
  const { t } = useApp();
  const navigate = useNavigate();
  const { clearGameSession } = useGame();

  const handleClick = () => {
    if (intent === 'clearSession') {
      clearGameSession();
    }
    navigate('/', { replace: true });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-cream-200/60 hover:text-gold-300 transition-colors ${className}`}
    >
      <span aria-hidden="true" className="rtl:rotate-180">&larr;</span>
      {t('general.backHome')}
    </button>
  );
}
