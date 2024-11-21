import { Test, TestingModule } from '@nestjs/testing';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { HttpStatus } from '@nestjs/common';
import { CreateTenantDto, UpdateTenantDto } from './dtos';

describe('TenantController', () => {
  let controller: TenantController;
  let service: TenantService;

  const mockTenantResponse = {
    id: 'test-tenant-id',
    name: 'Test Tenant',
    subDomain: 'test',
  };

  const mockUserInfo = {
    userId: 'test-user-id',
    tenantId: 'test-tenant-id',
    role: 'ADMIN',
    userHost: 'test.domain.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantController],
      providers: [
        {
          provide: TenantService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockTenantResponse),
            update: jest.fn().mockResolvedValue(mockTenantResponse),
            softDelete: jest.fn().mockResolvedValue(mockTenantResponse),
          },
        },
      ],
    }).compile();

    controller = module.get<TenantController>(TenantController);
    service = module.get<TenantService>(TenantService);
  });

  describe('create', () => {
    it('should create a new tenant', async () => {
      const createTenantDto: CreateTenantDto = {
        name: 'Test Tenant',
        subDomain: 'test',
      };

      const result = await controller.create(createTenantDto, mockUserInfo);

      expect(result).toEqual(mockTenantResponse);
    });
  });

  describe('update', () => {
    it('should update a tenant', async () => {
      const tenantId = 'test-tenant-id';
      const updateTenantDto: UpdateTenantDto = { name: 'Updated Tenant' };

      const result = await controller.update(
        tenantId,
        updateTenantDto,
        mockUserInfo
      );

      expect(result).toEqual(mockTenantResponse);
    });
  });

  describe('remove', () => {
    it('should soft delete a tenant', async () => {
      const tenantId = 'test-tenant-id';

      const result = await controller.softDelete(tenantId, mockUserInfo);

      expect(result).toEqual(mockTenantResponse);
    });
  });
});
