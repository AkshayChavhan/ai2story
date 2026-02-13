# feat:12_story-templates — Story Templates

**Status:** Complete and pushed to GitHub
**Branch:** `feat-12_story-templates`
**Scope:** 9 files changed (5 created, 4 modified), no new npm packages

---

## What's Implemented

### API Route
- **GET /api/templates** — List active templates with genre filter and search by title/description.

### Seed Script
- **`prisma/seed-templates.ts`** — Seeds 11 genre-diverse templates. Skips if templates exist.

### TemplateFilters Component
- Debounced search input (300ms) + genre dropdown (11 genres).

### TemplateCard Component
- Title, genre Badge, description, prompt excerpt, "Use Template" button.
- Links to `/projects/new?templateId={id}`.

### TemplateList Component
- Client component with fetch, filters, loading/empty states, 3-column grid.

### Templates Page
- Rewrote stub → renders TemplateList with heading and description.

### Template Pre-fill
- NewProject page reads `?templateId=` from URL, fetches template server-side.
- CreateForm accepts `templateData` prop to pre-fill title, description, prompt, genre.

## Files Created (5)

| File | Purpose |
|------|---------|
| `src/app/api/templates/route.ts` | GET: list active templates with filters |
| `src/components/templates/template-list.tsx` | Template grid with filters |
| `src/components/templates/template-filters.tsx` | Search + genre filter dropdown |
| `src/components/templates/template-card.tsx` | Template preview card |
| `prisma/seed-templates.ts` | Seed 11 default templates |

## Files Modified (4)

| File | Changes |
|------|---------|
| `src/types/index.ts` | Added StoryTemplate interface |
| `src/app/(dashboard)/templates/page.tsx` | Rewrote stub → renders TemplateList |
| `src/app/(dashboard)/projects/new/page.tsx` | Added templateId handling + Prisma fetch |
| `src/components/projects/create-form.tsx` | Added templateData prop for pre-fill |

## Key Design Decisions

1. **System-wide templates** — No userId, shared across all users
2. **Seed script** — Separate from Prisma seed, skips duplicates
3. **No pagination** — Small admin-managed set
4. **Query param pre-fill** — Server-side fetch, no extra API call
5. **No new dependencies** — All UI components exist
6. **11 templates** — One per genre for complete coverage
