import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { PasswordService } from '../utils/password.service';
import { LoggerService } from '@url-shortener/logger';
import { CreateUserDto, UpdateUserDto, UpdateRoleDto } from './dtos';
import { UserJWT } from '@url-shortener/shared';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { User, RoleType } from '@database/iam';
import {
  createMockLoggerService,
} from '../../../../jest.setup';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;
  let passwordService: PasswordService;
  let logger: LoggerService;

  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    password: 'hashed_password',
    role: RoleType.USER,
    tenantId: 'test-tenant-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockUserInfo: UserJWT = {
    userId: 'test-user-id',
    userHost: 'test-user-host',
    tenantId: 'test-tenant-id',
    userRoles: RoleType.ADMIN,
  };

  const mockUserRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    updateRole: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockPasswordService = {
    hashPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
        createMockLoggerService(),
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
    passwordService = module.get<PasswordService>(PasswordService);
    logger = module.get<LoggerService>(LoggerService);
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      tenantId: 'test-tenant-id',
    };

    beforeEach(() => {
      mockPasswordService.hashPassword.mockResolvedValue('hashed_password');
    });

    it('should create a user with hashed password', async () => {
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        tenantId: mockUser.tenantId,
      });
      expect(passwordService.hashPassword).toHaveBeenCalledWith(
        createUserDto.password
      );
      expect(repository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashed_password',
      });
      expect(logger.log).toHaveBeenCalledWith(
        `User created with ID: ${mockUser.id}`,
        'UserService'
      );
    });

    it('should pass through any errors from password hashing', async () => {
      const error = new Error('Hashing failed');
      mockPasswordService.hashPassword.mockRejectedValue(error);

      await expect(service.create(createUserDto)).rejects.toThrow(error);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const userId = 'test-user-id';
    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
    };

    beforeEach(() => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
    });

    it('should update a user when authorized', async () => {
      const updatedUser = { ...mockUser, email: updateUserDto.email };
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto, mockUserInfo);

      expect(result).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        tenantId: updatedUser.tenantId,
      });
      expect(repository.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(logger.log).toHaveBeenCalledWith(
        `User ${userId} updated successfully`,
        'UserService'
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        service.update(userId, updateUserDto, mockUserInfo)
      ).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user does not have access', async () => {
      const differentUser = { ...mockUserInfo, userId: 'different-user-id' };

      await expect(
        service.update(userId, updateUserDto, differentUser)
      ).rejects.toThrow(ForbiddenException);
      expect(repository.update).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('updateRole', () => {
    const updateRoleDto: UpdateRoleDto = {
      role: RoleType.TENANT_ADMIN,
    };

    beforeEach(() => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
    });

    it('should update role when user is admin', async () => {
      const updatedUser = { ...mockUser, role: updateRoleDto.role };
      mockUserRepository.updateRole.mockResolvedValue(updatedUser);

      const result = await service.updateRole(updateRoleDto, mockUserInfo);

      expect(result).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        tenantId: updatedUser.tenantId,
      });
      expect(repository.updateRole).toHaveBeenCalledWith(
        mockUserInfo.userId,
        updateRoleDto.role
      );
      expect(logger.log).toHaveBeenCalledWith(
        `Role updated for user ${mockUserInfo.userId}`,
        'UserService'
      );
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      const nonAdminUser = { ...mockUserInfo, userRoles: RoleType.USER };

      await expect(
        service.updateRole(updateRoleDto, nonAdminUser)
      ).rejects.toThrow(ForbiddenException);
      expect(repository.updateRole).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    const userId = 'test-user-id';

    beforeEach(() => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
    });

    it('should soft delete when user is admin', async () => {
      const deletedUser = { ...mockUser, deletedAt: new Date() };
      mockUserRepository.softDelete.mockResolvedValue(deletedUser);

      const result = await service.softDelete(userId, mockUserInfo);

      expect(result).toEqual(deletedUser);
      expect(repository.softDelete).toHaveBeenCalledWith(userId);
      expect(logger.log).toHaveBeenCalledWith(
        `User ${userId} soft deleted successfully`,
        'UserService'
      );
    });

    it('should allow self-deletion', async () => {
      const regularUser = { ...mockUserInfo, userRoles: RoleType.USER };
      const deletedUser = { ...mockUser, deletedAt: new Date() };
      mockUserRepository.softDelete.mockResolvedValue(deletedUser);

      const result = await service.softDelete(userId, regularUser);

      expect(result).toEqual(deletedUser);
      expect(repository.softDelete).toHaveBeenCalledWith(userId);
    });

    it('should throw ForbiddenException when non-admin tries to delete another user', async () => {
      const regularUser = {
        ...mockUserInfo,
        userId: 'different-user-id',
        userRoles: RoleType.USER,
      };

      await expect(service.softDelete(userId, regularUser)).rejects.toThrow(
        ForbiddenException
      );
      expect(repository.softDelete).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
    });
  });
});
