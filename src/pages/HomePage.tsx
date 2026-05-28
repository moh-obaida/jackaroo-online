import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { signInAsGuest } from '../lib/firebase/auth';
import { PageFrame } from '../components/ui/PageFrame';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';

const FEATURES = ['rooms', 'rules', 'custom', 'players', 'lang', 'sync'] as const;
const FEATURE_ICONS: Record<(typeof FEATURES)[number], string> = {
  rooms: '🔐',
  rules: '♟',
  custom: '⚙',
  players: '👥',
  lang: '🌐',
  sync: '⚡',
};

export function HomePage() {
  const { t, user, firebaseReady, isGuestUser } = useApp();
  const navigate = useNavigate();

  const handleGuest = async () => {
    if (!firebaseReady) return;
    if (!user) await signInAsGuest();
    navigate('/create');
  };

  const displayName =
    user?.displayName || (isGuestUser ? 'Guest' : user?.email?.split('@')[0]) || 'Player';
<<<<<<< HEAD

  return (
    <PageFrame variant="marketing">
      {!firebaseReady && (
        <Alert variant="warn" className="mb-6 rounded-xl">
          <p className="font-medium">{t('game.firebaseMissing')}</p>
          <p className="text-xs mt-1 opacity-80">{t('game.firebaseMissingMessage')}</p>
        </Alert>
      )}

      <section className="landing-hero relative">
        <p className="relative text-xs uppercase tracking-[0.2em] text-gold-500/90 font-semibold mb-3">
          Obaida Classic · Online
        </p>
        <h1 className="relative text-4xl md:text-5xl font-bold text-gold-300 mb-4">{t('app.name')}</h1>
        <p className="relative text-base md:text-lg text-cream-200/75 max-w-lg mx-auto mb-8">
          {t('app.tagline')}
        </p>

        <div className="relative flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto mb-6">
          <Link to="/create" className="btn-primary flex-1 text-center py-3.5">
            {t('home.createTable')}
          </Link>
          <Link to="/join" className="btn-secondary flex-1 text-center py-3.5">
            {t('home.joinTable')}
          </Link>
        </div>

        {user ? (
          <p className="relative text-sm text-cream-200/70">
            {t('home.signedIn', { name: displayName })}
            {!isGuestUser && (
              <>
                {' · '}
                <Link to="/profile" className="text-gold-400 hover:text-gold-300">
                  {t('home.profile')}
                </Link>
              </>
            )}
          </p>
        ) : (
          <div className="relative flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link to="/auth" className="btn-secondary py-2 px-5">
              {t('home.login')}
            </Link>
            <Button variant="ghost" onClick={handleGuest}>
              {t('home.guest')}
            </Button>
          </div>
        )}

        <div className="landing-board-preview" aria-hidden />
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((key) => (
          <article key={key} className="feature-tile">
            <span className="feature-tile__icon" aria-hidden>
              {FEATURE_ICONS[key]}
            </span>
            <div>
              <h3 className="font-semibold text-gold-300 text-sm mb-1">
                {t(`home.feature.${key}`)}
              </h3>
              <p className="text-xs text-cream-200/55 leading-relaxed">
                {t(`home.feature.${key}.desc`)}
=======

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

      <section className="home-hero text-center">
        <p className="text-xs uppercase tracking-widest text-gold-500/80 mb-2 font-medium">
          {t('app.name')}
        </p>
        <h1 className="mb-3">{t('app.name')}</h1>
        <p className="page-subtitle mx-auto mb-0">{t('app.tagline')}</p>
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
>>>>>>> origin/main
              </p>
            </div>
          </article>
        ))}
      </div>
    </PageFrame>
  );
}
