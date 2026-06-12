import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, delay, from, map, tap } from 'rxjs';

import { SEED_USERS } from '../data/users.seed';
import { AuthUser, LoginCredentials, Role } from '../models/user.model';
import { sha256Hex } from '../utils/crypto.util';
import { createMockJwt, decodeMockJwt, isExpired } from '../utils/jwt.util';

/** sessionStorage key for the mock JWT. */
const TOKEN_STORAGE_KEY = 'fa.auth.token';

/** Artificial latency so the UI's loading state is real and demonstrable. */
const LOGIN_LATENCY_MS = 600;

/**
 * Single source of truth for identity.
 *
 * State lives in SIGNALS (synchronous, glitch-free derived reads via `computed`)
 * — guards, the shell and feature views all read these. The async login
 * round-trip is modelled as an OBSERVABLE; once it resolves, the result is
 * folded back into the signals. No component ever holds its own copy of the user.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  /** Writable backing signal — private so only this service mutates identity. */
  private readonly _currentUser = signal<AuthUser | null>(this.restoreSession());

  /** The signed-in user, or null when signed out. */
  readonly currentUser = this._currentUser.asReadonly();

  /** Derived role; null when signed out. */
  readonly role = computed<Role | null>(() => this._currentUser()?.role ?? null);

  /** Derived auth flag — read by the route guards and the shell. */
  readonly isAuthenticated = computed<boolean>(() => this._currentUser() !== null);

  /** Convenience derivation for admin-only UI. */
  readonly isAdmin = computed<boolean>(() => this.role() === 'admin');

  /**
   * Authenticate against the mock user store.
   *
   * Hashes the password (Web Crypto), simulates a 600ms network round-trip,
   * then verifies by digest comparison. On success it persists a mock JWT to
   * sessionStorage and updates the identity signal. Emits the user on success,
   * or errors with a friendly message on bad credentials.
   */
  login(credentials: LoginCredentials): Observable<AuthUser> {
    const email = credentials.email.trim().toLowerCase();

    return from(sha256Hex(credentials.password)).pipe(
      delay(LOGIN_LATENCY_MS),
      map((passwordHash) => {
        const match = SEED_USERS.find(
          (u) => u.email.toLowerCase() === email && u.passwordHash === passwordHash,
        );
        if (!match) {
          throw new Error('Invalid email or password.');
        }
        const user: AuthUser = { email: match.email, name: match.name, role: match.role };
        return user;
      }),
      tap((user) => {
        this.persistSession(user);
        this._currentUser.set(user);
      }),
    );
  }

  /** Clear the session and return to the login screen. */
  logout(): void {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    this._currentUser.set(null);
    void this.router.navigate(['/login']);
  }

  /** Default landing route for a role — used by the post-login redirect. */
  homeRouteFor(role: Role): string {
    return role === 'admin' ? '/admin' : '/shop';
  }

  // --- session persistence -------------------------------------------------
  // sessionStorage (not localStorage): identity is scoped to the tab and dies
  // when the tab closes. The cart (Task 3) will use localStorage instead,
  // because a shopping cart should survive a tab close.

  private persistSession(user: AuthUser): void {
    const token = createMockJwt(user, this.nowSeconds());
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  /**
   * Rehydrate identity from a previously stored token so a full-page refresh
   * keeps the user logged in. An expired or malformed token is discarded.
   */
  private restoreSession(): AuthUser | null {
    const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      return null;
    }
    const payload = decodeMockJwt(token);
    if (!payload || isExpired(payload, this.nowSeconds())) {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    return { email: payload.email, name: payload.name, role: payload.role };
  }

  private nowSeconds(): number {
    return Math.floor(Date.now() / 1000);
  }
}
