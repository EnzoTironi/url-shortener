import { NestFactory } from '@nestjs/core';
import { UrlModule } from './app/url.module';

async function bootstrap() {
  const app = await NestFactory.create(UrlModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.URL_SERVICE_PORT || 3002;

  await app.listen(port);
}

bootstrap();
