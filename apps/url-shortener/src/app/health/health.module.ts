import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { PrismaClientUrlModule } from '@url-shortener/prisma-client-url';

@Module({
  imports: [TerminusModule, HttpModule, PrismaClientUrlModule],
  controllers: [HealthController],
})
export class HealthModule {}
