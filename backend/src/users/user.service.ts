import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { MessageEntity } from '../messages/message.entity';
import { UserEntity } from './user.entity';
import { UserModel } from './user-models/user.model';
import { CreateUserDto } from './user-models/create-user.model';
import { mapUserEntityToModel } from './user-models/user.mapper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  async findAll(): Promise<UserModel[]> {
    const users = await this.userRepository.find({
      order: {
        id: 'DESC',
      },
    });

    return users.map((user) => mapUserEntityToModel(user));
  }

  async create(payload: CreateUserDto): Promise<UserModel> {
    const name = payload.name.trim();
    const email = payload.email.trim().toLowerCase();
    const password = payload.password.trim();

    if (!name || !email || password.length < 6) {
      throw new BadRequestException('Valid name, email, and password are required.');
    }

    const existingUser = await this.userRepository.findOneBy({ email });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    const passwordHash = await hash(password, 10);
    const user = this.userRepository.create({
      name,
      email,
      passwordHash,
    });
    const savedUser = await this.userRepository.save(user);

    return mapUserEntityToModel(savedUser);
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
