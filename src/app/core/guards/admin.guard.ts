import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Admin-only access.
 *   - Unauthenticated      → /login (with returnUrl)
 *   - Authenticated, !admin → their own zone (/shop), not the login page
 *   - Authenticated admin   → allowed
 *
 * Stacks after `authGuard` on the route, but re-checks auth so it is also
 * correct if used on its own.
 */
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  if (auth.isAdmin()) {
    return true;
  }
  return router.createUrlTree(['/shop']);
};
