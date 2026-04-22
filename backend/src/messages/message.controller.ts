import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { MessageModel } from './message-models/message.model';
import { MessagesService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  getMessages(): Promise<MessageModel[]> {
    return this.messagesService.findAll();
  }

  @Post()
  createMessage(
    @Body() body: { title: string; content: string; senderUserId: number; receiverUserId: number },
  ): Promise<MessageModel> {
    return this.messagesService.create(body);
  }

  @Delete(':id')
  deleteMessage(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.messagesService.delete(id);
  }
}
