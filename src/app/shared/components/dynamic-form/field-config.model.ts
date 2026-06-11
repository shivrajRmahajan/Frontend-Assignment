/** A selectable option for `select` fields. */
export interface FieldOption {
  value: string;
  label: string;
}

/** Supported control types the renderer knows how to draw. */
export type FieldType = 'text' | 'number' | 'textarea' | 'select';

/**
 * Declarative description of one form control.
 *
 * The renderer (`DynamicFormComponent`) draws a field from this config against
 * a control that already exists on the passed-in `FormGroup` — it owns no
 * control creation and no knowledge of which screen is using it. This is the
 * shared contract reused by Task 2 (product add/edit) and Task 3 (checkout).
 */
export interface FieldConfig {
  /** Must match a control name on the FormGroup handed to the renderer. */
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  /** Options for `type: 'select'`. */
  options?: FieldOption[];
  /**
   * Optional predicate over the group's current value. When it returns false
   * the field is hidden (and skipped). Drives Task 3's "same as delivery" toggle.
   */
  visibleWhen?: (value: Record<string, unknown>) => boolean;
}
