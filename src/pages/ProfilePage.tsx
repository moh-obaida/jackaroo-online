import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  getCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
} from '../lib/firebase/rooms';
import { CustomRulesConfig, DEFAULT_CUSTOM_RULES } from '../types/game';
import { PageFrame } from '../components/ui/PageFrame';
import { Panel } from '../components/ui/Panel';
import { FormField, TextInput } from '../components/ui/FormField';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { BackHomeButton } from '../components/common/BackHomeButton';

const CUSTOM_TOGGLES: { key: keyof CustomRulesConfig; labelKey: string; futureOnly?: boolean }[] = [
  { key: 'jokerEnabled', labelKey: 'custom.joker', futureOnly: true },
  { key: 'queenBurnEnabled', labelKey: 'custom.queenBurn' },
  { key: 'tenBurnEnabled', labelKey: 'custom.tenBurn' },
  { key: 'kingPathEatingEnabled', labelKey: 'custom.kingEating' },
  { key: 'fiveCanMoveAnyone', labelKey: 'custom.fiveAnyone' },
  { key: 'longerTwoPlayerVariant', labelKey: 'custom.longerTwoPlayer', futureOnly: true },
  { key: 'timerEnabled', labelKey: 'custom.timer', futureOnly: true },
];

export function ProfilePage() {
  const { t, user, isAuthenticated, isGuestUser } = useApp();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Record<string, CustomRulesConfig>>({});
  const [editingTemplate, setEditingTemplate] = useState<{ id: string; config: CustomRulesConfig } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || isGuestUser) return;
    loadTemplates();
  }, [user, isGuestUser]);

  const loadTemplates = async () => {
    if (!user) return;
    const data = await getCustomTemplates(user.uid);
    setTemplates(data);
  };

  const handleCreateTemplate = () => {
    const id = `template_${Date.now()}`;
    setEditingTemplate({ id, config: { ...DEFAULT_CUSTOM_RULES, name: 'New Template' } });
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate || !user) return;
    setLoading(true);
    await saveCustomTemplate(user.uid, editingTemplate.id, editingTemplate.config);
    await loadTemplates();
    setEditingTemplate(null);
    setLoading(false);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!user) return;
    await deleteCustomTemplate(user.uid, id);
    await loadTemplates();
  };

  const handleDuplicate = (id: string, config: CustomRulesConfig) => {
    const newId = `template_${Date.now()}`;
    setEditingTemplate({ id: newId, config: { ...config, name: `${config.name} (Copy)` } });
  };

  if (isGuestUser) {
    return (
      <PageFrame variant="form">
        <Panel title={t('profile.title')} glow className="text-center">
          <p className="text-cream-200/70 mb-2">{t('custom.guestSave')}</p>
          <p className="text-sm text-cream-200/50 mb-5">{t('auth.guestNote')}</p>
          <div className="flex flex-col gap-2">
            <Button variant="primary" fullWidth onClick={() => navigate('/auth')}>
              {t('nav.login')}
            </Button>
            <BackHomeButton intent="navigate" />
          </div>
        </Panel>
      </PageFrame>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <PageFrame variant="marketing" className="max-w-4xl">
      <div className="mb-5">
        <BackHomeButton intent="navigate" />
      </div>

      <Panel title={t('profile.title')} glow className="mb-6">
        <p className="text-cream-200/80 font-medium">{user?.displayName || user?.email || 'User'}</p>
        <p className="form-field__hint">{user?.email}</p>
      </Panel>

      <Panel title={t('profile.templates')} className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="sr-only">{t('profile.templates')}</span>
          <Button variant="primary" size="sm" onClick={handleCreateTemplate}>
            {t('profile.createTemplate')}
          </Button>
        </div>

        {Object.keys(templates).length === 0 && !editingTemplate && (
          <p className="text-cream-200/45 text-sm">{t('profile.noTemplates')}</p>
        )}

        <div className="space-y-2">
          {Object.entries(templates).map(([id, config]) => (
            <div
              key={id}
              className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-wood-800/50"
            >
              <span className="text-cream-200">{config.name}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTemplate({ id, config })}
                  className="text-xs text-gold-400 hover:text-gold-300"
                >
                  {t('profile.editTemplate')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicate(id, config)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  {t('profile.duplicateTemplate')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  {t('profile.deleteTemplate')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {editingTemplate && (
          <div className="mt-5 p-4 rounded-xl bg-black/25 border border-wood-700/60">
            <Alert variant="warn" className="mb-4 rounded-lg text-xs text-left">
              {t('custom.notice')}
            </Alert>
            <h3 className="text-sm font-semibold text-gold-300 mb-3">{t('custom.title')}</h3>
            <div className="space-y-3">
              <FormField label={t('custom.name')}>
                <TextInput
                  type="text"
                  value={editingTemplate.config.name}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      config: { ...editingTemplate.config, name: e.target.value },
                    })
                  }
                  className="text-sm"
                />
              </FormField>

              {CUSTOM_TOGGLES.map(({ key, labelKey, futureOnly }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingTemplate.config[key])}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        config: { ...editingTemplate.config, [key]: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded border-wood-500 bg-surface-inset text-gold-500"
                  />
                  <span className="text-sm text-cream-200/80">
                    {t(labelKey)}
                    {futureOnly ? (
                      <span className="text-[10px] text-amber-300/80 ms-1">
                        {' '}
                        {t('custom.futureToggle')}
                      </span>
                    ) : null}
                  </span>
                </label>
              ))}

              {editingTemplate.config.timerEnabled && (
                <FormField label={t('custom.timerSeconds')}>
                  <TextInput
                    type="number"
                    value={editingTemplate.config.timerSeconds}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        config: {
                          ...editingTemplate.config,
                          timerSeconds: parseInt(e.target.value, 10) || 60,
                        },
                      })
                    }
                    className="text-sm w-24"
                    min={10}
                    max={300}
                  />
                </FormField>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="primary" size="sm" onClick={handleSaveTemplate} disabled={loading}>
                  {t('custom.save')}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setEditingTemplate(null)}>
                  {t('custom.cancel')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Panel>

      <Panel title={t('profile.history')}>
        <p className="text-cream-200/45 text-sm">{t('profile.historyPlaceholder')}</p>
      </Panel>
    </PageFrame>
  );
}
