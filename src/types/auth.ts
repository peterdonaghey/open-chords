/**
 * Auth types
 */

import type { SignUpResponse } from '../services/auth';

export interface User {
  userId: string;
  email: string;
  role?: 'user' | 'admin';
  createdAt?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<SignUpResponse>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<SignUpResponse>;
  confirmSignUp: (email: string, code: string) => Promise<unknown>;
  resendConfirmationCode: (email: string) => Promise<unknown>;
  forgotPassword: (email: string) => Promise<unknown>;
  confirmPassword: (email: string, code: string, newPassword: string) => Promise<unknown>;
  checkAuth?: () => Promise<void>;
}
