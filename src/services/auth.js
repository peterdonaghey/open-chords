/**
 * Authentication Service - Simple custom auth
 */

const API_BASE = import.meta.env.PROD ? '/api' : 'https://open-chords.org/api';
const TOKEN_KEY = 'auth_token';

/**
 * Sign up a new user
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<{token: string, user: object}>}
 */
export async function signUp(email, password) {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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

/**
 * Sign in a user
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<{token: string, user: object}>}
 */
export async function signIn(email, password) {
  const response = await fetch(`${API_BASE}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export async function signOut() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Get the current authenticated user
 * @returns {Promise<{email: string, userId: string, role: string}>}
 */
export async function getCurrentUser() {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    throw new Error('No user found');
  }

  const response = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
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
    emailVerified: true, // No email verification in simple auth
  };
}

/**
 * Get the current user's JWT token
 * @returns {Promise<string>}
 */
export async function getIdToken() {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    throw new Error('No user found');
  }

  return token;
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Initiate forgot password flow
 * @param {string} email - User's email address
 * @returns {Promise<{message: string, resetToken: string, resetUrl: string}>}
 */
export async function forgotPassword(email) {
  const response = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to process request');
  }

  return await response.json();
}

/**
 * Reset password with token
 * @param {string} email - User's email address
 * @param {string} resetToken - Reset token from forgot password
 * @param {string} newPassword - New password
 * @returns {Promise<{message: string}>}
 */
export async function resetPassword(email, resetToken, newPassword) {
  const response = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, resetToken, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reset password');
  }

  return await response.json();
}

/**
 * Confirm password (alias for resetPassword for backward compatibility)
 */
export async function confirmPassword(email, code, newPassword) {
  return resetPassword(email, code, newPassword);
}

/**
 * Change password (authenticated user changes their own password)
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<{message: string}>}
 */
export async function changePassword(currentPassword, newPassword) {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to change password');
  }

  return await response.json();
}

/**
 * Confirm sign up (no-op for backward compatibility)
 */
export async function confirmSignUp(email, code) {
  return Promise.resolve('No email verification required');
}

/**
 * Resend confirmation code (no-op for backward compatibility)
 */
export async function resendConfirmationCode(email) {
  return Promise.resolve('No email verification required');
}
