# feat:1_auth-system — Authentication System

**Status:** Complete and pushed to GitHub
**Scope:** 36 files, 5,263 lines added

---

## What's Implemented

### Signup Flow

- Email/password registration with Zod validation (name, email, password rules)
- Password hashing with bcrypt (12 salt rounds)
- Email verification required (24-hour token, auto-verifies on page load)
- Resend verification email endpoint

### Login Flow

- Email/password sign-in via NextAuth Credentials
- Google OAuth + GitHub OAuth (auto-creates user & links account)
- OAuth users get email auto-verified
- Login history recording (device, browser, OS, IP)
- Security alert email on new device detection

### Single Device Enforcement

- `activeSessionId` set on login via JWT callback
- New login overwrites the previous session ID
- Old session detected as expired on next request (30s cache)
- Middleware redirects expired sessions to `/login?error=session-expired`
- Toast notification: "You've been logged out because your account was accessed from another device"

### Forgot/Reset Password

- Password reset via email (1-hour token)
- Generic error messages to prevent email enumeration
- Reset clears `activeSessionId` (forces re-login everywhere)

### Route Protection (Middleware)

- Dashboard routes require authentication
- Auth pages redirect to dashboard if already logged in
- Expired sessions get redirected with error param

### New UI Components

- Card, Label, Separator (Shadcn/UI pattern)
