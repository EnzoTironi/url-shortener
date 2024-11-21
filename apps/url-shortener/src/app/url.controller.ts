import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateUrlDto, UpdateUrlDto } from './dtos';
import { UrlService } from './url.service';
import { UserJWT } from '@url-shortener/shared';
import { UserHeaders } from '@url-shortener/shared';
import { IUrlController } from './interfaces/url-controller.interface';

@Controller('url')
export class UrlController implements IUrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  async createUrl(
    @Body() createUrlDto: CreateUrlDto,
    @UserHeaders() userInfo: UserJWT
  ) {
    return await this.urlService.shortUrl(createUrlDto, userInfo);
  }

  @Post('add-user-id/:urlId')
  async addUserId(
    @Param('urlId') urlId: string,
    @UserHeaders() userInfo: UserJWT
  ) {
    return this.urlService.addUserId(urlId, userInfo);
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

  @Put(':urlId')
  async updateUrl(
    @Param('urlId') urlId: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @UserHeaders() userInfo: UserJWT
  ) {
    return await this.urlService.updateUrl(urlId, updateUrlDto, userInfo);
  }

  @Get('user/all')
  async getUserUrls(@UserHeaders() userInfo: UserJWT) {
    return await this.urlService.getUserUrls(userInfo);
  }

  @Delete(':urlId')
  async deleteUrl(
    @Param('urlId') urlId: string,
    @UserHeaders() userInfo: UserJWT
  ) {
    return await this.urlService.softDelete(urlId, userInfo);
  }

  @Get('count-access/:shortCode')
  async countAccess(@Param('shortCode') shortCode: string) {
    return await this.urlService.countAccess(shortCode);
  }
}
