# AM Management Group Website v3
## Installation, Operation & Validation Manual

| | |
|---|---|
| Client | AM Management Group Sdn. Bhd. |
| Prepared by | Iconic Soft Ltd. |
| Version | 3.0.0 |
| Date | 18 September 2026 (v3) |
| Stack | Next.js 16 · React 19 · Tailwind CSS 4 · Express 5 · Prisma 7 · PostgreSQL 16 |

---

## 1. Overview

Version 2.0 does two things:

1. **Redesign.** The public website gets a premium corporate theme with a compact hero, an animated group-structure infographic, crossing "safety tape" ticker banners, an animated figures infographic and a thin banner on every inner page. The old image slider is removed. All existing website text is kept.
2. **Database move.** The API moves from MySQL to PostgreSQL. Endpoints, request and response formats are unchanged, so the admin dashboard and website keep working as before.

### Package contents

```
am-management/
├── frontend/                 Next.js website + admin dashboard
├── backend/                  Express REST API (/api/v1/*)
│   ├── prisma/schema.prisma
│   ├── prisma/migrations/20260918000000_postgresql_init/
│   ├── prisma/seed.ts
│   └── scripts/migrate-mysql-to-postgres.ts
├── docs/
│   ├── MANUAL.md / MANUAL.pdf           this document
│   └── am-management-v3-preview.html    single-file design preview
├── docker-compose.yml        local PostgreSQL
├── DESIGN-SYSTEM.md          colours, type, components
└── README.md
```

---

## 2. Requirements

| Item | Version |
|---|---|
| Node.js | 20.19 or newer (22 LTS recommended) |
| npm | 10+ |
| PostgreSQL | 14+ (16 recommended) — local via Docker, or managed (Neon, Supabase, Railway, AWS RDS) |
| Docker | optional, only for local PostgreSQL |
| Cloudinary account | existing, for image uploads |
| SMTP account | existing, for password-reset e-mails |

---

## 3. Local installation

### 3.1 Database

```bash
docker compose up -d db
```

This starts PostgreSQL on `localhost:5432` with database `am_management`, user `am_user`, password `am_secret`.

### 3.2 API (backend)

```bash
cd backend
cp .env.example .env
```

Edit `.env`. The important values:

| Variable | Meaning |
|---|---|
| `DATABASE_URL` | `postgresql://am_user:am_secret@localhost:5432/am_management?schema=public` |
| `DATABASE_SSL` | `false` locally, `true` for managed providers |
| `JWT_ACCESS_SECRETE`, `JWT_REFRESH_SECRETE` | long random strings (keep the existing spelling) |
| `APP_URL` | website URL, used for CORS and e-mail links |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | first admin account |
| `CLOUDINARY_*`, `SMTP_*` | copy from the current production settings |

Then:

```bash
npm install            # also runs "prisma generate"
npm run db:deploy      # creates all tables
npm run db:seed        # admin user, 6 group companies, base settings
npm run dev            # API on http://localhost:5000
```

Check: opening `http://localhost:5000` shows *"AM Management Group Backend Server IS Running..."*.

### 3.3 Website (frontend)

```bash
cd ../frontend
cp .env.example .env.local      # NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
npm install
npm run dev                     # http://localhost:3000
```

### 3.4 Command reference (backend)

| Command | Purpose |
|---|---|
| `npm run dev` | development server with reload |
| `npm run build` / `npm start` | production build / run |
| `npm run db:deploy` | apply migrations (use in production) |
| `npm run db:migrate` | create a new migration after editing `schema.prisma` (development only) |
| `npm run db:seed` | insert baseline data (safe to repeat) |
| `npm run db:studio` | browse the database in a browser |
| `npm run migrate:mysql-to-pg` | one-off copy of live MySQL data |

---

## 4. Moving live data from MySQL to PostgreSQL

Do this once, on a copy first, then for real during a short maintenance window.

