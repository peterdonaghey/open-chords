# Admin User Setup

## Overview

The app uses a custom JWT-based authentication system with role-based authorization. Admin users are seeded from environment variables.

## Setup Admin User

1. Add admin credentials to `.env.local`:
```bash
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password
```

2. Run the seed script:
```bash
node scripts/seed-admin.js
```

This will create or overwrite the admin user in DynamoDB with the credentials from your environment variables.

## Notes

- The seed script uses the same password hashing as the signup endpoint (scrypt with salt)
- Running the script multiple times will overwrite the existing admin user
- Password must be at least 8 characters
- The script does not require AWS credentials if running in a Vercel environment with proper IAM roles

## Testing

Test sign-in with curl:
```bash
curl -X POST https://open-chords.org/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}' \
  | jq
```

Should return:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "email": "your-email@example.com",
    "userId": "...",
    "role": "admin"
  }
}
```

