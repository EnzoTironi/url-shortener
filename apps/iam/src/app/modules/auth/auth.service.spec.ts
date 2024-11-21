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
    deletedAt: null,
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

    jest.clearAllMocks();
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
        expect(loggerService.warn).not.toHaveBeenCalled();
      });

      it('should include expiration time in token', async () => {
        const result = await service.login(mockLoginDto);
        const now = Math.floor(Date.now() / 1000);
        const oneDay = 60 * 60 * 24;

        expect(result.access_token.exp).toBeGreaterThanOrEqual(now + oneDay - 1);
        expect(result.access_token.exp).toBeLessThanOrEqual(now + oneDay + 1);
      });

      it('should call repository with correct parameters', async () => {
        await service.login(mockLoginDto);

        expect(mockAuthRepository.findUserByEmailAndTenant).toHaveBeenCalledWith(
          mockLoginDto
        );
        expect(mockAuthRepository.findUserByEmailAndTenant).toHaveBeenCalledTimes(1);
      });

      it('should verify password with correct parameters', async () => {
        await service.login(mockLoginDto);

        expect(mockPasswordService.verifyPassword).toHaveBeenCalledWith(
          mockLoginDto.password,
          mockUser.password
        );
        expect(mockPasswordService.verifyPassword).toHaveBeenCalledTimes(1);
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
        expect(mockPasswordService.verifyPassword).not.toHaveBeenCalled();
      });

      it('should throw UnauthorizedException when user is deleted', async () => {
        const deletedUser = { ...mockUser, deletedAt: new Date() };
        mockAuthRepository.findUserByEmailAndTenant.mockResolvedValue(deletedUser);

        await expect(service.login(mockLoginDto)).rejects.toThrow(
          UnauthorizedException
        );
        expect(loggerService.warn).toHaveBeenCalledWith(
          `Login failed: User not found - ${mockLoginDto.email}`,
          'AuthService'
        );
        expect(mockPasswordService.verifyPassword).not.toHaveBeenCalled();
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
        expect(mockPasswordService.verifyPassword).not.toHaveBeenCalled();
      });

      it('should propagate password service errors', async () => {
        mockAuthRepository.findUserByEmailAndTenant.mockResolvedValue(mockUser);
        const error = new Error('Password verification error');
        mockPasswordService.verifyPassword.mockRejectedValue(error);

        await expect(service.login(mockLoginDto)).rejects.toThrow(error);
      });
    });
  });

  describe('generateToken', () => {
    it('should generate token with correct user information', async () => {
      const result = service['generateToken'](mockUser);

      expect(result.access_token).toEqual(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          tenantId: mockUser.tenantId,
        })
      );
    });

    it('should set correct expiration time', async () => {
      const result = service['generateToken'](mockUser);
      const now = Math.floor(Date.now() / 1000);
      const oneDay = 60 * 60 * 24;

      expect(result.access_token.exp).toBeGreaterThanOrEqual(now + oneDay - 1);
      expect(result.access_token.exp).toBeLessThanOrEqual(now + oneDay + 1);
    });
  });
});
