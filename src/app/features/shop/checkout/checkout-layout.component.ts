import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

/**
 * Checkout shell: a 3-step progress indicator plus the step outlet. Each step
 * is a lazy child route guarded by `checkoutStepGuard`. Purely presentational
 * → OnPush.
 */
@Component({
  selector: 'app-checkout-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <h1 class="checkout__title">Checkout</h1>

    <ol class="steps">
      <li>
        <a routerLink="step/1" routerLinkActive="is-active"><span>1</span> Cart</a>
      </li>
      <li>
        <a routerLink="step/2" routerLinkActive="is-active"><span>2</span> Delivery</a>
      </li>
      <li>
        <a routerLink="step/3" routerLinkActive="is-active"><span>3</span> Payment</a>
      </li>
    </ol>

    <router-outlet />
  `,
  styles: `
    .checkout__title {
      margin: 0 0 1.25rem;
      font-size: 1.6rem;
    }
    .steps {
      display: flex;
      gap: 0.5rem;
      list-style: none;
      margin: 0 0 1.75rem;
      padding: 0;
      flex-wrap: wrap;
    }
    .steps a {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.45rem 0.85rem;
      border: 1px solid var(--fa-border);
      border-radius: 999px;
      color: var(--fa-muted);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .steps a span {
      display: grid;
      place-items: center;
      width: 1.3rem;
      height: 1.3rem;
      border-radius: 999px;
      background: var(--fa-muted-bg);
      font-size: 0.72rem;
    }
    .steps a.is-active {
      border-color: var(--fa-primary);
      color: var(--fa-primary);
      background: var(--fa-primary-bg);
    }
    .steps a.is-active span {
      background: var(--fa-primary);
      color: #fff;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutLayoutComponent {}
