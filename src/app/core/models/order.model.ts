/** Lifecycle states an order can be in (drives the status filter + badge). */
export type OrderStatus = 'Pending' | 'Confirmed' | 'Cancelled';

/** All statuses, in display order — reused by the filter and the inline select. */
export const ORDER_STATUSES: readonly OrderStatus[] = ['Pending', 'Confirmed', 'Cancelled'];

/** One line in an order. */
export interface OrderLineItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
}

/**
 * A customer order. Lives in the shared `OrderStore`, written by Task 3's
 * checkout and read/managed by Task 2's admin Orders view.
 */
export interface Order {
  /** Human-facing id, e.g. "ORD-1042". */
  id: string;
  customerName: string;
  items: OrderLineItem[];
  status: OrderStatus;
  /** ISO date (yyyy-mm-dd) the order was placed. */
  date: string;
}

/** Columns the orders table can sort on. */
export type OrderSortKey = 'id' | 'customerName' | 'total' | 'status' | 'date';

/** Total value of an order (derived from its line items, never stored). */
export function orderTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/** Short "Product A +2 more" summary for the table's products column. */
export function orderItemsSummary(order: Order): string {
  if (order.items.length === 0) {
    return '—';
  }
  const [first, ...rest] = order.items;
  return rest.length ? `${first.title} +${rest.length} more` : first.title;
}
