import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MessageController } from './message.controller';
import { MessageEntity } from './message.entity';
import { MessagesService } from './message.service';
import { UserEntity } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity, UserEntity]), AuthModule],
  controllers: [MessageController],
  providers: [MessagesService],
})
export class MessagesModule {}
