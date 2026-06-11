import { Routes } from '@angular/router';

/**
 * Shop feature routes — lazy-loaded behind `authGuard` (any signed-in user).
 * Catalogue is the storefront landing; product detail and checkout (3B/3C)
 * are added next.
 */
export const SHOP_ROUTES: Routes = [
  {
    path: '',
    title: 'Shop · Catalogue',
    loadComponent: () =>
      import('./catalogue/catalogue.page').then((m) => m.CataloguePage),
  },
];
