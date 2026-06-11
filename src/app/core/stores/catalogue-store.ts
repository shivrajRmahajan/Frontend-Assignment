import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Product, ProductCategory } from '../models/product.model';
import { ProductService } from '../services/product.service';
import { StockStreamService } from '../services/stock-stream.service';

/** The storefront's composed filter object — mirrored to/from the URL. */
export interface CatalogueFilters {
  /** Selected category slugs (multi-select); empty = all. */
  categories: string[];
  minPrice: number | null;
  maxPrice: number | null;
  inStockOnly: boolean;
  page: number;
}

export const EMPTY_FILTERS: CatalogueFilters = {
  categories: [],
  minPrice: null,
  maxPrice: null,
  inStockOnly: false,
  page: 1,
};

const PAGE_SIZE = 12;

type Status = 'loading' | 'success' | 'error';

/**
 * Signal-based store for the storefront catalogue.
 *
 * Loads the whole catalogue once, then derives the filtered + paged view with
 * `computed` (multi-category, price range, in-stock — none expressible on the
 * mock API server-side). Live stock ticks from the SHARED `StockStreamService`
 * (the same stream used by Task 2) patch products in place — no re-fetch.
 */
@Injectable({ providedIn: 'root' })
export class CatalogueStore {
  private readonly api = inject(ProductService);
  private readonly stock = inject(StockStreamService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _all = signal<Product[]>([]);
  private readonly _status = signal<Status>('loading');
  readonly loading = computed(() => this._status() === 'loading');
  readonly failed = computed(() => this._status() === 'error');

  private readonly _filters = signal<CatalogueFilters>(EMPTY_FILTERS);
  readonly filters = this._filters.asReadonly();

  readonly pageSize = PAGE_SIZE;

  /** Distinct categories present in the catalogue (for the filter chips). */
  readonly categories = computed<ProductCategory[]>(() => {
    const slugs = [...new Set(this._all().map((p) => p.category))].sort();
    return slugs.map((slug) => ({ slug, name: slug }));
  });

  /** Price bounds across the catalogue (for the range slider). */
  readonly priceBounds = computed(() => {
    const prices = this._all().map((p) => p.price);
    if (prices.length === 0) {
      return { min: 0, max: 0 };
    }
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  });

  /** Full filtered list (pre-pagination). */
  readonly filtered = computed(() => {
    const f = this._filters();
    return this._all().filter((p) => {
      if (f.categories.length && !f.categories.includes(p.category)) {
        return false;
      }
      if (f.minPrice != null && p.price < f.minPrice) {
        return false;
      }
      if (f.maxPrice != null && p.price > f.maxPrice) {
        return false;
      }
      if (f.inStockOnly && p.stock <= 0) {
        return false;
      }
      return true;
    });
  });

  readonly total = computed(() => this.filtered().length);
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));
  readonly page = computed(() => Math.min(Math.max(1, this._filters().page), this.pageCount()));

  /** The current page of products. */
  readonly visible = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  constructor() {
    this.load();

    // Live stock: patch the matching product in place (no re-fetch).
    this.stock.ticks$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((tick) => {
      this._all.update((all) =>
        all.map((p) => (p.id === tick.id ? { ...p, stock: tick.stock } : p)),
      );
    });

    // Keep the simulated feed pointed at whatever's currently on screen.
    effect(() => this.stock.setPool(this.visible()));
  }

  /** Replace the filter object (the catalogue page feeds this from the URL). */
  setFilters(filters: CatalogueFilters): void {
    this._filters.set(filters);
  }

  /** (Re)load the catalogue — also the error-retry path. */
  load(): void {
    this._status.set('loading');
    this.api
      .allProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          this._all.set(products);
          this._status.set('success');
        },
        error: () => this._status.set('error'),
      });
  }

  /** Find a loaded product (used for "related products" without a fetch). */
  related(category: string, excludeId: number, limit = 4): Product[] {
    return this._all()
      .filter((p) => p.category === category && p.id !== excludeId)
      .slice(0, limit);
  }
}
