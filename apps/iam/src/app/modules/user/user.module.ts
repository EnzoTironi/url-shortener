import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { LoggerModule } from '@url-shortener/logger';

@Module({
  imports: [LoggerModule.forFeature('User-Service')],
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
