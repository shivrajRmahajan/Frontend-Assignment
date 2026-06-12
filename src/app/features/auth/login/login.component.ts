import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, SkeletonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  // OnPush: this view has no @Input bindings to diff. Its only sources of change
  // are (a) reactive-form control events, which Angular already tracks and which
  // mark this component on each keystroke/blur, and (b) three local signals
  // (loading / errorMessage / showPassword) that notify the view on write.
  // Default change detection would only add wasted passes.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly live = inject(LiveAnnouncer); // CDK a11y: announce loading state

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  // nonNullable: controls are typed `string`, so getRawValue() is fully typed.
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  /** Show a field's inline error only once the user has engaged with it. */
  protected showError(controlName: 'email' | 'password'): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  protected submit(): void {
    if (this.loading()) {
      return;
    }
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    void this.live.announce('Signing in…', 'polite');
    const { email, password } = this.form.getRawValue();

    this.auth
      .login({ email, password })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.loading.set(false);
          // Honour a guard's returnUrl; otherwise route by role.
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          const target = returnUrl ?? this.auth.homeRouteFor(user.role);
          void this.router.navigateByUrl(target);
        },
        error: (err: Error) => {
          this.loading.set(false);
          this.errorMessage.set(err.message || 'Something went wrong. Please try again.');
          this.form.controls.password.reset('');
        },
      });
  }
}
