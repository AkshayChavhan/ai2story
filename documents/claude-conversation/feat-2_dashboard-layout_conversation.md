# Conversation: feat:2_dashboard-layout
## Date: 2026-02-11
## Feature: Dashboard Layout
## Commit: feat:2_dashboard-layout

---

### User Request:
> Ready for feat:2. Implement the dashboard layout as defined in the STORYFORGE_AI.md spec.

### Claude's Plan:
Implemented the dashboard shell layout in 6 steps:
1. Utilities — Added `formatBytes()` and `formatRelativeTime()` to utils.ts
2. UI Primitives — Created Avatar, Badge, DropdownMenu, Sheet (all Shadcn/UI pattern, no Radix)
3. Dashboard Layout — Created Sidebar (with active link via usePathname), Header (hamburger + page title + profile dropdown), Layout shell (desktop sidebar + mobile Sheet)
4. Dashboard Home Page — Server Component with auth() + Prisma queries for user stats + recent projects
5. Documentation — Feature docs and architecture updates
6. Build & Verify — Fixed 8 pre-existing build issues from feat:1

### Key Decisions Made:
1. **No Radix UI** — DropdownMenu and Sheet built with native React state + click-outside + escape key
2. **Dashboard layout is client component** — Needs useState for mobile menu toggle; children pages remain server components
3. **Dashboard page is server component** — Uses auth() + Prisma directly, no API route needed
4. **`buttonVariants()` for Link-as-Button** — Existing export, avoids adding `asChild` to Button

### Build Issues Fixed (pre-existing from feat:1):
- Middleware: Rewritten from `auth()` to `getToken()` (edge-compatible, no Prisma/crypto)
- Zod v4: `.errors` → `.issues` in 3 API routes
- Button `asChild`: Replaced with `buttonVariants()` pattern
- Resend: Lazy initialization via `getResend()` function
- fluent-ffmpeg: Added type declaration file
- voice-generator: Fixed `audioStream` destructuring
- video-composer: Added error handler type annotation
- record-login: Prisma JSON type spread fix

### What Was Learned:
- Next.js middleware runs on Edge Runtime — cannot import Prisma or Node.js crypto
- `getToken()` from `next-auth/jwt` is the edge-compatible way to check JWT sessions
- Zod v4 renamed `.errors` to `.issues` on ZodError
- Resend constructor fails at module load time if API key is missing — must use lazy initialization

### Next Steps:
- feat:3_project-management — Project CRUD (list, create, view, edit, delete)
