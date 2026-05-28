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
import { FormPage } from '../components/ui/FormPage';
import { FormField, TextInput, SelectInput } from '../components/ui/FormField';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';

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

      bindRoomFromRoute(code);
      navigate(`/lobby/${code}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPage title={t('create.title')} subtitle={t('create.passwordHelp')}>
      {!firebaseReady && (
        <Alert variant="warn" className="mb-4 rounded-xl text-left text-xs">
          Firebase not configured.
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('create.passwordPlaceholder')}
            maxLength={30}
          />
        </FormField>

        <FormField label={t('create.mode')} hint={t(modeHelpKey)}>
          <SelectInput value={mode} onChange={(e) => setMode(e.target.value as GameMode)}>
            <option value="4p_teams">{t('create.mode.4p')}</option>
            <option value="3p_solo">{t('create.mode.3p')}</option>
            <option value="2p_solo">{t('create.mode.2p')}</option>
          </SelectInput>
        </FormField>

        <FormField
          label={t('create.ruleset')}
          hint={
            rulesetType === 'obaida_classic'
              ? t('create.rulesetHelp.classic')
              : t('create.rulesetHelp.custom')
          }
        >
          <SelectInput
            value={rulesetType}
            onChange={(e) => setRulesetType(e.target.value as RulesetType)}
          >
            <option value="obaida_classic">{t('create.ruleset.classic')}</option>
            <option value="custom">{t('create.ruleset.custom')}</option>
          </SelectInput>
        </FormField>

        {rulesetType === 'custom' && (
          <>
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
          </>
        )}

        <label className="flex items-center gap-2 cursor-pointer pt-1">
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

        {error && (
          <Alert variant="error" className="rounded-xl text-left text-sm">
            {error}
          </Alert>
        )}

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
          {loading ? t('general.loading') : t('create.submit')}
        </Button>
      </form>
    </FormPage>
  );
}
