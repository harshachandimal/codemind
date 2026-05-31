import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell';
import AuthInput from '../components/auth/AuthInput';
import AuthSubmitButton from '../components/auth/AuthSubmitButton';
import AuthErrorAlert from '../components/auth/AuthErrorAlert';
import AuthSwitchLink from '../components/auth/AuthSwitchLink';
import { registerUser } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      if (response.success) {
        await refreshUser();
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError('Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create an account" subtitle="Start analyzing code with CodeMind">
      <AuthErrorAlert message={error} />

      <form onSubmit={handleSubmit} className="flex flex-col">
        <AuthInput
          label="Full Name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          autoComplete="name"
          required
        />

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
          autoComplete="new-password"
          required
        />

        <AuthInput
          label="Confirm Password"
          name="password_confirmation"
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />

        <div className="mt-2">
          <AuthSubmitButton loading={loading}>Create Account</AuthSubmitButton>
        </div>
      </form>

      <AuthSwitchLink
        text="Already have an account?"
        linkText="Sign in"
        to="/login"
      />
    </AuthShell>
  );
};

export default RegisterPage;
