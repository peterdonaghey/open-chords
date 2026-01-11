# Admin API Import Fix

## issue
admin panel showing "Failed to load admin data"
server error: `FUNCTION_INVOCATION_FAILED`

## cause
`api/admin/users.js` was importing `isAdmin` function from `_auth.js` which was removed during cognito → custom auth migration

## fix
removed `isAdmin` import from `api/admin/users.js` line 3
(the function checks `authResult.isAdmin` property instead, which is returned by `authenticateRequest`)

## verification
```bash
curl https://open-chords.org/api/admin/users
# before: FUNCTION_INVOCATION_FAILED
# after: {"error":"Authentication required"}
```

## deployment
deployed to production
admin panel should now work once signed in

