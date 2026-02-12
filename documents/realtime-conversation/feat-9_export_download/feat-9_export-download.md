# feat:9_export-download — Development Conversation

## Planning Phase

### Codebase Exploration
- Read `STORYFORGE_AI.md` spec — feat:9 is Export & Download
- Checked `/projects/[id]/share` stub page (marked for feat:10 sharing, reusable for feat:9 download)
- Reviewed ProjectActions component (Edit Story + Delete, no download)
- Reviewed project detail page (fetches project with counts, renders ProjectActions)
- Checked Prisma schema: Project has videoUrl, thumbnailUrl, duration, resolution; Scene has imageUrl, audioUrl, videoClipUrl
- Confirmed no existing export/zip code or archiver dependency

### Plan Design
- Designed 2 new files + 3 modified files
- Key decisions: archiver for ZIP, streaming via TransformStream, client-side video download, share page reused
- Plan approved by user

## Implementation Phase

### Step 0: Dependencies
- Ran `npm install archiver && npm install -D @types/archiver`
- archiver: ZIP creation, streaming support
- @types/archiver: TypeScript definitions

### Step 1: Export API Route
Created `src/app/api/projects/[id]/export/route.ts`:
- POST handler with auth + ownership check
- Requires project.videoUrl to exist (400 if not)
- Builds metadata JSON: project settings + scene data (narration, visual prompt, camera, mood, duration) + export timestamp + generator name
- Creates ZIP via `archiver("zip", { zlib: { level: 5 } })`
- Bridges archiver to Web API via TransformStream: `archive.on("data") → writer.write()`, `archive.on("end") → writer.close()`
- Adds metadata.json, scene images (images/scene-01.png), audio (audio/scene-01.mp3), clips (clips/scene-01.mp4), final video
- Uses existsSync() to skip missing files
- Sanitized filename: `{title}_storyforge.zip`
- Content-Type: application/zip, Content-Disposition: attachment

### Step 2: ExportPanel Component
Created `src/components/export/export-panel.tsx`:
- Client component with isExporting state
- Video Preview: `<video controls>` with poster, resolution/duration badges, or dashed AlertCircle placeholder
- Download Video card: programmatic anchor tag download, Film icon, disabled when no video
- Download ZIP card: POST fetch → blob → createObjectURL → download, Loader2 spinner, FileArchive icon
- Asset Summary: 4-item grid with Badge indicators (images/sceneCount, audio/sceneCount, clips/sceneCount, final video ready/not ready)

### Step 3: Share Page Rewrite
Rewrote `src/app/(dashboard)/projects/[id]/share/page.tsx`:
- Server Component: auth → Prisma fetch (project + scenes with imageUrl, audioUrl, videoClipUrl) → ownership check
- Computes sceneCount, imageCount, audioCount, clipCount
- Renders: back link + "Export & Download" heading + project title + ExportPanel with all props

### Step 4: ProjectActions + Project Page
Modified `src/components/projects/project-actions.tsx`:
- Added optional `videoUrl?: string | null` prop
- Added Download/FileArchive icon imports + toast import
- handleDownload: if hasVideo → programmatic anchor download; else → router.push to /share page
- New button between Edit Story and Delete: "Download" (Download icon) or "Export" (FileArchive icon)

Modified `src/app/(dashboard)/projects/[id]/page.tsx`:
- Added `videoUrl={project.videoUrl}` to ProjectActions component

### Step 5: Documentation + Build
- Created feature doc, realtime-conversation docs, claude-conversation doc
- Updated ARCHITECTURE.md with new API route and architecture decisions
- Ran build — verified no errors
