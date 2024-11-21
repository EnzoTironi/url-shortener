import { CreateUrlDto, UpdateUrlDto } from '../dtos';
import { UserJWT } from '@url-shortener/shared';
import { url } from '@database/url';

type UrlResponse = Pick<url, 'id' | 'shortCode' | 'originalUrl'>;
type UrlCreationResponse = { urlId: string; shortUrl: string };
type OriginalUrlResponse = { originalUrl: string };
type UserIdResponse = { userId: string };

export interface IUrlService {
  shortUrl(
    createUrlDto: CreateUrlDto,
    userInfo?: UserJWT
  ): Promise<UrlCreationResponse>;
  getOriginalUrl(shortCode: string): Promise<OriginalUrlResponse>;
  addUserId(urlId: string, userInfo: UserJWT): Promise<UserIdResponse>;
  getUserUrls(userInfo: UserJWT): Promise<UrlResponse[]>;
  softDelete(urlId: string, userInfo: UserJWT): Promise<UrlResponse>;
  updateUrl(
    urlId: string,
    updateUrlDto: UpdateUrlDto,
    userInfo: UserJWT
  ): Promise<UrlResponse>;
  countAccess(shortCode: string): Promise<void>;
  getUrlInfo(shortCode: string, userInfo: UserJWT): Promise<url>;
}
