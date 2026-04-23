import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from './store/auth.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly authStore = inject(AuthStore);

  constructor() {
    this.authStore.restoreSession();
  }

  protected logout(): void {
    this.authStore.logout();
  }
}
