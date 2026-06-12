import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Product, ProductCategory, ProductInput } from '../../../core/models/product.model';
import { FieldConfig } from '../../../shared/components/dynamic-form/field-config.model';
import { DynamicFormComponent } from '../../../shared/components/dynamic-form/dynamic-form.component';

/**
 * Modal panel for adding or editing a product.
 *
 * It builds the reactive `FormGroup` and a `FieldConfig[]`, then hands both to
 * the shared `DynamicFormComponent` — this is the Task 2 use of the renderer
 * that Task 3's checkout reuses. Emits the typed payload on save.
 *
 * OnPush: state is the form group plus two inputs; the modal re-renders only
 * when those change.
 */
@Component({
  selector: 'app-product-form-panel',
  imports: [ReactiveFormsModule, DynamicFormComponent],
  template: `
    <div class="modal" role="dialog" aria-modal="true" [attr.aria-label]="heading()">
      <div class="modal__backdrop" (click)="close.emit()"></div>
      <section class="modal__card">
        <header class="modal__head">
          <h2 class="modal__title">{{ heading() }}</h2>
          <button type="button" class="modal__x" (click)="close.emit()" aria-label="Close">×</button>
        </header>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <app-dynamic-form [fields]="fields()" [group]="form" />

          <footer class="modal__foot">
            <button type="button" class="btn btn--ghost" (click)="close.emit()">Cancel</button>
            <button type="submit" class="btn btn--primary" [disabled]="form.invalid">
              {{ product() ? 'Save changes' : 'Add product' }}
            </button>
          </footer>
        </form>
      </section>
    </div>
  `,
  styles: `
    .modal {
      position: fixed;
      inset: 0;
      z-index: 900;
      display: grid;
      place-items: center;
      padding: 1rem;
    }
    .modal__backdrop {
      position: absolute;
      inset: 0;
      background: rgba(16, 24, 40, 0.45);
    }
    .modal__card {
      position: relative;
      width: 100%;
      max-width: 460px;
      max-height: calc(100dvh - 4rem);
      overflow: auto;
      background: var(--fa-surface);
      border-radius: calc(var(--fa-radius) + 6px);
      box-shadow: var(--fa-shadow);
      padding: 1.5rem;
    }
    .modal__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.1rem;
    }
    .modal__title {
      margin: 0;
      font-size: 1.2rem;
    }
    .modal__x {
      border: 0;
      background: transparent;
      font-size: 1.4rem;
      line-height: 1;
      cursor: pointer;
      color: var(--fa-muted);
    }
    .modal__foot {
      display: flex;
      justify-content: flex-end;
      gap: 0.6rem;
      margin-top: 1.4rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormPanelComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  /** Product to edit, or null to add a new one. */
  readonly product = input<Product | null>(null);
  /** Category options for the select. */
  readonly categories = input<ProductCategory[]>([]);

  readonly save = output<{ input: ProductInput; id?: number }>();
  readonly close = output<void>();

  protected readonly heading = computed(() =>
    this.product() ? 'Edit product' : 'Add product',
  );

  protected readonly form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    category: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    brand: [''],
    description: [''],
  });

  /** Field config; category options flow in reactively from the input signal. */
  protected readonly fields = computed<FieldConfig[]>(() => [
    { name: 'title', label: 'Title', type: 'text', placeholder: 'Product name' },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: this.categories().map((c) => ({ value: c.slug, label: c.name })),
    },
    { name: 'price', label: 'Price (USD)', type: 'number' },
    { name: 'stock', label: 'Stock', type: 'number' },
    { name: 'brand', label: 'Brand', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ]);

  ngOnInit(): void {
    // Inputs are bound by ngOnInit — seed the form from the product (edit) or
    // default the category to the first option (add).
    const p = this.product();
    if (p) {
      this.form.patchValue({
        title: p.title,
        category: p.category,
        price: p.price,
        stock: p.stock,
        brand: p.brand ?? '',
        description: p.description ?? '',
      });
    } else if (this.categories().length) {
      this.form.patchValue({ category: this.categories()[0].slug });
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const input: ProductInput = {
      title: raw.title,
      category: raw.category,
      price: Number(raw.price),
      stock: Number(raw.stock),
      brand: raw.brand ?? '',
      description: raw.description ?? '',
    };
    this.save.emit({ input, id: this.product()?.id });
  }
}
