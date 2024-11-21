import { CreateTenantDto, UpdateTenantDto } from './dtos';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserJWT } from '@url-shortener/shared';

describe('TenantController', () => {
  let controller: TenantController;
  let service: TenantService;

  const mockTenantResponse = {
    id: 'test-tenant-id',
    name: 'Test Tenant',
    subDomain: 'test',
  };

  enum MockRoleType {
    USER = 'USER',
    ADMIN = 'ADMIN',
    TENANT_ADMIN = 'TENANT_ADMIN',
  }

  const mockUserInfo: UserJWT = {
    userId: 'test-user-id',
    tenantId: 'test-tenant-id',
    userRoles: MockRoleType.ADMIN,
    userHost: 'test-user-host',
  };

  const mockTenantService = {
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantController],
      providers: [
        {
          provide: TenantService,
          useValue: mockTenantService,
        },
      ],
    }).compile();

    controller = module.get<TenantController>(TenantController);
    service = module.get<TenantService>(TenantService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const createTenantDto: CreateTenantDto = {
      name: 'Test Tenant',
      subDomain: 'test',
    };

    it('should create a new tenant', async () => {
      mockTenantService.create.mockResolvedValue(mockTenantResponse);

      const result = await controller.create(createTenantDto, mockUserInfo);

      expect(result).toEqual(mockTenantResponse);
      expect(service.create).toHaveBeenCalledWith(
        createTenantDto,
        mockUserInfo
      );
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should pass through any errors from the service', async () => {
      const error = new Error('Creation failed');
      mockTenantService.create.mockRejectedValue(error);

      await expect(
        controller.create(createTenantDto, mockUserInfo)
      ).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    const tenantId = 'test-tenant-id';
    const updateTenantDto: UpdateTenantDto = {
      name: 'Updated Test Tenant',
    };

    it('should update an existing tenant', async () => {
      const updatedTenant = {
        ...mockTenantResponse,
        name: updateTenantDto.name,
      };
      mockTenantService.update.mockResolvedValue(updatedTenant);

      const result = await controller.update(
        tenantId,
        updateTenantDto,
        mockUserInfo
      );

      expect(result).toEqual(updatedTenant);
      expect(service.update).toHaveBeenCalledWith(
        tenantId,
        updateTenantDto,
        mockUserInfo
      );
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it('should pass through any errors from the service', async () => {
      const error = new Error('Update failed');
      mockTenantService.update.mockRejectedValue(error);

      await expect(
        controller.update(tenantId, updateTenantDto, mockUserInfo)
      ).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    const tenantId = 'test-tenant-id';

    it('should soft delete a tenant', async () => {
      mockTenantService.softDelete.mockResolvedValue(mockTenantResponse);

      const result = await controller.remove(tenantId, mockUserInfo);

      expect(result).toEqual(mockTenantResponse);
      expect(service.softDelete).toHaveBeenCalledWith(tenantId, mockUserInfo);
      expect(service.softDelete).toHaveBeenCalledTimes(1);
    });

    it('should pass through any errors from the service', async () => {
      const error = new Error('Delete failed');
      mockTenantService.softDelete.mockRejectedValue(error);

      await expect(controller.remove(tenantId, mockUserInfo)).rejects.toThrow(
        error
      );
    });
  });
});
