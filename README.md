# PackDB — EV Battery Pack Database

A self-hosted internal web application for centralizing EV battery pack data with multi-source attribution.

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Run

```bash
docker compose up --build
```

### Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| Health Check | http://localhost:8000/api/health |

### First Steps

1. Open Swagger UI at http://localhost:8000/docs
2. Register a user via `POST /api/auth/register`
3. Login via `POST /api/auth/login` to get a JWT
4. Use the JWT in the Authorize button to access protected endpoints

### Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_PASSWORD` | PostgreSQL password | `packdb_dev_password` |
| `SECRET_KEY` | JWT signing key | dev key (change in production) |

## Tech Stack

- **Database:** PostgreSQL 16
- **Backend:** Python 3.12 + FastAPI
- **Frontend:** React 18 + TypeScript + Vite
- **Deployment:** Docker Compose
