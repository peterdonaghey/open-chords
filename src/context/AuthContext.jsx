/**
 * Authentication Context - Provides auth state throughout the app
 */
import { createContext, useContext, useState, useEffect } from 'react';
import {
  signUp as authSignUp,
  confirmSignUp as authConfirmSignUp,
  signIn as authSignIn,
  signOut as authSignOut,
  getCurrentUser as authGetCurrentUser,
  isAuthenticated as authIsAuthenticated,
  forgotPassword as authForgotPassword,
  confirmPassword as authConfirmPassword,
  resendConfirmationCode as authResendConfirmationCode,
} from '../services/auth';

const AuthContext = createContext(null);

/**
 * Custom hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      setIsLoading(true);
      const currentUser = await authGetCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
      // Check if user is admin based on role from database
      setIsAdmin(currentUser.role === 'admin');
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Sign up a new user
   */
  async function signUp(email, password) {
    try {
      const result = await authSignUp(email, password);
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Confirm sign up with verification code
   */
  async function confirmSignUp(email, code) {
    try {
      const result = await authConfirmSignUp(email, code);
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Resend confirmation code
   */
  async function resendConfirmationCode(email) {
    try {
      const result = await authResendConfirmationCode(email);
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sign in a user
   */
  async function signIn(email, password) {
    try {
      const result = await authSignIn(email, password);
      await checkAuth(); // Refresh user state
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sign out the current user
   */
  async function signOut() {
    try {
      await authSignOut();
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Initiate forgot password flow
   */
  async function forgotPassword(email) {
    try {
      const result = await authForgotPassword(email);
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Confirm new password with code
   */
  async function confirmPassword(email, code, newPassword) {
    try {
      const result = await authConfirmPassword(email, code, newPassword);
      return result;
    } catch (error) {
      throw error;
    }
  }

  const value = {
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
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

