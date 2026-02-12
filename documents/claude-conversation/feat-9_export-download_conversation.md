# feat:9_export-download — Claude Conversation Summary

## Session Overview
Implemented Export & Download feature (feat:9) for StoryForge AI. Users can download their final composed video as MP4 or download a ZIP bundle containing all project assets.

## Key Implementation Details

### Architecture
- **ZIP streaming**: Used `archiver` library with `TransformStream` to stream ZIP directly to client without temp files on disk
- **Dual download modes**: Direct MP4 download (client-side anchor, no API call) vs ZIP bundle (POST API → blob → download)
- **Share page reuse**: The `/projects/[id]/share` stub page was repurposed for export; feat:10 will add sharing features alongside

### Dependencies Added
- `archiver` — ZIP archive creation (streaming, well-maintained)
- `@types/archiver` — TypeScript type definitions

### Files Changed
- 2 created: export API route, ExportPanel component
- 3 modified: share page (rewritten), ProjectActions (download button), project page (videoUrl prop)

### Design Decisions
1. archiver for ZIP (no native Node.js ZIP)
2. TransformStream for streaming (no temp files)
3. Client-side download for video (already in public/)
4. ZIP requires videoUrl (compose first)
5. existsSync() for missing files (graceful skip)
6. Padded scene naming (scene-01 for sorting)
7. Dual ProjectActions behavior (Download vs Export)

## Notes for Future Features
- feat:10 will add public sharing (share link) to the same `/projects/[id]/share` page
- The ExportPanel component is standalone and won't conflict with sharing UI
