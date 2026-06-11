import { Routes } from '@angular/router';

/**
 * Admin feature routes — lazy-loaded behind `authGuard` + `adminGuard`
 * (see app.routes.ts). The layout (sub-nav + outlet) wraps three sections,
 * each a LAZY child route per the Task 2 architecture constraint.
 */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'products' },
      {
        path: 'products',
        title: 'Admin · Products',
        loadComponent: () =>
          import('./products/products.page').then((m) => m.ProductsPage),
      },
      {
        path: 'orders',
        title: 'Admin · Orders',
        loadComponent: () => import('./orders/orders.page').then((m) => m.OrdersPage),
      },
      {
        path: 'analytics',
        title: 'Admin · Analytics',
        loadComponent: () =>
          import('./analytics/analytics.page').then((m) => m.AnalyticsPage),
      },
    ],
  },
];
