# Trading Journal

A full-stack trading journal for recording trades, managing trading accounts, analysing performance and visualising results over time.

Built with **Next.js, React, TypeScript, FastAPI, Supabase and PostgreSQL**, with authentication, automated testing, responsive design and deployed frontend/backend services.

## Live Demo

A deployed demo version is available so the application can be explored without creating an account.

**[Try the live demo](https://trading-journal-puce-one.vercel.app)**

From the login page, select **Try demo** to enter a pre-populated trading account containing sample trades across multiple instruments.

The demo uses a shared authenticated Supabase account. Its data is automatically restored after periods of inactivity so visitors can freely create, edit and delete demo data without permanently changing the initial dataset.

---

## Why I Built This

Tracking trades manually often makes it difficult to see the bigger picture — what is actually working, what is not, and how performance changes over time.

The project started as a simple Python CLI built around that need: log trades, calculate R-multiples and review aggregate statistics.

As the requirements grew — multiple accounts, real P/L tracking alongside R and performance visualisation — the project evolved into the full-stack application it is today.

---

## Overview

The application is designed to make trading data easier to record, organise and analyse by storing each trade together with its risk, result, P/L and execution dates.

Authenticated users can:

- create and manage multiple trading accounts
- record trades
- edit and delete existing trades
- calculate trade results in R
- track profit and loss
- view aggregate trading statistics
- visualise performance over time
- keep data isolated between users
- access the application from desktop and mobile devices

The current application is the result of several iterations, gradually introducing persistence, APIs, authentication, responsive interfaces, automated testing and stronger data protection.

---

# Main Features

- User authentication with Supabase Auth
- Protected FastAPI endpoints
- Multiple trading accounts
- Account CRUD operations
- Trade CRUD operations
- Long and short trades
- Automatic R-multiple calculation
- P/L tracking
- Entry and exit timestamps
- Trade date validation
- Trading statistics
- Performance chart
- Responsive mobile and desktop interface
- User-scoped database queries
- PostgreSQL Row Level Security
- Frontend and backend validation
- Controlled database error responses
- Public demo mode
- Automatic demo-data restoration
- Automated frontend and backend testing
- Integration tests against Supabase
- GitHub Actions CI workflows

---

# Tech Stack

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Recharts
- Supabase JavaScript client

## Backend

- Python 3.11+
- FastAPI
- Pydantic
- Supabase Python client
- PostgreSQL
- python-dotenv

## Testing

- Pytest
- pytest-cov
- FastAPI `TestClient`
- Vitest
- React Testing Library
- jsdom
- V8 coverage

## Infrastructure and Development

- Git
- GitHub
- GitHub Actions
- Vercel
- Supabase
- ESLint
- npm

---

# Architecture

```text
┌──────────────────────────────┐
│        Next.js frontend      │
│                              │
│ React · TypeScript · Charts  │
└──────────────┬───────────────┘
               │
               │ HTTP + Bearer token
               ▼
┌──────────────────────────────┐
│        FastAPI backend       │
│                              │
│ Auth · Validation · API      │
│ R calculation · DB layer     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│           Supabase           │
│                              │
│ Auth · PostgreSQL · RLS      │
└──────────────────────────────┘
```

The frontend communicates with the FastAPI backend for application data.

Authenticated requests contain the user's Supabase access token. The backend verifies the token and scopes database operations to the authenticated user.

Supabase Row Level Security provides an additional database-level protection layer.

---

# Demo System

The application includes a public demo mode designed to make the project easy to evaluate without requiring registration.

The login page exposes a **Try demo** action.

The frontend requests a demo session from the FastAPI backend, while the demo account credentials remain server-side and are never exposed through `NEXT_PUBLIC_*` environment variables.

```text
Visitor
   ↓
Try demo
   ↓
Next.js frontend
   ↓
POST /demo-login
   ↓
FastAPI backend
   ↓
Supabase Auth
   ↓
Demo session
```

The demo account starts with a pre-populated trading account and sample trades covering:

- XAUUSD
- EURUSD
- GBPUSD
- NAS100
- long and short positions
- winning trades
- losing trades
- breakeven trades

## Demo activity tracking

Protected API requests made by the demo user update a `demo_state` record containing the latest activity timestamp.

This prevents the shared dataset from being reset while the demo has recently been in use.

## Automatic reset

A GitHub Actions workflow periodically runs `demo.py`.

The script:

1. authenticates as the demo user
2. reads the latest demo activity
3. checks whether the account has been inactive for at least 30 minutes
4. skips the reset if the demo was recently active
5. otherwise removes modified demo trades and accounts
6. recreates the original demo account
7. recreates the sample trade dataset

This allows visitors to modify the demo freely while keeping the environment reusable for future visitors.

---

# Validation

Validation happens at multiple layers.

## Frontend

The UI prevents incomplete forms from being submitted and provides feedback before requests are sent.

## Backend

FastAPI and Pydantic validate incoming request data independently from the frontend.

Examples include:

- required entry and exit dates
- exit date cannot be before entry date
- valid trade direction
- non-empty trade symbol
- required account name
- required currency
- required starting balance

The backend therefore does not rely on the frontend to provide valid data.

---

# Authentication and Data Isolation

Authentication is handled by Supabase Auth.

The frontend sends the current user's bearer token with protected API requests.

The backend verifies that token and obtains the authenticated user's identity before accessing account or trade data.

Database operations are scoped by user ID.

The project also includes Supabase integration tests that verify Row Level Security between separate test users, including attempts to access or modify another user's data.

This provides protection at both the application and database layers.

---

# Performance Analytics

Trade performance can be evaluated using both P/L and R-multiple.

For a long trade:

```text
R = (exit - entry) / (entry - stop)
```

For a short trade:

```text
R = (entry - exit) / (stop - entry)
```

Using R makes trades with different monetary values and position sizes comparable using the amount originally risked.

The application also provides aggregate statistics and a chronological performance chart.

---

# Database Error Handling

Database queries pass through a centralised execution helper.

```text
Supabase query
      ↓
execute_query()
      ↓
DatabaseError
      ↓
FastAPI exception handler
      ↓
503 Service Unavailable
```

This avoids duplicating database exception handling throughout the application and provides controlled API responses when the database dependency is unavailable.

---

# Automated Testing

Testing became a major part of the full-stack refactor.

## Backend

Backend tests cover:

- bearer-token handling
- authentication
- demo authentication
- demo activity tracking
- API endpoints
- account CRUD
- trade CRUD
- request validation
- R calculations
- database transformations
- database error handling
- demo dataset generation
- demo reset behaviour

External dependencies are mocked for unit tests where appropriate.

## Integration tests

Separate integration tests communicate with Supabase and cover:

- real database connectivity
- Row Level Security
- cross-user data isolation

## Frontend

Frontend tests cover:

- authentication flows
- demo login
- page behaviour
- forms
- user interactions
- API requests
- account management
- trade management
- statistics
- chart behaviour
- responsive components
- reusable UI components

During development, the frontend and backend unit-test suites reached **100% code coverage**.

Coverage is used as a development signal rather than as a replacement for meaningful behavioural and integration tests.

---

# Continuous Integration

GitHub Actions automatically checks the application on pushes and pull requests.

## Backend workflow

The backend workflow:

- installs Python dependencies
- runs the backend test suite
- collects coverage
- runs Supabase integration and RLS tests when the required secrets are available

## Frontend workflow

The frontend workflow:

- installs dependencies with `npm ci`
- runs ESLint
- runs the Vitest test suite with coverage
- creates a production Next.js build

## Demo reset workflow

A separate scheduled workflow runs the demo reset script periodically and restores the shared demo dataset when it has been inactive.

---

# Repository Structure

```text
trading-journal/
│
├── api.py
│   FastAPI application and API endpoints
│
├── auth.py
│   Authentication and demo activity helpers
│
├── calculations.py
│   Trading calculations
│
├── database.py
│   Supabase database access layer
│
├── demo.py
│   Demo dataset generation and reset logic
│
├── tests/
│   Backend unit tests
│   │
│   └── integration/
│       Supabase and RLS integration tests
│
├── frontend/
│   Next.js web application
│   │
│   ├── app/
│   │   Pages and page tests
│   │
│   ├── components/
│   │   Reusable UI components and tests
│   │
│   ├── lib/
│   │   API and Supabase configuration
│   │
│   └── ...
│
├── .github/
│   └── workflows/
│       ├── backend-tests.yml
│       ├── frontend-tests.yml
│       └── demo-reset.yml
│
├── legacy-cli/
│   Original command-line implementation
│
├── requirements.txt
├── pyproject.toml
├── .env.example
└── README.md
```

---

# Running the Project Locally

## Clone the repository

```bash
git clone https://github.com/laurabaraldi98-lgtm/trading-journal.git
cd trading-journal
```

---

## Backend

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_or_publishable_key

CORS_ORIGINS=http://localhost:3000

DEMO_EMAIL=
DEMO_PASSWORD=
```

`DEMO_EMAIL` and `DEMO_PASSWORD` are only required when running the public demo functionality.

Demo credentials must remain server-side and must never be exposed through frontend environment variables.

Start the FastAPI development server:

```bash
uvicorn api:app --reload
```

The backend normally runs on:

```text
http://127.0.0.1:8000
```

---

## Frontend

Move into the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

The application normally runs on:

```text
http://localhost:3000
```

---

# Running the Tests

## Backend tests

From the project root:

```bash
python -m pytest tests
```

With coverage:

```bash
python -m pytest tests \
  --cov=api \
  --cov=auth \
  --cov=database \
  --cov=calculations \
  --cov=demo \
  --cov-branch \
  --cov-report=term-missing
```

## Integration tests

Supabase integration tests require the relevant test-user credentials to be configured in the environment.

They are located in:

```text
tests/integration/
```

---

## Frontend

From `frontend/`:

```bash
npm test -- --run
```

With coverage:

```bash
npm test -- --run --coverage
```

Run linting:

```bash
npm run lint
```

Run the production build:

```bash
npm run build
```

---

# Deployment

The application is deployed using separate frontend and backend Vercel projects.

```text
Vercel
├── Next.js frontend
└── FastAPI backend

Supabase
├── Authentication
└── PostgreSQL
```

Production configuration is stored in environment variables rather than hardcoded into the application.

Sensitive values such as demo credentials are stored only in server-side deployment and GitHub Actions secrets.

---

# Project Evolution

One of the main goals of the project became understanding how a small program evolves into a complete web application.

```text
Python CLI
    ↓
Local file persistence
    ↓
Supabase database
    ↓
FastAPI backend
    ↓
Next.js frontend
    ↓
Authentication
    ↓
Multiple trading accounts
    ↓
Charts and statistics
    ↓
Validation
    ↓
Automated testing
    ↓
RLS integration testing
    ↓
Deployment
    ↓
Public demo system
```

## 1. Python CLI

The first version was a command-line application written entirely in Python.

It handled the core trading logic:

- adding trades
- viewing trades
- editing trades
- deleting trades
- calculating R-multiple
- calculating aggregate statistics
- validating user input

At this stage, trades were stored locally.

The initial goal was to make the domain logic work correctly before introducing a web architecture.

---

## 2. Moving persistence to Supabase

The next step replaced local storage with a real database.

This introduced:

- remote persistence
- CRUD operations
- generated IDs
- environment-based credentials
- database records and relationships

This was the first major architectural change in the project.

---

## 3. Separating the backend with FastAPI

As the project grew, database operations and application logic were separated from the user interface.

A FastAPI backend was introduced to expose HTTP endpoints for accounts and trades.

```text
Browser
   ↓
Next.js
   ↓ HTTP
FastAPI
   ↓
Supabase
```

The backend became responsible for:

- authentication
- validation
- trading calculations
- database operations
- controlled error handling
- HTTP responses

---

## 4. Building the web frontend

The command-line interface was replaced by a web interface built with Next.js, React and TypeScript.

The frontend introduced:

- reusable React components
- application state
- controlled forms
- asynchronous requests
- authentication state
- responsive layouts
- charts
- loading states
- error states

---

## 5. Authentication and multi-user data

Supabase Auth transformed the project from a single-user journal into a multi-user application.

Authenticated API requests contain bearer tokens verified by the backend.

Accounts and trades are associated with their owners, while Row Level Security provides database-level isolation.

---

## 6. Multiple trading accounts

The original journal treated all trades as a single dataset.

The web application introduced separate trading accounts containing information such as:

- account name
- starting balance
- currency
- broker
- account type

Trades belong to individual accounts, allowing performance to be analysed separately.

---

## 7. Analytics and visualisation

The application moved beyond storing trades and began analysing them.

Statistics and performance charts were added to make trading behaviour easier to evaluate over time.

---

## 8. Stronger validation and error handling

Validation was progressively added to both the frontend and backend.

Database calls were also centralised so dependency failures could be converted into predictable API responses.

---

## 9. Automated testing

Testing expanded alongside the application.

Unit tests, component tests, API tests and integration tests now protect behaviour across the frontend, backend and database security layers.

---

## 10. Deployment and public demo

The frontend and backend were deployed separately on Vercel.

A public demo flow was then added so the application could be evaluated without creating an account.

The demo includes:

- server-side demo authentication
- seeded trading data
- activity tracking
- automatic restoration
- scheduled GitHub Actions maintenance
- dedicated automated tests

---

# Legacy CLI

The `legacy-cli/` directory contains the original command-line implementation.

It is intentionally kept as a historical record of the project's evolution and is no longer the actively maintained application.

Keeping the original implementation makes it possible to compare the initial procedural Python version with the current authenticated, tested and deployed full-stack architecture.

---

# What I Learned

This project began while I was learning programming fundamentals, but its scope changed significantly as development continued.

Building the different versions provided practical experience across the complete application lifecycle.

## Software design

The project demonstrated how code that works well in a small script can become difficult to maintain as requirements grow.

The application gradually separated responsibilities into:

- user interface
- API
- authentication
- validation
- business logic
- persistence
- testing
- deployment

## Backend development

The FastAPI backend provided practical experience with:

- REST APIs
- HTTP requests and responses
- dependency injection
- bearer-token authentication
- Pydantic models
- server-side validation
- exception handling
- database access
- environment-based configuration

## Frontend development

Building the Next.js application involved:

- React components
- props
- state
- event handlers
- controlled forms
- asynchronous requests
- conditional rendering
- TypeScript
- responsive layouts
- charts and data visualisation

## Databases and security

Moving from local files to Supabase introduced:

- persistent storage
- relational data
- user-owned records
- CRUD operations
- authentication
- Row Level Security
- cross-user isolation testing

## Testing and debugging

Testing became increasingly important as the system grew.

The project provided practical experience with:

- reproducing bugs with tests
- mocking external dependencies
- API testing
- React interaction testing
- parameterised tests
- integration testing
- code coverage
- regression prevention

A large part of development involved debugging interactions between the frontend, backend, authentication layer and database rather than treating each layer independently.

## Full-stack development

The most important outcome was understanding how the different layers of a web application communicate.

```text
User action
    ↓
React state
    ↓
HTTP request
    ↓
FastAPI endpoint
    ↓
Authentication + validation
    ↓
Database query
    ↓
API response
    ↓
Frontend update
```

---

# Current Status

The original CLI has been superseded by the full-stack web application.

The current version includes the main functionality required for a usable trading journal:

- authentication
- account management
- trade management
- performance statistics
- charts
- responsive layouts
- data validation
- database persistence
- Row Level Security
- automated testing
- database error handling
- deployed frontend and backend
- public demo access
- automatic demo-data restoration

The project can continue to evolve, but the current version represents a complete end-to-end full-stack implementation.

---

# Possible Future Improvements

Potential future iterations include:

- more advanced trading analytics
- date-range analysis
- additional filters
- richer account statistics
- improved dashboard visualisations
- CSV import/export
- production observability and structured logging
- additional end-to-end testing
- performance improvements for larger datasets