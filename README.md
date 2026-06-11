# Storefront RBAC — Angular Frontend Assignment

A role-gated Angular workspace: **one auth/state spine, two protected zones**
(`/admin`, `/shop`). This repo currently implements **Task 1 — Auth + RBAC** in
full; the Admin (Task 2) and Shop (Task 3) zones are scaffolded as lazy,
guarded placeholders ready to build out.

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
these plain-text values are for the demo. On the login screen you can also click a
**demo chip** to fill the form.

| Username | Password    | Role  | Lands on |
| -------- | ----------- | ----- | -------- |
| `admin1` | `Admin@123` | admin | `/admin` |
| `admin2` | `Admin@234` | admin | `/admin` |
| `user1`  | `User@123`  | user  | `/shop`  |
| `user2`  | `User@234`  | user  | `/shop`  |

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
| Signed in as user  | → `/shop`             | ✅ allowed           |
| Signed in as admin | ✅ allowed            | ✅ allowed           |

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

- ✅ **Task 1 — Auth + RBAC** (this delivery)
- ⏳ **Task 2 — Admin** (products, orders, analytics) — zone scaffolded
- ⏳ **Task 3 — Shop** (catalogue, detail, cart, checkout) — zone scaffolded

See `PROMPTS.md` for the build log and where decisions diverged from the brief.
