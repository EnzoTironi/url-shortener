import { jest } from '@jest/globals';

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

// Mock PrismaService
jest.mock('@url-shortener/prisma-client-url', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({
    url: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

// Mock LoggerService
jest.mock('@url-shortener/shared', () => ({
  LoggerService: jest.fn().mockImplementation(() => ({
    setContext: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
}));

jest.mock('@database/iam', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    iam: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

beforeEach(() => {
  jest.clearAllMocks();
});