1. Create the production PostgreSQL database and set `DATABASE_URL` (and `DATABASE_SSL=true`) in `backend/.env`.
2. Run `npm run db:deploy` to create the empty schema. **Do not run the seed** before importing.
3. Set `MYSQL_URL` to the current MySQL database, for example
   `mysql://user:pass@host:port/dbname?ssl={"rejectUnauthorized":false}`
4. Put the website in maintenance or stop admin edits.
5. Run `npm run migrate:mysql-to-pg`.
   All 13 tables are copied in dependency order inside one transaction. If anything fails, nothing is written.
6. Compare row counts (the script prints them) with MySQL.
7. Point the live API at PostgreSQL and redeploy.
8. Check: admin login, one company page, one project page with images, submit a test inquiry.

To repeat from scratch: `npm run migrate:mysql-to-pg -- --truncate`.

Images stay on Cloudinary; their URLs are copied unchanged.

---

## 5. Production deployment

| Part | Where | Settings |
|---|---|---|
| PostgreSQL | Neon / Supabase / Railway / RDS | enable daily backups |
| API | Railway, Render or a VPS | build `npm run build`, release `npm run db:deploy`, start `npm start` |
| API on Vercel (optional) | `vercel.json` kept | set the same env vars |
| Website | Vercel | `NEXT_PUBLIC_API_BASE_URL=https://<api-domain>/api/v1` |

After deploying:

- Add the website domain to `APP_URL` on the API (CORS).
- Set `NODE_ENV=production`.
- **Rotate all credentials** that were in the old project's `.env` files (database, JWT secrets, Cloudinary, SMTP). They were included in the previously shared ZIP.

---

## 6. Content management (admin dashboard)

Sign in at `/login` and open `/dashboard`. Administrators see every section below; normal users see only Overview and Profile.

| Section | What it controls on the website |
|---|---|
| Overview | counts and recent activity |
| Companies | group companies: name, category, logo, cover image, description, status. Mark one as **main company** to show it as the large navy card on the home page |
| Services | services listed on company pages and the Services page |
| Projects | project pages; tick **featured** to show on the home page (up to 6 small cards). Status (Completed / Ongoing) drives the home filter |
| Gallery | images for the Gallery page and company pages (the home page no longer has a gallery section) |
| News | news articles |
| Careers | job posts shown on the Careers page |
| Applications | CVs submitted from job pages |
| Inquiries | messages from the contact forms |
| Users | admin and user accounts |
| Profile | your own name, avatar and password |
| Settings | site-wide text, contact details, logo, hero images, social links, SEO |

### 6.1 Settings keys

| Key | Where it appears |
|---|---|
| `site.name` | header, footer, page titles |
| `site.tagline` | home hero headline and footer statement (e.g. *One Group. Multiple Businesses.*) |
| `site.description` | home hero paragraph, footer |
| `site.business_hours` | footer |
| `site.website_logo` | logo everywhere (falls back to the built-in logo) |

The old `site.hero_banner_desktop` / `site.hero_banner_mobile` keys are no longer used (the image slider was removed) and their fields were taken out of the Settings screen. Existing values in the database are harmless.
| `contact.phone`, `contact.whatsapp`, `contact.email`, `contact.address` | top bar, footer, contact page |
| `social.facebook`, `social.linkedin`, `social.instagram`, `social.twitter` | top bar and footer icons (hidden when empty) |
| `seo.title`, `seo.description` | search engine title and description |

### 6.2 Fixed figures

The figures 10+ years, 6+ companies, RM 2.66M documented contract value, RM 500K share capital, CIDB Grade G5 and 2012 are part of the design, not the CMS. To change them edit:

- `frontend/src/components/home/Statistics/Statistics.tsx`
- `frontend/src/components/home/Banner/Banner.tsx` (hero figures and tape texts)

---

## 7. Design summary

Full details are in `DESIGN-SYSTEM.md`.

