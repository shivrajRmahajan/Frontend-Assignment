import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { CheckoutService } from '../../../core/services/checkout.service';

/**
 * Prevents deep-linking to a checkout step before the prior step is complete.
 * The step number comes from the route's `data.step`; if it isn't reachable
 * yet, redirect to the furthest step the user is actually allowed to be on.
 */
export const checkoutStepGuard: CanActivateFn = (route) => {
  const checkout = inject(CheckoutService);
  const router = inject(Router);

  const step = Number(route.data['step'] ?? 1);
  if (checkout.canEnterStep(step)) {
    return true;
  }

  const target = !checkout.reviewed() ? 1 : 2;
  return router.createUrlTree(['/shop/checkout/step', target]);
};
