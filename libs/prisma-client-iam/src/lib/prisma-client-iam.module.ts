import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { LoggerModule } from '@url-shortener/logger';

@Module({
  imports: [LoggerModule.forFeature('PrismaClientIam')],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaClientIamModule {}
