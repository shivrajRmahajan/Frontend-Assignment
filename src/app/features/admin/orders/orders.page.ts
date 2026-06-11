import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import {
  Order,
  OrderSortKey,
  ORDER_STATUSES,
  orderItemsSummary,
  orderTotal,
} from '../../../core/models/order.model';
import { OrderStore, StatusFilter } from '../../../core/stores/order-store';
import { OrderDetailPanelComponent } from './order-detail-panel.component';

/**
 * 2B — Orders View.
 *
 * Reads the shared signal `OrderStore` (filtering, sorting and pagination are
 * pure derivations there). Clicking a row opens a detail side-panel — not a new
 * route — and the panel's inline status change flows back through the same store
 * so the table reflects it immediately, no reload.
 *
 * OnPush: renders from store signals + one local selection signal.
 */
@Component({
  selector: 'app-orders-page',
  imports: [OrderDetailPanelComponent],
  templateUrl: './orders.page.html',
  styleUrl: './orders.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPage {
  protected readonly store = inject(OrderStore);
  protected readonly statuses = ORDER_STATUSES;

  /** Currently opened order id, or null when the panel is closed. */
  protected readonly selectedId = signal<string | null>(null);

  // Expose model helpers to the template.
  protected readonly total = orderTotal;
  protected readonly itemsSummary = orderItemsSummary;

  protected onStatusFilter(event: Event): void {
    this.store.setStatus((event.target as HTMLSelectElement).value as StatusFilter);
  }

  protected onFrom(event: Event): void {
    this.store.setFrom((event.target as HTMLInputElement).value);
  }

  protected onTo(event: Event): void {
    this.store.setTo((event.target as HTMLInputElement).value);
  }

  protected sortIndicator(key: OrderSortKey): string {
    if (this.store.sortKey() !== key) {
      return '';
    }
    return this.store.sortDir() === 'asc' ? '▲' : '▼';
  }

  protected money(value: number): string {
    return '$' + value.toFixed(2);
  }

  protected open(order: Order): void {
    this.selectedId.set(order.id);
  }

  protected closePanel(): void {
    this.selectedId.set(null);
  }
}
