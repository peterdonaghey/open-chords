#!/usr/bin/env node
/**
 * Script to create the users DynamoDB table
 */

import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const USERS_TABLE = 'open-chords-users';

async function createUsersTable() {
  try {
    // Check if table exists
    try {
      const describeCommand = new DescribeTableCommand({ TableName: USERS_TABLE });
      await client.send(describeCommand);
      console.log(`✅ Table ${USERS_TABLE} already exists`);
      return;
    } catch (error) {
      if (error.name !== 'ResourceNotFoundException') {
        throw error;
      }
    }

    console.log(`Creating table ${USERS_TABLE}...`);

    const command = new CreateTableCommand({
      TableName: USERS_TABLE,
      KeySchema: [
        { AttributeName: 'email', KeyType: 'HASH' }, // Partition key
      ],
      AttributeDefinitions: [
        { AttributeName: 'email', AttributeType: 'S' },
      ],
      BillingMode: 'PAY_PER_REQUEST', // On-demand pricing
    });

    await client.send(command);

    console.log('✅ Table created successfully!');
    console.log(`   Table: ${USERS_TABLE}`);
    console.log(`   Primary key: email (String)`);
    console.log(`   Billing: Pay per request`);
    console.log('\nWaiting for table to become active...');

    // Wait for table to become active
    let tableActive = false;
    while (!tableActive) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const describeCommand = new DescribeTableCommand({ TableName: USERS_TABLE });
      const response = await client.send(describeCommand);
      tableActive = response.Table.TableStatus === 'ACTIVE';
      process.stdout.write('.');
    }

    console.log('\n✅ Table is now active!');
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

createUsersTable();

