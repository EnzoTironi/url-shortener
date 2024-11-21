import { HealthController } from './health.controller';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaService } from '@url-shortener/prisma-iam';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule, HttpModule],
  providers: [PrismaService],
  controllers: [HealthController],
})
export class HealthModule {}
