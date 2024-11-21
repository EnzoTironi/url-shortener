import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedRepository } from './seed.repository';
import { PrismaService } from '@url-shortener/prisma-client-iam';
import { PasswordService } from '../utils/password.service';

@Module({
  providers: [SeedService, SeedRepository, PrismaService, PasswordService],
  exports: [SeedService],
})
export class SeedModule {}
