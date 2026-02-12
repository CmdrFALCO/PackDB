# PackDB — Codebase Map

**PackDB** is a self-hosted internal web app for centralizing EV battery pack data with multi-source attribution.

## Tech Stack

PostgreSQL 16 | Python 3.12 + FastAPI | React 18 + TypeScript | Docker Compose

## Directory Structure

```
packdb/
├── docker-compose.yml          — Orchestrates db, backend, frontend services
├── .env / .env.example         — Environment variables (DB_PASSWORD, SECRET_KEY)
├── CHANGELOG.md                — What changed each phase
├── CODEBASE_MAP.md             — This file
│
├── backend/
│   ├── Dockerfile              — Python 3.12 slim image, uvicorn with --reload
│   ├── requirements.txt        — FastAPI, SQLAlchemy, Alembic, passlib, python-jose
│   ├── alembic.ini             — Alembic config (async PostgreSQL)
│   ├── alembic/
│   │   ├── env.py              — Async migration runner, imports all models
│   │   ├── script.py.mako      — Migration template
│   │   └── versions/           — Auto-generated migration files
│   ├── app/
│   │   ├── main.py             — FastAPI app, CORS, lifespan (migrations + seeding)
│   │   ├── config.py           — Pydantic Settings (DATABASE_URL, SECRET_KEY, etc.)
│   │   ├── database.py         — Async SQLAlchemy engine, session factory, get_db dependency
│   │   ├── models/             — SQLAlchemy 2.0 ORM models
│   │   │   ├── user.py         — Users table
│   │   │   ├── pack.py         — Battery packs table (soft delete via is_active)
│   │   │   ├── domain.py       — Domains (Cell, Housing, E/E, etc.)
│   │   │   ├── field.py        — Fields within domains (flexible schema)
│   │   │   ├── value.py        — Field values with source attribution
│   │   │   ├── source_priority.py — Per-user source priority ordering
│   │   │   ├── comment.py      — Comments on field values
│   │   │   ├── attachment.py   — File attachments (table only, no endpoints yet)
│   │   │   └── component.py    — Shared components + pack_components junction
│   │   ├── schemas/            — Pydantic v2 request/response models
│   │   │   ├── user.py         — UserRegister, UserLogin, UserResponse, TokenResponse
│   │   │   ├── pack.py         — PackCreate, PackUpdate, PackResponse, PackListResponse
│   │   │   ├── domain.py       — DomainCreate, DomainResponse
│   │   │   ├── field.py        — FieldCreate, FieldUpdate, FieldResponse
│   │   │   ├── value.py        — ValueCreate/Update/Response, ResolvedFieldValue, PackDetailResponse, CompareResponse
│   │   │   ├── comment.py      — CommentCreate, CommentResponse
│   │   │   └── source_priority.py — SourcePriorityResponse, SourcePriorityUpdate
│   │   ├── routers/            — API route handlers
│   │   │   ├── auth.py         — /api/auth/register, /api/auth/login, /api/auth/me
│   │   │   ├── packs.py        — /api/packs CRUD (list, create, detail, update, soft delete)
│   │   │   ├── domains.py      — /api/domains (list, create, list fields, add field)
│   │   │   ├── fields.py       — /api/fields (update, soft delete)
│   │   │   ├── values.py       — /api/packs/{id}/values, /api/values/{id} (CRUD with source attribution)
│   │   │   ├── comments.py     — /api/values/{id}/comments (list, create)
│   │   │   ├── compare.py      — /api/compare?ids=1,2,3 (side-by-side pack comparison)
│   │   │   └── source_priorities.py — /api/preferences/sources (get/update priority order)
│   │   ├── services/           — Business logic
│   │   │   └── value_resolver.py — resolve_pack_values(): resolves best value per field by user priority
│   │   └── utils/
│   │       ├── security.py     — JWT creation/validation, password hashing
│   │       └── deps.py         — get_current_user FastAPI dependency
│   └── uploads/                — File storage directory (future use)
│
├── frontend/
│   ├── Dockerfile              — Multi-stage: Node build → Nginx serve
│   ├── nginx.conf              — Serves SPA, proxies /api/ to backend
│   ├── package.json            — React 18, Vite, TypeScript, Tailwind v4, shadcn/ui
│   ├── tsconfig.json           — TypeScript config with @/ path alias
│   ├── vite.config.ts          — Vite + Tailwind plugin + /api proxy to backend
│   ├── components.json         — shadcn/ui configuration
│   ├── index.html              — Entry HTML
│   └── src/
│       ├── main.tsx            — React root + QueryClientProvider + AuthProvider
│       ├── App.tsx             — React Router v6 setup with protected/public routes
│       ├── api/
│       │   ├── client.ts       — Axios instance with JWT auto-attach + 401 handling
│       │   ├── auth.ts         — login (form-encoded), register, getMe
│       │   ├── packs.ts        — listPacks, getPack, createPack, updatePack, deletePack
│       │   ├── domains.ts      — listDomains, listFields, createField
│       │   ├── values.ts       — createValue, updateValue, deleteValue
│       │   ├── comments.ts     — listComments, createComment
│       │   ├── compare.ts      — comparePacks
│       │   └── sourcePriority.ts — getSourcePriority, updateSourcePriority
│       ├── context/
│       │   └── AuthContext.tsx  — Auth state, login/register/logout, token validation
│       ├── components/
│       │   ├── layout/
│       │   │   └── MainLayout.tsx — Header (PackDB + user + logout) + content area
│       │   ├── packs/
│       │   │   ├── PackCard.tsx       — Pack card: OEM, model/variant, year, badges, checkbox, 3-dot menu
│       │   │   ├── PackCardGrid.tsx   — Responsive grid with loading skeletons and empty states
│       │   │   ├── FilterBar.tsx      — Search + Market/FuelType/VehicleClass/Drivetrain selects
│       │   │   ├── PackFormDialog.tsx — Shared Add/Edit pack dialog with form + useMutation
│       │   │   ├── DeletePackDialog.tsx — Delete confirmation dialog with useMutation
│       │   │   └── CompareButton.tsx  — Floating compare button (2–3 packs selected)
│       │   └── ui/             — shadcn/ui components (button, input, label, card, dialog, tabs, badge, dropdown-menu, sonner, select, skeleton, checkbox)
│       ├── pages/
│       │   ├── LoginPage.tsx   — Login form with error handling
│       │   ├── RegisterPage.tsx — Registration form with auto-login
│       │   ├── BrowserPage.tsx — Pack browser: filters, card grid, pagination, compare selection, CRUD dialogs
│       │   ├── PackDetailPage.tsx — Pack detail (placeholder for Phase 2C)
│       │   ├── ComparePage.tsx — Compare view (placeholder for Phase 2C)
│       │   └── SettingsPage.tsx — Settings (placeholder for Phase 2C)
│       ├── types/
│       │   └── index.ts        — TypeScript interfaces matching backend schemas
│       ├── hooks/              — Custom hooks (ready for Phase 2B)
│       ├── styles/
│       │   └── globals.css     — Tailwind v4 imports + PackDB dark theme variables
│       ├── lib/
│       │   └── utils.ts        — cn() utility for Tailwind class merging
│       └── vite-env.d.ts       — Vite type declarations
│
└── scripts/
    └── seed_domains.py         — Seeds 7 default domains + 40 starter fields
```

## How to Run (Development)

**Backend:**
```bash
cd backend
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Swagger UI:** http://localhost:8000/docs
- **Health check:** http://localhost:8000/api/health

The Vite dev server proxies `/api` requests to the backend at `localhost:8000`.

## How to Run (Docker)

```bash
docker compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000

## How to Seed

Domains and fields seed automatically on first backend startup. To re-run manually:

```bash
docker compose exec backend python scripts/seed_domains.py
```

## Current State

**Phase 2B complete:**
- All Phase 1A + 1B backend items (scaffold, models, auth, CRUD, value resolver, compare, comments)
- Frontend auth flow: login/register with JWT token management
- Protected routing with auto-redirect to /login
- Layout shell with dark-themed header
- Tailwind CSS v4 with permanent dark theme
- shadcn/ui components initialized (+ select, skeleton, checkbox)
- API client with JWT auto-attach and 401 handling
- TanStack Query configured
- TypeScript types matching all backend schemas
- Pack Browser page: card grid, filter bar, pagination, compare selection, add/edit/delete pack dialogs, toast notifications
- Placeholder pages for Pack Detail, Compare, Settings

**Next: Phase 2C** — Pack detail page, compare view, settings
