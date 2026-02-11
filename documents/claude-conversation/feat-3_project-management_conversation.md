# Conversation: feat:3_project-management
## Date: 2026-02-11
## Feature: Project Management (CRUD)
## Commit: feat:3_project-management

---

### User Request:
> Yes, ready for feat:3.

### Claude's Plan:
Implemented full project CRUD in 7 steps:
1. Utilities & Validation — Added `formatDate()`, `capitalize()` to utils.ts; created Zod schemas for project create/update
2. UI Primitives — Created Textarea, Select (native), Dialog (native, no Radix)
3. API Routes — `/api/projects` (GET list + POST create), `/api/projects/[id]` (GET + PUT + DELETE)
4. Project Components — ProjectCard, ProjectFilters, ProjectList, DeleteDialog, CreateForm, ProjectActions
5. Page Components — Rewrote `/projects`, `/projects/new`, `/projects/[id]` from stubs to full implementations
6. Documentation — Feature docs, architecture updates
7. Build & Verify — Fixed zodResolver type mismatch

### Key Decisions Made:
1. **API routes for project CRUD** — Unlike dashboard (direct Prisma in Server Component), project list needs client-side search/filter/pagination
2. **Native `<select>` not Radix Select** — Consistent zero-dependency policy
3. **Dialog without Radix** — Same pattern as DropdownMenu/Sheet: portal + click-outside + escape
4. **`z.input<>` for form types** — Avoids type mismatch between Zod defaults (output type) and react-hook-form (input type)
5. **Ownership verification returns 404** — Not 403, to avoid revealing project existence to other users

### What Was Learned:
- Zod's `z.infer<>` gives output type (after defaults/transforms), `z.input<>` gives input type (before). react-hook-form needs the input type when schema has `.default()` fields.
- Next.js 16 makes `params` a Promise in both pages and route handlers — must use `await params`
- MongoDB + Prisma `onDelete: Cascade` automatically cleans up related Scene/Character records

### Next Steps:
- feat:4_story-generator-ui — Story generation wizard UI (prompt → AI scenes → images → voice → video)
