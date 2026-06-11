import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

/**
 * Admin shell: a sub-navigation across the three lazy sections (Products,
 * Orders, Analytics) plus the child `<router-outlet>`. Each section is loaded
 * on demand by `ADMIN_ROUTES`. Purely presentational → OnPush.
 */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <nav class="subnav" aria-label="Admin sections">
      <a routerLink="products" routerLinkActive="is-active">Products</a>
      <a routerLink="orders" routerLinkActive="is-active">Orders</a>
      <a routerLink="analytics" routerLinkActive="is-active">Analytics</a>
    </nav>

    <router-outlet />
  `,
  styles: `
    .subnav {
      display: flex;
      gap: 0.25rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--fa-border);
    }
    .subnav a {
      padding: 0.6rem 0.9rem;
      color: var(--fa-muted);
      text-decoration: none;
      font-size: 0.92rem;
      font-weight: 600;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
    }
    .subnav a:hover {
      color: var(--fa-text);
    }
    .subnav a.is-active {
      color: var(--fa-primary);
      border-bottom-color: var(--fa-primary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {}
