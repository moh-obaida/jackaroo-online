import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { joinRoom } from '../lib/firebase/rooms';
import { signInAsGuest } from '../lib/firebase/auth';
import { FormPage } from '../components/ui/FormPage';
import { FormField, TextInput } from '../components/ui/FormField';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';

function mapJoinError(message: string, t: (key: string) => string): string {
  const lower = message.toLowerCase();
  if (lower.includes('not found')) return t('join.error.notFound');
  if (lower.includes('expired')) return t('join.error.expired');
  if (lower.includes('password') || lower.includes('incorrect')) return t('join.error.wrongPassword');
  if (lower.includes('full')) return t('join.error.full');
  if (lower.includes('progress') || lower.includes('started')) return t('join.error.inProgress');
  return message;
}

export function JoinRoomPage() {
  const { t, user, firebaseReady } = useApp();
  const { bindRoomFromRoute } = useGame();
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

      bindRoomFromRoute(code.trim(), { allowRejoin: true });
      navigate(`/lobby/${code.trim()}`);
    } catch (err: any) {
      setError(mapJoinError(err.message || 'Failed to join room', t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPage title={t('join.title')} subtitle={t('create.passwordHelp')}>
      {!firebaseReady && (
        <Alert variant="warn" className="mb-4 rounded-xl text-left text-xs">
          Firebase not configured.
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label={t('join.code')}>
          <TextInput
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder={t('join.codePlaceholder')}
            className="text-center text-xl tracking-normal tabular-nums font-mono"
            maxLength={6}
            inputMode="numeric"
            autoComplete="off"
          />
        </FormField>

        <FormField label={t('join.password')}>
          <TextInput
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('join.passwordPlaceholder')}
          />
        </FormField>

        <FormField label={t('join.name')}>
          <TextInput
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('join.namePlaceholder')}
            maxLength={20}
          />
        </FormField>

        {error && (
          <Alert variant="error" className="rounded-xl text-left text-sm">
            {error}
          </Alert>
        )}

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
          {loading ? t('general.loading') : t('join.submit')}
        </Button>
      </form>
    </FormPage>
  );
}
