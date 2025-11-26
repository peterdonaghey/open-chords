/**
 * Login Modal - Inline authentication without navigation
 */
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  const { signIn, signUp, confirmSignUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (needsVerification) {
        // Verify email
        await confirmSignUp(email, verificationCode);
        await signIn(email, password);
        if (onSuccess) onSuccess();
        onClose();
      } else if (isSignup) {
        // Sign up
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await signUp(email, password);
        setNeedsVerification(true);
        setError('');
      } else {
        // Sign in
        await signIn(email, password);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="auth-form-container">
          <h2>{needsVerification ? 'Verify Email' : (isSignup ? 'Create Account' : 'Sign In')}</h2>
          <p className="auth-subtitle">
            {needsVerification 
              ? 'Check your email for the verification code' 
              : (isSignup ? 'Join to save your chord sheets' : 'Continue as yourself')}
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {needsVerification ? (
              <div className="form-group">
                <label htmlFor="code">Verification Code</label>
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  required
                />
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignup ? 'At least 8 characters' : 'Enter your password'}
                    required
                  />
                </div>

                {isSignup && (
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      required
                    />
                  </div>
                )}
              </>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Please wait...' : (needsVerification ? 'Verify' : (isSignup ? 'Create Account' : 'Sign In'))}
            </button>
          </form>

          {!needsVerification && (
            <div className="auth-toggle">
              {isSignup ? (
                <p>
                  Already have an account?{' '}
                  <button onClick={() => setIsSignup(false)} className="link-button">
                    Sign in
                  </button>
                </p>
              ) : (
                <p>
                  Don't have an account?{' '}
                  <button onClick={() => setIsSignup(true)} className="link-button">
                    Sign up
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

