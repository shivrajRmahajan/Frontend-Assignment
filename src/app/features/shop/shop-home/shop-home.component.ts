import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-shop-home',
  template: `
    <section class="zone">
      <span class="zone__tag zone__tag--user">Shop zone</span>
      <h1 class="zone__title">Hi {{ auth.currentUser()?.name }}, happy shopping</h1>
      <p class="zone__lead">
        You reached the <strong>authenticated</strong> shop. A signed-out visitor who deep-links
        here is sent to login and returned afterwards. The catalogue, product detail, cart &amp;
        checkout arrive in Task&nbsp;3.
      </p>
    </section>
  `,
  styles: `
    .zone {
      max-width: 60ch;
    }
    .zone__tag {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      margin-bottom: 0.9rem;
    }
    .zone__tag--user {
      background: var(--fa-user-bg);
      color: var(--fa-user-fg);
    }
    .zone__title {
      margin: 0 0 0.5rem;
    }
    .zone__lead {
      color: var(--fa-muted);
      line-height: 1.6;
    }
  `,
  // OnPush: static placeholder; its only dynamic value is an AuthService signal.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopHomeComponent {
  protected readonly auth = inject(AuthService);
}
