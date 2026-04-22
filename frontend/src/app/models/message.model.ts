export interface Message {
  id: number;
  title: string;
  content: string;
  senderUserId: number;
  receiverUserId: number;
}

export interface CreateMessageRequest {
  title: string;
  content: string;
  senderUserId: number;
  receiverUserId: number;
}
