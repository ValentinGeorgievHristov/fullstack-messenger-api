import { Component, computed, effect, inject, signal } from '@angular/core';
import Swal from 'sweetalert2';
import { ApiService } from '../../api/api.service';
import { MessageFormComponent } from '../../components/message-form/message-form.component';
import { MessageListComponent } from '../../components/message-list/message-list.component';
import { CreateMessageRequest, Message } from '../../models/message.model';
import { UserStore } from '../../store/user.store';

@Component({
  selector: 'app-messages-page',
  standalone: true,
  imports: [MessageFormComponent, MessageListComponent],
  templateUrl: './messages-page.component.html',
  styleUrl: './messages-page.component.css',
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
