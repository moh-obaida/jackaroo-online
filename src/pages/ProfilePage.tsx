import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  getCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
} from '../lib/firebase/rooms';
import { CustomRulesConfig, DEFAULT_CUSTOM_RULES } from '../types/game';

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
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="card-container text-center max-w-md">
          <p className="text-gray-300 mb-4">{t('auth.guestNote')}</p>
          <button onClick={() => navigate('/auth')} className="btn-primary">
            {t('nav.login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-gold-400 mb-6">{t('profile.title')}</h1>

      {/* User Info */}
      <div className="card-container mb-6">
        <p className="text-gray-300">
          {user?.displayName || user?.email || 'User'}
        </p>
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
          <div className="mt-4 p-4 bg-board-dark rounded-lg border border-wood-700">
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
              {[
                { key: 'jokerEnabled', label: t('custom.joker') },
                { key: 'queenBurnEnabled', label: t('custom.queenBurn') },
                { key: 'tenBurnEnabled', label: t('custom.tenBurn') },
                { key: 'kingPathEatingEnabled', label: t('custom.kingEating') },
                { key: 'fiveCanMoveAnyone', label: t('custom.fiveAnyone') },
                { key: 'longerTwoPlayerVariant', label: t('custom.longerTwoPlayer') },
                { key: 'timerEnabled', label: t('custom.timer') },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(editingTemplate.config as any)[key]}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        config: { ...editingTemplate.config, [key]: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded border-wood-500 bg-board-dark text-gold-500"
                  />
                  <span className="text-sm text-gray-300">{label}</span>
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
        <h2 className="text-lg font-semibold text-gray-200 mb-2">{t('profile.history')}</h2>
        <p className="text-gray-500 text-sm">{t('profile.noHistory')}</p>
      </div>
    </div>
  );
}
