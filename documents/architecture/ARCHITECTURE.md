# StoryForge AI — System Architecture
## Last Updated: 2026-02-11
## Updated By Commit: feat:10_share-system

---

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Frontend | Next.js (App Router) | 16.x | React 19, TypeScript |
| Styling | Tailwind CSS | 4.x | With Shadcn/UI components |
| Database | MongoDB Atlas | Free M0 | Via Prisma ORM |
| ORM | Prisma | 6.x | MongoDB provider |
| Authentication | NextAuth.js v5 | 5.0.0-beta | JWT strategy |
| State Management | Zustand | 5.x | Client-side state |
| AI - Story | Google Gemini | Free tier | 15 RPM |
| AI - Images | Pollinations.ai | Free, no key | Flux-based |
| AI - Voice | Edge TTS | Free, unlimited | 300+ voices |
| Video | FFmpeg | via ffmpeg-static | Ken Burns + transitions |
| Export | archiver | Latest | ZIP bundle creation |
| Email | Resend | Free tier | 3K emails/month |
| Forms | React Hook Form + Zod | Latest | Validation |
| Notifications | Sonner | Latest | Toast notifications |
| Icons | Lucide React | Latest | Open source |

## API Routes Map

| Method | Route | Purpose | Status |
|--------|-------|---------|--------|
| * | /api/auth/[...nextauth] | NextAuth handlers | Done |
| POST | /api/auth/signup | User registration | Done |
| POST | /api/auth/verify-email | Email verification | Done |
| POST | /api/auth/resend-verification | Resend verification email | Done |
| POST | /api/auth/record-login | Record login history | Done |
| POST | /api/auth/forgot-password | Request password reset | Done |
| POST | /api/auth/reset-password | Reset password with token | Done |
| GET | /api/projects | List projects (search, filter, paginate) | Done |
| POST | /api/projects | Create project | Done |
| GET | /api/projects/[id] | Fetch single project | Done |
| PUT | /api/projects/[id] | Update project | Done |
| DELETE | /api/projects/[id] | Delete project (cascades) | Done |
| POST | /api/projects/[id]/generate | Trigger AI story generation | Done |
| GET | /api/projects/[id]/scenes | List scenes for a project | Done |
| PUT | /api/projects/[id]/scenes | Bulk save/update all scenes | Done |
| PUT | /api/projects/[id]/scenes/[sceneId] | Update a single scene | Done |
| DELETE | /api/projects/[id]/scenes/[sceneId] | Delete a scene + reorder | Done |
| POST | /api/projects/[id]/generate-images | Batch generate images for all scenes | Done |
| POST | /api/projects/[id]/scenes/[sceneId]/generate-image | Regenerate image for a single scene | Done |
| GET | /api/voices | List available TTS voices (cached) | Done |
| POST | /api/projects/[id]/generate-voices | Batch generate audio for all scenes | Done |
| POST | /api/projects/[id]/scenes/[sceneId]/generate-voice | Regenerate audio for a single scene | Done |
| POST | /api/projects/[id]/compose | Batch compose video from images + audio | Done |
| POST | /api/projects/[id]/export | Generate ZIP bundle of all project assets | Done |
| POST | /api/projects/[id]/share | Enable public sharing (generate token) | Done |
| DELETE | /api/projects/[id]/share | Disable public sharing (clear token) | Done |
| * | /api/media | Media library | Planned |
| * | /api/templates | Story templates | Planned |

## Database Schema Overview

| Model | Purpose | Relations |
|-------|---------|-----------|
| User | User accounts & profiles | Projects, MediaAssets, Sessions |
| Account | OAuth provider accounts | User |
| Session | Active sessions | User |
| VerificationToken | Email verification | - |
| PasswordResetToken | Password reset tokens | - |
| Project | Story projects | User, Scenes, Characters |
| Scene | Individual story scenes | Project |
| Character | Project characters | Project |
| MediaAsset | Uploaded/generated media | User |
| LoginHistory | Login audit trail | User |
| SavedPrompt | User saved prompts | User |
| StoryTemplate | Pre-built templates | - |

