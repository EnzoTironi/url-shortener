import { Injectable } from '@nestjs/common';
import { PrismaService, User } from '@url-shortener/prisma-client-iam';
import { LoginDto } from './dtos';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmailAndTenant(loginDto: LoginDto): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email_tenantId: {
          email: loginDto.email,
          tenantId: loginDto.tenantId,
        },
      },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
