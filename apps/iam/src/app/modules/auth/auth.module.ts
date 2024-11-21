import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { LoggerModule } from '@url-shortener/shared';

@Module({
  imports: [LoggerModule.forFeature('Auth-Service')],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
})
export class AuthModule {}
