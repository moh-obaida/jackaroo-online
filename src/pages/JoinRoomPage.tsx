import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { getLobbySeatInfo, joinRoom } from '../lib/firebase/rooms';
import { getAuthUserOrCurrent, logOut, signInAsGuest } from '../lib/firebase/auth';
import { FormPage } from '../components/ui/FormPage';
import { FormField, TextInput } from '../components/ui/FormField';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { validateDisplayName } from '../lib/player/displayName';

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
  const [joinStage, setJoinStage] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !password.trim()) {
      setError(t('join.error.fillFields'));
      return;
    }

    const nameCheck = validateDisplayName(name);
    if (!nameCheck.ok) {
      setError(t(nameCheck.errorKey));
      return;
    }

    if (!firebaseReady) {
      setError(t('join.error.firebase'));
      return;
    }

    setLoading(true);
    setError('');
    setJoinStage(t('join.stage.auth'));

    try {
      let currentUser = user ?? getAuthUserOrCurrent();
      if (!currentUser) {
        currentUser = await signInAsGuest();
      }
      currentUser = currentUser ?? getAuthUserOrCurrent();

      if (!currentUser) {
        setError('Failed to authenticate. Try again or disable strict storage blocking.');
        return;
      }

      let joinUid = currentUser.uid;
      let joinGuest = currentUser.isAnonymous;

      setJoinStage(t('join.stage.checking'));
      const seatInfo = await getLobbySeatInfo(code.trim(), joinUid);
      const trimmedName = nameCheck.value;
      const sameGuestRejoin =
        seatInfo.inRoom && seatInfo.existingPlayerName?.trim() === trimmedName;
      const needsFreshGuest =
        joinGuest &&
        !sameGuestRejoin &&
        seatInfo.seatCount > 0 &&
        seatInfo.seatCount < seatInfo.maxPlayers;

      if (needsFreshGuest) {
        await logOut();
        const fresh = await signInAsGuest();
        if (!fresh) {
          setError('Failed to start a new guest session for this join.');
          return;
        }
        joinUid = fresh.uid;
        joinGuest = true;
        currentUser = fresh;
      }

      const result = await joinRoom({
        code: code.trim(),
        password: password.trim(),
        playerUid: joinUid,
        playerName: name.trim(),
        playerGuest: joinGuest,
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
      setJoinStage(null);
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

        {joinStage && loading && (
          <p className="text-xs text-cream-200/60 text-center" role="status">
            {joinStage}
          </p>
        )}

        {error && (
          <Alert variant="error" className="rounded-xl text-left text-sm">
            {error}
          </Alert>
        )}

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
          {loading ? joinStage || t('general.loading') : t('join.submit')}
        </Button>
      </form>
    </FormPage>
  );
}
