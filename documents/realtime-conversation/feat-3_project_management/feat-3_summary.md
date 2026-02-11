# feat:3_project-management — Project Management (CRUD)

**Status:** Complete and pushed to GitHub
**Branch:** `feat-3_project-management`
**Scope:** 16 files changed (12 created, 4 modified)

---

## What's Implemented

### API Routes
- **GET /api/projects** — List projects with search (title, case-insensitive), status filter, genre filter, pagination (page/limit, default 12)
- **POST /api/projects** — Create project with Zod validation (`createProjectSchema`)
- **GET /api/projects/[id]** — Fetch single project with scene/character counts, ownership verified
- **PUT /api/projects/[id]** — Update project fields with partial Zod validation (`updateProjectSchema`)
- **DELETE /api/projects/[id]** — Delete project, Prisma cascades scenes/characters
- All routes use `auth()` + `session.user.id` ownership check

### Projects List Page (`/projects`)
- Server Component with `auth()` + redirect
- "My Projects" heading + "New Story" CTA button
- Client-side `ProjectList` with debounced search, status/genre filters, pagination (12 per page)
- Empty state: "No projects yet" with "Create Your First Story" CTA
- Filter empty state: "No projects match your filters"

### Create Project Page (`/projects/new`)
- Server Component with `auth()` + redirect
- "Back to Projects" link + "Create New Story" heading
- Multi-section `CreateForm` (react-hook-form + zodResolver):
  - Story Details: title (required), description (optional), prompt (required)
  - Story Settings: genre, tone, target audience, target length (30-300s)
  - Visual Settings: image style, aspect ratio
- On success: redirects to `/projects/[id]` with toast notification

### Project Overview Page (`/projects/[id]`)
- Server Component fetching project via Prisma with ownership verification
- `notFound()` if project doesn't exist or isn't owned by user
- Displays: title + status badge, description, created/updated timestamps
- Story Prompt card with full prompt text
- Project Settings metadata grid (genre, tone, audience, image style, aspect ratio, language, target length)
- Stats cards: Scenes count, Characters count, Version number
- "Generate Story" CTA for draft projects (links to `/projects/[id]/story` — stub for feat:4)
- Action buttons (client `ProjectActions` component): Edit Story, Delete (with confirmation dialog)

### New UI Components (Shadcn/UI pattern)
- **Textarea** (`src/components/ui/textarea.tsx`) — Styled textarea matching Input component pattern
- **Select** (`src/components/ui/select.tsx`) — Native `<select>` wrapper with consistent styling (no Radix)
- **Dialog** (`src/components/ui/dialog.tsx`) — Modal dialog with portal, overlay, escape key, click-outside (no Radix)

### Project Components
- **ProjectCard** — Card with title, description excerpt, status badge, genre, scene count, relative time
- **ProjectFilters** — Search input (debounced 300ms) + status/genre select filters
- **ProjectList** — Client component fetching `/api/projects` with filter params + pagination
- **DeleteDialog** — Confirmation modal calling DELETE API, Sonner toast feedback
- **CreateForm** — Multi-section form with react-hook-form + zodResolver + createProjectSchema
- **ProjectActions** — Client wrapper for Edit/Delete buttons with delete dialog state

### Validation Schemas (`src/lib/validations/project.ts`)
- `createProjectSchema` — title (1-100), prompt (1-2000), description (optional, max 500), genre/tone/audience enums, targetLength (30-300), language (default "en"), imageStyle (default "photorealistic"), aspectRatio (default "9:16")
- `updateProjectSchema` — Partial version of create schema
- Exported option arrays: `genreOptions`, `toneOptions`, `audienceOptions`, `imageStyleOptions`, `aspectRatioOptions`

### Utility Functions (`src/lib/utils.ts`)
- `formatDate(date)` — Human-readable date (e.g., "Feb 11, 2026")
- `capitalize(str)` — Capitalize first letter

## Key Design Decisions

1. **API routes for project CRUD** — Project list needs client-side search/filter/pagination, unlike dashboard which uses direct Prisma queries in a Server Component
2. **Native `<select>` not Radix Select** — Consistent with project's zero-Radix dependency policy
3. **Dialog without Radix** — Same native React pattern as DropdownMenu and Sheet: portal + click-outside + escape key
4. **react-hook-form + Zod** — Already in dependencies from auth forms, consistent validation pattern
5. **`z.input<>` for form types** — Uses Zod input type (not `z.infer` output type) to avoid type mismatch with react-hook-form when schema has `.default()` fields
6. **Next.js 16 `params` is a Promise** — All route handlers and page components use `await params`
7. **Ownership verification** — Every API route and page checks `project.userId === session.user.id`, returns 404 (not 403) to avoid revealing project existence

## Build Fix

- **zodResolver type mismatch** — `z.infer<>` produces the output type where fields with `.default()` are required, but react-hook-form expects the input type where they're optional. Fixed by using `z.input<typeof createProjectSchema>` instead.

## Files Created (12)

| File | Purpose |
|------|---------|
| `src/lib/validations/project.ts` | Zod schemas + option arrays |
| `src/components/ui/textarea.tsx` | Textarea component |
| `src/components/ui/select.tsx` | Select component |
| `src/components/ui/dialog.tsx` | Dialog component |
| `src/app/api/projects/route.ts` | GET list + POST create |
| `src/app/api/projects/[id]/route.ts` | GET + PUT + DELETE |
| `src/components/projects/project-card.tsx` | Project card for grid |
| `src/components/projects/project-filters.tsx` | Search + filter controls |
| `src/components/projects/project-list.tsx` | Project list with pagination |
| `src/components/projects/delete-dialog.tsx` | Delete confirmation dialog |
| `src/components/projects/create-form.tsx` | Project creation form |
| `src/components/projects/project-actions.tsx` | Edit/Delete action buttons |

## Files Modified (4)

| File | Changes |
|------|---------|
| `src/lib/utils.ts` | Added `formatDate()` and `capitalize()` |
| `src/app/(dashboard)/projects/page.tsx` | Replaced stub with Server Component + ProjectList |
| `src/app/(dashboard)/projects/new/page.tsx` | Replaced stub with Server Component + CreateForm |
| `src/app/(dashboard)/projects/[id]/page.tsx` | Replaced stub with Server Component + project overview |
