import * as swaggerJson from './app/docs/swagger.json';
import swaggerUi from 'swagger-ui-express';
import { NestFactory } from '@nestjs/core';
import { UrlModule } from './app/url.module';
import { initializeTracing } from '@url-shortener/tracing';
import { LoggerService } from '@url-shortener/logger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const otelSDK = initializeTracing('url-shortener-service');
  otelSDK.start();

  const app = await NestFactory.create(UrlModule, {
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

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJson));

  const port = process.env.URL_SERVICE_PORT ?? 3002;
  await app.listen(port);
  logger.log(`URL service is running on port ${port}`);
}

bootstrap();
