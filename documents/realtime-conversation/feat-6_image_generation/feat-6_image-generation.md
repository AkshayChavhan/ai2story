# feat:6_image-generation — Development Conversation

## Feature: AI Image Generation
**Branch:** `feat-6_image-generation`

## Conversation Flow

1. **User confirmed ready** — PR #4 (feat:4) merged, auth fixes merged via PR #5, local main synced
2. **Branch created** — `feat-6_image-generation` from main
3. **Plan mode** — Explored existing code:
   - `src/lib/ai/image-generator.ts` — Pollinations.ai integration already exists (`generateImage()`, `getImageDimensions()`, `getPollinationsImageUrl()`)
   - `src/lib/storage.ts` — `saveFile(buffer, fileName, subDir)` already exists
   - Prisma Scene model already has `imageUrl: String?` field
   - Zustand store has `updateScene()`, `setProcessing()`, `setProcessingStatus()`
   - `ProcessingStep` type includes `"images"`
   - Processing overlay already handles any ProcessingStep
4. **Plan designed** — 5 new files, 5 modified files, 6 implementation steps
5. **Plan approved** — User approved
6. **Implementation** — Built in order:
   - Step 1: Added `&nologo=true` to Pollinations URL
   - Step 2: Created both API routes (batch + single scene)
   - Step 3: Created GenerateImagesButton, modified SceneCard/SceneList/StoryEditor
   - Step 4: Created SceneImageCard, ImageGallery, rewrote Images page
   - Step 5: Created documentation and updated ARCHITECTURE.md
   - Step 6: Build verification

## Implementation Details

### Pollinations.ai URL Enhancement
- Added `&nologo=true` parameter to `getPollinationsImageUrl()` to remove watermark from generated images
- URL format: `https://image.pollinations.ai/prompt/{encodedPrompt}?width={w}&height={h}&model=flux&nologo=true`

### Batch Image Generation API
- Sequential processing with 2-second delay between scenes
- Enhanced prompt: `"{imageStyle} style, {visualPrompt}"`
- Per-scene error handling — continues on failure, reports results
- Optional `sceneIds` filter in request body
- Uses existing `generateImage()` → `saveFile()` → `prisma.scene.update()` pipeline

### Single Scene Image API
- Ownership chain: scene → project → user verification
- Same generate pipeline as batch, but for one scene
- Used by per-scene regenerate buttons in both Story Editor and Images gallery

### GenerateImagesButton
- Follows same pattern as existing `generate-button.tsx`
- Detects existing images to switch between "Generate" and "Regenerate" labels
- Confirmation Dialog for regeneration (warns about replacing existing images)
- Simulated per-scene progress during API call
- Updates Zustand store scenes with new imageUrls from API response

### SceneCard Image Integration
- Added `projectId` prop to interface
- Image preview in display mode: `<img>` with `object-cover` and `maxHeight: 200px`
- Dashed placeholder with ImageIcon when no image exists
- Per-scene regenerate button (ImageIcon/Loader2) in card header actions

### Images Gallery Page
- Server Component fetches project + scenes, verifies ownership
- ImageGallery uses local React state (not Zustand) — standalone from Story Editor
- Grid layout with responsive columns
- SceneImageCard with full-size Dialog preview

## Key Decisions Made During Implementation

1. Used existing `generateImage()` + `saveFile()` pipeline instead of creating new abstractions
2. Local `<img>` tags instead of Next.js `<Image>` — images are local files, no domain config needed
3. ImageGallery uses local state instead of Zustand — page is independent from Story Editor context
4. Sequential generation (not parallel) — respects Pollinations.ai rate limits
5. `variant="outline"` for GenerateImagesButton — visual distinction from primary Generate Story button
