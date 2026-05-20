# Maple Leaf landings

Standalone HTML/CSS/JS pages for the summer recovery **fundraiser** and **t-shirt preorder**. Deploy this folder as its own Vercel project (or mirror to a separate Git repo).

## Subdomains

Configure two domains on the Vercel project:

| Host | Content |
|------|---------|
| `give.mapleleafcommunity.org` | `/fundraise/*` |
| `shop.mapleleafcommunity.org` | `/tshirt/*` |

[`vercel.json`](vercel.json) rewrites by host. Adjust hostnames if yours differ.

## Environment (Vercel — landings project)

| Variable | Description |
|----------|-------------|
| `MLCC_API_BASE_URL` | Dashboard Next.js URL (e.g. `https://dashboard.example.com`) |
| `MLCC_LANDING_RETURN_ORIGIN` | Optional. Override `returnOrigin` for Stripe success URLs (defaults to `https://$VERCEL_URL` on build) |

Build command: `npm run build` (writes `shared/js/config.js`).

## Environment (dashboard — main repo)

See root [`.env.example`](../.env.example) commerce section. Required:

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `STRIPE_DONATION_PRODUCT_ID`, `STRIPE_PRICE_DONATION_10`, `_40`, `_100`
- `STRIPE_TSHIRT_PRODUCT_ID`, `STRIPE_TSHIRT_PRICE_ID` (or `STRIPE_TSHIRT_PRICE_CENTS`)
- `MLCC_LANDING_ORIGINS` — comma-separated landing origins for CORS
- `FUNDRAISER_GOAL_CENTS` (default `2500000` = $25,000)
- `SUPABASE_SERVICE_ROLE_KEY` for webhook writes
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` for confirmation emails

### Create Stripe products

```bash
STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup-commerce-products.mjs
```

Paste printed IDs into dashboard env.

### Stripe webhook

Dashboard → Developers → Webhooks → Add endpoint:

- URL: `https://<DASHBOARD_HOST>/api/webhooks/stripe`
- Event: `checkout.session.completed`
- Signing secret → `STRIPE_WEBHOOK_SECRET`

### Supabase migration

Apply [`supabase/migrations/20260519120000_commerce_landings.sql`](../supabase/migrations/20260519120000_commerce_landings.sql) in the Supabase SQL editor or `supabase db push`.

## Local development

1. Dashboard: `npm run dev` with env vars set.
2. Landings: copy `shared/js/config.example.js` to `shared/js/config.js` and set `apiBase` to `http://localhost:3000`.
3. Serve landings with any static server from this folder, e.g. `npx serve .` — open `/fundraise/index.html` or `/tshirt/index.html`.
4. Add `http://localhost:3000` is not needed for CORS if you use `http://127.0.0.1:PORT` — add your static origin to `MLCC_LANDING_ORIGINS` (e.g. `http://localhost:8080`).

## Flows

- **Fundraiser**: preset $10 / $40 / $100 or custom amount → Stripe Checkout → webhook → `fundraising_donations` + optional Resend thank-you.
- **T-shirt**: multi-size cart → contact form → Checkout Session (one line item, size breakdown in metadata) → webhook → `tshirt_preorders` + confirmation email.

View orders in the dashboard under **Commerce**.
