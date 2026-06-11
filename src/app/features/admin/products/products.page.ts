import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { Product, ProductInput, ProductSortKey } from '../../../core/models/product.model';
import { ProductStore } from '../../../core/stores/product-store';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ProductFormPanelComponent } from './product-form-panel.component';

/**
 * 2A — Product Management.
 *
 * Reads everything off the signal `ProductStore` (search, sort, pagination and
 * the live list). The store owns the debounced `switchMap` request pipeline;
 * this page is the view + the add/edit/delete intents.
 *
 * OnPush: the template renders from store signals + two local UI signals.
 */
@Component({
  selector: 'app-products-page',
  imports: [SkeletonComponent, ProductFormPanelComponent],
  templateUrl: './products.page.html',
  styleUrl: './products.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPage {
  protected readonly store = inject(ProductStore);

  /** Add/edit modal: closed when false; `editTarget` null = add, else edit. */
  protected readonly panelOpen = signal(false);
  protected readonly editTarget = signal<Product | null>(null);

  /** Rows for the current placeholder skeleton (matches page size feel). */
  protected readonly skeletonRows = Array.from({ length: 6 });

  protected onSearch(event: Event): void {
    this.store.setSearch((event.target as HTMLInputElement).value);
  }

  protected onCategory(event: Event): void {
    this.store.setCategory((event.target as HTMLSelectElement).value);
  }

  protected sortIndicator(key: ProductSortKey): string {
    const q = this.store.query();
    if (q.sortKey !== key) {
      return '';
    }
    return q.sortDir === 'asc' ? '▲' : '▼';
  }

  protected stockLevel(stock: number): 'out' | 'low' | 'in' {
    if (stock <= 0) {
      return 'out';
    }
    return stock < 10 ? 'low' : 'in';
  }

  protected openAdd(): void {
    this.editTarget.set(null);
    this.panelOpen.set(true);
  }

  protected openEdit(product: Product): void {
    this.editTarget.set(product);
    this.panelOpen.set(true);
  }

  protected closePanel(): void {
    this.panelOpen.set(false);
  }

  protected onSave(payload: { input: ProductInput; id?: number }): void {
    this.store.saveProduct(payload.input, payload.id);
    this.closePanel();
  }

  protected confirmDelete(product: Product): void {
    if (confirm(`Delete “${product.title}”? This cannot be undone.`)) {
      this.store.removeProduct(product);
    }
  }
}
