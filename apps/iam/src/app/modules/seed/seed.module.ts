import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedRepository } from './seed.repository';
import { LoggerModule } from '@url-shortener/logger';

@Module({
  imports: [LoggerModule.forFeature('Seed-Service')],
  providers: [SeedService, SeedRepository],
  exports: [SeedService],
})
export class SeedModule {}
