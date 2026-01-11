#!/usr/bin/env node
/**
 * Migration Script: Set owner for all existing songs
 * 
 * This script updates all songs in DynamoDB to have a specific owner.
 * Useful for claiming ownership of anonymous songs.
 * 
 * Usage:
 *   node scripts/set-owner-all-songs.js <userId> <ownerEmail>
 * 
 * Example:
 *   node scripts/set-owner-all-songs.js "abc123-def456-ghi789" "user@example.com"
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

async function setOwnerForAllSongs(newUserId, newOwnerEmail) {
  console.log('\n🎵 Song Ownership Migration Script');
  console.log('=====================================');
  console.log(`Target User ID: ${newUserId}`);
  console.log(`Target Email: ${newOwnerEmail}`);
  console.log(`Table: ${TABLE_NAME}\n`);

  // First, scan all songs
  console.log('📊 Scanning all songs...');
  const scanCommand = new ScanCommand({
    TableName: TABLE_NAME,
  });

  let songs;
  try {
    const response = await docClient.send(scanCommand);
    songs = response.Items || [];
    console.log(`✅ Found ${songs.length} songs\n`);
  } catch (error) {
    console.error('❌ Error scanning songs:', error);
    process.exit(1);
  }

  if (songs.length === 0) {
    console.log('No songs found. Exiting.');
    return;
  }

  // Show summary of songs to be updated
  console.log('Songs to update:');
  songs.forEach((song, index) => {
    console.log(`  ${index + 1}. "${song.title}" by ${song.artist || 'Unknown'} (current owner: ${song.ownerEmail || 'none'})`);
  });
  console.log('');

  // Update each song
  let successCount = 0;
  let errorCount = 0;

  for (const song of songs) {
    try {
      // We need to delete the old item and create a new one if userId is changing
      // This is because userId is part of the primary key
      
      const updateCommand = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          userId: song.userId, // Old userId for the key
          songId: song.songId,
        },
        UpdateExpression: 'SET ownerEmail = :email, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':email': newOwnerEmail,
          ':updatedAt': new Date().toISOString(),
        },
      });

      await docClient.send(updateCommand);
      successCount++;
      console.log(`✅ Updated: "${song.title}"`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Failed to update "${song.title}":`, error.message);
    }
  }

  // Summary
  console.log('\n=====================================');
  console.log('📊 Migration Summary:');
  console.log(`   Total songs: ${songs.length}`);
  console.log(`   ✅ Successfully updated: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log('=====================================\n');

  if (errorCount > 0) {
    console.log('⚠️  Some songs failed to update. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('🎉 All songs successfully updated!');
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Error: Missing required arguments\n');
  console.log('Usage: node scripts/set-owner-all-songs.js <userId> <ownerEmail>');
  console.log('\nExample:');
  console.log('  node scripts/set-owner-all-songs.js "abc123-def456" "user@example.com"');
  console.log('\nTo get your userId:');
  console.log('  1. Sign in to the app');
  console.log('  2. Open browser console');
  console.log('  3. Run: localStorage.getItem("CognitoIdentityServiceProvider.3pa4i14pa0dhjaqgtoli2pl3q6.LastAuthUser")');
  console.log('  4. Or create a test song and check its userId in the API response\n');
  process.exit(1);
}

const [userId, ownerEmail] = args;

// Run the migration
setOwnerForAllSongs(userId, ownerEmail).catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

