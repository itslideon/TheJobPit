# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `main` branch (latest) | Yes |

## Reporting a vulnerability

If you discover a security issue, **please do not open a public GitHub issue** with exploit details.

Instead, email the maintainers (see repository owner / creators in [README.md](./README.md)) with:

- A description of the issue
- Steps to reproduce
- Impact assessment (if known)

We will acknowledge reports within a reasonable timeframe and work on a fix before public disclosure when appropriate.

## Security practices for self-hosting

- Set a strong `AUTH_SECRET` (`openssl rand -base64 32`).
- Use HTTPS in production; set `AUTH_URL` to your canonical HTTPS origin.
- Keep PostgreSQL credentials private; never commit `.env`.
- Set `ADMIN_EMAILS` only to trusted addresses.
- Configure Resend with a verified domain for password-reset emails.
- Rate-limit auth endpoints (`/api/register`, forgot/reset password) at the edge or reverse proxy in production.
- User uploads are stored under `public/uploads/documents/` locally — use object storage with access controls for production deployments.
