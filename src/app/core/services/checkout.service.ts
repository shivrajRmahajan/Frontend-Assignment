import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';

import { Order, OrderLineItem } from '../models/order.model';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { OrderStore } from '../stores/order-store';

const BASE = 'https://dummyjson.com';

/** Configurable tax rate applied to the cart subtotal. */
export const TAX_RATE = 0.08;

/**
 * Drives the multi-step checkout: tracks which steps are complete (for the
 * route guard), holds the delivery payload between steps, and submits the order
 * to the mock endpoint. State is signals; the guard reads them synchronously.
 */
@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly orders = inject(OrderStore);

  readonly taxRate = TAX_RATE;

  private readonly _reviewed = signal(false);
  private readonly _delivery = signal<Record<string, unknown> | null>(null);
  readonly reviewed = this._reviewed.asReadonly();
  readonly delivery = this._delivery.asReadonly();

  markReviewed(): void {
    this._reviewed.set(true);
  }

  setDelivery(data: Record<string, unknown>): void {
    this._delivery.set(data);
  }

  /** Guard logic: a step is reachable only once the prior step is complete. */
  canEnterStep(step: number): boolean {
    if (step <= 1) {
      return true;
    }
    if (step === 2) {
      return this._reviewed();
    }
    if (step === 3) {
      return this._reviewed() && this._delivery() !== null;
    }
    return false;
  }

  /** Reset after a completed (or abandoned) checkout. */
  reset(): void {
    this._reviewed.set(false);
    this._delivery.set(null);
  }

  /**
   * Submit the order to the mock endpoint. On success it records the order in
   * the shared store and resolves the new order id; the caller drives the
   * optimistic UI and clears the cart. On failure it errors so the caller can
   * roll back.
   */
  submitOrder(): Observable<string> {
    const items = this.cart.items();
    const lineItems: OrderLineItem[] = items.map((i) => ({
      productId: i.productId,
      title: i.title,
      price: i.price,
      quantity: i.quantity,
    }));

    const payload = {
      userId: 1,
      products: items.map((i) => ({ id: i.productId, quantity: i.quantity })),
    };

    return this.http.post<{ id: number }>(`${BASE}/carts/add`, payload).pipe(
      map((res) => {
        const id = `ORD-${res.id ?? Math.floor(this.todaySeed())}`;
        const order: Order = {
          id,
          customerName:
            (this._delivery()?.['fullName'] as string) ??
            this.auth.currentUser()?.name ??
            'Guest',
          items: lineItems,
          status: 'Pending',
          date: this.today(),
        };
        this.orders.addOrder(order);
        return id;
      }),
    );
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private todaySeed(): number {
    return new Date().getTime() % 100000;
  }
}
