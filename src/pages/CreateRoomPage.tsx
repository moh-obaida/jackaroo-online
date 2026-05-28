import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { createRoom, getCustomTemplates } from '../lib/firebase/rooms';
import { signInAsGuest } from '../lib/firebase/auth';
import { GameMode, RulesetType, BotDifficulty, BotSettings, CustomRulesConfig, DEFAULT_CUSTOM_RULES } from '../types/game';

export function CreateRoomPage() {
  const { t, user, language, theme, firebaseReady, isGuestUser } = useApp();
  const { setRoomCode } = useGame();
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
          ? (selectedTemplateId ? customTemplates[selectedTemplateId] : DEFAULT_CUSTOM_RULES)
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
            : (selectedTemplateId || 'custom_default'),
        customRulesSummary: selectedTemplate,
        botSettings,
        language,
        theme,
      });

      setRoomCode(code);
      navigate(`/lobby/${code}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="card-container w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gold-400 mb-6">{t('create.title')}</h1>

        {!firebaseReady && (
          <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-600 rounded-lg">
            <p className="text-yellow-200 text-xs">
              Firebase not configured. Room creation requires Firebase environment variables.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t('create.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('create.namePlaceholder')}
              className="input-field"
              maxLength={20}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t('create.password')}
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('create.passwordPlaceholder')}
              className="input-field"
              maxLength={30}
            />
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t('create.mode')}
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as GameMode)}
              className="select-field"
            >
              <option value="4p_teams">{t('create.mode.4p')}</option>
              <option value="3p_solo">{t('create.mode.3p')}</option>
              <option value="2p_solo">{t('create.mode.2p')}</option>
            </select>
          </div>

          {/* Ruleset */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t('create.ruleset')}
            </label>
            <select
              value={rulesetType}
              onChange={(e) => setRulesetType(e.target.value as RulesetType)}
              className="select-field"
            >
              <option value="obaida_classic">{t('create.ruleset.classic')}</option>
              <option value="custom">{t('create.ruleset.custom')}</option>
            </select>
            {rulesetType === 'custom' && (
              <>
                <p className="mt-1 text-xs text-yellow-400">{t('create.customLabel')}</p>
                {!isGuestUser && (
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Custom template
                    </label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="select-field text-sm"
                    >
                      {Object.keys(customTemplates).length === 0 ? (
                        <option value="">Default custom rules</option>
                      ) : (
                        Object.entries(customTemplates).map(([id, config]) => (
                          <option key={id} value={id}>
                            {config.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bots */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={botsEnabled}
                onChange={(e) => setBotsEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-wood-500 bg-board-dark text-gold-500 focus:ring-gold-500"
              />
              <span className="text-sm text-gray-300">{t('create.bots')}</span>
            </label>
          </div>

          {botsEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t('create.botDifficulty')}
              </label>
              <select
                value={botDifficulty}
                onChange={(e) => setBotDifficulty(e.target.value as BotDifficulty)}
                className="select-field"
              >
                <option value="very_easy">{t('create.botDifficulty.veryEasy')}</option>
                <option value="easy">{t('create.botDifficulty.easy')}</option>
                <option value="normal">{t('create.botDifficulty.normal')}</option>
                <option value="hard">{t('create.botDifficulty.hard')}</option>
                <option value="very_hard">{t('create.botDifficulty.veryHard')}</option>
              </select>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg"
          >
            {loading ? t('general.loading') : t('create.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
