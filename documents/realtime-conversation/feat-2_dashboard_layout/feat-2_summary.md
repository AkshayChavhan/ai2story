# feat:2_dashboard-layout — Dashboard Layout

**Status:** Complete and pushed to GitHub
**Branch:** `feat-2_dashboard-layout`
**Scope:** 24 files changed, ~1,046 lines added

---

## What's Implemented

### Dashboard Layout Shell (`src/app/(dashboard)/layout.tsx`)
- Desktop: fixed left sidebar (w-64) + scrollable main content area
- Mobile: sidebar hidden, accessible via hamburger menu (slide-in Sheet)
- Wraps all `(dashboard)` route group pages

### Sidebar Navigation (`src/components/dashboard/sidebar.tsx`)
- "StoryForge AI" branding matching auth layout style
- "New Story" CTA button linking to `/projects/new`
- Nav links: Dashboard, Projects, Media Library, Templates, Settings
- Active link highlighting using `usePathname()`
- `onNavigate` callback for closing mobile Sheet on link click

### Header (`src/components/dashboard/header.tsx`)
- Hamburger menu toggle (visible on mobile only via `lg:hidden`)
- Dynamic page title derived from current pathname
- User profile dropdown with avatar, name, email, Settings link, Sign Out

### Dashboard Home Page (`src/app/(dashboard)/dashboard/page.tsx`)
- Server Component using `auth()` + Prisma for data fetching
- Parallel `Promise.all()` queries for user stats + recent projects + project count
- Welcome message with user's display name
- "Create New Story" CTA
- Stats cards: Total Projects, Videos Created, Storage Used
- Recent projects list (5 most recent) with status badges and relative timestamps
- Empty state with "Create Your First Story" CTA when no projects exist

### New UI Components (Shadcn/UI pattern)
- **Avatar** (`src/components/ui/avatar.tsx`) — Image with initials fallback, `"use client"` for error state
- **Badge** (`src/components/ui/badge.tsx`) — CVA variants: default, secondary, destructive, outline
- **DropdownMenu** (`src/components/ui/dropdown-menu.tsx`) — Native React dropdown with click-outside + escape key (no Radix dependency)
- **Sheet** (`src/components/ui/sheet.tsx`) — Slide-in panel with overlay + CSS transitions for mobile menu

### Utility Functions (`src/lib/utils.ts`)
- `formatBytes(bytes)` — Human-readable file size (e.g., "1.5 MB")
- `formatRelativeTime(date)` — Relative time (e.g., "3h ago", "2d ago")

### Pre-existing Build Fixes
- **Middleware** rewritten to use `getToken()` from `next-auth/jwt` (edge-compatible, removes Prisma/crypto from edge runtime)
- **Zod v4**: `.errors` → `.issues` in 3 API routes (`signup`, `forgot-password`, `reset-password`)
- **Button `asChild`** replaced with `buttonVariants()` pattern in `verify-email` page and `reset-password-form`
- **Resend** lazy initialization to allow build without API key
- **fluent-ffmpeg** type declaration added (`src/types/fluent-ffmpeg.d.ts`)
- **voice-generator** `audioStream` destructuring fix

## Key Design Decisions

1. **No Radix UI** — DropdownMenu and Sheet built with native `useState` + click-outside + escape key. Zero new dependencies.
2. **Dashboard layout is `"use client"`** — needs `useState` for mobile menu toggle shared between header hamburger and Sheet. Children pages remain server components.
3. **Dashboard page is Server Component** — uses `auth()` + Prisma directly. No API route needed, no loading spinner, data fetched at render time.
4. **`buttonVariants()` for Link-as-Button** — existing export from `button.tsx`, avoids modifying Button component to add `asChild` prop.

## Files Created (9)

| File | Purpose |
|------|---------|
| `src/app/(dashboard)/layout.tsx` | Dashboard layout shell |
| `src/components/dashboard/sidebar.tsx` | Sidebar navigation |
| `src/components/dashboard/header.tsx` | Top header bar |
| `src/components/dashboard/stats-cards.tsx` | Stats card grid |
| `src/components/dashboard/recent-projects.tsx` | Recent projects list |
| `src/components/ui/avatar.tsx` | Avatar component |
| `src/components/ui/badge.tsx` | Badge component |
| `src/components/ui/dropdown-menu.tsx` | Dropdown menu component |
| `src/components/ui/sheet.tsx` | Sheet/drawer component |

## Files Modified (13)

| File | Changes |
|------|---------|
| `src/lib/utils.ts` | Added `formatBytes()` and `formatRelativeTime()` |
| `src/app/(dashboard)/dashboard/page.tsx` | Replaced stub with full Server Component |
| `src/middleware.ts` | Rewritten to use `getToken()` (edge-compatible) |
| `src/app/api/auth/signup/route.ts` | Zod v4 `.issues` fix |
| `src/app/api/auth/forgot-password/route.ts` | Zod v4 `.issues` fix |
| `src/app/api/auth/reset-password/route.ts` | Zod v4 `.issues` fix |
| `src/app/api/auth/record-login/route.ts` | Prisma JSON type spread fix |
| `src/app/(auth)/verify-email/[token]/page.tsx` | `asChild` → `buttonVariants()` |
| `src/components/forms/auth/reset-password-form.tsx` | `asChild` → `buttonVariants()` |
| `src/lib/email.ts` | Lazy Resend initialization |
| `src/lib/ai/video-composer.ts` | Error handler type annotation |
| `src/lib/ai/voice-generator.ts` | `audioStream` destructuring |
| `documents/architecture/ARCHITECTURE.md` | Updated commit reference + decisions |
