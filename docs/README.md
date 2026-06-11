# Docs — required artifacts

The submission checklist asks for a Lighthouse screenshot and app screenshots.
These are **captured manually from the running app** (they can't be generated
from source). Steps below.

## Lighthouse — `docs/lighthouse.png` (target ≥ 85)

1. Build and serve a production bundle (Lighthouse should run against prod, not
   the dev server):
   ```bash
   npm run build
   npx http-server dist/frontend-assignment/browser -p 4200
   ```
2. Open Chrome at `http://localhost:4200`, sign in as a **user** (`user1` /
   `User@123`) and navigate to `/shop`.
3. DevTools → **Lighthouse** tab → Categories: Performance → **Analyze page load**.
4. Screenshot the score summary and save it as **`docs/lighthouse.png`**.

> The catalogue logs **LCP** and **CLS** to the console via `PerformanceObserver`
> (`src/app/shared/utils/web-vitals.ts`) — handy while tuning. See
> `PERFORMANCE.md` for the optimisation decisions.

## App screenshots — `docs/screenshots/`

Capture these flows (PNG) and drop them in `docs/screenshots/`:

- `01-login.png` — login screen
- `02-admin-products.png` — admin product table (sort/search/filter)
- `03-admin-orders.png` — orders table with the detail side-panel open
- `04-admin-analytics.png` — analytics KPIs
- `05-shop-catalogue.png` — storefront grid with filters applied (note the URL)
- `06-shop-detail.png` — product detail with related products
- `07-checkout-delivery.png` — JSON-driven delivery form (show the conditional field)
- `08-checkout-payment.png` — payment step with a Luhn error visible
- `09-order-confirmation.png` — confirmation page

## Login credentials (for reviewers)

| Username | Password    | Role  | Lands on |
| -------- | ----------- | ----- | -------- |
| `admin1` | `Admin@123` | admin | `/admin` |
| `user1`  | `User@123`  | user  | `/shop`  |
