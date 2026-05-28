import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { signInAsGuest } from '../lib/firebase/auth';
import { PageFrame } from '../components/ui/PageFrame';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { JakarooIcon } from '../components/brand/JakarooIcon';
import { JackarooBoardPreview } from '../components/home/JackarooBoardPreview';
import { HomeFeatureIcon, HomeFeatureKey } from '../components/home/HomeFeatureIcon';

const FEATURES: HomeFeatureKey[] = ['tables', 'classic', 'players', 'lang', 'turns', 'custom'];

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
    <PageFrame variant="marketing" className="home-page">
      {!firebaseReady && (
        <Alert variant="warn" className="mb-3 rounded-xl shrink-0 text-xs py-2">
          <p className="font-medium">{t('game.firebaseMissing')}</p>
          <p className="text-xs mt-0.5 opacity-80">{t('game.firebaseMissingMessage')}</p>
        </Alert>
      )}

      <section className="landing-hero landing-hero--jackaroo" aria-labelledby="home-hero-heading">
        <JackarooBoardPreview variant="watermark" className="landing-hero__watermark" />
        <div className="landing-hero__felt-pattern" aria-hidden />
        <span className="landing-hero__corner landing-hero__corner--tl" aria-hidden />
        <span className="landing-hero__corner landing-hero__corner--br" aria-hidden />

        <div className="landing-hero__grid">
          <div className="landing-hero__copy">
            <p className="landing-hero__eyebrow">{t('home.eyebrow')}</p>

            <div className="landing-hero__brand-mobile md:hidden flex items-center gap-3 justify-center mb-1">
              <JakarooIcon size="lg" />
              <h1 id="home-hero-heading" className="landing-hero__title landing-hero__title--mobile">
                {t('app.name')}
              </h1>
            </div>

            <h1 id="home-hero-heading" className="landing-hero__title hidden md:block">
              {t('app.name')}
            </h1>

            <p className="landing-hero__tagline">{t('app.tagline')}</p>

            <div className="landing-hero__ctas">
              <Link to="/create" className="btn-game-primary landing-hero__cta-primary">
                {t('home.createTable')}
              </Link>
              <Link to="/join" className="btn-game-secondary landing-hero__cta-secondary">
                {t('home.joinTable')}
              </Link>
            </div>

            {user ? (
              <p className="landing-hero__session text-sm text-cream-200/70">
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
              <div className="landing-hero__auth">
                <Link to="/auth" className="landing-hero__auth-link">
                  {t('home.login')}
                </Link>
                <span className="landing-hero__auth-sep" aria-hidden>
                  ·
                </span>
                <Button variant="ghost" size="sm" className="landing-hero__auth-guest" onClick={handleGuest}>
                  {t('home.guest')}
                </Button>
              </div>
            )}
          </div>

          <div className="landing-hero__board-wrap">
            <JackarooBoardPreview variant="hero" />
          </div>
        </div>
      </section>

      <div className="home-feature-grid">
        {FEATURES.map((key) => (
          <article key={key} className="feature-tile feature-tile--game">
            <span className="feature-tile__icon feature-tile__icon--svg" aria-hidden>
              <HomeFeatureIcon feature={key} />
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold text-gold-300 text-sm mb-0.5">
                {t(`home.feature.${key}`)}
              </h3>
              <p className="text-[11px] text-cream-200/55 leading-snug line-clamp-2">
                {t(`home.feature.${key}.desc`)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </PageFrame>
  );
}
