import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Message } from '../models/message.model';
import { CreateUserRequest, User } from '../models/user.model';

export interface UserChatBucket {
  sent: Message[];
  received: Message[];
}

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  private readonly api = inject(ApiService);

  readonly users = signal<User[]>([]);
  readonly chatsByUserId = signal<Record<number, UserChatBucket>>({});
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);

  loadUsers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.ensureChatBuckets(users);
        this.loadMessages();
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Unable to load users.');
        this.isLoading.set(false);
      },
    });
  }

  createUser(payload: CreateUserRequest): void {
    this.isSubmitting.set(true);
    this.error.set(null);

    this.api.createUser(payload).subscribe({
      next: (user) => {
        this.users.update((users) => [user, ...users]);
        this.ensureChatBuckets([user]);
        this.isSubmitting.set(false);
      },
      error: () => {
        this.error.set('Unable to create the user.');
        this.isSubmitting.set(false);
      },
    });
  }

  deleteUser(userId: number): void {
    this.error.set(null);

    this.api.deleteUser(userId).subscribe({
      next: () => {
        this.users.update((users) => users.filter((user) => user.id !== userId));
        this.chatsByUserId.update((current) => {
          const next = { ...current };
          delete next[userId];

          for (const key of Object.keys(next)) {
            const numericKey = Number(key);
            const bucket = next[numericKey];
            next[numericKey] = {
              sent: bucket.sent.filter(
                (message) =>
                  message.senderUserId !== userId && message.receiverUserId !== userId,
              ),
              received: bucket.received.filter(
                (message) =>
                  message.senderUserId !== userId && message.receiverUserId !== userId,
              ),
            };
          }

          return next;
        });
      },
      error: () => {
        this.error.set('Unable to delete the user.');
      },
    });
  }

  loadMessages(): void {
    this.api.getMessages().subscribe({
      next: (messages) => {
        this.rebuildChatBuckets(messages);
      },
      error: () => {
        this.error.set('Unable to load user chats.');
      },
    });
  }

  addMessage(message: Message): void {
    this.chatsByUserId.update((current) => {
      const next = { ...current };
      const senderBucket = next[message.senderUserId] ?? { sent: [], received: [] };
      const receiverBucket = next[message.receiverUserId] ?? { sent: [], received: [] };

      next[message.senderUserId] = {
        ...senderBucket,
        sent: [message, ...senderBucket.sent],
      };

      next[message.receiverUserId] = {
        ...receiverBucket,
        received: [message, ...receiverBucket.received],
      };

      return next;
    });
  }

  removeMessage(messageId: number): void {
    this.chatsByUserId.update((current) => {
      const next = { ...current };

      for (const key of Object.keys(next)) {
        const numericKey = Number(key);
        const bucket = next[numericKey];
        next[numericKey] = {
          sent: bucket.sent.filter((message) => message.id !== messageId),
          received: bucket.received.filter((message) => message.id !== messageId),
        };
      }

      return next;
    });
  }

  getChatBucket(userId: number): UserChatBucket {
    return this.chatsByUserId()[userId] ?? { sent: [], received: [] };
  }

  private ensureChatBuckets(users: User[]): void {
    this.chatsByUserId.update((current) => {
      const next = { ...current };

      for (const user of users) {
        next[user.id] ??= { sent: [], received: [] };
      }

      return next;
    });
  }

  private rebuildChatBuckets(messages: Message[]): void {
    const next: Record<number, UserChatBucket> = {};

    for (const user of this.users()) {
      next[user.id] = { sent: [], received: [] };
    }

    for (const message of messages) {
      next[message.senderUserId] ??= { sent: [], received: [] };
      next[message.receiverUserId] ??= { sent: [], received: [] };

      next[message.senderUserId].sent.push(message);
      next[message.receiverUserId].received.push(message);
    }

    this.chatsByUserId.set(next);
  }
}
