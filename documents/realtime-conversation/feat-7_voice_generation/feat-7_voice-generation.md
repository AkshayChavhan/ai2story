# feat:7_voice-generation — Development Conversation

## Feature: AI Voice Generation
**Branch:** `feat-7_voice-generation`

## Conversation Flow

1. **User confirmed ready** — PR #6 (feat:6) merged, local main synced
2. **Branch created** — `feat-7_voice-generation` from main
3. **Plan mode** — Explored existing code:
   - `src/lib/ai/voice-generator.ts` — Edge TTS integration already exists (`generateVoice()`, `listVoices()`)
   - `src/lib/storage.ts` — `saveAudio()` already exists
   - Prisma Scene model already has `audioUrl`, `voiceId`, `voiceSpeed`, `voicePitch` fields
   - Zustand store supports `"voice"` processing step
   - Processing overlay already handles any ProcessingStep
4. **Plan designed** — 7 new files, 3 modified files, 5 implementation steps
5. **Plan approved** — User approved
6. **Implementation** — Built in order:
   - Step 1: Created all 3 API routes (voices list, batch generate, single generate)
   - Step 2: Created GenerateVoicesButton, modified SceneCard/StoryEditor
   - Step 3: Created VoiceSelector, SceneVoiceCard, VoiceGallery, rewrote Voice page
   - Step 4: Created documentation and updated ARCHITECTURE.md
   - Step 5: Build verification

## Implementation Details

### Voice List API with Caching
- Module-level `cachedVoices` variable stores result after first fetch
- Maps `msedge-tts` Voice type (ShortName, FriendlyName, Gender, Locale) to project's VoiceOption type
- Language extracted from first part of Locale string (e.g., "en" from "en-US")

### Batch Voice Generation
- Sequential processing with 1-second delay (Edge TTS is fast)
- Voice settings from request body: `{ voiceId, speed, pitch, sceneIds }`
- Per-scene error handling — continues on failure
- Saves voice settings (voiceId, voiceSpeed, voicePitch) alongside audioUrl

### VoiceSelector Two-Tier Design
- First dropdown: locale filter (e.g., "en-US", "es-ES", "fr-FR")
- Second dropdown: voices within selected locale (name + gender)
- Changing locale auto-selects first voice in new locale
- Loading skeleton while fetching voices

### SceneCard Audio Integration
- Audio player (`<audio controls>`) below image preview in display mode
- Dashed placeholder with Volume2 icon when no audio
- Voice regenerate button (Volume2/Loader2) in header actions after image regenerate

### Voice Page Architecture
- Server Component (same pattern as Images page)
- VoiceGallery with default voice settings header + per-scene cards
- Grid layout `sm:grid-cols-1 lg:grid-cols-2` (wider than image cards due to controls)

## Key Decisions Made During Implementation

1. Used existing `generateVoice()` + `saveAudio()` pipeline instead of new abstractions
2. HTML5 `<audio controls>` — native browser player, no custom player needed
3. VoiceGallery uses local state (not Zustand) — same pattern as ImageGallery
4. Module-level cache for voice list — avoids repeated network calls
5. Per-scene voice settings stored in DB — enables different voices per scene
6. 5s progress simulation interval (vs 12s for images) — Edge TTS is faster
