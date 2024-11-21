import { CreateUrlDto, UpdateUrlDto } from './dtos';
import { LoggerService } from '@url-shortener/logger';
import { ForbiddenException } from '@nestjs/common';
import { ShortCodeService } from './utils';
import { Test, TestingModule } from '@nestjs/testing';
import { UrlRepository } from './url.repository';
import { UrlService } from './url.service';
import { UserJWT } from '@url-shortener/shared';

describe('UrlService', () => {
  let service: UrlService;
  let repository: UrlRepository;
  let shortCodeService: ShortCodeService;
  let loggerService: LoggerService;

  const mockUrl = {
    id: 'test-id',
    shortCode: 'abc123',
    originalUrl: 'https://example.com',
    userId: 'test-user-id',
    clickCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockUserJWT: UserJWT = {
    userId: 'test-user-id',
    userToken: 'test-token',
    userRoles: 'USER',
    userHost: 'localhost:8080',
    tenantId: 'test-tenant',
  };

  const mockUrlRepository = {
    create: jest.fn(),
    findByShortCodeOrThrow: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByShortCode: jest.fn(),
    update: jest.fn(),
    updateByShortCode: jest.fn(),
    softDelete: jest.fn(),
    incrementClickCount: jest.fn(),
  };

  const mockShortCodeService = {
    generateCode: jest.fn().mockReturnValue('abc123'),
  };

  const mockLoggerService = {
    setContext: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: UrlRepository,
          useValue: mockUrlRepository,
        },
        {
          provide: ShortCodeService,
          useValue: mockShortCodeService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    repository = module.get<UrlRepository>(UrlRepository);
    shortCodeService = module.get<ShortCodeService>(ShortCodeService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  describe('shortUrl', () => {
    const createUrlDto: CreateUrlDto = {
      originalUrl: 'https://example.com',
    };

    it('should create a shortened URL with user info', async () => {
      const createdUrl = {
        ...mockUrl,
        userId: mockUserJWT.userId,
      };
      mockUrlRepository.create.mockResolvedValue(createdUrl);
      mockShortCodeService.generateCode.mockReturnValue('abc123');

      const result = await service.shortUrl(createUrlDto, mockUserJWT);

      expect(result).toEqual({
        urlId: createdUrl.id,
        shortUrl: `${mockUserJWT.userHost}/url/${createdUrl.shortCode}`,
      });
      expect(loggerService.log).toHaveBeenCalledWith(
        `Created URL with ID: ${createdUrl.id}`,
        'UrlService'
      );
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database error');
      mockUrlRepository.create.mockRejectedValue(error);

      await expect(service.shortUrl(createUrlDto, mockUserJWT)).rejects.toThrow(
        error
      );
    });
  });

  describe('getOriginalUrl', () => {
    it('should return original URL', async () => {
      mockUrlRepository.findByShortCodeOrThrow.mockResolvedValue(mockUrl);

      const result = await service.getOriginalUrl('abc123');

      expect(result).toEqual({ originalUrl: mockUrl.originalUrl });
      expect(repository.findByShortCodeOrThrow).toHaveBeenCalledWith('abc123');
    });
  });

  describe('addUserId', () => {
    it('should add userId to URL', async () => {
      const existingUrl = { ...mockUrl, userId: null };
      mockUrlRepository.findById.mockResolvedValue(existingUrl);
      mockUrlRepository.update.mockResolvedValue({
        ...existingUrl,
        userId: mockUserJWT.userId,
      });

      const result = await service.addUserId('test-id', mockUserJWT);

      expect(result).toEqual({ userId: mockUserJWT.userId });
      expect(loggerService.log).toHaveBeenCalledWith(
        `Added user ID to URL with ID: test-id`,
        'UrlService'
      );
    });
  });

  describe('getUserUrls', () => {
    it('should return user URLs', async () => {
      mockUrlRepository.findByUserId.mockResolvedValue([mockUrl]);

      const result = await service.getUserUrls(mockUserJWT);

      expect(result).toEqual([
        {
          id: mockUrl.id,
          shortCode: mockUrl.shortCode,
          originalUrl: mockUrl.originalUrl,
          clickCount: mockUrl.clickCount,
        },
      ]);
      expect(repository.findByUserId).toHaveBeenCalledWith(mockUserJWT.userId);
    });
  });

  describe('updateUrl', () => {
    const updateDto: UpdateUrlDto = {
      url: 'https://updated-example.com',
    };

    it('should update URL', async () => {
      const updatedUrl = {
        ...mockUrl,
        originalUrl: updateDto.url,
      };
      mockUrlRepository.findById.mockResolvedValue(mockUrl);
      mockUrlRepository.update.mockResolvedValue(updatedUrl);

      const result = await service.updateUrl('test-id', updateDto, mockUserJWT);

      expect(result).toEqual({
        id: updatedUrl.id,
        shortCode: updatedUrl.shortCode,
        originalUrl: updatedUrl.originalUrl,
        clickCount: updatedUrl.clickCount,
      });
      expect(loggerService.log).toHaveBeenCalledWith(
        `Updated URL with ID: test-id`,
        'UrlService'
      );
    });

    it('should throw ForbiddenException when user does not own URL', async () => {
      mockUrlRepository.findById.mockResolvedValue({
        ...mockUrl,
        userId: 'different-user',
      });

      await expect(
        service.updateUrl('test-id', updateDto, mockUserJWT)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Update failed');
      mockUrlRepository.findById.mockResolvedValue(mockUrl);
      mockUrlRepository.update.mockRejectedValue(error);

      await expect(
        service.updateUrl('test-id', updateDto, mockUserJWT)
      ).rejects.toThrow(error);
    });
  });

  describe('softDelete', () => {
    it('should soft delete URL and log the action', async () => {
      mockUrlRepository.findById.mockResolvedValue(mockUrl);
      mockUrlRepository.softDelete.mockResolvedValue({
        ...mockUrl,
        deletedAt: new Date(),
      });

      await service.softDelete('test-id', mockUserJWT);

      expect(loggerService.log).toHaveBeenCalledWith(
        `Soft deleted URL with ID: test-id`,
        'UrlService'
      );
    });

    it('should throw ForbiddenException when user does not own URL', async () => {
      mockUrlRepository.findById.mockResolvedValue({
        ...mockUrl,
        userId: 'different-user',
      });

      await expect(service.softDelete('test-id', mockUserJWT)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('Increment CLick Count', () => {
    it('should increment access count and log the action', async () => {
      const updatedUrl = { ...mockUrl, clickCount: mockUrl.clickCount + 1 };
      mockUrlRepository.incrementClickCount.mockResolvedValue(updatedUrl);

      await service.incrementClickCount('abc123');

      expect(repository.incrementClickCount).toHaveBeenCalledWith('abc123');
      expect(loggerService.log).toHaveBeenCalledWith(
        'Incremented click count for URL with short code: abc123',
        'UrlService'
      );
    });
  });

  describe('getUrlInfo', () => {
    it('should return URL info for URL owner', async () => {
      mockUrlRepository.findByShortCodeOrThrow.mockResolvedValue(mockUrl);

      const result = await service.getUrlInfo('abc123', mockUserJWT);

      expect(result).toEqual(mockUrl);
      expect(repository.findByShortCodeOrThrow).toHaveBeenCalledWith('abc123');
    });

    it('should throw ForbiddenException for unauthorized access', async () => {
      const unauthorizedUrl = { ...mockUrl, userId: 'different-user' };
      mockUrlRepository.findByShortCodeOrThrow.mockResolvedValue(
        unauthorizedUrl
      );

      await expect(service.getUrlInfo('abc123', mockUserJWT)).rejects.toThrow(
        ForbiddenException
      );
    });
  });
});
