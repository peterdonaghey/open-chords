#!/usr/bin/env node
/**
 * Quick script to set you as owner of all anonymous songs
 * This updates the ownerEmail field for all songs in DynamoDB
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = (process.env.DYNAMODB_TABLE_NAME || 'open-chords-songs').trim();
const OWNER_EMAIL = 'donagheypeter@googlemail.com';

async function claimAllSongs() {
  console.log('\n🎵 Claiming All Songs');
  console.log('====================');
  console.log(`Owner: ${OWNER_EMAIL}`);
  console.log(`Table: ${TABLE_NAME}\n`);

  // Scan all songs
  console.log('📊 Scanning songs...');
  const scanCommand = new ScanCommand({ TableName: TABLE_NAME });
  
  let songs;
  try {
    const response = await docClient.send(scanCommand);
    songs = response.Items || [];
    console.log(`Found ${songs.length} songs\n`);
  } catch (error) {
    console.error('❌ Error scanning songs:', error);
    process.exit(1);
  }

  if (songs.length === 0) {
    console.log('No songs to update');
    return;
  }

  // Update each song
  let updated = 0;
  let errors = 0;

  for (const song of songs) {
    try {
      const updateCommand = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          userId: song.userId,
          songId: song.songId,
        },
        UpdateExpression: 'SET ownerEmail = :email, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':email': OWNER_EMAIL,
          ':updatedAt': new Date().toISOString(),
        },
      });

      await docClient.send(updateCommand);
      updated++;
      console.log(`✅ "${song.title}" by ${song.artist || 'Unknown'}`);
    } catch (error) {
      errors++;
      console.error(`❌ Failed "${song.title}":`, error.message);
    }
  }

  console.log('\n====================');
  console.log(`✅ Updated: ${updated}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('====================\n');
}

claimAllSongs().catch(console.error);

