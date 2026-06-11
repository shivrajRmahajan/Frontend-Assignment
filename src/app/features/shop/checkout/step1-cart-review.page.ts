import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';

import { CartService } from '../../../core/services/cart.service';
import { CheckoutService } from '../../../core/services/checkout.service';
import { TaxPipe } from '../../../shared/pipes/tax.pipe';

/**
 * Checkout step 1 — Cart Review.
 *
 * Adjust quantities / remove lines; subtotal, tax (configurable rate) and grand
 * total are shown with a pure `TaxPipe`. An empty cart redirects to the shop.
 * OnPush: renders from the cart signals.
 */
@Component({
  selector: 'app-cart-review',
  imports: [TaxPipe],
  template: `
    <section class="review">
      @for (item of cart.items(); track item.productId) {
        <div class="row">
          <div class="row__media">
            @if (item.thumbnail) {
              <img [src]="item.thumbnail" [alt]="item.title" />
            }
          </div>
          <div class="row__info">
            <span class="row__title">{{ item.title }}</span>
            <span class="row__price">{{ '$' + item.price }}</span>
          </div>
          <div class="stepper" role="group" [attr.aria-label]="'Quantity for ' + item.title">
            <button type="button" (click)="cart.setQuantity(item.productId, item.quantity - 1)">−</button>
            <span class="stepper__val">{{ item.quantity }}</span>
            <button type="button" (click)="cart.setQuantity(item.productId, item.quantity + 1)">+</button>
          </div>
          <span class="row__amt">{{ '$' + (item.price * item.quantity).toFixed(2) }}</span>
          <button type="button" class="row__remove" (click)="cart.remove(item.productId)" aria-label="Remove">
            ×
          </button>
        </div>
      }
    </section>

    <aside class="summary">
      <div class="summary__line">
        <span>Subtotal</span><span>{{ '$' + cart.subtotal().toFixed(2) }}</span>
      </div>
      <div class="summary__line">
        <span>Tax ({{ checkout.taxRate * 100 }}%)</span>
        <span>{{ '$' + (cart.subtotal() | tax: checkout.taxRate).toFixed(2) }}</span>
      </div>
      <div class="summary__line summary__line--total">
        <span>Total</span>
        <span>{{ '$' + (cart.subtotal() + (cart.subtotal() | tax: checkout.taxRate)).toFixed(2) }}</span>
      </div>
      <button type="button" class="btn btn--primary summary__cta" (click)="continueToDelivery()">
        Continue to delivery
      </button>
    </aside>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: 1fr 280px;
      gap: 1.5rem;
      align-items: start;
    }
    .review {
      display: grid;
      gap: 0.75rem;
    }
    .row {
      display: grid;
      grid-template-columns: 56px 1fr auto auto auto;
      align-items: center;
      gap: 0.9rem;
      padding: 0.7rem;
      background: var(--fa-surface);
      border: 1px solid var(--fa-border);
      border-radius: var(--fa-radius);
    }
    .row__media {
      width: 56px;
      height: 56px;
      background: var(--fa-muted-bg);
      border-radius: 8px;
      display: grid;
      place-items: center;
      overflow: hidden;
    }
    .row__media img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .row__info {
      display: grid;
      gap: 0.2rem;
      min-width: 0;
    }
    .row__title {
      font-weight: 600;
      font-size: 0.9rem;
    }
    .row__price {
      font-size: 0.8rem;
      color: var(--fa-muted);
    }
    .stepper {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--fa-border);
      border-radius: var(--fa-radius);
      overflow: hidden;
    }
    .stepper button {
      width: 2rem;
      height: 2.1rem;
      border: 0;
      background: var(--fa-surface);
      cursor: pointer;
      font-size: 1rem;
    }
    .stepper button:hover {
      background: var(--fa-muted-bg);
    }
    .stepper__val {
      min-width: 2rem;
      text-align: center;
      font-weight: 600;
    }
    .row__amt {
      font-weight: 700;
      min-width: 4.5rem;
      text-align: right;
    }
    .row__remove {
      border: 0;
      background: transparent;
      color: var(--fa-muted);
      font-size: 1.3rem;
      cursor: pointer;
      line-height: 1;
    }
    .summary {
      position: sticky;
      top: 1rem;
      display: grid;
      gap: 0.6rem;
      padding: 1.25rem;
      background: var(--fa-surface);
      border: 1px solid var(--fa-border);
      border-radius: var(--fa-radius);
    }
    .summary__line {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }
    .summary__line--total {
      padding-top: 0.6rem;
      border-top: 1px solid var(--fa-border);
      font-size: 1.05rem;
      font-weight: 700;
    }
    .summary__cta {
      margin-top: 0.5rem;
    }
    @media (max-width: 720px) {
      :host {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartReviewPage {
  protected readonly cart = inject(CartService);
  protected readonly checkout = inject(CheckoutService);
  private readonly router = inject(Router);

  constructor() {
    // An empty cart has nothing to check out — send the user back to the shop.
    effect(() => {
      if (this.cart.items().length === 0) {
        void this.router.navigate(['/shop']);
      }
    });
  }

  protected continueToDelivery(): void {
    this.checkout.markReviewed();
    void this.router.navigate(['/shop/checkout/step/2']);
  }
}
