import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

import { CheckoutFormJson } from '../../../core/models/checkout.model';
import { CheckoutService } from '../../../core/services/checkout.service';
import { DynamicFormComponent } from '../../../shared/components/dynamic-form/dynamic-form.component';
import {
  BuiltForm,
  buildDynamicForm,
  refreshVisibility,
} from '../../../shared/components/dynamic-form/dynamic-form.factory';

/**
 * Checkout step 2 — Delivery Details.
 *
 * The form is built entirely from `/assets/checkout-form.json` (field types,
 * validators, and a `visibleWhen` conditional field) and rendered by the SHARED
 * `DynamicFormComponent` — the same renderer Task 2's product form uses. Hidden
 * fields are disabled so they don't block validity. OnPush.
 */
@Component({
  selector: 'app-delivery-step',
  imports: [RouterLink, DynamicFormComponent],
  template: `
    @if (built(); as form) {
      <form (ngSubmit)="submit(form)">
        <app-dynamic-form [fields]="form.fields" [group]="form.group" />
        <footer class="actions">
          <a class="btn btn--ghost" routerLink="/shop/checkout/step/1">Back</a>
          <button type="submit" class="btn btn--primary">Continue to payment</button>
        </footer>
      </form>
    } @else if (failed()) {
      <p class="state">Couldn’t load the delivery form. <button type="button" class="btn btn--ghost" (click)="load()">Retry</button></p>
    } @else {
      <p class="state">Loading form…</p>
    }
  `,
  styles: `
    :host {
      display: block;
      max-width: 460px;
    }
    .actions {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
    .actions a {
      text-decoration: none;
    }
    .state {
      color: var(--fa-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryPage {
  private readonly http = inject(HttpClient);
  private readonly checkout = inject(CheckoutService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly built = signal<BuiltForm | null>(null);
  protected readonly failed = signal(false);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.failed.set(false);
    this.http
      .get<CheckoutFormJson>('/assets/checkout-form.json')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (json) => this.init(json),
        error: () => this.failed.set(true),
      });
  }

  private init(json: CheckoutFormJson): void {
    const form = buildDynamicForm(json.fields);

    // Restore any previously entered delivery data.
    const saved = this.checkout.delivery();
    if (saved) {
      form.group.patchValue(saved);
    }

    // Keep conditional fields enabled/disabled in step with their visibility.
    refreshVisibility(form);
    form.group.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => refreshVisibility(form));

    this.built.set(form);
  }

  protected submit(form: BuiltForm): void {
    if (form.group.invalid) {
      form.group.markAllAsTouched();
      return;
    }
    this.checkout.setDelivery(form.group.getRawValue());
    void this.router.navigate(['/shop/checkout/step/3']);
  }
}
