import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use('/api/annot/pv/analysis', express.static('/pv/analysis'));
  app.use(compression());
  await app.listen(3000);
}
bootstrap();
