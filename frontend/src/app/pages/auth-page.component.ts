import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthStore } from '../store/auth.store';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="auth-shell">
      <section class="auth-panel">
        <p class="eyebrow">Authentication</p>
        <h2>Join the workspace</h2>
        <p class="copy">
          Create an account or sign in to manage users and internal messages.
        </p>

        <div class="mode-switch">
          <button type="button" [class.active]="mode() === 'login'" (click)="setMode('login')">
            Sign in
          </button>
          <button type="button" [class.active]="mode() === 'register'" (click)="setMode('register')">
            Register
          </button>
        </div>

        @if (authStore.error()) {
          <p class="feedback error">{{ authStore.error() }}</p>
        }

        @if (mode() === 'register') {
          <form [formGroup]="registerForm" (ngSubmit)="submitRegister()" class="form">
            <label for="registerName">Name</label>
            <input id="registerName" formControlName="name" />
            @if (registerName.invalid && (registerName.dirty || registerName.touched)) {
              <p class="field-error">
                @if (registerName.errors?.['required'] || registerName.errors?.['trimmedRequired']) {
                  Name is required.
                } @else if (registerName.errors?.['maxlength']) {
                  Name must be 120 characters or fewer.
                }
              </p>
            }

            <label for="registerEmail">Email</label>
            <input id="registerEmail" formControlName="email" type="email" />
            @if (registerEmail.invalid && (registerEmail.dirty || registerEmail.touched)) {
              <p class="field-error">
                @if (registerEmail.errors?.['required']) {
                  Email is required.
                } @else if (registerEmail.errors?.['email']) {
                  Enter a valid email address.
                }
              </p>
            }

            <label for="registerPassword">Password</label>
            <input id="registerPassword" formControlName="password" type="password" />
            @if (registerPassword.invalid && (registerPassword.dirty || registerPassword.touched)) {
              <p class="field-error">
                @if (registerPassword.errors?.['required'] || registerPassword.errors?.['trimmedRequired']) {
                  Password is required.
                } @else if (registerPassword.errors?.['minlength']) {
                  Password must be at least 6 characters.
                }
              </p>
            }

            <button type="submit" [disabled]="authStore.isSubmitting() || registerForm.invalid">
              {{ authStore.isSubmitting() ? 'Creating...' : 'Create account' }}
            </button>
          </form>
        } @else {
          <form [formGroup]="loginForm" (ngSubmit)="submitLogin()" class="form">
            <label for="loginEmail">Email</label>
            <input id="loginEmail" formControlName="email" type="email" />
            @if (loginEmail.invalid && (loginEmail.dirty || loginEmail.touched)) {
              <p class="field-error">
                @if (loginEmail.errors?.['required']) {
                  Email is required.
                } @else if (loginEmail.errors?.['email']) {
                  Enter a valid email address.
                }
              </p>
            }

            <label for="loginPassword">Password</label>
            <input id="loginPassword" formControlName="password" type="password" />
            @if (loginPassword.invalid && (loginPassword.dirty || loginPassword.touched)) {
              <p class="field-error">
                @if (loginPassword.errors?.['required'] || loginPassword.errors?.['trimmedRequired']) {
                  Password is required.
                }
              </p>
            }

            <button type="submit" [disabled]="authStore.isSubmitting() || loginForm.invalid">
              {{ authStore.isSubmitting() ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>
        }
      </section>
    </section>
  `,
  styles: [`
    .auth-shell {
      display: flex;
      justify-content: center;
    }

    .auth-panel {
      width: min(520px, 100%);
      padding: 28px;
      border-radius: 28px;
      background: rgba(15, 23, 42, 0.78);
      border: 1px solid rgba(148, 163, 184, 0.16);
      box-shadow: 0 24px 70px rgba(2, 6, 23, 0.35);
    }

    .eyebrow {
      margin: 0;
      color: #f59e0b;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.72rem;
    }

    h2 {
      margin: 10px 0 0;
      font-size: 2rem;
    }

    .copy {
      margin: 12px 0 0;
      color: #cbd5e1;
      line-height: 1.6;
    }

    .mode-switch {
      display: inline-flex;
      gap: 8px;
      margin-top: 20px;
      padding: 6px;
      border-radius: 999px;
      background: rgba(2, 6, 23, 0.72);
      border: 1px solid rgba(148, 163, 184, 0.14);
    }

    .mode-switch button {
      border: 0;
      border-radius: 999px;
      padding: 10px 16px;
      font: inherit;
      color: #cbd5e1;
      background: transparent;
      cursor: pointer;
    }

    .mode-switch button.active {
      color: #0f172a;
      background: linear-gradient(135deg, #38bdf8 0%, #f59e0b 100%);
    }

    .feedback {
      margin: 20px 0 0;
      padding: 12px 14px;
      border-radius: 14px;
      background: rgba(127, 29, 29, 0.35);
      color: #fecaca;
    }

    .form {
      display: grid;
      gap: 14px;
      margin-top: 20px;
    }

    label {
      color: #cbd5e1;
      font-weight: 600;
    }

    input {
      width: 100%;
      padding: 14px 16px;
      border-radius: 16px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      background: rgba(2, 6, 23, 0.75);
      color: #f8fafc;
      font: inherit;
    }

    input.ng-invalid.ng-touched,
    input.ng-invalid.ng-dirty {
      border-color: rgba(248, 113, 113, 0.7);
    }

    .field-error {
      margin: -6px 0 0;
      color: #fda4af;
      font-size: 0.9rem;
    }

    button[type='submit'] {
      border: 0;
      border-radius: 999px;
      padding: 14px 18px;
      font: inherit;
      font-weight: 700;
      color: #0f172a;
      background: linear-gradient(135deg, #f59e0b 0%, #38bdf8 100%);
      cursor: pointer;
    }

    button[type='submit']:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `],
})
export class AuthPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly authStore = inject(AuthStore);
  protected readonly mode = signal<'login' | 'register'>('login');
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, trimmedRequiredValidator()]],
  });
  protected readonly registerForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120), trimmedRequiredValidator()]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6), trimmedRequiredValidator()]],
  });

  protected get loginEmail() {
    return this.loginForm.controls.email;
  }

  protected get loginPassword() {
    return this.loginForm.controls.password;
  }

  protected get registerName() {
    return this.registerForm.controls.name;
  }

  protected get registerEmail() {
    return this.registerForm.controls.email;
  }

  protected get registerPassword() {
    return this.registerForm.controls.password;
  }

  protected setMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
    this.authStore.clearError();
  }

  protected submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.authStore.login({
      email: email.trim(),
      password: password.trim(),
    });
  }

  protected submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.registerForm.getRawValue();
    this.authStore.register({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
    });
  }
}

function trimmedRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (typeof value === 'string' && value.trim().length === 0) {
      return { trimmedRequired: true };
    }

    return null;
  };
}
