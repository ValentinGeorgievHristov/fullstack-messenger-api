import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { CreateMessageRequest, Message } from '../models/message.model';
import { CreateUserRequest, User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, payload);
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/auth/me`);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${userId}`);
  }

  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/messages`);
  }

  deleteMessage(messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/messages/${messageId}`);
  }

  createMessage(payload: CreateMessageRequest): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/messages`, payload);
  }

  createUser(payload: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, payload);
  }
}
