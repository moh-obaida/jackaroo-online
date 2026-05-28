import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { createRoom, getCustomTemplates } from '../lib/firebase/rooms';
import { signInAsGuest } from '../lib/firebase/auth';
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
import { BoardPreviewVisual } from '../components/board/boardVisual';

const MODES: { value: GameMode; key: '2p' | '3p' | '4p'; seats: number }[] = [
  { value: '2p_solo', key: '2p', seats: 2 },
  { value: '3p_solo', key: '3p', seats: 3 },
  { value: '4p_teams', key: '4p', seats: 4 },
];

function ModeSeatDiagram({ seats }: { seats: number }) {
  const dots =
    seats === 2
      ? [{ t: '12%', l: '50%' }, { t: '82%', l: '50%' }]
      : seats === 3
        ? [
            { t: '10%', l: '50%' },
            { t: '75%', l: '22%' },
            { t: '75%', l: '78%' },
          ]
        : [
            { t: '8%', l: '50%' },
            { t: '50%', l: '88%' },
            { t: '82%', l: '50%' },
            { t: '50%', l: '12%' },
          ];

  return (
    <span className="create-mode-card__diagram" aria-hidden>
      <span className="create-mode-card__felt" />
      {dots.map((d, i) => (
        <span
          key={i}
          className="create-mode-card__dot"
          style={{ top: d.t, left: d.l }}
        />
      ))}
    </span>
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
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<Record<string, CustomRulesConfig>>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const modeHelpKey =
    mode === '2p_solo' ? 'create.modeHelp.2p' : mode === '3p_solo' ? 'create.modeHelp.3p' : 'create.modeHelp.4p';

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
    if (!name.trim() || !password.trim()) {
      setError('Please fill all fields');
      return;
    }

    if (!firebaseReady) {
      setError('Firebase is not configured. Add environment variables first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let currentUser = user;
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

      const code = await createRoom({
        roomMakerUid: currentUser.uid,
        roomMakerName: name.trim(),
        roomMakerGuest: currentUser.isAnonymous,
        password: password.trim(),
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
      <Panel title={t('create.title')} subtitle={t('create.passwordHelp')} glow className="create-setup-panel">
        {!firebaseReady && (
          <Alert variant="warn" className="mb-4 rounded-xl text-left text-xs">
            Firebase not configured.
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="create-setup">
          <div className="create-setup__preview">
            <BoardPreviewVisual size={200} />
          </div>

          <div className="create-setup__fields">
            <FormField label={t('create.name')}>
              <TextInput
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('create.namePlaceholder')}
                maxLength={20}
              />
            </FormField>

            <FormField label={t('create.password')} hint={t('create.passwordHelp')}>
              <TextInput
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('create.passwordPlaceholder')}
                maxLength={30}
                className="create-invite-input"
              />
            </FormField>

            <fieldset className="create-fieldset">
              <legend className="create-fieldset__legend">{t('create.mode')}</legend>
              <p className="create-fieldset__hint">{t(modeHelpKey)}</p>
              <div className="create-mode-cards">
                {MODES.map(({ value, key, seats }) => (
                  <button
                    key={value}
                    type="button"
                    className={`create-mode-card ${mode === value ? 'create-mode-card--selected' : ''}`}
                    onClick={() => setMode(value)}
                    aria-pressed={mode === value}
                  >
                    <ModeSeatDiagram seats={seats} />
                    <span className="create-mode-card__label">{t(`create.mode.${key}`)}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="create-fieldset">
              <legend className="create-fieldset__legend">{t('create.ruleset')}</legend>
              <div className="create-ruleset-cards">
                <button
                  type="button"
                  className={`create-ruleset-card ${
                    rulesetType === 'obaida_classic' ? 'create-ruleset-card--selected' : ''
                  }`}
                  onClick={() => setRulesetType('obaida_classic')}
                  aria-pressed={rulesetType === 'obaida_classic'}
                >
                  <span className="create-ruleset-card__title">{t('create.ruleset.classic')}</span>
                  <span className="create-ruleset-card__desc">{t('create.rulesetHelp.classic')}</span>
                </button>
                <button
                  type="button"
                  className={`create-ruleset-card ${
                    rulesetType === 'custom' ? 'create-ruleset-card--selected' : ''
                  }`}
                  onClick={() => setRulesetType('custom')}
                  aria-pressed={rulesetType === 'custom'}
                >
                  <span className="create-ruleset-card__title">{t('create.ruleset.custom')}</span>
                  <span className="create-ruleset-card__desc">{t('create.rulesetHelp.custom')}</span>
                </button>
              </div>
            </fieldset>

            {rulesetType === 'custom' && (
              <div className="create-custom-block">
                <Alert variant="warn" className="rounded-xl text-xs text-left">
                  {t('custom.notice')}
                </Alert>
                {isGuestUser ? (
                  <p className="text-xs text-amber-300/80">{t('custom.guestSave')}</p>
                ) : (
                  <FormField label={t('create.template')}>
                    <SelectInput
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="text-sm"
                    >
                      {Object.keys(customTemplates).length === 0 ? (
                        <option value="">{t('create.templateDefault')}</option>
                      ) : (
                        Object.entries(customTemplates).map(([id, config]) => (
                          <option key={id} value={id}>
                            {config.name}
                          </option>
                        ))
                      )}
                    </SelectInput>
                  </FormField>
                )}
              </div>
            )}

            <details
              className="create-advanced"
              open={advancedOpen}
              onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}
            >
              <summary className="create-advanced__summary">{t('create.advanced')}</summary>
              <div className="create-advanced__body">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={botsEnabled}
                    onChange={(e) => setBotsEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-wood-500 bg-surface-inset text-gold-500 focus:ring-gold-500/30"
                  />
                  <span className="text-sm text-cream-200/80">{t('create.bots')}</span>
                </label>

                {botsEnabled && (
                  <FormField label={t('create.botDifficulty')}>
                    <SelectInput
                      value={botDifficulty}
                      onChange={(e) => setBotDifficulty(e.target.value as BotDifficulty)}
                    >
                      <option value="very_easy">{t('create.botDifficulty.veryEasy')}</option>
                      <option value="easy">{t('create.botDifficulty.easy')}</option>
                      <option value="normal">{t('create.botDifficulty.normal')}</option>
                      <option value="hard">{t('create.botDifficulty.hard')}</option>
                      <option value="very_hard">{t('create.botDifficulty.veryHard')}</option>
                    </SelectInput>
                  </FormField>
                )}
              </div>
            </details>

            {error && (
              <Alert variant="error" className="rounded-xl text-left text-sm">
                {error}
              </Alert>
            )}

            <button type="submit" className="btn-game-primary create-setup__submit" disabled={loading}>
              {loading ? t('general.loading') : t('create.submitTable')}
            </button>
          </div>
        </form>
      </Panel>
    </PageFrame>
  );
}
