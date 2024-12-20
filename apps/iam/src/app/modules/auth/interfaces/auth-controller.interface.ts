import { LoginDto } from '../dtos';
import { UserJWT } from '@url-shortener/shared';

export interface IAuthController {
  login(loginDto: LoginDto): Promise<{
    access_token: {
      sub: string;
      email: string;
      role: string;
      tenantId: string;
      exp: number;
    };
  }>;

  getClaims(headers: Record<string, string>): UserJWT;
}
