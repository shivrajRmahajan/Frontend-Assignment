import { Routes } from '@angular/router';

/**
 * Admin feature routes — lazy-loaded behind `authGuard` + `adminGuard`
 * (see app.routes.ts). Task 2 adds products / orders / analytics here.
 */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    title: 'Admin · Dashboard',
    loadComponent: () =>
      import('./admin-home/admin-home.component').then((m) => m.AdminHomeComponent),
  },
];
