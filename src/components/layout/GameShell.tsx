import React from 'react';
import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { useGame } from '../../context/GameContext';
import { Alert } from '../ui/Alert';

/** Full-viewport game route — no marketing header. */
export function GameShell() {
  const { leaveWarning } = useGame();

  return (
    <div className="game-shell">
      {leaveWarning && (
        <Alert variant="warn" className="rounded-none border-x-0 border-t-0 shrink-0">
          {leaveWarning}
        </Alert>
      )}
      <main className="game-shell__main">
        <ErrorBoundary title="Game screen crashed">
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
