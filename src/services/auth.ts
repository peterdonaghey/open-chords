/**
 * Authentication Service - Simple custom auth
 */

const API_BASE = import.meta.env.PROD ? '/api' : 'https://open-chords.org/api';
const TOKEN_KEY = 'auth_token';

export interface AuthUser {
  email: string;
  userId: string;
  role: string;
  emailVerified?: boolean;
  createdAt?: string;
}

export interface SignUpResponse {
  token: string;
  user: AuthUser;
}

export async function signUp(email: string, password: string): Promise<SignUpResponse> {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sign up');
  }

  const data = await response.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
}

export async function signIn(email: string, password: string): Promise<SignUpResponse> {
  const response = await fetch(`${API_BASE}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sign in');
  }

  const data = await response.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
}

export async function signOut(): Promise<void> {
  localStorage.removeItem(TOKEN_KEY);
}

export async function getCurrentUser(): Promise<AuthUser> {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    throw new Error('No user found');
  }

  const response = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    localStorage.removeItem(TOKEN_KEY);
    throw new Error('Session expired');
  }

  const user = await response.json();
  return {
    email: user.email,
    userId: user.userId,
    role: user.role,
    emailVerified: true,
    createdAt: user.createdAt,
  };
}

export async function getIdToken(): Promise<string> {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    throw new Error('No user found');
  }

  return token;
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}

export async function forgotPassword(email: string): Promise<{ message: string; resetToken?: string; resetUrl?: string }> {
  const response = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to process request');
  }

  return await response.json();
}

export async function resetPassword(
  email: string,
  resetToken: string,
  newPassword: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, resetToken, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reset password');
  }

  return await response.json();
}

export async function confirmPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
  return resetPassword(email, code, newPassword);
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to change password');
  }

  return await response.json();
}

export async function confirmSignUp(_email: string, _code: string): Promise<string> {
  return Promise.resolve('No email verification required');
}

export async function resendConfirmationCode(_email: string): Promise<string> {
  return Promise.resolve('No email verification required');
}
