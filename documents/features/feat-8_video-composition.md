# feat:8_video-composition — Video Composition

## Overview

Implements video composition for story scenes using FFmpeg (bundled via `ffmpeg-static`). Each scene's image + audio is composited into an MP4 video clip with Ken Burns zoom effect. All scene clips are then concatenated into a final video. Videos are saved to local disk (`public/uploads/videos/`) and displayed in both the Story Editor (Compose Video button) and a dedicated Video Composer page with a gallery of scene clips and final video player.

## What's Implemented

### Dependencies & Core Fixes
- **`ffmpeg-static`** — Bundles FFmpeg binary via npm, no system install required.
- **`@types/fluent-ffmpeg`** — Proper TypeScript types replacing bare `declare module` stub.
- **`video-composer.ts` fixes** — Set FFmpeg binary path via `ffmpeg-static`, fixed single-scene bug (was returning URL for file never written), added `getVideoResolution()` helper, added `concatenateScenes()` helper, exported `SceneInput` and `ComposeOptions` interfaces.

### API Route
- **POST /api/projects/[id]/compose** — Batch compose video for all scenes. Validates all scenes have both `imageUrl` and `audioUrl` (400 if not). Resolves project `aspectRatio` to resolution via `getVideoResolution()`. Sequential per-scene composition with 3s delay. Converts URL paths to absolute file paths for FFmpeg. Per-scene error handling. Concatenates all scene clips into final video. Updates `videoClipUrl` per scene and `videoUrl`/`resolution` on project. Returns `{ scenes, videoUrl, results: { total, success, failed, details } }`.

### Story Editor Integration
- **ComposeButton** — Shows "Compose Video" (Film icon) or "Recompose Video" (RefreshCw icon). Disabled until ALL scenes have both `imageUrl` and `audioUrl`. Confirmation dialog for recomposition. Simulated per-scene progress via setInterval (15s intervals). Updates Zustand store with `videoClipUrl` values. `variant="outline"`.
- **StoryEditor toolbar** — ComposeButton added after GenerateVoicesButton (conditional on `scenes.length > 0`).

### Video Composer Page (`/projects/[id]/compose`)
- **Server Component** — Auth check, project+scenes fetch via Prisma, ownership verification, renders ComposeGallery.
- **ComposeGallery** — Client component with local state. Final video player at top when `videoUrl` exists. Video count summary + "Compose All"/"Recompose All" button. Prerequisite check: button disabled when scenes missing images/audio. Grid layout (`sm:grid-cols-1 lg:grid-cols-2`). Empty state if no scenes.
- **SceneVideoCard** — Card with `<video controls>` player or Film icon placeholder. "Scene {order}" badge. Visual prompt text excerpt (line-clamp-2). No per-scene regeneration (composition is expensive, triggered only at gallery level).

## Files Created (4)

| File | Lines | Purpose |
|------|-------|---------|
| `src/app/api/projects/[id]/compose/route.ts` | ~165 | POST: batch compose video for all scenes |
| `src/components/story/compose-button.tsx` | ~155 | Video composition trigger button |
| `src/components/video/scene-video-card.tsx` | ~55 | Per-scene video card with player |
| `src/components/video/compose-gallery.tsx` | ~165 | Grid gallery for Compose page |

## Files Modified (3)

| File | Changes |
|------|---------|
| `src/lib/ai/video-composer.ts` | Set FFmpeg path, fix single-scene bug, add getVideoResolution(), concatenateScenes(), export interfaces |
| `src/components/story/story-editor.tsx` | Added ComposeButton import + render in toolbar |
| `src/app/(dashboard)/projects/[id]/compose/page.tsx` | Replaced stub with Server Component + ComposeGallery |

## Files Deleted (1)

| File | Reason |
|------|--------|
| `src/types/fluent-ffmpeg.d.ts` | Replaced by `@types/fluent-ffmpeg` proper types |

## Key Decisions

- **`ffmpeg-static`** — Bundles FFmpeg binary via npm. No system install needed.
- **3s delay between scenes** — Video composition is CPU-intensive; delay prevents system overload
- **15s progress simulation interval** — Composition is slow (~20-60s per scene)
- **Prerequisite: imageUrl + audioUrl required** — ComposeButton disabled until all scenes ready
- **No per-scene recomposition** — Composition is expensive; only batch from toolbar or gallery
- **`getVideoResolution()` from aspectRatio** — 9:16→1080x1920, 16:9→1920x1080, 1:1→1080x1080
- **`concatenateScenes()` helper** — Separates concatenation from scene composition for clean API
- **HTML5 `<video controls>`** — Native browser player, zero dependencies
- **Local React state for ComposeGallery** — Same pattern as ImageGallery and VoiceGallery
