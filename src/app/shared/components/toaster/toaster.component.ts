import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService } from '../../services/toast.service';

/**
 * Global toast outlet — mounted once in the app shell. Renders the
 * `ToastService.toasts` signal; OnPush because it reads only that one signal.
 */
@Component({
  selector: 'app-toaster',
  template: `
    <div class="toaster" aria-live="polite" aria-atomic="false">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast toast--{{ t.tone }}" role="status">
          <span class="toast__text">{{ t.text }}</span>
          <button type="button" class="toast__close" (click)="toast.dismiss(t.id)" aria-label="Dismiss">
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toaster {
      position: fixed;
      right: 1rem;
      bottom: 1rem;
      z-index: 1000;
      display: grid;
      gap: 0.5rem;
      max-width: min(360px, calc(100vw - 2rem));
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 0.9rem;
      border-radius: var(--fa-radius);
      background: var(--fa-surface);
      border: 1px solid var(--fa-border);
      box-shadow: var(--fa-shadow);
      font-size: 0.88rem;
      animation: toast-in 0.18s ease-out;
    }
    .toast--success {
      border-left: 3px solid var(--fa-user-fg);
    }
    .toast--error {
      border-left: 3px solid var(--fa-danger);
    }
    .toast--info {
      border-left: 3px solid var(--fa-primary);
    }
    .toast__text {
      flex: 1;
    }
    .toast__close {
      border: 0;
      background: transparent;
      color: var(--fa-muted);
      font-size: 1.1rem;
      line-height: 1;
      cursor: pointer;
    }
    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToasterComponent {
  protected readonly toast = inject(ToastService);
}
