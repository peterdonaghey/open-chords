/**
 * SignupForm - User registration component
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import './Auth.css';

type PasswordStrength = 'weak' | 'medium' | 'strong' | null;

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return null;
  if (password.length < 8) return 'weak';
  if (password.length < 12 || !/\d/.test(password) || !/[A-Z]/.test(password)) {
    return 'medium';
  }
  return 'strong';
}

export default function SignupForm() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!/\d/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password);
      navigate('/');
    } catch (err) {
      console.error('Signup error:', err);
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('already exists')) {
        setError('An account with this email already exists');
      } else {
        setError(msg || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h2>Create account</h2>
      <p>Start organizing your chord sheets today</p>

      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            disabled={loading}
            autoComplete="new-password"
          />
          {passwordStrength && (
            <div className="password-strength">
              <div className={`password-strength-bar ${passwordStrength}`}></div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            disabled={loading}
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? (
            <>
              Creating account
              <span className="loading-spinner"></span>
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="auth-link">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </AuthLayout>
  );
}
