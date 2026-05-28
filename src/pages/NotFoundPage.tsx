import React from 'react';
import { useApp } from '../context/AppContext';
<<<<<<< HEAD
import { StatusPanel } from '../components/ui/StatusPanel';
=======
import { BackHomeButton } from '../components/common/BackHomeButton';
import { GameStatusCard } from '../components/game/GameStatusCard';
>>>>>>> origin/main

export function NotFoundPage() {
  const { t } = useApp();

  return (
<<<<<<< HEAD
    <StatusPanel
      title={t('notFound.title')}
      message={t('notFound.message')}
      variant="warn"
      backIntent="navigate"
    />
=======
    <div className="page-shell flex flex-col items-center justify-center min-h-[50vh]">
      <GameStatusCard
        title={t('notFound.title')}
        message={t('notFound.message')}
        variant="warn"
        action={<BackHomeButton className="w-full sm:w-auto" />}
      />
    </div>
>>>>>>> origin/main
  );
}
