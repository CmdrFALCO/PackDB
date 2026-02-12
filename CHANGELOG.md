# Changelog

All notable changes to PackDB will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added — Phase 1B: CRUD + Value Resolver + Compare + Comments

- **Pack CRUD**: GET /api/packs (list with filters, search, pagination, sorting), POST /api/packs (create with unique constraint), GET /api/packs/{id} (resolved detail), PUT /api/packs/{id} (update), DELETE /api/packs/{id} (soft delete)
- **Domain endpoints**: GET /api/domains (list all), POST /api/domains (create), GET /api/domains/{id}/fields (list fields), POST /api/domains/{id}/fields (add field)
- **Field endpoints**: PUT /api/fields/{id} (update), DELETE /api/fields/{id} (soft delete)
- **Value endpoints**: GET /api/packs/{id}/values (all values grouped by domain/field), POST /api/packs/{id}/values (add value with source attribution), PUT /api/values/{id} (edit), DELETE /api/values/{id} (soft delete)
- **Comment endpoints**: GET /api/values/{id}/comments (list), POST /api/values/{id}/comments (add)
- **Compare endpoint**: GET /api/compare?ids=1,2,3 (side-by-side comparison of 2-3 packs)
- **Source priority endpoints**: GET /api/preferences/sources (get user's priority), PUT /api/preferences/sources (update priority order)
- **Value resolver service**: Resolves best value per field based on user's source type priority order, with fallback to default priority
- **Pydantic schemas**: PackCreate/Update/Response, DomainCreate/Response, FieldCreate/Update/Response, ValueCreate/Update/Response, CommentCreate/Response, SourcePriorityResponse/Update, ResolvedFieldValue, PackDetailResponse, CompareResponse
- **Field model**: Added is_active column for soft delete support (Alembic migration 002)
- Numeric value parsing for number-type fields (tolerant of annotations like "~195")
- Select field validation (value_text must be in select_options)
- Comment count included on each ValueResponse

### Added — Phase 1A: Project Scaffold

- Project scaffold: Docker Compose with PostgreSQL 16, FastAPI backend, React/Vite frontend
- SQLAlchemy 2.0 async models for all tables: users, packs, domains, fields, field_values, source_priorities, comments, attachments, components, pack_components
- Alembic async migrations with auto-run on backend startup
- Auth endpoints: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
- JWT authentication (HS256, 24-hour expiry) with bcrypt password hashing
- Health check endpoint: GET /api/health
- CORS configuration for localhost:3000
- Domain and field seeding: 7 default domains with 40 starter fields
- Standalone seed script (scripts/seed_domains.py) + auto-seed on startup
- Frontend scaffold: React 18 + TypeScript + Vite, served via Nginx in Docker
- CHANGELOG.md and CODEBASE_MAP.md documentation
