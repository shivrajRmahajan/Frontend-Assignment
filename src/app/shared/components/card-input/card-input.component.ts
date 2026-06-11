import { ChangeDetectionStrategy, Component, forwardRef, signal } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';

import { isValidLuhn } from '../../utils/luhn.util';

/**
 * Custom card-number field implementing both `ControlValueAccessor` (so it
 * drops into any reactive form via `formControlName`) and `Validator` (so it
 * contributes a real-time `luhn` error as the user types). It stores the raw
 * digits as the control value and displays them in groups of four.
 *
 * OnPush: view state is two local signals.
 */
@Component({
  selector: 'app-card-input',
  template: `
    <input
      class="card-input"
      inputmode="numeric"
      autocomplete="cc-number"
      placeholder="0000 0000 0000 0000"
      maxlength="23"
      [value]="display()"
      [disabled]="disabled()"
      (input)="onInput($event)"
      (blur)="onTouched()"
      aria-label="Card number"
    />
  `,
  styles: `
    .card-input {
      width: 100%;
      padding: 0.55rem 0.7rem;
      border: 1px solid var(--fa-border);
      border-radius: var(--fa-radius);
      background: var(--fa-surface);
      color: var(--fa-text);
      font: inherit;
      letter-spacing: 0.08em;
    }
    .card-input:focus-visible {
      outline: none;
      border-color: var(--fa-primary);
      box-shadow: 0 0 0 3px var(--fa-focus-ring);
    }
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CardInputComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => CardInputComponent), multi: true },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardInputComponent implements ControlValueAccessor, Validator {
  protected readonly display = signal('');
  protected readonly disabled = signal(false);

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  // --- ControlValueAccessor ---

  writeValue(value: string): void {
    const digits = (value ?? '').replace(/\D/g, '');
    this.display.set(this.format(digits));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // --- Validator ---

  validate(control: AbstractControl): ValidationErrors | null {
    const digits = String(control.value ?? '').replace(/\D/g, '');
    if (!digits) {
      return { required: true };
    }
    return isValidLuhn(digits) ? null : { luhn: true };
  }

  // --- view ---

  protected onInput(event: Event): void {
    const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 19);
    this.display.set(this.format(digits));
    this.onChange(digits);
  }

  private format(digits: string): string {
    return digits.replace(/(.{4})/g, '$1 ').trim();
  }
}
