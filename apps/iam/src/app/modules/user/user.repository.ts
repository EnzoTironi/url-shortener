import { CreateUserDto, UpdateUserDto } from './dtos';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@url-shortener/prisma-client-iam';
import { RoleType, User } from '@database/iam';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto & { password: string }): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateRole(id: string, role: RoleType): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async softDelete(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
