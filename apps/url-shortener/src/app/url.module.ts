import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { PrismaClientUrlModule } from '@url-shortener/prisma-client-url';
import { LoggerModule } from '@url-shortener/logger';
import { HealthModule } from './health/health.module';
import { ShortCodeService } from './utils';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { UrlRepository } from './url.repository';

@Module({
  imports: [
    LoggerModule.forRoot('url-shortener'),
    PrismaClientUrlModule,
    HealthModule,
    TerminusModule,
    HttpModule,
  ],
  controllers: [UrlController],
  providers: [UrlService, UrlRepository, ShortCodeService, ,],
})
export class UrlModule {}
