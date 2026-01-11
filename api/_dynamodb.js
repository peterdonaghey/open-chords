// DynamoDB utility functions for Vercel serverless functions
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = (process.env.DYNAMODB_TABLE_NAME || 'open-chords-songs').trim();

/**
 * List all songs for a user
 */
export async function listSongs(userId) {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  });

  const response = await docClient.send(command);
  return response.Items || [];
}

/**
 * List all songs from all users (PUBLIC)
 */
export async function listAllSongs() {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
  });

  try {
    const response = await docClient.send(command);
    return response.Items || [];
  } catch (error) {
    console.error('Error listing all songs:', error);
    return [];
  }
}

/**
 * Get a specific song by songId (PUBLIC - scans for the song)
 */
export async function getSongById(songId) {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: 'songId = :songId',
    ExpressionAttributeValues: {
      ':songId': songId,
    },
  });

  const response = await docClient.send(command);
  return response.Items?.[0] || null;
}

/**
 * Get a specific song by userId and songId
 */
export async function getSong(userId, songId) {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      userId,
      songId,
    },
  });

  const response = await docClient.send(command);
  return response.Item || null;
}

/**
 * Save a new song
 */
export async function saveSong(userId, song, ownerEmail = 'anonymous') {
  const now = new Date().toISOString();
  
  const item = {
    userId,
    songId: song.id,
    title: song.title,
    artist: song.artist,
    content: song.content,
    createdAt: now,
    updatedAt: now,
    ownerEmail,  // Store owner's email
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
  });

  await docClient.send(command);
  return item;
}

/**
 * Update an existing song
 */
export async function updateSong(userId, song) {
  const now = new Date().toISOString();

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      userId,
      songId: song.id,
    },
    UpdateExpression: 'SET title = :title, artist = :artist, content = :content, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':title': song.title,
      ':artist': song.artist,
      ':content': song.content,
      ':updatedAt': now,
    },
    ReturnValues: 'ALL_NEW',
  });

  const response = await docClient.send(command);
  return response.Attributes;
}

/**
 * Delete a song
 */
export async function deleteSong(userId, songId) {
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: {
      userId,
      songId,
    },
  });

  await docClient.send(command);
  return { success: true };
}

