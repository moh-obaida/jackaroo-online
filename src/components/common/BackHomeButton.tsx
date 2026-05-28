import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useGame } from '../../context/GameContext';

export function BackHomeButton({ className = '' }: { className?: string }) {
  const { t } = useApp();
  const navigate = useNavigate();
  const { clearGameSession } = useGame();

  const handleClick = () => {
    clearGameSession();
    navigate('/', { replace: true });
  };

  return (
    <button type="button" onClick={handleClick} className={`btn-secondary ${className}`}>
      {t('general.backHome')}
    </button>
  );
}
