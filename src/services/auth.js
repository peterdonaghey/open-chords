/**
 * Authentication Service - Handles AWS Cognito authentication
 */
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

// Cognito User Pool configuration
const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);

/**
 * Sign up a new user
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<{user: CognitoUser, userSub: string}>}
 */
export async function signUp(email, password) {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email,
      }),
    ];

    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({
        user: result.user,
        userSub: result.userSub,
      });
    });
  });
}

/**
 * Confirm sign up with verification code
 * @param {string} email - User's email address
 * @param {string} code - Verification code from email
 * @returns {Promise<string>}
 */
export async function confirmSignUp(email, code) {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

/**
 * Resend confirmation code
 * @param {string} email - User's email address
 * @returns {Promise<string>}
 */
export async function resendConfirmationCode(email) {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

/**
 * Sign in a user
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<{user: CognitoUser, session: CognitoUserSession}>}
 */
export async function signIn(email, password) {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        resolve({ user: cognitoUser, session });
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: () => {
        reject(new Error('New password required'));
      },
    });
  });
}

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export async function signOut() {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
}

/**
 * Get the current authenticated user
 * @returns {Promise<{email: string, userId: string, emailVerified: boolean}>}
 */
export async function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      reject(new Error('No user found'));
      return;
    }

    cognitoUser.getSession((err, session) => {
      if (err) {
        reject(err);
        return;
      }

      if (!session.isValid()) {
        reject(new Error('Session is not valid'));
        return;
      }

      cognitoUser.getUserAttributes((err, attributes) => {
        if (err) {
          reject(err);
          return;
        }

        const email = attributes.find(attr => attr.Name === 'email')?.Value;
        const emailVerified = attributes.find(attr => attr.Name === 'email_verified')?.Value === 'true';
        const userId = attributes.find(attr => attr.Name === 'sub')?.Value;

        resolve({
          email,
          userId,
          emailVerified,
          cognitoUser,
        });
      });
    });
  });
}

/**
 * Get the current user's JWT token
 * @returns {Promise<string>}
 */
export async function getIdToken() {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      reject(new Error('No user found'));
      return;
    }

    cognitoUser.getSession((err, session) => {
      if (err) {
        reject(err);
        return;
      }

      if (!session.isValid()) {
        reject(new Error('Session is not valid'));
        return;
      }

      resolve(session.getIdToken().getJwtToken());
    });
  });
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
 * @returns {Promise<any>}
 */
export async function forgotPassword(email) {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.forgotPassword({
      onSuccess: (data) => {
        resolve(data);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

/**
 * Confirm new password with code
 * @param {string} email - User's email address
 * @param {string} code - Verification code from email
 * @param {string} newPassword - New password
 * @returns {Promise<string>}
 */
export async function confirmPassword(email, code, newPassword) {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => {
        resolve('Password reset successful');
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

/**
 * Get user pool instance
 * @returns {CognitoUserPool}
 */
export function getUserPool() {
  return userPool;
}

