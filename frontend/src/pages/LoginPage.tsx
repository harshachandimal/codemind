import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell';
import AuthInput from '../components/auth/AuthInput';
import AuthSubmitButton from '../components/auth/AuthSubmitButton';
import AuthErrorAlert from '../components/auth/AuthErrorAlert';
import AuthSwitchLink from '../components/auth/AuthSwitchLink';
import { loginUser } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await loginUser({ email, password });
      if (response.success) {
        await refreshUser();
        navigate('/dashboard');
      }
    } catch (err: any) {
      // Could parse axios error details here if needed, but generic is fine for now
      setError('Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Login to your CodeMind account">
      <AuthErrorAlert message={error} />

      <form onSubmit={handleSubmit} className="flex flex-col">
        <AuthInput
          label="Email Address"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <AuthInput
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        <div className="mt-2">
          <AuthSubmitButton loading={loading}>Sign In</AuthSubmitButton>
        </div>
      </form>

      <AuthSwitchLink
        text="Don't have an account?"
        linkText="Sign up"
        to="/register"
      />
    </AuthShell>
  );
};

export default LoginPage;
