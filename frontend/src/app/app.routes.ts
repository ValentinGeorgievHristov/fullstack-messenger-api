import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/auth.guard';
import { MessagesPageComponent } from './pages/messages-page.component';
import { AuthPageComponent } from './pages/auth-page.component';
import { UsersPageComponent } from './pages/users-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth',
  },
  {
    path: 'auth',
    component: AuthPageComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'users',
    component: UsersPageComponent,
    canActivate: [authGuard],
  },
  {
    path: 'messages',
    component: MessagesPageComponent,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];
