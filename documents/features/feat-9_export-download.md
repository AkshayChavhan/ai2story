# feat:9_export-download — Export & Download

## Overview

Implements export and download functionality for StoryForge AI projects. Users can download their final composed video as MP4 directly, or download a ZIP bundle containing all project assets (images, audio, video clips, final video, and project metadata JSON). The export page lives at `/projects/[id]/share` (feat:10 will add sharing features alongside). A Download/Export button is also added to the project overview page's action bar.

## What's Implemented

### Dependencies
- **`archiver`** — ZIP archive creation library for Node.js. Lightweight, streaming, well-maintained.
- **`@types/archiver`** — TypeScript type definitions for archiver.

### API Route
- **POST /api/projects/[id]/export** — Generates a streaming ZIP bundle of all project assets. Auth + ownership check. Requires `videoUrl` to exist (400 if not composed yet). Builds metadata JSON with project settings, scene data, and export timestamp. Creates ZIP via `archiver` with compression level 5. Adds files: `metadata.json`, `images/scene-01.png`, `audio/scene-01.mp3`, `clips/scene-01.mp4`, `final-video.mp4`. Uses `existsSync()` to skip missing files gracefully. Streams via `TransformStream` (no temp file on disk). Sanitized filename from project title.

### Export Page (`/projects/[id]/share`)
- **Server Component** — Auth → Prisma fetch (project + scenes) → ownership check → compute asset counts → render ExportPanel.
- **ExportPanel** — Client component with:
  - **Video Preview** — `<video controls>` player when videoUrl exists; dashed placeholder with AlertCircle when absent.
  - **Download Video** card — Direct client-side download via programmatic anchor tag. Disabled when no video.
  - **Download ZIP** card — Calls POST `/api/projects/{id}/export`, receives blob, triggers download. Loading spinner during export. Disabled when no video.
  - **Asset Summary** — 4-item grid showing counts (images/sceneCount, audio/sceneCount, clips/sceneCount, final video ready/not ready) with Badge indicators.

### Project Overview Integration
- **ProjectActions** — New `videoUrl` prop. New Download/Export button between "Edit Story" and "Delete":
  - When video exists: Download icon + "Download" label → direct MP4 download via programmatic anchor.
  - When no video: FileArchive icon + "Export" label → navigates to `/projects/{id}/share` export page.
- **Project page** — Passes `videoUrl={project.videoUrl}` to ProjectActions.

## Files Created (2)

| File | Lines | Purpose |
|------|-------|---------|
| `src/app/api/projects/[id]/export/route.ts` | ~160 | POST: generate streaming ZIP bundle |
| `src/components/export/export-panel.tsx` | ~265 | Export UI with video preview + download options + asset summary |

## Files Modified (3)

| File | Changes |
|------|---------|
| `src/app/(dashboard)/projects/[id]/share/page.tsx` | Rewrote stub with Server Component + ExportPanel |
| `src/components/projects/project-actions.tsx` | Added videoUrl prop, Download/Export button with dual behavior |
| `src/app/(dashboard)/projects/[id]/page.tsx` | Pass videoUrl to ProjectActions |

## Key Decisions

- **`archiver` for ZIP** — No native Node.js ZIP utility; archiver is lightweight and handles streaming
- **Streaming ZIP via TransformStream** — Pipes archiver output to Web API ReadableStream; no temp file on disk
- **Video download is client-side** — Final video already in `public/uploads/videos/`; programmatic anchor with `download` attribute
- **ZIP requires videoUrl** — Export only available after video composition
- **Missing files handled gracefully** — `existsSync()` skips missing assets instead of failing
- **Padded scene naming** — ZIP files use `scene-01`, `scene-02` for clean sorting
- **Share page reused for export** — feat:10 will add sharing features alongside
- **ProjectActions dual behavior** — "Download" when video exists, "Export" when no video
