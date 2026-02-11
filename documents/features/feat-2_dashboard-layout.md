# feat:2_dashboard-layout — Dashboard Layout

## Overview

Implements the dashboard shell layout for StoryForge AI: sidebar navigation, top header with user profile, responsive mobile menu, and a populated dashboard home page.

## What's Implemented

### Dashboard Layout Shell (`src/app/(dashboard)/layout.tsx`)
- Desktop: fixed left sidebar (w-64) + scrollable main content area
- Mobile: sidebar hidden, accessible via hamburger menu (slide-in Sheet)
- Wraps all `(dashboard)` route group pages

### Sidebar Navigation (`src/components/dashboard/sidebar.tsx`)
- "StoryForge AI" branding matching auth layout
- "New Story" CTA button linking to `/projects/new`
- Nav links: Dashboard, Projects, Media Library, Templates, Settings
- Active link highlighting using `usePathname()`

### Header (`src/components/dashboard/header.tsx`)
- Hamburger menu toggle (visible on mobile only)
- Dynamic page title derived from current pathname
- User profile dropdown with avatar, name, email, Settings link, Sign Out

### Dashboard Home Page (`src/app/(dashboard)/dashboard/page.tsx`)
- Server Component using `auth()` + Prisma for data fetching
- Welcome message with user's name
- "Create New Story" CTA
- Stats cards: Total Projects, Videos Created, Storage Used
- Recent projects list (5 most recent) with status badges and relative timestamps
- Empty state with "Create Your First Story" CTA

### New UI Components (Shadcn/UI pattern)
- **Avatar** (`src/components/ui/avatar.tsx`) — Image with initials fallback
- **Badge** (`src/components/ui/badge.tsx`) — CVA variants for status labels
- **DropdownMenu** (`src/components/ui/dropdown-menu.tsx`) — Native React dropdown (no Radix)
- **Sheet** (`src/components/ui/sheet.tsx`) — Slide-in panel for mobile menu

### Utility Functions (`src/lib/utils.ts`)
- `formatBytes(bytes)` — Human-readable file size (e.g., "1.5 MB")
- `formatRelativeTime(date)` — Relative time (e.g., "3h ago")

## Files Created (9)

| File | Purpose |
|------|---------|
| `src/components/ui/avatar.tsx` | Avatar component |
| `src/components/ui/badge.tsx` | Badge component |
| `src/components/ui/dropdown-menu.tsx` | Dropdown menu component |
| `src/components/ui/sheet.tsx` | Sheet/drawer component |
| `src/components/dashboard/sidebar.tsx` | Sidebar navigation |
| `src/components/dashboard/header.tsx` | Top header bar |
| `src/components/dashboard/stats-cards.tsx` | Stats card grid |
| `src/components/dashboard/recent-projects.tsx` | Recent projects list |
| `src/app/(dashboard)/layout.tsx` | Dashboard layout shell |

## Files Modified (2)

| File | Changes |
|------|---------|
| `src/lib/utils.ts` | Added `formatBytes()` and `formatRelativeTime()` |
| `src/app/(dashboard)/dashboard/page.tsx` | Replaced stub with full Server Component |

## Key Decisions

- **No Radix UI** — DropdownMenu and Sheet built with native React state + click-outside + escape key
- **Dashboard layout is client component** — needs `useState` for mobile menu toggle
- **Dashboard page is server component** — uses `auth()` + Prisma directly, no API routes needed
- **`buttonVariants()` for Link-as-Button** — avoids modifying existing Button component
