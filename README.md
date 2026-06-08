# Vihem CMS

React + Vite site with Neon Postgres and Cloudflare R2 image storage.

## Stack

- **Frontend:** React 18, Vite, Tailwind, shadcn/ui
- **Database:** Neon Postgres via `@neondatabase/serverless` (`/api/*` server routes)
- **Storage:** Cloudflare R2 (presigned uploads, metadata in `post_images`)
- **Deploy:** Vercel

## Setup

```bash
cp .env.example .env
# Fill in DATABASE_URL, R2_*, VITE_R2_PUBLIC_BASE_URL
npm run neon:push
npm run dev
```

CMS at `/admin` (no authentication).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite + local `/api/*` middleware |
| `npm run build` | Production build |
| `npm run neon:push` | Apply SQL migrations |

## API routes

| Route | Description |
|-------|-------------|
| `GET /api/posts` | Published posts |
| `GET /api/posts/by-slug/:slug` | Single published post |
| `GET /api/cms/posts` | All posts (admin) |
| `POST /api/presign-upload` | R2 presigned URL |

Posts map to the existing Life Pulse `posts` table schema (`description` → excerpt, `body` → content, `status` → published).
