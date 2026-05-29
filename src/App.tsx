import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { GameProvider } from './context/GameContext';
import { MarketingShell } from './components/layout/MarketingShell';
import { GameShell } from './components/layout/GameShell';
import { HomePage } from './pages/HomePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { RulesPage } from './pages/RulesPage';
import { FaqPage } from './pages/FaqPage';
import { CreateRoomPage } from './pages/CreateRoomPage';
import { JoinRoomPage } from './pages/JoinRoomPage';
import { LobbyPage } from './pages/LobbyPage';
import { GamePage } from './pages/GamePage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <GameProvider>
          <Routes>
            <Route element={<GameShell />}>
              <Route path="/game/:code" element={<GamePage />} />
            </Route>
            <Route element={<MarketingShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/rules" element={<RulesPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/create" element={<CreateRoomPage />} />
              <Route path="/join" element={<JoinRoomPage />} />
              <Route path="/lobby/:code" element={<LobbyPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </GameProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
