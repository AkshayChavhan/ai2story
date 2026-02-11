# Feature: Authentication System
## Feature ID: feat:1
## Status: ✅ Completed
## Commits: feat:1_auth-system

---

## What This Feature Does:
Complete authentication system with email/password signup, OAuth (Google/GitHub), email verification, forgot/reset password, single device login enforcement, login history tracking, and route protection middleware.

## User Stories:
- As a user, I can sign up with email and password
- As a user, I can sign in with Google or GitHub OAuth
- As a user, I must verify my email before accessing features
- As a user, I can reset my password via email
- As a user, I am automatically logged out when I sign in from another device
- As a user, I receive a security alert email when a new device accesses my account

## Files Created:
| File | Purpose |
|------|---------|
| `src/lib/validations/auth.ts` | Zod validation schemas for all auth forms |
| `src/lib/auth-utils.ts` | Token generation, password hashing, device parsing |
| `src/components/ui/label.tsx` | Shadcn/UI Label component |
| `src/components/ui/card.tsx` | Shadcn/UI Card component set |
| `src/components/ui/separator.tsx` | Shadcn/UI Separator component |
| `src/components/providers/session-provider.tsx` | NextAuth SessionProvider wrapper |
| `src/components/forms/auth/form-error.tsx` | Reusable error message component |
| `src/components/forms/auth/form-success.tsx` | Reusable success message component |
| `src/components/forms/auth/oauth-buttons.tsx` | Google + GitHub OAuth buttons |
| `src/components/forms/auth/signup-form.tsx` | Signup form with Zod validation |
| `src/components/forms/auth/login-form.tsx` | Login form with session-expired handling |
| `src/components/forms/auth/forgot-password-form.tsx` | Forgot password form |
| `src/components/forms/auth/reset-password-form.tsx` | Reset password form |
| `src/app/(auth)/layout.tsx` | Auth pages layout with branding |
| `src/app/(auth)/reset-password/[token]/page.tsx` | Reset password page |
| `src/app/api/auth/signup/route.ts` | POST signup endpoint |
| `src/app/api/auth/verify-email/route.ts` | POST email verification endpoint |
| `src/app/api/auth/resend-verification/route.ts` | POST resend verification endpoint |
| `src/app/api/auth/record-login/route.ts` | POST login history recording endpoint |
| `src/app/api/auth/forgot-password/route.ts` | POST forgot password endpoint |
| `src/app/api/auth/reset-password/route.ts` | POST reset password endpoint |
| `src/middleware.ts` | Route protection middleware |
| `src/types/next-auth.d.ts` | NextAuth type extensions |

## Files Modified:
| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Added PasswordResetToken model |
| `src/lib/auth.ts` | Full rewrite with signIn, jwt, session callbacks |
| `src/lib/email.ts` | Added sendNewDeviceAlert() |
| `src/app/(auth)/login/page.tsx` | Full login page with Card, forms, OAuth |
| `src/app/(auth)/signup/page.tsx` | Full signup page with Card, forms, OAuth |
| `src/app/(auth)/forgot-password/page.tsx` | Full forgot password page |
| `src/app/(auth)/verify-email/[token]/page.tsx` | Auto-verification with states |
| `src/app/layout.tsx` | Added AuthSessionProvider wrapper |
| `package.json` | Downgraded Prisma to v6 (v7 incompatible) |

## Database Changes:
- Added `PasswordResetToken` model (email, token, expires)
- Downgraded Prisma from v7 to v6 for schema compatibility

## API Endpoints:
| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/signup` | Create new user account |
| POST | `/api/auth/verify-email` | Verify email with token |
| POST | `/api/auth/resend-verification` | Resend verification email |
| POST | `/api/auth/record-login` | Record login history |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |

## Dependencies Changed:
- Downgraded `prisma` from ^7.3.0 to ^6.0.0
- Downgraded `@prisma/client` from ^7.3.0 to ^6.0.0

## Key Architectural Decisions:
1. No PrismaAdapter — manual OAuth handling in signIn callback avoids conflicts with JWT + Credentials
2. Single device enforcement via activeSessionId in JWT callback with 30s database cache
3. Separate PasswordResetToken model (not reusing VerificationToken) for different expiry policies
4. Two-call pattern for login: signIn() then record-login API for device/IP tracking
5. Generic error messages for forgot-password and resend-verification to prevent email enumeration

## Known Limitations:
- JWT callback hits database every 30s for single-device check (acceptable for MVP)
- No rate limiting on auth endpoints (planned for future)
- Email sending depends on Resend API key being configured
