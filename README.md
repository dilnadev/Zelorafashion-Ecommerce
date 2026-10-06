# Store

A production-grade e-commerce platform built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Supabase (Auth + Database + Storage), and Razorpay for payments.

## Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project
- A [Razorpay](https://razorpay.com) account (test mode is fine)

## Getting started

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API (server-only, never expose to the client) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` / `RAZORPAY_KEY_ID` | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys (server-only) |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard → Settings → Webhooks (set when the webhook endpoint is created) |

**Never commit `.env.local`** — it's already listed in `.gitignore`.

## Database setup

1. Open your Supabase project's **SQL Editor**.
2. Paste the contents of `supabase/migrations/20260924000000_init_schema.sql` and run it.
3. Verify: 20 tables exist, each has RLS enabled (shield icon), and the `product-images`, `brand-assets`, `media-library`, `avatars` storage buckets are present under **Storage**.

## Running the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the placeholder homepage, or [http://localhost:3000/dev/ui-preview](http://localhost:3000/dev/ui-preview) to see every design-system component and its animation.

## Project structure

```
app/                       Next.js App Router routes
  dev/ui-preview/          Design system smoke-test page (remove before launch)
components/
  ui/                      Reusable primitives: Button, Input, Modal, Toast, Skeleton
  providers/               AuthProvider, ToastProvider
  storefront/               (added in a later phase)
  admin/                     (added in a later phase)
lib/
  supabase/                Browser, server, and admin Supabase clients
  utils.ts                 cn, formatCurrency, slugify, formatDate, truncate
types/
  database.ts              Hand-written Supabase Database type (regenerate later via `supabase gen types typescript`)
  index.ts                 Domain types (Product, Order, etc.)
supabase/migrations/        SQL migration(s)
middleware.ts               Refreshes the Supabase auth session cookie
```

## Design system reference

Typography, color, spacing, and animation rules live in `docs/informations.md` (Section 1). Design tokens are implemented in `tailwind.config.ts`.

## Build roadmap

This project is being built in phases, following the spec's step order:

- [x] 1. Initialize Next.js 14 + TypeScript + Tailwind + Framer Motion
- [x] 2. Supabase client + auth provider
- [x] 3. Database schema (SQL migration)
- [x] 4. Design system primitives (Button, Input, Modal, Toast, Skeleton)
- [ ] 5. Storefront layout (Header, Footer, Cart Drawer)
- [ ] 6. Homepage
- [ ] 7. Product Listing Page
- [ ] 8. Product Detail Page
- [ ] 9. Cart, checkout, Razorpay integration
- [ ] 10. User account pages
- [ ] 11. Admin layout + dashboard
- [ ] 12. Admin product management
- [ ] 13. Admin order management
- [ ] 14. Admin settings, SEO, brand management
- [ ] 15. Remaining admin pages (customers, coupons, media, analytics)
- [ ] 16. Search
- [ ] 17. Final polish (loading/error/empty states, 404 page)
