# feat:4_story-generator-ui — Story Generator UI

**Status:** Complete and pushed to GitHub
**Branch:** `feat-4_story-generator-ui`
**Scope:** 12 files changed (10 created, 2 modified)

---

## What's Implemented

### API Routes
- **POST /api/projects/[id]/generate** — Triggers AI story generation via Gemini 2.0 Flash: fetches project → calls `generateStory()` → deletes existing scenes → creates new scenes → updates project status to "in-progress" → returns scenes
- **GET /api/projects/[id]/scenes** — Lists all scenes for a project ordered by `order` asc
- **PUT /api/projects/[id]/scenes** — Bulk save: validates with `bulkScenesSchema` → deletes all existing → creates new ones (handles reorder/add/delete in one operation)
- **PUT /api/projects/[id]/scenes/[sceneId]** — Update single scene with `updateSceneSchema` validation, ownership chain verification (scene → project → user)
- **DELETE /api/projects/[id]/scenes/[sceneId]** — Delete single scene and re-order remaining scenes sequentially
- All routes use `auth()` + ownership verification, return 404 for unauthorized access

### Story Editor Page (`/projects/[id]/story`)
- Server Component: `auth()` → `await params` → `prisma.project.findUnique({ include: scenes })` → ownership check → `notFound()` if missing → renders `StoryEditor` client component
- Maps DB scenes to `StoryScene` type (converting null → undefined for optional fields)

### Story Editor Component (Orchestrator)
- Client component receiving `project` and `initialScenes` props from server page
- On mount: `setCurrentProject(project)` + `setScenes(initialScenes)` via Zustand store
- On unmount: `reset()` to clean up store
- Layout: back link → header (title + GenerateButton + SaveButton) → ProcessingOverlay (conditional) → SceneList or empty state

### Generate Button
- Shows "Generate Story" (Sparkles icon) for new projects
- Shows "Regenerate" (RefreshCw icon) when scenes exist, with confirmation Dialog
- Simulated progress intervals during API call (6 steps over ~12 seconds)
- Calls POST `/api/projects/[id]/generate` → maps response to `StoryScene[]` → `setScenes()` → toast.success
- Disabled during processing

### Processing Overlay
- Reads `processingStatus` from Zustand store (`step`, `progress`, `message`)
- Animated gradient progress bar (CSS `transition-all duration-500`)
- Shows "Generating Your Story..." heading + current step message

### Scene List
- Reads `scenes` from Zustand store, renders ordered `SceneCard` components
- Move Up: swaps with previous scene via `reorderScenes(index, index - 1)`
- Move Down: swaps with next scene via `reorderScenes(index, index + 1)`
- Delete: calls `removeScene(id)` on store
- "Add Scene" button: `addScene()` with `{ id: crypto.randomUUID(), narrationText: "", visualPrompt: "", order: scenes.length + 1 }`

### Scene Card
- Display mode: narration text, visual prompt preview, camera direction / mood / duration badges
- Edit mode: Textarea for narration (rows=4) and visual prompt (rows=3), Input for camera/mood/duration
- Toggle edit/save with local `isEditing` state
- On save: reads form values from local state, calls `updateScene(id, updates)` on Zustand store
- Delete confirmation: inline Dialog with "Delete Scene" / "Cancel" buttons
- Actions: Edit (Pencil), Move Up (ChevronUp), Move Down (ChevronDown), Delete (Trash2)
- First/last scene disables Move Up/Down respectively

### Save Button
- Reads scenes from Zustand store + currentProject for projectId
- Sends PUT `/api/projects/[id]/scenes` with `{ scenes: [...] }` body
- Maps store scenes to API format (narrationText, visualPrompt, order, cameraDirection, mood, duration)
- Loading spinner (Loader2) during save, disabled state
- Toast success ("All scenes saved!") / error feedback

### Project Overview CTA Update (`/projects/[id]`)
- Draft + no scenes: dashed border card with Sparkles icon + "Generate Story" link
- Otherwise: solid card showing scene count text + "Edit Story" (Pencil icon) or "Generate Story" (Sparkles icon) depending on scene count

### Validation Schemas (`src/lib/validations/scene.ts`)
- `sceneSchema` — narrationText (1-2000), visualPrompt (1-2000), cameraDirection (optional, max 200), mood (optional, max 100), duration (optional, coerce to number, 1-60)
- `updateSceneSchema` — `sceneSchema.partial()` for single scene updates
- `bulkScenesSchema` — `z.object({ scenes: z.array(sceneSchema.extend({ order: z.number().min(1) })) })`
- Exported types: `SceneFormData`, `UpdateSceneFormData`, `BulkScenesData`

## Key Design Decisions

1. **No SSE/streaming** — `generateStory()` is a single Gemini API call returning the complete result; processing overlay uses simulated progress intervals
2. **Bulk save (delete-all + recreate)** — Simplest approach for handling reorders, additions, and deletions in one PUT operation
3. **Optimistic UI via Zustand** — All scene edits happen immediately in the client store; "Save" button persists the entire state to DB
4. **Inline editing per scene card** — Toggle between display/edit mode (no modal), consistent with card-based layout
5. **No drag-and-drop** — Uses Move Up/Down buttons; avoids adding new dependencies; works with existing `reorderScenes()` store action
6. **Regeneration confirmation** — Dialog warning that all existing scenes will be replaced and edits lost
7. **Temporary IDs** — `crypto.randomUUID()` for client-created scenes; bulk save handles them via delete-all-then-recreate
8. **MongoDB createMany** — Re-fetches scenes after `createMany` since MongoDB provider doesn't return records from `createMany`

## Files Created (10)

| File | Purpose |
|------|---------|
| `src/lib/validations/scene.ts` | Zod schemas for scene validation |
| `src/app/api/projects/[id]/generate/route.ts` | POST: trigger AI story generation |
| `src/app/api/projects/[id]/scenes/route.ts` | GET: list scenes, PUT: bulk save |
| `src/app/api/projects/[id]/scenes/[sceneId]/route.ts` | PUT: update scene, DELETE: delete scene |
| `src/components/story/story-editor.tsx` | Main orchestrator component |
| `src/components/story/generate-button.tsx` | AI generation trigger with progress |
| `src/components/story/processing-overlay.tsx` | Animated progress overlay |
| `src/components/story/scene-list.tsx` | Ordered scene list with reorder |
| `src/components/story/scene-card.tsx` | Single scene display/edit card |
| `src/components/story/save-button.tsx` | Bulk save button |

## Files Modified (2)

| File | Changes |
|------|---------|
| `src/app/(dashboard)/projects/[id]/story/page.tsx` | Replaced stub with Server Component fetching project+scenes, renders StoryEditor |
| `src/app/(dashboard)/projects/[id]/page.tsx` | Updated CTA: "Edit Story" for projects with scenes, "Generate Story" for empty drafts |
