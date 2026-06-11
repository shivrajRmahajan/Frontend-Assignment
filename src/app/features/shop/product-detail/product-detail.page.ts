import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ProductCardComponent } from '../catalogue/product-card.component';
import { ProductDetail } from './product-detail.resolver';

/**
 * 3B — Product Detail.
 *
 * Its data is resolved before activation, so there is NO skeleton here — the
 * `detail` input is always present (bound from the resolver via the router's
 * component input binding). Quantity is bounded by available stock; an
 * out-of-stock product swaps Add-to-Cart for a "Notify me" placeholder.
 *
 * OnPush: renders from the resolved input + local signals.
 */
@Component({
  selector: 'app-product-detail-page',
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './product-detail.page.html',
  styleUrl: './product-detail.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage {
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  /** Resolved by `productDetailResolver` under the route's `detail` key. */
  readonly detail = input.required<ProductDetail>();

  protected readonly product = computed(() => this.detail().product);
  protected readonly related = computed(() => this.detail().related);
  protected readonly outOfStock = computed(() => this.product().stock <= 0);
  protected readonly maxQty = computed(() => Math.max(1, this.product().stock));

  protected readonly quantity = signal(1);

  constructor() {
    // Navigating to a related product reuses this component — reset quantity
    // whenever the resolved product changes.
    effect(() => {
      this.product().id;
      this.quantity.set(1);
    });
  }

  protected inc(): void {
    this.quantity.update((q) => Math.min(q + 1, this.maxQty()));
  }

  protected dec(): void {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  protected addToCart(): void {
    const p = this.product();
    this.cart.add(
      { productId: p.id, title: p.title, price: p.price, thumbnail: p.thumbnail },
      this.quantity(),
    );
    this.toast.success(`Added ${this.quantity()} × “${p.title}” to cart.`);
  }
}
