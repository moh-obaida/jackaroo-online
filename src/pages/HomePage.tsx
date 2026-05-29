import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { signInAsGuest } from '../lib/firebase/auth';
import { PageFrame } from '../components/ui/PageFrame';
import { Alert } from '../components/ui/Alert';
import { JackarooBoardPreview } from '../components/home/JackarooBoardPreview';
import { HomeFeatureIcon, HomeFeatureKey } from '../components/home/HomeFeatureIcon';
import { CardGuideModal } from '../components/cards/CardGuideModal';
import { getCardGuideActionKeys, getCardGuideTitleKey } from '../lib/game/cardGuide';
import { CardRank } from '../types/game';

const FEATURES: HomeFeatureKey[] = ['tables', 'classic', 'turns', 'custom', 'lang', 'players'];

const HOW_STEPS = ['step1', 'step2', 'step3'] as const;

const RULE_PREVIEW_RANKS: CardRank[] = ['A', 'K', 'Q', 'J', '7', '5', '4'];

const FAQ_ITEMS = [
  { q: 'home.faq.q.guest', a: 'home.faq.a.guest' },
  { q: 'home.faq.q.cards', a: 'home.faq.a.cards' },
  { q: 'home.faq.q.arabic', a: 'home.faq.a.arabic' },
  { q: 'home.faq.q.custom', a: 'home.faq.a.custom' },
  { q: 'home.faq.q.classic', a: 'home.faq.a.classic' },
] as const;

const SECTION_SCROLL =
  'scroll-mt-[4.75rem] md:scroll-mt-[5.25rem] max-w-[1180px] mx-auto px-4 sm:px-6 w-full min-w-0';

export function HomePage() {
  const { t, user, firebaseReady, isGuestUser } = useApp();
  const navigate = useNavigate();
  const [rulesGuideOpen, setRulesGuideOpen] = useState(false);

  const handleGuest = async () => {
    if (!firebaseReady) return;
    if (!user) await signInAsGuest();
    navigate('/create');
  };

  const displayName =
    user?.displayName || (isGuestUser ? 'Guest' : user?.email?.split('@')[0]) || 'Player';

  const brandParts = t('app.name').trim().split(/\s+/);
  const titlePrimary = brandParts[0] ?? t('app.name');
  const titleSecondary = brandParts.slice(1).join(' ');

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const el = document.getElementById(hash);
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

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

      <main
        className="home-hero-donor scroll-mt-[4.75rem] md:scroll-mt-[5.25rem]"
        id="play"
      >
        <section className="hero-copy-donor">
          <p className="landing-hero__eyebrow mb-4">{t('home.eyebrow')}</p>

          <h1 className="hero-title-donor">
            <span className="hero-title-donor__line">{titlePrimary}</span>
            {titleSecondary ? (
              <span className="hero-title-donor__line hero-title-donor__line--accent">{titleSecondary}</span>
            ) : null}
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

      <section id="how-it-works" className={`home-section ${SECTION_SCROLL} pb-8`}>
        <header className="home-section__header">
          <h2 className="home-section__title">{t('home.how.title')}</h2>
        </header>
        <ol className="home-steps">
          {HOW_STEPS.map((step, index) => (
            <li key={step} className="home-step">
              <span className="home-step__num" aria-hidden="true">
                {index + 1}
              </span>
              <div className="min-w-0">
                <h3 className="home-step__title">{t(`home.how.${step}.title`)}</h3>
                <p className="home-step__desc">{t(`home.how.${step}.desc`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="features" className={`home-section ${SECTION_SCROLL} pb-8`}>
        <header className="home-section__header">
          <h2 className="home-section__title">{t('home.features.title')}</h2>
          <p className="home-section__subtitle">{t('home.features.subtitle')}</p>
        </header>
        <div className="feature-grid-donor home-features-grid !mt-0 !max-w-none">
          {FEATURES.map((key) => (
            <article key={key} className="feature-card-donor">
              <div className="feature-card-icon">
                <HomeFeatureIcon feature={key} />
              </div>
              <div className="min-w-0">
                <h3 className="feature-card-title">{t(`home.feature.${key}`)}</h3>
                <p className="feature-card-desc">{t(`home.feature.${key}.desc`)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="rules" className={`home-section ${SECTION_SCROLL} pb-8`}>
        <header className="home-section__header">
          <h2 className="home-section__title">{t('home.rules.title')}</h2>
          <p className="home-section__subtitle">{t('home.rules.subtitle')}</p>
        </header>
        <ul className="home-rules-grid">
          {RULE_PREVIEW_RANKS.map((rank) => {
            const actionKeys = getCardGuideActionKeys(rank);
            const summaryKey = actionKeys[0];
            return (
              <li key={rank}>
                <article className="home-rule-card">
                  <span className="home-rule-card__rank" aria-hidden="true">
                    {rank}
                  </span>
                  <div className="min-w-0">
                    <h3 className="home-rule-card__title">{t(getCardGuideTitleKey(rank))}</h3>
                    {summaryKey ? (
                      <p className="home-rule-card__desc">{t(summaryKey)}</p>
                    ) : null}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
        <div className="home-section__actions">
          <button
            type="button"
            className="btn-game-secondary px-6 py-3"
            onClick={() => setRulesGuideOpen(true)}
          >
            {t('home.rules.viewFull')}
          </button>
        </div>
      </section>

      <section id="faq" className={`home-section ${SECTION_SCROLL} pb-8`}>
        <header className="home-section__header">
          <h2 className="home-section__title">{t('home.faq.title')}</h2>
        </header>
        <dl className="home-faq">
          {FAQ_ITEMS.map(({ q, a }) => (
            <div key={q} className="home-faq__item">
              <dt className="home-faq__q">{t(q)}</dt>
              <dd className="home-faq__a">{t(a)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="home-footer">
        <div className={`home-footer__inner ${SECTION_SCROLL}`}>
          <p className="home-footer__brand">{t('app.name')}</p>
          <nav className="home-footer__nav" aria-label={t('nav.main')}>
            <a href="#play">{t('home.footer.play')}</a>
            <a href="#rules">{t('home.footer.rules')}</a>
            <a href="#features">{t('home.footer.features')}</a>
          </nav>
          <p className="home-footer__lang">{t('home.footer.langNote')}</p>
          <p className="home-footer__copy">{t('home.footer.copyright')}</p>
        </div>
      </footer>

      <CardGuideModal open={rulesGuideOpen} onClose={() => setRulesGuideOpen(false)} />
    </PageFrame>
  );
}
