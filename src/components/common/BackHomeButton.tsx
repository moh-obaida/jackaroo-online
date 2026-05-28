import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export function BackHomeButton({ className = '' }: { className?: string }) {
  const { t } = useApp();
  return (
    <Link to="/" className={`btn-secondary inline-block text-center ${className}`}>
      {t('general.backHome')}
    </Link>
  );
}
