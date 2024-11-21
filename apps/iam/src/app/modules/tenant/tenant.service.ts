import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTenantDto, UpdateTenantDto } from './dtos';
import { ITenantService } from './interfaces/tenant-service.interface';
import { LoggerService } from '@url-shortener/logger';
import { RoleType, Tenant } from '@database/iam';
import { TenantRepository } from './tenant.repository';
import { Actions, UserJWT } from '@url-shortener/shared';

@Injectable()
export class TenantService implements ITenantService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly logger: LoggerService
  ) {}

  async create(createTenantDto: CreateTenantDto, userInfo: UserJWT) {
    this.verifyAccess(null, userInfo, Actions.CREATE);
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
    this.verifyAccess(tenant, userInfo, Actions.UPDATE);
    const updatedTenant = await this.tenantRepository.update(
      id,
      updateTenantDto
    );

    this.logger.log(`Tenant ${id} updated successfully`, 'TenantService');
    return this.formatTenantResponse(updatedTenant);
  }

  async softDelete(id: string, userInfo: UserJWT) {
    const tenant = await this.findTenant(id);
    this.verifyAccess(tenant, userInfo, Actions.DELETE);

    const deletedTenant = await this.tenantRepository.softDelete(id);

    this.logger.log(`Tenant ${id} soft deleted successfully`, 'TenantService');
    return this.formatTenantResponse(deletedTenant);
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

  private async findTenant(id: string) {
    const tenant = await this.tenantRepository.findById(id);
    const isNotDeleted = tenant?.deletedAt === null;

    if (tenant && isNotDeleted) return tenant;

    this.logger.warn(`Tenant not found: ${id}`, 'TenantService');
    throw new NotFoundException('Tenant not found');
  }

  private verifyAccess(
    tenant: Tenant | null,
    userInfo: UserJWT,
    action: Actions
  ) {
    const isAdmin = userInfo.userRoles === RoleType.ADMIN;
    const isSameTenantAdmin =
      userInfo.userRoles === RoleType.TENANT_ADMIN &&
      tenant?.id === userInfo.tenantId;
    const isNotCreateAction = action !== Actions.CREATE;

    if (isAdmin) return;
    if (isSameTenantAdmin && isNotCreateAction) return;

    this.logger.warn(
      `Unauthorized tenant access attempt: User ${userInfo.userId}`,
      'TenantService'
    );
    throw new ForbiddenException(
      `You are not allowed to perform this action: ${action}`
    );
  }
}
