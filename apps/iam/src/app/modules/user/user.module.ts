import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { PasswordService } from '../utils/password.service';
import { PrismaService } from '@url-shortener/prisma-client-iam';
@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, UserRepository, PasswordService, PrismaService],
})
export class UserModule {}
