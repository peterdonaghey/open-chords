/**
 * VerifyEmailForm - Email verification with code
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import './Auth.css';

export default function VerifyEmailForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { confirmSignUp, resendConfirmationCode } = useAuth();

  const email = location.state?.email || '';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  function handleCodeChange(index, value) {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (newCode.every(digit => digit) && value) {
      handleSubmit(newCode.join(''));
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Extract only digits from pasted content
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length === 0) return;

    // Fill in the code array with pasted digits
    const newCode = [...code];
    for (let i = 0; i < digits.length; i++) {
      newCode[i] = digits[i];
    }
    setCode(newCode);

    // Focus the next empty field or the last field
    const nextEmptyIndex = Math.min(digits.length, 5);
    inputRefs.current[nextEmptyIndex]?.focus();

    // Auto-submit if we have all 6 digits
    if (digits.length === 6) {
      handleSubmit(digits);
    }
  }

  async function handleSubmit(verificationCode = null) {
    const fullCode = verificationCode || code.join('');
    
    if (fullCode.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await confirmSignUp(email, fullCode);
      setSuccess('Email verified successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Verification error:', err);
      if (err.code === 'CodeMismatchException') {
        setError('Invalid verification code');
      } else if (err.code === 'ExpiredCodeException') {
        setError('Verification code has expired. Please request a new one.');
      } else {
        setError(err.message || 'Failed to verify email. Please try again.');
      }
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    try {
      setResending(true);
      setError('');
      setSuccess('');
      await resendConfirmationCode(email);
      setSuccess('Verification code sent! Check your email.');
    } catch (err) {
      console.error('Resend error:', err);
      setError('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout>
      <h2>Verify your email</h2>
      <p>We've sent a verification code to {email}</p>

      <div className="auth-form">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="verification-code-input">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={loading || Boolean(success)}
              autoFocus={index === 0}
            />
          ))}
        </div>

        <button
          type="button"
          className="auth-button"
          onClick={() => handleSubmit()}
          disabled={loading || code.some(d => !d) || Boolean(success)}
        >
          {loading ? (
            <>
              Verifying
              <span className="loading-spinner"></span>
            </>
          ) : (
            'Verify Email'
          )}
        </button>

        <div className="resend-code">
          Didn't receive the code?{' '}
          <button onClick={handleResendCode} disabled={resending || Boolean(success)}>
            {resending ? 'Sending...' : 'Resend'}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}

