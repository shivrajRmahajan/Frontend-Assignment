import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { EMPTY, catchError, map, switchMap } from 'rxjs';

import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

/** Everything the detail page needs, preloaded before navigation completes. */
export interface ProductDetail {
  product: Product;
  related: Product[];
}

/**
 * Detail route resolver.
 *
 * Preloads the product AND its related items so the route only activates once
 * the data is ready — the detail page therefore needs no loading skeleton. A
 * bad id cancels navigation and bounces back to the catalogue.
 */
export const productDetailResolver: ResolveFn<ProductDetail> = (route) => {
  const api = inject(ProductService);
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  return api.getById(id).pipe(
    switchMap((product) =>
      api.byCategory(product.category, 5).pipe(
        map((items) => ({
          product,
          related: items.filter((p) => p.id !== product.id).slice(0, 4),
        })),
      ),
    ),
    catchError(() => {
      void router.navigate(['/shop']);
      return EMPTY;
    }),
  );
};
