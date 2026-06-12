import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { orderTotal } from '../../../core/models/order.model';
import { OrderStore } from '../../../core/stores/order-store';
import { ProductStore } from '../../../core/stores/product-store';

/**
 * Admin — summary analytics.
 *
 * Pure read model: every KPI is a `computed` over the shared `ProductStore` and
 * `OrderStore` signals — no fetches of its own. Inject the product store also
 * warms the catalogue (its total drives the "Products" card); the order numbers
 * update live as statuses change in the Orders view.
 *
 * OnPush: renders entirely from derived signals.
 */
@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics.page.html',
  styleUrl: './analytics.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPage {
  private readonly products = inject(ProductStore);
  protected readonly orders = inject(OrderStore);

  /** Full catalogue size reported by the product API. */
  protected readonly catalogueSize = computed(() => this.products.total());

  /** Low-stock items within the currently loaded product page (a sample). */
  protected readonly lowStock = computed(
    () => this.products.products().filter((p) => p.stock < 10).length,
  );
  protected readonly loadedSample = computed(() => this.products.products().length);

  protected readonly totalOrders = computed(() => this.orders.orders().length);
  protected readonly counts = computed(() => this.orders.countsByStatus());

  /** Revenue from non-cancelled orders. */
  protected readonly revenue = computed(() =>
    this.orders
      .orders()
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + orderTotal(o), 0),
  );

  protected readonly avgOrderValue = computed(() => {
    const all = this.orders.orders();
    if (all.length === 0) {
      return 0;
    }
    const gross = all.reduce((sum, o) => sum + orderTotal(o), 0);
    return gross / all.length;
  });

  /**
   * Donut segments for "orders by status".
   *
   * Uses the classic 100-unit-circumference SVG trick (r = 15.915 → C ≈ 100), so
   * a segment's `stroke-dasharray` length IS its percentage. `offset = 125 - sum
   * of preceding percentages` rotates each arc to start where the previous ended
   * (the +25 puts the first arc at 12 o'clock).
   */
  protected readonly donut = computed(() => {
    const c = this.counts();
    const total = c.Pending + c.Confirmed + c.Cancelled;
    let before = 0;
    const segments = (['Pending', 'Confirmed', 'Cancelled'] as const).map((key) => {
      const count = c[key];
      const pct = total === 0 ? 0 : (count / total) * 100;
      const segment = {
        key,
        count,
        pct: Math.round(pct),
        dash: `${pct} ${100 - pct}`,
        offset: 125 - before,
      };
      before += pct;
      return segment;
    });
    return { total, segments };
  });

  protected money(value: number): string {
    return '$' + value.toFixed(2);
  }
}
