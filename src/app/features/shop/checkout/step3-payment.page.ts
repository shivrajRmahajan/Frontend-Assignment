import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CartService } from '../../../core/services/cart.service';
import { CheckoutService } from '../../../core/services/checkout.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CardInputComponent } from '../../../shared/components/card-input/card-input.component';
import { DynamicFormComponent } from '../../../shared/components/dynamic-form/dynamic-form.component';
import { FieldConfig } from '../../../shared/components/dynamic-form/field-config.model';
import { refreshVisibility } from '../../../shared/components/dynamic-form/dynamic-form.factory';

/**
 * Checkout step 3 — Payment.
 *
 * The card field is a custom `ControlValueAccessor` with real-time Luhn
 * validation. A "same as delivery" toggle shows/hides the billing address via
 * the SAME `visibleWhen` mechanism used elsewhere (hidden controls are disabled
 * so they don't block validity). Submit is optimistic: show success at once,
 * then clear + navigate on confirmation or roll back on failure. OnPush.
 */
@Component({
  selector: 'app-payment-step',
  imports: [ReactiveFormsModule, RouterLink, CardInputComponent, DynamicFormComponent],
  template: `
    <form class="pay" [formGroup]="form" (ngSubmit)="submit()">
      <div class="field">
        <label for="cardName">Name on card</label>
        <input id="cardName" class="input" formControlName="cardName" autocomplete="cc-name" />
        @if (showError('cardName')) {
          <p class="err">Name on card is required.</p>
        }
      </div>

      <div class="field">
        <label for="cardNumber">Card number</label>
        <app-card-input formControlName="cardNumber" />
        @if (showError('cardNumber')) {
          <p class="err">
            {{ form.get('cardNumber')?.errors?.['luhn'] ? 'Invalid card number (failed Luhn check).' : 'Card number is required.' }}
          </p>
        }
      </div>

      <div class="grid2">
        <div class="field">
          <label for="expiry">Expiry (MM/YY)</label>
          <input id="expiry" class="input" formControlName="expiry" placeholder="MM/YY" />
          @if (showError('expiry')) {
            <p class="err">Use MM/YY.</p>
          }
        </div>
        <div class="field">
          <label for="cvv">CVV</label>
          <input id="cvv" class="input" formControlName="cvv" placeholder="123" inputmode="numeric" />
          @if (showError('cvv')) {
            <p class="err">3–4 digits.</p>
          }
        </div>
      </div>

      <label class="toggle">
        <input type="checkbox" formControlName="sameAsDelivery" />
        <span>Billing address same as delivery</span>
      </label>

      <app-dynamic-form [fields]="billingFields" [group]="form" />

      <footer class="actions">
        <a class="btn btn--ghost" routerLink="/shop/checkout/step/2">Back</a>
        <button type="submit" class="btn btn--primary" [disabled]="placing()">
          {{ placing() ? 'Placing order…' : 'Place order' }}
        </button>
      </footer>
    </form>
  `,
  styles: `
    :host {
      display: block;
      max-width: 460px;
    }
    .pay {
      display: grid;
      gap: 1rem;
    }
    .field {
      display: grid;
      gap: 0.35rem;
    }
    .field label {
      font-size: 0.82rem;
      font-weight: 600;
    }
    .input {
      width: 100%;
      padding: 0.55rem 0.7rem;
      border: 1px solid var(--fa-border);
      border-radius: var(--fa-radius);
      background: var(--fa-surface);
      color: var(--fa-text);
      font: inherit;
    }
    .input:focus-visible {
      outline: none;
      border-color: var(--fa-primary);
      box-shadow: 0 0 0 3px var(--fa-focus-ring);
    }
    .grid2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.9rem;
    }
    .toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      cursor: pointer;
    }
    .toggle input {
      accent-color: var(--fa-primary);
    }
    .err {
      margin: 0;
      color: var(--fa-danger);
      font-size: 0.78rem;
    }
    .actions {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    .actions a {
      text-decoration: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentPage {
  private readonly fb = inject(FormBuilder);
  private readonly cart = inject(CartService);
  private readonly checkout = inject(CheckoutService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly placing = signal(false);

  protected readonly form: FormGroup = this.fb.group({
    cardName: ['', Validators.required],
    cardNumber: [''], // validated by CardInputComponent (Luhn) via NG_VALIDATORS
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    sameAsDelivery: [true],
    billingLine1: ['', Validators.required],
    billingCity: ['', Validators.required],
    billingZip: ['', Validators.required],
  });

  /** Billing fields, shown only when "same as delivery" is unchecked. */
  protected readonly billingFields: FieldConfig[] = [
    { name: 'billingLine1', label: 'Billing address', type: 'text', visibleWhen: (v) => !v['sameAsDelivery'] },
    { name: 'billingCity', label: 'Billing city', type: 'text', visibleWhen: (v) => !v['sameAsDelivery'] },
    { name: 'billingZip', label: 'Billing ZIP', type: 'text', visibleWhen: (v) => !v['sameAsDelivery'] },
  ];

  constructor() {
    const built = { group: this.form, fields: this.billingFields };
    refreshVisibility(built);
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => refreshVisibility(built));
  }

  protected showError(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && control.touched;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Optimistic: lock the button and assume success while the POST is in flight.
    this.placing.set(true);
    this.checkout
      .submitOrder()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (id) => {
          this.cart.clear();
          this.checkout.reset();
          void this.router.navigate(['/shop/order-confirmation', id]);
        },
        error: () => {
          // Roll back the optimistic state — cart and form are untouched.
          this.placing.set(false);
          this.toast.error('Payment failed — your cart is safe. Please try again.');
        },
      });
  }
}
