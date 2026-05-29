import React from 'react';
import { useApp } from '../context/AppContext';
import { StatusPanel } from '../components/ui/StatusPanel';

export function NotFoundPage() {
  const { t } = useApp();

  return (
    <StatusPanel
      title={t('notFound.title')}
      message={t('notFound.message')}
      variant="warn"
      backIntent="navigate"
    />
  );
}
