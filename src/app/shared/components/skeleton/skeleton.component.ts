import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Presentational shimmer placeholder.
 *
 * Used here for the login submit area while the auth round-trip is in flight,
 * and reused for the catalogue / orders skeletons in Tasks 2–3.
 * OnPush: it renders purely from its three inputs — nothing else can change it.
 */
@Component({
  selector: 'app-skeleton',
  template: '',
  styleUrl: './skeleton.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fa-skeleton',
    role: 'presentation',
    'aria-hidden': 'true',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
    '[style.borderRadius]': 'radius()',
  },
})
export class SkeletonComponent {
  /** CSS width, e.g. "100%" or "200px". */
  readonly width = input('100%');
  /** CSS height, e.g. "1rem" or "46px". */
  readonly height = input('1rem');
  /** CSS border-radius. */
  readonly radius = input('var(--fa-radius)');
}
