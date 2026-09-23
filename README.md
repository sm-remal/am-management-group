# AM Management Group — Corporate Website v3

**Stack:** Next.js 16 (App Router, React 19, Tailwind CSS 4) · Express 5 · Prisma 7 · **PostgreSQL 16**
Designed & developed by Iconic Soft Ltd.

```
am-management/
├── frontend/            Next.js site + admin dashboard
├── backend/             Express REST API (/api/v1/*) + Prisma
│   ├── prisma/schema.prisma
│   ├── prisma/migrations/20260918000000_postgresql_init/
│   ├── prisma/seed.ts
│   └── scripts/migrate-mysql-to-postgres.ts
├── docker-compose.yml   local PostgreSQL
├── DESIGN-SYSTEM.md     theme tokens, motifs, component map
└── docs/                MANUAL.md + MANUAL.pdf, single-file HTML design preview
```

## 1. Quick start (local)

```bash
# Database
docker compose up -d db

# API
cd backend
cp .env.example .env            # edit secrets
npm install                     # runs prisma generate
npm run db:deploy               # creates the PostgreSQL schema
npm run db:seed                 # admin user + 6 group companies + base settings
npm run dev                     # http://localhost:5000

# Website
cd ../frontend
cp .env.example .env.local
npm install
npm run dev                     # http://localhost:3000
```

Admin: `/login` with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, then `/dashboard`.

## 2. Moving the live data from MySQL to PostgreSQL

The previous API ran on MySQL (`@prisma/adapter-mariadb`). v2.0 runs on PostgreSQL (`@prisma/adapter-pg`).
The old MySQL migration history is replaced by a single PostgreSQL baseline.

```bash
cd backend
# .env -> DATABASE_URL = new PostgreSQL, MYSQL_URL = old MySQL
npm run db:deploy                        # empty schema on PostgreSQL
npm run migrate:mysql-to-pg              # copies all 13 tables in FK order, one transaction
npm run migrate:mysql-to-pg -- --truncate   # re-run from scratch if needed
```

Checks after import: row counts per table, one admin login, one company page, one image URL (Cloudinary URLs are unchanged).

## 3. Production

| Part | Suggested host | Notes |
|---|---|---|
| PostgreSQL | Neon, Supabase, Railway, RDS | set `DATABASE_SSL=true` |
| API | Railway / Render / VPS (`npm run build && npm run db:deploy && npm start`) | `vercel.json` kept for Vercel serverless |
| Website | Vercel | `NEXT_PUBLIC_API_BASE_URL=https://<api-host>/api/v1` |

CORS: add the production site URL to `APP_URL` in the API env (already read by `src/app.ts`).

## 4. What changed in v2.0

**Backend**
- Prisma datasource `mysql` → `postgresql`; driver adapter `adapter-mariadb` → `adapter-pg` (+ `pg`), pooled client cached across hot reloads.
- Fresh PostgreSQL baseline migration (native enums, same table/column/index names as before — API contracts unchanged).
- All admin search filters now `mode: "insensitive"` (MySQL was case-insensitive by collation; PostgreSQL is not — without this, dashboard search would silently get stricter).
- Runtime packages (`express`, `cors`, `bcrypt`, `jsonwebtoken`, `cookie-parser`, `prisma`) moved from devDependencies to dependencies so `npm ci --omit=dev` deployments work.
- New: `db:*` scripts, idempotent seed, MySQL→PostgreSQL copy script, `.env.example`, `docker-compose.yml`.
- Removed from the package: real `.env*` files, `ca.pem` (Aiven MySQL cert), build output, AI-agent skill folders.

**Frontend** — see `DESIGN-SYSTEM.md`
- New premium corporate theme (tokens, Archivo variable type, blueprint surfaces, safety-tape motif).
- Old full-bleed image slider removed. Replaced by a compact hero (Sora headline) + animated group-structure infographic with 3D sector orbs and thick flowing connectors, finished by two crossing premium ribbon tapes.
- Compact scale: all page titles two steps smaller, section padding reduced ~40%.
- Fixes: nested `<main>` on 13 pages, duplicate `<h1>` on job details, unused server fetches on home.
- Every inner-page banner replaced by a thin blueprint band with breadcrumb and running tape edge (same props — no page changes needed).
- Home sections rebuilt: intro, figures infographic (count-up + pictograms), companies, sectors, why-choose-us, featured projects (grid of small cards), values, careers CTA. Home gallery section removed (Gallery page remains).
- Cleanup: unused images, default Next.js SVGs, static data files, Redux store and 9 unused npm packages removed; obsolete hero-banner fields removed from Dashboard → Settings. Navbar, top bar and footer restyled.
- All site copy retained; data fetching, auth, dashboard logic untouched.
- Per-page `<title>` metadata, reduced-motion support, visible keyboard focus.
