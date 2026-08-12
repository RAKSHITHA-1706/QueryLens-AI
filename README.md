<div align="center">

# 🔍 QueryLens AI

### *AI-Powered Natural Language Database Query & Analytics Platform*

> **Talk to your database in plain English.**  
> QueryLens AI transforms natural language questions into precise SQL queries,  
> executes them safely, and returns rich data visualizations — powered by Google Gemini.

<br/>

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

</div>

---

## 🎬 Demo

> **📺 Watch QueryLens AI in action:**
>
> **https://drive.google.com/file/d/1bqhfWshxfnCNt0juu7wvoBSEva3TpbLv/view?usp=sharing**
>
> *See natural language queries transform into SQL, execute against a live database, and render as charts — all in seconds.*

---

## 💡 The Problem

Traditional database querying creates an invisible wall between **data** and **decisions**.

| Challenge | Impact |
|---|---|
| SQL expertise required | Only developers can extract insights |
| Complex JOIN logic | Business analysts depend on engineering teams |
| Schema memorization | Slow iteration on business questions |
| Manual chart creation | Hours spent on visualizations, not decisions |
| Zero natural language support | Data stays locked away from non-technical stakeholders |

> Most organizations have their data — they just can't *talk* to it.

---

## ✅ The Solution

**QueryLens AI** eliminates the SQL barrier entirely.

Ask your database a question the way you would ask a colleague. QueryLens AI:

1. **Understands** your question using Google Gemini's natural language intelligence
2. **Generates** a precise, schema-aware SQL query automatically
3. **Validates** the query for safety before any execution occurs
4. **Executes** against the database and returns structured results
5. **Visualizes** the data as charts and analytics cards
6. **Self-corrects** — if a query fails, it automatically retries with a corrected version

No SQL knowledge required. No waiting for a data analyst. Just answers.

---

## ✨ Key Features

### 🧠 AI-Powered SQL Generation
Google Gemini translates plain English into optimized, schema-aware SQLite queries. The model is given full knowledge of your database structure — it never invents tables or columns.

### 🔁 Automatic Self-Correction Pipeline
When a generated query encounters a database error, the system automatically feeds the error back to Gemini and regenerates a corrected query — up to 2 retries before gracefully surfacing the issue.

