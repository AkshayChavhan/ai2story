# feat:2_dashboard-layout — Development Conversation

## Task

Build the dashboard layout for StoryForge AI: sidebar navigation, top header with user profile, responsive mobile menu, and a populated dashboard home page.

## Plan (Approved)

### Context
feat:1_auth-system was complete. All dashboard pages existed as stubs with no layout shell. No `src/app/(dashboard)/layout.tsx` existed.

### Approach
- Sidebar + header layout wrapping all `(dashboard)` route group pages
- Desktop: fixed left sidebar (w-64) + scrollable main area
- Mobile: sidebar hidden, accessible via hamburger menu (slide-in Sheet)
- Dashboard home page as Server Component using `auth()` + Prisma for data
- No new npm dependencies — use existing Tailwind, Lucide React, CVA, cn()
- 4 new UI primitives (Avatar, Badge, DropdownMenu, Sheet) following existing Shadcn/UI patterns
- `buttonVariants()` for Link-as-Button (existing export from button.tsx)

### Implementation Steps
1. **Utilities** — Add `formatBytes()` and `formatRelativeTime()` to `src/lib/utils.ts`
2. **UI Primitives** — Avatar, Badge, DropdownMenu, Sheet (Shadcn/UI pattern)
3. **Dashboard Layout Components** — Sidebar, Header, Layout shell
4. **Dashboard Home Page** — StatsCards, RecentProjects, rewrite page with Prisma queries
5. **Documentation** — Feature doc + architecture update
6. **Build & Verify** — `npm run build` to check compilation

### Navigation Structure
| Label | Path | Icon | Active Match |
|-------|------|------|-------------|
| Dashboard | `/dashboard` | `LayoutDashboard` | exact |
| Projects | `/projects` | `FolderOpen` | startsWith |
| Media Library | `/media` | `ImageIcon` | startsWith |
| Templates | `/templates` | `BookTemplate` | startsWith |
| Settings | `/settings` | `Settings` | startsWith |

## Build Issues Encountered & Fixed

### 1. Prisma + crypto in Edge Runtime (middleware)
**Error:** `A Node.js module is loaded ('crypto' at line 7) which is not supported in the Edge Runtime` and Prisma WASM module resolution failure.
**Cause:** Middleware imported `auth()` from `src/lib/auth.ts` which imports Prisma and crypto — both unavailable in edge runtime.
**Fix:** Rewrote middleware to use `getToken()` from `next-auth/jwt` which is edge-compatible and reads JWT directly without Prisma/crypto. Also excluded `/api` routes from middleware matcher since they handle their own auth.

### 2. Zod v4 `.errors` → `.issues`
**Error:** `Property 'errors' does not exist on type 'ZodError'`
**Cause:** Zod v4 renamed `.errors` to `.issues` on `ZodError` objects.
**Fix:** Updated 3 API routes: `signup`, `forgot-password`, `reset-password`.

### 3. Button `asChild` prop doesn't exist
**Error:** `Property 'asChild' does not exist on type 'ButtonProps'`
**Cause:** The custom Button component doesn't support Radix-style `asChild` prop.
**Fix:** Replaced `<Button asChild><Link>` with `<Link className={buttonVariants()}>` in `verify-email` page and `reset-password-form`.

### 4. Resend API key required at build time
**Error:** `Missing API key. Pass it to the constructor`
**Cause:** `new Resend(process.env.RESEND_API_KEY)` runs at module load during build's static analysis.
**Fix:** Lazy initialization — `getResend()` function creates Resend instance on first call, not at module load.

### 5. fluent-ffmpeg missing types
**Error:** `Could not find a declaration file for module 'fluent-ffmpeg'`
**Fix:** Created `src/types/fluent-ffmpeg.d.ts` with `declare module "fluent-ffmpeg"`.

### 6. voice-generator stream API
**Error:** `Property 'on' does not exist on type '{ audioStream: Readable; metadataStream: Readable | null; }'`
**Cause:** `tts.toStream()` returns `{ audioStream, metadataStream }`, not a direct stream.
**Fix:** Destructured `{ audioStream }` from `tts.toStream()`.

### 7. Prisma JSON type for DeviceInfo
**Error:** `Type 'DeviceInfo' is not assignable to type 'InputJsonValue'`
**Fix:** Spread the object `{ ...deviceInfo }` to convert from interface to plain object.

## Outcome

Build passes successfully (`npm run build` — all 26 routes compiled, TypeScript clean). Code committed and pushed to `feat-2_dashboard-layout` branch. PR to be created by user for merge into `main`.
