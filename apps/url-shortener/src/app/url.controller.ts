import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUrlDto, UpdateUrlDto } from './dtos';
import { IUrlController } from './interfaces/url.interface';
import { UrlService } from './url.service';
import {
  UserJWT,
  UserHeaders,
  HttpResponseInterceptor,
} from '@url-shortener/shared';

@Controller('url')
@UseInterceptors(HttpResponseInterceptor)
export class UrlController implements IUrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUrl(
    @Body() createUrlDto: CreateUrlDto,
    @UserHeaders() userInfo: UserJWT
  ) {
    return await this.urlService.shortUrl(createUrlDto, userInfo);
  }

  @Put(':urlId')
  @HttpCode(HttpStatus.OK)
  async updateUrl(
    @Param('urlId') urlId: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @UserHeaders() userInfo: UserJWT
  ) {
    return await this.urlService.updateUrl(urlId, updateUrlDto, userInfo);
  }

  @Delete(':urlId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUrl(
    @Param('urlId') urlId: string,
    @UserHeaders() userInfo: UserJWT
  ) {
    return await this.urlService.softDelete(urlId, userInfo);
  }

  @Get(':shortCode')
  async getOriginalUrl(@Param('shortCode') shortCode: string) {
    return await this.urlService.getOriginalUrl(shortCode);
  }

  @Get('info/:shortCode')
  async getUrlInfo(
    @Param('shortCode') shortCode: string,
    @UserHeaders() userInfo: UserJWT
  ) {
    return await this.urlService.getUrlInfo(shortCode, userInfo);
  }

  @Get('user/all')
  async getUserUrls(@UserHeaders() userInfo: UserJWT) {
    return await this.urlService.getUserUrls(userInfo);
  }

  @Post('add-user-id/:urlId')
  @HttpCode(HttpStatus.OK)
  async addUserId(
    @Param('urlId') urlId: string,
    @UserHeaders() userInfo: UserJWT
  ) {
    return await this.urlService.addUserId(urlId, userInfo);
  }

  @Get('count-access/:shortCode')
  async incrementClickCount(@Param('shortCode') shortCode: string) {
    return await this.urlService.incrementClickCount(shortCode);
  }
}