## Documentation Structure

All documentation lives in the `documents/` directory:

| Folder | Purpose |
|--------|---------|
| `architecture/` | System architecture (this file) |
| `features/` | Feature specifications and implementation details |
| `claude-conversation/` | Development conversation logs (summarized) |
| `realtime-conversation/` | Exact conversation logs and summaries from each feature's development session |
| `tech-stack/` | Technology documentation |
| `layman-flow/` | Simple feature explanations for non-technical users |
| `tech-flow/` | Technical flow diagrams |

### Realtime Conversation Structure

Each feature gets a subfolder inside `realtime-conversation/` named after the branch:

```
documents/realtime-conversation/
  feat-1_auth_system/
    feat-1_auth-system.md    # Full exact conversation from the development session
    feat-1_summary.md        # Completion summary (what was implemented, files changed)
  feat-2_dashboard_layout/
    feat-2_dashboard-layout.md
    feat-2_summary.md
  ...
```

This folder preserves the exact development context for each feature, including plans, decisions, and implementation details.

## Architecture Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-02-11 | Next.js 16 App Router | Latest stable, built-in API routes, server components |
| 2026-02-11 | MongoDB + Prisma | Free Atlas tier, flexible schema for AI content |
| 2026-02-11 | Edge TTS for voices | Free, unlimited, 300+ voices, no API key needed |
| 2026-02-11 | Pollinations.ai for images | Free, no API key, unlimited, Flux-based quality |
| 2026-02-11 | Google Gemini for story AI | Best free tier (15 RPM, 1M tokens/min) |
| 2026-02-11 | FFmpeg for video | Open source, Ken Burns effect, no AI video API needed |
| 2026-02-11 | Local disk storage for MVP | Simplest setup, migrate to R2 later |
| 2026-02-11 | JWT session strategy | Stateless, works with single device enforcement |
| 2026-02-11 | Prisma v6 (downgraded from v7) | v7 removed datasource `url` property in schema, breaking MongoDB setup |
| 2026-02-11 | No PrismaAdapter for NextAuth | Conflicts with JWT strategy + Credentials provider; manual Prisma queries give full control over OAuth user creation and single-device enforcement |
| 2026-02-11 | No Radix UI for DropdownMenu/Sheet | Zero new dependencies; native React state + click-outside + escape key sufficient for current needs |
| 2026-02-11 | Dashboard page as Server Component | Uses auth() + Prisma directly for data; no API route or loading state needed |
| 2026-02-11 | API routes for project CRUD | Project list needs client-side search/filter; API routes enable that while server pages use direct Prisma |
| 2026-02-11 | No Radix UI for Dialog/Select | Continued zero-dependency approach; native Dialog with portal + escape + click-outside; native `<select>` for form dropdowns |
| 2026-02-11 | `z.input<>` for form types | Avoids type mismatch between Zod output types (with defaults) and react-hook-form input types |
| 2026-02-11 | Simulated progress for story generation | `generateStory()` is a single Gemini API call (not streamed); UI uses setInterval with progress steps |
| 2026-02-11 | Bulk save (delete-all + recreate) for scenes | Simplest approach for handling reorders, additions, and deletions in one PUT; avoids complex upsert logic |
| 2026-02-11 | Optimistic UI via Zustand for scene editing | All edits happen immediately in client store; "Save" button persists entire state to DB |
| 2026-02-11 | No drag-and-drop for scene reordering | Move Up/Down buttons avoid new dependencies; works with existing `reorderScenes()` store action |
| 2026-02-11 | Sequential image generation with 2s delay | Pollinations.ai rate limits; sequential also enables per-scene progress tracking |
| 2026-02-11 | Image style prepended to visual prompt | Format `"{imageStyle} style, {visualPrompt}"` for consistent results across scenes |
| 2026-02-11 | Per-scene error handling in batch generation | One failed image doesn't prevent all others from generating |
| 2026-02-11 | Server-side batch processing for images | Single POST processes all scenes server-side; survives tab close |
| 2026-02-11 | Local `<img>` tags for generated images | Images are local files in `public/uploads/`; no Next.js Image domain config needed |
| 2026-02-11 | `nologo=true` on Pollinations URL | Removes watermark from generated images |
| 2026-02-11 | Local React state for ImageGallery | Standalone page uses local state instead of Zustand (independent from Story Editor) |
| 2026-02-11 | 1s delay for voice generation | Edge TTS is faster than Pollinations.ai; 1s delay sufficient between scenes |
| 2026-02-11 | Two-tier voice selector (locale → voice) | 300+ voices too many for flat dropdown; filter by locale first |
| 2026-02-11 | Default voice at gallery level | Most users want one voice; per-scene override available in SceneVoiceCard |
| 2026-02-11 | HTML5 `<audio controls>` for playback | Native browser player, zero dependencies, works everywhere |
| 2026-02-11 | Voice settings saved per-scene in DB | voiceId, voiceSpeed, voicePitch persisted for reproducibility |
| 2026-02-11 | Module-level cache for voice list | `listVoices()` makes network call; cached in module variable |
| 2026-02-11 | `ffmpeg-static` for FFmpeg binary | Bundles FFmpeg binary via npm; Turbopack-compatible (`@ffmpeg-installer/ffmpeg` failed with dynamic require) |
| 2026-02-11 | 3s delay between scene compositions | Video composition is CPU-intensive; prevents system overload |
| 2026-02-11 | `getVideoResolution()` from aspect ratio | Maps 9:16→1080x1920, 16:9→1920x1080, 1:1→1080x1080 |
| 2026-02-11 | ComposeButton prerequisite check | Disabled until all scenes have both imageUrl and audioUrl |
| 2026-02-11 | No per-scene video recomposition | Composition is expensive; batch-only from toolbar or gallery |
| 2026-02-11 | HTML5 `<video controls>` for playback | Native browser video player, zero dependencies |
| 2026-02-11 | `concatenateScenes()` helper | Separates concatenation from scene composition for clean API |
| 2026-02-11 | `archiver` for ZIP export | No native Node.js ZIP utility; archiver is lightweight, streaming, well-maintained |
| 2026-02-11 | Streaming ZIP via TransformStream | Pipes archiver output to Web API ReadableStream; no temp file on disk |
| 2026-02-11 | Client-side video download | Final video already in public/; programmatic anchor with download attribute, no API call |
| 2026-02-11 | ZIP requires composed video | Export only available after video composition; ensures primary deliverable exists |
| 2026-02-11 | `existsSync()` for ZIP assets | Gracefully skip missing files instead of failing entire export |
| 2026-02-11 | Padded scene naming in ZIP | `scene-01`, `scene-02` for clean alphabetical sorting |
| 2026-02-11 | Share page reused for export | `/projects/[id]/share` stub becomes export page; feat:10 adds sharing alongside |
| 2026-02-11 | Dual Download/Export button | "Download" when video exists (direct MP4), "Export" when no video (navigate to export page) |
| 2026-02-11 | `crypto.randomUUID()` for share tokens | Built-in Node.js, already used in auth; UUID v4 gives sufficient uniqueness |
| 2026-02-11 | Button toggle for sharing, not Switch | Switch component doesn't exist; avoiding Radix dependency per conventions |
| 2026-02-11 | Server Component for public share page | No interactivity needed; better for SEO and initial load |
| 2026-02-11 | `generateMetadata` for OG tags | Share link previews show title + description + thumbnail in social/chat apps |
| 2026-02-11 | Double-check `isPublic` on public page | Even with valid token, video won't display if isPublic is false (defense in depth) |
| 2026-02-11 | Share requires composed video | Prevents sharing empty project; Enable Sharing disabled until videoUrl exists |
