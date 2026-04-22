import { Component, computed, effect, inject, signal } from '@angular/core';
import Swal from 'sweetalert2';
import { UserFormComponent } from '../components/user-form/user-form.component';
import { UserStore } from '../store/user.store';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [UserFormComponent],
  template: `
    <section class="grid">
      <app-user-form />

      <section class="panel">
        <p class="kicker">State Store</p>
        <h2>Internal Chat</h2>

        @if (store.users().length === 0) {
          <p class="helper">Create a user to see signal state update here.</p>
        } @else {
          <div class="messenger-shell">
            <aside class="user-list">
              @for (user of store.users(); track user.id) {
                <button
                  type="button"
                  class="user-card"
                  [class.active]="selectedUserId() === user.id"
                  (click)="selectUser(user.id)"
                >
                  <div class="user-card-header">
                    <div class="user-card-copy">
                      <strong>{{ user.name }}</strong>
                      <span>{{ user.email }}</span>
                      <small>User ID: {{ user.id }}</small>
                      <small class="chat-summary">
                        {{ getConversationCount(user.id) }} messages
                      </small>
                    </div>
                    <span
                      class="icon-button"
                      role="button"
                      tabindex="0"
                      aria-label="Delete user"
                      (click)="deleteUser(user.id); $event.stopPropagation()"
                      (keydown.enter)="deleteUser(user.id); $event.stopPropagation()"
                    >
                      🗑
                    </span>
                  </div>
                </button>
              }
            </aside>

            <section class="conversation-panel">
              @if (selectedUser(); as user) {
                <header class="conversation-header">
                  <div>
                    <h3>{{ user.name }}</h3>
                    <p>{{ user.email }}</p>
                    <small>User ID: {{ user.id }}</small>
                  </div>
                </header>

                @if (selectedConversation().length === 0) {
                  <p class="helper">No conversation yet for this user.</p>
                } @else {
                  <div class="conversation-list">
                    @for (message of selectedConversation(); track message.id) {
                      <article
                        class="conversation-item"
                        [class.sent]="message.senderUserId === user.id"
                        [class.received]="message.receiverUserId === user.id"
                      >
                        <p class="message-direction">
                          @if (message.senderUserId === user.id) {
                            Sent to: {{ getUserLabel(message.receiverUserId) }}
                          } @else {
                            From: {{ getUserLabel(message.senderUserId) }}
                          }
                        </p>
                        <strong>{{ message.title }}</strong>
                        <p class="message-content">{{ message.content }}</p>
                      </article>
                    }
                  </div>
                }
              }
            </section>
          </div>
        }
      </section>
    </section>
  `,
  styles: [`
    .grid {
      display: grid;
      grid-template-columns: minmax(280px, 380px) 1fr;
      gap: 24px;
    }

    .panel {
      padding: 24px;
      border-radius: 24px;
      background: rgba(15, 23, 42, 0.72);
      border: 1px solid rgba(148, 163, 184, 0.14);
    }

    .kicker {
      margin: 0;
      color: #f59e0b;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 0.72rem;
    }

    h2 {
      margin: 6px 0 0;
      font-size: 1.6rem;
    }

    .helper {
      margin: 20px 0 0;
      color: #94a3b8;
    }

    .messenger-shell {
      display: grid;
      grid-template-columns: minmax(250px, 320px) 1fr;
      gap: 18px;
      margin-top: 20px;
    }

    .user-list {
      display: grid;
      gap: 12px;
      align-content: start;
      max-height: 680px;
      overflow: auto;
      padding-right: 4px;
    }

    .user-card {
      display: grid;
      gap: 8px;
      padding: 18px;
      border-radius: 18px;
      background: rgba(2, 6, 23, 0.65);
      border: 1px solid rgba(148, 163, 184, 0.12);
      text-align: left;
      cursor: pointer;
      transition: 160ms ease;
    }

    .user-card-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 12px;
    }

    .user-card-copy {
      display: grid;
      gap: 8px;
    }

    .user-card.active,
    .user-card:hover {
      border-color: rgba(56, 189, 248, 0.45);
      background: rgba(15, 23, 42, 0.92);
      transform: translateY(-1px);
    }

    strong {
      color: #f8fafc;
    }

    span,
    small {
      color: #cbd5e1;
    }

    .chat-summary {
      color: #94a3b8;
    }

    .icon-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 999px;
      background: rgba(127, 29, 29, 0.26);
      color: #fecaca;
      flex: 0 0 auto;
    }

    .conversation-panel {
      min-height: 520px;
      padding: 20px;
      border-radius: 20px;
      background: rgba(2, 6, 23, 0.56);
      border: 1px solid rgba(148, 163, 184, 0.12);
    }

    .conversation-header {
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.12);
    }

    .conversation-header h3 {
      margin: 0;
      font-size: 1.4rem;
      color: #f8fafc;
    }

    .conversation-header p,
    .conversation-header small {
      margin: 6px 0 0;
      color: #94a3b8;
    }

    .conversation-list {
      display: grid;
      gap: 12px;
      margin-top: 18px;
    }

    .conversation-item {
      display: grid;
      gap: 6px;
      max-width: min(420px, 100%);
      padding: 14px 16px;
      border-radius: 16px;
      background: rgba(15, 23, 42, 0.78);
      border: 1px solid rgba(148, 163, 184, 0.12);
    }

    .conversation-item.sent {
      justify-self: end;
      background: rgba(14, 116, 144, 0.26);
      border-color: rgba(56, 189, 248, 0.24);
    }

    .conversation-item.received {
      justify-self: start;
      background: rgba(62, 28, 78, 0.34);
      border-color: rgba(244, 114, 182, 0.2);
    }

    .message-direction {
      margin: 0;
      color: #94a3b8;
      font-size: 0.9rem;
    }

    .message-content {
      margin: 0;
      color: #e2e8f0;
      line-height: 1.5;
    }

    @media (max-width: 900px) {
      .grid {
        grid-template-columns: 1fr;
      }

      .messenger-shell {
        grid-template-columns: 1fr;
      }
    }
  `],
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
