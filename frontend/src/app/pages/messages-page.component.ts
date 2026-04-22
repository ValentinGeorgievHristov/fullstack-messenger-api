import { Component, computed, effect, inject, signal } from '@angular/core';
import Swal from 'sweetalert2';
import { ApiService } from '../api/api.service';
import { MessageFormComponent } from '../components/message-form/message-form.component';
import { MessageListComponent } from '../components/message-list/message-list.component';
import { CreateMessageRequest, Message } from '../models/message.model';
import { UserStore } from '../store/user.store';

@Component({
  selector: 'app-messages-page',
  standalone: true,
  imports: [MessageFormComponent, MessageListComponent],
  template: `
    @if (error()) {
      <section class="feedback error">{{ error() }}</section>
    }

    @if (userStore.users().length === 0) {
      <section class="feedback">
        Create users first, then come back here to start an internal chat.
      </section>
    } @else {
      <section class="messenger-shell">
        <aside class="user-list">
          <section class="selection-panel">
            <p class="eyebrow">Choose Sender</p>
            <p class="selection-copy">
              Pick any existing user as the sender.
            </p>
            @if (selectedSender(); as sender) {
              <div class="selected-sender-box">
                <strong>{{ sender.name }}</strong>
                <span>{{ sender.email }}</span>
                <small>User ID: {{ sender.id }}</small>
              </div>
            }
          </section>

          @for (user of userStore.users(); track user.id) {
            <button
              type="button"
              class="user-card"
              [class.active]="selectedSenderId() === user.id"
              (click)="selectSender(user.id)"
            >
              <strong>{{ user.name }}</strong>
              <span>{{ user.email }}</span>
              <small>User ID: {{ user.id }}</small>
            </button>
          }
        </aside>

        <section class="conversation-panel">
          @if (selectedSender(); as sender) {
            <header class="panel-header">
              <div>
                <p class="eyebrow">Current Sender</p>
                <h3>{{ sender.name }}</h3>
                <p class="header-copy">{{ sender.email }} | User ID: {{ sender.id }}</p>
              </div>
            </header>

            <section class="contacts-panel">
              <p class="eyebrow">Contacts</p>
              <p class="selection-copy">
                Every existing user can send messages to every other existing user.
              </p>
              <div class="contact-list">
                @for (user of availableRecipients(); track user.id) {
                  <button
                    type="button"
                    class="contact-chip"
                    [class.active]="selectedReceiverId() === user.id"
                    (click)="selectReceiver(user.id)"
                  >
                    {{ user.name }} (#{{ user.id }})
                  </button>
                }
              </div>
            </section>

            <section class="grid">
              <app-message-form
                [isSubmitting]="isSubmitting()"
                [senderUserId]="sender.id"
                [receiverUserId]="selectedReceiverId() ?? 0"
                [availableRecipients]="availableRecipients()"
                (messageSubmit)="createMessage($event)"
              />

              <app-message-list
                [isLoading]="isLoading()"
                [messages]="visibleMessages()"
                (messageDelete)="deleteMessage($event)"
              />
            </section>
          }
        </section>
      </section>
    }
  `,
  styles: [`
    .grid {
      display: grid;
      grid-template-columns: minmax(280px, 380px) 1fr;
      gap: 24px;
      margin-top: 20px;
    }

    .messenger-shell {
      display: grid;
      grid-template-columns: minmax(250px, 320px) 1fr;
      gap: 18px;
    }

    .user-list {
      display: grid;
      gap: 12px;
      align-content: start;
      max-height: 720px;
      overflow: auto;
      padding-right: 4px;
    }

    .selection-panel {
      padding: 16px;
      border-radius: 18px;
      background: rgba(15, 23, 42, 0.72);
      border: 1px solid rgba(148, 163, 184, 0.12);
    }

    .selection-copy {
      margin: 8px 0 0;
      color: #94a3b8;
      line-height: 1.5;
    }

    .selected-sender-box {
      display: grid;
      gap: 6px;
      margin-top: 14px;
      padding: 14px;
      border-radius: 16px;
      background: rgba(2, 6, 23, 0.72);
      border: 1px solid rgba(56, 189, 248, 0.18);
    }

    .selected-sender-box strong {
      color: #f8fafc;
    }

    .selected-sender-box span,
    .selected-sender-box small {
      color: #cbd5e1;
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

    .user-card strong {
      color: #f8fafc;
    }

    .user-card span,
    .user-card small {
      color: #cbd5e1;
    }

    .user-card.active,
    .user-card:hover,
    .contact-chip.active,
    .contact-chip:hover {
      border-color: rgba(56, 189, 248, 0.45);
      background: rgba(15, 23, 42, 0.92);
      transform: translateY(-1px);
    }

    .conversation-panel {
      min-height: 520px;
      padding: 20px;
      border-radius: 20px;
      background: rgba(2, 6, 23, 0.56);
      border: 1px solid rgba(148, 163, 184, 0.12);
    }

    .panel-header {
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.12);
    }

    .eyebrow {
      margin: 0;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 0.72rem;
    }

    .panel-header h3 {
      margin: 8px 0 0;
      color: #f8fafc;
      font-size: 1.5rem;
    }

    .header-copy {
      margin: 6px 0 0;
      color: #94a3b8;
    }

    .contacts-panel {
      margin-top: 18px;
    }

    .contact-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 12px;
    }

    .contact-chip {
      border: 1px solid rgba(148, 163, 184, 0.14);
      border-radius: 999px;
      padding: 10px 14px;
      color: #e2e8f0;
      background: rgba(15, 23, 42, 0.72);
      cursor: pointer;
      transition: 160ms ease;
    }

    .feedback {
      margin-bottom: 20px;
      padding: 14px 16px;
      border-radius: 16px;
      background: rgba(15, 23, 42, 0.72);
      color: #cbd5e1;
    }

    @media (max-width: 900px) {
      .messenger-shell,
      .grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class MessagesPageComponent {
  private readonly api = inject(ApiService);
  protected readonly userStore = inject(UserStore);

  protected readonly messages = signal<Message[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly selectedSenderId = signal<number | null>(null);
  protected readonly selectedReceiverId = signal<number | null>(null);
  protected readonly selectedSender = computed(() => {
    const selectedSenderId = this.selectedSenderId();
    return this.userStore.users().find((user) => user.id === selectedSenderId) ?? null;
  });
  protected readonly availableRecipients = computed(() => {
    const senderId = this.selectedSenderId();
    return this.userStore.users().filter((user) => user.id !== senderId);
  });
  protected readonly visibleMessages = computed(() => {
    const senderId = this.selectedSenderId();
    const receiverId = this.selectedReceiverId();

    if (senderId === null) {
      return this.messages();
    }

    if (receiverId === null) {
      return this.messages().filter(
        (message) =>
          message.senderUserId === senderId || message.receiverUserId === senderId,
      );
    }

    return this.messages().filter(
      (message) =>
        (message.senderUserId === senderId && message.receiverUserId === receiverId) ||
        (message.senderUserId === receiverId && message.receiverUserId === senderId),
    );
  });

  constructor() {
    this.userStore.loadUsers();
    this.loadMessages();

    effect(() => {
      const users = this.userStore.users();
      const selectedSenderId = this.selectedSenderId();

      if (users.length > 0 && !users.some((user) => user.id === selectedSenderId)) {
        this.selectedSenderId.set(users[0].id);
      }
    });

    effect(() => {
      const recipients = this.availableRecipients();
      const selectedReceiverId = this.selectedReceiverId();

      if (recipients.length > 0 && !recipients.some((user) => user.id === selectedReceiverId)) {
        this.selectedReceiverId.set(recipients[0].id);
      }
    });
  }

  protected loadMessages(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.getMessages().subscribe({
      next: (messages) => {
        this.messages.set(messages);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Unable to load messages.');
        this.isLoading.set(false);
      },
    });
  }

  protected createMessage(payload: CreateMessageRequest): void {
    this.isSubmitting.set(true);
    this.error.set(null);

    this.api.createMessage(payload).subscribe({
      next: (message) => {
        this.messages.update((messages) => [message, ...messages]);
        this.userStore.addMessage(message);
        this.isSubmitting.set(false);
      },
      error: () => {
        this.error.set('Unable to create the message.');
        this.isSubmitting.set(false);
      },
    });
  }

  protected async deleteMessage(messageId: number): Promise<void> {
    const message = this.messages().find((entry) => entry.id === messageId);

    if (!message) {
      return;
    }

    const result = await Swal.fire({
      title: 'Delete message?',
      text: `Delete "${message.title}" from the conversation?`,
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

    this.error.set(null);

    this.api.deleteMessage(messageId).subscribe({
      next: () => {
        this.messages.update((messages) => messages.filter((message) => message.id !== messageId));
        this.userStore.removeMessage(messageId);
      },
      error: () => {
        this.error.set('Unable to delete the message.');
      },
    });
  }

  protected selectSender(userId: number): void {
    this.selectedSenderId.set(userId);

    if (this.selectedReceiverId() === userId) {
      this.selectedReceiverId.set(null);
    }
  }

  protected selectReceiver(userId: number): void {
    this.selectedReceiverId.set(userId);
  }
}
