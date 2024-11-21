import { Injectable } from '@nestjs/common';
import { PrismaService } from '@url-shortener/prisma-client-iam';
import { RoleType, Tenant, User } from '@url-shortener/prisma-client-iam';

@Injectable()
export class SeedRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdateTenant(
    name: string,
    data: { id: string; name: string; subDomain: string }
  ): Promise<Tenant> {
    return this.prisma.tenant.upsert({
      where: { name },
      update: {},
      create: data,
    });
  }

  async createOrUpdateUser(
    email: string,
    tenantId: string,
    data: {
      email: string;
      password: string;
      tenantId: string;
      role: RoleType;
    }
  ): Promise<User> {
    return this.prisma.user.upsert({
      where: {
        email_tenantId: {
          email,
          tenantId,
        },
      },
      update: {},
      create: data,
    });
  }

  async findTenantByName(name: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({
      where: { name },
    });
  }

  async findUserByEmailAndTenant(
    email: string,
    tenantId: string
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email_tenantId: {
          email,
          tenantId,
        },
      },
    });
  }
}
