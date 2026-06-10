# AI Data Mastery

An online learning platform for AI training professionals. Browse and take courses on AI safety, red teaming, data quality, RLHF, content moderation, and human feedback collection.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at /api)
- `pnpm --filter @workspace/ai-trainer-course run dev` — run the frontend (port 21866, served at /)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed the database with course data
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter + TanStack Query + Tailwind + shadcn/ui
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/courses.ts` — full database schema (courses, modules, lessons, quizzes, progress, certificates)
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit manually)
- `lib/api-zod/src/generated/` — generated Zod validators for server use
- `artifacts/ai-trainer-course/src/pages/` — all frontend pages
- `artifacts/api-server/src/routes/` — all backend route handlers
- `scripts/src/seed.ts` — database seed script

## Architecture decisions

- OpenAPI-first: spec in `lib/api-spec/openapi.yaml` drives both frontend hooks (Orval) and backend Zod validators
- No auth implemented — all progress is tracked without user accounts (single-user model)
- Lesson progress stored in `lesson_progress` table keyed only by `lesson_id` (no user_id)
- Quizzes linked to lessons via `has_quiz` flag; quiz questions use 0-indexed `correct_option`
- Certificate issued when a full course is completed (not yet implemented in UI)

## Product

- **Home / Catalog** — browse all courses with filters by category, level, and sort order
- **Course Detail** — view course objectives, prerequisites, and module/lesson breakdown
- **Lesson Viewer** — read lesson content, navigate prev/next, mark complete
- **Quiz** — take knowledge checks attached to lessons, view results
- **Dashboard** — track total courses enrolled, lessons completed, hours learned, streak, and weekly activity chart

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, always run `pnpm --filter @workspace/api-spec run codegen` before building
- The seed script checks for existing courses and skips if data exists — truncate tables first if re-seeding
- `pnpm run typecheck:libs` must run before leaf package typechecks (already handled by `pnpm run typecheck`)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
