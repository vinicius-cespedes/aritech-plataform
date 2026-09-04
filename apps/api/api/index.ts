import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

let handler: any;

async function bootstrap() {
  if (handler) return handler;

  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();

  handler = app.getHttpAdapter().getInstance();
  return handler;
}

export default async function vercelHandler(req: any, res: any) {
  const httpHandler = await bootstrap();
  return httpHandler(req, res);
}
