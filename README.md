# Trading Journal

A full-stack trading journal for recording trades, managing trading accounts, analysing performance and visualising results over time.

The project began as a small Python command-line application and progressively evolved into a multi-user web application with a Next.js frontend, FastAPI backend, Supabase authentication and database persistence, automated testing and validation across the stack.

---

## Overview

Trading performance is difficult to evaluate by looking at isolated wins and losses.

This project was created to make trading data easier to record and analyse by storing each trade together with its risk, result, P/L and execution dates.

The application currently allows authenticated users to:

- create and manage trading accounts
- record trades
- edit and delete existing trades
- calculate trade results in R
- track P/L and trading statistics
- visualise performance over time
- keep each user's data separated
- validate trade and account data before saving it

The current application is the result of several iterations, starting from a local Python script and gradually introducing persistence, APIs, authentication, a frontend, testing and stronger error handling.

---

# Project Evolution

One of the main goals of this project became learning how a small script evolves into a real full-stack application.

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
Authentication and user accounts
    ↓
Multiple trading accounts
    ↓
Charts and statistics
    ↓
Validation and automated testing
    ↓
Centralised database error handling
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

The goal was not yet to build a web application, but to first make the domain logic work correctly.

---

## 2. Moving persistence to Supabase

The next step was replacing local storage with a real database.

Supabase was introduced so that trades could persist outside the local machine.

This required learning how to:

- connect Python to a remote database
- create, read, update and delete records
- work with database-generated IDs
- keep credentials outside the codebase using environment variables
- convert application data into database records and back again

This was the first major architectural change in the project.

---

## 3. Separating the backend with FastAPI

As the project grew, database operations and application logic were separated from the user interface.

A FastAPI backend was introduced to expose HTTP endpoints for accounts and trades.

The application now follows a structure closer to:

```text
Browser
   ↓
Next.js frontend
   ↓ HTTP
FastAPI API
   ↓
Supabase / PostgreSQL
```

The backend is responsible for:

- authenticating API requests
- validating incoming data
- calculating R-multiple
- loading user data
- creating trades and accounts
- updating records
- deleting records
- communicating with Supabase
- returning controlled API responses

This refactor turned the original Python application into an API-driven architecture.

---

## 4. Building the web frontend

The command-line interface was eventually replaced by a web interface built with Next.js, React and TypeScript.

The frontend introduced:

- reusable React components
- application state
- forms
- asynchronous API requests
- authentication state
- responsive layouts
- account selection
- trade management
- statistics cards
- performance charts
- client-side validation
- loading and error states

The frontend communicates with the FastAPI backend rather than accessing trading data directly.

---

## 5. Authentication and user-owned data

Authentication was added using Supabase Auth.

Authenticated frontend requests include the user's session token, which the backend verifies before accessing protected endpoints.

Database queries are scoped to the authenticated user so that accounts and trades belong to their owner rather than being globally accessible.

This changed the application from a single-user journal into the foundation of a multi-user product.

---

## 6. Multiple trading accounts

The original journal treated all trades as part of the same dataset.

The web application introduced trading accounts.

Each account can contain information such as:

- account name
- starting balance
- currency
- broker
- account type

Trades belong to a specific account, allowing performance to be analysed independently across different trading accounts.

---

## 7. Performance analytics

The project gradually moved beyond storing trades and began analysing them.

Current analytics include trading statistics and an equity/performance chart.

Trade performance can be evaluated using both P/L and R-multiple.

For a long trade:

```text
R = (exit - entry) / (entry - stop)
```

For a short trade:

```text
R = (entry - exit) / (stop - entry)
```

Using R makes trades with different position sizes and monetary values comparable using the amount originally risked.

---

## 8. Validation across the stack

As the application became more complex, data validation became increasingly important.

Validation now happens at multiple levels.

The frontend prevents incomplete forms from being submitted.

The FastAPI backend validates incoming requests using Pydantic models.

Examples include:

- required trade dates
- exit date cannot be before entry date
- valid trade direction
- non-empty trade symbol
- required account name
- required currency
- required account balance data

The backend does not rely exclusively on the frontend to provide valid data.

---

## 9. Automated testing

Testing became a major part of the project during the full-stack refactor.

### Backend

The backend uses:

- Pytest
- FastAPI `TestClient`
- mocks for database dependencies
- parameterised tests

Tests cover areas such as:

- authentication
- API requests
- account CRUD
- trade CRUD
- validation
- R calculations
- database transformations
- database error handling

### Frontend

The frontend uses:

- Vitest
- React Testing Library
- jsdom
- V8 coverage

Tests cover:

- page behaviour
- forms
- user interactions
- authentication state
- API requests
- account management
- trade management
- statistics
- chart behaviour
- reusable components

During development, the current full-stack test suites reached **100% code coverage**.

Coverage is used as a development signal rather than as a replacement for meaningful behavioural tests.

---

## 10. Database error handling

Database calls originally executed Supabase queries directly.

If Supabase failed, those exceptions could propagate through the application as generic server errors.

The database layer was later refactored to centralise query execution.

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

This avoids repeating the same `try/except` logic around every database operation and gives the API a controlled response when its database dependency fails.

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

- Python
- FastAPI
- Pydantic
- Supabase Python client
- PostgreSQL
- python-dotenv

## Testing

