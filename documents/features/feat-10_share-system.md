# feat:10_share-system — Share System

## Overview

Implements public sharing for StoryForge AI projects. Users can toggle sharing on a project to generate a unique public URL. Anyone with the link can view the final video without signing in. The sharing UI sits above the existing ExportPanel on the `/projects/[id]/share` page (now renamed "Export & Share"). A dedicated public video viewer page at `/share/[token]` displays the video with StoryForge AI branding and OG metadata for social media previews.

## What's Implemented

### API Route
- **POST /api/projects/[id]/share** — Enable sharing. Generates a UUID share token via `crypto.randomUUID()`, sets `isPublic=true` on the project. Requires auth + ownership. Returns `{ success, shareToken, isPublic }`. Validates that the project has a composed video (400 if not).
- **DELETE /api/projects/[id]/share** — Disable sharing. Clears the share token and sets `isPublic=false`. Returns `{ success, shareToken: null, isPublic: false }`.

### SharePanel Component
- Client component with three states:
  1. **No video** — muted text "Compose your video first before sharing"
  2. **Has video, private** — "Enable Sharing" button (primary variant)
  3. **Has video, public** — Share URL in read-only input + Copy button (with Check icon feedback) + "Disable Sharing" button (destructive variant)
- "Public" Badge with Globe icon shown when sharing is active
- Toast notifications for enable/disable/copy/errors
- Loading spinner during API calls

### Dashboard Share Page
- Heading updated from "Export & Download" to "Export & Share"
- SharePanel rendered above ExportPanel with Separator between them
- Passes `isPublic`, `shareToken`, and `videoUrl` from server-fetched project data

### Public Share Page (`/share/[token]`)
- Server Component — no auth required (middleware already allows `/share/*`)
- Prisma lookup by `shareToken` (unique field) — 404 if not found or `!isPublic`
- Displays: header branding, project title + description, `<video controls>` player with poster, resolution + duration badges, footer branding
- `generateMetadata` export for OG tags (title, description, thumbnail)

### TypeScript Types
- Added `shareToken?: string` to `StoryProject` interface

## Files Created (2)

| File | Lines | Purpose |
|------|-------|---------|
| `src/app/api/projects/[id]/share/route.ts` | ~100 | POST + DELETE for share management |
| `src/components/share/share-panel.tsx` | ~155 | Share toggle + URL display + copy-to-clipboard |

## Files Modified (3)

| File | Changes |
|------|---------|
| `src/types/index.ts` | Added `shareToken?: string` to StoryProject |
| `src/app/(dashboard)/projects/[id]/share/page.tsx` | Added SharePanel above ExportPanel, updated heading, added Separator |
| `src/app/share/[token]/page.tsx` | Rewrote stub → public video viewer with branding + OG metadata |

## Key Decisions

- **No new dependencies** — `crypto.randomUUID()` is built-in Node.js, already used in auth
- **Button toggle, not Switch** — Switch component doesn't exist; avoiding Radix per project conventions
- **POST + DELETE on same route** — RESTful: POST creates share, DELETE removes it
- **Server Component for public page** — No interactivity needed, better for SEO
- **`generateMetadata` for OG tags** — Share links show nice previews in chat/social apps
- **Double-check `isPublic` on public page** — Defense in depth even with valid token
- **Share requires composed video** — Disabled until `videoUrl` exists
- **No expiration or password** — MVP simplicity
