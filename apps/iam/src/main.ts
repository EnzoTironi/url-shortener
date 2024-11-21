import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SeedService } from './app/modules/seed/seed.service';
import { initializeTracing } from '@url-shortener/tracing';
import { LoggerService } from '@url-shortener/logger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const otelSDK = initializeTracing('iam-service');
  otelSDK.start();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const logger = app.get(LoggerService);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
      transform: true,
    })
  );

  const port = process.env.IAM_SERVICE_PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(`IAM service is running on port ${port}`);

  if (process.env.NODE_ENV === 'development') {
    const seedService = app.get(SeedService);
    await seedService.seed();
  }
}

bootstrap();
