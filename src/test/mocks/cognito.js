import { vi } from 'vitest';

/**
 * Mock Cognito User Pool and related classes
 */

export const mockCognitoUser = {
  username: 'test@example.com',
  getUsername: vi.fn(() => 'test@example.com'),
  signOut: vi.fn(),
  getSession: vi.fn((callback) => {
    callback(null, mockSession);
  }),
  getUserAttributes: vi.fn((callback) => {
    callback(null, [
      { Name: 'email', Value: 'test@example.com' },
      { Name: 'email_verified', Value: 'true' },
      { Name: 'sub', Value: 'test-user-id' },
    ]);
  }),
  authenticateUser: vi.fn((authDetails, callbacks) => {
    callbacks.onSuccess(mockSession);
  }),
  confirmRegistration: vi.fn((code, forceAliasCreation, callback) => {
    callback(null, 'SUCCESS');
  }),
  resendConfirmationCode: vi.fn((callback) => {
    callback(null, { CodeDeliveryDetails: {} });
  }),
  forgotPassword: vi.fn((callbacks) => {
    callbacks.onSuccess({ CodeDeliveryDetails: {} });
  }),
  confirmPassword: vi.fn((code, newPassword, callbacks) => {
    callbacks.onSuccess();
  }),
};

export const mockSession = {
  isValid: vi.fn(() => true),
  getIdToken: vi.fn(() => ({
    getJwtToken: vi.fn(() => 'mock-jwt-token'),
  })),
  getAccessToken: vi.fn(() => ({
    getJwtToken: vi.fn(() => 'mock-access-token'),
  })),
  getRefreshToken: vi.fn(() => ({
    getToken: vi.fn(() => 'mock-refresh-token'),
  })),
};

export const mockUserPool = {
  getCurrentUser: vi.fn(() => mockCognitoUser),
  signUp: vi.fn((username, password, attributeList, validationData, callback) => {
    callback(null, {
      user: mockCognitoUser,
      userConfirmed: false,
      userSub: 'test-user-id',
    });
  }),
};

export const mockCognitoUserClass = vi.fn(() => mockCognitoUser);
export const mockCognitoUserPoolClass = vi.fn(() => mockUserPool);
export const mockAuthenticationDetailsClass = vi.fn();
export const mockCognitoUserAttributeClass = vi.fn();

/**
 * Setup function to mock amazon-cognito-identity-js module
 */
export function setupCognitoMocks() {
  vi.mock('amazon-cognito-identity-js', () => ({
    CognitoUserPool: mockCognitoUserPoolClass,
    CognitoUser: mockCognitoUserClass,
    AuthenticationDetails: mockAuthenticationDetailsClass,
    CognitoUserAttribute: mockCognitoUserAttributeClass,
  }));
}

/**
 * Reset all mocks
 */
export function resetCognitoMocks() {
  vi.clearAllMocks();
}

