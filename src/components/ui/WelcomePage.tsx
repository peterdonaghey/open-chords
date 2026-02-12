/**
 * WelcomePage - Landing page for non-authenticated users
 */
import { Link } from 'react-router-dom';
import './Auth/Auth.css';

export default function WelcomePage() {
  return (
    <div className="auth-layout">
      <header className="auth-header">
        <h1>🎸 Open Chords</h1>
      </header>
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2>Your Personal Chord Sheet Manager</h2>
          <p style={{ marginBottom: '2rem' }}>
            Write, organize, and transpose guitar chord sheets with ease.
            Keep your music library organized and accessible anywhere.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/signup" className="auth-button" style={{ textDecoration: 'none', display: 'block' }}>
              Get Started
            </Link>
            <Link to="/login" className="auth-button-secondary" style={{ textDecoration: 'none', display: 'block' }}>
              Sign In
            </Link>
          </div>

          <div style={{ marginTop: '3rem', fontSize: '0.9rem', color: '#7f8c8d' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#2c3e50', marginBottom: '1rem' }}>Features</h3>
            <ul style={{ textAlign: 'left', lineHeight: '1.8' }}>
              <li>✨ Ultimate Guitar format support</li>
              <li>🎵 Instant chord transposition</li>
              <li>📱 Mobile-friendly interface</li>
              <li>🔄 Auto-scroll for practice</li>
              <li>☁️ Cloud storage & sync</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
