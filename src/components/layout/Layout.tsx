import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { useGame } from '../../context/GameContext';

export function Layout() {
  const location = useLocation();
  const { leaveWarning } = useGame();
  const isGameTable = /^\/game\/[^/]+/.test(location.pathname);

  return (
    <div
      className={`min-h-screen flex flex-col text-cream-100 ${
        isGameTable ? 'game-app-shell bg-[#080604]' : 'bg-surface-base'
      }`}
    >
      {!isGameTable && <Header />}
      {leaveWarning && !isGameTable && (
        <p className="text-xs text-amber-200/90 bg-amber-950/50 px-4 py-2 text-center shrink-0">
          {leaveWarning}
        </p>
      )}
      <main className={`flex-1 flex flex-col min-h-0 ${isGameTable ? '' : ''}`}>
        <ErrorBoundary title="Page crashed">
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
