# Afrimall

A production e-commerce platform built on Next.js 15 and Payload CMS — full catalog, cart, checkout, Stripe payments, and admin panel, deployed and processing real transactions.

**Live:** https://afrimall.app

---

## The problem

Most off-the-shelf e-commerce platforms (Shopify, WooCommerce) work fine until a merchant needs anything bespoke — custom product schemas, region-specific checkout flows, an admin experience tailored to their team. Afrimall was built for a client who needed full ownership of the stack: their own database, their own admin, their own deployment pipeline, and the ability to extend any part of the system without vendor approval.

The audience is direct-to-consumer brands that want commerce infrastructure they actually own.

---

## Architecture

```mermaid
flowchart TB
  Customer[Customer browser] -->|HTTPS| Next[Next.js 15<br/>App Router]
  Admin[Admin team] -->|/admin| Payload[Payload CMS<br/>admin UI]

  Next --> API[Payload REST + Local API]
  Payload --> API
  API --> PG[(PostgreSQL<br/>production)]
  API --> SQLite[(SQLite<br/>development)]

  Next -->|checkout session| Stripe[Stripe]
  Stripe -->|webhook| Webhook[/api/stripe/webhook/]
  Webhook --> API

  API -->|order confirmation| Email[Nodemailer<br/>SMTP]
  API --> Storage[S3-compatible<br/>media storage]

  Next -->|deploy| Vercel[Vercel]
```

Frontend (storefront) and admin (Payload) share a single Next.js app and a single database. Same codebase, same deploy, two surfaces.

---

## Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 (App Router) | Server components reduce client JS; same runtime serves storefront + Payload admin |
| CMS / API | Payload CMS 3.49 | Code-first schemas, generates TypeScript types, ships with admin UI for free |
| Database | PostgreSQL (prod) / SQLite (dev) | Payload abstracts both; dev gets zero-setup, prod gets relational guarantees |
| Payments | Stripe (Checkout + webhooks) | Hosted PCI scope, idempotent webhook delivery |
| Email | Nodemailer + SMTP | Provider-agnostic, no lock-in |
| Storage | S3-compatible (optional) | Falls back to local disk in dev |
| Hosting | Vercel | Native Next.js, preview deploys per branch |
| Language | TypeScript (strict) | Catches schema-drift bugs at compile time, especially with generated Payload types |

---

## Running locally

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL (production) — SQLite works for dev with zero setup

### Setup

```bash
git clone https://github.com/SuperiorKe/afrimall.git
cd afrimall
pnpm install

cp .env.example .env.local
# Edit .env.local — see required variables below
```

### Required environment variables

```env
# Database (omit DATABASE_URL to use SQLite in dev)
DATABASE_URL=postgresql://user:password@localhost:5432/afrimall

# Payload
PAYLOAD_SECRET=your-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (optional in dev)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

### Run

```bash
pnpm run generate:types   # generate Payload-typed TS from collections
pnpm run dev              # storefront + admin on http://localhost:3000
```

| URL | Surface |
|-----|---------|
| `/` | Storefront |
| `/admin` | Payload admin panel |
| `/api/*` | Payload REST API |

---

## Deployment

Deployed on Vercel. PostgreSQL is provisioned separately (any managed Postgres — Neon, Supabase, RDS).

```bash
pnpm run build             # Next.js production build + sitemap
pnpm start                 # production server
```

For CI, `pnpm run build:check` is a build-only verification with linting skipped — useful for preview deploys.

---

## Project layout

```
afrimall/
├── src/
│   ├── app/                  # Next.js App Router (storefront + admin routes)
│   ├── collections/          # Payload schemas (Products, Orders, Customers, ...)
│   ├── components/           # Storefront React components
│   ├── endpoints/            # Custom API routes
│   ├── payload.config.ts     # Payload root configuration
│   ├── payload-types.ts      # Generated — do not edit
│   └── plugins/              # Payload plugins (search, SEO, ...)
├── scripts/                  # Build, DB init, test helpers
├── public/
├── docs/                     # Architecture, deployment, guides
└── next.config.js
```

`payload-types.ts` is regenerated from `collections/` via `pnpm run generate:types`. Treat it as a build artifact.

---

## Scripts

```bash
pnpm run dev              # development
pnpm run build            # production build
pnpm start                # production server
pnpm run lint             # ESLint
pnpm run generate:types   # regenerate Payload types
pnpm run payload          # Payload CLI
```

---

Built by **Kenn Macharia** — [SuperiaTech](https://superiatech.vercel.app/)
