# feat:13_settings-profile — Development Conversation

## Planning Phase

Explored the codebase to understand existing patterns:
- Settings page was a stub with empty subdirs: profile/, security/, notifications/
- Auth utilities (hashPassword, verifyPassword) already existed in auth-utils.ts
- Password validation pattern (8+ chars, uppercase, lowercase, number) in validations/auth.ts
- Form pattern (react-hook-form + Zod + Card + toast) from create-form.tsx
- Password visibility toggle (Eye/EyeOff) from login-form.tsx
- User model has: name, avatar, email, provider, videosCreated, storageUsedBytes, createdAt

## Implementation Steps

### Step 1: Validation Schemas
Added to `src/lib/validations/auth.ts`:
- `updateProfileSchema` — name (2-50 chars)
- `changePasswordSchema` — currentPassword, newPassword (8+ with uppercase/lowercase/number), confirmNewPassword with refine match

### Step 2: Profile API Route
Created `src/app/api/user/profile/route.ts`:
- GET: Auth check → Prisma findUnique → return user data (name, email, avatar, provider, emailVerified, videosCreated, storageUsedBytes, createdAt)
- PUT: Auth check → validate with updateProfileSchema → Prisma update name → return updated user

### Step 3: Password API Route
Created `src/app/api/user/password/route.ts`:
- PUT: Auth check → validate with changePasswordSchema → fetch passwordHash → guard OAuth users (no hash) → verifyPassword current → hashPassword new → update

### Step 4: ProfileForm Component
Created `src/components/settings/profile-form.tsx`:
- Card 1: Profile Information — editable name field with Save button
- Card 2: Account Information — read-only display of email (with verified badge), auth provider badge, member since, projects created, storage used

### Step 5: PasswordForm Component
Created `src/components/settings/password-form.tsx`:
- If !hasPassword: message about OAuth provider handling passwords
- If hasPassword: three fields (current, new, confirm) with Eye/EyeOff toggles
- Reset form on successful password change

### Step 6: Settings Page
Rewrote `src/app/(dashboard)/settings/page.tsx`:
- Server Component with auth check
- Prisma fetch of user data including passwordHash existence
- Serialized dates as ISO strings for client components
- Renders ProfileForm → Separator → PasswordForm

## Design Decisions

- Two separate API routes for profile and password (clean separation)
- No avatar upload for MVP (field exists but skipped)
- No notification preferences (future feature)
- OAuth users can't change password (no passwordHash exists)
- Server-side profile fetch via Prisma in Server Component
- Read-only account info (email, provider, stats not editable)
