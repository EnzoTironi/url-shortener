import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { PasswordService } from '../utils/password.service';
import { PrismaService } from '@url-shortener/prisma-iam';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, PrismaService, PasswordService],
})
export class AuthModule {}
