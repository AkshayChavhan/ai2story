# feat:11_media-library — Media Library

## Overview

Implements a Media Library for StoryForge AI. Users can browse all their generated media assets (images, audio clips, video clips) aggregated from Scene records across all their projects. The library supports search by project name, filtering by media type, and pagination. Media items are displayed in a responsive grid with type-specific previews.

## What's Implemented

### API Route
- **GET /api/media** — List media items for the authenticated user. Queries Scene records with media URLs, flattens into individual MediaItem objects (one scene can produce up to 3 items). Supports `type` filter (image/audio/video), `search` by project title, and pagination (`page`, `limit`).

### MediaFilters Component
- Debounced search input (300ms) with Search icon for filtering by project name.
- Type dropdown: All Types / Images / Audio / Videos.
- Same layout and styling as ProjectFilters.

### MediaCard Component
- Type-specific preview: `<img>` for images, `<audio controls>` for audio, `<video>` for video clips.
- Displays project title, scene number, type Badge, and relative timestamp.
- Opens raw media URL in a new tab on click.

### MediaList Component
- Client component mirroring ProjectList pattern: fetch with filters, loading/empty states, pagination.
- 4-column responsive grid (sm:2, lg:3, xl:4).
- 24 items per page.

### Media Library Page
- Rewrote stub → Server Component rendering MediaList.
- Heading: "Media Library" with descriptive subtitle.

### TypeScript Types
- Added `MediaType = "image" | "audio" | "video"` type.
- Added `MediaItem` interface with id, type, url, projectId, projectTitle, sceneOrder, createdAt.

## Files Created (4)

| File | Lines | Purpose |
|------|-------|---------|
| `src/app/api/media/route.ts` | ~115 | GET: fetch scenes, flatten to media items, filter + paginate |
| `src/components/media/media-list.tsx` | ~110 | Media grid with fetch, filters, pagination |
| `src/components/media/media-filters.tsx` | ~70 | Search + type filter dropdown |
| `src/components/media/media-card.tsx` | ~105 | Type-specific preview card |

## Files Modified (2)

| File | Changes |
|------|---------|
| `src/app/(dashboard)/media/page.tsx` | Rewrote stub → renders MediaList |
| `src/types/index.ts` | Added MediaType and MediaItem types |

## Key Decisions

- **Query Scene/Project, not MediaAsset** — All generated media URLs live on Scene records; avoids modifying 5+ generation routes
- **In-memory flatten + paginate** — Scenes flattened to individual media items; fine for MVP scale
- **No new dependencies** — All UI components already exist
- **4-column grid** — Media cards are more compact than project cards
- **Open in new tab** — No modal/lightbox, MVP simplicity
- **MediaAsset model untouched** — Reserved for future user-uploaded custom media
