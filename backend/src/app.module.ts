import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './messages/message.module';
import { UsersModule } from './users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: true,
            ssl: {
              rejectUnauthorized: false,
            },
            extra: {
              connectionTimeoutMillis: 5000, // Да не чака вечно
            },
          };
        }

        const host = configService.get<string>('DB_HOST');
        const port = Number(configService.get<string>('DB_PORT') ?? 5432);
        const username = configService.get<string>('DB_USERNAME');
        const password = configService.get<string>('DB_PASSWORD');
        const database = configService.get<string>('DB_NAME');

        if (!host || !username || password === undefined || !database) {
          throw new Error(
            'Database configuration is missing. Set DATABASE_URL or DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, and DB_NAME in backend/.env.',
          );
        }

        return {
          type: 'postgres' as const,
          host,
          port,
          username,
          password,
          database,
          autoLoadEntities: true,
          synchronize: true,
          ssl: false,
        };
      },
    }),
    AuthModule,
    UsersModule,
    MessagesModule,
  ],
})
export class AppModule { }
