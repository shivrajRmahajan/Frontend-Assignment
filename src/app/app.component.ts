import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { ToasterComponent } from './shared/components/toaster/toaster.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToasterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  // OnPush: the shell renders entirely from AuthService signals. Reading a signal
  // in the template registers this view as its consumer, so the bar refreshes
  // exactly when identity changes (login / logout) — never on unrelated work.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartService);
}
