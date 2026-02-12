# feat:8_video-composition — Development Conversation

## Feature: Video Composition
**Branch:** `feat-8_video-composition`

## Conversation Flow

1. **User confirmed ready** — PR #7 (feat:7) merged, local main synced
2. **Branch created** — `feat-8_video-composition` from main
3. **Plan mode** — Explored existing code:
   - `src/lib/ai/video-composer.ts` — Ken Burns zoom + concatenation already exists
   - `src/app/(dashboard)/projects/[id]/compose/page.tsx` — Stub page
   - `src/types/fluent-ffmpeg.d.ts` — Bare module declaration (needs replacement)
   - Prisma Project model has `videoUrl`, `thumbnailUrl`, `duration`, `resolution`
   - Prisma Scene model has `videoClipUrl`
   - FFmpeg NOT installed on system — user chose npm-bundled FFmpeg (`ffmpeg-static`)
4. **Plan designed** — 4 new files, 3 modified files, 1 deleted file, 6 implementation steps
5. **Plan approved** — User approved
6. **Implementation** — Built in order:
   - Step 0: Installed dependencies, deleted bare type declaration, fixed video-composer.ts
   - Step 1: Created compose API route
   - Step 2: Created ComposeButton, modified StoryEditor
   - Step 3: Created SceneVideoCard, ComposeGallery
   - Step 4: Rewrote compose page
   - Step 5: Created documentation and updated ARCHITECTURE.md
   - Build verification

## Implementation Details

### FFmpeg Binary Installation
- FFmpeg not in system PATH, not installed via apt
- Initially tried `@ffmpeg-installer/ffmpeg` but it uses dynamic `require()` that Turbopack can't resolve
- Switched to `ffmpeg-static` — Turbopack-compatible, bundles FFmpeg binary via npm
- Added `@types/fluent-ffmpeg` for proper TypeScript types
- Deleted `src/types/fluent-ffmpeg.d.ts` bare `declare module` stub

### video-composer.ts Fixes
- Added `import ffmpegPath from "ffmpeg-static"`
- Set `ffmpeg.setFfmpegPath(ffmpegPath)` at module level
- Exported `SceneInput` and `ComposeOptions` interfaces
- Added `getVideoResolution(aspectRatio)` — maps "9:16"→"1080x1920", "16:9"→"1920x1080", "1:1"→"1080x1080"
- Fixed single-scene bug: was returning URL for `outputFileName` (never written), now returns URL for `scenePath` (the file that was actually composed)
- Added `concatenateScenes(scenePaths, outputPath)` helper — separates concatenation from scene composition

### Compose API Route
- POST /api/projects/[id]/compose
- Validates ALL scenes have both imageUrl and audioUrl (400 if not)
- Converts URL paths (`/uploads/images/...`) to absolute file paths for FFmpeg
- Sequential composition with 3s delay between scenes
- Per-scene error handling — continues on failure
- Concatenates successful scene clips into final video (skips if only 1 scene)
- Updates scene.videoClipUrl and project.videoUrl/resolution in DB

### ComposeButton Design
- Mirrors GenerateImagesButton/GenerateVoicesButton pattern
- Film icon (lucide-react)
- Prerequisite check: disabled when any scene is missing imageUrl or audioUrl
- Tooltip explains prerequisite when disabled
- 15s progress simulation interval (video composition is slow)
- Confirmation dialog for recomposition

### Compose Page Architecture
- Server Component (same pattern as Images and Voice pages)
- ComposeGallery with final video player at top + scene clips grid
- Grid layout `sm:grid-cols-1 lg:grid-cols-2`
- SceneVideoCard is display-only — no per-scene regeneration controls

## Key Decisions Made During Implementation

1. Installed FFmpeg via npm (`ffmpeg-static`, switched from `@ffmpeg-installer/ffmpeg` due to Turbopack incompatibility)
2. Separated `concatenateScenes()` from `composeVideo()` for clean API
3. 3s delay between scenes — CPU-intensive, prevent system overload
4. 15s progress interval — appropriate for ~20-60s per scene composition time
5. ComposeButton disabled until ALL scenes have images AND audio — no partial composition
6. No per-scene regeneration in SceneVideoCard — composition too expensive for one-off
7. Final video displayed at top of gallery — prominent placement for the end product
8. `getVideoResolution()` maps aspect ratio to exact FFmpeg resolution dimensions
