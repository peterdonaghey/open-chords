import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import SongsPage from './pages/songs/SongsPage';
import MySongsPage from './pages/songs/MySongsPage';
import ViewSongPage from './pages/songs/ViewSongPage';
import NewSongPage from './pages/editor/NewSongPage';
import EditSongPage from './pages/editor/EditSongPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import VerifyEmailForm from './components/auth/VerifyEmailForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';

import './App.css';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/songs" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="app">
            <Routes>
              <Route path="/" element={<Navigate to="/songs" replace />} />
              <Route path="/songs" element={<SongsPage />} />
              <Route path="/my-songs" element={<MySongsPage />} />
              <Route path="/song/view/:id" element={<ViewSongPage />} />

              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignupForm />} />
              <Route path="/verify-email" element={<VerifyEmailForm />} />
              <Route path="/forgot-password" element={<ForgotPasswordForm />} />

              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              <Route path="/song/new" element={<NewSongPage />} />
              <Route path="/song/edit/:id" element={<EditSongPage />} />

              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/songs" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
