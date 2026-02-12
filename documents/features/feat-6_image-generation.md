# feat:6_image-generation — AI Image Generation

## Overview

Implements AI image generation for story scenes using Pollinations.ai (free, no API key required). Each scene's `visualPrompt` is combined with the project's `imageStyle` to generate a unique image. Images are saved to local disk (`public/uploads/images/`) and displayed in both the Story Editor (inline preview) and a dedicated Images gallery page.

## What's Implemented

### API Routes
- **POST /api/projects/[id]/generate-images** — Batch generate images for all scenes sequentially. Enhanced prompt: `"{imageStyle} style, {visualPrompt}"`. Dimensions from `getImageDimensions(aspectRatio)`. 2-second delay between scenes for rate limit safety. Per-scene error handling (one failure doesn't stop others). Optional `{ sceneIds?: string[] }` body to filter which scenes to process. Returns `{ scenes, results: { total, success, failed, details } }`.
- **POST /api/projects/[id]/scenes/[sceneId]/generate-image** — Regenerate image for a single scene. Same generate + save + update flow. Ownership chain verification (scene → project → user). Returns `{ scene: updatedScene }`.

### Story Editor Integration
- **GenerateImagesButton** — Shows "Generate Images" (ImageIcon) for projects without images, "Regenerate Images" (RefreshCw) when images exist. Regeneration triggers confirmation Dialog. Simulated per-scene progress via setInterval (12s intervals). Updates Zustand store with new imageUrls on completion. `variant="outline"` to differentiate from primary Generate Story button.
- **SceneCard image preview** — Display mode shows image above narration text (object-cover, max-height 200px). Dashed placeholder with "No image" when no imageUrl. Per-scene "Regenerate Image" button in header actions.
- **SceneList** — Now passes `projectId` to each SceneCard from Zustand store's `currentProject`.
- **StoryEditor toolbar** — GenerateImagesButton added between GenerateButton and SaveButton (conditional on `scenes.length > 0`).

### Images Gallery Page (`/projects/[id]/images`)
- **Server Component** — Auth check, project+scenes fetch via Prisma, ownership verification, renders ImageGallery client component.
- **ImageGallery** — Client component with local state (not Zustand). Header shows image count summary + "Generate All" / "Regenerate All" button. Grid layout (`sm:grid-cols-2 lg:grid-cols-3`). Empty state if no scenes exist.
- **SceneImageCard** — Card with scene image preview (aspect-video container), visual prompt excerpt, "Scene {order}" badge. Per-card regenerate button calling single scene API. Full-size image Dialog on click (Maximize2 icon).

### Image Generator Enhancement
- Added `&nologo=true` to Pollinations.ai URL to remove watermark from generated images.

## Files Created (5)

| File | Lines | Purpose |
|------|-------|---------|
| `src/app/api/projects/[id]/generate-images/route.ts` | ~138 | POST: batch generate images for all scenes |
| `src/app/api/projects/[id]/scenes/[sceneId]/generate-image/route.ts` | ~73 | POST: regenerate image for a single scene |
| `src/components/story/generate-images-button.tsx` | ~174 | Batch image generation trigger button with progress |
| `src/components/image/scene-image-card.tsx` | ~138 | Image card with preview + regenerate for gallery |
| `src/components/image/image-gallery.tsx` | ~149 | Grid gallery of scene images for Images page |

## Files Modified (5)

| File | Changes |
|------|---------|
| `src/lib/ai/image-generator.ts` | Added `&nologo=true` to Pollinations URL |
| `src/components/story/scene-card.tsx` | Added image preview section + per-scene regenerate button + `projectId` prop |
| `src/components/story/scene-list.tsx` | Reads `currentProject` from Zustand, passes `projectId` to SceneCard |
| `src/components/story/story-editor.tsx` | Added GenerateImagesButton import + render in toolbar |
| `src/app/(dashboard)/projects/[id]/images/page.tsx` | Replaced stub with Server Component + ImageGallery |

## Key Decisions

- **Sequential generation with 2s delay** — Pollinations.ai rate limits; sequential allows per-scene progress tracking
- **Image style prepended to visual prompt** — Format: `"{imageStyle} style, {visualPrompt}"` for consistent results across scenes
- **Per-scene error handling** — One failed image doesn't prevent all others from generating
- **Server-side batch processing** — Single POST processes all scenes server-side; survives tab close
- **Dual UI: Story Editor + Images Page** — Story editor gets inline previews + batch generate; Images page provides dedicated gallery with per-scene regeneration
- **Local `<img>` tags** — Images are local files in `public/uploads/`; no Next.js Image domain config needed
- **`nologo=true` on Pollinations URL** — Removes watermark from generated images
- **Local state for ImageGallery** — Standalone page uses local React state instead of Zustand (page is independent from Story Editor)