| Element | Description |
|---|---|
| Colours | navy `#234279`, harbour navy `#0F2447`, signal orange `#FB731F`, steel `#EEF2F7` |
| Typeface | Sora for headings (hero title 1.75rem → 2.5rem, section titles 1.5rem → 2.1rem, weight 600); Archivo for body |
| Motif | blueprint grid surfaces and orange/navy safety tape |
| Home hero | compact, with an animated diagram: the holding company at the centre, six compact, semi-transparent 3D glass orbs with large icons, thick gradient connectors with flowing light and travelling pulses, two counter-rotating orbit rings |
| Tape banners | two premium ribbons crossing at a slight angle — orange gradient (sectors) and navy with orange edges (credentials); fine inner rules, slow light sheen, tracked small caps, star separators; pause on hover |
| Spacing | compact scale: sections 48 px (mobile) → 64 px (desktop) vertical padding |
| Companies grid | a "Partner with the group" card fills the last row when the company count leaves a gap |
| Featured projects | grid of up to 6 small cards (3 per row on desktop) with All / Completed / Ongoing filter |
| Figures | count-up numbers with pictograms (1 block = RM 100K) |
| Inner pages | thin blueprint band with breadcrumb and running tape edge |
| Accessibility | keyboard focus ring, reduced-motion support, labelled controls |

To review the look without installing anything, open `docs/am-management-v3-preview.html` in a browser. It is a static copy of the home page and an inner-page banner, with sample project and gallery photos.

---

## 8. Testing & validation

### 8.1 Checks performed on this package

| # | Check | Result |
|---|---|---|
| 1 | Syntax parse of all 214 TypeScript/TSX files (frontend + backend + seed + scripts) | **Pass** — 0 errors |
| 2 | Resolution of every local import (316 frontend, 171 backend) | **Pass** — only `generated/prisma` is unresolved, which is created by `prisma generate` during install |
| 3 | Prisma schema vs PostgreSQL migration: 13 tables, every column, nullability, enum types, defaults, unique keys, indexes, foreign keys and delete rules | **Pass** — 0 mismatches |
| 4 | Case-insensitive search on PostgreSQL: `mode: "insensitive"` added to 48 search filters in 10 services; all sit inside typed `Prisma.*WhereInput` objects | **Pass** |
| 5 | Client/server component boundaries: every file using React hooks or event handlers has `"use client"` | **Pass** |
| 6 | Custom theme utilities used by components exist in `globals.css` | **Pass** |
| 7 | Secret scan of the package (`.env`, passwords, Aiven certificate) | **Pass** — only `.env.example` files included |
| 8 | Preview rendered in Chromium at 1440 px and 390 px: horizontal overflow, script errors, visual review | **Pass** after fixes below |
| 9 | Dead-code scan: every component/module is imported somewhere; every asset is referenced; every npm dependency is used (except `react-dom`, required by Next.js) | **Pass** after cleanup |
| 10 | Featured projects filter (All / Completed / Ongoing) in the preview | **Pass** |
| 11 | HTML structure: one `<main>` per page, one `<h1>` per page | **Pass** after fixes below |
| 12 | Reduced-motion mode renders without script errors | **Pass** |
| 13 | Motion test on 13 pages: nothing left hidden after scrolling (normal and fast scroll), count-up 0 → target, hover lift, reduced motion shows everything static | **Pass** |
| 14 | Functional test: 23 routes, dropdown, mobile menu, filters, lightbox, thumbnails, form validation, pre-filled enquiry | **Pass** |

### 8.2 Issues found and fixed during testing

