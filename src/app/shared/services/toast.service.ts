import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  readonly id: number;
  readonly text: string;
  readonly tone: ToastTone;
}

/** Auto-dismiss delay (ms). */
const DEFAULT_TTL = 4000;

/**
 * Tiny signal-based toast queue. Components push messages; `ToasterComponent`
 * renders the `toasts` signal. Used for the optimistic-delete rollback notice
 * and other transient feedback.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(text: string, tone: ToastTone = 'info', ttl = DEFAULT_TTL): void {
    const id = ++this.seq;
    this._toasts.update((list) => [...list, { id, text, tone }]);
    setTimeout(() => this.dismiss(id), ttl);
  }

  success(text: string): void {
    this.show(text, 'success');
  }

  error(text: string): void {
    this.show(text, 'error');
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
