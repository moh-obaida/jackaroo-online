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
import { Panel } from '../components/ui/Panel';
import { FormField, TextInput, SelectInput } from '../components/ui/FormField';
import { Alert } from '../components/ui/Alert';
import { validateDisplayName } from '../lib/player/displayName';

const MODES: { value: GameMode; key: '2p' | '3p' | '4p'; seats: number }[] = [
  { value: '2p_solo', key: '2p', seats: 2 },
  { value: '3p_solo', key: '3p', seats: 3 },
  { value: '4p_teams', key: '4p', seats: 4 },
];

function SeatDiagram({ mode }: { mode: '2p' | '3p' | '4p' }) {
  return (
    <div className={`seat-diagram diagram-${mode}`}>
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
  const [botsEnabled, setBotsEnabled] = useState(false);
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('very_easy');
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
      setError('Firebase is not configured.');
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
      const message = err instanceof Error ? err.message : 'Failed to create room';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageFrame variant="form">
      <main className="setup-page p-0">
        <div className="setup-card border-0 shadow-none bg-transparent p-0">
          <Link to="/" className="text-gold-400 hover:text-gold-300 mb-4 inline-block text-sm">
            ← {t('general.back') || 'Back'}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gold-300 mb-2">
            {t('create.title')}
          </h1>
          <p className="text-cream-200/60 mb-8">
            Set up your private Jackaroo table.
          </p>

          <form onSubmit={handleSubmit} className="setup-grid">
            <div className="setup-preview">
              <SeatDiagram mode={activeModeKey} />
              <p className="mt-4 text-sm text-cream-200/80">
                {t(`create.modeHelp.${activeModeKey}`)}
              </p>
            </div>

            <div className="setup-fields">
              <fieldset>
                <legend>{t('create.identity') || 'Player Identity'}</legend>
                <FormField label={t('create.name')}>
                  <TextInput
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('create.namePlaceholder')}
                    maxLength={20}
                  />
                </FormField>
              </fieldset>

              <fieldset>
                <legend>{t('create.access') || 'Private Table Access'}</legend>
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
              </fieldset>

              <fieldset>
                <legend>{t('create.mode')}</legend>
                <div className="mode-grid">
                  {MODES.map(({ value, key }) => (
                    <button
                      key={value}
                      type="button"
                      className={`mode-card ${mode === value ? 'active' : ''}`}
                      onClick={() => setMode(value)}
                    >
                      <SeatDiagram mode={key} />
                      <strong className="mt-2">{t(`create.mode.${key}`)}</strong>
                      <small className="text-[10px] opacity-60">{t(`create.modeHelp.${key}`)}</small>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend>{t('create.ruleset')}</legend>
                <div className="ruleset-card-donor">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        rulesetType === 'obaida_classic' 
                          ? 'bg-gold-500 text-board-dark shadow-lg shadow-gold-500/20' 
                          : 'bg-black/20 text-cream-200/60 hover:bg-black/40'
                      }`}
                      onClick={() => setRulesetType('obaida_classic')}
                    >
                      {t('create.ruleset.classic')}
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        rulesetType === 'custom' 
                          ? 'bg-gold-500 text-board-dark shadow-lg shadow-gold-500/20' 
                          : 'bg-black/20 text-cream-200/60 hover:bg-black/40'
                      }`}
                      onClick={() => setRulesetType('custom')}
                    >
                      {t('create.ruleset.custom')}
                    </button>
                  </div>
                  
                  <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                    <p className="text-xs text-cream-200/70 leading-relaxed">
                      {rulesetType === 'obaida_classic' 
                        ? t('create.rulesetHelp.classic')
                        : t('create.rulesetHelp.custom')}
                    </p>
                  </div>
                </div>
              </fieldset>

              {error && (
                <Alert variant="error" className="rounded-xl text-left text-sm">
                  {error}
                </Alert>
              )}

              <button 
                type="submit" 
                className="btn-game-primary w-full py-4 text-lg mt-4" 
                disabled={loading}
              >
                {loading ? t('general.loading') : t('create.submitTable')}
              </button>
            </div>
          </form>
        </div>
      </main>
    </PageFrame>
  );
}
