import { ExceptionFilterModule } from '@url-shortener/filters';
import { HealthModule } from './health/health.module';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from '@url-shortener/logger';
import { Module } from '@nestjs/common';
import { PrismaClientUrlModule } from '@url-shortener/prisma-client-url';
import { ShortCodeService } from './utils';
import { TerminusModule } from '@nestjs/terminus';
import { UrlController } from './url.controller';
import { UrlRepository } from './url.repository';
import { UrlService } from './url.service';

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
