# Vihem CMS

React + Vite site with Neon Postgres and Cloudflare R2 image storage.

## Stack

- **Frontend:** React 18, Vite, Tailwind, shadcn/ui
- **Database:** Neon Postgres via `@neondatabase/serverless` (`/api/*` server routes)
- **Storage:** Cloudflare R2 (presigned uploads, metadata in `post_images`)
- **Auth:** Session cookie (`/api/cms/login`) with env-configured credentials
- **Deploy:** Vercel

## Setup

```bash
cp .env.example .env
# Fill in DATABASE_URL, CMS_*, R2_*, VITE_R2_PUBLIC_BASE_URL
npm run neon:push
npm run dev
```

CMS login at `/admin/login` uses `CMS_AUTH_EMAIL` / `CMS_AUTH_PASSWORD` from `.env`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite + local `/api/*` middleware |
| `npm run build` | Production build |
| `npm run neon:push` | Apply SQL migrations |

## API routes

| Route | Auth | Description |
|-------|------|-------------|
| `GET /api/posts` | Public | Published posts |
| `GET /api/posts/by-slug/:slug` | Public | Single published post |
| `POST /api/cms/login` | — | Create session |
| `GET /api/cms/posts` | Session | All posts (admin) |
| `POST /api/presign-upload` | Session | R2 presigned URL |

Posts map to the existing Life Pulse `posts` table schema (`description` → excerpt, `body` → content, `status` → published).
