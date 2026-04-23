import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './messages/message.module';
import { UsersModule } from './users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgres://localhost:5432/your_local_db',
      autoLoadEntities: true,
      synchronize: true, // Only for development/demo projects
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    }),
    AuthModule,
    UsersModule,
    MessagesModule,
  ],
})
export class AppModule { }
