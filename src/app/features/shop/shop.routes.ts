import { Routes } from '@angular/router';

/**
 * Shop feature routes — lazy-loaded behind `authGuard` (any signed-in user).
 * Task 3 adds catalogue / products/:id / cart / checkout here.
 */
export const SHOP_ROUTES: Routes = [
  {
    path: '',
    title: 'Shop',
    loadComponent: () => import('./shop-home/shop-home.component').then((m) => m.ShopHomeComponent),
  },
];