- Pytest
- FastAPI TestClient
- Vitest
- React Testing Library
- jsdom
- V8 coverage

## Development

- Git
- GitHub
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
│ Authentication · PostgreSQL  │
└──────────────────────────────┘
```

---

# Main Features

- User authentication
- Protected API endpoints
- Multiple trading accounts
- Create, read, update and delete accounts
- Create, read, update and delete trades
- Long and short trades
- Automatic R-multiple calculation
- P/L tracking
- Entry and exit timestamps
- Trade date validation
- Performance chart
- Trading statistics
- Responsive web interface
- User-scoped database queries
- Frontend and backend validation
- Controlled database error responses
- Automated frontend and backend test suites

---

# Repository Structure

```text
trading-journal/
│
├── api.py
│   FastAPI application and API endpoints
│
├── auth.py
│   Authentication helpers
│
├── calculations.py
│   Trading calculations
│
├── database.py
│   Supabase database access layer
│
├── tests/
│   Backend test suite
│
├── frontend/
│   Next.js web application
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── ...
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

# Legacy CLI

The `legacy-cli/` directory contains the original command-line version of the Trading Journal.

It is retained as a historical record of the project's evolution and is no longer the actively maintained version of the application.

Keeping it in the repository makes it possible to see how the project changed from a small procedural Python program into the current full-stack architecture.

---

# Running the Project Locally

## Clone the repository

```bash
git clone https://github.com/laurabaraldi98-lgtm/trading-journal.git
cd trading-journal
```

## Backend

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_key
```

The backend also supports configuring allowed frontend origins through:

```env
CORS_ORIGINS=http://localhost:3000
```

Start the FastAPI development server:

```bash
uvicorn api:app --reload
```

The backend will normally run on:

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

The application will normally be available at:

```text
http://localhost:3000
```

---

# Running the Tests

## Backend

From the project root:

```bash
python -m pytest tests
```

With coverage:

```bash
python -m pytest tests --cov=. --cov-report=term-missing
```

## Frontend

From `frontend/`:

```bash
npm test -- --run
```

Run the production build:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

---

# What I Learned

This project started while I was learning the fundamentals of programming, but its scope changed significantly as I continued developing it.

Building the different versions gave me practical experience with more than just individual languages or frameworks.

## Software design

I learned how code that works well in a small script can become difficult to maintain as the application grows, and why responsibilities eventually need to be separated.

The project moved from one local program to distinct layers for:

- user interface
- API
- authentication
- validation
- business logic
- database access

That evolution made architectural concepts much easier to understand than studying them only in isolation.

## Backend development

Through the FastAPI backend I practised:

- designing REST endpoints
- handling HTTP requests and responses
- dependency injection with FastAPI
- authentication
- bearer tokens
- Pydantic models
- server-side validation
- exception handling
- database access
- environment-based configuration
- separating API and persistence logic

## Frontend development

Building the Next.js application taught me how to work with:

- React components
- props
- state
- event handlers
- controlled forms
- asynchronous requests
- conditional rendering
- authentication state
- reusable UI components
- TypeScript
- responsive layouts
- charts and data visualisation

## Databases

Moving from local files to Supabase helped me understand:

- persistent storage
- database tables
- IDs and relationships
- CRUD operations
- user-owned records
- querying and filtering data
- the difference between application logic and persistence logic

## Testing and debugging

Testing became increasingly important as the project grew.

I learned how to:

- reproduce bugs with tests
- mock external dependencies
- test API behaviour
- test React user interactions
- use parameterised tests to reduce duplication
- distinguish between coverage and meaningful behaviour
- use failures to locate regressions
- refactor while keeping existing behaviour protected

A large part of the development process involved debugging interactions between the frontend, backend, authentication layer and database rather than working on each part independently.

## Full-stack development

The most important lesson from the project was understanding how the different layers of a web application communicate.

```text
User action
    ↓
React state
    ↓
HTTP request
    ↓
FastAPI endpoint
    ↓
authentication + validation
    ↓
database query
    ↓
API response
    ↓
frontend update
```

Building that complete flow made concepts such as APIs, authentication, persistence and frontend/backend separation much more concrete.

---

# Current Status

The original CLI has been superseded by the full-stack web application.

The current version includes the main functionality required for a usable trading journal:

- authentication
- account management
- trade management
- performance statistics
- charts
- data validation
- database persistence
- automated testing
- database error handling

The project is still designed to evolve further rather than being treated as finished software.

---

# Deployment

The application is deployed on Vercel as separate frontend and backend services.

- The Next.js frontend is deployed on Vercel.
- The FastAPI backend is deployed on Vercel as a separate service.
- Supabase provides authentication and PostgreSQL persistence.
- Production configuration is managed through environment variables rather than hardcoded values.


---

# Possible Future Improvements

Potential future iterations include:

- more advanced trading analytics
- additional filters
- richer account statistics
- date-range analysis
- improved dashboard visualisations
- CSV import/export
- stronger production observability and logging
- additional integration and end-to-end testing
- performance improvements as the dataset grows

---

## Why this repository includes the old version

The CLI was intentionally kept rather than deleted.

The goal of this repository is not only to show the final application, but also the engineering progression behind it.

The difference between `legacy-cli/` and the current application documents the transition from learning basic Python programming to designing, testing and debugging a full-stack system.