import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = [
    'http://localhost:4200',
    'https://messenger-frontend-yrsy.onrender.com',
  ];

  app.enableCors({
    origin: allowedOrigins,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
