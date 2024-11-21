import { Body, Controller, Get, Post, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos';
import { RoleType } from '@url-shortener/prisma-client-iam';
import { IAuthController } from './interfaces/auth-controller.interface';
import { UserJWT } from '@url-shortener/shared';

@Controller('auth')
export class AuthController implements IAuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Get('claims')
  getClaims(@Headers() headers: Record<string, string>) {
    const user: UserJWT = {
      userId: headers['x-user-id'] || '',
      userRoles: (headers['x-user-roles'] as RoleType) || RoleType.USER,
      userHost: headers['host'] || '',
      tenantId: headers['x-tenant-id'] || '',
    };
    return user;
  }
}
