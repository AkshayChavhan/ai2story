# Feature: Initial Project Setup
## Feature ID: chore:1
## Status: Completed
## Commits: chore:1_initial-project-setup

---

## What This Feature Does:
Sets up the complete project foundation — Next.js application, all dependencies, database schema, folder structure, utility libraries, AI integration stubs, and placeholder pages for all routes.

## Files Involved:
| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | MongoDB database schema (11 models) |
| `src/lib/prisma.ts` | Prisma client singleton |
| `src/lib/auth.ts` | NextAuth.js v5 configuration |
| `src/lib/utils.ts` | Tailwind class merge utility |
| `src/lib/email.ts` | Email service (Resend) |
| `src/lib/storage.ts` | File storage utility |
| `src/lib/ai/*.ts` | AI service integrations |
| `src/types/index.ts` | TypeScript type definitions |
| `src/store/project-store.ts` | Zustand state store |
| `src/components/ui/*.tsx` | Base UI components |
| `src/app/**/*.tsx` | All route pages |
| `.env.example` | Environment variables template |

## Database Changes:
- Created full schema with 11 models: User, Account, Session, VerificationToken, Project, Scene, Character, MediaAsset, LoginHistory, SavedPrompt, StoryTemplate

## Environment Variables Used:
- DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
- GEMINI_API_KEY, GROQ_API_KEY
- HUGGINGFACE_TOKEN, RESEND_API_KEY
- NEXT_PUBLIC_APP_URL
- CLOUDFLARE_R2_* (optional)

## Dependencies Added:
All project dependencies — see package.json

## Known Limitations:
- Node.js v20+ required (v16 not supported by Next.js)
- All pages are placeholder — actual implementation follows per feature
- fluent-ffmpeg package is deprecated (consider alternatives in future)
