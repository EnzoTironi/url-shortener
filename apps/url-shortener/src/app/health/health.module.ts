import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { PrismaClientUrlModule } from '@url-shortener/prisma-client-url';
import { LoggerModule } from '@url-shortener/logger';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    PrismaClientUrlModule,
    LoggerModule.forFeature('HealthService'),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
