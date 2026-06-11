import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-home',
  template: `
    <section class="zone">
      <span class="zone__tag zone__tag--admin">Admin zone</span>
      <h1 class="zone__title">Welcome, {{ auth.currentUser()?.name }}</h1>
      <p class="zone__lead">
        You reached an <strong>admin-guarded</strong> route — a non-admin who deep-links here is
        bounced to the shop, and a signed-out visitor to login. Products, Orders &amp; Analytics
        land here in Task&nbsp;2.
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
    .zone__tag--admin {
      background: var(--fa-admin-bg);
      color: var(--fa-admin-fg);
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
export class AdminHomeComponent {
  protected readonly auth = inject(AuthService);
}
