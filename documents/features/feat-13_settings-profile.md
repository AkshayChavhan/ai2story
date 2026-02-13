# Feature 13: Settings & Profile

## Overview

Settings page with Profile management (view/update name, view account info) and Security section (change password). OAuth-only users see a disabled password section with an explanation message.

## User Stories

- As a user, I want to update my display name so my profile reflects my identity.
- As a user, I want to view my account information (email, provider, member since, stats).
- As a user, I want to change my password to keep my account secure.
- As an OAuth user, I want to understand why password change is not available.

## Technical Implementation

### API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | /api/user/profile | Fetch current user profile |
| PUT | /api/user/profile | Update user name |
| PUT | /api/user/password | Change password (current + new) |

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| ProfileForm | Client | Name edit form + read-only account info display |
| PasswordForm | Client | Change password form with visibility toggles |

### Validation Schemas

- `updateProfileSchema` — name (2-50 chars, required)
- `changePasswordSchema` — currentPassword (required), newPassword (8+ chars, uppercase, lowercase, number), confirmNewPassword (must match)

### Settings Page

- Server Component with auth check
- Fetches user profile via Prisma (name, email, provider, emailVerified, passwordHash existence, stats)
- Renders ProfileForm above Separator above PasswordForm
- Passes serialized user data (dates as ISO strings) to client components

## Files Created

- `src/app/api/user/profile/route.ts` — Profile API (GET/PUT)
- `src/app/api/user/password/route.ts` — Password API (PUT)
- `src/components/settings/profile-form.tsx` — Profile form component
- `src/components/settings/password-form.tsx` — Password form component

## Files Modified

- `src/app/(dashboard)/settings/page.tsx` — Rewritten from stub to full settings page
- `src/lib/validations/auth.ts` — Added updateProfileSchema, changePasswordSchema

## Design Decisions

1. **Two API routes** — Profile and password are separate concerns
2. **No avatar upload** — Avatar field exists in schema but skipped for MVP
3. **No notification preferences** — Empty notifications/ dir stays for future feature
4. **OAuth password guard** — Users without passwordHash cannot change password
5. **Server-side profile fetch** — Settings page uses Prisma in Server Component
6. **Read-only account info** — Email, provider, stats displayed but not editable
7. **Form reset on password change** — Clears all fields after successful change
8. **No new dependencies** — All UI components and auth utilities already exist
