import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { LoggerService } from '@url-shortener/logger';
import { SeedService } from './app/modules/seed/seed.service';

async function bootstrap() {
  const logger = new LoggerService('iam-service');

  const app = await NestFactory.create(AppModule, {
    logger,
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  logger.log(
    `🚀 Application is running on: http://0.0.0.0:${port}/${globalPrefix}`
  );
}

bootstrap();
