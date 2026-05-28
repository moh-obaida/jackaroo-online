import React from 'react';
import { useApp } from '../context/AppContext';
import { BackHomeButton } from '../components/common/BackHomeButton';
import { GameStatusCard } from '../components/game/GameStatusCard';

export function NotFoundPage() {
  const { t } = useApp();

  return (
    <div className="page-shell flex flex-col items-center justify-center min-h-[50vh]">
      <GameStatusCard
        title={t('notFound.title')}
        message={t('notFound.message')}
        variant="warn"
        action={<BackHomeButton className="w-full sm:w-auto" />}
      />
    </div>
  );
}
