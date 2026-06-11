/** A catalogue product, shared by the Admin panel (Task 2) and the Shop (Task 3). */
export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  brand?: string;
  thumbnail?: string;
  rating?: number;
}

/** A category as exposed by the mock REST source. */
export interface ProductCategory {
  slug: string;
  name: string;
}

/** Columns the product table can sort on (1:1 with dummyjson `sortBy` keys). */
export type ProductSortKey = 'title' | 'category' | 'price' | 'stock';

export type SortDir = 'asc' | 'desc';

/**
 * The full product-list request, composed into a SINGLE object.
 *
 * Search, category, sort and pagination all live here so the store can run one
 * debounced `switchMap` pipeline off it — no scattered request state.
 */
export interface ProductQuery {
  /** Free-text search; '' = no search. */
  search: string;
  /** Category slug; '' = all categories. */
  category: string;
  /** 1-based page index. */
  page: number;
  pageSize: number;
  sortKey: ProductSortKey;
  sortDir: SortDir;
}

/** One page of products plus the server's total count (for pagination). */
export interface ProductPage {
  items: Product[];
  total: number;
}

/** Editable fields submitted by the add/edit form. */
export interface ProductInput {
  title: string;
  category: string;
  price: number;
  stock: number;
  brand: string;
  description: string;
}
