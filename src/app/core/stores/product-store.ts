import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, merge, of, startWith, switchMap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  Product,
  ProductCategory,
  ProductInput,
  ProductQuery,
  ProductSortKey,
} from '../models/product.model';
import { ProductService } from '../services/product.service';
import { StockStreamService } from '../services/stock-stream.service';
import { ToastService } from '../../shared/services/toast.service';

const INITIAL_QUERY: ProductQuery = {
  search: '',
  category: '',
  page: 1,
  pageSize: 10,
  sortKey: 'title',
  sortDir: 'asc',
};

/** Debounce so fast typing / clicking collapses into one request. */
const QUERY_DEBOUNCE_MS = 300;

type Status = 'loading' | 'success' | 'error';

/**
 * Signal-based store — the single source of truth for the product list.
 *
 * One composed `query` signal drives ONE debounced `switchMap` pipeline (stale
 * requests are cancelled). Results land in a writable `_items` signal, which is
 * then mutated locally for: live stock ticks (no re-fetch) and optimistic
 * delete (instant removal + rollback on failure). All subscriptions are torn
 * down with `takeUntilDestroyed`.
 */
@Injectable({ providedIn: 'root' })
export class ProductStore {
  private readonly api = inject(ProductService);
  private readonly stock = inject(StockStreamService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _query = signal<ProductQuery>(INITIAL_QUERY);
  readonly query = this._query.asReadonly();

  private readonly _items = signal<Product[]>([]);
  readonly products = this._items.asReadonly();

  private readonly _total = signal(0);
  readonly total = this._total.asReadonly();

  private readonly _status = signal<Status>('loading');
  readonly loading = computed(() => this._status() === 'loading');
  readonly failed = computed(() => this._status() === 'error');

  private readonly _categories = signal<ProductCategory[]>([]);
  readonly categories = this._categories.asReadonly();

  /** Total page count for the pager (never below 1). */
  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this._total() / this._query().pageSize)),
  );

  /** Manual re-fetch trigger (error retry / post-write refresh). */
  private readonly reload$ = new Subject<void>();

  constructor() {
    this.api
      .categories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (c) => this._categories.set(c), error: () => void 0 });

    // The one request pipeline: query changes (or a manual reload) → debounce →
    // switchMap (cancels any in-flight request) → fold result into signals.
    merge(toObservable(this._query), this.reload$.pipe(map(() => this._query())))
      .pipe(
        debounceTime(QUERY_DEBOUNCE_MS),
        switchMap((q) =>
          this.api.list(q).pipe(
            map((page) => ({ kind: 'ok' as const, page })),
            catchError(() => of({ kind: 'err' as const })),
            startWith({ kind: 'loading' as const }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((state) => {
        if (state.kind === 'loading') {
          this._status.set('loading');
          return;
        }
        if (state.kind === 'err') {
          this._status.set('error');
          return;
        }
        this._status.set('success');
        this._items.set(state.page.items);
        this._total.set(state.page.total);
        this.stock.setPool(state.page.items);
      });

    // Live stock feed → patch the matching row in place (no re-fetch).
    this.stock.ticks$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((tick) => {
      this._items.update((items) =>
        items.map((p) => (p.id === tick.id ? { ...p, stock: tick.stock } : p)),
      );
    });
  }

  // --- query mutations (each resets to page 1 where it changes the result set) ---

  setSearch(search: string): void {
    this._query.update((q) => ({ ...q, search, page: 1 }));
  }

  setCategory(category: string): void {
    this._query.update((q) => ({ ...q, category, page: 1 }));
  }

  toggleSort(key: ProductSortKey): void {
    this._query.update((q) => ({
      ...q,
      sortKey: key,
      sortDir: q.sortKey === key && q.sortDir === 'asc' ? 'desc' : 'asc',
    }));
  }

  setPage(page: number): void {
    const clamped = Math.min(Math.max(1, page), this.pageCount());
    this._query.update((q) => ({ ...q, page: clamped }));
  }

  nextPage(): void {
    this.setPage(this._query().page + 1);
  }

  prevPage(): void {
    this.setPage(this._query().page - 1);
  }

  reload(): void {
    this.reload$.next();
  }

  // --- writes -------------------------------------------------------------

  /**
   * Optimistic delete: drop the row immediately, POST the delete, and roll the
   * row back (with an error toast) if the call fails.
   */
  removeProduct(product: Product): void {
    const snapshot = this._items();
    this._items.set(snapshot.filter((p) => p.id !== product.id));
    this._total.update((t) => Math.max(0, t - 1));

    this.api
      .remove(product.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.toast.success(`Deleted “${product.title}”.`),
        error: (err: unknown) => {
          // dummyjson 404s for products it doesn't hold — e.g. ones just added
          // in-session (their id is simulated, never persisted). A DELETE on a
          // resource that isn't there is idempotently "already deleted", so keep
          // the row removed; only roll back on a genuine failure.
          if (err instanceof HttpErrorResponse && err.status === 404) {
            this.toast.success(`Deleted “${product.title}”.`);
            return;
          }
          this._items.set(snapshot);
          this._total.update((t) => t + 1);
          this.toast.error(`Couldn’t delete “${product.title}” — row restored.`);
        },
      });
  }

  /**
   * Create or update. The mock API doesn't persist, so we reflect the change
   * locally for an immediate, demonstrable result.
   */
  saveProduct(input: ProductInput, id?: number): void {
    if (id != null) {
      this.api
        .update(id, input)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this._items.update((items) =>
              items.map((p) => (p.id === id ? { ...p, ...input } : p)),
            );
            this.toast.success(`Updated “${input.title}”.`);
          },
          error: () => this.toast.error(`Couldn’t update “${input.title}”.`),
        });
      return;
    }

    this.api
      .add(input)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created) => {
          this._items.update((items) => [{ ...created, ...input }, ...items]);
          this._total.update((t) => t + 1);
          this.toast.success(`Added “${input.title}”.`);
        },
        error: () => this.toast.error(`Couldn’t add “${input.title}”.`),
      });
  }
}
