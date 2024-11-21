import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUrlDto, UpdateUrlDto } from './dtos';
import { IUrlService } from './interfaces/url.interface';
import { LoggerService } from '@url-shortener/logger';
import { ShortCodeService } from './utils/short-code.service';
import { UrlRepository } from './url.repository';
import { UserJWT } from '@url-shortener/shared';
import { url } from '@database/url';
import {
  UrlCreationResponse,
  UrlResponse,
  OriginalUrlResponse,
  UserIdResponse,
} from './interfaces/url.interface';

@Injectable()
export class UrlService implements IUrlService {
  constructor(
    private readonly urlRepository: UrlRepository,
    private readonly shortCodeService: ShortCodeService,
    private readonly logger: LoggerService
  ) {}

  async shortUrl(
    createUrlDto: CreateUrlDto,
    userInfo?: UserJWT
  ): Promise<UrlCreationResponse> {
    const shortCode = await this.generateUniqueShortCode();
    const createdUrl = await this.urlRepository.create({
      ...createUrlDto,
      shortCode,
    });

    this.logger.log(`Created URL with ID: ${createdUrl.id}`, 'UrlService');
    return {
      urlId: createdUrl.id,
      shortUrl: `${userInfo?.userHost}/url/${shortCode}`,
    };
  }

  async updateUrl(
    urlId: string,
    updateUrlDto: UpdateUrlDto,
    userInfo: UserJWT
  ): Promise<UrlResponse> {
    await this.verifyOwnership(urlId, userInfo.userId!);
    const result = await this.urlRepository.update(urlId, {
      originalUrl: updateUrlDto.url,
    });
    this.logger.log(`Updated URL with ID: ${urlId}`, 'UrlService');
    return this.formatUrlResponse(result);
  }

  async addUserId(urlId: string, userInfo: UserJWT): Promise<UserIdResponse> {
    const updatedUrl = await this.urlRepository.update(urlId, {
      userId: userInfo.userId,
    });

    this.logger.log(`Added user ID to URL with ID: ${urlId}`, 'UrlService');
    return { userId: updatedUrl.userId! };
  }

  async softDelete(urlId: string, userInfo: UserJWT): Promise<UrlResponse> {
    await this.verifyOwnership(urlId, userInfo.userId!);
    const result = await this.urlRepository.softDelete(urlId);
    this.logger.log(`Soft deleted URL with ID: ${urlId}`, 'UrlService');
    return this.formatUrlResponse(result);
  }

  async getOriginalUrl(shortCode: string): Promise<OriginalUrlResponse> {
    const url = await this.findUrlByShortCode(shortCode);
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    return { originalUrl: url.originalUrl };
  }

  async getUserUrls(userInfo: UserJWT): Promise<UrlResponse[]> {
    const urls = await this.urlRepository.findByUserId(userInfo.userId!);
    this.ensureUrlsExist(urls, `No URLs found for user ${userInfo.userId}`);
    return urls.filter((url) => !url.deletedAt).map(this.formatUrlResponse);
  }

  async getUrlInfo(shortCode: string, userInfo: UserJWT): Promise<url> {
    const url = await this.findUrlByShortCode(shortCode);
    this.ensureUserAuthorization(url, userInfo.userId!);
    return url;
  }

  async incrementClickCount(shortCode: string): Promise<void> {
    await this.urlRepository.incrementClickCount(shortCode);
    this.logger.log(
      `Incremented click count for URL with short code: ${shortCode}`,
      'UrlService'
    );
    return;
  }

  async countAccess(shortCode: string): Promise<void> {
    await this.incrementClickCount(shortCode);
  }

  // Helper Methods
  private formatUrlResponse(url: url): UrlResponse {
    return {
      id: url.id,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      clickCount: url.clickCount,
    };
  }

  private async findUrlByShortCode(shortCode: string): Promise<url> {
    return await this.urlRepository.findByShortCodeOrThrow(shortCode);
  }

  private async generateUniqueShortCode(): Promise<string> {
    let shortCode: string;
    while (true) {
      shortCode = this.shortCodeService.generateCode();
      const exists = await this.urlRepository.findByShortCode(shortCode);
      if (!exists) break;
    }
    this.logger.log(`Generated short code: ${shortCode}`, 'UrlService');
    return shortCode;
  }

  // Validation Methods
  private ensureUrlsExist(urls: url[], message: string): void {
    if (!urls || urls.length === 0) throw new NotFoundException(message);
  }

  private async verifyOwnership(urlId: string, userId: string): Promise<url> {
    const url = await this.urlRepository.findById(urlId);
    if (!url || url.deletedAt) throw new NotFoundException('URL not found!');
    this.ensureUserAuthorization(url, userId);
    return url;
  }

  private ensureUserAuthorization(url: url, userId: string): void {
    if (url.userId !== userId) {
      throw new ForbiddenException('Unauthorized action');
    }
  }
}
