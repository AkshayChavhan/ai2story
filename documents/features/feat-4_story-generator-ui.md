# feat:4_story-generator-ui — Story Generator UI

## Overview

Implements the Story Generator UI for StoryForge AI: triggering AI story generation from a project prompt via Google Gemini 2.0 Flash, and providing a full UI to view, edit, reorder, add, delete, and bulk-save the generated scenes. This feature covers text-only scene generation (narrationText, visualPrompt, cameraDirection, mood, duration). Image generation (feat:6), voice generation (feat:7), and video composition (feat:8) are separate features.

## What's Implemented

### API Routes
- **POST /api/projects/[id]/generate** — Triggers AI story generation: fetches project from DB, calls `generateStory()` (Gemini 2.0 Flash), deletes existing scenes, creates new scenes, updates project status to "in-progress", returns scenes
- **GET /api/projects/[id]/scenes** — Lists all scenes for a project ordered by `order` asc
- **PUT /api/projects/[id]/scenes** — Bulk save/update all scenes: validates with `bulkScenesSchema`, deletes all existing, creates new ones (handles reorder, add, delete in one operation)
- **PUT /api/projects/[id]/scenes/[sceneId]** — Update a single scene with `updateSceneSchema` validation
- **DELETE /api/projects/[id]/scenes/[sceneId]** — Delete a single scene and re-order remaining scenes
- All routes verify authentication via `auth()` and ownership chain (scene → project → user)

### Story Editor Page (`/projects/[id]/story`)
- Server Component with auth check and project+scenes fetch via Prisma
- Maps DB scenes to `StoryScene` type and passes to `StoryEditor` client component
- Ownership verification with `notFound()` if project missing or not owned

### Story Editor Component (Orchestrator)
- Client component receiving `project` and `initialScenes` props
- Initializes Zustand store on mount (`setCurrentProject`, `setScenes`)
- Cleans up store on unmount (`reset()`)
- Renders: back link + header → GenerateButton + SaveButton → ProcessingOverlay (conditional) → SceneList or empty state

### Generate Button
- Shows "Generate Story" for new projects, "Regenerate" when scenes exist
- Regeneration shows confirmation dialog warning about data loss
- Simulates progress during Gemini API call with animated progress steps
- Calls POST `/api/projects/[id]/generate`, maps response to `StoryScene` type
- Toast notification on success/error

### Processing Overlay
- Reads `processingStatus` from Zustand store
- Animated progress bar with CSS width transition
- Shows step label and status message
- Card-based design with gradient progress bar

### Scene List
- Reads `scenes` from Zustand store
- Renders ordered `SceneCard` components
- Move Up/Down: calls `reorderScenes(fromIndex, toIndex)` on store
- Delete: calls `removeScene(id)` on store
- "Add Scene" button: creates blank scene with `crypto.randomUUID()`, order = length + 1

### Scene Card
- Display mode: narration text, visual prompt, camera direction badge, mood badge, duration
- Edit mode: Textarea for narration/visual prompt, Input for camera direction/mood/duration
- Toggle between display/edit with local React state
- On save: calls `updateScene(id, updates)` on Zustand store
- Actions: edit/save, move up/down, delete with confirmation dialog

### Save Button
- Bulk saves all scenes via PUT `/api/projects/[id]/scenes`
- Maps Zustand store scenes to API format
- Loading spinner during save
- Toast success/error feedback

### Project Overview CTA Update
- Draft projects with no scenes: shows "Generate Story" CTA (dashed border card)
- Non-draft projects or projects with scenes: shows scene count + "Edit Story" or "Generate Story" link

### Validation Schemas
- `sceneSchema` — narrationText (1-2000), visualPrompt (1-2000), cameraDirection (optional, max 200), mood (optional, max 100), duration (optional, 1-60)
- `updateSceneSchema` — Partial version of sceneSchema
- `bulkScenesSchema` — Array of scenes with order numbers

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

## Key Decisions

- **No SSE/streaming** — `generateStory()` returns complete result from Gemini; processing overlay uses simulated progress intervals
- **Bulk save (delete-all + recreate)** — Simplest approach for handling reorders, additions, and deletions in one PUT operation
- **Optimistic UI via Zustand** — All scene edits happen immediately in client store; "Save" persists the entire state to DB
- **Inline editing** — Toggle between display/edit mode per scene card (no modal)
- **No drag-and-drop** — Uses Move Up/Down buttons; avoids new dependencies
- **Regeneration confirmation** — Dialog warning that all existing scenes will be replaced
- **Temporary IDs for new scenes** — `crypto.randomUUID()` for client-created scenes; bulk save handles them via delete-all-then-recreate
- **MongoDB createMany quirk** — Re-fetches scenes after createMany since MongoDB provider doesn't return records
