# feat:6_image-generation — AI Image Generation

**Status:** Complete and pushed to GitHub
**Branch:** `feat-6_image-generation`
**Scope:** 10 files changed (5 created, 5 modified)

---

## What's Implemented

### API Routes
- **POST /api/projects/[id]/generate-images** — Batch generate images for all scenes. Auth + ownership → fetch project with scenes → for each scene sequentially: build enhanced prompt (`"{imageStyle} style, {visualPrompt}"`), get dimensions via `getImageDimensions(aspectRatio)`, call `generateImage()`, save via `saveFile()`, update `scene.imageUrl` in DB. Per-scene error handling (continue on failure). 2-second delay between scenes. Optional `{ sceneIds?: string[] }` body. Returns `{ scenes, results: { total, success, failed, details } }`.
- **POST /api/projects/[id]/scenes/[sceneId]/generate-image** — Regenerate single scene image. Ownership chain verification (scene → project → user). Same generate + save + update flow. Returns `{ scene: updatedScene }`.

### Story Editor Changes
- **GenerateImagesButton** — Shows "Generate Images" (ImageIcon) or "Regenerate Images" (RefreshCw) based on existing images. Confirmation dialog for regeneration. Simulated per-scene progress via setInterval. Calls batch generate-images API. Updates Zustand store with new imageUrls. `variant="outline"`.
- **SceneCard** — Added `projectId` prop, image preview section (img with max-height 200px or dashed placeholder), per-scene regenerate button in header.
- **SceneList** — Reads `currentProject` from Zustand store, passes `projectId` to SceneCard.
- **StoryEditor** — Added `GenerateImagesButton` to toolbar (conditional on `scenes.length > 0`).

### Images Gallery Page (`/projects/[id]/images`)
- **Server Component** — Auth, Prisma fetch, ownership check, renders ImageGallery.
- **ImageGallery** — Client component with local state. Image count summary header + "Generate All"/"Regenerate All" button. Grid layout `sm:grid-cols-2 lg:grid-cols-3`. Empty state.
- **SceneImageCard** — Card with aspect-video image preview, visual prompt excerpt, "Scene {order}" badge. Per-card regenerate. Full-size Dialog on click.

### Image Generator
- Added `&nologo=true` to Pollinations.ai URL to remove watermark.

## Key Design Decisions

1. **Sequential generation with 2s delay** — Pollinations.ai rate limits; sequential allows per-scene progress tracking
2. **Image style prepended to prompt** — `"{imageStyle} style, {visualPrompt}"` for consistent style across scenes
3. **Per-scene error handling** — One failure doesn't stop the batch
4. **Server-side batch processing** — Survives tab close; single POST processes all scenes
5. **Dual UI** — Story Editor gets inline previews; Images page provides dedicated gallery
6. **Local `<img>` tags** — Images in `public/uploads/`; no Next.js Image domain config needed
7. **`nologo=true`** — Removes Pollinations.ai watermark
8. **Local state for ImageGallery** — Independent from Zustand store (standalone page)

## Files Created (5)

| File | Lines | Purpose |
|------|-------|---------|
| `src/app/api/projects/[id]/generate-images/route.ts` | ~138 | POST: batch generate images |
| `src/app/api/projects/[id]/scenes/[sceneId]/generate-image/route.ts` | ~73 | POST: regenerate single scene image |
| `src/components/story/generate-images-button.tsx` | ~174 | Batch image generation trigger with progress |
| `src/components/image/scene-image-card.tsx` | ~138 | Image card with preview + regenerate |
| `src/components/image/image-gallery.tsx` | ~149 | Grid gallery for Images page |

## Files Modified (5)

| File | Changes |
|------|---------|
| `src/lib/ai/image-generator.ts` | Added `&nologo=true` to Pollinations URL |
| `src/components/story/scene-card.tsx` | Added image preview + per-scene regenerate + `projectId` prop |
| `src/components/story/scene-list.tsx` | Passes `projectId` from Zustand `currentProject` to SceneCard |
| `src/components/story/story-editor.tsx` | Added GenerateImagesButton to toolbar |
| `src/app/(dashboard)/projects/[id]/images/page.tsx` | Replaced stub with Server Component + ImageGallery |
