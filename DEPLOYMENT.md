# Deploying The Job Pit

This guide walks through hosting the app on **Vercel** with a managed **PostgreSQL** database (Neon or Supabase).

## Overview

| Piece | Recommendation |
|-------|----------------|
| App hosting | [Vercel](https://vercel.com) (Next.js App Router) |
| Database | [Neon](https://neon.tech) or [Supabase](https://supabase.com) Postgres |
| Auth | NextAuth (`AUTH_SECRET`, `AUTH_URL`) |
| Email (password reset) | [Resend](https://resend.com) |
| File uploads (production) | S3-compatible storage (optional; local `public/uploads` works for small demos) |

## 1. Create the database

### Option A — Neon

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the **pooled** connection string (starts with `postgresql://`).
3. Use it as `DATABASE_URL` in Vercel.

### Option B — Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings → Database** and copy the **URI** connection string.
3. Replace `[YOUR-PASSWORD]` with your database password.

## 2. Push the schema

From your machine (with production `DATABASE_URL` in env):

```bash
npx prisma db push
```

For teams, prefer Prisma Migrate (`prisma migrate deploy`) once you add migration files.

## 3. Deploy to Vercel

1. Push your repo to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Framework preset: **Next.js** (auto-detected).
4. Add environment variables:

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | Yes | `postgresql://…` |
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `AUTH_URL` | Yes | `https://your-app.vercel.app` |
| `ADMIN_EMAILS` | Recommended | `you@gmail.com` |
| `RESEND_API_KEY` | For reset emails | `re_…` |
| `EMAIL_FROM` | With Resend | `The Job Pit <noreply@yourdomain.com>` |
| `JOB_MATCH_USE_LIVE` | Optional | `1` |

5. Deploy. Vercel runs `next build` automatically.

## 4. First admin access

Set `ADMIN_EMAILS` to your account email (comma-separated for multiple). Log out and log back in — your user is promoted to `ADMIN` and `/admin` becomes available.

## 5. Post-deploy checklist

- [ ] Sign up / log in on production URL
- [ ] Create an application on `/applications`
- [ ] Test forgot-password (needs `RESEND_API_KEY` + verified domain)
- [ ] Open `/admin` with an admin email
- [ ] Run `npm run db:users` locally against prod DB only if needed (avoid sharing credentials)

## 6. Inspecting data locally

```bash
npm run db:studio    # GUI at http://localhost:5555
npm run db:users     # CLI table of users
```

## 7. GitHub Actions CI

The repository includes a CI workflow that runs `npm ci`, `prisma generate`, `npm run lint`, and `npm run build` on pushes and pull requests to `main`.

## 8. Custom domain (optional)

In Vercel → **Settings → Domains**, add your domain. Update `AUTH_URL` to match the canonical HTTPS URL and redeploy.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Login works locally but not on Vercel | Check `AUTH_SECRET` and `AUTH_URL` match production URL |
| Prisma errors after schema change | Run `db push` against prod DB; redeploy |
| Password reset emails not sent | Set `RESEND_API_KEY`; verify sender domain in Resend |
| Admin page 403 | Add email to `ADMIN_EMAILS`, log out/in |
