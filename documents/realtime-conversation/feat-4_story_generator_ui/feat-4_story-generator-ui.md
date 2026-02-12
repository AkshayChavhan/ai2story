# feat:4_story-generator-ui — Development Conversation

## Session Context

- **Previous feature:** feat:3_project-management (complete, merged via PR #3)
- **Branch:** `feat-4_story-generator-ui` (created from up-to-date main)
- **Objective:** Implement Story Generator UI — trigger AI story generation from project prompt, view/edit/reorder/save generated scenes

## Planning Phase

### Codebase Exploration
Examined existing code to understand what was already built:
- `src/lib/ai/story-generator.ts` — `generateStory(params)` already exists, calls Gemini 2.0 Flash, returns `{ title, scenes[] }`
- `src/store/project-store.ts` — Zustand store with `setCurrentProject`, `setScenes`, `updateScene`, `addScene`, `removeScene`, `reorderScenes`, `setProcessing`, `setProcessingStatus`, `reset`
- `src/types/index.ts` — `StoryScene`, `ProcessingStatus`, `ProcessingStep` types already defined
- Prisma Scene model — has all needed fields (order, narrationText, visualPrompt, cameraDirection, mood, duration, voiceId, voiceSpeed, voicePitch, imageUrl, audioUrl, videoClipUrl)

### Plan Created
10 new files + 2 modified files:
1. Validation schemas (Zod)
2. 3 API routes (generate, scenes CRUD, single scene CRUD)
3. 6 UI components (story-editor, generate-button, processing-overlay, scene-list, scene-card, save-button)
4. Rewrite story page stub
5. Update project overview CTA

## Implementation Phase

### Step 1: Validation Schema
Created `src/lib/validations/scene.ts` with `sceneSchema`, `updateSceneSchema`, `bulkScenesSchema`, and exported types using `z.input<>`.

### Step 2: API Routes
Created all 3 API route files:
- `POST /api/projects/[id]/generate` — Calls `generateStory()`, replaces scenes in DB, updates project status
- `GET /api/projects/[id]/scenes` — Lists scenes ordered by `order`
- `PUT /api/projects/[id]/scenes` — Bulk save (delete all + recreate)
- `PUT /api/projects/[id]/scenes/[sceneId]` — Update single scene
- `DELETE /api/projects/[id]/scenes/[sceneId]` — Delete scene + reorder remaining

All routes follow established patterns: `auth()`, ownership verification, `await params`, proper error handling.

### Step 3: UI Components
Created all 6 components:
- **ProcessingOverlay** — Animated gradient progress bar reading from Zustand store
- **SceneCard** — Display/edit toggle, inline editing with Textarea/Input, move up/down/delete actions
- **SceneList** — Maps scenes from store to SceneCards, "Add Scene" button with `crypto.randomUUID()`
- **GenerateButton** — Generate/Regenerate with confirmation dialog, simulated progress during API call
- **SaveButton** — Bulk save via PUT, loading spinner, toast feedback
- **StoryEditor** — Main orchestrator: initializes Zustand store from server props, renders all children

### Step 4: Page Updates
- Rewrote `story/page.tsx` from stub to full Server Component with Prisma fetch + StoryEditor render
- Updated `[id]/page.tsx` CTA section: draft+no scenes shows "Generate Story", otherwise shows scene count + "Edit Story"

### Step 5: Documentation
Created feature docs, realtime conversation docs, and updated ARCHITECTURE.md.

### Step 6: Build & Verify
Ran `npm run build` — verified no errors.

## Technical Notes

- **Simulated progress:** Since `generateStory()` is a single API call (not streamed), the processing overlay uses `setInterval` with predefined progress steps to simulate progress while waiting for the Gemini response
- **Bulk save pattern:** Delete-all-then-recreate is simpler than per-scene upsert for handling reorders, additions, and deletions simultaneously
- **MongoDB createMany quirk:** `prisma.scene.createMany()` doesn't return records in MongoDB, so we re-fetch after creating
- **Ownership chain for single scene routes:** Verifies scene → project → user ownership chain (not just scene.id)
