import React from 'react';
import { Outlet } from 'react-router-dom';
import { SiteHeader } from './SiteHeader';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { useGame } from '../../context/GameContext';
import { Alert } from '../ui/Alert';

/** Home, create, join, lobby, auth, profile — standard site chrome. */
export function MarketingShell() {
  const { leaveWarning } = useGame();

  return (
    <div className="marketing-shell">
      <SiteHeader />
      {leaveWarning && (
        <Alert variant="warn" className="rounded-none border-x-0">
          {leaveWarning}
        </Alert>
      )}
      <main className="marketing-shell__main">
        <ErrorBoundary title="Page crashed">
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
