import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from '../messages/message.entity';
import { UserEntity } from './user.entity';
import { UserModel } from './user-models/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  findAll(): Promise<UserModel[]> {
    return this.userRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  async create(payload: { name: string; email: string }): Promise<UserModel> {
    const name = payload.name.trim();
    const email = payload.email.trim().toLowerCase();

    if (!name || !email) {
      throw new BadRequestException('Valid name and email are required.');
    }

    const existingUser = await this.userRepository.findOneBy({ email });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    const user = this.userRepository.create({
      name,
      email,
    });

    return this.userRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User ${id} does not exist.`);
    }

    await this.messageRepository.delete([
      { senderUserId: id },
      { receiverUserId: id },
    ]);
    await this.userRepository.delete(id);
  }
}
