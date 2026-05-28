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
              </p>
            </div>
          </article>
        ))}
      </div>
    </PageFrame>
  );
}
