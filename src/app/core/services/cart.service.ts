import { Injectable, computed, effect, signal } from '@angular/core';

import { CartItem } from '../models/cart.model';

/** localStorage key — a cart should survive a tab close (unlike the session). */
const CART_KEY = 'fa.cart';

/**
 * Signal-based cart — the single source of truth for cart state, shared across
 * the storefront (nav badge, catalogue, detail, checkout).
 *
 * Persisted to localStorage (not sessionStorage): the cart outlives the tab.
 * An `effect` mirrors every change to storage, and the initial value is
 * rehydrated in the field initializer, so a refresh keeps the cart intact.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this.restore());
  readonly items = this._items.asReadonly();

  /** Live total item count — drives the nav cart badge. */
  readonly count = computed(() => this._items().reduce((n, i) => n + i.quantity, 0));

  /** Pre-tax subtotal. */
  readonly subtotal = computed(() =>
    this._items().reduce((sum, i) => sum + i.price * i.quantity, 0),
  );

  constructor() {
    effect(() => this.persist(this._items()));
  }

  /** Add a product (merging quantity if it's already in the cart). */
  add(item: Omit<CartItem, 'quantity'>, quantity = 1): void {
    this._items.update((items) => {
      const existing = items.find((i) => i.productId === item.productId);
      if (existing) {
        return items.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...items, { ...item, quantity }];
    });
  }

  /** Set an explicit quantity; quantities at/below zero remove the line. */
  setQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    this._items.update((items) =>
      items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    );
  }

  remove(productId: number): void {
    this._items.update((items) => items.filter((i) => i.productId !== productId));
  }

  clear(): void {
    this._items.set([]);
  }

  private restore(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }

  private persist(items: CartItem[]): void {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // Storage full / unavailable — non-fatal for an in-memory cart.
    }
  }
}
