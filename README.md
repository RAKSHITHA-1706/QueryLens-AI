# QueryLens AI 🔍

> An AI-powered conversational database analyst — ask questions in plain English, get SQL, charts, and insights back.

---

## Architecture

```
User
 └─► React Chat UI (Vite + TypeScript + Tailwind)
       └─► FastAPI Backend (Python)
             ├─► OpenAI Agent  (tool/function calling)
             │     ├─► Schema Inspector Tool
             │     ├─► SQL Generator & Validator Tool
             │     ├─► Query Executor Tool
             │     └─► Visualization Tool (Plotly)
             └─► SQLite Database (via SQLAlchemy)
```

### Monorepo Layout

```
querylens-ai/
├── frontend/          # React + TypeScript + Tailwind UI
├── backend/           # FastAPI + SQLAlchemy + OpenAI
├── database/          # SQLite seed scripts and schema
├── tests/             # Integration tests
├── docs/              # Architecture docs
├── .env.example       # Environment variable template
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |

---

## Environment Variables

Copy `.env.example` to `.env` in the **project root** and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | *(required)* |
| `DATABASE_URL` | SQLAlchemy database URL | `sqlite:///./database/querylens.db` |
| `BACKEND_HOST` | Host for uvicorn | `0.0.0.0` |
| `BACKEND_PORT` | Port for uvicorn | `8000` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173` |
| `ENVIRONMENT` | `development` or `production` | `development` |

---

## Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (macOS/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp ../.env.example ../.env
# (edit .env with your OPENAI_API_KEY)

# Start the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: **http://localhost:8000**

API docs (Swagger UI): **http://localhost:8000/docs**

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## Database Setup

```bash
# From the project root
python database/seed.py
```

This creates `database/querylens.db` with sample tables and data for testing.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check — returns `{"status": "ok"}` |

More endpoints will be added in subsequent phases.

---

## Running Tests

```bash
cd backend
python -m pytest tests/ -v
```

---

## Development Notes

- **CORS** is configured to allow `http://localhost:5173` (Vite default) in development.
- **API keys** are never hardcoded — always use `.env`.
- **SQLite** is used for local development; swap `DATABASE_URL` for PostgreSQL in production.
- AI agent logic is **not yet implemented** — this is the foundation phase.
