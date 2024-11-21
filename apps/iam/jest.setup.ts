import { jest } from '@jest/globals';
import { LoggerService } from '@url-shortener/logger';
import { RoleType } from '@url-shortener/prisma-iam';

// Mock pino
jest.mock('pino', () => {
  return jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    level: 'debug',
  }));
});

jest.mock('@database/iam', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    iam: {
      findUserByEmailAndTenant: jest.fn(),
      findUserById: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
  RoleType: {
    USER: 'USER',
    ADMIN: 'ADMIN',
    TENANT_ADMIN: 'TENANT_ADMIN',
  },
}));

// Common mock for LoggerService
export const mockLoggerService = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

// Common mock for UserJWT
export const mockUserInfo = {
  userId: 'test-user-id',
  userHost: 'test-user-host',
  tenantId: 'test-tenant-id',
  userRoles: RoleType.ADMIN, // Changed from string to RoleType
};

// Helper to create mock services
export const createMockLoggerService = () => ({
  provide: LoggerService,
  useValue: mockLoggerService,
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});
