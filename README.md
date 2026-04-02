# The Job Pit

A full-stack job application tracker for logging opportunities, monitoring status changes,
managing deadlines/follow-ups, and visualizing your pipeline.

## Creators

- Lideon
- Vicknesh
- Aaron

## Why this project

This app is both practical for your own search and a strong portfolio piece because it combines:

- CRUD data modeling
- API design and validation
- authentication and multi-tenant data scoping
- reminder/deadline workflows
- dashboard analytics with charts
- clean full-stack architecture

## Tech Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Prisma ORM + PostgreSQL
- Tailwind CSS
- Auth.js / NextAuth v5 (credentials) + bcryptjs
- Recharts (data visualization)
- Zod (input validation)

## App routes

| Path | Notes |
|------|--------|
| `/` | Public landing; signed-in users also see a live **snapshot** (metrics + pipeline chart) |
| `/dashboard` | Full dashboard (metrics, chart, quick links) — **requires sign-in** |
| `/applications`, `/lab`, `/interview`, `/companies` | Feature areas — **require sign-in** |
| `/login`, `/signup` | Credentials; signed-in users are redirected away |
| `/privacy`, `/terms` | Legal |

Middleware sends unauthenticated visitors to `/login?callbackUrl=…` when they hit protected paths.

## Current scope

- **Auth:** register (`POST /api/register`), session via NextAuth; data is scoped by `userId`.
- **Applications** — CRUD via `/api/applications` and `/api/applications/:id` (session required).
- **Related APIs:** application documents (incl. upload), star stories, interview questions, mock interviews, companies, company contacts (all session-scoped where applicable).
- **Workspace pages** (same black/red theme): resume lab, interview prep, company intel (see routes above).
- **Legal pages:** `/privacy`, `/terms`

After pulling schema changes, run `npx prisma db push` and `npx prisma generate` (stop `npm run dev` first on Windows if the Prisma engine file is locked).

## Getting Started

### 1) Prerequisites

- Node.js 20+
- npm 10+ (or pnpm/yarn if preferred)
- PostgreSQL running locally (or a cloud instance)

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment variables

Copy the sample env file:

```bash
cp .env.example .env
```

Set at least:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Long random string used by Auth.js to sign cookies (e.g. `openssl rand -base64 32`) |
| `AUTH_URL` | App origin, e.g. `http://localhost:3000` in development |

### 4) Create DB schema and Prisma client

```bash
npx prisma db push
npx prisma generate
```

### 5) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`. Create an account at `/signup`, then use the dashboard and APIs as that user.

### Windows PowerShell Notes

- If `npm` is blocked by policy, run:
  - `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
- In PowerShell, set env vars with:
  - `$env:DATABASE_URL = "postgresql://..."`
- Do not run `DATABASE_URL="..."` directly in PowerShell (that is bash syntax).

## Available Scripts

- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint
- `npm run db:push` — sync Prisma schema to DB
- `npm run db:studio` — Prisma Studio

## Data model (overview)

- **`User`** — email, password hash, name; owns applications and related records.
- **`Application`** — company, role, location, status, dates, notes; **`userId`** for scoping.
- Additional models: documents, STAR stories, interview questions, mock notes, companies, contacts (see `prisma/schema.prisma`).

Application **status** enum: `WISHLIST`, `APPLIED`, `INTERVIEW`, `OFFER`, `REJECTED`, `WITHDRAWN`.

## API notes

- **Session required** for `/api/applications` and other app APIs (except `/api/auth/*` and `POST /api/register`). Unauthenticated requests return **401**.
- Example create payload for `POST /api/applications` (fields validated with Zod):

```json
{
  "company": "Acme Inc",
  "role": "Frontend Engineer",
  "location": "Remote",
  "status": "APPLIED",
  "sourceUrl": "https://jobs.example.com/acme-frontend",
  "appliedAt": "2026-04-01T10:00:00.000Z",
  "deadlineAt": "2026-04-15T23:59:59.000Z",
  "followUpAt": "2026-04-08T10:00:00.000Z",
  "notes": "Referred by friend."
}
```

## Quick smoke test

1. Configure `.env` (including `AUTH_SECRET`).
2. Run `npx prisma db push` and `npm run dev`.
3. Open `/signup`, create a user, then open `/dashboard` and `/applications`.
4. Add an application in the UI and confirm metrics on `/` or `/dashboard` update.

Calling `GET /api/applications` without a session cookie will not return data (401).

## Project structure (high level)

```txt
prisma/
  schema.prisma
src/
  app/
    api/              # REST handlers (applications, auth, documents, companies, …)
    dashboard/
    applications/
    lab/
    interview/
    companies/
    login/
    signup/
    privacy/
    terms/
    layout.tsx
    page.tsx          # landing (+ optional snapshot when signed in)
  auth.ts             # NextAuth config
  middleware.ts
  components/
  lib/
    prisma.ts
    validation.ts
    pipeline-insights.ts
    session-user.ts
  types/
```

Uploads for documents are stored under `public/uploads/documents/` locally; use object storage for production serverless deployments.

## Deployment

Set `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_URL` to your production URL in the host’s environment. Run migrations or `prisma db push` against the production database as appropriate for your workflow.
