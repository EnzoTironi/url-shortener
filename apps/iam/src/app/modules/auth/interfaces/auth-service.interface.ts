import { LoginDto } from '../dtos/login.dto';

export interface IAuthService {
  login(loginDto: LoginDto): Promise<{
    access_token: {
      sub: string;
      email: string;
      role: string;
      tenantId: string;
      exp: number;
    };
  }>;
}
