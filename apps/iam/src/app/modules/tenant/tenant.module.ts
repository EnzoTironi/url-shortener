import { Module } from '@nestjs/common';
import { PasswordService } from '../utils/password.service';
import { PrismaService } from '@url-shortener/prisma-client-iam';
import { TenantController } from './tenant.controller';
import { TenantRepository } from './tenant.repository';
import { TenantService } from './tenant.service';

@Module({
  controllers: [TenantController],
  providers: [TenantService, TenantRepository, PrismaService, PasswordService],
})
export class TenantModule {}
