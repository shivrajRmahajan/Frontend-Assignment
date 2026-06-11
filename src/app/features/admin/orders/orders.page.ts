import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * 2B — Orders View. Placeholder for the next slice: a paginated, sortable
 * orders table with status + date-range filters and a detail side-panel,
 * reading from the shared signal-based order store. OnPush — static for now.
 */
@Component({
  selector: 'app-orders-page',
  template: `
    <header class="page__head">
      <h1 class="page__title">Orders</h1>
      <p class="page__sub">
        Paginated orders with status &amp; date filters and an inline detail panel —
        building next on the shared order store.
      </p>
    </header>
  `,
  styles: `
    .page__title {
      margin: 0;
      font-size: 1.5rem;
    }
    .page__sub {
      margin: 0.25rem 0 0;
      color: var(--fa-muted);
      font-size: 0.88rem;
      max-width: 60ch;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPage {}
