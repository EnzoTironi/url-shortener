import { Module } from '@nestjs/common';
import { PasswordService } from '../utils/password.service';
import { PrismaService } from '@url-shortener/prisma-iam';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, UserRepository, PasswordService, PrismaService],
})
export class UserModule {}
