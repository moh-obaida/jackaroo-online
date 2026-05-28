import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { GameProvider } from './context/GameContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { CreateRoomPage } from './pages/CreateRoomPage';
import { JoinRoomPage } from './pages/JoinRoomPage';
import { LobbyPage } from './pages/LobbyPage';
import { GamePage } from './pages/GamePage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <GameProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<CreateRoomPage />} />
              <Route path="/join" element={<JoinRoomPage />} />
              <Route path="/lobby/:code" element={<LobbyPage />} />
              <Route path="/game/:code" element={<GamePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </GameProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
