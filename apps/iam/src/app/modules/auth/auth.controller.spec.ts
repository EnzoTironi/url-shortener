import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos';
import { Test, TestingModule } from '@nestjs/testing';
import { UserJWT } from '@url-shortener/shared';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
    tenantId: 'tenant-123',
  };

  const mockLoginResponse = {
    access_token: {
      sub: 'user-123',
      email: 'test@example.com',
      role: 'USER',
      tenantId: 'tenant-123',
      exp: 1234567890,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call authService.login with correct parameters', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(mockLoginDto);

      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should propagate errors from authService.login', async () => {
      const error = new Error('Login failed');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(mockLoginDto)).rejects.toThrow(error);
    });
  });

  describe('getClaims', () => {
    it('should return user claims from headers', () => {
      const mockHeaders = {
        'x-user-id': 'user-123',
        'x-user-roles': 'ADMIN',
        host: 'example.com',
        'x-tenant-id': 'tenant-123',
      };

      const expectedClaims: UserJWT = {
        userId: 'user-123',
        userRoles: 'ADMIN',
        userHost: 'example.com',
        tenantId: 'tenant-123',
      };

      const result = controller.getClaims(mockHeaders);

      expect(result).toEqual(expectedClaims);
    });
  });
});
