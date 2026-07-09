# Alltagshilfe Manager

A SaaS admin app for small/medium German home-care and everyday-assistance providers (haushaltsnahe Dienstleistungen, Betreuung nach § 45a/§ 45b SGB XI). Manages customers, insurers (Kranken-/Pflegekassen), a service catalog, invoices/offers, staff, and daily tour/route planning.

Implemented from a Claude Design UI prototype (see `project/` and `chats/` for the original design source and brief) as a full-stack app:

- **apps/web** — React 19 + TypeScript + Vite frontend, React Router, TanStack Query, Clerk auth
- **apps/api** — Express + TypeScript + Prisma REST API, PostgreSQL, Clerk auth middleware, file uploads (documents)

## Prerequisites

- Node.js 20+
- PostgreSQL 16 (local install or Docker)
- A [Clerk](https://clerk.com) application (free tier is fine) for authentication — you need a **Publishable key** and **Secret key** from the Clerk dashboard

## Setup

1. **Install dependencies** (from the repo root, npm workspaces):
   ```
   npm install
   ```

2. **Start PostgreSQL.** Either via Docker:
   ```
   docker compose up -d postgres
   ```
   or point `DATABASE_URL` at any existing Postgres 16 instance.

3. **Configure environment variables:**
   ```
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```
   Then edit both `.env` files:
   - `apps/api/.env`: set `DATABASE_URL` (defaults match the docker-compose service), `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`.
   - `apps/web/.env`: set `VITE_CLERK_PUBLISHABLE_KEY` (same publishable key as the API) and `VITE_API_URL` if not running the API on `localhost:4000`.

   Both `CLERK_PUBLISHABLE_KEY`/`VITE_CLERK_PUBLISHABLE_KEY` must be the **same** key from your Clerk dashboard. Without real keys, the app will run but auth (and therefore all API calls) will fail — see "Auth notes" below.

4. **Run database migrations and seed demo data:**
   ```
   npm run db:migrate -w apps/api
   npm run db:seed -w apps/api
   ```
   This creates 8 sample customers, 6 insurers, 8 catalog services, 6 staff members, a day of tour assignments, 6 invoices/offers, tasks, and requests — matching the original design's demo data.

5. **Run the app** (two terminals):
   ```
   npm run dev:api    # http://localhost:4000
   npm run dev:web    # http://localhost:5173
   ```

## Project structure

```
apps/
  api/
    prisma/schema.prisma   # data model (customers, insurers, services, invoices, staff, tours, tasks, requests)
    prisma/seed.ts         # demo data matching the design
    src/routes/            # REST CRUD endpoints per resource
    src/middleware/auth.ts # Clerk session verification
  web/
    src/pages/              # one folder per screen (dashboard, customers, insurers, services, invoices, staff, tours)
    src/api/                 # typed fetch hooks (TanStack Query) per resource
    src/components/ui/       # design-system primitives (Badge, Button, Modal, Card, form fields, states)
    src/components/layout/   # Sidebar, Topbar, page header context, appearance settings modal
    src/theme/                # accent color + light/dark sidebar theme (persisted, matches design's "tweaks")
```

## What's implemented

All seven areas from the design, each with full CRUD (not just the prototype's read-only demo):

- **Dashboard** — KPI tiles, weekly workload chart, today's tours, task checklist, new-request accept/decline
- **Kunden (customers)** — list with status filters, detail page (relief budget § 45b, contacts, service history, document upload/download), create/edit/delete
- **Kostenträger (insurers)** — table with IK number, contact, billing method, create/edit/delete
- **Leistungskatalog (service catalog)** — category-filterable table, create/edit/delete
- **Angebote & Rechnungen (offers/invoices)** — list + live document preview, line-item editor, status workflow, create/edit/delete
- **Mitarbeiter (staff)** — card grid with qualifications and computed weekly utilization, create/edit/delete
- **Tourenplanung (route planning)** — day timeline per staff member with positioned assignment blocks, create/edit/delete

The relief budget (Entlastungsbetrag § 45b, 125 €/month) and staff utilization are computed live from actual service records / tour assignments rather than stored as static numbers.

## Auth notes

Auth is handled entirely by Clerk — sign-in/sign-up UI, session tokens, and backend verification (`@clerk/express` middleware protecting every `/api/*` route). There's no built-in bypass: until you configure real Clerk keys, the frontend will fail to initialize and the API will reject all requests. This is intentional — get your keys from the [Clerk dashboard](https://dashboard.clerk.com/last-active?path=api-keys) and the app works out of the box.

## Design fidelity notes

A few deliberate departures from the static prototype, since it's now a real app with a backend:

- The topbar's generic "+ Neu" button was dropped — each screen already has its own contextual create action, and a non-functional duplicate button would be confusing in a real product.
- "Woche" view in Tourenplanung is present but not wired up (day view is fully functional), matching the original prototype's scope — it wasn't implemented there either.
- The "Gefahrene Kilometer" (est. driving distance) stat was dropped from the tour summary rather than fabricating a number with no real routing data behind it; the map panel is still a labeled placeholder, as in the original design.
- Accent color and sidebar light/dark theme are preserved as real, persisted settings (via the gear icon in the sidebar), matching the prototype's configurable "tweaks".
