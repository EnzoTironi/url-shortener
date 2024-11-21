import { CreateTenantDto, UpdateTenantDto } from './dtos';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { LoggerService } from '@url-shortener/logger';
import { Tenant, RoleType } from '@database/iam';
import { TenantRepository } from './tenant.repository';
import { TenantService } from './tenant.service';
import { Test, TestingModule } from '@nestjs/testing';
import { mockUserInfo, createMockLoggerService } from '../../../../jest.setup';

describe('TenantService', () => {
  let service: TenantService;
  let repository: TenantRepository;
  let logger: LoggerService;

  const mockTenant: Tenant = {
    id: 'test-tenant-id',
    name: 'Test Tenant',
    subDomain: 'test',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockTenantRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: TenantRepository,
          useValue: mockTenantRepository,
        },
        createMockLoggerService(),
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
    repository = module.get<TenantRepository>(TenantRepository);
    logger = module.get<LoggerService>(LoggerService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const createTenantDto: CreateTenantDto = {
      name: 'Test Tenant',
      subDomain: 'test',
    };

    describe('when user is admin', () => {
      it('should create a tenant', async () => {
        mockTenantRepository.create.mockResolvedValue(mockTenant);

        const result = await service.create(createTenantDto, mockUserInfo);

        expect(result).toEqual({
          id: mockTenant.id,
          name: mockTenant.name,
          subDomain: mockTenant.subDomain,
        });
        expect(repository.create).toHaveBeenCalledWith(createTenantDto);
        expect(logger.log).toHaveBeenCalledWith(
          `Tenant created with ID: ${mockTenant.id}`,
          'TenantService'
        );
      });
    });

    describe('when user is not admin', () => {
      it('should throw ForbiddenException for tenant admin', async () => {
        const tenantAdminUser = {
          ...mockUserInfo,
          userRoles: RoleType.TENANT_ADMIN,
        };

        await expect(
          service.create(createTenantDto, tenantAdminUser)
        ).rejects.toThrow(ForbiddenException);
        expect(repository.create).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalled();
      });

      it('should throw ForbiddenException for regular user', async () => {
        const regularUser = {
          ...mockUserInfo,
          userRoles: RoleType.USER,
        };

        await expect(
          service.create(createTenantDto, regularUser)
        ).rejects.toThrow(ForbiddenException);
        expect(repository.create).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalled();
      });
    });
  });

  describe('update', () => {
    const tenantId = 'test-tenant-id';
    const updateTenantDto: UpdateTenantDto = {
      name: 'Updated Test Tenant',
    };

    beforeEach(() => {
      mockTenantRepository.findById.mockResolvedValue(mockTenant);
    });

    describe('when user is admin', () => {
      it('should update any tenant', async () => {
        const updatedTenant = { ...mockTenant, name: updateTenantDto.name };
        mockTenantRepository.update.mockResolvedValue(updatedTenant);

        const result = await service.update(
          tenantId,
          updateTenantDto,
          mockUserInfo
        );

        expect(result).toEqual({
          id: updatedTenant.id,
          name: updatedTenant.name,
          subDomain: updatedTenant.subDomain,
        });
        expect(repository.update).toHaveBeenCalledWith(tenantId, updateTenantDto);
        expect(logger.log).toHaveBeenCalledWith(
          `Tenant ${tenantId} updated successfully`,
          'TenantService'
        );
      });
    });

    describe('when user is tenant admin', () => {
      it('should update their own tenant', async () => {
        const tenantAdminUser = {
          ...mockUserInfo,
          userRoles: RoleType.TENANT_ADMIN,
          tenantId: mockTenant.id,
        };
        const updatedTenant = { ...mockTenant, name: updateTenantDto.name };
        mockTenantRepository.update.mockResolvedValue(updatedTenant);

        const result = await service.update(
          tenantId,
          updateTenantDto,
          tenantAdminUser
        );

        expect(result).toEqual({
          id: updatedTenant.id,
          name: updatedTenant.name,
          subDomain: updatedTenant.subDomain,
        });
        expect(repository.update).toHaveBeenCalledWith(tenantId, updateTenantDto);
      });

      it('should not update different tenant', async () => {
        const differentTenantAdmin = {
          ...mockUserInfo,
          userRoles: RoleType.TENANT_ADMIN,
          tenantId: 'different-tenant-id',
        };

        await expect(
          service.update(tenantId, updateTenantDto, differentTenantAdmin)
        ).rejects.toThrow(ForbiddenException);
        expect(repository.update).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalled();
      });
    });

    describe('error cases', () => {
      it('should throw NotFoundException when tenant does not exist', async () => {
        mockTenantRepository.findById.mockResolvedValue(null);

        await expect(
          service.update(tenantId, updateTenantDto, mockUserInfo)
        ).rejects.toThrow(NotFoundException);
        expect(repository.update).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalled();
      });

      it('should throw NotFoundException when tenant is deleted', async () => {
        const deletedTenant = { ...mockTenant, deletedAt: new Date() };
        mockTenantRepository.findById.mockResolvedValue(deletedTenant);

        await expect(
          service.update(tenantId, updateTenantDto, mockUserInfo)
        ).rejects.toThrow(NotFoundException);
        expect(repository.update).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalled();
      });
    });
  });

  describe('softDelete', () => {
    const tenantId = 'test-tenant-id';

    beforeEach(() => {
      mockTenantRepository.findById.mockResolvedValue(mockTenant);
    });

    describe('when user is admin', () => {
      it('should delete any tenant', async () => {
        const deletedTenant = { ...mockTenant, deletedAt: new Date() };
        mockTenantRepository.softDelete.mockResolvedValue(deletedTenant);

        const result = await service.softDelete(tenantId, mockUserInfo);

        expect(result).toEqual({
          id: deletedTenant.id,
          name: deletedTenant.name,
          subDomain: deletedTenant.subDomain,
        });
        expect(repository.softDelete).toHaveBeenCalledWith(tenantId);
        expect(logger.log).toHaveBeenCalledWith(
          `Tenant ${tenantId} soft deleted successfully`,
          'TenantService'
        );
      });
    });

    describe('when user is tenant admin', () => {
      it('should delete their own tenant', async () => {
        const tenantAdminUser = {
          ...mockUserInfo,
          userRoles: RoleType.TENANT_ADMIN,
          tenantId: mockTenant.id,
        };
        const deletedTenant = { ...mockTenant, deletedAt: new Date() };
        mockTenantRepository.softDelete.mockResolvedValue(deletedTenant);

        const result = await service.softDelete(tenantId, tenantAdminUser);

        expect(result).toEqual({
          id: deletedTenant.id,
          name: deletedTenant.name,
          subDomain: deletedTenant.subDomain,
        });
        expect(repository.softDelete).toHaveBeenCalledWith(tenantId);
      });

      it('should not delete different tenant', async () => {
        const differentTenantAdmin = {
          ...mockUserInfo,
          userRoles: RoleType.TENANT_ADMIN,
          tenantId: 'different-tenant-id',
        };

        await expect(
          service.softDelete(tenantId, differentTenantAdmin)
        ).rejects.toThrow(ForbiddenException);
        expect(repository.softDelete).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalled();
      });
    });

    describe('error cases', () => {
      it('should throw NotFoundException when tenant does not exist', async () => {
        mockTenantRepository.findById.mockResolvedValue(null);

        await expect(service.softDelete(tenantId, mockUserInfo)).rejects.toThrow(
          NotFoundException
        );
        expect(repository.softDelete).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalled();
      });

      it('should throw NotFoundException when tenant is already deleted', async () => {
        const deletedTenant = { ...mockTenant, deletedAt: new Date() };
        mockTenantRepository.findById.mockResolvedValue(deletedTenant);

        await expect(service.softDelete(tenantId, mockUserInfo)).rejects.toThrow(
          NotFoundException
        );
        expect(repository.softDelete).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalled();
      });
    });
  });
});
