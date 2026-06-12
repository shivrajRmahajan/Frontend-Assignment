# Storefront RBAC — Angular Frontend Assignment

A role-gated Angular workspace: **one auth/state spine, two protected zones**
(`/admin`, `/shop`). All three tasks are implemented: **Task 1 — Auth + RBAC**,
**Task 2 — Admin panel** (products, orders, analytics), and **Task 3 — Storefront**
(catalogue, detail, cart, JSON-driven checkout).

- **Angular 20.3**, standalone APIs (no NgModules)
- **Signals** for state · **RxJS** for the async login round-trip
- **Angular CDK** (a11y) + hand-written **plain CSS**
- `inject()` everywhere (no constructor DI) · `takeUntilDestroyed` cleanup

---

## Getting started

```bash
npm install
npm start          # ng serve → http://localhost:4200
```

```bash
npm run build      # production build (type-checks templates + strict mode)
npm test           # unit tests (Karma + Jasmine)
```

> **Secure-context note:** login hashing uses the Web Crypto API
> (`crypto.subtle`), which the browser only exposes on a secure origin.
> `http://localhost` counts as secure, so `ng serve` works out of the box.

---

## Login credentials

Passwords are stored only as **SHA-256 hashes** (`src/app/core/data/users.seed.ts`);
the plain-text values below are for the demo only.

| Email                 | Password    | Role  | Lands on |
| --------------------- | ----------- | ----- | -------- |
| `aisha@store.example` | `Admin@123` | admin | `/admin` |
| `rohan@store.example` | `Admin@234` | admin | `/admin` |
| `priya@store.example` | `User@123`  | user  | `/shop`  |
| `karan@store.example` | `User@234`  | user  | `/shop`  |

---

## Architecture — the auth spine

`AuthService` (`providedIn: 'root'`) is the **single source of truth** for identity.
No component keeps its own copy of the user.

- **State lives in signals**, async lives in observables.
  `currentUser` is a writable signal (private); `role`, `isAuthenticated` and
  `isAdmin` are `computed` derivations. UI role-toggling is synchronous derived
  state → signals give glitch-free reads with no manual subscribe/unsubscribe.
  The **login round-trip** is the one genuinely async step, so it stays an
  `Observable` (`from(hash).pipe(delay(600), …)`).
- **Mock JWT in `sessionStorage`.** On success we build a 3-segment
  `header.payload.signature` base64url token (`iat`/`exp`, 1 h TTL) and store it.
  `sessionStorage` (not `localStorage`) scopes identity to the tab — closing the
  tab ends the session. The constructor **rehydrates** from a stored token
  (and discards it if expired/malformed), so a refresh keeps you signed in.
- **Two functional guards.** `authGuard` allows any session, else redirects to
  `/login?returnUrl=…`. `adminGuard` requires the `admin` role; a signed-in
  non-admin is sent to `/shop`, a signed-out visitor to `/login`. Both use
  `inject()` and `createUrlTree` (no imperative navigation inside the guard).
- **Role-based redirect.** After login the page honours a guard's `returnUrl`
  if present, otherwise routes by role (admin → `/admin`, user → `/shop`).

### RBAC behaviour

| Visitor            | `/admin`              | `/shop`              |
| ------------------ | --------------------- | -------------------- |
| Signed out         | → `/login?returnUrl`  | → `/login?returnUrl` |
| Signed in as user  | → `/shop`             | allowed              |
| Signed in as admin | allowed               | allowed              |

### Project structure

```
src/app/
  core/                    app-wide singletons (depend on nothing inward)
    models/user.model.ts
    data/users.seed.ts     hashed mock user "table"
    utils/                 crypto.util.ts (SHA-256), jwt.util.ts (mock JWT)
    services/auth.service.ts
    guards/                auth.guard.ts, admin.guard.ts
  shared/                  reusable dumb pieces
    components/skeleton/   shimmer placeholder (reused in Tasks 2–3)
  features/
    auth/login/            reactive login (OnPush, skeleton, inline validation)
    admin/                 lazy zone (authGuard + adminGuard)  — Task 2
    shop/                  lazy zone (authGuard)               — Task 3
  app.component.*          shell: role-aware nav + logout
  app.routes.ts            top-level routes + guard wiring
```

Dependency direction points **inward**: `features → core`, never the reverse.

### Why these choices (interview anchors)

- **Signals over observables for auth state** — synchronous derived UI state with
  glitch-free `computed`, no subscription bookkeeping. Observables kept for the
  async login call only.
- **`sessionStorage` not `localStorage`** — session-scoped identity. (Task 3's
  cart will use `localStorage`, because a cart should survive a tab close.)
- **OnPush on the login form** — no `@Input`s to diff; the only changes are
  reactive-form events Angular already tracks plus three local signals, so OnPush
  removes wasted change-detection passes. (Each OnPush component carries a comment
  justifying it.)
- **Functional `CanActivateFn` guards** — tiny, tree-shakable, `inject()`-based,
  no guard classes.

---

## Known limitations (by design, for this assignment)

- The mock JWT is **not signed/verified** — there is no backend. It mimics JWT
  shape for the flow; never treat it as secure.
- Users are an in-memory seed list, not a real datastore.
- No refresh-token / silent-renew; the 1 h token simply expires.

---

## Roadmap status

- **Task 1 — Auth + RBAC** — signal `AuthService`, two functional guards,
  mock JWT in `sessionStorage`, reactive login (OnPush + skeleton).
- **Task 2 — Admin** — products (sortable/paginated table, debounced search +
  category filter via `debounceTime`/`switchMap`, optimistic delete + toast,
  live stock badges, add/edit via the shared dynamic form); orders (filterable
  sortable table, detail side-panel, inline status via shared store); analytics
  (KPIs `computed` from the shared stores). Each section is a lazy route.
- **Task 3 — Shop** — catalogue (responsive grid, multi-select/price/in-stock
  filters reflected in the URL, OnPush cards, live stock, `@defer` grid); detail
  (route-resolver preload, qty stepper, related products, out-of-stock "Notify
  me"); cart (signal `CartService`, localStorage, live nav badge); checkout (3
  guarded lazy steps, pure tax pipe, JSON-driven delivery form, Luhn
  `ControlValueAccessor`, optimistic submit → confirmation).

## Testing & performance

```bash
npm test    # unit tests — Luhn validator + visibleWhen predicate (headless Chrome)
```

A `PerformanceObserver` logs **LCP/CLS** on the catalogue route. See
`PERFORMANCE.md` for the five optimisation decisions and `docs/README.md` for how
to capture the Lighthouse score and app screenshots.

## Shared building blocks

- **`DynamicFormComponent`** (`shared/components/dynamic-form`) — config-driven
  renderer taking a `FieldConfig[]` + `FormGroup`, reused by the Task 2 product
  form and the Task 3 checkout (built from `/assets/checkout-form.json`).
- **`StockStreamService`** — one simulated stock feed shared by the admin table
  and the storefront cards.
- **`OrderStore`** — shared by the admin Orders view and the checkout (which
  appends new orders to it).

See `PROMPTS.md` for the build log and where decisions diverged from the brief.
