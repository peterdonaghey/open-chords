# Admin Seed Script Fix

## issue
password hash from initial `create-admin-user.js` didn't match signin hash algorithm

## solution
created `scripts/seed-admin.js` that:
- reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env.local`
- uses same scrypt hashing as signin endpoint
- overwrites existing user (no conditional check)
- can be run multiple times safely

## changes
- **new**: `scripts/seed-admin.js` - idempotent admin seeding
- **new**: `scripts/ADMIN_SETUP.md` - admin setup docs
- **updated**: `.env.local` - added `ADMIN_EMAIL` and `ADMIN_PASSWORD`

## verification
```bash
node scripts/seed-admin.js
# ✅ Admin user seeded successfully!

curl -s -X POST https://open-chords.org/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"donagheypeter@googlemail.com","password":"Openchords123!"}' \
  | jq -r '.user.role'
# admin
```

## usage
1. set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local`
2. run `node scripts/seed-admin.js`
3. sign in with those credentials

