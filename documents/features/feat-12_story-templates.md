# feat:12_story-templates — Story Templates

## Overview

Implements a Story Templates system for StoryForge AI. Users can browse pre-built story templates organized by genre, search by title/description, and use any template to pre-fill the project creation form. Templates are system-wide (not user-specific) and seeded via a script. Clicking "Use Template" navigates to `/projects/new?templateId=xyz` where the form is pre-populated with the template's title, description, prompt, and genre.

## What's Implemented

### API Route
- **GET /api/templates** — List active story templates. Supports `genre` filter and `search` by title/description (case-insensitive). Returns all matching templates (no pagination — small admin-managed set). Requires authentication.

### Seed Script
- **`prisma/seed-templates.ts`** — Seeds 11 genre-diverse templates covering: horror, romance, sci-fi, fantasy, comedy, mystery, educational, motivational, fairy-tale, thriller, drama. Skips seeding if templates already exist to prevent duplicates. Run with: `npx tsx prisma/seed-templates.ts`

### TemplateFilters Component
- Debounced search input (300ms) with Search icon for filtering by title/description.
- Genre dropdown: All Genres + 11 genre options.
- Same layout and styling as ProjectFilters.

### TemplateCard Component
- Displays template title, genre Badge, description (2-line clamp), prompt excerpt in muted box with BookOpen icon (3-line clamp).
- "Use Template" button with Sparkles icon linking to `/projects/new?templateId={id}`.
- Full-height flex layout for consistent card heights in grid.

### TemplateList Component
- Client component: fetches templates from API with search/genre filters.
- Loading spinner, empty state (context-aware message), 3-column responsive grid.
- No pagination needed (small template set).

### Templates Page
- Rewrote stub → Server Component rendering TemplateList.
- Heading: "Story Templates" with descriptive subtitle.

### Template Pre-fill Integration
- **NewProject page** — Accepts `searchParams.templateId`, fetches template from Prisma server-side, passes data to CreateForm.
- **CreateForm** — New optional `templateData` prop; pre-fills title, description, prompt, and genre `defaultValues` when provided. Subtitle changes to "Pre-filled from template" when active.

### TypeScript Types
- Added `StoryTemplate` interface with id, title, description, prompt, genre, thumbnail, isActive, createdAt.

## Files Created (5)

| File | Lines | Purpose |
|------|-------|---------|
| `src/app/api/templates/route.ts` | ~55 | GET: list active templates with genre/search filter |
| `src/components/templates/template-list.tsx` | ~75 | Template grid with fetch + filters |
| `src/components/templates/template-filters.tsx` | ~80 | Search + genre filter dropdown |
| `src/components/templates/template-card.tsx` | ~60 | Template preview card with "Use Template" button |
| `prisma/seed-templates.ts` | ~120 | Seed script with 11 default templates |

## Files Modified (4)

| File | Changes |
|------|---------|
| `src/types/index.ts` | Added StoryTemplate interface |
| `src/app/(dashboard)/templates/page.tsx` | Rewrote stub → renders TemplateList |
| `src/app/(dashboard)/projects/new/page.tsx` | Added searchParams.templateId handling + Prisma fetch |
| `src/components/projects/create-form.tsx` | Added templateData prop for form pre-fill |

## Key Decisions

- **System-wide templates** — No userId; templates shared across all users (admin-managed)
- **Seed script approach** — Separate script, not Prisma seed; skips if templates exist
- **No pagination** — Template count is small; all active templates in one API call
- **Query param pre-fill** — `?templateId=` on `/projects/new`; server-side Prisma fetch, no extra API call
- **No new dependencies** — All UI components already exist
- **11 templates covering all genres** — One template per genre for complete coverage
