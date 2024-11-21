import { NestFactory } from '@nestjs/core';
import { UrlModule } from './app/url.module';
import * as swaggerJson from './app/docs/swagger.json';
import swaggerUi from 'swagger-ui-express';

async function bootstrap() {
  const app = await NestFactory.create(UrlModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.URL_SERVICE_PORT || 3002;

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJson));

  await app.listen(port);
}

bootstrap();
