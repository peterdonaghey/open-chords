/**
 * Authentication Context - Provides auth state throughout the app
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  signUp as authSignUp,
  confirmSignUp as authConfirmSignUp,
  signIn as authSignIn,
  signOut as authSignOut,
  getCurrentUser as authGetCurrentUser,
  forgotPassword as authForgotPassword,
  confirmPassword as authConfirmPassword,
  resendConfirmationCode as authResendConfirmationCode,
} from '../services/auth';
import type { AuthContextType, User } from '../types/auth';
import type { AuthUser } from '../services/auth';

function authUserToUser(a: AuthUser): User {
  return {
    userId: a.userId,
    email: a.email,
    role: a.role === 'admin' || a.role === 'user' ? a.role : undefined,
    createdAt: a.createdAt,
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      setIsLoading(true);
      const currentUser = await authGetCurrentUser();
      setUser(authUserToUser(currentUser));
      setIsAuthenticated(true);
      setIsAdmin(currentUser.role === 'admin');
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(email: string, password: string) {
    const result = await authSignUp(email, password);
    await checkAuth();
    return result;
  }

  async function confirmSignUp(email: string, code: string) {
    return authConfirmSignUp(email, code);
  }

  async function resendConfirmationCode(email: string) {
    return authResendConfirmationCode(email);
  }

  async function signIn(email: string, password: string) {
    const result = await authSignIn(email, password);
    await checkAuth();
    return result;
  }

  async function signOut() {
    await authSignOut();
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  }

  async function forgotPassword(email: string) {
    return authForgotPassword(email);
  }

  async function confirmPassword(email: string, code: string, newPassword: string) {
    return authConfirmPassword(email, code, newPassword);
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    signUp,
    confirmSignUp,
    resendConfirmationCode,
    signIn,
    signOut,
    forgotPassword,
    confirmPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
