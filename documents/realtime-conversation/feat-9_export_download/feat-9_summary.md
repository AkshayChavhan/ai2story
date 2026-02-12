# feat:9_export-download — Export & Download

**Status:** Complete and pushed to GitHub
**Branch:** `feat-9_export-download`
**Scope:** 5 files changed (2 created, 3 modified) + 2 npm packages added

---

## What's Implemented

### Dependencies
- Added `archiver` (ZIP creation) and `@types/archiver` (TypeScript types)

### API Route
- **POST /api/projects/[id]/export** — Streaming ZIP bundle. Auth + ownership. Requires videoUrl. Metadata JSON + scene assets + final video. Uses `archiver` with `TransformStream` for streaming (no temp files). `existsSync()` skips missing files.

### Export Page (`/projects/[id]/share`)
- **Server Component** — Auth, Prisma fetch (project + scenes), ownership check, compute asset counts.
- **ExportPanel** — Video preview (player or placeholder), Download MP4 (client-side anchor), Download ZIP (API call + blob), Asset summary (4 counts with badges).

### Project Overview
- **ProjectActions** — New `videoUrl` prop. Download button (direct MP4 download when video exists) or Export button (navigate to export page when no video).
- **Project page** — Passes `videoUrl` to ProjectActions.

## Files Created (2)

| File | Purpose |
|------|---------|
| `src/app/api/projects/[id]/export/route.ts` | POST: streaming ZIP bundle |
| `src/components/export/export-panel.tsx` | Export UI with download options |

## Files Modified (3)

| File | Changes |
|------|---------|
| `src/app/(dashboard)/projects/[id]/share/page.tsx` | Rewrote stub → Server Component + ExportPanel |
| `src/components/projects/project-actions.tsx` | Added videoUrl prop, Download/Export button |
| `src/app/(dashboard)/projects/[id]/page.tsx` | Pass videoUrl to ProjectActions |

## Key Design Decisions

1. **`archiver` for ZIP** — No native Node.js ZIP utility
2. **Streaming via TransformStream** — No temp file on disk
3. **Client-side video download** — File already in public/, no API needed
4. **ZIP requires videoUrl** — Must compose video first
5. **`existsSync()` for missing files** — Graceful skip, no failure
6. **Padded scene naming** — `scene-01`, `scene-02` for sorting
7. **Share page = export page** — feat:10 adds sharing alongside
8. **Dual ProjectActions behavior** — Download (video) or Export (no video)
