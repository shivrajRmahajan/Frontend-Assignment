import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pure pipe computing tax from a subtotal at a configurable rate.
 *
 * Pure (the default): it recomputes only when its inputs change, so the cart
 * totals don't recalculate on unrelated change detection. The grand total is
 * `subtotal + (subtotal | tax: rate)` in the template.
 */
@Pipe({ name: 'tax' })
export class TaxPipe implements PipeTransform {
  transform(subtotal: number, rate: number): number {
    if (!subtotal || !rate) {
      return 0;
    }
    return Math.round(subtotal * rate * 100) / 100;
  }
}
