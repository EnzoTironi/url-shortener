import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UpdateRoleDto } from './dtos';
import { UserJWT } from '../auth/dtos';
import { RoleType } from '@database/iam';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserResponse = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: RoleType.USER,
    tenantId: 'test-tenant-id',
  };

  const mockUserInfo: UserJWT = {
    userId: 'test-user-id',
    userHost: 'test-user-host',
    tenantId: 'test-tenant-id',
    userRoles: RoleType.ADMIN,
  };

  const mockUserService = {
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    updateRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      tenantId: 'test-tenant-id',
    };

    it('should create a new user', async () => {
      mockUserService.create.mockResolvedValue(mockUserResponse);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUserResponse);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should pass through any errors from the service', async () => {
      const error = new Error('Creation failed');
      mockUserService.create.mockRejectedValue(error);

      await expect(controller.create(createUserDto)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    const userId = 'test-user-id';
    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
    };

    it('should update an existing user', async () => {
      const updatedUser = { ...mockUserResponse, email: updateUserDto.email };
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(
        userId,
        updateUserDto,
        mockUserInfo
      );

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
        mockUserInfo
      );
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it('should pass through any errors from the service', async () => {
      const error = new Error('Update failed');
      mockUserService.update.mockRejectedValue(error);

      await expect(
        controller.update(userId, updateUserDto, mockUserInfo)
      ).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    const userId = 'test-user-id';

    it('should soft delete a user', async () => {
      const deletedUser = { ...mockUserResponse, deletedAt: new Date() };
      mockUserService.softDelete.mockResolvedValue(deletedUser);

      const result = await controller.remove(userId, mockUserInfo);

      expect(result).toEqual(deletedUser);
      expect(service.softDelete).toHaveBeenCalledWith(userId, mockUserInfo);
      expect(service.softDelete).toHaveBeenCalledTimes(1);
    });

    it('should pass through any errors from the service', async () => {
      const error = new Error('Delete failed');
      mockUserService.softDelete.mockRejectedValue(error);

      await expect(controller.remove(userId, mockUserInfo)).rejects.toThrow(
        error
      );
    });
  });

  describe('updateRole', () => {
    const updateRoleDto: UpdateRoleDto = {
      role: RoleType.TENANT_ADMIN,
    };

    it('should update user role', async () => {
      const updatedUser = { ...mockUserResponse, role: updateRoleDto.role };
      mockUserService.updateRole.mockResolvedValue(updatedUser);

      const result = await controller.updateRole(updateRoleDto, mockUserInfo);

      expect(result).toEqual(updatedUser);
      expect(service.updateRole).toHaveBeenCalledWith(
        updateRoleDto,
        mockUserInfo
      );
      expect(service.updateRole).toHaveBeenCalledTimes(1);
    });

    it('should pass through any errors from the service', async () => {
      const error = new Error('Role update failed');
      mockUserService.updateRole.mockRejectedValue(error);

      await expect(
        controller.updateRole(updateRoleDto, mockUserInfo)
      ).rejects.toThrow(error);
    });
  });
});
