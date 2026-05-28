import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { signInAsGuest } from '../lib/firebase/auth';

export function HomePage() {
  const { t, user, firebaseReady, isGuestUser } = useApp();
  const navigate = useNavigate();

  const handleGuest = async () => {
    if (!firebaseReady) return;
    if (!user) {
      await signInAsGuest();
    }
    navigate('/create');
  };

  const displayName =
    user?.displayName || (isGuestUser ? 'Guest' : user?.email?.split('@')[0]) || 'Player';

  const features = [
    { key: 'rooms', icon: '🔒' },
    { key: 'rules', icon: '♟️' },
    { key: 'custom', icon: '⚙️' },
    { key: 'players', icon: '👥' },
    { key: 'lang', icon: '🌐' },
    { key: 'sync', icon: '⚡' },
  ];

  return (
    <div className="page-shell flex flex-col items-center">
      {!firebaseReady && (
        <div className="w-full max-w-2xl mb-6 p-4 bg-yellow-900/40 border border-yellow-600/60 rounded-xl text-center">
          <p className="text-yellow-200 text-sm font-medium mb-1">Firebase is not configured yet</p>
          <p className="text-yellow-300/70 text-xs">
            Add VITE_FIREBASE_* in Netlify or your local .env to enable multiplayer.
          </p>
        </div>
      )}

      <section className="text-center mb-8 max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-gold-500/80 mb-2 font-medium">
          {t('app.name')}
        </p>
        <h1 className="mb-4">{t('app.name')}</h1>
        <p className="page-subtitle mx-auto">{t('app.tagline')}</p>
      </section>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full max-w-md">
        <Link to="/create" className="btn-primary text-center flex-1 text-base py-3">
          {t('home.createRoom')}
        </Link>
        <Link to="/join" className="btn-secondary text-center flex-1 text-base py-3">
          {t('home.joinRoom')}
        </Link>
      </div>

      {user ? (
        <div className="card-container-compact w-full max-w-md mb-8 text-center">
          <p className="text-sm text-cream-200/80">
            {t('home.signedIn', { name: displayName })}
          </p>
          {!isGuestUser && (
            <Link to="/profile" className="btn-ghost inline-block mt-2">
              {t('home.profile')}
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link to="/auth" className="btn-secondary text-sm px-5 py-2">
            {t('home.login')}
          </Link>
          <button type="button" onClick={handleGuest} className="btn-ghost text-sm">
            {t('home.guest')}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-4xl">
        {features.map((feature) => (
          <div key={feature.key} className="feature-card">
            <span className="text-xl shrink-0" aria-hidden>
              {feature.icon}
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold text-gold-300 text-sm">
                {t(`home.feature.${feature.key}`)}
              </h3>
              <p className="text-xs text-cream-200/55 mt-0.5 leading-snug">
                {t(`home.feature.${feature.key}.desc`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
