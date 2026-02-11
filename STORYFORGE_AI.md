# StoryForge AI — AI-Powered Short Video Story Generator

## Project Overview

**StoryForge AI** is a non-profit, open-source web application that enables users to create short video stories using AI. Users provide a text prompt, and the platform handles the entire pipeline — writing the story, generating AI images for each scene, producing natural AI voiceovers, and compositing everything into a polished short video.

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/AkshayChavhan/ai2story.git
cd ai2story

# 2. Install dependencies (requires Node.js >= 20.9.0)
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Generate Prisma client
npx prisma generate

# 5. Start development server
npm run dev
```

## Tech Stack (100% Free)

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS | Free |
| Database | MongoDB Atlas (Free M0) + Prisma | Free |
| Auth | NextAuth.js v5 (Credentials + OAuth) | Free |
| AI Story | Google Gemini API (free tier) | Free |
| AI Images | Pollinations.ai (no API key needed) | Free |
| AI Voice | Edge TTS (300+ voices) | Free |
| Video | FFmpeg (Ken Burns effects) | Free |
| Email | Resend (3K/month free) | Free |

## Project Structure

See `documents/architecture/ARCHITECTURE.md` for full system architecture.

## Feature Implementation Order

| # | Feature | Status |
|---|---------|--------|
| 0 | Initial project setup | Done |
| 1 | Auth system (login, signup, email verification) | Done |
| 2 | Dashboard layout | Planned |
| 3 | Project management (CRUD) | Planned |
| 4 | Story generator UI | Planned |
| 5 | Story AI integration (Gemini) | Planned |
| 6 | Image generation (Pollinations.ai) | Planned |
| 7 | Voice generation (Edge TTS) | Planned |
| 8 | Video composition (FFmpeg) | Planned |
| 9 | Export & download | Planned |
| 10 | Share system | Planned |
| 11-18 | Additional features | Planned |

## Documentation

All documentation lives in the `documents/` directory:
- `architecture/` — System architecture
- `features/` — Feature specifications
- `claude-conversation/` — Development conversation logs
- `realtime-conversation/` — Exact conversation logs and summaries from each feature's development session (e.g., `feat-1_auth_system/feat-1_auth-system.md` for the full conversation, `feat-1_summary.md` for the completion summary)
- `tech-stack/` — Technology documentation
- `layman-flow/` — Simple feature explanations
- `tech-flow/` — Technical flow diagrams

## License

Open source — Non-profit project.
