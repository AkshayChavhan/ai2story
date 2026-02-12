# feat:8_video-composition — Video Composition

**Status:** Complete and pushed to GitHub
**Branch:** `feat-8_video-composition`
**Scope:** 8 files changed (4 created, 3 modified, 1 deleted) + 2 npm packages added

---

## What's Implemented

### Dependencies & Core Fixes
- Added `ffmpeg-static` (bundles FFmpeg binary) and `@types/fluent-ffmpeg`
- Deleted bare `src/types/fluent-ffmpeg.d.ts` module declaration
- Fixed `video-composer.ts`: set FFmpeg binary path, fixed single-scene bug, added `getVideoResolution()`, `concatenateScenes()`, exported interfaces

### API Route
- **POST /api/projects/[id]/compose** — Batch compose: validates all scenes have image+audio, sequential composition with 3s delay, per-scene error handling, concatenates final video, updates DB. Returns `{ scenes, videoUrl, results }`.

### Story Editor
- **ComposeButton** — Film icon, step="video", 15s progress interval, prerequisite check (all scenes need image+audio), confirmation dialog for recomposition.
- **StoryEditor** — ComposeButton added to toolbar after GenerateVoicesButton.

### Video Composer Page (`/projects/[id]/compose`)
- **Server Component** — Auth, Prisma fetch, ownership check, renders ComposeGallery.
- **ComposeGallery** — Local state. Final video player at top. Video count summary. Compose All button with prerequisite check. Grid layout.
- **SceneVideoCard** — Video player or placeholder, visual prompt excerpt. No per-scene regeneration.

## Files Created (4)

| File | Purpose |
|------|---------|
| `src/app/api/projects/[id]/compose/route.ts` | POST: batch compose video |
| `src/components/story/compose-button.tsx` | Video composition trigger |
| `src/components/video/scene-video-card.tsx` | Per-scene video card |
| `src/components/video/compose-gallery.tsx` | Grid gallery for Compose page |

## Files Modified (3)

| File | Changes |
|------|---------|
| `src/lib/ai/video-composer.ts` | FFmpeg path, single-scene fix, getVideoResolution(), concatenateScenes() |
| `src/components/story/story-editor.tsx` | Added ComposeButton to toolbar |
| `src/app/(dashboard)/projects/[id]/compose/page.tsx` | Replaced stub with Server Component |

## Files Deleted (1)

| File | Reason |
|------|--------|
| `src/types/fluent-ffmpeg.d.ts` | Replaced by @types/fluent-ffmpeg |

## Key Design Decisions

1. **`ffmpeg-static`** — Bundles FFmpeg binary via npm
2. **3s delay between scenes** — CPU-intensive operation
3. **15s progress interval** — Video composition is slow
4. **Prerequisite: image+audio required** — No partial composition
5. **No per-scene recomposition** — Too expensive, batch only
6. **`getVideoResolution()` from aspect ratio** — 9:16→1080x1920, 16:9→1920x1080, 1:1→1080x1080
7. **HTML5 `<video controls>`** — Native player, zero deps
8. **Local state for ComposeGallery** — Independent from Zustand
