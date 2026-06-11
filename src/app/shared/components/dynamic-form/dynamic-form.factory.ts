import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import {
  CheckoutFieldJson,
  ValidatorDescriptor,
  VisibleWhenDescriptor,
} from '../../../core/models/checkout.model';
import { FieldConfig } from './field-config.model';

/** A built form: the reactive group plus the renderer config that drives it. */
export interface BuiltForm {
  group: FormGroup;
  fields: FieldConfig[];
}

/** Map one serializable validator descriptor to an Angular `ValidatorFn`. */
function toValidator(d: ValidatorDescriptor): ValidatorFn | null {
  switch (d.type) {
    case 'required':
      return Validators.required;
    case 'email':
      return Validators.email;
    case 'minLength':
      return Validators.minLength(Number(d.value));
    case 'maxLength':
      return Validators.maxLength(Number(d.value));
    case 'min':
      return Validators.min(Number(d.value));
    case 'max':
      return Validators.max(Number(d.value));
    case 'pattern':
      return Validators.pattern(String(d.value));
    default:
      return null;
  }
}

/** Map a serializable `visibleWhen` descriptor to a predicate over the value. */
function toVisibleWhen(d?: VisibleWhenDescriptor): FieldConfig['visibleWhen'] {
  if (!d) {
    return undefined;
  }
  return (value) => value[d.field] === d.equals;
}

/**
 * Build a reactive form + renderer config from JSON field descriptors.
 *
 * This is the bridge between `/assets/checkout-form.json` and the shared
 * `DynamicFormComponent`: it owns control creation + validators, while the
 * renderer stays purely presentational.
 */
export function buildDynamicForm(jsonFields: CheckoutFieldJson[]): BuiltForm {
  const controls: Record<string, FormControl> = {};
  const fields: FieldConfig[] = [];

  for (const f of jsonFields) {
    const validators = (f.validators ?? [])
      .map(toValidator)
      .filter((v): v is ValidatorFn => v !== null);

    controls[f.name] = new FormControl(
      f.defaultValue ?? (f.type === 'number' ? 0 : ''),
      validators,
    );

    fields.push({
      name: f.name,
      label: f.label,
      type: f.type,
      placeholder: f.placeholder,
      options: f.options,
      visibleWhen: toVisibleWhen(f.visibleWhen),
    });
  }

  return { group: new FormGroup(controls), fields };
}

/**
 * Enable/disable controls to match their `visibleWhen` state, so a hidden
 * field's validators never block the form's validity. Call once initially and
 * on every value change. `emitEvent: false` avoids a feedback loop.
 */
export function refreshVisibility(built: BuiltForm): void {
  const value = built.group.getRawValue();
  for (const field of built.fields) {
    const control = built.group.get(field.name);
    if (!control) {
      continue;
    }
    const visible = field.visibleWhen ? field.visibleWhen(value) : true;
    if (visible && control.disabled) {
      control.enable({ emitEvent: false });
    } else if (!visible && control.enabled) {
      control.disable({ emitEvent: false });
    }
  }
}
