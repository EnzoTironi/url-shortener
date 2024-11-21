import { Module } from '@nestjs/common';
import { PasswordService } from '../utils/password.service';
import { PrismaService } from '@url-shortener/prisma-client-iam';
import { SeedRepository } from './seed.repository';
import { SeedService } from './seed.service';

@Module({
  providers: [SeedService, SeedRepository, PrismaService, PasswordService],
  exports: [SeedService],
})
export class SeedModule {}
