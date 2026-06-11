# Build Plan — Canva-Inspired Design Platform

## Architecture Overview (Reverse-Engineered from Canva)

```
Browser
  └─ Cloudflare Turnstile (bot protection)
       └─ Service Worker (PWA, offline cache, preload)
            └─ App Shell (SSR HTML + embedded JSON payload)
                 ├─ JS Runtime (Webpack runtime)
                 ├─ Vendor Bundle (React, libs)
                 ├─ App Bundle (code-split by route)
                 ├─ Chunk Composer (HTTP/2 batch-composed JS+CSS)
                 ├─ Design Engine (canvas, layers, tools, history)
                 ├─ API Layer (AJAX: billing, folders, subscriptions, profiles)
                 └─ Monitoring (Sentry error tracking)
```

---

## Phase 1 — Project Scaffold & Dev Infrastructure

### 1.1 Initialize project
- **Stack**: Next.js (SPA+SSR) + React + TypeScript + Tailwind CSS
- **Bundler**: Webpack/Vite with code splitting
- **Init**: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.js`
- **Linting**: ESLint + Prettier

### 1.2 Dev tooling
- **Testing**: Vitest (unit) + Playwright (e2e)
- **CI/CD**: GitHub Actions (lint → test → build → deploy)
- **Monitoring**: Sentry integration

### 1.3 Folder structure
- All scaffolds created (see tree below)

### 1.4 Core configs
- Environment variables (`NEXT_PUBLIC_*`)
- Runtime config (feature flags, API base URLs)
- Content Security Policy headers

---

## Phase 2 — Application Shell & Routing

### 2.1 App shell (SSR)
- Server-render initial HTML with critical JSON payload embedded
- `<head>`: charset, viewport, favicon, preconnect hints, preload key fonts
- App layout shell (header, sidebar, canvas area placeholder)

### 2.2 Routing setup
- `/` — Landing/home
- `/design/:id` — Design editor (main canvas)
- `/templates` — Template gallery
- `/settings` — User settings
- `/_offline` — Offline fallback page

### 2.3 Layout components
- `Header` (logo, user avatar, search)
- `Sidebar` (layers, tools, brand kit)
- `CanvasArea` (the design surface)
- `PropertiesPanel` (contextual property editor)

### 2.4 Service worker (PWA)
- Cache-first strategy for static assets
- Network-first for API calls
- Offline fallback page
- Background sync for unsaved changes

---

## Phase 3 — Design Engine (Core)

### 3.1 Canvas engine
- HTML5 Canvas / WebGL rendering surface
- Zoom, pan, scroll
- Rulers, guides, grid snapping
- Viewport management (fit-to-screen, actual size)

### 3.2 Layer system
- Layer tree (groups, frames, shapes, text, images)
- Z-order management
- Visibility & lock toggles
- Nesting (groups within groups)

### 3.3 Design tools
- Select tool (click, drag-select, multi-select)
- Move tool (drag layers)
- Resize tool (handles, aspect-ratio lock)
- Shape tools (rect, circle, line, polygon)
- Text tool (inline editing, font selection)
- Image tool (upload, crop, fit)
- Pen tool (paths, bezier curves)
- Color picker (solid, gradient, eyedropper)

### 3.4 History / undo-redo
- Command pattern for all actions
- Undo stack (with grouping for atomic operations)
- Redo stack
- Max history limit (e.g., 200 steps)

### 3.5 Export engine
- PNG / JPG / SVG / PDF export
- Page/slide export (multi-page designs)
- Quality/size controls

---

## Phase 4 — Component Library

### 4.1 UI primitives (shadcn/ui or custom)
- Button, Input, Select, Checkbox, Radio, Toggle, Slider
- Modal, Drawer, Tooltip, Popover, Dropdown
- Tabs, Accordion, Stepper

### 4.2 Design-specific components
- `ColorPicker` (swatches, hex, HSL, eyedropper)
- `FontPicker` (family, weight, size, line-height)
- `LayerPanel` (drag-reorder tree)
- `PropertiesPanel` (contextual: shape/text/image properties)
- `Toolbar` (tool icons with keyboard shortcuts)
- `ZoomControls` (zoom slider + presets)

### 4.3 Layout components
- `ResizablePanel` (draggable panel dividers)
- `WorkspaceLayout` (configurable panel arrangement)
- `CommandPalette` (⌘+K quick actions)

---

## Phase 5 — API Layer & Data

### 5.1 API client
- Axios / fetch wrapper with CSRF token
- Request/response interceptors
- Error handling with Sentry breadcrumbs

### 5.2 Endpoints (mirrored from Canva patterns)
- `GET /ajax/designspec/spec` — Design spec/data
- `GET /ajax/folders/:id` — Folder contents
- `POST /ajax/csrf3/subscription` — Subscription
- `GET /ajax/billing/paymentconfig` — Billing config
- `GET /ajax/invitation/v2/brand/invitations` — Brand invites
- `GET /ajax/subscription/plans/pricegroups` — Pricing
- `GET /ajax/profile/membershiprequests` — Membership

### 5.3 State management
- Zustand or Jotai for global state
- Design document state (layers, properties, history)
- User session state
- UI state (panels, active tool, zoom)

### 5.4 Data persistence
- LocalStorage / IndexedDB for draft designs
- Auto-save with debounce
- Conflict resolution on sync

---

## Phase 6 — Performance & Code Splitting

### 6.1 Bundle splitting (Canva-inspired)
- **Runtime chunk** — Webpack runtime
- **Vendor chunk** — React, framework libs
- **App chunk** — Core application
- **Route-based chunks** — Per-page code splitting
- **Chunk composing** — Batch-compose small modules (mirroring `chunk-composing.canva.com` pattern)

### 6.2 Asset optimization
- Content-hashed filenames (e.g., `8b8159d71f235518.js`)
- CSS code splitting (`ltr.css` pattern)
- Font subsetting and preloading
- Image optimization (WebP, AVIF, lazy loading)

### 6.3 Loading strategy
- Critical CSS inlined
- Preload key chunks (`<link rel="preload">`)
- Preconnect to API/CDN origins
- Deferred non-critical JS

---

## Phase 7 — Monitoring & Analytics

### 7.1 Error tracking (Sentry)
- Source maps upload
- User context tagging
- Breadcrumbs for user actions
- Performance tracing (spans for design operations)

### 7.2 Analytics
- Page views (route changes)
- Feature usage (tool selections, exports)
- Performance metrics (TTFB, FCP, LCP, CLS)
- Custom events (design save, publish, share)

### 7.3 Conversion tracking
- Google Ads events (via GTM)
- LinkedIn insight tag

---

## Phase 8 — Testing & QA

### 8.1 Unit tests
- Design engine (layer operations, history, transforms)
- Utility functions (formatting, math, storage)
- State management (store actions, reducers)

### 8.2 Integration tests
- API client + mock server
- Component interactions (tool selection → canvas update)

### 8.3 E2E tests (Playwright)
- Full design flow: create → edit → export
- Undo/redo chain verification
- Offline mode behavior
- Responsive layout (mobile, tablet, desktop)

### 8.4 Performance budget
- JS bundle < 500 KB (initial load)
- CSS < 100 KB
- TTI < 3s on 3G
- Lighthouse score ≥ 90

---

## Phase 9 — Deployment

### 9.1 Infrastructure
- Static hosting (Vercel / Cloudflare Pages)
- CDN with edge caching
- Cloudflare Turnstile (bot protection)

### 9.2 CI/CD pipeline
- Branch: `main` → staging deploy
- Tag: `v*` → production deploy
- Automated Lighthouse CI
- Sentry release tracking

### 9.3 Domain setup
- Custom domain with HTTPS
- Service worker scope registration

---

## Project Tree

```
project-root/
├── public/                    # Static assets (served as-is)
│   ├── favicon/
│   ├── fonts/
│   └── data/
├── src/
│   ├── app/                   # Next.js App Router / Pages
│   │   ├── pages/             # Route pages
│   │   ├── layouts/           # App layouts (shell, editor, settings)
│   │   └── routes/            # Route config & guards
│   ├── components/
│   │   ├── ui/                # Primitives (button, input, modal...)
│   │   ├── design/            # Design-specific (color picker, font picker...)
│   │   ├── layout/            # Panels, workspaces, resizable
│   │   └── forms/             # Form components
│   ├── design-engine/         # Core design engine
│   │   ├── canvas/            # Rendering surface
│   │   ├── layers/            # Layer tree, operations
│   │   ├── tools/             # Select, move, draw, text, pen...
│   │   ├── history/           # Undo/redo command pattern
│   │   └── export/            # Export to PNG/JPG/SVG/PDF
│   ├── api/
│   │   ├── endpoints/         # API route handlers
│   │   ├── middleware/        # Auth, CSRF, rate-limit
│   │   └── types/             # API request/response types
│   ├── assets/
│   │   ├── images/
│   │   ├── fonts/
│   │   ├── icons/
│   │   └── data/              # Static JSON data
│   ├── styles/
│   │   ├── base/              # Reset, variables, mixins
│   │   ├── themes/            # Light, dark themes
│   │   └── components/        # Component-scoped styles
│   ├── service-worker/        # PWA service worker logic
│   ├── utils/
│   │   ├── browser/           # DOM, storage, URL utils
│   │   ├── design/            # Geometry, color, font utils
│   │   ├── format/            # Date, number, locale
│   │   └── storage/           # LocalStorage, IndexedDB wrappers
│   ├── hooks/                 # React hooks
│   ├── stores/                # Zustand stores
│   ├── lib/                   # Third-party lib wrappers
│   └── config/                # App config (env, feature flags)
├── scripts/
│   └── build/                 # Build helpers
├── tests/
│   ├── unit/
│   ├── e2e/
│   └── integration/
├── docs/
│   ├── architecture/
│   ├── api/
│   └── components/
├── BUILD_PLAN.md
└── package.json
```

---

## Immediate Next Steps (What to Build First)

```
Week 1  → Phase 1 (scaffold) + Phase 2 (app shell + routing + service worker)
Week 2  → Phase 3.1–3.3 (canvas engine + layers + basic tools)
Week 3  → Phase 3.4–3.5 (history/undo + export) + Phase 4 (component library)
Week 4  → Phase 5 (API + state + persistence)
Week 5  → Phase 6 (performance + chunking)
Week 6  → Phase 7–9 (monitoring, testing, deployment)
```
