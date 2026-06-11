import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { CatalogueFilters } from '../../../core/stores/catalogue-store';
import { CatalogueStore } from '../../../core/stores/catalogue-store';
import { ProductCardComponent } from './product-card.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

/**
 * 3A — Product Catalogue.
 *
 * The URL query string is the single source of truth for filters: this page
 * reads `queryParamMap` into the store and writes user changes back as query
 * params, so every filter is deep-linkable. The store derives the filtered,
 * paginated view; live stock badges come from the shared stream.
 *
 * OnPush: renders from store signals + the route param signal.
 */
@Component({
  selector: 'app-catalogue-page',
  imports: [ProductCardComponent, SkeletonComponent],
  templateUrl: './catalogue.page.html',
  styleUrl: './catalogue.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CataloguePage {
  protected readonly store = inject(CatalogueStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Placeholder cards shown while the catalogue loads. */
  protected readonly skeletonCards = Array.from({ length: 8 });

  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  constructor() {
    // URL → store: any query-param change re-applies the filters.
    effect(() => this.store.setFilters(this.parse(this.params())));
  }

  protected isCategorySelected(slug: string): boolean {
    return this.store.filters().categories.includes(slug);
  }

  protected toggleCategory(slug: string): void {
    const current = this.store.filters().categories;
    const categories = current.includes(slug)
      ? current.filter((c) => c !== slug)
      : [...current, slug];
    this.update({ categories });
  }

  protected onMinPrice(event: Event): void {
    this.update({ minPrice: Number((event.target as HTMLInputElement).value) });
  }

  protected onMaxPrice(event: Event): void {
    this.update({ maxPrice: Number((event.target as HTMLInputElement).value) });
  }

  protected onInStock(event: Event): void {
    this.update({ inStockOnly: (event.target as HTMLInputElement).checked });
  }

  protected clearFilters(): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  protected goToPage(page: number): void {
    this.update({ page });
  }

  // --- URL <-> filter mapping ---------------------------------------------

  private parse(map: ParamMap): CatalogueFilters {
    const cats = map.get('cat');
    return {
      categories: cats ? cats.split(',').filter(Boolean) : [],
      minPrice: map.has('min') ? Number(map.get('min')) : null,
      maxPrice: map.has('max') ? Number(map.get('max')) : null,
      inStockOnly: map.get('stock') === '1',
      page: Math.max(1, Number(map.get('page')) || 1),
    };
  }

  /** Merge a partial change and push it to the URL (store updates via effect). */
  private update(partial: Partial<CatalogueFilters>): void {
    const next: CatalogueFilters = { ...this.store.filters(), ...partial };
    // Any non-page filter change resets to page 1.
    if (!('page' in partial)) {
      next.page = 1;
    }
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        cat: next.categories.length ? next.categories.join(',') : null,
        min: next.minPrice ?? null,
        max: next.maxPrice ?? null,
        stock: next.inStockOnly ? '1' : null,
        page: next.page > 1 ? next.page : null,
      },
      queryParamsHandling: 'merge',
    });
  }
}
