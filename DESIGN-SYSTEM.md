# AM Management — Design System (v2.0)

## Idea
A Malaysian multi-sector group whose roots are construction. The visual language borrows from the site itself:
**blueprint sheets** (dark drafting-grid surfaces) and **safety barrier tape** (orange/navy diagonal stripes).
The tape is the one bold element; everything around it stays quiet, navy and white.

## Tokens (`frontend/src/app/globals.css`)
| Token | Hex | Use |
|---|---|---|
| `--am-navy` / `primary` | `#234279` | brand, buttons, icons |
| `--am-harbour` | `#0F2447` | hero, footer, dark bands, headings |
| `--am-signal` / `secondary` | `#FB731F` | tape, CTAs, active states (use sparingly) |
| `--am-steel` / `muted` | `#EEF2F7` | alternate section ground |
| `--am-line` / `border` | `#D8DEE8` | hairlines |
| `--am-slate` / `muted-foreground` | `#56627A` | secondary text |

Radius `0.5rem` (tighter, more corporate than the old 0.625rem pill look).

## Type
- **Sora** (500–700) for headings and the hero title — geometric, refined, readable at modest sizes.
- **Archivo** variable for body text, labels and UI.
Both loaded with `next/font`. Scale: hero title 1.75 → 2.5rem; page banner 1.6 → 2.35rem; section titles 1.5 → 2.1rem; weight 600.

## Spacing
Sections `py-12 lg:py-16`; section header margin `mb-8 md:mb-10`; page banners `py-9 lg:py-12`.

## Utilities
| Class | What |
|---|---|
| `container-am` | 80rem content width with responsive gutters |
| `bg-blueprint` | harbour navy + two-scale drafting grid |
| `tape-hazard` | animated diagonal safety stripes |
| `font-display` | Sora 600, tight tracking, for hero-scale type |
| `am-rise` | one-time entrance (hero & banners only) |
| `am-marquee` / `am-marquee-reverse` | ticker tracks (pause on hover) |

All motion is disabled under `prefers-reduced-motion`.

## Components (`frontend/src/components/theme/`)
- `TickerTape` — premium ribbon ticker: gradient body, fine inner rules, light sheen, tracked small caps, star separators (tone: signal / harbour / light).
- `HazardTape` — thin animated stripe rule.
- `SectionHeader` — tape swatch + kicker, title, intro, optional right-side action.
- `CountUp` — in-view number animation, SSR-safe (renders final value first).
- `useInView`, `usePrefersReducedMotion` — hooks.

## Page map
| Area | File |
|---|---|
| Home hero + infographic + tapes | `home/Banner/Banner.tsx`, `GroupInfographic.tsx` |
| Figures infographic | `home/Statistics/Statistics.tsx` (pictogram unit: 1 block = RM 100K) |
| Inner page banner (all pages) | `About/AboutBanner/AboutBanner.tsx` |
| Company page banner | `companies/CompanyBanner/CompanyBanner.tsx` (uses company cover image) |
| Header / footer | `shared/TopNavbar.tsx`, `shared/Navbar.tsx`, `shared/Footer.tsx` |

## Content
Site copy is unchanged from v1. Figures shown (10+, 6+, RM 2.66M, RM 500K, G5, 2012) are the ones already published on the old site — update them in `Statistics.tsx` / `Banner.tsx` when they change.

## Motion
- Easing `--am-ease: cubic-bezier(.22,1,.36,1)`; durations `--am-dur-fast` 200 ms, `--am-dur` 420 ms, `--am-dur-slow` 750 ms.
- Entrances: hero `am-rise` (fade, 14 px rise, 4 px blur-in); sections `data-reveal` / `data-reveal-stagger` via `components/theme/ScrollReveal.tsx`.
- Loops are limited to the hero (orbit rings, orbs, flow, tapes) and stay slow.
- Hover: `.am-lift` (4 px, desktop only).
- `prefers-reduced-motion`: all loops off, nothing hidden, numbers shown final.
