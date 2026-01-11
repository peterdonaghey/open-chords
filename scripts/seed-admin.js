#!/usr/bin/env node
/**
 * Seed admin user from environment variables
 * Usage: node scripts/seed-admin.js
 * 
 * Requires .env.local to have:
 * - ADMIN_EMAIL
 * - ADMIN_PASSWORD
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

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env.local');
    console.error('   Add these to your .env.local file:');
    console.error('   ADMIN_EMAIL=your-email@example.com');
    console.error('   ADMIN_PASSWORD=your-secure-password');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ ADMIN_PASSWORD must be at least 8 characters');
    process.exit(1);
  }

  try {
    console.log(`🌱 Seeding admin user: ${email}`);

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

    // Use PutCommand without condition to overwrite existing user
    const command = new PutCommand({
      TableName: USERS_TABLE,
      Item: user,
    });

    await docClient.send(command);

    console.log('✅ Admin user seeded successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Role: admin`);
    console.log('\n💡 You can now sign in with these credentials');
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    process.exit(1);
  }
}

seedAdmin();

