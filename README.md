# The Job Pit

A full-stack job application tracker for logging opportunities, monitoring status changes,
managing deadlines and follow-ups, and visualizing your pipeline — with optional **community**
sharing for STAR stories and interview Q&A.

## Creators

- Lideon
- Vicknesh
- Aaron

## Why this project

This app is both practical for your own search and a strong portfolio piece because it combines:

- CRUD data modeling and REST APIs with Zod validation
- Authentication and multi-tenant data scoping (`userId`)
- Dashboard analytics with charts (Recharts)
- Interview prep (STAR stories, question bank, mock sessions) with **opt-in public community** feeds
- User **profile** (bio, links) used as attribution on shared content
- Clean Next.js App Router architecture

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Prisma ORM + PostgreSQL
- Tailwind CSS (design tokens: zinc neutrals, rose/teal accents, Plus Jakarta Sans)
- Auth.js / NextAuth v5 (credentials) + bcryptjs
- Recharts
- Zod

## App routes

| Path | Notes |
|------|--------|
| `/` | Landing; signed-in users see a live **snapshot** (metrics + chart) |
| `/dashboard`, `/applications`, `/lab`, `/interview`, `/companies` | Workspace — **requires sign-in** |
| `/profile` | Edit profile (name, bio, links) — **requires sign-in** |
| `/community`, `/community/star/[id]`, `/community/question/[id]` | **Public** reads of opt-in shared STAR stories and Q&A |
| `/about`, `/features`, `/faq` | Marketing |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | Auth flows |
| `/privacy`, `/terms` | Legal |

Signed-in users get a **header account menu** (profile icon): Profile, Community, Log out.

Middleware redirects unauthenticated users to `/login?callbackUrl=…` for protected paths (`/dashboard`, `/applications`, `/lab`, `/interview`, `/companies`, `/profile`). `/community` stays **public** (read-only browsing).

## Features (current scope)

- **Auth:** `POST /api/register`, NextAuth session; data scoped by `userId`.
- **Applications** — CRUD via `/api/applications` (and nested resources).
- **Profile** — `GET` / `PATCH /api/profile` (session): name, headline, bio, location, phone, LinkedIn, GitHub, X, website.
- **Password reset** — `POST /api/forgot-password`, `POST /api/reset-password`; email via **Resend** when `RESEND_API_KEY` is set; in development without Resend, the reset URL is printed in the **server terminal**.
- **Interview prep** — STAR stories, questions, mock notes (session APIs). Users can **share** individual STAR stories or Q&A to `/community` (opt-in flags on each record).
- **Community** — Lists only content marked public; author display uses **profile** fields (no email shown).
- **Polished legal + account UX** — Terms page now uses highlighted section cards; signed-in header uses a profile icon dropdown for account actions.

After pulling schema changes, run `npx prisma db push` and regenerate the client. On **Windows**, if `prisma generate` fails with **EPERM** while the dev server is running, stop `npm run dev`, then run `npm run db:generate` (frees common ports and runs `prisma generate`), then start dev again.

## Getting started

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL (local or hosted)

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env` and set:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Long random secret for Auth.js (e.g. `openssl rand -base64 32`) |
| `AUTH_URL` | App origin, e.g. `http://localhost:3000` |
| `RESEND_API_KEY` | *(Optional)* Send password-reset emails via [Resend](https://resend.com) |
| `EMAIL_FROM` | *(Optional)* From address for Resend (must be allowed for your domain) |

### Database and Prisma

```bash
npx prisma db push
npx prisma generate
```

### Run

```bash
npm run dev
```

Open `http://localhost:3000`, sign up at `/signup`, then explore the dashboard and workspace routes.

### Windows notes

- If `npm` scripts are blocked: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
- Use `npm run db:generate` when plain `npx prisma generate` hits file locks (see above).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run db:push` | `prisma db push` |
| `npm run db:generate` | Frees ports 3000–3003 (Windows) then `prisma generate` |
| `npm run db:studio` | Prisma Studio |

## Data model (overview)

- **`User`** — email, password hash, name; profile fields (`headline`, `bio`, `location`, `phone`, `linkedinUrl`, `githubUrl`, `twitterUrl`, `websiteUrl`); owns applications and related records.
- **`PasswordResetToken`** — hashed token, expiry, tied to user (password reset flow).
- **`Application`** — company, role, status, dates, notes; scoped by `userId`.
- **`StarStory`** — STAR fields; optional `applicationId`; **`isPublic`**, **`shareCompanyContext`** for community (company/role shown only when linked application exists and user opts in).
- **`InterviewQuestion`** — question/answer/category; **`isPublic`** for community.
- Plus: documents, mock interviews, companies, contacts — see `prisma/schema.prisma`.

Application **status** enum: `WISHLIST`, `APPLIED`, `INTERVIEW`, `OFFER`, `REJECTED`, `WITHDRAWN`.

## API notes

- Session required for workspace and profile APIs. Exceptions include `POST /api/register`, `/api/auth/*`, `POST /api/forgot-password`, `POST /api/reset-password` (rate limiting recommended for production).
- Unauthenticated requests to protected APIs return **401**.

Example `POST /api/applications` body (Zod-validated):

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

1. Set `.env` (`AUTH_SECRET`, `DATABASE_URL`, `AUTH_URL`).
2. `npx prisma db push` and `npm run dev`.
3. `/signup` → `/dashboard` → `/applications` (add one application).
4. `/profile` — save display name and a link.
5. `/interview` — add a STAR story, enable **Community feed**, open `/community`.
6. `GET /api/applications` without a session cookie → **401**.

## Project structure (high level)

```txt
prisma/
  schema.prisma
scripts/
  db-generate.mjs       # Windows-friendly prisma generate
src/
  app/
    api/                 # REST: applications, profile, auth, register, forgot/reset password, …
    community/           # Public community pages
    about/, features/, faq/
    dashboard/, applications/, lab/, interview/, companies/
    profile/
    login/, signup/, forgot-password/, reset-password/
    privacy/, terms/
    layout.tsx
    page.tsx             # landing (+ snapshot when signed in)
  auth.ts
  middleware.ts
  components/
  lib/
    prisma.ts
    validation.ts
    pipeline-insights.ts
    session-user.ts
    …
  types/
```

Document uploads use `public/uploads/documents/` locally; use object storage for production serverless deployments.

## Deployment

Set `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_URL` to your production URL. Add `RESEND_API_KEY` and `EMAIL_FROM` if you want password-reset emails in production. Run `prisma db push` or your migration workflow against the production database.
