import { Injectable, computed, signal } from '@angular/core';

import { ORDERS_SEED } from '../data/orders.seed';
import { SortDir } from '../models/product.model';
import {
  Order,
  OrderSortKey,
  OrderStatus,
  orderTotal,
} from '../models/order.model';

/** Status filter value — a concrete status or "all". */
export type StatusFilter = OrderStatus | 'all';

const PAGE_SIZE = 8;

/**
 * Signal-based single source of truth for orders, shared by Task 2 (admin) and
 * Task 3 (checkout appends here). Orders are in-memory, so filtering, sorting
 * and pagination are pure `computed` derivations — an inline status change
 * mutates one signal and every view (table, detail panel, analytics) updates.
 */
@Injectable({ providedIn: 'root' })
export class OrderStore {
  // Clone the seed so runtime edits never mutate the source module.
  private readonly _orders = signal<Order[]>(ORDERS_SEED.map((o) => ({ ...o })));
  readonly orders = this._orders.asReadonly();

  // --- filters ---
  private readonly _status = signal<StatusFilter>('all');
  private readonly _from = signal('');
  private readonly _to = signal('');
  readonly status = this._status.asReadonly();
  readonly from = this._from.asReadonly();
  readonly to = this._to.asReadonly();

  // --- sort ---
  private readonly _sortKey = signal<OrderSortKey>('date');
  private readonly _sortDir = signal<SortDir>('desc');
  readonly sortKey = this._sortKey.asReadonly();
  readonly sortDir = this._sortDir.asReadonly();

  // --- pagination ---
  private readonly _page = signal(1);
  readonly pageSize = PAGE_SIZE;

  /** Filtered + sorted full list (pre-pagination). */
  readonly filtered = computed(() => {
    const status = this._status();
    const from = this._from();
    const to = this._to();
    const key = this._sortKey();
    const dir = this._sortDir() === 'asc' ? 1 : -1;

    const rows = this._orders().filter((o) => {
      if (status !== 'all' && o.status !== status) {
        return false;
      }
      if (from && o.date < from) {
        return false;
      }
      if (to && o.date > to) {
        return false;
      }
      return true;
    });

    return rows.sort((a, b) => {
      const av = key === 'total' ? orderTotal(a) : a[key];
      const bv = key === 'total' ? orderTotal(b) : b[key];
      if (av < bv) {
        return -1 * dir;
      }
      if (av > bv) {
        return 1 * dir;
      }
      return 0;
    });
  });

  readonly total = computed(() => this.filtered().length);
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));

  /** Page clamped to the valid range (filters can shrink the result set). */
  readonly page = computed(() => Math.min(this._page(), this.pageCount()));

  /** The current page's rows. */
  readonly paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  /** Count of orders per status (for analytics / filter context). */
  readonly countsByStatus = computed(() => {
    const counts: Record<OrderStatus, number> = { Pending: 0, Confirmed: 0, Cancelled: 0 };
    for (const o of this._orders()) {
      counts[o.status]++;
    }
    return counts;
  });

  // --- filter / sort / page mutations ---

  setStatus(status: StatusFilter): void {
    this._status.set(status);
    this._page.set(1);
  }

  setFrom(from: string): void {
    this._from.set(from);
    this._page.set(1);
  }

  setTo(to: string): void {
    this._to.set(to);
    this._page.set(1);
  }

  toggleSort(key: OrderSortKey): void {
    if (this._sortKey() === key) {
      this._sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this._sortKey.set(key);
      this._sortDir.set('asc');
    }
  }

  setPage(page: number): void {
    this._page.set(Math.max(1, page));
  }

  nextPage(): void {
    this.setPage(this.page() + 1);
  }

  prevPage(): void {
    this.setPage(this.page() - 1);
  }

  // --- writes ---

  /** Inline status change — reflected everywhere immediately via the signal. */
  updateStatus(id: string, status: OrderStatus): void {
    this._orders.update((orders) =>
      orders.map((o) => (o.id === id ? { ...o, status } : o)),
    );
  }

  /** Append a new order (Task 3 checkout). */
  addOrder(order: Order): void {
    this._orders.update((orders) => [order, ...orders]);
  }

  /** Look up a single order (used by the detail panel; stays live). */
  byId(id: string): Order | undefined {
    return this._orders().find((o) => o.id === id);
  }
}
