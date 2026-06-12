# Docs — submission artifacts

This folder holds the required artifacts: the Lighthouse screenshot
(`lighthouse.png`) and the app screenshots (`screenshots/`). Both are committed —
they were captured manually from the running app (they can't be generated from
source). The steps below document how to reproduce them.

## Lighthouse — `docs/lighthouse.png` (target ≥ 85; achieved 98)

1. Build and serve the **production** bundle (Lighthouse must run against prod,
   not the dev server). Use a static server with SPA fallback so deep links
   resolve:
   ```bash
   npm run build
   npx serve -s dist/frontend-assignment/browser -l 4200
   ```
2. Open Chrome at `http://localhost:4200`, sign in as a **user**
   (`priya@store.example` / `User@123`) and navigate to `/shop`.
3. DevTools → **Lighthouse** tab → Categories: Performance. **Uncheck "Clear
   storage"** — `/shop` is behind the auth guard, so clearing storage would log
   you out and measure `/login` instead → **Analyze page load**.
4. Screenshot the score summary and save it as **`docs/lighthouse.png`**.

> The catalogue logs **LCP** and **CLS** to the console via `PerformanceObserver`
> (`src/app/shared/utils/web-vitals.ts`) — handy while tuning. See
> `PERFORMANCE.md` for the optimisation decisions.

## App screenshots — `docs/screenshots/`

Captured flows demonstrating the application:

- `01-login.png` — login screen (email + password)
- `02-admin-products.png` — admin product table (sort / search / filter)
- `03-admin-orders.png` — orders table (status + date filters, sortable columns)
- `04-admin-analytics.png` — analytics KPIs + orders-by-status donut
- `05-shop-catalogue.png` — storefront grid with filters
- `06-shop-detail.png` — product detail with related products
- `07-checkout-cart.png` — cart review (subtotal / tax / total)
- `08-checkout-delivery.png` — JSON-driven delivery form (conditional field shown)
- `09-checkout-payment.png` — payment step (custom card input)
- `10-order-confirmation.png` — confirmation page

## Login credentials (for reviewers)

| Email                 | Password    | Role  | Lands on |
| --------------------- | ----------- | ----- | -------- |
| `aisha@store.example` | `Admin@123` | admin | `/admin` |
| `priya@store.example` | `User@123`  | user  | `/shop`  |
