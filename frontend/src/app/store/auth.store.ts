import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../api/api.service';
import { LoginRequest, RegisterRequest } from '../models/auth.model';
import { User } from '../models/user.model';

const AUTH_TOKEN_STORAGE_KEY = 'demo_workspace_access_token';
const AUTH_USER_STORAGE_KEY = 'demo_workspace_user';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(this.getStoredToken());
  readonly currentUser = signal<User | null>(this.getStoredUser());
  readonly isSubmitting = signal(false);
  readonly isRestoring = signal(false);
  readonly error = signal<string | null>(null);

  register(payload: RegisterRequest): void {
    this.isSubmitting.set(true);
    this.error.set(null);

    this.api.register(payload).subscribe({
      next: (response) => {
        this.applyAuth(response.accessToken, response.user);
        this.isSubmitting.set(false);
        void this.router.navigate(['/users']);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(this.getErrorMessage(error, 'Unable to create the account.'));
        this.isSubmitting.set(false);
      },
    });
  }

  login(payload: LoginRequest): void {
    this.isSubmitting.set(true);
    this.error.set(null);

    this.api.login(payload).subscribe({
      next: (response) => {
        this.applyAuth(response.accessToken, response.user);
        this.isSubmitting.set(false);
        void this.router.navigate(['/users']);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(this.getErrorMessage(error, 'Unable to sign in.'));
        this.isSubmitting.set(false);
      },
    });
  }

  restoreSession(): void {
    if (!this.token()) {
      return;
    }

    this.isRestoring.set(true);

    this.api.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.persistUser(user);
        this.isRestoring.set(false);
      },
      error: () => {
        this.clearSession();
        this.isRestoring.set(false);
      },
    });
  }

  logout(): void {
    this.clearSession();
    void this.router.navigate(['/auth']);
  }

  clearError(): void {
    this.error.set(null);
  }

  private applyAuth(accessToken: string, user: User): void {
    this.token.set(accessToken);
    this.currentUser.set(user);
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, accessToken);
    this.persistUser(user);
  }

  private persistUser(user: User): void {
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  }

  private clearSession(): void {
    this.token.set(null);
    this.currentUser.set(null);
    this.error.set(null);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  }

  private getStoredUser(): User | null {
    const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      return null;
    }
  }

  private getErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
    const message = error.error?.message;

    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    return fallbackMessage;
  }
}
