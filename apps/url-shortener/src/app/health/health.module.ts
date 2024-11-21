import { HealthController } from './health.controller';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaClientUrlModule } from '@url-shortener/prisma-url';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule, HttpModule, PrismaClientUrlModule],
  controllers: [HealthController],
})
export class HealthModule {}
