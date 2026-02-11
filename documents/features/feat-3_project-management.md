# feat:3_project-management — Project Management (CRUD)

## Overview

Implements full project CRUD for StoryForge AI: listing with search/filter/pagination, creating projects via a multi-section form, viewing project overview with metadata, and deleting projects with confirmation.

## What's Implemented

### API Routes
- **GET /api/projects** — List projects with search (title, case-insensitive), status filter, genre filter, pagination (page/limit, default 12)
- **POST /api/projects** — Create project with Zod validation
- **GET /api/projects/[id]** — Fetch single project with scene/character counts
- **PUT /api/projects/[id]** — Update project fields with partial Zod validation
- **DELETE /api/projects/[id]** — Delete project (cascades scenes/characters)
- All routes verify authentication via `auth()` and ownership via `userId` check

### Projects List Page (`/projects`)
- Server Component with auth check
- "My Projects" heading + "New Story" CTA
- Client-side ProjectList with search, status/genre filters, and pagination
- Empty state with "Create Your First Story" CTA

### Create Project Page (`/projects/new`)
- Server Component with auth check
- Multi-section form with react-hook-form + Zod validation
- Sections: Story Details (title, description, prompt), Story Settings (genre, tone, audience, length), Visual Settings (image style, aspect ratio)
- Redirects to project overview on success

### Project Overview Page (`/projects/[id]`)
- Server Component fetching project via Prisma with ownership verification
- Displays: title, status badge, description, timestamps, story prompt, settings metadata grid, scene/character/version counts
- Action buttons: Edit Story, Delete (with confirmation dialog)
- "Generate Story" CTA for draft projects (links to `/projects/[id]/story` — stub for feat:4)

### New UI Components (Shadcn/UI pattern)
- **Textarea** (`src/components/ui/textarea.tsx`) — Styled textarea matching Input component
- **Select** (`src/components/ui/select.tsx`) — Native `<select>` wrapper with consistent styling
- **Dialog** (`src/components/ui/dialog.tsx`) — Modal dialog (no Radix — native React + portal + escape + click-outside)

### Project Components
- **ProjectCard** — Card with title, description excerpt, status badge, genre, scene count, relative time
- **ProjectFilters** — Search input (debounced 300ms) + status/genre select filters
- **ProjectList** — Client component fetching `/api/projects` with filters and pagination
- **DeleteDialog** — Confirmation modal using Dialog component, calls DELETE API
- **CreateForm** — Multi-section form with react-hook-form + zodResolver
- **ProjectActions** — Client wrapper for Edit/Delete buttons with delete dialog state

### Validation Schemas
- `createProjectSchema` — Title (1-100), prompt (1-2000), description (optional, max 500), genre/tone/audience (enums), targetLength (30-300), language, imageStyle, aspectRatio
- `updateProjectSchema` — Partial version of create schema
- Exported option arrays for form selects

### Utility Functions (`src/lib/utils.ts`)
- `formatDate(date)` — Human-readable date (e.g., "Feb 11, 2026")
- `capitalize(str)` — Capitalize first letter

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

## Key Decisions

- **API routes for CRUD** — Project list needs client-side filtering/search, unlike dashboard which uses direct Prisma queries
- **Native `<select>`** — No Radix UI dependency, consistent with project policy
- **Dialog without Radix** — Same native React pattern as DropdownMenu and Sheet
- **`z.input<>` for form types** — Uses Zod input type (not output) to avoid type mismatch with react-hook-form when schema has `.default()` fields
- **Next.js 16 `params` is a Promise** — All route handlers and pages use `await params`
- **Ownership verification on all routes** — Every API route checks `userId === session.user.id`
