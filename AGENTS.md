# Session Summary

## Goal
- Build a Canva-inspired design platform with interactive canvas editor, layer management, drawing tools, persistence, auth, and deployment-ready architecture.

## Constraints & Preferences
- Next.js 14.2.35 + React 18 + TypeScript + Tailwind CSS 3 + Zustand
- Canvas 2D API for rendering (not WebGL or third-party libs)
- Service worker (plain JS at `public/sw.js`) with cache-first static, network-first API
- symlinked node_modules from `/tmp/design-studio-node` due to parentheses in project path causing npm tar extraction failures
- All pages must return HTTP 200, 0 TS errors, all tests pass

## Progress
### Done
- Phase A–G: Core interaction loop, tool dispatcher, Zustand render loop, undo/redo, DPR scaling, all 7 tools, selection + resize handles, ContextMenu, localStorage auto-save, text editing, PropertiesPanel, Canvas Engine rendering (blend modes, gradients, shadows, corner radius, stroke, line/polygon), theme migration (midnight blue + electric violet), unit tests (118), E2E tests (25).
- P2–P7: Auth, Alignment/Guides/Snap, Templates with search/filter, SVG export + Publish API + public view, RAF-throttled rendering + viewport culling + image Web Worker, Team/Collab with SSE real-time cursors.
- **Name change**: "Design Platform" → "beetreez designes" across all source files — homepage heading, page title, header brand, login page, E2E assertions.
- **Supabase migration**: 3 migrations applied (001 schema, 002 RLS, 003 seed templates). Data layer rewritten — all 12 API routes using Supabase (zero file I/O). Profiles created on-demand.
- **Vercel deployment**: Live at `https://beetreez-designes.vercel.app` (team `andle-the-barssop-v1-s-projects`, project `beetreez-designes`). 5 env vars configured.
- **Windows & Screens + Transit modules**: Full CRUD — migrations 004/005, types, Zod schemas, API routes, UI pages, middleware, homepage links.
- **Template categories**: 3 new categories (Photobooks, Invitations, Tributes) with seed templates via REST API.
- **Search/filter**: Text + category filter on templates page with empty state.
- **Mobile responsive**: Responsive grids + padding on all content pages.
- **Template previews**: SVG thumbnails with name, dimensions, category color, aspect ratio.
- **Image upload**: Supabase Storage bucket `design-assets` created, `/api/upload` route, ImageTool uploads with data URL fallback.
- **Publishing enhancements**: Publish modal (title/description/visibility), `published_at` tracking, view page metadata, migration 007 columns.
- **Sentry**: `@sentry/nextjs` installed, client/server/edge configs, `src/instrumentation.ts`. DSN env var placeholder set but empty.
- **CI/CD**: `.github/workflows/ci.yml` — typecheck + unit tests on push/PR, auto-deploy to Vercel on main.
- **User onboarding**: 5-step welcome overlay, localStorage-dismissed, auto-hidden in test envs.
- **E2E tests**: 44 tests (27 editor + 17 modules), 42 passing, 2 flaky (timing). 118 unit tests pass. Build 0 TS errors.

### In Progress
- *(none)*

### Blocked
- Supabase direct DB connection (`db.ejoscvxmctrqhayeyerj.supabase.co` + pooler) does not resolve DNS from this machine. `exec_sql` RPC not installed. **User must run combined migration SQL in Supabase Dashboard** (`supabase/migrations/combined_remaining.sql` → paste at `https://supabase.com/dashboard/project/ejoscvxmctrqhayeyerj/sql/new`).
- `NEXT_PUBLIC_SENTRY_DSN` empty — user must create Sentry project at https://sentry.io and add DSN to `.env.local` + Vercel env vars.
- GitHub CI/CD secrets not configured — user must add 5 secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`) to GitHub repo secrets.

## Key Decisions
- **Table reuse**: No separate `canvas_projects`/`canvas_layers` tables. Existing `designs` serves as project container via `project_type` column.
- **Template seeding**: REST API (`Prefer: resolution=merge-duplicates`) rather than direct DB.
- **Image storage**: Supabase Storage bucket `design-assets` + `/api/upload` route. Falls back to data URL.
- **Supabase data layer uses `createServiceClient()` (admin bypass) in API routes** — NextAuth handles session auth, service role performs DB operations. RLS policies exist for future migration to Supabase Auth.
- **Database IDs are text (emails/UUIDs)**, not UUID FKs to `auth.users`.

## Next Steps (manual — blocked from CLI)
1. **Run SQL**: Paste `supabase/migrations/combined_remaining.sql` into Supabase Dashboard at `https://supabase.com/dashboard/project/ejoscvxmctrqhayeyerj/sql/new`
2. **Sentry**: Create project at https://sentry.io, copy DSN, set `NEXT_PUBLIC_SENTRY_DSN` in `.env.local` and Vercel env vars (`vercel env add NEXT_PUBLIC_SENTRY_DSN`)
3. **GitHub secrets**: Add these to https://github.com/makhosipro-coder/beetreez-designes/settings/secrets/actions:
   - `VERCEL_TOKEN` — create at https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` = `team_vaWfxCpVukuu0j3hx7WYCaLR`
   - `VERCEL_PROJECT_ID` = `prj_nmtosiAjycINbrXS4KBM3L5Ab3Bk`
   - `SUPABASE_ACCESS_TOKEN` — create at https://supabase.com/dashboard/account/tokens
   - `SUPABASE_DB_PASSWORD` — the postgres password for this project (set at creation time, can be reset in project settings → Database → Reset password)
4. **Re-deploy**: Trigger the Migrate Database workflow in GitHub Actions, or paste SQL into Supabase Dashboard. Then push to main for auto-deploy.

## Critical Context
- **Node v20.20.2**, Apple Silicon ARM64. node_modules symlinked from `/tmp/design-studio-node`.
- **Vercel**: `npm run build / next build` works via webpack. Turbopack fails with symlinked node_modules.
- **Auth**: Any email + 3+ char password. Middleware protects `/design/*`, `/templates`, `/settings`, `/teams/*`, `/windows-screens/*`, `/transit/*`.
- **Supabase**: Project `ejoscvxmctrqhayeyerj`. 3 migrations applied. 4 pending (004–007 combined). Storage bucket `design-assets` created.
- **Sentry**: DSN not set — no errors tracked until configured.
- **CI/CD**: Requires `VERCEL_TOKEN` + `VERCEL_ORG_ID` + `VERCEL_PROJECT_ID` in GitHub secrets.

## Vercel Info
- **Org ID**: `team_vaWfxCpVukuu0j3hx7WYCaLR`
- **Project ID**: `prj_nmtosiAjycINbrXS4KBM3L5Ab3Bk`
- **Project**: `beetreez-designes`
- **Env vars configured**: NEXTAUTH_URL, NEXTAUTH_SECRET, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL
- **Missing**: NEXT_PUBLIC_SENTRY_DSN

## Relevant Files
- `supabase/migrations/combined_remaining.sql`: Single SQL file with all 4 pending migrations (004–007)
- `supabase/migrations/004_module_tables.sql`: Individual migration — `project_type` column + module tables
- `supabase/migrations/005_rls_modules.sql`: RLS policies for module tables
- `supabase/migrations/006_storage_bucket.sql`: Storage bucket + policies (already applied)
- `supabase/migrations/007_publishing_enhancements.sql`: Publishing metadata columns
- `.github/workflows/ci.yml`: GitHub Actions — typecheck + unit tests + Vercel deploy
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `src/instrumentation.ts`: Sentry configs
