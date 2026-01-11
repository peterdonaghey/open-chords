# signup email verification bug fix

## problem
- user signed up but never received verification email
- auth system migrated from cognito to custom jwt but ui still had email verification flow
- signup redirected to verify-email page that expected email that would never come

## root causes

### backend has no email sending
- `api/auth/signup.js` creates user and returns jwt immediately
- no email service configured
- no verification codes generated

### frontend still expected cognito flow
- `SignupForm.jsx` redirected to `/verify-email` after signup
- `LoginForm.jsx` had cognito error handling for unconfirmed users
- `auth.js` had no-op stub functions for email verification
- `AuthContext.jsx` didn't refresh auth state after signup

## fixes

### SignupForm.jsx
- removed redirect to `/verify-email`
- navigate to home `/` after successful signup
- simplified error handling (removed cognito-specific codes)

### LoginForm.jsx  
- removed cognito-specific error handling
- removed redirect to verify-email for unconfirmed users
- simplified to generic error message

### AuthContext.jsx
- added `checkAuth()` call after successful signup
- ensures user state refreshes and user is logged in immediately
- matches behavior of signIn function

## behavior now
- user signs up with email/password
- account created, jwt token stored
- user logged in immediately
- redirected to home page
- no email verification required

## files kept unchanged
- `VerifyEmailForm.jsx` - left in place (unused but harmless)
- `App.jsx` verify-email route - left in place (dead route but harmless)
- `auth.js` no-op functions - backward compatibility stubs

