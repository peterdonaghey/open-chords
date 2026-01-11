#!/usr/bin/env node
/**
 * Test JWT verification directly
 */

import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const REGION = 'eu-central-1';
const USER_POOL_ID = 'eu-central-1_eLIth7M5J';

// JWKS client
const client = jwksClient({
  jwksUri: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`,
  cache: true,
  cacheMaxAge: 86400000,
});

function getKey(header, callback) {
  console.log('Getting key for kid:', header.kid);
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('Error getting signing key:', err);
      callback(err);
      return;
    }
    const signingKey = key.getPublicKey();
    console.log('Got signing key successfully');
    callback(null, signingKey);
  });
}

// Get token from command line arg
const token = process.argv[2];

if (!token) {
  console.error('Usage: node test-jwt.js <token>');
  console.log('\nGet token from browser console:');
  console.log('const clientId = "3pa4i14pa0dhjaqgtoli2pl3q6";');
  console.log('const username = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`);');
  console.log('const idToken = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.${username}.idToken`);');
  console.log('console.log(idToken);');
  process.exit(1);
}

console.log('Testing JWT verification...');

jwt.verify(token, getKey, {
  issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
}, (err, decoded) => {
  if (err) {
    console.error('JWT verification failed:', err);
    process.exit(1);
  }
  console.log('JWT verification successful!');
  console.log('Decoded token:', JSON.stringify(decoded, null, 2));
});