| Issue | Fix |
|---|---|
| The two crossing tape banners overlapped so much that half of the orange sector tape was hidden | Reduced the angles (−1.2° / 0.9°), put the orange tape on top, adjusted spacing |
| Font fallback on systems without the web font showed a serif face in some paragraphs | Added Helvetica / Arial to the font stack |
| Hero infographic labels on the right-hand nodes could run past the frame on narrow screens | Labels now align towards the centre |
| Dead import of a removed component in the home page | Removed |
| Hero title too large and heavy | Changed to Sora 600, 2rem → 3.15rem |
| Image slider under the tapes (and its Settings fields) no longer wanted | Removed component, images, Settings fields |
| Large featured-project tile | Removed; small-card grid only |
| Home "Our Work In Pictures" section no longer wanted | Removed component and its data request |
| 13 pages nested a second `<main>` inside the layout's `<main>` (invalid HTML, confuses screen readers) | Inner wrappers changed to `<div>` |
| Job detail page showed the job title twice as `<h1>` (banner + body) | Body title changed to `<h2>` |
| Home page fetched companies and gallery on the server but never used them | Removed; only featured projects are fetched |
| Company grid left an empty slot with 5 companies | Added "Partner with the group" card to fill the row |
| Headings too large, too much empty space | All `h1`/`h2` two steps smaller site-wide; section, banner and hero padding reduced about 40% |
| Unused files: 11 images, 5 default SVGs, 4 static data files, Redux store, 3 unused components, 2 hooks, 1 modal, API endpoint map, agent notes | Deleted |
| Unused npm packages: swiper, framer-motion, sweetalert2, react-hot-toast, @reduxjs/toolkit, react-redux, nodemailer, @types/nodemailer, shadcn-ui | Removed from `package.json`; stale `package-lock.json` removed (regenerated by `npm install`) |

### 8.3 Not tested here (network was unavailable)

`npm install`, `next build`, the TypeScript type check and a live PostgreSQL run could not be executed in the build environment. Run the acceptance checklist below once after installation; allow about half a day for any build fixes.

### 8.4 Acceptance checklist

**Build**

- [ ] `backend`: `npm install` and `npm run build` finish without errors
- [ ] `frontend`: `npm install` and `npm run build` finish without errors
- [ ] `npm run lint` in `frontend` shows no errors

**Database**

- [ ] `npm run db:deploy` creates 13 tables
- [ ] `npm run db:seed` prints admin, 6 companies, settings
- [ ] (live data) `migrate:mysql-to-pg` row counts match MySQL

**Website**

- [ ] Home: hero diagram animates, tapes scroll, "Who we are" follows directly after the tapes
- [ ] Home: figures count up when scrolled into view
- [ ] Home: companies, featured projects (All / Completed / Ongoing), gallery load from the API
- [ ] Every inner page shows the new banner with breadcrumb
- [ ] Company page shows its cover image in the banner
- [ ] Header dropdown lists companies; mobile menu opens and closes
- [ ] Contact form and job application submit successfully
- [ ] Layout checked at 390 px, 768 px, 1280 px and 1920 px
- [ ] With "reduce motion" enabled in the operating system, animations stop

**Admin**

- [ ] Login, logout, password reset e-mail
- [ ] Search in Companies / Projects / Users finds results regardless of upper/lower case
- [ ] Create, edit and delete one record in each section
- [ ] Image upload to Cloudinary works
- [ ] Changing `site.tagline` or `site.description` in Settings updates the home hero

---

## 9. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `Cannot find module '../../generated/prisma/client'` | run `npm install` or `npx prisma generate` in `backend` |
| `P1001 Can't reach database server` | check `DATABASE_URL`, that PostgreSQL is running, and `DATABASE_SSL` |
| `self-signed certificate` / SSL error | set `DATABASE_SSL=true` for managed databases |
| Website shows default text and no companies | `NEXT_PUBLIC_API_BASE_URL` wrong, or API not running |
| `Not allowed by CORS` | add the website URL to `APP_URL` on the API |
| Remote images do not appear | image host must be reachable over https; `next.config.ts` already allows all hosts |
| Admin search misses results | confirm the backend is v2.0 (search uses `mode: "insensitive"`) |
| Migration script: duplicate key | target not empty — rerun with `-- --truncate` |

---

