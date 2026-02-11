# Conversation: feat:3_project-management
## Date: 2026-02-11
## Feature: Project Management (CRUD)
## Branch: feat-3_project-management

---

### Context
feat:2_dashboard-layout was complete and merged via PR #2. The `/projects`, `/projects/new`, and `/projects/[id]` pages were stubs. User confirmed "Yes, ready for feat:3".

### Planning Phase
1. Created branch `feat-3_project-management` from main
2. Entered plan mode and explored codebase:
   - Read Prisma schema for Project model (title, description, prompt, status, genre, tone, targetLength, targetAudience, language, imageStyle, aspectRatio, scenes, characters)
   - Read existing types (`src/types/index.ts`): Genre (11), Tone (7), TargetAudience (4), ImageStyle (6), AspectRatio (3), ProjectStatus (5)
   - Read Zustand store (`src/store/project-store.ts`): useProjectStore with setCurrentProject, setScenes
   - Read existing UI components (Card, Button/buttonVariants, Badge, Input) to reuse patterns
   - Read auth forms to understand react-hook-form + zodResolver pattern
3. Designed plan: 11 new files, 4 modified files, 7 implementation steps
4. Plan approved by user

### Implementation

#### Step 1: Utilities & Validation
- Added `formatDate(date)` and `capitalize(str)` to `src/lib/utils.ts`
- Created `src/lib/validations/project.ts`:
  - `createProjectSchema` with title (1-100), prompt (1-2000), description (optional), genre/tone/audience enums, targetLength (30-300), defaults for language/imageStyle/aspectRatio
  - `updateProjectSchema` as `.partial()` of create schema
  - Exported option arrays for form selects

#### Step 2: UI Primitives
- Created `src/components/ui/textarea.tsx` — forwardRef matching Input pattern
- Created `src/components/ui/select.tsx` — native `<select>` wrapper (no Radix)
- Created `src/components/ui/dialog.tsx` — portal + overlay + escape + click-outside (no Radix)

#### Step 3: API Routes
- Created `src/app/api/projects/route.ts` — GET (list with search/status/genre/pagination) + POST (create with Zod validation)
- Created `src/app/api/projects/[id]/route.ts` — GET (with _count) + PUT (partial update) + DELETE (cascade)
- All routes: `auth()` check, ownership verification, Next.js 16 `await params`

#### Step 4: Project Components
- Created 6 components: ProjectCard, ProjectFilters, ProjectList, DeleteDialog, CreateForm, ProjectActions
- ProjectList fetches from `/api/projects` with URL params, renders grid + pagination
- CreateForm uses react-hook-form + zodResolver, posts to `/api/projects`, redirects on success
- DeleteDialog uses Dialog component, calls DELETE API with Sonner toast feedback

#### Step 5: Page Components
- Rewrote `/projects` — Server Component + auth + ProjectList client component
- Rewrote `/projects/new` — Server Component + auth + CreateForm client component
- Rewrote `/projects/[id]` — Server Component + Prisma fetch + ownership check + overview + ProjectActions

#### Step 6: Documentation
- Created `documents/features/feat-3_project-management.md`
- Updated `documents/architecture/ARCHITECTURE.md` — commit reference, API routes marked Done, new architecture decisions

### Build Issues Encountered

1. **zodResolver type mismatch** — `z.infer<typeof createProjectSchema>` produces the output type where `language`, `imageStyle`, `aspectRatio` are required (because they have `.default()`), but `useForm<CreateProjectFormData>` expects the input type where they're optional. The `zodResolver` bridges both but TypeScript couldn't reconcile them.
   - **Fix:** Changed `z.infer<>` to `z.input<>` for `CreateProjectFormData` and `UpdateProjectFormData`

### What Was Learned
- Zod's `z.infer<>` gives the output type (after transforms/defaults), while `z.input<>` gives the input type (before). For react-hook-form, `z.input<>` is correct because the form deals with input values.
- Next.js 16 makes `params` a Promise in both page components and route handlers — must always `await params`.
- MongoDB + Prisma `onDelete: Cascade` on Scene/Character relations means deleting a project automatically cleans up all related data.

### Session Context
- This session was a continuation from a previous conversation that ran out of context
- Previous session completed feat:0, feat:1, and feat:2
- User workflow rules: no direct merge to main (PRs only), no Co-Authored-By line, git config as "Akshay Chavhan" / "akshaychavhan676@gmail.com"
- Build requires Node 20 via nvm (`nvm use 20`)
