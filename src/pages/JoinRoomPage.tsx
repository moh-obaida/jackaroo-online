import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { joinRoom } from '../lib/firebase/rooms';
import { signInAsGuest } from '../lib/firebase/auth';
import { BackHomeButton } from '../components/common/BackHomeButton';

function mapJoinError(message: string, t: (key: string) => string): string {
  const lower = message.toLowerCase();
  if (lower.includes('not found')) return t('join.error.notFound');
  if (lower.includes('password') || lower.includes('incorrect')) return t('join.error.wrongPassword');
  if (lower.includes('full')) return t('join.error.full');
  if (lower.includes('progress') || lower.includes('started')) return t('join.error.inProgress');
  return message;
}

export function JoinRoomPage() {
  const { t, user, firebaseReady } = useApp();
  const { setRoomCode } = useGame();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !password.trim() || !name.trim()) {
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

      const result = await joinRoom({
        code: code.trim(),
        password: password.trim(),
        playerUid: currentUser.uid,
        playerName: name.trim(),
        playerGuest: currentUser.isAnonymous,
      });

      if (!result.success) {
        setError(mapJoinError(result.error || 'Failed to join room', t));
        return;
      }

      setRoomCode(code.trim());
      navigate(`/lobby/${code.trim()}`);
    } catch (err: any) {
      setError(mapJoinError(err.message || 'Failed to join room', t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell flex flex-col items-center">
      <div className="w-full max-w-lg mb-4">
        <BackHomeButton />
      </div>

      <div className="card-container w-full max-w-lg">
        <h1 className="page-title">{t('join.title')}</h1>
        <p className="page-subtitle">{t('create.passwordHelp')}</p>

        {!firebaseReady && (
          <div className="mb-4 p-3 bg-yellow-900/40 border border-yellow-600/60 rounded-lg">
            <p className="text-yellow-200 text-xs">Firebase not configured.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cream-200/80 mb-1">{t('join.code')}</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t('join.codePlaceholder')}
              className="input-field text-center text-xl tracking-normal tabular-nums font-mono"
              maxLength={6}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cream-200/80 mb-1">{t('join.password')}</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('join.passwordPlaceholder')}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cream-200/80 mb-1">{t('join.name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('join.namePlaceholder')}
              className="input-field"
              maxLength={20}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/30 rounded-lg px-3 py-2">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full text-lg">
            {loading ? t('general.loading') : t('join.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
