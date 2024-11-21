import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { CreateTenantDto, UpdateTenantDto } from './dtos';
import { ITenantController } from './interfaces/tenant-controller.interface';
import { TenantService } from './tenant.service';
import {
  UserHeaders,
  UserJWT,
  HttpResponseInterceptor,
} from '@url-shortener/shared';

@Controller('tenant')
@UseInterceptors(HttpResponseInterceptor)
export class TenantController implements ITenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTenantDto: CreateTenantDto,
    @UserHeaders() userInfo: UserJWT
  ) {
    return await this.tenantService.create(createTenantDto, userInfo);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @UserHeaders() userInfo: UserJWT
  ) {
    return await this.tenantService.update(id, updateTenantDto, userInfo);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(@Param('id') id: string, @UserHeaders() userInfo: UserJWT) {
    return await this.tenantService.softDelete(id, userInfo);
  }
}
