# StoryForge AI — System Architecture
## Last Updated: 2026-02-11
## Updated By Commit: feat:1_auth-system

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
| Video | FFmpeg | via fluent-ffmpeg | Ken Burns + transitions |
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
| * | /api/projects | Project CRUD | Planned |
| * | /api/projects/[id] | Single project | Planned |
| * | /api/voices | List TTS voices | Planned |
| * | /api/media | Media library | Planned |
| * | /api/templates | Story templates | Planned |
| * | /api/share | Public sharing | Planned |

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
