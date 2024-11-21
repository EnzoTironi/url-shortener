import { Injectable } from '@nestjs/common';
import { PrismaService } from '@url-shortener/prisma-client-iam';
import { Tenant } from '@database/iam';
import { CreateTenantDto, UpdateTenantDto } from './dtos';

@Injectable()
export class TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTenantDto): Promise<Tenant> {
    return this.prisma.tenant.create({ data });
  }

  async findById(id: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateTenantDto): Promise<Tenant> {
    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Tenant> {
    return this.prisma.tenant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
} 