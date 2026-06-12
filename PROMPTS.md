# PROMPTS.md

A running log of the meaningful prompts/instructions behind this build and —
more importantly — **where my decisions differed from a literal reading of the
brief, and why**. (Mandated by the assignment.)

---

## Task 1 — Auth + RBAC (the state spine)

**Driving instruction:** _"Build Task 1 (Auth + RBAC) from the roadmap: hashed
seed users, a signal-based `AuthService` (single source of truth) with a 600 ms
mock login, mock-JWT in sessionStorage, refresh-rehydration, a reactive login
page with inline validation + skeleton + error state, two functional guards, and
role-based post-login redirects. Standalone + `inject()` only, cleanup via
`takeUntilDestroyed`."_

### Decisions that diverge from the literal brief

1. **Seed users: typed `const`, not `users.json`.**
   The brief allows "`users.json` *or* in-memory const." I chose a typed
   `SEED_USERS` const (`core/data/users.seed.ts`) so the `role` field is checked
   against the `'admin' | 'user'` union at **compile time**, with zero JSON-module
   build config. A JSON import widens `role` to `string` and forces an ugly
   `as unknown as SeedUser[]` cast. Passwords are still data, still SHA-256
   hashed, still separated from logic — just type-safe.

2. **`login()` shape.** The brief suggests `of(...).pipe(delay(600))`. Because
   password hashing is **async** (Web Crypto `crypto.subtle.digest`), I used
   `from(sha256Hex(pw)).pipe(delay(600), map(verify), tap(persistState))`. Same
   public contract — an `Observable` with ~600 ms latency — but it correctly
   folds the async hash into the stream instead of pretending hashing is sync.

3. **Mock JWT structure.** The brief's literal example is
   `btoa(JSON.stringify(payload))`. I built a proper 3-segment
   `header.payload.signature` base64url token (UTF-8 safe, constant placeholder
   signature) so it **decodes like a real JWT** and carries `iat`/`exp`. On
   rehydration the token is decoded *and* expiry-checked (1 h TTL); an
   expired/malformed token is discarded. More defensible to explain than a bare
   base64 blob.

4. **Kept `zone.js` (did not go zoneless).** Angular 20 offers zoneless, which
   pairs nicely with an all-signals design. I kept zone.js for this graded,
   "must-run" submission to avoid any edge case in reactive-form validation
   display. The architecture is still **fully signal-driven** (which is what's
   graded); zoneless is a low-risk future switch.

5. **Naming convention.** Angular 20.3 scaffolds the suffix-less style
   (`app.ts` → class `App`). I standardized the whole codebase on the **classic**
   convention (`AuthService`, `LoginComponent`, `auth.guard.ts`, …) — including
   renaming the generated root to `AppComponent` — to match the roadmap's
   vocabulary and what a live interviewer expects. One consistent style, not a mix.

6. **CDK exercised from Task 1.** UI approach is "Angular CDK + plain CSS." So the
   dependency isn't dead weight in Task 1, the login uses CDK's `LiveAnnouncer`
   to announce the signing-in state to screen readers. The heavier CDK use
   (Overlay side-panel) comes in Task 2.

7. **`/shop` guard = `authGuard` (any session).** Per the literal Task 1 spec,
   shop is protected by `authGuard`, so an **admin can also view the shop**. The
   mental-model diagram labels shop "user only," which would need a separate
   `userGuard` — out of Task 1 scope. The **Admin** nav link is admin-only; the
   **Shop** link shows for any signed-in user. `adminGuard` sends a signed-in
   non-admin to `/shop` (not back to login).

### Small UX additions beyond the brief
- Password reveal toggle (eye icon inside the field).
- Skip-to-content link + focus-visible rings + `prefers-reduced-motion` on the
  skeleton shimmer.

---

## Task 2 — Admin Panel

**Driving instruction:** _"Build Task 2 on the Task 1 state spine: a signal-based
`ProductStore`/`OrderStore`, a paginated sortable product table with debounced
search + category filter (`debounceTime` + `switchMap`), add/edit form, optimistic
delete with rollback + toast, a simulated stock WebSocket (`interval` + `Subject`)
patching badges without re-fetch; an orders view with status/date filters, a CDK
side-panel detail with inline status update; plus a summary analytics view. Each
section lazy-loaded under `/admin`."_

### Decisions that diverge / are worth noting

1. **One store pipeline, not per-control fetches.** AI's first cut wired search and
   category to separate subscriptions. I folded them into a single `query` signal
   driving one `debounceTime → switchMap` pipeline, so composed filters cancel
   stale requests and never double-fetch.
2. **Stock stream is one shared service.** Built `StockStreamService` (`interval` +
   `Subject`) as a singleton from the start, because Task 3's catalogue must reuse
   *the same* stream — not a second one. Stores patch the changed row by emitting a
   new object reference (OnPush-friendly), never re-fetching the list.
3. **Analytics is a pure read-model.** Every KPI is a `computed` over the shared
   stores — no fetches of its own — so admin numbers update live as order statuses
   change in the Orders view.

---

## Task 3 — User Storefront

