import { AuthRepository } from './auth.repository';
import { IAuthService } from './interfaces/auth-service.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoggerService } from '@url-shortener/logger';
import { LoginDto } from './dtos/login.dto';
import { PasswordService } from '../utils/password.service';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordService: PasswordService,
    private readonly logger: LoggerService
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.findUser(loginDto);
    await this.verifyPassword(loginDto.password, user.password);
    return this.generateToken(user);
  }

  private async findUser(loginDto: LoginDto) {
    const user = await this.authRepository.findUserByEmailAndTenant(loginDto);
    const isDeleted = user?.deletedAt !== null;
    if (!user || isDeleted) {
      this.logger.warn(
        `Login failed: User not found - ${loginDto.email}`,
        'AuthService'
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private async verifyPassword(inputPassword: string, storedPassword: string) {
    const isPasswordValid = await this.passwordService.verifyPassword(
      inputPassword,
      storedPassword
    );
    if (!isPasswordValid) {
      this.logger.warn('Login failed: Invalid password', 'AuthService');
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  private generateToken(user: any) {
    return {
      access_token: {
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
      },
    };
  }
}
