# Changelog

All notable changes to PackDB will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added — Phase 2B: Pack Browser (Card Grid + Filters + Compare)

- **Pack Browser page**: Full replacement of placeholder with filter bar, card grid, pagination, compare selection, and add/edit/delete dialogs
- **PackCard component**: Displays OEM (bold), model + variant, year, market badge, fuel type badge, platform; click navigates to `/packs/:id`; hover-visible checkbox for compare selection; hover-visible 3-dot menu with Edit and Delete actions
- **PackCardGrid component**: Responsive grid (1 col mobile, 2 tablet, 3–4 desktop); skeleton loading state; contextual empty states ("No battery packs yet" vs "No packs match your filters")
- **FilterBar component**: Search input (searches OEM, model, variant, platform) + Select dropdowns for Market, Fuel Type, Vehicle Class, Drivetrain; all filters reset page to 1; "Clear" button resets all filters
- **PackFormDialog component**: Shared dialog for Add Pack and Edit Pack; form fields: OEM, Model, Year, Variant, Market, Fuel Type, Vehicle Class, Drivetrain, Platform; uses `useMutation` with query invalidation and toast notifications; inline error display for unique constraint violations
- **DeletePackDialog component**: Confirmation dialog for soft delete with `useMutation`, query invalidation, and toast feedback
- **CompareButton component**: Floating bottom-center button appears when 2–3 packs selected; navigates to `/compare?ids=...`; max 3 selection enforced with toast warning; clear selection button
- **Pagination**: Previous/Next controls with "Showing X–Y of Z packs" and page indicator; 20 packs per page
- **Toast notifications**: Sonner `<Toaster>` added to App.tsx with dark theme; success/error toasts for all CRUD operations
- **shadcn/ui components**: Installed select, skeleton, checkbox
- **PackListParams fix**: Added missing `drivetrain` and `platform` fields to match backend query params

### Added — Phase 2A: Auth Flow + Layout Shell + Dark Theme

- **Frontend dependencies**: react-router-dom, @tanstack/react-query, axios, Tailwind CSS v4, shadcn/ui, lucide-react
- **Tailwind CSS v4**: Configured with @tailwindcss/vite plugin, custom dark theme as permanent default (no light/dark toggle)
- **Dark theme**: PackDB dark navy/charcoal palette (#080b0f background, #c8d6e5 text, #2d9cdb primary accent), source badge colors defined as CSS custom properties
- **shadcn/ui**: Initialized with button, input, label, card, dialog, tabs, badge, dropdown-menu, sonner components
- **TypeScript types**: All interfaces matching backend Pydantic schemas (User, Pack, Domain, Field, FieldValue, ResolvedFieldValue, PackDetailResponse, CompareResponse, Comment, SourcePriority, SOURCE_TYPES, SOURCE_DISPLAY)
- **API client**: Axios instance with JWT auto-attach from localStorage, 401 auto-redirect to /login
- **API functions**: auth (login/register/me), packs (CRUD), domains (list/fields/create), values (CRUD), comments (list/create), compare, sourcePriority (get/update)
- **Auth context**: AuthProvider with login, register, logout, user state, token management, auto-validate token on mount via /api/auth/me
- **Routing**: React Router v6 with public routes (/login, /register), protected routes (/, /packs/:id, /compare, /settings), ProtectedRoute and PublicRoute wrapper components
- **Layout shell**: MainLayout with sticky header (PackDB branding, user display name, logout button), centered content area (max-width 1400px)
- **Login page**: Email + password form, error display, link to register, dark-themed centered card
- **Register page**: Display name + email + password form, auto-login on success, link to login
- **Placeholder pages**: BrowserPage, PackDetailPage, ComparePage, SettingsPage (ready for Phase 2B/2C)
- **TanStack Query**: QueryClient configured with 30s staleTime, 1 retry
- **Vite proxy**: /api requests proxied to localhost:8000 for seamless backend communication
- **Path aliases**: @ → src/ configured in tsconfig.json and vite.config.ts

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
