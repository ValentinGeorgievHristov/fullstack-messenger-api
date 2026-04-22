import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesModule } from './messages/message.module';
import { UsersModule } from './users/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'demo_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    MessagesModule,
  ],
})
export class AppModule {}
