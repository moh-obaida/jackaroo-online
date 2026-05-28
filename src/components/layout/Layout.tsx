import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { ErrorBoundary } from '../common/ErrorBoundary';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-board-dark text-white">
      <Header />
      <main className="flex-1 flex flex-col">
        <ErrorBoundary title="Page crashed">
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
