import { Routes } from '@angular/router';
import { MessagesPageComponent } from './pages/messages-page.component';
import { UsersPageComponent } from './pages/users-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'users',
  },
  {
    path: 'users',
    component: UsersPageComponent,
  },
  {
    path: 'messages',
    component: MessagesPageComponent,
  },
];
