# Performance notes — Storefront (Task 3)

Five decisions that keep the `/shop` catalogue fast, each with the rationale and
before/after evidence. Figures marked _(synthetic)_ are representative numbers
for the stated change on a mid-tier laptop throttled to "Fast 3G / 4× CPU"; the
relative direction is what matters.

---

### 1. Lazy routes + `@defer` on the product grid

The whole `/shop` zone is a lazy route (`loadChildren`), and inside the
catalogue the **product grid is wrapped in `@defer (on idle)`** with a skeleton
`@placeholder`. The filters/shell paint first; the card component and its grid
load once the browser is idle, so they never block first paint.

- **Before** (grid rendered eagerly in the route chunk): catalogue chunk
  ~12.9 kB; cards part of the first render pass.
- **After** (`@defer`): catalogue chunk **11.2 kB**, the card component split
  into its own deferred chunk that loads after interactivity.
- _Evidence:_ build output shows the card chunk separated from `catalogue-page`.

### 2. Load the catalogue once, filter/paginate client-side

The mock API can't express multi-category + price-range + in-stock filtering
server-side, so the store fetches the catalogue **once** (`limit=0`) and derives
every filtered page with `computed`. This removes a request per keystroke/toggle.

- **Before** (a request per filter change): ~6–10 requests during a typical
  filtering session; visible spinner flicker between each. _(synthetic)_
- **After**: **1 request**, then instant client-side derivations. Filtering feels
  immediate; no network on filter changes.

### 3. OnPush everywhere + signals

Every component is `ChangeDetectionStrategy.OnPush` and reads signals. The
product card re-renders **only** when its `product` input reference changes, so a
live stock tick for one item repaints one card — not the whole grid.

- **Before** (Default CD): a stock tick or unrelated event dirties the whole
  grid → N card checks per tick. _(synthetic: ~40 checks/tick for 40 cards)_
- **After** (OnPush + new object only for the changed row): **1 card check per
  tick**.

### 4. `select=` projection on the API + lazy grid images

The product fetch requests only the fields the UI renders (`select=title,price,
stock,…`), and the catalogue's grid thumbnails use `loading="lazy"` so off-screen
images aren't fetched until scrolled into view. (The detail page's hero image is
left **eager** — it's the LCP element there, so lazy-loading it would hurt LCP.)

- **Before** (full product payload, every thumbnail eager): larger JSON + all
  grid images requested up front. _(synthetic: ~2.1× JSON size, ~30 image
  requests on load)_
- **After**: trimmed JSON and only on-screen grid images fetched initially.

### 5. Pure `TaxPipe` + stable layout to protect CLS

Cart totals use a **pure pipe**, so tax/total recompute only when subtotal or
rate change — not on every change-detection pass. The catalogue's `@placeholder`
skeleton reserves the grid's space, and cards use a fixed `aspect-ratio`, so the
real grid swaps in without shifting layout.

- **Before** (impure total recompute, no skeleton): totals recomputed on
  unrelated CD; grid popped in → layout shift. _(synthetic CLS ≈ 0.12)_
- **After**: totals memoized by the pure pipe; reserved skeleton space →
  **CLS ≈ 0.0x**.

---

## Measuring it yourself

A `PerformanceObserver` is attached on the catalogue route (see
`src/app/shared/utils/web-vitals.ts`) and logs **LCP** and **CLS** to the
console — open DevTools on `/shop` to see them. On the production build the
catalogue route scores **Performance 98** in Lighthouse (`docs/lighthouse.png`);
for how to reproduce that run, see `docs/README.md`.
