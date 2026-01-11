/**
 * User management utilities for DynamoDB
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const USERS_TABLE = 'open-chords-users';

/**
 * Create a new user
 * @param {string} email - User's email address (primary key)
 * @param {string} passwordHash - Hashed password
 * @param {string} role - User role ('user' or 'admin')
 * @returns {Promise<object>} Created user object
 */
export async function createUser(email, passwordHash, role = 'user') {
  const now = new Date().toISOString();
  const userId = randomUUID();

  const user = {
    email,
    userId,
    passwordHash,
    role,
    createdAt: now,
  };

  const command = new PutCommand({
    TableName: USERS_TABLE,
    Item: user,
    ConditionExpression: 'attribute_not_exists(email)', // Prevent duplicate emails
  });

  try {
    await docClient.send(command);
    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new Error('User with this email already exists');
    }
    throw error;
  }
}

/**
 * Get user by email
 * @param {string} email - User's email address
 * @returns {Promise<object|null>} User object or null if not found
 */
export async function getUserByEmail(email) {
  const command = new GetCommand({
    TableName: USERS_TABLE,
    Key: { email },
  });

  const response = await docClient.send(command);
  return response.Item || null;
}

/**
 * Get all users (admin only)
 * @returns {Promise<Array>} Array of user objects
 */
export async function getAllUsers() {
  const command = new ScanCommand({
    TableName: USERS_TABLE,
    ProjectionExpression: 'email, userId, #role, createdAt',
    ExpressionAttributeNames: {
      '#role': 'role', // role is a reserved word
    },
  });

  const response = await docClient.send(command);
  return response.Items || [];
}

/**
 * Update user's password
 * @param {string} email - User's email address
 * @param {string} newPasswordHash - New hashed password
 * @returns {Promise<void>}
 */
export async function updatePassword(email, newPasswordHash) {
  const command = new UpdateCommand({
    TableName: USERS_TABLE,
    Key: { email },
    UpdateExpression: 'SET passwordHash = :hash, resetToken = :null, resetExpiry = :null',
    ExpressionAttributeValues: {
      ':hash': newPasswordHash,
      ':null': null,
    },
    ConditionExpression: 'attribute_exists(email)',
  });

  try {
    await docClient.send(command);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new Error('User not found');
    }
    throw error;
  }
}

/**
 * Set password reset token
 * @param {string} email - User's email address
 * @param {string} resetToken - Reset token
 * @param {string} resetExpiry - ISO timestamp when token expires
 * @returns {Promise<void>}
 */
export async function setResetToken(email, resetToken, resetExpiry) {
  const command = new UpdateCommand({
    TableName: USERS_TABLE,
    Key: { email },
    UpdateExpression: 'SET resetToken = :token, resetExpiry = :expiry',
    ExpressionAttributeValues: {
      ':token': resetToken,
      ':expiry': resetExpiry,
    },
    ConditionExpression: 'attribute_exists(email)',
  });

  try {
    await docClient.send(command);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new Error('User not found');
    }
    throw error;
  }
}

/**
 * Update user's role
 * @param {string} email - User's email address
 * @param {string} newRole - New role ('user' or 'admin')
 * @returns {Promise<void>}
 */
export async function updateRole(email, newRole) {
  if (!['user', 'admin'].includes(newRole)) {
    throw new Error('Invalid role. Must be "user" or "admin"');
  }

  const command = new UpdateCommand({
    TableName: USERS_TABLE,
    Key: { email },
    UpdateExpression: 'SET #role = :role',
    ExpressionAttributeNames: {
      '#role': 'role', // role is a reserved word
    },
    ExpressionAttributeValues: {
      ':role': newRole,
    },
    ConditionExpression: 'attribute_exists(email)',
  });

  try {
    await docClient.send(command);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new Error('User not found');
    }
    throw error;
  }
}

/**
 * Delete a user
 * @param {string} email - User's email address
 * @returns {Promise<void>}
 */
export async function deleteUser(email) {
  const command = new DeleteCommand({
    TableName: USERS_TABLE,
    Key: { email },
    ConditionExpression: 'attribute_exists(email)',
  });

  try {
    await docClient.send(command);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new Error('User not found');
    }
    throw error;
  }
}

