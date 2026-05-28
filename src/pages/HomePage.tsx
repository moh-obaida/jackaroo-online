import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { signInAsGuest } from '../lib/firebase/auth';

export function HomePage() {
  const { t, user, firebaseReady } = useApp();
  const navigate = useNavigate();

  const handleGuest = async () => {
    if (!firebaseReady) return;
    if (!user) {
      await signInAsGuest();
    }
    navigate('/create');
  };

  const features = [
    { key: 'rooms', icon: '🔒' },
    { key: 'rules', icon: '♟️' },
    { key: 'custom', icon: '⚙️' },
    { key: 'players', icon: '👥' },
    { key: 'lang', icon: '🌐' },
    { key: 'sync', icon: '⚡' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 md:py-10">
      {/* Firebase not configured banner */}
      {!firebaseReady && (
        <div className="w-full max-w-2xl mb-8 p-4 bg-yellow-900/50 border border-yellow-600 rounded-lg text-center">
          <p className="text-yellow-200 text-sm font-medium mb-1">
            Firebase is not configured yet
          </p>
          <p className="text-yellow-300/70 text-xs">
            Add your Firebase environment variables (VITE_FIREBASE_*) in Netlify or your local .env file to enable multiplayer functionality.
          </p>
        </div>
      )}

      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gold-400 mb-3">
          {t('app.name')}
        </h1>
        <p className="text-lg text-gray-300 max-w-md mx-auto">
          {t('app.tagline')}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 w-full max-w-md">
        <Link to="/create" className="btn-primary text-center flex-1 text-lg">
          {t('home.createRoom')}
        </Link>
        <Link to="/join" className="btn-secondary text-center flex-1 text-lg">
          {t('home.joinRoom')}
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Link
          to="/auth"
          className="text-gold-300 hover:text-gold-200 transition-colors text-sm"
        >
          {t('home.login')}
        </Link>
        <span className="text-gray-600 hidden sm:inline">|</span>
        <button
          onClick={handleGuest}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          {t('home.guest')}
        </button>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
        {features.map((feature) => (
          <div
            key={feature.key}
            className="card-container flex items-start gap-3"
          >
            <span className="text-2xl">{feature.icon}</span>
            <div>
              <h3 className="font-semibold text-gold-300 text-sm">
                {t(`home.feature.${feature.key}`)}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {t(`home.feature.${feature.key}.desc`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
