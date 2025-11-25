// S3 utility functions for Vercel serverless functions
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = 'open-chords-songs';

/**
 * List all songs from S3
 */
export async function listSongs() {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: 'songs/',
  });

  const response = await s3Client.send(command);

  if (!response.Contents) {
    return [];
  }

  // Get all song objects
  const songs = await Promise.all(
    response.Contents
      .filter(item => item.Key.endsWith('.json'))
      .map(async (item) => {
        const getCommand = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: item.Key,
        });
        const data = await s3Client.send(getCommand);
        const body = await streamToString(data.Body);
        return JSON.parse(body);
      })
  );

  return songs;
}

/**
 * Get a specific song by ID
 */
export async function getSong(id) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `songs/${id}.json`,
  });

  try {
    const response = await s3Client.send(command);
    const body = await streamToString(response.Body);
    return JSON.parse(body);
  } catch (error) {
    if (error.name === 'NoSuchKey') {
      return null;
    }
    throw error;
  }
}

/**
 * Save a song to S3
 */
export async function saveSong(song) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `songs/${song.id}.json`,
    Body: JSON.stringify(song),
    ContentType: 'application/json',
  });

  await s3Client.send(command);
  return song;
}

/**
 * Delete a song from S3
 */
export async function deleteSong(id) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `songs/${id}.json`,
  });

  await s3Client.send(command);
  return { success: true };
}

/**
 * Helper to convert stream to string
 */
async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}
