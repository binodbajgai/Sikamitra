# Sikamitra

Sikamitra is an AI-assisted study and mock-test platform for students who want
to study from their own material. Upload notes or documents, generate practice
content, build a mock test, take it, and review the result in one workflow.

## Project overview

The core study flow is:

```text
Upload study material
        ↓
Extract text from the material
        ↓
Generate summaries, important points, and questions with AI
        ↓
Create a mock test from the generated question bank
        ↓
Take the test and submit answers
        ↓
Review scores, answers, and attempt history
```

The project is intended for students preparing for exams from their own
textbooks, notes, presentations, PDFs, and images.

## Key features

- User registration, password login, profile management, and client-side logout.
- Google OAuth sign-in with browser-session state binding.
- Subject and study-material organization.
- Study-material uploads for PDF, DOCX, PPTX, TXT, PNG, JPG, and JPEG files.
- Text extraction from documents and OCR processing for supported images.
- AI-generated summaries, important points, and multiple-choice questions.
- Question regeneration for summaries, important points, and question banks.
- Mock-test creation from a material or an entire subject.
- Mock-test attempts with answer submission, scoring, review, and attempt history.
- Dashboard statistics for materials, summaries, questions, and mock tests.
- Password reset by email verification code when SMTP is configured.
- Redis-backed distributed rate limiting for authentication and AI endpoints.
- Redis-backed per-user daily quota controls for AI generation.
- Alembic migrations for reproducible database schema changes.
- Responsive React interface with dashboard, materials, subjects, mock tests,
  progress, profile, settings, and authentication pages.

## Architecture

### Backend

The backend is a FastAPI application organized around a layered request flow:

```text
HTTP request
    ↓
FastAPI router and dependency checks
    ↓
Service layer for application/business logic
    ↓
Repository layer for data access
    ↓
SQLAlchemy models and sessions
    ↓
Configured relational database
```

SQLAlchemy is used as the ORM. The dependency set includes both the PyMySQL
and psycopg2-binary drivers, so the database dialect is selected through
`DATABASE_URL` rather than hardcoded in the application. The intended
architecture supports MySQL deployments and PostgreSQL-compatible deployments.

Redis is used for shared rate-limit counters and per-user AI usage quotas so
those controls work across serverless instances. Alembic tracks and applies
database migrations.

### Frontend

The frontend is a React application written in TypeScript and built with Vite.
It communicates with the FastAPI backend through the API client in
`frontend/src/api`.

## Security

Security-related safeguards currently include:

- Argon2 password hashing.
- Hashed password-reset verification tokens.
- OAuth state binding to the initiating browser session.
- Redis-backed rate limiting on sensitive authentication and AI routes.
- Explicit AI provider request timeouts.
- Security response headers, including CSP, HSTS for HTTPS responses,
  `X-Content-Type-Options`, `X-Frame-Options`, and referrer policy.
- Server-side ownership checks on authenticated user resources.
- Server-side upload type and size validation.

## Tech stack

| Area | Technologies |
| --- | --- |
| Backend language | Python |
| API framework | FastAPI, Uvicorn |
| Validation and configuration | Pydantic, pydantic-settings |
| Database access | SQLAlchemy, PyMySQL, psycopg2-binary |
| Database migrations | Alembic |
| Authentication | PyJWT, Argon2 via argon2-cffi, Authlib |
| AI integration | OpenAI Python client with the NVIDIA API |
| Shared controls | Redis |
| Document processing | pypdf, python-docx, python-pptx |
| Image processing and OCR | Pillow, pytesseract |
| Frontend | React, React DOM, React Router |
| Frontend language and tooling | TypeScript, Vite, ESLint |
| Frontend HTTP and icons | Axios, lucide-react |

## Getting started

### Prerequisites

- Python 3.14 or a compatible recent Python version.
- Node.js and npm.
- A configured relational database.
- Redis for distributed rate limiting and AI quotas.
- SMTP credentials if password reset is required locally.
- Tesseract OCR if image uploads with OCR are required.

### Clone and install

```powershell
git clone <repository-url>
cd Sikamitra

python -m venv backend\venv
backend\venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt

npm --prefix frontend install
```

### Configure the environment

Create `backend/.env` and provide the values for the following variable names.
Do not commit this file or its secrets:

```text
APP_NAME
APP_VERSION
ENVIRONMENT
DATABASE_URL
SECRET_KEY
ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES
AI_PROVIDER
NVIDIA_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
FRONTEND_URL
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
SMTP_FROM_EMAIL
REDIS_URL
AI_DAILY_QUOTA
TESSERACT_PATH
```

Google OAuth, SMTP, NVIDIA, Redis, and Tesseract-related variables are only
needed for the corresponding features. `DATABASE_URL`, `SECRET_KEY`, and the
core application settings are required for the backend to start.

### Run database migrations

From the repository root:

```powershell
cd backend
.\venv\Scripts\python.exe -m alembic upgrade head
```

If the virtual environment is already activated, this is equivalent to:

```powershell
python -m alembic upgrade head
```

### Start the backend

From `backend`:

```powershell
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

The API is available at `http://127.0.0.1:8000`.

### Start the frontend

In a second terminal from the repository root:

```powershell
npm --prefix frontend run dev
```

Vite serves the frontend at its displayed local development URL, normally
`http://127.0.0.1:5173`.

### Run the backend smoke tests

```powershell
cd backend
.\venv\Scripts\python.exe -m unittest discover -s tests -v
```

## Project structure

```text
.
├── backend/
│   ├── app/
│   │   ├── ai/             AI provider integrations
│   │   ├── api/            FastAPI routers and dependencies
│   │   ├── core/           Configuration, database, security, Redis
│   │   ├── models/         SQLAlchemy models
│   │   ├── repositories/   Database access functions
│   │   ├── schemas/        Pydantic request and response schemas
│   │   ├── services/       Application and business logic
│   │   └── utils/          Document parsing and supporting utilities
│   ├── alembic/            Migration configuration and revisions
│   ├── tests/              Backend smoke tests
│   ├── requirements.txt    Python dependencies
│   └── vercel.json         Backend Vercel function configuration
├── frontend/
│   ├── src/
│   │   ├── api/            Backend API clients
│   │   ├── components/     Shared UI components
│   │   ├── context/        React application context
│   │   ├── layouts/        Authenticated and public layouts
│   │   └── pages/          Application screens
│   ├── public/              Static frontend assets
│   └── package.json         Frontend scripts and dependencies
├── docs/                    Product, architecture, API, and UI notes
├── DEPLOYMENT.md            Deployment and database backup guidance
└── vercel.json              Frontend deployment configuration
```

## Screenshots or demo

<img width="1105" height="961" alt="image" src="https://github.com/user-attachments/assets/57182620-f3c8-4362-8bda-4587c091bf30" />

