/**
 * ForgotPasswordForm - Password reset flow
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import './Auth.css';

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const { forgotPassword, confirmPassword } = useAuth();

  const [step, setStep] = useState('email'); // 'email' or 'reset'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequestReset(e) {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email);
      setSuccess('Password reset code sent! Check your email.');
      setStep('reset');
    } catch (err) {
      console.error('Forgot password error:', err);
      if (err.code === 'UserNotFoundException') {
        setError('No account found with this email');
      } else if (err.code === 'LimitExceededException') {
        setError('Too many requests. Please try again later.');
      } else {
        setError(err.message || 'Failed to send reset code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');

    if (!code || !newPassword || !confirmNewPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      await confirmPassword(email, code, newPassword);
      setSuccess('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Reset password error:', err);
      if (err.code === 'CodeMismatchException') {
        setError('Invalid verification code');
      } else if (err.code === 'ExpiredCodeException') {
        setError('Verification code has expired. Please request a new one.');
      } else if (err.code === 'InvalidPasswordException') {
        setError('Password does not meet requirements');
      } else {
        setError(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (step === 'email') {
    return (
      <AuthLayout>
        <h2>Reset password</h2>
        <p>Enter your email to receive a reset code</p>

        <form onSubmit={handleRequestReset} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

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

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                Sending code
                <span className="loading-spinner"></span>
              </>
            ) : (
              'Send Reset Code'
            )}
          </button>
        </form>

        <div className="auth-link">
          Remember your password? <Link to="/login">Sign in</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2>Enter new password</h2>
      <p>Check your email for the verification code</p>

      <form onSubmit={handleResetPassword} className="auth-form">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-group">
          <label htmlFor="code">Verification Code</label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            disabled={loading || Boolean(success)}
            maxLength={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            disabled={loading || Boolean(success)}
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmNewPassword">Confirm New Password</label>
          <input
            id="confirmNewPassword"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="Re-enter your password"
            disabled={loading || Boolean(success)}
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="auth-button" disabled={loading || Boolean(success)}>
          {loading ? (
            <>
              Resetting password
              <span className="loading-spinner"></span>
            </>
          ) : (
            'Reset Password'
          )}
        </button>

        <div className="auth-link">
          <button
            type="button"
            onClick={() => setStep('email')}
            className="auth-button-secondary"
            disabled={loading}
          >
            Back
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

