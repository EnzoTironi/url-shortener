import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTenantDto, UpdateTenantDto } from './dtos';
import { RoleType, Tenant } from '@database/iam';
import { UserJWT } from '@url-shortener/shared';
import { LoggerService } from '@url-shortener/logger';
import { ITenantService } from './interfaces/tenant-service.interface';
import { TenantRepository } from './tenant.repository';

@Injectable()
export class TenantService implements ITenantService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly logger: LoggerService
  ) {}

  async create(createTenantDto: CreateTenantDto, userInfo: UserJWT) {
    this.verifyAdminRole(userInfo);
    const tenant = await this.tenantRepository.create(createTenantDto);

    this.logger.log(`Tenant created with ID: ${tenant.id}`, 'TenantService');
    return this.formatTenantResponse(tenant);
  }

  async update(
    id: string,
    updateTenantDto: UpdateTenantDto,
    userInfo: UserJWT
  ) {
    const tenant = await this.findTenant(id);
    this.verifyTenantAccess(tenant, userInfo);
    const updatedTenant = await this.tenantRepository.update(
      id,
      updateTenantDto
    );

    this.logger.log(`Tenant ${id} updated successfully`, 'TenantService');
    return this.formatTenantResponse(updatedTenant);
  }

  async softDelete(id: string, userInfo: UserJWT) {
    const tenant = await this.findTenant(id);
    this.verifyTenantAccess(tenant, userInfo);

    const deletedTenant = await this.tenantRepository.softDelete(id);

    this.logger.log(`Tenant ${id} soft deleted successfully`, 'TenantService');
    return this.formatTenantResponse(deletedTenant);
  }

  private async findTenant(id: string) {
    const tenant = await this.tenantRepository.findById(id);

    if (!tenant || tenant?.deletedAt !== null) {
      this.logger.warn(`Tenant not found: ${id}`, 'TenantService');
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  private verifyAdminRole(userInfo: UserJWT) {
    if (userInfo.userRoles !== RoleType.ADMIN) {
      this.logger.warn(
        `Non-admin user ${userInfo.userId} attempted to create tenant`,
        'TenantService'
      );
      throw new ForbiddenException('Only admins can create tenants');
    }
  }

  private verifyTenantAccess(tenant: any, userInfo: UserJWT) {
    if (tenant?.id !== userInfo.tenantId) {
      this.logger.warn(
        `Unauthorized tenant access attempt: User ${userInfo.userId}`,
        'TenantService'
      );
      throw new ForbiddenException('You are not allowed to access this tenant');
    }
  }

  private formatTenantResponse(
    tenant: Tenant
  ): Pick<Tenant, 'id' | 'name' | 'subDomain'> {
    return {
      id: tenant.id,
      name: tenant.name,
      subDomain: tenant.subDomain,
    };
  }
}
