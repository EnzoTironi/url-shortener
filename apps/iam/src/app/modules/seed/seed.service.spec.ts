import { LoggerService } from '@url-shortener/logger';
import { PasswordService } from '../utils/password.service';
import { RoleType } from '@url-shortener/prisma-client-iam';
import { SeedRepository } from './seed.repository';
import { SeedService } from './seed.service';
import { Test, TestingModule } from '@nestjs/testing';

// Mock the actual RoleType from prisma client
jest.mock('@url-shortener/prisma-client-iam', () => ({
  RoleType: {
    USER: 'USER',
    ADMIN: 'ADMIN',
    TENANT_ADMIN: 'TENANT_ADMIN',
  },
}));

describe('SeedService', () => {
  let service: SeedService;
  let seedRepository: SeedRepository;
  let passwordService: PasswordService;
  let loggerService: LoggerService;

  const mockSeedRepository = {
    createOrUpdateTenant: jest.fn(),
    createOrUpdateUser: jest.fn(),
  };

  const mockPasswordService = {
    hashPassword: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };

  const mockTenant = {
    id: 'test-tenant',
    name: 'Test Tenant',
    subDomain: 'test',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockHashedPassword = 'hashed_password_123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: SeedRepository,
          useValue: mockSeedRepository,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
    seedRepository = module.get<SeedRepository>(SeedRepository);
    passwordService = module.get<PasswordService>(PasswordService);
    loggerService = module.get<LoggerService>(LoggerService);

    jest.clearAllMocks();

    mockPasswordService.hashPassword.mockResolvedValue(mockHashedPassword);
    mockSeedRepository.createOrUpdateTenant.mockResolvedValue(mockTenant);
  });

  describe('seed', () => {
    const mockUsers = {
      admin: {
        id: 'admin-id',
        email: 'admin@test.com',
        password: mockHashedPassword,
        role: RoleType.ADMIN,
        tenantId: mockTenant.id,
      },
      user: {
        id: 'user-id',
        email: 'user@test.com',
        password: mockHashedPassword,
        role: RoleType.USER,
        tenantId: mockTenant.id,
      },
      tenantAdmin: {
        id: 'tenant-admin-id',
        email: 'tenant.admin@test.com',
        password: mockHashedPassword,
        role: RoleType.TENANT_ADMIN,
        tenantId: mockTenant.id,
      },
    };

    beforeEach(() => {
      mockSeedRepository.createOrUpdateUser
        .mockResolvedValueOnce(mockUsers.admin)
        .mockResolvedValueOnce(mockUsers.user)
        .mockResolvedValueOnce(mockUsers.tenantAdmin);
    });

    it('should complete the seeding process successfully', async () => {
      await service.seed();

      expect(mockSeedRepository.createOrUpdateTenant).toHaveBeenCalledTimes(1);
      expect(mockSeedRepository.createOrUpdateUser).toHaveBeenCalledTimes(3);
      expect(mockPasswordService.hashPassword).toHaveBeenCalledTimes(3);

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        'Database seed completed successfully',
        'SeedService'
      );
    });

    it('should create tenant with correct data', async () => {
      await service.seed();

      expect(mockSeedRepository.createOrUpdateTenant).toHaveBeenCalledWith(
        'Test Tenant',
        {
          id: 'test-tenant',
          name: 'Test Tenant',
          subDomain: 'test',
        }
      );
    });

    it('should create admin user with correct data', async () => {
      await service.seed();

      expect(mockSeedRepository.createOrUpdateUser).toHaveBeenCalledWith(
        'admin@test.com',
        mockTenant.id,
        {
          email: 'admin@test.com',
          password: mockHashedPassword,
          tenantId: mockTenant.id,
          role: RoleType.ADMIN,
        }
      );
    });

    it('should create regular user with correct data', async () => {
      await service.seed();

      expect(mockSeedRepository.createOrUpdateUser).toHaveBeenCalledWith(
        'user@test.com',
        mockTenant.id,
        {
          email: 'user@test.com',
          password: mockHashedPassword,
          tenantId: mockTenant.id,
          role: RoleType.USER,
        }
      );
    });

    it('should create tenant admin with correct data', async () => {
      await service.seed();

      expect(mockSeedRepository.createOrUpdateUser).toHaveBeenCalledWith(
        'tenant.admin@test.com',
        mockTenant.id,
        {
          email: 'tenant.admin@test.com',
          password: mockHashedPassword,
          tenantId: mockTenant.id,
          role: RoleType.TENANT_ADMIN,
        }
      );
    });

    it('should hash passwords before creating users', async () => {
      await service.seed();

      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(
        'Admin@123'
      );
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith('User@123');
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(
        'TenantAdmin@123'
      );
    });
    describe('logging', () => {
      it('should log tenant creation', async () => {
        await service.seed();

        expect(mockLoggerService.log).toHaveBeenCalledWith(
          `Test tenant created: ${mockTenant.id}`,
          'SeedService'
        );
      });

      it('should log user creation', async () => {
        await service.seed();

        expect(mockLoggerService.log).toHaveBeenCalledWith(
          `Admin user created: ${mockUsers.admin.id}`,
          'SeedService'
        );
        expect(mockLoggerService.log).toHaveBeenCalledWith(
          `Regular user created: ${mockUsers.user.id}`,
          'SeedService'
        );
        expect(mockLoggerService.log).toHaveBeenCalledWith(
          `Tenant admin created: ${mockUsers.tenantAdmin.id}`,
          'SeedService'
        );
      });
    });
  });
});
