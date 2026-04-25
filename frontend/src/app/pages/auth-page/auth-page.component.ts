import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthStore } from '../../store/auth.store';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css',
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
