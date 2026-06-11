import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Allows any authenticated session through. An unauthenticated visitor is
 * redirected to /login with a `returnUrl` so they bounce back after signing in.
 *
 * Functional guard (`CanActivateFn`) + `inject()` — no class, no constructor DI.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
