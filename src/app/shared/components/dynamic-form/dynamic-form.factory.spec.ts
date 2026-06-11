import { CheckoutFieldJson } from '../../../core/models/checkout.model';
import { buildDynamicForm, refreshVisibility } from './dynamic-form.factory';

const FIELDS: CheckoutFieldJson[] = [
  {
    name: 'country',
    label: 'Country',
    type: 'select',
    options: [
      { value: 'IN', label: 'India' },
      { value: 'Other', label: 'Other' },
    ],
    validators: [{ type: 'required' }],
  },
  {
    name: 'otherCountry',
    label: 'Specify country',
    type: 'text',
    validators: [{ type: 'required' }],
    visibleWhen: { field: 'country', equals: 'Other' },
  },
];

describe('buildDynamicForm — visibleWhen predicate', () => {
  it('hides the conditional field unless its controlling value matches', () => {
    const built = buildDynamicForm(FIELDS);
    const visibleWhen = built.fields[1].visibleWhen!;

    expect(visibleWhen({ country: 'IN' })).toBe(false);
    expect(visibleWhen({ country: 'Other' })).toBe(true);
  });

  it('leaves a field with no visibleWhen always visible', () => {
    const built = buildDynamicForm(FIELDS);
    expect(built.fields[0].visibleWhen).toBeUndefined();
  });
});

describe('refreshVisibility — conditional control enabling', () => {
  it('disables a hidden conditional control so it does not block validity', () => {
    const built = buildDynamicForm(FIELDS);
    refreshVisibility(built);
    expect(built.group.get('otherCountry')!.disabled).toBe(true);
  });

  it('enables the control once its condition is met', () => {
    const built = buildDynamicForm(FIELDS);
    refreshVisibility(built);

    built.group.get('country')!.setValue('Other');
    refreshVisibility(built);

    expect(built.group.get('otherCountry')!.enabled).toBe(true);
  });
});
