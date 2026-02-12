# feat:7_voice-generation — AI Voice Generation

## Overview

Implements AI voice generation for story scenes using Edge TTS (free, 300+ voices, no API key required). Each scene's `narrationText` is converted to MP3 audio using Microsoft Edge TTS. Audio files are saved to local disk (`public/uploads/audio/`) and displayed in both the Story Editor (inline audio player) and a dedicated Voice & Audio page with voice selection controls.

## What's Implemented

### API Routes
- **GET /api/voices** — Lists available Edge TTS voices. Maps `msedge-tts` voice metadata to `VoiceOption` type (id, name, language, gender, locale). Module-level cache to avoid repeated network calls to Microsoft.
- **POST /api/projects/[id]/generate-voices** — Batch generate audio for all scenes sequentially. 1-second delay between scenes. Per-scene error handling. Optional body: `{ voiceId?, speed?, pitch?, sceneIds? }` for voice settings and selective generation. Saves `audioUrl`, `voiceId`, `voiceSpeed`, `voicePitch` per scene. Returns `{ scenes, results: { total, success, failed, details } }`.
- **POST /api/projects/[id]/scenes/[sceneId]/generate-voice** — Regenerate audio for a single scene. Optional body: `{ voiceId?, speed?, pitch? }`. Falls back to scene's existing voice settings. Ownership chain verification (scene → project → user). Returns `{ scene: updatedScene }`.

### Story Editor Integration
- **GenerateVoicesButton** — Shows "Generate Voices" (Volume2) or "Regenerate Voices" (RefreshCw) based on existing audio. Confirmation dialog for regeneration. Simulated per-scene progress via setInterval (5s intervals). Updates Zustand store with new audioUrls. `variant="outline"`.
- **SceneCard audio player** — Display mode shows `<audio controls>` when audioUrl exists, dashed placeholder with Volume2 icon when absent. Per-scene voice regenerate button (Volume2 icon) in header actions.
- **StoryEditor toolbar** — GenerateVoicesButton added after GenerateImagesButton (conditional on `scenes.length > 0`).

### Voice & Audio Page (`/projects/[id]/voice`)
- **Server Component** — Auth check, project+scenes fetch via Prisma, ownership verification, renders VoiceGallery.
- **VoiceGallery** — Client component with local state. Header shows audio count summary + default VoiceSelector + speed/pitch controls + "Generate All" / "Regenerate All" button. Grid layout (`sm:grid-cols-1 lg:grid-cols-2`). Empty state if no scenes.
- **SceneVoiceCard** — Card with audio player or placeholder, narration text excerpt, per-scene VoiceSelector, speed/pitch controls, regenerate button.
- **VoiceSelector** — Two-tier dropdown: locale filter → voice within locale. Fetches voices from `/api/voices` on mount. Default: "en-US" / "en-US-AriaNeural".

## Files Created (7)

| File | Lines | Purpose |
|------|-------|---------|
| `src/app/api/voices/route.ts` | ~40 | GET: list TTS voices with module-level cache |
| `src/app/api/projects/[id]/generate-voices/route.ts` | ~130 | POST: batch generate audio for all scenes |
| `src/app/api/projects/[id]/scenes/[sceneId]/generate-voice/route.ts` | ~85 | POST: regenerate audio for a single scene |
| `src/components/story/generate-voices-button.tsx` | ~155 | Batch voice generation trigger with progress |
| `src/components/voice/voice-selector.tsx` | ~110 | Language-filtered two-tier voice dropdown |
| `src/components/voice/scene-voice-card.tsx` | ~145 | Per-scene audio card with player + voice controls |
| `src/components/voice/voice-gallery.tsx` | ~175 | Grid gallery for Voice page with default settings |

## Files Modified (3)

| File | Changes |
|------|---------|
| `src/components/story/scene-card.tsx` | Added audio player section + voice regenerate button + Volume2 import |
| `src/components/story/story-editor.tsx` | Added GenerateVoicesButton import + render in toolbar |
| `src/app/(dashboard)/projects/[id]/voice/page.tsx` | Replaced stub with Server Component + VoiceGallery |

## Key Decisions

- **1s delay between scenes** — Edge TTS is faster than Pollinations.ai; 1s sufficient
- **Language-filtered two-tier voice selector** — 300+ voices filtered by locale then voice
- **Default voice at gallery level, per-scene overrides** — Most users want one voice for all scenes
- **HTML5 `<audio controls>`** — Native browser player, zero dependencies
- **Voice settings saved per-scene** — voiceId, voiceSpeed, voicePitch saved on generation
- **Module-level cache for voice list** — Avoids repeated Microsoft API calls
- **`saveAudio()` function** — Purpose-built for audio files (defaults to `audio` subdirectory + `.mp3`)
- **Local React state for VoiceGallery** — Standalone page, independent from Story Editor
