import { Component, computed, effect, inject, signal } from '@angular/core';
import { UserFormComponent } from '../../components/user-form/user-form.component';
import { UserStore } from '../../store/user.store';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [UserFormComponent],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.css',
})
export class UsersPageComponent {
  protected readonly store = inject(UserStore);
  protected readonly selectedUserId = signal<number | null>(null);
  protected readonly selectedUser = computed(() => {
    const selectedId = this.selectedUserId();
    return this.store.users().find((entry) => entry.id === selectedId) ?? null;
  });
  protected readonly selectedConversation = computed(() => {
    const selectedId = this.selectedUserId();

    if (selectedId === null) {
      return [];
    }

    const bucket = this.store.getChatBucket(selectedId);
    return [...bucket.sent, ...bucket.received].sort((left, right) => left.id - right.id);
  });

  constructor() {
    this.store.loadUsers();

    effect(() => {
      const users = this.store.users();
      const selectedUserId = this.selectedUserId();

      if (users.length > 0 && !users.some((user) => user.id === selectedUserId)) {
        this.selectedUserId.set(users[0].id);
      }
    });
  }

  protected selectUser(userId: number): void {
    this.selectedUserId.set(userId);
  }

  protected async deleteUser(userId: number): Promise<void> {
    const user = this.store.users().find((entry) => entry.id === userId);

    if (!user) {
      return;
    }

    const result = await Swal.fire({
      title: 'Delete user?',
      text: `Delete ${user.name} and all related messages?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      background: '#0f172a',
      color: '#e2e8f0',
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    this.store.deleteUser(userId);

    if (this.selectedUserId() === userId) {
      this.selectedUserId.set(null);
    }
  }

  protected getUserLabel(userId: number): string {
    const user = this.store.users().find((entry) => entry.id === userId);
    return user ? `${user.name} (User ID: ${user.id})` : `User ID: ${userId}`;
  }

  protected getConversationCount(userId: number): number {
    const bucket = this.store.getChatBucket(userId);
    return bucket.sent.length + bucket.received.length;
  }
}
