import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { LoggerService } from '@url-shortener/logger';
import { LoginDto } from './dtos';
import { PasswordService } from '../utils/password.service';
import { RoleType } from '@database/iam';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { createMockLoggerService } from '../../../../jest.setup';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: AuthRepository;
  let passwordService: PasswordService;
  let loggerService: LoggerService;

  const mockAuthRepository = {
    findUserByEmailAndTenant: jest.fn(),
    findUserById: jest.fn(),
  };

  const mockPasswordService = {
    verifyPassword: jest.fn(),
  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
    tenantId: 'tenant-123',
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashed_password',
    role: RoleType.USER,
    tenantId: 'tenant-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
        createMockLoggerService(),
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get<AuthRepository>(AuthRepository);
    passwordService = module.get<PasswordService>(PasswordService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  describe('login', () => {
    describe('successful login', () => {
      beforeEach(() => {
        mockAuthRepository.findUserByEmailAndTenant.mockResolvedValue(mockUser);
        mockPasswordService.verifyPassword.mockResolvedValue(true);
      });

      it('should successfully authenticate user and return token', async () => {
        const result = await service.login(mockLoginDto);

        expect(result.access_token).toEqual(
          expect.objectContaining({
            sub: mockUser.id,
            email: mockUser.email,
            role: mockUser.role,
            tenantId: mockUser.tenantId,
          })
        );
      });

      it('should include expiration time in token', async () => {
        const result = await service.login(mockLoginDto);
        const now = Math.floor(Date.now() / 1000);
        const oneDay = 60 * 60 * 24;

        expect(result.access_token.exp).toBeGreaterThanOrEqual(
          now + oneDay - 1
        );
        expect(result.access_token.exp).toBeLessThanOrEqual(now + oneDay + 1);
      });

      it('should call repository with correct parameters', async () => {
        await service.login(mockLoginDto);

        expect(
          mockAuthRepository.findUserByEmailAndTenant
        ).toHaveBeenCalledWith(mockLoginDto);
      });

      it('should verify password with correct parameters', async () => {
        await service.login(mockLoginDto);

        expect(mockPasswordService.verifyPassword).toHaveBeenCalledWith(
          mockLoginDto.password,
          mockUser.password
        );
      });
    });

    describe('failed login', () => {
      it('should throw UnauthorizedException when user is not found', async () => {
        mockAuthRepository.findUserByEmailAndTenant.mockResolvedValue(null);

        await expect(service.login(mockLoginDto)).rejects.toThrow(
          UnauthorizedException
        );
        expect(loggerService.warn).toHaveBeenCalledWith(
          `Login failed: User not found - ${mockLoginDto.email}`,
          'AuthService'
        );
      });

      it('should throw UnauthorizedException when password is invalid', async () => {
        mockAuthRepository.findUserByEmailAndTenant.mockResolvedValue(mockUser);
        mockPasswordService.verifyPassword.mockResolvedValue(false);

        await expect(service.login(mockLoginDto)).rejects.toThrow(
          UnauthorizedException
        );
        expect(loggerService.warn).toHaveBeenCalledWith(
          'Login failed: Invalid password',
          'AuthService'
        );
      });

      it('should propagate repository errors', async () => {
        const error = new Error('Database error');
        mockAuthRepository.findUserByEmailAndTenant.mockRejectedValue(error);

        await expect(service.login(mockLoginDto)).rejects.toThrow(error);
      });

      it('should propagate password service errors', async () => {
        mockAuthRepository.findUserByEmailAndTenant.mockResolvedValue(mockUser);
        const error = new Error('Password verification error');
        mockPasswordService.verifyPassword.mockRejectedValue(error);

        await expect(service.login(mockLoginDto)).rejects.toThrow(error);
      });
    });
  });

  describe('findUser', () => {
    it('should return user when found', async () => {
      mockAuthRepository.findUserByEmailAndTenant.mockResolvedValue(mockUser);

      const result = await service['findUser'](mockLoginDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('verifyPassword', () => {
    it('should not throw when password is valid', async () => {
      mockPasswordService.verifyPassword.mockResolvedValue(true);

      await expect(
        service['verifyPassword']('password', 'hashedPassword')
      ).resolves.not.toThrow();
    });
  });
});
