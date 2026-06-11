import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { ORDER_STATUSES, OrderStatus, orderTotal } from '../../../core/models/order.model';
import { OrderStore } from '../../../core/stores/order-store';

/**
 * Order detail side-panel (NOT a route).
 *
 * Reads the order live from the shared `OrderStore` by id, so the inline status
 * `<select>` here and the row in the table stay in sync off the same signal.
 * OnPush: renders from the store signal + its id input.
 */
@Component({
  selector: 'app-order-detail-panel',
  template: `
    @if (order(); as o) {
      <aside class="panel" role="dialog" aria-modal="false" aria-label="Order detail">
        <header class="panel__head">
          <div>
            <h2 class="panel__id">{{ o.id }}</h2>
            <p class="panel__cust">{{ o.customerName }} · {{ o.date }}</p>
          </div>
          <button type="button" class="panel__x" (click)="close.emit()" aria-label="Close">×</button>
        </header>

        <label class="panel__status">
          <span>Status</span>
          <select [value]="o.status" (change)="onStatus($event)">
            @for (s of statuses; track s) {
              <option [value]="s">{{ s }}</option>
            }
          </select>
        </label>

        <h3 class="panel__sub">Line items</h3>
        <ul class="lines">
          @for (item of o.items; track item.productId) {
            <li class="line">
              <span class="line__title">{{ item.title }}</span>
              <span class="line__qty">×{{ item.quantity }}</span>
              <span class="line__amt">{{ money(item.price * item.quantity) }}</span>
            </li>
          }
        </ul>

        <footer class="panel__total">
          <span>Total</span>
          <strong>{{ money(total()) }}</strong>
        </footer>
      </aside>
    }
  `,
  styles: `
    .panel {
      position: fixed;
      top: 0;
      right: 0;
      z-index: 850;
      width: min(420px, 100vw);
      height: 100dvh;
      overflow: auto;
      background: var(--fa-surface);
      border-left: 1px solid var(--fa-border);
      box-shadow: -12px 0 28px rgba(16, 24, 40, 0.12);
      padding: 1.5rem;
      animation: panel-in 0.18s ease-out;
    }
    @keyframes panel-in {
      from {
        transform: translateX(12px);
        opacity: 0;
      }
    }
    .panel__head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
    }
    .panel__id {
      margin: 0;
      font-size: 1.2rem;
    }
    .panel__cust {
      margin: 0.2rem 0 0;
      color: var(--fa-muted);
      font-size: 0.85rem;
    }
    .panel__x {
      border: 0;
      background: transparent;
      font-size: 1.4rem;
      line-height: 1;
      cursor: pointer;
      color: var(--fa-muted);
    }
    .panel__status {
      display: grid;
      gap: 0.35rem;
      margin-bottom: 1.5rem;
      font-size: 0.82rem;
      font-weight: 600;
    }
    .panel__status select {
      padding: 0.5rem 0.7rem;
      border: 1px solid var(--fa-border);
      border-radius: var(--fa-radius);
      background: var(--fa-surface);
      color: var(--fa-text);
      font: inherit;
      font-weight: 500;
    }
    .panel__sub {
      margin: 0 0 0.6rem;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--fa-muted);
    }
    .lines {
      list-style: none;
      margin: 0 0 1.25rem;
      padding: 0;
      display: grid;
      gap: 0.6rem;
    }
    .line {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 0.75rem;
      align-items: center;
      font-size: 0.9rem;
    }
    .line__qty {
      color: var(--fa-muted);
    }
    .line__amt {
      font-weight: 600;
      min-width: 5rem;
      text-align: right;
    }
    .panel__total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid var(--fa-border);
      font-size: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailPanelComponent {
  private readonly store = inject(OrderStore);

  readonly orderId = input.required<string>();
  readonly close = output<void>();

  protected readonly statuses = ORDER_STATUSES;

  /** Live order from the shared store (reactive to inline status edits). */
  protected readonly order = computed(() => this.store.byId(this.orderId()));
  protected readonly total = computed(() => {
    const o = this.order();
    return o ? orderTotal(o) : 0;
  });

  protected onStatus(event: Event): void {
    this.store.updateStatus(this.orderId(), (event.target as HTMLSelectElement).value as OrderStatus);
  }

  protected money(value: number): string {
    return '$' + value.toFixed(2);
  }
}
