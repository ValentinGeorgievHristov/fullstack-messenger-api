import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MessageEntity } from '../messages/message.entity';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { UsersService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, MessageEntity]), AuthModule],
  controllers: [UserController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
