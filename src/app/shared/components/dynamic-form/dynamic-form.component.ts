import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { FieldConfig } from './field-config.model';

/**
 * Config-driven form renderer.
 *
 * Takes a `FieldConfig[]` and an existing `FormGroup` as inputs and renders the
 * controls — with NO knowledge of which feature owns them. Validation messages
 * appear once a control is touched/dirty; `visibleWhen` fields re-evaluate on
 * value changes (each reactive-control input event marks this OnPush view for
 * check, so the template recomputes visibility without extra wiring).
 *
 * Reused by Task 2 (product add/edit) and Task 3 (checkout delivery/payment).
 * OnPush: it renders purely from its two inputs.
 */
@Component({
  selector: 'app-dynamic-form',
  imports: [ReactiveFormsModule],
  template: `
    <div [formGroup]="group()" class="dform">
      @for (field of fields(); track field.name) {
        @if (isVisible(field)) {
          <div class="dform__field">
            <label class="dform__label" [attr.for]="field.name">{{ field.label }}</label>

            @switch (field.type) {
              @case ('textarea') {
                <textarea
                  [id]="field.name"
                  class="dform__input"
                  rows="3"
                  [formControlName]="field.name"
                  [attr.placeholder]="field.placeholder ?? null"
                ></textarea>
              }
              @case ('select') {
                <select [id]="field.name" class="dform__input" [formControlName]="field.name">
                  @for (opt of field.options ?? []; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              }
              @default {
                <input
                  [id]="field.name"
                  class="dform__input"
                  [type]="field.type"
                  [formControlName]="field.name"
                  [attr.placeholder]="field.placeholder ?? null"
                />
              }
            }

            @if (showError(field.name)) {
              <p class="dform__error">{{ errorFor(field.name) }}</p>
            }
          </div>
        }
      }
    </div>
  `,
  styles: `
    .dform {
      display: grid;
      gap: 1rem;
    }
    .dform__field {
      display: grid;
      gap: 0.35rem;
    }
    .dform__label {
      font-size: 0.82rem;
      font-weight: 600;
    }
    .dform__input {
      width: 100%;
      padding: 0.55rem 0.7rem;
      border: 1px solid var(--fa-border);
      border-radius: var(--fa-radius);
      background: var(--fa-surface);
      color: var(--fa-text);
      font: inherit;
    }
    .dform__input:focus-visible {
      outline: none;
      border-color: var(--fa-primary);
      box-shadow: 0 0 0 3px var(--fa-focus-ring);
    }
    .dform__error {
      margin: 0;
      color: var(--fa-danger);
      font-size: 0.78rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormComponent {
  readonly fields = input.required<FieldConfig[]>();
  readonly group = input.required<FormGroup>();

  protected isVisible(field: FieldConfig): boolean {
    return field.visibleWhen ? field.visibleWhen(this.group().getRawValue()) : true;
  }

  protected showError(name: string): boolean {
    const control = this.group().get(name);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  protected errorFor(name: string): string {
    const errors = this.group().get(name)?.errors;
    if (!errors) {
      return '';
    }
    if (errors['required']) {
      return 'This field is required.';
    }
    if (errors['minlength']) {
      return `Use at least ${errors['minlength'].requiredLength} characters.`;
    }
    if (errors['maxlength']) {
      return `Use at most ${errors['maxlength'].requiredLength} characters.`;
    }
    if (errors['email']) {
      return 'Enter a valid email address.';
    }
    if (errors['pattern']) {
      return 'Enter a valid value.';
    }
    if (errors['min']) {
      return `Must be ${errors['min'].min} or more.`;
    }
    return 'Invalid value.';
  }
}
