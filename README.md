# The Job Pit

A full-stack job application tracker for logging opportunities, monitoring status changes,
managing deadlines/follow-ups, and visualizing your pipeline.

## Creators

- Lideon
- Vicknesh

## Why this project

This app is both practical for your own search and a strong portfolio piece because it combines:

- CRUD data modeling
- API design and validation
- reminder/deadline workflows
- dashboard analytics with charts
- clean full-stack architecture

## Tech Stack

- Next.js (App Router) + TypeScript
- Prisma ORM + PostgreSQL
- Tailwind CSS
- Recharts (data visualization)
- Zod (input validation)

## Current Scope (v1 scaffold)

- Application data model in Prisma
- REST API routes:
  - `GET /api/applications`
  - `POST /api/applications`
  - `GET /api/applications/:id`
  - `PATCH /api/applications/:id`
  - `DELETE /api/applications/:id`
- Dashboard homepage with:
  - total applications metric
  - active pipeline metric
  - follow-ups due metric
  - status distribution pie chart

## Getting Started

### 1) Prerequisites

- Node.js 20+
- npm 10+ (or pnpm/yarn if preferred)
- PostgreSQL running locally (or cloud instance)

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment variables

Copy the sample env file:

```bash
cp .env.example .env
```

Update `DATABASE_URL` in `.env` with your Postgres connection string.

Example:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/thejobpit?schema=public"
```

### 4) Create DB schema and Prisma client

```bash
npx prisma db push
npx prisma generate
```

### 5) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

### Windows PowerShell Notes

- If `npm` is blocked by policy, run:
  - `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
- In PowerShell, set env vars with:
  - `$env:DATABASE_URL = "postgresql://..."`
- Do not run `DATABASE_URL="..."` directly in PowerShell (that is bash syntax).

## Available Scripts

- `npm run dev` - start Next.js dev server
- `npm run build` - create production build
- `npm run start` - run production server
- `npm run lint` - run lints
- `npm run db:push` - sync Prisma schema to DB
- `npm run db:studio` - open Prisma Studio

## Prisma Model

Main model: `Application`

- core fields: `company`, `role`, `location`, `sourceUrl`, `notes`
- lifecycle: `status`
- date tracking: `appliedAt`, `deadlineAt`, `followUpAt`
- metadata: `createdAt`, `updatedAt`

Status enum:

- `WISHLIST`
- `APPLIED`
- `INTERVIEW`
- `OFFER`
- `REJECTED`
- `WITHDRAWN`

## API Payload Example

`POST /api/applications`

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

## API Endpoints

- `GET /api/applications` - list all applications
- `POST /api/applications` - create application
- `GET /api/applications/:id` - get application by id
- `PATCH /api/applications/:id` - update fields on an application
- `DELETE /api/applications/:id` - remove an application

## Quick Smoke Test

1. Start the app: `npm run dev`
2. In a second terminal:
   - `Invoke-RestMethod http://localhost:3000/api/applications`
3. Create one record:
   - `Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/applications -ContentType "application/json" -Body '{"company":"Acme","role":"Frontend Engineer","status":"APPLIED"}'`
4. Refresh `http://localhost:3000` and confirm dashboard metrics update.

## Project Structure

```txt
prisma/
  schema.prisma
src/
  app/
    api/applications/
      route.ts
      [id]/route.ts
    layout.tsx
    page.tsx
  components/
    pipeline-chart.tsx
  lib/
    prisma.ts
    validation.ts
  types/
    application.ts
```
