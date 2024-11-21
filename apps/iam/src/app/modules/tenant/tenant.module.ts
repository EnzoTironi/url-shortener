import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { TenantRepository } from './tenant.repository';
import { LoggerModule } from '@url-shortener/logger';

@Module({
  imports: [LoggerModule.forFeature('Tenant-Service')],
  controllers: [TenantController],
  providers: [TenantService, TenantRepository],
})
export class TenantModule {}
