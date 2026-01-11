# Auth Simplification Complete

## changes

**removed**
- cognito sdk (amazon-cognito-identity-js, jwks-rsa) - 33 packages
- 322 lines from `src/services/auth.js`
- 97 lines from `api/_auth.js`
- 8 env vars (cognito + admin email hardcodes)
- all cognito errors

**added**
- `api/_users.js` - dynamodb users table with role field
- `api/auth/signup.js`, `signin.js`, `forgot-password.js`, `reset-password.js`, `me.js`
- simple jwt-based auth using node crypto for password hashing
- `open-chords-users` table in dynamodb
- role-based authorization (`user` | `admin`)

**test results**
- ✅ localhost: no cognito errors in console
- ✅ production: no cognito errors in console
- ✅ api test: `curl` signin returns jwt token with `role: "admin"`
- ✅ admin user created: donagheypeter@googlemail.com with role=admin

## verification

```bash
curl -X POST https://open-chords.org/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"donagheypeter@googlemail.com","password":"Openchords123!"}'

# response:
{
  "token":"eyJhbGc...",
  "user":{
    "email":"donagheypeter@googlemail.com",
    "userId":"c977f595-9910-4761-bee2-6fa70d3a368e",
    "role":"admin"
  }
}
```

## next steps

user needs to test signin in browser manually (browser automation had form input issues)
- click user menu → sign in
- enter: donagheypeter@googlemail.com / Openchords123!
- should see admin panel option in profile menu
- should be able to access /admin page

