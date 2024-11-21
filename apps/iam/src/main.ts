import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SeedService } from './app/modules/seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const port = process.env.IAM_SERVICE_PORT || 3001;
  await app.listen(port, '0.0.0.0');

  if (process.env.NODE_ENV === 'development') {
    const seedService = app.get(SeedService);
    await seedService.seed();
  }
}

bootstrap();
