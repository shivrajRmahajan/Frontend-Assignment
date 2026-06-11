import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Admin — summary analytics. Placeholder for the next slice: KPIs composed
 * across the product and order stores via `computed` signals (no new fetches).
 * OnPush — static for now.
 */
@Component({
  selector: 'app-analytics-page',
  template: `
    <header class="page__head">
      <h1 class="page__title">Analytics</h1>
      <p class="page__sub">
        Summary KPIs (catalogue size, low-stock count, orders by status, revenue)
        derived from the shared stores — building next.
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
export class AnalyticsPage {}
