# Inventory Management Frontend — Minu Marketing Pvt Ltd

Frontend for the inventory management system. Next.js 16 (App Router) · TypeScript · Tailwind · shadcn/ui · Redux Toolkit + RTK Query.

## Setup

```bash
git clone <repo-url>
cd inventory-frontend
npm install
cp .env.example .env   # fill in values below
npm run dev
```

Runs at `http://localhost:3000`.

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Pages

- `/login` — sign in
- `/signup` — create an account
- `/dashboard` — overview: stats, inventory chart, low-stock alerts, recent transactions
- `/products` — product list with search, sort, pagination
- `/low-stock` — low-stock alert feed with restock action
- `/transactions` — full stock movement history

## Tech

- **Next.js App Router** — server + client components
- **RTK Query** — API layer with tag-based cache invalidation
- **shadcn/ui** — UI primitives (Card, Button, Dialog, Tabs, etc.)
- **Tailwind CSS** — styling
- **Redux Toolkit** — global auth state
- **Lucide** — icons

## API Integration

All requests go through RTK Query slices under `src/lib/features/api/`. The base URL is read from `NEXT_PUBLIC_API_URL`.



Cache invalidation uses tags (`Product`, `Transaction`) so any mutation (create/update/delete/stock in/out) automatically refreshes the list, low-stock feed, and dashboard.

## Deployment

```bash
npm install
npm run build
npm start
```

Set `NEXT_PUBLIC_API_URL` on your host to the deployed backend URL.

For Vercel: connect the repo, add `NEXT_PUBLIC_API_URL` in Project Settings → Environment Variables, deploy. No extra config needed.

---

© 2026 Minu Marketing Pvt Ltd