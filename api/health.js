// Health check endpoint to verify environment variables
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const hasAwsKeyId = !!process.env.AWS_ACCESS_KEY_ID;
  const hasAwsSecret = !!process.env.AWS_SECRET_ACCESS_KEY;
  const awsRegion = process.env.AWS_REGION || 'not-set';

  return res.status(200).json({
    status: 'ok',
    env: {
      hasAwsKeyId,
      hasAwsSecret,
      awsRegion,
      nodeEnv: process.env.NODE_ENV
    }
  });
}
