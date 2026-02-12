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
│   ├── package.json            — React 18, Vite, TypeScript
│   ├── tsconfig.json           — TypeScript config
│   ├── vite.config.ts          — Vite config
│   ├── index.html              — Entry HTML
│   └── src/
│       ├── main.tsx            — React root render
│       ├── App.tsx             — Placeholder landing page
│       └── vite-env.d.ts       — Vite type declarations
│
└── scripts/
    └── seed_domains.py         — Seeds 7 default domains + 40 starter fields
```

## How to Run

```bash
docker compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Swagger UI:** http://localhost:8000/docs
- **Health check:** http://localhost:8000/api/health

## How to Seed

Domains and fields seed automatically on first backend startup. To re-run manually:

```bash
docker compose exec backend python scripts/seed_domains.py
```

## Current State

**Phase 1B complete:**
- All Phase 1A items (scaffold, models, auth, seeding)
- Pack CRUD with filters, search, pagination, sorting
- Domain and field management endpoints
- Value endpoints with multi-source attribution
- Value resolver service (per-user source priority)
- Comments on field values
- Side-by-side pack comparison (2-3 packs)
- Source priority management (per-user preference)
- Field soft delete support (is_active column, migration 002)

**Next: Phase 2A** — Frontend: Pack browser + detail views
