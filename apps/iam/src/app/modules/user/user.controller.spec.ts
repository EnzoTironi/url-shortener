import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto, UpdateRoleDto } from './dtos';
import { RoleType } from '@database/iam';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserResponse = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'USER',
    tenantId: 'test-tenant-id',
  };

  const mockUserInfo = {
    userId: 'test-user-id',
    tenantId: 'test-tenant-id',
    role: 'ADMIN',
    userHost: 'test.domain.com',
  };

  const deletedUser = {
    ...mockUserResponse,
    deletedAt: new Date('2024-11-20T22:25:07.180Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockUserResponse),
            update: jest.fn().mockResolvedValue(mockUserResponse),
            softDelete: jest.fn().mockResolvedValue(deletedUser),
            updateRole: jest.fn().mockResolvedValue(mockUserResponse),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        tenantId: 'test-tenant-id',
      };

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = 'test-user-id';
      const updateUserDto = { email: 'updated@example.com' };

      const result = await controller.update(
        userId,
        updateUserDto,
        mockUserInfo
      );

      expect(result).toEqual(mockUserResponse);
    });
  });
  describe('remove', () => {
    it('should soft delete a user', async () => {
      const userId = 'test-user-id';

      const result = await controller.softDelete(userId, mockUserInfo);

      expect(result).toEqual(deletedUser);
    });
  });

  describe('updateRole', () => {
    it('should update a user role', async () => {
      const updateRoleDto: UpdateRoleDto = { role: 'ADMIN' };

      const result = await controller.updateRole(updateRoleDto, mockUserInfo);

      expect(result).toEqual(mockUserResponse);
    });
  });
});
