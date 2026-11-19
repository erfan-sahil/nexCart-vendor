# NexCart Vendor

Seller dashboard for managing store profile, products, inventory, orders, returns, earnings, and payouts.

## Stack

- **Vite 6**
- **React 19** + TypeScript
- **React Router 8**
- **Tailwind CSS v4** + shadcn/ui (+ Sonner toasts)
- **TanStack Query** + Table, **axios**
- **React Hook Form** + Zod

## Prerequisites

- Node.js **≥ 20**
- [NexCart API](../../backend/nexCart-backend/README.md)
- An approved vendor account and store (apply via storefront `/sell` or seed data)

## Getting started

```bash
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:5175**.

### Environment

`.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

## Scripts

| Script                            | Description                   |
| --------------------------------- | ----------------------------- |
| `npm run dev`                     | Dev server (port **5175**)    |
| `npm run build`                   | Typecheck + production bundle |
| `npm run preview`                 | Preview production build      |
| `npm run lint` / `lint:fix`       | ESLint (max warnings 0)       |
| `npm run format` / `format:check` | Prettier                      |
| `npm run typecheck`               | `tsc --noEmit`                |
| `npm run check`                   | lint + format + typecheck     |

## Feature areas

| Section   | Paths                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard | `/`                                                                                                                                                     |
| Store     | `/store/profile`, `/store/products`, `/store/products/new`, `/store/products/:productId/edit`, `/store/inventory`, `/store/reviews`, `/store/discounts` |
| Orders    | `/orders` (with status sub-routes), `/orders/returns`                                                                                                   |
| Finance   | `/finance/earnings`, `/finance/transactions`, `/finance/withdrawals`                                                                                    |
| Analytics | `/analytics`                                                                                                                                            |
| Settings  | `/settings/business-profile`, `/settings/payout-details`                                                                                                |
| Auth      | `/login`                                                                                                                                                |

Vendor routes are guarded after login; product create/edit flows live under `/store/products`.

## Project layout

```
src/
  app/              Navigation and router
  pages/            Route-level screens
  features/         Products, orders, store, payout, etc.
  components/       Sidebar layout and shared UI
  lib/api/          Axios client and media URLs
```

## Related apps

- **Storefront:** [nexCart-frontend](../nexCart-frontend/README.md) — http://localhost:3000
- **Admin:** [nexCart-admin](../nexCart-admin/README.md) — http://localhost:5174

## Add UI components

```bash
npx shadcn@latest add table
```
