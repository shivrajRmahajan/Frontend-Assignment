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
- Password show/hide toggle.
- "Demo accounts — click to fill" chips, so a grader can sign in in one click.
- Skip-to-content link + focus-visible rings + `prefers-reduced-motion` on the
  skeleton shimmer.

---

_Task 2 (Admin) and Task 3 (Shop) prompts/decisions will be appended here as they
are built._