## 11. What's new in v3

| Area | Change |
|---|---|
| Content | Company profile 2026 used as the source: company story, CIDB G5 (B04, CE21, M15, valid to Jun 2027), registration and incorporation details, leadership, 7 projects with sites, dates and contract values |
| Figures | Home figure now **RM 2.66M documented contract value** (two programmes) instead of RM 4.8M+, shown as an animated bar chart |
| Charts | Projects page: animated status donut, projects-by-state bars and contract timeline, computed live from published projects |
| Photos | Deliberately few: 9 real photos in `frontend/public/images` (8 project, 1 head office). Duplicates and stock images from the PDF excluded |
| Contact | Real address and phones; both emails shown everywhere: info@ammanagement.com.my (primary) and ammanagement2012@gmail.com (new Settings key `contact.email_alt`) |
| Companies | Hidensypro Sdn. Bhd. (machinery), BM Magnitude Services (cleaning), CM Plantation Services (plantation), AM Multi Trade Empire (mini market), MA Travel and Tour Sdn. Bhd. (ticketing) |
| Seed | `npm run db:seed` loads settings, 6 companies, 18 services, 7 projects, 6 gallery photos, 3 news items and 4 jobs from `prisma/seed-data.json` |
| Banners | Inner-page banners are calm: no moving stripes, solid orange rule. Tape stripes outside the hero are static |
| Excluded | IC numbers, bank statements, EPF/SOCSO records, shareholdings and personal ages from the PDF are not used anywhere |

### Bugs fixed in v3
| Bug | Fix |
|---|---|
| API and dashboard rejected site-hosted image paths (`/images/...`), so seeded photos could not be edited | URL validators accept absolute URLs or `/path` |
| Seed script used `__dirname`, which crashes in an ES-module backend | Uses `import.meta.url` |
| Seed used a non-existent `prisma.gallery` model | Uses `prisma.galleryImage` |
| Client settings hook kept its own stale defaults (phone "+1 (234) 567-890", old address) | Hook now reuses the single settings module |
| Settings mapper crashed when no hero-banner key existed (`undefined.split`) | Guarded |


### Motion & animation (v3.1)
| Change | Detail |
|---|---|
| One motion language | Single easing curve `cubic-bezier(.22,1,.36,1)` and three durations (200 / 420 / 750 ms) used site-wide (`--am-ease`, `--am-dur-*`) |
| Scroll reveal | Section headings, cards and grids fade up once with a 70 ms stagger (`ScrollReveal`, `data-reveal`, `data-reveal-stagger`). Content is never hidden without JavaScript or with reduced motion; a scroll sweep reveals anything skipped by fast scrolling |
| Calmer hero | Hub ring 6 s → 14 s, light flow slower and sparser, pulses every 3.6 s, orbs float 3 px instead of 5 px, softer entrance with a light blur-in |
| Card hover | 4 px lift on desktop pointers only, no delay after the entrance |
| Charts | Home contract-value bars, Projects donut / state bars / timeline animate once in view |

### Motion bugs fixed
| Bug | Fix |
|---|---|
| Count-up numbers showed the final value, then jumped back to 0 when scrolled into view | Reset to 0 on mount; server still renders the final value |
| A glowing dot sat at the top-left of the hero diagram for the first 2 s | Pulse starts invisible until its animation begins |
| Stagger delay also delayed hover effects on cards | Delay removed once the entrance finishes |

### Please keep in mind
- Five appendix projects (Melekek, Sungai Petai, Kota Syahbandar, Bahau, Paya Rumput) have no status in the PDF; they are set to Completed.
- The Melaka housing and shop-office programme stays Ongoing although its end date (31 Jan 2026) has passed, as stated in the PDF.
- The CIDB certificate shows status "DORMAN"; the site states the registration and grade only.

---

## 10. Support

Iconic Soft Ltd. — *Your Vision, Our Code.*
https://iconicsoftltd.com
