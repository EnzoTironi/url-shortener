import { LoggerModule } from '@url-shortener/logger';
import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { PrismaClientUrlModule } from '@url-shortener/prisma-client-url';
import { HealthModule } from './health/health.module';
import { ShortCodeService } from './utils';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { UrlRepository } from './url.repository';
import { ExceptionFilterModule } from '@url-shortener/filters';

@Module({
  imports: [
    LoggerModule.forRoot('URL_SERVICE'),
    ExceptionFilterModule.forRoot('URL_SERVICE'),
    PrismaClientUrlModule,
    HealthModule,
    TerminusModule,
    HttpModule,
  ],
  controllers: [UrlController],
  providers: [UrlService, UrlRepository, ShortCodeService],
})
export class UrlModule {}
