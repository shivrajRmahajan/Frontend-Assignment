import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Product } from '../../../core/models/product.model';

/**
 * Storefront product card.
 *
 * OnPush: it renders purely from its single `product` input. When the live
 * stock stream patches a product the store hands down a NEW product object, so
 * the changed input reference triggers exactly one re-render of just this card —
 * the badge stays live with no manual change detection and no whole-grid redraw.
 */
@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  template: `
    <a class="card" [routerLink]="['/shop/products', product().id]">
      <div class="card__media">
        @if (product().thumbnail) {
          <img [src]="product().thumbnail" [alt]="product().title" loading="lazy" />
        }
        <span class="card__badge card__badge--{{ level() }}">{{ stockLabel() }}</span>
      </div>
      <div class="card__body">
        <span class="card__cat">{{ product().category }}</span>
        <h3 class="card__title">{{ product().title }}</h3>
        <span class="card__price">{{ '$' + product().price }}</span>
      </div>
    </a>
  `,
  styles: `
    .card {
      display: flex;
      flex-direction: column;
      background: var(--fa-surface);
      border: 1px solid var(--fa-border);
      border-radius: calc(var(--fa-radius) + 2px);
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition:
        border-color 0.15s,
        box-shadow 0.15s,
        transform 0.15s;
    }
    .card:hover {
      border-color: var(--fa-primary);
      box-shadow: var(--fa-shadow);
      transform: translateY(-2px);
    }
    .card:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px var(--fa-focus-ring);
    }
    .card__media {
      position: relative;
      aspect-ratio: 4 / 3;
      background: var(--fa-muted-bg);
      display: grid;
      place-items: center;
    }
    .card__media img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 0.5rem;
    }
    .card__badge {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
    }
    .card__badge--in {
      background: var(--fa-user-bg);
      color: var(--fa-user-fg);
    }
    .card__badge--low {
      background: #fff4e5;
      color: #b45309;
    }
    .card__badge--out {
      background: var(--fa-danger-bg);
      color: var(--fa-danger);
    }
    .card__body {
      display: grid;
      gap: 0.25rem;
      padding: 0.8rem 0.9rem 1rem;
    }
    .card__cat {
      font-size: 0.7rem;
      text-transform: capitalize;
      color: var(--fa-muted);
    }
    .card__title {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      line-height: 1.3;
      /* Always reserve two lines so 1- and 2-line titles take equal space,
         keeping every card the same height across the grid. */
      min-height: 2.6em;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card__price {
      font-weight: 700;
      color: var(--fa-primary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();

  protected readonly level = computed<'out' | 'low' | 'in'>(() => {
    const stock = this.product().stock;
    if (stock <= 0) {
      return 'out';
    }
    return stock < 10 ? 'low' : 'in';
  });

  protected readonly stockLabel = computed(() => {
    const stock = this.product().stock;
    if (stock <= 0) {
      return 'Out of stock';
    }
    return stock < 10 ? `Only ${stock} left` : 'In stock';
  });
}
