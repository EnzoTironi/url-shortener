import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { CreateUrlDto, UpdateUrlDto } from './dtos';
import { UserJWT } from '@url-shortener/shared';
import { url } from '@database/url';

// Mock the UserHeaders decorator
jest.mock('@url-shortener/shared', () => ({
  ...jest.requireActual('@url-shortener/shared'),
  UserHeaders:
    () => (target: any, key: string, descriptor: PropertyDescriptor) => {
      return descriptor;
    },
}));

describe('UrlController', () => {
  let controller: UrlController;
  let service: UrlService;

  const mockUserJWT: UserJWT = {
    userId: 'test-user-id',
    userToken: 'test-token',
    userRoles: 'USER',
    userHost: 'test-host',
    tenantId: 'test-tenant',
  };

  const mockUrl: url = {
    id: 'test-url-id',
    shortCode: 'abc123',
    originalUrl: 'https://example.com',
    userId: 'test-user-id',
    clickCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockUrlService = {
    shortUrl: jest.fn(),
    getOriginalUrl: jest.fn(),
    addUserId: jest.fn(),
    getUserUrls: jest.fn(),
    updateUrl: jest.fn(),
    softDelete: jest.fn(),
    incrementClickCount: jest.fn(),
    getUrlInfo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: mockUrlService,
        },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    service = module.get<UrlService>(UrlService);
  });

  describe('createUrl', () => {
    const createUrlDto: CreateUrlDto = {
      originalUrl: 'https://example.com',
    };

    it('should create a shortened URL', async () => {
      const expected = { urlId: 'test-id', shortUrl: 'http://short/abc123' };
      mockUrlService.shortUrl.mockResolvedValue(expected);

      const result = await controller.createUrl(createUrlDto, mockUserJWT);

      expect(result).toEqual(expected);
      expect(service.shortUrl).toHaveBeenCalledWith(createUrlDto, mockUserJWT);
    });
  });

  describe('getOriginalUrl', () => {
    it('should return the original URL', async () => {
      const expected = { originalUrl: 'https://example.com' };
      mockUrlService.getOriginalUrl.mockResolvedValue(expected);

      const result = await controller.getOriginalUrl('abc123');

      expect(result).toEqual(expected);
      expect(service.getOriginalUrl).toHaveBeenCalledWith('abc123');
    });
  });

  describe('addUserId', () => {
    it('should add userId to URL', async () => {
      const expected = { userId: mockUserJWT.userId };
      mockUrlService.addUserId.mockResolvedValue(expected);

      const result = await controller.addUserId('test-url-id', mockUserJWT);

      expect(result).toEqual(expected);
      expect(service.addUserId).toHaveBeenCalledWith(
        'test-url-id',
        mockUserJWT
      );
    });
  });

  describe('getUrlInfo', () => {
    it('should return URL information', async () => {
      mockUrlService.getUrlInfo.mockResolvedValue(mockUrl);

      const result = await controller.getUrlInfo('abc123', mockUserJWT);

      expect(result).toEqual(mockUrl);
      expect(service.getUrlInfo).toHaveBeenCalledWith('abc123', mockUserJWT);
    });
  });

  describe('updateUrl', () => {
    const updateDto: UpdateUrlDto = {
      url: 'https://updated-example.com',
    };

    it('should update URL', async () => {
      mockUrlService.updateUrl.mockResolvedValue(mockUrl);

      const result = await controller.updateUrl(
        'test-url-id',
        updateDto,
        mockUserJWT
      );

      expect(result).toEqual(mockUrl);
      expect(service.updateUrl).toHaveBeenCalledWith(
        'test-url-id',
        updateDto,
        mockUserJWT
      );
    });
  });

  describe('getUserUrls', () => {
    it('should return all URLs for user', async () => {
      const expected = [mockUrl];
      mockUrlService.getUserUrls.mockResolvedValue(expected);

      const result = await controller.getUserUrls(mockUserJWT);

      expect(result).toEqual(expected);
      expect(service.getUserUrls).toHaveBeenCalledWith(mockUserJWT);
    });
  });

  describe('deleteUrl', () => {
    it('should soft delete URL', async () => {
      mockUrlService.softDelete.mockResolvedValue(mockUrl);

      const result = await controller.deleteUrl('test-url-id', mockUserJWT);

      expect(result).toEqual(mockUrl);
      expect(service.softDelete).toHaveBeenCalledWith(
        'test-url-id',
        mockUserJWT
      );
    });
  });

  describe('incrementClickCount', () => {
    it('should increment access count', async () => {
      await controller.incrementClickCount('abc123');

      expect(service.incrementClickCount).toHaveBeenCalledWith('abc123');
    });
  });
});
