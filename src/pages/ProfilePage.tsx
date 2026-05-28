import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  getCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
} from '../lib/firebase/rooms';
import { CustomRulesConfig, DEFAULT_CUSTOM_RULES } from '../types/game';
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
      <div className="page-shell flex flex-col items-center justify-center">
        <div className="card-container text-center max-w-md w-full">
          <p className="text-cream-200/70 mb-2">{t('custom.guestSave')}</p>
          <p className="text-sm text-cream-200/50 mb-4">{t('auth.guestNote')}</p>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => navigate('/auth')} className="btn-primary">
              {t('nav.login')}
            </button>
            <BackHomeButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell max-w-4xl">
      <div className="mb-6">
        <BackHomeButton />
      </div>
      <h1 className="page-title">{t('profile.title')}</h1>

      <div className="card-container mb-6">
        <p className="text-cream-200/80 font-medium">
          {user?.displayName || user?.email || 'User'}
        </p>
        <p className="helper-text">{user?.email}</p>
      </div>

      {/* Custom Templates */}
      <div className="card-container mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-200">{t('profile.templates')}</h2>
          <button onClick={handleCreateTemplate} className="btn-primary text-sm px-4 py-2">
            {t('profile.createTemplate')}
          </button>
        </div>

        {Object.keys(templates).length === 0 && !editingTemplate && (
          <p className="text-gray-500 text-sm">{t('profile.noTemplates')}</p>
        )}

        {/* Template List */}
        <div className="space-y-2">
          {Object.entries(templates).map(([id, config]) => (
            <div key={id} className="flex items-center justify-between p-3 bg-board-dark rounded-lg">
              <span className="text-gray-200">{config.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingTemplate({ id, config })}
                  className="text-xs text-gold-400 hover:text-gold-300"
                >
                  {t('profile.editTemplate')}
                </button>
                <button
                  onClick={() => handleDuplicate(id, config)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  {t('profile.duplicateTemplate')}
                </button>
                <button
                  onClick={() => handleDeleteTemplate(id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  {t('profile.deleteTemplate')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Template Editor */}
        {editingTemplate && (
          <div className="mt-4 p-4 bg-surface-inset/60 rounded-xl border border-wood-700/60">
            <p className="text-xs text-amber-300/90 border border-amber-700/40 rounded-lg px-2 py-1.5 mb-3">
              {t('custom.notice')}
            </p>
            <h3 className="text-sm font-semibold text-gold-300 mb-3">{t('custom.title')}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('custom.name')}</label>
                <input
                  type="text"
                  value={editingTemplate.config.name}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      config: { ...editingTemplate.config, name: e.target.value },
                    })
                  }
                  className="input-field text-sm"
                />
              </div>

              {/* Toggle Options */}
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
                  <span className="text-sm text-cream-200/80">{t(labelKey)}{futureOnly ? (<span className="text-[10px] text-amber-300/80 ms-1"> {t('custom.futureToggle')}</span>) : null}</span>
                </label>
              ))}

              {editingTemplate.config.timerEnabled && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">{t('custom.timerSeconds')}</label>
                  <input
                    type="number"
                    value={editingTemplate.config.timerSeconds}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        config: { ...editingTemplate.config, timerSeconds: parseInt(e.target.value) || 60 },
                      })
                    }
                    className="input-field text-sm w-24"
                    min={10}
                    max={300}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button onClick={handleSaveTemplate} disabled={loading} className="btn-primary text-sm px-4 py-2">
                  {t('custom.save')}
                </button>
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  {t('custom.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Match History Placeholder */}
      <div className="card-container">
        <h2 className="text-lg font-semibold text-cream-200/90 mb-2">{t('profile.history')}</h2>
        <p className="text-cream-200/45 text-sm">{t('profile.historyPlaceholder')}</p>
      </div>
    </div>
  );
}
