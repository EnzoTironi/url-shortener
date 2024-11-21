import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { LoggerModule } from '@url-shortener/logger';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    LoggerModule.forFeature('Health-Service'),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
