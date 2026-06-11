/** Serializable validator descriptor in the checkout form JSON. */
export type ValidatorType =
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'email'
  | 'pattern'
  | 'min'
  | 'max';

export interface ValidatorDescriptor {
  type: ValidatorType;
  /** Argument for length/min/max/pattern validators. */
  value?: string | number;
}

/** Serializable conditional-visibility rule: show when `field` equals a value. */
export interface VisibleWhenDescriptor {
  field: string;
  equals: string | number | boolean;
}

/** One field as declared in `/assets/checkout-form.json`. */
export interface CheckoutFieldJson {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  options?: { value: string; label: string }[];
  validators?: ValidatorDescriptor[];
  visibleWhen?: VisibleWhenDescriptor;
  defaultValue?: string | number | boolean;
}

/** Root shape of the checkout form JSON. */
export interface CheckoutFormJson {
  fields: CheckoutFieldJson[];
}
