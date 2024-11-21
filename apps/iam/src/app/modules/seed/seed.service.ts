import { ISeedService } from './interfaces/seed-service.interface';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@url-shortener/logger';
import { PasswordService } from '../utils/password.service';
import { RoleType } from '@url-shortener/prisma-client-iam';
import { SeedRepository } from './seed.repository';

@Injectable()
export class SeedService implements ISeedService {
  constructor(
    private readonly seedRepository: SeedRepository,
    private readonly passwordService: PasswordService,
    private readonly logger: LoggerService
  ) {}

  async seed() {
    const tenant = await this.createTestTenant();
    await this.createAdminUser(tenant.id);
    await this.createRegularUser(tenant.id);
    await this.createTenantAdmin(tenant.id);

    this.logger.log('Database seed completed successfully', 'SeedService');
  }

  private async createTestTenant() {
    const tenant = await this.seedRepository.createOrUpdateTenant(
      'Test Tenant',
      {
        id: 'test-tenant',
        name: 'Test Tenant',
        subDomain: 'test',
      }
    );

    this.logger.log(`Test tenant created: ${tenant.id}`, 'SeedService');
    return tenant;
  }

  private async createAdminUser(tenantId: string) {
    const adminPassword = await this.hashPassword('Admin@123');
    const admin = await this.seedRepository.createOrUpdateUser(
      'admin@test.com',
      tenantId,
      {
        email: 'admin@test.com',
        password: adminPassword,
        tenantId,
        role: RoleType.ADMIN,
      }
    );

    this.logger.log(`Admin user created: ${admin.id}`, 'SeedService');
    return admin;
  }

  private async createRegularUser(tenantId: string) {
    const userPassword = await this.hashPassword('User@123');
    const user = await this.seedRepository.createOrUpdateUser(
      'user@test.com',
      tenantId,
      {
        email: 'user@test.com',
        password: userPassword,
        tenantId,
        role: RoleType.USER,
      }
    );

    this.logger.log(`Regular user created: ${user.id}`, 'SeedService');
    return user;
  }

  private async createTenantAdmin(tenantId: string) {
    const tenantAdminPassword = await this.hashPassword('TenantAdmin@123');
    const tenantAdmin = await this.seedRepository.createOrUpdateUser(
      'tenant.admin@test.com',
      tenantId,
      {
        email: 'tenant.admin@test.com',
        password: tenantAdminPassword,
        tenantId,
        role: RoleType.TENANT_ADMIN,
      }
    );

    this.logger.log(`Tenant admin created: ${tenantAdmin.id}`, 'SeedService');
    return tenantAdmin;
  }

  private async hashPassword(password: string) {
    return await this.passwordService.hashPassword(password);
  }
}
