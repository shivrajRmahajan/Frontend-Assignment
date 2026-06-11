import { Routes } from '@angular/router';

import { checkoutStepGuard } from './checkout/checkout-step.guard';
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
  {
    path: 'checkout',
    loadComponent: () =>
      import('./checkout/checkout-layout.component').then((m) => m.CheckoutLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'step/1' },
      {
        path: 'step/1',
        title: 'Checkout · Cart',
        data: { step: 1 },
        canActivate: [checkoutStepGuard],
        loadComponent: () =>
          import('./checkout/step1-cart-review.page').then((m) => m.CartReviewPage),
      },
      {
        path: 'step/2',
        title: 'Checkout · Delivery',
        data: { step: 2 },
        canActivate: [checkoutStepGuard],
        loadComponent: () =>
          import('./checkout/step2-delivery.page').then((m) => m.DeliveryPage),
      },
      {
        path: 'step/3',
        title: 'Checkout · Payment',
        data: { step: 3 },
        canActivate: [checkoutStepGuard],
        loadComponent: () =>
          import('./checkout/step3-payment.page').then((m) => m.PaymentPage),
      },
    ],
  },
  {
    path: 'order-confirmation/:id',
    title: 'Order confirmed',
    loadComponent: () =>
      import('./checkout/order-confirmation.page').then((m) => m.OrderConfirmationPage),
  },
];
