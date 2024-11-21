import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { PrismaService } from '@url-shortener/prisma-client-iam';
import { PasswordService } from '../utils/password.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, PrismaService, PasswordService],
})
export class AuthModule {}
