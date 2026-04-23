import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { MessageModel } from './message-models/message.model';
import { MessagesService } from './message.service';
import { CreateMessageModel } from './message-models/create-message.model';

@Controller('messages')
@UseGuards(AuthGuard)
export class MessageController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  getMessages(): Promise<MessageModel[]> {
    return this.messagesService.findAll();
  }

  @Post()
  createMessage(
    @Body() body: CreateMessageModel): Promise<MessageModel> {
    return this.messagesService.create(body);
  }

  @Delete(':id')
  deleteMessage(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.messagesService.delete(id);
  }
}
