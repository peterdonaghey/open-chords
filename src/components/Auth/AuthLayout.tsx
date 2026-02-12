/**
 * AuthLayout - Shared layout for authentication pages
 */
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import './Auth.css';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="auth-layout">
      <header className="auth-header">
        <h1 onClick={() => navigate('/')}>🎸 Open Chords</h1>
      </header>
      <div className="auth-container">
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
}
