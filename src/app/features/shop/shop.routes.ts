import { Routes } from '@angular/router';

import { productDetailResolver } from './product-detail/product-detail.resolver';

/**
 * Shop feature routes — lazy-loaded behind `authGuard` (any signed-in user).
 * Catalogue is the storefront landing; product detail resolves its data before
 * activation. Checkout (3C) is added next.
 */
export const SHOP_ROUTES: Routes = [
  {
    path: '',
    title: 'Shop · Catalogue',
    loadComponent: () =>
      import('./catalogue/catalogue.page').then((m) => m.CataloguePage),
  },
  {
    path: 'products/:id',
    title: 'Shop · Product',
    resolve: { detail: productDetailResolver },
    loadComponent: () =>
      import('./product-detail/product-detail.page').then((m) => m.ProductDetailPage),
  },
];
