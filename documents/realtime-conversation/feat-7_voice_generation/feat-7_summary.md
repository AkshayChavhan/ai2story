# feat:7_voice-generation — AI Voice Generation

**Status:** Complete and pushed to GitHub
**Branch:** `feat-7_voice-generation`
**Scope:** 10 files changed (7 created, 3 modified)

---

## What's Implemented

### API Routes
- **GET /api/voices** — Lists available Edge TTS voices. Module-level cache. Maps to VoiceOption type (id=ShortName, name=FriendlyName, gender, locale, language).
- **POST /api/projects/[id]/generate-voices** — Batch generate audio for all scenes. Sequential with 1s delay. Per-scene error handling. Optional body: `{ voiceId?, speed?, pitch?, sceneIds? }`. Saves voiceId/voiceSpeed/voicePitch per scene. Returns `{ scenes, results }`.
- **POST /api/projects/[id]/scenes/[sceneId]/generate-voice** — Regenerate single scene audio. Optional body for voice settings. Falls back to scene's existing settings. Ownership chain verification.

### Story Editor Changes
- **GenerateVoicesButton** — Volume2 icon, step="voice", 5s progress intervals, confirmation dialog for regeneration. Updates Zustand store with audioUrls.
- **SceneCard** — Audio player (`<audio controls>`) or placeholder below image preview. Voice regenerate button (Volume2) in header actions.
- **StoryEditor** — GenerateVoicesButton added to toolbar after GenerateImagesButton.

### Voice & Audio Page (`/projects/[id]/voice`)
- **Server Component** — Auth, Prisma fetch, ownership check, renders VoiceGallery.
- **VoiceGallery** — Local state. Audio count summary. Default VoiceSelector + speed/pitch controls. "Generate All"/"Regenerate All" button. Grid layout.
- **SceneVoiceCard** — Audio player, narration text, per-scene VoiceSelector, speed/pitch controls, regenerate button.
- **VoiceSelector** — Two-tier: locale dropdown → voice dropdown. Fetches from /api/voices.

## Key Design Decisions

1. **1s delay between scenes** — Edge TTS is fast; 1s delay sufficient
2. **Two-tier voice selector** — Locale filter → voice list (300+ voices too many for flat dropdown)
3. **Default voice at gallery level** — Per-scene override available in SceneVoiceCard
4. **HTML5 `<audio controls>`** — Native browser player, zero dependencies
5. **Voice settings saved per-scene** — voiceId, voiceSpeed, voicePitch persisted in DB
6. **Module-level cache for voice list** — Skips network call on subsequent requests
7. **`saveAudio()` function** — Purpose-built, defaults to audio subdirectory + .mp3
8. **Local React state for VoiceGallery** — Independent from Zustand store

## Files Created (7)

| File | Purpose |
|------|---------|
| `src/app/api/voices/route.ts` | GET: list TTS voices with cache |
| `src/app/api/projects/[id]/generate-voices/route.ts` | POST: batch generate audio |
| `src/app/api/projects/[id]/scenes/[sceneId]/generate-voice/route.ts` | POST: regenerate single scene audio |
| `src/components/story/generate-voices-button.tsx` | Batch voice generation trigger |
| `src/components/voice/voice-selector.tsx` | Two-tier voice dropdown |
| `src/components/voice/scene-voice-card.tsx` | Per-scene audio card |
| `src/components/voice/voice-gallery.tsx` | Grid gallery for Voice page |

## Files Modified (3)

| File | Changes |
|------|---------|
| `src/components/story/scene-card.tsx` | Added audio player + voice regenerate button |
| `src/components/story/story-editor.tsx` | Added GenerateVoicesButton to toolbar |
| `src/app/(dashboard)/projects/[id]/voice/page.tsx` | Replaced stub with Server Component + VoiceGallery |
