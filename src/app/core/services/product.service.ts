import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  Product,
  ProductCategory,
  ProductInput,
  ProductPage,
  ProductQuery,
} from '../models/product.model';

/** dummyjson — the mock REST source the assignment points at. */
const BASE = 'https://dummyjson.com';

/** Only pull the fields the UI actually renders (smaller payload). */
const SELECT = 'title,category,price,stock,brand,thumbnail,description,rating';

/** Raw `{ products, total }` envelope returned by dummyjson list endpoints. */
interface RawList {
  products: Product[];
  total: number;
}

/**
 * Thin HTTP wrapper over the mock product API.
 *
 * It owns ONLY the network shape (which endpoint, which params); all state and
 * the debounced request lifecycle live in `ProductStore`. Every list call maps
 * the raw envelope into our `ProductPage`.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  /**
   * Fetch one page for a composed query.
   *
   * dummyjson can't search and filter-by-category in one call, so we pick the
   * most specific endpoint: search wins, then category, then the plain list.
   * Sort + pagination ride along as query params on whichever we choose. When
   * BOTH search and category are set we filter the category client-side (a
   * documented mock limitation).
   */
  list(q: ProductQuery): Observable<ProductPage> {
    const skip = (q.page - 1) * q.pageSize;
    const params: Record<string, string | number> = {
      limit: q.pageSize,
      skip,
      sortBy: q.sortKey,
      order: q.sortDir,
      select: SELECT,
    };

    let url = `${BASE}/products`;
    if (q.search.trim()) {
      url = `${BASE}/products/search`;
      params['q'] = q.search.trim();
    } else if (q.category) {
      url = `${BASE}/products/category/${q.category}`;
    }

    return this.http.get<RawList>(url, { params }).pipe(
      map((raw) => {
        let items = raw.products ?? [];
        let total = raw.total ?? items.length;
        // Search + category combo: narrow client-side (see doc comment above).
        if (q.search.trim() && q.category) {
          items = items.filter((p) => p.category === q.category);
          total = items.length;
        }
        return { items, total };
      }),
    );
  }

  /**
   * Fetch the whole catalogue in one call (`limit=0`).
   *
   * The storefront filters on multiple axes dummyjson can't express server-side
   * (multi-category, price range, in-stock), so it loads once and derives
   * filtered pages client-side — avoiding per-filter request waterfalls.
   */
  allProducts(): Observable<Product[]> {
    return this.http
      .get<RawList>(`${BASE}/products`, { params: { limit: 0, select: SELECT } })
      .pipe(map((raw) => raw.products ?? []));
  }

  /** A single product by id — used by the Task 3 detail route resolver. */
  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${BASE}/products/${id}`, { params: { select: SELECT } });
  }

  /** A handful of products in a category — backs the "related products" section. */
  byCategory(slug: string, limit = 5): Observable<Product[]> {
    return this.http
      .get<RawList>(`${BASE}/products/category/${slug}`, { params: { limit, select: SELECT } })
      .pipe(map((raw) => raw.products ?? []));
  }

  /** Category list for the filter dropdown and the add/edit form. */
  categories(): Observable<ProductCategory[]> {
    return this.http.get<unknown[]>(`${BASE}/products/categories`).pipe(
      map((raw) =>
        raw.map((c) =>
          typeof c === 'string'
            ? { slug: c, name: c }
            : { slug: (c as ProductCategory).slug, name: (c as ProductCategory).name },
        ),
      ),
    );
  }

  /** Create — dummyjson simulates the write and echoes a new id. */
  add(input: ProductInput): Observable<Product> {
    return this.http.post<Product>(`${BASE}/products/add`, input);
  }

  /** Update — dummyjson simulates the write and echoes the merged product. */
  update(id: number, input: ProductInput): Observable<Product> {
    return this.http.put<Product>(`${BASE}/products/${id}`, input);
  }

  /** Delete — dummyjson simulates the write; we drive the optimistic UI off it. */
  remove(id: number): Observable<{ id: number; isDeleted: boolean }> {
    return this.http.delete<{ id: number; isDeleted: boolean }>(`${BASE}/products/${id}`);
  }
}
