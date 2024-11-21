import { NestFactory } from '@nestjs/core';
import { UrlModule } from './app/url.module';
import { LoggerService } from '@url-shortener/logger';

async function bootstrap() {
  const logger = new LoggerService('url-shortener');

  const app = await NestFactory.create(UrlModule, {
    logger,
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3002;

  await app.listen(port);
  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
