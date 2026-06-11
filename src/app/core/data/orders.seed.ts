import { Order } from '../models/order.model';

/**
 * Mock order store seed — shared by Task 2 (admin Orders view) and Task 3
 * (the storefront appends real checkouts here at runtime). Spread across
 * statuses and dates so the status filter and date-range filter are demoable.
 */
export const ORDERS_SEED: Order[] = [
  {
    id: 'ORD-1001',
    customerName: 'Aarav Sharma',
    status: 'Confirmed',
    date: '2026-05-02',
    items: [
      { productId: 1, title: 'Essence Mascara Lash Princess', price: 9.99, quantity: 2 },
      { productId: 2, title: 'Eyeshadow Palette with Mirror', price: 19.99, quantity: 1 },
    ],
  },
  {
    id: 'ORD-1002',
    customerName: 'Priya Nair',
    status: 'Pending',
    date: '2026-05-06',
    items: [{ productId: 6, title: 'Calvin Klein Coat', price: 110, quantity: 1 }],
  },
  {
    id: 'ORD-1003',
    customerName: 'Rohan Mehta',
    status: 'Cancelled',
    date: '2026-05-09',
    items: [
      { productId: 11, title: 'Apple iPhone', price: 999, quantity: 1 },
      { productId: 12, title: 'Apple AirPods', price: 129, quantity: 2 },
    ],
  },
  {
    id: 'ORD-1004',
    customerName: 'Sara Khan',
    status: 'Confirmed',
    date: '2026-05-13',
    items: [{ productId: 20, title: 'Leather Wallet', price: 35, quantity: 3 }],
  },
  {
    id: 'ORD-1005',
    customerName: 'Vikram Patel',
    status: 'Pending',
    date: '2026-05-15',
    items: [
      { productId: 30, title: 'Bluetooth Speaker', price: 49.99, quantity: 1 },
      { productId: 31, title: 'USB-C Cable', price: 8.5, quantity: 4 },
    ],
  },
  {
    id: 'ORD-1006',
    customerName: 'Ananya Reddy',
    status: 'Confirmed',
    date: '2026-05-19',
    items: [{ productId: 40, title: 'Office Chair', price: 220, quantity: 1 }],
  },
  {
    id: 'ORD-1007',
    customerName: 'Kabir Singh',
    status: 'Pending',
    date: '2026-05-22',
    items: [
      { productId: 50, title: 'Running Shoes', price: 89.99, quantity: 1 },
      { productId: 51, title: 'Sports Socks', price: 12, quantity: 3 },
    ],
  },
  {
    id: 'ORD-1008',
    customerName: 'Meera Joshi',
    status: 'Cancelled',
    date: '2026-05-24',
    items: [{ productId: 60, title: 'Ceramic Mug', price: 14.99, quantity: 6 }],
  },
  {
    id: 'ORD-1009',
    customerName: 'Arjun Das',
    status: 'Confirmed',
    date: '2026-05-28',
    items: [{ productId: 70, title: 'Mechanical Keyboard', price: 119, quantity: 1 }],
  },
  {
    id: 'ORD-1010',
    customerName: 'Ishita Gupta',
    status: 'Pending',
    date: '2026-06-01',
    items: [
      { productId: 80, title: '4K Monitor', price: 349, quantity: 2 },
      { productId: 81, title: 'HDMI Cable', price: 11.99, quantity: 2 },
    ],
  },
  {
    id: 'ORD-1011',
    customerName: 'Dev Malhotra',
    status: 'Confirmed',
    date: '2026-06-04',
    items: [{ productId: 90, title: 'Backpack', price: 59.99, quantity: 1 }],
  },
  {
    id: 'ORD-1012',
    customerName: 'Naina Verma',
    status: 'Pending',
    date: '2026-06-08',
    items: [
      { productId: 100, title: 'Wireless Mouse', price: 24.99, quantity: 2 },
      { productId: 101, title: 'Mouse Pad', price: 9.99, quantity: 1 },
    ],
  },
];
