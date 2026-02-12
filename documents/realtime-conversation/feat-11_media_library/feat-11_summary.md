# feat:11_media-library — Media Library

**Status:** Complete and pushed to GitHub
**Branch:** `feat-11_media-library`
**Scope:** 6 files changed (4 created, 2 modified), no new npm packages

---

## What's Implemented

### API Route
- **GET /api/media** — List media items. Queries Scene records, flattens into individual MediaItem objects. Supports type filter, search by project title, pagination.

### MediaFilters Component
- Debounced search input (300ms) + type dropdown (All Types / Images / Audio / Videos).
- Mirrors ProjectFilters pattern.

### MediaCard Component
- Type-specific preview: `<img>` for images, `<audio controls>` for audio, `<video>` for clips.
- Shows project title, scene number, type Badge, relative timestamp.
- Opens media URL in new tab on click.

### MediaList Component
- Client component with fetch, filters, loading/empty states, pagination.
- 4-column responsive grid, 24 items per page.

### Media Library Page
- Rewrote stub → renders MediaList with heading and description.

## Files Created (4)

| File | Purpose |
|------|---------|
| `src/app/api/media/route.ts` | GET: fetch scenes, flatten to items, filter + paginate |
| `src/components/media/media-list.tsx` | Media grid with filters + pagination |
| `src/components/media/media-filters.tsx` | Search + type filter dropdown |
| `src/components/media/media-card.tsx` | Type-specific preview card |

## Files Modified (2)

| File | Changes |
|------|---------|
| `src/app/(dashboard)/media/page.tsx` | Rewrote stub → renders MediaList |
| `src/types/index.ts` | Added MediaType and MediaItem types |

## Key Design Decisions

1. **Query Scene/Project, not MediaAsset** — Media URLs already on Scene records
2. **In-memory flatten + paginate** — Fine for MVP scale
3. **No new dependencies** — All UI components exist
4. **4-column grid** — Media cards smaller than project cards
5. **Open in new tab** — No modal, MVP simplicity
6. **MediaAsset model untouched** — Reserved for future custom uploads
