import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { createRoom, getCustomTemplates } from '../lib/firebase/rooms';
import { saveHostRoomPassword } from '../lib/room/hostRoomPassword';
import { getAuthUserOrCurrent, signInAsGuest } from '../lib/firebase/auth';
import {
  GameMode,
  RulesetType,
  BotDifficulty,
  BotSettings,
  CustomRulesConfig,
  DEFAULT_CUSTOM_RULES,
} from '../types/game';
import { PageFrame } from '../components/ui/PageFrame';
import { FormField, TextInput } from '../components/ui/FormField';
import { Alert } from '../components/ui/Alert';
import { validateDisplayName } from '../lib/player/displayName';

const MODES: { value: GameMode; key: '2p' | '3p' | '4p'; seats: number }[] = [
  { value: '2p_solo', key: '2p', seats: 2 },
  { value: '3p_solo', key: '3p', seats: 3 },
  { value: '4p_teams', key: '4p', seats: 4 },
];

function SeatDiagram({ mode }: { mode: '2p' | '3p' | '4p' }) {
  return (
    <div className={`seat-diagram diagram-${mode}`} aria-hidden>
      <span /><span /><span /><span />
    </div>
  );
}

export function CreateRoomPage() {
  const { t, user, language, theme, firebaseReady, isGuestUser } = useApp();
  const { bindRoomFromRoute } = useGame();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.displayName || '');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<GameMode>('4p_teams');
  const [rulesetType, setRulesetType] = useState<RulesetType>('obaida_classic');
  const [botsEnabled] = useState(false);
  const [botDifficulty] = useState<BotDifficulty>('very_easy');
  const [customTemplates, setCustomTemplates] = useState<Record<string, CustomRulesConfig>>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeModeKey = mode === '2p_solo' ? '2p' : mode === '3p_solo' ? '3p' : '4p';

  React.useEffect(() => {
    if (rulesetType !== 'custom' || !user || isGuestUser) return;
    let cancelled = false;
    const loadTemplates = async () => {
      const templates = await getCustomTemplates(user.uid);
      if (cancelled) return;
      setCustomTemplates(templates);
      const firstTemplateId = Object.keys(templates)[0] || '';
      setSelectedTemplateId((prev) => (prev && templates[prev] ? prev : firstTemplateId));
    };
    loadTemplates();
    return () => {
      cancelled = true;
    };
  }, [rulesetType, user, isGuestUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError(t('create.error.fillFields'));
      return;
    }
    const nameCheck = validateDisplayName(name);
    if (!nameCheck.ok) {
      setError(t(nameCheck.errorKey));
      return;
    }

    if (!firebaseReady) {
      setError(t('game.firebaseMissingMessage'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      let currentUser = user ?? getAuthUserOrCurrent();
      if (!currentUser) {
        currentUser = await signInAsGuest();
      }

      if (!currentUser) {
        setError('Failed to authenticate');
        setLoading(false);
        return;
      }

      const botSettings: BotSettings = {
        enabled: botsEnabled,
        count: 0,
        difficulty: botDifficulty,
      };

      const selectedTemplate =
        rulesetType === 'custom'
          ? selectedTemplateId
            ? customTemplates[selectedTemplateId]
            : DEFAULT_CUSTOM_RULES
          : null;

      const trimmedPassword = password.trim();
      const code = await createRoom({
        roomMakerUid: currentUser.uid,
        roomMakerName: nameCheck.value,
        roomMakerGuest: currentUser.isAnonymous,
        password: trimmedPassword,
        mode,
        rulesetType,
        rulesetId:
          rulesetType === 'obaida_classic'
            ? 'obaida_classic_v1'
            : selectedTemplateId || 'custom_default',
        customRulesSummary: selectedTemplate,
        botSettings,
        language,
        theme,
      });

      saveHostRoomPassword(code, trimmedPassword);
      bindRoomFromRoute(code, { allowRejoin: true });
      navigate(`/lobby/${code}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create table';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageFrame variant="form" className="create-page-frame">
      <main className="create-table-page">
        <Link to="/" className="create-back-link">
          ← {t('general.back')}
        </Link>

        <header className="create-page-header">
          <p className="create-eyebrow">{t('create.setupEyebrow')}</p>
          <h1>{t('create.title')}</h1>
          <p>{t('create.subtitle')}</p>
        </header>

        <form onSubmit={handleSubmit} className="create-form-stack">
          <section className="create-section-card">
            <h2>{t('create.identity')}</h2>
            <FormField label={t('create.name')}>
              <TextInput
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('create.namePlaceholder')}
                maxLength={20}
              />
            </FormField>
          </section>

          <section className="create-section-card">
            <h2>{t('create.access')}</h2>
            <FormField label={t('create.password')} hint={t('create.passwordHelp')}>
              <TextInput
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('create.passwordPlaceholder')}
                maxLength={30}
              />
            </FormField>
          </section>

          <section className="create-section-card create-section-card--mode">
            <div className="create-section-heading-row">
              <h2>{t('create.mode')}</h2>
              <p>{t(`create.modeHelp.${activeModeKey}`)}</p>
            </div>
            <div className="mode-grid mode-grid--safe">
              {MODES.map(({ value, key }) => (
                <button
                  key={value}
                  type="button"
                  className={`mode-card mode-card--safe ${mode === value ? 'active' : ''}`}
                  onClick={() => setMode(value)}
                >
                  <SeatDiagram mode={key} />
                  <strong>{t(`create.mode.${key}`)}</strong>
                  <small>{t(`create.modeHelp.${key}`)}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="create-section-card">
            <h2>{t('create.ruleset')}</h2>
            <div className="ruleset-toggle-row">
              <button
                type="button"
                className={rulesetType === 'obaida_classic' ? 'active' : ''}
                onClick={() => setRulesetType('obaida_classic')}
              >
                {t('create.ruleset.classic')}
              </button>
              <button
                type="button"
                className={rulesetType === 'custom' ? 'active' : ''}
                onClick={() => setRulesetType('custom')}
              >
                {t('create.ruleset.custom')}
              </button>
            </div>
            <p className="create-rules-help">
              {rulesetType === 'obaida_classic'
                ? t('create.rulesetHelp.classic')
                : t('create.rulesetHelp.custom')}
            </p>
          </section>

          {error && (
            <Alert variant="error" className="rounded-xl text-left text-sm">
              {error}
            </Alert>
          )}

          <button type="submit" className="btn-game-primary create-submit-button" disabled={loading}>
            {loading ? t('general.loading') : t('create.submitTable')}
          </button>
        </form>
      </main>
    </PageFrame>
  );
}