### 🛡️ Multi-Layer SQL Validation
Every query — generated *or* user-submitted — passes through a strict validation layer that blocks all write operations (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`) and enforces read-only execution.

### 📊 Dynamic Data Visualizations
Query results are rendered as interactive charts (bar, line, pie) using Recharts, automatically selecting the most appropriate chart type for the returned data shape.

### 🔍 SQL Transparency
Users always see the exact SQL that was generated and executed. No black boxes. Full auditability.

### 📋 Database Schema Awareness
The system dynamically inspects the live database schema — tables, columns, types, primary keys, foreign key relationships — and injects this context into every AI prompt.

### 📱 Responsive Analytics Dashboard
A polished React UI with animated transitions (Framer Motion), data tables, and summary analytics cards — fully responsive across devices.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    QueryLens AI                          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              React Frontend (Vite)               │   │
│  │   TypeScript · Tailwind CSS · Recharts           │   │
│  │   Framer Motion · Lucide React                   │   │
│  └────────────────────┬────────────────────────────┘   │
│                        │  HTTP / REST                    │
│  ┌─────────────────────▼────────────────────────────┐   │
│  │           FastAPI Backend (Python)               │   │
│  │                                                   │   │
│  │  ┌──────────────┐    ┌────────────────────────┐  │   │
│  │  │  Query API   │    │      Schema API         │  │   │
│  │  │  /api/query  │    │      /api/schema        │  │   │
│  │  └──────┬───────┘    └────────────────────────┘  │   │
│  │         │                                         │   │
│  │  ┌──────▼──────────────────────────────────────┐ │   │
│  │  │           Query Orchestration Layer          │ │   │
│  │  │                                              │ │   │
│  │  │  1. SQL Generation  ──► Gemini API           │ │   │
│  │  │  2. SQL Validation  ──► Safety Gate          │ │   │
│  │  │  3. SQL Execution   ──► SQLAlchemy            │ │   │
│  │  │  4. Self-Correction ──► Gemini API (retry)   │ │   │
│  │  └──────────────────────────┬───────────────────┘ │   │
│  │                              │                     │   │
│  │  ┌───────────────────────────▼───────────────────┐│   │
│  │  │         SQLite Database (SQLAlchemy)           ││   │
│  │  │   categories · customers · products            ││   │
│  │  │   orders · order_items · payments              ││   │
│  │  └───────────────────────────────────────────────┘│   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Query Lifecycle

```
Natural Language Question
        │
        ▼
┌──────────────────┐
│  Gemini AI       │  ← Schema context injected into prompt
│  SQL Generation  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  SQL Validation  │  ← Block unsafe keywords, empty SQL, multi-statements
└────────┬─────────┘
         │
         ├─── FAIL ──► Return validation_error
         │
         ▼
┌──────────────────┐
│  SQL Execution   │  ← Read-only, row-limited, safe
└────────┬─────────┘
         │
         ├─── DB ERROR ──► Gemini Self-Correction (max 2 retries) ──► Re-execute
         │
         ▼
┌──────────────────┐
│  Structured      │  ← columns, rows, row_count, truncated
│  Result          │
└────────┬─────────┘
         │
         ▼
  Charts + Insights + Dashboard
```

### Project Structure

```
querylens-ai/
├── frontend/                  # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/             # Dashboard, Query views
│   │   └── hooks/             # Custom React hooks
│   └── package.json
│
├── backend/                   # FastAPI + Python
│   ├── app/
│   │   ├── api/               # Route handlers
│   │   │   ├── query.py       # /api/query endpoints
│   │   │   ├── schema.py      # /api/schema endpoint
│   │   │   └── health.py      # /api/health endpoint
│   │   ├── services/          # Business logic
│   │   │   ├── gemini_service.py          # Gemini API client
│   │   │   ├── sql_generation_service.py  # NL → SQL
│   │   │   ├── sql_correction_service.py  # Self-correction
│   │   │   ├── sql_validation_service.py  # Safety gate
│   │   │   ├── query_service.py           # Orchestration
│   │   │   └── schema_service.py          # Schema inspection
│   │   ├── tools/             # Execution utilities
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── database/          # DB connection
│   │   └── config.py          # Settings (env vars)
│   ├── tests/                 # Pytest test suite
│   └── requirements.txt
│
├── database/                  # SQLite seed data
│   └── seed.py
│
├── .env.example               # Environment variable template
├── docker-compose.yml
└── README.md
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | Component-based UI framework |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Fast development build tool |
| **Tailwind CSS** | Utility-first styling |
| **Recharts** | Declarative chart components |
| **Framer Motion** | Smooth UI animations |
| **Lucide React** | Consistent icon system |

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.10+** | Core server language |
| **FastAPI** | High-performance async REST API |
| **SQLAlchemy** | ORM and database toolkit |
| **Uvicorn** | ASGI production server |
| **Pydantic** | Request/response validation |
| **Pytest** | Automated testing |

### AI
| Technology | Purpose |
|---|---|
| **Google Gemini 2.5 Flash** | Natural language to SQL generation & self-correction |
| **Google GenAI SDK (`google-genai`)** | Official Python SDK for Gemini API |

### Database
| Technology | Purpose |
|---|---|
| **SQLite** | Embedded relational database |


## 🔌 API Endpoints

### Health Check
```http
GET /api/health
```
Returns system status.

**Response:**
```json
{
  "status": "ok"
}
```

---

### Database Schema
```http
GET /api/schema
```
Returns the full live database schema — all tables, columns, types, primary keys, and foreign key relationships.

**Response:**
```json
{
  "tables": {
    "customers": {
      "columns": [{ "name": "id", "type": "INTEGER" }, ...],
      "primary_keys": ["id"],
      "foreign_keys": []
    }
  },
  "relationships": [...]
}
```

---

### Generate SQL from Natural Language
```http
POST /api/query/generate
```
Translates a natural language question into SQL. Does **not** execute it.

**Request:**
```json
{
  "question": "Show top 5 products by price"
}
```

**Response:**
```json
{
  "success": true,
  "question": "Show top 5 products by price",
  "sql": "SELECT name, price FROM products ORDER BY price DESC LIMIT 5",
  "explanation": "Selects product names and prices, ordered from most to least expensive, returning the top 5."
}
```

---

### Execute SQL Safely
```http
POST /api/query/execute
```
Validates and executes a SQL query. Blocks all non-SELECT operations.

**Request:**
```json
{
  "sql": "SELECT name, price FROM products ORDER BY price DESC LIMIT 5"
}
```

**Response:**
```json
{
  "success": true,
  "columns": ["name", "price"],
  "rows": [{ "name": "Product A", "price": 299.99 }],
  "row_count": 5,
  "truncated": false
}
```

---

### Full Natural Language Pipeline
```http
POST /api/query
```
End-to-end orchestration: generates SQL → validates → executes → self-corrects on failure.

**Request:**
```json
{
  "question": "Show total revenue by category"
}
```

**Response:**
```json
{
  "success": true,
  "question": "Show total revenue by category",
  "sql": "SELECT c.name, SUM(p.amount) AS total_revenue FROM payments p ...",
  "explanation": "Joins payments with orders and categories to sum revenue per category.",
  "columns": ["name", "total_revenue"],
  "rows": [...],
  "row_count": 6,
  "truncated": false,
  "status": ["Generating SQL", "Executing query"]
}
```

**Error Response:**
```json
{
  "success": false,
  "error_type": "llm_error",
  "message": "Descriptive error message."
}
```

---

## 🛡️ Security

### Read-Only Enforcement
Every SQL query — whether generated by AI or submitted directly — is validated before execution. The following operations are **always blocked**:

```sql
INSERT  UPDATE  DELETE  DROP  ALTER  CREATE  PRAGMA  VACUUM
```

### Multi-Layer Validation
1. **Empty query check** — blank SQL is rejected immediately
2. **Unsafe keyword scan** — blocks all write operations via regex
3. **Multi-statement prevention** — single queries only; no statement chaining
4. **Row limit cap** — results are truncated at 500 rows to prevent abuse

### Environment Variable Protection
All secrets (API keys, database URLs) are loaded exclusively from environment variables. **No credentials are ever hardcoded.** The `.env` file is listed in `.gitignore` and never committed.

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |
| Google Gemini API Key | [Get one free →](https://aistudio.google.com/app/apikey) |

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/querylens-ai.git
cd querylens-ai
```

---

### 2. Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key | ✅ Yes |
| `DATABASE_URL` | SQLAlchemy DB URL | Defaults to SQLite |
| `BACKEND_HOST` | Server bind host | `0.0.0.0` |
| `BACKEND_PORT` | Server port | `8000` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173` |
| `ENVIRONMENT` | `development` or `production` | `development` |

---

### 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **API:** http://localhost:8000
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

### 4. Database Setup

```bash
# From the project root
python database/seed.py
```

Seeds the SQLite database with sample e-commerce data:
`categories` · `customers` · `products` · `orders` · `order_items` · `payments`

---

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

- **App:** http://localhost:5173

---

### 6. Run Tests

```bash
cd backend
python -m pytest tests/ -v
```

**Test coverage includes:**
- SQL validation (safe & unsafe queries)
- Query execution (columns, rows, truncation)
- API endpoint responses
- Self-correction pipeline
- Retry limit enforcement
- Error handling

---

## 💬 Example Queries

Try these natural language questions in the dashboard:

```
Show top 5 products by price
```
```
Show total revenue by category
```
```
Show average product price
```
```
List top customers by spending
```
```
Show order count by category
```
```
How many orders were placed in total?
```
```
Which category has the most products?
```

---

## 🏆 Hackathon

<div align="center">

| | |
|---|---|
| **Event** | iTech AI Innovation Hackathon 2026 |
| **Institution** | Sri Sairam Engineering College |
| **Team** | SwiftTech |

</div>

---

## 👥 Team — SwiftTech

| Name | Role |
|---|---|
| *(Team Member 1)* | *(Role)* |
| *(Team Member 2)* | *(Role)* |
| *(Team Member 3)* | *(Role)* |
| *(Team Member 4)* | *(Role)* |

---

## 🔮 Future Enhancements

| Enhancement | Description |
|---|---|
| **Multi-database Support** | Connect to PostgreSQL, MySQL, and other databases beyond SQLite |
| **Chat History** | Persistent conversation history so users can follow up on previous queries |
| **Query Export** | Download results as CSV, Excel, or PDF reports |
| **Custom Dashboards** | Save and pin favorite queries to a personalized dashboard |
| **Voice Input** | Ask questions via speech-to-text for a truly hands-free experience |
| **Multi-tenant Auth** | User authentication and per-user database isolation |
| **Streaming Responses** | Stream AI responses token-by-token for a faster perceived experience |
| **Query Suggestions** | AI-powered autocomplete that suggests relevant follow-up questions |
| **Scheduled Reports** | Automatically run queries on a schedule and email the results |

---

## 🌐 Vision

> *"Data is the new oil — but only if you can refine it."*

QueryLens AI exists to make **database intelligence universally accessible**. In a world where critical decisions depend on data, the ability to extract insight should never be gated behind SQL expertise. By combining the natural conversational intelligence of Google Gemini with a safe, transparent, and production-ready data pipeline, QueryLens AI transforms every database into a collaborative partner — one that answers questions in plain English, explains its reasoning, and visualizes the truth.

**Our vision:** a future where anyone — analyst, executive, student, or entrepreneur — can sit down with their data and simply *have a conversation.*

---

<div align="center">

Built with ❤️ by **Team SwiftTech** · Sri Sairam Engineering College · iTech AI Innovation Hackathon 2026

</div>
