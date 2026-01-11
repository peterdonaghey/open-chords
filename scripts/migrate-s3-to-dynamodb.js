/**
 * Migration script to move songs from S3 to DynamoDB
 * 
 * This script:
 * 1. Lists all songs from S3
 * 2. Creates a placeholder user ID for existing songs
 * 3. Migrates each song to DynamoDB with the placeholder user ID
 * 
 * Usage: AWS_PROFILE=peterdonaghey node scripts/migrate-s3-to-dynamodb.js
 */

import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const REGION = process.env.AWS_REGION || 'eu-central-1';
const S3_BUCKET = 'open-chords-songs';
const DYNAMODB_TABLE = 'open-chords-songs';

// Placeholder user ID for migrated songs (you can replace this with a real admin user ID)
const PLACEHOLDER_USER_ID = 'migrated-user-placeholder';

// Initialize clients
const s3Client = new S3Client({ region: REGION });
const dynamoClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

/**
 * Convert stream to string
 */
async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

/**
 * List all songs from S3
 */
async function listS3Songs() {
  const command = new ListObjectsV2Command({
    Bucket: S3_BUCKET,
    Prefix: 'songs/',
  });

  const response = await s3Client.send(command);

  if (!response.Contents) {
    return [];
  }

  return response.Contents.filter(item => item.Key.endsWith('.json'));
}

/**
 * Get song from S3
 */
async function getS3Song(key) {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  const response = await s3Client.send(command);
  const body = await streamToString(response.Body);
  return JSON.parse(body);
}

/**
 * Save song to DynamoDB
 */
async function saveToDynamoDB(userId, song) {
  const now = new Date().toISOString();
  
  const item = {
    userId,
    songId: song.id,
    title: song.title,
    artist: song.artist,
    content: song.content,
    createdAt: song.createdAt || now,
    updatedAt: song.updatedAt || now,
  };

  const command = new PutCommand({
    TableName: DYNAMODB_TABLE,
    Item: item,
  });

  await docClient.send(command);
  return item;
}

/**
 * Main migration function
 */
async function migrate() {
  try {
    console.log('Starting migration from S3 to DynamoDB...');
    console.log(`S3 Bucket: ${S3_BUCKET}`);
    console.log(`DynamoDB Table: ${DYNAMODB_TABLE}`);
    console.log(`Placeholder User ID: ${PLACEHOLDER_USER_ID}`);
    console.log('');

    // List all songs from S3
    console.log('Fetching songs from S3...');
    const songFiles = await listS3Songs();
    console.log(`Found ${songFiles.length} songs in S3`);
    console.log('');

    if (songFiles.length === 0) {
      console.log('No songs to migrate');
      return;
    }

    // Migrate each song
    let successCount = 0;
    let errorCount = 0;

    for (const file of songFiles) {
      try {
        console.log(`Migrating: ${file.Key}...`);
        
        // Get song from S3
        const song = await getS3Song(file.Key);
        
        // Save to DynamoDB
        await saveToDynamoDB(PLACEHOLDER_USER_ID, song);
        
        console.log(`✓ Successfully migrated: ${song.title} by ${song.artist}`);
        successCount++;
      } catch (error) {
        console.error(`✗ Error migrating ${file.Key}:`, error.message);
        errorCount++;
      }
    }

    console.log('');
    console.log('Migration complete!');
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('');
    console.log('NOTE: All songs have been migrated with a placeholder user ID.');
    console.log('You may want to update the userId for these songs manually or create a reassignment script.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();

