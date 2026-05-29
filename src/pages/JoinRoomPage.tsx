import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { getLobbySeatInfo, joinRoom } from '../lib/firebase/rooms';
import { getAuthUserOrCurrent, logOut, signInAsGuest } from '../lib/firebase/auth';
import { PageFrame } from '../components/ui/PageFrame';
import { FormField, TextInput } from '../components/ui/FormField';
import { Alert } from '../components/ui/Alert';
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

      if (!currentUser) {
        setError('Failed to authenticate.');
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
          setError('Failed to start a new guest session.');
          return;
        }
        joinUid = fresh.uid;
        joinGuest = true;
        currentUser = fresh;
      }

      setJoinStage(t('join.stage.takingSeat') || 'Taking your seat...');
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
    <PageFrame variant="form">
      <div className="page-center p-0">
        <div className="panel narrow p-8 bg-panel-donor border-donor rounded-[22px] shadow-donor">
          <Link to="/" className="text-gold-400 hover:text-gold-300 mb-6 inline-block text-sm">
            ← {t('general.back') || 'Back'}
          </Link>
          
          <h1 className="text-3xl font-bold text-gold-300 mb-2 text-center">
            {t('join.title')}
          </h1>
          <p className="text-cream-200/50 mb-8 text-center text-sm">
            Enter the table code and password to join.
          </p>

          {!firebaseReady && (
            <Alert variant="warn" className="mb-6 rounded-xl text-left text-xs">
              Firebase not configured.
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label={t('join.code')}>
              <TextInput
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="code-input-donor"
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
                className="input-donor"
              />
            </FormField>

            <FormField label={t('join.name')}>
              <TextInput
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('join.namePlaceholder')}
                maxLength={20}
                className="input-donor"
              />
            </FormField>

            {joinStage && loading && (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="spinner-donor" />
                <p className="text-xs text-gold-500/80 animate-pulse font-medium">
                  {joinStage}
                </p>
              </div>
            )}

            {error && (
              <Alert variant="error" className="rounded-xl text-left text-sm">
                {error}
              </Alert>
            )}

            <button 
              type="submit" 
              className="btn-game-primary w-full py-4 text-lg" 
              disabled={loading}
            >
              {loading ? t('general.loading') : t('join.submit')}
            </button>
          </form>
        </div>
      </div>
    </PageFrame>
  );
}
