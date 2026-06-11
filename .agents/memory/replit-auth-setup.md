---
name: Replit Auth Setup
description: Auth fully integrated using Replit OIDC. Key decisions and gotchas for this project.
---

## Auth is live

Sessions and users tables exist in the DB. The `lib/replit-auth-web` package provides `useAuth()` for the frontend.

## Per-user Progress Scoping

`lesson_progress`, `quiz_attempts`, and `certificates` tables each have a nullable `user_id` (text, no FK constraint). When `req.isAuthenticated()`:
- Queries filter by `eq(table.userId, req.user.id)`
- Inserts include `userId: req.user.id`

When not authenticated, queries use `isNull(table.userId)` to return legacy/anonymous data.

**Why:** Nullable userId allows backward compat with existing data while enabling per-user tracking for new authenticated users.

## Gotcha: lib tsconfig needs composite flags

`lib/replit-auth-web/tsconfig.json` needs `composite: true`, `declarationMap: true`, `emitDeclarationOnly: true` since it's a composite lib.

## Gotcha: import.meta.env in libs

`lib/replit-auth-web` uses `import.meta.env.BASE_URL`. Since the lib does not depend on vite directly, declare `ImportMeta` in `lib/replit-auth-web/src/vite-env.d.ts` instead of using `/// <reference types="vite/client" />` or adding vite to devDeps.
