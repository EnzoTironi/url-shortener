import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { LoggerModule } from '@url-shortener/logger';

@Module({
  imports: [LoggerModule.forFeature('PrismaClientUrl')],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaClientUrlModule {}
