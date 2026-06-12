import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { AuthService } from './core/services/auth.service';

export const routes: Routes = [
  {
    // Bare root (and the brand link, which points at '/') resolves to the right
    // home: a signed-in user's role landing page, otherwise the login screen.
    path: '',
    pathMatch: 'full',
    redirectTo: () => {
      const auth = inject(AuthService);
      const role = auth.role();
      return role ? auth.homeRouteFor(role) : '/login';
    },
  },
  {
    path: 'login',
    title: 'Sign in',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    // Admin zone: must be signed in (authGuard) AND an admin (adminGuard).
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    // Shop zone: any signed-in user.
    path: 'shop',
    canActivate: [authGuard],
    loadChildren: () => import('./features/shop/shop.routes').then((m) => m.SHOP_ROUTES),
  },
  { path: '**', redirectTo: 'login' },
];
