import { LoggerModule } from '@url-shortener/logger';
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  imports: [LoggerModule.forFeature('PrismaClientIam')],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaClientIamModule {}
