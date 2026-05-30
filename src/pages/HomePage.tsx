import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { signInAsGuest } from '../lib/firebase/auth';
import { PageFrame } from '../components/ui/PageFrame';
import { Alert } from '../components/ui/Alert';
import { JackarooBoardPreview } from '../components/home/JackarooBoardPreview';
import { HomeExploreLinks } from '../components/marketing/HomeExploreLinks';
import { MarketingFooter } from '../components/marketing/MarketingFooter';

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
    <PageFrame variant="marketing" className="home-page p-0">
      {!firebaseReady && (
        <div className="px-4 pt-4">
          <Alert variant="warn" className="rounded-xl shrink-0 text-xs py-2">
            <p className="font-medium">{t('game.firebaseMissing')}</p>
            <p className="text-xs mt-0.5 opacity-80">{t('game.firebaseMissingMessage')}</p>
          </Alert>
        </div>
      )}

      <main className="home-hero-donor">
        <section className="hero-copy-donor">
          <p className="landing-hero__eyebrow mb-4">{t('home.eyebrow')}</p>

          <h1 className="hero-title-donor">
            <span className="hero-title-donor__word">Jakaroo</span>
            <span className="hero-title-donor__word hero-title-donor__word--accent">Online</span>
          </h1>

          <p className="hero-subtitle-donor">{t('app.tagline')}</p>

          <div className="hero-actions-donor">
            <Link to="/create" className="btn-game-primary px-8 py-4 text-lg">
              {t('home.createTable')}
            </Link>
            <Link to="/join" className="btn-game-secondary px-8 py-4 text-lg">
              {t('home.joinTable')}
            </Link>
          </div>

          <div className="hero-meta-donor mt-6">
            {user ? (
              <p className="text-sm text-cream-200/70">
                {t('home.signedIn', { name: displayName })}
                {!isGuestUser && (
                  <>
                    {' · '}
                    <Link to="/profile" className="text-gold-400 hover:text-gold-300 underline decoration-gold-500/30">
                      {t('home.profile')}
                    </Link>
                  </>
                )}
              </p>
            ) : (
              <div className="flex items-center gap-3 text-sm">
                <Link to="/auth" className="text-gold-400 hover:text-gold-300 underline decoration-gold-500/30">
                  {t('home.login')}
                </Link>
                <span className="text-cream-200/30">·</span>
                <button
                  type="button"
                  onClick={handleGuest}
                  className="text-cream-200/60 hover:text-cream-100 transition-colors"
                >
                  {t('home.guest')}
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="hero-board-donor">
          <div className="hero-board-wrapper">
            <JackarooBoardPreview variant="hero" />
          </div>
        </section>
      </main>

      <div className="marketing-page__footer-inner max-w-[1180px] mx-auto px-4 sm:px-6 w-full">
        <HomeExploreLinks />
      </div>

      <MarketingFooter />
    </PageFrame>
  );
}