**Driving instruction:** _"Build Task 3 on the same catalogue/order data: a
responsive card grid (OnPush card, shared stock stream, URL-synced filters,
skeletons/empty/retry), a resolver-preloaded detail page, a signal `CartService`
persisted to localStorage, and a guarded 3-step checkout (cart review with a pure
tax pipe, JSON-driven delivery form reusing the Task 2 renderer, payment with a
custom Luhn `ControlValueAccessor`), optimistic order submit → confirmation.
`@defer` the grid; log LCP/CLS via `PerformanceObserver`."_

### Decisions that diverge / are worth noting

1. **Load the catalogue once, derive client-side.** The brief implies per-filter
   fetches; dummyjson can't express multi-category + price-range + in-stock in one
   call, so I fetch the catalogue once and derive filtered pages with signals —
   fewer requests, instant filtering. Documented as a deliberate mock-limitation
   trade-off in `PERFORMANCE.md`.
2. **One dynamic-form renderer, two owners.** The renderer takes `(fields, group)`
   as inputs with no knowledge of the step/module — reused verbatim by the admin
   product form and both checkout forms (delivery + payment billing block).
3. **Checkout progress is in-memory by design.** Step completion lives in the
   `CheckoutService` (signals), not persisted — a refresh restarts checkout, which
   I judged acceptable for a demo over the complexity of persisting wizard state.

---

## Review & refinement session (post-build hardening)

A pass after a full requirements re-check against the brief. Each item is a prompt
I acted on, with the call I made — including **where I overrode the AI's first
instinct**.

1. **"username → email."** The brief says the login form has *email and password*.
   I'd built it around a `username` field; renamed the control + seed store + JWT
   payload to `email`, added `Validators.email`, and used the reserved
   `@store.example` TLD for the demo accounts. SHA-256 hashes unchanged.
   _Differed from AI:_ AI offered to keep `username` and "defend it" — I chose to
   match the brief literally instead, since it's a basic, explicitly-stated field.

2. **"Login must never scroll, any screen size."** Reworked the shell into a flex
   column that owns the viewport so `.app-main` fills the space below the appbar
   (no magic-number `calc`), then made the login card's spacing **vh-fluid
   (`clamp`)** so it shrinks to fit on short screens, with `overflow: hidden` as a
   hard no-scroll guarantee. _Differed from AI:_ AI's first fix kept a scroll
   safety-net; I asked for true shrink-to-fit and replaced it with fluid sizing.

3. **"Eye icon for password, inside the input."** Swapped the Show/Hide text for an
   inline eye/eye-off SVG, positioned as an in-field suffix (absolute, padded
   input). Kept the dynamic `aria-label` + `aria-pressed` and `aria-hidden` on the
   SVGs so the a11y behaviour didn't regress.

4. **"Brand link logs me out."** Root (`/`) always redirected to `/login`, so the
   brand bounced signed-in users to login. Made `/` a **functional role-aware
   redirect** (admin → `/admin`, user → `/shop`, else `/login`). _Differed from AI:_
   AI first suggested binding the brand link to a computed route; I fixed the
   redirect at the route level so *every* path to `/` is correct, not just the link.

5. **"Cards aren't uniform height."** The card title was the only variable-height
   element; reserved two lines (`min-height: 2.6em`) so every card matches across
   the grid, independent of row stretching.

6. **"'Signing in…' shows on every page."** The CDK `LiveAnnouncer` adds a
   `.cdk-visually-hidden` element to `<body>`, but the CDK ships that class only via
   a Sass mixin this plain-CSS project never included — so it rendered visibly.
   Added the canonical rule to `styles.css` (keeps the announcement, hides the box).

7. **"Delivery → payment sends me back to the cart."** Root cause: step 2's
   `<form (ngSubmit)>` imported neither `ReactiveFormsModule` nor bound `[formGroup]`
   on the form, so `ngSubmit` never fired and the submit button did a **native form
   post that reloaded the page**, wiping in-memory checkout state → the guard
   bounced to step 1. Bound the group to the host form; fixed the **same latent bug**
   in the admin product panel; and defaulted JSON `select` controls to their first
   option (an empty model under a `<select>` showing option 1 silently failed
   `required`).

8. **"DELETE /products/195 → 404."** dummyjson 404s for products it never persisted
   (e.g. ones added in-session). Treated a 404 on delete as **idempotent success**
   (keep the optimistic removal) and roll back only on genuine errors. _Differed
   from AI:_ AI also offered the stricter "skip the network for local rows" path; I
   chose the idempotent-404 reading as simpler and still spec-compliant.

9. **"Better visual for orders-by-status."** Replaced the proportion bars with a
   dependency-free **SVG donut** (100-unit-circumference trick) + legend with
   counts/percentages. No charting library — consistent with the plain-CSS approach.

10. **"Is tax required on the confirmation page?"** I had added a subtotal/tax/total
    breakdown there for consistency. On re-reading, tax is mandated **only** for the
    cart-review step (Step 1), so I **reverted** the confirmation page to a single
    Total. _Differed from AI:_ AI added the breakdown as a "polish"; I removed it to
    stay strictly within the brief's scope.

11. **"Lighthouse score is too low."** It was being run against `ng serve` (dev
    mode). Built and served the **production** artifact instead → catalogue route
    scores **Performance 98** (Accessibility 95 / Best Practices 96 / SEO 92).
    Screenshot in `docs/lighthouse.png`.
