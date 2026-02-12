# Changelog

All notable changes to PackDB will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added

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
