#!/usr/bin/env node
/**
 * Script to create initial admin user
 * Usage: node scripts/create-admin-user.js <email> <password>
 */

import { scrypt, randomBytes, randomUUID } from 'crypto';
import { promisify } from 'util';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const scryptAsync = promisify(scrypt);

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
 * Hash password using scrypt
 */
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function createAdminUser() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node scripts/create-admin-user.js <email> <password>');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Password must be at least 8 characters');
    process.exit(1);
  }

  try {
    console.log(`Creating admin user: ${email}`);

    const passwordHash = await hashPassword(password);
    const userId = randomUUID();
    const now = new Date().toISOString();

    const user = {
      email,
      userId,
      passwordHash,
      role: 'admin',
      createdAt: now,
    };

    const command = new PutCommand({
      TableName: USERS_TABLE,
      Item: user,
      ConditionExpression: 'attribute_not_exists(email)',
    });

    await docClient.send(command);

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Role: admin`);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      console.error('❌ User with this email already exists');
      process.exit(1);
    }
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();

