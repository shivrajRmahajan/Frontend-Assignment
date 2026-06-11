import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { OrderStore } from '../../../core/stores/order-store';
import { orderTotal } from '../../../core/models/order.model';

/**
 * Order confirmation. The `id` comes from the route (component input binding);
 * the order is read live from the shared `OrderStore` that checkout wrote to.
 * OnPush.
 */
@Component({
  selector: 'app-order-confirmation',
  imports: [RouterLink],
  template: `
    <section class="confirm">
      <div class="confirm__check" aria-hidden="true">✓</div>
      <h1 class="confirm__title">Order placed!</h1>
      <p class="confirm__id">Confirmation: <strong>{{ id() }}</strong></p>

      @if (order(); as o) {
        <ul class="confirm__items">
          @for (item of o.items; track item.productId) {
            <li>
              <span>{{ item.title }} ×{{ item.quantity }}</span>
              <span>{{ '$' + (item.price * item.quantity).toFixed(2) }}</span>
            </li>
          }
        </ul>
        <p class="confirm__total">
          <span>Total</span><strong>{{ '$' + total().toFixed(2) }}</strong>
        </p>
      }

      <a class="btn btn--primary" routerLink="/shop">Continue shopping</a>
    </section>
  `,
  styles: `
    .confirm {
      max-width: 420px;
      margin: 2rem auto;
      text-align: center;
      display: grid;
      gap: 0.75rem;
      padding: 2rem;
      background: var(--fa-surface);
      border: 1px solid var(--fa-border);
      border-radius: calc(var(--fa-radius) + 4px);
    }
    .confirm__check {
      justify-self: center;
      width: 3rem;
      height: 3rem;
      display: grid;
      place-items: center;
      border-radius: 999px;
      background: var(--fa-user-bg);
      color: var(--fa-user-fg);
      font-size: 1.5rem;
      font-weight: 700;
    }
    .confirm__title {
      margin: 0;
    }
    .confirm__id {
      margin: 0;
      color: var(--fa-muted);
      font-size: 0.9rem;
    }
    .confirm__items {
      list-style: none;
      margin: 1rem 0 0;
      padding: 1rem 0 0;
      border-top: 1px solid var(--fa-border);
      display: grid;
      gap: 0.5rem;
      text-align: left;
      font-size: 0.9rem;
    }
    .confirm__items li {
      display: flex;
      justify-content: space-between;
    }
    .confirm__total {
      display: flex;
      justify-content: space-between;
      padding-top: 0.75rem;
      border-top: 1px solid var(--fa-border);
      font-size: 1.05rem;
    }
    .btn {
      margin-top: 1rem;
      justify-self: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderConfirmationPage {
  private readonly orders = inject(OrderStore);

  /** Order id from the route path (`/shop/order-confirmation/:id`). */
  readonly id = input.required<string>();

  protected readonly order = computed(() => this.orders.byId(this.id()));
  protected readonly total = computed(() => {
    const o = this.order();
    return o ? orderTotal(o) : 0;
  });
}
