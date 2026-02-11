# Conversation: chore:1_Initial Project Setup
## Date: 2026-02-11
## Feature: Project Initialization
## Commit: chore:1_initial-project-setup

---

### User Request:
> Set up the complete StoryForge AI project with all dependencies, folder structure, Prisma schema, and initial configuration as defined in the STORYFORGE_AI.md spec.

### Claude's Plan:
1. Initialize Next.js 14+ project with TypeScript, Tailwind CSS, App Router
2. Install all required npm dependencies (production + dev)
3. Create complete folder structure matching the spec
4. Set up Prisma schema with all MongoDB models
5. Configure NextAuth.js v5 with Credentials + OAuth providers
6. Create utility files (prisma.ts, utils.ts, auth.ts, email.ts, storage.ts)
7. Create AI integration stubs (story-generator, image-generator, voice-generator, video-composer)
8. Set up Zustand store for project state management
9. Create TypeScript type definitions
10. Create placeholder pages for all routes
11. Set up Shadcn/UI base components (Button, Input)
12. Create .env.example with all required environment variables
13. Create initial documentation
14. Push to GitHub

### Files Created:
- `prisma/schema.prisma` — MongoDB schema with 11 models
- `src/lib/prisma.ts` — Prisma client singleton
- `src/lib/auth.ts` — NextAuth.js v5 configuration
- `src/lib/utils.ts` — cn() utility for Tailwind class merging
- `src/lib/email.ts` — Resend email service
- `src/lib/storage.ts` — Local file storage utility
- `src/lib/ai/story-generator.ts` — Google Gemini story generation
- `src/lib/ai/image-generator.ts` — Pollinations.ai image generation
- `src/lib/ai/voice-generator.ts` — Edge TTS voice generation
- `src/lib/ai/video-composer.ts` — FFmpeg video composition
- `src/types/index.ts` — Shared TypeScript types
- `src/store/project-store.ts` — Zustand project state store
- `src/components/ui/button.tsx` — Shadcn/UI Button component
- `src/components/ui/input.tsx` — Shadcn/UI Input component
- `src/app/layout.tsx` — Root layout with metadata and Toaster
- `src/app/page.tsx` — Landing page with hero and feature cards
- `src/app/globals.css` — Tailwind CSS with design tokens
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth API route
- `src/app/(auth)/login/page.tsx` — Login page placeholder
- `src/app/(auth)/signup/page.tsx` — Signup page placeholder
- `src/app/(auth)/forgot-password/page.tsx` — Forgot password placeholder
- `src/app/(auth)/verify-email/[token]/page.tsx` — Email verification placeholder
- `src/app/(dashboard)/dashboard/page.tsx` — Dashboard home placeholder
- `src/app/(dashboard)/projects/page.tsx` — Projects list placeholder
- `src/app/(dashboard)/projects/new/page.tsx` — New project placeholder
- `src/app/(dashboard)/projects/[id]/page.tsx` — Project overview placeholder
- `src/app/(dashboard)/projects/[id]/story/page.tsx` — Story editor placeholder
- `src/app/(dashboard)/projects/[id]/images/page.tsx` — Images placeholder
- `src/app/(dashboard)/projects/[id]/voice/page.tsx` — Voice placeholder
- `src/app/(dashboard)/projects/[id]/compose/page.tsx` — Video composer placeholder
- `src/app/(dashboard)/projects/[id]/share/page.tsx` — Share placeholder
- `src/app/(dashboard)/media/page.tsx` — Media library placeholder
- `src/app/(dashboard)/templates/page.tsx` — Templates placeholder
- `src/app/(dashboard)/settings/page.tsx` — Settings placeholder
- `src/app/share/[token]/page.tsx` — Public share placeholder
- `.env.example` — Environment variables template
- `documents/architecture/ARCHITECTURE.md` — System architecture doc
- `STORYFORGE_AI.md` — Complete project spec

### Key Decisions Made:
1. Used Next.js 16 (latest from create-next-app) with App Router for server components support
2. Node.js upgraded from v16 to v20 via nvm (required by Next.js)
3. Local disk storage for MVP (public/uploads) — simple, no external service needed
4. JWT session strategy for NextAuth — enables stateless single device enforcement
5. Zustand for client state — lightweight, simple API, no boilerplate

### What Was Learned:
- Next.js App Router uses file-based routing with page.tsx convention
- Route groups like (auth) and (dashboard) organize routes without affecting URL
- Prisma with MongoDB requires @db.ObjectId for ID fields
- NextAuth v5 exports { handlers, signIn, signOut, auth } from the config
- Tailwind CSS v4 uses @theme inline for CSS variable integration

### Next Steps:
- feat:1_auth-system — Implement full login/signup with email verification
