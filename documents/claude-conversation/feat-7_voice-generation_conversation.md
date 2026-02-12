# feat:7_voice-generation — Claude Conversation Summary

## Feature: AI Voice Generation
**Branch:** `feat-7_voice-generation`
**Status:** Complete

## Conversation Flow

1. **User confirmed ready** — PR for feat:6 merged, local main synced
2. **Branch created** — `feat-7_voice-generation` from main
3. **Plan mode** — Explored existing code (voice-generator.ts, storage.ts, Prisma Scene model, Zustand store, ProcessingStep types), designed 10-file plan (7 new, 3 modified)
4. **Plan approved** — User approved implementation plan
5. **Implementation** — Built in order: API routes (voices list + batch + single) → UI components (GenerateVoicesButton + SceneCard/StoryEditor modifications) → Voice page (VoiceSelector + SceneVoiceCard + VoiceGallery + page rewrite) → documentation → build verification

## Files Created (7)

| File | Purpose |
|------|---------|
| `src/app/api/voices/route.ts` | GET: list TTS voices with module-level cache |
| `src/app/api/projects/[id]/generate-voices/route.ts` | POST: batch generate audio for all scenes |
| `src/app/api/projects/[id]/scenes/[sceneId]/generate-voice/route.ts` | POST: regenerate audio for single scene |
| `src/components/story/generate-voices-button.tsx` | Batch voice generation trigger with progress |
| `src/components/voice/voice-selector.tsx` | Two-tier language-filtered voice dropdown |
| `src/components/voice/scene-voice-card.tsx` | Per-scene audio card with player + voice controls |
| `src/components/voice/voice-gallery.tsx` | Grid gallery for Voice page with default settings |

## Files Modified (3)

| File | Changes |
|------|---------|
| `src/components/story/scene-card.tsx` | Added audio player section + voice regenerate button |
| `src/components/story/story-editor.tsx` | Added GenerateVoicesButton import + render in toolbar |
| `src/app/(dashboard)/projects/[id]/voice/page.tsx` | Replaced stub with Server Component + VoiceGallery |

## Key Implementation Details

- Used existing `generateVoice()` from `src/lib/ai/voice-generator.ts` (Edge TTS, msedge-tts library)
- Used existing `saveAudio()` from `src/lib/storage.ts` for local disk storage
- Prisma Scene model already had `audioUrl`, `voiceId`, `voiceSpeed`, `voicePitch` fields — no schema changes
- All API routes follow established patterns: auth(), ownership verification, await params
- Batch generation processes scenes sequentially with 1s delay
- Per-scene error handling: one failure doesn't stop others
- No new dependencies added
