import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { MessageEntity } from './message.entity';
import { MessageModel } from './message-models/message.model';
import { CreateMessageModel } from './message-models/create-message.model';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  findAll(): Promise<MessageModel[]> {
    return this.messageRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  async create(payload: CreateMessageModel): Promise<MessageModel> {
    const title = payload.title.trim();
    const content = payload.content.trim();
    const senderUserId = Number(payload.senderUserId);
    const receiverUserId = Number(payload.receiverUserId);

    if (
      !title ||
      !content ||
      !Number.isInteger(senderUserId) ||
      !Number.isInteger(receiverUserId) ||
      senderUserId < 1 ||
      receiverUserId < 1
    ) {
      throw new BadRequestException('Valid title, content, senderUserId, and receiverUserId are required.');
    }

    if (senderUserId === receiverUserId) {
      throw new BadRequestException('Sender and receiver must be different users.');
    }

    const sender = await this.userRepository.findOneBy({ id: senderUserId });
    const receiver = await this.userRepository.findOneBy({ id: receiverUserId });

    if (!sender) {
      throw new NotFoundException(`Sender user ${senderUserId} does not exist.`);
    }

    if (!receiver) {
      throw new NotFoundException(`Receiver user ${receiverUserId} does not exist.`);
    }

    const message = this.messageRepository.create({
      title,
      content,
      senderUserId,
      receiverUserId,
    });

    return this.messageRepository.save(message);
  }

  async delete(id: number): Promise<void> {
    const message = await this.messageRepository.findOneBy({ id });

    if (!message) {
      throw new NotFoundException(`Message ${id} does not exist.`);
    }

    await this.messageRepository.delete(id);
  }
}
