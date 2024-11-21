import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { TenantRepository } from './tenant.repository';
import { PrismaService } from '@url-shortener/prisma-client-iam';
import { PasswordService } from '../utils/password.service';

@Module({
  controllers: [TenantController],
  providers: [TenantService, TenantRepository, PrismaService, PasswordService],
})
export class TenantModule {}
