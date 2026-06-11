/** A single line in the shopping cart. */
export interface CartItem {
  productId: number;
  title: string;
  price: number;
  thumbnail?: string;
  quantity: number;
}
