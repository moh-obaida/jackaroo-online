import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { signInWithEmail, registerWithEmail, signInAsGuest } from '../lib/firebase/auth';
import { FormPage } from '../components/ui/FormPage';
import { FormField, TextInput } from '../components/ui/FormField';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';

export function AuthPage() {
  const { t } = useApp();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, displayName);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    await signInAsGuest();
    navigate('/');
  };

  return (
    <FormPage title={isLogin ? t('auth.login') : t('auth.register')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <FormField label={t('auth.displayName')}>
            <TextInput
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required={!isLogin}
            />
          </FormField>
        )}

        <FormField label={t('auth.email')}>
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormField>

        <FormField label={t('auth.password')}>
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </FormField>

        {!isLogin && (
          <FormField label={t('auth.confirmPassword')}>
            <TextInput
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required={!isLogin}
              minLength={6}
            />
          </FormField>
        )}

        {error && (
          <Alert variant="error" className="rounded-xl text-left text-sm">
            {error}
          </Alert>
        )}

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? t('general.loading') : t('auth.submit')}
        </Button>
      </form>

      <div className="mt-6 space-y-3 text-center border-t border-wood-800/50 pt-5">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-gold-300 hover:text-gold-200 transition-colors"
        >
          {isLogin ? t('auth.switchToRegister') : t('auth.switchToLogin')}
        </button>
        <div>
          <Button variant="ghost" size="sm" onClick={handleGuest}>
            {t('nav.guest')}
          </Button>
        </div>
      </div>
    </FormPage>
  );
}
